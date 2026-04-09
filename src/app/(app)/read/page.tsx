"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadBibleIndex } from "@/lib/bible/loader";
import { useReadingLog } from "@/hooks/useReadingLog";
import type { BibleIndex, BookMeta } from "@/types/bible";

export default function ReadPage() {
  const [index, setIndex] = useState<BibleIndex | null>(null);
  const [tab, setTab] = useState<"ot" | "nt">("ot");
  const [readCounts, setReadCounts] = useState<Record<number, number>>({});
  const { getReadingLog } = useReadingLog();

  useEffect(() => {
    loadBibleIndex().then(setIndex);
    getReadingLog().then((logs) => {
      const counts: Record<number, number> = {};
      for (const log of logs) {
        counts[log.book] = (counts[log.book] ?? 0) + 1;
      }
      setReadCounts(counts);
    });
  }, [getReadingLog]);

  if (!index) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  const books = index.books.filter((b) =>
    tab === "ot" ? b.book <= 39 : b.book >= 40
  );

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">성경 읽기</h1>

      {/* 구약 / 신약 탭 */}
      <div className="mb-6 flex gap-2 border-b border-surface-200">
        {(["ot", "nt"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 px-4 text-sm font-medium transition ${
              tab === t
                ? "border-b-2 border-primary-600 text-primary-600"
                : "text-surface-500 hover:text-surface-700"
            }`}
          >
            {t === "ot" ? "구약" : "신약"}
          </button>
        ))}
      </div>

      {/* 책 목록 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {books.map((book: BookMeta) => {
          const read = readCounts[book.book] ?? 0;
          const total = book.chapters;
          const pct = total > 0 ? Math.round((read / total) * 100) : 0;

          return (
            <Link
              key={book.book}
              href={`/read/${book.book}`}
              className="rounded-xl border border-surface-200 p-4 hover:border-primary-300 hover:bg-primary-50 transition"
            >
              <p className="font-semibold text-surface-800 text-sm">{book.name}</p>
              <p className="mt-0.5 text-xs text-surface-400">{book.abbr}</p>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs text-surface-400">
                  <span>{read}/{total}장</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-100">
                  <div
                    className="h-full rounded-full bg-primary-400 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
