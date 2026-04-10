"use client";

import { useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

function toLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export interface LearningActivityResult {
  activityMap: Record<string, number>; // YYYY-MM-DD → activity count
  streak: number;
  todayRead: boolean;
}

export function useLearningActivity() {
  const supabase = createClient();

  const getActivityData = useCallback(async (weeksBack = 17): Promise<LearningActivityResult> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { activityMap: {}, streak: 0, todayRead: false };

    const since = new Date();
    since.setDate(since.getDate() - weeksBack * 7);
    since.setHours(0, 0, 0, 0);

    // 읽기 기록 + 단어 저장 기록 병렬 조회
    const [{ data: readingLogs }, { data: vocabLogs }, { data: allReadingLogs }] =
      await Promise.all([
        supabase
          .from("reading_log")
          .select("read_at")
          .eq("user_id", user.id)
          .gte("read_at", since.toISOString()) as unknown as Promise<{ data: { read_at: string }[] | null }>,
        supabase
          .from("vocabulary")
          .select("saved_at")
          .eq("user_id", user.id)
          .gte("saved_at", since.toISOString()) as unknown as Promise<{ data: { saved_at: string }[] | null }>,
        supabase
          .from("reading_log")
          .select("read_at")
          .eq("user_id", user.id)
          .order("read_at", { ascending: false }) as unknown as Promise<{ data: { read_at: string }[] | null }>,
      ]);

    // 활동 맵 구성 (로컬 시간 기준)
    const activityMap: Record<string, number> = {};
    for (const log of readingLogs ?? []) {
      const key = toLocalDateKey(new Date(log.read_at));
      activityMap[key] = (activityMap[key] ?? 0) + 1;
    }
    for (const vocab of vocabLogs ?? []) {
      const key = toLocalDateKey(new Date(vocab.saved_at));
      activityMap[key] = (activityMap[key] ?? 0) + 1;
    }

    // 스트릭 계산 (전체 읽기 기록 기준)
    let streak = 0;
    if (allReadingLogs && allReadingLogs.length > 0) {
      const uniqueDates = Array.from(
        new Set(allReadingLogs.map((log) => toLocalDateKey(new Date(log.read_at))))
      ).sort((a, b) => b.localeCompare(a));

      const today = new Date();
      const todayKey = toLocalDateKey(today);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = toLocalDateKey(yesterday);

      if (uniqueDates[0] === todayKey || uniqueDates[0] === yesterdayKey) {
        const checkDate = new Date(today);
        if (uniqueDates[0] !== todayKey) {
          checkDate.setDate(checkDate.getDate() - 1);
        }
        for (const dateKey of uniqueDates) {
          if (dateKey === toLocalDateKey(checkDate)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    const todayKey = toLocalDateKey(new Date());
    const todayRead = (activityMap[todayKey] ?? 0) > 0;

    return { activityMap, streak, todayRead };
  }, [supabase]);

  return { getActivityData };
}
