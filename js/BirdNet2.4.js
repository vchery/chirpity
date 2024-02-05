const tf = require('@tensorflow/tfjs-node');
const fs = require('node:fs');
const path = require('node:path');
let DEBUG = false;
let BACKEND;

//GLOBALS
let myModel;
// const MIGRANTS = new Set(["Pluvialis dominica_American Golden Plover", "Acanthis hornemanni_Arctic Redpoll", "Sterna paradisaea_Arctic Tern", "Recurvirostra avosetta_Avocet", "Porzana pusilla_Baillon's Crake", "Limosa lapponica_Bar-tailed Godwit", "Tyto alba_Barn Owl", "Branta leucopsis_Barnacle Goose", "Cygnus columbianus_Bewick's Swan", "Botaurus stellaris_Bittern", "Chroicocephalus ridibundus_Black-headed Gull", "Podiceps nigricollis_Black-necked Grebe", "Limosa limosa_Black-tailed Godwit", "Turdus merula_Blackbird", "Sylvia atricapilla_Blackcap", "Fringilla montifringilla_Brambling", "Branta bernicla_Brent Goose", "Branta canadensis_Canada Goose", "Larus cachinnans_Caspian Gull", "Phylloscopus collybita_Chiffchaff", "Loxia curvirostra_Common Crossbill", "Larus canus_Common Gull", "Acanthis flammea_Common Redpoll", "Actitis hypoleucos_Common Sandpiper", "Melanitta nigra_Common Scoter", "Sterna hirundo_Common Tern", "Fulica atra_Coot", "Crex crex_Corncrake", "Cuculus canorus_Cuckoo", "Calidris ferruginea_Curlew Sandpiper", "Numenius arquata_Curlew", "Charadrius morinellus_Dotterel", "Calidris alpina_Dunlin", "Prunella modularis_Dunnock", "Alopochen aegyptiaca_Egyptian Goose", "Turdus pilaris_Fieldfare", "Mareca strepera_Gadwall", "Sylvia borin_Garden Warbler", "Spatula querquedula_Garganey", "Regulus regulus_Goldcrest", "Pluvialis apricaria_Golden Plover", "Bucephala clangula_Goldeneye", "Mergus merganser_Goosander", "Locustella naevia_Grasshopper Warbler", "Larus marinus_Great Black-backed Gull", "Podiceps cristatus_Great Crested Grebe", "Tringa ochropus_Green Sandpiper", "Tringa nebularia_Greenshank", "Ardea cinerea_Grey Heron", "Perdix perdix_Grey Partridge", "Phalaropus fulicarius_Grey", "Pluvialis squatarola_Grey Plover", "Motacilla cinerea_Grey Wagtail ", "Anser anser_Greylag Goose", "Delichon urbicum_House Martin", "Coccothraustes coccothraustes_Hawfinch", "Larus argentatus_Herring Gull", "Lymnocryptes minimus_Jack Snipe", "Alcedo atthis_Kingfisher", "Calidris canutus_Knot", "Calcarius lapponicus_Lapland Bunting", "Larus fuscus_Lesser Black-backed Gull", "Acanthis cabaret_Lesser Redpoll ", "Sylvia curruca_Lesser Whitethroat", "Linaria cannabina_Linnet", "Egretta garzetta_Little Egret", "Tachybaptus ruficollis_Little Grebe", "Hydrocoloeus minutus_Little Gull", "Athene noctua_Little Owl", "Charadrius dubius_Little Ringed Plover", "Calidris minuta_Little Stint ", "Sternula albifrons_Little Tern", "Asio otus_Long-eared Owl", "Clangula hyemalis_Long-tailed Duck", "Anas platyrhynchos_Mallard", "Aix galericulata_Mandarin Duck", "Anthus pratensis_Meadow Pipit", "Ichthyaetus melanocephalus_Mediterranean Gull", "Turdus viscivorus_Mistle Thrush", "Gallinula chloropus_Moorhen", "Nycticorax nycticorax_Night Heron", "Luscinia megarhynchos_Nightingale", "Luscinia megarhynchos_Nightingale (song)", "Caprimulgus europaeus_Nightjar", "Anthus hodgsoni_Olive-backed Pipit", "Emberiza hortulana_Ortolan Bunting", "Emberiza pusilla_Little Bunting", "Haematopus ostralegus_Oystercatcher", "Ficedula hypoleuca_Pied Flycatcher", "Motacilla alba_Pied Wagtail", "Anser brachyrhynchus_Pink-footed Goose", "Anas acuta_Pintail", "Aythya ferina_Pochard", "Calidris maritima_Purple Sandpiper", "Coturnix coturnix_Quail", "Mergus serrator_Red-breasted Merganser", "Netta rufina_Red-crested Pochard", "Alectoris rufa_Red-legged Partridge", "Tringa totanus_Redshank", "Phoenicurus phoenicurus_Redstart", "Turdus iliacus_Redwing", "Emberiza schoeniclus_Reed Bunting", "Acrocephalus scirpaceus_Reed Warbler", "Turdus torquatus_Ring Ouzel", "Charadrius hiaticula_Ringed Plover", "Erithacus rubecula_Robin (flight call)", "Anthus petrosus_Rock Pipit", "Sterna dougallii_Roseate Tern", "Calidris pugnax_Ruff", "Riparia riparia_Sand Martin", "Calidris alba_Sanderling", "Thalasseus sandvicensis_Sandwich Tern", "Aythya marila_Scaup", "Loxia scotica_Scottish Crossbill", "Acrocephalus schoenobaenus_Sedge Warbler", "Tadorna tadorna_Shelduck", "Asio flammeus_Short-eared Owl", "Spatula clypeata_Shoveler", "Spinus spinus_Siskin", "Alauda arvensis_Skylark", "Gallinago gallinago_Snipe", "Plectrophenax nivalis_Snow Bunting", "Turdus philomelos_Song Thrush", "Porzana porzana_Spotted Crake", "Muscicapa striata_Spotted Flycatcher", "Tringa erythropus_Spotted Redshank", "Burhinus oedicnemus_Stone-curlew", "Saxicola rubicola_Stonechat", "Hirundo rustica_Swallow", "Apus apus_Swift", "Anser fabalis_Taiga Bean Goose", "Strix aluco_Tawny Owl", "Anas crecca_Teal", "Anthus trivialis_Tree Pipit", "Aythya fuligula_Tufted Duck", "Anser serrirostris_Tundra Bean Goose", "Arenaria interpres_Turnstone", "Anthus spinoletta_Water Pipit", "Rallus aquaticus_Water Rail", "Numenius phaeopus_Whimbrel", "Anser albifrons_White-fronted Goose", "Sylvia communis_Whitethroat", "Cygnus cygnus_Whooper Swan", "Mareca penelope_Wigeon", "Phylloscopus trochilus_Willow Warbler", "Tringa glareola_Wood Sandpiper", "Scolopax rusticola_Woodcock", "Lullula arborea_Woodlark", "Larus michahellis_Yellow-legged Gull", "Motacilla flava_Yellow Wagtail", "Emberiza citrinella_Yellowhammer"]);
const NOT_BIRDS = [
    'Dog_Dog', 
    'Environmental_Environmental', 
    'Engine_Engine', 
    'Fireworks_Fireworks', 
    'Gun_Gun', 
    'Human non-vocal_Human non-vocal', 
    'Human vocal_Human vocal', 
    'Human whistle_Human whistle', 
    'Miogryllus saussurei_Miogryllus saussurei', 
    'Noise_Noise', 
    'Power tools_Power tools', 
    'Siren_Siren',
    "Canis latrans_Coyote",
    "Canis lupus_Gray Wolf",
    "Gastrophryne carolinensis_Eastern Narrow-mouthed Toad",
    "Gastrophryne olivacea_Great Plains Narrow-mouthed Toad",
    "Incilius valliceps_Gulf Coast Toad",
    "Anaxyrus americanus_American Toad",
    "Anaxyrus canorus_Yosemite Toad",
    "Anaxyrus cognatus_Great Plains Toad",
    "Anaxyrus fowleri_Fowler's Toad",
    "Anaxyrus houstonensis_Houston Toad",
    "Anaxyrus microscaphus_Arizona Toad",
    "Anaxyrus quercicus_Oak Toad",
    "Anaxyrus speciosus_Texas Toad",
    "Anaxyrus terrestris_Southern Toad",
    "Anaxyrus woodhousii_Woodhouse's Toad",
    "Dryophytes andersonii_Pine Barrens Treefrog",
    "Dryophytes arenicolor_Canyon Treefrog",
    "Dryophytes avivoca_Bird-voiced Treefrog",
    "Dryophytes chrysoscelis_Cope's Gray Treefrog",
    "Dryophytes cinereus_Green Treefrog",
    "Dryophytes femoralis_Pine Woods Treefrog",
    "Dryophytes gratiosus_Barking Treefrog",
    "Dryophytes squirellus_Squirrel Treefrog",
    "Dryophytes versicolor_Gray Treefrog",
    "Eleutherodactylus planirostris_Greenhouse Frog",
    "Hyliola regilla_Pacific Chorus Frog",
    "Lithobates catesbeianus_American Bullfrog",
    "Lithobates clamitans_Green Frog",
    "Lithobates palustris_Pickerel Frog",
    "Lithobates sylvaticus_Wood Frog",
    "Pseudacris brimleyi_Brimley's Chorus Frog",
    "Pseudacris clarkii_Spotted Chorus Frog",
    "Pseudacris crucifer_Spring Peeper",
    "Pseudacris feriarum_Upland Chorus Frog",
    "Pseudacris nigrita_Southern Chorus Frog",
    "Pseudacris ocularis_Little Grass Frog",
    "Pseudacris ornata_Ornate Chorus Frog",
    "Pseudacris streckeri_Strecker's Chorus Frog",
    "Pseudacris triseriata_Striped Chorus Frog",
    "Acris crepitans_Northern Cricket Frog",
    "Acris gryllus_Southern Cricket Frog",
    "Eunemobius carolinus_Carolina Ground Cricket",
    "Eunemobius confusus_Confused Ground Cricket",
    "Gryllus assimilis_Gryllus assimilis",
    "Gryllus fultoni_Southern Wood Cricket",
    "Gryllus pennsylvanicus_Fall Field Cricket",
    "Gryllus rubens_Southeastern Field Cricket",
    "Neonemobius cubensis_Cuban Ground Cricket",
    "Oecanthus celerinictus_Fast-calling Tree Cricket",
    "Oecanthus exclamationis_Davis's Tree Cricket",
    "Oecanthus fultoni_Snowy Tree Cricket",
    "Oecanthus nigricornis_Blackhorned Tree Cricket",
    "Oecanthus niveus_Narrow-winged Tree Cricket",
    "Oecanthus pini_Pine Tree Cricket",
    "Oecanthus quadripunctatus_Four-spotted Tree Cricket",
    "Orocharis saltator_Jumping Bush Cricket",
    "Alouatta pigra_Mexican Black Howler Monkey",
    "Tamias striatus_Eastern Chipmunk",
    "Tamiasciurus hudsonicus_Red Squirrel"];
const MYSTERIES = ['Unknown Sp._Unknown Sp.'];
const GRAYLIST = [];
const GOLDEN_LIST = [] 
let BLOCKED_IDS = [];
let SUPPRESSED_IDS = [];
let ENHANCED_IDS = [];
const CONFIG = {
    sampleRate: 48_000, specLength: 3, sigmoid: 1,
};


onmessage = async (e) => {
    const modelRequest = e.data.message;
    let response;
    try {
        switch (modelRequest) {
            case "load": {
                const version = e.data.model;
                DEBUG && console.log("load request to worker");
                const { height: height, width: width, location: location } = JSON.parse(fs.readFileSync(path.join(__dirname, `../${version}_model_config.json`), "utf8"));
                const appPath = "../" + location + "/";
                const list = e.data.list;
                const batch = e.data.batchSize;
                const backend = e.data.backend;
                let labels;
                const labelFile = `../labels/V2.4/BirdNET_GLOBAL_6K_V2.4_Labels_en.txt`; 
                await fetch(labelFile).then(response => {
                    if (! response.ok) throw new Error('Network response was not ok');
                    return response.text();
                }).then(filecontents => {
                    labels = filecontents.trim().split(/\r?\n/);
                }).catch(error =>{
                    console.error('There was a problem fetching the label file:', error);
                })


                // labels.push(...MYSTERIES);
                // postMessage({
                //     message: "labels",
                //     labels: labels
                // });
                DEBUG && console.log(`model received load instruction. Using list: ${list}, batch size ${batch}`);
                
                tf.setBackend(backend).then(async () => {
                    if (backend === "webgl") {
                        tf.env().set("WEBGL_FORCE_F16_TEXTURES", true);
                        tf.env().set("WEBGL_PACK", true);
                        tf.env().set("WEBGL_EXP_CONV", true);
                        tf.env().set("TOPK_K_CPU_HANDOFF_THRESHOLD", 128);
                        tf.env().set("TOPK_LAST_DIM_CPU_HANDOFF_SIZE_THRESHOLD", 0);
                    }
                    tf.enableProdMode();
                    if (DEBUG) {
                        console.log(tf.env());
                        console.log(tf.env().getFlags());
                    }
                    myModel = new Model(appPath, list, version);
                    myModel.height = height;
                    myModel.width = width;
                    myModel.labels = labels;
                    myModel.lat = parseFloat(e.data.lat);
                    myModel.lon = parseFloat(e.data.lon);
                    myModel.week = parseInt(e.data.week);
                    myModel.speciesThreshold = parseFloat(e.data.threshold);
                    await myModel.loadModel();
                    postMessage({
                        message: "update-list",
                        blocked: BLOCKED_IDS,
                        lat: myModel.lat,
                        lon: myModel.lon,
                        week: myModel.week,
                        updateResults: false
                    });
                    myModel.warmUp(batch);
                    BACKEND = tf.getBackend();
                    postMessage({
                        message: "model-ready",
                        sampleRate: myModel.config.sampleRate,
                        chunkLength: myModel.chunkLength,
                        backend: tf.getBackend(),
                        labels: labels
                    });
                });
                break;
            }
            case "predict": {
                if (myModel.model_loaded) {
                    const { chunks: chunks, start: start, fileStart: fileStart, file: file, snr: snr, confidence: confidence, worker: worker, context: context, resetResults: resetResults } = e.data;
                    myModel.useContext = context;
                    myModel.selection =  !resetResults;
                    const [result,filename,startPosition] = await myModel.predictChunk(chunks, start, fileStart, file, snr, confidence / 1000);
                    response = {
                        message: "prediction",
                        file: filename,
                        result: result,
                        fileStart: startPosition,
                        worker: worker,
                        selection: myModel.selection
                    };
                    postMessage(response);
                    myModel.result = [];
                }
                break;
            }
            case "get-spectrogram": {
                const buffer = e.data.buffer;
                const specFile = e.data.file;
                const filepath = e.data.filepath;
                const spec_height = e.data.height;
                const spec_width = e.data.width;
                let image;
                if (buffer.length !== 72000) {
                    console.log((`Skipping ${e.data.file} as buffer size is ${buffer.length}`))
                    return;
                }
                const signal = tf.tensor1d(buffer, "float32");
                const bufferTensor = myModel.normalise_audio(signal);
                signal.dispose();
                const imageTensor = tf.tidy(() => {
                    return myModel.makeSpectrogram(bufferTensor);
                });
                image = tf.tidy(() => {
                    let spec = myModel.fixUpSpecBatch(tf.expandDims(imageTensor, 0), spec_height, spec_width);
                    const spec_max = tf.max(spec);
                    return spec.mul(255).div(spec_max).dataSync();
                });
                bufferTensor.dispose();
                imageTensor.dispose();
                response = {
                    message: "spectrogram",
                    width: 384,
                    height: 256,
                    channels: 1,
                    image: image,
                    file: specFile,
                    filepath: filepath
                };
                postMessage(response);
                break;
            }
            case "list": {
                myModel.list = e.data.list;
                myModel.lat = parseFloat(e.data.lat);
                myModel.lon = parseFloat(e.data.lon);
                myModel.week = parseInt(e.data.week) || myModel.week;
                myModel.speciesThreshold = parseFloat(e.data.threshold);
                DEBUG && console.log(`Setting list to ${myModel.list}`);
                await myModel.setList();
                postMessage({
                    message: "update-list",
                    blocked: BLOCKED_IDS,
                    lat: myModel.lat,
                    lon: myModel.lon,
                    week: myModel.week,
                    updateResults: false
                });
                break;
            }
        }
    }
    // If worker was respawned
    catch (error) {
        console.log(error)
    }
};

class Model {
    constructor(appPath, list, version) {
        this.model = undefined;
        this.labels = undefined;
        this.height = undefined;
        this.width = undefined;
        this.config = CONFIG;
        this.chunkLength = this.config.sampleRate * this.config.specLength;
        this.model_loaded = false;
        this.frame_length = 512;
        this.frame_step = 186;
        this.appPath = appPath;
        this.list = list;
        this.useContext = undefined;
        this.version = version;
        this.selection = false;
    }

    async loadModel() {
        DEBUG && console.log('loading model')
        if (this.model_loaded === false) {
            // Model files must be in a different folder than the js, assets files
            DEBUG && console.log('loading model from', this.appPath + 'model.json')
            this.model = await tf.loadLayersModel(this.appPath + 'model.json',
                { weightPathPrefix: this.appPath });
            this.model_loaded = true;
            this.inputShape = [...this.model.inputs[0].shape];
            const mdata_model_path = this.appPath + 'mdata/model.json'
            this.metadata_model = await tf.loadGraphModel(mdata_model_path,  
                );
            await this.setList();
        }
    }

    warmUp(batchSize) {
        this.batchSize = parseInt(batchSize);
        this.inputShape[0] = this.batchSize;
        if (tf.getBackend() === 'webgl') {
            tf.tidy(() => {
                //const warmupResult = this.model.predict(tf.zeros(this.inputShape), { batchSize: this.batchSize });
                const warmupResult = this.model.predict(tf.zeros([1,144_000]), { batchSize: this.batchSize });
                warmupResult.arraySync();
                // see if we can get padding compiled at this point
                //this.padBatch(tf.zeros([1, this.inputShape[1], this.inputShape[2], this.inputShape[3]]), { batchSize: this.batchSize })
            })
        }
        DEBUG && console.log('WarmUp end', tf.memory().numTensors)
        return true;
    }

    async setList() {
        BLOCKED_IDS = [];
        if (this.list === "everything") return
        else if (this.list === 'location'){
            const lat = this.lat;
            const lon = this.lon;
            const week = this.week;
            DEBUG && console.log('lat', lat, 'lon', lon, 'week', week)
            this.mdata_input = tf.tensor([lat, lon, week]).expandDims(0);
            const mdata_prediction = this.metadata_model.predict(this.mdata_input);
            const mdata_probs = await mdata_prediction.data();
            //const mdata_probs_sorted = mdata_probs.slice().sort().reverse();
            let count = 0
            for (let i = 0; i < mdata_probs.length; i++) {
                if (mdata_probs[i] > this.speciesThreshold) {
                    count++;
                    DEBUG && console.log("including:", this.labels[i] + ': ' + mdata_probs[i]);
                } else {
                    DEBUG && console.log("Excluding:", this.labels[i] + ': ' + mdata_probs[i]);
                    // Hack to add Dotterel??
                    //if (! this.labels[i].includes('Dotterel')) 
                    BLOCKED_IDS.push(i)
                }
            }
            DEBUG && console.log('Total species considered at this location: ', count)
        }
        else {
            // find the position of the blocked items in the label list
            NOT_BIRDS.forEach(notBird => BLOCKED_IDS.push(this.labels.indexOf(notBird)))
        }
    }

    normalize(spec) {
        return tf.tidy(() => {
            // console.log('Pre-norm### Min is: ', spec.min().dataSync(), 'Max is: ', spec.max().dataSync())
            const spec_max = tf.max(spec, [1, 2]).reshape([-1, 1, 1, 1])
            // const spec_min = tf.min(spec, [1, 2]).reshape([-1, 1, 1, 1])
            spec = spec.mul(255);
            spec = spec.div(spec_max);
            // spec = tf.sub(spec, spec_min).div(tf.sub(spec_max, spec_min));
            // console.log('{Post norm#### Min is: ', spec.min().dataSync(), 'Max is: ', spec.max().dataSync())
            return spec
        })
    }

    getSNR(spectrograms) {
        return tf.tidy(() => {
            const { mean, variance } = tf.moments(spectrograms, 2);
            const peak = tf.div(variance, mean)
            let snr = tf.squeeze(tf.max(peak, 1));
            //snr = tf.sub(255, snr)  // bigger number, less signal
            // const MEAN = mean.arraySync()
            // const VARIANCE = variance.arraySync()
            // const PEAK = peak.arraySync()
            return snr
        })
    }


    fixUpSpecBatch(specBatch, h, w) {
        const img_height = h || this.height;
        const img_width = w || this.width;
        return tf.tidy(() => {
            /*
            Try out taking log of spec when SNR is below threshold?
            */
            //specBatch = tf.log1p(specBatch).mul(20);
            // Swap axes to fit output shape
            specBatch = tf.transpose(specBatch, [0, 2, 1]);
            specBatch = tf.reverse(specBatch, [1]);
            // Add channel axis
            specBatch = tf.expandDims(specBatch, -1);
            //specBatch = tf.slice4d(specBatch, [0, 1, 0, 0], [-1, img_height, img_width, -1]);
            specBatch = tf.image.resizeBilinear(specBatch, [img_height, img_width], true);
            return this.version === 'v1' ? specBatch : this.normalize(specBatch)
        })
    }

    padBatch(tensor) {
        return tf.tidy(() => {
            DEBUG && console.log(`Adding ${this.batchSize - tensor.shape[0]} tensors to the batch`)
            const shape = [...tensor.shape];
            shape[0] = this.batchSize - shape[0];
            const padding = tf.zeros(shape);
            return tf.concat([tensor, padding], 0)
        })
    }

    addContext(prediction, tensor, confidence) {
        // Create a set of images from the batch, offset by half the width of the original images
        const [_, height, width, channel] = tensor.shape;
        return tf.tidy(() => {
            const firstHalf = tensor.slice([0, 0, 0, 0], [-1, -1, width / 2, -1]);
            const secondHalf = tensor.slice([0, 0, width / 2, 0], [-1, -1, width / 2, -1]);
            const paddedSecondHalf = tf.concat([tf.zeros([1, height, width / 2, channel]), secondHalf], 0);
            secondHalf.dispose();
            // prepend padding tensor
            const [droppedSecondHalf, _] = paddedSecondHalf.split([paddedSecondHalf.shape[0] - 1, 1]);  // pop last tensor
            paddedSecondHalf.dispose();
            const combined = tf.concat([droppedSecondHalf, firstHalf], 2);  // concatenate adjacent pairs along the width dimension
            firstHalf.dispose();
            droppedSecondHalf.dispose();
            const rshiftPrediction = this.model.predict(combined, { batchSize: this.batchSize });
            combined.dispose();
            // now we have predictions for both the original and rolled images
            const [padding, remainder] = tf.split(rshiftPrediction, [1, -1]);
            const lshiftPrediction = tf.concat([remainder, padding]);
            // Get the highest predictions from the overlapping images
            const surround = tf.maximum(rshiftPrediction, lshiftPrediction);
            lshiftPrediction.dispose();
            rshiftPrediction.dispose();
            // Mask out where these are below the threshold
            const indices = tf.greater(surround, confidence);
            return prediction.where(indices, 0);
        })
    }

    async predictBatch(audio, keys, threshold, confidence) {
        const TensorBatch = audio; //this.fixUpSpecBatch(audio); // + 1 tensor
        
        let paddedTensorBatch, maskedTensorBatch;
        if (BACKEND === 'webgl' && TensorBatch.shape[0] < this.batchSize) {
            // WebGL works best when all batches are the same size
            paddedTensorBatch = this.padBatch(TensorBatch)  // + 1 tensor
        } else if (threshold) {
            if (this.version !== 'v1') threshold *= 4;
            const keysTensor = tf.stack(keys); // + 1 tensor
            const snr = this.getSNR(TensorBatch)
            const condition = tf.greaterEqual(snr, threshold); // + 1 tensor
            DEBUG && console.log('SNR is:', snr.dataSync())
            snr.dispose();
            // Avoid mask cannot be scalar error at end of predictions
            let newCondition;
            if (condition.rankType === "0") {
                newCondition = tf.expandDims(condition) // + 1 tensor
                condition.dispose() // - 1 tensor
            }
            const c = newCondition || condition;
            let maskedKeysTensor;
            [maskedTensorBatch, maskedKeysTensor] = await Promise.all([
                tf.booleanMaskAsync(TensorBatch, c),
                tf.booleanMaskAsync(keysTensor, c)]) // + 2 tensor
            c.dispose(); // - 1 tensor
            keysTensor.dispose(); // - 1 tensor

            if (!maskedTensorBatch.size) {
                maskedTensorBatch.dispose(); // - 1 tensor
                maskedKeysTensor.dispose(); // - 1 tensor
                TensorBatch.dispose(); // - 1 tensor
                DEBUG && console.log("No surviving tensors in batch", maskedTensorBatch.shape[0])
                return []
            } else {
                keys = maskedKeysTensor.dataSync();
                maskedKeysTensor.dispose(); // - 1 tensor
                DEBUG && console.log("surviving tensors in batch", maskedTensorBatch.shape[0])
            }
        }

        const tb = paddedTensorBatch || maskedTensorBatch || TensorBatch;
        const prediction = this.model.predict(tb, { batchSize: this.batchSize })
        
        let newPrediction;
        if (this.selection) {
            newPrediction = tf.max(prediction, 0, true);
            prediction.dispose();
            keys = keys.splice(0, 1);
        }
        else if (this.useContext && this.batchSize > 1 && threshold === 0) {
            newPrediction = this.addContext(prediction, tb, confidence);
            prediction.dispose();
        }
        TensorBatch.dispose();
        if (paddedTensorBatch) paddedTensorBatch.dispose();
        if (maskedTensorBatch) maskedTensorBatch.dispose();

        const finalPrediction = newPrediction || prediction;
        //new
        const { indices, values } = tf.topk(finalPrediction, 5, true)
        const topIndices = indices.arraySync();
        const topValues = values.arraySync();
        indices.dispose();
        values.dispose();
        // end new
        // const array_of_predictions = finalPrediction.arraySync()
        finalPrediction.dispose();
        if (newPrediction) newPrediction.dispose();
        keys = keys.map(key => (key / CONFIG.sampleRate).toFixed(3));
        return [keys, topIndices, topValues];
        // return keys.reduce((acc, key, index) => {
        //     // convert key (samples) to milliseconds
        //     const position = (key / CONFIG.sampleRate).toFixed(3);
        //     acc[position] = array_of_predictions[index];
        //     return acc;
        // }, {});
    }

    makeSpectrogram(signal) {
        return tf.tidy(() => {
            let spec = tf.abs(tf.signal.stft(signal, this.frame_length, this.frame_step));
            signal.dispose();
            return spec;
        })
    }

    /*    normalizeTensor(audio) {
            return tf.tidy(() => {
                const tensor = tf.tensor1d(audio);
                const {mean, variance} = tf.moments(tensor);
                const stdDev = variance.sqrt();
                const normalizedTensor = tensor.sub(mean).div(stdDev.mul(tf.scalar(2)));
                return normalizedTensor;
            })
        }*/

    /*    normalise_audio = (signal) => {
            return tf.tidy(() => {
                //signal = tf.tensor1d(signal);
                const sigMax = tf.max(signal);
                const sigMin = tf.min(signal);
                return signal.sub(sigMin).div(sigMax.sub(sigMin)).mul(255).sub(127.5);
            })
        };*/

    normalise_audio = (signal) => {
        return tf.tidy(() => {
            //signal = tf.tensor1d(signal, 'float32');
            const sigMax = tf.max(signal);
            const sigMin = tf.min(signal);
            const range = sigMax.sub(sigMin);
            //return signal.sub(sigMin).div(range).mul(tf.scalar(8192.0, 'float32')).sub(tf.scalar(4095, 'float32'))
            return signal.sub(sigMin).div(range).mul(tf.scalar(2)).sub(tf.scalar(1))
        })
    };

    async predictChunk(audioBuffer, start, fileStart, file, threshold, confidence) {
        DEBUG && console.log('predictCunk begin', tf.memory().numTensors);
        audioBuffer = tf.tensor1d(audioBuffer);

        // check if we need to pad
        const remainder = audioBuffer.shape % this.chunkLength;
        let paddedBuffer;
        if (remainder !== 0) {
            // Pad to the nearest full sample
            paddedBuffer = audioBuffer.pad([[0, this.chunkLength - remainder]]);
            audioBuffer.dispose();
            DEBUG && console.log('Received final chunks')
        }
        const buffer = paddedBuffer || audioBuffer;
        const numSamples = buffer.shape / this.chunkLength;
        let bufferList = tf.split(buffer, numSamples);
        buffer.dispose();
        // Turn the audio into a spec tensor
        // bufferList = tf.tidy(() => {
        //     return bufferList.map(x => {
        //         let normal = this.normalise_audio(x);
        //         x.dispose();
        //         return normal ; // this.makeSpectrogram(normal);
        //     })
        // });
        const specBatch = tf.stack(bufferList);
        const batchKeys = [...Array(numSamples).keys()].map(i => start + this.chunkLength * i);
        const result = await this.predictBatch(specBatch, batchKeys, threshold, confidence);
        this.clearTensorArray(bufferList);
        return [result, file, fileStart];
    }

    async clearTensorArray(tensorObj) {
        // Dispose of accumulated kept tensors in model tensor array
        tensorObj.forEach(tensor => tensor.dispose());
    }
}


/// Birdnet definitions

// Define custom layer for computing mel spectrograms
class MelSpecLayerSimple extends tf.layers.Layer {
    constructor(config) {
        super(config);

        // Initialize parameters
        this.sampleRate = config.sampleRate;
        this.specShape = config.specShape;
        this.frameStep = config.frameStep;
        this.frameLength = config.frameLength;
        this.fmin = config.fmin;
        this.fmax = config.fmax;
        this.melFilterbank = tf.tensor2d(config.melFilterbank);
    }

    build(inputShape) {
        // Initialize trainable weights, for example:
        this.magScale = this.addWeight(
            'magnitude_scaling',
            [],
            'float32',
            tf.initializers.constant({ value: 1.23 })
        );

        super.build(inputShape);
    }

    // Compute the output shape of the layer
    computeOutputShape(inputShape) {
        return [inputShape[0], this.specShape[0], this.specShape[1], 1];
    }

    // Define the layer's forward pass
    call(inputs) {
        return tf.tidy(() => {
            // inputs is a tensor representing the input data
            inputs = inputs[0];
            const inputList = tf.split(inputs, inputs.shape[0])
            const specBatch = inputList.map(input =>{
                input = input.squeeze();
                // Normalize values between -1 and 1
                input = tf.sub(input, tf.min(input, -1, true));
                input = tf.div(input, tf.max(input, -1, true).add(0.000001));
                input = tf.sub(input, 0.5);
                input = tf.mul(input, 2.0);

                // Perform STFT
                let spec = tf.signal.stft(
                    input,
                    this.frameLength,
                    this.frameStep,
                    this.frameLength,
                    tf.signal.hannWindow,
                );

                // Cast from complex to float
                spec = tf.cast(spec, 'float32');

                // Apply mel filter bank
                spec = tf.matMul(spec, this.melFilterbank);

                // Convert to power spectrogram
                spec = spec.pow(2.0);

                // Apply nonlinearity
                spec = spec.pow(tf.div(1.0, tf.add(1.0, tf.exp(this.magScale.read()))));

                // Flip the spectrogram
                spec = tf.reverse(spec, -1);

                // Swap axes to fit input shape
                spec = tf.transpose(spec)

                // Adding the channel dimension
                spec = spec.expandDims(-1);

                return spec;
            })
            return tf.stack(specBatch)
        });
    }

    // Optionally, include the `className` method to provide a machine-readable name for the layer
    static get className() {
        return 'MelSpecLayerSimple';
    }
}

// Register the custom layer with TensorFlow.js
tf.serialization.registerClass(MelSpecLayerSimple);


/////////////////////////  Build GlobalExpPool2D Layer  /////////////////////////
function logmeanexp(x, axis, keepdims, sharpness) {
    const xmax = tf.max(x, axis, true);
    const xmax2 = tf.max(x, axis, keepdims);
    x = tf.mul(sharpness, tf.sub(x, xmax));
    let y = tf.log(tf.mean(tf.exp(x), axis, keepdims));
    y = tf.add(tf.div(y, sharpness), xmax2);
    return y
}

class GlobalLogExpPooling2D extends tf.layers.Layer {
    constructor(config) {
      super(config);
    }

    build(inputShape) {
        this.sharpness = this.addWeight('sharpness', [1], 'float32', tf.initializers.constant({value: 2}));
    }

    computeOutputShape(inputShape) { return [inputShape[0], inputShape[3]]; }
   
    call(input, kwargs) {
        
        return logmeanexp(input[0], [1, 2], false, this.sharpness.read());//.read().dataSync()[0]); 
    
    }
   
    static get className() { return 'GlobalLogExpPooling2D'; }
}

tf.serialization.registerClass(GlobalLogExpPooling2D);

/////////////////////////  Build Sigmoid Layer  /////////////////////////
class SigmoidLayer extends tf.layers.Layer {
    constructor(config) {
      super(config);
      this.config = config;
    }

    build(inputShape) {
        this.kernel = this.addWeight('scale_factor', [1], 'float32', tf.initializers.constant({value: 1}));
    }

    computeOutputShape(inputShape) { return inputShape; }

    call(input, kwargs) { 
        
        return tf.sigmoid(tf.mul(input[0], CONFIG.sigmoid))
        
    }   
   
    static get className() { return 'SigmoidLayer'; }
}

tf.serialization.registerClass(SigmoidLayer);
