# 더터치 영어성경 읽기 앱 — PRD (Product Requirements Document)

> **버전:** 1.0  
> **작성일:** 2025-04  
> **대상:** 더터치 청년부 (한빛교회)  
> **개발 환경:** Claude Code CLI

---

## 1. 프로젝트 개요

### 1.1 목적
청년부 구성원이 영어 성경을 꾸준히 읽고, 서로의 진도를 확인하며 함께 성장하는 **습관 형성 웹 플랫폼** 구축.

### 1.2 핵심 가치
- **지속성** — 스트릭·플랜·랭킹으로 꾸준한 읽기 동기 부여
- **학습성** — 단어 클릭 즉시 한글 뜻 제공, 단어장 저장
- **공동체성** — 청년부 전체 진도 공유, 함께 읽는 경험

### 1.3 플랫폼
- 웹앱 (PWA) — 모바일 홈 화면 설치 가능
- 반응형: 모바일 우선, PC 지원

---

## 2. 기술 스택

| 영역 | 기술 | 버전 | 비고 |
|------|------|------|------|
| Framework | **Next.js** | 14 (App Router) | SSR + 정적 생성 |
| Styling | **Tailwind CSS** | 3.x | 모바일 우선 반응형 |
| Auth + DB | **Supabase** | - | Auth·DB·Realtime·Storage 통합 |
| 상태관리 | **Zustand** | - | 가볍고 단순 |
| 성경 데이터 | **로컬 JSON** | - | `/public/bible/` 정적 파일 |
| 단어 사전 | **Free Dictionary API** | - | `api.dictionaryapi.dev` 무료 |
| 한글 번역 | **MyMemory API** | - | 무료, 별도 키 불필요 |
| 배포 | **Vercel** | - | Next.js 최적화 |
| 언어 | **TypeScript** | 5.x | 전체 타입 적용 |

---

## 3. 성경 데이터

### 3.1 번역본
- **WEB (World English Bible)** — 퍼블릭 도메인, 무료 사용 가능
- 출처: ebible.org

### 3.2 파일 구조
```
/public/bible/
  ├── bible_index.json          # 전체 책 메타데이터 (5KB)
  ├── bible_book_01.json        # Genesis
  ├── bible_book_02.json        # Exodus
  ├── ...
  └── bible_book_66.json        # Revelation
```

### 3.3 JSON 스키마
```typescript
// bible_index.json
{
  translation: "WEB",
  fullName: "World English Bible",
  license: "Public Domain",
  totalVerses: 31103,
  books: BookMeta[]
}

// BookMeta
{
  book: number        // 1-66
  name: string        // "Genesis"
  abbr: string        // "Gen"
  chapters: number    // 장 수
  verses: number      // 총 절 수
}

// bible_book_XX.json
{
  book: number
  name: string
  abbr: string
  chapters: Chapter[]
}

// Chapter
{
  c: number           // 장 번호
  verses: Verse[]
}

// Verse
{
  v: number           // 절 번호
  t: string           // 본문 텍스트 (줄바꿈 \n 포함 가능)
  fn?: string         // 각주 (옵션)
}
```

### 3.4 책 번호 매핑
```
구약: 1(Gen) ~ 39(Mal)
신약: 40(Matt) ~ 66(Rev)
```

---

## 4. 기능 정의

### 4.1 MVP (Phase 1) — 핵심 기능만

#### F01 — 인증
- 이메일 + 비밀번호 로그인/회원가입 (Supabase Auth)
- 구글 소셜 로그인
- 닉네임 설정 (온보딩)
- 로그아웃

#### F02 — 성경 읽기 화면
- 책 선택 → 장 선택 → 본문 표시
- 이전/다음 장 이동
- 읽기 완료 버튼 (장 단위 기록)
- 현재 읽은 위치 자동 저장 (마지막 읽은 책/장)

#### F03 — 단어 클릭 기능
- 본문의 모든 단어를 `<span>`으로 토큰화
- 단어 클릭 시 하단 슬라이드업 패널 표시
  - 영어 단어 (원형)
  - 품사 (noun / verb / adjective 등)
  - 한글 뜻 (MyMemory API 번역)
  - 영어 정의 (Free Dictionary API)
- "단어장에 저장" 버튼

#### F04 — 개인 진도
- 읽은 장 수 / 총 장 수 (1189장)
- 책별 완독 여부 표시
- 연속 읽기 스트릭 (일 단위)

#### F05 — 청년부 현황
- 멤버별 읽은 장 수 랭킹 (실시간)
- 전체 그룹 진도율 (읽은 장 / 1189장 × 인원)

#### F06 — 단어장
- 저장한 단어 목록
- 단어 삭제
- 단어 + 뜻 + 저장된 성경 구절 표시

---

### 4.2 Phase 2 — 경험 강화

#### F07 — 읽기 플랜
- 관리자(목사님)가 플랜 생성 (예: "30일 신약 완독")
- 플랜 참여 → 오늘 읽을 본문 자동 제시
- 플랜 진도율 표시

#### F08 — 하이라이트 + 메모
- 절(verse) 단위 형광펜 색상 지정
- 절에 짧은 메모 작성
- 내 하이라이트 모아보기

#### F09 — 단어 퀴즈
- 저장한 단어 카드 플립 복습
- 해당 단어가 쓰인 성경 구절 함께 표시

#### F10 — 푸시 알림 (opt-in)
- 2일 이상 미읽기 시 알림
- 목사님 단체 격려 메시지 발송

---

### 4.3 Phase 3 — 고도화

#### F11 — 검색
- 키워드로 성경 본문 전체 검색

#### F12 — 번역 비교
- WEB + KJV 병렬 표시

#### F13 — 통계 대시보드 (관리자)
- 멤버별 주간/월간 읽기 통계
- 가장 많이 저장된 단어 Top 10

---

## 5. DB 스키마 (Supabase / PostgreSQL)

```sql
-- 유저 프로필 (Supabase auth.users 확장)
CREATE TABLE public.profiles (
  id          UUID REFERENCES auth.users(id) PRIMARY KEY,
  nickname    TEXT NOT NULL,
  avatar_url  TEXT,
  role        TEXT DEFAULT 'member',   -- 'member' | 'admin'
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 읽기 기록 (장 단위)
CREATE TABLE public.reading_log (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  book        SMALLINT NOT NULL,       -- 1-66
  chapter     SMALLINT NOT NULL,
  read_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book, chapter)       -- 같은 장 중복 기록 방지
);

-- 단어장
CREATE TABLE public.vocabulary (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  word            TEXT NOT NULL,
  korean_meaning  TEXT,
  english_def     TEXT,
  part_of_speech  TEXT,
  book            SMALLINT,
  chapter         SMALLINT,
  verse           SMALLINT,
  verse_text      TEXT,               -- 해당 절 텍스트 스냅샷
  saved_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, word)               -- 같은 단어 중복 저장 방지
);

-- 하이라이트 (Phase 2)
CREATE TABLE public.highlights (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  book        SMALLINT NOT NULL,
  chapter     SMALLINT NOT NULL,
  verse       SMALLINT NOT NULL,
  color       TEXT DEFAULT 'yellow',  -- 'yellow'|'green'|'blue'|'pink'
  note        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book, chapter, verse)
);

-- 읽기 플랜 (Phase 2)
CREATE TABLE public.reading_plans (
  id            BIGSERIAL PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT,
  schedule      JSONB NOT NULL,       -- [{day: 1, book: 40, chapter: 1}, ...]
  created_by    UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 플랜 참여
CREATE TABLE public.plan_enrollments (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id     BIGINT REFERENCES reading_plans(id) ON DELETE CASCADE,
  started_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plan_id)
);
```

### RLS (Row Level Security) 정책
```sql
-- profiles: 본인만 수정, 전체 읽기 가능
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- reading_log: 본인만 쓰기, 전체 읽기 (랭킹용)
ALTER TABLE reading_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "log_select" ON reading_log FOR SELECT USING (true);
CREATE POLICY "log_insert" ON reading_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "log_delete" ON reading_log FOR DELETE USING (auth.uid() = user_id);

-- vocabulary: 본인만 접근
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vocab_all" ON vocabulary USING (auth.uid() = user_id);

-- highlights: 본인만 접근
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "highlight_all" ON highlights USING (auth.uid() = user_id);
```

---

## 6. 프로젝트 폴더 구조

```
readword/                          # 프로젝트 루트
├── public/
│   └── bible/
│       ├── bible_index.json
│       ├── bible_book_01.json
│       └── ... (66개 파일)
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # 루트 레이아웃 (폰트, Provider)
│   │   ├── page.tsx               # 랜딩 / 리다이렉트
│   │   │
│   │   ├── (auth)/                # 인증 라우트 그룹
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── onboarding/page.tsx
│   │   │
│   │   └── (app)/                 # 로그인 후 앱 라우트 그룹
│   │       ├── layout.tsx         # 하단 탭바 / 사이드바 레이아웃
│   │       ├── home/page.tsx      # 대시보드 (진도 + 스트릭)
│   │       ├── read/
│   │       │   ├── page.tsx       # 책 선택
│   │       │   └── [book]/
│   │       │       └── [chapter]/
│   │       │           └── page.tsx  # 성경 읽기
│   │       ├── vocabulary/page.tsx   # 단어장
│   │       └── group/page.tsx        # 청년부 현황
│   │
│   ├── components/
│   │   ├── ui/                    # 범용 UI 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── BottomSheet.tsx    # 단어 뜻 패널
│   │   │   ├── ProgressBar.tsx
│   │   │   └── Avatar.tsx
│   │   │
│   │   ├── bible/
│   │   │   ├── BibleReader.tsx    # 본문 렌더러
│   │   │   ├── VerseText.tsx      # 절 단위 컴포넌트
│   │   │   ├── WordToken.tsx      # 클릭 가능한 단어 span
│   │   │   ├── WordPanel.tsx      # 단어 뜻 슬라이드업 패널
│   │   │   ├── BookSelector.tsx   # 책 선택 UI
│   │   │   └── ChapterNav.tsx     # 이전/다음 장 네비
│   │   │
│   │   ├── dashboard/
│   │   │   ├── StreakCard.tsx
│   │   │   ├── ProgressCard.tsx
│   │   │   └── RecentActivity.tsx
│   │   │
│   │   └── group/
│   │       ├── RankingList.tsx
│   │       └── GroupProgress.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # 브라우저용 Supabase 클라이언트
│   │   │   ├── server.ts          # 서버 컴포넌트용
│   │   │   └── middleware.ts      # 세션 갱신
│   │   │
│   │   ├── bible/
│   │   │   ├── loader.ts          # JSON 파일 로더 (레이지)
│   │   │   ├── tokenizer.ts       # 단어 토큰화
│   │   │   └── constants.ts       # 책 이름/번호 상수
│   │   │
│   │   └── dictionary/
│   │       ├── freeDictionary.ts  # Free Dictionary API
│   │       └── translate.ts       # MyMemory 번역 API
│   │
│   ├── hooks/
│   │   ├── useReadingLog.ts       # 읽기 기록 CRUD
│   │   ├── useVocabulary.ts       # 단어장 CRUD
│   │   ├── useStreak.ts           # 스트릭 계산
│   │   └── useWordLookup.ts       # 단어 검색 + 캐싱
│   │
│   ├── stores/
│   │   ├── bibleStore.ts          # 현재 읽는 위치 상태
│   │   └── wordPanelStore.ts      # 단어 패널 열림/닫힘
│   │
│   └── types/
│       ├── bible.ts
│       ├── database.ts            # Supabase 테이블 타입
│       └── dictionary.ts
│
├── middleware.ts                  # 인증 라우트 보호
├── .env.local                     # Supabase URL/KEY (gitignore)
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 7. 외부 API 명세

### 7.1 Free Dictionary API
```
GET https://api.dictionaryapi.dev/api/v2/entries/en/{word}

응답 예시:
[{
  word: "beloved",
  phonetic: "/bɪˈlʌvɪd/",
  meanings: [{
    partOfSpeech: "adjective",
    definitions: [{
      definition: "dearly loved",
      example: "..."
    }]
  }]
}]
```
- 무료, API 키 불필요
- 일반 단어는 잘 되나 고유명사(Nazareth 등)는 null 반환 → 예외 처리 필요

### 7.2 MyMemory Translation API (영→한)
```
GET https://api.mymemory.translated.net/get
  ?q={word_or_phrase}
  &langpair=en|ko

응답 예시:
{
  responseData: {
    translatedText: "사랑하는",
    match: 1
  }
}
```
- 무료 플랜: 일 5,000자
- 청년부 규모에서는 충분, 초과 시 등록 계정으로 확장 가능

### 7.3 단어 조회 플로우
```
사용자 클릭
  → 1. 로컬 캐시(Zustand) 확인
  → 2. Free Dictionary API (영어 정의 + 발음)
  → 3. MyMemory API (한글 뜻)
  → 4. 결과 캐시 저장 (세션 동안 유지)
  → 5. WordPanel에 표시
```

---

## 8. 핵심 컴포넌트 설계

### 8.1 단어 토크나이저 (`lib/bible/tokenizer.ts`)
```typescript
// 구두점을 단어에서 분리, 공백/줄바꿈 유지
export function tokenizeVerse(text: string): Token[] {
  // Token: { type: 'word'|'punct'|'space'|'newline', value: string }
}
```

### 8.2 BibleReader 컴포넌트
- 서버 컴포넌트로 JSON 파일 로드
- 각 절을 `VerseText`로 렌더링
- 절 번호 클릭 → 하이라이트/메모 (Phase 2)

### 8.3 WordPanel (하단 슬라이드업)
```
┌─────────────────────────────┐
│  beloved                    │  ← 원형 단어
│  /bɪˈlʌvɪd/ · adjective    │  ← 발음 + 품사
├─────────────────────────────┤
│  🇰🇷 사랑받는, 소중한         │  ← 한글 뜻
│  dearly loved               │  ← 영어 정의
├─────────────────────────────┤
│  John 3:16                  │  ← 출처 절
│  [단어장에 저장]  [닫기]      │
└─────────────────────────────┘
```

---

## 9. 라우트 & 네비게이션

### 모바일 하단 탭바
```
🏠 홈    📖 읽기    📝 단어장    👥 청년부
```

### PC 사이드바
```
더터치 Bible
─────────────
🏠  홈 (대시보드)
📖  성경 읽기
📝  단어장
👥  청년부 현황
─────────────
⚙️  설정
```

### 라우트 목록
```
/                     → /home (리다이렉트)
/login                → 로그인
/signup               → 회원가입
/onboarding           → 닉네임 설정 (최초 1회)
/home                 → 대시보드
/read                 → 책 선택
/read/[book]          → 장 선택
/read/[book]/[chapter]→ 성경 읽기
/vocabulary           → 단어장
/group                → 청년부 현황
```

---

## 10. 개발 단계별 계획

### Phase 1 — MVP (목표: 3-4주)

#### Week 1: 기반 세팅
- [ ] Next.js 14 프로젝트 생성 (TypeScript + Tailwind)
- [ ] Supabase 프로젝트 생성 + 환경변수 설정
- [ ] DB 스키마 마이그레이션 실행
- [ ] Supabase Auth 연동 (이메일 + 구글)
- [ ] 미들웨어 인증 라우트 보호
- [ ] 로그인 / 회원가입 / 온보딩 페이지
- [ ] `/public/bible/` 에 JSON 파일 배치

#### Week 2: 성경 읽기 핵심
- [ ] bible JSON 로더 (`lib/bible/loader.ts`)
- [ ] 책 선택 화면 (`/read`)
- [ ] 장 선택 화면 (`/read/[book]`)
- [ ] 성경 본문 렌더러 (`BibleReader`, `VerseText`)
- [ ] 단어 토크나이저
- [ ] `WordToken` 클릭 이벤트
- [ ] `WordPanel` 슬라이드업 UI
- [ ] Free Dictionary + MyMemory API 연동
- [ ] 단어 조회 캐싱

#### Week 3: 진도 + 단어장
- [ ] 읽기 완료 버튼 → `reading_log` INSERT
- [ ] 단어장 저장 → `vocabulary` INSERT
- [ ] 대시보드 — 개인 진도율 + 스트릭
- [ ] 단어장 페이지
- [ ] 마지막 읽은 위치 로컬 저장 (localStorage)

#### Week 4: 청년부 + 배포
- [ ] 청년부 랭킹 페이지 (Supabase 실시간)
- [ ] 모바일 하단 탭바 + PC 사이드바 레이아웃
- [ ] PWA 설정 (`manifest.json`, service worker)
- [ ] Vercel 배포
- [ ] 도메인 연결 (옵션)
- [ ] 테스트 + 버그 수정

---

### Phase 2 — 경험 강화 (MVP 이후 2-3주)
- [ ] 읽기 플랜 (관리자 생성 + 멤버 참여)
- [ ] 절 하이라이트 + 메모
- [ ] 단어 퀴즈 모드
- [ ] 읽기 플랜 진도 추적

### Phase 3 — 고도화 (필요에 따라)
- [ ] 본문 검색
- [ ] 번역 비교 (WEB + KJV)
- [ ] 관리자 통계 대시보드
- [ ] 푸시 알림

---

## 11. 환경변수 목록

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# 앱 설정
NEXT_PUBLIC_APP_NAME="더터치 Bible"
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

> MyMemory API와 Free Dictionary API는 키 불필요.

---

## 12. 클로드 코드 작업 시작 프롬프트 예시

```
이 PRD를 기반으로 Next.js 14 + Tailwind + Supabase 프로젝트를 세팅해줘.
- TypeScript 사용
- App Router 구조
- 폴더 구조는 PRD 6번 섹션 그대로
- Supabase 클라이언트 설정 포함
- 먼저 package.json과 기본 설정 파일부터 잡아줘
```

```
PRD의 DB 스키마(5번 섹션)를 Supabase에 적용할
migration SQL 파일을 만들어줘. RLS 정책까지 포함.
```

```
PRD의 F03 단어 클릭 기능을 구현해줘.
- WordToken, WordPanel 컴포넌트
- Free Dictionary API + MyMemory API 연동
- Zustand로 패널 상태 관리
```

---

## 13. 참고 사항

- **성경 데이터**: WEB (World English Bible), Public Domain
- **단어 각주(fn)**: 절 데이터에 포함, WordPanel에서 선택적 표시 가능
- **시편 등 시가서**: `\n` 줄바꿈 포함 → `white-space: pre-wrap` 처리 필요
- **고유명사 처리**: 사람 이름·지명은 사전 API에서 null 반환 → "성경 고유명사입니다" fallback 메시지
- **오프라인 지원**: 성경 JSON은 정적 파일이므로 PWA 캐시 후 오프라인 읽기 가능
