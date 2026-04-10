/**
 * Supabase Database 타입 정의.
 * 실제 프로젝트에서는 `supabase gen types typescript` 명령으로 자동 생성 권장.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nickname: string;
          avatar_url: string | null;
          role: string;
          created_at: string;
        };
        Insert: {
          id: string;
          nickname: string;
          avatar_url?: string | null;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          nickname?: string;
          avatar_url?: string | null;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      reading_log: {
        Row: {
          id: number;
          user_id: string;
          book: number;
          chapter: number;
          read_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          book: number;
          chapter: number;
          read_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          book?: number;
          chapter?: number;
          read_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reading_log_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      vocabulary: {
        Row: {
          id: number;
          user_id: string;
          word: string;
          korean_meaning: string | null;
          english_def: string | null;
          part_of_speech: string | null;
          book: number | null;
          chapter: number | null;
          verse: number | null;
          verse_text: string | null;
          saved_at: string;
          next_review_at: string | null;
          review_count: number;
          ease_factor: number;
          interval: number;
        };
        Insert: {
          id?: number;
          user_id: string;
          word: string;
          korean_meaning?: string | null;
          english_def?: string | null;
          part_of_speech?: string | null;
          book?: number | null;
          chapter?: number | null;
          verse?: number | null;
          verse_text?: string | null;
          saved_at?: string;
          next_review_at?: string | null;
          review_count?: number;
          ease_factor?: number;
          interval?: number;
        };
        Update: {
          id?: number;
          user_id?: string;
          word?: string;
          korean_meaning?: string | null;
          english_def?: string | null;
          part_of_speech?: string | null;
          book?: number | null;
          chapter?: number | null;
          verse?: number | null;
          verse_text?: string | null;
          saved_at?: string;
          next_review_at?: string | null;
          review_count?: number;
          ease_factor?: number;
          interval?: number;
        };
        Relationships: [
          {
            foreignKeyName: "vocabulary_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      highlights: {
        Row: {
          id: number;
          user_id: string;
          book: number;
          chapter: number;
          verse: number;
          color: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          book: number;
          chapter: number;
          verse: number;
          color?: string;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          book?: number;
          chapter?: number;
          verse?: number;
          color?: string;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "highlights_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      reading_plans: {
        Row: {
          id: number;
          title: string;
          description: string | null;
          schedule: Json;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          description?: string | null;
          schedule: Json;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          description?: string | null;
          schedule?: Json;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reading_plans_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      journals: {
        Row: {
          id: number;
          user_id: string;
          book: number;
          chapter: number;
          verse: number;
          verse_text: string;
          body: string;
          corrected_body: string | null;
          correction_applied: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          book: number;
          chapter: number;
          verse: number;
          verse_text: string;
          body?: string;
          corrected_body?: string | null;
          correction_applied?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          book?: number;
          chapter?: number;
          verse?: number;
          verse_text?: string;
          body?: string;
          corrected_body?: string | null;
          correction_applied?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "journals_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      plan_enrollments: {
        Row: {
          id: number;
          user_id: string;
          plan_id: number;
          started_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          plan_id: number;
          started_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          plan_id?: number;
          started_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "plan_enrollments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plan_enrollments_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "reading_plans";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
