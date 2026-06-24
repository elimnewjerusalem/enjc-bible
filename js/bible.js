// ═══════════════════════════════════════════════════════════════
//  ENJC Bible — bible.js  Clean rewrite — all features working
// ═══════════════════════════════════════════════════════════════
'use strict';

// FCBH audio API key (leave empty to use ResponsiveVoice instead)
const FCBH_KEY = '';
const FCBH_TA = ''; // Tamil fileset ID (e.g. 'TANIRV2DA')
const FCBH_EN = ''; // English fileset ID (e.g. 'ENGESV2DA')
// ── CONFIG ───────────────────────────────────────────────────────
const C = {
  enAPI:  'https://bible-api.com/',
  taAPI1: 'https://bolls.life/get-text/TAMOVR/',
  taAPI2: 'https://bolls.life/get-text/TAMBL98/',
  taAPI3: 'https://api.getbible.net/v2/tamil/',
  bollsText: 'https://bolls.life/get-text/',
  data:   'data/',
  ms:     9000,
  // Local Bible data (loaded once at startup)
  EN_LOCAL: 'data/english_kjv.json',
};

// ── 11 BIBLE VERSIONS — 3 Tamil + 8 English ──────────────────────
// src: 'local'  -> bundled offline KJV json
// src: 'bapi'   -> bible-api.com (free, public-domain only: kjv/web/bbe)
// src: 'bolls'  -> bolls.life get-text/<CODE>/<book>/<ch>/  (ta + modern en)
const VERSIONS=[
  {id:'taov',  lang:'ta', code:'ov',     label:'தமிழ் OV',          short:'OV',   src:'bolls', bcode:'TAMOVR'},
  {id:'tabl98',lang:'ta', code:'bl98',   label:'தமிழ் BL98',        short:'BL98', src:'bolls', bcode:'TAMBL98'},
  {id:'irvta', lang:'ta', code:'irvta',  label:'IRV தமிழ்',          short:'IRV',  src:'bolls', bcode:'IRVTam'},
  {id:'kjv',   lang:'en', code:'kjv',    label:'KJV',                short:'KJV',  src:'local'},
  {id:'web',   lang:'en', code:'web',    label:'WEB',                short:'WEB',  src:'bapi'},
  {id:'bbe',   lang:'en', code:'bbe',    label:'BBE',                short:'BBE',  src:'bapi'},
  {id:'asv',   lang:'en', code:'asv',    label:'ASV',                short:'ASV',  src:'bolls', bcode:'ASV'},
  {id:'nkjv',  lang:'en', code:'nkjv',   label:'NKJV',               short:'NKJV', src:'bolls', bcode:'NKJV'},
  {id:'nasb',  lang:'en', code:'nasb',   label:'NASB',               short:'NASB', src:'bolls', bcode:'NASB'},
  {id:'amp',   lang:'en', code:'amp',    label:'Amplified',          short:'AMP',  src:'bolls', bcode:'AMP'},
  {id:'erv',   lang:'en', code:'erv',    label:'ERV',                short:'ERV',  src:'bolls', bcode:'ERV'},
];
function getVerCode(verId){ return (VERSIONS.find(v=>v.id===verId)||{}).code; }
function getVer(verId){ return VERSIONS.find(v=>v.id===verId); }

// ── STATE ────────────────────────────────────────────────────────
const S = {
  lang:'ta', book:'', bookName:'', bookTaName:'', bookNum:1,
  ch:1, totalCh:1, verses:[], taVerses:[], enVerses:[],
  ver: localStorage.getItem('enjc_ver')||'taov',
  fs: parseInt(localStorage.getItem('enjc_fs')||'17'),
  hl: JSON.parse(localStorage.getItem('enjc_hl')||'{}'),
  bm: JSON.parse(localStorage.getItem('enjc_bm')||'[]'),
  notes: JSON.parse(localStorage.getItem('enjc_notes')||'{}'),
  tamilDB:{}, bibleData:{}, enDB:{},
  igSz:'9:16', igBg:'#080c10', igTc:'#e8a020',
  igVerses:[], customVerse:null,
  igBgImg:null, igUnsOverlay:0.5,
  audEl:null, playing:false, playAllM:false, pIdx:0,
  showParallel:false, hlColor:'#f5c518',
  theme: localStorage.getItem('enjc-theme')||'dark',
  fontFamily: localStorage.getItem('enjc_font')||'noto',
  _unlocked:false, _voicesReady:false,
};

// ── 66 BOOKS ─────────────────────────────────────────────────────
const BOOKS=[
  {id:'genesis',n:1,name:'Genesis',ta:'ஆதியாகமம்',ch:50,t:'OT'},{id:'exodus',n:2,name:'Exodus',ta:'யாத்திராகமம்',ch:40,t:'OT'},{id:'leviticus',n:3,name:'Leviticus',ta:'லேவியராகமம்',ch:27,t:'OT'},{id:'numbers',n:4,name:'Numbers',ta:'எண்ணாகமம்',ch:36,t:'OT'},{id:'deuteronomy',n:5,name:'Deuteronomy',ta:'உபாகமம்',ch:34,t:'OT'},{id:'joshua',n:6,name:'Joshua',ta:'யோசுவா',ch:24,t:'OT'},{id:'judges',n:7,name:'Judges',ta:'நியாயாதிபதிகள்',ch:21,t:'OT'},{id:'ruth',n:8,name:'Ruth',ta:'ரூத்',ch:4,t:'OT'},{id:'1+samuel',n:9,name:'1 Samuel',ta:'1 சாமுவேல்',ch:31,t:'OT'},{id:'2+samuel',n:10,name:'2 Samuel',ta:'2 சாமுவேல்',ch:24,t:'OT'},{id:'1+kings',n:11,name:'1 Kings',ta:'1 இராஜாக்கள்',ch:22,t:'OT'},{id:'2+kings',n:12,name:'2 Kings',ta:'2 இராஜாக்கள்',ch:25,t:'OT'},{id:'1+chronicles',n:13,name:'1 Chronicles',ta:'1 நாளாகமம்',ch:29,t:'OT'},{id:'2+chronicles',n:14,name:'2 Chronicles',ta:'2 நாளாகமம்',ch:36,t:'OT'},{id:'ezra',n:15,name:'Ezra',ta:'எஸ்றா',ch:10,t:'OT'},{id:'nehemiah',n:16,name:'Nehemiah',ta:'நெகேமியா',ch:13,t:'OT'},{id:'esther',n:17,name:'Esther',ta:'எஸ்தர்',ch:10,t:'OT'},{id:'job',n:18,name:'Job',ta:'யோபு',ch:42,t:'OT'},{id:'psalms',n:19,name:'Psalms',ta:'சங்கீதம்',ch:150,t:'OT'},{id:'proverbs',n:20,name:'Proverbs',ta:'நீதிமொழிகள்',ch:31,t:'OT'},{id:'ecclesiastes',n:21,name:'Ecclesiastes',ta:'பிரசங்கி',ch:12,t:'OT'},{id:'song+of+solomon',n:22,name:'Song of Solomon',ta:'உன்னதப்பாட்டு',ch:8,t:'OT'},{id:'isaiah',n:23,name:'Isaiah',ta:'ஏசாயா',ch:66,t:'OT'},{id:'jeremiah',n:24,name:'Jeremiah',ta:'எரேமியா',ch:52,t:'OT'},{id:'lamentations',n:25,name:'Lamentations',ta:'புலம்பல்',ch:5,t:'OT'},{id:'ezekiel',n:26,name:'Ezekiel',ta:'எசேக்கியேல்',ch:48,t:'OT'},{id:'daniel',n:27,name:'Daniel',ta:'தானியேல்',ch:12,t:'OT'},{id:'hosea',n:28,name:'Hosea',ta:'ஓசியா',ch:14,t:'OT'},{id:'joel',n:29,name:'Joel',ta:'யோவேல்',ch:3,t:'OT'},{id:'amos',n:30,name:'Amos',ta:'ஆமோஸ்',ch:9,t:'OT'},{id:'obadiah',n:31,name:'Obadiah',ta:'ஒபதியா',ch:1,t:'OT'},{id:'jonah',n:32,name:'Jonah',ta:'யோனா',ch:4,t:'OT'},{id:'micah',n:33,name:'Micah',ta:'மீகா',ch:7,t:'OT'},{id:'nahum',n:34,name:'Nahum',ta:'நாகூம்',ch:3,t:'OT'},{id:'habakkuk',n:35,name:'Habakkuk',ta:'ஆபகூக்',ch:3,t:'OT'},{id:'zephaniah',n:36,name:'Zephaniah',ta:'செப்பனியா',ch:3,t:'OT'},{id:'haggai',n:37,name:'Haggai',ta:'ஆகாய்',ch:2,t:'OT'},{id:'zechariah',n:38,name:'Zechariah',ta:'சகரியா',ch:14,t:'OT'},{id:'malachi',n:39,name:'Malachi',ta:'மல்கியா',ch:4,t:'OT'},
  {id:'matthew',n:40,name:'Matthew',ta:'மத்தேயு',ch:28,t:'NT'},{id:'mark',n:41,name:'Mark',ta:'மாற்கு',ch:16,t:'NT'},{id:'luke',n:42,name:'Luke',ta:'லூக்கா',ch:24,t:'NT'},{id:'john',n:43,name:'John',ta:'யோவான்',ch:21,t:'NT'},{id:'acts',n:44,name:'Acts',ta:'அப்போஸ்தலர்',ch:28,t:'NT'},{id:'romans',n:45,name:'Romans',ta:'ரோமர்',ch:16,t:'NT'},{id:'1+corinthians',n:46,name:'1 Corinthians',ta:'1 கொரிந்தியர்',ch:16,t:'NT'},{id:'2+corinthians',n:47,name:'2 Corinthians',ta:'2 கொரிந்தியர்',ch:13,t:'NT'},{id:'galatians',n:48,name:'Galatians',ta:'கலாத்தியர்',ch:6,t:'NT'},{id:'ephesians',n:49,name:'Ephesians',ta:'எபேசியர்',ch:6,t:'NT'},{id:'philippians',n:50,name:'Philippians',ta:'பிலிப்பியர்',ch:4,t:'NT'},{id:'colossians',n:51,name:'Colossians',ta:'கொலோசெயர்',ch:4,t:'NT'},{id:'1+thessalonians',n:52,name:'1 Thessalonians',ta:'1 தெசலோனிக்கேயர்',ch:5,t:'NT'},{id:'2+thessalonians',n:53,name:'2 Thessalonians',ta:'2 தெசலோனிக்கேயர்',ch:3,t:'NT'},{id:'1+timothy',n:54,name:'1 Timothy',ta:'1 தீமோத்தேயு',ch:6,t:'NT'},{id:'2+timothy',n:55,name:'2 Timothy',ta:'2 தீமோத்தேயு',ch:4,t:'NT'},{id:'titus',n:56,name:'Titus',ta:'தீத்து',ch:3,t:'NT'},{id:'philemon',n:57,name:'Philemon',ta:'பிலேமோன்',ch:1,t:'NT'},{id:'hebrews',n:58,name:'Hebrews',ta:'எபிரெயர்',ch:13,t:'NT'},{id:'james',n:59,name:'James',ta:'யாக்கோபு',ch:5,t:'NT'},{id:'1+peter',n:60,name:'1 Peter',ta:'1 பேதுரு',ch:5,t:'NT'},{id:'2+peter',n:61,name:'2 Peter',ta:'2 பேதுரு',ch:3,t:'NT'},{id:'1+john',n:62,name:'1 John',ta:'1 யோவான்',ch:5,t:'NT'},{id:'2+john',n:63,name:'2 John',ta:'2 யோவான்',ch:1,t:'NT'},{id:'3+john',n:64,name:'3 John',ta:'3 யோவான்',ch:1,t:'NT'},{id:'jude',n:65,name:'Jude',ta:'யூதா',ch:1,t:'NT'},{id:'revelation',n:66,name:'Revelation',ta:'வெளிப்படுத்தல்',ch:22,t:'NT'}
];

// ── VOTD ────────────────────────────────────────────────────────
const VOTD=[
  {ta:"என்னால் நினைக்கப்படுகிற நினைவுகளை நான் அறிவேன்; அவைகள் சமாதானத்திற்கான நினைவுகளே, தீமைக்கல்ல.",tref:"எரேமியா 29:11",en:"For I know the plans I have for you — plans for welfare and not for evil, to give you a future and a hope.",ref:"Jeremiah 29:11"},
  {ta:"உன் சம்பூர்ண இருதயத்தோடே கர்த்தரில் நம்பிக்கைவை; உன் சொந்த அறிவை நம்பாதே.",tref:"நீதிமொழிகள் 3:5",en:"Trust in the Lord with all your heart, and do not lean on your own understanding.",ref:"Proverbs 3:5"},
  {ta:"என்னை பலப்படுத்துகிற கிறிஸ்துவினால் எல்லாவற்றையும் செய்யவல்லேன்.",tref:"பிலிப்பியர் 4:13",en:"I can do all things through him who strengthens me.",ref:"Philippians 4:13"},
  {ta:"கர்த்தர் என் மேய்ப்பர்; எனக்கு குறைவுண்டாவதில்லை.",tref:"சங்கீதம் 23:1",en:"The Lord is my shepherd; I shall not want.",ref:"Psalm 23:1"},
  {ta:"திடமனதாயிரு, தைரியமாயிரு; கர்த்தர் நீ போகும் எவ்விடத்திலும் உன்னோடிருக்கிறார்.",tref:"யோசுவா 1:9",en:"Be strong and courageous. The Lord your God is with you wherever you go.",ref:"Joshua 1:9"},
  {ta:"வருத்தப்பட்டு பாரஞ்சுமக்கிறவர்களே, என்னிடத்தில் வாருங்கள்; நான் உங்களுக்கு இளைப்பாறுதல் தருவேன்.",tref:"மத்தேயு 11:28",en:"Come to me, all who labour and are heavy laden, and I will give you rest.",ref:"Matthew 11:28"},
  {ta:"கர்த்தருக்கு காத்திருக்கிறவர்களோ புதுப்பெலன் அடைவார்கள்; கழுகுகளைப்போல சிறகடித்து ஏறுவார்கள்.",tref:"ஏசாயா 40:31",en:"Those who wait for the Lord shall renew their strength; they shall mount up with wings like eagles.",ref:"Isaiah 40:31"}
];

// ── TOPICS ──────────────────────────────────────────────────────


// ── QUIZ — 100 questions in 10 rotating sets of 10 ─────────────
const QQ_ALL=[
  // SET 1
  {q:"யோவான் 3:16 இல் தேவன் உலகத்தில் என்ன செய்தார்?",a:1,o:["ஆக்கினை தீர்த்தார்","அன்பு கூர்ந்தார்","நியாயந்தீர்த்தார்","மறந்தார்"],r:"யோவான் 3:16"},
  {q:"கர்த்தர் என் ___; எனக்கு குறைவுண்டாவதில்லை.",a:0,o:["மேய்ப்பர்","தந்தை","ராஜா","நண்பர்"],r:"சங்கீதம் 23:1"},
  {q:"என்னை பலப்படுத்துகிற ___ னால் எல்லாவற்றையும் செய்யவல்லேன்.",a:2,o:["தேவன்","தூதர்","கிறிஸ்து","மனிதர்"],r:"பிலிப்பியர் 4:13"},
  {q:"எரேமியா 29:11 — என்னால் நினைக்கப்படுகிற நினைவுகள் எவ்வகையானவை?",a:0,o:["சமாதானம்","தீமை","நியாயம்","கோபம்"],r:"எரேமியா 29:11"},
  {q:"யோசுவா 1:9 — திடமனதாயிரு, ___; கர்த்தர் உன்னோடிருக்கிறார்.",a:1,o:["பெரியவனாயிரு","தைரியமாயிரு","சந்தோஷமாயிரு","நம்பிக்கையாயிரு"],r:"யோசுவா 1:9"},
  {q:"ஏசாயா 40:31 — கர்த்தருக்கு காத்திருக்கிறவர்கள் என்ன அடைவார்கள்?",a:2,o:["ஆசீர்வாதம்","சமாதானம்","புதுப்பெலன்","ஜீவன்"],r:"ஏசாயா 40:31"},
  {q:"மத்தேயு 11:28 — வருத்தப்பட்டு வாருங்கள்; நான் என்ன தருவேன்?",a:3,o:["வாழ்க்கை","நம்பிக்கை","ஆசீர்வாதம்","இளைப்பாறுதல்"],r:"மத்தேயு 11:28"},
  {q:"1 கொரிந்தியர் 13:4 — அன்பு நீடிய ___ உள்ளது",a:0,o:["பொறுமை","கோபம்","சந்தோஷம்","சக்தி"],r:"1 கொரிந்தியர் 13:4"},
  {q:"ரோமர் 8:28 — தேவனிடத்தில் அன்பு கூருகிறவர்களுக்கு எல்லாமும் எதற்கு ஏதுவாக நடக்கும்?",a:1,o:["தீமைக்கு","நன்மைக்கு","ஆக்கினைக்கு","சோதனைக்கு"],r:"ரோமர் 8:28"},
  {q:"சங்கீதம் 46:1 — தேவன் நமக்கு அடைக்கலமும் ___ மாயிருக்கிறார்",a:2,o:["சந்தோஷமு","அன்பு","பெலனு","நம்பிக்கையு"],r:"சங்கீதம் 46:1"},
  // SET 2
  {q:"யோவான் 14:6 — நான்தான் வழியும் ___ மும் ஜீவனுமாயிருக்கிறேன்.",a:1,o:["ஜீவனு","சத்தியமு","வெளிச்சமு","நம்பிக்கையு"],r:"யோவான் 14:6"},
  {q:"நீதிமொழிகள் 3:5 — உன் சம்பூர்ண இருதயத்தோடே எங்கே நம்பிக்கை வை?",a:0,o:["கர்த்தரில்","மனிதரில்","தன்னில்","செல்வத்தில்"],r:"நீதிமொழிகள் 3:5"},
  {q:"2 கொரிந்தியர் 12:9 — என் ___ உனக்குப் போதும் என்று கர்த்தர் சொன்னார்.",a:2,o:["பலன்","சமாதானம்","கிருபை","நேசம்"],r:"2 கொரிந்தியர் 12:9"},
  {q:"எபிரெயர் 11:1 — விசுவாசமானது ___ படுகிறவைகளின் உறுதியாயிருக்கிறது.",a:0,o:["நம்பப்","மறக்கப்","தேடப்","காணப்"],r:"எபிரெயர் 11:1"},
  {q:"1 தெசலோனிக்கேயர் 5:17 — ___ ஜெபம் பண்ணுங்கள்.",a:3,o:["அதிகமாக","பணிவாக","ஒன்றாக","இடைவிடாமல்"],r:"1 தெசலோனிக்கேயர் 5:17"},
  {q:"ஏசாயா 43:4 — நீ என் கண்களுக்கு ___ யானவன்.",a:1,o:["பெரிய","அருமை","சக்தி","நம்பிக்கை"],r:"ஏசாயா 43:4"},
  {q:"சங்கீதம் 27:1 — கர்த்தர் என் வெளிச்சமும் என் ___ மாயிருக்கிறார்.",a:2,o:["தந்தையு","நம்பிக்கையு","இரட்சிப்பு","வழிகாட்டியு"],r:"சங்கீதம் 27:1"},
  {q:"யோவான் 14:27 — ___ ஐ உங்களுக்கு வைத்துவிடுகிறேன் என்று இயேசு சொன்னார்.",a:0,o:["சமாதானம்","ஜீவன்","வெளிச்சம்","வல்லமை"],r:"யோவான் 14:27"},
  {q:"எபிரெயர் 13:8 — இயேசு கிறிஸ்துவே நேற்றும் இன்றும் என்றும் ___.",a:3,o:["வல்லமையுள்ளவர்","அன்புள்ளவர்","நீதியுள்ளவர்","மாறாதவர்"],r:"எபிரெயர் 13:8"},
  {q:"புலம்பல் 3:22 — கர்த்தருடைய கிருபைகள் ___ போவதில்லை.",a:1,o:["கண்டு","தீர்ந்து","மாறி","வளர்ந்து"],r:"புலம்பல் 3:22"},
  // SET 3
  {q:"மத்தேயு 5:8 — இருதயத்தில் ___ உள்ளவர்கள் பாக்கியவான்கள்.",a:0,o:["சுத்தம்","நம்பிக்கை","அன்பு","பெலன்"],r:"மத்தேயு 5:8"},
  {q:"சங்கீதம் 119:105 — உம்முடைய வசனம் என் காலுக்கு ___ ம் என் பாதைக்கு வெளிச்சமுமாயிருக்கிறது.",a:2,o:["வழியு","தண்ணீரு","விளக்கு","சக்தியு"],r:"சங்கீதம் 119:105"},
  {q:"கலாத்தியர் 5:22 — ஆவியின் கனி என்ன?",a:1,o:["வல்லமை","அன்பு","ஞானம்","பலன்"],r:"கலாத்தியர் 5:22"},
  {q:"யாக்கோபு 5:16 — ___ மானுடைய வேண்டுதல் மிகவும் பெலனுள்ளதாய் வல்லமையாய் நடக்கிறது.",a:0,o:["நீதி","தாழ்மை","விசுவாச","தொடர்ச்சியான"],r:"யாக்கோபு 5:16"},
  {q:"1 யோவான் 4:8 — தேவன் என்னவர்?",a:3,o:["ஞானம்","வல்லமை","நீதி","அன்பு"],r:"1 யோவான் 4:8"},
  {q:"சங்கீதம் 37:4 — கர்த்தரிடத்தில் ___ திரு; அவர் இருதயத்தின் வேண்டுதல்களை அருள்வார்.",a:1,o:["நம்பிக்கையாயி","மகிழ்ந்தி","பயந்தி","தாழ்மையாயி"],r:"சங்கீதம் 37:4"},
  {q:"ஏசாயா 53:5 — அவருடைய ___ களால் குணமாகிறோம்.",a:2,o:["வார்த்தை","கரங்க","தழும்பு","வல்லமை"],r:"ஏசாயா 53:5"},
  {q:"1 பேதுரு 5:7 — உங்கள் கவலைகளையெல்லாம் அவர்மேல் போடுங்கள்; ஏன்?",a:0,o:["அவர் விசாரிக்கிறார்","அவர் வல்லமையுள்ளவர்","அவர் நீதியுள்ளவர்","அவர் வழிகாட்டுவார்"],r:"1 பேதுரு 5:7"},
  {q:"சங்கீதம் 100:4 — ___ தோடே அவருடைய வாசல்களிலும் பிரவேசியுங்கள்.",a:3,o:["விசுவாசத்","பயத்","நம்பிக்கையி","ஸ்தோத்திரத்"],r:"சங்கீதம் 100:4"},
  {q:"ரோமர் 15:13 — நம்பிக்கையின் தேவன் என்னால் நிரப்புவாராக என்று பவுல் வேண்டினார்?",a:1,o:["வல்லமையால்","சகல சந்தோஷத்தினால்","ஞானத்தினால்","பெலத்தினால்"],r:"ரோமர் 15:13"},
  // SET 4
  {q:"மத்தேயு 6:33 — முதலாவது ___ ஐயும் அவருடைய நீதியையும் தேடுங்கள்.",a:0,o:["தேவனுடைய ராஜ்யத்த்","சமாதானத்த்","அன்பின் வழியை","ஞானத்தை"],r:"மத்தேயு 6:33"},
  {q:"யோவான் 10:10 — நான் வந்தது என்னவென்றால் ___ அடையும்படியாக வந்தேன்.",a:2,o:["சமாதானம்","வல்லமை","ஜீவன்","நம்பிக்கை"],r:"யோவான் 10:10"},
  {q:"எபேசியர் 2:8 — கிருபையினாலே ___ கொண்டு இரட்சிக்கப்பட்டீர்கள்.",a:1,o:["நம்பிக்கையை","விசுவாசத்தை","அன்பை","ஞானத்தை"],r:"எபேசியர் 2:8"},
  {q:"பிலிப்பியர் 4:6 — ___ ஒன்றினிமித்தமும் கவலைப்படாமல் இருங்கள்.",a:3,o:["சில","அதிக","குறைந்த","எந்த"],r:"பிலிப்பியர் 4:6"},
  {q:"யோவான் 15:5 — நான் திராட்சைவல்லி; நீங்கள் ___.",a:0,o:["கொம்புகள்","வேர்கள்","பழங்கள்","இலைகள்"],r:"யோவான் 15:5"},
  {q:"மாற்கு 16:15 — சகல உலகத்திலும் போய் ___ ஐ பிரசங்கியுங்கள்.",a:1,o:["சமாதானத்த்","சுவிசேஷத்த்","அன்பை","நம்பிக்கையை"],r:"மாற்கு 16:15"},
  {q:"லூக்கா 1:37 — தேவனால் ___ கார்யமும் இல்லாமல் போகாது.",a:2,o:["ஒரு","சில","எந்த","கடினமான"],r:"லூக்கா 1:37"},
  {q:"அப்போஸ்தலர் 1:8 — ___ வரும்போது நீங்கள் வல்லமை பெறுவீர்கள்.",a:0,o:["பரிசுத்த ஆவி","தேவதூதர்","கிறிஸ்து","வசனம்"],r:"அப்போஸ்தலர் 1:8"},
  {q:"2 தீமோத்தேயு 3:16 — வேதாகமம் ___ ஏவுதலினால் உண்டானது.",a:3,o:["மனித","தூத","தீர்க்கதரிசன","தேவ"],r:"2 தீமோத்தேயு 3:16"},
  {q:"சங்கீதம் 34:18 — கர்த்தர் ___ ஆனவர்களுக்கு சமீபமாயிருக்கிறார்.",a:1,o:["வல்லமையு","இருதயம் நொறுங்கி","ஜெபிக்கிற","துதிக்கிற"],r:"சங்கீதம் 34:18"},
  // SET 5
  {q:"மத்தேயு 28:20 — இதோ உலக முடிவுபரியந்தம் நான் ___ உங்களுடனே இருக்கிறேன்.",a:0,o:["எப்பொழுதும்","சில நேரம்","ஜெபிக்கும்போது","கஷ்டத்தில்"],r:"மத்தேயு 28:20"},
  {q:"யோவான் 8:32 — சத்தியம் உங்களை ___ செய்யும்.",a:2,o:["மகிழ்வி","பலப்படுத்தி","விடுதலையா","ஆசீர்வதி"],r:"யோவான் 8:32"},
  {q:"நீதிமொழிகள் 18:10 — கர்த்தருடைய நாமம் ___ மான கோபுரம்.",a:1,o:["வல்லமையு","பலத்த","அன்பான","நீதியான"],r:"நீதிமொழிகள் 18:10"},
  {q:"சங்கீதம் 91:1 — உன்னதமானவருடைய ___ ல் தங்குகிறவன் சர்வவல்லவருடைய நிழலில் இருப்பான்.",a:3,o:["வாக்கு","வல்லமை","நாமம்","இரகசியத்"],r:"சங்கீதம் 91:1"},
  {q:"ஏசாயா 41:10 — ___ ஆகாதே; நான் உன் தேவன்.",a:0,o:["பயப்பட","வருந்த","சந்தேகப்பட","கஷ்டப்பட"],r:"ஏசாயா 41:10"},
  {q:"மத்தேயு 5:9 — ___ உண்டாக்குகிறவர்கள் பாக்கியவான்கள்.",a:2,o:["அன்பை","விசுவாசத்தை","சமாதானத்தை","நீதியை"],r:"மத்தேயு 5:9"},
  {q:"1 யோவான் 1:9 — நாம் பாவங்களை அறிக்கையிட்டால் அவர் நம்முடைய பாவங்களை ___ செய்வார்.",a:1,o:["மறைக்க","மன்னிக்க","மறக்க","நீக்க"],r:"1 யோவான் 1:9"},
  {q:"ரோமர் 10:9 — ___ ஐ கர்த்தர் என்று வாயினால் அறிக்கையிட்டால் இரட்சிக்கப்படுவாய்.",a:0,o:["இயேசுவை","தேவனை","கிறிஸ்துவை","ஆண்டவரை"],r:"ரோமர் 10:9"},
  {q:"எபேசியர் 6:11 — தேவனுடைய ___ ஐ தரித்துக்கொள்ளுங்கள்.",a:3,o:["வல்லமை","அன்பு","சமாதானம்","சர்வாயுதவர்க்க"],r:"எபேசியர் 6:11"},
  {q:"பிலிப்பியர் 4:13 — என்னை பலப்படுத்துகிற கிறிஸ்துவினால் ___ வல்லேன்.",a:2,o:["சிலவற்றை","பலவற்றை","எல்லாவற்றையும்","யாவற்றையும்"],r:"பிலிப்பியர் 4:13"},
  // SET 6
  {q:"யோவான் 3:3 — மறுபடியும் ___ ஆனவன் தேவனுடைய ராஜ்யத்தை காண மாட்டான்.",a:1,o:["நம்பி","பிறவாத","ஜெபிக்காத","மாறாத"],r:"யோவான் 3:3"},
  {q:"சங்கீதம் 23:4 — மரண இருளின் பள்ளத்தாக்கில் நடந்தாலும் ___ ஆகேன்.",a:0,o:["பயப்பட","தளர","வருந்த","நம்பிக்கை இழக்க"],r:"சங்கீதம் 23:4"},
  {q:"ஏசாயா 26:3 — உன்னை நம்பினவனை ___ ல் காத்திருப்பாய்.",a:2,o:["வல்லமை","விசுவாசம்","சந்தோஷம் நிறைந்த சமாதான","நீதி"],r:"ஏசாயா 26:3"},
  {q:"மத்தேயு 7:7 — ___, உங்களுக்கு கொடுக்கப்படும்.",a:3,o:["தேடுங்கள்","கேளுங்கள்","கொடுங்கள்","கேளுங்கள்"],r:"மத்தேயு 7:7"},
  {q:"எபிரெயர் 4:16 — ___ ஆக கிருபாசனத்தண்டை சேருவோமாக.",a:0,o:["தைரியமா","தாழ்மையா","சந்தோஷமா","நம்பிக்கையா"],r:"எபிரெயர் 4:16"},
  {q:"1 கொரிந்தியர் 10:13 — தேவன் உங்களால் ___ ஆகிற சோதனை வரவொட்டார்.",a:1,o:["தாங்காத","தாங்க முடியாத","வல்லமையுள்ள","கடந்த"],r:"1 கொரிந்தியர் 10:13"},
  {q:"யோவான் 16:33 — உலகத்தில் உங்களுக்கு ___ உண்டு; தைரியமாயிருங்கள்.",a:2,o:["சோதனை","கஷ்டம்","உபத்திரவம்","ஆபத்து"],r:"யோவான் 16:33"},
  {q:"ரோமர் 8:38-39 — நம்மை கிறிஸ்துவின் அன்பிலிருந்து பிரிக்க ___ ஆலும் கூடாது.",a:0,o:["யாராலு","எதனா","எந்த சக்தியினாலு","மரணத்தினாலு"],r:"ரோமர் 8:38-39"},
  {q:"சங்கீதம் 139:14 — நான் ___ விதத்தில் உருவாக்கப்பட்டதால் உமக்கு ஸ்தோத்திரம்.",a:3,o:["சாதாரண","வேதனையான","தெய்வீகமான","அதிசயமான"],r:"சங்கீதம் 139:14"},
  {q:"ஏசாயா 55:11 — என் வாயிலிருந்து புறப்படுகிற வசனம் ___ திரும்பாது.",a:1,o:["ஒருகால்","வெறுமையா","ஒருபோதும்","சிலவேளை"],r:"ஏசாயா 55:11"},
  // SET 7
  {q:"மத்தேயு 18:20 — என் ___ ல் கூடியிருக்கும் இடத்தில் அங்கே இருக்கிறேன்.",a:0,o:["நாமத்தினா","வல்லமையினா","ஆவியினா","சமாதானத்தினா"],r:"மத்தேயு 18:20"},
  {q:"யோவான் 11:25 — நான் உயிர்த்தெழுதலும் ___ உமாயிருக்கிறேன்.",a:2,o:["சமாதானமு","வல்லமையு","ஜீவனு","நீதியு"],r:"யோவான் 11:25"},
  {q:"எபிரெயர் 13:5 — நான் உன்னை ___ விலகுவதில்லை என்று கர்த்தர் சொன்னார்.",a:1,o:["நேசத்தோடு","விட்டு","ஆசீர்வதிக்காம","வழிகாட்டாம"],r:"எபிரெயர் 13:5"},
  {q:"நீதிமொழிகள் 3:6 — உன் வழிகளிலெல்லாம் அவரை ___, அவர் உன் பாதைகளை செவ்வைப்படுத்துவார்.",a:3,o:["தேடு","நம்பு","பின்பற்று","அங்கீகரி"],r:"நீதிமொழிகள் 3:6"},
  {q:"சங்கீதம் 51:10 — தேவனே, என்னில் ___ இருதயம் சிருஷ்டியும்.",a:0,o:["சுத்தமான","நம்பிக்கையான","விசுவாசமான","அன்பான"],r:"சங்கீதம் 51:10"},
  {q:"அப்போஸ்தலர் 2:38 — மனந்திரும்பி ___ நாமத்தினாலே ஞானஸ்நானம் பெறுங்கள்.",a:1,o:["தேவன்","இயேசுகிறிஸ்து","பரிசுத்த ஆவி","கர்த்தர்"],r:"அப்போஸ்தலர் 2:38"},
  {q:"1 தீமோத்தேயு 6:6 — ___ உடன் கூடிய தேவபக்தி மிகவும் இலாபமுள்ளது.",a:2,o:["நம்பிக்கை","விசுவாசம்","திருப்தி","அன்பு"],r:"1 தீமோத்தேயு 6:6"},
  {q:"யோவான் 4:24 — தேவன் ___ ஆவியிருக்கிறார்.",a:0,o:["ஆவி","அன்பு","வல்லமை","நீதி"],r:"யோவான் 4:24"},
  {q:"2 தீமோத்தேயு 1:7 — தேவன் நமக்கு ___ ஆவியை அல்ல, பலமுள்ள ஆவியை கொடுத்தார்.",a:3,o:["பலவீனமான","சோர்வான","சோதனையான","பயமுள்ள"],r:"2 தீமோத்தேயு 1:7"},
  {q:"கொலோசெயர் 3:23 — நீங்கள் செய்கிற எதுவாயினும் ___ க்கென்று செய்யுங்கள்.",a:1,o:["மனிதர்கள்","கர்த்தர்","சபை","குடும்பம்"],r:"கொலோசெயர் 3:23"},
  // SET 8
  {q:"மத்தேயு 5:16 — உங்கள் ___ மனுஷர் முன்பாக பிரகாசிக்கட்டும்.",a:0,o:["வெளிச்சம்","விசுவாசம்","அன்பு","நம்பிக்கை"],r:"மத்தேயு 5:16"},
  {q:"யோவான் 15:13 — தன் ___ களுக்காக ஜீவனை கொடுப்பதிலும் பெரிய அன்பு இல்லை.",a:2,o:["பகைவர்","தந்தை","நண்பர்","சகோதரர்"],r:"யோவான் 15:13"},
  {q:"ரோமர் 12:2 — இந்த ___ க்கு ஒத்த வடிவமாயிராதேயுங்கள்.",a:1,o:["கஷ்டத்தி","உலகத்தி","சோதனைக்கி","பாவத்தி"],r:"ரோமர் 12:2"},
  {q:"சங்கீதம் 121:2 — என் உதவி ___ உண்டாக்கின கர்த்தரிடத்திலிருந்து வருகிறது.",a:3,o:["என் கைகளை","என் வழியை","என் நாட்களை","வானத்தையும் பூமியையும்"],r:"சங்கீதம் 121:2"},
  {q:"ஏசாயா 43:2 — நீ ___ கடந்து போகும்போது நான் உன்னோடே இருப்பேன்.",a:0,o:["ஆழமான நீரிலே","பள்ளத்தாக்கிலே","இருளிலே","கஷ்டத்திலே"],r:"ஏசாயா 43:2"},
  {q:"லூக்கா 12:7 — உங்கள் ___ எல்லாம் எண்ணப்பட்டிருக்கிறது.",a:2,o:["நாட்கள்","பாவங்கள்","தலைமயிர்கள்","வேண்டுதல்கள்"],r:"லூக்கா 12:7"},
  {q:"1 கொரிந்தியர் 2:9 — தேவன் தம்மை நேசிக்கிறவர்களுக்கு ஆயத்தம் செய்தவைகளை ___ கண்டதில்லை.",a:1,o:["யாரு","கண்","செவி","இருதயம்"],r:"1 கொரிந்தியர் 2:9"},
  {q:"எபேசியர் 3:20 — நாம் கேட்பதிலும் நினைப்பதிலும் ___ மாய் செய்யவல்லவர்.",a:3,o:["சரியா","தகுந்த","அதிகமா","அதிகாதிகமா"],r:"எபேசியர் 3:20"},
  {q:"1 கொரிந்தியர் 15:57 — நம்முடைய ___ இயேசுகிறிஸ்து மூலமாக ஜெயம் தருகிறார்.",a:0,o:["தேவன்","கர்த்தர்","ஆண்டவர்","பரிசுத்தர்"],r:"1 கொரிந்தியர் 15:57"},
  {q:"யாக்கோபு 1:17 — எல்லா நல்ல வரமும் சர்வ உத்தம ஈவும் ___ இலிருந்து வருகிறது.",a:1,o:["பூமி","மேலிருந்து","மனிதரி","இயற்கையி"],r:"யாக்கோபு 1:17"},
  // SET 9
  {q:"1 யோவான் 4:18 — ___ இல் பயமில்லை; பூரண அன்பு பயத்தை நீக்கும்.",a:0,o:["அன்பி","விசுவாசத்தி","ஜெபத்தி","நம்பிக்கையி"],r:"1 யோவான் 4:18"},
  {q:"சங்கீதம் 16:8 — நான் கர்த்தரை என் முன்பாக ___ வைத்திருக்கிறேன்.",a:2,o:["படமாக","ஆதாரமாக","எப்பொழுதும்","பிரார்த்தனையாக"],r:"சங்கீதம் 16:8"},
  {q:"எபேசியர் 1:7 — அவருடைய ___ நாம் மீட்பை பெற்றிருக்கிறோம்.",a:1,o:["அன்பினாலே","இரத்தத்தினாலே","வல்லமையினாலே","வசனத்தினாலே"],r:"எபேசியர் 1:7"},
  {q:"யோவான் 5:24 — என் வசனத்தை கேட்டு என்னை அனுப்பினவரை நம்புகிறவன் ___ ஜீவனை உடையவன்.",a:3,o:["நித்திய","பரிசுத்த","சமாதான","நிறைவான"],r:"யோவான் 5:24"},
  {q:"மத்தேயு 11:29 — என் நுகத்தை ஏற்றுக்கொள்ளுங்கள்; என் நுகம் ___ மானது.",a:0,o:["இலகுவா","கடினமா","நீதியா","வல்லமையா"],r:"மத்தேயு 11:29"},
  {q:"அப்போஸ்தலர் 16:31 — ___ ஐ விசுவாசி; நீயும் உன் வீட்டாரும் இரட்சிக்கப்படுவீர்கள்.",a:2,o:["தேவனை","கர்த்தரை","கர்த்தராகிய இயேசுவை","கிறிஸ்துவை"],r:"அப்போஸ்தலர் 16:31"},
  {q:"சங்கீதம் 145:18 — கர்த்தர் தம்மை ___ கூப்பிடுகிற எல்லாருக்கும் சமீபமாயிருக்கிறார்.",a:1,o:["விசுவாசமுடன்","உண்மையோடு","அன்போடு","பயத்தோடு"],r:"சங்கீதம் 145:18"},
  {q:"2 நாளாகமம் 7:14 — என் நாமம் தரிக்கப்பட்ட என் ஜனங்கள் ___, நான் அவர்கள் பாவத்தை மன்னிப்பேன்.",a:3,o:["பாடும்போது","தேடும்போது","வேண்டும்போது","தாழ்மைப்பட்டு ஜெபித்தால்"],r:"2 நாளாகமம் 7:14"},
  {q:"ரோமர் 5:8 — நாம் பாவிகளாயிருக்கையில் ___ நமக்காக மரித்தார்.",a:0,o:["கிறிஸ்து","தேவன்","இயேசு","ஆண்டவர்"],r:"ரோமர் 5:8"},
  {q:"நீதிமொழிகள் 16:3 — உன் கிரியைகளை ___ ஒப்புவி; உன் நினைவுகள் நிலைப்படும்.",a:2,o:["மனிதரிடம்","தூதரிடம்","கர்த்தரிடம்","சபையிடம்"],r:"நீதிமொழிகள் 16:3"},
  // SET 10
  {q:"யோவான் 6:35 — நான் ஜீவ ___ ஆயிருக்கிறேன்; என்னிடத்தில் வருகிறவன் பசியடைவதில்லை.",a:1,o:["தண்ணீர்","அப்பம்","வெளிச்சம்","வழி"],r:"யோவான் 6:35"},
  {q:"மத்தேயு 4:4 — மனுஷன் அப்பத்தினாலே மட்டுமல்ல, ___ மூலமாகவும் பிழைப்பான்.",a:0,o:["தேவ வசனத்தி","விசுவாசத்தி","ஜெபத்தி","அன்பினா"],r:"மத்தேயு 4:4"},
  {q:"1 பேதுரு 2:9 — நீங்கள் ___ இனம், ராஜரீக ஆசாரியக்கூட்டம்.",a:2,o:["சாதாரண","பரிசுத்த","தெரிந்துகொள்ளப்பட்ட","ஆசீர்வதிக்கப்பட்ட"],r:"1 பேதுரு 2:9"},
  {q:"சங்கீதம் 32:8 — நீ போக வேண்டிய வழியை ___, உனக்கு ஆலோசனை சொல்லுவேன்.",a:3,o:["காண்பிப்பேன்","தெரிவிப்பேன்","நடத்துவேன்","போதிப்பேன்"],r:"சங்கீதம் 32:8"},
  {q:"ஏசாயா 40:8 — புல் காய்ந்து போகும்; ___ என்றென்றும் நிலைத்திருக்கும்.",a:0,o:["தேவ வசனம்","தேவ அன்பு","தேவ வல்லமை","தேவ நீதி"],r:"ஏசாயா 40:8"},
  {q:"யாக்கோபு 4:8 — தேவனிடத்தில் ___ வாருங்கள், அவர் உங்களிடத்தில் சேருவார்.",a:1,o:["பயத்துட","சேர்ந்து","அன்போடு","விசுவாசத்துட"],r:"யாக்கோபு 4:8"},
  {q:"லூக்கா 11:9 — ___ உங்களுக்கு கொடுக்கப்படும்; தேடுங்கள் கண்டடைவீர்கள்.",a:2,o:["விசுவாசியுங்கள்","தேடுங்கள்","கேளுங்கள்","ஜெபியுங்கள்"],r:"லூக்கா 11:9"},
  {q:"2 கொரிந்தியர் 5:17 — ஒருவன் கிறிஸ்துவுக்குள் இருந்தால் ___ சிருஷ்டி.",a:3,o:["ஆசீர்வதிக்கப்பட்ட","பரிசுத்தமான","சந்தோஷமான","புதிய"],r:"2 கொரிந்தியர் 5:17"},
  {q:"சங்கீதம் 118:24 — இது ___ உண்டாக்கின நாள்; இதில் சந்தோஷப்படுவோம்.",a:0,o:["கர்த்தர்","தேவன்","கிறிஸ்து","ஆண்டவர்"],r:"சங்கீதம் 118:24"},
  {q:"வெளிப்படுத்தல் 21:4 — ___ கண்ணீரையும் துடைத்துவிடுவார்; மரணம் இனி இராது.",a:1,o:["கர்த்தர்","தேவன்","கிறிஸ்து","இயேசு"],r:"வெளிப்படுத்தல் 21:4"},
];

// Get current set (rotates daily, 10 sets)
let _quizSet = -1;
function getQQ(){
  if(_quizSet < 0){
    // Rotate set by day of year
    const d=new Date();
    const day=Math.floor((d-new Date(d.getFullYear(),0,0))/86400000);
    _quizSet = day % 10;
  }
  const start = _quizSet * 10;
  return QQ_ALL.slice(start, start + 10);
}
const QQ = getQQ(); // current set of 10

// ── IMAGE VERSES ────────────────────────────────────────────────
const IGVERSES=[
  {ta:"தேவன் இவ்வளவாய் உலகத்தில் அன்பு கூர்ந்தார், அதனால் தம்முடைய ஒரே பேறான குமாரனை அனுப்பினார்.",tref:"யோவான் 3:16",en:"For God so loved the world, that He gave His only begotten Son.",ref:"John 3:16"},
  {ta:"என்னை பலப்படுத்துகிற கிறிஸ்துவினால் எல்லாவற்றையும் செய்யவல்லேன்.",tref:"பிலிப்பியர் 4:13",en:"I can do all things through Christ who strengthens me.",ref:"Philippians 4:13"},
  {ta:"கர்த்தர் என் மேய்ப்பர்; எனக்கு குறைவுண்டாவதில்லை.",tref:"சங்கீதம் 23:1",en:"The Lord is my shepherd; I shall not want.",ref:"Psalm 23:1"},
  {ta:"நீ என் கண்களுக்கு அருமையானவன்; நான் உன்னை நேசிக்கிறேன்.",tref:"ஏசாயா 43:4",en:"You are precious in my sight, and honoured, and I love you.",ref:"Isaiah 43:4"},
  {ta:"கர்த்தருக்கு காத்திருக்கிறவர்களோ புதுப்பெலன் அடைவார்கள்.",tref:"ஏசாயா 40:31",en:"They who wait for the Lord shall renew their strength.",ref:"Isaiah 40:31"},
  {ta:"வருத்தப்பட்டு பாரஞ்சுமக்கிறவர்களே, என்னிடத்தில் வாருங்கள்.",tref:"மத்தேயு 11:28",en:"Come to me, all who labour and are heavy laden, and I will give you rest.",ref:"Matthew 11:28"},
  {ta:"நான்தான் வழியும் சத்தியமும் ஜீவனுமாயிருக்கிறேன்.",tref:"யோவான் 14:6",en:"I am the way, the truth, and the life.",ref:"John 14:6"},
  {ta:"தேவனிடத்தில் அன்பு கூருகிறவர்களுக்கு எல்லாமும் நன்மைக்கு ஏதுவாக நடக்கும்.",tref:"ரோமர் 8:28",en:"For those who love God all things work together for good.",ref:"Romans 8:28"}
];

const IG_TEMPLATES={
  cross:{bg:'#0b1929',accent:'#e8a020'},
  sunrise:{bg:'#2d1a05',accent:'#f5a020'},
  nature:{bg:'#0d2010',accent:'#4caf50'},
  stars:{bg:'#05051a',accent:'#9c88ff'}
};

// ── UTILITY ──────────────────────────────────────────────────────
let _toastTimer;
function toast(msg,dur=2500){
  const el=document.getElementById('toast');
  if(!el)return;
  el.innerHTML=msg;el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer=setTimeout(()=>el.classList.remove('show'),dur);
}

function g(id){return document.getElementById(id);}
function safe(id,txt){const el=g(id);if(el)el.textContent=txt;}

async function fetchT(url){
  const c=new AbortController();
  const t=setTimeout(()=>c.abort(),C.ms);
  try{const r=await fetch(url,{signal:c.signal});clearTimeout(t);return r;}
  catch(e){clearTimeout(t);throw e;}
}

// ── INIT ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded',()=>{
  applyTheme(S.theme);
  applyFont(S.fontFamily);
  populateBooks();
  renderVersionChips();
  syncVersionUI();
  g('fszv').textContent=S.fs+'px';
  loadVOTD(); // show local fallback immediately
  loadData(); // will call loadVOTD() again once remote bible-data.json loads
  initVoices();
  updateBmBadge();
  updateDailyBadge();
  // Unlock audio on first touch/click
  document.addEventListener('click',unlockAudio,{once:true});
  document.addEventListener('touchstart',unlockAudio,{once:true});
  // Keyboard
  document.addEventListener('keydown',e=>{
    if(['INPUT','TEXTAREA'].includes(e.target.tagName))return;
    if(e.key==='ArrowRight')nextCh();
    if(e.key==='ArrowLeft')prevCh();
    if(e.key===' '){e.preventDefault();togPlay();}
    if(e.key==='Escape')closePanel();
  });
});

// ── NAV ──────────────────────────────────────────────────────────
function toggleMobMenu(){var m=document.getElementById('mobile-menu');if(m)m.classList.toggle('is-open');}

// ── LOAD DATA ────────────────────────────────────────────────────
async function loadData(){
  try{
    // Device detection
    const isWebView = /wv|WebView/.test(navigator.userAgent) ||
                      (navigator.userAgent.includes('Android') && !navigator.userAgent.includes('Chrome/'));
    const isMobile  = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isPC      = !isMobile;

    // Load bible-data + tamil — always needed
    const [bd,tb]=await Promise.allSettled([
      fetchT(C.data+'bible-data.json').then(r=>r.json()),
      fetchT(C.data+'tamil-bible.json').then(r=>r.json()),
    ]);
    if(bd.status==='fulfilled'&&bd.value)S.bibleData=bd.value;
    if(tb.status==='fulfilled'&&tb.value){
      S.tamilDB=tb.value;
    }

    // English KJV (4.1MB) — load only on PC at startup
    // On mobile/app: lazy-load when user first taps EN button
    if(isPC){
      fetchT(C.EN_LOCAL).then(r=>r.json()).then(en=>{
        S.enDB=en;
      }).catch(()=>{});
    }

    // Full Tamil (13MB) — load only on PC, background
    if(isPC){
      fetchT(C.data+'tamil_full.json').then(r=>r.json()).then(tf=>{
        S.tamilDB=tf;
      }).catch(()=>{});
    }
  }catch(e){}
  loadVOTD();
  initIGVerses();
}

// ── VOTD ─────────────────────────────────────────────────────────
function loadVOTD(){
  let pool=VOTD;
  try{
    const remote=S.bibleData?.verseOfDay;
    if(Array.isArray(remote)&&remote.length&&remote[0].ta)pool=remote;
  }catch(e){}
  const v=pool[new Date().getDay()%pool.length];
  if(!v)return;
  window._vd=v;
  safe('votd-ta','\u201c'+(v.ta||'')+'  \u201d');
  safe('votd-taref','\u2014 '+(v.tref||''));
  safe('votd-en','\u201c'+(v.en||v.text||'')+'\u201d');
  safe('votd-enref','\u2014 '+(v.ref||''));
}

function playVOTD(lang){
  const v=window._vd;if(!v)return;
  speak(lang==='ta'?(v.ta||v.en):(v.en||v.text||v.ta),lang);
}
function copyVOTD(){
  const v=window._vd;if(!v)return;
  navigator.clipboard?.writeText((v.tref||v.ref)+' \u2014 '+(v.ta||v.en));
  toast('\uD83D\uDCCB நகலெடுக்கப்பட்டது!');
}
function shareVOTD(){
  const v=window._vd;if(!v)return;
  const msg=(v.tref||v.ref)+'\n'+(v.ta||'')+'\n'+(v.ref||'')+'\n'+(v.en||'')+'\n\nhttps://elimnewjerusalem.github.io/enjc-bible/bible.html';
  if(navigator.share)navigator.share({title:'ENJC Verse',text:msg});
  else{navigator.clipboard?.writeText(msg);toast('நகலெடுக்கப்பட்டது!');}
}
function useVOTDForImg(){
  const v=window._vd;if(!v)return;
  S.customVerse={ta:v.ta,tref:v.tref,en:v.en||v.text,ref:v.ref};
  drawIG();
}
function reqNotify(){
  if(!('Notification'in window)){toast('Notifications not supported');return;}
  if(Notification.permission==='granted'){toast('Notifications already enabled!');return;}
  Notification.requestPermission().then(p=>{
    if(p==='granted'){toast('\uD83D\uDD14 Daily verse notifications enabled!');sched();}
    else toast('Notifications denied');
  });
}
function sched(){
  const KEY='enjc_notif_last';
  function chk(){
    const now=new Date(),today=now.toDateString(),last=localStorage.getItem(KEY);
    if(now.getHours()>=7&&last!==today&&Notification.permission==='granted'){
      localStorage.setItem(KEY,today);
      const v=VOTD[now.getDay()%VOTD.length];
      new Notification('ENJC Bible'+(v.tref?' - '+v.tref:''),{body:(v.ta||v.en).substring(0,100),icon:'images/logo/logo.png',tag:'enjc-votd'});
    }
  }
  chk();setInterval(chk,3600000);
}
if(localStorage.getItem('enjc_push')==='1'&&Notification.permission==='granted')sched();

// ── LANGUAGE ─────────────────────────────────────────────────────
function setLang(l){
  S.lang=l;
  g('btn-ta').classList.toggle('on',l==='ta');
  g('btn-en').classList.toggle('on',l==='en');
  stopAud();
  // Lazy-load English KJV on mobile when user first taps EN
  if(l==='en' && !Object.keys(S.enDB).length){
    toast('📖 English Bible loading...');
    fetchT(C.EN_LOCAL).then(r=>r.json()).then(en=>{
      if(en){
        S.enDB=en;
        if(S.book)loadCh();
      }
    }).catch(()=>{
      toast('⚠ English Bible load failed — check internet');
    });
    return; // loadCh called after EN loads
  }
  if(S.book)loadCh();
}

// ── VERSION SELECTOR (11 versions: தமிழ் OV/BL98/IRV + 8 English) ─
function renderVersionChips(){
  const sel=g('ver-sel');if(!sel)return;
  const taVers=VERSIONS.filter(v=>v.lang==='ta');
  const enVers=VERSIONS.filter(v=>v.lang==='en');
  const opt=v=>`<option value="${v.id}"${v.id===S.ver?' selected':''}>${v.label}</option>`;
  sel.innerHTML=
    '<optgroup label="தமிழ்">'+taVers.map(opt).join('')+'</optgroup>'+
    '<optgroup label="English">'+enVers.map(opt).join('')+'</optgroup>';
}

function syncVersionUI(){
  const sel=g('ver-sel');
  if(sel)sel.value=S.ver;
  const v=getVer(S.ver);
  if(!v)return;
  const bta=g('btn-ta'),ben=g('btn-en');
  if(bta)bta.classList.toggle('on',v.lang==='ta');
  if(ben)ben.classList.toggle('on',v.lang==='en');
}

function setVersion(verId){
  const v=getVer(verId);if(!v)return;
  S.ver=verId;S.lang=v.lang;
  try{localStorage.setItem('enjc_ver',verId);}catch(e){}
  syncVersionUI();
  stopAud();
  if(v.lang==='en'&&v.code==='kjv'&&!Object.keys(S.enDB).length){
    toast('📖 English Bible loading...');
    fetchT(C.EN_LOCAL).then(r=>r.json()).then(en=>{
      if(en){S.enDB=en;if(S.book)loadCh();}
    }).catch(()=>toast('⚠ English Bible load failed — check internet'));
    return;
  }
  if(S.book)loadCh();
}

function togParallel(){
  S.showParallel=!S.showParallel;
  const btn=g('para-btn');
  if(btn){
    btn.textContent=S.showParallel?'On ✓':'Off';
    btn.classList.toggle('on',S.showParallel);
  }
  const chk=g('para-chk');
  if(chk)chk.checked=S.showParallel;
  const st=g('para-state');
  if(st)st.textContent=S.showParallel?'On':'Off';
  const wrap=g('para-chk')?.closest('.bv-parallel');
  if(wrap)wrap.classList.toggle('on',S.showParallel);
  if(S.verses.length)renderVerses();
}
// Checkbox in the new console UI calls this directly via onchange="togParallelNew()"


// ── BOOKS ────────────────────────────────────────────────────────
function populateBooks(){
  const sel=g('book-sel');let lt='';
  BOOKS.forEach(b=>{
    if(b.t!==lt){
      const og=document.createElement('optgroup');
      og.label=b.t==='OT'?'பழைய ஏற்பாடு':'புதிய ஏற்பாடு';
      sel.appendChild(og);lt=b.t;
    }
    const o=document.createElement('option');
    o.value=b.id;o.textContent=b.ta+' ('+b.name+')';
    sel.lastElementChild.appendChild(o);
  });
}

function onBook(){
  const id=g('book-sel').value;if(!id)return;
  const bk=BOOKS.find(b=>b.id===id);if(!bk)return;
  S.book=id;S.bookName=bk.name;S.bookTaName=bk.ta;S.bookNum=bk.n;
  S.totalCh=bk.ch;S.ch=1;
  const cs=g('ch-sel');cs.innerHTML='';cs.disabled=false;
  for(let i=1;i<=bk.ch;i++){
    const o=document.createElement('option');o.value=i;
    o.textContent='அதிகாரம் '+i+' (Chapter '+i+')';
    cs.appendChild(o);
  }
  g('gobtn').style.display='none';
  loadCh();
}

function onCh(){S.ch=parseInt(g('ch-sel').value)||1;loadCh();}

// ── LOAD CHAPTER ─────────────────────────────────────────────────
async function loadCh(){
  if(!S.book)return;
  stopAud();
  g('bcontent').innerHTML='<div class="bload"><div class="bspin"></div><p>'+(S.lang==='ta'?'வேதாகமம் ஏற்றுகிறது...':'Loading...')+'</p></div>';
  try{
    const [taR,enR]=await Promise.allSettled([loadTA(),loadEN()]);
    S.taVerses=taR.status==='fulfilled'?taR.value:[];
    S.enVerses=enR.status==='fulfilled'?enR.value:[];
    S.verses=S.lang==='ta'?S.taVerses:S.enVerses;
    if(!S.verses.length&&S.lang==='ta'&&S.enVerses.length){
      S.verses=S.enVerses;toast('Tamil இல்லை — English காட்டுகிறோம்');
    }
    if(!S.verses.length)throw new Error('வசனங்கள் கிடைக்கவில்லை. Internet சரிபாருங்கள்.');
    renderVerses();
    updateChUI();
    markRead();
  }catch(e){
    g('bcontent').innerHTML='<div class="berr">⚠ '+e.message+'</div>';
  }
}

// ── B3: Lazy-load tamil_full.json on mobile on first Tamil request ──
let _tamilFullLoading=false,_tamilFullLoaded=false;
async function ensureTamilFull(){
  if(_tamilFullLoaded||_tamilFullLoading)return;
  const mob=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if(!mob)return;
  _tamilFullLoading=true;
  toast('⏳ பைபிள் ஏற்றுகிறது...');
  try{
    const r=await fetch(C.data+'tamil_full.json');
    if(r.ok){
      const tf=await r.json();
      if(tf&&Object.keys(tf).length){S.tamilDB=Object.assign({},S.tamilDB,tf);_tamilFullLoaded=true;toast('✅ தமிழ் தயார்!');}
    }
  }catch(e){}
  _tamilFullLoading=false;
}

// ── B4: 8-second timeout per API request ─────────────────────────
async function fetchWithTimeout(url,ms=8000){
  const ctrl=new AbortController();
  const tid=setTimeout(()=>ctrl.abort(),ms);
  try{const r=await fetch(url,{signal:ctrl.signal});clearTimeout(tid);return r;}
  catch(e){clearTimeout(tid);throw e;}
}

// ── BOLLS.LIFE generic fetch (Tamil OV/BL98/IRV + modern English) ─
async function fetchBolls(bcode, bookNum, ch){
  const ck='enjc_bolls_'+bcode+'_'+bookNum+'_'+ch;
  try{const c=localStorage.getItem(ck);if(c){const p=JSON.parse(c);if(p?.length)return p;}}catch(e){}
  const url=C.bollsText+bcode+'/'+bookNum+'/'+ch+'/';
  const r=await fetchWithTimeout(url,8000);
  if(!r.ok)throw new Error('bolls '+bcode+' http '+r.status);
  const d=await r.json();
  let vv=[];
  if(Array.isArray(d)&&d.length){
    if(d[0]?.verse!==undefined)vv=d.map(v=>({num:v.verse,text:(v.text||'').replace(/<[^>]+>/g,'')}));
    else if(Array.isArray(d[0]))vv=d.map(v=>({num:v[0],text:v[1]}));
  }
  if(!vv.length)throw new Error('bolls '+bcode+' empty');
  try{localStorage.setItem(ck,JSON.stringify(vv));}catch(e){}
  return vv;
}

async function loadTA(){
  const key=S.bookNum+'_'+S.ch;
  const vCfg=getVer(S.ver)||{};
  const verCode=vCfg.lang==='ta'?vCfg.code:'ov';
  const ck='enjc_ta_'+verCode+'_'+key;

  // ── IRV Tamil — bolls.life only, no local/legacy fallback chain ──
  if(verCode==='irvta'){
    try{const c=localStorage.getItem(ck);if(c){const p=JSON.parse(c);if(p?.length)return p;}}catch(e){}
    try{
      const vv=await fetchBolls('IRVTam',S.bookNum,S.ch);
      try{localStorage.setItem(ck,JSON.stringify(vv));}catch(e){}
      return vv;
    }catch(e){
      const bc=document.getElementById('bcontent');
      if(bc)bc.innerHTML=`<div style="text-align:center;padding:40px 16px">
        <div style="font-size:36px;margin-bottom:12px">📶</div>
        <div style="font-size:14px;color:var(--tx2);margin-bottom:6px">${S.bookTaName||''} ${S.ch} — IRV தமிழ் கிடைக்கவில்லை</div>
        <div style="font-size:12px;color:var(--tx3);margin-bottom:16px">இணைய இணைப்பு சரிபாருங்கள்</div>
        <button onclick="loadCh()" style="background:var(--gd,#c9a84c);border:none;border-radius:8px;padding:10px 24px;font-size:13px;font-weight:700;color:#07090f;cursor:pointer">🔄 மீண்டும் முயற்சி</button>
      </div>`;
      throw new Error('IRV Tamil offline: '+key);
    }
  }

  // ── 1. Embedded local DB (OV only — bundled offline dataset) ───
  if(verCode==='ov'){
    if(!_tamilFullLoaded&&!_tamilFullLoading)await ensureTamilFull();
    if(S.tamilDB[key]){
      const vv=S.tamilDB[key].map(v=>({num:v[0],text:v[1]}));
      try{if(!localStorage.getItem(ck))localStorage.setItem(ck,JSON.stringify(vv));}catch(e){}
      return vv;
    }
  }

  // ── 2. B2: localStorage cache (per version) ───────────────────
  try{const c=localStorage.getItem(ck);if(c){const p=JSON.parse(c);if(p?.length)return p;}}catch(e){}

  // ── 3. APIs with timeout — try selected version first ─────────
  const apis=verCode==='bl98'
    ? [C.taAPI2+S.bookNum+'/'+S.ch+'/', C.taAPI1+S.bookNum+'/'+S.ch+'/', C.taAPI3+S.bookNum+'/'+S.ch+'.json']
    : [C.taAPI1+S.bookNum+'/'+S.ch+'/', C.taAPI2+S.bookNum+'/'+S.ch+'/', C.taAPI3+S.bookNum+'/'+S.ch+'.json'];
  for(const url of apis){
    try{
      const r=await fetchWithTimeout(url,8000);if(!r.ok)continue;
      const d=await r.json();
      let vv=null;
      if(Array.isArray(d)&&d.length){
        if(d[0]?.verse!==undefined)vv=d.map(v=>({num:v.verse,text:v.text}));
        else if(Array.isArray(d[0]))vv=d.map(v=>({num:v[0],text:v[1]}));
      }else if(d.verses?.length){vv=d.verses.map(v=>({num:v.verse_nr,text:v.verse}));}
      if(vv?.length){
        try{localStorage.setItem(ck,JSON.stringify(vv));}catch(e){}
        return vv;
      }
    }catch(e){continue;}
  }
  // B4: show retry UI
  const bc=document.getElementById('bcontent');
  if(bc)bc.innerHTML=`<div style="text-align:center;padding:40px 16px">
    <div style="font-size:36px;margin-bottom:12px">📶</div>
    <div style="font-size:14px;color:var(--tx2);margin-bottom:6px">${S.bookTaName||''} ${S.ch} — தமிழ் கிடைக்கவில்லை</div>
    <div style="font-size:12px;color:var(--tx3);margin-bottom:16px">இணைய இணைப்பு சரிபாருங்கள்</div>
    <button onclick="loadCh()" style="background:var(--gd,#c9a84c);border:none;border-radius:8px;padding:10px 24px;font-size:13px;font-weight:700;color:#07090f;cursor:pointer">🔄 மீண்டும் முயற்சி</button>
  </div>`;
  throw new Error('Tamil offline: '+key);
}

async function loadEN(){
  const vCfg=getVer(S.ver)||{};
  const verCode=vCfg.lang==='en'?vCfg.code:'kjv';

  // ── 1. Local KJV JSON (instant, no network) — KJV only ────────
  if(verCode==='kjv'){
    const localBook = S.enDB[S.bookNum];
    if(localBook){
      const localCh = localBook[S.ch];
      if(localCh && localCh.length){
        return localCh.map((text,i)=>({num:i+1, text: text||''}));
      }
    }
  }
  // ── 2. Modern translations (AMP/ASV/NKJV/NASB/ERV) via bolls.life ─
  if(vCfg.src==='bolls'){
    try{
      return await fetchBolls(vCfg.bcode,S.bookNum,S.ch);
    }catch(e){
      // fall through to bible-api KJV as last resort below
    }
  }
  // ── 3. Fallback / public-domain versions: bible-api.com (cached) ─
  const enCode=(verCode==='web'||verCode==='bbe')?verCode:'kjv';
  const ck='enjc_en_'+enCode+'_'+S.bookNum+'_'+S.ch;
  try{
    const cached=localStorage.getItem(ck);
    if(cached){const p=JSON.parse(cached);if(p?.length)return p;}
  }catch(e){}
  const r=await fetchT(C.enAPI+S.book+'+'+S.ch+'?translation='+enCode);
  const d=await r.json();
  if(d.error)throw new Error(d.error);
  const vv=(d.verses||[]).map(v=>({num:v.verse,text:v.text.trim().replace(/\n/g,' ')}));
  try{localStorage.setItem(ck,JSON.stringify(vv));}catch(e){}
  return vv;
}

// ── RENDER ───────────────────────────────────────────────────────
function renderVerses(){
  const isTa=S.lang==='ta';
  const hlk=S.book+S.ch;const hlm=S.hl[hlk]||{};
  const enMap={};
  if(S.showParallel)S.enVerses.forEach(v=>enMap[v.num]=v.text);
  const html=S.verses.map((v,i)=>{
    const refEN=S.bookName+' '+S.ch+':'+v.num;
    const refTA=(S.bookTaName||S.bookName)+' '+S.ch+':'+v.num;
    const isBm=S.bm.some(b=>b.ref===refEN);
    const isHl=!!hlm[v.num];
    const note=S.notes[refEN];
    const ta=v.text.replace(/'/g,"\\'");
    const en=(enMap[v.num]||'').replace(/'/g,"\\'");
    const rE=refEN.replace(/'/g,"\\'");
    const rT=refTA.replace(/'/g,"\\'");
    return `<div class="vi${isHl?' vhl':''}${isTa?' vi-ta':''}" id="vi${i}"
      style="${isHl?'--hl-color:'+(hlm[v.num]||S.hlColor)+';':''}"
      onclick="openVModal(${i})">
      <span class="vn mob-hide-vn" onclick="playV(${i});event.stopPropagation()">${v.num}</span>
      <div class="vb">
        <span class="vtxt${isTa?' ta-font':''}" style="font-size:${S.fs}px">${v.text}</span>
        ${S.showParallel&&enMap[v.num]?`<span class="v-en-para">${enMap[v.num]}</span>`:''}
        ${note?`<span class="vnote-preview">📝 ${note.substring(0,60)}${note.length>60?'...':''}</span>`:''}
      </div>
      <div class="vacts">
        <button class="vact" onclick="playV(${i});event.stopPropagation()" title="Play">▶</button>
        <button class="vact${isHl?' hl-on':''}" onclick="togHL(${v.num},${i});event.stopPropagation()" title="Highlight">●</button>
        <button class="vact${isBm?' bm-on':''}" id="bmbtn${i}" onclick="togBM('${rE}','${ta}','${rT}',${i});event.stopPropagation()" title="Save">♥</button>
        <button class="vact" onclick="cpV('${rE}','${ta}');event.stopPropagation()" title="Copy">📋</button>
        <button class="vact" onclick="shrV('${rE}','${ta}','${rT}');event.stopPropagation()" title="Share">🔗</button>
      </div>
    </div>`;
  }).join('');
  g('bcontent').innerHTML='<div class="vlist">'+html+'</div>';
}

function updateChUI(){
  const taName=S.bookTaName||S.bookName;
  g('chbar').style.display='flex';
  safe('chtitle',taName+' \u2014 அதிகாரம் '+S.ch);
  safe('chsub',S.bookName+' Chapter '+S.ch);
  g('prevb').disabled=S.ch<=1;
  g('nextb').disabled=S.ch>=S.totalCh;
  g('ch-sel').value=S.ch;
  g('abar').style.display='flex';
  safe('apstat','வசனத்தை தொட்டு கேளுங்கள்');
  g('chprogf').style.width='0%';
  // Auto-populate image gen verse
  igAutoPopulate();

  updateBMChapterBtn();
}

function prevCh(){if(S.ch>1){S.ch--;g('ch-sel').value=S.ch;loadCh();}}
function nextCh(){if(S.ch<S.totalCh){S.ch++;g('ch-sel').value=S.ch;loadCh();}}

// ── AUDIO ────────────────────────────────────────────────────────
const synth=window.speechSynthesis;

function unlockAudio(){
  if(S._unlocked)return;S._unlocked=true;
  try{
    const ctx=new(window.AudioContext||window.webkitAudioContext)();
    const buf=ctx.createBuffer(1,1,22050);
    const src=ctx.createBufferSource();
    src.buffer=buf;src.connect(ctx.destination);src.start(0);
    ctx.resume().then(()=>ctx.close());
  }catch(e){}
  try{const u=new SpeechSynthesisUtterance('');u.volume=0;synth.speak(u);}catch(e){}
}

function initVoices(){
  function tryLoad(n){
    if(synth.getVoices().length){S._voicesReady=true;return;}
    if(n>0)setTimeout(()=>tryLoad(n-1),300);
  }
  if(synth.onvoiceschanged!==undefined)synth.onvoiceschanged=()=>{synth.getVoices();S._voicesReady=true;};
  tryLoad(15);
}

function getTaVoice(){
  const vv=synth.getVoices();
  return vv.find(v=>v.lang==='ta-IN'||v.lang==='ta'||v.name.toLowerCase().includes('tamil'))||null;
}
function getEnVoice(){
  const vv=synth.getVoices();
  return vv.find(v=>v.lang==='en-GB')||vv.find(v=>v.lang==='en-US')||vv.find(v=>v.lang.startsWith('en'))||vv[0]||null;
}

// ── MAIN SPEAK FUNCTION ──────────────────────────────────────────
function speak(text,lang,cb){
  unlockAudio();
  // Stop previous audio without resetting playAllM
  if(S.audEl){S.audEl.pause();S.audEl.currentTime=0;S.audEl=null;}
  try{
    if(typeof responsiveVoice!=='undefined')responsiveVoice.cancel();
    synth.cancel();
  }catch(e){}
  S.playing=true;updPBtn();
  const apst=g('apstat');
  if(apst)apst.textContent=lang==='ta'?'ஒலி தயாரிக்கிறது...':'Preparing...';
  g('abar').style.display='flex';

  const lg=lang||S.lang;
  const spd=parseFloat(g('aspd')?.value||'1');

  // Timeout fallback — estimate: ~55ms/char + 3s buffer
  let _done=false;
  const estMs=Math.max(2500,text.length*55)+3000;
  const fallback=setTimeout(()=>{
    if(!_done&&S.playAllM){_done=true;S.playing=false;updPBtn();if(cb)cb();}
  },estMs);
  function done(){
    if(_done)return;_done=true;
    clearTimeout(fallback);
    S.playing=false;updPBtn();
    if(cb)cb();
  }

  setTimeout(async()=>{
    try{
      // FCBH real human audio
      if(FCBH_KEY){
        const url=await tryFCBH(S.bookNum,S.ch,lg);
        if(url){
          S.audEl=new Audio(url);S.audEl.playbackRate=spd;
          S.audEl.onplay=()=>{S.playing=true;updPBtn();if(apst)apst.textContent='Playing...';};
          S.audEl.onended=done;
          S.audEl.onerror=()=>useRV(text,lg,spd,done);
          await S.audEl.play();S.playing=true;updPBtn();return;
        }
      }

      // ResponsiveVoice — use for Tamil always (best cross-platform Tamil TTS)
      // Use for English on mobile too
      if(typeof responsiveVoice!=='undefined'){
        if(!responsiveVoice.voiceSupport()){
          await new Promise(res=>setTimeout(res,800));
        }
      }
      if(typeof responsiveVoice!=='undefined'&&responsiveVoice.voiceSupport()){
        const voice=lg==='ta'?'Tamil Female':(navigator.userAgent.includes('Chrome')?'UK English Male':'UK English Female');
        if(apst)apst.textContent=lg==='ta'?'இயங்குகிறது...':'Playing...';
        responsiveVoice.speak(text,voice,{
          rate:spd,pitch:1,volume:1,
          onstart:()=>{S.playing=true;updPBtn();},
          onend:done,
          onerror:()=>{
            // RV error — may be rate limited (FREE key)
            const apst=g('apstat');
            useTTS(text,lg,spd,(result)=>{
              // If TTS also fails, show friendly message
              if(!S.playing&&apst&&apst.textContent==='நிறுத்தப்பட்டது'){
                apst.textContent=lg==='ta'?'Audio limit — சற்று நேரம் பிறகு முயற்சிக்கவும்':'Audio unavailable — try again later';
              }
              done(result);
            });
          }
        });
        return;
      }

      // Web Speech API — fallback when ResponsiveVoice not available
      if(typeof SpeechSynthesisUtterance!=='undefined'&&window.speechSynthesis){
        // Wait for voices to load (important on PC)
        let voices=window.speechSynthesis.getVoices();
        if(!voices.length){
          await new Promise(res=>{
            if(window.speechSynthesis.onvoiceschanged!==undefined){
              window.speechSynthesis.onvoiceschanged=()=>{res();};
            }else setTimeout(res,500);
          });
          voices=window.speechSynthesis.getVoices();
        }
        const taVoice=voices.find(v=>v.lang==='ta-IN'||v.lang==='ta'||v.name.toLowerCase().includes('tamil'));
        const enVoice=voices.find(v=>v.lang==='en-GB')||voices.find(v=>v.lang==='en-IN')||voices.find(v=>v.lang.startsWith('en'));
        const targetVoice=lg==='ta'?taVoice:enVoice;

        // Use Web Speech for English on PC, or as last resort

        const utt=new SpeechSynthesisUtterance(text);
        if(targetVoice){utt.voice=targetVoice;utt.lang=targetVoice.lang;}
        else{utt.lang=lg==='ta'?'ta-IN':'en-GB';}
        utt.rate=Math.min(spd||1, 0.9); // slightly slower for Tamil clarity
        utt.pitch=1;

        // Android Chrome bug: onend fires early for long text
        // Fix: use boundary events to track real completion
        let _lastCharIdx=0;
        utt.onboundary=e=>{if(e.charIndex)_lastCharIdx=e.charIndex;};
        utt.onstart=()=>{S.playing=true;updPBtn();if(apst)apst.textContent='Playing...';};
        utt.onend=()=>{
          // Check if we actually finished (charIndex near text end)
          const finished=_lastCharIdx>=(text.length-10)||_lastCharIdx===0;
          if(finished){done();}
          else{
            // Resume from where it stopped — Android early-end bug
            const remaining=text.substring(_lastCharIdx);
            if(remaining.trim().length>5){
              const utt2=new SpeechSynthesisUtterance(remaining);
              if(targetVoice)utt2.voice=targetVoice;
              utt2.lang=utt.lang;utt2.rate=utt.rate;utt2.pitch=1;
              utt2.onend=done;utt2.onerror=done;
              window.speechSynthesis.speak(utt2);
            }else done();
          }
        };
        utt.onerror=(e)=>{
          if(e.error==='interrupted')return;
          useRV(text,lg,spd,done);
        };
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utt);
        S.playing=true;updPBtn();
        S.audSynth=utt;

        // Android keep-alive: speechSynthesis pauses after ~15s
        if(S._keepAlive){clearInterval(S._keepAlive);S._keepAlive=null;}
        S._keepAlive=setInterval(()=>{
          if(!window.speechSynthesis.speaking){clearInterval(S._keepAlive);return;}
          window.speechSynthesis.resume();
        },10000);
        return;
      }

      // Final fallback
      useTTS(text,lg,spd,done);
    }catch(e){useTTS(text,lg,spd,done);}
  },50);
}

function useRV(text,lang,spd,cb){
  if(typeof responsiveVoice!=='undefined'&&responsiveVoice.voiceSupport()){
    const v=lang==='ta'?'Tamil Female':'UK English Male';
    responsiveVoice.speak(text,v,{rate:spd,pitch:1,volume:1,onend:cb,onerror:()=>useTTS(text,lang,spd,cb)});
  }else useTTS(text,lang,spd,cb);
}

function useTTS(text,lang,spd,cb){
  const u=new SpeechSynthesisUtterance(text);
  u.rate=spd;u.volume=1;u.pitch=1;
  if(lang==='ta'){const tv=getTaVoice();if(tv){u.voice=tv;u.lang=tv.lang;}else u.lang='ta-IN';}
  else{const ev=getEnVoice();if(ev){u.voice=ev;u.lang=ev.lang;}else u.lang='en-GB';}
  u.onstart=()=>{S.playing=true;updPBtn();};
  u.onend=cb;
  u.onerror=(e)=>{if(e.error!=='interrupted'&&cb)cb();};
  synth.speak(u);
}

async function tryFCBH(bookNum,ch,lang){
  if(!FCBH_KEY)return null;
  try{
    const codes=['GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI','1CH','2CH','EZR','NEH','EST','JOB','PSA','PRO','ECC','SNG','ISA','JER','LAM','EZK','DAN','HOS','JOL','AMO','OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL','MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL','EPH','PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS','1PE','2PE','1JN','2JN','3JN','JUD','REV'];
    const bk=codes[bookNum-1];if(!bk)return null;
    const fs=lang==='ta'?FCBH_TA:FCBH_EN;
    const r=await fetch(`https://4.dbt.io/api/bibles/filesets/${fs}/${bk}/${ch}?v=4&key=${FCBH_KEY}`);
    if(!r.ok)return null;
    const d=await r.json();
    return d.data?.[0]?.path||null;
  }catch(e){return null;}
}

function playV(i){
  unlockAudio();
  S.playAllM=false;S.pIdx=i;
  const v=S.verses[i];if(!v)return;
  hlPlay(i);
  const taName=S.bookTaName||S.bookName;
  g('abar').style.display='flex';
  safe('aptitle',(S.lang==='ta'?taName:S.bookName)+' '+S.ch+':'+v.num);
  safe('apstat','வசனம் '+v.num+' இயங்குகிறது...');
  speak(v.text,S.lang);
}

function playAll(){
  if(!S.verses.length)return;
  S.playAllM=true;S.pIdx=0;
  g('abar').style.display='flex';
  seqPlay();
}

function seqPlay(){
  if(!S.playAllM||S.pIdx>=S.verses.length){
    S.playAllM=false;S.playing=false;updPBtn();
    safe('apstat','முடிந்தது ✓');
    return;
  }
  const v=S.verses[S.pIdx];
  hlPlay(S.pIdx);
  const pct2=Math.round((S.pIdx+1)/S.verses.length*100);
  safe('apstat',(S.lang==='ta'?'வசனம் ':'Verse ')+v.num+' / '+S.verses.length+' · '+pct2+'%');
  g('vi'+S.pIdx)?.scrollIntoView({behavior:'smooth',block:'center'});
  speak(v.text,S.lang,()=>{
    if(S.playAllM){S.pIdx++;seqPlay();}
  });
}

function hlPlay(i){
  document.querySelectorAll('.vi').forEach(el=>el.classList.remove('vplay'));
  g('vi'+i)?.classList.add('vplay');
  if(S.verses.length){
    const pct=Math.round((i+1)/S.verses.length*100);
    g('chprogf').style.width=pct+'%';
  }
}

function togPlay(){
  if(S.audEl&&!S.audEl.paused){S.audEl.pause();S.playing=false;updPBtn();}
  else if(S.audEl&&S.audEl.paused){S.audEl.play();S.playing=true;updPBtn();}
  else if(synth.speaking&&!synth.paused){synth.pause();S.playing=false;updPBtn();safe('apstat','இடைநிறுத்தம்');}
  else if(synth.paused){synth.resume();S.playing=true;updPBtn();}
  else if(S.verses.length)playAll();
}

function stopAud(){
  try{if(typeof responsiveVoice!=='undefined')responsiveVoice.cancel();}catch(e){}
  if(S.audEl){S.audEl.pause();S.audEl.currentTime=0;S.audEl=null;}
  if(S._keepAlive){clearInterval(S._keepAlive);S._keepAlive=null;}
  if(S.audSynth){try{synth.cancel();}catch(e){} S.audSynth=null;}
  synth.cancel();
  S.playing=false;S.playAllM=false;updPBtn();
  document.querySelectorAll('.vi').forEach(el=>el.classList.remove('vplay'));
  safe('apstat','நிறுத்தப்பட்டது');
}

function updPBtn(){
  const pl=g('plic'),pu=g('puic');
  if(pl)pl.style.display=S.playing?'none':'inline';
  if(pu)pu.style.display=S.playing?'inline':'none';
  document.body.classList.toggle('audio-playing',!!S.playing);
}

function chSpd(){
  const spd=parseFloat(g('aspd').value)||1;
  if(S.audEl)S.audEl.playbackRate=spd;
}

// ── VERSE ACTIONS ────────────────────────────────────────────────
function cpV(ref,text){
  navigator.clipboard?.writeText(ref+' \u2014 '+text);
  toast('\uD83D\uDCCB Copied! '+ref);
}
function shrV(refEN,text,refTA){
  const msg=(S.lang==='ta'?(refTA||refEN):refEN)+'\n'+text+'\n\nhttps://elimnewjerusalem.github.io/enjc-bible/bible.html';
  if(navigator.share)navigator.share({title:'ENJC Bible',text:msg});
  else{navigator.clipboard?.writeText(msg);toast('Copied!');}
}

// ── HIGHLIGHT ────────────────────────────────────────────────────
function togHL(vnum,i){
  const k=S.book+S.ch;if(!S.hl[k])S.hl[k]={};
  const el=g('vi'+i);
  if(S.hl[k][vnum]){
    delete S.hl[k][vnum];
    el?.classList.remove('vhl');
    el?.style.removeProperty('--hl-color');
    el?.querySelectorAll('.vact')[1]?.classList.remove('hl-on');
    toast('Highlight நீக்கப்பட்டது');
  }else{
    S.hl[k][vnum]=S.hlColor;
    el?.classList.add('vhl');
    el?.style.setProperty('--hl-color',S.hlColor);
    el?.querySelectorAll('.vact')[1]?.classList.add('hl-on');
    toast('\u25CF Highlighted');
  }
  localStorage.setItem('enjc_hl',JSON.stringify(S.hl));
}

function setHlColor(color){
  S.hlColor=color;
  document.querySelectorAll('.hldot').forEach(el=>{
    const on=el.dataset.color===color;
    el.classList.toggle('on',on);
    el.style.borderColor=on?'white':'transparent';
  });
  toast('\u25CF Highlight colour set');
}

// ── BOOKMARKS ────────────────────────────────────────────────────
function getBM(){return JSON.parse(localStorage.getItem('enjc_bm')||'[]');}
function saveBM(bms){localStorage.setItem('enjc_bm',JSON.stringify(bms));S.bm=bms;}

function togBM(refEN,text,refTA,i){
  const bms=S.bm;const fi=bms.findIndex(b=>b.ref===refEN);
  const btn=g('bmbtn'+i);
  if(fi>=0){bms.splice(fi,1);btn?.classList.remove('bm-on');toast('Removed');}
  else{bms.unshift({ref:refEN,refTA,text});btn?.classList.add('bm-on');toast('\u2665 சேமிக்கப்பட்டது!');}
  saveBM(bms);updateBmBadge();
}
function updateBmBadge(){
  const n=S.bm.length;
  const el=g('bm-lbl');if(el)el.textContent=n?'Saved ('+n+')':'Saved';
}
function rmBM(i){const bms=S.bm;bms.splice(i,1);saveBM(bms);updateBmBadge();openPanel('bm');}


// ── BOOKMARK CHAPTER ─────────────────────────────────────────────
function togBMChapter(){
  if(!S.book) return;
  const bk = BOOKS.find(b => b.id === S.book);
  if(!bk) return;
  const key = 'bmc_' + S.book + '_' + S.ch;
  const bms = S.bm;
  const already = bms.findIndex(b => b.refEN === key);
  if(already >= 0){
    bms.splice(already, 1);
    saveBM(bms);
    toast('🔖 Chapter bookmark removed');
    if(g('bmchbtn')) g('bmchbtn').style.color = '';
  } else {
    const label = (S.lang==='ta' ? bk.ta : bk.name) + ' ' + S.ch + ' (full chapter)';
    bms.unshift({ refEN: key, text: label, refTA: label, isChapter: true });
    saveBM(bms);
    toast('🔖 Chapter saved!');
    if(g('bmchbtn')) g('bmchbtn').style.color = 'var(--gd)';
  }
  updateBmBadge();
}

function updateBMChapterBtn(){
  if(!S.book || !g('bmchbtn')) return;
  const key = 'bmc_' + S.book + '_' + S.ch;
  const bms = S.bm;
  const saved = bms.some(b => b.refEN === key);
  g('bmchbtn').style.color = saved ? 'var(--gd)' : '';
}

// ── FONT SIZE ─────────────────────────────────────────────────────
function chFont(d){
  S.fs=d===0?17:Math.min(28,Math.max(13,S.fs+d*2));
  localStorage.setItem('enjc_fs',S.fs);
  safe('fszv',S.fs+'px');
  document.querySelectorAll('.vtxt').forEach(el=>el.style.fontSize=S.fs+'px');
}

// ── SEARCH ───────────────────────────────────────────────────────
async function doSearch(){
  const q=g('sinp').value.trim();if(!q)return;
  // Hint if no chapter loaded yet
  if(!S.book){toast('முதலில் ஒரு புத்தகம் தேர்ந்தெடுங்கள் — Select a book first');return;}
  stopAud();
  g('chbar').style.display='none';
  g('bcontent').innerHTML='<div class="bload"><div class="bspin"></div><p>தேடுகிறது...</p></div>';
  try{
    const r=await fetchT(C.enAPI+encodeURIComponent(q)+'?translation=kjv');
    const d=await r.json();if(d.error)throw new Error(d.error);
    const vv=d.verses||[];
    g('bcontent').innerHTML='<p style="color:var(--tx3);font-size:12px;padding:12px 20px">"'+q+'" — '+vv.length+' results</p><div class="vlist">'+
      vv.map(v=>{
        const ref=v.book_name+' '+v.chapter+':'+v.verse;
        const txt=v.text.replace(/\n/g,' ');
        const sr=ref.replace(/'/g,"\\'");const st=txt.replace(/'/g,"\\'");
        return `<div class="vi"><span class="vn">★</span><div class="vb"><div style="font-size:10px;color:var(--gd);margin-bottom:3px">${ref}</div><span class="vtxt">${txt}</span></div><div class="vacts" style="opacity:1"><button class="vact" onclick="cpV('${sr}','${st}')">📋</button></div></div>`;
      }).join('')+'</div>';
  }catch(e){g('bcontent').innerHTML='<div class="berr">முடிவு இல்லை "'+q+'"</div>';}
}

// ── PANEL ─────────────────────────────────────────────────────────
const PANEL_TITLES={bm:'♥ Saved',quiz:'Bible Quiz',compare:'⇄ Compare Versions',notes:'📝 My Notes',img:'Verse Image',daily:'📅 Daily Bible Read'};

function openPanel(id){
  // Highlight button
  document.querySelectorAll('.feat-btn').forEach(b=>b.classList.remove('on'));
  const fb=g('fb-'+id);if(fb)fb.classList.add('on');
  safe('panel-title',PANEL_TITLES[id]||id);
  const body=g('panel-body');
  body.innerHTML='<div class="bload"><div class="bspin"></div></div>';
  g('overlay').classList.add('open');
  g('panel').classList.add('open');
  document.body.style.overflow='hidden';
  setTimeout(()=>renderPanelContent(id,body),40);
}

function closePanel(){
  g('overlay').classList.remove('open');
  g('panel').classList.remove('open');
  document.body.style.overflow='';
  document.querySelectorAll('.feat-btn').forEach(b=>b.classList.remove('on'));
}

function renderPanelContent(id,body){
  try{
    if(id==='bm')renderBM(body);
    else if(id==='img')renderImgPanel(body);
    else if(id==='quiz')renderQuiz(body);
    else if(id==='compare')renderCompare(body);
    else if(id==='notes')renderNotesPanel(body);
    else if(id==='daily')renderDaily(body);
  }catch(err){
    body.innerHTML='<div class="berr">Error: '+err.message+'</div>';
    console.error(err);
  }
}

  body.innerHTML=`<div class="tpills">${topicKeys.map(k=>`<button class="tp${k===activeTopic?' on':''}" data-topic="${k}">${labels[k]||k}</button>`).join('')}</div><div id="topic-res"></div>`;
  body.querySelectorAll('.tp').forEach(btn=>btn.addEventListener('click',()=>show(btn.dataset.topic)));
  show(activeTopic);
}

// ── BOOKMARKS ────────────────────────────────────────────────────
function renderBM(body){
  const bms=S.bm;
  if(!bms.length){body.innerHTML='<div class="bempty">♥ சேமித்த வசனங்கள் இல்லை.<br>வசனத்தில் ♥ அழுத்துங்கள்.</div>';return;}
  body.innerHTML=bms.map((b,i)=>`
    <div class="bm-item">
      <div class="bm-text">
        <div class="bm-ref">${b.refTA||b.ref}</div>
        <div class="bm-v">${b.text}</div>
      </div>
      <div class="bm-acts">
        <button class="p-act" onclick="cpV('${(b.refTA||b.ref).replace(/'/g,"\\'")}','${b.text.replace(/'/g,"\\'")}')">📋</button>
        <button class="p-act" onclick="rmBM(${i})" style="color:#f87171">✕</button>
      </div>
    </div>`).join('');
}

// ── READING PLAN ─────────────────────────────────────────────────
// ── COMPARE VERSIONS ──────────────────────────────────────────────
// Generic fetch — gets one version's verses for the CURRENT book/chapter
// without touching the main reading state (S.verses / S.lang etc).
async function fetchVersionChapter(verId){
  const v=getVer(verId);if(!v||!S.book)return[];
  if(v.src==='bolls'){
    try{return await fetchBolls(v.bcode,S.bookNum,S.ch);}catch(e){return[];}
  }
  if(v.src==='local'){
    const localBook=S.enDB[S.bookNum];
    if(localBook&&localBook[S.ch]&&localBook[S.ch].length){
      return localBook[S.ch].map((t,i)=>({num:i+1,text:t||''}));
    }
    return[];
  }
  // src==='bapi'
  const ck='enjc_en_'+v.code+'_'+S.bookNum+'_'+S.ch;
  try{const c=localStorage.getItem(ck);if(c){const p=JSON.parse(c);if(p?.length)return p;}}catch(e){}
  try{
    const r=await fetchT(C.enAPI+S.book+'+'+S.ch+'?translation='+v.code);
    const d=await r.json();if(d.error)return[];
    const vv=(d.verses||[]).map(x=>({num:x.verse,text:x.text.trim().replace(/\n/g,' ')}));
    if(vv.length)try{localStorage.setItem(ck,JSON.stringify(vv));}catch(e){}
    return vv;
  }catch(e){return[];}
}

let _cmpA='taov',_cmpB='kjv',_cmpData=null;

function renderCompare(body){
  if(!S.book){
    body.innerHTML='<div class="bempty">முதலில் ஒரு புத்தகம் &amp; அதிகாரம் தேர்வு செய்யுங்கள்.</div>';
    return;
  }
  body.innerHTML=`
    <div class="cmp-head">${S.bookTaName||S.bookName} ${S.ch}</div>
    <div class="cmp-pickers">
      <select class="nx-sel" id="cmp-a" onchange="_cmpA=this.value;runCompare()">
        ${VERSIONS.map(v=>`<option value="${v.id}" ${v.id===_cmpA?'selected':''}>${v.label}</option>`).join('')}
      </select>
      <span class="cmp-vs">vs</span>
      <select class="nx-sel" id="cmp-b" onchange="_cmpB=this.value;runCompare()">
        ${VERSIONS.map(v=>`<option value="${v.id}" ${v.id===_cmpB?'selected':''}>${v.label}</option>`).join('')}
      </select>
    </div>
    <div id="cmp-body"><div class="bload"><div class="bspin"></div></div></div>
    <button class="ch-btn primary" style="width:100%;margin-top:10px" onclick="shareCompare()">🔗 Share Compare</button>
  `;
  runCompare();
}

async function runCompare(){
  const out=g('cmp-body');if(!out)return;
  out.innerHTML='<div class="bload"><div class="bspin"></div></div>';
  const [a,b]=await Promise.all([fetchVersionChapter(_cmpA),fetchVersionChapter(_cmpB)]);
  _cmpData={a,b,verA:getVer(_cmpA),verB:getVer(_cmpB)};
  if(!a.length&&!b.length){out.innerHTML='<div class="berr">⚠ வசனங்கள் கிடைக்கவில்லை.</div>';return;}
  const bMap={};b.forEach(v=>bMap[v.num]=v.text);
  const aMap={};a.forEach(v=>aMap[v.num]=v.text);
  const nums=[...new Set([...a.map(v=>v.num),...b.map(v=>v.num)])].sort((x,y)=>x-y);
  out.innerHTML=nums.map(n=>`
    <div class="cmp-row">
      <div class="cmp-vn">${n}</div>
      <div class="cmp-col">
        <span class="cmp-tag">${getVer(_cmpA).short}</span>
        <span class="cmp-txt">${aMap[n]||'—'}</span>
      </div>
      <div class="cmp-col">
        <span class="cmp-tag">${getVer(_cmpB).short}</span>
        <span class="cmp-txt">${bMap[n]||'—'}</span>
      </div>
    </div>`).join('');
}

function shareCompare(){
  if(!_cmpData){toast('⚠ Compare தேர்வு செய்யுங்கள்');return;}
  const {a,b,verA,verB}=_cmpData;
  const head=(S.bookTaName||S.bookName)+' '+S.ch+' — '+verA.short+' vs '+verB.short;
  const bMap={};b.forEach(v=>bMap[v.num]=v.text);
  const lines=a.slice(0,8).map(v=>`${v.num}. [${verA.short}] ${v.text}\n   [${verB.short}] ${bMap[v.num]||'—'}`);
  const msg=head+'\n\n'+lines.join('\n\n')+'\n\nhttps://elimnewjerusalem.github.io/enjc-bible/bible.html';
  if(navigator.share){
    navigator.share({title:head,text:msg}).catch(()=>{});
  }else{
    navigator.clipboard?.writeText(msg);
    toast('📋 Compare copied!');
  }
}

// ── MY NOTES (across the whole Bible) ─────────────────────────────
function renderNotesPanel(body){
  const notes=JSON.parse(localStorage.getItem('enjc_notes')||'{}');
  const refs=Object.keys(notes).filter(r=>notes[r]&&notes[r].trim());
  if(!refs.length){
    body.innerHTML='<div class="bempty">📝 இன்னும் குறிப்புகள் இல்லை.<br>வசனத்தை திறந்து Note சேர்க்கலாம்.</div>';
    return;
  }
  body.innerHTML=refs.map(ref=>`
    <div class="bm-item">
      <div class="bm-text" style="cursor:pointer" onclick="goToNoteRef('${ref.replace(/'/g,"\\'")}')">
        <div class="bm-ref">${ref}</div>
        <div class="bm-v">${(notes[ref]||'').replace(/</g,'&lt;')}</div>
      </div>
      <div class="bm-acts">
        <button class="p-act" onclick="goToNoteRef('${ref.replace(/'/g,"\\'")}')">📖</button>
        <button class="p-act" onclick="deleteNoteRef('${ref.replace(/'/g,"\\'")}')" style="color:#f87171">✕</button>
      </div>
    </div>`).join('');
}

function deleteNoteRef(ref){
  const notes=JSON.parse(localStorage.getItem('enjc_notes')||'{}');
  delete notes[ref];
  localStorage.setItem('enjc_notes',JSON.stringify(notes));
  S.notes=notes;
  toast('🗑 Note deleted');
  openPanel('notes');
  if(S.book)renderVerses();
}

function goToNoteRef(ref){
  // ref looks like "Genesis 1:1" or "Psalm 23:1-2"
  const m=ref.match(/^(.+)\s(\d+):(\d+)/);
  if(!m){toast('⚠ Verse கண்டுபிடிக்க முடியவில்லை');return;}
  const bookName=m[1].trim();
  const bk=BOOKS.find(b=>b.name.toLowerCase()===bookName.toLowerCase());
  if(!bk){toast('⚠ Book கண்டுபிடிக்க முடியவில்லை');return;}
  g('book-sel').value=bk.id;
  S.book=bk.id;S.bookName=bk.name;S.bookTaName=bk.ta;S.bookNum=bk.n;S.totalCh=bk.ch;S.ch=parseInt(m[2]);
  const cs=g('ch-sel');cs.innerHTML='';cs.disabled=false;
  for(let j=1;j<=bk.ch;j++){const o=document.createElement('option');o.value=j;o.textContent='அதிகாரம் '+j;cs.appendChild(o);}
  cs.value=S.ch;g('gobtn').style.display='none';
  closePanel();loadCh();
  setTimeout(()=>g('bcontent').scrollIntoView({behavior:'smooth'}),300);
}

// ── IMAGE GENERATOR ──────────────────────────────────────────────
const RATIO={'9:16':[1080,1920],'3:4':[900,1200],'1:1':[1080,1080],'16:9':[1920,1080]};
const SIZE_LABELS={'9:16':'1080×1920','3:4':'900×1200','1:1':'1080×1080','16:9':'1920×1080'};
const SIZE_HINTS={'9:16':'Story / Reel','3:4':'Portrait Post','1:1':'Square Post','16:9':'YouTube / Wide'};

let _igMode='solid', _igBgColor='#8b1a1a', _igFont='serif';
let _igTaSize=52, _igEnSize=36;
let _igPhotoOpacity=60, _userPhoto=null, _igSz='9:16';

const FONTS={
  serif:"'Noto Serif Tamil',Georgia,serif",
  sans:"'DM Sans',system-ui,sans-serif",
  italic:"italic 'Noto Serif Tamil',Georgia,serif",
  mono:"'Courier New',monospace"
};

function renderImgPanel(body){
  body.innerHTML=`
<style>
.ig-root{display:flex;flex-direction:column;gap:8px}
.ig-sec{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:8px;overflow:hidden}
.ig-sec-head{padding:8px 12px;border-bottom:1px solid rgba(255,255,255,.06);display:flex;align-items:center;gap:7px;font-size:9px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--tx2)}
.ig-sec-body{padding:10px}

/* Size */
.ig-size-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:5px}
.ig-sz{border:1.5px solid var(--bd);border-radius:6px;padding:5px 3px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;transition:all .18s;background:rgba(255,255,255,.02)}
.ig-sz:hover{border-color:var(--bd2);background:rgba(255,255,255,.04)}
.ig-sz.on{border-color:var(--gdb);background:var(--gdm)}
.ig-sz-vis{display:flex;align-items:flex-end;justify-content:center;height:22px}
.ig-sz-rect{border-radius:2px;background:var(--tx3);transition:all .15s}
.ig-sz.on .ig-sz-rect{background:var(--gd)}
.ig-sz-name{font-size:9px;font-weight:600;color:var(--tx2)}
.ig-sz.on .ig-sz-name{color:var(--gd)}
.ig-sz-hint{font-size:7px;color:var(--tx3);text-align:center;line-height:1.3}

/* BG tabs */
.ig-bg-tabs{display:flex;gap:3px;background:rgba(255,255,255,.03);border:1px solid var(--bd);border-radius:6px;padding:3px;margin-bottom:10px}
.ig-bgtab{flex:1;padding:7px 4px;border-radius:4px;font-size:10px;color:var(--tx3);text-align:center;cursor:pointer;transition:all .18s;font-weight:500;font-family:var(--sans)}
.ig-bgtab.on{background:var(--gd);color:var(--bg);font-weight:600}

/* RGB */
.ig-rgb-area{display:flex;flex-direction:column;align-items:center;gap:8px;width:100%}
.ig-wheel{width:80px;height:80px;border-radius:50%;background:conic-gradient(#ff0000,#ff8000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000);cursor:crosshair;position:relative;border:3px solid var(--bd2);flex-shrink:0}
.ig-wheel-dot{position:absolute;width:14px;height:14px;border-radius:50%;background:white;border:2.5px solid rgba(0,0,0,.5);transform:translate(-50%,-50%);pointer-events:none;transition:left .1s,top .1s}
.ig-rgb-prev{width:100%;height:28px;border-radius:6px;border:1px solid var(--bd2);cursor:pointer}
.ig-rgb-hex{font-size:12px;color:var(--gd);font-family:monospace;font-weight:600}
.ig-rgb-sliders{width:100%;display:flex;flex-direction:column;gap:5px}
.ig-sl-row{display:flex;align-items:center;gap:7px}
.ig-sl-lbl{font-size:9px;font-weight:700;color:var(--tx3);width:10px}
.ig-csl{flex:1;-webkit-appearance:none;height:4px;border-radius:99px;cursor:pointer;outline:none}
.ig-csl.r{background:linear-gradient(90deg,#1a0000,#ff0000)}
.ig-csl.g{background:linear-gradient(90deg,#001a00,#00ff00)}
.ig-csl.b{background:linear-gradient(90deg,#00001a,#0000ff)}
.ig-csl::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:white;border:2px solid rgba(0,0,0,.3);cursor:pointer}
.ig-sl-num{font-size:9px;color:var(--tx2);min-width:22px;text-align:right;font-family:monospace}

/* Photo */
.ig-photo-drop{border:1.5px dashed var(--gdb);border-radius:8px;padding:14px;text-align:center;background:var(--gdm);cursor:pointer;transition:all .2s}
.ig-photo-drop:hover{background:rgba(232,160,32,.18)}
.ig-photo-thumb-wrap{margin-bottom:8px;display:none}
.ig-photo-thumb{max-width:100%;max-height:80px;border-radius:6px;object-fit:cover}

/* Generic slider */
.ig-gsl-row{display:flex;align-items:center;gap:8px;margin-top:6px}
.ig-gsl-lbl{font-size:10px;color:var(--tx2);min-width:52px}
.ig-gsl{flex:1;-webkit-appearance:none;height:4px;border-radius:99px;background:rgba(255,255,255,.12);cursor:pointer;outline:none}
.ig-gsl::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:var(--gd);border:2px solid rgba(0,0,0,.3)}
.ig-gsl-val{font-size:11px;color:var(--gd);font-weight:600;min-width:36px;text-align:right;font-family:monospace}

/* Font */
.ig-font-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px}
.ig-fb{border:1.5px solid var(--bd);border-radius:6px;padding:7px 5px;cursor:pointer;text-align:center;transition:all .18s;background:rgba(255,255,255,.02)}
.ig-fb:hover{border-color:var(--bd2)}
.ig-fb.on{border-color:var(--gdb);background:var(--gdm)}
.ig-fb-name{font-size:10.5px;color:var(--tx2);font-weight:500}
.ig-fb.on .ig-fb-name{color:var(--gd)}
.ig-fb-hint{font-size:8px;color:var(--tx3);margin-top:2px}

/* Canvas */
.ig-canvas-wrap{background:rgba(0,0,0,.3);border:1px solid var(--bd);border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center;min-height:140px}
canvas#igcv{max-width:100%;max-height:200px;display:block}

/* Export */
.ig-export-primary{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;margin-bottom:6px}
.ig-ex-btn{border-radius:99px;padding:7px 4px;font-size:10px;font-weight:600;cursor:pointer;text-align:center;border:none;font-family:var(--sans);display:flex;align-items:center;justify-content:center;gap:3px;transition:all .18s}
.ig-ex-btn:active{transform:scale(.97)}
.ig-ex-p{background:var(--gd);color:var(--bg)}
.ig-ex-p:hover{filter:brightness(1.1)}
.ig-ex-o{background:transparent;border:1.5px solid var(--gdb);color:var(--gd)}
.ig-ex-o:hover{background:var(--gdm)}
.ig-share-row{display:flex;gap:4px}
.ig-share-btn{flex:1;border-radius:6px;padding:6px 3px;font-size:9px;font-weight:500;cursor:pointer;text-align:center;display:flex;align-items:center;justify-content:center;gap:3px;border:1px solid var(--bd);background:rgba(255,255,255,.04);color:var(--tx2);transition:all .18s;font-family:var(--sans)}
.ig-share-btn:hover{border-color:var(--bd2);background:rgba(255,255,255,.08)}
.ig-wa{border-color:rgba(37,211,102,.3)!important;color:#25d366!important}
.ig-ig{border-color:rgba(225,48,108,.3)!important;color:#e1306c!important}
.ig-yt{border-color:rgba(255,0,0,.3)!important;color:#ff0000!important}
.ig-cp{border-color:rgba(100,200,255,.3)!important;color:#64c8ff!important}

/* Verse select */
.ig-vsel{width:100%;background:var(--bg2);border:1px solid var(--bd);border-radius:6px;padding:8px 10px;color:var(--tx);font-size:11px;font-family:var(--sans);cursor:pointer;margin-bottom:7px}
.ig-use-btn{width:100%;border:1px solid var(--bd);border-radius:6px;padding:8px;color:var(--tx2);font-size:11px;background:transparent;font-family:var(--sans);cursor:pointer;transition:all .2s;margin-bottom:10px}
.ig-use-btn:hover{border-color:var(--gdb);color:var(--gd)}

/* Info badge */
.ig-info-row{display:flex;gap:5px;flex-wrap:wrap;margin-top:8px}
.ig-badge{background:rgba(255,255,255,.05);border:1px solid var(--bd);border-radius:4px;padding:3px 8px;font-size:9px;color:var(--tx3)}
.ig-badge span{color:var(--gd);font-weight:600}
</style>

<div class="ig-root">

  <!-- SIZE -->
  <div class="ig-sec">
    <div class="ig-sec-head">📐 Image Size</div>
    <div class="ig-sec-body">
      <div class="ig-size-grid">
        <div class="ig-sz on" onclick="igSetSize(this,'9:16')">
          <div class="ig-sz-vis"><div class="ig-sz-rect" style="width:13px;height:21px"></div></div>
          <div class="ig-sz-name">9:16</div>
          <div class="ig-sz-hint">Story<br>Reel</div>
        </div>
        <div class="ig-sz" onclick="igSetSize(this,'3:4')">
          <div class="ig-sz-vis"><div class="ig-sz-rect" style="width:17px;height:21px"></div></div>
          <div class="ig-sz-name">3:4</div>
          <div class="ig-sz-hint">Portrait<br>Post</div>
        </div>
        <div class="ig-sz" onclick="igSetSize(this,'1:1')">
          <div class="ig-sz-vis"><div class="ig-sz-rect" style="width:21px;height:21px"></div></div>
          <div class="ig-sz-name">1:1</div>
          <div class="ig-sz-hint">Square<br>Post</div>
        </div>
        <div class="ig-sz" onclick="igSetSize(this,'16:9')">
          <div class="ig-sz-vis"><div class="ig-sz-rect" style="width:24px;height:15px"></div></div>
          <div class="ig-sz-name">16:9</div>
          <div class="ig-sz-hint">YouTube<br>Wide</div>
        </div>
      </div>
    </div>
  </div>

  <!-- BACKGROUND -->
  <div class="ig-sec">
    <div class="ig-sec-head">🎨 Background</div>
    <div class="ig-sec-body">
      <div class="ig-bg-tabs">
        <div class="ig-bgtab on" id="igtab-solid" onclick="igSetBgMode('solid')">🎨 Solid Colour</div>
        <div class="ig-bgtab" id="igtab-photo" onclick="igSetBgMode('photo')">📷 My Photo</div>
        <div class="ig-bgtab" id="igtab-unsplash" onclick="igSetBgMode('unsplash')">🌄 Photos</div>
      </div>

      <!-- SOLID -->
      <div id="ig-solid-sec">
        <div class="ig-rgb-area">
          <div class="ig-wheel" id="ig-wheel" onmousedown="igWheelStart(event)" ontouchstart="igWheelStart(event)">
            <div class="ig-wheel-dot" id="ig-wheel-dot" style="left:55px;top:22px"></div>
          </div>
          <div class="ig-rgb-prev" id="ig-rgb-prev" style="background:#8b1a1a" onclick="igPickPresets()"></div>
          <div class="ig-rgb-hex" id="ig-rgb-hex">#8B1A1A</div>
          <div class="ig-rgb-sliders">
            <div class="ig-sl-row">
              <span class="ig-sl-lbl" style="color:#f87171">R</span>
              <input type="range" class="ig-csl r" id="ig-r" min="0" max="255" value="139" oninput="igRGBSlider()">
              <span class="ig-sl-num" id="ig-rval">139</span>
            </div>
            <div class="ig-sl-row">
              <span class="ig-sl-lbl" style="color:#4ade80">G</span>
              <input type="range" class="ig-csl g" id="ig-g" min="0" max="255" value="26" oninput="igRGBSlider()">
              <span class="ig-sl-num" id="ig-gval">26</span>
            </div>
            <div class="ig-sl-row">
              <span class="ig-sl-lbl" style="color:#60a5fa">B</span>
              <input type="range" class="ig-csl b" id="ig-b" min="0" max="255" value="26" oninput="igRGBSlider()">
              <span class="ig-sl-num" id="ig-bval">26</span>
            </div>
          </div>
        </div>
        <!-- Quick presets -->
        <div style="display:flex;gap:5px;margin-top:10px;flex-wrap:wrap">
          ${['#8b1a1a','#1a3a7a','#2d5a1b','#3d1a7a','#0f5c52','#8b3a1a','#1a1a1a','#2c1810'].map(c=>`<div onclick="igSetColor('${c}')" style="width:22px;height:22px;border-radius:4px;background:${c};cursor:pointer;border:2px solid transparent;transition:all .15s" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'"></div>`).join('')}
        </div>
      </div>

      <!-- PHOTO -->
      <div id="ig-photo-sec" style="display:none">
        <div class="ig-photo-thumb-wrap" id="ig-thumb-wrap">
          <img id="ig-photo-thumb" class="ig-photo-thumb">
        </div>
        <div class="ig-photo-drop" onclick="igUploadPhoto()">
          <div style="font-size:24px;margin-bottom:6px">📷</div>
          <div style="font-size:11px;color:var(--gd);font-weight:500">Upload Photo</div>
          <div style="font-size:9px;color:var(--tx3);margin-top:3px">Gallery · Camera · Files</div>
          <button onclick="event.stopPropagation();igUploadPhoto()" style="margin-top:10px;background:var(--gd);color:var(--bg);border:none;border-radius:99px;padding:7px 18px;font-size:11px;font-weight:600;font-family:var(--sans);cursor:pointer">Choose Photo</button>
        </div>
        <div class="ig-gsl-row">
          <span class="ig-gsl-lbl">Dark Overlay</span>
          <input type="range" class="ig-gsl" id="ig-opacity" min="0" max="90" value="60" step="5" oninput="document.getElementById('ig-opval').textContent=this.value+'%';drawIG()">
          <span class="ig-gsl-val" id="ig-opval">60%</span>
        </div>
      </div>

      <!-- UNSPLASH BACKGROUNDS -->
      <div id="ig-unsplash-sec" style="display:none">
        <div style="font-size:10px;color:var(--tx3);margin-bottom:8px;line-height:1.6">
          🌐 Free nature &amp; worship photos — tap any to use as background
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px" id="uns-grid">
          ${renderUnsplashGrid()}
        </div>
        <div class="ig-gsl-row" style="margin-top:10px">
          <span class="ig-gsl-lbl">Overlay</span>
          <input type="range" class="ig-gsl" id="ig-uns-opacity" min="0" max="80" value="50" oninput="S.igUnsOverlay=this.value/100;g('ig-uns-opval').textContent=this.value+'%';drawIG()">
          <span class="ig-gsl-val" id="ig-uns-opval">50%</span>
        </div>
      </div>

    </div>
  </div>

  <!-- FONT -->
  <div class="ig-sec">
    <div class="ig-sec-head">🔤 Font Style & Size</div>
    <div class="ig-sec-body">
      <div class="ig-font-grid">
        <div class="ig-fb on" onclick="igSetFont(this,'serif')"><div class="ig-fb-name" style="font-family:Georgia,serif">Serif</div><div class="ig-fb-hint">Traditional</div></div>
        <div class="ig-fb" onclick="igSetFont(this,'sans')"><div class="ig-fb-name">Sans</div><div class="ig-fb-hint">Modern</div></div>
        <div class="ig-fb" onclick="igSetFont(this,'italic')"><div class="ig-fb-name" style="font-family:Georgia,serif;font-style:italic">Italic</div><div class="ig-fb-hint">Elegant</div></div>
        <div class="ig-fb" onclick="igSetFont(this,'mono')"><div class="ig-fb-name" style="font-family:'Courier New',monospace;font-size:9px">Mono</div><div class="ig-fb-hint">Classic</div></div>
      </div>
      <div class="ig-gsl-row">
        <span class="ig-gsl-lbl">Tamil</span>
        <input type="range" class="ig-gsl" id="ig-tasize" min="28" max="72" value="52" oninput="document.getElementById('ig-tasizeval').textContent=this.value+'px';_igTaSize=parseInt(this.value);drawIG()">
        <span class="ig-gsl-val" id="ig-tasizeval">52px</span>
      </div>
      <div class="ig-gsl-row">
        <span class="ig-gsl-lbl">English</span>
        <input type="range" class="ig-gsl" id="ig-ensize" min="20" max="52" value="36" oninput="document.getElementById('ig-ensizeval').textContent=this.value+'px';_igEnSize=parseInt(this.value);drawIG()">
        <span class="ig-gsl-val" id="ig-ensizeval">36px</span>
      </div>
    </div>
  </div>

  <!-- VERSE -->
  <div class="ig-sec">
    <div class="ig-sec-head">📖 Verse</div>
    <div class="ig-sec-body">
      <!-- Current verse display -->
      <div id="ig-verse-display" style="background:rgba(255,255,255,.04);border:1px solid var(--bd);border-radius:6px;padding:10px 12px;margin-bottom:8px;min-height:48px">
        <div id="ig-verse-ta" style="font-size:12px;color:var(--tx);font-family:var(--tamil);line-height:1.7;margin-bottom:3px">chapter திறந்து verse தேர்ந்தெடுங்கள்...</div>
        <div id="ig-verse-ref" style="font-size:10px;color:var(--gd);font-weight:600"></div>
      </div>
      <button class="ig-use-btn" onclick="igUseCurrentVerse()" id="ig-use-verse-btn">
        ✓ Use current verse
      </button>
      <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:6px">
        <button onclick="igUseVOTD()" style="flex:1;border:1px solid var(--bd);border-radius:6px;padding:7px;font-size:10px;color:var(--tx2);background:rgba(255,255,255,.03);cursor:pointer;font-family:var(--sans);transition:all .2s" onmouseover="this.style.borderColor='var(--gdb)'" onmouseout="this.style.borderColor='var(--bd)'">⭐ VOTD</button>
        <button onclick="igPrevVerse()" style="flex:1;border:1px solid var(--bd);border-radius:6px;padding:7px;font-size:10px;color:var(--tx2);background:rgba(255,255,255,.03);cursor:pointer;font-family:var(--sans);transition:all .2s" onmouseover="this.style.borderColor='var(--gdb)'" onmouseout="this.style.borderColor='var(--bd)'">← Prev</button>
        <button onclick="igNextVerse()" style="flex:1;border:1px solid var(--bd);border-radius:6px;padding:7px;font-size:10px;color:var(--tx2);background:rgba(255,255,255,.03);cursor:pointer;font-family:var(--sans);transition:all .2s" onmouseover="this.style.borderColor='var(--gdb)'" onmouseout="this.style.borderColor='var(--bd)'">Next →</button>
      </div>
      <!-- Info -->
      <div class="ig-info-row">
        <div class="ig-badge" id="ig-size-badge">Size <span>9:16 · 1080×1920</span></div>
        <div class="ig-badge" id="ig-color-badge">BG <span>#8B1A1A</span></div>
      </div>
    </div>
  </div>

  <!-- CANVAS -->
  <div class="ig-canvas-wrap">
    <canvas id="igcv" ontouchstart="igTouchStart(event)" ontouchend="igTouchEnd(event)"></canvas>
  </div>

  <!-- EXPORT -->
  <div class="ig-sec">
    <div class="ig-sec-head">⬇ Export & Share</div>
    <div class="ig-sec-body">
      <div class="ig-export-primary">
        <button class="ig-ex-btn ig-ex-p" onclick="dlIG('png')">↓ PNG</button>
        <button class="ig-ex-btn ig-ex-p" onclick="dlIG('jpg')">↓ JPG</button>
        <button class="ig-ex-btn ig-ex-o" onclick="dlIG('webp')">↓ WebP</button>
      </div>
      <div class="ig-share-row">
        <button class="ig-share-btn ig-wa" onclick="shareToApp('wa')">🟢 WhatsApp</button>
        <button class="ig-share-btn ig-ig" onclick="shareToApp('ig')">📸 Insta</button>
        <button class="ig-share-btn ig-yt" onclick="shareToApp('yt')">▶ YouTube</button>
        <button class="ig-share-btn ig-cp" onclick="copyImgToClipboard()">📋 Copy</button>
      </div>
    </div>
  </div>

</div>`;

  initIGVerses();
  setTimeout(drawIG, 80);
}

// ── IG SIZE ──────────────────────────────────────────────────────
function igSetSize(el, sz){
  _igSz = sz;
  document.querySelectorAll('.ig-sz').forEach(b=>b.classList.remove('on'));
  el.classList.add('on');
  const badge = document.getElementById('ig-size-badge');
  if(badge) badge.innerHTML = `Size <span>${sz} · ${SIZE_LABELS[sz]||''}</span>`;
  drawIG();
}

// ── BG MODE ──────────────────────────────────────────────────────
function igSetBgMode(mode){
  _igMode = mode;
  document.getElementById('igtab-solid')?.classList.toggle('on', mode==='solid');
  document.getElementById('igtab-photo')?.classList.toggle('on', mode==='photo');
  document.getElementById('igtab-unsplash')?.classList.toggle('on', mode==='unsplash');
  const ss  = document.getElementById('ig-solid-sec');
  const ps  = document.getElementById('ig-photo-sec');
  const us  = document.getElementById('ig-unsplash-sec');
  if(ss) ss.style.display   = mode==='solid'    ? 'block' : 'none';
  if(ps) ps.style.display   = mode==='photo'    ? 'block' : 'none';
  if(us) us.style.display   = mode==='unsplash' ? 'block' : 'none';
  drawIG();
}

// ── RGB WHEEL ────────────────────────────────────────────────────
function igSetColor(hex){
  _igBgColor = hex;
  const r=parseInt(hex.slice(1,3),16);
  const g=parseInt(hex.slice(3,5),16);
  const b=parseInt(hex.slice(5,7),16);
  const ri=document.getElementById('ig-r');
  const gi=document.getElementById('ig-g');
  const bi=document.getElementById('ig-b');
  if(ri){ri.value=r;document.getElementById('ig-rval').textContent=r;}
  if(gi){gi.value=g;document.getElementById('ig-gval').textContent=g;}
  if(bi){bi.value=b;document.getElementById('ig-bval').textContent=b;}
  const prev=document.getElementById('ig-rgb-prev');
  if(prev)prev.style.background=hex;
  const hexEl=document.getElementById('ig-rgb-hex');
  if(hexEl)hexEl.textContent=hex.toUpperCase();
  const badge=document.getElementById('ig-color-badge');
  if(badge)badge.innerHTML=`BG <span>${hex.toUpperCase()}</span>`;
  drawIG();
}

function igRGBSlider(){
  const r=parseInt(document.getElementById('ig-r')?.value||'0');
  const g=parseInt(document.getElementById('ig-g')?.value||'0');
  const b=parseInt(document.getElementById('ig-b')?.value||'0');
  document.getElementById('ig-rval').textContent=r;
  document.getElementById('ig-gval').textContent=g;
  document.getElementById('ig-bval').textContent=b;
  const hex='#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
  _igBgColor=hex;
  const prev=document.getElementById('ig-rgb-prev');
  if(prev)prev.style.background=hex;
  const hexEl=document.getElementById('ig-rgb-hex');
  if(hexEl)hexEl.textContent=hex.toUpperCase();
  const badge=document.getElementById('ig-color-badge');
  if(badge)badge.innerHTML=`BG <span>${hex.toUpperCase()}</span>`;
  drawIG();
}

// Wheel drag
let _igWheelDragging=false;
function igWheelStart(e){
  _igWheelDragging=true;
  igWheelMove(e);
  document.addEventListener('mousemove',igWheelMove);
  document.addEventListener('mouseup',()=>{_igWheelDragging=false;document.removeEventListener('mousemove',igWheelMove);});
  document.addEventListener('touchmove',igWheelMove,{passive:false});
  document.addEventListener('touchend',()=>{_igWheelDragging=false;});
}
function igWheelMove(e){
  if(!_igWheelDragging)return;
  e.preventDefault?.();
  const wheel=document.getElementById('ig-wheel');
  if(!wheel)return;
  const rect=wheel.getBoundingClientRect();
  const cx=rect.left+rect.width/2, cy=rect.top+rect.height/2;
  const clientX=e.touches?e.touches[0].clientX:e.clientX;
  const clientY=e.touches?e.touches[0].clientY:e.clientY;
  const dx=clientX-cx, dy=clientY-cy;
  const r=rect.width/2;
  const dist=Math.min(Math.sqrt(dx*dx+dy*dy),r);
  const angle=Math.atan2(dy,dx);
  // Hue from angle
  const hue=((angle*180/Math.PI)+360)%360;
  const sat=dist/r;
  // HSV to RGB
  const h=hue/60, i=Math.floor(h), f=h-i;
  const p=1-sat, q=1-sat*f, t=1-sat*(1-f);
  let rr,gg,bb;
  switch(i%6){
    case 0:rr=1;gg=t;bb=p;break;
    case 1:rr=q;gg=1;bb=p;break;
    case 2:rr=p;gg=1;bb=t;break;
    case 3:rr=p;gg=q;bb=1;break;
    case 4:rr=t;gg=p;bb=1;break;
    default:rr=1;gg=p;bb=q;break;
  }
  const R=Math.round(rr*255), G=Math.round(gg*255), B=Math.round(bb*255);
  // Update dot position
  const dot=document.getElementById('ig-wheel-dot');
  if(dot){dot.style.left=(cx-rect.left+Math.cos(angle)*dist)+'px';dot.style.top=(cy-rect.top+Math.sin(angle)*dist)+'px';}
  // Update sliders
  const ri=document.getElementById('ig-r');
  const gi=document.getElementById('ig-g');
  const bi=document.getElementById('ig-b');
  if(ri)ri.value=R;if(gi)gi.value=G;if(bi)bi.value=B;
  igRGBSlider();
}


// ── UNSPLASH BACKGROUNDS ─────────────────────────────────────────
// Free Unsplash Source API — no key needed, 1080px quality
const IG_UNSPLASH = [
  { label:'🌅 Nature',    query:'nature+sky+sunrise',      color:'#0d1e2e' },
  { label:'⛰️ Mountains', query:'mountains+landscape',      color:'#1a1a2e' },
  { label:'🌊 Ocean',     query:'ocean+waves+sea',          color:'#0d1e3a' },
  { label:'✨ Stars',     query:'stars+galaxy+night+sky',   color:'#07090f' },
  { label:'🌸 Flowers',   query:'flowers+nature+garden',    color:'#2e1a1a' },
  { label:'🕊️ Peace',    query:'peaceful+calm+light',      color:'#1a2e1a' },
  { label:'🌿 Forest',    query:'forest+trees+green',       color:'#0d2e0d' },
  { label:'☁️ Clouds',    query:'clouds+sky+heaven',        color:'#1a1a3e' },
  { label:'🌾 Field',     query:'wheat+field+golden',       color:'#2e2a0d' },
  { label:'🏙️ City',      query:'city+lights+night',        color:'#0d1219' },
  { label:'💧 Rain',      query:'rain+drops+water',         color:'#0d1a2e' },
  { label:'🌙 Moon',      query:'moon+night+sky',           color:'#07090f' },
];
let igUnsplashIdx = 0;

function igLoadUnsplash(idx){
  igUnsplashIdx = idx;
  const cat = IG_UNSPLASH[idx];
  if(!cat) return;
  // Picsum Photos — reliable, fast, no API key needed
  const seeds=[10,15,20,25,30,35,42,50,60,65,70,75,80,85,90,95,100,110,120,130];
  const seed = seeds[idx % seeds.length];
  const url = 'https://picsum.photos/seed/'+(seed+idx*7)+'/1080/1080';
  const img = new Image();
  img.crossOrigin = 'anonymous';
  toast('⏳ Loading...');
  img.onload = function(){
    S.igBgImg = img;
    _igMode = 'unsplash';
    drawIG();
    toast('✅ '+cat.label+' loaded');
    document.querySelectorAll('.ig-uns-btn').forEach(function(b,i){
      b.classList.toggle('on', i===idx);
    });
  };
  img.onerror = function(){ toast('⚠️ Photo failed — try another'); };
  img.src = url;
}

function renderUnsplashGrid(){
  return IG_UNSPLASH.map((cat,i)=>
    `<button class="ig-uns-btn${igUnsplashIdx===i?' on':''}" onclick="igLoadUnsplash(${i})" 
     style="border:1px solid var(--bd);border-radius:8px;padding:7px 5px;font-size:11px;
     background:rgba(255,255,255,.03);cursor:pointer;text-align:center;transition:all .18s;
     color:var(--tx2);font-family:var(--sans);line-height:1.4">
      <div style="font-size:15px">${cat.label.split(' ')[0]}</div>
      <div style="font-size:9px;margin-top:2px;opacity:.7">${cat.label.split(' ').slice(1).join(' ')}</div>
    </button>`
  ).join('');
}

// ── FONT ─────────────────────────────────────────────────────────
function igSetFont(el, font){
  _igFont = font;
  document.querySelectorAll('.ig-fb').forEach(b=>b.classList.remove('on'));
  el.classList.add('on');
  drawIG();
}

// ── PHOTO UPLOAD ─────────────────────────────────────────────────
function igUploadPhoto(){
  const inp=document.createElement('input');
  inp.type='file';inp.accept='image/*';
  inp.onchange=e=>{
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=ev=>{
      _userPhoto=ev.target.result;
      const th=document.getElementById('ig-photo-thumb');
      const wrap=document.getElementById('ig-thumb-wrap');
      if(th){th.src=_userPhoto;if(wrap)wrap.style.display='block';}
      drawIG();toast('📷 Photo uploaded!');
    };
    r.readAsDataURL(f);
  };
  inp.click();
}

// ── VERSE INIT ───────────────────────────────────────────────────
function initIGVerses(){
  S.igVerses=IGVERSES;
  // No select needed — verse comes from current reading
}

  const v=S.verses[0];
  const taRef=(S.bookTaName||S.bookName)+' '+S.ch+':'+v.num;
  const enRef=S.bookName+' '+S.ch+':'+v.num;
  const enV=S.enVerses.find(e=>e.num===v.num);
  S.customVerse={ta:v.text,tref:taRef,en:enV?.text||'',ref:enRef};
  drawIG();toast('Using current verse');
}

// ── IG VERSE CONTROLS ─────────────────────────────────────────────
let _igVerseIdx = 0; // index in S.verses

function igUseCurrentVerse(){
  if(!S.verses.length){toast('முதலில் ஒரு chapter திறங்கள்');return;}
  // Use first highlighted verse or first verse
  const hlk=S.book+S.ch;const hlm=S.hl[hlk]||{};
  const hlNums=Object.keys(hlm).map(Number);
  const v=hlNums.length?S.verses.find(vv=>vv.num===hlNums[0]):S.verses[_igVerseIdx||0];
  if(!v)return;
  _igVerseIdx=S.verses.indexOf(v);
  igSetVerseDisplay(v);
  const taRef=(S.bookTaName||S.bookName)+' '+S.ch+':'+v.num;
  const enRef=S.bookName+' '+S.ch+':'+v.num;
  const enV=S.enVerses.find(e=>e.num===v.num);
  S.customVerse={ta:v.text,tref:taRef,en:enV?.text||'',ref:enRef};
  drawIG();
  toast('✓ Verse set for image');
}

function igUseVOTD(){
  const v=window._vd;if(!v)return;
  S.customVerse={ta:v.ta||'',tref:v.tref||'',en:v.en||v.text||'',ref:v.ref||''};
  const disp=document.getElementById('ig-verse-ta');
  const ref=document.getElementById('ig-verse-ref');
  if(disp)disp.textContent=v.ta||v.en||'';
  if(ref)ref.textContent=v.tref||v.ref||'';
  drawIG();
  toast('⭐ VOTD set for image');
}

function igNextVerse(){
  if(!S.verses.length){toast('முதலில் ஒரு chapter திறங்கள்');return;}
  _igVerseIdx=Math.min(_igVerseIdx+1,S.verses.length-1);
  const v=S.verses[_igVerseIdx];
  igSetVerseDisplay(v);
  const taRef=(S.bookTaName||S.bookName)+' '+S.ch+':'+v.num;
  const enRef=S.bookName+' '+S.ch+':'+v.num;
  const enV=S.enVerses.find(e=>e.num===v.num);
  S.customVerse={ta:v.text,tref:taRef,en:enV?.text||'',ref:enRef};
  drawIG();
}

function igPrevVerse(){
  if(!S.verses.length){toast('முதலில் ஒரு chapter திறங்கள்');return;}
  _igVerseIdx=Math.max(_igVerseIdx-1,0);
  const v=S.verses[_igVerseIdx];
  igSetVerseDisplay(v);
  const taRef=(S.bookTaName||S.bookName)+' '+S.ch+':'+v.num;
  const enRef=S.bookName+' '+S.ch+':'+v.num;
  const enV=S.enVerses.find(e=>e.num===v.num);
  S.customVerse={ta:v.text,tref:taRef,en:enV?.text||'',ref:enRef};
  drawIG();
}

function igSetVerseDisplay(v){
  if(!v)return;
  const taRef=(S.bookTaName||S.bookName)+' '+S.ch+':'+v.num;
  const disp=document.getElementById('ig-verse-ta');
  const ref=document.getElementById('ig-verse-ref');
  if(disp)disp.textContent=v.text.substring(0,80)+(v.text.length>80?'...':'');
  if(ref)ref.textContent='— '+taRef;
}

// Auto-populate image gen after chapter loads — called from loadCh()
function igAutoPopulate(){
  if(!S.verses.length)return;
  _igVerseIdx=0;
  igSetVerseDisplay(S.verses[0]);
  const taRef=(S.bookTaName||S.bookName)+' '+S.ch+':'+S.verses[0].num;
  const enV=S.enVerses.find(e=>e.num===S.verses[0].num);
  S.customVerse={ta:S.verses[0].text,tref:taRef,en:enV?.text||'',ref:S.bookName+' '+S.ch+':'+S.verses[0].num};
}


// ── SWIPE VERSE IMAGES ───────────────────────────────────────────
let igTouchX = 0;
function igTouchStart(e){ igTouchX = e.touches[0].clientX; }
function igTouchEnd(e){
  const dx = e.changedTouches[0].clientX - igTouchX;
  if(Math.abs(dx) > 40){ dx < 0 ? igNextVerse() : igPrevVerse(); }
}

// ── DRAW ─────────────────────────────────────────────────────────
function getIGVerse(){
  if(S.customVerse){return S.customVerse;}  // keep until user picks new verse
  // Use current verse if chapter is loaded
  if(S.verses.length){
    const v=S.verses[_igVerseIdx||0];
    const taRef=(S.bookTaName||S.bookName)+' '+S.ch+':'+v.num;
    const enV=S.enVerses.find(e=>e.num===v.num);
    return{ta:v.text,tref:taRef,en:enV?.text||'',ref:S.bookName+' '+S.ch+':'+v.num};
  }
  // Fallback to VOTD
  const vd=window._vd;
  if(vd)return{ta:vd.ta||'',tref:vd.tref||'',en:vd.en||vd.text||'',ref:vd.ref||''};
  return IGVERSES[0];
}

function drawIG(){
  const cv=document.getElementById('igcv');if(!cv)return;
  const[W,H]=RATIO[_igSz]||[1080,1920];
  cv.width=W;cv.height=H;
  const ctx=cv.getContext('2d');
  const v=getIGVerse();

  function drawWithImg(img,opacity){
    const ir=img.width/img.height,cr=W/H;
    let sx=0,sy=0,sw=img.width,sh=img.height;
    if(ir>cr){sw=img.height*cr;sx=(img.width-sw)/2;}
    else{sh=img.width/cr;sy=(img.height-sh)/2;}
    ctx.drawImage(img,sx,sy,sw,sh,0,0,W,H);
    ctx.fillStyle='rgba(0,0,0,'+opacity+')';
    ctx.fillRect(0,0,W,H);
    _drawIG(ctx,W,H,v,true);
  }

  if(_igMode==='photo'&&_userPhoto){
    const img=new Image();
    img.onload=()=>{
      const op=parseInt(document.getElementById('ig-opacity')?.value||'60')/100;
      drawWithImg(img,op);
    };
    img.src=_userPhoto;return;
  }

  if((_igMode==='unsplash')&&S.igBgImg){
    const op=S.igUnsOverlay||0.5;
    drawWithImg(S.igBgImg,op);
    return;
  }

  ctx.fillStyle=_igBgColor||'#8b1a1a';ctx.fillRect(0,0,W,H);
  _drawIG(ctx,W,H,v,false);
}

function _drawIG(ctx,W,H,v,isPhoto){
  // Detect light bg
  const hex=_igBgColor||'#8b1a1a';
  const rr=parseInt(hex.slice(1,3),16)||0;
  const gg=parseInt(hex.slice(3,5),16)||0;
  const bb2=parseInt(hex.slice(5,7),16)||0;
  const isLight=(0.299*rr+0.587*gg+0.114*bb2)>140&&!isPhoto;

  const accentColor = isPhoto ? 'rgba(255,255,255,0.9)' : (isLight ? hex : 'rgba(255,255,255,0.9)');
  const borderColor = isLight ? hex : 'rgba(255,255,255,0.85)';
  const textColor   = isLight ? '#1a0800' : 'rgba(255,255,255,0.95)';
  const refColor    = isLight ? hex : '#f5c870';
  const enColor     = isLight ? '#4a2000' : 'rgba(255,255,255,0.6)';
  const ftrBg       = isLight ? hex : (isPhoto ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.4)');

  ctx.textAlign='center';

  // TOP BAR
  ctx.fillStyle=isLight?hex:'rgba(255,255,255,0.15)';
  ctx.fillRect(0,0,W,Math.round(H*0.005));

  // CHURCH NAME
  ctx.fillStyle=isLight?hex:'rgba(255,220,180,0.85)';
  ctx.font=`600 ${Math.round(W*0.022)}px DM Sans,system-ui,sans-serif`;
  ctx.letterSpacing=Math.round(W*0.008)+'px';
  ctx.fillText('ELIM NEW JERUSALEM CHURCH',W/2,Math.round(H*0.065));
  ctx.letterSpacing='0px';

  // TAMIL SUBTITLE
  ctx.fillStyle=isLight?`${hex}88`:'rgba(255,200,150,0.45)';
  ctx.font=`${Math.round(W*0.018)}px Noto Serif Tamil,serif`;
  ctx.fillText('ஏலீம் புதிய எருசலேம் சபை',W/2,Math.round(H*0.085));

  // DIVIDER
  ctx.fillStyle=isLight?`${hex}33`:'rgba(255,255,255,0.15)';
  ctx.fillRect(W/2-60,Math.round(H*0.096),120,1.5);

  // VERSE BOX
  const boxX=Math.round(W*0.08), boxW=Math.round(W*0.84);
  const boxTop=Math.round(H*0.11), boxBot=Math.round(H*0.86);
  const boxH=boxBot-boxTop;
  const r2=Math.round(W*0.022);

  // Box border
  ctx.strokeStyle=isLight?`${hex}33`:'rgba(255,255,255,0.2)';
  ctx.lineWidth=Math.round(W*0.002);
  ctx.beginPath();
  ctx.roundRect(boxX,boxTop,boxW,boxH,r2);
  ctx.stroke();

  // Corner marks
  const cSize=Math.round(W*0.04), cW=Math.round(W*0.003);
  ctx.strokeStyle=borderColor;ctx.lineWidth=cW;ctx.lineCap='square';
  [[boxX,boxTop,1,1],[boxX+boxW,boxTop,-1,1],[boxX,boxTop+boxH,1,-1],[boxX+boxW,boxTop+boxH,-1,-1]].forEach(([x,y,dx,dy])=>{
    ctx.beginPath();ctx.moveTo(x,y+dy*cSize);ctx.lineTo(x,y);ctx.lineTo(x+dx*cSize,y);ctx.stroke();
  });

  // VERSE TEXT — centred
  const mW=boxW*0.82;
  const fontStack=_igFont==='serif'?'Noto Serif Tamil,Georgia,serif':
                  _igFont==='sans'?'DM Sans,system-ui,sans-serif':
                  _igFont==='italic'?'Noto Serif Tamil,Georgia,serif':
                  'Courier New,monospace';
  const fontPrefix=_igFont==='italic'?'italic ':'';

  function wrap(text,font,maxW){
    ctx.font=font;
    const words=text.split(' '),lines=[];let line='';
    for(const w of words){
      const t=line?line+' '+w:w;
      if(ctx.measureText(t).width>maxW&&line){lines.push(line);line=w;}
      else line=t;
    }
    if(line)lines.push(line);
    return lines;
  }

  // Calculate content total height to centre vertically
  const taFs=_igTaSize||52, taLh=taFs*1.65;
  const enFs=_igEnSize||36, enLh=enFs*1.55;
  const taFont=`${fontPrefix}${taFs}px ${fontStack}`;
  const enFont=`${fontPrefix}italic ${enFs}px Georgia,serif`;
  const taLines=v.ta?wrap('\u201c'+v.ta+'\u201d',taFont,mW):[];
  const enLines=v.en?wrap('\u201c'+v.en+'\u201d',enFont,mW):[];
  const totalH=(taLines.length*taLh)+(taFs*0.7)+(enFs*0.4)+(enLines.length*enLh)+(v.en?enFs*0.5:0)+30;
  let y=boxTop+(boxH-totalH)/2+taFs;

  // Tamil text
  if(v.ta){
    ctx.font=taFont;ctx.fillStyle=textColor;
    taLines.forEach(l=>{ctx.fillText(l,W/2,y);y+=taLh;});
    // Tamil ref
    y+=taFs*0.2;
    ctx.font=`700 ${Math.round(taFs*0.65)}px ${fontStack}`;
    ctx.fillStyle=refColor;
    ctx.fillText('\u2014 '+(v.tref||''),W/2,y);
    y+=taFs*0.5;
  }

  // Separator
  if(v.ta&&v.en){
    ctx.fillStyle='rgba(255,255,255,0.18)';
    ctx.fillRect(W/2-50,y,100,1.5);
    y+=enFs*0.5;
  }

  // English text
  if(v.en){
    ctx.font=enFont;ctx.fillStyle=enColor;
    enLines.forEach(l=>{ctx.fillText(l,W/2,y);y+=enLh;});
    y+=enFs*0.3;
    ctx.font=`${Math.round(enFs*0.7)}px DM Sans,system-ui,sans-serif`;
    ctx.fillStyle=refColor;ctx.globalAlpha=.65;
    ctx.fillText('\u2014 '+(v.ref||''),W/2,y);
    ctx.globalAlpha=1;
  }

  // FOOTER
  const ftH=Math.round(H*0.095);
  ctx.fillStyle=ftrBg;
  ctx.fillRect(0,H-ftH,W,ftH);

  // Footer divider
  ctx.fillStyle='rgba(255,255,255,0.1)';
  ctx.fillRect(0,H-ftH,W,1);

  // Social handles
  const yt='youtube.com/@ElimNewJerusalemChurch';
  const ig='/ElimNewJerusalemChurch';
  const fSize=Math.round(W*0.018);
  ctx.font=`${fSize}px DM Sans,system-ui,sans-serif`;

  // YouTube row
  const ytY=H-ftH+Math.round(ftH*0.38);
  ctx.fillStyle='#ff0000';ctx.globalAlpha=.9;
  ctx.fillRect(Math.round(W*0.06),ytY-fSize*.7,fSize,fSize);
  ctx.globalAlpha=1;
  ctx.fillStyle='rgba(255,255,255,0.7)';
  ctx.textAlign='left';
  ctx.fillText(yt,Math.round(W*0.06+fSize*1.3),ytY);

  // Instagram row
  const igY=H-ftH+Math.round(ftH*0.72);
  ctx.fillStyle='#e1306c';ctx.globalAlpha=.9;
  ctx.fillRect(Math.round(W*0.06),igY-fSize*.7,fSize,fSize);
  ctx.globalAlpha=1;
  ctx.fillStyle='rgba(255,255,255,0.7)';
  ctx.fillText(ig,Math.round(W*0.06+fSize*1.3),igY);
  ctx.textAlign='center';
}

// ── DOWNLOAD ─────────────────────────────────────────────────────
function dlIG(fmt){
  const cv=document.getElementById('igcv');if(!cv)return;
  const mime=fmt==='png'?'image/png':fmt==='webp'?'image/webp':'image/jpeg';
  const a=document.createElement('a');
  a.download=`enjc-verse-${_igSz.replace(':','x')}.${fmt}`;
  a.href=cv.toDataURL(mime,0.93);a.click();
  toast(`\u2193 ${fmt.toUpperCase()} Downloaded!`);
}

function shareToApp(app){
  const cv=document.getElementById('igcv');if(!cv)return;
  cv.toBlob(blob=>{
    const f=new File([blob],'enjc-verse.jpg',{type:'image/jpeg'});
    if(navigator.share&&navigator.canShare?.({files:[f]})){
      navigator.share({title:'ENJC Bible Verse',files:[f]});
    }else{
      // Fallback: download and guide
      dlIG('jpg');
      const msgs={wa:'WhatsApp-ல் share பண்ண: Save பண்ணி WhatsApp-ல் attach பண்ணுங்கள்',ig:'Instagram-ல் share பண்ண: Save பண்ணி Gallery-ல் இருந்து post பண்ணுங்கள்',yt:'YouTube Thumbnail-க்கு: Save பண்ணிய file-ஐ YouTube Studio-ல் upload பண்ணுங்கள்'};
      toast(msgs[app]||'Downloaded!',4000);
    }
  },'image/jpeg',0.93);
}

function copyImgToClipboard(){
  const cv=document.getElementById('igcv');if(!cv)return;
  cv.toBlob(async blob=>{
    try{
      await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);
      toast('📋 Image copied to clipboard!');
    }catch(e){dlIG('png');toast('📋 Saved — paste manually');}
  },'image/png');
}



// ── SETTINGS ─────────────────────────────────────────────────────
const THEMES={
  dark:{'--bg':'#07090f','--bg2':'#0c1018','--bg3':'#111926','--tx':'#dde4f0','--tx2':'rgba(221,228,240,.6)','--tx3':'rgba(221,228,240,.3)','--bd':'rgba(255,255,255,.06)','--bd2':'rgba(255,255,255,.14)','--gd':'#e8a020','--gd2':'#f5bf50','--gdm':'rgba(232,160,32,.12)','--gdb':'rgba(232,160,32,.28)'},
  sepia:{'--bg':'#f8f1e4','--bg2':'#f2e9d8','--bg3':'#ede0c8','--tx':'#2c1a0e','--tx2':'rgba(44,26,14,.6)','--tx3':'rgba(44,26,14,.35)','--bd':'rgba(44,26,14,.1)','--bd2':'rgba(44,26,14,.2)','--gd':'#8b4513','--gd2':'#a0522d','--gdm':'rgba(139,69,19,.1)','--gdb':'rgba(139,69,19,.25)'},
  light:{'--bg':'#f8f6f1','--bg2':'#eeece6','--bg3':'#e4e0d8','--tx':'#1c1710','--tx2':'rgba(28,23,16,.62)','--tx3':'rgba(28,23,16,.38)','--bd':'rgba(28,23,16,.09)','--bd2':'rgba(28,23,16,.18)','--gd':'#8a6009','--gd2':'#daa520','--gdm':'rgba(138,96,9,.09)','--gdb':'rgba(138,96,9,.28)'}
};

function applyTheme(theme){
  S.theme=theme;localStorage.setItem('enjc-theme',theme);
  const t=THEMES[theme]||THEMES.dark;
  const root=document.documentElement;

  // Set bible short vars (--bg, --tx etc) for bible-specific CSS classes
  Object.entries(t).forEach(([k,v])=>root.style.setProperty(k,v));

  // Sync data-theme attribute AND semantic vars so main.css nav/footer respond.
  // The alias bridge in main.css :root (--bg: var(--color-bg)) is overridden
  // by direct setProperty above, so we must also set semantic vars explicitly.
  const SEMANTIC_MAP = {
    '--bg':  '--color-bg',
    '--bg2': '--color-bg-2',
    '--bg3': '--color-bg-3',
    '--tx':  '--color-text',
    '--tx2': '--color-text-muted',
    '--tx3': '--color-text-faint',
    '--bd':  '--color-border',
    '--bd2': '--color-border-mid',
    '--gd':  '--color-gold',
    '--gdb': '--color-gold-border',
    '--gdm': '--color-gold-bg',
  };
  Object.entries(SEMANTIC_MAP).forEach(([short, long]) => {
    if (t[short]) root.style.setProperty(long, t[short]);
  });

  if(theme==='light'){root.setAttribute('data-theme','light');}
  else{root.removeAttribute('data-theme');}
}
function applyFont(fam){
  S.fontFamily=fam;localStorage.setItem('enjc_font',fam);
  const fonts={noto:"'Noto Serif Tamil',serif",latha:"'Latha','Arial Unicode MS',serif",bamini:"'Bamini',serif"};
  document.documentElement.style.setProperty('--tamil',fonts[fam]||fonts.noto);
}

// ── QUIZ ─────────────────────────────────────────────────────────
let _qi=0,_qs=0,_qo=[];

function renderQuiz(body){
  _qi=0;_qs=0;
  _qo=[...Array(QQ.length).keys()].sort(()=>Math.random()-.5);
  renderQQ(body);
}

function renderQQ(body){
  if(_qi>=_qo.length){
    const pct=Math.round(_qs/_qo.length*100);
    body.innerHTML=`<div style="text-align:center;padding:30px 16px">
      <div style="font-size:3rem;margin-bottom:12px">${pct>=80?'🏆':pct>=60?'⭐':'📖'}</div>
      <div style="font-size:1.6rem;font-weight:600;color:var(--gd);margin-bottom:6px">${_qs}/${_qo.length}</div>
      <div style="font-size:13px;color:var(--tx2);margin-bottom:20px">${pct>=80?'மிகவும் நல்லது! Excellent!':pct>=60?'நல்லது! Good!':'இன்னும் படியுங்கள்!'}</div>
      <button onclick="openPanel('quiz')" style="background:var(--gd);color:var(--bg);border:none;border-radius:99px;padding:11px 26px;font-size:13px;font-weight:500;cursor:pointer;font-family:var(--sans)">மீண்டும் விளையாடு</button>
    </div>`;return;
  }
  const q=QQ[_qo[_qi]];
  body.innerHTML=`
    <div style="padding:0 0 12px;border-bottom:1px solid var(--bd);margin-bottom:12px">
      <div style="font-size:9px;color:var(--tx3);letter-spacing:1px;margin-bottom:8px">கேள்வி ${_qi+1}/${_qo.length} · Score: ${_qs}</div>
      <div class="quiz-q">${q.q}</div>
      <div class="quiz-ref">${q.r}</div>
    </div>
    <div>${q.o.map((opt,i)=>`<button class="quiz-opt" onclick="ansQ(this,${i},${q.a},${_qi})">${'ABCD'[i]}. ${opt}</button>`).join('')}</div>`;
}

function ansQ(el,chosen,correct,qi){
  if(qi!==_qi)return;
  const body=el.closest('.panel-body');
  const correct_idx=correct;
  if(chosen===correct_idx)_qs++;
  body.querySelectorAll('.quiz-opt').forEach((b,i)=>{
    b.disabled=true;
    if(i===correct_idx)b.classList.add('correct');
    else if(i===chosen&&chosen!==correct_idx)b.classList.add('wrong');
  });
  toast(chosen===correct_idx?'✓ சரியான பதில்!':'✗ '+QQ[_qo[qi]].o[correct_idx]+' சரியான பதில்');
  setTimeout(()=>{_qi++;renderQQ(body);},1500);
}

// ── TRACKER ──────────────────────────────────────────────────────
const TK='enjc_read';
function getRead(){return JSON.parse(localStorage.getItem(TK)||'{}');}
function saveRead(d){localStorage.setItem(TK,JSON.stringify(d));}

function markRead(){
  if(!S.book||!S.ch)return;
  const d=getRead();
  if(!d[S.book])d[S.book]=[];
  if(!d[S.book].includes(S.ch)){
    d[S.book].push(S.ch);saveRead(d);
    const bk=BOOKS.find(b=>b.id===S.book);
    const pct=Math.round(d[S.book].length/(bk?.ch||1)*100);
    toast('\u2713 '+S.bookTaName+' Ch.'+S.ch+' read! ('+pct+'%)');
    updateTrackerBadge();
  }
}
// ── VERSE MODAL ──────────────────────────────────────────────────
let _mv=null;

function openVModal(i){
  const v=S.verses[i];if(!v)return;
  // Build _mv state (used by mAct)
  // Build cross-language verse data for sheet
  const _taVerse = S.taVerses.find(t=>t.num===v.num);
  const _enVerse = S.enVerses.find(e=>e.num===v.num);
  _mv={i,v,
    ref:S.bookName+' '+S.ch+':'+v.num,
    taRef:(S.bookTaName||S.bookName)+' '+S.ch+':'+v.num,
    // Tamil: from taVerses → if reading in Tamil use verse text → else empty
    ta: (_taVerse?.text) || (S.lang==='ta' ? v.text : ''),
    // English: from enVerses → if reading in English use verse text → else empty
    en: (_enVerse?.text) || (S.lang==='en' ? v.text : '')
  };

  // ── Populate bottom sheet ────────────────────────────
  // Toggle vopen class — remove from previously open verse only
  const prevOpen = document.querySelector('.vi.vopen');
  if(prevOpen) prevOpen.classList.remove('vopen');
  const viEl = document.getElementById('vi'+i);
  if(viEl) viEl.classList.add('vopen');

  const sheet     = document.getElementById('verse-sheet');
  const backdrop  = document.getElementById('sheet-backdrop');
  if(!sheet) return;

  // Reference pill
  const refText = _mv.taRef+(_mv.ref!==_mv.taRef?' · '+_mv.ref:'');
  const el=document.getElementById('vs-ref');
  if(el) el.textContent = refText;

  // Tamil verse
  const taEl = document.getElementById('vs-ta');
  if(taEl){
    taEl.textContent = _mv.ta ? '\u201c'+_mv.ta+'\u201d' : '';
    taEl.style.cssText = ''; // reset highlight
  }

  // English verse
  const enEl = document.getElementById('vs-en');
  if(enEl){
    enEl.textContent = _mv.en ? '\u201c'+_mv.en+'\u201d' : '';
    enEl.style.display = _mv.en ? 'block' : 'none';
  }

  // Note
  const notes=JSON.parse(localStorage.getItem('enjc_notes')||'{}');
  const noteEl=document.getElementById('vs-note');
  if(noteEl) noteEl.value = notes[_mv.ref]||'';

  // Bookmark state
  const isBm=S.bm.some(b=>b.ref===_mv.ref);
  const bmBtn=document.getElementById('sheet-bm-btn');
  if(bmBtn) bmBtn.classList.toggle('saved', isBm);

  // Reset highlight dots
  document.querySelectorAll('.hldot').forEach(d=>d.classList.remove('on'));

  // Hide highlight row
  const hlRow=document.getElementById('vs-hl-row');
  if(hlRow) hlRow.style.display='none';

  // Open sheet
  sheet.classList.add('open');
  if(backdrop) backdrop.classList.add('open');
  document.body.style.overflow='hidden';
}

function closeVModal(e){
  const sheet    = document.getElementById('verse-sheet');
  const backdrop = document.getElementById('sheet-backdrop');
  if(sheet)    sheet.classList.remove('open');
  if(backdrop) backdrop.classList.remove('open');
  document.body.style.overflow='';
  // Remove vopen so action buttons hide again on mobile
  document.querySelectorAll('.vi.vopen').forEach(el=>el.classList.remove('vopen'));
}

function mAct(action){
  if(!_mv)return;

  if(action==='ta-audio'){
    speak(_mv.ta||_mv.v.text,'ta');
    toast('▶ Tamil audio...');
  }
  else if(action==='en-audio'){
    speak(_mv.en||_mv.v.text,'en');
    toast('▶ English audio...');
  }
  else if(action==='image'){
    S.customVerse={ta:_mv.ta,tref:_mv.taRef,en:_mv.en,ref:_mv.ref};
    closeVModal();
    openPanel('img');setTimeout(drawIG,100);
  }
  else if(action==='save'){
    const bms=S.bm;
    const fi=bms.findIndex(b=>b.ref===_mv.ref);
    if(fi>=0){
      bms.splice(fi,1);saveBM(bms);
      const bmBtn=document.getElementById('sheet-bm-btn');
      if(bmBtn)bmBtn.classList.remove('saved');
      toast('Removed');
    } else {
      bms.unshift({ref:_mv.ref,refTA:_mv.taRef,text:_mv.ta||_mv.en});
      saveBM(bms);
      const bmBtn=document.getElementById('sheet-bm-btn');
      if(bmBtn)bmBtn.classList.add('saved');
      toast('\u2665 Saved!');
    }
    updateBmBadge();
  }
  else if(action==='copy'){
    const out=(_mv.taRef?_mv.taRef+'\n'+_mv.ta+'\n':'')+_mv.ref+'\n'+(_mv.en||_mv.ta);
    navigator.clipboard?.writeText(out);
    toast('📋 Copied!');
  }
  else if(action==='share'){
    const msg=(_mv.taRef+'\n'+_mv.ta+'\n\n'+_mv.ref+'\n'+(_mv.en||'')+'\n\nhttps://elimnewjerusalem.github.io/enjc-bible/bible.html').trim();
    if(navigator.share)navigator.share({title:'ENJC Bible',text:msg});
    else{navigator.clipboard?.writeText(msg);toast('Copied!');}
  }
}

let _noteDebounce;
function autoSaveNote(text){
  if(!_mv)return;
  // Debounce — save after 800ms of inactivity, don't re-render on every keystroke
  clearTimeout(_noteDebounce);
  _noteDebounce = setTimeout(()=>{
    const notes=JSON.parse(localStorage.getItem('enjc_notes')||'{}');
    if(text.trim())notes[_mv.ref]=text.trim();else delete notes[_mv.ref];
    localStorage.setItem('enjc_notes',JSON.stringify(notes));
    S.notes=notes;
    // Update inline preview only after debounce
    if(S.verses.length) renderVerses();
  }, 800);
}

// ── CACHE UTILS ──────────────────────────────────────────────────
function getCacheInfo(){
  const keys=Object.keys(localStorage).filter(k=>k.startsWith('enjc_ta_'));
  const kb=Math.round(keys.reduce((a,k)=>{try{return a+(localStorage.getItem(k)||'').length;}catch(e){return a;}},0)/1024);
  return keys.length+' chapters cached ('+kb+' KB)';
}


// ── NX PARALLEL TOGGLE (checkbox version) ────────────────

// Sync old togParallel to also update checkbox


// ── DAILY BIBLE READ ─────────────────────────────────────────────
// 365-day plan: Genesis→Revelation + Psalms/Proverbs interleaved
const DAILY_PLAN = (function(){
  // Simple sequential plan: one chapter per day, cycling through OT+NT
  const schedule = [
    // Week 1 — Genesis + Matthew
    {book:'genesis',ch:1,label:'ஆதியாகமம் 1 — படைப்பு',ta:'Genesis 1',en:'Gen 1'},
    {book:'matthew',ch:1,label:'மத்தேயு 1 — இயேசுவின் வரலாறு',ta:'Matthew 1',en:'Matt 1'},
    {book:'genesis',ch:2,label:'ஆதியாகமம் 2 — ஏதேன் தோட்டம்',ta:'Genesis 2',en:'Gen 2'},
    {book:'matthew',ch:2,label:'மத்தேயு 2 — மேலவர்களின் வருகை',ta:'Matthew 2',en:'Matt 2'},
    {book:'genesis',ch:3,label:'ஆதியாகமம் 3 — வீழ்ச்சி',ta:'Genesis 3',en:'Gen 3'},
    {book:'psalms',ch:1,label:'சங்கீதம் 1 — பாக்கியமான மனுஷன்',ta:'Psalms 1',en:'Ps 1'},
    {book:'matthew',ch:3,label:'மத்தேயு 3 — யோவானின் ஊழியம்',ta:'Matthew 3',en:'Matt 3'},
    // Week 2
    {book:'genesis',ch:4,label:'ஆதியாகமம் 4 — காயீன் ஆபேல்',ta:'Genesis 4',en:'Gen 4'},
    {book:'john',ch:1,label:'யோவான் 1 — வார்த்தை மாம்சமானது',ta:'John 1',en:'John 1'},
    {book:'psalms',ch:23,label:'சங்கீதம் 23 — ஆண்டவர் என் மேய்ப்பர்',ta:'Psalms 23',en:'Ps 23'},
    {book:'romans',ch:8,label:'ரோமர் 8 — ஆவியில் வாழ்க்கை',ta:'Romans 8',en:'Rom 8'},
    {book:'john',ch:3,label:'யோவான் 3 — யோவான் 3:16',ta:'John 3',en:'John 3'},
    {book:'proverbs',ch:1,label:'நீதிமொழிகள் 1 — ஞானத்தின் ஆரம்பம்',ta:'Proverbs 1',en:'Prov 1'},
    {book:'philippians',ch:4,label:'பிலிப்பியர் 4 — சந்தோஷமாயிருங்கள்',ta:'Philippians 4',en:'Phil 4'},
    // Week 3
    {book:'isaiah',ch:40,label:'ஏசாயா 40 — புதுப்பெலன் அடைவார்கள்',ta:'Isaiah 40',en:'Isa 40'},
    {book:'john',ch:14,label:'யோவான் 14 — நான்தான் வழி',ta:'John 14',en:'John 14'},
    {book:'psalms',ch:46,label:'சங்கீதம் 46 — தேவன் நமக்கு அடைக்கலம்',ta:'Psalms 46',en:'Ps 46'},
    {book:'matthew',ch:5,label:'மத்தேயு 5 — மலைப்பிரசங்கம்',ta:'Matthew 5',en:'Matt 5'},
    {book:'1corinthians',ch:13,label:'1 கொரிந்தியர் 13 — அன்பின் அத்தியாயம்',ta:'1 Corinthians 13',en:'1 Cor 13'},
    {book:'psalms',ch:91,label:'சங்கீதம் 91 — தேவனின் பாதுகாப்பு',ta:'Psalms 91',en:'Ps 91'},
    {book:'hebrews',ch:11,label:'எபிரெயர் 11 — விசுவாசத்தின் அத்தியாயம்',ta:'Hebrews 11',en:'Heb 11'},
    // Week 4
    {book:'revelation',ch:21,label:'வெளிப்படுத்தல் 21 — எல்லாம் புதிதாகும்',ta:'Revelation 21',en:'Rev 21'},
    {book:'luke',ch:1,label:'லூக்கா 1 — மரியாளின் கீதம்',ta:'Luke 1',en:'Luke 1'},
    {book:'psalms',ch:119,label:'சங்கீதம் 119 — வேத வசனம்',ta:'Psalms 119',en:'Ps 119'},
    {book:'acts',ch:2,label:'அப்போஸ்தலர் 2 — பெந்தெகோஸ்தே',ta:'Acts 2',en:'Acts 2'},
    {book:'proverbs',ch:3,label:'நீதிமொழிகள் 3 — கர்த்தரில் நம்பிக்கை',ta:'Proverbs 3',en:'Prov 3'},
    {book:'luke',ch:15,label:'லூக்கா 15 — தொலைந்த மகன்',ta:'Luke 15',en:'Luke 15'},
    {book:'ephesians',ch:6,label:'எபேசியர் 6 — ஆவிக்குரிய யுத்த ஆயுதம்',ta:'Ephesians 6',en:'Eph 6'},
  ];
  return schedule;
})();

function getDailyProgress(){
  try{ return JSON.parse(localStorage.getItem('enjc_daily')||'{}'); }catch(e){ return {}; }
}
function saveDailyProgress(d){ localStorage.setItem('enjc_daily',JSON.stringify(d)); }
function updateDailyBadge(){
  const prog = getDailyProgress();
  const done = Object.values(prog).filter(Boolean).length;
  const badge = g('daily-badge');
  if(badge) badge.textContent = done > 0 ? done+'/'+DAILY_PLAN.length : '';
}

function renderDaily(body){
  const prog = getDailyProgress();
  const todayKey = new Date().toISOString().slice(0,10); // YYYY-MM-DD
  const totalDone = Object.values(prog).filter(Boolean).length;
  const streak = calcStreak(prog);

  let html = `
  <div class="dp-stats">
    <div class="dp-stat"><span class="dp-stat-n">${totalDone}</span><span class="dp-stat-l">முடிந்தது</span></div>
    <div class="dp-stat"><span class="dp-stat-n">${DAILY_PLAN.length - totalDone}</span><span class="dp-stat-l">மீதமுள்ளது</span></div>
    <div class="dp-stat"><span class="dp-stat-n">${streak}</span><span class="dp-stat-l">🔥 Streak</span></div>
  </div>
  <div class="dp-bar-wrap"><div class="dp-bar" style="width:${Math.round(totalDone/DAILY_PLAN.length*100)}%"></div></div>
  <p class="dp-tip">ஒவ்வொரு நாளும் ஒரு அதிகாரம் படியுங்கள் 📖</p>
  <div class="dp-list">`;

  DAILY_PLAN.forEach((item, i) => {
    const key = 'day_'+i;
    const done = !!prog[key];
    const isToday = !prog[todayKey+'_done'] && !done && Object.values(prog).filter(Boolean).length === i;
    html += `
    <div class="dp-item${done?' dp-done':''}${isToday?' dp-today':''}">
      <div class="dp-check" onclick="toggleDailyDay(${i})" title="${done?'Mark unread':'Mark as read'}">
        ${done ? '<i class="ti ti-check"></i>' : (isToday?'<i class="ti ti-book-open"></i>':'<span class="dp-day-n">'+(i+1)+'</span>')}
      </div>
      <div class="dp-info">
        <div class="dp-label">${item.label}</div>
        <div class="dp-ref">${item.en}</div>
      </div>
      <button class="dp-go" onclick="goDailyChapter('${item.book}',${item.ch})" title="இந்த அதிகாரம் படி">
        <i class="ti ti-arrow-right"></i>
      </button>
    </div>`;
  });

  html += '</div>';
  body.innerHTML = html;
  updateDailyBadge();
}

function calcStreak(prog){
  let streak = 0;
  const today = new Date();
  for(let i = DAILY_PLAN.length-1; i >= 0; i--){
    if(prog['day_'+i]) streak++;
    else break;
  }
  return streak;
}

function toggleDailyDay(i){
  const prog = getDailyProgress();
  prog['day_'+i] = !prog['day_'+i];
  saveDailyProgress(prog);
  // Re-render
  const body = g('panel-body');
  if(body) renderDaily(body);
  updateDailyBadge();
}

function goDailyChapter(book, ch){
  // Navigate to that chapter
  S.book = book; S.ch = ch;
  closePanel();
  loadCh();
  // Auto-mark as read after going there
  const i = DAILY_PLAN.findIndex(d=>d.book===book&&d.ch===ch);
  if(i >= 0){
    const prog = getDailyProgress();
    prog['day_'+i] = true;
    saveDailyProgress(prog);
    updateDailyBadge();
  }
}

// ── THEME SYNC: Override site.js toggleTheme to also update bible CSS vars ──
// Called when user clicks the nav theme button on the bible page
// ── Expose for site.js theme delegation & bible-mobile.js ────────────────────────────────
window._applyTheme = applyTheme;
window.S = S;
window.BOOKS = BOOKS;
