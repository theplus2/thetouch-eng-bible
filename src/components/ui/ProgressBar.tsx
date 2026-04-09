interface ProgressBarProps {
  /** 0~100 사이의 진행률 */
  value: number;
  /** 바 높이 */
  size?: "sm" | "md" | "lg";
  /** 색상 변형 */
  variant?: "primary" | "accent" | "success";
  /** 라벨 표시 여부 */
  showLabel?: boolean;
  className?: string;
}

const heights = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

const colors = {
  primary: "bg-primary-500",
  accent: "bg-accent-500",
  success: "bg-emerald-500",
};

export default function ProgressBar({
  value,
  size = "md",
  variant = "primary",
  showLabel = false,
  className = "",
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="mb-1 flex justify-between text-xs text-surface-600">
          <span>진행률</span>
          <span>{Math.round(clampedValue)}%</span>
        </div>
      )}
      <div
        className={`w-full overflow-hidden rounded-full bg-surface-200 ${heights[size]}`}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`${heights[size]} rounded-full transition-all duration-500 ease-out ${colors[variant]}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
