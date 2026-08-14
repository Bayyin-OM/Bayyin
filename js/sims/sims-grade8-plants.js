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
  for(let i=0;i<30;i++){
    const ang = Math.random()*Math.PI*2, rad = 60+Math.random()*170;
    canopyLeaves.push({ x:490+Math.cos(ang)*rad, y:250+Math.sin(ang)*rad*0.72, size:10+Math.random()*8, ph:Math.random()*10 });
  }
  // تجمّعات ورقية غير منتظمة تُكوِّن مظلة الشجرة (كل تجمّع = عدة دوائر متراكبة بإزاحات ثابتة)
  const clusterCenters = [
    {x:490,y:230,r:95}, {x:400,y:280,r:78}, {x:585,y:275,r:82},
    {x:445,y:170,r:70}, {x:540,y:180,r:66}, {x:470,y:330,r:72}, {x:355,y:220,r:60},
  ];
  const canopyBlobs = clusterCenters.map(cc=>{
    const puffs = [];
    const n = 5 + Math.floor(Math.random()*2);
    for(let i=0;i<n;i++){
      const a = (i/n)*Math.PI*2 + Math.random()*0.4;
      const d = cc.r*0.42*(0.6+Math.random()*0.5);
      puffs.push({ dx:Math.cos(a)*d, dy:Math.sin(a)*d*0.75, r:cc.r*(0.42+Math.random()*0.22) });
    }
    return { ...cc, puffs, shade: Math.random() };
  });

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
    const px = (d) => d * camScale * w/1000; // تحويل بُعد عالمي إلى بكسل الشاشة

    // أرضية
    if(S.zoom<0.9){
      const g0 = worldToScreen(0,760);
      const grd = c.createLinearGradient(0,g0.y,0,h);
      grd.addColorStop(0, dark?'#1B3324':'#9FCB80'); grd.addColorStop(1, dark?'#122318':'#7CAE5E');
      c.fillStyle = grd; c.fillRect(0, g0.y, w, h-g0.y);
    }
    const sway = Math.sin(S.t*0.7)*4;

    // جذع مخروطي واقعي (مضلّع متدرّج العرض) مع فروع بسيطة
    if(S.zoom<0.95){
      const baseW = px(34), topW = px(11);
      const baseX = worldToScreen(500+sway*0.2,760).x, baseY = worldToScreen(500+sway*0.2,760).y;
      const topX = worldToScreen(500+sway,300).x, topY = worldToScreen(500+sway,300).y;
      const trunkGrad = c.createLinearGradient(baseX-baseW/2, baseY, baseX+baseW/2, topY);
      trunkGrad.addColorStop(0, dark?'#3E2E1E':'#5A4128');
      trunkGrad.addColorStop(0.5, dark?'#5C4530':'#8A6640');
      trunkGrad.addColorStop(1, dark?'#3E2E1E':'#5A4128');
      c.fillStyle = trunkGrad;
      c.beginPath();
      c.moveTo(baseX-baseW/2, baseY);
      c.quadraticCurveTo(baseX-baseW*0.42, baseY-(baseY-topY)*0.5, topX-topW/2, topY);
      c.lineTo(topX+topW/2, topY);
      c.quadraticCurveTo(baseX+baseW*0.42, baseY-(baseY-topY)*0.5, baseX+baseW/2, baseY);
      c.closePath(); c.fill();
      // خطوط لحاء خفيفة
      c.strokeStyle = dark?'rgba(0,0,0,0.25)':'rgba(60,35,15,0.25)'; c.lineWidth=Math.max(1,px(1.5));
      for(let i=-1;i<=1;i++){
        c.beginPath();
        c.moveTo(baseX+i*baseW*0.22, baseY-px(6));
        c.quadraticCurveTo(baseX+i*baseW*0.16-(baseY-topY)*0*0, baseY-(baseY-topY)*0.5, topX+i*topW*0.15, topY+px(10));
        c.stroke();
      }
      // فرعان بسيطان
      [-1,1].forEach(side=>{
        const bx0 = worldToScreen(500+sway*0.6, 420).x, by0 = worldToScreen(500+sway*0.6,420).y;
        const bx1 = worldToScreen(500+side*90+sway, 300).x, by1 = worldToScreen(500+side*90+sway,300).y;
        c.strokeStyle = dark?'#4A3722':'#6E5030'; c.lineWidth = Math.max(1.5, px(7));
        c.lineCap='round';
        c.beginPath(); c.moveTo(bx0,by0); c.lineTo(bx1,by1); c.stroke();
      });
    }

    // مظلة الشجرة: تجمّعات ورقية غير منتظمة بدرجات لونية متعددة لإحساس أعمق بالحجم
    if(S.zoom<0.85){
      c.globalAlpha = Math.max(0, 1-S.zoom*1.35);
      const darkGreen = dark? '#0F3A1E':'#2E7D32', midGreen = dark?'#1C5A2E':'#3F9142', lightGreen = dark?'#2E7A3E':'#5CB85C';
      canopyBlobs.forEach((cl,ci)=>{
        const wob = Math.sin(S.t*0.9+ci)*3;
        cl.puffs.forEach((pf,pi)=>{
          const p = worldToScreen(cl.x+pf.dx+wob*0.6+sway*0.5, cl.y+pf.dy+wob*0.3);
          const r = px(pf.r);
          const shadeVal = (cl.shade + pi*0.13) % 1;
          c.fillStyle = shadeVal<0.33 ? darkGreen : shadeVal<0.7 ? midGreen : lightGreen;
          c.beginPath(); c.arc(p.x,p.y,r,0,Math.PI*2); c.fill();
        });
      });
      c.globalAlpha = 1;
      // بريق أوراق صغيرة متمايلة فوق التجمعات لإحساس بالحركة
      canopyLeaves.forEach(lf=>{
        const wob = Math.sin(S.t*1.4+lf.ph)*6;
        const p = worldToScreen(lf.x+wob*0.4+sway*0.5, lf.y+wob*0.2);
        const rad = Math.max(1, px(lf.size*0.5));
        c.globalAlpha = Math.max(0, (1-S.zoom*1.3)*0.55);
        c.fillStyle = lightGreen;
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
    { id:'root',   name:'الجذر',  fn:'يُثبِّت النبات في التربة ويمتصّ الماء والأملاح المعدنية.' },
    { id:'stem',   name:'الساق',  fn:'تدعم النبات وتنقل الماء والغذاء بين الجذر والأوراق.' },
    { id:'leaf',   name:'الورقة', fn:'تصنع الغذاء بعملية التمثيل الضوئي وتتبادل الغازات مع الهواء.' },
    { id:'flower', name:'الزهرة', fn:'الجزء المسؤول عن تكاثر النبات وإنتاج البذور.' },
  ];
  simState = { explored:[], active:null, t:0, hotspots:{} };
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
    const w = cv.width, h = cv.height;
    const px = p.x*w, py = p.y*h;
    let best = null, bestDist = Infinity;
    PARTS.forEach(part=>{
      const hp = S.hotspots[part.id];
      if(!hp) return;
      const d = Math.hypot(px-hp.x, py-hp.y);
      if(d < w*0.045 && d < bestDist){ best = part; bestDist = d; }
    });
    if(best){
      S.active = best.id; _g8pPlayClick();
      if(!S.explored.includes(best.id)){ S.explored.push(best.id); if(S.explored.length===PARTS.length) _g8pPlaySparkle(); }
      controls(renderControls());
    }
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

    const stemBase = { x:w*0.5, y:h*0.86 }, stemTop = { x:w*0.5, y:h*0.23 };
    // جذور
    c.strokeStyle = dark?'rgba(210,180,150,0.6)':'rgba(120,80,45,0.55)'; c.lineWidth=Math.max(2,h*0.008);
    for(let i=-2;i<=2;i++){
      c.beginPath(); c.moveTo(stemBase.x, stemBase.y);
      c.quadraticCurveTo(stemBase.x+i*w*0.05, stemBase.y+h*0.06, stemBase.x+i*w*0.07, stemBase.y+h*0.11);
      c.stroke();
    }
    // ساق
    c.strokeStyle = g8pAccent(dark); c.lineWidth = Math.max(3,h*0.012); c.lineCap='round';
    c.beginPath(); c.moveTo(stemBase.x, stemBase.y); c.lineTo(stemTop.x, stemTop.y); c.stroke();
    // ورقتان جانبيتان (نحسب موقع كل ورقة بدقة لاستخدامه لاحقاً كموضع النقطة التفاعلية)
    const leafAttach = { x: w*0.5, y: h*0.48 };
    const leafLen = w*0.13, leafAngles = [Math.PI-0.5, -0.5];
    const leafCentroids = leafAngles.map(ang => ({
      x: leafAttach.x + Math.cos(ang)*leafLen*0.45,
      y: leafAttach.y + Math.sin(ang)*leafLen*0.45,
    }));
    leafAngles.forEach((ang,i)=>{
      _g8pDrawLeaf(c, leafAttach.x, leafAttach.y, leafLen, w*0.06, ang, g8pAccent(dark), 'rgba(20,60,20,0.3)', true);
    });
    // زهرة أعلى الساق
    const flX=stemTop.x, flY=stemTop.y;
    for(let i=0;i<6;i++){
      const ang = i/6*Math.PI*2;
      c.fillStyle = '#F8B4D9';
      c.beginPath(); c.ellipse(flX+Math.cos(ang)*w*0.03, flY+Math.sin(ang)*w*0.03, w*0.022, w*0.014, ang, 0, Math.PI*2); c.fill();
    }
    c.fillStyle='#F5B041'; c.beginPath(); c.arc(flX,flY,w*0.016,0,Math.PI*2); c.fill();

    // مواضع النقاط التفاعلية — محسوبة من نفس هندسة الرسم أعلاه (مصدر واحد للحقيقة)
    S.hotspots = {
      root:  { x: stemBase.x, y: stemBase.y },
      stem:  { x: stemBase.x, y: (stemBase.y+stemTop.y)/2 },
      leaf:  { x: leafCentroids[0].x, y: leafCentroids[0].y },
      flower:{ x: flX, y: flY },
    };

    Object.entries(S.hotspots).forEach(([id,pos])=>{
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

// ─── مساعد: صوت نار خفيف (تكسير/فرقعة) ───
function _g8pPlayFire(){
  try{
    const ac = new (window.AudioContext||window.webkitAudioContext)();
    const bufLen = Math.floor(ac.sampleRate*0.3);
    const buf = ac.createBuffer(1, bufLen, ac.sampleRate);
    const d = buf.getChannelData(0);
    for(let i=0;i<bufLen;i++) d[i] = (Math.random()*2-1)*(1-i/bufLen);
    const src = ac.createBufferSource(); src.buffer = buf;
    const flt = ac.createBiquadFilter(); flt.type='highpass'; flt.frequency.value=1800;
    const g = ac.createGain(); g.gain.value=0.05;
    src.connect(flt); flt.connect(g); g.connect(ac.destination);
    src.start();
  }catch(e){}
}
// ─── مساعد: صوت نقطة/قطرة (إضافة سائل) ───
function _g8pPlayDrop(){
  try{
    const ac = new (window.AudioContext||window.webkitAudioContext)();
    const o = ac.createOscillator(), g = ac.createGain();
    o.type='sine'; o.frequency.setValueAtTime(700, ac.currentTime);
    o.frequency.exponentialRampToValueAtTime(300, ac.currentTime+0.15);
    o.connect(g); g.connect(ac.destination);
    const t = ac.currentTime;
    g.gain.setValueAtTime(0.08,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.2);
    o.start(t); o.stop(t+0.22);
  }catch(e){}
}

/* ════════════════════════════════════════
   نشاط ١-٣ · التاب ١ — معادلة التمثيل الضوئي
════════════════════════════════════════ */
function simG8Bio1N3a(){
  cancelAnimationFrame(animFrame);
  const PARTS = [
    { id:'co2',   label:'6CO₂',  name:'ثاني أكسيد الكربون', side:'in',  fn:'يدخل النبات عبر الثغور في الأوراق، ويُستخدم كمادة خام لصنع الغذاء.' },
    { id:'water', label:'6H₂O',  name:'الماء',              side:'in',  fn:'يمتصّه النبات من التربة عبر الجذور، وينتقل إلى الأوراق عبر الساق.' },
    { id:'light', label:'☀️',    name:'ضوء الشمس',          side:'in',  fn:'مصدر الطاقة التي يستخدمها الكلوروفيل لتشغيل عملية التمثيل الضوئي.' },
    { id:'gluc',  label:'C₆H₁₂O₆', name:'الجلوكوز',         side:'out', fn:'السكر الذي يصنعه النبات كغذاء، ويُخزَّن غالباً على شكل نشاء.' },
    { id:'oxy',   label:'6O₂',   name:'الأكسجين',           side:'out', fn:'ناتج ثانوي يُطلقه النبات إلى الهواء عبر الثغور.' },
  ];
  simState = { active:null, seen:[] };
  const S = simState;

  function renderControls(){
    let body = `<div style="font-size:13px;color:var(--text-secondary);line-height:1.8;margin-bottom:10px">اضغط أي جزء من المعادلة في الشاشة المقابلة لتتعرّف عليه.</div>`;
    if(S.active){
      const p = PARTS.find(pp=>pp.id===S.active);
      body += `<div style="padding:13px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(39,174,96,0.25)">
        <div style="font-weight:700;color:#16A34A;margin-bottom:6px">${p.label} — ${p.name}</div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.8">${p.fn}</div>
        ${p.id==='gluc' ? `<div style="margin-top:8px;font-size:12px;font-weight:700;color:#F5B041">🌾 النبات يخزّن الجلوكوز على شكل نشاء.</div>` : ''}
      </div>`;
    }
    body += `<div style="margin-top:12px;font-weight:700;color:#27AE60">استكشفت ${S.seen.length} من ${PARTS.length}</div>`;
    return `<div class="ctrl-section"><div class="ctrl-label">☀️ معادلة التمثيل الضوئي</div></div>${body}`;
  }
  controls(renderControls());

  const cv = document.getElementById('simCanvas');
  function relPos(e){
    const rect = cv.getBoundingClientRect();
    const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
    return { x:(t.clientX-rect.left)/cv.offsetWidth, y:(t.clientY-rect.top)/cv.offsetHeight };
  }
  const inX = [0.14, 0.32, 0.50], outX = [0.72, 0.88];
  const posOf = (id) => {
    const p = PARTS.find(pp=>pp.id===id);
    const idx = PARTS.filter(pp=>pp.side===p.side).indexOf(p);
    return { x: (p.side==='in'?inX:outX)[idx], y: 0.45 };
  };
  function onClick(e){
    const p = relPos(e);
    PARTS.forEach(part=>{
      const pos = posOf(part.id);
      if(Math.abs(p.x-pos.x)<0.09 && Math.abs(p.y-pos.y)<0.12){
        S.active = part.id; _g8pPlayClick();
        if(!S.seen.includes(part.id)) S.seen.push(part.id);
        controls(renderControls());
      }
    });
  }
  cv.onmousedown = onClick;
  cv.ontouchstart = e=>{ e.preventDefault(); onClick(e); };
  cv.onmousemove=null; cv.onmouseup=null; cv.onmouseleave=null; cv.ontouchmove=null; cv.ontouchend=null;

  function draw(){
    if(currentSim!=='g8bio1n3' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    c.fillStyle = g8pBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle = g8pTxt(dark);
    c.font = `bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ١-٣ · معادلة التمثيل الضوئي', w/2, h*0.08);

    PARTS.forEach(part=>{
      const pos = posOf(part.id);
      const active = S.active===part.id, seen = S.seen.includes(part.id);
      c.save();
      c.globalAlpha = active ? 1 : seen ? 0.85 : 0.6;
      if(active){ c.shadowColor='rgba(39,174,96,0.5)'; c.shadowBlur=18; }
      c.fillStyle = seen ? '#DCFCE7' : (dark?'#1E2A22':'#FFF');
      c.strokeStyle = active ? '#16A34A' : '#94A3B8'; c.lineWidth = active?3:2;
      c.beginPath(); c.roundRect(pos.x*w-w*0.075, pos.y*h-h*0.09, w*0.15, h*0.18, 14); c.fill(); c.stroke();
      c.restore();
      c.fillStyle = g8pTxt(dark); c.font = `bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(part.label, pos.x*w, pos.y*h - h*0.02);
      c.font = `${Math.round(h*0.016)}px Tajawal`;
      c.fillText(part.name, pos.x*w, pos.y*h + h*0.045);
      if(part.id==='gluc'){
        c.fillStyle = '#F5B041'; c.font = `${Math.round(h*0.014)}px Tajawal`;
        c.fillText('(يُخزَّن كنشاء)', pos.x*w, pos.y*h + h*0.15);
      }
    });
    c.textBaseline='alphabetic';

    // علامات + وسهم التفاعل
    c.fillStyle = g8pMut(dark); c.font = `bold ${Math.round(h*0.036)}px Tajawal`; c.textAlign='center';
    c.fillText('+', (inX[0]+inX[1])/2*w, h*0.45);
    c.fillText('+', (inX[1]+inX[2])/2*w, h*0.45);
    c.fillText('+', (outX[0]+outX[1])/2*w, h*0.45);
    c.strokeStyle = g8pAccent(dark); c.lineWidth=3;
    c.beginPath(); c.moveTo(w*0.58, h*0.45); c.lineTo(w*0.66, h*0.45); c.stroke();
    c.beginPath(); c.moveTo(w*0.66,h*0.45); c.lineTo(w*0.645,h*0.44); c.moveTo(w*0.66,h*0.45); c.lineTo(w*0.645,h*0.46); c.stroke();
    c.fillStyle = g8pMut(dark); c.font = `${Math.round(h*0.018)}px Tajawal`;
    c.fillText('(الكلوروفيل)', w*0.62, h*0.38);

    if(S.seen.length===PARTS.length){
      c.fillStyle = '#16A34A'; c.font = `bold ${Math.round(h*0.02)}px Tajawal`;
      c.fillText('🎉 أحسنت! استكشفت معادلة التمثيل الضوئي كاملة', w/2, h*0.85);
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   نشاط ١-٤ · استقصاء: الكشف عن النشاء في الورقة
   — الدرس الرابع (منفصل تماماً عن نشاط ١-٣ / الدرس الثالث،
     وله تاب واحد مستقل ضمن g8bio1n4، انظر sims-main.js) —
════════════════════════════════════════ */
function simG8Bio1N4a(){
  cancelAnimationFrame(animFrame);
  const STEPS = [
    { id:'start',    btn:'▶ ابدأ التجربة', info:'أمامك منضدة مختبر مرتّبة: إناء ماء فوق مصدر حرارة مطفأ، وورقة نبات في مكانها بعيداً عن الإناء، وبقيّة الأدوات جاهزة. لا شيء يتحرّك بعد — اضغط لتبدأ خطوة بخطوة.' },
    { id:'fire',     btn:'🔥 شغّل النار',  info:'اضغط لإشعال مصدر الحرارة تحت الإناء وبدء تسخين الماء.' },
    { id:'boil',     btn:'💧 اغلِ الماء',  info:'الماء سخن. اضغط لجعله يغلي بقوة.' },
    { id:'putleaf',  btn:'🍃 ضع الورقة في الماء', info:'اضغط لنقل الورقة وغمرها في الماء الساخن — هذا يُلين أنسجتها ويوقف نشاطها الحيوي.' },
    { id:'stopfire', btn:'🛑 أوقف النار', info:'اضغط لإطفاء النار بعد أن أصبحت الورقة لينة.' },
    { id:'tongs',    btn:'🥢 أخرج الورقة بالملقط', info:'اضغط لاستخدام الملقط ورفع الورقة من الماء الساخن.' },
    { id:'tube',     btn:'🧪 انقل الورقة إلى أنبوب الاختبار', info:'اضغط لنقل الورقة بالملقط إلى أنبوب اختبار مائل، ثابت في حامله.' },
    { id:'ethanol',  btn:'⚗️ أضف الإيثانول', info:'اضغط لصبّ الإيثانول على الورقة داخل الأنبوب — سيُذيب الكلوروفيل الأخضر ويُخرجه منها.' },
    { id:'q1',       btn:'➡ متابعة', info:'', question:{
        q:'ماذا لاحظت أثناء إضافة الإيثانول؟',
        opts:['اللون الأخضر انتقل من الورقة إلى الإيثانول','لم يتغيّر شيء إطلاقاً','الورقة أصبحت أكبر حجماً'],
        ans:0, fb:'✅ صحيح! الإيثانول أذاب صبغة الكلوروفيل الخضراء وأخرجها من الورقة، فأصبح المحلول أخضر والورقة شاحبة.'
      } },
    { id:'rinse',    btn:'💧 اغمس الورقة في الماء', info:'اضغط لنقل الورقة بالملقط وغمسها في وعاء الماء لتليينها من جديد بعد أن تصلّبت في الإيثانول.' },
    { id:'slide',    btn:'🔬 ضع الورقة على الشريحة', info:'اضغط لنقل الورقة بالملقط ووضعها مفرودة على الشريحة الزجاجية استعداداً للفحص.' },
    { id:'iodine',   btn:'🟤 أضف اليود', info:'اضغط لإسقاط قطرات من محلول اليود على الورقة، وراقب التغيّر اللوني.' },
    { id:'q2',       btn:'➡ استنتج', info:'', question:{
        q:'ماذا يدل تغيّر لون الورقة إلى الأزرق الداكن/الأسود عند إضافة اليود؟',
        opts:['وجود النشاء في الورقة','وجود الماء فقط','عدم وجود أي مادة'],
        ans:0, fb:'✅ صحيح! يتحوّل لون اليود من البني إلى الأزرق الداكن أو الأسود عند ملامسته للنشاء — وهذا دليل على وجوده في الورقة.'
      } },
    { id:'done',     btn:'', info:'' },
  ];
  const MAIN_IDS = STEPS.filter(s=>!s.question && s.id!=='done').map(s=>s.id);
  simState = { step:0, transT:1, ethanolT:0, iodineT:0, answered:false, leafPale:0 };
  const S = simState;
  const idxOf = (id) => STEPS.findIndex(s=>s.id===id);

  function renderControls(){
    const st = STEPS[S.step];
    if(st.id==='done'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🔬 ماذا اكتشفنا؟</div></div>
        <div style="padding:14px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(39,174,96,0.3)">
          <div style="font-weight:700;color:#16A34A;margin-bottom:8px">🎉 اكتشفنا وجود النشاء في الورقة!</div>
          <div style="font-size:13px;color:var(--text-secondary);line-height:1.9">
            التمثيل الضوئي ← إنتاج الجلوكوز ← يخزّنه النبات على شكل <strong>نشاء</strong> ← اكتشفناه باستخدام اختبار اليود.
          </div>
        </div>
        <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g8pLabRestart()">↺ أعد التجربة</button>`;
    }
    // رقم الخطوة الرئيسية الحالية (يتجاهل خطوات الأسئلة وخطوة النهاية)
    let mainNum = 0;
    for(const id of MAIN_IDS){ if(idxOf(id) <= S.step) mainNum++; }
    mainNum = Math.max(1, mainNum);
    const progressHtml = `
      <div style="font-size:12px;color:var(--text-secondary);margin-bottom:6px">الخطوة ${mainNum} من ${MAIN_IDS.length}</div>
      <div style="height:6px;background:var(--bg-card2);border-radius:3px;overflow:hidden;margin-bottom:10px">
        <div style="height:100%;width:${Math.round(mainNum/MAIN_IDS.length*100)}%;background:#27AE60;transition:width .3s"></div>
      </div>`;
    if(st.question){
      const q = st.question;
      return `
        <div class="ctrl-section"><div class="ctrl-label">🔬 استقصاء: الكشف عن النشاء</div></div>
        ${progressHtml}
        <div style="font-size:14px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px">${q.q}</div>
        <div id="g8pLabOpts" style="display:flex;flex-direction:column;gap:8px">
          ${q.opts.map((o,i)=>`<button id="g8pLabOpt${i}" onclick="window._g8pLabAnswer(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">${o}</button>`).join('')}
        </div>
        <div id="g8pLabFb" style="margin-top:10px;font-size:13px;color:var(--text-secondary);line-height:1.8"></div>`;
    }
    return `
      <div class="ctrl-section">
        <div class="ctrl-label">🔬 استقصاء: الكشف عن النشاء</div>
        ${progressHtml}
      </div>
      <div id="g8pLabInfo" style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;border:1px solid rgba(39,174,96,0.2);margin-bottom:12px">${st.info}</div>
      <button class="ctrl-btn play" onclick="window._g8pLabNext()">${st.btn}</button>`;
  }
  controls(renderControls());

  window._g8pLabNext = function(){
    _g8pPlayClick();
    const st = STEPS[S.step];
    if(st.id==='fire') _g8pPlayFire();
    if(st.id==='ethanol'){ _g8pPlayDrop(); S.ethanolT = 0.0001; }
    if(st.id==='iodine'){ _g8pPlayDrop(); S.iodineT = 0.0001; }
    S.step++;
    S.transT = 0.0001;
    controls(renderControls());
  };
  window._g8pLabAnswer = function(i){
    if(S.answered) return; S.answered = true;
    const q = STEPS[S.step].question;
    const ok = i===q.ans;
    _g8pPlayClick();
    const btn = document.getElementById('g8pLabOpt'+i);
    if(btn){ btn.style.background = ok?'#27AE60':'#E74C3C'; btn.style.color='white'; btn.style.borderColor= ok?'#27AE60':'#E74C3C'; }
    if(!ok){
      const okBtn = document.getElementById('g8pLabOpt'+q.ans);
      if(okBtn){ okBtn.style.background='#27AE60'; okBtn.style.color='white'; okBtn.style.borderColor='#27AE60'; }
    }
    const fb = document.getElementById('g8pLabFb');
    if(fb) fb.innerHTML = q.fb;
    setTimeout(()=>{ S.step++; S.transT=0.0001; S.answered=false; controls(renderControls()); }, 1500);
  };
  window._g8pLabRestart = function(){
    S.step=0; S.transT=1; S.ethanolT=0; S.iodineT=0; S.answered=false; S.leafPale=0;
    controls(renderControls());
  };

  const cv = document.getElementById('simCanvas');

  // ── مساعد: يرسم قطرة سائل تسقط من نقطة علوية إلى نقطة سفلية (بدل الظهور المفاجئ) ──
  function _g8pDrawFallingDrop(c, fromX, fromY, toX, toY, t, color){
    if(t<=0 || t>=1) return;
    const x = fromX + (toX-fromX)*t, y = fromY + (toY-fromY)*t;
    c.fillStyle = color;
    c.beginPath();
    c.ellipse(x, y, 3, 6, 0, 0, Math.PI*2);
    c.fill();
  }

  function draw(){
    if(currentSim!=='g8bio1n4' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    c.fillStyle = g8pBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle = g8pTxt(dark);
    c.font = `bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ١-٤ · الكشف عن النشاء', w/2, h*0.05);

    const stId = STEPS[S.step] ? STEPS[S.step].id : 'done';
    const idx = idxOf(stId);
    // مهم: التأثير البصري لأي خطوة يبدأ فقط بعد ضغط الطالب على زر تلك الخطوة نفسها،
    // وليس بمجرد وصولنا لعرض نص/زر تلك الخطوة (لهذا كل الدوال هنا مبنية على +1).
    const justAfter   = (id) => idx === idxOf(id) + 1; // اللحظة/الإطارات التي تعرض نتيجة الضغط على زر id (قد تتضمّن حركة انتقال tt)
    const activeSince = (id) => idx >= idxOf(id) + 1;  // فعّال باستمرار من لحظة ضغط زر id فصاعداً
    if(S.transT<1) S.transT += 0.045;
    const tt = Math.min(1, S.transT);

    if(S.ethanolT>0 && S.ethanolT<1) S.ethanolT += 0.008;
    if(S.iodineT>0 && S.iodineT<1) S.iodineT += 0.01;
    S.leafPale = Math.min(1, S.ethanolT);

    // ── منضدة مختبر واحدة متّصلة: كل الأدوات مرئية معاً بترتيب منطقي من اليسار لليمين ──
    const potX=w*0.20, potY=h*0.56, potW=w*0.19, potH=h*0.15;
    const tubeX=w*0.50, tubeTopY=h*0.20, tubeLen=h*0.30;
    const rinseX=w*0.68, rinseY=h*0.66, rinseW=w*0.13, rinseH=h*0.11;
    const slideX=w*0.87, slideY=h*0.62;
    const dropperX=w*0.87, dropperY=h*0.24;

    // نقاط رحلة الورقة على المنضدة (إحداثيات عالمية موحّدة — بدون قفزات مشاهد)
    const P = {
      supply: { x:w*0.08, y:h*0.20, a:-0.35 },
      inPot:  { x:potX,   y:potY+potH*0.62, a:Math.PI/2 },
      lifted: { x:potX+w*0.01, y:potY-h*0.11, a:Math.PI/2 },
      inTube: { x:tubeX+w*0.005, y:tubeTopY+h*0.20, a:Math.PI*0.62 },
      rinse:  { x:rinseX, y:rinseY-rinseH*0.15, a:Math.PI/2 },
      slide:  { x:slideX, y:slideY, a:0.1 },
    };
    const LEGS = [
      { id:'putleaf', from:P.supply, to:P.inPot },
      { id:'tongs',   from:P.inPot,  to:P.lifted },
      { id:'tube',    from:P.lifted, to:P.inTube },
      { id:'rinse',   from:P.inTube, to:P.rinse },
      { id:'slide',   from:P.rinse,  to:P.slide },
    ];
    function leafState(){
      let cur = P.supply;
      for(const leg of LEGS){
        const li = idxOf(leg.id) + 1; // تبدأ الحركة بعد الضغط على زر هذه الخطوة، لا عند مجرّد عرضها
        if(idx < li) return cur;
        if(idx === li){
          return {
            x: leg.from.x + (leg.to.x-leg.from.x)*tt,
            y: leg.from.y + (leg.to.y-leg.from.y)*tt,
            a: leg.from.a + (leg.to.a-leg.from.a)*tt,
          };
        }
        cur = leg.to;
      }
      return cur;
    }
    const leaf = leafState();

    // fireScale: تنمو عند الإشعال، وتنطفئ تدريجياً (بدل الاختفاء الفوري) عند إيقاف النار
    let fireScale = 0;
    if(activeSince('fire') && !activeSince('stopfire')) fireScale = 1;
    if(justAfter('stopfire')) fireScale = Math.max(0, 1-tt);
    const heatGlow = fireScale; // يُستخدم أيضاً لتلاشي الفقاعات/البخار تدريجياً

    // ── تركيز بصري: نُخفت الأدوات غير المستخدمة حالياً حتى لا يتشتّت الطالب ──
    const ZONE_OF_STEP = { start:'pot', fire:'pot', boil:'pot', putleaf:'pot', stopfire:'pot', tongs:'pot',
      tube:'tube', ethanol:'tube', q1:'tube', rinse:'rinse', slide:'slide', iodine:'slide', q2:'slide', done:'slide' };
    const activeZone = ZONE_OF_STEP[stId] || 'pot';
    const zoneAlpha = (z) => z===activeZone ? 1 : 0.32;

    // ═══ ١) الحامل الثلاثي + النار + الإناء ═══
    c.save(); c.globalAlpha = zoneAlpha('pot');
    c.strokeStyle = dark?'#71767F':'#8A93A0'; c.lineWidth=Math.max(3,h*0.006);
    c.beginPath(); c.moveTo(potX-potW*0.5,potY+potH); c.lineTo(potX-potW*0.65,potY+potH+h*0.09); c.stroke();
    c.beginPath(); c.moveTo(potX+potW*0.5,potY+potH); c.lineTo(potX+potW*0.65,potY+potH+h*0.09); c.stroke();
    c.beginPath(); c.moveTo(potX,potY+potH); c.lineTo(potX,potY+potH+h*0.1); c.stroke();

    if(fireScale>0.01){
      const flick = Math.sin(Date.now()/90)*3;
      c.save(); c.translate(potX, potY+potH+h*0.11); c.scale(fireScale,fireScale);
      for(let i=-1;i<=1;i++){
        const grad = c.createLinearGradient(0,-40,0,4);
        grad.addColorStop(0, '#FDE68A'); grad.addColorStop(0.5, i===0?'#F97316':'#FB923C'); grad.addColorStop(1,'#EA580C');
        c.fillStyle = grad;
        c.beginPath();
        c.moveTo(i*11,0);
        c.quadraticCurveTo(i*11+9+flick*0.3,-20,i*11,-38-Math.abs(flick));
        c.quadraticCurveTo(i*11-9-flick*0.3,-20,i*11,0);
        c.fill();
      }
      c.restore();
    }

    // الإناء (زجاج بلمعان + تدرّج للواقعية)
    const potGrad = c.createLinearGradient(potX-potW/2,potY,potX+potW/2,potY+potH);
    potGrad.addColorStop(0, dark?'rgba(210,220,230,0.30)':'rgba(255,255,255,0.55)');
    potGrad.addColorStop(1, dark?'rgba(180,195,210,0.15)':'rgba(180,195,210,0.30)');
    c.fillStyle = potGrad;
    c.strokeStyle = dark?'#9AA3AF':'#8A93A0'; c.lineWidth=3;
    c.beginPath();
    c.moveTo(potX-potW/2,potY); c.lineTo(potX+potW/2,potY);
    c.quadraticCurveTo(potX+potW/2, potY+potH*0.5, potX+potW*0.42,potY+potH);
    c.lineTo(potX-potW*0.42,potY+potH);
    c.quadraticCurveTo(potX-potW/2, potY+potH*0.5, potX-potW/2,potY);
    c.fill(); c.stroke();
    // الماء
    c.save(); c.beginPath();
    c.moveTo(potX-potW*0.46,potY+potH*0.3); c.lineTo(potX+potW*0.46,potY+potH*0.3);
    c.quadraticCurveTo(potX+potW*0.4, potY+potH*0.7, potX+potW*0.36,potY+potH*0.95);
    c.lineTo(potX-potW*0.36,potY+potH*0.95);
    c.quadraticCurveTo(potX-potW*0.4, potY+potH*0.7, potX-potW*0.46,potY+potH*0.3);
    c.closePath(); c.clip();
    const waterGrad = c.createLinearGradient(potX,potY,potX,potY+potH);
    waterGrad.addColorStop(0, dark?'#2E6B94':'#7EC1EA'); waterGrad.addColorStop(1, dark?'#1E4A6B':'#5DADE2');
    c.fillStyle = waterGrad;
    c.fillRect(potX-potW/2,potY,potW,potH);
    if(heatGlow>0.01){
      c.globalAlpha = heatGlow;
      for(let i=0;i<6;i++){
        const bx = potX + (Math.sin(Date.now()/300+i*2)*potW*0.32);
        const by = potY+potH*0.9 - ((Date.now()/8+i*40)%(potH*0.6));
        c.fillStyle='rgba(255,255,255,0.75)';
        c.beginPath(); c.arc(bx,by,Math.max(2,w*0.004),0,Math.PI*2); c.fill();
      }
      c.globalAlpha = 1;
    }
    c.restore();
    if(heatGlow>0.01){
      c.save(); c.globalAlpha = heatGlow;
      for(let i=0;i<3;i++){
        const sx = potX + (i-1)*potW*0.25 + Math.sin(Date.now()/400+i)*6;
        const sy = potY - h*0.02 - ((Date.now()/20+i*30)%(h*0.13));
        c.strokeStyle='rgba(255,255,255,0.35)'; c.lineWidth=6; c.lineCap='round';
        c.beginPath(); c.moveTo(sx,sy+20); c.quadraticCurveTo(sx+6,sy+10,sx,sy); c.stroke();
      }
      c.restore();
    }
    c.fillStyle = g8pMut(dark); c.font=`${Math.round(h*0.017)}px Tajawal`; c.textAlign='center';
    c.fillText('🔥 التسخين', potX, potY+potH+h*0.16);
    c.restore();

    // ═══ ٢) حامل أنبوب الاختبار ═══
    c.save(); c.globalAlpha = zoneAlpha('tube');
    c.save(); c.translate(tubeX,tubeTopY); c.rotate(0.35);
    // مشبك التثبيت
    c.fillStyle = dark?'#52525B':'#71717A';
    c.beginPath(); c.roundRect(-w*0.05,-h*0.03,w*0.1,h*0.02,3); c.fill();
    const tubeGrad = c.createLinearGradient(-w*0.035,0,w*0.035,0);
    tubeGrad.addColorStop(0, dark?'rgba(220,225,235,0.10)':'rgba(255,255,255,0.55)');
    tubeGrad.addColorStop(0.5, dark?'rgba(200,210,220,0.16)':'rgba(180,195,210,0.20)');
    tubeGrad.addColorStop(1, dark?'rgba(220,225,235,0.10)':'rgba(255,255,255,0.35)');
    c.fillStyle = tubeGrad;
    c.strokeStyle = dark?'#9AA3AF':'#8A93A0'; c.lineWidth=3;
    c.beginPath(); c.moveTo(-w*0.035,0); c.lineTo(-w*0.035,h*0.32); c.quadraticCurveTo(-w*0.035,h*0.36,0,h*0.36);
    c.quadraticCurveTo(w*0.035,h*0.36,w*0.035,h*0.32); c.lineTo(w*0.035,0); c.closePath(); c.fill(); c.stroke();
    // انسكاب الإيثانول من قارورة صغيرة أعلى الأنبوب (بدل ظهور السائل فجأة)
    if(justAfter('ethanol') && tt<1){
      c.fillStyle = dark?'#D9F99D':'#A3E635'; c.globalAlpha=0.85;
      c.beginPath(); c.moveTo(-2,-h*0.05); c.lineTo(2,-h*0.05); c.lineTo(1,h*0.1*tt); c.lineTo(-1,h*0.1*tt); c.closePath(); c.fill();
      c.globalAlpha=1;
    }
    if(S.ethanolT>0){
      const liquidGreen = _g8pLerpColor('#F5F0DC', '#4ADE80', Math.min(1,S.ethanolT*1.3));
      c.fillStyle = liquidGreen;
      c.beginPath(); c.moveTo(-w*0.033,h*0.12); c.lineTo(-w*0.033,h*0.32);
      c.quadraticCurveTo(-w*0.033,h*0.355,0,h*0.355); c.quadraticCurveTo(w*0.033,h*0.355,w*0.033,h*0.32);
      c.lineTo(w*0.033,h*0.12); c.closePath(); c.fill();
      // بريق سطح السائل
      c.strokeStyle='rgba(255,255,255,0.4)'; c.lineWidth=1.5;
      c.beginPath(); c.moveTo(-w*0.03,h*0.12); c.lineTo(w*0.03,h*0.12); c.stroke();
    }
    c.restore();
    c.fillStyle = g8pMut(dark); c.font=`${Math.round(h*0.017)}px Tajawal`; c.textAlign='center';
    c.fillText(activeSince('ethanol') ? 'الإيثانول يذيب الكلوروفيل...' : '⚗️ إذابة الكلوروفيل', tubeX, tubeTopY+tubeLen+h*0.06);
    c.restore();

    // ═══ ٣) وعاء الغسل (الماء) ═══
    c.save(); c.globalAlpha = zoneAlpha('rinse');
    c.save();
    const rinseGrad = c.createLinearGradient(rinseX-rinseW/2,rinseY,rinseX+rinseW/2,rinseY+rinseH);
    rinseGrad.addColorStop(0, dark?'rgba(210,220,230,0.22)':'rgba(255,255,255,0.5)');
    rinseGrad.addColorStop(1, dark?'rgba(180,195,210,0.12)':'rgba(180,195,210,0.25)');
    c.fillStyle = rinseGrad; c.strokeStyle = dark?'#9AA3AF':'#8A93A0'; c.lineWidth=2.5;
    c.beginPath(); c.roundRect(rinseX-rinseW/2, rinseY, rinseW, rinseH, [3,3,8,8]); c.fill(); c.stroke();
    c.save(); c.beginPath(); c.roundRect(rinseX-rinseW/2+2, rinseY+rinseH*0.25, rinseW-4, rinseH*0.75-2, [0,0,7,7]); c.clip();
    c.fillStyle = dark?'#1E4A6B':'#AEE0F5'; c.fillRect(rinseX-rinseW/2, rinseY, rinseW, rinseH);
    c.restore();
    c.restore();
    c.fillStyle = g8pMut(dark); c.font=`${Math.round(h*0.017)}px Tajawal`; c.textAlign='center';
    c.fillText('💧 غسل بالماء', rinseX, rinseY+rinseH+h*0.045);
    c.restore();

    // ═══ ٤) الشريحة الزجاجية + قارورة اليود ═══
    c.save(); c.globalAlpha = zoneAlpha('slide');
    c.fillStyle = dark?'rgba(200,220,255,0.12)':'rgba(200,220,255,0.35)';
    c.strokeStyle= dark?'#9AA3AF':'#8A93A0'; c.lineWidth=2;
    c.beginPath(); c.roundRect(slideX-w*0.09, slideY-h*0.018, w*0.18, h*0.036, 3); c.fill(); c.stroke();
    c.strokeStyle='rgba(255,255,255,0.5)'; c.lineWidth=1;
    c.beginPath(); c.moveTo(slideX-w*0.08,slideY-h*0.01); c.lineTo(slideX+w*0.08,slideY-h*0.01); c.stroke();
    c.fillStyle = g8pMut(dark); c.font=`${Math.round(h*0.017)}px Tajawal`; c.textAlign='center';
    c.fillText('🔬 اختبار اليود', slideX, slideY+h*0.09);

    // قارورة اليود (دوماً مرئية في مكانها، تُستخدم فقط في خطوتها)
    c.save(); c.translate(dropperX,dropperY);
    c.fillStyle = dark?'#78350F':'#92400E'; c.strokeStyle=dark?'#451A03':'#5A2A0A'; c.lineWidth=2;
    c.beginPath(); c.roundRect(-w*0.014,0,w*0.028,h*0.07,[2,2,5,5]); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(-w*0.006,0); c.lineTo(-w*0.006,-h*0.03); c.lineTo(w*0.006,-h*0.03); c.lineTo(w*0.006,0); c.closePath(); c.fill(); c.stroke();
    c.restore();

    // قطرة يود تسقط فعلياً من القارورة إلى الورقة (بدل تغيّر اللون المفاجئ)
    if(justAfter('iodine') && tt<1){
      _g8pDrawFallingDrop(c, dropperX, dropperY+h*0.07, leaf.x, leaf.y-h*0.02, tt, '#92400E');
    }
    if(activeSince('iodine')){
      c.fillStyle = g8pMut(dark); c.font=`${Math.round(h*0.018)}px Tajawal`; c.textAlign='center';
      c.fillText(S.iodineT<1 ? 'اليود يتفاعل مع النشاء...' : '🔵⚫ اللون الداكن = وجود النشاء!', slideX, slideY-h*0.09);
    }
    c.restore();

    // ═══ ٥) الورقة (تتحرك بسلاسة بين كل النقاط أعلاه، بلا اختفاء/ظهور مفاجئ) ═══
    let leafCol = g8pAccent(dark);
    if(activeSince('tube')) leafCol = _g8pLerpColor(g8pAccent(dark), '#D8D4B8', S.leafPale);
    if(S.iodineT>0) leafCol = _g8pLerpColor(leafCol, dark?'#3730A3':'#1E1B4B', Math.min(1,S.iodineT*1.2));
    const leafSize = activeSince('tube') ? w*0.045 : w*0.09;
    _g8pDrawLeaf(c, leaf.x, leaf.y, leafSize, leafSize*0.44, leaf.a, leafCol, 'rgba(20,60,20,0.3)', !activeSince('tube'));

    // ═══ ٦) الملقط — يظهر من لحظة إمساكه بالورقة حتى وضعها على الشريحة، ويتحرّك معها دوماً ═══
    if(idx>=idxOf('tongs')+1 && idx<=idxOf('slide')+1){
      const tipX = leaf.x, tipY = leaf.y - h*0.018;
      const handleX = tipX, handleY = tipY - h*0.13;
      c.strokeStyle = dark?'#D4D4D8':'#71717A'; c.lineWidth=Math.max(3,h*0.007); c.lineCap='round';
      c.beginPath(); c.moveTo(handleX-7,handleY); c.lineTo(tipX-5,tipY); c.stroke();
      c.beginPath(); c.moveTo(handleX+7,handleY); c.lineTo(tipX+5,tipY); c.stroke();
      c.fillStyle = dark?'#A1A1AA':'#52525B';
      c.beginPath(); c.arc(handleX, handleY, Math.max(2.5,h*0.007), 0, Math.PI*2); c.fill();
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   نشاط ١-٥ · استقصاء: إلى أيّ اتجاه تنمو الجذور؟
   (الدرس ٥-١ — الجذور، كتاب الصف الثامن ص٢٣)
════════════════════════════════════════ */
function simG8Bio1N5a(){
  cancelAnimationFrame(animFrame);
  const STEPS = [
    { id:'start',    btn:'▶ ابدأ التجربة', info:'أمامك كأس زجاجية طويلة بداخلها ورق مقوّى قوي مثبّت على جدارها من الداخل. الورق جافّ الآن، وبذور الفول المنقوعة جاهزة بجانب الكأس. لا شيء يتحرّك بعد.' },
    { id:'water',    btn:'💧 أضف الماء', info:'اضغط لإضافة القليل من الماء إلى قاع الكأس، بحيث يتشرّبه الورق المقوّى ويصبح رطباً.' },
    { id:'seeds',    btn:'🌱 أضف بذور الفول', info:'اضغط لوضع ثلاث بذور فول بعناية بين الورق وجدار الكأس، كل واحدة في اتجاه مختلف عن الأخرى.' },
    { id:'place',    btn:'📦 ضعها في الظروف المناسبة', info:'اضغط لوضع الكأس في مكان دافئ مناسب للإنبات، مع الحرص على أن يبقى الورق رطباً وليس مبلَّلاً.' },
    { id:'grow',     btn:'⏩ راقب مرور الأيام', info:'اضغط لتشغيل محاكاة مرور الوقت، وراقب البذور الثلاث وهي تنبت.' },
    { id:'q1',       btn:'➡ متابعة', info:'', question:{
        q:'هل نمت الجذور الثلاثة في نفس الاتجاه الذي وُضعت فيه البذور؟',
        opts:['لا، تغيّر اتجاه نموّها جميعاً نحو الأسفل', 'نعم، بقيت في نفس اتجاه البذرة', 'بعضها فقط تغيّر اتجاهه'],
        ans:0, fb:'✅ صحيح! رغم اختلاف اتجاه البذور الثلاث في البداية، غيّرت جميع الجذور اتجاه نموّها لتتجه نحو الأسفل.'
      } },
    { id:'done',     btn:'', info:'' },
  ];
  const MAIN_IDS = STEPS.filter(s=>!s.question && s.id!=='done').map(s=>s.id);
  simState = { step:0, transT:1, growT:0, answered:false };
  const S = simState;
  const idxOf = (id) => STEPS.findIndex(s=>s.id===id);

  function renderControls(){
    const st = STEPS[S.step];
    if(st.id==='done'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🔬 ماذا استنتجنا؟</div></div>
        <div style="padding:14px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(39,174,96,0.3)">
          <div style="font-weight:700;color:#16A34A;margin-bottom:8px">🎉 تنمو الجذور إلى الأسفل باتجاه الجاذبية!</div>
          <div style="font-size:13px;color:var(--text-secondary);line-height:1.9">
            • تمتص الجذور الماء والأملاح المعدنية من الفراغات بين حبيبات التربة.<br>
            • تعمل الجذور كدعامات لتثبيت النبات في الأرض.<br>
            • يمكن للجذور تخزين غذاء النبات.<br>
            • تستطيع الجذور أحياناً البقاء حيّة في ظروف قاسية رغم موت أجزاء النبات فوق سطح الأرض.
          </div>
        </div>
        <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g8pRootRestart()">↺ أعد التجربة</button>`;
    }
    let mainNum = 0;
    for(const id of MAIN_IDS){ if(idxOf(id) <= S.step) mainNum++; }
    mainNum = Math.max(1, mainNum);
    const progressHtml = `
      <div style="font-size:12px;color:var(--text-secondary);margin-bottom:6px">الخطوة ${mainNum} من ${MAIN_IDS.length}</div>
      <div style="height:6px;background:var(--bg-card2);border-radius:3px;overflow:hidden;margin-bottom:10px">
        <div style="height:100%;width:${Math.round(mainNum/MAIN_IDS.length*100)}%;background:#27AE60;transition:width .3s"></div>
      </div>`;
    if(st.question){
      const q = st.question;
      return `
        <div class="ctrl-section"><div class="ctrl-label">🔬 استقصاء: اتجاه نمو الجذور</div></div>
        ${progressHtml}
        <div style="font-size:14px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px">${q.q}</div>
        <div id="g8pRootOpts" style="display:flex;flex-direction:column;gap:8px">
          ${q.opts.map((o,i)=>`<button id="g8pRootOpt${i}" onclick="window._g8pRootAnswer(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">${o}</button>`).join('')}
        </div>
        <div id="g8pRootFb" style="margin-top:10px;font-size:13px;color:var(--text-secondary);line-height:1.8"></div>`;
    }
    const growLock = st.id==='grow' ? ' disabled' : '';
    return `
      <div class="ctrl-section">
        <div class="ctrl-label">🔬 استقصاء: اتجاه نمو الجذور</div>
        ${progressHtml}
      </div>
      <div id="g8pRootInfo" style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;border:1px solid rgba(39,174,96,0.2);margin-bottom:12px">${st.info}</div>
      <button class="ctrl-btn play" id="g8pRootBtn" onclick="window._g8pRootNext()">${st.btn}</button>`;
  }
  controls(renderControls());

  window._g8pRootNext = function(){
    _g8pPlayClick();
    const st = STEPS[S.step];
    if(st.id==='grow'){
      // خطوة النمو تدار داخلياً بمحاكاة زمنية طويلة قبل الانتقال للسؤال
      S.growT = 0.0001;
      const btn = document.getElementById('g8pRootBtn');
      if(btn){ btn.setAttribute('disabled','true'); btn.style.opacity='0.5'; btn.textContent='⏳ مرور الأيام...'; }
      return;
    }
    S.step++;
    S.transT = 0.0001;
    controls(renderControls());
  };
  window._g8pRootAnswer = function(i){
    if(S.answered) return; S.answered = true;
    const q = STEPS[S.step].question;
    const ok = i===q.ans;
    _g8pPlayClick();
    const btn = document.getElementById('g8pRootOpt'+i);
    if(btn){ btn.style.background = ok?'#27AE60':'#E74C3C'; btn.style.color='white'; btn.style.borderColor= ok?'#27AE60':'#E74C3C'; }
    if(!ok){
      const okBtn = document.getElementById('g8pRootOpt'+q.ans);
      if(okBtn){ okBtn.style.background='#27AE60'; okBtn.style.color='white'; okBtn.style.borderColor='#27AE60'; }
    }
    const fb = document.getElementById('g8pRootFb');
    if(fb) fb.innerHTML = q.fb;
    setTimeout(()=>{ S.step++; S.transT=0.0001; S.answered=false; controls(renderControls()); }, 1500);
  };
  window._g8pRootRestart = function(){
    S.step=0; S.transT=1; S.growT=0; S.answered=false;
    controls(renderControls());
  };

  const cv = document.getElementById('simCanvas');
  // ثلاث بذور: كل واحدة بزاوية بداية مختلفة (اتجاه الجذير الجنيني)، وتنحني جميعاً نحو الأسفل (الجاذبية)
  const SEED_ANGLES = [-1.05, 0.15, 1.2]; // راديان: يسار مائل، شبه أفقي، يمين مائل
  const SEED_DELAYS = [0, 0.08, 0.16];    // بداية إنبات غير متزامنة تماماً — طبيعية أكثر

  function draw(){
    if(currentSim!=='g8bio1n5' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    c.fillStyle = g8pBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle = g8pTxt(dark);
    c.font = `bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ١-٥ · إلى أيّ اتجاه تنمو الجذور؟', w/2, h*0.05);

    const stId = STEPS[S.step] ? STEPS[S.step].id : 'done';
    const idx = idxOf(stId);
    // التأثير البصري لأي خطوة يبدأ فقط بعد ضغط الطالب على زر تلك الخطوة نفسها
    const justAfter   = (id) => idx === idxOf(id) + 1;
    const activeSince = (id) => idx >= idxOf(id) + 1;
    // خطوة "grow" استثناء: لا يتقدّم S.step إلا بعد اكتمال محاكاة الأيام كاملة (مُدارة أدناه)
    const growDone = idx > idxOf('grow');
    const growing  = idx === idxOf('grow');
    if(S.transT<1) S.transT += 0.045;
    const tt = Math.min(1, S.transT);

    if(S.growT>0 && S.growT<1){
      S.growT += 0.0035;
      if(S.growT>=1){
        S.growT = 1;
        S.step++; S.transT = 0.0001;
        controls(renderControls());
      }
    }

    // ── الكأس الزجاجية الطويلة ──
    const cupX=w*0.32, cupY=h*0.24, cupW=w*0.20, cupH=h*0.52;
    const cupGrad = c.createLinearGradient(cupX-cupW/2,cupY,cupX+cupW/2,cupY);
    cupGrad.addColorStop(0, dark?'rgba(210,220,230,0.10)':'rgba(255,255,255,0.55)');
    cupGrad.addColorStop(0.5, dark?'rgba(200,210,220,0.05)':'rgba(200,210,220,0.15)');
    cupGrad.addColorStop(1, dark?'rgba(210,220,230,0.10)':'rgba(255,255,255,0.4)');
    c.fillStyle = cupGrad; c.strokeStyle = dark?'#9AA3AF':'#8A93A0'; c.lineWidth=3;
    c.beginPath();
    c.moveTo(cupX-cupW/2,cupY); c.lineTo(cupX-cupW*0.46,cupY+cupH);
    c.quadraticCurveTo(cupX,cupY+cupH+h*0.015,cupX+cupW*0.46,cupY+cupH);
    c.lineTo(cupX+cupW/2,cupY); c.closePath(); c.fill(); c.stroke();

    // ── الماء عند القاع (يظهر فقط بعد الضغط الفعلي على زر "أضف الماء") ──
    const waterLevel = activeSince('water') ? cupH*0.16 : 0;
    if(waterLevel>0){
      const wl = justAfter('water') ? waterLevel*tt : waterLevel;
      c.save(); c.beginPath();
      c.moveTo(cupX-cupW*0.47,cupY+cupH); c.quadraticCurveTo(cupX,cupY+cupH+h*0.015,cupX+cupW*0.47,cupY+cupH);
      c.lineTo(cupX+cupW*0.47,cupY+cupH-wl); c.lineTo(cupX-cupW*0.47,cupY+cupH-wl); c.closePath(); c.clip();
      c.fillStyle = dark?'#2E6B94':'#7EC1EA'; c.fillRect(cupX-cupW/2,cupY,cupW,cupH);
      c.restore();
    }

    // ── الورق المقوّى الملتصق بجدار الكأس (رطب تدريجياً بعد إضافة الماء) ──
    const paperX = cupX, paperY=cupY+h*0.01, paperW=cupW*0.86, paperH=cupH*0.9;
    const wetness = !activeSince('water') ? 0 : (justAfter('water') ? tt : 1);
    c.fillStyle = _g8pLerpColor('#E8D9B5', '#B89968', wetness);
    c.strokeStyle = dark?'#8A6D3A':'#A9895A'; c.lineWidth=2;
    c.beginPath(); c.roundRect(paperX-paperW/2, paperY, paperW, paperH, 4); c.fill(); c.stroke();
    c.fillStyle = g8pMut(dark); c.font=`${Math.round(h*0.015)}px Tajawal`; c.textAlign='center'; c.save(); c.translate(paperX, paperY+paperH*0.06); 
    c.fillText(wetness>0.5 ? 'ورق مقوّى رطب' : 'ورق مقوّى', 0, 0); c.restore();

    // ── البذور الثلاث + الجذور النامية ──
    const seedPositions = [
      { x: cupX-cupW*0.22, y: cupY+cupH*0.28 },
      { x: cupX,           y: cupY+cupH*0.52 },
      { x: cupX+cupW*0.22, y: cupY+cupH*0.74 },
    ];
    const seedsVisible = activeSince('seeds');
    if(seedsVisible){
      const seedIn = justAfter('seeds') ? tt : 1;
      for(let i=0;i<3;i++){
        const sp = seedPositions[i];
        const sx = seedsVisible ? sp.x : w*0.62;
        const sy = seedsVisible ? sp.y : h*0.75;
        const drawX = justAfter('seeds') ? (w*0.62 + (sp.x-w*0.62)*seedIn) : sp.x;
        const drawY = justAfter('seeds') ? (h*0.75 + (sp.y-h*0.75)*seedIn) : sp.y;
        // البذرة (شكل بيضاوي بنّي)
        c.save(); c.translate(drawX,drawY); c.rotate(SEED_ANGLES[i]*0.25);
        const sGrad = c.createLinearGradient(-8,-6,8,6);
        sGrad.addColorStop(0, '#C8A45C'); sGrad.addColorStop(1, '#8B6B34');
        c.fillStyle = sGrad; c.strokeStyle='#5A4520'; c.lineWidth=1.5;
        c.beginPath(); c.ellipse(0,0,Math.max(6,w*0.014),Math.max(4,w*0.009),0,0,Math.PI*2); c.fill(); c.stroke();
        c.restore();

        // ── محاكاة النمو (Time-lapse): جذير يبدأ من زاوية البذرة الأصلية، وينحني تدريجياً نحو الأسفل ──
        let g = 0;
        if(growDone) g = 1;
        else if(growing) {
          const localT = Math.max(0, Math.min(1, (S.growT - SEED_DELAYS[i]) / (1-SEED_DELAYS[i])));
          g = localT;
        }
        if(g>0.01){
          const rootLen = h*0.16*g;
          const startAngle = SEED_ANGLES[i];
          const endAngle = Math.PI/2; // نحو الأسفل تماماً
          const bendProgress = Math.min(1, g*1.4); // ينحني بسرعة أكبر قليلاً من الاستطالة
          const curAngle = startAngle + (endAngle-startAngle)*bendProgress;
          c.save(); c.translate(drawX,drawY);
          c.strokeStyle = dark?'#86EFAC':'#22C55E'; c.lineWidth=Math.max(2,w*0.006); c.lineCap='round';
          c.beginPath(); c.moveTo(0,0);
          const midAngle = startAngle + (curAngle-startAngle)*0.5;
          const midLen = rootLen*0.55;
          c.quadraticCurveTo(Math.cos(midAngle)*midLen, Math.sin(midAngle)*midLen, Math.cos(curAngle)*rootLen, Math.sin(curAngle)*rootLen);
          c.stroke();
          // شعيرات جذرية بسيطة
          if(g>0.3){
            c.strokeStyle = dark? 'rgba(134,239,172,0.5)':'rgba(34,197,94,0.5)'; c.lineWidth=1;
            for(let k=0.3;k<=0.9;k+=0.2){
              const px = Math.cos(curAngle)*rootLen*k, py = Math.sin(curAngle)*rootLen*k;
              c.beginPath(); c.moveTo(px,py); c.lineTo(px+4,py-3); c.stroke();
              c.beginPath(); c.moveTo(px,py); c.lineTo(px-4,py-3); c.stroke();
            }
          }
          c.restore();
        }
      }
    }

    // مؤشر الأيام أثناء التسريع الزمني
    if(growing && S.growT>0){
      const day = Math.max(1, Math.round(1+S.growT*6));
      c.fillStyle = g8pAccent(dark); c.font=`bold ${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
      c.fillText(`⏩ اليوم ${day} من ٧`, w/2, h*0.88);
    }
    if(growDone){
      c.fillStyle = g8pMut(dark); c.font=`${Math.round(h*0.017)}px Tajawal`; c.textAlign='center';
      c.fillText('🌱 لاحظ: كل الجذور اتجهت نحو الأسفل رغم اختلاف اتجاه البذور', w/2, h*0.88);
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   نشاط ١-٦ · استقصاء: النقل في ساق الكرفس
   (الدرس ٦-١ — نقل الماء والأملاح المعدنية، كتاب الصف الثامن ص٢٤-٢٥)
════════════════════════════════════════ */
function simG8Bio1N6a(){
  cancelAnimationFrame(animFrame);
  const STEPS = [
    { id:'start',   btn:'▶ ابدأ التجربة', info:'أمامك ساق كرفس طازج يحمل ورقة في أعلاه، بجانبه كأس شفاف بداخله ماء عادٍ غير ملوّن. لا شيء يتحرّك بعد.' },
    { id:'addcolor',btn:'🎨 أضف الماء الملوّن', info:'اضغط لإضافة صبغة ملوّنة إلى الماء، ثمّ وضع ساق الكرفس بشكل قائم داخل الكأس بحيث يغمر الماء طرفه السفلي.' },
    { id:'observe', btn:'👁 راقب النبات', info:'اضغط لبدء محاكاة زمنية، وراقب الصبغة الملوّنة وهي تتحرّك تدريجياً من أسفل الساق إلى أعلاه.' },
    { id:'zoom',    btn:'🔍 اقطع الساق وكبّر المقطع', info:'اضغط لقطع جزء من الساق بعناية والنظر إلى طرفه المقطوع تحت عدسة مكبّرة.' },
    { id:'q1',      btn:'➡ متابعة', info:'', question:{
        q:'ماذا حدث للماء الملوّن؟',
        opts:['انتقل من الكأس صعوداً داخل الساق حتى وصل الأوراق','بقي في الكأس ولم يتحرّك','تبخّر فوراً دون أن يدخل الساق'],
        ans:0, fb:'✅ صحيح! انتقل الماء الملوّن من الكأس صعوداً عبر أنابيب دقيقة داخل الساق حتى وصل عروق الورقة في الأعلى.'
      } },
    { id:'q2',      btn:'➡ استنتج', info:'', question:{
        q:'ما اسم الأنسجة التي نقلت الماء والأملاح المعدنية داخل الساق؟',
        opts:['الأنسجة الوعائية الخشبية (Xylem)','الأوراق','الجذور فقط','قشرة الساق الخارجية'],
        ans:0, fb:'✅ صحيح! تنتقل الماء والأملاح المعدنية من جذور النبات إلى أوراقه داخل أنابيب مجوّفة طويلة تُسمّى الأنسجة الوعائية الخشبية.'
      } },
    { id:'done',    btn:'', info:'' },
  ];
  const MAIN_IDS = STEPS.filter(s=>!s.question && s.id!=='done').map(s=>s.id);
  simState = { step:0, transT:1, obsT:0, answered:false };
  const S = simState;
  const idxOf = (id) => STEPS.findIndex(s=>s.id===id);

  function renderControls(){
    const st = STEPS[S.step];
    if(st.id==='done'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🔬 ماذا استنتجنا؟</div></div>
        <div style="padding:14px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(39,174,96,0.3)">
          <div style="font-weight:700;color:#16A34A;margin-bottom:8px">🎉 الساق ينقل الماء والأملاح المعدنية!</div>
          <div style="font-size:13px;color:var(--text-secondary);line-height:1.9">
            • تنتقل الماء والأملاح المعدنية من جذور النبات إلى أوراقه داخل أنابيب مجوّفة طويلة تُسمّى الأنسجة الوعائية الخشبية.<br>
            • تحتوي عروق ورقة النبات على أنسجة وعائية خشبية.<br>
            • يتشكّل الخشب من أنسجة وعائية خشبية.
          </div>
        </div>
        <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g8pStemRestart()">↺ أعد التجربة</button>`;
    }
    let mainNum = 0;
    for(const id of MAIN_IDS){ if(idxOf(id) <= S.step) mainNum++; }
    mainNum = Math.max(1, mainNum);
    const progressHtml = `
      <div style="font-size:12px;color:var(--text-secondary);margin-bottom:6px">الخطوة ${mainNum} من ${MAIN_IDS.length}</div>
      <div style="height:6px;background:var(--bg-card2);border-radius:3px;overflow:hidden;margin-bottom:10px">
        <div style="height:100%;width:${Math.round(mainNum/MAIN_IDS.length*100)}%;background:#27AE60;transition:width .3s"></div>
      </div>`;
    if(st.question){
      const q = st.question;
      return `
        <div class="ctrl-section"><div class="ctrl-label">🔬 استقصاء: النقل في ساق الكرفس</div></div>
        ${progressHtml}
        <div style="font-size:14px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px">${q.q}</div>
        <div id="g8pStemOpts" style="display:flex;flex-direction:column;gap:8px">
          ${q.opts.map((o,i)=>`<button id="g8pStemOpt${i}" onclick="window._g8pStemAnswer(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">${o}</button>`).join('')}
        </div>
        <div id="g8pStemFb" style="margin-top:10px;font-size:13px;color:var(--text-secondary);line-height:1.8"></div>`;
    }
    return `
      <div class="ctrl-section">
        <div class="ctrl-label">🔬 استقصاء: النقل في ساق الكرفس</div>
        ${progressHtml}
      </div>
      <div id="g8pStemInfo" style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;border:1px solid rgba(39,174,96,0.2);margin-bottom:12px">${st.info}</div>
      <button class="ctrl-btn play" id="g8pStemBtn" onclick="window._g8pStemNext()">${st.btn}</button>`;
  }
  controls(renderControls());

  window._g8pStemNext = function(){
    _g8pPlayClick();
    const st = STEPS[S.step];
    if(st.id==='addcolor') _g8pPlayDrop();
    if(st.id==='observe'){
      S.obsT = 0.0001;
      const btn = document.getElementById('g8pStemBtn');
      if(btn){ btn.setAttribute('disabled','true'); btn.style.opacity='0.5'; btn.textContent='⏳ الوقت يمرّ...'; }
      return;
    }
    S.step++;
    S.transT = 0.0001;
    controls(renderControls());
  };
  window._g8pStemAnswer = function(i){
    if(S.answered) return; S.answered = true;
    const q = STEPS[S.step].question;
    const ok = i===q.ans;
    _g8pPlayClick();
    const btn = document.getElementById('g8pStemOpt'+i);
    if(btn){ btn.style.background = ok?'#27AE60':'#E74C3C'; btn.style.color='white'; btn.style.borderColor= ok?'#27AE60':'#E74C3C'; }
    if(!ok){
      const okBtn = document.getElementById('g8pStemOpt'+q.ans);
      if(okBtn){ okBtn.style.background='#27AE60'; okBtn.style.color='white'; okBtn.style.borderColor='#27AE60'; }
    }
    const fb = document.getElementById('g8pStemFb');
    if(fb) fb.innerHTML = q.fb;
    setTimeout(()=>{ S.step++; S.transT=0.0001; S.answered=false; controls(renderControls()); }, 1600);
  };
  window._g8pStemRestart = function(){
    S.step=0; S.transT=1; S.obsT=0; S.answered=false;
    controls(renderControls());
  };

  const cv = document.getElementById('simCanvas');
  const DYE = '#DB2777'; // زهري وردي فاتح — واضح للرؤية

  function draw(){
    if(currentSim!=='g8bio1n6' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    c.fillStyle = g8pBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle = g8pTxt(dark);
    c.font = `bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ١-٦ · النقل في ساق الكرفس', w/2, h*0.05);

    const stId = STEPS[S.step] ? STEPS[S.step].id : 'done';
    const idx = idxOf(stId);
    // التأثير البصري لأي خطوة يبدأ فقط بعد ضغط الطالب على زر تلك الخطوة نفسها
    const justAfter   = (id) => idx === idxOf(id) + 1;
    const activeSince = (id) => idx >= idxOf(id) + 1;
    // خطوة "observe" استثناء: لا يتقدّم S.step إلا بعد اكتمال محاكاة الوقت كاملة (مُدارة أدناه)
    const observeDone = idx > idxOf('observe');
    const observing   = idx === idxOf('observe');
    if(S.transT<1) S.transT += 0.045;
    const tt = Math.min(1, S.transT);

    if(S.obsT>0 && S.obsT<1){
      S.obsT += 0.0032;
      if(S.obsT>=1){
        S.obsT = 1;
        _g8pPlayClick();
        S.step++; S.transT = 0.0001;
        controls(renderControls());
      }
    }

    const cupX=w*0.5, cupY=h*0.62, cupW=w*0.20, cupH=h*0.16;
    const stemX=w*0.5, stemBotY=cupY+cupH*0.35, stemTopY=h*0.16, stemW=w*0.032;

    // ── الكأس ──
    const cupGrad = c.createLinearGradient(cupX-cupW/2,cupY,cupX+cupW/2,cupY+cupH);
    cupGrad.addColorStop(0, dark?'rgba(210,220,230,0.20)':'rgba(255,255,255,0.55)');
    cupGrad.addColorStop(1, dark?'rgba(180,195,210,0.10)':'rgba(180,195,210,0.25)');
    c.fillStyle = cupGrad; c.strokeStyle = dark?'#9AA3AF':'#8A93A0'; c.lineWidth=3;
    c.beginPath();
    c.moveTo(cupX-cupW/2,cupY); c.lineTo(cupX-cupW*0.44,cupY+cupH);
    c.lineTo(cupX+cupW*0.44,cupY+cupH); c.lineTo(cupX+cupW/2,cupY); c.closePath(); c.fill(); c.stroke();

    // ── لون الماء (عادي ثم يتحوّل لملوّن بعد addcolor) ──
    const colored = activeSince('addcolor');
    const colorT = justAfter('addcolor') ? tt : (colored?1:0);
    const waterCol = _g8pLerpColor(dark?'#274B63':'#CFEFFB', DYE, colorT);
    c.save(); c.beginPath();
    c.moveTo(cupX-cupW*0.48,cupY+h*0.01); c.lineTo(cupX+cupW*0.48,cupY+h*0.01);
    c.lineTo(cupX+cupW*0.44,cupY+cupH); c.lineTo(cupX-cupW*0.44,cupY+cupH); c.closePath(); c.clip();
    c.fillStyle = waterCol; c.fillRect(cupX-cupW/2,cupY,cupW,cupH);
    c.restore();

    // انسكاب الصبغة أثناء الإضافة
    if(justAfter('addcolor') && tt<1){
      c.fillStyle = DYE; c.globalAlpha=0.85;
      c.beginPath(); c.moveTo(cupX-3,cupY-h*0.05); c.lineTo(cupX+3,cupY-h*0.05);
      c.lineTo(cupX+1.5,cupY+h*0.02*tt); c.lineTo(cupX-1.5,cupY+h*0.02*tt); c.closePath(); c.fill();
      c.globalAlpha=1;
    }

    // مستوى ارتفاع الصبغة داخل الساق (٠ = القاع، ١ = القمة عند الورقة)
    let dyeRise = 0;
    if(observeDone) dyeRise = 1;
    else if(observing) dyeRise = S.obsT;

    // ── الساق (شفاف قليلاً لإظهار الأنابيب الداخلية) ──
    const stemGrad = c.createLinearGradient(stemX-stemW/2,0,stemX+stemW/2,0);
    stemGrad.addColorStop(0, '#86A94A'); stemGrad.addColorStop(0.5,'#A3C25C'); stemGrad.addColorStop(1,'#86A94A');
    c.fillStyle = stemGrad; c.strokeStyle='#5F7A2E'; c.lineWidth=2;
    c.beginPath(); c.roundRect(stemX-stemW/2, stemTopY, stemW, stemBotY-stemTopY, [3,3,10,10]); c.fill(); c.stroke();

    // خطوط الأنسجة الوعائية الخشبية (٤ خيوط داخل الساق تتلوّن تدريجياً من الأسفل للأعلى)
    const veinOffsets = [-stemW*0.28, -stemW*0.09, stemW*0.09, stemW*0.28];
    const dyeTopY = stemBotY - (stemBotY-stemTopY)*dyeRise;
    for(const vx of veinOffsets){
      c.strokeStyle = dark?'rgba(255,255,255,0.15)':'rgba(0,0,0,0.10)'; c.lineWidth=2;
      c.beginPath(); c.moveTo(stemX+vx, stemBotY); c.lineTo(stemX+vx, stemTopY); c.stroke();
      if(dyeRise>0.01){
        c.strokeStyle = DYE; c.lineWidth=2.6; c.lineCap='round';
        c.beginPath(); c.moveTo(stemX+vx, stemBotY); c.lineTo(stemX+vx, Math.max(dyeTopY, stemTopY)); c.stroke();
      }
    }
    c.fillStyle = g8pMut(dark); c.font=`${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
    c.fillText('🌿 ساق الكرفس', cupX, cupY+cupH+h*0.045);

    // ── الورقة أعلى الساق (تتلوّن أطراف عروقها عند وصول الصبغة للقمة) ──
    const leafReached = dyeRise>0.92;
    c.save(); c.translate(stemX, stemTopY);
    const leafCol = leafReached ? _g8pLerpColor('#4ADE80', DYE, Math.min(1,(dyeRise-0.92)/0.08)) : '#4ADE80';
    c.fillStyle = leafCol; c.strokeStyle='#166534'; c.lineWidth=1.5;
    for(const side of [-1,1]){
      c.save(); c.rotate(side*0.5);
      c.beginPath();
      c.moveTo(0,0);
      c.quadraticCurveTo(side*w*0.05, -h*0.03, side*w*0.09, -h*0.005);
      c.quadraticCurveTo(side*w*0.05, h*0.01, 0, 0.005);
      c.closePath(); c.fill(); c.stroke();
      c.restore();
    }
    c.restore();

    // مؤشر الوقت أثناء المراقبة
    if(observing){
      const hrs = Math.max(1, Math.round(1+S.obsT*11));
      c.fillStyle = g8pAccent(dark); c.font=`bold ${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
      c.fillText(`⏩ بعد ${hrs} ساعة تقريباً`, w/2, h*0.9);
    }

    // ── تكبير مقطع الساق (بعد خطوة zoom): دائرة تُظهر ترتيب الأنسجة الوعائية الخشبية ──
    if(activeSince('zoom')){
      const zoomIn = justAfter('zoom') ? tt : 1;
      c.save(); c.globalAlpha = zoomIn;
      const zx=w*0.78, zy=h*0.32, zr=Math.min(w,h)*0.13*zoomIn + Math.min(w,h)*0.001;
      c.fillStyle = dark? '#0B1A10':'#FFFFFF'; c.strokeStyle=g8pAccent(dark); c.lineWidth=3;
      c.beginPath(); c.arc(zx,zy,zr,0,Math.PI*2); c.fill(); c.stroke();
      c.save(); c.beginPath(); c.arc(zx,zy,zr-3,0,Math.PI*2); c.clip();
      c.fillStyle = '#C7DDA0'; c.fillRect(zx-zr,zy-zr,zr*2,zr*2);
      for(let a=0;a<8;a++){
        const ang = a/8*Math.PI*2;
        const vx = zx+Math.cos(ang)*zr*0.55, vy=zy+Math.sin(ang)*zr*0.55;
        c.fillStyle = DYE;
        c.beginPath(); c.ellipse(vx,vy, zr*0.09, zr*0.14, ang, 0, Math.PI*2); c.fill();
      }
      c.restore(); c.restore();
      c.fillStyle = g8pMut(dark); c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
      c.fillText('مقطع الساق: الأنسجة الوعائية الخشبية', zx, zy+zr+h*0.04);
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}
