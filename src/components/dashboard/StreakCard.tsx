interface StreakCardProps {
  streak: number;
}

/**
 * 연속 읽기 스트릭 카드.
 */
export default function StreakCard({ streak }: StreakCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 p-6 text-white shadow-lg">
      <div className="relative z-10">
        <p className="text-sm font-medium text-primary-200">🔥 연속 읽기</p>
        <p className="mt-2 text-4xl font-bold">
          {streak}<span className="ml-1 text-lg font-normal text-primary-200">일</span>
        </p>
        <p className="mt-1 text-xs text-primary-200">
          {streak > 0 ? "잘하고 있어요! 계속 이어가세요." : "오늘 첫 장을 읽어보세요!"}
        </p>
      </div>
      {/* 배경 장식 */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-2 -right-2 h-16 w-16 rounded-full bg-white/5" />
    </div>
  );
}
