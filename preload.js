const {contextBridge, ipcRenderer} = require("electron");
const fs = require('node:fs');
const colormap = require("colormap");
const p = require('node:path');
const SunCalc = require('suncalc');
const {v4: uuidv4} = require("uuid");
const os = require('node:os')

// We need to wait until the UI  is ready to receive the message before
// sending the port. We create this promise in the preload, so it's guaranteed
// to register the onload listener before the load event is fired.
const windowLoaded = new Promise(resolve => {
    window.onload = resolve
})

// We request that the main process sends us a channel we can use to
// communicate with the worker.

// now see if we have files to load
ipcRenderer.send('file-to-load');

ipcRenderer.once('load-results', async (event, args) => {
    // make sure our ui is ready to receive the message
    await windowLoaded;
    console.log('Posting file to UI');
    window.postMessage({args: args}, '/')
})
ipcRenderer.once('provide-worker-channel', async (event) => {
    // make sure our ui is ready to receive the message
    await windowLoaded;
    // Once we receive the reply, we can take the port...
    const [port] = event.ports

    // ... register a handler to receive results ...
    port.onmessage = (event) => {
        console.log('received result:', event.data)
    }
    // now transfer the port
    window.postMessage('provide-worker-channel', '/', event.ports)
})



contextBridge.exposeInMainWorld('electron', {
    requestWorkerChannel: () => ipcRenderer.invoke('request-worker-channel'),
    unsavedRecords: (isTrue) => ipcRenderer.invoke('unsaved-records', { newValue: isTrue }),
    onDownloadProgress: (callback) => ipcRenderer.on('download-progress', callback),
    saveFile: (args) => ipcRenderer.invoke('saveFile', args),
    selectDirectory: () => ipcRenderer.invoke('selectDirectory'),
    openDialog: (method, config) => ipcRenderer.invoke('openFiles', method, config),
    getPath: () => ipcRenderer.invoke('getPath'),
    getTemp: () => ipcRenderer.invoke('getTemp'),
    getVersion: () => ipcRenderer.invoke('getVersion'),
    getAudio: () => ipcRenderer.invoke('getAudio'),
    isMac: () => ipcRenderer.invoke('isMac')
});

contextBridge.exposeInMainWorld('module', {
    fs: fs,
    colormap: colormap,
    p: p,
    SunCalc: SunCalc,
    uuidv4: uuidv4,
    os: os
});

//

// Listen for messages from the main process
// Function to display update download progress


window.addEventListener('DOMContentLoaded', () => {
    const tracking = document.getElementById('update-progress');
    const updateProgressBar = document.getElementById('update-progress-bar');
    ipcRenderer.on('download-progress', (_event, progressObj) => {
        console.log(progressObj.percent); // Log the message to the console
        tracking.classList.remove('d-none')
        // Update your UI with the progress information
        updateProgressBar.value = progressObj.percent;
        // Hide progress when done
        if (progressObj.percent === 100) tracking.classList.add('d-none')
    });
  })
