/**
 * WEB 성경 전체 단어 추출 → 원형 추출 → DeepL 번역 → JSON 저장
 * 실행: node scripts/build-bible-dictionary.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// .env.local 파싱 (DEEPL_API_KEY 읽기)
function loadEnv() {
  const envPath = join(ROOT, '.env.local');
  if (!existsSync(envPath)) return {};
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return env;
}

const env = loadEnv();
const DEEPL_API_KEY = process.env.DEEPL_API_KEY || env.DEEPL_API_KEY;
if (!DEEPL_API_KEY) {
  console.error('DEEPL_API_KEY가 없습니다. .env.local에 추가하세요.');
  process.exit(1);
}

// ── 불규칙 활용 (lemmatize.ts 와 동기화) ──────────────────────────────────
const IRREGULARS = {
  was: 'be', were: 'be', been: 'be', am: 'be', is: 'be', are: 'be',
  had: 'have', has: 'have',
  did: 'do', done: 'do',
  went: 'go', gone: 'go',
  came: 'come',
  said: 'say', told: 'tell',
  took: 'take', taken: 'take',
  gave: 'give', given: 'give',
  saw: 'see', seen: 'see',
  knew: 'know', known: 'know',
  got: 'get', gotten: 'get',
  made: 'make', brought: 'bring', thought: 'think', found: 'find',
  left: 'leave', kept: 'keep', felt: 'feel', met: 'meet',
  sat: 'sit', stood: 'stand', heard: 'hear', held: 'hold',
  led: 'lead', rose: 'rise', risen: 'rise',
  fell: 'fall', fallen: 'fall',
  grew: 'grow', grown: 'grow',
  drew: 'draw', drawn: 'draw',
  flew: 'fly', flown: 'fly',
  threw: 'throw', thrown: 'throw',
  blew: 'blow', blown: 'blow',
  broke: 'break', broken: 'break',
  chose: 'choose', chosen: 'choose',
  froze: 'freeze', frozen: 'freeze',
  spoke: 'speak', spoken: 'speak',
  wore: 'wear', worn: 'wear',
  bore: 'bear', borne: 'bear', born: 'bear',
  tore: 'tear', torn: 'tear',
  swore: 'swear', sworn: 'swear',
  wrote: 'write', written: 'write',
  rode: 'ride', ridden: 'ride',
  hid: 'hide', hidden: 'hide',
  bit: 'bite', bitten: 'bite',
  drove: 'drive', driven: 'drive',
  arose: 'arise', arisen: 'arise',
  ran: 'run', won: 'win',
  sang: 'sing', sung: 'sing',
  rang: 'ring', rung: 'ring',
  drank: 'drink', drunk: 'drink',
  swam: 'swim', swum: 'swim',
  began: 'begin', begun: 'begin',
  lay: 'lie', lain: 'lie',
  lit: 'light', built: 'build', bought: 'buy',
  caught: 'catch', taught: 'teach', sought: 'seek',
  fought: 'fight', sold: 'sell', spent: 'spend',
  sent: 'send', lent: 'lend', bent: 'bend',
  meant: 'mean', dealt: 'deal', slept: 'sleep',
  wept: 'weep', crept: 'creep', swept: 'sweep',
  knelt: 'kneel', dwelt: 'dwell',
  struck: 'strike', stricken: 'strike',
  woke: 'wake', woken: 'wake',
  strode: 'stride', smote: 'smite', smitten: 'smite',
  clad: 'clothe',
};

const CONSONANTS = new Set('bcdfghjklmnpqrstvwxyz');

function isConsonant(c) {
  return CONSONANTS.has(c.toLowerCase());
}

function getLemma(word) {
  const w = word.toLowerCase().trim();
  if (IRREGULARS[w]) return IRREGULARS[w];

  // -ing
  if (w.length > 4 && w.endsWith('ing')) {
    const stem = w.slice(0, -3);
    if (stem.length >= 3 && stem.at(-1) === stem.at(-2) && isConsonant(stem.at(-1))) {
      return stem.slice(0, -1); // running → run
    }
    return stem; // singing → sing (stem), coming → com (try stem+e 별도 처리 불필요: 사전엔 come도 포함됨)
  }

  // -ed
  if (w.length > 3 && w.endsWith('ed') && !w.endsWith('eed')) {
    if (w.endsWith('ied')) return w.slice(0, -3) + 'y'; // tried → try
    const stem = w.slice(0, -2);
    if (stem.length >= 3 && stem.at(-1) === stem.at(-2) && isConsonant(stem.at(-1))) {
      return stem.slice(0, -1); // grabbed → grab
    }
    return stem; // loved → lov (stem), 원형 love도 사전에 포함됨
  }

  // -ies
  if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y';

  // possessive
  if (w.endsWith("'s") || w.endsWith('\u2019s')) return w.replace(/'s|'s$/, '');

  return w;
}

// ── 성경 텍스트에서 단어 추출 ──────────────────────────────────────────────
console.log('📖 WEB 성경 66권 로드 중...');
const wordSet = new Set();
const WORD_REGEX = /[a-zA-Z'-]+/g;

for (let i = 1; i <= 66; i++) {
  const bookNum = String(i).padStart(2, '0');
  const filePath = join(ROOT, 'public', 'bible', `bible_book_${bookNum}.json`);
  if (!existsSync(filePath)) {
    console.warn(`  ⚠️  bible_book_${bookNum}.json 없음, 건너뜀`);
    continue;
  }
  const book = JSON.parse(readFileSync(filePath, 'utf-8'));
  for (const chapter of book.chapters) {
    for (const verse of chapter.verses) {
      const matches = verse.t.match(WORD_REGEX) || [];
      for (const m of matches) {
        wordSet.add(m.toLowerCase());
      }
    }
  }
}
console.log(`  → 고유 단어 형태: ${wordSet.size}개`);

// 원형으로 변환 후 재중복 제거
const lemmaSet = new Set();
for (const word of wordSet) {
  if (word.length <= 1) continue; // 단일 문자 제외 (a, i 등)
  if (/^\d+$/.test(word)) continue; // 순수 숫자 제외
  if (/^'+$/.test(word)) continue; // 순수 apostrophe 제외
  lemmaSet.add(getLemma(word));
}
// 원본 단어도 추가 (활용형 직접 조회 지원)
for (const word of wordSet) {
  if (word.length <= 1) continue;
  if (/^\d+$/.test(word)) continue;
  if (/^'+$/.test(word)) continue;
  lemmaSet.add(word);
}

const wordsToTranslate = Array.from(lemmaSet).sort();
console.log(`  → 번역 대상 (원형 + 활용형): ${wordsToTranslate.length}개`);

// ── DeepL 배치 번역 ────────────────────────────────────────────────────────
const BATCH_SIZE = 50;
const DELAY_MS = 300;
const dictionary = {};

async function translateBatch(words) {
  const body = {
    text: words,
    target_lang: 'KO',
    source_lang: 'EN',
  };
  const res = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepL 오류 ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.translations.map(t => t.text);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

console.log('\n🌐 DeepL 번역 시작...');
const batches = [];
for (let i = 0; i < wordsToTranslate.length; i += BATCH_SIZE) {
  batches.push(wordsToTranslate.slice(i, i + BATCH_SIZE));
}

let completed = 0;
for (const batch of batches) {
  try {
    const translations = await translateBatch(batch);
    for (let i = 0; i < batch.length; i++) {
      dictionary[batch[i]] = translations[i];
    }
    completed += batch.length;
    process.stdout.write(`\r  진행: ${completed}/${wordsToTranslate.length} (${Math.round(completed/wordsToTranslate.length*100)}%)`);
  } catch (err) {
    console.error(`\n  ❌ 배치 실패: ${err.message}`);
    console.error(`  실패한 단어들: ${batch.slice(0, 5).join(', ')}...`);
  }
  if (completed < wordsToTranslate.length) {
    await sleep(DELAY_MS);
  }
}

console.log('\n');

// ── 저장 ────────────────────────────────────────────────────────────────────
const outPath = join(ROOT, 'public', 'dictionary', 'web-dictionary.json');
writeFileSync(outPath, JSON.stringify(dictionary, null, 0), 'utf-8');

const size = (readFileSync(outPath).length / 1024).toFixed(1);
console.log(`✅ 저장 완료: public/dictionary/web-dictionary.json`);
console.log(`   항목 수: ${Object.keys(dictionary).length}개 | 파일 크기: ${size} KB`);

// 샘플 확인
const samples = ['covenant', 'righteousness', 'behold', 'sanctify', 'mercy', 'wrath', 'repent'];
console.log('\n📋 샘플 번역:');
for (const w of samples) {
  if (dictionary[w]) console.log(`   ${w} → ${dictionary[w]}`);
}
