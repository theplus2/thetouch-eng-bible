/**
 * 영어 단어 → 한국어 번역.
 * Google Translate 비공식 무료 API 경유 (/api/translate 서버 라우트).
 * API 키 불필요, 소규모 트래픽에 적합.
 */
export async function translateToKorean(text: string): Promise<string | null> {
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.toLowerCase().trim() }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.translation ?? null;
  } catch {
    return null;
  }
}
