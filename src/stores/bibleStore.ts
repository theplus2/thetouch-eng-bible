import { create } from "zustand";
import type { ReadingPosition } from "@/types/bible";

interface BibleState {
  /** 현재 읽고 있는 위치 */
  currentPosition: ReadingPosition | null;
  /** 현재 위치 설정 */
  setPosition: (position: ReadingPosition) => void;
  /** 위치 초기화 */
  clearPosition: () => void;
}

/**
 * 성경 읽기 위치 상태 관리 (Zustand).
 * 현재 읽고 있는 책/장 번호를 전역으로 공유.
 */
export const useBibleStore = create<BibleState>((set) => ({
  currentPosition: null,
  setPosition: (position) => set({ currentPosition: position }),
  clearPosition: () => set({ currentPosition: null }),
}));
