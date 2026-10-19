# Wyre updater releases

The tag release workflow publishes `latest.json` and signed updater bundles for Windows x64 and Linux x64. Wyre checks the GitHub release feed on startup and every six hours; installation stays under the user's control.

Add these repository Actions secrets before publishing a release:

- `TAURI_SIGNING_PRIVATE_KEY`: the private Tauri updater key contents paired with `plugins.updater.pubkey` in `app/src-tauri/tauri.conf.json`.
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`: the key's password, if it is password-protected.

Keep the private key out of Git and release assets. The workflow fails if the private key is missing. Do not replace the configured public key unless you are also preparing a signed bootstrap installer for existing users; installed versions trust that key.

Push a `vX.Y.Z` tag matching both `app/package.json` and `app/src-tauri/tauri.conf.json`. The workflow includes the changelog and publishes the signed installers and updater manifest on the GitHub release.
