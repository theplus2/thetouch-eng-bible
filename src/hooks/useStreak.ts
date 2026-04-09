"use client";

import { useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * 연속 읽기 스트릭 계산 훅.
 * reading_log의 read_at을 기준으로 연속 일수 계산.
 */
export function useStreak() {
  const supabase = createClient();

  /** 현재 스트릭(연속 읽기 일수) 계산 */
  const calculateStreak = useCallback(async (): Promise<number> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { data, error } = await supabase
      .from("reading_log")
      .select("read_at")
      .eq("user_id", user.id)
      .order("read_at", { ascending: false }) as { data: { read_at: string }[] | null, error: any };

    if (error || !data || data.length === 0) return 0;

    // 읽은 날짜를 고유 날짜로 변환 (시간 제거)
    const uniqueDates = Array.from(
      new Set(
        data.map((log) => {
          const date = new Date(log.read_at);
          return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        })
      )
    ).sort((a, b) => {
      // 최신순 정렬
      return new Date(b).getTime() - new Date(a).getTime();
    });

    // 오늘 날짜
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

    // 오늘 또는 어제부터 시작하는 연속 일수 계산
    let streak = 0;
    const checkDate = new Date(today);

    // 오늘 읽지 않았으면 어제부터 체크
    if (uniqueDates[0] !== todayKey) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    for (const dateKey of uniqueDates) {
      const expectedKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
      if (dateKey === expectedKey) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [supabase]);

  return { calculateStreak };
}
