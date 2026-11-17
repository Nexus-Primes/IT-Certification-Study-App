'use strict';
// Takes the README screenshots from the real app on a throwaway data folder with a little
// made-up practice history. Usage: node desktop/tests/e2e/screenshots.js
const fs = require('fs');
const path = require('path');
const { launchApp, sleep } = require('./launch');

(async () => {
  const out = path.join(__dirname, '..', '..', '..', 'docs', 'screenshots');
  fs.mkdirSync(out, { recursive: true });
  const app = await launchApp();
  try {
    await app.waitFor("document.querySelector('main') && document.body.innerText.length > 200");
    // Skip the first-run walkthrough so the screenshots show the real dashboard.
    await app.waitFor("[...document.querySelectorAll('button')].some(b => b.textContent.trim() === 'Skip setup')");
    await app.evaluate("[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Skip setup').click(); true");
    await sleep(800);
    await sleep(500);
    await app.evaluate("document.querySelectorAll('.toast').forEach(t => t.remove()); true");
    await app.send('Page.bringToFront');
    await app.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    const shot = async name => {
      await sleep(900);
      const r = await app.send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(out, name), Buffer.from(r.data, 'base64')); console.log('wrote', name);
    };
    await app.evaluate("location.hash = '#dashboard'"); await app.evaluate("document.querySelectorAll('.toast').forEach(t => t.remove()); true"); await shot('dashboard.png');
    await app.evaluate("location.hash = '#settings'"); await sleep(600);
    await app.evaluate("[...document.querySelectorAll('.settings-tabs button, [role=tab], .chip, button')].find(b => b.textContent.trim() === 'About')?.click(); true"); await sleep(600);
    await app.evaluate("document.querySelector('[data-card=\"desktop\"]')?.scrollIntoView(); true");
    await shot('settings.png');
  } finally { await app.close(); fs.rmSync(app.data, { recursive: true, force: true }); }
})();
