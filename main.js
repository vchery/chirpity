const {app, dialog, ipcMain, BrowserWindow} = require('electron');
let mainWindow;
let workerWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 768,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        }
    })

    // Set icon
    mainWindow.setIcon(__dirname + '/img/icon/icon.png');

    // Always maximize
    //mainWindow.maximize()

    // Hide nav bar
    mainWindow.setMenuBarVisibility(false);

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    // Open the DevTools. Comment out for release
    mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        mainWindow = null
    })
}


function createWorker() {
    // hidden worker
    workerWindow = new BrowserWindow({
        //show: false,
        show: true,
        height: 800,
        width: 1200,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });
    workerWindow.loadFile('worker.html');

    workerWindow.on('closed', () => {
        workerWindow = null;
    });

    workerWindow.webContents.openDevTools();

    console.log("worker created");
}

// This method will be called when Electron has finished
app.on('ready', () => {
    createWorker();
    createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }

    if (workerWindow == null) {
        createWorker();
    }
});

ipcMain.on('analyze', async (event, arg) => {
    const audio = arg.AUDIO_DATA;
    console.log('Main received audio: ' + arg  )
    workerWindow.webContents.send('analyze', {audio});
});

ipcMain.on('prediction-done', (event, arg) => {
  const results = arg.results;
  mainWindow.webContents.send('prediction-done', {results});
});