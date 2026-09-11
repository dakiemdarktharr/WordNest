import { spawn } from 'node:child_process';
import path from 'node:path';
// Only this fixed script is code. User text travels separately as JSON on stdin.
const script = `
$ErrorActionPreference = 'Stop'
[Console]::InputEncoding = New-Object System.Text.UTF8Encoding
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding
try {
  $payload = [Console]::In.ReadToEnd() | ConvertFrom-Json
  Add-Type -AssemblyName System.Speech
  $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
  try {
    $voice = $synth.GetInstalledVoices() | Where-Object { $_.Enabled -and $_.VoiceInfo.Culture.Name -like 'en-*' } | Select-Object -First 1
    if (-not $voice) { [Console]::Out.Write('{"ok":false,"error":"no-voice"}'); exit 0 }
    $synth.SelectVoice($voice.VoiceInfo.Name)
    $synth.Rate = -2
    if ($payload.waveFile) { $synth.SetOutputToWaveFile($payload.waveFile) }
    else { $synth.SetOutputToDefaultAudioDevice() }
    $synth.Speak([string]$payload.text)
    [Console]::Out.Write((@{ ok = $true; voice = $voice.VoiceInfo.Name } | ConvertTo-Json -Compress))
  } finally { $synth.Dispose() }
} catch { [Console]::Out.Write('{"ok":false,"error":"unavailable"}'); exit 1 }
`;
let active;
export function stopSpeech() {
  if (active) {
    active.cancelled = true;
    active.child.kill();
    active = undefined;
  }
}
// Text is sent on stdin: vocabulary never becomes shell code or command options.
export function speechRequest(text, waveFile, platform = process.platform) {
  if (platform === 'darwin')
    return {
      executable: '/usr/bin/say',
      args: [
        '-v',
        'Samantha',
        '-r',
        '170',
        '-f',
        '-',
        ...(waveFile
          ? ['-o', waveFile, '--file-format=WAVE', '--data-format=LEI16@22050']
          : []),
      ],
      input: text,
    };
  if (platform !== 'win32') return null;
  return {
    executable: path.join(
      process.env.SystemRoot || 'C:\\Windows',
      'System32',
      'WindowsPowerShell',
      'v1.0',
      'powershell.exe',
    ),
    args: ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', script],
    input: JSON.stringify({ text, ...(waveFile ? { waveFile } : {}) }),
  };
}
export function speakText(text, waveFile) {
  if (typeof text !== 'string' || !text.trim() || text.length > 500)
    return Promise.resolve({ ok: false, error: 'invalid-text' });
  const request = speechRequest(text, waveFile);
  if (!request)
    return Promise.resolve({ ok: false, error: 'unsupported-platform' });
  stopSpeech();
  return new Promise((resolve) => {
    const child = spawn(request.executable, request.args, {
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    const current = { child, cancelled: false };
    active = current;
    let output = '';
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (active === current) active = undefined;
      resolve(result);
    };
    const timer = setTimeout(() => {
      child.kill();
      finish({ ok: false, error: 'timeout' });
    }, 60000);
    child.stdout.on('data', (chunk) => {
      if (output.length < 4096) output += chunk.toString('utf8');
    });
    child.on('error', () => finish({ ok: false, error: 'unavailable' }));
    child.stdin.on('error', () => finish({ ok: false, error: 'unavailable' }));
    child.on('close', (code) => {
      if (current.cancelled) return finish({ ok: true, cancelled: true });
      if (process.platform === 'darwin')
        return finish(
          code === 0
            ? { ok: true, voice: 'Samantha' }
            : { ok: false, error: 'unavailable' },
        );
      try {
        finish(JSON.parse(output.replace(/^\uFEFF/, '').trim()));
      } catch {
        finish({ ok: false, error: 'unavailable' });
      }
    });
    child.stdin.end(request.input, 'utf8');
  });
}
