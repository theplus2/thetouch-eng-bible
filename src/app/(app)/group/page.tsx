"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TOTAL_CHAPTERS } from "@/lib/bible/constants";
import { useLearningActivity } from "@/hooks/useLearningActivity";
import LearningHeatmap from "@/components/dashboard/LearningHeatmap";
import StreakBadge from "@/components/dashboard/StreakBadge";

interface MemberStat {
  nickname: string;
  chapters_read: number;
}

export default function GroupPage() {
  const [members, setMembers] = useState<MemberStat[]>([]);
  const [loading, setLoading] = useState(true);

  const { getActivityData } = useLearningActivity();
  const [activityMap, setActivityMap] = useState<Record<string, number>>({});
  const [streak, setStreak] = useState(0);
  const [todayRead, setTodayRead] = useState(false);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const loadGroup = async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nickname") as { data: { id: string; nickname: string }[] | null };

      if (!profiles) {
        setLoading(false);
        return;
      }

      const { data: logs } = await supabase
        .from("reading_log")
        .select("user_id") as { data: { user_id: string }[] | null };

      const countMap: Record<string, number> = {};
      for (const log of logs ?? []) {
        countMap[log.user_id] = (countMap[log.user_id] ?? 0) + 1;
      }

      const stats: MemberStat[] = profiles
        .map((p) => ({
          nickname: p.nickname,
          chapters_read: countMap[p.id] ?? 0,
        }))
        .sort((a, b) => b.chapters_read - a.chapters_read);

      setMembers(stats);
      setLoading(false);
    };

    const loadActivity = async () => {
      const result = await getActivityData();
      setActivityMap(result.activityMap);
      setStreak(result.streak);
      setTodayRead(result.todayRead);
      setActivityLoading(false);
    };

    loadGroup();
    loadActivity();
  }, [getActivityData]);

  const totalRead = members.reduce((s, m) => s + m.chapters_read, 0);
  const maxPossible = members.length * TOTAL_CHAPTERS;
  const groupPct = maxPossible > 0 ? Math.round((totalRead / maxPossible) * 100) : 0;

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">청년부</h1>

      {/* 나의 학습 현황 */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-surface-400">
          나의 학습 현황
        </h2>

        <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
          {activityLoading ? (
            <div className="flex h-28 items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
            </div>
          ) : (
            <>
              <div className="mb-4">
                <StreakBadge streak={streak} todayRead={todayRead} />
              </div>
              <LearningHeatmap activityMap={activityMap} />
            </>
          )}
        </div>
      </section>

      {/* 그룹 전체 진도 + 랭킹 */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-surface-400">
          그룹 현황
        </h2>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
          </div>
        ) : (
          <>
            {/* 그룹 전체 진도 */}
            <div className="mb-4 rounded-xl border border-surface-200 bg-white p-6">
              <h3 className="text-sm font-medium text-surface-600">그룹 전체 진도</h3>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-surface-700">
                    {totalRead.toLocaleString()}장 / {maxPossible.toLocaleString()}장
                  </span>
                  <span className="font-semibold text-primary-600">{groupPct}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-surface-100">
                  <div
                    className="h-full rounded-full bg-primary-400 transition-all"
                    style={{ width: `${groupPct}%` }}
                  />
                </div>
              </div>
              <p className="mt-2 text-xs text-surface-400">멤버 {members.length}명 기준</p>
            </div>

            {/* 멤버 랭킹 */}
            <div className="space-y-2">
              {members.length === 0 ? (
                <p className="py-8 text-center text-sm text-surface-400">
                  아직 멤버가 없습니다.
                </p>
              ) : (
                members.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 rounded-xl border border-surface-200 bg-white p-4"
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        i === 0
                          ? "bg-yellow-100 text-yellow-700"
                          : i === 1
                          ? "bg-surface-100 text-surface-600"
                          : i === 2
                          ? "bg-orange-50 text-orange-600"
                          : "bg-surface-50 text-surface-400"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-surface-800">{m.nickname}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-100">
                          <div
                            className="h-full rounded-full bg-primary-300"
                            style={{
                              width: `${Math.min(100, Math.round((m.chapters_read / TOTAL_CHAPTERS) * 100))}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-surface-500">{m.chapters_read}장</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
