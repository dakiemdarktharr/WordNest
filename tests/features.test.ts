import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createVocabularyDeck } from '../lib/deck-builder.ts';
import {
  type Session,
  emptyData,
  makeSession,
  parseTxt,
  completeSession,
  quizQuestions,
} from '../lib/learning.ts';
import { answerMastery, advanceMastery } from '../lib/mastery.ts';
import {
  parseBackup,
  sessionScore,
  saveData,
  loadData,
} from '../lib/storage.ts';
import { loadTheme, THEME_KEY } from '../lib/theme.ts';
const rows = [
  { term: ' apple ', meaning: ' quả táo ' },
  { term: 'pear', meaning: 'quả lê' },
  { term: 'grape', meaning: 'quả nho' },
];
function fixture() {
  const deck = createVocabularyDeck(' Fruits ', rows);
  return {
    ...emptyData(),
    decks: [deck],
    sessions: [makeSession(deck, 'mastery', 3, false, 10, false)],
  };
}
function select(data: ReturnType<typeof fixture>, correct: boolean) {
  const s = data.sessions[0];
  const q = s.questions[s.index];
  return {
    ...data,
    sessions: [
      answerMastery(s, [q.choices.find((c) => c.correct === correct)!.id]),
    ],
  };
}
await test('manual deck creates compatible TXT, flashcards and quiz distractors', () => {
  const deck = createVocabularyDeck(' Fruits ', rows);
  assert.equal(deck.title, 'Fruits');
  assert.deepEqual(parseTxt(deck.source).questions, deck.questions);
  assert.equal(quizQuestions(deck.questions)[0].choices.length, 3);
  assert.deepEqual(
    parseBackup(JSON.stringify({ ...emptyData(), decks: [deck] })).decks[0],
    deck,
  );
});
await test('manual deck rejects missing fields, ambiguous TXT and limits without partial import', () => {
  for (const row of [
    { term: '', meaning: 'x' },
    { term: 'x', meaning: '' },
    { term: 'a::b', meaning: 'c' },
    { term: '1. word', meaning: 'c' },
    { term: 'x', meaning: 'a\nb' },
  ]) {
    assert.throws(() => createVocabularyDeck('x', [row]));
  }
  assert.throws(() => createVocabularyDeck('', rows));
  assert.throws(() => createVocabularyDeck('x'.repeat(121), rows));
  assert.throws(() => createVocabularyDeck('x', []));
  assert.throws(() => createVocabularyDeck('x', Array(1001).fill(rows[0])));
  assert.throws(() =>
    createVocabularyDeck('x', [{ term: 'x', meaning: 'ế'.repeat(340000) }]),
  );
});
await test('wrong answers return at end, single remaining wrong repeats until correct, score retains first attempt', () => {
  let data = fixture();
  const id = data.sessions[0].id;
  assert.equal(data.sessions[0].deadline, null);
  assert.equal(completeSession(data, id, 1000), data);
  const original = structuredClone(data);
  data = select(data, false);
  assert.deepEqual(original.sessions[0].answers, {});
  data = advanceMastery(data, id, 1000);
  assert.deepEqual(data.sessions[0].mastery?.queue, ['q2', 'q3', 'q1']);
  for (let i = 0; i < 2; i++)
    data = advanceMastery(select(data, true), id, 1000);
  for (let i = 0; i < 8; i++) {
    data = advanceMastery(select(data, false), id, 1000);
    assert.deepEqual(data.sessions[0].mastery?.queue, ['q1']);
    assert.equal(data.sessions[0].finishedAt, null);
    assert.equal(data.sessions[0].mastery?.feedback, null);
  }
  data = advanceMastery(select(data, true), id, 1000);
  assert.equal(data.sessions[0].finishedAt, 1000);
  assert.deepEqual(data.sessions[0].mastery?.queue, []);
  assert.equal(data.sessions[0].mastery?.attempts, 12);
  assert.deepEqual(sessionScore(data.sessions[0]), { correct: 2, total: 3 });
  assert.equal(data.reviews[data.decks[0].id + ':q1'].due, 61000);
  assert.equal(data.reviews[data.decks[0].id + ':q2'].interval, 1);
  assert.equal(advanceMastery(data, id, 5000), data);
  assert.equal(completeSession(data, id, 5000), data);
  assert.deepEqual(parseBackup(JSON.stringify(data)), data);
});
await test('mastery ignores duplicate submits, empty and invalid choices; exact multi-answer grading', () => {
  const data = fixture();
  const s = data.sessions[0];
  assert.equal(answerMastery(s, []), s);
  assert.equal(answerMastery(s, ['invalid']), s);
  const answered = select(data, false).sessions[0];
  assert.equal(answerMastery(answered, ['1']), answered);
  assert.equal(advanceMastery(data, s.id, 0), data);
  const deck = createVocabularyDeck('x', rows);
  deck.questions = parseTxt('1. Pick two [1*] A [2*] B [3] C').questions;
  const multi = makeSession(deck, 'mastery', 1, false, 0, false);
  assert.equal(answerMastery(multi, ['1']).mastery?.feedback?.correct, false);
  assert.equal(
    answerMastery(multi, ['2', '1']).mastery?.feedback?.correct,
    true,
  );
});
await test('mastery persistence resumes feedback and pending retries, failed write leaves old state', () => {
  let data = select(fixture(), false);
  let raw: string | null = null;
  const storage = {
    getItem: () => raw,
    setItem: (_key: string, value: string) => {
      raw = value;
    },
  };
  saveData(storage, null, data);
  assert.deepEqual(loadData(storage).data, data);
  const next = advanceMastery(data, data.sessions[0].id, 0);
  assert.throws(() =>
    saveData(
      {
        ...storage,
        setItem: () => {
          throw new Error('quota');
        },
      },
      raw,
      next,
    ),
  );
  assert.deepEqual(loadData(storage).data, data);
  saveData(storage, raw, next);
  data = loadData(storage).data;
  assert.equal(data.sessions[0].index, 1);
  assert.equal(data.sessions[0].mastery?.feedback, null);
});
await test('backup rejects broken mastery queues and regrades feedback', () => {
  const data = select(fixture(), false);
  for (const change of [
    (s: Session) => {
      delete s.mastery;
    },
    (s: Session) => {
      s.mastery!.queue = ['absent'];
    },
    (s: Session) => {
      s.mastery!.queue = ['q1', 'q1'];
    },
    (s: Session) => {
      s.mastery!.queue = ['q2'];
    },
    (s: Session) => {
      s.mastery!.queue = [];
    },
    (s: Session) => {
      s.mastery!.attempts = -1;
    },
    (s: Session) => {
      s.mastery!.feedback!.selected = ['missing'];
    },
    (s: Session) => {
      s.finishedAt = 1;
    },
  ]) {
    const broken = structuredClone(data);
    change(broken.sessions[0]);
    assert.throws(() => parseBackup(JSON.stringify(broken)));
  }
  data.sessions[0].mastery!.feedback!.correct = true;
  assert.equal(
    parseBackup(JSON.stringify(data)).sessions[0].mastery?.feedback?.correct,
    false,
  );
});
await test('old backups remain valid and theme setting is independent of learning data', () => {
  const data = fixture();
  data.sessions = [makeSession(data.decks[0], 'practice', 3, false, 0, false)];
  assert.deepEqual(parseBackup(JSON.stringify(data)), data);
  assert.equal(THEME_KEY, 'wordnest:theme');
  assert.equal(loadTheme({ getItem: () => 'dark' }, false), 'dark');
  assert.equal(loadTheme({ getItem: () => 'light' }, true), 'light');
  assert.equal(loadTheme({ getItem: () => 'invalid' }, true), 'dark');
  assert.equal(
    loadTheme({
      getItem: () => {
        throw new Error('denied');
      },
    }),
    'light',
  );
});
