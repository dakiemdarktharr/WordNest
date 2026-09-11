'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { emptyData, type StudyData } from '@/lib/learning';
import { loadData, saveData, STORAGE_KEY } from '@/lib/storage';
export function useStudyData() {
  const [data, setData] = useState<StudyData>(emptyData);
  const [ready, setReady] = useState(false);
  const [storageError, setError] = useState('');
  const state = useRef(data);
  const raw = useRef<string | null>(null);
  const blocked = useRef(false);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const loaded = loadData(localStorage);
        state.current = loaded.data;
        raw.current = loaded.raw;
        setData(loaded.data);
      } catch {
        blocked.current = true;
        setError(
          'Không đọc được dữ liệu đã lưu. Hãy tải bản dữ liệu hiện có trước khi khôi phục từ bản sao lưu.',
        );
      }
      setReady(true);
    });
    const changed = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === null) {
        blocked.current = true;
        setError(
          'Dữ liệu đã thay đổi ở tab khác. Hãy tải lại trang để tiếp tục an toàn.',
        );
      }
    };
    window.addEventListener('storage', changed);
    return () => {
      active = false;
      window.removeEventListener('storage', changed);
    };
  }, []);
  const update = useCallback((recipe: (previous: StudyData) => StudyData) => {
    if (blocked.current) return false;
    try {
      const next = recipe(state.current);
      raw.current = saveData(localStorage, raw.current, next);
      state.current = next;
      setData(next);
      setError('');
      return true;
    } catch (e) {
      setError(
        'Chưa lưu thay đổi. ' +
          (e instanceof Error && !e.message.toLowerCase().includes('quota')
            ? e.message
            : 'Bộ nhớ thiết bị đã đầy hoặc không cho phép ghi. Hãy sao lưu và xóa bớt bộ từ.'),
      );
      return false;
    }
  }, []);
  const restore = (next: StudyData) => {
    try {
      const content = JSON.stringify(next);
      localStorage.setItem(STORAGE_KEY, content);
      raw.current = content;
      state.current = next;
      blocked.current = false;
      setData(next);
      setError('');
      return true;
    } catch {
      setError(
        'Không thể khôi phục: thiết bị không đủ bộ nhớ hoặc không cho phép lưu.',
      );
      return false;
    }
  };
  return { data, ready, storageError, update, restore };
}
