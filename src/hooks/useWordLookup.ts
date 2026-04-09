"use client";

import { useCallback, useRef } from "react";
import { lookupWord } from "@/lib/dictionary/freeDictionary";
import { translateToKorean } from "@/lib/dictionary/translate";
import type { WordLookupResult } from "@/types/dictionary";

/**
 * 단어 검색 + 세션 캐싱 훅.
 * PRD 7.3 플로우:
 *   1. 로컬 캐시(Map) 확인
 *   2. Free Dictionary API (영어 정의 + 발음)
 *   3. MyMemory API (한글 뜻)
 *   4. 결과 캐시 저장
 */
export function useWordLookup() {
  // 세션 동안 유지되는 캐시
  const cache = useRef<Map<string, WordLookupResult>>(new Map());

  const lookup = useCallback(async (word: string): Promise<WordLookupResult> => {
    const normalizedWord = word.toLowerCase().trim();

    // 1. 캐시 확인
    const cached = cache.current.get(normalizedWord);
    if (cached) return cached;

    // 2~3. API 병렬 호출
    const [dictResult, koreanMeaning] = await Promise.all([
      lookupWord(normalizedWord),
      translateToKorean(normalizedWord),
    ]);

    // 결과 조합
    const result: WordLookupResult = {
      word: normalizedWord,
      phonetic: dictResult?.phonetic ?? undefined,
      partOfSpeech: dictResult?.meanings?.[0]?.partOfSpeech ?? undefined,
      englishDef: dictResult?.meanings?.[0]?.definitions?.[0]?.definition ?? undefined,
      koreanMeaning: koreanMeaning ?? undefined,
      isProperNoun: !dictResult,
    };

    // 4. 캐시 저장
    cache.current.set(normalizedWord, result);

    return result;
  }, []);

  return { lookup };
}
