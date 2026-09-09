import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { resolveAsset, contentType } from '../desktop/security.mjs';
const root = path.resolve('dist');
void test('Desktop protocol serves bundled index and assets', () => {
  assert.equal(
    resolveAsset('wordnest://app/', root),
    path.join(root, 'index.html'),
  );
  assert.equal(
    resolveAsset('wordnest://app/assets/main.js', root),
    path.join(root, 'assets/main.js'),
  );
  assert.equal(contentType('main.js'), 'text/javascript;charset=utf-8');
});
void test('Desktop protocol rejects foreign origins and encoded traversal', () => {
  for (const url of [
    'https://app/index.html',
    'wordnest://other/index.html',
    'wordnest://user@app/',
    'wordnest://app:123/',
    'wordnest://app/%2e%2e%2fsecret',
    'wordnest://app/%5c..%5csecret',
    'wordnest://app/%00',
    'wordnest://app/%GG',
  ])
    assert.equal(resolveAsset(url, root), null, url);
});
