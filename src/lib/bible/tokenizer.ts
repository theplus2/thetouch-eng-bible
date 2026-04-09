import type { Token } from "@/types/bible";

/**
 * 성경 절 텍스트를 토큰으로 분리.
 * - 단어(word): 영문자 + 하이픈 + 아포스트로피
 * - 구두점(punct): 쉼표, 마침표, 세미콜론 등
 * - 공백(space): 스페이스
 * - 줄바꿈(newline): \n
 */
export function tokenizeVerse(text: string): Token[] {
  const tokens: Token[] = [];
  // 단어 | 줄바꿈 | 공백 | 구두점 패턴
  const regex = /([a-zA-Z'-]+)|(\n)|( +)|([^\sa-zA-Z'-]+)/g;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      tokens.push({ type: "word", value: match[1] });
    } else if (match[2]) {
      tokens.push({ type: "newline", value: match[2] });
    } else if (match[3]) {
      tokens.push({ type: "space", value: match[3] });
    } else if (match[4]) {
      tokens.push({ type: "punct", value: match[4] });
    }
  }

  return tokens;
}
