"use client";

import { useState, useCallback, useEffect } from "react";

export function useTTS() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSupported(false);
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!supported) return;

      // 브라우저가 일시정지 상태에 갇혀 있을 수 있으므로 resume을 먼저 호출
      window.speechSynthesis.resume();
      window.speechSynthesis.cancel();
      setIsPaused(false);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = rate;

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };
      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };
      utterance.onerror = (event) => {
        console.error("TTS Error:", event);
        setIsPlaying(false);
        setIsPaused(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [rate, supported]
  );

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.resume(); // stuck 방지
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, [supported]);

  const pause = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    
    // 크롬/일부 브라우저 버그 수정: resume이 한 번에 안 먹는 경우 대비
    window.speechSynthesis.resume();
    
    if (window.speechSynthesis.paused) {
      setTimeout(() => {
        window.speechSynthesis.resume();
      }, 50);
    }
    
    setIsPaused(false);
  }, [supported]);

  const toggleRate = useCallback(() => {
    setRate((prev) => {
      if (prev === 1.0) return 1.2;
      if (prev === 1.2) return 0.8;
      return 1.0;
    });
  }, []);

  // 컴포넌트 언마운트 시 재생 중지
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { 
    isPlaying, 
    isPaused, 
    rate, 
    speak, 
    stop, 
    pause, 
    resume, 
    toggleRate, 
    supported 
  };
}
