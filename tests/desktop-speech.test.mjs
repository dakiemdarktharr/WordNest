import test from 'node:test';
import assert from 'node:assert/strict';
import { speechRequest, speakText } from '../desktop/speech.mjs';

test('Mac speech treats shell-like vocabulary as stdin, never executable arguments', () => {
  const text = '--voice $(touch /tmp/wordnest-injection); "hello"';
  const request = speechRequest(text, '/tmp/WordNest test.wav', 'darwin');
  assert.equal(request.executable, '/usr/bin/say');
  assert.equal(request.input, text);
  assert.ok(!request.args.includes(text));
  assert.deepEqual(request.args.slice(0, 6), [
    '-v',
    'Samantha',
    '-r',
    '170',
    '-f',
    '-',
  ]);
  assert.ok(request.args.includes('/tmp/WordNest test.wav'));
});
test('Windows speech preserves JSON transport and Unicode', () => {
  const text = 'tò mò \n $(Get-Process)';
  const request = speechRequest(text, 'C:/sample.wav', 'win32');
  assert.match(request.executable, /powershell.exe$/);
  assert.deepEqual(JSON.parse(request.input), {
    text,
    waveFile: 'C:/sample.wav',
  });
  assert.ok(!request.args.includes(text));
});
test('invalid speech never starts a native process', async () => {
  for (const text of ['', '  ', 'x'.repeat(501), null, 123])
    assert.deepEqual(await speakText(text), {
      ok: false,
      error: 'invalid-text',
    });
});
test('unsupported platforms do not attempt a Windows command', () => {
  assert.equal(speechRequest('word', undefined, 'linux'), null);
});
