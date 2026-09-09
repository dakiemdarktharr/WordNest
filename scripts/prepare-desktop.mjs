import { mkdir, cp, readFile, writeFile, rm, lstat } from 'node:fs/promises';
import path from 'node:path';
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const staging = path.resolve('desktop-app');
await mkdir(staging, { recursive: true });
// Clean only these generated staging folders, never a source or user-data folder.
for (const name of ['dist', 'desktop']) {
  const target = path.resolve(staging, name);
  if (
    path.dirname(target) !== staging ||
    (await lstat(staging)).isSymbolicLink()
  )
    throw new Error('Unsafe staging path');
  const info = await lstat(target).catch(() => null);
  if (info?.isSymbolicLink()) throw new Error('Refusing linked staging folder');
  await rm(target, { recursive: true, force: true });
}
await cp('dist', path.join(staging, 'dist'), { recursive: true });
await cp('desktop', path.join(staging, 'desktop'), { recursive: true });
await writeFile(
  path.join(staging, 'package.json'),
  JSON.stringify(
    {
      name: pkg.name,
      productName: 'WordNest',
      version: pkg.version,
      description: pkg.description,
      author: pkg.author,
      type: 'module',
      main: 'desktop/main.mjs',
    },
    null,
    2,
  ),
);
console.log('Prepared self-contained desktop bundle.');
