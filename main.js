const { app, BrowserWindow, Menu, globalShortcut } = require('electron');
const { menu } = require('./app/menu');
const { isDev, isMac } = require('./app/envVariables');

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'ImageShrink',
    width: 500,
    height: 600,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: isDev,
    backgroundColor: '#ffffff',
  });

  //Change default Menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  //register custom global shortcuts
  globalShortcut.register('CmdOrCtrl+R', () => mainWindow.reload());
  globalShortcut.register(isMac ? 'Command+Alt+I' : 'Ctrl+Shift+I', () =>
    mainWindow.toggleDevTools()
  );

  //   mainWindow.loadURL(`file://${__dirname}/app/index.html`);
  mainWindow.loadFile(`${__dirname}/app/index.html`);
}

app.on('ready', () => {
  createMainWindow();
  mainWindow.on('closed', () => (mainWindow = null));
});

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows.length === 0) {
    createMainWindow();
  }
});
