// ── EXPORT ───────────────────────────────────────────────────────
window.dlIG = function(fmt){
  const cv=g('igcv');if(!cv)return;
  const mime=fmt==='png'?'image/png':fmt==='webp'?'image/webp':'image/jpeg';
  const a=document.createElement('a');
  a.download=`enjc-verse-${ST.sz.replace(':','x')}.${fmt}`;
  a.href=cv.toDataURL(mime,0.93);a.click();
  toast('↓ '+fmt.toUpperCase()+' downloaded!');
}
window.copyImg = function(){
  const cv=g('igcv');if(!cv)return;
  cv.toBlob(async blob=>{
    try{
      await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);
      toast('📋 Copied!');
    }catch{dlIG('png');toast('\uD83D\uDCCB Saved!');}
  },'image/png');
}
window.shareWA = function(){shareFile();};
window.shareApp = function(app){shareFile();};
window.shareNative = function(){shareFile();};
window.shareFile = function(){
  const cv=g('igcv');if(!cv)return;
  cv.toBlob(blob=>{
    const f=new File([blob],'enjc-verse.jpg',{type:'image/jpeg'});
    if(navigator.share&&navigator.canShare?.({files:[f]})){
      navigator.share({title:'ENJC Bible Verse',files:[f]});
    }else{
      dlIG('jpg');
      toast('📱 Saved! Attach in WhatsApp / Instagram',3500);
    }
  },'image/jpeg',0.93);
}
export function goBack(){window.location.href='bible.html';}


