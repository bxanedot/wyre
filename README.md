# Wyre

Wyre is a small desktop control panel for Windows and Linux. It brings together live CPU and memory readings, an on-demand network speed check, pointer settings, and a reversible power profile switch.

## Features

- Live CPU load and RAM use, sampled locally.
- Reviewable power profile changes with a one-step undo.
- An on-demand MangoDisk cleanup preview with recommended and total estimated space; Wyre does not delete files or show matched local paths.
- On-demand storage analysis of a folder you choose, including its 25 largest files. It is read-only and bounded to 25,000 files, 5,000 directories, and 10 folder levels.
- Active local IPv4 interface addresses, plus an on-demand internet connection check.
- On-demand latency, jitter, download, upload, and failed HTTP timing probe measurements using Cloudflare's public speed test endpoint. Each check transfers about 16 MB; no test runs in the background. Failed HTTP probes are not ICMP packet loss or packet capture.
- Local IPv4 addresses for active network interfaces.
- Pointer speed and acceleration controls for Windows and GNOME Linux. Other Linux desktops can run Wyre, but their pointer settings are not yet supported.
- Windows and Linux power profile controls with a review step and one-step undo.
- Pointer changes have a review step and one-step undo.
- No accounts, telemetry, or background services.
- The complete source snapshots requested from five upstream projects are preserved under `vendor/upstream/`. MangoDisk's CLI is built as a separate installer sidecar; the other projects remain source-only. Each keeps its own license; see [UPSTREAMS.md](UPSTREAMS.md).
- Review of the earlier local source archives is documented in `SOURCE_REVIEW.md`.

## Run from source

Requires Node.js 22 or newer and Rust stable with Cargo to build the MangoDisk scanner.

```sh
npm ci
npm start
```

Build a local installer:

```sh
npm run dist:win
npm run dist:linux
```

The Windows build creates an NSIS installer. Linux builds create an AppImage and a Debian package. Each build compiles MangoDisk's native scanner for that platform. AppImage packaging must run on Linux; use the `linux` GitHub Actions runner or Linux/WSL to build it.

## Signing releases

Tag a version such as `v0.3.0` to start `.github/workflows/release.yml`. The workflow refuses to publish unless its signing secrets are present.

- `WYRE_WINDOWS_PFX`: base64 encoded Authenticode PFX whose subject identifies `bxane`.
- `WYRE_WINDOWS_PFX_PASSWORD`: PFX password.

Wyre's release workflow signs Windows installers with Authenticode and Linux packages with detached CMS signatures, then publishes SHA-256 checksums, the public signing certificate, and the changelog. Keep signing secrets in GitHub Actions secrets; never commit a private key or certificate. The current local `CN=bxane` certificate is self-signed, so Windows may show an unknown publisher warning. Its signature protects the installer from undetected changes but does not carry a public certificate authority's trust. For a hosted release, add the PFX to the repository's Actions secrets as `WYRE_WINDOWS_PFX` (base64) and `WYRE_WINDOWS_PFX_PASSWORD`; those secrets let GitHub Actions sign both platform builds.

## Mouse support

Windows uses the current user's Windows pointer settings. Linux currently supports GNOME's `gsettings` mouse controls. Hardware-specific mouse firmware, DPI, and polling-rate writes are not implemented.

## License

Wyre is provided under the MIT License. See [LICENSE](LICENSE).
