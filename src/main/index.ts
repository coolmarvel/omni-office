import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron';
import { join } from 'path';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync, readFileSync, writeFileSync } from 'fs';

let mainWindow: BrowserWindow | null = null;

function getRecentFileStorePath(): string {
  const userData = app.getPath('userData');
  return join(userData, 'recent_docs.json');
}

function loadRecentDocs(): any[] {
  try {
    const p = getRecentFileStorePath();
    if (existsSync(p)) {
      return JSON.parse(readFileSync(p, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load recent docs:', e);
  }
  return [];
}

function saveRecentDoc(doc: { filePath: string; fileName: string; docType: string }) {
  try {
    const list = loadRecentDocs().filter((d) => d.filePath !== doc.filePath);
    list.unshift({ ...doc, openedAt: new Date().toISOString() });
    const p = getRecentFileStorePath();
    writeFileSync(p, JSON.stringify(list.slice(0, 20), null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save recent doc:', e);
  }
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1024,
    minHeight: 680,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    title: 'Omni Office',
    icon: app.isPackaged ? join(process.resourcesPath, 'icon.png') : join(__dirname, '../../build/icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
    },
  });

  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    console.log(`[Renderer Console Level ${level}] ${message} (${sourceId}:${line})`);
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error(`[Load Error] Code: ${errorCode}, Desc: ${errorDescription}, URL: ${validatedURL}`);
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ── IPC API 구현 ──────────────────────────────────────────

// 네이티브 파일 열기 다이얼로그
ipcMain.handle('fs:openFileDialog', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '문서 열기 (한글 HWP/HWPX, 엑셀 XLSX)',
    properties: ['openFile'],
    filters: [
      { name: '모든 지원 문서 (*.hwp, *.hwpx, *.xlsx, *.docx, *.csv)', extensions: ['hwp', 'hwpx', 'xlsx', 'docx', 'csv'] },
      { name: '한글 문서 (*.hwp, *.hwpx)', extensions: ['hwp', 'hwpx'] },
      { name: '스프레드시트 (*.xlsx, *.csv)', extensions: ['xlsx', 'csv'] },
      { name: '워드 문서 (*.docx)', extensions: ['docx'] },
      { name: '모든 파일 (*.*)', extensions: ['*'] },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) return null;

  const filePath = result.filePaths[0];
  const fileName = filePath.split(/[\\/]/).pop() || 'document';
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  let docType = 'hwp';
  if (ext === 'xlsx' || ext === 'csv') docType = 'xlsx';
  else if (ext === 'docx') docType = 'docx';
  else if (ext === 'hwp' || ext === 'hwpx') docType = ext;

  const buffer = await readFile(filePath);
  saveRecentDoc({ filePath, fileName, docType });

  return {
    filePath,
    fileName,
    docType,
    size: buffer.length,
    data: buffer.toString('base64'),
  };
});

// 네이티브 파일 저장 다이얼로그
ipcMain.handle('fs:saveFileDialog', async (_e, { defaultName, docType, data }) => {
  if (!mainWindow) return null;
  const ext = docType === 'xlsx' ? 'xlsx' : 'hwp';
  const result = await dialog.showSaveDialog(mainWindow, {
    title: '문서 다른 이름으로 저장',
    defaultPath: defaultName || `문서.${ext}`,
    filters: [
      { name: docType === 'xlsx' ? 'Excel 통합 문서 (*.xlsx)' : '한글 문서 (*.hwp)', extensions: [ext] },
      { name: '모든 파일 (*.*)', extensions: ['*'] },
    ],
  });

  if (result.canceled || !result.filePath) return null;

  const buf = Buffer.from(data, 'base64');
  await writeFile(result.filePath, buf);

  const fileName = result.filePath.split(/[\\/]/).pop() || defaultName;
  saveRecentDoc({ filePath: result.filePath, fileName, docType });

  return { filePath: result.filePath, fileName };
});

// 직접 파일 저장 (덮어쓰기)
ipcMain.handle('fs:saveFileDirect', async (_e, { filePath, data }) => {
  const buf = Buffer.from(data, 'base64');
  await writeFile(filePath, buf);
  return true;
});

// 최근 문서 목록 조회
ipcMain.handle('recent:getList', async () => {
  return loadRecentDocs();
});

// 인쇄
ipcMain.handle('app:print', async () => {
  if (!mainWindow) return;
  mainWindow.webContents.print({ silent: false, printBackground: true });
});

// 창 제어
ipcMain.handle('window:minimize', () => mainWindow?.minimize());
ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.handle('window:close', () => mainWindow?.close());
