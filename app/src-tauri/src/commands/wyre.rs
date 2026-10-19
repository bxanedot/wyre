use serde::{Deserialize, Serialize};
use std::process::Command;
use std::time::{Duration, Instant};

const SPEED_TEST_BASE: &str = "https://speed.cloudflare.com";
#[cfg(target_os = "windows")]
const WINDOWS_MOUSE_TYPE: &str = r#"Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public static class WyreMouse { [DllImport("user32.dll", SetLastError=true)] public static extern bool SystemParametersInfo(int action, int param, IntPtr value, int flags); [DllImport("user32.dll", EntryPoint="SystemParametersInfo", SetLastError=true)] public static extern bool SystemParametersInfoArray(int action, int param, int[] value, int flags); }'"#;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NetworkMeasurement {
    latency_ms: u32,
    jitter_ms: u32,
    download_mbps: f64,
    upload_mbps: f64,
    failed_probes_percent: u8,
    data_mb: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MouseSettings {
    supported: bool,
    speed: Option<u8>,
    acceleration: Option<bool>,
    acceleration_profile: Option<String>,
    reason: Option<String>,
}

#[tauri::command]
pub async fn network_test() -> Result<NetworkMeasurement, String> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(30))
        .build()
        .map_err(|error| format!("Could not prepare the network check: {error}"))?;
    let mut samples = Vec::new();
    let mut failed = 0u8;
    for _ in 0..4 {
        let started = Instant::now();
        match client
            .get(format!("{SPEED_TEST_BASE}/__down?bytes=0"))
            .send()
            .await
            .and_then(reqwest::Response::error_for_status)
        {
            Ok(response) => match response.bytes().await {
                Ok(_) => samples.push(started.elapsed().as_secs_f64() * 1000.0),
                Err(_) => failed += 1,
            },
            Err(_) => failed += 1,
        }
    }
    if samples.is_empty() {
        return Err("Could not reach the speed test server. Check your internet connection.".into());
    }
    let latency = samples.iter().sum::<f64>() / samples.len() as f64;
    let jitter = samples
        .windows(2)
        .map(|pair| (pair[1] - pair[0]).abs())
        .sum::<f64>()
        / samples.len().saturating_sub(1).max(1) as f64;

    let download_started = Instant::now();
    let download = client
        .get(format!("{SPEED_TEST_BASE}/__down?bytes=12000000"))
        .send()
        .await
        .and_then(reqwest::Response::error_for_status)
        .map_err(|error| format!("Download check failed: {error}"))?
        .bytes()
        .await
        .map_err(|error| format!("Download check failed: {error}"))?;
    let download_mbps = mbps(download.len(), download_started.elapsed());

    let upload_started = Instant::now();
    client
        .post(format!("{SPEED_TEST_BASE}/__up"))
        .body(vec![0u8; 4_000_000])
        .send()
        .await
        .and_then(reqwest::Response::error_for_status)
        .map_err(|error| format!("Upload check failed: {error}"))?
        .bytes()
        .await
        .map_err(|error| format!("Upload check failed: {error}"))?;
    let upload_mbps = mbps(4_000_000, upload_started.elapsed());

    Ok(NetworkMeasurement {
        latency_ms: latency.round() as u32,
        jitter_ms: jitter.round() as u32,
        download_mbps,
        upload_mbps,
        failed_probes_percent: failed * 25,
        data_mb: 16,
    })
}

fn mbps(bytes: usize, elapsed: Duration) -> f64 {
    let seconds = elapsed.as_secs_f64().max(0.001);
    ((bytes as f64 * 8.0 / seconds / 1_000_000.0) * 10.0).round() / 10.0
}

#[tauri::command]
pub fn mouse_get_settings() -> MouseSettings {
    #[cfg(target_os = "windows")]
    {
        return windows_mouse_settings().unwrap_or_else(|error| unavailable(error));
    }
    #[cfg(target_os = "linux")]
    {
        if !is_gnome() {
            return unavailable("Mouse controls currently support GNOME desktops on Linux.".into());
        }
        return gnome_mouse_settings().unwrap_or_else(|error| unavailable(error));
    }
    #[cfg(not(any(target_os = "windows", target_os = "linux")))]
    unavailable("Mouse controls are unavailable on this platform.".into())
}

#[tauri::command]
pub fn mouse_apply_settings(
    speed: u8,
    acceleration: bool,
    acceleration_profile: Option<String>,
) -> Result<MouseSettings, String> {
    if !(1..=20).contains(&speed) {
        return Err("Choose a pointer speed from 1 to 20.".into());
    }
    #[cfg(target_os = "windows")]
    if acceleration_profile.as_deref().is_some_and(|profile| {
        !matches!(profile, "0" | "1" | "2") || (profile != "0") != acceleration
    }) {
        return Err("The saved Windows acceleration setting is not supported.".into());
    }
    #[cfg(target_os = "linux")]
    if acceleration_profile.as_deref().is_some_and(|profile| {
        !matches!(profile, "default" | "adaptive" | "flat") || (profile != "flat") != acceleration
    }) {
        return Err("The saved pointer acceleration profile is not supported.".into());
    }

    #[cfg(target_os = "windows")]
    {
        return apply_windows_mouse_settings(speed, acceleration, acceleration_profile.as_deref());
    }
    #[cfg(target_os = "linux")]
    {
        if !is_gnome() {
            return Err("Mouse controls currently support GNOME desktops on Linux.".into());
        }
        let previous = gnome_mouse_settings()?;
        let previous_speed = previous.speed.ok_or("Could not read the current pointer speed.")?;
        let previous_profile = previous
            .acceleration_profile
            .as_deref()
            .ok_or("Could not read the current acceleration profile.")?;
        let profile = acceleration_profile.unwrap_or_else(|| {
            if acceleration { "adaptive" } else { "flat" }.into()
        });
        let native_speed = format!("{:.2}", (f64::from(speed) / 10.0) - 1.0);
        if let Err(error) = run("gsettings", &["set", "org.gnome.desktop.peripherals.mouse", "speed", &native_speed]) {
            return Err(error);
        }
        if let Err(error) = run("gsettings", &["set", "org.gnome.desktop.peripherals.mouse", "accel-profile", &profile]) {
            let rollback_speed = format!("{:.2}", (f64::from(previous_speed) / 10.0) - 1.0);
            let rollback_speed_result = run("gsettings", &["set", "org.gnome.desktop.peripherals.mouse", "speed", &rollback_speed]);
            let rollback_profile_result = run("gsettings", &["set", "org.gnome.desktop.peripherals.mouse", "accel-profile", previous_profile]);
            return Err(match (rollback_speed_result, rollback_profile_result) {
                (Ok(_), Ok(_)) => error,
                _ => format!("{error} Settings could not be fully restored; reload the current values."),
            });
        }
        return gnome_mouse_settings();
    }
    #[cfg(not(any(target_os = "windows", target_os = "linux")))]
    Err("Mouse controls are unavailable on this platform.".into())
}

#[cfg(target_os = "windows")]
fn windows_mouse_settings() -> Result<MouseSettings, String> {
    let script = format!(
        "{WINDOWS_MOUSE_TYPE}; $m=Get-ItemProperty 'HKCU:\\Control Panel\\Mouse'; @{{supported=$true;speed=[int]$m.MouseSensitivity;acceleration=([int]$m.MouseSpeed -gt 0);accelerationProfile=([string][int]$m.MouseSpeed);reason=$null}} | ConvertTo-Json -Compress"
    );
    let output = run("powershell.exe", &["-NoLogo", "-NoProfile", "-NonInteractive", "-Command", &script])?;
    serde_json::from_str(&output).map_err(|error| format!("Windows returned invalid pointer settings: {error}"))
}

#[cfg(target_os = "windows")]
fn apply_windows_mouse_settings(
    speed: u8,
    acceleration: bool,
    acceleration_profile: Option<&str>,
) -> Result<MouseSettings, String> {
    let acceleration_value = acceleration_profile
        .and_then(|profile| profile.parse::<u8>().ok())
        .unwrap_or(u8::from(acceleration));
    let script = format!(
        "{WINDOWS_MOUSE_TYPE}; $m=Get-ItemProperty 'HKCU:\\Control Panel\\Mouse'; $oldSpeed=[int]$m.MouseSensitivity; $oldAccel=[int]$m.MouseSpeed; $t1=[int]$m.MouseThreshold1; $t2=[int]$m.MouseThreshold2; $ok1=[WyreMouse]::SystemParametersInfo(0x0071,0,[IntPtr]{speed},3); $v=[int[]]@($t1,$t2,{acceleration_value}); $ok2=[WyreMouse]::SystemParametersInfoArray(0x0004,0,$v,3); if(-not ($ok1 -and $ok2)) {{ [void][WyreMouse]::SystemParametersInfo(0x0071,0,[IntPtr]$oldSpeed,3); $old=[int[]]@($t1,$t2,$oldAccel); [void][WyreMouse]::SystemParametersInfoArray(0x0004,0,$old,3); throw 'Windows rejected the pointer settings' }}; @{{supported=$true;speed={speed};acceleration=$({acceleration_value} -gt 0);accelerationProfile='{acceleration_value}';reason=$null}} | ConvertTo-Json -Compress"
    );
    let output = run("powershell.exe", &["-NoLogo", "-NoProfile", "-NonInteractive", "-Command", &script])?;
    serde_json::from_str(&output).map_err(|error| format!("Windows returned invalid pointer settings: {error}"))
}

#[cfg(target_os = "linux")]
fn is_gnome() -> bool {
    std::env::var("XDG_CURRENT_DESKTOP")
        .is_ok_and(|desktop| desktop.to_ascii_lowercase().contains("gnome"))
}

#[cfg(target_os = "linux")]
fn gnome_mouse_settings() -> Result<MouseSettings, String> {
    let speed = run("gsettings", &["get", "org.gnome.desktop.peripherals.mouse", "speed"])?
        .parse::<f64>()
        .map_err(|error| format!("GNOME returned an invalid pointer speed: {error}"))?;
    let profile = run("gsettings", &["get", "org.gnome.desktop.peripherals.mouse", "accel-profile"])?
        .trim_matches('\'')
        .to_string();
    Ok(MouseSettings {
        supported: true,
        speed: Some(((speed + 1.0) * 10.0).round().clamp(1.0, 20.0) as u8),
        acceleration: Some(profile != "flat"),
        acceleration_profile: Some(profile),
        reason: None,
    })
}

fn unavailable(reason: String) -> MouseSettings {
    MouseSettings {
        supported: false,
        speed: None,
        acceleration: None,
        acceleration_profile: None,
        reason: Some(reason),
    }
}

fn run(program: &str, args: &[&str]) -> Result<String, String> {
    let output = Command::new(program)
        .args(args)
        .output()
        .map_err(|error| format!("Could not run {program}: {error}"))?;
    if !output.status.success() {
        let detail = String::from_utf8_lossy(&output.stderr).trim().to_string();
        return Err(if detail.is_empty() {
            format!("{program} failed with status {}.", output.status)
        } else {
            format!("{program} failed: {detail}")
        });
    }
    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}
