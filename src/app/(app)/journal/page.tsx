"use client";

import { useEffect, useState, useCallback } from "react";
import { useJournal } from "@/hooks/useJournal";
import JournalCard from "@/components/journal/JournalCard";
import type { JournalRow } from "@/types/journal";

/**
 * 묵상 일지 히스토리 탭 페이지.
 */
export default function JournalPage() {
  const { getJournals, deleteJournal } = useJournal();
  const [journals, setJournals] = useState<JournalRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getJournals(50);
    setJournals(data);
    setLoading(false);
  }, [getJournals]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: number) => {
    if (!confirm("이 일지를 삭제하시겠습니까?")) return;
    const ok = await deleteJournal(id);
    if (ok) setJournals((prev) => prev.filter((j) => j.id !== id));
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-1 text-xl font-bold text-surface-900">묵상 일지</h1>
      <p className="mb-6 text-sm text-surface-500">
        말씀을 읽으며 기록한 영어 묵상 모음
      </p>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
        </div>
      ) : journals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-4xl mb-4">✏️</p>
          <p className="text-base font-medium text-surface-700">아직 작성된 일지가 없습니다</p>
          <p className="mt-1 text-sm text-surface-400">
            성경을 읽다가 구절 번호를 탭하면 묵상을 기록할 수 있어요
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {journals.map((j) => (
            <JournalCard key={j.id} journal={j} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
