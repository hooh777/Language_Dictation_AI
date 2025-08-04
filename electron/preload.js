const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  saveFileDialog: (defaultPath) => ipcRenderer.invoke('dialog:saveFile', defaultPath),
  
  // Menu events
  onMenuImportVocabulary: (callback) => ipcRenderer.on('menu-import-vocabulary', callback),
  onMenuExportProgress: (callback) => ipcRenderer.on('menu-export-progress', callback),
  onMenuNewSession: (callback) => ipcRenderer.on('menu-new-session', callback),
  onMenuPauseSession: (callback) => ipcRenderer.on('menu-pause-session', callback),
  onMenuEndSession: (callback) => ipcRenderer.on('menu-end-session', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // Platform detection
  platform: process.platform,
  
  // App info
  getVersion: () => ipcRenderer.invoke('app:getVersion')
});

// Expose a limited API for the app
contextBridge.exposeInMainWorld('dictationApp', {
  isElectron: true,
  platform: process.platform,
  
  // Enhanced file operations for desktop
  importVocabularyFile: async () => {
    try {
      const filePath = await ipcRenderer.invoke('dialog:openFile');
      return filePath;
    } catch (error) {
      console.error('Failed to open file dialog:', error);
      return null;
    }
  },
  
  // Enhanced export capabilities
  exportProgress: async (data, filename = 'progress-export.json') => {
    try {
      const filePath = await ipcRenderer.invoke('dialog:saveFile', filename);
      if (filePath) {
        // The web app will handle the actual file writing using File System API
        return filePath;
      }
      return null;
    } catch (error) {
      console.error('Failed to save file:', error);
      return null;
    }
  }
});
