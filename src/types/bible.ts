// ===== 성경 인덱스 =====

/** 책 메타데이터 */
export interface BookMeta {
  book: number;       // 1-66
  name: string;       // "Genesis"
  abbr: string;       // "Gen"
  chapters: number;   // 장 수
  verses: number;     // 총 절 수
}

/** 성경 인덱스 (bible_index.json) */
export interface BibleIndex {
  translation: string;
  fullName: string;
  license: string;
  totalVerses: number;
  books: BookMeta[];
}

// ===== 성경 본문 =====

/** 절 */
export interface Verse {
  v: number;          // 절 번호
  t: string;          // 본문 텍스트 (줄바꿈 \n 포함 가능)
  fn?: string;        // 각주 (옵션)
}

/** 장 */
export interface Chapter {
  c: number;          // 장 번호
  verses: Verse[];
}

/** 책 데이터 (bible_book_XX.json) */
export interface BibleBook {
  book: number;
  name: string;
  abbr: string;
  chapters: Chapter[];
}

// ===== 토큰 =====

/** 단어 토큰 타입 */
export type TokenType = "word" | "punct" | "space" | "newline";

/** 토큰 */
export interface Token {
  type: TokenType;
  value: string;
}

// ===== 읽기 위치 =====

/** 현재 읽기 위치 */
export interface ReadingPosition {
  book: number;
  chapter: number;
}
