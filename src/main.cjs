const { app, BrowserWindow, ipcMain } = require('electron');
const os = require('node:os');
const path = require('node:path');
const { execFile, execFileSync } = require('node:child_process');
const https = require('node:https');

const isWindows = process.platform === 'win32';
const linux = process.platform === 'linux';
let previousCpu = null;
let cachedStatic = null;
let staticStatePromise = null;

function run(file, args, options = {}) {
  return new Promise((resolve, reject) => execFile(file, args, { timeout: 8000, windowsHide: true, ...options }, (error, stdout, stderr) => {
    if (error) return reject(new Error((stderr || stdout || error.message).trim()));
    resolve(stdout.trim());
  }));
}

function cpuPercent() {
  const cpus = os.cpus();
  const current = cpus.reduce((sum, cpu) => {
    const times = cpu.times;
    sum.idle += times.idle;
    sum.total += Object.values(times).reduce((a, b) => a + b, 0);
    return sum;
  }, { idle: 0, total: 0 });
  const old = previousCpu;
  previousCpu = current;
  return old ? Math.round(100 * (1 - (current.idle - old.idle) / (current.total - old.total))) : 0;
}

function windowsMouseScript(action, speed, acceleration) {
  const source = `using System; using System.Runtime.InteropServices; public static class WyreMouse { [DllImport("user32.dll", SetLastError=true)] public static extern bool SystemParametersInfo(int action, int param, IntPtr value, int flags); [DllImport("user32.dll", EntryPoint="SystemParametersInfo", SetLastError=true)] public static extern bool SystemParametersInfoArray(int action, int param, int[] value, int flags); }`;
  if (action === 'get') return `Add-Type -TypeDefinition '${source}'; $m=Get-ItemProperty 'HKCU:\\Control Panel\\Mouse'; @{supported=$true;speed=[int]$m.MouseSensitivity;acceleration=([int]$m.MouseSpeed -gt 0)} | ConvertTo-Json -Compress`;
  return `Add-Type -TypeDefinition '${source}'; $m=Get-ItemProperty 'HKCU:\\Control Panel\\Mouse'; $ok1=[WyreMouse]::SystemParametersInfo(0x0071,0,[IntPtr]${speed},3); $v=[int[]]@([int]$m.MouseThreshold1,[int]$m.MouseThreshold2,${acceleration ? 1 : 0}); $ok2=[WyreMouse]::SystemParametersInfoArray(0x0004,0,$v,3); if(-not ($ok1 -and $ok2)){throw 'Windows rejected the mouse settings'}; @{supported=$true;speed=${speed};acceleration=${acceleration}} | ConvertTo-Json -Compress`;
}

function mouseState() {
  if (isWindows) {
    return run('powershell.exe', ['-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', windowsMouseScript('get')])
      .then(JSON.parse)
      .catch(() => ({ supported: false, reason: 'Windows could not read the current pointer settings.' }));
  }
  if (linux && process.env.XDG_CURRENT_DESKTOP?.toLowerCase().includes('gnome')) {
    try {
      const speed = Number(execFileSync('gsettings', ['get', 'org.gnome.desktop.peripherals.mouse', 'speed'], { encoding: 'utf8' }).trim());
      const profile = execFileSync('gsettings', ['get', 'org.gnome.desktop.peripherals.mouse', 'accel-profile'], { encoding: 'utf8' }).trim().replaceAll("'", '');
      return Promise.resolve({ supported: true, speed: Math.round((speed + 1) * 10), acceleration: profile !== 'flat', platform: 'gnome' });
    } catch {}
  }
  return Promise.resolve({ supported: false, reason: linux ? 'Wyre mouse controls currently support GNOME desktops.' : 'Mouse controls are unavailable on this platform.' });
}

async function applyMouse({ speed, acceleration }) {
  if (!Number.isInteger(speed) || speed < 1 || speed > 20 || typeof acceleration !== 'boolean') {
    throw new Error('Choose a pointer speed from 1 to 20 and an acceleration setting.');
  }
  const value = speed;
  const accel = acceleration;
  if (isWindows) return JSON.parse(await run('powershell.exe', ['-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', windowsMouseScript('set', value, accel)]));
  if (linux && process.env.XDG_CURRENT_DESKTOP?.toLowerCase().includes('gnome')) {
    const gnomeSpeed = ((value - 10) / 10).toFixed(2);
    await run('gsettings', ['set', 'org.gnome.desktop.peripherals.mouse', 'speed', gnomeSpeed]);
    await run('gsettings', ['set', 'org.gnome.desktop.peripherals.mouse', 'accel-profile', accel ? 'adaptive' : 'flat']);
    return { supported: true, speed: value, acceleration: accel };
  }
  throw new Error('Wyre mouse controls currently support Windows and GNOME desktops.');
}

async function powerState() {
  if (isWindows) {
    try {
      const output = await run('powercfg.exe', ['/getactivescheme']);
      return { supported: true, current: output.match(/\(([^)]+)\)/)?.[1] || output };
    }
    catch { return { supported: true, current: 'Power profile unavailable' }; }
  }
  if (linux) {
    try { return { supported: true, current: await run('powerprofilesctl', ['get']) }; }
    catch { return { supported: false, current: 'Power profiles are unavailable on this system.' }; }
  }
  return { supported: false, current: 'Power profile controls are unavailable on this platform.' };
}

async function setPowerProfile(profile) {
  if (profile !== 'performance' && profile !== 'balanced') throw new Error('Unknown power profile.');
  if (isWindows) await run('powercfg.exe', ['/setactive', profile === 'performance' ? 'SCHEME_MIN' : 'SCHEME_BALANCED']);
  else if (linux) await run('powerprofilesctl', ['set', profile]);
  else throw new Error('Power profile controls are unavailable on this platform.');
  return powerState();
}

function systemState() {
  const total = os.totalmem();
  const used = total - os.freemem();
  if (!cachedStatic || Date.now() - cachedStatic.at > 15000) {
    staticStatePromise ||= Promise.all([mouseState(), powerState()]).then(([mouse, power]) => {
      cachedStatic = { at: Date.now(), mouse, power };
      return cachedStatic;
    }).finally(() => { staticStatePromise = null; });
  }
  const staticState = staticStatePromise || Promise.resolve(cachedStatic);
  return staticState.then(({ mouse, power }) => ({
    platform: process.platform,
    release: os.release(),
    cpu: cpuPercent(),
    cores: os.cpus().length,
    memory: { used: used, total: total, percent: Math.round(used / total * 100) },
    mouse,
    power
  }));
}

function requestBytes(url, method = 'GET', body) {
  return new Promise((resolve, reject) => {
    const started = performance.now();
    const req = https.request(url, { method, headers: body ? { 'content-type': 'application/octet-stream', 'content-length': body.length } : {} }, res => {
      if (res.statusCode < 200 || res.statusCode >= 300) return reject(new Error(`Speed test server returned ${res.statusCode}.`));
      let bytes = 0;
      res.on('data', chunk => { bytes += chunk.length; });
      res.on('end', () => resolve({ bytes, ms: performance.now() - started }));
    });
    req.setTimeout(30000, () => req.destroy(new Error('Speed test timed out.')));
    req.on('error', reject);
    if (body) req.end(body); else req.end();
  });
}

async function networkTest() {
  const base = 'https://speed.cloudflare.com';
  const pings = [];
  let failed = 0;
  for (let i = 0; i < 4; i++) {
    try { pings.push((await requestBytes(`${base}/__down?bytes=0`)).ms); }
    catch { failed++; }
  }
  if (!pings.length) throw new Error('Could not reach the speed test server. Check your internet connection.');
  const download = await requestBytes(`${base}/__down?bytes=12000000`);
  const upload = await requestBytes(`${base}/__up`, 'POST', Buffer.alloc(4 * 1024 * 1024));
  const sorted = [...pings].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const jitter = pings.length > 1 ? pings.slice(1).reduce((sum, value, i) => sum + Math.abs(value - pings[i]), 0) / (pings.length - 1) : 0;
  return {
    latency: Math.round(median),
    jitter: Math.round(jitter),
    loss: Math.round(failed / 4 * 100),
    download: +(download.bytes * 8 / download.ms / 1000).toFixed(1),
    upload: +(upload.bytes * 8 / upload.ms / 1000).toFixed(1),
    dataMB: +((download.bytes + upload.bytes) / 1e6).toFixed(1)
  };
}

ipcMain.handle('system:state', systemState);
ipcMain.handle('mouse:apply', (_event, settings) => applyMouse(settings));
ipcMain.handle('power:set', (_event, profile) => setPowerProfile(profile));
ipcMain.handle('network:test', networkTest);

function createWindow() {
  const win = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 980,
    minHeight: 700,
    backgroundColor: '#0e1414',
    title: 'Wyre',
    icon: path.join(__dirname, '..', 'assets', 'wyre.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  win.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
