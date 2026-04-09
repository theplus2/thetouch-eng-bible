import ProgressBar from "@/components/ui/ProgressBar";
import { TOTAL_CHAPTERS } from "@/lib/bible/constants";

interface GroupProgressProps {
  totalMembers: number;
  totalChaptersRead: number;
}

/**
 * 청년부 전체 진도율 표시.
 * 전체 그룹 진도율 = 읽은 장 / (1189장 × 인원)
 */
export default function GroupProgress({
  totalMembers,
  totalChaptersRead,
}: GroupProgressProps) {
  const totalPossible = TOTAL_CHAPTERS * totalMembers;
  const percentage = totalPossible > 0 ? (totalChaptersRead / totalPossible) * 100 : 0;

  return (
    <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
      <h3 className="font-semibold text-surface-800">👥 청년부 전체 진도</h3>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-surface-500">참여 인원</p>
          <p className="text-2xl font-bold text-surface-900">{totalMembers}명</p>
        </div>
        <div>
          <p className="text-xs text-surface-500">총 읽은 장</p>
          <p className="text-2xl font-bold text-primary-600">
            {totalChaptersRead.toLocaleString()}장
          </p>
        </div>
      </div>
      <ProgressBar value={percentage} size="lg" variant="accent" showLabel className="mt-4" />
    </div>
  );
}
