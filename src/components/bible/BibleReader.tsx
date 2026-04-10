import type { Chapter } from "@/types/bible";
import VerseText from "./VerseText";
import { useTTS } from "@/hooks/useTTS";
import { useMemo } from "react";
import { useWordPanelStore } from "@/stores/wordPanelStore";
import { useWordLookup } from "@/hooks/useWordLookup";
import { useBibleStore } from "@/stores/bibleStore";

interface BibleReaderProps {
  bookName: string;
  chapter: Chapter;
}

/**
 * 성경 본문 렌더러.
 * 각 절을 VerseText 컴포넌트로 렌더링.
 */
export default function BibleReader({ bookName, chapter }: BibleReaderProps) {
  const { isPlaying, rate, speak, stop, toggleRate, supported } = useTTS();
  const { openPanel, openLoading } = useWordPanelStore();
  const { lookup } = useWordLookup();
  const currentPosition = useBibleStore((s) => s.currentPosition);

  const chapterText = useMemo(() => {
    return chapter.verses.map((v) => v.t).join(" ");
  }, [chapter]);

  const handlePlayToggle = () => {
    if (isPlaying) {
      stop();
    } else {
      speak(chapterText);
    }
  };

  const handleSelection = async () => {
    const selection = window.getSelection();
    if (!selection) return;
    
    const text = selection.toString().trim();
    // 2단어 이상, 50자 이하인 경우 (너무 긴 문장 제외)
    if (text.includes(" ") && text.length > 3 && text.length <= 50) {
      openLoading();
      
      // 검색 시도
      const result = await lookup(text);
      if (result.koreanMeaning || result.englishDef || result.koreanDef) {
        openPanel(result, {
          book: currentPosition?.book ?? 0,
          chapter: chapter.c,
          verse: 0, // 여러 절에 걸칠 수 있으므로 0으로 처리하거나 생략
          verseText: text,
        });
      } else {
         // 번역 결과가 없으면 패널 닫기 (또는 띄우지 않기)
         useWordPanelStore.getState().closePanel();
      }
      
      // 선택 영역 해제 (옵션)
      selection.removeAllRanges();
    }
  };

  return (
    <article 
      className="mx-auto max-w-2xl px-4 py-6"
      onMouseUp={handleSelection}
      onTouchEnd={handleSelection}
    >
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
                isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-primary-600 hover:bg-primary-700"
              }`}
            >
              {isPlaying ? "◾ 중지" : "▶ 읽기"}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-1">
        {chapter.verses.map((verse) => (
          <VerseText
            key={verse.v}
            verse={verse}
          />
        ))}
      </div>
    </article>
  );
}
