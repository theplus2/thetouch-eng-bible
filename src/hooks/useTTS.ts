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

      // 이미 재생 중이면 멈춤
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
      utterance.onerror = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [rate, supported]
  );

  const stop = useCallback(() => {
    if (!supported) return;
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
    window.speechSynthesis.resume();
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
