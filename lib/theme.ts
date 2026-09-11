export type Theme = 'light' | 'dark';
export const THEME_KEY = 'wordnest:theme';
export function loadTheme(
  storage: Pick<Storage, 'getItem'>,
  prefersDark = false,
): Theme {
  try {
    const saved = storage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* The OS preference remains usable when storage is unavailable. */
  }
  return prefersDark ? 'dark' : 'light';
}
