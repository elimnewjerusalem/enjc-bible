
'use strict';

// ── DATA ─────────────────────────────────────────────────────────

window.SIZES={
  '9:16':{w:1080,h:1920,label:'Story / Reel',hint:'1080×1920'},
  '3:4': {w:900, h:1200,label:'Portrait Post',hint:'900×1200'},
  '1:1': {w:1080,h:1080,label:'Square Post',hint:'1080×1080'},
  '16:9':{w:1920,h:1080,label:'YouTube / Wide',hint:'1920×1080'},
};

window.TEMPLATES=[
  {id:'royal',   name:'Royal Dark',   bg:'#0d0621',accent:'#f5c842',tc:'#fff'},
  {id:'fire',    name:'Fire & Faith', bg:'#1a0500',accent:'#ff7020',tc:'#fff'},
  {id:'ocean',   name:'Ocean Grace',  bg:'#020d1a',accent:'#38bdf8',tc:'#e0f2fe'},
  {id:'forest',  name:'Forest Life',  bg:'#061009',accent:'#4ade80',tc:'#dcfce7'},
  {id:'dawn',    name:'New Dawn',     bg:'#1a0c00',accent:'#fbbf24',tc:'#fffbeb'},
  {id:'night',   name:'Starry Night', bg:'#020208',accent:'#a78bfa',tc:'#ede9fe'},
  {id:'rose',    name:'Rose Grace',   bg:'#1a0510',accent:'#f472b6',tc:'#fce7f3'},
  {id:'stone',   name:'Stone & Word', bg:'#0f0f0f',accent:'#d4b896',tc:'#f5f0eb'},
];

window.FONTS={
  serif: {label:'Serif',   fam:"'Noto Serif Tamil',Georgia,serif",  hint:'Traditional'},
  sans:  {label:'Sans',    fam:"'Inter',system-ui,sans-serif",       hint:'Modern'},
  italic:{label:'Italic',  fam:"'Playfair Display',Georgia,serif",   hint:'Elegant'},
  bold:  {label:'Bold',    fam:"700 'Noto Serif Tamil',serif",       hint:'Strong'},
};

window.TC_COLORS=['#ffffff','#f5f5dc','#fffde7','#f5c842','#fbbf24','#fb923c','#f87171','#4ade80','#34d399','#38bdf8','#60a5fa','#f472b6','#c084fc','#a78bfa','#fed7aa','#fca5a5','#d1fae5','#1a1a1a'];

window.PRESETS=[
  '#1a0a3a','#0a1a3a','#0a2a1a','#3a0a0a',
  '#1a1a1a','#2a1a08','#08082a','#1a0820',
  '#2d1654','#0d2447','#14451f','#45140d',
  '#0f0f0f','#1a1500','#001a1a','#1a001a',
];

window.GALLERY=[
  /* ── Nature ── */
  {seed:'dawn',    name:'Sunrise',  label:'🌅', url:'https://picsum.photos/seed/dawn/1080/1920',    group:'Nature'},
  {seed:'ocean1',  name:'Ocean',    label:'🌊', url:'https://picsum.photos/seed/ocean1/1080/1920',  group:'Nature'},
  {seed:'forest3', name:'Forest',   label:'🌲', url:'https://picsum.photos/seed/forest3/1080/1920', group:'Nature'},
  {seed:'mount2',  name:'Mountain', label:'⛰',  url:'https://picsum.photos/seed/mount2/1080/1920',  group:'Nature'},
  {seed:'sky77',   name:'Sky',      label:'☁',  url:'https://picsum.photos/seed/sky77/1080/1920',   group:'Nature'},
  {seed:'wheat1',  name:'Harvest',  label:'🌾', url:'https://picsum.photos/seed/wheat1/1080/1920',  group:'Nature'},
  {seed:'river4',  name:'River',    label:'🏞',  url:'https://picsum.photos/seed/river4/1080/1920',  group:'Nature'},
  {seed:'flower9', name:'Flowers',  label:'🌸', url:'https://picsum.photos/seed/flower9/1080/1920', group:'Nature'},
  {seed:'desert2', name:'Desert',   label:'🏜',  url:'https://picsum.photos/seed/desert2/1080/1920', group:'Nature'},
  {seed:'night3',  name:'Night Sky',label:'🌙', url:'https://picsum.photos/seed/night3/1080/1920',  group:'Nature'},
  /* ── Faith ── */
  {seed:'bible1',  name:'Open Bible',  label:'📖', url:'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1080&h=1920&fit=crop', group:'Faith'},
  {seed:'cross1',  name:'Cross',       label:'✝',  url:'https://images.unsplash.com/photo-1531913964703-f7a1c2a1b8c9?w=1080&h=1920&fit=crop', group:'Faith'},
  {seed:'pray1',   name:'Prayer',      label:'🙏', url:'https://images.unsplash.com/photo-1457269449834-928af64c684d?w=1080&h=1920&fit=crop', group:'Faith'},
  {seed:'church1', name:'Church',      label:'⛪', url:'https://images.unsplash.com/photo-1520803941685-7f2c71cf1a28?w=1080&h=1920&fit=crop', group:'Faith'},
  {seed:'candle1', name:'Candle',      label:'🕯', url:'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=1080&h=1920&fit=crop', group:'Faith'},
  {seed:'dove2',   name:'Holy Spirit', label:'🌟', url:'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1080&h=1920&fit=crop', group:'Faith'},
];
window.GALLERY_GROUPS=['All','Nature','Faith'];

export const BOOKS=[
  {id:'genesis',n:1,ta:'ஆதியாகமம்',en:'Genesis',ch:50,t:'OT'},
  {id:'exodus',n:2,ta:'யாத்திராகமம்',en:'Exodus',ch:40,t:'OT'},
  {id:'leviticus',n:3,ta:'லேவியராகமம்',en:'Leviticus',ch:27,t:'OT'},
  {id:'numbers',n:4,ta:'எண்ணாகமம்',en:'Numbers',ch:36,t:'OT'},
  {id:'deuteronomy',n:5,ta:'உபாகமம்',en:'Deuteronomy',ch:34,t:'OT'},
  {id:'joshua',n:6,ta:'யோசுவா',en:'Joshua',ch:24,t:'OT'},
  {id:'judges',n:7,ta:'நியாயாதிபதிகள்',en:'Judges',ch:21,t:'OT'},
  {id:'ruth',n:8,ta:'ரூத்',en:'Ruth',ch:4,t:'OT'},
  {id:'1samuel',n:9,ta:'1 சாமுவேல்',en:'1 Samuel',ch:31,t:'OT'},
  {id:'2samuel',n:10,ta:'2 சாமுவேல்',en:'2 Samuel',ch:24,t:'OT'},
  {id:'1kings',n:11,ta:'1 இராஜாக்கள்',en:'1 Kings',ch:22,t:'OT'},
  {id:'2kings',n:12,ta:'2 இராஜாக்கள்',en:'2 Kings',ch:25,t:'OT'},
  {id:'1chronicles',n:13,ta:'1 நாளாகமம்',en:'1 Chronicles',ch:29,t:'OT'},
  {id:'2chronicles',n:14,ta:'2 நாளாகமம்',en:'2 Chronicles',ch:36,t:'OT'},
  {id:'ezra',n:15,ta:'எஸ்றா',en:'Ezra',ch:10,t:'OT'},
  {id:'nehemiah',n:16,ta:'நெகேமியா',en:'Nehemiah',ch:13,t:'OT'},
  {id:'esther',n:17,ta:'எஸ்தர்',en:'Esther',ch:10,t:'OT'},
  {id:'job',n:18,ta:'யோபு',en:'Job',ch:42,t:'OT'},
  {id:'psalms',n:19,ta:'சங்கீதம்',en:'Psalms',ch:150,t:'OT'},
  {id:'proverbs',n:20,ta:'நீதிமொழிகள்',en:'Proverbs',ch:31,t:'OT'},
  {id:'ecclesiastes',n:21,ta:'பிரசங்கி',en:'Ecclesiastes',ch:12,t:'OT'},
  {id:'songofsolomon',n:22,ta:'உன்னதப்பாட்டு',en:'Song of Solomon',ch:8,t:'OT'},
  {id:'isaiah',n:23,ta:'ஏசாயா',en:'Isaiah',ch:66,t:'OT'},
  {id:'jeremiah',n:24,ta:'எரேமியா',en:'Jeremiah',ch:52,t:'OT'},
  {id:'lamentations',n:25,ta:'புலம்பல்',en:'Lamentations',ch:5,t:'OT'},
  {id:'ezekiel',n:26,ta:'எசேக்கியேல்',en:'Ezekiel',ch:48,t:'OT'},
  {id:'daniel',n:27,ta:'தானியேல்',en:'Daniel',ch:12,t:'OT'},
  {id:'hosea',n:28,ta:'ஓசியா',en:'Hosea',ch:14,t:'OT'},
  {id:'joel',n:29,ta:'யோவேல்',en:'Joel',ch:3,t:'OT'},
  {id:'amos',n:30,ta:'ஆமோஸ்',en:'Amos',ch:9,t:'OT'},
  {id:'obadiah',n:31,ta:'ஒபதியா',en:'Obadiah',ch:1,t:'OT'},
  {id:'jonah',n:32,ta:'யோனா',en:'Jonah',ch:4,t:'OT'},
  {id:'micah',n:33,ta:'மீகா',en:'Micah',ch:7,t:'OT'},
  {id:'nahum',n:34,ta:'நாகூம்',en:'Nahum',ch:3,t:'OT'},
  {id:'habakkuk',n:35,ta:'ஆபகூக்',en:'Habakkuk',ch:3,t:'OT'},
  {id:'zephaniah',n:36,ta:'செப்பனியா',en:'Zephaniah',ch:3,t:'OT'},
  {id:'haggai',n:37,ta:'ஆகாய்',en:'Haggai',ch:2,t:'OT'},
  {id:'zechariah',n:38,ta:'சகரியா',en:'Zechariah',ch:14,t:'OT'},
  {id:'malachi',n:39,ta:'மல்கியா',en:'Malachi',ch:4,t:'OT'},
  {id:'matthew',n:40,ta:'மத்தேயு',en:'Matthew',ch:28,t:'NT'},
  {id:'mark',n:41,ta:'மாற்கு',en:'Mark',ch:16,t:'NT'},
  {id:'luke',n:42,ta:'லூக்கா',en:'Luke',ch:24,t:'NT'},
  {id:'john',n:43,ta:'யோவான்',en:'John',ch:21,t:'NT'},
  {id:'acts',n:44,ta:'அப்போஸ்தலர்',en:'Acts',ch:28,t:'NT'},
  {id:'romans',n:45,ta:'ரோமர்',en:'Romans',ch:16,t:'NT'},
  {id:'1corinthians',n:46,ta:'1 கொரிந்தியர்',en:'1 Corinthians',ch:16,t:'NT'},
  {id:'2corinthians',n:47,ta:'2 கொரிந்தியர்',en:'2 Corinthians',ch:13,t:'NT'},
  {id:'galatians',n:48,ta:'கலாத்தியர்',en:'Galatians',ch:6,t:'NT'},
  {id:'ephesians',n:49,ta:'எபேசியர்',en:'Ephesians',ch:6,t:'NT'},
  {id:'philippians',n:50,ta:'பிலிப்பியர்',en:'Philippians',ch:4,t:'NT'},
  {id:'colossians',n:51,ta:'கொலோசெயர்',en:'Colossians',ch:4,t:'NT'},
  {id:'1thessalonians',n:52,ta:'1 தெசலோனிக்கேயர்',en:'1 Thessalonians',ch:5,t:'NT'},
  {id:'2thessalonians',n:53,ta:'2 தெசலோனிக்கேயர்',en:'2 Thessalonians',ch:3,t:'NT'},
  {id:'1timothy',n:54,ta:'1 தீமோத்தேயு',en:'1 Timothy',ch:6,t:'NT'},
  {id:'2timothy',n:55,ta:'2 தீமோத்தேயு',en:'2 Timothy',ch:4,t:'NT'},
  {id:'titus',n:56,ta:'தீத்து',en:'Titus',ch:3,t:'NT'},
  {id:'philemon',n:57,ta:'பிலேமோன்',en:'Philemon',ch:1,t:'NT'},
  {id:'hebrews',n:58,ta:'எபிரெயர்',en:'Hebrews',ch:13,t:'NT'},
  {id:'james',n:59,ta:'யாக்கோபு',en:'James',ch:5,t:'NT'},
  {id:'1peter',n:60,ta:'1 பேதுரு',en:'1 Peter',ch:5,t:'NT'},
  {id:'2peter',n:61,ta:'2 பேதுரு',en:'2 Peter',ch:3,t:'NT'},
  {id:'1john',n:62,ta:'1 யோவான்',en:'1 John',ch:5,t:'NT'},
  {id:'2john',n:63,ta:'2 யோவான்',en:'2 John',ch:1,t:'NT'},
  {id:'3john',n:64,ta:'3 யோவான்',en:'3 John',ch:1,t:'NT'},
  {id:'jude',n:65,ta:'யூதா',en:'Jude',ch:1,t:'NT'},
  {id:'revelation',n:66,ta:'வெளிப்படுத்தல்',en:'Revelation',ch:22,t:'NT'},
];

// BOOKS via ES module export (imagegen-main.js Object.assign exposes it to window)

window.VERSE_TAGS=['All','Faith','Peace','Strength','Love','Hope','Healing'];
window.BOOKS=BOOKS;

window.QUICK_VERSES=[
  {ta:'தேவன் இவ்வளவாய் உலகத்தில் அன்பு கூர்ந்தார்.',tref:'யோவான் 3:16',en:'For God so loved the world.',ref:'John 3:16',tags:['Love','Faith']},
  {ta:'என்னை பலப்படுத்துகிற கிறிஸ்துவினால் எல்லாவற்றையும் செய்யவல்லேன்.',tref:'பிலிப்பியர் 4:13',en:'I can do all things through Christ who strengthens me.',ref:'Philippians 4:13',tags:['Strength','Faith']},
  {ta:'கர்த்தர் என் மேய்ப்பர்; எனக்கு குறைவுண்டாவதில்லை.',tref:'சங்கீதம் 23:1',en:'The Lord is my shepherd; I shall not want.',ref:'Psalm 23:1',tags:['Peace','Faith']},
  {ta:'நீ என் கண்களுக்கு அருமையானவன்; நான் உன்னை நேசிக்கிறேன்.',tref:'ஏசாயா 43:4',en:'You are precious in my sight, and I love you.',ref:'Isaiah 43:4',tags:['Love']},
  {ta:'கர்த்தருக்கு காத்திருக்கிறவர்களோ புதுப்பெலன் அடைவார்கள்.',tref:'ஏசாயா 40:31',en:'They who wait for the Lord shall renew their strength.',ref:'Isaiah 40:31',tags:['Strength','Hope']},
  {ta:'வருத்தப்பட்டு பாரஞ்சுமக்கிறவர்களே, என்னிடத்தில் வாருங்கள்.',tref:'மத்தேயு 11:28',en:'Come to me, all who labour and are heavy laden.',ref:'Matthew 11:28',tags:['Peace','Healing']},
  {ta:'உன் சம்பூர்ண இருதயத்தோடே கர்த்தரில் நம்பிக்கைவை.',tref:'நீதிமொழிகள் 3:5',en:'Trust in the Lord with all your heart.',ref:'Proverbs 3:5',tags:['Faith']},
  {ta:'சமாதானத்தை உங்களுக்கு வைத்துவிடுகிறேன்.',tref:'யோவான் 14:27',en:'Peace I leave with you; my peace I give to you.',ref:'John 14:27',tags:['Peace']},
  {ta:'என்னால் நினைக்கப்படுகிற நினைவுகளை நான் அறிவேன்.',tref:'எரேமியா 29:11',en:'For I know the plans I have for you.',ref:'Jeremiah 29:11',tags:['Hope','Faith']},
  {ta:'திடமனதாயிரு, தைரியமாயிரு; கர்த்தர் உன்னோடிருக்கிறார்.',tref:'யோசுவா 1:9',en:'Be strong and courageous. The Lord your God is with you.',ref:'Joshua 1:9',tags:['Strength','Faith']},
  {ta:'கர்த்தர் என் வெளிச்சமும் என் இரட்சிப்புமாயிருக்கிறார்.',tref:'சங்கீதம் 27:1',en:'The Lord is my light and my salvation; whom shall I fear?',ref:'Psalm 27:1',tags:['Faith','Hope']},
  {ta:'என் கிருபை உனக்குப் போதும்.',tref:'2 கொரிந்தியர் 12:9',en:'My grace is sufficient for you.',ref:'2 Corinthians 12:9',tags:['Healing','Faith']},
  {ta:'தேவனிடத்தில் அன்பு கூருகிறவர்களுக்கு எல்லாமும் நன்மைக்கு ஏதுவாக நடக்கும்.',tref:'ரோமர் 8:28',en:'All things work together for good to those who love God.',ref:'Romans 8:28',tags:['Hope','Faith']},
  {ta:'இயேசு கிறிஸ்துவே நேற்றும் இன்றும் என்றும் மாறாதவர்.',tref:'எபிரெயர் 13:8',en:'Jesus Christ is the same yesterday and today and forever.',ref:'Hebrews 13:8',tags:['Faith']},
  {ta:'கர்த்தருடைய கிருபைகள் தீர்ந்துபோவதில்லை.',tref:'புலம்பல் 3:22',en:'The steadfast love of the Lord never ceases.',ref:'Lamentations 3:22',tags:['Love','Hope']},
  {ta:'அன்பே தேவன்.',tref:'1 யோவான் 4:8',en:'God is love.',ref:'1 John 4:8',tags:['Love']},
  {ta:'கர்த்தர் என் கோட்டையும் என் கன்மலையும் என் இரட்சகரும் ஆவார்.',tref:'சங்கீதம் 18:2',en:'The Lord is my rock and my fortress and my deliverer.',ref:'Psalm 18:2',tags:['Strength','Faith']},
  {ta:'இதோ, நான் உங்களுக்கு ஆரோக்கியத்தையும் சுகத்தையும் கொடுப்பேன்.',tref:'எரேமியா 33:6',en:'I will bring health and healing to them.',ref:'Jeremiah 33:6',tags:['Healing']},
  {ta:'கர்த்தருக்கு நன்றி சொல்லுங்கள்; அவர் நல்லவர்.',tref:'சங்கீதம் 107:1',en:'Give thanks to the Lord, for He is good.',ref:'Psalm 107:1',tags:['Faith','Hope']},
  {ta:'தேவன் நம்முடன் இருக்கிறார்.',tref:'மத்தேயு 1:23',en:'God is with us.',ref:'Matthew 1:23',tags:['Faith','Hope']},
];

// ── STATE ─────────────────────────────────────────────────────────
window.ST={
  sz:'9:16', bgMode:'solid', bgColor:'#1a0a3a',
  font:'serif', taSize:52, enSize:32, txColor:'#ffffff',
  showTa:true, showEn:true, showRef:true, showWM:true, textGlow:false,
  bgImg:null, galImg:null, userPhoto:null, galIdx:-1,
  verse:window.QUICK_VERSES[0], verseIdx:0,
  activeTpl:'royal',
  // Gradient
  gradMode:false, grad1:'#1a0a3a', grad2:'#0a1a3a', gradAngle:135,
  // Safe zone
  safeZone:false,
  // Text layout — must be in ST to avoid NaN in canvas draw
  textPos:0.5, autoFit:true,
};
window.BI={book:null,ch:null,_verses:[],_filter:'all',_search:''};

// ── HELPERS ───────────────────────────────────────────────────────
window.g=function(id){return document.getElementById(id);}
window._tt;
window.toast=function(msg,dur=2500){
  const el=window.g('toast');if(!el)return;el.textContent=msg;el.classList.add('show');
  clearTimeout(window._tt);window._tt=setTimeout(()=>el.classList.remove('show'),dur);
}

