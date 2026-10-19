# Reference projects

Wyre uses these projects to compare product scope and interaction ideas. It does not copy their source code, binaries, UI assets, or runtime dependencies.

| Project | Relevant idea | How Wyre uses the reference |
| --- | --- | --- |
| [MangoDisk](https://github.com/harry0703/MangoDisk) | Storage analysis, user-reviewed findings, operation history | Wyre's first storage feature scans a folder the user chooses and reports large files. It is read-only; it does not delete or clean files. MangoDisk is GPL-3.0, and no code or assets were copied. |
| [Network Optimizer for UniFi](https://github.com/Ozark-Connect/NetworkOptimizer) | Network health, tests, explicit configuration controls | This project manages UniFi sites and devices; it is not a local Windows/Linux network optimizer. Wyre uses only the general diagnostic idea and does not include its controller integrations or code. It is licensed under BSL 1.1. |
| [SSH.NET](https://github.com/sshnet/SSH.NET) | SSH/SFTP for .NET applications | Not included: Wyre does not need remote shell or file access to read the local PC's network state. |
| [PowerModels.jl](https://github.com/lanl-ansi/PowerModels.jl) | Mathematical optimization of electrical power networks | Not included: this is a Julia power-systems research framework, unrelated to a PC utility. |
| [ncnn](https://github.com/Tencent/ncnn) | Neural-network inference on desktop and embedded devices | Not included: Wyre does not need an inference runtime or model files. |

## Scope

Wyre's current features are local CPU and memory readings, reversible power and pointer settings, on-demand internet measurements, local IPv4 interface details, and a bounded read-only storage scan. It does not yet change DNS, adapter settings, router configuration, startup entries, or delete files. Those operations need platform-specific privilege handling and reliable restore behavior before they belong in this app.
