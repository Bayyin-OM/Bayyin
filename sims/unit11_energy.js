// الوحدة 11 · مصادر الطاقة — الصف التاسع (فيزياء)
// Energy Resources — بنفس أسلوب PhET — تفاعلي بالكامل
// ══════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════
// أداوت مشتركة
// ══════════════════════════════════════════════════════════════
function _E11ctx()  { return document.getElementById('simCanvas').getContext('2d'); }
function _E11W()    { return document.getElementById('simCanvas').width; }
function _E11H()    { return document.getElementById('simCanvas').height; }

// رسم نجمة شمسية
function _drawSun(c, x, y, r, t) {
  c.save();
  c.translate(x, y);
  c.rotate(t * 0.008);
  const rays = 12;
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2;
    const glow = c.createLinearGradient(0, 0, Math.cos(a) * r * 2.2, Math.sin(a) * r * 2.2);
    glow.addColorStop(0, 'rgba(255,210,0,0.8)');
    glow.addColorStop(1, 'rgba(255,180,0,0)');
    c.beginPath();
    c.moveTo(Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9);
    c.lineTo(Math.cos(a + 0.15) * r * 1.8, Math.sin(a + 0.15) * r * 1.8);
    c.lineTo(Math.cos(a - 0.15) * r * 1.8, Math.sin(a - 0.15) * r * 1.8);
    c.closePath();
    c.fillStyle = glow;
    c.fill();
  }
  const sunGrad = c.createRadialGradient(0, 0, 0, 0, 0, r);
  sunGrad.addColorStop(0, '#FFF7AA');
  sunGrad.addColorStop(0.5, '#FFD700');
  sunGrad.addColorStop(1, '#FFA500');
  c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2);
  c.fillStyle = sunGrad; c.fill();
  c.restore();
}

// رسم سحابة CO2
function _drawCO2Cloud(c, x, y, size, alpha) {
  c.save(); c.globalAlpha = alpha;
  c.fillStyle = 'rgba(180,80,30,0.6)';
  c.beginPath(); c.arc(x, y, size, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(x + size * 0.7, y, size * 0.75, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(x - size * 0.7, y, size * 0.75, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(x, y - size * 0.5, size * 0.6, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(200,60,10,0.9)';
  c.font = `bold ${Math.round(size * 0.6)}px Arial`;
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText('CO₂', x, y);
  c.restore();
}

// ══════════════════════════════════════════════════════════════
// الاستقصاء 1 · مصادر الطاقة — التصنيف والمقارنة
// TAB 1: فرز المصادر (متجدّدة / غير متجدّدة)
// ══════════════════════════════════════════════════════════════
function simE11Energy1() {
  cancelAnimationFrame(animFrame);
  const cv = document.getElementById('simCanvas');
  const c  = cv.getContext('2d');

  const SOURCES = [
    { id: 'solar',   label: 'الطاقة الشمسية',      icon: '☀️',  renewable: true,  color: '#F39C12' },
    { id: 'wind',    label: 'طاقة الرياح',           icon: '💨',  renewable: true,  color: '#3498DB' },
    { id: 'hydro',   label: 'الطاقة الكهرومائية',   icon: '💧',  renewable: true,  color: '#2980B9' },
    { id: 'tidal',   label: 'طاقة المدّ والجزر',    icon: '🌊',  renewable: true,  color: '#1ABC9C' },
    { id: 'geo',     label: 'الحرارية الجوفية',      icon: '🌋',  renewable: true,  color: '#E74C3C' },
    { id: 'bio',     label: 'الكتلة الحيوية',        icon: '🌿',  renewable: true,  color: '#27AE60' },
    { id: 'coal',    label: 'الفحم الحجري',          icon: '⛏️', renewable: false, color: '#7F8C8D' },
    { id: 'oil',     label: 'النفط',                 icon: '🛢️', renewable: false, color: '#8E44AD' },
    { id: 'gas',     label: 'الغاز الطبيعي',         icon: '🔥',  renewable: false, color: '#E67E22' },
    { id: 'nuclear', label: 'الطاقة النووية',        icon: '⚛️', renewable: false, color: '#C0392B' },
  ];

  if (!simState.e11s1) simState.e11s1 = {
    cards: SOURCES.map((s, i) => ({
      ...s, placed: null, // null | 'renewable' | 'nonrenewable'
      x: 0, y: 0,
      dragging: false, dragX: 0, dragY: 0
    })),
    dragIdx: -1, dragOX: 0, dragOY: 0, t: 0, score: 0, checked: false
  };
  const S = simState.e11s1;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔋 فرز مصادر الطاقة</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.75);line-height:1.7">
        اسحب كلّ بطاقة إلى المربّع المناسب:<br>
        🟢 <strong>متجدّدة</strong> أو 🔴 <strong>غير متجدّدة</strong>
      </div>
    </div>
    <button class="ctrl-btn" id="e11s1Check" style="width:100%;background:rgba(39,174,96,0.25);border-color:rgba(39,174,96,0.5);color:#2DC653">✅ تحقق من الإجابات</button>
    <button class="ctrl-btn" id="e11s1Reset" style="width:100%;margin-top:6px;background:rgba(231,76,60,0.12);border-color:rgba(231,76,60,0.35);color:#E74C3C">🔄 إعادة</button>
    <div class="info-box" id="e11s1info">اسحب بطاقات الطاقة إلى المربّعات</div>
    <div class="q-box">
      <strong>🔍 ماذا تستنتج؟</strong><br>
      ١- ما الفرق الرئيسي بين مصادر الطاقة المتجدّدة وغير المتجدّدة؟<br>
      ٢- أيّ المصادر يعتمد بشكل أساسي على الشمس؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">
        ١- المتجدّدة لا تنضب وتتجدّد بشكل طبيعي، أما غير المتجدّدة فتنضب بعد استخدامها ولا تتجدّد.<br>
        ٢- الشمسية مباشرةً، والرياح والأمواج والكتلة الحيوية والطاقة الكهرومائية تعتمد على الشمس بشكل غير مباشر.
      </div>
    </div>
  `);

  btn('e11s1Check', () => {
    let correct = 0, placed = 0;
    S.cards.forEach(card => {
      if (card.placed) {
        placed++;
        if ((card.renewable && card.placed === 'renewable') ||
            (!card.renewable && card.placed === 'nonrenewable')) correct++;
      }
    });
    S.score = correct;
    S.checked = true;
    if (placed === 0) {
      document.getElementById('e11s1info').textContent = '⚠️ اسحب البطاقات أولاً!';
      return;
    }
    document.getElementById('e11s1info').innerHTML =
      correct === SOURCES.length
        ? `🎉 ممتاز! صحيحة كلها (${correct}/${SOURCES.length})`
        : `✅ ${correct} صحيحة من ${placed} مصنَّفة`;
    if (correct === SOURCES.length) U9Sound.win();
    else U9Sound.ping(440, 0.2, 0.2);
  });

  btn('e11s1Reset', () => {
    S.cards.forEach(card => { card.placed = null; card.dragging = false; });
    S.score = 0; S.checked = false;
    document.getElementById('e11s1info').textContent = 'اسحب بطاقات الطاقة إلى المربّعات';
    U9Sound.ping(330, 0.15, 0.12);
  });

  // Touch/Mouse
  function getPos(e) {
    const r = cv.getBoundingClientRect(), sc = cv.width / r.width;
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - r.left) * sc, y: (src.clientY - r.top) * sc };
  }

  cv.onmousedown = cv.ontouchstart = function(e) {
    e.preventDefault();
    const { x, y } = getPos(e);
    const w = cv.width, h = cv.height;
    const cols = 5, cardW = w * 0.16, cardH = h * 0.1;
    const startY = h * 0.12;
    S.cards.forEach((card, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const cx = w * 0.02 + col * (cardW + w * 0.02) + cardW / 2;
      const cy = startY + row * (cardH + h * 0.02) + cardH / 2;
      if (Math.abs(x - cx) < cardW / 2 && Math.abs(y - cy) < cardH / 2) {
        S.dragIdx = i;
        S.dragOX = x - cx; S.dragOY = y - cy;
        card.dragging = true;
        card.dragX = cx; card.dragY = cy;
      }
    });
  };
  cv.onmousemove = cv.ontouchmove = function(e) {
    e.preventDefault();
    if (S.dragIdx < 0) return;
    const { x, y } = getPos(e);
    S.cards[S.dragIdx].dragX = x - S.dragOX;
    S.cards[S.dragIdx].dragY = y - S.dragOY;
  };
  cv.onmouseup = cv.ontouchend = function(e) {
    if (S.dragIdx < 0) return;
    const card = S.cards[S.dragIdx];
    const w = cv.width, h = cv.height;
    const dropY = h * 0.62;
    const renBox = { x: w * 0.05, y: dropY, w: w * 0.4, h: h * 0.3 };
    const nonBox = { x: w * 0.55, y: dropY, w: w * 0.4, h: h * 0.3 };
    const dx = card.dragX, dy = card.dragY;
    if (dx >= renBox.x && dx <= renBox.x + renBox.w && dy >= renBox.y && dy <= renBox.y + renBox.h)
      card.placed = 'renewable';
    else if (dx >= nonBox.x && dx <= nonBox.x + nonBox.w && dy >= nonBox.y && dy <= nonBox.y + nonBox.h)
      card.placed = 'nonrenewable';
    card.dragging = false;
    S.dragIdx = -1;
    U9Sound.ping(480, 0.1, 0.1);
  };

  function draw() {
    if (currentSim !== 'g9energy' || currentTab !== 0) return;
    const w = cv.width, h = cv.height;
    S.t++;
    c.clearRect(0, 0, w, h);

    // Background
    const bg = c.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#EEF9FF'); bg.addColorStop(1, '#E0F3FF');
    c.fillStyle = bg; c.fillRect(0, 0, w, h);

    // Title
    c.font = `bold ${Math.round(h * 0.038)}px Tajawal`;
    c.fillStyle = '#1A5276'; c.textAlign = 'center';
    c.fillText('📋 صنِّف مصادر الطاقة', w / 2, h * 0.06);

    // Drop zones
    const dropY = h * 0.62;
    const renBox = { x: w * 0.05, y: dropY, w: w * 0.4, h: h * 0.3 };
    const nonBox = { x: w * 0.55, y: dropY, w: w * 0.4, h: h * 0.3 };

    // Renewable box
    c.fillStyle = 'rgba(39,174,96,0.12)';
    c.beginPath(); c.roundRect(renBox.x, renBox.y, renBox.w, renBox.h, 14); c.fill();
    c.strokeStyle = 'rgba(39,174,96,0.7)'; c.lineWidth = 2.5;
    c.beginPath(); c.roundRect(renBox.x, renBox.y, renBox.w, renBox.h, 14); c.stroke();
    c.font = `bold ${Math.round(h * 0.035)}px Tajawal`;
    c.fillStyle = '#1E8449'; c.textAlign = 'center';
    c.fillText('🟢 متجدّدة', renBox.x + renBox.w / 2, renBox.y + h * 0.045);

    // Non-renewable box
    c.fillStyle = 'rgba(231,76,60,0.1)';
    c.beginPath(); c.roundRect(nonBox.x, nonBox.y, nonBox.w, nonBox.h, 14); c.fill();
    c.strokeStyle = 'rgba(231,76,60,0.6)'; c.lineWidth = 2.5;
    c.beginPath(); c.roundRect(nonBox.x, nonBox.y, nonBox.w, nonBox.h, 14); c.stroke();
    c.font = `bold ${Math.round(h * 0.035)}px Tajawal`;
    c.fillStyle = '#A93226'; c.textAlign = 'center';
    c.fillText('🔴 غير متجدّدة', nonBox.x + nonBox.w / 2, nonBox.y + h * 0.045);

    // Draw placed cards inside boxes
    const drawInBox = (box, type) => {
      const placed = S.cards.filter(c => c.placed === type && !c.dragging);
      placed.forEach((card, i) => {
        const cols = 3;
        const cw = box.w / cols - 6;
        const ch = (box.h - h * 0.065) / Math.ceil(SOURCES.length / cols / 2) - 4;
        const col = i % cols, row = Math.floor(i / cols);
        const cx = box.x + col * (box.w / cols) + box.w / cols / 2;
        const cy = box.y + h * 0.07 + row * (ch + 4) + ch / 2;
        let color = card.color;
        if (S.checked) {
          color = (card.renewable && type === 'renewable') || (!card.renewable && type === 'nonrenewable')
            ? '#27AE60' : '#E74C3C';
        }
        c.fillStyle = color + '22';
        c.beginPath(); c.roundRect(cx - cw / 2, cy - ch / 2, cw, ch, 8); c.fill();
        c.strokeStyle = color; c.lineWidth = 2;
        c.beginPath(); c.roundRect(cx - cw / 2, cy - ch / 2, cw, ch, 8); c.stroke();
        c.font = `${Math.round(h * 0.028)}px Tajawal`;
        c.fillStyle = '#333'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(card.icon + ' ' + card.label, cx, cy);
        if (S.checked) {
          const ok = (card.renewable && type === 'renewable') || (!card.renewable && type === 'nonrenewable');
          c.font = `bold ${Math.round(h * 0.03)}px Arial`;
          c.fillStyle = ok ? '#27AE60' : '#E74C3C';
          c.fillText(ok ? '✓' : '✗', cx - cw / 2 + 14, cy);
        }
      });
    };
    drawInBox(renBox, 'renewable');
    drawInBox(nonBox, 'nonrenewable');

    // Source cards (unplaced)
    const cols = 5, cardW = w * 0.16, cardH = h * 0.09;
    const startY = h * 0.12;
    S.cards.forEach((card, i) => {
      if (card.placed || card.dragging) return;
      const col = i % cols, row = Math.floor(i / cols);
      const cx = w * 0.02 + col * (cardW + w * 0.02) + cardW / 2;
      const cy = startY + row * (cardH + h * 0.025) + cardH / 2;
      c.fillStyle = card.color + '22';
      c.beginPath(); c.roundRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 10); c.fill();
      c.strokeStyle = card.color; c.lineWidth = 2;
      c.beginPath(); c.roundRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 10); c.stroke();
      c.font = `${Math.round(h * 0.038)}px Arial`;
      c.fillStyle = '#333'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(card.icon, cx, cy - cardH * 0.1);
      c.font = `${Math.round(h * 0.025)}px Tajawal`;
      c.fillText(card.label, cx, cy + cardH * 0.3);
    });

    // Dragging card
    if (S.dragIdx >= 0) {
      const card = S.cards[S.dragIdx];
      c.globalAlpha = 0.85;
      c.fillStyle = card.color + '44';
      c.beginPath(); c.roundRect(card.dragX - cardW / 2, card.dragY - cardH / 2, cardW, cardH, 10); c.fill();
      c.strokeStyle = card.color; c.lineWidth = 3;
      c.beginPath(); c.roundRect(card.dragX - cardW / 2, card.dragY - cardH / 2, cardW, cardH, 10); c.stroke();
      c.font = `${Math.round(h * 0.045)}px Arial`;
      c.fillStyle = '#333'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(card.icon, card.dragX, card.dragY - cardH * 0.08);
      c.font = `bold ${Math.round(h * 0.026)}px Tajawal`;
      c.fillText(card.label, card.dragX, card.dragY + cardH * 0.32);
      c.globalAlpha = 1;
    }

    c.textBaseline = 'alphabetic';
    animFrame = requestAnimationFrame(() => { try { draw(); } catch(e) {} });
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// TAB 2: إيجابيات وسلبيات المصادر — اختبار تفاعلي
// ══════════════════════════════════════════════════════════════
function simE11Energy2() {
  cancelAnimationFrame(animFrame);
  const cv = document.getElementById('simCanvas');
  const c  = cv.getContext('2d');

  const SOURCES_PROS_CONS = [
    {
      id: 'fossil', label: 'الوقود الأحفوري', icon: '⛽', color: '#7F8C8D',
      pros: ['طاقة عالية في وحدة صغيرة', 'سهل النقل والتخزين', 'تقنية ناضجة وموثوقة'],
      cons: ['ينضب ولا يتجدد', 'يُنتج CO₂ ويُلوّث الجو', 'يسبب المطر الحمضي والضباب الكيميائي']
    },
    {
      id: 'solar', label: 'الطاقة الشمسية', icon: '☀️', color: '#F39C12',
      pros: ['مجانية ومتجددة', 'لا تُلوّث البيئة', 'مناسبة للمناطق النائية'],
      cons: ['لا تعمل ليلاً أو في الغيوم', 'تكاليف تركيب مرتفعة', 'تحتاج مساحات كبيرة']
    },
    {
      id: 'wind', label: 'طاقة الرياح', icon: '💨', color: '#3498DB',
      pros: ['متجددة ومجانية', 'لا تُنتج غازات دفيئة', 'مساحة أرضية صغيرة'],
      cons: ['الرياح غير منتظمة', 'ضجيج وأثر بصري', 'تُهدد الطيور والخفافيش']
    },
    {
      id: 'hydro', label: 'الكهرومائية', icon: '💧', color: '#2980B9',
      pros: ['إنتاج مستمر وموثوق', 'لا تُلوّث الهواء', 'السدود تتحكم بالفيضانات'],
      cons: ['تُؤثر على النظام البيئي', 'تُهجّر السكان', 'تحتاج مواقع جبلية خاصة']
    },
    {
      id: 'nuclear', label: 'الطاقة النووية', icon: '⚛️', color: '#8E44AD',
      pros: ['طاقة ضخمة من كمية صغيرة', 'لا تُنتج CO₂', 'إنتاج مستمر 24/7'],
      cons: ['نفايات مشعة خطيرة', 'خطر الحوادث النووية', 'تكاليف بناء عالية جداً']
    },
  ];

  if (!simState.e11s2) simState.e11s2 = {
    selected: 0, showPros: true, showCons: true, t: 0,
    quiz: [], quizIdx: 0, quizMode: false, quizScore: 0
  };
  const S = simState.e11s2;

  const updateControls = () => {
    controls(`
      <div class="ctrl-section">
        <div class="ctrl-label">⚖️ إيجابيات وسلبيات</div>
      </div>
      ${SOURCES_PROS_CONS.map((s, i) =>
        `<button class="ctrl-btn${S.selected === i ? ' on' : ''}" id="e11s2src${i}"
          style="width:100%;margin-bottom:4px;text-align:right;
            ${S.selected === i ? `background:${s.color}33;border-color:${s.color};color:${s.color}` : ''}"
          onclick="simState.e11s2.selected=${i};simState.e11s2.quizMode=false;">${s.icon} ${s.label}</button>`
      ).join('')}
      <hr style="border-color:rgba(255,255,255,0.15);margin:8px 0">
      <button class="ctrl-btn" id="e11s2quiz" style="width:100%;background:rgba(155,89,182,0.2);border-color:rgba(155,89,182,0.5);color:#9B59B6">
        🎯 اختبار سريع
      </button>
      <div class="q-box" style="margin-top:8px">
        <strong>🔍 ماذا تستنتج؟</strong><br>
        ١- لماذا لا يمكن الاعتماد الكامل على طاقة الرياح والشمس وحدها؟<br>
        ٢- ما أكثر مصدر طاقة يمكن الاعتماد عليه في عُمان؟ ولماذا؟
        <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
        <div class="q-ans-panel">
          ١- لأن الرياح لا تهب دائماً والشمس لا تسطع ليلاً أو في الغيوم، لذا تحتاج إلى مصادر احتياطية.<br>
          ٢- الطاقة الشمسية لأن عُمان تتمتع بإشعاع شمسي مرتفع طوال العام، وكذلك طاقة الرياح في المناطق الساحلية.
        </div>
      </div>
    `);
    SOURCES_PROS_CONS.forEach((_, i) => {
      btn(`e11s2src${i}`, () => {
        S.selected = i; S.quizMode = false; updateControls();
      });
    });
    btn('e11s2quiz', () => {
      // Build quiz: random pros/cons statements
      const questions = [];
      SOURCES_PROS_CONS.forEach(src => {
        src.pros.forEach(p => questions.push({ text: p, source: src.label, isPro: true, icon: src.icon }));
        src.cons.forEach(con => questions.push({ text: con, source: src.label, isPro: false, icon: src.icon }));
      });
      S.quiz = questions.sort(() => Math.random() - 0.5).slice(0, 8);
      S.quizIdx = 0; S.quizScore = 0; S.quizMode = true; S.quizAnswer = null;
    });
  };
  updateControls();

  function draw() {
    if (currentSim !== 'g9energy' || currentTab !== 1) return;
    const w = cv.width, h = cv.height;
    S.t++;
    c.clearRect(0, 0, w, h);

    const bg = c.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#F8F3FF'); bg.addColorStop(1, '#EDE8FF');
    c.fillStyle = bg; c.fillRect(0, 0, w, h);

    if (S.quizMode && S.quiz.length > 0) {
      // Quiz mode
      const q = S.quiz[S.quizIdx];
      c.font = `bold ${Math.round(h * 0.04)}px Tajawal`;
      c.fillStyle = '#4A235A'; c.textAlign = 'center';
      c.fillText(`🎯 سؤال ${S.quizIdx + 1} من ${S.quiz.length}`, w / 2, h * 0.08);

      // Statement box
      c.fillStyle = 'rgba(155,89,182,0.12)';
      c.beginPath(); c.roundRect(w * 0.05, h * 0.13, w * 0.9, h * 0.2, 14); c.fill();
      c.strokeStyle = 'rgba(155,89,182,0.5)'; c.lineWidth = 2;
      c.beginPath(); c.roundRect(w * 0.05, h * 0.13, w * 0.9, h * 0.2, 14); c.stroke();
      c.font = `${Math.round(h * 0.042)}px Arial`; c.fillStyle = '#555'; c.textAlign = 'center';
      c.fillText(q.icon, w / 2, h * 0.2);
      c.font = `${Math.round(h * 0.034)}px Tajawal`; c.fillStyle = '#2C3E50';
      const words = q.text; // Arabic text wrap
      c.fillText(q.text, w / 2, h * 0.29);
      c.font = `bold ${Math.round(h * 0.03)}px Tajawal`; c.fillStyle = '#7D3C98';
      c.fillText(`هذه العبارة تخص: ${q.source}`, w / 2, h * 0.36);

      // Buttons: إيجابية / سلبية
      const btnW = w * 0.35, btnH = h * 0.1;
      const btnY = h * 0.43;
      const greenBtn = { x: w * 0.08, y: btnY };
      const redBtn   = { x: w * 0.57, y: btnY };

      // Green: Pro
      let gCol = S.quizAnswer === 'pro' ? (q.isPro ? '#27AE60' : '#E74C3C') : 'rgba(39,174,96,0.2)';
      c.fillStyle = gCol;
      c.beginPath(); c.roundRect(greenBtn.x, greenBtn.y, btnW, btnH, 12); c.fill();
      c.strokeStyle = '#27AE60'; c.lineWidth = 2;
      c.beginPath(); c.roundRect(greenBtn.x, greenBtn.y, btnW, btnH, 12); c.stroke();
      c.font = `bold ${Math.round(h * 0.038)}px Tajawal`;
      c.fillStyle = S.quizAnswer === 'pro' ? 'white' : '#1E8449'; c.textAlign = 'center';
      c.fillText('👍 إيجابية', greenBtn.x + btnW / 2, greenBtn.y + btnH * 0.62);

      // Red: Con
      let rCol = S.quizAnswer === 'con' ? (q.isPro ? '#E74C3C' : '#27AE60') : 'rgba(231,76,60,0.15)';
      c.fillStyle = rCol;
      c.beginPath(); c.roundRect(redBtn.x, redBtn.y, btnW, btnH, 12); c.fill();
      c.strokeStyle = '#E74C3C'; c.lineWidth = 2;
      c.beginPath(); c.roundRect(redBtn.x, redBtn.y, btnW, btnH, 12); c.stroke();
      c.fillStyle = S.quizAnswer === 'con' ? 'white' : '#922B21'; 
      c.fillText('👎 سلبية', redBtn.x + btnW / 2, redBtn.y + btnH * 0.62);

      // Score
      c.font = `bold ${Math.round(h * 0.038)}px Tajawal`;
      c.fillStyle = '#7D3C98'; c.textAlign = 'center';
      c.fillText(`النتيجة: ${S.quizScore}/${S.quizIdx}`, w / 2, h * 0.88);

      if (S.quizAnswer) {
        c.font = `bold ${Math.round(h * 0.04)}px Tajawal`;
        c.fillStyle = (S.quizAnswer === 'pro') === q.isPro ? '#27AE60' : '#E74C3C';
        c.fillText((S.quizAnswer === 'pro') === q.isPro ? '✓ صحيح!' : '✗ خطأ!', w / 2, h * 0.59);
        c.font = `${Math.round(h * 0.03)}px Tajawal`;
        c.fillStyle = '#555';
        c.fillText('👆 اضغط للسؤال التالي', w / 2, h * 0.66);
      }

      cv.onclick = function(e) {
        const r = cv.getBoundingClientRect(), sc = cv.width / r.width;
        const mx = (e.clientX - r.left) * sc, my = (e.clientY - r.top) * sc;
        if (S.quizAnswer) {
          S.quizAnswer = null;
          S.quizIdx++;
          if (S.quizIdx >= S.quiz.length) {
            S.quizMode = false;
            document.getElementById('e11s2quiz') &&
              (document.getElementById('e11s2quiz').textContent =
                `🎯 انتهى! ${S.quizScore}/${S.quiz.length} — العب مجدداً`);
            if (S.quizScore >= S.quiz.length * 0.8) U9Sound.win();
          }
          return;
        }
        if (mx >= greenBtn.x && mx <= greenBtn.x + btnW && my >= btnY && my <= btnY + btnH) {
          S.quizAnswer = 'pro';
          if (q.isPro) { S.quizScore++; U9Sound.ping(660, 0.2, 0.15); }
          else U9Sound.ping(220, 0.2, 0.15);
        }
        if (mx >= redBtn.x && mx <= redBtn.x + btnW && my >= btnY && my <= btnY + btnH) {
          S.quizAnswer = 'con';
          if (!q.isPro) { S.quizScore++; U9Sound.ping(660, 0.2, 0.15); }
          else U9Sound.ping(220, 0.2, 0.15);
        }
      };
    } else {
      // Normal pros/cons display
      const src = SOURCES_PROS_CONS[S.selected];
      cv.onclick = null;

      // Header
      c.font = `bold ${Math.round(h * 0.055)}px Arial`;
      c.fillStyle = src.color; c.textAlign = 'center';
      c.fillText(src.icon, w / 2, h * 0.1);
      c.font = `bold ${Math.round(h * 0.04)}px Tajawal`;
      c.fillStyle = '#2C3E50';
      c.fillText(src.label, w / 2, h * 0.17);

      // Pros column
      const colW = w * 0.42, colH = h * 0.65, colY = h * 0.22;
      c.fillStyle = 'rgba(39,174,96,0.1)';
      c.beginPath(); c.roundRect(w * 0.03, colY, colW, colH, 14); c.fill();
      c.strokeStyle = 'rgba(39,174,96,0.6)'; c.lineWidth = 2;
      c.beginPath(); c.roundRect(w * 0.03, colY, colW, colH, 14); c.stroke();
      c.font = `bold ${Math.round(h * 0.035)}px Tajawal`;
      c.fillStyle = '#1E8449'; c.textAlign = 'center';
      c.fillText('👍 الإيجابيات', w * 0.03 + colW / 2, colY + h * 0.045);
      src.pros.forEach((pro, i) => {
        c.font = `${Math.round(h * 0.028)}px Tajawal`;
        c.fillStyle = '#1A5229'; c.textAlign = 'right';
        c.fillText(`✅ ${pro}`, w * 0.03 + colW - 10, colY + h * 0.1 + i * h * 0.17);
      });

      // Cons column
      const colX2 = w * 0.55;
      c.fillStyle = 'rgba(231,76,60,0.1)';
      c.beginPath(); c.roundRect(colX2, colY, colW, colH, 14); c.fill();
      c.strokeStyle = 'rgba(231,76,60,0.5)'; c.lineWidth = 2;
      c.beginPath(); c.roundRect(colX2, colY, colW, colH, 14); c.stroke();
      c.font = `bold ${Math.round(h * 0.035)}px Tajawal`;
      c.fillStyle = '#922B21'; c.textAlign = 'center';
      c.fillText('👎 السلبيات', colX2 + colW / 2, colY + h * 0.045);
      src.cons.forEach((con, i) => {
        c.font = `${Math.round(h * 0.028)}px Tajawal`;
        c.fillStyle = '#641E16'; c.textAlign = 'right';
        c.fillText(`❌ ${con}`, colX2 + colW - 10, colY + h * 0.1 + i * h * 0.17);
      });

      c.font = `${Math.round(h * 0.025)}px Tajawal`;
      c.fillStyle = 'rgba(80,80,80,0.5)'; c.textAlign = 'center';
      c.fillText('👈 اختر مصدراً من القائمة', w / 2, h * 0.95);
    }

    animFrame = requestAnimationFrame(() => { try { draw(); } catch(e) {} });
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// الاستقصاء 2 · الوقود الأحفوري والتلوث
// TAB 1: احتراق الوقود الأحفوري وانبعاثات CO₂
// ══════════════════════════════════════════════════════════════
function simE11Fossil1() {
  cancelAnimationFrame(animFrame);
  const cv = document.getElementById('simCanvas');
  const c  = cv.getContext('2d');

  if (!simState.e11f1) simState.e11f1 = {
    burning: false, fuelType: 'coal', t: 0,
    co2Level: 0, tempRise: 0,
    particles: [], clouds: []
  };
  const S = simState.e11f1;

  const FUELS = {
    coal:  { label: 'فحم حجري', icon: '⛏️', color: '#5D6D7E', co2Rate: 3, energy: 0.6 },
    oil:   { label: 'نفط',       icon: '🛢️', color: '#8E44AD', co2Rate: 2.5, energy: 0.8 },
    gas:   { label: 'غاز طبيعي', icon: '🔥', color: '#E67E22', co2Rate: 1.8, energy: 0.95 },
  };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🏭 احتراق الوقود الأحفوري</div>
    </div>
    <div class="ctrl-label" style="margin-top:4px">نوع الوقود</div>
    <button class="ctrl-btn on" id="e11f1coal" style="width:100%;margin-bottom:4px">⛏️ فحم حجري</button>
    <button class="ctrl-btn" id="e11f1oil"  style="width:100%;margin-bottom:4px">🛢️ نفط</button>
    <button class="ctrl-btn" id="e11f1gas"  style="width:100%;margin-bottom:4px">🔥 غاز طبيعي</button>
    <hr style="border-color:rgba(255,255,255,0.15);margin:8px 0">
    <button class="ctrl-btn" id="e11f1start" style="width:100%;background:rgba(231,76,60,0.25);border-color:rgba(231,76,60,0.6);color:#E74C3C">🔥 إشعال / إيقاف</button>
    <button class="ctrl-btn" id="e11f1reset" style="width:100%;margin-top:4px;background:rgba(52,152,219,0.15);border-color:rgba(52,152,219,0.4);color:#3498DB">🔄 إعادة</button>
    <div class="info-box" id="e11f1info">اضغط "إشعال" لبدء الاحتراق</div>
    <div class="q-box">
      <strong>🔍 ماذا تستنتج؟</strong><br>
      ١- أيّ الوقود يُنتج أعلى كمية من CO₂ لكل وحدة طاقة؟<br>
      ٢- كيف يُؤثر ارتفاع CO₂ على درجة حرارة الأرض؟<br>
      ٣- ما الحل البديل للوقود الأحفوري؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">
        ١- الفحم الحجري يُنتج أعلى نسبة CO₂، يليه النفط، ثم الغاز الطبيعي.<br>
        ٢- CO₂ يحبس الحرارة في الغلاف الجوي (الاحتباس الحراري) مما يرفع درجات الحرارة عالمياً.<br>
        ٣- الطاقة المتجدّدة: الشمسية، الرياح، المائية — لا تُنتج CO₂.
      </div>
    </div>
  `);

  ['coal', 'oil', 'gas'].forEach(f => {
    btn(`e11f1${f}`, () => {
      S.fuelType = f;
      ['coal','oil','gas'].forEach(x => document.getElementById(`e11f1${x}`) &&
        document.getElementById(`e11f1${x}`).classList.remove('on'));
      document.getElementById(`e11f1${f}`).classList.add('on');
    });
  });
  btn('e11f1start', () => {
    S.burning = !S.burning;
    document.getElementById('e11f1info').textContent =
      S.burning ? `🔥 يحترق ${FUELS[S.fuelType].label}...` : '⏸️ متوقف';
  });
  btn('e11f1reset', () => {
    S.burning = false; S.co2Level = 0; S.tempRise = 0;
    S.particles = []; S.clouds = [];
    document.getElementById('e11f1info').textContent = 'تمت الإعادة';
  });

  function draw() {
    if (currentSim !== 'g9fossil' || currentTab !== 0) return;
    const w = cv.width, h = cv.height;
    S.t++;
    c.clearRect(0, 0, w, h);

    const fuel = FUELS[S.fuelType];

    // Sky gradient — changes with CO2
    const warmth = Math.min(S.co2Level / 100, 1);
    const skyTop = `rgba(${Math.round(100 + warmth * 80)},${Math.round(180 - warmth * 60)},${Math.round(255 - warmth * 100)},1)`;
    const skyBot = `rgba(${Math.round(180 + warmth * 60)},${Math.round(220 - warmth * 80)},${Math.round(255 - warmth * 80)},1)`;
    const sky = c.createLinearGradient(0, 0, 0, h * 0.65);
    sky.addColorStop(0, skyTop); sky.addColorStop(1, skyBot);
    c.fillStyle = sky; c.fillRect(0, 0, w, h * 0.65);

    // Ground
    c.fillStyle = '#8B7355'; c.fillRect(0, h * 0.65, w, h * 0.35);
    c.fillStyle = '#5D4E37'; c.fillRect(0, h * 0.65, w, h * 0.05);

    // Factory
    const facX = w * 0.5, facW = w * 0.3, facH = h * 0.3;
    c.fillStyle = '#566573'; c.fillRect(facX - facW/2, h * 0.35, facW, facH);
    c.fillStyle = '#2C3E50'; c.fillRect(facX - facW/2, h * 0.3, facW * 0.6, h * 0.05);
    // chimneys
    const chimneys = [facX - facW*0.2, facX + facW*0.1];
    chimneys.forEach(cx => {
      c.fillStyle = '#784212';
      c.fillRect(cx - w*0.02, h*0.25, w*0.04, h*0.12);
    });

    // Emit particles
    if (S.burning && S.t % 3 === 0) {
      chimneys.forEach(cx => {
        S.particles.push({
          x: cx, y: h * 0.25,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -(1 + Math.random() * 2),
          life: 1, size: 6 + Math.random() * 8,
          type: Math.random() < 0.6 ? 'smoke' : 'co2'
        });
      });
      S.co2Level = Math.min(100, S.co2Level + fuel.co2Rate * 0.04);
      S.tempRise = S.co2Level * 0.035;
    }

    // Update & draw particles
    S.particles = S.particles.filter(p => p.life > 0);
    S.particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy *= 0.98; p.life -= 0.012;
      if (p.type === 'smoke') {
        c.globalAlpha = p.life * 0.6;
        c.fillStyle = '#AAA';
      } else {
        c.globalAlpha = p.life * 0.85;
        c.fillStyle = 'rgba(180,80,30,0.7)';
      }
      c.beginPath(); c.arc(p.x, p.y, p.size, 0, Math.PI * 2); c.fill();
      if (p.type === 'co2' && p.size > 10) {
        c.globalAlpha = p.life * 0.9;
        c.font = `bold ${Math.round(p.size * 0.8)}px Arial`;
        c.fillStyle = '#E74C3C'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('CO₂', p.x, p.y);
      }
      c.globalAlpha = 1;
    });

    // CO2 level bar
    const barX = w * 0.03, barY = h * 0.08, barW = w * 0.15, barH = h * 0.5;
    c.fillStyle = 'rgba(255,255,255,0.3)';
    c.beginPath(); c.roundRect(barX, barY, barW, barH, 8); c.fill();
    const fillH = barH * (S.co2Level / 100);
    const barGrad = c.createLinearGradient(0, barY + barH, 0, barY + barH - fillH);
    barGrad.addColorStop(0, '#27AE60'); barGrad.addColorStop(0.5, '#F39C12'); barGrad.addColorStop(1, '#E74C3C');
    c.fillStyle = barGrad;
    c.beginPath(); c.roundRect(barX, barY + barH - fillH, barW, fillH, 8); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 1.5;
    c.beginPath(); c.roundRect(barX, barY, barW, barH, 8); c.stroke();
    c.font = `bold ${Math.round(h * 0.028)}px Tajawal`;
    c.fillStyle = '#2C3E50'; c.textAlign = 'center';
    c.fillText('CO₂', barX + barW / 2, barY - h * 0.02);
    c.fillText(`${S.co2Level.toFixed(0)}%`, barX + barW / 2, barY + barH + h * 0.03);

    // Temperature indicator
    c.font = `bold ${Math.round(h * 0.032)}px Tajawal`;
    c.fillStyle = S.tempRise > 2 ? '#E74C3C' : '#27AE60'; c.textAlign = 'center';
    c.fillText(`🌡️ +${S.tempRise.toFixed(1)}°C`, w * 0.85, h * 0.15);
    c.font = `${Math.round(h * 0.027)}px Tajawal`;
    c.fillStyle = '#555';
    c.fillText('ارتفاع الحرارة', w * 0.85, h * 0.2);

    // Fuel info
    c.font = `bold ${Math.round(h * 0.032)}px Tajawal`;
    c.fillStyle = fuel.color; c.textAlign = 'center';
    c.fillText(`${fuel.icon} ${fuel.label}`, w * 0.5, h * 0.92);
    c.font = `${Math.round(h * 0.026)}px Tajawal`;
    c.fillStyle = '#555';
    c.fillText(`كفاءة الطاقة: ${(fuel.energy * 100).toFixed(0)}%  |  انبعاث CO₂: ${fuel.co2Rate > 2.5 ? '🔴 عالي' : fuel.co2Rate > 2 ? '🟡 متوسط' : '🟢 منخفض'}`, w * 0.5, h * 0.97);

    c.textBaseline = 'alphabetic';
    animFrame = requestAnimationFrame(() => { try { draw(); } catch(e) {} });
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// TAB 2: الاحتباس الحراري — المقارنة بين الكواكب
// ══════════════════════════════════════════════════════════════
function simE11Fossil2() {
  cancelAnimationFrame(animFrame);
  const cv = document.getElementById('simCanvas');
  const c  = cv.getContext('2d');

  if (!simState.e11f2) simState.e11f2 = { t: 0, co2Slider: 50, showZuhara: false };
  const S = simState.e11f2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌍 الاحتباس الحراري</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7">
        حرّك شريط CO₂ وشاهد<br>تأثيره على درجة الحرارة
      </div>
    </div>
    <div class="ctrl-label">نسبة CO₂ في الجو</div>
    <input type="range" id="e11f2co2" min="0" max="100" value="50"
      style="width:100%;margin:6px 0" oninput="simState.e11f2.co2Slider=+this.value">
    <div class="info-box" id="e11f2info">حرّك الشريط لتغيير CO₂</div>
    <button class="ctrl-btn" id="e11f2zuhra" style="width:100%;margin-top:6px;background:rgba(231,76,60,0.2);border-color:rgba(231,76,60,0.5);color:#E74C3C">
      🔴 قارن مع الزُّهرة
    </button>
    <div class="q-box" style="margin-top:10px">
      <strong>🔍 ماذا تستنتج؟</strong><br>
      ١- لماذا الزُّهرة أشدّ حرارة من الأرض رغم أنها أقرب للشمس؟<br>
      ٢- ما الفرق بين الاحتباس الحراري الطبيعي والمُتزايد؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">
        ١- لأن غلافها الجوي مليء بـ CO₂ (97%) مما يحبس الحرارة، فترتفع حرارتها إلى 400°C.<br>
        ٢- الطبيعي ضروري للحياة (يرفع الحرارة 33°C)، أما المتزايد فيحدث بسبب الأنشطة البشرية ويتجاوز الحدود الآمنة.
      </div>
    </div>
  `);

  btn('e11f2zuhra', () => {
    S.showZuhara = !S.showZuhara;
    document.getElementById('e11f2zuhra').textContent =
      S.showZuhara ? '🌍 عرض الأرض وحدها' : '🔴 قارن مع الزُّهرة';
  });

  function draw() {
    if (currentSim !== 'g9fossil' || currentTab !== 1) return;
    const w = cv.width, h = cv.height;
    S.t++;
    c.clearRect(0, 0, w, h);

    // Space background
    c.fillStyle = '#0A0A1A'; c.fillRect(0, 0, w, h);
    // Stars
    for (let i = 0; i < 60; i++) {
      const sx = (i * 137.5 * 13) % w, sy = (i * 97.3 * 17) % h;
      c.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(S.t * 0.05 + i) * 0.2})`;
      c.beginPath(); c.arc(sx, sy, 1.2, 0, Math.PI * 2); c.fill();
    }

    // Sun
    _drawSun(c, w * 0.08, h * 0.15, Math.min(w, h) * 0.07, S.t);

    const co2 = S.co2Slider / 100;
    const earthTemp = 15 + co2 * 35; // -20 to +50°C approx
    const tempColor = co2 < 0.3 ? '#3498DB' : co2 < 0.6 ? '#F39C12' : '#E74C3C';

    // Update info
    document.getElementById('e11f2info').innerHTML =
      `🌡️ درجة الحرارة: <strong style="color:${tempColor}">${earthTemp.toFixed(0)}°C</strong> | CO₂: ${S.co2Slider}%`;

    if (S.showZuhara) {
      // Two planets side by side
      const earthX = w * 0.28, zuharaX = w * 0.72, pY = h * 0.52;
      const pR = Math.min(w, h) * 0.14;

      // Earth
      const earthGrad = c.createRadialGradient(earthX - pR * 0.3, pY - pR * 0.3, 0, earthX, pY, pR);
      earthGrad.addColorStop(0, `rgba(${Math.round(100 + co2 * 100)},${Math.round(180 - co2 * 60)},${Math.round(255 - co2 * 100)},1)`);
      earthGrad.addColorStop(1, `rgba(${Math.round(30 + co2 * 60)},${Math.round(80 - co2 * 30)},${Math.round(140 - co2 * 60)},1)`);
      c.beginPath(); c.arc(earthX, pY, pR, 0, Math.PI * 2);
      c.fillStyle = earthGrad; c.fill();
      // Atmosphere glow
      const athick = 0.1 + co2 * 0.25;
      c.beginPath(); c.arc(earthX, pY, pR * (1 + athick), 0, Math.PI * 2);
      c.strokeStyle = `rgba(${Math.round(180 + co2 * 75)},${Math.round(120 - co2 * 60)},20,${0.3 + co2 * 0.4})`;
      c.lineWidth = pR * athick * 2; c.stroke();
      c.font = `bold ${Math.round(h * 0.035)}px Tajawal`;
      c.fillStyle = 'white'; c.textAlign = 'center';
      c.fillText('🌍 الأرض', earthX, pY + pR + h * 0.07);
      c.fillStyle = tempColor;
      c.fillText(`${earthTemp.toFixed(0)}°C`, earthX, pY + pR + h * 0.12);

      // Zuhara
      const zuGrad = c.createRadialGradient(zuharaX - pR * 0.3, pY - pR * 0.3, 0, zuharaX, pY, pR);
      zuGrad.addColorStop(0, '#FFCC44'); zuGrad.addColorStop(1, '#CC6600');
      c.beginPath(); c.arc(zuharaX, pY, pR, 0, Math.PI * 2);
      c.fillStyle = zuGrad; c.fill();
      c.beginPath(); c.arc(zuharaX, pY, pR * 1.3, 0, Math.PI * 2);
      c.strokeStyle = 'rgba(255,100,0,0.5)'; c.lineWidth = pR * 0.5; c.stroke();
      c.font = `bold ${Math.round(h * 0.035)}px Tajawal`;
      c.fillStyle = 'white'; c.textAlign = 'center';
      c.fillText('🔴 الزُّهرة', zuharaX, pY + pR + h * 0.07);
      c.fillStyle = '#E74C3C';
      c.fillText('~400°C', zuharaX, pY + pR + h * 0.12);

      c.font = `bold ${Math.round(h * 0.03)}px Tajawal`;
      c.fillStyle = '#FFF'; c.textAlign = 'center';
      c.fillText('الزُّهرة: 97% CO₂ في غلافها الجوي → تأثير احتباس حراري شديد!', w / 2, h * 0.9);
    } else {
      // Earth alone with greenhouse effect diagram
      const earthX = w * 0.5, earthY = h * 0.58;
      const pR = Math.min(w, h) * 0.18;

      // Greenhouse layer
      for (let layer = 3; layer >= 1; layer--) {
        c.beginPath(); c.arc(earthX, earthY, pR * (1 + layer * 0.12 * (0.5 + co2 * 0.5)), 0, Math.PI * 2);
        c.strokeStyle = `rgba(${Math.round(180 + co2 * 75)},${Math.round(120 - co2 * 80)},20,${0.15 * co2 * layer})`;
        c.lineWidth = pR * 0.1;
        c.stroke();
      }

      // Earth
      const earthGrad = c.createRadialGradient(earthX - pR * 0.3, earthY - pR * 0.3, 0, earthX, earthY, pR);
      earthGrad.addColorStop(0, `rgba(${Math.round(80 + co2 * 120)},${Math.round(160 - co2 * 60)},${Math.round(255 - co2 * 100)},1)`);
      earthGrad.addColorStop(1, `rgba(${Math.round(20 + co2 * 50)},${Math.round(70 - co2 * 20)},${Math.round(120 - co2 * 50)},1)`);
      c.beginPath(); c.arc(earthX, earthY, pR, 0, Math.PI * 2);
      c.fillStyle = earthGrad; c.fill();

      // Heat arrows
      const numArrows = Math.round(2 + co2 * 6);
      for (let i = 0; i < numArrows; i++) {
        const angle = (i / numArrows) * Math.PI * 2 + S.t * 0.01;
        const ax1 = earthX + Math.cos(angle) * pR * 1.05;
        const ay1 = earthY + Math.sin(angle) * pR * 1.05;
        const ax2 = earthX + Math.cos(angle) * pR * 1.5;
        const ay2 = earthY + Math.sin(angle) * pR * 1.5;
        c.strokeStyle = `rgba(255,${Math.round(150 - co2 * 100)},0,0.7)`;
        c.lineWidth = 2;
        c.beginPath(); c.moveTo(ax1, ay1); c.lineTo(ax2, ay2); c.stroke();
        // Arrowhead
        const aw = 6; const aAngle = Math.atan2(ay2 - ay1, ax2 - ax1);
        c.beginPath();
        c.moveTo(ax2, ay2);
        c.lineTo(ax2 - aw * Math.cos(aAngle - 0.5), ay2 - aw * Math.sin(aAngle - 0.5));
        c.lineTo(ax2 - aw * Math.cos(aAngle + 0.5), ay2 - aw * Math.sin(aAngle + 0.5));
        c.closePath(); c.fillStyle = `rgba(255,${Math.round(150 - co2 * 100)},0,0.7)`; c.fill();
      }

      c.font = `bold ${Math.round(h * 0.04)}px Tajawal`;
      c.fillStyle = tempColor; c.textAlign = 'center';
      c.fillText(`🌡️ ${earthTemp.toFixed(0)}°C`, earthX, earthY - pR - h * 0.05);
      c.font = `${Math.round(h * 0.028)}px Tajawal`;
      c.fillStyle = 'rgba(255,255,255,0.7)';
      c.fillText(co2 < 0.3 ? '✅ مستوى CO₂ آمن' : co2 < 0.6 ? '⚠️ مستوى CO₂ مرتفع' : '🚨 خطر الاحتباس الحراري!',
        earthX, earthY + pR + h * 0.08);
    }

    c.textBaseline = 'alphabetic';
    animFrame = requestAnimationFrame(() => { try { draw(); } catch(e) {} });
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// الاستقصاء 3 · الطاقة الشمسية والخلايا الشمسية
// TAB 1: كيف تعمل الخلية الشمسية
// ══════════════════════════════════════════════════════════════
function simE11Solar1() {
  cancelAnimationFrame(animFrame);
  const cv = document.getElementById('simCanvas');
  const c  = cv.getContext('2d');

  if (!simState.e11sol1) simState.e11sol1 = {
    t: 0, angle: 45, cloudy: 0, panelCount: 1,
    photons: [], electrons: []
  };
  const S = simState.e11sol1;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">☀️ الخلية الشمسية</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.75);line-height:1.7">
        حرّك الشريط لتغيير زاوية<br>
        الألواح الشمسية والغيوم
      </div>
    </div>
    <div class="ctrl-label">📐 زاوية الألواح: <span id="e11solAngle">45</span>°</div>
    <input type="range" id="e11solAngleSlider" min="0" max="90" value="45" style="width:100%;margin:4px 0"
      oninput="simState.e11sol1.angle=+this.value;document.getElementById('e11solAngle').textContent=this.value">
    <div class="ctrl-label" style="margin-top:8px">☁️ تغطية الغيوم: <span id="e11solCloud">0</span>%</div>
    <input type="range" id="e11solCloudSlider" min="0" max="100" value="0" style="width:100%;margin:4px 0"
      oninput="simState.e11sol1.cloudy=+this.value;document.getElementById('e11solCloud').textContent=this.value">
    <div class="ctrl-label" style="margin-top:8px">🔋 عدد الألواح: <span id="e11solPanels">1</span></div>
    <input type="range" id="e11solPanelSlider" min="1" max="5" value="1" style="width:100%;margin:4px 0"
      oninput="simState.e11sol1.panelCount=+this.value;document.getElementById('e11solPanels').textContent=this.value">
    <div class="info-box" id="e11solInfo">حرّك الأشرطة لمشاهدة التأثير</div>
    <div class="q-box">
      <strong>🔍 ماذا تستنتج؟</strong><br>
      ١- ما الزاوية المثلى للألواح الشمسية؟ ولماذا؟<br>
      ٢- كيف تُؤثر الغيوم على إنتاج الطاقة؟<br>
      ٣- كيف يُؤثر عدد الألواح على الطاقة المُنتجة؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">
        ١- الزاوية المثلى حين تكون الألواح عمودية على أشعة الشمس (90° مع الأشعة)، تختلف بحسب خطّ العرض.<br>
        ٢- الغيوم تحجب الأشعة وتُقلل الكمية الواصلة، مما يُخفض الإنتاج بنسبة كبيرة.<br>
        ٣- كلما زاد عدد الألواح زاد إنتاج الطاقة بشكل متناسب طردياً.
      </div>
    </div>
  `);

  function draw() {
    if (currentSim !== 'g9solar' || currentTab !== 0) return;
    const w = cv.width, h = cv.height;
    S.t++;
    c.clearRect(0, 0, w, h);

    const cloudFactor = 1 - S.cloudy / 120;
    const angleFactor = Math.sin((S.angle) * Math.PI / 180);
    const efficiency = cloudFactor * angleFactor * S.panelCount;
    const power = (efficiency * 200).toFixed(0); // Watts

    // Sky
    const sky = c.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, '#87CEEB'); sky.addColorStop(1, '#D6EAF8');
    c.fillStyle = sky; c.fillRect(0, 0, w, h * 0.6);

    // Clouds
    if (S.cloudy > 0) {
      c.globalAlpha = S.cloudy / 100;
      c.fillStyle = '#ECEFF1';
      const numClouds = Math.round(S.cloudy / 15);
      for (let i = 0; i < numClouds; i++) {
        const cx = (w * 0.1 + i * w * 0.2 + S.t * 0.3) % (w * 1.1) - w * 0.05;
        const cy = h * (0.08 + (i % 3) * 0.07);
        c.beginPath(); c.arc(cx, cy, h * 0.06, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(cx + h * 0.05, cy, h * 0.05, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(cx - h * 0.05, cy, h * 0.04, 0, Math.PI * 2); c.fill();
      }
      c.globalAlpha = 1;
    }

    // Sun
    _drawSun(c, w * 0.15, h * 0.12, Math.min(w, h) * 0.06 * cloudFactor, S.t);

    // Photon particles
    if (S.t % 4 === 0 && cloudFactor > 0.2) {
      S.photons.push({
        x: w * 0.15, y: h * 0.12,
        tx: w * 0.5 + (Math.random() - 0.5) * w * 0.3,
        ty: h * 0.6,
        progress: 0, speed: 0.02 + Math.random() * 0.01
      });
    }
    S.photons = S.photons.filter(p => p.progress < 1);
    S.photons.forEach(p => {
      p.progress += p.speed;
      const px = p.x + (p.tx - p.x) * p.progress;
      const py = p.y + (p.ty - p.y) * p.progress;
      c.globalAlpha = (1 - p.progress) * cloudFactor;
      c.fillStyle = '#FFD700';
      c.beginPath(); c.arc(px, py, 5, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;
    });

    // Ground
    c.fillStyle = '#8B7355'; c.fillRect(0, h * 0.6, w, h * 0.4);
    c.fillStyle = '#5D4E37'; c.fillRect(0, h * 0.6, w, h * 0.04);

    // Solar panels
    const panelW = w * 0.12, panelH = h * 0.04;
    const startX = w * 0.3;
    for (let p = 0; p < S.panelCount; p++) {
      const px = startX + p * (panelW + w * 0.04);
      const py = h * 0.56;
      c.save();
      c.translate(px + panelW / 2, py + panelH / 2);
      c.rotate(-(S.angle - 45) * Math.PI / 180);
      c.fillStyle = '#1A5276';
      c.fillRect(-panelW / 2, -panelH / 2, panelW, panelH);
      // Panel cells
      c.strokeStyle = 'rgba(100,180,255,0.5)'; c.lineWidth = 1;
      for (let r = 0; r < 3; r++) {
        for (let col = 0; col < 4; col++) {
          c.strokeRect(-panelW / 2 + col * panelW / 4, -panelH / 2 + r * panelH / 3, panelW / 4, panelH / 3);
        }
      }
      c.strokeStyle = 'rgba(52,152,219,0.9)'; c.lineWidth = 2;
      c.strokeRect(-panelW / 2, -panelH / 2, panelW, panelH);
      c.restore();
      // Support pole
      c.fillStyle = '#AAA'; c.fillRect(px + panelW / 2 - 3, py + panelH, 6, h * 0.05);
    }

    // Power output display
    const outputColor = +power > 120 ? '#27AE60' : +power > 60 ? '#F39C12' : '#E74C3C';
    c.font = `bold ${Math.round(h * 0.05)}px Tajawal`;
    c.fillStyle = outputColor; c.textAlign = 'center';
    c.fillText(`⚡ ${power} W`, w * 0.82, h * 0.35);

    const pct = (efficiency / S.panelCount * 100).toFixed(0);
    c.font = `${Math.round(h * 0.03)}px Tajawal`;
    c.fillStyle = '#2C3E50';
    c.fillText(`كفاءة: ${pct}%`, w * 0.82, h * 0.42);

    // Meter bar
    const mX = w * 0.75, mY = h * 0.18, mW = w * 0.14, mH = h * 0.12;
    c.fillStyle = 'rgba(255,255,255,0.3)';
    c.beginPath(); c.roundRect(mX, mY, mW, mH, 6); c.fill();
    const mFill = efficiency / S.panelCount;
    const mGrad = c.createLinearGradient(mX, mY + mH, mX, mY);
    mGrad.addColorStop(0, '#E74C3C'); mGrad.addColorStop(0.5, '#F39C12'); mGrad.addColorStop(1, '#27AE60');
    c.fillStyle = mGrad;
    c.fillRect(mX, mY + mH * (1 - mFill), mW, mH * mFill);
    c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 1.5;
    c.beginPath(); c.roundRect(mX, mY, mW, mH, 6); c.stroke();
    c.font = `${Math.round(h * 0.025)}px Tajawal`;
    c.fillStyle = '#2C3E50'; c.textAlign = 'center';
    c.fillText('الطاقة', mX + mW / 2, mY - h * 0.015);

    document.getElementById('e11solInfo').innerHTML =
      `⚡ <strong>${power}W</strong> | زاوية: ${S.angle}° | غيوم: ${S.cloudy}% | ألواح: ${S.panelCount}`;

    c.textBaseline = 'alphabetic';
    animFrame = requestAnimationFrame(() => { try { draw(); } catch(e) {} });
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// TAB 2: السخّان الشمسي — تجربة تفاعلية
// ══════════════════════════════════════════════════════════════
function simE11Solar2() {
  cancelAnimationFrame(animFrame);
  const cv = document.getElementById('simCanvas');
  const c  = cv.getContext('2d');

  if (!simState.e11sol2) simState.e11sol2 = {
    t: 0, waterTemp: 20, sunIntensity: 80, color: 'black',
    running: false, elapsed: 0
  };
  const S = simState.e11sol2;
  const MAX_TEMP = 90;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌡️ السخّان الشمسي</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7">
        جرّب عوامل مختلفة وشاهد<br>
        تأثيرها على تسخين الماء
      </div>
    </div>
    <div class="ctrl-label">☀️ شدة الشمس: <span id="e11sol2sun">80</span>%</div>
    <input type="range" id="e11sol2sunSlider" min="10" max="100" value="80" style="width:100%;margin:4px 0"
      oninput="simState.e11sol2.sunIntensity=+this.value;document.getElementById('e11sol2sun').textContent=this.value">
    <div class="ctrl-label" style="margin-top:8px">🎨 لون السخّان</div>
    <div style="display:flex;gap:6px;margin:4px 0">
      <button class="ctrl-btn on" id="e11sol2black" style="flex:1;background:#222;border-color:#555;color:white">⬛ أسود</button>
      <button class="ctrl-btn" id="e11sol2silver" style="flex:1;background:rgba(180,180,180,0.2);border-color:#AAA;color:#CCC">🔲 فضي</button>
      <button class="ctrl-btn" id="e11sol2white" style="flex:1;background:rgba(255,255,255,0.15);border-color:rgba(255,255,255,0.5);color:white">⬜ أبيض</button>
    </div>
    <button class="ctrl-btn" id="e11sol2run" style="width:100%;margin-top:6px;background:rgba(231,76,60,0.25);border-color:rgba(231,76,60,0.6);color:#E74C3C">▶️ تشغيل</button>
    <button class="ctrl-btn" id="e11sol2reset" style="width:100%;margin-top:4px;background:rgba(52,152,219,0.15);border-color:rgba(52,152,219,0.4);color:#3498DB">🔄 إعادة</button>
    <div class="info-box" id="e11sol2info">اضبط الإعدادات وابدأ</div>
    <div class="q-box">
      <strong>🔍 ماذا تستنتج؟</strong><br>
      ١- أيّ لون يُسخّن الماء أسرع؟ ولماذا؟<br>
      ٢- لماذا تُطلى السخّانات الشمسية باللون الأسود؟<br>
      ٣- ما العلاقة بين شدة الشمس وسرعة التسخين؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">
        ١- الأسود يُسخّن أسرع لأنه يمتص معظم الإشعاع الشمسي.<br>
        ٢- لون أسود يمتص الحرارة بشكل أكبر مقارنةً بالألوان الفاتحة، مما يزيد الكفاءة.<br>
        ٣- كلما زادت شدة الشمس ارتفعت درجة الحرارة بشكل أسرع — علاقة طردية.
      </div>
    </div>
  `);

  ['black','silver','white'].forEach(col => {
    btn(`e11sol2${col}`, () => {
      S.color = col;
      ['black','silver','white'].forEach(x =>
        document.getElementById(`e11sol2${x}`)?.classList.remove('on'));
      document.getElementById(`e11sol2${col}`)?.classList.add('on');
    });
  });
  btn('e11sol2run', () => { S.running = !S.running; });
  btn('e11sol2reset', () => {
    S.running = false; S.waterTemp = 20; S.elapsed = 0;
    document.getElementById('e11sol2info').textContent = 'تمت الإعادة';
  });

  const absorp = { black: 0.95, silver: 0.45, white: 0.15 };
  const colorMap = { black: '#222', silver: '#AAB7B8', white: '#F2F3F4' };

  function draw() {
    if (currentSim !== 'g9solar' || currentTab !== 1) return;
    const w = cv.width, h = cv.height;
    S.t++;

    if (S.running && S.waterTemp < MAX_TEMP) {
      S.waterTemp += absorp[S.color] * (S.sunIntensity / 100) * 0.08;
      S.elapsed += 0.016;
    }

    c.clearRect(0, 0, w, h);
    const sky = c.createLinearGradient(0, 0, 0, h * 0.5);
    sky.addColorStop(0, '#87CEEB'); sky.addColorStop(1, '#D6EAF8');
    c.fillStyle = sky; c.fillRect(0, 0, w, h * 0.5);
    c.fillStyle = '#8B7355'; c.fillRect(0, h * 0.5, w, h * 0.5);

    // Sun
    _drawSun(c, w * 0.15, h * 0.12, Math.min(w,h) * 0.06 * (S.sunIntensity/100), S.t);

    // Rays to heater
    if (S.running || S.sunIntensity > 0) {
      const numRays = Math.round(S.sunIntensity / 15);
      for (let i = 0; i < numRays; i++) {
        const angle = -0.3 + i * 0.12;
        c.strokeStyle = `rgba(255,215,0,${0.3 + 0.04 * i})`;
        c.lineWidth = 2;
        c.setLineDash([6, 4]);
        c.beginPath();
        c.moveTo(w * 0.18, h * 0.14);
        c.lineTo(w * 0.48 + i * w * 0.04, h * 0.44);
        c.stroke();
      }
      c.setLineDash([]);
    }

    // Heater box
    const hx = w * 0.35, hy = h * 0.42, hW = w * 0.3, hH = h * 0.12;
    c.fillStyle = colorMap[S.color];
    c.beginPath(); c.roundRect(hx, hy, hW, hH, 8); c.fill();
    c.strokeStyle = '#555'; c.lineWidth = 2;
    c.beginPath(); c.roundRect(hx, hy, hW, hH, 8); c.stroke();
    // Water inside heater
    const waterFill = Math.min((S.waterTemp - 20) / (MAX_TEMP - 20), 1);
    const waterColor = `rgba(${Math.round(30 + waterFill * 200)},${Math.round(150 - waterFill * 100)},${Math.round(220 - waterFill * 180)},0.7)`;
    c.fillStyle = waterColor;
    c.beginPath(); c.roundRect(hx + 4, hy + hH * (1 - waterFill * 0.8), hW - 8, hH * waterFill * 0.8, 6); c.fill();

    // Thermometer
    const thX = w * 0.74, thY = h * 0.22, thH = h * 0.45;
    c.fillStyle = 'rgba(255,255,255,0.4)';
    c.beginPath(); c.roundRect(thX - 8, thY, 16, thH, 8); c.fill();
    c.strokeStyle = '#888'; c.lineWidth = 1.5;
    c.beginPath(); c.roundRect(thX - 8, thY, 16, thH, 8); c.stroke();
    const tempFill = (S.waterTemp - 20) / (MAX_TEMP - 20);
    const tg = c.createLinearGradient(0, thY + thH, 0, thY);
    tg.addColorStop(0, '#3498DB'); tg.addColorStop(0.5, '#F39C12'); tg.addColorStop(1, '#E74C3C');
    c.fillStyle = tg;
    c.beginPath(); c.roundRect(thX - 6, thY + thH * (1 - tempFill), 12, thH * tempFill, 6); c.fill();
    c.beginPath(); c.arc(thX, thY + thH + 12, 14, 0, Math.PI * 2);
    c.fillStyle = '#E74C3C'; c.fill();
    c.font = `bold ${Math.round(h * 0.038)}px Tajawal`;
    c.fillStyle = '#2C3E50'; c.textAlign = 'center';
    c.fillText(`${S.waterTemp.toFixed(1)}°C`, thX, thY - h * 0.025);

    // Temp marks
    [20, 40, 60, 80].forEach(t => {
      const my = thY + thH - (t - 20) / (MAX_TEMP - 20) * thH;
      c.strokeStyle = '#888'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(thX + 8, my); c.lineTo(thX + 18, my); c.stroke();
      c.font = `${Math.round(h * 0.022)}px Arial`;
      c.fillStyle = '#666'; c.textAlign = 'left';
      c.fillText(`${t}°`, thX + 20, my + 4);
    });

    // Stats
    c.font = `bold ${Math.round(h * 0.035)}px Tajawal`;
    c.fillStyle = '#2C3E50'; c.textAlign = 'center';
    c.fillText(S.running ? '🔥 يسخّن...' : '⏸️ متوقف', w / 2, h * 0.73);
    c.font = `${Math.round(h * 0.028)}px Tajawal`;
    c.fillStyle = '#555';
    c.fillText(`الوقت: ${S.elapsed.toFixed(0)}s | لون: ${S.color === 'black' ? 'أسود' : S.color === 'silver' ? 'فضي' : 'أبيض'}`, w / 2, h * 0.79);

    document.getElementById('e11sol2info').innerHTML =
      `🌡️ ${S.waterTemp.toFixed(1)}°C | امتصاص: ${(absorp[S.color]*100).toFixed(0)}% | شمس: ${S.sunIntensity}%`;

    if (S.waterTemp >= MAX_TEMP - 1 && S.running) {
      S.running = false;
      U9Sound.win();
      document.getElementById('e11sol2info').textContent = '✅ وصل الماء للدرجة القصوى!';
    }

    c.textBaseline = 'alphabetic';
    animFrame = requestAnimationFrame(() => { try { draw(); } catch(e) {} });
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// الاستقصاء 4 · الكفاءة — حساب تفاعلي
// TAB 1: مفهوم الكفاءة وتأثير الطاقة المهدورة
// ══════════════════════════════════════════════════════════════
function simE11Efficiency1() {
  cancelAnimationFrame(animFrame);
  const cv = document.getElementById('simCanvas');
  const c  = cv.getContext('2d');

  const DEVICES = [
    { id: 'led',     label: 'مصباح LED',          icon: '💡', efficiency: 0.90, inColor: '#F39C12', lossType: 'حرارة' },
    { id: 'bulb',    label: 'مصباح تنغستن',        icon: '🔆', efficiency: 0.15, inColor: '#FFAA00', lossType: 'حرارة' },
    { id: 'engine',  label: 'محرّك ديزل',          icon: '🚗', efficiency: 0.40, inColor: '#8E44AD', lossType: 'حرارة + غاز' },
    { id: 'solar',   label: 'خلية شمسية',          icon: '☀️', efficiency: 0.22, inColor: '#F39C12', lossType: 'حرارة' },
    { id: 'hydro',   label: 'توربين كهرومائي',     icon: '💧', efficiency: 0.90, inColor: '#2980B9', lossType: 'احتكاك' },
    { id: 'boiler',  label: 'مرجل بخاري',           icon: '♨️', efficiency: 0.85, inColor: '#E74C3C', lossType: 'حرارة' },
  ];

  if (!simState.e11eff1) simState.e11eff1 = {
    selected: 0, inputEnergy: 100, t: 0, particles: []
  };
  const S = simState.e11eff1;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⚙️ كفاءة الأجهزة</div>
    </div>
    ${DEVICES.map((d, i) =>
      `<button class="ctrl-btn${S.selected === i ? ' on' : ''}" id="e11eff1dev${i}"
        style="width:100%;margin-bottom:4px;${S.selected===i?`background:${d.inColor}22;border-color:${d.inColor};color:${d.inColor}`:''}"
        >${d.icon} ${d.label} (${(d.efficiency*100).toFixed(0)}%)</button>`
    ).join('')}
    <div class="ctrl-label" style="margin-top:8px">⚡ طاقة الدخل: <span id="e11eff1E">100</span> J</div>
    <input type="range" id="e11eff1slider" min="10" max="500" value="100" style="width:100%;margin:4px 0"
      oninput="simState.e11eff1.inputEnergy=+this.value;document.getElementById('e11eff1E').textContent=this.value">
    <div class="info-box" id="e11eff1info">اختر جهازاً لحساب كفاءته</div>
    <div class="q-box">
      <strong>🔍 ماذا تستنتج؟</strong><br>
      ١- أيّ الأجهزة أعلى كفاءة؟ ما سبب ذلك؟<br>
      ٢- إلى ماذا تتحوّل الطاقة المهدورة في معظم الأجهزة؟<br>
      ٣- كيف يُمكن تقليل هدر الطاقة في السيارات؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">
        ١- مصباح LED والتوربين الكهرومائي (90%) — لأنهما يُحوّلان معظم الطاقة مباشرةً دون حرق.<br>
        ٢- الطاقة المهدورة تتحوّل إلى طاقة حرارية في معظم الأحيان.<br>
        ٣- التصميم الانسيابي، وتقليل الاحتكاك، واستخدام ناقلات حركة أكثر كفاءة.
      </div>
    </div>
  `);

  DEVICES.forEach((d, i) => {
    btn(`e11eff1dev${i}`, () => {
      S.selected = i; S.particles = [];
      DEVICES.forEach((_, j) => document.getElementById(`e11eff1dev${j}`)?.classList.remove('on'));
      document.getElementById(`e11eff1dev${i}`)?.classList.add('on');
    });
  });

  function draw() {
    if (currentSim !== 'g9efficiency' || currentTab !== 0) return;
    const w = cv.width, h = cv.height;
    S.t++;
    c.clearRect(0, 0, w, h);

    const bg = c.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#EBF5FB'); bg.addColorStop(1, '#D6EAF8');
    c.fillStyle = bg; c.fillRect(0, 0, w, h);

    const dev = DEVICES[S.selected];
    const Ein = S.inputEnergy;
    const Eout = Ein * dev.efficiency;
    const Eloss = Ein - Eout;
    const eff = (dev.efficiency * 100).toFixed(0);

    // Update info
    document.getElementById('e11eff1info').innerHTML =
      `طاقة دخل: <strong>${Ein}J</strong> | خرج: <strong>${Eout.toFixed(1)}J</strong> | هدر: <strong>${Eloss.toFixed(1)}J</strong>`;

    // Title
    c.font = `bold ${Math.round(h * 0.042)}px Arial`;
    c.fillStyle = '#2C3E50'; c.textAlign = 'center';
    c.fillText(dev.icon, w / 2, h * 0.1);
    c.font = `bold ${Math.round(h * 0.036)}px Tajawal`;
    c.fillText(dev.label, w / 2, h * 0.17);

    // Energy flow diagram
    const flowY = h * 0.28, boxH = h * 0.12;

    // Input arrow
    const inW = w * 0.2;
    c.fillStyle = dev.inColor;
    c.beginPath(); c.roundRect(w * 0.05, flowY, inW, boxH, 8); c.fill();
    c.font = `bold ${Math.round(h * 0.03)}px Tajawal`;
    c.fillStyle = 'white'; c.textAlign = 'center';
    c.fillText(`دخل`, w * 0.05 + inW / 2, flowY + boxH * 0.45);
    c.fillText(`${Ein} J`, w * 0.05 + inW / 2, flowY + boxH * 0.8);

    // Arrow →
    c.strokeStyle = '#2C3E50'; c.lineWidth = 3; c.setLineDash([]);
    c.beginPath(); c.moveTo(w * 0.26, flowY + boxH / 2); c.lineTo(w * 0.38, flowY + boxH / 2); c.stroke();
    c.beginPath();
    c.moveTo(w * 0.38, flowY + boxH / 2);
    c.lineTo(w * 0.35, flowY + boxH / 2 - 8);
    c.lineTo(w * 0.35, flowY + boxH / 2 + 8);
    c.closePath(); c.fillStyle = '#2C3E50'; c.fill();

    // Device box
    c.fillStyle = '#EBF5FB';
    c.beginPath(); c.roundRect(w * 0.38, flowY - boxH * 0.15, w * 0.24, boxH * 1.3, 12); c.fill();
    c.strokeStyle = '#2C3E50'; c.lineWidth = 2;
    c.beginPath(); c.roundRect(w * 0.38, flowY - boxH * 0.15, w * 0.24, boxH * 1.3, 12); c.stroke();
    c.font = `${Math.round(h * 0.045)}px Arial`;
    c.fillStyle = '#2C3E50'; c.textAlign = 'center';
    c.fillText(dev.icon, w * 0.5, flowY + boxH * 0.5);
    c.font = `bold ${Math.round(h * 0.028)}px Tajawal`;
    c.fillText(`كفاءة ${eff}%`, w * 0.5, flowY + boxH * 0.88);

    // Useful output arrow
    c.strokeStyle = '#27AE60'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(w * 0.63, flowY + boxH / 2); c.lineTo(w * 0.75, flowY + boxH / 2); c.stroke();
    c.beginPath();
    c.moveTo(w * 0.75, flowY + boxH / 2);
    c.lineTo(w * 0.72, flowY + boxH / 2 - 8);
    c.lineTo(w * 0.72, flowY + boxH / 2 + 8);
    c.closePath(); c.fillStyle = '#27AE60'; c.fill();
    const outW = w * 0.18;
    c.fillStyle = '#27AE60';
    c.beginPath(); c.roundRect(w * 0.76, flowY, outW, boxH, 8); c.fill();
    c.font = `bold ${Math.round(h * 0.03)}px Tajawal`;
    c.fillStyle = 'white'; c.textAlign = 'center';
    c.fillText('خرج مفيد', w * 0.76 + outW / 2, flowY + boxH * 0.45);
    c.fillText(`${Eout.toFixed(1)} J`, w * 0.76 + outW / 2, flowY + boxH * 0.8);

    // Loss arrow (downward)
    c.strokeStyle = '#E74C3C'; c.lineWidth = 2.5;
    c.setLineDash([6, 4]);
    c.beginPath(); c.moveTo(w * 0.5, flowY + boxH * 1.15); c.lineTo(w * 0.5, flowY + boxH * 2); c.stroke();
    c.setLineDash([]);
    c.beginPath();
    c.moveTo(w * 0.5, flowY + boxH * 2);
    c.lineTo(w * 0.5 - 8, flowY + boxH * 1.85);
    c.lineTo(w * 0.5 + 8, flowY + boxH * 1.85);
    c.closePath(); c.fillStyle = '#E74C3C'; c.fill();
    c.fillStyle = '#E74C3C';
    c.beginPath(); c.roundRect(w * 0.36, flowY + boxH * 2.0, w * 0.28, boxH * 0.7, 8); c.fill();
    c.font = `bold ${Math.round(h * 0.03)}px Tajawal`;
    c.fillStyle = 'white'; c.textAlign = 'center';
    c.fillText(`هدر (${dev.lossType}): ${Eloss.toFixed(1)} J`, w * 0.5, flowY + boxH * 2.42);

    // Pie chart
    const pieX = w * 0.5, pieY = h * 0.82, pieR = Math.min(w, h) * 0.09;
    const startAngle = -Math.PI / 2;
    const usefulAngle = (dev.efficiency) * Math.PI * 2;
    c.beginPath(); c.moveTo(pieX, pieY);
    c.arc(pieX, pieY, pieR, startAngle, startAngle + usefulAngle);
    c.closePath(); c.fillStyle = '#27AE60'; c.fill();
    c.beginPath(); c.moveTo(pieX, pieY);
    c.arc(pieX, pieY, pieR, startAngle + usefulAngle, startAngle + Math.PI * 2);
    c.closePath(); c.fillStyle = '#E74C3C'; c.fill();
    c.strokeStyle = 'white'; c.lineWidth = 2;
    c.beginPath(); c.arc(pieX, pieY, pieR, 0, Math.PI * 2); c.stroke();
    c.font = `${Math.round(h * 0.025)}px Tajawal`;
    c.fillStyle = '#27AE60'; c.textAlign = 'center';
    c.fillText(`✅ ${eff}%`, pieX, pieY + pieR + h * 0.04);
    c.fillStyle = '#E74C3C';
    c.fillText(`❌ ${(100 - +eff)}%`, pieX, pieY + pieR + h * 0.08);

    c.textBaseline = 'alphabetic';
    animFrame = requestAnimationFrame(() => { try { draw(); } catch(e) {} });
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// TAB 2: حساب الكفاءة — أسئلة تفاعلية
// ══════════════════════════════════════════════════════════════
function simE11Efficiency2() {
  cancelAnimationFrame(animFrame);
  const cv = document.getElementById('simCanvas');
  const c  = cv.getContext('2d');

  const QUESTIONS = [
    { q: 'مصباح يستهلك 100 J ويُنتج 15 J ضوءاً.\nما كفاءته؟', answer: 15, unit: '%', hint: '(15÷100)×100' },
    { q: 'محرّك كهربائي يستهلك 500 W ويُنتج\n200 W طاقة حركية. ما كفاءته؟', answer: 40, unit: '%', hint: '(200÷500)×100' },
    { q: 'سخّان يستهلك 2000 J ويُنتج 1700 J\nحرارة مفيدة. ما كفاءته؟', answer: 85, unit: '%', hint: '(1700÷2000)×100' },
    { q: 'توربين رياح يستهلك 10 kJ طاقة رياح\nويُنتج 3.5 kJ كهرباء. ما كفاءته؟', answer: 35, unit: '%', hint: '(3.5÷10)×100' },
    { q: 'محطة كهرومائية كفاءتها 92%.\nإذا دخل 50000 J، كم الخرج المفيد؟', answer: 46000, unit: 'J', hint: '50000 × 0.92' },
  ];

  if (!simState.e11eff2) simState.e11eff2 = {
    qIdx: 0, userInput: '', answered: false, correct: false, score: 0, t: 0
  };
  const S = simState.e11eff2;

  const updateCtrl = () => {
    const q = QUESTIONS[S.qIdx];
    controls(`
      <div class="ctrl-section">
        <div class="ctrl-label">🧮 احسب الكفاءة</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.6)">سؤال ${S.qIdx+1} من ${QUESTIONS.length}</div>
      </div>
      <div class="info-box" style="font-size:13px;line-height:1.8">
        <strong>📐 المعادلة:</strong><br>
        الكفاءة = (الطاقة الخارجة ÷ الطاقة الداخلة) × 100%
      </div>
      <div class="ctrl-label" style="margin-top:8px">💡 تلميح</div>
      <div class="info-box" id="e11eff2hint" style="font-size:13px;cursor:pointer" onclick="this.textContent='${q.hint}'">
        اضغط لرؤية التلميح
      </div>
      <div class="ctrl-label" style="margin-top:8px">إجابتك (${q.unit})</div>
      <input type="number" id="e11eff2input" placeholder="أدخل الإجابة..."
        style="width:100%;padding:8px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.3);
          background:rgba(255,255,255,0.15);color:white;font-family:Tajawal;font-size:16px;
          box-sizing:border-box;direction:ltr"
        oninput="simState.e11eff2.userInput=this.value">
      <button class="ctrl-btn" id="e11eff2check" style="width:100%;margin-top:6px;background:rgba(39,174,96,0.25);border-color:rgba(39,174,96,0.5);color:#2DC653">
        ✅ تحقق
      </button>
      <div id="e11eff2result" style="text-align:center;font-size:16px;margin-top:6px;color:white"></div>
      <button class="ctrl-btn" id="e11eff2next" style="width:100%;margin-top:4px;background:rgba(52,152,219,0.2);border-color:rgba(52,152,219,0.5);color:#3498DB">
        ⏭️ السؤال التالي
      </button>
      <div class="info-box" style="margin-top:6px">النتيجة: ${S.score}/${S.qIdx} ✅</div>
      <div class="q-box">
        <strong>🔍 ماذا تستنتج؟</strong><br>
        بعد حلّك للأسئلة: ما أهمية حساب كفاءة الجهاز؟ وكيف يُساعدنا في ترشيد استهلاك الطاقة؟
        <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
        <div class="q-ans-panel">
          حساب الكفاءة يساعدنا في اختيار الأجهزة الأكثر اقتصاداً، وتقليل الطاقة المهدورة، مما يُخفض التكاليف ويُقلل التلوث البيئي.
        </div>
      </div>
    `);

    btn('e11eff2check', () => {
      const ans = parseFloat(S.userInput);
      const q2 = QUESTIONS[S.qIdx];
      const tolerance = q2.answer * 0.02 + 0.5;
      S.answered = true;
      S.correct = Math.abs(ans - q2.answer) <= tolerance;
      if (S.correct) { S.score++; U9Sound.win(); }
      else U9Sound.ping(220, 0.2, 0.15);
      const resultEl = document.getElementById('e11eff2result');
      if (resultEl) {
        resultEl.innerHTML = S.correct
          ? `<span style="color:#2DC653;font-size:18px">✅ صحيح! الإجابة: ${q2.answer} ${q2.unit}</span>`
          : `<span style="color:#E74C3C;font-size:18px">❌ خطأ! الصواب: ${q2.answer} ${q2.unit}</span>`;
      }
    });

    btn('e11eff2next', () => {
      S.qIdx = (S.qIdx + 1) % QUESTIONS.length;
      S.userInput = ''; S.answered = false; S.correct = false;
      updateCtrl();
    });
  };
  updateCtrl();

  function draw() {
    if (currentSim !== 'g9efficiency' || currentTab !== 1) return;
    const w = cv.width, h = cv.height;
    S.t++;
    c.clearRect(0, 0, w, h);

    const bg = c.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#F4ECF7'); bg.addColorStop(1, '#E8DAEF');
    c.fillStyle = bg; c.fillRect(0, 0, w, h);

    const q = QUESTIONS[S.qIdx];

    // Question box
    c.fillStyle = 'rgba(155,89,182,0.12)';
    c.beginPath(); c.roundRect(w*0.04, h*0.06, w*0.92, h*0.28, 16); c.fill();
    c.strokeStyle = 'rgba(155,89,182,0.5)'; c.lineWidth = 2;
    c.beginPath(); c.roundRect(w*0.04, h*0.06, w*0.92, h*0.28, 16); c.stroke();

    c.font = `bold ${Math.round(h * 0.035)}px Tajawal`;
    c.fillStyle = '#6C3483'; c.textAlign = 'center';
    c.fillText(`❓ سؤال ${S.qIdx + 1}`, w / 2, h * 0.12);

    c.font = `${Math.round(h * 0.033)}px Tajawal`;
    c.fillStyle = '#2C3E50'; c.textAlign = 'center';
    const lines = q.q.split('\n');
    lines.forEach((line, i) => {
      c.fillText(line, w / 2, h * 0.19 + i * h * 0.07);
    });

    // Formula reminder
    c.fillStyle = 'rgba(39,174,96,0.1)';
    c.beginPath(); c.roundRect(w*0.08, h*0.38, w*0.84, h*0.14, 12); c.fill();
    c.strokeStyle = 'rgba(39,174,96,0.4)'; c.lineWidth = 1.5;
    c.beginPath(); c.roundRect(w*0.08, h*0.38, w*0.84, h*0.14, 12); c.stroke();
    c.font = `bold ${Math.round(h * 0.03)}px Tajawal`;
    c.fillStyle = '#1E8449'; c.textAlign = 'center';
    c.fillText('الكفاءة = (الطاقة الخارجة ÷ الطاقة الداخلة) × 100%', w / 2, h * 0.47);

    // Answer display
    if (S.answered) {
      const color = S.correct ? '#27AE60' : '#E74C3C';
      const icon = S.correct ? '✅' : '❌';
      c.font = `bold ${Math.round(h * 0.06)}px Arial`;
      c.fillStyle = color; c.textAlign = 'center';
      c.fillText(icon, w / 2, h * 0.65);
      c.font = `bold ${Math.round(h * 0.04)}px Tajawal`;
      c.fillText(S.correct ? 'أحسنت! 🎉' : `الصواب: ${q.answer} ${q.unit}`, w / 2, h * 0.73);
    }

    // Score bar
    const sw = w * 0.7, sx = (w - sw) / 2, sy = h * 0.85;
    c.fillStyle = 'rgba(0,0,0,0.1)';
    c.beginPath(); c.roundRect(sx, sy, sw, h * 0.04, 6); c.fill();
    const sfill = (S.score / QUESTIONS.length) * sw;
    c.fillStyle = '#27AE60';
    c.beginPath(); c.roundRect(sx, sy, sfill, h * 0.04, 6); c.fill();
    c.font = `bold ${Math.round(h * 0.03)}px Tajawal`;
    c.fillStyle = '#2C3E50'; c.textAlign = 'center';
    c.fillText(`${S.score} / ${QUESTIONS.length} صحيحة`, w / 2, sy + h * 0.07);

    c.textBaseline = 'alphabetic';
    animFrame = requestAnimationFrame(() => { try { draw(); } catch(e) {} });
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// الاستقصاء 5 · الطاقة الكهرومائية وطاقة المدّ والجزر
// TAB 1: كيف تعمل السدود الكهرومائية
// ══════════════════════════════════════════════════════════════
function simE11Hydro1() {
  cancelAnimationFrame(animFrame);
  const cv = document.getElementById('simCanvas');
  const c  = cv.getContext('2d');

  if (!simState.e11hyd1) simState.e11hyd1 = {
    t: 0, waterLevel: 0.7, gateOpen: false, turbineSpeed: 0,
    powerOutput: 0, particles: []
  };
  const S = simState.e11hyd1;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">💧 السدّ الكهرومائي</div>
    </div>
    <div class="ctrl-label">💧 مستوى المياه: <span id="e11hyd1Level">70</span>%</div>
    <input type="range" id="e11hyd1LevelSlider" min="20" max="100" value="70" style="width:100%;margin:4px 0"
      oninput="simState.e11hyd1.waterLevel=this.value/100;document.getElementById('e11hyd1Level').textContent=this.value">
    <button class="ctrl-btn" id="e11hyd1gate" style="width:100%;margin-top:8px;background:rgba(52,152,219,0.25);border-color:rgba(52,152,219,0.6);color:#3498DB">
      🚪 فتح / إغلاق البوّابة
    </button>
    <div class="info-box" id="e11hyd1info">افتح البوّابة لتشغيل التوربين</div>
    <div class="q-box">
      <strong>🔍 ماذا تستنتج؟</strong><br>
      ١- ما نوع الطاقة الذي يتحوّل إلى كهرباء في السدّ؟<br>
      ٢- كيف يُؤثر ارتفاع مستوى الماء على الطاقة المُنتجة؟<br>
      ٣- لماذا تُعدّ الطاقة الكهرومائية من أفضل المصادر؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">
        ١- تتحوّل طاقة الوضع (المخزّنة في المياه المرتفعة) إلى طاقة حركية ثم كهربائية.<br>
        ٢- كلما ارتفع المستوى زادت طاقة الوضع وبالتالي زادت الكهرباء المُنتجة.<br>
        ٣- لأنها متجددة، ولا تُنتج انبعاثات، وتوفر طاقة مستمرة وموثوقة.
      </div>
    </div>
  `);

  btn('e11hyd1gate', () => {
    S.gateOpen = !S.gateOpen;
    document.getElementById('e11hyd1info').textContent =
      S.gateOpen ? '💧 المياه تتدفق... التوربين يدور!' : '⏸️ البوّابة مغلقة';
  });

  function draw() {
    if (currentSim !== 'g9hydro' || currentTab !== 0) return;
    const w = cv.width, h = cv.height;
    S.t++;

    // Physics
    if (S.gateOpen) {
      S.turbineSpeed = Math.min(1, S.turbineSpeed + 0.02);
      S.powerOutput = S.waterLevel * S.turbineSpeed * 200;
      if (S.t % 3 === 0) {
        S.particles.push({ x: w * 0.5, y: h * 0.52, vx: (Math.random()-0.5)*2, vy: 2+Math.random()*2, life: 1 });
      }
    } else {
      S.turbineSpeed = Math.max(0, S.turbineSpeed - 0.03);
      S.powerOutput = S.waterLevel * S.turbineSpeed * 200;
    }
    S.particles = S.particles.filter(p => p.life > 0);
    S.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy *= 0.99; p.life -= 0.025; });

    c.clearRect(0, 0, w, h);

    // Sky
    c.fillStyle = '#87CEEB'; c.fillRect(0, 0, w, h * 0.4);
    // Mountains behind dam
    c.fillStyle = '#7D8890';
    c.beginPath(); c.moveTo(0, h * 0.5); c.lineTo(w * 0.15, h * 0.15); c.lineTo(w * 0.35, h * 0.5); c.closePath(); c.fill();
    c.fillStyle = '#6C7A89';
    c.beginPath(); c.moveTo(w * 0.1, h * 0.5); c.lineTo(w * 0.28, h * 0.08); c.lineTo(w * 0.48, h * 0.5); c.closePath(); c.fill();

    // Ground
    c.fillStyle = '#8B7355'; c.fillRect(0, h * 0.85, w, h * 0.15);

    // Reservoir (left of dam)
    const wl = S.waterLevel;
    const resTop = h * (0.85 - wl * 0.55);
    const waterGrad = c.createLinearGradient(0, resTop, 0, h * 0.85);
    waterGrad.addColorStop(0, '#5DADE2'); waterGrad.addColorStop(1, '#2980B9');
    c.fillStyle = waterGrad;
    c.fillRect(0, resTop, w * 0.46, h * 0.85 - resTop);

    // Water surface waves
    c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 2;
    c.beginPath();
    for (let wx = 0; wx < w * 0.46; wx += 20) {
      c.lineTo(wx, resTop + Math.sin((wx + S.t * 2) * 0.1) * 3);
    }
    c.stroke();

    // Dam body
    c.fillStyle = '#808B96';
    c.beginPath();
    c.moveTo(w * 0.46, resTop - 20);
    c.lineTo(w * 0.58, h * 0.5);
    c.lineTo(w * 0.52, h * 0.85);
    c.lineTo(w * 0.44, h * 0.85);
    c.lineTo(w * 0.44, resTop - 20);
    c.closePath(); c.fill();
    c.strokeStyle = '#5D6D7E'; c.lineWidth = 2;
    c.stroke();

    // Gate
    const gateY = h * 0.62;
    if (!S.gateOpen) {
      c.fillStyle = '#2C3E50';
      c.fillRect(w * 0.44, gateY, w * 0.07, h * 0.06);
    }

    // Water flow through gate
    S.particles.forEach(p => {
      c.globalAlpha = p.life * 0.8;
      c.fillStyle = '#5DADE2';
      c.beginPath(); c.arc(p.x, p.y, 4, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;
    });

    // Turbine
    const tx = w * 0.6, ty = h * 0.68;
    c.save(); c.translate(tx, ty); c.rotate(S.t * S.turbineSpeed * 0.15);
    c.fillStyle = '#5D6D7E';
    for (let b = 0; b < 6; b++) {
      const ba = (b / 6) * Math.PI * 2;
      c.beginPath();
      c.ellipse(Math.cos(ba) * 18, Math.sin(ba) * 18, 14, 6, ba, 0, Math.PI * 2);
      c.fill();
    }
    c.fillStyle = '#808B96'; c.beginPath(); c.arc(0, 0, 8, 0, Math.PI * 2); c.fill();
    c.restore();

    // Generator
    c.fillStyle = '#2C3E50';
    c.beginPath(); c.roundRect(w * 0.65, h * 0.6, w * 0.1, h * 0.1, 6); c.fill();
    c.font = `${Math.round(h * 0.025)}px Arial`;
    c.fillStyle = '#F39C12'; c.textAlign = 'center';
    c.fillText('⚡', w * 0.7, h * 0.67);

    // Power output display
    const pColor = S.powerOutput > 100 ? '#27AE60' : S.powerOutput > 50 ? '#F39C12' : '#E74C3C';
    c.font = `bold ${Math.round(h * 0.04)}px Tajawal`;
    c.fillStyle = pColor; c.textAlign = 'center';
    c.fillText(`⚡ ${S.powerOutput.toFixed(0)} kW`, w * 0.83, h * 0.35);

    // Water level label
    c.font = `bold ${Math.round(h * 0.028)}px Tajawal`;
    c.fillStyle = '#2C3E50'; c.textAlign = 'right';
    c.fillText(`مستوى الماء: ${(wl * 100).toFixed(0)}%`, w * 0.4, resTop - h * 0.02);
    c.fillText(`طاقة الوضع → كهرباء`, w * 0.4, h * 0.92);

    document.getElementById('e11hyd1info').innerHTML =
      `⚡ ${S.powerOutput.toFixed(0)} kW | توربين: ${(S.turbineSpeed * 100).toFixed(0)}% | ماء: ${(S.waterLevel*100).toFixed(0)}%`;

    c.textBaseline = 'alphabetic';
    animFrame = requestAnimationFrame(() => { try { draw(); } catch(e) {} });
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// TAB 2: طاقة المدّ والجزر
// ══════════════════════════════════════════════════════════════
function simE11Hydro2() {
  cancelAnimationFrame(animFrame);
  const cv = document.getElementById('simCanvas');
  const c  = cv.getContext('2d');

  if (!simState.e11hyd2) simState.e11hyd2 = { t: 0, speed: 1, moonPos: 0 };
  const S = simState.e11hyd2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌊 طاقة المدّ والجزر</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7">
        القمر يُسبب المدّ والجزر<br>
        بقوته الجاذبية على مياه البحر
      </div>
    </div>
    <div class="ctrl-label">⏩ سرعة الوقت: <span id="e11hyd2spd">1×</span></div>
    <input type="range" id="e11hyd2speed" min="1" max="5" value="1" style="width:100%;margin:4px 0"
      oninput="simState.e11hyd2.speed=+this.value;document.getElementById('e11hyd2spd').textContent=this.value+'×'">
    <div class="info-box" id="e11hyd2info">شاهد كيف يُسبب القمر المدّ والجزر</div>
    <div class="q-box">
      <strong>🔍 ماذا تستنتج؟</strong><br>
      ١- لماذا يُعدّ القمر المصدر الرئيسي لطاقة المدّ والجزر؟<br>
      ٢- ما ميزة طاقة المدّ والجزر مقارنةً بطاقة الرياح؟<br>
      ٣- لماذا لا تعتمد كل الدول على طاقة المدّ والجزر؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">
        ١- لأن جاذبية القمر تسحب مياه البحر وتُسبب تغيّرات منتظمة في منسوب الماء (مدّ وجزر).<br>
        ٢- طاقة المدّ والجزر منتظمة ويمكن التنبؤ بها بدقة، بخلاف الرياح.<br>
        ٣- تحتاج إلى سواحل بفارق مدّ كبير (2-3 أمتار على الأقل)، وهذا غير متاح لكل الدول.
      </div>
    </div>
  `);

  function draw() {
    if (currentSim !== 'g9hydro' || currentTab !== 1) return;
    const w = cv.width, h = cv.height;
    S.t += S.speed;
    c.clearRect(0, 0, w, h);

    // Space
    c.fillStyle = '#0A0A2A'; c.fillRect(0, 0, w, h * 0.4);
    // Stars
    for (let i = 0; i < 40; i++) {
      const sx = (i * 197) % w, sy = (i * 113) % (h * 0.38);
      c.fillStyle = 'rgba(255,255,255,0.5)';
      c.beginPath(); c.arc(sx, sy, 1, 0, Math.PI * 2); c.fill();
    }

    // Moon orbit
    S.moonPos = (S.t * 0.008) % (Math.PI * 2);
    const moonX = w * 0.5 + Math.cos(S.moonPos) * w * 0.35;
    const moonY = h * 0.1 + Math.sin(S.moonPos) * h * 0.12;
    // Moon
    const moonGrad = c.createRadialGradient(moonX - 6, moonY - 6, 0, moonX, moonY, 22);
    moonGrad.addColorStop(0, '#FFFDE7'); moonGrad.addColorStop(1, '#BDBDBD');
    c.beginPath(); c.arc(moonX, moonY, 22, 0, Math.PI * 2);
    c.fillStyle = moonGrad; c.fill();
    c.font = `bold ${Math.round(h * 0.025)}px Tajawal`;
    c.fillStyle = '#78909C'; c.textAlign = 'center';
    c.fillText('🌕 القمر', moonX, moonY + 32);

    // Tidal force arrows
    const earthX = w * 0.5, earthY = h * 0.62;
    const angle = S.moonPos;
    const arLen = 40 + Math.sin(S.t * 0.02) * 5;
    c.strokeStyle = 'rgba(155,89,182,0.6)'; c.lineWidth = 2;
    c.setLineDash([4, 3]);
    c.beginPath();
    c.moveTo(moonX, moonY + 22);
    c.lineTo(earthX + Math.cos(angle) * (w * 0.12), earthY + Math.sin(angle - Math.PI / 2) * (h * 0.08));
    c.stroke();
    c.setLineDash([]);

    // Earth
    const er = Math.min(w, h) * 0.12;
    const earthGrad = c.createRadialGradient(earthX - er * 0.3, earthY - er * 0.3, 0, earthX, earthY, er);
    earthGrad.addColorStop(0, '#5DADE2'); earthGrad.addColorStop(0.5, '#2980B9'); earthGrad.addColorStop(1, '#1A5276');
    c.beginPath(); c.arc(earthX, earthY, er, 0, Math.PI * 2);
    c.fillStyle = earthGrad; c.fill();

    // Tidal bulge (water)
    const tidalAngle = angle;
    const bulge = 12 + Math.abs(Math.cos(S.moonPos)) * 8;
    c.save();
    c.translate(earthX, earthY);
    // Two bulges: toward and away from moon
    [-0, Math.PI].forEach(offset => {
      c.beginPath();
      c.ellipse(Math.cos(tidalAngle + offset) * (er + bulge / 2), Math.sin(tidalAngle + offset) * (er + bulge / 2),
        bulge * 2, bulge, tidalAngle + offset, 0, Math.PI * 2);
      c.fillStyle = 'rgba(93,173,226,0.8)'; c.fill();
    });
    c.restore();

    // Tidal barrage (dam)
    const barrageX = earthX + er * 1.6;
    const barrageY = earthY;
    const tide = Math.sin(S.t * 0.015) * 0.5 + 0.5; // 0 to 1
    c.fillStyle = '#5D6D7E';
    c.fillRect(barrageX - 5, barrageY - 40, 10, 80);
    // Water level in barrage
    const wColor = `rgba(93,173,226,${0.5 + tide * 0.4})`;
    c.fillStyle = wColor;
    c.fillRect(barrageX + 5, barrageY - 30 + (1 - tide) * 60, 50, tide * 60);
    c.strokeStyle = '#2C3E50'; c.lineWidth = 2;
    c.strokeRect(barrageX - 5, barrageY - 40, 60, 80);
    // Turbine icon
    c.font = `${Math.round(h * 0.04)}px Arial`;
    c.fillStyle = '#F39C12'; c.textAlign = 'center';
    c.fillText('⚙️', barrageX + 30, barrageY + 8);
    const power = (tide * 150).toFixed(0);
    c.font = `bold ${Math.round(h * 0.03)}px Tajawal`;
    c.fillStyle = '#27AE60';
    c.fillText(`⚡ ${power} kW`, barrageX + 30, barrageY + 50);

    // Labels
    c.font = `bold ${Math.round(h * 0.03)}px Tajawal`;
    c.fillStyle = '#2C3E50'; c.textAlign = 'center';
    const tideState = tide > 0.6 ? 'مدّ 🔼' : tide < 0.4 ? 'جزر 🔽' : 'انتقال ↔️';
    c.fillText(`الحالة: ${tideState}`, earthX, h * 0.92);

    document.getElementById('e11hyd2info').innerHTML =
      `🌊 ${tideState} | طاقة: ⚡ ${power} kW`;

    c.textBaseline = 'alphabetic';
    animFrame = requestAnimationFrame(() => { try { draw(); } catch(e) {} });
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// الاستقصاء 6 · مقارنة شاملة — مستقبل الطاقة في عُمان
// TAB 1: مقارنة مصادر الطاقة (تفاعلية)
// ══════════════════════════════════════════════════════════════
function simE11Future1() {
  cancelAnimationFrame(animFrame);
  const cv = document.getElementById('simCanvas');
  const c  = cv.getContext('2d');

  const DATA = {
    labels: ['الوقود\nالأحفوري', 'الطاقة\nالشمسية', 'طاقة\nالرياح', 'الكهرومائية', 'النووية', 'الكتلة\nالحيوية'],
    colors: ['#7F8C8D', '#F39C12', '#3498DB', '#2980B9', '#8E44AD', '#27AE60'],
    icons:  ['⛽', '☀️', '💨', '💧', '⚛️', '🌿'],
    co2:    [100, 2, 5, 4, 6, 30],     // CO2 emissions (relative)
    cost:   [40, 70, 60, 65, 30, 45],   // running cost score (lower=worse)
    avail:  [95, 70, 55, 80, 90, 65],   // availability reliability %
    oman:   [70, 95, 60, 20, 10, 30],   // suitability for Oman %
  };

  if (!simState.e11fut1) simState.e11fut1 = { t: 0, metric: 'co2', hovering: -1 };
  const S = simState.e11fut1;

  const METRICS = {
    co2:   { label: '💨 انبعاثات CO₂',     desc: 'أقل = أنظف' },
    cost:  { label: '💰 كفاءة التكلفة',    desc: 'أعلى = أوفر' },
    avail: { label: '🔌 موثوقية الإنتاج', desc: 'أعلى = أفضل' },
    oman:  { label: '🇴🇲 مناسبة لعُمان',  desc: 'أعلى = أنسب' },
  };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📊 مقارنة مصادر الطاقة</div>
    </div>
    ${Object.entries(METRICS).map(([k, v]) =>
      `<button class="ctrl-btn${S.metric === k ? ' on' : ''}" id="e11fut1${k}" style="width:100%;margin-bottom:4px">${v.label}</button>`
    ).join('')}
    <div class="info-box" id="e11fut1info">اختر معياراً للمقارنة</div>
    <div class="q-box">
      <strong>🔍 ماذا تستنتج؟</strong><br>
      ١- ما أفضل مصدر طاقة لعُمان وفق المقارنة؟<br>
      ٢- لماذا تتنوع مصادر الطاقة المستخدمة ولا تعتمد دولة على مصدر واحد؟<br>
      ٣- وفق رؤية عُمان 2040، ما الهدف المقرّر لنسبة الطاقة المتجدّدة؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">
        ١- الطاقة الشمسية هي الأنسب لعُمان لوفرة الإشعاع الشمسي طوال العام.<br>
        ٢- لأن كل مصدر له قيود وعيوب، والتنويع يضمن استمرارية الإمداد وتقليل المخاطر.<br>
        ٣- وفق رؤية عُمان 2040، الهدف الوصول إلى 30% من الطاقة من مصادر متجدّدة بحلول عام 2030.
      </div>
    </div>
  `);

  Object.keys(METRICS).forEach(k => {
    btn(`e11fut1${k}`, () => {
      S.metric = k;
      Object.keys(METRICS).forEach(m => document.getElementById(`e11fut1${m}`)?.classList.remove('on'));
      document.getElementById(`e11fut1${k}`)?.classList.add('on');
    });
  });

  cv.onmousemove = cv.ontouchmove = function(e) {
    const r = cv.getBoundingClientRect(), sc = cv.width / r.width;
    const src = e.touches ? e.touches[0] : e;
    const mx = (src.clientX - r.left) * sc;
    const w = cv.width;
    const n = DATA.labels.length;
    const barW = w * 0.8 / n;
    S.hovering = -1;
    for (let i = 0; i < n; i++) {
      const bx = w * 0.1 + i * barW;
      if (mx >= bx && mx <= bx + barW) { S.hovering = i; break; }
    }
  };

  function draw() {
    if (currentSim !== 'g9future' || currentTab !== 0) return;
    const w = cv.width, h = cv.height;
    S.t++;
    c.clearRect(0, 0, w, h);

    const bg = c.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#EAF7FF'); bg.addColorStop(1, '#D5F0FF');
    c.fillStyle = bg; c.fillRect(0, 0, w, h);

    const metric = S.metric;
    const vals = DATA[metric];
    const maxVal = Math.max(...vals);
    const n = DATA.labels.length;
    const chartH = h * 0.55;
    const chartY = h * 0.12;
    const chartX = w * 0.1;
    const chartW = w * 0.8;
    const barW = chartW / n;

    // Title
    c.font = `bold ${Math.round(h * 0.038)}px Tajawal`;
    c.fillStyle = '#1A5276'; c.textAlign = 'center';
    c.fillText(METRICS[metric].label, w / 2, h * 0.07);
    c.font = `${Math.round(h * 0.026)}px Tajawal`;
    c.fillStyle = '#5D6D7E';
    c.fillText(METRICS[metric].desc, w / 2, h * 0.11);

    // Y axis
    c.strokeStyle = 'rgba(0,0,0,0.15)'; c.lineWidth = 1;
    for (let g = 0; g <= 5; g++) {
      const gy = chartY + chartH - (g / 5) * chartH;
      c.beginPath(); c.moveTo(chartX, gy); c.lineTo(chartX + chartW, gy); c.stroke();
      c.font = `${Math.round(h * 0.022)}px Arial`;
      c.fillStyle = '#888'; c.textAlign = 'right';
      c.fillText((g / 5 * maxVal).toFixed(0), chartX - 4, gy + 4);
    }

    // Bars
    vals.forEach((val, i) => {
      const bx = chartX + i * barW + barW * 0.1;
      const bw = barW * 0.8;
      const bh = (val / maxVal) * chartH;
      const by = chartY + chartH - bh;
      const isHover = S.hovering === i;

      // Bar gradient
      const grad = c.createLinearGradient(0, by, 0, chartY + chartH);
      grad.addColorStop(0, DATA.colors[i]);
      grad.addColorStop(1, DATA.colors[i] + '88');
      c.fillStyle = grad;
      if (isHover) { c.shadowBlur = 12; c.shadowColor = DATA.colors[i]; }
      c.beginPath(); c.roundRect(bx, by, bw, bh, [6, 6, 0, 0]); c.fill();
      c.shadowBlur = 0;

      // Value label
      c.font = `bold ${Math.round(h * 0.028)}px Arial`;
      c.fillStyle = DATA.colors[i]; c.textAlign = 'center';
      c.fillText(val, bx + bw / 2, by - h * 0.01);

      // Icon
      c.font = `${Math.round(h * 0.038)}px Arial`;
      c.fillStyle = '#333';
      c.fillText(DATA.icons[i], bx + bw / 2, chartY + chartH + h * 0.05);

      // Label (multi-line)
      const lblLines = DATA.labels[i].split('\n');
      c.font = `${Math.round(h * 0.022)}px Tajawal`;
      c.fillStyle = '#2C3E50';
      lblLines.forEach((ln, li) => {
        c.fillText(ln, bx + bw / 2, chartY + chartH + h * 0.1 + li * h * 0.035);
      });

      // Hover tooltip
      if (isHover) {
        const tipW = bw * 1.5, tipH = h * 0.06;
        const tipX = Math.max(0, Math.min(w - tipW, bx + bw / 2 - tipW / 2));
        const tipY = by - tipH - h * 0.02;
        c.fillStyle = DATA.colors[i] + 'EE';
        c.beginPath(); c.roundRect(tipX, tipY, tipW, tipH, 8); c.fill();
        c.font = `bold ${Math.round(h * 0.026)}px Tajawal`;
        c.fillStyle = 'white'; c.textAlign = 'center';
        c.fillText(`${DATA.icons[i]} ${val}`, tipX + tipW / 2, tipY + tipH * 0.65);
      }
    });

    document.getElementById('e11fut1info').textContent =
      S.hovering >= 0
        ? `${DATA.icons[S.hovering]} ${DATA.labels[S.hovering].replace('\n',' ')}: ${vals[S.hovering]}`
        : `${METRICS[metric].label} — ${METRICS[metric].desc}`;

    c.textBaseline = 'alphabetic';
    animFrame = requestAnimationFrame(() => { try { draw(); } catch(e) {} });
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// TAB 2: محطة الطاقة الشمسية في عُمان — مختبر تصميم
// ══════════════════════════════════════════════════════════════
function simE11Future2() {
  cancelAnimationFrame(animFrame);
  const cv = document.getElementById('simCanvas');
  const c  = cv.getContext('2d');

  if (!simState.e11fut2) simState.e11fut2 = {
    t: 0, panels: 10, storage: 0, angle: 25,
    totalPower: 0, record: 0
  };
  const S = simState.e11fut2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🇴🇲 صمّم محطتك الشمسية</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7">
        اختر عدد الألواح وزاويتها<br>
        وسعة التخزين لتحقيق أعلى إنتاج
      </div>
    </div>
    <div class="ctrl-label">☀️ عدد الألواح: <span id="e11fut2panels">10</span></div>
    <input type="range" id="e11fut2pSlider" min="1" max="50" value="10" style="width:100%;margin:4px 0"
      oninput="simState.e11fut2.panels=+this.value;document.getElementById('e11fut2panels').textContent=this.value">
    <div class="ctrl-label" style="margin-top:6px">📐 الزاوية المثلى: <span id="e11fut2angle">25</span>°</div>
    <input type="range" id="e11fut2aSlider" min="0" max="90" value="25" style="width:100%;margin:4px 0"
      oninput="simState.e11fut2.angle=+this.value;document.getElementById('e11fut2angle').textContent=this.value">
    <div class="ctrl-label" style="margin-top:6px">🔋 سعة التخزين: <span id="e11fut2stor">0</span> kWh</div>
    <input type="range" id="e11fut2sSlider" min="0" max="100" value="0" style="width:100%;margin:4px 0"
      oninput="simState.e11fut2.storage=+this.value;document.getElementById('e11fut2stor').textContent=this.value">
    <button class="ctrl-btn" id="e11fut2reset" style="width:100%;margin-top:8px;background:rgba(231,76,60,0.15);border-color:rgba(231,76,60,0.4);color:#E74C3C">🔄 إعادة التسجيل</button>
    <div class="info-box" id="e11fut2info">صمّم محطتك واحسب الإنتاج</div>
    <div class="q-box">
      <strong>🔍 ماذا تستنتج؟</strong><br>
      ١- ما الزاوية الأمثل للألواح في عُمان؟ (خطّ العرض ~23°)<br>
      ٢- لماذا يُعدّ التخزين ضرورياً للطاقة الشمسية؟<br>
      ٣- كيف يُمكن استخدام الطاقة الشمسية لتحلية المياه في عُمان؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">
        ١- الزاوية المثلى تُساوي خطّ العرض تقريباً (~23°) لتعامد الأشعة مع الألواح.<br>
        ٢- لأن الشمس لا تسطع ليلاً، ويحتاج التخزين لضمان الإمداد المستمر.<br>
        ٣- استخدام الطاقة الشمسية لتشغيل محطات التحلية يُقلل الاعتماد على الوقود الأحفوري ويُوفر المياه العذبة.
      </div>
    </div>
  `);

  btn('e11fut2reset', () => { S.record = 0; });

  function draw() {
    if (currentSim !== 'g9future' || currentTab !== 1) return;
    const w = cv.width, h = cv.height;
    S.t++;
    c.clearRect(0, 0, w, h);

    // Desert background
    const sky = c.createLinearGradient(0, 0, 0, h * 0.55);
    sky.addColorStop(0, '#87CEEB'); sky.addColorStop(1, '#FDD9A0');
    c.fillStyle = sky; c.fillRect(0, 0, w, h * 0.55);
    // Sand
    c.fillStyle = '#DEB887'; c.fillRect(0, h * 0.55, w, h * 0.45);
    // Sand dunes
    c.fillStyle = '#C4A265';
    c.beginPath(); c.ellipse(w * 0.3, h * 0.58, w * 0.2, h * 0.05, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#D4B47A';
    c.beginPath(); c.ellipse(w * 0.7, h * 0.6, w * 0.25, h * 0.04, 0, 0, Math.PI * 2); c.fill();

    // Sun
    _drawSun(c, w * 0.85, h * 0.12, Math.min(w, h) * 0.07, S.t);

    // Solar panels (array)
    const rows = Math.min(5, Math.ceil(S.panels / 5));
    const cols = Math.min(10, Math.ceil(S.panels / rows));
    const pW = Math.min(w * 0.08, (w * 0.7) / cols);
    const pH = pW * 0.4;
    const startX = w * 0.08;
    const startY = h * 0.52;

    let drawn = 0;
    for (let r = 0; r < rows && drawn < S.panels; r++) {
      for (let col = 0; col < cols && drawn < S.panels; col++) {
        const px = startX + col * (pW + 4);
        const py = startY - r * (pH + h * 0.015);
        c.save();
        c.translate(px + pW / 2, py + pH);
        c.rotate(-(S.angle - 45) * Math.PI / 180 * 0.5);
        // Panel
        c.fillStyle = '#1A3A5C';
        c.fillRect(-pW / 2, -pH, pW, pH);
        // Grid
        c.strokeStyle = 'rgba(100,200,255,0.4)'; c.lineWidth = 0.8;
        for (let gc = 0; gc < 4; gc++) c.strokeRect(-pW/2 + gc*pW/4, -pH, pW/4, pH);
        for (let gr = 0; gr < 3; gr++) c.strokeRect(-pW/2, -pH + gr*pH/3, pW, pH/3);
        c.strokeStyle = 'rgba(52,152,219,0.8)'; c.lineWidth = 1.2;
        c.strokeRect(-pW/2, -pH, pW, pH);
        // Support
        c.fillStyle = '#666'; c.fillRect(-1.5, 0, 3, h * 0.04);
        c.restore();
        drawn++;
      }
    }

    // Calculate power
    const optAngle = 23; // Oman latitude
    const angleFactor = Math.cos((S.angle - optAngle) * Math.PI / 180);
    const rawPower = S.panels * angleFactor * 250; // 250W per panel
    const storageFactor = 1 + S.storage * 0.004;
    S.totalPower = Math.max(0, rawPower * storageFactor);
    if (S.totalPower > S.record) S.record = S.totalPower;

    // Power display
    const pColor = S.totalPower > 5000 ? '#27AE60' : S.totalPower > 2000 ? '#F39C12' : '#E74C3C';
    c.font = `bold ${Math.round(h * 0.045)}px Tajawal`;
    c.fillStyle = pColor; c.textAlign = 'center';
    c.fillText(`⚡ ${(S.totalPower / 1000).toFixed(1)} MW`, w * 0.82, h * 0.38);
    c.font = `${Math.round(h * 0.028)}px Tajawal`;
    c.fillStyle = '#2C3E50';
    c.fillText(`🏆 أعلى: ${(S.record / 1000).toFixed(1)} MW`, w * 0.82, h * 0.44);

    // Efficiency score
    const score = Math.min(100, (S.totalPower / (S.panels * 250)) * 100);
    c.font = `${Math.round(h * 0.028)}px Tajawal`;
    c.fillStyle = score > 80 ? '#27AE60' : '#F39C12';
    c.fillText(`كفاءة: ${score.toFixed(0)}%`, w * 0.82, h * 0.5);

    // Battery indicator
    c.fillStyle = 'rgba(255,255,255,0.3)';
    c.beginPath(); c.roundRect(w * 0.75, h * 0.57, w * 0.2, h * 0.08, 6); c.fill();
    c.fillStyle = S.storage > 60 ? '#27AE60' : S.storage > 30 ? '#F39C12' : '#E74C3C';
    c.beginPath(); c.roundRect(w * 0.75, h * 0.57, w * 0.2 * (S.storage / 100), h * 0.08, 6); c.fill();
    c.strokeStyle = '#888'; c.lineWidth = 1.5;
    c.beginPath(); c.roundRect(w * 0.75, h * 0.57, w * 0.2, h * 0.08, 6); c.stroke();
    c.font = `bold ${Math.round(h * 0.028)}px Tajawal`;
    c.fillStyle = '#2C3E50'; c.textAlign = 'center';
    c.fillText(`🔋 ${S.storage}%`, w * 0.85, h * 0.68);

    // Location label
    c.font = `bold ${Math.round(h * 0.03)}px Tajawal`;
    c.fillStyle = '#8E44AD'; c.textAlign = 'center';
    c.fillText('🇴🇲 صحراء عُمان الشمسية', w * 0.4, h * 0.88);

    document.getElementById('e11fut2info').innerHTML =
      `⚡ ${(S.totalPower/1000).toFixed(1)} MW | ألواح: ${S.panels} | زاوية: ${S.angle}° | تخزين: ${S.storage}%`;

    c.textBaseline = 'alphabetic';
    animFrame = requestAnimationFrame(() => { try { draw(); } catch(e) {} });
  }
  draw();
}
