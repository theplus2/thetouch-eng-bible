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

  // 배경 스크롤 잠금
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/30 animate-fade-in" 
        onClick={onClose}
      />

      {/* 시트 */}
      <div
        ref={sheetRef}
        className="relative z-10 flex w-full max-w-lg max-h-[85vh] flex-col rounded-t-2xl bg-surface-50 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl animate-slide-up"
        role="dialog"
        aria-modal="true"
      >
        {/* 드래그 핸들 */}
        <div className="mx-auto mb-4 h-1 w-10 shrink-0 rounded-full bg-surface-300" />

        {/* 내부 콘텐츠 (스크롤 영역) */}
        <div className="overflow-y-auto overscroll-contain pb-2">
          {children}
        </div>
      </div>
    </div>
  );
}
