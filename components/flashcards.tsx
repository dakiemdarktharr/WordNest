'use client';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Star,
  Keyboard,
  CheckCircle2,
  Shuffle,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Pick, Speak, Toggle } from '@/components/controls';
import {
  emptyReview,
  reviewKey,
  schedule,
  shuffle,
  solution,
  type Deck,
  type StudyData,
} from '@/lib/learning';
export function Flashcards({
  deck,
  data,
  update,
  onBack,
}: {
  deck: Deck;
  data: StudyData;
  update: (fn: (d: StudyData) => StudyData) => boolean;
  onBack: () => void;
}) {
  const [filter, setFilter] = useState('all');
  const [reverse, setReverse] = useState(false);
  const [queue, setQueue] = useState(deck.questions.map((q) => q.id));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const q = deck.questions.find((q) => q.id === queue[index]);
  const review = q
    ? (data.reviews[reviewKey(deck.id, q.id)] ?? emptyReview())
    : emptyReview();
  function rebuild(value: string, random = false) {
    const ids = deck.questions
      .filter((q) => {
        const r = data.reviews[reviewKey(deck.id, q.id)];
        return (
          value === 'all' ||
          (value === 'starred' ? r?.starred : !r || r.due <= Date.now())
        );
      })
      .map((q) => q.id);
    setQueue(random ? shuffle(ids) : ids);
    setIndex(0);
    setFlipped(false);
    setFilter(value);
  }
  function move(delta: number) {
    setIndex((i) => Math.max(0, Math.min(queue.length, i + delta)));
    setFlipped(false);
  }
  function rate(rating: 0 | 1 | 2 | 3) {
    if (!q || !flipped) return;
    if (
      update((d) => ({
        ...d,
        reviews: {
          ...d.reviews,
          [reviewKey(deck.id, q.id)]: schedule(
            d.reviews[reviewKey(deck.id, q.id)] ?? emptyReview(),
            rating,
            Date.now(),
          ),
        },
      }))
    )
      move(1);
  }
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement).closest(
          'input,textarea,button,[role="combobox"],[role="switch"],[role="dialog"]',
        )
      )
        return;
      if (e.code === 'Space') {
        e.preventDefault();
        setFlipped((v) => !v);
      }
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowLeft') move(-1);
      if (['1', '2', '3', '4'].includes(e.key))
        rate((Number(e.key) - 1) as 0 | 1 | 2 | 3);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  });
  return (
    <div className="study-page">
      <button className="text-button back-button" onClick={onBack}>
        <ArrowLeft size={17} /> {deck.title}
      </button>
      <div className="page-heading">
        <div>
          <p className="eyebrow">GHI NHỚ TỪNG CHÚT MỘT</p>
          <h1>Flashcard</h1>
        </div>
        <div className="inline-controls">
          <Pick
            label="Lọc thẻ"
            value={filter}
            onChange={(v) => rebuild(v)}
            options={[
              { value: 'all', label: 'Tất cả thẻ' },
              { value: 'due', label: 'Đến hạn ôn' },
              { value: 'starred', label: 'Đã đánh dấu' },
            ]}
          />
          <button
            className="icon-button"
            aria-label="Trộn thẻ"
            onClick={() => rebuild(filter, true)}
          >
            <Shuffle size={19} />
          </button>
        </div>
      </div>
      <div className="flash-layout">
        <div>
          <div className="row-between progress-label">
            <span>
              {Math.min(index + 1, queue.length)} / {queue.length} thẻ
            </span>
            <span>{index} thẻ đã đi qua</span>
          </div>
          <Progress
            value={queue.length ? (index / queue.length) * 100 : 0}
            aria-label="Tiến độ lật thẻ"
          />
          {q ? (
            <>
              <div className={'flash-card ' + (flipped ? 'is-flipped' : '')}>
                <div className="flash-top">
                  <span>{flipped ? 'MẶT SAU' : 'MẶT TRƯỚC'}</span>
                  <div className="inline-controls">
                    <Speak text={q.prompt} />
                    <button
                      className={
                        'icon-button ' + (review.starred ? 'starred' : '')
                      }
                      aria-label="Đánh dấu thẻ"
                      aria-pressed={review.starred}
                      onClick={() =>
                        update((d) => ({
                          ...d,
                          reviews: {
                            ...d.reviews,
                            [reviewKey(deck.id, q.id)]: {
                              ...review,
                              starred: !review.starred,
                            },
                          },
                        }))
                      }
                    >
                      <Star
                        size={20}
                        fill={review.starred ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>
                </div>
                <button
                  className="flash-flip"
                  onClick={() => setFlipped((v) => !v)}
                  aria-label={
                    flipped ? 'Lật về mặt trước' : 'Lật để xem đáp án'
                  }
                >
                  <span className="flash-word">
                    {flipped !== reverse ? solution(q) : q.prompt}
                  </span>
                  {flipped && q.explanation && (
                    <span className="flash-example">{q.explanation}</span>
                  )}
                  <span className="flip-hint">
                    <RotateCcw size={14} />
                    {flipped ? 'Chạm để trở về câu hỏi' : 'Chạm để lật thẻ'}
                  </span>
                </button>
              </div>
              <div className="flash-nav">
                <button
                  className="icon-button"
                  disabled={index === 0}
                  aria-label="Thẻ trước"
                  onClick={() => move(-1)}
                >
                  <ArrowLeft size={20} />
                </button>
                <span>
                  <Keyboard size={15} /> Space để lật · ← → chuyển thẻ
                </span>
                <button
                  className="icon-button"
                  aria-label="Thẻ tiếp theo"
                  onClick={() => move(1)}
                >
                  <ArrowRight size={20} />
                </button>
              </div>
              <p className="center muted small">
                Bạn nhớ từ này đến đâu? Lật thẻ rồi chọn để lên lịch ôn.
              </p>
              <div className="rating-grid">
                {(['Chưa nhớ', 'Khó', 'Đã nhớ', 'Rất dễ'] as const).map(
                  (label, i) => {
                    const next = schedule(review, i as 0 | 1 | 2 | 3, 0);
                    const minutes = Math.round(next.interval * 1440);
                    return (
                      <button
                        key={label}
                        className={'rating rating-' + i}
                        disabled={!flipped}
                        onClick={() => rate(i as 0 | 1 | 2 | 3)}
                      >
                        <b>{label}</b>
                        <span>
                          {minutes < 60
                            ? minutes + ' phút'
                            : minutes < 1440
                              ? Math.round(minutes / 60) + ' giờ'
                              : Math.round(next.interval) + ' ngày'}
                        </span>
                      </button>
                    );
                  },
                )}
              </div>
            </>
          ) : (
            <div className="completion panel">
              <CheckCircle2 size={48} />
              <h2>
                {queue.length
                  ? 'Bạn đã đi hết lượt thẻ này!'
                  : 'Chưa có thẻ trong nhóm này'}
              </h2>
              <p className="muted">
                Thẻ đã đánh giá sẽ xuất hiện trong “Đến hạn ôn” theo lịch.
              </p>
              <button
                className="button primary"
                onClick={() => rebuild(filter)}
              >
                Kiểm tra thẻ cần ôn
              </button>
              <button className="button" onClick={() => rebuild('all')}>
                Xem lại tất cả
              </button>
            </div>
          )}
        </div>
        <aside className="panel study-aside">
          <span className="mode-symbol blue">
            <RotateCcw size={23} />
          </span>
          <h3>Học để nhớ lâu</h3>
          <p className="muted">
            Thẻ khó sẽ quay lại sớm. Thẻ đã nhớ được giãn thời gian ôn.
          </p>
          <Toggle
            label="Hiện nghĩa trước"
            checked={reverse}
            onChange={(v) => {
              setReverse(v);
              setFlipped(false);
            }}
          />
          <div className="aside-tip">
            Đánh dấu <Star size={13} /> những từ muốn dành thêm thời gian.
          </div>
          <p className="small muted">
            Lịch ôn chỉ lưu trên trình duyệt này. Mở app và chọn “Đến hạn ôn”
            mỗi ngày.
          </p>
        </aside>
      </div>
    </div>
  );
}
