export type Choice = { id: string; text: string; correct: boolean };
export type Question = {
  id: string;
  prompt: string;
  choices: Choice[];
  explanation: string;
  kind: 'quiz' | 'pair';
};
export type Deck = {
  id: string;
  title: string;
  questions: Question[];
  createdAt: number;
  source: string;
};
export type Review = {
  due: number;
  interval: number;
  repetitions: number;
  starred: boolean;
  correct: number;
  wrong: number;
};
export type Answer = { selected: string[]; typed?: string; correct: boolean };
export type Session = {
  id: string;
  deckId: string;
  mode: 'practice' | 'test' | 'write' | 'mastery';
  questions: Question[];
  answers: Record<string, Answer>;
  index: number;
  startedAt: number;
  deadline: number | null;
  finishedAt: number | null;
  reverse: boolean;
  mastery?: { queue: string[]; attempts: number; feedback: Answer | null };
};
export type StudyData = {
  version: 1;
  decks: Deck[];
  reviews: Record<string, Review>;
  sessions: Session[];
};
export type ParseIssue = { line: number; message: string };
export const MAX_FILE_BYTES = 1_000_000;
export const MAX_QUESTIONS = 1000;

export function parseTxt(raw: string): {
  questions: Question[];
  errors: ParseIssue[];
} {
  const text = raw.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const errors: ParseIssue[] = [];
  if (!text.trim())
    return {
      questions: [],
      errors: [{ line: 1, message: 'File chưa có nội dung.' }],
    };
  if (new TextEncoder().encode(raw).length > MAX_FILE_BYTES)
    return {
      questions: [],
      errors: [{ line: 1, message: 'File quá lớn. Tối đa 1 MB.' }],
    };
  const questions: Question[] = [];
  if (!/^\d+[.)]\s/m.test(text)) {
    text.split('\n').forEach((line, i) => {
      if (!line.trim()) return;
      const sep = line.indexOf('::');
      const prompt = line.slice(0, sep).trim();
      const answer = line.slice(sep + 2).trim();
      if (sep < 1 || !prompt || !answer) {
        errors.push({
          line: i + 1,
          message: 'Dùng dạng từ tiếng Anh :: nghĩa tiếng Việt.',
        });
        return;
      }
      questions.push({
        id: 'q' + (questions.length + 1),
        prompt,
        choices: [{ id: '1', text: answer, correct: true }],
        kind: 'pair',
        explanation: '',
      });
    });
  } else {
    const starts = [...text.matchAll(/^(\d+)[.)]\s+/gm)];
    if (starts.length > MAX_QUESTIONS)
      return {
        questions: [],
        errors: [
          { line: 1, message: 'Tối đa 1000 câu mỗi bộ. Hãy tách file.' },
        ],
      };
    if (text.slice(0, starts[0]?.index).trim())
      errors.push({
        line: 1,
        message: 'Mỗi câu bắt đầu bằng số và dấu chấm, ví dụ: 1. Câu hỏi.',
      });
    const numbers = new Set<string>();
    starts.forEach((match, i) => {
      const line = text.slice(0, match.index).split('\n').length;
      const number = match[1];
      if (numbers.has(number))
        errors.push({ line, message: 'Số câu ' + number + ' bị trùng.' });
      numbers.add(number);
      const body = text
        .slice(
          match.index! + match[0].length,
          starts[i + 1]?.index ?? text.length,
        )
        .trim();
      const explanationAt = body.search(/^\s*(?:Giải thích|Explanation):\s*/im);
      const content =
        explanationAt < 0 ? body : body.slice(0, explanationAt).trim();
      const explanation =
        explanationAt < 0
          ? ''
          : body
              .slice(explanationAt)
              .replace(/^\s*(?:Giải thích|Explanation):\s*/i, '')
              .trim();
      const markers = [...content.matchAll(/\[(\d+)(?:\s*(\\?\*))?\s*\]/g)];
      if (
        /\[\d[^\]\n]*\]/.test(
          content.replace(/\[(\d+)(?:\s*(\\?\*))?\s*\]/g, ''),
        )
      )
        errors.push({
          line,
          message: 'Dấu đáp án không hợp lệ. Dùng [1] hoặc [1*].',
        });
      const prompt = content
        .slice(0, markers[0]?.index ?? content.length)
        .trim();
      const choices = markers.map((m, j) => ({
        id: m[1],
        correct: Boolean(m[2]),
        text: content
          .slice(
            m.index! + m[0].length,
            markers[j + 1]?.index ?? content.length,
          )
          .trim(),
      }));
      if (!prompt)
        errors.push({ line, message: 'Câu ' + number + ' chưa có nội dung.' });
      if (choices.length < 2 || choices.length > 10)
        errors.push({
          line,
          message:
            'Câu ' + number + ' cần từ 2 đến 10 đáp án dạng [1], [2*]...',
        });
      if (choices.some((c) => !c.text))
        errors.push({ line, message: 'Câu ' + number + ' có đáp án trống.' });
      if (!choices.some((c) => c.correct))
        errors.push({
          line,
          message: 'Câu ' + number + ' thiếu dấu * cho đáp án đúng.',
        });
      if (new Set(choices.map((c) => c.id)).size !== choices.length)
        errors.push({
          line,
          message: 'Câu ' + number + ' bị trùng số đáp án.',
        });
      questions.push({
        id: 'q' + (i + 1),
        prompt,
        choices,
        explanation,
        kind: 'quiz',
      });
    });
  }
  if (questions.length > MAX_QUESTIONS)
    errors.push({ line: 1, message: 'Tối đa 1000 câu mỗi bộ. Hãy tách file.' });
  return { questions, errors };
}
export const solution = (q: Question) =>
  q.choices
    .filter((c) => c.correct)
    .map((c) => c.text)
    .join(' · ');
export function grade(q: Question, selected: string[]) {
  const expected = q.choices.filter((c) => c.correct).map((c) => c.id);
  return (
    selected.length === expected.length &&
    new Set(selected).size === selected.length &&
    expected.every((id) => selected.includes(id))
  );
}
export const normalize = (value: string) =>
  value.normalize('NFC').trim().toLocaleLowerCase().replace(/\s+/g, ' ');
export function gradeWritten(q: Question, value: string, reverse: boolean) {
  return normalize(value) === normalize(reverse ? q.prompt : solution(q));
}
export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function quizQuestions(all: Question[]) {
  return all.map((q) => {
    if (q.kind === 'quiz') return { ...q, choices: shuffle(q.choices) };
    const other = shuffle(
      [...new Set(all.filter((x) => x.id !== q.id).map(solution))].filter(
        (t) => normalize(t) !== normalize(solution(q)),
      ),
    ).slice(0, 3);
    return {
      ...q,
      choices: shuffle([
        { id: '1', text: solution(q), correct: true },
        ...other.map((text, i) => ({ id: 'd' + i, text, correct: false })),
      ]),
    };
  });
}
export const emptyReview = (): Review => ({
  due: 0,
  interval: 0,
  repetitions: 0,
  starred: false,
  correct: 0,
  wrong: 0,
});
export const reviewKey = (deckId: string, questionId: string) =>
  deckId + ':' + questionId;
export function schedule(
  previous: Review,
  rating: 0 | 1 | 2 | 3,
  now: number,
): Review {
  const rawInterval =
    rating === 0
      ? 1 / 1440
      : rating === 1
        ? Math.max(10 / 1440, previous.interval * 1.2)
        : rating === 2
          ? Math.max(1, previous.interval * 2)
          : Math.max(4, previous.interval * 2.8);
  const interval = Math.min(3650, rawInterval);
  return {
    ...previous,
    interval,
    due: now + Math.round(interval * 86_400_000),
    repetitions: rating === 0 ? 0 : previous.repetitions + 1,
  };
}
export const emptyData = (): StudyData => ({
  version: 1,
  decks: [],
  reviews: {},
  sessions: [],
});
export function makeSession(
  deck: Deck,
  mode: Session['mode'],
  count: number,
  random: boolean,
  minutes: number,
  reverse: boolean,
  onlyIds?: string[],
): Session {
  const questions =
    mode === 'write'
      ? deck.questions.filter(
          (q) => q.choices.filter((c) => c.correct).length === 1,
        )
      : quizQuestions(deck.questions);
  const selected = onlyIds
    ? questions.filter((q) => onlyIds.includes(q.id))
    : questions;
  const now = Date.now();
  const chosen = (random ? shuffle(selected) : selected).slice(0, count);
  return {
    id: crypto.randomUUID(),
    deckId: deck.id,
    mode,
    questions: chosen,
    answers: {},
    index: 0,
    startedAt: now,
    deadline: mode === 'test' && minutes ? now + minutes * 60_000 : null,
    finishedAt: null,
    reverse,
    ...(mode !== 'test'
      ? {
          mastery: {
            queue: chosen.map((q) => q.id),
            attempts: 0,
            feedback: null,
          },
        }
      : {}),
  };
}
export const DEMO_TXT =
  '1. resilient\n[1] dễ tổn thương\n[2*] kiên cường, có khả năng phục hồi\n[3] do dự\n[4] thờ ơ\nGiải thích: She remained resilient through difficult times. — Cô ấy vẫn kiên cường qua những lúc khó khăn.\n\n2. curious\n[1*] tò mò, ham tìm hiểu\n[2] tức giận\n[3] bất cẩn\n[4] buồn ngủ\nGiải thích: Stay curious and keep asking questions. — Hãy luôn ham tìm hiểu và tiếp tục đặt câu hỏi.\n\n3. accomplish\n[1] trì hoãn\n[2] từ bỏ\n[3*] hoàn thành, đạt được\n[4] quên đi\nGiải thích: You can accomplish your goals with practice.\n\n4. thoughtful\n[1] vội vàng\n[2] ồn ào\n[3] ích kỷ\n[4*] chu đáo, biết quan tâm\nGiải thích: That was a thoughtful gift. — Đó là một món quà chu đáo.\n\n5. opportunity\n[1*] cơ hội\n[2] khó khăn\n[3] lời hứa\n[4] thói quen\n\n6. consistent\n[1] thay đổi thất thường\n[2*] nhất quán, đều đặn\n[3] hiếm có\n[4] ngắn ngủi\n\n7. embrace\n[1] né tránh\n[2] phản đối\n[3*] đón nhận\n[4] chia nhỏ\n\n8. meaningful\n[1] vô nghĩa\n[2] ngẫu nhiên\n[3] phức tạp\n[4*] có ý nghĩa';

/** Apply a submitted quiz to the same deterministic scheduler used by flashcards.
 * Correct = Good; wrong or unanswered = Again. Re-submitting is a no-op.
 */
export function completeSession(
  data: StudyData,
  sessionId: string,
  now: number,
): StudyData {
  const session = data.sessions.find((s) => s.id === sessionId);
  if (!session || session.finishedAt !== null) return data;
  if (session.mode !== 'test' && session.mastery?.queue.length !== 0)
    return data;
  const reviews = { ...data.reviews };
  const answers = { ...session.answers };
  for (const question of session.questions) {
    const answer = session.answers[question.id];
    const correct = Boolean(
      answer &&
      (session.mode === 'write'
        ? gradeWritten(question, answer.typed ?? '', session.reverse)
        : grade(question, answer.selected)),
    );
    if (answer) answers[question.id] = { ...answer, correct };
    const key = reviewKey(session.deckId, question.id);
    const previous = reviews[key] ?? emptyReview();
    reviews[key] = {
      ...schedule(previous, correct ? 2 : 0, now),
      correct: previous.correct + (correct ? 1 : 0),
      wrong: previous.wrong + (correct ? 0 : 1),
    };
  }
  return {
    ...data,
    reviews,
    sessions: data.sessions.map((s) =>
      s.id === sessionId ? { ...s, answers, finishedAt: now } : s,
    ),
  };
}
