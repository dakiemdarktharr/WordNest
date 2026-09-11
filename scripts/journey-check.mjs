import { featureJourney } from './feature-journey.mjs';
import { _electron as electron, chromium, expect } from '@playwright/test';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const desktop = process.argv.includes('--desktop');
const output = path.resolve(
  process.env.WORDNEST_EVIDENCE_DIR ||
    `outputs/journey-${desktop ? 'desktop' : 'web'}`,
);
await mkdir(output, { recursive: true });
const fixture = await readFile('examples/wordnest-demo.txt');
const checks = [];
const errors = [];
const started = performance.now();
let app, browser, context, page, desktopEnv;
async function check(name, fn) {
  await fn();
  checks.push(name);
  console.log('PASS', name);
}
async function snapshot(name) {
  // Screenshots come from the foreground-capable headless browser renderer.
  // Hidden Electron capturePage can return stale compositor frames; desktop checks assert DOM and storage.
  if (desktop) return;
  await page.screenshot({
    path: path.join(output, name + '.png'),
    animations: 'disabled',
    fullPage: false,
  });
}
const stored = () =>
  page.evaluate(() => JSON.parse(localStorage.getItem('wordnest:v1')));
try {
  if (desktop) {
    const env = {
      ...process.env,
      WORDNEST_TEST_USER_DATA: path.join(output, 'profile-' + Date.now()),
    };
    delete env.ELECTRON_RUN_AS_NODE;
    desktopEnv = env;
    app = await electron.launch({
      executablePath: path.resolve(
        process.env.WORDNEST_EXECUTABLE || 'release/win-unpacked/WordNest.exe',
      ),
      args: ['--wordnest-smoke'],
      env,
    });
    page = await app.firstWindow();
    context = app.context();
    await app.evaluate(({ BrowserWindow }) =>
      BrowserWindow.getAllWindows()[0].webContents.setBackgroundThrottling(
        false,
      ),
    );
  } else {
    browser = await chromium.launch({
      channel: process.env.WORDNEST_BROWSER_CHANNEL || 'msedge',
      headless: true,
    });
    context = await browser.newContext({
      viewport: { width: 1280, height: 960 },
      deviceScaleFactor: 1,
    });
    page = await context.newPage();
    await page.goto(process.env.WORDNEST_WEB_URL || 'http://127.0.0.1:4173');
  }
  page.setDefaultTimeout(15000);
  page.on('pageerror', (e) => errors.push(e.message));
  await expect(
    page.getByRole('button', { name: 'Nhập file TXT', exact: true }),
  ).toBeVisible();
  const readyMs = performance.now() - started;
  await check('explicit offline behavior', async () => {
    if (!desktop) {
      await context.setOffline(true);
      await expect(
        page.getByText('WordNest Web · Đang mất mạng', { exact: true }),
      ).toBeVisible();
    } else {
      await expect(
        page.getByText('WordNest Desktop · Học ngoại tuyến', { exact: true }),
      ).toBeVisible();
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
    }
  });
  await page
    .getByRole('button', { name: 'Nhập file TXT', exact: true })
    .click();
  const dialog = page.getByRole('dialog');
  const input = dialog.locator('input[type=file]');
  await check('invalid UTF-8 is rejected visibly', async () => {
    await input.setInputFiles({
      name: 'invalid.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from([0xc3, 0x28]),
    });
    await expect(dialog.getByRole('alert')).toContainText('UTF-8');
    await expect(
      dialog.getByRole('button', { name: 'Tạo bộ học' }),
    ).toBeDisabled();
  });
  await check('malformed TXT cannot be committed', async () => {
    await input.setInputFiles({
      name: 'missing-star.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('1. word [1] A [2] B'),
    });
    await expect(dialog.getByRole('alert')).toContainText('thiếu dấu *');
    await expect(
      dialog.getByRole('button', { name: 'Tạo bộ học' }),
    ).toBeDisabled();
  });
  await input.setInputFiles({
    name: 'WordNest demo.txt',
    mimeType: 'text/plain',
    buffer: fixture,
  });
  await expect(
    dialog.getByText('Nhận diện 4 câu', { exact: false }),
  ).toBeVisible();
  await snapshot('01-import');
  await dialog.getByRole('button', { name: 'Tạo bộ học' }).click();
  await check('imports four vocabulary pairs', async () =>
    expect((await stored()).decks[0].questions).toHaveLength(4),
  );
  await page.getByRole('button', { name: /Flashcard/ }).click();
  await page.getByRole('button', { name: 'Lật để xem đáp án' }).click();
  await expect(page.locator('.flash-word')).toHaveText('kiên cường');
  await snapshot('02-flashcard');
  await page.getByRole('button', { name: /Đã nhớ/ }).click();
  const flash = await stored();
  const deckId = flash.decks[0].id;
  await check('flashcard schedules first review in one day', async () =>
    expect(flash.reviews[deckId + ':q1'].interval).toBe(1),
  );
  await page
    .getByRole('button', { name: 'WordNest demo', exact: true })
    .click();
  await page.getByRole('switch', { name: 'Trộn thứ tự câu hỏi' }).uncheck();
  await page.getByRole('button', { name: 'Bắt đầu luyện tập' }).click();
  const answers = ['kiên cường', 'kiên cường', 'chu đáo', 'nhất quán'];
  for (let i = 0; i < 4; i++) {
    await page
      .locator('.answer-option button')
      .filter({ has: page.getByText(answers[i], { exact: true }) })
      .click();
    await page
      .getByRole('button', { name: 'Kiểm tra đáp án', exact: true })
      .click();
    if (i === 0) await snapshot('03-quiz');
    await page
      .getByRole('button', {
        name: i === 3 ? 'Nộp bài' : 'Câu tiếp theo',
        exact: true,
      })
      .click();
  }
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Nộp bài', exact: true })
    .click();
  await expect(
    page.getByText('3 / 4 câu đúng', { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByText('Lịch ôn đã cập nhật:', { exact: false }),
  ).toBeVisible();
  await snapshot('04-results');
  const completed = await stored();
  const session = completed.sessions[0];
  await check(
    'quiz grades 3/4 and updates the same review schedule',
    async () => {
      expect(
        Object.values(session.answers).filter((a) => a.correct),
      ).toHaveLength(3);
      expect(completed.reviews[deckId + ':q1'].interval).toBe(2);
      expect(completed.reviews[deckId + ':q1'].due).toBe(
        session.finishedAt + 2 * 86400000,
      );
      expect(completed.reviews[deckId + ':q2'].due).toBe(
        session.finishedAt + 60000,
      );
      expect(completed.reviews[deckId + ':q2'].wrong).toBe(1);
    },
  );
  if (!desktop) await context.setOffline(false);
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Nhập file TXT', exact: true }),
  ).toBeVisible();
  await check(
    'reload preserves completed quiz and review dates exactly',
    async () => expect(await stored()).toEqual(completed),
  );
  await page.getByRole('tab', { name: /Tiến độ/ }).click();
  await snapshot('05-progress');
  if (desktop && process.platform === 'darwin') {
    await check('Mac native menu and renderer isolation', async () => {
      expect(
        await app.evaluate(({ Menu, BrowserWindow }) => {
          const menu = Menu.getApplicationMenu();
          const prefs =
            BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences();
          return {
            importShortcut: menu.getMenuItemById('import-txt').accelerator,
            appMenu: menu.items[0].role,
            sandbox: prefs.sandbox,
            nodeIntegration: prefs.nodeIntegration,
            contextIsolation: prefs.contextIsolation,
          };
        }),
      ).toEqual({
        importShortcut: 'CmdOrCtrl+O',
        appMenu: 'appmenu',
        sandbox: true,
        nodeIntegration: false,
        contextIsolation: true,
      });
      await app.evaluate(({ Menu }) =>
        Menu.getApplicationMenu().getMenuItemById('import-txt').click(),
      );
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
    });
    await check('Mac native backup preserves the study library', async () => {
      const backupPath = path.join(output, 'backup.json');
      await app.evaluate(({ session }, file) => {
        session.defaultSession.once('will-download', (_event, item) =>
          item.setSavePath(file),
        );
      }, backupPath);
      await page
        .getByRole('button', { name: 'Xuất sao lưu', exact: true })
        .click();
      await expect
        .poll(async () => {
          try {
            return JSON.parse(await readFile(backupPath, 'utf8')).decks.length;
          } catch {
            return 0;
          }
        })
        .toBe(1);
      expect(JSON.parse(await readFile(backupPath, 'utf8')).reviews).toEqual(
        completed.reviews,
      );
    });
    await check(
      'Mac native speech produces valid PCM audio and rejects invalid input',
      async () => {
        const result = await page.evaluate(() =>
          window.wordnestDesktop.speak('resilient'),
        );
        expect(result.ok, JSON.stringify(result)).toBe(true);
        const profile = await app.evaluate(({ app }) =>
          app.getPath('userData'),
        );
        const wave = await readFile(path.join(profile, 'speech-test.wav'));
        expect(wave.subarray(0, 4).toString()).toBe('RIFF');
        expect(wave.length).toBeGreaterThan(1000);
        expect(
          await page.evaluate(() =>
            window.wordnestDesktop.speak('x'.repeat(501)),
          ),
        ).toEqual({ ok: false, error: 'invalid-text' });
      },
    );
    await check(
      'Mac closing a window keeps the app available and Dock activation restores data',
      async () => {
        const closed = page.waitForEvent('close');
        await app.evaluate(({ BrowserWindow }) =>
          BrowserWindow.getAllWindows()[0].close(),
        );
        await closed;
        expect(
          await app.evaluate(
            ({ BrowserWindow }) => BrowserWindow.getAllWindows().length,
          ),
        ).toBe(0);
        const reopened = app.waitForEvent('window');
        await app.evaluate(({ app }) => app.emit('activate'));
        page = await reopened;
        await expect(
          page.getByRole('button', { name: 'Nhập file TXT', exact: true }),
        ).toBeVisible();
        expect(await stored()).toEqual(completed);
      },
    );
    await check(
      'Mac quit and cold relaunch preserve quiz and review progress',
      async () => {
        const executablePath = process.env.WORDNEST_EXECUTABLE;
        await app.close();
        app = undefined;
        app = await electron.launch({
          executablePath,
          args: ['--wordnest-smoke'],
          env: desktopEnv,
        });
        page = await app.firstWindow();
        await expect(
          page.getByRole('button', { name: 'Nhập file TXT', exact: true }),
        ).toBeVisible();
        expect(await stored()).toEqual(completed);
      },
    );
  }
  await featureJourney(page, check, snapshot);
  if (desktop) {
    await check(
      'new features survive desktop quit and cold relaunch',
      async () => {
        const saved = await stored();
        const executablePath = path.resolve(
          process.env.WORDNEST_EXECUTABLE ||
            'release/win-unpacked/WordNest.exe',
        );
        await app.close();
        app = undefined;
        app = await electron.launch({
          executablePath,
          args: ['--wordnest-smoke'],
          env: desktopEnv,
        });
        page = await app.firstWindow();
        await expect(
          page.getByRole('button', { name: 'Tạo bộ từ', exact: true }),
        ).toBeVisible();
        expect(await stored()).toEqual(saved);
        await expect(
          page.getByRole('button', { name: 'Chuyển sang giao diện tối' }),
        ).toBeVisible();
      },
    );
  }
  if (!desktop) {
    const corrupted = await browser.newContext();
    await corrupted.addInitScript(() =>
      localStorage.setItem('wordnest:v1', '{broken'),
    );
    const brokenPage = await corrupted.newPage();
    await brokenPage.goto(
      process.env.WORDNEST_WEB_URL || 'http://127.0.0.1:4173',
    );
    await check(
      'corrupt storage shows recovery guidance and preserves original bytes',
      async () => {
        await expect(
          brokenPage.getByText('Không đọc được dữ liệu đã lưu.', {
            exact: false,
          }),
        ).toBeVisible();
        expect(
          await brokenPage.evaluate(() => localStorage.getItem('wordnest:v1')),
        ).toBe('{broken');
      },
    );
    await corrupted.close();
    const denied = await browser.newContext();
    await denied.addInitScript(() => {
      Storage.prototype.setItem = () => {
        throw new DOMException('quota', 'QuotaExceededError');
      };
    });
    const deniedPage = await denied.newPage();
    await deniedPage.goto(
      process.env.WORDNEST_WEB_URL || 'http://127.0.0.1:4173',
    );
    await deniedPage
      .getByRole('button', { name: 'Nhập file TXT', exact: true })
      .click();
    const importDialog = deniedPage.getByRole('dialog');
    await importDialog.locator('input[type=file]').setInputFiles({
      name: 'WordNest demo.txt',
      mimeType: 'text/plain',
      buffer: fixture,
    });
    await importDialog.getByRole('button', { name: 'Tạo bộ học' }).click();
    await check('failed writes do not report a successful import', async () => {
      await expect(importDialog).toBeVisible();
      await expect(
        deniedPage.getByText('Chưa lưu thay đổi.', { exact: false }),
      ).toBeAttached();
      expect(
        await deniedPage.evaluate(() => localStorage.getItem('wordnest:v1')),
      ).toBeNull();
    });
    await deniedPage.keyboard.press('Escape');
    await check(
      'theme write failure is visible without blocking study',
      async () => {
        await deniedPage.locator('.theme-control button').click();
        await expect(
          deniedPage.locator('.theme-control [role=alert]'),
        ).toContainText('không lưu được tùy chọn');
        expect(
          await deniedPage.evaluate(() =>
            localStorage.getItem('wordnest:theme'),
          ),
        ).toBeNull();
      },
    );
    await check(
      'failed manual deck save keeps form contents and does not add a deck',
      async () => {
        await deniedPage
          .getByRole('button', { name: 'Tạo bộ từ', exact: true })
          .click();
        const editor = deniedPage.getByRole('dialog');
        await editor.getByLabel('Tên bộ từ', { exact: true }).fill('Unsaved');
        await editor.getByLabel('Từ 1', { exact: true }).fill('apple');
        await editor.getByLabel('Nghĩa 1', { exact: true }).fill('quả táo');
        await editor.getByRole('button', { name: 'Lưu bộ từ' }).click();
        await expect(editor.getByRole('alert')).toContainText(
          'Chưa lưu được bộ từ',
        );
        await expect(editor.getByLabel('Từ 1', { exact: true })).toHaveValue(
          'apple',
        );
        expect(
          await deniedPage.evaluate(() => localStorage.getItem('wordnest:v1')),
        ).toBeNull();
      },
    );
    await denied.close();
  }
  expect(errors).toEqual([]);
  await writeFile(
    path.join(output, 'result.json'),
    JSON.stringify(
      {
        verifiedAt: new Date().toISOString(),
        platform: desktop
          ? await app.evaluate(
              () => 'Electron ' + process.platform + ' ' + process.arch,
            )
          : browser.version(),
        fixture:
          'examples/wordnest-demo.txt (4 authored pairs; not learner data)',
        checks,
        errors,
        readyMs: Math.round(readyMs),
        elapsedMs: Math.round(performance.now() - started),
        score: { correct: 3, total: 4 },
        intervalsDays: { resilient: 2, curious: 1 / 1440 },
      },
      null,
      2,
    ),
  );
  console.log('PASS journey:', output);
} finally {
  if (app) await app.close();
  if (browser) await browser.close();
}
