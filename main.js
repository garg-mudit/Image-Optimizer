const path = require('path');
const os = require('os');

const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const slash = require('slash');
const log = require('electron-log');

const { isDev, isMac } = require('./app/envVariables');
const { Events } = require('./app/events');

let mainWindow;
let aboutWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'ImageShrink',
    width: isDev ? 1200 : 500,
    height: 600,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: isDev,
    backgroundColor: '#ffffff',
    webPreferences: {
      nodeIntegration: true,
    },
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  //Change default Menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  //   mainWindow.loadURL(`file://${__dirname}/app/index.html`);
  mainWindow.loadFile(`${__dirname}/app/index.html`);
}

function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    title: 'About ImageShrink',
    width: 300,
    height: 300,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: false,
    backgroundColor: '#ffffff',
  });
  aboutWindow.setMenu(null);
  aboutWindow.loadFile(`${__dirname}/app/about.html`);
}

const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [{ label: 'About', click: createAboutWindow }],
        },
      ]
    : []),
  { role: 'fileMenu' },
  ...(isMac
    ? []
    : [
        {
          label: 'Help',
          submenu: [
            {
              label: 'About',
              click: () => {
                createAboutWindow();
              },
            },
          ],
        },
      ]),
  ...(isDev
    ? [
        {
          label: 'Developer',
          submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { type: 'separator' },
            { role: 'toggledevtools' },
          ],
        },
      ]
    : []),
];

ipcMain.on(Events.minimizeImage, (e, options) => {
  options.dest = path.join(os.homedir(), 'imageshrink');
  shrinkImage(options);
});

const shrinkImage = async ({ imgPath, quality, dest }) => {
  try {
    const pngQuality = quality / 100;
    const files = await imagemin([slash(imgPath)], {
      destination: dest,
      plugins: [
        imageminMozjpeg({ quality }),
        imageminPngquant({
          quality: [pngQuality, pngQuality],
        }),
      ],
    });
    log.info(files);
    shell.openPath(dest);

    mainWindow.webContents.send(Events.imageDone);
  } catch (err) {
    log.error(err);
  }
};

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
