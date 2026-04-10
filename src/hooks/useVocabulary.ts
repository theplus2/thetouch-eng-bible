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

      // 1. 기존 단어가 있는지 확인
      const { data: existingData } = await supabase
        .from("vocabulary")
        .select("id")
        .eq("user_id", user.id)
        .eq("word", params.word)
        .maybeSingle();
      
      const existing = existingData as unknown as { id: number } | null;

      let dbResult;
      
      if (existing && existing.id) {
        // 이미 있으면 업데이트
        dbResult = await supabase
          .from("vocabulary")
          // @ts-ignore
          .update(row)
          .eq("id", existing.id)
          .select()
          .single();
      } else {
        // 없으면 새로 추가
        dbResult = await supabase
          .from("vocabulary")
          // @ts-ignore
          .insert([row])
          .select()
          .single();
      }

      const { data, error } = dbResult;

      if (error) {
        console.error("[Vocabulary] Save error:", error);
        alert(`저장 실패: ${error.message}`);
        return null;
      }
      return data;
    },
    [supabase]
  );

  /** 저장된 단어 목록 조회 */
  const getVocabulary = useCallback(async (): Promise<Database["public"]["Tables"]["vocabulary"]["Row"][]> => {
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

  const getDueVocabulary = useCallback(async (limit = 20): Promise<Database["public"]["Tables"]["vocabulary"]["Row"][] | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const now = new Date().toISOString();
    
    // next_review_at이 null이거나(새로 저장한 단어), 오늘 또는 과거인 단어 조회
    const { data, error } = await supabase
      .from("vocabulary")
      .select("*")
      .eq("user_id", user.id)
      .or(`next_review_at.is.null,next_review_at.lte.${now}`)
      .order("next_review_at", { ascending: true, nullsFirst: true })
      .limit(limit);

    if (error) {
      console.error("[Vocabulary] Fetch Due error:", error);
      return null; // DB 수정(SQL)이 안 된 경우 컴포넌트에서 알 수 있도록 null 반환
    }
    return data ?? [];
  }, [supabase]);

  /** 복습 결과(SRS 상태) 업데이트 */
  const updateWordReview = useCallback(async (
    wordId: number, 
    srsState: { nextReviewAt: string; reviewCount: number; easeFactor: number; interval: number }
  ) => {
    const { error } = await supabase
      .from("vocabulary")
      // @ts-ignore: Supabase typing issue with manually updated schema fields
      .update({
        next_review_at: srsState.nextReviewAt,
        review_count: srsState.reviewCount,
        ease_factor: srsState.easeFactor,
        interval: srsState.interval,
      })
      .eq("id", wordId);

    if (error) {
      console.error("[Vocabulary] Update Review error:", error);
      return false;
    }
    return true;
  }, [supabase]);

  return { saveWord, getVocabulary, getDueVocabulary, deleteWord, updateWordReview };
}
