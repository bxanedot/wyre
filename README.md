# Wyre

Wyre is a Windows, macOS and Linux desktop toolkit for storage analysis, reviewed cleanup, system maintenance, network measurements, and mouse controls. Its Vue interface and Rust core live in [app/](app/).

## Included tools

- Storage analysis, cleanup previews, privacy tools, startup management, application management, system settings, maintenance, and history.
- On-demand latency, jitter, download, and upload measurements through Cloudflare. Each run transfers about 16 MB; Cloudflare can see your public IP address.
- Windows and GNOME pointer speed and acceleration controls, with review and one-step undo.
- A macOS-style interface with SF Symbols from [GlyphStudio](https://github.com/bxanedot/GlyphStudio), in light and dark.
- Windows NSIS, macOS disk image, and Linux AppImage and Debian installers from GitHub Releases.

## Run and build

Use Node.js 22+, pnpm 11.13.1, Rust 1.99.0, and the native Tauri prerequisites for your OS.

```sh
cd app
corepack pnpm install --frozen-lockfile
corepack pnpm tauri:dev
```

Build the Windows installer with `corepack pnpm tauri:build` the Linux installers with `corepack pnpm tauri:build:linux`, or the macOS disk image with `corepack pnpm tauri:build:mac`. After changing `src/components/icons/glyph-names.json`, regenerate the icons with `node scripts/sync-glyphs.mjs <GlyphStudio checkout> src/components/icons/glyph-names.json src/components/icons/glyphs.ts`. Run `corepack pnpm check` for the complete validation suite.

## Releases

Tag a version such as `v1.0.0` to build Windows, macOS and Linux installers, SHA-256 checksums, and a signed updater manifest. Repository Actions secrets provide the signing keys. The current Windows certificate is self-signed as `CN=bxane`; Windows reports an untrusted publisher unless users choose to trust that certificate. The macOS app is not notarized, so macOS asks users to approve it on first launch.

## License and authors

All Wyre-specific features, fixes, and source code changes are by bxane. Wyre is distributed under [GPL-3.0-only](LICENSE). The desktop source incorporates work by harry0703 and contributors, based on version 1.1.9 at commit `f7d8bc73b68ec2170ac4ba451c6723b11329380c`, with Wyre changes by bxane. Original author credit and third-party license notices are retained. See [UPSTREAMS.md](UPSTREAMS.md) for source provenance.
