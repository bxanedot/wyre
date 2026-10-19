const $ = id => document.getElementById(id);
const pages = ['overview', 'network', 'storage', 'optimize', 'mouse'];
let state;
let acceleration = true;
let pendingChange = null;
let undoMouse = null;
let undoPower = null;

function showPage(name) {
  if (!pages.includes(name)) return;
  document.querySelectorAll('.page').forEach(page => page.classList.toggle('active', page.id === `page-${name}`));
  document.querySelectorAll('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.page === name));
  $('crumb').textContent = name.toUpperCase();
}

function formatGB(bytes) { return `${(bytes / 1024 ** 3).toFixed(1)} GB`; }

function paintState(value) {
  state = value;
  $('os-label').textContent = value.platform === 'win32' ? 'WINDOWS' : value.platform.toUpperCase();
  $('cpu-value').textContent = value.cpu;
  $('cpu-meter').style.width = `${value.cpu}%`;
  $('cpu-caption').textContent = value.cpu > 85 ? 'High load' : 'Within range';
  $('cores').textContent = `${value.cores} CORES`;
  $('memory-value').textContent = value.memory.percent;
  $('memory-meter').style.width = `${value.memory.percent}%`;
  $('memory-used').textContent = formatGB(value.memory.used);
  $('memory-total').textContent = formatGB(value.memory.total);
  $('power-current').textContent = value.power.current;
  $('power-button').disabled = !value.power.supported;
  $('power-button').innerHTML = /performance/i.test(value.power.current) ? 'SET BALANCED <span>↗</span>' : 'PERFORMANCE MODE <span>↗</span>';
  $('power-note').textContent = value.power.supported ? 'Changes apply only when selected' : value.power.current;
  $('network-facts').replaceChildren();
  if (value.network.length) {
    for (const item of value.network) {
      const row = document.createElement('div');
      const name = document.createElement('b');
      const address = document.createElement('span');
      name.textContent = item.name;
      address.textContent = item.address;
      row.append(name, address);
      $('network-facts').append(row);
    }
  } else $('network-facts').textContent = 'No active IPv4 interface found.';
  if (value.mouse.supported) {
    $('mouse-speed').value = Math.max(1, Math.min(20, value.mouse.speed));
    $('mouse-speed-output').value = $('mouse-speed').value;
    acceleration = value.mouse.acceleration;
    paintAcceleration();
    $('overview-mouse-speed').textContent = `${value.mouse.speed} / 20`;
    $('overview-mouse-accel').textContent = acceleration ? 'Enabled' : 'Off';
    $('mouse-capability').textContent = 'Supported on this desktop';
    $('mouse-apply').disabled = false;
  } else {
    $('overview-mouse-speed').textContent = 'Not available';
    $('overview-mouse-accel').textContent = 'Not available';
    $('mouse-capability').textContent = value.mouse.reason;
    $('mouse-apply').disabled = true;
    $('platform-settings').textContent = value.mouse.reason;
  }
}

function paintAcceleration() {
  $('accel-toggle').setAttribute('aria-checked', String(acceleration));
  $('accel-description').textContent = acceleration ? 'Adaptive acceleration is enabled.' : 'Pointer acceleration is turned off.';
}

function setNotice(id, message, kind = '') {
  const node = $(id);
  node.textContent = message;
  node.className = `notice ${kind}`.trim();
}

function reviewChange(title, copy, action) {
  $('review-title').textContent = title;
  $('review-copy').textContent = copy;
  pendingChange = action;
  $('change-review').showModal();
}

$('review-cancel').addEventListener('click', () => $('change-review').close());
$('review-apply').addEventListener('click', async () => {
  const action = pendingChange;
  pendingChange = null;
  $('change-review').close();
  if (action) await action();
});

function recommendation(result) {
  if (result.loss) return ['Some timing probes did not complete.', 'Check Wi-Fi signal or router placement, then rerun the HTTP check.'];
  if (result.latency > 100 || result.jitter > 25) return ['The route is responding slowly.', 'Try Ethernet or move closer to your router. This result includes your ISP and route to the test server.'];
  if (result.download < 25) return ['Download speed is below 25 Mbps.', 'Compare another device on the same network to narrow down whether the router or this device is limiting the connection.'];
  return ['Your connection looks steady.', 'The result is a snapshot of the current route. Network conditions can change throughout the day.'];
}

async function runNetworkTest() {
  const buttons = [$('network-test'), $('overview-test')];
  buttons.forEach(button => { button.disabled = true; button.textContent = 'MEASURING…'; });
  $('test-progress').classList.add('running');
  $('test-status').textContent = 'Checking latency, jitter, download, and upload…';
  try {
    const result = await window.wyre.testNetwork();
    $('latency').textContent = result.latency;
    $('jitter').textContent = result.jitter;
    $('download').textContent = result.download;
    $('upload').textContent = result.upload;
    $('loss').textContent = result.loss;
    const [title, copy] = recommendation(result);
    $('insight-title').textContent = title;
    $('insight-copy').textContent = copy;
    $('test-status').textContent = `Finished · ${result.dataMB} MB transferred · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } catch (error) {
    $('test-status').textContent = error.message;
  } finally {
    $('test-progress').classList.remove('running');
    buttons.forEach((button, index) => { button.disabled = false; button.innerHTML = index ? 'RUN SPEED CHECK <span>↗</span>' : 'RUN SPEED CHECK <span>↗</span>'; });
  }
}

document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => showPage(button.dataset.page)));
document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => showPage(button.dataset.go)));
document.querySelector('.brand').addEventListener('click', event => { event.preventDefault(); showPage('overview'); });
$('network-test').addEventListener('click', runNetworkTest);
$('overview-test').addEventListener('click', () => { showPage('network'); runNetworkTest(); });
$('mouse-speed').addEventListener('input', event => { $('mouse-speed-output').value = event.target.value; });
$('accel-toggle').addEventListener('click', () => { acceleration = !acceleration; paintAcceleration(); });
$('mouse-apply').addEventListener('click', () => reviewChange(
  'Apply pointer settings?',
  `Set pointer speed to ${$('mouse-speed').value}/20 and ${acceleration ? 'enable' : 'turn off'} acceleration. You can undo this from the pointer panel.`,
  async () => {
  $('mouse-apply').disabled = true;
  setNotice('mouse-notice', 'Applying system settings…');
  try {
    const previous = { speed: Number(state.mouse.speed), acceleration: state.mouse.acceleration };
    const result = await window.wyre.applyMouse({ speed: Number($('mouse-speed').value), acceleration });
    state.mouse = result;
    undoMouse = previous;
    $('mouse-undo').hidden = false;
    setNotice('mouse-notice', 'Pointer settings applied.', 'success');
    $('overview-mouse-speed').textContent = `${result.speed} / 20`;
    $('overview-mouse-accel').textContent = acceleration ? 'Enabled' : 'Off';
  } catch (error) { setNotice('mouse-notice', error.message, 'error'); }
  finally { $('mouse-apply').disabled = false; }
}));
$('mouse-undo').addEventListener('click', async () => {
  if (!undoMouse) return;
  $('mouse-undo').disabled = true;
  try {
    const restored = await window.wyre.applyMouse(undoMouse);
    $('mouse-speed').value = restored.speed;
    $('mouse-speed-output').value = restored.speed;
    acceleration = restored.acceleration;
    paintAcceleration();
    state.mouse = restored;
    $('overview-mouse-speed').textContent = `${restored.speed} / 20`;
    $('overview-mouse-accel').textContent = restored.acceleration ? 'Enabled' : 'Off';
    undoMouse = null;
    $('mouse-undo').hidden = true;
    setNotice('mouse-notice', 'Previous pointer settings restored.', 'success');
  } catch (error) { setNotice('mouse-notice', error.message, 'error'); }
  finally { $('mouse-undo').disabled = false; }
});
$('power-button').addEventListener('click', () => {
  const profile = /performance/i.test($('power-current').textContent) ? 'balanced' : 'performance';
  reviewChange(`Switch to ${profile} mode?`, profile === 'performance' ? 'This can increase power use and heat. You can restore the previous profile from this panel.' : 'This returns the device to its balanced power profile. You can restore the previous profile from this panel.', async () => {
  $('power-button').disabled = true;
  setNotice('power-notice', 'Updating power profile…');
  try {
    const previous = /performance/i.test($('power-current').textContent) ? 'performance' : 'balanced';
    const result = await window.wyre.setPowerProfile(profile);
    undoPower = previous;
    $('power-undo').hidden = false;
    $('power-current').textContent = result.current;
    $('power-button').innerHTML = profile === 'performance' ? 'SET BALANCED <span>↗</span>' : 'PERFORMANCE MODE <span>↗</span>';
    setNotice('power-notice', `Power profile set to ${profile}.`, 'success');
  } catch (error) { setNotice('power-notice', error.message, 'error'); }
  finally { $('power-button').disabled = false; }
  });
});
$('power-undo').addEventListener('click', async () => {
  if (!undoPower) return;
  $('power-undo').disabled = true;
  try {
    const result = await window.wyre.setPowerProfile(undoPower);
    $('power-current').textContent = result.current;
    $('power-button').innerHTML = /performance/i.test(result.current) ? 'SET BALANCED <span>↗</span>' : 'PERFORMANCE MODE <span>↗</span>';
    undoPower = null;
    $('power-undo').hidden = true;
    setNotice('power-notice', 'Previous power profile restored.', 'success');
  } catch (error) { setNotice('power-notice', error.message, 'error'); }
  finally { $('power-undo').disabled = false; }
});
$('storage-scan').addEventListener('click', async () => {
  const button = $('storage-scan');
  button.disabled = true;
  $('storage-status').textContent = 'Choose a folder. Wyre is scanning its files…';
  $('storage-summary').hidden = true;
  try {
    const result = await window.wyre.scanStorage();
    if (result.canceled) {
      $('storage-status').textContent = 'Scan canceled.';
      return;
    }
    $('storage-root').textContent = result.root;
    $('storage-status').textContent = `Scanned ${result.scannedFiles.toLocaleString()} files${result.skipped ? ` · skipped ${result.skipped.toLocaleString()} inaccessible items` : ''}${result.limited ? ' · scan reached its safety limit' : ''}.`;
    $('storage-summary').textContent = `${formatBytes(result.scannedBytes)} in scanned files`;
    $('storage-summary').hidden = false;
    const list = $('storage-list');
    list.replaceChildren();
    if (!result.largest.length) {
      const empty = document.createElement('li');
      empty.className = 'empty-result';
      empty.textContent = 'No files were found in this folder.';
      list.append(empty);
    }
    for (const file of result.largest) {
      const row = document.createElement('li');
      const info = document.createElement('div');
      const name = document.createElement('b');
      const filePath = document.createElement('small');
      const size = document.createElement('span');
      name.textContent = file.path.split(/[\\/]/).pop();
      filePath.textContent = file.path;
      size.textContent = formatBytes(file.size);
      info.append(name, filePath);
      row.append(info, size);
      list.append(row);
    }
  } catch (error) {
    $('storage-status').textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

$('cleanup-scan').addEventListener('click', async () => {
  const button = $('cleanup-scan');
  button.disabled = true;
  $('cleanup-status').textContent = 'Scanning supported cleanup locations…';
  $('cleanup-metrics').hidden = true;
  try {
    const result = await window.wyre.scanCleanup();
    $('cleanup-recommended').textContent = formatBytes(result.recommendedBytes);
    $('cleanup-total').textContent = formatBytes(result.reclaimableBytes);
    $('cleanup-metrics').hidden = false;
    $('cleanup-status').textContent = `${result.rules.length.toLocaleString()} cleanup categories found. No files changed.`;
    const list = $('cleanup-list');
    list.replaceChildren();
    const candidates = [...result.rules].sort((a, b) => b.bytes - a.bytes).slice(0, 12);
    if (!candidates.length) {
      const empty = document.createElement('li');
      empty.className = 'empty-result';
      empty.textContent = 'No cleanup candidates were found.';
      list.append(empty);
    }
    for (const candidate of candidates) {
      const row = document.createElement('li');
      const label = document.createElement('div');
      const group = document.createElement('b');
      const detail = document.createElement('small');
      const size = document.createElement('span');
      group.textContent = String(candidate.group).replace(/([A-Z])/g, ' $1').replaceAll('_', ' ').trim();
      detail.textContent = `${candidate.recommendedSelected ? 'Recommended' : 'Optional'} · ${candidate.risk}${candidate.requiresAppClose ? ' · close app first' : ''}`;
      size.textContent = formatBytes(candidate.bytes);
      label.append(group, detail);
      row.append(label, size);
      list.append(row);
    }
  } catch (error) {
    $('cleanup-status').textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unit = -1;
  do { value /= 1024; unit++; } while (value >= 1024 && unit < units.length - 1);
  return `${value.toFixed(1)} ${units[unit]}`;
}

function updateClock() { $('clock').textContent = new Intl.DateTimeFormat([], { hour: '2-digit', minute: '2-digit' }).format(new Date()); }
updateClock();
setInterval(updateClock, 30_000);
window.wyre.getSystemState().then(paintState).catch(error => { $('os-label').textContent = 'SYSTEM UNAVAILABLE'; setNotice('power-notice', error.message, 'error'); });
setInterval(() => window.wyre.getSystemState().then(paintState).catch(() => {}), 2500);
