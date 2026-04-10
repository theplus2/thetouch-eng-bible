import { NextRequest, NextResponse } from 'next/server';

/**
 * LanguageTool 공개 API 프록시 — 영어 문법 교정.
 * API 키 불필요. https://api.languagetool.org/v2/check
 *
 * DeepL Write API는 무료 플랜 미지원 → LanguageTool로 대체.
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

  const original = text.trim();

  try {
    const params = new URLSearchParams({
      text: original,
      language: 'en-US',
    });

    const res = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!res.ok) {
      console.error(`[LanguageTool] status: ${res.status}`);
      return NextResponse.json({ error: 'lt_error' }, { status: 200 });
    }

    const data = await res.json();
    const matches: Array<{
      offset: number;
      length: number;
      replacements: Array<{ value: string }>;
    }> = data.matches ?? [];

    // offset 역순으로 정렬 후 교정 적용 (앞에서 수정하면 뒤 offset이 틀어짐)
    let corrected = original;
    const sorted = [...matches]
      .filter((m) => m.replacements.length > 0)
      .sort((a, b) => b.offset - a.offset);

    for (const match of sorted) {
      const replacement = match.replacements[0].value;
      corrected =
        corrected.slice(0, match.offset) +
        replacement +
        corrected.slice(match.offset + match.length);
    }

    return NextResponse.json({
      original,
      corrected,
      hasChanges: corrected !== original,
    });
  } catch (err) {
    console.error('[LanguageTool] Fetch error:', err);
    return NextResponse.json({ error: 'fetch_error' }, { status: 200 });
  }
}
