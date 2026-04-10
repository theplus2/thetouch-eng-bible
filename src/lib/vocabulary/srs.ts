/**
 * Spaced Repetition System (SRS) - Modified SM-2 Algorithm
 * 
 * "알아요" (Know): Quality = 4
 * "다시" (Again): Quality = 1
 */

export interface SRSState {
  reviewCount: number;
  easeFactor: number;
  interval: number;
  nextReviewAt: string; // ISO String
}

export function calculateNextReview(
  quality: 1 | 4,
  currentState: { reviewCount: number; easeFactor: number; interval: number }
): SRSState {
  let { reviewCount, easeFactor, interval } = currentState;

  if (quality < 3) {
    // 기억이 안 남 ("다시")
    reviewCount = 0;
    interval = 1; // 내일 다시 복습
    easeFactor = Math.max(1.3, easeFactor - 0.2); // EF 감소, 최소 1.3
  } else {
    // 기억함 ("알아요")
    if (reviewCount === 0) {
      interval = 1;
    } else if (reviewCount === 1) {
      interval = 3; // 첫 번째 성공 후 3일
    } else {
      interval = Math.round(interval * easeFactor);
    }
    
    reviewCount += 1;
    
    // Quality 4 means correct but took some thought. 
    // SM-2 Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    // For q=4: EF' = EF + 0.0
    // If we wanted q=5 (easy), it would increase by 0.1
    // We'll slightly increase EF for correct answers to make intervals longer for consecutive successes.
    easeFactor = easeFactor + 0.1; 
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  nextDate.setHours(0, 0, 0, 0); // 자정 기준으로 다음 복습 날짜 설정

  return {
    reviewCount,
    easeFactor,
    interval,
    nextReviewAt: nextDate.toISOString(),
  };
}

export const INITIAL_SRS_STATE = {
  reviewCount: 0,
  easeFactor: 2.5,
  interval: 0,
};
