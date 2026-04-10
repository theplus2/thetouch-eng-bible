"use client";

import { useCallback, useRef } from "react";
import { lookupWord } from "@/lib/dictionary/freeDictionary";
import { translateToKorean } from "@/lib/dictionary/translate";
import { getLemma } from "@/lib/dictionary/lemmatize";
import type { WordLookupResult } from "@/types/dictionary";
import type { DictionaryEntry } from "@/types/dictionary";

/**
 * 단어 검색 + 세션 캐싱 훅.
 *
 * 조회 순서:
 *   1. 세션 캐시 확인
 *   2. 원형 추출 (lemmatize)
 *   3. FreeDictionary: 원문 → 원형 → 원형+e 순으로 폴백
 *   4. 한국어 번역: 로컬 사전(web-dictionary.json) → 없으면 DeepL API 폴백
 *   5. 결과 캐시 저장
 */
export function useWordLookup() {
  const cache = useRef<Map<string, WordLookupResult>>(new Map());

  const lookup = useCallback(async (word: string): Promise<WordLookupResult> => {
    const normalizedWord = word.toLowerCase().trim();

    // 1. 캐시
    const cached = cache.current.get(normalizedWord);
    if (cached) return cached;

    // 2. 원형 추출
    const { lemma, altLemma, inflectionNote: rawNote } = getLemma(normalizedWord);

    // 3. FreeDictionary — 원문 → 원형 → 원형+e 순 폴백
    let dictResult: DictionaryEntry | null = null;
    let resolvedLemma = normalizedWord;

    dictResult = await lookupWord(normalizedWord);

    if (!dictResult && lemma !== normalizedWord) {
      dictResult = await lookupWord(lemma);
      if (dictResult) resolvedLemma = lemma;
    }

    if (!dictResult && altLemma) {
      dictResult = await lookupWord(altLemma);
      if (dictResult) resolvedLemma = altLemma;
    }

    // 4. 한국어 번역 — 원형(resolvedLemma)으로 번역해야 품질이 좋음
    const translationTarget = resolvedLemma !== normalizedWord ? resolvedLemma : normalizedWord;
    const [koreanMeaning, koreanDef] = await Promise.all([
      translateToKorean(translationTarget),
      dictResult?.meanings?.[0]?.definitions?.[0]?.definition 
        ? translateToKorean(dictResult.meanings[0].definitions[0].definition)
        : Promise.resolve(undefined)
    ]);

    // 활용형 노트 완성 (rawNote가 null인 경우 resolvedLemma로 생성)
    let inflectionNote: string | undefined;
    if (resolvedLemma !== normalizedWord) {
      if (rawNote) {
        inflectionNote = rawNote;
      } else {
        // -ing / -ed 계열로 자동 판별
        if (normalizedWord.endsWith('ing')) {
          inflectionNote = `${resolvedLemma}의 현재분사`;
        } else if (normalizedWord.endsWith('ed') || normalizedWord.endsWith('d')) {
          inflectionNote = `${resolvedLemma}의 과거형`;
        } else {
          inflectionNote = `${resolvedLemma}의 활용형`;
        }
      }
    }

    const result: WordLookupResult = {
      word: normalizedWord,
      lemma: resolvedLemma !== normalizedWord ? resolvedLemma : undefined,
      inflectionNote,
      phonetic: dictResult?.phonetic ?? undefined,
      partOfSpeech: dictResult?.meanings?.[0]?.partOfSpeech ?? undefined,
      englishDef: dictResult?.meanings?.[0]?.definitions?.[0]?.definition ?? undefined,
      koreanMeaning: koreanMeaning ?? undefined,
      koreanDef: koreanDef ?? undefined,
      isProperNoun: !dictResult && !koreanMeaning,
    };

    cache.current.set(normalizedWord, result);
    return result;
  }, []);

  return { lookup };
}
