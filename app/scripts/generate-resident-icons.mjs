/**
 * Derive compact system-surface icons from the approved public vector artwork.
 * Run with `node scripts/generate-resident-icons.mjs`; Tauri supplies the rasterizer
 * and ICO encoder, so icon maintenance needs no extra image-tool dependency.
 */
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = readFileSync(join(root, 'public/wyre-icon.svg'), 'utf8');
if (!source.includes('id="wyre-mark"')) {
  throw new Error('The Wyre mark changed; review the tray icon source before regenerating.');
}
const template = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="58 50 140 132"><path d="M128 108V82M111 138 85 153M145 138l26 15" fill="none" stroke="black" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><circle cx="128" cy="69" r="10" fill="black"/><circle cx="77" cy="158" r="10" fill="black"/><circle cx="179" cy="158" r="10" fill="black"/><circle cx="128" cy="128" r="20" fill="none" stroke="black" stroke-width="8"/><circle cx="128" cy="128" r="5" fill="black"/></svg>`;
const temporary = mkdtempSync(join(tmpdir(), 'wyre-icons-'));
const output = join(root, 'src-tauri/icons');
const cli = join(root, 'node_modules/@tauri-apps/cli/tauri.js');
function generate(input, directory, sizes = []) {
  execFileSync(
    process.execPath,
    [cli, 'icon', input, '--output', directory, ...sizes.flatMap(size => ['--png', String(size)])],
    {
      cwd: root,
      stdio: 'inherit',
    }
  );
}
try {
  const colorSource = join(temporary, 'color.svg');
  const templateSource = join(temporary, 'template.svg');
  writeFileSync(colorSource, source);
  writeFileSync(templateSource, template);
  generate(templateSource, join(temporary, 'template'), [36]);
  generate(colorSource, join(temporary, 'color'), [64]);
  generate(colorSource, join(temporary, 'application'));
  copyFileSync(join(temporary, 'template/36x36.png'), join(output, 'tray-template.png'));
  copyFileSync(join(temporary, 'color/64x64.png'), join(output, 'tray-color.png'));
  mkdirSync(join(output, 'windows'), { recursive: true });
  // Tauri embeds the first ICO entry as the live window icon. Put the largest
  // raster first to avoid enlarging 32 px pixels on high-DPI taskbars. Windows
  // still selects the appropriate size from the full executable icon directory.
  const ico = readFileSync(join(temporary, 'application/icon.ico'));
  const count = ico.readUInt16LE(4);
  const entries = Array.from({ length: count }, (_, index) => ico.subarray(6 + index * 16, 22 + index * 16));
  entries.sort((left, right) => (right[0] || 256) - (left[0] || 256));
  writeFileSync(
    join(output, 'windows/icon.ico'),
    Buffer.concat([ico.subarray(0, 6), ...entries, ico.subarray(6 + count * 16)])
  );
  console.log('Generated Wyre tray and Windows application icons.');
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
