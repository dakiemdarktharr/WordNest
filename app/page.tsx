import { LearningEnvironment } from '@/components/learning-environment';

import { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  FileUp,
  ArrowRight,
  ArrowLeft,
  Layers,
  Sparkles,
  Check,
  FileText,
  Library,
  ChartNoAxesCombined,
  CircleHelp,
  Search,
  Plus,
  Download,
  Upload,
  Star,
  Trash2,
  Clock3,
  Keyboard,
  Puzzle,
  Target,
  ShieldCheck,
  Play,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { DeckCreator } from '@/components/deck-creator';
import { ThemeToggle } from '@/components/theme-toggle';
import { Importer } from '@/components/importer';
import { Flashcards } from '@/components/flashcards';
import { MatchGame } from '@/components/match-game';
import { QuizSession } from '@/components/quiz-session';
import { useStudyData } from '@/components/use-study-data';
import { Pick, Speak, Toggle } from '@/components/controls';
import {
  DEMO_TXT,
  emptyReview,
  makeSession,
  normalize,
  parseTxt,
  reviewKey,
  solution,
  type Deck,
  type Session,
  type StudyData,
} from '@/lib/learning';
import {
  download,
  parseBackup,
  sessionScore,
  STORAGE_KEY,
} from '@/lib/storage';

const modeNames = {
  mastery: 'Học đến khi đúng',
  practice: 'Luyện tập',
  test: 'Kiểm tra',
  write: 'Luyện gõ',
};
export default function Home() {
  const { data, ready, storageError, update, restore } = useStudyData();
  const [tab, setTab] = useState('library');
  const [view, setView] = useState('library');
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [termSearch, setTermSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pendingBackup, setPendingBackup] = useState<StudyData | null>(null);
  const [mode, setMode] = useState<Session['mode']>('practice');
  const [random, setRandom] = useState(true);
  const [count, setCount] = useState(20);
  const [minutes, setMinutes] = useState('0');
  const [reverse, setReverse] = useState(true);
  const backupInput = useRef<HTMLInputElement>(null);
  const latest = useRef(data);
  useEffect(() => {
    latest.current = data;
  }, [data]);
  useEffect(
    () => window.wordnestDesktop?.onImport(() => setImportOpen(true)),
    [],
  );
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  const deck = data.decks.find((d) => d.id === selectedDeck);
  const session = data.sessions.find((s) => s.id === sessionId);
  useEffect(() => {
    type Context = {
      registerTool: (
        tool: {
          name: string;
          description: string;
          inputSchema: object;
          annotations: object;
          execute: (input: unknown) => unknown;
        },
        options: { signal: AbortSignal },
      ) => void | Promise<void>;
    };
    const context = (document as Document & { modelContext?: Context })
      .modelContext;
    if (!context) return;
    const controller = new AbortController();
    for (const tool of [
      {
        name: 'wordnest_list_library',
        description:
          'Read locally imported deck titles and question counts. Does not upload files.',
        annotations: { readOnlyHint: true, untrustedContentHint: true },
        execute: () =>
          latest.current.decks.map((d) => ({
            id: d.id,
            title: d.title,
            count: d.questions.length,
          })),
      },
      {
        name: 'wordnest_open_txt_import',
        description:
          'Open the TXT import dialog. This only starts the flow and does not create a deck.',
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: async () => {
          setImportOpen(true);
          await new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          );
          return { status: 'import_dialog_open' };
        },
      },
    ]) {
      try {
        void Promise.resolve(
          context.registerTool(
            {
              ...tool,
              inputSchema: {
                type: 'object',
                properties: {},
                additionalProperties: false,
              },
              execute(input) {
                if (
                  !input ||
                  typeof input !== 'object' ||
                  Array.isArray(input) ||
                  Object.keys(input).length
                )
                  throw new Error('Expected an empty object.');
                return tool.execute();
              },
            },
            { signal: controller.signal },
          ),
        ).catch(() => {});
      } catch {
        /* Optional browser API. */
      }
    }
    return () => controller.abort();
  }, []);
  function openDeck(d: Deck) {
    setSelectedDeck(d.id);
    setView('deck');
    setTermSearch('');
    setCount(Math.min(20, d.questions.length));
    setNotice('');
  }
  function addDeck(next: Deck) {
    const duplicate = data.decks.find(
      (d) =>
        d.source.replace(/\r\n?/g, '\n').trim() ===
        next.source.replace(/\r\n?/g, '\n').trim(),
    );
    if (duplicate) {
      openDeck(duplicate);
      setNotice('Bộ này đã có trong thư viện. Tiến độ được giữ nguyên.');
      return true;
    }
    if (data.decks.length >= 200) {
      setNotice(
        'Thư viện đã có 200 bộ. Hãy sao lưu rồi xóa bớt trước khi nhập.',
      );
      return false;
    }
    if (update((d) => ({ ...d, decks: [next, ...d.decks] }))) {
      openDeck(next);
      return true;
    }
    return false;
  }
  function start(onlyIds?: string[]) {
    if (!deck) return;
    const next = makeSession(
      deck,
      onlyIds ? 'practice' : mode,
      onlyIds?.length ??
        Math.max(1, Math.min(count || 1, deck.questions.length)),
      random,
      onlyIds || mode !== 'test' ? 0 : Number(minutes),
      reverse,
      onlyIds,
    );
    if (!next.questions.length) {
      setNotice('Luyện gõ cần ít nhất một câu có một đáp án đúng.');
      return;
    }
    if (
      next.mode !== 'write' &&
      next.questions.some((q) => q.choices.length < 2)
    ) {
      setNotice(
        'Quiz cần ít nhất hai nghĩa khác nhau để tạo lựa chọn. Bạn vẫn có thể học flashcard hoặc luyện gõ.',
      );
      return;
    }
    if (
      update((d) => ({ ...d, sessions: [next, ...d.sessions].slice(0, 30) }))
    ) {
      setSessionId(next.id);
      setView('session');
      setNotice('');
    }
  }
  const completed = data.sessions.filter((s) => s.finishedAt);
  const totalAnswers = completed.reduce(
    (sum, s) => sum + s.questions.length,
    0,
  );
  const totalCorrect = completed.reduce(
    (sum, s) => sum + sessionScore(s).correct,
    0,
  );
  const allDue = data.decks.reduce(
    (sum, d) =>
      sum +
      d.questions.filter((q) => {
        const r = data.reviews[reviewKey(d.id, q.id)];
        return !r || r.due <= now;
      }).length,
    0,
  );
  function removeDeck() {
    if (
      update((d) => ({
        ...d,
        decks: d.decks.filter((x) => x.id !== deleteId),
        sessions: d.sessions.filter((s) => s.deckId !== deleteId),
        reviews: Object.fromEntries(
          Object.entries(d.reviews).filter(
            ([key]) => !key.startsWith(deleteId + ':'),
          ),
        ),
      }))
    ) {
      setDeleteId(null);
      setView('library');
      setSelectedDeck(null);
    }
  }
  async function readBackup(file?: File) {
    if (!file) return;
    try {
      if (file.size > 12_000_000) throw new Error('Bản sao lưu tối đa 12 MB.');
      setPendingBackup(parseBackup(await file.text()));
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Không đọc được bản sao lưu.');
    }
  }
  const goHome = () => {
    setView('library');
    setTab('library');
  };
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Đến nội dung
      </a>
      <header className="topbar">
        <button className="brand" onClick={goHome}>
          <span className="brand-mark">
            <img src="./wordnest-icon.png" width="30" height="30" alt="" />
          </span>
          Word<span className="brand-light">Nest</span>
          <span className="beta">HỌC THEO CÁCH CỦA BẠN</span>
        </button>
        <div className="inline-controls">
          <ThemeToggle />
          <span className="local-badge">
            <span />
            Lưu trên thiết bị
          </span>
          <button
            className="icon-button"
            aria-label="Hướng dẫn"
            onClick={() => {
              setView('library');
              setTab('guide');
            }}
          >
            <CircleHelp size={21} />
          </button>
        </div>
      </header>
      <main className="workspace" id="main-content">
        <LearningEnvironment />
        {storageError && (
          <div className="error storage-error" role="alert">
            <p>{storageError}</p>
            <div className="button-row">
              <button
                className="button"
                onClick={() => {
                  try {
                    download(
                      'wordnest-du-lieu-goc.json',
                      localStorage.getItem(STORAGE_KEY) ?? '{}',
                      'application/json',
                    );
                  } catch {
                    setNotice('Không truy cập được bộ nhớ trình duyệt.');
                  }
                }}
              >
                Tải dữ liệu hiện có
              </button>
              <button
                className="button"
                onClick={() => window.location.reload()}
              >
                Tải lại trang
              </button>
              <button
                className="button"
                onClick={() => backupInput.current?.click()}
              >
                Khôi phục sao lưu
              </button>
            </div>
          </div>
        )}
        {notice && (
          <output className="notice">
            {notice}
            <button aria-label="Đóng thông báo" onClick={() => setNotice('')}>
              ×
            </button>
          </output>
        )}
        {!ready ? (
          <div className="panel">Đang mở thư viện trên thiết bị…</div>
        ) : view === 'flashcards' && deck ? (
          <Flashcards
            deck={deck}
            data={data}
            update={update}
            onBack={() => setView('deck')}
          />
        ) : view === 'match' && deck ? (
          <MatchGame deck={deck} onBack={() => setView('deck')} />
        ) : view === 'session' && deck && session ? (
          <QuizSession
            key={
              session.id +
              ':' +
              session.index +
              ':' +
              (session.mastery?.queue.join(',') ?? '') +
              ':' +
              Boolean(session.mastery?.feedback)
            }
            deck={deck}
            session={session}
            update={update}
            onBack={() => setView('deck')}
            onRetry={start}
          />
        ) : view === 'deck' && deck ? (
          <>
            <button className="text-button back-button" onClick={goHome}>
              <ArrowLeft size={17} />
              Thư viện của tôi
            </button>
            <div className="page-heading">
              <div>
                <p className="eyebrow">BỘ TỪ CỦA BẠN</p>
                <h1>{deck.title}</h1>
                <p className="muted">
                  {deck.questions.length} câu ·{' '}
                  {
                    deck.questions.filter(
                      (q) =>
                        (data.reviews[reviewKey(deck.id, q.id)]?.due ?? 0) <=
                        now,
                    ).length
                  }{' '}
                  thẻ mới / đến hạn
                </p>
              </div>
              <div className="inline-controls">
                <button
                  className="icon-button"
                  aria-label="Tải TXT bộ từ"
                  onClick={() =>
                    download(
                      deck.title.replace(/[\\/:*?"<>|]/g, '-') + '.txt',
                      deck.source,
                    )
                  }
                >
                  <Download size={20} />
                </button>
                <button
                  className="icon-button danger"
                  aria-label="Xóa bộ từ"
                  onClick={() => setDeleteId(deck.id)}
                >
                  <Trash2 size={19} />
                </button>
              </div>
            </div>
            {data.sessions
              .filter((s) => s.deckId === deck.id && !s.finishedAt)
              .slice(0, 2)
              .map((s) => (
                <div className="resume-banner" key={s.id}>
                  <div>
                    <b>Bạn có bài {modeNames[s.mode].toLowerCase()} đang làm</b>
                    <p className="small muted">
                      {Object.keys(s.answers).length} / {s.questions.length} câu
                      đã trả lời
                      {s.deadline
                        ? ' · Đồng hồ tiếp tục chạy khi đóng trang'
                        : ''}
                    </p>
                  </div>
                  <button
                    className="button"
                    onClick={() => {
                      setSessionId(s.id);
                      setView('session');
                    }}
                  >
                    Tiếp tục <ArrowRight size={17} />
                  </button>
                </div>
              ))}
            <div className="mode-grid">
              <button
                className="mode-card"
                onClick={() => setView('flashcards')}
              >
                <span className="mode-symbol blue">
                  <Layers size={25} />
                </span>
                <div>
                  <h3>Flashcard</h3>
                  <p>Lật thẻ & ôn cách quãng</p>
                </div>
                <ArrowRight size={18} />
              </button>
              <button className="mode-card" onClick={() => setView('match')}>
                <span className="mode-symbol orange">
                  <Puzzle size={25} />
                </span>
                <div>
                  <h3>Ghép cặp</h3>
                  <p>Kết nối từ với nghĩa</p>
                </div>
                <ArrowRight size={18} />
              </button>
            </div>
            <section className="panel setup-panel">
              <div>
                <span className="mode-symbol green">
                  <Target size={24} />
                </span>
                <h2>Một lượt học mới</h2>
                <p className="muted small">
                  Chọn cách luyện phù hợp với bạn hôm nay.
                </p>
              </div>
              <div className="setup-fields">
                <div className="field">
                  Cách học
                  <Pick
                    label="Cách học"
                    value={mode}
                    onChange={(v) => setMode(v as Session['mode'])}
                    options={[
                      {
                        value: 'mastery',
                        label: 'Học đến khi đúng · lặp lại câu sai',
                      },
                      {
                        value: 'practice',
                        label: 'Luyện tập · hiện đáp án từng câu',
                      },
                      {
                        value: 'test',
                        label: 'Kiểm tra · nộp bài mới xem đáp án',
                      },
                      {
                        value: 'write',
                        label: 'Luyện gõ · nhớ và viết lại từ',
                      },
                    ]}
                  />
                </div>
                <div className="two-fields">
                  <label className="field">
                    Số câu
                    <input
                      type="number"
                      min={1}
                      max={deck.questions.length}
                      value={count}
                      onChange={(e) =>
                        setCount(
                          Math.max(
                            1,
                            Math.min(
                              deck.questions.length,
                              Number(e.target.value),
                            ),
                          ),
                        )
                      }
                    />
                  </label>
                  {mode === 'test' ? (
                    <div className="field">
                      Thời gian
                      <Pick
                        label="Thời gian kiểm tra"
                        value={minutes}
                        onChange={setMinutes}
                        options={[
                          { value: '0', label: 'Không giới hạn' },
                          { value: '5', label: '5 phút' },
                          { value: '10', label: '10 phút' },
                          { value: '20', label: '20 phút' },
                          { value: '30', label: '30 phút' },
                        ]}
                      />
                    </div>
                  ) : (
                    <div className="setting-note">
                      Tập trung vào độ chính xác, học theo nhịp của bạn.
                    </div>
                  )}
                </div>
                <Toggle
                  checked={random}
                  onChange={setRandom}
                  label="Trộn thứ tự câu hỏi"
                />
                {mode === 'mastery' && (
                  <p className="small muted">
                    Hiện đáp án sau mỗi câu. Câu sai trở lại cuối lượt đến khi
                    bạn chọn đúng. Điểm và lịch ôn dựa trên lần trả lời đầu.
                  </p>
                )}
                {mode === 'write' && (
                  <>
                    <Toggle
                      checked={reverse}
                      onChange={setReverse}
                      label="Hiện nghĩa → gõ từ tiếng Anh"
                    />
                    <p className="small muted">
                      Dùng câu có một đáp án đúng. So khớp nội dung trong TXT,
                      bỏ qua hoa/thường và khoảng trắng thừa.
                    </p>
                  </>
                )}
                <button
                  className="button primary start-button"
                  onClick={() => start()}
                >
                  <Play size={17} />
                  Bắt đầu {modeNames[mode].toLowerCase()}
                </button>
              </div>
            </section>
            <section className="panel">
              <div className="row-between wrap">
                <h2>
                  Nội dung bộ từ{' '}
                  <span className="count-badge">{deck.questions.length}</span>
                </h2>
                <div className="search-box">
                  <Search size={17} />
                  <input
                    type="search"
                    aria-label="Tìm trong bộ từ"
                    placeholder="Tìm từ hoặc nghĩa…"
                    value={termSearch}
                    onChange={(e) => setTermSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="question-list">
                {deck.questions
                  .filter((q) =>
                    normalize(q.prompt + ' ' + solution(q)).includes(
                      normalize(termSearch),
                    ),
                  )
                  .map((q, i) => {
                    const key = reviewKey(deck.id, q.id);
                    const r = data.reviews[key] ?? emptyReview();
                    return (
                      <div className="vocab-row" key={q.id}>
                        <span className="row-number">{i + 1}</span>
                        <div className="vocab-pair">
                          <b>{q.prompt}</b>
                          <span>{solution(q)}</span>
                          {q.explanation && <small>{q.explanation}</small>}
                        </div>
                        <Speak text={q.prompt} />
                        <button
                          className={
                            'icon-button ' + (r.starred ? 'starred' : '')
                          }
                          aria-label={'Đánh dấu ' + q.prompt}
                          aria-pressed={r.starred}
                          onClick={() =>
                            update((d) => ({
                              ...d,
                              reviews: {
                                ...d.reviews,
                                [key]: { ...r, starred: !r.starred },
                              },
                            }))
                          }
                        >
                          <Star
                            size={18}
                            fill={r.starred ? 'currentColor' : 'none'}
                          />
                        </button>
                      </div>
                    );
                  })}
              </div>
            </section>
          </>
        ) : (
          <Tabs value={tab} onValueChange={(value) => setTab(String(value))}>
            <TabsList variant="line" className="main-tabs">
              <TabsTrigger value="library">
                <Library size={18} />
                Thư viện của tôi
              </TabsTrigger>
              <TabsTrigger value="progress">
                <ChartNoAxesCombined size={18} />
                Tiến độ học
              </TabsTrigger>
              <TabsTrigger value="guide">
                <CircleHelp size={18} />
                Hướng dẫn TXT
              </TabsTrigger>
            </TabsList>
            <TabsContent value="library">
              <div className="page-heading">
                <div>
                  <p className="eyebrow">KHÔNG GIAN HỌC TẬP</p>
                  <h1>Mỗi ngày, thêm một từ mới.</h1>
                  <p className="muted">
                    Mở bộ từ của bạn. Chọn cách học bạn thích.
                  </p>
                </div>
                <span className="today-label">
                  <BookOpen size={19} />
                  English vocabulary
                </span>
              </div>
              <section className="import-hero">
                <div>
                  <span className="pill">
                    <Sparkles size={15} />
                    TỪ FILE TXT ĐẾN BỘ THẺ
                  </span>
                  <h2>
                    Bài học của bạn,
                    <br />
                    bắt đầu từ đây.
                  </h2>
                  <p>
                    Nhập file giáo viên đã gửi để học flashcard,
                    <br />
                    luyện từ vựng và tự kiểm tra.
                  </p>
                  <button
                    className="button primary"
                    onClick={() => setImportOpen(true)}
                  >
                    <FileUp size={19} />
                    Nhập file TXT
                  </button>
                  <button
                    className="button"
                    onClick={() => setCreateOpen(true)}
                  >
                    <Plus size={19} />
                    Tạo bộ từ
                  </button>
                  <button
                    className="text-button"
                    onClick={() =>
                      addDeck({
                        id: crypto.randomUUID(),
                        title: 'Everyday growth · Từ vựng mỗi ngày',
                        questions: parseTxt(DEMO_TXT).questions,
                        source: DEMO_TXT,
                        createdAt: Date.now(),
                      })
                    }
                  >
                    Thử bộ mẫu <ArrowRight size={16} />
                  </button>
                </div>
                <div className="format-preview">
                  <div className="file-label">
                    <FileText size={16} /> vocabulary.txt
                  </div>
                  <pre>
                    {
                      '1. resilient\n[1] dễ tổn thương\n[2*] kiên cường\n[3] do dự\n[4] thờ ơ'
                    }
                  </pre>
                  <div className="format-note">
                    <Check size={16} />
                    Dấu * đánh dấu đáp án đúng
                  </div>
                </div>
              </section>
              <div className="stats-strip">
                <div>
                  <span className="stat-icon">
                    <Library size={21} />
                  </span>
                  <b>{data.decks.length}</b>
                  <span>bộ từ của bạn</span>
                </div>
                <div>
                  <span className="stat-icon">
                    <Clock3 size={21} />
                  </span>
                  <b>{allDue}</b>
                  <span>thẻ mới / đến hạn</span>
                </div>
                <div>
                  <span className="stat-icon">
                    <Target size={21} />
                  </span>
                  <b>{completed.length}</b>
                  <span>lượt đã hoàn thành</span>
                </div>
              </div>
              <div className="section-heading">
                <h2>
                  Bộ từ của tôi{' '}
                  <span className="count-badge">{data.decks.length}</span>
                </h2>
                <div className="search-box">
                  <Search size={17} />
                  <input
                    type="search"
                    aria-label="Tìm bộ từ"
                    placeholder="Tìm bộ từ…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="deck-grid">
                {data.decks
                  .filter((d) => normalize(d.title).includes(normalize(search)))
                  .map((d, i) => {
                    const mastered = d.questions.filter(
                      (q) =>
                        (data.reviews[reviewKey(d.id, q.id)]?.interval ?? 0) >=
                        1,
                    ).length;
                    return (
                      <button
                        className={'deck-card theme-' + (i % 3)}
                        key={d.id}
                        onClick={() => openDeck(d)}
                      >
                        <div className="row-between">
                          <span className="deck-icon">
                            <BookOpen size={22} />
                          </span>
                          <span className="small muted">
                            {d.questions.length} từ / câu
                          </span>
                        </div>
                        <h3>{d.title}</h3>
                        <p className="small muted">
                          Nhập ngày{' '}
                          {new Date(d.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                        <div className="deck-progress">
                          <Progress
                            value={(mastered / d.questions.length) * 100}
                            aria-label={'Tiến độ ' + d.title}
                          />
                          <span>
                            {mastered} / {d.questions.length} thẻ đã nhớ
                          </span>
                        </div>
                        <span className="deck-link">
                          Mở bộ học <ArrowRight size={16} />
                        </span>
                      </button>
                    );
                  })}
                <button
                  className="new-deck-card"
                  onClick={() => setImportOpen(true)}
                >
                  <span>
                    <Plus size={25} />
                  </span>
                  <b>Thêm bộ từ mới</b>
                  <p>Từ file TXT hoặc nội dung có sẵn</p>
                </button>
              </div>
              {search &&
                !data.decks.some((d) =>
                  normalize(d.title).includes(normalize(search)),
                ) && (
                  <p className="muted center">
                    Chưa có bộ từ khớp với tìm kiếm.
                  </p>
                )}
              <div className="privacy-note">
                <ShieldCheck size={18} />
                <p>
                  Không tài khoản. Không tải TXT lên máy chủ. Bộ từ và tiến độ
                  nằm trên thiết bị của bạn.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="progress">
              <div className="page-heading">
                <div>
                  <p className="eyebrow">NHÌN LẠI CHẶNG ĐƯỜNG</p>
                  <h1>Tiến độ học của bạn</h1>
                  <p className="muted">
                    Lưu tối đa 30 phiên gần nhất, gồm cả bài đang làm.
                  </p>
                </div>
              </div>
              <div className="stats-strip">
                <div>
                  <b>{completed.length}</b>
                  <span>lượt hoàn thành</span>
                </div>
                <div>
                  <b>
                    {totalAnswers
                      ? Math.round((totalCorrect / totalAnswers) * 100) + '%'
                      : '—'}
                  </b>
                  <span>độ chính xác các lượt đã nộp</span>
                </div>
                <div>
                  <b>{allDue}</b>
                  <span>thẻ mới / đến hạn</span>
                </div>
              </div>
              <section className="panel">
                <h2>Lịch sử học</h2>
                {!data.sessions.length && (
                  <p className="empty-copy">
                    Hoàn thành lượt luyện tập đầu tiên để thấy kết quả ở đây.
                  </p>
                )}
                {data.sessions.map((s) => {
                  const d = data.decks.find((d) => d.id === s.deckId);
                  const score = sessionScore(s);
                  return (
                    <button
                      className="history-row"
                      key={s.id}
                      onClick={() => {
                        setSelectedDeck(s.deckId);
                        setSessionId(s.id);
                        setView('session');
                      }}
                    >
                      <span className="mode-symbol blue">
                        <Target size={22} />
                      </span>
                      <span>
                        <b>{d?.title}</b>
                        <small>
                          {modeNames[s.mode]} ·{' '}
                          {new Date(s.startedAt).toLocaleString('vi-VN')}
                        </small>
                      </span>
                      <span className="history-score">
                        {s.finishedAt
                          ? score.correct + '/' + score.total
                          : 'Đang làm'}
                        <ArrowRight size={16} />
                      </span>
                    </button>
                  );
                })}
              </section>
              <section className="panel">
                <h2>Từ cần thêm một lần ôn</h2>
                <p className="muted small">
                  Các từ có ít nhất một lần sai trong lịch sử chấm bài.
                </p>
                {data.decks.flatMap((d) =>
                  d.questions
                    .filter(
                      (q) =>
                        (data.reviews[reviewKey(d.id, q.id)]?.wrong ?? 0) > 0,
                    )
                    .map((q) => (
                      <div className="question-row" key={reviewKey(d.id, q.id)}>
                        <div>
                          <b>{q.prompt}</b>
                          <p className="muted small">
                            {solution(q)} ·{' '}
                            {data.reviews[reviewKey(d.id, q.id)].wrong} lần sai
                          </p>
                        </div>
                        <button
                          className="text-button"
                          onClick={() => openDeck(d)}
                        >
                          Mở bộ từ
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    )),
                )}
                {!Object.values(data.reviews).some((r) => r.wrong > 0) && (
                  <p className="empty-copy">Chưa có câu sai được ghi nhận.</p>
                )}
              </section>
            </TabsContent>
            <TabsContent value="guide">
              <div className="page-heading">
                <div>
                  <p className="eyebrow">DÀNH CHO GIÁO VIÊN VÀ HỌC VIÊN</p>
                  <h1>Một file, nhiều cách học.</h1>
                  <p className="muted">
                    Giáo viên gửi TXT qua kênh riêng. Học viên mở app và tự nhập
                    file.
                  </p>
                </div>
              </div>
              <div className="guide-grid">
                <section className="panel">
                  <span className="mode-symbol blue">
                    <FileText size={23} />
                  </span>
                  <h2>Dạng trắc nghiệm</h2>
                  <p className="muted">
                    Đánh dấu * ở đáp án đúng. Mỗi câu mới bắt đầu ở một dòng
                    mới.
                  </p>
                  <pre className="code-sample">
                    {
                      '1. apple nghĩa là gì?\n[1*] quả táo\n[2] quả cam\n[3] quả nho\n[4] quả chuối\nGiải thích: I eat an apple every day.\n\n2. curious [1] buồn [2*] tò mò'
                    }
                  </pre>
                  <p className="small muted">
                    Hỗ trợ [3*] hoặc [3\*], đáp án cùng dòng hay xuống dòng.
                    Nhiều dấu * tạo câu chọn nhiều; phải chọn đúng và đủ.
                  </p>
                  <button
                    className="button"
                    onClick={() => download('trac-nghiem-mau.txt', DEMO_TXT)}
                  >
                    <Download size={16} />
                    Tải mẫu trắc nghiệm
                  </button>
                </section>
                <section className="panel">
                  <span className="mode-symbol green">
                    <Keyboard size={23} />
                  </span>
                  <h2>Dạng từ :: nghĩa</h2>
                  <p className="muted">
                    Nhanh hơn cho bộ từ vựng. Mỗi dòng là một cặp.
                  </p>
                  <pre className="code-sample">
                    {
                      'apple :: quả táo\ncurious :: tò mò\nresilient :: kiên cường\nthoughtful :: chu đáo'
                    }
                  </pre>
                  <p className="small muted">
                    App dùng nghĩa của các từ khác làm lựa chọn khi tạo quiz.
                    Cần ít nhất 2 nghĩa khác nhau. Dùng riêng một kiểu định dạng
                    trong mỗi file.
                  </p>
                  <button
                    className="button"
                    onClick={() =>
                      download(
                        'tu-vung-mau.txt',
                        'apple :: quả táo\ncurious :: tò mò\nresilient :: kiên cường\nthoughtful :: chu đáo',
                      )
                    }
                  >
                    <Download size={16} />
                    Tải mẫu từ vựng
                  </button>
                </section>
              </div>
              <section className="panel guide-notes">
                <h2>Học thuận tiện hơn</h2>
                <p>
                  <b>Phát âm:</b> Bấm biểu tượng loa cạnh từ tiếng Anh. Bản
                  desktop dùng giọng tiếng Anh của hệ điều hành. Bản web phụ
                  thuộc giọng của trình duyệt; một số giọng cần mạng.
                </p>
                <p>
                  <b>Ôn cách quãng:</b> Lật thẻ rồi chọn Chưa nhớ / Khó / Đã nhớ
                  / Rất dễ. Nộp quiz cũng cập nhật lịch: câu đúng = Đã nhớ, sai
                  hoặc bỏ trống = Chưa nhớ. Vào “Đến hạn ôn” mỗi ngày; lịch này
                  là gợi ý học, không phải dự đoán chắc chắn khả năng nhớ.
                </p>
                <p>
                  <b>Luyện gõ:</b> Mặc định hiện nghĩa và yêu cầu gõ từ tiếng
                  Anh. Không phân biệt chữ hoa/thường; dấu câu phải khớp nội
                  dung file.
                </p>
                <p>
                  <b>Kiểm tra:</b> Điểm dựa trên số câu đúng. Đồng hồ không cộng
                  điểm tốc độ. Bài có đồng hồ vẫn tính thời gian khi tạm nghỉ.
                </p>
                <p>
                  <b>Sao lưu:</b> Dùng “Xuất sao lưu” để giữ bộ từ và tiến độ.
                  Đổi trình duyệt hoặc xóa dữ liệu trang sẽ không tự chuyển tiến
                  độ sang máy mới.
                </p>
                <p>
                  <b>Soạn TXT:</b> Lưu UTF-8, tối đa 1 MB và 1.000 câu. Không
                  dùng số + dấu chấm ở đầu dòng bên trong nội dung câu; dùng (1)
                  để tránh nhầm câu mới.
                </p>
              </section>
            </TabsContent>
          </Tabs>
        )}
        <footer className="app-footer">
          <span>
            WordNest <span className="muted">/ Góc học từ vựng của bạn</span>
          </span>
          <div className="inline-controls">
            <button
              className="text-button"
              disabled={!ready}
              onClick={() =>
                download(
                  'wordnest-sao-luu.json',
                  JSON.stringify(data, null, 2),
                  'application/json',
                )
              }
            >
              <Download size={15} />
              Xuất sao lưu
            </button>
            <button
              className="text-button"
              onClick={() => backupInput.current?.click()}
            >
              <Upload size={15} />
              Nhập sao lưu
            </button>
          </div>
        </footer>
      </main>
      <input
        type="file"
        accept=".json,application/json"
        hidden
        ref={backupInput}
        onChange={(e) => {
          void readBackup(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      <DeckCreator
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={addDeck}
      />
      <Importer
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={addDeck}
      />
      <AlertDialog
        open={Boolean(deleteId)}
        onOpenChange={(v) => {
          if (!v) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Xóa bộ từ này?</AlertDialogTitle>
          <AlertDialogDescription>
            Bộ từ và tiến độ liên quan sẽ được xóa trên thiết bị này. Bạn có thể
            xuất sao lưu trước khi xóa.
          </AlertDialogDescription>
          <div className="button-row">
            <AlertDialogCancel>Giữ lại</AlertDialogCancel>
            <button className="button danger-button" onClick={removeDeck}>
              Xóa bộ từ
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={Boolean(pendingBackup)}
        onOpenChange={(v) => {
          if (!v) setPendingBackup(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Khôi phục bản sao lưu?</AlertDialogTitle>
          <AlertDialogDescription>
            Bản sao lưu có {pendingBackup?.decks.length} bộ từ. Thao tác này
            thay thế toàn bộ thư viện và tiến độ hiện tại trên thiết bị.
          </AlertDialogDescription>
          <button
            className="button"
            onClick={() =>
              download(
                'wordnest-truoc-khoi-phuc.json',
                JSON.stringify(data, null, 2),
                'application/json',
              )
            }
          >
            Sao lưu dữ liệu hiện tại
          </button>
          <div className="button-row">
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <button
              className="button primary"
              onClick={() => {
                if (pendingBackup && restore(pendingBackup)) {
                  setPendingBackup(null);
                  goHome();
                  setNotice('Đã khôi phục thư viện và tiến độ.');
                }
              }}
            >
              Thay thế và khôi phục
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
