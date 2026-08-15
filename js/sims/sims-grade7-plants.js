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

    // أدلّة الأهداف (Ghost Targets): تُظهر بوضوح أين يجب أن يوضع كل جزء قبل إفلاته
    ORGANS.forEach(o=>{
      if(S.placed[o.id]) return;
      const zx=o.zone.x*w, zy=o.zone.y*h;
      c.save();
      c.setLineDash([6,5]);
      c.lineWidth = 2.5;
      c.strokeStyle = S.dragId ? g7pAccent(dark) : g7pMut(dark);
      c.globalAlpha = S.dragId ? 0.85 : 0.45;
      c.beginPath(); c.arc(zx, zy, w*0.075, 0, Math.PI*2); c.stroke();
      c.setLineDash([]);
      c.globalAlpha = 0.6;
      c.fillStyle = g7pMut(dark); c.font=`${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
      c.fillText(o.label, zx, zy + w*0.075 + h*0.028);
      c.restore();
    });

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

    // بطاقات الأعضاء (يمين) — تبقى ظاهرة دوماً؛ تتحوّل لتصميم "تمّ الربط ✓" عند المطابقة الصحيحة
    PAIRS.forEach((o,i)=>{
      if(S.dragId===o.id) return;
      const pos = organPos(i,w,h);
      const isMatched = !!S.matched[o.id];
      c.save();
      c.fillStyle = isMatched ? (dark?'rgba(74,222,128,0.18)':'rgba(39,174,96,0.12)') : (dark?'rgba(255,255,255,0.07)':'rgba(255,255,255,0.7)');
      c.strokeStyle = isMatched ? g7pAccent(dark) : g7pMut(dark);
      c.lineWidth = isMatched ? 2.5 : 1.5;
      c.beginPath(); c.roundRect(pos.x-w*0.08, pos.y-h*0.05, w*0.16, h*0.10, 10); c.fill(); c.stroke();
      c.fillStyle = isMatched ? g7pAccent(dark) : g7pTxt(dark); c.font=`bold ${Math.round(h*0.018)}px Tajawal`; c.textAlign='center';
      c.fillText((isMatched?'✓ ':'')+o.label, pos.x, pos.y+h*0.006);
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

// ══════════════════════════════════════════════════════════
// الصف السابع — الوحدة الأولى
// نشاط ٢-١ · الأزهار (كتاب الصف السابع ص١٦-١٧)
// ══════════════════════════════════════════════════════════

/* ── تاب ١: ركّبي أجزاء الزهرة (Drag & Drop) ── */
function simG7Bio1N2a(){
  cancelAnimationFrame(animFrame);
  const PARTS = [
    { id:'sepal',  label:'سبلات',  func:'تحيط بالزهرة وتحميها قبل أن تتفتّح.', zone:{x:0.5,y:0.80}, home:{x:0.12,y:0.28} },
    { id:'petal',  label:'بتلات',  func:'عادةً أكثر جزء ملوّن في الزهرة، وتجذب الحشرات والطيور.', zone:{x:0.5,y:0.16}, home:{x:0.88,y:0.28} },
    { id:'stamen', label:'أسدية (المتك والخيط)', func:'الجزء الذكري؛ يحتوي المتك على حبوب اللقاح التي تضمّ الأمشاج الذكرية.', zone:{x:0.28,y:0.48}, home:{x:0.12,y:0.60} },
    { id:'ovary',  label:'مبيض',   func:'يحتوي البويضات التي تضمّ الأمشاج الأنثوية.', zone:{x:0.5,y:0.64}, home:{x:0.88,y:0.60} },
    { id:'stigst', label:'ميسم وقلم', func:'الميسم يستقبل حبوب اللقاح، ويصلها القلم بالمبيض.', zone:{x:0.5,y:0.32}, home:{x:0.5,y:0.88} },
  ];
  const HINTS = {
    sepal:  'فكّري: أيّ جزء يحيط بالزهرة من الخارج قبل أن تتفتّح؟',
    petal:  'فكّري: أيّ جزء عادةً يكون أكثر جزء ملوّناً في الزهرة؟',
    stamen: 'فكّري: أين تجدين حبوب اللقاح في الزهرة؟',
    ovary:  'فكّري: أين توجد البويضات داخل الزهرة؟',
    stigst: 'فكّري: أيّ جزء يستقبل حبوب اللقاح في أعلى الزهرة؟',
  };
  simState = { placed:{}, dragId:null, dragX:0, dragY:0, hint:'', hintT:0, done:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    const n = Object.keys(S.placed).length;
    if(!S.done){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🌸 استقصاء: ركّبي أجزاء الزهرة</div></div>
        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:10px">اسحبي كل جزء إلى مكانه الصحيح (${n} من ٥)</div>
        ${S.hintT>0 ? `<div style="font-size:13px;color:#D97706;background:#FEF3C7;border-radius:8px;padding:10px;margin-bottom:10px">💡 ${S.hint}</div>` : ''}`;
    }
    return `
      <div class="ctrl-section"><div class="ctrl-label">🎉 أحسنتِ! لقد اكتملت الزهرة 🌸</div></div>
      <div style="padding:14px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(212,60,120,0.3);font-size:13px;color:var(--text-secondary);line-height:1.9">
        الأزهار هي أعضاء التكاثر في النباتات. الأسدية هي الجزء الذكري وتحمل حبوب اللقاح، والمبيض والقلم والميسم هي الأجزاء الأنثوية.
      </div>
      <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7fRestart()">↺ أعد النشاط</button>`;
  }
  controls(renderControls());
  window._g7fRestart = function(){
    S.placed={}; S.dragId=null; S.hint=''; S.hintT=0; S.done=false;
    controls(renderControls());
  };

  function hitPart(p,w,h){
    for(const o of PARTS){
      if(S.placed[o.id]) continue;
      const hx=o.home.x*w, hy=o.home.y*h;
      if(Math.hypot(p.x-hx,p.y-hy) < w*0.075) return o;
    }
    return null;
  }
  function onDown(e){ if(S.done) return; const p=g7pGp(cv,e); const o=hitPart(p,cv.width,cv.height); if(o){ S.dragId=o.id; S.dragX=p.x; S.dragY=p.y; } }
  function onMove(e){ if(!S.dragId) return; e.preventDefault && e.preventDefault(); const p=g7pGp(cv,e); S.dragX=p.x; S.dragY=p.y; }
  function onUp(){
    if(!S.dragId) return;
    const o = PARTS.find(x=>x.id===S.dragId);
    const w=cv.width,h=cv.height, zx=o.zone.x*w, zy=o.zone.y*h;
    if(Math.hypot(S.dragX-zx,S.dragY-zy) < w*0.11){
      S.placed[o.id]=true; _g8pPlayDrop();
      if(Object.keys(S.placed).length===PARTS.length) S.done=true;
    } else {
      _g8pPlayClick(); S.hint=HINTS[o.id]; S.hintT=120;
    }
    S.dragId=null; controls(renderControls());
  }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;
  cv.onclick=null;

  function drawPart(c,o,x,y,w,h,scale,full){
    c.save(); c.translate(x,y); c.scale(scale,scale);
    if(o.id==='sepal'){
      c.fillStyle='#4D7C3A';
      const n = full ? 5 : 2;
      for(let i=0;i<n;i++){ const a= full ? i/5*Math.PI*2 : (i===0?-0.3:0.3); c.save(); c.rotate(a);
        c.beginPath(); c.ellipse(0,-w*0.06,w*0.018,w*0.06,0,0,Math.PI*2); c.fill(); c.restore(); }
    } else if(o.id==='petal'){
      c.fillStyle='#F472B6'; c.strokeStyle='#9D174D'; c.lineWidth=1.2;
      const n = full ? 6 : 2;
      for(let i=0;i<n;i++){ const a= full ? i/6*Math.PI*2 : (i===0?-0.35:0.35); c.save(); c.rotate(a);
        c.beginPath(); c.ellipse(0,-w*0.05,w*0.026,w*0.05,0,0,Math.PI*2); c.fill(); c.stroke(); c.restore(); }
    } else if(o.id==='stamen'){
      c.fillStyle='#FDE047'; c.strokeStyle='#CA8A04'; c.lineWidth=1;
      const n = full ? 5 : 2;
      for(let i=0;i<n;i++){ const a= full ? i/5*Math.PI*2+0.3 : (i===0?-0.25:0.25); c.save(); c.rotate(a);
        c.beginPath(); c.moveTo(0,0); c.lineTo(0,-w*0.055); c.stroke();
        c.beginPath(); c.ellipse(0,-w*0.06,w*0.012,w*0.018,0,0,Math.PI*2); c.fill(); c.restore(); }
    } else if(o.id==='ovary'){
      c.fillStyle='#84CC16'; c.strokeStyle='#3F6212'; c.lineWidth=1.5;
      c.beginPath(); c.ellipse(0,0,w*0.03,w*0.024,0,0,Math.PI*2); c.fill(); c.stroke();
    } else { // stigst
      c.strokeStyle='#65A30D'; c.lineWidth=Math.max(2,w*0.006);
      c.beginPath(); c.moveTo(0,w*0.02); c.lineTo(0,-w*0.05); c.stroke();
      c.fillStyle='#A3E635'; c.beginPath(); c.arc(0,-w*0.055,w*0.012,0,Math.PI*2); c.fill();
    }
    c.restore();
  }

  function draw(){
    if(currentSim!=='g7bio1n2' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7pBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ٢-١ · ركّبي أجزاء الزهرة', w/2, h*0.05);
    if(S.hintT>0) S.hintT--;

    // ساق بسيط أسفل الزهرة
    c.strokeStyle='#5F9E52'; c.lineWidth=Math.max(4,w*0.012); c.lineCap='round';
    c.beginPath(); c.moveTo(w*0.5,h*0.86); c.lineTo(w*0.5,h*0.98); c.stroke();

    // أدلّة الأهداف (Ghost Targets)
    PARTS.forEach(o=>{
      if(S.placed[o.id]) return;
      const zx=o.zone.x*w, zy=o.zone.y*h;
      c.save();
      c.setLineDash([6,5]); c.lineWidth=2.5;
      c.strokeStyle = S.dragId ? g7pAccent(dark) : g7pMut(dark);
      c.globalAlpha = S.dragId ? 0.85 : 0.4;
      c.beginPath(); c.arc(zx, zy, w*0.06, 0, Math.PI*2); c.stroke();
      c.setLineDash([]);
      c.globalAlpha=0.6;
      c.fillStyle=g7pMut(dark); c.font=`${Math.round(h*0.013)}px Tajawal`; c.textAlign='center';
      c.fillText(o.label, zx, zy + w*0.06 + h*0.024);
      c.restore();
    });

    PARTS.forEach(o=>{
      if(S.placed[o.id]) drawPart(c,o,o.zone.x*w,o.zone.y*h,w,h,1,true);
    });
    PARTS.forEach(o=>{
      if(S.placed[o.id] || S.dragId===o.id) return;
      const hx=o.home.x*w, hy=o.home.y*h;
      c.save(); c.fillStyle=dark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)';
      c.beginPath(); c.arc(hx,hy,w*0.06,0,Math.PI*2); c.fill(); c.restore();
      drawPart(c,o,hx,hy,w,h,0.85,false);
      c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
      c.fillText(o.label, hx, hy+h*0.08);
    });
    if(S.dragId){ const o=PARTS.find(x=>x.id===S.dragId); drawPart(c,o,S.dragX,S.dragY,w,h,0.95,false); }

    if(!S.done){
      c.fillStyle=g7pMut(dark); c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
      c.fillText(`اكتمل ${Object.keys(S.placed).length} من ٥ 🌸`, w/2, h*0.98);
    }
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ── تاب ٢: استكشفي الزهرة (Hotspots + وضع "من أنا؟") ── */
function simG7Bio1N2b(){
  cancelAnimationFrame(animFrame);
  const SPOTS = [
    { id:'petal',    label:'بتلة',  func:'عادةً أكثر جزء ملوّن في الزهرة، وتجذب الحشرات والطيور، ولبعضها روائح أيضاً.', riddle:'أنا الجزء الملوّن الذي يجذب الحشرات والطيور إلى الزهرة. من أنا؟' },
    { id:'sepal',    label:'سبلة',  func:'تحيط بالزهرة وتحميها.', riddle:'أنا أحيط بالزهرة من الخارج وأحميها. من أنا؟' },
    { id:'anther',   label:'متك',   func:'ينتج حبوب اللقاح التي تحتوي على الأمشاج الذكرية.', riddle:'أنتج حبوب اللقاح التي تحمل الأمشاج الذكرية. من أنا؟' },
    { id:'filament', label:'خيط',   func:'يحمل المتك في أعلى الزهرة.', riddle:'أحمل المتك في مكانه العالي داخل الزهرة. من أنا؟' },
    { id:'stigma',   label:'ميسم',  func:'يستقبل حبوب اللقاح أثناء التلقيح.', riddle:'أساعد في عملية التكاثر باستقبال حبوب اللقاح في أعلى الزهرة. من أنا؟' },
    { id:'style',    label:'قلم',   func:'يصل الميسم بالمبيض.', riddle:'أصل بين الميسم والمبيض. من أنا؟' },
    { id:'ovary',    label:'مبيض',  func:'يحتوي البويضات، وفيها الأمشاج الأنثوية.', riddle:'أحتوي على البويضات التي تحمل الأمشاج الأنثوية. من أنا؟' },
  ];
  // مواقع كل جزء تُحسب بنفس معادلات الرسم بالضبط (بدون أي تخمين)، فتقع النقاط دوماً فوق الجزء الصحيح
  function flowerAnchor(id, cx, cy, R){
    switch(id){
      case 'petal':    return { x: cx, y: cy - R*0.65 };
      case 'sepal':    { const a=0.4;  return { x: cx + R*0.95*Math.sin(a), y: cy - R*0.95*Math.cos(a) }; }
      case 'anther':   { const a=0.3;  return { x: cx + R*0.46*Math.sin(a), y: cy - R*0.46*Math.cos(a) }; }
      case 'filament': { const a=0.3;  return { x: cx + R*0.22*Math.sin(a), y: cy - R*0.22*Math.cos(a) }; }
      case 'stigma':   return { x: cx, y: cy - R*0.55 };
      case 'style':    return { x: cx, y: cy - R*0.25 };
      case 'ovary':    return { x: cx, y: cy + R*0.15 };
    }
  }
  simState = { mode:'explore', selected:null, riddleIdx:0, riddleOrder:[], wrongPick:null, score:0 };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function shuffle(arr){ const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

  function renderControls(){
    if(S.mode==='explore'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🌸 استكشفي الزهرة</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:12px">اضغطي على أيّ دائرة على الزهرة لتتعرّفي على ذلك الجزء.</div>
        <div id="g7fSpotInfo" style="font-size:13px;color:var(--text-secondary);line-height:1.8;min-height:24px;margin-bottom:14px;background:var(--bg-card2);border-radius:8px;padding:${S.selected?'12px':'0px'}">
          ${S.selected ? ('<strong>'+SPOTS.find(s=>s.id===S.selected).label+':</strong> '+SPOTS.find(s=>s.id===S.selected).func) : ''}
        </div>
        <button class="ctrl-btn play" onclick="window._g7fStartQuiz()">🔍 من أنا؟ (اختبري نفسك)</button>`;
    }
    if(S.riddleIdx>=S.riddleOrder.length){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🎉 أحسنتِ!</div></div>
        <div style="padding:14px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(212,60,120,0.3);font-size:13px;color:var(--text-secondary);line-height:1.9">
          أجبتِ صح على ${S.score} من ${SPOTS.length}. تعرّفتِ الآن على كل أجزاء الزهرة ووظائفها.
        </div>
        <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7fBackExplore()">↺ عودة للاستكشاف</button>`;
    }
    const cur = SPOTS.find(s=>s.id===S.riddleOrder[S.riddleIdx]);
    return `
      <div class="ctrl-section"><div class="ctrl-label">🔍 من أنا؟ (${S.riddleIdx+1} من ${SPOTS.length})</div></div>
      <div style="font-size:14px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:10px">${cur.riddle}</div>
      <div style="font-size:12.5px;color:var(--text-secondary)">اضغطي على الجزء المناسب في الصورة.</div>
      ${S.wrongPick ? `<div style="margin-top:10px;font-size:13px;color:#D97706;background:#FEF3C7;border-radius:8px;padding:10px">💡 ليس هذا الجزء الصحيح، حاولي مرّة أخرى.</div>` : ''}`;
  }
  controls(renderControls());

  window._g7fStartQuiz = function(){
    _g8pPlayClick();
    S.mode='quiz'; S.riddleIdx=0; S.riddleOrder=shuffle(SPOTS.map(s=>s.id)); S.score=0; S.wrongPick=null;
    controls(renderControls());
  };
  window._g7fBackExplore = function(){
    S.mode='explore'; S.selected=null;
    controls(renderControls());
  };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null;
  cv.onclick = function(e){
    const p = g7pGp(cv,e), w=cv.width, h=cv.height;
    const cx=w*0.5, cy=h*0.52, R=Math.min(w,h)*0.32;
    let hit = null;
    for(const s of SPOTS){
      const a = flowerAnchor(s.id, cx, cy, R);
      if(Math.hypot(p.x-a.x, p.y-a.y) < w*0.045){ hit = s; break; }
    }
    if(!hit) return;
    if(S.mode==='explore'){
      S.selected = hit.id; _g8pPlayClick(); controls(renderControls());
    } else {
      const target = S.riddleOrder[S.riddleIdx];
      if(hit.id===target){
        _g8pPlayDrop(); S.score++; S.wrongPick=null; S.riddleIdx++;
      } else {
        _g8pPlayClick(); S.wrongPick = hit.id;
        setTimeout(()=>{ S.wrongPick=null; controls(renderControls()); }, 1300);
      }
      controls(renderControls());
    }
  };

  function draw(){
    if(currentSim!=='g7bio1n2' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7pBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
    c.fillText(S.mode==='explore' ? 'نشاط ٢-١ · استكشفي الزهرة' : 'نشاط ٢-١ · من أنا؟', w/2, h*0.05);

    // رسم زهرة كبيرة وواضحة (تقريب تخطيطي لرسم الكتاب)
    const cx=w*0.5, cy=h*0.52, R=Math.min(w,h)*0.32;
    // بتلات
    c.save(); c.translate(cx,cy);
    for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; c.save(); c.rotate(a);
      c.fillStyle='#F472B6'; c.strokeStyle='#9D174D'; c.lineWidth=2;
      c.beginPath(); c.ellipse(0,-R*0.65,R*0.28,R*0.6,0,0,Math.PI*2); c.fill(); c.stroke(); c.restore(); }
    // سبلات (خلف البتلات، تظهر أطرافها)
    for(let i=0;i<5;i++){ const a=i/5*Math.PI*2+0.4; c.save(); c.rotate(a);
      c.fillStyle='#4D7C3A'; c.beginPath(); c.ellipse(0,-R*0.95,R*0.08,R*0.22,0,0,Math.PI*2); c.fill(); c.restore(); }
    // أسدية
    for(let i=0;i<6;i++){ const a=i/6*Math.PI*2+0.3; c.save(); c.rotate(a);
      c.strokeStyle='#CA8A04'; c.lineWidth=Math.max(2,R*0.03); c.beginPath(); c.moveTo(0,0); c.lineTo(0,-R*0.42); c.stroke();
      c.fillStyle='#FDE047'; c.beginPath(); c.ellipse(0,-R*0.46,R*0.06,R*0.09,0,0,Math.PI*2); c.fill(); c.restore(); }
    // متاع (قلم + مبيض)
    c.strokeStyle='#65A30D'; c.lineWidth=Math.max(3,R*0.045);
    c.beginPath(); c.moveTo(0,R*0.05); c.lineTo(0,-R*0.5); c.stroke();
    c.fillStyle='#A3E635'; c.beginPath(); c.arc(0,-R*0.55,R*0.06,0,Math.PI*2); c.fill();
    c.fillStyle='#84CC16'; c.strokeStyle='#3F6212'; c.lineWidth=2;
    c.beginPath(); c.ellipse(0,R*0.15,R*0.15,R*0.12,0,0,Math.PI*2); c.fill(); c.stroke();
    c.restore();

    // نقاط تفاعلية (Hotspots) — بنفس إحداثيات flowerAnchor تماماً، فتقع دوماً فوق الجزء الصحيح
    SPOTS.forEach(s=>{
      const { x, y } = flowerAnchor(s.id, cx, cy, R);
      const isSel = (S.mode==='explore' && S.selected===s.id) || (S.mode==='quiz' && S.wrongPick===s.id);
      const wasRight = S.mode==='quiz' && S.riddleOrder.slice(0,S.riddleIdx).includes(s.id);
      c.save();
      c.fillStyle = isSel ? (S.mode==='quiz' && S.wrongPick===s.id ? 'rgba(231,76,60,0.6)' : 'rgba(74,222,128,0.55)') : (dark?'rgba(255,255,255,0.55)':'rgba(255,255,255,0.9)');
      c.strokeStyle = wasRight ? g7pAccent(dark) : (dark?'#1A3A25':'#166534'); c.lineWidth=2.5;
      c.beginPath(); c.arc(x,y,w*0.026,0,Math.PI*2); c.fill(); c.stroke();
      c.restore();
      if(S.mode==='explore'){
        c.save();
        c.fillStyle=dark?'rgba(11,26,16,0.85)':'rgba(255,255,255,0.9)';
        c.font=`bold ${Math.round(h*0.0135)}px Tajawal`; c.textAlign='center';
        const tw = c.measureText(s.label).width;
        c.fillRect(x-tw/2-4, y-h*0.045, tw+8, h*0.022);
        c.fillStyle=g7pTxt(dark);
        c.fillText(s.label, x, y - h*0.03);
        c.restore();
      }
    });

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// الصف السابع — الوحدة الأولى
// نشاط ٣-١ · التلقيح (كتاب الصف السابع ص١٨-١٩)
// ══════════════════════════════════════════════════════════

/* ── تاب ١: رحلة النحلة ونقل حبوب اللقاح ── */
function simG7Bio1N3a(){
  cancelAnimationFrame(animFrame);
  const flower1 = { x:0.24, y:0.55, anther:{x:0.24,y:0.42} }; // زهرة تحتوي على المتك (ذكري)
  const flower2 = { x:0.76, y:0.55, stigma:{x:0.76,y:0.40} }; // زهرة تحتوي على الميسم (أنثوي)
  const beeHome = { x:0.5, y:0.85 };
  simState = { mode:'predict', predictAns:null, beeX:beeHome.x, beeY:beeHome.y, beeDrag:false, pollenOnBee:false, reflectAns:null };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    if(S.mode==='predict'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🐝 رحلة النحلة ونقل حبوب اللقاح</div></div>
        <div style="font-size:14px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px">ماذا تتوقّعين أن يحدث عندما تنتقل النحلة من زهرة إلى أخرى؟</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${['ستنقل النحلة حبوب اللقاح من الزهرة الأولى إلى الثانية','لن يحدث أيّ شيء','ستأكل النحلة الزهرة بالكامل'].map((o,i)=>`<button id="g7bPredOpt${i}" onclick="window._g7bPredict(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">${o}</button>`).join('')}
        </div>`;
    }
    if(S.mode==='drag1'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🐝 الخطوة ١ من ٢</div></div>
        <div style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px">اسحبي النحلة 🐝 إلى الزهرة الأولى (التي بها المتك الأصفر) لتلتقط حبوب اللقاح.</div>`;
    }
    if(S.mode==='drag2'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🐝 الخطوة ٢ من ٢</div></div>
        <div style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px">أحسنتِ! التصقت حبوب اللقاح بالنحلة. الآن اسحبيها إلى الزهرة الثانية (التي بها الميسم).</div>`;
    }
    if(S.mode==='success'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">✅ نجحت عملية التلقيح 🌸</div></div>
        <div style="padding:14px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(212,60,120,0.3);font-size:13px;color:var(--text-secondary);line-height:1.9;margin-bottom:12px">
          نقلت النحلة حبوب اللقاح من متك الزهرة الأولى إلى ميسم الزهرة الثانية — هذه عملية التلقيح.
        </div>
        <button class="ctrl-btn play" onclick="window._g7bReflect()">➡ متابعة</button>`;
    }
    if(S.mode==='reflect'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🤔 هل حدث ما توقّعتِه؟</div></div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:10px">
          ${['نعم، كما توقّعت','لا، كان مختلفاً'].map((o,i)=>`<button onclick="window._g7bFinish()" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">${o}</button>`).join('')}
        </div>`;
    }
    return `
      <div class="ctrl-section"><div class="ctrl-label">🎉 أحسنتِ!</div></div>
      <div style="padding:14px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(212,60,120,0.3);font-size:13px;color:var(--text-secondary);line-height:1.9">
        التلقيح هو انتقال حبوب اللقاح من المتك إلى الميسم، وتساعد الحشرات مثل النحل على نقلها بين الأزهار أثناء بحثها عن الرحيق.
      </div>
      <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7bRestart()">↺ أعد التجربة</button>`;
  }
  controls(renderControls());

  window._g7bPredict = function(i){
    _g8pPlayClick(); S.predictAns=i;
    S.mode='drag1';
    controls(renderControls());
  };
  window._g7bReflect = function(){ _g8pPlayClick(); S.mode='reflect'; controls(renderControls()); };
  window._g7bFinish = function(){ _g8pPlayClick(); S.mode='done'; controls(renderControls()); };
  window._g7bRestart = function(){
    S.mode='predict'; S.predictAns=null; S.beeX=beeHome.x; S.beeY=beeHome.y; S.beeDrag=false; S.pollenOnBee=false;
    controls(renderControls());
  };

  function beePix(w,h){ return { x:S.beeX*w, y:S.beeY*h }; }
  function onDown(e){
    if(S.mode!=='drag1' && S.mode!=='drag2') return;
    const p = g7pGp(cv,e), w=cv.width,h=cv.height, bp=beePix(w,h);
    if(Math.hypot(p.x-bp.x,p.y-bp.y) < w*0.06){ S.beeDrag=true; }
  }
  function onMove(e){
    if(!S.beeDrag) return;
    e.preventDefault && e.preventDefault();
    const p = g7pGp(cv,e), w=cv.width, h=cv.height;
    S.beeX = Math.max(0.06,Math.min(0.94,p.x/w));
    S.beeY = Math.max(0.1,Math.min(0.9,p.y/h));
  }
  function onUp(){
    if(!S.beeDrag) return;
    S.beeDrag=false;
    const w=cv.width,h=cv.height, bp=beePix(w,h);
    if(S.mode==='drag1'){
      const tx=flower1.anther.x*w, ty=flower1.anther.y*h;
      if(Math.hypot(bp.x-tx,bp.y-ty) < w*0.09){
        S.pollenOnBee=true; _g8pPlayDrop(); S.mode='drag2';
      } else {
        S.beeX=beeHome.x; S.beeY=beeHome.y;
      }
    } else if(S.mode==='drag2'){
      const tx=flower2.stigma.x*w, ty=flower2.stigma.y*h;
      if(Math.hypot(bp.x-tx,bp.y-ty) < w*0.09){
        S.pollenOnBee=false; _g8pPlayDrop(); S.mode='success';
      } else {
        S.beeX = 0.5; S.beeY = 0.85;
      }
    }
    controls(renderControls());
  }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;
  cv.onclick=null;

  function drawFlower(c,fx,fy,w,h,hasAnther,hasStigma,pollenDelivered){
    c.save(); c.translate(fx*w,fy*h);
    c.strokeStyle='#5F9E52'; c.lineWidth=Math.max(3,w*0.008); c.beginPath(); c.moveTo(0,0); c.lineTo(0,h*0.32); c.stroke();
    for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; c.save(); c.rotate(a);
      c.fillStyle= hasAnther ? '#FDE68A' : '#C4B5FD'; c.strokeStyle= hasAnther ? '#CA8A04' : '#6D28D9'; c.lineWidth=1.5;
      c.beginPath(); c.ellipse(0,-w*0.05,w*0.02,w*0.05,0,0,Math.PI*2); c.fill(); c.stroke(); c.restore(); }
    if(hasAnther){
      c.fillStyle='#FDE047';
      for(let i=0;i<3;i++){ const a=i/3*Math.PI*2; c.beginPath(); c.arc(Math.cos(a)*w*0.02,-w*0.02+Math.sin(a)*w*0.02,w*0.012,0,Math.PI*2); c.fill(); }
    }
    if(hasStigma){
      c.strokeStyle='#65A30D'; c.lineWidth=Math.max(2,w*0.005); c.beginPath(); c.moveTo(0,0); c.lineTo(0,-w*0.05); c.stroke();
      c.fillStyle = pollenDelivered ? '#FDE047' : '#A3E635';
      c.beginPath(); c.arc(0,-w*0.055,w*0.014,0,Math.PI*2); c.fill();
    }
    c.restore();
  }

  function draw(){
    if(currentSim!=='g7bio1n3' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7pBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ٣-١ · رحلة النحلة', w/2, h*0.06);

    drawFlower(c, flower1.x, flower1.y, w, h, true, false, false);
    c.fillStyle=g7pMut(dark); c.font=`${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
    c.fillText('زهرة (١) — بها المتك', flower1.x*w, flower1.y*h+h*0.06);

    const delivered = S.mode==='success' || S.mode==='reflect' || S.mode==='done';
    drawFlower(c, flower2.x, flower2.y, w, h, false, true, delivered);
    c.fillText('زهرة (٢) — بها الميسم', flower2.x*w, flower2.y*h+h*0.06);

    // النحلة
    if(S.mode==='drag1' || S.mode==='drag2' || S.mode==='success'){
      const bx = S.mode==='success' ? flower2.stigma.x*w : S.beeX*w;
      const by = S.mode==='success' ? flower2.stigma.y*h - h*0.06 : S.beeY*h;
      c.save(); c.translate(bx,by);
      c.fillStyle='#F59E0B'; c.beginPath(); c.ellipse(0,0,w*0.03,w*0.022,0,0,Math.PI*2); c.fill();
      c.strokeStyle='#1F2937'; c.lineWidth=2;
      c.beginPath(); c.moveTo(-w*0.015,-w*0.012); c.lineTo(w*0.015,-w*0.012); c.stroke();
      c.beginPath(); c.moveTo(-w*0.015,w*0.006); c.lineTo(w*0.015,w*0.006); c.stroke();
      c.fillStyle='rgba(255,255,255,0.6)';
      c.beginPath(); c.ellipse(-w*0.01,-w*0.025,w*0.014,w*0.02,0.4,0,Math.PI*2); c.fill();
      c.beginPath(); c.ellipse(w*0.01,-w*0.025,w*0.014,w*0.02,-0.4,0,Math.PI*2); c.fill();
      if(S.pollenOnBee){
        c.fillStyle='#FDE047';
        for(let i=0;i<3;i++){ c.beginPath(); c.arc((i-1)*w*0.012, w*0.014, w*0.006,0,Math.PI*2); c.fill(); }
      }
      c.restore();
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ── تاب ٢: استكشفي حبوب اللقاح (عدسة مكبّرة + تصنيف) ── */
function simG7Bio1N3b(){
  cancelAnimationFrame(animFrame);
  const F_INSECT = { x:0.26, y:0.45, col:'#F472B6', dark:'#9D174D', pollenTxt:'حبوب لقاح لزجة/بأشواك', label:'الزهرة (أ)' };
  const F_WIND   = { x:0.74, y:0.45, col:'#D6D3D1', dark:'#78716C', pollenTxt:'حبوب لقاح ملساء', label:'الزهرة (ب)' };
  const TRAITS = [
    { id:'t1', text:'ألوان زاهية', correct:'insect' },
    { id:'t2', text:'ألوان غير زاهية', correct:'wind' },
    { id:'t3', text:'حبوب لقاح لزجة أو بأشواك', correct:'insect' },
    { id:'t4', text:'حبوب لقاح ملساء', correct:'wind' },
  ];
  simState = { mode:'explore', lensOn:null, lensX:0.5, lensY:0.5, classified:{}, dragTrait:null, dragX:0, dragY:0, wrong:null };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function shuffle(arr){ const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
  const TRAITS_SHUFFLED = shuffle(TRAITS);

  function renderControls(){
    if(S.mode==='explore'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🔍 استكشفي حبوب اللقاح</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:12px">حرّكي العدسة المكبّرة 🔍 فوق كل زهرة لرؤية حبوب اللقاح عن قرب.</div>
        <button class="ctrl-btn play" onclick="window._g7lStartClassify()">➡ صنّفي الزهرتين</button>`;
    }
    const n = Object.keys(S.classified).length;
    if(n===TRAITS.length){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🎉 أحسنتِ!</div></div>
        <div style="padding:14px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(212,60,120,0.3);font-size:13px;color:var(--text-secondary);line-height:1.9">
          الزهرة (أ) بألوانها الزاهية وحبوب لقاحها اللزجة/الشائكة يُرجَّح أنها تُلقَّح بالحشرات، بينما الزهرة (ب) بألوانها غير الزاهية وحبوب لقاحها الملساء يُرجَّح أنها تُلقَّح بالرياح.
        </div>
        <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7lRestart()">↺ أعد النشاط</button>`;
    }
    return `
      <div class="ctrl-section"><div class="ctrl-label">🏷️ صنّفي الخصائص (${n} من ${TRAITS.length})</div></div>
      <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:10px">اسحبي كل بطاقة خاصية إلى الزهرة المناسبة لها.</div>
      ${S.wrong ? `<div style="font-size:13px;color:#D97706;background:#FEF3C7;border-radius:8px;padding:10px">💡 فكّري: أيّ زهرة تناسبها هذه الخاصية أكثر؟</div>` : ''}`;
  }
  controls(renderControls());

  window._g7lStartClassify = function(){ _g8pPlayClick(); S.mode='classify'; controls(renderControls()); };
  window._g7lRestart = function(){ S.mode='explore'; S.classified={}; S.dragTrait=null; S.wrong=null; controls(renderControls()); };

  function traitPos(i,w,h){ return { x:w*0.5, y:h*(0.18+i*0.14) }; }

  function onDown(e){
    const p = g7pGp(cv,e), w=cv.width,h=cv.height;
    if(S.mode==='explore'){
      S.lensOn = 'drag'; S.lensX=p.x/w; S.lensY=p.y/h;
      return;
    }
    for(let i=0;i<TRAITS_SHUFFLED.length;i++){
      const t=TRAITS_SHUFFLED[i]; if(S.classified[t.id]) continue;
      const pos=traitPos(i,w,h);
      if(Math.abs(p.x-pos.x)<w*0.22 && Math.abs(p.y-pos.y)<h*0.045){ S.dragTrait=t.id; S.dragX=p.x; S.dragY=p.y; break; }
    }
  }
  function onMove(e){
    const p = g7pGp(cv,e), w=cv.width,h=cv.height;
    if(S.mode==='explore' && S.lensOn==='drag'){
      e.preventDefault && e.preventDefault();
      S.lensX = Math.max(0.06,Math.min(0.94,p.x/w)); S.lensY = Math.max(0.15,Math.min(0.85,p.y/h));
      return;
    }
    if(S.dragTrait){ e.preventDefault && e.preventDefault(); S.dragX=p.x; S.dragY=p.y; }
  }
  function onUp(){
    if(S.mode==='explore'){ S.lensOn=null; return; }
    if(!S.dragTrait) return;
    const w=cv.width,h=cv.height;
    const t = TRAITS.find(x=>x.id===S.dragTrait);
    const distInsect = Math.hypot(S.dragX-F_INSECT.x*w, S.dragY-F_INSECT.y*h);
    const distWind = Math.hypot(S.dragX-F_WIND.x*w, S.dragY-F_WIND.y*h);
    const target = distInsect<distWind ? 'insect' : 'wind';
    const dropped = Math.min(distInsect,distWind) < w*0.16;
    if(dropped && target===t.correct){
      S.classified[t.id]=true; _g8pPlayDrop(); S.wrong=null;
    } else if(dropped){
      _g8pPlayClick(); S.wrong=true; setTimeout(()=>{S.wrong=null; controls(renderControls());},1200);
    }
    S.dragTrait=null; controls(renderControls());
  }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;
  cv.onclick=null;

  function drawFlowerBig(c,f,w,h){
    c.save(); c.translate(f.x*w,f.y*h);
    for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; c.save(); c.rotate(a);
      c.fillStyle=f.col; c.strokeStyle=f.dark; c.lineWidth=2;
      c.beginPath(); c.ellipse(0,-w*0.055,w*0.024,w*0.055,0,0,Math.PI*2); c.fill(); c.stroke(); c.restore(); }
    c.fillStyle='#FDE047';
    for(let i=0;i<3;i++){ const a=i/3*Math.PI*2; c.beginPath(); c.arc(Math.cos(a)*w*0.018,Math.sin(a)*w*0.018,w*0.01,0,Math.PI*2); c.fill(); }
    c.restore();
    c.fillStyle=g7pTxt(isDarkMode()); c.font=`bold ${Math.round(h*0.017)}px Tajawal`; c.textAlign='center';
    c.fillText(f.label, f.x*w, f.y*h+h*0.14);
  }

  function draw(){
    if(currentSim!=='g7bio1n3' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7pBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ٣-١ · استكشفي حبوب اللقاح', w/2, h*0.06);

    drawFlowerBig(c, F_INSECT, w, h);
    drawFlowerBig(c, F_WIND, w, h);

    if(S.mode==='explore'){
      // عدسة مكبّرة تفاعلية
      const lx=S.lensX*w, ly=S.lensY*h, lr=w*0.09;
      const nearF = Math.hypot(lx-F_INSECT.x*w,ly-F_INSECT.y*h)<lr*1.5 ? F_INSECT : (Math.hypot(lx-F_WIND.x*w,ly-F_WIND.y*h)<lr*1.5 ? F_WIND : null);
      c.save(); c.beginPath(); c.arc(lx,ly,lr,0,Math.PI*2); c.clip();
      c.fillStyle = dark?'#0B1A10':'#FFFFFF'; c.fillRect(lx-lr,ly-lr,lr*2,lr*2);
      if(nearF){
        for(let i=0;i<10;i++){
          const a = (i/10)*Math.PI*2, rr = lr*0.5;
          const px = lx+Math.cos(a)*rr, py=ly+Math.sin(a)*rr;
          c.fillStyle = nearF===F_INSECT ? '#EA580C' : '#FDE68A';
          c.beginPath(); c.arc(px,py, nearF===F_INSECT? lr*0.09 : lr*0.07, 0, Math.PI*2); c.fill();
          if(nearF===F_INSECT){
            c.strokeStyle='#7C2D12'; c.lineWidth=1;
            for(let k=0;k<5;k++){ const a2=k/5*Math.PI*2; c.beginPath(); c.moveTo(px,py); c.lineTo(px+Math.cos(a2)*lr*0.13, py+Math.sin(a2)*lr*0.13); c.stroke(); }
          }
        }
      }
      c.restore();
      c.strokeStyle=g7pAccent(dark); c.lineWidth=3; c.beginPath(); c.arc(lx,ly,lr,0,Math.PI*2); c.stroke();
      c.strokeStyle=g7pMut(dark); c.lineWidth=Math.max(4,w*0.01); c.lineCap='round';
      c.beginPath(); c.moveTo(lx+lr*0.75,ly+lr*0.75); c.lineTo(lx+lr*1.4,ly+lr*1.4); c.stroke();
      if(nearF){
        c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
        c.fillText(nearF.pollenTxt, lx, ly+lr+h*0.03);
      }
    } else {
      // بطاقات التصنيف
      TRAITS_SHUFFLED.forEach((t,i)=>{
        if(S.classified[t.id] || S.dragTrait===t.id) return;
        const pos = traitPos(i,w,h);
        c.save();
        c.fillStyle = dark?'rgba(255,255,255,0.07)':'rgba(255,255,255,0.75)';
        c.strokeStyle = g7pMut(dark); c.lineWidth=1.5;
        c.beginPath(); c.roundRect(pos.x-w*0.22,pos.y-h*0.035,w*0.44,h*0.07,10); c.fill(); c.stroke();
        c.fillStyle=g7pTxt(dark); c.font=`${Math.round(h*0.017)}px Tajawal`; c.textAlign='center';
        c.fillText(t.text, pos.x, pos.y+h*0.005);
        c.restore();
      });
      TRAITS.forEach(t=>{
        if(!S.classified[t.id]) return;
        const f = t.correct==='insect' ? F_INSECT : F_WIND;
        c.save(); c.globalAlpha=0.85;
        c.fillStyle=dark?'rgba(74,222,128,0.15)':'rgba(39,174,96,0.12)'; c.strokeStyle=g7pAccent(dark); c.lineWidth=1.5;
        const yy = f.y*h + h*0.22 + (t.id==='t1'||t.id==='t3'?0:h*0.06);
        c.beginPath(); c.roundRect(f.x*w-w*0.15, yy, w*0.3, h*0.05, 8); c.fill(); c.stroke();
        c.fillStyle=g7pTxt(dark); c.font=`${Math.round(h*0.013)}px Tajawal`; c.textAlign='center';
        c.fillText(t.text, f.x*w, yy+h*0.033);
        c.restore();
      });
      if(S.dragTrait){
        const t = TRAITS.find(x=>x.id===S.dragTrait);
        c.save();
        c.fillStyle='rgba(74,222,128,0.2)'; c.strokeStyle=g7pAccent(dark); c.lineWidth=2;
        c.beginPath(); c.roundRect(S.dragX-w*0.22,S.dragY-h*0.035,w*0.44,h*0.07,10); c.fill(); c.stroke();
        c.fillStyle=g7pTxt(dark); c.font=`${Math.round(h*0.017)}px Tajawal`; c.textAlign='center';
        c.fillText(t.text, S.dragX, S.dragY+h*0.005);
        c.restore();
      }
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ── تاب ٣: من هو ناقل حبوب اللقاح؟ ── */
function simG7Bio1N3c(){
  cancelAnimationFrame(animFrame);
  const ROUNDS = [
    { id:'r1', desc:'زهرة بألوان زاهية جذّابة، ولها رائحة ورحيق، وحبوب لقاحها لزجة.', correct:'bee',
      explain:'الألوان الزاهية والرحيق يجذبان الحشرات مثل النحل، وحبوب اللقاح اللزجة تلتصق بجسم الحشرة بسهولة.' },
    { id:'r2', desc:'زهرة صغيرة بألوان غير زاهية، بلا رحيق، وحبوب لقاحها ملساء وخفيفة الوزن.', correct:'wind',
      explain:'لا يوجد سبب يجذب الحشرات (لا رحيق ولا ألوان زاهية)، وحبوب اللقاح الملساء الخفيفة تناسب الانتقال بالرياح.' },
    { id:'r3', desc:'زهرة ذات رحيق وفير، وشكل أنبوبي طويل يناسب منقار طويل رفيع.', correct:'bird',
      explain:'الشكل الأنبوبي الطويل مناسب لمنقار الطيور مثل طائر التمير (Sunbird) الذي يمتصّ الرحيق وينقل حبوب اللقاح بريشه.' },
  ];
  simState = { round:0, picked:null, revealed:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    if(S.round>=ROUNDS.length){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🎉 أحسنتِ!</div></div>
        <div style="padding:14px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(212,60,120,0.3);font-size:13px;color:var(--text-secondary);line-height:1.9">
          خصائص الزهرة (اللون، الرائحة، الرحيق، شكل حبوب اللقاح) تدلّنا على الطريقة الأرجح لتلقيحها.
        </div>
        <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7pollRestart()">↺ أعد النشاط</button>`;
    }
    const r = ROUNDS[S.round];
    let body = `
      <div class="ctrl-section"><div class="ctrl-label">🔎 من الناقل؟ (${S.round+1} من ${ROUNDS.length})</div></div>
      <div style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:12px">${r.desc}</div>`;
    if(!S.revealed){
      body += `<div style="display:flex;flex-direction:column;gap:8px">
        ${[['bee','🐝 نحلة'],['bird','🐦 طائر'],['wind','🌬️ الرياح']].map(([id,label])=>`<button onclick="window._g7pollPick('${id}')" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">${label}</button>`).join('')}
      </div>`;
    } else {
      const ok = S.picked===r.correct;
      body += `<div style="font-size:13px;color:${ok?'#16A34A':'#D97706'};background:${ok?'rgba(39,174,96,0.1)':'#FEF3C7'};border-radius:8px;padding:12px;margin-bottom:12px;line-height:1.8">
        ${ok?'✅ صحيح!':'💡 الإجابة الأقرب هي: '+({bee:'🐝 نحلة',bird:'🐦 طائر',wind:'🌬️ الرياح'}[r.correct])}<br>${r.explain}
      </div>
      <button class="ctrl-btn play" onclick="window._g7pollNext()">➡ التالي</button>`;
    }
    return body;
  }
  controls(renderControls());

  window._g7pollPick = function(id){
    _g8pPlayClick(); S.picked=id; S.revealed=true;
    controls(renderControls());
  };
  window._g7pollNext = function(){
    _g8pPlayClick(); S.round++; S.picked=null; S.revealed=false;
    controls(renderControls());
  };
  window._g7pollRestart = function(){
    S.round=0; S.picked=null; S.revealed=false;
    controls(renderControls());
  };
  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null;
  cv.onclick=null;

  function draw(){
    if(currentSim!=='g7bio1n3' || currentTab!==2){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7pBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ٣-١ · من هو ناقل حبوب اللقاح؟', w/2, h*0.07);

    if(S.round<ROUNDS.length){
      const r = ROUNDS[S.round];
      const cx=w*0.5, cy=h*0.48, R=Math.min(w,h)*0.22;
      let petalCol='#F472B6', petalDark='#9D174D', shape='round';
      if(r.id==='r2'){ petalCol='#D6D3D1'; petalDark='#78716C'; }
      if(r.id==='r3'){ petalCol='#F97316'; petalDark='#9A3412'; shape='tube'; }
      c.save(); c.translate(cx,cy);
      if(shape==='tube'){
        c.fillStyle=petalCol; c.strokeStyle=petalDark; c.lineWidth=2;
        c.beginPath(); c.moveTo(-R*0.15,R*0.6); c.lineTo(-R*0.05,-R*0.9); c.lineTo(R*0.05,-R*0.9); c.lineTo(R*0.15,R*0.6); c.closePath(); c.fill(); c.stroke();
      } else {
        for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; c.save(); c.rotate(a);
          c.fillStyle=petalCol; c.strokeStyle=petalDark; c.lineWidth=2;
          c.beginPath(); c.ellipse(0,-R*0.55,R*0.22,R*0.5,0,0,Math.PI*2); c.fill(); c.stroke(); c.restore(); }
        c.fillStyle='#FDE047'; c.beginPath(); c.arc(0,0,R*0.14,0,Math.PI*2); c.fill();
      }
      c.restore();

      if(S.revealed){
        const icon = S.picked===r.correct ? '✅' : '❌';
        c.font=`${Math.round(h*0.05)}px sans-serif`; c.textAlign='center';
        c.fillText(icon, cx, cy+R*1.4);
      }
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}
