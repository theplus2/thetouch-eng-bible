"use client";

import { useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type ReadingLogInsert = Database["public"]["Tables"]["reading_log"]["Insert"];

/**
 * 읽기 기록 CRUD 훅.
 * reading_log 테이블에 장 단위로 읽기 완료를 기록.
 */
export function useReadingLog() {
  const supabase = createClient();

  /** 장 읽기 완료 기록 */
  const markChapterRead = useCallback(
    async (book: number, chapter: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const row: ReadingLogInsert = { user_id: user.id, book, chapter };

      const { data, error } = await supabase
        .from("reading_log")
        .upsert(row, { onConflict: "user_id,book,chapter" })
        .select()
        .single();

      if (error) {
        console.error("[ReadingLog] Insert error:", error);
        return null;
      }
      return data;
    },
    [supabase]
  );

  /** 특정 유저의 전체 읽기 기록 조회 */
  const getReadingLog = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("reading_log")
      .select("*")
      .eq("user_id", user.id)
      .order("read_at", { ascending: false });

    if (error) {
      console.error("[ReadingLog] Fetch error:", error);
      return [];
    }
    return data ?? [];
  }, [supabase]);

  /** 특정 장이 읽었는지 확인 */
  const isChapterRead = useCallback(
    async (book: number, chapter: number): Promise<boolean> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from("reading_log")
        .select("id")
        .eq("user_id", user.id)
        .eq("book", book)
        .eq("chapter", chapter)
        .single();

      return !!data;
    },
    [supabase]
  );

  return { markChapterRead, getReadingLog, isChapterRead };
}
