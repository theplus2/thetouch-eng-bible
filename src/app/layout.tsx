import type { Metadata, Viewport } from "next";
import { Inter, Noto_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-noto-serif",
  display: "swap",
  weight: ["400", "700"],
});

export const viewport: Viewport = {
  themeColor: "#4263eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "더터치 Bible — 영어성경 읽기",
  description:
    "더터치 청년부 영어성경 읽기 플랫폼. 함께 읽고, 단어를 배우고, 서로의 진도를 확인하세요.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.variable} ${notoSerif.variable}`}>
      <body className="min-h-screen bg-white antialiased">{children}</body>
    </html>
  );
}
