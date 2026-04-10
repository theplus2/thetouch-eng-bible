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
    
    // 긴 번역결과가 koreanMeaning으로 들어가지 않고 koreanDef로 들어갈 때 보정
    const korean = currentWord.koreanMeaning || currentWord.koreanDef;
    
    const result = await saveWord({
      word: currentWord.word,
      koreanMeaning: korean,
      englishDef: currentWord.englishDef,
      partOfSpeech: currentWord.partOfSpeech,
      book: verseContext?.book,
      chapter: verseContext?.chapter,
      verse: verseContext?.verse,
      verseText: verseContext?.verseText,
    });
    
    if (result) {
      setSaved(true);
    } else {
      alert("데이터베이스에 단어를 추가하는 데 실패했습니다. SQL 쿼리가 정상적으로 실행되었는지 확인해 주세요.");
    }
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

          {/* 원형 정보 (활용형일 때만 표시) */}
          {currentWord.lemma && (
            <div className="rounded-xl border border-primary-100 bg-primary-50/50 p-3">
              <div className="flex items-center gap-2">
                <span className="rounded bg-primary-600 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">
                  Root
                </span>
                <span className="text-sm font-bold text-surface-900">
                  {currentWord.lemma}
                </span>
                {currentWord.lemmaMeaning && (
                  <span className="text-xs text-primary-700">
                    ({currentWord.lemmaMeaning})
                  </span>
                )}
              </div>
              {currentWord.inflectionNote && (
                <p className="mt-1 text-[11px] text-surface-500">
                  {currentWord.inflectionNote}
                </p>
              )}
            </div>
          )}

          {/* 뜻 목록 (복수 정의 지원) */}
          {currentWord.allMeanings && currentWord.allMeanings.length > 0 ? (
            <div className="space-y-4">
              {currentWord.allMeanings.map((m, idx) => (
                <div key={idx} className="group rounded-xl border border-surface-100 bg-surface-50/50 p-3 transition hover:border-primary-100 hover:bg-white shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-primary-100 px-1.5 py-0.5 text-[10px] font-bold text-primary-700 uppercase">
                          {m.partOfSpeech}
                        </span>
                        {m.koreanDef && (
                          <span className="text-base font-bold text-surface-900 group-hover:text-primary-700 transition-colors">
                            {m.koreanDef}
                          </span>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed text-surface-500">
                        {m.definition}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Fallback: 기존 단일 뜻 노출 방식 */}
              {(currentWord.koreanMeaning || currentWord.koreanDef) && (
                <div className="space-y-2">
                  {currentWord.koreanMeaning && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🇰🇷</span>
                      <span className="text-lg font-bold text-surface-900">
                        {currentWord.koreanMeaning}
                      </span>
                    </div>
                  )}
                  {currentWord.koreanDef && (
                    <p className="rounded-lg border border-surface-100 bg-surface-50 p-3 text-sm italic leading-relaxed text-surface-700">
                      &quot;{currentWord.koreanDef}&quot;
                    </p>
                  )}
                </div>
              )}

              {currentWord.englishDef && (
                <p className="font-serif text-xs leading-tight text-surface-400">
                  Definition: {currentWord.englishDef}
                </p>
              )}
            </>
          )}

          {/* 고유명사 fallback */}
          {currentWord.isProperNoun && !currentWord.englishDef && !currentWord.koreanMeaning && !currentWord.lemmaMeaning && (
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
