const { app, BrowserWindow, ipcMain } = require('electron')
//require('@electron/remote/main').initialize()
const path = require('path')
let win
const createWindow = direccion => {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1100,
    minHeight: 600,
    backgroundColor: '#fff',
    show: true,
    icon: path.join(__dirname, 'assets/icons/win/icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      worldSafeExecuteJavaScript: false,
      contextIsolation: false
    }
  })
  win.loadURL(direccion)
  win.setMenu(null);
  win.on('closed', () => { win = null })
}
app.on('ready', () => { createWindow(`file://${__dirname}/index.html`) })
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});
app.on('activate', () => {
  if (win === null) {
    createWindow(`file://${__dirname}/index.html`)
  }
});
if (process.env.NODE_ENV !== 'production') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
  })
}
ipcMain.on('dev', (event, arg) => { win.webContents.openDevTools() })
ipcMain.on('info', (event, arg) => { createWindow("https://github.com/pablolusarreta/acordes-guitarra-graficos/blob/master/README.md") })