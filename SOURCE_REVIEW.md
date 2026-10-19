# Source archive review

The input folder contains 14 ZIP archives and one additional Special K 7z archive. The ZIPs contain 13,507 files in total; the 7z contains two prebuilt DLLs. Their readmes and licenses were reviewed for product ideas. Wyre does not incorporate code or binaries from those local archives.

| Archive | Useful idea | Wyre decision | License noted in archive |
| --- | --- | --- | --- |
| `NETworkManager-main.zip` | Network diagnostics and readable results | Use on-demand latency, jitter, and throughput measurements; implement in Wyre's Tauri adapter | GPL-3.0 |
| `openmouse-main.zip` | Mouse settings organized by capability | Use native Windows and GNOME pointer controls; omit hardware firmware writes | AGPL-3.0 |
| `mouse-protocol-main.zip` | Separates mouse protocol codecs from device drivers | Keep hardware-specific protocol writes out of the current release | AGPL-3.0 |
| `Universal-x86-Tuning-Utility-master.zip` | One place for performance controls | Use MangoDisk's reviewed built-in system controls | GPL-3.0 |
| `DisplayMagician-develop.zip` | Saved display profiles and app organization | Outside Wyre's system, network, and pointer scope | GPL-3.0 |
| `dlss-swapper-main.zip` | GPU library management | Game-specific DLL replacement is outside scope | GPL-3.0 |
| `dxvk-gplasync-main.zip` | Graphics translation and shader stutter tuning | Not part of a general system control panel | No top-level license file found |
| `fullscreenizersrc.zip` | Full-screen window helper | No matching cross-platform need | No top-level license file found |
| `portmaster-development.zip` | Network privacy and firewall controls | A separate firewall service is outside current scope | GPL-3.0 |
| `project-nomad-main.zip` | Offline knowledge server | Separate server product | Apache-2.0 |
| `SCSKiller-main.zip` | Shader compilation preparation | Game shader cache behavior is outside scope | GPL-3.0 |
| `SpecialK-main.zip` | Per-game rendering and performance instrumentation | Injection and game-specific configuration are outside scope | GPL-3.0 |
| `SpecialK.7z` | Prebuilt `SpecialK32.dll` and `SpecialK64.dll` | Binary-only game injection payload; not bundled or loaded by Wyre | No license metadata in the archive |
| `SSTap-Rule-master.zip` | Route table rules | Discontinued; routing changes are not safe generic optimizer actions | Apache-2.0 |
| `WidescreenFixesPack-master.zip` | Per-game display fixes | Game patches are outside scope | MIT |

## MangoDisk integration

MangoDisk is not one of these local archives. Its complete upstream source was separately requested and copied from GitHub into `app/`, with the original source snapshot and GPL-3.0-only license retained under `vendor/upstream/MangoDisk/`. Wyre now builds that full application as its desktop base.
