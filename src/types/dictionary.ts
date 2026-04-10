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

/** MyMemory Translation API 응답 타입 */
export interface TranslationResponse {
  responseData: {
    translatedText: string;
    match: number;
  };
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
  koreanMeaning?: string;
  /** 한국어 뜻 풀이/정의 */
  koreanDef?: string;
  isProperNoun?: boolean;
}
