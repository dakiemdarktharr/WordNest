'use client';
import { useMemo, useRef, useState } from 'react';
import { FileUp, Check, FileText, X, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { parseTxt, solution, MAX_FILE_BYTES, type Deck } from '@/lib/learning';
import { download } from '@/lib/storage';
export function Importer({
  open,
  onClose,
  onImport,
}: {
  open: boolean;
  onClose: () => void;
  onImport: (deck: Deck) => boolean;
}) {
  const [raw, setRaw] = useState('');
  const [title, setTitle] = useState('');
  const [fileError, setFileError] = useState('');
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const parsed = useMemo(() => parseTxt(raw), [raw]);
  async function read(file?: File) {
    if (!file) return;
    setFileError('');
    if (
      !file.name.toLowerCase().endsWith('.txt') ||
      file.size > MAX_FILE_BYTES
    ) {
      setFileError('Chọn file .txt UTF-8, tối đa 1 MB.');
      return;
    }
    setBusy(true);
    try {
      const text = new TextDecoder('utf-8', { fatal: true }).decode(
        await file.arrayBuffer(),
      );
      setRaw(text);
      setTitle(file.name.replace(/\.txt$/i, '').slice(0, 120));
    } catch {
      setFileError(
        'Không đọc được file. Hãy lưu lại dưới dạng UTF-8 trong Notepad.',
      );
    } finally {
      setBusy(false);
    }
  }
  function commit() {
    if (busy || parsed.errors.length || !title.trim() || fileError) return;
    if (
      onImport({
        id: crypto.randomUUID(),
        title: title.trim(),
        questions: parsed.questions,
        source: raw,
        createdAt: Date.now(),
      })
    ) {
      setRaw('');
      setTitle('');
      onClose();
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <DialogContent className="import-dialog" showCloseButton={false}>
        <div className="row-between">
          <div>
            <DialogTitle className="dialog-title">
              Nhập bộ từ của bạn
            </DialogTitle>
            <DialogDescription>
              Chọn file giáo viên gửi hoặc dán nội dung. File được xử lý ngay
              trên thiết bị.
            </DialogDescription>
          </div>
          <DialogClose className="icon-button" aria-label="Đóng">
            <X size={20} />
          </DialogClose>
        </div>
        <button
          className="dropzone"
          onClick={() => input.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void read(e.dataTransfer.files[0]);
          }}
          disabled={busy}
        >
          <FileUp size={27} />
          <b>{busy ? 'Đang đọc file…' : 'Chọn hoặc kéo thả file TXT'}</b>
          <span>UTF-8 · Tối đa 1 MB · 1.000 câu</span>
        </button>
        <input
          ref={input}
          type="file"
          accept=".txt,text/plain"
          hidden
          onChange={(e) => {
            void read(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
        <label className="field">
          Tên bộ từ
          <input
            type="text"
            value={title}
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Unit 1 · Daily life"
          />
        </label>
        <label className="field">
          Nội dung TXT
          <textarea
            value={raw}
            maxLength={1_000_000}
            onChange={(e) => {
              setRaw(e.target.value);
              setFileError('');
            }}
            rows={6}
            placeholder={
              'apple :: quả táo\ncurious :: tò mò\n\nHoặc:\n1. apple [1*] quả táo [2] quả cam'
            }
          />
        </label>
        {fileError && (
          <p className="error" role="alert">
            {fileError}
          </p>
        )}
        {raw && parsed.errors.length > 0 && (
          <div className="error" role="alert">
            <b>Cần sửa trước khi nhập</b>
            {parsed.errors.slice(0, 8).map((e, i) => (
              <p key={i}>
                Dòng {e.line}: {e.message}
              </p>
            ))}
            {parsed.errors.length > 8 && (
              <p>Và {parsed.errors.length - 8} lỗi khác.</p>
            )}
          </div>
        )}
        {raw && !parsed.errors.length && (
          <div className="import-preview">
            <div className="success-line">
              <Check size={17} /> Nhận diện {parsed.questions.length} câu · đáp
              án đã đánh dấu
            </div>
            {parsed.questions.slice(0, 3).map((q) => (
              <div className="mini-pair" key={q.id}>
                <b>{q.prompt}</b>
                <span>{solution(q)}</span>
              </div>
            ))}
            {parsed.questions.length > 3 && (
              <small>Và {parsed.questions.length - 3} câu khác…</small>
            )}
          </div>
        )}
        <div className="row-between wrap">
          <button
            className="text-button"
            onClick={() =>
              download(
                'tu-vung-mau.txt',
                'apple :: quả táo\ncurious :: tò mò\nresilient :: kiên cường\nthoughtful :: chu đáo',
              )
            }
          >
            <Download size={16} />
            Tải TXT mẫu
          </button>
          <button
            className="button primary"
            disabled={
              busy ||
              !raw ||
              !!parsed.errors.length ||
              !title.trim() ||
              !!fileError
            }
            onClick={commit}
          >
            <FileText size={17} />
            Tạo bộ học
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
