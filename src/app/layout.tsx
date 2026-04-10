import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Serif } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  variable: '--font-noto-serif',
  display: 'swap',
  weight: ['400', '700'],
})

const APP_URL = 'https://thetouch-eng-bible.vercel.app'
const APP_NAME = '더터치 Bible'
const APP_DESC = '더터치 청년부 영어 성경 읽기 앱 — 단어를 누르면 한글 뜻이 바로!'

export const viewport: Viewport = {
  themeColor: '#9ab17a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  // ── 기본 정보 ──────────────────────────────────────
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,   // 각 페이지에서 title 덮어쓸 때 사용
  },
  description: APP_DESC,
  applicationName: APP_NAME,

  // ── 파비콘 · 앱 아이콘 ─────────────────────────────
  icons: {
    icon: [
      { url: '/icons/icon-16x16.png',  sizes: '16x16',  type: 'image/png' },
      { url: '/icons/icon-32x32.png',  sizes: '32x32',  type: 'image/png' },
      { url: '/icons/icon-96x96.png',  sizes: '96x96',  type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/icons/icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
  },

  // ── PWA manifest ────────────────────────────────────
  manifest: '/manifest.json',

  // ── OG (카카오톡 · 페이스북 · 슬랙 링크 미리보기) ──
  openGraph: {
    type: 'website',
    url: APP_URL,
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESC,
    locale: 'ko_KR',
  },

  // ── 트위터 카드 ──────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: APP_DESC,
  },

  // ── iOS PWA ──────────────────────────────────────────
  appleWebApp: {
    capable: true,
    title: '터치Bible',
    statusBarStyle: 'black-translucent',
  },

  // ── 기타 ────────────────────────────────────────────
  metadataBase: new URL(APP_URL),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={`${inter.variable} ${notoSerif.variable}`}>
      <body className="min-h-screen bg-surface-50 antialiased">{children}</body>
    </html>
  )
}
