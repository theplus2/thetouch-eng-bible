/** Free Dictionary API 응답 타입 */

export interface DictionaryPhonetic {
  text?: string;
  audio?: string;
}

export interface DictionaryDefinition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

export interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: DictionaryDefinition[];
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics?: DictionaryPhonetic[];
  meanings: DictionaryMeaning[];
}

/** 단어 뜻 통합 타입 */
export interface WordMeaning {
  partOfSpeech: string;
  definition: string;
  koreanMeaning?: string | null;
  koreanDef?: string | null;
}

/** 단어 조회 결과 (캐시용 통합 타입) */
export interface WordLookupResult {
  word: string;
  /** 사전에서 조회한 원형 (plucked → pluck) */
  lemma?: string;
  /** 활용형 설명 (예: "pluck의 과거형") */
  inflectionNote?: string;
  phonetic?: string;
  partOfSpeech?: string;
  englishDef?: string;
  koreanMeaning?: string | null;
  /** 한국어 뜻 풀이/정의 */
  koreanDef?: string | null;
  /** 원형(Lemma)의 한국어 뜻 */
  lemmaMeaning?: string | null;
  isProperNoun?: boolean;
  /** 전체 뜻 목록 */
  allMeanings?: WordMeaning[];
}
