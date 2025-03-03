if (typeof isDeliveryTimerjs__running === 'undefined') {

  var template = __st.p;
  var str = __st.pageurl;
  var rest = str.substring(0, str.lastIndexOf("/") + 1);
  var template_cart = str.substring(str.lastIndexOf("/") + 1, str.length);
  var shop_name = Shopify.shop;
  var valid = true;
  var current_product = {available: true};
  var current_country_code='', current_country_name='', c_code='';
  var dataCountry = {};
  var dlt_variant_id;
  let is_show_country = false;
  let countries_list_data =
    '{"AF":"Afghanistan","AX":"Åland Islands","AL":"Albania","DZ":"Algeria","AD":"Andorra","AO":"Angola","AI":"Anguilla","AG":"Antigua & Barbuda","AR":"Argentina","AM":"Armenia","AW":"Aruba","AU":"Australia","AT":"Austria","AZ":"Azerbaijan","BS":"Bahamas","BH":"Bahrain","BD":"Bangladesh","BB":"Barbados","BY":"Belarus","BE":"Belgium","BZ":"Belize","BJ":"Benin","BM":"Bermuda","BT":"Bhutan","BO":"Bolivia","BA":"Bosnia & Herzegovina","BW":"Botswana","BV":"Bouvet Island","BR":"Brazil","IO":"British Indian Ocean Territory","VG":"British Virgin Islands","BN":"Brunei","BG":"Bulgaria","BF":"Burkina Faso","BI":"Burundi","KH":"Cambodia","CM":"Cameroon","CA":"Canada","CV":"Cape Verde","BQ":"Caribbean Netherlands","KY":"Cayman Islands","CF":"Central African Republic","TD":"Chad","CL":"Chile","CN":"China","CX":"Christmas Island","CC":"Cocos (Keeling) Islands","CO":"Colombia","KM":"Comoros","CG":"Congo - Brazzaville","CD":"Congo - Kinshasa","CK":"Cook Islands","CR":"Costa Rica","HR":"Croatia","CU":"Cuba","CW":"Curaçao","CY":"Cyprus","CZ":"Czechia","CI":"Côte d’Ivoire","DK":"Denmark","DJ":"Djibouti","DM":"Dominica","DO":"Dominican Republic","EC":"Ecuador","EG":"Egypt","SV":"El Salvador","GQ":"Equatorial Guinea","ER":"Eritrea","EE":"Estonia","SZ":"Eswatini","ET":"Ethiopia","FK":"Falkland Islands","FO":"Faroe Islands","FJ":"Fiji","FI":"Finland","FR":"France","GF":"French Guiana","PF":"French Polynesia","TF":"French Southern Territories","GA":"Gabon","GM":"Gambia","GE":"Georgia","DE":"Germany","GH":"Ghana","GI":"Gibraltar","GR":"Greece","GL":"Greenland","GD":"Grenada","GP":"Guadeloupe","GT":"Guatemala","GG":"Guernsey","GN":"Guinea","GW":"Guinea-Bissau","GY":"Guyana","HT":"Haiti","HM":"Heard & McDonald Islands","HN":"Honduras","HK":"Hong Kong SAR","HU":"Hungary","IS":"Iceland","IN":"India","ID":"Indonesia","IR":"Iran","IQ":"Iraq","IE":"Ireland","IM":"Isle of Man","IL":"Israel","IT":"Italy","JM":"Jamaica","JP":"Japan","JE":"Jersey","JO":"Jordan","KZ":"Kazakhstan","KE":"Kenya","KI":"Kiribati","XK":"Kosovo","KW":"Kuwait","KG":"Kyrgyzstan","LA":"Laos","LV":"Latvia","LB":"Lebanon","LS":"Lesotho","LR":"Liberia","LY":"Libya","LI":"Liechtenstein","LT":"Lithuania","LU":"Luxembourg","MO":"Macao SAR","MG":"Madagascar","MW":"Malawi","MY":"Malaysia","MV":"Maldives","ML":"Mali","MT":"Malta","MQ":"Martinique","MR":"Mauritania","MU":"Mauritius","YT":"Mayotte","MX":"Mexico","MD":"Moldova","MC":"Monaco","MN":"Mongolia","ME":"Montenegro","MS":"Montserrat","MA":"Morocco","MZ":"Mozambique","MM":"Myanmar (Burma)","NA":"Namibia","NR":"Nauru","NP":"Nepal","NL":"Netherlands","AN":"Netherlands Antilles","NC":"New Caledonia","NZ":"New Zealand","NI":"Nicaragua","NE":"Niger","NG":"Nigeria","NU":"Niue","NF":"Norfolk Island","KP":"North Korea","MK":"North Macedonia","NO":"Norway","OM":"Oman","PK":"Pakistan","PS":"Palestinian Territories","PA":"Panama","PG":"Papua New Guinea","PY":"Paraguay","PE":"Peru","PH":"Philippines","PN":"Pitcairn Islands","PL":"Poland","PT":"Portugal","QA":"Qatar","RE":"Réunion","RO":"Romania","RU":"Russia","RW":"Rwanda","WS":"Samoa","SM":"San Marino","ST":"São Tomé & Príncipe","SA":"Saudi Arabia","SN":"Senegal","RS":"Serbia","SC":"Seychelles","SL":"Sierra Leone","SG":"Singapore","SX":"Sint Maarten","SK":"Slovakia","SI":"Slovenia","SB":"Solomon Islands","SO":"Somalia","ZA":"South Africa","GS":"South Georgia & South Sandwich Islands","KR":"South Korea","SS":"South Sudan","ES":"Spain","LK":"Sri Lanka","BL":"St. Barthélemy","SH":"St. Helena","KN":"St. Kitts & Nevis","LC":"St. Lucia","MF":"St. Martin","PM":"St. Pierre & Miquelon","VC":"St. Vincent & Grenadines","SD":"Sudan","SR":"Suriname","SJ":"Svalbard & Jan Mayen","SE":"Sweden","CH":"Switzerland","SY":"Syria","TW":"Taiwan","TJ":"Tajikistan","TZ":"Tanzania","TH":"Thailand","TL":"Timor-Leste","TG":"Togo","TK":"Tokelau","TO":"Tonga","TT":"Trinidad & Tobago","TN":"Tunisia","TR":"Turkey","TM":"Turkmenistan","TC":"Turks & Caicos Islands","TV":"Tuvalu","UM":"U.S. Outlying Islands","UG":"Uganda","UA":"Ukraine","AE":"United Arab Emirates","GB":"United Kingdom","US":"United States","UY":"Uruguay","UZ":"Uzbekistan","VU":"Vanuatu","VA":"Vatican City","VE":"Venezuela","VN":"Vietnam","WF":"Wallis & Futuna","EH":"Western Sahara","YE":"Yemen","ZM":"Zambia","ZW":"Zimbabwe"}';
  let popup_countries_array = JSON.parse(countries_list_data);
  let regions_list_data =
    '{"ar":{"B":"Buenos Aires Province","K":"Catamarca","H":"Chaco","U":"Chubut","C":"Buenos Aires (Autonomous City)","X":"Córdoba","W":"Corrientes","E":"Entre Ríos","P":"Formosa","Y":"Jujuy","L":"La Pampa","F":"La Rioja","M":"Mendoza","N":"Misiones","Q":"Neuquén","R":"Río Negro","A":"Salta","J":"San Juan","D":"San Luis","Z":"Santa Cruz","S":"Santa Fe","G":"Santiago del Estero","V":"Tierra del Fuego","T":"Tucumán"},"au":{"ACT":"Australian Capital Territory","NSW":"New South Wales","NT":"Northern Territory","QLD":"Queensland","SA":"South Australia","TAS":"Tasmania","VIC":"Victoria","WA":"Western Australia"},"br":{"AC":"Acre","AL":"Alagoas","AP":"Amapá","AM":"Amazonas","BA":"Bahia","CE":"Ceará","DF":"Federal District","ES":"Espírito Santo","GO":"Goiás","MA":"Maranhão","MT":"Mato Grosso","MS":"Mato Grosso do Sul","MG":"Minas Gerais","PA":"Pará","PB":"Paraíba","PR":"Paraná","PE":"Pernambuco","PI":"Piauí","RN":"Rio Grande do Norte","RS":"Rio Grande do Sul","RJ":"Rio de Janeiro","RO":"Rondônia","RR":"Roraima","SC":"Santa Catarina","SP":"São Paulo","SE":"Sergipe","TO":"Tocantins"},"ca":{"AB":"Alberta","BC":"British Columbia","MB":"Manitoba","NB":"New Brunswick","NL":"Newfoundland and Labrador","NT":"Northwest Territories","NS":"Nova Scotia","NU":"Nunavut","ON":"Ontario","PE":"Prince Edward Island","QC":"Quebec","SK":"Saskatchewan","YT":"Yukon"},"cl":{"AP":"Arica y Parinacota","TA":"Tarapacá","AN":"Antofagasta","AT":"Atacama","CO":"Coquimbo","VS":"Valparaíso","RM":"Santiago Metropolitan","LI":"Libertador General Bernardo O’Higgins","ML":"Maule","NB":"Ñuble","BI":"Bío Bío","AR":"Araucanía","LR":"Los Ríos","LL":"Los Lagos","AI":"Aysén","MA":"Magallanes Region"},"cn":{"AH":"Anhui","BJ":"Beijing","CQ":"Chongqing","FJ":"Fujian","GS":"Gansu","GD":"Guangdong","GX":"Guangxi","GZ":"Guizhou","HI":"Hainan","HE":"Hebei","HL":"Heilongjiang","HA":"Henan","HB":"Hubei","HN":"Hunan","NM":"Inner Mongolia","JS":"Jiangsu","JX":"Jiangxi","JL":"Jilin","LN":"Liaoning","NX":"Ningxia","QH":"Qinghai","SN":"Shaanxi","SD":"Shandong","SH":"Shanghai","SX":"Shanxi","SC":"Sichuan","TJ":"Tianjin","XJ":"Xinjiang","YZ":"Tibet","YN":"Yunnan","ZJ":"Zhejiang"},"co":{"DC":"Capital District","AMA":"Amazonas","ANT":"Antioquia","ARA":"Arauca","ATL":"Atlántico","BOL":"Bolívar","BOY":"Boyacá","CAL":"Caldas","CAQ":"Caquetá","CAS":"Casanare","CAU":"Cauca","CES":"Cesar","CHO":"Chocó","COR":"Córdoba","CUN":"Cundinamarca","GUA":"Guainía","GUV":"Guaviare","HUI":"Huila","LAG":"La Guajira","MAG":"Magdalena","MET":"Meta","NAR":"Nariño","NSA":"Norte de Santander","PUT":"Putumayo","QUI":"Quindío","RIS":"Risaralda","SAP":"San Andrés & Providencia","SAN":"Santander","SUC":"Sucre","TOL":"Tolima","VAC":"Valle del Cauca","VAU":"Vaupés","VID":"Vichada"},"eg":{"SU":"6th of October","SHR":"Al Sharqia","ALX":"Alexandria","ASN":"Aswan","AST":"Asyut","BH":"Beheira","BNS":"Beni Suef","C":"Cairo","DK":"Dakahlia","DT":"Damietta","FYM":"Faiyum","GH":"Gharbia","GZ":"Giza","HU":"Helwan","IS":"Ismailia","KFS":"Kafr el-Sheikh","LX":"Luxor","MT":"Matrouh","MN":"Minya","MNF":"Monufia","WAD":"New Valley","SIN":"North Sinai","PTS":"Port Said","KB":"Qalyubia","KN":"Qena","BA":"Red Sea","SHG":"Sohag","JS":"South Sinai","SUZ":"Suez"},"gt":{"AVE":"Alta Verapaz","BVE":"Baja Verapaz","CMT":"Chimaltenango","CQM":"Chiquimula","EPR":"El Progreso","ESC":"Escuintla","GUA":"Guatemala","HUE":"Huehuetenango","IZA":"Izabal","JAL":"Jalapa","JUT":"Jutiapa","PET":"Petén","QUE":"Quetzaltenango","QUI":"Quiché","RET":"Retalhuleu","SAC":"Sacatepéquez","SMA":"San Marcos","SRO":"Santa Rosa","SOL":"Sololá","SUC":"Suchitepéquez","TOT":"Totonicapán","ZAC":"Zacapa"},"hk":{"HK":"Hong Kong Island","KL":"Kowloon","NT":"New Territories"},"in":{"AN":"Andaman and Nicobar Islands","AP":"Andhra Pradesh","AR":"Arunachal Pradesh","AS":"Assam","BR":"Bihar","CH":"Chandigarh","CG":"Chhattisgarh","DN":"Dadra and Nagar Haveli","DD":"Daman and Diu","DL":"Delhi","GA":"Goa","GJ":"Gujarat","HR":"Haryana","HP":"Himachal Pradesh","JK":"Jammu and Kashmir","JH":"Jharkhand","KA":"Karnataka","KL":"Kerala","LA":"Ladakh","LD":"Lakshadweep","MP":"Madhya Pradesh","MH":"Maharashtra","MN":"Manipur","ML":"Meghalaya","MZ":"Mizoram","NL":"Nagaland","OR":"Odisha","PY":"Puducherry","PB":"Punjab","RJ":"Rajasthan","SK":"Sikkim","TN":"Tamil Nadu","TS":"Telangana","TR":"Tripura","UP":"Uttar Pradesh","UK":"Uttarakhand","WB":"West Bengal"},"id":{"AC":"Aceh","BA":"Bali","BB":"Bangka–Belitung Islands","BT":"Banten","BE":"Bengkulu","GO":"Gorontalo","JK":"Jakarta","JA":"Jambi","JB":"West Java","JT":"Central Java","JI":"East Java","KB":"West Kalimantan","KS":"South Kalimantan","KT":"Central Kalimantan","KI":"East Kalimantan","KU":"North Kalimantan","KR":"Riau Islands","LA":"Lampung","MA":"Maluku","MU":"North Maluku","SU":"North Sumatra","NB":"West Nusa Tenggara","NT":"East Nusa Tenggara","PA":"Papua","PB":"West Papua","RI":"Riau","SS":"South Sumatra","SR":"West Sulawesi","SN":"South Sulawesi","ST":"Central Sulawesi","SG":"Southeast Sulawesi","SA":"North Sulawesi","SB":"West Sumatra","YO":"Yogyakarta"},"ie":{"CW":"Carlow","CN":"Cavan","CE":"Clare","CO":"Cork","DL":"Donegal","D":"Dublin","G":"Galway","KY":"Kerry","KE":"Kildare","KK":"Kilkenny","LS":"Laois","LM":"Leitrim","LK":"Limerick","LD":"Longford","LH":"Louth","MO":"Mayo","MH":"Meath","MN":"Monaghan","OY":"Offaly","RN":"Roscommon","SO":"Sligo","TA":"Tipperary","WD":"Waterford","WH":"Westmeath","WX":"Wexford","WW":"Wicklow"},"it":{"AG":"Agrigento","AL":"Alessandria","AN":"Ancona","AO":"Aosta","AR":"Arezzo","AP":"Ascoli Piceno","AT":"Asti","AV":"Avellino","BA":"Bari","BT":"Barletta-Andria-Trani","BL":"Belluno","BN":"Benevento","BG":"Bergamo","BI":"Biella","BO":"Bologna","BZ":"South Tyrol","BS":"Brescia","BR":"Brindisi","CA":"Cagliari","CL":"Caltanissetta","CB":"Campobasso","CI":"Carbonia-Iglesias","CE":"Caserta","CT":"Catania","CZ":"Catanzaro","CH":"Chieti","CO":"Como","CS":"Cosenza","CR":"Cremona","KR":"Crotone","CN":"Cuneo","EN":"Enna","FM":"Fermo","FE":"Ferrara","FI":"Florence","FG":"Foggia","FC":"Forlì-Cesena","FR":"Frosinone","GE":"Genoa","GO":"Gorizia","GR":"Grosseto","IM":"Imperia","IS":"Isernia","AQ":"L’Aquila","SP":"La Spezia","LT":"Latina","LE":"Lecce","LC":"Lecco","LI":"Livorno","LO":"Lodi","LU":"Lucca","MC":"Macerata","MN":"Mantua","MS":"Massa and Carrara","MT":"Matera","VS":"Medio Campidano","ME":"Messina","MI":"Milan","MO":"Modena","MB":"Monza and Brianza","NA":"Naples","NO":"Novara","NU":"Nuoro","OG":"Ogliastra","OT":"Olbia-Tempio","OR":"Oristano","PD":"Padua","PA":"Palermo","PR":"Parma","PV":"Pavia","PG":"Perugia","PU":"Pesaro and Urbino","PE":"Pescara","PC":"Piacenza","PI":"Pisa","PT":"Pistoia","PN":"Pordenone","PZ":"Potenza","PO":"Prato","RG":"Ragusa","RA":"Ravenna","RC":"Reggio Calabria","RE":"Reggio Emilia","RI":"Rieti","RN":"Rimini","RM":"Rome","RO":"Rovigo","SA":"Salerno","SS":"Sassari","SV":"Savona","SI":"Siena","SR":"Syracuse","SO":"Sondrio","TA":"Taranto","TE":"Teramo","TR":"Terni","TO":"Turin","TP":"Trapani","TN":"Trentino","TV":"Treviso","TS":"Trieste","UD":"Udine","VA":"Varese","VE":"Venice","VB":"Verbano-Cusio-Ossola","VC":"Vercelli","VR":"Verona","VV":"Vibo Valentia","VI":"Vicenza","VT":"Viterbo"},"jp":{"JP-01":"Hokkaido","JP-02":"Aomori","JP-03":"Iwate","JP-04":"Miyagi","JP-05":"Akita","JP-06":"Yamagata","JP-07":"Fukushima","JP-08":"Ibaraki","JP-09":"Tochigi","JP-10":"Gunma","JP-11":"Saitama","JP-12":"Chiba","JP-13":"Tokyo","JP-14":"Kanagawa","JP-15":"Niigata","JP-16":"Toyama","JP-17":"Ishikawa","JP-18":"Fukui","JP-19":"Yamanashi","JP-20":"Nagano","JP-21":"Gifu","JP-22":"Shizuoka","JP-23":"Aichi","JP-24":"Mie","JP-25":"Shiga","JP-26":"Kyoto","JP-27":"Osaka","JP-28":"Hyogo","JP-29":"Nara","JP-30":"Wakayama","JP-31":"Tottori","JP-32":"Shimane","JP-33":"Okayama","JP-34":"Hiroshima","JP-35":"Yamaguchi","JP-36":"Tokushima","JP-37":"Kagawa","JP-38":"Ehime","JP-39":"Kochi","JP-40":"Fukuoka","JP-41":"Saga","JP-42":"Nagasaki","JP-43":"Kumamoto","JP-44":"Oita","JP-45":"Miyazaki","JP-46":"Kagoshima","JP-47":"Okinawa"},"my":{"JHR":"Johor","KDH":"Kedah","KTN":"Kelantan","KUL":"Kuala Lumpur","LBN":"Labuan","MLK":"Malacca","NSN":"Negeri Sembilan","PHG":"Pahang","PNG":"Penang","PRK":"Perak","PLS":"Perlis","PJY":"Putrajaya","SBH":"Sabah","SWK":"Sarawak","SGR":"Selangor","TRG":"Terengganu"},"mx":{"AGS":"Aguascalientes","BC":"Baja California","BCS":"Baja California Sur","CAMP":"Campeche","CHIS":"Chiapas","CHIH":"Chihuahua","DF":"Ciudad de Mexico","COAH":"Coahuila","COL":"Colima","DGO":"Durango","GTO":"Guanajuato","GRO":"Guerrero","HGO":"Hidalgo","JAL":"Jalisco","MEX":"Mexico State","MICH":"Michoacán","MOR":"Morelos","NAY":"Nayarit","NL":"Nuevo León","OAX":"Oaxaca","PUE":"Puebla","QRO":"Querétaro","Q ROO":"Quintana Roo","SLP":"San Luis Potosí","SIN":"Sinaloa","SON":"Sonora","TAB":"Tabasco","TAMPS":"Tamaulipas","TLAX":"Tlaxcala","VER":"Veracruz","YUC":"Yucatán","ZAC":"Zacatecas"},"nz":{"AUK":"Auckland","BOP":"Bay of Plenty","CAN":"Canterbury","GIS":"Gisborne","HKB":"Hawke’s Bay","MWT":"Manawatu-Wanganui","MBH":"Marlborough","NSN":"Nelson","NTL":"Northland","OTA":"Otago","STL":"Southland","TKI":"Taranaki","TAS":"Tasman","WKO":"Waikato","WGN":"Wellington","WTC":"West Coast"},"ng":{"AB":"Abia","FC":"Federal Capital Territory","AD":"Adamawa","AK":"Akwa Ibom","AN":"Anambra","BA":"Bauchi","BY":"Bayelsa","BE":"Benue","BO":"Borno","CR":"Cross River","DE":"Delta","EB":"Ebonyi","ED":"Edo","EK":"Ekiti","EN":"Enugu","GO":"Gombe","IM":"Imo","JI":"Jigawa","KD":"Kaduna","KN":"Kano","KT":"Katsina","KE":"Kebbi","KO":"Kogi","KW":"Kwara","LA":"Lagos","NA":"Nasarawa","NI":"Niger","OG":"Ogun","ON":"Ondo","OS":"Osun","OY":"Oyo","PL":"Plateau","RI":"Rivers","SO":"Sokoto","TA":"Taraba","YO":"Yobe","ZA":"Zamfara"},"pa":{"PA-1":"Bocas del Toro","PA-4":"Chiriquí","PA-2":"Coclé","PA-3":"Colón","PA-5":"Darién","PA-EM":"Emberá","PA-6":"Herrera","PA-KY":"Guna Yala","PA-7":"Los Santos","PA-NB":"Ngöbe-Buglé","PA-8":"Panamá","PA-10":"West Panamá","PA-9":"Veraguas"},"pe":{"PE-AMA":"Amazonas","PE-ANC":"Ancash","PE-APU":"Apurímac","PE-ARE":"Arequipa","PE-AYA":"Ayacucho","PE-CAJ":"Cajamarca","PE-CAL":"El Callao","PE-CUS":"Cusco","PE-HUV":"Huancavelica","PE-HUC":"Huánuco","PE-ICA":"Ica","PE-JUN":"Junín","PE-LAL":"La Libertad","PE-LAM":"Lambayeque","PE-LIM":"Lima Region","PE-LMA":"Lima","PE-LOR":"Loreto","PE-MDD":"Madre de Dios","PE-MOQ":"Moquegua","PE-PAS":"Pasco","PE-PIU":"Piura","PE-PUN":"Puno","PE-SAM":"San Martín","PE-TAC":"Tacna","PE-TUM":"Tumbes","PE-UCA":"Ucayali"},"ph":{"PH-ABR":"Abra","PH-AGN":"Agusan del Norte","PH-AGS":"Agusan del Sur","PH-AKL":"Aklan","PH-ALB":"Albay","PH-ANT":"Antique","PH-APA":"Apayao","PH-AUR":"Aurora","PH-BAS":"Basilan","PH-BAN":"Bataan","PH-BTN":"Batanes","PH-BTG":"Batangas","PH-BEN":"Benguet","PH-BIL":"Biliran","PH-BOH":"Bohol","PH-BUK":"Bukidnon","PH-BUL":"Bulacan","PH-CAG":"Cagayan","PH-CAN":"Camarines Norte","PH-CAS":"Camarines Sur","PH-CAM":"Camiguin","PH-CAP":"Capiz","PH-CAT":"Catanduanes","PH-CAV":"Cavite","PH-CEB":"Cebu","PH-NCO":"Cotabato","PH-DVO":"Davao Occidental","PH-DAO":"Davao Oriental","PH-COM":"Compostela Valley","PH-DAV":"Davao del Norte","PH-DAS":"Davao del Sur","PH-DIN":"Dinagat Islands","PH-EAS":"Eastern Samar","PH-GUI":"Guimaras","PH-IFU":"Ifugao","PH-ILN":"Ilocos Norte","PH-ILS":"Ilocos Sur","PH-ILI":"Iloilo","PH-ISA":"Isabela","PH-KAL":"Kalinga","PH-LUN":"La Union","PH-LAG":"Laguna","PH-LAN":"Lanao del Norte","PH-LAS":"Lanao del Sur","PH-LEY":"Leyte","PH-MAG":"Maguindanao","PH-MAD":"Marinduque","PH-MAS":"Masbate","PH-00":"Metro Manila","PH-MSC":"Misamis Occidental","PH-MSR":"Misamis Oriental","PH-MOU":"Mountain","PH-NEC":"Negros Occidental","PH-NER":"Negros Oriental","PH-NSA":"Northern Samar","PH-NUE":"Nueva Ecija","PH-NUV":"Nueva Vizcaya","PH-MDC":"Occidental Mindoro","PH-MDR":"Oriental Mindoro","PH-PLW":"Palawan","PH-PAM":"Pampanga","PH-PAN":"Pangasinan","PH-QUE":"Quezon","PH-QUI":"Quirino","PH-RIZ":"Rizal","PH-ROM":"Romblon","PH-WSA":"Samar","PH-SAR":"Sarangani","PH-SIG":"Siquijor","PH-SOR":"Sorsogon","PH-SCO":"South Cotabato","PH-SLE":"Southern Leyte","PH-SUK":"Sultan Kudarat","PH-SLU":"Sulu","PH-SUN":"Surigao del Norte","PH-SUR":"Surigao del Sur","PH-TAR":"Tarlac","PH-TAW":"Tawi-Tawi","PH-ZMB":"Zambales","PH-ZSI":"Zamboanga Sibugay","PH-ZAN":"Zamboanga del Norte","PH-ZAS":"Zamboanga del Sur"},"pt":{"PT-20":"Azores","PT-01":"Aveiro","PT-02":"Beja","PT-03":"Braga","PT-04":"Bragança","PT-05":"Castelo Branco","PT-06":"Coimbra","PT-07":"Évora","PT-08":"Faro","PT-09":"Guarda","PT-10":"Leiria","PT-11":"Lisbon","PT-30":"Madeira","PT-12":"Portalegre","PT-13":"Porto","PT-14":"Santarém","PT-15":"Setúbal","PT-16":"Viana do Castelo","PT-17":"Vila Real","PT-18":"Viseu"},"ro":{"AB":"Alba","AR":"Arad","AG":"Argeș","BC":"Bacău","BH":"Bihor","BN":"Bistriţa-Năsăud","BT":"Botoşani","BR":"Brăila","BV":"Braşov","B":"Bucharest","BZ":"Buzău","CS":"Caraș-Severin","CJ":"Cluj","CT":"Constanța","CV":"Covasna","CL":"Călărași","DJ":"Dolj","DB":"Dâmbovița","GL":"Galați","GR":"Giurgiu","GJ":"Gorj","HR":"Harghita","HD":"Hunedoara","IL":"Ialomița","IS":"Iași","IF":"Ilfov","MM":"Maramureş","MH":"Mehedinți","MS":"Mureş","NT":"Neamţ","OT":"Olt","PH":"Prahova","SJ":"Sălaj","SM":"Satu Mare","SB":"Sibiu","SV":"Suceava","TR":"Teleorman","TM":"Timiș","TL":"Tulcea","VL":"Vâlcea","VS":"Vaslui","VN":"Vrancea"},"ru":{"ALT":"Altai Krai","AL":"Altai","AMU":"Amur","ARK":"Arkhangelsk","AST":"Astrakhan","BEL":"Belgorod","BRY":"Bryansk","CE":"Chechen","CHE":"Chelyabinsk","CHU":"Chukotka Okrug","CU":"Chuvash","IRK":"Irkutsk","IVA":"Ivanovo","YEV":"Jewish","KB":"Kabardino-Balkar","KGD":"Kaliningrad","KLU":"Kaluga","KAM":"Kamchatka Krai","KC":"Karachay-Cherkess","KEM":"Kemerovo","KHA":"Khabarovsk Krai","KHM":"Khanty-Mansi","KIR":"Kirov","KO":"Komi","KOS":"Kostroma","KDA":"Krasnodar Krai","KYA":"Krasnoyarsk Krai","KGN":"Kurgan","KRS":"Kursk","LEN":"Leningrad","LIP":"Lipetsk","MAG":"Magadan","ME":"Mari El","MOW":"Moscow","MOS":"Moscow Province","MUR":"Murmansk","NIZ":"Nizhny Novgorod","NGR":"Novgorod","NVS":"Novosibirsk","OMS":"Omsk","ORE":"Orenburg","ORL":"Oryol","PNZ":"Penza","PER":"Perm Krai","PRI":"Primorsky Krai","PSK":"Pskov","AD":"Adygea","BA":"Bashkortostan","BU":"Buryat","DA":"Dagestan","IN":"Ingushetia","KL":"Kalmykia","KR":"Karelia","KK":"Khakassia","MO":"Mordovia","SE":"North Ossetia-Alania","TA":"Tatarstan","ROS":"Rostov","RYA":"Ryazan","SPE":"Saint Petersburg","SA":"Sakha","SAK":"Sakhalin","SAM":"Samara","SAR":"Saratov","SMO":"Smolensk","STA":"Stavropol Krai","SVE":"Sverdlovsk","TAM":"Tambov","TOM":"Tomsk","TUL":"Tula","TVE":"Tver","TYU":"Tyumen","TY":"Tuva","UD":"Udmurt","ULY":"Ulyanovsk","VLA":"Vladimir","VGG":"Volgograd","VLG":"Vologda","VOR":"Voronezh","YAN":"Yamalo-Nenets Okrug","YAR":"Yaroslavl","ZAB":"Zabaykalsky Krai"},"za":{"EC":"Eastern Cape","FS":"Free State","GT":"Gauteng","NL":"KwaZulu-Natal","LP":"Limpopo","MP":"Mpumalanga","NW":"North West","NC":"Northern Cape","WC":"Western Cape"},"kr":{"KR-26":"Busan","KR-43":"North Chungcheong","KR-44":"South Chungcheong","KR-27":"Daegu","KR-30":"Daejeon","KR-42":"Gangwon","KR-29":"Gwangju City","KR-47":"North Gyeongsang","KR-41":"Gyeonggi","KR-48":"South Gyeongsang","KR-28":"Incheon","KR-49":"Jeju","KR-45":"North Jeolla","KR-46":"South Jeolla","KR-50":"Sejong","KR-11":"Seoul","KR-31":"Ulsan"},"es":{"C":"A Coruña","VI":"Álava","AB":"Albacete","A":"Alicante","AL":"Almería","O":"Asturias Province","AV":"Ávila","BA":"Badajoz","PM":"Balears Province","B":"Barcelona","BU":"Burgos","CC":"Cáceres","CA":"Cádiz","S":"Cantabria Province","CS":"Castellón","CE":"Ceuta","CR":"Ciudad Real","CO":"Córdoba","CU":"Cuenca","GI":"Girona","GR":"Granada","GU":"Guadalajara","SS":"Gipuzkoa","H":"Huelva","HU":"Huesca","J":"Jaén","LO":"La Rioja Province","GC":"Las Palmas","LE":"León","L":"Lleida","LU":"Lugo","M":"Madrid Province","MA":"Málaga","ML":"Melilla","MU":"Murcia","NA":"Navarra","OR":"Ourense","P":"Palencia","PO":"Pontevedra","SA":"Salamanca","TF":"Santa Cruz de Tenerife","SG":"Segovia","SE":"Seville","SO":"Soria","T":"Tarragona","TE":"Teruel","TO":"Toledo","V":"Valencia","VA":"Valladolid","BI":"Biscay","ZA":"Zamora","Z":"Zaragoza"},"th":{"TH-37":"Amnat Charoen","TH-15":"Ang Thong","TH-10":"Bangkok","TH-38":"Bueng Kan","TH-31":"Buri Ram","TH-24":"Chachoengsao","TH-18":"Chai Nat","TH-36":"Chaiyaphum","TH-22":"Chanthaburi","TH-50":"Chiang Mai","TH-57":"Chiang Rai","TH-20":"Chon Buri","TH-86":"Chumphon","TH-46":"Kalasin","TH-62":"Kamphaeng Phet","TH-71":"Kanchanaburi","TH-40":"Khon Kaen","TH-81":"Krabi","TH-52":"Lampang","TH-51":"Lamphun","TH-42":"Loei","TH-16":"Lopburi","TH-58":"Mae Hong Son","TH-44":"Maha Sarakham","TH-49":"Mukdahan","TH-26":"Nakhon Nayok","TH-73":"Nakhon Pathom","TH-48":"Nakhon Phanom","TH-30":"Nakhon Ratchasima","TH-60":"Nakhon Sawan","TH-80":"Nakhon Si Thammarat","TH-55":"Nan","TH-96":"Narathiwat","TH-39":"Nong Bua Lam Phu","TH-43":"Nong Khai","TH-12":"Nonthaburi","TH-13":"Pathum Thani","TH-94":"Pattani","TH-S":"Pattaya","TH-82":"Phang Nga","TH-93":"Phatthalung","TH-56":"Phayao","TH-67":"Phetchabun","TH-76":"Phetchaburi","TH-66":"Phichit","TH-65":"Phitsanulok","TH-14":"Phra Nakhon Si Ayutthaya","TH-54":"Phrae","TH-83":"Phuket","TH-25":"Prachin Buri","TH-77":"Prachuap Khiri Khan","TH-85":"Ranong","TH-70":"Ratchaburi","TH-21":"Rayong","TH-45":"Roi Et","TH-27":"Sa Kaeo","TH-47":"Sakon Nakhon","TH-11":"Samut Prakan","TH-74":"Samut Sakhon","TH-75":"Samut Songkhram","TH-19":"Saraburi","TH-91":"Satun","TH-17":"Sing Buri","TH-33":"Si Sa Ket","TH-90":"Songkhla","TH-64":"Sukhothai","TH-72":"Suphanburi","TH-84":"Surat Thani","TH-32":"Surin","TH-63":"Tak","TH-92":"Trang","TH-23":"Trat","TH-34":"Ubon Ratchathani","TH-41":"Udon Thani","TH-61":"Uthai Thani","TH-53":"Uttaradit","TH-95":"Yala","TH-35":"Yasothon"},"ae":{"AZ":"Abu Dhabi","AJ":"Ajman","DU":"Dubai","FU":"Fujairah","RK":"Ras al-Khaimah","SH":"Sharjah","UQ":"Umm al-Quwain"},"us":{"AL":"Alabama","AK":"Alaska","AS":"American Samoa","AZ":"Arizona","AR":"Arkansas","CA":"California","CO":"Colorado","CT":"Connecticut","DE":"Delaware","DC":"Washington DC","FM":"Micronesia","FL":"Florida","GA":"Georgia","GU":"Guam","HI":"Hawaii","ID":"Idaho","IL":"Illinois","IN":"Indiana","IA":"Iowa","KS":"Kansas","KY":"Kentucky","LA":"Louisiana","ME":"Maine","MH":"Marshall Islands","MD":"Maryland","MA":"Massachusetts","MI":"Michigan","MN":"Minnesota","MS":"Mississippi","MO":"Missouri","MT":"Montana","NE":"Nebraska","NV":"Nevada","NH":"New Hampshire","NJ":"New Jersey","NM":"New Mexico","NY":"New York","NC":"North Carolina","ND":"North Dakota","MP":"Northern Mariana Islands","OH":"Ohio","OK":"Oklahoma","OR":"Oregon","PW":"Palau","PA":"Pennsylvania","PR":"Puerto Rico","RI":"Rhode Island","SC":"South Carolina","SD":"South Dakota","TN":"Tennessee","TX":"Texas","UT":"Utah","VT":"Vermont","VI":"U.S. Virgin Islands","VA":"Virginia","WA":"Washington","WV":"West Virginia","WI":"Wisconsin","WY":"Wyoming","AA":"Armed Forces Americas","AE":"Armed Forces Europe","AP":"Armed Forces Pacific"}}';
  let popup_regions_array = JSON.parse(regions_list_data);
  setTimeout(console.log.bind(console, 'Reducing friction to checkout with Delivery Timer - Visit %c%s for more info.', '', 'https://www.launchtip.com/delivery-timer'));

  if (template == "product" || template_cart == "cart" || true){


  (function defineMustache(global,factory){if(typeof exports==="object"&&exports&&typeof exports.nodeName!=="string"){factory(exports)}else if(typeof define==="function"&&define.amd){define(["exports"],factory)}else{global.Mustache={};factory(global.Mustache)}})(this,function mustacheFactory(mustache){var objectToString=Object.prototype.toString;var isArray=Array.isArray||function isArrayPolyfill(object){return objectToString.call(object)==="[object Array]"};function isFunction(object){return typeof object==="function"}function typeStr(obj){return isArray(obj)?"array":typeof obj}function escapeRegExp(string){return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&")}function hasProperty(obj,propName){return obj!=null&&typeof obj==="object"&&propName in obj}var regExpTest=RegExp.prototype.test;function testRegExp(re,string){return regExpTest.call(re,string)}var nonSpaceRe=/\S/;function isWhitespace(string){return!testRegExp(nonSpaceRe,string)}var entityMap={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;","`":"&#x60;","=":"&#x3D;"};function escapeHtml(string){return String(string).replace(/[&<>"'`=\/]/g,function fromEntityMap(s){return entityMap[s]})}var whiteRe=/\s*/;var spaceRe=/\s+/;var equalsRe=/\s*=/;var curlyRe=/\s*\}/;var tagRe=/#|\^|\/|>|\{|&|=|!/;function parseTemplate(template,tags){if(!template)return[];var sections=[];var tokens=[];var spaces=[];var hasTag=false;var nonSpace=false;function stripSpace(){if(hasTag&&!nonSpace){while(spaces.length)delete tokens[spaces.pop()]}else{spaces=[]}hasTag=false;nonSpace=false}var openingTagRe,closingTagRe,closingCurlyRe;function compileTags(tagsToCompile){if(typeof tagsToCompile==="string")tagsToCompile=tagsToCompile.split(spaceRe,2);if(!isArray(tagsToCompile)||tagsToCompile.length!==2)throw new Error("Invalid tags: "+tagsToCompile);openingTagRe=new RegExp(escapeRegExp(tagsToCompile[0])+"\\s*");closingTagRe=new RegExp("\\s*"+escapeRegExp(tagsToCompile[1]));closingCurlyRe=new RegExp("\\s*"+escapeRegExp("}"+tagsToCompile[1]))}compileTags(tags||mustache.tags);var scanner=new Scanner(template);var start,type,value,chr,token,openSection;while(!scanner.eos()){start=scanner.pos;value=scanner.scanUntil(openingTagRe);if(value){for(var i=0,valueLength=value.length;i<valueLength;++i){chr=value.charAt(i);if(isWhitespace(chr)){spaces.push(tokens.length)}else{nonSpace=true}tokens.push(["text",chr,start,start+1]);start+=1;if(chr==="\n")stripSpace()}}if(!scanner.scan(openingTagRe))break;hasTag=true;type=scanner.scan(tagRe)||"name";scanner.scan(whiteRe);if(type==="="){value=scanner.scanUntil(equalsRe);scanner.scan(equalsRe);scanner.scanUntil(closingTagRe)}else if(type==="{"){value=scanner.scanUntil(closingCurlyRe);scanner.scan(curlyRe);scanner.scanUntil(closingTagRe);type="&"}else{value=scanner.scanUntil(closingTagRe)}if(!scanner.scan(closingTagRe))throw new Error("Unclosed tag at "+scanner.pos);token=[type,value,start,scanner.pos];tokens.push(token);if(type==="#"||type==="^"){sections.push(token)}else if(type==="/"){openSection=sections.pop();if(!openSection)throw new Error('Unopened section "'+value+'" at '+start);if(openSection[1]!==value)throw new Error('Unclosed section "'+openSection[1]+'" at '+start)}else if(type==="name"||type==="{"||type==="&"){nonSpace=true}else if(type==="="){compileTags(value)}}openSection=sections.pop();if(openSection)throw new Error('Unclosed section "'+openSection[1]+'" at '+scanner.pos);return nestTokens(squashTokens(tokens))}function squashTokens(tokens){var squashedTokens=[];var token,lastToken;for(var i=0,numTokens=tokens.length;i<numTokens;++i){token=tokens[i];if(token){if(token[0]==="text"&&lastToken&&lastToken[0]==="text"){lastToken[1]+=token[1];lastToken[3]=token[3]}else{squashedTokens.push(token);lastToken=token}}}return squashedTokens}function nestTokens(tokens){var nestedTokens=[];var collector=nestedTokens;var sections=[];var token,section;for(var i=0,numTokens=tokens.length;i<numTokens;++i){token=tokens[i];switch(token[0]){case"#":case"^":collector.push(token);sections.push(token);collector=token[4]=[];break;case"/":section=sections.pop();section[5]=token[2];collector=sections.length>0?sections[sections.length-1][4]:nestedTokens;break;default:collector.push(token)}}return nestedTokens}function Scanner(string){this.string=string;this.tail=string;this.pos=0}Scanner.prototype.eos=function eos(){return this.tail===""};Scanner.prototype.scan=function scan(re){var match=this.tail.match(re);if(!match||match.index!==0)return"";var string=match[0];this.tail=this.tail.substring(string.length);this.pos+=string.length;return string};Scanner.prototype.scanUntil=function scanUntil(re){var index=this.tail.search(re),match;switch(index){case-1:match=this.tail;this.tail="";break;case 0:match="";break;default:match=this.tail.substring(0,index);this.tail=this.tail.substring(index)}this.pos+=match.length;return match};function Context(view,parentContext){this.view=view;this.cache={".":this.view};this.parent=parentContext}Context.prototype.push=function push(view){return new Context(view,this)};Context.prototype.lookup=function lookup(name){var cache=this.cache;var value;if(cache.hasOwnProperty(name)){value=cache[name]}else{var context=this,names,index,lookupHit=false;while(context){if(name.indexOf(".")>0){value=context.view;names=name.split(".");index=0;while(value!=null&&index<names.length){if(index===names.length-1)lookupHit=hasProperty(value,names[index]);value=value[names[index++]]}}else{value=context.view[name];lookupHit=hasProperty(context.view,name)}if(lookupHit)break;context=context.parent}cache[name]=value}if(isFunction(value))value=value.call(this.view);return value};function Writer(){this.cache={}}Writer.prototype.clearCache=function clearCache(){this.cache={}};Writer.prototype.parse=function parse(template,tags){var cache=this.cache;var tokens=cache[template];if(tokens==null)tokens=cache[template]=parseTemplate(template,tags);return tokens};Writer.prototype.render=function render(template,view,partials){var tokens=this.parse(template);var context=view instanceof Context?view:new Context(view);return this.renderTokens(tokens,context,partials,template)};Writer.prototype.renderTokens=function renderTokens(tokens,context,partials,originalTemplate){var buffer="";var token,symbol,value;for(var i=0,numTokens=tokens.length;i<numTokens;++i){value=undefined;token=tokens[i];symbol=token[0];if(symbol==="#")value=this.renderSection(token,context,partials,originalTemplate);else if(symbol==="^")value=this.renderInverted(token,context,partials,originalTemplate);else if(symbol===">")value=this.renderPartial(token,context,partials,originalTemplate);else if(symbol==="&")value=this.unescapedValue(token,context);else if(symbol==="name")value=this.escapedValue(token,context);else if(symbol==="text")value=this.rawValue(token);if(value!==undefined)buffer+=value}return buffer};Writer.prototype.renderSection=function renderSection(token,context,partials,originalTemplate){var self=this;var buffer="";var value=context.lookup(token[1]);function subRender(template){return self.render(template,context,partials)}if(!value)return;if(isArray(value)){for(var j=0,valueLength=value.length;j<valueLength;++j){buffer+=this.renderTokens(token[4],context.push(value[j]),partials,originalTemplate)}}else if(typeof value==="object"||typeof value==="string"||typeof value==="number"){buffer+=this.renderTokens(token[4],context.push(value),partials,originalTemplate)}else if(isFunction(value)){if(typeof originalTemplate!=="string")throw new Error("Cannot use higher-order sections without the original template");value=value.call(context.view,originalTemplate.slice(token[3],token[5]),subRender);if(value!=null)buffer+=value}else{buffer+=this.renderTokens(token[4],context,partials,originalTemplate)}return buffer};Writer.prototype.renderInverted=function renderInverted(token,context,partials,originalTemplate){var value=context.lookup(token[1]);if(!value||isArray(value)&&value.length===0)return this.renderTokens(token[4],context,partials,originalTemplate)};Writer.prototype.renderPartial=function renderPartial(token,context,partials){if(!partials)return;var value=isFunction(partials)?partials(token[1]):partials[token[1]];if(value!=null)return this.renderTokens(this.parse(value),context,partials,value)};Writer.prototype.unescapedValue=function unescapedValue(token,context){var value=context.lookup(token[1]);if(value!=null)return value};Writer.prototype.escapedValue=function escapedValue(token,context){var value=context.lookup(token[1]);if(value!=null)return mustache.escape(value)};Writer.prototype.rawValue=function rawValue(token){return token[1]};mustache.name="mustache.js";mustache.version="2.3.0";mustache.tags=["{{","}}"];var defaultWriter=new Writer;mustache.clearCache=function clearCache(){return defaultWriter.clearCache()};mustache.parse=function parse(template,tags){return defaultWriter.parse(template,tags)};mustache.render=function render(template,view,partials){if(typeof template!=="string"){throw new TypeError('Invalid template! Template should be a "string" '+'but "'+typeStr(template)+'" was given as the first '+"argument for mustache#render(template, view, partials)")}return defaultWriter.render(template,view,partials)};mustache.to_html=function to_html(template,view,partials,send){var result=mustache.render(template,view,partials);if(isFunction(send)){send(result)}else{return result}};mustache.escape=escapeHtml;mustache.Scanner=Scanner;mustache.Context=Context;mustache.Writer=Writer;return mustache});

  jQueryCode = function(){

  //////////////////////////// 
    /*!
   * Countdown v0.1.0
   * https://github.com/fengyuanchen/countdown
   *
   * Copyright 2014 Fengyuan Chen
   * Released under the MIT license
   */

  !function(a){"function"==typeof define&&define.amd?define(["jquery"],a):a(jQuery)}(function(a){"use strict";var b=function(c,d){this.$element=a(c),this.defaults=a.extend({},b.defaults,this.$element.data(),a.isPlainObject(d)?d:{}),this.init()};b.prototype={constructor:b,init:function(){var a=this.$element.html(),b=new Date(this.defaults.date||a);b.getTime()&&(this.content=a,this.date=b,this.find(),this.defaults.autoStart&&this.start())},find:function(){var a=this.$element;this.$days=a.find("[data-days]"),this.$hours=a.find("[data-hours]"),this.$minutes=a.find("[data-minutes]"),this.$seconds=a.find("[data-seconds]"),this.$days.length+this.$hours.length+this.$minutes.length+this.$seconds.length>0&&(this.found=!0)},reset:function(){this.found?(this.output("days"),this.output("hours"),this.output("minutes"),this.output("seconds")):this.output()},ready:function(){var a,b=this.date,c=100,d=1e3,e=6e4,f=36e5,g=864e5,h={};return b?(a=b.getTime()-(new Date).getTime(),0>=a?(this.end(),!1):(h.days=a,h.hours=h.days%g,h.minutes=h.hours%f,h.seconds=h.minutes%e,h.milliseconds=h.seconds%d,this.days=Math.floor(h.days/g),this.hours=Math.floor(h.hours/f),this.minutes=Math.floor(h.minutes/e),this.seconds=Math.floor(h.seconds/d),this.deciseconds=Math.floor(h.milliseconds/c),!0)):!1},start:function(){!this.active&&this.ready()&&(this.active=!0,this.reset(),this.autoUpdate=this.defaults.fast?setInterval(a.proxy(this.fastUpdate,this),100):setInterval(a.proxy(this.update,this),1e3))},stop:function(){this.active&&(this.active=!1,clearInterval(this.autoUpdate))},end:function(){this.date&&(this.stop(),this.days=0,this.hours=0,this.minutes=0,this.seconds=0,this.deciseconds=0,this.reset(),this.defaults.end())},destroy:function(){this.date&&(this.stop(),this.$days=null,this.$hours=null,this.$minutes=null,this.$seconds=null,this.$element.empty().html(this.content),this.$element.removeData("countdown"))},fastUpdate:function(){--this.deciseconds>=0?this.output("deciseconds"):(this.deciseconds=9,this.update())},update:function(){--this.seconds>=0?this.output("seconds"):(this.seconds=59,--this.minutes>=0?this.output("minutes"):(this.minutes=59,--this.hours>=0?this.output("hours"):(this.hours=23,--this.days>=0?this.output("days"):this.end())))},output:function(a){if(!this.found)return void this.$element.empty().html(this.template());switch(a){case"deciseconds":this.$seconds.text(this.getSecondsText());break;case"seconds":this.$seconds.text(this.seconds);break;case"minutes":this.$minutes.text(this.minutes);break;case"hours":this.$hours.text(this.hours);break;case"days":this.$days.text(this.days)}},template:function(){return this.defaults.text.replace("%s",this.days).replace("%s",this.hours).replace("%s",this.minutes).replace("%s",this.getSecondsText())},getSecondsText:function(){return this.active&&this.defaults.fast?this.seconds+"."+this.deciseconds:this.seconds}},b.defaults={autoStart:!0,date:null,fast:!1,end:a.noop,text:"%s days, %s hours, %s minutes, %s seconds"},b.setDefaults=function(c){a.extend(b.defaults,c)},a.fn.countdown=function(c){return this.each(function(){var d=a(this),e=d.data("countdown");e||d.data("countdown",e=new b(this,c)),"string"==typeof c&&a.isFunction(e[c])&&e[c]()})},a.fn.countdown.constructor=b,a.fn.countdown.setDefaults=b.setDefaults,a(function(){a("[countdown]").countdown()})});

    jQuery(document).ready(function ($) {

      var template = __st.p
      var shop_name = Shopify.shop;

      if (template != "product") {
        var str = __st.pageurl
        var rest = str.substring(0, str.lastIndexOf("/") + 1);
        var template = str.substring(str.lastIndexOf("/") + 1, str.length);
      }

        var base_url = 'https://deliverytimer.herokuapp.com';

      if ((template == 'product') || (template != 'product')) {
        var product_id = __st.rid;
        // $('head').append('<link type="text/css" href="'+base_url+'/deliverytimer/deliverytimer.css?'+Math.random()+'" rel="stylesheet">');
        $('head').append('<style>.dropdown__arrow{margin-left:3px;border-left: 2px solid #858585;border-bottom: 2px solid #858585;height: 10px;width: 10px;transform: translate(2px, -2px) rotate(-45deg); -webkit-transform: translate(2px, -2px) rotate(-45deg);border-right: 2px solid transparent;border-top: 2px solid transparent;display: inline-block;-moz-transform: translate(2px, -2px) rotate(-45deg);-ms-transform: translate(2px, -2px) rotate(-45deg);-o-transform: translate(2px, -2px) rotate(-45deg);}@media only screen and (max-width: 375px) {#visual_timer_wrapper #dlt_cname_label b {display: none;}}</style>');
        
        function getQueryAddress(name) {
          var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
          var r = window.location.search.substr(1).match(reg);
          if (r != null) return unescape(r[2]);
          return null;
        }

        function check_variant(handle, variant_id, type){
          url = $(location).attr('href');
          // var check_for_cart = ('https://'+Shopify.shop+'/cart')==url;

          if (template=='product') {
            $.ajax({
              dataType: 'json',
              async: false, 
              url: '/products/' + handle + '.js',
              success: function(product) {
                current_product = product;
                if (product["available"]!=false) {
                  var var_count = 0;
                  var selected_variant;

                  function get_and_set_variant(var_id){
                    if (var_id == undefined) {
                      var_id = product["variants"][var_count].id
                      selected_variant = $.grep(product['variants'], function (element, index) {return element.id == var_id; })[0];
                    }else{
                      selected_variant = $.grep(product['variants'], function (element, index) {return element.id == var_id; })[0];
                    }

                    var_count=var_count+1;
                    if ((selected_variant.available == false) && (type == 'onload')) {
                      if (url.includes("variant=")) {
                        // is_variant_in_params = true;
                        return selected_variant;
                      }
                      selected_variant = get_and_set_variant(variant_id);
                      // is_variant_in_params = false;
                      return selected_variant;
                    }else{
                      // is_variant_in_params = (type == 'onload') ? false : true;
                      return selected_variant;
                    }
                  }

                  selected_variant = get_and_set_variant(variant_id);
                  dlt_variant_id = selected_variant.id;

                  if (selected_variant.available == false) {
                    // $('#visual_timer_wrapper').css('display','none');
                    $(document).find("div[id='delivery_timer_wrapper'], div[id='visual_timer_wrapper']").each(function (i, el) {
                      // $(this).css('display','none');
                      $(this).fadeOut();
                    });
                    valid = false;
                  }else if(selected_variant.available == true){
                    $(document).find("div[id='delivery_timer_wrapper'], div[id='visual_timer_wrapper']").each(function (i, el) {
                      // $(this).css('display','block');
                      $(this).fadeIn();
                    });
                    valid = true;
                    
                    if (type == 'onload') {
                      main_dlt_code('', '', true);
                    }else{
                      main_dlt_code('', '', false);
                    }
                  }

                }
              },
              error: function() {

              }
            })
          }
        }

        if (template == 'product' && !__st.pageurl.includes("products_preview")) {
          var url = $(location).attr('href');
          var parts = url.split("/");
          var handle = parts[parts.length - 1].split("?")[0];
          handle = handle.split('#')[0];
          var variant_id;

          if (url.includes("variant=")) {
            variant_id = getQueryAddress("variant");
          }

          check_variant(handle, variant_id, 'onload');

          function variant_change() {
            setTimeout(console.log.bind(console, "%cDlt variant changed", "color:green"));
            url = $(location).attr('href');
            let unsupported_theme_ids = [688];
            let theme_id = Shopify.theme.theme_store_id;

            if(url.includes("variant=") && !unsupported_theme_ids.includes(theme_id)){
              variant_id = getQueryAddress("variant");

              if (Shopify.designMode == true) {
                variant_id = variant_id.split("&")[0];
              }

              check_variant(handle, variant_id, 'onchange');
            }else{
              if($('#delivery_timer_wrapper').length){
                if($('#delivery_timer_wrapper').is(":hidden")){
                  $('#delivery_timer_wrapper').fadeIn();
                }
              }
              if($('#visual_timer_wrapper').length){
                if($('#visual_timer_wrapper').is(":hidden")){
                  $('#visual_timer_wrapper').fadeIn();
                }
              }
            }
          }

         // Debounce function to prevent multiple rapid executions
          function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
              const later = () => {
                  clearTimeout(timeout);
                  func(...args);
              };
              clearTimeout(timeout);
              timeout = setTimeout(later, wait);
            };
          }

          // Combine selectors for better maintainability
          const variantSelectors = [
            "form[action*='/cart/add'] select",
            "form[action*='/cart/add'] input[type='radio']",
            ".xo-product-info-content__variant input[type='radio']",
            "variant-selects input[type='radio']",
            "variant-selects select",
            ".variant-picker__option input[type='radio']",
            ".product-variant-picker-block input[type='radio']",
            "variant-radios input[type='radio']",
            "variant-picker input[type='radio']",
            ".product-variants input[type='radio']",
            "form[action*='/cart/add'] button.ProductForm__Item span.ProductForm__SelectedValue",
            "form[method='post'][action='/cart/add'] input[name='id']"
          ].join(", ");

          // Create debounced version of variant_change
          const debouncedVariantChange = debounce(() => {
            if (__st.p === 'product') {
                variant_change();
            }
          }, 500);

          // Handle change events
          $(document).on('change', variantSelectors, debouncedVariantChange);

          // Handle click events
          $(document).on('click', [
            "div.Popover__ValueList button.Popover__Value",
            ".product__option .dynamic-variant-button",
            "div.swatch-element.variant-swatch"
          ].join(", "), debouncedVariantChange);
        }else{
            main_dlt_code('', '', true);
          }


        function dlt_setCookie(name, value, hours) {
          var expirationDate = new Date();
          expirationDate.setTime(expirationDate.getTime() + hours * 60 * 60 * 1000);
          var expires = "expires=" + expirationDate.toUTCString();
          document.cookie = name + "=" + value + "; " + expires + "; path=/";
        }
        function dlt_getCookie(name) {
          var cookies = document.cookie.split(';');
          for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.indexOf(name + '=') === 0) {
              return cookie.substring(name.length + 1);
            }
          }
          return null; // Cookie not found
        }
        function dlt_getIPAddress() {
          let url0 = base_url + '/output/get_remote_ip.json?shop=' + shop_name;
          return $.getJSON(url0)
            .then(function(response) {
              return response.ip;
            });
        }
        function dlt_get_geolocation_info_data(csc_code, cp_name, imprsn_count){
          let gurl = base_url + '/output/get_geolocation_info.json?shop=' + shop_name + '&product_id=' + product_id;
          $.ajax({
            crossOrigin: true,
            url: gurl,
            success: function (data) {
              if (data["success"] == true) {
                if (data["db_states_exist?"] == true) {
                  let geo_data = data["geo_data"];
                  if (geo_data["country_name"] == '') {
                    geo_data["country_name"] = popup_countries_array[geo_data["country_code"]];
                  }

                  if (geo_data.hasOwnProperty("ip")) {
                    // Assuming you have the IP address in the 'ipAddress' variable and the JSON data in the 'jsonData' variable
                    const cookieName = geo_data["ip"]; // Use IP address as the cookie name/key
                    const cookieValue = JSON.stringify(geo_data); // Convert JSON data to a string
                    dlt_setCookie(cookieName, cookieValue, 5);

                  }

                  inner_main_dlt_code(geo_data, geo_data["country_code"], geo_data["state"], imprsn_count);
                }else{
                  let geo_data = data["geo_data"];
                  $.get('/browsing_context_suggestions.json', (d) => {
                    // do something more interesting than console
                    let country = d.detected_values.country;
                    geo_data["country_code"] = country["handle"];
                    geo_data["country_name"] = country["name"];

                    inner_main_dlt_code(geo_data, country["handle"], '', imprsn_count);
                  });
                }
              }
            }
          });
        }
        function dlt_count_impression(){
          var url1 = base_url + '/variable_count?shop=' + shop_name;
          $.ajax({
            type: "POST",
            crossOrigin: true,
            url: url1,
            success: function (data) {
              setTimeout(console.log.bind(console, "%cCounted", "color:green"));
            }
          });
        }
        function inner_main_dlt_code(data1, csc_code, cp_name, imprsn_count){

          // --------------------------------edit start--------------------------------
          let current_bkdata = data1;
          current_country_code = data1.country_code;
          current_country_name = data1.country_name;
          c_code = current_country_code.toLowerCase();

          if (localStorage.getItem("dlt_country_code") != null) {
            c_code = localStorage.getItem("dlt_country_code").toLowerCase();
            data1.country_code = localStorage.getItem("dlt_country_code");
            csc_code = data1.country_code;
          }
          if (localStorage.getItem("dlt_country_name") != null) {
            data1.country_name = localStorage.getItem("dlt_country_name");
          }
          if (localStorage.getItem("dlt_provinces_name") != null) {
            data1.state = localStorage.getItem("dlt_provinces_name");
            cp_name = data1.state;
          }

          dataCountry.country_code = data1.country_code !== "Not found" ? data1.country_code.toLowerCase() : "us";
          dataCountry.country_name = data1.country_name !== "Not found" ? data1.country_name : "United States";
          dataCountry.flag = '<img src="https://flagcdn.com/'+c_code+'.svg" width="16" height="12" alt="'+current_country_name+'" style="border-radius: 2px;">';
          dataCountry.state = data1.state !== null ? data1.state : "Washington";

          dataCountry.country_label =
            "<span id='dlt_cname_label' style='cursor: pointer;display: inline-flex;align-items: center;line-height: 1;font-size: 12px;' country_code='" + dataCountry.country_code + "' country_name='" + dataCountry.country_name + "' current_country_code='" + current_country_code + 
            "' current_country_name='" + current_country_name + "'>" + dataCountry.flag + "{{ country_name }}" +
            "<i style='transform: rotate(45deg);-webkit-transform: rotate(45deg);border: solid black;border-width: 0 1.5px 1.5px 0;display: inline-block;padding: 2px;margin-bottom: 3px;margin-left: 4px;'></i></span>";

          if (imprsn_count == true) { 
            if (localStorage.getItem("dlt_country_name") != null && localStorage.getItem("dlt_provinces_name") == null){
              if (csc_code == '' && cp_name == '') {
                csc_code = dataCountry.country_code;
                cp_name == dataCountry.state;
              }
            }else if(localStorage.getItem("dlt_country_name") == null && localStorage.getItem("dlt_provinces_name") == null){
              csc_code = current_bkdata.country_code;
              cp_name = current_bkdata.state;
            }
          }

          // --------------------------------edit end--------------------------------
          var url = base_url + '/output/view.json?shop=' + shop_name + '&product_id=' + product_id + '&country_code=' + csc_code.toUpperCase() + '&province=' + cp_name + '&variant_id=' + dlt_variant_id;
          $.ajax({
            crossOrigin: true,
            url: url,
            success: function (data) {
              popup_countries_array = data["configured_countries"];
              popup_regions_array = data["configured_zones_of_countries"];

              var status = data["success"];
              const theme_id = Shopify.theme.theme_store_id;
              var enable_timer_data = data?.global_setting?.enable_siteside_timer || false;
              let show_country_name = data?.global_setting?.show_country_name || false;
              let show_country_label_or_not = (data["enbled_zones_count"] > 0) ? true : false;
              let ctry_name_text = '';

              if (template == "product" || template_cart == "cart" || enable_timer_data == true){
                if (status == true) {
                  ////////////////geolocation////////////////
                  $('head').append('<style type="text/css">'+data["settings"]["dlt_custom_css"]+'</style>');

                  if (show_country_name == true) {
                    ctry_name_text = "&nbsp;<b>" + dataCountry.country_name + "</b>";
                  }
                  dataCountry.country_label = dataCountry.country_label.replace(/{{ country_name }}/gi, ctry_name_text);
                  if (show_country_label_or_not == false) {
                    let customcss = '#dlt_cname_label{display:none !important;}';
                    $('head').append('<style>'+customcss+'</style>');
                  }

                  if (data["settings"]["enable_tbtimer"] == true) {
                    function findReplaceString(string, find1, replace1) {
                      if ((/[a-zA-Z\_]+/g).test(string)) {
                        var replace1 = '<span class="countdown">' + replace1 + '</span>'
                        s1 = string.replace(/{{ countdown }}/i, replace1);
                        return s1;
                      } else {
                        return false
                      }
                    }
                    
                    function findReplaceStringDelivery(string, find1, replace1, replace2) {
                        if ((/[a-zA-Z\_]+/g).test(string)) {
                          s1 = string.replace(/{{ deliverydate }}/i, replace1);
                          var meta_timer_date = '<span class="delivery_meta_timer_date" style="color: ' + data["settings"]["ds_deliverydate_font_color"] + '">' + check_meta_data + '</span>'
                          s2 = (replace2 === null || replace2 === "null")? s1.replace(/{{ custom_date }}/i, replace1): s1.replace(/{{ custom_date }}/i, meta_timer_date);
                          return s2;
                        } else {
                          return false
                        }
                    }

                    var timezone = data["settings"]["dts_timezone"];
                    var cutofftime = data["settings"]["cutofftimeupdated"];
                    var finalhtml = data["settings"]["message_on_front_end"];
                    var finalhtmlpostion = data["settings"]["ds_position"];

                    // var cutofftime = new Date(cutofftime);
                    // var d = new Date();
                    // cutofftime.setFullYear(d.getFullYear());
                    // cutofftime.setMonth(d.getMonth());
                    // cutofftime.setDate(d.getDate());

                    // var myData = {countdown: cutofftime};
                    // finalhtml = Mustache.to_html(finalhtml, myData);

                    finalhtml = finalhtml.replace(/{{ country }}/gi, dataCountry.country_label);
                    // finalhtml = dataCountry.country_label+' '+finalhtml

                    finalhtml = findReplaceString(finalhtml, 'countdown', cutofftime)
                     var check_meta_data =  data["meta_timer_data"]; 

                    var deliverydate = '<span class="delivery_date" style="color: ' + data["settings"]["ds_deliverydate_font_color"] + '">' + data["settings"]["des_delivery_lead_date"] + '</span>'

                    if (deliverydate != null) {
                     finalhtml = findReplaceStringDelivery(finalhtml, 'deliverydate', deliverydate,check_meta_data)
                    }

                    var styletoapply = ''; 
                    if (data["settings"]["ds_font_size"] != '') {
                      styletoapply += 'font-size:' + data["settings"]["ds_font_size"] + 'px;'
                    }
                    if (data["settings"]["ds_font_color"] != '') {
                      styletoapply += 'color:' + data["settings"]["ds_font_color"] + ';'
                    }
                    if (data["settings"]["ds_background_color"] != '') {
                      styletoapply += 'background:' + data["settings"]["ds_background_color"] + ';'
                    }
                    if (data["settings"]["ds_border_size"] != '' && data["settings"]["ds_border_size"] != null) {
                      styletoapply += 'border-width:' + data["settings"]["ds_border_size"] + 'px;'
                      styletoapply += 'border-style:solid;'
                    }
                    if (data["settings"]["ds_border_colour"] != '') {
                      styletoapply += 'border-color:' + data["settings"]["ds_border_colour"] + ';'
                    }
                    if (data["settings"]["ds_margin_top"] != '') {
                      styletoapply += 'margin-top:' + data["settings"]["ds_margin_top"] + 'px;'
                    }
                    if (data["settings"]["ds_margin_bottom"] != '') {
                      styletoapply += 'margin-bottom:' + data["settings"]["ds_margin_bottom"] + 'px;'
                    }
                    if (data["settings"]["ds_margin_left"] != '') {
                      styletoapply += 'margin-left:' + data["settings"]["ds_margin_left"] + 'px;'
                    }
                    if (data["settings"]["ds_margin_right"] != '') {
                      styletoapply += 'margin-right:' + data["settings"]["ds_margin_right"] + 'px;'
                    }
                    if (data["settings"]["ds_padding_top"] != '') {
                      styletoapply += 'padding-top:' + data["settings"]["ds_padding_top"] + 'px;'
                    }
                    if (data["settings"]["ds_padding_bottom"] != '') {
                      styletoapply += 'padding-bottom:' + data["settings"]["ds_padding_bottom"] + 'px;'
                    }
                    if (data["settings"]["ds_padding_left"] != '') {
                      styletoapply += 'padding-left:' + data["settings"]["ds_padding_left"] + 'px;'
                    }
                    if (data["settings"]["ds_padding_right"] != '') {
                      styletoapply += 'padding-right:' + data["settings"]["ds_padding_right"] + 'px;'
                    }
                    if (data["settings"]["ds_text_position"] != '') {
                      styletoapply += 'text-align:' + data["settings"]["ds_text_position"] + ';'
                    }
                    if (valid != true) {
                      styletoapply += 'display:none;'
                    }


                    if ($("#delivery_timer_wrapper").length) {
                      $('head').append('<style type="text/css">#delivery_timer_wrapper{' + styletoapply + '}</style>');
                      $("#delivery_timer_wrapper").replaceWith('<div id="delivery_timer_wrapper" style="' + styletoapply + '">' + finalhtml + '</div>');
                    } else if (template == 'product' && current_product["available"]!=false) {
                      const substrings = [887, 1356, 1363, 1368, 1431, 1434, 1499, 1500, 141, 732, 1657, 863, 714, 868, 568, 1864, 1841, 1891, 1567];

                      if (substrings.includes(theme_id)){
                        if (finalhtmlpostion == "aboveproduct") {
                          $("form[action*='/cart/add']:last").prepend('<div id="delivery_timer_wrapper" style="' + styletoapply + '">' + finalhtml + '</div>');
                        } else {
                          $("form[action*='/cart/add']:last").append('<div id="delivery_timer_wrapper" style="' + styletoapply + '">' + finalhtml + '</div>');
                        }
                      }else{
                        if (finalhtmlpostion == "aboveproduct") {
                          $("form[action*='/cart/add']:first").prepend('<div id="delivery_timer_wrapper" style="' + styletoapply + '">' + finalhtml + '</div>');
                        } else {
                          $("form[action*='/cart/add']:first").append('<div id="delivery_timer_wrapper" style="' + styletoapply + '">' + finalhtml + '</div>');
                        }
                      }
                    }

                    setTimeout(function () {
                      $(document).find("div[id='delivery_timer_wrapper']").each(function (i, el) {
                        $(this).addClass('dltimerwrapper__' + i);
                      });

                      $(document).find(".dltimerwrapper__1").remove();
                      $(document).find(".dltimerwrapper__2").remove();
                    }, 5000);

                    var always_show_timer = data["settings"]["always_show_timer"];

                    if ($.fn.countdown === undefined) {
                      // jQuery(document).ready(function($){
                      // console.log("countdown here");
                      // console.log($.fn.countdown);
                      // })
                    } else {
                      var hide_comma_separator = data["settings"]["hide_comma_separator"];
                      var dts_show_seconds = data["settings"]["dts_show_seconds"];
                      var dts_counter_format = data["settings"]["dts_counter_format"];
                      // -----------------------------------------------------------
                      var custom_days = cf2_days = data["global_setting"]["custom_days"];
                      var custom_hours = cf2_hours = data["global_setting"]["custom_hours"];
                      var custom_minutes = cf2_minutes = data["global_setting"]["custom_minutes"];
                      var custom_seconds = cf2_seconds = data["global_setting"]["custom_seconds"];
                      var shop_locale = data["settings"]["locale"];
                      var minutes_slug = data["minutes_slug"];
                      var seconds_slug = data["seconds_slug"];

                      if (!custom_days) {
                        // custom_days = ""
                        custom_days = data["custom_days"];
                      }
                      if (!custom_hours) {
                        // custom_hours = ""
                        custom_hours = data["custom_hours"];
                      }

                      if (!cf2_days) {
                        cf2_days = "D";
                      }
                      if (!cf2_hours) {
                        cf2_hours = "H";
                      }
                      if (!cf2_minutes) {
                        cf2_minutes = "M";
                      }
                      if (!cf2_seconds) {
                        cf2_seconds = "S";
                      }

                      // -----------------------------------------------------------
                      if (dts_counter_format == "format2") {
                        if (hide_comma_separator) {
                          if (dts_show_seconds == true) {
                            $("#delivery_timer_wrapper .countdown").countdown({
                              date: cutofftime,
                              text: "<span class='days'>%s"+cf2_days+" </span> %s"+cf2_hours+" %s"+cf2_minutes+"<span class='seconds' style=''> %s"+cf2_seconds+"</span>",
                              end: function () {
                                $('#delivery_timer_wrapper').remove();
                              }
                            });
                          } else {
                            $("#delivery_timer_wrapper .countdown").countdown({
                              date: cutofftime,
                              text: "<span class='days'>%s"+cf2_days+" </span> %s"+cf2_hours+" %s"+cf2_minutes+"<span class='seconds' style='display: none;'> %s"+cf2_seconds+"</span>",
                              end: function () {
                                $('#delivery_timer_wrapper').remove();
                              }
                            });
                          }
                        } else {
                          if (dts_show_seconds == true) {
                            $("#delivery_timer_wrapper .countdown").countdown({
                              date: cutofftime,
                              text: "<span class='days'>%s"+cf2_days+",</span> %s"+cf2_hours+", %s"+cf2_minutes+"<span class='seconds' style=''>, %s"+cf2_seconds+"</span>",
                              end: function () {
                                $('#delivery_timer_wrapper').remove();
                              }
                            });
                          } else {
                            $("#delivery_timer_wrapper .countdown").countdown({
                              date: cutofftime,
                              text: "<span class='days'>%s"+cf2_days+",</span> %s"+cf2_hours+", %s"+cf2_minutes+"<span class='seconds' style='display: none;'>, %s"+cf2_seconds+"</span>",
                              end: function () {
                                $('#delivery_timer_wrapper').remove();
                              }
                            });
                          }
                        }
                      } 
                      else if (dts_counter_format == "format3") {
                        if (dts_show_seconds == true) {
                          $("#delivery_timer_wrapper .countdown").countdown({
                            date: cutofftime,
                            text: "<span class='days'>%s "+ custom_days + "</span> %s:%s<span class='seconds' style=''>:%s</span>",
                            end: function () {
                              $('#delivery_timer_wrapper').remove();
                            }
                          });
                        } else {
                          $("#delivery_timer_wrapper .countdown").countdown({
                            date: cutofftime,
                            text: "<span class='days'>%s "+ custom_days + "</span> %s:%s<span class='seconds' style='display: none;'>:%s</span>",
                            end: function () {
                              $('#delivery_timer_wrapper').remove();
                            }
                          });
                        }
                        // ------------------------here custom-------------------------------
                      } 
                      else {
                        if (hide_comma_separator) {
                          if (dts_show_seconds == true) {
                            $("#delivery_timer_wrapper .countdown").countdown({
                              date: cutofftime,
                              text: "<span class='days'>%s " + custom_days + "</span> %s " + custom_hours + " " + minutes_slug + "<span class='seconds' style=''> " + seconds_slug + "</span>",
                              end: function () {
                                $('#delivery_timer_wrapper').remove();
                              }
                            });
                          } else {
                            $("#delivery_timer_wrapper .countdown").countdown({
                              date: cutofftime,
                              text: "<span class='days'>%s " + custom_days + "</span> %s " + custom_hours + " " + minutes_slug + "<span class='seconds' style='display: none;'> " + seconds_slug + "</span>",
                              end: function () {
                                $('#delivery_timer_wrapper').remove();
                              }
                            });
                          }
                        } else {
                          if (dts_show_seconds == true) {
                            $("#delivery_timer_wrapper .countdown").countdown({
                              date: cutofftime,
                              text: "<span class='days'>%s " + custom_days + ",</span> %s " + custom_hours + ", " + minutes_slug + "<span class='seconds' style=''>, " + seconds_slug + "</span>",
                              end: function () {
                                $('#delivery_timer_wrapper').remove();
                              }
                            });
                          } else {
                            $("#delivery_timer_wrapper .countdown").countdown({
                              date: cutofftime,
                              text: "<span class='days'>%s " + custom_days + ",</span> %s " + custom_hours + ", " + minutes_slug + "<span class='seconds' style='display: none;'>, " + seconds_slug + "</span>",
                              end: function () {
                                $('#delivery_timer_wrapper').remove();
                              }
                            });
                          }
                        }
                      }
                    }

                    if (always_show_timer == true) {
                      var ret = $('#delivery_timer_wrapper').find('.days').text().replace(' day(s),', '');

                      if (parseInt(ret) == 0) {
                        $('head').append('<style>\
                        #delivery_timer_wrapper .days{display: none!important;}\
                        </style>');
                      }

                    }

                    var ret1 = $('#delivery_timer_wrapper').find('.days').text().replace(' day(s),', '');

                    if (parseInt(ret1) == 0) {
                      $('head').append('<style>\
                      #delivery_timer_wrapper .days{display: none!important;}\
                      </style>');
                    }

                    if (data["settings"]["ds_countdown_font_color"] != '') {
                      $('#delivery_timer_wrapper').find('.countdown').css('color', data["settings"]["ds_countdown_font_color"])
                    }
                    ///////////////////////////////////////////  
                  }else if($('#delivery_timer_wrapper').length){
                    $('#delivery_timer_wrapper').hide();
                  }

                  if (data["settings"]["enable_vtimer"] == true) {

                    var vicon_color = data["settings"]["dvs_icon_color"];
                    var vaccent_color = data["settings"]["dvs_accent_color"];
                    var vfont_color = data["settings"]["dvs_font_color"];
                    var vdel_date = data["settings"]["vdel_date"];
                    var vorder_date = data["settings"]["vorder_date"];
                    var vdispatches_date = data["settings"]["vdispatches_date"];
                    var finalhtml1postion = data["settings"]["ds_position"];
                    var vcustom_arrival = data["global_setting"]["custom_arrival"];
                    var vcustom_placed = data["global_setting"]["custom_placed"];
                    var vcustom_dispatches = data["global_setting"]["custom_dispatches"];
                    var vcustom_delivered = data["global_setting"]["custom_delivered"];
                    var hide_arrival = data["settings"]["dvs_hide_arrival"];

                    if (!vcustom_arrival) {
                      vcustom_arrival = 'Estimated arrival';
                    }
                    if (!vcustom_placed) {
                      vcustom_placed = 'Order placed';
                    }
                    if (!vcustom_dispatches) {
                      vcustom_dispatches = 'Order dispatches';
                    }
                    if (!vcustom_delivered) {
                      vcustom_delivered = 'Delivered!';
                    }
                    if (vicon_color == '') {
                      vicon_color = '#fff';
                    }

                    if(hide_arrival == true){
                      var toggle_dt_vt_est = 'display:'+'none;'
                    }else{
                      var toggle_dt_vt_est = ''
                    }

                    if(data["settings"]["dvs_date_size"] != ''){
                      var dt_vt_est_style = 'font-size:'+ data["settings"]["dvs_date_size"] +'px;'
                    }else{
                      var dt_vt_est_style = 'font-size: 28px;'
                    }

                    if(data["settings"]["dvs_font_size"] != ''){
                      var fontsizetoapply1 = 'font-size: ' + data["settings"]["dvs_font_size"] + 'px;'
                    }
                    var fontstyle_tag = "<style>#visual_timer_wrapper .dt-vt-colls>div>div>span,\
                      #visual_timer_wrapper .dt-vt-est{"+fontsizetoapply1+"}</style>";

                    var finalhtml1 = "<div class='dt-vt-est'> \
                    <div style='display:flex;justify-content:space-between;align-items: center;'><div style='"+toggle_dt_vt_est+"'><span style='"+dt_vt_est_style+"'>" + vdel_date + "</span> " 
                    + vcustom_arrival + " </div>\
                    <div>"+dataCountry.country_label+"</div></div>\
                    <div class='dt-vt-colls' style='display: flex; margin-top: 15px;'> <div style='text-align: left;' class='custom_vtcolumn'> <div id='order_placed_date'> <div> <span class='fa-stack fa-lg'> <i class='fa fa-circle fa-stack-2x' style='color: " + vaccent_color + ";'></i> <i class='fas fa-calendar-check fa-stack-1x vicon' style='color: " + vicon_color + ";'></i> </span> <div class='fg_1' style='padding-left: 10px;'><div style='border-bottom: 2px solid " + vaccent_color + ";'> </div></div> </div>\
                      <span>" + vorder_date + "</span>\
                      <span>" + vcustom_placed + "</span> </div> </div>\
                    <div style='text-align: center;' class='custom_vtcolumn'> <div id='order_dispatches_date'> <div>  <div class='fg_1' style='padding-right: 10px;'><div style='border-bottom: 2px solid " + vaccent_color + ";'> </div></div> <span class='fa-stack fa-lg'> <i class='fa fa-circle fa-stack-2x' style='color: " + vaccent_color + ";'></i> <i class='fas fa-shipping-fast fa-stack-1x vicon' style='color: " + vicon_color + ";'></i> </span> <div class='fg_1' style='padding-left: 10px;'><div style='border-bottom: 2px solid " + vaccent_color + ";'> </div></div> </div>\
                      <span>" + vdispatches_date + "</span>\
                      <span>" + vcustom_dispatches + "</span> </div> </div>\
                    <div style='text-align: right;'  class='custom_vtcolumn'> <div id='order_delivered_date'> <div> <div class='fg_1' style='padding-right: 10px;'><div style='border-bottom: 2px solid " + vaccent_color + ";'> </div></div> <span class='fa-stack fa-lg'> <i class='fa fa-circle fa-stack-2x' style='color: " + vaccent_color + ";'></i> <i class='fas fa-box-open fa-stack-1x vicon' style='color: " + vicon_color + ";'></i> </span> </div>\
                      <span>" + vdel_date + "</span>\
                      <span>" + vcustom_delivered + "</span> </div> </div>\
                    </div>"

                    var styletoapply1 = 'width: 100%;'
                    if (data["settings"]["dvs_font_color"] != '') {
                      styletoapply1 += 'color:' + data["settings"]["dvs_font_color"] + ';'
                    }
                    if (data["settings"]["dvs_margin_top"] != '') {
                      styletoapply1 += 'margin-top:' + data["settings"]["dvs_margin_top"] + 'px;'
                    }
                    if (data["settings"]["dvs_margin_bottom"] != '') {
                      styletoapply1 += 'margin-bottom:' + data["settings"]["dvs_margin_bottom"] + 'px;'
                    }
                    if (valid != true) {
                      styletoapply1 += 'display:none;'
                    }

                    $('head').append('<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/all.min.css" rel="stylesheet">');
                    $('head').append('<style type="text/css">.custom_vtcolumn{flex-grow: 1;flex-basis: 33.33333%;max-width: 33.33333%;}.custom_vtcolumn>div{display: flex;flex-direction: column;}.custom_vtcolumn>div>div{display: flex; flex-direction: row; width: 100%; margin-bottom: 10px;}.fg_1{  flex-grow: 1;}.fg_1>div{ height: 50%;}.vicon{font-size: 17px;}</style>');

                    if ($("#visual_timer_wrapper").length) {
                      $('head').append('<style type="text/css">#visual_timer_wrapper{' + styletoapply1 + '}#visual_timer_wrapper .fas,#visual_timer_wrapper .far{font-family: "Font Awesome 5 Free" !important;}</style>');
                      $("#visual_timer_wrapper").replaceWith('<div id="visual_timer_wrapper" style="' + styletoapply1 + '">' + finalhtml1 + '</div>');
                      
                      $(fontstyle_tag).insertAfter("#visual_timer_wrapper");
                    } else if (template == 'product' && current_product["available"]!=false) {
                      const substrings = [887, 1356, 1363, 1368, 1431, 1434, 1499, 1500, 141, 732, 1657, 863, 714, 868, 568, 1864, 1841, 1891, 1567];

                      if (substrings.includes(theme_id)){
                        if (finalhtml1postion == "aboveproduct") {
                          $("form[action*='/cart/add']:last").prepend('<div id="visual_timer_wrapper" style="' + styletoapply1 + '">' + finalhtml1 + '</div>' + fontstyle_tag);
                        } else {
                          $("form[action*='/cart/add']:last").append('<div id="visual_timer_wrapper" style="' + styletoapply1 + '">' + finalhtml1 + '</div>' + fontstyle_tag);
                        }
                      }else{
                        if (finalhtml1postion == "aboveproduct") {
                          $("form[action*='/cart/add']:first").prepend('<div id="visual_timer_wrapper" style="' + styletoapply1 + '">' + finalhtml1 + '</div>' + fontstyle_tag);
                        } else {
                          $("form[action*='/cart/add']:first").append('<div id="visual_timer_wrapper" style="' + styletoapply1 + '">' + finalhtml1 + '</div>' + fontstyle_tag);
                        }
                      }
                    }
                  }else if($('#visual_timer_wrapper').length){
                    $('#visual_timer_wrapper').hide();
                  }

                  if (imprsn_count == true) {
                    if (template == 'product' && current_product["available"] != false) {
                      dlt_count_impression();
                    }
                    else if(($("#delivery_timer_wrapper").find('.countdown').length > 0) || ($("#visual_timer_wrapper").find('.dt-vt-est').length > 0)) {
                      dlt_count_impression();
                    }
                  }

                  if (data["global_setting"]["add_deliverydate_to_order"] == true) {
                     // let dl_date_array = data["settings"]["deliverydate_lineitem_message"].split(':');
                    let hdl_date = $('.dlt_product_date');

                    if (hdl_date.length) {
                      hdl_date.val(data["settings"]["des_delivery_lead_date"]);
                    }else{
                      $('form[action*="/cart/add"]').prepend('<input class="dlt_product_date" type="hidden" name="properties['+(data["global_setting"]["hide_estimate_deliverydate"] == true ? '_' : '')+data["global_setting"]["deliverydate_lineitem_message"]+']" value="'+data["settings"]["des_delivery_lead_date"]+'">');
                    }
                  }


                  ///////////////////////////////////////////
                } // enable_tbtimer if end
              }

            } // success end

          });

        } // inner_main_dlt_code end
        function main_dlt_code(csc_code, cp_name, imprsn_count){

          dlt_getIPAddress()
          .done(function(ipAddress) {
            var cookieValue = JSON.parse(dlt_getCookie(ipAddress));

            if (cookieValue == null) {
              dlt_get_geolocation_info_data(csc_code, cp_name, imprsn_count);
            }else{
              inner_main_dlt_code(cookieValue, cookieValue["country_code"], cookieValue["country_name"], imprsn_count);
            }
          })
          .fail(function(error) {
            console.error("Error retrieving IP address:", error);
            dlt_get_geolocation_info_data(csc_code, cp_name, imprsn_count);
          });

        } // main_dlt_code end

        $(document).on("click", ".dlt_popup_countries_wrapper", function (evt) {
          if ($(evt.target).closest(".dlt_custom_popup .popup").length <= 0) {
            $(".dlt_popup_countries_wrapper").remove();
          }
        });
        $(document).on("click", ".country_regions_toggler", function (evt) {
          let ck_code = $(this).attr("country-index");
          if ($(this).hasClass("active")) {
            $("label[id^=" + ck_code + "]").css({ display: "none" });
            $(this).removeClass("active");
          } else {
            $(".wrapper_dropdown_body label").css({ display: "none" });
            $("label[id^=" + ck_code + "]").css({ display: "block" });
            $(this).addClass("active");
          }
          evt.stopPropagation();
        });
        $(document).on("click", ".wrapper_dropdown_body label", function () {
          let c_code = $(this).attr("country-data-index");
          let regions_code = $(this).attr("data-index");
          let c_name = popup_countries_array[c_code];
          let regions_name = popup_regions_array[c_code.toLowerCase()][regions_code];
          let ob = {};
          ob["country_code"] = $("#dlt_cname_label").attr('current_country_code');
          ob["country_name"] = $("#dlt_cname_label").attr('current_country_name');

          localStorage.setItem("dlt_country_code", c_code);
          localStorage.setItem("dlt_country_name", c_name);
          localStorage.setItem("dlt_provinces_code", regions_code);
          localStorage.setItem("dlt_provinces_name", regions_name);
          $(".dlt_popup_countries_wrapper").remove();
          inner_main_dlt_code(ob, c_code, regions_name, false);
        });
        $(document).on("click", "#dlt_cname_label", function () {
          let current_country_name = $(this).attr("current_country_name");
          let current_country_code = $(this).attr("current_country_code");
          if (localStorage.getItem("dlt_country_code") != null) {
            current_country_code = localStorage.getItem("dlt_country_code");
          }
          if (localStorage.getItem("dlt_country_name") != null) {
            current_country_name = localStorage.getItem("dlt_country_name");
          }
          let modal_head_title =
            "<div class='dropdown_container'><div class='dropdown_header'><img class='flag_image' src='https://flagcdn.com/"+current_country_code.toLowerCase()+".svg' width='16' height='12' alt='"+current_country_name+"'><span>" +
            current_country_name + "</span><i class='arrow'></i></div>";
          if (localStorage.getItem("dlt_provinces_name") != null) {
            modal_head_title =
              "<div class='dropdown_container'><div class='dropdown_header'><img class='flag_image' src='https://flagcdn.com/"+current_country_code.toLowerCase()+".svg' width='16' height='12' alt='"+current_country_name+"'><span>" +
              current_country_name + " - " + localStorage.getItem("dlt_provinces_name") +
              "</span><i class='arrow'></i></div>";
          }
          let modal_wrapper_html =
            "<div class='dlt_popup_countries_wrapper'>" +
            "<div class='dlt_custom_popup'><div class='popup'>" +
            "<div class='popup_title'><span>Select your location -</span>&nbsp;<span class='dlt_current_country_preview'><img class='flag_icon' src='https://flagcdn.com/"+$(this).attr("current_country_code").toLowerCase()+".svg' width='16' height='12'>(" + $(this).attr("current_country_name") + ")</span></div>" + "<div class='popup_dropdown'>" +
            "<select id='dlt_popup_dropdown' name='dlt-dropdown-name'></select>" +
            modal_head_title +
            "<div class='dropdown_body'><div class='search-input'><input type='text' placeholder='Search'>" +
            "<ul class='wrapper_dropdown_body'>" +
            "<div class='none'>No result found</div>" +
            "</ul>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "</div></div>" +
            "</div>";
          $("body").append(modal_wrapper_html);
          add_custom_dlt_style();
          let change_country = popup_countries_array;
          let select_country = [];
          let select_country_provinces = "";
          let push_country = [];
          $("#dlt_popup_dropdown").append("<option value=" + current_country_code + ">" + current_country_name + "</option>");
          $.each(change_country, function (index, item) {
            $("#dlt_popup_dropdown").append("<option value=" + index + ">" + item + "</option>");
            if (typeof popup_regions_array[index.toLowerCase()] !== "undefined") {
              $(".wrapper_dropdown_body").append(
                "<li class='dlt_country_change' style='justify-content: space-between;' data-index=" + index +
                  " data-value=" + item + "><span style='display:flex;align-items:center;'><img class='flag_icon' src='https://flagcdn.com/"+index.toLowerCase()+".svg' width='16' height='12' style='margin-right: 6px'>" + item + "</span><span style='padding-right: 13px;' country-index=" + index + " class='country_regions_toggler'>regions<span class='dropdown__arrow'></span></span></li>"
              );
              $.each(popup_regions_array[index.toLowerCase()], function (r_index, r_value) {
                $(".wrapper_dropdown_body").append(
                  "<label id=" + index + "_" + r_index + " class='edt-change-provinces' country-data-index=" +
                    index + " data-index=" + r_index + ">" + r_value + "</label>"
                );
              });
            } else {
              $(".wrapper_dropdown_body").append(
                "<li class='dlt_country_change' data-index=" + index + " data-value=" + item + "><img class='flag_icon' src='https://flagcdn.com/"+index.toLowerCase()+".svg' width='16' height='12' style='margin-right: 6px'>" + item + "</li>"
              );
            }
          });
          document.querySelector("div.popup_dropdown>select").value = "";
          document.querySelector("div.dropdown_header").onclick = function () {
            document.querySelector("div.search-input>input").value = "";
            document.querySelectorAll("ul.wrapper_dropdown_body>li").forEach(function (element, index) {
              if (element.classList.contains("active")) {
                element.classList = "active";
              } else {
                element.classList = "";
              }
            });
            document.querySelector("ul.wrapper_dropdown_body>div").classList = "none";
            var select_body = document.querySelector("div.dropdown_body");
            if (select_body.style.display == "block")
              select_body.style.display = "none";
            else 
              select_body.style.display = "block";
          };
          document.querySelectorAll("ul.wrapper_dropdown_body>li").forEach(function (element, index) {
            element.onclick = function () {
              document.querySelectorAll("ul.wrapper_dropdown_body>li").forEach(function (element, index) {
                element.classList = "";
              });
              element.classList = "active";
              var data_value = element.getAttribute("data-value");
              var select_head_span = document.querySelector("div.dropdown_header>span");
              document.querySelector("div.popup_dropdown>select").value = data_value;
              select_head_span.innerHTML = data_value;
              if (!select_head_span.classList.contains("fill")) select_head_span.classList = "fill";
            };
          });

          $("div.search-input>input").on("keyup", function(e) {
            // e.preventDefault();
            var value = $(this).val().toLowerCase();
            $("ul.wrapper_dropdown_body>li").filter(function() {
              $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            });
          });

        });
        $(document).on("click", ".dlt_current_country_preview", function (e) {
          localStorage.removeItem("dlt_country_code");
          localStorage.removeItem("dlt_country_name");
          localStorage.removeItem("dlt_provinces_code");
          localStorage.removeItem("dlt_provinces_name");
          $(".dlt_popup_countries_wrapper").remove();
          main_dlt_code();
        });
        $(document).on("click", ".wrapper_dropdown_body li", function () {
          let visible_bool = $(this).attr("display");
          if (visible_bool == "true") {
            return;
          }else{
            let c_code = $(this).attr("data-index");
            let c_name = popup_countries_array[c_code];
            let ob = {};
            ob["country_code"] = $("#dlt_cname_label").attr('current_country_code');
            ob["country_name"] = $("#dlt_cname_label").attr('current_country_name');
          
            localStorage.setItem("dlt_country_code", c_code);
            localStorage.setItem("dlt_country_name", c_name);
            localStorage.removeItem("dlt_provinces_code");
            localStorage.removeItem("dlt_provinces_name");
            $(".dlt_popup_countries_wrapper").remove();
            inner_main_dlt_code(ob, c_code, '', false);
          }
        });

        function add_custom_dlt_style(){
          const custom_dlt_style = `<style>.dlt_popup_countries_wrapper{position:fixed;top:0;right:0;bottom:0;left:0;overflow:hidden;outline:0;-webkit-overflow-scrolling:touch;filter:alpha(opacity=60);background-color:rgba(0,0,0,0.55);z-index:9999}.dlt_popup_countries_wrapper .dlt_custom_popup{position:absolute;left:50%;top:50%}.dlt_popup_countries_wrapper .popup{width:370px;height:100px;position:absolute;left:50%;padding:13px;top:-100px;background-color:#fff;border-radius:10px;transform:translateX(-50%);visibility:visible;opacity:1;font-size:13px;}.dlt_popup_countries_wrapper .popup_title{font-weight:normal;color:#797979;display:flex;align-items:center}.dlt_popup_countries_wrapper .popup_dropdown select{width:100%;outline:0;margin-top:10px;margin-bottom:10px}.dlt_popup_countries_wrapper .pop-button button{float:right;margin-right:20px;background-color:#169bd5;color:#fff;height:36px;border-radius:5px;border:0;width:70px}.dlt_popup_countries_wrapper .edt-img{display:flex;align-items:center;justransform:translateX(-50%);tify-content:end}.dlt_popup_countries_wrapper .dlt_current_country_preview{cursor:pointer;display:inline-flex;align-items:center}.dlt_popup_countries_wrapper div.popup_dropdown select{display:none}.dlt_popup_countries_wrapper div.dropdown_container{width:100%;margin-top:12px}.dlt_popup_countries_wrapper div.dropdown_header{position:relative;height:30px;width:100%;display:flex;border:solid 1px#ccc;align-items:center;cursor:pointer;padding-left:10px;border-radius:5px}.dlt_popup_countries_wrapper div.dropdown_header span{font-size:14px;margin-left:5px}.dlt_popup_countries_wrapper div.dropdown_header span.fill{color:#000}.dlt_popup_countries_wrapper div.dropdown_header i.arrow{position:absolute;height:12px;width:12px;right:10px;border:solid #ababab;border-width:0 2px 2px 0;display:inline-block;transform:rotate(45deg);-webkit-transform:rotate(45deg);top:6px}.dlt_popup_countries_wrapper div.dropdown_body{display:none;width:100%;border:solid 1px#ccc;border-top:0;border-radius:5px}.dlt_popup_countries_wrapper div.search-input{position:relative;background-color:#fff;border-radius:5px}.dlt_popup_countries_wrapper div.search-input input{height:30px;width:96%;margin:5px 8px;text-indent:7px;padding-right:10px;outline:0;background-color:#fff;border:1px solid #ccc;border-radius:4px}.dlt_popup_countries_wrapper ul.wrapper_dropdown_body{max-height:189px;overflow:auto;border-top:1px solid #ccc;background-color:#fff;margin:0;padding:0}.dlt_popup_countries_wrapper ul.wrapper_dropdown_body li{display:flex;height:27px;padding-left:10px;font-size:14px;align-items:center;cursor:pointer;border-bottom:1px solid #ccc}.dlt_popup_countries_wrapper ul.wrapper_dropdown_body li:hover,.dlt_popup_countries_wrapper li.active{background-color:#f5f6fa}.dlt_popup_countries_wrapper ul.wrapper_dropdown_body li.none,.dlt_popup_countries_wrapper div.none{display:none}.dlt_popup_countries_wrapper ul.wrapper_dropdown_body div{text-align:center;height:30px;line-height:30px;color:#AAA}.dlt_popup_countries_wrapper ul.wrapper_dropdown_body label:hover{background-color:#d6e6ed !important}@media screen and (max-width:767px){.dlt_popup_countries_wrapper .dlt_custom_popup{width:100% !important;position:absolute !important;left:0 !important;top:40%}}.dlt_popup_countries_wrapper .edt-change-provinces{margin-bottom:0;background-color:#f5f6fa;cursor:pointer;display:none;padding-left:38px;font-size:14px}.dlt_popup_countries_wrapper .flag_image{border-radius:2px}.dlt_popup_countries_wrapper .flag_icon{margin-right:5px;}</style>`;
          document.head.insertAdjacentHTML("beforeend", custom_dlt_style);
        }

      }
      else {
        // valid is false
      }
    });



    //////////////////////////// 
    } // jQueryCode method end

    if(window.jQuery){
      jQueryCode();
    } 
    else{   
      var script = document.createElement('script'); 
      document.head.appendChild(script);  
      script.type = 'text/javascript';
      script.src = "//ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js";
      script.onload = jQueryCode;
    }


    }else{
  }
}else{
  console.log('Delivery Timer is already running')
}
