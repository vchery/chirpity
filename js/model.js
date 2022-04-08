const tf = require('@tensorflow/tfjs');
// https://www.tensorflow.org/js/guide/platform_environment#flags
//tf.enableDebugMode()
tf.enableProdMode();

tf.ENV.set('WEBGL_PACK', false)


//const labels = ["Tachymarptis melba_Alpine Swift", "Ambient Noise_Ambient Noise", "Pluvialis dominica_American Golden Plover", "Mareca americana_American Wigeon", "Animal_Animal", "Acrocephalus paludicola_Aquatic Warbler", "Acanthis hornemanni_Arctic Redpoll", "Stercorarius parasiticus_Arctic Skua", "Sterna paradisaea_Arctic Tern", "Phylloscopus borealis_Arctic Warbler", "Recurvirostra avosetta_Avocet", "Porzana pusilla_Baillon's Crake", "Limosa lapponica_Bar-tailed Godwit", "Tyto alba_Barn Owl", "Branta leucopsis_Barnacle Goose", "Sylvia nisoria_Barred Warbler", "Panurus biarmicus_Bearded Tit", "Merops apiaster_Bee-eater", "Cygnus columbianus_Bewick's Swan", "Botaurus stellaris_Bittern", "Oenanthe hispanica_Black-eared Wheatear", "Chroicocephalus ridibundus_Black-headed Gull", "Podiceps nigricollis_Black-necked Grebe", "Limosa limosa_Black-tailed Godwit", "Himantopus himantopus_Black-winged Stilt", "Lyrurus tetrix_Black Grouse", "Cepphus grylle_Black Guillemot", "Milvus migrans_Black Kite", "Phoenicurus ochruros_Black Redstart", "Chlidonias niger_Black Tern", "Turdus merula_Blackbird", "Sylvia atricapilla_Blackcap", "Spatula discors_Blue-winged Teal", "Cyanistes caeruleus_Blue Tit", "Luscinia svecica_Bluethroat", "Acrocephalus dumetorum_Blyth's Reed Warbler", "Fringilla montifringilla_Brambling", "Branta bernicla_Brent Goose", "Pyrrhula pyrrhula_Bullfinch", "Buteo buteo_Buzzard", "Branta canadensis_Canada Goose", "Tetrao urogallus_Capercaillie", "Corvus corone_Carrion Crow", "Larus cachinnans_Caspian Gull", "Bubulcus ibis_Cattle Egret", "Cettia cetti_Cetti's Warbler", "Fringilla coelebs_Chaffinch", "Phylloscopus collybita_Chiffchaff", "Pyrrhocorax pyrrhocorax_Chough", "Emberiza cirlus_Cirl Bunting", "Motacilla citreola_Citrine Wagtail", "Periparus ater_Coal Tit", "Streptopelia decaocto_Collared Dove", "Glareola pratincola_Collared Pratincole", "Loxia curvirostra_Common Crossbill", "Larus canus_Common Gull", "Acanthis flammea_Common Redpoll", "Carpodacus erythrinus_Common Rosefinch", "Actitis hypoleucos_Common Sandpiper", "Melanitta nigra_Common Scoter", "Sterna hirundo_Common Tern", "Fulica atra_Coot", "Phalacrocorax carbo_Cormorant", "Emberiza calandra_Corn Bunting", "Crex crex_Corncrake", "Calonectris borealis_Cory's Shearwater", "Grus grus_Crane", "Lophophanes cristatus_Crested Tit", "Cuculus canorus_Cuckoo", "Calidris ferruginea_Curlew Sandpiper", "Numenius arquata_Curlew", "Sylvia undata_Dartford Warbler", "Cinclus cinclus_Dipper", "Charadrius morinellus_Dotterel", "Calidris alpina_Dunlin", "Prunella modularis_Dunnock", "Phylloscopus fuscatus_Dusky Warbler", "Alopochen aegyptiaca_Egyptian Goose", "Somateria mollissima_Eider", "Bubo bubo_Eurasian Eagle-Owl", "Turdus pilaris_Fieldfare", "Regulus ignicapilla_Firecrest", "Fulmarus glacialis_Fulmar", "Mareca strepera_Gadwall", "Morus bassanus_Gannet", "Sylvia borin_Garden Warbler", "Spatula querquedula_Garganey", "Larus hyperboreus_Glaucous Gull", "Plegadis falcinellus_Glossy Ibis", "Regulus regulus_Goldcrest", "Aquila chrysaetos_Golden Eagle", "Oriolus oriolus_Golden Oriole", "Pluvialis apricaria_Golden Plover", "Bucephala clangula_Goldeneye", "Carduelis carduelis_Goldfinch", "Mergus merganser_Goosander", "Accipiter gentilis_Goshawk", "Locustella naevia_Grasshopper Warbler", "Larus marinus_Great Black-backed Gull", "Podiceps cristatus_Great Crested Grebe", "Lanius excubitor_Great Grey Shrike", "Gavia immer_Great Northern Diver", "Stercorarius skua_Great Skua", "Dendrocopos major_Great Spotted Woodpecker", "Parus major_Great Tit", "Ardea alba_Great White Egret", "Anas carolinensis_Green-winged Teal", "Tringa ochropus_Green Sandpiper", "Picus viridis_Green Woodpecker", "Chloris chloris_Greenfinch", "Phylloscopus trochiloides_Greenish Warbler", "Tringa nebularia_Greenshank", "Ardea cinerea_Grey Heron", "Perdix perdix_Grey Partridge", "Phalaropus fulicarius_Grey Phalarope", "Pluvialis squatarola_Grey Plover", "Motacilla cinerea_Grey Wagtail", "Anser anser_Greylag Goose", "Uria aalge_Guillemot", "Gelochelidon nilotica_Gull-billed Tern", "Coccothraustes coccothraustes_Hawfinch", "Larus argentatus_Herring Gull", "Falco subbuteo_Hobby", "Pernis apivorus_Honey-buzzard", "Corvus cornix_Hooded Crow", "Upupa epops_Hoopoe", "Delichon urbicum_House Martin", "Passer domesticus_House Sparrow", "Human_Human", "Phylloscopus ibericus_Iberian Chiffchaff", "Hippolais icterina_Icterine Warbler", "Lymnocryptes minimus_Jack Snipe", "Coloeus monedula_Jackdaw", "Garrulus glandarius_Jay", "Charadrius alexandrinus_Kentish Plover", "Falco tinnunculus_Kestrel", "Alcedo atthis_Kingfisher", "Rissa tridactyla_Kittiwake", "Calidris canutus_Knot", "Calcarius lapponicus_Lapland Bunting", "Vanellus vanellus_Lapwing", "Larus fuscus_Lesser Black-backed Gull", "Acanthis cabaret_Lesser Redpoll", "Dryobates minor_Lesser Spotted Woodpecker", "Sylvia curruca_Lesser Whitethroat", "Linaria cannabina_Linnet", "Ixobrychus minutus_Little Bittern", "Emberiza pusilla_Little Bunting", "Egretta garzetta_Little Egret", "Tachybaptus ruficollis_Little Grebe", "Hydrocoloeus minutus_Little Gull", "Athene noctua_Little Owl", "Charadrius dubius_Little Ringed Plover", "Calidris minuta_Little Stint", "Sternula albifrons_Little Tern", "Asio otus_Long-eared Owl", "Clangula hyemalis_Long-tailed Duck", "Stercorarius longicaudus_Long-tailed Skua", "Aegithalos caudatus_Long-tailed Tit", "Pica pica_Magpie", "Anas platyrhynchos_Mallard", "Aix galericulata_Mandarin Duck", "Puffinus puffinus_Manx Shearwater", "Circus aeruginosus_Marsh Harrier", "Poecile palustris_Marsh Tit", "Anthus pratensis_Meadow Pipit", "Ichthyaetus melanocephalus_Mediterranean Gull", "Hippolais polyglotta_Melodious Warbler", "Falco columbarius_Merlin", "Turdus viscivorus_Mistle Thrush", "Circus pygargus_Montagu's Harrier", "Gallinula chloropus_Moorhen", "Cygnus olor_Mute Swan", "Nycticorax nycticorax_Night Heron", "Luscinia megarhynchos_Nightingale", "Caprimulgus europaeus_Nightjar", "Sitta europaea_Nuthatch", "Anthus hodgsoni_Olive-backed Pipit", "Emberiza hortulana_Ortolan Bunting", "Pandion haliaetus_Osprey", "Haematopus ostralegus_Oystercatcher", "Syrrhaptes paradoxus_Pallas's Sandgrouse", "Phylloscopus proregulus_Pallas's Warbler", "Loxia pytyopsittacus_Parrot Crossbill", "Calidris melanotos_Pectoral Sandpiper", "Remiz pendulinus_Penduline Tit", "Falco peregrinus_Peregrine", "Phasianus colchicus_Pheasant", "Ficedula hypoleuca_Pied Flycatcher", "Motacilla alba_Pied Wagtail", "Anser brachyrhynchus_Pink-footed Goose", "Anas acuta_Pintail", "Aythya ferina_Pochard", "Lagopus muta_Ptarmigan", "Ardea purpurea_Purple Heron", "Calidris maritima_Purple Sandpiper", "Coturnix coturnix_Quail", "Phylloscopus schwarzi_Radde's Warbler", "Corvus corax_Raven", "Alca torda_Razorbill", "Lanius collurio_Red-backed Shrike", "Ficedula parva_Red-breasted Flycatcher", "Mergus serrator_Red-breasted Merganser", "Netta rufina_Red-crested Pochard", "Tarsiger cyanurus_Red-flanked Bluetail", "Alectoris rufa_Red-legged Partridge", "Podiceps grisegena_Red-necked Grebe", "Caprimulgus ruficollis_Red-necked Nightjar", "Phalaropus lobatus_Red-necked Phalarope", "Cecropis daurica_Red-rumped Swallow", "Gavia stellata_Red-throated Diver", "Lagopus lagopus_Red Grouse", "Milvus milvus_Red Kite", "Tringa totanus_Redshank", "Phoenicurus phoenicurus_Redstart", "Turdus iliacus_Redwing", "Emberiza schoeniclus_Reed Bunting", "Acrocephalus scirpaceus_Reed Warbler", "Anthus richardi_Richard's Pipit", "Larus delawarensis_Ring-billed Gull", "Psittacula krameri_Ring-necked Parakeet", "Turdus torquatus_Ring Ouzel", "Charadrius hiaticula_Ringed Plover", "Erithacus rubecula_Robin", "Columba livia_Rock Dove", "Anthus petrosus_Rock Pipit", "Corvus frugilegus_Rook", "Pastor roseus_Rose-coloured Starling", "Sterna dougallii_Roseate Tern", "Buteo lagopus_Rough-legged Buzzard", "Oxyura jamaicensis_Ruddy Duck", "Tadorna ferruginea_Ruddy Shelduck", "Calidris pugnax_Ruff", "Xema sabini_Sabine's Gull", "Riparia riparia_Sand Martin", "Calidris alba_Sanderling", "Thalasseus sandvicensis_Sandwich Tern", "Locustella luscinioides_Savi's Warbler", "Aythya marila_Scaup", "Loxia scotica_Scottish Crossbill", "Acrocephalus schoenobaenus_Sedge Warbler", "Calidris pusilla_Semipalmated Sandpiper", "Serinus serinus_Serin", "Tadorna tadorna_Shelduck", "Eremophila alpestris_Shore Lark", "Asio flammeus_Short-eared Owl", "Calandrella brachydactyla_Short-toed Lark", "Spatula clypeata_Shoveler", "Spinus spinus_Siskin", "Alauda arvensis_Skylark", "Podiceps auritus_Slavonian Grebe", "Gallinago gallinago_Snipe", "Plectrophenax nivalis_Snow Bunting", "Anser caerulescens_Snow Goose", "Turdus philomelos_Song Thrush", "Accipiter nisus_Sparrowhawk", "Platalea leucorodia_Spoonbill", "Porzana porzana_Spotted Crake", "Muscicapa striata_Spotted Flycatcher", "Tringa erythropus_Spotted Redshank", "Actitis macularius_Spotted Sandpiper", "Sturnus vulgaris_Starling", "Columba oenas_Stock Dove", "Burhinus oedicnemus_Stone-curlew", "Saxicola rubicola_Stonechat", "Hydrobates pelagicus_Storm Petrel", "Sylvia cantillans_Subalpine Warbler", "Hirundo rustica_Swallow", "Apus apus_Swift", "Anser fabalis_Taiga Bean Goose", "Strix aluco_Tawny Owl", "Anas crecca_Teal", "Calidris temminckii_Temminck's Stint", "Anthus trivialis_Tree Pipit", "Passer montanus_Tree Sparrow", "Certhia familiaris_Treecreeper", "Aythya fuligula_Tufted Duck", "Anser serrirostris_Tundra Bean Goose", "Arenaria interpres_Turnstone", "Streptopelia turtur_Turtle Dove", "Linaria flavirostris_Twite", "Loxia leucoptera_Two-barred Crossbill", "Vehicle_Vehicle", "Anthus spinoletta_Water Pipit", "Rallus aquaticus_Water Rail", "Bombycilla garrulus_Waxwing", "Oenanthe oenanthe_Wheatear", "Numenius phaeopus_Whimbrel", "Saxicola rubetra_Whinchat", "Anser albifrons_White-fronted Goose", "Calidris fuscicollis_White-rumped Sandpiper", "Haliaeetus albicilla_White-tailed Eagle", "Chlidonias leucopterus_White-winged Black Tern", "Ciconia ciconia_White Stork", "Sylvia communis_Whitethroat", "Cygnus cygnus_Whooper Swan", "Mareca penelope_Wigeon", "Poecile montanus_Willow Tit", "Phylloscopus trochilus_Willow Warbler", "Tringa glareola_Wood Sandpiper", "Phylloscopus sibilatrix_Wood Warbler", "Scolopax rusticola_Woodcock", "Lullula arborea_Woodlark", "Columba palumbus_Woodpigeon", "Troglodytes troglodytes_Wren", "Jynx torquilla_Wryneck", "Phylloscopus inornatus_Yellow-browed Warbler", "Larus michahellis_Yellow-legged Gull", "Motacilla flava_Yellow Wagtail", "Emberiza citrinella_Yellowhammer"];
const labels = ["Tachymarptis melba_Alpine Swift", "Ambient Noise_Ambient Noise", "Pluvialis dominica_American Golden Plover", "Mareca americana_American Wigeon", "Animal_Animal", "Acrocephalus paludicola_Aquatic Warbler", "Acanthis hornemanni_Arctic Redpoll", "Stercorarius parasiticus_Arctic Skua", "Sterna paradisaea_Arctic Tern", "Phylloscopus borealis_Arctic Warbler", "Recurvirostra avosetta_Avocet", "Porzana pusilla_Baillon's Crake", "Limosa lapponica_Bar-tailed Godwit", "Tyto alba_Barn Owl", "Branta leucopsis_Barnacle Goose", "Sylvia nisoria_Barred Warbler", "Panurus biarmicus_Bearded Tit", "Merops apiaster_Bee-eater", "Cygnus columbianus_Bewick's Swan", "Botaurus stellaris_Bittern", "Oenanthe hispanica_Black-eared Wheatear", "Chroicocephalus ridibundus_Black-headed Gull", "Podiceps nigricollis_Black-necked Grebe", "Limosa limosa_Black-tailed Godwit", "Himantopus himantopus_Black-winged Stilt", "Lyrurus tetrix_Black Grouse", "Cepphus grylle_Black Guillemot", "Milvus migrans_Black Kite", "Phoenicurus ochruros_Black Redstart", "Chlidonias niger_Black Tern", "Turdus merula_Blackbird", "Sylvia atricapilla_Blackcap", "Spatula discors_Blue-winged Teal", "Cyanistes caeruleus_Blue Tit", "Luscinia svecica_Bluethroat", "Acrocephalus dumetorum_Blyth's Reed Warbler", "Fringilla montifringilla_Brambling", "Branta bernicla_Brent Goose", "Pyrrhula pyrrhula_Bullfinch", "Buteo buteo_Buzzard", "Branta canadensis_Canada Goose", "Tetrao urogallus_Capercaillie", "Corvus corone_Carrion/Hooded Crow", "Larus cachinnans_Caspian Gull", "Bubulcus ibis_Cattle Egret", "Cettia cetti_Cetti's Warbler", "Fringilla coelebs_Chaffinch", "Phylloscopus collybita_Chiffchaff", "Pyrrhocorax pyrrhocorax_Chough", "Emberiza cirlus_Cirl Bunting", "Motacilla citreola_Citrine Wagtail", "Periparus ater_Coal Tit", "Streptopelia decaocto_Collared Dove", "Glareola pratincola_Collared Pratincole", "Loxia curvirostra_Common Crossbill", "Larus canus_Common Gull", "Acanthis flammea_Common Redpoll", "Carpodacus erythrinus_Common Rosefinch", "Actitis hypoleucos_Common Sandpiper", "Melanitta nigra_Common Scoter", "Sterna hirundo_Common Tern", "Fulica atra_Coot", "Phalacrocorax carbo_Cormorant", "Emberiza calandra_Corn Bunting", "Crex crex_Corncrake", "Calonectris borealis_Cory's Shearwater", "Grus grus_Crane", "Lophophanes cristatus_Crested Tit", "Cuculus canorus_Cuckoo", "Calidris ferruginea_Curlew Sandpiper", "Numenius arquata_Curlew", "Sylvia undata_Dartford Warbler", "Cinclus cinclus_Dipper", "Charadrius morinellus_Dotterel", "Calidris alpina_Dunlin", "Prunella modularis_Dunnock", "Phylloscopus fuscatus_Dusky Warbler", "Alopochen aegyptiaca_Egyptian Goose", "Somateria mollissima_Eider", "Bubo bubo_Eurasian Eagle-Owl", "Turdus pilaris_Fieldfare", "Regulus ignicapilla_Firecrest", "Fulmarus glacialis_Fulmar", "Mareca strepera_Gadwall", "Morus bassanus_Gannet", "Sylvia borin_Garden Warbler", "Spatula querquedula_Garganey", "Larus hyperboreus_Glaucous Gull", "Plegadis falcinellus_Glossy Ibis", "Regulus regulus_Goldcrest", "Aquila chrysaetos_Golden Eagle", "Oriolus oriolus_Golden Oriole", "Pluvialis apricaria_Golden Plover", "Bucephala clangula_Goldeneye", "Carduelis carduelis_Goldfinch", "Mergus merganser_Goosander", "Accipiter gentilis_Goshawk", "Locustella naevia_Grasshopper Warbler", "Larus marinus_Great Black-backed Gull", "Podiceps cristatus_Great Crested Grebe", "Lanius excubitor_Great Grey Shrike", "Gavia immer_Great Northern Diver", "Stercorarius skua_Great Skua", "Dendrocopos major_Great Spotted Woodpecker", "Parus major_Great Tit", "Ardea alba_Great White Egret", "Anas carolinensis_Green-winged Teal", "Tringa ochropus_Green Sandpiper", "Picus viridis_Green Woodpecker", "Chloris chloris_Greenfinch", "Phylloscopus trochiloides_Greenish Warbler", "Tringa nebularia_Greenshank", "Ardea cinerea_Grey Heron", "Perdix perdix_Grey Partridge", "Phalaropus fulicarius_Grey Phalarope", "Pluvialis squatarola_Grey Plover", "Motacilla cinerea_Grey Wagtail", "Anser anser_Greylag Goose", "Uria aalge_Guillemot", "Gelochelidon nilotica_Gull-billed Tern", "Coccothraustes coccothraustes_Hawfinch", "Larus argentatus_Herring Gull", "Falco subbuteo_Hobby", "Pernis apivorus_Honey-buzzard", "Upupa epops_Hoopoe", "Delichon urbicum_House Martin", "Passer domesticus_House Sparrow", "Human_Human", "Phylloscopus ibericus_Iberian Chiffchaff", "Hippolais icterina_Icterine Warbler", "Lymnocryptes minimus_Jack Snipe", "Coloeus monedula_Jackdaw", "Garrulus glandarius_Jay", "Charadrius alexandrinus_Kentish Plover", "Falco tinnunculus_Kestrel", "Alcedo atthis_Kingfisher", "Rissa tridactyla_Kittiwake", "Calidris canutus_Knot", "Calcarius lapponicus_Lapland Bunting", "Vanellus vanellus_Lapwing", "Larus fuscus_Lesser Black-backed Gull", "Acanthis cabaret_Lesser Redpoll", "Dryobates minor_Lesser Spotted Woodpecker", "Sylvia curruca_Lesser Whitethroat", "Linaria cannabina_Linnet", "Ixobrychus minutus_Little Bittern", "Emberiza pusilla_Little Bunting", "Egretta garzetta_Little Egret", "Tachybaptus ruficollis_Little Grebe", "Hydrocoloeus minutus_Little Gull", "Athene noctua_Little Owl", "Charadrius dubius_Little Ringed Plover", "Calidris minuta_Little Stint", "Sternula albifrons_Little Tern", "Asio otus_Long-eared Owl", "Clangula hyemalis_Long-tailed Duck", "Stercorarius longicaudus_Long-tailed Skua", "Aegithalos caudatus_Long-tailed Tit", "Pica pica_Magpie", "Anas platyrhynchos_Mallard", "Aix galericulata_Mandarin Duck", "Puffinus puffinus_Manx Shearwater", "Circus aeruginosus_Marsh Harrier", "Poecile palustris_Marsh Tit", "Anthus pratensis_Meadow Pipit", "Ichthyaetus melanocephalus_Mediterranean Gull", "Hippolais polyglotta_Melodious Warbler", "Falco columbarius_Merlin", "Turdus viscivorus_Mistle Thrush", "Circus pygargus_Montagu's Harrier", "Gallinula chloropus_Moorhen", "Cygnus olor_Mute Swan", "Nycticorax nycticorax_Night Heron", "Luscinia megarhynchos_Nightingale", "Caprimulgus europaeus_Nightjar", "Sitta europaea_Nuthatch", "Anthus hodgsoni_Olive-backed Pipit", "Emberiza hortulana_Ortolan Bunting", "Pandion haliaetus_Osprey", "Haematopus ostralegus_Oystercatcher", "Syrrhaptes paradoxus_Pallas's Sandgrouse", "Phylloscopus proregulus_Pallas's Warbler", "Loxia pytyopsittacus_Parrot Crossbill", "Calidris melanotos_Pectoral Sandpiper", "Remiz pendulinus_Penduline Tit", "Falco peregrinus_Peregrine", "Phasianus colchicus_Pheasant", "Ficedula hypoleuca_Pied Flycatcher", "Motacilla alba_Pied Wagtail", "Anser brachyrhynchus_Pink-footed Goose", "Anas acuta_Pintail", "Aythya ferina_Pochard", "Lagopus muta_Ptarmigan", "Ardea purpurea_Purple Heron", "Calidris maritima_Purple Sandpiper", "Coturnix coturnix_Quail", "Phylloscopus schwarzi_Radde's Warbler", "Corvus corax_Raven", "Alca torda_Razorbill", "Lanius collurio_Red-backed Shrike", "Ficedula parva_Red-breasted Flycatcher", "Mergus serrator_Red-breasted Merganser", "Netta rufina_Red-crested Pochard", "Tarsiger cyanurus_Red-flanked Bluetail", "Alectoris rufa_Red-legged Partridge", "Podiceps grisegena_Red-necked Grebe", "Caprimulgus ruficollis_Red-necked Nightjar", "Phalaropus lobatus_Red-necked Phalarope", "Cecropis daurica_Red-rumped Swallow", "Gavia stellata_Red-throated Diver", "Lagopus lagopus_Red Grouse", "Milvus milvus_Red Kite", "Tringa totanus_Redshank", "Phoenicurus phoenicurus_Redstart", "Turdus iliacus_Redwing", "Emberiza schoeniclus_Reed Bunting", "Acrocephalus scirpaceus_Reed Warbler", "Anthus richardi_Richard's Pipit", "Larus delawarensis_Ring-billed Gull", "Psittacula krameri_Ring-necked Parakeet", "Turdus torquatus_Ring Ouzel", "Charadrius hiaticula_Ringed Plover", "Erithacus rubecula_Robin", "Columba livia_Rock Dove", "Anthus petrosus_Rock Pipit", "Corvus frugilegus_Rook", "Pastor roseus_Rose-coloured Starling", "Sterna dougallii_Roseate Tern", "Buteo lagopus_Rough-legged Buzzard", "Oxyura jamaicensis_Ruddy Duck", "Tadorna ferruginea_Ruddy Shelduck", "Calidris pugnax_Ruff", "Xema sabini_Sabine's Gull", "Riparia riparia_Sand Martin", "Calidris alba_Sanderling", "Thalasseus sandvicensis_Sandwich Tern", "Locustella luscinioides_Savi's Warbler", "Aythya marila_Scaup", "Loxia scotica_Scottish Crossbill", "Acrocephalus schoenobaenus_Sedge Warbler", "Calidris pusilla_Semipalmated Sandpiper", "Serinus serinus_Serin", "Tadorna tadorna_Shelduck", "Eremophila alpestris_Shore Lark", "Asio flammeus_Short-eared Owl", "Calandrella brachydactyla_Short-toed Lark", "Spatula clypeata_Shoveler", "Spinus spinus_Siskin", "Alauda arvensis_Skylark", "Podiceps auritus_Slavonian Grebe", "Gallinago gallinago_Snipe", "Plectrophenax nivalis_Snow Bunting", "Anser caerulescens_Snow Goose", "Turdus philomelos_Song Thrush", "Accipiter nisus_Sparrowhawk", "Platalea leucorodia_Spoonbill", "Porzana porzana_Spotted Crake", "Muscicapa striata_Spotted Flycatcher", "Tringa erythropus_Spotted Redshank", "Actitis macularius_Spotted Sandpiper", "Sturnus vulgaris_Starling", "Columba oenas_Stock Dove", "Burhinus oedicnemus_Stone-curlew", "Saxicola rubicola_Stonechat", "Hydrobates pelagicus_Storm Petrel", "Sylvia cantillans_Subalpine Warbler", "Hirundo rustica_Swallow", "Apus apus_Swift", "Anser fabalis_Taiga Bean Goose", "Strix aluco_Tawny Owl", "Anas crecca_Teal", "Calidris temminckii_Temminck's Stint", "Anthus trivialis_Tree Pipit", "Passer montanus_Tree Sparrow", "Certhia familiaris_Treecreeper", "Aythya fuligula_Tufted Duck", "Anser serrirostris_Tundra Bean Goose", "Arenaria interpres_Turnstone", "Streptopelia turtur_Turtle Dove", "Linaria flavirostris_Twite", "Loxia leucoptera_Two-barred Crossbill", "Vehicle_Vehicle", "Anthus spinoletta_Water Pipit", "Rallus aquaticus_Water Rail", "Bombycilla garrulus_Waxwing", "Oenanthe oenanthe_Wheatear", "Numenius phaeopus_Whimbrel", "Saxicola rubetra_Whinchat", "Anser albifrons_White-fronted Goose", "Calidris fuscicollis_White-rumped Sandpiper", "Haliaeetus albicilla_White-tailed Eagle", "Chlidonias leucopterus_White-winged Black Tern", "Ciconia ciconia_White Stork", "Sylvia communis_Whitethroat", "Cygnus cygnus_Whooper Swan", "Mareca penelope_Wigeon", "Poecile montanus_Willow Tit", "Phylloscopus trochilus_Willow Warbler", "Tringa glareola_Wood Sandpiper", "Phylloscopus sibilatrix_Wood Warbler", "Scolopax rusticola_Woodcock", "Lullula arborea_Woodlark", "Columba palumbus_Woodpigeon", "Troglodytes troglodytes_Wren", "Jynx torquilla_Wryneck", "Phylloscopus inornatus_Yellow-browed Warbler", "Larus michahellis_Yellow-legged Gull", "Motacilla flava_Yellow Wagtail", "Emberiza citrinella_Yellowhammer"];
const whitelist = ["Pluvialis dominica_American Golden Plover", "Acanthis hornemanni_Arctic Redpoll", "Sterna paradisaea_Arctic Tern", "Recurvirostra avosetta_Avocet", "Limosa lapponica_Bar-tailed Godwit", "Tyto alba_Barn Owl", "Branta leucopsis_Barnacle Goose", "Cygnus columbianus_Bewick's Swan", "Botaurus stellaris_Bittern", "Chroicocephalus ridibundus_Black-headed Gull", "Podiceps nigricollis_Black-necked Grebe", "Limosa limosa_Black-tailed Godwit", "Turdus merula_Blackbird", "Sylvia atricapilla_Blackcap", "Cyanistes caeruleus_Blue Tit", "Fringilla montifringilla_Brambling", "Branta bernicla_Brent Goose", "Pyrrhula pyrrhula_Bullfinch", "Buteo buteo_Buzzard", "Branta canadensis_Canada Goose", "Corvus corone_Carrion Crow", "Larus cachinnans_Caspian Gull", "Cettia cetti_Cetti's Warbler", "Fringilla coelebs_Chaffinch", "Phylloscopus collybita_Chiffchaff", "Periparus ater_Coal Tit", "Streptopelia decaocto_Collared Dove", "Loxia curvirostra_Common Crossbill", "Larus canus_Common Gull", "Acanthis flammea_Common Redpoll", "Actitis hypoleucos_Common Sandpiper", "Melanitta nigra_Common Scoter", "Sterna hirundo_Common Tern", "Fulica atra_Coot", "Phalacrocorax carbo_Cormorant", "Crex crex_Corncrake", "Grus grus_Crane", "Cuculus canorus_Cuckoo", "Calidris ferruginea_Curlew Sandpiper", "Numenius arquata_Curlew", "Charadrius morinellus_Dotterel", "Calidris alpina_Dunlin", "Prunella modularis_Dunnock", "Alopochen aegyptiaca_Egyptian Goose", "Somateria mollissima_Eider", "Turdus pilaris_Fieldfare", "Mareca strepera_Gadwall", "Sylvia borin_Garden Warbler", "Spatula querquedula_Garganey", "Regulus regulus_Goldcrest", "Pluvialis apricaria_Golden Plover", "Bucephala clangula_Goldeneye", "Carduelis carduelis_Goldfinch", "Mergus merganser_Goosander", "Locustella naevia_Grasshopper Warbler", "Larus marinus_Great Black-backed Gull", "Podiceps cristatus_Great Crested Grebe", "Parus major_Great Tit", "Tringa ochropus_Green Sandpiper", "Picus viridis_Green Woodpecker", "Chloris chloris_Greenfinch", "Tringa nebularia_Greenshank", "Ardea cinerea_Grey Heron", "Perdix perdix_Grey Partridge", "Pluvialis squatarola_Grey Plover", "Motacilla cinerea_Grey Wagtail", "Anser anser_Greylag Goose", "Uria aalge_Guillemot", "Coccothraustes coccothraustes_Hawfinch", "Larus argentatus_Herring Gull", "Corvus cornix_Hooded Crow", "Delichon urbicum_House Martin", "Passer domesticus_House Sparrow", "Lymnocryptes minimus_Jack Snipe", "Coloeus monedula_Jackdaw", "Garrulus glandarius_Jay", "Falco tinnunculus_Kestrel", "Alcedo atthis_Kingfisher", "Rissa tridactyla_Kittiwake", "Calidris canutus_Knot", "Calcarius lapponicus_Lapland Bunting", "Vanellus vanellus_Lapwing", "Larus fuscus_Lesser Black-backed Gull", "Acanthis cabaret_Lesser Redpoll", "Sylvia curruca_Lesser Whitethroat", "Linaria cannabina_Linnet", "Egretta garzetta_Little Egret", "Tachybaptus ruficollis_Little Grebe", "Hydrocoloeus minutus_Little Gull", "Athene noctua_Little Owl", "Charadrius dubius_Little Ringed Plover", "Calidris minuta_Little Stint", "Sternula albifrons_Little Tern", "Asio otus_Long-eared Owl", "Clangula hyemalis_Long-tailed Duck", "Aegithalos caudatus_Long-tailed Tit", "Pica pica_Magpie", "Anas platyrhynchos_Mallard", "Aix galericulata_Mandarin Duck", "Puffinus puffinus_Manx Shearwater", "Poecile palustris_Marsh Tit", "Anthus pratensis_Meadow Pipit", "Ichthyaetus melanocephalus_Mediterranean Gull", "Turdus viscivorus_Mistle Thrush", "Gallinula chloropus_Moorhen", "Cygnus olor_Mute Swan", "Luscinia megarhynchos_Nightingale", "Caprimulgus europaeus_Nightjar", "Sitta europaea_Nuthatch", "Emberiza hortulana_Ortolan Bunting", "Haematopus ostralegus_Oystercatcher", "Phasianus colchicus_Pheasant", "Ficedula hypoleuca_Pied Flycatcher", "Motacilla alba_Pied Wagtail", "Anser brachyrhynchus_Pink-footed Goose", "Anas acuta_Pintail", "Aythya ferina_Pochard", "Calidris maritima_Purple Sandpiper", "Coturnix coturnix_Quail", "Corvus corax_Raven", "Alca torda_Razorbill", "Mergus serrator_Red-breasted Merganser", "Netta rufina_Red-crested Pochard", "Alectoris rufa_Red-legged Partridge", "Gavia stellata_Red-throated Diver", "Milvus milvus_Red Kite", "Tringa totanus_Redshank", "Phoenicurus phoenicurus_Redstart", "Turdus iliacus_Redwing", "Emberiza schoeniclus_Reed Bunting", "Acrocephalus scirpaceus_Reed Warbler", "Psittacula krameri_Ring-necked Parakeet", "Turdus torquatus_Ring Ouzel", "Charadrius hiaticula_Ringed Plover", "Erithacus rubecula_Robin", "Columba livia_Rock Dove", "Anthus petrosus_Rock Pipit", "Corvus frugilegus_Rook", "Sterna dougallii_Roseate Tern", "Calidris pugnax_Ruff", "Riparia riparia_Sand Martin", "Calidris alba_Sanderling", "Thalasseus sandvicensis_Sandwich Tern", "Aythya marila_Scaup", "Loxia scotica_Scottish Crossbill", "Acrocephalus schoenobaenus_Sedge Warbler", "Tadorna tadorna_Shelduck", "Asio flammeus_Short-eared Owl", "Spatula clypeata_Shoveler", "Spinus spinus_Siskin", "Alauda arvensis_Skylark", "Gallinago gallinago_Snipe", "Plectrophenax nivalis_Snow Bunting", "Turdus philomelos_Song Thrush", "Accipiter nisus_Sparrowhawk", "Porzana porzana_Spotted Crake", "Muscicapa striata_Spotted Flycatcher", "Tringa erythropus_Spotted Redshank", "Sturnus vulgaris_Starling", "Columba oenas_Stock Dove", "Burhinus oedicnemus_Stone-curlew", "Saxicola rubicola_Stonechat", "Hirundo rustica_Swallow", "Apus apus_Swift", "Anser fabalis_Taiga Bean Goose", "Strix aluco_Tawny Owl", "Anas crecca_Teal", "Anthus trivialis_Tree Pipit", "Passer montanus_Tree Sparrow", "Certhia familiaris_Treecreeper", "Aythya fuligula_Tufted Duck", "Anser serrirostris_Tundra Bean Goose", "Arenaria interpres_Turnstone", "Rallus aquaticus_Water Rail", "Numenius phaeopus_Whimbrel", "Anser albifrons_White-fronted Goose", "Sylvia communis_Whitethroat", "Cygnus cygnus_Whooper Swan", "Mareca penelope_Wigeon", "Poecile montanus_Willow Tit", "Phylloscopus trochilus_Willow Warbler", "Tringa glareola_Wood Sandpiper", "Scolopax rusticola_Woodcock", "Columba palumbus_Woodpigeon", "Troglodytes troglodytes_Wren", "Larus michahellis_Yellow-legged Gull", "Motacilla flava_Yellow Wagtail", "Emberiza citrinella_Yellowhammer"];

//const blacklist = ["Human_Human", "Ambient Noise_Ambient Noise", "Animal_Animal", "Vehicle_Vehicle"];
//const blacklist = [];
//const greylist = ["Phylloscopus fuscatus_Dusky Warbler", "Gallinago gallinago_Snipe", "Accipiter gentilis_Goshawk", "Asio otus_Long-eared Owl", "Bubo bubo_Eurasian Eagle-Owl", "Oriolus oriolus_Golden Oriole", "Cuculus canorus_Cuckoo"];
const greylist = ["Sylvia curruca_Lesser Whitethroat", "Asio otus_Long-eared Owl", "Botaurus stellaris_Bittern"];
const goldenlist = ["Turdus iliacus_Redwing", "Turdus philomelos_Song Thrush"];
let blocked_IDs = [];
let allowed_IDs = [];
let suppressed_IDs = [];
let enhanced_IDs = [];


const path = require("path");

const CONFIG = {

    sampleRate: 24000, specLength: 3, sigmoid: 1.0,

}

class Model {
    constructor(appPath, useWhitelist) {
        this.model = null;
        this.labels = labels;
        this.config = CONFIG;
        this.chunkLength = this.config.sampleRate * this.config.specLength;
        this.model_loaded = false;
        this.appPath = null;
        this.spectrogram = null;
        this.frame_length = 512;
        this.frame_step = 186;
        this.prediction = null;
        this.prediction_batch = null;
        this.keys_batch = [];
        this.result = null;
        this.appPath = appPath;
        this.useWhitelist = useWhitelist;
    }

    async loadModel() {
        if (this.model_loaded === false) {
            // Model files must be in a different folder than the js, assets files
            this.model = await tf.loadGraphModel(path.join(this.appPath, 'model.json'),
                {weightPathPrefix: this.appPath});
            this.model_loaded = true;
            // get the indices of any items in the blacklist, greylist
            if (this.useWhitelist) {
                // find the position of the whitelist species in the label list
                whitelist.forEach(species => allowed_IDs.push(labels.indexOf(species)))
                // generate the opposite for a blacklist
                let i = 0;
                while (i < labels.length) {
                    if (allowed_IDs.indexOf(i) === -1) {
                        blocked_IDs.push(i)
                    }
                    i++;
                }
            } else {
                //blacklist.forEach(species => blocked_IDs.push(labels.indexOf(species)))
            }
            greylist.forEach(species => suppressed_IDs.push(labels.indexOf(species)))
            goldenlist.forEach(species => enhanced_IDs.push(labels.indexOf(species)))

            this.inputShape = this.model.inputs[0].shape
        }
    }

    _normalize_and_fix_shape(spec) {
        spec = tf.slice2d(spec, [0, 0], [256, 384]);
        // Normalize to 0-255
        const spec_max = tf.max(spec);
        spec = spec.mul(255);
        spec = spec.div(spec_max);
        return spec;
    }

    _makeSpectrogram(audioBuffer) {
        // const s0 = performance.now();
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
        // const s1 = performance.now();
        // console.log(`Spec creation took ${s1-s0} milliseconds`)
    }

    _timestampFromSeconds(seconds, fileStart) {
        const date = new Date(fileStart);
        //if (fileStart === 0) date.setHours(date.getHours() - 1);
        //const date = new Date(1970, 0, 1);
        date.setSeconds(date.getSeconds() + seconds);
        return date // .toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");

    }

    async warmUp(batchSize) {
        this.batchSize = batchSize;
        let warmupResult;
        warmupResult = this.model.predict(tf.zeros([batchSize, this.inputShape[1], this.inputShape[2], this.inputShape[3]]));

        warmupResult.dataSync();
        warmupResult.dispose();
        return true;
    }


    async predictChunk(chunks, fileStart, lastKey) {
        let batched_results = [];
        let result;
        let audacity;
        //tf.tidy(() => {
        let tensorArray = [];
        let keys = [];
        for (const [key, value] of Object.entries(chunks)) {
            keys.push(key);
            let chunk = tf.tensor1d(value);
            // if the file is too short, pad with zeroes. Only if at least 1 second of signal
            if (chunk.shape[0] < this.chunkLength) {
                if (chunk.shape[0] > this.chunkLength / 6) {
                    let padding = tf.zeros([this.chunkLength - chunk.shape[0]]);
                    chunk = chunk.concat(padding);
                } else { // Ignore chunk fragment
                    continue
                }
            }
            this._makeSpectrogram(chunk);
            tensorArray.push(this.spectrogram);
        }
        // If we have any tensors, stack them, else create ones
        tensorArray.length ? this.batch = tf.stack(tensorArray) : this.batch = tf.zeros([1, this.inputShape[1], this.inputShape[2], this.inputShape[3]]);
        if (this.batch.shape[0] < this.batchSize) {
            const padding = tf.zeros([this.batchSize - this.batch.shape[0], this.inputShape[1], this.inputShape[2], this.inputShape[3]]);
            this.batch = tf.concat([this.batch, padding], 0)
        }
        //let t0 = performance.now();
        this.prediction = this.model.predict(this.batch, {batchSize: this.batchSize})
        //let t1 = performance.now()
        //console.log(`predictions took: ${t1 - t0} milliseconds`)
        // Get label
        let top3, top3scores;
        if ((this.prediction_batch && this.prediction_batch.shape[0] === this.batchSize * 2) || keys[keys.length - 1] >= lastKey) {
            this.keys_batch = this.keys_batch.concat(keys);
            if (this.prediction_batch) {
                this.prediction_batch = tf.concat([this.prediction_batch, this.prediction], 0)
            } else {
                this.prediction_batch = this.prediction;
            }
            //let t0 = performance.now();
            const {indices, values} = this.prediction_batch.topk(3);
            //let t1 = performance.now()
            //console.log(`topk took: ${t1 - t0} milliseconds`)
            //t0 = performance.now();
            top3 = indices.arraySync();
            top3scores = values.arraySync();
            //t1 = performance.now()
            //console.log(`arraysync took: ${t1 - t0} milliseconds`)
            this.prediction_batch = null;
        } else {
            if (this.prediction_batch) {
                this.keys_batch = this.keys_batch.concat(keys);
                this.prediction_batch = tf.concat([this.prediction_batch, this.prediction], 0)
                this.prediction = null;
            } else {
                this.prediction_batch = this.prediction;
                this.keys_batch = keys;
                this.prediction = null;
            }
            return false
        }

        //t0 = performance.now();
        const batch = {};
        for (let j = 0; j < top3.length; j++) {
            batch[this.keys_batch[j]] = ({'index': top3[j], 'score': top3scores[j]});
        }
        this.keys_batch = [];
        // Try this method of adjusting results
        for (const [key, item] of Object.entries(batch)) {
            for (let i = 0; i < item.index.length; i++) {
                if (suppressed_IDs.includes(item.index[i])) {
                    item.score[i] = item.score[i] ** 3;
                } else if (enhanced_IDs.includes(item.index[i])) {
                    item.score[i] = Math.pow(item.score[i], 0.35);
                }
            }
            // Sort by value:
            // item.sort(function (a, b) {
            //     return ((a.score > b.score) ? -1 : ((a.score === b.score) ? 0 : 1));
            // });
            //let primary, secondary, tertiary] = top3;
            //let [score, score2, score3] = top3scores;
            let suppressed = false;
            // Use whitelist for top prediction only
            if (blocked_IDs.indexOf(item.index[0]) !== -1) {
                // Just warn if Ambient noise
                labels[item.index[0]].split('_')[1] === "Ambient Noise" ? suppressed = false : suppressed = 'text-danger'
                //this.labels[r[0].index].split('_')[1] === "Ambient Noise" ? suppressed = false : suppressed = 'text-danger'
                //make a copy of the top prediction
                const [temp_index, temp_score] = [item.index[0], item.score[0]]
                // Is the secondary prediction blocked too?
                if (blocked_IDs.indexOf(item.index[1]) !== -1) {
                    // How about if all top three are blocked
                    if (blocked_IDs.indexOf(item.index[2]) !== -1) {
                        // Squash the top prediction
                        item.score[0] = 0.0;
                        suppressed = false;
                    } else {
                        //make a copy of the second prediction too
                        const [temp_index2, temp_score2] = [item.index[1], item.score[1]]
                        // Bump up the third prediction
                        item.index[0] = item.index[2]
                        item.score[0] = item.score[2]
                        // Copy primary to secondary
                        item.index[1] = temp_index
                        item.score[1] = temp_score
                        // Copy secondary to tertiary
                        item.index[2] = temp_index2
                        item.score[2] = temp_score2
                    }
                } else {
                    //make a copy of the prediction
                    const [temp_index, temp_score] = [item.index[0], item.score[0]]
                    // Bump up the second prediction
                    item.index[0] = item.index[1]
                    item.score[0] = item.score[1]
                    // Copy primary to secondary
                    item.index[1] = temp_index
                    item.score[1] = temp_score
                }
            }
            result = ({
                start: key / this.config.sampleRate,
                end: (key / this.config.sampleRate) + CONFIG.specLength,
                timestamp: myModel._timestampFromSeconds(key / this.config.sampleRate, fileStart),
                position: myModel._timestampFromSeconds(key / this.config.sampleRate, 0),
                sname: this.labels[item.index[0]].split('_')[0],
                cname: this.labels[item.index[0]].split('_')[1],
                score: item.score[0],
                sname2: this.labels[item.index[1]].split('_')[0],
                cname2: this.labels[item.index[1]].split('_')[1],
                score2: item.score[1],
                sname3: this.labels[item.index[2]].split('_')[0],
                cname3: this.labels[item.index[2]].split('_')[1],
                score3: item.score[2],
                suppressed: suppressed
            });
            audacity = ({
                timestamp: (key / this.config.sampleRate) + '\t' + ((key / this.config.sampleRate) + this.config.specLength),
                cname: this.labels[item.index[0]].split('_')[1],
                score: item.score[0]
            })
            //prepare summary
            console.log(key / this.config.sampleRate, item.index[0], this.labels[item.index[0]], item.score[0]);
            batched_results.push([parseInt(key), result, audacity]);
        }
        this.result = batched_results;
        //t1 = performance.now()
        //console.log(`result prep took: ${t1 - t0} milliseconds`)
        return true
        //})
    }
}

module.exports = Model;

let myModel;
onmessage = async function (e) {
    //console.log('Worker: Message received from main script');
        await runPredictions(e)
}

async function runPredictions(e){
    const modelRequest = e.data.message || e.data[0];
    if (modelRequest === 'load') {
        const appPath = e.data[1];
        const useWhitelist = e.data[2];
        const batch = e.data[3];
        console.log('model received load instruction. Using whitelist:' + e.data[2])
        myModel = new Model(appPath, useWhitelist);
        await myModel.loadModel();
        myModel.warmUp(batch).then(function (value) {
            postMessage({
                message: 'model-ready',
                sampleRate: myModel.config.sampleRate,
                chunkLength: myModel.chunkLength,
                backend: tf.getBackend()
            });
        });

    } else if (modelRequest === 'predict') {
        let t0 = performance.now();
        let response = {};
        let chunks = {};
        let i = e.data.chunkStart;
        for (let j = 0; j < e.data.numberOfChunks; j++) {
            let key = 'chunk' + j;
            chunks[i] = e.data[key];
            i = i + myModel.chunkLength;
        }

        const fileStart = e.data.fileStart;
        const lastKey = e.data.lastKey;
        //const postTime = e.data.t0;
        //console.log(`sending message to model.js took: ${t0 - postTime} milliseconds`)
        const readyToSend = await myModel.predictChunk(chunks, fileStart, lastKey);
        if (readyToSend) {
            response['message'] = 'prediction';
            response['result'] = myModel.result;
            response['time'] = performance.now();
            response['end'] = lastKey;
            response['fileStart'] = fileStart;
            // add a chunk to the start
            response['start'] = i + myModel.chunkLength;
            postMessage(response);

            let t1 = performance.now();
            console.log(`receive to post took: ${t1 - t0} milliseconds`)
        }
    }
}
