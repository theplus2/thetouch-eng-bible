export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-50">
      {/* 메인 콘텐츠 */}
      <main className="flex-1 pb-16 md:pb-0 md:pl-64">{children}</main>

      {/* 모바일 하단 탭바 */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-surface-200 bg-surface-50/95 backdrop-blur-sm md:hidden">
        <div className="flex items-center justify-around py-2">
          <a href="/home" className="flex flex-col items-center gap-1 px-3 py-1 text-xs text-surface-600 hover:text-primary-600">
            <span className="text-lg">🏠</span>
            <span>홈</span>
          </a>
          <a href="/read" className="flex flex-col items-center gap-1 px-3 py-1 text-xs text-surface-600 hover:text-primary-600">
            <span className="text-lg">📖</span>
            <span>읽기</span>
          </a>
          <a href="/vocabulary" className="flex flex-col items-center gap-1 px-3 py-1 text-xs text-surface-600 hover:text-primary-600">
            <span className="text-lg">📝</span>
            <span>단어장</span>
          </a>
          <a href="/group" className="flex flex-col items-center gap-1 px-3 py-1 text-xs text-surface-600 hover:text-primary-600">
            <span className="text-lg">👥</span>
            <span>청년부</span>
          </a>
        </div>
      </nav>

      {/* PC 사이드바 */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-surface-200 bg-surface-50 md:block">
        <div className="p-6">
          <h2 className="text-lg font-bold text-primary-700">더터치 Bible</h2>
          <p className="mt-0.5 text-xs text-surface-500">영어성경 읽기 플랫폼</p>
        </div>
        <nav className="mt-2 space-y-1 px-3">
          <a href="/home" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-surface-700 hover:bg-primary-100 hover:text-primary-700">
            <span>🏠</span> 홈 (대시보드)
          </a>
          <a href="/read" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-surface-700 hover:bg-primary-100 hover:text-primary-700">
            <span>📖</span> 성경 읽기
          </a>
          <a href="/vocabulary" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-surface-700 hover:bg-primary-100 hover:text-primary-700">
            <span>📝</span> 단어장
          </a>
          <a href="/group" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-surface-700 hover:bg-primary-100 hover:text-primary-700">
            <span>👥</span> 청년부 현황
          </a>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-surface-200 p-3">
          <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-surface-600 hover:bg-surface-100">
            <span>⚙️</span> 설정
          </a>
        </div>
      </aside>
    </div>
  );
}
