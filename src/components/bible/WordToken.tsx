"use client";

import { useWordPanelStore } from "@/stores/wordPanelStore";
import { useWordLookup } from "@/hooks/useWordLookup";
import { useBibleStore } from "@/stores/bibleStore";

interface WordTokenProps {
  word: string;
  verseNumber: number;
  verseText: string;
}

/**
 * 클릭 가능한 단어 span.
 * 클릭 시 WordPanel에 단어 정의 표시.
 */
export default function WordToken({ word, verseNumber, verseText }: WordTokenProps) {
  const { openPanel, openLoading } = useWordPanelStore();
  const { lookup } = useWordLookup();
  const currentPosition = useBibleStore((s) => s.currentPosition);

  const handleClick = async () => {
    // 텍스트를 드래그(선택) 중일 때는 단일 클릭 무시
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && selection.toString().trim().length > 0) {
      return;
    }

    openLoading();

    const result = await lookup(word);

    openPanel(result, {
      book: currentPosition?.book ?? 0,
      chapter: currentPosition?.chapter ?? 0,
      verse: verseNumber,
      verseText,
    });
  };

  return (
    <span
      className="word-token"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {word}
    </span>
  );
}
