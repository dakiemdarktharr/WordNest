import os from 'node:os';
import path from 'node:path';
import { readFile, readdir, writeFile, mkdir, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { parseTxt, schedule, emptyReview } from '../lib/learning.ts';
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const runs = 25;
function bench(fn) {
  for (let i = 0; i < 5; i++) fn();
  const values = [];
  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    fn();
    values.push(performance.now() - start);
  }
  values.sort((a, b) => a - b);
  return {
    runs,
    warmupRuns: 5,
    p50Ms: Number(values[Math.floor(values.length * 0.5)].toFixed(3)),
    p95Ms: Number(values[Math.ceil(values.length * 0.95) - 1].toFixed(3)),
  };
}
const parser = [];
for (const count of [10, 100, 1000]) {
  const raw = Array.from(
    { length: count },
    (_, i) => `word${i} :: nghĩa số ${i}`,
  ).join('\n');
  parser.push({
    pairs: count,
    inputBytes: Buffer.byteLength(raw),
    ...bench(() => {
      const parsed = parseTxt(raw);
      if (parsed.errors.length || parsed.questions.length !== count)
        throw new Error('Invalid benchmark fixture');
    }),
  });
}
const reviews = Array.from({ length: 1000 }, () => emptyReview());
const scheduling = {
  reviews: 1000,
  ...bench(() => reviews.map((r) => schedule(r, 2, 1800000000000))),
};
const assets = [];
for (const name of (await readdir('dist/assets'))
  .filter((n) => /\.(js|css)$/.test(n))
  .sort()) {
  const bytes = await readFile(path.join('dist/assets', name));
  assets.push({ name, bytes: bytes.length, gzipBytes: gzipSync(bytes).length });
}
const installer = path.join('release', `WordNest-Setup-${pkg.version}-x64.exe`);
const executable = await readFile(installer);
const trackedInputs = [
  'lib/learning.ts',
  'lib/storage.ts',
  'components/quiz-session.tsx',
  'components/learning-environment.tsx',
  'package-lock.json',
];
const sourceHash = createHash('sha256');
for (const file of trackedInputs)
  sourceHash.update(file).update(await readFile(file));
const report = {
  measuredAt: new Date().toISOString(),
  version: pkg.version,
  environment: {
    os: os.platform(),
    release: os.release(),
    arch: os.arch(),
    cpu: os.cpus()[0].model,
    node: process.version,
  },
  method:
    'Single-process local synthetic microbenchmark; 5 warm-ups then 25 timed runs. Input generation excluded. No learner or retention data.',
  sourceInputs: trackedInputs,
  sourceSha256: sourceHash.digest('hex'),
  parser,
  scheduling,
  assets,
  installer: {
    path: installer,
    bytes: (await stat(installer)).size,
    sha256: createHash('sha256').update(executable).digest('hex'),
  },
};
await mkdir('docs/evidence', { recursive: true });
await writeFile(
  'docs/evidence/metrics.json',
  JSON.stringify(report, null, 2) + '\n',
);
console.log(JSON.stringify(report, null, 2));
