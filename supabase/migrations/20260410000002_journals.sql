-- ============================================================
-- journals table — 사용자 묵상 일지 (구절 단위)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.journals (
  id                  BIGSERIAL PRIMARY KEY,
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  book                SMALLINT NOT NULL CHECK (book BETWEEN 1 AND 66),
  chapter             SMALLINT NOT NULL CHECK (chapter >= 1),
  verse               SMALLINT NOT NULL CHECK (verse >= 1),

  -- 저장 시점의 구절 텍스트 스냅샷
  verse_text          TEXT NOT NULL,

  -- 사용자가 작성한 영어 묵상문
  body                TEXT NOT NULL DEFAULT '',

  -- DeepL Write 교정 결과 (null = 미검사 또는 교정 없음)
  corrected_body      TEXT,

  -- 사용자가 교정을 반영하여 저장했는지 여부
  correction_applied  BOOLEAN NOT NULL DEFAULT FALSE,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()

  -- NOTE: UNIQUE 없음 — 동일 구절에 여러 차례 기록 허용
);

-- 사용자 일지 목록 (최신순)
CREATE INDEX IF NOT EXISTS idx_journals_user_created
  ON public.journals (user_id, created_at DESC);

-- 특정 구절 일지 조회
CREATE INDEX IF NOT EXISTS idx_journals_user_location
  ON public.journals (user_id, book, chapter);

-- updated_at 자동 갱신 함수 (이미 존재하면 교체)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER journals_set_updated_at
  BEFORE UPDATE ON public.journals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "journals_select_own"
  ON public.journals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "journals_insert_own"
  ON public.journals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "journals_update_own"
  ON public.journals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "journals_delete_own"
  ON public.journals FOR DELETE
  USING (auth.uid() = user_id);
