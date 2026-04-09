import ProgressBar from "@/components/ui/ProgressBar";
import { TOTAL_CHAPTERS } from "@/lib/bible/constants";

interface ProgressCardProps {
  chaptersRead: number;
}

/**
 * 읽기 진도 카드.
 */
export default function ProgressCard({ chaptersRead }: ProgressCardProps) {
  const percentage = (chaptersRead / TOTAL_CHAPTERS) * 100;

  return (
    <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-surface-600">📖 읽기 진도</p>
      <p className="mt-2 text-3xl font-bold text-surface-900">
        {chaptersRead}
        <span className="ml-1 text-base font-normal text-surface-400">
          / {TOTAL_CHAPTERS.toLocaleString()}장
        </span>
      </p>
      <ProgressBar value={percentage} size="md" variant="primary" className="mt-4" />
      <p className="mt-2 text-xs text-surface-500">
        성경 전체의 {percentage.toFixed(1)}%를 읽었습니다
      </p>
    </div>
  );
}
