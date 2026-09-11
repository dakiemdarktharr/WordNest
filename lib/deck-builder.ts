import { MAX_QUESTIONS, parseTxt, type Deck } from './learning.ts';
export type VocabularyRow = { term: string; meaning: string };
export function createVocabularyDeck(
  title: string,
  rows: VocabularyRow[],
): Deck {
  if (!title.trim() || title.trim().length > 120)
    throw new Error('Tên bộ từ cần từ 1 đến 120 ký tự.');
  if (!rows.length || rows.length > MAX_QUESTIONS)
    throw new Error('Mỗi bộ cần từ 1 đến 1.000 từ.');
  const source = rows
    .map((row, index) => {
      const term = row.term.trim();
      const meaning = row.meaning.trim();
      if (!term || !meaning)
        throw new Error('Dòng ' + (index + 1) + ': hãy nhập cả từ và nghĩa.');
      if (
        [term, meaning].some((value) => /[\r\n]|::/.test(value)) ||
        /^\d+[.)]\s/.test(term)
      )
        throw new Error(
          'Dòng ' +
            (index + 1) +
            ': không dùng xuống dòng, dấu :: hoặc số thứ tự ở đầu từ.',
        );
      return term + ' :: ' + meaning;
    })
    .join('\n');
  const parsed = parseTxt(source);
  if (parsed.errors.length) throw new Error(parsed.errors[0].message);
  return {
    id: crypto.randomUUID(),
    title: title.trim(),
    source,
    questions: parsed.questions,
    createdAt: Date.now(),
  };
}
