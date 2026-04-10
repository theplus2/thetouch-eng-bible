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

    // 2. 원형 추출 후보 가져오기
    const { candidates, ruleNote } = getLemma(normalizedWord);

    // 3. FreeDictionary에서 유효한 원형 찾기
    let dictResult: DictionaryEntry | null = null;
    let resolvedLemma = candidates[0];

    // 먼저 원래 단어 자체로 검색해봄 (사전에 'lived' 같은 항목이 직접 있을 수 있음)
    const directResult = await lookupWord(normalizedWord);
    
    if (directResult) {
      dictResult = directResult;
      // 만약 원 단어가 사전에 있는데, candidates 중 하나가 원 단어보다 짧은 원형이라면
      // 그 원형을 진정한 lemma로 간주할 수도 있음. 
      // 하지만 FreeDictionary가 정확한 본딧말을 줄 때가 있으므로 일단 넘어감.
      // 여기서는 candidates를 순회하여 가장 먼저 나오는 사전에 등재된 '원형'을 찾음
    }

    // directResult가 없거나, 원형을 찾고 싶을 때 candidates 확인
    let bestCandResult: DictionaryEntry | null = null;
    let fallbackCandResult: DictionaryEntry | null = null;
    let fallbackCand: string | null = null;

    for (const cand of candidates) {
      if (cand === normalizedWord && dictResult) {
        resolvedLemma = cand;
        break; // 이미 찾았음
      }
      
      const res = await lookupWord(cand);
      if (res) {
        // 품사 중에 verb가 있는지 확인 (동사일 확률이 제일 큼)
        const hasVerb = res.meanings?.some(m => m.partOfSpeech.includes('verb'));
        if (hasVerb) {
          bestCandResult = res;
          resolvedLemma = cand;
          break; // 완벽한 후보 찾음
        } else if (!fallbackCandResult) {
          fallbackCandResult = res; // 일단 첫 번째로 찾은 유효한 단어 임시 저장
          fallbackCand = cand;
        }
      }
    }

    if (bestCandResult) {
      dictResult = bestCandResult;
    } else if (fallbackCandResult && fallbackCand) {
      dictResult = fallbackCandResult;
      resolvedLemma = fallbackCand;
    }

    // 4. 한국어 번역 전략
    const needsLemmaTranslation = resolvedLemma !== normalizedWord;
    
    // 비동기 번역 병렬 요청
    const [rawWordMeaning, rawDef, rawLemmaMeaning] = await Promise.all([
      // 1. 원 단어 번역 (lived)
      translateToKorean(normalizedWord),
      // 2. 검색된 영영사전 뜻 번역
      dictResult?.meanings?.[0]?.definitions?.[0]?.definition 
        ? translateToKorean(dictResult.meanings[0].definitions[0].definition)
        : Promise.resolve(undefined),
      // 3. 원형 단어 번역 (live)
      needsLemmaTranslation ? translateToKorean(resolvedLemma) : Promise.resolve(undefined)
    ]);

    // 번역 결과 정제
    const koreanMeaning = (rawWordMeaning && rawWordMeaning.toLowerCase() !== normalizedWord.toLowerCase()) 
      ? rawWordMeaning 
      : undefined;
    
    const lemmaMeaning = (rawLemmaMeaning && rawLemmaMeaning.toLowerCase() !== resolvedLemma.toLowerCase())
      ? rawLemmaMeaning
      : undefined;

    const koreanDef = (rawDef && rawDef !== dictResult?.meanings?.[0]?.definitions?.[0]?.definition)
      ? rawDef
      : undefined;

    // 활용형 노트 완성
    let inflectionNote: string | undefined;
    if (needsLemmaTranslation) {
      inflectionNote = ruleNote ? `${resolvedLemma}의 ${ruleNote}` : `${resolvedLemma}의 활용형`;
    }

    const result: WordLookupResult = {
      word: normalizedWord,
      lemma: needsLemmaTranslation ? resolvedLemma : undefined,
      inflectionNote,
      phonetic: dictResult?.phonetic ?? undefined,
      partOfSpeech: dictResult?.meanings?.[0]?.partOfSpeech ?? undefined,
      englishDef: dictResult?.meanings?.[0]?.definitions?.[0]?.definition ?? undefined,
      // 단어 뜻이 없으면 원형 뜻으로 대체
      koreanMeaning: koreanMeaning || lemmaMeaning, 
      koreanDef: koreanDef ?? undefined,
      lemmaMeaning: lemmaMeaning ?? undefined,
      isProperNoun: !dictResult && !koreanMeaning && !lemmaMeaning,
    };

    cache.current.set(normalizedWord, result);
    return result;
  }, []);

  return { lookup };
}
