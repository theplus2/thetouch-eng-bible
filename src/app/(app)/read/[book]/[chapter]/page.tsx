"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { loadBibleBook } from "@/lib/bible/loader";
import { useBibleStore } from "@/stores/bibleStore";
import { useReadingLog } from "@/hooks/useReadingLog";
import BibleReader from "@/components/bible/BibleReader";
import WordPanel from "@/components/bible/WordPanel";
import JournalSheet from "@/components/journal/JournalSheet";
import { LAST_READING_POS_KEY } from "@/lib/bible/constants";
import type { BibleBook, Chapter } from "@/types/bible";

export default function ReadChapterPage() {
  const params = useParams();
  const router = useRouter();
  const bookNum = Number(params.book);
  const chapterNum = Number(params.chapter);

  const [book, setBook] = useState<BibleBook | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [isRead, setIsRead] = useState(false);
  const [marking, setMarking] = useState(false);

  const setPosition = useBibleStore((s) => s.setPosition);
  const { markChapterRead, isChapterRead } = useReadingLog();

  useEffect(() => {
    if (!bookNum || !chapterNum) return;

    loadBibleBook(bookNum).then((b) => {
      setBook(b);
      const ch = b.chapters.find((c) => c.c === chapterNum) ?? null;
      setChapter(ch);
    });

    setPosition({ book: bookNum, chapter: chapterNum });

    // 마지막 위치 localStorage 저장
    localStorage.setItem(
      LAST_READING_POS_KEY,
      JSON.stringify({ book: bookNum, chapter: chapterNum })
    );

    isChapterRead(bookNum, chapterNum).then(setIsRead);
  }, [bookNum, chapterNum, setPosition, isChapterRead]);

  const handleMarkRead = async () => {
    setMarking(true);
    await markChapterRead(bookNum, chapterNum);
    setIsRead(true);
    setMarking(false);
  };

  const totalChapters = book?.chapters.length ?? 0;

  if (!book || !chapter) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="relative pb-32">
      {/* 네비 헤더 */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-surface-200 bg-white px-4 py-3">
        <Link
          href={`/read/${bookNum}`}
          className="text-sm text-primary-600 hover:underline"
        >
          ← {book.name}
        </Link>
        <span className="text-sm font-semibold text-surface-700">
          {book.name} {chapterNum}
        </span>
        <span className="text-xs text-surface-400">
          {chapterNum}/{totalChapters}
        </span>
      </div>

      {/* 성경 본문 */}
      <BibleReader bookName={book.name} chapter={chapter} />

      {/* 이전/다음 장 + 읽기 완료 버튼 */}
      <div className="fixed bottom-16 left-0 right-0 z-20 flex items-center justify-between gap-3 border-t border-surface-200 bg-white px-4 py-3 md:left-64 md:bottom-0">
        {chapterNum > 1 ? (
          <Link
            href={`/read/${bookNum}/${chapterNum - 1}`}
            className="flex-1 rounded-lg border border-surface-200 py-2 text-center text-sm text-surface-600 hover:bg-surface-50"
          >
            ← 이전 장
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        <button
          onClick={handleMarkRead}
          disabled={isRead || marking}
          className={`flex-1 rounded-lg py-2 text-center text-sm font-semibold transition ${
            isRead
              ? "bg-green-100 text-green-700"
              : "bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
          }`}
        >
          {isRead ? "✓ 읽음" : marking ? "기록 중..." : "읽기 완료"}
        </button>

        {chapterNum < totalChapters ? (
          <Link
            href={`/read/${bookNum}/${chapterNum + 1}`}
            className="flex-1 rounded-lg border border-surface-200 py-2 text-center text-sm text-surface-600 hover:bg-surface-50"
          >
            다음 장 →
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>

      {/* WordPanel */}
      <WordPanel />
      {/* 묵상 저널 시트 */}
      <JournalSheet />
    </div>
  );
}
