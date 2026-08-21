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
