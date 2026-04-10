"use client";

import type { Verse } from "@/types/bible";
import { tokenizeVerse } from "@/lib/bible/tokenizer";
import WordToken from "./WordToken";

interface VerseTextProps {
  verse: Verse;
  /** 구절 번호 탭 시 호출 — 없으면 단순 텍스트로 렌더 */
  onVersePress?: (verse: Verse) => void;
}

/**
 * 절 단위 컴포넌트.
 * 텍스트를 토큰화하여 단어별 클릭 이벤트 부여.
 * onVersePress가 주어지면 구절 번호가 탭 가능한 버튼으로 렌더됨.
 */
export default function VerseText({ verse, onVersePress }: VerseTextProps) {
  const tokens = tokenizeVerse(verse.t);

  return (
    <p className="bible-text text-bible-base text-surface-800">
      {onVersePress ? (
        <button
          onClick={() => onVersePress(verse)}
          className="mr-1 text-xs font-medium text-primary-400 hover:text-primary-600 cursor-pointer"
          aria-label={`${verse.v}절 묵상 쓰기`}
        >
          {verse.v}
        </button>
      ) : (
        <sup className="mr-1 text-xs font-medium text-primary-400">
          {verse.v}
        </sup>
      )}
      {tokens.map((token, index) => {
        if (token.type === "word") {
          return (
            <WordToken
              key={`${verse.v}-${index}`}
              word={token.value}
              verseNumber={verse.v}
              verseText={verse.t}
            />
          );
        }
        if (token.type === "newline") {
          return <br key={`${verse.v}-${index}`} />;
        }
        return (
          <span key={`${verse.v}-${index}`}>{token.value}</span>
        );
      })}
    </p>
  );
}
