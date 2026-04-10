"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export function useTTS() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [supported, setSupported] = useState(true);

  // 큐 관리용 Ref (컴포넌트 리렌더링과 독립적으로 상태 유지)
  const sentencesRef = useRef<string[]>([]);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSupported(false);
    }
  }, []);

  // 실제 다음 문장을 재생하는 내부 함수
  const playNext = useCallback(() => {
    if (!supported) return;
    
    const synth = window.speechSynthesis;
    
    // 더 이상 읽을 문장이 없으면 종료
    if (currentIndexRef.current >= sentencesRef.current.length) {
      setIsPlaying(false);
      setIsPaused(false);
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
    utterance.rate = rate;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      // 멈춘 상태(Pause)가 아닐 때만 다음 문장으로 진행
      if (window.speechSynthesis.speaking || !window.speechSynthesis.paused) {
        currentIndexRef.current++;
        playNext();
      }
    };

    utterance.onerror = (event) => {
      console.error("TTS Utterance Error:", event);
      // 인터럽트된 경우가 아니면 다음으로 진행
      if (event.error !== 'interrupted') {
        currentIndexRef.current++;
        playNext();
      }
    };

    synth.speak(utterance);
  }, [rate, supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported) return;

      window.speechSynthesis.cancel();
      
      // 텍스트 정제 및 문장 분리
      // [1] 등 절 번호 제거 및 문장 단위 분리
      const sanitized = text.replace(/\[\d+\]|\b\d+\b/g, "").trim();
      const sentences = sanitized.split(/(?<=[.!?])\s+/);
      
      sentencesRef.current = sentences.filter(s => s.trim().length > 0);
      currentIndexRef.current = 0;
      
      if (sentencesRef.current.length > 0) {
        setIsPlaying(true);
        setIsPaused(false);
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
    setIsPaused(false);
  }, [supported]);

  const pause = useCallback(() => {
    if (!supported) return;
    
    // 모바일 크롬 등의 resume 버그를 피하기 위해 cancel을 사용하고 
    // 로컬 상태로만 일시정지를 관리함
    window.speechSynthesis.cancel();
    setIsPaused(true);
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    if (isPaused) {
      setIsPaused(false);
      playNext();
    }
  }, [isPaused, supported, playNext]);

  const toggleRate = useCallback(() => {
    const nextRate = rate === 1.0 ? 1.2 : rate === 1.2 ? 0.8 : 1.0;
    setRate(nextRate);
    
    // 재생 중이면 속도 변경을 적용하기 위해 현재 문장부터 다시 시작
    if (isPlaying && !isPaused) {
      window.speechSynthesis.cancel();
      playNext();
    }
  }, [rate, isPlaying, isPaused, playNext]);

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
