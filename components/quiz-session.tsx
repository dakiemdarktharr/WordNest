'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Trophy,
  Download,
  Timer,
  RotateCcw,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Speak } from '@/components/controls';
import {
  completeSession,
  grade,
  gradeWritten,
  solution,
  type Deck,
  type Session,
  type StudyData,
} from '@/lib/learning';
import { answerMastery, advanceMastery } from '@/lib/mastery';
import { download, sessionScore } from '@/lib/storage';
export function QuizSession({
  session,
  deck,
  update,
  onBack,
  onRetry,
}: {
  session: Session;
  deck: Deck;
  update: (fn: (d: StudyData) => StudyData) => boolean;
  onBack: () => void;
  onRetry: (ids: string[]) => void;
}) {
  const q = session.questions[session.index];
  const isMastery = session.mode === 'mastery';
  const answer = isMastery ? session.mastery?.feedback : session.answers[q.id];
  const [selected, setSelected] = useState<string[]>(answer?.selected ?? []);
  const [typed, setTyped] = useState(answer?.typed ?? '');
  const [confirm, setConfirm] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const timerAttempt = useRef(false);
  const isTest = session.mode === 'test';
  const feedback = !isTest && Boolean(answer);
  const multi = q.choices.filter((c) => c.correct).length > 1;
  const patch = useCallback(
    (next: Partial<Session>) => {
      return update((d) => ({
        ...d,
        sessions: d.sessions.map((s) =>
          s.id === session.id ? { ...s, ...next } : s,
        ),
      }));
    },
    [update, session.id],
  );
  const finish = useCallback(() => {
    const success = update((d) => completeSession(d, session.id, Date.now()));
    if (success) setConfirm(false);
  }, [update, session.id]);
  useEffect(() => {
    if (session.finishedAt || !session.deadline) return;
    const tick = () => {
      const left = Math.max(
        0,
        Math.ceil((session.deadline! - Date.now()) / 1000),
      );
      setRemaining(left);
      if (left === 0 && !timerAttempt.current) {
        timerAttempt.current = true;
        finish();
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [session.deadline, session.finishedAt, finish]);
  const record = useCallback(
    (ids: string[], text?: string) => {
      if (session.deadline && Date.now() >= session.deadline) {
        finish();
        return false;
      }
      if (session.mode === 'mastery')
        return update((d) => ({
          ...d,
          sessions: d.sessions.map((s) =>
            s.id === session.id ? answerMastery(s, ids) : s,
          ),
        }));
      return patch({
        answers: {
          ...session.answers,
          [q.id]: {
            selected: ids,
            ...(text === undefined ? {} : { typed: text }),
            correct:
              session.mode === 'write'
                ? gradeWritten(q, text ?? '', session.reverse)
                : grade(q, ids),
          },
        },
      });
    },
    [session, q, finish, patch, update],
  );
  function choose(id: string) {
    if (feedback) return;
    const next = multi
      ? selected.includes(id)
        ? selected.filter((v) => v !== id)
        : [...selected, id]
      : [id];
    if (isTest && !record(next)) return;
    setSelected(next);
  }
  const score = sessionScore(session);
  const wrong = session.questions.filter(
    (q) => !session.answers[q.id]?.correct,
  );
  if (session.finishedAt)
    return (
      <div className="study-page">
        <button className="text-button back-button" onClick={onBack}>
          <ArrowLeft size={17} />
          Bộ từ của bạn
        </button>
        <div className="result-hero">
          <div className="trophy">
            <Trophy size={34} />
          </div>
          <p className="eyebrow">MỘT BƯỚC TIẾN MỚI</p>
          <h1>
            {isMastery
              ? 'Bạn đã chọn đúng toàn bộ bộ câu hỏi!'
              : score.correct === score.total
                ? 'Bạn đã làm đúng tất cả!'
                : 'Hoàn thành lượt học!'}
          </h1>
          <p className="muted">{deck.title}</p>
          <div className="result-score">
            {Math.round((score.correct / score.total) * 100)}
            <span>%</span>
          </div>
          {isMastery && (
            <p className="muted">
              Điểm lần đầu · {session.mastery?.attempts} lượt trả lời để hoàn
              thành
            </p>
          )}
          <p>
            {score.correct} / {score.total} câu đúng ·{' '}
            {Object.keys(session.answers).length} câu đã trả lời
          </p>
          <div className="button-row">
            <button
              className="button primary"
              disabled={!wrong.length}
              onClick={() => onRetry(wrong.map((q) => q.id))}
            >
              <RotateCcw size={17} />
              Ôn {wrong.length} câu chưa đúng
            </button>
            <button
              className="button"
              onClick={() =>
                download(
                  'ket-qua-wordnest.txt',
                  'WORDNEST · ' +
                    deck.title +
                    '\n' +
                    new Date(session.finishedAt!).toLocaleString('vi-VN') +
                    (isMastery
                      ? '\nĐiểm lần đầu (đã luyện đến khi đúng tất cả)'
                      : '') +
                    '\nĐúng: ' +
                    score.correct +
                    '/' +
                    score.total +
                    '\n\n' +
                    session.questions
                      .map((q, i) => {
                        const a = session.answers[q.id];
                        return (
                          i +
                          1 +
                          '. ' +
                          q.prompt +
                          '\nTrả lời: ' +
                          (a
                            ? (a.typed ??
                              q.choices
                                .filter((c) => a.selected.includes(c.id))
                                .map((c) => c.text)
                                .join(' · '))
                            : 'Chưa trả lời') +
                          '\nĐáp án: ' +
                          (session.mode === 'write' && session.reverse
                            ? q.prompt
                            : solution(q)) +
                          '\nKết quả: ' +
                          (a?.correct ? 'Đúng' : 'Chưa đúng')
                        );
                      })
                      .join('\n\n'),
                )
              }
            >
              <Download size={17} />
              Tải kết quả
            </button>
          </div>
        </div>
        <output className="small center muted">
          Lịch ôn đã cập nhật: câu đúng được giãn lịch, câu sai hoặc bỏ trống ôn
          lại sau 1 phút.{' '}
          {isMastery &&
            'Áp dụng kết quả lần trả lời đầu, kể cả câu đã sửa đúng trong lượt này.'}
        </output>
        <section className="panel">
          <h2>Xem lại để nhớ lâu hơn</h2>
          {session.questions.map((q, i) => {
            const a = session.answers[q.id];
            return (
              <div className="review-row" key={q.id}>
                <span className={a?.correct ? 'correct-text' : 'wrong-text'}>
                  {a?.correct ? (
                    <CheckCircle2 size={22} />
                  ) : (
                    <XCircle size={22} />
                  )}
                </span>
                <div>
                  <h3>
                    {i + 1}.{' '}
                    {session.mode === 'write' && session.reverse
                      ? solution(q)
                      : q.prompt}
                  </h3>
                  <p className="muted">
                    {isMastery ? 'Lần đầu bạn trả lời: ' : 'Bạn trả lời: '}{' '}
                    {a
                      ? (a.typed ??
                        (q.choices
                          .filter((c) => a.selected.includes(c.id))
                          .map((c) => c.text)
                          .join(' · ') ||
                          'Chưa chọn'))
                      : 'Chưa trả lời'}
                  </p>
                  <p className="correct-text">
                    Đáp án:{' '}
                    {session.mode === 'write' && session.reverse
                      ? q.prompt
                      : solution(q)}
                  </p>
                  {q.explanation && (
                    <p className="explanation">{q.explanation}</p>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    );
  return (
    <div className="study-page">
      <button className="text-button back-button" onClick={onBack}>
        <ArrowLeft size={17} />
        Tạm nghỉ · bài đã xác nhận được lưu
      </button>
      <div className="page-heading">
        <div>
          <p className="eyebrow">{deck.title}</p>
          <h1>
            {isMastery
              ? 'Học đến khi đúng'
              : session.mode === 'test'
                ? 'Kiểm tra'
                : session.mode === 'write'
                  ? 'Luyện gõ từ vựng'
                  : 'Luyện tập'}
          </h1>
        </div>
        {session.deadline ? (
          <span
            className={'score-chip ' + (remaining < 30 ? 'wrong-text' : '')}
          >
            <Timer size={18} />
            {Math.floor(remaining / 60)}:
            {String(remaining % 60).padStart(2, '0')}
          </span>
        ) : (
          <span className="score-chip">Không giới hạn thời gian</span>
        )}
      </div>
      <div className="row-between progress-label">
        <span>
          Câu {session.index + 1} / {session.questions.length}
        </span>
        <span>
          {isMastery
            ? session.questions.length -
              (session.mastery?.queue.length ?? 0) +
              ' / ' +
              session.questions.length +
              ' câu đã vượt qua'
            : Object.keys(session.answers).length + ' câu đã trả lời'}
        </span>
      </div>
      <Progress
        value={
          ((isMastery
            ? session.questions.length - (session.mastery?.queue.length ?? 0)
            : Object.keys(session.answers).length) /
            session.questions.length) *
          100
        }
        aria-label="Tiến độ trả lời"
      />
      <section className="quiz-card">
        <div className="row-between">
          <span className="pill">
            {session.mode === 'write'
              ? session.reverse
                ? 'GÕ TỪ TIẾNG ANH'
                : 'GÕ NGHĨA TRONG BỘ TỪ'
              : multi
                ? 'CHỌN TẤT CẢ ĐÁP ÁN ĐÚNG'
                : 'CHỌN MỘT ĐÁP ÁN'}
          </span>
          {!(session.mode === 'write' && session.reverse && !feedback) && (
            <Speak text={q.prompt} />
          )}
        </div>
        <h2 className="quiz-prompt">
          {session.mode === 'write' && session.reverse ? solution(q) : q.prompt}
        </h2>
        {session.mode === 'write' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!feedback && typed.trim()) record([], typed);
            }}
          >
            <input
              type="text"
              aria-label="Câu trả lời"
              className="writing-input"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              value={typed}
              readOnly={feedback}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={
                session.reverse ? 'Nhập từ tiếng Anh…' : 'Nhập nghĩa…'
              }
            />
            <p className="small muted">
              Không phân biệt chữ hoa/thường. Dấu và dấu câu phải khớp với bộ
              từ.
            </p>
            {!feedback && (
              <button
                className="button primary"
                disabled={!typed.trim()}
                type="submit"
              >
                Kiểm tra đáp án <ArrowRight size={17} />
              </button>
            )}
          </form>
        ) : (
          <div className="answer-grid">
            {q.choices.map((c, i) => (
              <div
                key={c.id}
                className={
                  'answer-option ' +
                  (selected.includes(c.id) ? 'selected ' : '') +
                  (feedback
                    ? c.correct
                      ? 'correct'
                      : selected.includes(c.id)
                        ? 'incorrect'
                        : ''
                    : '')
                }
              >
                {multi ? (
                  <label>
                    <Checkbox
                      checked={selected.includes(c.id)}
                      onCheckedChange={() => choose(c.id)}
                      disabled={feedback}
                    />
                    <span>{c.text}</span>
                  </label>
                ) : (
                  <button
                    aria-pressed={selected.includes(c.id)}
                    disabled={feedback}
                    onClick={() => choose(c.id)}
                  >
                    <span className="answer-letter">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{c.text}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        {feedback && (
          <output
            className={
              'feedback ' + (answer?.correct ? 'positive' : 'negative')
            }
          >
            <b>
              {answer?.correct
                ? 'Chính xác, làm tốt lắm!'
                : 'Chưa đúng — thêm một lần để nhớ.'}
            </b>
            {!answer?.correct && (
              <p>
                Đáp án:{' '}
                {session.mode === 'write' && session.reverse
                  ? q.prompt
                  : solution(q)}
              </p>
            )}
            {q.explanation && <p>{q.explanation}</p>}
          </output>
        )}
        <div className="quiz-actions">
          {!isMastery && (
            <button
              className="button"
              disabled={session.index === 0}
              onClick={() => patch({ index: session.index - 1 })}
            >
              <ArrowLeft size={16} />
              Câu trước
            </button>
          )}
          {!isTest && !feedback && session.mode !== 'write' && (
            <button
              className="button primary"
              disabled={!selected.length}
              onClick={() => record(selected)}
            >
              Kiểm tra đáp án
            </button>
          )}
          {isMastery && feedback && (
            <button
              className="button primary"
              onClick={() =>
                update((d) => advanceMastery(d, session.id, Date.now()))
              }
            >
              {session.mastery?.queue.length === 1 && answer?.correct
                ? 'Hoàn thành lượt học'
                : 'Tiếp tục luyện'}
              <ArrowRight size={17} />
            </button>
          )}
          {!isMastery &&
            (isTest || feedback) &&
            (session.index < session.questions.length - 1 ? (
              <button
                className="button primary"
                onClick={() => patch({ index: session.index + 1 })}
              >
                Câu tiếp theo
                <ArrowRight size={17} />
              </button>
            ) : (
              <button
                className="button primary"
                onClick={() => setConfirm(true)}
              >
                Nộp bài
              </button>
            ))}
        </div>
      </section>
      {isTest && (
        <div className="question-map" aria-label="Chuyển đến câu hỏi">
          {session.questions.map((item, i) => (
            <button
              key={item.id}
              className={
                (session.answers[item.id] ? 'answered ' : '') +
                (i === session.index ? 'current' : '')
              }
              aria-label={
                'Câu ' +
                (i + 1) +
                (session.answers[item.id] ? ', đã trả lời' : ', chưa trả lời')
              }
              aria-current={i === session.index ? 'step' : undefined}
              onClick={() => patch({ index: i })}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
      <p className="small center muted">
        {isMastery
          ? 'Câu sai được đưa về cuối lượt. Có thể tạm nghỉ và tiếp tục bất cứ lúc nào.'
          : isTest
            ? 'Đáp án và giải thích sẽ hiện sau khi nộp bài.'
            : 'Trả lời, đọc giải thích và tiếp tục theo nhịp của bạn.'}
      </p>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogTitle>Nộp bài và xem kết quả?</AlertDialogTitle>
          <AlertDialogDescription>
            {session.questions.length - Object.keys(session.answers).length > 0
              ? 'Còn ' +
                (session.questions.length -
                  Object.keys(session.answers).length) +
                ' câu chưa trả lời; các câu này được tính là chưa đúng.'
              : 'Bạn đã trả lời tất cả các câu.'}
          </AlertDialogDescription>
          <div className="button-row">
            <AlertDialogCancel>Tiếp tục làm</AlertDialogCancel>
            <button className="button primary" onClick={finish}>
              Nộp bài
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
