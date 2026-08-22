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
    { id:'roots',  label:'الجذور', func:'تثبّت النبات في التربة وتمتصّ منها الماء والأملاح المعدنية.', fact:'تتفرّع الجذور كثيراً في التربة لزيادة مساحة امتصاص الماء.', zone:{x:0.5, y:0.82}, home:{x:0.14,y:0.86} },
    { id:'stem',   label:'الساق',   func:'تحمل الأوراق والأزهار فوق التربة، وتصل الجذور بباقي النبات.', fact:'تنقل الساق الماء من الجذور إلى بقيّة أجزاء النبات.', zone:{x:0.5, y:0.58}, home:{x:0.86,y:0.86} },
    { id:'leaves', label:'الأوراق', func:'مصانع غذاء النبات؛ تمتصّ ضوء الشمس وتستخدمه في صنع الغذاء.', fact:'اللون الأخضر في الأوراق سببه صبغة اليخضور (الكلوروفيل).', zone:{x:0.5, y:0.42}, home:{x:0.14,y:0.66} },
    { id:'flower', label:'الزهرة',  func:'عضو التكاثر في النبات؛ تنتج البذور التي يمكن أن تنمو إلى نبات جديد.', fact:'الأزهار هي أعضاء التكاثر في النباتات الزهرية.', zone:{x:0.5, y:0.28}, home:{x:0.86,y:0.66} },
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
      if(Object.keys(S.placed).length===ORGANS.length){ S.done = true; S.successT = 60; S.sparkles = null; }
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
        c.beginPath(); c.ellipse(0,-w*0.032,w*0.017,w*0.032,0,0,Math.PI*2); c.fill(); c.stroke();
        c.restore();
      }
      c.fillStyle='#FDE047'; c.beginPath(); c.arc(0,0,w*0.014,0,Math.PI*2); c.fill();
    }
    c.restore();
  }

  function draw(){
    if(currentSim!=='g7bio1n1' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    c.fillStyle = g7pBg(dark); c.fillRect(0,0,w,h);

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

    // الساق المتّصلة: تُرسم خطاً واحداً متواصلاً من الجذور حتى الزهرة بمجرّد وضع "الساق"
    // بحيث تبدو كل الأجزاء متّصلة ببعضها كنبتة واحدة، لا كقطع منفصلة
    if(S.placed['stem']){
      const rootsO = ORGANS.find(o=>o.id==='roots'), flowerO = ORGANS.find(o=>o.id==='flower');
      const x0 = ORGANS.find(o=>o.id==='stem').zone.x*w;
      const yBottom = rootsO.zone.y*h, yTop = flowerO.zone.y*h;
      c.save();
      c.strokeStyle='#5F9E52'; c.lineWidth=Math.max(4,w*0.012); c.lineCap='round';
      c.beginPath(); c.moveTo(x0,yBottom); c.lineTo(x0,yTop); c.stroke();
      c.restore();
    }

    // أدلّة الأهداف (Ghost Targets): تُظهر بوضوح أين يجب أن يوضع كل جزء قبل إفلاته
    ORGANS.forEach(o=>{
      if(S.placed[o.id]) return;
      const zx=o.zone.x*w, zy=o.zone.y*h;
      c.save();
      c.setLineDash([6,5]);
      c.lineWidth = 2.5;
      c.strokeStyle = S.dragId ? g7pAccent(dark) : g7pMut(dark);
      c.globalAlpha = S.dragId ? 0.85 : 0.45;
      c.beginPath(); c.arc(zx, zy, w*0.06, 0, Math.PI*2); c.stroke();
      c.setLineDash([]);
      c.globalAlpha = 0.6;
      c.fillStyle = g7pMut(dark); c.font=`${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
      c.fillText(o.label, zx, zy + w*0.06 + h*0.026);
      c.restore();
    });

    // الأعضاء الموضوعة في مكانها
    ORGANS.forEach(o=>{
      if(S.placed[o.id]){
        drawOrgan(c, o, o.zone.x*w, o.zone.y*h, w, h, 1);
        if(S.infoOrgan===o.id){
          c.save(); c.globalAlpha=0.25; c.fillStyle=g7pAccent(dark);
          c.beginPath(); c.arc(o.zone.x*w, o.zone.y*h, w*0.075, 0, Math.PI*2); c.fill(); c.restore();
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
      c.beginPath(); c.arc(hx,hy,w*0.05,0,Math.PI*2); c.fill();
      c.restore();
      drawOrgan(c, o, hx, hy, w, h, 0.7);
      c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
      c.fillText(o.label, hx, hy+h*0.09);
    });

    // العنصر المسحوب حالياً (يُرسم فوق كل شيء، متتبّعاً إصبع/مؤشر الطالبة)
    if(S.dragId){
      const o = ORGANS.find(x=>x.id===S.dragId);
      drawOrgan(c, o, S.dragX, S.dragY, w, h, 0.8);
    }

    if(!S.done){
      c.fillStyle = g7pMut(dark); c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
      c.fillText(`اكتمل ${Object.keys(S.placed).length} من ٤ 🌱`, w/2, h*0.95);
    } else if(S.successT > 0){
      // تأثير نجاح بسيط: توهّج + جسيمات خضراء صاعدة حول النبتة المكتملة
      S.successT--;
      const cx = w*0.5, cy = h*0.5;
      c.save();
      c.globalAlpha = Math.min(1, S.successT/40) * 0.35;
      c.fillStyle = '#4ADE80';
      c.beginPath(); c.arc(cx, cy, w*0.32, 0, Math.PI*2); c.fill();
      c.restore();
      if(!S.sparkles) S.sparkles = Array.from({length:14}, ()=>({ x: w*(0.3+Math.random()*0.4), y: h*(0.9), vy: 1+Math.random()*1.5, drift:(Math.random()-0.5)*0.6, life: 60+Math.random()*40 }));
      c.save();
      S.sparkles.forEach(sp=>{
        sp.y -= sp.vy; sp.x += sp.drift; sp.life--;
        if(sp.life<=0) return;
        c.globalAlpha = Math.max(0, sp.life/100);
        c.fillStyle='#22C55E'; c.font=`${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
        c.fillText('✨', sp.x, sp.y);
      });
      c.restore();
    }

    // شريط العنوان — يُرسم أخيراً وفوق كل شيء لضمان عدم تغطيته أبداً
    c.save();
    c.fillStyle = dark ? 'rgba(11,26,16,0.92)' : 'rgba(240,250,243,0.92)';
    c.fillRect(0,0,w,h*0.12);
    c.fillStyle = g7pTxt(dark);
    c.font = `bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ١-١ · ابنِ النبات', w/2, h*0.06);
    c.restore();

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
    { id:'sepal',  label:'سبلات',  func:'تحيط بالزهرة وتحميها قبل أن تتفتّح.', home:{x:0.12,y:0.28} },
    { id:'petal',  label:'بتلات',  func:'عادةً أكثر جزء ملوّن في الزهرة، وتجذب الحشرات والطيور.', home:{x:0.88,y:0.28} },
    { id:'stamen', label:'أسدية (المتك والخيط)', func:'الجزء الذكري؛ يحتوي المتك على حبوب اللقاح التي تضمّ الأمشاج الذكرية.', home:{x:0.12,y:0.60} },
    { id:'ovary',  label:'مبيض',   func:'يحتوي البويضات التي تضمّ الأمشاج الأنثوية.', home:{x:0.88,y:0.60} },
    { id:'stigst', label:'ميسم وقلم', func:'الميسم يستقبل حبوب اللقاح، ويصلها القلم بالمبيض.', home:{x:0.5,y:0.88} },
  ];
  const HINTS = {
    sepal:  'فكّري: أيّ جزء يحيط بالزهرة من الخارج قبل أن تتفتّح؟',
    petal:  'فكّري: أيّ جزء عادةً يكون أكثر جزء ملوّناً في الزهرة؟',
    stamen: 'فكّري: أين تجدين حبوب اللقاح في الزهرة؟',
    ovary:  'فكّري: أين توجد البويضات داخل الزهرة؟',
    stigst: 'فكّري: أيّ جزء يستقبل حبوب اللقاح في أعلى الزهرة؟',
  };
  const CENTER = {x:0.5, y:0.46}; // مركز الزهرة الموحّد — كل الأجزاء تُبنى هنا فوق بعضها
  simState = { placed:{}, placedAt:{}, dragId:null, dragX:0, dragY:0, hint:'', hintT:0, done:false, frameCount:0 };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    const n = Object.keys(S.placed).length;
    if(!S.done){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🌸 استقصاء: ركّبي أجزاء الزهرة</div></div>
        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:10px">اسحبي كل جزء إلى مركز الزهرة (${n} من ٥)</div>
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
    S.placed={}; S.placedAt={}; S.dragId=null; S.hint=''; S.hintT=0; S.done=false;
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
    const w=cv.width,h=cv.height, zx=CENTER.x*w, zy=CENTER.y*h;
    if(Math.hypot(S.dragX-zx,S.dragY-zy) < w*0.16){
      S.placed[o.id]=true; S.placedAt[o.id]=S.frameCount; _g8pPlayDrop();
      if(Object.keys(S.placed).length===PARTS.length){ S.done=true; }
      controls(renderControls());
    } else {
      _g8pPlayClick(); S.hint=HINTS[o.id]; S.hintT=120;
      controls(renderControls());
    }
    S.dragId=null;
  }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;
  cv.onclick=null;

  function drawPickupPart(c,o,x,y,w,h,scale){
    c.save(); c.translate(x,y); c.scale(scale,scale);
    if(o.id==='sepal'){
      c.fillStyle='#4D7C3A';
      [-0.3,0.3].forEach(a=>{ c.save(); c.rotate(a);
        c.beginPath(); c.ellipse(0,-w*0.06,w*0.018,w*0.06,0,0,Math.PI*2); c.fill(); c.restore(); });
    } else if(o.id==='petal'){
      c.fillStyle='#F472B6'; c.strokeStyle='#9D174D'; c.lineWidth=1.2;
      [-0.35,0.35].forEach(a=>{ c.save(); c.rotate(a);
        c.beginPath(); c.ellipse(0,-w*0.05,w*0.026,w*0.05,0,0,Math.PI*2); c.fill(); c.stroke(); c.restore(); });
    } else if(o.id==='stamen'){
      c.fillStyle='#FDE047'; c.strokeStyle='#CA8A04'; c.lineWidth=1;
      [-0.25,0.25].forEach(a=>{ c.save(); c.rotate(a);
        c.beginPath(); c.moveTo(0,0); c.lineTo(0,-w*0.055); c.stroke();
        c.beginPath(); c.ellipse(0,-w*0.06,w*0.012,w*0.018,0,0,Math.PI*2); c.fill(); c.restore(); });
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

  // ترسم الزهرة كوحدة واحدة متماسكة، وتُظهر فقط الأجزاء التي تمّ وضعها فعلاً — كل جزء "ينبثق" في مكانه الصحيح بمجرّد إسقاطه
  function drawFlowerAssembly(c,cx,cy,w,h,dark){
    function partScale(id){
      if(!S.placed[id]) return 0;
      const age = S.frameCount - (S.placedAt[id]||0);
      return Math.min(1, age/14);
    }
    c.save(); c.translate(cx,cy);
    // السبلات (خلف البتلات)
    if(S.placed.sepal){
      const sc=partScale('sepal'); c.save(); c.scale(sc,sc);
      c.fillStyle='#4D7C3A';
      for(let i=0;i<5;i++){ const a=i/5*Math.PI*2+0.15; c.save(); c.rotate(a);
        c.beginPath(); c.ellipse(0,-w*0.075,w*0.02,w*0.075,0,0,Math.PI*2); c.fill(); c.restore(); }
      c.restore();
    }
    // البتلات
    if(S.placed.petal){
      const sc=partScale('petal'); c.save(); c.scale(sc,sc);
      c.fillStyle='#F472B6'; c.strokeStyle='#9D174D'; c.lineWidth=1.4;
      for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; c.save(); c.rotate(a);
        c.beginPath(); c.ellipse(0,-w*0.06,w*0.03,w*0.06,0,0,Math.PI*2); c.fill(); c.stroke(); c.restore(); }
      c.restore();
    }
    // الأسدية
    if(S.placed.stamen){
      const sc=partScale('stamen'); c.save(); c.scale(sc,sc);
      c.strokeStyle='#CA8A04'; c.lineWidth=Math.max(1,w*0.003);
      for(let i=0;i<6;i++){ const a=i/6*Math.PI*2+0.5; c.save(); c.rotate(a);
        c.beginPath(); c.moveTo(0,0); c.lineTo(0,-w*0.038); c.stroke();
        c.fillStyle='#FDE047'; c.strokeStyle='#CA8A04'; c.lineWidth=1;
        c.beginPath(); c.ellipse(0,-w*0.042,w*0.011,w*0.016,0,0,Math.PI*2); c.fill(); c.stroke();
        c.restore(); }
      c.restore();
    }
    // القلم والميسم
    if(S.placed.stigst){
      const sc=partScale('stigst'); c.save(); c.scale(sc,sc);
      c.strokeStyle='#65A30D'; c.lineWidth=Math.max(2,w*0.006);
      c.beginPath(); c.moveTo(0,0); c.lineTo(0,-w*0.05); c.stroke();
      c.fillStyle='#A3E635'; c.strokeStyle='#3F6212'; c.lineWidth=1;
      c.beginPath(); c.arc(0,-w*0.055,w*0.012,0,Math.PI*2); c.fill(); c.stroke();
      c.restore();
    }
    // المبيض في القاعدة
    if(S.placed.ovary){
      const sc=partScale('ovary'); c.save(); c.scale(sc,sc);
      c.fillStyle='#84CC16'; c.strokeStyle='#3F6212'; c.lineWidth=1.5;
      c.beginPath(); c.ellipse(0,w*0.015,w*0.032,w*0.026,0,0,Math.PI*2); c.fill(); c.stroke();
      c.restore();
    }
    // نقطة استقبال مركزية خافتة تظهر قبل وضع أي جزء — لتوضيح أين يُسقَط كل جزء
    if(Object.keys(S.placed).length===0){
      c.save(); c.globalAlpha=0.35; c.strokeStyle=g7pMut(dark); c.setLineDash([5,4]); c.lineWidth=2;
      c.beginPath(); c.arc(0,0,w*0.05,0,Math.PI*2); c.stroke(); c.restore();
    }
    c.restore();
  }

  function draw(){
    if(currentSim!=='g7bio1n2' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7pBg(dark); c.fillRect(0,0,w,h);
    if(S.hintT>0) S.hintT--;
    S.frameCount++;

    const cx=w*CENTER.x, cy=h*CENTER.y;

    // ساق ثابتة من مركز الزهرة إلى أسفل الشاشة — تظهر من البداية لتوضيح بنية النبات
    c.strokeStyle='#5F9E52'; c.lineWidth=Math.max(4,w*0.012); c.lineCap='round';
    c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx,h*0.98); c.stroke();

    // منطقة الهدف المركزية (تظهر فقط أثناء السحب لتوجيه الطالبة)
    if(!S.done && S.dragId){
      c.save(); c.setLineDash([6,5]); c.lineWidth=2.5;
      c.strokeStyle=g7pAccent(dark); c.globalAlpha=0.85;
      c.beginPath(); c.arc(cx,cy,w*0.09,0,Math.PI*2); c.stroke();
      c.setLineDash([]); c.globalAlpha=0.7;
      c.fillStyle=g7pAccent(dark); c.font=`${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
      c.fillText('أفلتيه هنا', cx, cy - w*0.09 - h*0.018);
      c.restore();
    }

    // الزهرة المُجمَّعة تُرسم دائماً في المركز، وتنمو جزءاً بجزء
    drawFlowerAssembly(c, cx, cy, w, h, dark);

    if(!S.done){
      // القطع غير الموضوعة بعد — تظهر في مواقعها الأصلية على الأطراف كعناصر قابلة للسحب
      PARTS.forEach(o=>{
        if(S.placed[o.id] || S.dragId===o.id) return;
        const hx=o.home.x*w, hy=o.home.y*h;
        c.save(); c.fillStyle=dark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)';
        c.beginPath(); c.arc(hx,hy,w*0.06,0,Math.PI*2); c.fill(); c.restore();
        drawPickupPart(c,o,hx,hy,w,h,0.85);
        c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
        c.fillText(o.label, hx, hy+h*0.08);
      });
      if(S.dragId){ const o=PARTS.find(x=>x.id===S.dragId); drawPickupPart(c,o,S.dragX,S.dragY,w,h,0.95); }
    }

    // شريط العنوان — أخيراً وفوق كل شيء
    c.save();
    c.fillStyle = dark ? 'rgba(11,26,16,0.92)' : 'rgba(240,250,243,0.92)';
    c.fillRect(0,0,w,h*0.12);
    c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ٢-١ · ركّبي أجزاء الزهرة', w/2, h*0.06);
    c.restore();

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
  // مواضع بطاقات الأسماء — موزّعة حول الزهرة من الخارج، بلا تقاطع، كل بطاقة على جهة مختلفة
  function labelSlot(id, cx, cy, R){
    switch(id){
      case 'petal':    return { x: cx - R*1.35, y: cy - R*1.05, align:'right' };
      case 'sepal':    return { x: cx + R*1.35, y: cy - R*0.85, align:'left'  };
      case 'anther':   return { x: cx + R*1.45, y: cy - R*0.15, align:'left'  };
      case 'filament': return { x: cx + R*1.3,  y: cy + R*0.45, align:'left'  };
      case 'stigma':   return { x: cx,          y: cy - R*1.42, align:'center' };
      case 'style':    return { x: cx - R*1.45, y: cy - R*0.1,  align:'right' };
      case 'ovary':    return { x: cx,          y: cy + R*1.25, align:'center' };
    }
  }
  const S = simState = { mode:'explore', selected:null, riddleIdx:0, riddleOrder:[], wrongPick:null, score:0 };
  const cv = document.getElementById('simCanvas');
  function shuffle(arr){ const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

  // نقطة تقاطع شعاع خارج من مركز المستطيل (البطاقة) باتّجاه dx,dy مع حافّة المستطيل تماماً — تضمن توقّف الخط عند الحافة دون أي تغطية للنصّ
  function rectEdgePoint(ccx,ccy,halfW,halfH,dx,dy){
    if(dx===0 && dy===0) return {x:ccx,y:ccy};
    const tX = dx!==0 ? halfW/Math.abs(dx) : Infinity;
    const tY = dy!==0 ? halfH/Math.abs(dy) : Infinity;
    const t = Math.min(tX,tY);
    return { x: ccx+dx*t, y: ccy+dy*t };
  }

  // يحسب تخطيط كامل (مواضع الأجزاء والبطاقات) — يُستخدم في الرسم وفي كشف النقر معاً لضمان التطابق التام
  function computeLayout(w,h){
    const cx=w*0.5, cy=h*0.56, R=Math.min(w,h)*0.2;
    const c = cv.getContext('2d');
    c.font=`bold ${Math.round(h*0.0155)}px Tajawal`;
    return SPOTS.map(s=>{
      const tip = flowerAnchor(s.id, cx, cy, R);
      const slot = labelSlot(s.id, cx, cy, R);
      const tw = c.measureText(s.label).width;
      const padX=10, padY=7, cardW=tw+padX*2, cardH=h*0.028+padY;
      let cardX = slot.x, cardY = slot.y;
      if(slot.align==='left') cardX = slot.x;
      else if(slot.align==='right') cardX = slot.x - cardW;
      else cardX = slot.x - cardW/2;
      cardY -= cardH/2;
      const cardCx = cardX+cardW/2, cardCy = cardY+cardH/2;
      return { s, tip, cardX, cardY, cardW, cardH, cardCx, cardCy, R, cx, cy };
    });
  }

  function renderControls(){
    if(S.mode==='explore'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🌸 استكشفي الزهرة</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:12px">اضغطي على اسم أيّ جزء لتتعرّفي عليه.</div>
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
      <div style="font-size:12.5px;color:var(--text-secondary)">اضغطي على اسم الجزء المناسب في الصورة.</div>
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
    const layout = computeLayout(w,h);
    // النقر على بطاقة الاسم هو وسيلة الإجابة الأساسية (مساحة أوسع وأوضح من النقطة الصغيرة على الزهرة)
    let hit = null;
    for(const L of layout){
      if(p.x>=L.cardX && p.x<=L.cardX+L.cardW && p.y>=L.cardY && p.y<=L.cardY+L.cardH){ hit=L.s; break; }
    }
    // احتياطياً: يظلّ النقر مباشرةً على الجزء داخل الزهرة يعمل أيضاً
    if(!hit){
      for(const L of layout){
        if(Math.hypot(p.x-L.tip.x, p.y-L.tip.y) < w*0.032){ hit=L.s; break; }
      }
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

    // رسم زهرة كبيرة وواضحة (تقريب تخطيطي لرسم الكتاب) — أصغر وبمساحة كافية حولها للأسهم والبطاقات
    const cx=w*0.5, cy=h*0.56, R=Math.min(w,h)*0.2;
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

    // أسهم + بطاقات أسماء موزّعة حول الزهرة — كل سهم ينطلق من الجزء نفسه ويشير إلى بطاقة اسمه (بلا أي تغطية للنص)
    const layout = computeLayout(w,h);
    layout.forEach(L=>{
      const s = L.s, tip = L.tip, cardCx=L.cardCx, cardCy=L.cardCy, cardW=L.cardW, cardH=L.cardH, cardX=L.cardX, cardY=L.cardY;
      const isSel = (S.mode==='explore' && S.selected===s.id) || (S.mode==='quiz' && S.wrongPick===s.id);
      const wasRight = S.mode==='quiz' && S.riddleOrder.slice(0,S.riddleIdx).includes(s.id);
      const col = isSel ? (S.mode==='quiz' && S.wrongPick===s.id ? '#DC2626' : '#22C55E') : (wasRight ? g7pAccent(dark) : (dark?'#8FBF9E':'#3D6B4A'));

      // اتّجاه السهم: من الجزء في الزهرة إلى بطاقة اسمه (يشير مباشرة نحو الاسم)
      const dx = cardCx-tip.x, dy = cardCy-tip.y, dist=Math.hypot(dx,dy)||1;
      // نقطة البداية: حافة الجزء نفسه (مُبعدة قليلاً عن مركزه)
      const startX = tip.x + (dx/dist) * (w*0.014);
      const startY = tip.y + (dy/dist) * (w*0.014);
      // نقطة النهاية: تتوقّف تماماً عند حافّة البطاقة (تقاطع هندسي دقيق) مع هامش إضافي — لا تلامس النص أبداً
      const edge = rectEdgePoint(cardCx, cardCy, cardW/2, cardH/2, tip.x-cardCx, tip.y-cardCy);
      const gap = w*0.008;
      const endXFinal = edge.x - (dx/dist)*gap;
      const endYFinal = edge.y - (dy/dist)*gap;

      c.save();
      c.strokeStyle = col; c.lineWidth = Math.max(1.5, w*0.0035); c.lineCap='round';
      c.beginPath(); c.moveTo(startX,startY); c.lineTo(endXFinal,endYFinal); c.stroke();
      // رأس السهم عند نهاية الخط قرب البطاقة — يشير نحو اسم الجزء
      const ang = Math.atan2(endYFinal-startY, endXFinal-startX);
      const ahL = w*0.016;
      c.beginPath();
      c.moveTo(endXFinal,endYFinal);
      c.lineTo(endXFinal - ahL*Math.cos(ang-0.4), endYFinal - ahL*Math.sin(ang-0.4));
      c.lineTo(endXFinal - ahL*Math.cos(ang+0.4), endYFinal - ahL*Math.sin(ang+0.4));
      c.closePath(); c.fillStyle=col; c.fill();
      c.restore();

      // البطاقة نفسها — قابلة للنقر مباشرة، مع تظليل واضح يدعو للضغط
      c.save();
      c.fillStyle = isSel ? (S.mode==='quiz' && S.wrongPick===s.id ? 'rgba(220,38,38,0.15)' : 'rgba(34,197,94,0.18)') : (dark?'rgba(11,26,16,0.9)':'rgba(255,255,255,0.95)');
      c.strokeStyle = col; c.lineWidth=2;
      c.beginPath(); c.roundRect(cardX,cardY,cardW,cardH,8); c.fill(); c.stroke();
      c.fillStyle = g7pTxt(dark); c.textAlign='center'; c.font=`bold ${Math.round(h*0.0155)}px Tajawal`;
      c.fillText(s.label, cardCx, cardCy + h*0.005);
      c.restore();
    });

    // شريط العنوان — أخيراً وفوق كل شيء
    c.save();
    c.fillStyle = dark ? 'rgba(11,26,16,0.92)' : 'rgba(240,250,243,0.92)';
    c.fillRect(0,0,w,h*0.12);
    c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
    c.fillText(S.mode==='explore' ? 'نشاط ٢-١ · استكشفي الزهرة' : 'نشاط ٢-١ · من أنا؟', w/2, h*0.06);
    c.restore();

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
  simState = { mode:'explore', lensOn:null, lensX:0.5, lensY:0.5, classified:{}, classifiedList:{insect:[],wind:[]}, dragTrait:null, dragX:0, dragY:0, wrong:null };
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
      // مناطق إسقاط منفصلة وواضحة لكل زهرة
      [F_INSECT,F_WIND].forEach(f=>{
        c.save();
        c.setLineDash([6,5]); c.lineWidth=2;
        c.strokeStyle = dark?'rgba(255,255,255,0.18)':'rgba(0,0,0,0.12)';
        c.beginPath(); c.roundRect(f.x*w-w*0.19, h*0.58, w*0.38, h*0.34, 12); c.stroke();
        c.setLineDash([]);
        c.fillStyle=g7pMut(dark); c.font=`${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
        c.fillText('منطقة خصائص '+f.label, f.x*w, h*0.565);
        c.restore();
      });
      // بطاقات الخصائص المصنَّفة أسفل كل زهرة — مكدَّسة عمودياً بلا أي تراكب
      [F_INSECT,F_WIND].forEach(f=>{
        const fKey = f===F_INSECT ? 'insect' : 'wind';
        const items = TRAITS.filter(t=>t.correct===fKey && S.classified[t.id]);
        items.forEach((t,i)=>{
          const yy = h*0.61 + i*h*0.075;
          c.save(); c.globalAlpha=0.9;
          c.fillStyle=dark?'rgba(74,222,128,0.15)':'rgba(39,174,96,0.12)'; c.strokeStyle=g7pAccent(dark); c.lineWidth=1.5;
          c.beginPath(); c.roundRect(f.x*w-w*0.17, yy, w*0.34, h*0.062, 8); c.fill(); c.stroke();
          c.fillStyle=g7pTxt(dark); c.font=`${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
          c.fillText(t.text, f.x*w, yy+h*0.038);
          c.restore();
        });
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

// ══════════════════════════════════════════════════════════
// الصف السابع — الوحدة الأولى
// نشاط ٤-١ · الإخصاب (كتاب الصف السابع ص٢٠-٢١)
// ══════════════════════════════════════════════════════════

/* ── تاب ١: رحلة حبة اللقاح ── */
function simG7Bio1N4a(){
  cancelAnimationFrame(animFrame);
  simState = { mode:'predict', predicted:null, growT:0, revealed:false, pathAns:null };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    if(S.mode==='predict'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🌼 رحلة حبة اللقاح</div></div>
        <div style="font-size:14px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px">ماذا تتوقّعين أن يحدث لحبة اللقاح بعد وصولها إلى الميسم؟</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${['ستكوّن أنبوباً يمتدّ نحو البويضة داخل المبيض','ستبقى على الميسم دون تغيير','ستسقط عن الزهرة فوراً'].map((o,i)=>`<button onclick="window._g7feStart(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">${o}</button>`).join('')}
        </div>`;
    }
    if(S.mode==='grow'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🌱 اضغطي على حبّة اللقاح</div></div>
        <div style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px">اضغطي على حبّة اللقاح الصفراء الموجودة على الميسم لتبدأ رحلتها.</div>`;
    }
    if(S.mode==='growing'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🌱 راقبي أنبوب اللقاح</div></div>
        <div style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px">ينزل المشيج الذكري داخل الأنبوب أسفل الميسم مروراً بالقلم، حتى يصل إلى البويضة داخل المبيض.</div>`;
    }
    if(S.mode==='success'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">✅ حدث الإخصاب!</div></div>
        <div style="padding:14px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(212,60,120,0.3);font-size:13px;color:var(--text-secondary);line-height:1.9;margin-bottom:12px">
          اتّحد المشيج الذكري مع المشيج الأنثوي وحدث الإخصاب، وتكوّنت خلية جديدة تُسمّى البويضة الملقّحة (الزيجوت).
        </div>
        <button class="ctrl-btn play" onclick="window._g7fePath()">➡ متابعة</button>`;
    }
    if(S.mode==='path'){
      const opts = ['الميسم ← أنبوب اللقاح ← المبيض ← البويضة','البويضة ← الميسم ← المبيض ← أنبوب اللقاح','أنبوب اللقاح ← البويضة ← الميسم ← المبيض'];
      return `
        <div class="ctrl-section"><div class="ctrl-label">🤔 ما المسار الذي اتّبعته حبّة اللقاح؟</div></div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${opts.map((o,i)=>`<button id="g7fePathOpt${i}" onclick="window._g7fePathAns(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:13px">${o}</button>`).join('')}
        </div>
        <div id="g7fePathFb" style="margin-top:10px;font-size:13px;color:var(--text-secondary);line-height:1.8"></div>`;
    }
    // done
    const predictedRight = S.predicted===0;
    return `
      <div class="ctrl-section"><div class="ctrl-label">🎉 قارني توقّعك بما حدث</div></div>
      <div style="padding:14px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(212,60,120,0.3);font-size:13px;color:var(--text-secondary);line-height:1.9">
        ${predictedRight ? 'توقّعك كان صحيحاً! ' : ''}كوّنت حبّة اللقاح أنبوباً امتدّ من الميسم حتى البويضة داخل المبيض، فحدث الإخصاب وتكوّنت البويضة الملقّحة (الزيجوت).
      </div>
      <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7feRestart()">↺ أعد التجربة</button>`;
  }
  controls(renderControls());

  window._g7feStart = function(i){ _g8pPlayClick(); S.predicted=i; S.mode='grow'; controls(renderControls()); };
  window._g7fePath = function(){ _g8pPlayClick(); S.mode='path'; controls(renderControls()); };
  window._g7fePathAns = function(i){
    if(S.pathAns!==null) return; S.pathAns=i;
    const ok = i===0; _g8pPlayClick();
    const btn = document.getElementById('g7fePathOpt'+i);
    if(btn){ btn.style.background= ok?'#27AE60':'#E74C3C'; btn.style.color='white'; btn.style.borderColor= ok?'#27AE60':'#E74C3C'; }
    if(!ok){ const okBtn=document.getElementById('g7fePathOpt0'); if(okBtn){ okBtn.style.background='#27AE60'; okBtn.style.color='white'; okBtn.style.borderColor='#27AE60'; } }
    const fb=document.getElementById('g7fePathFb'); if(fb) fb.innerHTML = ok? '✅ صحيح!' : '💡 المسار الصحيح: الميسم ← أنبوب اللقاح ← المبيض ← البويضة.';
    setTimeout(()=>{ S.mode='done'; controls(renderControls()); }, 1600);
  };
  window._g7feRestart = function(){
    S.mode='predict'; S.predicted=null; S.growT=0; S.pathAns=null;
    controls(renderControls());
  };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null;
  cv.onclick = function(e){
    if(S.mode!=='grow') return;
    const p = g7pGp(cv,e), w=cv.width, h=cv.height;
    const px = w*0.5, py = h*0.24 - w*0.05;
    if(Math.hypot(p.x-px,p.y-py) < w*0.05){
      _g8pPlayDrop(); S.mode='growing'; S.growT=0.0001; controls(renderControls());
    }
  };

  function draw(){
    if(currentSim!=='g7bio1n4' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7pBg(dark); c.fillRect(0,0,w,h);

    if(S.mode==='growing'){
      S.growT += 0.006;
      if(S.growT>=1){ S.growT=1; S.mode='success'; _g8pPlayClick(); controls(renderControls()); }
    }

    // قطاع الزهرة (تخطيطي مبسّط: ميسم أعلى، قلم، مبيض بيضاوي أسفل يحوي بويضة) — أُنزل قليلاً ليترك مساحة واضحة للعنوان
    const cx=w*0.5, stigY=h*0.24, styTop=h*0.28, styBot=h*0.62, ovY=h*0.78, ovRX=w*0.16, ovRY=h*0.13;
    c.strokeStyle='#4D7C3A'; c.lineWidth=Math.max(3,w*0.012); c.lineCap='round';
    c.beginPath(); c.moveTo(cx,styTop); c.lineTo(cx,styBot); c.stroke();
    c.fillStyle='#84CC16'; c.beginPath(); c.arc(cx,stigY,w*0.035,0,Math.PI*2); c.fill();
    c.fillStyle=g7pMut(dark); c.font=`${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
    c.fillText('ميسم', cx+w*0.09, stigY);
    c.fillText('قلم', cx+w*0.06, (styTop+styBot)/2);

    c.fillStyle='#A7D98C'; c.strokeStyle='#3F6212'; c.lineWidth=2;
    c.beginPath(); c.ellipse(cx,ovY,ovRX,ovRY,0,0,Math.PI*2); c.fill(); c.stroke();
    c.fillText('مبيض', cx-ovRX-w*0.06, ovY);

    // بويضة داخل المبيض
    const oviX=cx, oviY=ovY+ovRY*0.15;
    c.fillStyle='#E5F3D8'; c.strokeStyle='#65A30D'; c.lineWidth=1.5;
    c.beginPath(); c.ellipse(oviX,oviY,w*0.045,h*0.035,0,0,Math.PI*2); c.fill(); c.stroke();
    c.fillStyle=g7pMut(dark); c.font=`${Math.round(h*0.013)}px Tajawal`;
    c.fillText('بويضة', oviX, oviY+h*0.06);

    // حبّة اللقاح: تبقى ثابتة فوق الميسم طوال الوقت — لا تتحرّك ولا تتحوّل إلى الأنبوب
    const grainY = stigY - w*0.05;
    c.save();
    c.fillStyle='#FDE047'; c.strokeStyle='#CA8A04'; c.lineWidth=2;
    c.beginPath(); c.arc(cx, grainY, w*0.026, 0, Math.PI*2); c.fill(); c.stroke();
    // أشواك دقيقة صغيرة على سطح الحبة لتمييزها بصرياً عن الأنبوب الملساء
    c.strokeStyle='#CA8A04'; c.lineWidth=1;
    for(let k=0;k<8;k++){ const a=k/8*Math.PI*2; c.beginPath(); c.moveTo(cx+Math.cos(a)*w*0.026, grainY+Math.sin(a)*w*0.026); c.lineTo(cx+Math.cos(a)*w*0.034, grainY+Math.sin(a)*w*0.034); c.stroke(); }
    c.restore();
    if(S.mode==='predict' || S.mode==='grow'){
      c.fillStyle=g7pMut(dark); c.font=`${Math.round(h*0.013)}px Tajawal`; c.textAlign='center';
      c.fillText('حبّة اللقاح', cx-w*0.09, grainY);
      if(S.mode==='grow'){
        c.fillStyle=g7pAccent(dark); c.font=`bold ${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
        c.fillText('👆 اضغطي هنا', cx, grainY-h*0.06);
      }
    } else {
      c.fillStyle=g7pMut(dark); c.font=`${Math.round(h*0.012)}px Tajawal`; c.textAlign='center';
      c.fillText('حبّة اللقاح (ثابتة)', cx-w*0.11, grainY);
    }

    // أنبوب اللقاح: تركيب منفصل تماماً عن حبّة اللقاح، ينمو تدريجياً من أسفل الحبة وحتى البويضة
    if(S.mode==='growing' || S.mode==='success' || S.mode==='path' || S.mode==='done'){
      const t = S.mode==='growing' ? S.growT : 1;
      const tubeStartY = stigY;
      const tubeEndY = tubeStartY + (oviY-tubeStartY)*t;
      c.strokeStyle='#F59E0B'; c.lineWidth=Math.max(2.5,w*0.007); c.lineCap='round';
      c.beginPath(); c.moveTo(cx,tubeStartY); c.lineTo(cx,tubeEndY); c.stroke();
      if(S.mode==='growing'){
        c.fillStyle=g7pMut(dark); c.font=`${Math.round(h*0.012)}px Tajawal`; c.textAlign='center';
        c.fillText('أنبوب اللقاح ينمو ↓', cx+w*0.1, (tubeStartY+tubeEndY)/2);
      }
      // المشيج الذكري (نقطة) عند رأس الأنبوب النامي
      c.fillStyle='#F59E0B'; c.beginPath(); c.arc(cx,tubeEndY,w*0.012,0,Math.PI*2); c.fill();

      if(t>=1){
        const glow = S.mode==='growing' ? 0 : 1;
        c.save(); c.globalAlpha=0.7*glow;
        c.fillStyle='#FBBF24'; c.beginPath(); c.arc(oviX,oviY,w*0.055,0,Math.PI*2); c.fill();
        c.restore();
      }
    }

    // شريط العنوان — يُرسم أخيراً وفوق كل شيء
    c.save();
    c.fillStyle = dark ? 'rgba(11,26,16,0.92)' : 'rgba(240,250,243,0.92)';
    c.fillRect(0,0,w,h*0.12);
    c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ٤-١ · رحلة حبّة اللقاح', w/2, h*0.06);
    c.restore();

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ── تاب ٢: من بويضة إلى بذرة (ترتيب زمني) ── */
function simG7Bio1N4b(){
  cancelAnimationFrame(animFrame);
  const STAGES = [
    { id:'ovule', label:'بويضة', order:0, desc:'قبل الإخصاب، داخل المبيض.' },
    { id:'zygote', label:'بويضة ملقّحة (زيجوت)', order:1, desc:'بعد اتّحاد المشيجين.' },
    { id:'embryo', label:'جنين', order:2, desc:'مجموعة صغيرة من الخلايا تنتج من انقسام الزيجوت.' },
    { id:'seed', label:'بذرة', order:3, desc:'تتحوّل إليها البويضة تدريجياً، وبداخلها الجنين.' },
  ];
  simState = { placed:{}, dragId:null, dragX:0, dragY:0, hint:'', hintT:0, done:false, revealed:false, predictAns:null, seedOpenT:0, seedOpen:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const HOMES = [ {x:0.15,y:0.20}, {x:0.85,y:0.20}, {x:0.15,y:0.42}, {x:0.85,y:0.42} ];
  // ترتيب عشوائي للبطاقات في مواضع البداية (لا يفسد الحل، فقط أيّ بطاقة في أيّ موضع بداية)
  const SHUFFLED = [...STAGES].sort(()=>Math.random()-0.5);

  function slotPos(i,w,h){ return { x: w*(0.18+i*0.22), y: h*0.72 }; }

  function renderControls(){
    const n = Object.keys(S.placed).length;
    if(!S.done){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🌰 من بويضة إلى بذرة</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:10px">اسحبي البطاقات إلى خطّ الزمن بترتيبها الصحيح (${n} من ٤)</div>
        ${S.hintT>0 ? `<div style="font-size:13px;color:#D97706;background:#FEF3C7;border-radius:8px;padding:10px">💡 ${S.hint}</div>` : ''}`;
    }
    if(!S.revealed){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🎉 أحسنتِ! الترتيب صحيح</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:10px">اضغطي الزر لمشاهدة التحوّل التدريجي حتى تكوّن البذرة.</div>
        <button class="ctrl-btn play" onclick="window._g7seedReveal()">🔎 اضغطي لتستكشفي كيف تتكوّن البذرة</button>`;
    }
    if(S.predictAns===null){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🌰 البذرة</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:10px">اضغطي على البذرة في الصورة لتفتحيها وتشاهدي ما بداخلها.</div>
        <div style="font-size:14px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px">🤔 توقّعي: إذا لم يحدث الإخصاب، هل ستتكوّن البذرة بالطريقة نفسها؟</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${['نعم، ستتكوّن بنفس الطريقة','لا، لن تتكوّن البذرة دون إخصاب'].map((o,i)=>`<button onclick="window._g7seedPredict(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">${o}</button>`).join('')}
        </div>`;
    }
    const ok = S.predictAns===1;
    return `
      <div class="ctrl-section"><div class="ctrl-label">${ok?'✅ صحيح!':'💡 التوضيح'}</div></div>
      <div style="padding:14px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(212,60,120,0.3);font-size:13px;color:var(--text-secondary);line-height:1.9">
        بدون إخصاب لا يتكوّن الزيجوت، وبالتالي لا يتكوّن الجنين ولا البذرة — فالإخصاب خطوة ضرورية لتكوين البذرة.
      </div>
      <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7seedRestart()">↺ أعد النشاط</button>`;
  }
  controls(renderControls());

  window._g7seedReveal = function(){ _g8pPlayClick(); S.revealed=true; controls(renderControls()); };
  window._g7seedPredict = function(i){ _g8pPlayClick(); S.predictAns=i; controls(renderControls()); };
  window._g7seedRestart = function(){
    S.placed={}; S.dragId=null; S.hint=''; S.hintT=0; S.done=false; S.revealed=false; S.predictAns=null;
    controls(renderControls());
  };

  function hitCard(p,w,h){
    for(let i=0;i<SHUFFLED.length;i++){
      const st = SHUFFLED[i];
      if(S.placed[st.id]!==undefined) continue;
      const pos = { x:w*HOMES[i].x, y:h*HOMES[i].y };
      if(Math.abs(p.x-pos.x)<w*0.11 && Math.abs(p.y-pos.y)<h*0.06) return st;
    }
    return null;
  }
  function onDown(e){ if(S.done) return; const p=g7pGp(cv,e); const st=hitCard(p,cv.width,cv.height); if(st){ S.dragId=st.id; S.dragX=p.x; S.dragY=p.y; } }
  function onMove(e){ if(!S.dragId) return; e.preventDefault && e.preventDefault(); const p=g7pGp(cv,e); S.dragX=p.x; S.dragY=p.y; }
  function onUp(){
    if(!S.dragId) return;
    const st = STAGES.find(x=>x.id===S.dragId);
    const w=cv.width,h=cv.height;
    let nearestSlot=-1, nearestDist=Infinity;
    for(let i=0;i<4;i++){ const sp=slotPos(i,w,h); const d=Math.hypot(S.dragX-sp.x,S.dragY-sp.y); if(d<nearestDist){nearestDist=d;nearestSlot=i;} }
    const slotTaken = Object.values(S.placed).includes(nearestSlot);
    if(nearestDist < w*0.11 && !slotTaken){
      if(nearestSlot===st.order){
        S.placed[st.id]=nearestSlot; _g8pPlayDrop();
        if(Object.keys(S.placed).length===4) S.done=true;
      } else {
        _g8pPlayClick(); S.hint='ليست هذه المرحلة الصحيحة هنا — فكّري بالتسلسل الزمني.'; S.hintT=120;
      }
    }
    S.dragId=null; controls(renderControls());
  }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;
  cv.onclick = function(e){
    if(!S.revealed) return;
    const p = g7pGp(cv,e), w=cv.width, h=cv.height;
    if(Math.hypot(p.x-w*0.5,p.y-h*0.5) < Math.min(w,h)*0.28){
      _g8pPlayClick(); S.seedOpen = !S.seedOpen;
    }
  };

  function drawStageIcon(c,id,x,y,w,h,scale){
    c.save(); c.translate(x,y); c.scale(scale,scale);
    if(id==='ovule'){ c.fillStyle='#E5F3D8'; c.strokeStyle='#65A30D'; c.lineWidth=1.5; c.beginPath(); c.ellipse(0,0,w*0.035,h*0.028,0,0,Math.PI*2); c.fill(); c.stroke(); }
    else if(id==='zygote'){ c.fillStyle='#FBBF24'; c.beginPath(); c.arc(0,0,w*0.022,0,Math.PI*2); c.fill(); }
    else if(id==='embryo'){ c.fillStyle='#A7D98C'; c.strokeStyle='#3F6212'; c.lineWidth=1.5; c.beginPath(); c.ellipse(0,0,w*0.03,h*0.03,0,0,Math.PI*2); c.fill(); c.stroke();
      c.strokeStyle='#166534'; c.lineWidth=1.5; c.beginPath(); c.arc(0,0,w*0.014,0.2,2.8); c.stroke(); }
    else { c.fillStyle='#C4A374'; c.strokeStyle='#7C5A32'; c.lineWidth=1.5; c.beginPath(); c.ellipse(0,0,w*0.035,h*0.03,0,0,Math.PI*2); c.fill(); c.stroke(); }
    c.restore();
  }

  function draw(){
    if(currentSim!=='g7bio1n4' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7pBg(dark); c.fillRect(0,0,w,h);
    if(S.hintT>0) S.hintT--;

    if(!S.revealed){
      // خط الزمن + الأهداف
      c.strokeStyle=g7pMut(dark); c.lineWidth=2; c.setLineDash([6,5]);
      c.beginPath(); c.moveTo(w*0.12,h*0.72); c.lineTo(w*0.9,h*0.72); c.stroke(); c.setLineDash([]);
      for(let i=0;i<4;i++){
        const sp = slotPos(i,w,h);
        const filledStage = STAGES.find(s=>S.placed[s.id]===i);
        c.save();
        c.strokeStyle = S.dragId ? g7pAccent(dark) : g7pMut(dark); c.lineWidth=2.5; c.setLineDash([5,4]);
        c.beginPath(); c.arc(sp.x,sp.y,w*0.05,0,Math.PI*2); c.stroke(); c.setLineDash([]);
        c.restore();
        if(filledStage){ drawStageIcon(c,filledStage.id,sp.x,sp.y,w,h,1.3);
          c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
          c.fillText(filledStage.label, sp.x, sp.y+h*0.08);
        } else {
          c.fillStyle=g7pMut(dark); c.font=`${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
          c.fillText(i+1, sp.x, sp.y+h*0.005);
        }
      }
      // البطاقات غير الموضوعة
      SHUFFLED.forEach((st,i)=>{
        if(S.placed[st.id]!==undefined || S.dragId===st.id) return;
        const pos={x:w*HOMES[i].x,y:h*HOMES[i].y};
        c.save(); c.fillStyle=dark?'rgba(255,255,255,0.07)':'rgba(255,255,255,0.75)'; c.strokeStyle=g7pMut(dark); c.lineWidth=1.5;
        c.beginPath(); c.roundRect(pos.x-w*0.11,pos.y-h*0.05,w*0.22,h*0.1,10); c.fill(); c.stroke();
        drawStageIcon(c,st.id,pos.x-w*0.06,pos.y,w,h,0.9);
        c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
        c.fillText(st.label, pos.x+w*0.03, pos.y+h*0.006);
        c.restore();
      });
      if(S.dragId){
        const st=STAGES.find(x=>x.id===S.dragId);
        c.save(); c.fillStyle='rgba(74,222,128,0.2)'; c.strokeStyle=g7pAccent(dark); c.lineWidth=2;
        c.beginPath(); c.roundRect(S.dragX-w*0.11,S.dragY-h*0.05,w*0.22,h*0.1,10); c.fill(); c.stroke();
        drawStageIcon(c,st.id,S.dragX-w*0.06,S.dragY,w,h,0.9);
        c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
        c.fillText(st.label, S.dragX+w*0.03, S.dragY+h*0.006);
        c.restore();
      }
    } else {
      // محاكاة تفاعلية: بذرة واقعية مغلقة، تنفتح عند الضغط عليها لتكشف الجنين بداخلها
      const cx=w*0.5, cy=h*0.52, R=Math.min(w,h)*0.24;
      S.seedOpenT += (S.seedOpen ? 1 : -1) * 0.06;
      S.seedOpenT = Math.max(0, Math.min(1, S.seedOpenT));
      const openT = S.seedOpenT;

      if(openT < 0.98){
        // البذرة مغلقة (أو في طور الانفتاح): شكل بذرة بيضاوي واقعي بقشرة بنية وخط انشقاق طبيعي (النقير)
        c.save(); c.globalAlpha = 1 - openT*0.9;
        c.fillStyle='#8B6039'; c.strokeStyle='#5C3E22'; c.lineWidth=2.5;
        c.beginPath(); c.ellipse(cx,cy,R,R*0.72,0,0,Math.PI*2); c.fill(); c.stroke();
        // تظليل خفيف لإعطاء بُعد وواقعية
        c.save(); c.clip();
        c.fillStyle='rgba(0,0,0,0.12)'; c.beginPath(); c.ellipse(cx+R*0.3,cy+R*0.15,R*0.9,R*0.6,0,0,Math.PI*2); c.fill();
        c.fillStyle='rgba(255,255,255,0.15)'; c.beginPath(); c.ellipse(cx-R*0.3,cy-R*0.25,R*0.5,R*0.3,0,0,Math.PI*2); c.fill();
        c.restore();
        // خط الانشقاق الطبيعي في المنتصف
        c.strokeStyle='#5C3E22'; c.lineWidth=1.5; c.setLineDash([3,3]);
        c.beginPath(); c.moveTo(cx,cy-R*0.7); c.lineTo(cx,cy+R*0.7); c.stroke(); c.setLineDash([]);
        c.restore();
      }
      if(openT > 0.02){
        // البذرة مفتوحة: نصفان (فلقتان) تنكشفان عن الجنين بينهما
        const gap = R*0.55*openT;
        [-1,1].forEach(side=>{
          c.save(); c.globalAlpha = openT;
          c.translate(cx+side*gap*0.5, cy);
          c.rotate(side*0.18*openT);
          c.fillStyle='#A9784B'; c.strokeStyle='#5C3E22'; c.lineWidth=2;
          c.beginPath();
          c.moveTo(0,-R*0.7);
          c.quadraticCurveTo(side*R*0.9,-R*0.3, side*R*0.55,0);
          c.quadraticCurveTo(side*R*0.9,R*0.3, 0,R*0.7);
          c.closePath(); c.fill(); c.stroke();
          c.restore();
        });
        // الجنين النباتي في المنتصف
        c.save(); c.globalAlpha=openT;
        c.fillStyle='#DCEFC4'; c.strokeStyle='#3F6212'; c.lineWidth=2;
        c.beginPath(); c.ellipse(cx,cy,R*0.22,R*0.42,0,0,Math.PI*2); c.fill(); c.stroke();
        c.strokeStyle='#4D7C3A'; c.lineWidth=Math.max(2,R*0.045);
        c.beginPath(); c.moveTo(cx,cy+R*0.3); c.lineTo(cx,cy-R*0.05); c.stroke();
        c.fillStyle='#8FBF6B'; c.beginPath(); c.ellipse(cx-R*0.1,cy-R*0.18,R*0.1,R*0.16,-0.4,0,Math.PI*2); c.fill();
        c.beginPath(); c.ellipse(cx+R*0.1,cy-R*0.18,R*0.1,R*0.16,0.4,0,Math.PI*2); c.fill();
        c.restore();
        if(openT>0.9){
          c.fillStyle=g7pTxt(dark); c.font=`${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
          c.fillText('الجنين النباتي', cx, cy+R*0.8+h*0.03);
        }
      }
      c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.017)}px Tajawal`; c.textAlign='center';
      c.fillText(S.seedOpen ? 'بذرة مفتوحة 🌱' : 'بذرة مكتملة 🌰 — اضغطي لفتحها', cx, cy-R-h*0.04);
      c.save();
      c.fillStyle = dark ? 'rgba(11,26,16,0.92)' : 'rgba(240,250,243,0.92)';
      c.fillRect(0,0,w,h*0.12);
      c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
      c.fillText('نشاط ٤-١ · من بويضة إلى بذرة', w/2, h*0.06);
      c.restore();
      animFrame = requestAnimationFrame(draw);
      return;
    }

    c.save();
    c.fillStyle = dark ? 'rgba(11,26,16,0.92)' : 'rgba(240,250,243,0.92)';
    c.fillRect(0,0,w,h*0.12);
    c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ٤-١ · من بويضة إلى بذرة', w/2, h*0.06);
    c.restore();

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// الصف السابع — الوحدة الأولى
// نشاط ٥-١ · الثمار (كتاب الصف السابع ص٢٢-٢٣)
// ══════════════════════════════════════════════════════════

/* ── تاب ١: إلى أين ستذهب البذرة؟ (تصنيف Drag & Drop) ── */
function simG7Bio1N5a(){
  cancelAnimationFrame(animFrame);
  const FRUITS = [
    { id:'hook',  label:'ثمرة شائكة',  method:'animal', desc:'أشواك تعلق بفراء الحيوانات فتُنقل معها.' },
    { id:'wing',  label:'ثمرة مجنّحة', method:'wind',   desc:'شكل مجنّح يساعدها على الطيران بفعل الرياح.' },
    { id:'float', label:'ثمرة طافية',  method:'water',  desc:'غلاف خفيف يساعدها على الطفو فوق الماء.' },
  ];
  // نخلط مواضع الثمار الأولية بحيث لا تقع أيّ ثمرة فوق وسيلة انتشارها الصحيحة — الطالب يجب أن يلاحظ الخصائص لا الموضع
  const xPositions = [0.18, 0.5, 0.82];
  let shuffledX;
  do { shuffledX = [...xPositions].sort(()=>Math.random()-0.5); }
  while(shuffledX.some((x,i)=> x === xPositions[i]));
  FRUITS.forEach((f,i)=>{ f.home = { x: shuffledX[i], y: 0.24 }; });
  const METHODS = [
    { id:'animal', label:'🐾 الحيوانات', x:0.18 },
    { id:'wind',   label:'🌬️ الرياح',   x:0.5 },
    { id:'water',  label:'💧 الماء',     x:0.82 },
  ];
  simState = { placed:{}, dragId:null, dragX:0, dragY:0, hint:'', hintT:0, done:false, animMethod:null, animT:0 };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    const n = Object.keys(S.placed).length;
    if(!S.done){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🍇 إلى أين ستذهب البذرة؟</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:10px">اسحبي كل ثمرة إلى وسيلة الانتشار المناسبة لها (${n} من ٣)</div>
        ${S.hintT>0 ? `<div style="font-size:13px;color:#D97706;background:#FEF3C7;border-radius:8px;padding:10px">💡 ${S.hint}</div>` : ''}`;
    }
    return `
      <div class="ctrl-section"><div class="ctrl-label">🎉 أحسنتِ!</div></div>
      <div style="padding:14px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(39,174,96,0.3);font-size:13px;color:var(--text-secondary);line-height:1.9">
        تتكيّف الثمار كي تساعد البذور الموجودة بداخلها على الانتشار إلى أماكن جديدة، وهذا يساعدها على تجنّب التنافس مع النبات الأصلي على الماء والضوء والأملاح المعدنية.
      </div>
      <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7frRestart()">↺ أعد النشاط</button>`;
  }
  controls(renderControls());
  window._g7frRestart = function(){
    S.placed={}; S.dragId=null; S.hint=''; S.hintT=0; S.done=false; S.animMethod=null; S.animT=0;
    controls(renderControls());
  };

  function hitFruit(p,w,h){
    for(const f of FRUITS){
      if(S.placed[f.id]) continue;
      const hx=f.home.x*w, hy=f.home.y*h;
      if(Math.hypot(p.x-hx,p.y-hy) < w*0.07) return f;
    }
    return null;
  }
  function onDown(e){ if(S.done) return; const p=g7pGp(cv,e); const f=hitFruit(p,cv.width,cv.height); if(f){ S.dragId=f.id; S.dragX=p.x; S.dragY=p.y; } }
  function onMove(e){ if(!S.dragId) return; e.preventDefault && e.preventDefault(); const p=g7pGp(cv,e); S.dragX=p.x; S.dragY=p.y; }
  function onUp(){
    if(!S.dragId) return;
    const f = FRUITS.find(x=>x.id===S.dragId);
    const w=cv.width,h=cv.height;
    let hitM=null;
    for(const m of METHODS){ if(Math.abs(S.dragX-w*m.x)<w*0.13 && Math.abs(S.dragY-h*0.72)<h*0.1){ hitM=m; break; } }
    if(hitM && hitM.id===f.method){
      S.placed[f.id]=true; _g8pPlayDrop();
      S.animMethod=f.method; S.animT=0.0001;
      if(Object.keys(S.placed).length===FRUITS.length) S.done=true;
    } else if(hitM){
      _g8pPlayClick(); S.hint=`فكّري: ${f.desc}`; S.hintT=120;
    }
    S.dragId=null; controls(renderControls());
  }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;
  cv.onclick=null;

  function drawFruit(c,id,x,y,w,h,scale){
    c.save(); c.translate(x,y); c.scale(scale,scale);
    if(id==='hook'){
      c.fillStyle='#A16207'; c.beginPath(); c.arc(0,0,w*0.03,0,Math.PI*2); c.fill();
      c.strokeStyle='#78350F'; c.lineWidth=1.5;
      for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; c.beginPath(); c.moveTo(Math.cos(a)*w*0.03,Math.sin(a)*w*0.03); c.lineTo(Math.cos(a)*w*0.05,Math.sin(a)*w*0.05); c.stroke(); }
    } else if(id==='wing'){
      c.fillStyle='#CA8A04'; c.beginPath(); c.ellipse(0,0,w*0.015,w*0.02,0,0,Math.PI*2); c.fill();
      c.fillStyle='rgba(202,138,4,0.5)'; c.strokeStyle='#A16207'; c.lineWidth=1;
      c.beginPath(); c.ellipse(-w*0.035,0,w*0.03,w*0.012,0.3,0,Math.PI*2); c.fill(); c.stroke();
      c.beginPath(); c.ellipse(w*0.035,0,w*0.03,w*0.012,-0.3,0,Math.PI*2); c.fill(); c.stroke();
    } else {
      c.fillStyle='#D97706'; c.strokeStyle='#92400E'; c.lineWidth=1.5;
      c.beginPath(); c.arc(0,0,w*0.032,0,Math.PI*2); c.fill(); c.stroke();
    }
    c.restore();
  }

  function draw(){
    if(currentSim!=='g7bio1n5' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7pBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ٥-١ · إلى أين ستذهب البذرة؟', w/2, h*0.06);
    if(S.hintT>0) S.hintT--;

    // مناطق وسائل الانتشار
    METHODS.forEach(m=>{
      const mx=w*m.x, my=h*0.72;
      c.save();
      c.fillStyle = dark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)';
      c.strokeStyle = g7pMut(dark); c.lineWidth=2; c.setLineDash([5,4]);
      c.beginPath(); c.roundRect(mx-w*0.13,my-h*0.1,w*0.26,h*0.2,12); c.fill(); c.stroke();
      c.setLineDash([]);
      c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
      c.fillText(m.label, mx, my+h*0.14);
      c.restore();
      // الثمار الموضوعة بنجاح تظهر هنا مع حركة بسيطة
      const placedFruit = FRUITS.find(f=>f.method===m.id && S.placed[f.id]);
      if(placedFruit){
        let ox=0, oy=0;
        if(S.animMethod===m.id && S.animT<1){
          S.animT += 0.02;
          if(m.id==='wind') ox = Math.sin(S.animT*10)*w*0.03;
          if(m.id==='water') oy = Math.sin(S.animT*8)*h*0.015;
          if(m.id==='animal') ox = -S.animT*w*0.05;
        }
        drawFruit(c, placedFruit.id, mx+ox, my+oy, w, h, 1.4);
      }
    });

    // الثمار غير الموضوعة
    FRUITS.forEach(f=>{
      if(S.placed[f.id] || S.dragId===f.id) return;
      const hx=f.home.x*w, hy=f.home.y*h;
      c.save(); c.fillStyle=dark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)';
      c.beginPath(); c.arc(hx,hy,w*0.055,0,Math.PI*2); c.fill(); c.restore();
      drawFruit(c,f.id,hx,hy,w,h,1);
      c.fillStyle=g7pTxt(dark); c.font=`${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
      c.fillText(f.label, hx, hy+h*0.07);
    });
    if(S.dragId){ drawFruit(c,S.dragId,S.dragX,S.dragY,w,h,1.1); }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ── تاب ٢: مصنع الثمار (ترتيب مراحل) ── */
function simG7Bio1N5b(){
  cancelAnimationFrame(animFrame);
  const STAGES = [
    { id:'flower', label:'🌸 زهرة', order:0 },
    { id:'ovary',  label:'مبيض',   order:1 },
    { id:'seeds',  label:'بذور',   order:2 },
    { id:'fruit',  label:'ثمرة',   order:3 },
  ];
  simState = { placed:{}, dragId:null, dragX:0, dragY:0, hint:'', hintT:0, done:false, opened:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const HOMES = [ {x:0.15,y:0.20}, {x:0.85,y:0.20}, {x:0.15,y:0.42}, {x:0.85,y:0.42} ];
  const SHUFFLED = [...STAGES].sort(()=>Math.random()-0.5);

  function slotPos(i,w,h){ return { x: w*(0.18+i*0.22), y: h*0.68 }; }

  function renderControls(){
    const n = Object.keys(S.placed).length;
    if(!S.done){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🍎 مصنع الثمار</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:10px">رتّبي المراحل بالسحب على خطّ الزمن (${n} من ٤)</div>
        ${S.hintT>0 ? `<div style="font-size:13px;color:#D97706;background:#FEF3C7;border-radius:8px;padding:10px">💡 ${S.hint}</div>` : ''}`;
    }
    return `
      <div class="ctrl-section"><div class="ctrl-label">🎉 أحسنتِ!</div></div>
      <div style="padding:14px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(39,174,96,0.3);font-size:13px;color:var(--text-secondary);line-height:1.9;margin-bottom:12px">
        تتحوّل المبايض إلى ثمار بعد الإخصاب، وتحتوي الثمار على البذور.
      </div>
      <button class="ctrl-btn play" onclick="window._g7fruitOpen()">${S.opened?'🔒 أغلقي الثمرة':'🔍 ماذا يوجد داخل الثمرة؟'}</button>
      <button class="ctrl-btn reset" style="margin-top:10px" onclick="window._g7fruitRestart()">↺ أعد النشاط</button>`;
  }
  controls(renderControls());
  window._g7fruitOpen = function(){ _g8pPlayClick(); S.opened=!S.opened; controls(renderControls()); };
  window._g7fruitRestart = function(){
    S.placed={}; S.dragId=null; S.hint=''; S.hintT=0; S.done=false; S.opened=false;
    controls(renderControls());
  };

  function hitCard(p,w,h){
    for(let i=0;i<SHUFFLED.length;i++){
      const st = SHUFFLED[i];
      if(S.placed[st.id]!==undefined) continue;
      const pos = { x:w*HOMES[i].x, y:h*HOMES[i].y };
      if(Math.abs(p.x-pos.x)<w*0.11 && Math.abs(p.y-pos.y)<h*0.06) return st;
    }
    return null;
  }
  function onDown(e){ if(S.done) return; const p=g7pGp(cv,e); const st=hitCard(p,cv.width,cv.height); if(st){ S.dragId=st.id; S.dragX=p.x; S.dragY=p.y; } }
  function onMove(e){ if(!S.dragId) return; e.preventDefault && e.preventDefault(); const p=g7pGp(cv,e); S.dragX=p.x; S.dragY=p.y; }
  function onUp(){
    if(!S.dragId) return;
    const st = STAGES.find(x=>x.id===S.dragId);
    const w=cv.width,h=cv.height;
    let nearestSlot=-1, nearestDist=Infinity;
    for(let i=0;i<4;i++){ const sp=slotPos(i,w,h); const d=Math.hypot(S.dragX-sp.x,S.dragY-sp.y); if(d<nearestDist){nearestDist=d;nearestSlot=i;} }
    const slotTaken = Object.values(S.placed).includes(nearestSlot);
    if(nearestDist < w*0.11 && !slotTaken){
      if(nearestSlot===st.order){
        S.placed[st.id]=nearestSlot; _g8pPlayDrop();
        if(Object.keys(S.placed).length===4) S.done=true;
      } else {
        _g8pPlayClick(); S.hint='فكّري بالترتيب الزمني: من الزهرة إلى الثمرة.'; S.hintT=120;
      }
    }
    S.dragId=null; controls(renderControls());
  }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;
  cv.onclick=null;

  function drawStage(c,id,x,y,w,h,scale){
    c.save(); c.translate(x,y); c.scale(scale,scale);
    if(id==='flower'){
      for(let i=0;i<5;i++){ const a=i/5*Math.PI*2; c.save(); c.rotate(a); c.fillStyle='#F472B6';
        c.beginPath(); c.ellipse(0,-w*0.03,w*0.014,w*0.028,0,0,Math.PI*2); c.fill(); c.restore(); }
      c.fillStyle='#FDE047'; c.beginPath(); c.arc(0,0,w*0.012,0,Math.PI*2); c.fill();
    } else if(id==='ovary'){
      c.fillStyle='#84CC16'; c.strokeStyle='#3F6212'; c.lineWidth=1.5;
      c.beginPath(); c.ellipse(0,0,w*0.03,h*0.024,0,0,Math.PI*2); c.fill(); c.stroke();
    } else if(id==='seeds'){
      c.fillStyle='#92400E';
      for(let i=0;i<3;i++){ c.beginPath(); c.arc((i-1)*w*0.018,0,w*0.01,0,Math.PI*2); c.fill(); }
    } else {
      c.fillStyle='#DC2626'; c.strokeStyle='#7F1D1D'; c.lineWidth=1.5;
      c.beginPath(); c.arc(0,0,w*0.032,0,Math.PI*2); c.fill(); c.stroke();
    }
    c.restore();
  }

  function draw(){
    if(currentSim!=='g7bio1n5' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7pBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ٥-١ · مصنع الثمار', w/2, h*0.06);
    if(S.hintT>0) S.hintT--;

    if(!S.done){
      c.strokeStyle=g7pMut(dark); c.lineWidth=2; c.setLineDash([6,5]);
      c.beginPath(); c.moveTo(w*0.12,h*0.68); c.lineTo(w*0.9,h*0.68); c.stroke(); c.setLineDash([]);
      for(let i=0;i<4;i++){
        const sp = slotPos(i,w,h);
        const filled = STAGES.find(s=>S.placed[s.id]===i);
        c.save(); c.strokeStyle= S.dragId?g7pAccent(dark):g7pMut(dark); c.lineWidth=2.5; c.setLineDash([5,4]);
        c.beginPath(); c.arc(sp.x,sp.y,w*0.05,0,Math.PI*2); c.stroke(); c.setLineDash([]); c.restore();
        if(filled){ drawStage(c,filled.id,sp.x,sp.y,w,h,1.4);
          c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
          c.fillText(filled.label, sp.x, sp.y+h*0.08);
        } else {
          c.fillStyle=g7pMut(dark); c.font=`${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
          c.fillText(i+1, sp.x, sp.y+h*0.005);
        }
      }
      SHUFFLED.forEach((st,i)=>{
        if(S.placed[st.id]!==undefined || S.dragId===st.id) return;
        const pos={x:w*HOMES[i].x,y:h*HOMES[i].y};
        c.save(); c.fillStyle=dark?'rgba(255,255,255,0.07)':'rgba(255,255,255,0.75)'; c.strokeStyle=g7pMut(dark); c.lineWidth=1.5;
        c.beginPath(); c.roundRect(pos.x-w*0.11,pos.y-h*0.05,w*0.22,h*0.1,10); c.fill(); c.stroke();
        drawStage(c,st.id,pos.x-w*0.06,pos.y,w,h,0.9);
        c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
        c.fillText(st.label, pos.x+w*0.03, pos.y+h*0.006);
        c.restore();
      });
      if(S.dragId){
        const st=STAGES.find(x=>x.id===S.dragId);
        c.save(); c.fillStyle='rgba(74,222,128,0.2)'; c.strokeStyle=g7pAccent(dark); c.lineWidth=2;
        c.beginPath(); c.roundRect(S.dragX-w*0.11,S.dragY-h*0.05,w*0.22,h*0.1,10); c.fill(); c.stroke();
        drawStage(c,st.id,S.dragX-w*0.06,S.dragY,w,h,0.9);
        c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
        c.fillText(st.label, S.dragX+w*0.03, S.dragY+h*0.006);
        c.restore();
      }
    } else {
      const cx=w*0.5, cy=h*0.5, R=Math.min(w,h)*0.24;
      if(!S.opened){
        c.fillStyle='#DC2626'; c.strokeStyle='#7F1D1D'; c.lineWidth=2.5;
        c.beginPath(); c.arc(cx,cy,R,0,Math.PI*2); c.fill(); c.stroke();
        c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
        c.fillText('ثمرة 🍎', cx, cy+R+h*0.05);
      } else {
        c.save(); c.beginPath(); c.arc(cx,cy,R,Math.PI*0.15,Math.PI*0.85); c.fillStyle='#DC2626'; c.strokeStyle='#7F1D1D'; c.lineWidth=2.5; c.fill(); c.stroke(); c.restore();
        c.save(); c.beginPath(); c.arc(cx,cy,R,Math.PI*1.15,Math.PI*1.85); c.fillStyle='#DC2626'; c.strokeStyle='#7F1D1D'; c.lineWidth=2.5; c.fill(); c.stroke(); c.restore();
        c.fillStyle='#92400E';
        for(let i=0;i<5;i++){ const a=i/5*Math.PI*2; c.beginPath(); c.arc(cx+Math.cos(a)*R*0.3, cy+Math.sin(a)*R*0.3, R*0.09, 0, Math.PI*2); c.fill(); }
        c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
        c.fillText('البذور بداخل الثمرة 🌰', cx, cy+R+h*0.05);
        c.font=`${Math.round(h*0.015)}px Tajawal`; c.fillStyle=g7pMut(dark);
        c.fillText('أين بدأت هذه البذور؟ — تذكّري نشاط الإخصاب', cx, cy+R+h*0.09);
      }
      // تسلسل المراحل: أيقونات + رؤوس أسهم متجهة (رسم متجهات وليس نصاً)، لتفادي أي التباس في اتجاهها
      const seq = [{id:'flower',label:'زهرة'},{id:'ovary',label:'مبيض'},{id:'seeds',label:'بذور'},{id:'fruit',label:'ثمرة'}];
      const seqY = h*0.16;
      seq.forEach((s,i)=>{
        const sx = w*(0.2+i*0.2);
        drawStage(c, s.id, sx, seqY, w, h, 1.1);
        c.fillStyle=g7pAccent(dark); c.font=`bold ${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
        c.fillText(s.label, sx, seqY+h*0.05);
        if(i<seq.length-1){
          const ax1 = sx+w*0.045, ax2 = w*(0.2+(i+1)*0.2)-w*0.045, ay=seqY;
          c.strokeStyle=g7pAccent(dark); c.lineWidth=Math.max(2,w*0.005); c.lineCap='round';
          c.beginPath(); c.moveTo(ax1,ay); c.lineTo(ax2,ay); c.stroke();
          const ahL=w*0.012;
          c.beginPath();
          c.moveTo(ax2,ay);
          c.lineTo(ax2-ahL,ay-ahL*0.7);
          c.lineTo(ax2-ahL,ay+ahL*0.7);
          c.closePath(); c.fillStyle=g7pAccent(dark); c.fill();
        }
      });
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}
