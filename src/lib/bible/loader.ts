import type { BibleIndex, BibleBook } from "@/types/bible";

/**
 * 성경 인덱스 로드 (책 목록 + 메타데이터)
 */
export async function loadBibleIndex(): Promise<BibleIndex> {
  const res = await fetch("/bible/bible_index.json");
  if (!res.ok) throw new Error("Failed to load bible index");
  return res.json();
}

/**
 * 특정 책 데이터 로드 (레이지 로딩)
 * @param bookNumber - 1~66
 */
export async function loadBibleBook(bookNumber: number): Promise<BibleBook> {
  const paddedNum = String(bookNumber).padStart(2, "0");
  const res = await fetch(`/bible/bible_book_${paddedNum}.json`);
  if (!res.ok) throw new Error(`Failed to load book ${bookNumber}`);
  return res.json();
}
