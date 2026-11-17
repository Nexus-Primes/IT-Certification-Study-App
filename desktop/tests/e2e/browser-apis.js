'use strict';
// Checks, inside the real desktop window, the browser features the study app relies on.
// Things that open a native dialog (the print dialog, the save-file dialog, the folder picker) cannot
// be clicked from here; those are listed in the output as "not automated".
const assert = require('node:assert/strict');
const fs = require('fs');
const { launchApp } = require('./launch');

(async () => {
  const app = await launchApp();
  const ok = n => console.log('  ok   ' + n);
  try {
    await app.waitFor("document.querySelector('main') && document.body.innerText.length > 200");
    // window.print exists (it opens the native print dialog, which cannot be driven from here, and Electron does not expose Page.printToPDF over DevTools).
    assert.equal(await app.evaluate("typeof window.print"), 'function'); ok('window.print exists for Print and Save as PDF');
    // Clipboard.
    await app.evaluate("document.body.focus(); true");
    const clip = await app.evaluate("navigator.clipboard.writeText('cert-study-test').then(() => 'written', e => 'blocked: ' + e.message)", { userGesture: true }); // the app only copies from a click
    assert.equal(clip, 'written'); ok('copying to the clipboard works');
    // File hashing and text hashing (Tools > Text tools).
    const hash = await app.evaluate("crypto.subtle.digest('SHA-256', new TextEncoder().encode('abc')).then(b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''))");
    assert.equal(hash, 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'); ok('SHA-256 hashing works');
    const fileHash = await app.evaluate("new Blob(['abc']).arrayBuffer().then(b => crypto.subtle.digest('SHA-256', b)).then(b => b.byteLength)");
    assert.equal(fileHash, 32); ok('hashing a file (Blob) works');
    // Sound (timers, answer sounds).
    const audio = await app.evaluate("(() => { const c = new (window.AudioContext || window.webkitAudioContext)(); const o = c.createOscillator(); const g = c.createGain(); o.connect(g); g.connect(c.destination); return c.state + ':' + typeof o.start; })()");
    assert.match(audio, /^(running|suspended):function$/); ok('audio (timer and answer sounds) is available: ' + audio);
    // Notifications.
    const notif = await app.evaluate("typeof Notification + ':' + Notification.permission");
    ok('notifications API present, permission "' + notif.split(':')[1] + '" (the app asks before using it)');
    const perm = await app.evaluate("Notification.requestPermission()");
    ok('notification permission request resolves to "' + perm + '"');
    // Downloads (CSV, ICS, Anki, backup) are Blob + anchor downloads; check the pieces exist and build.
    const blob = await app.evaluate("(() => { const b = new Blob(['a,b\\n1,2'], { type: 'text/csv' }); const u = URL.createObjectURL(b); const ok = u.startsWith('blob:app://cert-study/'); URL.revokeObjectURL(u); return ok; })()");
    assert.equal(blob, true); ok('blob URLs for CSV/ICS/Anki/backup downloads are created on the app origin');
    // External links must not navigate the app window.
    const before = await app.evaluate('location.href');
    await app.evaluate("(() => { const a = document.createElement('a'); a.href = 'https://example.com/'; a.target = '_blank'; a.textContent = 'x'; document.body.appendChild(a); a.click(); a.remove(); })()");
    await new Promise(r => setTimeout(r, 800));
    assert.equal(await app.evaluate('location.href'), before); ok('an external link does not replace the app window (it goes to the default browser)');
    await app.evaluate("location.href = 'https://example.com/'").catch(() => {});
    await new Promise(r => setTimeout(r, 800));
    assert.match(await app.evaluate('location.href'), /^app:\/\/cert-study\//); ok('navigating the window away from the app is blocked');
    // Theme and prefers-color-scheme.
    assert.equal(typeof await app.evaluate("matchMedia('(prefers-color-scheme: dark)').matches"), 'boolean'); ok('theme detection works');
    console.log('\nNot automated (they open native dialogs): the print dialog and "Save as PDF" printer, the save-file dialog for downloads, the folder picker for import, and the OS notification itself.');
  } catch (err) { console.error('FAILED:', err.message); console.error(app.getLog().slice(-800)); process.exitCode = 1; }
  finally { await app.close(); fs.rmSync(app.data, { recursive: true, force: true }); }
})();
