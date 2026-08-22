// ══════════════════════════════════════════════════════════
// الصف الثامن — الوحدة السادسة: الحركة وعزم القوة (كتاب الصف الثامن ص٩٨-١٠٣)
// نشاط ١-٦ · السرعة
// نشاط ٢-٦ · التحقّق من السرعة (البوابات الضوئية)
// نشاط ٣-٦ · حساب السرعة
// ══════════════════════════════════════════════════════════

/* سيارة جانبية واقعية مبسّطة — B هي عرض السيارة (وحدة القياس الموحّدة) */
function g8mCar(c, cx, groundY, B, color, dark, flip){
  c.save();
  c.translate(cx, groundY);
  if(flip) c.scale(-1,1);
  // ظل
  c.save(); c.fillStyle=dark?'rgba(0,0,0,0.35)':'rgba(0,0,0,0.15)';
  c.beginPath(); c.ellipse(0, B*0.02, B*0.52, B*0.05,0,0,Math.PI*2); c.fill(); c.restore();
  // الهيكل
  c.beginPath();
  c.moveTo(-B*0.46, 0);
  c.lineTo(-B*0.46, -B*0.16);
  c.quadraticCurveTo(-B*0.4,-B*0.24,-B*0.28,-B*0.24);
  c.lineTo(-B*0.18,-B*0.24);
  c.quadraticCurveTo(-B*0.1,-B*0.42,B*0.06,-B*0.42);
  c.lineTo(B*0.24,-B*0.42);
  c.quadraticCurveTo(B*0.34,-B*0.24,B*0.42,-B*0.24);
  c.quadraticCurveTo(B*0.46,-B*0.24,B*0.46,-B*0.16);
  c.lineTo(B*0.46,0);
  c.closePath();
  const grad=c.createLinearGradient(0,-B*0.4,0,0); grad.addColorStop(0,color); grad.addColorStop(1,g8mShade(color));
  c.fillStyle=grad; c.strokeStyle=g8mShade(color,0.55); c.lineWidth=Math.max(1.5,B*0.02); c.lineJoin='round';
  c.fill(); c.stroke();
  // نافذة
  c.save(); c.fillStyle= dark?'rgba(147,197,253,0.55)':'rgba(191,219,254,0.9)'; c.strokeStyle='#1E293B'; c.lineWidth=1.4;
  c.beginPath();
  c.moveTo(-B*0.14,-B*0.25); c.quadraticCurveTo(-B*0.08,-B*0.39,B*0.05,-B*0.39);
  c.lineTo(B*0.2,-B*0.39); c.quadraticCurveTo(B*0.28,-B*0.25,B*0.34,-B*0.25);
  c.closePath(); c.fill(); c.stroke();
  c.restore();
  // عجلات
  const wr=B*0.115;
  [-B*0.26, B*0.26].forEach(wx=>{
    c.fillStyle='#111827'; c.beginPath(); c.arc(wx,0,wr,0,Math.PI*2); c.fill();
    c.fillStyle='#9CA3AF'; c.beginPath(); c.arc(wx,0,wr*0.45,0,Math.PI*2); c.fill();
  });
  c.restore();
}
function g8mShade(hex, f){
  f = f===undefined?0.72:f;
  const n = parseInt(hex.slice(1),16);
  let r=(n>>16)&255, g=(n>>8)&255, b=n&255;
  r=Math.round(r*f); g=Math.round(g*f); b=Math.round(b*f);
  return `rgb(${r},${g},${b})`;
}
function g8mGp(cv,e){ return g8lGp(cv,e); }

/* ══════════════════════════════════════════════════════════
   نشاط ١-٦ · السرعة (ص٩٨-٩٩)
   ══════════════════════════════════════════════════════════ */

/* تاب ١: من الأسرع؟ */
function simG8Mot6N1a(){
  cancelAnimationFrame(animFrame);
  const CARS = [
    {name:'السيارة ١', speed:10, color:'#3B82F6'},
    {name:'السيارة ٢', speed:15, color:'#EF4444'},
    {name:'السيارة ٣', speed:6,  color:'#22C55E'},
  ];
  const TIME = 4;
  simState = { stage:'predict', animT:0, qSel:null };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const QOPTS = ['لأنّها قطعت المسافات نفسها.','لأنّها قطعت مسافات مختلفة في الزمن نفسه.','لأنّها كانت بألوان مختلفة.','لا علاقة للمسافة بالسرعة.'];
  const QANS = 1;

  function renderControls(){
    if(S.stage==='predict'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🏁 من الأسرع؟</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:12px">تتحرّك السيارات الثلاث معًا لمدّة ${TIME} ثوانٍ. راقبي أيّها يقطع مسافة أكبر.</div>
        <button class="ctrl-btn play" onclick="window._g8mRace()">🏁 ابدئي الحركة</button>`;
    }
    if(S.stage==='racing'){
      return `<div class="ctrl-section"><div class="ctrl-label">⏱️ الزمن: ${Math.min(TIME,S.animT).toFixed(1)} s</div></div><div style="font-size:12.5px;color:var(--text-secondary)">راقبي حركة السيارات...</div>`;
    }
    const rows = CARS.map(cc=>`<tr><td style="padding:6px 4px;color:${cc.color};font-weight:800">${cc.name}</td><td style="padding:6px 4px;text-align:center">${(cc.speed*TIME)} m</td><td style="padding:6px 4px;text-align:center">${TIME} s</td><td style="padding:6px 4px;text-align:center;font-weight:800">${cc.speed} m/s</td></tr>`).join('');
    if(S.stage==='result'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">📊 النتائج</div></div>
        <table style="width:100%;font-size:12px;border-collapse:collapse;margin-bottom:12px">
          <tr style="border-bottom:2px solid var(--bg-card2);font-weight:800"><td style="padding:6px 4px">السيارة</td><td style="text-align:center">المسافة</td><td style="text-align:center">الزمن</td><td style="text-align:center">السرعة</td></tr>
          ${rows}
        </table>
        <button class="ctrl-btn play" onclick="window._g8mAskWhy1()">🤔 لماذا اختلفت السرعة؟</button>`;
    }
    // qAsked / qAnswered
    return `
      <div class="ctrl-section"><div class="ctrl-label">🤔 توقّعي</div></div>
      <div style="font-size:13.5px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px">إذا تحرّكت السيارات في الزمن نفسه، فلماذا اختلفت سرعتها؟</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${QOPTS.map((o,i)=>`<button onclick="window._g8mQAns1(${i})" style="padding:10px;border-radius:9px;border:2px solid ${S.qSel===null?'#ddd':(i===QANS?'#22C55E':(i===S.qSel?'#DC2626':'#ddd'))};background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:12.5px">${o}</button>`).join('')}
      </div>
      ${S.stage==='qAnswered' ? `
      <div style="margin-top:10px;padding:13px;background:${S.qSel===QANS?'rgba(74,222,128,0.15)':'rgba(239,68,68,0.1)'};border-radius:10px;font-size:13px;line-height:1.9;color:var(--text-secondary)">
        ${S.qSel===QANS?'✅ صحيح!':'💡'} <strong style="color:#D4901A">السرعة</strong> هي المسافة التي يقطعها جسم ما خلال وحدة الزمن.<br>
        <span style="font-weight:800;font-size:14px">السرعة = المسافة ÷ الزمن</span>
      </div>
      <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g8mRestart1()">↺ أعيدي التجربة</button>` : ''}
    `;
  }
  controls(renderControls());
  window._g8mRace = function(){ _g8pPlayClick(); S.stage='racing'; S.animT=0; };
  window._g8mAskWhy1 = function(){ _g8pPlayClick(); S.stage='qAsked'; controls(renderControls()); };
  window._g8mQAns1 = function(i){ _g8pPlayClick(); S.qSel=i; S.stage='qAnswered'; if(i===QANS) _g8pPlayDrop(); controls(renderControls()); };
  window._g8mRestart1 = function(){ S.stage='predict'; S.animT=0; S.qSel=null; controls(renderControls()); };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null; cv.onclick=null;

  function draw(){
    if(currentSim!=='g8mot6n1' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g8cBg(dark); c.fillRect(0,0,w,h);

    let t = 0;
    if(S.stage==='predict') t=0;
    else if(S.stage==='racing'){ S.animT += 0.045; t=Math.min(TIME,S.animT); if(t>=TIME){ S.stage='result'; controls(renderControls()); } }
    else t = TIME;

    const trackX0 = w*0.2, trackW = w*0.68, maxM = 65, pxPerM = trackW/maxM;
    const laneY = [h*0.28, h*0.5, h*0.72];
    const B = w*0.09;

    // خط زمن أعلى الشاشة
    c.fillStyle=g8cMut(dark); c.font=`bold ${Math.round(h*0.02)}px Tajawal`; c.textAlign='right';
    c.fillText(`⏱️ ${t.toFixed(1)} s`, w*0.94, h*0.1);

    // المسارات وتسميات السيارات (ثابتة يسار الشاشة — لا تتحرك)
    CARS.forEach((cc,i)=>{
      c.save(); c.strokeStyle=dark?'#3A2A1A':'#E5DDD0'; c.lineWidth=2;
      c.beginPath(); c.moveTo(trackX0,laneY[i]+B*0.03); c.lineTo(trackX0+trackW,laneY[i]+B*0.03); c.stroke(); c.restore();
      c.fillStyle=cc.color; c.font=`bold ${Math.round(h*0.016)}px Tajawal`; c.textAlign='right';
      c.fillText(cc.name, trackX0-w*0.015, laneY[i]+B*0.01);
    });

    // المسطرة (تدريج المسافة) أسفل المضمار
    const rulerY = h*0.87;
    c.save(); c.strokeStyle=g8cMut(dark); c.lineWidth=1.5;
    c.beginPath(); c.moveTo(trackX0,rulerY); c.lineTo(trackX0+trackW,rulerY); c.stroke();
    for(let m=0;m<=maxM;m+=10){
      const x=trackX0+m*pxPerM;
      c.beginPath(); c.moveTo(x,rulerY-5); c.lineTo(x,rulerY+5); c.stroke();
      c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.012)}px Tajawal`; c.textAlign='center';
      c.fillText(m+' m', x, rulerY+h*0.028);
    }
    c.restore();

    // السيارات
    CARS.forEach((cc,i)=>{
      const dist = cc.speed*t;
      const x = trackX0 + dist*pxPerM;
      g8mCar(c, x, laneY[i], B, cc.color, dark, true);
    });

    // بعد التوقف: أقواس المسافة الكلية
    if(S.stage!=='predict' && S.stage!=='racing'){
      CARS.forEach((cc,i)=>{
        const dist = cc.speed*TIME, endX = trackX0+dist*pxPerM, y = laneY[i]-B*0.5;
        c.save(); c.strokeStyle=cc.color; c.lineWidth=2; c.setLineDash([4,3]);
        c.beginPath(); c.moveTo(trackX0,y); c.lineTo(endX,y); c.stroke(); c.restore();
        c.fillStyle=cc.color; c.font=`bold ${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
        c.fillText(`${dist} m`, (trackX0+endX)/2, y-h*0.012);
      });
    }

    g8lHeader(c,w,h,dark,'نشاط ١-٦ · من الأسرع؟');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* تاب ٢: جرّبي بنفسك (تغيير المسافة أو الزمن) */
function simG8Mot6N1b(){
  cancelAnimationFrame(animFrame);
  simState = { distance:40, time:4, running:false, animT:0 };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    const speed = (S.distance/S.time);
    return `
      <div class="ctrl-section"><div class="ctrl-label">🎚️ جرّبي بنفسك</div></div>
      <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:12px">🤔 توقّعي: ماذا يحدث للسرعة إذا قطعت السيارة مسافة أكبر في الزمن نفسه؟ غيّري القيم وجرّبي.</div>
      <div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;font-size:12.5px;font-weight:700;margin-bottom:4px"><span>المسافة</span><span id="g8mDistLbl">${S.distance} m</span></div>
        <input type="range" min="10" max="100" step="5" value="${S.distance}" oninput="simState.distance=+this.value; document.getElementById('g8mDistLbl').textContent=this.value+' m'; document.getElementById('g8mSpdLbl').textContent=(simState.distance/simState.time).toFixed(1)+' m/s'" style="width:100%">
      </div>
      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;font-size:12.5px;font-weight:700;margin-bottom:4px"><span>الزمن</span><span id="g8mTimeLbl">${S.time} s</span></div>
        <input type="range" min="1" max="10" step="1" value="${S.time}" oninput="simState.time=+this.value; document.getElementById('g8mTimeLbl').textContent=this.value+' s'; document.getElementById('g8mSpdLbl').textContent=(simState.distance/simState.time).toFixed(1)+' m/s'" style="width:100%">
      </div>
      <div style="text-align:center;background:var(--bg-card2);border-radius:10px;padding:12px;margin-bottom:12px;font-size:15px;font-weight:800">
        السرعة = <span id="g8mSpdLbl">${speed.toFixed(1)} m/s</span>
      </div>
      <button class="ctrl-btn play" onclick="window._g8mRun1b()">▶ شغّلي السيارة</button>
    `;
  }
  controls(renderControls());
  window._g8mRun1b = function(){ _g8pPlayClick(); S.running=true; S.animT=0; };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null; cv.onclick=null;

  function draw(){
    if(currentSim!=='g8mot6n1' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g8cBg(dark); c.fillRect(0,0,w,h);

    const trackX0=w*0.14, trackW=w*0.76, maxM=100, pxPerM=trackW/maxM;
    const laneY=h*0.5, B=w*0.1, rulerY=h*0.72;

    c.save(); c.strokeStyle=dark?'#3A2A1A':'#E5DDD0'; c.lineWidth=2;
    c.beginPath(); c.moveTo(trackX0,laneY+B*0.03); c.lineTo(trackX0+trackW,laneY+B*0.03); c.stroke(); c.restore();

    c.save(); c.strokeStyle=g8cMut(dark); c.lineWidth=1.5;
    c.beginPath(); c.moveTo(trackX0,rulerY); c.lineTo(trackX0+trackW,rulerY); c.stroke();
    for(let m=0;m<=maxM;m+=20){
      const x=trackX0+m*pxPerM;
      c.beginPath(); c.moveTo(x,rulerY-5); c.lineTo(x,rulerY+5); c.stroke();
      c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.012)}px Tajawal`; c.textAlign='center';
      c.fillText(m+' m', x, rulerY+h*0.028);
    }
    c.restore();

    let t=0;
    if(S.running){ S.animT += (1/60); t=Math.min(S.time,S.animT); if(t>=S.time) S.running=false; }
    const dist = S.running ? (S.distance/S.time)*t : 0;
    const x = trackX0 + dist*pxPerM;
    g8mCar(c, x, laneY, B, '#D4901A', dark, true);

    c.fillStyle=g8cMut(dark); c.font=`bold ${Math.round(h*0.018)}px Tajawal`; c.textAlign='right';
    c.fillText(`⏱️ ${t.toFixed(1)} s`, w*0.9, h*0.14);

    g8lHeader(c,w,h,dark,'نشاط ١-٦ · جرّبي بنفسك');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   نشاط ٢-٦ · التحقّق من السرعة — البوابتان الضوئيتان (ص١٠٠-١٠١)
   ══════════════════════════════════════════════════════════ */

/* تاب ١: البوابتان الضوئيتان */
function simG8Mot6N2a(){
  cancelAnimationFrame(animFrame);
  const DIST = 10, TIME = 2.0; // قيم مبسّطة تعليميًا (بُطّئت الحركة الحقيقية لتوضيح الفكرة)
  simState = { stage:'idle', animT:0, revealed:false, timerVal:0 };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    if(S.stage==='idle'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">📡 البوابتان الضوئيتان Light Gates</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:12px">تفصل بين البوابتين مسافة ${DIST} m. كلّ بوابة تصدر شعاعًا من الأشعة تحت الحمراء غير المرئي — راقبي ماذا يحدث عندما تقطعه السيارة.</div>
        <button class="ctrl-btn play" onclick="window._g8mGateRun()">🚗 حرّكي السيارة</button>
        <div style="font-size:11.5px;color:var(--text-secondary);margin-top:10px">💡 أبطأنا الحركة هنا لتوضيح الفكرة — في الواقع تكون السيارات أسرع بكثير.</div>`;
    }
    if(S.stage!=='done'){
      return `<div class="ctrl-section"><div class="ctrl-label">⏱️ جهاز قياس الزمن الإلكتروني</div></div>
      <div style="text-align:center;background:#111827;border-radius:10px;padding:16px;margin-bottom:10px;font-family:monospace;font-size:28px;font-weight:900;color:#4ADE80">${S.timerVal.toFixed(2)}s</div>
      <div style="font-size:12.5px;color:var(--text-secondary)">راقبي السيارة وهي تقطع شعاعي البوابتين.</div>`;
    }
    return `
      <div class="ctrl-section"><div class="ctrl-label">⏱️ توقّف القياس!</div></div>
      <div style="text-align:center;background:#111827;border-radius:10px;padding:16px;margin-bottom:12px;font-family:monospace;font-size:28px;font-weight:900;color:#4ADE80">${TIME.toFixed(2)}s</div>
      <div style="background:var(--bg-card2);border-radius:10px;padding:12px;margin-bottom:12px;font-size:13px;font-weight:700">السرعة = ${DIST} m ÷ ${TIME} s = <strong style="color:#D4901A">${(DIST/TIME).toFixed(1)} m/s</strong></div>
      ${!S.revealed ? `<button class="ctrl-btn play" onclick="window._g8mGateWhy()">🤔 ماذا حدث عند قطع الشعاع؟</button>` : `
      <div style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:12px">عندما تقطع السيارة الشعاع، ترسل البوابة الضوئية <strong style="color:#D4901A">نبضة كهربائية</strong> إلى جهاز قياس الزمن الإلكتروني — فيبدأ القياس عند "طرف البداية"، ويتوقّف عند "طرف الإيقاف".</div>
      <button class="ctrl-btn reset" onclick="window._g8mGateRestart()">↺ أعيدي التجربة</button>`}
    `;
  }
  controls(renderControls());
  window._g8mGateRun = function(){ _g8pPlayClick(); S.stage='moving'; S.animT=0; S.timerVal=0; };
  window._g8mGateWhy = function(){ _g8pPlayClick(); S.revealed=true; controls(renderControls()); };
  window._g8mGateRestart = function(){ S.stage='idle'; S.animT=0; S.revealed=false; S.timerVal=0; controls(renderControls()); };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null; cv.onclick=null;

  function drawGate(c,x,groundY,B,dark,active){
    c.save();
    c.strokeStyle= active? g8cAccent(dark) : g8cMut(dark); c.lineWidth=Math.max(3,B*0.05);
    c.beginPath(); c.moveTo(x-B*0.22,groundY); c.lineTo(x-B*0.22,groundY-B*0.62); c.stroke();
    c.beginPath(); c.moveTo(x+B*0.22,groundY); c.lineTo(x+B*0.22,groundY-B*0.62); c.stroke();
    // ملف سلكي أعلى كل عمود (كما في رسم الكتاب)
    [-1,1].forEach(s=>{
      c.strokeStyle=g8cMut(dark); c.lineWidth=1.6;
      c.beginPath();
      for(let i=0;i<4;i++) c.arc(x+s*B*0.22, groundY-B*0.6+i*B*0.05, B*0.035, Math.PI*0.2, Math.PI*1.8);
      c.stroke();
    });
    // الشعاع تحت الأحمر (يظهر خط منقّط أحمر خافت دومًا، ويتوهّج عند القطع)
    c.strokeStyle= active? '#EF4444' : 'rgba(239,68,68,0.35)'; c.lineWidth= active? 3:1.5; c.setLineDash(active?[]:[4,3]);
    c.beginPath(); c.moveTo(x-B*0.22,groundY-B*0.22); c.lineTo(x+B*0.22,groundY-B*0.22); c.stroke();
    c.restore();
  }

  function draw(){
    if(currentSim!=='g8mot6n2' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g8cBg(dark); c.fillRect(0,0,w,h);

    const trackX0=w*0.14, trackX1=w*0.82, groundY=h*0.66, B=w*0.13;
    const gate1X = w*0.34, gate2X = w*0.68;

    // الأرض
    c.save(); c.strokeStyle=dark?'#3A2A1A':'#E5DDD0'; c.lineWidth=2;
    c.beginPath(); c.moveTo(trackX0,groundY+B*0.03); c.lineTo(trackX1,groundY+B*0.03); c.stroke(); c.restore();

    // موضع السيارة بحسب المرحلة
    let carX = trackX0+B*0.4, beam1Active=false, beam2Active=false;
    if(S.stage!=='idle'){
      S.animT += 0.012;
      const totalX = trackX1-(trackX0+B*0.4);
      const prog = Math.min(1,S.animT);
      carX = trackX0+B*0.4 + totalX*prog;
      if(carX>=gate1X && !S._g1){ S._g1=true; S._t0=S.animT; }
      if(S._g1) beam1Active = Math.abs(carX-gate1X) < B*0.16;
      if(carX>=gate2X && !S._g2){ S._g2=true; }
      if(S._g2) beam2Active = Math.abs(carX-gate2X) < B*0.16;
      if(S._g1 && !S._g2){
        const frac = S.animT - S._t0;
        const spanFrac = (gate2X-gate1X)/totalX;
        S.timerVal = Math.min(TIME, TIME*Math.min(1, frac/spanFrac));
      }
      if(S._g2 && carX>=gate2X+B*0.16 && S.stage!=='done'){ S.stage='done'; S.timerVal=TIME; controls(renderControls()); }
    }

    // البوابتان
    drawGate(c,gate1X,groundY,B,dark,beam1Active);
    drawGate(c,gate2X,groundY,B,dark,beam2Active);
    c.fillStyle=g8cMut(dark); c.font=`bold ${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
    c.fillText('الكاشف ١ (طرف البداية)', gate1X, groundY+h*0.06);
    c.fillText('الكاشف ٢ (طرف الإيقاف)', gate2X, groundY+h*0.06);
    c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.013)}px Tajawal`;
    c.fillText(`${DIST} m`, (gate1X+gate2X)/2, groundY-B*0.75);
    c.save(); c.strokeStyle=g8cMut(dark); c.lineWidth=1.2;
    c.beginPath(); c.moveTo(gate1X,groundY-B*0.68); c.lineTo(gate2X,groundY-B*0.68); c.stroke(); c.restore();

    // السيارة
    g8mCar(c, carX, groundY, B*0.75, '#3B82F6', dark, true);

    // جهاز قياس الزمن (يمين)
    const boxX=w*0.93, boxY=h*0.3;
    c.save(); c.fillStyle='#374151'; c.strokeStyle=g8cMut(dark); c.lineWidth=2;
    c.beginPath(); c.roundRect(boxX-w*0.05,boxY-h*0.045,w*0.06,h*0.09,6); c.fill(); c.stroke();
    c.fillStyle='#111827'; c.beginPath(); c.roundRect(boxX-w*0.043,boxY-h*0.03,w*0.046,h*0.03,3); c.fill();
    c.fillStyle='#4ADE80'; c.font=`bold ${Math.round(h*0.016)}px monospace`; c.textAlign='center';
    c.fillText(S.timerVal.toFixed(2), boxX-w*0.02, boxY-h*0.008);
    c.restore();
    c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.012)}px Tajawal`; c.textAlign='center';
    c.fillText('جهاز قياس الزمن', boxX-w*0.02, boxY+h*0.075);

    // أسلاك من البوابات إلى الجهاز (منحنية كما في الكتاب)
    [gate1X,gate2X].forEach(gx=>{
      c.save(); c.strokeStyle=g8cMut(dark); c.globalAlpha=0.5; c.lineWidth=1.4; c.setLineDash([3,3]);
      c.beginPath(); c.moveTo(gx+B*0.22,groundY-B*0.5); c.quadraticCurveTo((gx+boxX)/2, groundY-B*0.9, boxX-w*0.05, boxY);
      c.stroke(); c.restore();
    });

    g8lHeader(c,w,h,dark,'نشاط ٢-٦ · البوابتان الضوئيتان');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* تاب ٢: قارني السرعات (بطيئة/متوسطة/سريعة) */
function simG8Mot6N2b(){
  cancelAnimationFrame(animFrame);
  const DIST = 10;
  const SPEEDS = { slow:{label:'🐢 حركة بطيئة',v:2,color:'#22C55E'}, med:{label:'🚗 حركة متوسطة',v:5,color:'#3B82F6'}, fast:{label:'🏎️ حركة سريعة',v:10,color:'#EF4444'} };
  simState = { choice:null, stage:'idle', animT:0, results:{}, showQ:false, qSel:null };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const QANS='fast';

  function renderControls(){
    const doneCount = Object.keys(S.results).length;
    return `
      <div class="ctrl-section"><div class="ctrl-label">🐢🚗🏎️ قارني السرعات</div></div>
      <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:10px">اختاري حركة وشغّلي البوابتين لقياس الزمن بينهما (المسافة ثابتة = ${DIST} m).</div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px">
        ${Object.keys(SPEEDS).map(k=>`<button ${S.stage==='moving'?'disabled':''} onclick="window._g8mPick2b('${k}')" style="padding:11px;border-radius:9px;border:2px solid ${SPEEDS[k].color};background:${S.choice===k?'rgba(212,144,26,0.12)':'var(--bg-ctrl-btn)'};color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;display:flex;justify-content:space-between"><span>${SPEEDS[k].label}</span><span>${S.results[k]?'⏱️ '+S.results[k].toFixed(1)+'s':''}</span></button>`).join('')}
      </div>
      ${doneCount>=2 ? (!S.showQ ? `<button class="ctrl-btn play" onclick="window._g8mShowQ2b()">🤔 أيّها احتاج زمنًا أقل؟</button>` : `
      <div style="font-size:13px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:12px;margin-bottom:10px">أيّ سيارة احتاجت زمنًا أقل للوصول من البوابة الأولى إلى الثانية؟</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${Object.keys(SPEEDS).map(k=>`<button onclick="window._g8mQAns2b('${k}')" style="padding:10px;border-radius:9px;border:2px solid ${S.qSel===null?'#ddd':(k===QANS?'#22C55E':(k===S.qSel?'#DC2626':'#ddd'))};background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:12.5px">${SPEEDS[k].label}</button>`).join('')}
      </div>
      ${S.qSel?`<div style="margin-top:8px;padding:10px;background:${S.qSel===QANS?'rgba(74,222,128,0.15)':'rgba(239,68,68,0.1)'};border-radius:9px;font-size:12.5px;line-height:1.8;color:var(--text-secondary)">${S.qSel===QANS?'✅ صحيح!':'💡'} السيارة الأسرع تحتاج زمنًا أقلّ لقطع المسافة نفسها بين البوابتين — وهذا هو أساس عمل البوابات الضوئية في قياس السرعة.</div>`:''}
      `) : ''}
    `;
  }
  controls(renderControls());
  window._g8mPick2b = function(k){ _g8pPlayClick(); S.choice=k; S.stage='moving'; S.animT=0; controls(renderControls()); };
  window._g8mShowQ2b = function(){ _g8pPlayClick(); S.showQ=true; controls(renderControls()); };
  window._g8mQAns2b = function(k){ _g8pPlayClick(); S.qSel=k; if(k===QANS) _g8pPlayDrop(); controls(renderControls()); };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null; cv.onclick=null;

  function draw(){
    if(currentSim!=='g8mot6n2' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g8cBg(dark); c.fillRect(0,0,w,h);

    const trackX0=w*0.16, trackX1=w*0.84, groundY=h*0.55, B=w*0.11;
    const gate1X=w*0.32, gate2X=w*0.68;

    c.save(); c.strokeStyle=dark?'#3A2A1A':'#E5DDD0'; c.lineWidth=2;
    c.beginPath(); c.moveTo(trackX0,groundY+B*0.03); c.lineTo(trackX1,groundY+B*0.03); c.stroke(); c.restore();

    [gate1X,gate2X].forEach(gx=>{
      c.save(); c.strokeStyle=g8cMut(dark); c.lineWidth=Math.max(3,B*0.05);
      c.beginPath(); c.moveTo(gx,groundY); c.lineTo(gx,groundY-B*0.6); c.stroke(); c.restore();
    });
    c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.013)}px Tajawal`; c.textAlign='center';
    c.fillText(`${DIST} m`, (gate1X+gate2X)/2, groundY-B*0.7);
    c.save(); c.strokeStyle=g8cMut(dark); c.lineWidth=1.2;
    c.beginPath(); c.moveTo(gate1X,groundY-B*0.62); c.lineTo(gate2X,groundY-B*0.62); c.stroke(); c.restore();

    let carX = trackX0+B*0.4;
    if(S.stage==='moving' && S.choice){
      const sp = SPEEDS[S.choice];
      S.animT += 0.025;
      const totalTime = (trackX1-trackX0)/((gate2X-gate1X)/(DIST/sp.v));
      const prog = Math.min(1, S.animT);
      carX = trackX0+B*0.4 + (trackX1-(trackX0+B*0.4))*prog;
      if(prog>=1){ S.results[S.choice]=DIST/sp.v; S.stage='idle'; controls(renderControls()); }
      g8mCar(c, carX, groundY, B*0.7, sp.color, dark, true);
    } else if(S.choice){
      g8mCar(c, carX, groundY, B*0.7, SPEEDS[S.choice].color, dark, true);
    }

    g8lHeader(c,w,h,dark,'نشاط ٢-٦ · قارني السرعات');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   نشاط ٣-٦ · حساب السرعة (ص١٠٢-١٠٣)
   ══════════════════════════════════════════════════════════ */

/* تاب ١: مثلث السرعة */
function simG8Mot6N3a(){
  cancelAnimationFrame(animFrame);
  simState = { mode:'speed', distance:8000, time:900, speed:null };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  const MODES = {
    speed: { label:'احسبي السرعة', unknown:'السرعة', context:'دراجة هوائية قطعت مسارًا خلال سباق طواف عُمان', d:8000, t:900, dUnit:'m', tUnit:'s' },
    distance: { label:'احسبي المسافة', unknown:'المسافة', context:'حافلة مدرسية تتحرّك بسرعة ثابتة', s:25, t:60, sUnit:'m/s', tUnit:'s' },
    time: { label:'احسبي الزمن', unknown:'الزمن', context:'طائرة ركّاب تطير بسرعة متوسطة', d:750000, s:250, dUnit:'m', sUnit:'m/s' },
  };

  function compute(){
    if(S.mode==='speed') return (S.distance/S.time);
    if(S.mode==='distance') return (S.speedIn*S.timeIn);
    if(S.mode==='time') return (S.distIn/S.speedIn);
  }

  function renderControls(){
    const m = MODES[S.mode];
    let inputsHtml = '';
    if(S.mode==='speed'){
      if(S.distance===undefined) S.distance=m.d; if(S.time===undefined) S.time=m.t;
      inputsHtml = `
        <label style="font-size:12px;font-weight:700">المسافة (m)</label>
        <input type="number" value="${S.distance}" oninput="simState.distance=+this.value" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ccc;margin-bottom:8px;font-family:Tajawal">
        <label style="font-size:12px;font-weight:700">الزمن (s)</label>
        <input type="number" value="${S.time}" oninput="simState.time=+this.value" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ccc;margin-bottom:10px;font-family:Tajawal">
      `;
    } else if(S.mode==='distance'){
      if(S.speedIn===undefined) S.speedIn=m.s; if(S.timeIn===undefined) S.timeIn=m.t;
      inputsHtml = `
        <label style="font-size:12px;font-weight:700">السرعة (m/s)</label>
        <input type="number" value="${S.speedIn}" oninput="simState.speedIn=+this.value" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ccc;margin-bottom:8px;font-family:Tajawal">
        <label style="font-size:12px;font-weight:700">الزمن (s)</label>
        <input type="number" value="${S.timeIn}" oninput="simState.timeIn=+this.value" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ccc;margin-bottom:10px;font-family:Tajawal">
      `;
    } else {
      if(S.distIn===undefined) S.distIn=m.d; if(S.speedIn===undefined) S.speedIn=m.s;
      inputsHtml = `
        <label style="font-size:12px;font-weight:700">المسافة (m)</label>
        <input type="number" value="${S.distIn}" oninput="simState.distIn=+this.value" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ccc;margin-bottom:8px;font-family:Tajawal">
        <label style="font-size:12px;font-weight:700">السرعة (m/s)</label>
        <input type="number" value="${S.speedIn}" oninput="simState.speedIn=+this.value" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ccc;margin-bottom:10px;font-family:Tajawal">
      `;
    }
    return `
      <div class="ctrl-section"><div class="ctrl-label">🔺 مثلّث السرعة</div></div>
      <div style="display:flex;gap:6px;margin-bottom:12px">
        ${Object.keys(MODES).map(k=>`<button onclick="window._g8mMode3a('${k}')" style="flex:1;padding:9px 2px;border-radius:8px;border:2px solid ${S.mode===k?'#D4901A':'#ddd'};background:${S.mode===k?'rgba(212,144,26,0.12)':'var(--bg-ctrl-btn)'};color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:11.5px">${MODES[k].label}</button>`).join('')}
      </div>
      <div style="font-size:12px;color:var(--text-secondary);margin-bottom:10px">📌 ${m.context}</div>
      ${inputsHtml}
      <button class="ctrl-btn play" onclick="window._g8mCalc3a()">🖩 احسبي ${m.unknown}</button>
      ${S.result!==undefined ? `<div style="margin-top:12px;text-align:center;background:var(--bg-card2);border-radius:10px;padding:13px;font-size:15px;font-weight:800;color:#D4901A">${m.unknown} = ${S.result}</div>` : ''}
    `;
  }
  controls(renderControls());
  window._g8mMode3a = function(k){ _g8pPlayClick(); S.mode=k; S.result=undefined; S.distance=undefined; S.time=undefined; S.speedIn=undefined; S.timeIn=undefined; S.distIn=undefined; controls(renderControls()); };
  window._g8mCalc3a = function(){
    _g8pPlayClick();
    let val, unit;
    if(S.mode==='speed'){ val=(S.distance/S.time); unit='m/s'; }
    else if(S.mode==='distance'){ val=(S.speedIn*S.timeIn); unit='m'; }
    else { val=(S.distIn/S.speedIn); unit='s'; }
    S.result = (Math.round(val*100)/100)+' '+unit;
    _g8pPlayDrop();
    controls(renderControls());
  };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null; cv.onclick=null;

  function draw(){
    if(currentSim!=='g8mot6n3' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g8cBg(dark); c.fillRect(0,0,w,h);

    // مثلث السرعة: المسافة أعلى، السرعة والزمن أسفل
    const cx=w*0.5, topY=h*0.32, botY=h*0.62, halfW=w*0.19;
    const covered = S.mode; // 'speed'|'distance'|'time' — الجزء المغطّى هو المجهول

    c.save(); c.strokeStyle=g8cMut(dark); c.lineWidth=2.5;
    c.beginPath(); c.moveTo(cx,topY-h*0.1); c.lineTo(cx-halfW,botY); c.lineTo(cx+halfW,botY); c.closePath(); c.stroke();
    c.beginPath(); c.moveTo(cx,botY); c.lineTo(cx,topY-h*0.1); c.stroke();
    c.restore();

    function cell(label, cxp, cyp, key){
      const isCovered = covered===key;
      c.save();
      if(isCovered){ c.fillStyle=g8cAccent(dark); c.globalAlpha=0.18; c.beginPath(); c.arc(cxp,cyp,w*0.075,0,Math.PI*2); c.fill(); c.globalAlpha=1; }
      c.fillStyle = isCovered? g8cAccent(dark) : g8cTxt(dark);
      c.font=`bold ${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
      c.fillText(isCovered?'؟':label, cxp, cyp+h*0.007);
      c.restore();
    }
    cell('المسافة', cx, topY+h*0.02, 'distance');
    cell('السرعة', cx-halfW*0.55, botY+h*0.06, 'speed');
    cell('الزمن', cx+halfW*0.55, botY+h*0.06, 'time');

    c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
    c.fillText('غطّي الكمّية المجهولة لتري كيف تُحسب من البقيّتين', cx, botY+h*0.13);

    g8lHeader(c,w,h,dark,'نشاط ٣-٦ · مثلّث السرعة');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* تاب ٢: مسائل تطبيقية */
function simG8Mot6N3b(){
  cancelAnimationFrame(animFrame);
  const QUESTIONS = [
    { q:'قطع عدّاء مسافة 200 m في 25 s. فما سرعته المتوسّطة؟', opts:['4 m/s','8 m/s','10 m/s','25 m/s'], ans:1, fb:'السرعة = 200 m ÷ 25 s = 8 m/s' },
    { q:'قطعت سيّارة حمراء مسافة 400 m في 20 s، وقطعت سيّارة زرقاء مسافة 660 m في 30 s. أيّ السيّارتين لها سرعة متوسّطة أكبر؟', opts:['الحمراء (20 m/s)','الزرقاء (22 m/s)','متساويتان','لا يمكن معرفة ذلك'], ans:1, fb:'الحمراء: 400÷20=20 m/s. الزرقاء: 660÷30=22 m/s. الزرقاء أسرع.' },
    { q:'تتحرّك حافلة بسرعة متوسّطة 25 m/s. ما المسافة التي تقطعها خلال دقيقة واحدة (60 s)؟', opts:['25 m','60 m','1500 m','1525 m'], ans:2, fb:'المسافة = السرعة × الزمن = 25 m/s × 60 s = 1500 m' },
  ];
  simState = { idx:0, sel:null, score:0 };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    if(S.idx>=QUESTIONS.length){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🎉 انتهت المسائل!</div></div>
        <div style="text-align:center;background:var(--bg-card2);border-radius:10px;padding:16px;font-size:16px;font-weight:800">نتيجتك: ${S.score} / ${QUESTIONS.length}</div>
        <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g8mRestart3b()">↺ أعيدي المحاولة</button>`;
    }
    const q = QUESTIONS[S.idx];
    return `
      <div class="ctrl-section"><div class="ctrl-label">📝 مسألة ${S.idx+1} من ${QUESTIONS.length}</div></div>
      <div style="font-size:13.5px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px">${q.q}</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${q.opts.map((o,i)=>`<button onclick="window._g8mQAns3b(${i})" style="padding:10px;border-radius:9px;border:2px solid ${S.sel===null?'#ddd':(i===q.ans?'#22C55E':(i===S.sel?'#DC2626':'#ddd'))};background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:12.5px">${o}</button>`).join('')}
      </div>
      ${S.sel!==null?`
      <div style="margin-top:10px;padding:12px;background:${S.sel===q.ans?'rgba(74,222,128,0.15)':'rgba(239,68,68,0.1)'};border-radius:9px;font-size:12.5px;line-height:1.8;color:var(--text-secondary)">${S.sel===q.ans?'✅ صحيح!':'💡'} ${q.fb}</div>
      <button class="ctrl-btn play" style="margin-top:12px" onclick="window._g8mNext3b()">التالي ←</button>`:''}
    `;
  }
  controls(renderControls());
  window._g8mQAns3b = function(i){
    _g8pPlayClick(); S.sel=i;
    if(i===QUESTIONS[S.idx].ans){ S.score++; _g8pPlayDrop(); }
    controls(renderControls());
  };
  window._g8mNext3b = function(){ _g8pPlayClick(); S.idx++; S.sel=null; controls(renderControls()); };
  window._g8mRestart3b = function(){ S.idx=0; S.sel=null; S.score=0; controls(renderControls()); };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null; cv.onclick=null;

  function draw(){
    if(currentSim!=='g8mot6n3' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g8cBg(dark); c.fillRect(0,0,w,h);

    const B=w*0.14, groundY=h*0.6;
    c.save(); c.strokeStyle=dark?'#3A2A1A':'#E5DDD0'; c.lineWidth=2;
    c.beginPath(); c.moveTo(w*0.1,groundY+B*0.03); c.lineTo(w*0.9,groundY+B*0.03); c.stroke(); c.restore();
    g8mCar(c, w*0.32, groundY, B, '#EF4444', dark, true);
    g8mCar(c, w*0.68, groundY, B*0.85, '#3B82F6', dark, true);

    c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.018)}px Tajawal`; c.textAlign='center';
    c.fillText('📝 اختاري إجابتك من القائمة', w*0.5, h*0.82);

    g8lHeader(c,w,h,dark,'نشاط ٣-٦ · مسائل تطبيقية');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* أداة مساعدة مشتركة: محاور رسم بياني (المسافة/الزمن) */
function g8mGraphAxes(c,x0,y0,gw,gh,xmax,ymax,xStep,yStep,dark){
  c.save();
  c.strokeStyle=g8cMut(dark); c.lineWidth=1.6;
  c.beginPath(); c.moveTo(x0,y0); c.lineTo(x0,y0-gh); c.stroke();
  c.beginPath(); c.moveTo(x0,y0); c.lineTo(x0+gw,y0); c.stroke();
  c.font=`${Math.round(gh*0.05)}px Tajawal`; c.fillStyle=g8cMut(dark);
  for(let x=0;x<=xmax;x+=xStep){
    const px=x0+(x/xmax)*gw;
    c.beginPath(); c.strokeStyle=dark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)'; c.lineWidth=1;
    c.moveTo(px,y0); c.lineTo(px,y0-gh); c.stroke();
    c.fillStyle=g8cMut(dark); c.textAlign='center'; c.fillText(x, px, y0+gh*0.07);
  }
  for(let y=0;y<=ymax;y+=yStep){
    const py=y0-(y/ymax)*gh;
    c.beginPath(); c.strokeStyle=dark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)'; c.lineWidth=1;
    c.moveTo(x0,py); c.lineTo(x0+gw,py); c.stroke();
    c.fillStyle=g8cMut(dark); c.textAlign='right'; c.fillText(y, x0-gw*0.02, py+gh*0.018);
  }
  c.restore();
}
function g8mGPoint(x0,y0,gw,gh,xmax,ymax,tv,dv){ return { x:x0+(tv/xmax)*gw, y:y0-(dv/ymax)*gh }; }

/* ══════════════════════════════════════════════════════════
   نشاط ٤-٦ · أنماط الحركة (ص١٠٤-١٠٥)
   ══════════════════════════════════════════════════════════ */

/* تاب ١: السيارة والرسم البياني */
function simG8Mot6N4a(){
  cancelAnimationFrame(animFrame);
  const SPEED=10, DUR=5; // m/s, s — أرقام سهلة: نقطة كل ثانية حتى 50m
  simState = { stage:'idle', animT:0, points:[], lastSec:-1 };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    if(S.stage==='idle'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🚗📈 السيارة والرسم البياني</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:12px">راقبي السيارة وهي تتحرّك، وشاهدي كيف يتكوّن الرسم البياني للمسافة/الزمن في الوقت نفسه.</div>
        <button class="ctrl-btn play" onclick="window._g8mRun4a()">▶ حرّكي السيارة</button>`;
    }
    if(S.stage==='running'){
      return `<div class="ctrl-section"><div class="ctrl-label">⏱️ الزمن: ${Math.min(DUR,S.animT).toFixed(1)} s</div></div><div style="font-size:12.5px;color:var(--text-secondary)">لاحظي ظهور نقطة جديدة على الرسم كلّ ثانية...</div>`;
    }
    return `
      <div class="ctrl-section"><div class="ctrl-label">📊 اكتمل الرسم</div></div>
      <div style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:12px">
        التمثيل البياني للمسافة والزمن يوضّح كيف تتغيّر المسافة التي يقطعها الجسم مع مرور الزمن. الخط المستقيم يعني أنّ الجسم يتحرّك <strong style="color:#D4901A">بسرعة ثابتة</strong> — يقطع مسافات متساوية في فترات زمنية متساوية.
      </div>
      <button class="ctrl-btn reset" onclick="window._g8mRestart4a()">↺ أعيدي التجربة</button>
    `;
  }
  controls(renderControls());
  window._g8mRun4a = function(){ _g8pPlayClick(); S.stage='running'; S.animT=0; S.points=[{t:0,d:0}]; S.lastSec=0; };
  window._g8mRestart4a = function(){ S.stage='idle'; S.animT=0; S.points=[]; S.lastSec=-1; controls(renderControls()); };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null; cv.onclick=null;

  function draw(){
    if(currentSim!=='g8mot6n4' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g8cBg(dark); c.fillRect(0,0,w,h);

    let t=0;
    if(S.stage==='running'){
      S.animT += 0.016;
      t = Math.min(DUR, S.animT);
      const sec = Math.floor(t);
      if(sec>S.lastSec && sec<=DUR){ S.lastSec=sec; S.points.push({t:sec, d:sec*SPEED}); _g8pPlayClick(); }
      if(t>=DUR){ S.stage='done'; controls(renderControls()); }
    } else if(S.stage==='done'){ t=DUR; }

    // القسم الأيمن: مسار السيارة
    const trackX0=w*0.06, trackW=w*0.4, laneY=h*0.24, B=w*0.075;
    c.save(); c.strokeStyle=dark?'#3A2A1A':'#E5DDD0'; c.lineWidth=2;
    c.beginPath(); c.moveTo(trackX0,laneY+B*0.03); c.lineTo(trackX0+trackW,laneY+B*0.03); c.stroke(); c.restore();
    const rulerY=h*0.36, maxM=SPEED*DUR, pxPerM=trackW/maxM;
    c.save(); c.strokeStyle=g8cMut(dark); c.lineWidth=1.2;
    c.beginPath(); c.moveTo(trackX0,rulerY); c.lineTo(trackX0+trackW,rulerY); c.stroke();
    for(let m=0;m<=maxM;m+=10){
      const x=trackX0+m*pxPerM;
      c.beginPath(); c.moveTo(x,rulerY-4); c.lineTo(x,rulerY+4); c.stroke();
      c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.011)}px Tajawal`; c.textAlign='center';
      c.fillText(m+'m', x, rulerY+h*0.022);
    }
    c.restore();
    const carX = trackX0 + (SPEED*t)*pxPerM;
    g8mCar(c, carX, laneY, B, '#D4901A', dark, true);

    // القسم الأيسر: الرسم البياني
    const gx0=w*0.56, gy0=h*0.85, gw=w*0.4, gh=h*0.62;
    g8mGraphAxes(c,gx0,gy0,gw,gh,DUR,maxM,1,10,dark);
    c.save(); c.fillStyle=g8cMut(dark); c.font=`bold ${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
    c.fillText('الزمن (s)', gx0+gw*0.5, gy0+gh*0.13);
    c.save(); c.translate(gx0-gw*0.12, gy0-gh*0.5); c.rotate(-Math.PI/2); c.textAlign='center';
    c.fillText('المسافة (m)', 0,0); c.restore(); c.restore();

    if(S.points.length>1){
      c.save(); c.strokeStyle='#3B82F6'; c.lineWidth=Math.max(2.5,w*0.006); c.lineJoin='round'; c.lineCap='round';
      c.beginPath();
      S.points.forEach((p,i)=>{ const pt=g8mGPoint(gx0,gy0,gw,gh,DUR,maxM,p.t,p.d); if(i===0) c.moveTo(pt.x,pt.y); else c.lineTo(pt.x,pt.y); });
      c.stroke(); c.restore();
    }
    S.points.forEach(p=>{
      const pt=g8mGPoint(gx0,gy0,gw,gh,DUR,maxM,p.t,p.d);
      c.save(); c.fillStyle='#3B82F6'; c.beginPath(); c.arc(pt.x,pt.y,4,0,Math.PI*2); c.fill(); c.restore();
    });

    g8lHeader(c,w,h,dark,'نشاط ٤-٦ · السيارة والرسم البياني');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* تاب ٢: سرعة ثابتة أم متزايدة؟ (النابض الزمني / التصوير المتقطّع) */
function simG8Mot6N4b(){
  cancelAnimationFrame(animFrame);
  const OWL_GAPS = [0,1,1,1,1]; // تباعد متساوٍ = سرعة ثابتة
  const BALL_GAPS = [0,0.5,1,1.7,2.6]; // تباعد متزايد = سرعة متزايدة
  simState = { which:'owl', frameIdx:0, revealed:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    return `
      <div class="ctrl-section"><div class="ctrl-label">📸 سرعة ثابتة أم متزايدة؟</div></div>
      <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:10px">النابض الزمني يلتقط صورًا على فترات زمنية متساوية. راقبي التباعد بين الصور.</div>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <button onclick="window._g8mPick4b('owl')" style="flex:1;padding:10px;border-radius:9px;border:2px solid ${S.which==='owl'?'#D4901A':'#ddd'};background:${S.which==='owl'?'rgba(212,144,26,0.12)':'var(--bg-ctrl-btn)'};color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">🦉 البومة</button>
        <button onclick="window._g8mPick4b('ball')" style="flex:1;padding:10px;border-radius:9px;border:2px solid ${S.which==='ball'?'#D4901A':'#ddd'};background:${S.which==='ball'?'rgba(212,144,26,0.12)':'var(--bg-ctrl-btn)'};color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">⚽ الكرة</button>
      </div>
      ${S.frameIdx<4 ? `<button class="ctrl-btn play" onclick="window._g8mNextFrame4b()">📸 التقطي الصورة التالية</button>` : (!S.revealed ? `<button class="ctrl-btn play" onclick="window._g8mReveal4b()">🤔 بسرعة ثابتة أم متزايدة؟</button>` : `
      <div style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:10px">
        ${S.which==='owl' ? 'الصور متساوية التباعد ⟶ البومة تطير <strong style="color:#D4901A">بسرعة ثابتة</strong>.' : 'الصور متزايدة التباعد ⟶ الكرة تتدحرج <strong style="color:#D4901A">بسرعة متزايدة (تتسارع)</strong> وهي تنحدر.'}
      </div>
      <button class="ctrl-btn reset" onclick="window._g8mRestart4b()">↺ جرّبي الآخر</button>`)}
    `;
  }
  controls(renderControls());
  window._g8mPick4b = function(k){ _g8pPlayClick(); S.which=k; S.frameIdx=0; S.revealed=false; controls(renderControls()); };
  window._g8mNextFrame4b = function(){ _g8pPlayClick(); S.frameIdx=Math.min(4,S.frameIdx+1); controls(renderControls()); };
  window._g8mReveal4b = function(){ _g8pPlayClick(); S.revealed=true; controls(renderControls()); };
  window._g8mRestart4b = function(){ S.frameIdx=0; S.revealed=false; S.which = S.which==='owl'?'ball':'owl'; controls(renderControls()); };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null; cv.onclick=null;

  function draw(){
    if(currentSim!=='g8mot6n4' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g8cBg(dark); c.fillRect(0,0,w,h);

    const gaps = S.which==='owl' ? OWL_GAPS : BALL_GAPS;
    let cum=0; const xs=gaps.map(g=>{cum+=g; return cum;});
    const maxCum = xs[xs.length-1];
    const trackX0=w*0.12, trackW=w*0.76;
    const laneY = S.which==='owl' ? h*0.4 : h*0.62;

    if(S.which==='ball'){
      // منحدر
      c.save(); c.strokeStyle=g8cMut(dark); c.lineWidth=3;
      c.beginPath(); c.moveTo(trackX0-w*0.04,h*0.28); c.lineTo(trackX0+trackW+w*0.02,laneY+h*0.03); c.stroke(); c.restore();
    } else {
      c.save(); c.strokeStyle=dark?'#3A2A1A':'#E5DDD0'; c.lineWidth=1.5; c.setLineDash([4,4]);
      c.beginPath(); c.moveTo(trackX0,laneY); c.lineTo(trackX0+trackW,laneY); c.stroke(); c.restore();
    }

    for(let i=0;i<=S.frameIdx;i++){
      const fx = trackX0 + (xs[i]/Math.max(0.1,maxCum))*trackW;
      const fy = S.which==='ball' ? (h*0.28 + (fx-(trackX0-w*0.04))/(trackW+w*0.06)*(laneY+h*0.03-h*0.28)) : laneY;
      c.save(); c.globalAlpha = i===S.frameIdx ? 1 : 0.35;
      if(S.which==='owl'){
        c.translate(fx,fy); c.fillStyle=dark?'#D4B896':'#7C5A3A';
        c.beginPath(); c.ellipse(0,0,w*0.028,w*0.02,0,0,Math.PI*2); c.fill();
        c.beginPath(); c.moveTo(-w*0.026,0); c.lineTo(-w*0.055,-w*0.012); c.lineTo(-w*0.026,w*0.01); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(w*0.026,0); c.lineTo(w*0.055,-w*0.012); c.lineTo(w*0.026,w*0.01); c.closePath(); c.fill();
      } else {
        c.translate(fx,fy); c.fillStyle='#EF4444';
        c.beginPath(); c.arc(0,0,w*0.018,0,Math.PI*2); c.fill();
        c.strokeStyle='#991B1B'; c.lineWidth=1.2; c.stroke();
      }
      c.restore();
    }

    c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
    c.fillText(S.which==='owl' ? '🦉 صور متتالية من النابض الزمني (بومة تطير)' : '⚽ صور متتالية من النابض الزمني (كرة على منحدر)', w*0.5, h*0.12);
    c.fillText(`الصورة ${S.frameIdx+1} من 5`, w*0.5, h*0.85);

    g8lHeader(c,w,h,dark,'نشاط ٤-٦ · سرعة ثابتة أم متزايدة؟');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   نشاط ٥-٦ · تطبيقات على الرسوم البيانية للمسافة/الزمن (ص١٠٦-١٠٧)
   ══════════════════════════════════════════════════════════ */

/* تاب ١: سيارتان بسرعتين مختلفتين */
function simG8Mot6N5a(){
  cancelAnimationFrame(animFrame);
  const RED={speed:15,color:'#EF4444',label:'السيارة الحمراء'}, BLUE={speed:10,color:'#3B82F6',label:'السيارة الزرقاء'};
  const DUR=4;
  simState = { stage:'idle', animT:0, ptsRed:[{t:0,d:0}], ptsBlue:[{t:0,d:0}], lastSec:-1, showQ:false, qSel:null };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const QANS=0;

  function renderControls(){
    if(S.stage==='idle'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🔴🔵 سيارتان بسرعتين مختلفتين</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:12px">تتحرّك السيارتان في الوقت نفسه. راقبي كيف يُرسم خطّ كلّ سيارة في الرسم البياني نفسه.</div>
        <button class="ctrl-btn play" onclick="window._g8mRun5a()">▶ ابدئي الحركتين</button>`;
    }
    if(S.stage==='running'){
      return `<div class="ctrl-section"><div class="ctrl-label">⏱️ الزمن: ${Math.min(DUR,S.animT).toFixed(1)} s</div></div>`;
    }
    return `
      <div class="ctrl-section"><div class="ctrl-label">📊 قارني الخطّين</div></div>
      ${!S.showQ ? `<button class="ctrl-btn play" onclick="window._g8mShowQ5a()">🤔 أيّ السيارتين أسرع؟</button>` : `
      <div style="font-size:13px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:10px">أيّ السيارتين كانت أسرع؟ وكيف عرفتِ ذلك من الرسم البياني؟</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <button onclick="window._g8mQAns5a(0)" style="padding:10px;border-radius:9px;border:2px solid ${S.qSel===null?'#ddd':(0===QANS?'#22C55E':(0===S.qSel?'#DC2626':'#ddd'))};background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:12.5px">🔴 الحمراء أسرع</button>
        <button onclick="window._g8mQAns5a(1)" style="padding:10px;border-radius:9px;border:2px solid ${S.qSel===null?'#ddd':(1===QANS?'#22C55E':(1===S.qSel?'#DC2626':'#ddd'))};background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:12.5px">🔵 الزرقاء أسرع</button>
      </div>
      ${S.qSel!==null?`<div style="margin-top:10px;padding:12px;background:${S.qSel===QANS?'rgba(74,222,128,0.15)':'rgba(239,68,68,0.1)'};border-radius:9px;font-size:12.5px;line-height:1.8;color:var(--text-secondary)">${S.qSel===QANS?'✅ صحيح!':'💡'} السيارة الحمراء تقطع مسافة أكبر في الزمن نفسه (15m/s مقابل 10m/s)، لذلك يظهر خطّها في الرسم البياني أكثر انحدارًا نحو الأعلى.</div>`:''}
      `}
    `;
  }
  controls(renderControls());
  window._g8mRun5a = function(){ _g8pPlayClick(); S.stage='running'; S.animT=0; S.ptsRed=[{t:0,d:0}]; S.ptsBlue=[{t:0,d:0}]; S.lastSec=0; };
  window._g8mShowQ5a = function(){ _g8pPlayClick(); S.showQ=true; controls(renderControls()); };
  window._g8mQAns5a = function(i){ _g8pPlayClick(); S.qSel=i; if(i===QANS) _g8pPlayDrop(); controls(renderControls()); };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null; cv.onclick=null;

  function draw(){
    if(currentSim!=='g8mot6n5' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g8cBg(dark); c.fillRect(0,0,w,h);

    let t=0;
    if(S.stage==='running'){
      S.animT += 0.016; t=Math.min(DUR,S.animT);
      const sec=Math.floor(t*2)/2; // كل نصف ثانية
      if(sec>S.lastSec){ S.lastSec=sec; S.ptsRed.push({t:sec,d:sec*RED.speed}); S.ptsBlue.push({t:sec,d:sec*BLUE.speed}); }
      if(t>=DUR){ S.stage='done'; controls(renderControls()); }
    } else if(S.stage==='done') t=DUR;

    const trackX0=w*0.06, trackW=w*0.36, maxM=RED.speed*DUR;
    const laneYr=h*0.2, laneYb=h*0.32, pxPerM=trackW/maxM;
    [ [laneYr,RED],[laneYb,BLUE] ].forEach(([ly,car])=>{
      c.save(); c.strokeStyle=dark?'#3A2A1A':'#E5DDD0'; c.lineWidth=2;
      c.beginPath(); c.moveTo(trackX0,ly+w*0.03); c.lineTo(trackX0+trackW,ly+w*0.03); c.stroke(); c.restore();
      const cx=trackX0+(car.speed*t)*pxPerM;
      g8mCar(c, cx, ly, w*0.06, car.color, dark, true);
    });
    c.fillStyle=RED.color; c.font=`bold ${Math.round(h*0.014)}px Tajawal`; c.textAlign='right';
    c.fillText(RED.label, trackX0-w*0.01, laneYr);
    c.fillStyle=BLUE.color; c.fillText(BLUE.label, trackX0-w*0.01, laneYb);

    const gx0=w*0.5, gy0=h*0.88, gw=w*0.46, gh=h*0.65;
    g8mGraphAxes(c,gx0,gy0,gw,gh,DUR,maxM,1,10,dark);
    c.fillStyle=g8cMut(dark); c.font=`bold ${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
    c.fillText('الزمن (s)', gx0+gw*0.5, gy0+gh*0.11);

    function drawLine(pts,color){
      if(pts.length<2) return;
      c.save(); c.strokeStyle=color; c.lineWidth=Math.max(2.5,w*0.006); c.lineJoin='round';
      c.beginPath();
      pts.forEach((p,i)=>{ const pt=g8mGPoint(gx0,gy0,gw,gh,DUR,maxM,p.t,p.d); if(i===0)c.moveTo(pt.x,pt.y); else c.lineTo(pt.x,pt.y); });
      c.stroke(); c.restore();
      const last=pts[pts.length-1], pt=g8mGPoint(gx0,gy0,gw,gh,DUR,maxM,last.t,last.d);
      c.fillStyle=color; c.beginPath(); c.arc(pt.x,pt.y,4,0,Math.PI*2); c.fill();
    }
    drawLine(S.ptsRed, RED.color);
    drawLine(S.ptsBlue, BLUE.color);
    if(S.ptsRed.length>1){
      const lp = g8mGPoint(gx0,gy0,gw,gh,DUR,maxM,S.ptsRed[S.ptsRed.length-1].t,S.ptsRed[S.ptsRed.length-1].d);
      c.fillStyle=RED.color; c.font=`bold ${Math.round(h*0.013)}px Tajawal`; c.textAlign='left'; c.fillText('حمراء', lp.x+w*0.01, lp.y);
      const lp2 = g8mGPoint(gx0,gy0,gw,gh,DUR,maxM,S.ptsBlue[S.ptsBlue.length-1].t,S.ptsBlue[S.ptsBlue.length-1].d);
      c.fillStyle=BLUE.color; c.fillText('زرقاء', lp2.x+w*0.01, lp2.y);
    }

    g8lHeader(c,w,h,dark,'نشاط ٥-٦ · سيارتان بسرعتين مختلفتين');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* تاب ٢: رحلة الدرّاجة الهوائية (حركة غير منتظمة — بيانات الكتاب) */
function simG8Mot6N5b(){
  cancelAnimationFrame(animFrame);
  // بيانات الكتاب بالضبط (ص١٠٦): البداية، نهاية أ، ب، ج، د، هـ
  const STAGES = [
    {label:'البداية', t:0, d:0, desc:''},
    {label:'أ', t:50, d:500, desc:'🚵 اندفاع بالدفع (سرعة متوسطة)'},
    {label:'ب', t:150, d:900, desc:'⛰️ صعود تلّ شديد الانحدار (يبطئ)'},
    {label:'ج', t:200, d:900, desc:'💤 توقّف واستراحة (بدون حركة)'},
    {label:'د', t:250, d:1000, desc:'🚴 بداية النزول (سرعة منخفضة)'},
    {label:'هـ', t:300, d:2000, desc:'⚡ اندفاع سريع في النزول'},
  ];
  simState = { revealed:0, showQ:false, qSel:null };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const QOPTS=['نعم، كانت سرعته ثابتة طوال الرحلة','لا، تغيّرت سرعته عدّة مرّات أثناء الرحلة'];
  const QANS=1;

  function renderControls(){
    return `
      <div class="ctrl-section"><div class="ctrl-label">🚵 رحلة الدرّاجة الهوائية</div></div>
      <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:10px">اضغطي لعرض كلّ مرحلة من رحلة محمد بالتتابع، وراقبي شكل الرسم البياني.</div>
      ${S.revealed<STAGES.length-1 ? `<button class="ctrl-btn play" onclick="window._g8mNextStage5b()">➕ المرحلة التالية</button>` : (!S.showQ ? `<button class="ctrl-btn play" onclick="window._g8mShowQ5b2()">🤔 هل كانت سرعته ثابتة؟</button>` : `
      <div style="font-size:13px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:10px">هل تحرّك محمد بالسرعة نفسها طوال الرحلة؟</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${QOPTS.map((o,i)=>`<button onclick="window._g8mQAns5b2(${i})" style="padding:10px;border-radius:9px;border:2px solid ${S.qSel===null?'#ddd':(i===QANS?'#22C55E':(i===S.qSel?'#DC2626':'#ddd'))};background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:12.5px">${o}</button>`).join('')}
      </div>
      ${S.qSel!==null?`<div style="margin-top:10px;padding:12px;background:${S.qSel===QANS?'rgba(74,222,128,0.15)':'rgba(239,68,68,0.1)'};border-radius:9px;font-size:12.5px;line-height:1.8;color:var(--text-secondary)">${S.qSel===QANS?'✅ صحيح!':'💡'} نعرف ذلك من الرسم البياني لأنّ ميل الخط تغيّر عدّة مرّات: قلّ عند صعود التلّ، أصبح صفرًا أثناء الاستراحة (خط أفقي)، ثمّ زاد كثيرًا عند الاندفاع في النزول.</div>
      <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g8mRestart5b()">↺ أعيدي الرحلة</button>`:''}
      `)}
    `;
  }
  controls(renderControls());
  window._g8mNextStage5b = function(){ _g8pPlayClick(); S.revealed=Math.min(STAGES.length-1,S.revealed+1); controls(renderControls()); };
  window._g8mShowQ5b2 = function(){ _g8pPlayClick(); S.showQ=true; controls(renderControls()); };
  window._g8mQAns5b2 = function(i){ _g8pPlayClick(); S.qSel=i; if(i===QANS) _g8pPlayDrop(); controls(renderControls()); };
  window._g8mRestart5b = function(){ S.revealed=0; S.showQ=false; S.qSel=null; controls(renderControls()); };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null; cv.onclick=null;

  function draw(){
    if(currentSim!=='g8mot6n5' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g8cBg(dark); c.fillRect(0,0,w,h);

    const gx0=w*0.13, gy0=h*0.86, gw=w*0.76, gh=h*0.62, TMAX=300, DMAX=2000;
    g8mGraphAxes(c,gx0,gy0,gw,gh,TMAX,DMAX,50,400,dark);
    c.fillStyle=g8cMut(dark); c.font=`bold ${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
    c.fillText('الزمن (s)', gx0+gw*0.5, gy0+gh*0.1);
    c.save(); c.translate(gx0-gw*0.09,gy0-gh*0.5); c.rotate(-Math.PI/2); c.textAlign='center'; c.fillText('المسافة (m)',0,0); c.restore();

    const pts = STAGES.slice(0,S.revealed+1);
    if(pts.length>1){
      c.save(); c.strokeStyle='#D4901A'; c.lineWidth=Math.max(2.5,w*0.006); c.lineJoin='round';
      c.beginPath();
      pts.forEach((p,i)=>{ const pt=g8mGPoint(gx0,gy0,gw,gh,TMAX,DMAX,p.t,p.d); if(i===0)c.moveTo(pt.x,pt.y); else c.lineTo(pt.x,pt.y); });
      c.stroke(); c.restore();
    }
    pts.forEach((p,i)=>{
      const pt=g8mGPoint(gx0,gy0,gw,gh,TMAX,DMAX,p.t,p.d);
      c.save(); c.fillStyle='#D4901A'; c.beginPath(); c.arc(pt.x,pt.y,4.5,0,Math.PI*2); c.fill();
      c.strokeStyle=dark?'#241708':'#fff'; c.lineWidth=1.5; c.stroke(); c.restore();
      c.fillStyle=g8cTxt(dark); c.font=`bold ${Math.round(h*0.013)}px Tajawal`; c.textAlign='center';
      c.fillText(p.label, pt.x, pt.y-h*0.025);
    });

    if(S.revealed>0){
      const cur = STAGES[S.revealed];
      c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
      c.fillText(cur.desc, w*0.5, h*0.1);
    }

    g8lHeader(c,w,h,dark,'نشاط ٥-٦ · رحلة الدرّاجة الهوائية');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   نشاط ٦-٦ · عزم دوران القوة (ص١٠٨-١٠٩)
   ══════════════════════════════════════════════════════════ */

/* تاب ١: مفتاح البراغي */
function simG8Mot6N6a(){
  cancelAnimationFrame(animFrame);
  const GRIPS = { near:{label:'قريبًا من البرغي', inc:15, dist:0.35}, far:{label:'بعيدًا عند طرف المفتاح', inc:45, dist:0.9} };
  simState = { grip:null, angle:0, pushes:0, result:{}, revealed:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    const bothTried = S.result.near!==undefined && S.result.far!==undefined;
    if(!S.grip){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🔧 مفتاح البراغي</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:12px">اختاري أين تمسكين المفتاح، ثمّ ادفعي لشدّ البرغي. عدّي كم ضغطة تحتاجين لإتمام الشدّ.</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${Object.keys(GRIPS).map(k=>`<button onclick="window._g8mGrip6a('${k}')" style="padding:11px;border-radius:9px;border:2px solid ${S.result[k]!==undefined?'#22C55E':'#ddd'};background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">✋ ${GRIPS[k].label} ${S.result[k]!==undefined?'✅ ('+S.result[k]+' ضغطات)':''}</button>`).join('')}
        </div>
        ${bothTried && !S.revealed ? `<button class="ctrl-btn play" style="margin-top:12px" onclick="window._g8mReveal6a()">🤔 لماذا اختلف عدد الضغطات؟</button>` : ''}
        ${S.revealed ? `<div style="margin-top:12px;font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px">القوة الواقعة <strong style="color:#D4901A">بعيدًا عن المحور</strong> (طرف المفتاح) تُنتج <strong style="color:#D4901A">عزم دوران Turning Effect أكبر</strong>، لذلك احتجتِ ضغطات أقلّ لإتمام المهمّة نفسها.</div>` : ''}
      `;
    }
    return `
      <div class="ctrl-section"><div class="ctrl-label">✋ ${GRIPS[S.grip].label}</div></div>
      <div style="text-align:center;background:var(--bg-card2);border-radius:10px;padding:12px;margin-bottom:12px;font-size:13px;font-weight:700">عدد الضغطات: ${S.pushes}</div>
      ${S.angle<180 ? `<button class="ctrl-btn play" onclick="window._g8mPush6a()">👊 ادفعي المفتاح</button>` : `<div style="text-align:center;font-weight:800;color:#22C55E;margin-bottom:10px">✅ اكتمل الشدّ!</div><button class="ctrl-btn reset" onclick="window._g8mBack6a()">↺ جرّبي قبضة أخرى</button>`}
    `;
  }
  controls(renderControls());
  window._g8mGrip6a = function(k){ _g8pPlayClick(); S.grip=k; S.angle=0; S.pushes=0; controls(renderControls()); };
  window._g8mPush6a = function(){
    _g8pPlayClick(); S.pushes++; S.angle=Math.min(180,S.angle+GRIPS[S.grip].inc);
    if(S.angle>=180){ S.result[S.grip]=S.pushes; _g8pPlayDrop(); }
    controls(renderControls());
  };
  window._g8mBack6a = function(){ S.grip=null; controls(renderControls()); };
  window._g8mReveal6a = function(){ _g8pPlayClick(); S.revealed=true; controls(renderControls()); };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null; cv.onclick=null;

  function draw(){
    if(currentSim!=='g8mot6n6' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g8cBg(dark); c.fillRect(0,0,w,h);

    const pivotX=w*0.5, pivotY=h*0.52, B=w*0.32;
    // البرغي (رأس سداسي)
    c.save(); c.translate(pivotX,pivotY);
    c.fillStyle='#9CA3AF'; c.strokeStyle='#4B5563'; c.lineWidth=2;
    c.beginPath();
    for(let i=0;i<6;i++){ const a=i*Math.PI/3; const px=Math.cos(a)*B*0.07, py=Math.sin(a)*B*0.07; if(i===0)c.moveTo(px,py); else c.lineTo(px,py); }
    c.closePath(); c.fill(); c.stroke();
    c.restore();

    // المفتاح (يدور بمقدار S.angle)
    const dist = S.grip ? GRIPS[S.grip].dist : 0.6;
    c.save(); c.translate(pivotX,pivotY); c.rotate((S.angle*Math.PI/180) - Math.PI*0.15);
    c.strokeStyle='#6B7280'; c.lineWidth=Math.max(6,B*0.09); c.lineCap='round';
    c.beginPath(); c.moveTo(0,0); c.lineTo(B*0.85,0); c.stroke();
    c.fillStyle='#9CA3AF'; c.beginPath(); c.arc(B*0.08,0,B*0.11,0,Math.PI*2); c.fill();
    c.strokeStyle='#4B5563'; c.lineWidth=1.5; c.stroke();
    // يد المستخدم عند نقطة القبض
    const gripX = B*dist;
    c.save(); c.translate(gripX,0); c.fillStyle=dark?'#D4B896':'#E8B98A';
    c.beginPath(); c.ellipse(0,0,B*0.07,B*0.1,0,0,Math.PI*2); c.fill();
    c.strokeStyle='#8A5A3A'; c.lineWidth=1.2; c.stroke();
    c.restore();
    c.restore();

    if(S.grip){
      c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
      c.fillText(`المسافة عن المحور: ${dist===0.35?'صغيرة':'كبيرة'}`, w*0.5, h*0.85);
    } else {
      c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
      c.fillText('اختاري نقطة القبض من القائمة', w*0.5, h*0.85);
    }

    g8lHeader(c,w,h,dark,'نشاط ٦-٦ · مفتاح البراغي');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* تاب ٢: فتح الباب */
function simG8Mot6N6b(){
  cancelAnimationFrame(animFrame);
  const POINTS = { near:{label:'قريبًا من المفصلات', open:15}, mid:{label:'منتصف الباب', open:45}, far:{label:'عند المقبض (بعيدًا عن المفصلات)', open:90} };
  simState = { point:null, angle:0, animT:0, tried:{}, revealed:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    const triedCount = Object.keys(S.tried).length;
    return `
      <div class="ctrl-section"><div class="ctrl-label">🚪 فتح الباب</div></div>
      <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:12px">ادفعي الباب بالقوة نفسها من نقاط مختلفة، وراقبي مقدار انفتاحه.</div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px">
        ${Object.keys(POINTS).map(k=>`<button onclick="window._g8mDoor6b('${k}')" style="padding:11px;border-radius:9px;border:2px solid ${S.tried[k]?'#22C55E':'#ddd'};background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">👉 ${POINTS[k].label} ${S.tried[k]?'✅ ('+S.tried[k]+'°)':''}</button>`).join('')}
      </div>
      ${triedCount>=2 && !S.revealed ? `<button class="ctrl-btn play" onclick="window._g8mRevealDoor()">🤔 لماذا اختلف مقدار الفتح؟</button>` : ''}
      ${S.revealed ? `<div style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px">الدفع <strong style="color:#D4901A">بعيدًا عن المحور</strong> (المفصلات) بالقوة نفسها يُنتج عزم دوران أكبر، لذلك يفتح الباب بسهولة أكبر ويدور بزاوية أوسع.</div>` : ''}
    `;
  }
  controls(renderControls());
  window._g8mDoor6b = function(k){ _g8pPlayClick(); S.point=k; S.animT=0; S.angle=0; S._target=POINTS[k].open; };
  window._g8mRevealDoor = function(){ _g8pPlayClick(); S.revealed=true; controls(renderControls()); };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null; cv.onclick=null;

  function draw(){
    if(currentSim!=='g8mot6n6' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g8cBg(dark); c.fillRect(0,0,w,h);

    const hingeX=w*0.28, hingeY=h*0.2, doorH=h*0.6, doorW=w*0.32;

    if(S.point && S.angle<S._target){
      S.angle = Math.min(S._target, S.angle + 2.2);
      if(S.angle>=S._target && !S.tried[S.point]){ S.tried[S.point]=S._target; controls(renderControls()); }
    }

    // إطار الباب
    c.save(); c.strokeStyle=g8cMut(dark); c.lineWidth=Math.max(4,w*0.012);
    c.beginPath(); c.moveTo(hingeX,hingeY); c.lineTo(hingeX,hingeY+doorH); c.stroke(); c.restore();

    // الباب (يدور حول المفصلات)
    c.save(); c.translate(hingeX,hingeY);
    c.rotate((S.angle||0)*Math.PI/180);
    const dg=c.createLinearGradient(0,0,doorW,0); dg.addColorStop(0,dark?'#7C5A3A':'#D9A566'); dg.addColorStop(1,dark?'#5A3F26':'#B8834A');
    c.fillStyle=dg; c.strokeStyle=dark?'#3A2A1A':'#8A5A2E'; c.lineWidth=2;
    c.beginPath(); c.roundRect(0,0,doorW,doorH,4); c.fill(); c.stroke();
    // مقبض
    c.fillStyle='#D4AF37'; c.beginPath(); c.arc(doorW*0.88, doorH*0.5, w*0.014,0,Math.PI*2); c.fill();
    c.restore();

    // نقطة الدفع (تظهر عند الاختيار قبل انتهاء الدوران)
    if(S.point){
      const pf = {near:0.15, mid:0.5, far:0.88}[S.point];
      const localX = doorW*pf;
      const ang=(S.angle||0)*Math.PI/180;
      const px = hingeX + localX*Math.cos(ang), py = hingeY + localX*Math.sin(ang);
      c.save(); c.fillStyle='#EF4444'; c.beginPath(); c.arc(px,py,w*0.012,0,Math.PI*2); c.fill(); c.restore();
    }

    // المفصلات
    c.save(); c.fillStyle=g8cMut(dark);
    [0.06,0.5,0.94].forEach(f=>{ c.beginPath(); c.arc(hingeX,hingeY+doorH*f,w*0.008,0,Math.PI*2); c.fill(); });
    c.restore();
    c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.013)}px Tajawal`; c.textAlign='center';
    c.fillText('المحور (المفصلات)', hingeX, hingeY-h*0.03);

    if(S.tried[S.point]){
      c.fillStyle=g8cAccent(dark); c.font=`bold ${Math.round(h*0.018)}px Tajawal`; c.textAlign='center';
      c.fillText(`فتح الباب بزاوية ${S.tried[S.point]}°`, w*0.68, h*0.85);
    }

    g8lHeader(c,w,h,dark,'نشاط ٦-٦ · فتح الباب');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   نشاط ٧-٦ · مبدأ عزم القوة (ص١١٠-١١١)
   ══════════════════════════════════════════════════════════ */

/* تاب ١: ميزان التفاح (مسافتان متساويتان — الوزن الأكبر يميل) */
function simG8Mot6N7a(){
  cancelAnimationFrame(animFrame);
  const APPLE_N = 3;
  simState = { leftN:0, revealed:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    return `
      <div class="ctrl-section"><div class="ctrl-label">⚖️ ميزان التفاح</div></div>
      <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:10px">التفاحة في الكفّة اليمنى وزنها ${APPLE_N} N. أضيفي أثقالًا للكفّة اليسرى ولاحظي أيّ جانب يميل (المسافتان عن المحور متساويتان).</div>
      <div style="text-align:center;background:var(--bg-card2);border-radius:10px;padding:10px;margin-bottom:10px;font-size:13px;font-weight:700">وزن الكفّة اليسرى: ${S.leftN} N</div>
      <div style="display:flex;gap:8px;margin-bottom:10px">
        <button class="ctrl-btn" onclick="window._g8mAddW7a(1)">+1 N</button>
        <button class="ctrl-btn reset" onclick="window._g8mResetW7a()">↺ صفر</button>
      </div>
      ${S.leftN===APPLE_N ? `<div style="text-align:center;font-weight:800;color:#22C55E;margin-bottom:10px">⚖️ الميزان متوازن!</div>` : ''}
      ${!S.revealed ? `<button class="ctrl-btn play" onclick="window._g8mReveal7a()">🤔 لماذا يميل الميزان؟</button>` : `
      <div style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px">عندما تكون المسافتان عن المحور متساويتين، فإنّ <strong style="color:#D4901A">الجانب الأثقل</strong> يُنتج عزم دوران أكبر، فيميل إلى أسفل.</div>`}
    `;
  }
  controls(renderControls());
  window._g8mAddW7a = function(v){ _g8pPlayClick(); S.leftN=Math.min(8,S.leftN+v); controls(renderControls()); };
  window._g8mResetW7a = function(){ _g8pPlayClick(); S.leftN=0; controls(renderControls()); };
  window._g8mReveal7a = function(){ _g8pPlayClick(); S.revealed=true; controls(renderControls()); };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null; cv.onclick=null;

  function draw(){
    if(currentSim!=='g8mot6n7' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g8cBg(dark); c.fillRect(0,0,w,h);

    const pivotX=w*0.5, pivotY=h*0.32, armLen=w*0.28;
    const diff = S.leftN-APPLE_N;
    const tilt = Math.max(-0.25,Math.min(0.25, -diff*0.05));

    // القاعدة
    c.save(); c.strokeStyle=g8cMut(dark); c.lineWidth=Math.max(5,w*0.014);
    c.beginPath(); c.moveTo(pivotX,pivotY+h*0.02); c.lineTo(pivotX,pivotY+h*0.35); c.stroke(); c.restore();
    c.save(); c.fillStyle=g8cMut(dark);
    c.beginPath(); c.moveTo(pivotX-w*0.03,pivotY+h*0.02); c.lineTo(pivotX+w*0.03,pivotY+h*0.02); c.lineTo(pivotX,pivotY-h*0.015); c.closePath(); c.fill(); c.restore();

    // العارضة
    c.save(); c.translate(pivotX,pivotY); c.rotate(tilt);
    c.strokeStyle='#8A5A2E'; c.lineWidth=Math.max(6,w*0.016); c.lineCap='round';
    c.beginPath(); c.moveTo(-armLen,0); c.lineTo(armLen,0); c.stroke();
    // خيوط الكفتين
    [-armLen,armLen].forEach(x=>{
      c.strokeStyle=g8cMut(dark); c.lineWidth=1.4;
      c.beginPath(); c.moveTo(x,0); c.lineTo(x,h*0.1); c.stroke();
    });
    c.restore();

    function pan(sideX, weight, isApple){
      const ang=tilt, x=pivotX+Math.cos(ang)*sideX*(sideX>0?1:1), y0=pivotY+Math.sin(ang)*sideX;
      const px = pivotX + sideX*Math.cos(ang), py = pivotY + sideX*Math.sin(ang) + h*0.1;
      c.save(); c.strokeStyle=g8cMut(dark); c.lineWidth=2; c.fillStyle=dark?'#2A2A1A':'#F0E6D2';
      c.beginPath(); c.ellipse(px,py,w*0.06,w*0.018,0,0,Math.PI*2); c.fill(); c.stroke();
      if(isApple){
        c.fillStyle='#DC2626'; c.beginPath(); c.arc(px,py-h*0.025,w*0.022,0,Math.PI*2); c.fill();
        c.fillStyle='#16A34A'; c.beginPath(); c.ellipse(px+w*0.006,py-h*0.045,w*0.008,w*0.014,0.4,0,Math.PI*2); c.fill();
        c.fillStyle=g8cMut(dark); c.font=`bold ${Math.round(h*0.013)}px Tajawal`; c.textAlign='center';
        c.fillText(`${APPLE_N} N`, px, py+h*0.045);
      } else {
        for(let i=0;i<Math.min(weight,8);i++){
          c.fillStyle='#9CA3AF'; c.strokeStyle='#4B5563'; c.lineWidth=1;
          c.beginPath(); c.rect(px-w*0.02,py-h*0.02-i*h*0.018,w*0.04,h*0.016); c.fill(); c.stroke();
        }
        c.fillStyle=g8cMut(dark); c.font=`bold ${Math.round(h*0.013)}px Tajawal`; c.textAlign='center';
        c.fillText(`${weight} N`, px, py+h*0.045);
      }
      c.restore();
    }
    pan(-armLen, S.leftN, false);
    pan(armLen, APPLE_N, true);

    g8lHeader(c,w,h,dark,'نشاط ٧-٦ · ميزان التفاح');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* تاب ٢: مبدأ العزم على الأرجوحة (وزن ومسافة متغيّران) */
function simG8Mot6N7b(){
  cancelAnimationFrame(animFrame);
  simState = { leftN:20, leftD:1.0, rightN:20, rightD:1.0 };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    const mL = S.leftN*S.leftD, mR = S.rightN*S.rightD;
    const balanced = Math.abs(mL-mR) < 0.5;
    return `
      <div class="ctrl-section"><div class="ctrl-label">🎢 مبدأ عزم القوة</div></div>
      <div style="font-size:12px;color:var(--text-secondary);margin-bottom:10px">غيّري الوزن والمسافة على كلّ جانب لتوازني الأرجوحة. العزم = القوة × المسافة من المحور.</div>
      <div style="font-weight:800;font-size:12.5px;margin-bottom:4px;color:#EF4444">الجانب الأيسر</div>
      <div style="display:flex;justify-content:space-between;font-size:11.5px;margin-bottom:2px"><span>الوزن</span><span id="g8mLN">${S.leftN} N</span></div>
      <input type="range" min="5" max="50" step="5" value="${S.leftN}" oninput="simState.leftN=+this.value; window._g8mSync7b()" style="width:100%;margin-bottom:6px">
      <div style="display:flex;justify-content:space-between;font-size:11.5px;margin-bottom:2px"><span>المسافة عن المحور</span><span id="g8mLD">${S.leftD.toFixed(1)} m</span></div>
      <input type="range" min="0.2" max="2" step="0.1" value="${S.leftD}" oninput="simState.leftD=+this.value; window._g8mSync7b()" style="width:100%;margin-bottom:12px">

      <div style="font-weight:800;font-size:12.5px;margin-bottom:4px;color:#3B82F6">الجانب الأيمن</div>
      <div style="display:flex;justify-content:space-between;font-size:11.5px;margin-bottom:2px"><span>الوزن</span><span id="g8mRN">${S.rightN} N</span></div>
      <input type="range" min="5" max="50" step="5" value="${S.rightN}" oninput="simState.rightN=+this.value; window._g8mSync7b()" style="width:100%;margin-bottom:6px">
      <div style="display:flex;justify-content:space-between;font-size:11.5px;margin-bottom:2px"><span>المسافة عن المحور</span><span id="g8mRD">${S.rightD.toFixed(1)} m</span></div>
      <input type="range" min="0.2" max="2" step="0.1" value="${S.rightD}" oninput="simState.rightD=+this.value; window._g8mSync7b()" style="width:100%;margin-bottom:12px">

      <div style="background:var(--bg-card2);border-radius:10px;padding:12px;font-size:12.5px;line-height:1.8">
        <div style="color:#EF4444;font-weight:700" id="g8mLMom">العزم الأيسر = ${S.leftN} × ${S.leftD.toFixed(1)} = ${mL.toFixed(1)} N·m</div>
        <div style="color:#3B82F6;font-weight:700" id="g8mRMom">العزم الأيمن = ${S.rightN} × ${S.rightD.toFixed(1)} = ${mR.toFixed(1)} N·m</div>
      </div>
      <div id="g8mBalMsg" style="text-align:center;margin-top:10px;font-weight:800;color:#22C55E">${balanced ? '⚖️ متوازنة! العزمان متساويان.' : ''}</div>
    `;
  }
  controls(renderControls());
  window._g8mSync7b = function(){
    const mL = S.leftN*S.leftD, mR = S.rightN*S.rightD;
    const balanced = Math.abs(mL-mR) < 0.5;
    const $ = id => document.getElementById(id);
    if($('g8mLN')) $('g8mLN').textContent = S.leftN+' N';
    if($('g8mLD')) $('g8mLD').textContent = S.leftD.toFixed(1)+' m';
    if($('g8mRN')) $('g8mRN').textContent = S.rightN+' N';
    if($('g8mRD')) $('g8mRD').textContent = S.rightD.toFixed(1)+' m';
    if($('g8mLMom')) $('g8mLMom').textContent = `العزم الأيسر = ${S.leftN} × ${S.leftD.toFixed(1)} = ${mL.toFixed(1)} N·m`;
    if($('g8mRMom')) $('g8mRMom').textContent = `العزم الأيمن = ${S.rightN} × ${S.rightD.toFixed(1)} = ${mR.toFixed(1)} N·m`;
    if($('g8mBalMsg')) $('g8mBalMsg').textContent = balanced ? '⚖️ متوازنة! العزمان متساويان.' : '';
  };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null; cv.onclick=null;

  function draw(){
    if(currentSim!=='g8mot6n7' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g8cBg(dark); c.fillRect(0,0,w,h);

    const pivotX=w*0.5, pivotY=h*0.42, maxArm=w*0.36;
    const mL=S.leftN*S.leftD, mR=S.rightN*S.rightD;
    const diff = mL-mR;
    const tilt = Math.max(-0.22,Math.min(0.22, -diff*0.004));

    c.save(); c.fillStyle=g8cMut(dark);
    c.beginPath(); c.moveTo(pivotX-w*0.05,pivotY+h*0.08); c.lineTo(pivotX+w*0.05,pivotY+h*0.08); c.lineTo(pivotX,pivotY-h*0.02); c.closePath(); c.fill(); c.restore();

    c.save(); c.translate(pivotX,pivotY); c.rotate(tilt);
    c.strokeStyle='#8A5A2E'; c.lineWidth=Math.max(7,w*0.018); c.lineCap='round';
    c.beginPath(); c.moveTo(-maxArm,0); c.lineTo(maxArm,0); c.stroke();

    function weightAt(sideSign, dNorm, N, color){
      const x = sideSign*maxArm*dNorm;
      c.save(); c.translate(x,0);
      c.fillStyle=color; c.strokeStyle=g8mShade(color,0.6); c.lineWidth=1.5;
      const size = w*0.018 + N*w*0.0006;
      c.beginPath(); c.roundRect(-size/2,h*0.01,size,size,3); c.fill(); c.stroke();
      c.restore();
    }
    weightAt(-1, Math.min(1,S.leftD/2), S.leftN, '#EF4444');
    weightAt(1, Math.min(1,S.rightD/2), S.rightN, '#3B82F6');
    c.restore();

    g8lHeader(c,w,h,dark,'نشاط ٧-٦ · مبدأ عزم القوة');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   نشاط ٨-٦ · حساب عزم القوة (ص١١٢-١١٣)
   ══════════════════════════════════════════════════════════ */

/* تاب ١: احسبي العزم / المسافة / القوة */
function simG8Mot6N8a(){
  cancelAnimationFrame(animFrame);
  simState = { mode:'moment' };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const MODES = {
    moment:   { label:'احسبي العزم', f1:40, d1:0.15 },
    distance: { label:'احسبي المسافة', f1:25, d1:0.12, f2:15 },
    force:    { label:'احسبي القوة', f1:10, d1:0.35, d2:0.20 },
  };

  function renderControls(){
    const m=MODES[S.mode];
    if(S.f1===undefined) S.f1=m.f1; if(S.d1===undefined) S.d1=m.d1;
    if(S.mode==='distance' && S.f2===undefined) S.f2=m.f2;
    if(S.mode==='force' && S.d2===undefined) S.d2=m.d2;

    let inputsHtml='', formulaHtml='';
    if(S.mode==='moment'){
      formulaHtml = 'العزم = القوة × المسافة من المحور';
      inputsHtml = `
        <label style="font-size:12px;font-weight:700">القوة F (N)</label>
        <input type="number" value="${S.f1}" oninput="simState.f1=+this.value" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ccc;margin-bottom:8px;font-family:Tajawal">
        <label style="font-size:12px;font-weight:700">المسافة عن المحور (m)</label>
        <input type="number" value="${S.d1}" oninput="simState.d1=+this.value" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ccc;margin-bottom:10px;font-family:Tajawal">`;
    } else if(S.mode==='distance'){
      formulaHtml = 'العزم (اتجاه عقارب الساعة) = العزم (عكس اتجاه عقارب الساعة)<br>F₁ × d₁ = F₂ × d₂';
      inputsHtml = `
        <label style="font-size:12px;font-weight:700">القوة الأولى F₁ (N) على مسافة معلومة</label>
        <input type="number" value="${S.f1}" oninput="simState.f1=+this.value" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ccc;margin-bottom:8px;font-family:Tajawal">
        <label style="font-size:12px;font-weight:700">المسافة الأولى d₁ (cm)</label>
        <input type="number" value="${S.d1}" oninput="simState.d1=+this.value" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ccc;margin-bottom:8px;font-family:Tajawal">
        <label style="font-size:12px;font-weight:700">القوة الثانية F₂ (N)</label>
        <input type="number" value="${S.f2}" oninput="simState.f2=+this.value" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ccc;margin-bottom:10px;font-family:Tajawal">`;
    } else {
      formulaHtml = 'العزم (اتجاه عقارب الساعة) = العزم (عكس اتجاه عقارب الساعة)<br>F₁ × d₁ = F × d₂';
      inputsHtml = `
        <label style="font-size:12px;font-weight:700">القوة الأولى F₁ (N)</label>
        <input type="number" value="${S.f1}" oninput="simState.f1=+this.value" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ccc;margin-bottom:8px;font-family:Tajawal">
        <label style="font-size:12px;font-weight:700">المسافة الأولى d₁ (m)</label>
        <input type="number" value="${S.d1}" oninput="simState.d1=+this.value" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ccc;margin-bottom:8px;font-family:Tajawal">
        <label style="font-size:12px;font-weight:700">المسافة الثانية d₂ (m)</label>
        <input type="number" value="${S.d2}" oninput="simState.d2=+this.value" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ccc;margin-bottom:10px;font-family:Tajawal">`;
    }

    return `
      <div class="ctrl-section"><div class="ctrl-label">🧮 حساب عزم القوة</div></div>
      <div style="display:flex;gap:6px;margin-bottom:12px">
        ${Object.keys(MODES).map(k=>`<button onclick="window._g8mMode8a('${k}')" style="flex:1;padding:9px 2px;border-radius:8px;border:2px solid ${S.mode===k?'#D4901A':'#ddd'};background:${S.mode===k?'rgba(212,144,26,0.12)':'var(--bg-ctrl-btn)'};color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:11.5px">${MODES[k].label}</button>`).join('')}
      </div>
      <div style="font-size:12px;color:var(--text-secondary);margin-bottom:10px;line-height:1.7">${formulaHtml}</div>
      ${inputsHtml}
      <button class="ctrl-btn play" onclick="window._g8mCalc8a()">🖩 احسبي</button>
      ${S.result!==undefined ? `<div style="margin-top:12px;text-align:center;background:var(--bg-card2);border-radius:10px;padding:13px;font-size:15px;font-weight:800;color:#D4901A">${S.result}</div>` : ''}
    `;
  }
  controls(renderControls());
  window._g8mMode8a = function(k){ _g8pPlayClick(); S.mode=k; S.result=undefined; S.f1=undefined; S.d1=undefined; S.f2=undefined; S.d2=undefined; controls(renderControls()); };
  window._g8mCalc8a = function(){
    _g8pPlayClick();
    if(S.mode==='moment'){ S.result = `العزم = ${S.f1} × ${S.d1} = ${(S.f1*S.d1).toFixed(2)} N·m`; }
    else if(S.mode==='distance'){ const d2=(S.f1*S.d1)/S.f2; S.result = `المسافة = ${d2.toFixed(1)} cm`; }
    else { const f=(S.f1*S.d1)/S.d2; S.result = `القوة = ${f.toFixed(1)} N`; }
    _g8pPlayDrop(); controls(renderControls());
  };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null; cv.onclick=null;

  function draw(){
    if(currentSim!=='g8mot6n8' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g8cBg(dark); c.fillRect(0,0,w,h);

    const pivotX=w*0.5, pivotY=h*0.4, armLen=w*0.3;
    c.save(); c.fillStyle=g8cMut(dark);
    c.beginPath(); c.moveTo(pivotX-w*0.04,pivotY+h*0.06); c.lineTo(pivotX+w*0.04,pivotY+h*0.06); c.lineTo(pivotX,pivotY-h*0.015); c.closePath(); c.fill(); c.restore();
    c.save(); c.strokeStyle='#8A5A2E'; c.lineWidth=Math.max(6,w*0.015); c.lineCap='round';
    c.beginPath(); c.moveTo(pivotX-armLen,pivotY); c.lineTo(pivotX+armLen,pivotY); c.stroke(); c.restore();

    [-1,1].forEach(side=>{
      const x=pivotX+side*armLen*0.75;
      c.save(); c.strokeStyle=side<0?'#EF4444':'#3B82F6'; c.lineWidth=Math.max(2.5,w*0.006);
      c.beginPath(); c.moveTo(x,pivotY); c.lineTo(x,pivotY-h*0.14); c.stroke();
      const ah=w*0.014;
      c.beginPath(); c.moveTo(x,pivotY); c.lineTo(x-ah,pivotY-ah*1.3); c.lineTo(x+ah,pivotY-ah*1.3); c.closePath();
      c.fillStyle=side<0?'#EF4444':'#3B82F6'; c.fill();
      c.restore();
    });

    c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
    c.fillText('عارضة متوازنة — استخدمي الحاسبة على اليمين', w*0.5, h*0.72);

    g8lHeader(c,w,h,dark,'نشاط ٨-٦ · احسبي عزم القوة');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* تاب ٢: تحدّي العزم (مسائل تطبيقية) */
function simG8Mot6N8b(){
  cancelAnimationFrame(animFrame);
  const QUESTIONS = [
    { q:'قوّة مقدارها 50 N تؤثّر على مسافة 0.8 m من المحور. ما مقدار عزم هذه القوّة؟', opts:['20 N·m','40 N·m','50.8 N·m','62.5 N·m'], ans:1, fb:'العزم = القوة × المسافة = 50 × 0.8 = 40 N·m' },
    { q:'في العارضة نفسها، توجد قوّة أخرى 100 N على الجانب الآخر. إذا كانت العارضة متوازنة، فكم تبعد هذه القوّة عن المحور؟', opts:['0.2 m','0.4 m','0.8 m','1.6 m'], ans:1, fb:'بما أنّ العارضة متوازنة، فإنّ عزم القوّتين متساويان: 40 = 100 × d ⟵ d = 0.4 m' },
    { q:'قوّة 75 N تؤثّر على مسافة 40 cm من المحور على أحد جانبي عارضة متوازنة. ما القوّة اللازمة لتوازنها إذا أثّرت على مسافة 25 cm من الجانب الآخر؟', opts:['46.9 N','75 N','96 N','120 N'], ans:3, fb:'75 × 40 = F × 25 ⟵ F = 3000 ÷ 25 = 120 N' },
  ];
  simState = { idx:0, sel:null, score:0 };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    if(S.idx>=QUESTIONS.length){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🎉 انتهى التحدّي!</div></div>
        <div style="text-align:center;background:var(--bg-card2);border-radius:10px;padding:16px;font-size:16px;font-weight:800">نتيجتك: ${S.score} / ${QUESTIONS.length}</div>
        <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g8mRestart8b()">↺ أعيدي المحاولة</button>`;
    }
    const q = QUESTIONS[S.idx];
    return `
      <div class="ctrl-section"><div class="ctrl-label">📝 مسألة ${S.idx+1} من ${QUESTIONS.length}</div></div>
      <div style="font-size:13.5px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px">${q.q}</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${q.opts.map((o,i)=>`<button onclick="window._g8mQAns8b(${i})" style="padding:10px;border-radius:9px;border:2px solid ${S.sel===null?'#ddd':(i===q.ans?'#22C55E':(i===S.sel?'#DC2626':'#ddd'))};background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:12.5px">${o}</button>`).join('')}
      </div>
      ${S.sel!==null?`
      <div style="margin-top:10px;padding:12px;background:${S.sel===q.ans?'rgba(74,222,128,0.15)':'rgba(239,68,68,0.1)'};border-radius:9px;font-size:12.5px;line-height:1.8;color:var(--text-secondary)">${S.sel===q.ans?'✅ صحيح!':'💡'} ${q.fb}</div>
      <button class="ctrl-btn play" style="margin-top:12px" onclick="window._g8mNext8b()">التالي ←</button>`:''}
    `;
  }
  controls(renderControls());
  window._g8mQAns8b = function(i){
    _g8pPlayClick(); S.sel=i;
    if(i===QUESTIONS[S.idx].ans){ S.score++; _g8pPlayDrop(); }
    controls(renderControls());
  };
  window._g8mNext8b = function(){ _g8pPlayClick(); S.idx++; S.sel=null; controls(renderControls()); };
  window._g8mRestart8b = function(){ S.idx=0; S.sel=null; S.score=0; controls(renderControls()); };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null; cv.onclick=null;

  function draw(){
    if(currentSim!=='g8mot6n8' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g8cBg(dark); c.fillRect(0,0,w,h);

    const pivotX=w*0.5, pivotY=h*0.4, armLen=w*0.3;
    c.save(); c.fillStyle=g8cMut(dark);
    c.beginPath(); c.moveTo(pivotX-w*0.04,pivotY+h*0.06); c.lineTo(pivotX+w*0.04,pivotY+h*0.06); c.lineTo(pivotX,pivotY-h*0.015); c.closePath(); c.fill(); c.restore();
    c.save(); c.strokeStyle='#8A5A2E'; c.lineWidth=Math.max(6,w*0.015); c.lineCap='round';
    c.beginPath(); c.moveTo(pivotX-armLen,pivotY); c.lineTo(pivotX+armLen,pivotY); c.stroke(); c.restore();

    c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
    c.fillText('📝 اختاري إجابتك من القائمة', w*0.5, h*0.72);

    g8lHeader(c,w,h,dark,'نشاط ٨-٦ · تحدّي العزم');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}
