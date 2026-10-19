# Upstream source snapshots

Complete upstream working-tree snapshots were imported on 2026-10-19. Each snapshot is pinned to the commit below, kept in its own directory, and retains its upstream license and notices. The Wyre MIT license applies to Wyre's original files only; it does not replace the license in any `vendor/upstream/` directory.

| Project | Pinned commit | License | Snapshot |
| --- | --- | --- | --- |
| [MangoDisk](https://github.com/harry0703/MangoDisk) | `f7d8bc73b68ec2170ac4ba451c6723b11329380c` | GPL-3.0 | [`vendor/upstream/MangoDisk`](vendor/upstream/MangoDisk) |
| [SSH.NET](https://github.com/sshnet/SSH.NET) | `967cbfe970ecf8ce057d7cb201cc69aa3047c50c` | MIT | [`vendor/upstream/SSH.NET`](vendor/upstream/SSH.NET) |
| [PowerModels.jl](https://github.com/lanl-ansi/PowerModels.jl) | `d973c4f48300cd139c09315d126c1bc3e70a4ccd` | LANL BSD-style license with government-contract terms | [`vendor/upstream/PowerModels.jl`](vendor/upstream/PowerModels.jl) |
| [ncnn](https://github.com/Tencent/ncnn) | `b5721b4bd2c8d0a8b861477f72c515db6b9f6dd0` | BSD-3-Clause with separately licensed third-party components | [`vendor/upstream/ncnn`](vendor/upstream/ncnn) |
| [NetworkOptimizer](https://github.com/Ozark-Connect/NetworkOptimizer) | `cb203921fb4453a6e0cc2056c9bdaabe8e09876e` | Business Source License 1.1; personal non-commercial production use is limited to three sites under this snapshot's grant | [`vendor/upstream/NetworkOptimizer`](vendor/upstream/NetworkOptimizer) |

ncnn's source snapshot includes its pinned submodules: glslang `780b6a209132dc74e99458f62ebe5fa7e57c41cf` and pybind11 `d03662f0984f652b60e7ddce53d3868002275197`. Their own license files are retained with the source.

## Integration status

These are complete source snapshots, not five libraries that can be linked into the existing Electron app. MangoDisk is a Rust/Tauri disk utility; SSH.NET is a .NET SSH/SFTP library; PowerModels.jl is a Julia power-grid optimization package; ncnn is a C++ neural-inference framework; and NetworkOptimizer is a .NET UniFi network-management application. Their code remains in separate directories with separate build systems and license terms.

Wyre's current Electron build does not compile or execute these snapshots. `package.json` intentionally packages only Wyre's `src/` and `assets/`. The snapshot files are included in the source repository for direct review and future integration. Integrating GPL-3.0 or BSL-licensed components into the Wyre executable would require handling their terms for the resulting combined work.
