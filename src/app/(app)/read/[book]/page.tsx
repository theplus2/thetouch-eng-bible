"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { loadBibleBook } from "@/lib/bible/loader";
import { useReadingLog } from "@/hooks/useReadingLog";
import type { BibleBook } from "@/types/bible";

export default function BookPage() {
  const params = useParams();
  const bookNum = Number(params.book);
  const [book, setBook] = useState<BibleBook | null>(null);
  const [readSet, setReadSet] = useState<Set<number>>(new Set());
  const { getReadingLog } = useReadingLog();

  useEffect(() => {
    if (!bookNum) return;
    loadBibleBook(bookNum).then(setBook);
    getReadingLog().then((logs) => {
      const set = new Set(
        logs.filter((l) => l.book === bookNum).map((l) => l.chapter)
      );
      setReadSet(set);
    });
  }, [bookNum, getReadingLog]);

  if (!book) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/read" className="text-sm text-primary-600 hover:underline">
          ← 책 목록
        </Link>
        <h1 className="text-2xl font-bold">{book.name}</h1>
        <span className="text-sm text-surface-400">총 {book.chapters.length}장</span>
      </div>

      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
        {book.chapters.map((ch) => {
          const isRead = readSet.has(ch.c);
          return (
            <Link
              key={ch.c}
              href={`/read/${bookNum}/${ch.c}`}
              className={`flex aspect-square items-center justify-center rounded-xl text-sm font-semibold transition ${
                isRead
                  ? "bg-primary-100 text-primary-700"
                  : "border border-surface-200 text-surface-700 hover:border-primary-300 hover:bg-primary-50"
              }`}
            >
              {isRead ? "✓" : ch.c}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
