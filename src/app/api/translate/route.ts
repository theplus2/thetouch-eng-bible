import { NextRequest, NextResponse } from 'next/server';

/**
 * Google Translate 비공식 무료 API 경유 번역 엔드포인트.
 * API 키 불필요. 소규모 트래픽(성경 앱) 수준에서 안정적으로 동작.
 */
export async function POST(req: NextRequest) {
  let body: { text?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ translation: null }, { status: 400 });
  }

  const { text } = body;
  if (!text || typeof text !== 'string') {
    return NextResponse.json({ translation: null }, { status: 400 });
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);

    if (!res.ok) {
      console.error(`[GoogleTranslate] status: ${res.status}`);
      return NextResponse.json({ translation: null });
    }

    const data = await res.json();
    // 응답 형식: [[[번역문, 원문, ...], ...], null, "en", ...]
    const translation: string | null = data?.[0]?.[0]?.[0] ?? null;
    return NextResponse.json({ translation });
  } catch (err) {
    console.error('[GoogleTranslate] Fetch error:', err);
    return NextResponse.json({ translation: null });
  }
}
