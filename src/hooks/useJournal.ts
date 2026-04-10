"use client";

import { useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type JournalRow = Database["public"]["Tables"]["journals"]["Row"];
type JournalInsert = Database["public"]["Tables"]["journals"]["Insert"];

/**
 * 묵상 일지 CRUD 훅.
 * useVocabulary 패턴과 동일.
 */
export function useJournal() {
  const supabase = createClient();

  /** 일지 저장 */
  const saveJournal = useCallback(
    async (params: {
      book: number;
      chapter: number;
      verse: number;
      verseText: string;
      body: string;
      correctedBody?: string;
      correctionApplied?: boolean;
    }): Promise<JournalRow | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const row: JournalInsert = {
        user_id: user.id,
        book: params.book,
        chapter: params.chapter,
        verse: params.verse,
        verse_text: params.verseText,
        body: params.body,
        corrected_body: params.correctedBody ?? null,
        correction_applied: params.correctionApplied ?? false,
      };

      const { data, error } = await supabase
        .from("journals")
        // @ts-ignore
        .insert([row])
        .select()
        .single();

      if (error) {
        console.error("[Journal] Save error:", error);
        return null;
      }
      return data as JournalRow;
    },
    [supabase]
  );

  /** 일지 목록 조회 (최신순) */
  const getJournals = useCallback(
    async (limit = 30, offset = 0): Promise<JournalRow[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("journals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("[Journal] Fetch error:", error);
        return [];
      }
      return (data ?? []) as JournalRow[];
    },
    [supabase]
  );

  /** 특정 구절의 일지 조회 */
  const getJournalsByVerse = useCallback(
    async (book: number, chapter: number, verse: number): Promise<JournalRow[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("journals")
        .select("*")
        .eq("user_id", user.id)
        .eq("book", book)
        .eq("chapter", chapter)
        .eq("verse", verse)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[Journal] Fetch by verse error:", error);
        return [];
      }
      return (data ?? []) as JournalRow[];
    },
    [supabase]
  );

  /** 일지 삭제 */
  const deleteJournal = useCallback(
    async (id: number): Promise<boolean> => {
      const { error } = await supabase
        .from("journals")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("[Journal] Delete error:", error);
        return false;
      }
      return true;
    },
    [supabase]
  );

  return { saveJournal, getJournals, getJournalsByVerse, deleteJournal };
}
