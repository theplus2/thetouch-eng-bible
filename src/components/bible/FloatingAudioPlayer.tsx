"use client";

interface FloatingAudioPlayerProps {
  isPlaying: boolean;
  isPaused: boolean;
  rate: number;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onToggleRate: () => void;
}

/**
 * 스크롤 시에도 화면 하단에 고정되는 오디오 플레이어 컨트롤러.
 * 성경 읽기 중 일시정지, 정지, 속도 조절 기능을 제공.
 */
export default function FloatingAudioPlayer({
  isPlaying,
  isPaused,
  rate,
  onStop,
  onPause,
  onResume,
  onToggleRate,
}: FloatingAudioPlayerProps) {
  if (!isPlaying && !isPaused) return null;

  return (
    <div className="fixed top-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-primary-200 bg-surface-50/95 p-2 shadow-2xl animate-fade-in backdrop-blur-md sm:gap-4 sm:p-3">
      {/* 배속 조절 */}
      <button
        onClick={onToggleRate}
        className="flex h-10 w-12 items-center justify-center rounded-xl bg-surface-100 text-xs font-bold text-surface-600 transition hover:bg-surface-200 active:scale-95"
      >
        {rate}x
      </button>

      <div className="h-8 w-[1px] bg-surface-200" />

      {/* 오디오 컨트롤 그룹 */}
      <div className="flex items-center gap-2">
        {isPaused ? (
          <button
            onClick={onResume}
            className="group flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95"
            title="재생"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        ) : (
          <button
            onClick={onPause}
            className="group flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95"
            title="일시정지"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          </button>
        )}

        <button
          onClick={onStop}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-100 text-primary-600 transition hover:bg-primary-100 active:scale-95"
          title="정지"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M6 6h12v12H6z" />
          </svg>
        </button>
      </div>

      <div className="hidden sm:block pr-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400">
          {isPaused ? "Paused" : "Now Reading"}
        </span>
      </div>
    </div>
  );
}
