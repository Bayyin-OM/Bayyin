// ══════════════════════════════════════════════════════════
// الصف العاشر — كيمياء — الوحدة الأولى: الفلزات وخصائصها
// المرجع: كتاب كيمياء الصف العاشر — الفصل الدراسي الأول
// ══════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────
// نشاط ١-١ · الرابطة الفلزية — ماذا يحدث داخل الفلز؟
// ────────────────────────────────────────────────────────────
function _g10L1Panel() {
  const S = simState;
  var html = '';

  html += '<div class="ctrl-section">' +
    '<div class="ctrl-label">🔎 توقّع</div>' +
    '<div class="ctrl-name" style="font-size:13px;font-weight:400;line-height:1.9">' +
    'يظهر أمام الطالب فلز مكوَّن من أيونات موجبة كبيرة (🟠) وإلكترونات صغيرة جداً (🔵). ' +
    'اضغط الزر لتشاهد ماذا يحدث للإلكترونات داخل الفلز.</div></div>';

  if (!S.playing) {
    html += '<button class="ctrl-btn play" onclick="g10L1Play()" style="width:100%">▶ شاهد حركة الإلكترونات</button>';
  } else {
    html += '<button class="ctrl-btn" onclick="g10L1Reset()" style="width:100%">⏸ إعادة</button>';
  }

  if (S.playing && S.step < 1) {
    html += '<div class="q-box" style="margin-top:14px">' +
      '<strong>🤔 ماذا تلاحظ عن حركة الإلكترونات داخل الفلز؟</strong>' +
      '<button class="ctrl-btn action" onclick="g10L1Next()" style="width:100%;margin-top:10px">أظهر الملاحظة 👀</button></div>';
  }

  if (S.step >= 1) {
    html += '<div class="info-box" style="margin-top:14px">' +
      '💡 تتحرك الإلكترونات <b>بحرية</b> وهي <b>غير متمركزة</b> حول أيون فلزي معيّن — بل تتنقّل بين جميع الأيونات الموجبة.</div>';
    html += '<div class="ctrl-section" style="margin-top:14px">' +
      '<div class="ctrl-label">📖 المصطلح العلمي</div>' +
      '<div style="background:rgba(212,144,26,0.08);border:1.5px solid rgba(212,144,26,0.25);border-radius:12px;padding:12px 14px">' +
      '<div style="font-weight:800;color:#B8780A;font-size:15px;margin-bottom:6px">الرابطة الفلزّية Metallic bonding</div>' +
      '<div style="font-size:13px;line-height:1.9;color:var(--text-secondary)">قوة كهروستاتيكية قوية بين الأيونات الموجبة وبحر الإلكترونات المتحركة التي تحيط بها، وهي تؤمّن تماسك الشبكة الفلزية.</div>' +
      '</div></div>';
  }

  if (S.step >= 1 && S.step < 2) {
    html += '<div class="q-box" style="margin-top:14px">' +
      '<strong>⚡ لماذا تستطيع الفلزات نقل الشحنات الكهربائية؟</strong>' +
      '<button class="ctrl-btn action" onclick="g10L1Next()" style="width:100%;margin-top:10px">أظهر الإجابة 💡</button></div>';
  }

  if (S.step >= 2) {
    html += '<div class="info-box" style="margin-top:14px">' +
      '⚡ تُوصِّل الفلزات الكهرباء بشكل جيد، لأن الإلكترونات غير المتمركزة تكون قادرة على نقل الشحنات الكهربائية وهي تتحرك بحرية عبر التركيب البنائي للفلز، ناقلةً معها التيار الكهربائي.</div>';
  }

  controls(html);
}

window.g10L1Play = function() {
  simState.playing = true;
  U9Sound.ping(520, 0.12, 0.18);
  _g10L1Panel();
};
window.g10L1Next = function() {
  simState.step = (simState.step || 0) + 1;
  U9Sound.ping(620, 0.1, 0.15);
  _g10L1Panel();
  if (simState.step === 2) { buddySay('أحسنت! هذا هو سرّ توصيل الفلزات للكهرباء ⚡', 5000); }
};
window.g10L1Reset = function() {
  simState.playing = false;
  simState.step = 0;
  _g10L1Panel();
};

function simG10Chem1N1() {
  cancelAnimationFrame(animFrame);
  simState = { t: 0, playing: false, step: 0, ions: null, electrons: null };
  const S = simState;
  _g10L1Panel();

  const cv = document.getElementById('simCanvas');

  function buildLattice(w, h) {
    // شبكة أيونات موجبة منتظمة (تراص سداسي متقارب)
    const marginX = w * 0.10, marginY = h * 0.14;
    const cols = 6, rows = 4;
    const cellW = (w - marginX * 2) / (cols - 1);
    const cellH = (h * 0.72 - marginY) / (rows - 1);
    const ions = [];
    for (let r = 0; r < rows; r++) {
      const offset = (r % 2 === 1) ? cellW * 0.5 : 0;
      for (let cIdx = 0; cIdx < cols; cIdx++) {
        const x = marginX + cIdx * cellW + offset - cellW * 0.25;
        if (x < marginX - 5 || x > w - marginX + 5) continue;
        ions.push({ x: x, y: marginY + r * cellH });
      }
    }
    return ions;
  }

  function buildElectrons(n, w, h) {
    const es = [];
    for (let i = 0; i < n; i++) {
      es.push({
        x: w * (0.08 + Math.random() * 0.84),
        y: h * (0.10 + Math.random() * 0.68),
        dx: (Math.random() - 0.5) * 2.2,
        dy: (Math.random() - 0.5) * 2.2
      });
    }
    return es;
  }

  function draw() {
    if (currentSim !== 'g10chem1n1') { cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height;
    if (!S.ions || S._w !== w || S._h !== h) {
      S.ions = buildLattice(w, h);
      S.electrons = buildElectrons(26, w, h);
      S._w = w; S._h = h;
    }
    c.clearRect(0, 0, w, h);
    S.t++;

    const bg = c.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#FDF8F0'); bg.addColorStop(1, '#F5EEE0');
    c.fillStyle = bg; c.fillRect(0, 0, w, h);

    // إطار "قطعة الفلز"
    const boxX = w * 0.04, boxY = h * 0.06, boxW = w * 0.92, boxH = h * 0.78;
    c.fillStyle = 'rgba(180,150,90,0.06)';
    c.beginPath(); c.roundRect(boxX, boxY, boxW, boxH, 14); c.fill();
    c.strokeStyle = 'rgba(140,110,60,0.35)'; c.lineWidth = 2; c.setLineDash([6, 5]);
    c.beginPath(); c.roundRect(boxX, boxY, boxW, boxH, 14); c.stroke();
    c.setLineDash([]);

    // عنوان
    c.fillStyle = '#5A4020'; c.font = `bold ${Math.max(12, w * 0.024)}px Tajawal`;
    c.textAlign = 'center'; c.textBaseline = 'top';
    c.fillText('نموذج التركيب البنائي للفلز', w / 2, h * 0.015);

    const ionR = Math.max(14, w * 0.032);

    // الأيونات الموجبة
    S.ions.forEach(function(ion) {
      const g = c.createRadialGradient(ion.x - ionR * 0.3, ion.y - ionR * 0.3, ionR * 0.15, ion.x, ion.y, ionR);
      g.addColorStop(0, '#F3C267'); g.addColorStop(0.55, '#D4901A'); g.addColorStop(1, '#A8690E');
      c.fillStyle = g;
      c.beginPath(); c.arc(ion.x, ion.y, ionR, 0, Math.PI * 2); c.fill();
      c.strokeStyle = 'rgba(120,80,10,0.45)'; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = '#fff'; c.font = `bold ${Math.max(10, ionR * 0.62)}px Tajawal`;
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('⊕', ion.x, ion.y + 1);
    });

    // الإلكترونات الصغيرة
    const eR = Math.max(3, ionR * 0.19);
    S.electrons.forEach(function(e) {
      if (S.playing) {
        e.x += e.dx; e.y += e.dy;
        if (e.x < boxX + 10 || e.x > boxX + boxW - 10) e.dx *= -1;
        if (e.y < boxY + 10 || e.y > boxY + boxH * 0.92) e.dy *= -1;
        e.x = Math.max(boxX + 10, Math.min(boxX + boxW - 10, e.x));
        e.y = Math.max(boxY + 10, Math.min(boxY + boxH * 0.92, e.y));
        // ميل خفيف عشوائي لجعل الحركة طبيعية
        if (Math.random() < 0.02) { e.dx += (Math.random() - 0.5) * 0.6; e.dy += (Math.random() - 0.5) * 0.6; }
        const sp = Math.hypot(e.dx, e.dy);
        if (sp > 2.6) { e.dx = e.dx / sp * 2.6; e.dy = e.dy / sp * 2.6; }
        if (sp < 1.0) { e.dx = e.dx / (sp || 1) * 1.0; e.dy = e.dy / (sp || 1) * 1.0; }
      }
      c.shadowBlur = 6; c.shadowColor = 'rgba(26,143,168,0.55)';
      c.fillStyle = '#1A8FA8';
      c.beginPath(); c.arc(e.x, e.y, eR, 0, Math.PI * 2); c.fill();
      c.shadowBlur = 0;
    });

    // مفتاح الرموز
    const legY = boxY + boxH + h * 0.04;
    c.textAlign = 'right'; c.textBaseline = 'middle';
    c.font = `${Math.max(10, w * 0.02)}px Tajawal`;
    c.fillStyle = '#D4901A'; c.beginPath(); c.arc(w * 0.30, legY, ionR * 0.4, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#5A4020'; c.fillText('أيونات موجبة', w * 0.30 - ionR * 0.7, legY);
    c.fillStyle = '#1A8FA8'; c.beginPath(); c.arc(w * 0.70, legY, eR, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#5A4020'; c.fillText('إلكترونات (بحر الإلكترونات)', w * 0.70 - eR - 4, legY);

    if (!S.playing) {
      c.fillStyle = 'rgba(255,255,255,0.85)';
      c.beginPath(); c.roundRect(w * 0.22, h * 0.40, w * 0.56, h * 0.10, 10); c.fill();
      c.fillStyle = '#7A5A20'; c.font = `bold ${Math.max(11, w * 0.022)}px Tajawal`;
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('اضغط "شاهد حركة الإلكترونات" ▶', w / 2, h * 0.45);
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

// ────────────────────────────────────────────────────────────
// نشاط ٢-١ / ٣-١ · الجدول الدوري — استكشف مجموعاته
// ────────────────────────────────────────────────────────────
var _G10_PT_COLS = ['I', 'II', 'T', 'III', 'IV', 'V', 'VI', 'VII', '0'];
var _G10_PT_GRID = [
  { I:'H',  II:null, T:null, III:null, IV:null, V:null, VI:null, VII:null, '0':'He' },
  { I:'Li', II:'Be', T:null, III:'B',  IV:'C',  V:'N',  VI:'O',  VII:'F',  '0':'Ne' },
  { I:'Na', II:'Mg', T:null, III:'Al', IV:'Si', V:'P',  VI:'S',  VII:'Cl', '0':'Ar' },
  { I:'K',  II:'Ca', T:'Sc-Zn', III:'Ga', IV:'Ge', V:'As', VI:'Se', VII:'Br', '0':'Kr' },
  { I:'Rb', II:'Sr', T:'Y-Cd',  III:'In', IV:'Sn', V:'Sb', VI:'Te', VII:'I',  '0':'Xe' },
  { I:'Cs', II:'Ba', T:'Hf-Hg', III:'Tl', IV:'Pb', V:'Bi', VI:'Po', VII:'At', '0':'Rn' },
  { I:'Fr', II:'Ra', T:null, III:null, IV:null, V:null, VI:null, VII:null, '0':null }
];
var _G10_GROUP_NAMES = {
  I:   'المجموعة الأولى — الفلزات القلوية',
  II:  'المجموعة الثانية',
  T:   'العناصر الانتقالية',
  III: 'المجموعة الثالثة',
  IV:  'المجموعة الرابعة',
  V:   'المجموعة الخامسة',
  VI:  'المجموعة السادسة',
  VII: 'المجموعة السابعة',
  '0': 'المجموعة صفر'
};
var _G10_GROUP_COLOR = {
  I: '#D4901A', II: '#8E6A9A', T: '#1A8FA8', III: '#6B4E9A', IV: '#5B8DBF',
  V: '#5B8DBF', VI: '#5B8DBF', VII: '#5B8DBF', '0': '#7A8A98'
};

function _g10L2InfoHTML(grp) {
  if (grp === 'I') {
    return '<div class="ctrl-section">' +
      '<div class="ctrl-label" style="color:#B8780A">🟡 المجموعة الأولى</div>' +
      '<div style="font-weight:800;font-size:16px;color:#B8780A;margin-bottom:8px">الفلزات القلوية — Alkali metals</div>' +
      '<div style="font-size:13px;line-height:2;color:var(--text-secondary)">' +
      '• تتفاعل بشدة مع الماء لإنتاج غاز الهيدروجين ومحلول قلوي.<br>' +
      '• فلزات نشطة جداً؛ تُخزَّن داخل الزيت لمنع تفاعلها مع الأكسجين وبخار الماء.<br>' +
      '• لينة وسهلة القطع، وذات كثافة منخفضة.<br>' +
      '• تُكوِّن أيونات أحادية الشحنة الموجبة، مثل ⁺Li و⁺Na و⁺K.<br>' +
      '• عناصرها: H · Li · Na · K · Rb · Cs · Fr' +
      '</div></div>';
  }
  if (grp === 'T') {
    return '<div class="ctrl-section">' +
      '<div class="ctrl-label" style="color:#1A8FA8">🔵 العناصر الانتقالية</div>' +
      '<div style="font-weight:800;font-size:16px;color:#1A8FA8;margin-bottom:8px">Transition elements</div>' +
      '<div style="font-size:13px;line-height:2;color:var(--text-secondary)">' +
      '• تتوسّط المجموعتين II و III في الجدول الدوري.<br>' +
      '• تشمل فلزات شائعة مثل الحديد (Fe) والنحاس (Cu) والنيكل (Ni) والبلاتين (Pt).<br>' +
      '• صلدة، ذات كثافة ودرجات انصهار مرتفعة، وموصِّلة جيدة للحرارة والكهرباء.<br>' +
      '• كثير من مركّباتها ملوّنة، وتُستخدم بعضها كعوامل حفّازة.' +
      '</div></div>';
  }
  var name = _G10_GROUP_NAMES[grp] || 'مجموعة';
  var col = _G10_GROUP_COLOR[grp] || '#7A8A98';
  var els = [];
  _G10_PT_GRID.forEach(function(row) { if (row[grp]) els.push(row[grp]); });
  return '<div class="ctrl-section">' +
    '<div class="ctrl-label" style="color:' + col + '">⚪ ' + name + '</div>' +
    '<div style="font-size:13px;line-height:2;color:var(--text-secondary)">عناصر هذه المجموعة: ' + els.join(' · ') + '</div>' +
    '</div>';
}

function _g10L2Panel(grp) {
  var html = '<div class="ctrl-section">' +
    '<div class="ctrl-label">🧭 استكشف الجدول الدوري</div>' +
    '<div class="ctrl-name" style="font-size:13px;font-weight:400;line-height:1.9">اضغط على أي عنصر في الجدول المقابل لتتظلّل مجموعته كاملة وتظهر بطاقة معلومات عنها.</div></div>';
  html += grp ? _g10L2InfoHTML(grp) : '<div class="info-box">👆 لم تختر مجموعة بعد — اضغط على أي عنصر في الجدول.</div>';
  controls(html);
}

function simG10Chem1N2() {
  cancelAnimationFrame(animFrame);
  simState = { t: 0, selGroup: null, cells: [] };
  const S = simState;
  _g10L2Panel(null);

  const cv = document.getElementById('simCanvas');
  cv.onclick = function(e) {
    const r = cv.getBoundingClientRect();
    const mx = (e.clientX - r.left) * cv.width / r.width;
    const my = (e.clientY - r.top) * cv.height / r.height;
    for (var i = 0; i < S.cells.length; i++) {
      var cell = S.cells[i];
      if (mx >= cell.x && mx <= cell.x + cell.w && my >= cell.y && my <= cell.y + cell.h && cell.el) {
        S.selGroup = cell.grp;
        U9Sound.ping(560, 0.1, 0.16);
        _g10L2Panel(cell.grp);
        return;
      }
    }
  };

  function draw() {
    if (currentSim !== 'g10chem1n2') { cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height;
    c.clearRect(0, 0, w, h);
    S.t++;

    const bg = c.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#F4F8FB'); bg.addColorStop(1, '#EAF1F6');
    c.fillStyle = bg; c.fillRect(0, 0, w, h);

    c.fillStyle = '#1E2D3D'; c.font = `bold ${Math.max(11, w * 0.021)}px Tajawal`;
    c.textAlign = 'center'; c.textBaseline = 'top';
    c.fillText('اضغط على عنصر لاستكشاف مجموعته', w / 2, h * 0.01);

    const cols = _G10_PT_COLS.length, rows = _G10_PT_GRID.length;
    const topPad = h * 0.09, botPad = h * 0.03;
    const cellW = w * 0.97 / cols, cellH = (h - topPad - botPad) / rows;
    const startX = w * 0.015;

    S.cells = [];
    for (var ri = 0; ri < rows; ri++) {
      for (var ci = 0; ci < cols; ci++) {
        var grpKey = _G10_PT_COLS[ci];
        var el = _G10_PT_GRID[ri][grpKey];
        var cx = startX + ci * cellW, cy = topPad + ri * cellH;
        var pad = Math.min(cellW, cellH) * 0.08;
        var bx = cx + pad, by = cy + pad, bw = cellW - pad * 2, bh = cellH - pad * 2;
        S.cells.push({ x: bx, y: by, w: bw, h: bh, grp: grpKey, el: el });
        if (!el) continue;

        var isSel = S.selGroup === grpKey;
        var baseCol = _G10_GROUP_COLOR[grpKey] || '#7A8A98';
        c.fillStyle = isSel ? baseCol : 'rgba(120,140,160,0.10)';
        c.beginPath(); c.roundRect(bx, by, bw, bh, 5); c.fill();
        if (isSel) {
          var pulse = 1 + Math.sin(S.t * 0.08) * 0.15;
          c.strokeStyle = baseCol; c.lineWidth = 2 * pulse;
        } else {
          c.strokeStyle = 'rgba(120,140,160,0.35)'; c.lineWidth = 1;
        }
        c.beginPath(); c.roundRect(bx, by, bw, bh, 5); c.stroke();

        c.fillStyle = isSel ? '#fff' : '#2B3A4A';
        c.font = `bold ${Math.max(8, Math.min(bw, bh) * 0.38)}px Tajawal`;
        c.textAlign = 'center'; c.textBaseline = 'middle';
        var label = (el.length > 3) ? '⋯' : el; // خانة العناصر الانتقالية المدمجة
        c.fillText(label, bx + bw / 2, by + bh / 2 + 1);
      }
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

// ────────────────────────────────────────────────────────────
// نشاط ٤-١ · نشاط الفلزات — الخارصين وكبريتات النحاس (II)
// ────────────────────────────────────────────────────────────
function _g10L4Panel() {
  const S = simState;
  var html = '';

  html += '<div class="ctrl-section">' +
    '<div class="ctrl-label">🧪 المشهد</div>' +
    '<div class="ctrl-name" style="font-size:13px;font-weight:400;line-height:1.9">' +
    'كأس يحتوي على محلول أزرق من كبريتات النحاس (II) — أيّ الفلزّين أكثر نشاطاً: النحاس أم الخارصين؟</div></div>';

  if (S.stage === 0) {
    html += '<button class="ctrl-btn play" onclick="g10L4AddZinc()" style="width:100%">➕ أضف الخارصين</button>';
  } else if (S.stage === 1) {
    html += '<button class="ctrl-btn play" onclick="g10L4React()" style="width:100%">▶ شاهد ماذا سيحدث</button>';
  } else if (S.stage === 2) {
    html += '<div class="info-box">⏳ التفاعل يحدث الآن... راقب المحلول والخارصين</div>';
  } else if (S.stage >= 3) {
    html += '<div class="info-box">✅ اكتمل التفاعل — لاحظ الطبقة البنّية المحمرّة على الخارصين، وزوال اللون الأزرق تدريجياً.</div>' +
      '<button class="ctrl-btn action" onclick="g10L4ShowExplain()" style="width:100%;margin-top:10px">🔬 ماذا حدث على المستوى الجزيئي؟</button>';
  }

  if (S.showExplain) {
    html += '<div class="ctrl-section" style="margin-top:14px">' +
      '<div class="ctrl-label">⚛️ التفسير</div>' +
      '<div style="font-size:13px;line-height:2;color:var(--text-secondary)">' +
      '• الخارصين يفقد إلكترونين ⟶ يتكوّن أيون الخارصين ⁺²Zn<br>' +
      '• أيونات النحاس ⁺²Cu تكسب إلكترونين ⟶ يتكوّن النحاس (Cu) الصلب' +
      '</div>' +
      '<div style="margin-top:10px;background:rgba(26,143,168,0.08);border-radius:10px;padding:10px;text-align:center;direction:ltr;font-family:monospace;font-size:13px;color:#1A8FA8">' +
      'Zn(s) + CuSO₄(aq) → ZnSO₄(aq) + Cu(s)</div></div>';

    if (!S.quizShown) {
      html += '<div class="q-box" style="margin-top:14px">' +
        '<strong>🔎 أيّ عنصر هو الأكثر نشاطاً؟</strong>' +
        '<div style="margin-top:10px;display:flex;flex-direction:column;gap:8px">' +
        '<button class="ctrl-btn" onclick="g10L4Answer(0)">النحاس</button>' +
        '<button class="ctrl-btn" onclick="g10L4Answer(1)">الخارصين</button>' +
        '<button class="ctrl-btn" onclick="g10L4Answer(2)">كلاهما له النشاط نفسه</button>' +
        '<button class="ctrl-btn" onclick="g10L4Answer(3)">لا يمكن تحديد ذلك</button>' +
        '</div><div id="g10l4fb" style="margin-top:8px;font-size:13px;line-height:1.8"></div></div>';
    }
  }

  if (S.quizShown) {
    html += '<div class="info-box" style="margin-top:14px">' +
      '🎉 <b>أحسنت!</b> الخارصين أكثر نشاطاً من النحاس.<br><br>' +
      'يمتلك الخارصين قابلية أكبر من النحاس لتكوين أيونات موجبة، لذلك يستطيع أن يحلّ محلّ النحاس في محلول كبريتات النحاس.</div>' +
      '<div class="ctrl-section" style="margin-top:14px">' +
      '<div class="ctrl-label">📌 استنتاج النشاط</div>' +
      '<div style="background:rgba(212,144,26,0.08);border:1.5px solid rgba(212,144,26,0.25);border-radius:12px;padding:12px 14px;font-size:13px;line-height:1.9">' +
      'عندما يستطيع فلزّ أن يُزيح فلزّاً آخر من مركّبه ويحلّ محلّه، فهذا يدلّ على أن الفلزّ الذي حلّ محلّ الآخر أكثر نشاطاً منه (الإزاحة/الإحلال).</div></div>';
  }

  controls(html);
}

window.g10L4AddZinc = function() {
  simState.stage = 1;
  U9Sound.ping(500, 0.12, 0.16);
  _g10L4Panel();
};
window.g10L4React = function() {
  simState.stage = 2;
  simState.progress = 0;
  U9Sound.ping(440, 0.15, 0.2);
  _g10L4Panel();
};
window.g10L4ShowExplain = function() {
  simState.showExplain = true;
  _g10L4Panel();
};
window.g10L4Answer = function(i) {
  const fb = document.getElementById('g10l4fb');
  if (!fb) return;
  if (i === 1) {
    fb.innerHTML = '✅ صحيح! الخارصين هو الأكثر نشاطاً.';
    fb.style.color = '#1E8449';
    simState.quizShown = true;
    U9Sound.win();
    buddySay('ممتاز! فهمت فكرة نشاط الفلزات 🎉', 4000);
    setTimeout(_g10L4Panel, 300);
  } else {
    fb.innerHTML = '❌ ليست هذه الإجابة — فكّر: أيّ فلزّ ترسّب على سطح الآخر؟';
    fb.style.color = '#C0392B';
  }
};

function simG10Chem1N4() {
  cancelAnimationFrame(animFrame);
  simState = { t: 0, stage: 0, progress: 0, showExplain: false, quizShown: false };
  const S = simState;
  _g10L4Panel();

  const cv = document.getElementById('simCanvas');

  function draw() {
    if (currentSim !== 'g10chem1n4') { cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height;
    c.clearRect(0, 0, w, h);
    S.t++;

    if (S.stage === 2 && S.progress < 1) {
      S.progress += 0.006;
      if (S.progress >= 1) { S.progress = 1; S.stage = 3; setTimeout(_g10L4Panel, 100); }
    }
    const prog = S.progress || 0;

    const bg = c.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#F7F9FA'); bg.addColorStop(1, '#EDF1F3');
    c.fillStyle = bg; c.fillRect(0, 0, w, h);

    // الكأس
    const bkx = w * 0.28, bky = h * 0.16, bkw = w * 0.44, bkh = h * 0.68;
    c.strokeStyle = 'rgba(120,150,200,0.55)'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(bkx, bky); c.lineTo(bkx, bky + bkh); c.lineTo(bkx + bkw, bky + bkh); c.lineTo(bkx + bkw, bky); c.stroke();
    c.beginPath(); c.moveTo(bkx - 6, bky); c.lineTo(bkx + bkw + 6, bky); c.stroke();

    // المحلول — يتلاشى الأزرق تدريجياً مع تقدّم التفاعل
    const liqAlpha = 0.55 * (1 - prog * 0.92);
    c.fillStyle = 'rgba(41,128,185,' + liqAlpha.toFixed(3) + ')';
    c.fillRect(bkx + 3, bky + bkh * 0.08, bkw - 6, bkh * 0.90);

    // قطعة الخارصين
    if (S.stage >= 1) {
      const znX = bkx + bkw / 2, znY = bky + bkh * 0.55;
      const znW = bkw * 0.16, znH = bkh * 0.5;
      c.fillStyle = '#B0B7BD';
      c.beginPath(); c.roundRect(znX - znW / 2, znY - znH / 2, znW, znH, 5); c.fill();
      c.strokeStyle = '#8C949B'; c.lineWidth = 1.5;
      c.beginPath(); c.roundRect(znX - znW / 2, znY - znH / 2, znW, znH, 5); c.stroke();

      // طبقة النحاس البنّية المحمرّة تنمو تدريجياً
      if (prog > 0) {
        const speck = 60;
        for (let i = 0; i < speck * prog; i++) {
          const rx = znX - znW / 2 + (i * 13 % znW);
          const ry = znY - znH / 2 + ((i * 37) % znH);
          c.fillStyle = 'rgba(140,60,35,' + (0.55 + 0.3 * Math.sin(i)) + ')';
          c.beginPath(); c.arc(rx, ry, znW * 0.09, 0, Math.PI * 2); c.fill();
        }
      }
      c.fillStyle = '#3A4550'; c.font = `bold ${Math.max(10, w * 0.02)}px Tajawal`;
      c.textAlign = 'center'; c.textBaseline = 'top';
      c.fillText('Zn', znX, znY + znH / 2 + 6);
    }

    // تسمية المحلول
    c.fillStyle = 'rgba(40,60,80,0.75)'; c.font = `${Math.max(10, w * 0.019)}px Tajawal`;
    c.textAlign = 'center'; c.textBaseline = 'top';
    c.fillText(prog < 0.15 ? 'محلول كبريتات النحاس (II)' : (prog < 0.95 ? 'اللون الأزرق يتلاشى تدريجياً...' : 'محلول كبريتات الخارصين — عديم اللون'), w / 2, bky + bkh + h * 0.03);

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}
