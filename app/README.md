# Wyre desktop application

This directory contains the full Tauri desktop app copied from MangoDisk 1.1.9 and adapted for Wyre. It retains MangoDisk's Vue interface and Rust product core. Wyre adds a user-started network speed measurement and Windows/GNOME pointer controls with review and one-step undo.

## Development

Requirements: Node.js 22+, pnpm 11.13.1, Rust stable, and the operating-system Tauri build dependencies.

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm tauri:dev
```

Create a Windows NSIS installer on Windows, or AppImage and Debian installers on Linux:

```sh
corepack pnpm tauri:build
```

The main app builds its Vue assets and Windows privileged helper before packaging. It does not run the upstream test suite as part of the packaging command.

## GitHub releases

Pushing a `v*` tag runs `.github/workflows/release.yml`. It builds native installers on Windows and Linux runners, attaches SHA-256 checksums, signing certificates, updater signatures, and this changelog, then publishes the GitHub Release. Repository Actions secrets provide the Windows PFX and password, Tauri updater private key and password, and GPG private key, passphrase, and fingerprint.

The Windows certificate for v1.0.0 is self-signed as `CN=bxane`; Windows will show an untrusted-publisher warning unless users choose to trust the included public certificate. Wyre publishes `latest.json` for its opt-in in-app updater; users remain in control of installing updates.

## AI providers

AI provider configuration and local-model details are documented in [`src-tauri/crates/mangodisk-core/src/ai/README.md`](src-tauri/crates/mangodisk-core/src/ai/README.md). Wyre's custom-provider mode uses the endpoint and credentials that you configure there; the upstream MangoDisk hosted AI service is not a Wyre service.

## Upstream source and attribution

Wyre is derived from MangoDisk 1.1.9, commit `f7d8bc73b68ec2170ac4ba451c6723b11329380c`, by harry0703 and contributors. The unmodified working-tree snapshot is preserved at `../vendor/upstream/MangoDisk/`; its GPL-3.0-only license is included here as [`LICENSE`](LICENSE). The Wyre changes and combined desktop app are distributed under GPL-3.0-only. Keep third-party notices under `src/components/` and the upstream snapshot intact.

Wyre is not affiliated with the MangoDisk project. Its network speed check is user-started and transfers about 16 MB to Cloudflare. Mouse changes are supported on Windows and GNOME Linux and can be undone once.
