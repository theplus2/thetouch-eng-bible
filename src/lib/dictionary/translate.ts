import { lookupLocal } from './localDictionary';

/**
 * 영어 단어 → 한국어 번역.
 * 1순위: 오프라인 로컬 사전 (web-dictionary.json, 0ms)
 * 2순위: /api/translate 경유 DeepL API (로컬에 없는 단어 폴백)
 */
export async function translateToKorean(text: string): Promise<string | null> {
  const word = text.toLowerCase().trim();

  // 1. 로컬 사전 우선
  const local = await lookupLocal(word);
  if (local) return local;

  // 2. DeepL 폴백 (서버 API Route 경유)
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: word }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.translation ?? null;
  } catch {
    return null;
  }
}
