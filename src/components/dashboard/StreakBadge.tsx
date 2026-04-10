interface StreakBadgeProps {
  streak: number;
  todayRead: boolean;
}

export default function StreakBadge({ streak, todayRead }: StreakBadgeProps) {
  if (streak === 0) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-surface-200 bg-surface-50 px-4 py-2">
        <span className="text-sm text-surface-500">오늘 첫 장을 읽어보세요! 📖</span>
      </div>
    );
  }

  const flames = streak >= 30 ? "🔥🔥🔥" : streak >= 14 ? "🔥🔥" : "🔥";

  return (
    <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2">
      <span className="text-sm font-semibold text-orange-700">
        현재 {streak}일째 연속 읽는 중{flames}
      </span>
      {!todayRead && (
        <span className="text-xs text-orange-400">· 오늘도 이어가세요!</span>
      )}
    </div>
  );
}
