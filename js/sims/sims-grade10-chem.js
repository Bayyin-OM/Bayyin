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

// ══════════════════════════════════════════════════════════
// الصف العاشر — كيمياء — الوحدة الثانية: استخلاص الفلزات واستخداماتها
// ══════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────
// نشاط ١-٢ · استخلاص النحاس من أكسيد النحاس (II) باستخدام الكربون
// ────────────────────────────────────────────────────────────
function _g10L5Panel() {
  const S = simState;
  var html = '';
  html += '<div class="ctrl-section"><div class="ctrl-label">🧪 تجربة استخلاص فلز</div>' +
    '<div class="ctrl-name" style="font-size:13px;font-weight:400;line-height:1.9">نفّذ التجربة خطوة بخطوة كما في المختبر الحقيقي، ثم راقب ماذا يحدث.</div></div>';

  var steps = [
    'اسحب مسحوق أكسيد النحاس الثنائي (الأسود) إلى أنبوبة التسخين.',
    'اسحب مسحوق الفحم (الكربون) وأضِفه فوق أكسيد النحاس داخل الأنبوبة.',
    'اضغط "شغّل النار" لتسخين الأنبوبة تسخيناً قوياً.',
    'انتظر حتى يكتمل التسخين، ثم اضغط "أغلق النار ودع الأنبوبة تبرد".',
    'اسحب أداة سحب الغاز إلى فوهة أنبوبة التسخين.',
    'انقل الأداة إلى أنبوبة ماء الجير لتمرير الغاز فيها.'
  ];
  var cur = S.step || 0;
  html += '<div class="ctrl-section"><div class="ctrl-label">📋 خطوات التجربة</div>';
  steps.forEach(function(txt, i) {
    var done = i < cur;
    var active = i === cur;
    html += '<div style="display:flex;gap:8px;align-items:flex-start;padding:7px 0;' +
      (active ? 'font-weight:700;color:#B8780A' : (done ? 'color:#3B8C4A' : 'color:var(--text-muted)')) + '">' +
      '<span>' + (done ? '✅' : (active ? '👉' : '⚪')) + '</span>' +
      '<span style="font-size:12.5px;line-height:1.7">' + txt + '</span></div>';
  });
  html += '</div>';

  if (cur === 0) {
    html += '<button class="ctrl-btn play" onclick="g10L5Hint(0)" style="width:100%;margin-top:10px">🖱️ اسحب مسحوق أكسيد النحاس (CuO) أعلى اليسار إلى الأنبوبة</button>';
  } else if (cur === 1) {
    html += '<button class="ctrl-btn play" onclick="g10L5Hint(1)" style="width:100%;margin-top:10px">🖱️ اسحب مسحوق الفحم (C) إلى الأنبوبة</button>';
  } else if (cur === 2) {
    html += '<button class="ctrl-btn action" onclick="g10L5Flame(true)" style="width:100%;margin-top:10px">🔥 شغّل النار</button>';
  } else if (cur === 3) {
    html += '<div class="info-box" style="margin-top:6px">🔥 تسخّن الأنبوبة الآن بقوة... راقب التغيّر داخلها.</div>';
    html += '<button class="ctrl-btn action" onclick="g10L5Flame(false)" style="width:100%;margin-top:10px" ' + (S.heatProg < 1 ? 'disabled' : '') + '>⏹ أغلق النار ودع الأنبوبة تبرد</button>';
  } else if (cur === 4) {
    html += '<div class="info-box" style="margin-top:6px">✨ لاحظ: تحوّل المسحوق الأسود إلى مادة <b>نحاس فلزي بنّي محمرّ لامع</b>!</div>';
    html += '<button class="ctrl-btn play" onclick="g10L5Hint(4)" style="width:100%;margin-top:10px">🖱️ اسحب أداة سحب الغاز إلى فوهة الأنبوبة</button>';
  } else if (cur === 5) {
    html += '<button class="ctrl-btn play" onclick="g10L5Hint(5)" style="width:100%;margin-top:10px">🖱️ انقل الأداة إلى أنبوبة ماء الجير</button>';
  }

  if (S.limeTurbid > 0 && S.limeTurbid < 1) {
    html += '<div class="q-box" style="margin-top:14px">🤔 ماذا يحدث للون ماء الجير؟ راقب جيداً...</div>';
  }

  if (cur >= 6) {
    html += '<div class="info-box" style="margin-top:14px;border-color:#D4901A">💡 تعكّر ماء الجير دليل على وجود غاز <b>ثاني أكسيد الكربون CO₂</b>.</div>';
    if (!S.showSummary) {
      html += '<button class="ctrl-btn action" onclick="g10L5ShowSummary()" style="width:100%;margin-top:10px">📊 ماذا حدث في التجربة؟</button>';
    }
  }

  if (S.showSummary) {
    html += '<div class="ctrl-section" style="margin-top:14px"><div class="ctrl-label">📊 ما الذي حدث؟</div>' +
      '<div style="font-size:12.5px;line-height:2;color:var(--text-secondary)">' +
      '1️⃣ عند تسخين أكسيد النحاس الثنائي الأسود (CuO) مع مسحوق الفحم، يتفاعل الكربون مع أكسيد النحاس.<br>' +
      '2️⃣ يتحوّل أكسيد النحاس الأسود إلى <b>نحاس فلزي أحمر/بنّي لامع</b>.<br>' +
      '3️⃣ يتكوّن غاز <b>ثاني أكسيد الكربون (CO₂)</b>، ويمرّ الغاز إلى ماء الجير.<br>' +
      '4️⃣ يتعكّر ماء الجير ويصبح <b>أبيض حليبياً</b>، وهذا دليل على وجود CO₂.</div></div>';
    html += '<div class="ctrl-section" style="margin-top:10px"><div class="ctrl-label">⚖️ المعادلة الكيميائية</div>' +
      '<div style="text-align:center;font-weight:800;font-size:15px;color:#B8780A;direction:ltr">2CuO + C → 2Cu + CO₂</div></div>';
    html += '<div style="display:flex;gap:8px;margin-top:10px;font-size:12px;text-align:center">' +
      '<div style="flex:1;background:rgba(0,0,0,0.04);border-radius:10px;padding:8px">أسود ⬅️<br><b style="color:#A0522D">نحاس بنّي محمرّ</b></div>' +
      '<div style="flex:1;background:rgba(0,0,0,0.04);border-radius:10px;padding:8px">ماء جير شفاف ⬅️<br><b style="color:#777">متعكّر أبيض حليبي</b></div></div>';
    if (!S.showConclusion) {
      html += '<button class="ctrl-btn action" onclick="g10L5ShowConclusion()" style="width:100%;margin-top:12px">🎯 الاستنتاج</button>';
    } else {
      html += '<div class="info-box" style="margin-top:12px;border-color:#3B8C4A">🏆 <b>الاستنتاج:</b> الكربون أكثر نشاطاً من النحاس، لذلك يستطيع اختزال أكسيد النحاس وإزاحة النحاس منه.</div>';
    }
  }

  controls(html);
}

window.g10L5Hint = function(step) {
  var msgs = {
    0: 'اسحب كومة المسحوق الأسود (CuO) من أعلى يسار المشهد إلى داخل الأنبوبة 🖱️',
    1: 'اسحب كومة الفحم من أعلى يمين المشهد إلى داخل الأنبوبة 🖱️',
    4: 'اسحب أداة سحب الغاز 🧪 من مكانها إلى فوهة أنبوبة التسخين',
    5: 'الآن انقل الأداة الممتلئة بالغاز إلى أنبوبة ماء الجير على اليمين'
  };
  buddySay(msgs[step] || 'تابع التجربة 👀', 4500);
};

window.g10L5Flame = function(on) {
  const S = simState;
  if (on) {
    S.flameOn = true;
    S.heatProg = 0;
    _g10L5Panel();
  } else {
    S.flameOn = false;
    S.cooling = true;
    U9Sound.ping(380, 0.15, 0.2);
    _g10L5Panel();
  }
};

window.g10L5ShowSummary = function() { simState.showSummary = true; _g10L5Panel(); };
window.g10L5ShowConclusion = function() {
  simState.showConclusion = true;
  U9Sound.win();
  buddySay('أحسنت! أنهيت التجربة بنجاح 🏆', 4500);
  _g10L5Panel();
};

function simG10Chem2N1() {
  cancelAnimationFrame(animFrame);
  simState = {
    t: 0, step: 0, flameOn: false, heatProg: 0, cooling: false, cooled: false,
    limeTurbid: 0, showSummary: false, showConclusion: false,
    heap1: { placed: false, dragging: false, x: 0, y: 0 },
    heap2: { placed: false, dragging: false, x: 0, y: 0 },
    dropper: { placed: 'shelf', dragging: false, x: 0, y: 0, gasLoaded: false }
  };
  const S = simState;
  _g10L5Panel();
  const cv = document.getElementById('simCanvas');

  function L() {
    var w = elW(), h = elH();
    return {
      w: w, h: h,
      tubeX: w * 0.30, tubeY: h * 0.52, tubeW: w * 0.30, tubeH: h * 0.10,
      standX: w * 0.30, standY: h * 0.60,
      burnerX: w * 0.30, burnerY: h * 0.86,
      heap1Home: { x: w * 0.10, y: h * 0.18 },
      heap2Home: { x: w * 0.24, y: h * 0.14 },
      dropperHome: { x: w * 0.52, y: h * 0.22 },
      limeX: w * 0.80, limeY: h * 0.55, limeW: w * 0.11, limeH: h * 0.34
    };
  }
  if (!S.heap1.placed) { var l0 = L(); S.heap1.x = l0.heap1Home.x; S.heap1.y = l0.heap1Home.y; }
  if (!S.heap2.placed) { var l1 = L(); S.heap2.x = l1.heap2Home.x; S.heap2.y = l1.heap2Home.y; }
  var l2 = L(); S.dropper.x = l2.dropperHome.x; S.dropper.y = l2.dropperHome.y;

  function gp(e) {
    var r = cv.getBoundingClientRect(), sc = cv.width / r.width;
    var s = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
    return { x: (s.clientX - r.left) * sc, y: (s.clientY - r.top) * sc };
  }

  function onDown(e) {
    var p = gp(e), l = L();
    if (S.step === 0 && !S.heap1.placed && Math.hypot(p.x - S.heap1.x, p.y - S.heap1.y) < 40) {
      S.heap1.dragging = true; e.preventDefault && e.preventDefault();
    } else if (S.step === 1 && !S.heap2.placed && Math.hypot(p.x - S.heap2.x, p.y - S.heap2.y) < 40) {
      S.heap2.dragging = true; e.preventDefault && e.preventDefault();
    } else if (S.step === 4 && S.dropper.placed === 'shelf' && Math.hypot(p.x - S.dropper.x, p.y - S.dropper.y) < 40) {
      S.dropper.dragging = true; e.preventDefault && e.preventDefault();
    } else if (S.step === 5 && S.dropper.placed === 'tube' && Math.hypot(p.x - S.dropper.x, p.y - S.dropper.y) < 40) {
      S.dropper.dragging = true; e.preventDefault && e.preventDefault();
    }
  }
  function onMove(e) {
    var p = gp(e);
    if (S.heap1.dragging) { S.heap1.x = p.x; S.heap1.y = p.y; }
    if (S.heap2.dragging) { S.heap2.x = p.x; S.heap2.y = p.y; }
    if (S.dropper.dragging) { S.dropper.x = p.x; S.dropper.y = p.y; }
  }
  function onUp(e) {
    var l = L();
    if (S.heap1.dragging) {
      S.heap1.dragging = false;
      if (Math.hypot(S.heap1.x - l.tubeX, S.heap1.y - l.tubeY) < 70) {
        S.heap1.placed = true; S.step = 1; U9Sound.win(); buddySay('أضفت أكسيد النحاس الأسود ✅ الآن أضف الفحم', 4000);
      } else { S.heap1.x = l.heap1Home.x; S.heap1.y = l.heap1Home.y; }
      _g10L5Panel();
    }
    if (S.heap2.dragging) {
      S.heap2.dragging = false;
      if (Math.hypot(S.heap2.x - l.tubeX, S.heap2.y - l.tubeY) < 70) {
        S.heap2.placed = true; S.step = 2; U9Sound.win(); buddySay('ممتاز! الأنبوبة جاهزة الآن للتسخين 🔥', 4000);
      } else { S.heap2.x = l.heap2Home.x; S.heap2.y = l.heap2Home.y; }
      _g10L5Panel();
    }
    if (S.dropper.dragging) {
      S.dropper.dragging = false;
      if (S.step === 4 && Math.hypot(S.dropper.x - l.tubeX, S.dropper.y - l.tubeY) < 70) {
        S.dropper.placed = 'tube'; S.dropper.gasLoaded = true; S.step = 5;
        U9Sound.win(); buddySay('التقطت الغاز! انقله الآن إلى أنبوبة ماء الجير 🧪', 4200);
      } else if (S.step === 5 && Math.hypot(S.dropper.x - l.limeX, S.dropper.y - l.limeY) < 70) {
        S.dropper.placed = 'lime'; S.step = 6; S.limeTurbid = 0.001;
        U9Sound.win();
      } else if (S.step === 4) {
        S.dropper.x = l.dropperHome.x; S.dropper.y = l.dropperHome.y;
      } else if (S.step === 5) {
        S.dropper.x = l.tubeX; S.dropper.y = l.tubeY;
      }
      _g10L5Panel();
    }
  }
  cv.addEventListener('mousedown', onDown); cv.addEventListener('mousemove', onMove); cv.addEventListener('mouseup', onUp);
  cv.addEventListener('touchstart', onDown, { passive: false }); cv.addEventListener('touchmove', onMove, { passive: false }); cv.addEventListener('touchend', onUp, { passive: false });

  function drawBunsen(c, x, y, w, on) {
    c.fillStyle = '#4A4A4A';
    c.beginPath(); c.roundRect(x - w * 0.5, y, w, w * 0.18, 4); c.fill();
    c.fillStyle = '#6E6E6E';
    c.beginPath(); c.roundRect(x - w * 0.09, y - w * 0.6, w * 0.18, w * 0.62, 3); c.fill();
    if (on) {
      var g = c.createLinearGradient(0, y - w * 0.6, 0, y - w * 1.5);
      g.addColorStop(0, '#4F9BFF'); g.addColorStop(0.5, '#FFB74A'); g.addColorStop(1, 'rgba(255,183,74,0)');
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(x - w * 0.08, y - w * 0.6);
      c.quadraticCurveTo(x - w * 0.16, y - w * 1.05, x, y - w * (1.35 + 0.08 * Math.sin(S.t * 0.3)));
      c.quadraticCurveTo(x + w * 0.16, y - w * 1.05, x + w * 0.08, y - w * 0.6);
      c.closePath(); c.fill();
    }
  }

  function draw() {
    if (currentSim !== 'g10chem2n1') { cancelAnimationFrame(animFrame); return; }
    var c = cv.getContext('2d'), w = cv.width, h = cv.height, l = L();
    c.clearRect(0, 0, w, h);
    var bg = c.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#F7F3EA'); bg.addColorStop(1, '#EDE6D6');
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    S.t++;

    // منضدة المختبر
    c.fillStyle = 'rgba(120,90,50,0.10)';
    c.fillRect(0, h * 0.90, w, h * 0.10);

    // حامل الأنبوبة
    c.strokeStyle = '#8A8A8A'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(l.standX - l.tubeW * 0.6, l.standY + 10); c.lineTo(l.standX - l.tubeW * 0.6, h * 0.9); c.stroke();
    c.beginPath(); c.moveTo(l.standX - l.tubeW * 0.6, l.standY + 10); c.lineTo(l.tubeX + l.tubeW * 0.15, l.standY + 10); c.stroke();

    // أنبوبة التسخين (أفقية مائلة قليلاً)
    c.save();
    c.translate(l.tubeX, l.tubeY); c.rotate(-0.06);
    c.fillStyle = 'rgba(230,240,245,0.55)';
    c.strokeStyle = '#93A6AD'; c.lineWidth = 2.5;
    c.beginPath(); c.roundRect(-l.tubeW * 0.5, -l.tubeH * 0.5, l.tubeW, l.tubeH, l.tubeH * 0.5); c.fill(); c.stroke();

    // محتوى الأنبوبة
    var mixColor = '#2B2B2B';
    if (S.cooled) mixColor = '#A0522D';
    else if (S.flameOn) {
      var p = Math.min(1, S.heatProg);
      mixColor = 'rgb(' + Math.round(43 + (160 - 43) * p) + ',' + Math.round(43 + (82 - 43) * p) + ',' + Math.round(43 + (45 - 43) * p) + ')';
    }
    if (S.heap1.placed || S.heap2.placed) {
      c.fillStyle = mixColor;
      c.beginPath(); c.roundRect(-l.tubeW * 0.42, -l.tubeH * 0.32, l.tubeW * 0.5, l.tubeH * 0.62, 5); c.fill();
      if (S.cooled) {
        // بريق النحاس
        for (var i = 0; i < 10; i++) {
          c.fillStyle = 'rgba(255,215,180,' + (0.15 + 0.15 * Math.sin(S.t * 0.05 + i)) + ')';
          c.beginPath(); c.arc(-l.tubeW * 0.42 + 6 + i * (l.tubeW * 0.045), -l.tubeH * 0.1, 3, 0, Math.PI * 2); c.fill();
        }
      }
    }
    c.restore();

    // موقد بنزن
    drawBunsen(c, l.burnerX, l.burnerY, w * 0.09, S.flameOn);

    // تقدم التسخين
    if (S.flameOn && S.heatProg < 1) {
      S.heatProg += 0.006;
      if (S.heatProg >= 1) { S.heatProg = 1; buddySay('اكتمل التسخين! أغلق النار الآن ⏹', 4000); _g10L5Panel(); }
    }
    if (S.cooling) {
      S.coolProg = (S.coolProg || 0) + 0.02;
      if (S.coolProg >= 1 && !S.cooled) { S.cooled = true; S.cooling = false; S.step = 4; _g10L5Panel(); buddySay('انظر! تحوّل المسحوق إلى نحاس فلزي لامع ✨', 4500); }
    }

    // أكوام المساحيق (على الرف قبل السحب / أثناء السحب)
    function drawHeap(pos, color, label, active) {
      if (pos.placed) return;
      c.fillStyle = color;
      c.beginPath(); c.arc(pos.x, pos.y, 26, 0, Math.PI * 2); c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = '#fff'; c.font = 'bold 12px Tajawal'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(label, pos.x, pos.y);
      if (!pos.dragging && active) {
        c.strokeStyle = 'rgba(212,144,26,0.8)'; c.lineWidth = 2; c.setLineDash([4, 4]);
        c.beginPath(); c.arc(pos.x, pos.y, 34, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
      }
    }
    drawHeap(S.heap1, '#2B2B2B', 'CuO', S.step === 0);
    drawHeap(S.heap2, '#3D3D3D', 'C', S.step === 1);

    // أنبوبة ماء الجير
    c.fillStyle = 'rgba(230,240,245,0.4)'; c.strokeStyle = '#93A6AD'; c.lineWidth = 2.5;
    c.beginPath(); c.roundRect(l.limeX - l.limeW / 2, l.limeY, l.limeW, l.limeH, 8); c.fill(); c.stroke();
    var turb = S.limeTurbid;
    if (turb > 0 && turb < 1) { S.limeTurbid = Math.min(1, turb + 0.006); }
    if (turb >= 1 && S.step === 6 && !S._limeDoneMsg) { S._limeDoneMsg = true; buddySay('تعكّر ماء الجير! دليل على غاز CO₂ 🎉', 4500); _g10L5Panel(); }
    var lc = 'rgba(41,128,185,' + (0.12 * (1 - turb)).toFixed(3) + ')';
    c.fillStyle = lc; c.fillRect(l.limeX - l.limeW / 2 + 3, l.limeY + l.limeH * 0.15, l.limeW - 6, l.limeH * 0.8);
    if (turb > 0) {
      c.fillStyle = 'rgba(255,255,255,' + Math.min(0.9, turb).toFixed(3) + ')';
      c.fillRect(l.limeX - l.limeW / 2 + 3, l.limeY + l.limeH * 0.15, l.limeW - 6, l.limeH * 0.8);
    }
    c.fillStyle = '#5A4020'; c.font = '11px Tajawal'; c.textAlign = 'center'; c.textBaseline = 'top';
    c.fillText('ماء الجير', l.limeX, l.limeY + l.limeH + 4);

    // أداة سحب الغاز
    if (!S.dropper.dragging || true) {
      c.save(); c.translate(S.dropper.x, S.dropper.y);
      c.fillStyle = '#DCE6E9'; c.strokeStyle = '#8FA3AA'; c.lineWidth = 1.5;
      c.beginPath(); c.roundRect(-6, -22, 12, 30, 4); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(-6, -22); c.lineTo(0, -34); c.lineTo(6, -22); c.closePath(); c.fill(); c.stroke();
      if (S.dropper.gasLoaded) { c.fillStyle = 'rgba(180,220,255,0.7)'; c.beginPath(); c.arc(0, -2, 4, 0, Math.PI * 2); c.fill(); }
      c.restore();
    }
    if (S.step === 4 || S.step === 5) {
      c.strokeStyle = 'rgba(212,144,26,0.8)'; c.lineWidth = 2; c.setLineDash([4, 4]);
      c.beginPath(); c.arc(S.dropper.x, S.dropper.y, 30, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
    }

    // تسميات
    c.fillStyle = '#5A4020'; c.font = 'bold 12px Tajawal'; c.textAlign = 'center'; c.textBaseline = 'top';
    c.fillText('أنبوبة التسخين', l.tubeX, l.tubeY + l.tubeH * 0.7 + 8);

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

// ────────────────────────────────────────────────────────────
// نشاط ٢-٢ · الفرن العالي — استخلاص الحديد
// ────────────────────────────────────────────────────────────
var _G10_BF_REACTIONS = [
  { t: 'الكربون يحترق بالهواء الساخن عند قاعدة الفرن', eq: 'C + O₂ → CO₂' },
  { t: 'ثاني أكسيد الكربون يتفاعل مع مزيد من الكربون', eq: 'CO₂ + C → 2CO' },
  { t: 'أحادي أكسيد الكربون يختزل أكسيد الحديد ويُنتج الحديد المنصهر', eq: 'Fe₂O₃ + 3CO → 2Fe + 3CO₂' }
];

function _g10L6Panel() {
  const S = simState;
  var html = '';
  html += '<div class="ctrl-section"><div class="ctrl-label">🏭 الفرن العالي</div>' +
    '<div class="ctrl-name" style="font-size:13px;font-weight:400;line-height:1.9">أضِف المواد الخام إلى الفرن، ثم اضخّ الهواء الساخن وراقب كيف يُستخلَص الحديد.</div></div>';

  var mats = [
    { k: 'ore', label: 'خام الحديد (Fe₂O₃)', icon: '🪨' },
    { k: 'coke', label: 'فحم الكوك (C)', icon: '⚫' },
    { k: 'lime', label: 'الحجر الجيري (CaCO₃)', icon: '🧱' }
  ];
  html += '<div class="ctrl-section"><div class="ctrl-label">📦 المواد الخام</div>';
  mats.forEach(function(m) {
    var added = S.added[m.k];
    html += '<div style="display:flex;align-items:center;gap:8px;padding:6px 0">' +
      '<span style="font-size:18px">' + m.icon + '</span>' +
      '<span style="flex:1;font-size:12.5px;' + (added ? 'color:#3B8C4A;font-weight:700' : 'color:var(--text-secondary)') + '">' + m.label + (added ? ' ✅' : '') + '</span>' +
      (added ? '' : '<button class="ctrl-btn" style="padding:5px 10px;font-size:12px" onclick="g10L6Add(\'' + m.k + '\')">أضِف ⬇️</button>') +
      '</div>';
  });
  html += '</div>';

  var allAdded = S.added.ore && S.added.coke && S.added.lime;
  if (allAdded && !S.airOn) {
    html += '<button class="ctrl-btn action" onclick="g10L6Air()" style="width:100%;margin-top:12px">💨 ضخّ الهواء الساخن</button>';
  } else if (!allAdded) {
    html += '<div class="info-box" style="margin-top:12px">👆 أضِف خام الحديد وفحم الكوك والحجر الجيري إلى الفرن أولاً.</div>';
  }

  if (S.airOn) {
    html += '<div class="ctrl-section" style="margin-top:12px"><div class="ctrl-label">🔥 التفاعلات داخل الفرن</div>';
    _G10_BF_REACTIONS.forEach(function(r, i) {
      var shown = S.reactStage > i;
      var active = S.reactStage === i;
      html += '<div style="padding:7px 0;' + (shown ? 'opacity:1' : (active ? 'opacity:1' : 'opacity:0.35')) + '">' +
        '<div style="font-size:12px;color:var(--text-secondary)">' + (i + 1) + '️⃣ ' + r.t + '</div>' +
        (shown || active ? '<div style="direction:ltr;text-align:center;font-weight:800;color:#B8780A;font-size:13.5px;margin-top:2px">' + r.eq + '</div>' : '') +
        '</div>';
    });
    html += '</div>';
  }

  if (S.showLimeInfo) {
    html += '<div class="info-box" style="margin-top:12px;border-color:#8E6A9A">🧱 يُستخدم الحجر الجيري لإزالة الشوائب الرئيسية، مثل الرمل، وتكوين <b>الخبث (سيليكات الكالسيوم)</b>.</div>';
  }

  if (S.ironFormed) {
    html += '<div class="ctrl-section" style="margin-top:12px"><div class="ctrl-label">⬇️ الناتج في أسفل الفرن</div>' +
      '<div style="font-size:12.5px;line-height:2;color:var(--text-secondary)">' +
      '🔶 <b style="color:#C0432B">الحديد المنصهر</b> — يتجمّع في الأسفل بسبب كثافته العالية.<br>' +
      '🟣 <b style="color:#8E6A9A">الخبث</b> — يطفو فوق الحديد، أخفّ منه في الكثافة.<br>' +
      '↑ <b style="color:#5B8DBF">غازات العادم</b> — تصعد وتخرج من أعلى الفرن.</div></div>';
    if (!S.quizShown) {
      html += '<button class="ctrl-btn action" onclick="g10L6Quiz()" style="width:100%;margin-top:12px">🧠 اختبر نفسك</button>';
    }
  }

  if (S.quizShown) {
    html += '<div class="q-box" style="margin-top:14px"><strong>ما المادة التي تساعد على إزالة الشوائب من خام الحديد؟</strong>' +
      '<div style="display:flex;flex-direction:column;gap:6px;margin-top:10px">' +
      '<button class="ctrl-btn" onclick="g10L6Answer(this,false)">خام الحديد</button>' +
      '<button class="ctrl-btn" onclick="g10L6Answer(this,false)">فحم الكوك</button>' +
      '<button class="ctrl-btn" onclick="g10L6Answer(this,true)">الحجر الجيري</button>' +
      '<button class="ctrl-btn" onclick="g10L6Answer(this,false)">الهواء الساخن</button>' +
      '</div><div id="g10l6fb" style="margin-top:8px;font-size:13px;font-weight:700"></div></div>';
  }

  if (S.info) html += '<div class="info-box" style="margin-top:14px">' + S.info + '</div>';

  controls(html);
}

window.g10L6Add = function(k) {
  simState.added[k] = true;
  U9Sound.ping(520, 0.12, 0.18);
  if (k === 'lime') simState.showLimeInfo = true;
  _g10L6Panel();
};

window.g10L6Air = function() {
  const S = simState;
  S.airOn = true; S.reactStage = 0; S.t2 = 0;
  U9Sound.ping(300, 0.2, 0.2);
  buddySay('يشتعل فحم الكوك بالهواء الساخن! راقب التفاعلات المتتالية 🔥', 4500);
  _g10L6Panel();
};

window.g10L6Quiz = function() { simState.quizShown = true; _g10L6Panel(); };
window.g10L6Answer = function(btn, correct) {
  var fb = document.getElementById('g10l6fb');
  if (correct) {
    fb.style.color = '#1E8449';
    fb.textContent = '✅ أحسنت! يساعد الحجر الجيري على إزالة الشوائب وتكوين الخبث.';
    U9Sound.win();
  } else {
    fb.style.color = '#C0392B';
    fb.textContent = '❌ حاول مرة أخرى 💡';
    U9Sound.ping(220, 0.3, 0.25);
  }
};

function simG10Chem2N2() {
  cancelAnimationFrame(animFrame);
  simState = {
    t: 0, t2: 0, added: { ore: false, coke: false, lime: false },
    airOn: false, reactStage: -1, ironFormed: false, showLimeInfo: false,
    quizShown: false, info: null
  };
  const S = simState;
  _g10L6Panel();
  const cv = document.getElementById('simCanvas');

  function draw() {
    if (currentSim !== 'g10chem2n2') { cancelAnimationFrame(animFrame); return; }
    var c = cv.getContext('2d'), w = cv.width, h = cv.height;
    c.clearRect(0, 0, w, h);
    var bg = c.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#1C1A17'); bg.addColorStop(1, '#0F0D0B');
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    S.t++;

    var fx = w * 0.5, topY = h * 0.06, botY = h * 0.86, topW = w * 0.22, botW = w * 0.34, midW = w * 0.40;
    // جسم الفرن (مقطعي)
    c.strokeStyle = '#8A8378'; c.lineWidth = 4;
    c.fillStyle = 'rgba(120,100,80,0.10)';
    c.beginPath();
    c.moveTo(fx - topW / 2, topY);
    c.lineTo(fx + topW / 2, topY);
    c.lineTo(fx + midW / 2, h * 0.42);
    c.lineTo(fx + botW / 2, botY);
    c.lineTo(fx - botW / 2, botY);
    c.lineTo(fx - midW / 2, h * 0.42);
    c.closePath(); c.fill(); c.stroke();

    // فتحة خروج العادم أعلى الفرن
    c.strokeStyle = '#5B8DBF'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(fx + topW / 2 + 4, topY + 6); c.lineTo(fx + topW / 2 + 30, topY - 12); c.stroke();
    c.fillStyle = '#5B8DBF'; c.font = '11px Tajawal'; c.textAlign = 'right'; c.textBaseline = 'bottom';
    c.fillText('↑ غاز العادم', fx + topW / 2 + 32, topY - 14);

    // المواد الخام في الأعلى (إن أُضيفت)
    var addedCount = (S.added.ore ? 1 : 0) + (S.added.coke ? 1 : 0) + (S.added.lime ? 1 : 0);
    if (addedCount > 0) {
      var fillH = Math.min(h * 0.34, h * 0.10 * addedCount);
      c.fillStyle = '#3A322A';
      c.beginPath();
      c.moveTo(fx - topW / 2 + 3, topY + 6);
      c.lineTo(fx + topW / 2 - 3, topY + 6);
      c.lineTo(fx + topW / 2 + (midW - topW) / 2 * (fillH / (h * 0.36)) - 3, topY + 6 + fillH);
      c.lineTo(fx - topW / 2 - (midW - topW) / 2 * (fillH / (h * 0.36)) + 3, topY + 6 + fillH);
      c.closePath(); c.fill();
      var specks = ['#8A6D4E', '#2B2B2B', '#C9BFA8'];
      for (var i = 0; i < addedCount * 14; i++) {
        c.fillStyle = specks[i % 3];
        c.beginPath();
        c.arc(fx - topW / 2 + 8 + (i * 9 % (topW - 16)), topY + 12 + (i * 13 % (fillH - 8)), 3, 0, Math.PI * 2);
        c.fill();
      }
    }

    // منطقة الاحتراق السفلية + الهواء الساخن
    if (S.airOn) {
      // فتحات الهواء
      for (var side = -1; side <= 1; side += 2) {
        var hx = fx + side * (botW / 2 - 6), hy = botY - 14;
        c.fillStyle = 'rgba(255,140,60,0.9)';
        c.beginPath(); c.arc(hx, hy, 6, 0, Math.PI * 2); c.fill();
      }
      // توهج الاحتراق
      var glowR = w * 0.20;
      var glow = c.createRadialGradient(fx, botY - 10, 4, fx, botY - 10, glowR);
      glow.addColorStop(0, 'rgba(255,150,40,0.85)');
      glow.addColorStop(0.5, 'rgba(255,90,20,0.35)');
      glow.addColorStop(1, 'rgba(255,90,20,0)');
      c.fillStyle = glow;
      c.beginPath(); c.arc(fx, botY - 10, glowR, 0, Math.PI * 2); c.fill();

      // فقاعات غاز صاعدة (CO تتصاعد)
      S.t2++;
      for (var b = 0; b < 8; b++) {
        var by = botY - ((S.t2 * 1.4 + b * 40) % (botY - topY - 20));
        var bx = fx + Math.sin((S.t2 + b * 30) * 0.05) * (midW * 0.18);
        c.fillStyle = 'rgba(255,170,90,' + (0.5 - 0.4 * ((botY - by) / (botY - topY))) + ')';
        c.beginPath(); c.arc(bx, by, 4, 0, Math.PI * 2); c.fill();
      }

      // تقدّم مراحل التفاعل
      if (S.reactStage < 2 && S.t2 % 90 === 0) {
        S.reactStage++;
        _g10L6Panel();
      }
      if (S.reactStage >= 2 && !S.ironFormed && S.t2 > 300) {
        S.ironFormed = true;
        buddySay('تكوّن الحديد المنصهر في قاع الفرن! 🎉', 4500);
        _g10L6Panel();
      }
    }

    // الحديد المنصهر + الخبث في القاع
    if (S.ironFormed) {
      var poolH = h * 0.09;
      c.fillStyle = '#B14A2A';
      c.beginPath(); c.roundRect(fx - botW / 2 + 8, botY - poolH, botW - 16, poolH - 3, 4); c.fill();
      for (var k = 0; k < 6; k++) {
        c.fillStyle = 'rgba(255,200,120,' + (0.25 + 0.2 * Math.sin(S.t * 0.08 + k)) + ')';
        c.beginPath(); c.arc(fx - botW / 2 + 20 + k * ((botW - 40) / 5), botY - poolH * 0.4, 4, 0, Math.PI * 2); c.fill();
      }
      c.fillStyle = '#B98ACB';
      c.beginPath(); c.roundRect(fx - botW / 2 + 8, botY - poolH - 8, botW - 16, 7, 3); c.fill();
      c.fillStyle = '#DCC8E0'; c.font = '10px Tajawal'; c.textAlign = 'center'; c.textBaseline = 'bottom';
      c.fillText('خبث', fx, botY - poolH - 10);
      c.fillStyle = '#F4C9A8'; c.font = 'bold 11px Tajawal'; c.textAlign = 'center'; c.textBaseline = 'top';
      c.fillText('حديد منصهر', fx, botY + 4);
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

// ────────────────────────────────────────────────────────────
// نشاط ٢-٢ (تكملة) · صناعة الفولاذ — عملية الأكسجين الأساسية (BOF)
// ────────────────────────────────────────────────────────────
var _G10_BOF_STAGES = [
  { letter:'أ', name:'التلقيم', title:'تعبئة الفرن بالمواد الخام',
    pills:['حديد خام منصهر','خردة فولاذ','فرن مائل'],
    body:'تُعبَّأ الفرن أولاً وهو مائل بالحديد الخام المنصهر القادم من الفرن العالي، ثم تُضاف إليه خردة الفولاذ المعاد تدويرها. تذوب الخردة وتمتزج مع الحديد غير النقي، وهذا يساعد على ضبط درجة حرارة المصهور والتخلّص من خردة الفولاذ القديم بدلاً من إهدارها.' },
  { letter:'ب', name:'التكرير', title:'نفخ الأكسجين وإضافة الجير',
    pills:['أكسجين عالي السرعة','جير حي CaO','خزانة جمع الأبخرة'],
    body:'يعود الفرن لوضعه الرأسي، وتُضاف كمية من الجير الحي (أكسيد الكالسيوم) إلى المصهور. ثم يُدخَل مدفع أكسجين مبرَّد بالماء من الأعلى ويُضَخّ الأكسجين بسرعة عالية، فيتفاعل مع الكربون والكبريت والفوسفور مكوّناً أكاسيد. تخرج أكاسيد الكربون الغازية عبر خزانة جمع الأبخرة، ويتفاعل الجير مع الأكاسيد اللافلزية مكوّناً الخبث الذي يطفو فوق الفولاذ.' },
  { letter:'ج', name:'السكب', title:'سكب الفولاذ والخبث',
    pills:['فولاذ نقي منصهر','فصل الخبث','فرن جاهز لشحنة جديدة'],
    body:'بعد اكتمال حرق الشوائب، يُمال الفرن في اتجاه واحد لسكب الفولاذ المنصهر النقي في وعاء التجميع. وعند الانتهاء، يُمال في الاتجاه المعاكس لسكب الخبث العائم بشكل منفصل، ليصبح الفرن جاهزاً لاستقبال شحنة جديدة.' }
];

// نقاط جسم الفرن (محلياً حول نقطة الارتكاز السفلى = (0,0))
var _BOF_BODY = {
  m:  [-10,-295],
  l1: [50,-295],
  c1: [[95,-295],[125,-255],[125,-205]],
  l2: [125,-85],
  c2: [[125,-35],[85,0],[20,0]],
  l3: [-20,0],
  c3: [[-85,0],[-125,-35],[-125,-85]],
  l4: [-125,-205],
  c4: [[-125,-255],[-95,-295],[-50,-295]]
};
function _bofPath(c, s) {
  var P = _BOF_BODY;
  c.beginPath();
  c.moveTo(P.m[0]*s, P.m[1]*s);
  c.lineTo(P.l1[0]*s, P.l1[1]*s);
  c.bezierCurveTo(P.c1[0][0]*s,P.c1[0][1]*s, P.c1[1][0]*s,P.c1[1][1]*s, P.c1[2][0]*s,P.c1[2][1]*s);
  c.lineTo(P.l2[0]*s, P.l2[1]*s);
  c.bezierCurveTo(P.c2[0][0]*s,P.c2[0][1]*s, P.c2[1][0]*s,P.c2[1][1]*s, P.c2[2][0]*s,P.c2[2][1]*s);
  c.lineTo(P.l3[0]*s, P.l3[1]*s);
  c.bezierCurveTo(P.c3[0][0]*s,P.c3[0][1]*s, P.c3[1][0]*s,P.c3[1][1]*s, P.c3[2][0]*s,P.c3[2][1]*s);
  c.lineTo(P.l4[0]*s, P.l4[1]*s);
  c.bezierCurveTo(P.c4[0][0]*s,P.c4[0][1]*s, P.c4[1][0]*s,P.c4[1][1]*s, P.c4[2][0]*s,P.c4[2][1]*s);
  c.closePath();
}

function _g10L7Panel() {
  const S = simState;
  var html = '';
  html += '<div class="ctrl-section"><div class="ctrl-label">🔩 الفرن المحوّل BOF</div>' +
    '<div class="ctrl-name" style="font-size:13px;font-weight:400;line-height:1.9">جرّب المراحل الثلاث لعملية الأكسجين الأساسية، أو شغّل المحاكاة تلقائياً.</div></div>';

  html += '<div class="ctrl-section"><div class="ctrl-label">🧭 مراحل العملية</div><div style="display:flex;flex-direction:column;gap:6px">';
  _G10_BOF_STAGES.forEach(function(st, i) {
    var active = S.stage === i;
    html += '<button class="ctrl-btn' + (active ? ' action' : '') + '" onclick="g10L7GoTo(' + i + ')" ' + (S.autoPlay ? 'disabled' : '') + ' style="text-align:right">' +
      'المرحلة (' + st.letter + ') — ' + st.name + '</button>';
  });
  html += '</div></div>';

  html += '<div style="display:flex;gap:8px;margin-top:10px">' +
    '<button class="ctrl-btn action" style="flex:1" onclick="g10L7AutoToggle()">' + (S.autoPlay ? '⏸ إيقاف مؤقت' : '▶ تشغيل تلقائي') + '</button>' +
    '<button class="ctrl-btn" style="flex:1" onclick="g10L7Reset()">↺ إعادة الضبط</button></div>';

  var st = _G10_BOF_STAGES[S.stage];
  html += '<div class="ctrl-section" style="margin-top:12px"><div class="ctrl-label">' + st.letter + ' — ' + st.title + '</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:5px;margin:6px 0 8px">' +
    st.pills.map(function(p){ return '<span style="background:rgba(212,144,26,0.12);color:#B8780A;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700">' + p + '</span>'; }).join('') +
    '</div><div style="font-size:12.5px;line-height:1.9;color:var(--text-secondary)">' + st.body + '</div></div>';

  if (S.stage === 1) {
    html += '<button class="ctrl-btn action" style="width:100%;margin-top:10px" onclick="g10L7Oxygen()" ' + (S.oxygenActive || S.autoPlay ? 'disabled' : '') + '>💨 نفخ الأكسجين</button>';
  }

  html += '<div class="ctrl-section" style="margin-top:12px"><div class="ctrl-label">📊 قراءات الفرن</div>' +
    '<div style="font-size:12px;display:flex;justify-content:space-between"><span>نسبة الكربون المتبقّية</span><b id="g10bofCarbonVal">' + S.carbon.toFixed(1) + '٪</b></div>' +
    '<div style="height:8px;border-radius:5px;background:rgba(0,0,0,0.08);margin:4px 0 10px;overflow:hidden"><div id="g10bofCarbonBar" style="height:100%;background:#B8780A;width:' + (S.carbon/4*100) + '%"></div></div>' +
    '<div style="font-size:12px;display:flex;justify-content:space-between"><span>درجة حرارة المصهور</span><b id="g10bofTempVal">' + Math.round(S.temp) + '°م</b></div>' +
    '<div style="height:8px;border-radius:5px;background:rgba(0,0,0,0.08);margin:4px 0;overflow:hidden"><div id="g10bofTempBar" style="height:100%;background:#C0432B;width:' + ((S.temp-1300)/450*100) + '%"></div></div>' +
    '</div>';

  html += '<div class="info-box" style="margin-top:12px">🔑 <b>عملية الأكسجين الأساسية:</b> طريقة لتحويل الحديد الخام غير النقي إلى فولاذ، بضخّ الأكسجين عالي السرعة داخل الفرن لحرق الكربون الزائد والشوائب الأخرى الموجودة في المصهور.</div>';

  controls(html);
}

window.g10L7GoTo = function(i) {
  const S = simState;
  S.stage = i;
  S.oxygenActive = false;
  if (i === 0) { S.targetTilt = -16; S.scrapVisible = true; S.metalLevel = 0.32; S.slagLevel = 0; S.lanceDown = false; S.pourPhase = 0; S.hud = 'تعبئة الفرن'; }
  else if (i === 1) { S.targetTilt = 0; S.scrapVisible = false; S.metalLevel = 0.42; S.slagLevel = 0.10; S.lanceDown = true; S.pourPhase = 0; S.hud = 'نفخ الأكسجين'; }
  else { S.scrapVisible = false; S.lanceDown = false; S.pourPhase = 1; S.pourT = 0; S.hud = 'إمالة الفرن لسكب الفولاذ'; }
  _g10L7Panel();
};

window.g10L7Oxygen = function() {
  const S = simState;
  if (S.stage !== 1 || S.oxygenActive) return;
  S.oxygenActive = true; S.oxySteps = 0; S.hud = 'نفخ الأكسجين نشط';
  _g10L7Panel();
};

window.g10L7AutoToggle = function() {
  const S = simState;
  S.autoPlay = !S.autoPlay;
  if (S.autoPlay) { S.autoT = 0; S.autoPhase = 0; window.g10L7GoTo(0); S.autoPlay = true; }
  _g10L7Panel();
};

window.g10L7Reset = function() {
  const S = simState;
  S.autoPlay = false;
  window.g10L7GoTo(0);
  U9Sound.ping(300, 0.15, 0.15);
};

function simG10Chem2N3() {
  cancelAnimationFrame(animFrame);
  simState = {
    t: 0, stage: 0, tilt: -16, targetTilt: -16, scrapVisible: true,
    metalLevel: 0.32, slagLevel: 0, lanceDown: false,
    carbon: 4.0, temp: 1350, oxygenActive: false, oxySteps: 0,
    pourPhase: 0, pourT: 0, autoPlay: false, autoT: 0, autoPhase: 0,
    hud: 'تعبئة الفرن', particles: []
  };
  const S = simState;
  _g10L7Panel();
  const cv = document.getElementById('simCanvas');

  function draw() {
    if (currentSim !== 'g10chem2n3') { cancelAnimationFrame(animFrame); return; }
    var c = cv.getContext('2d'), w = cv.width, h = cv.height;
    c.clearRect(0, 0, w, h);
    var bg = c.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#201910'); bg.addColorStop(1, '#120E09');
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    S.t++;

    var scale = Math.min(w, h) * 0.0022;
    var pivotX = w * 0.42, pivotY = h * 0.72;

    // ── التشغيل التلقائي ──
    if (S.autoPlay) {
      S.autoT++;
      if (S.autoPhase === 0 && S.autoT > 140) { window.g10L7GoTo(1); S.autoPhase = 1; S.autoT = 0; }
      else if (S.autoPhase === 1 && S.autoT > 40 && !S.oxygenActive && S.oxySteps === 0) { window.g10L7Oxygen(); S.autoPhase = 2; }
      else if (S.autoPhase === 2 && !S.oxygenActive && S.oxySteps > 0) { S.autoPhase = 3; S.autoT = 0; }
      else if (S.autoPhase === 3 && S.autoT > 60) { window.g10L7GoTo(2); S.autoPhase = 4; S.autoT = 0; }
      else if (S.autoPhase === 4 && S.pourPhase === 5) { S.autoPlay = false; S.hud = 'اكتملت الدورة — يمكنك البدء من جديد'; _g10L7Panel(); }
    }

    // ── نفخ الأكسجين ──
    if (S.oxygenActive) {
      if (S.t % 9 === 0) {
        S.oxySteps++;
        S.carbon = Math.max(0.15, S.carbon - 0.13);
        S.temp = Math.min(1650, S.temp + 10);
        S.slagLevel = Math.min(0.28, 0.10 + S.oxySteps * 0.006);
        S.particles.push({ x: pivotX + (Math.random()*10-5)*scale, y: pivotY - 175*scale, life: 30, ox: Math.random() > 0.5 });
        var cv1 = document.getElementById('g10bofCarbonVal'), cb1 = document.getElementById('g10bofCarbonBar');
        var tv1 = document.getElementById('g10bofTempVal'), tb1 = document.getElementById('g10bofTempBar');
        if (cv1) cv1.textContent = S.carbon.toFixed(1) + '٪';
        if (cb1) cb1.style.width = (S.carbon/4*100) + '%';
        if (tv1) tv1.textContent = Math.round(S.temp) + '°م';
        if (tb1) tb1.style.width = ((S.temp-1300)/450*100) + '%';
        if (S.oxySteps > 28) { S.oxygenActive = false; S.hud = 'الشوائب أُزيلت — جاهز للسكب'; _g10L7Panel(); }
      }
    }
    S.particles = S.particles.filter(function(p){ p.y -= 1.1; p.life--; return p.life > 0; });

    // ── تسلسل السكب في المرحلة (ج) ──
    if (S.stage === 2) {
      S.pourT++;
      if (S.pourPhase === 1) { S.targetTilt = 22; if (S.pourT > 20) S.pourPhase = 1.5; }
      else if (S.pourPhase === 1.5 && S.pourT > 60) { S.pourPhase = 2; S.pourT = 0; S.hud = 'سكب الفولاذ المنصهر'; }
      else if (S.pourPhase === 2 && S.pourT > 90) { S.pourPhase = 3; S.targetTilt = -22; S.pourT = 0; S.hud = 'إمالة الفرن لسكب الخبث'; }
      else if (S.pourPhase === 3 && S.pourT > 30) { S.pourPhase = 3.5; }
      else if (S.pourPhase === 3.5 && S.pourT > 70) { S.pourPhase = 4; S.pourT = 0; }
      else if (S.pourPhase === 4 && S.pourT > 40) { S.pourPhase = 5; S.targetTilt = 0; S.metalLevel = 0.05; S.slagLevel = 0; S.hud = 'الفرن جاهز لشحنة جديدة'; }
    }

    // إمالة سلسة نحو الهدف
    S.tilt += (S.targetTilt - S.tilt) * 0.06;

    // ── رسم الفرن ──
    c.save();
    c.translate(pivotX, pivotY);
    c.rotate(S.tilt * Math.PI / 180);
    _bofPath(c, scale);
    var shellGrad = c.createLinearGradient(-125*scale, -295*scale, 125*scale, 0);
    shellGrad.addColorStop(0, '#6A7280'); shellGrad.addColorStop(0.5, '#3A4150'); shellGrad.addColorStop(1, '#1C212B');
    c.fillStyle = shellGrad; c.fill();
    c.strokeStyle = '#0E1117'; c.lineWidth = 5; c.stroke();

    c.save();
    _bofPath(c, scale); c.clip();
    var metalTopY = -Math.min(295, 260 * S.metalLevel) * scale;
    var metalGrad = c.createLinearGradient(0, metalTopY, 0, 40*scale);
    metalGrad.addColorStop(0, '#FFB648'); metalGrad.addColorStop(0.55, '#FF5A1F'); metalGrad.addColorStop(1, '#A4230A');
    c.fillStyle = metalGrad;
    c.fillRect(-140*scale, metalTopY, 280*scale, 300*scale);
    if (S.slagLevel > 0) {
      var slagPixH = 260 * S.slagLevel * scale;
      var slagGrad = c.createLinearGradient(-140*scale, metalTopY - slagPixH, 140*scale, metalTopY);
      slagGrad.addColorStop(0, '#E8C25F'); slagGrad.addColorStop(1, '#A97F28');
      c.fillStyle = slagGrad;
      c.fillRect(-140*scale, metalTopY - slagPixH, 280*scale, slagPixH);
    }
    c.restore();

    // خردة الفولاذ (المرحلة أ)
    if (S.scrapVisible) {
      c.save(); c.fillStyle = '#9AA3AF'; c.strokeStyle = '#4A5162'; c.lineWidth = 1.5 * scale;
      [[-47*scale,-268*scale,16*scale,0.3],[8*scale,-282*scale,14*scale,-0.2],[45*scale,-262*scale,18*scale,0.15]].forEach(function(r) {
        c.save(); c.translate(r[0], r[1]); c.rotate(r[3]);
        c.beginPath(); c.roundRect(-r[2]/2, -r[2]/2, r[2], r[2], 3); c.fill(); c.stroke();
        c.restore();
      });
      c.restore();
    }

    c.restore(); // نهاية مجموعة الفرن المائل

    // مدفع الأكسجين (يبقى شاقولياً، خارج مجموعة الإمالة)
    var lanceY = S.lanceDown ? pivotY - 175*scale : pivotY - 460*scale;
    c.strokeStyle = '#57D6E8'; c.fillStyle = '#2C3542'; c.lineWidth = 1.5;
    c.beginPath(); c.roundRect(pivotX - 4*scale, lanceY - 220*scale, 8*scale, 220*scale, 3); c.fill(); c.stroke();
    c.fillStyle = '#57D6E8'; c.beginPath(); c.arc(pivotX, lanceY, 4*scale, 0, Math.PI*2); c.fill();

    // جسيمات صاعدة أثناء النفخ
    S.particles.forEach(function(p) {
      c.fillStyle = (p.ox ? 'rgba(87,214,232,' : 'rgba(255,220,160,') + (p.life/30) + ')';
      c.beginPath(); c.arc(p.x, p.y, 2.2*scale, 0, Math.PI*2); c.fill();
    });

    // مجاري السكب + أوعية التجميع
    var ladleY = h * 0.94;
    function drawLadle(x, on, color, label) {
      c.globalAlpha = on ? 1 : 0.18;
      c.fillStyle = color;
      c.beginPath(); c.moveTo(x - 26, ladleY); c.lineTo(x + 26, ladleY); c.lineTo(x + 18, ladleY + 18); c.lineTo(x - 18, ladleY + 18); c.closePath(); c.fill();
      c.fillStyle = '#C9A06A'; c.font = '10px Tajawal'; c.textAlign = 'center'; c.textBaseline = 'top';
      c.fillText(label, x, ladleY + 22);
      c.globalAlpha = 1;
    }
    var steelOn = S.pourPhase >= 1.5, slagOn = S.pourPhase >= 4;
    drawLadle(pivotX - 130*scale, steelOn, '#FF7A2A', 'فولاذ منصهر');
    drawLadle(pivotX + 130*scale, slagOn, '#D3A13A', 'الخبث');

    if (S.pourPhase === 1.5 || (S.pourPhase >= 1.5 && S.pourPhase < 2 + 0.01 && S.pourPhase !== 3)) {
      // stream سكب الفولاذ يظهر بين ١.٥ إلى بداية ٣
    }
    var showSteelStream = S.pourPhase >= 1.5 && S.pourPhase < 3;
    var showSlagStream = S.pourPhase >= 4 && S.pourPhase < 5;
    function pourStream(fromX, toX, color) {
      c.strokeStyle = color; c.lineWidth = 5; c.lineCap = 'round';
      c.beginPath();
      c.moveTo(fromX, pivotY - 20*scale);
      c.bezierCurveTo(fromX, pivotY + 60*scale, toX, pivotY + 100*scale, toX, ladleY);
      c.stroke();
    }
    if (showSteelStream) pourStream(pivotX - 15*scale, pivotX - 120*scale, '#FF7A2A');
    if (showSlagStream) pourStream(pivotX + 15*scale, pivotX + 120*scale, '#D3A13A');

    // بطاقة الحالة (HUD)
    c.fillStyle = 'rgba(0,0,0,0.35)';
    c.beginPath(); c.roundRect(w*0.06, h*0.05, w*0.42, h*0.07, 10); c.fill();
    c.fillStyle = '#F4ECE0'; c.font = 'bold 13px Tajawal'; c.textAlign = 'right'; c.textBaseline = 'middle';
    c.fillText('الحالة: ' + S.hud, w*0.06 + w*0.40, h*0.05 + h*0.035);

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

// ────────────────────────────────────────────────────────────
// نشاط ٤-٢ · العوامل المؤثّرة في صدأ الحديد
// ────────────────────────────────────────────────────────────
var _G10_RUST_TUBES = [
  { label: 'الأنبوبة ١ (ضابطة)', water: true,  oxygen: true,  rate: 1, cond: 'هواء عادي + ماء مقطّر' },
  { label: 'الأنبوبة ٢',          water: false, oxygen: true,  rate: 0, cond: 'هواء جاف (عامل تجفيف) — بدون ماء' },
  { label: 'الأنبوبة ٣',          water: true,  oxygen: false, rate: 0, cond: 'ماء مغلي منزوع الأكسجين + طبقة زيت' },
  { label: 'الأنبوبة ٤',          water: true,  oxygen: true,  rate: 2, cond: 'ماء مقطّر + أكسجين نقي' }
];

function _rustColor(pct) {
  var from = [154,152,144], to = [163,82,29];
  var t = pct / 100;
  var col = from.map(function(f,i){ return Math.round(f + (to[i]-f)*t); });
  return 'rgb(' + col.join(',') + ')';
}

function _g10L8Panel() {
  const S = simState;
  var html = '';
  html += '<div class="ctrl-section"><div class="ctrl-label">🧷 العوامل المؤثّرة في صدأ الحديد</div>' +
    '<div class="ctrl-name" style="font-size:13px;font-weight:400;line-height:1.9">حرّك الشريط لتمثيل مرور الأيام، وراقب ماذا يحدث للمسمار الحديدي في كل أنبوبة اختبار.</div></div>';

  html += '<div class="ctrl-section"><div class="ctrl-label">📅 عدد الأيام المنقضية: <b id="g10rustDaysOut">' + S.days + ' يوم</b></div>' +
    '<input type="range" min="0" max="7" step="1" value="' + S.days + '" id="g10rustSlider" style="width:100%;accent-color:#185FA5" oninput="g10L8Days(this.value)"></div>';

  html += '<div class="ctrl-section"><div class="ctrl-label">🧪 ظروف الأنابيب</div>';
  _G10_RUST_TUBES.forEach(function(t, i) {
    html += '<div style="padding:6px 0;border-bottom:1px dashed rgba(0,0,0,0.08)">' +
      '<div style="font-size:12.5px;font-weight:700">' + t.label + '</div>' +
      '<div style="font-size:11.5px;color:var(--text-muted)">' + t.cond + '</div>' +
      '<div style="display:flex;gap:6px;margin-top:3px">' +
      '<span style="font-size:10.5px;padding:2px 8px;border-radius:20px;background:' + (t.water ? 'rgba(24,95,165,0.12);color:#185FA5' : 'rgba(0,0,0,0.06);color:#999') + '">' + (t.water ? '💧 ماء' : '🚫 لا ماء') + '</span>' +
      '<span style="font-size:10.5px;padding:2px 8px;border-radius:20px;background:' + (t.oxygen ? 'rgba(24,95,165,0.12);color:#185FA5' : 'rgba(0,0,0,0.06);color:#999') + '">' + (t.oxygen ? '🫧 أكسجين' : '🚫 لا أكسجين') + '</span>' +
      '</div></div>';
  });
  html += '</div>';

  if (!S.showConclusion) {
    html += '<button class="ctrl-btn action" style="width:100%;margin-top:12px" onclick="g10L8Conclude()">🎯 اطّلع على الاستنتاج</button>';
  } else {
    html += '<div class="info-box" style="margin-top:12px;border-color:#3B8C4A">🏆 <b>الاستنتاج:</b> يصدأ الحديد فقط عندما يتوفّر الماء والأكسجين معاً في وقت واحد (كما في الأنبوبتين ١ و٤). أما غياب أحدهما فقط — سواء الماء (الأنبوبة ٢) أو الأكسجين (الأنبوبة ٣) — فيمنع تكوّن الصدأ تماماً. كما أنّ زيادة تركيز الأكسجين (الأنبوبة ٤) تُسرّع معدّل الصدأ مقارنةً بالهواء العادي.</div>';
  }

  controls(html);
}

window.g10L8Days = function(v) {
  simState.days = Number(v);
  var out = document.getElementById('g10rustDaysOut');
  if (out) out.textContent = simState.days + ' يوم';
};

window.g10L8Conclude = function() {
  simState.showConclusion = true;
  U9Sound.win();
  buddySay('أحسنت! الماء + الأكسجين معاً = صدأ 🎯', 4500);
  _g10L8Panel();
};

function simG10Chem2N4() {
  cancelAnimationFrame(animFrame);
  simState = { t: 0, days: 0, showConclusion: false };
  const S = simState;
  _g10L8Panel();
  const cv = document.getElementById('simCanvas');

  function draw() {
    if (currentSim !== 'g10chem2n4') { cancelAnimationFrame(animFrame); return; }
    var c = cv.getContext('2d'), w = cv.width, h = cv.height;
    c.clearRect(0, 0, w, h);
    var bg = c.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#F7F3EA'); bg.addColorStop(1, '#EDE6D6');
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    S.t++;

    var n = 4, gap = w * 0.03, tubeW = Math.min(w * 0.18, (w - gap*(n+1)) / n);
    var startX = (w - (tubeW*n + gap*(n-1))) / 2;
    var tubeTop = h * 0.14, tubeH = h * 0.60;

    for (var i = 0; i < n; i++) {
      var td = _G10_RUST_TUBES[i];
      var x = startX + i * (tubeW + gap);
      var cx = x + tubeW / 2;

      // زجاج الأنبوبة
      c.fillStyle = 'rgba(230,240,245,0.35)'; c.strokeStyle = '#93A6AD'; c.lineWidth = 2.5;
      c.beginPath(); c.roundRect(x, tubeTop, tubeW, tubeH, tubeW*0.4); c.fill(); c.stroke();

      // الماء
      if (td.water) {
        c.fillStyle = 'rgba(90,160,210,0.28)';
        c.beginPath(); c.roundRect(x + 4, tubeTop + tubeH*0.35, tubeW - 8, tubeH*0.6, 6); c.fill();
      } else {
        // عامل تجفيف (كلوريد الكالسيوم) في القاع
        c.fillStyle = '#DCD4C0';
        c.beginPath(); c.roundRect(x + 6, tubeTop + tubeH*0.82, tubeW - 12, tubeH*0.12, 4); c.fill();
        c.strokeStyle = 'rgba(0,0,0,0.15)'; c.lineWidth = 1; c.strokeRect(x + 6, tubeTop + tubeH*0.82, tubeW - 12, tubeH*0.12);
      }
      // طبقة زيت (الأنبوبة ٣ فقط) فوق سطح الماء
      if (!td.oxygen && td.water) {
        c.fillStyle = 'rgba(210,170,60,0.55)';
        c.beginPath(); c.roundRect(x + 4, tubeTop + tubeH*0.33, tubeW - 8, tubeH*0.05, 3); c.fill();
      }

      // المسمار
      var rustPct = Math.min(100, td.rate * S.days * 14);
      var nailColor = _rustColor(rustPct);
      c.fillStyle = nailColor;
      var nailX = cx - tubeW*0.05, nailY = tubeTop + tubeH*0.10, nailW = tubeW*0.10, nailH = tubeH*0.72;
      c.beginPath(); c.roundRect(nailX, nailY, nailW, nailH, 3); c.fill();
      c.beginPath(); c.moveTo(nailX, nailY); c.lineTo(nailX + nailW/2, nailY - nailH*0.06); c.lineTo(nailX+nailW, nailY); c.closePath(); c.fill();

      // بقع الصدأ عند الزيادة
      if (rustPct > 15) {
        c.fillStyle = 'rgba(120,60,20,' + Math.min(0.5, rustPct/200) + ')';
        for (var s = 0; s < Math.floor(rustPct/20); s++) {
          c.beginPath(); c.arc(nailX + (s%2)*nailW, nailY + nailH*0.15 + s*nailH*0.18, 3, 0, Math.PI*2); c.fill();
        }
      }

      // فقاعات أكسجين متحركة (رمزية) في الأنابيب التي فيها أكسجين وماء
      if (td.oxygen && td.water) {
        for (var b = 0; b < 3; b++) {
          var by = tubeTop + tubeH*0.9 - ((S.t*0.6 + b*30) % (tubeH*0.5));
          c.fillStyle = 'rgba(255,255,255,0.35)';
          c.beginPath(); c.arc(cx + (b-1)*tubeW*0.18, by, 2.4, 0, Math.PI*2); c.fill();
        }
      }

      // تسمية أسفل الأنبوبة
      c.fillStyle = '#5A4020'; c.font = 'bold 11px Tajawal'; c.textAlign = 'center'; c.textBaseline = 'top';
      c.fillText('أنبوبة ' + (i+1), cx, tubeTop + tubeH + 8);
      c.font = '10.5px Tajawal'; c.fillStyle = rustPct === 0 ? '#7A8A98' : (rustPct < 100 ? '#B8780A' : '#A32D2D');
      var statusTxt = rustPct === 0 ? 'لا صدأ' : (rustPct < 40 ? 'بداية الصدأ' : (rustPct < 100 ? 'صدأ متزايد' : 'صدأ كامل'));
      c.fillText(statusTxt, cx, tubeTop + tubeH + 24);
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}
