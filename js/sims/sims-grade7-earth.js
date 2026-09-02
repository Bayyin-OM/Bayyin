// ══════════════════════════════════════════════════════════
// الصف السابع — الوحدة الخامسة: الأرض
// ٥-٢(ب) فحص مكونات التربة · ٥-٢(ج) تصريف التربة للماء
// ٥-٤ مسامية الصخور الرسوبية · ٥-٥ خصائص الصخور (المتحولة)
// ══════════════════════════════════════════════════════════

function g7eaBg(dark){ return dark ? '#1A130B' : '#FBF6EC'; }
function g7eaTxt(dark){ return dark ? '#F0E4C8' : '#3A2A14'; }
function g7eaMut(dark){ return dark ? '#B79A6B' : '#7A6440'; }
function g7eaAccent(dark){ return dark ? '#F0B429' : '#B45309'; }
function g7eaClamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function g7eaRand(a,b){ return a+Math.random()*(b-a); }
function g7eaLerp(a,b,t){ return a+(b-a)*t; }
function g7eaGp(cv,e){
  const r=cv.getBoundingClientRect(), sc=cv.width/r.width;
  const s=(e.touches&&e.touches[0])||(e.changedTouches&&e.changedTouches[0])||e;
  return { x:(s.clientX-r.left)*sc, y:(s.clientY-r.top)*sc };
}
function g7eaTitle(c,w,h,dark,text){
  c.fillStyle=g7eaTxt(dark); c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
  c.fillText(text, w/2, h*0.062);
}
function g7eaRRect(c,x,y,w,h,r){ c.beginPath(); if(c.roundRect) c.roundRect(x,y,w,h,r); else c.rect(x,y,w,h); }
function g7eaEmoji(c,emoji,x,y,size){
  c.font=`${size}px sans-serif`; c.textAlign='center'; c.textBaseline='middle';
  c.fillText(emoji,x,y);
  c.textBaseline='alphabetic';
}
function g7eaMCQ(id, opts){
  return `<div style="display:flex;flex-direction:column;gap:8px">
    ${opts.map((o,i)=>`<button id="${id}${i}" onclick="window._${id}Ans(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:13.5px;text-align:right">${o}</button>`).join('')}
  </div><div id="${id}Fb" style="margin-top:10px;font-size:13.5px;line-height:1.8;color:var(--text-secondary)"></div>`;
}
function g7eaAnswerMCQ(id, i, correctIdx, msg){
  const btn=document.getElementById(id+i);
  const ok = i===correctIdx;
  if(btn){ btn.style.background= ok?'#27AE60':'#E74C3C'; btn.style.color='white'; btn.style.borderColor= ok?'#27AE60':'#E74C3C'; }
  if(!ok){ const okBtn=document.getElementById(id+correctIdx); if(okBtn){ okBtn.style.background='#27AE60'; okBtn.style.color='white'; okBtn.style.borderColor='#27AE60'; } }
  const fb=document.getElementById(id+'Fb');
  if(fb) fb.innerHTML=(ok?'💡 أحسنت! ':'💡 ')+msg;
  return ok;
}

/* ══════════════════════════════════════════════════════════
   ٥-٢(ب) · فحص مكونات التربة — مختبر تحليل التربة
   ══════════════════════════════════════════════════════════ */
function simG7Earth2b(){
  cancelAnimationFrame(animFrame);
  const SOILS = [
    { id:'sandy', label:'تربة رملية',        icon:'🟡', comp:{gravel:0.09,sand:0.50,silt:0.11,clay:0.05,humus:0.05,water:0.20} },
    { id:'clay',  label:'تربة طينية',        icon:'🟤', comp:{gravel:0.03,sand:0.08,silt:0.14,clay:0.52,humus:0.04,water:0.19} },
    { id:'humus', label:'تربة غنية بالدبال', icon:'🌿', comp:{gravel:0.04,sand:0.14,silt:0.14,clay:0.10,humus:0.34,water:0.24} },
  ];
  const LAYER_ORDER = ['gravel','sand','silt','clay','humus','water'];
  const LAYER_INFO = {
    gravel:{label:'حصى', color:'#8B8378', desc:'أكبر الحبيبات حجماً، تستقر أولاً في القاع.'},
    sand:{label:'رمل', color:'#E0B96A', desc:'حبيبات كبيرة نسبياً، خشنة الملمس.'},
    silt:{label:'طمي', color:'#B08858', desc:'حبيبات أدقّ من الرمل وأكبر من الطين.'},
    clay:{label:'طين', color:'#8B5E34', desc:'حبيبات دقيقة جدّاً، تستقر ببطء شديد.'},
    humus:{label:'دبال', color:'#4B7A3B', desc:'بقايا نباتات وحيوانات متحلّلة، تطفو على السطح.'},
    water:{label:'ماء', color:'#7FB8E0', desc:'الماء الذي أُضيف إلى المرطبان.'},
  };
  const DAYS = [ {label:'الآن',p:0}, {label:'بعد ساعة',p:0.32}, {label:'بعد 6 ساعات',p:0.68}, {label:'بعد يوم كامل',p:1} ];

  simState = {
    stage:'choose', soil:null, dragId:null, dragX:0, dragY:0,
    watered:false, closed:false, shaking:false, shaken:false,
    dayIdx:0, selLayer:null, compareOn:false,
    challenge:false, challengeSoil:null, qAnswered:false,
  };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function jarRect(w,h){ return { x:w*0.5-w*0.11, y:h*0.28, w:w*0.22, h:h*0.5 }; }

  function renderControls(){
    if(S.stage==='choose'){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🫙 مختبر تحليل التربة</div></div>
        <div style="font-size:13px;color:var(--text-secondary);margin-bottom:10px">اسحب إحدى عيّنات التربة إلى المرطبان الزجاجي.</div>
        <div style="font-size:12.5px;color:var(--text-secondary)">${S.soil? 'العيّنة المختارة: '+S.soil.icon+' '+S.soil.label : 'لم تختر عيّنة بعد'}</div>`;
    }
    if(S.stage==='water'){
      let html = `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">💧 إضافة الماء</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:10px">العيّنة: ${S.soil.icon} ${S.soil.label}</div>`;
      if(!S.watered) html += `<button class="ctrl-btn play" onclick="window._g7ea2bWater()">🚰 اسكب الماء حتى الثلثين</button>`;
      else if(!S.closed) html += `<button class="ctrl-btn play" onclick="window._g7ea2bClose()">🔒 أغلق المرطبان</button>`;
      else if(!S.shaken) html += S.shaking
        ? `<div class="info-box">🌀 جارٍ التحريك...</div>`
        : `<button class="ctrl-btn play" onclick="window._g7ea2bShake()">🌀 حرّك المرطبان</button>`;
      return html;
    }
    // settle stage
    let html = `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">⏱️ ${DAYS[S.dayIdx].label}</div></div>
      <input type="range" min="0" max="3" step="1" value="${S.dayIdx}" oninput="window._g7ea2bSeek(this.value)" style="width:100%;margin-bottom:6px">
      <div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--text-secondary);margin-bottom:12px">${DAYS.map(d=>`<span>${d.label}</span>`).join('')}</div>`;
    if(S.dayIdx===3){
      html += `<div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:8px">🔍 اضغط على أيّ طبقة في المرطبان لمعرفة مكوّناتها.</div>`;
      if(S.selLayer){
        const info = LAYER_INFO[S.selLayer];
        html += `<div class="info-box" style="margin-bottom:10px"><b>${info.label}:</b> ${info.desc}</div>`;
      }
      html += `<button class="ctrl-btn" onclick="window._g7ea2bCompare()">${S.compareOn?'🔙 إخفاء المقارنة':'🧑‍🔬 قارن مع عيّنة أخرى'}</button>`;
      if(!S.challenge){
        html += `<button class="ctrl-btn" style="margin-top:10px" onclick="window._g7ea2bChallenge()">🎯 التحدّي النهائي</button>`;
      } else {
        html += `<div class="ctrl-section" style="margin-top:12px"><div class="ctrl-label" style="font-size:15px">❓ مرطبان مجهول — ما نوع هذه التربة برأيك؟</div></div>
          ${g7eaMCQ('g7ea2bq',['تربة رملية','تربة طينية','تربة غنية بالدبال'])}
          <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7ea2bRestart()">↺ أعد النشاط</button>`;
      }
    }
    return html;
  }
  controls(renderControls());

  window._g7ea2bWater = function(){ _g8pPlayClick(); S.watered=true; controls(renderControls()); };
  window._g7ea2bClose = function(){ _g8pPlayClick(); S.closed=true; controls(renderControls()); };
  window._g7ea2bShake = function(){
    _g8pPlayClick(); S.shaking=true; controls(renderControls());
    setTimeout(()=>{ S.shaking=false; S.shaken=true; S.stage='settle'; S.dayIdx=0; controls(renderControls()); },1200);
  };
  window._g7ea2bSeek = function(v){ _g8pPlayClick(); S.dayIdx=+v; S.selLayer=null; controls(renderControls()); };
  window._g7ea2bCompare = function(){ _g8pPlayClick(); S.compareOn=!S.compareOn; controls(renderControls()); };
  window._g7ea2bChallenge = function(){
    _g8pPlayClick(); S.challenge=true;
    const others = SOILS.filter(s=>s.id!==S.soil.id);
    S.challengeSoil = Math.random()<0.5 ? S.soil : others[Math.floor(Math.random()*others.length)];
    controls(renderControls());
  };
  window._g7ea2bqAns = function(i){
    if(S.qAnswered) return; S.qAnswered=true;
    const correctIdx = SOILS.findIndex(s=>s.id===S.challengeSoil.id);
    g7eaAnswerMCQ('g7ea2bq', i, correctIdx, `هذه العيّنة كانت ${S.challengeSoil.icon} ${S.challengeSoil.label}. يمكن معرفة نوع التربة من حجم كل طبقة ونسبتها داخل المرطبان.`);
  };
  window._g7ea2bRestart = function(){
    S.stage='choose'; S.soil=null; S.watered=false; S.closed=false; S.shaking=false; S.shaken=false;
    S.dayIdx=0; S.selLayer=null; S.compareOn=false; S.challenge=false; S.challengeSoil=null; S.qAnswered=false;
    controls(renderControls());
  };

  function drawJar(c,w,h,dark,jx,jy,jw,jh,soil,progress,label,clickable){
    c.strokeStyle=g7eaMut(dark); c.lineWidth=w*0.006;
    g7eaRRect(c,jx,jy,jw,jh,10); c.stroke();
    c.save();
    g7eaRRect(c,jx+2,jy+2,jw-4,jh-4,8); c.clip();
    if(!soil){
      c.fillStyle=dark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)'; c.fillRect(jx,jy,jw,jh);
    } else if(progress<0.05){
      // مخلوط متجانس قبل الاستقرار
      c.fillStyle='#9C7E52'; c.fillRect(jx,jy,jw,jh*0.62);
      c.fillStyle='#B9CBDD'; c.fillRect(jx,jy+jh*0.62,jw,jh*0.38);
    } else {
      let yCursor = jy+jh;
      LAYER_ORDER.forEach(key=>{
        const frac = soil.comp[key]*g7eaClamp(progress,0,1) + (soil.comp[key]*0.12)*(1-g7eaClamp(progress,0,1));
        const bandH = frac*jh;
        c.fillStyle = LAYER_INFO[key].color;
        c.fillRect(jx,yCursor-bandH,jw,bandH+1);
        yCursor -= bandH;
      });
      // ما تبقّى من فراغ أعلى المرطبان (هواء)
      if(yCursor>jy){ c.fillStyle=dark?'rgba(255,255,255,0.02)':'rgba(255,255,255,0.3)'; c.fillRect(jx,jy,jw,yCursor-jy); }
    }
    c.restore();
    // الغطاء
    if(S.closed && !clickable===false){
      c.fillStyle=g7eaMut(dark); c.fillRect(jx-2,jy-h*0.012,jw+4,h*0.014);
    }
    c.fillStyle=g7eaMut(dark); c.font=`${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
    c.fillText(label, jx+jw/2, jy+jh+h*0.035);
  }

  function hitLayer(p,w,h,jx,jy,jw,jh,soil,progress){
    if(p.x<jx||p.x>jx+jw||p.y<jy||p.y>jy+jh) return null;
    let yCursor = jy+jh;
    for(const key of LAYER_ORDER){
      const frac = soil.comp[key]*progress + (soil.comp[key]*0.12)*(1-progress);
      const bandH = frac*jh;
      if(p.y<=yCursor && p.y>=yCursor-bandH) return key;
      yCursor -= bandH;
    }
    return null;
  }

  function onDown(e){
    const p=g7eaGp(cv,e), w=cv.width, h=cv.height;
    if(S.stage==='choose'){
      const items = SOILS.map((s,i)=>({...s, x:w*0.2+i*w*0.3, y:h*0.85}));
      for(const it of items){ if(Math.hypot(p.x-it.x,p.y-it.y)<w*0.05){ S.dragId=it.id; S.dragX=p.x; S.dragY=p.y; return; } }
    } else if(S.stage==='settle' && S.dayIdx===3){
      const J = jarRect(w,h);
      const key = hitLayer(p,w,h,J.x,J.y,J.w,J.h,S.soil,1);
      if(key){ _g8pPlayClick(); S.selLayer=key; controls(renderControls()); }
    }
  }
  function onMove(e){
    if(!S.dragId) return;
    e.preventDefault && e.preventDefault();
    const p=g7eaGp(cv,e); S.dragX=p.x; S.dragY=p.y;
  }
  function onUp(){
    if(!S.dragId) return;
    const w=cv.width, h=cv.height, J=jarRect(w,h);
    if(S.dragX>=J.x-20 && S.dragX<=J.x+J.w+20 && S.dragY>=J.y-20 && S.dragY<=J.y+J.h+20){
      S.soil = SOILS.find(s=>s.id===S.dragId);
      S.stage='water'; _g8pPlayDrop();
    } else { _g8pPlayClick(); }
    S.dragId=null; controls(renderControls());
  }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;
  cv.onclick=null;

  function draw(){
    if(currentSim!=='g7earth2b' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7eaBg(dark); c.fillRect(0,0,w,h);
    const J = jarRect(w,h);
    let shakeOffset=0;
    if(S.shaking) shakeOffset = Math.sin(performance.now()*0.05)*w*0.01;

    if(S.stage==='choose'){
      c.save(); c.translate(shakeOffset,0);
      drawJar(c,w,h,dark,J.x,J.y,J.w,J.h,null,0,'المرطبان',false);
      c.restore();
      SOILS.forEach((s,i)=>{
        if(S.dragId===s.id) return;
        const x=w*0.2+i*w*0.3, y=h*0.85;
        g7eaEmoji(c,s.icon,x,y,Math.round(w*0.05));
        c.fillStyle=g7eaMut(dark); c.font=`${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
        c.fillText(s.label, x, y+h*0.045);
      });
      if(S.dragId){
        const s=SOILS.find(x=>x.id===S.dragId);
        c.globalAlpha=0.85; g7eaEmoji(c,s.icon,S.dragX,S.dragY,Math.round(w*0.055)); c.globalAlpha=1;
      }
    } else if(S.stage==='water'){
      c.save(); c.translate(shakeOffset,0);
      drawJar(c,w,h,dark,J.x,J.y,J.w,J.h,S.soil,S.watered?0.02:0,S.soil.label,false);
      c.restore();
    } else {
      const progress = DAYS[S.dayIdx].p;
      if(!S.compareOn){
        drawJar(c,w,h,dark,J.x,J.y,J.w,J.h,S.challenge?S.challengeSoil:S.soil,progress,S.challenge?'مرطبان مجهول ❓':S.soil.label,true);
      } else {
        const other = SOILS.find(s=>s.id!==S.soil.id && s.id==='humus') || SOILS.find(s=>s.id!==S.soil.id);
        const J1={x:w*0.28-w*0.09,y:J.y,w:w*0.18,h:J.h}, J2={x:w*0.72-w*0.09,y:J.y,w:w*0.18,h:J.h};
        drawJar(c,w,h,dark,J1.x,J1.y,J1.w,J1.h,S.soil,progress,S.soil.label,true);
        drawJar(c,w,h,dark,J2.x,J2.y,J2.w,J2.h,other,progress,other.label,true);
      }
    }
    g7eaTitle(c,w,h,dark,'٥-٢ (ب) · فحص مكوّنات التربة');
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   ٥-٢(ج) · سباق تصريف الماء — أيّ التربة تصرّف الماء أسرع؟
   ══════════════════════════════════════════════════════════ */
function simG7Earth2c(){
  cancelAnimationFrame(animFrame);
  const SOILS = [
    { id:'sandy', label:'تربة رملية',        icon:'🟡', target:90, speed:1.6, gap:'large' },
    { id:'humus', label:'تربة غنية بالدبال', icon:'🌱', target:60, speed:1.0, gap:'medium' },
    { id:'clay',  label:'تربة طينية',        icon:'🟤', target:25, speed:0.4, gap:'small' },
  ];
  simState = {
    stage:'predict', predicted:null, poured:false, running:false, t:0, done:false,
    showParticles:false, challenge:false, matches:{}, challengeChecked:false, qAnswered:false,
  };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const FIELDS = [
    { id:'f1', desc:'حقل تتجمّع عليه المياه بعد المطر', answer:'clay' },
    { id:'f2', desc:'حقل يتصرّف منه الماء بسرعة كبيرة', answer:'sandy' },
    { id:'f3', desc:'حقل تصريفه متوسّط', answer:'humus' },
  ];

  function currentVol(soil){
    if(!S.running && !S.done) return 0;
    if(S.done) return soil.target;
    return Math.min(soil.target, soil.target*(S.t/ (4/soil.speed)) );
  }

  function renderControls(){
    if(S.stage==='predict'){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">💧 سباق تصريف الماء</div></div>
        <div style="font-size:13px;color:var(--text-secondary);margin-bottom:10px">ثلاثة قمعات متطابقة تحتوي على: تربة رملية، تربة طينية، تربة غنية بالدبال.</div>
        <div style="font-size:14px;font-weight:700;margin-bottom:10px">❓ أيّ تربة تتوقّع أن تُصرّف الماء أسرع؟</div>
        <div class="ctrl-btns-grid-1">
          ${SOILS.map((s,i)=>`<button onclick="window._g7ea2cPredict(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:13.5px">${s.icon} ${s.label}</button>`).join('')}
        </div>`;
    }
    if(!S.poured){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🥛 التجربة</div></div>
        <button class="ctrl-btn play" onclick="window._g7ea2cPour()">💧 اسكب 100 mL في كلّ قمع</button>`;
    }
    if(!S.running && !S.done){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">✅ الماء جاهز في القمعات الثلاثة</div></div>
        <button class="ctrl-btn play" onclick="window._g7ea2cStart()">▶️ ابدأ التجربة</button>`;
    }
    let html = '';
    if(S.running && !S.done) html = `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">⏳ جارٍ التصريف...</div></div>`;
    if(S.done){
      html += `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">📊 النتائج بعد دقيقة</div></div>
        <table style="width:100%;border-collapse:collapse;font-size:12.5px;margin-bottom:10px">
          <tr style="background:var(--bg-card2)"><th style="padding:6px">نوع التربة</th><th style="padding:6px">الماء المتصرّف</th></tr>
          ${SOILS.map(s=>`<tr><td style="padding:6px;text-align:center">${s.icon} ${s.label}</td><td style="padding:6px;text-align:center">${s.target} mL</td></tr>`).join('')}
        </table>
        ${S.predicted!==null? `<div class="info-box" style="margin-bottom:10px">توقّعك: ${SOILS[S.predicted].label} — ${SOILS[S.predicted].id==='sandy'?'✅ توقّع صحيح!':'❌ الإجابة الصحيحة: التربة الرملية.'}</div>`:''}
        <button class="ctrl-btn" onclick="window._g7ea2cParticles()">${S.showParticles?'🔽 إخفاء':'👁️'} شاهد بين الجزيئات</button>`;
      if(S.showParticles){
        html += `<div class="info-box" style="margin-top:10px;font-size:12.5px;line-height:1.9">
          🟡 <b>رملية:</b> فراغات كبيرة بين الحبيبات، الماء يمرّ بسهولة.<br>
          🌱 <b>دبالية:</b> فراغات متوسّطة، تصريف متوسّط.<br>
          🟤 <b>طينية:</b> حبيبات متقاربة جدّاً، الماء يمرّ ببطء.
        </div>`;
      }
      if(!S.challenge){
        html += `<button class="ctrl-btn" style="margin-top:10px" onclick="window._g7ea2cChallenge()">🧑‍🔬 التحدّي النهائي: ثلاثة حقول</button>`;
      } else {
        html += `<div class="ctrl-section" style="margin-top:12px"><div class="ctrl-label" style="font-size:14px">🎯 حدّد نوع التربة في كلّ حقل</div></div>`;
        FIELDS.forEach(f=>{
          html += `<div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:4px">${f.desc}</div>
            <div class="ctrl-btns-grid" style="margin-bottom:10px">
              ${SOILS.map(s=>`<button class="ctrl-btn ${S.matches[f.id]===s.id?'active':''}" onclick="window._g7ea2cMatch('${f.id}','${s.id}')">${s.icon} ${s.label}</button>`).join('')}
            </div>`;
        });
        if(Object.keys(S.matches).length===FIELDS.length && !S.challengeChecked){
          html += `<button class="ctrl-btn play" onclick="window._g7ea2cCheck()">✅ تحقّق من إجاباتي</button>`;
        }
        if(S.challengeChecked){
          const correct = FIELDS.every(f=>S.matches[f.id]===f.answer);
          html += `<div class="info-box" style="margin-top:10px">${correct? '🎉 أحسنت! جميع الإجابات صحيحة.' : '💡 راجع إجاباتك: الحقل الذي تتجمّع فيه المياه غالباً تربة طينية، والذي يتصرّف بسرعة تربة رملية، والمتوسّط تربة دبالية.'}</div>
            <div class="ctrl-section" style="margin-top:12px"><div class="ctrl-label" style="font-size:15px">❓ لماذا تحتفظ التربة الطينية بالماء لفترة أطول من التربة الرملية؟</div></div>
            ${g7eaMCQ('g7ea2cq',['لأنّ حبيباتها كبيرة جدّاً','لأنّ حبيباتها دقيقة جدّاً والفراغات بينها صغيرة','لأنّها لا تحتوي على أيّ فراغات','لأنّها أخفّ وزناً من الرمل'])}
            <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7ea2cRestart()">↺ أعد النشاط</button>`;
        }
      }
    }
    return html;
  }
  controls(renderControls());

  window._g7ea2cPredict = function(i){ _g8pPlayClick(); S.predicted=i; S.stage='setup'; controls(renderControls()); };
  window._g7ea2cPour = function(){ _g8pPlayClick(); S.poured=true; controls(renderControls()); };
  window._g7ea2cStart = function(){
    _g8pPlayClick(); S.running=true; S.t=0; controls(renderControls());
    S._timer = setInterval(()=>{
      S.t += 0.15;
      if(S.t>=4){ S.running=false; S.done=true; clearInterval(S._timer); S._timer=null; controls(renderControls()); }
    },90);
  };
  window._g7ea2cParticles = function(){ _g8pPlayClick(); S.showParticles=!S.showParticles; controls(renderControls()); };
  window._g7ea2cChallenge = function(){ _g8pPlayClick(); S.challenge=true; controls(renderControls()); };
  window._g7ea2cMatch = function(fid,sid){ _g8pPlayClick(); S.matches[fid]=sid; controls(renderControls()); };
  window._g7ea2cCheck = function(){ _g8pPlayClick(); S.challengeChecked=true; controls(renderControls()); };
  window._g7ea2cqAns = function(i){
    if(S.qAnswered) return; S.qAnswered=true;
    g7eaAnswerMCQ('g7ea2cq', i, 1, 'كلّما كانت حبيبات التربة أدقّ، كانت الفراغات بينها أصغر، فيمرّ الماء ببطء شديد ويبقى محتجزاً لفترة أطول — وهذا ما يحدث في التربة الطينية.');
  };
  window._g7ea2cRestart = function(){
    if(S._timer){ clearInterval(S._timer); S._timer=null; }
    S.stage='predict'; S.predicted=null; S.poured=false; S.running=false; S.t=0; S.done=false;
    S.showParticles=false; S.challenge=false; S.matches={}; S.challengeChecked=false; S.qAnswered=false;
    controls(renderControls());
  };

  function drawFunnelSetup(c,w,h,dark,cx,soil,vol,label){
    const funY=h*0.32, funW=w*0.13, funH=h*0.14;
    c.strokeStyle=g7eaMut(dark); c.lineWidth=w*0.005;
    c.beginPath(); c.moveTo(cx-funW/2,funY); c.lineTo(cx+funW/2,funY); c.lineTo(cx+w*0.008,funY+funH); c.lineTo(cx-w*0.008,funY+funH); c.closePath(); c.stroke();
    if(S.poured){
      c.fillStyle='#8B5E34'; c.globalAlpha=0.5;
      c.beginPath(); c.moveTo(cx-funW*0.4,funY+funH*0.15); c.lineTo(cx+funW*0.4,funY+funH*0.15); c.lineTo(cx+w*0.006,funY+funH*0.75); c.lineTo(cx-w*0.006,funY+funH*0.75); c.closePath(); c.fill();
      c.globalAlpha=1;
    }
    // مخبار مدرّج
    const cylY=funY+funH+h*0.03, cylW=w*0.09, cylH=h*0.24;
    c.strokeStyle=g7eaMut(dark); c.lineWidth=w*0.005;
    c.beginPath(); c.moveTo(cx-cylW/2,cylY); c.lineTo(cx-cylW/2,cylY+cylH); c.lineTo(cx+cylW/2,cylY+cylH); c.lineTo(cx+cylW/2,cylY); c.stroke();
    const fillH = (vol/100)*cylH;
    c.fillStyle='#60A5FA'; c.globalAlpha=0.7;
    c.fillRect(cx-cylW/2+2,cylY+cylH-fillH,cylW-4,fillH);
    c.globalAlpha=1;
    c.fillStyle=g7eaTxt(dark); c.font=`bold ${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
    c.fillText(`${Math.round(vol)} mL`, cx, cylY+cylH+h*0.032);
    c.fillStyle=g7eaMut(dark); c.font=`${Math.round(h*0.014)}px Tajawal`;
    c.fillText(label, cx, funY-h*0.02);
  }

  function drawParticleView(c,w,h,dark){
    SOILS.forEach((s,i)=>{
      const cx=w*0.2+i*w*0.3, cy=h*0.5, size = s.gap==='large'?w*0.018:s.gap==='medium'?w*0.013:w*0.008;
      const cols=5, rows=5, spacing = s.gap==='large'?w*0.045:s.gap==='medium'?w*0.032:w*0.02;
      for(let r=0;r<rows;r++) for(let cIdx=0;cIdx<cols;cIdx++){
        const px=cx-spacing*cols/2+cIdx*spacing, py=cy-spacing*rows/2+r*spacing;
        c.fillStyle=g7eaAccent(dark); c.beginPath(); c.arc(px,py,size,0,Math.PI*2); c.fill();
      }
      c.fillStyle=g7eaMut(dark); c.font=`bold ${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
      c.fillText(s.icon+' '+s.label, cx, cy+spacing*rows/2+h*0.05);
    });
  }

  function draw(){
    if(currentSim!=='g7earth2c' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7eaBg(dark); c.fillRect(0,0,w,h);

    if(S.stage==='predict'){
      SOILS.forEach((s,i)=>{
        const cx=w*0.2+i*w*0.3;
        drawFunnelSetup(c,w,h,dark,cx,s,0,s.label);
      });
    } else if(S.done && S.showParticles){
      drawParticleView(c,w,h,dark);
    } else {
      SOILS.forEach((s,i)=>{
        const cx=w*0.2+i*w*0.3;
        drawFunnelSetup(c,w,h,dark,cx,s,currentVol(s),s.label);
      });
    }
    g7eaTitle(c,w,h,dark,'٥-٢ (ج) · سباق تصريف الماء');
    animFrame=requestAnimationFrame(draw);
  }
  cv.onclick=null; cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null; cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null;
  draw();
}

/* ══════════════════════════════════════════════════════════
   ٥-٤ · الصخور الرسوبية — مختبر مسامية الصخور
   ══════════════════════════════════════════════════════════ */
function simG7Earth4(){
  cancelAnimationFrame(animFrame);
  const ROCKS = [
    { id:'sand',  label:'الحجر الرملي', icon:'🪨', desc:'حبيبات رمل ملتحمة، فراغات صغيرة بينها.', absorbedTarget:20 },
    { id:'lime',  label:'الحجر الجيري', icon:'🪨', desc:'طبقات، وقد تظهر أحافير صغيرة.', absorbedTarget:10 },
    { id:'ig',    label:'الصخر الناري', icon:'🪨', desc:'بلورات متشابكة بإحكام، فراغات قليلة جدّاً.', absorbedTarget:2 },
  ];
  simState = {
    stage:'examine', examined:{}, weighed:false, soaking:false, soakDur:null, elapsed:0,
    showInside:false, reweighed:false, challenge:false, order:[], orderChecked:false, qAnswered:false,
  };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const DURS=[1,3,5];

  function absorbedNow(rock){
    if(!S.reweighed) return 0;
    const frac = S.soakDur? g7eaClamp(S.elapsed/S.soakDur,0,1) : 0;
    return Math.round(rock.absorbedTarget*frac);
  }

  function renderControls(){
    if(S.stage==='examine'){
      let html = `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🔍 افحص الصخور</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:10px">اضغط على كلّ صخرة في الصورة لفحصها بالعدسة.</div>`;
      ROCKS.forEach(r=>{
        if(S.examined[r.id]) html += `<div class="info-box" style="margin-bottom:8px"><b>${r.label}:</b> ${r.desc}</div>`;
      });
      if(Object.keys(S.examined).length===ROCKS.length){
        html += `<button class="ctrl-btn play" onclick="window._g7ea4Next()">➡️ التالي: قياس الكتلة</button>`;
      }
      return html;
    }
    if(S.stage==='weigh'){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">⚖️ قياس الكتلة قبل النقع</div></div>
        <div class="info-box" style="margin-bottom:10px">كتلة كل صخرة قبل النقع = 100 g</div>
        <button class="ctrl-btn play" onclick="window._g7ea4Weigh()">⚖️ زن الصخور الثلاث</button>`;
    }
    if(S.stage==='soak'){
      let html = `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">💧 نقع الصخور</div></div>`;
      if(!S.soaking && !S.reweighed){
        html += `<div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:8px">اختر مدّة النقع:</div>
          <div class="ctrl-btns-grid" style="margin-bottom:10px">
            ${DURS.map(d=>`<button class="ctrl-btn ${S.soakDur===d?'active':''}" onclick="window._g7ea4Dur(${d})">${d} دقيقة</button>`).join('')}
          </div>`;
        if(S.soakDur) html += `<button class="ctrl-btn play" onclick="window._g7ea4Start()">▶️ ابدأ</button>`;
      } else if(S.soaking){
        html += `<div class="info-box">⏳ جارٍ النقع... (${S.elapsed.toFixed(1)} / ${S.soakDur} دقيقة)</div>
          <button class="ctrl-btn" onclick="window._g7ea4Inside()">${S.showInside?'🔽 إخفاء':'👁️'} شاهد ما يحدث داخل الصخرة</button>`;
        if(S.showInside){
          html += `<div class="info-box" style="margin-top:10px;font-size:12.5px;line-height:1.9">
            🪨 <b>الحجر الرملي:</b> يدخل الماء إلى عدد كبير من الفراغات.<br>
            🪨 <b>الحجر الجيري:</b> يدخل الماء إلى بعض الفراغات.<br>
            🪨 <b>الصخر الناري:</b> يدخل الماء بكمّية قليلة جدّاً.
          </div>`;
        }
      } else if(!S.reweighed){
        html += `<button class="ctrl-btn play" onclick="window._g7ea4Reweigh()">⚖️ أعد وزن الصخور</button>`;
      } else {
        html += `<div class="ctrl-section"><div class="ctrl-label" style="font-size:14px">📊 النتائج</div></div>
          <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:10px">
            <tr style="background:var(--bg-card2)"><th style="padding:5px">الصخرة</th><th style="padding:5px">قبل</th><th style="padding:5px">بعد</th><th style="padding:5px">الممتص</th></tr>
            ${ROCKS.map(r=>`<tr><td style="padding:5px;text-align:center">${r.label}</td><td style="padding:5px;text-align:center">100 g</td><td style="padding:5px;text-align:center">${100+absorbedNow(r)} g</td><td style="padding:5px;text-align:center">${absorbedNow(r)} g</td></tr>`).join('')}
          </table>
          <div class="info-box" style="margin-bottom:10px;font-size:12.5px">الكتلة بعد النقع − الكتلة قبل النقع = كمّية الماء الممتصّة</div>`;
        if(S.soakDur<5){
          html += `<div class="info-box" style="margin-bottom:10px;color:#D97706">💡 جرّب مدّة نقع أطول (5 دقائق) لرؤية أقصى امتصاص.</div>
            <button class="ctrl-btn" onclick="window._g7ea4Redo()">↺ أعد النقع بمدّة أخرى</button>`;
        }
        if(!S.challenge){
          html += `<button class="ctrl-btn" style="margin-top:10px" onclick="window._g7ea4Challenge()">🌟 التحدّي النهائي</button>`;
        } else {
          html += renderChallenge();
        }
      }
      return html;
    }
    return '';
  }

  function renderChallenge(){
    const UNKNOWN = [{id:'A',g:20},{id:'B',g:9},{id:'C',g:2}];
    let html = `<div class="ctrl-section" style="margin-top:12px"><div class="ctrl-label" style="font-size:14px">🌟 رتّب الصخور المجهولة من الأكثر مسامية إلى الأقل</div></div>
      <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:8px">A = 20 g، B = 9 g، C = 2 g — اضغط بالترتيب:</div>
      <div class="ctrl-btns-grid" style="margin-bottom:8px">
        ${UNKNOWN.map(u=>`<button class="ctrl-btn ${S.order.includes(u.id)?'active':''}" onclick="window._g7ea4Order('${u.id}')">${u.id}</button>`).join('')}
      </div>
      <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:10px">ترتيبك: ${S.order.join(' → ')||'—'}</div>`;
    if(S.order.length===3 && !S.orderChecked){
      html += `<button class="ctrl-btn play" onclick="window._g7ea4CheckOrder()">✅ تحقّق</button>`;
    }
    if(S.orderChecked){
      const correct = S.order.join('')==='ABC';
      html += `<div class="info-box" style="margin-bottom:10px">${correct?'🎉 صحيح! A → B → C':'💡 الترتيب الصحيح هو A → B → C، لأنّ A امتصّت أكبر كمّية ماء فهي الأكثر مسامية.'}</div>
        <div class="ctrl-section" style="margin-top:10px"><div class="ctrl-label" style="font-size:15px">❓ نقع طالبان صخرتين متساويتين في الكتلة لمدّة 5 دقائق: الأولى ازدادت كتلتها 18 g، والثانية 3 g. أيّ الاستنتاجات صحيح؟</div></div>
        ${g7eaMCQ('g7ea4q',['الصخرة الثانية أكثر مسامية','الصخرة الأولى أكثر مسامية','الصخرتان لهما المسامية نفسها','لا يمكن معرفة ذلك'])}
        <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7ea4Restart()">↺ أعد النشاط</button>`;
    }
    return html;
  }

  controls(renderControls());
  window._g7ea4Examine = function(id){ _g8pPlayClick(); S.examined[id]=true; controls(renderControls()); };
  window._g7ea4Next = function(){ _g8pPlayClick(); S.stage='weigh'; controls(renderControls()); };
  window._g7ea4Weigh = function(){ _g8pPlayClick(); S.weighed=true; S.stage='soak'; controls(renderControls()); };
  window._g7ea4Dur = function(d){ _g8pPlayClick(); S.soakDur=d; controls(renderControls()); };
  window._g7ea4Start = function(){
    _g8pPlayClick(); S.soaking=true; S.elapsed=0; controls(renderControls());
    S._timer = setInterval(()=>{
      S.elapsed += 0.2;
      if(S.elapsed>=S.soakDur){ S.elapsed=S.soakDur; S.soaking=false; clearInterval(S._timer); S._timer=null; controls(renderControls()); }
      controls(renderControls());
    },150);
  };
  window._g7ea4Inside = function(){ _g8pPlayClick(); S.showInside=!S.showInside; controls(renderControls()); };
  window._g7ea4Reweigh = function(){ _g8pPlayClick(); S.reweighed=true; controls(renderControls()); };
  window._g7ea4Redo = function(){
    S.soaking=false; S.reweighed=false; S.showInside=false; S.elapsed=0; S.soakDur=null;
    controls(renderControls());
  };
  window._g7ea4Challenge = function(){ _g8pPlayClick(); S.challenge=true; controls(renderControls()); };
  window._g7ea4Order = function(id){
    _g8pPlayClick();
    if(S.order.includes(id)) S.order = S.order.filter(x=>x!==id);
    else if(S.order.length<3) S.order.push(id);
    controls(renderControls());
  };
  window._g7ea4CheckOrder = function(){ _g8pPlayClick(); S.orderChecked=true; controls(renderControls()); };
  window._g7ea4qAns = function(i){
    if(S.qAnswered) return; S.qAnswered=true;
    g7eaAnswerMCQ('g7ea4q', i, 1, 'ازدياد كتلة الصخرة يعني أنّها امتصّت ماءً أكثر، وهذا يدلّ على وجود فراغات أكثر داخلها، أي أنّها أكثر مسامية.');
  };
  window._g7ea4Restart = function(){
    if(S._timer){ clearInterval(S._timer); S._timer=null; }
    S.stage='examine'; S.examined={}; S.weighed=false; S.soaking=false; S.soakDur=null; S.elapsed=0;
    S.showInside=false; S.reweighed=false; S.challenge=false; S.order=[]; S.orderChecked=false; S.qAnswered=false;
    controls(renderControls());
  };

  cv.onclick = function(e){
    if(S.stage!=='examine') return;
    const p=g7eaGp(cv,e), w=cv.width, h=cv.height;
    ROCKS.forEach((r,i)=>{
      const x=w*0.22+i*w*0.28, y=h*0.45;
      if(Math.hypot(p.x-x,p.y-y)<w*0.06){ window._g7ea4Examine(r.id); }
    });
  };
  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null; cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null;

  function draw(){
    if(currentSim!=='g7earth4' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7eaBg(dark); c.fillRect(0,0,w,h);

    if(S.stage==='examine'){
      ROCKS.forEach((r,i)=>{
        const x=w*0.22+i*w*0.28, y=h*0.45;
        if(S.examined[r.id]){ c.fillStyle=g7eaAccent(dark); c.globalAlpha=0.15; c.beginPath(); c.arc(x,y,w*0.065,0,Math.PI*2); c.fill(); c.globalAlpha=1; }
        g7eaEmoji(c,r.icon,x,y,Math.round(w*0.06));
        c.fillStyle=g7eaMut(dark); c.font=`${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
        c.fillText(r.label, x, y+h*0.06);
      });
    } else if(S.stage==='weigh'){
      ROCKS.forEach((r,i)=>{
        const x=w*0.22+i*w*0.28, y=h*0.42;
        g7eaEmoji(c,r.icon,x,y,Math.round(w*0.05));
        if(S.weighed){
          c.strokeStyle=g7eaMut(dark); c.lineWidth=2;
          g7eaRRect(c,x-w*0.05,y+h*0.06,w*0.1,h*0.03,4); c.stroke();
          c.fillStyle=g7eaTxt(dark); c.font=`bold ${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
          c.fillText('100 g', x, y+h*0.08);
        }
        c.fillStyle=g7eaMut(dark); c.font=`${Math.round(h*0.014)}px Tajawal`;
        c.fillText(r.label, x, y-h*0.055);
      });
    } else if(S.stage==='soak'){
      ROCKS.forEach((r,i)=>{
        const x=w*0.22+i*w*0.28, y=h*0.42;
        const inWater = S.soaking || S.reweighed;
        if(inWater){
          c.fillStyle='rgba(96,165,250,0.35)';
          g7eaRRect(c,x-w*0.08,y-h*0.06,w*0.16,h*0.14,8); c.fill();
        }
        g7eaEmoji(c,r.icon,x,y,Math.round(w*0.05));
        if(S.showInside && S.soaking){
          const frac = r.id==='sand'?0.8:r.id==='lime'?0.4:0.1;
          const n=Math.round(frac*10);
          for(let k=0;k<n;k++){
            const ang=k*1.3+performance.now()*0.001;
            const px=x+Math.cos(ang)*w*0.025, py=y+Math.sin(ang)*w*0.025;
            c.fillStyle='#3B82F6'; c.beginPath(); c.arc(px,py,w*0.004,0,Math.PI*2); c.fill();
          }
        }
        c.fillStyle=g7eaMut(dark); c.font=`${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
        c.fillText(r.label, x, y+h*0.075);
      });
    }
    g7eaTitle(c,w,h,dark,'٥-٤ · مسامية الصخور الرسوبية');
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   ٥-٥ · الصخور المتحوّلة — مختبر فحص الصخور
   ══════════════════════════════════════════════════════════ */
function simG7Earth5(){
  cancelAnimationFrame(animFrame);
  const ROCKS = [
    { id:'sand',  label:'حجر رملي', icon:'🪨', type:'رسوبية',
      appearance:'حبيبات رمل واضحة، فراغات صغيرة بينها.', roughness:'خشنة 🔴', hardness:'أقلّ صلابة (تُخدش)', porosity:'تمتصّ القطرة بسرعة — مسامية مرتفعة' },
    { id:'lime',  label:'حجر جيري', icon:'🪨', type:'رسوبية',
      appearance:'طبقات، وقد تظهر أحافير صغيرة.', roughness:'متوسّطة 🟡', hardness:'أقلّ صلابة (تُخدش)', porosity:'تمتصّ القطرة نسبياً — مسامية متوسّطة' },
    { id:'marble',label:'رخام', icon:'🪨', type:'متحوّلة',
      appearance:'بلورات متشابكة، سطح أكثر نعومة.', roughness:'ناعمة 🟢', hardness:'أكثر صلابة (لا تُخدش)', porosity:'تبقى القطرة على السطح — مسامية منخفضة جدّاً' },
    { id:'quartzite',label:'كوارتزيت', icon:'🪨', type:'متحوّلة',
      appearance:'حبيبات مندمجة بشدّة، يصعب تمييزها منفصلة.', roughness:'متوسّطة 🟡', hardness:'أكثر صلابة (لا تُخدش)', porosity:'مسامية منخفضة جدّاً' },
    { id:'granite',label:'جرانيت', icon:'🪨', type:'نارية',
      appearance:'بلورات متشابكة بإحكام وألوان متعدّدة.', roughness:'خشنة 🔴', hardness:'أكثر صلابة (لا تُخدش)', porosity:'مسامية منخفضة جدّاً' },
  ];
  simState = {
    stage:'choose', rock:null, tests:{}, compareStage:false, compareAnswered:false,
    challenge:false, challengeRock:null, challengeTests:{}, challengeAnswered:false, qAnswered:false,
  };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const TESTS = [
    { id:'appearance', label:'🔍 المظهر والحبيبات', btn:'افحص بالعدسة' },
    { id:'roughness',  label:'✋ الخشونة',            btn:'مرّر إصبعك' },
    { id:'hardness',   label:'🔩 الصلابة',            btn:'اخدش بالمسمار' },
    { id:'porosity',   label:'💧 المسامية',           btn:'ضع قطرة ماء' },
  ];

  function renderControls(){
    if(S.stage==='choose'){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🪨 مختبر فحص الصخور</div></div>
        <div style="font-size:13px;color:var(--text-secondary);margin-bottom:10px">اختر صخرة من الطاولة لفحصها.</div>
        <div class="ctrl-btns-grid-1">
          ${ROCKS.map((r,i)=>`<button onclick="window._g7ea5Choose(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:13.5px">${r.icon} ${r.label}</button>`).join('')}
        </div>`;
    }
    if(S.stage==='test'){
      let html = `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🔬 فحص: ${S.rock.icon} ${S.rock.label}</div></div>`;
      TESTS.forEach(t=>{
        if(S.tests[t.id]){
          html += `<div class="info-box" style="margin-bottom:8px"><b>${t.label}:</b> ${S.rock[t.id]}</div>`;
        } else {
          html += `<button class="ctrl-btn" style="margin-bottom:8px" onclick="window._g7ea5Test('${t.id}')">${t.label} — ${t.btn}</button>`;
        }
      });
      if(Object.keys(S.tests).length===TESTS.length){
        html += `<div class="ctrl-section" style="margin-top:10px"><div class="ctrl-label" style="font-size:14px">📝 سجلّ الملاحظات اكتمل ✔️</div></div>
          <button class="ctrl-btn play" onclick="window._g7ea5Compare()">🔥 هل الحجر الجيري صخرة متحوّلة؟</button>
          <button class="ctrl-btn" style="margin-top:8px" onclick="window._g7ea5Restart2()">🔄 اختر صخرة أخرى</button>
          <button class="ctrl-btn" style="margin-top:8px" onclick="window._g7ea5StartChallenge()">🎮 التحدّي النهائي: كن جيولوجياً</button>`;
      }
      return html;
    }
    if(S.stage==='compare'){
      let html = `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🔥 الحجر الجيري ↔ الرخام</div></div>
        <div class="info-box" style="margin-bottom:8px"><b>الحجر الجيري:</b> حبيبات منفصلة نسبياً، مسامية أكبر.</div>
        <div class="info-box" style="margin-bottom:10px"><b>الرخام:</b> بلورات متشابكة، أكثر صلابة، أقلّ مسامية.</div>
        <div style="font-size:14px;font-weight:700;margin-bottom:8px">❓ أيّهما تعرّض للحرارة والضغط؟</div>
        <div class="ctrl-btns-grid-1">
          <button onclick="window._g7ea5CompareAns(false)" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:13.5px">الحجر الجيري</button>
          <button onclick="window._g7ea5CompareAns(true)" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:13.5px">الرخام</button>
        </div>`;
      if(S.compareAnswered){
        html += `<div class="info-box" style="margin-top:10px">✅ الرخام هو الذي تعرّض للحرارة والضغط، فتحوّل من الحجر الجيري إليه.</div>
          <button class="ctrl-btn" style="margin-top:8px" onclick="window._g7ea5StartChallenge()">🎮 التحدّي النهائي: كن جيولوجياً</button>`;
      }
      return html;
    }
    // challenge
    let html = `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🎮 التحدّي النهائي: كن جيولوجياً</div></div>
      <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:10px">صخرة مجهولة — نفّذ الاختبارات الأربعة بنفسك.</div>`;
    TESTS.forEach(t=>{
      if(S.challengeTests[t.id]){
        html += `<div class="info-box" style="margin-bottom:8px"><b>${t.label}:</b> ${S.challengeRock[t.id]}</div>`;
      } else {
        html += `<button class="ctrl-btn" style="margin-bottom:8px" onclick="window._g7ea5CTest('${t.id}')">${t.label} — ${t.btn}</button>`;
      }
    });
    if(Object.keys(S.challengeTests).length===TESTS.length && !S.challengeAnswered){
      html += `<div class="ctrl-section" style="margin-top:10px"><div class="ctrl-label" style="font-size:14px">🧭 بناءً على الأدلّة، ما نوع هذه الصخرة؟</div></div>
        ${g7eaMCQ('g7ea5c',['رسوبية','نارية','متحوّلة'])}`;
    }
    if(S.challengeAnswered){
      html += `<div class="ctrl-section" style="margin-top:12px"><div class="ctrl-label" style="font-size:15px">❓ فحصت صخرتين: الأولى امتصّت الماء بسهولة وفيها فراغات كثيرة، والثانية لم تمتصّ الماء تقريباً وحبيباتها متماسكة جدّاً. أيّهما يُحتمل أن تكون صخراً متحوّلاً؟</div></div>
        ${g7eaMCQ('g7ea5q',['الصخرة الأولى','الصخرة الثانية','كلتاهما','لا يمكن التحديد'])}
        <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7ea5Restart()">↺ أعد النشاط</button>`;
    }
    return html;
  }
  controls(renderControls());

  window._g7ea5Choose = function(i){ _g8pPlayClick(); S.rock=ROCKS[i]; S.tests={}; S.stage='test'; controls(renderControls()); };
  window._g7ea5Test = function(id){ _g8pPlayClick(); S.tests[id]=true; controls(renderControls()); };
  window._g7ea5Compare = function(){ _g8pPlayClick(); S.stage='compare'; controls(renderControls()); };
  window._g7ea5CompareAns = function(v){
    _g8pPlayClick(); S.compareAnswered=true; controls(renderControls());
  };
  window._g7ea5Restart2 = function(){ S.stage='choose'; S.rock=null; S.tests={}; controls(renderControls()); };
  window._g7ea5StartChallenge = function(){
    _g8pPlayClick(); S.stage='challenge'; S.challenge=true;
    S.challengeRock = ROCKS[Math.floor(Math.random()*ROCKS.length)];
    S.challengeTests={}; S.challengeAnswered=false;
    controls(renderControls());
  };
  window._g7ea5CTest = function(id){ _g8pPlayClick(); S.challengeTests[id]=true; controls(renderControls()); };
  window._g7ea5cAns = function(i){
    const types=['رسوبية','نارية','متحوّلة'];
    const correctIdx = types.indexOf(S.challengeRock.type);
    g7eaAnswerMCQ('g7ea5c', i, correctIdx, `هذه الصخرة كانت ${S.challengeRock.icon} ${S.challengeRock.label} وهي صخرة ${S.challengeRock.type}.`);
    S.challengeAnswered=true; controls(renderControls());
  };
  window._g7ea5qAns = function(i){
    if(S.qAnswered) return; S.qAnswered=true;
    g7eaAnswerMCQ('g7ea5q', i, 1, 'تؤدّي الحرارة والضغط إلى تماسك الحبيبات وإغلاق كثير من الفراغات، لذلك تكون الصخور المتحوّلة عادةً أكثر صلابة وأقلّ مسامية من الصخور التي تكوّنت منها.');
  };
  window._g7ea5Restart = function(){
    S.stage='choose'; S.rock=null; S.tests={}; S.compareStage=false; S.compareAnswered=false;
    S.challenge=false; S.challengeRock=null; S.challengeTests={}; S.challengeAnswered=false; S.qAnswered=false;
    controls(renderControls());
  };

  function draw(){
    if(currentSim!=='g7earth5' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7eaBg(dark); c.fillRect(0,0,w,h);

    if(S.stage==='choose'){
      ROCKS.forEach((r,i)=>{
        const cols=3, x=w*0.22+(i%cols)*w*0.28, y=h*0.35+Math.floor(i/cols)*h*0.32;
        g7eaEmoji(c,r.icon,x,y,Math.round(w*0.05));
        c.fillStyle=g7eaMut(dark); c.font=`${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
        c.fillText(r.label, x, y+h*0.06);
      });
    } else if(S.stage==='test'){
      g7eaEmoji(c,S.rock.icon,w*0.5,h*0.42,Math.round(w*0.11));
      c.fillStyle=g7eaTxt(dark); c.font=`bold ${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
      c.fillText(S.rock.label, w*0.5, h*0.6);
      const done = Object.keys(S.tests).length;
      c.fillStyle=g7eaMut(dark); c.font=`${Math.round(h*0.015)}px Tajawal`;
      c.fillText(`الاختبارات المكتملة: ${done} / ${TESTS.length}`, w*0.5, h*0.66);
    } else if(S.stage==='compare'){
      g7eaEmoji(c,'🪨',w*0.32,h*0.42,Math.round(w*0.09));
      g7eaEmoji(c,'🪨',w*0.68,h*0.42,Math.round(w*0.09));
      c.fillStyle=g7eaMut(dark); c.font=`${Math.round(h*0.017)}px Tajawal`; c.textAlign='center';
      c.fillText('حجر جيري', w*0.32, h*0.55);
      c.fillText('رخام', w*0.68, h*0.55);
      c.strokeStyle=g7eaAccent(dark); c.lineWidth=2; c.setLineDash([6,6]);
      c.beginPath(); c.moveTo(w*0.42,h*0.42); c.lineTo(w*0.58,h*0.42); c.stroke(); c.setLineDash([]);
      g7eaEmoji(c,'🔥',w*0.5,h*0.36,Math.round(w*0.035));
    } else {
      g7eaEmoji(c,'❓',w*0.5,h*0.4,Math.round(w*0.1));
      c.fillStyle=g7eaTxt(dark); c.font=`bold ${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
      c.fillText('صخرة مجهولة', w*0.5, h*0.58);
      const done = Object.keys(S.challengeTests).length;
      c.fillStyle=g7eaMut(dark); c.font=`${Math.round(h*0.015)}px Tajawal`;
      c.fillText(`الاختبارات المكتملة: ${done} / ${TESTS.length}`, w*0.5, h*0.64);
    }
    g7eaTitle(c,w,h,dark,'٥-٥ · خصائص الصخور');
    animFrame=requestAnimationFrame(draw);
  }
  cv.onclick=null; cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null; cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null;
  draw();
}
