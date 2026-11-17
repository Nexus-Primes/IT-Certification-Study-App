'use strict';
// The only door between the page and the desktop shell. It exposes a few named actions, nothing
// else: no Node, no file paths from the page, no generic "send anything" channel.
const { contextBridge, ipcRenderer } = require('electron');

const invoke = channel => (...args) => ipcRenderer.invoke(channel, ...args);

contextBridge.exposeInMainWorld('certStudyDesktop', {
  isDesktop: true,
  getInfo: invoke('desktop:info'),                 // { version, platform, dataFolderName, firstRun, importOfferDismissed }
  getUpdateState: invoke('update:state'),
  checkForUpdates: invoke('update:check'),
  downloadUpdate: invoke('update:download'),
  cancelDownload: invoke('update:cancel'),
  installUpdate: invoke('update:install'),
  setAutoCheck: invoke('update:set-auto-check'),
  setInstallOnQuit: invoke('update:set-install-on-quit'),
  openDataFolder: invoke('desktop:open-data-folder'),
  importExistingData: invoke('desktop:import-data'),
  dismissImportOffer: invoke('desktop:dismiss-import-offer'),
  openReleaseNotes: invoke('desktop:open-release-notes'),
  onUpdateState(callback) {
    if (typeof callback !== 'function') return () => {};
    const listener = (_event, state) => callback(state);
    ipcRenderer.on('update:state-changed', listener);
    return () => ipcRenderer.removeListener('update:state-changed', listener);
  }
});
