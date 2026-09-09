import path from 'node:path';
export const CSP =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-src 'none'; form-action 'none'";
export function resolveAsset(rawUrl, root) {
  try {
    const url = new URL(rawUrl);
    if (
      url.protocol !== 'wordnest:' ||
      url.hostname !== 'app' ||
      url.port ||
      url.username ||
      url.password
    )
      return null;
    const decoded = decodeURIComponent(url.pathname);
    if (
      decoded.includes('\\') ||
      decoded.includes('\0') ||
      decoded.split('/').includes('..')
    )
      return null;
    const target = path.resolve(
      root,
      '.' + (decoded === '/' ? '/index.html' : decoded),
    );
    const relative = path.relative(root, target);
    return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
      ? target
      : null;
  } catch {
    return null;
  }
}
export function contentType(file) {
  return (
    {
      '.html': 'text/html;charset=utf-8',
      '.js': 'text/javascript;charset=utf-8',
      '.css': 'text/css;charset=utf-8',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.ico': 'image/x-icon',
      '.txt': 'text/plain;charset=utf-8',
      '.woff2': 'font/woff2',
    }[path.extname(file)] || 'application/octet-stream'
  );
}
