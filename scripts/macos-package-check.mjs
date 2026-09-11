import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
if (process.platform !== 'darwin')
  throw new Error('This check requires macOS.');
const version = JSON.parse(await readFile('package.json', 'utf8')).version;
const arch = process.arch;
const assets = path.resolve(process.env.WORDNEST_MAC_ASSETS || 'release');
const root = path.resolve('outputs', `mac-check-${arch}-${Date.now()}`);
await mkdir(root, { recursive: true });
const checks = [];
function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    timeout: 120000,
    ...options,
  });
  if (result.error || result.status !== 0)
    throw new Error(
      `${command} ${args.join(' ')}: ${result.error || result.stderr || result.stdout}`,
    );
  return (result.stdout || '') + (result.stderr || '');
}
function verify(bundle) {
  run('/usr/bin/codesign', [
    '--verify',
    '--deep',
    '--strict',
    '--verbose=2',
    bundle,
  ]);
  const signature = run('/usr/bin/codesign', [
    '--display',
    '--verbose=4',
    bundle,
  ]);
  assert.match(signature, /Signature=adhoc/);
  assert.match(signature, /runtime/);
  const entitlements = run('/usr/bin/codesign', [
    '--display',
    '--entitlements',
    ':-',
    bundle,
  ]);
  assert.match(entitlements, /com.apple.security.cs.allow-jit/);
  assert.match(
    entitlements,
    /com.apple.security.cs.disable-library-validation/,
  );
  const executable = path.join(bundle, 'Contents/MacOS/WordNest');
  const architectures = run('/usr/bin/lipo', ['-archs', executable]).trim();
  assert.equal(architectures, arch === 'arm64' ? 'arm64' : 'x86_64');
  const builtVersion = run('/usr/libexec/PlistBuddy', [
    '-c',
    'Print CFBundleShortVersionString',
    path.join(bundle, 'Contents/Info.plist'),
  ]).trim();
  assert.equal(builtVersion, version);
  return executable;
}
for (const format of ['dmg', 'zip']) {
  const name = `WordNest-${version}-${arch}.${format}`;
  const file = path.join(assets, name);
  const install = path.join(root, `Installed Apps ${format}`);
  const bundle = path.join(install, 'WordNest.app');
  await mkdir(install, { recursive: true });
  if (format === 'dmg') {
    run('/usr/bin/hdiutil', ['verify', file]);
    const mount = path.join(root, 'mounted-dmg');
    await mkdir(mount);
    run('/usr/bin/hdiutil', [
      'attach',
      file,
      '-readonly',
      '-nobrowse',
      '-mountpoint',
      mount,
    ]);
    try {
      run('/usr/bin/ditto', [path.join(mount, 'WordNest.app'), bundle]);
    } finally {
      run('/usr/bin/hdiutil', ['detach', mount]);
    }
  } else {
    run('/usr/bin/ditto', ['-x', '-k', file, install]);
  }
  const executable = verify(bundle);
  const evidence = path.join(root, `journey-${format}`);
  // Launch the final distributed bundle, after copying it to a path containing spaces.
  // This does not simulate the user approving an unnotarized app in Gatekeeper.
  run(process.execPath, ['scripts/journey-check.mjs', '--desktop'], {
    timeout: 240000,
    stdio: 'inherit',
    env: {
      ...process.env,
      WORDNEST_EXECUTABLE: executable,
      WORDNEST_EVIDENCE_DIR: evidence,
    },
  });
  // Running the app must not modify any signed bundle resource.
  verify(bundle);
  const journey = JSON.parse(
    await readFile(path.join(evidence, 'result.json'), 'utf8'),
  );
  checks.push({
    name,
    sha256: createHash('sha256')
      .update(await readFile(file))
      .digest('hex'),
    signature: 'valid ad-hoc with hardened runtime',
    nativeArch: arch,
    journey,
  });
  console.log('PASS distributed Mac package:', name);
}
await writeFile(
  path.join(root, 'result.json'),
  JSON.stringify(
    {
      verifiedAt: new Date().toISOString(),
      version,
      arch,
      checks,
      limitation:
        'Ad-hoc signature is valid, but Apple Developer ID/notarization and user Gatekeeper approval are not verified.',
    },
    null,
    2,
  ),
);
console.log('PASS Mac distribution checks:', root);
