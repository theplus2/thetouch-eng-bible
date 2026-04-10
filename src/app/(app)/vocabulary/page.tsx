"use client";

import { useEffect, useState } from "react";
import { useVocabulary } from "@/hooks/useVocabulary";
import FlashCardSession from "@/components/vocabulary/FlashCard";
import type { Database } from "@/types/database";

type VocabRow = Database["public"]["Tables"]["vocabulary"]["Row"];
type Tab = "list" | "flashcard";

export default function VocabularyPage() {
  const { getVocabulary, getDueVocabulary, deleteWord } = useVocabulary();
  const [words, setWords] = useState<VocabRow[]>([]);
  const [dueWords, setDueWords] = useState<VocabRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("flashcard"); // 기본탭을 플래시카드로 변경

  const [dbError, setDbError] = useState(false);

  useEffect(() => {
    Promise.all([getVocabulary(), getDueVocabulary()]).then(([allData, dueData]) => {
      setWords(allData);
      if (dueData === null) {
        setDbError(true);
        setDueWords(allData); // DB 에러 시 일단 모든 단어를 보여줌
      } else {
        setDueWords(dueData);
      }
      setLoading(false);
    });
  }, [getVocabulary, getDueVocabulary]);

  const handleDelete = async (id: number) => {
    await deleteWord(id);
    setWords((prev) => prev.filter((w) => w.id !== id));
  };

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold">단어장</h1>
        {words.length > 0 && (
          <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">
            {words.length}개
          </span>
        )}
      </div>

      {dbError && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-bold">⚠️ 데이터베이스 업데이트 필요</p>
          <p className="mt-1">망각 곡선 기능을 위한 테이블 설정(SQL)이 반영되지 않았습니다. 현재 기본 모드로 작동합니다.</p>
        </div>
      )}

      {/* 탭 */}
      {!loading && words.length > 0 && (
        <div className="mb-5 flex rounded-xl border border-surface-200 bg-surface-100 p-1">
          <button
            onClick={() => setTab("list")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              tab === "list"
                ? "bg-white text-surface-900 shadow-sm"
                : "text-surface-500"
            }`}
          >
            목록
          </button>
          <button
            onClick={() => setTab("flashcard")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              tab === "flashcard"
                ? "bg-white text-surface-900 shadow-sm"
                : "text-surface-500"
            }`}
          >
            플래시카드
          </button>
        </div>
      )}

      {/* 로딩 */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
        </div>
      ) : tab === "flashcard" ? (
        <FlashCardSession words={dueWords} />
      ) : words.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-300 bg-white/50 py-16 text-center">
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
              className="flex items-start justify-between rounded-xl border border-surface-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-surface-900">{w.word}</span>
                  {w.part_of_speech && (
                    <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-700">
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
                className="ml-4 rounded-lg p-1.5 text-surface-400 transition hover:bg-red-50 hover:text-red-500"
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
