"use client";

import { useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type VocabularyInsert = Database["public"]["Tables"]["vocabulary"]["Insert"];

/**
 * 단어장 CRUD 훅.
 * vocabulary 테이블에 단어 저장/삭제/조회.
 */
export function useVocabulary() {
  const supabase = createClient();

  /** 단어 저장 */
  const saveWord = useCallback(
    async (params: {
      word: string;
      koreanMeaning?: string;
      englishDef?: string;
      partOfSpeech?: string;
      book?: number;
      chapter?: number;
      verse?: number;
      verseText?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const row: VocabularyInsert = {
        user_id: user.id,
        word: params.word,
        korean_meaning: params.koreanMeaning ?? null,
        english_def: params.englishDef ?? null,
        part_of_speech: params.partOfSpeech ?? null,
        book: params.book ?? null,
        chapter: params.chapter ?? null,
        verse: params.verse ?? null,
        verse_text: params.verseText ?? null,
      };

      const { data, error } = await supabase
        .from("vocabulary")
        .upsert(row, { onConflict: "user_id,word" })
        .select()
        .single();

      if (error) {
        console.error("[Vocabulary] Save error:", error);
        return null;
      }
      return data;
    },
    [supabase]
  );

  /** 저장된 단어 목록 조회 */
  const getVocabulary = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("vocabulary")
      .select("*")
      .eq("user_id", user.id)
      .order("saved_at", { ascending: false });

    if (error) {
      console.error("[Vocabulary] Fetch error:", error);
      return [];
    }
    return data ?? [];
  }, [supabase]);

  /** 단어 삭제 */
  const deleteWord = useCallback(
    async (wordId: number) => {
      const { error } = await supabase
        .from("vocabulary")
        .delete()
        .eq("id", wordId);

      if (error) {
        console.error("[Vocabulary] Delete error:", error);
        return false;
      }
      return true;
    },
    [supabase]
  );

  return { saveWord, getVocabulary, deleteWord };
}
