interface LearningHeatmapProps {
  activityMap: Record<string, number>;
  weeks?: number;
}

function toLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getCellColor(count: number, isFuture: boolean): string {
  if (isFuture) return "bg-transparent border border-transparent";
  if (count === 0) return "bg-surface-100";
  if (count <= 2) return "bg-green-200";
  if (count <= 5) return "bg-green-400";
  if (count <= 9) return "bg-green-600";
  return "bg-green-700";
}

export default function LearningHeatmap({ activityMap, weeks = 17 }: LearningHeatmapProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 시작일: weeks주 전 일요일
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (weeks * 7 - 1));

  // 날짜 배열 생성
  const allDays: Date[] = Array.from({ length: weeks * 7 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    return d;
  });

  // 주(열) 단위로 묶기
  const weekCols: Date[][] = Array.from({ length: weeks }, (_, w) =>
    allDays.slice(w * 7, (w + 1) * 7)
  );

  // 월 레이블 (각 월의 첫 번째 셀에만 표시)
  const monthLabels: Array<{ label: string; colIndex: number }> = [];
  weekCols.forEach((week, colIdx) => {
    const first = week[0];
    if (first.getDate() <= 7) {
      const label = `${first.getMonth() + 1}월`;
      if (!monthLabels.find((m) => m.label === label)) {
        monthLabels.push({ label, colIndex: colIdx });
      }
    }
  });

  const CELL = 12; // px
  const GAP = 2;   // px
  const STEP = CELL + GAP;

  return (
    <div className="overflow-x-auto pb-1">
      <div style={{ minWidth: `${weeks * STEP + 24}px` }}>
        {/* 월 레이블 */}
        <div className="relative mb-1 ml-6 h-4">
          {monthLabels.map(({ label, colIndex }) => (
            <span
              key={label}
              className="absolute text-[10px] leading-4 text-surface-400"
              style={{ left: `${colIndex * STEP}px` }}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="flex gap-[2px]">
          {/* 요일 레이블 */}
          <div className="mr-1 flex flex-col gap-[2px]">
            {["일", "월", "화", "수", "목", "금", "토"].map((day, i) => (
              <div
                key={i}
                className="flex items-center justify-center text-surface-400"
                style={{ height: `${CELL}px`, width: "16px", fontSize: "9px", opacity: i % 2 === 1 ? 1 : 0 }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 잔디 그리드 */}
          {weekCols.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[2px]">
              {week.map((day, di) => {
                const key = toLocalDateKey(day);
                const count = activityMap[key] ?? 0;
                const isFuture = day > today;
                return (
                  <div
                    key={di}
                    title={isFuture ? "" : `${key.replace(/-/g, ".")} · ${count > 0 ? `${count}개 활동` : "활동 없음"}`}
                    className={`rounded-[2px] ${getCellColor(count, isFuture)}`}
                    style={{ width: `${CELL}px`, height: `${CELL}px` }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* 범례 */}
        <div className="mt-2 flex items-center justify-end gap-1">
          <span className="text-[10px] text-surface-400">적음</span>
          {(["bg-surface-100", "bg-green-200", "bg-green-400", "bg-green-600", "bg-green-700"] as const).map(
            (cls, i) => (
              <div
                key={i}
                className={`rounded-[2px] ${cls}`}
                style={{ width: `${CELL}px`, height: `${CELL}px` }}
              />
            )
          )}
          <span className="text-[10px] text-surface-400">많음</span>
        </div>
      </div>
    </div>
  );
}
