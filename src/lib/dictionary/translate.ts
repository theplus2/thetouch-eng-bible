import type { TranslationResponse } from "@/types/dictionary";

const BASE_URL = "https://api.mymemory.translated.net/get";

/**
 * MyMemory API로 영어 → 한국어 번역.
 * 무료 플랜: 일 5,000자 제한.
 */
export async function translateToKorean(text: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      q: text.toLowerCase(),
      langpair: "en|ko",
    });

    const res = await fetch(`${BASE_URL}?${params.toString()}`);

    if (!res.ok) return null;

    const data: TranslationResponse = await res.json();
    return data.responseData.translatedText || null;
  } catch {
    console.error(`[MyMemory] Failed to translate: ${text}`);
    return null;
  }
}
