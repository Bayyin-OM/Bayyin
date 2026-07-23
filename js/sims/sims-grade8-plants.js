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

/* ════════════════════════════════════════
   نشاط ١-١ · التاب ١ — كيف يحدث التمثيل الضوئي؟
════════════════════════════════════════ */
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
