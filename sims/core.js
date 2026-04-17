// ═══════════════════════════════════════
// FOOTER VISIBILITY CONTROLLER
// ═══════════════════════════════════════
function _showFooter() {
  var f = document.getElementById('bayyin-footer');
  if (f) f.style.display = 'block';
}
function _hideFooter() {
  var f = document.getElementById('bayyin-footer');
  if (f) f.style.display = 'none';
}
function _updateFooterVisibility() {
  var footer = document.getElementById('bayyin-footer');
  if (!footer) return;

  // أخفِ الفوتر داخل الاستقصاء
  var simPanel = document.getElementById('sim-panel');
  if (simPanel && simPanel.classList.contains('open')) {
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'block';

  // حدِّد الصفحة النشطة وضع الفوتر في نهايتها
  var landing = document.getElementById('landing');
  var picker  = document.getElementById('grade-picker');
  var ca      = document.getElementById('content-area'); // داخله البانلات

  // تحقق أي عنصر مرئي حالياً
  function isVisible(el) {
    return el && el.offsetParent !== null && el.style.display !== 'none' &&
           getComputedStyle(el).display !== 'none';
  }

  if (isVisible(landing)) {
    // الصفحة الرئيسية
    if (footer.parentNode !== landing) landing.appendChild(footer);
  } else if (isVisible(picker)) {
    // صفحة اختيار الصف
    if (footer.parentNode !== picker) picker.appendChild(footer);
  } else if (isVisible(ca)) {
    // داخل صفحة الوحدات — ضع الفوتر في نهاية content-area
    if (footer.parentNode !== ca) ca.appendChild(footer);
  } else {
    document.body.appendChild(footer);
  }
}

window.onerror = function(msg, src, line, col, err) {
  if (!msg || msg === 'Script error.' || msg === 'Script error' || (line === 0 && col === 0)) return false;
  // نُسجّل في console دائماً بتفاصيل
  console.error('JS Error:', msg, '| Line:', line, '| Col:', col, '| err:', err);
  var detail = err ? (err.stack || err.toString()) : (msg + ' L:' + line);
  var d = document.getElementById('js-error-banner');
  if (!d) { d = document.createElement('div'); d.id = 'js-error-banner';
    d.style.cssText = 'position:fixed;top:0;left:0;right:0;padding:8px 12px;background:#C0392B;color:white;font-size:13px;z-index:9999;font-family:monospace;direction:ltr;white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
    document.body.appendChild(d);
  }
  d.textContent = 'JS Error: ' + msg + ' | Line: ' + line + ' | Col: ' + col;
  d.title = detail;
  return false; // لا نمنع الخطأ من الظهور
};
window.addEventListener('unhandledrejection', function(e){
  console.error('Unhandled Promise:', e.reason);
});// ===== POLYFILL: roundRect for older Safari/iOS =====
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    // دعم array [tl, tr, br, bl] أو رقم واحد
    var tl,tr,br,bl;
    if (Array.isArray(r)) {
      tl = r[0]||0; tr = r[1]!==undefined?r[1]:tl;
      br = r[2]!==undefined?r[2]:tl; bl = r[3]!==undefined?r[3]:tr;
    } else {
      tl = tr = br = bl = r || 0;
    }
    var maxR = Math.min(Math.abs(w)/2, Math.abs(h)/2);
    tl=Math.min(tl,maxR); tr=Math.min(tr,maxR);
    br=Math.min(br,maxR); bl=Math.min(bl,maxR);
    this.beginPath();
    this.moveTo(x + tl, y);
    this.lineTo(x + w - tr, y);
    this.quadraticCurveTo(x + w, y, x + w, y + tr);
    this.lineTo(x + w, y + h - br);
    this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
    this.lineTo(x + bl, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - bl);
    this.lineTo(x, y + tl);
    this.quadraticCurveTo(x, y, x + tl, y);
    this.closePath();
    return this;
  };
}
// ===== POLYFILL: ellipse for older Safari =====
if (!CanvasRenderingContext2D.prototype.ellipse) {
  CanvasRenderingContext2D.prototype.ellipse = function(x, y, rx, ry, rot, startAngle, endAngle, ccw) {
    this.save();
    this.translate(x, y);
    this.rotate(rot || 0);
    this.scale(rx, ry);
    this.arc(0, 0, 1, startAngle, endAngle, ccw);
    this.restore();
  };
}
// ===== NAVIGATION =====
// Helper: inject buttons without nested template literals (Safari compat)
function buildBtns(placeholderId, items, onclickFn, idPrefix) {
  var el = document.getElementById(placeholderId);
  if (!el) return;
  var html = '';
  for (var i = 0; i < items.length; i++) {
    var m = items[i];
    var idAttr = idPrefix ? ' id="' + idPrefix + i + '"' : '';
    html += '<button class="ctrl-btn"' + idAttr + ' onclick="' + onclickFn + '(' + i + ')">' + m.icon + ' ' + m.name + '</button>';
  }
  el.innerHTML = html;
}
function openApp() {
  var landing = document.getElementById('landing');
  var picker = document.getElementById('grade-picker');
  landing.style.setProperty('display', 'none', 'important');
  picker.style.display = 'flex';
  setTimeout(_updateFooterVisibility, 50);
}
function goHomePicker() {
  document.getElementById('grade-picker').style.display = 'none';
  var landing = document.getElementById('landing');
  landing.style.removeProperty('display');
  setTimeout(_updateFooterVisibility, 50);
}
function pickGrade(g) {
  document.getElementById('grade-picker').style.display = 'none';
  const app = document.getElementById('app');
  app.style.display = 'flex';
  app.classList.add('open');
  document.body.classList.add('app-mode');
  switchGrade(g);
  var ca = document.getElementById('content-area');
  if (ca) ca.scrollTop = 0;
  var _bw = document.getElementById('buddy-wrap');
  var _br = document.getElementById('buddy-restore-btn');
  var _bh = ''; try{_bh=localStorage.getItem('bayyin-buddy-hidden');}catch(e){}
  if(_bh !== '1'){ if(_bw){_bw.classList.add('visible');_bw.classList.remove('hidden');} }
  else { if(_br) _br.classList.add('show'); }
  setTimeout(function(){ buddySay('أهلاً بك في بيّن! 🚀 اختر وحدة وسأعطيك تلميحاً عنها!', 5000); }, 600);
  setTimeout(_updateFooterVisibility, 80);
}
function goHome() {
  closeSim();
  const app = document.getElementById('app');
  app.style.display = 'none';
  app.classList.remove('open');
  document.body.classList.remove('app-mode');
  document.getElementById('grade-picker').style.display = 'flex';
  var _bw = document.getElementById('buddy-wrap');
  var _br = document.getElementById('buddy-restore-btn');
  if(_bw){_bw.classList.remove('visible');_bw.classList.add('hidden');}
  if(_br) _br.classList.remove('show');
  hideBubble();
  setTimeout(_updateFooterVisibility, 50);
}

// ── زر "الرئيسية" في الـ topbar → يرجع للصفحة الرئيسية (landing)
function goToLanding() {
  closeSim();
  const app = document.getElementById('app');
  app.style.display = 'none';
  app.classList.remove('open');
  document.body.classList.remove('app-mode');
  document.getElementById('grade-picker').style.display = 'none';
  var landing = document.getElementById('landing');
  landing.style.removeProperty('display');
  var _bw = document.getElementById('buddy-wrap');
  var _br = document.getElementById('buddy-restore-btn');
  if(_bw){_bw.classList.remove('visible');_bw.classList.add('hidden');}
  if(_br) _br.classList.remove('show');
  hideBubble();
  setTimeout(_updateFooterVisibility, 50);
}

// ══════════════════════════════════════════════════════════
// عداد الزوار الحقيقي — مخزّن في Supabase، يتحدّث كل 30 ثانية
// ══════════════════════════════════════════════════════════
// ─ المطلوب في Supabase (مرة واحدة فقط) ────────────────
// CREATE TABLE site_stats (
//   id TEXT PRIMARY KEY,
//   visit_count BIGINT DEFAULT 0
// );
// INSERT INTO site_stats (id, visit_count) VALUES ('global', 0);
// ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "allow_read"   ON site_stats FOR SELECT USING (true);
// CREATE POLICY "allow_update" ON site_stats FOR UPDATE USING (true);
// ───────────────────────────────────────────────────────

function toArNums(n){ return n.toString().replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]); }

// أنيميشن "slot machine" — يعرض أرقاماً عشوائية متسارعة ثم يستقر على الرقم الحقيقي
var _slotInterval = null;
function _startSlotAnimation() {
  var el2 = document.getElementById('auth-visit-count');
  if (!el2) return;
  var frames = 0;
  var maxFrames = 28; // ~0.9 ثانية بسرعة 32ms
  _slotInterval = setInterval(function() {
    // أرقام عشوائية تبدو منطقية (نطاق واسع قليلاً)
    var fake = Math.floor(800 + Math.random() * 4200);
    el2.textContent = toArNums(fake);
    frames++;
    if (frames >= maxFrames) {
      clearInterval(_slotInterval);
      _slotInterval = null;
      // أبقِ آخر رقم عشوائي حتى يصل الحقيقي
    }
  }, 32);
}

// تحديث كل عناصر عرض العداد في الصفحة (مع إيقاف الأنيميشن إن كانت شغّالة)
function _setAllCounters(val) {
  if (_slotInterval) { clearInterval(_slotInterval); _slotInterval = null; }
  var txt = toArNums(val);
  var el1 = document.getElementById('visit-count');
  var el2 = document.getElementById('auth-visit-count');
  if (el1) el1.textContent = txt;
  if (el2) {
    // أنيميشن "count-up" بسيط من الرقم الحالي إلى الرقم الحقيقي
    var current = parseInt(el2.textContent.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))) || 0;
    var target = val;
    var steps = 18;
    var step = 0;
    var diff = target - current;
    var cu = setInterval(function() {
      step++;
      var ease = 1 - Math.pow(1 - step / steps, 3); // ease-out cubic
      el2.textContent = toArNums(Math.round(current + diff * ease));
      if (step >= steps) { clearInterval(cu); el2.textContent = toArNums(target); }
    }, 30);
  }
}

// قراءة العدد فقط وتحديث الـ UI
async function _fetchAndShowCount() {
  try {
    var r = await _db.from('site_stats').select('visit_count').eq('id','global').single();
    if (r.data) _setAllCounters(r.data.visit_count || 0);
  } catch(e) {}
}

// زيادة العداد + عرضه (يُستدعى مرة واحدة في أول زيارة بالجلسة)
async function _incrementAndShowCount() {
  try {
    var r = await _db.from('site_stats').select('visit_count').eq('id','global').single();
    if (r.data) {
      var newCount = (r.data.visit_count || 0) + 1;
      await _db.from('site_stats').update({ visit_count: newCount }).eq('id','global');
      _setAllCounters(newCount);
      try { sessionStorage.setItem('bayyin-session-counted','1'); } catch(e) {}
    }
  } catch(e) {
    // fallback محلي إذا فشل Supabase
    try {
      var visits = parseInt(localStorage.getItem('bayyin-vc')||'0',10);
      if(!sessionStorage.getItem('bayyin-session-counted')){
        visits++; localStorage.setItem('bayyin-vc', visits);
        sessionStorage.setItem('bayyin-session-counted','1');
      }
      _setAllCounters(visits);
    } catch(e2){}
  }
}

// تهيئة العداد
async function initVisitorCounter() {
  var alreadyCounted = false;
  try { alreadyCounted = !!sessionStorage.getItem('bayyin-session-counted'); } catch(e){}

  if (!alreadyCounted) {
    await _incrementAndShowCount();
  } else {
    await _fetchAndShowCount();
  }

  // تحديث تلقائي كل 30 ثانية لعرض آخر عدد للزوار
  setInterval(_fetchAndShowCount, 30000);
}

// تشغيل العداد بعد ثانية من تحميل الصفحة (بعد تهيّؤ _db)
document.addEventListener('DOMContentLoaded', function(){
  // ابدأ أنيميشن الأرقام العشوائية فوراً
  setTimeout(_startSlotAnimation, 300);
  // ثم اجلب الرقم الحقيقي وأوقف الأنيميشن
  setTimeout(initVisitorCounter, 1200);
});

// ══════════════════════════════════════════════════════════
// عرض مدة الاشتراك المتبقية في الـ topbar
// ══════════════════════════════════════════════════════════
async function _showSubscriptionDays() {
  try {
    var userResp = await _db.auth.getUser();
    var user = userResp && userResp.data && userResp.data.user;
    if (!user) return;

    var resp = await _db.from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .single();

    var data = resp && resp.data;
    if (!data || resp.error) return;

    var badge = document.getElementById('sub-badge');
    if (!badge) return;

    if (data.subscription_status === 'active') {
      badge.className = 'sub-ok';
      badge.textContent = '✅ اشتراك نشط';
      badge.style.display = 'inline-flex';
    } else {
      badge.className = 'sub-expire';
      badge.textContent = '⚠️ الاشتراك منتهٍ';
      badge.style.display = 'inline-flex';
    }
  } catch(e) {
    console.log('subscription display error:', e);
  }
}
function switchGrade(g) {
  if (window._stopNatureSound) window._stopNatureSound();
  [5,6,7,8,9].forEach(n => {
    const tab = document.getElementById('tab-'+n);
    const panel = document.getElementById('panel-'+n);
    if(tab) tab.classList.toggle('active', n===g);
    if(panel) panel.style.display = n===g ? 'block' : 'none';
  });
  document.querySelectorAll('.sims-wrap').forEach(function(el) { el.classList.remove('show'); });
  document.querySelectorAll('.unit-card').forEach(function(c) { c.classList.remove('active-unit'); });
  // Force scroll reset by briefly hiding the container
  var ca = document.getElementById('content-area');
  if(ca) {
    ca.scrollTop = 0;
    // Move the active panel to the top of content-area DOM order
    var activePanel = document.getElementById('panel-'+g);
    if(activePanel && ca.firstElementChild !== activePanel) {
      ca.insertBefore(activePanel, ca.firstElementChild);
    }
    ca.scrollTop = 0;
  }
  // When switching to grade 9, init subject tabs
  if(g === 9) {
    switchG9Subject(window._g9ActiveSubject || 'chem');
  }
}

function switchG9Subject(subject) {
  window._g9ActiveSubject = subject;
  // Toggle subject panels
  ['chem','phys','bio'].forEach(function(s) {
    var panel = document.getElementById('g9-' + s);
    if(panel) panel.style.display = s === subject ? 'block' : 'none';
    var tab = document.getElementById('g9-tab-' + s);
    if(tab) tab.classList.toggle('g9-active', s === subject);
  });
}
function setMobTab(g) {
  [5,7,8,9].forEach(n => {
    const el = document.getElementById('mob-'+n);
    if(el) el.classList.toggle('active', n===g);
  });
  document.getElementById('mob-home').classList.remove('active');
}
function toggleAnswer(btn) {
  const panel = btn.nextElementSibling;
  const open = panel.classList.toggle('show');
  btn.innerHTML = open ? '🔼 إخفاء الإجابة' : '💡 أظهر الإجابة';
  if(open){ var msgs=['تأكّد أنك فهمت السبب وليس فقط الإجابة! 🧠','حاول تشرح الإجابة بكلامك أنت 📝','ممتاز أنك تراجع! المراجعة أهم خطوة 👍']; buddySay(msgs[Math.floor(Math.random()*msgs.length)], 4500); }
}

function openUnit(id, el) {
  var target = document.getElementById('sims-' + id);
  if (!target) return;
  var panel = target.closest('.main-content');
  if (panel) {
    panel.querySelectorAll('.sims-wrap').forEach(function(s) { s.classList.remove('show'); });
    panel.querySelectorAll('.unit-card').forEach(function(c) { c.classList.remove('active-unit'); });
  }
  if (el) el.classList.add('active-unit');
  target.classList.add('show');
  setTimeout(function() { target.scrollIntoView({behavior:'smooth', block:'start'}); }, 50);
  // Buddy hints
  var hints = {
    u5light:'وحدة الضوء 💡 — الضوء ينتقل في خطوط مستقيمة! جرّب المرايا وشاهد انعكاس الأشعة.',
    u5shadow:'وحدة الظلال 🌑 — حرّك الضوء وغيّر حجم الظل! ما العوامل التي تؤثر فيه؟',
    u5earth:'وحدة الأرض 🌍 — الأرض تدور حول نفسها وحول الشمس! اكتشف سبب الليل والنهار والفصول.',
    u5light:'وحدة الضوء 💡 — هل تعلم أن الضوء ينتقل في خطوط مستقيمة؟ استكشف المرايا والانعكاس!',
    u5shadow:'وحدة الظلال 🌑 — الظل يتكوّن لأن الضوء لا يستطيع المرور عبر الأجسام المعتمة! جرّب الآن.',
    u5earth:'وحدة حركات الأرض 🌍 — الأرض تدور حول محورها كل ٢٤ ساعة! هذا ما يُسبّب الليل والنهار.',
    u6f:'وحدة القوى 🏋️ — الدفع والسحب والاحتكاك في كل مكان!',
    u6e:'وحدة الكهرباء ⚡ — المعادن توصّل والبلاستيك يعزل. ابنِ دائرتك!',
    u7:'وحدة البيئة 🌿 — لاحظ كيف تتكيّف الكائنات الحية مع بيئتها!',
    u8:'وحدة المادّة ⚗️ — هل تعلم أن الفلزّات تُوصل الكهرباء؟ جرّبها!',
    u9:'وحدة القوى 🪂 — المظلة تُبطّئ السقوط بزيادة مقاومة الهواء. جرّب!',
    u10:'وحدة التصنيف 🌸 — قِس الزهور وارسم مخطط التوزيع التكراري.',
    u11:'وحدة الأحماض 🍋 — الليمون حمضي والصابون قلويّ! اختبرهما.',
    u8mag:'وحدة المغناطيسية 🧲 — القطبان المختلفان يتجاذبان! جرّب الكهرومغناطيس.',
    u8circ:'وحدة الجهاز الدوري ❤️ — قلبك ينبض ٧٠ مرة في الدقيقة! اكتشف كيف يضخّ الدم.',
    u8salts:'وحدة الأملاح 🧂 — ملح الطعام ليس الملح الوحيد! اكتشف عشرات الأملاح وكيف تُصنَع.',
    u8sound:'وحدة الصوت 🔊 — الصوت اهتزاز ينتقل عبر الهواء! غيّر شدته وحدّته وشاهد موجته.',
    u8repro:'وحدة التكاثر 🧬 — بدأت من خلية واحدة! اكتشف رحلة الجنين من الإخصاب حتى الولادة.',
    g9chem6:'الوحدة السادسة ⚗️ — الأحماض والقواعد في كل مكان! اختر الاستقصاء الذي تريده.',
    g9chem7:'الوحدة السابعة ⚖️ — المعادلات الكيميائية تُخبرك بكل شيء عن التفاعل! وازنها واكتشف رموز الحالة.',
    g9chem8:'الوحدة الثامنة 🧂 — الأملاح تتكوّن من أحماض وقواعد. من NaCl إلى CuSO₄ — اكتشف كيف!',
    g9chem9:'الوحدة التاسعة 🔬 — التحليل الكيميائي يكشف أسرار المواد المجهولة!',
    g9chem10:'الوحدة العاشرة 🌍 — الأرض تحت المجهر! استكشف الهواء والتلوّث والمناخ والحجر الجيري.'
  };
  if(hints[id]) setTimeout(function(){ buddySay(hints[id], 6000); }, 400);
}
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ===== SIM ENGINE =====
let currentSim = null, animFrame = null, simState = {}, currentTab = 0;

const SIM_META = {
  // ── الصف الخامس — الوحدة ٤: الطريقة التي نرى بها الأشياء ──
  g5lighttravel: { title: '١-٤ · انتقال الضوء من مصدر', badge: '💡 5', tabs: ['مختبر الضوء 🔦', 'كيف نرى؟ 👁️'] },
  g5mirror:      { title: '٢-٤ · المرايا', badge: '🪞 5', tabs: ['المرآة المستوية 🪞', 'المقعّرة والمحدّبة 🔍'] },
  g5behindyou:   { title: '٣-٤ · رؤية ما خلفك', badge: '🔍 5', tabs: ['مرايا متعددة 🔄'] },
  g5reflection:  { title: '٤-٤ · الأسطح العاكسة', badge: '✨ 5', tabs: ['مقارنة الأسطح 🔬', 'قياس الانعكاس 📊'] },
  g5lightdir:    { title: '٥-٤ · تغيير اتجاه الضوء', badge: '🔦 5', tabs: ['هندسة الضوء 🎯'] },
  // ── الصف الخامس — الوحدة ٥: الظلال ──
  g5shadowsize:  { title: '١-٥ · كيف يتشكّل الظل', badge: '🌑 5', tabs: ['مختبر الظلال 🕯️', 'استقصاء الظل 📐'] },
  g5transparent: { title: '٢-٥ · المواد والضوء', badge: '🔬 5', tabs: ['اختبار المواد 🧪'] },
  g5silhouette:  { title: '٣-٥ · الصور الظلية', badge: '🎭 5', tabs: ['فنّان الظلال 🎨'] },
  g5shadowfactor:{ title: '٤-٥ · ما الذي يؤثر على حجم الظل؟', badge: '📐 5', tabs: ['المسافة والزاوية 📏', 'حجم الجسم 🔎'] },
  g5lightintensity:{ title: '٦-٥ · قياس شدة الضوء', badge: '☀️ 5', tabs: ['مقياس الإضاءة 📊'] },
  // ── الصف الخامس — الوحدة ٦: حركات الأرض ──
  g5earthsun:    { title: '١-٦ · الشمس والأرض والقمر', badge: '🌍 5', tabs: ['النظام الشمسي 🌞', 'مسارات الكواكب 🔄'] },
  g5rotation:    { title: '٣-٦ · دوران الأرض', badge: '🔄 5', tabs: ['الليل والنهار 🌓', 'الفصول الأربعة 🍂'] },
  g5stars:       { title: '٧-٦ · استكشاف النجوم', badge: '⭐ 5', tabs: ['خريطة السماء 🗺️', 'أسماء النجوم ✨'] },
  adaptation: { title: 'نشاط 1-7 · التكيُّف', badge: '7-1', tabs: ['الثعلب الرملي 🦊', 'الجمل 🐪', 'نبات الصبّار 🌵'] },
  foodchain:  { title: 'نشاط 2-7 · السلاسل الغذائية', badge: '7-2', tabs: ['ارسم السلسلة 🔗', 'انتقال الطاقة ⚡'] },
  foodweb:    { title: 'نشاط 3-7 · الشبكات الغذائية', badge: '7-3', tabs: ['الشبكة الغذائية 🕸️'] },
  decomposer: { title: 'نشاط 4-7 · الكائنات المُحلِّلة', badge: '7-4', tabs: ['مراقبة التحلُّل 🍊'] },
  human:      { title: 'نشاط 5-7 · الإنسان والسلاسل الغذائية', badge: '7-5', tabs: ['صيد الأسماك 🎣', 'الزراعة والأشجار 🌾'] },
  pollution:  { title: 'نشاط 6-7 · التلوُّث', badge: '7-6', tabs: ['تلوث الماء 💧', 'تلوث الهواء 🌫️'] },
  ozone:      { title: 'نشاط 7-7 · تآكل طبقة الأوزون', badge: '7-7', tabs: ['ثقب الأوزون 🌐'] },
  conservation:{ title: 'نشاط 8-7 · الحفاظ على البيئة', badge: '7-8', tabs: ['تصميم المحمية 🌿'] },
  // Unit 8
  metals:      { title: 'نشاط 1-8 · الفلزّات', badge: '8-1', tabs: ['خصائص الفلزّات ⚙️', 'مختبر الاختبار 🔬'] },
  nonmetals:   { title: 'نشاط 2-8 · اللافلزّات', badge: '8-2', tabs: ['خصائص اللافلزّات 🫧', 'بحث اللافلزّ 🔍'] },
  metalcompare:{ title: 'نشاط 3-8 · المقارنة', badge: '8-3', tabs: ['جدول المقارنة ⚖️', 'استقصاء المواد 🔬'] },
  materials:   { title: 'نشاط 4-8 · المواد في حياتنا', badge: '8-4', tabs: ['خصائص المواد 🏠', 'الزجاج والبلاستيك 🔍'] },
  // Unit 9
  // الصف السادس
  g6forces1:   { title: 'درس ٢ · أنواع القوى', badge: '6', tabs: ['أنواع القوى 💪'] },
  g6forces2:   { title: 'درس ١ · سهام القوة', badge: '6', tabs: ['سهام القوة 🏹'] },
  g6gravity:   { title: 'درس ٣ · الكتلة والوزن', badge: '6', tabs: ['الكتلة والوزن 🌍'] },
  g6airresist: { title: 'درس ٤ · مقاومة الهواء', badge: '6', tabs: ['السقوط الحر 🪂', 'القوى المتوازنة ⚡'] },
  g6friction:  { title: 'درس ٥ · الاحتكاك', badge: '6', tabs: ['قوة الاحتكاك 🔥', 'العوامل المؤثرة 🔬'] },
  // وحدة الكهرباء — الصف السادس
  g6conductors:     { title: '5-1 · ما المواد الموصِّلة للكهرباء؟', badge: '⚡ 6', tabs: ['مختبر الاختبار 🔬', 'جدول النتائج 📋'] },
  g6waterconductor: { title: '5-2 · هل الماء يوصِّل الكهرباء؟', badge: '⚡ 6', tabs: ['اسحب الملعقة وجرّب! 💧🧂'] },
  g6metalconductor: { title: '5-3 · المعادن والكهرباء', badge: '⚡ 6', tabs: ['قياس التيار بالأميتر ⚡', 'مقارنة المعادن 🔩'] },
  g6circuit:        { title: '5-5 · مختبر الدوائر الكهربائية', badge: '⚡ 6', tabs: ['ابنِ دائرتك 🔌', 'رموز الدائرة 📐'] },
  g6circuitchange:  { title: '5-6 · تغيير مكونات الدائرة', badge: '⚡ 6', tabs: ['إضافة مصابيح 💡', 'إضافة خلايا 🔋'] },
  g6wirelength:     { title: '5-8 · طول وسُمك السلك', badge: '⚡ 6', tabs: ['طول السلك 📏', 'سُمك السلك 🔗'] },
  // ── الصف 8 — الجهاز الدوري وتبادل الغازات ──
  circsystem:   { title: 'نشاط 1-7 · الجهاز الدوري للإنسان', badge: '❤️ 8', tabs: ['رحلة الدم 🩸', 'الدم المؤكسج وغير المؤكسج 🔄'] },
  heart8:       { title: 'نشاط 2-7 · القلب', badge: '❤️ 8', tabs: ['حجرات القلب 🫀', 'الانقباض والانبساط ⚡'] },
  blood8:       { title: 'نشاط 3-7 · الدم', badge: '🩸 8', tabs: ['تحت المجهر 🔬', 'وظائف مكونات الدم 📋'] },
  vessels8:     { title: 'نشاط 4-7 · الأوعية الدموية', badge: '❤️ 8', tabs: ['الشرايين 🔴', 'الأوردة 🔵', 'الشعيرات الدموية 🔬'] },
  lungs8:       { title: 'نشاط 5-7 · الجهاز التنفسي', badge: '🫁 8', tabs: ['مسار الهواء 💨', 'قياس حجم الهواء 📏'] },
  gasex8:       { title: 'نشاط 6-7 · تبادل الغازات', badge: '💨 8', tabs: ['الحويصلات الهوائية 🔬', 'لماذا صغيرة جدًا؟ 🧪'] },
  respiration8: { title: 'نشاط 7-7 · التنفس الهوائي', badge: '⚡ 8', tabs: ['معادلة التنفس ⚗️', 'تنفس البازلاء 🌱'] },
  fitness8:     { title: 'نشاط 8-7 · اللياقة البدنية', badge: '🏃 8', tabs: ['معدل النبض 💓', 'التمرين والتعافي 📈'] },
  smoking8:     { title: 'نشاط 9-7 · السجائر والصحة', badge: '🚭 8', tabs: ['مكونات الدخان ☠️', 'الرئة السليمة والمدخّن 🔬'] },
  // ── الصف 8 — المغناطيسيّة والكهرباء ──
  magnets:      { title: 'نشاط 1-11 · المغناطيس وأقطابه', badge: '🧲 8', tabs: ['الجذب والتنافر 🧲', 'المواد المغناطيسية 🔬'] },
  magfield:     { title: 'نشاط 3-11 · المجال المغناطيسيّ', badge: '🧲 8', tabs: ['خطوط المجال 🔮', 'بوصلة تفاعلية 🧭'] },
  electromagnet:{ title: 'نشاط 4-11 · الكهرومغناطيس', badge: '🧲 8', tabs: ['اصنع مغناطيساً ⚡', 'قوة الكهرومغناطيس 💪'] },
  staticelec:   { title: 'نشاط 6-11 · الكهرباء الساكنة', badge: '⚡ 8', tabs: ['شحن الأجسام ⚡', 'التجاذب والتنافر 🔄'] },
  circuit8:     { title: 'نشاط 9-11 · الدائرة الكهربائية', badge: '⚡ 8', tabs: ['دائرة متسلسلة 🔌', 'دائرة متوازية 🔀'] },
  magcompare:   { title: 'نشاط 2-11 · مقارنة أنواع المغناطيس', badge: '🧲 8', tabs: ['قياس القوة 📏', 'اختبار المواد 🔬'] },
  emstronger:   { title: 'نشاط 5-11 · تحسين الكهرومغناطيس', badge: '🧲 8', tabs: ['أثر اللفّات 🔁', 'أثر التيار ⚡'] },
  charges:      { title: 'نشاط 7-11 · الشحنة الموجبة والسالبة', badge: '⚡ 8', tabs: ['قياس الشحنة ⊕', 'تجاذب وتنافر 🔄'] },
  electrons:    { title: 'نشاط 8-11 · حركة الإلكترونات', badge: '⚡ 8', tabs: ['الشحن بالاحتكاك 🔀', 'الإلكترونات داخل الذرة ⚛️'] },
  cellvoltage:  { title: 'نشاط 10-11 · توصيل الخلايا', badge: '⚡ 8', tabs: ['الخلايا على التوالي 🔋', 'الجهد والتيار 📊'] },
  resistance:   { title: 'نشاط 11-11 · المقاومة الكهربائية', badge: '⚡ 8', tabs: ['المقاومة الثابتة 〰️', 'المقاومة المتغيرة 🎛️'] },
  parallel12:   { title: 'نشاط 12-11 · التوصيل على التوازي', badge: '⚡ 8', tabs: ['الدائرة المتوازية 🔀', 'مقارنة التسلسل والتوازي ⚖️'] },
  forces:      { title: 'نشاط 1-9 · القُوى', badge: '9-1', tabs: ['أنواع القوى 💪', 'سهام القوة 🏹', 'محصلة القوى 🏆'] },
  forcemeter:  { title: 'نشاط 2-9 · قياس القوى', badge: '9-2', tabs: ['الميزان الزنبركي ⚖️', 'قياس قوى الدفع 📏'] },
  gravity:     { title: 'نشاط 3-9 · الوزن والجاذبية', badge: '9-3', tabs: ['الكتلة والوزن 🌍', 'الجاذبية على القمر 🌕'] },
  friction:    { title: 'نشاط 4-9 · الاحتكاك', badge: '9-4', tabs: ['قوة الاحتكاك 🔥', 'العوامل المؤثرة 🔬', 'الاحتكاك الجزيئي 🔬'] },
  airresist:   { title: 'نشاط 5-9 · مقاومة الهواء', badge: '9-5', tabs: ['السقوط الحر 🪂', 'القوى المتوازنة ⚡', 'استقصاء المظلة 🔬'] },
  // ── الصف 8 — الأملاح ──
  salts_what:      { title: 'نشاط 1-8 · ما الملح؟', badge: '🧂 8', tabs: ['أنواع الأملاح 🧂', 'الأحماض وتسمية الأملاح 🔬'] },
  salts_metal:     { title: 'نشاط 2-8أ · فلز وحمض', badge: '⚗️ 8', tabs: ['مختبر التفاعل ⚗️', 'تكوين البلورات 🔬'] },
  salts_oxide:     { title: 'نشاط 2-8ب · أكسيد الفلز', badge: '🔬 8', tabs: ['أكسيد النحاس + حمض 🔵', 'الترشيح والتبخير 🫙'] },
  salts_carbonate: { title: 'نشاط 3-8 · كربونات وحمض', badge: '🫧 8', tabs: ['فوران ثاني أكسيد الكربون 🫧', 'كلوريد النحاس الناتج 🟢'] },
  // ── الصف 8 — الصوت ──
  sound_pitch:        { title: 'نشاط 1-9 · شدة وحدة الصوت', badge: '🎵 8', tabs: ['شدة الصوت 🔊', 'حدة الصوت 🎵'] },
  sound_vibration:    { title: 'نشاط 2-9 · الاهتزازات', badge: '〰️ 8', tabs: ['السعة والتردد 〰️', 'دراسة المسطرة 📏'] },
  sound_travel:       { title: 'نشاط 3-9 · انتقال الصوت', badge: '📡 8', tabs: ['الموجة الصوتية 🌊', 'الصوت في الفراغ 🔕'] },
  sound_oscilloscope: { title: 'نشاط 4-9 · رسم الذبذبات', badge: '📊 8', tabs: ['تغيير السعة 🔊', 'تغيير التردد 🎵'] },
  // ── الصف 8 — التكاثر والتطوّر ──
  repro_gametes:      { title: 'نشاط 1-10 · الأمشاج', badge: '🧬 8', tabs: ['البويضة والحيوان المنوي 🔬', 'الكروموسومات 🧬'] },
  repro_fertilisation:{ title: 'نشاط 2-10 · الإخصاب', badge: '❤️ 8', tabs: ['رحلة البويضة 🗺️', 'دورة الطمث 🔄'] },
  repro_development:  { title: 'نشاط 3-10 · نمو الجنين', badge: '🤰 8', tabs: ['مراحل النمو 📅', 'المشيمة والحماية 🛡️'] },
  repro_growth:       { title: 'نشاط 4-10 · النمو والتطوّر', badge: '📈 8', tabs: ['انقسام الخلايا 🔬', 'مراحل الحياة 👶→🧑'] },
  repro_lifestyle:    { title: 'نشاط 5-10 · نمط الحياة', badge: '💊 8', tabs: ['تأثير النيكوتين 🚭', 'الغذاء والنمو 🥗'] },
  // Unit 10
  variation:      { title: 'نشاط 2-10 · التبايُن في النوع', badge: '10-2', tabs: ['مخطط التكرار 📊', 'استقصاء التباين 🔬'] },
  plantclass:     { title: 'نشاط 4-10 · تصنيف النباتات', badge: '10-4', tabs: ['مملكة النباتات 🌿', 'فرز النباتات 🎮'] },
  vertebrates:    { title: 'نشاط 5-10 · تصنيف الفقاريّات', badge: '10-5', tabs: ['الفئات الخمس 🐾', 'تصنيف الحيوان 🎯'] },
  invertebrates:  { title: 'نشاط 6-10 · اللافقاريّات', badge: '10-6', tabs: ['مجموعات اللافقاريات 🦀', 'الحشرات والعناكب 🕷️'] },
  dichotomous:    { title: 'نشاط 7-10 · الأسئلة المفتاحيّة', badge: '10-7', tabs: ['السؤال المفتاحي 🔑', 'بنِ مفتاحك 🛠️'] },
  genetics:       { title: 'نشاط 8-10 · الوراثة', badge: '10-8', tabs: ['الجينات والصفات 🧬', 'انتقال الجينات 👨‍👩‍👧'] },
  // Unit 11
  acidbase:     { title: 'نشاط 1-11 · الأحماض والقلويّات', badge: '11-1', tabs: ['الأحماض 🍋', 'القلويّات 🧼'] },
  indicator:    { title: 'نشاط 2-11 · حمض أم قلويّ؟', badge: '11-2', tabs: ['ورق تبّاع الشمس 📄', 'صنع كاشفك 🌸'] },
  phscale:      { title: 'نشاط 3-11 · مقياس الرقم الهيدروجينيّ', badge: '11-3', tabs: ['مقياس pH 📊', 'اختبر المحاليل 🧪'] },
  neutralisation:{ title: 'نشاط 4-11 · التعادُل', badge: '11-4', tabs: ['تفاعل التعادُل ⚗️', 'السحّاحة 🔬'] },
  neutralapp:   { title: 'نشاط 5-11 · تطبيقات التعادُل', badge: '11-5', tabs: ['الطبّ والأسنان 🦷', 'الزراعة والبحيرات 🌿'] },
  acidinquiry:  { title: 'نشاط 6-11 · استقصاء الأحماض', badge: '11-6', tabs: ['تصميم التجربة 🧠', 'النتائج والاستنتاج 📈'] },
  // ── الصف التاسع — الوحدة ٦: الأحماض والقواعد ──
  g9acidprop:   { title: 'نشاط 6-1 · خصائص الأحماض والقواعد', badge: '⚗️ 9', tabs: ['تصنيف المحاليل 🧪', 'الأحماض العضوية 🍋', 'القواعد والقلويات 🧴'] },
  g9indicator:  { title: 'نشاط 6-2 · الكواشف وتغيُّر اللون', badge: '🌺 9', tabs: ['ورق تبّاع الشمس 📄', 'الكاشف العام 🎨', 'الكاشف الطبيعي 🌸'] },
  g9phscale:    { title: 'نشاط 6-3 · مقياس pH', badge: '📊 9', tabs: ['سلّم pH 0-14 📏', 'اختبر محاليل يومية 🧪', 'التخفيف والتركيز 💧'] },
  g9ions:       { title: 'نشاط 6-4 · أيونات H⁺ و OH⁻', badge: '⚛️ 9', tabs: ['الأيونات في المحاليل 🔬', 'العلاقة بين H⁺ و pH 📈'] },
  g9oxides:     { title: 'نشاط 6-5 · أكاسيد الفلزات واللافلزات', badge: '🔬 9', tabs: ['الأكاسيد الحمضية ⚗️', 'الأكاسيد القاعدية 🧱', 'الأكاسيد المتذبذبة 🔄'] },
  // ── الصف التاسع — الوحدة ٧: معادلات التفاعلات الكيميائية ──
  g9wordeq:   { title: 'نشاط 7-1 · المعادلات اللفظية', badge: '📝 9', tabs: ['كتابة المعادلة اللفظية 📝', 'المواد المتفاعلة والناتجة ⚗️', 'تجربة: احتراق الماغنيسيوم 🔥'] },
  g9balance:  { title: 'نشاط 7-2 · موازنة المعادلات الرمزية', badge: '⚖️ 9', tabs: ['حفظ المادة ⚖️', 'خطوات الموازنة 🔢', 'تجربة: الهيدروجين والأكسجين 💧'] },
  g9statesym: { title: 'نشاط 7-3 · رموز الحالة الفيزيائية', badge: '🏷️ 9', tabs: ['رموز الحالة (s)(l)(g)(aq) 🏷️', 'تفاعل البوتاسيوم مع الماء 💥', 'المعادلات الأيونية 🔋'] },
  // ── الصف التاسع — الوحدة ٨: تكوين الأملاح ──
  g9saltacid:  { title: 'نشاط 8-1 · الأحماض مع القواعد والأكاسيد', badge: '🧪 9', tabs: ['حمض + قاعدة (تعادل) 🧪', 'حمض + أكسيد فلزي 🔥', 'تكوين الأملاح المختلفة 🏆'] },
  g9saltmetal: { title: 'نشاط 8-2 · الأحماض مع الفلزات والكربونات', badge: '⚗️ 9', tabs: ['حمض + فلز نشيط 💥', 'حمض + كربونات 🌬️', 'تفاعل الكربونات مع HCl ⚗️'] },
  g9saltmake:  { title: 'نشاط 8-3 · تحضير الأملاح الذائبة', badge: '🔬 9', tabs: ['الطريقة أ: فلز + حمض 🔬', 'التبخير والتبلور 💎', 'تحضير CuSO₄ مخبرياً 🧫'] },
  g9salttitra: { title: 'نشاط 8-4 · المعايرة وتحضير الأملاح غير الذائبة', badge: '🌡️ 9', tabs: ['المعايرة (Titration) 🌡️', 'الترسيب (Precipitation) 🧊', 'اختر طريقة التحضير المناسبة 🎯'] },
  // ── الصف التاسع — الوحدة ٩: التحليل الكيميائي ──
  g9watergas:  { title: 'نشاط 9-1 · الكشف عن الماء والغازات', badge: '💧 9', tabs: ['الكشف عن الماء 💧', 'الكشف عن الغازات O₂ و H₂ 🔥', 'الكشف عن NH₃ و CO₂ و Cl₂ 🌬️'] },
  g9flametest: { title: 'نشاط 9-2 · اختبار اللهب', badge: '🔥 9', tabs: ['ألوان اللهب 🔥', 'حدِّد الكاتيون المجهول 🔍', 'نشاط: تجربة اللهب 🧪'] },
  g9cationppt: { title: 'نشاط 9-3 · ترسيب الكاتيونات', badge: '🧪 9', tabs: ['هيدروكسيد الصوديوم NaOH ⚗️', 'محلول الأمونيا NH₃ 💨', 'نشاط: حدِّد الكاتيون 🔬'] },
  g9aniontest: { title: 'نشاط 9-4 · اختبار الأنيونات', badge: '⚗️ 9', tabs: ['Cl⁻ و Br⁻ بنترات الفضة 🥈', 'SO₄²⁻ بكلوريد الباريوم ⚪', 'CO₃²⁻ و NO₃⁻ 🌬️'] },
  g9chemlab:   { title: 'نشاط 9-5 · مختبر التحليل المتكامل', badge: '🔬 9', tabs: ['تحديد الكاتيون 🔍', 'تحديد الأنيون 🔍', 'مادة مجهولة كاملة 🧩'] },
  // ── الصف التاسع — الوحدة ١٠: الأرض والغلاف الجوّي ──
  g9aircomp:    { title: 'نشاط 10-1 · مكوّنات الهواء والغازات النبيلة', badge: '🌬️ 9', tabs: ['تركيب الغلاف الجوّي 📊', 'الغازات النبيلة واستخداماتها 💡', 'مقارنة غازات الهواء 🔬'] },
  g9combustion: { title: 'نشاط 10-2 · الاحتراق الكامل وغير الكامل', badge: '🔥 9', tabs: ['احتراق الميثان الكامل 🔥', 'الاحتراق غير الكامل ⚠️', 'مقارنة المنتجات وتأثيرها 📊'] },
  g9acidrain:   { title: 'نشاط 10-3 · المطر الحمضي وتأثيره', badge: '🌧️ 9', tabs: ['تكوُّن غازات المطر الحمضي ⚗️', 'تأثير المطر الحمضي على البيئة 🌿', 'حلول الحدّ من التلوّث 🛡️'] },
  g9greenhouse: { title: 'نشاط 10-4 · تأثير الدفيئة والاحترار العالمي', badge: '🌡️ 9', tabs: ['آلية تأثير الدفيئة 🌍', 'غازات الدفيئة ومصادرها 🏭', 'التغيُّرات المناخية وحلولها ♻️'] },
  g9limestone:  { title: 'نشاط 10-5 · الحجر الجيري والتفكك الحراري', badge: '🪨 9', tabs: ['التفكك الحراري لـ CaCO₃ 🔥', 'الجير الحيّ ومنتجاته 🏗️', 'معالجة التربة الحمضية 🌱'] }
};

// ===== UNIT 7 END-OF-UNIT QUIZ =====


// ══ نظام أسئلة الاستنتاج ══
const SIM_QUESTIONS = {
  forces: {
    q: 'ماذا يحدث للجسم عندما تكون القوى المؤثرة عليه متوازنة؟',
    opts: ['يتسارع للأمام','يبقى ساكناً أو يتحرك بسرعة ثابتة','يتباطأ دائماً','لا شيء مما سبق'],
    ans: 1,
    fb: '✅ عندما تتوازن القوى تكون المحصلة صفراً، فيبقى الجسم ساكناً أو يستمر في حركته بسرعة منتظمة (قانون نيوتن الأول).'
  },
  forcemeter: {
    q: 'كيف يختلف وزن الجسم على القمر مقارنةً بالأرض؟',
    opts: ['يزيد بمقدار 6 أضعاف','يقل إلى حوالي ⅙ وزنه على الأرض','يبقى كما هو','يصبح صفراً'],
    ans: 1,
    fb: '✅ الوزن = الكتلة × التسارع الجاذبي. لأن جاذبية القمر ≈ 1.6 m/s² (⅙ الأرض)، يكون الوزن أقل بكثير. لكن الكتلة لا تتغير!'
  },
  gravity: {
    q: 'ما العلاقة بين كتلة الجسم وسرعة سقوطه في فراغ بلا هواء؟',
    opts: ['الأثقل يسقط أسرع','الأخف يسقط أسرع','جميع الأجسام تسقط بنفس السرعة','يعتمد على الشكل'],
    ans: 2,
    fb: '✅ في الفراغ، جميع الأجسام تسقط بنفس التسارع (g) بغض النظر عن كتلتها. هذا ما أثبته غاليليو وأكده نيوتن!'
  },
  friction: {
    q: 'على أي سطح تتحرك الأجسام بأبطأ؟',
    opts: ['الجليد','الزجاج الناعم','السطح الخشن','البلاط الأملس'],
    ans: 2,
    fb: '✅ السطح الخشن يولّد أكبر قوة احتكاك (μ عالي)، مما يبطئ الجسم ويوقفه بسرعة أكبر.'
  },
  airresist: {
    q: 'لماذا تسقط الريشة أبطأ من الحجر في الهواء؟',
    opts: ['لأنها أخف وزناً','لأن الهواء يدفعها للأعلى','لأن مقاومة الهواء أكبر نسبةً لوزنها','لأن شكلها دائري'],
    ans: 2,
    fb: '✅ مقاومة الهواء تعتمد على المساحة والشكل. الريشة لها مساحة كبيرة نسبةً لوزنها، فتكون نسبة الاحتكاك/الوزن عالية جداً فتسقط بطيئاً.'
  },
  // Unit 10
  variation: {
    q: 'ما الذي يُعرَّف باسم التبايُن Variation؟',
    opts: ['تغيُّر لون الحيوان عند الخطر','الاختلافات بين أفراد النوع الواحد','انتقال الصفات من الآباء','تصنيف الكائنات لمجموعات'],
    ans: 1,
    fb: '✅ التبايُن هو الاختلافات بين الأفراد المنتمين إلى نفس النوع — مثل اختلاف طول البشر أو لون أعينهم رغم أنهم نفس النوع.'
  },
  plantclass: {
    q: 'أيّ مجموعة من مجموعات النباتات تُنتج بذوراً داخل أزهار؟',
    opts: ['الحزازيّات','السرخسيّات','المخروطيّات','النباتات الزهريّة'],
    ans: 3,
    fb: '✅ النباتات الزهريّة تُنتج بذوراً داخل الأزهار التي تتطوّر لتصبح ثماراً. هي أكثر مجموعات النباتات تنوعاً على الأرض.'
  },
  vertebrates: {
    q: 'ما الفئة التي تجمع بين التنفس بالخياشيم والأرجل الأربعة في مرحلة البلوغ؟',
    opts: ['الأسماك','البرمائيّات','الزواحف','الطيور'],
    ans: 1,
    fb: '✅ البرمائيّات (كالضفادع) تتنفس بالخياشيم حين تكون صغاراً في الماء، ثم تنمو لها أربعة أرجل وتعيش على اليابسة في مرحلة البلوغ.'
  },
  invertebrates: {
    q: 'ما الذي يميّز مفصليّات الأرجل عن باقي اللافقاريّات؟',
    opts: ['لها جسم رخو بلا قشرة','لها هيكل خارجي صلب وأرجل مفصليّة','لها جسم مقسَّم إلى حلقات فقط','تعيش في الماء حصراً'],
    ans: 1,
    fb: '✅ مفصليّات الأرجل تتميز بالهيكل الخارجي Exoskeleton وأرجلها المفصليّة. تشمل الحشرات والعناكب والقشريّات وكثيرات الأرجل.'
  },
  dichotomous: {
    q: 'كيف يعمل السؤال المفتاحي Dichotomous Key؟',
    opts: ['يصف الكائن بجملة واحدة','يطرح سلسلة أسئلة بإجابتين فقط حتى تعرف اسم الكائن','يُقارن كائنين مختلفين','يرتّب الكائنات حسب حجمها'],
    ans: 1,
    fb: '✅ السؤال المفتاحي هو سلسلة أسئلة ثنائية (نعم/لا) — كل إجابة تقودك لسؤال تالٍ حتى تصل لاسم الكائن الحيّ.'
  },
  genetics: {
    q: 'من أين يحصل كل فرد على جيناته؟',
    opts: ['من الأم فقط','من الأب فقط','نصف من كل والد','من البيئة المحيطة'],
    ans: 2,
    fb: '✅ يرث كل فرد نصف جيناته من الأب ونصفها من الأم. لذلك يتشابه الأبناء مع والديهم لكنهم ليسوا نسخة مطابقة لأيّ منهما.'
  },
  acidbase: {
    q: 'ما الذي يُميّز الحمضَ من بقية المواد؟',
    opts: ['يجعل المادة لزجة','يعطي المادة طعماً حامضاً وهو مُؤكِّل','يجعل الكاشف أخضر اللون','لا يتفاعل مع أي مادة'],
    ans: 1,
    fb: '✅ الأحماض تُعطي طعماً حامضاً وهي مُؤكِّلة (Corrosive) أي تتلف الجلد والمعادن. بعض الأحماض آمن كعصير الليمون، وبعضها خطير كحمض الكبريتيك.'
  },
  indicator: {
    q: 'ما لون ورق تبّاع الشمس في المحلول القلويّ؟',
    opts: ['أحمر','أصفر','أزرق','أخضر'],
    ans: 2,
    fb: '✅ يتحوّل ورق تبّاع الشمس إلى اللون الأزرق في القلويّات، وإلى اللون الأحمر في الأحماض، ويبقى بنفسجياً في المواد المتعادلة.'
  },
  phscale: {
    q: 'ما الرقم الهيدروجينيّ (pH) لمحلول متعادل؟',
    opts: ['صفر','7','14','3'],
    ans: 1,
    fb: '✅ المحلول المتعادل رقمه الهيدروجيني (pH) = 7. الأحماض أقل من 7 والقلويات أكبر من 7. كلما ابتعد الرقم عن 7 كان المحلول أقوى.'
  },
  neutralisation: {
    q: 'ماذا يحدث عند خلط حمض مع قلويّ بالكميّة المناسبة؟',
    opts: ['ينفجر المحلول','يتكوّن محلول متعادل','يصبح حمضاً أقوى','لا يحدث شيء'],
    ans: 1,
    fb: '✅ عند خلط الحمض مع القلويّ بالكميّة الصحيحة يتكوّن محلول متعادل. هذا يُسمّى تفاعل التعادُل (Neutralisation)، ويُنتج ماءً وملحاً.'
  },
  neutralapp: {
    q: 'لماذا يكون معجون الأسنان قلويّاً؟',
    opts: ['لإعطاء طعم حلو','لمعادلة حمض الفم الذي تنتجه البكتيريا','لتبييض الأسنان فقط','لأنه مصنوع من الملح'],
    ans: 1,
    fb: '✅ البكتيريا في الفم تتغذّى على بقايا الطعام وتُنتج حمضاً يُتلف الأسنان. معجون الأسنان القلويّ يُعادل هذا الحمض ويحمي الأسنان من التسوّس.'
  },
  acidinquiry: {
    q: 'في تجربة عادلة لمقارنة مساحيق، ما الذي يجب أن يظلّ ثابتاً؟',
    opts: ['نوع المسحوق فقط','حجم الحمض ودرجة حرارته وتركيزه','اسم الطالب الذي يُجري التجربة','لا شيء يجب أن يثبت'],
    ans: 1,
    fb: '✅ في التجربة العادلة (Fair Test) يجب تغيير متغيّر واحد فقط (نوع المسحوق) وتثبيت جميع المتغيّرات الأخرى (حجم الحمض، تركيزه، درجة حرارته) لضمان مقارنة صادقة.'
  },
  // وحدة الكهرباء — الصف السادس
  g6conductors: {
    q: 'أيّ المواد تُصنَّف كمادة موصِّلة للكهرباء؟',
    opts: ['الخشب والبلاستيك','النحاس والحديد والألومنيوم','الزجاج والمطاط','الورق والقماش'],
    ans: 1,
    fb: '✅ المعادن كالنحاس والحديد والألومنيوم مواد موصِّلة تسمح بمرور الكهرباء. أما البلاستيك والخشب والزجاج والمطاط فهي مواد عازلة تمنع مرور الكهرباء.'
  },
  g6waterconductor: {
    q: 'لماذا يُعدّ الماء المالح أفضل موصِّلاً للكهرباء من الماء المقطَّر؟',
    opts: ['لأنه أثقل من الماء النقي','لأنه يحتوي على أملاح مذابة تسمح بمرور الكهرباء','لأن درجة حرارته أعلى','لأنه مصنوع من جزيئات مختلفة'],
    ans: 1,
    fb: '✅ الأملاح المذابة في الماء تتفكك إلى أيونات موجبة وسالبة، وهذه الأيونات هي التي تحمل الشحنة الكهربائية وتسمح بمرور التيار.'
  },
  g6metalconductor: {
    q: 'لماذا تُستخدم الأسلاك الكهربائية من النحاس وليس الحديد؟',
    opts: ['لأن النحاس أخف وزناً','لأن النحاس أفضل موصِّل وأرخص من الفضة ومرن سهل السحب','لأن الحديد لا يوصِّل الكهرباء','لأن النحاس لا يسخن أبداً'],
    ans: 1,
    fb: '✅ النحاس موصِّل ممتاز (مقاومته 0.017 Ω·mm²/m) وأرخص من الفضة، وهو مرن وسهل السحب في أسلاك رفيعة — لذلك هو الخيار الأمثل للأسلاك الكهربائية.'
  },
  g6circuit: {
    q: 'ما الشرط الأساسي لإضاءة المصباح في الدائرة الكهربائية؟',
    opts: ['أن يكون المصباح جديداً','أن تكون الدائرة مغلقة (مسار كامل للكهرباء)','أن يكون هناك أكثر من خلية','أن يكون السلك طويلاً'],
    ans: 1,
    fb: '✅ الدائرة الكهربائية تحتاج إلى مسار مغلق ومتصل من بداية البطارية حتى نهايتها. أي انقطاع في المسار (مثل مفتاح مفتوح) يوقف التيار ويُطفئ المصباح.'
  },
  g6circuitchange: {
    q: 'ماذا يحدث لسطوع المصابيح عند إضافة مصباح جديد في دائرة على التوالي؟',
    opts: ['يزيد السطوع','يبقى السطوع نفسه','يقل السطوع','يتوقف المصباح عن الإضاءة تماماً'],
    ans: 2,
    fb: '✅ في الدائرة على التوالي، إضافة مصباح جديد تزيد المقاومة الكلية. وبقانون أوم (I = V/R)، زيادة المقاومة مع ثبات الجهد تعني تقليل التيار وبالتالي يقل سطوع كل مصباح.'
  },
  g6wirelength: {
    q: 'أيّ السلكين له مقاومة أكبر في دائرة كهربائية؟',
    opts: ['السلك الرفيع القصير','السلك الطويل الرفيع','السلك السميك القصير','السلك السميك الطويل'],
    ans: 1,
    fb: '✅ المقاومة تتناسب طردياً مع الطول وعكسياً مع مساحة المقطع. السلك الطويل الرفيع له أكبر مقاومة لأن كلا العاملين (الطول الكبير والسُمك الصغير) يزيدان المقاومة.'
  },
  // ── وحدة 7 ──
  adaptation: {
    q: 'ما الهدف من تكيّف الكائنات الحية مع بيئتها؟',
    opts: ['تغيير شكلها الخارجي فقط','البقاء والتكاثر في بيئتها','الهروب من البيئة','تغيير لون جلدها'],
    ans: 1,
    fb: '✅ التكيّف هو أي صفة تساعد الكائن الحي على البقاء والتكاثر في بيئته — سواء كان جسمياً أو سلوكياً.'
  },
  foodchain: {
    q: 'في سلسلة غذائية، من أين تأتي الطاقة في الأصل؟',
    opts: ['الحيوانات المفترسة','المنتجات (النباتات)','المحللات','المستهلكات'],
    ans: 1,
    fb: '✅ الطاقة تبدأ من الشمس وتلتقطها النباتات (المنتجات) بالبناء الضوئي، ثم تنتقل عبر مستويات السلسلة الغذائية.'
  },
  foodweb: {
    q: 'ماذا يحدث لبقية الكائنات إذا اختفت نوع واحد من الشبكة الغذائية؟',
    opts: ['لا يتأثر شيء','تتأثر بعض الكائنات المرتبطة بها فقط','تتأثر جميع الكائنات في الشبكة','تزيد أعداد الجميع'],
    ans: 2,
    fb: '✅ الشبكة الغذائية مترابطة — اختفاء أي نوع يؤثر على من يأكله ومن يأكل منه، وقد تمتد التأثيرات لكامل الشبكة.'
  },
  decomposer: {
    q: 'ما دور المحللات في النظام البيئي؟',
    opts: ['تصنع غذاءها من الشمس','تأكل الحيوانات الحية فقط','تحلل المواد الميتة وتعيد المعادن للتربة','تحمي النباتات من الأمراض'],
    ans: 2,
    fb: '✅ المحللات (كالبكتيريا والفطريات) تكسر المواد العضوية الميتة وتُعيد العناصر الغذائية للتربة لتستخدمها النباتات من جديد.'
  },
  human: {
    q: 'كيف يؤثر البشر على السلاسل الغذائية؟',
    opts: ['لا يؤثرون أبداً','يزيدون التنوع دائماً','قد يُخلّون التوازن بالصيد الجائر والتلوث','يحمون جميع الأنواع'],
    ans: 2,
    fb: '✅ الأنشطة البشرية كالصيد الجائر وتدمير الموائل والتلوث تؤثر سلباً على التوازن البيئي وقد تُفقد أنواعاً بأكملها.'
  },
  pollution: {
    q: 'ما أفضل طريقة للحد من تلوث الهواء في المدن؟',
    opts: ['زيادة المصانع','استخدام الطاقة المتجددة وتقليل السيارات','إزالة الأشجار','بناء مداخن أعلى'],
    ans: 1,
    fb: '✅ الطاقة المتجددة (الشمس والرياح) والنقل العام يقللان الانبعاثات بشكل كبير. الأشجار تمتص CO₂ أيضاً.'
  },
  ozone: {
    q: 'ما المادة الرئيسية المسؤولة عن تآكل طبقة الأوزون؟',
    opts: ['ثاني أكسيد الكربون CO₂','الأكسجين O₂','مركبات الكلوروفلوروكربون CFC','بخار الماء'],
    ans: 2,
    fb: '✅ مركبات CFC (المستخدمة في المكيفات القديمة والبخاخات) تتحلل وتُطلق الكلور الذي يكسر جزيئات الأوزون.'
  },
  conservation: {
    q: 'ما أهم سبب لانقراض الأنواع الحية حالياً؟',
    opts: ['التطور الطبيعي','فقدان الموئل وتدمير البيئات','ارتفاع الأكسجين','البرودة الشديدة'],
    ans: 1,
    fb: '✅ فقدان الموئل (تدمير الغابات والمستنقعات والشعاب المرجانية) هو السبب الأول لانقراض الأنواع في العصر الحديث.'
  },
  // ── وحدة 8 ──
  metals: {
    q: 'أيّ من الخصائص التالية تميّز الفلزات عن اللافلزات؟',
    opts: ['هشّة وعازلة للكهرباء','لامعة وموصّلة للكهرباء والحرارة','شفافة وخفيفة','لا تتفاعل مع الأحماض'],
    ans: 1,
    fb: '✅ الفلزات لامعة، جيدة التوصيل للكهرباء والحرارة، قابلة للطرق والسحب، وتتفاعل مع الأحماض لإنتاج الهيدروجين.'
  },
  nonmetals: {
    q: 'أيّ من التالي خاصية للافلزات؟',
    opts: ['توصيل الكهرباء جيداً','اللمعان والبريق','الهشاشة وعدم التوصيل','الليونة وقابلية الطرق'],
    ans: 2,
    fb: '✅ معظم اللافلزات هشّة وعازلة للكهرباء والحرارة وليست لامعة — على عكس الفلزات.'
  },
  metalcompare: {
    q: 'لماذا يُستخدم النحاس في الأسلاك الكهربائية أكثر من الفضة؟',
    opts: ['لأن النحاس أفضل في التوصيل','لأن النحاس أرخص وكافٍ لأغراض التوصيل','لأن الفضة سامة','لأن الفضة لا توصّل الكهرباء'],
    ans: 1,
    fb: '✅ الفضة أفضل في التوصيل لكن النحاس أرخص بكثير ويوصّل بكفاءة عالية، مما يجعله الخيار العملي والاقتصادي.'
  },
  materials: {
    q: 'لماذا يُصنع الزجاج من الرمل؟',
    opts: ['لأن الرمل خفيف','لأن الرمل يحتوي على السيليكا التي تصبح شفافة عند الصهر','لأن الرمل موصّل جيد','لأن الرمل مقاوم للماء'],
    ans: 1,
    fb: '✅ الرمل يحتوي على ثاني أكسيد السيليكون (SiO₂) الذي عند صهره وتبريده يُشكّل الزجاج الشفاف الصلب.'
  },
  // ── الصف 6 ──
  g6forces1: {
    q: 'ما نوع القوة التي تُبقي الأجسام على الأرض؟',
    opts: ['الاحتكاك','المغناطيسية','الجاذبية','الدفع'],
    ans: 2,
    fb: '✅ الجاذبية هي القوة التي تسحب جميع الأجسام نحو مركز الأرض — لهذا تسقط الأشياء عندما تتركها!'
  },
  g6forces2: {
    q: 'ماذا يحدث عندما تكون محصلة القوى على جسم تساوي صفراً؟',
    opts: ['يتسارع الجسم','يتوقف فجأة','يبقى ساكناً أو يتحرك بسرعة ثابتة','يتغير اتجاهه'],
    ans: 2,
    fb: '✅ عندما تتوازن القوى (محصلتها = صفر) لا يوجد تغيير في حالة الحركة — قانون نيوتن الأول.'
  },
  g6gravity: {
    q: 'ما الفرق بين الكتلة والوزن؟',
    opts: ['هما نفس الشيء','الكتلة بالنيوتن والوزن بالكيلوغرام','الكتلة ثابتة والوزن يتغير حسب الجاذبية','الوزن ثابت والكتلة تتغير'],
    ans: 2,
    fb: '✅ الكتلة (kg) ثابتة لا تتغير، أما الوزن (N) فيتغير حسب قوة الجاذبية. على القمر وزنك أقل لكن كتلتك نفسها!'
  },
  g6airresist: {
    q: 'كيف تؤثر مقاومة الهواء على الجسم الساقط؟',
    opts: ['تزيد سرعته','تبقي سرعته ثابتة','تُبطّئ سقوطه','لا تؤثر عليه'],
    ans: 2,
    fb: '✅ مقاومة الهواء قوة تعارض الحركة — كلما زادت سرعة الجسم أو مساحته، زادت مقاومة الهواء وتباطأ السقوط.'
  },
  g6friction: {
    q: 'في أيّ الحالات يكون الاحتكاك مفيداً؟',
    opts: ['عند تحريك الأثاث الثقيل','عند الكتابة بالقلم والمشي','في محركات السيارات فقط','لا يكون مفيداً أبداً'],
    ans: 1,
    fb: '✅ الاحتكاك مفيد في كثير من الحالات: يمنعك من الانزلاق أثناء المشي، ويُمكّنك من الكتابة، ويُوقف السيارات عند الكبح.'
  },
  magnets: {
    q: 'ماذا يحدث عند تقريب القطب الشمالي من قطب شمالي آخر؟',
    opts: ['يتجاذبان بقوة','يتنافران ويبتعدان','لا يحدث شيء','يصبحان قطباً واحداً'],
    ans: 1,
    fb: '✅ القطبان المتشابهان يتنافران (ش-ش أو ج-ج)، والمختلفان يتجاذبان (ش-ج). هذه القاعدة الأساسية للمغناطيسية!'
  },
  magfield: {
    q: 'أين تكون كثافة خطوط المجال المغناطيسي أكبر؟',
    opts: ['في المنتصف بين القطبين','عند القطبين الشمالي والجنوبي','في أي مكان بالتساوي','بعيداً عن المغناطيس'],
    ans: 1,
    fb: '✅ خطوط المجال أكثر كثافة عند القطبين — وهذا يعني أن المجال المغناطيسي أقوى عندهما.'
  },
  electromagnet: {
    q: 'كيف يمكن زيادة قوة المغناطيس الكهربائي؟',
    opts: ['تقليل شدة التيار','زيادة عدد لفّات السلك أو شدة التيار','استخدام سلك أطول فقط','لا يمكن تغيير قوته'],
    ans: 1,
    fb: '✅ قوة الكهرومغناطيس تزيد بزيادة عدد اللفّات أو شدة التيار الكهربائي — ميزته الكبرى أنه يمكن تشغيله وإيقافه!'
  },
  staticelec: {
    q: 'ما الذي يحدث عند احتكاك البالون بالشعر؟',
    opts: ['يفقد البالون شحنته','يكتسب البالون شحنة سالبة ويجذب الأشياء الخفيفة','يصبح البالون مغناطيساً','لا يحدث شيء'],
    ans: 1,
    fb: '✅ الاحتكاك ينقل إلكترونات من الشعر للبالون، فيصبح البالون مشحوناً سالباً ويجذب الأجسام المحايدة كالأوراق.'
  },
  circuit8: {
    q: 'ما الفرق الرئيسي بين الدائرة المتسلسلة والمتوازية؟',
    opts: ['لا فرق بينهما','في المتوازية كل مكوّن مستقل وإيقافه لا يؤثر على الباقين','في المتسلسلة التيار أضعف دائماً','المتوازية تستهلك طاقة أقل'],
    ans: 1,
    fb: '✅ في الدائرة المتوازية كل مكوّن على فرع مستقل — إيقاف أحدها لا يوقف الباقين. لهذا تُوصَّل مصابيح المنزل على التوازي!'
  },
  magcompare: {
    q: 'أيّ العوامل يحدد قوة المغناطيس الدائم؟',
    opts: ['حجمه فقط','المادة المصنوع منها وشكله وحجمه','درجة حرارته فقط','لونه وشكله الخارجي'],
    ans: 1,
    fb: '✅ قوة المغناطيس تعتمد على المادة المصنوع منها (كالنيوديميوم الأقوى) وشكله وحجمه — مغناطيسات النيوديميوم الصغيرة أقوى بكثير من الحديد العادي!'
  },
  emstronger: {
    q: 'ماذا يحدث لقوة الكهرومغناطيس إذا ضاعفنا عدد اللفّات مع تثبيت التيار؟',
    opts: ['تقل القوة إلى النصف','تتضاعف القوة تقريباً','لا تتغير القوة','تصل القوة إلى الصفر'],
    ans: 1,
    fb: '✅ قوة الكهرومغناطيس تتناسب طردياً مع عدد اللفّات — إذا ضاعفت اللفّات مع نفس التيار تضاعفت القوة. كذلك الأمر مع زيادة التيار!'
  },
  charges: {
    q: 'ما نوع الشحنة التي يكتسبها قضيب البوليثين عند دلكه بالصوف؟',
    opts: ['موجبة لأنه يفقد إلكترونات','سالبة لأنه يكتسب إلكترونات','لا يكتسب أي شحنة','موجبة وسالبة معاً'],
    ans: 1,
    fb: '✅ البوليثين يتمسك بالإلكترونات بقوة — عند الدلك يكتسب إلكترونات من الصوف فتصبح شحنته سالبة. الصوف يفقد إلكترونات فتصبح شحنته موجبة!'
  },
  electrons: {
    q: 'لماذا تنتقل الإلكترونات من مادة إلى أخرى عند الاحتكاك؟',
    opts: ['لأن الاحتكاك يدمر الذرات','لأن الإلكترونات توجد في الطرف الخارجي للذرات وتنتقل بسهولة','لأن المواد تتبادل الشحنة الموجبة','لأن النواة تنتقل بين المواد'],
    ans: 1,
    fb: '✅ الإلكترونات في الطبقات الخارجية للذرات سهلة الانتقال. بعض المواد تتمسك بإلكتروناتها أكثر من غيرها — هذا هو سر اكتساب الشحنة بالاحتكاك!'
  },
  cellvoltage: {
    q: 'إذا وصّلنا 3 خلايا كل واحدة جهدها 1.5V على التوالي، ما إجمالي الجهد؟',
    opts: ['1.5 V','3.0 V','4.5 V','6.0 V'],
    ans: 2,
    fb: '✅ عند التوصيل على التوالي تجمع الجهود: 1.5+1.5+1.5=4.5V. لهذا نستخدم بطاريات متعددة في الأجهزة التي تحتاج جهداً عالياً!'
  },
  resistance: {
    q: 'ماذا يحدث لشدة التيار إذا زدنا المقاومة في الدائرة مع تثبيت الجهد؟',
    opts: ['يزيد التيار','يقل التيار','لا يتغير التيار','يتوقف التيار تماماً'],
    ans: 1,
    fb: '✅ التيار = الجهد ÷ المقاومة. إذا زادت المقاومة قل التيار — تماماً كما يصعب تدفق الماء في أنبوب ضيق!'
  },
  parallel12: {
    q: 'لماذا تُوصَّل مصابيح المنزل على التوازي وليس التسلسل؟',
    opts: ['لأن التوازي أرخص','لأن إطفاء مصباح واحد لا يطفئ باقي المصابيح','لأن التسلسل يستهلك طاقة أكبر','لأن التوازي يعطي ضوءاً أقوى'],
    ans: 1,
    fb: '✅ في التوازي كل مصباح على فرعه المستقل — إطفاؤه لا يؤثر على الباقين. في التسلسل لو أُطفئ واحد انقطع التيار عن الجميع!'
  }
};

let qAnswered = false;

function loadQuestion(simType){
  const q = SIM_QUESTIONS[simType];
  const bar = document.getElementById('qToggleBar');
  const drawer = document.getElementById('qDrawer');
  // دايماً أظهر الزر — حتى لو ما في سؤال محدد
  if(bar) bar.style.display='flex';
  if(!q){
    // لا يوجد سؤال في القاموس — أخفِ الـ drawer فقط
    if(drawer) drawer.classList.remove('open');
    return;
  }
  qAnswered = false;
  if(q) q._attempts = 0;
  document.getElementById('qTitle').textContent = '🧠 ' + q.q;
  document.getElementById('qOptions').innerHTML = q.opts.map((o,i)=>
    `<button class="q-opt" onclick="answerQ(${i})">${o}</button>`
  ).join('');
  document.getElementById('qFeedback').className='q-feedback';
  document.getElementById('qFeedback').textContent='';
  if(drawer) drawer.classList.remove('open');
}

function toggleQuestion(){
  const drawer = document.getElementById('qDrawer');
  const q = SIM_QUESTIONS[currentSim];
  // إذا ما في سؤال محدد — لا تفتح الـ drawer
  if(!q) return;
  drawer.classList.toggle('open');
}

function answerQ(i){
  if(qAnswered) return;
  const simType = currentSim;
  const q = SIM_QUESTIONS[simType];
  if(!q) return;
  const opts = document.querySelectorAll('.q-opt');
  const fb = document.getElementById('qFeedback');

  if(i === q.ans){
    // إجابة صحيحة
    qAnswered = true;
    opts.forEach((el,j)=>{
      if(j===q.ans) el.classList.add('correct');
      el.onclick=null;
    });
    fb.innerHTML = q.fb;
    fb.style.background = '#E8F5E9';
    fb.style.color = '#1E8449';
    fb.classList.add('show');
    U9Sound.win();
    buddySay('ممتاز! إجابة صحيحة 🎉', 3500);
  } else {
    // إجابة خاطئة — تلميح بلا كشف الإجابة، مع إمكانية إعادة المحاولة
    opts[i].classList.add('wrong');
    opts[i].onclick = null; // منع إعادة النقر على الخطأ
    setTimeout(()=>{ opts[i].classList.remove('wrong'); }, 600);
    fb.innerHTML = '❌ حاول مرة أخرى — فكّر جيداً! 💡';
    fb.style.background = '#FFEBEE';
    fb.style.color = '#C0392B';
    fb.classList.add('show');
    U9Sound.ping(220,0.3,0.25);
    // بعد محاولتين إضافيتين نكشف الإجابة
    q._attempts = (q._attempts || 0) + 1;
    if(q._attempts >= 2){
      qAnswered = true;
      opts.forEach((el,j)=>{
        if(j===q.ans) el.classList.add('correct');
        el.onclick=null;
      });
      fb.innerHTML = '💡 الإجابة الصحيحة هي: <strong>' + q.opts[q.ans] + '</strong><br><br>' + q.fb;
    }
  }
}

function openSim(type) {
  _hideFooter();
  try{ U9Sound.ping(440,0.15,0.2); }catch(e){}
  const meta = SIM_META[type];
  if (!meta) { console.warn('openSim: نوع غير معروف —', type); return; }
  const dd = document.getElementById('dataDisplay');
  if(dd) { dd.style.display='none'; dd.innerHTML=''; }
  const sc = document.getElementById('sticky-credit');
  if(sc) sc.style.display='none';
  currentSim = type; currentTab = 0;
  document.getElementById('simPanelTitle').textContent = meta.title;
  document.getElementById('simPanelBadge').textContent = meta.badge;
  buildTabs(meta.tabs);
  document.getElementById('sim-panel').classList.add('open');
  resizeCanvas();
  startSim(type, 0);
  setTimeout(()=>loadQuestion(type), 500);
  // Buddy greeting
  var simGreets = {
    // ── الصف الخامس ──
    g5lighttravel:'الضوء ينتقل من المصدر في جميع الاتجاهات 💡 — حرّك المصدر وشاهد الأشعة!',
    g5mirror:'المرآة تعكس الضوء! 🪞 — زاوية السقوط = زاوية الانعكاس. جرّب!',
    g5behindyou:'مرايا السيارات والمتاجر تعطينا رؤية أوسع! 🔍 — جرّب زوايا مختلفة',
    g5reflection:'السطوح اللامعة تعكس أفضل ✨ — قارن بين مواد مختلفة وقِس الانعكاس',
    g5lightdir:'هل تستطيع إيصال الضوء للهدف؟ 🎯 — استخدم المرايا بذكاء!',
    g5shadowsize:'حرّك المصباح واشعل الخيال! 🌑 — الظل يتبعك أينما ذهبت!',
    g5transparent:'الزجاج شفاف والخشب معتم 🔬 — ما حال الورق المشمّع؟ جرّب!',
    g5silhouette:'كل شكل له ظله المميز 🎭 — أنشئ فناً ظليّاً وادرسه!',
    g5shadowfactor:'الظل يكبر عندما تقترب من المصدر! 📐 — ابحث عن القانون!',
    g5lightintensity:'الضوء يضعف بالمسافة ☀️ — قِس وارسم العلاقة في جدولك!',
    g5earthsun:'الأرض تدور حول الشمس في 365 يوماً 🌍 — شاهد المسارات!',
    g5rotation:'دوران الأرض حول نفسها يصنع الليل والنهار 🌓 — شاهد العرض!',
    g5stars:'النجوم في السماء موجودة دائماً لكننا نراها ليلاً فقط! ⭐ — اكتشف أسماءها!',
    adaptation:'جاهز؟ 🦊 غيّر الإعدادات وشوف كيف تتأقلم الحيوانات!',
    foodchain:'تذكّر: الطاقة تنتقل من المنتج للمستهلك. ابدأ بالنبات! 🌿',
    foodweb:'الشبكة أعقد من السلسلة 🕸️ — شوف تأثير إزالة كائن على الكل',
    decomposer:'المحللات أبطال خفيّون! 🍄 راقب كيف تُعيد المواد للتربة',
    human:'الإنسان جزء من السلسلة 🌍 — شوف تأثير قراراتنا',
    pollution:'كل قرار له ثمن بيئي 🌫️ — جرّب تغيّر مصادر التلوث',
    ozone:'شوف كيف تتآكل الأوزون بمركبات CFC ☁️',
    conservation:'أنت صاحب القرار! 🌿 كيف تحمي الأنواع المهددة؟',
    metals:'الفلزات تلمع وتوصل! ⚙️ جرّب اختبار كل خاصية',
    nonmetals:'اللافلزات مختلفة 🫧 — لاحظ الفرق في التوصيل',
    metalcompare:'قارن بتركيز ⚖️ — الجدول يوضح الفرق',
    materials:'من أي مادة؟ 🏠 فكّر قبل تجرّب!',
    forces:'القوى في كل مكان! 💪 حدّد الاتجاه والمقدار',
    forcemeter:'الميزان الزنبركي ⚖️ — لاحظ العلاقة بين الشدّ والقراءة',
    gravity:'الكتلة ثابتة، الوزن يتغيّر! 🌍 جرّب على القمر',
    friction:'الاحتكاك يبطّئ لكنه يحمي! 🔥 غيّر السطح وشوف',
    airresist:'المظلة تزيد المقاومة وتُبطّئ السقوط 🪂 — غيّر مساحتها!',
    variation:'لا يوجد شخصان متطابقان! 📊 ابحث عن النمط',
    plantclass:'كيف نُصنّف النباتات؟ 🌿 ابحث عن الخصائص المشتركة',
    vertebrates:'الفقاريات خمس فئات 🐾 — أيها ينتمي لأيٍّ؟',
    invertebrates:'معظم الحيوانات بلا عمود فقري! 🦀 اكتشف مجموعاتها',
    dichotomous:'سؤالان فقط في كل خطوة 🔑 — نعم أو لا يقودك للإجابة',
    genetics:'الجينات تنتقل من الآباء! 🧬 شوف نتائج التزاوج',
    acidbase:'حامض أم قلوي? 🍋 الطعم والتفاعل يدلّانك',
    indicator:'ورق تبّاع الشمس يكشف السر 📄 — راقب تغيّر اللون',
    phscale:'المقياس من 0 إلى 14 📊 — الوسط متعادل!',
    neutralisation:'حامض + قلوي = ماء + ملح ⚗️',
    neutralapp:'التعادل في الطب والزراعة 🌿 — كيف يُستخدم؟',
    acidinquiry:'صمّم تجربتك 🧠 — ما المتغيّر؟ ما الثابت؟',
    // وحدة الكهرباء — الصف السادس
    g6conductors:'المعادن موصِّلة والبلاستيك عازل ⚡ — جرّب كل مادة!',
    g6waterconductor:'الماء النقي لا يوصِّل لكن الماء المالح يوصِّل! 💧 لماذا؟',
    g6metalconductor:'كل المعادن توصِّل لكن بكفاءة مختلفة 🔩 — شوف الأميتر!',
    g6circuit:'ابنِ دائرتك الأولى 🔌 — بطارية + سلك + مصباح = نور!',
    g6circuitchange:'كيف يؤثر عدد المصابيح على السطوع؟ 💡 جرّب وشوف!',
    g6wirelength:'السلك الطويل = مقاومة أكبر = تيار أقل 📏 — جرّب واقيس!',
    magnets:'القطبان المتشابهان يتنافران والمختلفان يتجاذبان 🧲 — جرّب!',
    magfield:'برادة الحديد تكشف خطوط المجال المغناطيسي 🔮 — شوف النمط!',
    electromagnet:'كلما زادت اللفّات زادت القوة ⚡ — جرّب وقِس!',
    staticelec:'الشحنات المتشابهة تتنافر والمختلفة تتجاذب ⚡ — ابدأ التجربة!',
    circuit8:'في الدائرة المتوازية كل مصباح مستقل 🔌 — جرّب افصل واحد!',
    magcompare:'أيّ المغناطيسات أقوى؟ 📏 — قِس بعدد المشابك!',
    emstronger:'اللفّات أكثر = قوة أكبر ⚡ — جرّب وقارن!',
    charges:'موجب أم سالب؟ ⊕ — استخدم الجهاز لتعرف!',
    electrons:'الإلكترونات تنتقل عند الدلك ⚛️ — شاهد كيف!',
    cellvoltage:'خليتان على التوالي = جهد مضاعف 🔋 — جرّب!',
    resistance:'المقاومة أكبر = تيار أقل = مصباح أخفت 〰️ — جرّب!',
    parallel12:'في التوازي كل فرع مستقل 🔀 — افصل مصباحاً وشوف!',
    // ── التكاثر والتطوّر ──
    repro_gametes:'البويضة والحيوان المنوي 🧬 — كل منهما يحمل 23 كروموسوماً فقط! اكتشف لماذا!',
    repro_fertilisation:'من خلية واحدة إلى إنسان كامل! ❤️ — تتبّع رحلة الإخصاب خطوة بخطوة',
    repro_development:'الجنين ينمو 38 أسبوعاً 🤰 — حرّك المؤشر وشاهد النمو أسبوعاً بأسبوع!',
    repro_growth:'كل جسمك من خلية واحدة 📈 — شاهد انقسام الخلايا ومراحل الحياة!',
    repro_lifestyle:'التدخين يؤثر على الجنين 🚭 — شاهد البيانات الحقيقية!',
    // ── الأملاح ──
    salts_what:'الأملاح في كل مكان 🧂 — ليس فقط ملح الطعام! اكتشف تنوعها!',
    salts_metal:'فلز + حمض = ملح + هيدروجين ⚗️ — شاهد الفقاعات تظهر!',
    salts_oxide:'النحاس لا يتفاعل مباشرة! 🔵 — استخدم أكسيده لصنع الملح الأزرق!',
    salts_carbonate:'فوران ثاني أكسيد الكربون 🫧 — ماء الجير سيكشف الغاز الناتج!',
    // ── الصوت ──
    sound_pitch:'الصوت اهتزاز 🎵 — غيّر الشدة والحدة وشاهد الفرق على الشاشة!',
    sound_vibration:'المسطرة القصيرة تهتز أسرع ⚡ — جرّب وقارن الترددات!',
    sound_travel:'الصوت يحتاج وسطاً لينتقل 🌊 — جرّب في الفراغ!',
    sound_oscilloscope:'شاشة الأوسيلوسكوب تكشف أسرار الصوت 📊 — غيّر وشاهد!',
    // ── الصف التاسع — الوحدة ٦: الأحماض والقواعد ──
    g9acidprop:'الأحماض لها طعم حامض والقواعد ملمسها زلق 🍋 — صنِّفها من خصائصها!',
    g9indicator:'لون واحد يخبرك بكل شيء 🌺 — ورق تبّاع الشمس سيكشف السر!',
    g9phscale:'من 0 إلى 14 — كلما اقتربت من الصفر ازداد الحمض قوة! 📊',
    g9ions:'H⁺ يعني حمض، OH⁻ يعني قاعدة ⚛️ — ما الذي يزيد في محلولك؟',
    g9oxides:'ذوّب الأكسيد في الماء وشوف: هل يتحوّل إلى حمض أم قاعدة؟ 🔬',
    // ── الوحدة السابعة: معادلات التفاعلات ──
    g9wordeq:'المعادلة اللفظية تصف التفاعل بالكلمات 📝 — مَن المتفاعل ومَن الناتج؟',
    g9balance:'الذرات لا تُخلق ولا تُفنى ⚖️ — وازن المعادلة وتحقق!',
    g9statesym:'(s) صلب، (l) سائل، (g) غاز، (aq) محلول مائي 🏷️ — أضِف رموز الحالة!',
    // ── الوحدة الثامنة: تكوين الأملاح ──
    g9saltacid:'حمض + قاعدة = ملح + ماء 🧪 — اكتشف كيف تتكوّن الأملاح!',
    g9saltmetal:'الفلز النشيط + الحمض = ملح + هيدروجين 💥 — راقب الفقاعات!',
    g9saltmake:'بخِّر وبرِّد واحصل على بلورات الملح الجميلة 💎',
    g9salttitra:'المعايرة تُعطيك ملحاً نقياً بدقة 🎯 — قطرة بقطرة حتى النهاية!',
    // ── الوحدة التاسعة: التحليل الكيميائي ──
    g9watergas: 'كيف تعرف أن السائل ماء؟ 💧 — اختبر مع كبريتات النحاس اللامائية!',
    g9flametest:'لون اللهب يكشف الكاتيون 🔥 — الصوديوم أصفر، والبوتاسيوم بنفسجي!',
    g9cationppt:'NaOH + كاتيون → راسب ملوّن 🧪 — لون الراسب هو السر!',
    g9aniontest:'نترات الفضة تكشف Cl⁻ وBr⁻ 🥈 — وكلوريد الباريوم يكشف الكبريتات!',
    g9chemlab:  'تحدٍّ حقيقي: ما هذه المادة المجهولة؟ 🔬 — طبِّق كل اختبارات التحليل النوعي!',
    // ── الوحدة العاشرة: الأرض والغلاف الجوّي ──
    g9aircomp:    '78% نيتروجين + 21% أكسجين + 1% غازات أخرى 🌬️ — شوف ما يملأ كل شهقة!',
    g9combustion: 'الأكسجين الكافي = CO₂ + H₂O ✅ | الأكسجين الناقص = CO خطير ⚠️',
    g9acidrain:   'SO₂ + NO₂ + مياه السحاب = مطر pH < 5 🌧️ — يُدمّر الأحجار والأشجار!',
    g9greenhouse: 'CO₂ و CH₄ يحبسان الحرارة كالزجاج 🌡️ — الأرض تسخن والمناخ يتغيّر!',
    g9limestone:  'CaCO₃ + حرارة شديدة → CaO + CO₂ 🪨 — الجير الحيّ يُعادل التربة الحمضية!'
  };
  var greet = simGreets[type] || 'استكشف وجرّب! 🔬';
  setTimeout(function(){ buddySay(greet, 6000); }, 800);
}

function closeSim() {
  document.getElementById('sim-panel').classList.remove('open');
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
  var _cv = document.getElementById('simCanvas');
  if (_cv) {
    _cv.onclick = null; _cv._ind2Click = null;
    _cv.onmousedown = null; _cv.onmousemove = null; _cv.onmouseup = null;
    _cv.ontouchstart = null; _cv.ontouchmove = null; _cv.ontouchend = null;
    var _ctx = _cv.getContext('2d');
    if (_ctx) _ctx.clearRect(0, 0, _cv.width, _cv.height);
  }
  var _cp = document.getElementById('simControlsPanel');
  if (_cp) _cp.innerHTML = '';
  currentSim = null; simState = {};
  const bar = document.getElementById('qToggleBar');
  if(bar) bar.style.display='none';
  const drawer = document.getElementById('qDrawer');
  if(drawer) drawer.classList.remove('open');
  const dd = document.getElementById('dataDisplay');
  if(dd) { dd.style.display='none'; dd.innerHTML=''; }
  // إيقاف الأصوات الطبيعية
  if(window._stopNatureSound) window._stopNatureSound();
  // إيقاف صوت نبضات القلب
  if(window._stopHeartbeat) window._stopHeartbeat();
  // أظهر شريط المعلومات عند الرجوع لصفحة الوحدات
  const sc = document.getElementById('sticky-credit');
  if(sc) sc.style.display='flex';
  // أظهر الفوتر عند العودة من الاستقصاء
  setTimeout(_updateFooterVisibility, 80);
}

function buildTabs(tabs) {
  const row = document.getElementById('simTabsRow');
  row.innerHTML = tabs.map((t, i) =>
    `<button class="sim-tab-btn ${i===0?'active':''}" onclick="switchSimTab(${i})">${t}</button>`
  ).join('');
}

function switchSimTab(i) {
  currentTab = i;
  document.querySelectorAll('.sim-tab-btn').forEach((b,j) => b.classList.toggle('active', j===i));
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
  simState = {};
  // مسح لوحة التحكم
  var panel = document.getElementById('simControlsPanel');
  if (panel) panel.innerHTML = '';
  // إزالة event listeners على الـ canvas بشكل نظيف
  var cv = document.getElementById('simCanvas');
  if (cv) {
    cv.onclick = null; cv._ind2Click = null;
    cv.onmousedown = null; cv.onmousemove = null; cv.onmouseup = null;
    cv.ontouchstart = null; cv.ontouchmove = null; cv.ontouchend = null;
    // مسح محتوى Canvas بدل cloneNode لتفادي مشاكل المراجع
    var ctx = cv.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, cv.width, cv.height);
  }
  // تغيير صوت استقصاء الإنسان عند تبديل التاب
  // إيقاف نبضات القلب عند تبديل التاب
  if(window._stopHeartbeat) window._stopHeartbeat();
  if(currentSim==='human' && window._stopNatureSound && window._playSoundFor){
    window._stopNatureSound();
    setTimeout(function(){
      if(i===0){ window._playOcean && window._playOcean(); }
      else { window._playBirds && window._playBirds(); }
    }, 400);
  }
  resizeCanvas();
  startSim(currentSim, i);
}

function resizeCanvas() {
  const canvas = document.getElementById('simCanvas');
  if (!canvas) return;
  const wrap = canvas.parentElement;
  if (!wrap) return;
  const W = wrap.clientWidth  || wrap.offsetWidth;
  const H = wrap.clientHeight || wrap.offsetHeight;
  if (W > 0 && H > 0 && (canvas.width !== W || canvas.height !== H)) {
    canvas.width  = W;
    canvas.height = H;
  }
}

// debounced resize — يعيد الرسم بعد 120ms من توقف التغيير
var _resizeTimer = null;
window.addEventListener('resize', function() {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(function() {
    if (currentSim) {
      resizeCanvas();
      if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
      startSim(currentSim, currentTab);
    }
  }, 120);
});

// ResizeObserver للكانفاس — يلتقط أي تغيير في حجم الـ wrap
(function() {
  if (!window.ResizeObserver) return;
  var _roTimer = null;
  var ro = new ResizeObserver(function() {
    clearTimeout(_roTimer);
    _roTimer = setTimeout(function() {
      if (currentSim) {
        resizeCanvas();
        if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
        startSim(currentSim, currentTab);
      }
    }, 150);
  });
  // يراقب الـ wrap عند فتح أي simulation
  var _origOpenSim = window.openSim;
  window.openSim = function(id) {
    _origOpenSim && _origOpenSim(id);
    var wrap = document.querySelector('.sim-canvas-wrap');
    if (wrap) ro.observe(wrap);
  };
})();


function startSim(type, tab) {
  const _s = n => () => { const f = window[n]; if(f) f(); };
  const fns = {
    // ── الصف الخامس — الضوء والظلال والأرض ──
    g5lighttravel:    [simG5LightTravel, simG5HowWeSee],
    g5mirror:         [simG5MirrorFlat, simG5MirrorCurved],
    g5behindyou:      [simG5BehindYou],
    g5reflection:     [simG5ReflectionCompare, simG5ReflectionMeasure],
    g5lightdir:       [simG5LightDirection],
    g5shadowsize:     [simG5ShadowLab, simG5ShadowInquiry],
    g5transparent:    [simG5TransparentTest],
    g5silhouette:     [simG5Silhouette],
    g5shadowfactor:   [simG5ShadowFactor, simG5ShadowFactorSize],
    g5lightintensity: [simG5LightIntensity],
    g5earthsun:       [simG5EarthSun, simG5OrbitalPaths],
    g5rotation:       [simG5DayNight, simG5Seasons],
    g5stars:          [simG5StarMap, simG5StarNames],
    adaptation:   [simAdaptDesert, simAdaptOcean, simAdaptForest],
    foodchain:    [simFoodChainBuild, simFoodChainEnergy],
    foodweb:      [simFoodWeb],
    decomposer:   [simDecomposer],
    human:        [simHumanFishing, simHumanFarming],
    pollution:    [simWaterPollution, simAirPollution],
    ozone:        [simOzone],
    conservation: [simConservation],
    // Unit 8
    metals:       [simMetals, simMetalLab],
    nonmetals:    [simNonMetals, simNonMetalResearch],
    metalcompare: [simMetalCompare, simMaterialTest],
    materials:    [simMaterials, simGlassPlastic],
    // Unit 9
    // الصف السادس — نفس دوال الصف التاسع
    g6forces1:   [simForces1],
    g6forces2:   [simForces2],
    g6gravity:   [simGravity1],
    g6airresist: [simAirResist1, simAirResist2],
    g6friction:  [simFriction1, simFriction2],
    // وحدة الكهرباء — الصف السادس
    g6conductors:     [simConductors1, simConductors2],
    g6waterconductor: [simWaterConductor1, simWaterConductor2],
    g6metalconductor: [simMetalConductor1, simMetalConductor2],
    g6circuit:        [simCircuitBuilder1, simCircuitBuilder2],
    g6circuitchange:  [simCircuitChange1, simCircuitChange2],
    g6wirelength:     [simWireLength1, simWireLength2],
    // ── الصف 8 — الجهاز الدوري وتبادل الغازات ──
    circsystem:   [simCircSystem1, simCircSystem2],
    heart8:       [simHeart1, simHeart2],
    blood8:       [simBlood1, simBlood2],
    vessels8:     [simVessels1, simVessels2, simVessels3],
    lungs8:       [simLungs1, simLungs2],
    gasex8:       [simGasEx1, simGasEx2],
    respiration8: [simRespiration1, simRespiration2],
    fitness8:     [simFitness1, simFitness2],
    smoking8:     [simSmoking1, simSmoking2],
    // ── الصف 8 — التكاثر والتطوّر ──
    repro_gametes:      [repro_gametes, repro_gametes2],
    repro_fertilisation:[repro_fertilisation, repro_fertilisation2],
    repro_development:  [repro_development, repro_development2],
    repro_growth:       [repro_growth, repro_growth2],
    repro_lifestyle:    [repro_lifestyle, repro_lifestyle2],
    // ── الصف 8 — الأملاح ──
    salts_what:      [salts_what, salts_what2],
    salts_metal:     [salts_metal, salts_metal2],
    salts_oxide:     [salts_oxide, salts_oxide2],
    salts_carbonate: [salts_carbonate, salts_carbonate2],
    // ── الصف 8 — الصوت ──
    sound_pitch:        [sound_pitch,        sound_pitch2],
    sound_vibration:    [sound_vibration,    sound_vibration2],
    sound_travel:       [sound_travel,       sound_travel2],
    sound_oscilloscope: [sound_oscilloscope, sound_oscilloscope2],

    // ── الصف 8 — المغناطيسيّة والكهرباء ──
    magnets:      [simMagnets1, simMagnets2],
    electromagnet:[simElectromagnet1, simElectromagnet2],
    staticelec:   [simStaticElec1, simStaticElec2],
    circuit8:     [simCircuit8Series, simCircuit8Parallel],
    magcompare:   [simMagCompare1, simMagCompare2],
    magfield:     [simMagField1, simMagField2],
    emstronger:   [simEmStronger1, simEmStronger2],
    charges:      [simCharges1, simCharges2],
    electrons:    [simElectrons1, simElectrons2],
    cellvoltage:  [simCellVoltage1, simCellVoltage2],
    resistance:   [simResistance1, simResistance2],
    parallel12:   [simParallel12a, simParallel12b],
    forces:       [simForces1, simForces2, simNetForce],
    forcemeter:   [simForcemeter1, simForcemeter2],
    gravity:      [simGravity1, simGravity2],
    friction:     [simFriction1, simFriction2, simFriction3],
    airresist:    [simAirResist1, simAirResist2, simAirResist3],
    // Unit 10
    variation:    [simVariation1, simVariation2],
    plantclass:   [simPlantClass1, simPlantClass2],
    vertebrates:  [simVertebrates1, simVertebrates2],
    invertebrates:[simInvertebrates1, simInvertebrates2],
    dichotomous:  [simDichotomous1, simDichotomous2],
    genetics:     [simGenetics1, simGenetics2],
    // Unit 11
    acidbase:     [simAcidBase1, simAcidBase2],
    indicator:    [simIndicator1, simIndicator2],
    phscale:      [simPhScale1, simPhScale2],
    neutralisation:[simNeutral1, simNeutral2],
    neutralapp:   [simNeutralApp1, simNeutralApp2],
    acidinquiry:  [simAcidInquiry1, simAcidInquiry2],
    // ── الصف التاسع — الوحدة ٦ ──
    g9acidprop:   [simG9AcidProp1, simG9AcidProp2, simG9AcidProp3],
    g9indicator:  [simG9Indicator1, simG9Indicator2, simG9Indicator3],
    g9phscale:    [simG9PhScale1, simG9PhScale2, simG9PhScale3],
    g9ions:       [simG9Ions1, simG9Ions2],
    g9oxides:     [simG9Oxides1, simG9Oxides2, simG9Oxides3],
    // ── الوحدة السابعة: معادلات التفاعلات ──
    g9wordeq:    [simG9WordEq1, simG9WordEq2, simG9WordEq3],
    g9balance:   [simG9Balance1, simG9Balance2, simG9Balance3],
    g9statesym:  [simG9StateSym1, simG9StateSym2, simG9StateSym3],
    // ── الوحدة الثامنة: تكوين الأملاح ──
    g9saltacid:  [simG9SaltAcid1, simG9SaltAcid2, simG9SaltAcid3],
    g9saltmetal: [simG9SaltMetal1, simG9SaltMetal2, simG9SaltMetal3],
    g9saltmake:  [simG9SaltMake1, simG9SaltMake2, simG9SaltMake3],
    g9salttitra: [simG9SaltTitra1, simG9SaltTitra2, simG9SaltTitra3],
    // ── الوحدة التاسعة: التحليل الكيميائي ──
    g9watergas:  [_s('simG9WaterGas1'), _s('simG9WaterGas2'), _s('simG9WaterGas3')],
    g9flametest: [_s('simG9FlameTest1'), _s('simG9FlameTest2'), _s('simG9FlameTest3')],
    g9cationppt: [_s('simG9CationPpt1'), _s('simG9CationPpt2'), _s('simG9CationPpt3')],
    g9aniontest: [_s('simG9AnionTest1'), _s('simG9AnionTest2'), _s('simG9AnionTest3')],
    g9chemlab:   [_s('simG9ChemLab1'), _s('simG9ChemLab2'), _s('simG9ChemLab3')],
    // ── الوحدة العاشرة ──
    g9aircomp:    [_s('simG9AirComp1'),    _s('simG9AirComp2'),    _s('simG9AirComp3')],
    g9combustion: [_s('simG9Combustion1'), _s('simG9Combustion2'), _s('simG9Combustion3')],
    g9acidrain:   [_s('simG9AcidRain1'),   _s('simG9AcidRain2'),   _s('simG9AcidRain3')],
    g9greenhouse: [_s('simG9Greenhouse1'), _s('simG9Greenhouse2'), _s('simG9Greenhouse3')],
    g9limestone:  [_s('simG9Limestone1'),  _s('simG9Limestone2'),  _s('simG9Limestone3')],
    // ── الوحدة الحادية عشرة: مصادر الطاقة (فيزياء) ──
    g9energy:     [simE11Energy1,     simE11Energy2],
    g9fossil:     [simE11Fossil1,     simE11Fossil2],
    g9solar:      [simE11Solar1,      simE11Solar2],
    g9efficiency: [simE11Efficiency1, simE11Efficiency2],
    g9hydro:      [simE11Hydro1,      simE11Hydro2],
    g9future:     [simE11Future1,     simE11Future2]
  };
  const fn = (fns[type] || [])[tab];
  if (fn) {
    try { fn(); }
    catch(e) {
      console.error('Sim error:', type, tab, e);
      const cv = document.getElementById('simCanvas');
      if(cv){
        const c = cv.getContext('2d');
        c.clearRect(0,0,cv.width,cv.height);
        c.fillStyle='#F5F2EC'; c.fillRect(0,0,cv.width,cv.height);
        c.fillStyle='#C0392B'; c.font='bold 17px Tajawal'; c.textAlign='center';
        c.fillText('حدث خطأ في التحميل. أعد المحاولة.', cv.width/2, cv.height/2);
      }
    }
  }
}


// ===== UNIT 11: تغيُّرات المادّة =====

// ── 11-1 Tab 1: الأحماض ──
