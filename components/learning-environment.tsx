import { useEffect, useState } from 'react';
export function LearningEnvironment() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const changed = () => setOnline(navigator.onLine);
    window.addEventListener('online', changed);
    window.addEventListener('offline', changed);
    return () => {
      window.removeEventListener('online', changed);
      window.removeEventListener('offline', changed);
    };
  }, []);
  const desktop = Boolean(window.wordnestDesktop);
  return (
    <output
      className="environment-note"
      aria-label="Trạng thái lưu trữ và kết nối"
    >
      <strong>
        {desktop
          ? 'WordNest Desktop · Học ngoại tuyến'
          : online
            ? 'WordNest Web · Lưu trên thiết bị'
            : 'WordNest Web · Đang mất mạng'}
      </strong>
      <span>
        {desktop
          ? 'TXT, flashcard, quiz và lịch ôn hoạt động không cần mạng. Xuất sao lưu để chuyển máy.'
          : online
            ? 'Dữ liệu lưu cục bộ. Cần mạng để mở lại bản web; bản desktop có thể mở ngoại tuyến.'
            : 'Bạn vẫn có thể học và lưu trong trang đang mở. Đừng tải lại trang khi chưa có mạng; hãy xuất sao lưu.'}
      </span>
    </output>
  );
}
