/* eslint-disable typescript/no-require-imports */
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('wordnestDesktop', {
  isDesktop: true,
  speak: (text) => ipcRenderer.invoke('wordnest:speak', text),
  onImport(callback) {
    const listener = () => callback();
    ipcRenderer.on('wordnest:import', listener);
    return () => ipcRenderer.removeListener('wordnest:import', listener);
  },
});
