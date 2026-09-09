'use client';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, RotateCcw, Timer } from 'lucide-react';
import { shuffle, solution, normalize, type Deck } from '@/lib/learning';
export function MatchGame({
  deck,
  onBack,
}: {
  deck: Deck;
  onBack: () => void;
}) {
  const eligible = useMemo(() => {
    const prompts = new Set<string>();
    const answers = new Set<string>();
    return deck.questions.filter((q) => {
      const p = normalize(q.prompt),
        a = normalize(solution(q));
      if (
        q.choices.filter((c) => c.correct).length !== 1 ||
        prompts.has(p) ||
        answers.has(a)
      )
        return false;
      prompts.add(p);
      answers.add(a);
      return true;
    });
  }, [deck]);
  const [round, setRound] = useState(() => shuffle(eligible).slice(0, 6));
  const [right, setRight] = useState(() => shuffle(round));
  const [leftPick, setLeft] = useState<string | null>(null);
  const [rightPick, setRightPick] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState('');
  const [startedAt, setStarted] = useState(() => Date.now());
  const [seconds, setSeconds] = useState(0);
  const [covered, setCovered] = useState<string[]>([]);
  const done = matched.length === round.length;
  useEffect(() => {
    if (done) return;
    const timer = setInterval(
      () => setSeconds(Math.floor((Date.now() - startedAt) / 1000)),
      1000,
    );
    return () => clearInterval(timer);
  }, [startedAt, done]);
  function choose(side: 'left' | 'right', id: string) {
    const l = side === 'left' ? id : leftPick;
    const r = side === 'right' ? id : rightPick;
    setLeft(l);
    setRightPick(r);
    if (l && r) {
      if (l === r) {
        setMatched((m) => [...m, l]);
        setMessage('Chính xác!');
      } else {
        setMistakes((m) => m + 1);
        setMessage('Chưa đúng, hãy thử cặp khác.');
      }
      setLeft(null);
      setRightPick(null);
    }
  }
  function next() {
    const used = [...covered, ...round.map((q) => q.id)];
    const remaining = eligible.filter((q) => !used.includes(q.id));
    const pool =
      remaining.length === 1
        ? [
            ...remaining,
            ...shuffle(eligible.filter((q) => q.id !== remaining[0].id)).slice(
              0,
              1,
            ),
          ]
        : remaining.length
          ? remaining
          : eligible;
    const nextRound = shuffle(pool).slice(0, 6);
    setCovered(remaining.length ? used : []);
    setRound(nextRound);
    setRight(shuffle(nextRound));
    setMatched([]);
    setLeft(null);
    setRightPick(null);
    setMistakes(0);
    setMessage('');
    setSeconds(0);
    setStarted(Date.now());
  }
  return (
    <div className="study-page">
      <button className="text-button back-button" onClick={onBack}>
        <ArrowLeft size={17} />
        {deck.title}
      </button>
      <div className="page-heading">
        <div>
          <p className="eyebrow">KẾT NỐI TỪ VÀ NGHĨA</p>
          <h1>Ghép cặp</h1>
        </div>
        <span className="score-chip">
          <Timer size={17} />
          {seconds}s · {mistakes} lần nhầm
        </span>
      </div>
      <p className="muted">
        Chọn một từ bên trái, rồi chọn nghĩa tương ứng bên phải.
      </p>
      {eligible.length < 2 ? (
        <div className="panel completion">
          <h2>Cần ít nhất 2 cặp khác nhau</h2>
          <p>
            Chế độ này dùng câu có một đáp án đúng và cặp từ–nghĩa không trùng.
          </p>
        </div>
      ) : done ? (
        <div className="panel completion">
          <CheckCircle2 size={50} />
          <h2>Ghép trọn bộ!</h2>
          <p>
            {round.length} cặp · {seconds} giây · {mistakes} lần nhầm
          </p>
          <button className="button primary" onClick={next}>
            <RotateCcw size={18} />
            Vòng tiếp theo
          </button>
        </div>
      ) : (
        <div className="match-board">
          {[round, right].map((list, side) => (
            <div className="match-column" key={side}>
              {list.map((q) => (
                <button
                  className={
                    'match-tile ' +
                    (matched.includes(q.id)
                      ? 'matched'
                      : (side === 0 ? leftPick : rightPick) === q.id
                        ? 'selected'
                        : '')
                  }
                  key={q.id}
                  disabled={matched.includes(q.id)}
                  onClick={() => choose(side === 0 ? 'left' : 'right', q.id)}
                >
                  {side === 0 ? q.prompt : solution(q)}
                  {matched.includes(q.id) && <CheckCircle2 size={18} />}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
      <output className="center small muted match-status">
        {message || 'Các cặp trùng được lọc để mỗi câu chỉ có một cách ghép.'}
      </output>
    </div>
  );
}
