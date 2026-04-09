interface AvatarProps {
  /** 닉네임 (이니셜 표시용) */
  nickname: string;
  /** 이미지 URL */
  avatarUrl?: string | null;
  /** 크기 */
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

/** 닉네임에서 배경색 결정 (일관된 색상) */
function getColorFromName(name: string): string {
  const colors = [
    "bg-primary-500", "bg-accent-500", "bg-emerald-500",
    "bg-violet-500", "bg-rose-500", "bg-cyan-500",
    "bg-amber-500", "bg-sky-500",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export default function Avatar({
  nickname,
  avatarUrl,
  size = "md",
  className = "",
}: AvatarProps) {
  const initial = nickname.charAt(0).toUpperCase();

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={nickname}
        className={`rounded-full object-cover ${sizes[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full font-semibold text-white ${getColorFromName(nickname)} ${sizes[size]} ${className}`}
      title={nickname}
    >
      {initial}
    </div>
  );
}
