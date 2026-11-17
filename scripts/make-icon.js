'use strict';
// Renders assets/icon.svg to build/icon.png (512x512) using Electron itself, so no image
// library is needed. electron-builder turns the PNG into the Windows .ico at build time.
//   npx electron scripts/make-icon.js
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

app.whenReady().then(async () => {
  const svg = fs.readFileSync(path.join(__dirname, '..', 'assets', 'icon.svg'), 'utf8');
  const win = new BrowserWindow({ width: 512, height: 512, show: false, useContentSize: true, transparent: true, frame: false, webPreferences: { offscreen: true } });
  await win.loadURL('data:text/html,' + encodeURIComponent(`<html><body style="margin:0;background:transparent">${svg.replace('<svg ', '<svg width="512" height="512" ')}</body></html>`));
  await new Promise(r => setTimeout(r, 400));
  const image = await win.webContents.capturePage({ x: 0, y: 0, width: 512, height: 512 });
  fs.writeFileSync(path.join(__dirname, '..', 'build', 'icon.png'), image.toPNG());
  console.log('wrote build/icon.png', image.getSize());
  app.quit();
});
