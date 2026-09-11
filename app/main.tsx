import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Home from './page';
import './globals.css';
import { loadTheme } from '@/lib/theme';
try {
  document.documentElement.classList.toggle(
    'dark',
    loadTheme(
      localStorage,
      window.matchMedia('(prefers-color-scheme: dark)').matches,
    ) === 'dark',
  );
} catch {
  /* Keep a usable light theme when browser storage access is denied. */
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Home />
  </StrictMode>,
);
