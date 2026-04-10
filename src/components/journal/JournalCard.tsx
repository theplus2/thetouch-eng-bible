"use client";

import { useState } from "react";
import type { JournalRow } from "@/types/journal";
import { BOOK_NAMES } from "@/lib/bible/constants";

interface JournalCardProps {
  journal: JournalRow;
  onDelete?: (id: number) => void;
}

/**
 * 일지 히스토리 카드.
 * 요약 표시 → 탭하면 전체 내용 펼쳐짐.
 */
export default function JournalCard({ journal, onDelete }: JournalCardProps) {
  const [expanded, setExpanded] = useState(false);

  const bookName = BOOK_NAMES[journal.book] ?? `Book ${journal.book}`;
  const reference = `${bookName} ${journal.chapter}:${journal.verse}`;
  const date = new Date(journal.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const displayBody = journal.correction_applied && journal.corrected_body
    ? journal.corrected_body
    : journal.body;

  return (
    <div
      className="rounded-xl border border-surface-200 bg-white p-4 shadow-sm transition hover:shadow-md"
      onClick={() => setExpanded((v) => !v)}
    >
      {/* 헤더 */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-primary-600">{reference}</p>
          <p className="mt-0.5 text-[11px] text-surface-400">{date}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {journal.correction_applied && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
              교정됨
            </span>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(journal.id);
              }}
              className="text-surface-300 hover:text-red-400 text-sm"
              aria-label="삭제"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 구절 (접힌 상태: 첫 줄만) */}
      <p className="mb-2 text-xs italic text-surface-500 line-clamp-1">
        &ldquo;{journal.verse_text}&rdquo;
      </p>

      {/* 묵상 본문 */}
      <p
        className={`text-sm text-surface-800 leading-relaxed ${
          expanded ? "" : "line-clamp-2"
        }`}
      >
        {displayBody}
      </p>

      {!expanded && displayBody.length > 100 && (
        <p className="mt-1 text-xs text-primary-500">더 보기...</p>
      )}
    </div>
  );
}
