"use client";

import { useState, useCallback } from "react";
import BottomSheet from "@/components/ui/BottomSheet";
import Button from "@/components/ui/Button";
import GrammarDiff from "./GrammarDiff";
import { useJournalStore } from "@/stores/journalStore";
import { useJournal } from "@/hooks/useJournal";
import type { GrammarCheckResult } from "@/types/journal";

type SheetPhase = "writing" | "checking" | "reviewed";

/**
 * 묵상 저널 입력 시트.
 * writing → checking → reviewed 3단계 흐름.
 */
export default function JournalSheet() {
  const { isOpen, verseContext, closeSheet } = useJournalStore();
  const { saveJournal } = useJournal();

  const [phase, setPhase] = useState<SheetPhase>("writing");
  const [body, setBody] = useState("");
  const [grammarResult, setGrammarResult] = useState<GrammarCheckResult | null>(null);
  const [grammarError, setGrammarError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleClose = useCallback(() => {
    setPhase("writing");
    setBody("");
    setGrammarResult(null);
    setGrammarError(null);
    setSaved(false);
    closeSheet();
  }, [closeSheet]);

  const handleGrammarCheck = async () => {
    if (body.trim().length < 5) return;
    setPhase("checking");
    setGrammarError(null);

    try {
      const res = await fetch("/api/grammar-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: body.trim() }),
      });
      const data = await res.json();

      if (data.error) {
        const msg =
          data.error === "quota_exceeded"
            ? "DeepL 무료 쿼터를 초과했습니다."
            : "문법 검사 중 오류가 발생했습니다.";
        setGrammarError(msg);
        setPhase("writing");
        return;
      }

      setGrammarResult(data as GrammarCheckResult);
      setPhase("reviewed");
    } catch {
      setGrammarError("네트워크 오류가 발생했습니다.");
      setPhase("writing");
    }
  };

  const handleApplyCorrection = () => {
    if (grammarResult) setBody(grammarResult.corrected);
  };

  const handleSave = async (appliedCorrection: boolean) => {
    if (!verseContext || saving) return;
    setSaving(true);

    const result = await saveJournal({
      book: verseContext.book,
      chapter: verseContext.chapter,
      verse: verseContext.verse,
      verseText: verseContext.verseText,
      body: appliedCorrection && grammarResult ? grammarResult.corrected : body.trim(),
      correctedBody: grammarResult?.corrected ?? undefined,
      correctionApplied: appliedCorrection,
    });

    setSaving(false);
    if (result) {
      setSaved(true);
      setTimeout(handleClose, 800);
    }
  };

  if (!verseContext) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose}>
      <div className="space-y-4">
        {/* 구절 헤더 */}
        <div className="rounded-lg border border-primary-100 bg-primary-50/50 p-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-primary-500">
            {verseContext.bookName} {verseContext.chapter}:{verseContext.verse}
          </p>
          <p className="text-sm leading-relaxed text-surface-700 italic">
            &ldquo;{verseContext.verseText}&rdquo;
          </p>
        </div>

        <hr className="border-surface-200" />

        {/* 글쓰기 영역 */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-surface-500">
            오늘의 묵상 (영어로 작성)
          </label>
          <textarea
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              // 내용 변경 시 이전 검사 결과 초기화
              if (phase === "reviewed") {
                setPhase("writing");
                setGrammarResult(null);
              }
            }}
            disabled={phase === "checking" || saved}
            placeholder="Write your reflection in English..."
            rows={5}
            className="w-full resize-none rounded-lg border border-surface-200 bg-white p-3 text-sm text-surface-800 placeholder-surface-400 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200 disabled:opacity-60"
          />
          <p className="mt-1 text-right text-xs text-surface-400">{body.length}자</p>
        </div>

        {/* 오류 메시지 */}
        {grammarError && (
          <p className="text-xs text-red-500">{grammarError}</p>
        )}

        {/* 문법 검사 결과 */}
        {phase === "reviewed" && grammarResult && (
          <div className="space-y-2">
            {grammarResult.hasChanges ? (
              <>
                <p className="text-xs font-medium text-surface-600">교정 결과</p>
                <GrammarDiff
                  original={grammarResult.original}
                  corrected={grammarResult.corrected}
                />
                <button
                  onClick={handleApplyCorrection}
                  className="text-xs text-primary-600 underline hover:text-primary-800"
                >
                  교정문을 편집창에 붙여넣기
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                <span className="text-green-600">✓</span>
                <span className="text-sm text-green-700">문법 오류가 없습니다!</span>
              </div>
            )}
          </div>
        )}

        <hr className="border-surface-200" />

        {/* 액션 버튼 */}
        {saved ? (
          <p className="text-center text-sm font-medium text-green-600">✓ 저장됐습니다</p>
        ) : phase === "writing" ? (
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              onClick={handleGrammarCheck}
              disabled={body.trim().length < 5}
            >
              문법 검사
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => handleSave(false)}
              disabled={body.trim().length === 0 || saving}
            >
              {saving ? "저장 중..." : "바로 저장"}
            </Button>
          </div>
        ) : phase === "checking" ? (
          <div className="flex items-center justify-center gap-2 py-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
            <span className="text-sm text-surface-500">DeepL 검사 중...</span>
          </div>
        ) : (
          // reviewed
          <div className="flex gap-2">
            {grammarResult?.hasChanges ? (
              <>
                <Button
                  variant="primary"
                  size="md"
                  className="flex-1"
                  onClick={() => handleSave(true)}
                  disabled={saving}
                >
                  {saving ? "저장 중..." : "교정 반영하여 저장"}
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => handleSave(false)}
                  disabled={saving}
                >
                  원문 저장
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={() => handleSave(false)}
                disabled={saving}
              >
                {saving ? "저장 중..." : "저장"}
              </Button>
            )}
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
