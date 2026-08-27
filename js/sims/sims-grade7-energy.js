// ══════════════════════════════════════════════════════════
// الصف السابع — الوحدة الثالثة: الطاقة
// ٣-١ استخدام الطاقة · ٣-٢ المخازن الكيميائية · ٣-٣ مخازن أخرى · ٣-٤ طاقة الحركة والاحتكاك
// ══════════════════════════════════════════════════════════

function g7eBg(dark){ return dark ? '#170F1F' : '#FBF5FF'; }
function g7eTxt(dark){ return dark ? '#EBDCFA' : '#2E1A47'; }
function g7eMut(dark){ return dark ? '#A98FC4' : '#6B5688'; }
function g7eAccent(dark){ return dark ? '#C084FC' : '#9333EA'; }
function g7eLerp(a,b,t){ return a+(b-a)*t; }
function g7eClamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function g7eRand(a,b){ return a+Math.random()*(b-a); }
function g7eGp(cv,e){
  const r=cv.getBoundingClientRect(), sc=cv.width/r.width;
  const s=(e.touches&&e.touches[0])||(e.changedTouches&&e.changedTouches[0])||e;
  return { x:(s.clientX-r.left)*sc, y:(s.clientY-r.top)*sc };
}
function g7eTitle(c,w,h,dark,text){
  c.fillStyle=g7eTxt(dark); c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
  c.fillText(text, w/2, h*0.062);
}
function g7eRRect(c,x,y,w,h,r){ c.beginPath(); if(c.roundRect) c.roundRect(x,y,w,h,r); else c.rect(x,y,w,h); }
function g7eMCQ(id, opts){
  return `<div style="display:flex;flex-direction:column;gap:8px">
    ${opts.map((o,i)=>`<button id="${id}${i}" onclick="window._${id}Ans(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:13.5px;text-align:right">${o}</button>`).join('')}
  </div><div id="${id}Fb" style="margin-top:10px;font-size:13.5px;line-height:1.8;color:var(--text-secondary)"></div>`;
}
function g7eAnswerMCQ(id, i, correctIdx, msg){
  const btn=document.getElementById(id+i);
  const ok = i===correctIdx;
  if(btn){ btn.style.background= ok?'#27AE60':'#E74C3C'; btn.style.color='white'; btn.style.borderColor= ok?'#27AE60':'#E74C3C'; }
  if(!ok){ const okBtn=document.getElementById(id+correctIdx); if(okBtn){ okBtn.style.background='#27AE60'; okBtn.style.color='white'; okBtn.style.borderColor='#27AE60'; } }
  const fb=document.getElementById(id+'Fb');
  if(fb) fb.innerHTML=(ok?'💡 أحسنت! ':'💡 ')+msg;
  return ok;
}

/* ══════════════════════════════════════════════════════════
   ٣-١(أ) · هل تستطيع تشغيلها؟ — أربعة تحدّيات + مطابقة
   ══════════════════════════════════════════════════════════ */
function simG7Energy1a(){
  cancelAnimationFrame(animFrame);
  simState = { idx:0, balloonN:0, boxY:0, boxPlaced:false, dragging:false, dragX:0, dragY:0,
    springState:'rest', springT:0, pedalN:0, bikeSpeed:0, lastPedal:0,
    qDone:[false,false,false,false], matched:{balloon:false,box:false,spring:false,bike:false}, matchDragging:false, mdX:0, mdY:0 };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const CHALL = ['balloon','box','spring','bike'];

  function renderControls(){
    const c = CHALL[S.idx];
    if(S.idx<4 && !S.qDone[S.idx]){
      if(c==='balloon'){
        return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🎈 التحدّي ١: انفخ البالون</div></div>
          <div style="font-size:13.5px;color:var(--text-secondary);margin-bottom:10px">اضغطي الزر عدّة مرّات لنفخ البالون.</div>
          <button class="ctrl-btn play" onclick="window._g7e1Blow()">🎈 انفخ</button>
          <div style="margin-top:10px;background:var(--bg-card2);border-radius:8px;padding:8px;text-align:center;font-weight:700">النفخ: ${Math.min(100,S.balloonN*12)}%</div>
          ${S.balloonN>=8? `<div style="margin-top:12px;font-size:14px;font-weight:700">ما الذي استُخدم لنفخ البالون؟</div>${g7eMCQ('g7e1q0',['طاقة كهربائية','طاقة من جسم الإنسان','طاقة ضوئية'])}`:''}`;
      }
      if(c==='box'){
        return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">📦 التحدّي ٢: ارفعي الصندوق</div></div>
          <div style="font-size:13.5px;color:var(--text-secondary);margin-bottom:10px">اسحبي الصندوق من الأرض إلى الرفّ المرتفع.</div>
          <div style="background:var(--bg-card2);border-radius:8px;padding:8px;text-align:center;font-weight:700">الارتفاع: ${Math.round(S.boxY*100)}%</div>
          ${S.boxPlaced? `<div style="margin-top:12px;font-size:14px;font-weight:700">هل تحرّك الصندوق دون طاقة؟</div>${g7eMCQ('g7e1q1',['نعم','لا'])}`:''}`;
      }
      if(c==='spring'){
        return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🌀 التحدّي ٣: اضغطي الزنبرك</div></div>
          <div style="font-size:13.5px;color:var(--text-secondary);margin-bottom:10px">اضغطي الزنبرك ثمّ حرّريه، وراقبي ماذا يحدث.</div>
          <button class="ctrl-btn play" onclick="window._g7e1Spring()">${S.springState==='rest'?'🌀 اضغط الزنبرك':(S.springState==='compressed'?'↺ حرّر الزنبرك':'⏳...')}</button>
          ${S.springState==='released'? `<div class="info-box" style="margin-top:12px">استُخدمت طاقة لتغيير شكل الزنبرك، وعندما تُرك عاد إلى وضعه الأصلي.</div><button class="ctrl-btn play" style="margin-top:10px" onclick="window._g7e1Next()">➡ التحدّي التالي</button>`:''}`;
      }
      if(c==='bike'){
        return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🚲 التحدّي ٤: حرّكي الدرّاجة</div></div>
          <div style="font-size:13.5px;color:var(--text-secondary);margin-bottom:10px">اضغطي الدوّاسة عدّة مرّات لتحريك الدرّاجة، ثمّ توقّفي عن الضغط وراقبي ماذا يحدث.</div>
          <button class="ctrl-btn play" onclick="window._g7e1Pedal()">🚲 ادفع الدوّاسة</button>
          <div style="margin-top:10px;background:var(--bg-card2);border-radius:8px;padding:8px;text-align:center;font-weight:700">السرعة: ${Math.round(S.bikeSpeed*20)}</div>
          ${S.pedalN>=6? `<div style="margin-top:12px;font-size:14px;font-weight:700">ماذا يحدث للدرّاجة عندما تتوقّفين عن الدفع؟</div>${g7eMCQ('g7e1q3',['تستمرّ بالسرعة نفسها','تتباطأ ثمّ تتوقّف','تتسارع أكثر'])}`:''}`;
      }
    }
    if(S.idx<4 && S.qDone[S.idx] && c!=='spring'){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">✅ أحسنتِ!</div></div>
        <button class="ctrl-btn play" onclick="window._g7e1Next()">➡ التحدّي التالي</button>`;
    }
    // مرحلة المطابقة
    const doneN = Object.values(S.matched).filter(Boolean).length;
    if(doneN<4){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🔗 اسحبي البطاقة إلى كلّ نشاط</div></div>
        <div style="font-size:13.5px;color:var(--text-secondary)">اسحبي بطاقة "تحتاج إلى طاقة" فوق كلّ نشاط من الأنشطة الأربعة (${doneN} من ٤).</div>`;
    }
    return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🎉 أحسنتِ!</div></div>
      <div class="info-box">كلّ نشاط يتضمّن حركة أو تغييراً يحتاج إلى طاقة.</div>
      <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7e1Restart()">↺ أعد النشاط</button>`;
  }
  controls(renderControls());

  window._g7e1Blow = function(){ _g8pPlayClick(); if(S.balloonN<9) S.balloonN++; controls(renderControls()); };
  window._g7e1q0Ans = function(i){ if(S.qDone[0]) return; S.qDone[0]=g7eAnswerMCQ('g7e1q0',i,1,'الشخص الذي ينفخ البالون يستخدم طاقة من جسمه لدفع الهواء داخله.')||true; controls(renderControls()); };
  window._g7e1q1Ans = function(i){ if(S.qDone[1]) return; S.qDone[1]=g7eAnswerMCQ('g7e1q1',i,1,'لا يمكن تحريك أيّ جسم، مهما كان خفيفاً، دون بذل طاقة لرفعه أو تحريكه.')||true; controls(renderControls()); };
  window._g7e1q3Ans = function(i){ if(S.qDone[3]) return; S.qDone[3]=g7eAnswerMCQ('g7e1q3',i,1,'عندما تتوقّفين عن الدفع تفقد الدرّاجة مصدر الطاقة، فتتباطأ بسبب الاحتكاك حتّى تتوقّف.')||true; controls(renderControls()); };
  window._g7e1Spring = function(){
    _g8pPlayClick();
    if(S.springState==='rest'){ S.springState='compressed'; }
    else if(S.springState==='compressed'){ S.springState='releasing'; S.springT=0.0001; }
    controls(renderControls());
  };
  window._g7e1Pedal = function(){ _g8pPlayClick(); S.pedalN++; S.bikeSpeed=Math.min(3,S.bikeSpeed+0.6); S.lastPedal=performance.now(); controls(renderControls()); };
  window._g7e1Next = function(){ _g8pPlayClick(); S.idx++; controls(renderControls()); };
  window._g7e1Restart = function(){
    S.idx=0; S.balloonN=0; S.boxY=0; S.boxPlaced=false; S.springState='rest'; S.pedalN=0; S.bikeSpeed=0;
    S.qDone=[false,false,false,false]; S.matched={balloon:false,box:false,spring:false,bike:false};
    controls(renderControls());
  };

  function iconPos(name,w,h){
    const P={balloon:{x:0.16,y:0.68},box:{x:0.4,y:0.68},spring:{x:0.62,y:0.68},bike:{x:0.85,y:0.68}};
    return {x:P[name].x*w, y:P[name].y*h};
  }
  function onDown(e){
    const p=g7eGp(cv,e), w=cv.width, h=cv.height;
    if(S.idx===1 && !S.qDone[1] && !S.boxPlaced){
      const bx=w*0.42, by=h*0.72-S.boxY*h*0.34;
      if(Math.hypot(p.x-bx,p.y-by)<w*0.09){ S.dragging=true; }
      return;
    }
    if(S.idx>=4){
      const doneN=Object.values(S.matched).filter(Boolean).length;
      if(doneN<4){
        const chipX=cv.width*0.5, chipY=cv.height*0.36;
        if(Math.hypot(p.x-chipX,p.y-chipY)<cv.width*0.14){ S.matchDragging=true; S.mdX=p.x; S.mdY=p.y; }
      }
    }
  }
  function onMove(e){
    if(S.dragging){
      e.preventDefault&&e.preventDefault();
      const p=g7eGp(cv,e), h=cv.height;
      const shelfY=h*0.35, groundY=h*0.72;
      S.boxY = g7eClamp((groundY-p.y)/(groundY-shelfY),0,1);
    }
    if(S.matchDragging){ e.preventDefault&&e.preventDefault(); const p=g7eGp(cv,e); S.mdX=p.x; S.mdY=p.y; }
  }
  function onUp(){
    if(S.dragging){
      S.dragging=false;
      if(S.boxY>=0.92){ S.boxY=1; S.boxPlaced=true; _g8pPlayDrop(); controls(renderControls()); }
    }
    if(S.matchDragging){
      S.matchDragging=false;
      const w=cv.width, h=cv.height;
      CHALL.forEach(name=>{
        if(S.matched[name]) return;
        const pos=iconPos(name,w,h);
        if(Math.hypot(S.mdX-pos.x,S.mdY-pos.y)<w*0.11){ S.matched[name]=true; _g8pPlayDrop(); controls(renderControls()); }
      });
    }
  }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;
  cv.onclick=null;

  function draw(){
    if(currentSim!=='g7energy1' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7eBg(dark); c.fillRect(0,0,w,h);

    // اضمحلال سرعة الدرّاجة تلقائياً
    if(S.idx===3 && performance.now()-S.lastPedal>300 && S.bikeSpeed>0){ S.bikeSpeed=Math.max(0,S.bikeSpeed-0.02); }
    if(S.springState==='releasing'){ S.springT+=0.045; if(S.springT>=1){ S.springT=1; S.springState='released'; controls(renderControls()); } }

    if(S.idx<4){
      const c1=CHALL[S.idx];
      if(c1==='balloon'){
        const bx=w*0.5, by=h*0.5, r=w*0.06+w*0.018*S.balloonN;
        c.fillStyle='#EC4899'; c.beginPath(); c.ellipse(bx,by,r,r*1.15,0,0,Math.PI*2); c.fill();
        c.strokeStyle='#BE185D'; c.lineWidth=2; c.stroke();
        c.fillStyle='#BE185D'; c.beginPath(); c.moveTo(bx,by+r*1.15); c.lineTo(bx-6,by+r*1.3); c.lineTo(bx+6,by+r*1.3); c.fill();
      }
      if(c1==='box'){
        const shelfY=h*0.35, groundY=h*0.72;
        c.fillStyle=g7eMut(dark); c.fillRect(w*0.28,shelfY,w*0.28,h*0.02);
        const bx=w*0.42, by=groundY-S.boxY*(groundY-shelfY)-w*0.06;
        c.fillStyle='#B45309'; g7eRRect(c,bx-w*0.06,by,w*0.12,w*0.1,6); c.fill();
        c.strokeStyle='#78350F'; c.lineWidth=2; g7eRRect(c,bx-w*0.06,by,w*0.12,w*0.1,6); c.stroke();
      }
      if(c1==='spring'){
        const sx=w*0.5, sy=h*0.5;
        let comp = S.springState==='compressed'?0.5:(S.springState==='releasing'?g7eLerp(0.5,1,S.springT):(S.springState==='released'?1:1));
        const len=w*0.3*comp, coils=8;
        c.strokeStyle=g7eAccent(dark); c.lineWidth=w*0.01; c.lineCap='round';
        c.beginPath(); c.moveTo(sx-len/2,sy);
        for(let i=0;i<=coils;i++){ const x=sx-len/2+(i/coils)*len, y=sy+(i%2===0?-h*0.05:h*0.05); c.lineTo(x,y); }
        c.lineTo(sx+len/2,sy); c.stroke();
      }
      if(c1==='bike'){
        const roadY=h*0.65;
        c.strokeStyle=g7eMut(dark); c.lineWidth=3; c.beginPath(); c.moveTo(w*0.1,roadY); c.lineTo(w*0.9,roadY); c.stroke();
        const bx = w*0.2 + (S.bikeSpeed*w*0.15);
        c.font=`${Math.round(h*0.09)}px Tajawal`; c.textAlign='center';
        c.fillText('🚲', g7eClamp(bx,w*0.15,w*0.85), roadY);
      }
    } else {
      // مرحلة المطابقة
      const icons={balloon:'🎈',box:'📦',spring:'🌀',bike:'🚲'};
      CHALL.forEach(name=>{
        const pos=iconPos(name,w,h);
        c.save();
        c.fillStyle= S.matched[name]? 'rgba(39,174,96,0.18)':(dark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)');
        c.strokeStyle= S.matched[name]?'#27AE60':g7eMut(dark); c.lineWidth=2.5;
        c.beginPath(); c.arc(pos.x,pos.y,w*0.09,0,Math.PI*2); c.fill(); c.stroke();
        c.font=`${Math.round(h*0.05)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(icons[name], pos.x, pos.y); c.textBaseline='alphabetic';
        if(S.matched[name]){ c.font=`${Math.round(h*0.03)}px Tajawal`; c.fillText('✅', pos.x+w*0.07, pos.y-w*0.07); }
        c.restore();
      });
      const doneN=Object.values(S.matched).filter(Boolean).length;
      if(doneN<4){
        const chipX = S.matchDragging?S.mdX:w*0.5, chipY = S.matchDragging?S.mdY:h*0.36;
        c.save();
        c.fillStyle=g7eAccent(dark); g7eRRect(c,chipX-w*0.14,chipY-h*0.04,w*0.28,h*0.08,10); c.fill();
        c.fillStyle='#fff'; c.font=`bold ${Math.round(h*0.02)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
        c.fillText('تحتاج إلى طاقة ⚡', chipX, chipY); c.textBaseline='alphabetic';
        c.restore();
      }
    }

    g7eTitle(c,w,h,dark,'٣-١(أ) · هل تستطيع تشغيلها؟');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   ٣-١(ب) · اكتشف مصدر الطاقة (خريطة المدينة)
   ══════════════════════════════════════════════════════════ */
function simG7Energy1b(){
  cancelAnimationFrame(animFrame);
  const ITEMS = {
    car:  { icon:'🚗', label:'السيارة', pos:{x:0.18,y:0.3}, opts:['الكهرباء','الغذاء','الوقود'], correct:2, source:'وقود', anim:0 },
    home: { icon:'🏠', label:'المنزل', pos:{x:0.5,y:0.24}, opts:['الكهرباء','الغذاء','الرياح فقط'], correct:0, source:'كهرباء', anim:0 },
    plane:{ icon:'✈️', label:'الطائرة', pos:{x:0.82,y:0.2}, opts:['الوقود','الغذاء','البطارية'], correct:0, source:'وقود', anim:0 },
    farm: { icon:'🐴', label:'الحيوان', pos:{x:0.35,y:0.66}, opts:['الغذاء','الكهرباء','البنزين'], correct:0, source:'غذاء', anim:0 },
  };
  const KEYS = Object.keys(ITEMS);
  simState = { active:null, done:{}, stage:'explore', srcSel:null, links:{}, linkDone:0 };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null; cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null;

  function allDone(){ return KEYS.every(k=>S.done[k]); }

  function renderControls(){
    if(S.stage==='explore'){
      if(S.active){
        const it=ITEMS[S.active];
        return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">${it.icon} ${it.label}</div></div>
          <div style="font-size:14px;font-weight:700;margin-bottom:10px">من أين تحصل على طاقتها؟</div>
          ${g7eMCQ('g7e1bq', it.opts)}`;
      }
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🏙️ اكتشف مصدر الطاقة</div></div>
        <div style="font-size:13.5px;color:var(--text-secondary)">اضغطي على عنصر من المدينة لمعرفة من أين يحصل على طاقته (${Object.keys(S.done).length} من ٤).</div>`;
    }
    if(S.stage==='match'){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🔗 التحدّي النهائي</div></div>
        <div style="font-size:13.5px;color:var(--text-secondary);margin-bottom:8px">اختاري مصدر الطاقة، ثمّ اضغطي على العنصر المناسب له (${S.linkDone} من ٤).</div>
        <div class="ctrl-btns-grid-1">
          ${['غذاء','وقود','كهرباء'].map(s=>`<button class="ctrl-btn ${S.srcSel===s?'active':''}" onclick="window._g7e1bSrc('${s}')">${s}</button>`).join('')}
        </div>`;
    }
    return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🎉 أحسنتِ!</div></div>
      <div class="info-box">اكتشفتِ مصادر الطاقة التي تستخدمها أشياء مختلفة من حولنا.</div>
      <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7e1bRestart()">↺ أعد النشاط</button>`;
  }
  controls(renderControls());

  window._g7e1bqAns = function(i){
    const it=ITEMS[S.active];
    const ok=g7eAnswerMCQ('g7e1bq',i,it.correct,'أحسنتِ، هذا هو مصدر الطاقة الصحيح لهذا العنصر.');
    if(ok){ S.done[S.active]=true; it.anim=0.0001; _g8pPlayDrop(); }
    setTimeout(()=>{ S.active=null; if(allDone()){ S.stage='match'; } controls(renderControls()); }, 1100);
  };
  window._g7e1bSrc = function(s){ _g8pPlayClick(); S.srcSel=s; controls(renderControls()); };
  window._g7e1bRestart = function(){
    S.active=null; S.done={}; S.stage='explore'; S.srcSel=null; S.links={}; S.linkDone=0;
    KEYS.forEach(k=>ITEMS[k].anim=0);
    controls(renderControls());
  };

  cv.onclick = function(e){
    const p=g7eGp(cv,e), w=cv.width, h=cv.height;
    let hit=null;
    KEYS.forEach(k=>{ const it=ITEMS[k]; if(Math.hypot(p.x-it.pos.x*w,p.y-it.pos.y*h)<w*0.09) hit=k; });
    if(!hit) return;
    if(S.stage==='explore'){
      if(S.done[hit]) return;
      _g8pPlayClick(); S.active=hit; controls(renderControls());
    } else if(S.stage==='match'){
      if(!S.srcSel || S.links[hit]) return;
      const it=ITEMS[hit];
      if(it.source===S.srcSel){
        S.links[hit]=S.srcSel; S.linkDone++; _g8pPlayDrop();
        if(S.linkDone>=4) S.stage='celebrate';
        controls(renderControls());
      } else {
        _g8pPlayClick();
      }
    }
  };

  function draw(){
    if(currentSim!=='g7energy1' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7eBg(dark); c.fillRect(0,0,w,h);

    KEYS.forEach(k=>{
      const it=ITEMS[k];
      if(it.anim!==undefined && it.anim>0 && it.anim<1) it.anim+=0.02;
      const x=it.pos.x*w, y=it.pos.y*h;
      const wobble = it.anim>0 ? Math.sin(performance.now()*0.01)*4 : 0;
      c.save();
      c.fillStyle= S.done[k]?'rgba(39,174,96,0.15)':(dark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)');
      c.strokeStyle = S.active===k? g7eAccent(dark) : (S.done[k]?'#27AE60':g7eMut(dark));
      c.lineWidth=2.5;
      c.beginPath(); c.arc(x,y,w*0.09,0,Math.PI*2); c.fill(); c.stroke();
      c.font=`${Math.round(h*0.05)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(it.icon, x+wobble, y); c.textBaseline='alphabetic';
      c.fillStyle=g7eTxt(dark); c.font=`bold ${Math.round(h*0.017)}px Tajawal`;
      c.fillText(it.label, x, y+w*0.12);
      if(S.done[k]){ c.font=`${Math.round(h*0.024)}px Tajawal`; c.fillText('✅', x+w*0.07,y-w*0.07); }
      if(S.stage==='match' && S.links[k]){ c.fillStyle='#27AE60'; c.font=`bold ${Math.round(h*0.015)}px Tajawal`; c.fillText(S.links[k], x, y+w*0.17); }
      c.restore();
    });

    g7eTitle(c,w,h,dark,'٣-١(ب) · اكتشف مصدر الطاقة');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   ٣-٢ · الطاقة من الوقود — شمعة تسخّن الماء
   ══════════════════════════════════════════════════════════ */
function simG7Energy2a(){
  cancelAnimationFrame(animFrame);
  const TEMPS=[25,32,40,48,57,65];
  simState = { thermPlaced:false, lit:false, t:0, showEnergy:false, qAnswered:false, dragTherm:false, dtX:0, dtY:0 };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const THERM_HOME={x:0.86,y:0.18}, CUP={x:0.32,y:0.5};

  function renderControls(){
    if(!S.thermPlaced){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🧪 الطاقة من الوقود</div></div>
        <div style="font-size:13.5px;color:var(--text-secondary);margin-bottom:10px">اسحبي مقياس الحرارة إلى داخل كأس الماء لتبدأ التجربة.</div>`;
    }
    if(!S.lit){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🕯️ جاهزة للإشعال</div></div>
        <div style="font-size:13.5px;color:var(--text-secondary);margin-bottom:10px">الشمعة موضوعة أسفل الكأس. اضغطي لإشعالها.</div>
        <button class="ctrl-btn play" onclick="window._g7e2Light()">▶️ أشعل الشمعة</button>`;
    }
    let html = `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">⏱️ حرّكي الزمن</div></div>
      <div class="ctrl-row">
        <div class="ctrl-name">الزمن <span class="ctrl-val">${S.t} د</span></div>
        <input type="range" min="0" max="5" step="1" value="${S.t}" oninput="window._g7e2Set(+this.value)">
      </div>
      <div class="info-box">🌡️ ${TEMPS[S.t]}°C</div>
      <button class="ctrl-btn ${S.showEnergy?'active':'action'}" onclick="window._g7e2Energy()">⚡ شاهد انتقال الطاقة</button>`;
    if(S.showEnergy){
      html += `<div class="info-box" style="margin-top:10px">تحوّلت الطاقة الكيميائية المخزَّنة في الشمعة إلى طاقة حرارية انتقلت إلى الماء.</div>`;
    }
    if(S.t===5){
      html += `<div class="ctrl-section" style="margin-top:12px"><div class="ctrl-label" style="font-size:15px">❓ ما الدليل على أنّ الشمعة نقلت طاقة إلى الماء؟</div></div>
        ${g7eMCQ('g7e2q',['تغيّر لون الكأس','نقص عدد جزيئات الماء','ارتفعت درجة حرارة الماء','أصبح الكأس أثقل'])}`;
    }
    return html;
  }
  controls(renderControls());

  window._g7e2Light = function(){ _g8pPlayClick(); S.lit=true; controls(renderControls()); };
  window._g7e2Set = function(v){ S.t=v; controls(renderControls()); };
  window._g7e2Energy = function(){ _g8pPlayClick(); S.showEnergy=!S.showEnergy; controls(renderControls()); };
  window._g7e2qAns = function(i){
    if(S.qAnswered) return; S.qAnswered=true;
    g7eAnswerMCQ('g7e2q', i, 2, 'عندما احترقت الشمعة تحوّلت الطاقة الكيميائية المخزَّنة فيها إلى طاقة حرارية انتقلت إلى الماء، ولذلك ارتفعت درجة حرارته.');
  };

  function onDown(e){
    if(S.thermPlaced) return;
    const p=g7eGp(cv,e), w=cv.width, h=cv.height;
    if(Math.hypot(p.x-THERM_HOME.x*w,p.y-THERM_HOME.y*h)<w*0.07){ S.dragTherm=true; S.dtX=p.x; S.dtY=p.y; }
  }
  function onMove(e){ if(!S.dragTherm) return; e.preventDefault&&e.preventDefault(); const p=g7eGp(cv,e); S.dtX=p.x; S.dtY=p.y; }
  function onUp(){
    if(!S.dragTherm) return; S.dragTherm=false;
    const w=cv.width, h=cv.height;
    if(Math.hypot(S.dtX-CUP.x*w,S.dtY-CUP.y*h)<w*0.13){ S.thermPlaced=true; _g8pPlayDrop(); controls(renderControls()); }
  }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;
  cv.onclick=null;

  function draw(){
    if(currentSim!=='g7energy2' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7eBg(dark); c.fillRect(0,0,w,h);
    const temp = TEMPS[S.t];

    const cupX=CUP.x*w, cupY=CUP.y*h, cupW=w*0.22, cupH=h*0.3;
    c.strokeStyle=g7eMut(dark); c.lineWidth=w*0.006; c.lineCap='round';
    c.beginPath(); c.moveTo(cupX-cupW/2,cupY); c.lineTo(cupX-cupW/2,cupY+cupH); c.lineTo(cupX+cupW/2,cupY+cupH); c.lineTo(cupX+cupW/2,cupY); c.stroke();
    c.save(); c.beginPath(); c.rect(cupX-cupW/2,cupY,cupW,cupH); c.clip();
    c.fillStyle= dark?'rgba(196,132,252,0.28)':'rgba(147,51,234,0.18)';
    c.fillRect(cupX-cupW/2,cupY+cupH*0.15,cupW,cupH*0.9);
    if(S.thermPlaced){
      const speedF = g7eLerp(0.4,2,(temp-25)/40);
      if(!S._parts) S._parts = Array.from({length:12},()=>({nx:Math.random(),ny:g7eRand(0.2,0.95),vx:g7eRand(-1,1),vy:g7eRand(-1,1)}));
      S._parts.forEach(p=>{
        const boost = S.showEnergy?1.8:1;
        p.nx+=p.vx*0.004*speedF*boost; p.ny+=p.vy*0.004*speedF*boost;
        if(p.nx<0.08||p.nx>0.92) p.vx*=-1; if(p.ny<0.2||p.ny>0.95) p.vy*=-1;
        p.nx=g7eClamp(p.nx,0.08,0.92); p.ny=g7eClamp(p.ny,0.2,0.95);
        c.fillStyle= dark?'#E9D5FF':'#6D28D9';
        c.beginPath(); c.arc(cupX-cupW/2+p.nx*cupW, cupY+p.ny*cupH, w*0.007,0,Math.PI*2); c.fill();
      });
    }
    c.restore();

    // شمعة
    const candleX=cupX, candleY=cupY+cupH+h*0.03;
    c.fillStyle='#FDE68A'; c.fillRect(candleX-w*0.02,candleY,w*0.04,h*0.07);
    if(S.lit){
      const fh=h*0.025*(0.8+0.2*Math.sin(performance.now()*0.012));
      c.fillStyle='#F97316'; c.beginPath();
      c.moveTo(candleX,candleY); c.quadraticCurveTo(candleX-w*0.012,candleY-fh*0.6,candleX,candleY-fh); c.quadraticCurveTo(candleX+w*0.012,candleY-fh*0.6,candleX,candleY); c.fill();
    }

    // ميزان حرارة (يظهر بعد السحب)
    if(!S.thermPlaced){
      const x=S.dragTherm?S.dtX:THERM_HOME.x*w, y=S.dragTherm?S.dtY:THERM_HOME.y*h;
      c.font=`${Math.round(h*0.07)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('🌡️', x, y); c.textBaseline='alphabetic';
      if(!S.dragTherm){ c.fillStyle=g7eTxt(dark); c.font=`bold ${Math.round(h*0.016)}px Tajawal`; c.fillText('اسحبي إلى الكأس', x, y+h*0.05); }
    } else {
      c.fillStyle=g7eTxt(dark); c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
      c.fillText(temp+'°C', cupX, cupY-h*0.025);
    }

    // وضع "شاهد الطاقة": أسهم انتقال
    if(S.showEnergy){
      c.save();
      c.fillStyle=g7eAccent(dark); c.font=`bold ${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
      const ax=w*0.62, ay=h*0.5;
      c.fillText('🕯️ الشمعة  →  🔥 طاقة حرارية  →  💧 الماء', ax, ay);
      c.restore();
    }

    g7eTitle(c,w,h,dark,'٣-٢ · الطاقة من الوقود');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   ٣-٣(أ) · اكتشف مخزن الطاقة — ألعاب تعمل بالطاقة
   ══════════════════════════════════════════════════════════ */
function simG7Energy3a(){
  cancelAnimationFrame(animFrame);
  const TOYS = {
    car:{ icon:'🚗', label:'سيارة اللعبة', pos:{x:0.2,y:0.32}, need:'battery', filled:false, run:0 },
    frog:{ icon:'🐸', label:'الضفدع القافز', pos:{x:0.5,y:0.32}, need:'spring', filled:false, run:0 },
    ball:{ icon:'⚪', label:'مسار الكرة', pos:{x:0.8,y:0.32}, need:'raised', filled:false, run:0 },
  };
  const STORES = { battery:{icon:'🔋',label:'بطارية',x:0.2}, spring:{icon:'🌀',label:'نابض',x:0.5}, raised:{icon:'⬆️',label:'جسم مرفوع',x:0.8} };
  simState = { dragging:null, dx:0, dy:0, done:false, qAnswered:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  cv.onclick=null;

  function allFilled(){ return Object.values(TOYS).every(t=>t.filled); }

  function renderControls(){
    const n = Object.values(TOYS).filter(t=>t.filled).length;
    if(!S.done){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🎮 اكتشف مخزن الطاقة</div></div>
        <div style="font-size:13.5px;color:var(--text-secondary)">اسحبي مخزن الطاقة المناسب إلى كلّ لعبة (${n} من ٣).</div>`;
    }
    return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">📊 ماذا نستنتج؟</div></div>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:12px">
        <thead><tr style="background:var(--bg-card2)"><th style="padding:6px">اللعبة</th><th style="padding:6px">مخزن الطاقة</th></tr></thead>
        <tbody>
          <tr><td style="padding:6px;text-align:center;border-bottom:1px solid #ddd3">🚗 السيارة</td><td style="padding:6px;text-align:center;border-bottom:1px solid #ddd3">🔋 بطارية</td></tr>
          <tr><td style="padding:6px;text-align:center;border-bottom:1px solid #ddd3">🐸 الضفدع</td><td style="padding:6px;text-align:center;border-bottom:1px solid #ddd3">🌀 نابض</td></tr>
          <tr><td style="padding:6px;text-align:center">⚪ الكرة</td><td style="padding:6px;text-align:center">⬆️ جسم مرفوع</td></tr>
        </tbody>
      </table>
      <div class="info-box">تحتاج الألعاب إلى مخزن للطاقة قبل أن تبدأ بالحركة.</div>
      <div style="font-size:14px;font-weight:700;margin:12px 0 8px">❓ أراد سالم أن يجعل كرة لعبة تتحرّك دون بطارية أو نابض. ما أفضل طريقة لتزويدها بالطاقة؟</div>
      ${g7eMCQ('g7e3q',['وضعها على الأرض المستوية','رفعها إلى أعلى مسار ثمّ تركها تتحرّك','تبريد الكرة','زيادة حجم الكرة'])}
      ${S.qAnswered?`<button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7e3Restart()">↺ أعد النشاط</button>`:''}`;
  }
  controls(renderControls());

  window._g7e3qAns = function(i){
    if(S.qAnswered) return; S.qAnswered=true;
    g7eAnswerMCQ('g7e3q', i, 1, 'عندما نرفع الجسم إلى أعلى فإنّه يخزّن طاقة جاذبية أرضية، وعند تركه تتحوّل هذه الطاقة إلى حركة.');
  };
  window._g7e3Restart = function(){
    Object.values(TOYS).forEach(t=>{ t.filled=false; t.run=0; });
    S.done=false; S.qAnswered=false; controls(renderControls());
  };

  function onDown(e){
    if(S.done) return;
    const p=g7eGp(cv,e), w=cv.width, h=cv.height;
    Object.keys(STORES).forEach(k=>{
      const st=STORES[k]; const sx=st.x*w, sy=h*0.72;
      const used = Object.values(TOYS).some(t=>t.filled && t.need===k);
      if(!used && Math.hypot(p.x-sx,p.y-sy)<w*0.07){ S.dragging=k; S.dx=p.x; S.dy=p.y; }
    });
  }
  function onMove(e){ if(!S.dragging) return; e.preventDefault&&e.preventDefault(); const p=g7eGp(cv,e); S.dx=p.x; S.dy=p.y; }
  function onUp(){
    if(!S.dragging) return;
    const w=cv.width, h=cv.height;
    Object.keys(TOYS).forEach(k=>{
      const t=TOYS[k];
      if(t.filled) return;
      if(Math.hypot(S.dx-t.pos.x*w,S.dy-t.pos.y*h)<w*0.1){
        if(t.need===S.dragging){ t.filled=true; t.run=0.0001; _g8pPlayDrop();
          if(allFilled()){ S.done=true; } controls(renderControls());
        } else { _g8pPlayClick(); }
      }
    });
    S.dragging=null;
  }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;

  function draw(){
    if(currentSim!=='g7energy3' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7eBg(dark); c.fillRect(0,0,w,h);

    Object.keys(TOYS).forEach(k=>{
      const t=TOYS[k];
      if(t.run>0 && t.run<1) t.run+=0.02;
      const x=t.pos.x*w, y=t.pos.y*h;
      c.save();
      c.fillStyle = t.filled? 'rgba(39,174,96,0.14)':(dark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)');
      c.strokeStyle = t.filled?'#27AE60':g7eMut(dark); c.lineWidth=2.5;
      c.beginPath(); c.arc(x,y,w*0.09,0,Math.PI*2); c.fill(); c.stroke();
      const bounce = t.filled? Math.sin(performance.now()*0.008)*4 : 0;
      c.font=`${Math.round(h*0.05)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(t.icon, x, y+bounce); c.textBaseline='alphabetic';
      c.fillStyle=g7eTxt(dark); c.font=`bold ${Math.round(h*0.016)}px Tajawal`;
      c.fillText(t.label, x, y+w*0.13);
      if(t.filled){ c.font=`${Math.round(h*0.02)}px Tajawal`; c.fillText('✅', x+w*0.07, y-w*0.07); }
      c.restore();
    });

    if(!S.done){
      Object.keys(STORES).forEach(k=>{
        const used = Object.values(TOYS).some(t=>t.filled && t.need===k);
        if(used) return;
        const st=STORES[k];
        const x=(S.dragging===k)?S.dx:st.x*w, y=(S.dragging===k)?S.dy:h*0.72;
        c.save();
        c.font=`${Math.round(h*0.05)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(st.icon, x, y); c.textBaseline='alphabetic';
        c.fillStyle=g7eTxt(dark); c.font=`bold ${Math.round(h*0.015)}px Tajawal`;
        c.fillText(st.label, x, y+w*0.09);
        c.restore();
      });
    }

    g7eTitle(c,w,h,dark,'٣-٣(أ) · اكتشف مخزن الطاقة');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   ٣-٤(أ) · مختبر الطاقة الحركية — الكتلة أم السرعة؟
   ══════════════════════════════════════════════════════════ */
function simG7Energy4a(){
  cancelAnimationFrame(animFrame);
  simState = { phase:1, mass:100, speed:'medium', craters:[], dropT:0, dropping:false, phase1Seen:[], phase2Seen:[] };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  cv.onclick=null;
  const SPEED_V = {slow:0.35, medium:0.62, fast:0.9};

  function renderControls(){
    if(S.phase===1){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🚀 المرحلة ١: أثر السرعة</div></div>
        <div style="font-size:13px;color:var(--text-secondary);margin-bottom:10px">الكتلة ثابتة (100 g). جرّبي السرعات الثلاث وراقبي حجم الحفرة.</div>
        <div class="ctrl-btns-grid-1">
          ${['slow','medium','fast'].map(s=>`<button class="ctrl-btn ${S.speed===s?'active':''}" onclick="window._g7e4Speed('${s}')">${s==='slow'?'بطيئة':s==='medium'?'متوسطة':'سريعة'}</button>`).join('')}
        </div>
        <button class="ctrl-btn play" style="margin-top:10px" onclick="window._g7e4Drop()" ${S.dropping?'disabled':''}>⬇ أسقطي الكرة</button>
        ${S.phase1Seen.length>=3?`<button class="ctrl-btn action" style="margin-top:10px" onclick="window._g7e4Phase2()">➡ المرحلة التالية</button>`:''}`;
    }
    return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">⚖️ المرحلة ٢: أثر الكتلة</div></div>
      <div style="font-size:13px;color:var(--text-secondary);margin-bottom:10px">السرعة ثابتة (متوسطة). جرّبي الكتل الثلاث وراقبي حجم الحفرة.</div>
      <div class="ctrl-btns-grid-1">
        ${[50,100,200].map(m=>`<button class="ctrl-btn ${S.mass===m?'active':''}" onclick="window._g7e4Mass(${m})">كرة ${m===50?'صغيرة':m===100?'متوسطة':'كبيرة'} (${m}g)</button>`).join('')}
      </div>
      <button class="ctrl-btn play" style="margin-top:10px" onclick="window._g7e4Drop()" ${S.dropping?'disabled':''}>⬇ أسقطي الكرة</button>
      ${S.phase2Seen.length>=3?`
      <div class="info-box" style="margin-top:12px">تزداد الطاقة الحركية عند زيادة السرعة، وتزداد أيضاً عند زيادة الكتلة.</div>
      <button class="ctrl-btn reset" style="margin-top:10px" onclick="window._g7e4Restart()">↺ أعد النشاط</button>`:''}`;
  }
  controls(renderControls());

  window._g7e4Speed = function(s){ if(S.dropping) return; S.speed=s; controls(renderControls()); };
  window._g7e4Mass = function(m){ if(S.dropping) return; S.mass=m; controls(renderControls()); };
  window._g7e4Drop = function(){
    if(S.dropping) return; _g8pPlayClick(); S.dropping=true; S.dropT=0.0001;
  };
  window._g7e4Phase2 = function(){ _g8pPlayClick(); S.phase=2; S.craters=[]; controls(renderControls()); };
  window._g7e4Restart = function(){
    S.phase=1; S.mass=100; S.speed='medium'; S.craters=[]; S.dropT=0; S.dropping=false; S.phase1Seen=[]; S.phase2Seen=[];
    controls(renderControls());
  };

  function craterSize(){
    if(S.phase===1) return g7eLerp(0.3,1,SPEED_V[S.speed]);
    return g7eLerp(0.3,1,S.mass/200);
  }

  function draw(){
    if(currentSim!=='g7energy4' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7eBg(dark); c.fillRect(0,0,w,h);

    const sandY=h*0.62, sandH=h*0.2, sandX=w*0.2, sandW=w*0.6;
    c.fillStyle= dark?'#4B3A22':'#E8D4A0';
    c.fillRect(sandX,sandY,sandW,sandH);
    c.strokeStyle=g7eMut(dark); c.lineWidth=2; c.strokeRect(sandX,sandY,sandW,sandH);

    if(S.dropping){
      S.dropT += 0.028;
      if(S.dropT>=1){
        S.dropT=1; S.dropping=false;
        const size=craterSize();
        S.craters.push(size);
        if(S.phase===1) S.phase1Seen.push(S.speed); else S.phase2Seen.push(S.mass);
        controls(renderControls());
      }
    }
    // كرة تسقط
    if(S.dropping){
      const ballY = g7eLerp(h*0.15, sandY, S.dropT);
      c.fillStyle='#EF4444'; c.beginPath(); c.arc(w*0.5, ballY, w*0.025,0,Math.PI*2); c.fill();
    }
    // آخر حفرة
    const lastCrater = S.craters[S.craters.length-1];
    if(lastCrater){
      c.save();
      c.fillStyle= dark?'#2B2013':'#9C7A3C';
      c.beginPath(); c.ellipse(w*0.5, sandY+sandH*0.25, w*0.08*lastCrater, h*0.03*lastCrater,0,0,Math.PI*2); c.fill();
      c.restore();
    }
    c.fillStyle=g7eMut(dark); c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
    c.fillText('📦 صندوق الرمل', w*0.5, sandY+sandH+h*0.04);

    // مؤشر الطاقة الحركية
    if(lastCrater){
      const barX=w*0.82, barY=h*0.35, barH=h*0.35;
      c.strokeStyle=g7eMut(dark); c.lineWidth=2; c.strokeRect(barX-w*0.03,barY,w*0.06,barH);
      c.fillStyle=g7eAccent(dark);
      c.fillRect(barX-w*0.03,barY+barH*(1-lastCrater),w*0.06,barH*lastCrater);
      c.fillStyle=g7eTxt(dark); c.font=`bold ${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
      c.fillText('الطاقة الحركية', barX, barY-h*0.02);
    }

    c.fillStyle=g7eTxt(dark); c.font=`bold ${Math.round(h*0.018)}px Tajawal`; c.textAlign='center';
    c.fillText(S.phase===1? ('السرعة: '+(S.speed==='slow'?'بطيئة':S.speed==='medium'?'متوسطة':'سريعة')) : ('الكتلة: '+S.mass+' g'), w*0.5, h*0.15);

    g7eTitle(c,w,h,dark,'٣-٤(أ) · مختبر الطاقة الحركية');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   ٣-٤(ب) · أين ذهبت الطاقة؟ — الاحتكاك يولّد حرارة
   ══════════════════════════════════════════════════════════ */
function simG7Energy4b(){
  cancelAnimationFrame(animFrame);
  simState = { speed:'medium', surface:'ice', running:false, carT:0, temp:25, showEnergy:false, finished:false, qAnswered:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  cv.onclick=null;
  const SURF = {
    ice:{ label:'جليد', icon:'🧊', dist:0.92, tempEnd:28 },
    wood:{ label:'خشب', icon:'🪵', dist:0.58, tempEnd:31 },
    carpet:{ label:'سجّاد', icon:'🟫', dist:0.3, tempEnd:35 },
  };

  function renderControls(){
    let html = `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🔥 أين ذهبت الطاقة؟</div></div>
      <div class="ctrl-row"><div class="ctrl-name">السرعة</div></div>
      <div class="ctrl-btns-grid" style="margin-bottom:10px">
        ${['slow','medium','fast'].map(s=>`<button class="ctrl-btn ${S.speed===s?'active':''}" onclick="window._g7e4bSpeed('${s}')" ${S.running?'disabled':''}>${s==='slow'?'بطيئة':s==='medium'?'متوسطة':'سريعة'}</button>`).join('')}
      </div>
      <div class="ctrl-row"><div class="ctrl-name">نوع السطح</div></div>
      <div class="ctrl-btns-grid-1" style="margin-bottom:10px">
        ${Object.keys(SURF).map(k=>`<button class="ctrl-btn ${S.surface===k?'active':''}" onclick="window._g7e4bSurf('${k}')" ${S.running?'disabled':''}>${SURF[k].icon} ${SURF[k].label}</button>`).join('')}
      </div>
      <button class="ctrl-btn play" onclick="window._g7e4bStart()" ${S.running?'disabled':''}>▶️ ابدأ</button>`;
    if(S.finished){
      html += `<button class="ctrl-btn ${S.showEnergy?'active':'action'}" style="margin-top:10px" onclick="window._g7e4bEnergy()">أين ذهبت الطاقة؟</button>`;
      if(S.showEnergy){
        html += `<div class="info-box" style="margin-top:10px">تقلّ طاقة حركة السيارة تدريجياً، بينما تزداد الطاقة الحرارية الناتجة عن الاحتكاك مع السطح.</div>`;
      }
      html += `<div class="ctrl-section" style="margin-top:12px"><div class="ctrl-label" style="font-size:15px">❓ أراد طالب أن يجعل سيارة لعبة تتوقّف بسرعة، فدفعها فوق سطحين: 🟦 أملس جدّاً و🟫 خشن. على أيّ سطح ستتوقّف أوّلاً؟</div></div>
        ${g7eMCQ('g7e4bq',['السطح الأملس','السطح الخشن','ستتوقّف على السطحين في الوقت نفسه','لن تتوقّف على أيّ منهما'])}`;
    }
    return html;
  }
  controls(renderControls());

  window._g7e4bSpeed = function(s){ S.speed=s; controls(renderControls()); };
  window._g7e4bSurf = function(k){ S.surface=k; controls(renderControls()); };
  window._g7e4bStart = function(){
    _g8pPlayClick(); S.running=true; S.carT=0.0001; S.temp=25; S.finished=false; S.showEnergy=false;
    controls(renderControls());
  };
  window._g7e4bEnergy = function(){ _g8pPlayClick(); S.showEnergy=!S.showEnergy; controls(renderControls()); };
  window._g7e4bqAns = function(i){
    if(S.qAnswered) return; S.qAnswered=true;
    g7eAnswerMCQ('g7e4bq', i, 1, 'السطح الخشن يولّد احتكاكاً أكبر، فيبطئ حركة السيارة بسرعة أكبر، وتتحوّل بعض طاقة الحركة إلى طاقة حرارية.');
  };

  function draw(){
    if(currentSim!=='g7energy4' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7eBg(dark); c.fillRect(0,0,w,h);

    const surf = SURF[S.surface];
    const roadY=h*0.42;
    c.fillStyle= S.surface==='ice'? (dark?'#1E3A5F':'#BFE0F0') : S.surface==='wood'? (dark?'#4A2E16':'#C89860') : (dark?'#3A2A1E':'#A67C52');
    c.fillRect(w*0.12,roadY,w*0.76,h*0.05);

    const speedFactor = S.speed==='slow'?0.5:S.speed==='medium'?0.75:1;
    let carX = w*0.16;
    if(S.running){
      S.carT += 0.012;
      const dist = surf.dist*speedFactor;
      const prog = Math.min(1, S.carT/dist*0.4);
      carX = w*0.16 + prog*w*0.7*dist;
      S.temp = g7eLerp(25, surf.tempEnd, Math.min(1,S.carT*1.3));
      if(S.carT>=dist*2.2 || prog>=1){ S.running=false; S.finished=true; controls(renderControls()); }
    } else if(S.finished){
      carX = w*0.16 + w*0.7*surf.dist*speedFactor;
      carX = Math.min(carX, w*0.82);
    }
    c.font=`${Math.round(h*0.07)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('🚗', g7eClamp(carX,w*0.16,w*0.84), roadY+h*0.025); c.textBaseline='alphabetic';

    // ميزان حرارة
    const thX=w*0.5, thY=h*0.58, thH=h*0.28;
    c.strokeStyle=g7eMut(dark); c.lineWidth=w*0.006; c.lineCap='round';
    c.beginPath(); c.moveTo(thX,thY); c.lineTo(thX,thY+thH); c.stroke();
    c.fillStyle=dark?'#1E1530':'#fff'; c.beginPath(); c.arc(thX,thY+thH+h*0.015,w*0.015,0,Math.PI*2); c.fill();
    c.strokeStyle=g7eMut(dark); c.lineWidth=2; c.beginPath(); c.arc(thX,thY+thH+h*0.015,w*0.015,0,Math.PI*2); c.stroke();
    const fillFrac=g7eClamp((S.temp-20)/20,0.08,0.95);
    c.strokeStyle='#E74C3C'; c.lineWidth=w*0.01; c.lineCap='round';
    c.beginPath(); c.moveTo(thX,thY+thH*(1-fillFrac)); c.lineTo(thX,thY+thH+h*0.012); c.stroke();
    c.fillStyle='#E74C3C'; c.beginPath(); c.arc(thX,thY+thH+h*0.015,w*0.018,0,Math.PI*2); c.fill();
    c.fillStyle=g7eTxt(dark); c.font=`bold ${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
    c.fillText(S.temp.toFixed(1)+'°C (توضيحية)', thX, thY-h*0.02);

    if(S.showEnergy){
      const keFrac = S.running? g7eClamp(1-S.carT/(surf.dist*speedFactor*2.2),0,1) : (S.finished?0.08:1);
      const heatFrac = 1-keFrac;
      const bx1=w*0.72, bx2=w*0.84, by=h*0.6, bh=h*0.25;
      c.strokeStyle=g7eMut(dark); c.lineWidth=2;
      c.strokeRect(bx1-w*0.025,by,w*0.05,bh); c.strokeRect(bx2-w*0.025,by,w*0.05,bh);
      c.fillStyle='#22C55E'; c.fillRect(bx1-w*0.025,by+bh*(1-keFrac),w*0.05,bh*keFrac);
      c.fillStyle='#EF4444'; c.fillRect(bx2-w*0.025,by+bh*(1-heatFrac),w*0.05,bh*heatFrac);
      c.fillStyle=g7eTxt(dark); c.font=`bold ${Math.round(h*0.013)}px Tajawal`; c.textAlign='center';
      c.fillText('طاقة حركة', bx1, by-h*0.015);
      c.fillText('طاقة حرارية', bx2, by-h*0.015);
    }

    c.fillStyle=g7eMut(dark); c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
    c.fillText(surf.icon+' سطح '+surf.label, w*0.5, roadY+h*0.11);

    g7eTitle(c,w,h,dark,'٣-٤(ب) · أين ذهبت الطاقة؟');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   ٣-٥(أ) · اخلط الماء واكتشف الطاقة الحرارية
   ══════════════════════════════════════════════════════════ */
function simG7Energy5a(){
  cancelAnimationFrame(animFrame);
  simState = { stage:'predict', predicted:null, coldV:100, hotV:100, coldPlaced:false, hotPlaced:false,
    dragType:null, dx:0, dy:0, mixT:0, mixed:false, showParts:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const JUG_COLD={x:0.14,y:0.24}, JUG_HOT={x:0.86,y:0.24}, CUP={x:0.5,y:0.6};

  function finalTemp(){ return (S.coldV*20 + S.hotV*80)/(S.coldV+S.hotV); }

  function renderControls(){
    if(S.stage==='predict'){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🌡️ اخلط الماء واكتشف الطاقة الحرارية</div></div>
        <div style="font-size:13.5px;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:12px;margin-bottom:12px">لدينا إبريق ماء ساخن (80°C) وإبريق ماء بارد (20°C).</div>
        <div style="font-size:14px;font-weight:700;margin-bottom:10px">توقّعي: إذا خلطنا كمّيتين متساويتين، ماذا ستكون درجة حرارة الخليط؟</div>
        <div class="ctrl-btns-grid-1">
          ${['ستكون قريبة من 20°C','ستكون بين الدرجتين (حوالي 50°C)','ستكون قريبة من 80°C'].map((o,i)=>`<button onclick="window._g7e5Predict(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:13.5px">${o}</button>`).join('')}
        </div>`;
    }
    if(S.stage==='setup'){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🧪 جهّزي الكميّات</div></div>
        <div class="ctrl-row"><div class="ctrl-name">الماء البارد <span class="ctrl-val">${S.coldV} mL</span></div>
          <input type="range" min="50" max="150" step="50" value="${S.coldV}" ${S.coldPlaced?'disabled':''} oninput="window._g7e5ColdV(+this.value)"></div>
        <div class="ctrl-row"><div class="ctrl-name">الماء الساخن <span class="ctrl-val">${S.hotV} mL</span></div>
          <input type="range" min="50" max="150" step="50" value="${S.hotV}" ${S.hotPlaced?'disabled':''} oninput="window._g7e5HotV(+this.value)"></div>
        <div style="font-size:13px;color:var(--text-secondary);margin-top:8px">اسحبي الإبريقين إلى الكأس المدرَّج (${(S.coldPlaced?1:0)+(S.hotPlaced?1:0)} من ٢).</div>
        ${(S.coldPlaced&&S.hotPlaced)?`<button class="ctrl-btn play" style="margin-top:10px" onclick="window._g7e5Mix()">🌀 اخلط</button>`:''}`;
    }
    if(S.stage==='mixing' || S.stage==='mixed'){
      let html = `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🌡️ درجة حرارة الخليط</div></div>
        <div class="info-box" style="font-size:20px;font-weight:800;text-align:center">${(S.mixT*finalTemp()+(1-S.mixT)*((S.coldV*20+S.hotV*20)/(S.coldV+S.hotV))).toFixed(1)}°C</div>
        <button class="ctrl-btn ${S.showParts?'active':'action'}" style="margin-top:10px" onclick="window._g7e5Parts()">⚛️ شاهد الجزيئات</button>`;
      if(S.showParts){
        html += `<div class="info-box" style="margin-top:10px">قبل الخلط: جزيئات الماء الساخن تتحرّك أسرع، وجزيئات الماء البارد تتحرّك أبطأ. أثناء الخلط تنتقل الطاقة الحرارية من الماء الساخن إلى البارد حتّى تتقارب سرعات الجزيئات.</div>`;
      }
      if(S.stage==='mixed'){
        const correct = S.predicted===1;
        html += `<div class="info-box" style="margin-top:10px">${correct?'✅ توقّعك كان صحيحاً! ':''}استقرّت درجة حرارة الخليط عند قيمة وسطية بين درجتي الماءين، لأنّ الطاقة الحرارية انتقلت من الماء الساخن إلى الماء البارد حتّى تساوت درجتا حرارتهما تقريباً.</div>
          <button class="ctrl-btn reset" style="margin-top:10px" onclick="window._g7e5Restart()">↺ جرّبي كمّيات مختلفة</button>`;
      }
      return html;
    }
  }
  controls(renderControls());

  window._g7e5Predict = function(i){ _g8pPlayClick(); S.predicted=i; S.stage='setup'; controls(renderControls()); };
  window._g7e5ColdV = function(v){ S.coldV=v; controls(renderControls()); };
  window._g7e5HotV = function(v){ S.hotV=v; controls(renderControls()); };
  window._g7e5Mix = function(){ _g8pPlayClick(); S.stage='mixing'; S.mixT=0.0001; controls(renderControls()); };
  window._g7e5Parts = function(){ _g8pPlayClick(); S.showParts=!S.showParts; controls(renderControls()); };
  window._g7e5Restart = function(){
    S.stage='predict'; S.predicted=null; S.coldV=100; S.hotV=100; S.coldPlaced=false; S.hotPlaced=false;
    S.mixT=0; S.mixed=false; S.showParts=false; controls(renderControls());
  };

  function onDown(e){
    if(S.stage!=='setup') return;
    const p=g7eGp(cv,e), w=cv.width, h=cv.height;
    if(!S.coldPlaced && Math.hypot(p.x-JUG_COLD.x*w,p.y-JUG_COLD.y*h)<w*0.08){ S.dragType='cold'; S.dx=p.x; S.dy=p.y; return; }
    if(!S.hotPlaced && Math.hypot(p.x-JUG_HOT.x*w,p.y-JUG_HOT.y*h)<w*0.08){ S.dragType='hot'; S.dx=p.x; S.dy=p.y; }
  }
  function onMove(e){ if(!S.dragType) return; e.preventDefault&&e.preventDefault(); const p=g7eGp(cv,e); S.dx=p.x; S.dy=p.y; }
  function onUp(){
    if(!S.dragType) return;
    const w=cv.width, h=cv.height;
    if(Math.hypot(S.dx-CUP.x*w,S.dy-CUP.y*h)<w*0.15){
      if(S.dragType==='cold') S.coldPlaced=true; else S.hotPlaced=true;
      _g8pPlayDrop(); controls(renderControls());
    }
    S.dragType=null;
  }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;
  cv.onclick=null;

  function draw(){
    if(currentSim!=='g7energy5' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7eBg(dark); c.fillRect(0,0,w,h);

    if(S.stage==='mixing'){
      S.mixT += 0.012;
      if(S.mixT>=1){ S.mixT=1; S.stage='mixed'; controls(renderControls()); }
    }

    const cupX=CUP.x*w, cupY=CUP.y*h, cupW=w*0.3, cupH=h*0.32;
    c.strokeStyle=g7eMut(dark); c.lineWidth=w*0.006; c.lineCap='round';
    c.beginPath(); c.moveTo(cupX-cupW/2,cupY); c.lineTo(cupX-cupW/2,cupY+cupH); c.lineTo(cupX+cupW/2,cupY+cupH); c.lineTo(cupX+cupW/2,cupY); c.stroke();

    if(S.stage==='setup' || S.stage==='mixing' || S.stage==='mixed'){
      const level = ((S.coldPlaced?0.5:0)+(S.hotPlaced?0.5:0)) * (S.stage==='setup'?1:1);
      c.save(); c.beginPath(); c.rect(cupX-cupW/2,cupY,cupW,cupH); c.clip();
      const initTemp = (S.coldV*20+S.hotV*20)/(S.coldV+S.hotV);
      const curTemp = S.mixT*finalTemp() + (1-S.mixT)*initTemp;
      const colorT = g7eClamp((curTemp-20)/60,0,1);
      c.fillStyle = `rgba(${Math.round(g7eLerp(56,239,colorT))},${Math.round(g7eLerp(189,68,colorT))},${Math.round(g7eLerp(248,68,colorT))},0.4)`;
      c.fillRect(cupX-cupW/2, cupY+cupH*(1-level), cupW, cupH*level);
      if(S.showParts && level>0){
        if(!S._parts) S._parts = Array.from({length:16},()=>({nx:Math.random(),ny:g7eRand(0.05,0.95),vx:g7eRand(-1,1),vy:g7eRand(-1,1)}));
        const speedF = g7eLerp(0.5,2.2,colorT);
        S._parts.forEach(p=>{
          p.nx+=p.vx*0.004*speedF; p.ny+=p.vy*0.004*speedF;
          if(p.nx<0.05||p.nx>0.95) p.vx*=-1; if(p.ny<(1-level)||p.ny>0.95) p.vy*=-1;
          p.nx=g7eClamp(p.nx,0.05,0.95); p.ny=g7eClamp(p.ny,1-level,0.95);
          c.fillStyle= dark?'#FCA5A5':'#B91C1C';
          c.beginPath(); c.arc(cupX-cupW/2+p.nx*cupW, cupY+p.ny*cupH, w*0.007,0,Math.PI*2); c.fill();
        });
      }
      c.restore();
    }
    c.fillStyle=g7eMut(dark); c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
    c.fillText('كأس مدرَّج', cupX, cupY+cupH+h*0.035);

    // الأباريق
    if(!S.coldPlaced){
      const x=S.dragType==='cold'?S.dx:JUG_COLD.x*w, y=S.dragType==='cold'?S.dy:JUG_COLD.y*h;
      c.font=`${Math.round(h*0.08)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('🧊', x, y); c.textBaseline='alphabetic';
      c.fillStyle=g7eTxt(dark); c.font=`bold ${Math.round(h*0.016)}px Tajawal`;
      c.fillText('ماء بارد 20°C', x, y+h*0.06);
    }
    if(!S.hotPlaced){
      const x=S.dragType==='hot'?S.dx:JUG_HOT.x*w, y=S.dragType==='hot'?S.dy:JUG_HOT.y*h;
      c.font=`${Math.round(h*0.08)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('♨️', x, y); c.textBaseline='alphabetic';
      c.fillStyle=g7eTxt(dark); c.font=`bold ${Math.round(h*0.016)}px Tajawal`;
      c.fillText('ماء ساخن 80°C', x, y+h*0.06);
    }

    g7eTitle(c,w,h,dark,'٣-٥(أ) · اخلط الماء واكتشف الطاقة الحرارية');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   ٣-٥(ب) · أين تذهب الطاقة الحرارية؟ (تبريد الماء)
   ══════════════════════════════════════════════════════════ */
function simG7Energy5b(){
  cancelAnimationFrame(animFrame);
  const TIMES=[0,2,4,6,8,10], TEMPS=[80,72,65,58,52,47], TEMPS_FAN=[80,68,58,50,44,39];
  simState = { idx:0, fanOn:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  cv.onclick=null;

  function curTemps(){ return S.fanOn?TEMPS_FAN:TEMPS; }

  function renderControls(){
    return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">❄️ أين تذهب الطاقة الحرارية؟</div></div>
      <div style="font-size:13.5px;color:var(--text-secondary);margin-bottom:10px">حرّكي الزمن وراقبي درجة حرارة كوب الماء الساخن وهي تنخفض تدريجياً.</div>
      <div class="ctrl-row"><div class="ctrl-name">الزمن <span class="ctrl-val">${TIMES[S.idx]} د</span></div>
        <input type="range" min="0" max="5" step="1" value="${S.idx}" oninput="window._g7e5bSet(+this.value)"></div>
      <div class="info-box">🌡️ ${curTemps()[S.idx]}°C</div>
      <button class="ctrl-btn ${S.fanOn?'active':'action'}" onclick="window._g7e5bFan()">🌀 ${S.fanOn?'إيقاف':'تشغيل'} المروحة</button>
      ${S.idx===5?`<div class="info-box" style="margin-top:10px">تنتقل الطاقة الحرارية من الماء الساخن (الأعلى حرارة) إلى الهواء المحيط (الأبرد)، لذلك تنخفض درجة حرارة الماء تدريجياً. المروحة تسرّع فقدان الطاقة الحرارية.</div>`:''}`;
  }
  controls(renderControls());
  window._g7e5bSet = function(v){ S.idx=v; controls(renderControls()); };
  window._g7e5bFan = function(){ _g8pPlayClick(); S.fanOn=!S.fanOn; controls(renderControls()); };

  function draw(){
    if(currentSim!=='g7energy5' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7eBg(dark); c.fillRect(0,0,w,h);
    const temp = curTemps()[S.idx];

    const cupX=w*0.27, cupY=h*0.32, cupW=w*0.24, cupH=h*0.36;
    c.strokeStyle=g7eMut(dark); c.lineWidth=w*0.006; c.lineCap='round';
    c.beginPath(); c.moveTo(cupX-cupW/2,cupY); c.lineTo(cupX-cupW/2,cupY+cupH); c.lineTo(cupX+cupW/2,cupY+cupH); c.lineTo(cupX+cupW/2,cupY); c.stroke();
    c.save(); c.beginPath(); c.rect(cupX-cupW/2,cupY,cupW,cupH); c.clip();
    const colorT=g7eClamp((temp-30)/55,0,1);
    c.fillStyle=`rgba(${Math.round(g7eLerp(56,239,colorT))},${Math.round(g7eLerp(189,68,colorT))},${Math.round(g7eLerp(248,68,colorT))},0.4)`;
    c.fillRect(cupX-cupW/2,cupY+cupH*0.1,cupW,cupH*0.85);
    if(!S._parts) S._parts = Array.from({length:14},()=>({nx:Math.random(),ny:g7eRand(0.15,0.95),vx:g7eRand(-1,1),vy:g7eRand(-1,1)}));
    const speedF=g7eLerp(0.4,2.2,colorT);
    S._parts.forEach(p=>{
      p.nx+=p.vx*0.004*speedF; p.ny+=p.vy*0.004*speedF;
      if(p.nx<0.06||p.nx>0.94) p.vx*=-1; if(p.ny<0.12||p.ny>0.95) p.vy*=-1;
      p.nx=g7eClamp(p.nx,0.06,0.94); p.ny=g7eClamp(p.ny,0.12,0.95);
      c.fillStyle= dark?'#FCA5A5':'#B91C1C';
      c.beginPath(); c.arc(cupX-cupW/2+p.nx*cupW,cupY+p.ny*cupH,w*0.008,0,Math.PI*2); c.fill();
    });
    if(temp>55){
      if(!S._steam) S._steam = Array.from({length:6},()=>({nx:g7eRand(0.3,0.7),ny:g7eRand(0.5,1.1),sp:g7eRand(0.005,0.011)}));
      S._steam.forEach(st=>{ st.ny-=st.sp*(speedF); if(st.ny<-0.1){st.ny=1.05; st.nx=g7eRand(0.3,0.7);}
        c.globalAlpha=g7eClamp((temp-55)/30,0.05,0.45)*g7eClamp(1-st.ny,0.1,1); c.fillStyle=dark?'#E5E7EB':'#fff';
        c.beginPath(); c.arc(cupX-cupW/2+st.nx*cupW,cupY+st.ny*cupH,w*0.014,0,Math.PI*2); c.fill();
      });
      c.globalAlpha=1;
    }
    c.restore();
    c.fillStyle=g7eTxt(dark); c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText(temp+'°C', cupX, cupY-h*0.025);

    // مروحة
    const fanX=w*0.5, fanY=h*0.45;
    c.save(); c.translate(fanX,fanY);
    if(S.fanOn) c.rotate(performance.now()*0.012);
    c.strokeStyle=g7eMut(dark); c.lineWidth=w*0.008; c.lineCap='round';
    for(let i=0;i<3;i++){ c.save(); c.rotate(i*Math.PI*2/3); c.beginPath(); c.moveTo(0,0); c.lineTo(0,-w*0.045); c.stroke(); c.restore(); }
    c.restore();
    c.fillStyle=g7eMut(dark); c.beginPath(); c.arc(fanX,fanY,w*0.012,0,Math.PI*2); c.fill();
    c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
    c.fillText(S.fanOn?'🌀 المروحة تعمل':'المروحة متوقّفة', fanX, fanY+h*0.08);

    // رسم بياني
    const gx=w*0.66, gy=h*0.2, gw=w*0.3, gh=h*0.44;
    c.strokeStyle=g7eMut(dark); c.lineWidth=1.5;
    c.beginPath(); c.moveTo(gx,gy); c.lineTo(gx,gy+gh); c.lineTo(gx+gw,gy+gh); c.stroke();
    c.fillStyle=g7eTxt(dark); c.font=`bold ${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
    c.fillText('الحرارة/الزمن', gx+gw/2, gy-h*0.015);
    const dataset = curTemps();
    c.strokeStyle=g7eAccent(dark); c.lineWidth=w*0.005; c.beginPath();
    for(let i=0;i<=S.idx;i++){
      const px=gx+(TIMES[i]/10)*gw, py=gy+gh-((dataset[i]-40)/45)*gh;
      i===0?c.moveTo(px,py):c.lineTo(px,py);
    }
    c.stroke();
    for(let i=0;i<=S.idx;i++){
      const px=gx+(TIMES[i]/10)*gw, py=gy+gh-((dataset[i]-40)/45)*gh;
      c.fillStyle=g7eAccent(dark); c.beginPath(); c.arc(px,py,w*0.007,0,Math.PI*2); c.fill();
    }

    g7eTitle(c,w,h,dark,'٣-٥(ب) · أين تذهب الطاقة الحرارية؟');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   ٣-٦ · كيف وصلت الطاقة؟ — ثلاث محطّات لنقل الطاقة
   ══════════════════════════════════════════════════════════ */
function simG7Energy6a(){
  cancelAnimationFrame(animFrame);
  simState = { station:1, lampOn:false, fanOn:false, dist:'near', drumHits:0, showAir:false,
    stage:'stations', chSel:null, chDone:{}, wireT:0 };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const CH_ITEMS = [
    { id:'lamp', icon:'💡', label:'مصباح مضاء', cat:'كهرباء' },
    { id:'phone', icon:'📱', label:'هاتف يشحن', cat:'كهرباء' },
    { id:'hand', icon:'✋', label:'تدفئة اليد قرب نار', cat:'إشعاع' },
    { id:'drum', icon:'🥁', label:'طبل', cat:'صوت' },
    { id:'fan', icon:'🌀', label:'مروحة كهربائية', cat:'كهرباء' },
    { id:'heater', icon:'🔥', label:'مدفأة', cat:'إشعاع' },
  ];

  function renderControls(){
    if(S.stage==='stations'){
      if(S.station===1){
        return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">⚡ المحطّة ١: الكهرباء</div></div>
          <div style="font-size:13.5px;color:var(--text-secondary);margin-bottom:10px">وصّلي الأسلاك بالبطارية لتشغيل الجهاز.</div>
          <div class="ctrl-btns-grid-1">
            <button class="ctrl-btn ${S.lampOn?'active':'play'}" onclick="window._g7e6Lamp()">💡 وصّلي المصباح</button>
            <button class="ctrl-btn ${S.fanOn?'active':'play'}" onclick="window._g7e6Fan()">🌀 وصّلي المروحة</button>
          </div>
          ${(S.lampOn||S.fanOn)?`<div class="info-box" style="margin-top:10px">انتقلت الطاقة الكهربائية عبر الأسلاك إلى الجهاز.</div>`:''}
          <button class="ctrl-btn action" style="margin-top:10px" onclick="window._g7e6Next()">➡ المحطّة التالية</button>`;
      }
      if(S.station===2){
        const T = {near:40,medium:32,far:25};
        return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">☀️ المحطّة ٢: الضوء والحرارة</div></div>
          <div style="font-size:13.5px;color:var(--text-secondary);margin-bottom:10px">غيّري مسافة اليد عن مصدر الحرارة.</div>
          <div class="ctrl-btns-grid-1">
            ${[['near','قريبة'],['medium','متوسطة'],['far','بعيدة']].map(([k,l])=>`<button class="ctrl-btn ${S.dist===k?'active':''}" onclick="window._g7e6Dist('${k}')">${l} (${T[k]}°C)</button>`).join('')}
          </div>
          <div class="info-box" style="margin-top:10px">تنتقل الطاقة الحرارية بالإشعاع دون الحاجة إلى ملامسة مباشرة، وتقلّ شدّتها كلّما ابتعدنا عن المصدر.</div>
          <button class="ctrl-btn action" style="margin-top:10px" onclick="window._g7e6Next()">➡ المحطّة التالية</button>`;
      }
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🥁 المحطّة ٣: الصوت</div></div>
        <div style="font-size:13.5px;color:var(--text-secondary);margin-bottom:10px">اضغطي على الطبل عدّة مرّات.</div>
        <button class="ctrl-btn play" onclick="window._g7e6Drum()">🥁 اضغطي على الطبل</button>
        <button class="ctrl-btn ${S.showAir?'active':'action'}" style="margin-top:10px" onclick="window._g7e6Air()">🌬️ شاهدي الهواء</button>
        ${S.showAir?`<div class="info-box" style="margin-top:10px">تهتزّ جزيئات الهواء وتنقل الطاقة من الطبل إلى الأذن؛ الأذن القريبة تسمع صوتاً أقوى من الأذن البعيدة.</div>`:''}
        <button class="ctrl-btn action" style="margin-top:10px" onclick="window._g7e6Challenge()">➡ التحدّي النهائي</button>`;
    }
    // تحدي التصنيف النهائي
    const doneN = Object.keys(S.chDone).length;
    if(doneN<CH_ITEMS.length){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🏆 التحدّي النهائي: صنّفي المواقف</div></div>
        <div style="font-size:13.5px;color:var(--text-secondary);margin-bottom:10px">اختاري طريقة انتقال الطاقة، ثمّ اضغطي على الموقف المناسب (${doneN} من ${CH_ITEMS.length}).</div>
        <div class="ctrl-btns-grid-1">
          ${['كهرباء','إشعاع','صوت'].map(cat=>`<button class="ctrl-btn ${S.chSel===cat?'active':''}" onclick="window._g7e6ChSel('${cat}')">${cat}</button>`).join('')}
        </div>`;
    }
    return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🎉 أحسنتِ!</div></div>
      <div class="info-box">تنتقل الطاقة بطرق مختلفة: عبر الأسلاك (كهرباء)، أو دون ملامسة (إشعاع)، أو عبر اهتزازات الهواء (صوت).</div>
      <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7e6Restart()">↺ أعد النشاط</button>`;
  }
  controls(renderControls());

  window._g7e6Lamp = function(){ _g8pPlayDrop(); S.lampOn=!S.lampOn; controls(renderControls()); };
  window._g7e6Fan = function(){ _g8pPlayDrop(); S.fanOn=!S.fanOn; controls(renderControls()); };
  window._g7e6Dist = function(k){ _g8pPlayClick(); S.dist=k; controls(renderControls()); };
  window._g7e6Drum = function(){ _g8pPlayClick(); S.drumHits++; controls(renderControls()); };
  window._g7e6Air = function(){ _g8pPlayClick(); S.showAir=!S.showAir; controls(renderControls()); };
  window._g7e6Next = function(){ _g8pPlayClick(); S.station++; controls(renderControls()); };
  window._g7e6Challenge = function(){ _g8pPlayClick(); S.stage='challenge'; controls(renderControls()); };
  window._g7e6ChSel = function(cat){ _g8pPlayClick(); S.chSel=cat; controls(renderControls()); };
  window._g7e6Restart = function(){
    S.station=1; S.lampOn=false; S.fanOn=false; S.dist='near'; S.drumHits=0; S.showAir=false;
    S.stage='stations'; S.chSel=null; S.chDone={}; controls(renderControls());
  };

  cv.onclick = function(e){
    if(S.stage!=='challenge' || !S.chSel) return;
    const p=g7eGp(cv,e), w=cv.width, h=cv.height;
    CH_ITEMS.forEach((it,i)=>{
      if(S.chDone[it.id]) return;
      const col=i%3, row=Math.floor(i/3);
      const x=w*(0.2+col*0.3), y=h*(0.35+row*0.32);
      if(Math.hypot(p.x-x,p.y-y)<w*0.09){
        if(it.cat===S.chSel){ S.chDone[it.id]=true; _g8pPlayDrop(); } else { _g8pPlayClick(); }
        controls(renderControls());
      }
    });
  };
  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null; cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null;

  function draw(){
    if(currentSim!=='g7energy6' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7eBg(dark); c.fillRect(0,0,w,h);

    if(S.stage==='stations' && S.station===1){
      const bx=w*0.2, by=h*0.5;
      c.fillStyle='#4B5563'; g7eRRect(c,bx-w*0.04,by-h*0.05,w*0.08,h*0.1,6); c.fill();
      c.fillStyle='#fff'; c.font=`${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
      c.fillText('🔋', bx, by+h*0.01);
      // مسار سلك للمصباح
      const lampX=w*0.55, lampY=h*0.32;
      c.strokeStyle=g7eMut(dark); c.lineWidth=3; c.beginPath(); c.moveTo(bx+w*0.04,by-h*0.02); c.lineTo(lampX,lampY); c.stroke();
      if(S.lampOn){
        S.wireT=(S.wireT+0.02)%1;
        const px=g7eLerp(bx+w*0.04,lampX,S.wireT), py=g7eLerp(by-h*0.02,lampY,S.wireT);
        c.fillStyle=g7eAccent(dark); c.beginPath(); c.arc(px,py,w*0.008,0,Math.PI*2); c.fill();
      }
      c.font=`${Math.round(h*0.06)}px Tajawal`; c.textAlign='center';
      c.fillText(S.lampOn?'💡':'⚫', lampX, lampY);
      if(S.lampOn){ c.save(); c.globalAlpha=0.3+0.15*Math.sin(performance.now()*0.01); c.fillStyle='#FDE047'; c.beginPath(); c.arc(lampX,lampY,w*0.05,0,Math.PI*2); c.fill(); c.restore(); }
      // مسار سلك للمروحة
      const fanX=w*0.82, fanY=h*0.32;
      c.strokeStyle=g7eMut(dark); c.lineWidth=3; c.beginPath(); c.moveTo(bx+w*0.04,by+h*0.02); c.lineTo(fanX,fanY); c.stroke();
      c.save(); c.translate(fanX,fanY); if(S.fanOn) c.rotate(performance.now()*0.012);
      c.strokeStyle=g7eMut(dark); c.lineWidth=w*0.006; c.lineCap='round';
      for(let i=0;i<3;i++){ c.save(); c.rotate(i*Math.PI*2/3); c.beginPath(); c.moveTo(0,0); c.lineTo(0,-w*0.035); c.stroke(); c.restore(); }
      c.restore();
      c.fillStyle=g7eTxt(dark); c.font=`bold ${Math.round(h*0.017)}px Tajawal`; c.textAlign='center';
      c.fillText('بطارية', bx, by+h*0.09);
    }

    if(S.stage==='stations' && S.station===2){
      const T = {near:40,medium:32,far:25};
      const srcX=w*0.22, handX = S.dist==='near'?w*0.4:(S.dist==='medium'?w*0.6:w*0.82);
      c.font=`${Math.round(h*0.08)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('🔥', srcX, h*0.45);
      for(let i=0;i<3;i++){
        const r=w*0.05+(i*w*0.04)+((performance.now()*0.05)%(w*0.04));
        c.strokeStyle=`rgba(249,115,22,${0.5-i*0.12})`; c.lineWidth=2;
        c.beginPath(); c.arc(srcX,h*0.45,r,-0.6,0.6); c.stroke();
      }
      c.fillText('✋', handX, h*0.45); c.textBaseline='alphabetic';
      c.fillStyle=g7eTxt(dark); c.font=`bold ${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
      c.fillText(T[S.dist]+'°C', handX, h*0.58);
    }

    if(S.stage==='stations' && S.station===3){
      const drumX=w*0.28, earNearX=w*0.55, earFarX=w*0.85;
      c.font=`${Math.round(h*0.08)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('🥁', drumX, h*0.45);
      c.fillText('👂', earNearX, h*0.45); c.fillText('👂', earFarX, h*0.45); c.textBaseline='alphabetic';
      if(S.drumHits>0){
        const t=(performance.now()*0.003)%1;
        [0,0.33,0.66].forEach(off=>{
          const rt=(t+off)%1;
          c.strokeStyle=`rgba(147,51,234,${1-rt})`; c.lineWidth=2;
          c.beginPath(); c.arc(drumX,h*0.45,w*0.03+rt*w*0.45,0,Math.PI*2); c.stroke();
        });
        if(S.showAir){
          if(!S._air) S._air = Array.from({length:16},()=>({d:g7eRand(0,1),ph:Math.random()*Math.PI*2}));
          S._air.forEach(p=>{
            const x=drumX+p.d*(earFarX-drumX);
            const y=h*0.45+Math.sin(performance.now()*0.02+p.ph)*h*0.02;
            c.fillStyle=dark?'rgba(216,180,254,0.7)':'rgba(147,51,234,0.55)';
            c.beginPath(); c.arc(x,y,w*0.006,0,Math.PI*2); c.fill();
          });
        }
      }
      c.fillStyle=g7eTxt(dark); c.font=`bold ${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
      c.fillText('قريبة', earNearX, h*0.55); c.fillText('بعيدة', earFarX, h*0.55);
    }

    if(S.stage==='challenge'){
      CH_ITEMS.forEach((it,i)=>{
        const col=i%3, row=Math.floor(i/3);
        const x=w*(0.2+col*0.3), y=h*(0.35+row*0.32);
        c.save();
        c.fillStyle= S.chDone[it.id]?'rgba(39,174,96,0.16)':(dark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)');
        c.strokeStyle= S.chDone[it.id]?'#27AE60':g7eMut(dark); c.lineWidth=2.5;
        c.beginPath(); c.arc(x,y,w*0.085,0,Math.PI*2); c.fill(); c.stroke();
        c.font=`${Math.round(h*0.045)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(it.icon, x, y); c.textBaseline='alphabetic';
        c.fillStyle=g7eTxt(dark); c.font=`bold ${Math.round(h*0.014)}px Tajawal`;
        c.fillText(it.label, x, y+w*0.12);
        if(S.chDone[it.id]){ c.fillStyle='#27AE60'; c.font=`bold ${Math.round(h*0.013)}px Tajawal`; c.fillText(it.cat, x, y+w*0.17); }
        c.restore();
      });
    }

    g7eTitle(c,w,h,dark,'٣-٦ · كيف وصلت الطاقة؟');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   ٣-٧(أ) · أي فلز يوصل الحرارة أسرع؟
   ══════════════════════════════════════════════════════════ */
function simG7Energy7a(){
  cancelAnimationFrame(animFrame);
  const METALS = { copper:{label:'نحاس',color:'#EA8C55',speed:1.5}, aluminum:{label:'ألومنيوم',color:'#C7CDD4',speed:1.0}, iron:{label:'حديد',color:'#6B7280',speed:0.65} };
  simState = { sel:'copper', running:false, t:0, pinsDown:{copper:0,aluminum:0,iron:0}, tested:{}, showEnergy:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  cv.onclick=null;

  function renderControls(){
    const allTested = Object.keys(METALS).every(k=>S.tested[k]);
    let html = `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🔥 أي فلز يوصل الحرارة أسرع؟</div></div>
      <div style="font-size:13.5px;color:var(--text-secondary);margin-bottom:10px">اختاري فلزّاً ثمّ ابدئي التسخين، وراقبي سقوط الدبابيس المثبَّتة بالشمع.</div>
      <div class="ctrl-btns-grid-1">
        ${Object.keys(METALS).map(k=>`<button class="ctrl-btn ${S.sel===k?'active':''}" onclick="window._g7e7Sel('${k}')" ${S.running?'disabled':''}>${METALS[k].label} ${S.tested[k]?'✅':''}</button>`).join('')}
      </div>
      <button class="ctrl-btn play" style="margin-top:10px" onclick="window._g7e7Start()" ${S.running?'disabled':''}>▶️ ابدأ التسخين</button>
      <button class="ctrl-btn ${S.showEnergy?'active':'action'}" style="margin-top:10px" onclick="window._g7e7Energy()">⚛️ شاهدي انتقال الطاقة</button>`;
    if(S.showEnergy) html += `<div class="info-box" style="margin-top:10px">تهتزّ جسيمات الفلز، وتنتقل هذه الاهتزازات تدريجياً من الطرف الساخن إلى الطرف البارد.</div>`;
    if(allTested){
      html += `<div class="ctrl-section" style="margin-top:12px"><div class="ctrl-label" style="font-size:15px">📊 النتائج</div></div>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:10px">
        <thead><tr style="background:var(--bg-card2)"><th style="padding:6px">الفلز</th><th style="padding:6px">السرعة</th></tr></thead>
        <tbody>
          <tr><td style="padding:6px;text-align:center;border-bottom:1px solid #ddd3">نحاس</td><td style="padding:6px;text-align:center;border-bottom:1px solid #ddd3">الأسرع 🥇</td></tr>
          <tr><td style="padding:6px;text-align:center;border-bottom:1px solid #ddd3">ألومنيوم</td><td style="padding:6px;text-align:center;border-bottom:1px solid #ddd3">متوسط 🥈</td></tr>
          <tr><td style="padding:6px;text-align:center">حديد</td><td style="padding:6px;text-align:center">الأبطأ 🥉</td></tr>
        </tbody>
      </table>
      <div class="info-box">الفلز الذي تنتقل خلاله الحرارة أسرع هو أفضل موصل للحرارة، والنحاس هو الأفضل توصيلاً بين الفلزّات الثلاثة.</div>
      <button class="ctrl-btn reset" style="margin-top:10px" onclick="window._g7e7Restart()">↺ أعد النشاط</button>`;
    }
    return html;
  }
  controls(renderControls());

  window._g7e7Sel = function(k){ if(S.running) return; S.sel=k; controls(renderControls()); };
  window._g7e7Start = function(){
    if(S.running || S.tested[S.sel]) return;
    _g8pPlayClick(); S.running=true; S.t=0.0001; S.pinsDown[S.sel]=0; controls(renderControls());
  };
  window._g7e7Energy = function(){ _g8pPlayClick(); S.showEnergy=!S.showEnergy; controls(renderControls()); };
  window._g7e7Restart = function(){
    S.sel='copper'; S.running=false; S.t=0; S.pinsDown={copper:0,aluminum:0,iron:0}; S.tested={}; S.showEnergy=false;
    controls(renderControls());
  };

  function draw(){
    if(currentSim!=='g7energy7' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7eBg(dark); c.fillRect(0,0,w,h);
    const m = METALS[S.sel];

    if(S.running){
      S.t += 0.012*m.speed;
      const targetPins = Math.min(5, Math.floor(S.t*6));
      if(targetPins>S.pinsDown[S.sel]){ S.pinsDown[S.sel]=targetPins; _g8pPlayDrop(); }
      if(S.t>=1){ S.running=false; S.pinsDown[S.sel]=5; S.tested[S.sel]=true; controls(renderControls()); }
    }

    const rodX=w*0.15, rodY=h*0.45, rodW=w*0.7, rodH=h*0.05;
    // مصدر الحرارة
    const flameX=rodX;
    c.font=`${Math.round(h*0.05)}px Tajawal`; c.textAlign='center';
    c.fillText('🔥', flameX, rodY+rodH+h*0.06);

    const heatFrac = g7eClamp(S.t,0,1);
    const grad = c.createLinearGradient(rodX,0,rodX+rodW,0);
    grad.addColorStop(0, '#EF4444');
    grad.addColorStop(g7eClamp(heatFrac,0.05,1), m.color);
    grad.addColorStop(1, m.color);
    c.fillStyle = grad;
    c.fillRect(rodX,rodY,rodW,rodH);
    c.strokeStyle=g7eMut(dark); c.lineWidth=2; c.strokeRect(rodX,rodY,rodW,rodH);

    // الدبابيس والشمع
    for(let i=0;i<5;i++){
      const px = rodX + rodW*(0.12+i*0.19);
      const fallen = i<S.pinsDown[S.sel];
      const py = fallen? rodY+rodH+h*0.09+ (i*3) : rodY+rodH+h*0.015;
      c.save();
      if(fallen) c.globalAlpha=0.55;
      c.fillStyle='#FBBF24'; c.beginPath(); c.arc(px,rodY+rodH+h*0.01,w*0.008,0,Math.PI*2); c.fill();
      c.strokeStyle='#78350F'; c.lineWidth=2;
      c.beginPath(); c.moveTo(px,py); c.lineTo(px,py+h*0.03); c.stroke();
      c.restore();
    }

    if(S.showEnergy && S.running){
      const n=10;
      for(let i=0;i<n;i++){
        const bx = rodX+rodW*(i/n);
        if(bx > rodX+rodW*heatFrac+w*0.03) continue;
        const jit = Math.sin(performance.now()*0.02+i)*3;
        c.fillStyle=dark?'rgba(255,255,255,0.8)':'rgba(0,0,0,0.55)';
        c.beginPath(); c.arc(bx,rodY+rodH/2+jit,w*0.006,0,Math.PI*2); c.fill();
      }
    }

    c.fillStyle=g7eTxt(dark); c.font=`bold ${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
    c.fillText('قضيب '+m.label, rodX+rodW/2, rodY-h*0.025);

    g7eTitle(c,w,h,dark,'٣-٧(أ) · أي فلز يوصل الحرارة أسرع؟');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   ٣-٧(ب) · سباق ذوبان الثلج
   ══════════════════════════════════════════════════════════ */
function simG7Energy7b(){
  cancelAnimationFrame(animFrame);
  simState = { running:false, t:0, done:false, qAnswered:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  cv.onclick=null;
  const METAL_RATE=1.6, PLASTIC_RATE=0.55;

  function renderControls(){
    let html = `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🧊 سباق ذوبان الثلج</div></div>
      <div style="font-size:13.5px;color:var(--text-secondary);margin-bottom:10px">لوحان مختلفان وفوق كلّ منهما مكعّب ثلج متطابق. أيّهما سيذوب أسرع؟</div>
      <button class="ctrl-btn play" onclick="window._g7e7bStart()" ${S.running||S.done?'disabled':''}>▶️ ابدأ التجربة</button>`;
    if(S.done){
      html += `<div class="info-box" style="margin-top:12px">الفلزّات موصلات جيّدة للحرارة، أمّا البلاستيك فهو مادّة عازلة نسبياً، لذلك ذاب الثلج على اللوح الفلزّي أسرع بكثير.</div>
      <div class="ctrl-section" style="margin-top:12px"><div class="ctrl-label" style="font-size:15px">❓ وضعت مريم ملعقة معدنية وملعقة بلاستيكية في كوب شاي ساخن لمدّة دقيقة. أيّ الملعقتين ستصبح أكثر سخونة؟</div></div>
      ${g7eMCQ('g7e7bq',['الملعقة المعدنية','الملعقة البلاستيكية','ستصبحان بالسخونة نفسها'])}
      <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7e7bRestart()">↺ أعد النشاط</button>`;
    }
    return html;
  }
  controls(renderControls());
  window._g7e7bStart = function(){ if(S.running||S.done) return; _g8pPlayClick(); S.running=true; S.t=0.0001; controls(renderControls()); };
  window._g7e7bqAns = function(i){ if(S.qAnswered) return; S.qAnswered=true; g7eAnswerMCQ('g7e7bq',i,0,'الفلزّات توصل الحرارة بسرعة أكبر من البلاستيك، لذلك تنتقل الحرارة عبر الملعقة المعدنية وتصبح ساخنة أسرع.'); };
  window._g7e7bRestart = function(){ S.running=false; S.t=0; S.done=false; S.qAnswered=false; controls(renderControls()); };

  function draw(){
    if(currentSim!=='g7energy7' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7eBg(dark); c.fillRect(0,0,w,h);

    if(S.running){
      S.t += 0.01;
      if(S.t>=1){ S.t=1; S.running=false; S.done=true; controls(renderControls()); }
    }
    const metalMelt = g7eClamp(S.t*METAL_RATE,0,1);
    const plasticMelt = g7eClamp(S.t*PLASTIC_RATE,0,1);

    function panel(x,label,color,melt){
      const plX=x, plY=h*0.55, plW=w*0.28, plH=h*0.04;
      c.fillStyle=color; c.fillRect(plX-plW/2,plY,plW,plH);
      c.strokeStyle=g7eMut(dark); c.lineWidth=2; c.strokeRect(plX-plW/2,plY,plW,plH);
      const size=w*0.09*(1-melt*0.85);
      c.fillStyle= dark?'rgba(224,247,255,0.9)':'#EFF7FB'; c.strokeStyle='#9FD3EA'; c.lineWidth=2;
      c.fillRect(plX-size/2,plY-size,size,size); c.strokeRect(plX-size/2,plY-size,size,size);
      if(melt>0.05){
        c.fillStyle= dark?'rgba(56,189,248,0.4)':'rgba(147,197,253,0.7)';
        c.beginPath(); c.ellipse(plX,plY+plH+h*0.006,w*0.06*melt,h*0.008*melt,0,0,Math.PI*2); c.fill();
      }
      c.fillStyle=g7eTxt(dark); c.font=`bold ${Math.round(h*0.018)}px Tajawal`; c.textAlign='center';
      c.fillText(label, plX, plY+plH+h*0.05);
      c.fillStyle=g7eMut(dark); c.font=`${Math.round(h*0.015)}px Tajawal`;
      c.fillText(Math.round(melt*100)+'% ذائب', plX, plY+plH+h*0.08);
    }
    panel(w*0.3,'لوح فلزّي','#C7CDD4',metalMelt);
    panel(w*0.7,'لوح بلاستيكي','#93C5FD',plasticMelt);

    g7eTitle(c,w,h,dark,'٣-٧(ب) · سباق ذوبان الثلج');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   ٣-٨ · ملاحظة تيار الحمل الحراري
   ══════════════════════════════════════════════════════════ */
function simG7Energy8a(){
  cancelAnimationFrame(animFrame);
  simState = { stage:'predict', predicted:null, lit:false, minute:0, heat:'medium', qAnswered:false, particles:[] };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  cv.onclick=null;
  const HEAT_SPEED = {low:0.6, medium:1, high:1.6};

  function renderControls(){
    if(S.stage==='predict'){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🌀 ملاحظة تيار الحمل الحراري</div></div>
        <div style="font-size:13.5px;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:12px;margin-bottom:12px">وُضعت بلورة برمنغنات البوتاسيوم (لونها بنفسجي) في قاع كأس ماء، وسيُسخَّن الماء من الأسفل.</div>
        <div style="font-size:14px;font-weight:700;margin-bottom:10px">إذا سُخّن الماء من الأسفل، في أيّ اتّجاه تتوقّعين أن يتحرّك الماء الملوَّن؟</div>
        <div class="ctrl-btns-grid-1">
          ${['إلى الأسفل','يبقى في مكانه','إلى الأعلى ثمّ يدور داخل الكأس'].map((o,i)=>`<button onclick="window._g7e8Predict(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:13.5px">${o}</button>`).join('')}
        </div>`;
    }
    if(!S.lit){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🔬 جاهزة للتسخين</div></div>
        <div class="ctrl-row"><div class="ctrl-name">قوّة التسخين</div></div>
        <div class="ctrl-btns-grid" style="margin-bottom:10px">
          ${['low','medium','high'].map(k=>`<button class="ctrl-btn ${S.heat===k?'active':''}" onclick="window._g7e8Heat('${k}')">${k==='low'?'منخفض':k==='medium'?'متوسط':'مرتفع'}</button>`).join('')}
        </div>
        <button class="ctrl-btn play" onclick="window._g7e8Light()">🔥 أشعل الموقد</button>`;
    }
    let html = `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">⏱️ الدقيقة ${S.minute}</div></div>
      <div class="ctrl-row"><div class="ctrl-name">قوّة التسخين</div></div>
      <div class="ctrl-btns-grid" style="margin-bottom:10px">
        ${['low','medium','high'].map(k=>`<button class="ctrl-btn ${S.heat===k?'active':''}" onclick="window._g7e8Heat('${k}')">${k==='low'?'منخفض':k==='medium'?'متوسط':'مرتفع'}</button>`).join('')}
      </div>
      <div class="info-box">${G7E8_MIN[Math.min(S.minute,4)]}</div>`;
    if(S.minute>=4){
      html += `<div class="ctrl-section" style="margin-top:12px"><div class="ctrl-label" style="font-size:15px">❓ لماذا ارتفع الماء الملوَّن الموجود فوق اللهب أوّلاً؟</div></div>
        ${g7eMCQ('g7e8q',['لأنّه أصبح أثقل','لأنّ اللون البنفسجي أخفّ من الماء','لأنّ الماء الساخن أصبح أقلّ كثافة فارتفع إلى الأعلى','لأنّ الموقد دفع الماء إلى أعلى'])}
        <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7e8Restart()">↺ أعد النشاط</button>`;
    }
    return html;
  }
  const G7E8_MIN = [
    'الماء شفّاف، والبلورة في القاع، ولا توجد حركة واضحة.',
    'يبدأ اللون البنفسجي بالصعود فوق اللهب: الماء القريب من اللهب يكتسب طاقة حرارية.',
    'يصل الماء الملوَّن إلى أعلى الكأس وينتشر نحو الجوانب، ويظهر مسار دائري.',
    'يهبط الماء الأبرد على الجوانب، ويستمرّ صعود الماء الساخن من المنتصف.',
    'ينتشر اللون في معظم أجزاء الكأس، ويظهر مسار تيار الحمل الحراري بوضوح.',
  ];
  controls(renderControls());

  window._g7e8Predict = function(i){ _g8pPlayClick(); S.predicted=i; S.stage='setup'; controls(renderControls()); };
  window._g7e8Heat = function(k){ _g8pPlayClick(); S.heat=k; controls(renderControls()); };
  window._g7e8Light = function(){
    _g8pPlayClick(); S.lit=true; S.minute=0;
    S.particles = Array.from({length:40},()=>({ang:g7eRand(0,Math.PI*2), r:g7eRand(0,0.06), phase:Math.random()}));
    controls(renderControls());
    S._timer = setInterval(()=>{
      S.minute = Math.min(4, S.minute+1);
      controls(renderControls());
      if(S.minute>=4){ clearInterval(S._timer); S._timer=null; }
    }, 1500/HEAT_SPEED[S.heat]);
  };
  window._g7e8qAns = function(i){
    if(S.qAnswered) return; S.qAnswered=true;
    g7eAnswerMCQ('g7e8q', i, 2, 'عندما يكتسب الماء طاقة حرارية تتحرّك جزيئاته أسرع وتبتعد قليلاً عن بعضها، فتقلّ كثافته ويرتفع إلى أعلى، مكوِّناً تيار الحمل الحراري.');
  };
  window._g7e8Restart = function(){
    if(S._timer){ clearInterval(S._timer); S._timer=null; }
    S.stage='predict'; S.predicted=null; S.lit=false; S.minute=0; S.heat='medium'; S.qAnswered=false;
    controls(renderControls());
  };

  function draw(){
    if(currentSim!=='g7energy8' || currentTab!==0){
      cancelAnimationFrame(animFrame);
      if(S._timer){ clearInterval(S._timer); S._timer=null; }
      return;
    }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7eBg(dark); c.fillRect(0,0,w,h);

    const cupX=w*0.5, cupY=h*0.2, cupW=w*0.34, cupH=h*0.5;
    c.strokeStyle=g7eMut(dark); c.lineWidth=w*0.007; c.lineCap='round';
    c.beginPath(); c.moveTo(cupX-cupW/2,cupY); c.lineTo(cupX-cupW/2,cupY+cupH); c.lineTo(cupX+cupW/2,cupY+cupH); c.lineTo(cupX+cupW/2,cupY); c.stroke();
    c.save(); c.beginPath(); c.rect(cupX-cupW/2,cupY,cupW,cupH); c.clip();
    c.fillStyle= dark?'rgba(56,189,248,0.14)':'rgba(147,197,253,0.22)';
    c.fillRect(cupX-cupW/2,cupY,cupW,cupH);

    if(S.lit){
      const prog = g7eClamp(S.minute/4,0,1);
      S.particles.forEach(p=>{
        p.phase += 0.01*HEAT_SPEED[S.heat];
        // حركة تصاعدية من المنتصف ثم انتشار جانبي وهبوط عند الجدران (مسار بيضاوي دائري)
        const cycle = (p.phase*0.6)%1;
        let px, py;
        if(cycle<0.5){
          const t=cycle/0.5;
          px = cupX + (p.ang-Math.PI)*cupW*0.02*Math.sin(p.ang);
          px = cupX + Math.sin(p.ang)*cupW*0.06*(1-t*0.3);
          py = cupY+cupH*0.95 - t*cupH*0.85;
        } else {
          const t=(cycle-0.5)/0.5;
          const side = p.ang>Math.PI?1:-1;
          px = cupX + side*cupW*0.42*t;
          py = cupY+cupH*0.1 + t*cupH*0.85;
        }
        const visible = prog>0.05 ? g7eClamp((prog-0.05)/0.3,0,1) : 0;
        if(visible<=0) return;
        c.globalAlpha = visible;
        c.fillStyle = dark?'#D8B4FE':'#7C2D92';
        c.beginPath(); c.arc(px,py,w*0.008,0,Math.PI*2); c.fill();
      });
      c.globalAlpha=1;
      // أسهم اتجاه بسيطة عند المنتصف والجوانب
      if(S.minute>=1){
        c.strokeStyle=g7eAccent(dark); c.lineWidth=2; c.lineCap='round';
        c.beginPath(); c.moveTo(cupX,cupY+cupH*0.75); c.lineTo(cupX,cupY+cupH*0.35); c.stroke();
        c.beginPath(); c.moveTo(cupX,cupY+cupH*0.35); c.lineTo(cupX-6,cupY+cupH*0.35+8); c.moveTo(cupX,cupY+cupH*0.35); c.lineTo(cupX+6,cupY+cupH*0.35+8); c.stroke();
      }
    } else {
      c.fillStyle='#7C2D92'; c.beginPath(); c.arc(cupX,cupY+cupH*0.92,w*0.012,0,Math.PI*2); c.fill();
    }
    c.restore();
    c.fillStyle=g7eMut(dark); c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
    c.fillText('كأس ماء + بلورة برمنغنات البوتاسيوم', cupX, cupY-h*0.02);

    // موقد
    const stoveY=cupY+cupH+h*0.04;
    c.fillStyle='#4B5563'; c.fillRect(cupX-w*0.15,stoveY,w*0.3,h*0.03);
    if(S.lit){
      for(let i=-2;i<=2;i++){
        const fx=cupX+i*w*0.05, fh=h*0.03*HEAT_SPEED[S.heat]*(0.7+0.3*Math.sin(performance.now()*0.012+i*2));
        c.fillStyle='#F97316';
        c.beginPath(); c.moveTo(fx,stoveY); c.quadraticCurveTo(fx-w*0.01,stoveY-fh*0.6,fx,stoveY-fh); c.quadraticCurveTo(fx+w*0.01,stoveY-fh*0.6,fx,stoveY); c.fill();
      }
    }

    g7eTitle(c,w,h,dark,'٣-٨ · ملاحظة تيار الحمل الحراري');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}
