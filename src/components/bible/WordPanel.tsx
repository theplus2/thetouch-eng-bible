"use client";

import { useState } from "react";
import { useWordPanelStore } from "@/stores/wordPanelStore";
import { useVocabulary } from "@/hooks/useVocabulary";
import BottomSheet from "@/components/ui/BottomSheet";
import Button from "@/components/ui/Button";

/**
 * 단어 뜻 슬라이드업 패널.
 * PRD 8.3 WordPanel UI 구조 구현.
 */
export default function WordPanel() {
  const { isOpen, currentWord, verseContext, isLoading, closePanel } =
    useWordPanelStore();
  const { saveWord } = useVocabulary();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!currentWord || saved) return;
    setSaving(true);
    await saveWord({
      word: currentWord.word,
      koreanMeaning: currentWord.koreanMeaning,
      englishDef: currentWord.englishDef,
      partOfSpeech: currentWord.partOfSpeech,
      book: verseContext?.book,
      chapter: verseContext?.chapter,
      verse: verseContext?.verse,
      verseText: verseContext?.verseText,
    });
    setSaved(true);
    setSaving(false);
  };

  const handleClose = () => {
    setSaved(false);
    closePanel();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose}>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
          <span className="ml-3 text-sm text-surface-600">단어 검색 중...</span>
        </div>
      ) : currentWord ? (
        <div className="space-y-4">
          {/* 단어 + 발음 + 품사 */}
          <div>
            <h3 className="text-xl font-bold text-surface-900">
              {currentWord.word}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {currentWord.phonetic && (
                <span className="text-sm text-surface-500">{currentWord.phonetic}</span>
              )}
              {currentWord.partOfSpeech && (
                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                  {currentWord.partOfSpeech}
                </span>
              )}
              {currentWord.inflectionNote && (
                <span className="rounded-full bg-surface-100 px-2 py-0.5 text-xs text-surface-500">
                  {currentWord.inflectionNote}
                </span>
              )}
            </div>
          </div>

          <hr className="border-surface-200" />

          {/* 한글 뜻 */}
          {currentWord.koreanMeaning && (
            <div>
              <span className="mr-2">🇰🇷</span>
              <span className="text-surface-800">{currentWord.koreanMeaning}</span>
            </div>
          )}

          {/* 영어 정의 */}
          {currentWord.englishDef && (
            <p className="text-sm text-surface-600">{currentWord.englishDef}</p>
          )}

          {/* 고유명사 fallback */}
          {currentWord.isProperNoun && !currentWord.englishDef && (
            <p className="text-sm italic text-surface-500">
              성경 고유명사입니다.
            </p>
          )}

          <hr className="border-surface-200" />

          {/* 출처 절 */}
          {verseContext && (
            <p className="text-xs text-surface-500">
              {verseContext.book}:{verseContext.chapter}:{verseContext.verse}
            </p>
          )}

          {/* 액션 버튼 */}
          <div className="flex gap-3">
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              onClick={handleSave}
              disabled={saved || saving}
            >
              {saved ? "✓ 저장됨" : saving ? "저장 중..." : "단어장에 저장"}
            </Button>
            <Button variant="ghost" size="md" onClick={handleClose}>
              닫기
            </Button>
          </div>
        </div>
      ) : null}
    </BottomSheet>
  );
}
