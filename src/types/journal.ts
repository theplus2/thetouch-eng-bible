import type { Database } from "./database";

export type JournalRow = Database["public"]["Tables"]["journals"]["Row"];
export type JournalInsert = Database["public"]["Tables"]["journals"]["Insert"];

export interface GrammarCheckResult {
  original: string;
  corrected: string;
  hasChanges: boolean;
}
