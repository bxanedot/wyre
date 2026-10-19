# Changelog

## 1.0.0 — 2026-10-20

- Replaced the standalone Electron shell with the full MangoDisk Vue/Tauri application as Wyre's base.
- Added on-demand network latency, jitter, download, and upload measurement.
- Added live network interface status, local IPv4 details, and current traffic rates to the Network page.
- Added native Windows and GNOME pointer speed and acceleration controls with review and one-step undo.
- Rebranded the desktop app, package metadata, icons, and release workflow as Wyre.
- Added Windows NSIS, Linux AppImage and Debian installers, SHA-256 checksums, optional signatures, and this changelog to GitHub Releases.
- Switched the combined source to GPL-3.0-only and preserved the MangoDisk attribution and license.

## 0.3.0 — 2026-10-19

- Integrated MangoDisk's native scan engine as an on-demand cleanup preview; Wyre does not apply cleanup or expose matched local paths.
- Added native MangoDisk CLI builds to Windows/Linux installer and signed release workflows.
- Added the upstream MangoDisk license to packaged resources and documented its GPL-3.0 source.

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
