import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// Start internal backend database & websocket server if running standalone
async function ensureBackendServer() {
  try {
    const isRunning = await new Promise((resolve) => {
      const req = http.get('http://127.0.0.1:3001/api/health', (res) => {
        resolve(res.statusCode === 200);
      });
      req.on('error', () => resolve(false));
      req.setTimeout(800, () => {
        req.destroy();
        resolve(false);
      });
    });

    if (!isRunning) {
      console.log('🚀 Starting embedded Karuna POS Server on port 3001...');
      try {
        await import('../server/server.js');
        console.log('✅ Embedded POS Server active on port 3001.');
      } catch (serverErr) {
        console.warn('⚠️ Server auto-start notice:', serverErr.message);
      }
    } else {
      console.log('🔗 External POS Server already active on port 3001.');
    }
  } catch (err) {
    console.error('Server check error:', err);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 1024,
    minHeight: 600,
    title: 'Karuna Hotel POS & ERP Suite',
    icon: path.join(__dirname, '../public/favicon.ico'),
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      devTools: false
    }
  });

  // Sleek standalone desktop software feel without default browser menu
  mainWindow.setMenuBarVisibility(false);

  // Block opening DevTools
  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow.webContents.closeDevTools();
  });

  const indexPath = path.join(__dirname, '../dist/index.html');

  // Load local production build directly (100% offline independent)
  if (fs.existsSync(indexPath) && !process.env.VITE_DEV) {
    mainWindow.loadFile(indexPath);
  } else if (process.env.POS_APP_URL) {
    mainWindow.loadURL(process.env.POS_APP_URL);
  } else {
    mainWindow.loadURL('http://127.0.0.1:5173');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(async () => {
  await ensureBackendServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Native IPC Handlers
ipcMain.handle('app:get-version', () => app.getVersion());
ipcMain.handle('app:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});
ipcMain.handle('app:toggle-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  }
});
ipcMain.handle('app:close', () => {
  if (mainWindow) mainWindow.close();
});
ipcMain.handle('app:get-server-ip', () => {
  const configFile = path.join(__dirname, '../server_config.json');
  if (fs.existsSync(configFile)) {
    try {
      const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
      if (config.serverIp) return config.serverIp;
    } catch (e) {}
  }
  return process.env.MASTER_SERVER_IP || '10.40.145.195';
});
ipcMain.handle('app:print-receipt', async (event, options) => {
  if (!mainWindow) return { success: false, error: 'Window not found' };
  try {
    mainWindow.webContents.print({
      silent: options?.silent || false,
      printBackground: true,
      deviceName: options?.deviceName || ''
    }, (success, failureReason) => {
      console.log('Print result:', success, failureReason);
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
