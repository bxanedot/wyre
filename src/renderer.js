const $ = id => document.getElementById(id);
const pages = ['overview', 'network', 'mouse'];
let state;
let acceleration = true;

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

function recommendation(result) {
  if (result.loss) return ['Some requests did not arrive.', 'Check Wi-Fi signal or router placement, then run the check again.'];
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
$('mouse-apply').addEventListener('click', async () => {
  $('mouse-apply').disabled = true;
  setNotice('mouse-notice', 'Applying system settings…');
  try {
    const result = await window.wyre.applyMouse({ speed: Number($('mouse-speed').value), acceleration });
    setNotice('mouse-notice', 'Pointer settings applied.', 'success');
    $('overview-mouse-speed').textContent = `${result.speed} / 20`;
    $('overview-mouse-accel').textContent = acceleration ? 'Enabled' : 'Off';
  } catch (error) { setNotice('mouse-notice', error.message, 'error'); }
  finally { $('mouse-apply').disabled = false; }
});
$('power-button').addEventListener('click', async () => {
  const profile = /performance/i.test($('power-current').textContent) ? 'balanced' : 'performance';
  $('power-button').disabled = true;
  setNotice('power-notice', 'Updating power profile…');
  try {
    const result = await window.wyre.setPowerProfile(profile);
    $('power-current').textContent = result.current;
    $('power-button').innerHTML = profile === 'performance' ? 'SET BALANCED <span>↗</span>' : 'PERFORMANCE MODE <span>↗</span>';
    setNotice('power-notice', `Power profile set to ${profile}.`, 'success');
  } catch (error) { setNotice('power-notice', error.message, 'error'); }
  finally { $('power-button').disabled = false; }
});

function updateClock() { $('clock').textContent = new Intl.DateTimeFormat([], { hour: '2-digit', minute: '2-digit' }).format(new Date()); }
updateClock();
setInterval(updateClock, 30_000);
window.wyre.getSystemState().then(paintState).catch(error => { $('os-label').textContent = 'SYSTEM UNAVAILABLE'; setNotice('power-notice', error.message, 'error'); });
setInterval(() => window.wyre.getSystemState().then(paintState).catch(() => {}), 2500);
