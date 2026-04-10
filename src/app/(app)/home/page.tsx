"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStreak } from "@/hooks/useStreak";
import { useReadingLog } from "@/hooks/useReadingLog";
import { useVocabulary } from "@/hooks/useVocabulary";
import { TOTAL_CHAPTERS, LAST_READING_POS_KEY } from "@/lib/bible/constants";

export default function HomePage() {
  const { calculateStreak } = useStreak();
  const { getReadingLog } = useReadingLog();
  const { getVocabulary } = useVocabulary();

  const [streak, setStreak] = useState(0);
  const [chaptersRead, setChaptersRead] = useState(0);
  const [vocabCount, setVocabCount] = useState(0);
  const [lastPos, setLastPos] = useState<{ book: number; chapter: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedPos = localStorage.getItem(LAST_READING_POS_KEY);
    if (savedPos) {
      try {
        setLastPos(JSON.parse(savedPos));
      } catch {}
    }

    Promise.all([
      calculateStreak(),
      getReadingLog(),
      getVocabulary(),
    ]).then(([s, logs, vocab]) => {
      setStreak(s);
      setChaptersRead(logs.length);
      setVocabCount(vocab.length);
      setLoading(false);
    });
  }, [calculateStreak, getReadingLog, getVocabulary]);

  const pct = Math.round((chaptersRead / TOTAL_CHAPTERS) * 100);

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-surface-900">대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-surface-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
          <h2 className="text-sm font-medium text-surface-600">연속 읽기</h2>
          <p className="mt-2 text-3xl font-bold text-primary-600">
            {loading ? "—" : `${streak}일`}
          </p>
          <p className="mt-1 text-xs text-surface-400">
            {streak > 0 ? "꾸준히 읽고 있어요!" : "오늘 읽기를 시작해보세요"}
          </p>
        </div>

        <div className="rounded-xl border border-surface-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
          <h2 className="text-sm font-medium text-surface-600">읽은 장</h2>
          <p className="mt-2 text-3xl font-bold text-primary-600">
            {loading ? "—" : `${chaptersRead.toLocaleString()} / ${TOTAL_CHAPTERS.toLocaleString()}`}
          </p>
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-surface-400">
              <span>전체 진도</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-primary-100">
              <div
                className="h-full rounded-full bg-primary-400 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-surface-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
          <h2 className="text-sm font-medium text-surface-600">저장한 단어</h2>
          <p className="mt-2 text-3xl font-bold text-accent-600">
            {loading ? "—" : `${vocabCount}개`}
          </p>
          <Link
            href="/vocabulary"
            className="mt-1 block text-xs text-primary-500 hover:underline"
          >
            단어장 보기 →
          </Link>
        </div>
      </div>

      {/* 계속 읽기 버튼 */}
      <div className="mt-8">
        {lastPos ? (
          <Link
            href={`/read/${lastPos.book}/${lastPos.chapter}`}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600 active:bg-primary-700"
          >
            📖 계속 읽기
          </Link>
        ) : (
          <Link
            href="/read"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600 active:bg-primary-700"
          >
            📖 성경 읽기 시작
          </Link>
        )}
      </div>
    </div>
  );
}
