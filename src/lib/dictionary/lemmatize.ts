/** 영어 활용형 → 원형 추출 (규칙 기반 + 불규칙) */

const IRREGULARS: Record<string, [lemma: string, type: string]> = {
  // be
  was: ['be', '과거형'], were: ['be', '과거형'], been: ['be', '과거분사'],
  am: ['be', '현재형'], is: ['be', '현재형'], are: ['be', '현재형'],
  // have / do
  had: ['have', '과거형'], has: ['have', '3인칭 단수'],
  did: ['do', '과거형'], done: ['do', '과거분사'],
  // go / come
  went: ['go', '과거형'], gone: ['go', '과거분사'],
  came: ['come', '과거형'],
  // common
  said: ['say', '과거형'],
  told: ['tell', '과거형'],
  took: ['take', '과거형'], taken: ['take', '과거분사'],
  gave: ['give', '과거형'], given: ['give', '과거분사'],
  saw: ['see', '과거형'], seen: ['see', '과거분사'],
  knew: ['know', '과거형'], known: ['know', '과거분사'],
  got: ['get', '과거형'], gotten: ['get', '과거분사'],
  made: ['make', '과거형'],
  brought: ['bring', '과거형'],
  thought: ['think', '과거형'],
  found: ['find', '과거형'],
  left: ['leave', '과거형'],
  kept: ['keep', '과거형'],
  felt: ['feel', '과거형'],
  met: ['meet', '과거형'],
  sat: ['sit', '과거형'],
  stood: ['stand', '과거형'],
  heard: ['hear', '과거형'],
  held: ['hold', '과거형'],
  led: ['lead', '과거형'],
  rose: ['rise', '과거형'], risen: ['rise', '과거분사'],
  fell: ['fall', '과거형'], fallen: ['fall', '과거분사'],
  grew: ['grow', '과거형'], grown: ['grow', '과거분사'],
  drew: ['draw', '과거형'], drawn: ['draw', '과거분사'],
  flew: ['fly', '과거형'], flown: ['fly', '과거분사'],
  threw: ['throw', '과거형'], thrown: ['throw', '과거분사'],
  blew: ['blow', '과거형'], blown: ['blow', '과거분사'],
  broke: ['break', '과거형'], broken: ['break', '과거분사'],
  chose: ['choose', '과거형'], chosen: ['choose', '과거분사'],
  froze: ['freeze', '과거형'], frozen: ['freeze', '과거분사'],
  spoke: ['speak', '과거형'], spoken: ['speak', '과거분사'],
  wore: ['wear', '과거형'], worn: ['wear', '과거분사'],
  bore: ['bear', '과거형'], borne: ['bear', '과거분사'], born: ['bear', '과거분사'],
  tore: ['tear', '과거형'], torn: ['tear', '과거분사'],
  swore: ['swear', '과거형'], sworn: ['swear', '과거분사'],
  wrote: ['write', '과거형'], written: ['write', '과거분사'],
  rode: ['ride', '과거형'], ridden: ['ride', '과거분사'],
  hid: ['hide', '과거형'], hidden: ['hide', '과거분사'],
  bit: ['bite', '과거형'], bitten: ['bite', '과거분사'],
  drove: ['drive', '과거형'], driven: ['drive', '과거분사'],
  arose: ['arise', '과거형'], arisen: ['arise', '과거분사'],
  ran: ['run', '과거형'], won: ['win', '과거형'],
  sang: ['sing', '과거형'], sung: ['sing', '과거분사'],
  rang: ['ring', '과거형'], rung: ['ring', '과거분사'],
  drank: ['drink', '과거형'], drunk: ['drink', '과거분사'],
  swam: ['swim', '과거형'], swum: ['swim', '과거분사'],
  began: ['begin', '과거형'], begun: ['begin', '과거분사'],
  lay: ['lie', '과거형'], lain: ['lie', '과거분사'],
  lit: ['light', '과거형'],
  built: ['build', '과거형'],
  bought: ['buy', '과거형'],
  caught: ['catch', '과거형'],
  taught: ['teach', '과거형'],
  sought: ['seek', '과거형'],
  fought: ['fight', '과거형'],
  sold: ['sell', '과거형'],
  spent: ['spend', '과거형'],
  sent: ['send', '과거형'],
  lent: ['lend', '과거형'],
  bent: ['bend', '과거형'],
  meant: ['mean', '과거형'],
  dealt: ['deal', '과거형'],
  slept: ['sleep', '과거형'],
  wept: ['weep', '과거형'],
  crept: ['creep', '과거형'],
  swept: ['sweep', '과거형'],
  knelt: ['kneel', '과거형'],
  dwelt: ['dwell', '과거형'],
  struck: ['strike', '과거형'], stricken: ['strike', '과거분사'],
  woke: ['wake', '과거형'], woken: ['wake', '과거분사'],
  strode: ['stride', '과거형'],
  smote: ['smite', '과거형'], smitten: ['smite', '과거분사'],
  clad: ['clothe', '과거형'],
};

export interface LemmaResult {
  /** 조회해볼 원형 후보들 (우선순위 순) */
  candidates: string[];
  /** "pluck의 과거형" 등으로 조립하기 위한 베이스 텍스트 */
  ruleNote: string | null;
}

export function getLemma(word: string): LemmaResult {
  const w = word.toLowerCase().trim();

  // 불규칙
  if (IRREGULARS[w]) {
    const [lemma, type] = IRREGULARS[w];
    return { candidates: [lemma], ruleNote: `${lemma}의 ${type}` };
  }

  // -ing (현재분사 / 동명사)
  if (w.length > 4 && w.endsWith('ing')) {
    const stem = w.slice(0, -3); // coming -> com, running -> runn
    const cands: string[] = [];
    
    // 그냥 그대로 우선 확인 (sing -> sing)
    cands.push(stem);
    // e-drop 복구 (mak -> make)
    cands.push(stem + 'e');
    
    // 자음 중복 탈락 (runn -> run)
    if (stem.length >= 3 && stem.at(-1) === stem.at(-2)) {
      cands.push(stem.slice(0, -1));
    }
    
    return { candidates: cands, ruleNote: '현재분사' };
  }

  // -ed (과거형 / 과거분사)
  if (w.length > 3 && w.endsWith('ed') && !w.endsWith('eed')) {
    // tried → try
    if (w.endsWith('ied')) {
      const lemma = w.slice(0, -3) + 'y';
      return { candidates: [lemma], ruleNote: '과거형' };
    }
    
    const stem = w.slice(0, -2); // kissed -> kiss, lived -> liv, grabbed -> grabb
    const cands: string[] = [];
    
    // 자음 중복 (grabbed -> grab). ss, ll, ff, zz 등은 예외 처리
    let isDoubled = false;
    if (stem.length >= 3 && stem.at(-1) === stem.at(-2)) {
      const lastChar = stem.at(-1)!;
      if (!['s', 'l', 'f', 'z'].includes(lastChar)) {
        cands.push(stem.slice(0, -1)); // grab
        isDoubled = true;
      }
    }
    
    const lastStemChar = stem.at(-1)!;
    
    if (!isDoubled) {
      // v, c로 끝나는 stem은 원형이 e로 끝날 확률이 99% (liv -> live, danc -> dance)
      if (['v', 'c'].includes(lastStemChar)) {
        cands.push(stem + 'e');
        cands.push(stem);
      } 
      // ss, sh, ch, x 등으로 끝나는 경우는 e가 안 붙을 확률이 높음 (kiss -> kiss, wish -> wish)
      else if (['s', 'h', 'x'].includes(lastStemChar)) {
        cands.push(stem);
        cands.push(stem + 'e');
      } 
      // 그 외 일반적인 경우: stem (play -> play) 먼저, 그리고 stem+e (bak -> bake)
      else {
        cands.push(stem);
        cands.push(stem + 'e');
      }
    } else {
      // 이중 자음이라 이미 grab을 넣은 경우, 혹시 몰라 원래 형태도 추가
      cands.push(stem);
      cands.push(stem + 'e');
    }
    
    return { candidates: cands, ruleNote: '과거형/과거분사' };
  }

  // -ies (복수 / 3인칭 단수)
  if (w.endsWith('ies') && w.length > 4) {
    const lemma = w.slice(0, -3) + 'y';
    return { candidates: [lemma], ruleNote: '복수/3인칭 단수' };
  }

  // possessive
  if (w.endsWith("'s") || w.endsWith('\u2019s')) {
    return { candidates: [w.replace(/'s|'s$/, '')], ruleNote: null };
  }

  return { candidates: [w], ruleNote: null };
}
