# Wyre

Wyre is the complete MangoDisk Tauri desktop application, rebranded for bxane and extended with on-demand network measurement plus reviewed Windows and GNOME mouse controls. The full Vue frontend and Rust application source lives in [`app/`](app/); the unmodified MangoDisk snapshot remains in [`vendor/upstream/MangoDisk/`](vendor/upstream/MangoDisk/) for attribution and comparison.

## Included tools

- MangoDisk's full storage analysis, cleanup, privacy, startup, application management, system optimization, maintenance, and history workflows.
- An on-demand latency, jitter, download, and upload check through Cloudflare. Each run transfers about 16 MB; Cloudflare can see your public IP address. Nothing runs in the background.
- Windows pointer speed and acceleration controls, plus GNOME Linux controls. Changes require review and can be undone once.
- Windows NSIS and Linux AppImage and Debian installers from the GitHub Release workflow.

## Run and build

Use Node.js 22+, pnpm 11.13.1, Rust stable, and the native Tauri prerequisites for your OS.

```sh
cd app
corepack pnpm install --frozen-lockfile
corepack pnpm tauri:dev
```

Build the installer on its target OS:

```sh
corepack pnpm tauri:build
```

Tag a version such as `v0.4.0` to build and publish signed Windows and Linux installers with `CHANGELOG.md` as the release notes. The workflow always creates SHA-256 checksums. Configure `WYRE_WINDOWS_PFX` (base64-encoded PFX) and `WYRE_WINDOWS_PFX_PASSWORD` Actions secrets for bxane Authenticode signing, and `WYRE_GPG_PRIVATE_KEY` (ASCII-armored private key), `WYRE_GPG_PASSPHRASE`, and `WYRE_GPG_KEY_ID` for bxane GPG signatures on Linux packages. Publishing stops if a platform signing key is missing.

## Source and license

Wyre is a GPL-3.0-only derivative of MangoDisk 1.1.9, pinned at commit `f7d8bc73b68ec2170ac4ba451c6723b11329380c`. MangoDisk copyright and license notices remain in the copied app and the upstream snapshot. Other preserved upstream snapshots retain their own licenses; see [`UPSTREAMS.md`](UPSTREAMS.md).
