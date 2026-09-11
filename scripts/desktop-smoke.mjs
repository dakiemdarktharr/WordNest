import { _electron as electron, expect } from '@playwright/test';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
const output = path.resolve('outputs/desktop-smoke-' + Date.now());
await mkdir(output, { recursive: true });
const profile = path.join(output, 'profile');
const executablePath = path.resolve(
  process.env.WORDNEST_EXECUTABLE || 'release/win-unpacked/WordNest.exe',
);
const env = { ...process.env, WORDNEST_TEST_USER_DATA: profile };
delete env.ELECTRON_RUN_AS_NODE;
const errors = [];
async function launch() {
  const app = await electron.launch({
    executablePath,
    args: ['--wordnest-smoke'],
    env,
    timeout: 30000,
  });
  const page = await app.firstWindow();
  page.setDefaultTimeout(15000);
  page.on('pageerror', (error) => errors.push(error.message));
  await page.waitForURL('wordnest://app/');
  await expect(
    page.getByRole('button', { name: 'Nhập file TXT', exact: true }),
  ).toBeVisible();
  return { app, page };
}
let active;
try {
  let { app, page } = await launch();
  active = app;
  const security = await app.evaluate(({ BrowserWindow }) => {
    const prefs =
      BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences();
    return {
      sandbox: prefs.sandbox,
      contextIsolation: prefs.contextIsolation,
      nodeIntegration: prefs.nodeIntegration,
    };
  });
  expect(security).toEqual({
    sandbox: true,
    contextIsolation: true,
    nodeIntegration: false,
  });
  expect(await page.evaluate(() => typeof window.require)).toBe('undefined');
  expect(await page.evaluate(() => window.wordnestDesktop?.isDesktop)).toBe(
    true,
  );
  expect(
    await page.evaluate(async () => {
      try {
        await fetch('https://example.com');
        return false;
      } catch {
        return true;
      }
    }),
  ).toBe(true);
  // Exercise the native menu -> isolated preload -> import dialog.
  await app.evaluate(({ Menu }) =>
    Menu.getApplicationMenu().getMenuItemById('import-txt').click(),
  );
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.locator('input[type=file]').setInputFiles({
    name: 'Desktop vocabulary.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('1. câu hỏi 1? [1] A [2] B [3*] C [4] D'),
  });
  await expect(
    dialog.getByText('Nhận diện 1 câu', { exact: false }),
  ).toBeVisible();
  await dialog.getByRole('button', { name: 'Tạo bộ học' }).click();
  await page.getByRole('button', { name: 'Bắt đầu luyện tập' }).click();
  await expect(page.locator('.answer-option')).toHaveCount(4);
  await page
    .locator('.answer-option')
    .filter({ hasText: /C$/ })
    .getByRole('button')
    .click();
  await page
    .getByRole('button', { name: 'Kiểm tra đáp án', exact: true })
    .click();
  await expect(
    page.getByText('Chính xác, làm tốt lắm!', { exact: false }),
  ).toBeVisible();
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('wordnest:v1')),
  );
  expect(stored.decks).toHaveLength(1);
  expect(Object.values(stored.sessions[0].answers)[0].correct).toBe(true);
  await page.screenshot({ path: path.join(output, 'quiz.png') });
  await app.close();
  active = undefined;
  ({ app, page } = await launch());
  active = app;
  await page
    .getByRole('button')
    .filter({ has: page.getByRole('heading', { name: 'Desktop vocabulary' }) })
    .click();
  await expect(page.getByRole('button', { name: /Tiếp tục/ })).toBeVisible();
  await page.getByRole('button', { name: /Flashcard/ }).click();
  await page.getByRole('button', { name: 'Lật để xem đáp án' }).click();
  await expect(page.locator('.flash-word')).toHaveText('C');
  await page.getByRole('button', { name: 'Đánh dấu thẻ', exact: true }).click();
  await page.getByRole('button', { name: /Đã nhớ/ }).click();
  const after = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('wordnest:v1')),
  );
  expect(
    Object.values(after.reviews).some((r) => r.starred && r.interval >= 1),
  ).toBe(true);
  await page.locator('button.brand').click();
  // Native Save As is intentionally replaced only in this test process.
  const backupPath = path.join(output, 'backup.json');
  await app.evaluate(
    ({ session }, savePath) =>
      session.defaultSession.once('will-download', (_event, item) =>
        item.setSavePath(savePath),
      ),
    backupPath,
  );
  await page.getByRole('button', { name: 'Xuất sao lưu', exact: true }).click();
  await expect
    .poll(async () => {
      try {
        return JSON.parse(await readFile(backupPath, 'utf8')).decks.length;
      } catch {
        return 0;
      }
    })
    .toBe(1);
  console.log(
    'Available voices:',
    await page.evaluate(() =>
      speechSynthesis
        .getVoices()
        .map((v) => ({ name: v.name, lang: v.lang, local: v.localService })),
    ),
  );
  const speech = await page.evaluate(() =>
    window.wordnestDesktop.speak('resilient'),
  );
  expect(speech.ok, JSON.stringify(speech)).toBe(true);
  const wave = await readFile(path.join(profile, 'speech-test.wav'));
  expect(wave.subarray(0, 4).toString()).toBe('RIFF');
  expect(wave.length).toBeGreaterThan(1000);
  expect(
    await page.evaluate(() => window.wordnestDesktop.speak('x'.repeat(501))),
  ).toEqual({ ok: false, error: 'invalid-text' });
  console.log('Native Windows speech:', speech.voice, wave.length, 'bytes');
  expect(errors).toEqual([]);
  await writeFile(
    path.join(output, 'result.json'),
    JSON.stringify(
      {
        passed: true,
        executablePath,
        security,
        checks: [
          'local bundled origin',
          'no renderer Node access',
          'external network blocked',
          'native import menu',
          'TXT file import',
          'four choices and C correct',
          'session persistence after relaunch',
          'flashcard flip and scheduled review',
          'native backup download',
        ],
        errors,
      },
      null,
      2,
    ),
  );
  console.log('PASS desktop smoke:', output);
} finally {
  if (active) await active.close();
}
