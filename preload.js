const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  uploadPhoto: (filename, arrayBuffer, scope) =>
    ipcRenderer.invoke('photos:upload', { filename, buffer: arrayBuffer, scope: scope || 'journal' }),
  deletePhoto: (filename) => ipcRenderer.invoke('photos:delete', filename),
  saveDb: (jsonString) => ipcRenderer.invoke('db:save', jsonString),
  exportDb: (jsonString) => ipcRenderer.invoke('db:export', jsonString),
  importExchange: () => ipcRenderer.invoke('db:importExchange'),
  loadDb: () => ipcRenderer.invoke('db:load'),
  openHelp: (filename) => ipcRenderer.invoke('help:open', filename),
  refocusWindow: () => ipcRenderer.invoke('window:refocus'),
});
