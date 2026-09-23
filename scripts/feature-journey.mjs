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
  await page.getByText('Tùy chọn lượt học', { exact: true }).click();
  await page.getByRole('switch', { name: 'Trộn thứ tự câu hỏi' }).uncheck();
  await page
    .getByRole('button', { name: 'Bắt đầu luyện tập', exact: true })
    .click();
  async function answer(text) {
    await page
      .locator('.answer-option button')
      .filter({ has: page.getByText(text, { exact: true }) })
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
    'practice advances after mistakes, repeats wrong questions later and requires 100% completion',
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
      await expect(
        page.getByRole('button', { name: 'Câu trước', exact: true }),
      ).not.toBeVisible();
      await page
        .getByRole('button', { name: 'Câu tiếp theo', exact: true })
        .click();
      await expect(page.locator('.quiz-prompt')).toHaveText('pear');
      await answer('quả lê');
      await page
        .getByRole('button', { name: 'Câu tiếp theo', exact: true })
        .click();
      await expect(page.locator('.quiz-prompt')).toHaveText('grape');
      await answer('quả nho');
      await expect(
        page.getByRole('button', { name: 'Hoàn thành lượt học', exact: true }),
      ).not.toBeVisible();
      await page
        .getByRole('button', { name: 'Câu tiếp theo', exact: true })
        .click();
      await expect(page.locator('.quiz-prompt')).toHaveText('apple');
      await answer('quả nho');
      await expect(
        page.getByRole('button', { name: 'Câu tiếp theo', exact: true }),
      ).not.toBeVisible();
      await resume();
      await expect(page.locator('.quiz-prompt')).toHaveText('apple');
      await expect(page.locator('.feedback')).toContainText('Đáp án: quả táo');
      await expect(
        page.getByRole('button', { name: 'Hoàn thành lượt học', exact: true }),
      ).not.toBeVisible();
      await page
        .getByRole('button', { name: 'Thử lại câu này', exact: true })
        .click();
      await expect(page.locator('.feedback')).not.toBeVisible();
      await answer('quả táo');
      expect(
        await page
          .locator('.answer-option.correct')
          .evaluate((el) => getComputedStyle(el).backgroundColor),
      ).toBe('rgb(25, 62, 52)');
      await snapshot('07-practice-dark');
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
  await check(
    'writing repeats mistakes after other questions and cannot finish early, including after reload',
    async () => {
      await page
        .locator('.deck-card')
        .filter({ hasText: 'Fruits manual' })
        .click();
      await page
        .getByRole('combobox', { name: 'Cách học', exact: true })
        .click();
      await page
        .getByRole('option', { name: 'Luyện gõ · nhớ và viết lại từ' })
        .click();
      await page.getByText('Tùy chọn lượt học', { exact: true }).click();
      await page.getByRole('switch', { name: 'Trộn thứ tự câu hỏi' }).uncheck();
      await page
        .getByRole('button', { name: 'Bắt đầu luyện gõ', exact: true })
        .click();
      for (const [i, word] of [
        'wrong',
        'pear',
        'wrong',
        'apple',
        'grape',
      ].entries()) {
        expect((await stored()).sessions[0].index).toBe([0, 1, 2, 0, 2][i]);
        await page
          .getByRole('textbox', { name: 'Câu trả lời', exact: true })
          .fill(word);
        await page
          .getByRole('button', { name: 'Kiểm tra đáp án', exact: true })
          .click();
        if (i === 0) await resume();
        if (i < 4) {
          await expect(
            page.getByRole('button', {
              name: 'Hoàn thành lượt học',
              exact: true,
            }),
          ).not.toBeVisible();
          expect((await stored()).sessions[0].finishedAt).toBeNull();
        }
        await page
          .getByRole('button', {
            name: i === 4 ? 'Hoàn thành lượt học' : 'Câu tiếp theo',
            exact: true,
          })
          .click();
      }
      const done = await stored();
      expect(done.sessions[0].mastery.attempts).toBe(5);
      expect(
        Object.values(done.sessions[0].answers).filter((a) => a.correct),
      ).toHaveLength(1);
      expect(done.sessions[0].finishedAt).not.toBeNull();
    },
  );
  await check(
    'multiple-choice retry requires the exact answer set; failed save cannot unlock the next question',
    async () => {
      await page.locator('button.brand').click();
      await page
        .getByRole('button', { name: 'Nhập file TXT', exact: true })
        .click();
      const importer = page.getByRole('dialog');
      await importer.locator('input[type=file]').setInputFiles({
        name: 'Multiple answers.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from(
          '1. Pick two fruits [1*] apple [2*] pear [3] chair',
        ),
      });
      await importer.getByRole('button', { name: 'Tạo bộ học' }).click();
      await page
        .getByRole('button', { name: 'Bắt đầu luyện tập', exact: true })
        .click();
      await page.getByRole('checkbox', { name: 'apple', exact: true }).check();
      await page
        .getByRole('button', { name: 'Kiểm tra đáp án', exact: true })
        .click();
      await expect(page.locator('.feedback')).toContainText('Chưa đúng');
      await expect(
        page.getByRole('button', { name: 'Hoàn thành lượt học', exact: true }),
      ).not.toBeVisible();
      await page
        .getByRole('button', { name: 'Thử lại câu này', exact: true })
        .click();
      const before = await stored();
      await page.getByRole('checkbox', { name: 'apple', exact: true }).check();
      await page.getByRole('checkbox', { name: 'pear', exact: true }).check();
      await page.evaluate(() => {
        window.wordnestStorageDescriptor = Object.getOwnPropertyDescriptor(
          Storage.prototype,
          'setItem',
        );
        Storage.prototype.setItem = () => {
          throw new DOMException('quota', 'QuotaExceededError');
        };
      });
      try {
        await page
          .getByRole('button', { name: 'Kiểm tra đáp án', exact: true })
          .click();
        await expect(
          page.getByText('Chưa lưu thay đổi.', { exact: false }),
        ).toBeVisible();
        await expect(
          page.getByRole('button', {
            name: 'Hoàn thành lượt học',
            exact: true,
          }),
        ).not.toBeVisible();
        expect(await stored()).toEqual(before);
      } finally {
        await page.evaluate(() => {
          Object.defineProperty(
            Storage.prototype,
            'setItem',
            window.wordnestStorageDescriptor,
          );
          delete window.wordnestStorageDescriptor;
        });
      }
      await page
        .getByRole('button', { name: 'Kiểm tra đáp án', exact: true })
        .click();
      await page
        .getByRole('button', { name: 'Hoàn thành lượt học', exact: true })
        .click();
      expect((await stored()).sessions[0].finishedAt).not.toBeNull();
      expect((await stored()).sessions[0].mastery.attempts).toBe(2);
    },
  );
  await check(
    'visible word-count choice rejects invalid counts and practices exactly the chosen subset until all correct',
    async () => {
      await page.locator('button.brand').click();
      await page
        .locator('.deck-card')
        .filter({ hasText: 'Fruits manual' })
        .click();
      const count = page.getByRole('spinbutton', {
        name: 'Số từ muốn luyện',
        exact: true,
      });
      const start = page.getByRole('button', {
        name: 'Bắt đầu luyện tập',
        exact: true,
      });
      await expect(count).toBeVisible();
      await expect(page.locator('.practice-options')).not.toHaveAttribute(
        'open',
        '',
      );
      for (const invalid of ['', '0', '-1', '1.5', '4']) {
        await count.fill(invalid);
        await expect(start).toBeDisabled();
      }
      await count.fill('2');
      await expect(start).toBeEnabled();
      await snapshot('08-study-count');
      const before = await stored();
      await start.click();
      const selected = (await stored()).sessions[0];
      expect(selected.questions).toHaveLength(2);
      const first = selected.questions[0];
      await answer(first.choices.find((c) => !c.correct).text);
      await page
        .getByRole('button', { name: 'Câu tiếp theo', exact: true })
        .click();
      await expect(page.locator('.quiz-prompt')).toHaveText(
        selected.questions[1].prompt,
      );
      await answer(selected.questions[1].choices.find((c) => c.correct).text);
      await expect(
        page.getByRole('button', { name: 'Hoàn thành lượt học', exact: true }),
      ).not.toBeVisible();
      await page
        .getByRole('button', { name: 'Câu tiếp theo', exact: true })
        .click();
      await expect(page.locator('.quiz-prompt')).toHaveText(first.prompt);
      await answer(first.choices.find((c) => c.correct).text);
      await page
        .getByRole('button', { name: 'Hoàn thành lượt học', exact: true })
        .click();
      await expect(
        page.getByText('Đã luyện đúng 2 / 2 câu (100%).', { exact: true }),
      ).toBeVisible();
      const done = await stored();
      expect(done.sessions[0].mastery.attempts).toBe(3);
      const deck = done.decks.find((d) => d.id === selected.deckId);
      const excluded = deck.questions.find(
        (q) => !selected.questions.some((s) => s.id === q.id),
      );
      expect(done.reviews[deck.id + ':' + excluded.id]).toEqual(
        before.reviews[deck.id + ':' + excluded.id],
      );
    },
  );
}
