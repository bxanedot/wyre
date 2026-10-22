# Wyre updater releases

The tag release workflow publishes `latest.json` and signed updater bundles for Windows x64 and Linux x64. Wyre checks the GitHub release feed on startup and every six hours; installation stays under the user's control.

The initial v1.0.0 release uses the updater public key in `app/src-tauri/tauri.conf.json`. Keep its matching private key in the repository Actions secret `TAURI_SIGNING_PRIVATE_KEY` and its password in `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`. Keep both values out of Git and release assets. Installed versions trust this public key, so future key rotation needs a coordinated signed update.

The Windows installer uses a self-signed `CN=bxane` Code Signing certificate. The release includes `Wyre-signing.cer` so users can inspect it and opt into trusting it; Windows will still show the publisher as untrusted until they do. Keep its PFX only in `WYRE_WINDOWS_PFX` and its password in `WYRE_WINDOWS_PFX_PASSWORD`.

Linux release files use the repository secrets `WYRE_GPG_PRIVATE_KEY`, `WYRE_GPG_PASSPHRASE`, and `WYRE_GPG_KEY_ID`. Never add private keys or passwords to the repository.

Push a `vX.Y.Z` tag matching `package.json`, `app/package.json`, `app/src-tauri/tauri.conf.json`, and the Cargo workspace version in `app/Cargo.toml`. The workflow includes the changelog and publishes installers, signatures, checksums, and the updater manifest on the GitHub release.
