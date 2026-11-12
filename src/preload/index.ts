import { contextBridge, ipcRenderer } from 'electron';

export interface ElectronApi {
  openFileDialog: () => Promise<{
    filePath: string;
    fileName: string;
    docType: string;
    size: number;
    data: string;
  } | null>;
  saveFileDialog: (opts: { defaultName: string; docType: string; data: string }) => Promise<{ filePath: string; fileName: string } | null>;
  saveFileDirect: (opts: { filePath: string; data: string }) => Promise<boolean>;
  getRecentList: () => Promise<
    Array<{
      filePath: string;
      fileName: string;
      docType: string;
      openedAt: string;
    }>
  >;
  print: () => Promise<void>;
  exportPdf: () => Promise<string | null>;
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
}

const api: ElectronApi = {
  openFileDialog: () => ipcRenderer.invoke('fs:openFileDialog'),
  saveFileDialog: (opts) => ipcRenderer.invoke('fs:saveFileDialog', opts),
  saveFileDirect: (opts) => ipcRenderer.invoke('fs:saveFileDirect', opts),
  getRecentList: () => ipcRenderer.invoke('recent:getList'),
  print: () => ipcRenderer.invoke('app:print'),
  exportPdf: () => ipcRenderer.invoke('app:exportPdf'),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
};

contextBridge.exposeInMainWorld('electronAPI', api);
