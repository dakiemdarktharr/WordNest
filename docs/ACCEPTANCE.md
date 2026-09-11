# WordNest 0.3.0 acceptance — 2026-09-11

- Added manual vocabulary-deck creation, persistent light/dark themes, and a resumable retry-until-correct mode with first-attempt scoring/SRS.
- Commands: `npm test`, `npm run test:security`, `npm run lint`, `npm run build`, `npm run desktop:dist`, `./scripts/installer-smoke.ps1`, `npm run test:journey`; native Mac CI runs `npm run desktop:dist:mac -- --arm64` / `--x64` and `npm run test:mac` on freshly downloaded artifacts.
- Results: 43 unit/desktop tests; 14 web groups; 11 Windows groups plus installation, shortcuts, speech and uninstall; 16 groups in each of the four Mac DMG/ZIP packages. Source and artifact hashes are in [raw evidence](evidence/features-0.3.0.json).
- Release workflow: https://github.com/dakiemdarktharr/quizziz_clone/actions/runs/34607539199 (successful after one ARM64 verification retry). The first attempt sampled native window state before destruction completed; no assertion was removed. The follow-up test waits for `BrowserWindow.closed`. Shipped app code is unchanged by this test-only fix.
- Fixture evidence: a three-word manually created deck needed five answers to clear the queue; first-attempt score remained 2/3, and the initially wrong card retained a one-minute review. This is scripted validation, not learner-performance data.
- Limits: local storage capacity, manual updates, no in-place deck editor, no Apple notarization; tested on CI Windows and macOS 15 native architectures, not every OS/device. Backups containing the new mode require app 0.3.0 or newer.

---

# WordNest 0.2.3 — Mac repair verification

The 0.2.2 release skipped macOS code signing, and its CI only built packages. The user then reported "damaged and can't be opened". The release log explicitly contains "skipped macOS application code signing" for both architectures. Version 0.2.3 signs the complete bundle ad-hoc with hardened runtime, JIT and library-validation entitlements. It also replaces the Windows-only speech command on Mac and fixes native app menus and window activation.

Verified on macOS 15 Apple Silicon and Intel, with separate build and test runner machines:

- DMG integrity check, mount, copy WordNest.app to a directory containing spaces, eject, then launch.
- ZIP extraction and launch; exact architecture and app version checked.
- Deep/strict signature verification before and after app use; JIT/library entitlements verified.
- 12 journey assertion groups for each of the four packages: offline behavior, invalid UTF-8, malformed TXT, import, flashcard schedule, quiz scoring/schedule, reload, native menu/isolation, backup, native speech WAV, close/Dock activation, quit/cold restart.
- 30 logic tests and 6 desktop security/speech tests passed. Lint and production web build passed. Windows installer smoke checks passed on GitHub.

[Mac CI and raw evidence](evidence/macos-0.2.3.json) · [Mac workflow](https://github.com/dakiemdarktharr/quizziz_clone/actions/runs/34594420273) · [Windows regression](https://github.com/dakiemdarktharr/quizziz_clone/actions/runs/34594420311) · [Web validation](https://github.com/dakiemdarktharr/quizziz_clone/actions/runs/34594420500).

Release packages are rebuilt and run through the same checks before publication. The evidence above identifies the pre-release CI artifacts, not the final release hashes.

Limitations: ad-hoc signing is not Apple Developer ID signing or notarization. These tests do not simulate a user's Gatekeeper approval after a quarantined browser download, prove playback through physical speakers, or cover every macOS version/device. macOS can still request approval for an unverified developer. No Apple signing credentials were available in the repository. Install guidance distinguishes that warning from invalid/damaged code, without disabling system protections. A missing Samantha voice reports a visible speech error while study remains available.

The measurements and earlier snapshots below are historical 0.2.2 evidence, not current package benchmarks.

# Historical WordNest 0.2.2 acceptance record

Verified locally and in GitHub Actions on 2026-09-11. The existing React/Vite/Electron app and data format were retained while adding cross-platform desktop packaging.

## Scope completed

- Original WordNest product branding in UI, package metadata, README and real demo screenshots.
- A complete import → flashcard → quiz → spaced-repetition update journey. The `completeSession` operation grades submitted answers and applies the existing scheduler exactly once.
- Clear desktop/web offline boundaries and visible failure states. No AI model or content-generation feature was added or claimed.
- 10 additional regression tests for TXT size boundaries, review intervals/caps, scoring, idempotence and persistence failures.
- Electron Builder targets for Windows x64 and macOS Intel/Apple Silicon, with repeatable GitHub release automation.

## Results

| Check | Result | Evidence |
| --- | --- | --- |
| `npm test` | 30 passed | `tests/learning.test.ts`, `tests/workflow.test.ts` |
| `npm run test:security` | 2 passed | `tests/desktop-security.test.mjs` |
| `npm run lint` | Passed | Oxlint application and scripts |
| `npm run typecheck` | Passed | TypeScript compiler |
| `npm run build` | Passed | TypeScript and Vite production build |
| `npm run test:journey` | 9 assertion groups passed | [Web result](evidence/web-journey.json) |
| `npm run test:journey -- --desktop` | 7 assertion groups passed | [Electron result](evidence/desktop-journey.json) |
| `npm run desktop:dist` | Windows x64 NSIS installer created | [Measured size/hash](evidence/metrics.json) |
| `./scripts/installer-smoke.ps1` | Installed app, both shortcuts, journey checks and uninstall passed | [Installer result](evidence/installer.json) |
| GitHub macOS packaging | DMG and ZIP built for x64 and arm64 | [release workflow](https://github.com/dakiemdarktharr/quizziz_clone/actions/runs/34586749874) |
| GitHub Release `v0.2.2` | Windows EXE, macOS x64/arm64 DMG+ZIP, checksums and demo TXT published | [Release assets](https://github.com/dakiemdarktharr/quizziz_clone/releases/tag/v0.2.2) |

The installed-app speech test generated a 79,618-byte WAV with Microsoft David Desktop. This checks synthesis, not human-assessed pronunciation or playback through speakers. The web journey runs on installed Edge; CI is configured for Playwright Chromium. Screenshot states were visually inspected before inclusion in `docs/demo/`.

The scripted quiz deliberately scores 3/4. The previously reviewed first word advances from one day to two days; the incorrect second word is due one minute after submission. Reload preserves the completed session and exact due timestamps. The web checks also reject invalid UTF-8, block malformed input, surface corrupted saved JSON and verify that quota failures do not claim a successful import.

## Measurements and reproducibility

`npm run measure` records pure-function timings on generated 10/100/1,000-pair inputs, scheduling of 1,000 reviews, actual JS/CSS sizes, gzip sizes and the local Windows installer SHA-256. It records the machine and hashes of listed source inputs. These are local engineering measurements, not a learner dataset or educational-effectiveness study. See [metrics](evidence/metrics.json) and the README for the measurement method.

Automated journey output contains launch and elapsed times from a single run. These include test-tool/process overhead and screenshots; they are **not startup performance benchmarks**.

## Remaining limitations

- No validated retention/adoption data, generative AI, trained scheduler, or teacher analytics.
- Desktop supports offline cold starts through bundled assets; web supports an already loaded session only and has no service worker.
- Simple scheduling rules may expand an interval repeatedly within one day. Unanswered submitted questions count as incorrect; completed older sessions are not retroactively rescheduled.
- Storage is quota-limited and local to the device/origin. JSON backup is manual. No cloud sync or background reminders.
- Windows x64 and macOS x64/arm64 packages are unsigned and manually updated. Linux and Windows ARM64 are not verified. macOS package creation is verified by GitHub Actions, not by a physical Mac launch in this environment.
- Windows speech may be unavailable or slow; an earlier CI run timed out and passed on rerun. Screen-reader, mobile and broad OS configuration testing remain incomplete.
- Existing UI dependencies and Electron are retained rather than aggressively optimized.
