// ── DRAW ─────────────────────────────────────────────────────────
window.roundRect = function(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

window.draw = function(){
  const cv=g('igcv');if(!cv)return;
  const sz=SIZES[ST.sz]||SIZES['9:16'];
  const W=sz.w, H=sz.h;
  cv.width=W; cv.height=H;
  const ctx=cv.getContext('2d');
  const v=ST.verse||QUICK_VERSES[0];

  // ── BACKGROUND ──────────────────────────────────────
  if(ST.bgMode==='photo'&&ST.userPhoto){
    drawBgImage(ctx,ST.userPhoto,W,H,parseInt(g('photo-ov')?.value||55)/100);
  } else if(ST.bgMode==='gallery'&&ST.galImg){
    drawBgImage(ctx,ST.galImg,W,H,parseInt(g('gal-ov')?.value||50)/100);
  } else if(ST.bgMode==='gradient'){
    const ar=(ST.gradAngle||135)*Math.PI/180;
    const d=Math.sqrt(W*W+H*H)/2;
    const grd=ctx.createLinearGradient(W/2-Math.cos(ar)*d,H/2-Math.sin(ar)*d,W/2+Math.cos(ar)*d,H/2+Math.sin(ar)*d);
    grd.addColorStop(0,ST.grad1||'#1a0a3a');
    grd.addColorStop(1,ST.grad2||'#0a1a3a');
    ctx.fillStyle=grd; ctx.fillRect(0,0,W,H);
    // vignette
    const vg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,W*.75);
    vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.28)');
    ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  } else {
    const hex=ST.bgColor||'#1a0a3a';
    ctx.fillStyle=hex;ctx.fillRect(0,0,W,H);
    const r=parseInt(hex.slice(1,3),16)||0,gv=parseInt(hex.slice(3,5),16)||0,b=parseInt(hex.slice(5,7),16)||0;
    const rg=ctx.createRadialGradient(W/2,H*.3,0,W/2,H*.3,W*.85);
    rg.addColorStop(0,`rgba(${Math.min(r+25,255)},${Math.min(gv+25,255)},${Math.min(b+25,255)},.2)`);
    rg.addColorStop(1,'rgba(0,0,0,.3)');
    ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);
    const dg=ctx.createLinearGradient(0,H*.55,0,H);
    dg.addColorStop(0,'rgba(0,0,0,0)');dg.addColorStop(1,'rgba(0,0,0,.45)');
    ctx.fillStyle=dg;ctx.fillRect(0,H*.55,W,H*.45);
  }

  // ── HEADER — centered: logo + church name + address ──
  // 16:9 needs taller header since H is small (1080px vs 1920px)
  const isLandscape = W > H;
  const HDR=Math.round(H*(isLandscape ? 0.155 : 0.105));
  const PAD=Math.round(W*0.055);

  if(ST.showWM){
    const wmName=(g('wm-name')?.value||'ELIM NEW JERUSALEM CHURCH').toUpperCase();
    const wmSub=g('wm-sub')?.value||'No.110E, Elaya Street, Tondiarpet, Chennai, 600 081';

    // Header dark overlay
    const hg=ctx.createLinearGradient(0,0,0,HDR*1.3);
    hg.addColorStop(0,'rgba(0,0,0,.78)');hg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=hg;ctx.fillRect(0,0,W,HDR*1.3);

    const LSZ=Math.round(HDR*0.85); // bigger logo
    const LY=Math.round((HDR-LSZ)/2);

    // Total content width = logo + gap + text block
    // First measure text
    // Scale font to header height for better 16:9 fit
    const maxHdrWidth = W - Math.round(W*0.08); // leave 4% margin on each side
    const gap=Math.round(W*0.028);
    
    // Start with target font size
    let nameFs=Math.round(HDR*(isLandscape ? 0.34 : 0.32));
    let textBoxW = maxHdrWidth - LSZ - gap; // available width for text
    
    // Ensure text fits by reducing font if needed
    while(nameFs > Math.round(HDR*0.18)){
      ctx.font=`700 ${nameFs}px Inter,system-ui,sans-serif`;
      const nameW=ctx.measureText(wmName).width;
      if(nameW <= textBoxW) break;
      nameFs = Math.round(nameFs * 0.92);
    }
    
    const gap2=Math.round(W*0.028);
    const startX=Math.round(W*0.04); // fixed left margin
    const LX=startX;

    // ── Logo box — use actual logo image ──
    // Draw logo image if loaded, else fallback to text box
    if(window._logoImg&&window._logoImg.complete&&window._logoImg.naturalWidth>0){
      // Draw logo — maintain aspect ratio
      const lRatio = window._logoImg.naturalWidth / window._logoImg.naturalHeight;
      const lW = LSZ;
      const lH = Math.round(LSZ / lRatio);
      const lOffY = Math.round((LSZ - lH) / 2);
      ctx.drawImage(window._logoImg, LX, LY + lOffY, lW, lH);
    } else {
      // Fallback: text box
      ctx.strokeStyle='rgba(245,200,80,.9)';
      ctx.lineWidth=Math.round(W*0.0038);
      ctx.strokeRect(LX,LY,LSZ,LSZ);
      ctx.fillStyle='rgba(0,0,20,.5)';
      ctx.fillRect(LX+2,LY+2,LSZ-4,LSZ-4);
      ctx.textAlign='center';
      ctx.font=`800 ${Math.round(LSZ*.4)}px Inter,sans-serif`;
      ctx.fillStyle='rgba(245,200,80,.95)';
      ctx.fillText('ENJC',LX+LSZ/2,LY+LSZ*.54);
      ctx.font=`500 ${Math.round(LSZ*.135)}px Inter,sans-serif`;
      ctx.fillStyle='rgba(255,255,255,.42)';
      ctx.fillText('CHURCH',LX+LSZ/2,LY+LSZ*.79);
    }

    // ── Church name ──
    const NX = LX + LSZ + gap2;
    const maxTextW = maxHdrWidth - (NX - W*0.04); // max width for name/sub
    ctx.textAlign='left';
    ctx.font=`700 ${nameFs}px Inter,system-ui,sans-serif`;
    ctx.fillStyle='rgba(255,255,255,.92)';
    // Clip text to max width if needed
    ctx.save();
    ctx.beginPath();
    ctx.rect(NX, LY, maxTextW, LSZ);
    ctx.clip();
    ctx.fillText(wmName,NX,LY+LSZ*.46);

    // ── Address sub text ──
    const subFs=Math.round(nameFs*.58);
    ctx.font=`400 ${subFs}px Inter,sans-serif`;
    ctx.fillStyle='rgba(255,255,255,.44)';
    ctx.fillText(wmSub,NX,LY+LSZ*.76);
    ctx.restore();

    // Gold divider
    ctx.strokeStyle='rgba(245,200,80,.28)';
    ctx.lineWidth=Math.round(H*0.0014);
    ctx.beginPath();ctx.moveTo(PAD,HDR);ctx.lineTo(W-PAD,HDR);ctx.stroke();
  }

  // ── FOOTER — centered: YT + IG handles, no buttons ──
  const FTH=Math.round(H*(isLandscape ? 0.16 : 0.1));
  const FTY=H-FTH;

  // Footer bg
  const fg=ctx.createLinearGradient(0,FTY-Math.round(H*0.03),0,H);
  fg.addColorStop(0,'rgba(0,0,0,0)');
  fg.addColorStop(.25,'rgba(0,0,0,.7)');
  fg.addColorStop(1,'rgba(0,0,0,.92)');
  ctx.fillStyle=fg;ctx.fillRect(0,FTY-Math.round(H*0.03),W,FTH+Math.round(H*0.03));

  // Gold top line
  ctx.strokeStyle='rgba(245,200,80,.32)';
  ctx.lineWidth=Math.round(H*0.0014);
  ctx.beginPath();ctx.moveTo(Math.round(W*0.08),FTY);ctx.lineTo(Math.round(W*0.92),FTY);ctx.stroke();

  const FSZ=Math.round(FTH*(isLandscape ? 0.3 : 0.28));
  const ICW=Math.round(FSZ*1.3), ICH=Math.round(FSZ*.85);
  const maxFooterW = W - Math.round(W*0.08); // 4% margin on each side

  // ── YouTube row — centered with text clipping ──
  const YTY=FTY+Math.round(FTH*0.32);
  const ytHandle='youtube.com/@ElimNewJerusalemChurchOfficial';
  let ytFSZ = FSZ;
  // Reduce font size if text is too long
  while(ytFSZ > Math.round(FTH*0.12)){
    ctx.font=`500 ${ytFSZ}px Inter,sans-serif`;
    const ytTW=ctx.measureText(ytHandle).width;
    const ytRowW=ICW+Math.round(W*0.018)+ytTW;
    if(ytRowW <= maxFooterW) break;
    ytFSZ = Math.round(ytFSZ * 0.9);
  }
  
  ctx.font=`500 ${ytFSZ}px Inter,sans-serif`;
  const ytTW=ctx.measureText(ytHandle).width;
  const ytRowW=ICW+Math.round(W*0.018)+ytTW;
  const ytStartX=Math.round((W-ytRowW)/2);
  
  // YT icon
  ctx.fillStyle='#ff0000';
  roundRect(ctx, ytStartX, YTY - ICH * 0.78, ICW, ICH, 3); ctx.fill();
  ctx.font=`700 ${Math.round(ICH*.7)}px sans-serif`;
  ctx.fillStyle='#fff';ctx.textAlign='center';
  ctx.fillText('▶',ytStartX+ICW/2,YTY-ICH*.15);
  // YT text with clipping
  ctx.font=`500 ${ytFSZ}px Inter,sans-serif`;
  ctx.fillStyle='rgba(255,255,255,.8)';ctx.textAlign='left';
  ctx.save();
  ctx.beginPath();
  ctx.rect(ytStartX+ICW+Math.round(W*0.018), YTY-ICH, maxFooterW-(ytStartX+ICW), ICH*1.5);
  ctx.clip();
  ctx.fillText(ytHandle,ytStartX+ICW+Math.round(W*0.018),YTY);
  ctx.restore();

  // ── Instagram row — centered with text clipping ──
  const IGY=FTY+Math.round(FTH*0.74);
  const igHandle='@elimnewjerusalemchurch';
  let igFSZ = FSZ;
  // Reduce font size if text is too long
  while(igFSZ > Math.round(FTH*0.12)){
    ctx.font=`500 ${igFSZ}px Inter,sans-serif`;
    const igTW=ctx.measureText(igHandle).width;
    const igRowW=ICW+Math.round(W*0.018)+igTW;
    if(igRowW <= maxFooterW) break;
    igFSZ = Math.round(igFSZ * 0.9);
  }
  
  ctx.font=`500 ${igFSZ}px Inter,sans-serif`;
  const igTW=ctx.measureText(igHandle).width;
  const igRowW=ICW+Math.round(W*0.018)+igTW;
  const igStartX=Math.round((W-igRowW)/2);
  // IG gradient icon
  const igG2=ctx.createLinearGradient(igStartX,IGY,igStartX+ICW,IGY);
  igG2.addColorStop(0,'#f58529');igG2.addColorStop(.5,'#dd2a7b');igG2.addColorStop(1,'#8134af');
  ctx.fillStyle=igG2;
  roundRect(ctx, igStartX, IGY - ICH * 0.78, ICW, ICH, 4); ctx.fill();
  ctx.font=`${Math.round(ICH*.72)}px serif`;
  ctx.fillStyle='#fff';ctx.textAlign='center';
  ctx.fillText('◉',igStartX+ICW/2,IGY-ICH*.1);
  // IG text with clipping
  ctx.font=`500 ${igFSZ}px Inter,sans-serif`;
  ctx.fillStyle='rgba(255,255,255,.8)';ctx.textAlign='left';
  ctx.save();
  ctx.beginPath();
  ctx.rect(igStartX+ICW+Math.round(W*0.018), IGY-ICH, maxFooterW-(igStartX+ICW), ICH*1.5);
  ctx.clip();
  ctx.fillText(igHandle,igStartX+ICW+Math.round(W*0.018),IGY);
  ctx.restore();

  ctx.textAlign='center';

  // ── VERSE AREA ──────────────────────────────────────
  // Box between header and footer
  const BX=PAD, BW=W-PAD*2;
  const BTOP=ST.showWM ? Math.round(HDR*1.04) : Math.round(H*0.04);
  const BBOT=FTY - Math.round(H*0.015);
  const BH=BBOT-BTOP;
  const BR=Math.round(W*0.022);

  // Subtle box bg
  ctx.fillStyle='rgba(255,255,255,.025)';
  roundRect(ctx, BX, BTOP, BW, BH, BR); ctx.fill();
  // Box border
  ctx.strokeStyle='rgba(255,255,255,.1)';
  ctx.lineWidth=Math.round(W*0.0016);
  roundRect(ctx, BX, BTOP, BW, BH, BR); ctx.stroke();
  // Gold corner marks
  const CS=Math.round(W*0.046), CW=Math.round(W*0.003);
  ctx.strokeStyle='rgba(245,200,80,.7)';
  ctx.lineWidth=CW;ctx.lineCap='square';
  [[BX,BTOP,1,1],[BX+BW,BTOP,-1,1],[BX,BBOT,1,-1],[BX+BW,BBOT,-1,-1]].forEach(([x,y,dx,dy])=>{
    ctx.beginPath();ctx.moveTo(x,y+dy*CS);ctx.lineTo(x,y);ctx.lineTo(x+dx*CS,y);ctx.stroke();
  });

  // ── VERSE TEXT ──────────────────────────────────────
  const fontSpec=FONTS[ST.font];
  const fam=(fontSpec?.fam||FONTS.serif.fam).replace(/^700 /,'');
  const isBold=ST.font==='bold';
  const isItalic=ST.font==='italic';

  // Use 80% of box width for text
  const TW=Math.round(BW*0.80);
  const TX=W/2; // centered

  // Cap font sizes — scale based on box height AND width
  const rawTaFs=parseInt(g('ta-size')?.value||52);
  const rawEnFs=parseInt(g('en-size')?.value||32);
  // Font cap raised — slider can reach 150px Tamil, 120px English
  const taFsCap = Math.min(rawTaFs, Math.round(W * 0.13));
  const enFsCap = Math.min(rawEnFs, Math.round(W * 0.09));
  let taFs = taFsCap;
  let enFs = enFsCap;
  // Auto-fit: shrink Tamil font until lines fit within 80% of canvas width
  if(ST.autoFit!==false && v.ta){
    const testFont = (fs)=>`${isBold?'700 ':isItalic?'italic ':''}${fs}px ${fam}`;
    const maxFitW = Math.round(BW*0.80);  // match wrapText threshold
    let fitFs = taFs;
    while(fitFs > 18){
      ctx.font = testFont(fitFs);
      const words = ('"'+(v.ta||'')+'"').split(' ');
      let maxLineW = 0, line = '';
      for(const w of words){
        const t = line?line+' '+w:w;
        if(ctx.measureText(t).width > maxFitW && line){ maxLineW=Math.max(maxLineW,ctx.measureText(line).width); line=w; }
        else line=t;
      }
      maxLineW = Math.max(maxLineW, ctx.measureText(line).width);
      if(maxLineW <= maxFitW) break;
      fitFs = Math.round(fitFs*0.93);
    }
    taFs = Math.min(taFs, fitFs);
  }
  const taLh=taFs*1.72;
  const enLh=enFs*1.62;
  const tc=ST.txColor||'#fff';

  function wrapText(text, font, maxW){
    ctx.font=font;
    const words=text.split(' ');
    const lines=[];let line='';
    for(const w of words){
      const t=line?line+' '+w:w;
      if(ctx.measureText(t).width>maxW&&line){lines.push(line);line=w;}
      else line=t;
    }
    if(line)lines.push(line);
    return lines;
  }

  const taFont=`${isBold?'700 ':isItalic?'italic ':''}${taFs}px ${fam}`;
  const enFont=`italic ${enFs}px 'Playfair Display',Georgia,serif`;
  const taLines=ST.showTa&&v.ta ? wrapText('“'+v.ta+'”', taFont, TW) : [];
  const enLines=ST.showEn&&v.en ? wrapText('“'+v.en+'”', enFont, TW) : [];

  const refH=ST.showRef ? taFs*0.62+8 : 0;
  const sepH=(taLines.length&&enLines.length) ? enFs*0.5+6 : 0;
  let totalH=taLines.length*taLh+(taLines.length?8:0)+refH+sepH+enLines.length*enLh+(enLines.length?8:0);

  // Safety: if text overflows box, clamp cy to keep it inside
  const maxTextH = BH * 0.92;
  const scale = totalH > maxTextH ? maxTextH / totalH : 1;
  const taLhS = taLh * scale;
  const enLhS = enLh * scale;
  totalH = totalH * scale;

  // Vertical position inside box — textPos: 0=top 0.5=centre 1=bottom
  const tp = ST.textPos!==undefined ? ST.textPos : 0.5;
  const vPad = Math.round(BH*0.04);
  const availH = BH - vPad*2;
  let cy = BTOP + vPad + tp*(availH-totalH) + taFs*scale;
  cy = Math.max(BTOP + vPad + taFs*scale, cy); // clamp — never above box top

  // Clip all verse text to box bounds
  ctx.save();
  ctx.beginPath();
  ctx.rect(BX+Math.round(W*0.02), BTOP+Math.round(H*0.01), BW-Math.round(W*0.04), BH-Math.round(H*0.02));
  ctx.clip();

  // Glow
  if(ST.textGlow){ctx.shadowColor='rgba(255,215,80,.5)';ctx.shadowBlur=Math.round(W*0.016);}

  // Tamil
  if(taLines.length){
    ctx.textAlign='center';
    ctx.font=taFont;
    ctx.fillStyle=tc;
    taLines.forEach(l=>{ctx.fillText(l,TX,cy);cy+=taLhS;});
    if(ST.showRef&&v.tref){
      cy+=8;ctx.shadowBlur=0;
      ctx.font=`600 ${Math.round(taFs*.52)}px Inter,sans-serif`;
      ctx.fillStyle='rgba(245,200,80,.88)';
      ctx.fillText('— '+v.tref,TX,cy);
      cy+=Math.round(taFs*.52)+6;
      if(ST.textGlow){ctx.shadowColor='rgba(255,215,80,.5)';ctx.shadowBlur=Math.round(W*0.012);}
    }
  }

  // Separator
  if(taLines.length&&enLines.length){
    ctx.shadowBlur=0;
    ctx.strokeStyle='rgba(255,255,255,.13)';
    ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(TX-Math.round(W*0.06),cy);ctx.lineTo(TX+Math.round(W*0.06),cy);ctx.stroke();
    cy+=sepH;
    if(ST.textGlow){ctx.shadowColor='rgba(255,215,80,.5)';ctx.shadowBlur=Math.round(W*0.01);}
  }

  // English
  if(enLines.length){
    ctx.textAlign='center';
    ctx.font=enFont;
    ctx.fillStyle=tc==='#ffffff'?'rgba(255,255,255,.7)':tc;
    enLines.forEach(l=>{ctx.fillText(l,TX,cy);cy+=enLhS;});
    if(ST.showRef&&v.ref){
      cy+=6;ctx.shadowBlur=0;
      ctx.font=`${Math.round(enFs*.6)}px Inter,sans-serif`;
      ctx.fillStyle='rgba(245,200,80,.62)';
      ctx.fillText('— '+v.ref,TX,cy);
    }
  }

  ctx.shadowBlur=0;ctx.shadowColor='transparent';
  ctx.restore(); // end verse clip

  // ── INSTAGRAM SAFE ZONE ─────────────────────────────
  if(ST.safeZone&&ST.sz==='9:16'){
    const sT=Math.round(H*0.13),sB=Math.round(H*0.13);
    ctx.fillStyle='rgba(255,0,80,.1)';
    ctx.fillRect(0,0,W,sT);ctx.fillRect(0,H-sB,W,sB);
    ctx.strokeStyle='rgba(255,80,80,.65)';
    ctx.lineWidth=Math.round(W*0.003);
    ctx.setLineDash([Math.round(W*0.02),Math.round(W*0.015)]);
    ctx.strokeRect(1,sT,W-2,H-sT-sB);
    ctx.setLineDash([]);
    ctx.font=`600 ${Math.round(W*0.022)}px Inter,sans-serif`;
    ctx.fillStyle='rgba(255,80,80,.75)';ctx.textAlign='center';
    ctx.fillText('▲ SAFE ZONE',W/2,sT-Math.round(W*0.01));
    ctx.fillText('▼ SAFE ZONE',W/2,H-sB+Math.round(W*0.028));
  }

  // Update mini preview in sheet header
  const pv = document.getElementById('mob-preview-cv');
  if(pv){
    pv.width = 28; pv.height = 40;
    pv.getContext('2d').drawImage(cv, 0, 0, 28, 40);
  }
}

window.drawBgImage = function(ctx,img,W,H,opacity){
  const ir=img.width/img.height, cr=W/H;
  let sx=0,sy=0,sw=img.width,sh=img.height;
  if(ir>cr){sw=img.height*cr;sx=(img.width-sw)/2;}
  else{sh=img.width/cr;sy=(img.height-sh)/2;}
  ctx.drawImage(img,sx,sy,sw,sh,0,0,W,H);
  ctx.fillStyle=`rgba(0,0,0,${opacity})`;
  ctx.fillRect(0,0,W,H);
}

