'use strict';
// The only door between the page and the desktop shell. It exposes a few named actions, nothing
// else: no Node, no file paths from the page, no generic "send anything" channel.
const { contextBridge, ipcRenderer, webUtils } = require('electron');

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
  openFilesFolder: invoke('desktop:open-files-folder'),
  addShelfFiles: invoke('desktop:add-shelf-files'),            // native file picker, copies into the shelf
  addShelfPaths: invoke('desktop:add-shelf-paths'),            // files dropped on the window
  pathsForFiles: files => Array.from(files || []).map(f => { try { return webUtils.getPathForFile(f); } catch { return ''; } }).filter(Boolean),
  backupEverything: invoke('desktop:backup-everything'),
  onMenu(callback) {
    if (typeof callback !== 'function') return () => {};
    const listener = (_event, action) => callback(action);
    ipcRenderer.on('desktop:menu', listener);
    return () => ipcRenderer.removeListener('desktop:menu', listener);
  },
  openReleaseNotes: invoke('desktop:open-release-notes'),
  onUpdateState(callback) {
    if (typeof callback !== 'function') return () => {};
    const listener = (_event, state) => callback(state);
    ipcRenderer.on('update:state-changed', listener);
    return () => ipcRenderer.removeListener('update:state-changed', listener);
  }
});
