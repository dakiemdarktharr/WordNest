import {
  emptyData,
  grade,
  gradeWritten,
  type StudyData,
  type Question,
  type Session,
} from './learning.ts';
export const STORAGE_KEY = 'wordnest:v1';
const obj = (v: unknown): v is Record<string, unknown> =>
  Boolean(v) && typeof v === 'object' && !Array.isArray(v);
const str = (v: unknown, max = 100000): v is string =>
  typeof v === 'string' && v.length <= max;
const num = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0;
const id = (v: unknown): v is string => str(v, 100) && /^[\w-]+$/.test(v);
function isQuestion(v: unknown): v is Question {
  return (
    obj(v) &&
    id(v.id) &&
    str(v.prompt) &&
    v.prompt.trim().length > 0 &&
    str(v.explanation) &&
    ['pair', 'quiz'].includes(String(v.kind)) &&
    Array.isArray(v.choices) &&
    v.choices.length >= 1 &&
    v.choices.length <= 10 &&
    v.choices.every(
      (c) =>
        obj(c) &&
        id(c.id) &&
        str(c.text) &&
        c.text.trim().length > 0 &&
        typeof c.correct === 'boolean',
    ) &&
    v.choices.some((c) => c.correct) &&
    new Set(v.choices.map((c) => c.id)).size === v.choices.length
  );
}
const uniqueQuestions = (v: unknown): v is Question[] =>
  Array.isArray(v) &&
  v.length > 0 &&
  v.length <= 1000 &&
  v.every(isQuestion) &&
  new Set(v.map((q) => q.id)).size === v.length;
export function parseBackup(raw: string): StudyData {
  if (raw.length > 12_000_000)
    throw new Error('Bản sao lưu quá lớn (tối đa 12 MB).');
  const data: unknown = JSON.parse(raw);
  if (
    !obj(data) ||
    data.version !== 1 ||
    !Array.isArray(data.decks) ||
    data.decks.length > 200 ||
    !obj(data.reviews) ||
    !Array.isArray(data.sessions) ||
    data.sessions.length > 100
  )
    throw new Error('Bản sao lưu WordNest không hợp lệ.');
  for (const d of data.decks) {
    if (
      !obj(d) ||
      !id(d.id) ||
      !str(d.title, 120) ||
      !d.title.trim() ||
      !str(d.source, 1_000_000) ||
      !num(d.createdAt) ||
      !uniqueQuestions(d.questions)
    )
      throw new Error('Bộ từ trong bản sao lưu không hợp lệ.');
  }
  if (new Set(data.decks.map((d) => d.id)).size !== data.decks.length)
    throw new Error('Bản sao lưu bị trùng bộ từ.');
  const questionKeys = new Set(
    data.decks.flatMap((d) =>
      d.questions.map((q: Question) => d.id + ':' + q.id),
    ),
  );
  for (const [key, r] of Object.entries(data.reviews)) {
    if (
      !questionKeys.has(key) ||
      !obj(r) ||
      !num(r.due) ||
      !num(r.interval) ||
      !num(r.repetitions) ||
      !num(r.correct) ||
      !num(r.wrong) ||
      typeof r.starred !== 'boolean'
    )
      throw new Error('Tiến độ trong bản sao lưu không hợp lệ.');
  }
  const sessionIds = new Set<string>();
  for (const s of data.sessions) {
    if (
      !obj(s) ||
      !id(s.id) ||
      sessionIds.has(s.id) ||
      !data.decks.some((d) => d.id === s.deckId) ||
      !['practice', 'test', 'write'].includes(String(s.mode)) ||
      !uniqueQuestions(s.questions) ||
      !obj(s.answers) ||
      !Number.isInteger(s.index) ||
      !num(s.index) ||
      s.index >= s.questions.length ||
      !num(s.startedAt) ||
      !(s.deadline === null || num(s.deadline)) ||
      !(s.finishedAt === null || num(s.finishedAt)) ||
      typeof s.reverse !== 'boolean'
    )
      throw new Error('Phiên học trong bản sao lưu không hợp lệ.');
    sessionIds.add(s.id);
    const deck = data.decks.find((d) => d.id === s.deckId);
    for (const q of s.questions)
      if (!deck.questions.some((dq: Question) => dq.id === q.id))
        throw new Error('Câu hỏi của phiên học không thuộc bộ từ.');
    for (const [key, a] of Object.entries(s.answers)) {
      const q = s.questions.find((q) => q.id === key);
      if (
        !q ||
        !obj(a) ||
        !Array.isArray(a.selected) ||
        !a.selected.every(id) ||
        new Set(a.selected).size !== a.selected.length ||
        a.selected.some((choice) => !q.choices.some((c) => c.id === choice)) ||
        typeof a.correct !== 'boolean' ||
        !(a.typed === undefined || str(a.typed))
      )
        throw new Error('Câu trả lời trong bản sao lưu không hợp lệ.');
      a.correct =
        s.mode === 'write'
          ? gradeWritten(q, String(a.typed ?? ''), s.reverse)
          : grade(q, a.selected);
    }
  }
  return data as StudyData;
}
export function loadData(storage: Pick<Storage, 'getItem'>) {
  const raw = storage.getItem(STORAGE_KEY);
  return { data: raw ? parseBackup(raw) : emptyData(), raw };
}
export function saveData(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  previousRaw: string | null,
  data: StudyData,
) {
  if (storage.getItem(STORAGE_KEY) !== previousRaw)
    throw new Error(
      'Dữ liệu vừa đổi ở tab khác. Hãy tải lại trang trước khi tiếp tục.',
    );
  const raw = JSON.stringify(data);
  storage.setItem(STORAGE_KEY, raw);
  return raw;
}
export const sessionScore = (s: Session) => ({
  correct: Object.values(s.answers).filter((a) => a.correct).length,
  total: s.questions.length,
});
export function download(
  name: string,
  content: string,
  type = 'text/plain;charset=utf-8',
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
