# Reference projects

The requested upstream source repositories are copied as independent snapshots under `vendor/upstream/`. They are not linked into or executed by Wyre's current Electron app. Snapshot commits, license terms, and integration status are in [UPSTREAMS.md](UPSTREAMS.md).

| Project | Relevant idea | How Wyre uses the reference |
| --- | --- | --- |
| [MangoDisk](https://github.com/harry0703/MangoDisk) | Disk analysis, cleanup, app/startup management | Its GPL-3.0 CLI is built as a separate sidecar for Wyre's read-only cleanup preview; see [UPSTREAMS.md](UPSTREAMS.md). |
| [Network Optimizer for UniFi](https://github.com/Ozark-Connect/NetworkOptimizer) | UniFi network monitoring and optimization | Full BSL-1.1 source snapshot is included separately. It manages UniFi infrastructure rather than local Windows/Linux PC adapters. |
| [SSH.NET](https://github.com/sshnet/SSH.NET) | SSH/SFTP for .NET applications | Full MIT source snapshot is included separately; Wyre currently has no remote-host controls. |
| [PowerModels.jl](https://github.com/lanl-ansi/PowerModels.jl) | Mathematical optimization of electrical power networks | Full LANL-licensed Julia source snapshot is included separately; it models power grids rather than PC network settings. |
| [ncnn](https://github.com/Tencent/ncnn) | Neural-network inference on desktop and embedded devices | Full BSD-3-Clause C++ source snapshot and pinned submodules are included separately; Wyre currently has no inference runtime or model. |

## Scope

Wyre's current features are local CPU and memory readings, reversible power and pointer settings, on-demand internet measurements, local IPv4 interface details, and a bounded read-only storage scan. It does not yet change DNS, adapter settings, router configuration, startup entries, or delete files. Those operations need platform-specific privilege handling and reliable restore behavior before they belong in this app.
