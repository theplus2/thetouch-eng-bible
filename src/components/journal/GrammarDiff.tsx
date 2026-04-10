"use client";

interface GrammarDiffProps {
  original: string;
  corrected: string;
}

/**
 * 원문 vs 교정문 단어 단위 diff 렌더러.
 * 삭제된 단어: 빨간 취소선 / 추가된 단어: 초록 강조.
 * 외부 라이브러리 없이 직접 구현.
 */
export default function GrammarDiff({ original, corrected }: GrammarDiffProps) {
  const tokens = computeDiff(original.trim(), corrected.trim());

  return (
    <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm leading-relaxed">
      {tokens.map((tok, i) => {
        if (tok.type === "same") {
          return <span key={i} className="text-surface-700">{tok.value} </span>;
        }
        if (tok.type === "removed") {
          return (
            <span key={i} className="line-through text-red-400 mr-0.5">
              {tok.value}{" "}
            </span>
          );
        }
        // added
        return (
          <span key={i} className="font-medium text-green-600 mr-0.5">
            {tok.value}{" "}
          </span>
        );
      })}
    </div>
  );
}

type DiffToken =
  | { type: "same"; value: string }
  | { type: "removed"; value: string }
  | { type: "added"; value: string };

/**
 * 단어 단위 LCS diff.
 * 두 문자열을 단어 배열로 분리 후 LCS 기반으로 diff 생성.
 */
function computeDiff(a: string, b: string): DiffToken[] {
  const aWords = a.split(/\s+/);
  const bWords = b.split(/\s+/);
  const m = aWords.length;
  const n = bWords.length;

  // LCS DP 테이블
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (aWords[i - 1].toLowerCase() === bWords[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // 역추적
  const tokens: DiffToken[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && aWords[i - 1].toLowerCase() === bWords[j - 1].toLowerCase()) {
      tokens.unshift({ type: "same", value: bWords[j - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      tokens.unshift({ type: "added", value: bWords[j - 1] });
      j--;
    } else {
      tokens.unshift({ type: "removed", value: aWords[i - 1] });
      i--;
    }
  }
  return tokens;
}
