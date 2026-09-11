# TXT format

Save as UTF-8 (BOM optional), using one format per file. LF and Windows CRLF are accepted. In WordNest, choose **Nhập file TXT**, review validation, then **Tạo bộ học**.

## Vocabulary pairs

```text
resilient :: kiên cường
curious :: tò mò
thoughtful :: chu đáo
consistent :: nhất quán
```

Each non-empty line is `term :: meaning`. WordNest takes distractors from the other meanings in that deck; a multiple-choice quiz needs at least two distinct meanings. Flashcards and writing practice can still use a smaller set.

## Teacher-authored questions

```text
1. câu hỏi 1? [1] A [2] B [3*] C [4] D

2. curious
[1] buồn ngủ
[2*] tò mò
[3] lo lắng
[4] tức giận
Giải thích: Stay curious and keep learning.
```

The first question has four choices, with **C** correct. Literal `[3\*]` is accepted as well. Multiple stars mean all and only the correct options must be selected. A new question begins with a number followed by `.` or `)` at the start of a line. Numbered choices may span lines. `Giải thích:` or `Explanation:` after the choices adds optional explanatory text.

Limits: 1,000,000 UTF-8 bytes per TXT, 1,000 questions per deck, 2–10 choices per numbered question. Empty content/choices, missing correct-answer marks, duplicate choice/question numbers, malformed marks and invalid UTF-8 are rejected. Errors identify the line to fix; do not mix pair and numbered formats.

Use `(1)` rather than a new `1.` at the start of explanatory text to avoid starting a new question. `[number]` syntax is reserved for choices. The file is text, not executable HTML. Edit vocabulary in your text editor and re-import; importing identical source content reuses the existing deck to retain progress.
