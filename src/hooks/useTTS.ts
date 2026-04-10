"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export function useTTS() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [supported, setSupported] = useState(true);

  // 큐 및 상태 제어용 Ref
  const sentencesRef = useRef<string[]>([]);
  const currentIndexRef = useRef(0);
  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);
  const rateRef = useRef(1.0);

  // 상태 변경 시 Ref 동기화
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSupported(false);
    }
  }, []);

  // 실제 다음 문장을 재생하는 내부 함수
  const playNext = useCallback(() => {
    if (!supported || typeof window === "undefined") return;
    
    const synth = window.speechSynthesis;
    
    // 더 이상 읽을 문장이 없거나, 재생 중이 아니거나, 일시정지 상태면 중단
    if (currentIndexRef.current >= sentencesRef.current.length || !isPlayingRef.current || isPausedRef.current) {
      if (currentIndexRef.current >= sentencesRef.current.length) {
        setIsPlaying(false);
        setIsPaused(false);
      }
      return;
    }

    const text = sentencesRef.current[currentIndexRef.current];
    if (!text || text.trim().length === 0) {
      currentIndexRef.current++;
      playNext();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = rateRef.current;

    utterance.onstart = () => {
      // 시작 시 상태 확인
    };

    utterance.onend = () => {
      // 재생 종료 시 상태를 확인하여 다음 문장 진행
      if (isPlayingRef.current && !isPausedRef.current) {
        currentIndexRef.current++;
        playNext();
      }
    };

    utterance.onerror = (event) => {
      if (event.error !== 'interrupted') {
        console.error("TTS Utterance Error:", event.error);
        currentIndexRef.current++;
        playNext();
      }
    };

    synth.speak(utterance);
  }, [supported]); // 의존성을 최소화하여 stale closure 방지

  const speak = useCallback(
    (text: string) => {
      if (!supported) return;

      window.speechSynthesis.cancel();
      
      const sanitized = text.replace(/\[\d+\]|\b\d+\b/g, " ").replace(/\s+/g, " ").trim();
      const sentences = sanitized.split(/(?<=[.!?])\s+/);
      
      const filteredSentences = sentences.filter(s => s.trim().length > 2);
      
      if (filteredSentences.length > 0) {
        sentencesRef.current = filteredSentences;
        currentIndexRef.current = 0;
        
        setIsPlaying(true);
        isPlayingRef.current = true;
        setIsPaused(false);
        isPausedRef.current = false;

        // 즉시 시작
        playNext();
      }
    },
    [supported, playNext]
  );

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    
    sentencesRef.current = [];
    currentIndexRef.current = 0;
    setIsPlaying(false);
    isPlayingRef.current = false;
    setIsPaused(false);
    isPausedRef.current = false;
  }, [supported]);

  const pause = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsPaused(true);
    isPausedRef.current = true;
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    if (isPausedRef.current) {
      setIsPaused(false);
      isPausedRef.current = false;
      playNext();
    }
  }, [supported, playNext]);

  const toggleRate = useCallback(() => {
    const nextRate = rate === 1.0 ? 1.2 : rate === 1.2 ? 0.8 : 1.0;
    setRate(nextRate);
    rateRef.current = nextRate;
    
    if (isPlayingRef.current && !isPausedRef.current) {
      window.speechSynthesis.cancel();
      playNext();
    }
  }, [rate, playNext]);

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
