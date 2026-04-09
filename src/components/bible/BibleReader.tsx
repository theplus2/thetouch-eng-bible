import type { Chapter } from "@/types/bible";
import VerseText from "./VerseText";

interface BibleReaderProps {
  bookName: string;
  chapter: Chapter;
}

/**
 * 성경 본문 렌더러.
 * 각 절을 VerseText 컴포넌트로 렌더링.
 */
export default function BibleReader({ bookName, chapter }: BibleReaderProps) {
  return (
    <article className="mx-auto max-w-2xl px-4 py-6">
      <h2 className="mb-6 text-xl font-bold text-surface-800">
        {bookName} {chapter.c}
      </h2>
      <div className="space-y-1">
        {chapter.verses.map((verse) => (
          <VerseText
            key={verse.v}
            verse={verse}
          />
        ))}
      </div>
    </article>
  );
}
