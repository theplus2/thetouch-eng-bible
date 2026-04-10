"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * 루트 경로 — 크롤러(카카오봇 등)는 이 HTML + OG 태그를 읽고,
 * 실제 사용자는 JS useEffect로 /home 으로 이동.
 * server redirect()를 쓰면 HTTP 308만 반환되어 OG 태그가 전달되지 않음.
 */
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/home");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-surface-50">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
    </div>
  );
}
