"use client";

import { useEffect, useState, useCallback } from "react";
import { useVocabulary } from "@/hooks/useVocabulary";
import type { Database } from "@/types/database";

type VocabRow = Database["public"]["Tables"]["vocabulary"]["Row"];

export default function VocabularyPage() {
  const { getVocabulary, deleteWord } = useVocabulary();
  const [words, setWords] = useState<VocabRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await getVocabulary();
    setWords(data);
    setLoading(false);
  }, [getVocabulary]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: number) => {
    await deleteWord(id);
    setWords((prev) => prev.filter((w) => w.id !== id));
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">단어장</h1>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
        </div>
      ) : words.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-200 py-16 text-center">
          <p className="text-3xl">📝</p>
          <p className="mt-3 font-medium text-surface-600">저장된 단어가 없습니다</p>
          <p className="mt-1 text-sm text-surface-400">
            성경 읽기 중 단어를 클릭해 단어장에 추가하세요
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {words.map((w) => (
            <div
              key={w.id}
              className="flex items-start justify-between rounded-xl border border-surface-200 bg-white p-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-surface-900">{w.word}</span>
                  {w.part_of_speech && (
                    <span className="rounded bg-surface-100 px-2 py-0.5 text-xs text-surface-500">
                      {w.part_of_speech}
                    </span>
                  )}
                </div>
                {w.korean_meaning && (
                  <p className="mt-1 text-sm text-surface-700">🇰🇷 {w.korean_meaning}</p>
                )}
                {w.english_def && (
                  <p className="mt-0.5 text-xs text-surface-500">{w.english_def}</p>
                )}
                {w.verse_text && (
                  <p className="mt-2 text-xs italic text-surface-400 line-clamp-2">
                    &ldquo;{w.verse_text}&rdquo;
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(w.id)}
                className="ml-4 rounded-lg p-1.5 text-surface-400 hover:bg-red-50 hover:text-red-500 transition"
                aria-label="삭제"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
