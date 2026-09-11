import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { loadTheme, THEME_KEY, type Theme } from '@/lib/theme';
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  );
  const [error, setError] = useState('');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  useEffect(() => {
    const changed = (event: StorageEvent) => {
      if (event.key === THEME_KEY || event.key === null)
        setTheme(
          loadTheme(
            localStorage,
            window.matchMedia('(prefers-color-scheme: dark)').matches,
          ),
        );
    };
    window.addEventListener('storage', changed);
    return () => window.removeEventListener('storage', changed);
  }, []);
  return (
    <div className="theme-control">
      <button
        className="button"
        aria-label={
          theme === 'light'
            ? 'Chuyển sang giao diện tối'
            : 'Chuyển sang giao diện sáng'
        }
        onClick={() => {
          const next = theme === 'light' ? 'dark' : 'light';
          setTheme(next);
          try {
            localStorage.setItem(THEME_KEY, next);
            setError('');
          } catch {
            setError(
              'Giao diện chỉ áp dụng lần này vì không lưu được tùy chọn.',
            );
          }
        }}
      >
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        <span>{theme === 'light' ? 'Tối' : 'Sáng'}</span>
      </button>
      {error && (
        <span className="speech-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
