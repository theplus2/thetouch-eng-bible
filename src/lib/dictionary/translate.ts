import type { TranslationResponse } from "@/types/dictionary";

const BASE_URL = "https://api.mymemory.translated.net/get";

/** 한글 유니코드 포함 여부 — 번역 실패 감지용 */
function containsKorean(text: string): boolean {
  return /[\uAC00-\uD7AF\u3131-\u314E\u314F-\u3163]/.test(text);
}

/**
 * MyMemory API로 영어 → 한국어 번역.
 * 무료 플랜: 일 5,000자 제한.
 * 한글이 포함되지 않은 응답(번역 실패)은 null 반환.
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
    const translated = data.responseData.translatedText;

    // 한글이 없으면 번역 실패로 간주 (예: "PLUCKED!" 같은 garbage 반환 방지)
    if (!translated || !containsKorean(translated)) return null;

    return translated;
  } catch {
    console.error(`[MyMemory] Failed to translate: ${text}`);
    return null;
  }
}
