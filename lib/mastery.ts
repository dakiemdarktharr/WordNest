import {
  completeSession,
  grade,
  type Session,
  type StudyData,
} from './learning.ts';

/** First attempts remain the scoring/SRS evidence; retries only clear the queue. */
export function answerMastery(session: Session, selected: string[]): Session {
  const state = session.mastery;
  if (
    session.mode !== 'mastery' ||
    !state ||
    state.feedback ||
    session.finishedAt !== null ||
    !state.queue.length
  )
    return session;
  const question = session.questions[session.index];
  if (
    !selected.length ||
    new Set(selected).size !== selected.length ||
    selected.some((id) => !question.choices.some((c) => c.id === id))
  )
    return session;
  const answer = {
    selected: [...selected],
    correct: grade(question, selected),
  };
  return {
    ...session,
    answers: session.answers[question.id]
      ? session.answers
      : { ...session.answers, [question.id]: answer },
    mastery: { ...state, attempts: state.attempts + 1, feedback: answer },
  };
}

export function advanceMastery(
  data: StudyData,
  sessionId: string,
  now: number,
): StudyData {
  const session = data.sessions.find((s) => s.id === sessionId);
  const state = session?.mastery;
  if (
    !session ||
    session.mode !== 'mastery' ||
    !state?.feedback ||
    !state.queue.length ||
    session.finishedAt !== null
  )
    return data;
  const [current, ...rest] = state.queue;
  const queue = state.feedback.correct ? rest : [...rest, current];
  const next: Session = {
    ...session,
    index: queue.length
      ? session.questions.findIndex((q) => q.id === queue[0])
      : session.index,
    mastery: { ...state, queue, feedback: null },
  };
  const updated = {
    ...data,
    sessions: data.sessions.map((s) => (s.id === sessionId ? next : s)),
  };
  return queue.length ? updated : completeSession(updated, sessionId, now);
}
