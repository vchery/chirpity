const tf = require('@tensorflow/tfjs');
const labels = ["Tachymarptis melba_Alpine Swift", "Pluvialis dominica_American Golden Plover", "Mareca americana_American Wigeon", "Acrocephalus paludicola_Aquatic Warbler", "Acanthis hornemanni_Arctic Redpoll", "Stercorarius parasiticus_Arctic Skua", "Sterna paradisaea_Arctic Tern", "Phylloscopus borealis_Arctic Warbler", "Recurvirostra avosetta_Avocet", "Porzana pusilla_Baillon's Crake", "Limosa lapponica_Bar-tailed Godwit", "Tyto alba_Barn Owl", "Branta leucopsis_Barnacle Goose", "Sylvia nisoria_Barred Warbler", "Panurus biarmicus_Bearded Tit", "Merops apiaster_Bee-eater", "Cygnus columbianus_Bewick's Swan", "Botaurus stellaris_Bittern", "Oenanthe hispanica_Black-eared Wheatear", "Chroicocephalus ridibundus_Black-headed Gull", "Podiceps nigricollis_Black-necked Grebe", "Limosa limosa_Black-tailed Godwit", "Himantopus himantopus_Black-winged Stilt", "Lyrurus tetrix_Black Grouse", "Cepphus grylle_Black Guillemot", "Milvus migrans_Black Kite", "Phoenicurus ochruros_Black Redstart", "Chlidonias niger_Black Tern", "Turdus merula_Blackbird", "Sylvia atricapilla_Blackcap", "Spatula discors_Blue-winged Teal", "Cyanistes caeruleus_Blue Tit", "Luscinia svecica_Bluethroat", "Acrocephalus dumetorum_Blyth's Reed Warbler", "Fringilla montifringilla_Brambling", "Branta bernicla_Brent Goose", "Pyrrhula pyrrhula_Bullfinch", "Buteo buteo_Buzzard", "Branta canadensis_Canada Goose", "Tetrao urogallus_Capercaillie", "Corvus corone_Carrion Crow", "Larus cachinnans_Caspian Gull", "Bubulcus ibis_Cattle Egret", "Cettia cetti_Cetti's Warbler", "Fringilla coelebs_Chaffinch", "Phylloscopus collybita_Chiffchaff", "Pyrrhocorax pyrrhocorax_Chough", "Emberiza cirlus_Cirl Bunting", "Motacilla citreola_Citrine Wagtail", "Periparus ater_Coal Tit", "Streptopelia decaocto_Collared Dove", "Glareola pratincola_Collared Pratincole", "Loxia curvirostra_Common Crossbill", "Larus canus_Common Gull", "Acanthis flammea_Common Redpoll", "Carpodacus erythrinus_Common Rosefinch", "Actitis hypoleucos_Common Sandpiper", "Melanitta nigra_Common Scoter", "Sterna hirundo_Common Tern", "Fulica atra_Coot", "Phalacrocorax carbo_Cormorant", "Emberiza calandra_Corn Bunting", "Crex crex_Corncrake", "Calonectris borealis_Cory's Shearwater", "Grus grus_Crane", "Lophophanes cristatus_Crested Tit", "Cuculus canorus_Cuckoo", "Calidris ferruginea_Curlew Sandpiper", "Numenius arquata_Curlew", "Sylvia undata_Dartford Warbler", "Cinclus cinclus_Dipper", "Charadrius morinellus_Dotterel", "Calidris alpina_Dunlin", "Prunella modularis_Dunnock", "Phylloscopus fuscatus_Dusky Warbler", "Alopochen aegyptiaca_Egyptian Goose", "Somateria mollissima_Eider", "Bubo bubo_Eurasian Eagle-Owl", "Turdus pilaris_Fieldfare", "Regulus ignicapilla_Firecrest", "Fulmarus glacialis_Fulmar", "Mareca strepera_Gadwall", "Morus bassanus_Gannet", "Sylvia borin_Garden Warbler", "Spatula querquedula_Garganey", "Larus hyperboreus_Glaucous Gull", "Plegadis falcinellus_Glossy Ibis", "Regulus regulus_Goldcrest", "Aquila chrysaetos_Golden Eagle", "Oriolus oriolus_Golden Oriole", "Pluvialis apricaria_Golden Plover", "Bucephala clangula_Goldeneye", "Carduelis carduelis_Goldfinch", "Mergus merganser_Goosander", "Accipiter gentilis_Goshawk", "Locustella naevia_Grasshopper Warbler", "Larus marinus_Great Black-backed Gull", "Podiceps cristatus_Great Crested Grebe", "Lanius excubitor_Great Grey Shrike", "Gavia immer_Great Northern Diver", "Stercorarius skua_Great Skua", "Dendrocopos major_Great Spotted Woodpecker", "Parus major_Great Tit", "Ardea alba_Great White Egret", "Anas carolinensis_Green-winged Teal", "Tringa ochropus_Green Sandpiper", "Picus viridis_Green Woodpecker", "Chloris chloris_Greenfinch", "Phylloscopus trochiloides_Greenish Warbler", "Tringa nebularia_Greenshank", "Ardea cinerea_Grey Heron", "Perdix perdix_Grey Partridge", "Phalaropus fulicarius_Grey Phalarope", "Pluvialis squatarola_Grey Plover", "Motacilla cinerea_Grey Wagtail", "Anser anser_Greylag Goose", "Uria aalge_Guillemot", "Gelochelidon nilotica_Gull-billed Tern", "Coccothraustes coccothraustes_Hawfinch", "Larus argentatus_Herring Gull", "Falco subbuteo_Hobby", "Pernis apivorus_Honey-buzzard", "Corvus cornix_Hooded Crow", "Upupa epops_Hoopoe", "Delichon urbicum_House Martin", "Passer domesticus_House Sparrow", "Human_Human", "Phylloscopus ibericus_Iberian Chiffchaff", "Hippolais icterina_Icterine Warbler", "Lymnocryptes minimus_Jack Snipe", "Coloeus monedula_Jackdaw", "Garrulus glandarius_Jay", "Charadrius alexandrinus_Kentish Plover", "Falco tinnunculus_Kestrel", "Alcedo atthis_Kingfisher", "Rissa tridactyla_Kittiwake", "Calidris canutus_Knot", "Calcarius lapponicus_Lapland Bunting", "Vanellus vanellus_Lapwing", "Larus fuscus_Lesser Black-backed Gull", "Acanthis cabaret_Lesser Redpoll", "Dryobates minor_Lesser Spotted Woodpecker", "Sylvia curruca_Lesser Whitethroat", "Linaria cannabina_Linnet", "Ixobrychus minutus_Little Bittern", "Emberiza pusilla_Little Bunting", "Egretta garzetta_Little Egret", "Tachybaptus ruficollis_Little Grebe", "Hydrocoloeus minutus_Little Gull", "Athene noctua_Little Owl", "Charadrius dubius_Little Ringed Plover", "Calidris minuta_Little Stint", "Sternula albifrons_Little Tern", "Asio otus_Long-eared Owl", "Clangula hyemalis_Long-tailed Duck", "Stercorarius longicaudus_Long-tailed Skua", "Aegithalos caudatus_Long-tailed Tit", "Pica pica_Magpie", "Anas platyrhynchos_Mallard", "Aix galericulata_Mandarin Duck", "Puffinus puffinus_Manx Shearwater", "Circus aeruginosus_Marsh Harrier", "Poecile palustris_Marsh Tit", "Anthus pratensis_Meadow Pipit", "Ichthyaetus melanocephalus_Mediterranean Gull", "Hippolais polyglotta_Melodious Warbler", "Falco columbarius_Merlin", "Turdus viscivorus_Mistle Thrush", "Circus pygargus_Montagu's Harrier", "Gallinula chloropus_Moorhen", "Cygnus olor_Mute Swan", "Nycticorax nycticorax_Night Heron", "Luscinia megarhynchos_Nightingale", "Caprimulgus europaeus_Nightjar", "No Call_No Call", "Sitta europaea_Nuthatch", "Anthus hodgsoni_Olive-backed Pipit", "Emberiza hortulana_Ortolan Bunting", "Pandion haliaetus_Osprey", "Haematopus ostralegus_Oystercatcher", "Syrrhaptes paradoxus_Pallas's Sandgrouse", "Phylloscopus proregulus_Pallas's Warbler", "Loxia pytyopsittacus_Parrot Crossbill", "Calidris melanotos_Pectoral Sandpiper", "Remiz pendulinus_Penduline Tit", "Falco peregrinus_Peregrine", "Phasianus colchicus_Pheasant", "Ficedula hypoleuca_Pied Flycatcher", "Motacilla alba_Pied Wagtail", "Anser brachyrhynchus_Pink-footed Goose", "Anas acuta_Pintail", "Aythya ferina_Pochard", "Lagopus muta_Ptarmigan", "Ardea purpurea_Purple Heron", "Calidris maritima_Purple Sandpiper", "Coturnix coturnix_Quail", "Phylloscopus schwarzi_Radde's Warbler", "Corvus corax_Raven", "Alca torda_Razorbill", "Lanius collurio_Red-backed Shrike", "Ficedula parva_Red-breasted Flycatcher", "Mergus serrator_Red-breasted Merganser", "Netta rufina_Red-crested Pochard", "Tarsiger cyanurus_Red-flanked Bluetail", "Alectoris rufa_Red-legged Partridge", "Podiceps grisegena_Red-necked Grebe", "Caprimulgus ruficollis_Red-necked Nightjar", "Phalaropus lobatus_Red-necked Phalarope", "Cecropis daurica_Red-rumped Swallow", "Gavia stellata_Red-throated Diver", "Lagopus lagopus_Red Grouse", "Milvus milvus_Red Kite", "Tringa totanus_Redshank", "Phoenicurus phoenicurus_Redstart", "Turdus iliacus_Redwing", "Emberiza schoeniclus_Reed Bunting", "Acrocephalus scirpaceus_Reed Warbler", "Anthus richardi_Richard's Pipit", "Larus delawarensis_Ring-billed Gull", "Psittacula krameri_Ring-necked Parakeet", "Turdus torquatus_Ring Ouzel", "Charadrius hiaticula_Ringed Plover", "Erithacus rubecula_Robin", "Columba livia_Rock Dove", "Anthus petrosus_Rock Pipit", "Corvus frugilegus_Rook", "Pastor roseus_Rose-coloured Starling", "Sterna dougallii_Roseate Tern", "Buteo lagopus_Rough-legged Buzzard", "Oxyura jamaicensis_Ruddy Duck", "Tadorna ferruginea_Ruddy Shelduck", "Calidris pugnax_Ruff", "Xema sabini_Sabine's Gull", "Riparia riparia_Sand Martin", "Calidris alba_Sanderling", "Thalasseus sandvicensis_Sandwich Tern", "Locustella luscinioides_Savi's Warbler", "Aythya marila_Scaup", "Loxia scotica_Scottish Crossbill", "Acrocephalus schoenobaenus_Sedge Warbler", "Calidris pusilla_Semipalmated Sandpiper", "Serinus serinus_Serin", "Tadorna tadorna_Shelduck", "Eremophila alpestris_Shore Lark", "Asio flammeus_Short-eared Owl", "Calandrella brachydactyla_Short-toed Lark", "Spatula clypeata_Shoveler", "Spinus spinus_Siskin", "Alauda arvensis_Skylark", "Podiceps auritus_Slavonian Grebe", "Gallinago gallinago_Snipe", "Plectrophenax nivalis_Snow Bunting", "Anser caerulescens_Snow Goose", "Turdus philomelos_Song Thrush", "Accipiter nisus_Sparrowhawk", "Platalea leucorodia_Spoonbill", "Porzana porzana_Spotted Crake", "Muscicapa striata_Spotted Flycatcher", "Tringa erythropus_Spotted Redshank", "Actitis macularius_Spotted Sandpiper", "Sturnus vulgaris_Starling", "Columba oenas_Stock Dove", "Burhinus oedicnemus_Stone-curlew", "Saxicola rubicola_Stonechat", "Hydrobates pelagicus_Storm Petrel", "Sylvia cantillans_Subalpine Warbler", "Hirundo rustica_Swallow", "Apus apus_Swift", "Anser fabalis_Taiga Bean Goose", "Strix aluco_Tawny Owl", "Anas crecca_Teal", "Calidris temminckii_Temminck's Stint", "Anthus trivialis_Tree Pipit", "Passer montanus_Tree Sparrow", "Certhia familiaris_Treecreeper", "Aythya fuligula_Tufted Duck", "Anser serrirostris_Tundra Bean Goose", "Arenaria interpres_Turnstone", "Streptopelia turtur_Turtle Dove", "Linaria flavirostris_Twite", "Loxia leucoptera_Two-barred Crossbill", "Anthus spinoletta_Water Pipit", "Rallus aquaticus_Water Rail", "Bombycilla garrulus_Waxwing", "Oenanthe oenanthe_Wheatear", "Numenius phaeopus_Whimbrel", "Saxicola rubetra_Whinchat", "Anser albifrons_White-fronted Goose", "Calidris fuscicollis_White-rumped Sandpiper", "Haliaeetus albicilla_White-tailed Eagle", "Chlidonias leucopterus_White-winged Black Tern", "Ciconia ciconia_White Stork", "Sylvia communis_Whitethroat", "Cygnus cygnus_Whooper Swan", "Mareca penelope_Wigeon", "Poecile montanus_Willow Tit", "Phylloscopus trochilus_Willow Warbler", "Tringa glareola_Wood Sandpiper", "Phylloscopus sibilatrix_Wood Warbler", "Scolopax rusticola_Woodcock", "Lullula arborea_Woodlark", "Columba palumbus_Woodpigeon", "Troglodytes troglodytes_Wren", "Jynx torquilla_Wryneck", "Phylloscopus inornatus_Yellow-browed Warbler", "Larus michahellis_Yellow-legged Gull", "Motacilla flava_Yellow Wagtail", "Emberiza citrinella_Yellowhammer", "animals_animals", "environment_environment", "vehicles_vehicles"];
const blacklist = ["Human_Human", "No Call_No Call", "animals_animals", "environment_environment", "vehicles_vehicles"];
let blocked_IDs = []
const path = require("path");
//const {max} = require("@tensorflow/tfjs");
const CONFIG = {

    sampleRate: 48000, specLength: 3, sigmoid: 1.0,

}

class Model {
    constructor(appPath, isBirdnet = false) {
        if (isBirdnet) BirdNetSetup();
        this.isBirdnet = isBirdnet;
        this.model = null;
        this.labels = labels;
        this.config = CONFIG;
        this.chunkLength = this.config.sampleRate * this.config.specLength;
        this.model_loaded = false;
        this.appPath = null;
        this.spectrogram = null;
        this.frame_length = 1024;
        this.frame_step = 373;
        this.prediction = null;
        this.appPath = appPath;
    }

    async loadModel() {
        console.log(this.appPath)
        if (this.model_loaded === false) {
            // Model files must be in a different file than the js, assets files
            if (this.isBirdnet) {
                this.model = await tf.loadLayersModel(path.join(this.appPath, 'model.json'),
                    {weightPathPrefix: this.appPath});
                this.labels = ["Acanthis cabaret_Lesser Redpoll", "Acanthis flammea_Common Redpoll", "Acanthis hornemanni_Hoary Redpoll", "Accipiter cooperii_Cooper's Hawk", "Accipiter gentilis_Northern Goshawk", "Accipiter nisus_Eurasian Sparrowhawk", "Accipiter striatus_Sharp-shinned Hawk", "Acridotheres tristis_Common Myna", "Acrocephalus agricola_Paddyfield Warbler", "Acrocephalus arundinaceus_Great Reed Warbler", "Acrocephalus baeticatus_African Reed Warbler", "Acrocephalus dumetorum_Blyth's Reed Warbler", "Acrocephalus melanopogon_Moustached Warbler", "Acrocephalus paludicola_Aquatic Warbler", "Acrocephalus palustris_Marsh Warbler", "Acrocephalus schoenobaenus_Sedge Warbler", "Acrocephalus scirpaceus_Eurasian Reed Warbler", "Actitis hypoleucos_Common Sandpiper", "Actitis macularius_Spotted Sandpiper", "Aechmophorus occidentalis_Western Grebe", "Aegithalos caudatus_Long-tailed Tit", "Aegolius acadicus_Northern Saw-whet Owl", "Aegolius funereus_Boreal Owl", "Aeronautes saxatalis_White-throated Swift", "Agelaius phoeniceus_Red-winged Blackbird", "Agelaius tricolor_Tricolored Blackbird", "Aimophila ruficeps_Rufous-crowned Sparrow", "Aix galericulata_Mandarin Duck", "Aix sponsa_Wood Duck", "Alaemon alaudipes_Greater Hoopoe-Lark", "Alauda arvensis_Eurasian Skylark", "Alauda leucoptera_White-winged Lark", "Alaudala rufescens_Lesser Short-toed Lark", "Alca torda_Razorbill", "Alcedo atthis_Common Kingfisher", "Alectoris barbara_Barbary Partridge", "Alectoris chukar_Chukar", "Alectoris graeca_Rock Partridge", "Alectoris rufa_Red-legged Partridge", "Alopochen aegyptiaca_Egyptian Goose", "Amazilia yucatanensis_Buff-bellied Hummingbird", "Amazona viridigenalis_Red-crowned Parrot", "Ammodramus savannarum_Grasshopper Sparrow", "Ammomanes cinctura_Bar-tailed Lark", "Ammomanes deserti_Desert Lark", "Ammospiza leconteii_LeConte's Sparrow", "Ammospiza maritima_Seaside Sparrow", "Ammospiza nelsoni_Nelson's Sparrow", "Amphispiza bilineata_Black-throated Sparrow", "Anas acuta_Northern Pintail", "Anas crecca_Green-winged Teal", "Anas platyrhynchos_Mallard", "Anhinga anhinga_Anhinga", "Anser albifrons_Greater White-fronted Goose", "Anser anser_Graylag Goose", "Anser brachyrhynchus_Pink-footed Goose", "Anser caerulescens_Snow Goose", "Anser canagicus_Emperor Goose", "Anser erythropus_Lesser White-fronted Goose", "Anser fabalis_Taiga Bean-Goose", "Anser indicus_Bar-headed Goose", "Anser rossii_Ross's Goose", "Anser serrirostris_Tundra Bean-Goose", "Anthropoides virgo_Demoiselle Crane", "Anthus campestris_Tawny Pipit", "Anthus cervinus_Red-throated Pipit", "Anthus gustavi_Pechora Pipit", "Anthus hodgsoni_Olive-backed Pipit", "Anthus petrosus_Rock Pipit", "Anthus pratensis_Meadow Pipit", "Anthus richardi_Richard's Pipit", "Anthus rubescens_American Pipit", "Anthus spinoletta_Water Pipit", "Anthus spragueii_Sprague's Pipit", "Anthus trivialis_Tree Pipit", "Antigone canadensis_Sandhill Crane", "Antrostomus arizonae_Mexican Whip-poor-will", "Antrostomus carolinensis_Chuck-will's-widow", "Antrostomus vociferus_Eastern Whip-poor-will", "Aphelocoma californica_California Scrub-Jay", "Aphelocoma coerulescens_Florida Scrub-Jay", "Aphelocoma insularis_Island Scrub-Jay", "Aphelocoma wollweberi_Mexican Jay", "Aphelocoma woodhouseii_Woodhouse's Scrub-Jay", "Apus affinis_Little Swift", "Apus apus_Common Swift", "Apus melba_Alpine Swift", "Apus pallidus_Pallid Swift", "Aquila chrysaetos_Golden Eagle", "Aramus guarauna_Limpkin", "Archilochus alexandri_Black-chinned Hummingbird", "Archilochus colubris_Ruby-throated Hummingbird", "Ardea alba_Great Egret", "Ardea cinerea_Gray Heron", "Ardea herodias_Great Blue Heron", "Ardea purpurea_Purple Heron", "Ardenna grisea_Sooty Shearwater", "Ardeola ralloides_Squacco Heron", "Arenaria interpres_Ruddy Turnstone", "Arenaria melanocephala_Black Turnstone", "Arremonops rufivirgatus_Olive Sparrow", "Artemisiospiza belli_Bell's Sparrow", "Artemisiospiza nevadensis_Sagebrush Sparrow", "Asio flammeus_Short-eared Owl", "Asio otus_Long-eared Owl", "Athene cunicularia_Burrowing Owl", "Athene noctua_Little Owl", "Auriparus flaviceps_Verdin", "Aythya americana_Redhead", "Aythya collaris_Ring-necked Duck", "Aythya ferina_Common Pochard", "Aythya fuligula_Tufted Duck", "Aythya marila_Greater Scaup", "Aythya nyroca_Ferruginous Duck", "Baeolophus atricristatus_Black-crested Titmouse", "Baeolophus bicolor_Tufted Titmouse", "Baeolophus inornatus_Oak Titmouse", "Baeolophus ridgwayi_Juniper Titmouse", "Baeolophus wollweberi_Bridled Titmouse", "Bartramia longicauda_Upland Sandpiper", "Bombycilla cedrorum_Cedar Waxwing", "Bombycilla garrulus_Bohemian Waxwing", "Bonasa umbellus_Ruffed Grouse", "Botaurus lentiginosus_American Bittern", "Botaurus stellaris_Great Bittern", "Brachyramphus marmoratus_Marbled Murrelet", "Branta bernicla_Brant", "Branta canadensis_Canada Goose", "Branta hutchinsii_Cackling Goose", "Branta leucopsis_Barnacle Goose", "Bubo ascalaphus_Pharaoh Eagle-Owl", "Bubo bubo_Eurasian Eagle-Owl", "Bubo scandiacus_Snowy Owl", "Bubo virginianus_Great Horned Owl", "Bubulcus ibis_Cattle Egret", "Bucanetes githagineus_Trumpeter Finch", "Bucephala albeola_Bufflehead", "Bucephala clangula_Common Goldeneye", "Burhinus oedicnemus_Eurasian Thick-knee", "Buteo albonotatus_Zone-tailed Hawk", "Buteo brachyurus_Short-tailed Hawk", "Buteo buteo_Common Buzzard", "Buteo jamaicensis_Red-tailed Hawk", "Buteo lagopus_Rough-legged Hawk", "Buteo lineatus_Red-shouldered Hawk", "Buteo plagiatus_Gray Hawk", "Buteo platypterus_Broad-winged Hawk", "Buteo rufinus_Long-legged Buzzard", "Buteo swainsoni_Swainson's Hawk", "Buteogallus anthracinus_Common Black Hawk", "Butorides virescens_Green Heron", "Calamospiza melanocorys_Lark Bunting", "Calandrella brachydactyla_Greater Short-toed Lark", "Calcarius lapponicus_Lapland Longspur", "Calcarius ornatus_Chestnut-collared Longspur", "Calcarius pictus_Smith's Longspur", "Calidris alba_Sanderling", "Calidris alpina_Dunlin", "Calidris bairdii_Baird's Sandpiper", "Calidris canutus_Red Knot", "Calidris falcinellus_Broad-billed Sandpiper", "Calidris ferruginea_Curlew Sandpiper", "Calidris fuscicollis_White-rumped Sandpiper", "Calidris himantopus_Stilt Sandpiper", "Calidris maritima_Purple Sandpiper", "Calidris mauri_Western Sandpiper", "Calidris melanotos_Pectoral Sandpiper", "Calidris minuta_Little Stint", "Calidris minutilla_Least Sandpiper", "Calidris ptilocnemis_Rock Sandpiper", "Calidris pugnax_Ruff", "Calidris pusilla_Semipalmated Sandpiper", "Calidris temminckii_Temminck's Stint", "Calidris virgata_Surfbird", "Calliope calliope_Siberian Rubythroat", "Callipepla californica_California Quail", "Callipepla gambelii_Gambel's Quail", "Callipepla squamata_Scaled Quail", "Calonectris diomedea_Cory's Shearwater", "Calypte anna_Anna's Hummingbird", "Calypte costae_Costa's Hummingbird", "Camptostoma imberbe_Northern Beardless-Tyrannulet", "Campylorhynchus brunneicapillus_Cactus Wren", "Caprimulgus europaeus_Eurasian Nightjar", "Caprimulgus ruficollis_Red-necked Nightjar", "Caracara cheriway_Crested Caracara", "Cardellina canadensis_Canada Warbler", "Cardellina pusilla_Wilson's Warbler", "Cardellina rubrifrons_Red-faced Warbler", "Cardinalis cardinalis_Northern Cardinal", "Cardinalis sinuatus_Pyrrhuloxia", "Carduelis carduelis_European Goldfinch", "Carduelis citrinella_Citril Finch", "Carduelis corsicana_Corsican Finch", "Carpodacus erythrinus_Common Rosefinch", "Carpospiza brachydactyla_Pale Rockfinch", "Catharus bicknelli_Bicknell's Thrush", "Catharus fuscescens_Veery", "Catharus guttatus_Hermit Thrush", "Catharus minimus_Gray-cheeked Thrush", "Catharus ustulatus_Swainson's Thrush", "Catherpes mexicanus_Canyon Wren", "Cecropis daurica_Red-rumped Swallow", "Centrocercus urophasianus_Greater Sage-Grouse", "Centronyx bairdii_Baird's Sparrow", "Centronyx henslowii_Henslow's Sparrow", "Cepphus columba_Pigeon Guillemot", "Cepphus grylle_Black Guillemot", "Cercotrichas galactotes_Rufous-tailed Scrub-Robin", "Certhia americana_Brown Creeper", "Certhia brachydactyla_Short-toed Treecreeper", "Certhia familiaris_Eurasian Treecreeper", "Ceryle rudis_Pied Kingfisher", "Cettia cetti_Cetti's Warbler", "Chaetura pelagica_Chimney Swift", "Chaetura vauxi_Vaux's Swift", "Chamaea fasciata_Wrentit", "Charadrius alexandrinus_Kentish Plover", "Charadrius dubius_Little Ringed Plover", "Charadrius hiaticula_Common Ringed Plover", "Charadrius leschenaultii_Greater Sand-Plover", "Charadrius melodus_Piping Plover", "Charadrius morinellus_Eurasian Dotterel", "Charadrius nivosus_Snowy Plover", "Charadrius semipalmatus_Semipalmated Plover", "Charadrius vociferus_Killdeer", "Charadrius wilsonia_Wilson's Plover", "Chersophilus duponti_Dupont's Lark", "Chlidonias hybrida_Whiskered Tern", "Chlidonias leucopterus_White-winged Tern", "Chlidonias niger_Black Tern", "Chloris chloris_European Greenfinch", "Chloroceryle americana_Green Kingfisher", "Chondestes grammacus_Lark Sparrow", "Chordeiles acutipennis_Lesser Nighthawk", "Chordeiles gundlachii_Antillean Nighthawk", "Chordeiles minor_Common Nighthawk", "Chroicocephalus genei_Slender-billed Gull", "Chroicocephalus philadelphia_Bonaparte's Gull", "Chroicocephalus ridibundus_Black-headed Gull", "Ciconia ciconia_White Stork", "Ciconia nigra_Black Stork", "Cinclus cinclus_White-throated Dipper", "Cinclus mexicanus_American Dipper", "Circaetus gallicus_Short-toed Snake-Eagle", "Circus aeruginosus_Eurasian Marsh-Harrier", "Circus hudsonius_Northern Harrier", "Circus macrourus_Pallid Harrier", "Circus pygargus_Montagu's Harrier", "Cisticola juncidis_Zitting Cisticola", "Cistothorus palustris_Marsh Wren", "Cistothorus platensis_Sedge Wren", "Clamator glandarius_Great Spotted Cuckoo", "Clanga clanga_Greater Spotted Eagle", "Clanga pomarina_Lesser Spotted Eagle", "Clangula hyemalis_Long-tailed Duck", "Coccothraustes coccothraustes_Hawfinch", "Coccothraustes vespertinus_Evening Grosbeak", "Coccyzus americanus_Yellow-billed Cuckoo", "Coccyzus erythropthalmus_Black-billed Cuckoo", "Coccyzus minor_Mangrove Cuckoo", "Colaptes auratus_Northern Flicker", "Colaptes chrysoides_Gilded Flicker", "Colinus virginianus_Northern Bobwhite", "Columba livia_Rock Pigeon", "Columba oenas_Stock Dove", "Columba palumbus_Common Wood-Pigeon", "Columbina inca_Inca Dove", "Contopus cooperi_Olive-sided Flycatcher", "Contopus pertinax_Greater Pewee", "Contopus sordidulus_Western Wood-Pewee", "Contopus virens_Eastern Wood-Pewee", "Coracias garrulus_European Roller", "Coragyps atratus_Black Vulture", "Corvus brachyrhynchos_American Crow", "Corvus caurinus_Northwestern Crow", "Corvus corax_Common Raven", "Corvus cornix_Hooded Crow", "Corvus corone_Carrion Crow", "Corvus cryptoleucus_Chihuahuan Raven", "Corvus frugilegus_Rook", "Corvus monedula_Eurasian Jackdaw", "Corvus ossifragus_Fish Crow", "Corvus ruficollis_Brown-necked Raven", "Coturnicops noveboracensis_Yellow Rail", "Coturnix coturnix_Common Quail", "Crex crex_Corn Crake", "Crotophaga sulcirostris_Groove-billed Ani", "Cuculus canorus_Common Cuckoo", "Cyanistes caeruleus_Eurasian Blue Tit", "Cyanistes cyanus_Azure Tit", "Cyanistes teneriffae_African Blue Tit", "Cyanocitta cristata_Blue Jay", "Cyanocitta stelleri_Steller's Jay", "Cyanocorax yncas_Green Jay", "Cyanopica cooki_Iberian Magpie", "Cygnus atratus_Black Swan", "Cygnus buccinator_Trumpeter Swan", "Cygnus columbianus_Tundra Swan", "Cygnus cygnus_Whooper Swan", "Cygnus olor_Mute Swan", "Cynanthus latirostris_Broad-billed Hummingbird", "Cyrtonyx montezumae_Montezuma Quail", "Delichon urbicum_Common House-Martin", "Dendragapus fuliginosus_Sooty Grouse", "Dendragapus obscurus_Dusky Grouse", "Dendrocopos leucotos_White-backed Woodpecker", "Dendrocopos major_Great Spotted Woodpecker", "Dendrocopos syriacus_Syrian Woodpecker", "Dendrocoptes medius_Middle Spotted Woodpecker", "Dendrocygna autumnalis_Black-bellied Whistling-Duck", "Dendrocygna bicolor_Fulvous Whistling-Duck", "Dolichonyx oryzivorus_Bobolink", "Dryobates albolarvatus_White-headed Woodpecker", "Dryobates arizonae_Arizona Woodpecker", "Dryobates borealis_Red-cockaded Woodpecker", "Dryobates minor_Lesser Spotted Woodpecker", "Dryobates nuttallii_Nuttall's Woodpecker", "Dryobates pubescens_Downy Woodpecker", "Dryobates scalaris_Ladder-backed Woodpecker", "Dryobates villosus_Hairy Woodpecker", "Dryocopus martius_Black Woodpecker", "Dryocopus pileatus_Pileated Woodpecker", "Dumetella carolinensis_Gray Catbird", "Egretta caerulea_Little Blue Heron", "Egretta garzetta_Little Egret", "Egretta thula_Snowy Egret", "Egretta tricolor_Tricolored Heron", "Elanoides forficatus_Swallow-tailed Kite", "Elanus axillaris_Black-shouldered Kite", "Elanus leucurus_White-tailed Kite", "Emberiza bruniceps_Red-headed Bunting", "Emberiza buchanani_Gray-necked Bunting", "Emberiza caesia_Cretzschmar's Bunting", "Emberiza calandra_Corn Bunting", "Emberiza cia_Rock Bunting", "Emberiza cineracea_Cinereous Bunting", "Emberiza cirlus_Cirl Bunting", "Emberiza citrinella_Yellowhammer", "Emberiza hortulana_Ortolan Bunting", "Emberiza melanocephala_Black-headed Bunting", "Emberiza pusilla_Little Bunting", "Emberiza rustica_Rustic Bunting", "Emberiza sahari_House Bunting", "Emberiza schoeniclus_Reed Bunting", "Empidonax alnorum_Alder Flycatcher", "Empidonax difficilis_Pacific-slope Flycatcher", "Empidonax flaviventris_Yellow-bellied Flycatcher", "Empidonax fulvifrons_Buff-breasted Flycatcher", "Empidonax hammondii_Hammond's Flycatcher", "Empidonax minimus_Least Flycatcher", "Empidonax oberholseri_Dusky Flycatcher", "Empidonax occidentalis_Cordilleran Flycatcher", "Empidonax traillii_Willow Flycatcher", "Empidonax virescens_Acadian Flycatcher", "Empidonax wrightii_Gray Flycatcher", "Eremophila alpestris_Horned Lark", "Erithacus rubecula_European Robin", "Estrilda astrild_Common Waxbill", "Eudocimus albus_White Ibis", "Eugenes fulgens_Rivoli's Hummingbird", "Euphagus carolinus_Rusty Blackbird", "Euphagus cyanocephalus_Brewer's Blackbird", "Falcipennis canadensis_Spruce Grouse", "Falco columbarius_Merlin", "Falco eleonorae_Eleonora's Falcon", "Falco femoralis_Aplomado Falcon", "Falco naumanni_Lesser Kestrel", "Falco peregrinus_Peregrine Falcon", "Falco sparverius_American Kestrel", "Falco subbuteo_Eurasian Hobby", "Falco tinnunculus_Eurasian Kestrel", "Falco vespertinus_Red-footed Falcon", "Ficedula albicollis_Collared Flycatcher", "Ficedula hypoleuca_European Pied Flycatcher", "Ficedula parva_Red-breasted Flycatcher", "Ficedula semitorquata_Semicollared Flycatcher", "Ficedula speculigera_Atlas Flycatcher", "Francolinus francolinus_Black Francolin", "Fratercula arctica_Atlantic Puffin", "Fregata magnificens_Magnificent Frigatebird", "Fringilla coelebs_Common Chaffinch", "Fringilla montifringilla_Brambling", "Fulica americana_American Coot", "Fulica atra_Eurasian Coot", "Fulmarus glacialis_Northern Fulmar", "Galerida cristata_Crested Lark", "Galerida theklae_Thekla's Lark", "Gallinago delicata_Wilson's Snipe", "Gallinago gallinago_Common Snipe", "Gallinago media_Great Snipe", "Gallinula chloropus_Eurasian Moorhen", "Gallinula galeata_Common Gallinule", "Gallus gallus_Red Junglefowl", "Garrulus glandarius_Eurasian Jay", "Gavia arctica_Arctic Loon", "Gavia immer_Common Loon", "Gavia pacifica_Pacific Loon", "Gavia stellata_Red-throated Loon", "Gelochelidon nilotica_Gull-billed Tern", "Geococcyx californianus_Greater Roadrunner", "Geothlypis formosa_Kentucky Warbler", "Geothlypis philadelphia_Mourning Warbler", "Geothlypis tolmiei_MacGillivray's Warbler", "Geothlypis trichas_Common Yellowthroat", "Geronticus eremita_Northern Bald Ibis", "Glareola nordmanni_Black-winged Pratincole", "Glareola pratincola_Collared Pratincole", "Glaucidium gnoma_Northern Pygmy-Owl", "Glaucidium passerinum_Eurasian Pygmy-Owl", "Grus grus_Common Crane", "Gymnorhinus cyanocephalus_Pinyon Jay", "Gyps fulvus_Eurasian Griffon", "Haematopus bachmani_Black Oystercatcher", "Haematopus ostralegus_Eurasian Oystercatcher", "Haematopus palliatus_American Oystercatcher", "Haemorhous cassinii_Cassin's Finch", "Haemorhous mexicanus_House Finch", "Haemorhous purpureus_Purple Finch", "Halcyon smyrnensis_White-throated Kingfisher", "Haliaeetus albicilla_White-tailed Eagle", "Haliaeetus leucocephalus_Bald Eagle", "Helmitheros vermivorum_Worm-eating Warbler", "Hieraaetus pennatus_Booted Eagle", "Himantopus himantopus_Black-winged Stilt", "Himantopus mexicanus_Black-necked Stilt", "Hippolais icterina_Icterine Warbler", "Hippolais languida_Upcher's Warbler", "Hippolais olivetorum_Olive-tree Warbler", "Hippolais polyglotta_Melodious Warbler", "Hirundo rustica_Barn Swallow", "Histrionicus histrionicus_Harlequin Duck", "Human_Human", "Hydrobates pelagicus_European Storm-Petrel", "Hydrocoloeus minutus_Little Gull", "Hydroprogne caspia_Caspian Tern", "Hylocichla mustelina_Wood Thrush", "Ichthyaetus audouinii_Audouin's Gull", "Ichthyaetus ichthyaetus_Pallas's Gull", "Ichthyaetus melanocephalus_Mediterranean Gull", "Icteria virens_Yellow-breasted Chat", "Icterus bullockii_Bullock's Oriole", "Icterus cucullatus_Hooded Oriole", "Icterus galbula_Baltimore Oriole", "Icterus graduacauda_Audubon's Oriole", "Icterus gularis_Altamira Oriole", "Icterus parisorum_Scott's Oriole", "Icterus spurius_Orchard Oriole", "Ictinia mississippiensis_Mississippi Kite", "Iduna caligata_Booted Warbler", "Iduna opaca_Western Olivaceous Warbler", "Iduna pallida_Eastern Olivaceous Warbler", "Iduna rama_Sykes's Warbler", "Irania gutturalis_White-throated Robin", "Ixobrychus exilis_Least Bittern", "Ixobrychus minutus_Little Bittern", "Ixoreus naevius_Varied Thrush", "Junco hyemalis_Dark-eyed Junco", "Junco phaeonotus_Yellow-eyed Junco", "Jynx torquilla_Eurasian Wryneck", "Ketupa zeylonensis_Brown Fish-Owl", "Lagonosticta senegala_Red-billed Firefinch", "Lagopus lagopus_Willow Ptarmigan", "Lagopus leucura_White-tailed Ptarmigan", "Lagopus muta_Rock Ptarmigan", "Lanius borealis_Northern Shrike", "Lanius collurio_Red-backed Shrike", "Lanius excubitor_Great Gray Shrike", "Lanius isabellinus_Isabelline Shrike", "Lanius ludovicianus_Loggerhead Shrike", "Lanius minor_Lesser Gray Shrike", "Lanius nubicus_Masked Shrike", "Lanius phoenicuroides_Red-tailed Shrike", "Lanius senator_Woodchat Shrike", "Larus argentatus_Herring Gull", "Larus cachinnans_Caspian Gull", "Larus californicus_California Gull", "Larus canus_Mew Gull", "Larus delawarensis_Ring-billed Gull", "Larus fuscus_Lesser Black-backed Gull", "Larus glaucescens_Glaucous-winged Gull", "Larus heermanni_Heermann's Gull", "Larus hyperboreus_Glaucous Gull", "Larus marinus_Great Black-backed Gull", "Larus michahellis_Yellow-legged Gull", "Larus occidentalis_Western Gull", "Laterallus jamaicensis_Black Rail", "Leptotila verreauxi_White-tipped Dove", "Leucophaeus atricilla_Laughing Gull", "Leucophaeus pipixcan_Franklin's Gull", "Leucosticte atrata_Black Rosy-Finch", "Leucosticte australis_Brown-capped Rosy-Finch", "Leucosticte tephrocotis_Gray-crowned Rosy-Finch", "Limnodromus griseus_Short-billed Dowitcher", "Limnodromus scolopaceus_Long-billed Dowitcher", "Limnothlypis swainsonii_Swainson's Warbler", "Limosa fedoa_Marbled Godwit", "Limosa haemastica_Hudsonian Godwit", "Limosa lapponica_Bar-tailed Godwit", "Limosa limosa_Black-tailed Godwit", "Linaria cannabina_Eurasian Linnet", "Linaria flavirostris_Twite", "Locustella lanceolata_Lanceolated Warbler", "Locustella luscinioides_Savi's Warbler", "Locustella naevia_Common Grasshopper-Warbler", "Lophodytes cucullatus_Hooded Merganser", "Lophophanes cristatus_Crested Tit", "Loxia curvirostra_Red Crossbill", "Loxia leucoptera_White-winged Crossbill", "Loxia pytyopsittacus_Parrot Crossbill", "Loxia sinesciuris_Cassia Crossbill", "Lullula arborea_Wood Lark", "Luscinia luscinia_Thrush Nightingale", "Luscinia megarhynchos_Common Nightingale", "Luscinia svecica_Bluethroat", "Lymnocryptes minimus_Jack Snipe", "Mareca americana_American Wigeon", "Mareca penelope_Eurasian Wigeon", "Mareca strepera_Gadwall", "Megaceryle alcyon_Belted Kingfisher", "Megaceryle torquata_Ringed Kingfisher", "Megascops asio_Eastern Screech-Owl", "Megascops kennicottii_Western Screech-Owl", "Megascops trichopsis_Whiskered Screech-Owl", "Melanerpes aurifrons_Golden-fronted Woodpecker", "Melanerpes carolinus_Red-bellied Woodpecker", "Melanerpes erythrocephalus_Red-headed Woodpecker", "Melanerpes formicivorus_Acorn Woodpecker", "Melanerpes lewis_Lewis's Woodpecker", "Melanerpes uropygialis_Gila Woodpecker", "Melanitta nigra_Common Scoter", "Melanocorypha bimaculata_Bimaculated Lark", "Melanocorypha calandra_Calandra Lark", "Melanocorypha yeltoniensis_Black Lark", "Meleagris gallopavo_Wild Turkey", "Melospiza georgiana_Swamp Sparrow", "Melospiza lincolnii_Lincoln's Sparrow", "Melospiza melodia_Song Sparrow", "Melozone aberti_Abert's Towhee", "Melozone crissalis_California Towhee", "Melozone fusca_Canyon Towhee", "Mergus merganser_Common Merganser", "Mergus serrator_Red-breasted Merganser", "Merops apiaster_European Bee-eater", "Merops persicus_Blue-cheeked Bee-eater", "Micrathene whitneyi_Elf Owl", "Milvus migrans_Black Kite", "Milvus milvus_Red Kite", "Mimus polyglottos_Northern Mockingbird", "Mniotilta varia_Black-and-white Warbler", "Molothrus ater_Brown-headed Cowbird", "Monticola saxatilis_Rufous-tailed Rock-Thrush", "Monticola solitarius_Blue Rock-Thrush", "Montifringilla nivalis_White-winged Snowfinch", "Morus bassanus_Northern Gannet", "Motacilla alba_White Wagtail", "Motacilla cinerea_Gray Wagtail", "Motacilla citreola_Citrine Wagtail", "Motacilla flava_Western Yellow Wagtail", "Motacilla tschutschensis_Eastern Yellow Wagtail", "Muscicapa striata_Spotted Flycatcher", "Myadestes townsendi_Townsend's Solitaire", "Mycteria americana_Wood Stork", "Myiarchus cinerascens_Ash-throated Flycatcher", "Myiarchus crinitus_Great Crested Flycatcher", "Myiarchus tuberculifer_Dusky-capped Flycatcher", "Myiarchus tyrannulus_Brown-crested Flycatcher", "Myioborus pictus_Painted Redstart", "Myiodynastes luteiventris_Sulphur-bellied Flycatcher", "Myiopsitta monachus_Monk Parakeet", "Netta rufina_Red-crested Pochard", "Noise_Noise", "Non-Bird_Non-Bird", "Nucifraga caryocatactes_Eurasian Nutcracker", "Nucifraga columbiana_Clark's Nutcracker", "Numenius americanus_Long-billed Curlew", "Numenius arquata_Eurasian Curlew", "Numenius phaeopus_Whimbrel", "Nyctanassa violacea_Yellow-crowned Night-Heron", "Nycticorax nycticorax_Black-crowned Night-Heron", "Nyctidromus albicollis_Common Pauraque", "Oceanodroma castro_Band-rumped Storm-Petrel", "Oceanodroma leucorhoa_Leach's Storm-Petrel", "Oena capensis_Namaqua Dove", "Oenanthe deserti_Desert Wheatear", "Oenanthe finschii_Finsch's Wheatear", "Oenanthe hispanica_Black-eared Wheatear", "Oenanthe isabellina_Isabelline Wheatear", "Oenanthe leucopyga_White-crowned Wheatear", "Oenanthe leucura_Black Wheatear", "Oenanthe moesta_Red-rumped Wheatear", "Oenanthe oenanthe_Northern Wheatear", "Oenanthe pleschanka_Pied Wheatear", "Onychoprion aleuticus_Aleutian Tern", "Onychoprion fuscatus_Sooty Tern", "Oporornis agilis_Connecticut Warbler", "Oreortyx pictus_Mountain Quail", "Oreoscoptes montanus_Sage Thrasher", "Oriolus oriolus_Eurasian Golden Oriole", "Ortalis vetula_Plain Chachalaca", "Otus brucei_Pallid Scops-Owl", "Otus scops_Eurasian Scops-Owl", "Oxyura jamaicensis_Ruddy Duck", "Pandion haliaetus_Osprey", "Panurus biarmicus_Bearded Reedling", "Parabuteo unicinctus_Harris's Hawk", "Parkesia motacilla_Louisiana Waterthrush", "Parkesia noveboracensis_Northern Waterthrush", "Parus major_Great Tit", "Passer domesticus_House Sparrow", "Passer hispaniolensis_Spanish Sparrow", "Passer italiae_Italian Sparrow", "Passer moabiticus_Dead Sea Sparrow", "Passer montanus_Eurasian Tree Sparrow", "Passer simplex_Desert Sparrow", "Passerculus sandwichensis_Savannah Sparrow", "Passerella iliaca_Fox Sparrow", "Passerina amoena_Lazuli Bunting", "Passerina caerulea_Blue Grosbeak", "Passerina ciris_Painted Bunting", "Passerina cyanea_Indigo Bunting", "Passerina versicolor_Varied Bunting", "Pastor roseus_Rosy Starling", "Patagioenas fasciata_Band-tailed Pigeon", "Patagioenas flavirostris_Red-billed Pigeon", "Pelecanus occidentalis_Brown Pelican", "Pelecanus onocrotalus_Great White Pelican", "Perdix perdix_Gray Partridge", "Periparus ater_Coal Tit", "Perisoreus canadensis_Canada Jay", "Perisoreus infaustus_Siberian Jay", "Pernis apivorus_European Honey-buzzard", "Petrochelidon fulva_Cave Swallow", "Petrochelidon pyrrhonota_Cliff Swallow", "Petronia petronia_Rock Sparrow", "Peucaea aestivalis_Bachman's Sparrow", "Peucaea botterii_Botteri's Sparrow", "Peucaea carpalis_Rufous-winged Sparrow", "Peucaea cassinii_Cassin's Sparrow", "Peucedramus taeniatus_Olive Warbler", "Phainopepla nitens_Phainopepla", "Phalacrocorax auritus_Double-crested Cormorant", "Phalacrocorax brasilianus_Neotropic Cormorant", "Phalacrocorax carbo_Great Cormorant", "Phalaenoptilus nuttallii_Common Poorwill", "Phalaropus fulicarius_Red Phalarope", "Phalaropus lobatus_Red-necked Phalarope", "Phasianus colchicus_Ring-necked Pheasant", "Pheucticus ludovicianus_Rose-breasted Grosbeak", "Pheucticus melanocephalus_Black-headed Grosbeak", "Phoebastria nigripes_Black-footed Albatross", "Phoenicopterus roseus_Greater Flamingo", "Phoenicurus moussieri_Moussier's Redstart", "Phoenicurus ochruros_Black Redstart", "Phoenicurus phoenicurus_Common Redstart", "Phylloscopus bonelli_Western Bonelli's Warbler", "Phylloscopus borealis_Arctic Warbler", "Phylloscopus collybita_Common Chiffchaff", "Phylloscopus fuscatus_Dusky Warbler", "Phylloscopus ibericus_Iberian Chiffchaff", "Phylloscopus inornatus_Yellow-browed Warbler", "Phylloscopus nitidus_Green Warbler", "Phylloscopus orientalis_Eastern Bonelli's Warbler", "Phylloscopus proregulus_Pallas's Leaf Warbler", "Phylloscopus sibilatrix_Wood Warbler", "Phylloscopus sindianus_Mountain Chiffchaff", "Phylloscopus trochiloides_Greenish Warbler", "Phylloscopus trochilus_Willow Warbler", "Pica hudsonia_Black-billed Magpie", "Pica nuttalli_Yellow-billed Magpie", "Pica pica_Eurasian Magpie", "Picoides arcticus_Black-backed Woodpecker", "Picoides dorsalis_American Three-toed Woodpecker", "Picoides tridactylus_Eurasian Three-toed Woodpecker", "Picus canus_Gray-headed Woodpecker", "Picus vaillantii_Levaillant's Woodpecker", "Picus viridis_Eurasian Green Woodpecker", "Pinicola enucleator_Pine Grosbeak", "Pipilo chlorurus_Green-tailed Towhee", "Pipilo erythrophthalmus_Eastern Towhee", "Pipilo maculatus_Spotted Towhee", "Piranga flava_Hepatic Tanager", "Piranga ludoviciana_Western Tanager", "Piranga olivacea_Scarlet Tanager", "Piranga rubra_Summer Tanager", "Pitangus sulphuratus_Great Kiskadee", "Platalea ajaja_Roseate Spoonbill", "Platalea leucorodia_Eurasian Spoonbill", "Plectrophenax nivalis_Snow Bunting", "Plegadis chihi_White-faced Ibis", "Plegadis falcinellus_Glossy Ibis", "Pluvialis apricaria_European Golden-Plover", "Pluvialis dominica_American Golden-Plover", "Pluvialis fulva_Pacific Golden-Plover", "Pluvialis squatarola_Black-bellied Plover", "Podiceps auritus_Horned Grebe", "Podiceps cristatus_Great Crested Grebe", "Podiceps grisegena_Red-necked Grebe", "Podiceps nigricollis_Eared Grebe", "Podilymbus podiceps_Pied-billed Grebe", "Poecile atricapillus_Black-capped Chickadee", "Poecile carolinensis_Carolina Chickadee", "Poecile cinctus_Gray-headed Chickadee", "Poecile gambeli_Mountain Chickadee", "Poecile hudsonicus_Boreal Chickadee", "Poecile lugubris_Sombre Tit", "Poecile montanus_Willow Tit", "Poecile palustris_Marsh Tit", "Poecile rufescens_Chestnut-backed Chickadee", "Poecile sclateri_Mexican Chickadee", "Polioptila caerulea_Blue-gray Gnatcatcher", "Polioptila californica_California Gnatcatcher", "Polioptila melanura_Black-tailed Gnatcatcher", "Pooecetes gramineus_Vesper Sparrow", "Porphyrio martinica_Purple Gallinule", "Porphyrio poliocephalus_Gray-headed Swamphen", "Porphyrio porphyrio_Western Swamphen", "Porzana carolina_Sora", "Porzana porzana_Spotted Crake", "Prinia gracilis_Graceful Prinia", "Progne subis_Purple Martin", "Protonotaria citrea_Prothonotary Warbler", "Prunella collaris_Alpine Accentor", "Prunella modularis_Dunnock", "Prunella ocularis_Radde's Accentor", "Psaltriparus minimus_Bushtit", "Psilorhinus morio_Brown Jay", "Psiloscops flammeolus_Flammulated Owl", "Psittacara holochlorus_Green Parakeet", "Psittacula eupatria_Alexandrine Parakeet", "Psittacula krameri_Rose-ringed Parakeet", "Pterocles alchata_Pin-tailed Sandgrouse", "Pterocles coronatus_Crowned Sandgrouse", "Pterocles exustus_Chestnut-bellied Sandgrouse", "Pterocles orientalis_Black-bellied Sandgrouse", "Pterocles senegallus_Spotted Sandgrouse", "Ptyonoprogne fuligula_Rock Martin", "Ptyonoprogne rupestris_Eurasian Crag-Martin", "Puffinus puffinus_Manx Shearwater", "Pycnonotus barbatus_Common Bulbul", "Pycnonotus jocosus_Red-whiskered Bulbul", "Pycnonotus xanthopygos_White-spectacled Bulbul", "Pyrocephalus rubinus_Vermilion Flycatcher", "Pyrrhocorax graculus_Yellow-billed Chough", "Pyrrhocorax pyrrhocorax_Red-billed Chough", "Pyrrhula pyrrhula_Eurasian Bullfinch", "Quiscalus major_Boat-tailed Grackle", "Quiscalus mexicanus_Great-tailed Grackle", "Quiscalus quiscula_Common Grackle", "Rallus aquaticus_Water Rail", "Rallus crepitans_Clapper Rail", "Rallus elegans_King Rail", "Rallus limicola_Virginia Rail", "Rallus obsoletus_Ridgway's Rail", "Recurvirostra americana_American Avocet", "Recurvirostra avosetta_Pied Avocet", "Regulus calendula_Ruby-crowned Kinglet", "Regulus ignicapilla_Common Firecrest", "Regulus regulus_Goldcrest", "Regulus satrapa_Golden-crowned Kinglet", "Remiz pendulinus_Eurasian Penduline-Tit", "Rhodospiza obsoleta_Desert Finch", "Rhodostethia rosea_Ross's Gull", "Rhynchophanes mccownii_McCown's Longspur", "Riparia riparia_Bank Swallow", "Rissa tridactyla_Black-legged Kittiwake", "Rostrhamus sociabilis_Snail Kite", "Rynchops niger_Black Skimmer", "Salpinctes obsoletus_Rock Wren", "Saxicola maurus_Siberian Stonechat", "Saxicola rubetra_Whinchat", "Saxicola rubicola_European Stonechat", "Sayornis nigricans_Black Phoebe", "Sayornis phoebe_Eastern Phoebe", "Sayornis saya_Say's Phoebe", "Scolopax minor_American Woodcock", "Scolopax rusticola_Eurasian Woodcock", "Scotocerca inquieta_Scrub Warbler", "Seiurus aurocapilla_Ovenbird", "Selasphorus calliope_Calliope Hummingbird", "Selasphorus platycercus_Broad-tailed Hummingbird", "Selasphorus rufus_Rufous Hummingbird", "Selasphorus sasin_Allen's Hummingbird", "Serinus pusillus_Fire-fronted Serin", "Serinus serinus_European Serin", "Setophaga americana_Northern Parula", "Setophaga caerulescens_Black-throated Blue Warbler", "Setophaga castanea_Bay-breasted Warbler", "Setophaga cerulea_Cerulean Warbler", "Setophaga chrysoparia_Golden-cheeked Warbler", "Setophaga citrina_Hooded Warbler", "Setophaga coronata_Yellow-rumped Warbler", "Setophaga discolor_Prairie Warbler", "Setophaga dominica_Yellow-throated Warbler", "Setophaga fusca_Blackburnian Warbler", "Setophaga graciae_Grace's Warbler", "Setophaga kirtlandii_Kirtland's Warbler", "Setophaga magnolia_Magnolia Warbler", "Setophaga nigrescens_Black-throated Gray Warbler", "Setophaga occidentalis_Hermit Warbler", "Setophaga palmarum_Palm Warbler", "Setophaga pensylvanica_Chestnut-sided Warbler", "Setophaga petechia_Yellow Warbler", "Setophaga pinus_Pine Warbler", "Setophaga pitiayumi_Tropical Parula", "Setophaga ruticilla_American Redstart", "Setophaga striata_Blackpoll Warbler", "Setophaga tigrina_Cape May Warbler", "Setophaga townsendi_Townsend's Warbler", "Setophaga virens_Black-throated Green Warbler", "Sialia currucoides_Mountain Bluebird", "Sialia mexicana_Western Bluebird", "Sialia sialis_Eastern Bluebird", "Sitta canadensis_Red-breasted Nuthatch", "Sitta carolinensis_White-breasted Nuthatch", "Sitta europaea_Eurasian Nuthatch", "Sitta ledanti_Algerian Nuthatch", "Sitta neumayer_Western Rock Nuthatch", "Sitta pusilla_Brown-headed Nuthatch", "Sitta pygmaea_Pygmy Nuthatch", "Sitta tephronota_Eastern Rock Nuthatch", "Somateria mollissima_Common Eider", "Somateria spectabilis_King Eider", "Spatula clypeata_Northern Shoveler", "Spatula discors_Blue-winged Teal", "Spatula querquedula_Garganey", "Sphyrapicus nuchalis_Red-naped Sapsucker", "Sphyrapicus ruber_Red-breasted Sapsucker", "Sphyrapicus thyroideus_Williamson's Sapsucker", "Sphyrapicus varius_Yellow-bellied Sapsucker", "Spinus lawrencei_Lawrence's Goldfinch", "Spinus pinus_Pine Siskin", "Spinus psaltria_Lesser Goldfinch", "Spinus spinus_Eurasian Siskin", "Spinus tristis_American Goldfinch", "Spiza americana_Dickcissel", "Spizella atrogularis_Black-chinned Sparrow", "Spizella breweri_Brewer's Sparrow", "Spizella pallida_Clay-colored Sparrow", "Spizella passerina_Chipping Sparrow", "Spizella pusilla_Field Sparrow", "Spizelloides arborea_American Tree Sparrow", "Stelgidopteryx serripennis_Northern Rough-winged Swallow", "Stercorarius longicaudus_Long-tailed Jaeger", "Stercorarius maccormicki_South Polar Skua", "Stercorarius parasiticus_Parasitic Jaeger", "Stercorarius skua_Great Skua", "Sterna dougallii_Roseate Tern", "Sterna forsteri_Forster's Tern", "Sterna hirundo_Common Tern", "Sterna paradisaea_Arctic Tern", "Sternula albifrons_Little Tern", "Sternula antillarum_Least Tern", "Streptopelia decaocto_Eurasian Collared-Dove", "Streptopelia senegalensis_Laughing Dove", "Streptopelia turtur_European Turtle-Dove", "Strix aluco_Tawny Owl", "Strix nebulosa_Great Gray Owl", "Strix uralensis_Ural Owl", "Strix varia_Barred Owl", "Sturnella magna_Eastern Meadowlark", "Sturnella neglecta_Western Meadowlark", "Sturnus unicolor_Spotless Starling", "Sturnus vulgaris_European Starling", "Surnia ulula_Northern Hawk Owl", "Sylvia atricapilla_Eurasian Blackcap", "Sylvia borin_Garden Warbler", "Sylvia cantillans_Subalpine Warbler", "Sylvia communis_Greater Whitethroat", "Sylvia conspicillata_Spectacled Warbler", "Sylvia crassirostris_Eastern Orphean Warbler", "Sylvia curruca_Lesser Whitethroat", "Sylvia deserticola_Tristram's Warbler", "Sylvia hortensis_Western Orphean Warbler", "Sylvia melanocephala_Sardinian Warbler", "Sylvia mystacea_Menetries's Warbler", "Sylvia nana_Asian Desert Warbler", "Sylvia nisoria_Barred Warbler", "Sylvia sarda_Marmora's Warbler", "Sylvia subalpina_Moltoni's Warbler", "Sylvia undata_Dartford Warbler", "Tachybaptus dominicus_Least Grebe", "Tachybaptus ruficollis_Little Grebe", "Tachycineta bicolor_Tree Swallow", "Tachycineta thalassina_Violet-green Swallow", "Tadorna ferruginea_Ruddy Shelduck", "Tadorna tadorna_Common Shelduck", "Tarsiger cyanurus_Red-flanked Bluetail", "Tchagra senegalus_Black-crowned Tchagra", "Tetrao tetrix_Black Grouse", "Tetrao urogallus_Western Capercaillie", "Tetrastes bonasia_Hazel Grouse", "Tetrax tetrax_Little Bustard", "Thalasseus elegans_Elegant Tern", "Thalasseus maximus_Royal Tern", "Thalasseus sandvicensis_Sandwich Tern", "Thryomanes bewickii_Bewick's Wren", "Thryothorus ludovicianus_Carolina Wren", "Tichodroma muraria_Wallcreeper", "Toxostoma bendirei_Bendire's Thrasher", "Toxostoma crissale_Crissal Thrasher", "Toxostoma curvirostre_Curve-billed Thrasher", "Toxostoma lecontei_LeConte's Thrasher", "Toxostoma longirostre_Long-billed Thrasher", "Toxostoma redivivum_California Thrasher", "Toxostoma rufum_Brown Thrasher", "Tringa erythropus_Spotted Redshank", "Tringa flavipes_Lesser Yellowlegs", "Tringa glareola_Wood Sandpiper", "Tringa incana_Wandering Tattler", "Tringa melanoleuca_Greater Yellowlegs", "Tringa nebularia_Common Greenshank", "Tringa ochropus_Green Sandpiper", "Tringa semipalmata_Willet", "Tringa solitaria_Solitary Sandpiper", "Tringa stagnatilis_Marsh Sandpiper", "Tringa totanus_Common Redshank", "Troglodytes aedon_House Wren", "Troglodytes hiemalis_Winter Wren", "Troglodytes pacificus_Pacific Wren", "Troglodytes troglodytes_Eurasian Wren", "Trogon elegans_Elegant Trogon", "Turdoides fulva_Fulvous Chatterer", "Turdus grayi_Clay-colored Thrush", "Turdus iliacus_Redwing", "Turdus merula_Eurasian Blackbird", "Turdus migratorius_American Robin", "Turdus philomelos_Song Thrush", "Turdus pilaris_Fieldfare", "Turdus torquatus_Ring Ouzel", "Turdus viscivorus_Mistle Thrush", "Tympanuchus cupido_Greater Prairie-Chicken", "Tympanuchus pallidicinctus_Lesser Prairie-Chicken", "Tympanuchus phasianellus_Sharp-tailed Grouse", "Tyrannus couchii_Couch's Kingbird", "Tyrannus crassirostris_Thick-billed Kingbird", "Tyrannus dominicensis_Gray Kingbird", "Tyrannus forficatus_Scissor-tailed Flycatcher", "Tyrannus melancholicus_Tropical Kingbird", "Tyrannus tyrannus_Eastern Kingbird", "Tyrannus verticalis_Western Kingbird", "Tyrannus vociferans_Cassin's Kingbird", "Tyto alba_Barn Owl", "Upupa epops_Eurasian Hoopoe", "Uria aalge_Common Murre", "Uria lomvia_Thick-billed Murre", "Vanellus indicus_Red-wattled Lapwing", "Vanellus leucurus_White-tailed Lapwing", "Vanellus spinosus_Spur-winged Lapwing", "Vanellus vanellus_Northern Lapwing", "Vermivora chrysoptera_Golden-winged Warbler", "Vermivora cyanoptera_Blue-winged Warbler", "Vireo altiloquus_Black-whiskered Vireo", "Vireo atricapilla_Black-capped Vireo", "Vireo bellii_Bell's Vireo", "Vireo cassinii_Cassin's Vireo", "Vireo flavifrons_Yellow-throated Vireo", "Vireo gilvus_Warbling Vireo", "Vireo griseus_White-eyed Vireo", "Vireo huttoni_Hutton's Vireo", "Vireo olivaceus_Red-eyed Vireo", "Vireo philadelphicus_Philadelphia Vireo", "Vireo plumbeus_Plumbeous Vireo", "Vireo solitarius_Blue-headed Vireo", "Vireo vicinior_Gray Vireo", "Xanthocephalus xanthocephalus_Yellow-headed Blackbird", "Xema sabini_Sabine's Gull", "Xenus cinereus_Terek Sandpiper", "Zapornia parva_Little Crake", "Zenaida asiatica_White-winged Dove", "Zenaida macroura_Mourning Dove", "Zonotrichia albicollis_White-throated Sparrow", "Zonotrichia atricapilla_Golden-crowned Sparrow", "Zonotrichia leucophrys_White-crowned Sparrow", "Zonotrichia querula_Harris's Sparrow"];
                console.log("BirdNet model Loaded");
            } else {
                this.model = await tf.loadGraphModel(path.join(this.appPath, 'model.json'),
                    {weightPathPrefix: this.appPath});
                this.model_loaded = true;
                // get the indices of any items in the blacklist
                blacklist.forEach(species => blocked_IDs.push(labels.indexOf(species)))
                //blacklist.forEach(species => blocked_IDs.push([labels.indexOf(species)]))
                //blocked_IDs = tf.tensor2d(blocked_IDs,[blocked_IDs.length, 1] ,'int32')
                console.log("Model Loaded");
            }
            this.inputShape = this.model.inputs[0].shape
        }
    }

    _normalize_and_fix_shape(spec) {
        spec = spec.slice(253, 256);
        // Normalize to 0-255
        const spec_max = tf.max(spec);
        spec = spec.mul(255);
        spec = spec.div(spec_max);
        return spec;
    }

    _makeSpectrogram(audioBuffer) {
        this.spectrogram = tf.signal.stft(audioBuffer.squeeze(), this.frame_length, this.frame_step,);
        // Cast from complex to float
        this.spectrogram = tf.cast(this.spectrogram, 'float32');

        // Swap axes to fit output shape
        this.spectrogram = tf.transpose(this.spectrogram);
        this.spectrogram = tf.reverse(this.spectrogram, [0]);
        this.spectrogram = tf.abs(this.spectrogram);
        // Fix Spectrogram shape
        this.spectrogram = this._normalize_and_fix_shape(this.spectrogram);
        // Add channel axis
        this.spectrogram = tf.expandDims(this.spectrogram, -1);
        //const arraycheck = this.spectrogram.dataSync();
        //const max = Math.max(...arraycheck), min =Math.min(...arraycheck);
        // Resize to model shape
        //this.spectrogram = tf.image.resizeBilinear(this.spectrogram, [this.inputShape[1], this.inputShape[2]])
        // Add batch axis
        this.spectrogram = tf.expandDims(this.spectrogram, 0);

    }

    _timestampFromSeconds(seconds) {

        const date = new Date(1970, 0, 1);
        date.setSeconds(seconds);
        return date.toTimeString().replace(/.*(\d:\d{2}:\d{2}).*/, "$1");

    }

    async warmUp() {
        let warmupResult;
        if (this.isBirdnet) {
            warmupResult = this.model.predict(tf.zeros([1, 144000]));
        } else {
            warmupResult = this.model.predict(tf.zeros([1, this.inputShape[1], this.inputShape[2], this.inputShape[3]]));
        }
        warmupResult.dataSync();
        warmupResult.dispose();
    }

    async predictChunk(chunk, index, isRegion) {
        let result;
        let audacity;
        tf.tidy(() => {
            chunk = tf.tensor1d(chunk);
            const currentChunkLength = chunk.shape[0];
            // if the file is too shot, pad with zeroes.
            if (chunk.shape[0] < this.chunkLength) {
                let padding = tf.zeros([this.chunkLength - chunk.shape[0]]);
                chunk = chunk.concat(padding)
            }
            if (this.isBirdnet) {
                chunk = tf.expandDims(chunk, 0)
                this.prediction = this.model.predict(chunk);
            } else {
                this._makeSpectrogram(chunk);
                this.prediction = this.model.predict(this.spectrogram)
            }
            // Pull tensor out of GPU
            this.prediction = this.prediction.dataSync()
            // Squash blacklisted predictions
            blocked_IDs.forEach(id => this.prediction[id] = 0.0)
            // Recreate the tensor
            this.prediction = tf.tensor(this.prediction)
            this.prediction = tf.expandDims(this.prediction, 0)

            //const zeros = tf.zeros(blocked_IDs.shape)
            //this.prediction = tf.scatterND(blocked_IDs, zeros, this.prediction)

            // Get label
            const {indices, values} = this.prediction.topk(3);
            const [primary, secondary, tertiary] = indices.dataSync();
            const [score, score2, score3] = values.dataSync();

            result = ({
                start: index / this.config.sampleRate,
                end: (index + currentChunkLength) / this.config.sampleRate,
                timestamp: this._timestampFromSeconds(index / this.config.sampleRate) + ' - '
                    + this._timestampFromSeconds((index + currentChunkLength) / this.config.sampleRate),
                sname: this.labels[primary].split('_')[0],
                cname: this.labels[primary].split('_')[1],
                score: score,
                sname2: this.labels[secondary].split('_')[0],
                cname2: this.labels[secondary].split('_')[1],
                score2: score2,
                sname3: this.labels[tertiary].split('_')[0],
                cname3: this.labels[tertiary].split('_')[1],
                score3: score3,
            });
            audacity = ({
                timestamp: (index / CONFIG.sampleRate).toFixed(1) + '\t'
                    + ((index + currentChunkLength) / this.config.sampleRate).toFixed(1),
                cname: this.labels[primary].split('_')[1],
                score: score
            })

            console.log(primary, this.labels[primary], score);
        })
        //console.table(tf.memory());
        return [result, audacity];
    }
}

function BirdNetSetup() {
/////////////////////////  Build SimpleSpecLayer  /////////////////////////
    class SimpleSpecLayer
        extends tf
            .layers
            .Layer {
        constructor(config) {
            super(config);

            // For now, let's work with hard coded values to avoid strange errors when reading the config
            this.spec_shape = [257, 384];
            this.frame_length = 512;
            this.frame_step = 374;
        }

        build(inputShape) {
            this.mag_scale = this.addWeight('magnitude_scaling', [], 'float32', tf.initializers.constant({value: 1.0}));
        }

        computeOutputShape(inputShape) {
            return [inputShape[0], this.spec_shape[0], this.spec_shape[1], 1];
        }

        call(input, kwargs) {

            // Perform STFT
            var spec = tf.signal.stft(input[0].squeeze(),
                this.frame_length,
                this.frame_step)

            // Cast from complex to float
            spec = tf.cast(spec, 'float32');

            // Convert to power spectrogram
            spec = tf.pow(spec, 2.0)

            // Convert magnitudes using nonlinearity
            spec = tf.pow(spec, tf.div(1.0, tf.add(1.0, tf.exp(this.mag_scale.read()))))

            // Normalize values between 0 and 1
            //spec = tf.div(tf.sub(spec, tf.min(spec)), tf.max(spec));

            // Swap axes to fit output shape
            spec = tf.transpose(spec)

            // Add channel axis
            spec = tf.expandDims(spec, -1)

            // Add batch axis
            spec = tf.expandDims(spec, 0)

            return spec

        }

        static get className() {
            return 'SimpleSpecLayer';
        }
    }

    tf.serialization.registerClass(SimpleSpecLayer);

/////////////////////////  Build GlobalExpPool2D Layer  /////////////////////////
    function logmeanexp(x, axis, keepdims, sharpness) {
        xmax = tf.max(x, axis, true);
        xmax2 = tf.max(x, axis, keepdims);
        x = tf.mul(sharpness, tf.sub(x, xmax));
        y = tf.log(tf.mean(tf.exp(x), axis, keepdims));
        y = tf.add(tf.div(y, sharpness), xmax2);
        return y
    }

    class GlobalLogExpPooling2D extends tf.layers.Layer {
        constructor(config) {
            super(config);
        }

        build(inputShape) {
            this.sharpness = this.addWeight('sharpness', [1], 'float32', tf.initializers.constant({value: 2.0}));
        }

        computeOutputShape(inputShape) {
            return [inputShape[0], inputShape[3]];
        }

        call(input, kwargs) {

            return logmeanexp(input[0], [1, 2], false, this.sharpness.read());//.read().dataSync()[0]);

        }

        static get className() {
            return 'GlobalLogExpPooling2D';
        }
    }

    tf.serialization.registerClass(GlobalLogExpPooling2D);

/////////////////////////  Build Sigmoid Layer  /////////////////////////
    class SigmoidLayer extends tf.layers.Layer {
        constructor(config) {
            super(config);
            this.config = config;
        }

        build(inputShape) {
            this.kernel = this.addWeight('scale_factor', [1], 'float32', tf.initializers.constant({value: 1.0}));
        }

        computeOutputShape(inputShape) {
            return inputShape;
        }

        call(input, kwargs) {

            return tf.sigmoid(tf.mul(input[0], CONFIG.sigmoid))

        }

        static get className() {
            return 'SigmoidLayer';
        }
    }

    tf.serialization.registerClass(SigmoidLayer);
}

module.exports = Model;

