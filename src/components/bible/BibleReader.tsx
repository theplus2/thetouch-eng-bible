import type { Chapter, Verse } from "@/types/bible";
import VerseText from "./VerseText";
import { useTTS } from "@/hooks/useTTS";
import { useMemo, useEffect, useCallback } from "react";
import { useWordPanelStore } from "@/stores/wordPanelStore";
import { useWordLookup } from "@/hooks/useWordLookup";
import { useBibleStore } from "@/stores/bibleStore";
import { useJournalStore } from "@/stores/journalStore";
import FloatingAudioPlayer from "./FloatingAudioPlayer";

interface BibleReaderProps {
  bookName: string;
  chapter: Chapter;
}

/**
 * 성경 본문 렌더러.
 * 각 절을 VerseText 컴포넌트로 렌더링.
 */
export default function BibleReader({ bookName, chapter }: BibleReaderProps) {
  const { 
    isPlaying, 
    isPaused, 
    rate, 
    speak, 
    stop, 
    pause, 
    resume, 
    toggleRate, 
    supported 
  } = useTTS();
  
  const { openPanel, openLoading } = useWordPanelStore();
  const { lookup } = useWordLookup();
  const currentPosition = useBibleStore((s) => s.currentPosition);
  const { openSheet } = useJournalStore();

  const handleVersePress = useCallback((verse: Verse) => {
    openSheet({
      book: currentPosition?.book ?? 0,
      chapter: chapter.c,
      verse: verse.v,
      verseText: verse.t,
      bookName,
    });
  }, [openSheet, currentPosition, chapter.c, bookName]);

  const chapterText = useMemo(() => {
    return chapter.verses.map((v) => v.t).join(" ");
  }, [chapter]);

  const handlePlayToggle = () => {
    if (isPlaying) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      speak(chapterText);
    }
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleSelectionChange = () => {
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(async () => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) return;
        
        const text = selection.toString().trim();
        
        // 2단어 이상, 50자 이하인 경우 (단일 단어는 WordToken 클릭으로 처리)
        if (text.includes(" ") && text.length > 3 && text.length <= 50) {
          openLoading();
          
          const result = await lookup(text);
          if (result.koreanMeaning || result.englishDef || result.koreanDef) {
            openPanel(result, {
              book: currentPosition?.book ?? 0,
              chapter: chapter.c,
              verse: 0,
              verseText: text,
            });
          } else {
             useWordPanelStore.getState().closePanel();
          }
          // 모바일 사용자 경험을 위해 선택을 강제로 해제하지 않음
        }
      }, 600); // 드래그가 끝날 때까지 충분히 대기
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      clearTimeout(timeoutId);
    };
  }, [lookup, openPanel, openLoading, currentPosition, chapter.c]);

  return (
    <article className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-surface-800">
          {bookName} {chapter.c}
        </h2>
        
        {/* TTS 컨트롤 */}
        {supported && (
          <div className="flex items-center gap-2">
            <button
              onClick={toggleRate}
              className="rounded-lg bg-surface-100 px-3 py-1.5 text-xs font-medium text-surface-600 transition hover:bg-surface-200"
            >
              속도: {rate}x
            </button>
            <button
              onClick={handlePlayToggle}
              className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold text-white transition ${
                isPlaying && !isPaused ? "bg-accent-600 hover:bg-accent-700" : "bg-primary-600 hover:bg-primary-700"
              }`}
            >
              {isPlaying && !isPaused ? "⏸ 일시정지" : isPaused ? "▶ 계속 읽기" : "▶ 읽기"}
            </button>
            {(isPlaying || isPaused) && (
              <button
                onClick={stop}
                className="rounded-lg bg-red-500 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                ◾ 정지
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-1">
        {chapter.verses.map((verse) => (
          <VerseText
            key={verse.v}
            verse={verse}
            onVersePress={handleVersePress}
          />
        ))}
      </div>

      {/* Floating Player */}
      <FloatingAudioPlayer
        isPlaying={isPlaying}
        isPaused={isPaused}
        rate={rate}
        onStop={stop}
        onPause={pause}
        onResume={resume}
        onToggleRate={toggleRate}
      />
    </article>
  );
}
