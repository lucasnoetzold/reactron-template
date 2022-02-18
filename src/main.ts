const { app, BrowserWindow } = require('electron')

const DEV_MODE = !app.isPackaged
const DEBUG = DEV_MODE
//const DEBUG = true

app.on('window-all-closed', app.quit)

app.on('ready', function () {

  const mainWindow = new BrowserWindow({
    icon: "web/favicon.png",
    webPreferences: {
      devTools: DEBUG,
      contextIsolation: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true
    }
  });

  if (DEV_MODE) {
    mainWindow.loadURL("http://localhost:3000")
  } else {
    mainWindow.loadFile("index.html")
  }

  if (DEBUG)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
})