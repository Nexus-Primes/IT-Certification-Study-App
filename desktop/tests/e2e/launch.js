'use strict';
// Starts the real desktop app on a throwaway data folder and drives it over the Chrome DevTools
// protocol (no extra dependencies). Used by the smoke and updater end-to-end scripts.
const { spawn } = require('child_process');
const net = require('net');
const path = require('path');
const fs = require('fs');
const os = require('os');

const APP_ROOT = path.resolve(__dirname, '..', '..', '..');

function freePort() {
  return new Promise(resolve => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); }); });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function launchApp({ dataDir, env = {}, exe, args = [] } = {}) {
  const data = dataDir || fs.mkdtempSync(path.join(os.tmpdir(), 'certstudy-e2e-'));
  const port = await freePort();
  const electron = exe || require('electron');
  const child = spawn(electron, [...(exe ? [] : [APP_ROOT]), `--remote-debugging-port=${port}`, ...args], {
    env: { ...process.env, ELECTRON_ENABLE_LOGGING: '0', CERT_STUDY_DATA_DIR: data, ...env }, stdio: ['ignore', 'pipe', 'pipe']
  });
  let log = ''; child.stdout.on('data', d => { log += d; }); child.stderr.on('data', d => { log += d; });
  let target = null;
  for (let i = 0; i < 150 && !target; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      target = list.find(t => t.type === 'page' && t.url.startsWith('app://cert-study'));
    } catch { /* not up yet */ }
    if (!target) await sleep(200);
  }
  if (!target) { child.kill(); throw new Error('app window did not appear. Log:\n' + log); }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map(); const events = [];
  ws.onmessage = msg => {
    const data = JSON.parse(msg.data);
    if (data.id && pending.has(data.id)) { const { res, rej } = pending.get(data.id); pending.delete(data.id); data.error ? rej(new Error(data.error.message)) : res(data.result); }
    else if (data.method) events.push(data);
  };
  const send = (method, params = {}) => new Promise((res, rej) => { const n = ++id; pending.set(n, { res, rej }); ws.send(JSON.stringify({ id: n, method, params })); });
  await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
  const evaluate = async (expression, { userGesture = false } = {}) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception ? r.exceptionDetails.exception.description : r.exceptionDetails.text);
    return r.result.value;
  };
  const waitFor = async (expression, { timeout = 20000, interval = 150 } = {}) => {
    const end = Date.now() + timeout; let last;
    while (Date.now() < end) { try { last = await evaluate(expression); if (last) return last; } catch { /* page reloading */ } await sleep(interval); }
    throw new Error('timed out waiting for: ' + expression + ' (last: ' + JSON.stringify(last) + ')');
  };
  const consoleErrors = () => events.filter(e => (e.method === 'Runtime.exceptionThrown') || (e.method === 'Runtime.consoleAPICalled' && e.params.type === 'error') || (e.method === 'Log.entryAdded' && e.params.entry.level === 'error')).map(e => JSON.stringify(e.params).slice(0, 300));
  const close = async () => { try { ws.close(); } catch { /* closed */ } child.kill(); await sleep(300); };
  return { events, data, port, send, evaluate, waitFor, consoleErrors, close, child, getLog: () => log };
}
module.exports = { launchApp, sleep, APP_ROOT };
