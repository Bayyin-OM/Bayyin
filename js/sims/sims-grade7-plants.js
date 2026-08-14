// ══════════════════════════════════════════════════════════
// الصف السابع — الوحدة الأولى: النبات والإنسان ككائنات حيّة
// نشاط ١-١ · أعضاء النبات (كتاب الصف السابع ص١٤-١٥)
// ══════════════════════════════════════════════════════════

function g7pBg(dark){ return dark ? '#0B1A10' : '#F0FAF3'; }
function g7pTxt(dark){ return dark ? '#C8EDD4' : '#1A3A25'; }
function g7pMut(dark){ return dark ? '#6BA87A' : '#4A7A5A'; }
function g7pAccent(dark){ return dark ? '#4ADE80' : '#16A34A'; }
function g7pGp(cv, e){
  const r = cv.getBoundingClientRect(), sc = cv.width/r.width;
  const s = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
  return { x:(s.clientX-r.left)*sc, y:(s.clientY-r.top)*sc };
}

/* ── تاب ١: ابنِ النبات (Drag & Drop) ── */
function simG7Bio1N1a(){
  cancelAnimationFrame(animFrame);
  const ORGANS = [
    { id:'roots',  label:'الجذور', func:'تثبّت النبات في التربة وتمتصّ منها الماء والأملاح المعدنية.', fact:'تتفرّع الجذور كثيراً في التربة لزيادة مساحة امتصاص الماء.', zone:{x:0.5, y:0.80}, home:{x:0.15,y:0.85} },
    { id:'stem',   label:'الساق',   func:'تحمل الأوراق والأزهار فوق التربة.', fact:'تنقل الساق الماء من الجذور إلى بقيّة أجزاء النبات.', zone:{x:0.5, y:0.55}, home:{x:0.85,y:0.85} },
    { id:'leaves', label:'الأوراق', func:'مصانع غذاء النبات؛ تمتصّ ضوء الشمس وتستخدمه في صنع الغذاء.', fact:'اللون الأخضر في الأوراق سببه صبغة اليخضور (الكلوروفيل).', zone:{x:0.32, y:0.42}, home:{x:0.15,y:0.65} },
    { id:'flower', label:'الزهرة',  func:'عضو التكاثر في النبات؛ تنتج البذور التي يمكن أن تنمو إلى نبات جديد.', fact:'الأزهار هي أعضاء التكاثر في النباتات الزهرية.', zone:{x:0.5, y:0.22}, home:{x:0.85,y:0.65} },
  ];
  simState = { placed:{}, dragId:null, dragX:0, dragY:0, ox:0, oy:0, hint:'', hintT:0, done:false, infoOrgan:null, qAnswered:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    const placedCount = Object.keys(S.placed).length;
    if(!S.done){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🌱 استقصاء: ابنِ النبات</div></div>
        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:10px">اسحبي كل جزء إلى مكانه الصحيح في النبات (${placedCount} من ٤)</div>
        <div style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;border:1px solid rgba(39,174,96,0.2);margin-bottom:12px">
          اسحبي أجزاء النبات المبعثرة حول الصورة، وأفلتيها في مكانها الصحيح.
        </div>
        ${S.hintT>0 ? `<div style="font-size:13px;color:#D97706;background:#FEF3C7;border-radius:8px;padding:10px;margin-bottom:10px">💡 ${S.hint}</div>` : ''}`;
    }
    if(!S.qAnswered){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🎉 أحسنتِ! اكتمل النبات 🌱</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:10px">اضغطي على أيّ جزء من النبات في الصورة لتتعرّفي عليه أكثر.</div>
        <div id="g7pOrganInfo" style="font-size:12.5px;color:var(--text-secondary);line-height:1.8;min-height:20px;margin-bottom:12px;background:var(--bg-card2);border-radius:8px;padding:${S.infoOrgan?'10px':'0px'}">
          ${S.infoOrgan ? ('<strong>'+ORGANS.find(o=>o.id===S.infoOrgan).label+':</strong> '+ORGANS.find(o=>o.id===S.infoOrgan).func) : ''}
        </div>
        <div style="font-size:14px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:10px">🌿 سؤال الدرس: ما المادة التي تجعل أوراق النبات تبدو باللون الأخضر؟</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${['اليخضور (الكلوروفيل)','الماء','التربة'].map((o,i)=>`<button id="g7pQOpt${i}" onclick="window._g7pAnswer(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">${o}</button>`).join('')}
        </div>
        <div id="g7pQFb" style="margin-top:10px;font-size:13px;color:var(--text-secondary);line-height:1.8"></div>`;
    }
    return `
      <div class="ctrl-section"><div class="ctrl-label">🎉 أحسنتِ! 🌱</div></div>
      <div style="padding:14px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(39,174,96,0.3);font-size:13px;color:var(--text-secondary);line-height:1.9">
        تمتصّ الأوراق صبغة اليخضور (الكلوروفيل) ضوء الشمس، وهي سبب اللون الأخضر في معظم أجزاء النبات، وتساعد النبات على صنع غذائه.
      </div>
      <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7pRestart()">↺ أعد النشاط</button>`;
  }
  controls(renderControls());

  window._g7pAnswer = function(i){
    if(S.qAnswered) return; S.qAnswered = true;
    const ok = i===0;
    _g8pPlayClick();
    const btn = document.getElementById('g7pQOpt'+i);
    if(btn){ btn.style.background = ok?'#27AE60':'#E74C3C'; btn.style.color='white'; btn.style.borderColor= ok?'#27AE60':'#E74C3C'; }
    if(!ok){
      const okBtn = document.getElementById('g7pQOpt0');
      if(okBtn){ okBtn.style.background='#27AE60'; okBtn.style.color='white'; okBtn.style.borderColor='#27AE60'; }
    }
    const fb = document.getElementById('g7pQFb');
    if(fb) fb.innerHTML = 'أحسنتِ! 🌱 اليخضور صبغة خضراء تمتصّ طاقة ضوء الشمس، وتستخدمها الأوراق في صنع الغذاء.';
    setTimeout(()=>controls(renderControls()), 400);
  };
  window._g7pRestart = function(){
    S.placed = {}; S.dragId=null; S.hint=''; S.hintT=0; S.done=false; S.infoOrgan=null; S.qAnswered=false;
    controls(renderControls());
  };

  const HINTS = {
    roots:  'فكّري: أيّ جزء يمتصّ الماء ويثبّت النبات تحت التربة؟',
    stem:   'فكّري: أيّ جزء يحمل الأوراق والأزهار فوق التربة؟',
    leaves: 'فكّري: أيّ جزء يمتصّ ضوء الشمس ويصنع الغذاء؟',
    flower: 'فكّري: أيّ جزء ينتج البذور؟',
  };

  function hitOrgan(p, w, h){
    for(const o of ORGANS){
      if(S.placed[o.id]) continue;
      const hx = o.home.x*w, hy = o.home.y*h;
      if(Math.hypot(p.x-hx, p.y-hy) < w*0.075) return o;
    }
    return null;
  }

  function onDown(e){
    if(S.done) return;
    const p = g7pGp(cv, e);
    const o = hitOrgan(p, cv.width, cv.height);
    if(o){ S.dragId = o.id; S.dragX = p.x; S.dragY = p.y; }
  }
  function onMove(e){
    if(!S.dragId) return;
    e.preventDefault && e.preventDefault();
    const p = g7pGp(cv, e);
    S.dragX = p.x; S.dragY = p.y;
  }
  function onUp(){
    if(!S.dragId) return;
    const o = ORGANS.find(x=>x.id===S.dragId);
    const w = cv.width, h = cv.height;
    const zx = o.zone.x*w, zy = o.zone.y*h;
    if(Math.hypot(S.dragX-zx, S.dragY-zy) < w*0.11){
      S.placed[o.id] = true;
      _g8pPlayDrop();
      if(Object.keys(S.placed).length===ORGANS.length){ S.done = true; }
    } else {
      _g8pPlayClick();
      S.hint = HINTS[o.id];
      S.hintT = 120;
    }
    S.dragId = null;
    controls(renderControls());
  }
  cv.onmousedown = onDown; cv.onmousemove = onMove; cv.onmouseup = onUp;
  cv.ontouchstart = onDown; cv.ontouchmove = onMove; cv.ontouchend = onUp;
  cv.onclick = function(e){
    if(!S.done) return;
    const p = g7pGp(cv, e), w=cv.width, h=cv.height;
    for(const o of ORGANS){
      const zx=o.zone.x*w, zy=o.zone.y*h;
      if(Math.hypot(p.x-zx,p.y-zy) < w*0.11){ S.infoOrgan = o.id; _g8pPlayClick(); controls(renderControls()); return; }
    }
  };

  function drawPlantOutline(c, w, h, alpha){
    c.save(); c.globalAlpha = alpha;
    c.strokeStyle = g7pMut(true); c.setLineDash([5,5]); c.lineWidth=2;
    // خط التربة
    c.beginPath(); c.moveTo(w*0.15, h*0.68); c.lineTo(w*0.85, h*0.68); c.stroke();
    c.setLineDash([]);
    c.restore();
  }

  function drawOrgan(c, o, x, y, w, h, scale){
    c.save(); c.translate(x,y); c.scale(scale, scale);
    if(o.id==='roots'){
      c.strokeStyle='#A9895A'; c.lineWidth=Math.max(2,w*0.005); c.lineCap='round';
      for(let i=-2;i<=2;i++){
        c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(i*w*0.03, h*0.05, i*w*0.05, h*0.11); c.stroke();
      }
    } else if(o.id==='stem'){
      c.strokeStyle='#5F9E52'; c.lineWidth=Math.max(4,w*0.012); c.lineCap='round';
      c.beginPath(); c.moveTo(0,h*0.13); c.lineTo(0,-h*0.13); c.stroke();
    } else if(o.id==='leaves'){
      c.fillStyle='#4ADE80'; c.strokeStyle='#166534'; c.lineWidth=1.5;
      for(const side of [-1,1]){
        c.save(); c.rotate(side*0.5);
        c.beginPath(); c.moveTo(0,0);
        c.quadraticCurveTo(side*w*0.06,-h*0.03,side*w*0.11,0);
        c.quadraticCurveTo(side*w*0.06,h*0.02,0,0);
        c.closePath(); c.fill(); c.stroke();
        c.restore();
      }
    } else { // flower
      c.fillStyle='#F472B6'; c.strokeStyle='#9D174D'; c.lineWidth=1.2;
      for(let i=0;i<6;i++){
        const ang = i/6*Math.PI*2;
        c.save(); c.rotate(ang);
        c.beginPath(); c.ellipse(0,-w*0.045,w*0.024,w*0.045,0,0,Math.PI*2); c.fill(); c.stroke();
        c.restore();
      }
      c.fillStyle='#FDE047'; c.beginPath(); c.arc(0,0,w*0.02,0,Math.PI*2); c.fill();
    }
    c.restore();
  }

  function draw(){
    if(currentSim!=='g7bio1n1' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    c.fillStyle = g7pBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle = g7pTxt(dark);
    c.font = `bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ١-١ · ابنِ النبات', w/2, h*0.05);

    if(S.hintT>0) S.hintT--;

    // خط التربة + منطقة تحت الأرض
    c.save();
    c.fillStyle = dark ? 'rgba(139,105,60,0.15)' : 'rgba(139,105,60,0.12)';
    c.fillRect(0, h*0.68, w, h*0.2);
    c.strokeStyle = g7pMut(dark); c.lineWidth=2;
    c.beginPath(); c.moveTo(w*0.1,h*0.68); c.lineTo(w*0.9,h*0.68); c.stroke();
    c.fillStyle = g7pMut(dark); c.font=`${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
    c.fillText('سطح التربة', w*0.5, h*0.665);
    c.restore();

    // الأعضاء الموضوعة في مكانها
    ORGANS.forEach(o=>{
      if(S.placed[o.id]){
        drawOrgan(c, o, o.zone.x*w, o.zone.y*h, w, h, 1);
        if(S.infoOrgan===o.id){
          c.save(); c.globalAlpha=0.25; c.fillStyle=g7pAccent(dark);
          c.beginPath(); c.arc(o.zone.x*w, o.zone.y*h, w*0.09, 0, Math.PI*2); c.fill(); c.restore();
        }
      }
    });

    // الأعضاء غير الموضوعة (في مواقعها الأصلية المبعثرة) + بطاقات بأسمائها
    ORGANS.forEach(o=>{
      if(S.placed[o.id]) return;
      if(S.dragId===o.id) return;
      const hx=o.home.x*w, hy=o.home.y*h;
      c.save();
      c.fillStyle = dark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)';
      c.beginPath(); c.arc(hx,hy,w*0.06,0,Math.PI*2); c.fill();
      c.restore();
      drawOrgan(c, o, hx, hy, w, h, 0.8);
      c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.017)}px Tajawal`; c.textAlign='center';
      c.fillText(o.label, hx, hy+h*0.1);
    });

    // العنصر المسحوب حالياً (يُرسم فوق كل شيء، متتبّعاً إصبع/مؤشر الطالبة)
    if(S.dragId){
      const o = ORGANS.find(x=>x.id===S.dragId);
      drawOrgan(c, o, S.dragX, S.dragY, w, h, 0.95);
    }

    if(!S.done){
      c.fillStyle = g7pMut(dark); c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
      c.fillText(`اكتمل ${Object.keys(S.placed).length} من ٤ 🌱`, w/2, h*0.95);
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ── تاب ٢: صِل العضو بوظيفته (Drag & Drop) ── */
function simG7Bio1N1b(){
  cancelAnimationFrame(animFrame);
  const PAIRS = [
    { id:'roots',  label:'الجذور', func:'تثبّت النبات في التربة وتمتصّ الماء والأملاح المعدنية' },
    { id:'stem',   label:'الساق',   func:'تحمل الأوراق والأزهار فوق التربة' },
    { id:'leaves', label:'الأوراق', func:'تمتصّ ضوء الشمس وتصنع غذاء النبات' },
    { id:'flower', label:'الزهرة',  func:'تنتج البذور التي تنمو إلى نبات جديد' },
  ];
  const HINTS = {
    roots:  'فكّري: أيّ جزء يوجد تحت سطح التربة؟',
    stem:   'فكّري: أيّ جزء يصل بين الجذور والأوراق والأزهار؟',
    leaves: 'فكّري: أيّ جزء لونه أخضر ومعرّض للشمس؟',
    flower: 'فكّري: أيّ جزء يظهر فيه البتلات الملوّنة؟',
  };
  // ترتيب عشوائي لبطاقات الوظائف (بعيداً عن ترتيب الأعضاء) — يُحسب مرّة واحدة
  const FUNCS_ORDER = [2,0,3,1].map(i=>PAIRS[i]);

  simState = { matched:{}, dragId:null, dragX:0, dragY:0, hint:'', hintT:0, done:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    const n = Object.keys(S.matched).length;
    if(!S.done){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🌱 استقصاء: صِل العضو بوظيفته</div></div>
        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:10px">اسحبي كل عضو (يمين) إلى بطاقة وظيفته الصحيحة (يسار) — (${n} من ٤)</div>
        ${S.hintT>0 ? `<div style="font-size:13px;color:#D97706;background:#FEF3C7;border-radius:8px;padding:10px;margin-bottom:10px">💡 ${S.hint}</div>` : ''}`;
    }
    return `
      <div class="ctrl-section"><div class="ctrl-label">🎉 أحسنتِ! 🌱</div></div>
      <div style="padding:14px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(39,174,96,0.3);font-size:13px;color:var(--text-secondary);line-height:1.9">
        وصلتِ كلّ عضو بوظيفته الصحيحة — كلّ عضو في النبات له دور محدّد يساعد النبات على الحياة والتكاثر.
      </div>
      <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7pMatchRestart()">↺ أعد النشاط</button>`;
  }
  controls(renderControls());

  window._g7pMatchRestart = function(){
    S.matched = {}; S.dragId=null; S.hint=''; S.hintT=0; S.done=false;
    controls(renderControls());
  };

  function organPos(i,w,h){ return { x:w*0.82, y:h*(0.22+i*0.19) }; }
  function funcPos(i,w,h){ return { x:w*0.30, y:h*(0.22+i*0.19) }; }

  function hitOrgan(p,w,h){
    for(let i=0;i<PAIRS.length;i++){
      if(S.matched[PAIRS[i].id]) continue;
      const pos = organPos(i,w,h);
      if(Math.abs(p.x-pos.x)<w*0.09 && Math.abs(p.y-pos.y)<h*0.06) return PAIRS[i];
    }
    return null;
  }
  function hitFuncZone(p,w,h){
    for(let i=0;i<FUNCS_ORDER.length;i++){
      const f = FUNCS_ORDER[i];
      if(S.matched[f.id]) continue;
      const pos = funcPos(i,w,h);
      if(Math.abs(p.x-pos.x)<w*0.19 && Math.abs(p.y-pos.y)<h*0.07) return f;
    }
    return null;
  }

  function onDown(e){
    if(S.done) return;
    const p = g7pGp(cv,e);
    const o = hitOrgan(p, cv.width, cv.height);
    if(o){ S.dragId=o.id; S.dragX=p.x; S.dragY=p.y; }
  }
  function onMove(e){
    if(!S.dragId) return;
    e.preventDefault && e.preventDefault();
    const p = g7pGp(cv,e); S.dragX=p.x; S.dragY=p.y;
  }
  function onUp(){
    if(!S.dragId) return;
    const w=cv.width,h=cv.height;
    const targetFunc = hitFuncZone({x:S.dragX,y:S.dragY}, w, h);
    if(targetFunc && targetFunc.id===S.dragId){
      S.matched[S.dragId] = true;
      _g8pPlayDrop();
      if(Object.keys(S.matched).length===PAIRS.length) S.done = true;
    } else {
      _g8pPlayClick();
      S.hint = HINTS[S.dragId];
      S.hintT = 120;
    }
    S.dragId = null;
    controls(renderControls());
  }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;
  cv.onclick = null;

  function draw(){
    if(currentSim!=='g7bio1n1' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle = g7pBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle = g7pTxt(dark);
    c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ١-١ · صِل العضو بوظيفته', w/2, h*0.06);

    if(S.hintT>0) S.hintT--;

    // بطاقات الوظائف (يسار)
    FUNCS_ORDER.forEach((f,i)=>{
      const pos = funcPos(i,w,h);
      const isMatched = !!S.matched[f.id];
      c.save();
      c.fillStyle = isMatched ? (dark?'rgba(74,222,128,0.18)':'rgba(39,174,96,0.12)') : (dark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)');
      c.strokeStyle = isMatched ? g7pAccent(dark) : g7pMut(dark);
      c.lineWidth = isMatched? 2.5:1.5;
      c.beginPath(); c.roundRect(pos.x-w*0.185, pos.y-h*0.06, w*0.37, h*0.12, 10); c.fill(); c.stroke();
      c.fillStyle = g7pTxt(dark); c.font=`${Math.round(h*0.0155)}px Tajawal`; c.textAlign='center';
      wrapText(c, f.func, pos.x, pos.y-h*0.005, w*0.33, h*0.02);
      if(isMatched){ c.font=`bold ${Math.round(h*0.017)}px Tajawal`; c.fillStyle=g7pAccent(dark); c.fillText('✓ '+f.label, pos.x, pos.y+h*0.045); }
      c.restore();
    });

    // خطوط الربط للمُطابَق منها
    PAIRS.forEach((o,i)=>{
      if(!S.matched[o.id]) return;
      const oi = i, fi = FUNCS_ORDER.findIndex(f=>f.id===o.id);
      const op = organPos(oi,w,h), fp = funcPos(fi,w,h);
      c.save(); c.strokeStyle=g7pAccent(dark); c.globalAlpha=0.4; c.lineWidth=2; c.setLineDash([4,4]);
      c.beginPath(); c.moveTo(op.x-w*0.09,op.y); c.lineTo(fp.x+w*0.185,fp.y); c.stroke();
      c.restore();
    });

    // بطاقات الأعضاء (يمين)
    PAIRS.forEach((o,i)=>{
      if(S.matched[o.id]) return;
      if(S.dragId===o.id) return;
      const pos = organPos(i,w,h);
      c.save();
      c.fillStyle = dark?'rgba(255,255,255,0.07)':'rgba(255,255,255,0.7)';
      c.strokeStyle = g7pMut(dark); c.lineWidth=1.5;
      c.beginPath(); c.roundRect(pos.x-w*0.08, pos.y-h*0.05, w*0.16, h*0.10, 10); c.fill(); c.stroke();
      c.fillStyle = g7pTxt(dark); c.font=`bold ${Math.round(h*0.018)}px Tajawal`; c.textAlign='center';
      c.fillText(o.label, pos.x, pos.y+h*0.006);
      c.restore();
    });

    if(S.dragId){
      const o = PAIRS.find(x=>x.id===S.dragId);
      c.save();
      c.fillStyle = dark?'rgba(74,222,128,0.15)':'rgba(39,174,96,0.12)';
      c.strokeStyle = g7pAccent(dark); c.lineWidth=2;
      c.beginPath(); c.roundRect(S.dragX-w*0.08, S.dragY-h*0.05, w*0.16, h*0.10, 10); c.fill(); c.stroke();
      c.fillStyle = g7pTxt(dark); c.font=`bold ${Math.round(h*0.018)}px Tajawal`; c.textAlign='center';
      c.fillText(o.label, S.dragX, S.dragY+h*0.006);
      c.restore();
    }

    if(!S.done){
      c.fillStyle = g7pMut(dark); c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
      c.fillText(`اكتمل ${Object.keys(S.matched).length} من ٤ 🌱`, w/2, h*0.95);
    }

    animFrame = requestAnimationFrame(draw);
  }
  function wrapText(c, text, x, y, maxW, lineH){
    const words = text.split(' ');
    let line = '', lines = [];
    for(const wd of words){
      const test = line ? line+' '+wd : wd;
      if(c.measureText(test).width > maxW && line){ lines.push(line); line = wd; }
      else line = test;
    }
    if(line) lines.push(line);
    const startY = y - (lines.length-1)*lineH/2;
    lines.forEach((ln,i)=> c.fillText(ln, x, startY+i*lineH));
  }
  draw();
}
