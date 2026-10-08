import { app, BrowserWindow, ipcMain, Menu, MenuItem } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

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
      devTools: true
    }
  });

  // Sleek standalone desktop software feel without default browser menu
  mainWindow.setMenuBarVisibility(false);

  // Enable F12, Ctrl+Shift+I, Ctrl+Shift+J to toggle Developer Tools & Console
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (
      input.key === 'F12' ||
      (input.control && input.shift && ['i', 'j', 'c'].includes(input.key.toLowerCase()))
    ) {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  // Enable Right-Click context menu to Inspect Element & View Console
  mainWindow.webContents.on('context-menu', (e, params) => {
    const contextMenu = new Menu();
    contextMenu.append(new MenuItem({
      label: 'Inspect Element & Open Console',
      click: () => {
        mainWindow.webContents.inspectElement(params.x, params.y);
        if (!mainWindow.webContents.isDevToolsOpened()) {
          mainWindow.webContents.openDevTools();
        }
      }
    }));
    contextMenu.append(new MenuItem({
      label: 'Toggle Developer Tools',
      click: () => {
        mainWindow.webContents.toggleDevTools();
      }
    }));
    contextMenu.popup();
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
  if (process.env.MASTER_SERVER_IP && process.env.MASTER_SERVER_IP !== '10.40.145.195') {
    return process.env.MASTER_SERVER_IP;
  }
  const configFile = path.join(__dirname, '../server_config.json');
  if (fs.existsSync(configFile)) {
    try {
      const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
      if (config.isServer) return '127.0.0.1';
      if (config.serverIp && config.serverIp !== '10.40.145.195') return config.serverIp;
    } catch (e) {}
  }
  return '127.0.0.1';
});
ipcMain.handle('app:set-server-ip', (event, newIp) => {
  if (!newIp) return false;
  const cleanIp = newIp.trim();
  const configFile = path.join(__dirname, '../server_config.json');
  try {
    let config = { isServer: false, serverIp: cleanIp, port: 3001 };
    if (fs.existsSync(configFile)) {
      try { config = { ...config, ...JSON.parse(fs.readFileSync(configFile, 'utf-8')) }; } catch (e) {}
    }
    config.serverIp = cleanIp;
    config.isServer = (cleanIp === 'localhost' || cleanIp === '127.0.0.1');
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to save server_config.json:', err);
    return false;
  }
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
ipcMain.handle('app:toggle-devtools', () => {
  if (mainWindow) mainWindow.webContents.toggleDevTools();
  return true;
});
ipcMain.handle('app:open-devtools', () => {
  if (mainWindow) mainWindow.webContents.openDevTools();
  return true;
});
