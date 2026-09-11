# WordNest 0.2.1 — acceptance record

Verified locally on 2026-09-11. The working tree was clean before this pass; the existing React/Vite/Electron app and data format were retained.

## Scope completed

- Original WordNest product branding in UI, package metadata, README and real demo screenshots.
- A complete import → flashcard → quiz → spaced-repetition update journey. The new `completeSession` operation grades submitted answers and applies the existing scheduler exactly once.
- Clear desktop/web offline boundaries and visible failure states. No AI model or content-generation feature was added or claimed.
- 10 additional regression tests for TXT size boundaries, review intervals/caps, scoring, idempotence and persistence failures.

## Results

| Check | Result | Evidence |
| --- | --- | --- |
| `npm test` | 30 passed | `tests/learning.test.ts`, `tests/workflow.test.ts` |
| `npm run test:security` | 2 passed | `tests/desktop-security.test.mjs` |
| `npm run lint` | Passed | Oxlint application and scripts |
| `npm run build` | Passed | TypeScript and Vite production build |
| `npm run test:journey` | 9 assertion groups passed | [Web result](evidence/web-journey.json) |
| `npm run test:journey -- --desktop` | 7 assertion groups passed | [Electron result](evidence/desktop-journey.json) |
| `npm run desktop:dist` | Windows x64 NSIS installer created | [Measured size/hash](evidence/metrics.json) |
| `./scripts/installer-smoke.ps1` | Installed app, both shortcuts, legacy and full journey checks, uninstall passed | [Installer result](evidence/installer.json) |

The installed-app speech test generated a 79,618-byte WAV with Microsoft David Desktop. This checks synthesis, not human-assessed pronunciation or playback through speakers. The web journey runs on installed Edge; CI is configured for Playwright Chromium. Screenshot states were visually inspected before inclusion in `docs/demo/`.

The scripted quiz deliberately scores 3/4. The previously reviewed first word advances from one day to two days; the incorrect second word is due one minute after submission. Reload preserves the completed session and exact due timestamps. The web checks also reject invalid UTF-8, block malformed input, surface corrupted saved JSON and verify that quota failures do not claim a successful import.

## Measurements and reproducibility

`npm run measure` records pure-function timings on generated 10/100/1,000-pair inputs, scheduling of 1,000 reviews, actual JS/CSS sizes, gzip sizes and the installer SHA-256. It records the machine and hashes of listed source inputs. These are local engineering measurements, not a learner dataset or educational-effectiveness study. See [metrics](evidence/metrics.json) and the README for the measurement method.

Automated journey output contains launch and elapsed times from a single run. These include test-tool/process overhead and screenshots; they are **not startup performance benchmarks**.

## Remaining limitations

- No validated retention/adoption data, generative AI, trained scheduler, or teacher analytics.
- Desktop supports offline cold starts through bundled assets; web supports an already loaded session only and has no service worker.
- Simple scheduling rules may expand an interval repeatedly within one day. Unanswered submitted questions count as incorrect; completed older sessions are not retroactively rescheduled.
- Storage is quota-limited and local to the device/origin. JSON backup is manual. No cloud sync or background reminders.
- Windows x64 installer is unsigned and manually updated. Other OS/architectures are not verified. The published 0.2.0 release predates this source update; a new release is not published in this pass.
- Windows speech may be unavailable or slow; an earlier CI run timed out and passed on rerun. Screen-reader, mobile and broad Windows configuration testing remain incomplete.
- Existing UI dependencies and Electron are retained rather than aggressively optimized.
