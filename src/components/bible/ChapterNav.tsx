import Link from "next/link";

interface ChapterNavProps {
  bookNumber: number;
  currentChapter: number;
  totalChapters: number;
}

/**
 * 이전/다음 장 네비게이션.
 */
export default function ChapterNav({
  bookNumber,
  currentChapter,
  totalChapters,
}: ChapterNavProps) {
  const hasPrev = currentChapter > 1;
  const hasNext = currentChapter < totalChapters;

  return (
    <div className="flex items-center justify-between border-t border-surface-200 px-4 py-3">
      {hasPrev ? (
        <Link
          href={`/read/${bookNumber}/${currentChapter - 1}`}
          className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          ← 이전 장
        </Link>
      ) : (
        <div />
      )}

      <span className="text-sm text-surface-500">
        {currentChapter} / {totalChapters}
      </span>

      {hasNext ? (
        <Link
          href={`/read/${bookNumber}/${currentChapter + 1}`}
          className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          다음 장 →
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
