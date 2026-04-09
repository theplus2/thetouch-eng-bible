import type { DictionaryEntry } from "@/types/dictionary";

const BASE_URL = "https://api.dictionaryapi.dev/api/v2/entries/en";

/**
 * Free Dictionary API에서 영어 단어 정의 조회.
 * 고유명사 등 찾을 수 없는 단어는 null 반환.
 */
export async function lookupWord(
  word: string
): Promise<DictionaryEntry | null> {
  try {
    const res = await fetch(`${BASE_URL}/${encodeURIComponent(word.toLowerCase())}`);

    if (!res.ok) {
      // 404 = 단어 없음 (고유명사 등)
      return null;
    }

    const data: DictionaryEntry[] = await res.json();
    return data[0] ?? null;
  } catch {
    console.error(`[FreeDictionary] Failed to lookup: ${word}`);
    return null;
  }
}
