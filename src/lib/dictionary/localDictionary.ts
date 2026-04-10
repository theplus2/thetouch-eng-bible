/** 오프라인 성경 사전 — 모듈 레벨 싱글턴으로 web-dictionary.json을 로드 */

let cache: Record<string, string> | null = null;
let loadPromise: Promise<Record<string, string>> | null = null;

async function loadDictionary(): Promise<Record<string, string>> {
  if (cache) return cache;
  if (loadPromise) return loadPromise;

  loadPromise = fetch('/dictionary/web-dictionary.json')
    .then(res => res.json())
    .then(data => {
      cache = data as Record<string, string>;
      return cache;
    })
    .catch(err => {
      // 실패 시 loadPromise 초기화 → 다음 호출에서 재시도 가능
      loadPromise = null;
      throw err;
    });

  return loadPromise;
}

export async function lookupLocal(word: string): Promise<string | null> {
  try {
    const dict = await loadDictionary();
    return dict[word.toLowerCase()] ?? null;
  } catch {
    return null;
  }
}
