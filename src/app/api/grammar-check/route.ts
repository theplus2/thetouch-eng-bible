import { NextRequest, NextResponse } from 'next/server';

/**
 * DeepL Write API 프록시 — 영어 문장 문법/스타일 교정.
 * 무료 플랜(:fx 키) → api-free.deepl.com 사용.
 */
export async function POST(req: NextRequest) {
  let body: { text?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { text } = body;
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json({ error: 'invalid_text' }, { status: 400 });
  }

  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'no_api_key' }, { status: 500 });
  }

  const isFreePlan = apiKey.endsWith(':fx');
  const baseUrl = isFreePlan
    ? 'https://api-free.deepl.com/v2/write'
    : 'https://api.deepl.com/v2/write';

  try {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: [text.trim()],
        target_lang: 'EN',
      }),
    });

    if (res.status === 456) {
      return NextResponse.json({ error: 'quota_exceeded' }, { status: 200 });
    }

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[DeepL Write] status: ${res.status}, body: ${errText}`);
      return NextResponse.json({ error: 'deepl_error' }, { status: 200 });
    }

    const data = await res.json();
    const improvement = data?.improvements?.[0];
    const original: string = improvement?.original ?? text.trim();
    const corrected: string = improvement?.result ?? text.trim();

    return NextResponse.json({
      original,
      corrected,
      hasChanges: original !== corrected,
    });
  } catch (err) {
    console.error('[DeepL Write] Fetch error:', err);
    return NextResponse.json({ error: 'fetch_error' }, { status: 200 });
  }
}
