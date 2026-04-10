"use client";

import { useCallback, useRef } from "react";
import { lookupWord } from "@/lib/dictionary/freeDictionary";
import { translateToKorean } from "@/lib/dictionary/translate";
import { getLemma } from "@/lib/dictionary/lemmatize";
import type { WordLookupResult, DictionaryEntry } from "@/types/dictionary";

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

// '복수/3인칭 단수'는 명사 복수형(cities)과 겹치므로 제외 — 정확한 값 비교
const VERB_RULE_NOTES = new Set([
  '과거형', '과거분사', '과거형/과거분사', '현재분사', '3인칭 단수',
]);

export function useWordLookup() {
  const cache = useRef<Map<string, WordLookupResult>>(new Map());

  const lookup = useCallback(async (word: string): Promise<WordLookupResult> => {
    const normalizedWord = word.toLowerCase().trim();

    // 1. 캐시
    const cached = cache.current.get(normalizedWord);
    if (cached) return cached;

    // 2. 원형 추출 후보
    const { candidates, ruleNote } = getLemma(normalizedWord);
    const isVerbInflection = ruleNote != null && VERB_RULE_NOTES.has(ruleNote);

    // 3. FreeDictionary에서 원형 찾기
    let dictResult: DictionaryEntry | null = null;
    let resolvedLemma = candidates[0];

    // 원 단어 직접 조회 (직접 등재된 경우 fallback용)
    const directResult = await lookupWord(normalizedWord);
    if (directResult) dictResult = directResult;

    // candidates에서 사전 확인된 원형 탐색
    let bestCandResult: DictionaryEntry | null = null;
    let fallbackCandResult: DictionaryEntry | null = null;
    let fallbackCand: string | null = null;

    for (const cand of candidates) {
      if (cand === normalizedWord && dictResult) {
        // 원 단어 자체가 candidate — directResult로 이미 확인됨.
        // bestCandResult/fallbackCandResult를 세팅하지 않으므로 foundViaCandidate = false가 되어
        // inflectionNote가 표시되지 않는다 (원 단어가 lemma이므로 올바른 동작).
        resolvedLemma = cand;
        break;
      }
      const res = await lookupWord(cand);
      if (res) {
        const hasVerb = res.meanings?.some(m => m.partOfSpeech.includes('verb'));
        if (hasVerb) {
          bestCandResult = res;
          resolvedLemma = cand;
          break;
        } else if (!fallbackCandResult) {
          fallbackCandResult = res;
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

    // candidate가 사전에서 실제로 확인된 경우에만 lemma/inflectionNote 표시.
    // 확인 실패 시 resolvedLemma가 불완전한 stem("br", "th" 등)이 되므로 표시하지 않는다.
    const foundViaCandidate = !!(bestCandResult || fallbackCandResult);
    const effectiveLemma = foundViaCandidate ? resolvedLemma : normalizedWord;
    const needsLemmaTranslation = effectiveLemma !== normalizedWord;

    // 품사·정의·번역 모두 동일한 meaning 기준으로 선택
    const targetMeaning = isVerbInflection
      ? (dictResult?.meanings?.find(m => m.partOfSpeech === 'verb' || m.partOfSpeech.includes('verb'))
          ?? dictResult?.meanings?.[0])
      : dictResult?.meanings?.[0];
    const targetEnglishDef = targetMeaning?.definitions?.[0]?.definition;

    // 4. 한국어 번역 병렬 요청
    const [rawWordMeaning, rawDef, rawLemmaMeaning] = await Promise.all([
      translateToKorean(normalizedWord),
      targetEnglishDef ? translateToKorean(targetEnglishDef) : Promise.resolve(undefined),
      needsLemmaTranslation ? translateToKorean(effectiveLemma) : Promise.resolve(undefined),
    ]);

    // 번역 결과 정제 (번역기가 원문 그대로 반환한 경우 버림)
    const koreanMeaning = (rawWordMeaning && rawWordMeaning.toLowerCase() !== normalizedWord.toLowerCase())
      ? rawWordMeaning : undefined;

    const lemmaMeaning = (rawLemmaMeaning && rawLemmaMeaning.toLowerCase() !== effectiveLemma.toLowerCase())
      ? rawLemmaMeaning : undefined;

    const koreanDef = (rawDef && rawDef !== targetEnglishDef) ? rawDef : undefined;

    // 활용형 노트
    let inflectionNote: string | undefined;
    if (needsLemmaTranslation) {
      inflectionNote = ruleNote
        ? `${effectiveLemma}의 ${ruleNote}`
        : `${effectiveLemma}의 활용형`;
    }

    const result: WordLookupResult = {
      word: normalizedWord,
      lemma: needsLemmaTranslation ? effectiveLemma : undefined,
      inflectionNote,
      phonetic: dictResult?.phonetic ?? undefined,
      partOfSpeech: targetMeaning?.partOfSpeech ?? (isVerbInflection ? 'verb' : undefined),
      englishDef: targetEnglishDef ?? undefined,
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
