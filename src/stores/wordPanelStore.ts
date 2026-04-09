import { create } from "zustand";
import type { WordLookupResult } from "@/types/dictionary";

interface WordPanelState {
  /** 패널 열림/닫힘 */
  isOpen: boolean;
  /** 현재 표시 중인 단어 정보 */
  currentWord: WordLookupResult | null;
  /** 현재 단어가 포함된 절 정보 */
  verseContext: {
    book: number;
    chapter: number;
    verse: number;
    verseText: string;
  } | null;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 패널 열기 (단어 정보 세팅) */
  openPanel: (word: WordLookupResult, context?: WordPanelState["verseContext"]) => void;
  /** 패널 닫기 */
  closePanel: () => void;
  /** 로딩 상태로 패널 열기 */
  openLoading: () => void;
}

/**
 * 단어 뜻 슬라이드업 패널 상태 관리 (Zustand).
 */
export const useWordPanelStore = create<WordPanelState>((set) => ({
  isOpen: false,
  currentWord: null,
  verseContext: null,
  isLoading: false,
  openPanel: (word, context = null) =>
    set({
      isOpen: true,
      currentWord: word,
      verseContext: context,
      isLoading: false,
    }),
  closePanel: () =>
    set({
      isOpen: false,
      currentWord: null,
      verseContext: null,
      isLoading: false,
    }),
  openLoading: () =>
    set({
      isOpen: true,
      currentWord: null,
      verseContext: null,
      isLoading: true,
    }),
}));
