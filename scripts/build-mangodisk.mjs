import { chmodSync, copyFileSync, mkdirSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const platform = process.platform;
if (platform !== 'win32' && platform !== 'linux') throw new Error(`MangoDisk sidecar builds do not support ${platform}.`);

const mangoDiskRoot = path.join(root, 'vendor', 'upstream', 'MangoDisk');
const tauriRoot = path.join(mangoDiskRoot, 'src-tauri');
const sidecars = path.join(root, 'build', 'sidecars');
const binary = platform === 'win32' ? 'MangoDisk.exe' : 'MangoDisk';
const built = path.join(mangoDiskRoot, 'target', 'release', platform === 'win32' ? 'mangodisk.exe' : 'mangodisk');
const result = spawnSync('cargo', ['build', '--locked', '--release', '--manifest-path', path.join(tauriRoot, 'Cargo.toml'), '-p', 'mangodisk-cli'], {
  cwd: tauriRoot,
  stdio: 'inherit',
  windowsHide: true
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

rmSync(sidecars, { recursive: true, force: true });
mkdirSync(sidecars, { recursive: true });
const output = path.join(sidecars, binary);
copyFileSync(built, output);
if (platform === 'linux') chmodSync(output, 0o755);
if (statSync(output).size === 0) throw new Error('MangoDisk produced an empty sidecar.');
console.log(`Built MangoDisk sidecar: ${output}`);
