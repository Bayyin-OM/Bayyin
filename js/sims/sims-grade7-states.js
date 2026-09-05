// ══════════════════════════════════════════════════════════
// الصف السابع — الوحدة الثانية: حالات المادّة
// الدرس ٢ · نظرية الجزيئات  /  الدرس ٣ · تغيّر الحالة  /  الدرس ٥ · الانتشار
// ══════════════════════════════════════════════════════════

function g7sBg(dark){ return dark ? '#0B1620' : '#F0F7FB'; }
function g7sTxt(dark){ return dark ? '#CFEFFB' : '#0F3550'; }
function g7sMut(dark){ return dark ? '#6FA8C0' : '#4A7A90'; }
function g7sAccent(dark){ return dark ? '#38BDF8' : '#0284C7'; }
function g7sClamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
function g7sLerp(a,b,t){ return a + (b-a)*t; }
function g7sRand(a,b){ return a + Math.random()*(b-a); }

function g7sGp(cv, e){
  const r = cv.getBoundingClientRect(), sc = cv.width/r.width;
  const s = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
  return { x:(s.clientX-r.left)*sc, y:(s.clientY-r.top)*sc };
}

/* رسم شريط العنوان دائماً في الأعلى فوق كل شيء — لا يُغطّى أبداً */
function g7sTitleBar(c, w, h, dark, title){
  c.save();
  c.fillStyle = dark ? 'rgba(11,22,32,0.92)' : 'rgba(240,247,251,0.92)';
  c.fillRect(0, 0, w, h*0.115);
  c.fillStyle = g7sTxt(dark);
  c.font = `bold ${Math.round(h*0.028)}px Tajawal`;
  c.textAlign = 'center';
  c.fillText(title, w/2, h*0.058);
  c.restore();
}

/* ══════════════════════════════════════════════════════════
   الدرس ٢ — تاب أ: كيف تتحرّك الجزيئات؟ (صلبة / سائلة / غازية)
   ══════════════════════════════════════════════════════════ */
function simG7States2a(){
  cancelAnimationFrame(animFrame);
  const STATE_INFO = {
    solid:  { label:'المادّة الصلبة', icon:'🧊',
      desc:'جزيئات المادّة الصلبة متراصّة ومنتظمة في شكل ثابت، وهي تهتزّ في أماكنها فقط ولا تنتقل من مكان إلى آخر.',
      action:'🫗 أمِل الوعاء', doneMsg:'✅ لاحظت أنّ المادّة الصلبة حافظت على شكلها تماماً، ولم تتغيّر بتغيّر وضع الوعاء — لأنّ جزيئاتها متراصّة في مكانها ولا تنزلق.' },
    liquid: { label:'المادّة السائلة', icon:'💧',
      desc:'جزيئات المادّة السائلة متقاربة، لكنّها تتحرّك وتنزلق بجوار بعضها، لذلك تستطيع تغيير مواضعها بحرّية نسبية.',
      action:'🫗 أمِل الوعاء', doneMsg:'✅ لاحظت أنّ السائل تدفّق وتغيّر شكله ليتناسب مع الوعاء الجديد، بينما بقي حجمه ثابتاً تقريباً.' },
    gas:    { label:'المادّة الغازية', icon:'💨',
      desc:'جزيئات المادّة الغازية متباعدة جداً، وتتحرّك بسرعة كبيرة في جميع الاتّجاهات، لذلك تنتشر لتملأ الحيّز المتاح لها بالكامل.',
      action:'🔍 كبِّر الوعاء', doneMsg:'✅ لاحظت أنّ الجزيئات انتشرت فوراً لتملأ الحيّز الجديد الأكبر — فالغاز ليس له شكل ثابت ولا حجم ثابت.' },
  };
  simState = { state:null, particles:[], tiltAngle:0, tiltTarget:0, tiltOn:false, enlargeT:0, enlargeOn:false, t:0, actionDone:false, shakeT:0 };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    const info = S.state ? STATE_INFO[S.state] : null;
    let html = `<div class="ctrl-section"><div class="ctrl-label">🔬 استقصاء: كيف تتحرّك الجزيئات؟</div>
      <div style="font-size:13px;color:var(--text-secondary);line-height:1.8;margin-bottom:10px">اختر حالة المادّة لمشاهدة حركة جزيئاتها، ثمّ جرّب التفاعل معها.</div>
      <div class="ctrl-btns-grid-1">
        <button class="ctrl-btn ${S.state==='solid'?'active':''}" onclick="window._g7s2Select('solid')">🧊 مادّة صلبة</button>
        <button class="ctrl-btn ${S.state==='liquid'?'active':''}" onclick="window._g7s2Select('liquid')">💧 مادّة سائلة</button>
        <button class="ctrl-btn ${S.state==='gas'?'active':''}" onclick="window._g7s2Select('gas')">💨 مادّة غازية</button>
      </div></div>`;
    if(info){
      html += `<div class="ctrl-section"><div class="ctrl-label">${info.icon} ${info.label}</div>
        <div class="info-box">${info.desc}</div>
        <button class="ctrl-btn action" id="g7s2ActBtn" onclick="window._g7s2Action()">${info.action}</button>
        <div id="g7s2ResultBox"></div>
      </div>`;
    }
    return html;
  }
  controls(renderControls());

  function buildParticles(state){
    S.particles = [];
    if(state==='solid'){
      const cols=5, rows=4;
      let i=0;
      for(let r=0;r<rows;r++) for(let cIdx=0;cIdx<cols;cIdx++){
        S.particles.push({ ax:0.14+cIdx*(0.72/(cols-1)), ay:0.18+r*(0.72/(rows-1)), phase:Math.random()*Math.PI*2, id:i++ });
      }
    } else if(state==='liquid'){
      for(let i=0;i<26;i++){
        S.particles.push({ nx:Math.random(), ny:Math.random(), vx:g7sRand(-0.06,0.06), vy:g7sRand(-0.04,0.04) });
      }
    } else {
      for(let i=0;i<22;i++){
        S.particles.push({ nx:Math.random(), ny:Math.random(), vx:g7sRand(-0.5,0.5), vy:g7sRand(-0.5,0.5) });
      }
    }
  }

  window._g7s2Select = function(state){
    _g8pPlayClick();
    S.state = state; S.tiltAngle=0; S.tiltTarget=0; S.tiltOn=false; S.enlargeT=0; S.enlargeOn=false; S.actionDone=false; S.shakeT=0;
    buildParticles(state);
    controls(renderControls());
  };

  window._g7s2Action = function(){
    if(!S.state) return;
    _g8pPlayClick();
    const box = document.getElementById('g7s2ResultBox');
    if(S.state==='solid'){
      S.shakeT = 40; S.actionDone = true;
      setTimeout(()=>{ if(box) box.innerHTML = `<div class="info-box" style="margin-top:10px">${STATE_INFO.solid.doneMsg}</div>`; }, 700);
    } else if(S.state==='liquid'){
      S.tiltOn = !S.tiltOn; S.tiltTarget = S.tiltOn ? 32 : 0; S.actionDone = true;
      setTimeout(()=>{ if(box) box.innerHTML = `<div class="info-box" style="margin-top:10px">${STATE_INFO.liquid.doneMsg}</div>`; }, 700);
    } else {
      S.enlargeOn = !S.enlargeOn; S.actionDone = true;
      setTimeout(()=>{ if(box) box.innerHTML = `<div class="info-box" style="margin-top:10px">${STATE_INFO.gas.doneMsg}</div>`; }, 900);
    }
    const btn = document.getElementById('g7s2ActBtn');
    if(btn) btn.textContent = S.state==='gas' ? (S.enlargeOn?'↺ إعادة الوعاء لحجمه الطبيعي':'🔍 كبِّر الوعاء')
                              : (S.tiltOn?'↺ أعِد الوعاء لوضعه الطبيعي':'🫗 أمِل الوعاء');
  };

  function draw(){
    if(currentSim!=='g7states2' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    c.fillStyle = g7sBg(dark); c.fillRect(0,0,w,h);
    S.t += 0.02;
    if(Math.abs(S.tiltAngle - S.tiltTarget) > 0.3) S.tiltAngle += (S.tiltTarget - S.tiltAngle)*0.08;
    else S.tiltAngle = S.tiltTarget;
    S.enlargeT += ((S.enlargeOn?1:0) - S.enlargeT) * 0.06;
    if(S.shakeT>0) S.shakeT--;

    // هندسة الوعاء
    const baseW = w*0.34, baseH = h*0.5;
    const cw = baseW * g7sLerp(1, 1.6, S.enlargeT);
    const ch = baseH;
    const cx = w*0.5, cy = h*0.56;
    const shakeOff = S.shakeT>0 ? Math.sin(S.shakeT*1.3)*w*0.006 : 0;

    if(!S.state){
      c.fillStyle = g7sMut(dark); c.font=`${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
      c.fillText('اختر حالة المادّة من القائمة لبدء الاستقصاء 👆', w/2, h*0.5);
      g7sTitleBar(c, w, h, dark, '٢-١ · نظرية الجزيئات');
      animFrame = requestAnimationFrame(draw);
      return;
    }

    // المادّة الصلبة لا تميل أبداً — فقط تهتزّ/تتزحزح مكانياً (shakeOff) عند الضغط على الزر
    const angRad = 0;
    const liquidAngRad = (S.state==='liquid') ? (S.tiltAngle*Math.PI/180) : 0;

    // ── حالة صلبة: الوعاء + الجزيئات تدور معاً ككتلة صلبة واحدة ──
    if(S.state==='solid'){
      c.save();
      c.translate(cx+shakeOff, cy); c.rotate(angRad);
      c.strokeStyle = g7sAccent(dark); c.lineWidth = w*0.006; c.lineCap='round';
      c.beginPath();
      c.moveTo(-cw/2, -ch/2); c.lineTo(-cw/2, ch/2); c.lineTo(cw/2, ch/2); c.lineTo(cw/2, -ch/2);
      c.stroke();
      S.particles.forEach(p=>{
        const jx = Math.cos(S.t*3.2+p.phase)*cw*0.012;
        const jy = Math.sin(S.t*3.7+p.phase*1.3)*cw*0.012;
        const px = -cw/2 + p.ax*cw + jx, py = -ch/2 + p.ay*ch + jy;
        c.fillStyle = g7sAccent(dark);
        c.beginPath(); c.arc(px, py, w*0.014, 0, Math.PI*2); c.fill();
      });
      c.restore();
    }

    // ── حالة سائلة: الوعاء يميل، والسائل يحافظ على سطح أفقي ويأخذ شكل الوعاء ──
    if(S.state==='liquid'){
      c.save();
      c.translate(cx, cy); c.rotate(liquidAngRad);
      c.beginPath();
      c.moveTo(-cw/2, -ch/2); c.lineTo(-cw/2, ch/2); c.lineTo(cw/2, ch/2); c.lineTo(cw/2, -ch/2);
      c.closePath();
      c.clip();
      // نُعيد المصفوفة إلى الإحداثيات الأصلية مع الإبقاء على منطقة القصّ فعّالة،
      // لنرسم بركة السائل بسطح أفقي ثابت مهما كان ميل الوعاء (فيزيائياً صحيح)،
      // وتبقى محصورة داخل حدود الوعاء تماماً ولا تطلع منه.
      c.setTransform(1, 0, 0, 1, 0, 0);
      const poolH = ch*0.5, poolY = cy+ch/2-poolH, poolX = cx-cw*0.9, poolW = cw*1.8;
      c.fillStyle = dark ? 'rgba(56,189,248,0.28)' : 'rgba(2,132,199,0.22)';
      c.fillRect(poolX, poolY, poolW, poolH);
      S.particles.forEach(p=>{
        p.nx += p.vx*0.01; p.ny += p.vy*0.01;
        if(p.nx<0||p.nx>1) p.vx*=-1; if(p.ny<0||p.ny>1) p.vy*=-1;
        p.nx = g7sClamp(p.nx,0,1); p.ny = g7sClamp(p.ny,0,1);
        const px = poolX + p.nx*poolW, py = poolY + p.ny*poolH;
        c.fillStyle = g7sAccent(dark);
        c.beginPath(); c.arc(px, py, w*0.012, 0, Math.PI*2); c.fill();
      });
      c.restore(); // يزيل الدوران ومنطقة القصّ معاً دفعة واحدة
      // إطار الوعاء (يُرسم فوق السائل ليبقى واضحاً)
      c.save(); c.translate(cx, cy); c.rotate(liquidAngRad);
      c.strokeStyle = g7sAccent(dark); c.lineWidth = w*0.006; c.lineCap='round';
      c.beginPath();
      c.moveTo(-cw/2, -ch/2); c.lineTo(-cw/2, ch/2); c.lineTo(cw/2, ch/2); c.lineTo(cw/2, -ch/2);
      c.stroke();
      c.restore();
    }

    // ── حالة غازية: الجزيئات تتحرّك بسرعة وتملأ الوعاء (يكبر عند الضغط على الزر) ──
    if(S.state==='gas'){
      c.save();
      c.strokeStyle = g7sAccent(dark); c.lineWidth = w*0.006; c.lineCap='round';
      c.strokeRect(cx-cw/2, cy-ch/2, cw, ch);
      S.particles.forEach(p=>{
        p.nx += p.vx*0.003; p.ny += p.vy*0.003;
        if(p.nx<0.02||p.nx>0.98) p.vx*=-1;
        if(p.ny<0.02||p.ny>0.98) p.vy*=-1;
        p.nx = g7sClamp(p.nx,0.02,0.98); p.ny = g7sClamp(p.ny,0.02,0.98);
        const px = cx-cw/2 + p.nx*cw, py = cy-ch/2 + p.ny*ch;
        c.fillStyle = g7sAccent(dark);
        c.beginPath(); c.arc(px, py, w*0.011, 0, Math.PI*2); c.fill();
      });
      c.restore();
    }

    c.fillStyle = g7sTxt(dark); c.font=`bold ${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
    c.fillText(STATE_INFO[S.state].icon + ' ' + STATE_INFO[S.state].label, cx, h*0.92);

    g7sTitleBar(c, w, h, dark, '٢-١ · نظرية الجزيئات');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   الدرس ٢ — تاب ب: مطابقة الملاحظات + سؤال تفاعلي
   ══════════════════════════════════════════════════════════ */
function simG7States2b(){
  cancelAnimationFrame(animFrame);
  const ZONES = [
    { id:'solid',  label:'صلبة',  x:0.18, icon:'🧊' },
    { id:'liquid', label:'سائلة', x:0.50, icon:'💧' },
    { id:'gas',    label:'غازية', x:0.82, icon:'💨' },
  ];
  const CHIPS = [
    { id:'c1', text:'تهتزّ في مكانها',        correct:'solid'  },
    { id:'c2', text:'جزيئات متراصّة',         correct:'solid'  },
    { id:'c3', text:'تنزلق بجوار بعضها',      correct:'liquid' },
    { id:'c4', text:'جزيئات متقاربة',         correct:'liquid' },
    { id:'c5', text:'تتحرّك بحرّية',           correct:'gas'    },
    { id:'c6', text:'جزيئات متباعدة',         correct:'gas'    },
  ];
  // نقاط انتشار مضبوطة (بدون تداخل بين البطاقات) — تُخلط عشوائياً في كل مرة كي لا يتطابق ترتيبها مع ترتيب المناطق أدناه
  const G7S2B_SCATTER_POOL = [
    {x:0.20,y:0.16},{x:0.50,y:0.13},{x:0.80,y:0.17},
    {x:0.23,y:0.35},{x:0.52,y:0.39},{x:0.79,y:0.34},
  ];
  function g7s2bShuffle(arr){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
    return a;
  }
  function g7s2bScatterHomes(){
    const pool = g7s2bShuffle(G7S2B_SCATTER_POOL);
    const homes = {};
    CHIPS.forEach((ch,i)=>{ homes[ch.id] = pool[i]; });
    return homes;
  }
  simState = { placed:{}, dragId:null, dragX:0, dragY:0, wrong:null, wrongT:0, done:false, qAnswered:false, homes:g7s2bScatterHomes() };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    const n = Object.keys(S.placed).length;
    if(!S.done){
      return `<div class="ctrl-section"><div class="ctrl-label">📊 طابقي الملاحظات بحالات المادّة</div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.8;margin-bottom:6px">اسحب كل بطاقة إلى الحالة المناسبة (${n} من ٦)</div></div>`;
    }
    if(!S.qAnswered){
      return `<div class="ctrl-section"><div class="ctrl-label">🎉 أحسنت! طابقت كل الملاحظات</div></div>
      <div class="ctrl-section">
        <div style="font-size:14px;font-weight:700;margin-bottom:10px">❓ سكب خالد محتوى كأس في كأس آخر، ولاحظ أنّ المادّة أخذت شكل الكأس الجديد، لكن حجمها بقي نفسه. في أيّ حالة تكون هذه المادّة؟</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${['صلبة','سائلة','غازية'].map((o,i)=>`<button id="g7s2bOpt${i}" onclick="window._g7s2bAnswer(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">${o}</button>`).join('')}
        </div>
        <div id="g7s2bFb" style="margin-top:10px;font-size:13px;color:var(--text-secondary);line-height:1.8"></div>
      </div>`;
    }
    return `<div class="ctrl-section"><div class="ctrl-label">🎉 أحسنت!</div>
      <div class="info-box">المادّة السائلة تتكوّن من جزيئات متقاربة تستطيع الانزلاق بجوار بعضها، لذلك يتغيّر شكلها بحسب الوعاء بينما يبقى حجمها ثابتاً.</div>
      <button class="ctrl-btn reset" onclick="window._g7s2bRestart()">↺ أعد النشاط</button></div>`;
  }
  controls(renderControls());

  window._g7s2bAnswer = function(i){
    if(S.qAnswered) return; S.qAnswered = true;
    const ok = i===1;
    _g8pPlayClick();
    const btn = document.getElementById('g7s2bOpt'+i);
    if(btn){ btn.style.background = ok?'#27AE60':'#E74C3C'; btn.style.color='white'; btn.style.borderColor= ok?'#27AE60':'#E74C3C'; }
    if(!ok){ const okBtn=document.getElementById('g7s2bOpt1'); if(okBtn){ okBtn.style.background='#27AE60'; okBtn.style.color='white'; okBtn.style.borderColor='#27AE60'; } }
    const fb = document.getElementById('g7s2bFb');
    if(fb) fb.innerHTML = '💡 أحسنت! المادّة السائلة تتكوّن من جزيئات متقاربة تستطيع الانزلاق بجوار بعضها، لذلك يتغيّر شكلها بحسب الوعاء بينما يبقى حجمها ثابتاً.';
    setTimeout(()=>controls(renderControls()), 400);
  };
  window._g7s2bRestart = function(){
    S.placed={}; S.dragId=null; S.done=false; S.qAnswered=false; S.homes=g7s2bScatterHomes(); controls(renderControls());
  };

  function hitChip(p, w, h){
    for(const ch of CHIPS){
      if(S.placed[ch.id]) continue;
      const hx=S.homes[ch.id].x*w, hy=S.homes[ch.id].y*h;
      if(Math.abs(p.x-hx) < w*0.13 && Math.abs(p.y-hy) < h*0.055) return ch;
    }
    return null;
  }
  function onDown(e){
    if(S.done) return;
    const p = g7sGp(cv,e); const ch = hitChip(p, cv.width, cv.height);
    if(ch){ S.dragId=ch.id; S.dragX=p.x; S.dragY=p.y; }
  }
  function onMove(e){
    if(!S.dragId) return; e.preventDefault && e.preventDefault();
    const p = g7sGp(cv,e); S.dragX=p.x; S.dragY=p.y;
  }
  function onUp(){
    if(!S.dragId) return;
    const ch = CHIPS.find(x=>x.id===S.dragId);
    const w=cv.width, h=cv.height;
    let hitZone=null;
    for(const z of ZONES){ if(Math.abs(S.dragX-z.x*w) < w*0.14 && S.dragY > h*0.6) { hitZone=z; break; } }
    if(hitZone && hitZone.id===ch.correct){
      S.placed[ch.id]=hitZone.id; _g8pPlayDrop();
      if(Object.keys(S.placed).length===CHIPS.length) S.done=true;
      controls(renderControls());
    } else if(hitZone){
      S.wrong=ch.id; S.wrongT=30; _g8pPlayClick();
    }
    S.dragId=null;
  }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;

  function draw(){
    if(currentSim!=='g7states2' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle = g7sBg(dark); c.fillRect(0,0,w,h);
    if(S.wrongT>0) S.wrongT--; else S.wrong=null;

    // مناطق الحالات الثلاث
    ZONES.forEach(z=>{
      c.save();
      c.fillStyle = dark? 'rgba(56,189,248,0.10)':'rgba(2,132,199,0.07)';
      c.strokeStyle = g7sAccent(dark); c.lineWidth=2; c.setLineDash([6,5]);
      const zx=z.x*w, zy=h*0.62, zw=w*0.27, zh=h*0.3;
      c.beginPath(); c.roundRect ? c.roundRect(zx-zw/2, zy, zw, zh, 14) : c.rect(zx-zw/2, zy, zw, zh);
      c.fill(); c.stroke(); c.setLineDash([]);
      c.fillStyle = g7sTxt(dark); c.font=`bold ${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
      c.fillText(z.icon+' '+z.label, zx, zy+zh+h*0.045);
      c.restore();
    });

    // البطاقات الموضوعة داخل مناطقها
    const stacks = {};
    CHIPS.forEach(ch=>{
      if(!S.placed[ch.id]) return;
      const z = ZONES.find(zz=>zz.id===S.placed[ch.id]);
      stacks[z.id] = (stacks[z.id]||0);
      const idx = stacks[z.id]++;
      const zx=z.x*w, zy=h*0.62 + h*0.05 + idx*h*0.085;
      drawChip(c, ch.text, zx, zy, w, h, dark, 'ok');
    });

    // البطاقات المتبقية في أماكنها الأصلية
    CHIPS.forEach(ch=>{
      if(S.placed[ch.id] || S.dragId===ch.id) return;
      const hx=S.homes[ch.id].x*w, hy=S.homes[ch.id].y*h;
      const shake = (S.wrong===ch.id) ? Math.sin(S.wrongT*2)*w*0.01 : 0;
      drawChip(c, ch.text, hx+shake, hy, w, h, dark, S.wrong===ch.id);
    });

    if(S.dragId){
      const ch = CHIPS.find(x=>x.id===S.dragId);
      drawChip(c, ch.text, S.dragX, S.dragY, w, h, dark, false);
    }

    if(!S.done){
      c.fillStyle = g7sMut(dark); c.font=`${Math.round(h*0.017)}px Tajawal`; c.textAlign='center';
      c.fillText(`اكتمل ${Object.keys(S.placed).length} من ٦ 🔗`, w/2, h*0.95);
    }

    g7sTitleBar(c, w, h, dark, '٢-٢ · طابق الملاحظات');
    animFrame = requestAnimationFrame(draw);
  }
  function drawChip(c, text, x, y, w, h, dark, state){
    // state: 'warn' (أحمر - خطأ), 'ok' (أخضر - صحيح)، أو غير ذلك (طبيعي)
    c.save();
    const isWarn = state === 'warn' || state === true;
    const isOk = state === 'ok';
    c.fillStyle = isWarn ? 'rgba(231,76,60,0.85)' : isOk ? 'rgba(39,174,96,0.85)' : (dark?'#12283A':'#FFFFFF');
    c.strokeStyle = isWarn ? '#E74C3C' : isOk ? '#27AE60' : g7sAccent(dark);
    c.lineWidth = 2;
    const cw = w*0.24, ch2 = h*0.065;
    c.beginPath();
    if(c.roundRect) c.roundRect(x-cw/2, y-ch2/2, cw, ch2, 10); else c.rect(x-cw/2, y-ch2/2, cw, ch2);
    c.fill(); c.stroke();
    c.font = `bold ${Math.round(h*0.016)}px Tajawal`;
    c.fillStyle = (isWarn || isOk) ? '#fff' : g7sTxt(dark);
    c.textAlign='center'; c.textBaseline='middle';
    c.fillText(text, x, y+1);
    c.textBaseline='alphabetic';
    c.restore();
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   الدرس ٣ — تغيّر الحالة: استقصاء غلي الماء
   ══════════════════════════════════════════════════════════ */
function simG7States3a(){
  cancelAnimationFrame(animFrame);
  const TEMPS = [25,45,65,85,100];
  const MOVE_DESC = [
    'حركة الجزيئات بطيئة نسبياً.',
    'تصبح حركة الجزيئات أسرع قليلاً.',
    'تزداد حركة الجزيئات والتصادمات بينها.',
    'تصبح الحركة أسرع بشكل واضح، وتبدأ فقاعات صغيرة بالظهور.',
    'وصل الماء إلى درجة الغليان! تظهر فقاعات كبيرة ويتصاعد بخار الماء، وتغادر بعض الجزيئات سطح السائل إلى الحالة الغازية.'
  ];
  simState = { t:0, playing:false, playTimer:null, bubbles:[], steam:[], qAnswered:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  for(let i=0;i<10;i++) S.bubbles.push({ nx:g7sRand(0.2,0.8), ny:g7sRand(0.3,1), speed:g7sRand(0.003,0.007), size:g7sRand(0.008,0.018) });
  for(let i=0;i<8;i++) S.steam.push({ nx:g7sRand(0.25,0.75), ny:g7sRand(0.6,1.1), speed:g7sRand(0.004,0.009), drift:g7sRand(-0.3,0.3) });

  function renderControls(){
    const minute = Math.round(S.t);
    let html = `<div class="ctrl-section"><div class="ctrl-label">🔥 استقصاء: غلي الماء</div>
      <div style="font-size:13px;color:var(--text-secondary);line-height:1.8;margin-bottom:8px">حرّك المؤشر أو شغّل الموقد، وراقب حركة جزيئات الماء ودرجة حرارته.</div>
      <button class="ctrl-btn ${S.playing?'stop':'play'}" onclick="window._g7s3Play()">${S.playing?'⏸ إيقاف الموقد':'🔥 تشغيل الموقد'}</button>
      <div class="ctrl-row" style="margin-top:10px">
        <div class="ctrl-name">⏱️ الزمن <span class="ctrl-val">${minute} د</span></div>
        <input type="range" min="0" max="4" step="1" value="${minute}" oninput="window._g7s3Set(+this.value)">
      </div>
      <div class="info-box">🌡️ ${TEMPS[minute]}°C — ${MOVE_DESC[minute]}</div>
    </div>`;
    if(minute===4){
      html += `<div class="ctrl-section"><div class="ctrl-label">❓ سؤال الاستنتاج</div>
        <div style="font-size:14px;font-weight:700;margin-bottom:10px">عند الدقيقة الرابعة بدأ الماء بالغليان ووصلت درجة حرارته إلى ١٠٠°C. أيّ ملاحظة تدلّ على أنّ الماء بدأ يتحوّل من سائل إلى غاز؟</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${['تغيّر لون الماء','اختفاء الماء فجأة','ظهور فقاعات بخار وتصاعد البخار من سطح الماء','تحوّل الماء إلى مادّة صلبة'].map((o,i)=>`<button id="g7s3Opt${i}" onclick="window._g7s3Answer(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">${o}</button>`).join('')}
        </div>
        <div id="g7s3Fb" style="margin-top:10px;font-size:13px;color:var(--text-secondary);line-height:1.8"></div>
      </div>`;
    }
    return html;
  }
  controls(renderControls());

  window._g7s3Set = function(v){
    S.t = v; S.playing=false; if(S.playTimer){ clearInterval(S.playTimer); S.playTimer=null; }
    controls(renderControls());
  };
  window._g7s3Play = function(){
    _g8pPlayClick();
    if(S.playing){ S.playing=false; if(S.playTimer){ clearInterval(S.playTimer); S.playTimer=null; } controls(renderControls()); return; }
    S.playing = true;
    if(S.t>=4) S.t=0;
    controls(renderControls());
    S.playTimer = setInterval(()=>{
      S.t = Math.min(4, Math.round(S.t)+1);
      controls(renderControls());
      if(S.t>=4){ S.playing=false; clearInterval(S.playTimer); S.playTimer=null; }
    }, 1400);
  };
  window._g7s3Answer = function(i){
    if(S.qAnswered) return; S.qAnswered=true;
    const ok = i===2; _g8pPlayClick();
    const btn = document.getElementById('g7s3Opt'+i);
    if(btn){ btn.style.background = ok?'#27AE60':'#E74C3C'; btn.style.color='white'; btn.style.borderColor= ok?'#27AE60':'#E74C3C'; }
    if(!ok){ const okBtn=document.getElementById('g7s3Opt2'); if(okBtn){ okBtn.style.background='#27AE60'; okBtn.style.color='white'; okBtn.style.borderColor='#27AE60'; } }
    const fb = document.getElementById('g7s3Fb');
    if(fb) fb.innerHTML = '💡 أحسنت! عند درجة الغليان يبدأ الماء بالتحوّل من الحالة السائلة إلى الحالة الغازية، لذلك تظهر فقاعات البخار ويتصاعد بخار الماء إلى الهواء.';
  };

  function draw(){
    if(currentSim!=='g7states3' || currentTab!==0){
      cancelAnimationFrame(animFrame);
      if(S.playTimer){ clearInterval(S.playTimer); S.playTimer=null; }
      return;
    }
    const c = cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle = g7sBg(dark); c.fillRect(0,0,w,h);
    const minute = Math.round(S.t);
    const temp = TEMPS[minute];
    const heatFrac = (temp-25)/75; // 0..1
    const speedFactor = g7sLerp(0.4, 2.0, heatFrac);

    // ── الكأس والماء (يسار) ──
    const cupX=w*0.30, cupY=h*0.44, cupW=w*0.28, cupH=h*0.4;
    c.save();
    c.strokeStyle = g7sMut(dark); c.lineWidth=w*0.006; c.lineCap='round';
    c.beginPath(); c.moveTo(cupX-cupW/2,cupY); c.lineTo(cupX-cupW/2,cupY+cupH); c.lineTo(cupX+cupW/2,cupY+cupH); c.lineTo(cupX+cupW/2,cupY); c.stroke();
    c.fillStyle = g7sMut(dark); c.font=`${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
    c.fillText('١٥٠ mL', cupX, cupY-h*0.015);

    c.save();
    c.beginPath(); c.rect(cupX-cupW/2, cupY, cupW, cupH); c.clip();
    c.fillStyle = dark? 'rgba(56,189,248,0.30)':'rgba(2,132,199,0.24)';
    c.fillRect(cupX-cupW/2, cupY+cupH*0.12, cupW, cupH*0.9);
    // جزيئات الماء المتحرّكة
    if(!S._parts) S._parts = Array.from({length:16}, ()=>({nx:Math.random(), ny:g7sRand(0.15,0.95), vx:g7sRand(-1,1), vy:g7sRand(-1,1)}));
    S._parts.forEach(p=>{
      p.nx += p.vx*0.004*speedFactor; p.ny += p.vy*0.004*speedFactor;
      if(p.nx<0.05||p.nx>0.95) p.vx*=-1; if(p.ny<0.15||p.ny>0.95) p.vy*=-1;
      p.nx=g7sClamp(p.nx,0.05,0.95); p.ny=g7sClamp(p.ny,0.15,0.95);
      c.fillStyle = dark? '#7DD3FC':'#0369A1';
      c.beginPath(); c.arc(cupX-cupW/2+p.nx*cupW, cupY+p.ny*cupH, w*0.008, 0, Math.PI*2); c.fill();
    });
    // فقاعات (من الدقيقة ٣)
    if(minute>=3){
      S.bubbles.forEach(b=>{
        b.ny -= b.speed*(minute>=4?1.6:1);
        if(b.ny<0.15){ b.ny=1; b.nx=g7sRand(0.2,0.8); }
        c.strokeStyle = dark? 'rgba(255,255,255,0.7)':'rgba(255,255,255,0.9)';
        c.lineWidth=1.5;
        c.beginPath(); c.arc(cupX-cupW/2+b.nx*cupW, cupY+b.ny*cupH, w*b.size, 0, Math.PI*2); c.stroke();
      });
    }
    c.restore();
    c.restore();

    // بخار متصاعد (الدقيقة ٤)
    if(minute>=4){
      c.save();
      S.steam.forEach(st=>{
        st.ny -= st.speed; st.nx += st.drift*0.002;
        if(st.ny<-0.1){ st.ny=1.05; st.nx=g7sRand(0.25,0.75); }
        c.globalAlpha = g7sClamp(1-st.ny, 0.05, 0.5);
        c.fillStyle = dark? '#E5F6FD':'#FFFFFF';
        c.beginPath(); c.arc(cupX-cupW/2+st.nx*cupW, cupY+st.ny*cupH, w*0.018, 0, Math.PI*2); c.fill();
      });
      c.globalAlpha=1;
      c.restore();
    }

    // موقد
    const stoveY = cupY+cupH+h*0.05;
    c.fillStyle = '#4B5563';
    c.fillRect(cupX-cupW*0.55, stoveY, cupW*1.1, h*0.035);
    if(minute>0){
      for(let i=-2;i<=2;i++){
        const fx = cupX+i*cupW*0.18;
        const fh = h*0.03*g7sLerp(0.5,1.3,heatFrac)*(0.7+0.3*Math.sin(S.t*10+i*2+performance.now()*0.006));
        c.fillStyle = '#F97316';
        c.beginPath();
        c.moveTo(fx, stoveY);
        c.quadraticCurveTo(fx-w*0.012, stoveY-fh*0.6, fx, stoveY-fh);
        c.quadraticCurveTo(fx+w*0.012, stoveY-fh*0.6, fx, stoveY);
        c.fill();
      }
    }
    c.restore();

    // ── ميزان الحرارة (وسط) ──
    const thX = w*0.52, thY = h*0.32, thH = h*0.5;
    c.save();
    c.strokeStyle = g7sMut(dark); c.lineWidth=w*0.008; c.lineCap='round';
    c.beginPath(); c.moveTo(thX, thY); c.lineTo(thX, thY+thH); c.stroke();
    c.fillStyle = dark?'#1E2A38':'#fff'; c.beginPath(); c.arc(thX, thY+thH+h*0.02, w*0.02, 0, Math.PI*2); c.fill();
    c.strokeStyle = g7sMut(dark); c.lineWidth=2; c.beginPath(); c.arc(thX, thY+thH+h*0.02, w*0.02, 0, Math.PI*2); c.stroke();
    const fillFrac = g7sClamp((temp-20)/85, 0.06, 0.98);
    c.strokeStyle = '#E74C3C'; c.lineWidth=w*0.014; c.lineCap='round';
    c.beginPath(); c.moveTo(thX, thY+thH*(1-fillFrac)); c.lineTo(thX, thY+thH+h*0.015); c.stroke();
    c.fillStyle = '#E74C3C'; c.beginPath(); c.arc(thX, thY+thH+h*0.02, w*0.024, 0, Math.PI*2); c.fill();
    c.fillStyle = g7sTxt(dark); c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText(temp+'°C', thX, thY-h*0.03);
    c.restore();

    // ── الرسم البياني (يمين) ──
    const gx = w*0.72, gy = h*0.28, gw = w*0.24, gh = h*0.5;
    c.save();
    c.strokeStyle = g7sMut(dark); c.lineWidth=1.5;
    c.beginPath(); c.moveTo(gx, gy); c.lineTo(gx, gy+gh); c.lineTo(gx+gw, gy+gh); c.stroke();
    c.fillStyle = g7sTxt(dark); c.font=`bold ${Math.round(h*0.017)}px Tajawal`; c.textAlign='center';
    c.fillText('درجة الحرارة °C', gx+gw/2, gy-h*0.02);
    c.font=`${Math.round(h*0.013)}px Tajawal`; c.fillStyle=g7sMut(dark);
    c.save(); c.translate(gx-w*0.025, gy+gh/2); c.rotate(-Math.PI/2); c.fillText('', 0,0); c.restore();
    c.textAlign='right';
    c.fillText('الزمن (د)', gx+gw+w*0.005, gy+gh+h*0.035);
    // نقاط ومسار حتى الدقيقة الحالية
    const pts = [];
    for(let i=0;i<=minute;i++){
      const px = gx + (i/4)*gw;
      const py = gy+gh - ((TEMPS[i]-20)/85)*gh;
      pts.push({x:px,y:py});
    }
    c.strokeStyle = g7sAccent(dark); c.lineWidth=w*0.005;
    c.beginPath(); pts.forEach((p,i)=> i===0?c.moveTo(p.x,p.y):c.lineTo(p.x,p.y)); c.stroke();
    pts.forEach((p,i)=>{
      c.fillStyle = g7sAccent(dark);
      c.beginPath(); c.arc(p.x,p.y,w*0.008,0,Math.PI*2); c.fill();
      c.fillStyle = g7sTxt(dark); c.font=`${Math.round(h*0.012)}px Tajawal`; c.textAlign='center';
      c.fillText(i+'', p.x, gy+gh+h*0.02);
    });
    c.restore();

    g7sTitleBar(c, w, h, dark, '٣-٢ · تغيّر الحالة: غلي الماء');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   الدرس ٥ — الانتشار
   ══════════════════════════════════════════════════════════ */
function simG7States5a(){
  cancelAnimationFrame(animFrame);
  simState = { dropped:false, t:0, micro:false, particles:[], phase:'idle', qAnswered:false, zoom:1, zoomT:1 };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    let html = `<div class="ctrl-section"><div class="ctrl-label">🔬 استقصاء: شاهد الانتشار</div>`;
    if(!S.dropped){
      html += `<div style="font-size:13px;color:var(--text-secondary);line-height:1.8;margin-bottom:10px">اضغط لإضافة قطرة من المحلول في منتصف طبق الأجار.</div>
      <button class="ctrl-btn play" onclick="window._g7s5Drop()">💧 أضف قطرة من المحلول</button></div>`;
      return html;
    }
    html += `<div style="font-size:13px;color:var(--text-secondary);line-height:1.8;margin-bottom:8px">حرّك شريط الزمن، وشاهد كيف تنتشر الجزيئات بعيداً عن نقطة التركيز العالي.</div>
      <div class="ctrl-row">
        <div class="ctrl-name">⏱️ الزمن <span class="ctrl-val">${S.t} د</span></div>
        <input type="range" min="0" max="5" step="1" value="${S.t}" oninput="window._g7s5Set(+this.value)">
      </div>
      <button class="ctrl-btn ${S.micro?'active':'action'}" onclick="window._g7s5Micro()">🔍 ${S.micro?'إخفاء':'شاهد'} الجزيئات (مستوى مجهري)</button>
      <div class="info-box">${G7S5_MIN[S.t]}</div>
    </div>`;
    if(S.t>=5){
      html += `<div class="ctrl-section"><div class="ctrl-label">📌 الملاحظة النهائية</div>
      <div class="info-box">كلّما مرّ الوقت، انتشرت الجزيئات في مساحة أكبر بسبب حركتها العشوائية المستمرّة، من المنطقة ذات التركيز الأعلى إلى المناطق ذات التركيز الأقلّ.</div>
      <div style="font-size:14px;font-weight:700;margin:10px 0">❓ وضع طالبان قطرة من المادّة نفسها في طبقين متماثلين: الأوّل في مكان دافئ، والثاني في مكان بارد. في أيّ طبق سيكون الانتشار أسرع؟</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${['في الطبق البارد','في الطبق الدافئ','في الطبقين بالسرعة نفسها','لا يحدث انتشار في أيّ منهما'].map((o,i)=>`<button id="g7s5Opt${i}" onclick="window._g7s5Answer(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">${o}</button>`).join('')}
      </div>
      <div id="g7s5Fb" style="margin-top:10px;font-size:13px;color:var(--text-secondary);line-height:1.8"></div>
      </div>`;
    }
    return html;
  }
  const G7S5_MIN = {
    0:'بقعة صغيرة جدّاً حول الثقب، والجزيئات متمركزة في المنطقة الوسطى.',
    1:'بدأت منطقة الانتشار بالاتّساع، وبدأت الجزيئات بالتحرّك بعيداً عن المركز.',
    2:'ازداد قطر منطقة الانتشار، ووصلت بعض الجزيئات إلى مناطق أبعد.',
    3:'انتشر اللون أكثر، وقلّت كثافة الجزيئات في المركز.',
    4:'أصبحت منطقة الانتشار أكبر بوضوح، وتوزّعت الجزيئات على مساحة أكبر.',
    5:'وصلت منطقة الانتشار إلى أكبر مدى، وأصبح توزيع الجزيئات أكثر تجانساً.',
  };
  controls(renderControls());

  window._g7s5Drop = function(){
    _g8pPlayDrop(); S.dropped=true; S.t=0;
    S.particles = Array.from({length:60}, (_,i)=>({ ang:Math.random()*Math.PI*2, release:g7sRand(0,4.6), r:0, jx:0, jy:0 }));
    controls(renderControls());
  };
  window._g7s5Set = function(v){ S.t=v; controls(renderControls()); };
  window._g7s5Micro = function(){ _g8pPlayClick(); S.micro=!S.micro; S.zoomT = S.micro ? 2.3 : 1; controls(renderControls()); };
  window._g7s5Answer = function(i){
    if(S.qAnswered) return; S.qAnswered=true;
    const ok = i===1; _g8pPlayClick();
    const btn = document.getElementById('g7s5Opt'+i);
    if(btn){ btn.style.background = ok?'#27AE60':'#E74C3C'; btn.style.color='white'; btn.style.borderColor= ok?'#27AE60':'#E74C3C'; }
    if(!ok){ const okBtn=document.getElementById('g7s5Opt1'); if(okBtn){ okBtn.style.background='#27AE60'; okBtn.style.color='white'; okBtn.style.borderColor='#27AE60'; } }
    const fb = document.getElementById('g7s5Fb');
    if(fb) fb.innerHTML = '💡 أحسنت! عند ارتفاع درجة الحرارة تتحرّك الجزيئات بسرعة أكبر، لذلك يحدث الانتشار بصورة أسرع.';
  };

  function draw(){
    if(currentSim!=='g7states5' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle = g7sBg(dark); c.fillRect(0,0,w,h);

    const dishX=w*0.5, dishY=h*0.55, dishR = Math.min(w,h)*0.3;

    // انتقال سلس نحو مستوى التكبير المستهدف (تأثير "زووم إن" حقيقي عند الضغط على الزر)
    S.zoom += (S.zoomT - S.zoom) * 0.1;

    // طبق بتري + طبقة الأجار
    c.save();
    c.beginPath(); c.rect(0, h*0.14, w, h*0.86); c.clip(); // قصّ منطقة الرسم كي لا يفيض التكبير خارج الكانفس
    c.translate(dishX, dishY); c.scale(S.zoom, S.zoom); c.translate(-dishX, -dishY);
    c.fillStyle = dark? '#3A1830':'#F9D9E8';
    c.strokeStyle = g7sMut(dark); c.lineWidth=w*0.006/S.zoom;
    c.beginPath(); c.arc(dishX,dishY,dishR,0,Math.PI*2); c.fill(); c.stroke();

    if(S.dropped){
      const spreadFrac = S.t/5; // 0..1
      const radiusFrac = S.micro ? g7sLerp(0.12,0.92,spreadFrac) : g7sLerp(0.05,0.88,spreadFrac);
      const grad = c.createRadialGradient(dishX,dishY,0, dishX,dishY, dishR*radiusFrac);
      grad.addColorStop(0, dark?'rgba(217,70,239,0.85)':'rgba(192,38,211,0.75)');
      grad.addColorStop(1, dark?'rgba(217,70,239,0.03)':'rgba(192,38,211,0.03)');
      c.save(); c.beginPath(); c.arc(dishX,dishY,dishR,0,Math.PI*2); c.clip();
      c.fillStyle = grad;
      c.beginPath(); c.arc(dishX,dishY,dishR,0,Math.PI*2); c.fill();
      c.restore();

      if(!S.micro){
        c.fillStyle = dark?'#F5D0FE':'#86198F';
        c.beginPath(); c.arc(dishX,dishY,w*0.006,0,Math.PI*2); c.fill();
      } else {
        // عرض الجزيئات وهي تتحرّك عشوائياً بعيداً عن المركز
        S.particles.forEach(p=>{
          const allowedR = p.release <= S.t ? g7sLerp(0, dishR*0.85, g7sClamp((S.t-p.release)/2,0,1)) : dishR*0.03;
          p.jx += (Math.random()-0.5)*1.2; p.jy += (Math.random()-0.5)*1.2;
          p.jx = g7sClamp(p.jx, -allowedR, allowedR); p.jy = g7sClamp(p.jy, -allowedR, allowedR);
          const rr = Math.min(Math.hypot(p.jx,p.jy), allowedR);
          const px = dishX + Math.cos(p.ang)*rr, py = dishY + Math.sin(p.ang)*rr;
          c.fillStyle = dark? '#F0ABFC':'#A21CAF';
          c.beginPath(); c.arc(px,py,w*0.007,0,Math.PI*2); c.fill();
        });
      }
    } else {
      c.fillStyle = g7sMut(dark); c.font=`bold ${Math.round(h*0.018)}px Tajawal`; c.textAlign='center';
      c.fillText('اضغط "أضف قطرة" للبدء 👇', dishX, dishY);
    }

    // إطار الثقب دائماً ظاهر
    c.strokeStyle = dark?'#F5D0FE':'#701A75'; c.lineWidth=2;
    c.beginPath(); c.arc(dishX,dishY,w*0.012,0,Math.PI*2); c.stroke();
    c.restore();

    c.fillStyle = g7sTxt(dark); c.font=`bold ${Math.round(h*0.018)}px Tajawal`; c.textAlign='center';
    c.fillText(S.micro ? '🔍 المستوى المجهري' : '🧪 طبق بتري (أجار)', dishX, dishY+dishR*1.15+h*0.05);

    g7sTitleBar(c, w, h, dark, '٥-١ · الانتشار');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}
