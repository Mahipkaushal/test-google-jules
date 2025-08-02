const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');

let splash;
let loginWindow;
let mainWindow;
let tray;
let minimizedWindow;

function createSplashWindow() {
  splash = new BrowserWindow({
    width: 500,
    height: 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true
  });

  splash.loadFile('src/splash.html');
}

function createLoginWindow() {
  loginWindow = new BrowserWindow({
    width: 400,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  loginWindow.loadFile('src/login.html');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js') // We will deal with this later
    }
  });

  mainWindow.loadFile('src/index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createMinimizedWindow() {
  minimizedWindow = new BrowserWindow({
    width: 250,
    height: 300,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  minimizedWindow.loadFile('src/minimized.html');

  minimizedWindow.on('blur', () => {
    if (!minimizedWindow.webContents.isDevToolsOpened()) {
      minimizedWindow.hide();
    }
  });
}

app.whenReady().then(() => {
  createSplashWindow();
  setTimeout(() => {
    splash.close();
    createLoginWindow();
  }, 3000);

  tray = new Tray(path.join(__dirname, 'assets/icon.png'));
  tray.setToolTip('Activity Tracker');

  tray.on('click', () => {
    if (minimizedWindow.isVisible()) {
      minimizedWindow.hide();
    } else {
      const { x, y } = tray.getBounds();
      const { width, height } = minimizedWindow.getBounds();
      minimizedWindow.setPosition(x - width / 2, y - height);
      minimizedWindow.show();
    }
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

ipcMain.on('login-successful', () => {
  loginWindow.close();
  createWindow();
  createMinimizedWindow();
});

let isTracking = false;

ipcMain.on('start-tracking', () => {
  isTracking = true;
  // LLM INTEGRATION: Notify LLM that user has started their workday.
  console.log('LLM: User started workday');
  mainWindow.webContents.send('tracking-started');
  minimizedWindow.webContents.send('tracking-started');
});

ipcMain.on('stop-tracking', () => {
  isTracking = false;
  // LLM INTEGRATION: Notify LLM that user has stopped their workday.
  console.log('LLM: User stopped workday');
  mainWindow.webContents.send('tracking-stopped');
  minimizedWindow.webContents.send('tracking-stopped');
});

ipcMain.on('open-main-window', () => {
  if (mainWindow) {
    mainWindow.show();
  }
});

ipcMain.on('take-break', (event, breakInfo) => {
  console.log('Break taken:', breakInfo);
});

ipcMain.on('update-tasks', (event, tasks) => {
  console.log('Tasks updated:', tasks);
  // LLM INTEGRATION: Notify LLM about the user's tasks for the day.
  console.log('LLM: User tasks updated');
});

// LLM INTEGRATION: Hourly check for task changes/additions.
setInterval(() => {
  if (isTracking) {
    // This is where you would trigger the LLM to check for new tasks.
    console.log('LLM: Hourly check for task updates');
  }
}, 1000 * 60 * 60); // Every hour

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
