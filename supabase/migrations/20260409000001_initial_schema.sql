-- ============================================================
-- TheTouch ENG Bible — Initial Schema Migration
-- Generated: 2026-04-09
-- ============================================================

-- ============================================================
-- 1. TABLES
-- ============================================================

-- 유저 프로필 (Supabase auth.users 확장)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nickname    TEXT NOT NULL,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'member'
                CHECK (role IN ('member', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 읽기 기록 (장 단위)
CREATE TABLE IF NOT EXISTS public.reading_log (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book        SMALLINT NOT NULL CHECK (book BETWEEN 1 AND 66),
  chapter     SMALLINT NOT NULL CHECK (chapter >= 1),
  read_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, book, chapter)   -- 같은 장 중복 기록 방지
);

-- 단어장
CREATE TABLE IF NOT EXISTS public.vocabulary (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  word            TEXT NOT NULL,
  korean_meaning  TEXT,
  english_def     TEXT,
  part_of_speech  TEXT,
  book            SMALLINT CHECK (book BETWEEN 1 AND 66),
  chapter         SMALLINT CHECK (chapter >= 1),
  verse           SMALLINT CHECK (verse >= 1),
  verse_text      TEXT,               -- 해당 절 텍스트 스냅샷
  saved_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, word)              -- 같은 단어 중복 저장 방지
);

-- 하이라이트 (Phase 2)
CREATE TABLE IF NOT EXISTS public.highlights (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book        SMALLINT NOT NULL CHECK (book BETWEEN 1 AND 66),
  chapter     SMALLINT NOT NULL CHECK (chapter >= 1),
  verse       SMALLINT NOT NULL CHECK (verse >= 1),
  color       TEXT NOT NULL DEFAULT 'yellow'
                CHECK (color IN ('yellow', 'green', 'blue', 'pink')),
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, book, chapter, verse)
);

-- 읽기 플랜 (Phase 2)
CREATE TABLE IF NOT EXISTS public.reading_plans (
  id            BIGSERIAL PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT,
  schedule      JSONB NOT NULL,       -- [{day: 1, book: 40, chapter: 1}, ...]
  created_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 플랜 참여
CREATE TABLE IF NOT EXISTS public.plan_enrollments (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id     BIGINT NOT NULL REFERENCES public.reading_plans(id) ON DELETE CASCADE,
  started_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, plan_id)
);

-- ============================================================
-- 2. INDEXES (성능 최적화)
-- ============================================================

-- 읽기 기록: 유저별 + 최근 순 정렬
CREATE INDEX IF NOT EXISTS idx_reading_log_user_id
  ON public.reading_log (user_id);

CREATE INDEX IF NOT EXISTS idx_reading_log_user_read_at
  ON public.reading_log (user_id, read_at DESC);

-- 단어장: 유저별 + 저장 시각 순
CREATE INDEX IF NOT EXISTS idx_vocabulary_user_id
  ON public.vocabulary (user_id);

CREATE INDEX IF NOT EXISTS idx_vocabulary_user_saved_at
  ON public.vocabulary (user_id, saved_at DESC);

-- 하이라이트: 유저 + 책/장 조합 조회
CREATE INDEX IF NOT EXISTS idx_highlights_user_book_chapter
  ON public.highlights (user_id, book, chapter);

-- 플랜 참여: 유저별 플랜 목록 조회
CREATE INDEX IF NOT EXISTS idx_plan_enrollments_user_id
  ON public.plan_enrollments (user_id);

-- ============================================================
-- 3. AUTO-CREATE PROFILE TRIGGER
-- 신규 회원가입 시 auth.users → public.profiles 자동 생성
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'nickname',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)  -- 이메일 앞부분을 임시 닉네임으로
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 기존 트리거가 있으면 교체
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- ── profiles ────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 전체 읽기 허용 (랭킹, 그룹 현황에서 필요)
CREATE POLICY "profiles_select_all"
  ON public.profiles
  FOR SELECT
  USING (true);

-- 본인 레코드만 INSERT (트리거에서 SECURITY DEFINER로 처리되므로 anon INSERT 차단)
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 본인 레코드만 UPDATE (role 셀프 에스컬레이션 차단)
-- WITH CHECK에서 role이 현재 DB 값과 동일한지 확인하여 자가 권한 상승 방지
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (
      SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()
    )
  );

-- 삭제는 본인만 (회원 탈퇴 시)
CREATE POLICY "profiles_delete_own"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

-- ── reading_log ─────────────────────────────────────────────
ALTER TABLE public.reading_log ENABLE ROW LEVEL SECURITY;

-- 전체 읽기 허용 (랭킹 집계용)
CREATE POLICY "reading_log_select_all"
  ON public.reading_log
  FOR SELECT
  USING (true);

-- 본인 기록만 INSERT
CREATE POLICY "reading_log_insert_own"
  ON public.reading_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 본인 기록만 DELETE
CREATE POLICY "reading_log_delete_own"
  ON public.reading_log
  FOR DELETE
  USING (auth.uid() = user_id);

-- ── vocabulary ───────────────────────────────────────────────
ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;

-- 본인 단어장만 SELECT
CREATE POLICY "vocabulary_select_own"
  ON public.vocabulary
  FOR SELECT
  USING (auth.uid() = user_id);

-- 본인 단어장에만 INSERT
CREATE POLICY "vocabulary_insert_own"
  ON public.vocabulary
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 본인 단어장만 UPDATE
CREATE POLICY "vocabulary_update_own"
  ON public.vocabulary
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 본인 단어장만 DELETE
CREATE POLICY "vocabulary_delete_own"
  ON public.vocabulary
  FOR DELETE
  USING (auth.uid() = user_id);

-- ── highlights ───────────────────────────────────────────────
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;

-- 본인 하이라이트만 SELECT
CREATE POLICY "highlights_select_own"
  ON public.highlights
  FOR SELECT
  USING (auth.uid() = user_id);

-- 본인 하이라이트에만 INSERT
CREATE POLICY "highlights_insert_own"
  ON public.highlights
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 본인 하이라이트만 UPDATE
CREATE POLICY "highlights_update_own"
  ON public.highlights
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 본인 하이라이트만 DELETE
CREATE POLICY "highlights_delete_own"
  ON public.highlights
  FOR DELETE
  USING (auth.uid() = user_id);

-- ── reading_plans ────────────────────────────────────────────
ALTER TABLE public.reading_plans ENABLE ROW LEVEL SECURITY;

-- 전체 읽기 허용 (멤버가 플랜 목록 조회)
CREATE POLICY "reading_plans_select_all"
  ON public.reading_plans
  FOR SELECT
  USING (true);

-- admin만 플랜 생성
CREATE POLICY "reading_plans_insert_admin"
  ON public.reading_plans
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- admin만 플랜 수정
CREATE POLICY "reading_plans_update_admin"
  ON public.reading_plans
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- admin만 플랜 삭제
CREATE POLICY "reading_plans_delete_admin"
  ON public.reading_plans
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── plan_enrollments ─────────────────────────────────────────
ALTER TABLE public.plan_enrollments ENABLE ROW LEVEL SECURITY;

-- 본인 참여 기록만 SELECT
CREATE POLICY "plan_enrollments_select_own"
  ON public.plan_enrollments
  FOR SELECT
  USING (auth.uid() = user_id);

-- 본인만 플랜 참여 (INSERT)
CREATE POLICY "plan_enrollments_insert_own"
  ON public.plan_enrollments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 본인만 플랜 탈퇴 (DELETE)
CREATE POLICY "plan_enrollments_delete_own"
  ON public.plan_enrollments
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 5. HELPER VIEWS
-- ============================================================

-- 유저별 읽은 장 수 집계 (랭킹 페이지용)
CREATE OR REPLACE VIEW public.user_reading_stats AS
SELECT
  p.id          AS user_id,
  p.nickname,
  p.avatar_url,
  COUNT(rl.id)  AS chapters_read
FROM public.profiles p
LEFT JOIN public.reading_log rl ON rl.user_id = p.id
GROUP BY p.id, p.nickname, p.avatar_url;

-- 뷰에도 RLS 적용 (뷰는 기반 테이블의 RLS를 그대로 따름)
-- reading_log SELECT policy가 USING(true)이므로 전체 조회 허용됨
