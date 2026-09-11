import { expect } from '@playwright/test';

/** Runs against the bundled renderer on both OSes, as well as production web. */
export async function featureJourney(page, check, snapshot) {
  const stored = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem('wordnest:v1')));
  await page.locator('button.brand').click();
  await check(
    'light/dark theme applies to app and dialogs and survives reload',
    async () => {
      if (
        await page
          .locator('html')
          .evaluate((el) => el.classList.contains('dark'))
      )
        await page
          .getByRole('button', { name: 'Chuyển sang giao diện sáng' })
          .click();
      const light = await page
        .locator('body')
        .evaluate((el) => getComputedStyle(el).backgroundColor);
      await page
        .getByRole('button', { name: 'Chuyển sang giao diện tối' })
        .click();
      await expect(page.locator('html')).toHaveClass(/dark/);
      expect(
        await page
          .locator('body')
          .evaluate((el) => getComputedStyle(el).backgroundColor),
      ).not.toBe(light);
      await page.reload();
      await expect(
        page.getByRole('button', { name: 'Chuyển sang giao diện sáng' }),
      ).toBeVisible();
      await page
        .getByRole('button', { name: 'Tạo bộ từ', exact: true })
        .click();
      expect(
        await page
          .getByRole('dialog')
          .evaluate((el) => getComputedStyle(el).backgroundColor),
      ).toBe('rgb(28, 38, 56)');
    },
  );
  const dialog = page.getByRole('dialog');
  await check(
    'create vocabulary manually validates rows and persists an additional deck',
    async () => {
      await dialog
        .getByLabel('Tên bộ từ', { exact: true })
        .fill('Fruits manual');
      await dialog.getByRole('button', { name: 'Lưu bộ từ' }).click();
      await expect(dialog.getByRole('alert')).toContainText(
        'nhập cả từ và nghĩa',
      );
      const rows = [
        ['apple', 'quả táo'],
        ['pear', 'quả lê'],
        ['grape', 'quả nho'],
      ];
      for (let i = 0; i < rows.length; i++) {
        if (i)
          await dialog
            .getByRole('button', { name: 'Thêm từ', exact: true })
            .click();
        await dialog
          .getByLabel('Từ ' + (i + 1), { exact: true })
          .fill(rows[i][0]);
        await dialog
          .getByLabel('Nghĩa ' + (i + 1), { exact: true })
          .fill(rows[i][1]);
      }
      await snapshot('06-create-dark');
      await dialog.getByRole('button', { name: 'Lưu bộ từ' }).click();
      await expect(dialog).not.toBeVisible();
      const data = await stored();
      expect(data.decks).toHaveLength(2);
      expect(data.decks[0].source).toBe(
        'apple :: quả táo\npear :: quả lê\ngrape :: quả nho',
      );
      await page.getByRole('button', { name: /Flashcard/ }).click();
      await page.getByRole('button', { name: 'Lật để xem đáp án' }).click();
      await expect(page.locator('.flash-word')).toHaveText('quả táo');
      await page
        .getByRole('button', { name: 'Fruits manual', exact: true })
        .click();
    },
  );
  await page.getByRole('combobox', { name: 'Cách học', exact: true }).click();
  await page
    .getByRole('option', { name: 'Học đến khi đúng · lặp lại câu sai' })
    .click();
  await page.getByRole('switch', { name: 'Trộn thứ tự câu hỏi' }).uncheck();
  await page
    .getByRole('button', { name: 'Bắt đầu học đến khi đúng', exact: true })
    .click();
  async function answer(text) {
    await page
      .locator('.answer-option button')
      .filter({ has: page.getByText(text, { exact: true }) })
      .click();
    await page
      .getByRole('button', { name: 'Kiểm tra đáp án', exact: true })
      .click();
  }
  async function resume() {
    await page.reload();
    await page
      .locator('.deck-card')
      .filter({ hasText: 'Fruits manual' })
      .click();
    await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  }
  await check(
    'mastery shows each answer, persists feedback and repeats only wrong questions',
    async () => {
      await answer('quả lê');
      await expect(page.locator('.feedback')).toContainText('Đáp án: quả táo');
      expect(
        await page
          .locator('.answer-option.incorrect')
          .evaluate((el) => getComputedStyle(el).backgroundColor),
      ).toBe('rgb(72, 41, 56)');
      const pending = await stored();
      await resume();
      expect(await stored()).toEqual(pending);
      await expect(page.locator('.feedback')).toContainText('Đáp án: quả táo');
      await page.getByRole('button', { name: 'Tiếp tục luyện' }).click();
      await expect(page.locator('.quiz-prompt')).toHaveText('pear');
      await answer('quả lê');
      await page.getByRole('button', { name: 'Tiếp tục luyện' }).click();
      await expect(page.locator('.quiz-prompt')).toHaveText('grape');
      await answer('quả nho');
      await page.getByRole('button', { name: 'Tiếp tục luyện' }).click();
      await expect(page.locator('.quiz-prompt')).toHaveText('apple');
      await answer('quả nho');
      await page.getByRole('button', { name: 'Tiếp tục luyện' }).click();
      await expect(page.locator('.feedback')).not.toBeVisible();
      await resume();
      await expect(page.locator('.quiz-prompt')).toHaveText('apple');
      await expect(page.locator('.feedback')).not.toBeVisible();
      await answer('quả táo');
      expect(
        await page
          .locator('.answer-option.correct')
          .evaluate((el) => getComputedStyle(el).backgroundColor),
      ).toBe('rgb(25, 62, 52)');
      await snapshot('07-mastery-dark');
      await page
        .getByRole('button', { name: 'Hoàn thành lượt học', exact: true })
        .click();
      await expect(
        page.getByRole('heading', {
          name: 'Bạn đã chọn đúng toàn bộ bộ câu hỏi!',
        }),
      ).toBeVisible();
      await expect(
        page.getByText('Điểm lần đầu · 5 lượt trả lời để hoàn thành'),
      ).toBeVisible();
      const done = await stored();
      expect(done.sessions[0].mastery.queue).toEqual([]);
      expect(done.sessions[0].mastery.attempts).toBe(5);
      expect(
        Object.values(done.sessions[0].answers).filter((a) => a.correct),
      ).toHaveLength(2);
      expect(done.reviews[done.decks[0].id + ':q1'].wrong).toBe(1);
      expect(done.reviews[done.decks[0].id + ':q1'].interval).toBe(1 / 1440);
      expect(done.reviews[done.decks[0].id + ':q2'].interval).toBe(1);
      await page
        .getByRole('button', { name: 'Chuyển sang giao diện sáng' })
        .click();
      await page.reload();
      await expect(
        page.getByRole('button', { name: 'Chuyển sang giao diện tối' }),
      ).toBeVisible();
      expect(await stored()).toEqual(done);
    },
  );
}
