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

    // 4. 한국어 번역 전략
    // - 원형(lemma)과 검색한 단어(word)가 다를 경우, 둘 다 번역 시도
    const needsLemmaTranslation = lemma !== normalizedWord;
    
    const [rawWordMeaning, rawDef, rawLemmaMeaning] = await Promise.all([
      translateToKorean(normalizedWord),
      dictResult?.meanings?.[0]?.definitions?.[0]?.definition 
        ? translateToKorean(dictResult.meanings[0].definitions[0].definition)
        : Promise.resolve(undefined),
      needsLemmaTranslation ? translateToKorean(lemma) : Promise.resolve(undefined)
    ]);

    // 번역 결과 정제 (원문과 동일한 결과는 제외)
    const koreanMeaning = (rawWordMeaning && rawWordMeaning.toLowerCase() !== normalizedWord.toLowerCase()) 
      ? rawWordMeaning 
      : undefined;
    
    const lemmaMeaning = (rawLemmaMeaning && rawLemmaMeaning.toLowerCase() !== lemma.toLowerCase())
      ? rawLemmaMeaning
      : undefined;

    const koreanDef = (rawDef && rawDef !== dictResult?.meanings?.[0]?.definitions?.[0]?.definition)
      ? rawDef
      : undefined;

    // 활용형 노트 완성 (항상 lemma 정보를 바탕으로 생성)
    let inflectionNote: string | undefined;
    if (needsLemmaTranslation) {
      if (rawNote) {
        inflectionNote = rawNote;
      } else {
        // 자동 생성 규칙
        if (normalizedWord.endsWith('ing')) {
          inflectionNote = `${lemma}의 현재분사`;
        } else if (normalizedWord.endsWith('ed') || normalizedWord.endsWith('d')) {
          inflectionNote = `${lemma}의 과거형`;
        } else if (normalizedWord.endsWith('ies') || (normalizedWord.endsWith('s') && !lemma.endsWith('s'))) {
          inflectionNote = `${lemma}의 복수형/3인칭단수`;
        } else {
          inflectionNote = `${lemma}의 활용형`;
        }
      }
    }

    const result: WordLookupResult = {
      word: normalizedWord,
      lemma: needsLemmaTranslation ? lemma : undefined,
      inflectionNote,
      phonetic: dictResult?.phonetic ?? undefined,
      partOfSpeech: dictResult?.meanings?.[0]?.partOfSpeech ?? undefined,
      englishDef: dictResult?.meanings?.[0]?.definitions?.[0]?.definition ?? undefined,
      koreanMeaning: koreanMeaning || lemmaMeaning, // 단어 뜻이 없으면 원형 뜻으로 대체
      koreanDef: koreanDef ?? undefined,
      lemmaMeaning: lemmaMeaning ?? undefined,
      isProperNoun: !dictResult && !koreanMeaning && !lemmaMeaning,
    };

    cache.current.set(normalizedWord, result);
    return result;
  }, []);

  return { lookup };
}
