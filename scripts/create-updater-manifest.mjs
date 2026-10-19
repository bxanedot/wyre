import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const tag = process.env.GITHUB_REF_NAME;
const repository = process.env.GITHUB_REPOSITORY;
if (!tag || !repository || !/^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(tag)) {
  throw new Error('Expected a semantic-version GITHUB_REF_NAME and GITHUB_REPOSITORY.');
}

const version = tag.replace(/^v/, '');
const appVersion = JSON.parse(readFileSync('app/package.json', 'utf8')).version;
const tauriVersion = JSON.parse(readFileSync('app/src-tauri/tauri.conf.json', 'utf8')).version;
if (version !== appVersion || version !== tauriVersion) {
  throw new Error(`Release tag ${version} must match app and Tauri versions (${appVersion}, ${tauriVersion}).`);
}

function platform(directory, extension) {
  const matches = readdirSync(directory).filter((name) => name.endsWith(extension));
  if (matches.length !== 1) throw new Error(`Expected exactly one ${extension} updater bundle in ${directory}.`);

  const name = matches[0];
  const signature = readFileSync(join(directory, `${name}.sig`), 'utf8').trim();
  if (!signature) throw new Error(`Missing updater signature for ${name}.`);

  return {
    url: `https://github.com/${repository}/releases/download/${encodeURIComponent(tag)}/${encodeURIComponent(name)}`,
    signature,
  };
}

const manifest = {
  version,
  notes: readFileSync('CHANGELOG.md', 'utf8').trim(),
  pub_date: new Date().toISOString(),
  platforms: {
    'windows-x86_64': platform('release/windows', '.exe'),
    'linux-x86_64': platform('release/linux', '.AppImage'),
  },
};

const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
const checked = JSON.parse(serialized);
if (!checked.notes || Object.values(checked.platforms).some(({ url, signature }) => !url || !signature)) {
  throw new Error('Updater manifest is incomplete.');
}
writeFileSync('release/latest.json', serialized);
