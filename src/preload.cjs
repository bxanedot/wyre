const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('wyre', {
  getSystemState: () => ipcRenderer.invoke('system:state'),
  applyMouse: settings => ipcRenderer.invoke('mouse:apply', settings),
  setPowerProfile: profile => ipcRenderer.invoke('power:set', profile),
  testNetwork: () => ipcRenderer.invoke('network:test'),
  scanStorage: () => ipcRenderer.invoke('storage:scan'),
  scanCleanup: () => ipcRenderer.invoke('cleanup:scan')
});
