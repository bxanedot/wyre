# Wyre desktop application

Wyre combines a Vue interface with a Rust core for storage analysis, reviewed cleanup, privacy, startup management, applications, and system maintenance. It also includes user-started network measurements and Windows/GNOME pointer controls.

## Development

Requirements: Node.js 22+, pnpm 11.13.1, Rust 1.99.0, and the native Tauri dependencies for your operating system.

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm tauri:dev
```

Run `corepack pnpm check` for source gates, frontend coverage, asset compilation, Rust formatting, Clippy, compilation, and native tests. Build installers on their target OS with `corepack pnpm tauri:build`. Packaging builds frontend assets and the Windows privileged helper; use the complete check before preparing a release.

## GitHub releases

Pushing a `v*` tag runs the root release workflow for Windows and Linux installers, checksums, signatures, and updater metadata. [Wyre releases](https://github.com/bxanedot/wyre/releases) contain published artifacts. Portable builds open the matching release page for manual downloads. The Windows certificate is currently self-signed as `CN=bxane`.

## AI providers

Configure your own provider endpoint and credentials. Hosted AI remains unavailable unless the build explicitly configures a Wyre service.

## Source and license

All Wyre-specific features, fixes, and source code changes are by bxane. Wyre is distributed under [GPL-3.0-only](../LICENSE). The desktop source incorporates work by harry0703 and contributors, based on version 1.1.9 at commit `f7d8bc73b68ec2170ac4ba451c6723b11329380c`, with Wyre changes by bxane. Original author credit and third-party license notices are retained. See [UPSTREAMS.md](../UPSTREAMS.md) for source provenance.

The network check transfers about 16 MB to Cloudflare when started. Mouse changes require review and can be undone once.
