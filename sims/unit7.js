function simAdaptDesert() {
  // Matches textbook p.14-15: Fennec fox adaptations in Oman desert
  simState = { t: 0, selected: null };
  const adaptations = [
    { id: 'ears', label: 'آذان كبيرة', desc: 'تُبدّد الحرارة من الجسم وتساعد الثعلب على البقاء بارداً في الأيام الحارة، كما تساعد على سماع الأصوات الخافتة', color: '#E63946', angle: -0.6, dist: 0.22 },
    { id: 'eyes', label: 'عينان متكيّفتان', desc: 'تكيّفت عينا الثعلب ليتمكّن من الرؤية عندما يخفت الضوء بشدة — للصيد ليلاً في الظلام', color: '#F4A522', angle: -0.15, dist: 0.13 },
    { id: 'fur_body', label: 'فراء سميك', desc: 'الفراء السميك يوفّر للثعلب الدفء في الليالي الباردة', color: '#A8C8FF', angle: 0.4, dist: 0.22 },
    { id: 'legs', label: 'رجلان قويتان', desc: 'الرجلان الأماميتان قويتان تساعدان الثعلب على حفر الجحور فيها ليرتاح أثناء النهار', color: '#2DC653', angle: 0.8, dist: 0.32 },
    { id: 'paws', label: 'أخمص القدمين', desc: 'الفراء السميك بأخمص القدمين يحميهما من حرارة الرمل الساخن', color: '#7B5EA7', angle: 1.1, dist: 0.3 },
  ];
  simState.adaptations = adaptations;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🦊 نشاط 1-7: الثعلب الرملي (الحصيني)</div>
    </div>
    <div class="ctrl-section">
      <div style="font-size:15px;color:rgba(255,255,255,0.7);margin-bottom:8px">اضغط على كل وسيلة تكيُّف لتمييزها على الرسم:</div>
      ${adaptations.map(a => `<button class="ctrl-btn" id="btn_${a.id}" style="margin:3px 0;width:100%;text-align:right;padding:8px 10px;background:${a.color}22;border:1px solid ${a.color}55;color:${a.color}">${a.label}</button>`).join('')}
    </div>
    <div class="ctrl-section" style="display:flex;gap:6px;flex-wrap:wrap">
      <button class="ctrl-btn" id="btnMove" style="flex:1;background:rgba(0,180,216,0.15);border-color:rgba(0,180,216,0.4);color:#00B4D8">🏃 تحريك</button>
      <button class="ctrl-btn" id="btnHunt" style="flex:1;background:rgba(244,165,34,0.15);border-color:rgba(244,165,34,0.4);color:#F4A522">🌙 صيد</button>
      <button class="ctrl-btn" id="btnRest" style="flex:1;background:rgba(45,198,83,0.15);border-color:rgba(45,198,83,0.4);color:#2DC653">😴 راحة</button>
    </div>
    <div class="info-box" id="adaptDesc">اضغط على أي وسيلة تكيُّف لمعرفة تفاصيلها</div>
    <div class="q-box">
      <div style="font-size:15px;color:#F4C870;margin-bottom:6px">﴿ وَمَا مِن دَابَّةٍ فِي الْأَرْضِ إِلَّا عَلَى اللَّهِ رِزْقُهَا ﴾ هود:٦</div>
      <strong>❓ سؤال الكتاب (ص15):</strong> كيف تتكيُّف هذه الحيوانات لتعيش في الصحراء الحارة وتصطاد في الليل؟
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button><div class="q-ans-panel">آذان كبيرة لتبريد الجسم، فراء ناعم يعزل الجسم، عيون واسعة للرؤية الليليّة، نشاط ليليّ لتجنّب حرارة النهار.</div>
    </div>
  `);

  adaptations.forEach(a => {
    btn('btn_' + a.id, () => {
      simState.selected = simState.selected === a.id ? null : a.id;
      document.getElementById('adaptDesc').innerHTML = `<strong style="color:${a.color}">${a.label}:</strong> ${a.desc}`;
      document.querySelectorAll('[id^=btn_]').forEach(b => b.style.opacity = '0.5');
      const selBtn = document.getElementById('btn_' + a.id);
      if (selBtn) selBtn.style.opacity = '1';
    });
  });
  btn('btnMove', () => { simState.mode = 'move'; simState.foxX = 0.1; document.getElementById('adaptDesc').innerHTML = '🏃 الثعلب يتحرك عبر الصحراء — لاحظ حركة آذانه الكبيرة وأخمص قدميه!'; });
  btn('btnHunt', () => { simState.mode = 'hunt'; simState.preyX = 0.85; document.getElementById('adaptDesc').innerHTML = '🌙 وقت الصيد! الثعلب يستخدم آذانه الحساسة وعيناه الليليتين لتحديد الفريسة'; });
  btn('btnRest', () => { simState.mode = 'rest'; document.getElementById('adaptDesc').innerHTML = '😴 الثعلب يرتاح في جحره نهاراً — يتجنب حرارة الصحراء الشديدة'; });
  drawAdaptFennec();
}

function drawAdaptFennec() {
  if (currentSim !== 'adaptation' || currentTab !== 0) return;
  const c = ctx(), w = W(), h = H();
  simState.t = (simState.t || 0) + 1;
  const t = simState.t;

  // Mode-based fox position
  if (simState.mode === 'move') {
    simState.foxX = (simState.foxX || 0.1) + 0.004;
    if (simState.foxX > 0.9) simState.foxX = 0.1;
  }
  const foxOffsetX = simState.mode === 'move' ? (simState.foxX - 0.5) * w : 0;

  // Desert night/dusk sky - changes with mode
  const isDay = simState.mode === 'rest';
  const sky = c.createLinearGradient(0, 0, 0, h * 0.6);
  if (isDay) {
    sky.addColorStop(0, '#87CEEB'); sky.addColorStop(1, '#F5DEB3');
  } else {
    sky.addColorStop(0, '#1A0C2E'); sky.addColorStop(0.5, '#2D1B4E'); sky.addColorStop(1, '#4A2F1A');
  }
  c.fillStyle = sky; c.fillRect(0, 0, w, h * 0.6);

  // Stars (night only)
  if (!isDay) {
    if (!simState.stars) simState.stars = Array.from({length:30}, () => ({ x: Math.random()*w, y: Math.random()*h*0.5, r: Math.random()*1.5+0.5 }));
    simState.stars.forEach(s => {
      c.beginPath(); c.arc(s.x, s.y, s.r, 0, Math.PI*2);
      c.fillStyle = `rgba(255,255,220,${0.4+Math.sin(t/30+s.x)*0.3})`; c.fill();
    });
    // Moon
    c.save(); c.shadowBlur = 20; c.shadowColor = '#FFFACD';
    c.fillStyle = '#FFFACD'; c.beginPath(); c.arc(w*0.85, h*0.08, 20, 0, Math.PI*2); c.fill();
    c.restore();
  } else {
    // Sun
    c.save(); c.shadowBlur=40; c.shadowColor='#FFD700';
    c.fillStyle='#FFD700'; c.beginPath(); c.arc(w*0.15, h*0.1, 24, 0, Math.PI*2); c.fill();
    c.restore();
  }

  // Prey mouse (hunt mode)
  if (simState.mode === 'hunt') {
    simState.preyX = (simState.preyX || 0.85) - 0.003;
    if (simState.preyX < -0.05) simState.preyX = 0.9;
    const px = w * simState.preyX;
    c.fillStyle = '#ccc'; c.font = '20px serif'; c.textAlign = 'center';
    c.fillText('🐭', px, h*0.56 + Math.sin(t/10)*3);
  }

  // Sand ground
  const sand = c.createLinearGradient(0, h*0.58, 0, h);
  sand.addColorStop(0, '#B8860B'); sand.addColorStop(1, '#8B6914');
  c.fillStyle = sand; c.fillRect(0, h*0.58, w, h*0.42);

  // Sand dune
  c.fillStyle = '#C8960C';
  c.beginPath(); c.moveTo(0, h*0.75);
  c.bezierCurveTo(w*0.2, h*0.55, w*0.4, h*0.72, w*0.6, h*0.65);
  c.bezierCurveTo(w*0.75, h*0.60, w*0.9, h*0.7, w, h*0.65);
  c.lineTo(w, h); c.lineTo(0, h); c.closePath(); c.fill();

  // FENNEC FOX drawing - position changes with mode
  const legAnim = simState.mode === 'move' ? Math.sin(t/5)*8 : 0;
  const bobAnim = simState.mode === 'move' ? Math.sin(t/5)*4 : (simState.mode === 'rest' ? 0 : Math.sin(t/40)*2);
  const fx = w * 0.5 + foxOffsetX, fy = h * 0.55 + bobAnim;
  const scale = Math.min(w, h) * 0.0018;

  // Burrow (rest mode)
  if (simState.mode === 'rest') {
    c.fillStyle = '#6B4F12';
    c.beginPath(); c.ellipse(fx, h*0.67, 50*scale, 18*scale, 0, 0, Math.PI*2); c.fill();
    c.fillStyle = '#3D2A05';
    c.beginPath(); c.ellipse(fx, h*0.67, 35*scale, 12*scale, 0, 0, Math.PI*2); c.fill();
  }

  // Body
  c.fillStyle = '#D4A574';
  c.beginPath(); c.ellipse(fx, fy, 55*scale, 35*scale, 0, 0, Math.PI*2); c.fill();
  c.strokeStyle = '#B8905A'; c.lineWidth = 1; c.stroke();

  // Head
  c.fillStyle = '#D4A574';
  c.beginPath(); c.ellipse(fx + 50*scale, fy - 10*scale, 30*scale, 25*scale, -0.2, 0, Math.PI*2); c.fill();
  c.strokeStyle = '#B8905A'; c.lineWidth = 1; c.stroke();

  // BIG EARS (key adaptation)
  const earHighlight = simState.selected === 'ears';
  c.fillStyle = earHighlight ? '#E63946' : '#D4A574';
  c.strokeStyle = earHighlight ? '#E63946' : '#B8905A';
  c.lineWidth = earHighlight ? 3 : 1;
  // Left ear
  c.beginPath(); c.moveTo(fx+35*scale, fy-22*scale);
  c.bezierCurveTo(fx+20*scale, fy-80*scale, fx+50*scale, fy-85*scale, fx+55*scale, fy-25*scale);
  c.fill(); c.stroke();
  // Right ear
  c.beginPath(); c.moveTo(fx+55*scale, fy-22*scale);
  c.bezierCurveTo(fx+55*scale, fy-80*scale, fx+80*scale, fy-78*scale, fx+72*scale, fy-22*scale);
  c.fill(); c.stroke();
  // Inner ears (pink)
  c.fillStyle = '#FF9999';
  c.beginPath(); c.moveTo(fx+38*scale, fy-26*scale);
  c.bezierCurveTo(fx+26*scale, fy-68*scale, fx+46*scale, fy-72*scale, fx+52*scale, fy-28*scale);
  c.fill();
  c.beginPath(); c.moveTo(fx+58*scale, fy-26*scale);
  c.bezierCurveTo(fx+58*scale, fy-68*scale, fx+75*scale, fy-65*scale, fx+69*scale, fy-26*scale);
  c.fill();

  // Eyes
  const eyeHighlight = simState.selected === 'eyes';
  c.fillStyle = eyeHighlight ? '#F4A522' : '#2A1A0A';
  c.beginPath(); c.ellipse(fx+62*scale, fy-14*scale, 6*scale, 5*scale, 0, 0, Math.PI*2); c.fill();
  if (eyeHighlight) { c.strokeStyle = '#F4A522'; c.lineWidth = 2; c.stroke(); }
  c.fillStyle = '#fff'; c.beginPath(); c.arc(fx+64*scale, fy-15*scale, 2*scale, 0, Math.PI*2); c.fill();

  // Nose
  c.fillStyle = '#3A1A0A';
  c.beginPath(); c.ellipse(fx+78*scale, fy-8*scale, 4*scale, 3*scale, 0, 0, Math.PI*2); c.fill();

  // Tail
  c.fillStyle = '#C49060'; c.strokeStyle = '#A07040'; c.lineWidth = 1;
  c.beginPath();
  c.moveTo(fx-50*scale, fy);
  c.bezierCurveTo(fx-80*scale, fy-20*scale, fx-90*scale, fy+20*scale, fx-70*scale, fy+30*scale);
  c.bezierCurveTo(fx-55*scale, fy+38*scale, fx-45*scale, fy+30*scale, fx-45*scale, fy+15*scale);
  c.fill(); c.stroke();
  // White tail tip
  c.fillStyle = '#F5F0E8';
  c.beginPath(); c.ellipse(fx-72*scale, fy+28*scale, 10*scale, 8*scale, 0.5, 0, Math.PI*2); c.fill();

  // Legs
  const legHighlight = simState.selected === 'legs';
  c.fillStyle = legHighlight ? '#2DC653' : '#C49060';
  c.strokeStyle = legHighlight ? '#2DC653' : '#A07040';
  c.lineWidth = legHighlight ? 3 : 1;
  [[-20, 30], [0, 32], [20, 30], [40, 32]].forEach(([ox, oy]) => {
    c.beginPath();
    c.roundRect(fx + ox*scale - 5*scale, fy + 25*scale, 10*scale, oy*scale, 3*scale);
    c.fill(); c.stroke();
  });

  // Paw highlights
  const pawHighlight = simState.selected === 'paws';
  if (pawHighlight) {
    c.strokeStyle = '#7B5EA7'; c.lineWidth = 3;
    [[-20, 56], [0, 58], [20, 56], [40, 58]].forEach(([ox, oy]) => {
      c.beginPath(); c.arc(fx+ox*scale, fy+oy*scale, 8*scale, 0, Math.PI*2); c.stroke();
    });
  }

  // Fur highlight
  const furHighlight = simState.selected === 'fur_body';
  if (furHighlight) {
    c.strokeStyle = '#A8C8FF'; c.lineWidth = 2; c.globalAlpha = 0.7;
    for (let i=0; i<12; i++) {
      const angle = (i/12)*Math.PI*2;
      c.beginPath();
      c.moveTo(fx + Math.cos(angle)*50*scale, fy + Math.sin(angle)*30*scale);
      c.lineTo(fx + Math.cos(angle)*62*scale, fy + Math.sin(angle)*40*scale);
      c.stroke();
    }
    c.globalAlpha = 1;
  }

  // Adaptation labels on canvas
  const adLabels = [
    { id:'ears', x: fx+45*scale, y: fy-92*scale, label: '1. آذان كبيرة', color:'#E63946' },
    { id:'eyes', x: fx+80*scale, y: fy-26*scale, label: '2. عينان متكيّفتان', color:'#F4A522' },
    { id:'fur_body', x: fx-30*scale, y: fy-50*scale, label: '3. فراء سميك', color:'#A8C8FF' },
    { id:'legs', x: fx-55*scale, y: fy+45*scale, label: '4. رجلان قويتان', color:'#2DC653' },
    { id:'paws', x: fx+5*scale, y: fy+75*scale, label: '5. أخمص القدمين', color:'#7B5EA7' },
  ];

  adLabels.forEach(lb => {
    const isSelected = simState.selected === lb.id;
    c.save();
    if (isSelected) { c.shadowBlur = 12; c.shadowColor = lb.color; }
    c.font = `${isSelected ? 'bold ' : ''}12px Tajawal`;
    c.fillStyle = lb.color;
    c.textAlign = 'center';
    // Arrow line to feature
    c.globalAlpha = isSelected ? 1 : 0.7;
    c.fillText(lb.label, lb.x, lb.y);
    c.restore();
  });

  // Title
  c.fillStyle = 'rgba(255,255,255,0.8)'; c.font = 'bold 17px Tajawal'; c.textAlign = 'center';
  c.fillText('الثعلب الرملي (الحصيني) — وسائل التكيُّف', w/2, 22);

  dataDisplay(true, [
    ['الكائن', 'الثعلب الرملي (الحصيني)'],
    ['الموطن', 'الصحراء العُمانية'],
    ['النشاط', 'ليلي — يصطاد في الظلام'],
    ['عدد التكيُّفات', '٥ وسائل']
  ]);
  animFrame = requestAnimationFrame(()=>{try{drawAdaptFennec()}catch(e){console.error("SIM ERR:",e)}});
}

// ===== 7-1: ADAPTATION - TAB 2: CAMEL (الجمل) =====
function simAdaptOcean() {
  // Matches textbook p.14-15: Camel adaptations
  simState = { t: 0, selected: null };
  const adaptations = [
    { id: 'hump', label: 'السنام', desc: 'السنام يخزّن الدهون (ليس الماء) ويمدّ الجمل بالطاقة في الصحراء عندما يشحّ الغذاء', color: '#F4A522' },
    { id: 'lashes', label: 'رموش طويلة', desc: 'الرموش الطويلة تحمي عيني الجمل من الرمال والغبار أثناء العواصف الرملية', color: '#A8C8FF' },
    { id: 'nose', label: 'أنف يُغلق', desc: 'يستطيع الجمل إغلاق فتحتَي أنفه تماماً لمنع دخول الرمال والغبار', color: '#2DC653' },
    { id: 'feet', label: 'قدمان عريضتان', desc: 'القدمان العريضتان تمنعان الجمل من الغوص في الرمال، مثل حذاء الثلج تماماً', color: '#E63946' },
    { id: 'skin', label: 'جلد سميك', desc: 'الجلد السميك يحمي الجمل من الحرارة الشديدة والبرد الليلي القاسي في الصحراء', color: '#7B5EA7' },
  ];
  simState.adaptations = adaptations;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🐪 نشاط 1-7: الجمل العُماني</div>
    </div>
    <div class="ctrl-section">
      <div style="font-size:15px;color:rgba(255,255,255,0.7);margin-bottom:8px">اضغط على كل وسيلة تكيُّف لتمييزها:</div>
      ${adaptations.map(a => `<button class="ctrl-btn" id="btn_${a.id}" style="margin:3px 0;width:100%;text-align:right;padding:8px 10px;background:${a.color}22;border:1px solid ${a.color}55;color:${a.color}">${a.label}</button>`).join('')}
    </div>
    <div class="ctrl-section" style="display:flex;gap:6px;flex-wrap:wrap">
      <button class="ctrl-btn" id="btnCamelWalk" style="flex:1;background:rgba(244,165,34,0.15);border-color:rgba(244,165,34,0.4);color:#F4A522">🚶 سير</button>
      <button class="ctrl-btn" id="btnSandStorm" style="flex:1;background:rgba(230,57,70,0.15);border-color:rgba(230,57,70,0.4);color:#E63946">🌪️ عاصفة</button>
      <button class="ctrl-btn" id="btnDrink" style="flex:1;background:rgba(0,180,216,0.15);border-color:rgba(0,180,216,0.4);color:#00B4D8">💧 شرب</button>
    </div>
    <div class="info-box" id="adaptDescC">اضغط على أي وسيلة تكيُّف لمعرفة تفاصيلها</div>
    <div class="q-box">
      <div style="font-size:15px;color:#F4C870;margin-bottom:6px">﴿ أَفَلَا يَنظُرُونَ إِلَى الْإِبِلِ كَيْفَ خُلِقَتْ ﴾ الغاشية:١٧</div>
      <strong>❓ سؤال الكتاب (ص14):</strong> الجمل له وسائل تكيُّف تساعده على العيش في الصحراء. ما هي؟
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button><div class="q-ans-panel">السنام يخزّن الدهون للطاقة، يشرب كميّات كبيرة دفعةً واحدة، أجفان مزدوجة وأنف قابل للغلق ضد الرمل، أقدام عريضة تمنع الغوص في الرمال.</div>
    </div>
  `);

  adaptations.forEach(a => {
    btn('btn_' + a.id, () => {
      simState.selected = simState.selected === a.id ? null : a.id;
      document.getElementById('adaptDescC').innerHTML = `<strong style="color:${a.color}">${a.label}:</strong> ${a.desc}`;
      document.querySelectorAll('[id^=btn_]').forEach(b => b.style.opacity = '0.5');
      const selBtn = document.getElementById('btn_' + a.id);
      if (selBtn) selBtn.style.opacity = '1';
    });
  });
  btn('btnCamelWalk', () => { simState.camelMode = 'walk'; simState.camelX = 0.1; document.getElementById('adaptDescC').innerHTML = '🚶 الجمل يسير — لاحظ قدميه العريضتين فوق الرمال!'; });
  btn('btnSandStorm', () => { simState.camelMode = 'storm'; document.getElementById('adaptDescC').innerHTML = '🌪️ عاصفة رملية! الجمل يُغلق أنفه وتحمي رموشه الطويلة عينيه'; });
  btn('btnDrink', () => { simState.camelMode = 'drink'; simState.humpSize = 1.0; document.getElementById('adaptDescC').innerHTML = '💧 الجمل يشرب — قد يشرب ١٣٥ لتراً دفعةً واحدة! والسنام يُخزّن الدهون للطاقة'; });
  drawAdaptCamel();
}

function drawAdaptCamel() {
  if (currentSim !== 'adaptation' || currentTab !== 1) return;
  const c = ctx(), w = W(), h = H();
  simState.t = (simState.t || 0) + 1;
  const t = simState.t;

  // Camel mode logic
  const camelMode = simState.camelMode || 'idle';
  let camelX = 0.5;
  if (camelMode === 'walk') {
    simState.camelX = (simState.camelX || 0.1) + 0.003;
    if (simState.camelX > 0.85) simState.camelX = 0.1;
    camelX = simState.camelX;
  }
  if (camelMode === 'drink') { simState.humpSize = Math.max(0.5, (simState.humpSize||1.0) - 0.001); }

  // Hot desert day sky - darkens in storm
  const stormAlpha = camelMode === 'storm' ? Math.min(1, ((simState.stormT=(simState.stormT||0)+1)/80)) : Math.max(0,(simState.stormT=(simState.stormT||0)-2)/80);
  const sky = c.createLinearGradient(0, 0, 0, h * 0.55);
  sky.addColorStop(0, `rgb(${lerp(135,100,stormAlpha)},${lerp(206,150,stormAlpha)},${lerp(235,100,stormAlpha)})`);
  sky.addColorStop(0.6, `rgb(${lerp(245,180,stormAlpha)},${lerp(222,150,stormAlpha)},${lerp(179,80,stormAlpha)})`);
  sky.addColorStop(1, '#DEB887');
  c.fillStyle = sky; c.fillRect(0, 0, w, h * 0.55);

  // Hot sun
  c.save(); c.shadowBlur = 50; c.shadowColor = '#FFD700';
  c.fillStyle = '#FFD700';
  c.beginPath(); c.arc(w*0.12, h*0.1, 28, 0, Math.PI*2); c.fill();
  c.restore();

  // Heat shimmer
  c.strokeStyle = 'rgba(255,200,100,0.15)'; c.lineWidth = 1;
  for (let i=0; i<5; i++) {
    c.beginPath();
    c.moveTo(w*(0.3+i*0.12) + Math.sin(t/6+i)*3, h*0.52);
    c.lineTo(w*(0.3+i*0.12) + Math.sin(t/6+i+1)*3, h*0.47);
    c.stroke();
  }

  // Sand
  const sand = c.createLinearGradient(0, h*0.52, 0, h);
  sand.addColorStop(0, '#C8A870'); sand.addColorStop(1, '#A08040');
  c.fillStyle = sand; c.fillRect(0, h*0.52, w, h*0.48);

  // Sand dune
  c.fillStyle = '#D4B07A';
  c.beginPath(); c.moveTo(w*0.5, h*0.52);
  c.bezierCurveTo(w*0.65, h*0.40, w*0.85, h*0.52, w, h*0.48);
  c.lineTo(w, h); c.lineTo(w*0.5, h); c.closePath(); c.fill();

  // CAMEL drawing
  const cx = w * 0.44, cy = h * 0.52;
  const sc = Math.min(w, h) * 0.0016;

  // Legs
  const legH = simState.selected === 'feet';
  c.fillStyle = legH ? '#E63946' : '#C8A060';
  [[-55,-10],[-30,-5],[10,-5],[35,-8]].forEach(([ox]) => {
    c.beginPath();
    c.roundRect(cx+ox*sc - 7*sc, cy+5*sc, 14*sc, 65*sc, 4*sc);
    c.fill();
  });

  // Wide feet
  c.fillStyle = legH ? '#E63946' : '#B89050';
  [[-55,-10],[-30,-5],[10,-5],[35,-8]].forEach(([ox]) => {
    c.beginPath();
    c.ellipse(cx+ox*sc, cy+70*sc, 18*sc, 10*sc, 0, 0, Math.PI*2);
    c.fill();
    if (legH) { c.strokeStyle='#E63946'; c.lineWidth=2; c.stroke(); }
  });

  // Body
  c.fillStyle = '#D4AA70';
  c.beginPath(); c.ellipse(cx, cy - 10*sc, 80*sc, 45*sc, 0, 0, Math.PI*2); c.fill();
  c.strokeStyle = '#B89050'; c.lineWidth = 1; c.stroke();

  // HUMP
  const humpH = simState.selected === 'hump';
  c.fillStyle = humpH ? '#F4A522' : '#C8A060';
  c.strokeStyle = humpH ? '#F4A522' : '#B89050';
  c.lineWidth = humpH ? 3 : 1;
  c.beginPath();
  c.moveTo(cx - 30*sc, cy - 48*sc);
  c.bezierCurveTo(cx - 15*sc, cy - 95*sc, cx + 15*sc, cy - 95*sc, cx + 30*sc, cy - 48*sc);
  c.fill(); c.stroke();

  // Neck
  c.fillStyle = '#D4AA70'; c.strokeStyle = '#B89050'; c.lineWidth = 1;
  c.beginPath();
  c.moveTo(cx+55*sc, cy-25*sc);
  c.bezierCurveTo(cx+75*sc, cy-60*sc, cx+85*sc, cy-70*sc, cx+90*sc, cy-85*sc);
  c.bezierCurveTo(cx+100*sc, cy-88*sc, cx+105*sc, cy-80*sc, cx+100*sc, cy-65*sc);
  c.bezierCurveTo(cx+98*sc, cy-50*sc, cx+85*sc, cy-35*sc, cx+70*sc, cy-20*sc);
  c.closePath(); c.fill(); c.stroke();

  // Head
  c.fillStyle = '#D4AA70'; c.strokeStyle = '#B89050'; c.lineWidth = 1;
  c.beginPath(); c.ellipse(cx+105*sc, cy-90*sc, 28*sc, 22*sc, 0.3, 0, Math.PI*2); c.fill(); c.stroke();

  // LONG LASHES
  const lashH = simState.selected === 'lashes';
  c.strokeStyle = lashH ? '#A8C8FF' : '#3A2A1A';
  c.lineWidth = lashH ? 3 : 2;
  for (let i=0; i<5; i++) {
    const ex = cx + (90+i*3)*sc, ey = cy - (98-i)*sc;
    c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex+5*sc, ey-8*sc); c.stroke();
  }

  // Eye
  c.fillStyle = '#2A1A0A'; c.beginPath(); c.ellipse(cx+112*sc, cy-95*sc, 5*sc, 4*sc, 0, 0, Math.PI*2); c.fill();
  c.fillStyle = '#fff'; c.beginPath(); c.arc(cx+113*sc, cy-96*sc, 1.5*sc, 0, Math.PI*2); c.fill();

  // NOSE (closeable)
  const noseH = simState.selected === 'nose';
  c.fillStyle = noseH ? '#2DC653' : '#B89050';
  c.beginPath(); c.ellipse(cx+130*sc, cy-82*sc, 8*sc, 5*sc, 0.2, 0, Math.PI*2); c.fill();
  if (noseH) {
    c.strokeStyle = '#2DC653'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(cx+122*sc, cy-82*sc); c.lineTo(cx+138*sc, cy-82*sc); c.stroke();
    c.fillStyle = '#2DC65399'; c.font = '15px Tajawal'; c.textAlign = 'center';
    c.fillText('مغلق ✓', cx+130*sc, cy-72*sc);
  }

  // Thick skin highlight
  const skinH = simState.selected === 'skin';
  if (skinH) {
    c.strokeStyle = '#7B5EA7'; c.lineWidth = 4; c.globalAlpha = 0.6;
    c.beginPath(); c.ellipse(cx, cy-10*sc, 83*sc, 48*sc, 0, 0, Math.PI*2); c.stroke();
    c.globalAlpha = 1;
  }

  // Adaptation labels
  const labels = [
    { id:'hump', x: cx, y: cy-100*sc, text: '1. السنام', color:'#F4A522' },
    { id:'lashes', x: cx+140*sc, y: cy-108*sc, text: '2. رموش طويلة', color:'#A8C8FF' },
    { id:'nose', x: cx+155*sc, y: cy-78*sc, text: '3. أنف يُغلق', color:'#2DC653' },
    { id:'feet', x: cx-40*sc, y: cy+85*sc, text: '4. قدمان عريضتان', color:'#E63946' },
    { id:'skin', x: cx-95*sc, y: cy-30*sc, text: '5. جلد سميك', color:'#7B5EA7' },
  ];

  labels.forEach(lb => {
    const isSel = simState.selected === lb.id;
    c.save();
    if (isSel) { c.shadowBlur = 12; c.shadowColor = lb.color; }
    c.font = `${isSel ? 'bold ' : ''}11px Tajawal`;
    c.fillStyle = lb.color; c.textAlign = 'center'; c.globalAlpha = isSel ? 1 : 0.75;
    c.fillText(lb.text, lb.x, lb.y);
    c.restore();
  });

  c.fillStyle = 'rgba(255,255,255,0.8)'; c.font = 'bold 17px Tajawal'; c.textAlign = 'center';
  c.fillText('الجمل العُماني — وسائل التكيُّف', w/2, 22);

  dataDisplay(true, [
    ['الكائن', 'الجمل'],
    ['الموطن', 'الصحراء العُمانية'],
    ['مميز', 'يصبر على الجفاف أسابيع'],
    ['عدد التكيُّفات', '٥ وسائل']
  ]);
  animFrame = requestAnimationFrame(()=>{try{drawAdaptCamel()}catch(e){console.error("SIM ERR:",e)}});
}

// ===== 7-1: ADAPTATION - TAB 3: CACTUS (نبات الصبّار) =====
function simAdaptForest() {
  // Matches textbook p.15: Cactus adaptations
  simState = { t: 0, selected: null };
  const adaptations = [
    { id: 'stem', label: 'ساق سميكة تخزّن الماء', desc: 'الساق السميكة تخزّن كميات كبيرة من الماء داخل أنسجتها الإسفنجية، لتستخدمها في أوقات الجفاف', color: '#2DC653' },
    { id: 'spines', label: 'أشواك تمنع الحيوانات', desc: 'الأشواك تمنع الحيوانات العطشى من أكل الصبّار للحصول على الماء. وهي في الأصل أوراق تحوّلت إلى أشواك', color: '#E63946' },
    { id: 'roots', label: 'جذور طويلة في أعماق التربة', desc: 'الجذور الطويلة تستطيع الوصول للماء في أعماق التربة. وبعض أنواع الصبّار لها جذور أفقية واسعة لالتقاط مياه الأمطار النادرة', color: '#F4A522' },
    { id: 'waxy', label: 'جلد شمعي يمنع التبخر', desc: 'طبقة شمعية سميكة تغطّي الساق وتمنع تبخّر الماء في الحرارة الشديدة — مثل البلاستيك تماماً', color: '#A8C8FF' },
  ];
  simState.adaptations = adaptations;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌵 نشاط 1-7: نبات الصبّار</div>
    </div>
    <div class="ctrl-section">
      <div style="font-size:15px;color:rgba(255,255,255,0.7);margin-bottom:8px">اضغط على كل ملصق لمعرفة وسيلة التكيُّف:</div>
      ${adaptations.map(a => `<button class="ctrl-btn" id="btn_${a.id}" style="margin:3px 0;width:100%;text-align:right;padding:8px 10px;background:${a.color}22;border:1px solid ${a.color}55;color:${a.color}">${a.label}</button>`).join('')}
    </div>
    <div class="info-box" id="adaptDescK">اضغط على أي وسيلة تكيُّف لمعرفة تفاصيلها</div>
    <div class="q-box">
      <div style="font-size:15px;color:#F4C870;margin-bottom:6px">﴿ وَأَنبَتَتِ الْأَرْضُ مِن كُلِّ شَيْءٍ مَّوْزُونٍ ﴾ الحجر:١٩</div>
      <strong>❓ سؤال الكتاب (ص15):</strong> نباتات الصبّار لها وسائل تكيُّف تساعدها على العيش في الصحراء حيث يوجد الماء بكميّة قليلة — ما هي؟
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button><div class="q-ans-panel">ساق سميكة تخزّن الماء، أشواك بدلاً من أوراق تُقلّل التبخّر، جذور سطحيّة واسعة تمتص مياه الأمطار بسرعة، طبقة شمعيّة تمنع فقدان الماء.</div>
    </div>
  `);

  adaptations.forEach(a => {
    btn('btn_' + a.id, () => {
      simState.selected = simState.selected === a.id ? null : a.id;
      document.getElementById('adaptDescK').innerHTML = `<strong style="color:${a.color}">${a.label}:</strong> ${a.desc}`;
      document.querySelectorAll('[id^=btn_]').forEach(b => b.style.opacity = '0.5');
      const selBtn = document.getElementById('btn_' + a.id);
      if (selBtn) selBtn.style.opacity = '1';
    });
  });
  drawAdaptCactus();
}

function drawAdaptCactus() {
  if (currentSim !== 'adaptation' || currentTab !== 2) return;
  const c = ctx(), w = W(), h = H();
  simState.t = (simState.t || 0) + 1;
  const t = simState.t;

  // Desert day sky
  const sky = c.createLinearGradient(0, 0, 0, h * 0.55);
  sky.addColorStop(0, '#5B9BD5');
  sky.addColorStop(1, '#F0C080');
  c.fillStyle = sky; c.fillRect(0, 0, w, h * 0.55);

  // Sun
  c.save(); c.shadowBlur = 40; c.shadowColor = '#FFD700';
  c.fillStyle = '#FFE040'; c.beginPath(); c.arc(w*0.85, h*0.1, 25, 0, Math.PI*2); c.fill();
  c.restore();

  // Sand/soil layer (cross-section style)
  // Above ground
  c.fillStyle = '#D4B07A'; c.fillRect(0, h*0.55, w, h*0.15);
  // Below ground (soil - cross section view)
  const soil = c.createLinearGradient(0, h*0.7, 0, h);
  soil.addColorStop(0, '#8B6040'); soil.addColorStop(1, '#5A3820');
  c.fillStyle = soil; c.fillRect(0, h*0.7, w, h*0.3);

  // Soil/sand boundary line
  c.strokeStyle = '#A07040'; c.lineWidth = 2;
  c.setLineDash([8, 4]);
  c.beginPath(); c.moveTo(0, h*0.7); c.lineTo(w, h*0.7); c.stroke();
  c.setLineDash([]);

  // Soil label
  c.fillStyle = 'rgba(255,220,180,0.6)'; c.font = '15px Tajawal'; c.textAlign = 'right';
  c.fillText('التربة', w-10, h*0.72+12);

  const kx = w * 0.5, ksoil = h * 0.7;

  // ROOTS (long, going deep)
  const rootH = simState.selected === 'roots';
  c.strokeStyle = rootH ? '#F4A522' : '#8B5A2B';
  c.lineWidth = rootH ? 3 : 2;

  // Main root going deep
  c.beginPath(); c.moveTo(kx, ksoil);
  c.bezierCurveTo(kx+5, ksoil+40, kx-5, ksoil+70, kx+10, ksoil+120);
  c.stroke();

  // Wide lateral roots
  [[-1.2, 0.25], [-0.9, 0.5], [1.1, 0.3], [0.85, 0.55]].forEach(([dx, dy]) => {
    c.beginPath();
    c.moveTo(kx, ksoil + 20);
    c.bezierCurveTo(kx+dx*40, ksoil+dy*80, kx+dx*80, ksoil+dy*60, kx+dx*110, ksoil+dy*50);
    c.stroke();
  });

  if (rootH) {
    c.fillStyle = '#F4A522'; c.font = '15px Tajawal'; c.textAlign = 'center';
    c.fillText('جذور عميقة', kx+15, ksoil+130);
    c.fillText('لالتقاط الماء', kx+15, ksoil+143);
  }

  // CACTUS BODY (thick stem with water)
  const stemH = simState.selected === 'stem';
  const cactusColor = stemH ? '#2DC653' : '#4A8A2A';
  const cactusLight = stemH ? '#5ACA3A' : '#5A9A3A';

  // Main thick stem
  c.fillStyle = cactusColor;
  c.beginPath(); c.roundRect(kx-38, ksoil-180, 76, 180, [12, 12, 0, 0]); c.fill();

  // Vertical ribs
  c.strokeStyle = '#3A7A1A'; c.lineWidth = 1;
  [-20, -5, 10, 25].forEach(ox => {
    c.beginPath(); c.moveTo(kx+ox, ksoil-175); c.lineTo(kx+ox, ksoil); c.stroke();
  });

  // Water inside highlight
  if (stemH) {
    c.fillStyle = 'rgba(100,200,255,0.3)';
    c.beginPath(); c.roundRect(kx-32, ksoil-170, 64, 165, [8, 8, 0, 0]); c.fill();
    c.fillStyle = '#2DC653'; c.font = '15px Tajawal'; c.textAlign = 'center';
    c.fillText('💧 ماء مخزّن', kx, ksoil-90);
  }

  // Arms
  c.fillStyle = cactusColor;
  c.beginPath(); c.roundRect(kx-100, ksoil-150, 62, 30, 15); c.fill();
  c.beginPath(); c.roundRect(kx-100, ksoil-150, 30, 80, 15); c.fill();
  c.beginPath(); c.roundRect(kx+38, ksoil-140, 62, 30, 15); c.fill();
  c.beginPath(); c.roundRect(kx+70, ksoil-140, 30, 70, 15); c.fill();

  // SPINES (thorns)
  const spineH = simState.selected === 'spines';
  c.strokeStyle = spineH ? '#E63946' : '#8B6040';
  c.lineWidth = spineH ? 2 : 1;
  // Spines on main body
  for (let row=0; row<6; row++) {
    for (let col=0; col<4; col++) {
      const sx = kx - 30 + col*20;
      const sy = ksoil - 165 + row*28;
      [-0.5, 0, 0.5].forEach(angle => {
        c.beginPath();
        c.moveTo(sx, sy);
        c.lineTo(sx + Math.sin(angle)*12, sy - Math.cos(angle)*12);
        c.stroke();
      });
    }
  }

  // WAXY SKIN highlight
  const waxyH = simState.selected === 'waxy';
  if (waxyH) {
    c.strokeStyle = '#A8C8FF'; c.lineWidth = 4; c.globalAlpha = 0.6;
    c.beginPath(); c.roundRect(kx-40, ksoil-182, 80, 182, [14, 14, 0, 0]); c.stroke();
    c.globalAlpha = 1;
    c.fillStyle = '#A8C8FF'; c.font = '15px Tajawal'; c.textAlign = 'center';
    c.fillText('طبقة شمعية', kx, ksoil-188);
  }

  // Labels
  const labels = [
    { id:'stem', x: kx+90, y: ksoil-120, text: '1. ساق سميكة', color:'#2DC653' },
    { id:'spines', x: kx+90, y: ksoil-80, text: '2. أشواك', color:'#E63946' },
    { id:'roots', x: kx+80, y: h*0.82, text: '3. جذور طويلة', color:'#F4A522' },
    { id:'waxy', x: kx-90, y: ksoil-150, text: '4. جلد شمعي', color:'#A8C8FF' },
  ];

  labels.forEach(lb => {
    const isSel = simState.selected === lb.id;
    c.save();
    if (isSel) { c.shadowBlur = 12; c.shadowColor = lb.color; }
    c.font = `${isSel ? 'bold ' : ''}11px Tajawal`;
    c.fillStyle = lb.color; c.textAlign = 'center'; c.globalAlpha = isSel ? 1 : 0.8;
    c.fillText(lb.text, lb.x, lb.y);
    c.restore();
  });

  c.fillStyle = 'rgba(255,255,255,0.8)'; c.font = 'bold 17px Tajawal'; c.textAlign = 'center';
  c.fillText('نبات الصبّار — وسائل التكيُّف', w/2, 22);

  dataDisplay(true, [
    ['الكائن', 'نبات الصبّار'],
    ['الموطن', 'الصحراء الجافة'],
    ['الماء المخزّن', 'في الساق السميكة'],
    ['عدد التكيُّفات', '٤ وسائل']
  ]);
  animFrame = requestAnimationFrame(()=>{try{drawAdaptCactus()}catch(e){console.error("SIM ERR:",e)}});
}

// ===== 7-2: FOOD CHAIN BUILD =====
function simFoodChainBuild() {
  // Matches textbook p.16-17: Food chain activity - Sun->Rice->Human
  // Also shows the grasshopper-spider-hawk chain from p.16
  const chains = {
    rice: [
      { name:'ضوء الشمس', emoji:'☀️', type:'مصدر الطاقة', color:'#FFD700' },
      { name:'أرز', emoji:'🌾', type:'منتِج', color:'#2DC653' },
      { name:'إنسان', emoji:'🧑', type:'مستهلك', color:'#00B4D8' },
    ],
    grasshopper: [
      { name:'ضوء الشمس', emoji:'☀️', type:'مصدر الطاقة', color:'#FFD700' },
      { name:'عُشب', emoji:'🌿', type:'منتِج', color:'#2DC653' },
      { name:'جرادة', emoji:'🦗', type:'مستهلك أول', color:'#A0C820' },
      { name:'عنكبوت', emoji:'🕷️', type:'مستهلك ثانٍ', color:'#7B5EA7' },
      { name:'صقر', emoji:'🦅', type:'مستهلك ثالث', color:'#E63946' },
    ],
    snake: [
      { name:'ضوء الشمس', emoji:'☀️', type:'مصدر الطاقة', color:'#FFD700' },
      { name:'نباتات', emoji:'🌱', type:'منتِج', color:'#2DC653' },
      { name:'حشرات', emoji:'🐛', type:'مستهلك أول', color:'#A0C820' },
      { name:'ثعبان', emoji:'🐍', type:'مستهلك ثانٍ', color:'#F4A522' },
      { name:'طائر', emoji:'🦅', type:'مستهلك ثالث', color:'#E63946' },
    ],
  };

  simState = { t: 0, chainKey: 'rice', chains, animProgress: 0, playing: true };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔗 نشاط 2-7: السلاسل الغذائية</div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">اختَر سلسلة غذائية:</div>
      <button class="ctrl-btn" id="chainRice" style="width:100%;margin:3px 0">☀️ ← 🌾 ← 🧑 (الأرز والإنسان)</button>
      <button class="ctrl-btn" id="chainGrass" style="width:100%;margin:3px 0">☀️ ← 🌿 ← 🦗 ← 🕷️ ← 🦅 (الكتاب ص17)</button>
      <button class="ctrl-btn" id="chainSnake" style="width:100%;margin:3px 0">☀️ ← 🌱 ← 🐛 ← 🐍 ← 🦅 (سلسلة أخرى)</button>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label" style="margin-bottom:6px">تجربة الحذف:</div>
      <div style="display:flex;gap:5px;flex-wrap:wrap" id="removeButtons"></div>
    </div>
    <div class="ctrl-section" style="display:flex;gap:6px">
      <button class="ctrl-btn play" id="chainPlay" style="flex:1">⏸ إيقاف</button>
      <button class="ctrl-btn reset" id="chainReset" style="flex:1">↺ استعادة</button>
    </div>
    <div class="info-box" id="chainInfo">الأسهم تُبيّن انتقال الطاقة. اضغط على أي كائن أعلاه لحذفه وشاهد ما يحدث!</div>
    <div class="q-box"><strong>❓ سؤال الكتاب (ص16):</strong> الدجاجة تتناول محمد الغذاء، والقمح من النباتات. ارسم سلسلة غذائية تُبيّن كيف انتقلت الطاقة من الشمس إلى محمد عندما أكل الدجاج.
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
    <div class="q-ans-panel">شمس ← قمح ← دجاجة ← محمد</div>
  </div>
  `);

  function buildRemoveButtons() {
    const chain = simState.chains[simState.chainKey];
    const div = document.getElementById('removeButtons');
    if (!div) return;
    div.innerHTML = chain.map((node, i) => {
      const removed = simState.removed && simState.removed.has(i);
      return `<button onclick="window._chainRemove(${i})" style="padding:5px 8px;border-radius:8px;border:1px solid ${removed?'#E63946':'rgba(255,255,255,0.2)'};background:${removed?'rgba(230,57,70,0.2)':'rgba(255,255,255,0.05)'};color:${removed?'#E63946':'#ccc'};font-size:16px;cursor:pointer">${node.emoji}</button>`;
    }).join('');
  }
  window._chainRemove = (i) => {
    if (!simState.removed) simState.removed = new Set();
    if (simState.removed.has(i)) simState.removed.delete(i);
    else simState.removed.add(i);
    const chain = simState.chains[simState.chainKey];
    const info = document.getElementById('chainInfo');
    if (info) {
      if (simState.removed.size === 0) info.textContent = 'الأسهم تُبيّن انتقال الطاقة. اضغط على أي كائن لحذفه!';
      else {
        const names = [...simState.removed].map(idx => (chain[idx] && chain[idx].name) || '').join(' و');
        info.innerHTML = `<span style="color:#E63946">⚠️ تم حذف: ${names}</span><br>السلسلة مقطوعة! الطاقة لا تصل لما بعده`;
      }
    }
    buildRemoveButtons();
  };

  const switchChain = (key) => {
    simState.chainKey = key; simState.animProgress = 0; simState.removed = new Set();
    buildRemoveButtons();
  };

  btn('chainRice', () => switchChain('rice'));
  btn('chainGrass', () => switchChain('grasshopper'));
  btn('chainSnake', () => switchChain('snake'));
  btn('chainPlay', () => {
    simState.playing = !simState.playing;
    document.getElementById('chainPlay').textContent = simState.playing ? '⏸ إيقاف' : '▶ تشغيل';
  });
  btn('chainReset', () => { simState.removed = new Set(); simState.animProgress = 0; buildRemoveButtons(); document.getElementById('chainInfo').textContent = 'الأسهم تُبيّن انتقال الطاقة. اضغط على أي كائن لحذفه!'; });
  simState.removed = new Set();
  buildRemoveButtons();
  drawFoodChain();
}

function drawFoodChain() {
  if (currentSim !== 'foodchain' || currentTab !== 0) return;
  const c = ctx(), w = W(), h = H();
  if (simState.playing) simState.t++;
  const t = simState.t;
  const chain = simState.chains[simState.chainKey];

  c.fillStyle = '#0D1B2A'; c.fillRect(0, 0, w, h);

  // Title
  c.fillStyle = 'rgba(255,255,255,0.6)'; c.font = 'bold 16px Tajawal'; c.textAlign = 'center';
  c.fillText('الطاقة تنتقل من الشمس → إلى آخر كائن في السلسلة', w/2, 22);

  const n = chain.length;
  const margin = 60;
  const spacing = (w - margin*2) / (n - 1);
  const cy = h * 0.48;

  // Animate energy pulse
  if (simState.playing) {
    simState.animProgress = (simState.animProgress + 0.005) % 1;
  }

  // Draw arrows and connections
  let chainBroken = false;
  chain.forEach((node, i) => {
    if (i < n - 1) {
      const x1 = margin + i * spacing;
      const x2 = margin + (i + 1) * spacing;
      const removed = simState.removed && simState.removed.has(i);
      const nextRemoved = simState.removed && simState.removed.has(i+1);
      const broken = removed || nextRemoved || chainBroken;
      if (removed) chainBroken = true;

      // Arrow shaft
      if (!broken) {
        const grad = c.createLinearGradient(x1, cy, x2, cy);
        grad.addColorStop(0, chain[i].color + '88');
        grad.addColorStop(1, chain[i+1].color + '88');
        c.strokeStyle = grad; c.lineWidth = 3;
      } else {
        c.strokeStyle = 'rgba(230,57,70,0.3)'; c.lineWidth = 2; c.setLineDash([4,6]);
      }
      c.beginPath(); c.moveTo(x1 + 30, cy); c.lineTo(x2 - 30, cy); c.stroke();
      c.setLineDash([]);

      // Arrow head
      const ax = x2 - 30;
      c.fillStyle = broken ? 'rgba(230,57,70,0.3)' : chain[i+1].color;
      c.beginPath(); c.moveTo(ax, cy); c.lineTo(ax-12, cy-6); c.lineTo(ax-12, cy+6); c.closePath(); c.fill();

      // Animated energy particle (only if chain not broken)
      if (!broken && simState.playing) {
        const progPos = (simState.animProgress + i * 0.2) % 1;
        const px = x1 + 30 + (x2 - 30 - x1 - 30) * progPos;
        c.save(); c.shadowBlur = 15; c.shadowColor = '#FFD700';
        c.beginPath(); c.arc(px, cy + Math.sin(t/8)*3, 5, 0, Math.PI*2);
        c.fillStyle = '#FFD700'; c.fill();
        c.restore();
      }
    }
  });

  // Draw nodes
  chain.forEach((node, i) => {
    const x = margin + i * spacing;
    const r = i === 0 ? 32 : 28;
    const isRemoved = simState.removed && simState.removed.has(i);

    c.globalAlpha = isRemoved ? 0.3 : 1;

    // Glow
    c.save(); c.shadowBlur = isRemoved ? 0 : 20; c.shadowColor = node.color;
    c.beginPath(); c.arc(x, cy, r + 4, 0, Math.PI*2);
    c.strokeStyle = node.color + '44'; c.lineWidth = 2; c.stroke();
    c.restore();

    // Circle
    const cg = c.createRadialGradient(x - r*0.3, cy - r*0.3, 2, x, cy, r);
    cg.addColorStop(0, node.color + '66'); cg.addColorStop(1, node.color + '22');
    c.fillStyle = cg; c.beginPath(); c.arc(x, cy, r, 0, Math.PI*2); c.fill();
    c.strokeStyle = isRemoved ? '#E63946' : node.color; c.lineWidth = isRemoved ? 3 : 2; c.stroke();

    // X mark if removed
    if (isRemoved) {
      c.strokeStyle = '#E63946'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(x-r*0.5, cy-r*0.5); c.lineTo(x+r*0.5, cy+r*0.5); c.stroke();
      c.beginPath(); c.moveTo(x+r*0.5, cy-r*0.5); c.lineTo(x-r*0.5, cy+r*0.5); c.stroke();
    }

    // Emoji + name
    c.font = `${r * 0.9}px serif`; c.textAlign = 'center';
    c.fillText(node.emoji, x, cy + r * 0.32);
    c.font = 'bold 16px Tajawal'; c.fillStyle = '#fff';
    c.fillText(node.name, x, cy + r + 20);
    c.font = '15px Tajawal'; c.fillStyle = node.color;
    c.fillText(node.type, x, cy + r + 34);
    c.globalAlpha = 1;
  });

  // Key concepts box
  c.fillStyle = 'rgba(255,255,255,0.06)'; c.beginPath(); c.roundRect(w*0.05, h*0.78, w*0.9, 55, 8); c.fill();
  c.fillStyle = '#2DC653'; c.font = 'bold 16px Tajawal'; c.textAlign = 'right';
  c.fillText('🌿 الكائنات المنتِجة = النباتات (تصنع غذاءها من ضوء الشمس)', w*0.92, h*0.82);
  c.fillStyle = '#00B4D8'; c.fillText('🦗 الكائنات المستهلِكة = الحيوانات (تأكل لتحصل على الطاقة)', w*0.92, h*0.82+22);

  dataDisplay(true, [
    ['نوع السلسلة', simState.chainKey === 'rice' ? 'أرز ← إنسان' : simState.chainKey === 'grasshopper' ? 'جراد ← صقر' : 'حشرة ← طائر'],
    ['عدد الحلقات', chain.length + ''],
    ['المنتِج', chain[1].name],
    ['أعلى مستهلك', chain[chain.length-1].name]
  ]);
  animFrame = requestAnimationFrame(()=>{try{drawFoodChain()}catch(e){console.error("SIM ERR:",e)}});
}

// ===== 7-2: FOOD CHAIN ENERGY =====
function simFoodChainEnergy() {
  // Energy pyramid matching textbook concept
  simState = { t: 0, energy: 1000, animT: 0 };
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⚡ انتقال الطاقة في السلسلة</div>
      <div class="ctrl-row">
        <div class="ctrl-name">طاقة الشمس <span class="ctrl-val" id="pyEnergyVal">1000</span></div>
        <input type="range" id="pyEnergySlider" min="100" max="3000" value="1000">
      </div>
    </div>
    <div class="info-box">في كل مستوى من السلسلة الغذائية، تُفقد معظم الطاقة على شكل حرارة. فقط 10% تنتقل للكائن التالي.</div>
    <div class="q-box"><strong>❓ تفكير:</strong> لماذا يوجد عدد أقل من المفترسات (كالصقور) مقارنة بالنباتات في أي بيئة طبيعية؟
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
    <div class="q-ans-panel">لأن الطاقة تُفقد في كل مستوى من السلسلة الغذائية — يحتاج المفترس الواحد إلى كميّة كبيرة من الكائنات أسفله لإعالته.</div>
  </div>
  `);
  sl('pyEnergySlider', function() {
    simState.energy = +this.value;
    document.getElementById('pyEnergyVal').textContent = this.value;
  });
  drawEnergyPyramid();
}

function drawEnergyPyramid() {
  if (currentSim !== 'foodchain' || currentTab !== 1) return;
  const c = ctx(), w = W(), h = H();
  simState.t++;
  c.fillStyle = '#0D1B2A'; c.fillRect(0, 0, w, h);

  const levels = [
    { name: 'المنتجون (عُشب/أرز)', emoji: '🌿', color: '#2DC653', pct: 1 },
    { name: 'المستهلك الأول (جرادة)', emoji: '🦗', color: '#A0C820', pct: 0.1 },
    { name: 'المستهلك الثاني (عنكبوت)', emoji: '🕷️', color: '#7B5EA7', pct: 0.01 },
    { name: 'المستهلك الثالث (صقر)', emoji: '🦅', color: '#E63946', pct: 0.001 },
  ];

  const baseE = simState.energy;
  const totalH = h * 0.72;
  const startY = h * 0.1;
  const levelH = totalH / levels.length;
  const maxW = w * 0.75;

  levels.forEach((lvl, i) => {
    const w_i = maxW * Math.pow(0.5, levels.length - 1 - i);
    const rx = (w - w_i) / 2;
    const ry = startY + i * levelH;
    const energy = baseE * lvl.pct;

    // Bar background
    c.fillStyle = lvl.color + '22';
    c.strokeStyle = lvl.color + '88';
    c.lineWidth = 1;
    c.beginPath(); c.roundRect(rx, ry + 3, w_i, levelH - 6, 4); c.fill(); c.stroke();

    // Energy fill
    c.fillStyle = lvl.color + '55';
    c.beginPath(); c.roundRect(rx + 2, ry + 5, w_i - 4, levelH - 10, 3); c.fill();

    // Emoji
    c.font = '22px serif'; c.textAlign = 'center'; c.fillText(lvl.emoji, rx + 28, ry + levelH * 0.55);

    // Name
    c.font = 'bold 16px Tajawal'; c.fillStyle = '#fff'; c.textAlign = 'right';
    c.fillText(lvl.name, rx + w_i - 10, ry + levelH * 0.42);

    // Energy value
    c.font = '15px Tajawal'; c.fillStyle = lvl.color;
    const eStr = energy >= 1 ? energy.toFixed(0) : energy.toFixed(3);
    c.fillText(`${eStr} وحدة طاقة`, rx + w_i - 10, ry + levelH * 0.68);

    // Loss arrow between levels
    if (i < levels.length - 1) {
      c.fillStyle = 'rgba(230,57,70,0.5)'; c.font = '15px Tajawal'; c.textAlign = 'center';
      c.fillText('↓ 10% فقط تنتقل', w/2, ry + levelH - 4);
    }
  });

  c.fillStyle = 'rgba(255,255,255,0.5)'; c.font = 'bold 16px Tajawal'; c.textAlign = 'center';
  c.fillText('هرم الطاقة في السلسلة الغذائية', w/2, h * 0.96);

  dataDisplay(true, [
    ['طاقة المنتجين', baseE + ''],
    ['تصل للجرادة', (baseE * 0.1).toFixed(1) + ''],
    ['تصل للصقر', (baseE * 0.001).toFixed(3) + ''],
    ['الفقدان كحرارة', '90% في كل مستوى']
  ]);
  animFrame = requestAnimationFrame(()=>{try{drawEnergyPyramid()}catch(e){console.error("SIM ERR:",e)}});
}

// ===== 7-3: FOOD WEB (Omani habitat) =====
function simFoodWeb() {
  // Matches textbook p.18-19: Activity 3-7, food web investigation
  // Uses Omani habitat animals matching textbook examples
  const nodes = [
    { id:0, name:'عوالق نباتية', emoji:'🌱', x:0.5, y:0.88, pop:100, type:'producer', desc:'المنتِج الأساسي — تصنع غذاءها من الشمس' },
    { id:1, name:'قريدس البحر (ربيان)', emoji:'🦐', x:0.2, y:0.68, pop:80, type:'consumer1', desc:'مستهلك أول — يأكل العوالق النباتية' },
    { id:2, name:'عوالق حيوانية', emoji:'🦠', x:0.75, y:0.70, pop:75, type:'consumer1', desc:'مستهلك أول — تأكل العوالق النباتية' },
    { id:3, name:'أسماك', emoji:'🐟', x:0.35, y:0.50, pop:55, type:'consumer2', desc:'مستهلك ثانٍ — يأكل القريدس والعوالق' },
    { id:4, name:'حبار', emoji:'🦑', x:0.68, y:0.48, pop:40, type:'consumer2', desc:'مستهلك ثانٍ — يأكل العوالق الحيوانية' },
    { id:5, name:'فقمة', emoji:'🦭', x:0.25, y:0.28, pop:25, type:'top', desc:'مستهلك ثالث — تأكل الأسماك' },
    { id:6, name:'حوت قاتل', emoji:'🐋', x:0.65, y:0.18, pop:10, type:'top', desc:'مستهلك القمة — يأكل الفقمة والأسماك' },
  ];
  const links = [
    [0,1],[0,2],[1,3],[2,3],[2,4],[3,4],[3,5],[4,5],[4,6],[5,6]
  ];

  simState = { nodes, links, t: 0, removed: new Set(), selected: null };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🕸️ نشاط 3-7: استقصاء شبكة غذائية</div>
    </div>
    <div class="ctrl-section">
      <div class="info-box">الشبكة الغذائية تُبيّن كيف تنتقل الطاقة بين الكائنات. اضغط على أي كائن لإزالته وشاهد تأثير ذلك على الشبكة كلها.</div>
    </div>
    <div class="ctrl-section">
      <button class="ctrl-btn reset" id="webReset" style="width:100%">↺ إعادة الشبكة</button>
    </div>
    <div id="webInfo" class="info-box" style="min-height:40px">اضغط على أي كائن لمعرفة معلومات عنه</div>
    <div class="q-box">
      <div style="font-size:15px;color:#F4C870;margin-bottom:6px">﴿ وَمَا مِن دَابَّةٍ فِي الْأَرْضِ وَلَا طَائِرٍ يَطِيرُ بِجَنَاحَيْهِ إِلَّا أُمَمٌ أَمْثَالُكُم ﴾ الأنعام:٣٨</div>
      <strong>❓ أسئلة الكتاب (ص18):</strong><br>١- اذكر الكائن المنتِج.<br>٢- اذكر ثلاثة كائنات مستهلِكة.<br>٣- حدِّد سلسلة من ٦ كائنات.
    
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- النباتات (العشب / ثمر العليق / نبات القراص).<br>٢- فأر الحقل، الفأر، الأرنب، الخنفساء، اليرقة.<br>٣- مثال: نبات ← حشرة ← ضفدع ← ثعلب ← بومة ← عوسق.</div>
  </div>
  `);

  btn('webReset', () => {
    simState.removed.clear();
    simState.nodes.forEach(n => n.pop = [100,80,75,55,40,25,10][n.id]);
    document.getElementById('webInfo').textContent = 'اضغط على أي كائن لمعرفة معلومات عنه';
  });

  const canvas = document.getElementById('simCanvas');
  canvas.onclick = (e) => {
    if (!simState.nodes) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    const hit = simState.nodes.find(n => {
      const nx = W()*n.x, ny = H()*n.y;
      return Math.hypot(mx-nx, my-ny) < 32;
    });
    if (hit) {
      if (simState.removed.has(hit.id)) {
        simState.removed.delete(hit.id);
        hit.pop = [100,80,75,55,40,25,10][hit.id];
        document.getElementById('webInfo').innerHTML = `<strong style="color:#2DC653">✓ تم استعادة ${hit.name}</strong>`;
      } else {
        simState.removed.add(hit.id);
        simState.links.forEach(([a,b]) => {
          if (a === hit.id) simState.nodes[b].pop = Math.max(5, simState.nodes[b].pop - 25);
          if (b === hit.id) simState.nodes[a].pop = Math.max(5, simState.nodes[a].pop + 20);
        });
        document.getElementById('webInfo').innerHTML = `<strong style="color:#E63946">✕ أُزيل: ${hit.name}</strong><br><small>${hit.desc}</small>`;
      }
    }
  };
  drawFoodWeb();
}

function drawFoodWeb() {
  if (currentSim !== 'foodweb') return;
  const c = ctx(), w = W(), h = H();
  simState.t++;
  c.fillStyle = '#051018'; c.fillRect(0, 0, w, h);

  const { nodes, links, removed } = simState;

  // Draw links
  links.forEach(([a, b]) => {
    const na = nodes[a], nb = nodes[b];
    if (removed.has(a) || removed.has(b)) {
      c.strokeStyle = 'rgba(100,0,0,0.2)'; c.lineWidth = 1; c.setLineDash([2, 6]);
    } else {
      c.strokeStyle = 'rgba(0,180,216,0.3)'; c.lineWidth = 2; c.setLineDash([5, 4]);
    }
    c.beginPath(); c.moveTo(w*na.x, h*na.y); c.lineTo(w*nb.x, h*nb.y); c.stroke();
    c.setLineDash([]);

    // Arrow in middle
    if (!removed.has(a) && !removed.has(b)) {
      const mx = w*(na.x+nb.x)/2, my = h*(na.y+nb.y)/2;
      const angle = Math.atan2(h*nb.y - h*na.y, w*nb.x - w*na.x);
      c.save(); c.translate(mx, my); c.rotate(angle);
      c.fillStyle = 'rgba(0,180,216,0.5)';
      c.beginPath(); c.moveTo(6,0); c.lineTo(-4,-4); c.lineTo(-4,4); c.closePath(); c.fill();
      c.restore();
    }
  });

  // Node colors by type
  const colors = { producer:'#2DC653', consumer1:'#00B4D8', consumer2:'#F4A522', top:'#E63946' };
  const typeNames = { producer:'منتِج', consumer1:'مستهلك أول', consumer2:'مستهلك ثانٍ', top:'مستهلك القمة' };

  nodes.forEach(n => {
    const nx = w*n.x, ny = h*n.y;
    const isRemoved = removed.has(n.id);
    const r = Math.max(18, Math.min(32, 18 + n.pop/7));
    const col = colors[n.type];

    if (isRemoved) {
      c.globalAlpha = 0.25;
      c.font = '26px serif'; c.textAlign = 'center'; c.fillText(n.emoji, nx, ny+8);
      c.fillStyle = '#ff3333'; c.font = '15px Tajawal'; c.fillText('✕ مُزال', nx, ny+24);
      c.globalAlpha = 1;
      return;
    }

    // Glow
    c.save(); c.shadowBlur = 18; c.shadowColor = col;
    c.beginPath(); c.arc(nx, ny, r, 0, Math.PI*2);
    c.fillStyle = col + '33'; c.fill();
    c.strokeStyle = col; c.lineWidth = 2; c.stroke();
    c.restore();

    c.font = `${r*1.1}px serif`; c.textAlign = 'center';
    c.fillText(n.emoji, nx, ny + r*0.35);
    c.font = 'bold 15px Tajawal'; c.fillStyle = '#fff';
    c.fillText(n.name, nx, ny + r + 15);
    c.font = '15px Tajawal'; c.fillStyle = col;
    c.fillText(typeNames[n.type], nx, ny + r + 28);
  });

  // Legend
  c.fillStyle = 'rgba(0,0,0,0.5)'; c.beginPath(); c.roundRect(10, 10, 150, 80, 6); c.fill();
  c.font = 'bold 15px Tajawal'; c.textAlign = 'right';
  [['🟢 منتِج', '#2DC653'], ['🔵 مستهلك أول', '#00B4D8'], ['🟠 مستهلك ثانٍ', '#F4A522'], ['🔴 مستهلك القمة', '#E63946']].forEach(([txt,col],i) => {
    c.fillStyle = col; c.fillText(txt, 155, 28+i*16);
  });

  animFrame = requestAnimationFrame(()=>{try{drawFoodWeb()}catch(e){console.error("SIM ERR:",e)}});
}

// ===== 7-4: DECOMPOSER - FRUIT DECAY =====
function simDecomposer() {
  // Matches textbook p.20-21 Activity 4-7: Observe fruit decomposition
  simState = {
    t: 0, day: 0, playing: true, speed: 1,
    fruit: 'orange', // apple, orange, mango
    stages: ['يوم ١', 'يوم ٣', 'يوم ٦', 'يوم ٩', 'يوم ١٢'],
    observations: {
      orange: ['ثمرة طازجة، لون برتقالي زاهٍ، لا نمو فطري', 'بداية ظهور بقع خضراء صغيرة من الفطريات', 'انتشار الفطريات، تليّن الجلد وتغيّر اللون', 'تحلل واضح، ظهور بكتيريا، رائحة تغيّرت', 'تحلل شبه كامل، تعود العناصر للبيئة 🌱'],
      apple: ['تفاحة طازجة، جلد أملس ولامع', 'بداية تغير اللون وظهور بقع بنية', 'تعمّق التحلل، نمو فطري واضح', 'اسودّت مناطق واسعة، ظهرت رائحة التخمر', 'تحلل كامل تقريباً، تحوّلت لسماد عضوي 🌱'],
      mango: ['مانجو طازجة، رائحة عطرة، لون ذهبي', 'بداية تليّن المناطق الطرية', 'انتشار الفطريات السوداء، تسييل الأنسجة', 'تحلل سريع بسبب ارتفاع السكر', 'اكتمل التحلل — عناصر مغذّية للتربة 🌱'],
    }
  };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🍊 نشاط 4-7: تحلُّل الثمرة</div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">اختَر الثمرة:</div>
      <div style="display:flex;gap:6px;margin-top:4px">
        <button class="ctrl-btn" id="fruitApple" style="flex:1">🍎 تفاحة</button>
        <button class="ctrl-btn" id="fruitOrange" style="flex:1">🍊 برتقالة</button>
        <button class="ctrl-btn" id="fruitMango" style="flex:1">🥭 مانجو</button>
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">اليوم: <span id="dayVal" style="color:#F4A522;font-weight:bold">١</span></div>
      <input type="range" id="daySlider" min="0" max="4" value="0" step="1">
    </div>
    <div class="ctrl-section">
      <button class="ctrl-btn play" id="decPlay">▶ تشغيل تلقائي</button>
    </div>
    <div class="info-box" id="obsBox">اضغط تشغيل أو حرّك المنزلق لمشاهدة التحلل</div>
    <div class="q-box">
      <div style="font-size:15px;color:#F4C870;margin-bottom:6px">﴿ وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ ﴾ الأنبياء:٣٠</div>
      <strong>❓ سؤال الكتاب (ص21):</strong> ما نوع الكائنات المُحلِّلة التي نمت على ثمرتك؟
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button><div class="q-ans-panel">الفطريّات (العفن) والبكتيريا — تحلّل المادة العضويّة وتُعيد العناصر الغذائيّة إلى التربة.</div>
    </div>
  `);

  btn('fruitApple', () => { simState.fruit = 'apple'; simState.day = 0; document.getElementById('daySlider').value = 0; updateDecompObs(); });
  btn('fruitOrange', () => { simState.fruit = 'orange'; simState.day = 0; document.getElementById('daySlider').value = 0; updateDecompObs(); });
  btn('fruitMango', () => { simState.fruit = 'mango'; simState.day = 0; document.getElementById('daySlider').value = 0; updateDecompObs(); });
  btn('decPlay', () => {
    simState.playing = !simState.playing;
    document.getElementById('decPlay').textContent = simState.playing ? '⏸ إيقاف' : '▶ تشغيل تلقائي';
  });
  sl('daySlider', function() {
    simState.day = +this.value;
    simState.playing = false;
    document.getElementById('decPlay').textContent = '▶ تشغيل تلقائي';
    updateDecompObs();
  });

  function updateDecompObs() {
    const obs = simState.observations[simState.fruit][simState.day];
    const dayNames = ['١', '٣', '٦', '٩', '١٢'];
    document.getElementById('dayVal').textContent = dayNames[simState.day];
    document.getElementById('obsBox').innerHTML = `<strong>اليوم ${dayNames[simState.day]}:</strong> ${obs}`;
    document.getElementById('daySlider').value = simState.day;
  }

  simState.updateObs = updateDecompObs;
  updateDecompObs();
  drawDecomposer();
}

function drawDecomposer() {
  if (currentSim !== 'decomposer') return;
  const c = ctx(), w = W(), h = H();
  simState.t = (simState.t || 0) + 1;
  const t = simState.t;

  // Auto advance days
  if (simState.playing && t % 80 === 0 && simState.day < 4) {
    simState.day++;
    if (simState.updateObs) simState.updateObs();
  }

  const dec = simState.day / 4; // 0 to 1

  // Background - lab/petri dish look
  c.fillStyle = '#1A1408'; c.fillRect(0, 0, w, h);

  // Dish/plate
  c.fillStyle = '#F5F0E8';
  c.beginPath(); c.arc(w/2, h*0.48, h*0.4, 0, Math.PI*2); c.fill();
  c.strokeStyle = '#D4C8A8'; c.lineWidth = 3; c.stroke();

  // Plate shadow/rim
  c.strokeStyle = '#C8B890'; c.lineWidth = 6; c.globalAlpha = 0.3;
  c.beginPath(); c.arc(w/2 + 4, h*0.48 + 4, h*0.4, 0, Math.PI*2); c.stroke();
  c.globalAlpha = 1;

  const fx = w/2, fy = h*0.47;
  const fruitEmoji = { apple:'🍎', orange:'🍊', mango:'🥭' }[simState.fruit];
  const fruitColors = {
    apple: { base:'#CC3333', dark:'#882222', mold:'#226622' },
    orange: { base:'#E87020', dark:'#A04810', mold:'#228844' },
    mango: { base:'#F4B820', dark:'#C08010', mold:'#885522' }
  }[simState.fruit];

  const radius = Math.min(w, h) * 0.22;

  // Draw the fruit body
  const col = c.createRadialGradient(fx - radius*0.3, fy - radius*0.3, radius*0.1, fx, fy, radius);
  col.addColorStop(0, fruitColors.base);
  col.addColorStop(0.7, fruitColors.dark);
  col.addColorStop(1, '#111');
  c.fillStyle = col;
  c.beginPath(); c.arc(fx, fy, radius * (1 - dec * 0.18), 0, Math.PI*2); c.fill();

  // Mold spots growing with decay
  if (dec > 0.1) {
    const numSpots = Math.floor(dec * 20);
    for (let i = 0; i < numSpots; i++) {
      const angle = (i / numSpots) * Math.PI * 2 + i * 0.7;
      const dist = radius * (0.2 + Math.sin(i * 137) * 0.5);
      const sx = fx + Math.cos(angle) * dist;
      const sy = fy + Math.sin(angle) * dist;
      const sr = 4 + dec * 12 + Math.sin(i) * 3;
      c.beginPath(); c.arc(sx, sy, sr, 0, Math.PI*2);
      c.fillStyle = fruitColors.mold + (dec > 0.5 ? 'DD' : '88');
      c.fill();

      // Fungal hyphae
      if (dec > 0.3) {
        c.strokeStyle = 'rgba(200,200,255,0.3)'; c.lineWidth = 0.5;
        for (let j=0; j<4; j++) {
          const ha = angle + j * 0.5;
          c.beginPath(); c.moveTo(sx, sy);
          c.lineTo(sx + Math.cos(ha) * (dec * 20), sy + Math.sin(ha) * (dec * 20));
          c.stroke();
        }
      }
    }
  }

  // Bacteria (small dots) at high decay
  if (dec > 0.5) {
    const bCount = Math.floor(dec * 40);
    for (let i=0; i<bCount; i++) {
      const bangle = Math.random()*Math.PI*2;
      const bdist = Math.random() * radius;
      c.beginPath(); c.arc(fx + Math.cos(bangle)*bdist, fy + Math.sin(bangle)*bdist, 1.5, 0, Math.PI*2);
      c.fillStyle = `hsl(${120+i*8},70%,60%)`; c.fill();
    }
  }

  // Day label with progress
  const dayNames = ['اليوم ١', 'اليوم ٣', 'اليوم ٦', 'اليوم ٩', 'اليوم ١٢'];
  c.fillStyle = 'rgba(0,0,0,0.6)'; c.beginPath(); c.roundRect(w*0.1, h*0.04, w*0.8, 30, 6); c.fill();
  c.fillStyle = dec < 0.4 ? '#2DC653' : dec < 0.8 ? '#F4A522' : '#E63946';
  c.font = 'bold 17px Tajawal'; c.textAlign = 'center';
  c.fillText(dayNames[simState.day], w/2, h*0.04 + 20);

  // Progress dots
  [0,1,2,3,4].forEach(i => {
    c.beginPath(); c.arc(w*0.25 + i*w*0.125, h*0.88, i <= simState.day ? 7 : 4, 0, Math.PI*2);
    c.fillStyle = i <= simState.day ? (dec < 0.4 ? '#2DC653' : dec < 0.8 ? '#F4A522' : '#E63946') : 'rgba(255,255,255,0.2)';
    c.fill();
    c.fillStyle = 'rgba(255,255,255,0.6)'; c.font = '14px Tajawal'; c.textAlign = 'center';
    c.fillText(['١','٣','٦','٩','١٢'][i], w*0.25 + i*w*0.125, h*0.88 + 20);
  });

  // Nutrients label at full decay
  if (dec >= 0.9) {
    c.fillStyle = '#2DC653'; c.font = 'bold 16px Tajawal'; c.textAlign = 'center';
    c.fillText('⬆ عناصر مغذّية تعود للتربة 🌱', w/2, h*0.82);
  }

  dataDisplay(true, [
    ['الثمرة', fruitEmoji + ' ' + {apple:'تفاحة', orange:'برتقالة', mango:'مانجو'}[simState.fruit]],
    ['اليوم', dayNames[simState.day]],
    ['نسبة التحلل', Math.round(dec*100) + '%'],
    ['الكائنات المُحلِّلة', dec > 0.1 ? (dec > 0.4 ? 'فطريات + بكتيريا' : 'فطريات') : 'لم تبدأ بعد']
  ]);
  animFrame = requestAnimationFrame(()=>{try{drawDecomposer()}catch(e){console.error("SIM ERR:",e)}});
}

// ===== 7-5: HUMAN - FISHING =====
function simHumanFishing() {
  // Matches textbook p.22-23: Hunters and gatherers, overfishing effect
  simState = { t: 0, fishingRate: 3, fishPop: 100, history: [], playing: true };
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🎣 نشاط 5-7: صيد الأسماك</div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-row">
        <div class="ctrl-name">معدل الصيد <span class="ctrl-val" id="fishRateVal">عادي</span></div>
        <input type="range" id="fishRateSlider" min="1" max="5" value="3" step="1">
      </div>
      <div style="display:flex;justify-content:space-between;font-size:14px;color:rgba(255,255,255,0.4);margin-top:2px">
        <span>تقتيري</span><span>عادي</span><span>مفرط جداً</span>
      </div>
    </div>
    <div class="ctrl-section">
      <button class="ctrl-btn play" id="fishPlay">⏸ إيقاف</button>
      <button class="ctrl-btn reset" id="fishReset">↺ إعادة</button>
    </div>
    <div class="info-box">الصيد الجائر (المفرط) يُحرم الكائنات الأخرى التي تتغذى على الأسماك من غذائها. مثل طائر البطريق (المهرج الوفي) في الكتاب ص23.</div>
    <div class="q-box">
      <div style="font-size:15px;color:#F4C870;margin-bottom:6px">﴿ وَهُوَ الَّذِي سَخَّرَ الْبَحْرَ لِتَأْكُلُوا مِنْهُ لَحْمًا طَرِيًّا ﴾ النحل:١٤</div>
      <strong>❓ سؤال الكتاب (ص22):</strong> الصيّادون قبل التاريخ كانوا يقتلون الماموث ويأكلونه. ارسم سلسلة غذائية تبيّن كيف كان الصيّادون يحصلون على الطاقة من الشمس إلى الماموث.
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button><div class="q-ans-panel">شمس ← عشب/نباتات ← ماموث ← صيّاد</div>
    </div>
  `);

  const rateLabels = ['تقتيري جداً', 'تقتيري', 'عادي', 'مفرط', 'مفرط جداً'];
  sl('fishRateSlider', function() {
    simState.fishingRate = +this.value;
    document.getElementById('fishRateVal').textContent = rateLabels[+this.value - 1];
  });
  btn('fishPlay', () => {
    simState.playing = !simState.playing;
    document.getElementById('fishPlay').textContent = simState.playing ? '⏸ إيقاف' : '▶ تشغيل';
  });
  btn('fishReset', () => { simState.fishPop = 100; simState.t = 0; simState.history = []; });
  if (!simState.fishObjs) simState.fishObjs = Array.from({length:40},(_,i) => ({x:Math.random(), y:0.35+Math.random()*0.45, spd:randBetween(0.002,0.007), t:i*8}));
  drawHumanFishing();
}

function drawHumanFishing() {
  if (currentSim !== 'human' || currentTab !== 0) return;
  const c = ctx(), w = W(), h = H();
  if (simState.playing) simState.t++;
  const t = simState.t;
  const rate = simState.fishingRate;

  // Population dynamics
  if (simState.playing && t % 25 === 0) {
    const growth = simState.fishPop * 0.06 * (1 - simState.fishPop / 130);
    const loss = simState.fishPop * (rate / 100) * 1.2;
    simState.fishPop = Math.max(0, Math.min(130, simState.fishPop + growth - loss));
    simState.history.push(Math.round(simState.fishPop));
    if (simState.history.length > 40) simState.history.shift();
  }

  // Sky
  const sky = c.createLinearGradient(0,0,0,h*0.28);
  sky.addColorStop(0,'#1A3A5A'); sky.addColorStop(1,'#2A5A8A');
  c.fillStyle = sky; c.fillRect(0,0,w,h*0.28);

  // Sea
  const sea = c.createLinearGradient(0,h*0.28,0,h);
  sea.addColorStop(0,'#0A4A7A'); sea.addColorStop(1,'#030F22');
  c.fillStyle = sea; c.fillRect(0,h*0.28,w,h*0.72);

  // Waves
  c.strokeStyle='rgba(100,200,255,0.15)'; c.lineWidth=2;
  for (let i=0; i<3; i++) {
    c.beginPath();
    for (let x=0; x<w; x+=5) {
      const y = h*0.28 + Math.sin((x/70+t/35+i*0.7))*5 + i*4;
      x===0 ? c.moveTo(x,y) : c.lineTo(x,y);
    }
    c.stroke();
  }

  // Fishing boat (bigger/more boats with higher rate)
  const numBoats = Math.ceil(rate / 2);
  for (let b=0; b<numBoats; b++) {
    const bx = w*(0.3 + b*0.25) + Math.sin(t/70+b)*w*0.05;
    const by = h*0.27;
    c.fillStyle = '#8B6914';
    c.beginPath(); c.moveTo(bx-30,by); c.lineTo(bx+30,by); c.lineTo(bx+22,by+15); c.lineTo(bx-22,by+15); c.closePath(); c.fill();
    c.fillStyle = '#5A4010'; c.fillRect(bx-6,by-20,10,20);
    if (rate >= 3) {
      c.strokeStyle=`rgba(200,200,100,${(rate/5)*0.7})`; c.lineWidth=1; c.setLineDash([3,3]);
      c.beginPath(); c.moveTo(bx+22,by+6); c.lineTo(bx+50+(rate-3)*15, h*0.55); c.lineTo(bx-10, h*0.55); c.closePath(); c.stroke();
      c.setLineDash([]);
    }
    c.font='17px serif'; c.textAlign='center'; c.fillText('🚢', bx, by-2);
  }

  // Fish
  const visible = Math.max(0, Math.floor(simState.fishObjs.length * (simState.fishPop / 130)));
  simState.fishObjs.forEach((f, i) => {
    f.t++; f.x = (f.x + f.spd) % 1;
    if (i >= visible) return;
    const fx = w*f.x, fy = h*(f.y + Math.sin(f.t/28)*0.025);
    c.font='17px serif'; c.textAlign='center'; c.fillText('🐟', fx, fy);
  });

  // Population graph (mini)
  if (simState.history.length > 2) {
    const gx = 10, gy = h*0.82, gw = w*0.35, gh = h*0.14;
    c.fillStyle='rgba(0,0,0,0.4)'; c.beginPath(); c.roundRect(gx,gy,gw,gh,4); c.fill();
    c.strokeStyle='rgba(255,255,255,0.15)'; c.lineWidth=1; c.strokeRect(gx,gy,gw,gh);
    const maxPop = 130;
    c.strokeStyle = simState.fishPop > 60 ? '#2DC653' : simState.fishPop > 25 ? '#F4A522' : '#E63946';
    c.lineWidth=2; c.beginPath();
    simState.history.forEach((v,i) => {
      const px = gx + (i/simState.history.length)*gw;
      const py = gy + gh - (v/maxPop)*gh;
      i===0 ? c.moveTo(px,py) : c.lineTo(px,py);
    });
    c.stroke();
    c.fillStyle='rgba(255,255,255,0.5)'; c.font='14px Tajawal'; c.textAlign='center';
    c.fillText('تغيّر أعداد الأسماك', gx+gw/2, gy+gh+12);
  }

  // Status
  const health = simState.fishPop / 130;
  const statusCol = health > 0.5 ? '#2DC653' : health > 0.2 ? '#F4A522' : '#E63946';
  const statusTxt = health > 0.5 ? '✅ مستقر' : health > 0.2 ? '⚠️ تحت الضغط' : '🚨 خطر الانقراض!';
  c.fillStyle = statusCol; c.font = 'bold 16px Tajawal'; c.textAlign = 'center';
  c.fillText(statusTxt + ' — أعداد الأسماك: ' + Math.round(simState.fishPop), w/2, h*0.96);

  dataDisplay(true, [
    ['معدل الصيد', ['تقتيري جداً','تقتيري','عادي','مفرط','مفرط جداً'][rate-1]],
    ['أعداد الأسماك', Math.round(simState.fishPop) + ''],
    ['الحالة', health>0.5?'مستقر':health>0.2?'تحت ضغط':'خطر']
  ]);
  animFrame = requestAnimationFrame(()=>{try{drawHumanFishing()}catch(e){console.error("SIM ERR:",e)}});
}

// ===== 7-5: HUMAN - FARMING =====
function simHumanFarming() {
  // Matches textbook p.22-23: Farmers, clearing trees, effect on food chains
  simState = { t: 0, treesCleared: 0, farmSize: 50 };
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌾 نشاط 5-7: الزراعة والأشجار</div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-row">
        <div class="ctrl-name">إزالة الأشجار <span class="ctrl-val" id="clearVal">0%</span></div>
        <input type="range" id="clearSlider" min="0" max="100" value="0">
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-row">
        <div class="ctrl-name">حجم المزرعة <span class="ctrl-val" id="farmVal">50%</span></div>
        <input type="range" id="farmSlider" min="10" max="90" value="50">
      </div>
    </div>
    <div class="info-box">عندما تُزال الأشجار والنباتات لزراعة المحاصيل، تفقد الحيوانات التي اعتادت العيش هناك موطنها ومصدر غذائها. هذا يُضرّ بالسلاسل الغذائية.</div>
    <div class="q-box"><strong>❓ أسئلة الكتاب (ص23):</strong><br>أ- اكتب قائمة من ثلاثة محاصيل تُزرع في المنطقة التي تعيش فيها.<br>ب- صِف طريقة واحدة أثّرت بها الزراعة سلباً على سلسلة غذائية.
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">أ- أمثلة عُمانيّة: الليمون، التمر، الموز، الطماطم.<br>ب- الزراعة تُدمّر الموطن الطبيعي وتُقلّل أعداد الكائنات الوحشيّة.</div>
  </div>
  `);

  sl('clearSlider', function() {
    simState.treesCleared = +this.value;
    document.getElementById('clearVal').textContent = this.value + '%';
  });
  sl('farmSlider', function() {
    simState.farmSize = +this.value;
    document.getElementById('farmVal').textContent = this.value + '%';
  });
  drawHumanFarming();
}

function drawHumanFarming() {
  if (currentSim !== 'human' || currentTab !== 1) return;
  const c = ctx(), w = W(), h = H();
  simState.t = (simState.t || 0) + 1;
  const t = simState.t;
  const cleared = simState.treesCleared / 100;
  const farmSize = simState.farmSize / 100;

  // Sky
  const sky = c.createLinearGradient(0,0,0,h*0.38);
  sky.addColorStop(0, `rgb(${lerp(100,60,cleared)},${lerp(160,100,cleared)},${lerp(200,120,cleared)})`);
  sky.addColorStop(1, `rgb(${lerp(150,100,cleared)},${lerp(200,140,cleared)},${lerp(180,100,cleared)})`);
  c.fillStyle = sky; c.fillRect(0,0,w,h*0.38);

  // Ground division: forest | farm
  const farmBoundary = w * (1 - farmSize);

  // Forest side (left)
  if (cleared < 1) {
    c.fillStyle = `rgb(${lerp(30,60,cleared)},${lerp(80,50,cleared)},${lerp(20,10,cleared)})`;
    c.fillRect(0, h*0.38, farmBoundary * (1-cleared), h*0.62);

    // Trees (disappear as cleared increases)
    const treeCount = Math.floor((1-cleared) * 8);
    for (let i=0; i<treeCount; i++) {
      const tx = farmBoundary * (1-cleared) * (0.05 + i*0.12);
      const th = 60 + Math.sin(i)*20;
      c.fillStyle = `rgb(${lerp(60,80,cleared)},${lerp(40,30,cleared)},15)`;
      c.fillRect(tx-4, h*0.55, 8, th);
      c.fillStyle = `rgb(${lerp(30,50,cleared)},${lerp(120,80,cleared)},${lerp(25,15,cleared)})`;
      c.beginPath(); c.arc(tx, h*0.55, 22+i%3*8, 0, Math.PI*2); c.fill();
    }
  }

  // Farm side (right)
  c.fillStyle = `rgb(${lerp(70,50,cleared)},${lerp(100,70,cleared)},${lerp(20,10,cleared)})`;
  c.fillRect(farmBoundary*(1-cleared), h*0.38, w, h*0.62);

  // Crops
  const cropCount = Math.floor(farmSize * 16);
  for (let i=0; i<cropCount; i++) {
    const cx = farmBoundary*(1-cleared) + 20 + i*(w-farmBoundary*(1-cleared)-40)/cropCount;
    const stalkH = 50 + Math.sin(i+t/40)*8;
    c.strokeStyle = '#5A8A2A'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(cx, h*0.7); c.lineTo(cx, h*0.7-stalkH); c.stroke();
    c.font='18px serif'; c.textAlign='center'; c.fillText('🌾', cx, h*0.7-stalkH);
  }

  // Animals - disappear as cleared increases
  const wildAnimals = [
    { emoji:'🦅', baseX:0.1, y:0.25, show: cleared < 0.8 },
    { emoji:'🐦', baseX:0.2, y:0.3, show: cleared < 0.6 },
    { emoji:'🦋', baseX:0.15, y:0.5, show: cleared < 0.5 },
    { emoji:'🐇', baseX:0.12, y:0.62, show: cleared < 0.4 },
  ];

  wildAnimals.forEach((a, i) => {
    if (!a.show) return;
    const ax = w * (a.baseX + Math.sin(t/40+i)*0.05);
    const ay = h * (a.y + Math.cos(t/35+i)*0.03);
    c.globalAlpha = 1 - cleared;
    c.font='22px serif'; c.textAlign='center'; c.fillText(a.emoji, ax, ay);
    c.globalAlpha = 1;
  });

  // Deforestation warning
  if (cleared > 0.5) {
    c.fillStyle = `rgba(230,57,70,${(cleared-0.5)*0.8})`;
    c.font = 'bold 16px Tajawal'; c.textAlign = 'center';
    c.fillText('⚠️ الحيوانات تفقد موطنها وتختفي!', w/2, h*0.35);
  }

  // Stump (cleared trees)
  if (cleared > 0.1) {
    const stumpCount = Math.floor(cleared * 5);
    for (let i=0; i<stumpCount; i++) {
      const sx = farmBoundary * (1-cleared) + 10 + i*25;
      if (sx < w * 0.3) {
        c.fillStyle = '#8B5A2B'; c.fillRect(sx-6, h*0.62, 12, 18);
        c.fillStyle = '#A07040'; c.beginPath(); c.ellipse(sx, h*0.62, 9, 5, 0, 0, Math.PI*2); c.fill();
      }
    }
  }

  // Stats
  const animals = wildAnimals.filter(a => a.show).length;
  c.fillStyle = 'rgba(0,0,0,0.5)'; c.beginPath(); c.roundRect(w*0.55, h*0.78, w*0.42, 70, 6); c.fill();
  c.font = 'bold 16px Tajawal'; c.fillStyle = '#fff'; c.textAlign = 'right';
  c.fillText('🌳 الأشجار المتبقية: ' + Math.round((1-cleared)*100) + '%', w*0.94, h*0.82);
  c.fillStyle = animals > 2 ? '#2DC653' : animals > 1 ? '#F4A522' : '#E63946';
  c.fillText('🦅 الحيوانات البرية: ' + animals + '/4', w*0.94, h*0.82+18);
  c.fillStyle = '#00B4D8';
  c.fillText('🌾 المحاصيل المزروعة: ' + cropCount, w*0.94, h*0.82+36);

  dataDisplay(true, [
    ['إزالة الأشجار', Math.round(cleared*100)+'%'],
    ['الأشجار المتبقية', Math.round((1-cleared)*100)+'%'],
    ['الحيوانات', animals + '/4 باقية'],
    ['التأثير', cleared > 0.5 ? 'خطير على السلاسل' : cleared > 0.2 ? 'ملحوظ' : 'محدود']
  ]);
  animFrame = requestAnimationFrame(()=>{try{drawHumanFarming()}catch(e){console.error("SIM ERR:",e)}});
}

// ===== 7-6: WATER POLLUTION =====
function simWaterPollution() {
  // Matches textbook p.24-25: Water pollution
  simState = {
    t: 0, pollution: 0,
    fish: Array.from({length:20},(_,i)=>({x:Math.random(), y:0.4+Math.random()*0.38, spd:randBetween(0.003,0.006), t:i*9}))
  };
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">💧 نشاط 6-7: تلوُّث الماء</div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-row">
        <div class="ctrl-name">مياه الصرف الصحي <span class="ctrl-val" id="pollutionVal">0%</span></div>
        <input type="range" id="pollutionSlider" min="0" max="100" value="0">
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label" style="margin-bottom:6px">سيناريوهات سريعة:</div>
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        <button class="ctrl-btn" id="scenClean" style="flex:1;font-size:15px;background:rgba(45,198,83,0.15);border-color:rgba(45,198,83,0.4);color:#2DC653">💚 نظيف</button>
        <button class="ctrl-btn" id="scenMild" style="flex:1;font-size:15px;background:rgba(244,165,34,0.15);border-color:rgba(244,165,34,0.4);color:#F4A522">⚠️ خفيف</button>
        <button class="ctrl-btn" id="scenSevere" style="flex:1;font-size:15px;background:rgba(230,57,70,0.15);border-color:rgba(230,57,70,0.4);color:#E63946">☠️ شديد</button>
      </div>
    </div>
    <div class="ctrl-section">
      <button class="ctrl-btn reset" id="pollReset">↺ تنظيف الماء</button>
    </div>
    <div class="info-box" id="pollInfo">بعض أنشطة الإنسان تُضيف موادّ ضارة للماء. حرّك المنزلق لترى التأثير.</div>
    <div class="q-box"><strong>❓ سؤال الكتاب (ص24):</strong> لماذا يضرّ التلوث بالكائنات الحية في الماء؟
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
    <div class="q-ans-panel">لأن المواد السامّة تنتقل عبر السلسلة الغذائية وتتراكم في أجسام الكائنات، مما يُسبّب الأمراض أو الموت.</div>
  </div>
  `);
  const updatePollInfo = () => {
    const p = simState.pollution;
    const el = document.getElementById('pollInfo');
    if (!el) return;
    if (p < 20) el.innerHTML = '✅ الماء نظيف — الأسماك والنباتات بصحة جيدة';
    else if (p < 50) el.innerHTML = '⚠️ تلوث خفيف — بعض الأسماك تبدأ بالاختفاء';
    else if (p < 80) el.innerHTML = '🔴 تلوث شديد — معظم الكائنات لا تستطيع البقاء!';
    else el.innerHTML = '☠️ تلوث حرج — الماء غير صالح للحياة أو للشرب!';
  };
  sl('pollutionSlider', function() {
    simState.pollution = +this.value;
    document.getElementById('pollutionVal').textContent = this.value + '%';
    updatePollInfo();
  });
  btn('scenClean', () => { simState.pollution=0; document.getElementById('pollutionSlider').value=0; document.getElementById('pollutionVal').textContent='0%'; updatePollInfo(); });
  btn('scenMild', () => { simState.pollution=40; document.getElementById('pollutionSlider').value=40; document.getElementById('pollutionVal').textContent='40%'; updatePollInfo(); });
  btn('scenSevere', () => { simState.pollution=90; document.getElementById('pollutionSlider').value=90; document.getElementById('pollutionVal').textContent='90%'; updatePollInfo(); });
  btn('pollReset', () => { simState.pollution=0; document.getElementById('pollutionSlider').value=0; document.getElementById('pollutionVal').textContent='0%'; updatePollInfo(); });
  drawWaterPollution();
}

function drawWaterPollution() {
  if (currentSim !== 'pollution' || currentTab !== 0) return;
  const c = ctx(), w = W(), h = H();
  simState.t = (simState.t || 0) + 1;
  const t = simState.t;
  const poll = simState.pollution / 100;

  // Sky
  const sky = c.createLinearGradient(0,0,0,h*0.3);
  sky.addColorStop(0, `rgb(${lerp(80,50,poll)},${lerp(140,100,poll)},${lerp(180,120,poll)})`);
  sky.addColorStop(1, `rgb(${lerp(100,70,poll)},${lerp(160,110,poll)},${lerp(200,130,poll)})`);
  c.fillStyle = sky; c.fillRect(0,0,w,h*0.3);

  // Water
  const waterCol = c.createLinearGradient(0,h*0.3,0,h);
  waterCol.addColorStop(0, `rgb(${lerp(10,60,poll)},${lerp(100,80,poll)},${lerp(160,50,poll)})`);
  waterCol.addColorStop(1, `rgb(${lerp(5,30,poll)},${lerp(50,40,poll)},${lerp(80,20,poll)})`);
  c.fillStyle = waterCol; c.fillRect(0,h*0.3,w,h*0.7);

  // Waves
  c.strokeStyle=`rgba(${lerp(100,80,poll)},${lerp(200,150,poll)},${lerp(255,100,poll)},0.2)`; c.lineWidth=2;
  for (let i=0; i<3; i++) {
    c.beginPath();
    for (let x=0; x<w; x+=5) {
      const y = h*0.3 + Math.sin((x/80+t/40+i*0.8))*4 + i*5;
      x===0 ? c.moveTo(x,y) : c.lineTo(x,y);
    }
    c.stroke();
  }

  // Pollution source (sewage pipe)
  if (poll > 0.05) {
    c.fillStyle = '#666';
    c.beginPath(); c.roundRect(w*0.7-15, h*0.15, 30, h*0.2, [15,15,0,0]); c.fill();
    // Sewage flow
    const flowAlpha = poll * 0.8;
    c.fillStyle = `rgba(100,80,20,${flowAlpha})`;
    c.beginPath(); c.roundRect(w*0.7-8, h*0.3, 16, h*0.15, 4); c.fill();
    // Pollution spreading
    for (let i=0; i<Math.floor(poll*20); i++) {
      const px = w*0.7 + Math.sin(i*1.7+t/15)*w*0.3;
      const py = h*0.35 + (i/20)*h*0.4 + Math.cos(i+t/20)*h*0.05;
      c.beginPath(); c.arc(px, py, 3+poll*4, 0, Math.PI*2);
      c.fillStyle = `rgba(${lerp(60,120,poll)},${lerp(80,60,poll)},0,${poll*0.5})`; c.fill();
    }
    c.fillStyle='rgba(255,255,255,0.5)'; c.font='15px Tajawal'; c.textAlign='center';
    c.fillText('مياه صرف غير مُعالَجة', w*0.7, h*0.13);
  }

  // Factory smoke (additional pollution source)
  if (poll > 0.4) {
    c.fillStyle = '#555'; c.fillRect(w*0.15-10, h*0.1, 20, h*0.2);
    c.fillStyle = '#444'; c.fillRect(w*0.15-14, h*0.08, 28, 15);
    // Smoke
    for (let i=0; i<3; i++) {
      c.globalAlpha = (poll-0.4) * 0.5;
      c.beginPath(); c.arc(w*0.15 + Math.sin(t/20+i)*15, h*0.08 - i*20, 12+i*5, 0, Math.PI*2);
      c.fillStyle = '#888'; c.fill();
      c.globalAlpha = 1;
    }
  }

  // Fish (fewer as pollution increases)
  const aliveFish = Math.max(0, Math.floor(simState.fish.length * (1 - poll * 1.2)));
  simState.fish.forEach((f, i) => {
    f.t++; f.x = (f.x + f.spd * (1-poll*0.7)) % 1;
    if (i >= aliveFish) {
      // Dead fish floating
      if (i < aliveFish + 4 && poll > 0.4) {
        c.font='17px serif'; c.textAlign='center'; c.globalAlpha=0.4;
        c.fillText('🐟', w*f.x, h*(f.y - 0.05));
        c.globalAlpha=1;
        c.fillStyle='#E63946'; c.font='15px serif'; c.fillText('✕', w*f.x, h*(f.y-0.05)-14);
      }
      return;
    }
    c.font='17px serif'; c.textAlign='center';
    c.fillText('🐟', w*f.x, h*(f.y + Math.sin(f.t/25)*0.025));
  });

  // Seaweed/plants (disappear with pollution)
  if (poll < 0.7) {
    [0.1, 0.25, 0.45, 0.6, 0.8].forEach((px, i) => {
      if (i/5 < poll) return;
      c.strokeStyle = `rgba(30,${lerp(140,60,poll)},40,${1-poll})`;
      c.lineWidth = 2;
      c.beginPath(); c.moveTo(w*px, h*0.97);
      for (let j=0; j<40; j+=5) {
        c.lineTo(w*px + Math.sin(t/20+j*0.2+i)*6, h*0.97-j);
      }
      c.stroke();
    });
  }

  // Pollution level indicator
  const pollColor = poll<0.3?'#2DC653':poll<0.6?'#F4A522':'#E63946';
  const pollTxt = poll<0.1?'ماء نظيف 💧':poll<0.4?'تلوث خفيف':'تلوث شديد ☠️';
  c.fillStyle=pollColor; c.font='bold 16px Tajawal'; c.textAlign='center';
  c.fillText(pollTxt, w/2, h*0.97);

  dataDisplay(true,[
    ['مستوى التلوث', Math.round(poll*100)+'%'],
    ['الأسماك المتبقية', aliveFish + '/' + simState.fish.length],
    ['النباتات المائية', poll<0.3?'سليمة':poll<0.6?'تأثرت':'اختفت'],
    ['الحالة', poll<0.1?'نظيف':poll<0.4?'ملوّث قليلاً':poll<0.7?'ملوّث':'خطر شديد']
  ]);
  animFrame = requestAnimationFrame(()=>{try{drawWaterPollution()}catch(e){console.error("SIM ERR:",e)}});
}

// ===== 7-6: AIR POLLUTION =====
function simAirPollution() {
  // Matches textbook p.24-25: Air pollution, CO2, acid rain activity
  simState = { t: 0, co2: 0, sulfur: 0, stage: 'normal' };
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌫️ درس 7-6: تلوُّث الهواء</div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-row">
        <div class="ctrl-name">ثاني أكسيد الكربون CO₂ <span class="ctrl-val" id="co2Val">0%</span></div>
        <input type="range" id="co2Slider" min="0" max="100" value="0">
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-row">
        <div class="ctrl-name">ثاني أكسيد الكبريت SO₂ <span class="ctrl-val" id="sulfurVal">0%</span></div>
        <input type="range" id="sulfurSlider" min="0" max="100" value="0">
      </div>
    </div>
    <div class="ctrl-section">
      <button class="ctrl-btn reset" id="airReset">↺ هواء نظيف</button>
    </div>
    <div class="info-box" id="airInfo">حرّك المنزلقَين لمشاهدة تأثير التلوث</div>
    <div class="q-box">
      <div style="font-size:15px;color:#F4C870;margin-bottom:6px">﴿ ظَهَرَ الْفَسَادُ فِي الْبَرِّ وَالْبَحْرِ بِمَا كَسَبَتْ أَيْدِي النَّاسِ ﴾ الروم:٤١</div>
      <strong>❓ نشاط 6-7 (ص25):</strong> كيف يؤثّر المطر الحمضيّ على شتلات الفاصوليا؟ جرّب إضافة حمض الكبريت المُخفَّف لأصيص وماء عادي لآخر.
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button><div class="q-ans-panel">شتلة الحمض: تصفرّ أوراقها وتذبل وتنمو ببطء. شتلة الماء العادي: تنمو بشكل طبيعي — لأن الحمض يُتلف الجذور ويمنع امتصاص العناصر الغذائيّة.</div>
    </div>
  `);

  sl('co2Slider', function() {
    simState.co2 = +this.value;
    document.getElementById('co2Val').textContent = this.value + '%';
    updateAirInfo();
  });
  sl('sulfurSlider', function() {
    simState.sulfur = +this.value;
    document.getElementById('sulfurVal').textContent = this.value + '%';
    updateAirInfo();
  });
  btn('airReset', () => {
    simState.co2 = 0; simState.sulfur = 0;
    document.getElementById('co2Slider').value = 0; document.getElementById('sulfurSlider').value = 0;
    document.getElementById('co2Val').textContent = '0%'; document.getElementById('sulfurVal').textContent = '0%';
    updateAirInfo();
  });

  function updateAirInfo() {
    const co2 = simState.co2, so2 = simState.sulfur;
    let msg = '';
    if (co2 > 60) msg += '🌡️ تراكم CO₂ يمنع تسرُّب الحرارة → ارتفاع درجة حرارة الأرض! ';
    if (so2 > 30) msg += '🌧️ SO₂ يذوب في مياه الأمطار → مطر حمضيّ يضرّ الأشجار والأنهار! ';
    if (co2 < 30 && so2 < 20) msg = 'الهواء نظيف — الكائنات الحية بخير 🌿';
    document.getElementById('airInfo').innerHTML = msg || 'تلوث خفيف — راقب التأثيرات';
  }
  updateAirInfo();
  drawAirPollution();
}

function drawAirPollution() {
  if (currentSim !== 'pollution' || currentTab !== 1) return;
  const c = ctx(), w = W(), h = H();
  simState.t = (simState.t || 0) + 1;
  const t = simState.t;
  const co2 = simState.co2 / 100;
  const so2 = simState.sulfur / 100;
  const totalPoll = (co2 + so2) / 2;

  // Sky (darkens with pollution)
  const sky = c.createLinearGradient(0,0,0,h*0.6);
  sky.addColorStop(0, `rgb(${lerp(70,30,totalPoll)},${lerp(130,90,totalPoll)},${lerp(190,100,totalPoll)})`);
  sky.addColorStop(1, `rgb(${lerp(120,70,totalPoll)},${lerp(170,110,totalPoll)},${lerp(220,120,totalPoll)})`);
  c.fillStyle = sky; c.fillRect(0,0,w,h*0.6);

  // Sun (dimmer with pollution)
  c.save(); c.globalAlpha = 1 - totalPoll * 0.7;
  c.shadowBlur=30; c.shadowColor='#FFD700';
  c.fillStyle='#FFD700'; c.beginPath(); c.arc(w*0.15,h*0.12,22,0,Math.PI*2); c.fill();
  c.restore();

  // CO2 greenhouse effect visualization
  if (co2 > 0.2) {
    // Heat trapped
    c.globalAlpha = co2 * 0.3;
    c.fillStyle = 'rgba(255,100,0,0.2)';
    c.fillRect(0, 0, w, h*0.6);
    c.globalAlpha = 1;

    // CO2 molecules floating
    for (let i=0; i<Math.floor(co2*15); i++) {
      const mx = w*(0.1+((i*0.13+t/200)%0.8));
      const my = h*(0.05+Math.sin(t/30+i)*0.1+i*0.04);
      c.fillStyle = 'rgba(255,150,50,0.5)'; c.font='15px Tajawal'; c.textAlign='center';
      c.fillText('CO₂', mx, my);
    }

    // Heat arrows (trapped heat)
    if (co2 > 0.5) {
      c.strokeStyle='rgba(255,100,0,0.4)'; c.lineWidth=2;
      for (let i=0; i<5; i++) {
        const ax = w*(0.15+i*0.18);
        const ay = h * (0.55 + Math.sin(t/20+i)*0.02);
        c.beginPath(); c.moveTo(ax, ay); c.lineTo(ax, ay-30); c.stroke();
        // Arrow bouncing back
        c.beginPath(); c.moveTo(ax, ay-30); c.lineTo(ax, ay-15); c.stroke();
        c.fillStyle='rgba(255,100,0,0.6)'; c.font='15px serif';
        c.fillText('🔥', ax, ay-35);
      }
    }
  }

  // Factories (source of pollution)
  [[0.15, 0.4],[0.45, 0.38],[0.72, 0.42]].forEach(([fx, fy],i) => {
    c.fillStyle='#555'; c.fillRect(w*fx-15, h*fy, 30, h*0.22);
    c.fillStyle='#444'; c.fillRect(w*fx-20, h*fy, 40, 20);
    // Chimneys
    [w*fx-8, w*fx+8].forEach(cx => {
      c.fillStyle='#333'; c.fillRect(cx-4, h*fy-25, 8, 25);
      // Smoke
      for (let s=0; s<4; s++) {
        const sy = h*fy - 25 - s*18 - Math.sin(t/15+s+i)*5;
        const sx = cx + Math.sin(t/20+s+i)*8;
        c.beginPath(); c.arc(sx, sy, 8+s*3, 0, Math.PI*2);
        c.fillStyle = so2 > 0.3
          ? `rgba(${lerp(100,180,so2)},${lerp(100,80,so2)},${lerp(100,50,so2)},${0.4-s*0.08})`
          : `rgba(80,80,80,${0.4-s*0.08})`;
        c.fill();
      }
    });
  });

  // Acid rain
  if (so2 > 0.2) {
    // Acid clouds
    c.fillStyle = `rgba(${lerp(150,200,so2)},${lerp(150,120,so2)},${lerp(150,80,so2)},0.7)`;
    [[0.35,0.12],[0.6,0.08],[0.8,0.14]].forEach(([cx,cy]) => {
      c.beginPath(); c.arc(w*cx,h*cy,25+so2*15,0,Math.PI*2); c.fill();
      c.beginPath(); c.arc(w*cx+22,h*cy+5,18+so2*10,0,Math.PI*2); c.fill();
    });

    // Acid raindrops
    if (!simState.acidDrops) simState.acidDrops = Array.from({length:25},()=>({x:Math.random()*w,y:Math.random()*h*0.4}));
    c.strokeStyle=`rgba(${lerp(100,200,so2)},${lerp(180,100,so2)},0,${so2*0.7})`; c.lineWidth=1.5;
    simState.acidDrops.forEach(d => {
      d.y += 4+so2*3; d.x += 0.5;
      if (d.y > h*0.7) { d.y = 0; d.x = Math.random()*w; }
      c.beginPath(); c.moveTo(d.x,d.y); c.lineTo(d.x+2,d.y+8); c.stroke();
    });
    c.fillStyle=`rgba(255,180,0,${so2*0.7})`; c.font='15px Tajawal'; c.textAlign='center';
    c.fillText('مطر حمضيّ ⚠️', w*0.5, h*0.22);
  }

  // Ground and trees
  c.fillStyle = `rgb(${lerp(40,60,totalPoll)},${lerp(80,50,totalPoll)},${lerp(20,10,totalPoll)})`;
  c.fillRect(0, h*0.72, w, h*0.28);

  // Trees (damaged by acid rain)
  [0.06,0.2,0.82,0.93].forEach((tx,i) => {
    const damage = so2;
    c.fillStyle = `rgb(${lerp(80,100,damage)},${lerp(50,30,damage)},20)`;
    c.fillRect(w*tx-4, h*0.55, 8, h*0.18);
    c.fillStyle = `rgb(${lerp(30,60,damage)},${lerp(120,50,damage)},${lerp(25,10,damage)})`;
    c.beginPath(); c.arc(w*tx, h*0.54, 20+i%2*8, 0, Math.PI*2); c.fill();
    if (damage > 0.5) {
      c.fillStyle='rgba(139,0,0,0.5)'; c.font='15px serif'; c.textAlign='center';
      c.fillText('🍂', w*tx, h*0.46);
    }
  });

  const status = totalPoll<0.2?'هواء نظيف 🌿':totalPoll<0.5?'تلوث متوسط ⚠️':'تلوث شديد ☠️';
  const statusCol = totalPoll<0.2?'#2DC653':totalPoll<0.5?'#F4A522':'#E63946';
  c.fillStyle=statusCol; c.font='bold 16px Tajawal'; c.textAlign='center';
  c.fillText(status, w/2, h*0.97);

  dataDisplay(true,[
    ['ثاني أكسيد الكربون', Math.round(co2*100)+'%'],
    ['ثاني أكسيد الكبريت', Math.round(so2*100)+'%'],
    ['تأثير CO₂', co2>0.5?'احترار الأرض':co2>0.2?'تراكم في الغلاف':'طبيعي'],
    ['المطر الحمضي', so2>0.3?'موجود — يضرّ الأشجار':'لا يوجد']
  ]);
  animFrame = requestAnimationFrame(()=>{try{drawAirPollution()}catch(e){console.error("SIM ERR:",e)}});
}

// ===== 7-7: OZONE =====
function simOzone() {
  // Matches textbook p.26-27: Ozone hole, CFC, 1981-1987-1999 images
  simState = { t: 0, year: 1981, cfcLevel: 10, playing: true };
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌐 درس 7-7: تآكل طبقة الأوزون</div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">السنة: <span id="ozYear" style="color:#F4A522;font-weight:bold">1981</span></div>
      <input type="range" id="yearSlider" min="0" max="2" value="0" step="1">
      <div style="display:flex;justify-content:space-between;font-size:15px;color:rgba(255,255,255,0.5);margin-top:2px">
        <span>1981م</span><span>1987م</span><span>1999م</span>
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">مستوى مركّبات CFC: <span id="cfcVal" style="color:#E63946;font-weight:bold">منخفض</span></div>
      <input type="range" id="cfcSlider" min="0" max="100" value="10">
    </div>
    <div class="ctrl-section">
      <button class="ctrl-btn play" id="ozPlay">▶ تشغيل الزمن</button>
    </div>
    <div class="info-box" id="ozInfo">اختَر السنة لمشاهدة تطوّر ثقب الأوزون فوق القطب الجنوبي</div>
    <div class="q-box">
      <div style="font-size:15px;color:#F4C870;margin-bottom:6px">﴿ وَجَعَلْنَا السَّمَاءَ سَقْفًا مَّحْفُوظًا ﴾ الأنبياء:٣٢</div>
      <strong>❓ أسئلة الكتاب (ص26-27):</strong><br>أ- صِف كيف تغيّرت طبقة الأوزون بين 1981م و1999م.<br>ب- ما الذي تسبَّب في ثقب الأوزون؟<br>ج- ما مركّبات CFC؟
    
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">أ- أصبحت طبقة الأوزون أرقّ بشكل ملحوظ خصوصاً فوق القطب الجنوبي.<br>ب- مركّبات CFC المستخدمة في المبرّدات والعبوات الرذاذيّة.<br>ج- مركّبات الكربون والفلور والكلور (Chlorofluorocarbons).</div>
  </div>
  `);

  const yearData = [
    { year: 1981, holeSize: 0.05, desc: '1981م: الأوزون طبيعي تقريباً، ثقب صغير جداً فوق القطب الجنوبي', color: '#2DC653' },
    { year: 1987, holeSize: 0.28, desc: '1987م: توسّع الثقب بشكل واضح — وكالة أورورا رصدت الزيادة الكبيرة', color: '#F4A522' },
    { year: 1999, holeSize: 0.55, desc: '1999م: الثقب تضاعف — مركّبات CFC تراكمت في الغلاف الجوي', color: '#E63946' },
  ];

  sl('yearSlider', function() {
    const idx = +this.value;
    simState.year = yearData[idx].year;
    simState.yearIdx = idx;
    document.getElementById('ozYear').textContent = yearData[idx].year + 'م';
    document.getElementById('ozInfo').textContent = yearData[idx].desc;
  });
  sl('cfcSlider', function() {
    simState.cfcLevel = +this.value;
    const lv = +this.value;
    document.getElementById('cfcVal').textContent = lv < 30 ? 'منخفض' : lv < 60 ? 'متوسط' : 'عالٍ ⚠️';
  });
  btn('ozPlay', () => {
    simState.playing = !simState.playing;
    document.getElementById('ozPlay').textContent = simState.playing ? '⏸ إيقاف' : '▶ تشغيل الزمن';
  });

  simState.yearData = yearData;
  simState.yearIdx = 0;
  drawOzone();
}

function drawOzone() {
  if (currentSim !== 'ozone') return;
  const c = ctx(), w = W(), h = H();
  simState.t = (simState.t || 0) + 1;
  const t = simState.t;

  // Auto-advance year
  if (simState.playing && t % 120 === 0 && simState.yearIdx < 2) {
    simState.yearIdx++;
    document.getElementById('yearSlider').value = simState.yearIdx;
    const yd = simState.yearData[simState.yearIdx];
    simState.year = yd.year;
    document.getElementById('ozYear').textContent = yd.year + 'م';
    document.getElementById('ozInfo').textContent = yd.desc;
  }

  const yd = simState.yearData[simState.yearIdx] || simState.yearData[0];
  const holeSize = yd.holeSize + simState.cfcLevel / 100 * 0.15;

  // Space background
  const space = c.createRadialGradient(w/2, h/2, 0, w/2, h/2, w*0.7);
  space.addColorStop(0, '#050A1A'); space.addColorStop(1, '#010308');
  c.fillStyle = space; c.fillRect(0,0,w,h);

  // Stars
  if (!simState.stars) simState.stars = Array.from({length:60},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.5+0.3}));
  simState.stars.forEach(s => {
    c.beginPath(); c.arc(s.x,s.y,s.r,0,Math.PI*2);
    c.fillStyle=`rgba(255,255,230,${0.3+Math.sin(t/40+s.x)*0.2})`; c.fill();
  });

  // Earth
  const ex = w/2, ey = h*0.52, er = Math.min(w,h)*0.38;
  const earthGrad = c.createRadialGradient(ex-er*0.3, ey-er*0.3, er*0.1, ex, ey, er);
  earthGrad.addColorStop(0, '#3B82C4'); earthGrad.addColorStop(0.5, '#2A6698'); earthGrad.addColorStop(1, '#1A3A5A');
  c.fillStyle = earthGrad; c.beginPath(); c.arc(ex, ey, er, 0, Math.PI*2); c.fill();

  // Continents (simplified)
  c.fillStyle = 'rgba(40,140,60,0.7)';
  [[0.42,0.35,0.14,0.1],[0.52,0.5,0.12,0.12],[0.38,0.55,0.08,0.06]].forEach(([cx,cy,rw,rh]) => {
    c.beginPath(); c.ellipse(ex+er*(cx-0.5)*2, ey+er*(cy-0.5)*2, er*rw, er*rh, cx, 0, Math.PI*2); c.fill();
  });

  // OZONE LAYER
  const ozoneR = er + 18;
  c.strokeStyle = 'rgba(100,200,80,0.4)'; c.lineWidth = 12;
  c.beginPath(); c.arc(ex, ey, ozoneR, 0, Math.PI*2); c.stroke();
  c.strokeStyle = 'rgba(150,255,120,0.6)'; c.lineWidth = 5;
  c.beginPath(); c.arc(ex, ey, ozoneR, 0, Math.PI*2); c.stroke();

  // OZONE HOLE over south pole
  const holeAngle = -Math.PI/2; // Top = south pole in this view
  const holeSpreadAngle = holeSize * Math.PI * 0.7;
  const holeStart = holeAngle - holeSpreadAngle;
  const holeEnd = holeAngle + holeSpreadAngle;

  // The hole (gap in ozone)
  c.strokeStyle = '#E63946'; c.lineWidth = 12;
  c.beginPath(); c.arc(ex, ey, ozoneR, holeStart, holeEnd);
  c.stroke();

  // UV rays through hole
  if (holeSize > 0.1) {
    c.strokeStyle = `rgba(200,100,255,${holeSize*0.8})`; c.lineWidth=2;
    for (let i=-3; i<=3; i++) {
      const rayAngle = holeAngle + i*(holeSpreadAngle/3.5);
      const rx = ex + Math.cos(rayAngle) * ozoneR;
      const ry = ey + Math.sin(rayAngle) * ozoneR;
      c.beginPath(); c.moveTo(rx, ry); c.lineTo(ex + Math.cos(rayAngle)*er*0.4, ey + Math.sin(rayAngle)*er*0.4); c.stroke();
    }
    // UV label
    c.fillStyle = 'rgba(200,100,255,0.8)'; c.font = '15px Tajawal'; c.textAlign = 'center';
    c.fillText('أشعة فوق بنفسجية ضارة ☢️', ex, ey - ozoneR - 28);
  }

  // CFC molecules rising
  const cfcCount = Math.floor(simState.cfcLevel / 10);
  for (let i=0; i<cfcCount; i++) {
    const angle = (i/cfcCount)*Math.PI*2 + t/100;
    const dist = er*0.5 + (t/10 + i*30) % (ozoneR - er*0.5);
    c.fillStyle='rgba(255,100,50,0.6)'; c.font='14px Tajawal'; c.textAlign='center';
    c.fillText('CFC', ex+Math.cos(angle)*dist, ey+Math.sin(angle)*dist);
  }

  // Year label
  c.fillStyle = yd.color; c.font = 'bold 20px Tajawal'; c.textAlign = 'center';
  c.fillText(simState.year + 'م', w/2, 30);

  // Ozone hole size indicator
  const holePct = Math.round(holeSize * 100);
  c.fillStyle = holePct > 40 ? '#E63946' : holePct > 20 ? '#F4A522' : '#2DC653';
  c.font = 'bold 16px Tajawal'; c.textAlign = 'center';
  c.fillText(`حجم الثقب: ${holePct}% من الطبيعي`, w/2, h*0.97);

  dataDisplay(true,[
    ['السنة', simState.year + 'م'],
    ['حجم ثقب الأوزون', holePct + '%'],
    ['مستوى CFC', simState.cfcLevel < 30 ? 'منخفض' : simState.cfcLevel < 60 ? 'متوسط' : 'عالٍ'],
    ['الأشعة فوق بنفسجية', holeSize > 0.3 ? 'تصل للأرض بكثرة' : holeSize > 0.1 ? 'تصل ببعض' : 'يحجبها الأوزون']
  ]);
  animFrame = requestAnimationFrame(()=>{try{drawOzone()}catch(e){console.error("SIM ERR:",e)}});
}

// ===== 7-8: CONSERVATION =====
function simConservation() {
  if(currentSim!=='conservation') return;
  cancelAnimationFrame(animFrame);

  // ── الأنواع المهددة في سلطنة عُمان ──
  window._SPECIES_INIT = [
    { name:'المها العربي', emoji:'🦌', pop:20, health:55, color:'#F4A522', threat:'صيد جائر + فقدان موطن', goal:60 },
    { name:'الصقر',        emoji:'🦅', pop:12, health:45, color:'#E63946', threat:'قطع الأشجار + البيض المسروق', goal:40 },
    { name:'الغزال',       emoji:'🐾', pop:35, health:65, color:'#2DC653', threat:'رعي مفرط', goal:70 },
    { name:'الذئب العربي', emoji:'🐺', pop:6,  health:35, color:'#9B59B6', threat:'التسمم + الاصطياد', goal:30 },
    { name:'الضبّ',        emoji:'🦎', pop:50, health:75, color:'#00B4D8', threat:'التجارة غير القانونية', goal:80 },
  ];

  // استخدم متغير مستقل لا يُمسح عند تبديل التابات
  if(!window._consState || window._consState.done) window._consState = {
    species: window._SPECIES_INIT.map(s=>({...s})),
    budget: 1200,
    turn: 0,
    maxTurns: 6,
    log: [],
    done: false,
    lastEffect: null,
    t: 0,
    reserveSize: 0.55,
  };
  // S يُقرأ مباشرة من window._consState في كل دالة

  function avgHealth(){ const S=window._consState; if(!S) return 0; return Math.round(S.species.reduce((a,s)=>a+s.health,0)/S.species.length); }
  function successCount(){ const S=window._consState; if(!S) return 0; return S.species.filter((s,i)=>s.pop>=window._SPECIES_INIT[i].goal).length; }

  // ── لوحة التحكم ──
  function buildControls(){
    const S = window._consState;
    const el = document.getElementById('simControlsPanel');
    if(!el || !S) return;
    const avg = avgHealth(), wins = successCount();
    const turnsLeft = S.maxTurns - S.turn;

    el.innerHTML = `
<div style="padding:10px 12px;background:linear-gradient(135deg,rgba(26,143,168,0.15),rgba(26,143,168,0.05));
  border-radius:12px;border:1.5px solid rgba(26,143,168,0.3);margin-bottom:10px">
  <div style="font-size:14px;font-weight:700;color:#1A8FA8;margin-bottom:6px">🎯 مهمتك</div>
  <div style="font-size:12px;color:#555;line-height:1.8">
    أنتِ مديرة محمية طبيعية في عُمان.<br>
    لديكِ <strong style="color:#E74C3C">${turnsLeft} قرارات</strong> متبقية
    و<strong style="color:#F4A522">${S.budget} وحدة</strong> ميزانية.<br>
    اجعلي كل نوع يصل لهدفه قبل نفاد القرارات!
  </div>
</div>

<div style="margin-bottom:10px">
  <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:13px">
    <span>💰 الميزانية</span>
    <span style="color:#F4A522;font-weight:700">${S.budget}/1200</span>
  </div>
  <div style="height:10px;background:rgba(0,0,0,0.08);border-radius:5px;overflow:hidden">
    <div style="height:100%;width:${S.budget/12}%;background:linear-gradient(90deg,#F4A522,#E67E22);border-radius:5px;transition:width 0.4s"></div>
  </div>
</div>

<div style="margin-bottom:10px">
  <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:13px">
    <span>🏆 التقدم</span>
    <span style="color:#2DC653;font-weight:700">${wins}/${S.species.length} أنواع</span>
  </div>
  <div style="height:10px;background:rgba(0,0,0,0.08);border-radius:5px;overflow:hidden">
    <div style="height:100%;width:${wins/S.species.length*100}%;background:linear-gradient(90deg,#2DC653,#27AE60);border-radius:5px;transition:width 0.4s"></div>
  </div>
</div>

<div class="ctrl-label">🌿 قرارات الحفاظ</div>
<div style="display:flex;flex-direction:column;gap:5px;margin-bottom:10px">
  ${[
    {id:'hab',  icon:'🌳', label:'تحسين الموطن',       cost:150, desc:'↑صحة جميع الأنواع +15%'},
    {id:'breed',icon:'🐣', label:'برنامج التكاثر',      cost:200, desc:'↑أعداد جميع الأنواع +12'},
    {id:'anti', icon:'🛡️', label:'مكافحة الصيد الجائر', cost:100, desc:'↑صحة الأنواع المهددة +20%'},
    {id:'res',  icon:'📐', label:'توسيع المحمية',       cost:180, desc:'↑صحة وأعداد الكل'},
  ].map(a=>`
    <button onclick="window._consAct('${a.id}')"
      style="padding:8px 10px;border-radius:9px;border:1.5px solid rgba(0,0,0,0.1);
      background:${S.budget>=a.cost?'rgba(26,143,168,0.07)':'rgba(0,0,0,0.04)'};
      cursor:${S.budget>=a.cost&&!S.done?'pointer':'not-allowed'};
      opacity:${S.budget>=a.cost&&!S.done?1:0.5};
      font-family:Tajawal;text-align:right;width:100%">
      <div style="font-size:13px;font-weight:600">${a.icon} ${a.label} <span style="color:#E74C3C;float:left">-${a.cost}</span></div>
      <div style="font-size:11px;color:#27AE60;margin-top:2px">${a.desc}</div>
    </button>`).join('')}
</div>

${S.done ? `
<div style="padding:12px;background:${wins>=4?'rgba(39,174,96,0.15)':'rgba(231,76,60,0.10)'};
  border-radius:10px;border:1.5px solid ${wins>=4?'#27AE60':'#E74C3C'};text-align:center">
  <div style="font-size:22px;margin-bottom:4px">${wins>=4?'🏆':'😔'}</div>
  <div style="font-size:14px;font-weight:700;color:${wins>=4?'#27AE60':'#E74C3C'}">
    ${wins>=4?'أحسنتِ! المحمية ناجحة':'تحتاج المحمية مزيداً من العناية'}
  </div>
  <div style="font-size:12px;color:#555;margin-top:4px">أنقذتِ ${wins} من ${S.species.length} أنواع</div>
</div>
<button onclick="window._consReset()" style="margin-top:8px;width:100%;padding:9px;border-radius:10px;
  background:rgba(0,0,0,0.05);border:1.5px solid rgba(0,0,0,0.1);font-family:Tajawal;font-size:14px;cursor:pointer">
  ↺ حاولي مرة أخرى
</button>` : `
<button onclick="window._consReset()" style="width:100%;padding:8px;border-radius:9px;
  background:rgba(0,0,0,0.04);border:1.5px solid rgba(0,0,0,0.08);font-family:Tajawal;font-size:13px;cursor:pointer">
  ↺ إعادة البداية
</button>`}

<div id="consEffect" style="margin-top:8px;font-size:12px;min-height:40px"></div>

<div class="q-box" style="margin-top:8px">
  <div style="font-size:13px;color:#7A5010;margin-bottom:4px">﴿ وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا ﴾</div>
  <strong>❓ ص٢٩:</strong> اذكر سببين لتهديد الأنواع في عُمان.
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">الصيد الجائر، فقدان الموطن الطبيعي، التلوث، الجفاف، التوسع العمراني.</div>
</div>`;
  }

  // ── تنفيذ القرار ──
  window._consAct = function(id){
    const S = window._consState;
    if(!S || S.done || S.turn >= S.maxTurns) return;
    const before = S.species.map(s=>({pop:s.pop, health:s.health}));
    let cost=0, name='';

    if(id==='hab'){
      cost=150; name='تحسين الموطن 🌳';
      S.species.forEach(s=>{ s.health=Math.min(100,s.health+15); s.pop=Math.min(100,s.pop+3); });
      S.reserveSize=Math.min(1,S.reserveSize+0.02);
    } else if(id==='breed'){
      cost=200; name='برنامج التكاثر 🐣';
      S.species.forEach(s=>{ s.pop=Math.min(100,s.pop+12); });
    } else if(id==='anti'){
      cost=100; name='مكافحة الصيد 🛡️';
      // يؤثر أكثر على المهددة (صحة منخفضة)
      S.species.forEach(s=>{ const bonus=s.health<60?25:10; s.health=Math.min(100,s.health+bonus); });
    } else if(id==='res'){
      cost=180; name='توسيع المحمية 📐';
      S.reserveSize=Math.min(1,S.reserveSize+0.12);
      S.species.forEach(s=>{ s.health=Math.min(100,s.health+8); s.pop=Math.min(100,s.pop+6); });
    }

    if(S.budget < cost){
      const ef=document.getElementById('consEffect');
      if(ef) ef.innerHTML='<span style="color:#E74C3C">❌ الميزانية غير كافية!</span>';
      return;
    }

    S.budget -= cost;
    S.turn++;
    S.lastEffect = {name, before, t: S.t};

    // بناء رسالة التأثير
    const lines = S.species.map((s,i)=>{
      const dP=s.pop-before[i].pop, dH=s.health-before[i].health;
      const reached = s.pop>=window._SPECIES_INIT[i].goal && before[i].pop<window._SPECIES_INIT[i].goal;
      return `${s.emoji} ${reached?'<strong style="color:#F4A522">✨وصل للهدف!</strong>':''}`
        +(dH>0?` <span style="color:#2DC653">+${dH}%صحة</span>`:'')
        +(dP>0?` <span style="color:#2DC653">+${dP}أفراد</span>`:'');
    });
    const ef=document.getElementById('consEffect');
    if(ef) ef.innerHTML=`
      <div style="padding:8px;background:rgba(39,174,96,0.08);border-radius:8px;
        border-right:3px solid #2DC653;line-height:2">
        <strong style="color:#2DC653">✅ ${name}</strong><br>
        ${lines.join('<br>')}
      </div>`;

    if(S.turn >= S.maxTurns) S.done = true;
    try{U9Sound.ping(successCount()>=4?800:600, 0.2, 0.15);}catch(e){}
    buildControls();
  };

  window._consReset = function(){
    window._consState = null;
    cancelAnimationFrame(animFrame);
    simConservation();
  };

  buildControls();

  // ── الرسم ──
  function draw(){
    if(currentSim!=='conservation') return;
    const S = window._consState;
    if(!S) return;
    S.t++;
    const c=ctx(), w=W(), h=H();
    const rs=S.reserveSize;
    const reserveW=w*rs;

    c.clearRect(0,0,w,h);

    // خلفية
    const sky=c.createLinearGradient(0,0,0,h*0.45);
    sky.addColorStop(0,'#0A1F0A'); sky.addColorStop(1,'#1A3A1A');
    c.fillStyle=sky; c.fillRect(0,0,reserveW,h*0.45);
    c.fillStyle='#1A1008'; c.fillRect(reserveW,0,w-reserveW,h*0.45);
    c.fillStyle='rgba(180,100,20,0.25)'; c.fillRect(reserveW,0,w-reserveW,h*0.45);

    // أرضية
    c.fillStyle='#2A4A1A'; c.fillRect(0,h*0.45,reserveW,h*0.55);
    c.fillStyle='#1A2808'; c.fillRect(reserveW,h*0.45,w-reserveW,h*0.55);

    // حدود المحمية
    c.strokeStyle='rgba(50,200,50,0.6)'; c.lineWidth=3; c.setLineDash([8,4]);
    c.beginPath(); c.moveTo(reserveW,0); c.lineTo(reserveW,h); c.stroke();
    c.setLineDash([]);
    c.fillStyle='rgba(50,200,50,0.7)'; c.font='bold 13px Tajawal'; c.textAlign='center';
    c.fillText(`المحمية — ${Math.round(rs*100)}%`, reserveW/2, h*0.48);

    // خارج المحمية
    if(reserveW<w){
      c.fillStyle='rgba(200,100,30,0.5)'; c.font='13px Tajawal'; c.textAlign='center';
      c.fillText('⚠️ خارج المحمية', reserveW+(w-reserveW)/2, h*0.48);
    }

    // أشجار
    const treeCount=Math.floor(rs*9)+2;
    for(let i=0;i<treeCount;i++){
      const tx=reserveW*(0.04+i*(0.88/treeCount));
      const th=35+Math.sin(i*1.7)*15;
      const sway=Math.sin(S.t/60+i)*2;
      c.fillStyle='#5A3010'; c.fillRect(tx-3,h*0.45,6,th);
      c.fillStyle=`hsl(${105+i*8},55%,${25+i%3*5}%)`;
      c.beginPath(); c.arc(tx+sway,h*0.45,15+i%3*4,0,Math.PI*2); c.fill();
    }

    // ── الأنواع ──
    S.species.forEach((sp,i)=>{
      const col2=Math.floor(i/3), row=i%3;
      const x=reserveW*(0.1+col2*0.45);
      const y=h*(0.56+row*0.13);
      const count=Math.max(1,Math.floor(sp.pop/12));
      const hCol=sp.health>70?'#2DC653':sp.health>45?'#F4A522':'#E74C3C';
      const goal=window._SPECIES_INIT[i].goal;
      const reached=sp.pop>=goal;

      // الحيوانات
      for(let j=0;j<Math.min(count,6);j++){
        const jx=x+j*16, jy=y+Math.sin(S.t/40+i+j)*3;
        c.font='15px serif'; c.textAlign='center';
        c.globalAlpha=reached?1:0.75;
        c.fillText(sp.emoji,jx,jy);
        c.globalAlpha=1;
      }

      // اسم النوع
      c.font='bold 11px Tajawal'; c.fillStyle='rgba(255,255,255,0.85)';
      c.textAlign='left'; c.fillText(sp.name.split(' ')[0],x-8,y+14);

      // شريط الصحة
      c.fillStyle='rgba(0,0,0,0.45)';
      c.beginPath(); c.roundRect(x-8,y+17,72,6,3); c.fill();
      c.fillStyle=hCol;
      c.beginPath(); c.roundRect(x-8,y+17,72*sp.health/100,6,3); c.fill();

      // هدف الأعداد
      c.font='10px Tajawal'; c.fillStyle='rgba(255,255,255,0.5)';
      c.fillText(`${sp.pop}/${goal}`,x-8,y+32);

      // نجمة عند تحقيق الهدف
      if(reached){
        c.font='14px serif'; c.textAlign='center';
        c.fillText('⭐',x+Math.min(count,6)*16/2,y-8);
      }

      // تأثير فلاش عند آخر قرار
      if(S.lastEffect){
        const age=S.t-S.lastEffect.t;
        if(age<100){
          const alpha=Math.max(0,1-age/100);
          const before=S.lastEffect.before[i];
          const dH=sp.health-before.health, dP=sp.pop-before.pop;
          if(dH>0||dP>0){
            c.globalAlpha=alpha;
            c.font='bold 12px Tajawal'; c.fillStyle='#2DC653';
            c.textAlign='center';
            let txt='';
            if(dH>0) txt+='+'+dH+'%';
            if(dP>0) txt+=' +'+dP;
            c.fillText(txt,x+30,y-18);
            c.globalAlpha=1;
          }
        }
      }
    });

    // ── مؤشر الصحة العام ──
    const avg=avgHealth(), wins=successCount();
    const gx=w*0.78, gy=h*0.28, gr=h*0.10;
    c.strokeStyle='rgba(255,255,255,0.08)'; c.lineWidth=10;
    c.beginPath(); c.arc(gx,gy,gr,Math.PI,2*Math.PI); c.stroke();
    const gc=avg>70?'#2DC653':avg>45?'#F4A522':'#E74C3C';
    c.strokeStyle=gc; c.lineWidth=10;
    c.beginPath(); c.arc(gx,gy,gr,Math.PI,Math.PI+(avg/100)*Math.PI); c.stroke();
    c.fillStyle='#fff'; c.font='bold 16px Tajawal'; c.textAlign='center';
    c.fillText(avg+'%',gx,gy+4);
    c.font='12px Tajawal'; c.fillStyle='rgba(255,255,255,0.5)';
    c.fillText('صحة المحمية',gx,gy+20);

    // قرارات متبقية
    const turnsLeft=S.maxTurns-S.turn;
    c.fillStyle='rgba(20,30,20,0.75)';
    c.beginPath(); c.roundRect(w*0.62,h*0.04,w*0.35,30,[8]); c.fill();
    c.font='bold 13px Tajawal'; c.fillStyle='white'; c.textAlign='center';
    c.fillText(`قرارات متبقية: ${turnsLeft} | أنقذتِ: ${wins}/${S.species.length}`,w*0.795,h*0.04+15);

    // رسالة النهاية
    if(S.done){
      c.fillStyle='rgba(0,0,0,0.6)';
      c.beginPath(); c.roundRect(w*0.15,h*0.35,w*0.7,h*0.15,[12]); c.fill();
      c.font='bold 18px Tajawal'; c.textAlign='center';
      c.fillStyle=wins>=4?'#2DC653':'#E74C3C';
      c.fillText(wins>=4?`🏆 أحسنتِ! أنقذتِ ${wins} أنواع!`:`😔 أنقذتِ ${wins} فقط — حاولي مرة أخرى`,w/2,h*0.43);
      c.font='14px Tajawal'; c.fillStyle='rgba(255,255,255,0.7)';
      c.fillText('اضغطي ↺ إعادة البداية في لوحة التحكم',w/2,h*0.46);
    }

    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }
  draw();
}


// ======================================================

// ===== 8-1 TAB 1: METALS PROPERTIES (خصائص الفلزّات) =====
// ╔══════════════════════════════════════════════════════════╗
