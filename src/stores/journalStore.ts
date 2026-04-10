import { create } from "zustand";

export interface JournalVerseContext {
  book: number;
  chapter: number;
  verse: number;
  verseText: string;
  bookName: string;
}

interface JournalSheetState {
  isOpen: boolean;
  verseContext: JournalVerseContext | null;
  openSheet: (context: JournalVerseContext) => void;
  closeSheet: () => void;
}

/**
 * 묵상 저널 시트 상태 관리 (Zustand).
 * wordPanelStore 패턴과 동일.
 */
export const useJournalStore = create<JournalSheetState>((set) => ({
  isOpen: false,
  verseContext: null,
  openSheet: (context) => set({ isOpen: true, verseContext: context }),
  closeSheet: () => set({ isOpen: false, verseContext: null }),
}));
