import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { createVocabularyDeck, type VocabularyRow } from '@/lib/deck-builder';
import { type Deck } from '@/lib/learning';

export function DeckCreator({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (deck: Deck) => boolean;
}) {
  const [title, setTitle] = useState('');
  const [rows, setRows] = useState<VocabularyRow[]>([
    { term: '', meaning: '' },
  ]);
  const [error, setError] = useState('');
  function commit() {
    try {
      if (!onCreate(createVocabularyDeck(title, rows))) {
        setError(
          'Chưa lưu được bộ từ. Kiểm tra dung lượng hoặc thông báo bộ nhớ trong app.',
        );
        return;
      }
      setTitle('');
      setRows([{ term: '', meaning: '' }]);
      setError('');
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tạo được bộ từ.');
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <DialogContent className="import-dialog">
        <DialogTitle className="dialog-title">Tạo bộ từ mới</DialogTitle>
        <DialogDescription>
          Nhập từ và nghĩa để học ngay trên thiết bị. Từ 2 nghĩa khác nhau có
          thể tạo quiz; từ 4 nghĩa sẽ có 4 lựa chọn.
        </DialogDescription>
        <label className="field">
          Tên bộ từ
          <input
            type="text"
            value={title}
            maxLength={120}
            onChange={(e) => {
              setTitle(e.target.value);
              setError('');
            }}
            placeholder="Ví dụ: Travel vocabulary"
          />
        </label>
        <div className="vocabulary-editor">
          {rows.map((row, i) => (
            <div className="vocabulary-editor-row" key={i}>
              <label className="field">
                Từ {i + 1}
                <input
                  type="text"
                  value={row.term}
                  maxLength={1000}
                  onChange={(e) => {
                    setRows(
                      rows.map((r, n) =>
                        n === i ? { ...r, term: e.target.value } : r,
                      ),
                    );
                    setError('');
                  }}
                />
              </label>
              <label className="field">
                Nghĩa {i + 1}
                <input
                  type="text"
                  value={row.meaning}
                  maxLength={2000}
                  onChange={(e) => {
                    setRows(
                      rows.map((r, n) =>
                        n === i ? { ...r, meaning: e.target.value } : r,
                      ),
                    );
                    setError('');
                  }}
                />
              </label>
              <button
                className="icon-button danger"
                aria-label={'Xóa dòng ' + (i + 1)}
                disabled={rows.length === 1}
                onClick={() => setRows(rows.filter((_, n) => n !== i))}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="row-between wrap">
          <button
            className="button"
            disabled={rows.length >= 1000}
            onClick={() => setRows([...rows, { term: '', meaning: '' }])}
          >
            <Plus size={17} />
            Thêm từ
          </button>
          <button className="button primary" onClick={commit}>
            Lưu bộ từ
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
