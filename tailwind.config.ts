import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 더터치 브랜드 컬러 — 올리브 & 어스톤 팔레트
        primary: {
          50:  "#f4f7ef",   // 극연한 올리브 화이트
          100: "#e4ebb5",   // 밀짚/크림 (#E4DFB5 근접)
          200: "#c3cc9b",   // 연세이지 (#C3CC9B)
          300: "#abbe84",   // 밝은 올리브
          400: "#9ab17a",   // 메인 올리브 (#9AB17A)
          500: "#7d9860",   // 중간 올리브
          600: "#637c4a",   // 진한 올리브
          700: "#4e6239",   // 딥 올리브
          800: "#3a4a2a",   // 다크 포레스트
          900: "#28341d",   // 매우 어두운 올리브
        },
        accent: {
          50:  "#fff8f0",   // 아주 연한 복숭아
          100: "#fbe8ce",   // 살구/복숭아 (#FBE8CE)
          200: "#f7d5a8",   // 연한 황금
          300: "#f0bc7a",   // 황금 복숭아
          400: "#e8a14e",   // 골든 앰버
          500: "#d4843a",   // 따뜻한 앰버
          600: "#b86a28",   // 딥 버니시
          700: "#935219",   // 다크 앰버
          800: "#6e3d10",   // 브라운 버니시
          900: "#4a2a0a",   // 다크 초콜릿
        },
        surface: {
          50:  "#faf8f2",   // 웜 오프화이트
          100: "#f3efe4",   // 크림
          200: "#e8e1ce",   // 연한 리넨
          300: "#d5cbb4",   // 리넨
          400: "#b8aa8e",   // 웜 탄
          500: "#9a8e74",   // 중간 탄
          600: "#7a7062",   // 웜 그레이브라운
          700: "#5a5448",   // 딥 웜 그레이
          800: "#3d3930",   // 다크 브라운
          900: "#28251e",   // 거의 블랙 브라운
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-noto-serif)", "Georgia", "serif"],
        bible: ["var(--font-noto-serif)", "Georgia", "serif"],
      },
      fontSize: {
        "bible-sm": ["0.9rem", { lineHeight: "1.8" }],
        "bible-base": ["1rem", { lineHeight: "2" }],
        "bible-lg": ["1.125rem", { lineHeight: "2.1" }],
        "bible-xl": ["1.25rem", { lineHeight: "2.2" }],
      },
      animation: {
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
        "streak-pulse": "streakPulse 2s ease-in-out infinite",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        streakPulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
