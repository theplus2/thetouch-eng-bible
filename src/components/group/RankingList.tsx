import Avatar from "@/components/ui/Avatar";

interface RankingMember {
  nickname: string;
  avatar_url?: string | null;
  chapters_read: number;
}

interface RankingListProps {
  members: RankingMember[];
}

/**
 * 멤버별 읽은 장 수 랭킹 리스트.
 */
export default function RankingList({ members }: RankingListProps) {
  const sorted = [...members].sort((a, b) => b.chapters_read - a.chapters_read);

  return (
    <div className="rounded-xl border border-surface-200 bg-white shadow-sm">
      <div className="border-b border-surface-200 px-6 py-4">
        <h3 className="font-semibold text-surface-800">🏆 읽기 랭킹</h3>
      </div>
      <ul className="divide-y divide-surface-100">
        {sorted.map((member, index) => (
          <li key={member.nickname} className="flex items-center gap-4 px-6 py-3">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              index === 0 ? "bg-yellow-100 text-yellow-700" :
              index === 1 ? "bg-surface-200 text-surface-600" :
              index === 2 ? "bg-amber-100 text-amber-700" :
              "text-surface-400"
            }`}>
              {index + 1}
            </span>
            <Avatar nickname={member.nickname} avatarUrl={member.avatar_url} size="sm" />
            <span className="flex-1 text-sm font-medium text-surface-800">
              {member.nickname}
            </span>
            <span className="text-sm font-semibold text-primary-600">
              {member.chapters_read}장
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
