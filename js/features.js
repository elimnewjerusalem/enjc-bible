'use strict';
// ═══════════════════════════════════════════════════════════════
//  features.js — standalone JS for all feature pages
//  Quiz · Daily · Saved · Notes · Compare · Search
// ═══════════════════════════════════════════════════════════════

// DOM helpers
function g(id){return document.getElementById(id);}
function safe(id,v){const el=g(id);if(el)el.textContent=v;}

// Config
const C={
  enAPI:'https://bible-api.com/',
  bollsText:'https://bolls.life/get-text/',
  data:'data/',
  ms:9000,
};
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

function getVerCode(verId){return(VERSIONS.find(v=>v.id===verId)||{}).code;}
function getVer(verId){return VERSIONS.find(v=>v.id===verId);}

const BOOKS=[
  {id:'genesis',n:1,name:'Genesis',ta:'ஆதியாகமம்',ch:50,t:'OT'},{id:'exodus',n:2,name:'Exodus',ta:'யாத்திராகமம்',ch:40,t:'OT'},{id:'leviticus',n:3,name:'Leviticus',ta:'லேவியராகமம்',ch:27,t:'OT'},{id:'numbers',n:4,name:'Numbers',ta:'எண்ணாகமம்',ch:36,t:'OT'},{id:'deuteronomy',n:5,name:'Deuteronomy',ta:'உபாகமம்',ch:34,t:'OT'},{id:'joshua',n:6,name:'Joshua',ta:'யோசுவா',ch:24,t:'OT'},{id:'judges',n:7,name:'Judges',ta:'நியாயாதிபதிகள்',ch:21,t:'OT'},{id:'ruth',n:8,name:'Ruth',ta:'ரூத்',ch:4,t:'OT'},{id:'1+samuel',n:9,name:'1 Samuel',ta:'1 சாமுவேல்',ch:31,t:'OT'},{id:'2+samuel',n:10,name:'2 Samuel',ta:'2 சாமுவேல்',ch:24,t:'OT'},{id:'1+kings',n:11,name:'1 Kings',ta:'1 இராஜாக்கள்',ch:22,t:'OT'},{id:'2+kings',n:12,name:'2 Kings',ta:'2 இராஜாக்கள்',ch:25,t:'OT'},{id:'1+chronicles',n:13,name:'1 Chronicles',ta:'1 நாளாகமம்',ch:29,t:'OT'},{id:'2+chronicles',n:14,name:'2 Chronicles',ta:'2 நாளாகமம்',ch:36,t:'OT'},{id:'ezra',n:15,name:'Ezra',ta:'எஸ்றா',ch:10,t:'OT'},{id:'nehemiah',n:16,name:'Nehemiah',ta:'நெகேமியா',ch:13,t:'OT'},{id:'esther',n:17,name:'Esther',ta:'எஸ்தர்',ch:10,t:'OT'},{id:'job',n:18,name:'Job',ta:'யோபு',ch:42,t:'OT'},{id:'psalms',n:19,name:'Psalms',ta:'சங்கீதம்',ch:150,t:'OT'},{id:'proverbs',n:20,name:'Proverbs',ta:'நீதிமொழிகள்',ch:31,t:'OT'},{id:'ecclesiastes',n:21,name:'Ecclesiastes',ta:'பிரசங்கி',ch:12,t:'OT'},{id:'song+of+solomon',n:22,name:'Song of Solomon',ta:'உன்னதப்பாட்டு',ch:8,t:'OT'},{id:'isaiah',n:23,name:'Isaiah',ta:'ஏசாயா',ch:66,t:'OT'},{id:'jeremiah',n:24,name:'Jeremiah',ta:'எரேமியா',ch:52,t:'OT'},{id:'lamentations',n:25,name:'Lamentations',ta:'புலம்பல்',ch:5,t:'OT'},{id:'ezekiel',n:26,name:'Ezekiel',ta:'எசேக்கியேல்',ch:48,t:'OT'},{id:'daniel',n:27,name:'Daniel',ta:'தானியேல்',ch:12,t:'OT'},{id:'hosea',n:28,name:'Hosea',ta:'ஓசியா',ch:14,t:'OT'},{id:'joel',n:29,name:'Joel',ta:'யோவேல்',ch:3,t:'OT'},{id:'amos',n:30,name:'Amos',ta:'ஆமோஸ்',ch:9,t:'OT'},{id:'obadiah',n:31,name:'Obadiah',ta:'ஒபதியா',ch:1,t:'OT'},{id:'jonah',n:32,name:'Jonah',ta:'யோனா',ch:4,t:'OT'},{id:'micah',n:33,name:'Micah',ta:'மீகா',ch:7,t:'OT'},{id:'nahum',n:34,name:'Nahum',ta:'நாகூம்',ch:3,t:'OT'},{id:'habakkuk',n:35,name:'Habakkuk',ta:'ஆபகூக்',ch:3,t:'OT'},{id:'zephaniah',n:36,name:'Zephaniah',ta:'செப்பனியா',ch:3,t:'OT'},{id:'haggai',n:37,name:'Haggai',ta:'ஆகாய்',ch:2,t:'OT'},{id:'zechariah',n:38,name:'Zechariah',ta:'சகரியா',ch:14,t:'OT'},{id:'malachi',n:39,name:'Malachi',ta:'மல்கியா',ch:4,t:'OT'},
  {id:'matthew',n:40,name:'Matthew',ta:'மத்தேயு',ch:28,t:'NT'},{id:'mark',n:41,name:'Mark',ta:'மாற்கு',ch:16,t:'NT'},{id:'luke',n:42,name:'Luke',ta:'லூக்கா',ch:24,t:'NT'},{id:'john',n:43,name:'John',ta:'யோவான்',ch:21,t:'NT'},{id:'acts',n:44,name:'Acts',ta:'அப்போஸ்தலர்',ch:28,t:'NT'},{id:'romans',n:45,name:'Romans',ta:'ரோமர்',ch:16,t:'NT'},{id:'1+corinthians',n:46,name:'1 Corinthians',ta:'1 கொரிந்தியர்',ch:16,t:'NT'},{id:'2+corinthians',n:47,name:'2 Corinthians',ta:'2 கொரிந்தியர்',ch:13,t:'NT'},{id:'galatians',n:48,name:'Galatians',ta:'கலாத்தியர்',ch:6,t:'NT'},{id:'ephesians',n:49,name:'Ephesians',ta:'எபேசியர்',ch:6,t:'NT'},{id:'philippians',n:50,name:'Philippians',ta:'பிலிப்பியர்',ch:4,t:'NT'},{id:'colossians',n:51,name:'Colossians',ta:'கொலோசெயர்',ch:4,t:'NT'},{id:'1+thessalonians',n:52,name:'1 Thessalonians',ta:'1 தெசலோனிக்கேயர்',ch:5,t:'NT'},{id:'2+thessalonians',n:53,name:'2 Thessalonians',ta:'2 தெசலோனிக்கேயர்',ch:3,t:'NT'},{id:'1+timothy',n:54,name:'1 Timothy',ta:'1 தீமோத்தேயு',ch:6,t:'NT'},{id:'2+timothy',n:55,name:'2 Timothy',ta:'2 தீமோத்தேயு',ch:4,t:'NT'},{id:'titus',n:56,name:'Titus',ta:'தீத்து',ch:3,t:'NT'},{id:'philemon',n:57,name:'Philemon',ta:'பிலேமோன்',ch:1,t:'NT'},{id:'hebrews',n:58,name:'Hebrews',ta:'எபிரெயர்',ch:13,t:'NT'},{id:'james',n:59,name:'James',ta:'யாக்கோபு',ch:5,t:'NT'},{id:'1+peter',n:60,name:'1 Peter',ta:'1 பேதுரு',ch:5,t:'NT'},{id:'2+peter',n:61,name:'2 Peter',ta:'2 பேதுரு',ch:3,t:'NT'},{id:'1+john',n:62,name:'1 John',ta:'1 யோவான்',ch:5,t:'NT'},{id:'2+john',n:63,name:'2 John',ta:'2 யோவான்',ch:1,t:'NT'},{id:'3+john',n:64,name:'3 John',ta:'3 யோவான்',ch:1,t:'NT'},{id:'jude',n:65,name:'Jude',ta:'யூதா',ch:1,t:'NT'},{id:'revelation',n:66,name:'Revelation',ta:'வெளிப்படுத்தல்',ch:22,t:'NT'}
];

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

let _quizSet=-1;
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


const S={
  bm:   JSON.parse(localStorage.getItem('enjc_bm')  ||'[]'),
  notes:JSON.parse(localStorage.getItem('enjc_notes')||'{}'),
  ver:  localStorage.getItem('enjc_ver')||'taov',
  book:'',bookName:'',bookTaName:'',bookNum:1,ch:1,
  enDB:{},
};
function saveBM(bms){localStorage.setItem('enjc_bm',JSON.stringify(bms));S.bm=bms;}
function updateBmBadge(){}
function toast(msg){
  let t=g('ft');
  if(!t){t=document.createElement('div');t.id='ft';t.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#c8a45a;color:#000;padding:8px 18px;border-radius:99px;font-size:13px;font-weight:600;z-index:9999;pointer-events:none;transition:opacity .3s';document.body.appendChild(t);}
  t.textContent=msg;t.style.opacity='1';
  clearTimeout(t._tid);t._tid=setTimeout(()=>t.style.opacity='0',2400);
}

async function fetchWithTimeout(url,ms=8000){
  const ctrl=new AbortController();
  const tid=setTimeout(()=>ctrl.abort(),ms);
  try{const r=await fetch(url,{signal:ctrl.signal});clearTimeout(tid);return r;}
  catch(e){clearTimeout(tid);throw e;}
}

async function fetchT(url){
  const c=new AbortController();
  const t=setTimeout(()=>c.abort(),C.ms);
  try{const r=await fetch(url,{signal:c.signal});clearTimeout(t);return r;}
  catch(e){clearTimeout(t);throw e;}
}

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

async function fetchVersionChapter(verId){
  const v=getVer(verId);if(!v||!S.book)return[];
  if(v.src==='bolls'){
    try{return await fetchBolls(v.bcode,S.bookNum,S.ch);}catch(e){return[];}
  }
  if(v.src==='local'){
    // Try local cache first
    const localBook=S.enDB[S.bookNum];
    if(localBook&&localBook[S.ch]&&localBook[S.ch].length){
      return localBook[S.ch].map((t,i)=>({num:i+1,text:t||''}));
    }
    // Fallback: use bolls.life KJV (book num)
    try{return await fetchBolls('KJV',S.bookNum,S.ch);}catch(e){}
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

function cpV(ref,text){
  navigator.clipboard?.writeText(ref+' \u2014 '+text);
  toast('\uD83D\uDCCB Copied! '+ref);
}

function rmBM(i){
  const bms=S.bm;bms.splice(i,1);saveBM(bms);
  const m=g('fp-body');if(m&&typeof renderBM==='function')renderBM(m);
}
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
  const m=g('fp-body');if(m)renderNotesPanel(m);
  if(S.book)renderVerses();
}

function goToNoteRef(ref){
  const m=ref.match(/^(.+)\s(\d+):(\d+)/);
  if(!m)return;
  const bk=BOOKS.find(b=>b.name.toLowerCase()===m[1].trim().toLowerCase());
  if(!bk)return;
  try{sessionStorage.setItem('enjc_go',JSON.stringify({book:bk.id,ch:parseInt(m[2])}));}catch(e){}
  location.href='bible.html';
}
let _cmpA="taov",_cmpB="kjv",_cmpData=null;
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
  const out=g('cmp-body')||g('fp-body');if(!out)return;
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
      <button onclick="renderQuiz(g('fp-body'))" style="background:var(--gd,#c8a45a);color:#000;border:none;border-radius:99px;padding:11px 26px;font-size:13px;font-weight:500;cursor:pointer">மீண்டும் விளையாடு</button>
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
  const body=el.closest('[id]');
  if(!body)return;
  if(chosen===correct)_qs++;
  body.querySelectorAll('.quiz-opt').forEach((b,i)=>{
    b.disabled=true;
    if(i===correct)b.classList.add('correct');
    else if(i===chosen&&chosen!==correct)b.classList.add('wrong');
  });
  toast(chosen===correct?'✓ சரியான பதில்!':'✗ '+QQ[_qo[qi]].o[correct]+' சரியான பதில்');
  setTimeout(()=>{_qi++;renderQQ(body);},1500);
}
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

function saveDailyProgress(d){localStorage.setItem("enjc_daily",JSON.stringify(d));}
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

function goDailyChapter(book,ch){
  const i=DAILY_PLAN.findIndex(d=>d.book===book&&d.ch===ch);
  if(i>=0){const p=getDailyProgress();p['day_'+i]=true;saveDailyProgress(p);}
  try{sessionStorage.setItem('enjc_go',JSON.stringify({book,ch}));}catch(e){}
  location.href='bible.html';
}
