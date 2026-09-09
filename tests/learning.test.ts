import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseTxt,
  grade,
  gradeWritten,
  quizQuestions,
  schedule,
  emptyReview,
  emptyData,
  makeSession,
  solution,
  DEMO_TXT,
  shuffle,
} from '../lib/learning.ts';
import { parseBackup, saveData, STORAGE_KEY } from '../lib/storage.ts';

const question = () =>
  parseTxt('1. câu hỏi 1? [1] A [2] B [3*] C [4] D').questions[0];
void test('exact user format yields four choices and C correct', () => {
  const r = parseTxt('1. câu hỏi 1? [1] A [2] B [3*] C [4] D');
  assert.equal(r.errors.length, 0);
  assert.equal(r.questions.length, 1);
  assert.equal(r.questions[0].prompt, 'câu hỏi 1?');
  assert.equal(r.questions[0].choices.length, 4);
  assert.equal(solution(r.questions[0]), 'C');
});
void test('supports literal escaped asterisk', () => {
  const r = parseTxt('1. Q? [1] A [2\\*] B');
  assert.equal(r.errors.length, 0);
  assert.equal(solution(r.questions[0]), 'B');
});
void test('UTF-8 BOM, Windows newlines, multiline and explanation stay intact', () => {
  const r = parseTxt(
    '\uFEFF1. curious\r\n[1*] tò mò\r\n[2] buồn\r\nGiải thích: Stay curious.\r\nVẫn ham học.\r\n\r\n2. apple [1] cam [2*] táo',
  );
  assert.equal(r.errors.length, 0);
  assert.equal(r.questions.length, 2);
  assert.equal(r.questions[0].explanation, 'Stay curious.\nVẫn ham học.');
  assert.equal(solution(r.questions[1]), 'táo');
});
void test('blank prefixes preserve error line numbers', () => {
  const r = parseTxt('\n\n1. test [1] A [2] B');
  assert.equal(r.errors[0].line, 3);
});
void test('multiple correct choices require exact set and disallow duplicates', () => {
  const q = parseTxt('1. even [1*] 2 [2] 3 [3*] 4').questions[0];
  assert.equal(grade(q, ['1', '3']), true);
  assert.equal(grade(q, ['3', '1']), true);
  assert.equal(grade(q, ['1']), false);
  assert.equal(grade(q, ['1', '2', '3']), false);
  assert.equal(grade(q, ['1', '1']), false);
});
void test('shuffling does not mutate source or corrupt correct answer IDs', () => {
  const q = question();
  const original = JSON.stringify(q);
  const shuffled = quizQuestions([q])[0];
  assert.equal(JSON.stringify(q), original);
  assert.equal(grade(shuffled, ['3']), true);
  const source = [1, 2, 3, 4];
  assert.deepEqual(
    shuffle(source).sort((a, b) => a - b),
    source,
  );
  assert.deepEqual(source, [1, 2, 3, 4]);
});
void test('rejects missing stars, empty choices, duplicate choices, duplicate numbers, malformed stars', () => {
  for (const raw of [
    '1. Q [1] A [2] B',
    '1. Q [1*] [2] B',
    '1. Q [1*] A [1] B',
    '1. Q [1*] A [2] B\n1. W [1*] C [2] D',
    '1. Q [1*] A [2] B [3**] C',
  ])
    assert.ok(parseTxt(raw).errors.length, raw);
});
void test('empty input, unstructured prose and oversized inputs produce errors', () => {
  for (const raw of ['', '   ', 'some text', 'a'.repeat(1_000_001)])
    assert.ok(parseTxt(raw).errors.length);
});
void test('enforces question limit before processing oversized question sets', () => {
  const raw = Array.from(
    { length: 1001 },
    (_, i) => i + 1 + '. Q [1*] A [2] B',
  ).join('\n');
  assert.ok(parseTxt(raw).errors.some((e) => e.message.includes('1000')));
});
void test('plain vocabulary format supports Unicode and meaningful embedded separators', () => {
  const r = parseTxt(
    'apple :: quả táo\n\ncurious :: tò mò\noperator :: ký hiệu ::',
  );
  assert.equal(r.errors.length, 0);
  assert.equal(r.questions.length, 3);
  assert.equal(solution(r.questions[2]), 'ký hiệu ::');
});
void test('vocabulary errors never silently import an incomplete file', () => {
  const r = parseTxt('apple :: quả táo\nmissing definition\ncurious ::');
  assert.equal(r.questions.length, 1);
  assert.equal(r.errors.length, 2);
});
void test('generated distractors are distinct and exclude the true answer', () => {
  const source = parseTxt(
    'apple :: táo\nfruit :: táo\norange :: cam\nbanana :: chuối',
  ).questions;
  const qs = quizQuestions(source);
  assert.equal(qs[0].choices.length, 3);
  for (const q of qs) {
    assert.equal(q.choices.filter((c) => c.correct).length, 1);
    assert.equal(new Set(q.choices.map((c) => c.text)).size, q.choices.length);
    assert.equal(grade(q, ['1']), true);
  }
});
void test('write grading handles direction, case, spaces and keeps Vietnamese accents significant', () => {
  const q = parseTxt('Thoughtful :: chu đáo').questions[0];
  assert.equal(gradeWritten(q, ' thoughtful  ', true), true);
  assert.equal(gradeWritten(q, ' CHU  ĐÁO ', false), true);
  assert.equal(gradeWritten(q, 'chu dao', false), false);
});
void test('review ratings use actual due dates and forgetting resets repetitions', () => {
  const now = 1700000000000;
  assert.equal(schedule(emptyReview(), 0, now).due, now + 60000);
  assert.equal(schedule(emptyReview(), 1, now).due, now + 600000);
  assert.equal(schedule(emptyReview(), 2, now).due, now + 86400000);
  assert.equal(schedule(emptyReview(), 3, now).due, now + 345600000);
  const old = { ...emptyReview(), interval: 4, repetitions: 3, starred: true };
  assert.equal(schedule(old, 2, now).interval, 8);
  assert.equal(schedule(old, 0, now).repetitions, 0);
  assert.equal(schedule(old, 0, now).starred, true);
});
void test('new sessions snapshot questions, enforce counts, timers and retry filter', () => {
  const deck = {
    id: 'deck',
    title: 'Demo',
    source: DEMO_TXT,
    questions: parseTxt(DEMO_TXT).questions,
    createdAt: Date.now(),
  };
  const s = makeSession(deck, 'test', 3, false, 5, true);
  assert.equal(s.questions.length, 3);
  assert.equal(s.deadline! - s.startedAt, 300000);
  assert.equal(s.finishedAt, null);
  assert.equal(
    makeSession(deck, 'practice', 10, true, 0, false, ['q2']).questions[0].id,
    'q2',
  );
});
void test('write sessions omit questions with multiple correct answers', () => {
  const deck = {
    id: 'deck',
    title: 'Demo',
    source: '',
    questions: [question(), parseTxt('1. even [1*] 2 [2*] 4').questions[0]].map(
      (q, i) => ({ ...q, id: 'q' + i }),
    ),
    createdAt: 1,
  };
  assert.equal(
    makeSession(deck, 'write', 10, false, 0, true).questions.length,
    1,
  );
});
function sampleData() {
  const d = emptyData();
  d.decks = [
    {
      id: 'deck',
      title: 'Demo',
      source: DEMO_TXT,
      questions: parseTxt(DEMO_TXT).questions,
      createdAt: 1,
    },
  ];
  d.sessions = [makeSession(d.decks[0], 'test', 3, false, 0, false)];
  return d;
}
void test('backup round-trip preserves full library and resumable sessions', () => {
  const d = sampleData();
  assert.deepEqual(parseBackup(JSON.stringify(d)), d);
});
void test('backup validator rejects broken schemas, choices, dates, references and session indexes', () => {
  const invalid = [
    { ...sampleData(), version: 2 },
    { ...sampleData(), decks: [{ ...sampleData().decks[0], questions: [] }] },
    {
      ...sampleData(),
      decks: [{ ...sampleData().decks[0], createdAt: 'today' }],
    },
    {
      ...sampleData(),
      sessions: [{ ...sampleData().sessions[0], index: 500 }],
    },
    {
      ...sampleData(),
      sessions: [{ ...sampleData().sessions[0], deckId: 'unknown' }],
    },
    {
      ...sampleData(),
      sessions: [
        {
          ...sampleData().sessions[0],
          answers: { q1: { selected: ['unknown'], correct: true } },
        },
      ],
    },
  ];
  for (const d of invalid) assert.throws(() => parseBackup(JSON.stringify(d)));
  assert.throws(() =>
    parseBackup(
      '{"version":1,"decks":[],"sessions":[],"reviews":{"__proto__":{"due":0}}}',
    ),
  );
});
void test('backup recalculates answer correctness rather than trusting stored booleans', () => {
  const d = sampleData();
  d.sessions[0].answers.q1 = { selected: ['1'], correct: true };
  assert.equal(
    parseBackup(JSON.stringify(d)).sessions[0].answers.q1.correct,
    false,
  );
});
void test('storage writes are atomic on quota errors and detect cross-tab conflicts', () => {
  let stored: string | null = null;
  const memory = {
    getItem: (key: string) => (key === STORAGE_KEY ? stored : null),
    setItem: (_key: string, value: string) => {
      stored = value;
    },
  };
  const raw = saveData(memory, null, emptyData());
  assert.equal(stored, raw);
  assert.throws(() => saveData(memory, null, sampleData()), /tab/);
  assert.equal(stored, raw);
  assert.throws(
    () =>
      saveData(
        {
          ...memory,
          setItem: () => {
            throw new Error('QuotaExceeded');
          },
        },
        raw,
        sampleData(),
      ),
    /Quota/,
  );
  assert.equal(stored, raw);
});
