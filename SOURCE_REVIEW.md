# Source archive review

The input folder contains 14 ZIP archives and one additional Special K 7z archive. The ZIPs contain 13,507 files in total; the 7z contains two prebuilt DLLs. This review uses each archive's readme and license metadata to choose relevant product ideas. Wyre does not copy source code, binaries, graphics, or dependency code from these archives.

| Archive | Useful idea | Wyre decision | License noted in archive |
| --- | --- | --- | --- |
| `NETworkManager-main.zip` | Network diagnostics and readable results | Use as product inspiration for latency, jitter, and throughput cards; keep a deliberately small, on-demand check | GPL-3.0 |
| `openmouse-main.zip` | Mouse settings organized by device and capability | Use the configuration concept; implement OS pointer controls directly instead of bundling a browser WebHID service | AGPL-3.0 |
| `mouse-protocol-main.zip` | Separates mouse protocol codecs from device drivers | Useful boundary if specific mouse hardware support is added later; omit hardware protocol writes from this release | AGPL-3.0 |
| `Universal-x86-Tuning-Utility-master.zip` | One place for performance controls | Use the reversible OS power profile switch; omit vendor- and hardware-specific tuning | GPL-3.0 |
| `DisplayMagician-develop.zip` | Saved display profiles and app organization | Not needed for this system, network, and pointer scope | GPL-3.0 |
| `dlss-swapper-main.zip` | GPU library management | Game-specific DLL replacement is outside Wyre's scope | GPL-3.0 |
| `dxvk-gplasync-main.zip` | Graphics translation and shader stutter tuning | A game/runtime patch with different compatibility and anti-cheat risks; not part of a system control panel | No top-level license file found |
| `fullscreenizersrc.zip` | Full-screen window helper | A small platform-specific utility with no matching cross-platform need | No top-level license file found |
| `portmaster-development.zip` | Network privacy and firewall controls | A separate firewall service would need its own policies, service lifecycle, and security review | GPL-3.0 |
| `project-nomad-main.zip` | Offline knowledge server | Separate server product; no applicable Wyre feature | Apache-2.0 |
| `SCSKiller-main.zip` | Shader compilation preparation | Game shader cache behavior is outside scope | GPL-3.0 |
| `SpecialK-main.zip` | Per-game rendering and performance instrumentation | Injection and game-specific configuration are outside Wyre's scope | GPL-3.0 |
| `SpecialK.7z` | Prebuilt `SpecialK32.dll` and `SpecialK64.dll` | Binary-only game injection payload; not bundled or loaded by Wyre | No license metadata in the archive |
| `SSTap-Rule-master.zip` | Route table rules | The README marks the project discontinued; routing changes are not a safe generic optimizer action | Apache-2.0 |
| `WidescreenFixesPack-master.zip` | Per-game display fixes | Game patches are outside scope | MIT |

## Why this is a fresh app

The source set is a collection of standalone utilities with different jobs, operating-system support, and licensing. Merging their executables or code would add a large and difficult-to-audit dependency surface. Wyre takes the shared product ideas—visible measurements, explicit controls, and support-aware settings—and implements only those features in a small desktop app.
