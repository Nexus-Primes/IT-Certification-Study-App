'use strict';
// Real-app checks for the native additions: Add files to the shelf, Back up everything, and that
// the web-flavoured wording is gone. The native pickers are replaced by test environment variables.
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { launchApp, sleep } = require('./launch');

(async () => {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'certstudy-sb-'));
  const picked = path.join(scratch, 'Vendor Guide.pdf'); fs.writeFileSync(picked, '%PDF-1.4 test');
  const dest = path.join(scratch, 'usb'); fs.mkdirSync(dest);
  const app = await launchApp({ env: { CERT_STUDY_TEST_PICK_FILES: JSON.stringify([picked]), CERT_STUDY_TEST_BACKUP_DIR: dest } });
  const ok = n => console.log('  ok   ' + n);
  try {
    await app.waitFor("typeof window.certStudyDesktop === 'object'");
    await app.evaluate("[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Skip setup')?.click(); true");
    await sleep(1500); // let start-up finish before moving around
    await app.evaluate("location.hash = '#shelf'");
    await app.waitFor("document.querySelector('[data-sh=\"add-files\"]')");
    const page = await app.evaluate("document.querySelector('#sh-root').innerText");
    assert.match(page, /Add files/); assert.match(page, /Open files folder/); assert.match(page, /Your shelf is empty/);
    assert.ok(!/server\.py|study server|inside the study app/i.test(page));
    ok('the Document shelf shows Add files / Open files folder and native wording (no server.py or folder instructions)');
    await app.evaluate("document.querySelector('[data-sh=\"add-files\"]').click(); true", { userGesture: true });
    await app.waitFor("document.querySelector('#sh-list') && document.querySelector('#sh-list').innerText.includes('Vendor Guide.pdf')");
    ok('"Add files" copies the chosen PDF into the shelf and lists it right away');
    assert.ok(fs.existsSync(path.join(app.data, 'files', 'Vendor Guide.pdf'))); assert.ok(fs.existsSync(picked));
    ok('the copy is in the data folder and the original is untouched');
    assert.equal(await app.evaluate("fetch('/files/Vendor%20Guide.pdf').then(r => r.status)"), 200);
    ok('the added file is served to the page');
    // Drop path: the validated IPC used for dragged files.
    const dropped = path.join(scratch, 'Dropped.txt'); fs.writeFileSync(dropped, 'hi');
    const r = await app.evaluate(`window.certStudyDesktop.addShelfPaths(${JSON.stringify([dropped, 'relative.txt'])})`);
    assert.deepEqual(r.added, ['Dropped.txt']); assert.equal(r.skipped.length, 1);
    ok('dropped files are added and an invalid path is refused');
    // Back up everything.
    await app.evaluate("fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'x', value: 1 }) })");
    await app.evaluate("location.hash = '#settings'"); await sleep(500);
    await app.evaluate("[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'About')?.click(); true"); await sleep(400);
    await app.waitFor("document.querySelector('[data-action=\"desktop-backup-everything\"]')");
    await app.evaluate("document.querySelector('[data-action=\"desktop-backup-everything\"]').click(); true", { userGesture: true });
    await app.waitFor("[...document.querySelectorAll('.toast')].some(t => /Backed up/.test(t.innerText))");
    const folders = fs.readdirSync(dest);
    assert.equal(folders.length, 1); assert.match(folders[0], /^Cert Study backup \d{8}-\d{6}$/);
    const copy = path.join(dest, folders[0]);
    assert.ok(fs.existsSync(path.join(copy, 'data', 'progress.json'))); assert.ok(fs.existsSync(path.join(copy, 'files', 'Vendor Guide.pdf')));
    ok('"Back up everything" writes a dated folder with the progress file and the shelf');
    const intro = await app.evaluate("document.querySelector('.section-head p').innerText");
    assert.ok(!/local server/.test(intro)); ok('the Settings intro no longer talks about a local server');
    const errors = app.consoleErrors().filter(e => !/favicon|Autofill/.test(e));
    assert.deepEqual(errors, []); ok('no console errors');
  } catch (err) { console.error('FAILED:', err.message); console.error(app.getLog().slice(-800)); process.exitCode = 1; }
  finally { await app.close(); fs.rmSync(app.data, { recursive: true, force: true }); fs.rmSync(scratch, { recursive: true, force: true }); }
})();
