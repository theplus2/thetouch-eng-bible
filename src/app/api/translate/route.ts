import { NextRequest, NextResponse } from 'next/server';

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

  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ translation: null }, { status: 500 });
  }

  // DeepL Pro 키는 보통 :fx 접미사가 없습니다.
  const isFreePlan = apiKey.endsWith(':fx');
  const baseUrl = isFreePlan 
    ? 'https://api-free.deepl.com/v2/translate' 
    : 'https://api.deepl.com/v2/translate';

  try {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        text: [text], 
        target_lang: 'KO',
        // 문맥 파악을 위해 소스 언어를 지정하지만, 때로는 누락 데이터 대응을 위해 생략 가능
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[DeepL Error] status: ${res.status}, body: ${errText}`);
      return NextResponse.json({ translation: null });
    }

    const data = await res.json();
    const translation = data.translations?.[0]?.text ?? null;
    return NextResponse.json({ translation });
  } catch (err) {
    console.error(`[DeepL Fetch Error]`, err);
    return NextResponse.json({ translation: null });
  }
}
