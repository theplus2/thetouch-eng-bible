import { NextRequest, NextResponse } from 'next/server';

const WORD_PATTERN = /^[a-zA-Z'\- ]{1,64}$/;

export async function POST(req: NextRequest) {
  let body: { text?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ translation: null }, { status: 400 });
  }

  const { text } = body;
  if (!text || typeof text !== 'string' || !WORD_PATTERN.test(text)) {
    return NextResponse.json({ translation: null }, { status: 400 });
  }

  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ translation: null }, { status: 500 });
  }

  try {
    const res = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: [text], target_lang: 'KO', source_lang: 'EN' }),
    });

    if (!res.ok) return NextResponse.json({ translation: null });

    const data = await res.json();
    const translation = data.translations?.[0]?.text ?? null;
    return NextResponse.json({ translation });
  } catch {
    return NextResponse.json({ translation: null });
  }
}
