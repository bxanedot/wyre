# Changelog

## [Unreleased]

- Keep the desktop window's native minimize animation and enlarge custom window-control glyphs.
- Generate resident tray icons from the vector Wyre mark and document the correct vector source for packaged icons.
- Validate release tags against all app versions and the matching changelog before starting platform builds.

## 1.0.0 — 2026-10-20

- Replaced the standalone Electron shell with the full Wyre Vue/Tauri application as Wyre's base.
- Added on-demand network latency, jitter, download, and upload measurement.
- Added live network interface status, local IPv4 details, and current traffic rates to the Network page.
- Added native Windows and GNOME pointer speed and acceleration controls with review and one-step undo.
- Rebranded the desktop app, package metadata, icons, and release workflow as Wyre.
- Added Windows NSIS, Linux AppImage and Debian installers, SHA-256 checksums, Tauri/GPG signatures, and this changelog to GitHub Releases. Windows uses a self-signed `CN=bxane` code-signing certificate, so Windows reports an untrusted publisher until users opt into trusting the included certificate.
- Switched the combined source to GPL-3.0-only and preserved original author credit and license notices.

## 0.3.0 — 2026-10-19

- Integrated Wyre's native scan engine as an on-demand cleanup preview; Wyre does not apply cleanup or expose matched local paths.
- Added native Wyre CLI builds to Windows/Linux installer and signed release workflows.
- Added the original GPL-3.0-only license to packaged resources and documented its GPL-3.0 source.

## 0.2.0 — 2026-10-19

- Added an opt-in local storage scan that lists the largest files in a chosen folder without deleting anything.
- Added active IPv4 interface and address details to the network page.
- Added review-before-apply dialogs and one-step undo for power profile and pointer changes.
- Added failed HTTP probe percentage to the on-demand network readout.
- Documented the scope and decisions for the requested reference projects.
- Improved mobile layout, focus visibility, and dialog styling.

## 0.1.0 — 2026-10-19

- Introduced the Wyre desktop control panel for Windows and Linux.
- Added a local CPU and memory overview with user-selected performance and balanced power profiles.
- Added an on-demand Cloudflare network check for latency, jitter, download, and upload speed.
- Added pointer speed and acceleration controls for Windows and GNOME Linux.
- Added the Wyre wordmark, SVG app mark, app icon, and Windows/Linux installer configuration.
- Added a signed multi-platform GitHub release workflow.
