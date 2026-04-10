"use client";

import { useState, useCallback } from "react";
import type { Database } from "@/types/database";

type VocabRow = Database["public"]["Tables"]["vocabulary"]["Row"];

interface FlashCardSessionProps {
  words: VocabRow[];
}

export default function FlashCardSession({ words }: FlashCardSessionProps) {
  const [deck, setDeck] = useState<VocabRow[]>(() => shuffle([...words]));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [again, setAgain] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);

  const current = deck[index];

  const handleFlip = useCallback(() => setFlipped((f) => !f), []);

  const advance = useCallback(() => {
    setFlipped(false);
    if (index + 1 >= deck.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
    }
  }, [index, deck.length]);

  const handleKnow = useCallback(() => {
    setKnown((prev) => new Set(prev).add(current.id));
    advance();
  }, [current, advance]);

  const handleAgain = useCallback(() => {
    setAgain((prev) => new Set(prev).add(current.id));
    advance();
  }, [current, advance]);

  const handleRestart = useCallback(() => {
    setDeck(shuffle([...words]));
    setIndex(0);
    setFlipped(false);
    setKnown(new Set());
    setAgain(new Set());
    setDone(false);
  }, [words]);

  const handleShuffleAgain = useCallback(() => {
    const retry = deck.filter((w) => again.has(w.id));
    if (retry.length === 0) return handleRestart();
    setDeck(shuffle(retry));
    setIndex(0);
    setFlipped(false);
    setKnown(new Set());
    setAgain(new Set());
    setDone(false);
  }, [deck, again, handleRestart]);

  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-3xl">📭</p>
        <p className="mt-3 font-medium text-surface-600">단어장이 비어 있어요</p>
        <p className="mt-1 text-sm text-surface-400">성경 읽기 중 단어를 저장해 보세요</p>
      </div>
    );
  }

  if (done) {
    const knownCount = known.size;
    const againCount = again.size;
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
        <p className="text-5xl">🎉</p>
        <div>
          <p className="text-xl font-bold text-surface-900">학습 완료!</p>
          <p className="mt-2 text-sm text-surface-500">
            총 {deck.length}개 중 알아요{" "}
            <span className="font-semibold text-primary-600">{knownCount}</span>개 ·
            다시{" "}
            <span className="font-semibold text-red-500">{againCount}</span>개
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {againCount > 0 && (
            <button
              onClick={handleShuffleAgain}
              className="rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white shadow-sm active:opacity-80"
            >
              다시 {againCount}개 복습
            </button>
          )}
          <button
            onClick={handleRestart}
            className="rounded-xl border border-surface-200 bg-white px-6 py-3 font-medium text-surface-700 active:opacity-80"
          >
            전체 다시 하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* 진행 상황 */}
      <div className="flex w-full items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-200">
          <div
            className="h-full rounded-full bg-primary-500 transition-all duration-300"
            style={{ width: `${((index) / deck.length) * 100}%` }}
          />
        </div>
        <span className="text-xs tabular-nums text-surface-400">
          {index + 1} / {deck.length}
        </span>
      </div>

      {/* 카드 */}
      <div
        className="relative w-full cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={handleFlip}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            minHeight: "220px",
          }}
        >
          {/* 앞면 — 영어 단어 */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-surface-200 bg-white px-6 py-8 shadow-md"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-2xl font-bold text-surface-900">{current.word}</p>
            {current.part_of_speech && (
              <span className="mt-2 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                {current.part_of_speech}
              </span>
            )}
            <p className="mt-6 text-xs text-surface-400">탭해서 뒤집기</p>
          </div>

          {/* 뒷면 — 한국어 뜻 */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-primary-200 bg-primary-50 px-6 py-8 shadow-md"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {current.korean_meaning ? (
              <p className="text-xl font-semibold text-surface-900">{current.korean_meaning}</p>
            ) : (
              <p className="text-sm italic text-surface-400">한국어 뜻 없음</p>
            )}
            {current.english_def && (
              <p className="text-center text-sm text-surface-500">{current.english_def}</p>
            )}
            {current.verse_text && (
              <p className="mt-1 text-center text-xs italic text-surface-400 line-clamp-2">
                &ldquo;{current.verse_text}&rdquo;
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 액션 버튼 — 뒤집힌 후에만 표시 */}
      {flipped ? (
        <div className="flex w-full gap-3">
          <button
            onClick={handleAgain}
            className="flex-1 rounded-xl border border-red-200 bg-red-50 py-3 font-semibold text-red-600 active:opacity-75"
          >
            다시 😅
          </button>
          <button
            onClick={handleKnow}
            className="flex-1 rounded-xl bg-primary-600 py-3 font-semibold text-white shadow-sm active:opacity-75"
          >
            알아요 ✓
          </button>
        </div>
      ) : (
        <div className="flex w-full gap-3">
          <button
            onClick={() => index > 0 && (setFlipped(false), setIndex((i) => i - 1))}
            disabled={index === 0}
            className="flex-1 rounded-xl border border-surface-200 py-3 text-sm text-surface-400 disabled:opacity-30 active:opacity-75"
          >
            ← 이전
          </button>
          <button
            onClick={handleFlip}
            className="flex-1 rounded-xl bg-surface-800 py-3 font-semibold text-white active:opacity-75"
          >
            뒤집기
          </button>
        </div>
      )}
    </div>
  );
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
