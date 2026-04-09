"use client";

import { useEffect, useRef } from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * 하단 슬라이드업 패널 (단어 뜻 표시용).
 * 모바일에서 하단에서 올라오는 시트 UI.
 */
export default function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  // ESC 키로 닫기
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-black/30 animate-fade-in" />

      {/* 시트 */}
      <div
        ref={sheetRef}
        className="relative z-10 w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-2xl animate-slide-up"
        role="dialog"
        aria-modal="true"
      >
        {/* 드래그 핸들 */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-surface-300" />

        {children}
      </div>
    </div>
  );
}
