// ══════════════════════════════════════════════════════════════
// الوحدة ١ · النباتات — الصف الثامن (الفصل الدراسي الأول)
// نشاط ١-١ · التمثيل الضوئي
// ══════════════════════════════════════════════════════════════

// ─── ألوان الوحدة (بنفس روح ألوان الأحياء في المنصة) ───
function g8pBg(dark){ return dark ? '#0B1A10' : '#F0FAF3'; }
function g8pTxt(dark){ return dark ? '#C8EDD4' : '#1A3A25'; }
function g8pMut(dark){ return dark ? '#6BA87A' : '#4A7A5A'; }
function g8pAccent(dark){ return dark ? '#4ADE80' : '#16A34A'; }
function g8pCard(dark){ return dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.85)'; }

function g8pInfoPanel(lines, icon){
  return `<div class="q-box" style="font-size:14px;line-height:1.8">${icon ? `<strong>${icon}</strong><br>` : ''}${lines.join('<br>')}</div>`;
}

// ─── مساعد: رسم ورقة نبات واقعية (بيضاوية مدببة الطرف + عرق وسطي وعروق جانبية) ───
// (cx,cy) نقطة اتصال الورقة بالساق (القاعدة) — الورقة تمتد باتجاه angle
function _g8pDrawLeaf(c, cx, cy, length, width, angle, color, veinColor, sheen){
  c.save();
  c.translate(cx, cy);
  c.rotate(angle);
  // شكل الورقة: قاعدة عند (0,0)، طرف مدبب عند (length,0)
  c.beginPath();
  c.moveTo(0, 0);
  c.bezierCurveTo(length*0.12, -width*0.52, length*0.68, -width*0.5, length, 0);
  c.bezierCurveTo(length*0.68, width*0.5, length*0.12, width*0.52, 0, 0);
  c.closePath();
  c.fillStyle = color;
  c.fill();
  // بريق/لمعان خفيف أعلى الورقة (واقعية)
  if(sheen){
    c.save();
    c.clip();
    c.globalAlpha = 0.22;
    c.fillStyle = '#FFFFFF';
    c.beginPath();
    c.ellipse(length*0.42, -width*0.16, length*0.34, width*0.16, -0.15, 0, Math.PI*2);
    c.fill();
    c.globalAlpha = 1;
    c.restore();
  }
  // حافة الورقة
  c.lineWidth = Math.max(0.8, length*0.02);
  c.strokeStyle = veinColor;
  c.globalAlpha = 0.45;
  c.stroke();
  // العرق الوسطي
  c.beginPath();
  c.moveTo(length*0.05, 0);
  c.lineTo(length*0.9, 0);
  c.lineWidth = Math.max(0.8, length*0.02);
  c.globalAlpha = 0.55;
  c.stroke();
  // عروق جانبية
  for(let i=1; i<=3; i++){
    const fx = length*(0.22 + i*0.16);
    const fy = width*0.36*(1 - i*0.16);
    c.lineWidth = Math.max(0.6, length*0.012);
    c.beginPath(); c.moveTo(fx, 0); c.lineTo(fx + length*0.1, -fy); c.stroke();
    c.beginPath(); c.moveTo(fx, 0); c.lineTo(fx + length*0.1, fy); c.stroke();
  }
  c.globalAlpha = 1;
  c.restore();
}

// ─── مساعد: تدرّج لوني بين لونين (hex) ───
function _g8pLerpColor(hexA, hexB, t){
  t = Math.max(0, Math.min(1, t));
  const a = parseInt(hexA.slice(1), 16), b = parseInt(hexB.slice(1), 16);
  const ar = (a>>16)&255, ag=(a>>8)&255, ab=a&255;
  const br = (b>>16)&255, bg=(b>>8)&255, bb=b&255;
  const r = Math.round(ar + (br-ar)*t), g = Math.round(ag + (bg-ag)*t), bl = Math.round(ab + (bb-ab)*t);
  return `rgb(${r},${g},${bl})`;
}

// ─── مساعد: صوت خرير ماء خفيف (ضجيج مُرشَّح) ───
function _g8pPlayWater(dur){
  try{
    dur = dur || 2.4;
    const ac = new (window.AudioContext||window.webkitAudioContext)();
    const bufLen = Math.floor(ac.sampleRate*dur);
    const buf = ac.createBuffer(1, bufLen, ac.sampleRate);
    const d = buf.getChannelData(0);
    for(let i=0;i<bufLen;i++) d[i] = (Math.random()*2-1);
    const src = ac.createBufferSource(); src.buffer = buf;
    const flt = ac.createBiquadFilter(); flt.type='bandpass'; flt.frequency.value=2000; flt.Q.value=0.5;
    const lfo = ac.createOscillator(); lfo.frequency.value=3.2;
    const lfoGain = ac.createGain(); lfoGain.gain.value=400;
    lfo.connect(lfoGain); lfoGain.connect(flt.frequency);
    const g = ac.createGain(); const t = ac.currentTime;
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(0.06,t+0.35);
    g.gain.setValueAtTime(0.06,t+Math.max(0.4,dur-0.5));
    g.gain.linearRampToValueAtTime(0,t+dur);
    src.connect(flt); flt.connect(g); g.connect(ac.destination);
    lfo.start(t); src.start(t); src.stop(t+dur); lfo.stop(t+dur);
  }catch(e){}
}

// ─── مساعد: نقرة خفيفة عند الضغط على الأزرار ───
function _g8pPlayClick(){
  try{
    const ac = new (window.AudioContext||window.webkitAudioContext)();
    const o = ac.createOscillator(), g = ac.createGain();
    o.type='sine'; o.frequency.value=560;
    o.connect(g); g.connect(ac.destination);
    const t = ac.currentTime;
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(0.07,t+0.02);
    g.gain.exponentialRampToValueAtTime(0.001,t+0.16);
    o.start(t); o.stop(t+0.18);
  }catch(e){}
}

// ─── مساعد: صوت رياح خفيف ───
function _g8pPlayWind(dur){
  try{
    dur = dur || 3;
    const ac = new (window.AudioContext||window.webkitAudioContext)();
    const bufLen = Math.floor(ac.sampleRate*dur);
    const buf = ac.createBuffer(1, bufLen, ac.sampleRate);
    const d = buf.getChannelData(0);
    for(let i=0;i<bufLen;i++) d[i] = (Math.random()*2-1);
    const src = ac.createBufferSource(); src.buffer = buf;
    const flt = ac.createBiquadFilter(); flt.type='bandpass'; flt.frequency.value=650; flt.Q.value=0.7;
    const lfo = ac.createOscillator(); lfo.frequency.value=0.18;
    const lfoGain = ac.createGain(); lfoGain.gain.value=180;
    lfo.connect(lfoGain); lfoGain.connect(flt.frequency);
    const g = ac.createGain(); const t = ac.currentTime;
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(0.035,t+0.6);
    g.gain.setValueAtTime(0.035,t+Math.max(0.7,dur-0.6));
    g.gain.linearRampToValueAtTime(0,t+dur);
    src.connect(flt); flt.connect(g); g.connect(ac.destination);
    lfo.start(t); src.start(t); src.stop(t+dur); lfo.stop(t+dur);
  }catch(e){}
}
// ─── مساعد: بريق خفيف عند انتشار الصبغة ───
function _g8pPlaySparkle(){
  try{
    const ac = new (window.AudioContext||window.webkitAudioContext)();
    const t = ac.currentTime;
    [660,880,990].forEach((f,i)=>{
      const o=ac.createOscillator(), g=ac.createGain();
      o.type='sine'; o.frequency.value=f;
      o.connect(g); g.connect(ac.destination);
      const st=t+i*0.06;
      g.gain.setValueAtTime(0,st);
      g.gain.linearRampToValueAtTime(0.045,st+0.02);
      g.gain.exponentialRampToValueAtTime(0.001,st+0.22);
      o.start(st); o.stop(st+0.24);
    });
  }catch(e){}
}


function simG8Bio1N1a(){
  cancelAnimationFrame(animFrame);
  simState = { running:false, t:0, stageIdx:-1, bubbles:[] };
  const S = simState;

  const STAGES = [
    { at:0,    text:'🌑 <strong>النبات خامل</strong> — بيئة مظلمة، ولا ماء يصل إلى الجذور.' },
    { at:0.04, text:'☀️ ضوء الشمس بدأ يصل إلى الأوراق...' },
    { at:0.24, text:'💧 الماء ينساب من الجذور ويصعد عبر الساق نحو الأوراق...' },
    { at:0.48, text:'⚡ التمثيل الضوئي بدأ داخل الأوراق — طاقة الضوء تُستخدم الآن!' },
    { at:0.7,  text:'🫧 غاز الأكسجين يتحرّر ويخرج من الأوراق إلى الهواء!' },
    { at:1.02, text:'🌿 اكتملت العملية — النبات ينبض بالحياة بفضل الضوء والماء.' },
  ];

  function renderControls(){
    return `
      <div class="ctrl-section">
        <div class="ctrl-label">☀️ كيف يحدث التمثيل الضوئي؟</div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.8;margin-bottom:12px">
          النبات أمامك خامل الآن: بيئة مظلمة ولا ماء يصل جذوره. اضغط الزر وشاهد ما يحدث تدريجياً عند توفّر الظروف المناسبة.
        </div>
      </div>
      <button class="ctrl-btn play" id="g8p1Btn" onclick="window._g8p1Toggle()">${S.running ? '↺ أعد التجربة' : '☀️ ابدأ التمثيل الضوئي'}</button>
      <div id="g8p1Info" style="margin-top:14px;font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;border:1px solid rgba(39,174,96,0.18)">
        ${STAGES[0].text}
      </div>
      <div style="margin-top:14px;padding:10px;background:var(--bg-card2);border-radius:8px;border:1px solid rgba(26,143,168,0.18)">
        <div style="font-size:12px;font-weight:700;color:#0E7490;margin-bottom:4px">🔑 المفهوم</div>
        <div style="font-size:12px;color:#1A7A92;line-height:1.7">التمثيل الضوئي = عملية يصنع بها النبات غذاءه (سكّر) باستخدام ضوء الشمس والماء وثاني أكسيد الكربون، ويُطلق الأكسجين كناتج ثانوي.</div>
      </div>`;
  }
  controls(renderControls());

  window._g8p1Toggle = function(){
    if(S.running) return;
    S.running = true; S.t = 0.0001; S.stageIdx = 0; S.bubbles = [];
    _g8pPlayClick();
    const btn = document.getElementById('g8p1Btn');
    if(btn){ btn.textContent = '⏳ جارٍ العمل...'; btn.disabled = true; }
    setTimeout(()=>{ _g8pPlayWater(2.6); }, 900);
  };
  window._g8p1Reset = function(){
    S.running = false; S.t = 0; S.stageIdx = -1; S.bubbles = [];
    controls(renderControls());
  };

  const cv = document.getElementById('simCanvas');

  function draw(){
    if(currentSim!=='g8bio1n1' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();

    if(S.running) S.t += 0.0055;
    const t = S.t;
    const prog = (a,b) => Math.max(0, Math.min(1, (t-a)/(b-a)));

    const lightP = prog(0, 0.22);       // ظلام → ضوء
    const waterP = prog(0.16, 0.5);      // صعود الماء
    const glowP  = prog(0.42, 0.8);      // نشاط التمثيل الضوئي
    const o2P    = prog(0.62, 0.95);     // بدء تحرر الأكسجين
    const uprightP = prog(0.34, 0.85);   // استقامة النبات ونضارته

    // تحديث نص المرحلة عند العبور بحدّ جديد فقط
    for(let i=STAGES.length-1;i>=0;i--){
      if(t>=STAGES[i].at && S.stageIdx<i){
        S.stageIdx = i;
        const infoEl = document.getElementById('g8p1Info');
        if(infoEl) infoEl.innerHTML = STAGES[i].text;
        if(i===STAGES.length-1){
          const btn = document.getElementById('g8p1Btn');
          if(btn){ btn.textContent = '↺ أعد التجربة'; btn.disabled=false; btn.onclick=function(){ window._g8p1Reset(); }; }
        }
        break;
      }
    }

    // ── الخلفية: من غرفة مظلمة إلى سماء مضيئة ──
    const skyDark = '#141B14', skyLight = dark ? '#123018' : '#CDEBF7';
    const groundDark = '#241C14', groundLight = dark ? '#0F2416' : '#7CA85C';
    c.fillStyle = _g8pLerpColor(skyDark, skyLight, lightP);
    c.fillRect(0,0,w,h*0.72);
    c.fillStyle = _g8pLerpColor(groundDark, groundLight, lightP);
    c.fillRect(0,h*0.72,w,h*0.28);

    // ── الشمس والأشعة ──
    if(lightP>0.02){
      const sunX = w*0.78, sunY = h*0.16;
      c.save(); c.globalAlpha = lightP;
      const grad = c.createRadialGradient(sunX,sunY,2,sunX,sunY,h*0.14);
      grad.addColorStop(0,'#FFF3B0'); grad.addColorStop(1,'rgba(255,220,80,0)');
      c.fillStyle = grad; c.beginPath(); c.arc(sunX,sunY,h*0.14,0,Math.PI*2); c.fill();
      c.fillStyle = '#FBBF24'; c.beginPath(); c.arc(sunX,sunY,h*0.045,0,Math.PI*2); c.fill();
      // أشعة نحو النبات
      const plantX = w*0.42, plantY = h*0.46;
      for(let i=0;i<5;i++){
        const spread = (i-2)*0.06;
        c.strokeStyle = 'rgba(255,221,110,0.5)'; c.lineWidth = 2;
        c.beginPath();
        c.moveTo(sunX - Math.sin(spread)*20, sunY + Math.cos(spread)*10);
        c.lineTo(plantX + (sunX-plantX)*0.15 + Math.sin(spread)*w*0.12, plantY - h*0.1 + Math.cos(spread)*h*0.05);
        c.stroke();
      }
      c.restore();
    }

    // ── الوعاء والتربة ──
    const potX = w*0.42, potTopY = h*0.72, potW = w*0.16, potH = h*0.12;
    c.fillStyle = dark?'#7A4A2E':'#A0602F';
    c.beginPath(); c.moveTo(potX-potW/2,potTopY); c.lineTo(potX+potW/2,potTopY);
    c.lineTo(potX+potW*0.38,potTopY+potH); c.lineTo(potX-potW*0.38,potTopY+potH); c.closePath(); c.fill();
    // رطوبة التربة تزيد مع الماء
    c.fillStyle = _g8pLerpColor('#5C4530', '#2E2214', waterP);
    c.beginPath(); c.ellipse(potX,potTopY,potW/2,h*0.014,0,0,Math.PI*2); c.fill();

    // ── الجذور ──
    c.strokeStyle = dark?'rgba(220,200,170,0.5)':'rgba(120,80,45,0.6)'; c.lineWidth = 2;
    for(let i=-2;i<=2;i++){
      c.beginPath();
      c.moveTo(potX + i*potW*0.12, potTopY+h*0.01);
      c.quadraticCurveTo(potX + i*potW*0.22, potTopY+h*0.05, potX + i*potW*0.16, potTopY+h*0.09);
      c.stroke();
    }

    // ── الساق والأوراق (من الانحناء الخامل إلى الاستقامة النضرة) ──
    const stemBaseX = potX, stemBaseY = potTopY;
    const droop = (1-uprightP) * w*0.09;
    const stemTopX = stemBaseX + droop, stemTopY = stemBaseY - h*0.32*(0.55+0.45*uprightP);
    const leafColor = _g8pLerpColor('#8A9A6B', '#22A24A', uprightP);
    const stemColor = _g8pLerpColor('#7A8A5A', '#2E7D32', uprightP);

    c.strokeStyle = stemColor; c.lineWidth = Math.max(3, h*0.012); c.lineCap='round';
    c.beginPath(); c.moveTo(stemBaseX, stemBaseY);
    c.quadraticCurveTo(stemBaseX + droop*0.6, stemBaseY - h*0.16, stemTopX, stemTopY);
    c.stroke();

    // أوراق
    const leaves = [
      {along:0.45, side:1, size:1.0}, {along:0.62, side:-1, size:0.9},
      {along:0.8,  side:1, size:0.85}, {along:1.0,  side:-1, size:1.1},
    ];
    const dropA = 0.85, perkA = -0.42;
    leaves.forEach((lf,idx)=>{
      const lx = stemBaseX + droop*lf.along*0.6 + lf.side*w*0.012;
      const ly = stemBaseY - (stemBaseY-stemTopY)*lf.along;
      const baseA = dropA + (perkA-dropA)*uprightP;
      const angle = lf.side>0 ? baseA : (Math.PI - baseA);
      const leafLen = w*0.135*lf.size*(0.55+0.45*uprightP);
      const leafWid = w*0.058*lf.size*(0.55+0.45*uprightP);
      const veinColor = dark ? 'rgba(20,60,30,0.6)' : 'rgba(15,60,25,0.4)';

      _g8pDrawLeaf(c, lx, ly, leafLen, leafWid, angle, leafColor, veinColor, true);

      // توهج التمثيل الضوئي داخل الورقة
      if(glowP>0.03){
        const pulse = 0.5 + Math.sin(t*5 + idx)*0.5;
        const midX = lx + Math.cos(angle)*leafLen*0.52;
        const midY = ly + Math.sin(angle)*leafLen*0.52;
        c.save();
        c.globalAlpha = glowP*pulse*0.5;
        const gg = c.createRadialGradient(midX,midY,1,midX,midY,leafLen*0.4);
        gg.addColorStop(0,'#FFF6B0'); gg.addColorStop(1,'rgba(255,246,176,0)');
        c.fillStyle = gg;
        c.beginPath(); c.arc(midX,midY,leafLen*0.4,0,Math.PI*2); c.fill();
        c.globalAlpha = 1;
        c.restore();
      }

      // فقاعات أكسجين تنطلق من طرف هذه الورقة
      if(o2P>0.02 && Math.random() < 0.02*o2P){
        const tipX = lx + Math.cos(angle)*leafLen;
        const tipY = ly + Math.sin(angle)*leafLen;
        S.bubbles.push({x:tipX, y:tipY, age:0});
      }
    });

    // ── قطرات الماء الصاعدة داخل الساق ──
    if(waterP>0.01){
      const dropCount = Math.round(4*waterP);
      for(let i=0;i<dropCount;i++){
        const p = ((t*0.6 + i/dropCount) % 1);
        const dx = stemBaseX + droop*p*0.6;
        const dy = stemBaseY - (stemBaseY-stemTopY)*p*0.85;
        c.fillStyle = dark?'rgba(147,197,253,0.85)':'rgba(37,99,235,0.75)';
        c.beginPath(); c.arc(dx,dy,Math.max(2,h*0.007),0,Math.PI*2); c.fill();
      }
    }

    // ── فقاعات الأكسجين الطافية ──
    S.bubbles = S.bubbles.filter(b => b.age < 1);
    S.bubbles.forEach(b=>{
      b.age += 0.012;
      const by = b.y - b.age*h*0.28;
      const bx = b.x + Math.sin(b.age*8)*w*0.012;
      c.globalAlpha = 1 - b.age;
      c.fillStyle = dark?'rgba(147,197,253,0.7)':'rgba(59,130,246,0.6)';
      c.beginPath(); c.arc(bx,by,Math.max(3,h*0.012),0,Math.PI*2); c.fill();
      c.strokeStyle = dark?'#93C5FD':'#2563EB'; c.lineWidth=1;
      c.beginPath(); c.arc(bx,by,Math.max(3,h*0.012),0,Math.PI*2); c.stroke();
      c.globalAlpha = 1;
      if(b.age<0.5){
        c.fillStyle = dark?'#DBEAFE':'#1E3A8A';
        c.font = `bold ${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
        c.fillText('O₂', bx, by - h*0.02);
      }
    });

    // عنوان علوي
    c.fillStyle = g8pTxt(dark);
    c.font = `bold ${Math.round(h*0.036)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ١-١ · كيف يحدث التمثيل الضوئي؟', w/2, h*0.055);

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   نشاط ١-١ · التاب ٢ — تأثير الضوء على نمو النبات
════════════════════════════════════════ */
function simG8Bio1N1b(){
  cancelAnimationFrame(animFrame);
  simState = { step:0, seedAnim:0, waterAnim:0 };
  const S = simState;

  const STEP_BTNS = ['🌰 انثر البذور', '📍 ضع الأواني في أماكنها', '💧 اسقِ الوعاءين', '🔍 شاهد النتيجة'];
  const STEP_INFO = [
    '🌰 <strong>الخطوة ١:</strong> انثر كمية متساوية من البذور في وعاءين متطابقين يحتويان تربة متماثلة.',
    '📍 <strong>الخطوة ٢:</strong> ضع الوعاء الأول في مكان تصل إليه أشعة الشمس، وضع الوعاء الثاني في مكان مظلم تماماً. كل الظروف الأخرى متماثلة.',
    '💧 <strong>الخطوة ٣:</strong> اسقِ الوعاءين بنفس كمية الماء في الوقت نفسه — الماء متغيّر ثابت في هذه التجربة.',
    '🔍 <strong>الخطوة ٤:</strong> بعد أيام، لاحظ الفرق: النبات في الضوء ينمو أخضر ومورقاً، بينما النبات في الظلام يبقى ضعيفاً وشاحباً أو لا ينمو.',
  ];

  function renderControls(){
    return `<div style="padding:2px 0;font-family:Tajawal,sans-serif">
      <div class="ctrl-label" style="margin-bottom:10px">🌱 تأثير الضوء على نمو النبات</div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px">
        ${STEP_BTNS.map((label,i)=>`<button onclick="window._g8p1bStep(${i})" id="g8p1bBtn${i}" style="padding:10px 14px;border-radius:9px;border:2px solid ${i===S.step?'#27AE60':'#ddd'};background:${i===S.step?'#27AE60':'var(--bg-ctrl-btn)'};color:${i===S.step?'white':'var(--text-secondary)'};font-family:Tajawal,sans-serif;font-size:13px;font-weight:700;cursor:pointer;text-align:right;transition:all .15s">${label}</button>`).join('')}
      </div>
      <div id="g8p1bInfo" style="font-size:13px;color:var(--text-secondary);line-height:1.9;background:var(--bg-card2);border-radius:10px;padding:13px;border:1px solid rgba(39,174,96,0.18)">
        ${STEP_INFO[S.step]}
      </div>
      <div style="margin-top:14px;padding:10px;background:var(--bg-card2);border-radius:8px;border:1px solid rgba(26,143,168,0.18)">
        <div style="font-size:12px;font-weight:700;color:#0E7490;margin-bottom:4px">🔑 المفهوم</div>
        <div style="font-size:12px;color:#1A7A92;line-height:1.7">الضوء متغيّر مستقل هنا؛ الماء ونوع التربة وكمية البذور متغيرات ضابطة. الفرق في النمو يُثبت أن الضوء ضروري للتمثيل الضوئي.</div>
      </div>
    </div>`;
  }
  controls(renderControls());

  window._g8p1bStep = function(s){
    if(s===S.step && s!==0) { /* allow re-trigger of seed step animation */ }
    S.step = s;
    S.seedAnim = s===0 ? 0.0001 : (s>0?1:0);
    S.waterAnim = s===2 ? 0.0001 : (s>2?1:0);
    _g8pPlayClick();
    if(s===2) setTimeout(()=>_g8pPlayWater(1.8), 250);
    document.querySelectorAll('[id^="g8p1bBtn"]').forEach((b,i)=>{
      b.style.background = i===s ? '#27AE60' : 'var(--bg-ctrl-btn)';
      b.style.borderColor = i===s ? '#27AE60' : '#ddd';
      b.style.color = i===s ? 'white' : 'var(--text-secondary)';
    });
    const infoEl = document.getElementById('g8p1bInfo');
    if(infoEl) infoEl.innerHTML = STEP_INFO[s];
  };

  const cv = document.getElementById('simCanvas');
  let seeds = null;

  function initSeeds(){
    seeds = [];
    for(let i=0;i<8;i++){
      seeds.push({rx:Math.random()*2-1, ry:Math.random(), delay:Math.random()*0.5});
    }
  }
  initSeeds();

  function drawPot(c, cx, potY, potW, potH, dark, opts){
    // الوعاء
    c.fillStyle = dark?'#7A4A2E':'#A0602F';
    c.beginPath();
    c.moveTo(cx-potW/2,potY); c.lineTo(cx+potW/2,potY);
    c.lineTo(cx+potW*0.38,potY+potH); c.lineTo(cx-potW*0.38,potY+potH);
    c.closePath(); c.fill();
    // التربة
    c.fillStyle = opts.wet ? '#2E2214' : '#5C4530';
    c.beginPath(); c.ellipse(cx,potY,potW/2,potH*0.1,0,0,Math.PI*2); c.fill();
  }

  function draw(){
    if(currentSim!=='g8bio1n1' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    if(S.seedAnim>0 && S.seedAnim<1) S.seedAnim += 0.02;
    if(S.waterAnim>0 && S.waterAnim<1) S.waterAnim += 0.02;

    c.fillStyle = g8pBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle = g8pTxt(dark);
    c.font = `bold ${Math.round(h*0.036)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ١-١ · تأثير الضوء على نمو النبات', w/2, h*0.06);

    const potY = h*0.72, potW = w*0.15, potH = h*0.1;
    const leftX = w*0.28, rightX = w*0.72;

    // ── بيئة كل وعاء (من الخطوة ٢ فصاعداً) ──
    if(S.step>=1){
      // منطقة مضيئة يسار
      const grad = c.createRadialGradient(leftX,h*0.28,5,leftX,h*0.28,h*0.32);
      grad.addColorStop(0, dark?'rgba(255,236,150,0.28)':'rgba(255,236,150,0.55)');
      grad.addColorStop(1,'rgba(255,236,150,0)');
      c.fillStyle = grad; c.fillRect(leftX-w*0.22,h*0.05,w*0.44,h*0.6);
      c.font = `${Math.round(h*0.09)}px serif`; c.textAlign='center';
      c.fillText('☀️', leftX, h*0.18);
      c.font = `${Math.round(h*0.03)}px Tajawal`;
      c.fillStyle = g8pAccent(dark);
      c.fillText('ضوء الشمس', leftX, h*0.25);

      // صندوق مظلم يمين
      c.fillStyle = dark?'rgba(0,0,0,0.55)':'rgba(30,25,20,0.75)';
      c.beginPath(); c.roundRect(rightX-w*0.16, h*0.14, w*0.32, h*0.5, 10); c.fill();
      c.font = `${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
      c.fillStyle = '#DDD';
      c.fillText('بيئة مظلمة', rightX, h*0.2);
    } else {
      c.fillStyle = g8pMut(dark); c.font=`${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
      c.fillText('وعاءان متطابقان بنفس نوع التربة', w/2, h*0.2);
    }

    // ── الأوعية ──
    drawPot(c, leftX, potY, potW, potH, dark, {wet:S.waterAnim>0.3});
    drawPot(c, rightX, potY, potW, potH, dark, {wet:S.waterAnim>0.3});
    c.fillStyle = g8pTxt(dark); c.font = `bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText('الوعاء (أ)', leftX, potY+potH+h*0.04);
    c.fillText('الوعاء (ب)', rightX, potY+potH+h*0.04);

    // ── البذور المنتثرة ──
    if(S.seedAnim>0 && S.step<3){
      const p = Math.min(1,S.seedAnim);
      [leftX,rightX].forEach(cx=>{
        seeds.forEach(sd=>{
          const local = Math.max(0, Math.min(1, (p - sd.delay)/(1-sd.delay)));
          if(local<=0) return;
          const sx = cx + sd.rx*potW*0.32;
          const sy = potY - h*0.12*(1-local) + sd.ry*potH*0.35;
          c.fillStyle = dark?'#D6B77A':'#8B5E2E';
          c.beginPath(); c.ellipse(sx,sy,Math.max(2,h*0.006),Math.max(2,h*0.008),0,0,Math.PI*2); c.fill();
        });
      });
    }

    // ── ري الوعاءين ──
    if(S.step===2 && S.waterAnim>0 && S.waterAnim<1){
      [leftX,rightX].forEach(cx=>{
        for(let i=0;i<3;i++){
          const dy = potY - h*0.22 + ((S.waterAnim*3+i/3)%1)*h*0.22;
          c.fillStyle = dark?'rgba(147,197,253,0.85)':'rgba(37,99,235,0.75)';
          c.beginPath(); c.arc(cx + (i-1)*w*0.02, dy, Math.max(2,h*0.007),0,Math.PI*2); c.fill();
        }
      });
    }

    // ── نتيجة النمو (الخطوة ٤) ──
    if(S.step>=3){
      // نبات صحي في الضوء
      drawSprout(c, leftX, potY, w, h, dark, 1.0, g8pAccent(dark));
      // نبات ضعيف في الظلام
      drawSprout(c, rightX, potY, w, h, dark, 0.32, dark?'#B8A97A':'#C9B98A');
    }

    animFrame = requestAnimationFrame(draw);
  }

  function drawSprout(c, cx, potY, w, h, dark, growF, col){
    const stemH = h*0.22*growF;
    const veinColor = dark ? 'rgba(20,60,30,0.55)' : 'rgba(15,60,25,0.35)';
    c.strokeStyle = growF>0.6 ? col : (dark?'#8A7A55':'#A99565');
    c.lineWidth = Math.max(2,h*0.008); c.lineCap='round';
    c.beginPath(); c.moveTo(cx,potY-h*0.01); c.lineTo(cx,potY-stemH); c.stroke();
    if(growF>0.15){
      const midY = potY-stemH*0.75;
      _g8pDrawLeaf(c, cx, midY, w*0.09*growF, w*0.04*growF, Math.PI-0.55, col, veinColor, growF>0.6);
      _g8pDrawLeaf(c, cx, midY, w*0.09*growF, w*0.04*growF, -0.55, col, veinColor, growF>0.6);
    }
    if(growF>0.6){
      const topY = potY-stemH;
      _g8pDrawLeaf(c, cx, topY, w*0.11*growF, w*0.048*growF, Math.PI-0.32, col, veinColor, true);
      _g8pDrawLeaf(c, cx, topY, w*0.11*growF, w*0.048*growF, -0.32, col, veinColor, true);
    }
  }

  draw();
}

/* ════════════════════════════════════════
   نشاط ١-٢ · التاب ١ — استقصاء الورقة (لماذا خضراء؟)
════════════════════════════════════════ */
function simG8Bio1N2a(){
  cancelAnimationFrame(animFrame);
  simState = { zooming:false, zoom:0, chloroBtn:false, chloro:0, sparks:[], t:0, windOn:false };
  const S = simState;

  function renderControls(){
    let body;
    if(S.zoom < 0.98){
      body = `
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.8;margin-bottom:12px">
          شجرة كاملة تتمايل مع الهواء. اضغط الزر لتقترب تدريجياً حتى تصل إلى ورقة واحدة.
        </div>
        <button class="ctrl-btn play" id="g8pLeafZoomBtn" onclick="window._g8pLeafZoom()" ${S.zooming?'disabled':''}>🍃 لنستكشف الورقة</button>`;
    } else if(S.chloro < 0.98){
      body = `
        <div id="g8pLeafQ" style="font-size:14px;font-weight:700;color:var(--text-primary);background:var(--bg-card2);border-radius:10px;padding:14px;text-align:center;margin-bottom:12px">
          🤔 لماذا تبدو أوراق النباتات باللون الأخضر؟
        </div>
        <button class="ctrl-btn play" onclick="window._g8pAddChloro()">🧪 أضف صبغة الكلوروفيل</button>`;
    } else {
      body = `
        <div style="padding:14px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(39,174,96,0.3)">
          <div style="font-weight:700;color:#16A34A;margin-bottom:6px">🌿 الاستنتاج</div>
          <div style="color:var(--text-secondary);line-height:1.9;font-size:13px">تحتوي خلايا الورقة على صبغة <strong>الكلوروفيل</strong>، وهي التي تكسب الورقة لونها الأخضر.</div>
        </div>
        <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g8pLeafReset()">↺ أعد الاستكشاف</button>`;
    }
    return `
      <div class="ctrl-section">
        <div class="ctrl-label">🍃 استقصاء الورقة</div>
      </div>
      ${body}`;
  }
  controls(renderControls());

  window._g8pLeafZoom = function(){
    if(S.zooming) return;
    S.zooming = true; _g8pPlayClick();
    if(!S.windOn){ S.windOn = true; _g8pPlayWind(4.5); }
    const btn = document.getElementById('g8pLeafZoomBtn');
    if(btn){ btn.disabled = true; btn.textContent = '🔍 يقترب...'; }
  };
  window._g8pAddChloro = function(){
    if(S.chloro>0) return;
    S.chloro = 0.001; _g8pPlaySparkle();
    setTimeout(()=>_g8pPlaySparkle(), 500);
    setTimeout(()=>_g8pPlaySparkle(), 1000);
  };
  window._g8pLeafReset = function(){
    S.zoom = 0; S.zooming = false; S.chloro = 0; S.sparks = [];
    controls(renderControls());
  };

  const cv = document.getElementById('simCanvas');
  // موقع افتراضي للورقة البطلة داخل الشجرة (إحداثيات عالمية 0..1000)
  const leafWorld = { x:640, y:330 };
  const canopyLeaves = [];
  for(let i=0;i<26;i++){
    const ang = Math.random()*Math.PI*2, rad = 70+Math.random()*140;
    canopyLeaves.push({ x:500+Math.cos(ang)*rad, y:260+Math.sin(ang)*rad*0.7, size:16+Math.random()*10, ph:Math.random()*10 });
  }

  function draw(){
    if(currentSim!=='g8bio1n2' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    S.t += 0.016;
    if(S.zooming && S.zoom<1){ S.zoom += 0.007; if(S.zoom>=1){ S.zoom=1; S.zooming=false; controls(renderControls()); } }
    if(S.chloro>0 && S.chloro<1){ S.chloro += 0.006; if(S.chloro>=1){ S.chloro=1; controls(renderControls()); } }

    // خلفية سماء تتدرج
    const sky = c.createLinearGradient(0,0,0,h);
    sky.addColorStop(0, dark?'#16233A':'#BEE7F5'); sky.addColorStop(1, dark?'#1C2E22':'#DDF2DE');
    c.fillStyle = sky; c.fillRect(0,0,w,h);

    // === نظام الكاميرا: نتحرك من مشهد الشجرة الكاملة إلى تكبير الورقة ===
    const camScale = 1 + S.zoom*S.zoom*22;         // تكبير تصاعدي ناعم
    const focal = { x: 500 + (leafWorld.x-500)*S.zoom, y: 400 + (leafWorld.y-400)*S.zoom };
    const worldToScreen = (wx,wy) => ({
      x: w/2 + (wx-focal.x) * (camScale * w/1000),
      y: h*0.62 + (wy-focal.y) * (camScale * w/1000),
    });

    // أرضية
    if(S.zoom<0.9){
      const g0 = worldToScreen(0,760), g1 = worldToScreen(1000,760);
      c.fillStyle = dark?'#1B3324':'#8FBE72';
      c.fillRect(0, g0.y, w, h-g0.y);
    }
    // جذع
    const sway = Math.sin(S.t*0.7)*4;
    if(S.zoom<0.95){
      const t0 = worldToScreen(500+sway*0.2,760), t1 = worldToScreen(500+sway,300);
      c.strokeStyle = dark?'#5C4530':'#7A5A38'; c.lineWidth = Math.max(2, 26*camScale*w/1000);
      c.lineCap='round';
      c.beginPath(); c.moveTo(t0.x,t0.y); c.lineTo(t1.x,t1.y); c.stroke();
    }
    // مظلة الشجرة (أوراق صغيرة متمايلة)
    if(S.zoom<0.85){
      canopyLeaves.forEach(lf=>{
        const wob = Math.sin(S.t*1.4+lf.ph)*6;
        const p = worldToScreen(lf.x+wob*0.4+sway*0.5, lf.y+wob*0.2);
        const rad = Math.max(1, lf.size*camScale*w/1000);
        c.globalAlpha = Math.max(0, 1-S.zoom*1.3);
        c.fillStyle = g8pAccent(dark);
        c.beginPath(); c.arc(p.x,p.y,rad,0,Math.PI*2); c.fill();
        c.globalAlpha = 1;
      });
    }

    // الورقة البطلة (تكبر مع الزوم، تتمايل، ولونها يتحول للأخضر)
    const leafScreen = worldToScreen(leafWorld.x, leafWorld.y);
    const leafSway = Math.sin(S.t*1.6)*(0.12*(1-S.zoom*0.6));
    const leafLen = Math.max(18, 90*camScale*w/1000*0.22);
    const leafWid = leafLen*0.42;
    const paleColor = dark? '#8A8570':'#C9C4A8';
    const greenColor = g8pAccent(dark);
    const leafColor = _g8pLerpColor(paleColor, greenColor, S.chloro);
    const veinColor = dark? 'rgba(20,40,20,0.5)':'rgba(30,60,20,0.35)';
    _g8pDrawLeaf(c, leafScreen.x, leafScreen.y, leafLen, leafWid, -Math.PI/2+0.15+leafSway, leafColor, veinColor, true);

    // انتشار صبغة الكلوروفيل (جزيئات خضراء داخل الورقة)
    if(S.chloro>0 && S.chloro<1){
      if(Math.random()<0.5) S.sparks.push({ a:Math.random()*Math.PI*2, r:0, age:0 });
      S.sparks = S.sparks.filter(sp=>sp.age<1);
      S.sparks.forEach(sp=>{
        sp.age += 0.03; sp.r = sp.age*leafLen*0.75;
        const px = leafScreen.x + Math.cos(-Math.PI/2+0.15+leafSway)*sp.r*0.6 + Math.cos(sp.a)*leafWid*0.3*sp.age;
        const py = leafScreen.y + Math.sin(-Math.PI/2+0.15+leafSway)*sp.r*0.6 + Math.sin(sp.a)*leafWid*0.3*sp.age;
        c.globalAlpha = (1-sp.age)*0.8;
        c.fillStyle = '#4ADE80';
        c.beginPath(); c.arc(px,py,3.5,0,Math.PI*2); c.fill();
        c.globalAlpha = 1;
      });
    }

    // عنوان علوي
    c.fillStyle = g8pTxt(dark);
    c.font = `bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ١-٢ · استقصاء الورقة', w/2, h*0.055);

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   نشاط ١-٢ · التاب ٢ — دعونا نتعرف على أجزاء النبات
════════════════════════════════════════ */
function simG8Bio1N2b(){
  cancelAnimationFrame(animFrame);
  const PARTS = [
    { id:'root',   name:'الجذر',  tx:0.5, ty:0.84, fn:'يُثبِّت النبات في التربة ويمتصّ الماء والأملاح المعدنية.' },
    { id:'stem',   name:'الساق',  tx:0.5, ty:0.55, fn:'تدعم النبات وتنقل الماء والغذاء بين الجذر والأوراق.' },
    { id:'leaf',   name:'الورقة', tx:0.32,ty:0.4,  fn:'تصنع الغذاء بعملية التمثيل الضوئي وتتبادل الغازات مع الهواء.' },
    { id:'flower', name:'الزهرة', tx:0.5, ty:0.16, fn:'الجزء المسؤول عن تكاثر النبات وإنتاج البذور.' },
  ];
  simState = { explored:[], active:null, t:0 };
  const S = simState;

  function renderControls(){
    const n = S.explored.length;
    let body = `<div style="font-size:13px;color:var(--text-secondary);line-height:1.8;margin-bottom:10px">اضغط أي جزء من النبات في الشاشة المقابلة لتتعرّف عليه.</div>
      <div style="font-weight:700;color:#27AE60;margin-bottom:10px">استكشفت ${n} من ${PARTS.length} أجزاء</div>`;
    if(S.active){
      const p = PARTS.find(pp=>pp.id===S.active);
      body += `<div style="padding:13px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(39,174,96,0.25)">
        <div style="font-weight:700;color:#16A34A;margin-bottom:6px">${p.name}</div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.8">${p.fn}</div>
      </div>`;
    }
    if(n===PARTS.length){
      body += `<div style="margin-top:12px;padding:12px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(39,174,96,0.3);font-weight:700;color:#16A34A">🎉 أحسنت! لقد استكشفت أجزاء النبات ووظيفة كل جزء.</div>`;
    }
    return `<div class="ctrl-section"><div class="ctrl-label">🌱 أجزاء النبات</div></div>${body}`;
  }
  controls(renderControls());

  const cv = document.getElementById('simCanvas');
  function relPos(e){
    const rect = cv.getBoundingClientRect();
    const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
    return { x:(t.clientX-rect.left)/cv.offsetWidth, y:(t.clientY-rect.top)/cv.offsetHeight };
  }
  function onClick(e){
    const p = relPos(e);
    PARTS.forEach(part=>{
      if(Math.abs(p.x-part.tx)<0.09 && Math.abs(p.y-part.ty)<0.09){
        S.active = part.id; _g8pPlayClick();
        if(!S.explored.includes(part.id)){ S.explored.push(part.id); if(S.explored.length===PARTS.length) _g8pPlaySparkle(); }
        controls(renderControls());
      }
    });
  }
  cv.onmousedown = onClick;
  cv.ontouchstart = e=>{ e.preventDefault(); onClick(e); };
  cv.onmousemove=null; cv.onmouseup=null; cv.onmouseleave=null; cv.ontouchmove=null; cv.ontouchend=null;

  function draw(){
    if(currentSim!=='g8bio1n2' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    S.t += 0.016;
    c.fillStyle = g8pBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle = g8pTxt(dark);
    c.font = `bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ١-٢ · أجزاء النبات', w/2, h*0.05);

    const stemBase = { x:w*0.5, y:h*0.86 }, stemTop = { x:w*0.5, y:h*0.18 };
    // جذور
    c.strokeStyle = dark?'rgba(210,180,150,0.6)':'rgba(120,80,45,0.55)'; c.lineWidth=Math.max(2,h*0.008);
    for(let i=-2;i<=2;i++){
      c.beginPath(); c.moveTo(stemBase.x, stemBase.y);
      c.quadraticCurveTo(stemBase.x+i*w*0.05, stemBase.y+h*0.06, stemBase.x+i*w*0.07, stemBase.y+h*0.11);
      c.stroke();
    }
    // ساق
    c.strokeStyle = g8pAccent(dark); c.lineWidth = Math.max(3,h*0.012); c.lineCap='round';
    c.beginPath(); c.moveTo(stemBase.x, stemBase.y); c.lineTo(stemTop.x, stemTop.y+h*0.05); c.stroke();
    // ورقتان جانبيتان
    [-1,1].forEach(side=>{
      const attach = { x: w*0.5, y: h*0.4 };
      _g8pDrawLeaf(c, attach.x, attach.y, w*0.13, w*0.06, side<0?Math.PI-0.5:-0.5, g8pAccent(dark), 'rgba(20,60,20,0.3)', true);
    });
    // زهرة أعلى الساق
    const flX=stemTop.x, flY=stemTop.y;
    for(let i=0;i<6;i++){
      const ang = i/6*Math.PI*2;
      c.fillStyle = '#F8B4D9';
      c.beginPath(); c.ellipse(flX+Math.cos(ang)*w*0.03, flY+Math.sin(ang)*w*0.03, w*0.022, w*0.014, ang, 0, Math.PI*2); c.fill();
    }
    c.fillStyle='#F5B041'; c.beginPath(); c.arc(flX,flY,w*0.016,0,Math.PI*2); c.fill();

    // نقاط تفاعلية نابضة + تأثير توضيحي عند التنشيط
    const PARTS_POS = { root:{x:w*0.5,y:h*0.84}, stem:{x:w*0.5,y:h*0.55}, leaf:{x:w*0.32,y:h*0.4}, flower:{x:w*0.5,y:h*0.16} };
    Object.entries(PARTS_POS).forEach(([id,pos])=>{
      const pulse = 0.5+Math.sin(S.t*2.4)*0.5;
      const active = S.active===id;
      c.save();
      c.globalAlpha = active ? 0.9 : 0.35+pulse*0.25;
      c.strokeStyle = active ? '#16A34A' : (dark?'#E8E4D8':'#2C3A4A');
      c.lineWidth = active?3:2;
      c.beginPath(); c.arc(pos.x,pos.y, w*0.028*(active?1.2:1), 0, Math.PI*2); c.stroke();
      c.restore();
      if(active){
        // رسوم متحركة توضيحية بسيطة لكل جزء
        if(id==='root'){
          const p = (S.t*0.6)%1;
          c.fillStyle='#3B82F6'; c.globalAlpha=1-p;
          c.beginPath(); c.arc(pos.x, pos.y - p*h*0.25, 3, 0, Math.PI*2); c.fill(); c.globalAlpha=1;
        } else if(id==='stem'){
          const p = (S.t*0.6)%1;
          c.fillStyle='#3B82F6'; c.globalAlpha=1-p;
          c.beginPath(); c.arc(pos.x, stemBase.y - p*(stemBase.y-stemTop.y), 3, 0, Math.PI*2); c.fill(); c.globalAlpha=1;
        } else if(id==='leaf'){
          c.font=`${Math.round(h*0.03)}px serif`; c.textAlign='center';
          c.globalAlpha = 0.5+Math.sin(S.t*3)*0.5;
          c.fillText('☀️', pos.x, pos.y-h*0.06); c.globalAlpha=1;
        } else if(id==='flower'){
          const p=(S.t*1.2)%1;
          c.fillStyle='#FBBF24'; c.globalAlpha=1-p;
          c.beginPath(); c.arc(pos.x+Math.cos(p*6)*w*0.02, pos.y-p*h*0.05, 2.5, 0, Math.PI*2); c.fill(); c.globalAlpha=1;
        }
      }
    });

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   نشاط ١-٢ · التاب ٣ — المختبر الافتراضي: الثغور
════════════════════════════════════════ */
function simG8Bio1N2c(){
  cancelAnimationFrame(animFrame);
  simState = { surface:'upper', counts:{upper:0,lower:0}, marked:{upper:[],lower:[]}, stomata:{upper:[],lower:[]}, stage:'count', predicted:null };
  const S = simState;

  function genStomata(n){
    const arr = [];
    for(let i=0;i<n;i++) arr.push({ x:0.1+Math.random()*0.8, y:0.15+Math.random()*0.7, ang:Math.random()*Math.PI });
    return arr;
  }
  S.stomata.upper = genStomata(6);
  S.stomata.lower = genStomata(18);

  function renderControls(){
    if(S.stage==='count'){
      const doneBoth = S.stomata.upper.length===S.marked.upper.length && S.stomata.lower.length===S.marked.lower.length;
      return `
        <div class="ctrl-section">
          <div class="ctrl-label">🔬 مختبر الثغور</div>
          <div style="font-size:13px;color:var(--text-secondary);line-height:1.8;margin-bottom:10px">افحص السطحين تحت المجهر الافتراضي، واضغط على كل ثغر لتعدّه.</div>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:12px">
          <button id="g8pSurfUp" onclick="window._g8pSurf('upper')" style="flex:1;padding:10px;border-radius:9px;border:2px solid ${S.surface==='upper'?'#27AE60':'#ddd'};background:${S.surface==='upper'?'#27AE60':'var(--bg-ctrl-btn)'};color:${S.surface==='upper'?'white':'var(--text-secondary)'};font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">⬆️ السطح العلوي</button>
          <button id="g8pSurfDn" onclick="window._g8pSurf('lower')" style="flex:1;padding:10px;border-radius:9px;border:2px solid ${S.surface==='lower'?'#27AE60':'#ddd'};background:${S.surface==='lower'?'#27AE60':'var(--bg-ctrl-btn)'};color:${S.surface==='lower'?'white':'var(--text-secondary)'};font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">⬇️ السطح السفلي</button>
        </div>
        <div style="font-weight:700;color:#27AE60">عدد الثغور المعدودة: ${S.marked[S.surface].length} / ${S.stomata[S.surface].length}</div>
        <div style="margin-top:6px;font-size:12px;color:var(--text-secondary)">العلوي: ${S.marked.upper.length} · السفلي: ${S.marked.lower.length}</div>
        ${doneBoth ? `<button class="ctrl-btn play" style="margin-top:12px" onclick="window._g8pStomataCompare()">📊 قارن السطحين</button>` : ''}`;
    }
    if(S.stage==='predict'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🔬 مختبر الثغور</div></div>
        <div style="font-size:14px;font-weight:700;text-align:center;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px">هل يتساوى عدد الثغور في السطحين العلوي والسفلي؟</div>
        <div style="display:flex;gap:8px">
          <button onclick="window._g8pPredict(true)" style="flex:1;padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-weight:700;cursor:pointer">نعم، متساوٍ</button>
          <button onclick="window._g8pPredict(false)" style="flex:1;padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-weight:700;cursor:pointer">لا، مختلف</button>
        </div>`;
    }
    const correct = S.marked.lower.length !== S.marked.upper.length;
    const predOk = S.predicted === correct;
    return `
      <div class="ctrl-section"><div class="ctrl-label">🔬 مختبر الثغور</div></div>
      <div style="padding:13px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(39,174,96,0.25);margin-bottom:10px">
        <div style="font-size:13px;color:var(--text-secondary)">${predOk ? '✅ توقّعك كان صحيحاً!' : '📌 لاحظ الفرق بين النتيجتين:'}</div>
      </div>
      <div style="padding:12px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(39,174,96,0.3)">
        <div style="font-weight:700;color:#16A34A;margin-bottom:6px">🎉 الاستنتاج</div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.8">عدد الثغور في السطح السفلي (${S.marked.lower.length}) أكبر من عدده في السطح العلوي (${S.marked.upper.length}) — وهذا شائع في كثير من النباتات.</div>
      </div>
      <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g8pStomataRestart()">↺ أعد المختبر</button>`;
  }
  controls(renderControls());

  window._g8pSurf = function(s){ S.surface = s; _g8pPlayClick(); controls(renderControls()); };
  window._g8pStomataCompare = function(){ S.stage='predict'; _g8pPlayClick(); controls(renderControls()); };
  window._g8pPredict = function(v){
    S.predicted = v; _g8pPlayClick();
    const correct = S.marked.lower.length !== S.marked.upper.length;
    _g8pPlaySparkle();
    S.stage='conclude'; controls(renderControls());
  };
  window._g8pStomataRestart = function(){
    S.marked = {upper:[],lower:[]}; S.stomata.upper = genStomata(6); S.stomata.lower = genStomata(18);
    S.stage='count'; S.predicted=null; controls(renderControls());
  };

  const cv = document.getElementById('simCanvas');
  function relPos(e){
    const rect = cv.getBoundingClientRect();
    const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
    return { x:(t.clientX-rect.left)/cv.offsetWidth, y:(t.clientY-rect.top)/cv.offsetHeight };
  }
  function onClick(e){
    if(S.stage!=='count') return;
    const p = relPos(e);
    const list = S.stomata[S.surface];
    list.forEach((st,i)=>{
      if(S.marked[S.surface].includes(i)) return;
      if(Math.abs(p.x-st.x)<0.05 && Math.abs(p.y-st.y)<0.05){
        S.marked[S.surface].push(i); _g8pPlayClick();
        controls(renderControls());
      }
    });
  }
  cv.onmousedown = onClick;
  cv.ontouchstart = e=>{ e.preventDefault(); onClick(e); };
  cv.onmousemove=null; cv.onmouseup=null; cv.onmouseleave=null; cv.ontouchmove=null; cv.ontouchend=null;

  function drawStoma(c,x,y,r,ang,marked,dark){
    c.save(); c.translate(x,y); c.rotate(ang);
    c.fillStyle = marked ? '#27AE60' : (dark?'#3A5A42':'#5CA86E');
    c.beginPath(); c.ellipse(-r*0.4,0,r*0.55,r*0.9,0,0,Math.PI*2); c.fill();
    c.beginPath(); c.ellipse(r*0.4,0,r*0.55,r*0.9,0,0,Math.PI*2); c.fill();
    c.fillStyle = dark?'#12251A':'#0B4A20';
    c.beginPath(); c.ellipse(0,0,r*0.28,r*0.55,0,0,Math.PI*2); c.fill();
    if(marked){ c.strokeStyle='#16A34A'; c.lineWidth=2; c.beginPath(); c.arc(0,0,r*1.6,0,Math.PI*2); c.stroke(); }
    c.restore();
  }

  function draw(){
    if(currentSim!=='g8bio1n2' || currentTab!==2){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    c.fillStyle = g8pBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle = g8pTxt(dark);
    c.font = `bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ١-٢ · مختبر الثغور', w/2, h*0.05);

    if(S.stage==='count'){
      // إطار المجهر
      c.strokeStyle = '#94A3B8'; c.lineWidth=4;
      c.beginPath(); c.arc(w*0.5,h*0.48,Math.min(w,h)*0.38,0,Math.PI*2); c.stroke();
      c.save(); c.beginPath(); c.arc(w*0.5,h*0.48,Math.min(w,h)*0.38,0,Math.PI*2); c.clip();
      c.fillStyle = dark?'#0F2818':'#DFF5E4'; c.fillRect(0,0,w,h);
      S.stomata[S.surface].forEach((st,i)=>{
        drawStoma(c, st.x*w, st.y*h, Math.min(w,h)*0.028, st.ang, S.marked[S.surface].includes(i), dark);
      });
      c.restore();
      c.fillStyle = g8pMut(dark); c.font=`bold ${Math.round(h*0.022)}px Tajawal`;
      c.fillText(S.surface==='upper' ? '⬆️ السطح العلوي — تكبير المجهر' : '⬇️ السطح السفلي — تكبير المجهر', w/2, h*0.9);
    } else if(S.stage==='predict'){
      c.font = `${Math.round(h*0.13)}px serif`; c.fillText('🔬', w/2, h*0.42);
      c.fillStyle = g8pMut(dark); c.font=`${Math.round(h*0.026)}px Tajawal`;
      c.fillText('فكّر قبل أن ترى النتيجة!', w/2, h*0.58);
    } else {
      const maxCount = Math.max(S.marked.upper.length, S.marked.lower.length, 1);
      const barW = w*0.18;
      [['upper','⬆️ العلوي',w*0.35,'#5DADE2'],['lower','⬇️ السفلي',w*0.65,'#27AE60']].forEach(([key,label,x,color])=>{
        const val = S.marked[key].length;
        const barH = (val/maxCount)*h*0.4;
        c.fillStyle = color;
        c.fillRect(x-barW/2, h*0.7-barH, barW, barH);
        c.fillStyle = g8pTxt(dark); c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
        c.fillText(val, x, h*0.7-barH-h*0.02);
        c.font=`${Math.round(h*0.022)}px Tajawal`;
        c.fillText(label, x, h*0.75);
      });
      c.strokeStyle = g8pMut(dark); c.lineWidth=1;
      c.beginPath(); c.moveTo(w*0.15,h*0.7); c.lineTo(w*0.85,h*0.7); c.stroke();
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}
