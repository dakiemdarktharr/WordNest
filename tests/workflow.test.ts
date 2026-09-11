import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseTxt,
  emptyData,
  emptyReview,
  schedule,
  makeSession,
  completeSession,
  reviewKey,
  type StudyData,
} from '../lib/learning.ts';
import {
  loadData,
  saveData,
  parseBackup,
  sessionScore,
  STORAGE_KEY,
} from '../lib/storage.ts';
const now = 1_800_000_000_000;
function fixture(mode: 'practice' | 'test' | 'write' = 'test'): StudyData {
  const source =
    'resilient :: kiên cường\ncurious :: tò mò\nthoughtful :: chu đáo';
  const deck = {
    id: 'words',
    title: 'WordNest demo',
    source,
    questions: parseTxt(source).questions,
    createdAt: now,
  };
  return {
    ...emptyData(),
    decks: [deck],
    sessions: [makeSession(deck, mode, 3, false, 0, true)],
  };
}
void test('TXT limit counts UTF-8 bytes, not characters', () => {
  const text = 'term :: ' + 'ế'.repeat(340000);
  assert.ok(text.length < 1_000_000);
  assert.match(parseTxt(text).errors[0].message, /quá lớn/);
});
void test('accepts exactly 1000 vocabulary pairs and rejects 1001', () => {
  const raw = Array.from(
    { length: 1000 },
    (_, i) => `word${i} :: nghĩa ${i}`,
  ).join('\n');
  assert.equal(parseTxt(raw).questions.length, 1000);
  assert.equal(parseTxt(raw).errors.length, 0);
  assert.ok(parseTxt(raw + '\nextra :: dư').errors.length > 0);
});
void test('spaced repetition progresses across reviews and caps long intervals', () => {
  const first = schedule(emptyReview(), 2, now);
  const second = schedule(first, 2, first.due);
  assert.equal(second.interval, 2);
  assert.equal(second.due, first.due + 2 * 86400000);
  assert.equal(second.repetitions, 2);
  const capped = schedule({ ...second, interval: 3000 }, 3, now);
  assert.equal(capped.interval, 3650);
  assert.equal(capped.due, now + 3650 * 86400000);
});
void test('quiz submission advances correct cards and relearns wrong or skipped cards', () => {
  const data = fixture();
  data.reviews['words:q1'] = {
    ...schedule(emptyReview(), 2, now),
    starred: true,
  };
  const s = data.sessions[0];
  s.answers.q1 = { selected: ['1'], correct: false }; // Regrade, do not trust a cached flag.
  s.answers.q2 = { selected: ['d0'], correct: true };
  const before = JSON.stringify(data);
  const next = completeSession(data, s.id, now + 1000);
  assert.equal(JSON.stringify(data), before);
  assert.equal(next.reviews['words:q1'].interval, 2);
  assert.equal(next.reviews['words:q1'].starred, true);
  assert.equal(next.reviews['words:q1'].correct, 1);
  for (const id of ['q2', 'q3']) {
    assert.equal(next.reviews[reviewKey('words', id)].due, now + 1000 + 60000);
    assert.equal(next.reviews[reviewKey('words', id)].wrong, 1);
    assert.equal(next.reviews[reviewKey('words', id)].repetitions, 0);
  }
  assert.deepEqual(sessionScore(next.sessions[0]), { correct: 1, total: 3 });
});
void test('submission is idempotent, including a finished timestamp of zero', () => {
  const d = fixture();
  const next = completeSession(d, d.sessions[0].id, 0);
  assert.equal(completeSession(next, d.sessions[0].id, now), next);
  assert.equal(completeSession(d, 'missing', now), d);
});
void test('written quizzes use text grading for review schedules', () => {
  const d = fixture('write');
  d.sessions[0].answers.q1 = {
    selected: [],
    typed: ' RESILIENT ',
    correct: false,
  };
  const next = completeSession(d, d.sessions[0].id, now);
  assert.equal(next.reviews['words:q1'].interval, 1);
  assert.deepEqual(sessionScore(next.sessions[0]), { correct: 1, total: 3 });
});
void test('reviewing one quiz preserves other decks and unrelated reviews', () => {
  const d = fixture();
  d.reviews['words:q1'] = { ...emptyReview(), correct: 4, wrong: 2 };
  const other = { ...d.decks[0], id: 'other' };
  d.decks.push(other);
  d.reviews['other:q1'] = schedule(emptyReview(), 3, now);
  const next = completeSession(d, d.sessions[0].id, now);
  assert.equal(next.decks, d.decks);
  assert.equal(next.reviews['other:q1'], d.reviews['other:q1']);
  assert.equal(next.reviews['words:q1'].wrong, 3);
  assert.equal(next.reviews['words:q1'].correct, 4);
});
void test('import-study-quiz progress round-trips through persisted JSON and reload', () => {
  const data = fixture();
  data.reviews['words:q1'] = schedule(emptyReview(), 2, now);
  data.sessions[0].answers.q1 = { selected: ['1'], correct: true };
  const completed = completeSession(data, data.sessions[0].id, now + 1000);
  let raw: string | null = null;
  const memory = {
    getItem: () => raw,
    setItem: (_key: string, value: string) => {
      raw = value;
    },
  };
  saveData(memory, null, completed);
  assert.deepEqual(loadData(memory).data, completed);
  assert.deepEqual(parseBackup(raw!), completed);
});
void test('failed save does not mutate a prior review and retry applies it exactly once', () => {
  const data = fixture();
  let raw = JSON.stringify(data);
  const previous = raw;
  const complete = completeSession(data, data.sessions[0].id, now);
  assert.throws(
    () =>
      saveData(
        {
          getItem: () => raw,
          setItem: () => {
            throw new Error('QuotaExceeded');
          },
        },
        raw,
        complete,
      ),
    /Quota/,
  );
  assert.equal(raw, previous);
  assert.deepEqual(data.reviews, {});
  saveData(
    {
      getItem: () => raw,
      setItem: (_key, value) => {
        raw = value;
      },
    },
    raw,
    complete,
  );
  const restored = loadData({ getItem: () => raw }).data;
  assert.equal(
    completeSession(restored, restored.sessions[0].id, now + 1000),
    restored,
  );
  assert.equal(restored.reviews['words:q1'].wrong, 1);
});
void test('corrupt or denied local storage is surfaced, never silently treated as an empty library', () => {
  let raw = '{broken json';
  assert.throws(() => loadData({ getItem: () => raw }));
  assert.equal(raw, '{broken json');
  assert.throws(
    () =>
      loadData({
        getItem: () => {
          throw new Error('SecurityError');
        },
      }),
    /SecurityError/,
  );
  assert.deepEqual(loadData({ getItem: () => null }).data, emptyData());
  raw = JSON.stringify(emptyData());
  assert.equal(STORAGE_KEY, 'wordnest:v1');
});
