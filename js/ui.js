let seenTheDarkness = false, shownDaylightBanner = false;
let labels = [];

const STATE = {
    mode: 'analyse',
    openFiles: [],
    chart: {
        species: undefined,
        range: { start: undefined, end: undefined }
    },
    explore: {
        species: undefined,
        range: { start: undefined, end: undefined }
    },
    sortOrder: 'dateTime',
    birdList: { lastSelectedSpecies: undefined }, // Used to put the last selected species at the top of the all-species list
    selection: { start: undefined, end: undefined },
}

// Batch size map for slider
const BATCH_SIZE_LIST = [1, 2, 4, 8, 16, 32, 36, 48, 64, 128];

// Get the modules loaded in preload.js
const fs = window.module.fs;
const colormap = window.module.colormap;
const p = window.module.p;
const SunCalc = window.module.SunCalc;
const uuidv4 = window.module.uuidv4;
const os = window.module.os;

/// Set up communication channel between UI and worker window

let worker;

const establishMessageChannel =
    new Promise((resolve) => {
        window.onmessage = (event) => {
            // event.source === window means the message is coming from the preload
            // script, as opposed to from an <iframe> or other source.
            if (event.source === window) {
                if (event.data === 'provide-worker-channel') {
                    [worker] = event.ports;
                    worker.postMessage({ action: 'create message port' });
                    // Once we have the port, we can communicate directly with the worker
                    // process.
                    worker.onmessage = e => {
                        resolve(e.data);
                    }
                }
            }
        }
    }).then((value) => {
        console.log(value);
    }, reason => {
        console.log(reason);
    });


async function getPaths() {
    const pathPromise = window.electron.getPath();
    const tempPromise = window.electron.getTemp();
    const appPath = await pathPromise;
    const tempPath = await tempPromise;
    console.log('path is ', appPath, 'temp is ', tempPath);
    return [appPath, tempPath];
}


let version;
let diagnostics = {};

window.electron.getVersion()
    .then((appVersion) => {
        version = appVersion;
        console.log('App version: ', appVersion);
        diagnostics['Chirpity Version'] = version;
    })
    .catch(e => {
        console.log('Error getting app version:', e)
    });

let modelReady = false, fileLoaded = false, currentFile;
let PREDICTING = false, t0;
let region, AUDACITY_LABELS = {}, wavesurfer;
// fileList is all open files, analyseList is the subset that have been analysed;
let fileList = [], analyseList = [];
let fileStart, bufferStartTime, fileEnd;

let zero = new Date(Date.UTC(0, 0, 0, 0, 0, 0));
// set up some DOM element caches
const bodyElement = $('body');
let spectrogramWrapper = $('#spectrogramWrapper'), specElement, waveElement, specCanvasElement, specWaveElement;
let waveCanvasElement, waveWaveElement,
    resultTableElement = $('#resultTableContainer');
const contentWrapperElement = $('#contentWrapper');
//const completeDiv = $('#complete');
let resultTable = document.getElementById('resultTableBody');
const selectionTable = document.getElementById('selectionResultTableBody');
const nocmigButton = document.getElementById('nocmigMode');
const summaryTable = $('#summaryTable');
const progressDiv = document.getElementById('progressDiv');
const progressBar = document.getElementById('progress-bar');
const fileNumber = document.getElementById('fileNumber');
const timelineSetting = document.getElementById('timelineSetting');
const colourmap = document.getElementById('colourmap');
const batchSizeValue = document.getElementById('batch-size-value');
const nocmig = document.getElementById('nocmig');
const contextAware = document.getElementById('context');
const audioFade = document.getElementById('fade');
const audioBitrate = document.getElementById('bitrate');
const audioQuality = document.getElementById('quality');
const audioBitrateContainer = document.getElementById('bitrate-container');
const audioQualityContainer = document.getElementById('quality-container');
const audioPadding = document.getElementById('padding');
const audioFormat = document.getElementById('format');
const audioDownmix = document.getElementById('downmix');
const audioFiltersIcon = document.getElementById('audioFiltersIcon')
const contextAwareIcon = document.getElementById('context-mode');
let batchInProgress = false;
let activeRow;
let predictions = {}, speciesListItems,
    clickedIndex, currentFileDuration;

let currentBuffer, bufferBegin = 0, windowLength = 20;  // seconds
// Set content container height
contentWrapperElement.height(bodyElement.height() - 80);


// Set default Options
let config;
const sampleRate = 24000;
const audioCtx = new AudioContext({ latencyHint: 'interactive', sampleRate: sampleRate });


/** Collect Diagnostics Information
 Diagnostics keys:
 GPUx - name of GPU(s)
 backend: tensorflow backend in use
 warmup: time to warm up model (seconds)
 "Analysis Duration": time on detections (seconds)
 "Audio Duration": length of audio (seconds)
 "Chirpity Version": app version
 "Model": model in use
 "Tensorflow Backend"
 Analysis Rate: x real time performance
 */
// Timers
let t0_warmup, t1_warmup, t0_analysis, t1_analysis;

diagnostics['CPU'] = os.cpus()[0].model;
diagnostics['Cores'] = os.cpus().length;
diagnostics['System Memory'] = (os.totalmem() / (1024 ** 2 * 1000)).toFixed(0) + ' GB';

function resetResults() {
    summaryTable.empty();
    pagination.forEach(item => item.classList.add('d-none'));
    resultTable = document.getElementById('resultTableBody');
    resultTable.innerHTML = '';
    predictions = {};
    seenTheDarkness = false;
    shownDaylightBanner = false;
    progressDiv.classList.add('d-none');
    updateProgress(0)
}

/***
 *
 * @param val: float between 0 and 1
 */
function updateProgress(val) {
    if (val) progressBar.value = val;
    else {
        delete progressBar.value;
    }
    val = val.toString();
    progressBar.innerText = val + '%';
}

async function loadAudioFile(args) {
    let filePath = args.filePath, originalFileEnd = args.originalFileEnd;
    fileLoaded = false;
    try {
        fileEnd = fs.statSync(filePath).mtime;
        worker.postMessage({
            action: 'file-load-request',
            file: filePath,
            preserveResults: args.preserveResults,
            position: 0,
            list: config.list,
            warmup: config.warmup
        });
    } catch (e) {
        const supported_files = ['.mp3', '.wav', '.mpga', '.ogg', '.opus', '.flac', '.m4a', '.aac', '.mpeg', '.mp4'];
        const dir = p.parse(filePath).dir;
        const name = p.parse(filePath).name;
        let file;
        supported_files.some(ext => {
            try {
                file = p.join(dir, name + ext);
                fileEnd = fs.statSync(file).mtime;
            } catch (e) {
                // Try the next extension
            }
            return fileEnd;
        });
        if (fileEnd) {
            if (file) {
                filePath = file;
            }
            if (originalFileEnd) {
                fileEnd = originalFileEnd;
            }
            worker.postMessage({
                action: 'file-load-request',
                file: filePath,
                preserveResults: args.preserveResults,
                position: 0,
                warmup: config.warmup,
                list: config.list
            });
        } else {
            alert("Unable to load source file with any supported file extension: " + filePath)
        }
    }
}


function updateSpec({ buffer, play = false, position = 0, resetSpec = false }) {
    //updateElementCache();
    wavesurfer.loadDecodedBuffer(buffer);
    //waveCanvasElement.width('100%');
    //specCanvasElement.width('100%');
    //$('.spec-labels').width('55px');
    wavesurfer.seekTo(position);
    play ? wavesurfer.play() : wavesurfer.pause();
    if (resetSpec) adjustSpecDims(true);
    showElement(['fullscreen']);
}

function createTimeline() {
    wavesurfer.addPlugin(WaveSurfer.timeline.create({
        container: '#timeline',
        formatTimeCallback: formatTimeCallback,
        timeInterval: timeInterval,
        primaryLabelInterval: primaryLabelInterval,
        secondaryLabelInterval: secondaryLabelInterval,
        primaryColor: 'white',
        secondaryColor: 'white',
        primaryFontColor: 'white',
        secondaryFontColor: 'white',
        fontSize: 14
    })).initPlugin('timeline');
}

const resetRegions = () => {
    if (wavesurfer) wavesurfer.clearRegions();
    region = undefined;
    disableMenuItem(['analyseSelection', 'export-audio']);
    if (fileLoaded) enableMenuItem(['analyse']);
}

function clearActive() {
    resetRegions();
    STATE.selection = false;
    worker.postMessage({action: 'update-state', selection: false})
    activeRow?.classList.remove('table-active');
    activeRow = undefined;
    //selectionTable.innerText = '';
}

const initWavesurfer = ({
    audio = undefined,
    height = 0
}) => {

    if (wavesurfer) {
        wavesurfer.pause();
    }
    // Setup waveform and spec views
    wavesurfer = WaveSurfer.create({
        container: document.querySelector('#waveform'),
        audioContext: audioCtx,
        backend: 'WebAudio',
        // make waveform transparent
        backgroundColor: 'rgba(0,0,0,0)',
        waveColor: 'rgba(109,41,164,0)',
        progressColor: 'rgba(109,41,16,0)',
        // but keep the playhead
        cursorColor: '#fff',
        cursorWidth: 2,
        skipLength: 0.1,
        partialRender: true,
        scrollParent: false,
        fillParent: true,
        responsive: true,
        height: height,
    });
    wavesurfer.bufferRequested = false;
    initRegion();
    initSpectrogram();
    createTimeline();
    if (audio) wavesurfer.loadDecodedBuffer(audio);
    colourmap.value = config.colormap;
    // Set click event that removes all regions

    waveElement.mousedown(function () {
        clearActive();
    });
    // Enable analyse selection when region created
    wavesurfer.on('region-created', function (e) {
        region = e;
        enableMenuItem(['export-audio']);
        if (modelReady && !PREDICTING) {
            enableMenuItem(['analyseSelection']);
        }
    });
    // Clear label on modifying region
    wavesurfer.on('region-updated', function (e) {
        region = e;
        region.attributes.label = '';
    });

    // Queue up next audio window while playing
    wavesurfer.on('audioprocess', function () {

        const currentTime = wavesurfer.getCurrentTime();
        const duration = wavesurfer.getDuration();
        const playedPart = currentTime / duration;

        if (playedPart > 0.5) {

            if (!wavesurfer.bufferRequested && currentFileDuration > bufferBegin + windowLength) {
                const begin = bufferBegin + windowLength;
                postBufferUpdate({ begin: begin, play: false, queued: true })
                wavesurfer.bufferRequested = true;
            }
        }
    });
    wavesurfer.on('finish', function () {
        if (currentFileDuration > bufferBegin + windowLength) {
            wavesurfer.stop()
            if (NEXT_BUFFER) {
                onWorkerLoadedAudio(NEXT_BUFFER)
            } else {
                postBufferUpdate({ begin: bufferBegin, play: true })
            }
            bufferBegin += windowLength;
        }
    });

    // Show controls
    showElement(['controlsWrapper']);
    updateElementCache();
    // Resize canvas of spec and labels
    adjustSpecDims(false);
}

function updateElementCache() {
    t0 = Date.now();
    // Update element caches
    waveElement = $('#waveform');
    specElement = $('spectrogram');
    specCanvasElement = $('#spectrogram canvas');
    waveCanvasElement = $('#waveform canvas');
    waveWaveElement = $('#waveform wave');
    specWaveElement = $('#spectrogram wave');
}

function zoomSpec(direction) {
    if (fileLoaded) {
        if (typeof direction !== 'string') { // then it's an event
            direction = direction.target.closest('button').id
        }
        let offsetSeconds = wavesurfer.getCurrentTime();
        let position = offsetSeconds / windowLength;
        let timeNow = bufferBegin + offsetSeconds;
        if (direction === 'zoomIn') {
            if (windowLength < 1.5) return;
            windowLength /= 2;
            bufferBegin += windowLength * position;
        } else {
            if (windowLength > 100 || windowLength === currentFileDuration) return;
            bufferBegin -= windowLength * position;
            windowLength = Math.min(currentFileDuration, windowLength * 2);

            if (bufferBegin < 0) {
                bufferBegin = 0;
            } else if (bufferBegin + windowLength > currentFileDuration) {
                bufferBegin = currentFileDuration - windowLength

            }
        }
        // Keep playhead at same time in file
        position = (timeNow - bufferBegin) / windowLength;
        postBufferUpdate({ begin: bufferBegin, position: position })
    }
}

async function showOpenDialog() {
    const files = await window.electron.openDialog('showOpenDialog');
    if (!files.canceled) await onOpenFiles({ filePaths: files.filePaths });
}

function powerSave(on) {
    return window.electron.powerSaveBlocker(on);
}

const openFileInList = async (e) => {
    if (!PREDICTING && e.target.tagName === 'A') {
        await loadAudioFile({ filePath: e.target.id, preserveResults: true })
    }
}
const filename = document.getElementById('filename');
filename.addEventListener('click', openFileInList);


function updateFileName(files, openfile) {
    let filenameElement = document.getElementById('filename');
    filenameElement.innerHTML = '';
    let label = openfile.replace(/^.*[\\\/]/, "");
    let appendStr;
    if (files.length > 1) {
        appendStr = `<div id="fileContainer" class="btn-group dropup">
        <button type="button" class="btn btn-dark" id="dropdownMenuButton"><span id="setFileStart" title="Amend recording start time"
                  class="material-icons-two-tone align-bottom pointer">edit_calendar</span> ${label}
        </button>
        <button class="btn btn-dark dropdown-toggle dropdown-toggle-split" type="button" 
                data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <span class="visually-hidden">Toggle Dropdown</span>
        </button>
        <div class="dropdown-menu dropdown-menu-dark" aria-labelledby="dropdownMenuButton">`;
        files.forEach(item => {
            if (item !== openfile) {
                const label = item.replace(/^.*[\\\/]/, "");
                appendStr += `<a id="${item}" class="dropdown-item openFiles" href="#">
                <span class="material-icons-two-tone align-bottom">audio_file</span>${label}</a>`;
            }
        });
        appendStr += `</div></div>`;
    } else {
        appendStr = `<div id="fileContainer">
        <button class="btn btn-dark" type="button" id="dropdownMenuButton">
        <span id="setFileStart" title="Amend recording start time"
                  class="material-icons-two-tone align-bottom pointer">edit_calendar</span> ${label}
        </button></div>`;
    }

    filenameElement.innerHTML = appendStr;
    //remove filename picker so they don't accumulate!
    const pickers = document.getElementsByClassName('opensright');
    while (pickers.length > 0) {
        pickers[0].parentNode.removeChild(pickers[0]);
    }
    //Before adding this one
    $(function () {
        $('#setFileStart').daterangepicker({
            singleDatePicker: true,
            showDropdowns: true,
            startDate: moment(fileStart),
            minYear: 2015,
            maxDate: moment(),
            maxYear: parseInt(moment().format('YYYY')),
            timePicker: true,
            timePicker24Hour: true,
            locale: {
                applyLabel: 'Set Recording Start Time'
            }
        }, function (start, end, label) {
            fileStart = start.toDate().getTime();
            worker.postMessage({ action: 'update-file-start', file: currentFile, start: fileStart });
        });
    })
}


/**
 * We post the list to the worker as it has node and that allows it easier access to the
 * required filesystem routines
 * @param filePaths
 */
const openFiles = ({ filePaths }) => {
    worker.postMessage({ action: 'open-files', files: filePaths })
}

async function onOpenFiles(args) {
    hideAll();
    showElement(['spectrogramWrapper'], false);
    resetResults();
    //completeDiv.hide();
    // Store the file list and Load First audio file
    fileList = args.filePaths;
    STATE.openFiles = args.filePaths;
    // Sort file by time created (the oldest first):
    if (fileList.length > 1) {
        if (modelReady) enableMenuItem(['analyseAll', 'reanalyseAll'])
        fileList = fileList.map(fileName => ({
            name: fileName,
            time: fs.statSync(fileName).mtime.getTime(),
        }))
            .sort((a, b) => a.time - b.time)
            .map(file => file.name);
    } else {
        disableMenuItem(['analyseAll', 'reanalyseAll'])
    }

    await loadAudioFile({ filePath: fileList[0] });
    updateFileName(fileList, fileList[0]);

    disableMenuItem(['analyseSelection', 'analyse', 'analyseAll', 'reanalyse', 'reanalyseAll', 'export2audio', 'save2db'])
    // Reset the buffer playhead and zoom:
    bufferBegin = 0;
    windowLength = 20;
}


/**
 *
 *
 * @returns {Promise<void>}
 */
async function showSaveDialog() {
    await window.electron.saveFile({ currentFile: currentFile, labels: AUDACITY_LABELS[currentFile] });
}

// Worker listeners
function analyseReset() {
    fileNumber.innerText = '';
    PREDICTING = true;
    delete diagnostics['Audio Duration'];
    AUDACITY_LABELS = {};
    progressDiv.classList.remove('d-none');
    // Diagnostics
    t0_analysis = Date.now();
}

function isEmptyObject(obj) {
    for (const i in obj) return false;
    return true
}

function refreshResultsView() {

    if (fileLoaded) {
        hideAll();
        showElement(['spectrogramWrapper', 'fullscreen'], false);
        if (!isEmptyObject(predictions)) {
            showElement(['resultTableContainer', 'resultsHead'], false);
        }
    } else if (!fileList.length) {
        hideAll();
        //showElement(['loadFileHint', 'loadFileHintText'], true);
    }
    adjustSpecDims(true);
}


const getSelectionResults = (userSettings) => {
    let start = region.start + bufferBegin;
    // Remove small amount of region to avoid pulling in results from 'end'
    let end = region.end + bufferBegin - 0.001;
    const mod = end - start % 3;
    if (end - start < 1.5 || mod < 1.5) {
        region.end += 1.5;
        end += 1.5;
    }
    STATE.selection = {};
    STATE['selection']['start'] = start.toFixed(3);
    STATE['selection']['end'] = end.toFixed(3);

    // We use usersettings to pull in results from the circle. 
    // WON'T work for saved analyses.
    if (userSettings === true) worker.postMessage({ action: 'update-state', userSettingsInSelection: true })
    postAnalyseMessage({
        filesInScope: [currentFile],
        start: STATE['selection']['start'],
        end: STATE['selection']['end'],
        offset: 0
    });
}


const analyseLink = document.getElementById('analyse');
analyseLink.addEventListener('click', async () => {
    postAnalyseMessage({ filesInScope: [currentFile] });
});

const reanalyseLink = document.getElementById('reanalyse');
reanalyseLink.addEventListener('click', async () => {
    postAnalyseMessage({
        filesInScope: [currentFile],
        reanalyse: true
    });
});

const analyseAllLink = document.getElementById('analyseAll');
analyseAllLink.addEventListener('click', async () => {
    postAnalyseMessage({ filesInScope: fileList });
});

const reanalyseAllLink = document.getElementById('reanalyseAll');
reanalyseAllLink.addEventListener('click', async () => {
    postAnalyseMessage({ filesInScope: fileList, reanalyse: true });
});


const analyseSelectionLink = document.getElementById('analyseSelection');
analyseSelectionLink.addEventListener('click', getSelectionResults);


function postAnalyseMessage(args) {
    if (!PREDICTING) {
        disableMenuItem(['analyseSelection']);
        const selection = !!args.end;
        const filesInScope = args.filesInScope;
        if (!selection) {
            //STATE.mode = 'analyse';
            // Tell the worker we are in Analyse mode
            //worker.postMessage({ action: 'change-mode', mode: STATE.mode });
            // Reset the buffer playhead and zoom:
            analyseReset();
            resetResults();
            refreshResultsView();
        } else {
            progressDiv.classList.remove('d-none');
            updateProgress(0);
            delete diagnostics['Audio Duration'];
        }
        if (filesInScope.length > 1) {
            batchInProgress = true;
        }
        worker.postMessage({
            action: 'analyse',
            start: args.start,
            end: args.end,
            filesInScope: filesInScope,
            reanalyse: args.reanalyse,
            SNR: config.filters.SNR
        });
    }
}


/// Lat / lon
const lat = document.getElementById('latitude')
const lon = document.getElementById('longitude')
const place = document.getElementById('place')
$('#latitude, #longitude').on('focus', function () {
    document.removeEventListener('keydown', handleKeyDownDeBounce, true);
})

const displayLocation = () => {
    if (lat.value && lon.value) {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat.value}&lon=${lon.value}&zoom=14`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network error: ' + response);
                }
                return response.json()
            })
            .then(data => {
                const address = data.display_name;
                place.innerHTML = address ? '<span class="material-icons-two-tone">fmd_good</span> ' + address :
                    '<span class="material-icons-two-tone text-danger">fmd_bad</span> Location not recognised';
                if (address) {
                    config.latitude = lat.value;
                    config.longitude = lon.value;
                    config.location = address;
                    updatePrefs();
                }
            })
            .catch(error => {
                console.log("got an error connecting to OpenStreetMap")
                // If we have a number for lat & lon, go ahead and use it.
                if (!isNaN(lat.value) && !isNaN(lon.value)) {
                    config.latitude = lat.value;
                    config.longitude = lon.value;
                    updatePrefs();
                }

            })
    }
}
$('#latitude, #longitude, #timeInput').on('blur', function () {
    document.addEventListener('keydown', handleKeyDownDeBounce, true);
    displayLocation()
})

// Menu bar functions

function exitApplication() {
    window.close()
}

function enableMenuItem(id_list) {
    id_list.forEach(id => {
        $('#' + id).removeClass('disabled');
    })
}

function disableMenuItem(id_list) {
    id_list.forEach(id => {
        $('#' + id).addClass('disabled');
    })
}


function setHeight(el, val) {
    if (typeof val === 'function') val = val();
    if (typeof val === 'string') el.style.height = val;
    else el.style.height = val + 'px';
}

function showElement(id_list, makeFlex = true, empty = false) {
    id_list.forEach(id => {
        //const thisElement = $('#' + id);
        const thisElement = document.getElementById(id);
        //thisElement.show();
        //thisElement.removeClass('d-none');
        thisElement.classList.remove('d-none');
        if (makeFlex) thisElement.classList.add('d-flex');
        if (empty) {
            setHeight(thisElement, 0);
            thisElement.replaceChildren(); // empty
        }
    })
}

function hideElement(id_list) {
    id_list.forEach(id => {
        const thisElement = $('#' + id);
        thisElement.removeClass('d-flex');
        thisElement.addClass('d-none');
    })
}

function hideAll() {
    // File hint div,  Waveform, timeline and spec, controls and result table
    hideElement(['exploreWrapper',
        'spectrogramWrapper', 'resultTableContainer', 'recordsContainer', 'fullscreen', 'resultsHead']);
}

const save2dbLink = document.getElementById('save2db');
save2dbLink.addEventListener('click', async () => {
    worker.postMessage({ action: 'save2db' })
});

const export2audio = document.getElementById('export2audio');
export2audio.addEventListener('click', batchExportAudio);

async function batchExportAudio(e) {
    const species = isSpeciesViewFiltered(true) || getSpecies(e.target);
    if (!species) {
        alert("Filter results by species to export audio files");
        return
    }
    const response = await window.electron.selectDirectory('selectDirectory');
    if (!response.canceled) {
        const directory = response.filePaths[0];
        worker.postMessage({
            action: 'export-results',
            exportTo: directory,
            species: species,
            files: isExplore() ? [] : fileList,
            explore: isExplore(),
            limit: 100,
            range: isExplore() ? STATE.explore.range : undefined
        })
    }
}

const chartsLink = document.getElementById('charts');
chartsLink.addEventListener('click', async () => {
    STATE.mode = 'chart';
    // Tell the worker we are in Chart mode
    worker.postMessage({ action: 'change-mode', mode: STATE.mode });
    worker.postMessage({ action: 'get-detected-species-list', range: STATE.chart.range });
    hideAll();
    showElement(['recordsContainer']);
    worker.postMessage({ action: 'chart', species: undefined, range: { start: undefined, end: undefined } });
});


const exploreLink = document.getElementById('explore');
exploreLink.addEventListener('click', async () => {
    STATE.mode = 'explore';
    // Tell the worker we are in Explore mode
    worker.postMessage({ action: 'change-mode', mode: STATE.mode });
    worker.postMessage({ action: 'get-detected-species-list', range: STATE.explore.range });
    hideAll();
    showElement(['exploreWrapper', 'spectrogramWrapper'], false);
    adjustSpecDims(true)
    worker.postMessage({ action: 'filter', species: undefined, range: STATE.explore.range, explore: true });
});

const datasetLink = document.getElementById('dataset');
datasetLink.addEventListener('click', async () => {
    worker.postMessage({ action: 'create-dataset' });
});

$('.spec-labels').on('mousedown', (e) => {
    e.stopImmediatePropagation();
    console.log('label draggggggggggggg')
})

// thresholdLink.addEventListener('keypress', handleThresholdChange );

const checkWidth = (text) => {
    // Create a temporary element to measure the width of the text
    const tempElement = document.createElement('span');
    tempElement.style.position = 'absolute';
    tempElement.style.visibility = 'hidden';
    tempElement.textContent = text;
    document.body.appendChild(tempElement);

    // Get the width of the text
    const textWidth = tempElement.clientWidth;

    // Remove the temporary element from the document
    document.body.removeChild(tempElement);
    return textWidth + 5
}


function createRegion(start, end, label) {
    wavesurfer.pause();
    resetRegions();
    wavesurfer.addRegion({
        start: start,
        end: end,
        color: "rgba(255, 255, 255, 0.1)",
        attributes: {
            label: label || '',

        },
    });
    const region = document.getElementsByTagName('region')[0];
    const text = region.attributes['data-region-label'].value;
    if (region.clientWidth <= checkWidth(text)) {
        region.style.writingMode = 'vertical-rl';
    }
    const progress = start / wavesurfer.getDuration();
    wavesurfer.seekAndCenter(progress);
}

// We add the handler to the whole table as the body gets replaced and the handlers on it would be wiped
const results = document.getElementById('results');
results.addEventListener('click', resultClick);
selectionTable.addEventListener('click', resultClick);

async function resultClick(e) {
    let row = e.target.closest('tr');
    let classList = e.target.classList;
    if (!row || row.classList.length === 0) { // 1. clicked and dragged, 2 no detections in file row
        return
    }
    // Search for results rows
    while (!(row.classList.contains('nighttime') ||
        row.classList.contains('daytime'))) {
        row = row.previousElementSibling
        if (!row) return;
    }
    if (activeRow) activeRow.classList.remove('table-active');
    row.classList.add('table-active');
    activeRow = row;
    const [file, start, end, label] = row.attributes[2].value.split('|');
    loadResultRegion({ file, start, end, label });
    if (e.target.classList.contains('circle')) {
        await waitForFileLoad();
        getSelectionResults(true);
    }
}


const loadResultRegion = ({ file = '', start = 0, end = 3, label = '' } = {}) => {
    start = parseFloat(start);
    end = parseFloat(end);
    // ensure region doesn't spread across the whole window
    if (windowLength <= 3.5) windowLength = 6;
    bufferBegin = Math.max(0, start - (windowLength / 2) + 1.5)
    const region = { start: Math.max(start - bufferBegin, 0), end: end - bufferBegin, label: label };
    const position = wavesurfer.getCurrentTime() / windowLength;
    postBufferUpdate({ file: file, begin: bufferBegin, position: position, region: region })
}

/**
 *
 * @param redraw boolean, whether to re-render the spectrogram
 * @param fftSamples: Optional, the number of fftsamples to use for rendering. Must be a factor of 2
 */
function adjustSpecDims(redraw, fftSamples) {
    //Contentwrapper starts below navbar (66px) and ends above footer (30px). Hence - 96
    contentWrapperElement.height(bodyElement.height() - 86);
    const contentHeight = contentWrapperElement.outerHeight(true);
    // + 2 for padding
    const formOffset = $('#exploreWrapper').outerHeight(true);
    const specWrapperElement = document.getElementById('spectrogramWrapper');
    let specOffset;
    if (!spectrogramWrapper.hasClass('d-none')) {
        // Expand up to 512px unless fullscreen
        const controlsHeight = $('#controlsWrapper').outerHeight(true);
        const timelineHeight = $('#timeline').outerHeight(true);
        const specHeight = config.fullscreen ? contentHeight - timelineHeight - formOffset - controlsHeight : Math.min(contentHeight * 0.4, 512);
        if (currentFile) {
            // give the wrapper space for the transport controls and element padding/margins
            if (!wavesurfer) {
                initWavesurfer({
                    audio: currentBuffer,
                    backend: 'WebAudio',
                    alpha: 0,
                    height: specHeight,
                    reset: false
                });
            } else {
                wavesurfer.setHeight(specHeight);
            }
            initSpectrogram(specHeight, fftSamples);
            specCanvasElement.width('100%');
            specElement.css('z-index', 0);
            $('.spec-labels').width('55px')
        }
        if (wavesurfer && redraw) {
            wavesurfer.drawBuffer();
        }
        specOffset = specWrapperElement.offsetHeight;
    } else {
        specOffset = 0
    }
    resultTableElement.height(contentHeight - specOffset - formOffset);
}


///////////////////////// Timeline Callbacks /////////////////////////

/**
 * Use formatTimeCallback to style the notch labels as you wish, such
 * as with more detail as the number of pixels per second increases.
 *
 * Here we format as M:SS.frac, with M suppressed for times < 1 minute,
 * and frac having 0, 1, or 2 digits as the zoom increases.
 *
 * Note that if you override the default function, you'll almost
 * certainly want to override timeInterval, primaryLabelInterval and/or
 * secondaryLabelInterval so they all work together.
 *
 * @param: seconds
 * @param: pxPerSec
 */


function formatRegionTooltip(start, end) {
    const length = end - start;
    if (length === 3) {
        return `${formatTimeCallback(start)} -  ${formatTimeCallback(end)}`;
    } else if (length < 1) return `Region length: ${(length * 1000).toFixed(0)} ms`
    else {
        return `Region length: ${length.toFixed(3)} seconds`
    }
}

function formatTimeCallback(secs) {
    secs = secs.toFixed(2);
    const now = new Date(bufferStartTime.getTime() + (secs * 1000))
    const milliSeconds = now.getMilliseconds();
    let seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();

    // fill up seconds with zeroes
    let secondsStr;
    if (windowLength >= 5) {
        secondsStr = (seconds + milliSeconds / 1000).toFixed(2);
        secondsStr = secondsStr.replace(/\.?0+$/, ''); // remove trailing zeroes
    } else {
        let fraction = Math.round(milliSeconds / 100);
        if (fraction === 10) {
            seconds += 1;
            fraction = 0;
        }
        secondsStr = seconds.toString() + '.' + fraction.toString();
    }
    if (hours > 0 || minutes > 0 || config.timeOfDay) {
        if (seconds < 10) {
            secondsStr = '0' + secondsStr;
        }
    } else if (!config.timeOfDay) {
        return secondsStr;
    }
    let minutesStr = minutes.toString();
    if (config.timeOfDay || hours > 0) {
        if (minutes < 10) {
            minutesStr = '0' + minutesStr;
        }
    } else if (!config.timeOfDay) {
        return `${minutes}:${secondsStr}`
    }
    if (hours < 10 && config.timeOfDay) {
        let hoursStr = '0' + hours.toString();
        return `${hoursStr}:${minutesStr}:${secondsStr}`
    }
    return `${hours}:${minutesStr}:${secondsStr}`
}

/**
 * Use timeInterval to set the period between notches, in seconds,
 * adding notches as the number of pixels per second increases.
 *
 * Note that if you override the default function, you'll almost
 * certainly want to override formatTimeCallback, primaryLabelInterval
 * and/or secondaryLabelInterval so they all work together.
 *
 * @param: pxPerSec
 */
function timeInterval(pxPerSec) {
    let retval;
    const mulFactor = window.devicePixelRatio || 1;
    const threshold = pxPerSec / mulFactor;
    if (threshold >= 2500) {
        retval = 0.01;
    } else if (threshold >= 1000) {
        retval = 0.025;
    } else if (threshold >= 250) {
        retval = 0.1;
    } else if (threshold >= 100) {
        retval = 0.25;
    } else if (threshold >= 25) {
        retval = 5;
    } else if (threshold >= 5) {
        retval = 10;
    } else if (threshold >= 2) {
        retval = 15;
    } else {
        retval = Math.ceil(0.5 / threshold) * 60;
    }
    return retval;
}

/**
 * Return the cadence of notches that get labels in the primary color.
 * EG, return 2 if every 2nd notch should be labeled,
 * return 10 if every 10th notch should be labeled, etc.
 *
 * Note that if you override the default function, you'll almost
 * certainly want to override formatTimeCallback, primaryLabelInterval
 * and/or secondaryLabelInterval so they all work together.
 *
 * @param pxPerSec
 */
function primaryLabelInterval(pxPerSec) {
    let retval;
    const mulFactor = window.devicePixelRatio || 1;
    const threshold = pxPerSec / mulFactor;
    if (threshold >= 2500) {
        retval = 10;
    } else if (threshold >= 1000) {
        retval = 4;
    } else if (threshold >= 250) {
        retval = 10;
    } else if (threshold >= 100) {
        retval = 4;
    } else if (threshold >= 20) {
        retval = 1;
    } else if (threshold >= 5) {
        retval = 5;
    } else if (threshold >= 2) {
        retval = 15;
    } else {
        retval = Math.ceil(0.5 / threshold) * 60;
    }
    return retval;
}

/**
 * Return the cadence of notches to get labels in the secondary color.
 * EG, return 2 if every 2nd notch should be labeled,
 * return 10 if every 10th notch should be labeled, etc.
 *
 * Secondary labels are drawn after primary labels, so if
 * you want to have labels every 10 seconds and another color labels
 * every 60 seconds, the 60 second labels should be the secondaries.
 *
 * Note that if you override the default function, you'll almost
 * certainly want to override formatTimeCallback, primaryLabelInterval
 * and/or secondaryLabelInterval so they all work together.
 *
 * @param pxPerSec
 */
function secondaryLabelInterval(pxPerSec) {
    const mulFactor = window.devicePixelRatio || 1;
    const threshold = pxPerSec / mulFactor;
    // draw one every 1s as an example
    return Math.floor(1 / timeInterval(threshold));
}

////////// Store preferences //////////

function updatePrefs() {
    try {
        fs.writeFileSync(p.join(appPath, 'config.json'), JSON.stringify(config))
    } catch (e) {
        console.log(e)
    }
}


/////////////////////////  Window Handlers ////////////////////////////
let appPath, tempPath;
window.onload = async () => {
    document.getElementById('contentWrapper').classList.add('loaded');
    // Set config defaults
    const defaultConfig = {
        UUID: uuidv4(),
        colormap: 'inferno',
        timeOfDay: false,
        list: 'migrants',
        model: 'v2',
        latitude: 52.87,
        longitude: 0.89, // Great Snoring :)
        location: 'Location not set',
        detect: { nocmig: false, contextAware: false, confidence: 45 },
        filters: { highPassFrequency: 0, lowShelfFrequency: 0, lowShelfAttenuation: -6, SNR: 0 },
        warmup: true,
        backend: 'tensorflow',
        tensorflow: { threads: diagnostics['Cores'], batchSize: 4 },
        webgl: { threads: 1, batchSize: 4 },
        audio: { format: 'mp3', bitrate: 192, quality: 5, downmix: false, padding: false, fade: false },
        limit: 500
    };
    // Load preferences and override defaults
    [appPath, tempPath] = await getPaths();
    await fs.readFile(p.join(appPath, 'config.json'), 'utf8', (err, data) => {
        if (err) {
            console.log('JSON parse error ' + err);
            // Use defaults
            config = defaultConfig;
        } else {
            config = JSON.parse(data);
        }

        //fill in defaults
        Object.keys(defaultConfig).forEach(key => {
            if (!(key in config)) {
                config[key] = defaultConfig[key];
            }
        });

        // Initialize Spectrogram
        initWavesurfer({});
        // Set UI option state
        const batchSizeSlider = document.getElementById('batch-size');
        // Map slider value to batch size
        batchSizeSlider.value = BATCH_SIZE_LIST.indexOf(config[config.backend].batchSize);
        batchSizeSlider.max = (BATCH_SIZE_LIST.length - 1).toString();
        batchSizeValue.innerText = config[config.backend].batchSize;
        const modelToUse = document.getElementById('model-to-use');
        modelToUse.value = config.model;
        const backend = document.getElementById(config.backend);
        backend.checked = true;
        // Show time of day in results?
        setTimelinePreferences();
        // Show the list in use
        document.getElementById('list-to-use').value = config.list;
        // And update the icon
        updateListIcon();
        timelineSetting.value = config.timeOfDay ? 'timeOfDay' : 'timecode';
        // Spectrogram colour
        colourmap.value = config.colormap;
        // Nocmig mode state
        console.log('nocmig mode is ' + config.detect.nocmig);

        // Audio preferences:
        audioFormat.value = config.audio.format;
        audioBitrate.value = config.audio.bitrate;
        audioQuality.value = config.audio.quality;
        showRelevantAudioQuality();
        audioFade.checked = config.audio.fade;
        audioPadding.checked = config.audio.padding;
        audioFade.disabled = !audioPadding.checked;
        audioDownmix.checked = config.audio.downmix;
        setNocmig(config.detect.nocmig);
        contextAware.checked = config.detect.contextAware;
        contextAwareIconDisplay();
        showThreshold(config.detect.confidence);
        SNRSlider.value = config.filters.SNR;
        SNRThreshold.innerText = config.filters.SNR;
        if (config.backend === 'webgl') {
            SNRSlider.disabled = true;
        };
        // Filters
        HPThreshold.innerText = config.filters.highPassFrequency + 'Hz';
        HPSlider.value = config.filters.highPassFrequency;
        LowShelfSlider.value = config.filters.lowShelfFrequency;
        LowShelfThreshold.innerText = config.filters.lowShelfFrequency + 'Hz';
        lowShelfAttenuation.value = -config.filters.lowShelfAttenuation;
        lowShelfAttenuationThreshold.innerText = lowShelfAttenuation.value + 'dB';
        filterIconDisplay();

        ThreadSlider.max = diagnostics['Cores'];
        ThreadSlider.value = config[config.backend].threads;
        numberOfThreads.innerText = config[config.backend].threads;
        lat.value = config.latitude;
        lon.value = config.longitude;
        place.innerHTML = '<span class="material-icons-two-tone">fmd_good</span>' + config.location;

        worker.postMessage({
            action: 'update-state',
            path: appPath,
            temp: tempPath,
            lat: config.latitude,
            lon: config.longitude,
            detect: config.detect,
            filters: config.filters,
            audio: config.audio
        });
        loadModel();
        worker.postMessage({ action: 'clear-cache' })
    }
    )
    // establish the message channel
    setUpWorkerMessaging()

    // Set footer year
    $('#year').text(new Date().getFullYear());
    //Cache list elements
    speciesListItems = $('#bird-list li span');
}


const setUpWorkerMessaging = () => {
    establishMessageChannel.then(() => {
        worker.addEventListener('message', function (e) {
            const args = e.data;
            const event = args.event;
            switch (event) {
                case 'model-ready':
                    onModelReady(args);
                    break;
                case 'diskDB-has-records':
                    chartsLink.classList.remove('disabled');
                    exploreLink.classList.remove('disabled');
                    break;
                case 'update-summary':
                    updateSummary(args);
                    break;
                case 'files':
                    onOpenFiles(args);
                    break;
                case 'seen-species-list':
                    generateBirdList('seenSpecies', args.list);
                    break;
                case 'prediction-done':
                    onPredictionDone(args);
                    break;
                case 'progress':
                    onProgress(args);
                    break;
                case 'prediction-ongoing':
                    renderResult(args);
                    break;
                case 'update-audio-duration':
                    diagnostics['Audio Duration'] ?
                        diagnostics['Audio Duration'] += args.value :
                        diagnostics['Audio Duration'] = args.value;
                    break;
                case 'spawning':
                    displayWarmUpMessage();
                    break;
                case 'promptToSave':
                    if (confirm("Save results to your archive?")) {
                        worker.postMessage({ action: 'save2db' })
                    }
                    break;
                case 'worker-loaded-audio':
                    onWorkerLoadedAudio(args);
                    break;
                case 'chart-data':
                    onChartData(args);
                    break;
                case 'generate-alert':
                    alert(args.message)
                    break
                case 'no-detections-remain':
                    detectionsModal.hide();
                    break;
                default:
                    alert(`Unrecognised message from worker:${args.event}`)
            }
        })
    })
}

function generateBirdList(store, rows) {
    let listHTML;

    if (store === 'allSpecies') {
        const excluded = ['Human', 'Vehicle', 'Animal', 'Ambient Noise'];
        const lastSelectedSpecies = STATE.birdList.lastSelectedSpecies;
        const remember = lastSelectedSpecies && excluded.indexOf(lastSelectedSpecies) === -1 ?
            `<li><a href="#">${lastSelectedSpecies}</a></li>` : '';
        listHTML = `
            <div class="bird-list all"><div class="rounded-border"><ul>
            ${remember}
            <li><a href="#">Animal</a></li>
            <li><a href="#">Ambient Noise</a></li>
            <li><a href="#">Human</a></li>
            <li><a href="#">Vehicle</a></li>`;

        for (const item in labels) {
            const [sname, cname] = labels[item].split('_');
            if (excluded.indexOf(cname) === -1 && cname.indexOf(lastSelectedSpecies) === -1) {
                listHTML += `<li><a href="#">${cname} - ${sname}</a></li>`;
            }
        }
    } else {
        listHTML = '<div class="bird-list seen"><div class="rounded-border"><ul class="request-bird">';
        for (const item in rows) {
            listHTML += `<li><a href="#"><span class="cname">${rows[item].cname}</span> - ${rows[item].sname} <span class="badge bg-secondary rounded-pill float-end">${rows[item].count}</span></a></li>`;
        }
    }
    const parking = document.getElementById(store);
    listHTML += '</ul></div></div>';
    parking.innerHTML = listHTML;
}

function generateBirdOptionList({ store, rows, selected }) {
    let listHTML = `
    <div class="form-floating">
        <select id="bird-list" class="form-select form-select mb-3" aria-label=".form-select" required>`;

    if (store === 'allSpecies') {
        const lastSelectedSpecies = selected || STATE.birdList.lastSelectedSpecies;
        listHTML += lastSelectedSpecies ?
            `<option selected value="${lastSelectedSpecies}">${lastSelectedSpecies}</option>` : '<option selected disabled value=""></option>';
        for (const item in labels) {
            const [sname, cname] = labels[item].split('_');
            if (cname.indexOf(lastSelectedSpecies) === -1) {
                listHTML += `<option value="${cname}">${cname} - ${sname}</option>`;
            }
        }
    } else {
        for (const item in rows) {
            listHTML += `<option value="${rows[item].cname}">${rows[item].cname} - ${rows[item].sname} <span class="badge bg-secondary rounded-pill float-end">${rows[item].count}</span></option>`;
        }
    }
    listHTML += '</select><label for="bird-list">Species</label></div>';
    return listHTML;
}

// Search list handlers

$(document).on('focus', '.input', function () {
    document.removeEventListener('keydown', handleKeyDownDeBounce, true);
    const container = this.closest('div').querySelector('.bird-list-wrapper');
    // check we're not adjusting the confidence threshold - if we are, container will be null
    if (container) {
        let theList;
        if (container.classList.contains('editing')) {
            theList = document.querySelector('#allSpecies .bird-list')
        } else {
            theList = document.querySelector('#seenSpecies .bird-list')
        }
        if (theList) {  //there won't be a seenSpecies list until some records are saved
            container.appendChild(theList.cloneNode(true));
            theList = container.querySelector('.bird-list');
            //theList.addEventListener('click', editHandler);
        }
    }
    if (this.id === "speciesSearch") hideElement(['dataRecords']);
});

$(document).on('blur', '.input', function (e) {
    document.addEventListener('keydown', handleKeyDownDeBounce, true);
    if (this.id !== 'threshold') {
        // We're looking at the birdlist search, so use a timeout to allow a click event on the list to fire
        setTimeout(hideBirdList, 250, this.parentNode);
    }
})

$(document).on('mousedown', '.bird-list-wrapper', function (e) {
    e.preventDefault();
})

function hideBirdList(el) {
    const list = el.closest('.species-selector').querySelector('.bird-list');
    if (el.id === 'edit') {
        const cname = el.closest('.cname');
        if (cname) {
            const row = cname.closest('tr');
            const restore = row.querySelector('.restore');
            cname.replaceWith(restore);
            restore.classList.remove('restore', 'd-none');
        }
    } else {
        list.remove();
    }
}



// Bird list filtering
$(document).on('keyup', '.input:not(.form-control)', filterList);

function filterList(e) {
    const input = e.target;
    const filter = input.value.toUpperCase();
    const ul = input.closest('div').querySelector("ul");
    const li = ul.getElementsByTagName('li');
    const theList = document.querySelector('.bird-list');
    theList.classList.remove('d-none');
    // Loop through all list items, and hide those who don't match the search query
    for (let i = 0; i < li.length; i++) {
        const a = li[i].getElementsByTagName("a")[0];
        const txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

const getActiveRowID = () => activeRow?.id;

const isSpeciesViewFiltered = (sendSpecies) => {
    const filtered = document.querySelector('#speciesFilter tr.text-warning');
    const species = filtered ? getSpecies(filtered) : undefined;
    return sendSpecies ? species : filtered !== null;
}



function unpackNameAttr(el, cname) {
    const currentRow = el.closest("tr");
    const nameAttr = currentRow.attributes[2].value;
    let [file, start, end, commonName] = nameAttr.split('|');
    if (cname) commonName = cname;
    currentRow.attributes[0].value = [file, start, end, commonName].join('|');
    return [file, parseFloat(start), parseFloat(end), currentRow];
}


function sendFeedback(file, cname, sname, start) {
    predictions[clickedIndex].cname = cname;
    predictions[clickedIndex].sname = sname;
    predictions[clickedIndex].start = start;
    predictions[clickedIndex].filename =
        `${cname.replace(/\s+/g, '_')}~${sname.replace(/\s+/g, '_')}~${predictions[clickedIndex].date}.opus`;
    sendFile('incorrect', predictions[clickedIndex]);
}

function getSpecies(target) {
    const row = target.closest('tr');
    const speciesCell = row.querySelector('.cname .cname');
    const species = speciesCell.innerText.split('\n')[0];
    return species;
}


const getDetectionContext = (target) => target.closest('table').id;

// Bird list form  click handler
$(document).on('click', '.request-bird', function (e) {
    // Clear the results table
    resultTable.innerText = '';
    const row = e.target.closest('li')
    const cname = row.querySelector('.cname').innerText
    const context = this.closest('.bird-list-wrapper').classList[0];
    let pickerEl = context + 'Range';
    t0 = Date.now();
    let action, explore;
    if (context === 'chart') {
        STATE.chart.species = cname;
        action = 'chart';
    } else {
        action = 'filter';
    }
    worker.postMessage({ action: action, species: cname, range: STATE[context].range })
})


// Chart functions
function getDateOfISOWeek(w) {
    const options = { month: 'long', day: 'numeric' };
    const y = new Date().getFullYear();
    const simple = new Date(y, 0, 1 + (w - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart.toLocaleDateString('en-GB', options);
}


function onChartData(args) {
    const genTime = Date.now() - t0;
    const genTimeElement = document.getElementById('genTime')
    genTimeElement.innerText = (genTime / 1000).toFixed(1) + ' seconds';
    if (args.species) showElement(['dataRecords'], false);
    const elements = document.getElementsByClassName('highcharts-data-table');
    while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
    }
    const records = args.records;
    for (const [key, value] of Object.entries(records)) {
        const element = document.getElementById(key);
        if (value?.constructor === Array) {
            if (isNaN(value[0])) element.innerText = 'N/A';
            else {
                element.innerText = value[0].toString() + ' on ' +
                    new Date(value[1]).toLocaleDateString(undefined, { dateStyle: "short" })
            }
        } else {
            element.innerText = value ? new Date(value).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric"
            }) : 'No Records';
        }
    }
    const results = args.results;
    const rate = args.rate;
    const total = args.total;
    const dataPoints = args.dataPoints;
    const aggregation = args.aggregation;
    const pointStart = args.pointStart;
    const chartOptions = setChartOptions(args.species, total, rate, results, dataPoints, aggregation, pointStart);
    Highcharts.chart('chart-week', chartOptions);
}

function setChartOptions(species, total, rate, results, dataPoints, aggregation, pointStart) {
    let chartOptions = {};
    chartOptions.yAxis = [];
    const pointInterval = { Week: 7 * 24 * 36e5, Day: 24 * 36e5, Hour: 36e5 };
    chartOptions.colors = ["#003", "#2B9179", "#AB41E8", "#E88E2A", "#E86235"];
    chartOptions.chart = {
        zoomType: 'x',
        backgroundColor: { linearGradient: [0, 0, 0, 500], stops: [[0, "#dbe2ed"], [1, "#dddddd"]] }
    }
    chartOptions.credits = { text: 'Chart generated by Chirpity Nocmig', href: '' }
    chartOptions.title = species ? { text: `${species} Detections` } : { text: 'Hours Recorded' };
    chartOptions.lang = {
        noData: "No Detections to Display"
    }
    chartOptions.noData = {
        style: {
            fontWeight: 'bold',
            fontSize: '25px',
            color: '#303030'
        }
    }
    chartOptions.time = { useUTC: false }; // Use localtime for axes
    Highcharts.dateFormats.W = function (timestamp) {
        let date = new Date(timestamp), day = date.getUTCDay() === 0 ? 7 : date.getUTCDay(), dayNumber;
        date.setDate(date.getUTCDate() + 4 - day);
        dayNumber = Math.floor((date.getTime() - new Date(date.getUTCFullYear(), 0, 1, -6)) / 86400000);
        return 1 + Math.floor(dayNumber / 7);
    };
    const format = { Week: '{value:Week %W}', Day: '{value:%a %e %b}', Hour: '{value:%l%P}' }
    chartOptions.xAxis = {
        type: 'datetime',
        tickInterval: pointInterval[aggregation], // one week
        labels: {
            format: format[aggregation],
        }
    };

    chartOptions.series = [];
    if (aggregation === 'Week') {
        chartOptions.series.push({
            name: 'Hours of recordings',
            marker: { enabled: false },
            yAxis: 0,
            type: 'areaspline',
            data: total,
            pointInterval: pointInterval[aggregation],
            pointStart: pointStart,
            lineWidth: 0,
            fillColor: {
                linearGradient: [0, 0, 0, 300],
                stops: [
                    [0, chartOptions.colors[0]],
                    [1, Highcharts.color(chartOptions.colors[0]).setOpacity(0.2).get('rgba')]
                ]
            }
        });
        chartOptions.yAxis.push({
            title: {
                text: 'Hours recorded'
            },
            accessibility: {
                description: 'Total recording time in hours'
            },
            opposite: true
        });
    }
    if (rate && Math.max(...rate) > 0) {
        if (aggregation === 'Week') {
            chartOptions.yAxis.push({
                title: { text: 'Hourly Detection Rate' },
                accessibility: { description: 'Hourly rate of records' },
                opposite: true
            });
            chartOptions.series.push({
                name: 'Average hourly call rate',
                marker: { enabled: false },
                yAxis: 1,
                type: 'areaspline',
                data: rate,
                lineWidth: 0,
                pointInterval: pointInterval[aggregation],
                pointStart: pointStart,
                fillColor: {
                    linearGradient: [0, 0, 0, 300],
                    stops: [
                        [0, chartOptions.colors[1]],
                        [1, Highcharts.color(chartOptions.colors[1]).setOpacity(0.2).get('rgba')]
                    ]
                }
            });
        }
    }
    let hasResults = false;
    for (const key in results) {
        hasResults = true;
        chartOptions.series.push({
            name: `Total for ${aggregation} in ` + key,
            pointInterval: pointInterval[aggregation],
            pointStart: pointStart,
            type: 'column',
            yAxis: chartOptions.yAxis.length,
            data: results[key]
        });
    }
    if (hasResults) {
        chartOptions.yAxis.push(
            {
                title: { text: 'Detections' },
                accessibility: { description: 'Count of records' }
            }
        );
    }

    chartOptions.tooltip = {
        crosshairs: true, shared: true, formatter: function () {
            const x = new Date(this.x)
            if (aggregation === "Week") {
                const oneJan = new Date(x.getFullYear(), 0, 1);
                const numberOfDays = Math.floor((x - oneJan) / (24 * 60 * 60 * 1000));
                const weekOfYear = Math.ceil((x.getDay() + 1 + numberOfDays) / 7);
                return this.points.reduce(function (s, point) {
                    return s + '<br/><span style="font-weight: bold;color: ' + point.series.color + '">&#9679; </span>' + point.series.name + ': ' +
                        point.y;
                }, `<b>${aggregation} ${weekOfYear} (${getDateOfISOWeek(weekOfYear)} - ${getDateOfISOWeek(weekOfYear + 1)})</b>`);
            } else if (aggregation === 'Day') {
                const period = moment(x).format('MMMM Do, YYYY');
                return this.points.reduce(function (s, point) {
                    return s + '<br/><span style="font-weight: bold;color: ' + point.series.color + '">&#9679; </span>' + point.series.name + ': ' +
                        point.y;
                }, `<b>${period}</b>`);
            } else {
                const period = moment(x).format('MMM D, ha');
                return this.points.reduce(function (s, point) {
                    return s + '<br/><span style="font-weight: bold;color: ' + point.series.color + '">&#9679; </span> Count: ' +
                        point.y;
                }, `<b>${period}</b>`);
            }
        }
    };
    chartOptions.exporting = {};
    chartOptions.exporting.csv = {
        columnHeaderFormatter: function (item, key) {
            if (!item || item instanceof Highcharts.Axis) {
                return ''
            } else {
                return item.name;
            }
        }
    };
    return chartOptions;
}


const waitForFinalEvent = (function () {
    let timers = {};
    return function (callback, ms, uniqueId) {
        if (!uniqueId) {
            uniqueId = "Don't call this twice without a uniqueId";
        }
        if (timers[uniqueId]) {
            clearTimeout(timers[uniqueId]);
        }
        timers[uniqueId] = setTimeout(callback, ms);
    };
})();

$(window).on('resize', function () {
    waitForFinalEvent(function () {

        WindowResize();
    }, 250, 'id1');
});

function WindowResize() {
    //updateElementCache();
    adjustSpecDims(true);
}

$(document).on('click', '.play', function () {
    (typeof region !== 'undefined') ? region.play() : console.log('Region undefined')
})


function handleKeyDownDeBounce(e) {
    e.preventDefault();
    waitForFinalEvent(function () {
        handleKeyDown(e);
    }, 100, 'keyhandler');
}

function handleKeyDown(e) {
    let action = e.code;
    if (action in GLOBAL_ACTIONS) {
        if (document === e.target || document.body === e.target || e.target.attributes["data-action"]) {

        }
        GLOBAL_ACTIONS[action](e);
    }

    [].forEach.call(document.querySelectorAll('[data-action]'), function (el) {
        el.addEventListener('click', function (e) {
            let action = e.currentTarget.dataset.action;
            if (action in GLOBAL_ACTIONS) {
                e.preventDefault();
                GLOBAL_ACTIONS[action](e);
            }
        });
    });
}

function enableKeyDownEvent() {
    document.addEventListener('keydown', handleKeyDownDeBounce, true);
}


///////////// Nav bar Option handlers //////////////

function initRegion() {
    if (wavesurfer.regions) wavesurfer.destroyPlugin('regions');
    wavesurfer.addPlugin(WaveSurfer.regions.create({
            formatTimeCallback: formatRegionTooltip,
            dragSelection: true,
            // Region length bug (likely mine) means I don't trust leangths > 60 seconds
            maxLength: config[config.backend].batchSize * 3,
            slop: 5,
            color: "rgba(255, 255, 255, 0.2)"
        })
    ).initPlugin('regions')
}

function initSpectrogram(height, fftSamples) {
    console.log("initializing spectrogram")
    if (!fftSamples) {
        if (windowLength < 5) {
            fftSamples = 256;
        } else if (windowLength <= 15) {
            fftSamples = 512;
        } else {
            fftSamples = 1024;
        }
    }
    if (!height) {
        height = fftSamples / 2
    }
    if (wavesurfer.spectrogram) wavesurfer.destroyPlugin('spectrogram');
    wavesurfer.addPlugin(WaveSurfer.spectrogram.create({
        //deferInit: false,
        wavesurfer: wavesurfer,
        container: "#spectrogram",
        scrollParent: false,
        fillParent: true,
        windowFunc: 'hamming',
        minPxPerSec: 1,
        frequencyMin: 0,
        frequencyMax: 11750,
        normalize: false,
        hideScrollbar: true,
        labels: true,
        height: height,
        fftSamples: fftSamples,
        colorMap: colormap({
            colormap: config.colormap, nshades: 256, format: 'float'
        }),
    })).initPlugin('spectrogram');
    updateElementCache();
}

colourmap.addEventListener('change', (e) => {
    config.colormap = e.target.value;
    updatePrefs();
    if (wavesurfer) {
        initSpectrogram();
        // refresh caches
        updateElementCache()
        adjustSpecDims(true)
    }
})


// list mode icons
const listIcon = document.getElementById('list-icon')
const updateListIcon = () => {
    const icon = listIcon.querySelector('img');
    icon.src = icon.src.replace(/\w+\.png$/, config.list + '.png');
    const states = {
        migrants: 'Searching for migrants and owls',
        birds: 'Searching for all birds',
        everything: 'Searching for everything'
    };
    icon.title = states[config.list];
}
listIcon.addEventListener('click', () => {
    let img = listIcon.querySelector('img')
    const states = {
        migrants: 'Searching for migrants and owls',
        birds: 'Searching for all birds',
        everything: 'Searching for everything'
    };
    const keys = Object.keys(states);
    for (let key in Object.keys(states)) {
        key = parseInt(key);
        if (img.src.indexOf(keys[key]) !== -1) {
            const replace = (key === keys.length - 1) ? 0 : key + 1;
            img.src = img.src.replace(keys[key], keys[replace]);
            img.title = states[keys[replace]];
            listToUse.value = keys[replace];
            config.list = keys[replace];
            updatePrefs();
            worker.postMessage({ action: 'update-list', list: config.list })
            break
        }
    }
})


const listToUse = document.getElementById('list-to-use');
listToUse.addEventListener('change', function (e) {
    config.list = e.target.value;
    updateListIcon();
    updatePrefs();
    worker.postMessage({ action: 'update-list', list: config.list })
})

const loadModel = () => {
    t0_warmup = Date.now();
    worker.postMessage({
        action: 'load-model',
        model: config.model,
        list: config.list,
        batchSize: config[config.backend].batchSize,
        warmup: config.warmup,
        threads: config[config.backend].threads,
        backend: config.backend
    });
}

const modelToUse = document.getElementById('model-to-use');
modelToUse.addEventListener('change', function (e) {
    config.model = e.target.value;
    updatePrefs();
    loadModel();
})

const handleBackendChange = (e) => {
    config.backend = e.target.value;
    if (config.backend === 'webgl') {
        powerSave(true)
        SNRSlider.disabled = true;
        config.filters.SNR = 0;
    } else {
        powerSave(false)
        contextAware.disabled = false;
        if (contextAware.checked) {
            config.detect.contextAware = true;
            SNRSlider.disabled = true;
            config.filters.SNR = 0;
        } else {
            SNRSlider.disabled = false;
            config.filters.SNR = parseFloat(SNRSlider.value);
            if (config.filters.SNR) {
                contextAware.disabed = true;
                config.detect.contextAware = false;
                contextAwareIconDisplay();
            }
        }

    }
    // Update threads and batch Size in UI
    ThreadSlider.value = config[config.backend].threads;
    numberOfThreads.innerText = config[config.backend].threads;
    batchSizeSlider.value = BATCH_SIZE_LIST.indexOf(config[config.backend].batchSize);
    batchSizeValue.innerText = BATCH_SIZE_LIST[batchSizeSlider.value].toString();
    updatePrefs();
    // restart wavesurfer regions to set new maxLength
    initRegion();
    loadModel();
}

const backend = document.getElementsByName('backend');
for (let i = 0; i < backend.length; i++) {
    backend[i].addEventListener('click', handleBackendChange)
}


const setTimelinePreferences = () => {
    const timestampFields = document.querySelectorAll('.timestamp');
    const timeOfDayFields = document.querySelectorAll('.timeOfDay');
    timestampFields.forEach(time => {
        config.timeOfDay ? time.classList.add('d-none') :
            time.classList.remove('d-none');
    });
    timeOfDayFields.forEach(time => {
        config.timeOfDay ? time.classList.remove('d-none') :
            time.classList.add('d-none');
    });
}

const timelineToggle = (fromKeys) => {
    if (fromKeys) {
        timelineSetting.value === 'timeOfDay' ? timelineSetting.value = 'timecode' : timelineSetting.value = 'timeOfDay'
    }
    config.timeOfDay = timelineSetting.value === 'timeOfDay'; //toggle setting
    setTimelinePreferences();
    if (fileLoaded) {
        // Reload wavesurfer with the new timeline
        const position = wavesurfer.getCurrentTime() / windowLength;
        postBufferUpdate({ begin: bufferBegin, position: position })
    }
    updatePrefs();
};
document.getElementById('timelineSetting').addEventListener('change', timelineToggle);

/////////// Keyboard Shortcuts  ////////////

const GLOBAL_ACTIONS = { // eslint-disable-line
    KeyA: async function (e) {
        if (e.ctrlKey) {
            if (e.shiftKey && AUDACITY_LABELS !== {}) await showSaveDialog();
            else if (currentFile) analyseLink.click()
        }
    },
    KeyE: function (e) {
        if (e.ctrlKey && region) exportAudio();
    },
    KeyD: function (e) {
        if (e.ctrlKey && e.shiftKey) worker.postMessage({ action: 'convert-dataset' });
    },
    KeyG: function (e) {
        if (e.ctrlKey) showGoToPosition();
    },
    KeyF: function (e) {
        if (e.ctrlKey) toggleFullscreen();
    },
    KeyO: async function (e) {
        if (e.ctrlKey) await showOpenDialog();
    },
    KeyP: function () {
        (typeof region !== 'undefined') ? region.play() : console.log('Region undefined')
    },
    KeyS: function (e) {
        if (e.ctrlKey) worker.postMessage({ action: 'save2db' });
    },
    KeyT: function (e) {
        if (e.ctrlKey) timelineToggle(true);
    },
    Escape: function () {
        if (PREDICTING) {
            console.log('Operation aborted');
            PREDICTING = false;
            worker.postMessage({
                action: 'abort',
                model: config.model,
                threads: config[config.backend].threads,
                list: config.list
            });
            alert('Operation cancelled');
            progressDiv.classList.add('d-none');
        }
    },
    Home: function () {
        if (currentBuffer) {
            bufferBegin = 0;
            postBufferUpdate({})
        }
    },
    End: function () {
        if (currentBuffer) {
            bufferBegin = currentFileDuration - windowLength;
            postBufferUpdate({ begin: bufferBegin, position: 1 })
        }
    },
    KeyC: function (e) {
        // Center window on playhead
        if (e.ctrlKey && currentBuffer) {
            const middle = bufferBegin + wavesurfer.getCurrentTime();
            bufferBegin = middle - windowLength / 2;
            bufferBegin = Math.max(0, bufferBegin);
            bufferBegin = Math.min(bufferBegin, currentFileDuration - windowLength)
            postBufferUpdate({ begin: bufferBegin, position: 0.5 })
        }
    },
    PageUp: function () {
        if (currentBuffer) {
            const position = wavesurfer.getCurrentTime() / windowLength;
            bufferBegin = Math.max(0, bufferBegin - windowLength);
            postBufferUpdate({ begin: bufferBegin, position: position })
        }
    },
    ArrowUp: function () {
        if (currentBuffer) {
            const position = wavesurfer.getCurrentTime() / windowLength;
            bufferBegin = Math.max(0, bufferBegin - windowLength);
            postBufferUpdate({ begin: bufferBegin, position: position })
        }
    },
    PageDown: function () {
        if (currentBuffer) {
            const position = wavesurfer.getCurrentTime() / windowLength;
            bufferBegin = Math.min(bufferBegin + windowLength, currentFileDuration - windowLength);
            postBufferUpdate({ begin: bufferBegin, position: position })
        }
    },
    ArrowDown: function () {
        if (currentBuffer) {
            const position = wavesurfer.getCurrentTime() / windowLength;
            bufferBegin = Math.min(bufferBegin + windowLength, currentFileDuration - windowLength);
            postBufferUpdate({ begin: bufferBegin, position: position })
        }
    },
    ArrowLeft: function () {
        const skip = windowLength / 100;
        if (currentBuffer) {
            wavesurfer.skipBackward(skip);
            const position = wavesurfer.getCurrentTime() / windowLength;
            if (wavesurfer.getCurrentTime() < skip && bufferBegin > 0) {
                bufferBegin -= skip;
                postBufferUpdate({ begin: bufferBegin, position: position })
            }
        }
    },
    ArrowRight: function () {
        const skip = windowLength / 100;
        if (wavesurfer) {
            wavesurfer.skipForward(skip);
            const position = Math.max(wavesurfer.getCurrentTime() / windowLength, 1);
            if (wavesurfer.getCurrentTime() > windowLength - skip) {
                bufferBegin = Math.min(currentFileDuration - windowLength, bufferBegin += skip)
                postBufferUpdate({ begin: bufferBegin, position: position })
            }
        }
    },
    Equal: function (e) {
        if (e.shiftKey) {
            if (wavesurfer.spectrogram.fftSamples > 64) {
                wavesurfer.spectrogram.fftSamples /= 2;
                const position = wavesurfer.getCurrentTime() / windowLength;
                const currentRegion = region ? {
                    start: region.start,
                    end: region.end,
                    label: region.attributes?.label
                } : undefined;
                postBufferUpdate({ begin: bufferBegin, position: position, region: currentRegion })
                console.log(wavesurfer.spectrogram.fftSamples);
            }
        } else {
            zoomSpec('zoomIn')
        }
    },
    NumpadAdd: function (e) {
        if (e.shiftKey) {
            if (wavesurfer.spectrogram.fftSamples > 64) {
                wavesurfer.spectrogram.fftSamples /= 2;
                const position = wavesurfer.getCurrentTime() / windowLength;
                const currentRegion = region ? {
                    start: region.start,
                    end: region.end,
                    label: region.attributes?.label
                } : undefined;
                postBufferUpdate({ begin: bufferBegin, position: position, region: currentRegion })
                console.log(wavesurfer.spectrogram.fftSamples);
            }
        } else {
            zoomSpec('zoomIn')
        }
    },
    Minus: function (e) {
        if (e.shiftKey) {
            if (wavesurfer.spectrogram.fftSamples <= 2048) {
                wavesurfer.spectrogram.fftSamples *= 2;
                const position = wavesurfer.getCurrentTime() / windowLength;
                const currentRegion = region ? {
                    start: region.start,
                    end: region.end,
                    label: region.attributes?.label
                } : undefined;
                postBufferUpdate({ begin: bufferBegin, position: position, region: currentRegion })
                console.log(wavesurfer.spectrogram.fftSamples);
            }
        } else {
            zoomSpec('zoomOut')
        }
    },
    NumpadSubtract: function (e) {
        if (e.shiftKey) {
            if (wavesurfer.spectrogram.fftSamples <= 2048) {
                wavesurfer.spectrogram.fftSamples *= 2;
                const position = wavesurfer.getCurrentTime() / windowLength;
                const currentRegion = region ? {
                    start: region.start,
                    end: region.end,
                    label: region.attributes?.label
                } : undefined;
                postBufferUpdate({ begin: bufferBegin, position: position, region: currentRegion })
                console.log(wavesurfer.spectrogram.fftSamples);
            }
        } else {
            zoomSpec('zoomOut')
        }
    },
    Space: function () {
        if (wavesurfer) wavesurfer.playPause();
    },
    Tab: function (e) {
        if (activeRow) {
            if (e.shiftKey) {
                activeRow.classList.remove('table-active')
                activeRow = activeRow.previousSibling || activeRow;
                activeRow.classList.add('table-active')
            } else {
                activeRow.classList.remove('table-active')
                activeRow = activeRow.nextSibling || activeRow;
                activeRow.classList.add('table-active')
            }
            activeRow.focus();
            activeRow.click();
        }
    }
};

const postBufferUpdate = ({
    file = currentFile,
    begin = 0,
    position = 0,
    play = false,
    resetSpec = false,
    region = undefined,
    queued = false
}) => {
    fileLoaded = false
    worker.postMessage({
        action: 'update-buffer',
        file: file,
        position: position,
        start: begin,
        end: begin + windowLength,
        play: play,
        resetSpec: resetSpec,
        region: region,
        queued: queued
    });
}

// Go to position
const goto = new bootstrap.Modal(document.getElementById('gotoModal'));
const showGoToPosition = () => {
    if (currentFile) {
        document.removeEventListener('keydown', handleKeyDownDeBounce, true);
        goto.show();

    }
}

const gotoModal = document.getElementById('gotoModal')
gotoModal.addEventListener('hidden.bs.modal', () => {
    document.addEventListener('keydown', handleKeyDownDeBounce, true);
})

gotoModal.addEventListener('shown.bs.modal', () => {
    document.getElementById('timeInput').focus()
})


const gotoTime = (e) => {
    if (currentFile) {
        e.preventDefault();
        let hours = 0, minutes = 0, seconds = 0;
        const time = document.getElementById('timeInput').value;
        let timeArray = time.split(':');
        if (timeArray.length === 1 && !isNaN(parseFloat(timeArray[0]))) {
            seconds = parseFloat(timeArray[0]);
        } else if (timeArray.length === 2 && !isNaN(parseInt(timeArray[0])) && !isNaN(parseInt(timeArray[1]))) {
            // Case 2: Input is two numbers separated by a colon, take as minutes and seconds
            minutes = Math.min(parseInt(timeArray[0]), 59);
            seconds = Math.min(parseFloat(timeArray[1]), 59.999);
        } else if (timeArray.length === 3 && !isNaN(parseInt(timeArray[0])) && !isNaN(parseInt(timeArray[1])) && !isNaN(parseInt(timeArray[2]))) {
            // Case 3: Input is three numbers separated by colons, take as hours, minutes, and seconds
            hours = Math.min(parseInt(timeArray[0]), 23);
            minutes = Math.min(parseInt(timeArray[1]), 59);
            seconds = Math.min(parseFloat(timeArray[2]), 59.999);
        } else {
            // Invalid input
            alert('Invalid time format. Please enter time in one of the following formats: \n1. Float (for seconds) \n2. Two numbers separated by a colon (for minutes and seconds) \n3. Three numbers separated by colons (for hours, minutes, and seconds)');
            document.addEventListener('keydown', handleKeyDownDeBounce, true);
            return;
        }
        let start = hours * 3600 + minutes * 60 + seconds;
        windowLength = 20;
        bufferBegin = Math.max(start - windowLength / 2, 0);
        const position = bufferBegin === 0 ? start / windowLength : 0.5;
        postBufferUpdate({ begin: bufferBegin, position: position })
        // Close the modal
        goto.hide()
    }
}

const go = document.getElementById('go')
go.addEventListener('click', gotoTime)
const gotoForm = document.getElementById('gotoForm')
gotoForm.addEventListener('submit', gotoTime)

// Electron Message handling
const warmupText = document.getElementById('warmup');

function displayWarmUpMessage() {
    disableMenuItem(['analyse', 'analyseAll', 'reanalyse', 'reanalyseAll', 'analyseSelection', 'export2audio', 'save2db']);
    warmupText.classList.remove('d-none');
}

function onModelReady(args) {
    modelReady = true;
    labels = args.labels;
    warmupText.classList.add('d-none');
    if (fileLoaded) {
        enableMenuItem(['analyse', 'reanalyse'])
        if (fileList.length > 1) enableMenuItem(['analyseAll', 'reanalyseAll'])
    }
    if (region) enableMenuItem(['analyseSelection'])
    t1_warmup = Date.now();
    diagnostics['Warm Up'] = ((t1_warmup - t0_warmup) / 1000).toFixed(2) + ' seconds';

}


// worker.onmessage('update-error', async (event, args) => {
//     console.error('update error' + args.error)
// })
//
// worker.onmessage('update-not-available', async (event, args) => {
//     console.log('update not available ' + args.message)
// })
//
// worker.onmessage('update-available', async (event, args) => {
//     console.log('update available ' + args.message)
// })
//
// worker.onmessage('update-downloaded', async (event, args) => {
//     console.log('update downloaded' + args.releaseNotes)
// })

/***
 *  Called when a new file or buffer is loaded by the worker
 * @param fileStart  Unix epoch in ms for the start of the file
 * @param sourceDuration a float: number of seconds audio in the file
 * @param bufferBegin a float: the start position of the file in seconds
 * @param file full path to the audio file
 * @param position the position to place the play head: between  0-1
 * @param contents the audio buffer
 * @param fileRegion an object {start, end} with the positions in seconds from the beginning of the buffer
 * @param preserveResults boolean determines whether to clear the result table
 * @param play whether to auto-play the audio
 * @returns {Promise<void>}
 */
let NEXT_BUFFER;
async function onWorkerLoadedAudio({
    start = 0,
    sourceDuration = 0,
    bufferBegin = 0,
    file = '',
    position = 0,
    buffer = undefined,
    contents = undefined,
    fileRegion = undefined,
    play = false,
    queued = false
}) {
    fileLoaded = true;
    const resetSpec = !currentFile;
    currentFileDuration = sourceDuration;
    //if (preserveResults) completeDiv.hide();
    console.log(`UI received worker-loaded-audio: ${file}, buffered: ${contents === undefined}`);
    if (contents) {
        currentBuffer = new AudioBuffer({ length: contents.length, numberOfChannels: 1, sampleRate: 24000 });
        currentBuffer.copyToChannel(contents, 0);
    } else {
        currentBuffer = buffer;
    }
    if (queued) {
        // Prepare arguments to call this function with
        NEXT_BUFFER = {
            start: start, sourceDuration: sourceDuration, bufferBegin: bufferBegin, file: file,
            buffer: currentBuffer, play: true, resetSpec: false, queued: false
        }
    } else {
        NEXT_BUFFER = undefined;
        if (currentFile !== file) {
            currentFile = file;
            fileStart = start;
            fileEnd = new Date(fileStart + (currentFileDuration * 1000));
            // Update the current file name in the UI
            updateFileName(fileList, file);
        }
        if (config.timeOfDay) {
            bufferStartTime = new Date(fileStart + (bufferBegin * 1000))
        } else {
            bufferStartTime = new Date(zero.getTime() + (bufferBegin * 1000))
        }
        if (windowLength > currentFileDuration) windowLength = currentFileDuration;

        


        updateSpec({ buffer: currentBuffer, position: position, play: play, resetSpec: resetSpec });
        wavesurfer.bufferRequested = false;
        if (modelReady) {
            enableMenuItem(['analyse', 'reanalyse']);
            if (fileList.length > 1) enableMenuItem(['analyseAll', 'reanalyseAll'])
        }
        if (fileRegion) {
            createRegion(fileRegion.start, fileRegion.end, fileRegion.label);
            if (fileRegion.play) {
                region.play()
            }
        } else {
            clearActive();
        }
        fileLoaded = true;
        if (activeRow) activeRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function onProgress(args) {
    progressDiv.classList.remove('d-none');
    if (args.text) {
        fileNumber.innerHTML = args.text;
    } else {
        const count = fileList.indexOf(args.file) + 1;
        fileNumber.innerText = `File ${count} of ${fileList.length}`;
    }
    if (args.progress) {
        let progress = Math.round(args.progress * 1000) / 10;
        updateProgress(progress);
        if (progress === 100.0) {
            progressDiv.classList.add('d-none');
        }
    } else {
        updateProgress(0)
    }
}


const updateSummary = ({ summary = [], filterSpecies = '' }) => {
    let total, summaryHTML = `<table id="resultSummary" class="table table-striped table-dark p-1"><thead>
            <tr>
                <th class="col-3" scope="col">Max</th>
                <th class="col-5" scope="col">Species</th>
                <th class="col-1 text-end" scope="col">Count</th>
            </tr>
            </thead><tbody id="speciesFilter">`;

    for (let i = 0; i < summary.length; i++) {
        const item = summary[i];
        if (item.cname === 'Total') {
            total = item.count;
            continue
        }
        const selected = item.cname === filterSpecies ? ' text-warning' : '';
        summaryHTML += `<tr tabindex="-1" class="${selected}">
                        <td class="max">${iconizeScore(item.max)}</td>
                        <td class="cname${selected}">
                            <span class="pointer"><span class="cname">${item.cname}</span> <i>${item.sname}</i></span>
                        </td>                       
                        <td class="text-end${selected}">${item.count}</td>
                        `;

    }
    summaryHTML += '</tbody></table>';
    // Get rid of flicker...
    const old_summary = document.getElementById('summaryTable');
    const buffer = old_summary.cloneNode();
    buffer.innerHTML = summaryHTML;
    old_summary.replaceWith(buffer);
    document.getElementById('speciesFilter').addEventListener('click', speciesFilter)
    const currentFilter = document.querySelector('#speciesFilter tr.text-warning');
    if (currentFilter) {
        //const filterRow = currentFilter.rowIndex;
        currentFilter.focus();
    }
    return total;
}

async function onPredictionDone({
    filterSpecies = undefined,
    batchInProgress = false,
    audacityLabels = {},
    file = undefined,
    summary = [],
    active = undefined,
    offset = 0,
    action = undefined
}) {

    AUDACITY_LABELS = audacityLabels;
    enableMenuItem(['save2db', 'export2audio']);
    // Defer further processing until batch complete
    if (batchInProgress) {
        progressDiv.classList.remove('d-none');
        return;
    } else {
        PREDICTING = false;
    }
    if (resultsBuffer) {
        const results = document.getElementById('resultTableBody');
        results.replaceWith(resultsBuffer);
        resultsBuffer = undefined;
    }

    const total = updateSummary({ summary: summary, filterSpecies: filterSpecies });
    // adjust offset if threshold changes the total. Not perfect, but still
    if (total < offset) {
        offset -= config.limit;
        if (filterSpecies) {
            const filteredOffset = {};
            filteredOffset[filterSpecies] = offset;
            worker.postMessage({ action: 'update-state', filteredOffset: filteredOffset })
        } else {
            worker.postMessage({ action: 'update-state', globalOffset: offset })
        }
    }
    //Pagination
    total > config.limit ? addPagination(total, offset) : pagination.forEach(item => item.classList.add('d-none'));
    if (action !== 'filter') {
        
        updateProgress(0)

        //completeDiv.show();

        if (AUDACITY_LABELS !== {}) {
            enableMenuItem(['saveLabels']);
            $('.download').removeClass('disabled');
        } else {
            disableMenuItem(['saveLabels']);
        }
        if (currentFile) enableMenuItem(['analyse', 'reanalyse'])

        // Diagnostics:
        t1_analysis = Date.now();
        diagnostics['Analysis Duration'] = ((t1_analysis - t0_analysis) / 1000).toFixed(2) + ' seconds';
        diagnostics['Analysis Rate'] = (diagnostics['Audio Duration'] / ((t1_analysis - t0_analysis) / 1000)).toFixed(0) + 'x faster than real time performance.';
    }

    if (active) {
        // Refresh node and scroll to active row:
        activeRow = document.getElementById(active);
        if (activeRow === null) { // because: after an edit the active row may not exist
            resultTable = document.getElementById('resultTableBody');
            const rows = resultTable.querySelectorAll('tr.daytime, tr.nighttime')
            if (rows.length) {
                activeRow = rows[rows.length - 1];
            } else { return }
        } else {
            activeRow.classList.add('table-active');
        }
        activeRow.focus();
        activeRow.click();
    }
    // else {
    //     document.getElementById('resultTableBody').scrollIntoView({behaviour: 'smooth'});
    // }
}

const pagination = document.querySelectorAll('.pagination');
pagination.forEach(item => {
    item.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') { // Did we click a link in the list?
            let clicked = e.target.innerText;
            let currentPage = pagination[0].querySelector('.active');
            currentPage = parseInt(currentPage.innerText);
            if (clicked === 'Previous') {
                clicked = currentPage - 1
            } else if (clicked === 'Next') {
                clicked = currentPage + 1
            } else {
                clicked = parseInt(clicked)
            }
            const limit = config.limit;
            const offset = (clicked - 1) * limit;
            const species = isSpeciesViewFiltered(true);
            // Reset daylight banner
            shownDaylightBanner = false;
            worker.postMessage({
                action: 'filter',
                species: species,
                offset: offset,
                limit: limit,
            });
        }
    })
})

const addPagination = (total, offset) => {
    const limit = config.limit;
    const pages = Math.ceil(total / limit);
    const currentPage = (offset / limit) + 1;
    let list = '';
    for (let i = 1; i <= pages; i++) {
        if (i === 1) {
            list += i === currentPage ? '<li class="page-item disabled"><span class="page-link" href="#">Previous</span></li>'
                : '<li class="page-item"><a class="page-link" href="#">Previous</a></li>';
        }
        if (i <= 2 || i > pages - 2 || (i >= currentPage - 2 && i <= currentPage + 2)) {
            list += i === currentPage ? '<li class="page-item active" aria-current="page"><span class="page-link" href="#">' + i + '</span></li>' :
                '<li class="page-item"><a class="page-link" href="#">' + i + '</a></li>';
        } else if (i === 3 || i === pages - 3) {
            list += '<li class="page-item disabled"><span class="page-link" href="#">...</span></li>';
        }
        if (i === pages) {
            list += i === currentPage ? '<li class="page-item disabled"><span class="page-link" href="#">Next</span></li>'
                : '<li class="page-item"><a class="page-link" href="#">Next</a></li>';
        }
    }
    pagination.forEach(item => {
        item.classList.remove('d-none');
        item.innerHTML = list;
    })
}


function speciesFilter(e) {
    if (e.target.tagName === 'TBODY') return; // on Drag
    clearActive();
    let species, range;
    // Am I trying to unfilter?
    if (!e.target.closest('tr').classList.contains('text-warning')) {
        // Clicked on unfiltered species
        species = getSpecies(e.target)
    }
    if (isExplore()) {
        range = STATE.explore.range
    }
    worker.postMessage({
        action: 'filter',
        species: species
    });
    seenTheDarkness = false;
    shownDaylightBanner = false;
    document.getElementById('results').scrollTop = 0;
}


const checkDayNight = (timestamp) => {
    let astro = SunCalc.getTimes(timestamp, config.latitude, config.longitude);
    return (astro.dawn.setMilliseconds(0) < timestamp && astro.dusk.setMilliseconds(0) > timestamp) ? 'daytime' : 'nighttime';
}

// TODO: show every detection in the spec window as a region on the spectrogram

async function renderResult({
    index = 1,
    result = {},
    file = undefined,
    isFromDB = false,
    selection = false
}) {

    let tr = '';
    if (index <= 1) {
        if (selection) {
            selectionTable.innerHTML = '';
        }
        else {
            showElement(['resultTableContainer', 'resultsHead'], false);
            resultTable.innerHTML = '';
        }
    } else if (index % (config.limit + 1) === 0) addPagination(index, 0);
    if (!isFromDB && index > config.limit) {
        return
    }
    if (typeof (result) === 'string') {
        const nocturnal = config.detect.nocmig ? '<b>during the night</b>' : '';
        tr += `<tr><td colspan="8">${result} (Showing ${config.list} detected ${nocturnal} with at least ${config.detect.confidence}% confidence in the prediction)</td></tr>`;
    } else {
        const {
            timestamp,
            position,
            active,
            sname,
            cname,
            score,
            label,
            comment,
            end,
            count,
            callCount
        } = result;
        const dayNight = checkDayNight(timestamp);
        if (dayNight === 'nighttime') seenTheDarkness = true;
        // Todo: move this logic so pre dark sections of file are not even analysed
        if (config.detect.nocmig && !selection && dayNight === 'daytime') return

        // Show twilight indicator when  nocmig mode off (except when analysing a selection)
        if (shownDaylightBanner === false && dayNight === 'daytime') {
            // Only do this if change starts midway through a file
            if ((index - 1) % config.limit !== 0) {
                // Show the twilight start bar
                tr += `<tr class="text-bg-dark"><td colspan="20" class="text-center text-white">
                Start of civil twilight <span class="material-icons-two-tone text-warning align-bottom">wb_twilight</span>
                </td></tr>`;
            }
            shownDaylightBanner = true;
        }
        const commentHTML = comment ?
            `<span title="${comment}" class='material-icons-two-tone pointer'>comment</span>` : '';
        const isUncertain = score < 65 ? '&#63;' : '';
        // result.filename  and result.date used for feedback
        result.date = timestamp;
        result.filename = cname.replace(/'/g, "\\'") + `_${timestamp}`;
        // store result for feedback function to use
        predictions[index] = result;
        // Format date and position for  UI
        const tsArray = new Date(timestamp).toString().split(' ');
        const UI_timestamp = `${tsArray[2]} ${tsArray[1]} ${tsArray[3].substring(2)}<br/>${tsArray[4]}`;
        const spliceStart = position < 3600 ? 14 : 11;
        const UI_position = new Date(position * 1000).toISOString().substring(spliceStart, 19);
        const showTimeOfDay = config.timeOfDay ? '' : 'd-none';
        const showTimestamp = config.timeOfDay ? 'd-none' : '';
        const activeTable = active ? 'table-active' : '';
        const labelHTML = label ? tags[label] : '';
        const hide = selection ? 'd-none' : '';

        const countIcon = count > 1 ? `<span class="circle pointer" title="Click to view the ${count} detections at this timecode">${count}</span>` : '';
        const XC_type = cname.indexOf('(song)') !== -1 ? "song" : "nocturnal flight call";
        tr += `<tr tabindex="-1" id="result${index}" name="${file}|${position}|${end || position + 3}|${cname}${isUncertain}" class='${activeTable} border-top border-2 border-secondary ${dayNight}'>
            <td class='text-start text-nowrap timeOfDay ${showTimeOfDay}'>${UI_timestamp}</td>
            <td class="text-start timestamp ${showTimestamp}">${UI_position} </td>
            <td name="${cname}" class='text-start cname'>
            <span class="cname">${cname}</span> ${countIcon} ${iconizeScore(score)}
             </td>
             <td class="text-end call-count ${hide}">${callCount || 'Present'} </td>
            
            <td class="label ${hide}">${labelHTML}</td>
            <td class="comment text-end ${hide}">${commentHTML}</td>
            
        </tr>`;
    }
    updateResultTable(tr, isFromDB, selection);
}


let resultsBuffer, detectionsModal;
const detectionsModalDiv = document.getElementById('detectionsModal')

detectionsModalDiv.addEventListener('hide.bs.modal', (e) => {
    worker.postMessage({ action: 'update-state', selection: undefined });
    //worker.postMessage({ action: 'change-mode', mode: STATE.mode })
});


// const detectionsDismiss = document.getElementById('detections-dismiss');
// detectionsDismiss.addEventListener('click', event => {
//     const rows = detectionsModalDiv.querySelectorAll('tr');
//     const positions = new Set();
//     let count = 0;
//     rows.forEach(row => {
//         if (!row.classList.contains('text-bg-dark')) {
//             const [, start, end] = unpackNameAttr(row);
//             if (start) positions.add([start, end])
//         }
//     });
//     deleteRecord(positions);
//     if (activeRow && activeRow.closest('#results')) {
//         // Remove the initiating detection from the main results table
//         resultTable = document.getElementById('resultTableBody');
//         const rowIndex = activeRow.rowIndex;
//         resultTable.deleteRow(rowIndex - 1);
//         // if (resultTable.rows.length){
//         //     resultTable.rows(rowIndex).click();
//         // }
//     }
//     //clearActive()
// });

// const detectionsAdd = document.getElementById('detections-add');
// detectionsAdd.addEventListener('click', () => {
//     worker.postMessage({
//         action: 'filter',
//         species: isSpeciesViewFiltered(true)
//     })
// })

const updateResultTable = (row, isFromDB, isSelection) => {
    const table = isSelection ? selectionTable : resultTable;
    if (isFromDB && !isSelection) {
        if (!resultsBuffer) resultsBuffer = table.cloneNode();
        resultsBuffer.lastElementChild ?
            resultsBuffer.lastElementChild.insertAdjacentHTML('afterend', row) :
            resultsBuffer.innerHTML = row;
        table.replaceWith(resultsBuffer);
    } else {
        if (isSelection) {
            if (!detectionsModal || !detectionsModal._isShown) {
                detectionsModal = new bootstrap.Modal('#detectionsModal', { backdrop: 'static' });
                detectionsModal.show();
                //clearActive()
            }
        }
        table.lastElementChild ? table.lastElementChild.insertAdjacentHTML('afterend', row) :
            table.innerHTML = row;
    }
};

const isExplore = () => {
    return STATE.mode === 'explore';
    //return !document.getElementById('exploreWrapper').classList.contains('d-none');
};



const tags = {
    Local: '<span class="badge bg-success rounded-pill">Local</span>',
    Nocmig: '<span class="badge bg-dark rounded-pill">Nocmig</span>',
}

// Results event handlers

function setClickedIndex(target) {
    const clickedNode = target.closest('tr');
    clickedIndex = clickedNode.rowIndex;
}

const deleteRecord = (target) => {
    let isBatch = false;
    if (target instanceof PointerEvent) target = activeRow;
    else {
        target.forEach(position => {
            const [start, end] = position;
            worker.postMessage({
                action: 'delete',
                file: currentFile,
                start: start,
                end: end
            })
        })
        activeRow = undefined;
        return
    }
    if (target.childElementCount === 2) return; // No detections found in selection

    setClickedIndex(target);
    const [file, start, end,] = unpackNameAttr(target);
    const setting = target.closest('table');
    const row = target.closest('tr');

    worker.postMessage({
        action: 'delete',
        file: file,
        start: start,
        end: end,
        species: getSpecies(target),
        speciesFiltered: isSpeciesViewFiltered()
    })
    // Clear the record in the UI
    const index = row.rowIndex
    setting.deleteRow(index);
    setting.rows[index]?.click()

}

const deleteSpecies = (target) => {
    worker.postMessage({
        action: 'delete-species',
        species: getSpecies(target),
        speciesFiltered: isSpeciesViewFiltered()
    })
    // Clear the record in the UI
    const row = target.closest('tr');
    const table = document.getElementById('resultSummary')
    table.deleteRow(row.rowIndex);
    resultTable = document.getElementById('resultTableBody');
    resultTable.innerHTML = '';
}

const getSelectionRange = () => {
    return STATE.selection ?
        { start: (STATE.selection.start * 1000) + fileStart, end: (STATE.selection.end * 1000) + fileStart } :
        undefined
}

function formatSpeciesName(filename) {
    filename = filename.replace(' - ', '~').replace(/\s+/g, '_',);
    if (!filename.includes('~')) filename = filename + '~' + filename; // dummy latin
    return filename;
}


function sendFile(mode, result) {
    let start, end, filename;
    if (result) {
        start = result.position;
        end = result.end || start + 3;
        filename = result.filename + `.${config.audio.format}`;
    } else if (start === undefined) {
        if (region.start) {
            start = region.start + bufferBegin;
            end = region.end + bufferBegin;
        } else {
            start = 0;
            end = currentBuffer.duration;
        }
        const dateString = new Date(fileStart + (start * 1000)).toISOString().replace(/[TZ]/g, ' ').replace(/\.\d{3}/, '').replace(/[-:]/g, '-').trim();
        filename = dateString + '_export.' + config.audio.format;
    }

    let metadata = {
        lat: config.latitude,
        lon: config.longitude,
        Artist: 'Chirpity',
        date: new Date().getFullYear(),
        version: version
    };
    if (result) {
        metadata = {
            ...metadata,
            UUID: config.UUID,
            start: start,
            end: end,
            filename: result.filename,
            cname: result.cname,
            sname: result.sname,
            score: result.score,
            date: result.date
        };
    }

    if (mode === 'save') {
        worker.postMessage({
            action: 'save',
            start: start, file: currentFile, end: end, filename: filename, metadata: metadata
        })
    } else {
        if (!config.seenThanks) {
            alert('Thank you, your feedback helps improve Chirpity predictions');
            config.seenThanks = true;
            updatePrefs()
        }
        worker.postMessage({
            action: 'post',
            start: start, file: currentFile, end: end, defaultName: filename, metadata: metadata, mode: mode
        })
    }
}

const iconDict = {
    guess: '<span class="confidence-row"><span class="confidence bar" style="flex-basis: --%; background: grey">--%</span></span>',
    low: '<span class="confidence-row"><span class="confidence bar" style="flex-basis: --%; background: rgba(255,0,0,0.5)">--%</span></span>',
    medium: '<span class="confidence-row"><span class="confidence bar" style="flex-basis: --%; background: #fd7e14">--%</span></span>',
    high: '<span class="confidence-row"><span class="confidence bar" style="flex-basis: --%; background: #198754">--%</span></span>',
    confirmed: '<span class="material-icons-two-tone text-muted" title="Record Archived">star</span>',
}


const iconizeScore = (score) => {
    const tooltip = score.toString();
    if (score < 50) return iconDict['guess'].replaceAll('--', tooltip);
    else if (score < 65) return iconDict['low'].replaceAll('--', tooltip);
    else if (score < 85) return iconDict['medium'].replaceAll('--', tooltip);
    else if (score <= 100) return iconDict['high'].replaceAll('--', tooltip);
    else return iconDict['confirmed']
}

// File menu handling

const exportAudio = () => {
    let result;
    if (region.attributes.label) {
        setClickedIndex(activeRow);
        result = predictions[clickedIndex]
    }
    sendFile('save', result)
}

document.getElementById('open').addEventListener('click', showOpenDialog);
document.getElementById('saveLabels').addEventListener('click', showSaveDialog);
document.getElementById('export-audio').addEventListener('click', exportAudio);




document.getElementById('exit').addEventListener('click', exitApplication);

// Help menu handling
document.getElementById('keyboard').addEventListener('click', async () => {
    await populateHelpModal('Help/keyboard.html', 'Keyboard shortcuts');
});
document.getElementById('settings').addEventListener('click', async () => {
    await populateHelpModal('Help/settings.html', 'Settings Help');
});
document.getElementById('usage').addEventListener('click', async () => {
    await populateHelpModal('Help/usage.html', 'Usage Guide');
});

const populateHelpModal = async (file, label) => {
    document.getElementById('helpModalLabel').innerText = label;
    const response = await fetch(file);
    document.getElementById('helpModalBody').innerHTML = await response.text();
    const help = new bootstrap.Modal(document.getElementById('helpModal'));
    help.show();
}

// Prevent the settings menu disappearing on click
document.getElementById('settingsMenu').addEventListener('click', (e) => {
    e.stopImmediatePropagation();
})

function setNocmig(on) {
    if (on) {
        nocmigButton.innerText = 'bedtime';
        nocmigButton.title = 'Nocmig mode on';
        nocmigButton.classList.add('text-info');
    } else {
        nocmigButton.innerText = 'bedtime_off';
        nocmigButton.title = 'Nocmig mode off';
        nocmigButton.classList.remove('text-info');
    }
    nocmig.checked = config.detect.nocmig;
}

const changeNocmigMode = () => {
    config.detect.nocmig = !config.detect.nocmig;
    setNocmig(config.detect.nocmig);
    worker.postMessage({
        action: 'update-state',
        detect: { nocmig: config.detect.nocmig },
    });
    updatePrefs();
}

const contextAwareIconDisplay = () => {
    if (config.detect.contextAware) {
        contextAwareIcon.classList.add('text-warning');
        contextAwareIcon.title = "Context aware mode enabled";
    } else {
        contextAwareIcon.classList.remove('text-warning');
        contextAwareIcon.title = "Context aware mode disabled";
    }
};


const toggleContextAwareMode = () => {
    config.detect.contextAware = !config.detect.contextAware;
    contextAware.checked = config.detect.contextAware;
    contextAwareIconDisplay();
    if (config.detect.contextAware) {
        SNRSlider.disabled = true;
        config.filters.SNR = 0;
    } else if (config.backend !== 'webgl') {
        SNRSlider.disabled = false;
        config.filters.SNR = parseFloat(SNRSlider.value);
    }
    worker.postMessage({
        action: 'update-state',
        detect: { contextAware: config.detect.contextAware },
        filters: { SNR: config.filters.SNR },
    });
    updatePrefs()
}
contextAwareIcon.addEventListener('click', toggleContextAwareMode)


nocmigButton.addEventListener('click', changeNocmigMode);
nocmig.addEventListener('change', changeNocmigMode)

contextAware.addEventListener('change', toggleContextAwareMode)

const fullscreen = document.getElementById('fullscreen');

const toggleFullscreen = () => {
    if (config.fullscreen) {
        config.fullscreen = false;
        fullscreen.innerText = 'fullscreen';
    } else {
        config.fullscreen = true;
        fullscreen.innerText = 'fullscreen_exit';
    }
    adjustSpecDims(true, 1024);
}

fullscreen.addEventListener('click', toggleFullscreen);


const diagnosticMenu = document.getElementById('diagnostics');
diagnosticMenu.addEventListener('click', async function () {
    diagnostics['Model'] = config.model;
    diagnostics['Backend'] = config.backend;
    diagnostics['Batch size'] = config[config.backend].batchSize;
    diagnostics['Threads'] = config[config.backend].threads;
    diagnostics['Context'] = config.detect.contextAware;
    diagnostics['SNR'] = config.filters.SNR;
    diagnostics['List'] = config.list;
    let diagnosticTable = "<table class='table-hover table-striped p-2 w-100'>";
    for (let [key, value] of Object.entries(diagnostics)) {
        if (key === 'Audio Duration') { // Format duration as days, hours,minutes, etc.
            if (value < 3600) {
                value = new Date(value * 1000).toISOString().substring(14, 19);
                value = value.replace(':', ' minutes ').concat(' seconds');
            } else if (value < 86400) {
                value = new Date(value * 1000).toISOString().substring(11, 19)
                value = value.replace(':', ' hours ').replace(':', ' minutes ').concat(' seconds')
            } else {
                value = new Date(value * 1000).toISOString().substring(8, 19);
                const day = parseInt(value.slice(0, 2)) - 1;
                const daysString = day === 1 ? '1 day ' : day.toString() + ' days ';
                const dateString = daysString + value.slice(3);
                value = dateString.replace(':', ' hours ').replace(':', ' minutes ').concat(' seconds');
            }
        }
        diagnosticTable += `<tr><th scope="row">${key}</th><td>${value}</td></tr>`;
    }
    diagnosticTable += "</table>";
    $('#diagnosticsModalBody').html(diagnosticTable);
    const testModal = new bootstrap.Modal(document.getElementById('diagnosticsModal'));
    testModal.show();
});

// Transport controls handling
document.getElementById('playToggle').addEventListener('mousedown', async () => {
    await wavesurfer.playPause();
});

document.getElementById('zoomIn').addEventListener('click', zoomSpec);
document.getElementById('zoomOut').addEventListener('click', zoomSpec);

// Listeners to set and display batch size
const batchSizeSlider = document.getElementById('batch-size');

batchSizeSlider.addEventListener('input', (e) => {
    batchSizeValue.innerText = BATCH_SIZE_LIST[batchSizeSlider.value].toString();
})
batchSizeSlider.addEventListener('change', (e) => {
    config[config.backend].batchSize = BATCH_SIZE_LIST[e.target.value];
    loadModel();
    updatePrefs();
    // Reset region maxLength
    initRegion();
})


// Listeners to sort results table
const confidenceSort = document.getElementById('confidence-sort');
confidenceSort.addEventListener('click', () => {
    setSortOrder('score DESC ')
});

const timeSort = document.querySelectorAll('.time-sort');
timeSort.forEach(el => {
    el.addEventListener('click', () => {
        setSortOrder('dateTime')
    });
})


const setSortOrder = (order) => {
    STATE.sortOrder = order;
    worker.postMessage({ action: 'update-state', sortOrder: order })
    worker.postMessage({
        action: 'filter',
        species: isSpeciesViewFiltered(true)
    })

}
// Drag file to app window to open
document.addEventListener('dragover', (event) => {
    event.preventDefault();
    event.stopPropagation();
});

document.addEventListener('drop', async (event) => {
    event.preventDefault();
    event.stopPropagation();
    let filelist = [];
    for (const f of event.dataTransfer.files) {
        // Using the path attribute to get absolute file path
        filelist.push(f.path);
    }
    if (filelist.length) openFiles({ filePaths: filelist })
});


// Prevent drag for UI elements
document.body.addEventListener('dragstart', e => {
    e.preventDefault()
});

// Make modals draggable
$(".modal-header").on("mousedown", function (mousedownEvt) {
    const $draggable = $(this);
    const x = mousedownEvt.pageX - $draggable.offset().left,
        y = mousedownEvt.pageY - $draggable.offset().top;
    $("body").on("mousemove.draggable", function (mousemoveEvt) {
        $draggable.closest(".modal-content").offset({
            "left": mousemoveEvt.pageX - x,
            "top": mousemoveEvt.pageY - y
        });
    });
    $("body").one("mouseup", function () {
        $("body").off("mousemove.draggable");
    });
    $draggable.closest(".modal").one("bs.modal.hide", function () {
        $("body").off("mousemove.draggable");
    });
});

////////// Date Picker ///////////////

$(function () {
    const start = moment();
    const end = start;
    $('#chartRange, #exploreRange').each(function () {
        $(this).daterangepicker({
            autoUpdateInput: false,
            locale: {
                cancelLabel: 'Clear'
            },
            timePicker: true,
            timePicker24Hour: true,
            timePickerIncrement: 60,
            startDate: start,
            endDate: end,
            opens: "center",
            ranges: {
                'Last Night': [moment().startOf('day').add(12, 'hours').subtract(1, 'days'), moment().startOf('day').add(12, 'hours')],
                'Previous Night': [moment().startOf('day').add(12, 'hours').subtract(2, 'days'), moment().subtract(1, 'days').startOf('day').add(12, 'hours')],
                'Last 7 Nights': [moment().startOf('day').add(12, 'hours').subtract(6, 'days'), moment().startOf('day').add(12, 'hours')],
                'Last 30 Nights': [moment().startOf('day').add(12, 'hours').subtract(29, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                'This Year': [moment().startOf('year'), moment().endOf('year')],
                'Last Year': [moment().subtract(1, 'year').startOf('year'), moment().subtract(1, 'year').endOf('year')]
            }
        });
        $(this).on('apply.daterangepicker', function (ev, picker) {
            $(this).children('span').html(picker.startDate.format('MMMM D, YYYY') + ' - ' + picker.endDate.format('MMMM D, YYYY'));
            $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
            const dateRange = { start: picker.startDate._d.getTime(), end: picker.endDate._d.getTime() };
            if (worker) {
                // Update the seen species list
                worker.postMessage({ action: 'get-detected-species-list', range: dateRange, explore: isExplore() });
                if (this.id === 'chartRange') {
                    STATE.chart.range = dateRange;
                    worker.postMessage({ action: 'update-state', chart: STATE.chart })
                    t0 = Date.now();
                    worker.postMessage({
                        action: 'chart',
                        species: STATE.chart.species,
                        range: STATE.chart.range
                    });
                } else if (this.id === 'exploreRange') {
                    STATE.explore.range = dateRange;
                    worker.postMessage({ action: 'update-state', explore: STATE.explore })
                    worker.postMessage({
                        action: 'filter',
                        species: STATE.explore.species,
                        range: STATE.explore.range,
                    });
                }
            }
        });

        $(this).on('cancel.daterangepicker', function () {
            $(this).children('span').html('Apply a date filter');
            if (worker) {
                // Update the seen species list
                worker.postMessage({ action: 'get-detected-species-list', explore: isExplore() });
                if (this.id === 'chartRange') {
                    STATE.chart.range = { start: undefined, end: undefined };
                    worker.postMessage({ action: 'update-state', chart: STATE.chart })
                    t0 = Date.now();
                    worker.postMessage({
                        action: 'chart',
                        species: STATE.chart.species,
                        range: STATE.chart.range
                    });
                } else if (this.id === 'exploreRange') {
                    STATE.explore.range = { start: undefined, end: undefined };
                    worker.postMessage({ action: 'update-state', explore: STATE.explore })
                    worker.postMessage({
                        action: 'filter',
                        species: isSpeciesViewFiltered(true),
                    });
                }
            }
        });
    })
});


document.addEventListener("DOMContentLoaded", function () {
    enableKeyDownEvent();
    // make menu an accordion for smaller screens
    if (window.innerWidth < 768) {

        // close all inner dropdowns when parent is closed
        document.querySelectorAll('.navbar .dropdown').forEach(function (everydropdown) {
            everydropdown.addEventListener('hidden.bs.dropdown', function () {
                // after dropdown is hidden, then find all submenus
                this.querySelectorAll('.submenu').forEach(function (everysubmenu) {
                    // hide every submenu as well
                    everysubmenu.style.display = 'none';
                });
            })
        });

        document.querySelectorAll('.dropdown-menu a').forEach(function (element) {
            element.addEventListener('click', function (e) {
                let nextEl = this.nextElementSibling;
                if (nextEl?.classList.contains('submenu')) {
                    // prevent opening link if link needs to open dropdown
                    e.preventDefault();
                    if (nextEl.style.display === 'block') {
                        nextEl.style.display = 'none';
                    } else {
                        nextEl.style.display = 'block';
                    }

                }
            });
        })
    }
    // end if innerWidth
});


// Confidence thresholds
const thresholdDisplay = document.getElementById('threshold-value');
const confidenceDisplay = document.getElementById('confidence-value');
const confidenceSliderDisplay = document.getElementById('confidenceSliderContainer');
const confidenceSlider = document.getElementById('confidenceValue');
const confidenceRange = document.getElementById('confidence');


const setConfidence = (e) => {

    confidenceRange.value = e.target.value;
    handleThresholdChange(e);
}

thresholdDisplay.addEventListener('click', () => {
    confidenceSliderDisplay.classList.remove('d-none');
    confidenceTimerTimeout = setTimeout(hideConfidenceSlider, 750)
})

const hideConfidenceSlider = () => {
    confidenceSliderDisplay.classList.add('d-none');
}
let confidenceTimerTimeout;
confidenceSliderDisplay.addEventListener('mouseout', () => {
    confidenceTimerTimeout = setTimeout(hideConfidenceSlider, 2000)
})

confidenceSliderDisplay.addEventListener('mouseenter', () => {
    if (confidenceTimerTimeout) clearTimeout(confidenceTimerTimeout)
})

confidenceSliderDisplay.addEventListener('input', setConfidence);
confidenceSliderDisplay.addEventListener('mouseup', (e) => {
    hideConfidenceSlider()
});

function showThreshold(threshold) {
    thresholdDisplay.innerHTML = `<b>${threshold}%</b>`;
    confidenceDisplay.innerHTML = `<b>${threshold}%</b>`;
    confidenceSlider.value = threshold;
    confidenceRange.value = threshold;
}

const handleThresholdChange = (e) => {
    const threshold = parseInt(e.target.value);
    showThreshold(threshold);
    config.detect.confidence = threshold;
    updatePrefs();
    worker.postMessage({
        action: 'update-state',
        detect: { confidence: config.detect.confidence }
    });
    if (!PREDICTING && !resultTableElement[0].hidden) {
        worker.postMessage({
            action: 'filter',
            species: isSpeciesViewFiltered(true),
        });
    }
}
confidenceRange.addEventListener('input', handleThresholdChange);
// Filter handling
const filterIconDisplay = () => {
    if (config.filters.highPassFrequency || (config.filters.lowShelfAttenuation && config.filters.lowShelfFrequency) || config.filters.SNR) {
        audioFiltersIcon.classList.add('text-warning');
        audioFiltersIcon.title = 'Experimental audio filters applied';
    } else {
        audioFiltersIcon.classList.remove('text-warning')
        audioFiltersIcon.title = 'No audio filters applied';
    }
}
// High pass threshold
const showFilterEffect = () => {
    if (fileLoaded) {
        const position = wavesurfer.getCurrentTime() / windowLength;
        postBufferUpdate({ begin: bufferBegin, position: position })
    }
}

// SNR
const handleSNRchange = () => {
    config.filters.SNR = parseFloat(SNRSlider.value);
    if (config.filters.SNR > 0) {
        config.detect.contextAware = false;
        contextAware.disabled = true;

    } else {
        config.detect.contextAware = contextAware.checked;
        contextAware.disabled = false;
    }
    updatePrefs();
    worker.postMessage({ action: 'update-state', filters: { SNR: config.filters.SNR } })
    filterIconDisplay();
}


const SNRThreshold = document.getElementById('SNR-threshold');
const SNRSlider = document.getElementById('snrValue');
SNRSlider.addEventListener('input', () => {
    SNRThreshold.innerText = SNRSlider.value;
});
SNRSlider.addEventListener('change', handleSNRchange);

const handleHPchange = () => {
    config.filters.highPassFrequency = parseInt(HPSlider.value);
    updatePrefs();
    worker.postMessage({ action: 'update-state', filters: { highPassFrequency: config.filters.highPassFrequency } })
    showFilterEffect();
    filterIconDisplay();
}

const HPThreshold = document.getElementById('HP-threshold');
const HPSlider = document.getElementById('HighPassFrequency');
HPSlider.addEventListener('input', () => {
    HPThreshold.innerText = HPSlider.value + 'Hz';
});
HPSlider.addEventListener('change', handleHPchange);

// Low shelf threshold
const handleLowShelfchange = () => {
    config.filters.lowShelfFrequency = parseInt(LowShelfSlider.value);
    updatePrefs();
    worker.postMessage({ action: 'update-state', filters: { lowShelfFrequency: config.filters.lowShelfFrequency } })
    showFilterEffect();
    filterIconDisplay();
}

const LowShelfThreshold = document.getElementById('LowShelf-threshold');
const LowShelfSlider = document.getElementById('lowShelfFrequency');
LowShelfSlider.addEventListener('input', () => {
    LowShelfThreshold.innerText = LowShelfSlider.value + 'Hz';
});
LowShelfSlider.addEventListener('change', handleLowShelfchange);

// Low shelf gain
const handleAttenuationchange = () => {
    config.filters.lowShelfAttenuation = - parseInt(lowShelfAttenuation.value);
    updatePrefs();
    worker.postMessage({ action: 'update-state', filters: { lowShelfAttenuation: config.filters.lowShelfAttenuation } })
    showFilterEffect();
    filterIconDisplay();
}

const lowShelfAttenuation = document.getElementById('attenuation');
const lowShelfAttenuationThreshold = document.getElementById('attenuation-threshold');
lowShelfAttenuation.addEventListener('change', handleAttenuationchange);

lowShelfAttenuation.addEventListener('input', () => {
    lowShelfAttenuationThreshold.innerText = lowShelfAttenuation.value + 'dB';
});

// number of threads
const numberOfThreads = document.getElementById('threads-value');
const ThreadSlider = document.getElementById('thread-slider');
ThreadSlider.addEventListener('input', () => {
    numberOfThreads.innerText = ThreadSlider.value;
});
ThreadSlider.addEventListener('change', () => {
    config[config.backend].threads = parseInt(ThreadSlider.value);
    loadModel();
    updatePrefs();
});


// Audio preferences:

const showRelevantAudioQuality = () => {
    if (['mp3', 'opus'].includes(config.audio.format)) {
        audioBitrateContainer.classList.remove('d-none');
        audioQualityContainer.classList.add('d-none');
    } else if (config.audio.format === 'flac') {
        audioQualityContainer.classList.remove('d-none');
        audioBitrateContainer.classList.add('d-none');
    } else {
        audioQualityContainer.classList.add('d-none');
        audioBitrateContainer.classList.add('d-none');
    }
}

audioFormat.addEventListener('change', (e) => {
    config.audio.format = e.target.value;
    showRelevantAudioQuality();
    updatePrefs();
    worker.postMessage({ action: 'update-state', audio: config.audio })
});

audioBitrate.addEventListener('change', (e) => {
    config.audio.bitrate = e.target.value;
    updatePrefs();
    worker.postMessage({ action: 'update-state', audio: config.audio })
});

audioQuality.addEventListener('change', (e) => {
    config.audio.quality = e.target.value;
    updatePrefs();
    worker.postMessage({ action: 'update-state', audio: config.audio })
});

audioFade.addEventListener('change', (e) => {
    config.audio.fade = e.target.checked;
    updatePrefs();
    worker.postMessage({ action: 'update-state', audio: config.audio })
});

audioPadding.addEventListener('change', (e) => {
    config.audio.padding = e.target.checked;
    audioFade.disabled = !audioPadding.checked;
    updatePrefs();
    worker.postMessage({ action: 'update-state', audio: config.audio })
});

audioDownmix.addEventListener('change', (e) => {
    config.audio.downmix = e.target.checked;
    updatePrefs();
    worker.postMessage({ action: 'update-state', audio: config.audio })
});

function getSnameFromCname(cname) {
    for (let i = 0; i < labels.length; i++) {
        if (labels[i].includes(cname)) {
            return labels[i].split('_')[0];
        }
    }
    return null; // Substring not found in any item
}

$(document).on('click', function () {
    $("#context-menu").removeClass("show").hide();
})


// function buildSummaryMenu(menu, target) {
//     menu.html(`
//     <a class="dropdown-item" id="create-manual-record" href="#">
//         <span class="material-icons-two-tone">post_add</span> Edit Archive Records
//     </a>
//     <a class="dropdown-item" id="context-create-clip" href="#">
//         <span class="material-icons-two-tone">music_note</span> Export Audio Clips
//     </a>
//     <a class="dropdown-item" id="context-xc" href='#' target="xc">
//         <img src='img/logo/XC.png' alt='' style="filter:grayscale(100%);height: 1.5em"> View species on Xeno-Canto
//     </a>
//     <div class="dropdown-divider"></div>
//     <a class="dropdown-item" id="context-delete" href="#">
//         <span class='delete material-icons-two-tone'>delete_forever</span> Delete Records
//     </a>
// `);
//     const contextDelete = document.getElementById('context-delete');
//     contextDelete.addEventListener('click', function () {
//         deleteSpecies(target);
//     })
//     return contextDelete;
// }



$('#spectrogramWrapper, #resultTableContainer, #selectionResultTableBody').on('contextmenu', async function (e) {
    const target = e.target;
    if (target.classList.contains('circle')) return;

    const menu = $("#context-menu");
    let resultContext, summaryContext = '', selectionContext = '', plural = '';
    const inSummary = target.closest('#speciesFilter')
    if (target.closest('#resultTableBody')) resultContext = true;
    else if  ( inSummary ){
        summaryContext = 'd-none';
        plural = 's';
    }
    else if (target.closest('#selectionResultTableBody' )) { selectionContext = 'd-none' }
    
    let contextDelete;

    // If we haven't clicked the active row or we cleared the region, load the row we clicked
    if (resultContext || selectionContext || summaryContext){
        // Lets check if the summary needs to be filtered
        if (inSummary) {
            if ( ! target.closest('tr').classList.contains('text-warning')){
                target.click() // Wait for file to load
                await waitForFileLoad();
            }
        } else {
            target.click(); // Wait for file to load
            await waitForFileLoad();
        }
       
    }
    if (!summaryContext && activeRow === undefined && region === undefined) return;
    const createOrEdit = isExplore() && region?.attributes.label ? 'Edit' : 'Create';

    menu.html(`
        <a class="dropdown-item play ${summaryContext} ${selectionContext}"><span class='material-icons-two-tone'>play_circle_filled</span> Play</a>
        <a class="dropdown-item ${summaryContext} ${selectionContext}" href="#" id="context-analyse-selection">
            <span class="material-icons-two-tone">search</span> Analyse
        </a>
        <div class="dropdown-divider ${summaryContext} ${selectionContext}"></div>
        <a class="dropdown-item ${summaryContext} ${selectionContext}" id="create-manual-record" href="#">
            <span class="material-icons-two-tone">post_add</span> ${createOrEdit} Archive Record
        </a>
        <a class="dropdown-item" id="context-create-clip" href="#">
            <span class="material-icons-two-tone">music_note</span> Export Audio Clip${plural}
        </a>
        <a class="dropdown-item" id="context-xc" href='#' target="xc">
            <img src='img/logo/XC.png' alt='' style="filter:grayscale(100%);height: 1.5em"> View Species on Xeno-Canto
        </a>
        <div class="dropdown-divider ${selectionContext}"></div>
        <a class="dropdown-item ${selectionContext}" id="context-delete" href="#">
            <span class='delete material-icons-two-tone'>delete_forever</span> Delete Record${plural}
        </a>
    `);
    if (! selectionContext){
        const contextAnalyseSelectionLink = document.getElementById('context-analyse-selection');
        contextAnalyseSelectionLink.addEventListener('click', getSelectionResults);
        contextDelete = document.getElementById('context-delete');
        resultContext ? contextDelete.addEventListener('click', deleteRecord) :
                        contextDelete.addEventListener('click', function () {
                            deleteSpecies(target);
                        });
        }
    // Add event Handlers
    const exporLink = document.getElementById('context-create-clip');
    summaryContext ? exporLink.addEventListener('click', batchExportAudio) :
    exporLink.addEventListener('click', exportAudio) ;
    if (!(selectionContext || summaryContext)) {
        document.getElementById('create-manual-record').addEventListener('click', function (e) {
            if (e.target.innerText.indexOf('Edit') !== -1) {
                showRecordEntryForm('Update', summaryContext);
            } else {
                showRecordEntryForm('Add', summaryContext);
            }
        })
    }
    const xc = document.getElementById('context-xc');
    if (region?.attributes.label || summaryContext) {
        let cname;
        if (summaryContext) {
            const row = target.closest('tr');
            cname = row.querySelector('.cname .cname').innerText;
        } else {
            cname = region.attributes.label.replace('?', '');
        }
        const sname = getSnameFromCname(cname);
        const XC_type = cname.indexOf('(song)') !== -1 ? "song" :
            cname.indexOf('call)') !== -1 ? "nocturnal flight call" : "";
        xc.href = `https://xeno-canto.org/explore?query=${sname}%20type:"${XC_type}`;
        xc.classList.remove('d-none');
    }
    else {
        xc.classList.add('d-none');
        contextDelete.classList.add('d-none');
    }

    // Calculate menu positioning:
    const menuWidth = menu.outerWidth();
    const menuHeight = menu.outerHeight();
    let top = e.pageY - 50;
    let left = e.pageX;
    // Check if the menu would be displayed partially off-screen on the right
    if (left + menuWidth > window.innerWidth) {
        left = window.innerWidth - menuWidth - 15;
    }

    // Check if the menu would be displayed partially off-screen on the bottom
    if (top + menuHeight > window.innerHeight - 90) {
        top = window.innerHeight - menuHeight - 90;
    }

    menu.css({
        display: "block",
        top: top,
        left: left
    }).addClass("show");

    return false; //blocks default Webbrowser right click menu
})


const recordEntryModal = new bootstrap.Modal(document.getElementById('record-entry-modal'), { backdrop: 'static' });


async function showRecordEntryForm(mode, batch) {
    const cname = region.attributes.label.replace('?', '');
    let callCount = '', typeIndex = '', commentText = '';
    if (cname && activeRow) {
        // Populate the form with existing values
        commentText = activeRow.querySelector('.comment > span')?.title || '';

        callCount = activeRow.querySelector('.call-count').innerText;
        typeIndex = ['Local', 'Nocmig', ''].indexOf(activeRow.querySelector('.label').innerText);
    }
    const speciesList = `
    <div class="row">
        <div class="col-8">
            ${generateBirdOptionList({ store: 'allSpecies', rows: undefined, selected: cname })}
        </div>
        <div class="col"><div class="form-floating mb-3">
            <input type="number" id="call-count" value="${callCount}" class="form-control" min="1">
            <label for="call-count">Call Count</label>
        </div></div>
    </div>`;
    const label = `
    <fieldset class="border  ps-3 pt-1">
        <label for="record-label" class="text-muted" style="font-size: .75em">Call Type</label><br>
        <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="record-label" id="label-local" value="Local">
            <label class="form-check-label" for="label-local">Local</label>
        </div>
        <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="record-label" id="label-nocmig" value="Nocmig">
                <label class="form-check-label" for="label-nocmig">Nocmig</label>
        </div>
        <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="record-label" id="label-unknown" value="">
            <label class="form-check-label" for="label-unknown">Not specified</label>
        </div>
    </fieldset>`;
    const comment = `
    <div class="form-floating mt-3">
        <textarea class="form-control" id="record-comment" style="height: 200px">${commentText}</textarea>
        <label for="floatingTextarea2">Comments</label>
        <input type='hidden' id='DBmode' value='${mode}'>
        <input type='hidden' id='batch-mode' value='${batch}'>
    </div>`;
    $('#record-entry-modal-body').html(speciesList + label + comment);
    const action = document.getElementById('record-add')
    action.innerText = mode;
    if (typeIndex) document.querySelectorAll('input[name="record-label"]')[typeIndex].checked = true;

    document.removeEventListener('keydown', handleKeyDownDeBounce, true);
    recordEntryModal.show();
}

const insertManualRecord = (cname, start, end, comment, count, label, action, batch) => {
    const insert = (toDisk) => {
        worker.postMessage({
            action: 'insert-manual-record',
            cname: cname,
            start: start.toFixed(3),
            end: end.toFixed(3),
            comment: comment,
            count: count || null,
            file: currentFile,
            label: label,
            DBaction: action,
            batch: batch,
            toDisk: toDisk
        })
    }
    insert(true)

    if (STATE.mode === 'analyse') {
        //Update the record in the memory db as well
        insert(false)
    }
}

const recordEntryForm = document.getElementById('record-entry-form');
recordEntryForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const action = document.getElementById('DBmode').value;
    const batch = document.getElementById('batch-mode').value;
    const start = bufferBegin + region.start;
    const end = bufferBegin + region.end;
    const cname = document.getElementById('bird-list').value;
    // Update the region label
    region.attributes.label = cname;
    const count = document.getElementById('call-count').value;
    const comment = document.getElementById('record-comment').value;
    const label = document.querySelector('input[name="record-label"]:checked')?.value || '';
    recordEntryModal.hide();
    insertManualRecord(cname, start, end, comment, count, label, action)
})

const recordEntryModalDiv = document.getElementById('record-entry-modal')
recordEntryModalDiv.addEventListener('hidden.bs.modal', (e) => {
    document.addEventListener('keydown', handleKeyDownDeBounce, true);
    worker.postMessage({
        action: 'filter',
        species: isSpeciesViewFiltered(true),
        active: getActiveRowID(),
    });
});

const purgeFile = document.getElementById('purge-file');
purgeFile.addEventListener('click', () => {
    if (currentFile) {
        if (confirm(`This will remove ${currentFile} and all its associated data from the database archive. Proceed?`)) {
            worker.postMessage({
                action: 'purge-file',
                fileName: currentFile
            })
        }
    }
})


// Utility functions to wait for file to load
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
async function waitForFileLoad() {
while (!fileLoaded) {
        await delay(100); // Wait for 100 milliseconds before checking again
    }
}