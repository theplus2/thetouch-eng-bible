import { getBookName } from "@/lib/bible/constants";

interface RecentLog {
  book: number;
  chapter: number;
  read_at: string;
}

interface RecentActivityProps {
  logs: RecentLog[];
}

/**
 * 최근 읽기 활동 목록.
 */
export default function RecentActivity({ logs }: RecentActivityProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-xl border border-surface-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
        <p className="text-sm font-medium text-surface-600">📋 최근 활동</p>
        <p className="mt-4 text-center text-sm text-surface-400">
          아직 읽은 기록이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
      <p className="mb-4 text-sm font-medium text-surface-600">📋 최근 활동</p>
      <ul className="space-y-3">
        {logs.slice(0, 5).map((log, i) => (
          <li key={i} className="flex items-center justify-between text-sm">
            <span className="text-surface-800">
              {getBookName(log.book)} {log.chapter}장
            </span>
            <span className="text-xs text-surface-400">
              {new Date(log.read_at).toLocaleDateString("ko-KR")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
