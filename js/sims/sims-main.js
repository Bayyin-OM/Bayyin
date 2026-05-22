

// ═══════════════════════════════════════
// i18n LANGUAGE CHANGE HANDLER
// Called whenever the user switches language
// ═══════════════════════════════════════
function _onLangChange() {
  var lang = (typeof i18n !== 'undefined') ? i18n.getCurrentLanguage() : 'ar';
  var isAr = lang === 'ar';

  // Update landing toggle button text
  var btn = document.getElementById('lang-toggle-btn');
  if (btn) btn.textContent = isAr ? 'عربي' : 'English';
  var appBtn = document.getElementById('app-lang-toggle-btn');
  if (appBtn) appBtn.textContent = isAr ? 'عربي' : 'EN';

  // Update dark-mode button label
  var dmLabel = document.querySelector('#dm-toggle .dm-label');
  if (dmLabel) {
    var isDark = document.documentElement.classList.contains('dark-mode');
    dmLabel.textContent = isDark ? (isAr ? 'فاتح' : 'Light') : (isAr ? 'داكن' : 'Dark');
  }

  // Update search input placeholder and direction
  var searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.placeholder = isAr ? 'ابحث عن استقصاء...' : 'Search for an inquiry...';
    searchInput.style.direction = isAr ? 'rtl' : 'ltr';
  }

  // Update AI input placeholder and direction
  var aiInput = document.getElementById('ai-input');
  if (aiInput) {
    aiInput.placeholder = isAr ? 'اسألني عن العلوم...' : 'Ask me about science...';
    aiInput.style.direction = isAr ? 'rtl' : 'ltr';
  }

  // Update search overlay direction
  var searchOverlay = document.getElementById('search-overlay');
  if (searchOverlay) {
    searchOverlay.querySelector('div').style.direction = isAr ? 'rtl' : 'ltr';
  }

  // Update AI panel direction
  var aiPanel = document.getElementById('ai-panel');
  if (aiPanel) {
    aiPanel.style.direction = isAr ? 'rtl' : 'ltr';
    // Flip FAB position for LTR
    var aiFab = document.getElementById('ai-fab');
    if (aiFab) {
      aiFab.style.left = isAr ? '24px' : '';
      aiFab.style.right = isAr ? '' : '24px';
      aiPanel.style.left = isAr ? '24px' : '';
      aiPanel.style.right = isAr ? '' : '24px';
    }
  }

  // Update topbar home button
  var homeBtn = document.getElementById('topbar-home-btn');
  if (homeBtn) homeBtn.innerHTML = isAr ? '🏠 الرئيسية' : '🏠 Home';

  // Update search button
  var searchBtn = document.getElementById('search-btn');
  if (searchBtn) searchBtn.innerHTML = isAr ? '🔍 بحث' : '🔍 Search';

  // Update semester breadcrumb & banners dynamically
  if (typeof _updateGradePickerBanner !== 'undefined' && window._activeSemester) {
    _updateGradePickerBanner(window._activeSemester);
  }
  if (typeof renderGradeButtons !== 'undefined' && window._activeSemester) {
    renderGradeButtons(window._activeSemester);
  }

  // Update breadcrumb in app
  if (window._activeGrade && typeof _updateAppBreadcrumb !== 'undefined') {
    _updateAppBreadcrumb(window._activeGrade);
  }

  // Update page title
  document.title = isAr ? 'بيّن | منصة العلوم التفاعلية' : 'Bayyin | Interactive Science Platform';

  // Fire i18n.apply() to update all data-i18n elements
  if (typeof i18n !== 'undefined' && typeof i18n.apply === 'function') {
    i18n.apply();
  }
}

// Register the handler with i18n engine (fires on each language change)
document.addEventListener('DOMContentLoaded', function() {
  if (typeof i18n !== 'undefined' && typeof i18n.onLanguageChange === 'function') {
    i18n.onLanguageChange(_onLangChange);
  }
  // Set initial button text
  _onLangChange();
});

// ═══════════════════════════════════════
// ═══════════════════════════════════════
// FEEDBACK MODAL
// ═══════════════════════════════════════
(function() {
  var _rating = null;

  window.openFeedbackModal = function() {
    var overlay = document.getElementById('feedback-overlay');
    if (!overlay) return;
    // reset state
    _rating = null;
    document.querySelectorAll('.fb-emoji-btn').forEach(function(b){ b.classList.remove('active'); });
    var txt = document.getElementById('feedback-text');
    if (txt) txt.value = '';
    var submitBtn = document.getElementById('feedback-submit');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'إرسال التقييم ✉️'; }
    document.getElementById('fb-form-content').style.display = '';
    document.getElementById('fb-thankyou-content').style.display = 'none';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeFeedbackModal = function() {
    var overlay = document.getElementById('feedback-overlay');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  window.selectFeedbackRating = function(btn) {
    document.querySelectorAll('.fb-emoji-btn').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
    _rating = btn.getAttribute('data-val');
    var submitBtn = document.getElementById('feedback-submit');
    if (submitBtn) submitBtn.disabled = false;
  };

  window.submitFeedback = function() {
    if (!_rating) return;
    var submitBtn = document.getElementById('feedback-submit');
    var suggestion = (document.getElementById('feedback-text').value || '').trim();
    submitBtn.disabled = true;
    submitBtn.textContent = 'جارٍ الإرسال...';

    var payload = {
      rating: _rating,
      suggestion: suggestion || null,
      submitted_at: new Date().toISOString(),
      page: window.location.pathname || '/'
    };

    // استخدم _SUPA_URL و _SUPA_KEY الموجودَين في الملف مباشرة
    fetch(_SUPA_URL + '/rest/v1/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': _SUPA_KEY,
        'Authorization': 'Bearer ' + _SUPA_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    })
    .then(function(res) {
      if (!res.ok) return res.text().then(function(t){ throw new Error(t); });
    })
    .catch(function(e){ console.warn('Bayyin feedback error:', e); })
    .finally(_showThankyou);
  };

  function _showThankyou() {
    document.getElementById('fb-form-content').style.display = 'none';
    document.getElementById('fb-thankyou-content').style.display = '';
    setTimeout(window.closeFeedbackModal, 3000);
  }

  // Close on overlay click
  document.addEventListener('DOMContentLoaded', function() {
    var overlay = document.getElementById('feedback-overlay');
    if (overlay) {
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) window.closeFeedbackModal();
      });
    }
    // Close on Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') window.closeFeedbackModal();
    });
  });
})();

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
// ══════════════════════════════════════════════════════════
// NAV STATE — tracks which semester is active
// ══════════════════════════════════════════════════════════
window._activeSemester = 2; // default: Semester 2

// ── i18n-aware helpers ──────────────────────────────────
function _t(key) {
  return (typeof i18n !== 'undefined') ? i18n.t(key) : key;
}

// ── Semester config: what grades are available per semester ──
// Note: labels are rendered via _t() at render time, not at config time
var _semesterConfigRaw = {
  1: {
    labelKey: 'sem.1.title',
    icon: '🌅',
    subKey: 'sem.1.sub',
    accentColor: '#D4901A',
    grades: [
      { g:5, icon:'🔭', labelKey:'grade.5', countKey:'grade.coming_soon', available: false },
      { g:6, icon:'📗', labelKey:'grade.6', countKey:'grade.coming_soon', available: false },
      { g:7, icon:'📚', labelKey:'grade.7', countKey:'grade.coming_soon', available: false },
      { g:8, icon:'📖', labelKey:'grade.8', countKey:'grade.coming_soon', available: false },
      { g:9, icon:'📕', labelKey:'grade.9', countKey:'grade.coming_soon', available: false },
    ]
  },
  2: {
    labelKey: 'sem.2.title',
    icon: '🌿',
    subKey: 'sem.2.sub',
    accentColor: '#1A8FA8',
    grades: [
      { g:5, icon:'🔭', labelKey:'grade.5', countKey:'grade.5.count', available: true },
      { g:6, icon:'📗', labelKey:'grade.6', countKey:'grade.6.count', available: true },
      { g:7, icon:'📚', labelKey:'grade.7', countKey:'grade.7.count', available: true },
      { g:8, icon:'📖', labelKey:'grade.8', countKey:'grade.8.count', available: true },
      { g:9, icon:'📕', labelKey:'grade.9', countKey:'grade.9.count', available: true },
    ]
  }
};

// Returns the translated config for a semester
function _semesterConfig(sem) {
  var raw = _semesterConfigRaw[sem];
  if (!raw) return null;
  return {
    label: _t(raw.labelKey),
    icon: raw.icon,
    sub: _t(raw.subKey),
    accentColor: raw.accentColor,
    grades: raw.grades.map(function(g) {
      return {
        g: g.g,
        icon: g.icon,
        label: _t(g.labelKey),
        count: _t(g.countKey),
        available: g.available
      };
    })
  };
}

// Keep _semesterConfig as a callable — used internally
var _semesterConfig_orig = _semesterConfig; // alias

function _gradeLabel(g) {
  var keys = { 5:'grade.5', 6:'grade.6', 7:'grade.7', 8:'grade.8', 9:'grade.9' };
  return _t(keys[g] || ('grade.' + g));
}
var _gradeLabels = {
  get 5() { return _gradeLabel(5); },
  get 6() { return _gradeLabel(6); },
  get 7() { return _gradeLabel(7); },
  get 8() { return _gradeLabel(8); },
  get 9() { return _gradeLabel(9); }
};

// ── Render grade buttons inside grade-picker based on active semester ──
function renderGradeButtons(sem) {
  var cfg = _semesterConfig(sem);
  if (!cfg) return;
  var list = document.getElementById('grade-buttons-list');
  if (!list) return;
  list.innerHTML = '';
  cfg.grades.forEach(function(g) {
    var avail = g.available;
    var isLtr = (typeof i18n !== 'undefined') && i18n.getCurrentLanguage() !== 'ar';
    var btn = document.createElement('button');
    btn.style.cssText = 'width:100%;padding:20px 24px;border-radius:16px;' +
      'border:2px solid ' + (avail ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.05)') + ';' +
      'background:var(--bg-card,#fff);font-family:Tajawal,Inter,sans-serif;font-size:19px;font-weight:700;' +
      'color:' + (avail ? 'var(--text-heading,#1A2330)' : '#B0BAC5') + ';' +
      'cursor:' + (avail ? 'pointer' : 'not-allowed') + ';' +
      'text-align:' + (isLtr ? 'left' : 'right') + ';display:flex;align-items:center;gap:14px;' +
      'direction:' + (isLtr ? 'ltr' : 'rtl') + ';' +
      'box-shadow:0 2px 8px rgba(0,0,0,0.05);' +
      'transition:box-shadow 0.2s,transform 0.2s;' +
      'opacity:' + (avail ? '1' : '0.55') + ';';
    var marginAuto = isLtr ? 'margin-left:auto' : 'margin-right:auto';
    btn.innerHTML =
      '<span style="font-size:28px">' + g.icon + '</span>' +
      '<span>' + g.label + '</span>' +
      '<span style="' + marginAuto + ';font-size:13px;color:' + (avail ? '#888' : '#B0BAC5') + ';font-weight:400;display:flex;align-items:center;gap:6px">' +
        (avail ? '' : '<span style="font-size:10px;background:rgba(0,0,0,0.06);padding:2px 8px;border-radius:10px;">🔒</span>') +
        g.count +
      '</span>';
    if (avail) {
      btn.onmouseover = function() { this.style.boxShadow='0 6px 20px rgba(0,0,0,0.12)'; this.style.transform='translateY(-2px)'; };
      btn.onmouseout  = function() { this.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)'; this.style.transform=''; };
      btn.onclick = function() { pickGrade(g.g); };
    } else {
      btn.onclick = function() {
        buddySay && buddySay(_t('grade.soon.buddy'), 4000);
      };
    }
    list.appendChild(btn);
  });
}

// ── Update grade-picker banner to reflect active semester ──
function _updateGradePickerBanner(sem) {
  var cfg = _semesterConfig(sem);
  if (!cfg) return;
  var icon = document.getElementById('gp-sem-icon');
  var label = document.getElementById('gp-sem-label');
  var sub = document.getElementById('gp-sem-sub');
  var bc = document.getElementById('gp-bc-sem');
  var banner = document.getElementById('grade-picker-banner');
  if (icon)   icon.textContent   = cfg.icon;
  if (label)  label.textContent  = cfg.label;
  if (sub)    sub.textContent    = cfg.sub + ' · ' + _t('grade.title');
  if (bc)     bc.textContent     = cfg.label;
  if (banner) {
    var c = sem === 1 ? 'rgba(212,144,26,' : 'rgba(26,143,168,';
    banner.style.background = c + '0.06)';
    banner.style.borderColor = c + '0.18)';
  }
  // Re-render grade buttons with translated labels
  renderGradeButtons(sem);
}

// ── Update app breadcrumb ──
function _updateAppBreadcrumb(gradeNum) {
  var sem = window._activeSemester;
  var cfg = _semesterConfig(sem) || _semesterConfig(2);
  var bcSem = document.getElementById('bc-semester');
  var bcGrade = document.getElementById('bc-grade');
  if (bcSem) bcSem.textContent = cfg ? cfg.label : '';
  if (bcGrade) bcGrade.textContent = _gradeLabel(gradeNum) || _t('bc.grade');
}

// ══ MAIN NAVIGATION FUNCTIONS ══

function openApp() {
  var landing = document.getElementById('landing');
  var semPicker = document.getElementById('semester-picker');
  landing.style.setProperty('display', 'none', 'important');
  semPicker.style.display = 'flex';
  setTimeout(_updateFooterVisibility, 50);
}

function pickSemester(sem) {
  window._activeSemester = sem;
  var semPicker = document.getElementById('semester-picker');
  var gradePicker = document.getElementById('grade-picker');
  semPicker.style.display = 'none';
  _updateGradePickerBanner(sem);
  gradePicker.style.display = 'flex';
  setTimeout(_updateFooterVisibility, 50);
}

function backToSemesterPicker() {
  var gradePicker = document.getElementById('grade-picker');
  var semPicker = document.getElementById('semester-picker');
  gradePicker.style.display = 'none';
  semPicker.style.display = 'flex';
  setTimeout(_updateFooterVisibility, 50);
}

function goHomePicker() {
  // Legacy alias — now goes back to semester picker
  backToSemesterPicker();
}

function pickGrade(g) {
  window._activeGrade = g;
  document.getElementById('grade-picker').style.display = 'none';
  const app = document.getElementById('app');
  app.style.display = 'flex';
  app.classList.add('open');
  document.body.classList.add('app-mode');
  switchGrade(g);
  _updateAppBreadcrumb(g);
  var ca = document.getElementById('content-area');
  if (ca) ca.scrollTop = 0;
  var _bw = document.getElementById('buddy-wrap');
  var _br = document.getElementById('buddy-restore-btn');
  var _bh = ''; try{_bh=localStorage.getItem('bayyin-buddy-hidden');}catch(e){}
  if(_bh !== '1'){ if(_bw){_bw.classList.add('visible');_bw.classList.remove('hidden');} }
  else { if(_br) _br.classList.add('show'); }
  setTimeout(function(){ buddySay && buddySay('أهلاً بك في بيّن! 🚀 اختر وحدة وسأعطيك تلميحاً عنها!', 5000); }, 600);
  setTimeout(_updateFooterVisibility, 80);
}

function goHome() {
  // From app → back to grade picker (within same semester)
  closeSim();
  const app = document.getElementById('app');
  app.style.display = 'none';
  app.classList.remove('open');
  document.body.classList.remove('app-mode');
  _updateGradePickerBanner(window._activeSemester || 2);
  document.getElementById('grade-picker').style.display = 'flex';
  var _bw = document.getElementById('buddy-wrap');
  var _br = document.getElementById('buddy-restore-btn');
  if(_bw){_bw.classList.remove('visible');_bw.classList.add('hidden');}
  if(_br) _br.classList.remove('show');
  hideBubble && hideBubble();
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
  document.getElementById('semester-picker').style.display = 'none';
  var landing = document.getElementById('landing');
  landing.style.removeProperty('display');
  var _bw = document.getElementById('buddy-wrap');
  var _br = document.getElementById('buddy-restore-btn');
  if(_bw){_bw.classList.remove('visible');_bw.classList.add('hidden');}
  if(_br) _br.classList.remove('show');
  hideBubble && hideBubble();
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
  window._activeGrade = g;
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
  // Update breadcrumb grade label
  _updateAppBreadcrumb(g);
  // Hide unit breadcrumb when switching grade
  var bcArrow = document.getElementById('bc-grade-arrow');
  var bcUnit  = document.getElementById('bc-unit');
  if(bcArrow) bcArrow.style.display = 'none';
  if(bcUnit)  bcUnit.style.display  = 'none';
  // When switching to grade 9, init subject tabs
  if(g === 9) {
    switchG9Subject(window._g9ActiveSubject || 'chem');
  }
}

function switchG9Subject(subject) {
  window._g9ActiveSubject = subject;
  // Defensive render: if physics panel is empty for any reason, rebuild its content.
  if(subject === 'phys'){
    var physPanel = document.getElementById('g9-phys');
    if(physPanel){
      var hasUnits = physPanel.querySelector('.unit-card');
      var hasSims = physPanel.querySelector('#sims-g9phys11');
      if(!hasUnits || !hasSims){
        var unitsGrid = physPanel.querySelector('.units-grid');
        if(unitsGrid){
          unitsGrid.innerHTML = `
            <div class="unit-card" onclick="openUnit('g9phys11', this)">
              <div class="unit-num-badge c-green">١١</div>
              <div>
                <div class="unit-title">مصادر الطاقة</div>
                <div class="unit-topics">مصادر الطاقة · المتجددة وغير المتجددة · الكفاءة · القدرة</div>
                <div class="unit-pill avail">🔓 متاح</div>
              </div>
            </div>
          `;
        }
        if(!hasSims){
          var oldWrap = physPanel.querySelector('#sims-g9phys11');
          if(oldWrap) oldWrap.remove();
          var wrap = document.createElement('div');
          wrap.className = 'sims-wrap';
          wrap.id = 'sims-g9phys11';
          wrap.style.marginTop = '28px';
          wrap.innerHTML = `
            <div class="sims-grid">
              <div class="sim-card" onclick="openSim('g9energy')">
                <div class="sim-thumb t7">⚡</div>
                <div class="sim-body">
                  <div class="sim-num">١١-١ · موارد الطاقة</div>
                  <div class="sim-name">صنّف المصادر واحسب الكفاءة</div>
                  <div class="sim-desc">اسحب مصادر الطاقة لتصنيفها (متجددة/غير متجددة) ثم جرّب حاسبة الكفاءة والطاقة المفيدة</div>
                </div>
                <div class="sim-footer"><button class="sim-btn">▶ ابدأ الاستقصاء</button></div>
              </div>
            </div>
          `;
          physPanel.appendChild(wrap);
        }
      }
    }
  }
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
    g9chem10:'الوحدة العاشرة 🌍 — الأرض تحت المجهر! استكشف الهواء والتلوّث والمناخ والحجر الجيري.',
    g9phys11:'الوحدة الحادية عشرة ⚡ — استكشف جميع مصادر الطاقة وقارنها واحسب الكفاءة والقدرة.',
    g9phys12:'الوحدة الثانية عشرة 🪞 — طبّق قانون الانعكاس وارسم مسارات الأشعة.',
    g9phys13:'الوحدة الثالثة عشرة 🔎 — جرّب انكسار الضوء بين الأوساط واكتشف أثر معامل الانكسار.',
    g9phys14:'الوحدة الرابعة عشرة 🔬 — حرّك الجسم أمام العدسة وشاهد كيف تتكون الصورة.',
    g9phys15:'الوحدة الخامسة عشرة ⚡ — استكشف التيار الكهربائي وفرق الجهد والقوة الدافعة الكهربائية والقدرة.',
    g9phys16:'الوحدة السادسة عشرة 🔩 — اكتشف المقاومة الكهربائية وكيف تتأثر بطول السلك ومقطعه ونوع المادة.',
    g9bio7:'الوحدة السابعة 🌿 — النبات مصنع سكر يعمل بالشمس! الكلوروفيل يلتقط الضوء ويحوّل CO₂ وماء إلى جلوكوز.',
    g9bio8:'الوحدة الثامنة 🍽️ — الطعام يمر برحلة طويلة قبل أن تستفيد منه خلاياك! استكشف الجهاز الهضمي خطوة بخطوة.',
    g9bio9:'الوحدة التاسعة 🌱 — الماء يتحرك من الجذر للأوراق! اكتشف أوعية الخشب واللحاء والنتح.',
    g9bio10:'الوحدة العاشرة 🌿 — النبات لا يملك عيناً لكنه يرى الضوء! اكتشف الأوكسين وسر انحناء السيقان.'
  };
  if(hints[id]) setTimeout(function(){ buddySay && buddySay(hints[id], 6000); }, 400);
  // Update breadcrumb unit segment
  var bcArrow = document.getElementById('bc-grade-arrow');
  var bcUnit  = document.getElementById('bc-unit');
  var unitTitleEl = el && el.querySelector('.unit-title');
  if(bcArrow && bcUnit && unitTitleEl) {
    bcUnit.textContent = unitTitleEl.textContent.trim();
    bcArrow.style.display = '';
    bcUnit.style.display  = '';
  }
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
  g5mirror:      { title: '٢-٤ · المرايا', badge: '🪞 5', tabs: ['المرآة المستوية 🪞'] },
  g5behindyou:   { title: '٣-٤ · رؤية ما خلفك', badge: '🔍 5', tabs: ['مرايا متعددة 🔄'] },
  g5reflection:  { title: '٤-٤ · الأسطح العاكسة', badge: '✨ 5', tabs: ['مقارنة الأسطح 🔬', 'قياس الانعكاس 📊'] },
  g5lightdir:    { title: '٥-٤ · تغيير اتجاه الضوء', badge: '🔦 5', tabs: ['هندسة الضوء 🎯'] },
  // ── الصف الخامس — الوحدة ٥: الظلال ──
  g5shadowsize:  { title: '١-٥ · كيف يتشكّل الظل', badge: '🌑 5', tabs: ['تجربة الأنابيب 🔦', 'استقصاء الظل 📐'] },
  g5transparent: { title: '٢-٥ · المواد والضوء', badge: '🔬 5', tabs: ['اختبار المواد 🧪'] },
  g5silhouette:  { title: '٣-٥ · دمى الظل', badge: '🎭 5', tabs: ['عرض دمى الظل 🤚'] },
  g5shadowfactor:{ title: '٤-٥ · ما الذي يؤثر على حجم الظل؟', badge: '📐 5', tabs: ['استقصاء الظل 📏'] },
  g5sundial:     { title: '٥-٥ · العصا الشمسية', badge: '🌞 5', tabs: ['العصا الشمسية ☀️'] },
  g5lightintensity:{ title: '٦-٥ · قياس شدة الضوء', badge: '☀️ 5', tabs: ['مقياس الإضاءة 📊'] },
  g5rainbow:        { title: '٧-٥ · قوس المطر والمنشور', badge: '🌈 5', tabs: ['تجربة المنشور 🔬', 'قطرة المطر 💧'] },
  // ── الصف الخامس — الوحدة ٦: حركات الأرض ──
  g5earthsun:    { title: '١-٦ · الشمس والأرض والقمر', badge: '🌍 5', tabs: ['النظام الشمسي', 'مسارات الكواكب'] },
  g5sunseeming:  { title: '٢-٦ · هل تتحرك الشمس؟', badge: '☀️ 5', tabs: ['استكشف المنظور 🕹️', 'الليل والنهار 🌍'] },
  g5rotation:    { title: '٣-٦ · دوران الأرض', badge: '🔄 5', tabs: ['الليل والنهار 🌓'] },
  g5sunrise:     { title: '٤-٦ · الشروق والغروب', badge: '🌅 5', tabs: ['ألوان السماء 🎨'] },
  g5earthorbit:  { title: '٦-٥ · دوران الأرض حول الشمس', badge: '🌍 5', tabs: ['الفصول الأربعة 🍂'] },
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
  g6gravity:   { title: '٤-١ · الكتلة والوزن', badge: '⚖️ 6', tabs: ['الكتلة والوزن 🌍'] },
  g6forces2:   { title: '٤-٢ · مخطط القوى', badge: '🏹 6', tabs: ['مخطط القوى 🏹'] },
  g6forces1:   { title: '٤-٣ · القوى المتوازنة وغير المتوازنة', badge: '💪 6', tabs: ['القوى المتوازنة وغير المتوازنة 💪'] },
  g6friction:  { title: '٤-٤ · الاحتكاك', badge: '🔥 6', tabs: ['الاحتكاك 🔥'] },
  g6frictionInquiry: { title: '٤-٥ · استقصاء الاحتكاك', badge: '🔬 6', tabs: ['العوامل المؤثرة 🔬', 'الاحتكاك الجزيئي 🔬'] },
  g6airresist: { title: '٤-٦ · مقاومة الهواء', badge: '🪂 6', tabs: ['السقوط الحر 🪂', 'القوى المتوازنة ⚡', 'استقصاء المظلة 🔬'] },
  g6work:      { title: '٤-٥ · الشغل المبذول', badge: '⚽ 6', tabs: ['استقصاء الشغل ⚽', 'احسب الشغل 🧮', 'ماذا تستنتج؟ 💡'] },
  // وحدة الكهرباء — الصف السادس
  g6conductors:     { title: '5-1 · ما المواد الموصِّلة للكهرباء؟', badge: '⚡ 6', tabs: ['مختبر الاختبار 🔬', 'جدول النتائج 📋'] },
  g6waterconductor: { title: '5-2 · هل الماء يوصِّل الكهرباء؟', badge: '⚡ 6', tabs: ['اسحب الملعقة وجرّب! 💧🧂'] },
  g6bodyconductor:  { title: '5-2b · هل أجسامنا توصّل الكهرباء؟', badge: '⚡ 6', tabs: ['خطر الصعقة الكهربائية ⚠️'] },
  g6metalconductor: { title: '5-3 · المعادن والكهرباء', badge: '⚡ 6', tabs: ['قياس التيار بالأميتر ⚡', 'مقارنة المعادن 🔩'] },
  g6circuit:        { title: '5-5 · مختبر الدوائر الكهربائية', badge: '⚡ 6', tabs: ['ابنِ دائرتك 🔌', 'رموز الدائرة 📐'] },
  g6circuitchange:  { title: '5-6 · تغيير مكونات الدائرة', badge: '⚡ 6', tabs: ['إضافة مصابيح 💡', 'إضافة خلايا 🔋'] },
  g6voltage:        { title: '5-7 · الجهد الكهربائي', badge: '⚡ 6', tabs: ['المصباح 💡', 'الطنان 🔔', 'الجرس 🔔', 'ماذا تستنتج؟ 🧠'] },
  g6wirelength:     { title: '5-8 · طول وسُمك السلك', badge: '⚡ 6', tabs: ['طول السلك 📏', 'سُمك السلك 🔗'] },
  g6battery:        { title: '5-9 · كيف اخترع العلماء البطاريات؟', badge: '🔋 6', tabs: ['بطارية بغداد 🏺', 'اكتشاف جلفاني 🐸', 'عمود فولتا 🔋'] },
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
  magfield:     { title: 'نشاط 3-11 · المجال المغناطيسيّ', badge: '🧲 8', tabs: ['خطوط المجال 🔮', 'بوصلة تفاعلية 🧭', 'المجال الأرضي 🌍'] },
  electromagnet:{ title: 'نشاط 4-11 · الكهرومغناطيس', badge: '🧲 8', tabs: ['اصنع مغناطيساً ⚡', 'قوة الكهرومغناطيس 💪'] },
  staticelec:   { title: 'نشاط 6-11 · الكهرباء الساكنة', badge: '⚡ 8', tabs: ['شحن الأجسام ⚡', 'التجاذب والتنافر 🔄', 'التنافر الكهربائي 📏'] },
  circuit8:     { title: 'نشاط 9-11 · الدائرة الكهربائية', badge: '⚡ 8', tabs: ['دائرة على التوالي 🔌', 'دائرة على التوازي 🔀', 'استقصاء الأميتر والإضاءة 🔍'] },
  magcompare:   { title: 'نشاط 2-11 · مقارنة أنواع المغناطيس', badge: '🧲 8', tabs: ['قياس القوة 📏', 'اختبار المواد 🔬'] },
  emstronger:   { title: 'نشاط 5-11 · تحسين الكهرومغناطيس', badge: '🧲 8', tabs: ['أثر اللفّات 🔁', 'أثر التيار ⚡'] },
  charges:      { title: 'نشاط 7-11 · الشحنة الموجبة والسالبة', badge: '⚡ 8', tabs: ['قياس الشحنة ⊕', 'تجاذب وتنافر 🔄'] },
  electrons:    { title: 'نشاط 8-11 · حركة الإلكترونات', badge: '⚡ 8', tabs: ['الشحن بالاحتكاك 🔀', 'الإلكترونات داخل الذرة ⚛️'] },
  cellvoltage:  { title: 'نشاط 10-11 · توصيل الخلايا', badge: '⚡ 8', tabs: ['الخلايا على التوالي 🔋', 'الجهد والتيار 📊'] },
  resistance:   { title: 'نشاط 11-11 · المقاومة الكهربائية', badge: '⚡ 8', tabs: ['المقاومة الثابتة 〰️', 'المقاومة المتغيرة 🎛️'] },
  parallel12:   { title: 'نشاط 12-11 · التوصيل على التوازي', badge: '⚡ 8', tabs: ['الدائرة على التوازي 🔀', 'مقارنة التوالي والتوازي ⚖️'] },
  forces:      { title: 'نشاط 1-9 · القُوى', badge: '9-1', tabs: ['أنواع القوى 💪', 'مخطط القوى 🏹', 'محصلة القوى 🏆'] },
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
  repro_gametes:      { title: 'نشاط 1-10 · الأمشاج', badge: '🧬 8', tabs: ['البويضة والحيوان المنوي 🔬', 'مطابقة الكروموسومات 🎮'] },
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
  // ── الصف التاسع — أحياء الوحدة السابعة: التغذية في النبات ──
  g9bio7n1: { title: 'نشاط ١-٧ · أنواع التغذية', badge: '🌱 أحياء ٩', tabs: ['التغذية الذاتية والغيرية 🌿', 'المواد العضوية وغير العضوية 🧬', 'صنِّف: مَن يصنع غذاءه؟ 🎯'] },
  g9bio7n2: { title: 'نشاط ٢-٧ · التمثيل الضوئي', badge: '☀️ أحياء ٩', tabs: ['معادلة التمثيل الضوئي ☀️', 'الكلوروفيل والطاقة الضوئية 🍃', 'شروط التمثيل الضوئي ✅'] },
  g9bio7n3: { title: 'نشاط ٣-٧ · تركيب ورقة النبات', badge: '🍃 أحياء ٩', tabs: ['طبقات الورقة 🔬', 'الثغور والخلايا الحارسة 🚪', 'الأوعية الوعائية 🌿'] },
  g9bio7n4: { title: 'نشاط ٤-٧ · الكشف عن الكلوروفيل', badge: '🔬 أحياء ٩', tabs: ['الكلوروفيل وامتصاص الضوء 🌈', 'الضوء وإنتاج النشا 💡', 'تجربة: الورقة الخضراء وغير الخضراء 🧪'] },
  g9bio7n5: { title: 'نشاط ٥-٧ · الكشف عن النشا', badge: '🧪 أحياء ٩', tabs: ['اختبار اليود للنشا 🟤', 'خطوات التجربة المخبرية 🔬', 'تفسير النتائج 📊'] },
  g9bio7n6: { title: 'نشاط ٦-٧ · التمثيل الضوئي في نبات مائي', badge: '💧 أحياء ٩', tabs: ['فقاعات الأكسجين وشدة الضوء 💧', 'رسم بياني: المسافة مقابل المعدل 📈', 'استنتج العلاقة 🔍'] },
  g9bio7n7: { title: 'نشاط ٧-٧ · تأثير شدة الضوء', badge: '💡 أحياء ٩', tabs: ['شدة الضوء ومعدل التمثيل 💡', 'منحنى التشبع الضوئي 📈', 'مقارنة مصادر الضوء ⚡'] },
  g9bio7n8: { title: 'نشاط ٨-٧ · تأثير درجة الحرارة', badge: '🌡️ أحياء ٩', tabs: ['درجة الحرارة ومعدل التمثيل 🌡️', 'الدرجة المثلى للإنزيمات 🔬', 'قارن: ١٠°م مقابل ٨٠°م ⚖️'] },
  g9bio7n9: { title: 'موضوع ٤-٧ · الأملاح المعدنية', badge: '🌿 أحياء ٩', tabs: ['النيترات ونقص النيتروجين 🍃', 'الماغنيسيوم ونقص الكلوروفيل 💚', 'قارن: نبات طبيعي ونبات ناقص 🔬'] },
  g9bio7n10: { title: 'موضوع ٤-٧ · نقل السكروز', badge: '🍬 أحياء ٩', tabs: ['لماذا نقل الجلوكوز إلى سكروز؟ 🧬', 'أنابيب اللحاء وتوزيع السكر 🌿', 'مصير الجلوكوز في النبات 🔄'] },
  // ── الصف التاسع — أحياء الوحدة الثامنة: الهضم في الإنسان ──
  g9bio8n1: { title: 'نشاط ١-٨ · مراحل الهضم', badge: '🍽️ أحياء ٩', tabs: ['مراحل الهضم الأربع 🔄', 'رحلة الطعام في الحيوانات 🦊', 'صنِّف: أي مرحلة؟ 🎯'] },
  g9bio8n2: { title: 'نشاط ٢-٨ · الهضم الميكانيكي والكيميائي', badge: '⚙️ أحياء ٩', tabs: ['الهضم الميكانيكي 🦷', 'الهضم الكيميائي 🧪', 'قارن بين النوعين ⚖️'] },
  g9bio8n3: { title: 'نشاط ٣-٨ · القناة الهضمية', badge: '🔬 أحياء ٩', tabs: ['أجزاء القناة الهضمية 🗺️', 'وظيفة كل جزء 📋', 'تتبَّع الطعام خطوة بخطوة 🚶'] },
  g9bio8n4: { title: 'نشاط ٤-٨ · الأنزيمات الهضمية', badge: '🧪 أحياء ٩', tabs: ['الأميليز — هضم النشا 🌾', 'البروتييز — هضم البروتين 🐟', 'الليبييز — هضم الدهون 🧈'] },
  g9bio8n5: { title: 'نشاط ٥-٨ · الاستحلاب', badge: '💧 أحياء ٩', tabs: ['العُصارة الصفراوية 🟡', 'الاستحلاب: تفتيت الدهون 💧', 'دور البنكرياس 🫁'] },
  g9bio8n6: { title: 'نشاط ٦-٨ · الخملات والامتصاص', badge: '🌿 أحياء ٩', tabs: ['تركيب الخملة 🔬', 'الزغيبات وتضاعف السطح 📐', 'ماذا يمتص كل وعاء؟ 🔀'] },
  g9bio8n7: { title: 'نشاط ١-٨ · محاكاة الديلسة', badge: '🔭 أحياء ٩', tabs: ['مبدأ الديلسة 🎓', 'تجربة النشا والجلوكوز 🧫', 'فسِّر النتائج 📊'] },
  g9bio8n8: { title: 'نشاط ٨-٨ · التمثيل الغذائي', badge: '⚡ أحياء ٩', tabs: ['مسار الجلوكوز في الجسم 🍬', 'مسار الأحماض الأمينية 🔗', 'مسار الدهون والكبد 🏥'] },
  // ── الصف التاسع — أحياء الوحدة التاسعة: النقل في النبات ──
  g9bio9n1: { title: 'نشاط ١-٩ · أوعية الخشب واللحاء', badge: '🌱 أحياء ٩', tabs: ['تركيب وعاء الخشب Xylem 🔬', 'تركيب أنابيب اللحاء Phloem 🔬'] },
  g9bio9n2: { title: 'نشاط ٢-٩ · رحلة الماء من التربة إلى الخشب', badge: '💧 أحياء ٩', tabs: ['الشعيرات الجذرية والأسموزية 💧', 'المسار الجانبي عبر القشرة 🌿'] },
  g9bio9n3: { title: 'نشاط ٣-٩ · النتح وتيار النتح', badge: '🍃 أحياء ٩', tabs: ['عملية النتح والثغور 🌿', 'عوامل تؤثر على معدّل النتح 🌡️'] },
  g9bio9n4: { title: 'نشاط ٤-٩ · جهاز البوتومتر', badge: '📏 أحياء ٩', tabs: ['كيف يعمل البوتومتر؟ 🔬', 'قِس معدّل النتح في ظروف مختلفة 📊'] },
  g9bio9n5: { title: 'نشاط ٥-٩ · نقل الغذاء — الانتقال', badge: '🍬 أحياء ٩', tabs: ['المصدر والمصبّ (Source & Sink) 🌿', 'مسار السكروز في اللحاء 🔄'] },
  // ── الصف التاسع — الوحدة ١٠: التحكم والتنظيم في النبات ──
  g9bio10n1: { title: 'نشاط ١-١٠ · استجابة السيقان للضوء', badge: '🌿 أحياء ٩', tabs: ['إعداد الأطباق الثلاثة 🌱', 'مراقبة النمو (اليوم ٧) 📊', 'التحليل والأسئلة 🧠'] },
  g9bio10n2: { title: 'نشاط ٢-١٠ · استجابة الجذور للجاذبية', badge: '🌱 أحياء ٩', tabs: ['اختاري وضع البذرة 🔄', 'شاهدي النمو 👀', 'سجّلي الاستنتاجات 📋'] },
  g9bio10n3: { title: 'نشاط ٣-١٠ · هرمون الأوكسين IAA', badge: '🔬 أحياء ٩', tabs: ['توزيع الأوكسين وانحناء الساق ☀️', 'تجربة الأصيصات الثلاثية 🧪', 'أسئلة التحليل 🧠'] },
  g9bio10n4: { title: 'نشاط ٤-١٠ · منطقة الحساسية الضوئية', badge: '📍 أحياء ٩', tabs: ['تغطية أجزاء الساق 🌿', 'مقارنة النتائج 📊', 'الاستنتاج النهائي 💡'] },
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
  ,
  // ── الصف التاسع — فيزياء: الوحدة 11 (مصادر الطاقة) ──
  g9energymix:{ title: '١١-١ · تصنيف مصادر الطاقة', badge: '⚡ 9', tabs: ['متجددة/غير متجددة ♻️', 'مزيج الطاقة 🧩'] },
  g9solar:   { title: '١١-٢ · الطاقة الشمسية', badge: '☀️ 9', tabs: ['زاوية السقوط ☀️', 'القدرة والكفاءة 📈'] },
  g9wind:    { title: '١١-٣ · طاقة الرياح', badge: '💨 9', tabs: ['سرعة الرياح 💨', 'مزرعة رياح 🌀'] },
  g9hydro:   { title: '١١-٤ · الطاقة المائية والمدّ والجزر', badge: '🌊 9', tabs: ['الطاقة المائية 💧', 'المدّ والجزر 🌙'] },
  g9fossil:  { title: '١١-٥ · الوقود الأحفوري والنووي', badge: '🛢️ 9', tabs: ['مقارنة المصادر ⛽', 'الأثر البيئي 🌍'] },
  g9efficiency:{ title: '١١-٦ · كفاءة الطاقة', badge: '📈 9', tabs: ['حساب الكفاءة 🔢', 'تقليل الفاقد ♻️'] },
  g9refl:   { title: '١٢-١ · قانون الانعكاس', badge: '🪞 9', tabs: ['قانون الانعكاس 📐', 'مخطط الأشعة 🎯'] },
  g9mirror: { title: '١٢-٢ · صورة المرآة المستوية', badge: '🕯️ 9', tabs: ['خصائص الصورة 🔍', 'الانعكاس الجانبي ↔️'] },
  g9rayrefl:{ title: '١٢-٣ · نشاط ١-١٢ · مخطط الأشعة', badge: '✏️ 9', tabs: ['ارسم مخطط الأشعة 📐', 'زوايا مختلفة 🎯'] },
  g9refltype:{ title: '١٢-٤ · أنواع الانعكاس', badge: '🌊 9', tabs: ['منتظم ومتشتت 🔦', 'تطبيقات عملية 💡'] },
  g9refract:{ title: '١٣-١ · قانون سنيل', badge: '🔎 9', tabs: ['قانون سنيل 📐', 'الزاوية الحرجة 🌈'] },
  g9refractN:{ title: '١٣-٢ · معامل الانكسار', badge: '💎 9', tabs: ['قِس المعامل 🔢', 'قارن المواد 🧪'] },
  g9tir:    { title: '١٣-٣ · الانعكاس الكلي الداخلي', badge: '🌈 9', tabs: ['استقصاء الزاوية الحرجة 🔬', 'كيف يعمل TIR؟ 💡'] },
  g9fiber:  { title: '١٣-٤ · الألياف البصرية', badge: '🔬 9', tabs: ['الليف البصري 💡', 'تطبيقات TIR 📡'] },
  g9lens:   { title: 'الوحدة ١٤ · العدسات المحدّبة الرقيقة', badge: '🔬 9', tabs: ['أنواع العدسات 🧪', 'تكوّن الصورة 🎯', 'نشاط ١-١٤ 📐', 'العدسة المكبِّرة 🔍'] },
  g9raydiagram:{ title: '١٤-٢ · مخطط الأشعة خطوة بخطوة', badge: '✏️ 9', tabs: ['الجسم بعيد (d > 2f) 🎯', 'الجسم قريب (d < f) 🔍'] },
  g9current: { title: 'نشاط ١-١٥ · التيار الكهربائي والشحنة', badge: '⚡ 9', tabs: ['الدائرة والإلكترونات 🔌', 'الشحنة والزمن ⏱'] },
  g9voltage: { title: 'نشاط ٢-١٥ · فرق الجهد والقوة الدافعة', badge: '🔋 9', tabs: ['قياس الجهد والـ emf 📏', 'الطاقة والشحنة 🔋'] },
  g9ohm:    { title: 'نشاط ٣-١٥ · قانون أوم والمقاومة', badge: '📐 9', tabs: ['منحنى I–V 📈', 'مقاوم أومي vs مصباح 💡'] },
  g9power15:{ title: 'نشاط ٤-١٥ · القدرة والطاقة الكهربائية', badge: '💡 9', tabs: ['حساب القدرة P=IV ⚡', 'الطاقة والتكلفة 💰'] },
  g9ohmslaw:{ title: 'نشاط ١-١٦ · قياس المقاومة R=V/I', badge: '🔩 9', tabs: ['دائرة القياس 🔬', 'جدول البيانات 📋'] },
  g9wireres:{ title: 'نشاط ٢-١٦ · عوامل المقاومة السلكية', badge: '〰️ 9', tabs: ['الطول والمقطع 📏', 'نوع المادة ⚗️'] },
  g9ivchar: { title: 'نشاط ٣-١٦ · خاصية I–V للمكونات', badge: '📈 9', tabs: ['المقاوم الأومي 〰️', 'المصباح الكهربائي 💡'] }
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
  g6bodyconductor: {
    q: 'لماذا يُعدّ لمس الكهرباء المكشوفة خطيراً جداً على الإنسان؟',
    opts: ['لأن جسم الإنسان موصِّل للكهرباء بسبب الماء والأملاح فيه','لأن الجلد معزول تماماً','لأن الكهرباء لا تمر عبر الجسم','لأن الجسم مصنوع من بلاستيك'],
    ans: 0,
    fb: '✅ جسم الإنسان يحتوي على نسبة عالية من الماء والأملاح المعدنية، مما يجعله موصلاً جيداً للكهرباء. لذا فإن لمس الكهرباء المكشوفة يمكن أن يُسبب صعقة كهربائية قاتلة!'
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
  g6voltage: {
    q: 'لماذا لا يعمل الجرس الكهربائي ببطارية واحدة (1.5 V)؟',
    opts: ['لأن البطارية معطوبة','لأن الجرس يحتاج جهداً أعلى (6V) مما توفره بطارية واحدة','لأن الأسلاك غير موصولة','لأن الجرس يعمل بالتيار المتردد فقط'],
    ans: 1,
    fb: '✅ كل جهاز كهربائي يحتاج حداً أدنى من الجهد ليعمل. الجرس يحتاج 6V، وبطارية واحدة تعطي 1.5V فقط — لذا يجب ربط 4 خلايا على التوالي للحصول على الجهد الكافي.'
  },
  g6wirelength: {
    q: 'أيّ السلكين له مقاومة أكبر في دائرة كهربائية؟',
    opts: ['السلك الرفيع القصير','السلك الطويل الرفيع','السلك السميك القصير','السلك السميك الطويل'],
    ans: 1,
    fb: '✅ المقاومة تتناسب طردياً مع الطول وعكسياً مع مساحة المقطع. السلك الطويل الرفيع له أكبر مقاومة لأن كلا العاملين (الطول الكبير والسُمك الصغير) يزيدان المقاومة.'
  },
  g6battery: {
    q: 'ما الذي أثبته اكتشاف فولتا عن تيار جلفاني؟',
    opts: ['أن التيار يأتي من أعصاب الضفدع فقط','أن التيار ينتج من تلامس معدنين مختلفين مع سائل موصِّل','أن الضفدع يولّد الكهرباء من جسمه','أن الماء وحده يكفي لتوليد الكهرباء'],
    ans: 1,
    fb: '✅ أثبت فولتا أن التيار الكهربائي ينتج من التفاعل الكيميائي بين معدنين مختلفين (نحاس وخارصين) مع سائل موصِّل — وليس من أعصاب الضفدع كما اعتقد جلفاني.'
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
  g6frictionInquiry: {
    q: 'ما العامل الذي يؤثر على قوة الاحتكاك بين سطحين؟',
    opts: ['لون الجسم','طبيعة السطح وخشونته','حجم الجسم فقط','سرعة الجسم فقط'],
    ans: 1,
    fb: '✅ خشونة السطح هي العامل الرئيسي — السطح الخشن يعطي احتكاكاً أكبر. الوزن يؤثر أيضاً لكن المساحة لا تؤثر تقريباً!'
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
    fb: '✅ الاحتكاك ينقل إلكترونات من البالون للشعر، فيصبح البالون مشحوناً موجباً والشعر سالباً، وتتجاذب الأجسام غير الفلزية نحوه.'
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
  },

  // ══ الوحدة الثامنة — الهضم في الإنسان ══
  g9bio8n1_0: { q:'ما المصطلح العلمي لدخول الطعام إلى الجسم عبر الفم؟', opts:['الامتصاص','الابتلاع','الهضم الكيميائي','التبرّز'], ans:1, fb:'✅ الابتلاع (Ingestion) هو إدخال الطعام والشراب عبر الفم إلى القناة الهضمية.' },
  g9bio8n1_1: { q:'في أي خطوة ينتقل الطعام المهضوم من الأمعاء إلى الدم؟', opts:['الهضم الكيميائي','التبرّز','الامتصاص','الابتلاع'], ans:2, fb:'✅ الامتصاص (Absorption): انتقال الجزيئات الصغيرة عبر جدار الأمعاء الدقيقة إلى الدم.' },
  g9bio8n1_2: { q:'ماذا يُسمّى طرح الطعام غير المهضوم عبر فتحة الشرج؟', opts:['الامتصاص','الهضم','التبرّز','الابتلاع'], ans:2, fb:'✅ التبرّز (Egestion): طرح الفضلات الصلبة عبر فتحة الشرج — المرحلة الرابعة والأخيرة.' },
  g9bio8n2_0: { q:'أيُّ نوع الهضم يُفكِّك الطعام دون تغيير تركيبه الكيميائي؟', opts:['الهضم الكيميائي','الهضم الميكانيكي','الامتصاص','التمثيل الغذائي'], ans:1, fb:'✅ الهضم الميكانيكي: تقطيع وطحن وعصر الطعام — يُصغِّر الحجم دون أي تغيير كيميائي.' },
  g9bio8n2_1: { q:'ماذا يفعل أنزيم الأميليز؟', opts:['يُفكِّك الدهون','يُحوِّل النشا إلى سكريات بسيطة','يُحوِّل البروتين لأحماض أمينية','يُنتج HCl'], ans:1, fb:'✅ الأميليز يهضم النشا إلى جلوكوز — يبدأ في الفم ويكتمل في الأمعاء الدقيقة.' },
  g9bio8n2_2: { q:'لماذا يعملان معاً؟', opts:['أحدهما يُبطئ الآخر','الميكانيكي يزيد السطح فيُسرِّع الكيميائي','الكيميائي يُصغِّر أولاً','لا يعملان معاً'], ans:1, fb:'✅ الهضم الميكانيكي يُصغِّر الطعام → يُكبِّر السطح المُعرَّض → يُسرِّع عمل الأنزيمات الكيميائية!' },
  g9bio8n3_0: { q:'أين يبدأ الهضم الكيميائي للنشا؟', opts:['المعدة','الأمعاء الدقيقة','الفم','الأمعاء الغليظة'], ans:2, fb:'✅ يبدأ هضم النشا في الفم بواسطة أميليز اللعاب — ويكتمل في الأمعاء الدقيقة.' },
  g9bio8n3_1: { q:'ما وظيفة المعدة في الهضم؟', opts:['امتصاص الماء فقط','إفراز الصفراء','عصر الطعام وإضافة HCl وبروتييز','إتمام الامتصاص'], ans:2, fb:'✅ المعدة: هضم ميكانيكي (عصر) + هضم كيميائي (HCl + بيبسين = بداية هضم البروتين).' },
  g9bio8n3_2: { q:'أين يحدث الامتصاص الرئيسي للغذاء؟', opts:['المعدة','الأمعاء الغليظة','الأمعاء الدقيقة','المريء'], ans:2, fb:'✅ الأمعاء الدقيقة (~5م): تتم فيها الهضم الكامل والامتصاص الرئيسي عبر الخملات.' },
  g9bio8n4_0: { q:'من أين يُفرز أميليز البنكرياس؟', opts:['الكبد','البنكرياس','المعدة','الغدد اللعابية'], ans:1, fb:'✅ أميليز البنكرياس يُفرز من البنكرياس عبر القناة البنكرياسية للأمعاء الدقيقة.' },
  g9bio8n4_1: { q:'ما الناتج النهائي لهضم البروتين؟', opts:['جلوكوز','أحماض دهنية + جليسرول','أحماض أمينية','سكريات بسيطة'], ans:2, fb:'✅ البروتييز يكسر البروتين → أحماض أمينية — اللبنات الأساسية لبناء جميع بروتينات الجسم!' },
  g9bio8n4_2: { q:'لماذا تحتاج الدهون للاستحلاب قبل الليبييز؟', opts:['لأن الليبييز يعمل في القولون','لأن الدهون لا تذوب في الماء','لأن الاستحلاب يُنتج الجلوكوز','لأن الدهون صغيرة جداً'], ans:1, fb:'✅ الدهون لا تذوب في الماء → تتجمع في قطرات كبيرة → الصفراء تُفتِّتها → سطح أكبر للييبييز.' },
  g9bio8n5_0: { q:'أين تُنتج العُصارة الصفراوية وأين تُخزَّن؟', opts:['البنكرياس / الكبد','الكبد / المرارة','المعدة / الأمعاء','الغدد اللعابية / البنكرياس'], ans:1, fb:'✅ العُصارة الصفراوية تُفرزها خلايا الكبد وتُخزَّن في المرارة حتى الحاجة.' },
  g9bio8n5_1: { q:'ما الفرق بين الاستحلاب وعمل الليبييز؟', opts:['كلاهما نفسه','الاستحلاب كيميائي — الليبييز ميكانيكي','الاستحلاب ميكانيكي — الليبييز كيميائي','الاستحلاب يُنتج أحماض أمينية'], ans:2, fb:'✅ الاستحلاب = هضم ميكانيكي (تفتيت القطرات). الليبييز = هضم كيميائي (تحويل الدهن → أحماض دهنية + جليسرول).' },
  g9bio8n5_2: { q:'لماذا تحتوي العُصارة البنكرياسية على بيكربونات الصوديوم؟', opts:['لهضم النشا','لتعديل حموضة الكيموس','لاستحلاب الدهون','لتنشيط اللعاب'], ans:1, fb:'✅ بيكربونات الصوديوم (NaHCO₃) تُعادِل حموضة الكيموس القادم من المعدة لتُهيِّئ البيئة لأنزيمات البنكرياس.' },
  g9bio8n6_0: { q:'ما الوظيفة الرئيسية للخملات؟', opts:['إنتاج الأنزيمات','تخزين الطعام','تضاعف سطح الامتصاص','إنتاج الصفراء'], ans:2, fb:'✅ الخملات تُضاعف السطح الداخلي من ~1م² إلى ~250م² — هذا السطح الهائل يضمن امتصاصاً سريعاً وكاملاً!' },
  g9bio8n6_1: { q:'أين تذهب الأحماض الدهنية بعد امتصاصها؟', opts:['مباشرة للكبد عبر الدم','الشعيرات الدموية','الوعاء اللمفاوي (الكيلوس)','تبقى في خلايا الخملة'], ans:2, fb:'✅ الأحماض الدهنية والجليسرول تُمتص في الوعاء اللمفاوي (الكيلوس) داخل الخملة — ثم ينضم اللمف للدم قرب القلب.' },
  g9bio8n6_2: { q:'أيُّ المواد تُمتص في الشُّعيرات الدموية للخملة؟', opts:['الأحماض الدهنية فقط','الجلوكوز والأحماض الأمينية والأملاح','الدهون والفيتامينات الدهنية','كل شيء عبر اللمف'], ans:1, fb:'✅ الشُّعيرات الدموية تمتص: الجلوكوز، الأحماض الأمينية، الماء، الأملاح، الفيتامينات → تنتقل للكبد عبر الوريد البابي.' },
  g9bio8n7_0: { q:'لماذا لا يعبر النشا غشاء الديلسة؟', opts:['لأنه غير قابل للذوبان','لأن جزيئاته أكبر من مسام الغشاء','لأنه يتفاعل مع الغشاء','لأنه أثقل من الماء'], ans:1, fb:'✅ النشا جزيء ضخم متعدد الوحدات — أكبر بكثير من مسام الغشاء شبه النافذ. بينما الجلوكوز المفرد صغير فيمر بسهولة.' },
  g9bio8n7_1: { q:'ما الكاشف المستخدم للكشف عن النشا؟', opts:['محلول بنيديكت','محلول اليود','الماء الدافئ','مؤشر الفينولفثالين'], ans:1, fb:'✅ محلول اليود يُعطي لوناً أزرق أسود مع النشا. أما بنيديكت فيُعطي أحمر/برتقالي مع الجلوكوز.' },
  g9bio8n7_2: { q:'ما الاستنتاج من وجود الجلوكوز داخل وخارج أنبوبة الديلسة؟', opts:['الجلوكوز لا يعبر','الغشاء تمزَّق','الجلوكوز الصغير يعبر بالانتشار','الجلوكوز يتحول إلى نشا'], ans:2, fb:'✅ وجود الجلوكوز خارج الأنبوبة يثبت أن الجزيئات الصغيرة تعبر الغشاء بالانتشار — مثل امتصاص الأمعاء الدقيقة تماماً!' },
  g9bio8n8_0: { q:'ما الذي يحدث للجلوكوز الزائد في الكبد؟', opts:['يُطرح في البول','يتحول لأحماض أمينية','يُحوَّل إلى جليكوجين ويُخزَّن','يتبخر في الدم'], ans:2, fb:'✅ الكبد يُحوِّل الجلوكوز الزائد إلى جليكوجين للتخزين — وعند الحاجة يُحوِّله مجدداً لجلوكوز لإنتاج الطاقة.' },
  g9bio8n8_1: { q:'ما مصطلح إزالة مجموعة الأمين من الأحماض الأمينية الزائدة؟', opts:['الاستحلاب','نزع الأمين (Deamination)','التمثيل الغذائي','الامتصاص'], ans:1, fb:'✅ نزع الأمين: الكبد يُزيل NH₂ → تتحول لـ يوريا تُطرح في البول. الجزء المتبقي يُستخدم للطاقة.' },
  g9bio8n8_2: { q:'ما المقصود بالتمثيل الغذائي (Assimilation)؟', opts:['هضم الطعام في المعدة','تحويل الغذاء الممتص لمواد تُستخدم في خلايا الجسم','امتصاص الماء في القولون','طرح الفضلات'], ans:1, fb:'✅ التمثيل الغذائي = تحويل الغذاء المُمتص إلى مواد جديدة يبنيها الجسم أو يستخدمها طاقةً في خلاياه.' },
  // ── الصف التاسع — أحياء الوحدة التاسعة: النقل في النبات ──
  g9bio9n1: { q:'ما الوظيفة الرئيسية لأوعية الخشب (Xylem)؟', opts:['نقل السكروز والأحماض الأمينية','نقل الماء والأملاح المعدنية من الجذور إلى الأوراق','تخزين الغذاء في الجذور','تبادل الغازات مع الهواء'], ans:1, fb:'✅ أوعية الخشب تنقل الماء والأملاح المعدنية من الجذور إلى أعلى النبات — أما اللحاء فينقل المواد العضوية (السكروز).' },
  g9bio9n1_0: { q:'ما الوظيفة الرئيسية لأوعية الخشب (Xylem)؟', opts:['نقل السكروز والأحماض الأمينية','نقل الماء والأملاح المعدنية من الجذور إلى الأوراق','تخزين الغذاء في الجذور','تبادل الغازات مع الهواء'], ans:1, fb:'✅ أوعية الخشب تنقل الماء والأملاح المعدنية من الجذور إلى أعلى النبات — أما اللحاء فينقل المواد العضوية (السكروز).' },
  g9bio9n1_1: { q:'ما المادة التي تُعطي جدران أوعية الخشب متانتها؟', opts:['السيلولوز فقط','الليجنين (Lignin)','البروتين','الكلوروفيل'], ans:1, fb:'✅ اللجنين مادة صلبة تُقوِّي جدران أوعية الخشب وتجعلها تتحمل ضغط العمود المائي الطويل من الجذر إلى أعلى الشجرة.' },
  g9bio9n2: { q:'بأي آلية يدخل الماء من التربة إلى الشعيرات الجذرية؟', opts:['الانتشار النشط باستهلاك طاقة','الأسموزية عبر غشاء شبه منفذ','الابتلاع النشط','الإفراز'], ans:1, fb:'✅ الماء يدخل بالأسموزية: التركيز داخل الشعيرة الجذرية أعلى من التربة، فالماء يتحرك من منطقة التركيز الأقل إلى الأعلى.' },
  g9bio9n2_0: { q:'بأي آلية يدخل الماء من التربة إلى الشعيرات الجذرية؟', opts:['الانتشار النشط باستهلاك طاقة','الأسموزية عبر غشاء شبه منفذ','الابتلاع النشط','الإفراز'], ans:1, fb:'✅ الماء يدخل بالأسموزية: التركيز داخل الشعيرة الجذرية أعلى من التربة، فالماء يتحرك من منطقة التركيز الأقل إلى الأعلى.' },
  g9bio9n2_1: { q:'ما وظيفة الشعيرات الجذرية؟', opts:['تثبيت النبات في التربة فقط','تكبير مساحة السطح لامتصاص الماء والأملاح','تخزين الطاقة','التمثيل الضوئي'], ans:1, fb:'✅ الشعيرات الجذرية تزيد مساحة السطح الامتصاصية بشكل كبير، مما يُسرِّع امتصاص الماء والأملاح المعدنية من التربة.' },
  g9bio9n3: { q:'ما النتح (Transpiration)؟', opts:['امتصاص الماء من التربة','فقدان بخار الماء من أوراق النبات عبر الثغور','نقل السكروز في اللحاء','تحلل الجلوكوز في التنفس'], ans:1, fb:'✅ النتح = تبخّر الماء من أسطح أوراق النبات عبر الثغور. يُحدث ضغطاً سالباً يسحب الماء من الجذور إلى الأعلى.' },
  g9bio9n3_0: { q:'ما النتح (Transpiration)؟', opts:['امتصاص الماء من التربة','فقدان بخار الماء من أوراق النبات عبر الثغور','نقل السكروز في اللحاء','تحلل الجلوكوز في التنفس'], ans:1, fb:'✅ النتح = تبخّر الماء من أسطح أوراق النبات عبر الثغور. يُحدث ضغطاً سالباً يسحب الماء من الجذور إلى الأعلى.' },
  g9bio9n3_1: { q:'ما العامل الذي يزيد معدّل النتح؟', opts:['انخفاض درجة الحرارة','زيادة الرطوبة الجوية','زيادة سرعة الرياح','الإضاءة الخافتة'], ans:2, fb:'✅ الرياح تُحرِّك بخار الماء بعيداً عن سطح الورقة، فيزداد التدرج بين الورقة والهواء → يزيد معدّل التبخّر والنتح.' },
  g9bio9n4: { q:'ماذا يقيس جهاز البوتومتر (Potometer)؟', opts:['معدّل التمثيل الضوئي','معدّل امتصاص الماء كمقياس لمعدّل النتح','كمية ثاني أكسيد الكربون','طول الجذور'], ans:1, fb:'✅ البوتومتر يقيس سرعة تحرك فقاعة الهواء في الأنبوبة الشعرية — وهي تعكس معدّل امتصاص الماء ≈ معدّل النتح.' },
  g9bio9n4_0: { q:'ماذا يقيس جهاز البوتومتر (Potometer)؟', opts:['معدّل التمثيل الضوئي','معدّل امتصاص الماء كمقياس لمعدّل النتح','كمية ثاني أكسيد الكربون','طول الجذور'], ans:1, fb:'✅ البوتومتر يقيس سرعة تحرك فقاعة الهواء في الأنبوبة الشعرية — وهي تعكس معدّل امتصاص الماء ≈ معدّل النتح.' },
  g9bio9n4_1: { q:'في أي ظرف يكون معدّل النتح أعلى؟', opts:['ضوء ضعيف ورطوبة عالية','ضوء قوي وهواء جاف وسرعة رياح عالية','ليل بلا ضوء','ضوء قوي ورطوبة عالية'], ans:1, fb:'✅ ضوء قوي (فتح الثغور) + هواء جاف (تدرج كبير) + رياح (إزالة البخار) = أقصى معدّل نتح. الرطوبة العالية تبطّئ النتح.' },
  g9bio9n5: { q:'ما المقصود بـ "المصدر" (Source) في نقل الغذاء؟', opts:['الجذر الذي يمتص الماء','العضو الذي يُنتج الغذاء أو يُفرزه للانتقال — كالأوراق','العضو الذي يستهلك الغذاء فقط','الزهور فقط'], ans:1, fb:'✅ المصدر (Source) = عضو يُنتج السكروز (كالأوراق الضوئية). المصبّ (Sink) = عضو يستهلكه (كالجذور والثمار والبذور).' },
  g9bio9n5_0: { q:'ما المقصود بـ "المصدر" (Source) في نقل الغذاء؟', opts:['الجذر الذي يمتص الماء','العضو الذي يُنتج الغذاء أو يُفرزه للانتقال — كالأوراق','العضو الذي يستهلك الغذاء فقط','الزهور فقط'], ans:1, fb:'✅ المصدر (Source) = عضو يُنتج السكروز (كالأوراق الضوئية). المصبّ (Sink) = عضو يستهلكه (كالجذور والثمار والبذور).' },
  g9bio9n5_1: { q:'ما الفرق بين نقل الماء في الخشب ونقل الغذاء في اللحاء؟', opts:['كلاهما في اتجاه واحد فقط','الماء يتحرك في اتجاه واحد فقط (للأعلى)، أما السكروز فيتحرك في كلا الاتجاهين','اللحاء ينقل الماء والخشب ينقل الغذاء','لا فرق بينهما'], ans:1, fb:'✅ الماء في الخشب = اتجاه واحد (من الجذور للأوراق). السكروز في اللحاء = اتجاهان (من المصدر إلى أقرب مصبّ سواء كان أعلى أو أسفل).' },
  // ── أحياء الصف التاسع — الوحدة العاشرة: التحكم والتنظيم في النبات ──
  g9bio10n1:   { q:'ما اسم الاستجابة التي تجعل السيقان تنمو نحو الضوء؟', opts:['الانتحاء الأرضي (Gravitropism)','الانتحاء الضوئي (Phototropism)','الانتحاء الحراري','الهرمون النباتي فقط'], ans:1, fb:'✅ الانتحاء الضوئي (Phototropism) — استجابة نمو النبات باتجاه مصدر الضوء أو بعيداً عنه.' },
  g9bio10n1_0: { q:'كيف استجابت البادرات في الطبق (أ) للضوء المُنفَّذ من جهة واحدة؟', opts:['نمت بعيداً عن الضوء','نمت نحو الضوء — وتُسمى الانتحاء الضوئي الموجب','توقف نموها تماماً','نمت للأسفل فقط'], ans:1, fb:'✅ الانتحاء الضوئي الموجب — الأوكسين يتجمّع في الجانب الظليل فيستطيل أسرع ويحدث الانحناء نحو الضوء.' },
  g9bio10n1_1: { q:'لماذا وُضع الطبق (ب) على قرص دوّار؟', opts:['لتسريع نمو البادرات','لضمان تعرّضها للضوء من جميع الجهات بالتساوي لإلغاء أثر الاتجاه','لحمايتها من الجفاف','لقياس طول الساق بدقة أكبر'], ans:1, fb:'✅ القرص الدوّار يوزّع الضوء بالتساوي من جميع الاتجاهات — ينمو الساق مستقيماً لأن الأوكسين موزّع بالتساوي.' },
  g9bio10n1_2: { q:'ما الطبق الذي يُمثّل التجربة الضابطة؟', opts:['الطبق (أ) — ضوء من جانب واحد','الطبق (ب) — قرص دوّار','الطبق (ج) — بدون ضوء'], ans:2, fb:'✅ الطبق (ج) هو الضابطة: بدون ضوء ويُستخدم للمقارنة لمعرفة أثر الضوء على النمو.' },
  g9bio10n2:   { q:'في أي اتجاه تنمو الجذور دائماً بغضّ النظر عن وضع البذرة؟', opts:['نحو مصدر الضوء','نحو الأسفل مع الجاذبية الأرضية دائماً','عشوائياً','نحو الأعلى مثل الساق'], ans:1, fb:'✅ الجذور = انتحاء أرضي موجب — تنمو دائماً نحو الأسفل مع الجاذبية، مهما كان وضع البذرة.' },
  g9bio10n2_0: { q:'ما اسم استجابة السيقان للنمو نحو الأعلى ضد الجاذبية؟', opts:['الانتحاء الضوئي الموجب','الانتحاء الأرضي السالب (Negative Gravitropism)','الانتحاء الأرضي الموجب','لا يوجد مصطلح'], ans:1, fb:'✅ الانتحاء الأرضي السالب — السيقان تنمو عكس الجاذبية للأعلى، بينما الجذور تنمو معها للأسفل.' },
  g9bio10n2_1: { q:'لماذا من المهم للنبات أن تنمو جذوره دائماً للأسفل؟', opts:['لتحسين المظهر','لتثبيت النبات في التربة وامتصاص الماء والأملاح المعدنية','للهرب من الضوء','لامتصاص ثاني أكسيد الكربون'], ans:1, fb:'✅ الجذور تتجه للأسفل لتُثبِّت النبات في التربة وتمتص الماء والأملاح المعدنية الضرورية للحياة.' },
  g9bio10n3:   { q:'على أيّ جانب من الساق يتجمّع الأوكسين عندما يسقط الضوء من جهة واحدة؟', opts:['الجانب المضيء المواجه للضوء','الجانب الظليل البعيد عن الضوء','يتوزع بالتساوي دائماً','لا يتحرك الأوكسين أبداً'], ans:1, fb:'✅ الأوكسين يتجمّع في الجانب الظليل → يُحفّز استطالة خلاياه أكثر → الجانب الظليل ينمو أسرع → ينحني الساق نحو الضوء.' },
  g9bio10n3_0: { q:'ما سبب مسح القمم باللانولين في تجربة الأصيصات؟', opts:['لتغذية القمة','لأن اللانولين مادة دهنية تمنع انتشار الأوكسين من القمة للأسفل','لحماية القمة من الحرارة','لتلوين القمة للمشاهدة'], ans:1, fb:'✅ اللانولين عازل دهني يمنع انتقال الأوكسين → بدون الأوكسين لا توجد استطالة تفاضلية → لا ينحني الساق.' },
  g9bio10n3_1: { q:'ماذا يحدث للساق الكامل عند سقوط الضوء من جانب واحد؟', opts:['ينمو للأسفل','ينحني نحو الضوء لأن الأوكسين يُحفّز نمو الجانب الظليل أسرع','يتوقف عن النمو','ينمو للأعلى باستقامة دائماً'], ans:1, fb:'✅ الأوكسين ينتقل للجانب الظليل → خلاياه تستطيل أسرع → هذا الجانب يطول أكثر → يحدث الانحناء نحو الضوء.' },
  g9bio10n3_2: { q:'لماذا وُضعت الأصص على أقراص دوّارة في تجربة ١٩١٣؟', opts:['لتسريع النمو','للتأكد من تعرّض الضوء لجانب واحد فقط بثبات طوال التجربة كمتغيّر ضابط','لتجفيف التربة','لقياس الوزن'], ans:1, fb:'✅ الأقراص الدوّارة تضمن أن الضوء يسقط من جانب واحد فقط بشكل منتظم — متغيّر ضابط مهم في التجربة.' },
  g9bio10n4:   { q:'أيّ جزء من الساق يستشعر الضوء ويُنتج هرمون الأوكسين؟', opts:['قاعدة الساق (المنطقة النامية)','قمّة الساق النامية','الجذور العرضية','الأوراق فقط'], ans:1, fb:'✅ قمّة الساق النامية هي مستشعر الضوء. تحتوي خلايا متخصصة تُنتج الأوكسين الذي ينتشر للأسفل لتحفيز نمو الخلايا.' },
  g9bio10n4_0: { q:'لماذا لم تنحنِ البادرات التي غُطِّيت قمّتها رغم وجود الضوء؟', opts:['لأن الغطاء أوقف النمو كلياً','لأن القمة المغطّاة لا تستشعر الضوء فلا تُنتج الأوكسين بشكل غير متساوٍ','لأن البادرة مريضة','لأن الضوء كان ضعيفاً'], ans:1, fb:'✅ القمة = مستشعر الضوء. بتغطيتها: لا استشعار ← لا أوكسين غير متساوٍ ← لا استطالة تفاضلية ← لا انحناء.' },
  g9bio10n4_1: { q:'كيف تنتقل المعلومات من منطقة استشعار الضوء (القمة) إلى منطقة الانحناء (الساق)؟', opts:['عبر الجهاز العصبي كالحيوانات','عبر انتشار هرمون الأوكسين من القمة نزولاً إلى منطقة الاستجابة','عبر النسيج الوعائي مباشرة','عبر الجذور والتربة'], ans:1, fb:'✅ الأوكسين يُنتَج في القمة → ينتشر للأسفل بشكل غير متساوٍ (أكثر في الجانب الظليل) → يُحفّز الخلايا على الاستطالة → الانحناء.' }
};

let qAnswered = false;

/** سؤال الاستنتاج للتاب الحالي (أو للاستقصاء بلا لاحقة تبويب) */
function getActiveQuestion(){
  if(!currentSim) return null;
  const k = currentSim + '_' + currentTab;
  return SIM_QUESTIONS[k] || SIM_QUESTIONS[currentSim] || null;
}

function loadQuestion(simType, tabOverride){
  if(tabOverride !== undefined) currentTab = tabOverride;
  const q = getActiveQuestion();
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
  const q = getActiveQuestion();
  // إذا ما في سؤال محدد — لا تفتح الـ drawer
  if(!q) return;
  drawer.classList.toggle('open');
}

function answerQ(i){
  if(qAnswered) return;
  const q = getActiveQuestion();
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
    g5sundial:'الشمس تتحرك والظل يتبعها ☀️ — راقب العصا الشمسية طوال اليوم!',
    g5lightintensity:'الضوء يضعف بالمسافة ☀️ — قِس وارسم العلاقة في جدولك!',
    g5rainbow:'الضوء الأبيض مليء بالألوان 🌈 — المنشور يكشفها!',
    g5earthsun:'الأرض تدور حول الشمس في 365 يوماً 🌍 — شاهد المسارات!',
    g5daynight2:'الشمس ثابتة والأرض هي التي تدور 🌍 — راقب الليل والنهار يتعاقبان!',
    g5sunseeming:'الشمس ثابتة ولا تتحرك أبداً! ☀️ — حرّك الشريط وشاهد كيف تدير الأرض منظورك',
    g5rotation:'دوران الأرض حول نفسها يصنع الليل والنهار 🌓 — شاهد العرض!',
    g5sunrise:'الشروق والغروب يحدثان بسبب دوران الأرض 🌅 — حرّك الوقت وشاهد الألوان تتغير!',
    g5earthorbit:'ميل محور الأرض هو سبب الفصول الأربعة 🍂 — شاهد كيف!',
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
    g6bodyconductor:'جسم الإنسان يوصِّل الكهرباء! ⚡ لا تلمس الأسلاك المكشوفة أبداً!',
    g6metalconductor:'كل المعادن توصِّل لكن بكفاءة مختلفة 🔩 — شوف الأميتر!',
    g6circuit:'ابنِ دائرتك الأولى 🔌 — بطارية + سلك + مصباح = نور!',
    g6circuitchange:'كيف يؤثر عدد المصابيح على السطوع؟ 💡 جرّب وشوف!',
    g6voltage:'كل جهاز له جهده الخاص ⚡ — أضف بطاريات وشاهد الفرق!',
    g6wirelength:'السلك الطويل = مقاومة أكبر = تيار أقل 📏 — جرّب واقيس!',
    g6battery:'رحلة عبر الزمن 🕰️ — من بطارية بغداد القديمة إلى اختراع فولتا!',
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
    // ── أحياء الصف التاسع — الوحدة السابعة: التغذية في النبات ──
    g9bio7n1: 'النبات يصنع غذاءه بنفسه 🌿 — الحيوان يحتاج إلى النبات! من أين تبدأ سلسلتك الغذائية؟',
    g9bio7n2: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ ☀️ — الكلوروفيل يلتقط الطاقة ويحوِّل الهواء والماء إلى سكر!',
    g9bio7n3: 'الثغور تفتح وتغلق كالأبواب 🚪 — النسيج الوسطي يحمل البلاستيدات وأوعية الخشب تنقل الماء!',
    g9bio7n4: 'بدون كلوروفيل لا نشا 🔬 — والضوء شرط أساسي لتشغيل مصنع السكر في الورقة!',
    g9bio7n5: 'اليود يتحوّل إلى الأزرق الأسود 🟤 — هذا دليلك على وجود النشا نتاج التمثيل الضوئي!',
    g9bio7n6: 'كلما اقتربت المصباح ازدادت الفقاعات 💧 — الأكسجين دليل مباشر على نشاط التمثيل الضوئي!',
    g9bio7n7: 'الضوء الزائد لا يزيد المعدل إلى ما لا نهاية 💡 — هناك حد أقصى عند التشبع الضوئي!',
    g9bio7n8: 'الحرارة الزائدة تُعطِّل الإنزيمات 🌡️ — الدرجة المثلى تعطي أقصى معدل للتمثيل الضوئي!',
    g9bio7n9: 'النيترات لبناء البروتين والكلوروفيل 🌿 — النقص يجعل الأوراق صفراء وصغيرة!',
    g9bio7n10: 'الجلوكوز يتحول إلى سكروز للنقل 🍬 — أنابيب اللحاء تحمله لكل خلية في النبات!',
    // ── الوحدة الثامنة ──
    g9bio8n1: 'الطعام يمر بأربع مراحل 🍽️ — الابتلاع، الهضم، الامتصاص، ثم التبرز!',
    g9bio8n2: 'الأسنان تُفكِّك والأنزيمات تُحوِّل ⚙️ — الهضم الميكانيكي والكيميائي يعملان معاً!',
    g9bio8n3: 'القناة الهضمية أنبوب طويل 🔬 — كل جزء فيها له وظيفة محددة في هضم الطعام!',
    g9bio8n4: 'ثلاثة أنزيمات قوية 🧪 — الأميليز للنشا، البروتييز للبروتين، الليبييز للدهون!',
    g9bio8n5: 'العُصارة الصفراوية تُفتِّت الدهون 💧 — الاستحلاب يُكبِّر السطح لعمل الليبييز!',
    g9bio8n6: 'الخملات تُضاعف السطح الامتصاصي 🌿 — شُعيرات دموية ولمفاوية تنقل الغذاء!',
    g9bio8n7: 'الديلسة تُحاكي الامتصاص 🔭 — الجلوكوز يعبر الغشاء والنشا لا يعبر، لماذا؟',
    g9bio8n8: 'بعد الامتصاص يذهب الغذاء للكبد ⚡ — الجلوكوز للطاقة أو التخزين!',
    // ── أحياء الصف التاسع — الوحدة التاسعة: النقل في النبات ──
    g9bio9n1: 'الخشب والحاء: خطّان مختلفان للنقل في النبات 🌱 — الخشب للماء، اللحاء للغذاء!',
    g9bio9n2: 'الشعيرات الجذرية كالمظلة للجذور 💧 — تُكبِّر المساحة لامتصاص الماء بالأسموزية!',
    g9bio9n3: 'النتح يسحب الماء للأعلى 🍃 — الرياح والحرارة يزيدان معدّله!',
    g9bio9n4: 'البوتومتر يقيس سرعة النتح 📏 — الفقاعة الصغيرة تُخبرك بكل شيء!',
    g9bio9n5: 'الأوراق = المصدر، الجذور والثمار = المصبّ 🍬 — اللحاء ينقل الغذاء في الاتجاهين!',
    // ── الصف التاسع — الوحدة ١٠: التحكم والتنظيم في النبات ──
    g9bio10n1: 'السيقان تنحني نحو الضوء 🌿 — هذا الانتحاء الضوئي Phototropism! لاحظ الفرق بين الأطباق الثلاثة.',
    g9bio10n2: 'الجذور تتبع الجاذبية دائماً نحو الأسفل 🌱 — حتى لو قلبتَ البذرة! هذا هو الانتحاء الأرضي.',
    g9bio10n3: 'الأوكسين IAA يجعل الخلايا تستطيل 🔬 — الجانب المُظلم ينمو أسرع فيحدث الانحناء!',
    g9bio10n4: 'القمة النامية هي عين النبات 📍 — بدونها لا يرى الضوء ولا ينحني نحوه!',
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
    g9limestone:  'CaCO₃ + حرارة شديدة → CaO + CO₂ 🪨 — الجير الحيّ يُعادل التربة الحمضية!',
    g9energymix: 'صنّف المصادر وصمّم المزيج ⚡ — ثم افتح «ماذا نستنتج» من الأسفل!',
    g9solar:      'اللوح والشمس وزاوية السقوط ☀️ — انقر على الشاشة لمحاذاة اللوح!',
    g9wind:       'الرياح تدور التوربين 💨 — لاحظ كيف تتغير القدرة مع السرعة!',
    g9hydro:      'الماء والمدّ يحملان طاقة 🌊 — غيّر الارتفاع والتدفق!',
    g9fossil:     'قارن الأحفوري والنووي 🛢️ — الانبعاثات والكثافة ليست متشابهة!',
    g9efficiency: 'الكفاءة = المفيد ÷ المدخل 📈 — لا يوجد جهاز بلا فاقد!',
    g9refl:       'جرّب زاوية السقوط وشاهد i = r 🪞 — ثم افتح «ماذا نستنتج»!',
    g9refltype:   'قارن بين انعكاس منتظم ومتشتت — نفس القانون عند كل نقطة!',
    g9refract:    'غيّر n وزاوية السقوط — قانون سنيل بين يديك 🔎',
    g9refractN:   'كل مادة تبطئ الضوء بشكل مختلف 💎 — لاحظ n و v',
    // ── الصف السادس — القوى والحركة ──
    g6forces1:    'القوى المتوازنة وغير المتوازنة 💪 — حدّد الاتجاه والمقدار وشوف التأثير!',
    g6forces2:    'مخطط القوى يُخبرنا باتجاه كل قوة ومقدارها 🏹 — أين تتوازن؟',
    g6gravity:    'الكتلة ثابتة لكن الوزن يتغيّر! 🌍 — جرّب على القمر والمريخ!',
    g6airresist:  'الهواء يُقاوم السقوط 🪂 — غيّر المساحة وشوف الفرق!',
    g6friction:   'الاحتكاك 🔥 — جرّب أسطح مختلفة وشوف كيف يبطّئ الحركة!',
    g6frictionInquiry: 'ما العوامل التي تُغيّر قوة الاحتكاك؟ 🔬 — استقصِ وتحقّق!',
    g6work:           'هل بُذل شغل؟ 🔬 — شاهد الكرة واحسب الشغل المبذول في القوى والطاقة!',
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
  if(window._stopCurrentSim) { window._stopCurrentSim(); window._stopCurrentSim = null; }
  if(currentSim==='human' && window._stopNatureSound && window._playSoundFor){
    window._stopNatureSound();
    setTimeout(function(){
      if(i===0){ window._playOcean && window._playOcean(); }
      else { window._playBirds && window._playBirds(); }
    }, 400);
  }
  resizeCanvas();
  startSim(currentSim, i);
  const _tabForQ = i;
  setTimeout(function(){ if(currentSim) loadQuestion(currentSim, _tabForQ); }, 400);
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
    g5mirror:         [simG5MirrorFlat],
    g5behindyou:      [simG5BehindYou],
    g5reflection:     [simG5ReflectionCompare, simG5ReflectionMeasure],
    g5lightdir:       [simG5LightDirection],
    g5shadowsize:     [simG5ShadowLab, simG5ShadowInquiry],
    g5transparent:    [simG5TransparentTest],
    g5silhouette:     [simG5Silhouette],
    g5shadowfactor:   [simG5ShadowFactor],
    g5sundial:        [simG5Sundial],
    g5lightintensity: [simG5LightIntensity],
    g5rainbow:        [simG5Rainbow, simG5RainDrop],
    g5earthsun:       [simG5EarthSun, simG5OrbitalPaths],
    g5daynight2:      [simG5DayNight2],
    g5sunseeming:     [simG5SunSeeming, simG5DayNight2],
    g5rotation:       [simG5DayNight],
    g5sunrise:        [simG5Sunrise],
    g5earthorbit:     [simG5Seasons],
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
    g6airresist: [simAirResist1, simAirResist2, simAirResist3],
    g6friction:  [simFriction1],
    g6frictionInquiry: [simFriction2, simFriction3],
    g6work:           [simG6Work1, simG6Work2, simG6Work3],
    // وحدة الكهرباء — الصف السادس
    g6conductors:     [simConductors1, simConductors2],
    g6waterconductor: [simWaterConductor1, simWaterConductor2],
    g6bodyconductor:  [simBodyConductor1],
    g6metalconductor: [simMetalConductor1, simMetalConductor2],
    g6circuit:        [simCircuitBuilder1, simCircuitBuilder2],
    g6circuitchange:  [simCircuitChange1, simCircuitChange2],
    g6voltage:        [simVoltage1, simVoltage2, simVoltage3, simVoltage4],
    g6wirelength:     [simWireLength1, simWireLength2],
    g6battery:        [simBattery1, simBattery2, simBattery3],
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
    staticelec:   [simStaticElec1, simStaticElec2, simStaticElec3],
    circuit8:     [simCircuit8Series, simCircuit8Parallel, simCircuit8Mystery],
    magcompare:   [simMagCompare1, simMagCompare2],
    magfield:     [simMagField1, simMagField2, simMagField3],
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
    // ── أحياء الصف التاسع — الوحدة السابعة: التغذية في النبات ──
    g9bio7n1: [simG9Bio7N1a, simG9Bio7N1b, simG9Bio7N1c],
    g9bio7n2: [simG9Bio7N2a, simG9Bio7N2b, simG9Bio7N2c],
    g9bio7n3: [simG9Bio7N3a, simG9Bio7N3b, simG9Bio7N3c],
    g9bio7n4: [simG9Bio7N4a, simG9Bio7N4b, simG9Bio7N4c],
    g9bio7n5: [simG9Bio7N5a, simG9Bio7N5b, simG9Bio7N5c],
    g9bio7n6: [simG9Bio7N6a, simG9Bio7N6b, simG9Bio7N6c],
    g9bio7n7: [simG9Bio7N7a, simG9Bio7N7b, simG9Bio7N7c],
    g9bio7n8: [simG9Bio7N8a, simG9Bio7N8b, simG9Bio7N8c],
    g9bio7n9: [simG9Bio7N9a, simG9Bio7N9b, simG9Bio7N9c],
    g9bio7n10: [simG9Bio7N10a, simG9Bio7N10b, simG9Bio7N10c],
    // ── أحياء الصف التاسع — الوحدة الثامنة: الهضم في الإنسان ──
    g9bio8n1: [simG9Bio8N1a, simG9Bio8N1b, simG9Bio8N1c],
    g9bio8n2: [simG9Bio8N2a, simG9Bio8N2b, simG9Bio8N2c],
    g9bio8n3: [simG9Bio8N3a, simG9Bio8N3b, simG9Bio8N3c],
    g9bio8n4: [simG9Bio8N4a, simG9Bio8N4b, simG9Bio8N4c],
    g9bio8n5: [simG9Bio8N5a, simG9Bio8N5b, simG9Bio8N5c],
    g9bio8n6: [simG9Bio8N6a, simG9Bio8N6b, simG9Bio8N6c],
    g9bio8n7: [simG9Bio8N7a, simG9Bio8N7b, simG9Bio8N7c],
    g9bio8n8: [simG9Bio8N8a, simG9Bio8N8b, simG9Bio8N8c],
    // ── أحياء الصف التاسع — الوحدة التاسعة: النقل في النبات ──
    g9bio9n1: [simG9Bio9N1a, simG9Bio9N1b],
    g9bio9n2: [simG9Bio9N2a, simG9Bio9N2b],
    g9bio9n3: [simG9Bio9N3a, simG9Bio9N3b],
    g9bio9n4: [simG9Bio9N4a, simG9Bio9N4b],
    g9bio9n5: [simG9Bio9N5a, simG9Bio9N5b],
    // ── أحياء الصف التاسع — الوحدة العاشرة: التحكم والتنظيم في النبات ──
    g9bio10n1: [simG9Bio10N1a, simG9Bio10N1b, simG9Bio10N1c],
    g9bio10n2: [simG9Bio10N2a, simG9Bio10N2b, simG9Bio10N2c],
    g9bio10n3: [simG9Bio10N3a, simG9Bio10N3b, simG9Bio10N3c],
    g9bio10n4: [simG9Bio10N4a, simG9Bio10N4b, simG9Bio10N4c],
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
    // ── فيزياء الصف التاسع — الوحدة 11 (مصادر الطاقة) ──
    g9energymix:[simG9EnergyMix1, simG9EnergyMix2],
    g9solar:   [simG9Solar1, simG9Solar2],
    g9wind:    [simG9Wind1, simG9Wind2],
    g9hydro:   [simG9Hydro1, simG9Hydro2],
    g9fossil:  [simG9Fossil1, simG9Fossil2],
    g9efficiency:[simG9Efficiency1, simG9Efficiency2],
    g9refl:   [simG9Refl1, simG9Refl2],
    g9mirror: [simG9Mirror1, simG9Mirror2],
    g9rayrefl:[simG9RayRefl1, simG9RayRefl2],
    g9refltype:[simG9ReflType1, simG9ReflType2],
    g9refract:[simG9Refract1, simG9Refract2],
    g9refractN:[simG9RefractN1, simG9RefractN2],
    g9tir:    [simG9TIR1, simG9TIR2],
    g9fiber:  [simG9Fiber1, simG9Fiber2],
    g9lens:   [simG9Lens1, simG9Lens2, simG9Lens3, simG9Lens4],
    g9raydiagram:[simG9RayDiagram1, simG9RayDiagram2],
    g9current: [simG9Current1, simG9Current2],
    g9voltage: [simG9Voltage1, simG9Voltage2],
    g9ohm:    [simG9Ohm1, simG9Ohm2],
    g9power15:[simG9Power1, simG9Power2],
    g9ohmslaw:[simG9OhmsLaw1, simG9OhmsLaw2],
    g9wireres:[simG9WireRes1, simG9WireRes2],
    g9ivchar: [simG9IVChar1, simG9IVChar2]
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
function simAcidBase1() {
  cancelAnimationFrame(animFrame);
  simState = { t: 0, selected: null, hover: null };
  const acids = [
    { id:'lemon', label:'عصير الليمون', icon:'🍋', ph:2.5, type:'acid', desc:'حمض الستريك — حمض ضعيف، آمن للأكل، طعمه حامض', x:0.12, y:0.25 },
    { id:'vinegar', label:'الخل', icon:'🫙', ph:3, type:'acid', desc:'حمض الأسيتيك — حمض ضعيف يُستخدم في الطبخ', x:0.32, y:0.25 },
    { id:'cola', label:'مشروب الكولا', icon:'🥤', ph:3.5, type:'acid', desc:'حمض الفوسفوريك — حمض ضعيف في المشروبات الغازية', x:0.52, y:0.25 },
    { id:'hcl', label:'حمض الهيدروكلوريك', icon:'⚗️', ph:1, type:'strong', desc:'حمض قويّ جداً — مُؤكِّل خطير، يُستخدم في المختبر فقط', x:0.12, y:0.65 },
    { id:'sulfuric', label:'حمض الكبريتيك', icon:'🔴', ph:1, type:'strong', desc:'حمض قويّ مُؤكِّل — يُذيب المعادن والجلد، خطير جداً', x:0.35, y:0.65 },
    { id:'nitric', label:'حمض النيتريك', icon:'🟠', ph:1.5, type:'strong', desc:'حمض قويّ — مادة مُهيِّجة، يُستخدم في الصناعة', x:0.58, y:0.65 },
  ];
  controls(`
    <div style="padding:8px 0 4px;font-size:15px;color:#555;text-align:center">انقر على أي مادة لمعرفة خصائصها</div>
    <div id="acidInfoBox" style="margin-top:8px;padding:12px;background:rgba(26,143,168,0.07);border-radius:10px;min-height:60px;font-size:15px;color:#1A8FA8;text-align:center;line-height:1.6">اختر مادة من الرسم 👆</div>
    <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
      <span style="background:rgba(231,76,60,0.1);color:#C0392B;padding:4px 10px;border-radius:12px;font-size:13px">⚠️ حمض قويّ = مُؤكِّل</span>
      <span style="background:rgba(243,156,18,0.1);color:#D4901A;padding:4px 10px;border-radius:12px;font-size:13px">🍋 حمض ضعيف = آمن نسبياً</span>
    </div>
    <div style="margin-top:10px;padding:8px;background:#fff8e1;border-radius:8px;font-size:14px;color:#795548;text-align:center">
      📖 ص80 — الأحماض في كلّ مكان
    </div>
    <div class="q-box">
      <strong>❓ أسئلة الكتاب (ص٨٠-٨١):</strong><br>
      ١- اذكر طعاماً يحتوي على حمض.<br>
      ٢- ماذا يعني «مُسبِّب للتآكل»؟<br>
      ٣- ماذا يجب أن تفعل عند انسكاب حمض؟
    
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- الليمون / الخل / البرتقال (أي طعام حامض).<br>٢- مادة تُذيب وتُتلف المواد الأخرى عند ملامستها.<br>٣- اغسل المنطقة فوراً بكثير من الماء.</div>
  </div>`);
  const canvas = document.getElementById('simCanvas');
  function draw() {
    const c = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    c.clearRect(0, 0, w, h);
    // bg
    c.fillStyle = '#F5F8FA'; c.fillRect(0,0,w,h);
    // title sections
    c.fillStyle = 'rgba(231,76,60,0.08)'; c.beginPath(); c.roundRect(w*0.05,h*0.08,w*0.9,h*0.38,12); c.fill();
    c.fillStyle = 'rgba(231,76,60,0.55)'; c.font='bold 14px Tajawal'; c.textAlign='center';
    c.fillText('أحماض ضعيفة — موجودة في الطعام', w/2, h*0.115);
    c.fillStyle = 'rgba(180,0,0,0.1)'; c.beginPath(); c.roundRect(w*0.05,h*0.52,w*0.9,h*0.38,12); c.fill();
    c.fillStyle = 'rgba(180,0,0,0.7)'; c.font='bold 14px Tajawal'; c.textAlign='center';
    c.fillText('أحماض قويّة — خطيرة ⚠️', w/2, h*0.555);
    simState.t += 0.025;
    acids.forEach((a, idx) => {
      const ax = a.x * w, ay = a.y * h;
      const isHover = simState.hover === a.id, isSel = simState.selected === a.id;
      const r = isHover || isSel ? 44 : 40;
      const bob = Math.sin(simState.t + idx) * (isHover ? 5 : 3);
      const cy2 = ay + bob;
      // glow
      if(isSel){ c.shadowBlur=18; c.shadowColor=a.type==='strong'?'#E74C3C':'#F4A522'; }
      // bottle shape
      c.fillStyle = a.type==='strong' ? 'rgba(231,76,60,0.18)' : 'rgba(243,156,18,0.15)';
      c.beginPath(); c.ellipse(ax, cy2, r, r*0.9, 0, 0, Math.PI*2); c.fill();
      c.fillStyle = a.type==='strong' ? '#C0392B' : '#E67E22';
      c.font = `${r*0.75}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(a.icon, ax, cy2);
      c.shadowBlur = 0;
      // label
      c.font='bold 12px Tajawal'; c.textAlign='center'; c.textBaseline='top';
      c.fillStyle = isSel ? '#1A8FA8' : '#555';
      c.fillText(a.label, ax, cy2 + r + 4);
      // pH badge
      const badgeTxt = 'pH ' + a.ph;
      c.fillStyle = a.type==='strong'?'rgba(192,57,43,0.85)':'rgba(230,126,34,0.85)';
      const bw = c.measureText(badgeTxt).width + 14;
      c.beginPath(); c.roundRect(ax - bw/2, cy2 - r - 22, bw, 16, 6); c.fill();
      c.fillStyle='#fff'; c.font='bold 11px Tajawal'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(badgeTxt, ax, cy2 - r - 14);
    });
    animFrame = requestAnimationFrame(draw);
  }
  canvas.onclick = function(e) {
    const r = canvas.getBoundingClientRect(); const _et=e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e;
    const mx = (_et.clientX - r.left) * canvas.width / r.width;
    const my = (_et.clientY - r.top) * canvas.height / r.height;
    acids.forEach(a => {
      const ax = a.x * canvas.width, ay = a.y * canvas.height;
      if(Math.hypot(mx-ax, my-ay) < 48) {
        simState.selected = a.id;
        U9Sound.ping();
        const box = document.getElementById('acidInfoBox');
        if(box) {
          box.innerHTML = `<strong style="font-size:17px">${a.icon} ${a.label}</strong><br>
            <span style="color:#888">pH = ${a.ph}</span><br>${a.desc}`;
          box.style.background = a.type==='strong'?'rgba(192,57,43,0.1)':'rgba(243,156,18,0.1)';
          box.style.color = a.type==='strong'?'#C0392B':'#D4901A';
        }
      }
    });
  };
  canvas.onmousemove = function(e) {
    const r = canvas.getBoundingClientRect(); const _et=e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e;
    const mx = (_et.clientX - r.left) * canvas.width / r.width;
    const my = (_et.clientY - r.top) * canvas.height / r.height;
    simState.hover = null;
    acids.forEach(a => { if(Math.hypot(mx - a.x*canvas.width, my - a.y*canvas.height) < 48) simState.hover = a.id; });
    canvas.style.cursor = simState.hover ? 'pointer' : 'default';
  };
  draw();
}

// ── 11-1 Tab 2: القلويّات ──
function simAcidBase2() {
  cancelAnimationFrame(animFrame);
  simState = { t: 0, selected: null };
  const bases = [
    { id:'soap', label:'محلول الصابون', icon:'🧴', ph:10, desc:'قلويّ ضعيف — يُستخدم للتنظيف، لزج الملمس', x:0.15, y:0.3 },
    { id:'toothpaste', label:'معجون الأسنان', icon:'🪥', ph:9, desc:'قلويّ ضعيف — يعادل حمض الفم ويحمي الأسنان', x:0.38, y:0.3 },
    { id:'bicarb', label:'بيكربونات الصوديوم', icon:'🥛', ph:8.5, desc:'قلويّ ضعيف — يُستخدم في الخبز وعلاج عُسر الهضم', x:0.62, y:0.3 },
    { id:'bleach', label:'الكلور المخفّف', icon:'🟡', ph:12, desc:'قلويّ قويّ — مُؤكِّل، يُستخدم للتعقيم بحذر', x:0.22, y:0.72 },
    { id:'naoh', label:'هيدروكسيد الصوديوم', icon:'⬜', ph:13, desc:'قلويّ قويّ جداً — مُؤكِّل خطير، يُذيب الدهون والبروتينات', x:0.5, y:0.72 },
    { id:'lime', label:'هيدروكسيد الكالسيوم', icon:'🪨', ph:12.5, desc:'قلويّ قويّ — يُستخدم في معالجة التربة الحمضيّة', x:0.78, y:0.72 },
  ];
  controls(`
    <div style="padding:8px 0 4px;font-size:15px;color:#555;text-align:center">انقر على أي مادة لمعرفة خصائصها</div>
    <div id="baseInfoBox" style="margin-top:8px;padding:12px;background:rgba(39,174,96,0.07);border-radius:10px;min-height:60px;font-size:15px;color:#27AE60;text-align:center;line-height:1.6">اختر مادة من الرسم 👆</div>
    <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
      <span style="background:rgba(39,174,96,0.1);color:#1E8449;padding:4px 10px;border-radius:12px;font-size:13px">🧴 قلويّ ضعيف = آمن نسبياً</span>
      <span style="background:rgba(142,68,173,0.1);color:#6C3483;padding:4px 10px;border-radius:12px;font-size:13px">⚠️ قلويّ قويّ = مُؤكِّل</span>
    </div>
    <div style="margin-top:10px;padding:8px;background:#e8f5e9;border-radius:8px;font-size:14px;color:#2E7D32;text-align:center">
      📖 ص81 — القلويّات في كلّ مكان
    </div>`);
  const canvas = document.getElementById('simCanvas');
  function draw() {
    const c = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    c.clearRect(0,0,w,h);
    c.fillStyle='#F5F8FA'; c.fillRect(0,0,w,h);
    c.fillStyle='rgba(39,174,96,0.07)'; c.beginPath(); c.roundRect(w*0.05,h*0.08,w*0.9,h*0.38,12); c.fill();
    c.fillStyle='rgba(39,174,96,0.7)'; c.font='bold 14px Tajawal'; c.textAlign='center';
    c.fillText('قلويّات ضعيفة — شائعة في المنزل', w/2, h*0.115);
    c.fillStyle='rgba(142,68,173,0.08)'; c.beginPath(); c.roundRect(w*0.05,h*0.52,w*0.9,h*0.38,12); c.fill();
    c.fillStyle='rgba(142,68,173,0.8)'; c.font='bold 14px Tajawal'; c.textAlign='center';
    c.fillText('قلويّات قويّة — خطيرة ⚠️', w/2, h*0.555);
    simState.t += 0.025;
    bases.forEach((b, idx) => {
      const bx = b.x * w, by = b.y * h;
      const isSel = simState.selected === b.id;
      const bob = Math.sin(simState.t + idx*1.3) * 3;
      const cy2 = by + bob;
      if(isSel){ c.shadowBlur=18; c.shadowColor='#27AE60'; }
      c.fillStyle = b.ph > 11 ? 'rgba(142,68,173,0.15)' : 'rgba(39,174,96,0.15)';
      c.beginPath(); c.ellipse(bx, cy2, 40, 36, 0, 0, Math.PI*2); c.fill();
      c.fillStyle = b.ph > 11 ? '#6C3483' : '#1E8449';
      c.font='30px serif'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(b.icon, bx, cy2);
      c.shadowBlur=0;
      c.font='bold 11px Tajawal'; c.textAlign='center'; c.textBaseline='top';
      c.fillStyle = isSel ? '#27AE60' : '#555';
      c.fillText(b.label, bx, cy2 + 42);
      const bTxt = 'pH ' + b.ph;
      c.fillStyle = b.ph > 11 ? 'rgba(142,68,173,0.85)' : 'rgba(39,174,96,0.85)';
      const bw = c.measureText(bTxt).width + 14;
      c.beginPath(); c.roundRect(bx-bw/2, cy2-52, bw, 16, 6); c.fill();
      c.fillStyle='#fff'; c.font='bold 11px Tajawal'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(bTxt, bx, cy2-44);
    });
    animFrame = requestAnimationFrame(draw);
  }
  canvas.onclick = function(e) {
    const r = canvas.getBoundingClientRect();
    const mx = ((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX-r.left)*canvas.width/r.width, my = ((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientY-r.top)*canvas.height/r.height;
    bases.forEach(b => {
      if(Math.hypot(mx-b.x*canvas.width, my-b.y*canvas.height) < 46) {
        simState.selected = b.id; U9Sound.ping();
        const box = document.getElementById('baseInfoBox');
        if(box){ box.innerHTML=`<strong style="font-size:17px">${b.icon} ${b.label}</strong><br><span style="color:#888">pH = ${b.ph}</span><br>${b.desc}`; }
      }
    });
  };
  draw();
}

// ── 11-2 Tab 1: ورق تبّاع الشمس ──
function simIndicator1() {
  cancelAnimationFrame(animFrame);

  const SOLUTIONS = [
    { id:'s1', label:'عصير\nالليمون',  ph:2.5, color:'#C0392B', bgCol:'rgba(220,180,80,',  type:'acid',    emoji:'🍋', typeLabel:'حمضي قوي' },
    { id:'s2', label:'ماء نقي',        ph:7,   color:'#7D6B91', bgCol:'rgba(180,195,215,', type:'neutral', emoji:'💧', typeLabel:'متعادل' },
    { id:'s3', label:'محلول\nالصابون', ph:10,  color:'#1A6A9A', bgCol:'rgba(180,210,230,', type:'base',    emoji:'🧼', typeLabel:'قلوي' },
    { id:'s4', label:'مشروب\nالكولا',  ph:3.5, color:'#8B3A2A', bgCol:'rgba(180,120,90,',  type:'acid',    emoji:'🥤', typeLabel:'حمضي' },
    { id:'s5', label:'هيدروكسيد\nالكالسيوم', ph:12, color:'#1A5276', bgCol:'rgba(190,205,220,', type:'base', emoji:'🧪', typeLabel:'قلوي قوي' },
  ];

  simState = { t:0, dipped:{} };

  // ── Controls panel ──
  controls(`
    <div class="ctrl-label">📄 ورق تبّاع الشمس</div>
    <div class="info-box" style="text-align:center;line-height:1.8">
      اسحب ورقة تبّاع الشمس<br>إلى المحلول لترى لونها
    </div>
    <div id="dipResult" style="margin-top:8px;padding:10px 12px;border-radius:10px;
      background:rgba(26,143,168,0.06);border:1.5px solid rgba(26,143,168,0.15);
      font-size:14px;color:#555;line-height:1.7;min-height:54px;
      border-right:4px solid rgba(26,143,168,0.3)">
      اسحب الورقة فوق أحد المحاليل...
    </div>
    <div id="dipScore" style="margin-top:6px;font-size:13px;color:#1A8FA8;
      text-align:center;font-weight:600"></div>
    <div style="margin-top:10px;padding:8px 10px;background:rgba(212,144,26,0.07);
      border-radius:8px;font-size:13px;color:#7A5010;line-height:1.8">
      🔴 حمض &nbsp;|&nbsp; 🟣 متعادل &nbsp;|&nbsp; 🔵 قلوي
    </div>
    <div style="margin-top:8px;padding:6px 10px;background:#f8f9fa;border-radius:8px;
      font-size:12px;color:#777;text-align:center">
      📖 ص82 — ورق تبّاع الشمس
    </div>
  `);



  const canvas = document.getElementById('simCanvas');

  // Paper state
  let paperX = 0.5, paperY = 0.14;
  let dragging = false;
  let paperColor = { r:220, g:208, b:170 }; // neutral beige
  let colorProgress = 0;
  let lastDipped = null;
  let dipCount = 0;
  let dipAnim = 0;

  // Dipping animation
  let isDipping = false;
  let dipProgress = 0;
  let dipTarget = null;
  let dipPhase = 0; // 0=descend, 1=color, 2=ascend

  function hexToRgb(hex) {
    return { r:parseInt(hex.slice(1,3),16), g:parseInt(hex.slice(3,5),16), b:parseInt(hex.slice(5,7),16) };
  }
  function lerpColor(a,b,t) {
    return { r:Math.round(a.r+(b.r-a.r)*t), g:Math.round(a.g+(b.g-a.g)*t), b:Math.round(a.b+(b.b-a.b)*t) };
  }
  function rgbStr(c,a=1){ return `rgba(${c.r},${c.g},${c.b},${a})`; }

  function draw() {
    const c = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    c.clearRect(0,0,w,h);
    simState.t += 0.02;

    // ── Background ──
    const bg = c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F0F8FF'); bg.addColorStop(1,'#E8EEF8');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Lab bench surface
    c.fillStyle='rgba(180,160,130,0.18)';
    c.beginPath(); c.roundRect(0, h*0.72, w, h*0.28, 0); c.fill();
    c.fillStyle='rgba(160,140,110,0.3)';
    c.fillRect(0, h*0.72, w, 3);

    // Instruction text if not started
    if(dipCount===0 && !isDipping) {
      c.font=`bold 14px Tajawal`; c.fillStyle='rgba(80,110,160,0.65)';
      c.textAlign='center'; c.textBaseline='top';
      c.fillText('↓  اسحبي الورقة نحو أي كأس', w/2, h*0.04);
    }

    // ── Advance dip animation ──
    if(isDipping) {
      dipProgress += 0.022;
      if(dipPhase===0 && dipProgress>0.38) dipPhase=1;
      else if(dipPhase===1) {
        const blend=(dipProgress-0.38)/0.37;
        colorProgress=Math.min(1, blend*1.3);
        paperColor=lerpColor(paperColor, hexToRgb(dipTarget.color), colorProgress);
        if(dipProgress>0.75) dipPhase=2;
      } else if(dipPhase===2 && dipProgress>=1.0) {
        isDipping=false; dipProgress=0; dipPhase=0;
        paperX=0.5; paperY=0.14;
      }
    }

    // ── Draw beakers ──
    const n = SOLUTIONS.length;
    SOLUTIONS.forEach((sol, i) => {
      const bx = w * (0.1 + i * (0.82/(n-1)));
      const by = h * 0.68;
      const bW = Math.min(w*0.14, 62);
      const bH = bW * 1.2;
      const isDipped = simState.dipped[sol.id];
      const isActive = isDipping && dipTarget && dipTarget.id===sol.id;

      // Beaker glass body
      const glassG = c.createLinearGradient(bx-bW/2,0,bx+bW/2,0);
      glassG.addColorStop(0,'rgba(220,235,255,0.6)');
      glassG.addColorStop(0.3,'rgba(255,255,255,0.15)');
      glassG.addColorStop(0.7,'rgba(255,255,255,0.1)');
      glassG.addColorStop(1,'rgba(200,220,255,0.5)');
      c.fillStyle=glassG;
      c.strokeStyle=isActive?'rgba(26,143,168,0.8)':'rgba(120,150,200,0.4)';
      c.lineWidth=isActive?2.5:1.8;
      c.beginPath();
      c.moveTo(bx-bW/2+4, by-bH);
      c.lineTo(bx-bW/2, by);
      c.quadraticCurveTo(bx-bW/2, by+8, bx-bW/2+8, by+8);
      c.lineTo(bx+bW/2-8, by+8);
      c.quadraticCurveTo(bx+bW/2, by+8, bx+bW/2, by);
      c.lineTo(bx+bW/2-4, by-bH);
      c.closePath(); c.fill(); c.stroke();

      // Beaker rim/spout
      c.strokeStyle=isActive?'rgba(26,143,168,0.8)':'rgba(120,150,200,0.5)';
      c.lineWidth=3;
      c.beginPath();
      c.moveTo(bx-bW/2+4,by-bH); c.lineTo(bx-bW/2-3,by-bH-8);
      c.moveTo(bx+bW/2-4,by-bH); c.lineTo(bx+bW/2+3,by-bH-8);
      c.stroke();

      // Liquid inside beaker — هادئ ومرئي قبل وبعد الغمس
      const liqH = bH * 0.68;
      const liqY = by - liqH + 4;

      if(!isDipped && !isActive) {
        // قبل الغمس — لون المادة الطبيعي بشفافية عالية
        c.fillStyle = sol.bgCol + '0.18)';
      } else if(isActive) {
        c.fillStyle = sol.bgCol + '0.32)';
      } else {
        // بعد الغمس — أوضح قليلاً
        c.fillStyle = sol.bgCol + '0.42)';
      }
      c.beginPath();
      c.moveTo(bx-bW/2+3, liqY);
      c.lineTo(bx-bW/2+1, by+2);
      c.lineTo(bx+bW/2-1, by+2);
      c.lineTo(bx+bW/2-3, liqY);
      c.closePath(); c.fill();

      // Liquid surface shimmer
      c.fillStyle='rgba(255,255,255,0.28)';
      c.beginPath(); c.ellipse(bx, liqY+2, bW/2-6, 4, 0, 0, Math.PI*2); c.fill();

      // Ripple when paper dips
      if(isActive && dipPhase>=1) {
        const rp=(dipProgress-0.38)*80;
        const ra=Math.max(0, 0.6-(dipProgress-0.38)*1.2);
        c.strokeStyle=`rgba(255,255,255,${ra})`;
        c.lineWidth=2;
        c.beginPath(); c.ellipse(bx, liqY+6, rp*0.4, rp*0.12, 0, 0, Math.PI*2); c.stroke();
      }

      // Color strip inside beaker after dipping (paper left a stain)
      if(isDipped) {
        const sc2=hexToRgb(sol.color);
        const stripG=c.createLinearGradient(0,liqY,0,by);
        stripG.addColorStop(0,`rgba(${sc2.r},${sc2.g},${sc2.b},0)`);
        stripG.addColorStop(0.4,`rgba(${sc2.r},${sc2.g},${sc2.b},0.35)`);
        stripG.addColorStop(1,`rgba(${sc2.r},${sc2.g},${sc2.b},0.5)`);
        c.fillStyle=stripG;
        c.beginPath();
        c.moveTo(bx-bW/2+3, liqY); c.lineTo(bx-bW/2+1, by+2);
        c.lineTo(bx+bW/2-1, by+2); c.lineTo(bx+bW/2-3, liqY);
        c.closePath(); c.fill();
      }

      // Emoji label on beaker
      c.font=`${Math.round(bW*0.45)}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(sol.emoji, bx, by-bH*0.35);

      // Text label below (more spacing for readability)
      const labelFontSize = Math.max(9, Math.round(w * 0.018));
      const phFontSize = Math.max(10, Math.round(w * 0.02));
      const lineStep = Math.max(15, Math.round(labelFontSize * 1.55));
      const labelY = by + 14;
      const phGap = 10; // extra gap between label and pH

      c.font = `bold ${labelFontSize}px Tajawal`;
      c.fillStyle = '#334';
      c.textAlign = 'center';
      c.textBaseline = 'top';
      const lLines = sol.label.split('\n');
      lLines.forEach((line, li) => c.fillText(line, bx, labelY + li * lineStep));

      // pH label (placed with clear separation)
      c.font = `bold ${phFontSize}px Tajawal`;
      c.fillStyle = '#1A8FA8';
      c.fillText('pH = ' + sol.ph, bx, labelY + lLines.length * lineStep + phGap);

      // Ripple ring
      if(lastDipped===sol.id && dipAnim>0) {
        const dc=hexToRgb(sol.color);
        c.strokeStyle=`rgba(${dc.r},${dc.g},${dc.b},${dipAnim})`;
        c.lineWidth=2.5;
        c.beginPath(); c.ellipse(bx, by-bH*0.4, (1-dipAnim)*bW*0.8, (1-dipAnim)*bW*0.25, 0, 0, Math.PI*2); c.stroke();
        dipAnim=Math.max(0,dipAnim-0.022);
      }
    });

    // ── Paper position during animation ──
    let drawPX=paperX*w, drawPY=paperY*h;
    let submergeDepth=0;

    if(isDipping && dipTarget) {
      const bi=SOLUTIONS.findIndex(s=>s.id===dipTarget.id);
      const bx=w*(0.1+bi*(0.82/(n-1)));
      const by=h*0.68, bH=Math.min(w*0.14,62)*1.2;
      const restY=0.14*h;

      if(dipPhase===0) {
        const t=dipProgress/0.38;
        drawPX=paperX*w+(bx-paperX*w)*t;
        drawPY=restY+(by-bH*0.7-restY)*t;
        submergeDepth=0;
      } else if(dipPhase===1) {
        drawPX=bx; drawPY=by-bH*0.7;
        submergeDepth=Math.min(44,(dipProgress-0.38)/0.37*44);
      } else {
        const t=(dipProgress-0.75)/0.25;
        drawPX=bx+(0.5*w-bx)*t;
        drawPY=(by-bH*0.7)+(0.14*h-(by-bH*0.7))*t;
        submergeDepth=Math.max(0,44-t*44);
      }
    }

    // ── Draw litmus paper — bigger & clearer ──
    c.save();
    const px=drawPX, py=drawPY;
    const pW=22, pHstrip=56, pHhandle=28;
    const fc=paperColor;

    // Drop shadow
    c.fillStyle='rgba(0,0,0,0.1)';
    c.beginPath(); c.ellipse(px+4, py+pHhandle+pHstrip+4, pW*0.5, 5, 0, 0, Math.PI*2); c.fill();

    // Handle (wooden/beige grip)
    const hGrad=c.createLinearGradient(px-pW/2,0,px+pW/2,0);
    hGrad.addColorStop(0,'#E8D8A8'); hGrad.addColorStop(0.5,'#F4E8C0'); hGrad.addColorStop(1,'#D8C898');
    c.fillStyle=hGrad;
    c.strokeStyle='rgba(140,110,50,0.3)'; c.lineWidth=1;
    c.beginPath(); c.roundRect(px-pW/2, py, pW, pHhandle, [4,4,0,0]); c.fill(); c.stroke();

    // Grip lines on handle
    for(let i=0;i<4;i++) {
      c.strokeStyle='rgba(120,90,40,0.2)'; c.lineWidth=0.8;
      c.beginPath(); c.moveTo(px-pW/2+4, py+7+i*5); c.lineTo(px+pW/2-4, py+7+i*5); c.stroke();
    }

    // Strip — with clipping for submerged part
    c.save();
    const visH=Math.max(2, pHstrip-submergeDepth);
    c.beginPath(); c.rect(px-pW/2, py+pHhandle, pW, visH); c.clip();

    // Color bleeds up from bottom
    const blendT=colorProgress;
    const beigePx=Math.round(pHstrip*(1-blendT));
    const colorPx=pHstrip-beigePx;

    // Beige top portion
    if(beigePx>0 && beigePx<visH) {
      c.fillStyle='rgba(220,208,170,1)';
      c.beginPath(); c.rect(px-pW/2+1, py+pHhandle, pW-2, Math.min(beigePx,visH)); c.fill();
    }

    // Colored bottom portion — gradient for realism
    if(colorPx>0) {
      const sy=py+pHhandle+beigePx;
      const sh=Math.min(colorPx, visH-beigePx);
      if(sh>0) {
        // Color bleeds: gradient from light at top edge to full at bottom
        const cg=c.createLinearGradient(0, sy, 0, sy+sh);
        cg.addColorStop(0, `rgba(${fc.r},${fc.g},${fc.b},${0.5+blendT*0.3})`);
        cg.addColorStop(0.3, `rgba(${fc.r},${fc.g},${fc.b},${0.7+blendT*0.25})`);
        cg.addColorStop(1,   `rgba(${fc.r},${fc.g},${fc.b},1)`);
        c.fillStyle=cg;
        c.beginPath(); c.rect(px-pW/2+1, sy, pW-2, sh); c.fill();

        // "Wet" spreading effect at the boundary
        if(blendT>0.05 && blendT<0.99) {
          c.fillStyle=`rgba(${fc.r},${fc.g},${fc.b},0.3)`;
          c.beginPath(); c.ellipse(px, sy+2, pW/2-1, 4, 0, 0, Math.PI*2); c.fill();
        }
      }
    } else {
      // Full beige
      c.fillStyle='rgba(220,208,170,1)';
      c.beginPath(); c.rect(px-pW/2+1, py+pHhandle, pW-2, visH); c.fill();
    }

    // Paper texture lines
    c.strokeStyle='rgba(0,0,0,0.06)'; c.lineWidth=0.6;
    for(let i=0;i<7;i++){
      const ly=py+pHhandle+4+i*7;
      if(ly<py+pHhandle+visH-2){ c.beginPath(); c.moveTo(px-pW/2+3,ly); c.lineTo(px+pW/2-3,ly); c.stroke(); }
    }

    // Shine on paper
    c.fillStyle='rgba(255,255,255,0.22)';
    c.beginPath(); c.rect(px-pW/2+2, py+pHhandle+1, 5, visH-2); c.fill();

    // Paper outline
    c.strokeStyle='rgba(0,0,0,0.15)'; c.lineWidth=1.2;
    c.beginPath(); c.roundRect(px-pW/2, py+pHhandle, pW, visH, [0,0,4,4]); c.stroke();

    c.restore(); // unclip

    // "ورق تباع الشمس" label
    if(!isDipping) {
      c.font=`bold 12px Tajawal`; c.fillStyle='rgba(60,45,20,0.85)';
      c.textAlign='center'; c.textBaseline='top';
      c.fillText('ورق تبّاع الشمس', px, py+pHhandle+pHstrip+6);
    }

    // Color result badge floating above
    if(colorProgress>0.45 && lastDipped && !isDipping) {
      const dp=SOLUTIONS.find(s=>s.id===lastDipped);
      if(dp) {
        const badgeText = `${dp.typeLabel} — ${dp.label.replace('\n',' ')}`;
        c.font='bold 13px Tajawal';
        const textW = c.measureText(badgeText).width;
        const badgeW = textW + 28;   // نص + هامش كافٍ
        const badgeH = 32;
        // خلفية محايدة هادئة — لا علاقة لها بلون المحلول
        c.fillStyle='rgba(30,45,70,0.10)';
        c.strokeStyle='rgba(30,45,70,0.30)';
        c.lineWidth=1.5;
        c.beginPath(); c.roundRect(px-badgeW/2, py-48, badgeW, badgeH, 10); c.fill(); c.stroke();
        c.fillStyle='rgba(30,45,70,0.85)';
        c.textAlign='center'; c.textBaseline='middle';
        c.fillText(badgeText, px, py-48+badgeH/2);
      }
    }

    c.restore();

    animFrame=requestAnimationFrame(draw);
  }

  // ── Drag logic ──
  function getPos(e){
    const r=canvas.getBoundingClientRect();
    const touch=e.touches&&e.touches[0]||e;
    return { x:(touch.clientX-r.left)*canvas.width/r.width, y:(touch.clientY-r.top)*canvas.height/r.height };
  }
  function onStart(e){
    if(isDipping) return;
    e.preventDefault&&e.preventDefault();
    const pos=getPos(e);
    const px=paperX*canvas.width, py=(paperY+0.05)*canvas.height;
    if(Math.hypot(pos.x-px, pos.y-py)<60) dragging=true;
  }
  function onMove(e){
    if(!dragging||isDipping) return;
    e.preventDefault&&e.preventDefault();
    const pos=getPos(e);
    paperX=Math.max(0.05,Math.min(0.95,pos.x/canvas.width));
    paperY=Math.max(0.03,Math.min(0.65,(pos.y-35)/canvas.height));
  }
  function onEnd(e){
    if(!dragging||isDipping) return;
    dragging=false;
    const py2=paperY*canvas.height;
    if(py2>canvas.height*0.38){
      const n=SOLUTIONS.length;
      let closest=null, minDist=Infinity;
      SOLUTIONS.forEach((sol,i)=>{
        const bx=0.1+i*(0.82/(n-1));
        const d=Math.abs(paperX-bx);
        if(d<minDist){minDist=d;closest=sol;}
      });
      if(closest && minDist<0.13){
        isDipping=true; dipProgress=0; dipPhase=0;
        dipTarget=closest; lastDipped=closest.id;
        dipAnim=1; dipCount++;
        colorProgress=0;
        simState.dipped[closest.id]=true;
        U9Sound.ping(600,0.15,0.12);
        setTimeout(()=>{
          const box=document.getElementById('dipResult');
          if(box){
            box.innerHTML=`
              <div style="display:flex;align-items:center;gap:8px;justify-content:center;margin-bottom:4px">
                <span style="font-size:22px">${closest.emoji}</span>
                <strong style="font-size:15px;color:#222">${closest.label.replace('\n',' ')}</strong>
              </div>
              <div style="color:${closest.color};font-weight:700;font-size:15px">
                ${closest.typeLabel} — pH ${closest.ph}
              </div>
              <div style="font-size:13px;color:#555;margin-top:3px">
                ${closest.type==='acid'?'الورقة تحمرّ 🔴 — حمض':closest.type==='neutral'?'الورقة تبقى بنفسجية 🟣 — متعادل':'الورقة تزرقّ 🔵 — قلوي'}
              </div>`;
            box.style.borderRight=`4px solid ${closest.color}`;
          }
          const sc=document.getElementById('dipScore');
          const done=Object.keys(simState.dipped).length;
          if(sc) sc.textContent=`✅ ${done} من ${SOLUTIONS.length} محاليل مكتملة`;
          if(done===SOLUTIONS.length)
            setTimeout(()=>buddySay('ممتاز! 🌟 اختبرتِ جميع المحاليل — أحمر=حمض، بنفسجي=متعادل، أزرق=قلوي!',7000),500);
        },600);
        return;
      }
    }
    paperX=0.5; paperY=0.14;
  }

  canvas.onmousedown=onStart; canvas.onmousemove=onMove; canvas.onmouseup=onEnd;
  canvas.addEventListener('touchstart',onStart,{passive:false});
  canvas.addEventListener('touchmove',onMove,{passive:false});
  canvas.addEventListener('touchend',onEnd,{passive:false});
  draw();
}

// ── 11-2 Tab 2: صنع كاشفك — تفاعلي ──
function simIndicator2() {
  cancelAnimationFrame(animFrame);

  const STEPS = [
    { id:'cut',   title:'١- اقطع المادة النباتية', icon:'✂️', btn:'✂️ اضغط للقطع',    color:'#E91E63', done:false },
    { id:'grind', title:'٢- اطحن الأجزاء',         icon:'🪨', btn:'🪨 اضغط للطحن',    color:'#9C27B0', done:false },
    { id:'filter',title:'٣- صفّي السائل',           icon:'🫗', btn:'🫗 اضغط للتصفية',  color:'#673AB7', done:false },
    { id:'test',  title:'٤- اختبر موادّ مختلفة',   icon:'🧪', btn:'🧪 اختبر الآن',    color:'#3F51B5', done:false },
    { id:'record',title:'٥- سجّل الألوان',          icon:'📝', btn:'📝 سجّل النتائج',  color:'#2196F3', done:false },
  ];

  const RESULTS = [
    { material:'عصير الليمون',        color:'rgba(240,215,100,0.45)', colorSolid:'#C8A830', ph:'pH 2', label:'حمضي 🔴' },
    { material:'الماء',               color:'rgba(195,225,245,0.38)', colorSolid:'#90B8CC', ph:'pH 7', label:'متعادل 💜' },
    { material:'محلول الصابون',       color:'rgba(195,228,245,0.38)', colorSolid:'#90B8CC', ph:'pH 9', label:'قلوي 🟢' },
    { material:'هيدروكسيد الصوديوم', color:'rgba(210,218,228,0.38)', colorSolid:'#A0ACBA', ph:'pH 13',label:'قلوي قوي 🔵' },
  ];

  simState = {
    t: 0,
    step: 0,
    anim: null,
    animT: 0,
    particles: [],
    liquid: 0,
    testIdx: -1,      // أنبوبة الاختبار الحالية (-1 = لم نبدأ)
    completed: [],    // الأنابيب المكتملة [0,1,2,3]
    recorded: [],
    done: false,
  };

  // ── Controls panel ──
  controls(`
    <div style="font-size:13px;color:#888;margin-bottom:10px;text-align:center">مراحل صنع الكاشف الطبيعي</div>
    <div id="stepsList" style="display:flex;flex-direction:column;gap:5px">
      ${STEPS.map((s,i)=>`
        <div id="stepItem${i}" style="padding:7px 10px;border-radius:8px;
          background:${i===0?'rgba(26,143,168,0.12)':'rgba(0,0,0,0.03)'};
          border:1.5px solid ${i===0?'rgba(26,143,168,0.4)':'rgba(0,0,0,0.08)'};
          font-size:13px;color:#444;display:flex;align-items:center;gap:6px">
          <span id="stepCheck${i}" style="font-size:15px">${s.icon}</span>
          <span>${s.title}</span>
        </div>`).join('')}
    </div>
    <button id="actionBtn" onclick="ind2Action()"
      style="margin-top:12px;width:100%;padding:13px;border-radius:10px;
      background:linear-gradient(135deg,#E91E63,#C2185B);color:white;border:none;
      font-family:Tajawal;font-size:15px;font-weight:700;cursor:pointer;
      box-shadow:0 4px 14px rgba(233,30,99,0.4);transition:all 0.2s">
      ✂️ اضغط للقطع
    </button>
    <div id="ind2Msg" style="margin-top:8px;font-size:13px;text-align:center;
      color:#888;min-height:18px"></div>
    <div style="margin-top:8px;padding:7px;background:#f8f9fa;border-radius:8px;
      font-size:12px;color:#777;text-align:center">📖 ص83 — نشاط 2-11</div>
    <div class="q-box" style="margin-top:8px"><strong>❓ ص٨٢:</strong> كيف يُوضِّح الكاشف الفرق بين الحمض والقلويّ؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">يتحوّل لون الكاشف لألوان مختلفة — أحمر/برتقالي للأحماض، وأزرق/أخضر للقلويّات.</div>
    </div>
  `);

  // ── Global action handler ──
  window.ind2Action = function() {
    const s = STEPS[simState.step];
    if(simState.anim) return; // animation in progress

    // Special: step 3 (test) — button triggers current testIdx tube
    if(s.id === 'test') {
      if(simState.testIdx < 0) simState.testIdx = 0;
      simState.anim = 'test';
      simState.animT = 0;
      const btn = document.getElementById('actionBtn');
      if(btn){ btn.textContent='⏳ جارٍ...'; btn.style.opacity='0.7'; btn.style.cursor='wait'; }
      U9Sound.ping(523, 0.2, 0.15);
      return;
    }

    simState.anim = s.id;
    simState.animT = 0;

    // Generate particles based on step
    simState.particles = [];
    if(s.id === 'cut') {
      // Red cabbage leaf pieces falling
      for(let i=0;i<18;i++) simState.particles.push({
        x: 0.3+Math.random()*0.4, y: -0.05-Math.random()*0.2,
        vy: 0.004+Math.random()*0.006, vx: (Math.random()-0.5)*0.003,
        r: 8+Math.random()*12, a: Math.random()*Math.PI*2,
        col: `rgba(${150+Math.floor(Math.random()*80)},${20+Math.floor(Math.random()*40)},${80+Math.floor(Math.random()*60)},0.85)`,
        shape: Math.random()>0.5?'leaf':'rect'
      });
    } else if(s.id === 'grind') {
      // Grinding particles spiraling
      for(let i=0;i<24;i++) simState.particles.push({
        angle: (i/24)*Math.PI*2, r: 0.08+Math.random()*0.12,
        speed: 0.04+Math.random()*0.03,
        col: `rgba(${120+Math.floor(Math.random()*80)},${10+Math.floor(Math.random()*30)},${100+Math.floor(Math.random()*60)},0.8)`,
        size: 4+Math.random()*8, life:1
      });
    } else if(s.id === 'filter') {
      simState.liquid = 0;
    }

    // Update button to show "جارٍ..."
    const btn = document.getElementById('actionBtn');
    if(btn){ btn.textContent = '⏳ جارٍ...'; btn.style.opacity='0.7'; btn.style.cursor='wait'; }

    U9Sound.ping(523, 0.2, 0.15);
  };

  window.ind2SelectTest = function(idx) {
    simState.testIdx = idx;
    U9Sound.ping(660, 0.15, 0.12);
  };

  const canvas = document.getElementById('simCanvas');

  function draw() {
    const c = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    c.clearRect(0,0,w,h);
    simState.t += 0.02;

    const step = simState.step;
    const S = STEPS[step];

    // ── Background gradient ──
    const bg = c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0, '#FAFBFF');
    bg.addColorStop(1, '#F0F4FF');
    c.fillStyle = bg; c.fillRect(0,0,w,h);

    // ── Progress bar at top ──
    c.fillStyle = 'rgba(0,0,0,0.06)';
    c.beginPath(); c.roundRect(w*0.1, 12, w*0.8, 8, 4); c.fill();
    c.fillStyle = S.color;
    c.beginPath(); c.roundRect(w*0.1, 12, w*0.8*(step+1)/STEPS.length, 8, 4); c.fill();
    c.font='bold 11px Tajawal'; c.fillStyle='#888'; c.textAlign='center';
    c.fillText(`الخطوة ${step+1} من ${STEPS.length}`, w/2, 10);

    // ── STEP-SPECIFIC ANIMATIONS ──
    if(step === 0) drawStepCut(c,w,h);
    else if(step === 1) drawStepGrind(c,w,h);
    else if(step === 2) drawStepFilter(c,w,h);
    else if(step === 3) drawStepTest(c,w,h);
    else if(step === 4) drawStepRecord(c,w,h);

    // ── Advance animation ──
    if(simState.anim) {
      simState.animT += 0.007;
      if(simState.animT >= 1) {
        finishStep();
      }
    }

    animFrame = requestAnimationFrame(draw);
  }

  // ── Step 1: Cut ──
  function drawStepCut(c,w,h) {
    // Cabbage head
    const cx=w/2, cy=h*0.35;
    const bob = Math.sin(simState.t)*4;

    if(!simState.anim) {
      // Idle: cabbage bouncing
      c.save(); c.translate(cx, cy+bob);
      drawCabbage(c, 0, 0, 70);
      c.restore();
      // Scissors hint
      c.font='32px serif'; c.textAlign='center';
      c.fillText('✂️', cx+80, cy+bob-20);
      c.font='14px Tajawal'; c.fillStyle='#888'; c.textAlign='center';
      c.fillText('اضغط الزر للقطع!', w/2, h*0.6);
    } else {
      // Animation: cabbage gets cut, pieces fly
      const t = simState.animT;
      // Draw shrinking cabbage
      c.save(); c.translate(cx, cy);
      drawCabbage(c, 0, 0, 70*(1-t*0.5));
      c.restore();
      // Scissors moving
      c.save(); c.translate(cx + (t-0.5)*120, cy - 20);
      c.font=`${28+t*10}px serif`; c.textAlign='center';
      c.fillText('✂️', 0, 0);
      c.restore();
      // Particles flying out
      simState.particles.forEach(p => {
        p.y += p.vy * (t*2+0.5);
        p.x += p.vx;
        p.a += 0.05;
        const px=p.x*w, py=p.y*h+h*0.2+t*h*0.4;
        if(py>h+20) return;
        c.save(); c.translate(px,py); c.rotate(p.a);
        c.fillStyle = p.col;
        if(p.shape==='leaf') {
          c.beginPath(); c.ellipse(0,0,p.r,p.r*0.5,0,0,Math.PI*2); c.fill();
        } else {
          c.fillRect(-p.r/2,-p.r/2,p.r,p.r);
        }
        c.restore();
      });
    }
  }

  function drawCabbage(c, x, y, r) {
    // Outer leaves
    const cols=['#C0392B','#922B21','#A93226','#CB4335'];
    for(let i=0;i<8;i++){
      const a=(i/8)*Math.PI*2;
      c.fillStyle=cols[i%cols.length];
      c.beginPath(); c.ellipse(x+Math.cos(a)*r*0.6, y+Math.sin(a)*r*0.6, r*0.55, r*0.38, a, 0, Math.PI*2); c.fill();
    }
    // Center
    c.fillStyle='#8E2020';
    c.beginPath(); c.arc(x,y,r*0.42,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,255,255,0.15)';
    c.beginPath(); c.arc(x-r*0.12,y-r*0.12,r*0.18,0,Math.PI*2); c.fill();
  }

  // ── Step 2: Grind ──
  function drawStepGrind(c,w,h) {
    const cx=w/2, cy=h*0.38;
    // Mortar (هاون)
    c.fillStyle='#8D8D8D';
    c.beginPath(); c.ellipse(cx,cy+55,65,18,0,0,Math.PI*2); c.fill();
    c.fillStyle='#A0A0A0';
    c.beginPath();
    c.moveTo(cx-65,cy+55); c.quadraticCurveTo(cx-70,cy-15,cx-45,cy-20);
    c.lineTo(cx+45,cy-20); c.quadraticCurveTo(cx+70,cy-15,cx+65,cy+55); c.closePath(); c.fill();
    c.fillStyle='rgba(255,255,255,0.12)';
    c.beginPath(); c.ellipse(cx-10,cy+10,25,35,Math.PI/6,0,Math.PI*2); c.fill();

    // Purple-red liquid filling (natural red cabbage juice color)
    const fill = simState.anim ? Math.min(simState.animT*1.4, 0.85) : 0;
    if(fill>0) {
      const liquidH = fill*70;
      c.fillStyle=`rgba(180,120,150,${fill*0.28})`;
      c.beginPath();
      c.moveTo(cx-60+fill*15, cy+55-liquidH);
      c.quadraticCurveTo(cx, cy+55-liquidH-8, cx+60-fill*15, cy+55-liquidH);
      c.lineTo(cx+60, cy+55); c.quadraticCurveTo(cx,cy+72,cx-60,cy+55); c.closePath(); c.fill();
    }

    // Pestle (مدقة)
    const pestleAngle = simState.anim ? Math.sin(simState.animT*Math.PI*8)*0.4 : Math.sin(simState.t)*0.15;
    c.save(); c.translate(cx+20, cy-30); c.rotate(pestleAngle);
    c.fillStyle='#B0B0B0';
    c.beginPath(); c.roundRect(-8,-55,16,85,8); c.fill();
    c.fillStyle='#999';
    c.beginPath(); c.ellipse(0,30,14,10,0,0,Math.PI*2); c.fill();
    c.restore();

    // Particles inside mortar (pieces)
    if(!simState.anim) {
      // Show cabbage pieces waiting
      [{x:-20,y:20},{x:10,y:15},{x:-5,y:30},{x:25,y:25}].forEach(p=>{
        c.fillStyle='rgba(150,30,80,0.8)';
        c.beginPath(); c.ellipse(cx+p.x,cy+p.y,9,6,Math.random()*Math.PI,0,Math.PI*2); c.fill();
      });
      c.font='14px Tajawal'; c.fillStyle='#888'; c.textAlign='center';
      c.fillText('اضغط للطحن!', w/2, h*0.72);
    } else {
      // Grinding particles
      simState.particles.forEach(p=>{
        p.angle += p.speed;
        const t=simState.animT;
        const radius = p.r*w*(1-t*0.5);
        const px=cx+Math.cos(p.angle)*radius;
        const py=cy+30+Math.sin(p.angle)*radius*0.4;
        const alpha=Math.max(0, 1-t*0.5);
        c.fillStyle=p.col.replace('0.8)', `${alpha})`);
        c.beginPath(); c.arc(px,py,p.size*(1-t*0.6),0,Math.PI*2); c.fill();
      });
    }
  }

  // ── Step 3: Filter ──
  function drawStepFilter(c,w,h) {
    const cx=w/2;
    // Funnel (triangle) above a beaker (more "lab" looking)
    const funnelTop=h*0.17, funnelMid=h*0.41;
    c.strokeStyle='#888'; c.lineWidth=2;
    c.beginPath(); c.moveTo(cx-60,funnelTop); c.lineTo(cx,funnelMid); c.lineTo(cx+60,funnelTop); c.stroke();
    c.beginPath(); c.moveTo(cx-60,funnelTop); c.lineTo(cx+60,funnelTop); c.stroke();
    // Filter paper
    c.fillStyle='rgba(255,240,200,0.65)'; c.strokeStyle='#DEB887';
    c.beginPath(); c.moveTo(cx-54,funnelTop+2); c.lineTo(cx,funnelMid-2); c.lineTo(cx+54,funnelTop+2); c.closePath();
    c.fill(); c.stroke();
    // Funnel neck
    c.strokeStyle='#777';
    c.beginPath(); c.moveTo(cx-6,funnelMid); c.lineTo(cx-6,h*0.56); c.stroke();
    c.beginPath(); c.moveTo(cx+6,funnelMid); c.lineTo(cx+6,h*0.56); c.stroke();

    // Beaker
    const bW=Math.min(w*0.28,160), bH=Math.min(h*0.22,120);
    const bX=cx-bW/2, bY=h*0.58;
    c.fillStyle='rgba(210,225,255,0.28)'; c.strokeStyle='#888'; c.lineWidth=2;
    c.beginPath(); c.roundRect(bX,bY,bW,bH,16); c.fill(); c.stroke();
    // Beaker rim
    c.strokeStyle='rgba(120,150,200,0.7)'; c.lineWidth=3;
    c.beginPath(); c.moveTo(bX+10,bY); c.lineTo(bX+bW-10,bY); c.stroke();

    // Liquid dripping
    const fill = simState.anim ? Math.min(simState.animT*1.2, 1) : simState.liquid;
    if(fill>0) {
      // Drop in beaker
      const dropY=funnelMid+fill*(h*0.18);
      c.fillStyle='rgba(160,100,130,0.4)';
      c.beginPath(); c.arc(cx,dropY,4,0,Math.PI*2); c.fill();
      // Liquid in beaker
      const liqH=fill*(bH*0.65);
      c.fillStyle='rgba(170,110,140,0.28)';
      c.beginPath(); c.roundRect(bX+10,bY+bH-liqH-8,bW-20,liqH, liqH<16?liqH:0); c.fill();
    }
    if(!simState.anim) {
      c.font='14px Tajawal'; c.fillStyle='#888'; c.textAlign='center';
      c.fillText('اضغط للتصفية!', w/2, h*0.78);
    }
    if(simState.anim) simState.liquid = Math.min(simState.animT, 1);
  }

  // ── Step 4: Test materials ──
  function drawStepTest(c,w,h) {
    const labels=['ليمون','ماء','صابون','NaOH'];
    const phLabels=['pH 2','pH 7','pH 9','pH 13'];

    // 4 test tubes side by side
    RESULTS.forEach((res,i)=>{
      const tx = w*0.12 + i*(w*0.22);
      const ty = h*0.2;
      const isSelected   = simState.testIdx === i;
      const isAnimating  = simState.anim === 'test' && simState.testIdx === i;
      const isDone       = (simState.completed && simState.completed.indexOf(i) >= 0) || simState.done;
      const fillRatio    = isAnimating ? Math.min(simState.animT*1.3,1) : isDone ? 1 : 0;

      // Tube glass outline
      c.fillStyle = isSelected ? 'rgba(26,143,168,0.06)':'rgba(245,248,255,0.7)';
      c.strokeStyle = isSelected ? '#1A8FA8' : '#AAA';
      c.lineWidth = isSelected?2:1.5;
      c.beginPath(); c.roundRect(tx-14,ty,28,80,14); c.fill(); c.stroke();
      // Glass shine
      c.fillStyle='rgba(255,255,255,0.4)';
      c.beginPath(); c.roundRect(tx-10,ty+4,6,30,3); c.fill();

      // Liquid — natural color
      if(fillRatio>0){
        const liqH=fillRatio*62;
        c.fillStyle = res.color;
        c.beginPath(); c.roundRect(tx-11,ty+80-liqH,22,liqH, liqH<12?liqH:0); c.fill();
        // Liquid surface shimmer
        c.fillStyle='rgba(255,255,255,0.35)';
        c.beginPath(); c.ellipse(tx, ty+80-liqH+2, 9, 2.5, 0, 0, Math.PI*2); c.fill();
      }

      // Label
      c.font=`bold 11px Tajawal`; c.fillStyle='#444'; c.textAlign='center';
      c.fillText(labels[i], tx, ty+96);
      c.font='10px Tajawal'; c.fillStyle='#888';
      c.fillText(phLabels[i], tx, ty+108);

      // Tap indicator
      if(!simState.anim && (simState.testIdx == null || simState.testIdx <= i)) {
        c.font='18px serif'; c.textAlign='center';
        c.fillText('👆', tx, ty-8);
      }
    });

    // Canvas click: allow clicking the CURRENT tube as alternative to button
    if(!canvas._ind2Click) {
      canvas._ind2Click = function(e){
        if(simState.step!==3 || simState.anim) return;
        const rect=canvas.getBoundingClientRect();
        const mx=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX-rect.left)*(canvas.width/rect.width);
        const my=(e.clientY-rect.top)*(canvas.height/rect.height);
        const cw=canvas.width, ch=canvas.height;
        const i = simState.testIdx < 0 ? 0 : simState.testIdx;
        const tx=cw*0.12+i*(cw*0.22), ty=ch*0.2;
        if(mx>tx-22&&mx<tx+22&&my>ty-10&&my<ty+90){
          window.ind2Action();
        }
      };
      canvas.addEventListener('click', canvas._ind2Click);
    }

    // Dropper animation
    if(simState.anim && simState.testIdx>=0){
      const i=simState.testIdx;
      const tx=w*0.12+i*(w*0.22);
      const t=simState.animT;
      const dropperY=h*0.05+t*h*0.22;
      c.font=`${20+t*5}px serif`; c.textAlign='center';
      c.fillText('💧', tx, dropperY);
    }

    // Instruction
    if(simState.testIdx<0){
      c.font='14px Tajawal'; c.fillStyle='#888'; c.textAlign='center';
      c.fillText('اضغط على كل أنبوبة لإضافة الكاشف!', w/2, h*0.75);
    } else if(!simState.done){
      const remaining=RESULTS.length-simState.testIdx-(simState.anim?0:1);
      c.font='13px Tajawal'; c.fillStyle='#666'; c.textAlign='center';
      c.fillText(remaining>0?`${remaining} أنابيب متبقية — اضغط عليها`:'✅ كل الأنابيب جاهزة!', w/2,h*0.75);
    }
  }

  // ── Step 5: Record ──
  function drawStepRecord(c,w,h) {
    c.font='bold 16px Tajawal'; c.fillStyle='#333'; c.textAlign='center';
    c.fillText('نتائج الكاشف الطبيعي 🌸', w/2, h*0.15);

    const rowH=50, startY=h*0.22;
    RESULTS.forEach((res,i)=>{
      const y=startY+i*rowH;
      const show=simState.anim?simState.animT>(i/RESULTS.length):simState.done;
      if(!show) return;
      // Row bg
      c.fillStyle=i%2===0?'rgba(0,0,0,0.03)':'rgba(0,0,0,0.01)';
      c.beginPath(); c.roundRect(w*0.05,y,w*0.9,rowH-4,6); c.fill();
      // Color swatch — natural color with border
      c.fillStyle = res.colorSolid;
      c.strokeStyle = 'rgba(0,0,0,0.15)';
      c.lineWidth = 1;
      c.beginPath(); c.arc(w*0.12,y+rowH/2-2,13,0,Math.PI*2); c.fill(); c.stroke();
      // Shine on swatch
      c.fillStyle='rgba(255,255,255,0.4)';
      c.beginPath(); c.arc(w*0.12-4,y+rowH/2-7,5,0,Math.PI*2); c.fill();
      // Material name
      c.font='bold 13px Tajawal'; c.fillStyle='#333'; c.textAlign='right';
      c.fillText(res.material, w*0.88, y+rowH/2+1);
      // Label — use dark readable color
      c.font='12px Tajawal'; c.fillStyle='#555'; c.textAlign='left';
      c.fillText(res.label+' '+res.ph, w*0.18, y+rowH/2+1);
    });

    if(!simState.anim && !simState.done){
      c.font='14px Tajawal'; c.fillStyle='#888'; c.textAlign='center';
      c.fillText('اضغط لتسجيل النتائج!', w/2, h*0.85);
    }
    if(simState.done){
      c.font='bold 15px Tajawal'; c.fillStyle='#27AE60'; c.textAlign='center';
      c.fillText('🎉 أحسنت! حضّرتِ الكاشف الطبيعي بنجاح!', w/2, h*0.88);
    }
  }

  // ── Finish step and advance ──
  function finishStep(){
    const step=simState.step;
    simState.anim=null; simState.animT=0;
    STEPS[step].done=true;

    // Special: step 3 (test) — need all 4 tubes
    if(step===3){
      const justDone = simState.testIdx;
      if(!simState.completed) simState.completed = [];
      simState.completed.push(justDone); // mark this tube as permanently filled
      if(justDone < RESULTS.length-1){
        // Move to next tube
        simState.testIdx = justDone + 1;
        const tubeNames = ['عصير الليمون','الماء','محلول الصابون','هيدروكسيد الصوديوم'];
        const nextCol   = RESULTS[simState.testIdx].color;
        const btn = document.getElementById('actionBtn');
        if(btn){
          btn.textContent = `🧪 اختبر ${tubeNames[simState.testIdx]}`;
          btn.style.background = `linear-gradient(135deg,${nextCol},${nextCol}CC)`;
          btn.style.boxShadow  = `0 4px 14px ${nextCol}66`;
          btn.style.opacity    = '1';
          btn.style.cursor     = 'pointer';
        }
        const msg = document.getElementById('ind2Msg');
        if(msg) msg.textContent = `✅ ${tubeNames[justDone]} — تم! (${justDone+1} من ${RESULTS.length})`;
        U9Sound.ping(660,0.18,0.12);
        return; // stay on step 3
      }
      // All 4 tubes done — fall through to advance
    }

    // Advance to next step
    if(step<STEPS.length-1){
      const nextStep=step+1;
      simState.step=nextStep;
      if(step===3) simState.testIdx=-1; // reset for display

      // Update step list highlight
      STEPS.forEach((_,i)=>{
        const el=document.getElementById('stepItem'+i);
        if(!el) return;
        if(i<nextStep){ el.style.background='rgba(39,174,96,0.1)'; el.style.borderColor='rgba(39,174,96,0.4)'; }
        else if(i===nextStep){ el.style.background='rgba(26,143,168,0.12)'; el.style.borderColor='rgba(26,143,168,0.4)'; }
        else { el.style.background='rgba(0,0,0,0.03)'; el.style.borderColor='rgba(0,0,0,0.08)'; }
        const check=document.getElementById('stepCheck'+i);
        if(check) check.textContent = i<nextStep?'✅':STEPS[i].icon;
      });

      // Update button
      const ns=STEPS[nextStep];
      const btn=document.getElementById('actionBtn');
      if(btn){
        btn.textContent=ns.btn;
        btn.style.background=`linear-gradient(135deg,${ns.color},${ns.color}CC)`;
        btn.style.boxShadow=`0 4px 14px ${ns.color}66`;
        btn.style.opacity='1'; btn.style.cursor='pointer';
      }
      const msg=document.getElementById('ind2Msg');
      if(msg) msg.textContent=`✅ ${STEPS[step].title} — تم!`;
      U9Sound.ping(660,0.2,0.15);

    } else {
      // All done!
      simState.done=true;
      const btn=document.getElementById('actionBtn');
      if(btn){btn.textContent='🎉 تم بنجاح!';btn.style.background='linear-gradient(135deg,#27AE60,#1E8449)';btn.style.opacity='1';}
      const msg=document.getElementById('ind2Msg');
      if(msg) msg.textContent='';
      U9Sound.win();
      buddySay('رائع! 🌸 حضّرتِ الكاشف الطبيعي بنجاح — الآن يمكنك تمييز الأحماض من القلويّات!', 6000);
    }
  }

  draw();
}

// ── 11-3 Tab 1: مقياس pH التفاعلي ──
function simPhScale1() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, phVal:7, probe:{ x:0.5, y:0.35, dragging:false } };
  const phColors = ['#C0392B','#D35400','#E67E22','#F39C12','#F1C40F','#D4E157','#7DC67E','#4CAF50','#26A69A','#0097A7','#006064','#1565C0','#283593','#4A148C'];
  const phLabels = [
    {ph:0,name:'حمض كبريتيك مركّز'},{ph:2,name:'حمض الهيدروكلوريك'},{ph:2.5,name:'عصير الليمون'},
    {ph:3,name:'الخل'},{ph:4,name:'عصير الطماطم'},{ph:6,name:'الحليب'},{ph:7,name:'الماء المقطّر'},
    {ph:8,name:'بيكربونات الصودا'},{ph:9,name:'الصابون'},{ph:11,name:'الأمونيا'},{ph:13,name:'هيدروكسيد الصوديوم'},
  ];
  controls(`
    <div style="font-size:14px;color:#555;text-align:center;margin-bottom:8px">اسحب المسبار لقياس pH أي محلول</div>
    <div style="display:flex;justify-content:center;align-items:center;gap:12px;margin-bottom:8px">
      <span style="font-size:28px;font-weight:bold" id="phDisplay">7.0</span>
      <span style="font-size:14px" id="phTypeBadge" style="padding:4px 10px;border-radius:12px;background:#e8f5e9;color:#27AE60">متعادل</span>
    </div>
    <div id="phNameDisplay" style="text-align:center;font-size:13px;color:#888;margin-bottom:8px">الماء المقطّر</div>
    <input type="range" min="0" max="14" step="0.1" value="7" id="phSlider" style="width:100%;accent-color:#1A8FA8">
    <div style="margin-top:8px;display:flex;justify-content:space-between;font-size:12px;color:#888">
      <span>0 حمض قويّ</span><span>7 متعادل</span><span>14 قلويّ قويّ</span>
    </div>
    <div style="margin-top:8px;padding:6px;background:#f8f9fa;border-radius:8px;font-size:13px;color:#555;text-align:center">📖 ص84 — مقياس الرقم الهيدروجينيّ</div>
    <div class="q-box"><strong>❓ أسئلة الكتاب (ص٨٤-٨٥):</strong><br>١- ما الرقم الهيدروجينيّ (pH) لمحلول متعادل؟<br>٢- سائل رقمه الهيدروجينيّ 1 — ما نوعه؟
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- الرقم الهيدروجينيّ للمحلول المتعادل = 7.<br>٢- حمض قويّ.</div>
  </div>`);
  function getPhColor(ph) {
    const idx = Math.min(13, Math.floor(ph));
    return phColors[idx] || '#9B59B6';
  }
  function updatePhDisplay(v) {
    const el=document.getElementById('phDisplay'), badge=document.getElementById('phTypeBadge'), nm=document.getElementById('phNameDisplay');
    if(el) { el.textContent = parseFloat(v).toFixed(1); el.style.color = getPhColor(v); }
    const type = v < 7 ? 'حمض' : v > 7 ? 'قلويّ' : 'متعادل';
    const typeBg = v < 7 ? '#FDEDEC' : v > 7 ? '#EBF5FB' : '#E9F7EF';
    const typeC = v < 7 ? '#C0392B' : v > 7 ? '#2471A3' : '#239B56';
    if(badge) { badge.textContent=type; badge.style.background=typeBg; badge.style.color=typeC; }
    // find closest name
    let closest = phLabels[0], minDist = 99;
    phLabels.forEach(l => { if(Math.abs(l.ph-v) < minDist){ minDist=Math.abs(l.ph-v); closest=l; } });
    if(nm && minDist < 1) nm.textContent = closest.name;
    else if(nm) nm.textContent = '';
  }
  sl('phSlider', function() { simState.phVal = parseFloat(this.value); updatePhDisplay(simState.phVal);  });
  const canvas = document.getElementById('simCanvas');
  function draw() {
    const c = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    c.clearRect(0,0,w,h); c.fillStyle='#F5F8FA'; c.fillRect(0,0,w,h);
    simState.t += 0.02;
    // pH bar
    const barX=w*0.07, barY=h*0.12, barW=w*0.86, barH=32;
    for(let i=0;i<=14;i++){
      const segW = barW/14;
      const grad = c.createLinearGradient(barX+i*segW,0,barX+(i+1)*segW,0);
      grad.addColorStop(0, phColors[Math.min(i,13)]);
      grad.addColorStop(1, phColors[Math.min(i+1,13)]);
      c.fillStyle=grad; c.fillRect(barX+i*segW, barY, segW+1, barH);
    }
    c.strokeStyle='rgba(0,0,0,0.15)'; c.lineWidth=1.5;
    c.beginPath(); c.roundRect(barX,barY,barW,barH,8); c.stroke();
    // tick marks
    for(let i=0;i<=14;i++){
      const tx = barX + i*barW/14;
      c.strokeStyle='rgba(255,255,255,0.6)'; c.lineWidth=1;
      c.beginPath(); c.moveTo(tx,barY+barH-6); c.lineTo(tx,barY+barH); c.stroke();
      c.font='11px Tajawal'; c.fillStyle='#444'; c.textAlign='center'; c.textBaseline='top';
      c.fillText(i, tx, barY+barH+4);
    }
    // labels
    c.font='bold 13px Tajawal'; c.fillStyle='rgba(192,57,43,0.9)'; c.textAlign='left'; c.textBaseline='top';
    c.fillText('← أكثر حامضيّة', barX, barY+barH+22);
    c.fillStyle='rgba(41,128,185,0.9)'; c.textAlign='right';
    c.fillText('أكثر قلويّة →', barX+barW, barY+barH+22);
    // indicator probe
    const pv = simState.phVal;
    const probX = barX + pv * barW/14;
    c.strokeStyle='#333'; c.lineWidth=2;
    c.beginPath(); c.moveTo(probX, barY-10); c.lineTo(probX, barY+barH+8); c.stroke();
    c.fillStyle=getPhColor(pv);
    c.beginPath(); c.arc(probX, barY-14, 10, 0, Math.PI*2); c.fill();
    c.strokeStyle='#fff'; c.lineWidth=1.5; c.stroke();
    c.font='bold 12px Tajawal'; c.fillStyle='#fff'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(pv.toFixed(0), probX, barY-14);
    // big beaker with color
    const beakX=w/2, beakY=h*0.65, beakW=110, beakH=120;
    c.strokeStyle='rgba(0,0,0,0.2)'; c.lineWidth=2.5;
    c.fillStyle='rgba(255,255,255,0.4)';
    c.beginPath(); c.roundRect(beakX-beakW/2, beakY-beakH/2, beakW, beakH, 10); c.fill(); c.stroke();
    const liquidColor = getPhColor(pv);
    const r=parseInt(liquidColor.slice(1,3),16), g=parseInt(liquidColor.slice(3,5),16), b=parseInt(liquidColor.slice(5,7),16);
    c.fillStyle=`rgba(${r},${g},${b},0.4)`;
    c.beginPath(); c.roundRect(beakX-beakW/2+6, beakY, beakW-12, beakH/2-6, 6); c.fill();
    // universal indicator strip
    c.fillStyle=liquidColor; c.fillRect(beakX-5, beakY-beakH/2+10, 10, 70);
    c.font='bold 16px Tajawal'; c.fillStyle=liquidColor; c.textAlign='center'; c.textBaseline='middle';
    const pType = pv<7?'حمض':pv>7?'قلويّ':'متعادل';
    c.fillText(`pH = ${pv.toFixed(1)} — ${pType}`, beakX, beakY + beakH/2 + 22);
    // wave animation in beaker
    c.save(); c.beginPath(); c.roundRect(beakX-beakW/2+6, beakY, beakW-12, beakH/2-6, 6); c.clip();
    c.fillStyle = `rgba(${r},${g},${b},0.15)`;
    for(let xi=0;xi<beakW;xi+=2){
      const wy = Math.sin(xi*0.2 + simState.t*2)*4;
      c.fillRect(beakX-beakW/2+xi, beakY+wy, 2, 10);
    }
    c.restore();
    animFrame = requestAnimationFrame(draw);
  }
  draw(); updatePhDisplay(7);
}

// ── 11-3 Tab 2: اختبر المحاليل ──
function simPhScale2() {
  cancelAnimationFrame(animFrame);
  const liquids = [
    { name:'عصير الليمون', ph:2.5, emoji:'🍋' },
    { name:'ماء مالح', ph:7, emoji:'🧂' },
    { name:'محلول الصابون', ph:9, emoji:'🧴' },
    { name:'مشروب الكولا', ph:3.5, emoji:'🥤' },
    { name:'الحليب', ph:6.5, emoji:'🥛' },
    { name:'الكلور المخفّف', ph:11, emoji:'🫧' },
  ];
  const phColors = ['#C0392B','#D35400','#E67E22','#F39C12','#F1C40F','#D4E157','#7DC67E','#4CAF50','#26A69A','#0097A7','#006064','#1565C0','#283593','#4A148C'];
  simState = { t:0, selected:null, results:{} };
  controls(`
    <div style="font-size:14px;color:#555;text-align:center;margin-bottom:8px">انقر على أي محلول لقياس رقمه الهيدروجينيّ</div>
    <div id="testResult" style="padding:12px;background:rgba(26,143,168,0.07);border-radius:10px;font-size:15px;color:#1A8FA8;text-align:center;min-height:60px;line-height:1.6">اختر محلولاً للاختبار 👆</div>
    <div style="margin-top:8px;font-size:12px;color:#888;text-align:center">استخدم الكاشف العام وسجّل النتائج</div>
    <button onclick="simState.results={};U9Sound.thud()" style="margin-top:8px;width:100%;padding:8px;border-radius:8px;background:rgba(192,57,43,0.1);border:1.5px solid rgba(192,57,43,0.3);color:#C0392B;font-family:Tajawal;font-size:14px;cursor:pointer">🔄 إعادة الاختبار</button>`);
  const canvas = document.getElementById('simCanvas');
  function draw() {
    const c = canvas.getContext('2d'); const w=canvas.width, h=canvas.height;
    c.clearRect(0,0,w,h); c.fillStyle='#F5F8FA'; c.fillRect(0,0,w,h);
    simState.t += 0.02;
    // pH bar at top
    const barX=w*0.07, barY=h*0.06, barW=w*0.86, barH=20;
    for(let i=0;i<=13;i++){
      c.fillStyle=phColors[i]; c.fillRect(barX+i*barW/14, barY, barW/14+1, barH);
    }
    c.strokeStyle='rgba(0,0,0,0.1)'; c.lineWidth=1; c.beginPath(); c.roundRect(barX,barY,barW,barH,6); c.stroke();
    for(let i=0;i<=14;i++){ c.font='10px Tajawal'; c.fillStyle='#555'; c.textAlign='center'; c.fillText(i,barX+i*barW/14,barY+barH+12); }
    // beakers
    const cols = 3, rows = 2;
    liquids.forEach((liq, idx) => {
      const col = idx % cols, row = Math.floor(idx/cols);
      const bx = (col+0.5) * w/cols, by = h*0.3 + row * h*0.32;
      const isSel = simState.selected === idx;
      const tested = simState.results[idx] !== undefined;
      const phC = phColors[Math.min(13, Math.floor(liq.ph))];
      const r2=parseInt(phC.slice(1,3),16), g2=parseInt(phC.slice(3,5),16), b2=parseInt(phC.slice(5,7),16);
      c.strokeStyle = isSel ? '#1A8FA8' : 'rgba(0,0,0,0.18)';
      c.lineWidth = isSel ? 2.5 : 1.5;
      c.fillStyle='rgba(255,255,255,0.7)';
      c.beginPath(); c.roundRect(bx-36, by-46, 72, 80, 8); c.fill(); c.stroke();
      if(tested){
        c.fillStyle=`rgba(${r2},${g2},${b2},0.35)`;
        c.beginPath(); c.roundRect(bx-32, by-16, 64, 44, 6); c.fill();
      }
      c.font='26px serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(liq.emoji, bx, by-22);
      c.font='bold 11px Tajawal'; c.fillStyle='#444'; c.textAlign='center'; c.textBaseline='top'; c.fillText(liq.name, bx, by+36);
      if(tested){
        // indicator arrow
        const arrowX = barX + liq.ph * barW/14;
        c.strokeStyle=phC; c.lineWidth=2;
        c.beginPath(); c.moveTo(arrowX, barY+barH); c.lineTo(arrowX, barY+barH+10); c.stroke();
        c.fillStyle=phC; c.beginPath(); c.arc(arrowX, barY+barH+14, 5, 0, Math.PI*2); c.fill();
        c.font='bold 11px Tajawal'; c.fillStyle=phC; c.textAlign='center'; c.textBaseline='top';
        c.fillText('pH '+liq.ph, bx, by+22);
      }
    });
    animFrame = requestAnimationFrame(draw);
  }
  canvas.onclick = function(e){
    const r=canvas.getBoundingClientRect(), mx=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX-r.left)*canvas.width/r.width, my=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientY-r.top)*canvas.height/r.height;
    const w=canvas.width, h=canvas.height, cols=3;
    liquids.forEach((liq, idx) => {
      const col=idx%cols, row=Math.floor(idx/cols);
      const bx=(col+0.5)*w/cols, by=h*0.3+row*h*0.32;
      if(Math.abs(mx-bx)<40 && Math.abs(my-by)<46){
        simState.selected=idx; simState.results[idx]=liq.ph; U9Sound.ping();
        const phC=phColors[Math.min(13,Math.floor(liq.ph))];
        const type=liq.ph<7?'حمض 🍋':liq.ph>7?'قلويّ 🧴':'متعادل ⚖️';
        const box=document.getElementById('testResult');
        if(box){box.innerHTML=`<strong>${liq.emoji} ${liq.name}</strong><br>pH = <strong style="color:${phC}">${liq.ph}</strong> — ${type}`;box.style.color=phC;}
      }
    });
  };
  draw();
}

// ── 11-4 Tab 1: تفاعل التعادُل ──
function simNeutral1() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, acidVol:50, baseVol:0, ph:1, mixing:false, particles:[] };
  for(let i=0;i<30;i++) simState.particles.push({x:Math.random(),y:Math.random(),type:'H',vx:(Math.random()-0.5)*0.002,vy:(Math.random()-0.5)*0.002});
  controls(`
    <div style="font-size:14px;color:#555;text-align:center;margin-bottom:8px">أضف القلويّ تدريجياً لمعادلة الحمض</div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <div style="text-align:center">
        <div style="font-size:22px">🔴</div>
        <div style="font-size:12px;color:#888">حمض</div>
        <div style="font-size:16px;font-weight:bold;color:#C0392B" id="acidVolLbl">50 mL</div>
      </div>
      <div style="text-align:center">
        <div style="font-size:22px">⚗️</div>
        <div style="font-size:12px;color:#888">pH الحالي</div>
        <div style="font-size:22px;font-weight:bold" id="neutralPhLbl" style="color:#C0392B">1.0</div>
      </div>
      <div style="text-align:center">
        <div style="font-size:22px">🔵</div>
        <div style="font-size:12px;color:#888">قلويّ</div>
        <div style="font-size:16px;font-weight:bold;color:#2471A3" id="baseVolLbl">0 mL</div>
      </div>
    </div>
    <input type="range" min="0" max="50" step="1" value="0" id="baseSlider" style="width:100%;accent-color:#2471A3">
    <div style="margin-top:8px;font-size:12px;color:#888;text-align:center">اسحب لإضافة القلويّ → pH يرتفع</div>
    <div id="neutralMsg" style="margin-top:6px;padding:8px;border-radius:8px;font-size:14px;text-align:center;background:rgba(26,143,168,0.07);color:#1A8FA8;min-height:36px"></div>
    <div style="margin-top:8px;padding:6px;background:#f8f9fa;border-radius:8px;font-size:13px;color:#555;text-align:center">📖 ص86 — التعادُل</div>
    <div class="q-box"><strong>❓ أسئلة الكتاب (ص٨٦-٨٧):</strong><br>١- ما لون الكاشف العام عندما يكون المحلول متعادلاً؟<br>٢- ما نوع التفاعل الذي يحدث عند خلط حمض مع قلويّ؟
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- اللون الأخضر.<br>٢- تفاعل التعادُل (Neutralisation).</div>
  </div>`);
  const phColors = ['#C0392B','#D35400','#E67E22','#F39C12','#F1C40F','#D4E157','#7DC67E','#4CAF50','#26A69A','#0097A7','#006064','#1565C0','#283593','#4A148C'];
  function getPh(base) { if(base<25) return 1+(base/25)*5.8; if(base===25) return 7; return 7+(base-25)/25*6; }
  function getPhColor(ph) { return phColors[Math.min(13,Math.floor(ph))]; }
  sl('baseSlider', function(){
    const bv = parseInt(this.value);
    simState.baseVol = bv; simState.acidVol = 50 - bv/2;
    simState.ph = getPh(bv);
    document.getElementById('baseVolLbl').textContent = bv + ' mL';
    document.getElementById('acidVolLbl').textContent = (50).toFixed(0) + ' mL';
    const lbl = document.getElementById('neutralPhLbl');
    if(lbl){ lbl.textContent = simState.ph.toFixed(1); lbl.style.color=getPhColor(simState.ph); }
    const msg = document.getElementById('neutralMsg');
    if(msg){
      if(bv<20) msg.textContent='الحمض لا يزال قويّاً — أضف المزيد من القلويّ 💧';
      else if(bv<24) msg.textContent='يقترب المحلول من التعادُل...';
      else if(bv===25||bv===24||bv===26) { msg.textContent='✅ تعادُل تام! pH = 7 — الكاشف أخضر 🟢'; msg.style.color='#27AE60'; U9Sound.win(); }
      else msg.textContent='المحلول أصبح قلويّاً — تم تجاوز نقطة التعادُل';
    }
    // update particles
    simState.particles.forEach(p => { p.type = simState.ph < 7 ? 'H' : simState.ph > 7 ? 'OH' : 'neutral'; });
  });
  const canvas = document.getElementById('simCanvas');
  function draw(){
    const c=canvas.getContext('2d'); const w=canvas.width, h=canvas.height;
    c.clearRect(0,0,w,h); c.fillStyle='#F5F8FA'; c.fillRect(0,0,w,h);
    simState.t += 0.025;
    const ph = simState.ph;
    const phC = getPhColor(ph);
    const r2=parseInt(phC.slice(1,3),16), g2=parseInt(phC.slice(3,5),16), b2=parseInt(phC.slice(5,7),16);
    // beaker
    const bx=w/2, by=h*0.55, bw=160, bh=140;
    c.strokeStyle='rgba(0,0,0,0.2)'; c.lineWidth=2.5;
    c.fillStyle='rgba(255,255,255,0.35)';
    c.beginPath(); c.roundRect(bx-bw/2, by-bh/2, bw, bh, 10); c.fill(); c.stroke();
    // liquid
    const fillH = bh * 0.6;
    c.fillStyle=`rgba(${r2},${g2},${b2},0.4)`;
    c.beginPath(); c.roundRect(bx-bw/2+5, by+bh/2-fillH, bw-10, fillH, 6); c.fill();
    // wave
    c.save(); c.beginPath(); c.roundRect(bx-bw/2+5,by+bh/2-fillH,bw-10,fillH,6); c.clip();
    c.fillStyle=`rgba(${r2},${g2},${b2},0.2)`;
    for(let xi=0;xi<bw-10;xi+=3){const wy=Math.sin(xi*0.15+simState.t*2)*6; c.fillRect(bx-bw/2+5+xi,by+bh/2-fillH+wy,3,12);}
    c.restore();
    // particles
    simState.particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if(p.x<0.15||p.x>0.85) p.vx=-p.vx;
      if(p.y<0.35||p.y>0.75) p.vy=-p.vy;
      const px2=p.x*w, py2=p.y*h;
      c.fillStyle = p.type==='H'?'rgba(192,57,43,0.7)': p.type==='OH'?'rgba(41,128,185,0.7)':'rgba(39,174,96,0.6)';
      c.beginPath(); c.arc(px2, py2, 5, 0, Math.PI*2); c.fill();
      c.font='9px Tajawal'; c.fillStyle='#fff'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(p.type==='H'?'H⁺':p.type==='OH'?'OH⁻':'💧', px2, py2);
    });
    // pH display
    c.font='bold 24px Tajawal'; c.fillStyle=phC; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('pH = ' + ph.toFixed(1), bx, by+bh/2+30);
    // pH bar
    const barX=w*0.07, barY=h*0.06, barW=w*0.86, barH=18;
    for(let i=0;i<=13;i++){c.fillStyle=phColors[i]; c.fillRect(barX+i*barW/14,barY,barW/14+1,barH);}
    c.strokeStyle='rgba(0,0,0,0.1)'; c.lineWidth=1; c.beginPath(); c.roundRect(barX,barY,barW,barH,5); c.stroke();
    const arrowX = barX + ph*barW/14;
    c.strokeStyle='#333'; c.lineWidth=2;
    c.beginPath(); c.moveTo(arrowX,barY+barH); c.lineTo(arrowX,barY+barH+10); c.stroke();
    c.fillStyle=phC; c.beginPath(); c.arc(arrowX,barY+barH+14,6,0,Math.PI*2); c.fill();
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 11-4 Tab 2: السحّاحة ──
function simNeutral2() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, drops:0, ph:13, particles:[], flowing:false, flowT:0 };
  controls(`
    <div style="font-size:14px;color:#555;text-align:center;margin-bottom:8px">أضف الحمض قطرةً قطرةً باستخدام السحّاحة</div>
    <button id="dropBtn" style="width:100%;padding:10px;border-radius:10px;background:rgba(231,76,60,0.12);border:1.5px solid rgba(231,76,60,0.35);color:#C0392B;font-family:Tajawal;font-size:15px;font-weight:bold;cursor:pointer">💧 أضف قطرة حمض</button>
    <div style="margin-top:8px;display:flex;justify-content:space-between">
      <div style="text-align:center;padding:8px;background:rgba(26,143,168,0.07);border-radius:8px;flex:1">
        <div style="font-size:12px;color:#888">الحجم المُضاف</div>
        <div style="font-size:18px;font-weight:bold;color:#1A8FA8" id="dropCount">0 mL</div>
      </div>
      <div style="width:8px"></div>
      <div style="text-align:center;padding:8px;background:rgba(26,143,168,0.07);border-radius:8px;flex:1">
        <div style="font-size:12px;color:#888">pH الحالي</div>
        <div style="font-size:22px;font-weight:bold" id="burettePhLbl">13.0</div>
      </div>
    </div>
    <div id="buretteMsg" style="margin-top:8px;padding:8px;border-radius:8px;font-size:14px;text-align:center;background:rgba(26,143,168,0.07);color:#1A8FA8;min-height:36px"></div>
    <button onclick="simState.drops=0;simState.ph=13;simState.particles=[];document.getElementById('dropCount').textContent='0 mL';document.getElementById('burettePhLbl').textContent='13.0';document.getElementById('burettePhLbl').style.color='#283593';document.getElementById('buretteMsg').textContent='';U9Sound.thud()" style="margin-top:8px;width:100%;padding:7px;border-radius:8px;background:rgba(0,0,0,0.04);border:1px solid rgba(0,0,0,0.1);font-family:Tajawal;font-size:13px;cursor:pointer">🔄 إعادة التجربة</button>
    <div style="margin-top:6px;padding:6px;background:#f8f9fa;border-radius:8px;font-size:13px;color:#555;text-align:center">📖 ص86 — تحضير محلول متعادل (السحّاحة)</div>`);
  const phColors=['#C0392B','#D35400','#E67E22','#F39C12','#F1C40F','#D4E157','#7DC67E','#4CAF50','#26A69A','#0097A7','#006064','#1565C0','#283593','#4A148C'];
  function getPh(drops){ if(drops<20) return 13-(drops/20)*6; if(drops===20) return 7; return Math.max(1, 7-(drops-20)/10*5); }
  function getPhColor(ph){ return phColors[Math.min(13,Math.floor(ph))]; }
  btn('dropBtn', function(){
    simState.drops += 1; simState.flowing = true; simState.flowT = 0;
    simState.ph = getPh(simState.drops);
    const lbl=document.getElementById('dropCount'); if(lbl) lbl.textContent=simState.drops+' mL';
    const pLbl=document.getElementById('burettePhLbl');
    if(pLbl){ pLbl.textContent=simState.ph.toFixed(1); pLbl.style.color=getPhColor(simState.ph); }
    simState.particles.push({x:0.46+Math.random()*0.08, y:0.72+Math.random()*0.15, vx:(Math.random()-0.5)*0.003, vy:(Math.random()-0.5)*0.003});
    if(simState.particles.length>40) simState.particles.shift();
    const msg=document.getElementById('buretteMsg');
    if(msg){
      if(simState.drops<18) { msg.textContent='القلويّ لا يزال قويّاً...'; msg.style.color='#2471A3'; }
      else if(simState.drops===20||simState.drops===19||simState.drops===21){ msg.textContent='✅ تعادُل! pH = 7 — الكاشف أخضر تماماً'; msg.style.color='#27AE60'; U9Sound.win(); }
      else if(simState.drops>21) { msg.textContent='تجاوزنا التعادُل — المحلول أصبح حمضيّاً قليلاً'; msg.style.color='#E67E22'; }
    }
  });
  const canvas = document.getElementById('simCanvas');
  function draw(){
    const c=canvas.getContext('2d'); const w=canvas.width, h=canvas.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=isDarkMode()?'#141C28':'#F5F8FA'; c.fillRect(0,0,w,h);
    simState.t+=0.025;
    const ph=simState.ph;
    const phC=getPhColor(ph);
    const r2=parseInt(phC.slice(1,3),16), g2=parseInt(phC.slice(3,5),16), b2=parseInt(phC.slice(5,7),16);

    // ══════════════════════════════════════════════
    // الكونيكال فلاسك (Conical Flask / Erlenmeyer)
    // موضوع في المنتصف أسفل الكانفاس
    // ══════════════════════════════════════════════
    const fx = w*0.5;
    const ftopW = 36, fbotW = Math.min(130, w*0.45), fh = Math.min(130, h*0.32);
    const fNeckH = 28;           // ارتفاع العنق
    const fBaseY = h*0.94;       // قاع الدورق
    const fTopY  = fBaseY - fh;  // أعلى الجزء المخروطي
    const fNeckTopY = fTopY - fNeckH; // فتحة العنق

    // رسم الدورق
    c.beginPath();
    // العنق
    c.moveTo(fx - ftopW/2, fNeckTopY);
    c.lineTo(fx - ftopW/2, fTopY);
    // الجانبان المائلان
    c.lineTo(fx - fbotW/2, fBaseY);
    // القاع
    c.lineTo(fx + fbotW/2, fBaseY);
    // العودة
    c.lineTo(fx + ftopW/2, fTopY);
    c.lineTo(fx + ftopW/2, fNeckTopY);
    c.closePath();
    c.fillStyle='rgba(220,240,255,0.35)'; c.fill();
    c.strokeStyle=isDarkMode()?'rgba(180,210,240,0.5)':'rgba(0,80,160,0.22)'; c.lineWidth=2.2; c.stroke();

    // السائل داخل الدورق (مع موجة)
    const liquidTop = fTopY + (fBaseY - fTopY)*0.45;
    c.save();
    // clip to flask shape
    c.beginPath();
    c.moveTo(fx-ftopW/2, fNeckTopY); c.lineTo(fx-ftopW/2, fTopY);
    c.lineTo(fx-fbotW/2, fBaseY); c.lineTo(fx+fbotW/2, fBaseY);
    c.lineTo(fx+ftopW/2, fTopY); c.lineTo(fx+ftopW/2, fNeckTopY);
    c.closePath(); c.clip();

    // السائل الثابت
    c.fillStyle=`rgba(${r2},${g2},${b2},0.4)`;
    c.fillRect(fx-fbotW/2-2, liquidTop, fbotW+4, fBaseY-liquidTop+2);

    // موجة على السطح
    c.beginPath();
    for(let xi=0;xi<=fbotW;xi+=2){
      const wy = liquidTop + Math.sin((xi*0.15)+simState.t*2.5)*4;
      if(xi===0) c.moveTo(fx-fbotW/2+xi, wy);
      else c.lineTo(fx-fbotW/2+xi, wy);
    }
    c.lineTo(fx+fbotW/2, fBaseY); c.lineTo(fx-fbotW/2, fBaseY); c.closePath();
    c.fillStyle=`rgba(${r2},${g2},${b2},0.18)`; c.fill();

    // جزيئات داخل الدورق
    simState.particles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      // حدود الحوض (تقريبية)
      const fracY=(p.y*h-fTopY)/(fBaseY-fTopY);
      const halfW=(ftopW/2+(fbotW/2-ftopW/2)*Math.max(0,fracY))/w;
      if(p.x<fx/w-halfW||p.x>fx/w+halfW) p.vx=-p.vx;
      if(p.y*h<liquidTop||p.y*h>fBaseY-8) p.vy=-p.vy;
      c.fillStyle=ph<7?`rgba(${r2},${g2},${b2},0.75)`:ph>7?'rgba(41,128,185,0.75)':'rgba(39,174,96,0.7)';
      c.beginPath(); c.arc(p.x*w, p.y*h, 4, 0, Math.PI*2); c.fill();
    });
    c.restore();

    // حافة الدورق فوق السائل (لمعان)
    c.strokeStyle=isDarkMode()?'rgba(180,210,240,0.5)':'rgba(0,80,160,0.22)'; c.lineWidth=2.2;
    c.beginPath();
    c.moveTo(fx-ftopW/2, fNeckTopY); c.lineTo(fx-ftopW/2, fTopY);
    c.lineTo(fx-fbotW/2, fBaseY); c.lineTo(fx+fbotW/2, fBaseY);
    c.lineTo(fx+ftopW/2, fTopY); c.lineTo(fx+ftopW/2, fNeckTopY);
    c.stroke();
    // حافة العنق (فتحة)
    c.beginPath(); c.moveTo(fx-ftopW/2-3, fNeckTopY); c.lineTo(fx+ftopW/2+3, fNeckTopY); c.stroke();

    // pH تحت الدورق
    c.font='bold 18px Tajawal'; c.fillStyle=phC; c.textAlign='center'; c.textBaseline='top';
    c.fillText('pH = '+ph.toFixed(1), fx, fBaseY+6);

    // ══════════════════════════════════════════════
    // البيورت (Burette) — رأسية حقيقية فوق الدورق
    // ══════════════════════════════════════════════
    const bw = 18;               // عرض البيورت
    const bx = fx - bw/2;       // مواءمة مع محور الدورق
    const bTopY  = h*0.03;      // أعلى البيورت
    const bBotY  = fNeckTopY - 4; // أسفل البيورت (فوق فتحة الدورق مباشرة)
    const bH     = bBotY - bTopY;

    // جسم البيورت (أنبوب زجاجي)
    // ظل خفيف
    c.fillStyle='rgba(0,0,0,0.06)';
    c.beginPath(); c.roundRect(bx+3, bTopY+3, bw, bH, 4); c.fill();

    // الزجاج الشفاف
    c.fillStyle='rgba(220,240,255,0.25)';
    c.beginPath(); c.roundRect(bx, bTopY, bw, bH, 4); c.fill();

    // السائل داخل البيورت (الحمض يتناقص)
    const acidFill = Math.max(0, 1 - simState.drops/40);
    const acidH = (bH - 8) * acidFill;
    if(acidH > 2){
      const grad = c.createLinearGradient(bx, bTopY+4, bx+bw, bTopY+4);
      grad.addColorStop(0,'rgba(192,57,43,0.6)');
      grad.addColorStop(0.5,'rgba(220,80,60,0.5)');
      grad.addColorStop(1,'rgba(192,57,43,0.55)');
      c.fillStyle=grad;
      c.beginPath(); c.roundRect(bx+2, bTopY+4, bw-4, acidH, 3); c.fill();
    }

    // تدريجات البيورت (خطوط القياس)
    c.strokeStyle=isDarkMode()?'rgba(150,190,220,0.6)':'rgba(0,60,120,0.3)'; c.lineWidth=1;
    for(let ti=0; ti<=10; ti++){
      const ty = bTopY + 4 + (bH-8)*(ti/10);
      const tickW = ti%5===0 ? bw*0.55 : bw*0.3;
      c.beginPath(); c.moveTo(bx+bw-tickW, ty); c.lineTo(bx+bw, ty); c.stroke();
      if(ti%5===0){
        c.font=`${Math.max(8,w*0.018)}px Arial`;
        c.fillStyle=isDarkMode()?'rgba(150,200,230,0.8)':'rgba(0,60,120,0.7)';
        c.textAlign='right'; c.textBaseline='middle';
        c.fillText((ti*4)+'', bx-3, ty);
      }
    }

    // حواف البيورت
    c.strokeStyle=isDarkMode()?'rgba(180,215,245,0.55)':'rgba(0,80,160,0.28)'; c.lineWidth=1.8;
    c.beginPath(); c.roundRect(bx, bTopY, bw, bH, 4); c.stroke();

    // ─── الصنبور (Stopcock) ───
    const scy = bBotY - 14; // موضع الصنبور
    // جسم الصنبور
    c.fillStyle=isDarkMode()?'#3A5070':'#8BA8C8';
    c.beginPath(); c.roundRect(bx-8, scy-5, bw+16, 10, 5); c.fill();
    c.strokeStyle=isDarkMode()?'rgba(180,220,255,0.4)':'rgba(0,60,120,0.4)'; c.lineWidth=1.2;
    c.beginPath(); c.roundRect(bx-8, scy-5, bw+16, 10, 5); c.stroke();
    // مقبض الصنبور
    c.fillStyle='#5A8AB8';
    c.beginPath(); c.roundRect(bx+bw+8, scy-3, 18, 6, 3); c.fill();

    // ─── طرف البيورت المدبّب (tip) ─── يدخل في عنق الدورق
    const tipTopY = bBotY;
    const tipBotY = fNeckTopY;
    c.fillStyle='rgba(200,230,255,0.35)';
    c.strokeStyle=isDarkMode()?'rgba(180,215,245,0.55)':'rgba(0,80,160,0.28)'; c.lineWidth=1.8;
    c.beginPath();
    c.moveTo(fx-5, tipTopY); c.lineTo(fx+5, tipTopY);
    c.lineTo(fx+3, tipBotY); c.lineTo(fx-3, tipBotY);
    c.closePath(); c.fill(); c.stroke();

    // ─── تدفق القطرة ───
    if(simState.flowing){ simState.flowT+=0.07; if(simState.flowT>1) simState.flowing=false; }
    if(simState.flowing){
      const dropStartY = tipBotY;
      const dropEndY   = liquidTop - 6;
      const dropY = dropStartY + simState.flowT*(dropEndY - dropStartY);
      const dropR = 4 + simState.flowT*2;
      c.fillStyle=`rgba(${r2},${g2},${b2},${0.9-simState.flowT*0.3})`;
      c.beginPath(); c.arc(fx, dropY, dropR, 0, Math.PI*2); c.fill();
      // خيط ماء بين الطرف والقطرة
      if(simState.flowT < 0.4){
        c.strokeStyle=`rgba(${r2},${g2},${b2},0.5)`; c.lineWidth=2;
        c.beginPath(); c.moveTo(fx, tipBotY); c.lineTo(fx, dropY-dropR); c.stroke();
      }
    }

    // ── تسمية "NaOH" على البيورت ───
    c.save(); c.translate(bx-14, bTopY+bH*0.4); c.rotate(-Math.PI/2);
    c.font=`bold ${Math.max(9,w*0.02)}px Arial`;
    c.fillStyle=isDarkMode()?'rgba(200,100,90,0.8)':'rgba(160,40,30,0.75)';
    c.textAlign='center'; c.textBaseline='middle';
    c.fillText('NaOH (قاعدة)', 0, 0);
    c.restore();

    // ══════════════════════════════════════════════
    // شريط pH الصغير (أعلى اليسار)
    // ══════════════════════════════════════════════
    const barX=w*0.04, barY=h*0.045, barW=Math.min(w*0.35, 120), barH=12;
    for(let i=0;i<=13;i++){
      c.fillStyle=phColors[i];
      c.fillRect(barX+i*barW/14, barY, barW/14+1, barH);
    }
    c.strokeStyle='rgba(0,0,0,0.15)'; c.lineWidth=1;
    c.beginPath(); c.rect(barX, barY, barW, barH); c.stroke();
    const arrowX2=barX+ph*barW/14;
    c.fillStyle=phC;
    c.beginPath(); c.moveTo(arrowX2-5, barY+barH+2); c.lineTo(arrowX2+5, barY+barH+2); c.lineTo(arrowX2, barY+barH+9); c.closePath(); c.fill();
    c.font=`bold ${Math.max(9,w*0.022)}px Tajawal`; c.fillStyle=phC; c.textAlign='center';
    c.fillText('pH '+ph.toFixed(1), arrowX2, barY+barH+20);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 11-5 Tab 1: الطبّ والأسنان ──
function simNeutralApp1() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, scene:'stomach', stomachPh:2, toothPh:4.5, medicineAdded:0, pasteAdded:0 };
  controls(`
    <div style="display:flex;gap:6px;margin-bottom:10px">
      <button onclick="simState.scene='stomach';U9Sound.ping()" id="btnStomach" style="flex:1;padding:7px;border-radius:8px;background:rgba(231,76,60,0.12);border:1.5px solid rgba(231,76,60,0.35);color:#C0392B;font-family:Tajawal;font-size:14px;cursor:pointer">😣 عُسر الهضم</button>
      <button onclick="simState.scene='teeth';U9Sound.ping()" id="btnTeeth" style="flex:1;padding:7px;border-radius:8px;background:rgba(26,143,168,0.07);border:1.5px solid rgba(26,143,168,0.2);color:#1A8FA8;font-family:Tajawal;font-size:14px;cursor:pointer">🦷 الأسنان</button>
    </div>
    <div id="appInfo" style="padding:10px;background:rgba(26,143,168,0.07);border-radius:10px;font-size:14px;color:#1A8FA8;text-align:center;min-height:54px;line-height:1.6">اختر مشهداً</div>
    <input type="range" min="0" max="10" step="1" value="0" id="appSlider" style="width:100%;margin-top:8px;accent-color:#27AE60">
    <div style="font-size:12px;color:#888;text-align:center;margin-top:2px">اسحب لإضافة العلاج</div>
    <div style="margin-top:8px;padding:6px;background:#f8f9fa;border-radius:8px;font-size:13px;color:#555;text-align:center">📖 ص88 — تطبيقات التعادُل</div>
    <div class="q-box"><strong>❓ أسئلة الكتاب (ص٨٨-٨٩):</strong><br>١- لماذا يكون معجون الأسنان قلويّاً؟<br>٢- لماذا يُلقي المزارعون الجيرَ على التربة الحمضيّة؟
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- لأنه يُعادل الحمض الذي تُنتجه البكتيريا في الفم.<br>٢- لمعادلة الحموضة الزائدة في التربة حتى تنمو النباتات بشكل أفضل.</div>
  </div>`);
  sl('appSlider', function(){
    const v=parseInt(this.value);
    if(simState.scene==='stomach'){
      simState.medicineAdded=v;
      simState.stomachPh = Math.min(7, 2 + v*0.45);
      const box=document.getElementById('appInfo');
      if(box){ box.innerHTML=`😣 المعدة: pH = <strong>${simState.stomachPh.toFixed(1)}</strong><br>${v===0?'الحمض قويّ — ألم في المعدة':v<6?'إضافة مضاد الحموضة... يتحسّن الوضع':'✅ التعادُل! الألم اختفى 😊'}`; }
    } else {
      simState.pasteAdded=v;
      simState.toothPh = Math.min(7.5, 4.5+v*0.28);
      const box=document.getElementById('appInfo');
      if(box){ box.innerHTML=`🦷 الفم: pH = <strong>${simState.toothPh.toFixed(1)}</strong><br>${v===0?'البكتيريا تُنتج الحمض — خطر على الأسنان':v<6?'المعجون يُعادل الحمض...':'✅ حماية كاملة للأسنان! 🦷✨'}`; }
    }
    U9Sound.ping();
  });
  const canvas=document.getElementById('simCanvas');
  function draw(){
    const c=canvas.getContext('2d'); const w=canvas.width, h=canvas.height;
    c.clearRect(0,0,w,h); c.fillStyle='#F5F8FA'; c.fillRect(0,0,w,h);
    simState.t+=0.025;
    if(simState.scene==='stomach'){
      // stomach outline
      const cx=w/2, cy=h*0.48, rx=w*0.3, ry=h*0.28;
      const ph=simState.stomachPh;
      const r2=Math.round(200-ph*20), g2=Math.round(50+ph*15), b2=50;
      c.fillStyle=`rgba(${r2},${g2},${b2},0.15)`;
      c.beginPath(); c.ellipse(cx, cy, rx, ry, 0.3, 0, Math.PI*2); c.fill();
      c.strokeStyle=`rgba(${r2},${g2},${b2},0.6)`; c.lineWidth=3;
      c.beginPath(); c.ellipse(cx, cy, rx, ry, 0.3, 0, Math.PI*2); c.stroke();
      // acid particles
      for(let i=0;i<15-simState.medicineAdded;i++){
        const ang=i*0.42+simState.t; const px2=cx+Math.cos(ang)*rx*0.6, py2=cy+Math.sin(ang)*ry*0.6;
        c.fillStyle='rgba(192,57,43,0.6)'; c.beginPath(); c.arc(px2,py2,5,0,Math.PI*2); c.fill();
        c.font='9px sans-serif'; c.fillStyle='#fff'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('H⁺',px2,py2);
      }
      // medicine
      for(let i=0;i<simState.medicineAdded;i++){
        const ang=i*0.65+simState.t*0.5; const px2=cx+Math.cos(ang)*rx*0.4, py2=cy+Math.sin(ang)*ry*0.4;
        c.fillStyle='rgba(39,174,96,0.7)'; c.beginPath(); c.arc(px2,py2,6,0,Math.PI*2); c.fill();
        c.font='9px sans-serif'; c.fillStyle='#fff'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('💊',px2,py2);
      }
      c.font='bold 20px Tajawal'; c.fillStyle=`rgb(${r2},${g2},${b2})`; c.textAlign='center';
      c.fillText('pH = '+ph.toFixed(1), cx, cy+ry+30);
      // الإيموجي يتغير حسب pH
      const faceEmoji = ph < 3.5 ? '😖' : ph < 5 ? '😣' : ph < 6.5 ? '😐' : '😊';
      const faceSize = ph < 3.5 ? 36 : ph < 5 ? 30 : 26;
      c.font=`${faceSize}px serif`; c.textAlign='left';
      c.fillText(faceEmoji, w*0.05, h*0.38);
      // نص الحالة
      c.font='bold 14px Tajawal'; c.textAlign='center';
      c.fillStyle=ph<3.5?'#C0392B':ph<5?'#E67E22':ph<6.5?'#F39C12':'#27AE60';
      c.fillText(ph<3.5?'ألم شديد!':ph<5?'يتحسّن...':ph<6.5?'أفضل':' تعادل تام ✅', cx, cy+ry+52);
    } else {
      // teeth
      const ph=simState.toothPh;
      for(let i=0;i<6;i++){
        const tx=w*(0.18+i*0.12), ty=h*0.35;
        const decay = Math.max(0, 6-simState.pasteAdded*0.8-i)*0.08;
        c.fillStyle=`rgb(${Math.round(240-decay*80)},${Math.round(240-decay*60)},${Math.round(240-decay*40)})`;
        c.strokeStyle='rgba(0,0,0,0.15)'; c.lineWidth=1.5;
        c.beginPath(); c.roundRect(tx-18, ty-35, 36, 70, 8); c.fill(); c.stroke();
        if(decay>0.2){ c.fillStyle=`rgba(139,69,19,${decay})`; c.beginPath(); c.arc(tx,ty-10,12*decay,0,Math.PI*2); c.fill(); }
      }
      // bacteria
      for(let i=0;i<12-simState.pasteAdded;i++){
        const bx=w*(0.15+Math.random()*0.7), by=h*(0.2+Math.random()*0.15);
        c.fillStyle='rgba(192,57,43,0.5)'; c.beginPath(); c.arc(bx,by,4,0,Math.PI*2); c.fill();
      }
      c.font='bold 18px Tajawal'; c.fillStyle=ph>6.5?'#27AE60':'#C0392B'; c.textAlign='center';
      c.fillText('pH الفم = '+ph.toFixed(1), w/2, h*0.72);
      c.font='14px Tajawal'; c.fillStyle='#666';
      c.fillText(simState.pasteAdded>7?'✅ الأسنان محميّة!':'🦷 استمر في تطبيق المعجون', w/2, h*0.8);
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 11-5 Tab 2: الزراعة والبحيرات ──
function simNeutralApp2() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, scene:'farm', soilPh:4.5, lakePh:4.2, limeAdded:0, alkaliAdded:0 };
  controls(`
    <div style="display:flex;gap:6px;margin-bottom:10px">
      <button onclick="simState.scene='farm';U9Sound.ping()" style="flex:1;padding:7px;border-radius:8px;background:rgba(39,174,96,0.12);border:1.5px solid rgba(39,174,96,0.35);color:#27AE60;font-family:Tajawal;font-size:14px;cursor:pointer">🌾 التربة والمحاصيل</button>
      <button onclick="simState.scene='lake';U9Sound.ping()" style="flex:1;padding:7px;border-radius:8px;background:rgba(26,143,168,0.07);border:1.5px solid rgba(26,143,168,0.2);color:#1A8FA8;font-family:Tajawal;font-size:14px;cursor:pointer">🏞️ معالجة البحيرة</button>
    </div>
    <div id="appInfo2" style="padding:10px;background:rgba(26,143,168,0.07);border-radius:10px;font-size:14px;color:#1A8FA8;text-align:center;min-height:54px;line-height:1.6">اختر مشهداً</div>
    <input type="range" min="0" max="10" step="1" value="0" id="appSlider2" style="width:100%;margin-top:8px;accent-color:#27AE60">
    <div style="font-size:12px;color:#888;text-align:center;margin-top:2px">اسحب لإضافة المادة القلويّة (الجير)</div>
    <div style="margin-top:8px;padding:6px;background:#f8f9fa;border-radius:8px;font-size:13px;color:#555;text-align:center">📖 ص88 — زراعة المحاصيل · معادلة مياه البحيرات</div>`);
  sl('appSlider2', function(){
    const v=parseInt(this.value);
    if(simState.scene==='farm'){
      simState.limeAdded=v; simState.soilPh=Math.min(7.2,4.5+v*0.27);
      const box=document.getElementById('appInfo2');
      if(box){ box.innerHTML=`🌾 pH التربة = <strong>${simState.soilPh.toFixed(1)}</strong><br>${v===0?'التربة حمضيّة — النباتات لا تنمو جيداً':v<6?'جارٍ إضافة الجير لتعديل التربة...':'✅ pH مناسب للزراعة! النباتات تنمو بشكل ممتاز 🌱'}`; }
    } else {
      simState.alkaliAdded=v; simState.lakePh=Math.min(7.5,4.2+v*0.33);
      const box=document.getElementById('appInfo2');
      if(box){ box.innerHTML=`🐟 pH البحيرة = <strong>${simState.lakePh.toFixed(1)}</strong><br>${v===0?'المطر الحمضي أضرّ بالبحيرة — الكائنات الحيّة تموت':v<6?'إضافة القلويّ يُعادل الحمض...':'✅ البحيرة آمنة! الأسماك تعيش بصحة 🐟'}`; }
    }
    U9Sound.ping();
  });
  const canvas=document.getElementById('simCanvas');
  function draw(){
    const c=canvas.getContext('2d'); const w=canvas.width, h=canvas.height;
    c.clearRect(0,0,w,h); c.fillStyle='#F5F8FA'; c.fillRect(0,0,w,h);
    simState.t+=0.025;
    if(simState.scene==='farm'){
      const ph=simState.soilPh;
      // sky
      c.fillStyle='#d6eaf8'; c.fillRect(0,0,w,h*0.45);
      // soil
      const soilR=Math.round(139-ph*10), soilG=Math.round(90+ph*8);
      c.fillStyle=`rgb(${soilR},${soilG},50)`; c.fillRect(0,h*0.45,w,h*0.55);
      // sun
      c.fillStyle='#F9D835'; c.beginPath(); c.arc(w*0.85,h*0.12,28,0,Math.PI*2); c.fill();
      // plants growing based on pH
      const plantH = ph > 5 ? (ph-5)*0.18*h : 0;
      for(let i=0;i<6;i++){
        const px2=w*(0.12+i*0.15), pBase=h*0.45;
        if(plantH>5){
          c.strokeStyle=ph>6?'#27AE60':'#8BC34A'; c.lineWidth=3;
          c.beginPath(); c.moveTo(px2,pBase); c.lineTo(px2,pBase-plantH); c.stroke();
          // leaves
          c.fillStyle=ph>6?'rgba(39,174,96,0.8)':'rgba(139,195,74,0.7)';
          c.beginPath(); c.ellipse(px2-12,pBase-plantH*0.6,12,6,0.5,0,Math.PI*2); c.fill();
          c.beginPath(); c.ellipse(px2+12,pBase-plantH*0.4,12,6,-0.5,0,Math.PI*2); c.fill();
        }
      }
      // pH text
      c.font='bold 18px Tajawal'; c.fillStyle=ph>6.5?'#27AE60':ph>5.5?'#F39C12':'#C0392B'; c.textAlign='center';
      c.fillText('pH التربة = '+ph.toFixed(1), w/2, h*0.85);
      if(simState.limeAdded>0){
        c.font='14px Tajawal'; c.fillStyle='#8D6E63';
        c.fillText('🪨 '.repeat(Math.min(simState.limeAdded,5))+' تمّت إضافة الجير', w/2, h*0.93);
      }
    } else {
      const ph=simState.lakePh;
      // sky
      c.fillStyle='#d6eaf8'; c.fillRect(0,0,w,h*0.25);
      // mountains
      c.fillStyle='#8D9DB6';
      c.beginPath(); c.moveTo(0,h*0.25); c.lineTo(w*0.3,h*0.05); c.lineTo(w*0.6,h*0.25); c.fill();
      c.fillStyle='#B0BEC5';
      c.beginPath(); c.moveTo(w*0.4,h*0.25); c.lineTo(w*0.7,h*0.08); c.lineTo(w,h*0.25); c.fill();
      // lake
      const lakeR=ph>6?50:180, lakeG=ph>6?130:50, lakeB=ph>6?200:50;
      const grad=c.createLinearGradient(0,h*0.25,0,h);
      grad.addColorStop(0,`rgba(${lakeR},${lakeG},${lakeB},0.7)`);
      grad.addColorStop(1,`rgba(${lakeR*0.7},${lakeG*0.7},${lakeB*0.7},0.9)`);
      c.fillStyle=grad; c.beginPath(); c.ellipse(w/2,h*0.6,w*0.42,h*0.28,0,0,Math.PI*2); c.fill();
      // waves
      for(let i=0;i<5;i++){
        const wx=w*0.12+i*w*0.18, wamp=Math.sin(simState.t+i)*4;
        c.strokeStyle=`rgba(255,255,255,0.3)`; c.lineWidth=1.5;
        c.beginPath(); c.moveTo(wx,h*0.58+wamp); c.quadraticCurveTo(wx+w*0.05,h*0.56+wamp,wx+w*0.1,h*0.58+wamp); c.stroke();
      }
      // fish (appear when pH is good)
      if(ph>6){ for(let i=0;i<3;i++){
        const fx=w*(0.25+i*0.25)+Math.sin(simState.t+i)*15, fy=h*(0.55+Math.cos(simState.t*0.7+i)*0.04);
        c.font='20px serif'; c.textAlign='center'; c.fillText('🐟',fx,fy);
      }}
      c.font='bold 18px Tajawal'; c.fillStyle=ph>6.5?'#27AE60':ph>5.5?'#E67E22':'#C0392B'; c.textAlign='center';
      c.fillText('pH البحيرة = '+ph.toFixed(1), w/2, h*0.9);
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 11-6 Tab 1: تصميم التجربة ──
function simAcidInquiry1() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, selected:null, hypothesis:'', step:0 };
  const powders = [
    { id:'s', name:'س (مسحوق الهضم)', icon:'💊', color:'#E74C3C', desc:'مضاد الحموضة الشائع — هيدروكسيد المغنيسيوم' },
    { id:'ss', name:'ص (مسحوق الأسنان)', icon:'🦷', color:'#3498DB', desc:'كربونات الكالسيوم — مسحوق رخيص التكلفة' },
    { id:'e', name:'ع (مسحوق ع)', icon:'🧂', color:'#27AE60', desc:'بيكربونات الصوديوم — مسحوق طبيعي وآمن' },
  ];
  const variables = [
    { label:'المتغيّر المُغيَّر', val:'نوع المسحوق (س أو ص أو ع)', color:'#E74C3C' },
    { label:'المتغيّرات الثابتة', val:'حجم الحمض، تركيزه، درجة الحرارة', color:'#3498DB' },
    { label:'المتغيّر المقيس', val:'عدد الملاعق اللازمة للتعادُل (pH = 7)', color:'#27AE60' },
  ];
  controls(`
    <div style="font-size:14px;color:#555;margin-bottom:8px;text-align:center">تصميم التجربة العادلة</div>
    ${variables.map(v=>`<div style="padding:7px 10px;background:rgba(26,143,168,0.05);border-radius:8px;margin-bottom:5px;font-size:13px">
      <span style="color:${v.color};font-weight:bold">${v.label}:</span><br><span style="color:#555">${v.val}</span>
    </div>`).join('')}
    <div style="margin-top:6px;font-size:13px;font-weight:bold;color:#1A8FA8;text-align:center">انقر على مسحوق لمعرفة تفاصيله</div>
    <div id="powderInfo" style="margin-top:6px;padding:8px;background:#f8f9fa;border-radius:8px;font-size:13px;color:#666;text-align:center;min-height:40px"></div>

    <div class="q-box"><strong>❓ أسئلة الكتاب (ص٩٠-٩١):</strong><br>١- ما المسحوق الأكثر فعاليّة لتعادُل الحمض؟<br>٢- ما الذي يجعل التجربة عادلة؟
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- المسحوق الذي يُعادل الحمض باستخدام أقل كميّة منه.<br>٢- تغيير متغيّر واحد فقط مع ثبات الباقي.</div>
  </div>`);
  const canvas=document.getElementById('simCanvas');
  function draw(){
    const c=canvas.getContext('2d'); const w=canvas.width, h=canvas.height;
    c.clearRect(0,0,w,h); c.fillStyle='#F5F8FA'; c.fillRect(0,0,w,h);
    simState.t+=0.025;
    // lab bench
    c.fillStyle='#DEB887'; c.beginPath(); c.roundRect(w*0.03, h*0.82, w*0.94, h*0.12, 6); c.fill();
    c.fillStyle='#C8A87A'; c.fillRect(w*0.03, h*0.82, w*0.94, 6);
    // question title
    c.font='bold 15px Tajawal'; c.fillStyle='#333'; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText('أيّ مسحوق أفضل لتعادُل الحمض؟', w/2, h*0.1);
    // flask with acid
    const fx=w*0.5, fy=h*0.52;
    c.fillStyle='rgba(192,57,43,0.2)'; c.strokeStyle='rgba(0,0,0,0.2)'; c.lineWidth=2;
    c.beginPath(); c.moveTo(fx-35,fy-55); c.lineTo(fx-55,fy+30); c.lineTo(fx+55,fy+30); c.lineTo(fx+35,fy-55); c.closePath(); c.fill(); c.stroke();
    c.fillStyle='rgba(192,57,43,0.4)'; c.beginPath(); c.moveTo(fx-45,fy+5); c.lineTo(fx-55,fy+30); c.lineTo(fx+55,fy+30); c.lineTo(fx+45,fy+5); c.closePath(); c.fill();
    c.font='12px Tajawal'; c.fillStyle='#C0392B'; c.textAlign='center'; c.fillText('حمض الهيدروكلوريك', fx, fy+46);
    c.fillText('pH = 1  |  20 mL', fx, fy+60);
    // 3 powder cups
    powders.forEach((p,i) => {
      const px2=w*(0.2+i*0.3), py2=h*0.65;
      const isSel=simState.selected===p.id;
      // cup
      c.fillStyle=isSel?`rgba(${parseInt(p.color.slice(1,3),16)},${parseInt(p.color.slice(3,5),16)},${parseInt(p.color.slice(5,7),16)},0.2)`:'rgba(220,220,220,0.4)';
      c.strokeStyle=isSel?p.color:'rgba(0,0,0,0.2)'; c.lineWidth=isSel?2.5:1.5;
      c.beginPath(); c.moveTo(px2-20,py2-15); c.lineTo(px2-25,py2+20); c.lineTo(px2+25,py2+20); c.lineTo(px2+20,py2-15); c.closePath(); c.fill(); c.stroke();
      // powder fill
      c.fillStyle=p.color+'88';
      c.beginPath(); c.moveTo(px2-18,py2+5); c.lineTo(px2-24,py2+20); c.lineTo(px2+24,py2+20); c.lineTo(px2+18,py2+5); c.closePath(); c.fill();
      c.font='20px serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(p.icon, px2, py2-5);
      c.font='bold 13px Tajawal'; c.fillStyle=isSel?p.color:'#555'; c.textBaseline='top'; c.fillText(p.name.split(' ')[0], px2, py2+25);
    });
    animFrame=requestAnimationFrame(draw);
  }
  canvas.onclick=function(e){
    const r=canvas.getBoundingClientRect(), mx=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX-r.left)*canvas.width/r.width, my=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientY-r.top)*canvas.height/r.height;
    const w=canvas.width, h=canvas.height;
    powders.forEach((p,i)=>{
      const px2=w*(0.2+i*0.3), py2=h*0.65;
      if(Math.abs(mx-px2)<30&&Math.abs(my-py2)<35){
        simState.selected=p.id; U9Sound.ping();
        const box=document.getElementById('powderInfo');
        if(box) box.innerHTML=`<strong>${p.icon} ${p.name}</strong><br>${p.desc}`;
      }
    });
  };
  draw();
}

// ── 11-6 Tab 2: النتائج والاستنتاج ──
function simAcidInquiry2() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, running:false, progress:[0,0,0], trial:0, done:false };
  const powders = [
    { name:'س', icon:'💊', color:'#E74C3C', spoons:10, avg:10 },
    { name:'ص', icon:'🦷', color:'#3498DB', spoons:6, avg:6 },
    { name:'ع', icon:'🧂', color:'#27AE60', spoons:24, avg:24 },
  ];
  controls(`
    <div style="font-size:14px;color:#555;text-align:center;margin-bottom:8px">نتائج التجربة — ٣ تكرارات</div>
    <div style="background:white;border-radius:8px;overflow:hidden;margin-bottom:8px">
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <tr style="background:rgba(26,143,168,0.1)">
          <th style="padding:6px;text-align:center;color:#1A8FA8">المسحوق</th>
          <th style="padding:6px;text-align:center;color:#1A8FA8">١</th>
          <th style="padding:6px;text-align:center;color:#1A8FA8">٢</th>
          <th style="padding:6px;text-align:center;color:#1A8FA8">٣</th>
          <th style="padding:6px;text-align:center;color:#1A8FA8">الوسط</th>
        </tr>
        <tr><td style="padding:6px;text-align:center">💊 س</td><td style="padding:6px;text-align:center;color:#E74C3C">10</td><td style="padding:6px;text-align:center;color:#E74C3C">11</td><td style="padding:6px;text-align:center;color:#E74C3C">9</td><td style="padding:6px;text-align:center;font-weight:bold;color:#E74C3C">10</td></tr>
        <tr style="background:#f8f9fa"><td style="padding:6px;text-align:center">🦷 ص</td><td style="padding:6px;text-align:center;color:#3498DB">6</td><td style="padding:6px;text-align:center;color:#3498DB">7</td><td style="padding:6px;text-align:center;color:#3498DB">5</td><td style="padding:6px;text-align:center;font-weight:bold;color:#3498DB">6</td></tr>
        <tr><td style="padding:6px;text-align:center">🧂 ع</td><td style="padding:6px;text-align:center;color:#27AE60">24</td><td style="padding:6px;text-align:center;color:#27AE60">25</td><td style="padding:6px;text-align:center;color:#27AE60">23</td><td style="padding:6px;text-align:center;font-weight:bold;color:#27AE60">24</td></tr>
      </table>
    </div>
    <div style="padding:8px;background:#E8F5E9;border-radius:8px;font-size:13px;color:#2E7D32;text-align:center">
      <strong>الاستنتاج:</strong> مسحوق ص الأكثر فعّاليّة — يحتاج أقل عدد ملاعق لتعادُل الحمض
    </div>
    <button onclick="simState.running=!simState.running;U9Sound.ping()" style="margin-top:8px;width:100%;padding:8px;border-radius:8px;background:rgba(26,143,168,0.1);border:1.5px solid rgba(26,143,168,0.3);color:#1A8FA8;font-family:Tajawal;font-size:14px;cursor:pointer">▶ عرض المخطط البياني</button>`);
  const canvas=document.getElementById('simCanvas');
  function draw(){
    const c=canvas.getContext('2d'); const w=canvas.width, h=canvas.height;
    c.clearRect(0,0,w,h); c.fillStyle='#F5F8FA'; c.fillRect(0,0,w,h);
    simState.t+=0.02;
    // title
    c.font='bold 16px Tajawal'; c.fillStyle='#333'; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText('عدد الملاعق اللازمة لتعادُل الحمض', w/2, h*0.1);
    // bar chart
    const chartX=w*0.12, chartY=h*0.18, chartW=w*0.76, chartH=h*0.58;
    // grid
    c.strokeStyle='rgba(0,0,0,0.07)'; c.lineWidth=1;
    [0,5,10,15,20,25,30].forEach(val=>{
      const gy=chartY+chartH-val/30*chartH;
      c.beginPath(); c.moveTo(chartX, gy); c.lineTo(chartX+chartW, gy); c.stroke();
      c.font='11px Tajawal'; c.fillStyle='#999'; c.textAlign='right'; c.textBaseline='middle'; c.fillText(val, chartX-6, gy);
    });
    // axes
    c.strokeStyle='rgba(0,0,0,0.25)'; c.lineWidth=2;
    c.beginPath(); c.moveTo(chartX,chartY); c.lineTo(chartX,chartY+chartH); c.lineTo(chartX+chartW,chartY+chartH); c.stroke();
    // bars
    const barW2=chartW/3-24;
    powders.forEach((p,i)=>{
      const bx=chartX+i*chartW/3+12;
      if(simState.running) simState.progress[i]=Math.min(p.avg/30, simState.progress[i]+0.015);
      const bh=simState.progress[i]*chartH;
      const r2=parseInt(p.color.slice(1,3),16), g2=parseInt(p.color.slice(3,5),16), b2=parseInt(p.color.slice(5,7),16);
      // shadow bar
      c.fillStyle=`rgba(${r2},${g2},${b2},0.15)`;
      c.beginPath(); c.roundRect(bx, chartY+chartH-bh-3, barW2, bh+3, 4); c.fill();
      // actual bar
      const barGrad=c.createLinearGradient(bx,chartY+chartH-bh,bx,chartY+chartH);
      barGrad.addColorStop(0,`rgba(${r2},${g2},${b2},0.9)`);
      barGrad.addColorStop(1,`rgba(${r2*0.7},${g2*0.7},${b2*0.7},0.9)`);
      c.fillStyle=barGrad;
      c.beginPath(); c.roundRect(bx, chartY+chartH-bh, barW2, bh, 4); c.fill();
      // value label
      if(simState.progress[i]>0.05){
        c.font='bold 14px Tajawal'; c.fillStyle=p.color; c.textAlign='center'; c.textBaseline='bottom';
        c.fillText(p.avg, bx+barW2/2, chartY+chartH-bh-4);
      }
      // name
      c.font='14px Tajawal'; c.fillStyle='#444'; c.textAlign='center'; c.textBaseline='top';
      c.fillText(p.icon+' '+p.name, bx+barW2/2, chartY+chartH+6);
    });
    // Y axis label
    c.save(); c.translate(w*0.04, chartY+chartH/2); c.rotate(-Math.PI/2);
    c.font='12px Tajawal'; c.fillStyle='#888'; c.textAlign='center';
    c.fillText('عدد الملاعق', 0, 0); c.restore();
    // conclusion arrow
    if(simState.running && simState.progress[1]>0.15){
      c.strokeStyle='#3498DB'; c.lineWidth=2; c.setLineDash([4,4]);
      const bestX=chartX+1*chartW/3+12+barW2/2;
      c.beginPath(); c.moveTo(bestX, chartY+chartH-powders[1].avg/30*chartH-15);
      c.lineTo(bestX, chartY-10); c.stroke(); c.setLineDash([]);
      c.font='bold 13px Tajawal'; c.fillStyle='#3498DB'; c.textAlign='center';
      c.fillText('✅ الأفضل!', bestX, chartY-18);
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}


// =====================================================
// ===== وحدة الكهرباء — الصف السادس =====
// =====================================================

// ── مساعدات الكهرباء ──
function elCtx()  { return document.getElementById('simCanvas').getContext('2d'); }
function elW()    { return document.getElementById('simCanvas').width; }
function elH()    { return document.getElementById('simCanvas').height; }
function elCtrl(h){ document.getElementById('simControlsPanel').innerHTML = h; }


// =====================================================
// ===== وحدة الكهرباء — الصف السادس (تفاعلية كاملة) =====
// =====================================================
function elCtx()  { return document.getElementById('simCanvas').getContext('2d'); }
function elW()    { return document.getElementById('simCanvas').width; }
function elH()    { return document.getElementById('simCanvas').height; }
function elCtrl(h){ document.getElementById('simControlsPanel').innerHTML = h; }
function isDarkMode(){ return document.documentElement.classList.contains('dark-mode'); }

// ─────────────────────────────────────────────────────
// 5-1 TAB 1: اسحب المادة إلى الدائرة — هل تُوصّل؟
// ─────────────────────────────────────────────────────
function simConductors1() {
  cancelAnimationFrame(animFrame);
  var MATS = [
    {id:'cu',label:'نحاس',   icon:'🔩',c:true, col:'#B87333'},
    {id:'fe',label:'حديد',   icon:'🔧',c:true, col:'#888'},
    {id:'al',label:'ألمنيوم',icon:'🪙',c:true, col:'#AAA'},
    {id:'gr',label:'جرافيت', icon:'✏️',c:true, col:'#555'},
    {id:'pl',label:'بلاستيك',icon:'📏',c:false,col:'#E67E22'},
    {id:'wd',label:'خشب',    icon:'🪵',c:false,col:'#8B4513'},
    {id:'rb',label:'مطاط',   icon:'🩹',c:false,col:'#E74C3C'},
    {id:'gl',label:'زجاج',   icon:'🥃',c:false,col:'#85C1E9'},
  ];
  var state = { t:0, drag:null, ox:0, oy:0, placed:null, tested:{}, flow:[] };
  simState = state;

  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧪 اسحب مادة إلى الدائرة</div>
      <div id="cRes" style="padding:10px;border-radius:10px;font-size:14px;text-align:center;
        background:rgba(0,0,0,0.04);min-height:44px;display:flex;align-items:center;justify-content:center">
        اسحب أي مادة إلى المنفذ 🔌
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">📋 جدول نتائجك</div>
      <div id="cTable" style="font-size:12px"></div>
    </div>
    <div class="info-box" style="font-size:13px">
      💡 <strong>موصِّلة</strong> = مصباح يضيء ✅<br>
      <strong>عازلة</strong> = مصباح منطفئ ❌<br><br>
      📖 ص٣٤: المعادن كلها موصِّلة.
    </div>`);

  function updTable(){
    var el=document.getElementById('cTable'); if(!el)return;
    var html=Object.keys(state.tested).map(id=>{
      var m=MATS.find(x=>x.id===id);
      return '<div style="display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px solid rgba(0,0,0,0.05)"><span>'+m.icon+' '+m.label+'</span><span style="font-weight:700;color:'+(state.tested[id]?'#27AE60':'#E74C3C')+'">'+(state.tested[id]?'✅':'❌')+'</span></div>';
    }).join('');
    el.innerHTML=html||'<div style="color:#AAA;text-align:center;padding:8px">لا توجد نتائج بعد</div>';
  }

  var cv=document.getElementById('simCanvas');
  function gp(e){var r=cv.getBoundingClientRect(),sc=cv.width/r.width,s=e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e;return{x:(s.clientX-r.left)*sc,y:(s.clientY-r.top)*sc};}

  // تخطيط الدائرة
  function L(){ var w=elW(),h=elH(),cx=w*.5,cy=h*.34,rx=w*.3,ry=h*.23;
    var iw=Math.max(72, Math.min(Math.floor((w - w*.08) / 4) - 10, 110));
    var ih=Math.round(iw*.7);
    return{w,h,cx,cy,rx,ry,
      bx:cx-rx,by:cy,           // بطارية
      lx:cx+rx,ly:cy,           // مصباح
      sx:cx,sy:cy+ry,           // slot (فتحة المادة)
      ty:h*.70,                 // صينية المواد (مرفوعة أكثر)
      iw:iw,ih:ih};             // حجم بطاقة مادة (أكبر)
  }

  // ضع المواد في الصينية
  function initItems(){
    var l=L(), cols=4, gap=10;
    var totalW = cols*l.iw + (cols-1)*gap;
    var startX = (l.w - totalW)/2 + l.iw/2;
    MATS.forEach(function(m,i){
      var col=i%cols, row=Math.floor(i/cols);
      m.hx = startX + col*(l.iw+gap);
      m.hy = l.ty + 10 + row*(l.ih+8) + l.ih/2;
      m.x  = m.hx; m.y = m.hy;
      m.placed = false;
    });
  }
  initItems();

  function onDown(e){
    var p=gp(e); e.preventDefault();
    var l=L();
    // بحث من الأمام للخلف
    for(var i=MATS.length-1;i>=0;i--){
      var m=MATS[i];
      if(Math.abs(p.x-m.x)<l.iw/2&&Math.abs(p.y-m.y)<l.ih/2){
        state.drag=m; state.ox=p.x-m.x; state.oy=p.y-m.y;
        if(m.placed){ m.placed=false; state.placed=null; }
        break;
      }
    }
  }
  function onMove(e){
    if(!state.drag)return; e.preventDefault();
    var p=gp(e); state.drag.x=p.x-state.ox; state.drag.y=p.y-state.oy;
  }
  function onUp(e){
    if(!state.drag)return; e.preventDefault();
    var m=state.drag, l=L();
    // هل قريب من الـ slot؟
    if(Math.abs(m.x-l.sx)<55&&Math.abs(m.y-l.sy)<28){
      m.x=l.sx; m.y=l.sy; m.placed=true;
      state.placed=m;
      state.tested[m.id]=m.c;
      state.flow=[];
      if(m.c){ try{U9Sound.win();}catch(ex){} for(var i=0;i<12;i++) state.flow.push({t:Math.random(),s:Math.random()*.6+.7}); }
      else { try{U9Sound.ping(220,.3,.2);}catch(ex){} }
      var res=document.getElementById('cRes');
      if(res){ res.style.background=m.c?'rgba(39,174,96,.1)':'rgba(192,57,43,.06)'; res.style.color=m.c?'#1E8449':'#C0392B'; res.innerHTML='<strong>'+m.icon+' '+m.label+'</strong><br>'+(m.c?'✅ موصِّلة — المصباح يضيء!':'❌ عازلة — المصباح لا يضيء'); }
      updTable();
    } else {
      // أعدها لموضعها الأصلي
      m.x=m.hx; m.y=m.hy; m.placed=false;
    }
    state.drag=null;
  }

  cv.addEventListener('mousedown',onDown); cv.addEventListener('mousemove',onMove); cv.addEventListener('mouseup',onUp);
  cv.addEventListener('touchstart',onDown,{passive:false}); cv.addEventListener('touchmove',onMove,{passive:false}); cv.addEventListener('touchend',onUp,{passive:false});

  function draw(){
    var c=elCtx(), l=L(), w=l.w, h=l.h;
    c.clearRect(0,0,w,h);
    c.fillStyle=isDarkMode()?'#141C28':'#EEF4FA'; c.fillRect(0,0,w,h);
    state.t+=.04;
    var on=!!(state.placed&&state.placed.c);

    // ── أسلاك الدائرة ──
    var wc=on?'#27AE60':'#999', lw=on?3:2;
    c.strokeStyle=wc; c.lineWidth=lw; c.setLineDash([]);
    // أعلى: bat → bulb
    c.beginPath(); c.moveTo(l.bx,l.by-14); c.lineTo(l.bx,l.cy-l.ry); c.lineTo(l.lx,l.cy-l.ry); c.lineTo(l.lx,l.ly-22); c.stroke();
    // أسفل يمين: bulb → slot يمين
    c.beginPath(); c.moveTo(l.lx,l.ly+22); c.lineTo(l.lx,l.cy+l.ry); c.lineTo(l.sx+44,l.sy); c.stroke();
    // أسفل يسار: slot يسار → bat
    c.beginPath(); c.moveTo(l.sx-44,l.sy); c.lineTo(l.bx,l.cy+l.ry); c.lineTo(l.bx,l.by+14); c.stroke();

    // ── تدفق الإلكترونات ──
    if(on){
      state.flow.forEach(function(f){
        f.t=(f.t+.008*f.s)%1;
        // مسار: أعلى يسار → أعلى يمين → أسفل يمين → slot → أسفل يسار → بطارية
        var segs=[
          {ax:l.bx,ay:l.cy-l.ry,bx:l.lx,by:l.cy-l.ry,len:(l.lx-l.bx)},
          {ax:l.lx,ay:l.cy-l.ry,bx:l.lx,by:l.cy+l.ry,len:2*l.ry},
          {ax:l.lx,ay:l.cy+l.ry,bx:l.sx,by:l.sy,len:Math.hypot(l.lx-l.sx,l.cy+l.ry-l.sy)},
          {ax:l.sx,ay:l.sy,bx:l.bx,by:l.cy+l.ry,len:Math.hypot(l.sx-l.bx,l.sy-(l.cy+l.ry))},
          {ax:l.bx,ay:l.cy+l.ry,bx:l.bx,by:l.cy-l.ry,len:2*l.ry},
        ];
        var total=segs.reduce(function(s,seg){return s+seg.len;},0);
        var dist=f.t*total, cum=0, ex=l.bx, ey=l.cy-l.ry;
        for(var si=0;si<segs.length;si++){
          var seg=segs[si];
          if(dist<=cum+seg.len){ var r2=(dist-cum)/seg.len; ex=seg.ax+(seg.bx-seg.ax)*r2; ey=seg.ay+(seg.by-seg.ay)*r2; break; }
          cum+=seg.len;
        }
        c.fillStyle='rgba(0,200,255,'+(0.7-f.t*.4)+')'; c.beginPath(); c.arc(ex,ey,4,0,Math.PI*2); c.fill();
      });
    }

    // ── البطارية ──
    c.fillStyle='#2C3E50'; c.beginPath(); c.roundRect(l.bx-26,l.by-14,52,28,6); c.fill();
    c.fillStyle='#F39C12'; for(var ci=0;ci<3;ci++) c.fillRect(l.bx-16+ci*12,l.by-8,7,16);
    c.fillStyle='white'; c.font='bold 10px Arial'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('1.5V',l.bx,l.by);
    c.fillStyle='#E74C3C'; c.font='bold 13px Arial'; c.fillText('+',l.bx+22,l.by-12);

    // ── المصباح ──
    if(on){ c.shadowBlur=20+Math.sin(state.t*4)*6; c.shadowColor='rgba(255,220,0,.7)'; }
    c.fillStyle=on?('rgba(255,230,80,'+(0.55+.15*Math.sin(state.t*4))+')'):('rgba(200,200,200,.5)');
    c.beginPath(); c.arc(l.lx,l.ly,22,0,Math.PI*2); c.fill();
    c.shadowBlur=0;
    c.strokeStyle=on?'rgba(255,180,0,.6)':'#BBB'; c.lineWidth=2;
    c.beginPath(); c.arc(l.lx,l.ly,22,0,Math.PI*2); c.stroke();
    // خيط التنغستن
    c.strokeStyle=on?'rgba(255,200,0,.9)':'rgba(150,150,150,.5)'; c.lineWidth=1.5;
    c.beginPath(); c.moveTo(l.lx-6,l.ly+14); c.lineTo(l.lx-3,l.ly+4); c.lineTo(l.lx,l.ly+10); c.lineTo(l.lx+3,l.ly+4); c.lineTo(l.lx+6,l.ly+14); c.stroke();
    c.fillStyle='#555'; c.beginPath(); c.roundRect(l.lx-10,l.ly+18,20,12,3); c.fill();
    c.font='11px Tajawal'; c.fillStyle=isDarkMode()?'#aaa':'#666'; c.textAlign='center'; c.textBaseline='top';
    c.fillText(on?'يضيء ✅':'منطفئ ❌',l.lx,l.ly+32);

    // ── slot (فتحة المادة) ──
    var hasPlaced=!!(state.placed&&state.placed.placed);
    c.fillStyle=hasPlaced?(state.placed.c?'rgba(39,174,96,.12)':'rgba(192,57,43,.08)'):('rgba(255,200,0,.15)');
    c.strokeStyle=hasPlaced?(state.placed.c?'#27AE60':'#E74C3C'):'#F39C12';
    c.lineWidth=2.5; c.setLineDash([5,4]);
    c.beginPath(); c.roundRect(l.sx-44,l.sy-18,88,36,8); c.fill(); c.stroke();
    c.setLineDash([]);
    if(!hasPlaced){
      c.font='13px Tajawal'; c.fillStyle='#F39C12'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('🔌 ضع المادة هنا',l.sx,l.sy);
    }

    // ── صينية المواد ──
    c.fillStyle=isDarkMode()?'rgba(26,36,50,.6)':'rgba(255,255,255,.7)';
    c.beginPath(); c.roundRect(0,l.ty-6,w,h-l.ty+6,0); c.fill();
    c.font='bold 12px Tajawal'; c.fillStyle=isDarkMode()?'#7A9AB5':'#888'; c.textAlign='center'; c.textBaseline='top';
    c.fillText('اسحب مادة إلى الدائرة ↑',w/2,l.ty-4);

    // ── بطاقات المواد ──
    MATS.forEach(function(m){
      if(m.placed)return; // رُسمت بالـ slot
      var isDrag=(state.drag&&state.drag.id===m.id);
      var hw=l.iw/2, hh=l.ih/2;
      c.shadowBlur=isDrag?18:6; c.shadowColor='rgba(26,143,168,.3)';
      c.fillStyle=isDarkMode()?'rgba(30,42,56,.97)':'rgba(255,255,255,.97)';
      c.strokeStyle=isDrag?'#1A8FA8':'rgba(0,0,0,.12)';
      c.lineWidth=isDrag?2.5:1.8;
      c.beginPath(); c.roundRect(m.x-hw,m.y-hh,l.iw,l.ih,12); c.fill(); c.stroke();
      c.shadowBlur=0;
      // أيقونة كبيرة فوق
      c.font=Math.round(l.iw*.34)+'px serif'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(m.icon, m.x, m.y - l.ih*.13);
      // اسم تحت
      c.font='bold '+Math.round(l.iw*.175)+'px Tajawal';
      c.fillStyle=isDarkMode()?'#ddd':'#444';
      c.textBaseline='bottom';
      c.fillText(m.label, m.x, m.y+hh-4);
    });

    // ── المادة في الـ slot ──
    if(state.placed&&state.placed.placed){
      var m=state.placed;
      c.fillStyle=m.c?'rgba(39,174,96,.12)':'rgba(192,57,43,.06)';
      c.strokeStyle=m.c?'#27AE60':'#E74C3C'; c.lineWidth=2; c.setLineDash([]);
      c.beginPath(); c.roundRect(m.x-44,m.y-18,88,36,8); c.fill(); c.stroke();
      c.font='18px serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(m.icon,m.x-14,m.y);
      c.font='12px Tajawal'; c.fillStyle=isDarkMode()?'#ccc':'#333'; c.fillText(m.label,m.x+8,m.y);
    }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─────────────────────────────────────────────────────
// 5-1 TAB 2: صنّف المواد (Drag & Drop)
// ─────────────────────────────────────────────────────
function simConductors2() {
  cancelAnimationFrame(animFrame);
  var localItems = [
    {id:'cu',label:'نحاس',   icon:'🔩',c:true},
    {id:'fe',label:'حديد',   icon:'🔧',c:true},
    {id:'al',label:'ألمنيوم',icon:'🪙',c:true},
    {id:'gr',label:'جرافيت', icon:'✏️',c:true},
    {id:'pl',label:'بلاستيك',icon:'📏',c:false},
    {id:'wd',label:'خشب',    icon:'🪵',c:false},
    {id:'rb',label:'مطاط',   icon:'🩹',c:false},
    {id:'gl',label:'زجاج',   icon:'🥃',c:false},
  ];
  // خلط عشوائي لترتيب المواد
  for(var si=localItems.length-1;si>0;si--){ var sj=Math.floor(Math.random()*(si+1)); var tmp=localItems[si]; localItems[si]=localItems[sj]; localItems[sj]=tmp; }
  localItems.forEach(function(it){ it.x=0;it.y=0;it.placed=null; });
  simState={t:0,drag:null,score:0};

  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">🎮 صنّف المواد</div>
      <div style="font-size:13px;color:#777;line-height:1.7">اسحب كل مادة إلى العمود الصحيح في الجدول</div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🏆 تقدّمك</div>
      <div id="sc2" style="text-align:center;font-size:26px;font-weight:800;color:#1A8FA8">0 / 8</div>
      <div id="sc2msg" style="text-align:center;font-size:12px;color:#888;margin-top:2px">اسحب المواد من الأسفل</div>
    </div>
    <button onclick="elReset2()" style="width:100%;padding:9px;border-radius:10px;border:1.5px solid rgba(0,0,0,.1);background:rgba(192,57,43,.07);color:#C0392B;font-family:Tajawal;font-size:14px;cursor:pointer;margin-top:4px">🔄 إعادة التصنيف</button>
    <div class="info-box" style="font-size:13px;margin-top:8px">
      ✅ <strong>موصِّلة</strong> = معادن (نحاس، حديد، ألمنيوم، جرافيت)<br>
      ❌ <strong>عازلة</strong> = بلاستيك / خشب / مطاط / زجاج
    </div>`);

  var cv=document.getElementById('simCanvas');
  function gp(e){var r=cv.getBoundingClientRect(),sc=cv.width/r.width,s=e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e;return{x:(s.clientX-r.left)*sc,y:(s.clientY-r.top)*sc};}

  function L(){
    var w=elW(),h=elH();
    var colY=h*.05, colH=h*.60;   // جدول أقصر لإعطاء مساحة للصينية
    var gap=w*.04;
    var cColX=gap, cColW=w*.44-gap;
    var eColX=w*.50, eColW=w*.46;
    var trayY=h*.68;               // صينية مرفوعة أكثر
    var iw=Math.floor((w - w*.06) / 4) - 10;
    iw=Math.max(80, Math.min(iw, 110));
    var ih=Math.round(iw*.78);
    return{w,h, cColX,cColW,eColX,eColW, colY,colH, trayY,iw,ih};
  }
  function resetPos(){
    var l=L(), cols=4;
    var gap=10;
    var totalW = cols*l.iw + (cols-1)*gap;
    var startX = (l.w - totalW)/2 + l.iw/2;
    localItems.forEach(function(it,i){
      it.placed=null;
      var col=i%cols, row=Math.floor(i/cols);
      it.hx = startX + col*(l.iw+gap);
      it.hy = l.trayY + 12 + row*(l.ih+8) + l.ih/2;
      it.x=it.hx; it.y=it.hy;
    });
    simState.score=0;
    var el=document.getElementById('sc2'); if(el) el.textContent='0 / 8';
    var em=document.getElementById('sc2msg'); if(em) em.textContent='اسحب المواد من الأسفل';
  }
  resetPos();
  window.elReset2=resetPos;

  function placedCount(){return localItems.filter(function(i){return i.placed!==null;}).length;}

  cv.addEventListener('mousedown',down); cv.addEventListener('mousemove',move); cv.addEventListener('mouseup',up);
  cv.addEventListener('touchstart',down,{passive:false}); cv.addEventListener('touchmove',move,{passive:false}); cv.addEventListener('touchend',up,{passive:false});

  var dragIt=null,ox=0,oy=0;
  function down(e){
    var p=gp(e); e.preventDefault();
    var l=L();
    for(var i=localItems.length-1;i>=0;i--){
      var it=localItems[i];
      if(Math.abs(p.x-it.x)<l.iw/2&&Math.abs(p.y-it.y)<l.ih/2){ dragIt=it; ox=p.x-it.x; oy=p.y-it.y; if(it.placed!==null){it.placed=null;} break; }
    }
  }
  function move(e){ if(!dragIt)return; e.preventDefault(); var p=gp(e); dragIt.x=p.x-ox; dragIt.y=p.y-oy; }
  function up(e){
    if(!dragIt)return; e.preventDefault();
    var l=L(), it=dragIt;
    var inCond=it.x>l.cColX&&it.x<l.cColX+l.cColW&&it.y>l.colY&&it.y<l.colY+l.colH;
    var inIns =it.x>l.eColX&&it.x<l.eColX+l.eColW&&it.y>l.colY&&it.y<l.colY+l.colH;
    if(inCond&&it.c){ it.placed='c'; try{U9Sound.win();}catch(ex){} }
    else if(inIns&&!it.c){ it.placed='e'; try{U9Sound.win();}catch(ex){} }
    else if((inCond&&!it.c)||(inIns&&it.c)){ try{U9Sound.ping(220,.3,.2);}catch(ex){} it.x=it.hx; it.y=it.hy; }
    else { it.x=it.hx; it.y=it.hy; }
    dragIt=null;
    var n=placedCount();
    var sc=document.getElementById('sc2'); if(sc) sc.textContent=n+' / 8';
    var em=document.getElementById('sc2msg');
    if(n===8){ if(em) em.textContent='🎉 أحسنت! صنّفت جميع المواد!'; setTimeout(function(){buddySay('🎉 رائع! صنّفت كل المواد بشكل صحيح!',5000);},200); }
    else if(em) em.textContent='اسحب المواد من الأسفل';
  }

  function draw(){
    var c=elCtx(), l=L();
    c.clearRect(0,0,l.w,l.h);
    c.fillStyle=isDarkMode()?'#141C28':'#EEF4FA'; c.fillRect(0,0,l.w,l.h);
    simState.t+=.02;

    // ── رأس الجدول ──
    var hdrH=l.colH*.12;
    // رأس موصِّلة
    c.fillStyle='rgba(39,174,96,.18)';
    c.beginPath(); c.roundRect(l.cColX,l.colY,l.cColW,hdrH,8); c.fill();
    c.font='bold 15px Tajawal'; c.fillStyle='#1E8449'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('✅ موصِّلة',l.cColX+l.cColW/2,l.colY+hdrH/2);

    // رأس عازلة
    c.fillStyle='rgba(192,57,43,.18)';
    c.beginPath(); c.roundRect(l.eColX,l.colY,l.eColW,hdrH,8); c.fill();
    c.fillStyle='#C0392B';
    c.fillText('❌ عازلة',l.eColX+l.eColW/2,l.colY+hdrH/2);

    // جسم عمود موصِّلة
    c.fillStyle='rgba(39,174,96,.05)'; c.strokeStyle='rgba(39,174,96,.35)'; c.lineWidth=2;
    c.beginPath(); c.roundRect(l.cColX,l.colY+hdrH,l.cColW,l.colH-hdrH,8); c.fill(); c.stroke();

    // جسم عمود عازلة
    c.fillStyle='rgba(192,57,43,.05)'; c.strokeStyle='rgba(192,57,43,.35)'; c.lineWidth=2;
    c.beginPath(); c.roundRect(l.eColX,l.colY+hdrH,l.eColW,l.colH-hdrH,8); c.fill(); c.stroke();

    // حاجز الفصل بين العمودين (خط متقطع)
    c.strokeStyle='rgba(0,0,0,.1)'; c.lineWidth=1.5; c.setLineDash([5,5]);
    c.beginPath(); c.moveTo(l.w*.49,l.colY); c.lineTo(l.w*.49,l.colY+l.colH); c.stroke();
    c.setLineDash([]);

    // المواد المُصنَّفة داخل الأعمدة
    var iw2=l.cColW*.88, ih2=l.ih;
    var ciArr=[],eiArr=[];
    localItems.forEach(function(it){ if(it.placed==='c') ciArr.push(it); else if(it.placed==='e') eiArr.push(it); });
    var rowH=ih2+10;
    function drawPlacedItem(it,col,idx){
      var ix=col.x+col.w/2;
      var startY=l.colY+hdrH+14;
      var iy=startY+idx*rowH+ih2/2;
      c.fillStyle=isDarkMode()?'rgba(30,42,56,.92)':'rgba(255,255,255,.92)';
      c.strokeStyle=it.c?'rgba(39,174,96,.55)':'rgba(192,57,43,.55)'; c.lineWidth=1.5;
      c.beginPath(); c.roundRect(ix-iw2/2,iy-ih2/2,iw2,ih2,10); c.fill(); c.stroke();
      c.font='22px serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(it.icon,ix-iw2*.2,iy);
      c.font='bold 13px Tajawal'; c.fillStyle=isDarkMode()?'#ddd':'#333'; c.fillText(it.label,ix+iw2*.1,iy);
    }
    ciArr.forEach(function(it,i){ drawPlacedItem(it,{x:l.cColX,w:l.cColW},i); });
    eiArr.forEach(function(it,i){ drawPlacedItem(it,{x:l.eColX,w:l.eColW},i); });

    // تلميح "أفلت هنا" إن كانت الأعمدة فارغة
    function drawHint(col){
      c.font='13px Tajawal'; c.fillStyle='rgba(0,0,0,.2)'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('أفلت هنا',col.x+col.w/2,l.colY+l.colH*.55);
    }
    if(ciArr.length===0) drawHint({x:l.cColX,w:l.cColW});
    if(eiArr.length===0) drawHint({x:l.eColX,w:l.eColW});

    // ── صينية المواد (الأسفل) ──
    c.fillStyle=isDarkMode()?'rgba(20,28,40,.75)':'rgba(230,238,248,.9)';
    c.beginPath(); c.roundRect(0,l.trayY-6,l.w,l.h-l.trayY+6,0); c.fill();
    c.strokeStyle='rgba(0,0,0,.06)'; c.lineWidth=1;
    c.beginPath(); c.moveTo(0,l.trayY-6); c.lineTo(l.w,l.trayY-6); c.stroke();

    // عنوان الصينية
    c.font='bold 12px Tajawal'; c.fillStyle=isDarkMode()?'#aaa':'#777'; c.textAlign='right'; c.textBaseline='top';
    c.fillText('المواد المتبقية ↓',l.w-8,l.trayY-3);

    // المواد غير المُصنَّفة
    localItems.forEach(function(it){
      if(it.placed!==null)return;
      var isDrag=(dragIt&&dragIt.id===it.id);
      var iw3=l.iw, ih3=l.ih;
      c.shadowBlur=isDrag?22:6; c.shadowColor=isDrag?'rgba(26,143,168,.5)':'rgba(0,0,0,.12)';
      c.fillStyle=isDarkMode()?'rgba(30,42,56,.97)':'rgba(255,255,255,.97)';
      c.strokeStyle=isDrag?'#1A8FA8':'rgba(0,0,0,.13)'; c.lineWidth=isDrag?2.5:1.8;
      c.beginPath(); c.roundRect(it.x-iw3/2,it.y-ih3/2,iw3,ih3,12); c.fill(); c.stroke();
      c.shadowBlur=0;
      // أيقونة كبيرة في الوسط العلوي
      c.font=Math.round(iw3*.36)+'px serif'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(it.icon, it.x, it.y - ih3*.13);
      // اسم تحت
      c.font='bold '+Math.round(iw3*.185)+'px Tajawal';
      c.fillStyle=isDarkMode()?'#ddd':'#333';
      c.textBaseline='bottom';
      c.fillText(it.label, it.x, it.y+ih3/2-4);
    });

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}


// ─────────────────────────────────────────────────────
// 5-2: الماء والكهرباء (نشاط واحد موحَّد — نقي ثم ملح)
// ─────────────────────────────────────────────────────
function simWaterConductor1() {
  cancelAnimationFrame(animFrame);
  simState={t:0,salt:0,spoons:0,dragging:false,spoonX:0,spoonY:0,bubbles:[]};

  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧂 أضف ملحاً للماء</div>
      <div style="font-size:13px;color:#777;margin-bottom:8px">اسحب الملعقة إلى الكأس!</div>
      <div id="spoonBtn" style="display:inline-flex;align-items:center;gap:8px;padding:10px 16px;
        border-radius:12px;background:rgba(243,156,18,.1);border:2px solid rgba(243,156,18,.4);
        cursor:grab;font-family:Tajawal;font-size:15px;font-weight:700;user-select:none">
        🥄 ملعقة ملح
      </div>
      <div style="margin-top:8px;font-size:13px;color:#888">
        ملاعق مضافة: <span id="spoonCount" style="font-weight:800;color:#F39C12">0</span>
      </div>
      <button onclick="elWReset()" style="margin-top:8px;width:100%;padding:8px;border-radius:8px;
        border:1.5px solid rgba(192,57,43,.2);background:rgba(192,57,43,.06);color:#C0392B;
        font-family:Tajawal;font-size:13px;cursor:pointer">🔄 إعادة التجربة</button>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">⚡ قراءة الأميتر</div>
      <div id="amRead" style="text-align:center;font-size:24px;font-weight:800;color:#E74C3C;direction:ltr">0.00 A</div>
      <div id="amLabel" style="text-align:center;font-size:12px;color:#888">لا يوجد تيار</div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">💡 المصباح</div>
      <div id="bStatus" style="text-align:center;font-size:20px">❌ منطفئ</div>
    </div>
    <div class="info-box" style="font-size:13px">
      📖 ص٣٦: الماء النقي لا يوصِّل لأنه لا يحتوي على أيونات. الأملاح المذابة تُنتج أيونات تحمل الشحنة.
    </div>`);

  window.elWReset=function(){
    simState.salt=0; simState.spoons=0;
    document.getElementById('spoonCount').textContent='0';
    document.getElementById('amRead').textContent='0.00 A'; document.getElementById('amRead').style.color='#E74C3C';
    document.getElementById('amLabel').textContent='لا يوجد تيار';
    document.getElementById('bStatus').textContent='❌ منطفئ';
    simState.bubbles=[];
  };

  var cv=document.getElementById('simCanvas');
  function gp(e){var r=cv.getBoundingClientRect(),sc=cv.width/r.width,s=e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e;return{x:(s.clientX-r.left)*sc,y:(s.clientY-r.top)*sc};}

  // موضع الملعقة (ترسم على الكانفاس)
  function L(){ var w=elW(),h=elH(); return{w,h,
    gx:w*.5,gy:h*.5,gw:w*.2,gh:h*.28, // الكأس
    spoonHomeX:w*.2,spoonHomeY:h*.72,  // موضع الملعقة — يسار بعيداً عن buddy
  };}
  var localSpoon={x:0,y:0,dragging:false,ox:0,oy:0};
  function initSpoon(){ var l=L(); localSpoon.x=l.spoonHomeX; localSpoon.y=l.spoonHomeY; }
  initSpoon();

  cv.addEventListener('mousedown',function(e){ var p=gp(e); if(Math.abs(p.x-localSpoon.x)<46&&Math.abs(p.y-localSpoon.y)<40){ localSpoon.dragging=true; localSpoon.ox=p.x-localSpoon.x; localSpoon.oy=p.y-localSpoon.y; } });
  cv.addEventListener('mousemove',function(e){ if(!localSpoon.dragging)return; var p=gp(e); localSpoon.x=p.x-localSpoon.ox; localSpoon.y=p.y-localSpoon.oy; });
  cv.addEventListener('mouseup',function(e){ if(!localSpoon.dragging)return; checkDrop(); localSpoon.dragging=false; });
  cv.addEventListener('touchstart',function(e){ var p=gp(e); e.preventDefault(); if(Math.abs(p.x-localSpoon.x)<46&&Math.abs(p.y-localSpoon.y)<40){ localSpoon.dragging=true; localSpoon.ox=p.x-localSpoon.x; localSpoon.oy=p.y-localSpoon.y; }},{passive:false});
  cv.addEventListener('touchmove',function(e){ if(!localSpoon.dragging)return; e.preventDefault(); var p=gp(e); localSpoon.x=p.x-localSpoon.ox; localSpoon.y=p.y-localSpoon.oy; },{passive:false});
  cv.addEventListener('touchend',function(e){ if(!localSpoon.dragging)return; e.preventDefault(); checkDrop(); localSpoon.dragging=false; },{passive:false});

  function checkDrop(){
    var l=L();
    // هل الملعقة داخل الكأس؟
    if(Math.abs(localSpoon.x-l.gx)<l.gw&&localSpoon.y>l.gy-l.gh*.8&&localSpoon.y<l.gy+8){
      simState.spoons=Math.min(simState.spoons+1,5);
      simState.salt=simState.spoons/5;
      try{U9Sound.ping(400+simState.spoons*80,.1,.15);}catch(ex){}
      // فقاعات
      for(var i=0;i<6;i++) simState.bubbles.push({x:(Math.random()-.5)*l.gw*1.2,y:0,vy:-Math.random()*1.5-1,r:Math.random()*4+2,life:1});
      // تحديث القراءات
      var curr=(simState.salt*.85).toFixed(2);
      document.getElementById('spoonCount').textContent=simState.spoons;
      document.getElementById('amRead').textContent=curr+' A';
      document.getElementById('amRead').style.color=simState.salt>0?'#27AE60':'#E74C3C';
      document.getElementById('amLabel').textContent=simState.salt>0?'✅ يوجد تيار كهربائي':'لا يوجد تيار';
      document.getElementById('bStatus').textContent=simState.salt>0?'✅ يضيء!':'❌ منطفئ';
    }
    // أعد الملعقة لموضعها
    var l2=L(); localSpoon.x=l2.spoonHomeX; localSpoon.y=l2.spoonHomeY;
  }

  function draw(){
    var c=elCtx(), l=L(), w=l.w, h=l.h;
    c.clearRect(0,0,w,h); c.fillStyle=isDarkMode()?'#141C28':'#EEF6FF'; c.fillRect(0,0,w,h);
    simState.t+=.04;
    var s=simState.salt, on=s>0;

    // ── الكأس ──
    var gx=l.gx,gy=l.gy,gw=l.gw,gh=l.gh;
    // الماء
    c.fillStyle='rgba(41,182,246,'+(0.15+s*.2)+')';
    c.beginPath(); c.moveTo(gx-gw*.9,gy-gh*.75); c.lineTo(gx-gw,gy); c.lineTo(gx+gw,gy); c.lineTo(gx+gw*.9,gy-gh*.75); c.closePath(); c.fill();
    // موجات
    for(var wi=0;wi<3;wi++){
      var wy=gy-gh*.75+wi*h*.04+Math.sin(simState.t+wi)*3;
      c.strokeStyle='rgba(41,182,246,'+(0.2+s*.3)+')'; c.lineWidth=1; c.setLineDash([3,3]);
      c.beginPath(); c.moveTo(gx-gw*.8,wy); c.lineTo(gx+gw*.8,wy); c.stroke(); c.setLineDash([]);
    }
    // جزيئات الملح
    for(var si=0;si<simState.spoons*8;si++){
      var sx=gx+(Math.sin(si*137+simState.t*.3))*gw*.7;
      var sy=gy-gh*.2-Math.abs(Math.cos(si*73))*gh*.4;
      c.fillStyle='rgba(255,200,100,'+(0.4+Math.sin(simState.t+si)*.2)+')';
      c.beginPath(); c.arc(sx,sy,2.5,0,Math.PI*2); c.fill();
    }
    // فقاعات
    simState.bubbles=simState.bubbles.filter(function(b){return b.life>0;});
    simState.bubbles.forEach(function(b){ b.y+=b.vy; b.life-=.02;
      c.strokeStyle='rgba(255,255,255,'+(b.life*.5)+')'; c.lineWidth=1;
      c.beginPath(); c.arc(gx+b.x,gy-gh*.4+b.y,b.r,0,Math.PI*2); c.stroke();
    });
    // حواف الكأس
    c.strokeStyle=isDarkMode()?'rgba(255,255,255,.25)':'rgba(0,0,0,.2)'; c.lineWidth=2.5;
    c.beginPath(); c.moveTo(gx-gw*.9,gy-gh*.75); c.lineTo(gx-gw,gy); c.lineTo(gx+gw,gy); c.lineTo(gx+gw*.9,gy-gh*.75); c.stroke();
    c.beginPath(); c.moveTo(gx-gw*.9,gy-gh*.75); c.lineTo(gx+gw*.9,gy-gh*.75); c.stroke();
    // تسمية
    c.font='bold 14px Tajawal'; c.fillStyle=isDarkMode()?'#7EC8E3':'#1565C0'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(s>0?'ماء نقي 💧':'ماء مقطَّر 💧',gx,gy-gh*.38);

    // ── أقطاب الألمنيوم ──
    [-1,1].forEach(function(side){
      c.fillStyle='#C0C0C0'; c.strokeStyle='#888'; c.lineWidth=2;
      c.beginPath(); c.rect(gx+side*gw*.55-4,gy-gh*.73,8,gh*.5); c.fill(); c.stroke();
      // فقاعات عند القطب إذا يوصّل
      if(on){ for(var bi=0;bi<3;bi++){
        var boff=Math.sin(simState.t*3+bi*2)*6;
        c.strokeStyle='rgba(255,255,255,'+(0.5-bi*.15)+')'; c.lineWidth=1;
        c.beginPath(); c.arc(gx+side*gw*.55,gy-gh*.4-bi*h*.03+boff,3+bi,0,Math.PI*2); c.stroke();
      }}
    });

    // ══ الدائرة الكهربائية — بطارية يسار، مصباح فوق وسط، كأس أسفل ══
    var wc = on ? '#27AE60' : '#90A4AE';
    var lw = on ? 3.5 : 2.5;
    var wireY = h * .10;           // مستوى السلك العلوي
    var batX = w * .12, batY = h * .30;
    var bulbX = w * .50, bulbY = h * .14;
    var bulbR = Math.max(14, w * .028);

    // ── البطارية (عمودية على اليسار) ──
    c.fillStyle = '#1C2833';
    c.beginPath(); c.roundRect(batX-20, batY-32, 40, 64, 7); c.fill();
    c.fillStyle = '#F39C12';
    for(var bi2=0; bi2<3; bi2++) c.fillRect(batX-12, batY-24+bi2*18, 24, 12);
    c.fillStyle = '#E74C3C'; c.fillRect(batX-4, batY-42, 8, 14); // قطب +
    c.fillStyle = '#888';    c.fillRect(batX-4, batY+32, 8, 10);  // قطب -
    c.fillStyle = 'white'; c.font = 'bold 9px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('1.5V', batX, batY+4);
    c.fillStyle = '#E74C3C'; c.font = 'bold 13px Arial'; c.fillText('+', batX, batY-50);
    c.fillStyle = '#888'; c.fillText('−', batX, batY+50);

    // ── المصباح (فوق الوسط) ──
    if(on){ c.shadowBlur = 22 + Math.sin(simState.t*4)*6; c.shadowColor = 'rgba(255,220,0,.85)'; }
    c.fillStyle = on ? ('rgba(255,235,80,'+(0.65+.15*Math.sin(simState.t*4))+')') : 'rgba(200,200,200,.45)';
    c.beginPath(); c.arc(bulbX, bulbY, bulbR, 0, Math.PI*2); c.fill();
    c.shadowBlur = 0;
    c.strokeStyle = on ? '#F1C40F' : '#AAA'; c.lineWidth = 2;
    c.beginPath(); c.arc(bulbX, bulbY, bulbR, 0, Math.PI*2); c.stroke();
    if(on){
      c.strokeStyle = 'rgba(255,150,0,.85)'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(bulbX-6,bulbY-3); c.lineTo(bulbX-2,bulbY+4); c.lineTo(bulbX+2,bulbY-4); c.lineTo(bulbX+6,bulbY+3); c.stroke();
    }
    c.fillStyle = '#444';
    c.beginPath(); c.roundRect(bulbX-8, bulbY+bulbR-2, 16, 12, 3); c.fill();
    c.fillStyle = '#666'; c.fillRect(bulbX-5, bulbY+bulbR+10, 10, 5);
    c.font = '11px Tajawal'; c.fillStyle = isDarkMode()?'#ccc':'#555';
    c.textAlign = 'center'; c.textBaseline = 'top';
    c.fillText(on?'💡 يضيء':'منطفئ', bulbX, bulbY+bulbR+17);

    // ── الأسلاك ──
    // 1) بطارية (+) → فوق → مصباح (يسار المصباح)
    c.strokeStyle = wc; c.lineWidth = lw; c.lineJoin = 'round'; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(batX, batY - 42);              // قطب + البطارية
    c.lineTo(batX, wireY);                  // صعود
    c.lineTo(bulbX - bulbR, wireY);         // أفقي لليمين
    c.lineTo(bulbX - bulbR, bulbY);         // نزول للمصباح
    c.stroke();

    // 2) مصباح (يمين) → أفقي → قطب يمين الكأس
    c.beginPath();
    c.moveTo(bulbX + bulbR, bulbY);
    c.lineTo(bulbX + bulbR, wireY);
    c.lineTo(gx + gw*.55, wireY);
    c.lineTo(gx + gw*.55, gy - gh*.73);
    c.stroke();

    // 3) بطارية (-) → أفقي → قطب يسار الكأس
    c.beginPath();
    c.moveTo(batX, batY + 42);
    c.lineTo(batX, gy - gh*.4);
    c.lineTo(gx - gw*.55, gy - gh*.4);
    c.lineTo(gx - gw*.55, gy - gh*.73);
    c.stroke();

    // ── تدفق الإلكترونات ──
    if(on && simState.spoons > 0){
      var dotCount = simState.spoons * 3;
      // على السلك العلوي (بطارية → مصباح)
      var topPathLen = (batX - wireY) + (bulbX - bulbR - batX) + (bulbY - wireY);
      for(var fi=0; fi<dotCount; fi++){
        var ft = ((simState.t * s * 0.7 + fi/dotCount)) % 1;
        var fx2, fy2;
        var seg1 = 0.3, seg2 = 0.7;
        if(ft < seg1){ fx2 = batX; fy2 = wireY + (1-ft/seg1)*(batY-42-wireY); }
        else if(ft < seg2){ fx2 = batX + (ft-seg1)/(seg2-seg1)*(bulbX-bulbR-batX); fy2 = wireY; }
        else { fx2 = bulbX-bulbR; fy2 = wireY + (ft-seg2)/(1-seg2)*(bulbY-wireY); }
        c.fillStyle = 'rgba(100,230,255,'+(0.8-ft*.3)+')';
        c.beginPath(); c.arc(fx2, fy2, 4, 0, Math.PI*2); c.fill();
      }
    }

    // ── الملعقة (قابلة للسحب) — كبيرة وواضحة ──
    if(!localSpoon.dragging){
      c.fillStyle=isDarkMode()?'rgba(243,156,18,.18)':'rgba(243,156,18,.15)';
      c.strokeStyle='rgba(243,156,18,.7)'; c.lineWidth=2.5; c.setLineDash([5,3]);
      c.beginPath(); c.roundRect(localSpoon.x-46,localSpoon.y-34,92,68,14); c.fill(); c.stroke();
      c.setLineDash([]);
      var arOff=Math.sin(simState.t*3)*6;
      c.fillStyle='rgba(243,156,18,.9)'; c.font='bold 18px Arial'; c.textAlign='left'; c.textBaseline='middle';
      c.fillText('→',localSpoon.x+34+arOff,localSpoon.y);
      c.font='bold 12px Tajawal'; c.fillStyle=isDarkMode()?'#F39C12':'#B7770D'; c.textAlign='center'; c.textBaseline='top';
      c.fillText('اسحب نحو الكأس!',localSpoon.x,localSpoon.y+24);
    }
    c.save();
    c.translate(localSpoon.x,localSpoon.y);
    c.font='38px serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('🥄',0,0);
    c.restore();

    // ── خلاصة (مرفوعة لتجنّب التداخل مع زر ماذا نستنتج) ──
    var msg=on?('✅ الماء المالح يوصِّل! | '+(s*.85).toFixed(2)+' A'):'💧 الماء النقي لا يوصِّل';
    c.fillStyle=isDarkMode()?'rgba(20,28,40,.9)':'rgba(255,255,255,.9)';
    c.beginPath(); c.roundRect(w*.04,h*.8,w*.92,h*.1,12); c.fill();
    c.strokeStyle=on?'rgba(39,174,96,.3)':'rgba(231,76,60,.2)'; c.lineWidth=1.5;
    c.beginPath(); c.roundRect(w*.04,h*.8,w*.92,h*.1,12); c.stroke();
    c.fillStyle=on?'#1E8449':'#C0392B'; c.font='bold 14px Tajawal'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(msg,w/2,h*.855);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// 5-2 TAB 2 — نفس النشاط (حُذف النسخة المنفصلة)
function simWaterConductor2() { simWaterConductor1(); }

// ─────────────────────────────────────────────────────
// 5-2b: هل أجسامنا توصّل الكهرباء؟ — استقصاء الصعقة الكهربائية
// ─────────────────────────────────────────────────────
function simBodyConductor1() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, shocked:false, shockAnim:0, bodyType:'wet', wireType:'bare', switchOn:false };

  var bodyTypes = [
    { id:'wet', label:'يد مبللة بالماء', conducts:true, R:'~1 kΩ',  risk:'خطر شديد 🔴' },
    { id:'dry', label:'يد جافة',         conducts:true, R:'~50 kΩ', risk:'خطر كبير 🟠' },
  ];
  var wireTypes = [
    { id:'bare',      label:'سلك مكشوف (تالف)', safe:false, col:'#E74C3C' },
    { id:'insulated', label:'سلك معزول (سليم)',  safe:true,  col:'#27AE60' },
  ];

  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔌 تشغيل / إيقاف</div>
      <div style="display:flex;gap:8px">
        <button id="swOn"  onclick="simState.switchOn=true;simState.shocked=false;simState.shockAnim=0;"  style="flex:1;padding:10px;border-radius:10px;border:2px solid rgba(231,76,60,.5);background:rgba(231,76,60,.08);font-family:Tajawal;font-size:15px;font-weight:800;cursor:pointer;color:#C0392B">⚡ ON</button>
        <button id="swOff" onclick="simState.switchOn=false;simState.shocked=false;simState.shockAnim=0;" style="flex:1;padding:10px;border-radius:10px;border:2px solid rgba(39,174,96,.5);background:rgba(39,174,96,.08);font-family:Tajawal;font-size:15px;font-weight:800;cursor:pointer;color:#27AE60">🔒 OFF</button>
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🧪 نوع الجلد</div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button id="bt0" onclick="simState.bodyType='wet';simState.shocked=false;simState.shockAnim=0;" style="padding:9px;border-radius:10px;border:2px solid rgba(231,76,60,.5);background:rgba(231,76,60,.08);font-family:Tajawal;font-size:14px;font-weight:700;cursor:pointer;color:#C0392B">💧 يد مبللة</button>
        <button id="bt1" onclick="simState.bodyType='dry';simState.shocked=false;simState.shockAnim=0;"  style="padding:9px;border-radius:10px;border:2px solid rgba(212,144,26,.5);background:rgba(212,144,26,.08);font-family:Tajawal;font-size:14px;font-weight:700;cursor:pointer;color:#D4901A">🖐️ يد جافة</button>
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🔗 نوع السلك</div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button id="wt0" onclick="simState.wireType='bare';simState.shocked=false;simState.shockAnim=0;"      style="padding:9px;border-radius:10px;border:2px solid rgba(231,76,60,.5);background:rgba(231,76,60,.08);font-family:Tajawal;font-size:14px;font-weight:700;cursor:pointer;color:#C0392B">⚠️ سلك مكشوف (تالف)</button>
        <button id="wt1" onclick="simState.wireType='insulated';simState.shocked=false;simState.shockAnim=0;" style="padding:9px;border-radius:10px;border:2px solid rgba(39,174,96,.5);background:rgba(39,174,96,.08);font-family:Tajawal;font-size:14px;font-weight:700;cursor:pointer;color:#27AE60">✅ سلك معزول (سليم)</button>
      </div>
    </div>
    <div class="ctrl-section">
      <button id="touchBtn" onclick="window._doTouch()" style="width:100%;padding:12px;border-radius:12px;background:rgba(192,57,43,.12);border:2.5px solid rgba(192,57,43,.5);color:#C0392B;font-family:Tajawal;font-size:16px;font-weight:800;cursor:pointer">⚠️ المس السلك</button>
    </div>
    <div class="info-box" style="font-size:13px">
      🫀 جسم الإنسان ~60% ماء وأملاح — موصِّل جيد للكهرباء!<br>⚡ 100 mA تكفي لصعقة قاتلة!
    </div>
    <div class="q-box" style="font-size:13px">
      <strong>❓ لماذا تكون الصعقة أشد باليد المبللة؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الماء يخفّض مقاومة الجسم، فيمر تيار أكبر — أشد خطراً على القلب والجهاز العصبي.</div>
    </div>`);

  window._doTouch = function() {
    if(!simState.switchOn){ try{U9Sound.ping(600,.1,.05);}catch(e){} return; }
    var wt = wireTypes.find(function(w){ return w.id===simState.wireType; });
    var bt = bodyTypes.find(function(b){ return b.id===simState.bodyType; });
    if(wt && !wt.safe && bt && bt.conducts){
      simState.shocked=true; simState.shockAnim=0;
      try{U9Sound.ping(80,.3,.4);}catch(e){}
    } else {
      simState.shocked=false;
      try{U9Sound.ping(600,.1,.1);}catch(e){}
    }
  };

  function draw() {
    var c=elCtx(), w=elW(), h=elH();
    c.clearRect(0,0,w,h);
    simState.t+=0.04;
    if(simState.shocked && simState.shockAnim<1) simState.shockAnim=Math.min(1,simState.shockAnim+0.05);

    var bt = bodyTypes.find(function(b){return b.id===simState.bodyType;})||bodyTypes[0];
    var wt = wireTypes.find(function(ww){return ww.id===simState.wireType;})||wireTypes[0];
    var isOn = simState.switchOn;
    var shocked = simState.shocked && bt.conducts && isOn && !wt.safe;
    var sa = simState.shockAnim;

    // خلفية
    var bgCol = shocked?'rgba(255,'+(200-sa*150|0)+','+(200-sa*150|0)+',.3)':(isDarkMode()?'#141C28':'#EEF4FF');
    c.fillStyle=bgCol; c.fillRect(0,0,w,h);

    // === المقبس في الجدار ===
    var wallX=w*0.05, wallY=h*0.18, wallW=36, wallH=h*0.42;
    c.fillStyle=isDarkMode()?'#2C3A4E':'#C8D0E0';
    c.beginPath(); c.roundRect(wallX-8,wallY-8,wallW+16,wallH+16,10); c.fill();
    c.fillStyle=isDarkMode()?'#3A4A5E':'#D8E0F0';
    c.beginPath(); c.roundRect(wallX,wallY,wallW,wallH,6); c.fill();
    c.fillStyle=isDarkMode()?'#1E2A38':'#B0B8CC';
    c.beginPath(); c.roundRect(wallX+4,wallY+wallH*0.25,wallW-8,wallH*0.55,5); c.fill();
    // فتحتا المقبس
    c.fillStyle='#111';
    c.beginPath(); c.roundRect(wallX+7, wallY+wallH*0.32, 8,16,3); c.fill();
    c.beginPath(); c.roundRect(wallX+21,wallY+wallH*0.32, 8,16,3); c.fill();
    c.beginPath(); c.arc(wallX+wallW/2, wallY+wallH*0.62, 5,0,Math.PI*2); c.fill();
    c.fillStyle='#E74C3C'; c.font='bold 9px Arial'; c.textAlign='center'; c.textBaseline='top';
    c.fillText('220V', wallX+wallW/2, wallY+wallH+4);
    c.fillStyle=isDarkMode()?'#8AA8C0':'#666'; c.font='9px Tajawal'; c.textAlign='center';
    c.fillText('مقبس', wallX+wallW/2, wallY+wallH+15);

    // === القابس والسلك ===
    var wireY = wallY+wallH*0.4;
    var plugX = wallX+wallW+8;
    var plugW=26, plugH=18;
    var plugY = wireY-plugH/2;
    var wireStartX = plugX+plugW;
    var wireEndX = w*0.42;

    // دبابيس القابس داخل المقبس
    c.fillStyle='#999';
    c.fillRect(wallX+wallW, wireY-5, plugX-(wallX+wallW)+4, 4);
    c.fillRect(wallX+wallW, wireY+1, plugX-(wallX+wallW)+4, 4);

    // جسم القابس
    c.fillStyle=isDarkMode()?'#2C3A50':'#CDD5E5';
    c.beginPath(); c.roundRect(plugX,plugY,plugW,plugH,5); c.fill();
    c.strokeStyle=isDarkMode()?'#4A6080':'#9AA8C0'; c.lineWidth=1.5;
    c.beginPath(); c.roundRect(plugX,plugY,plugW,plugH,5); c.stroke();
    c.fillStyle=isDarkMode()?'#6A88A8':'#888'; c.font='bold 6px Arial'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('PLUG', plugX+plugW/2, plugY+plugH/2);
    c.fillStyle=isDarkMode()?'#8AA8C0':'#666'; c.font='9px Tajawal'; c.textAlign='center'; c.textBaseline='top';
    c.fillText('قابس', plugX+plugW/2, plugY+plugH+3);

    // السلك
    if(wt.id==='insulated'){
      c.strokeStyle='#27AE60'; c.lineWidth=9; c.lineCap='round';
      c.beginPath(); c.moveTo(wireStartX,wireY); c.lineTo(wireEndX,wireY); c.stroke();
      c.strokeStyle='#888'; c.lineWidth=5; c.lineCap='round';
      c.beginPath(); c.moveTo(wireStartX,wireY); c.lineTo(wireEndX,wireY); c.stroke();
      c.strokeStyle='rgba(255,255,255,.25)'; c.lineWidth=2;
      c.beginPath(); c.moveTo(wireStartX,wireY-2); c.lineTo(wireEndX-10,wireY-2); c.stroke();
    } else {
      c.strokeStyle=(isOn&&shocked)?('rgba(255,'+(80-sa*80|0)+',0,.9)'):'#B87333';
      c.lineWidth=5; c.lineCap='round';
      c.beginPath(); c.moveTo(wireStartX,wireY); c.lineTo(wireEndX,wireY); c.stroke();
      if(isOn && Math.sin(simState.t*6)>0 && !shocked){
        c.font='18px serif'; c.textAlign='center'; c.textBaseline='middle';
        c.fillText('⚡', wireEndX+16, wireY-2);
      }
    }
    // نهاية السلك
    c.fillStyle=wt.id==='insulated'?'#27AE60':'#E74C3C';
    c.beginPath(); c.arc(wireEndX,wireY,6,0,Math.PI*2); c.fill();

    // === مفتاح ON/OFF ===
    var swX=w*0.55, swY=h*0.07;
    var swW=52, swH=24;
    c.fillStyle=isDarkMode()?'#1C2A3A':'#DDE4F0';
    c.beginPath(); c.roundRect(swX-swW/2,swY-swH/2,swW,swH,swH/2); c.fill();
    var sliderX=isOn?swX+swW/2-swH/2-2:swX-swW/2+swH/2+2;
    c.fillStyle=isOn?'#27AE60':'#E74C3C';
    c.beginPath(); c.arc(sliderX,swY,swH/2-3,0,Math.PI*2); c.fill();
    c.fillStyle='white'; c.font='bold 9px Arial'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(isOn?'ON':'OFF', swX+(isOn?-12:12), swY);
    c.fillStyle=isDarkMode()?'#aaa':'#555'; c.font='10px Tajawal'; c.textAlign='center'; c.textBaseline='top';
    c.fillText('مفتاح التيار', swX, swY+swH/2+4);

    // === الشخص ===
    var px=w*0.68, py=h*0.1;
    var shakeX=shocked?Math.sin(simState.t*30)*8*sa:0;
    c.save(); c.translate(shakeX,0);

    // رأس
    c.fillStyle='#FDBCB4'; c.strokeStyle='#D4876A'; c.lineWidth=2;
    c.beginPath(); c.arc(px,py+20,22,0,Math.PI*2); c.fill(); c.stroke();
    if(shocked&&sa>0.3){
      c.strokeStyle='#C0392B'; c.lineWidth=2.5;
      [-8,8].forEach(function(ex){
        c.beginPath(); c.moveTo(px+ex-5,py+14); c.lineTo(px+ex+5,py+24); c.stroke();
        c.beginPath(); c.moveTo(px+ex+5,py+14); c.lineTo(px+ex-5,py+24); c.stroke();
      });
      c.strokeStyle='#C0392B'; c.lineWidth=2.5;
      c.beginPath(); c.arc(px,py+28,9,0,Math.PI); c.stroke();
    } else {
      c.fillStyle='#333';
      c.beginPath(); c.arc(px-8,py+18,4,0,Math.PI*2); c.fill();
      c.beginPath(); c.arc(px+8,py+18,4,0,Math.PI*2); c.fill();
      c.strokeStyle='#D4876A'; c.lineWidth=2;
      c.beginPath(); c.arc(px,py+28,7,0,Math.PI); c.stroke();
    }

    // جسم
    var bodyColor=shocked?('rgba(255,'+(200-sa*120|0)+','+(50+sa*20|0)+',.9)'):'#4A90D9';
    c.fillStyle=bodyColor;
    c.beginPath(); c.roundRect(px-20,py+42,40,70,8); c.fill();
    c.strokeStyle='rgba(0,0,0,.15)'; c.lineWidth=1.5;
    c.beginPath(); c.roundRect(px-20,py+42,40,70,8); c.stroke();

    // ذراع يلمس السلك
    var armEndX=wireEndX+5, armEndY=wireY;
    c.strokeStyle='#FDBCB4'; c.lineWidth=12; c.lineCap='round';
    c.beginPath(); c.moveTo(px-18,py+60); c.quadraticCurveTo(px-55,py+75,armEndX,armEndY); c.stroke();
    c.fillStyle='#FDBCB4'; c.beginPath(); c.arc(armEndX,armEndY,11,0,Math.PI*2); c.fill();

    // ذراع أيمن
    c.strokeStyle='#FDBCB4'; c.lineWidth=12; c.lineCap='round';
    c.beginPath(); c.moveTo(px+18,py+60); c.lineTo(px+38,py+100); c.stroke();

    // ساقان
    [-12,12].forEach(function(lx2,li){
      c.strokeStyle='#2C5E8A'; c.lineWidth=14; c.lineCap='round';
      c.beginPath(); c.moveTo(px+lx2,py+112); c.lineTo(px+lx2+(li===0?-6:6),py+155); c.stroke();
      c.fillStyle='#8B6E4E';
      c.beginPath(); c.ellipse(px+lx2+(li===0?-10:10),py+158,16,8,0,0,Math.PI*2); c.fill();
    });

    // مسار التيار
    if(shocked&&bt.conducts){
      for(var ai=0;ai<Math.floor(sa*8);ai++){
        var at=((simState.t*2+ai/8))%1;
        var pp=[{x:armEndX,y:armEndY},{x:px-18,y:py+60},{x:px,y:py+90},{x:px,y:py+130},{x:px,y:py+160}];
        var seg=Math.floor(at*(pp.length-1)), segT=(at*(pp.length-1))-seg;
        if(seg<pp.length-1){
          var ax2=pp[seg].x+(pp[seg+1].x-pp[seg].x)*segT;
          var ay2=pp[seg].y+(pp[seg+1].y-pp[seg].y)*segT;
          c.fillStyle='rgba(255,220,0,'+(0.9-at*.4)+')';
          c.beginPath(); c.arc(ax2,ay2,5+Math.random()*3,0,Math.PI*2); c.fill();
        }
      }
      if(sa>0.5){
        c.fillStyle='rgba(255,255,0,'+Math.max(0,Math.sin(simState.t*20)*0.4)+')';
        c.beginPath(); c.ellipse(px,py+85,45,80,0,0,Math.PI*2); c.fill();
      }
    }

    // رسالة OFF
    if(!isOn){
      c.fillStyle='rgba(39,174,96,.15)'; c.strokeStyle='rgba(39,174,96,.4)'; c.lineWidth=1.5;
      c.beginPath(); c.roundRect(w*.15,h*.4,w*.52,28,8); c.fill(); c.stroke();
      c.fillStyle='#27AE60'; c.font='bold 12px Tajawal'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('🔒 OFF — لا يمر تيار', w*.41,h*.4+14);
    }

    c.restore();

    // === شريط معلومات سفلي ===
    var infoY=h*0.79;
    c.fillStyle=isDarkMode()?'rgba(20,28,40,.88)':'rgba(255,255,255,.88)';
    c.beginPath(); c.roundRect(w*.03,infoY,w*.94,h*.18,12); c.fill();
    c.strokeStyle=shocked?'rgba(192,57,43,.4)':'rgba(26,143,168,.25)'; c.lineWidth=1.5;
    c.beginPath(); c.roundRect(w*.03,infoY,w*.94,h*.18,12); c.stroke();

    var statusMsg, statusCol;
    if(!isOn){       statusMsg='🔒 OFF — لا يمر تيار، لا خطر'; statusCol='#27AE60'; }
    else if(wt.safe){statusMsg='✅ السلك المعزول آمن — العازل يحمي من المس'; statusCol='#27AE60'; }
    else if(shocked){ statusMsg='⚡ صعقة كهربائية! التيار يمر عبر الجسم!'; statusCol='#C0392B'; }
    else {           statusMsg='⚠️ '+bt.label+' — '+bt.risk; statusCol='#D4901A'; }

    c.font='bold 13px Tajawal'; c.fillStyle=statusCol; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(statusMsg, w/2, infoY+h*.045);
    c.font='12px Tajawal'; c.fillStyle=isDarkMode()?'#8AA8C0':'#555'; c.textAlign='center';
    c.fillText('السلك: '+wt.label+'  |  مقاومة الجسم: '+bt.R+'  |  '+bt.risk, w/2, infoY+h*.1);
    c.font='11px Tajawal'; c.fillStyle=isDarkMode()?'#6A8898':'#888'; c.textAlign='center';
    c.fillText(wt.safe?'العزل يمنع التيار — دائماً استخدم أسلاكاً سليمة':'السلك التالف خطر — لا تلمسه أبداً!', w/2, infoY+h*.15);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}
// ─────────────────────────────────────────────────────
// 5-3 TAB 1: أميتر تفاعلي — اضغط على المعدن وشوف التيار
// ─────────────────────────────────────────────────────
function simMetalConductor1() {
  cancelAnimationFrame(animFrame);
  var metals=[
    {id:'au',label:'ذهب',    icon:'💰',col:'#C8900A',I:0.98,R:0.022,q:'الأعلى قيمةً 👑'},
    {id:'ag',label:'فضة',    icon:'🪙',col:'#C0C0C0',I:0.87,R:0.016,q:'الأفضل موصلاً 🥇'},
    {id:'cu',label:'نحاس',   icon:'🔩',col:'#B87333',I:0.82,R:0.017,q:'ممتاز 🥈'},
    {id:'al',label:'ألمنيوم',icon:'🔘',col:'#AAA',   I:0.75,R:0.028,q:'جيد 🥉'},
    {id:'fe',label:'حديد',   icon:'🔧',col:'#777',   I:0.48,R:0.1,  q:'متوسط'},
    {id:'gr',label:'جرافيت', icon:'✏️',col:'#555',   I:0.23,R:1.4,  q:'ضعيف'},
  ];
  simState={t:0,sel:null,needle:0,target:0,flow:[]};
  var localMetals=metals; // closure safe

  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔩 اضغط على أي مادة</div>
      ${metals.map(function(m){ return '<button id="mb_'+m.id+'" onclick="elSelMet(\''+m.id+'\')" style="width:100%;padding:9px 12px;border-radius:10px;border:2px solid rgba(0,0,0,.1);background:white;font-family:Tajawal;font-size:14px;cursor:pointer;display:flex;align-items:center;gap:10px;margin-bottom:5px;transition:all .2s"><span style="font-size:20px">'+m.icon+'</span><span style="flex:1;text-align:right">'+m.label+'</span><span style="font-size:11px;color:#888">'+m.R+' Ω·mm²/m</span></button>'; }).join('')}
    </div>
    <div class="ctrl-section" id="mInfo" style="display:none">
      <div class="ctrl-label">📊 النتيجة</div>
      <div id="mRes" style="text-align:center;padding:8px;border-radius:8px"></div>
    </div>
    <div class="q-box" style="font-size:13px">
      <strong>❓</strong> لماذا نستخدم النحاس للأسلاك لا الذهب؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 الإجابة</button>
      <div class="q-ans-panel">الذهب موصِّل ممتاز لكنه نادر وغالي جداً! النحاس أرخص بكثير وموصليته جيدة جداً. الذهب يُستخدم فقط في الدوائر الدقيقة الإلكترونية.</div>
    </div>`);

  window.elSelMet=function(id){
    var m=localMetals.find(function(x){return x.id===id;});
    simState.sel=m; simState.target=m.I;
    simState.flow=[];
    for(var i=0;i<Math.round(m.I*10);i++) simState.flow.push({t:Math.random(),s:Math.random()*.5+.8});
    try{U9Sound.ping(300+m.I*200,.15,.2);}catch(ex){}
    localMetals.forEach(function(mt){ var b=document.getElementById('mb_'+mt.id); if(b){b.style.borderColor=mt.id===id?'#1A8FA8':'rgba(0,0,0,.1)';b.style.background=mt.id===id?'rgba(26,143,168,.08)':'white';}});
    var info=document.getElementById('mInfo'); if(info) info.style.display='block';
    var res=document.getElementById('mRes'); if(res){ res.style.background='rgba(26,143,168,.07)'; res.innerHTML='<div style="font-size:22px;font-weight:800;color:#1A8FA8">'+m.I.toFixed(2)+' A</div><div style="font-size:12px;color:#888">'+m.icon+' '+m.label+' — '+m.q+'</div>'; }
  };

  var cv=document.getElementById('simCanvas');
  function draw(){
    var c=elCtx(),w=elW(),h=elH();
    c.clearRect(0,0,w,h); c.fillStyle=isDarkMode()?'#141C28':'#F5F8FA'; c.fillRect(0,0,w,h);
    simState.t+=.04;
    simState.needle+=(simState.target-simState.needle)*.08;
    var m=simState.sel;

    // ── أميتر دائري ──
    var ax=w*.5,ay=h*.38,ar=Math.min(w,h)*.22;
    c.fillStyle=isDarkMode()?'#1E2A38':'white'; c.shadowBlur=12; c.shadowColor='rgba(0,0,0,.2)';
    c.beginPath(); c.arc(ax,ay,ar,0,Math.PI*2); c.fill(); c.shadowBlur=0;
    c.strokeStyle='rgba(0,0,0,.2)'; c.lineWidth=3; c.beginPath(); c.arc(ax,ay,ar,0,Math.PI*2); c.stroke();
    // تدريجات
    for(var i=0;i<=10;i++){
      var ang=-Math.PI+i/10*Math.PI;
      var x1=ax+Math.cos(ang)*(ar-6),y1=ay+Math.sin(ang)*(ar-6);
      var x2=ax+Math.cos(ang)*(ar-20),y2=ay+Math.sin(ang)*(ar-20);
      c.strokeStyle=isDarkMode()?'rgba(255,255,255,.5)':'rgba(0,0,0,.35)'; c.lineWidth=i%5===0?2.5:1;
      c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.stroke();
      if(i%5===0){ c.font='bold 11px Arial'; c.fillStyle=isDarkMode()?'#ccc':'#555'; c.textAlign='center'; c.textBaseline='middle'; c.fillText((i/10).toFixed(1),ax+Math.cos(ang)*(ar-30),ay+Math.sin(ang)*(ar-30)); }
    }
    // مناطق ملونة
    [[0,.3,'rgba(231,76,60,.12)'],[.3,.6,'rgba(243,156,18,.12)'],[.6,1,'rgba(39,174,96,.12)']].forEach(function(z){
      c.fillStyle=z[2]; c.beginPath(); c.moveTo(ax,ay); c.arc(ax,ay,ar-8,-Math.PI+z[0]*Math.PI,-Math.PI+z[1]*Math.PI); c.closePath(); c.fill();
    });
    // إبرة
    var na=-Math.PI+simState.needle*Math.PI;
    c.strokeStyle='#E74C3C'; c.lineWidth=3; c.lineCap='round';
    c.beginPath(); c.moveTo(ax,ay); c.lineTo(ax+Math.cos(na)*(ar-12),ay+Math.sin(na)*(ar-12)); c.stroke();
    c.fillStyle='#E74C3C'; c.beginPath(); c.arc(ax,ay,5,0,Math.PI*2); c.fill();
    // A
    c.font='bold 18px Tajawal'; c.fillStyle=isDarkMode()?'#E8F2FA':'#1E2D3D'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('A',ax,ay+ar*.4);
    // قراءة رقمية
    c.font='bold 20px Arial'; c.fillStyle='#1A8FA8'; c.textAlign='center'; c.textBaseline='top';
    c.fillText(simState.needle.toFixed(2)+' A',ax,ay+ar+6);
    // تسمية "جهاز الأميتر" تحت القراءة
    c.font='12px Tajawal'; c.fillStyle=isDarkMode()?'#7A9AB5':'#888'; c.textAlign='center'; c.textBaseline='top';
    c.fillText('جهاز الأميتر (Ammeter)',ax,ay+ar+28);

    // ── المعدن المختبر (شريط أفقي) ──
    var mx=w*.5,my=h*.78,mw=w*.6,mh=h*.055;
    // تأثير ذهبي خاص
    if(m && m.id==='au'){
      var goldG=c.createLinearGradient(mx-mw/2,my-mh/2,mx+mw/2,my+mh/2);
      goldG.addColorStop(0,'#C8900A'); goldG.addColorStop(0.3,'#F0C840'); goldG.addColorStop(0.6,'#C8900A'); goldG.addColorStop(1,'#F0C840');
      c.fillStyle=goldG;
    } else {
      c.fillStyle=m?(m.col+'33'):'rgba(200,200,200,.15)';
    }
    c.strokeStyle=m?m.col:'rgba(150,150,150,.4)'; c.lineWidth=2;
    c.beginPath(); c.roundRect(mx-mw/2,my-mh/2,mw,mh,6); c.fill(); c.stroke();
    // لمعة
    if(m){ c.fillStyle='rgba(255,255,255,.25)'; c.beginPath(); c.roundRect(mx-mw/2+4,my-mh/2+2,mw-8,mh*.3,3); c.fill(); }
    c.font='14px Tajawal'; c.fillStyle=isDarkMode()?'#ddd':'#333'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(m?m.icon+' '+m.label:'← اضغط على مادة من القائمة',mx,my);

    // ── أسلاك ──
    var wc=simState.needle>.05?'#27AE60':'#AAA', lw=simState.needle>.05?2.5:1.5;
    c.strokeStyle=wc; c.lineWidth=lw;
    c.beginPath(); c.moveTo(ax-ar,ay); c.lineTo(ax-ar,my); c.lineTo(mx-mw/2,my); c.stroke();
    c.beginPath(); c.moveTo(ax+ar,ay); c.lineTo(ax+ar,my); c.lineTo(mx+mw/2,my); c.stroke();
    c.beginPath(); c.moveTo(ax-ar,ay); c.lineTo(ax-ar,h*.08); c.lineTo(ax+ar,h*.08); c.lineTo(ax+ar,ay); c.stroke();
    // بطارية
    c.fillStyle='#2C3E50'; c.beginPath(); c.roundRect(ax-ar-28,h*.04,56,28,5); c.fill();
    c.fillStyle='#F39C12'; c.fillRect(ax-ar-20,h*.04+5,40,18);
    c.fillStyle='white'; c.font='bold 9px Arial'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('1.5V',ax-ar,h*.04+14);

    // ── إلكترونات ──
    if(simState.needle>.02){ simState.flow.forEach(function(f){
      f.t=(f.t+.006*f.s*simState.needle*2)%1;
      var na2=-Math.PI+f.t*Math.PI;
      // لون ذهبي للإلكترونات عند الذهب
      var eCol=m&&m.id==='au'?'rgba(240,200,50,':'rgba(0,200,255,';
      c.fillStyle=eCol+(0.6-f.t*.3)+')';
      c.beginPath(); c.arc(ax+Math.cos(na2)*(ar*.6),ay+Math.sin(na2)*(ar*.6),3,0,Math.PI*2); c.fill();
    }); }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// 5-3 TAB 2 — مخطط بياني مقارن
function simMetalConductor2() {
  cancelAnimationFrame(animFrame);
  var metals=[
    {label:'ذهب',    icon:'💰',col:'#C8900A',I:0.98},
    {label:'فضة',    icon:'🪙',col:'#A0A0C0',I:0.87},
    {label:'نحاس',   icon:'🔩',col:'#B87333',I:0.82},
    {label:'ألمنيوم',icon:'🔘',col:'#999',   I:0.75},
    {label:'حديد',   icon:'🔧',col:'#666',   I:0.48},
    {label:'جرافيت', icon:'✏️',col:'#444',   I:0.23},
  ];
  simState={t:0,prog:metals.map(function(){return 0;}),running:false};

  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">📊 مقارنة الموصلية</div>
      <button onclick="simState.running=true;try{U9Sound.ping();}catch(e){}" style="width:100%;padding:11px;border-radius:10px;background:linear-gradient(135deg,#27AE60,#1E8449);color:white;border:none;font-family:Tajawal;font-size:15px;font-weight:700;cursor:pointer">▶ ابدأ المقارنة</button>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🏆 الترتيب (الأفضل أولاً)</div>
      ${metals.map(function(m,i){ return '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid rgba(0,0,0,.05)"><span style="font-weight:800;color:#1A8FA8;min-width:18px">'+(i+1)+'</span><span>'+m.icon+'</span><span style="font-size:13px">'+m.label+'</span><span style="margin-right:auto;font-size:12px;font-weight:700;color:'+m.col+'">'+m.I.toFixed(2)+' A</span></div>'; }).join('')}
    </div>
    <div class="q-box" style="font-size:13px">
      <strong>❓</strong> لماذا نستخدم النحاس لا الذهب في الأسلاك رغم أن الذهب أعلى موصلية؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 الإجابة</button>
      <div class="q-ans-panel">الذهب نادر وغالٍ جداً! النحاس موصليته قريبة من الذهب لكنه أرخص بآلاف المرات. الذهب يُستخدم فقط في الإلكترونيات الدقيقة جداً.</div>
    </div>`);

  var cv=document.getElementById('simCanvas');
  function draw(){
    var c=elCtx(),w=elW(),h=elH();
    c.clearRect(0,0,w,h); c.fillStyle=isDarkMode()?'#141C28':'#F5F8FA'; c.fillRect(0,0,w,h);
    simState.t+=.02;
    var cx=w*.1,cy=h*.08,cw=w*.8,ch=h*.72;
    c.fillStyle=isDarkMode()?'rgba(30,42,56,.5)':'rgba(255,255,255,.7)';
    c.beginPath(); c.roundRect(cx-8,cy-8,cw+16,ch+16,10); c.fill();
    c.font='bold 14px Tajawal'; c.fillStyle=isDarkMode()?'#E8F2FA':'#1E2D3D'; c.textAlign='center'; c.textBaseline='top';
    c.fillText('شدة التيار في المعادن المختلفة (A)',w/2,6);
    // شبكة
    for(var gi=0;gi<=4;gi++){
      var gy2=cy+ch-gi/4*ch;
      c.strokeStyle='rgba(0,0,0,.06)'; c.lineWidth=1; c.beginPath(); c.moveTo(cx,gy2); c.lineTo(cx+cw,gy2); c.stroke();
      c.font='11px Arial'; c.fillStyle='#999'; c.textAlign='right'; c.textBaseline='middle'; c.fillText((gi/4).toFixed(1),cx-4,gy2);
    }
    c.strokeStyle='rgba(0,0,0,.2)'; c.lineWidth=2; c.beginPath(); c.moveTo(cx,cy); c.lineTo(cx,cy+ch); c.lineTo(cx+cw,cy+ch); c.stroke();
    var bw=cw/metals.length-12;
    metals.forEach(function(m,i){
      if(simState.running) simState.prog[i]=Math.min(m.I,simState.prog[i]+.014);
      var bx=cx+i*(cw/metals.length)+6, bh=simState.prog[i]*ch;
      var rr=parseInt(m.col.slice(1,3)||'88',16), gg=parseInt(m.col.slice(3,5)||'88',16), bb=parseInt(m.col.slice(5,7)||'88',16);
      var bg=c.createLinearGradient(bx,cy+ch-bh,bx,cy+ch);
      bg.addColorStop(0,'rgba('+rr+','+gg+','+bb+',.9)'); bg.addColorStop(1,'rgba('+(rr*.6|0)+','+(gg*.6|0)+','+(bb*.6|0)+',.9)');
      c.fillStyle='rgba('+rr+','+gg+','+bb+',.12)'; c.beginPath(); c.roundRect(bx+2,cy+ch-bh+2,bw,bh,4); c.fill();
      c.fillStyle=bg; c.beginPath(); c.roundRect(bx,cy+ch-bh,bw,bh,i===0?[6,6,0,0]:4); c.fill();
      if(simState.prog[i]>.05){ c.font='bold 12px Arial'; c.fillStyle=m.col; c.textAlign='center'; c.textBaseline='bottom'; c.fillText(simState.prog[i].toFixed(2),bx+bw/2,cy+ch-bh-3); }
      c.font='17px serif'; c.textAlign='center'; c.textBaseline='top'; c.fillText(m.icon,bx+bw/2,cy+ch+4);
      c.font='10px Tajawal'; c.fillStyle=isDarkMode()?'#ccc':'#555'; c.fillText(m.label,bx+bw/2,cy+ch+22);
    });
    if(simState.prog[0]>.6){ c.font='16px serif'; c.textAlign='center'; c.fillText('👑',cx+0*(cw/metals.length)+6+bw/2,cy+ch-simState.prog[0]*ch-24); }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─────────────────────────────────────────────────────
// 5-5 TAB 1: ابنِ دائرتك بنفسك! — سحب وإفلات المكونات
// ─────────────────────────────────────────────────────
function simCircuitBuilder1() {
  cancelAnimationFrame(animFrame);


  // ══ PhET-style: سحب حر + أسلاك بالنقر على ports ══
  var CB = {
    comps:[], wires:[], nextId:0,
    dragging:null, dragOffX:0, dragOffY:0,
    wireStart:null, mouseX:0, mouseY:0, t:0
  };
  simState = CB;

  var PALETTE = [
    {type:'bat',  label:'بطارية',        emoji:'🔋', voltage:9,   isSource:true},
    {type:'cell', label:'خلية كهربائية', emoji:'⚡', voltage:1.5, isSource:true},
    {type:'bulb', label:'مصباح',         emoji:'💡', r:10, isLoad:true},
    {type:'res',  label:'مقاومة',        emoji:'〰️', r:20, isLoad:true},
    {type:'swO',  label:'مفتاح مفتوح',  emoji:'🔓', isSwitch:true, open:true},
    {type:'swC',  label:'مفتاح مغلق',   emoji:'🔒', isSwitch:true, open:false},
  ];

  var SNAP = 28;
  function compHW(type){
    if(type==='bat')  return {w:102,h:28};
    if(type==='cell') return {w:76, h:24};
    if(type==='bulb') return {w:60, h:50};
    if(type==='res')  return {w:76, h:20};
    return {w:86, h:22};
  }
  function getPorts(comp){
    var t=comp.type;
    if(t==='bat')  return [{x:comp.x-51,y:comp.y,idx:0},{x:comp.x+51,y:comp.y,idx:1}];
    if(t==='cell') return [{x:comp.x-38,y:comp.y,idx:0},{x:comp.x+38,y:comp.y,idx:1}];
    if(t==='bulb') return [{x:comp.x-30,y:comp.y-4,idx:0},{x:comp.x+30,y:comp.y-4,idx:1}];
    if(t==='res')  return [{x:comp.x-38,y:comp.y,idx:0},{x:comp.x+38,y:comp.y,idx:1}];
    return [{x:comp.x-43,y:comp.y,idx:0},{x:comp.x+43,y:comp.y,idx:1}];
  }

  function calcCircuit(){
    var comps=CB.comps;
    if(comps.length<2||CB.wires.length<1) return {ok:false,I:0,V:0,R:0};

    // بناء الجراف: كل node = (compId, portIdx)
    // مفتاح: "compId:portIdx"
    // الأسلاك تربط nodeA ↔ nodeB
    // داخل كل مكوّن: port0 ↔ port1 (إلا المفتاح المفتوح)

    var graph = {}; // node → [node, ...]
    function nodeKey(cid,pidx){ return cid+':'+pidx; }
    function ensure(k){ if(!graph[k]) graph[k]=[]; }

    // إضافة أسلاك خارجية
    CB.wires.forEach(function(w){
      var na=nodeKey(w.a,w.ap), nb=nodeKey(w.b,w.bp);
      ensure(na); ensure(nb);
      graph[na].push(nb); graph[nb].push(na);
    });

    // إضافة اتصال داخلي لكل مكوّن (port0 ↔ port1)
    comps.forEach(function(c){
      var def=PALETTE.find(function(p){return p.type===c.type;});
      if(!def) return;
      if(def.isSwitch && c.open) return; // مفتاح مفتوح = لا اتصال داخلي
      var n0=nodeKey(c.id,0), n1=nodeKey(c.id,1);
      ensure(n0); ensure(n1);
      graph[n0].push(n1); graph[n1].push(n0);
    });

    // ابحث عن مصدر (بطارية/خلية)
    var sources=comps.filter(function(c){
      return PALETTE.find(function(p){return p.type===c.type&&p.isSource;});
    });
    if(!sources.length) return {ok:false,I:0,V:0,R:0};

    // تحقق من الدائرة المغلقة: هل يمكن الوصول من قطب+ البطارية إلى قطب− عبر المسار؟
    // port 1 = القطب الموجب (+)، port 0 = القطب السالب (−)
    var src=sources[0];
    var startNode=nodeKey(src.id,1); // قطب + البطارية
    var endNode=nodeKey(src.id,0);   // قطب − البطارية

    // BFS من قطب+ إلى قطب− (بدون المرور عبر الاتصال الداخلي للبطارية نفسها)
    var visited={}, queue=[startNode];
    visited[startNode]=true;
    var found=false;
    while(queue.length){
      var cur=queue.shift();
      if(cur===endNode){found=true;break;}
      (graph[cur]||[]).forEach(function(nb){
        // تخطى الاتصال الداخلي للمصدر نفسه
        var skip=(cur===startNode&&nb===endNode)||(cur===endNode&&nb===startNode);
        // كلا الـ nodes من نفس المصدر؟
        var curId=parseInt(cur.split(':')[0]), nbId=parseInt(nb.split(':')[0]);
        var srcSelfSkip=(curId===src.id&&nbId===src.id);
        if(!skip&&!srcSelfSkip&&!visited[nb]){visited[nb]=true;queue.push(nb);}
      });
    }

    if(!found) return {ok:false,I:0,V:0,R:0};

    // حساب القيم
    var V=0,R=0,hasLoad=false,hasOpen=false;
    comps.forEach(function(c){
      var def=PALETTE.find(function(p){return p.type===c.type;});
      if(!def) return;
      if(def.isSource) V+=def.voltage;
      if(def.isLoad){R+=def.r||10;hasLoad=true;}
      if(def.isSwitch&&c.open) hasOpen=true;
    });
    if(!V||!hasLoad||hasOpen||R===0) return {ok:false,I:0,V:V,R:R};
    return {ok:true,I:V/R,V:V,R:R};
  }

  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔧 المكونات — اسحب للوحة</div>
      <div id="phet-palette" style="display:flex;flex-direction:column;gap:6px"></div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">📊 قراءات الدائرة</div>
      <div id="phet-reads" style="font-size:13px;color:var(--text-secondary);line-height:2">—</div>
    </div>
    <button onclick="window._phetClear()" style="width:100%;padding:8px;border-radius:9px;border:1.5px solid rgba(192,57,43,.25);background:rgba(192,57,43,.06);color:#C0392B;font-family:Tajawal;font-size:13px;cursor:pointer;margin-top:2px">🗑 مسح الكل</button>
    <div class="info-box" style="font-size:12px;margin-top:8px">
      🖱 <strong>اسحب</strong> مكوناً إلى اللوحة<br>
      ● <strong>اضغط</strong> نقطة وصل لبدء سلك<br>
      ✂️ <strong>دبل-كليك</strong> على مكوّن لحذفه<br>
      🔄 <strong>كليك</strong> على مفتاح لتبديله
    </div>
  `);

  var pal=document.getElementById('phet-palette');
  if(pal){
    PALETTE.forEach(function(def){
      var btn=document.createElement('div');
      btn.style.cssText='display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;border:2px solid rgba(26,143,168,.25);background:rgba(26,143,168,.06);cursor:grab;user-select:none;transition:all .15s;font-family:Tajawal';
      btn.innerHTML='<span style="font-size:17px">'+def.emoji+'</span><span style="font-size:13px;font-weight:700;color:var(--text-primary)">'+def.label+'</span><span style="margin-right:auto;font-size:11px;color:var(--text-secondary)">'+(def.voltage?def.voltage+'V':def.r?def.r+'Ω':'')+'</span>';
      (function(dtype){
        btn.addEventListener('mousedown',function(e){startPalDrag(e,dtype);});
        btn.addEventListener('touchstart',function(e){startPalDrag(e,dtype);},{passive:false});
      })(def.type);
      pal.appendChild(btn);
    });
  }

  window._phetClear=function(){
    if(!simState||simState!==CB) return;
    CB.comps=[];CB.wires=[];CB.wireStart=null;updateReads();
    try{U9Sound.thud();}catch(ex){}
  };

  function updateReads(){
    var el=document.getElementById('phet-reads'); if(!el) return;
    var st=calcCircuit();
    if(!st.ok){
      var msg;
      if(CB.comps.length===0) msg='أضف مكونات من القائمة';
      else if(CB.wires.length<1) msg='وصّل المكونات بأسلاك';
      else {
        var hasOpen=CB.comps.some(function(c){return c.open;});
        msg=hasOpen?'المفتاح مفتوح — الدائرة مقطوعة':'الدائرة غير مغلقة — وصّل (+) و (−)';
      }
      el.innerHTML='<span style="color:var(--text-secondary)">'+msg+'</span>'; return;
    }
    el.innerHTML=
      '<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--border-color)"><span>⚡ التيار</span><strong style="color:#1A8FA8">'+st.I.toFixed(2)+' A</strong></div>'+
      '<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--border-color)"><span>🔋 الجهد</span><strong style="color:#D4901A">'+st.V.toFixed(1)+' V</strong></div>'+
      '<div style="display:flex;justify-content:space-between;padding:3px 0"><span>〰️ المقاومة</span><strong style="color:#6B4E9A">'+st.R+' Ω</strong></div>';
  }

  var ghost=null;
  function startPalDrag(e,type){
    e.preventDefault();
    var cv2=document.getElementById('simCanvas'); if(!cv2) return;
    var s=e.touches&&e.touches[0]||e;
    var r=cv2.getBoundingClientRect(),sc=cv2.width/r.width;
    ghost={type:type,x:(s.clientX-r.left)*sc,y:(s.clientY-r.top)*sc};
  }

  var cv=document.getElementById('simCanvas');

  function findNearPort(px,py,excludeId){
    var best=null,bestD=SNAP*2.5;
    CB.comps.forEach(function(comp){
      if(comp.id===excludeId) return;
      getPorts(comp).forEach(function(pt){
        var d=Math.hypot(px-pt.x,py-pt.y);
        if(d<bestD){bestD=d;best={compId:comp.id,portIdx:pt.idx,x:pt.x,y:pt.y};}
      });
    });
    return best;
  }

  function getP(e){
    var r=cv.getBoundingClientRect(),sc=cv.width/r.width;
    var s=e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e;
    return {x:(s.clientX-r.left)*sc,y:(s.clientY-r.top)*sc};
  }
  function getP2(e,c2){
    var r=c2.getBoundingClientRect(),sc=c2.width/r.width;
    var s=e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e;
    return {x:(s.clientX-r.left)*sc,y:(s.clientY-r.top)*sc};
  }

  cv.addEventListener('mousedown',function(e){
    if(ghost||!simState||simState!==CB) return;
    var p=getP(e);
    // أولاً: تحقق من جسم المكوّن → سحب
    for(var i=CB.comps.length-1;i>=0;i--){
      var c=CB.comps[i],s=compHW(c.type);
      if(Math.abs(p.x-c.x)<s.w/2+10&&Math.abs(p.y-c.y)<s.h/2+10){
        // تحقق إذا كان الضغط مباشرة على نقطة وصل (نصف قطر ≤ 10px) → سلك
        var ports=getPorts(c);
        var onPort=ports.some(function(pt){return Math.hypot(p.x-pt.x,p.y-pt.y)<10;});
        if(onPort){
          var port=findNearPort(p.x,p.y,-1);
          if(port){CB.wireStart=port;return;}
        }
        CB.dragging=i;CB.dragOffX=p.x-c.x;CB.dragOffY=p.y-c.y;return;
      }
    }
    // إذا لم يكن على أي مكوّن، تحقق من نقاط الوصل للسلك
    var port=findNearPort(p.x,p.y,-1);
    if(port&&Math.hypot(p.x-port.x,p.y-port.y)<SNAP*2){CB.wireStart=port;return;}
  });

  document.addEventListener('mousemove',function(e){
    var cv2=document.getElementById('simCanvas'); if(!cv2||!simState||simState!==CB) return;
    var p=getP2(e,cv2); CB.mouseX=p.x; CB.mouseY=p.y;
    if(ghost){ghost.x=p.x;ghost.y=p.y;}
    else if(CB.dragging!==null&&CB.comps[CB.dragging]){CB.comps[CB.dragging].x=p.x-CB.dragOffX;CB.comps[CB.dragging].y=p.y-CB.dragOffY;}
  });

  document.addEventListener('mouseup',function(e){
    var cv2=document.getElementById('simCanvas'); if(!cv2||!simState||simState!==CB) return;
    var p=getP2(e,cv2);
    if(ghost){
      CB.comps.push({id:CB.nextId++,type:ghost.type,x:Math.max(50,Math.min(elW()-50,ghost.x)),y:Math.max(40,Math.min(elH()-60,ghost.y)),open:ghost.type==='swO'});
      ghost=null;updateReads();try{U9Sound.ping(500,.08,.12);}catch(ex){}return;
    }
    if(CB.wireStart){
      var port2=findNearPort(p.x,p.y,CB.wireStart.compId);
      if(port2&&port2.compId!==CB.wireStart.compId){
        var dup=CB.wires.some(function(w){return(w.a===CB.wireStart.compId&&w.b===port2.compId)||(w.b===CB.wireStart.compId&&w.a===port2.compId);});
        if(!dup){CB.wires.push({a:CB.wireStart.compId,ap:CB.wireStart.portIdx,x1:CB.wireStart.x,y1:CB.wireStart.y,b:port2.compId,bp:port2.portIdx,x2:port2.x,y2:port2.y});updateReads();try{U9Sound.ping(560,.1,.14);}catch(ex){}}
      }
      CB.wireStart=null;
    }
    if(CB.dragging!==null){CB.dragging=null;updateReads();}
  });

  cv.addEventListener('touchstart',function(e){
    if(ghost||!simState||simState!==CB) return; e.preventDefault();
    var p=getP(e);
    // أولاً تحقق إذا الضغط على جسم مكوّن → سحب
    for(var i=CB.comps.length-1;i>=0;i--){
      var c=CB.comps[i],s=compHW(c.type);
      if(Math.abs(p.x-c.x)<s.w/2+14&&Math.abs(p.y-c.y)<s.h/2+14){
        CB.dragging=i;CB.dragOffX=p.x-c.x;CB.dragOffY=p.y-c.y;return;
      }
    }
    // ثم تحقق من نقاط الوصل → رسم سلك
    var port=findNearPort(p.x,p.y,-1);
    if(port&&Math.hypot(p.x-port.x,p.y-port.y)<SNAP*2.5){CB.wireStart=port;return;}
  },{passive:false});

  cv.addEventListener('touchmove',function(e){
    e.preventDefault(); if(!simState||simState!==CB) return;
    var p=getP(e); CB.mouseX=p.x; CB.mouseY=p.y;
    if(ghost){ghost.x=p.x;ghost.y=p.y;}
    else if(CB.dragging!==null&&CB.comps[CB.dragging]){CB.comps[CB.dragging].x=p.x-CB.dragOffX;CB.comps[CB.dragging].y=p.y-CB.dragOffY;}
  },{passive:false});

  cv.addEventListener('touchend',function(e){
    if(!simState||simState!==CB) return;
    var p=getP(e);
    if(ghost){
      CB.comps.push({id:CB.nextId++,type:ghost.type,x:Math.max(50,Math.min(elW()-50,ghost.x)),y:Math.max(40,Math.min(elH()-60,ghost.y)),open:ghost.type==='swO'});
      ghost=null;updateReads();try{U9Sound.ping(500,.08,.12);}catch(ex){}return;
    }
    if(CB.wireStart){
      var port2=findNearPort(p.x,p.y,CB.wireStart.compId);
      if(port2&&port2.compId!==CB.wireStart.compId){
        var dup=CB.wires.some(function(w){return(w.a===CB.wireStart.compId&&w.b===port2.compId)||(w.b===CB.wireStart.compId&&w.a===port2.compId);});
        if(!dup){CB.wires.push({a:CB.wireStart.compId,ap:CB.wireStart.portIdx,x1:CB.wireStart.x,y1:CB.wireStart.y,b:port2.compId,bp:port2.portIdx,x2:port2.x,y2:port2.y});updateReads();try{U9Sound.ping(560,.1,.14);}catch(ex){}}
      }
      CB.wireStart=null;
    }
    if(CB.dragging!==null){CB.dragging=null;updateReads();}
  });

  cv.addEventListener('dblclick',function(e){
    if(!simState||simState!==CB) return;
    var p=getP(e);
    for(var i=CB.comps.length-1;i>=0;i--){
      var c=CB.comps[i],s=compHW(c.type);
      if(Math.abs(p.x-c.x)<s.w/2+8&&Math.abs(p.y-c.y)<s.h/2+8){
        var rid=CB.comps[i].id; CB.comps.splice(i,1);
        CB.wires=CB.wires.filter(function(w){return w.a!==rid&&w.b!==rid;});
        updateReads();return;
      }
    }
  });

  cv.addEventListener('click',function(e){
    if(!simState||simState!==CB||CB.wireStart) return;
    var p=getP(e);
    CB.comps.forEach(function(c){
      var def=PALETTE.find(function(pd){return pd.type===c.type;});
      if(!def||!def.isSwitch) return;
      var s=compHW(c.type);
      if(Math.abs(p.x-c.x)<s.w/2+8&&Math.abs(p.y-c.y)<s.h/2+8){
        c.open=!c.open; c.type=c.open?'swO':'swC'; updateReads();
        try{U9Sound.ping(c.open?300:640,.15,.15);}catch(ex){}
      }
    });
  });

  function drawComp(ctx,comp,lit,I){
    var type=comp.type,cx=comp.x,cy=comp.y;
    var dm=isDarkMode();
    ctx.save(); ctx.lineCap='round'; ctx.lineJoin='round';

    if(type==='bat'){
      // ── بطارية واقعية: جسم أسطواني مع قطبين ──
      var bw=52,bh=28;
      // جسم البطارية
      var g=ctx.createLinearGradient(cx-bw/2,cy-bh/2,cx-bw/2,cy+bh/2);
      g.addColorStop(0,dm?'#3A4A5A':'#6C8CA0');
      g.addColorStop(0.45,dm?'#5A7A9A':'#A8C8D8');
      g.addColorStop(1,dm?'#2A3A4A':'#4A6878');
      ctx.fillStyle=g; ctx.strokeStyle=dm?'#4A6A8A':'#3A5A70'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.roundRect(cx-bw/2,cy-bh/2,bw,bh,5); ctx.fill(); ctx.stroke();
      // شريط أصفر في المنتصف
      ctx.fillStyle='#D4901A';
      ctx.beginPath(); ctx.roundRect(cx-6,cy-bh/2,12,bh,0); ctx.fill();
      // علامة الجهد
      ctx.font='bold 9px Arial'; ctx.textAlign='center'; ctx.fillStyle='white'; ctx.textBaseline='middle';
      ctx.fillText('9V',cx,cy);
      // القطب الموجب (+) يمين
      ctx.fillStyle='#E74C3C';
      ctx.beginPath(); ctx.roundRect(cx+bw/2,cy-7,10,14,3); ctx.fill();
      ctx.fillStyle='white'; ctx.font='bold 11px Arial'; ctx.fillText('+',cx+bw/2+5,cy+1);
      // القطب السالب (-) يسار
      ctx.fillStyle='#555';
      ctx.beginPath(); ctx.roundRect(cx-bw/2-10,cy-7,10,14,3); ctx.fill();
      ctx.fillStyle='white'; ctx.font='bold 13px Arial'; ctx.fillText('−',cx-bw/2-5,cy+1);
      // سلكا التوصيل
      ctx.strokeStyle=dm?'#8AAAC0':'#445566'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(cx-bw/2-10,cy); ctx.lineTo(cx-bw/2-24,cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx+bw/2+10,cy); ctx.lineTo(cx+bw/2+24,cy); ctx.stroke();
      // اسم
      ctx.font='bold 11px Tajawal'; ctx.fillStyle=dm?'#8AAAC0':'#445566';
      ctx.textAlign='center'; ctx.textBaseline='top'; ctx.fillText('بطارية',cx,cy+bh/2+6);

    } else if(type==='cell'){
      // ── خلية كهربائية: أنحف من البطارية ──
      var cw=38,ch=24;
      var g2=ctx.createLinearGradient(cx-cw/2,cy-ch/2,cx-cw/2,cy+ch/2);
      g2.addColorStop(0,dm?'#3A5040':'#6CA080');
      g2.addColorStop(0.5,dm?'#4A7050':'#90C8A0');
      g2.addColorStop(1,dm?'#2A3A30':'#4A7860');
      ctx.fillStyle=g2; ctx.strokeStyle=dm?'#3A6050':'#2A5840'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.roundRect(cx-cw/2,cy-ch/2,cw,ch,4); ctx.fill(); ctx.stroke();
      ctx.font='bold 9px Arial'; ctx.textAlign='center'; ctx.fillStyle='white'; ctx.textBaseline='middle';
      ctx.fillText('1.5V',cx,cy);
      ctx.fillStyle='#E74C3C';
      ctx.beginPath(); ctx.roundRect(cx+cw/2,cy-6,8,12,2); ctx.fill();
      ctx.fillStyle='white'; ctx.font='bold 10px Arial'; ctx.fillText('+',cx+cw/2+4,cy+1);
      ctx.fillStyle='#555';
      ctx.beginPath(); ctx.roundRect(cx-cw/2-8,cy-6,8,12,2); ctx.fill();
      ctx.fillStyle='white'; ctx.font='bold 12px Arial'; ctx.fillText('−',cx-cw/2-4,cy+1);
      ctx.strokeStyle=dm?'#8AAAC0':'#445566'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(cx-cw/2-8,cy); ctx.lineTo(cx-cw/2-22,cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx+cw/2+8,cy); ctx.lineTo(cx+cw/2+22,cy); ctx.stroke();
      ctx.font='bold 11px Tajawal'; ctx.fillStyle=dm?'#8AAAC0':'#445566';
      ctx.textAlign='center'; ctx.textBaseline='top'; ctx.fillText('خلية',cx,cy+ch/2+5);

    } else if(type==='bulb'){
      // ── مصباح واقعي: كروي + قاعدة ──
      var lbr=lit?Math.min(1,I/0.5):0;
      var R=20; // نصف قطر الزجاج
      // توهج خارجي
      if(lbr>.05){
        ctx.shadowBlur=30*lbr; ctx.shadowColor='rgba(255,230,50,'+(lbr*.95)+')';
        var glow=ctx.createRadialGradient(cx,cy,0,cx,cy,R*2.5);
        glow.addColorStop(0,'rgba(255,255,100,'+(lbr*.4)+')');
        glow.addColorStop(1,'rgba(255,200,0,0)');
        ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(cx,cy,R*2.5,0,Math.PI*2); ctx.fill();
      }
      // الزجاج
      var bulbG=ctx.createRadialGradient(cx-R*.3,cy-R*.3,1,cx,cy,R);
      if(lbr>.05){
        bulbG.addColorStop(0,'rgba(255,255,180,0.95)');
        bulbG.addColorStop(0.5,'rgba(255,'+(200+lbr*55|0)+',20,0.9)');
        bulbG.addColorStop(1,'rgba(220,140,0,0.7)');
      } else {
        bulbG.addColorStop(0,dm?'rgba(80,100,120,0.7)':'rgba(220,230,240,0.9)');
        bulbG.addColorStop(1,dm?'rgba(40,60,80,0.6)':'rgba(180,195,210,0.7)');
      }
      ctx.shadowBlur=0;
      ctx.fillStyle=bulbG;
      ctx.beginPath(); ctx.arc(cx,cy-4,R,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle=lbr>.05?'rgba(200,130,0,0.7)':(dm?'rgba(100,130,150,0.6)':'rgba(140,160,180,0.7)');
      ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(cx,cy-4,R,0,Math.PI*2); ctx.stroke();
      // خيط التوهج
      if(lbr>.05){
        ctx.strokeStyle='rgba(255,250,100,'+(0.5+lbr*.5)+')'; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(cx-5,cy+4); ctx.lineTo(cx-1,cy-4); ctx.lineTo(cx+3,cy+2); ctx.lineTo(cx+6,cy-6); ctx.stroke();
      }
      // لمعة
      ctx.fillStyle='rgba(255,255,255,'+(lbr>.05?0.3:0.25)+')';
      ctx.beginPath(); ctx.ellipse(cx-R*.35,cy-R*.55,R*.22,R*.14,-0.5,0,Math.PI*2); ctx.fill();
      // قاعدة المصباح
      var baseG=ctx.createLinearGradient(cx-10,cy+R-4,cx+10,cy+R-4);
      baseG.addColorStop(0,dm?'#4A5A6A':'#8A9AAA');
      baseG.addColorStop(0.5,dm?'#6A7A8A':'#BACcDD');
      baseG.addColorStop(1,dm?'#3A4A5A':'#6A7A8A');
      ctx.fillStyle=baseG; ctx.strokeStyle=dm?'#3A4A5A':'#5A6A7A'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.roundRect(cx-9,cy+R-5,18,14,2); ctx.fill(); ctx.stroke();
      // خطوط القاعدة
      ctx.strokeStyle=dm?'rgba(255,255,255,.1)':'rgba(0,0,0,.1)'; ctx.lineWidth=1;
      [cy+R,cy+R+4].forEach(function(y){ctx.beginPath();ctx.moveTo(cx-9,y);ctx.lineTo(cx+9,y);ctx.stroke();});
      // أسلاك
      ctx.strokeStyle=dm?'#8AAAC0':'#445566'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(cx-30,cy-4); ctx.lineTo(cx-R-1,cy-4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx+R+1,cy-4); ctx.lineTo(cx+30,cy-4); ctx.stroke();
      ctx.font='bold 11px Tajawal'; ctx.fillStyle=dm?'#8AAAC0':'#445566';
      ctx.textAlign='center'; ctx.textBaseline='top'; ctx.fillText('مصباح',cx,cy+R+12);

    } else if(type==='res'){
      // ── مقاومة واقعية: أسطوانة بحلقات ألوان ──
      var rw=44,rh=20;
      var rg=ctx.createLinearGradient(cx-rw/2,cy-rh/2,cx-rw/2,cy+rh/2);
      rg.addColorStop(0,dm?'#5A4A3A':'#D4C4A0');
      rg.addColorStop(0.4,dm?'#7A6A5A':'#F0E0C0');
      rg.addColorStop(1,dm?'#4A3A2A':'#B0A080');
      ctx.fillStyle=rg; ctx.strokeStyle=dm?'#6A5A4A':'#8A7A60'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.roundRect(cx-rw/2,cy-rh/2,rw,rh,rh/2); ctx.fill(); ctx.stroke();
      // حلقات الألوان
      var bands=[{c:'#C0392B',x:-14},{c:'#E67E22',x:-6},{c:'#F1C40F',x:2},{c:'#8E44AD',x:12}];
      bands.forEach(function(b){
        ctx.fillStyle=b.c; ctx.fillRect(cx+b.x-2,cy-rh/2,4,rh);
      });
      // ظل على الأسطوانة
      ctx.strokeStyle='rgba(0,0,0,0.12)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.roundRect(cx-rw/2,cy-rh/2,rw,rh,rh/2); ctx.stroke();
      // أسلاك
      ctx.strokeStyle=dm?'#8AAAC0':'#445566'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(cx-rw/2-2,cy); ctx.lineTo(cx-rw/2-16,cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx+rw/2+2,cy); ctx.lineTo(cx+rw/2+16,cy); ctx.stroke();
      var rdef=PALETTE.find(function(p){return p.type==='res';});
      ctx.font='bold 10px Tajawal'; ctx.textAlign='center'; ctx.fillStyle=dm?'#8AAAC0':'#445566';
      ctx.textBaseline='top'; ctx.fillText((rdef&&rdef.r||10)+'Ω مقاومة',cx,cy+rh/2+5);

    } else if(type==='swO'||type==='swC'){
      // ── مفتاح واقعي: جسم بلاستيكي مع ذراع ──
      var closed=(type==='swC');
      var sw=54,sh=22;
      // قاعدة المفتاح
      var sg=ctx.createLinearGradient(cx-sw/2,cy-sh/2,cx-sw/2,cy+sh/2);
      sg.addColorStop(0,dm?'#3A4A3A':'#C8D8C0');
      sg.addColorStop(0.5,dm?'#4A6A4A':'#E8F8E0');
      sg.addColorStop(1,dm?'#2A3A2A':'#90A888');
      ctx.fillStyle=sg; ctx.strokeStyle=closed?'#27AE60':'#95A5A6'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.roundRect(cx-sw/2,cy-sh/2,sw,sh,6); ctx.fill(); ctx.stroke();
      // نقاط التوصيل (مسامير)
      [-sw/2+6, sw/2-6].forEach(function(ox){
        var sg2=ctx.createRadialGradient(cx+ox,cy,0,cx+ox,cy,6);
        sg2.addColorStop(0,dm?'#9DC8D0':'#C8E8F0');
        sg2.addColorStop(1,dm?'#3A6A7A':'#5A9AAA');
        ctx.fillStyle=sg2; ctx.strokeStyle=dm?'#5A8A9A':'#3A7A8A'; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.arc(cx+ox,cy,6,0,Math.PI*2); ctx.fill(); ctx.stroke();
        // ثقب المسمار
        ctx.fillStyle=dm?'rgba(0,0,0,.5)':'rgba(0,0,0,.3)';
        ctx.beginPath(); ctx.arc(cx+ox,cy,2.5,0,Math.PI*2); ctx.fill();
      });
      // ذراع المفتاح
      if(closed){
        var barG=ctx.createLinearGradient(cx-sw/2+12,cy-3,cx+sw/2-12,cy+3);
        barG.addColorStop(0,'#E74C3C'); barG.addColorStop(0.5,'#F1948A'); barG.addColorStop(1,'#C0392B');
        ctx.fillStyle=barG; ctx.strokeStyle='#922B21'; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.roundRect(cx-sw/2+11,cy-3.5,sw-22,7,3.5); ctx.fill(); ctx.stroke();
      } else {
        ctx.strokeStyle='#E74C3C'; ctx.lineWidth=3; ctx.lineCap='round';
        ctx.beginPath(); ctx.moveTo(cx-sw/2+12,cy); ctx.lineTo(cx+sw/2-22,cy-16); ctx.stroke();
        ctx.fillStyle='#E74C3C';
        ctx.beginPath(); ctx.arc(cx-sw/2+12,cy,4,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx+sw/2-12,cy,4,0,Math.PI*2); ctx.fill();
      }
      // مؤشر ON/OFF
      ctx.font='bold 9px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillStyle=closed?'#1E8449':'#922B21';
      ctx.fillText(closed?'ON':'OFF',cx,cy);
      // أسلاك
      ctx.strokeStyle=dm?'#8AAAC0':'#445566'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(cx-sw/2-2,cy); ctx.lineTo(cx-sw/2-16,cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx+sw/2+2,cy); ctx.lineTo(cx+sw/2+16,cy); ctx.stroke();
      ctx.font='bold 11px Tajawal'; ctx.fillStyle=closed?'#1E8449':'#922B21';
      ctx.textAlign='center'; ctx.textBaseline='top';
      ctx.fillText(closed?'مفتاح مغلق 🔒':'مفتاح مفتوح 🔓',cx,cy+sh/2+5);
    }
    ctx.restore();
  }

  var electrons=[];
  for(var ei=0;ei<14;ei++) electrons.push({t:Math.random(),s:0.35+Math.random()*0.4});

  function draw(){
    if(currentSim!=='g6circuit'){cancelAnimationFrame(animFrame);return;}
    if(!simState||simState!==CB){animFrame=requestAnimationFrame(draw);return;}
    var ctx=elCtx(),w=elW(),h=elH();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=isDarkMode()?'#0E1620':'#F0F4FA';ctx.fillRect(0,0,w,h);
    ctx.fillStyle=isDarkMode()?'rgba(255,255,255,.06)':'rgba(0,0,0,.06)';
    for(var gx=24;gx<w;gx+=28) for(var gy=24;gy<h;gy+=28){ctx.beginPath();ctx.arc(gx,gy,1.5,0,Math.PI*2);ctx.fill();}
    CB.t+=0.02; var st=calcCircuit();

    // أسلاك
    CB.wires.forEach(function(w){
      var ca=CB.comps.find(function(c){return c.id===w.a;}); var cb=CB.comps.find(function(c){return c.id===w.b;});
      if(!ca||!cb) return;
      w.x1=getPorts(ca)[w.ap].x; w.y1=getPorts(ca)[w.ap].y;
      w.x2=getPorts(cb)[w.bp].x; w.y2=getPorts(cb)[w.bp].y;
      var wc=st.ok?'#27AE60':(isDarkMode()?'#4A6080':'#90A0B0');
      if(st.ok){ctx.strokeStyle='rgba(39,174,96,.13)';ctx.lineWidth=12;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(w.x1,w.y1);ctx.lineTo(w.x2,w.y2);ctx.stroke();}
      ctx.strokeStyle=wc;ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(w.x1,w.y1);ctx.lineTo(w.x2,w.y2);ctx.stroke();
      ctx.fillStyle=st.ok?'#27AE60':'#78909C';
      ctx.beginPath();ctx.arc(w.x1,w.y1,4,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(w.x2,w.y2,4,0,Math.PI*2);ctx.fill();
    });

    // سلك مؤقت
    if(CB.wireStart){
      ctx.strokeStyle='rgba(26,143,168,.7)';ctx.lineWidth=2.5;ctx.setLineDash([6,4]);
      ctx.beginPath();ctx.moveTo(CB.wireStart.x,CB.wireStart.y);ctx.lineTo(CB.mouseX,CB.mouseY);ctx.stroke();
      ctx.setLineDash([]);
    }

    // مكونات
    CB.comps.forEach(function(comp){drawComp(ctx,comp,st.ok,st.I||0);});

    // ports
    CB.comps.forEach(function(comp){
      getPorts(comp).forEach(function(pt){
        var near=CB.wireStart&&Math.hypot(CB.mouseX-pt.x,CB.mouseY-pt.y)<SNAP*2;
        var isStart=CB.wireStart&&CB.wireStart.compId===comp.id&&CB.wireStart.portIdx===pt.idx;
        ctx.fillStyle=isStart?'#1A8FA8':near?'rgba(39,174,96,.9)':'rgba(26,143,168,.45)';
        ctx.beginPath();ctx.arc(pt.x,pt.y,isStart?7:5,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle=isDarkMode()?'rgba(255,255,255,.2)':'rgba(255,255,255,.85)';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.arc(pt.x,pt.y,isStart?7:5,0,Math.PI*2);ctx.stroke();
      });
    });

    // ghost
    if(ghost){ctx.globalAlpha=0.5;drawComp(ctx,{id:-1,type:ghost.type,x:ghost.x,y:ghost.y},false,0);ctx.globalAlpha=1;}

    // إلكترونات
    if(st.ok&&CB.wires.length>0){
      var nw=CB.wires.length;
      electrons.forEach(function(el){
        el.t=(el.t+0.007*el.s)%1;
        var wi=Math.floor(el.t*nw),fr=(el.t*nw)-wi,ww=CB.wires[wi]; if(!ww) return;
        var ex=ww.x1+(ww.x2-ww.x1)*fr,ey=ww.y1+(ww.y2-ww.y1)*fr;
        ctx.fillStyle='rgba(0,200,255,'+(0.75-fr*.3)+')';ctx.beginPath();ctx.arc(ex,ey,4.5,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(255,255,255,.6)';ctx.beginPath();ctx.arc(ex-1,ey-1,1.5,0,Math.PI*2);ctx.fill();
      });
    }

    // شريط الحالة
    var msg='',mc='#888';
    if(CB.comps.length===0){msg='🔧 اسحب مكوناً من القائمة اليسرى';}
    else if(CB.wires.length===0){msg='● اضغط نقطة وصل (●) لرسم سلك بين المكونات';}
    else if(st.ok){msg='✅ الدائرة مغلقة — المصباح يضيء!  '+st.I.toFixed(2)+' A  |  '+st.V+' V  |  '+st.R+' Ω';mc='#1E8449';}
    else {
      // رسائل تعليمية دقيقة
      var hasSrc=CB.comps.some(function(c){return PALETTE.find(function(p){return p.type===c.type&&p.isSource;});});
      var hasLoad=CB.comps.some(function(c){return PALETTE.find(function(p){return p.type===c.type&&p.isLoad;});});
      var hasOpen=CB.comps.some(function(c){return c.open;});
      if(!hasSrc) msg='⚠️ أضف بطارية — المصباح يحتاج مصدر طاقة';
      else if(!hasLoad) msg='⚠️ أضف مصباحاً أو مقاومة لإكمال الدائرة';
      else if(hasOpen) msg='🔓 المفتاح مفتوح — الدائرة مقطوعة، المصباح لا يضيء';
      else msg='⚡ الدائرة غير مغلقة — وصّل طرفَي البطارية (+) و (−) عبر المصباح';
    }
    var sbH=46,sbY=h-sbH-8;
    ctx.fillStyle=isDarkMode()?'rgba(14,22,34,.94)':'rgba(255,255,255,.95)';
    ctx.beginPath();ctx.roundRect(10,sbY,w-20,sbH,11);ctx.fill();
    ctx.strokeStyle=st.ok?'rgba(39,174,96,.3)':'rgba(0,0,0,.07)';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.roundRect(10,sbY,w-20,sbH,11);ctx.stroke();
    ctx.fillStyle=mc;ctx.font='bold 15px Tajawal';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(msg,w/2,sbY+sbH/2);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}


// 5-5 TAB 2: بناء الدائرة بالرموز — سحب حر + أسلاك snap تلقائية
function simCircuitBuilder2() {
  cancelAnimationFrame(animFrame);

  var SYMS = [
    {id:'cell', name:'خلية كهربائية', hasPower:true,  isSwitch:false, isLoad:false, isOpen:false},
    {id:'bat',  name:'بطارية',        hasPower:true,  isSwitch:false, isLoad:false, isOpen:false},
    {id:'bulb', name:'مصباح',         hasPower:false, isSwitch:false, isLoad:true,  isOpen:false},
    {id:'swO',  name:'مفتاح مفتوح',   hasPower:false, isSwitch:true,  isLoad:false, isOpen:true},
    {id:'swC',  name:'مفتاح مغلق',    hasPower:false, isSwitch:true,  isLoad:false, isOpen:false},
    {id:'amm',  name:'أميتر',         hasPower:false, isSwitch:false, isLoad:false, isOpen:false},
  ];

  // نصف-عرض الرمز للحصول على نقطتي الوصل (يمين ويسار)
  var HALF = { cell:28, bat:24, bulb:28, swO:22, swC:22, amm:28 };
  var SNAP_DIST = 62; // مسافة الـ snap بالبكسل — مرفوعة لسهولة التوصيل

  simState = { t:0, placed:[], conns:[], dragging:null, dragOffX:0, dragOffY:0, nextId:0 };

  // نقطتا وصل كل مكوّن
  function ports(comp){
    var h = HALF[comp.type]||28;
    return [
      {x: comp.x - h, y: comp.y, side:'L'},
      {x: comp.x + h, y: comp.y, side:'R'}
    ];
  }

  // هل الدائرة مكتملة؟ — تحقق بالرسم البياني للاتصالات
  function circuitOK(){
    if(!simState||!simState.placed) return false;
    var p = simState.placed;
    if(p.length < 2) return false;
    var hasPower = p.some(function(c){ return SYMS.find(function(s){return s.id===c.type;}).hasPower; });
    var hasLoad  = p.some(function(c){ return SYMS.find(function(s){return s.id===c.type;}).isLoad; });
    var hasOpenSw= p.some(function(c){ return c.type==='swO'; });
    if(!hasPower||!hasLoad||hasOpenSw) return false;
    // تحقق أن كل المكونات متصلة في حلقة (graph traversal)
    var adj = {};
    p.forEach(function(c){ adj[c.id]=[]; });
    simState.conns.forEach(function(cn){
      if(adj[cn.a]!==undefined && adj[cn.b]!==undefined){
        adj[cn.a].push(cn.b); adj[cn.b].push(cn.a);
      }
    });
    // BFS من أول مكوّن
    var visited={}, queue=[p[0].id];
    visited[p[0].id]=true;
    while(queue.length){
      var cur=queue.shift();
      (adj[cur]||[]).forEach(function(nb){ if(!visited[nb]){visited[nb]=true;queue.push(nb);} });
    }
    return p.every(function(c){ return visited[c.id]; });
  }

  // إعادة حساب الاتصالات التلقائية
  function recalcConns(){
    if(!simState||!simState.placed) return;
    if(simState.isQuick) return; // الدائرة الجاهزة لها أسلاك ثابتة
    var conns=[];
    var p=simState.placed;
    for(var i=0;i<p.length;i++){
      var pi=ports(p[i]);
      for(var j=i+1;j<p.length;j++){
        var pj=ports(p[j]);
        // أقرب زوج من المنافذ
        var best=null, bestD=SNAP_DIST;
        for(var a=0;a<2;a++){
          for(var b=0;b<2;b++){
            var dx=pi[a].x-pj[b].x, dy=pi[a].y-pj[b].y;
            var d=Math.sqrt(dx*dx+dy*dy);
            if(d<bestD){ bestD=d; best={ai:a,bi:b,d:d}; }
          }
        }
        if(best){
          conns.push({a:p[i].id,b:p[j].id,
            x1:pi[best.ai].x,y1:pi[best.ai].y,
            x2:pj[best.bi].x,y2:pj[best.bi].y});
        }
      }
    }
    simState.conns=conns;
  }

  // رسم رمز على canvas
  function drawSym(c, type, cx, cy, sc, lit){
    sc=sc||1;
    var ink=isDarkMode()?'#D8E4F0':'#2C3A4A';
    c.strokeStyle=ink; c.fillStyle=ink;
    c.lineWidth=2.5*sc; c.lineCap='round'; c.lineJoin='round';
    c.textBaseline='middle';
    if(type==='cell'){
      c.beginPath(); c.moveTo(cx-28*sc,cy); c.lineTo(cx-6*sc,cy); c.stroke();
      c.lineWidth=4.5*sc; c.beginPath(); c.moveTo(cx-6*sc,cy-13*sc); c.lineTo(cx-6*sc,cy+13*sc); c.stroke();
      c.lineWidth=1.8*sc; c.beginPath(); c.moveTo(cx+6*sc,cy-7*sc); c.lineTo(cx+6*sc,cy+7*sc); c.stroke();
      c.lineWidth=2.5*sc; c.beginPath(); c.moveTo(cx+6*sc,cy); c.lineTo(cx+28*sc,cy); c.stroke();
      c.font='bold '+(10*sc)+'px Arial'; c.textAlign='center';
      c.fillText('+',cx+18*sc,cy-16*sc); c.fillText('−',cx-18*sc,cy-16*sc);
    } else if(type==='bat'){
      var offs=[-12,0,12];
      offs.forEach(function(off,i){
        c.lineWidth=(i===1?1.8:4)*sc;
        c.beginPath(); c.moveTo(cx+off*sc,cy-11*sc); c.lineTo(cx+off*sc,cy+11*sc); c.stroke();
      });
      c.lineWidth=2.5*sc;
      c.beginPath(); c.moveTo(cx-24*sc,cy); c.lineTo(cx-12*sc,cy); c.stroke();
      c.beginPath(); c.moveTo(cx+12*sc,cy); c.lineTo(cx+24*sc,cy); c.stroke();
    } else if(type==='bulb'){
      if(lit){ c.shadowBlur=18*sc; c.shadowColor='rgba(255,220,0,.85)'; }
      c.strokeStyle=lit?'#F39C12':ink;
      c.lineWidth=2.5*sc; c.beginPath(); c.arc(cx,cy,16*sc,0,Math.PI*2); c.stroke();
      c.beginPath(); c.moveTo(cx-9*sc,cy+9*sc); c.lineTo(cx+9*sc,cy-9*sc);
      c.moveTo(cx+9*sc,cy+9*sc); c.lineTo(cx-9*sc,cy-9*sc); c.stroke();
      c.strokeStyle=lit?'#F39C12':ink;
      c.beginPath(); c.moveTo(cx,cy+16*sc); c.lineTo(cx-10*sc,cy+26*sc); c.lineTo(cx+10*sc,cy+26*sc); c.closePath(); c.stroke();
      // أسلاك الطرفين
      c.strokeStyle=ink; c.lineWidth=2.5*sc;
      c.beginPath(); c.moveTo(cx-28*sc,cy); c.lineTo(cx-16*sc,cy); c.stroke();
      c.beginPath(); c.moveTo(cx+16*sc,cy); c.lineTo(cx+28*sc,cy); c.stroke();
      c.shadowBlur=0;
    } else if(type==='swO'){
      c.beginPath(); c.moveTo(cx-22*sc,cy); c.lineTo(cx-8*sc,cy); c.stroke();
      c.beginPath(); c.moveTo(cx-8*sc,cy); c.lineTo(cx+6*sc,cy-16*sc); c.stroke();
      c.beginPath(); c.moveTo(cx+8*sc,cy); c.lineTo(cx+22*sc,cy); c.stroke();
      c.fillStyle=ink;
      c.beginPath(); c.arc(cx-8*sc,cy,3.5*sc,0,Math.PI*2); c.fill();
      c.beginPath(); c.arc(cx+8*sc,cy,3.5*sc,0,Math.PI*2); c.fill();
    } else if(type==='swC'){
      c.beginPath(); c.moveTo(cx-22*sc,cy); c.lineTo(cx+22*sc,cy); c.stroke();
      c.fillStyle=ink;
      c.beginPath(); c.arc(cx-8*sc,cy,3.5*sc,0,Math.PI*2); c.fill();
      c.beginPath(); c.arc(cx+8*sc,cy,3.5*sc,0,Math.PI*2); c.fill();
    } else if(type==='amm'){
      c.beginPath(); c.arc(cx,cy,16*sc,0,Math.PI*2); c.stroke();
      c.font='bold '+(14*sc)+'px Arial'; c.textAlign='center'; c.fillStyle=ink; c.fillText('A',cx,cy+1);
      c.beginPath(); c.moveTo(cx-28*sc,cy); c.lineTo(cx-16*sc,cy); c.stroke();
      c.beginPath(); c.moveTo(cx+16*sc,cy); c.lineTo(cx+28*sc,cy); c.stroke();
    }
    c.strokeStyle=ink; c.fillStyle=ink; c.shadowBlur=0;
  }

  // ─── Panel ───
  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">⚡ بناء سريع</div>
      <button onclick="window._quickCircuit()" style="width:100%;padding:10px;border-radius:10px;border:2px solid rgba(39,174,96,.4);background:rgba(39,174,96,.08);color:#1E8449;font-family:Tajawal;font-size:13px;font-weight:800;cursor:pointer;margin-bottom:6px">✅ ابنِ دائرة بسيطة تلقائياً</button>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">📐 أضف رمزاً إلى اللوحة</div>
      <div style="font-size:11px;color:var(--text-secondary);margin-bottom:6px">اضغط الزر لإضافة الرمز، أو اسحبه مباشرة</div>
      <div id="sym-palette" style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center"></div>
    </div>
    <div class="ctrl-section" style="margin-top:4px">
      <button onclick="window._clearBoard()" style="width:100%;padding:8px;border-radius:8px;background:rgba(192,57,43,.08);border:1.5px solid rgba(192,57,43,.25);color:#C0392B;font-family:Tajawal;font-size:13px;cursor:pointer">🗑️ مسح اللوحة</button>
    </div>
    <div class="info-box" style="font-size:12px;margin-top:4px">
      👆 اضغط الرمز لإضافته تلقائياً<br>
      🔗 الأسلاك تتصل عند التقريب<br>
      🗑️ دبل-كليك على رمز لحذفه
    </div>
    <div id="cir-status" class="info-box" style="font-size:13px;margin-top:4px;text-align:center;min-height:36px"></div>`);

  var palette = document.getElementById('sym-palette');
  if(palette){
    SYMS.forEach(function(s){
      var btn=document.createElement('div');
      btn.style.cssText='padding:7px 10px;border-radius:10px;border:2px solid rgba(26,143,168,.3);background:rgba(26,143,168,.06);font-family:Tajawal;font-size:12px;font-weight:700;cursor:grab;user-select:none;display:flex;flex-direction:column;align-items:center;gap:3px;min-width:56px;transition:all .15s;color:var(--text-primary)';
      var cvMini=document.createElement('canvas');
      cvMini.width=72; cvMini.height=44; cvMini.style.cssText='display:block';
      btn.appendChild(cvMini);
      var lbl=document.createElement('div');
      lbl.style.cssText='font-size:10px;text-align:center;color:var(--text-secondary)';
      lbl.textContent=s.name; btn.appendChild(lbl);
      // زر "أضف"
      var addBtn=document.createElement('button');
      addBtn.textContent='+ أضف';
      addBtn.style.cssText='margin-top:3px;padding:3px 8px;border-radius:6px;border:1.5px solid rgba(26,143,168,.35);background:rgba(26,143,168,.1);color:#1A8FA8;font-family:Tajawal;font-size:10px;font-weight:700;cursor:pointer;width:100%';
      (function(sId){ addBtn.addEventListener('click',function(e){ e.stopPropagation(); window._addSymToCenter(sId); }); })(s.id);
      btn.appendChild(addBtn);
      palette.appendChild(btn);
      (function(cvM,sType){
        var ctx2=cvM.getContext('2d');
        ctx2.strokeStyle='#2C3A4A'; ctx2.fillStyle='#2C3A4A';
        drawSym(ctx2,sType,36,22,0.68,false);
      })(cvMini,s.id);
      btn.addEventListener('mousedown',function(e){ startPalDrag(e,s.id); });
      btn.addEventListener('touchstart',function(e){ startPalDrag(e,s.id); },{passive:false});
    });
  }

  // إضافة رمز إلى وسط اللوحة مع إزاحة تلقائية
  window._addSymToCenter=function(symId){
    var cv2=document.getElementById('simCanvas'); if(!cv2) return;
    if(!simState||!simState.placed) return;
    simState.isQuick=false; simState.fixedWires=null;
    var w=cv2.width, h=cv2.height;
    var count=simState.placed.length;
    // ترتيب الرموز أفقياً في وسط اللوحة
    var spacing=90, startX=w/2 - (count*spacing/2);
    var x=Math.max(60, Math.min(w-60, startX + count*spacing));
    var y=h*0.42 + (count%2)*30;
    simState.placed.push({id:simState.nextId++, type:symId, x:x, y:y});
    recalcConns();
    try{U9Sound.ping(500,.08,.12);}catch(ex){}
  };

  // بناء دائرة بسيطة تلقائياً: رموز على أضلاع مستطيل
  window._quickCircuit=function(){
    if(!simState) return;
    var cv2=document.getElementById('simCanvas'); if(!cv2) return;
    var w=cv2.width, h=cv2.height;
    var x1=w*0.18, x2=w*0.82, y1=h*0.22, y2=h*0.68;
    var mx=(x1+x2)/2, my=(y1+y2)/2;
    simState.placed=[];
    simState.conns=[];
    simState.nextId=0;
    // بطارية على الضلع الأيسر
    simState.placed.push({id:simState.nextId++, type:'cell', x:x1, y:my-30, fixedPort:{l:{x:x1,y:y1}, r:{x:x1,y:y2}}});
    // مفتاح مغلق على الضلع العلوي
    simState.placed.push({id:simState.nextId++, type:'swC',  x:mx, y:y1,   fixedPort:{l:{x:x1,y:y1}, r:{x:x2,y:y1}}});
    // مصباح على الضلع الأيمن
    simState.placed.push({id:simState.nextId++, type:'bulb', x:x2, y:my,   fixedPort:{l:{x:x2,y:y1}, r:{x:x2,y:y2}}});
    // أسلاك المستطيل الثابتة
    simState.fixedWires=[
      {x1:x1,y1:y1, x2:x2,y2:y1},  // أعلى
      {x1:x2,y1:y1, x2:x2,y2:y2},  // يمين
      {x1:x2,y1:y2, x2:x1,y2:y2},  // أسفل
      {x1:x1,y1:y2, x2:x1,y2:y1},  // يسار
    ];
    simState.isQuick=true;
    try{U9Sound.ping(560,.12,.15);}catch(ex){}
  };

  window._clearBoard=function(){
    if(!simState) return;
    simState.placed=[]; simState.conns=[];
    simState.fixedWires=null; simState.isQuick=false;
    try{U9Sound.thud();}catch(ex){}
  };

  var ghostDrag=null;

  function getPos(e,canvas){
    var r=canvas.getBoundingClientRect(),sc2=canvas.width/r.width;
    var s=e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e;
    return {x:(s.clientX-r.left)*sc2, y:(s.clientY-r.top)*sc2};
  }

  function startPalDrag(e,symId){
    e.preventDefault();
    var cv2=document.getElementById('simCanvas'); if(!cv2) return;
    var s=e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e;
    var r=cv2.getBoundingClientRect(),sc2=cv2.width/r.width;
    ghostDrag={type:symId, x:(s.clientX-r.left)*sc2, y:(s.clientY-r.top)*sc2};
  }

  var cv=document.getElementById('simCanvas');

  cv.addEventListener('mousedown',function(e){
    if(ghostDrag) return;
    if(!simState||!simState.placed) return;
    var p=getPos(e,cv);
    for(var i=simState.placed.length-1;i>=0;i--){
      var comp=simState.placed[i];
      if(Math.abs(p.x-comp.x)<40&&Math.abs(p.y-comp.y)<34){
        simState.dragging=i; simState.dragOffX=p.x-comp.x; simState.dragOffY=p.y-comp.y; return;
      }
    }
  });

  document.addEventListener('mousemove',function(e){
    var cv2=document.getElementById('simCanvas'); if(!cv2) return;
    if(!simState||!simState.placed) return;
    var p=getPos(e,cv2);
    if(ghostDrag){ ghostDrag.x=p.x; ghostDrag.y=p.y; }
    else if(simState.dragging!==null && simState.placed && simState.placed[simState.dragging]){
      simState.placed[simState.dragging].x=p.x-simState.dragOffX;
      simState.placed[simState.dragging].y=p.y-simState.dragOffY;
      recalcConns();
    }
  });

  document.addEventListener('mouseup',function(e){
    var cv2=document.getElementById('simCanvas'); if(!cv2) return;
    if(!simState||!simState.placed) return;
    var p=getPos(e,cv2);
    if(ghostDrag){
      simState.placed.push({id:simState.nextId++, type:ghostDrag.type, x:ghostDrag.x, y:ghostDrag.y});
      ghostDrag=null; recalcConns();
      try{U9Sound.ping(500,.08,.12);}catch(ex){}
    } else if(simState.dragging!==null){ simState.dragging=null; recalcConns(); }
  });

  cv.addEventListener('touchstart',function(e){
    if(ghostDrag) return;
    if(!simState||!simState.placed) return;
    e.preventDefault();
    var p=getPos(e,cv);
    for(var i=simState.placed.length-1;i>=0;i--){
      var comp=simState.placed[i];
      if(Math.abs(p.x-comp.x)<44&&Math.abs(p.y-comp.y)<36){
        simState.dragging=i; simState.dragOffX=p.x-comp.x; simState.dragOffY=p.y-comp.y; return;
      }
    }
  },{passive:false});

  cv.addEventListener('touchmove',function(e){
    e.preventDefault();
    if(!simState||!simState.placed) return;
    var p=getPos(e,cv);
    if(ghostDrag){ ghostDrag.x=p.x; ghostDrag.y=p.y; }
    else if(simState.dragging!==null && simState.placed && simState.placed[simState.dragging]){
      simState.placed[simState.dragging].x=p.x-simState.dragOffX;
      simState.placed[simState.dragging].y=p.y-simState.dragOffY;
      recalcConns();
    }
  },{passive:false});

  cv.addEventListener('touchend',function(e){
    if(!simState||!simState.placed) return;
    if(ghostDrag){
      simState.placed.push({id:simState.nextId++, type:ghostDrag.type, x:ghostDrag.x, y:ghostDrag.y});
      ghostDrag=null; recalcConns();
      try{U9Sound.ping(500,.08,.12);}catch(ex){}
    } else if(simState.dragging!==null){ simState.dragging=null; recalcConns(); }
  });

  cv.addEventListener('dblclick',function(e){
    if(!simState||!simState.placed) return;
    var p=getPos(e,cv);
    for(var i=simState.placed.length-1;i>=0;i--){
      if(Math.abs(p.x-simState.placed[i].x)<40&&Math.abs(p.y-simState.placed[i].y)<34){
        var removedId=simState.placed[i].id;
        simState.placed.splice(i,1);
        simState.conns=simState.conns.filter(function(cn){return cn.a!==removedId&&cn.b!==removedId;});
        recalcConns(); return;
      }
    }
  });

  // إلكترونات تسير على الأسلاك
  var electrons=[];
  for(var ei=0;ei<10;ei++) electrons.push({t:Math.random(),s:0.4+Math.random()*0.4});

  function draw(){
    if(currentSim!=='g6circuit'){ cancelAnimationFrame(animFrame); return; }
    if(!simState||!simState.placed||!simState.conns){ animFrame=requestAnimationFrame(draw); return; }
    var c=elCtx(), w=elW(), h=elH();
    c.clearRect(0,0,w,h);
    c.fillStyle=isDarkMode()?'#0E1620':'#EEF2FB'; c.fillRect(0,0,w,h);
    simState.t=(simState.t||0)+0.025;
    var ok=circuitOK();

    // خلفية اللوحة
    c.fillStyle=isDarkMode()?'rgba(255,255,255,.03)':'rgba(255,255,255,.72)';
    c.beginPath(); c.roundRect(12,10,w-24,h-20,14); c.fill();
    c.strokeStyle=ok?'rgba(39,174,96,.4)':'rgba(0,0,0,.08)'; c.lineWidth=1.5;
    c.beginPath(); c.roundRect(12,10,w-24,h-20,14); c.stroke();

    // شبكة نقاط
    c.fillStyle=isDarkMode()?'rgba(255,255,255,.07)':'rgba(0,0,0,.06)';
    for(var gx=36;gx<w-20;gx+=28){
      for(var gy=36;gy<h-20;gy+=28){
        c.beginPath(); c.arc(gx,gy,1.5,0,Math.PI*2); c.fill();
      }
    }

    // ─── أسلاك الدائرة الجاهزة (quickCircuit) ───
    if(simState.isQuick && simState.fixedWires){
      var wc2=ok?'#27AE60':(isDarkMode()?'#4A6080':'#90A0B0');
      if(ok){ c.strokeStyle='rgba(39,174,96,.15)'; c.lineWidth=14; c.lineCap='round';
        simState.fixedWires.forEach(function(fw){ c.beginPath(); c.moveTo(fw.x1,fw.y1); c.lineTo(fw.x2,fw.y2); c.stroke(); }); }
      c.strokeStyle=wc2; c.lineWidth=3; c.lineCap='round';
      simState.fixedWires.forEach(function(fw){
        c.beginPath(); c.moveTo(fw.x1,fw.y1); c.lineTo(fw.x2,fw.y2); c.stroke();
      });
      // نقاط الزوايا
      var cv2r=document.getElementById('simCanvas'); if(cv2r){
        var wr=cv2r.width, hr=cv2r.height;
        var fx1=wr*0.18,fx2=wr*0.82,fy1=hr*0.22,fy2=hr*0.68;
        [[fx1,fy1],[fx2,fy1],[fx2,fy2],[fx1,fy2]].forEach(function(pt){
          c.fillStyle=ok?'#27AE60':'#78909C';
          c.beginPath(); c.arc(pt[0],pt[1],5,0,Math.PI*2); c.fill();
        });
      }
    }

    // ─── رسم الأسلاك المتصلة ───
    simState.conns.forEach(function(cn){
      var wireColor = ok ? '#27AE60' : (isDarkMode()?'#4A6080':'#90A0B0');
      c.strokeStyle=wireColor; c.lineWidth=2.5; c.lineCap='round';
      // سلك L-شكل (أفقي ثم رأسي) لدعم الدوائر غير الخطية
      c.beginPath();
      c.moveTo(cn.x1,cn.y1);
      // إذا على نفس الارتفاع تقريباً — خط مستقيم، وإلا L-شكل
      if(Math.abs(cn.y1-cn.y2)<12){
        c.lineTo(cn.x2,cn.y2);
      } else {
        var mx=(cn.x1+cn.x2)/2;
        c.lineTo(mx,cn.y1);
        c.lineTo(mx,cn.y2);
        c.lineTo(cn.x2,cn.y2);
      }
      c.stroke();
      // نقطة الوصل
      c.fillStyle=ok?'#27AE60':'#78909C';
      c.beginPath(); c.arc(cn.x1,cn.y1,3.5,0,Math.PI*2); c.fill();
      c.beginPath(); c.arc(cn.x2,cn.y2,3.5,0,Math.PI*2); c.fill();
    });

    // ─── Ghost ───
    if(ghostDrag){
      c.globalAlpha=0.52;
      drawSym(c,ghostDrag.type,ghostDrag.x,ghostDrag.y,1,false);
      c.globalAlpha=1;
      // منافذ ghost
      var gh={x:ghostDrag.x,y:ghostDrag.y,type:ghostDrag.type};
      ports(gh).forEach(function(pt){
        c.fillStyle='rgba(26,143,168,.6)';
        c.beginPath(); c.arc(pt.x,pt.y,5,0,Math.PI*2); c.fill();
      });
    }

    // ─── المكونات ───
    simState.placed.forEach(function(comp){
      var isDraggingThis=(simState.dragging!==null && simState.placed[simState.dragging]===comp);
      if(isDraggingThis){ c.globalAlpha=0.78; }
      drawSym(c,comp.type,comp.x,comp.y,1,ok&&comp.type==='bulb');
      c.globalAlpha=1;
      // منافذ الوصل — تضيء عند snap قريب
      ports(comp).forEach(function(pt){
        var nearSnap=false;
        if(!isDraggingThis){
          simState.placed.forEach(function(other){
            if(other.id===comp.id) return;
            ports(other).forEach(function(opt){
              var dx=pt.x-opt.x,dy=pt.y-opt.y;
              if(Math.sqrt(dx*dx+dy*dy)<SNAP_DIST) nearSnap=true;
            });
          });
        }
        c.fillStyle=nearSnap?'rgba(39,174,96,.8)':'rgba(26,143,168,.35)';
        c.beginPath(); c.arc(pt.x,pt.y,nearSnap?5:3.5,0,Math.PI*2); c.fill();
      });
      // مؤشر حذف
      c.font='9px Tajawal'; c.fillStyle='rgba(192,57,43,.4)'; c.textAlign='center';
      c.fillText('×٢ للحذف',comp.x,comp.y+(comp.type==='bulb'?44:38));
    });

    // ─── إلكترونات على الأسلاك ───
    if(ok && simState.conns.length>0){
      var totalWires=simState.conns.length;
      electrons.forEach(function(el){
        el.t=(el.t+0.006*el.s)%1;
        var wireIdx=Math.floor(el.t*totalWires);
        var frac=(el.t*totalWires)-wireIdx;
        var cn=simState.conns[wireIdx];
        if(!cn) return;
        var ex,ey;
        if(Math.abs(cn.y1-cn.y2)<12){
          ex=cn.x1+(cn.x2-cn.x1)*frac;
          ey=cn.y1+(cn.y2-cn.y1)*frac;
        } else {
          var mx=(cn.x1+cn.x2)/2;
          var seg1Len=Math.abs(mx-cn.x1), seg2Len=Math.abs(cn.y2-cn.y1), seg3Len=Math.abs(cn.x2-mx);
          var total=seg1Len+seg2Len+seg3Len||1;
          var t=frac*total;
          if(t<seg1Len){ ex=cn.x1+(mx-cn.x1)*(t/seg1Len); ey=cn.y1; }
          else if(t<seg1Len+seg2Len){ ex=mx; ey=cn.y1+(cn.y2-cn.y1)*((t-seg1Len)/seg2Len); }
          else { ex=mx+(cn.x2-mx)*((t-seg1Len-seg2Len)/seg3Len); ey=cn.y2; }
        }
        var alpha=0.75+Math.sin(simState.t*3+el.t*10)*0.2;
        c.fillStyle='rgba(0,210,255,'+alpha+')';
        c.shadowBlur=6; c.shadowColor='rgba(0,200,255,.6)';
        c.beginPath(); c.arc(ex,ey,4,0,Math.PI*2); c.fill();
        c.shadowBlur=0;
      });
    }

    // ─── شريط الحالة ───
    var st=document.getElementById('cir-status');
    if(st){
      if(simState.placed.length===0){
        st.textContent='💡 اسحب رموزاً وقرّب أطرافها لتتصل!'; st.style.color='#888'; st.style.background='';
      } else if(ok){
        st.innerHTML='✅ <strong>الدائرة مكتملة!</strong> التيار يسري ⚡';
        st.style.color='#27AE60'; st.style.background='rgba(39,174,96,.08)';
      } else {
        var missing=[];
        var hasPow=simState.placed.some(function(c2){return SYMS.find(function(s){return s.id===c2.type;}).hasPower;});
        var hasLd=simState.placed.some(function(c2){return SYMS.find(function(s){return s.id===c2.type;}).isLoad;});
        var hasOpenSw=simState.placed.some(function(c2){return c2.type==='swO';});
        var connected=simState.conns.length>0;
        if(!hasPow) missing.push('مصدر طاقة');
        if(!hasLd)  missing.push('مصباح');
        if(hasOpenSw) missing.push('أغلق المفتاح');
        if(!connected&&simState.placed.length>1) missing.push('قرّب الأطراف لتتصل');
        st.innerHTML='⚠️ ينقص: '+missing.join(' · ');
        st.style.color='#D4901A'; st.style.background='rgba(212,144,26,.07)';
      }
    }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// 5-6 TAB 1: تغيير المصابيح — تفاعلي بالسحب
function simCircuitChange1() {
  cancelAnimationFrame(animFrame);
  simState={t:0,bulbs:1,cells:2,swOn:true};

  function stats(){
    var V=simState.cells*1.5, R=simState.bulbs*3.5+.3, I=simState.swOn?V/R:0;
    return{V,R,I,br:Math.min(1,I/.45)};
  }

  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">💡 عدد المصابيح</div>
      <div style="display:flex;align-items:center;gap:12px;justify-content:center;margin:8px 0">
        <button onclick="if(simState.bulbs>1)simState.bulbs--;" style="width:36px;height:36px;border-radius:50%;border:none;background:#E74C3C;color:white;font-size:20px;cursor:pointer;font-family:Arial">−</button>
        <span id="bNum" style="font-size:24px;font-weight:800;color:#1A8FA8;min-width:30px;text-align:center">1</span>
        <button onclick="if(simState.bulbs<4)simState.bulbs++;" style="width:36px;height:36px;border-radius:50%;border:none;background:#27AE60;color:white;font-size:20px;cursor:pointer;font-family:Arial">+</button>
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🔋 عدد الخلايا</div>
      <div style="display:flex;align-items:center;gap:12px;justify-content:center;margin:8px 0">
        <button onclick="if(simState.cells>1)simState.cells--;" style="width:36px;height:36px;border-radius:50%;border:none;background:#E74C3C;color:white;font-size:20px;cursor:pointer;font-family:Arial">−</button>
        <span id="cNum" style="font-size:24px;font-weight:800;color:#1A8FA8;min-width:30px;text-align:center">2</span>
        <button onclick="if(simState.cells<4)simState.cells++;" style="width:36px;height:36px;border-radius:50%;border:none;background:#27AE60;color:white;font-size:20px;cursor:pointer;font-family:Arial">+</button>
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">⚡ المفتاح</div>
      <div class="toggle-row">
        <span class="toggle-name" id="sw6L">مغلق ✅</span>
        <div class="toggle on" id="sw6T" onclick="simState.swOn=!simState.swOn;document.getElementById('sw6T').classList.toggle('on',simState.swOn);document.getElementById('sw6L').textContent=simState.swOn?'مغلق ✅':'مفتوح ❌';"></div>
      </div>
    </div>
    <div class="info-box" style="font-size:13px">
      📖 ص٤٤: إضافة مصباح = مقاومة أكبر = تيار أقل = سطوع أقل.
    </div>
    <div class="q-box" style="font-size:13px">
      <strong>❓</strong> إذا أضفت مصباحاً رابعاً، ماذا يحدث للسطوع؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 الإجابة</button>
      <div class="q-ans-panel">يقلّ السطوع! لأن المقاومة الكلية تزيد، فيقل التيار المار في الدائرة.</div>
    </div>`);

  var cv=document.getElementById('simCanvas');
  function draw(){
    var c=elCtx(),w=elW(),h=elH();
    c.clearRect(0,0,w,h); c.fillStyle=isDarkMode()?'#141C28':'#ECEFF4'; c.fillRect(0,0,w,h);
    simState.t+=.04;
    var s=stats(), nb=simState.bulbs, on=s.I>.01;
    document.getElementById('bNum').textContent=nb;
    document.getElementById('cNum').textContent=simState.cells;

    // ── layout: دائرة في الأعلى، معلومات في الأسفل ──
    var py=h*.10, px=w*.10, pw=w*.80, ph=h*.52;

    // أسلاك الدائرة
    c.strokeStyle=on?'#27AE60':'#999'; c.lineWidth=on?3:2;
    c.beginPath();
    c.moveTo(px,py); c.lineTo(px+pw,py);          // أعلى
    c.moveTo(px+pw,py); c.lineTo(px+pw,py+ph);    // يمين
    c.moveTo(px+pw,py+ph); c.lineTo(px,py+ph);    // أسفل
    c.moveTo(px,py+ph); c.lineTo(px,py);           // يسار
    c.stroke();

    // بطاريات (على الجانب الأيسر)
    for(var ci=0;ci<simState.cells;ci++){
      var by=py+ph*.20+ci*(ph*.13);
      c.fillStyle='#2C3E50'; c.beginPath(); c.roundRect(px-28,by-10,56,20,4); c.fill();
      c.fillStyle='#F39C12'; c.fillRect(px-20,by-6,40,12);
      c.fillStyle='white'; c.font='bold 8px Arial'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('1.5V',px,by);
    }

    // مفتاح (أعلى يمين)
    var swx=px+pw*.72, swy=py;
    c.fillStyle=isDarkMode()?'#2A3A50':'#DDD'; c.beginPath(); c.roundRect(swx-18,swy-10,36,20,6); c.fill();
    c.strokeStyle='#555'; c.lineWidth=2;
    c.beginPath();
    if(simState.swOn){c.moveTo(swx-10,swy);c.lineTo(swx+10,swy);}
    else{c.moveTo(swx-10,swy+2);c.lineTo(swx+10,swy-6);}
    c.stroke();

    // مصابيح داخل الدائرة (على الجانب السفلي)
    var sp=pw/(nb+1);
    for(var bi=0;bi<nb;bi++){
      var lx=px+sp*(bi+1), ly=py+ph, lbr=on?s.br:0;
      var lR=18; // نصف قطر المصباح
      // وهج
      if(lbr>.05){
        c.shadowBlur=16*lbr+Math.sin(simState.t*4+bi)*5*lbr;
        c.shadowColor='rgba(255,220,0,.75)';
      }
      // جسم المصباح (كرة الضوء)
      c.fillStyle=lbr>.05?('rgba(255,230,80,'+(0.35+lbr*.65)+')'):'rgba(180,180,180,.45)';
      c.beginPath(); c.arc(lx, ly, lR, 0, Math.PI*2); c.fill();
      c.shadowBlur=0;
      c.strokeStyle=lbr>.05?'rgba(255,180,0,.7)':'#BBB'; c.lineWidth=2;
      c.beginPath(); c.arc(lx, ly, lR, 0, Math.PI*2); c.stroke();
      // قاعدة المصباح
      c.fillStyle='#666'; c.beginPath(); c.roundRect(lx-7, ly+lR-2, 14, 9, 3); c.fill();
      // خيط المصباح الداخلي
      if(lbr>.1){
        c.strokeStyle='rgba(255,200,50,'+(lbr*.7)+')';
        c.lineWidth=1.5;
        c.beginPath();
        c.moveTo(lx-4, ly-4); c.lineTo(lx+1, ly); c.lineTo(lx-2, ly+4);
        c.stroke();
      }
      // رقم المصباح
      c.fillStyle=lbr>.3?'rgba(0,0,0,.5)':'rgba(150,150,150,.7)';
      c.font='bold 9px Tajawal'; c.textAlign='center'; c.textBaseline='top';
      c.fillText(bi+1, lx, ly+lR+10);
    }

    // ── صندوق المعلومات السفلي — لا يتداخل مع الدائرة ──
    var infoY=h*.66, infoH=h*.30;
    c.fillStyle=isDarkMode()?'rgba(20,28,40,.88)':'rgba(255,255,255,.90)';
    c.strokeStyle=isDarkMode()?'rgba(255,255,255,.07)':'rgba(0,0,0,.07)';
    c.lineWidth=1;
    c.beginPath(); c.roundRect(w*.04, infoY, w*.92, infoH, 12); c.fill(); c.stroke();

    // معلومات رئيسية
    c.font='bold 13px Tajawal'; c.fillStyle=isDarkMode()?'#E8F2FA':'#1E2D3D';
    c.textAlign='center'; c.textBaseline='top';
    c.fillText('جهد: '+s.V.toFixed(1)+'V   |   تيار: '+s.I.toFixed(2)+'A   |   سطوع: '+Math.round(s.br*100)+'%', w/2, infoY+h*.025);

    // شريط السطوع
    var by2=infoY+h*.085, bh=h*.065;
    c.fillStyle='rgba(0,0,0,.08)'; c.beginPath(); c.roundRect(w*.10,by2,w*.80,bh,bh/2); c.fill();
    var bf=on?s.br:0;
    if(bf>.02){
      var bg=c.createLinearGradient(w*.10,by2,w*.10+w*.80*bf,by2);
      bg.addColorStop(0,'rgba(255,160,0,.85)'); bg.addColorStop(1,'rgba(255,240,50,.95)');
      c.fillStyle=bg; c.beginPath(); c.roundRect(w*.10,by2,w*.80*bf,bh,bh/2); c.fill();
      c.font='bold 10px Tajawal'; c.fillStyle='rgba(0,0,0,.55)'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(Math.round(bf*100)+'%', w*.10+w*.80*bf/2, by2+bh/2);
    }
    c.font='bold 10px Tajawal'; c.fillStyle='#999'; c.textAlign='right'; c.textBaseline='middle';
    c.fillText('السطوع', w*.92, by2+bh/2);

    // رسالة تفسيرية
    c.font='12px Tajawal'; c.fillStyle=isDarkMode()?'#8AA8C0':'#555'; c.textAlign='center'; c.textBaseline='top';
    c.fillText(nb>2?'↓ زيادة المصابيح تُضعف السطوع — مقاومة أكبر':'↑ تقليل المصابيح يزيد السطوع', w/2, infoY+h*.175);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// 5-6 TAB 2: تغيير الخلايا
function simCircuitChange2() {
  cancelAnimationFrame(animFrame);
  simState={t:0,cells:1};
  function getTableRows(n){
    var rows='<tr style="background:rgba(26,143,168,.12)"><th style="padding:5px 4px;font-size:12px">الخلايا</th><th style="padding:5px 4px;font-size:12px">الجهد</th><th style="padding:5px 4px;font-size:12px">التيار</th><th style="padding:5px 4px;font-size:12px">السطوع</th></tr>';
    for(var i=1;i<=Math.max(n,3);i++){
      var V2=i*1.5, I2=V2/3.6;
      // نفس صيغة السطوع المستخدمة في الرسم
      var br2 = 0.10 + (i-1)/5 * 0.90;
      if(br2>1) br2=1;
      var isActive=(i===n);
      rows+='<tr style="background:'+(isActive?'rgba(26,143,168,.12)':(i%2===0?'rgba(0,0,0,.03)':''))+'">'+
        '<td style="padding:4px;text-align:center;font-weight:'+(isActive?'800':'400')+';color:'+(isActive?'#1A8FA8':'inherit')+'">'+i+(isActive?' ◀':'')+'</td>'+
        '<td style="text-align:center;font-size:12px;font-weight:'+(isActive?'800':'400')+'">'+V2.toFixed(1)+'V</td>'+
        '<td style="text-align:center;font-size:12px;font-weight:'+(isActive?'800':'400')+';color:'+(isActive?'#1A8FA8':'inherit')+'">'+I2.toFixed(2)+'A</td>'+
        '<td style="text-align:center;font-size:12px;font-weight:'+(isActive?'800':'400')+';color:'+(isActive?'#E67E22':'inherit')+'">'+Math.round(br2*100)+'%</td>'+
      '</tr>';
    }
    return rows;
  }
  window.updateC2Table=function(){ var tbl=document.getElementById('c2Tbl'); if(tbl) tbl.innerHTML=getTableRows(simState.cells); };

  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔋 عدد الخلايا</div>
      <div style="display:flex;align-items:center;gap:14px;justify-content:center;margin:10px 0">
        <button onclick="if(simState.cells>1){simState.cells--;updateC2Table();}" style="width:40px;height:40px;border-radius:50%;border:none;background:#E74C3C;color:white;font-size:22px;cursor:pointer;font-weight:700">−</button>
        <span id="c2n" style="font-size:28px;font-weight:800;color:#1A8FA8;min-width:36px;text-align:center">1</span>
        <button onclick="if(simState.cells<6){simState.cells++;updateC2Table();}" style="width:40px;height:40px;border-radius:50%;border:none;background:#27AE60;color:white;font-size:22px;cursor:pointer;font-weight:700">+</button>
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">📊 جدول التأثير</div>
      <table style="width:100%;border-collapse:collapse;font-size:12px" id="c2Tbl">
        ${getTableRows(1)}
      </table>
    </div>
    <div class="info-box" style="font-size:13px">📖 ص٤٦: زيادة الخلايا → جهد أكبر → تيار أكبر → سطوع أكبر.</div>`);

  var cv=document.getElementById('simCanvas');
  var _lastCells=-1;
  function draw(){
    var c=elCtx(),w=elW(),h=elH();
    c.clearRect(0,0,w,h); c.fillStyle=isDarkMode()?'#141C28':'#ECEFF4'; c.fillRect(0,0,w,h);
    simState.t+=.04;
    var n=simState.cells, V=n*1.5, I=V/3.6;
    // السطوع يبدأ من 0.12 (خلية واحدة خافت) ويصل 1.0 (6 خلايا ساطع جداً)
    // صيغة تدريجية وواضحة بصرياً
    var br = 0.10 + (n-1)/5 * 0.90;
    document.getElementById('c2n').textContent=n;
    if(n!==_lastCells){ _lastCells=n; if(window.updateC2Table) window.updateC2Table(); }

    // ── دائرة كهربائية كاملة ──
    // أسلاك الدائرة
    var py=h*.08, px=w*.12, pw=w*.76, ph=h*.50;
    var wireCol = n>1?'#27AE60':'#888';
    c.strokeStyle=wireCol; c.lineWidth=2;
    c.beginPath();
    c.moveTo(px,py); c.lineTo(px+pw,py);
    c.moveTo(px+pw,py); c.lineTo(px+pw,py+ph);
    c.moveTo(px+pw,py+ph); c.lineTo(px,py+ph);
    c.moveTo(px,py+ph); c.lineTo(px,py);
    c.stroke();

    // بطاريات على الجانب الأيسر
    var sx=px, sy=py+ph*.10;
    for(var ci=0;ci<n;ci++){
      var cb=sy+ci*21;
      c.fillStyle='hsl('+(30+ci*8)+',75%,'+(36+ci*3)+'%)';
      c.beginPath(); c.roundRect(sx-28,cb,56,17,3); c.fill();
      c.fillStyle='rgba(255,240,100,.65)'; c.fillRect(sx-20,cb+3,40,11);
      c.fillStyle='white'; c.font='bold 7px Arial'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('1.5V',sx,cb+8.5);
    }
    c.font='bold 11px Tajawal'; c.fillStyle=isDarkMode()?'#FFD060':'#B8860B';
    c.textAlign='center'; c.textBaseline='top';
    c.fillText(V.toFixed(1)+'V', sx, sy+n*21+3);

    // أسهم الشحنات المتحركة (أكثر عند زيادة الخلايا)
    var arrowCount = 2 + (n-1)*2;
    for(var ai=0; ai<arrowCount; ai++){
      var at = ((simState.t*0.8*(0.5+n*0.15) + ai/arrowCount))%1;
      // يسير عكس عقارب الساعة في الدائرة
      var perim = (pw+ph)*2;
      var dist = at * perim;
      var ax,ay;
      if(dist < pw){ ax=px+dist; ay=py; }
      else if(dist < pw+ph){ ax=px+pw; ay=py+(dist-pw); }
      else if(dist < pw*2+ph){ ax=px+pw-(dist-pw-ph); ay=py+ph; }
      else { ax=px; ay=py+ph-(dist-pw*2-ph); }
      var alpha = 0.55 + 0.4*(n/6);
      c.fillStyle='rgba(255,'+(160+n*12|0)+',0,'+alpha+')';
      c.font='bold '+(9+n)+'px Arial'; c.textAlign='center'; c.textBaseline='middle';
      // اتجاه السهم حسب الجانب
      var arDir='→';
      if(dist < pw) arDir='→';
      else if(dist < pw+ph) arDir='↓';
      else if(dist < pw*2+ph) arDir='←';
      else arDir='↑';
      c.fillText(arDir, ax, ay);
    }

    // المصباح على الجانب الأيمن
    var lx=px+pw, ly=py+ph*.45;
    var baseR = Math.min(w,h)*0.062;
    var lsz = baseR * (0.75 + br*0.45); // يكبر مع السطوع

    // هالة خارجية تتسع مع الخلايا
    if(br>0.08){
      var glowR = lsz*(1.8 + br*2.5);
      var glow = c.createRadialGradient(lx,ly,0,lx,ly,glowR);
      glow.addColorStop(0,'rgba(255,230,60,'+(br*0.55)+')');
      glow.addColorStop(0.5,'rgba(255,180,0,'+(br*0.22)+')');
      glow.addColorStop(1,'rgba(255,120,0,0)');
      c.fillStyle=glow; c.beginPath(); c.arc(lx,ly,glowR,0,Math.PI*2); c.fill();
    }

    // جسم المصباح
    c.shadowBlur = br>0.1 ? (18*br + Math.sin(simState.t*3)*5*br) : 0;
    c.shadowColor = 'rgba(255,220,0,0.8)';
    var rr = Math.round(200+br*55), gg = Math.round(180+br*55), bb = Math.round(40-br*30);
    c.fillStyle = 'rgba('+rr+','+gg+','+bb+','+(0.18+br*0.82)+')';
    c.beginPath(); c.arc(lx,ly,lsz,0,Math.PI*2); c.fill();
    c.shadowBlur=0;
    // حافة
    c.strokeStyle = br>0.1 ? 'rgba(255,'+(160+br*60|0)+',0,'+(0.5+br*0.4)+')' : '#999';
    c.lineWidth=2;
    c.beginPath(); c.arc(lx,ly,lsz,0,Math.PI*2); c.stroke();
    // خيط الإنارة الداخلي
    if(br>0.15){
      c.strokeStyle='rgba(255,240,120,'+(br*0.85)+')';
      c.lineWidth=1.5; c.lineCap='round';
      c.beginPath();
      c.moveTo(lx-lsz*.3, ly-lsz*.2);
      c.quadraticCurveTo(lx, ly+lsz*.15, lx+lsz*.3, ly-lsz*.2);
      c.stroke();
    }
    // قاعدة المصباح
    c.fillStyle='#555';
    c.beginPath(); c.roundRect(lx-lsz*.55, ly+lsz*.75, lsz*1.1, lsz*.45, 4); c.fill();
    // نسبة السطوع
    c.font='bold '+Math.round(11+br*4)+'px Tajawal';
    c.fillStyle=br>0.4?'rgba(0,0,0,.55)':(isDarkMode()?'#aaa':'#666');
    c.textAlign='center'; c.textBaseline='top';
    c.fillText(Math.round(br*100)+'%', lx, ly+lsz+lsz*.5);

    // ── صندوق المعلومات السفلي ──
    var infoY=h*.63, infoH=h*.33;
    c.fillStyle=isDarkMode()?'rgba(20,28,40,.88)':'rgba(255,255,255,.90)';
    c.strokeStyle=isDarkMode()?'rgba(255,255,255,.07)':'rgba(0,0,0,.07)'; c.lineWidth=1;
    c.beginPath(); c.roundRect(w*.04, infoY, w*.92, infoH, 12); c.fill(); c.stroke();

    c.font='bold 13px Tajawal'; c.fillStyle=isDarkMode()?'#E8F2FA':'#1E2D3D';
    c.textAlign='center'; c.textBaseline='top';
    c.fillText(n+' خلية  →  '+V.toFixed(1)+'V  →  '+I.toFixed(2)+'A  →  سطوع '+Math.round(br*100)+'%', w/2, infoY+h*.025);

    // شريط السطوع المرئي
    var by2=infoY+h*.085, bh=h*.07;
    // خلفية الشريط
    c.fillStyle='rgba(0,0,0,.10)'; c.beginPath(); c.roundRect(w*.08,by2,w*.84,bh,bh/2); c.fill();
    // الملء التدريجي
    var grad=c.createLinearGradient(w*.08,by2,w*.92,by2);
    grad.addColorStop(0,'rgba(255,80,0,.3)');
    grad.addColorStop(0.5,'rgba(255,180,0,.8)');
    grad.addColorStop(1,'rgba(255,255,100,1)');
    c.fillStyle=grad;
    c.beginPath(); c.roundRect(w*.08,by2,w*.84*br,bh,bh/2); c.fill();
    // علامات الخلايا على الشريط
    for(var si=1;si<=6;si++){
      var sx2=w*.08+w*.84*(si/6);
      c.strokeStyle=isDarkMode()?'rgba(255,255,255,.25)':'rgba(0,0,0,.2)'; c.lineWidth=1;
      c.beginPath(); c.moveTo(sx2,by2); c.lineTo(sx2,by2+bh); c.stroke();
      c.font='9px Tajawal'; c.fillStyle=isDarkMode()?'rgba(255,255,255,.4)':'rgba(0,0,0,.3)';
      c.textAlign='center'; c.textBaseline='top'; c.fillText(si,sx2,by2+bh+2);
    }
    c.font='9px Tajawal'; c.fillStyle=isDarkMode()?'rgba(255,255,255,.35)':'rgba(0,0,0,.35)';
    c.textAlign='left'; c.textBaseline='top'; c.fillText('عدد الخلايا',w*.08,by2+bh+2);
    // قيمة السطوع على الشريط
    if(br>0.15){
      c.font='bold 10px Tajawal'; c.fillStyle='rgba(0,0,0,.6)';
      c.textAlign='center'; c.textBaseline='middle';
      c.fillText(Math.round(br*100)+'%', w*.08+w*.84*br/2, by2+bh/2);
    }

    c.font='12px Tajawal'; c.fillStyle=isDarkMode()?'#8AA8C0':'#555';
    c.textAlign='center'; c.textBaseline='top';
    c.fillText(n>=4?'↑ زيادة الخلايا = جهد أعلى = تيار أقوى = سطوع أكبر':'أضف المزيد من الخلايا وراقب تغيّر الإضاءة!', w/2, infoY+h*.20);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}


// ═══════════════════════════════════════════════════════════════
// 5-7 · الجهد الكهربائي — تبويب 1: المصباح 💡
// ═══════════════════════════════════════════════════════════════
function simVoltage1() {
  cancelAnimationFrame(animFrame);
  var VS = { n: 1, t: 0, maxN: 3, deviceV: 1.5, label: 'مصباح', emoji: '💡' };
  simState = VS;

  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">💡 المصباح يحتاج: 1.5 V</div>
      <div style="background:rgba(39,174,96,.1);border:1.5px solid rgba(39,174,96,.3);border-radius:10px;padding:10px;font-size:12px;color:var(--text-secondary);line-height:1.7">
        المصباح العادي يعمل بجهد منخفض<br>
        <strong style="color:#1E8449">خلية واحدة (1.5 V) تكفي!</strong>
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🔋 عدد الخلايا</div>
      <div style="display:flex;align-items:center;gap:10px;justify-content:center;margin:6px 0">
        <button onclick="if(window._vs1&&window._vs1.n>1){window._vs1.n--;}" style="width:36px;height:36px;border-radius:50%;border:2px solid var(--border-color);background:var(--surface);font-size:18px;cursor:pointer;font-family:Tajawal">−</button>
        <span id="vs1-count" style="font-size:22px;font-weight:700;color:var(--text-primary);min-width:32px;text-align:center">1</span>
        <button onclick="if(window._vs1&&window._vs1.n<3){window._vs1.n++;}" style="width:36px;height:36px;border-radius:50%;border:2px solid var(--border-color);background:var(--surface);font-size:18px;cursor:pointer;font-family:Tajawal">+</button>
      </div>
      <div id="vs1-volt" style="text-align:center;font-size:13px;color:#D4901A;font-weight:700">⚡ 1.5 V</div>
    </div>
    <div class="info-box" style="font-size:12px;margin-top:6px">
      🔍 <strong>الجهد الكهربائي</strong> هو "قوة" الكهرباء<br>
      كل جهاز يحتاج حداً أدنى ليعمل
    </div>
  `);
  window._vs1 = VS;

  function draw() {
    if (currentSim !== 'g6voltage') { cancelAnimationFrame(animFrame); return; }
    if (!simState || simState !== VS) { animFrame = requestAnimationFrame(draw); return; }
    VS.t += 0.03;
    var ctx = elCtx(), w = elW(), h = elH(), dm = isDarkMode();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = dm ? '#0E1620' : '#F5F8FF'; ctx.fillRect(0, 0, w, h);
    // نقاط الخلفية
    ctx.fillStyle = dm ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)';
    for (var gx = 24; gx < w; gx += 28) for (var gy = 24; gy < h; gy += 28) { ctx.beginPath(); ctx.arc(gx, gy, 1.3, 0, Math.PI * 2); ctx.fill(); }

    var V = VS.n * 1.5, needed = 1.5, lit = V >= needed;
    var brightness = lit ? Math.min(1, V / needed) : 0;
    var cx = w / 2, cy = h * 0.42;

    // ── رسم الدائرة ──
    var batX = cx - 130, batY = cy, bulbX = cx + 110, bulbY = cy;
    var wireY1 = cy - 80, wireY2 = cy + 60;

    // أسلاك
    var wCol = lit ? '#27AE60' : (dm ? '#4A6080' : '#90A0B0');
    var wW = lit ? 3.5 : 2.5;
    if (lit) { ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(39,174,96,.5)'; }
    ctx.strokeStyle = wCol; ctx.lineWidth = wW; ctx.lineCap = 'round';
    // سلك علوي
    ctx.beginPath(); ctx.moveTo(batX, batY - 18); ctx.lineTo(batX, wireY1); ctx.lineTo(bulbX, wireY1); ctx.lineTo(bulbX, bulbY - 20); ctx.stroke();
    // سلك سفلي
    ctx.beginPath(); ctx.moveTo(batX, batY + 18); ctx.lineTo(batX, wireY2); ctx.lineTo(bulbX, wireY2); ctx.lineTo(bulbX, bulbY + 20); ctx.stroke();
    ctx.shadowBlur = 0;

    // إلكترونات متحركة
    if (lit) {
      var path = [
        { x: batX, y: batY - 18 }, { x: batX, y: wireY1 },
        { x: bulbX, y: wireY1 }, { x: bulbX, y: bulbY - 20 },
        { x: bulbX, y: bulbY + 20 }, { x: bulbX, y: wireY2 },
        { x: batX, y: wireY2 }, { x: batX, y: batY + 18 }
      ];
      var totalLen = 0;
      for (var pi = 0; pi < path.length - 1; pi++) totalLen += Math.hypot(path[pi + 1].x - path[pi].x, path[pi + 1].y - path[pi].y);
      for (var ei = 0; ei < 8; ei++) {
        var et = ((VS.t * 0.4 * brightness + ei / 8) % 1);
        var ed = et * totalLen, acc = 0;
        for (var pi2 = 0; pi2 < path.length - 1; pi2++) {
          var segL = Math.hypot(path[pi2 + 1].x - path[pi2].x, path[pi2 + 1].y - path[pi2].y);
          if (acc + segL >= ed) { var f2 = (ed - acc) / segL; ctx.fillStyle = 'rgba(0,220,255,.85)'; ctx.beginPath(); ctx.arc(path[pi2].x + (path[pi2 + 1].x - path[pi2].x) * f2, path[pi2].y + (path[pi2 + 1].y - path[pi2].y) * f2, 4, 0, Math.PI * 2); ctx.fill(); break; }
          acc += segL;
        }
      }
    }

    // ── البطاريات ──
    _drawBatteryStack(ctx, batX, batY, VS.n, dm);

    // ── المصباح ──
    _drawBulbV(ctx, bulbX, bulbY, brightness, dm);

    // ── الجهد ──
    var vTxt = V.toFixed(1) + ' V', el = document.getElementById('vs1-count'), ev = document.getElementById('vs1-volt');
    if (el) el.textContent = VS.n;
    if (ev) ev.textContent = '⚡ ' + vTxt;

    // شريط المعلومات
    var sbH = 52, sbY2 = h - sbH - 8;
    ctx.fillStyle = dm ? 'rgba(14,22,34,.94)' : 'rgba(255,255,255,.95)';
    ctx.beginPath(); ctx.roundRect(10, sbY2, w - 20, sbH, 11); ctx.fill();
    ctx.strokeStyle = lit ? 'rgba(39,174,96,.4)' : 'rgba(0,0,0,.07)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(10, sbY2, w - 20, sbH, 11); ctx.stroke();
    ctx.font = 'bold 15px Tajawal'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = lit ? '#1E8449' : '#C0392B';
    ctx.fillText(lit ? '✅ المصباح يضيء! الجهد كافٍ (' + vTxt + ')' : '❌ الجهد غير كافٍ (' + vTxt + ' < ' + needed + ' V)', w / 2, sbY2 + sbH / 2 - 8);
    ctx.font = '12px Tajawal'; ctx.fillStyle = dm ? '#8AA8C0' : '#666';
    ctx.fillText('المصباح يحتاج: ' + needed + ' V  |  المتاح: ' + vTxt, w / 2, sbY2 + sbH / 2 + 10);

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

// ═══════════════════════════════════════════════════════════════
// 5-7 · TAB 2: الطنان 🔔
// ═══════════════════════════════════════════════════════════════
function simVoltage2() {
  cancelAnimationFrame(animFrame);
  var VS2 = { n: 1, t: 0, maxN: 4, deviceV: 3.0, buzzing: false, audioCtx: null, osc: null, gain: null };
  simState = VS2;

  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔔 الطنان يحتاج: 3 V</div>
      <div style="background:rgba(214,122,30,.1);border:1.5px solid rgba(214,122,30,.3);border-radius:10px;padding:10px;font-size:12px;color:var(--text-secondary);line-height:1.7">
        الطنان يحتاج <strong style="color:#D4901A">3V كحدٍّ أدنى</strong><br>
        بطارية واحدة (1.5V) لا تكفيه!
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🔋 أضف خلايا (1 ← 4)</div>
      <div style="display:flex;align-items:center;gap:10px;justify-content:center;margin:6px 0">
        <button onclick="if(window._vs2&&window._vs2.n>1){window._vs2.n--;window._vs2._updateSound();}" style="width:36px;height:36px;border-radius:50%;border:2px solid var(--border-color);background:var(--surface);font-size:18px;cursor:pointer;font-family:Tajawal">−</button>
        <span id="vs2-count" style="font-size:22px;font-weight:700;color:var(--text-primary);min-width:32px;text-align:center">1</span>
        <button onclick="if(window._vs2&&window._vs2.n<4){window._vs2.n++;window._vs2._updateSound();}" style="width:36px;height:36px;border-radius:50%;border:2px solid var(--border-color);background:var(--surface);font-size:18px;cursor:pointer;font-family:Tajawal">+</button>
      </div>
      <div id="vs2-volt" style="text-align:center;font-size:13px;color:#D4901A;font-weight:700">⚡ 1.5 V</div>
    </div>
    <div id="vs2-msg" style="padding:8px 12px;border-radius:10px;font-size:13px;font-family:Tajawal;text-align:center;margin-top:4px;background:rgba(192,57,43,.08);color:#C0392B;border:1.5px solid rgba(192,57,43,.2)">
      🔇 الطنان لا يعمل — أضف خلية أخرى
    </div>
  `);
  window._vs2 = VS2;

  VS2._updateSound = function () {
    var V2 = VS2.n * 1.5, active = V2 >= 3.0;
    if (active && !VS2.buzzing) {
      try {
        VS2.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        VS2.osc = VS2.audioCtx.createOscillator();
        VS2.gain = VS2.audioCtx.createGain();
        VS2.osc.type = 'square';
        VS2.osc.frequency.value = 220 + (V2 - 3) * 60;
        VS2.gain.gain.value = Math.min(0.18, (V2 - 3) / 3 * 0.18 + 0.04);
        VS2.osc.connect(VS2.gain); VS2.gain.connect(VS2.audioCtx.destination);
        VS2.osc.start(); VS2.buzzing = true;
      } catch (ex) {}
    } else if (active && VS2.buzzing) {
      try { VS2.osc.frequency.value = 220 + (V2 - 3) * 60; VS2.gain.gain.value = Math.min(0.18, (V2 - 3) / 3 * 0.18 + 0.04); } catch (ex) {}
    } else if (!active && VS2.buzzing) {
      try { VS2.osc.stop(); VS2.audioCtx.close(); } catch (ex) {}
      VS2.buzzing = false;
    }
  };

  // إيقاف الصوت عند مغادرة التبويب
  window._stopCurrentSim = function(){ try { if(VS2.osc) VS2.osc.stop(); if(VS2.audioCtx) VS2.audioCtx.close(); } catch(ex){} VS2.buzzing=false; };

  function draw2() {
    if (currentSim !== 'g6voltage' || currentTab !== 1) { try { if(VS2.osc)VS2.osc.stop(); if(VS2.audioCtx)VS2.audioCtx.close(); } catch(ex){} VS2.buzzing=false; cancelAnimationFrame(animFrame); return; }
    if (!simState || simState !== VS2) { animFrame = requestAnimationFrame(draw2); return; }
    VS2.t += 0.04;
    var ctx = elCtx(), w = elW(), h = elH(), dm = isDarkMode();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = dm ? '#0E1620' : '#F5F8FF'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = dm ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)';
    for (var gx = 24; gx < w; gx += 28) for (var gy = 24; gy < h; gy += 28) { ctx.beginPath(); ctx.arc(gx, gy, 1.3, 0, Math.PI * 2); ctx.fill(); }

    var V2 = VS2.n * 1.5, needed2 = 3.0, active2 = V2 >= needed2;
    var intensity = active2 ? Math.min(1, (V2 - needed2 + 1.5) / 4.5) : 0;
    var cx = w / 2, cy = h * 0.42;
    var batX2 = cx - 140, batY2 = cy, buzzX = cx + 100, buzzY = cy;
    var wireY1 = cy - 75, wireY2 = cy + 55;

    var wCol2 = active2 ? '#F39C12' : (dm ? '#4A6080' : '#90A0B0');
    if (active2) { ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(243,156,18,.5)'; }
    ctx.strokeStyle = wCol2; ctx.lineWidth = active2 ? 3.5 : 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(batX2, batY2 - 18); ctx.lineTo(batX2, wireY1); ctx.lineTo(buzzX, wireY1); ctx.lineTo(buzzX, buzzY - 22); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(batX2, batY2 + 18); ctx.lineTo(batX2, wireY2); ctx.lineTo(buzzX, wireY2); ctx.lineTo(buzzX, buzzY + 22); ctx.stroke();
    ctx.shadowBlur = 0;

    // إلكترونات
    if (active2) {
      var path2 = [{x:batX2,y:batY2-18},{x:batX2,y:wireY1},{x:buzzX,y:wireY1},{x:buzzX,y:buzzY-22},{x:buzzX,y:buzzY+22},{x:buzzX,y:wireY2},{x:batX2,y:wireY2},{x:batX2,y:batY2+18}];
      var tLen2=0; for(var pi=0;pi<path2.length-1;pi++) tLen2+=Math.hypot(path2[pi+1].x-path2[pi].x,path2[pi+1].y-path2[pi].y);
      for(var ei=0;ei<8;ei++){ var et2=((VS2.t*0.45*intensity+ei/8)%1),ed2=et2*tLen2,acc2=0; for(var pi2=0;pi2<path2.length-1;pi2++){var sL=Math.hypot(path2[pi2+1].x-path2[pi2].x,path2[pi2+1].y-path2[pi2].y);if(acc2+sL>=ed2){var f3=(ed2-acc2)/sL;ctx.fillStyle='rgba(255,180,0,.85)';ctx.beginPath();ctx.arc(path2[pi2].x+(path2[pi2+1].x-path2[pi2].x)*f3,path2[pi2].y+(path2[pi2+1].y-path2[pi2].y)*f3,4,0,Math.PI*2);ctx.fill();break;} acc2+=sL;} }
    }

    _drawBatteryStack(ctx, batX2, batY2, VS2.n, dm);
    _drawBuzzer(ctx, buzzX, buzzY, active2, intensity, VS2.t, dm);

    // موجات صوتية
    if (active2) {
      for (var wi = 1; wi <= 3; wi++) {
        var wr = 28 + wi * 20 + ((VS2.t * 30) % 20);
        var wa = Math.max(0, (0.7 - wi * 0.2) * intensity);
        ctx.strokeStyle = 'rgba(243,156,18,' + wa + ')';
        ctx.lineWidth = 2; ctx.beginPath();
        ctx.arc(buzzX + 10, buzzY, wr, -Math.PI * 0.6, Math.PI * 0.6);
        ctx.stroke();
      }
    }

    // تحديث UI
    var cEl = document.getElementById('vs2-count'), vEl = document.getElementById('vs2-volt'), mEl = document.getElementById('vs2-msg');
    if (cEl) cEl.textContent = VS2.n;
    if (vEl) vEl.textContent = '⚡ ' + V2.toFixed(1) + ' V';
    if (mEl) {
      if (active2) { mEl.style.background='rgba(39,174,96,.1)'; mEl.style.color='#1E8449'; mEl.style.borderColor='rgba(39,174,96,.3)'; mEl.textContent = '🔊 الطنان يعمل! الجهد = ' + V2.toFixed(1) + ' V' + (intensity > 0.5 ? ' — الصوت قوي جداً!' : ''); }
      else { mEl.style.background='rgba(192,57,43,.08)'; mEl.style.color='#C0392B'; mEl.style.borderColor='rgba(192,57,43,.2)'; mEl.textContent = '🔇 الجهد غير كافٍ (' + V2.toFixed(1) + 'V < ' + needed2 + 'V) — أضف خلية!'; }
    }

    var sbH2 = 52, sbY3 = h - sbH2 - 8;
    ctx.fillStyle = dm ? 'rgba(14,22,34,.94)' : 'rgba(255,255,255,.95)';
    ctx.beginPath(); ctx.roundRect(10, sbY3, w - 20, sbH2, 11); ctx.fill();
    ctx.strokeStyle = active2 ? 'rgba(243,156,18,.4)' : 'rgba(0,0,0,.07)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(10, sbY3, w - 20, sbH2, 11); ctx.stroke();
    ctx.font = 'bold 15px Tajawal'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = active2 ? '#D4901A' : '#C0392B';
    ctx.fillText(active2 ? '🔊 الطنان يعمل! الجهد = ' + V2.toFixed(1) + ' V' : '🔇 الطنان لا يعمل — يحتاج ' + needed2 + ' V', w / 2, sbY3 + sbH2 / 2 - 8);
    ctx.font = '12px Tajawal'; ctx.fillStyle = dm ? '#8AA8C0' : '#666';
    ctx.fillText('الجهد الحالي: ' + V2.toFixed(1) + ' V  |  الحد الأدنى: ' + needed2 + ' V', w / 2, sbY3 + sbH2 / 2 + 10);

    animFrame = requestAnimationFrame(draw2);
  }
  draw2();
}

// ═══════════════════════════════════════════════════════════════
// 5-7 · TAB 3: الجرس 🔔
// ═══════════════════════════════════════════════════════════════
function simVoltage3() {
  cancelAnimationFrame(animFrame);
  var VS3 = { n: 1, t: 0, maxN: 6, deviceV: 6.0, ringing: false, audioCtx: null, osc: null, osc2: null, gainNode: null, lfoOsc: null, lfoGain: null };
  simState = VS3;

  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔔 الجرس يحتاج: 6 V</div>
      <div style="background:rgba(142,68,173,.1);border:1.5px solid rgba(142,68,173,.3);border-radius:10px;padding:10px;font-size:12px;color:var(--text-secondary);line-height:1.7">
        الجرس يحتاج <strong style="color:#8E44AD">6V كحدٍّ أدنى</strong><br>
        يحتاج 4 خلايا على التوالي!
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🔋 أضف خلايا (1 ← 6)</div>
      <div style="display:flex;align-items:center;gap:10px;justify-content:center;margin:6px 0">
        <button onclick="if(window._vs3&&window._vs3.n>1){window._vs3.n--;window._vs3._updateBellSound();}" style="width:36px;height:36px;border-radius:50%;border:2px solid var(--border-color);background:var(--surface);font-size:18px;cursor:pointer;font-family:Tajawal">−</button>
        <span id="vs3-count" style="font-size:22px;font-weight:700;color:var(--text-primary);min-width:32px;text-align:center">1</span>
        <button onclick="if(window._vs3&&window._vs3.n<6){window._vs3.n++;window._vs3._updateBellSound();}" style="width:36px;height:36px;border-radius:50%;border:2px solid var(--border-color);background:var(--surface);font-size:18px;cursor:pointer;font-family:Tajawal">+</button>
      </div>
      <div id="vs3-volt" style="text-align:center;font-size:13px;color:#8E44AD;font-weight:700">⚡ 1.5 V</div>
    </div>
    <div id="vs3-msg" style="padding:8px 12px;border-radius:10px;font-size:13px;font-family:Tajawal;text-align:center;margin-top:4px;background:rgba(192,57,43,.08);color:#C0392B;border:1.5px solid rgba(192,57,43,.2)">
      🔕 الجرس لا يعمل — أضف المزيد من الخلايا
    </div>
  `);
  window._vs3 = VS3;
  window._stopCurrentSim = function() { VS3._stopBell(); };

  // ── صوت الجرس: نغمة دينغ-دونغ تتكرر وتزداد قوة مع الجهد ──
  VS3._updateBellSound = function() {
    var V3 = VS3.n * 1.5, active3 = V3 >= 6.0;
    var vol = active3 ? Math.min(0.35, 0.08 + ((V3 - 6) / 3) * 0.27) : 0;
    var pitch = active3 ? 520 + (V3 - 6) * 55 : 520; // كلما زاد الجهد ارتفعت النغمة

    if (active3 && !VS3.ringing) {
      // إنشاء audio context وبدء صوت الجرس
      try {
        VS3.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        VS3._ringBell(vol, pitch);
        VS3.ringing = true;
        // جدولة رنّات متكررة
        VS3._bellInterval = setInterval(function() {
          if (!VS3.ringing || currentSim !== 'g6voltage') { clearInterval(VS3._bellInterval); return; }
          var V = VS3.n * 1.5;
          if (V >= 6.0) VS3._ringBell(Math.min(0.35, 0.08 + ((V-6)/3)*0.27), 520 + (V-6)*55);
        }, 1200);
      } catch(ex) {}
    } else if (active3 && VS3.ringing) {
      // تحديث مستوى الصوت فقط — الرنين مستمر
    } else if (!active3 && VS3.ringing) {
      VS3._stopBell();
    }
  };

  VS3._ringBell = function(vol, pitch) {
    if (!VS3.audioCtx) return;
    try {
      // النغمة الأولى (ding)
      var o1 = VS3.audioCtx.createOscillator();
      var g1 = VS3.audioCtx.createGain();
      o1.type = 'sine'; o1.frequency.value = pitch;
      g1.gain.setValueAtTime(vol, VS3.audioCtx.currentTime);
      g1.gain.exponentialRampToValueAtTime(0.001, VS3.audioCtx.currentTime + 0.6);
      o1.connect(g1); g1.connect(VS3.audioCtx.destination);
      o1.start(); o1.stop(VS3.audioCtx.currentTime + 0.65);

      // النغمة الثانية (dong) بعد 0.35 ثانية — أخفض بقليل
      var o2 = VS3.audioCtx.createOscillator();
      var g2 = VS3.audioCtx.createGain();
      o2.type = 'sine'; o2.frequency.value = pitch * 0.75;
      g2.gain.setValueAtTime(vol * 0.85, VS3.audioCtx.currentTime + 0.35);
      g2.gain.exponentialRampToValueAtTime(0.001, VS3.audioCtx.currentTime + 0.95);
      o2.connect(g2); g2.connect(VS3.audioCtx.destination);
      o2.start(VS3.audioCtx.currentTime + 0.35); o2.stop(VS3.audioCtx.currentTime + 1.0);
    } catch(ex) {}
  };

  VS3._stopBell = function() {
    try { clearInterval(VS3._bellInterval); } catch(ex) {}
    VS3.ringing = false;
    try { if(VS3.audioCtx) VS3.audioCtx.close(); } catch(ex) {}
    VS3.audioCtx = null;
  };

  // تسجيل دالة الإيقاف في النظام العام حتى تُستدعى عند تبديل التاب
  window._stopCurrentSim = function() { VS3._stopBell(); };

  function draw3() {
    if (currentSim !== 'g6voltage' || currentTab !== 2) { VS3._stopBell(); cancelAnimationFrame(animFrame); return; }
    if (!simState || simState !== VS3) { animFrame = requestAnimationFrame(draw3); return; }
    VS3.t += 0.04;
    var ctx = elCtx(), w = elW(), h = elH(), dm = isDarkMode();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = dm ? '#0E1620' : '#F5F8FF'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = dm ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)';
    for (var gx = 24; gx < w; gx += 28) for (var gy = 24; gy < h; gy += 28) { ctx.beginPath(); ctx.arc(gx, gy, 1.3, 0, Math.PI * 2); ctx.fill(); }

    var V3 = VS3.n * 1.5, needed3 = 6.0, active3 = V3 >= needed3;
    var intens3 = active3 ? Math.min(1, (V3 - needed3 + 1.5) / 4.5) : 0;
    var cx = w / 2, cy = h * 0.40;
    var batX3 = cx - 145, batY3 = cy, bellX = cx + 105, bellY = cy;
    var wireY1 = cy - 78, wireY2 = cy + 58;

    var wCol3 = active3 ? '#8E44AD' : (dm ? '#4A6080' : '#90A0B0');
    if (active3) { ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(142,68,173,.5)'; }
    ctx.strokeStyle = wCol3; ctx.lineWidth = active3 ? 3.5 : 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(batX3, batY3 - 18); ctx.lineTo(batX3, wireY1); ctx.lineTo(bellX, wireY1); ctx.lineTo(bellX, bellY - 30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(batX3, batY3 + 18); ctx.lineTo(batX3, wireY2); ctx.lineTo(bellX, wireY2); ctx.lineTo(bellX, bellY + 30); ctx.stroke();
    ctx.shadowBlur = 0;

    // إلكترونات
    if (active3) {
      var path3=[{x:batX3,y:batY3-18},{x:batX3,y:wireY1},{x:bellX,y:wireY1},{x:bellX,y:bellY-30},{x:bellX,y:bellY+30},{x:bellX,y:wireY2},{x:batX3,y:wireY2},{x:batX3,y:batY3+18}];
      var tLen3=0; for(var pi=0;pi<path3.length-1;pi++) tLen3+=Math.hypot(path3[pi+1].x-path3[pi].x,path3[pi+1].y-path3[pi].y);
      for(var ei=0;ei<9;ei++){var et3=((VS3.t*0.48*intens3+ei/9)%1),ed3=et3*tLen3,acc3=0;for(var pi2=0;pi2<path3.length-1;pi2++){var sL=Math.hypot(path3[pi2+1].x-path3[pi2].x,path3[pi2+1].y-path3[pi2].y);if(acc3+sL>=ed3){var f4=(ed3-acc3)/sL;ctx.fillStyle='rgba(180,100,255,.85)';ctx.beginPath();ctx.arc(path3[pi2].x+(path3[pi2+1].x-path3[pi2].x)*f4,path3[pi2].y+(path3[pi2+1].y-path3[pi2].y)*f4,4,0,Math.PI*2);ctx.fill();break;}acc3+=sL;}}
    }

    _drawBatteryStack(ctx, batX3, batY3, VS3.n, dm);
    _drawBell(ctx, bellX, bellY, active3, intens3, VS3.t, dm);

    // حلقات الصوت — تكبر مع الجهد
    if (active3) {
      var numWaves = 3 + Math.floor(intens3 * 2); // 3-5 موجات حسب القوة
      for (var wi = 1; wi <= numWaves; wi++) {
        var wr = 28 + wi * 16 + ((VS3.t * 30) % 16);
        var wa = Math.max(0, (0.8 - wi * 0.14) * intens3);
        ctx.strokeStyle = 'rgba(142,68,173,' + wa + ')';
        ctx.lineWidth = 1.5 + intens3;
        ctx.beginPath(); ctx.arc(bellX + 5, bellY, wr, -Math.PI * 0.55, Math.PI * 0.55); ctx.stroke();
      }
    }

    // مقياس الجهد — الشريط الكامل = needed3 (6V)
    var barW = w * 0.58, barH = 16, barX2 = cx - barW / 2, barY2 = h * 0.76;
    ctx.fillStyle = dm ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)';
    ctx.beginPath(); ctx.roundRect(barX2, barY2, barW, barH, barH/2); ctx.fill();
    var prog = Math.min(1, V3 / needed3);
    if (prog > 0) {
      var barGrad = ctx.createLinearGradient(barX2, 0, barX2 + barW, 0);
      barGrad.addColorStop(0, '#E74C3C');
      barGrad.addColorStop(0.65, '#E67E22');
      barGrad.addColorStop(1, '#8E44AD');
      ctx.fillStyle = barGrad;
      ctx.beginPath(); ctx.roundRect(barX2, barY2, barW * prog, barH, barH/2); ctx.fill();
    }
    // علامة نهاية الشريط = 6V دائماً
    ctx.strokeStyle = '#8E44AD'; ctx.lineWidth = 2.5; ctx.setLineDash([5, 3]);
    ctx.beginPath(); ctx.moveTo(barX2 + barW, barY2 - 7); ctx.lineTo(barX2 + barW, barY2 + barH + 7); ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = 'bold 13px Tajawal'; ctx.fillStyle = '#8E44AD'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText(needed3 + ' V', barX2 + barW, barY2 - 4);
    // قيمة الجهد الحالية فوق نهاية الشريط المملوء (فقط إذا أقل من 6V)
    if (!active3 && prog > 0.05) {
      var curX = barX2 + barW * prog;
      ctx.font = 'bold 12px Tajawal'; ctx.fillStyle = '#E67E22'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(V3.toFixed(1) + 'V', curX, barY2 - 3);
    }
    // تسمية مستوى الصوت
    if (active3) {
      var volLabel = V3 <= 6 ? '🔔 هادئ' : V3 <= 7.5 ? '🔔🔔 متوسط' : '🔔🔔🔔 عالٍ جداً!';
      ctx.font = 'bold 14px Tajawal'; ctx.fillStyle = '#8E44AD'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(volLabel, cx, barY2 + barH + 6);
    }

    var cEl=document.getElementById('vs3-count'),vEl=document.getElementById('vs3-volt'),mEl=document.getElementById('vs3-msg');
    if(cEl)cEl.textContent=VS3.n;
    if(vEl){vEl.textContent='⚡ '+V3.toFixed(1)+' V';vEl.style.color=active3?'#8E44AD':'#C0392B';}
    if(mEl){
      if(active3){mEl.style.background='rgba(142,68,173,.1)';mEl.style.color='#8E44AD';mEl.style.borderColor='rgba(142,68,173,.3)';mEl.textContent='🔔 الجرس يرنّ! الجهد = '+V3.toFixed(1)+' V'+(intens3>0.5?' — الرنين قوي جداً!':'');}
      else{mEl.style.background='rgba(192,57,43,.08)';mEl.style.color='#C0392B';mEl.style.borderColor='rgba(192,57,43,.2)';mEl.textContent='🔕 الجهد غير كافٍ ('+V3.toFixed(1)+'V < '+needed3+'V) — يحتاج '+(Math.ceil((needed3-V3)/1.5))+' خلايا إضافية';}
    }

    var sbH3=56,sbY4=h-sbH3-8;
    ctx.fillStyle=dm?'rgba(14,22,34,.94)':'rgba(255,255,255,.95)';
    ctx.beginPath();ctx.roundRect(10,sbY4,w-20,sbH3,11);ctx.fill();
    ctx.strokeStyle=active3?'rgba(142,68,173,.4)':'rgba(0,0,0,.07)';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.roundRect(10,sbY4,w-20,sbH3,11);ctx.stroke();
    ctx.font='bold 16px Tajawal';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillStyle=active3?'#8E44AD':'#C0392B';
    ctx.fillText(active3?'🔔 الجرس يرنّ! '+V3.toFixed(1)+' V':'🔕 لا يعمل — الجهد الحالي '+V3.toFixed(1)+' V من أصل '+needed3+' V',w/2,sbY4+sbH3/2-9);
    ctx.font='13px Tajawal';ctx.fillStyle=dm?'#8AA8C0':'#666';
    ctx.fillText('الجهد الحالي: '+V3.toFixed(1)+' V  |  الحد الأدنى: '+needed3+' V  |  عدد الخلايا: '+VS3.n,w/2,sbY4+sbH3/2+11);
    animFrame=requestAnimationFrame(draw3);
  }
  draw3();
}

// ═══════════════════════════════════════════════════════════════
// 5-7 · TAB 4: ماذا تستنتج؟ 🧠
// ═══════════════════════════════════════════════════════════════
function simVoltage4() {
  cancelAnimationFrame(animFrame);
  simState = { t: 0 };

  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧠 ماذا تعلّمنا؟</div>
      <div style="display:flex;flex-direction:column;gap:8px;font-size:13px;color:var(--text-primary);line-height:1.8">
        <div style="background:rgba(39,174,96,.1);border-right:3px solid #27AE60;padding:8px 10px;border-radius:6px">
          💡 <strong>المصباح</strong><br>
          <span style="color:var(--text-secondary)">يحتاج 1.5 V — خلية واحدة</span>
        </div>
        <div style="background:rgba(212,144,26,.1);border-right:3px solid #D4901A;padding:8px 10px;border-radius:6px">
          🔔 <strong>الطنان</strong><br>
          <span style="color:var(--text-secondary)">يحتاج 3 V — خليتان</span>
        </div>
        <div style="background:rgba(142,68,173,.1);border-right:3px solid #8E44AD;padding:8px 10px;border-radius:6px">
          🔕 <strong>الجرس</strong><br>
          <span style="color:var(--text-secondary)">يحتاج 6 V — 4 خلايا</span>
        </div>
      </div>
    </div>
    <div class="info-box" style="margin-top:8px;font-size:12px;line-height:1.7">
      ⚡ <strong>القاعدة:</strong><br>
      الجهد = عدد الخلايا × 1.5 V
    </div>
  `);

  function draw4() {
    if (currentSim !== 'g6voltage') { cancelAnimationFrame(animFrame); return; }
    simState.t += 0.018;
    var ctx = elCtx(), w = elW(), h = elH(), dm = isDarkMode();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = dm ? '#0E1620' : '#F5F8FF'; ctx.fillRect(0, 0, w, h);

    // نقاط الخلفية
    ctx.fillStyle = dm ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.04)';
    for (var gx = 30; gx < w; gx += 32) for (var gy = 30; gy < h; gy += 32) { ctx.beginPath(); ctx.arc(gx, gy, 1.4, 0, Math.PI * 2); ctx.fill(); }

    var t = simState.t;
    var pad = 14;

    // ── عنوان ──
    ctx.font = 'bold 20px Tajawal'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillStyle = dm ? '#E8F4FF' : '#1A2A3A';
    ctx.fillText('📌 الجهد الكهربائي والأجهزة', w / 2, pad);

    // ── البطاقات الثلاث ──
    var devices = [
      { label: 'مصباح', sub: 'يضيء', emoji: '💡', needed: 1.5, cells: 1, color: '#27AE60', bg: 'rgba(39,174,96,' },
      { label: 'طنان',  sub: 'يطنّ',  emoji: '🔔', needed: 3.0, cells: 2, color: '#D4901A', bg: 'rgba(212,144,26,' },
      { label: 'جرس',   sub: 'يرنّ',  emoji: '🔕', needed: 6.0, cells: 4, color: '#8E44AD', bg: 'rgba(142,68,173,' },
    ];

    var topY   = pad + 38;          // بداية البطاقات
    var cardGap = 10;
    var cardW  = (w - pad * 2 - cardGap * 2) / 3;
    var cardH  = Math.min(h * 0.50, 240);   // حد أقصى للارتفاع

    // نقاط Y ثابتة داخل البطاقة
    var emojiY  = topY + 10;          // إيموجي
    var nameY   = topY + 56;          // اسم الجهاز
    var subY    = topY + 82;          // فعل الجهاز (يضيء / يطنّ...)
    var barY    = topY + 110;         // شريط الجهد
    var voltY   = barY + 18;          // قيمة الجهد
    var cellsY  = topY + cardH - 32;  // صف الخلايا في الأسفل

    devices.forEach(function(d, i) {
      var cardX = pad + i * (cardW + cardGap);
      var cx2   = cardX + cardW / 2;
      var pulse = 1 + Math.sin(t * 1.8 + i * 1.2) * 0.012;

      // ── رسم البطاقة ──
      ctx.save();
      ctx.translate(cx2, topY + cardH / 2);
      ctx.scale(pulse, pulse);
      ctx.translate(-cx2, -(topY + cardH / 2));

      ctx.fillStyle = dm ? d.bg + '.12)' : d.bg + '.08)';
      ctx.strokeStyle = d.color + '99';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.roundRect(cardX, topY, cardW, cardH, 14); ctx.fill(); ctx.stroke();

      // شريط علوي ملوّن
      ctx.fillStyle = d.color;
      ctx.beginPath(); ctx.roundRect(cardX, topY, cardW, 6, [14, 14, 0, 0]); ctx.fill();
      ctx.restore();

      // ── إيموجي ──
      ctx.font = '36px serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(d.emoji, cx2, emojiY);

      // ── اسم الجهاز ──
      ctx.font = 'bold 18px Tajawal';
      ctx.fillStyle = d.color; ctx.textBaseline = 'top';
      ctx.fillText(d.label, cx2, nameY);

      // ── فعل الجهاز ──
      ctx.font = '13px Tajawal';
      ctx.fillStyle = dm ? '#9ABAD0' : '#556677'; ctx.textBaseline = 'top';
      ctx.fillText(d.sub, cx2, subY);

      // ── شريط الجهد ──
      var bW = cardW - 20, bH = 11, bX = cx2 - bW / 2;
      ctx.fillStyle = dm ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.09)';
      ctx.beginPath(); ctx.roundRect(bX, barY, bW, bH, bH / 2); ctx.fill();
      var pr = d.needed / 6.0;
      var grd = ctx.createLinearGradient(bX, 0, bX + bW, 0);
      grd.addColorStop(0, d.color + '80'); grd.addColorStop(pr, d.color); grd.addColorStop(1, dm ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.05)');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.roundRect(bX, barY, bW * pr, bH, bH / 2); ctx.fill();

      // ── قيمة الجهد ──
      ctx.font = 'bold 20px Tajawal';
      ctx.fillStyle = d.color; ctx.textBaseline = 'top';
      ctx.fillText(d.needed + ' V', cx2, voltY);

      // ── عدد الخلايا ──
      ctx.font = 'bold 13px Tajawal';
      ctx.fillStyle = dm ? '#8AAFC8' : '#445566'; ctx.textBaseline = 'top';
      ctx.fillText(d.cells + ' خلية', cx2, voltY + 26);

      // ── خلايا مرسومة في الأسفل ──
      var cW = 12, cH = 20, cGap = 3;
      var totalCW = d.cells * cW + (d.cells - 1) * cGap;
      var cStart = cx2 - totalCW / 2;
      for (var bi = 0; bi < d.cells; bi++) {
        var bx3 = cStart + bi * (cW + cGap);
        ctx.fillStyle = d.color;
        ctx.strokeStyle = dm ? 'rgba(255,255,255,.3)' : 'rgba(0,0,0,.18)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(bx3, cellsY, cW, cH, 3); ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.9)';
        ctx.font = 'bold 7px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText('+', bx3 + cW - 3, cellsY + 1);
      }
    });

    // ── قسم الاستنتاج ──
    var concY = topY + cardH + 14;
    var concH = h - concY - 12;

    ctx.fillStyle = dm ? 'rgba(26,143,168,.12)' : 'rgba(26,143,168,.07)';
    ctx.strokeStyle = 'rgba(26,143,168,.35)'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.roundRect(pad, concY, w - pad * 2, concH, 14); ctx.fill(); ctx.stroke();

    // عنوان الاستنتاج
    ctx.font = 'bold 20px Tajawal'; ctx.fillStyle = '#1A8FA8';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('🧠 الاستنتاج', w / 2, concY + 10);

    // خط فاصل
    ctx.strokeStyle = 'rgba(26,143,168,.25)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad + 20, concY + 38); ctx.lineTo(w - pad - 20, concY + 38); ctx.stroke();

    // نص الاستنتاج — خط 17px واضح
    var lineH = 28;
    var lines = [
      { text: 'كلّما زاد عدد الخلايا → زاد الجهد', bold: true, color: dm ? '#C8E8F0' : '#1A3A4A' },
      { text: 'كلّما زاد الجهد → عمل الجهاز بكفاءة أعلى', bold: false, color: dm ? '#AAC8D8' : '#2A4A5A' },
      { text: '⚡  الجهد = عدد الخلايا × 1.5 فولت', bold: true, color: '#1A8FA8' },
    ];
    lines.forEach(function(ln, i) {
      ctx.font = (ln.bold ? 'bold ' : '') + '17px Tajawal';
      ctx.fillStyle = ln.color;
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(ln.text, w / 2, concY + 46 + i * lineH);
    });

    animFrame = requestAnimationFrame(draw4);
  }
  draw4();
}

// ── دوال مساعدة لرسم المكونات (تُستخدم في استقصاء الجهد) ──
function _drawBatteryStack(ctx, cx, cy, n, dm) {
  var totalW = Math.min(20 + n * 14, 120), bh = 36;
  var g = ctx.createLinearGradient(cx - totalW/2, cy - bh/2, cx - totalW/2, cy + bh/2);
  g.addColorStop(0, dm?'#3A4A5A':'#6C8CA0'); g.addColorStop(0.5, dm?'#5A7A9A':'#A8C8D8'); g.addColorStop(1, dm?'#2A3A4A':'#4A6878');
  ctx.fillStyle = g; ctx.strokeStyle = dm?'#4A6A8A':'#3A5A70'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(cx - totalW/2, cy - bh/2, totalW, bh, 5); ctx.fill(); ctx.stroke();
  // خطوط الخلايا
  for (var i = 1; i < n; i++) {
    var sx = cx - totalW/2 + i * (totalW / n);
    ctx.strokeStyle = dm?'rgba(255,255,255,.2)':'rgba(0,0,0,.2)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(sx, cy - bh/2 + 3); ctx.lineTo(sx, cy + bh/2 - 3); ctx.stroke();
  }
  ctx.fillStyle = '#D4901A'; ctx.beginPath(); ctx.roundRect(cx - 5, cy - bh/2, 10, bh, 0); ctx.fill();
  ctx.font = 'bold 8px Arial'; ctx.textAlign = 'center'; ctx.fillStyle = 'white'; ctx.textBaseline = 'middle';
  ctx.fillText(n > 1 ? (n*1.5).toFixed(1)+'V' : '1.5V', cx, cy);
  ctx.fillStyle = '#E74C3C'; ctx.beginPath(); ctx.roundRect(cx + totalW/2, cy - 7, 10, 14, 3); ctx.fill();
  ctx.fillStyle = 'white'; ctx.font = 'bold 10px Arial'; ctx.fillText('+', cx + totalW/2 + 5, cy + 1);
  ctx.fillStyle = '#555'; ctx.beginPath(); ctx.roundRect(cx - totalW/2 - 10, cy - 7, 10, 14, 3); ctx.fill();
  ctx.fillStyle = 'white'; ctx.font = 'bold 12px Arial'; ctx.fillText('−', cx - totalW/2 - 5, cy + 1);
  ctx.font = 'bold 11px Tajawal'; ctx.fillStyle = dm?'#8AAAC0':'#445566';
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText(n + ' خلية', cx, cy + bh/2 + 5);
}

function _drawBulbV(ctx, cx, cy, brightness, dm) {
  var R = 22, lbr = brightness;
  if (lbr > 0.05) { ctx.shadowBlur = 30 * lbr; ctx.shadowColor = 'rgba(255,230,50,' + (lbr * .9) + ')'; var glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 2.5); glow.addColorStop(0, 'rgba(255,255,100,' + (lbr * .4) + ')'); glow.addColorStop(1, 'rgba(255,200,0,0)'); ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, R * 2.5, 0, Math.PI * 2); ctx.fill(); }
  var bg = ctx.createRadialGradient(cx - R * .3, cy - R * .3, 1, cx, cy, R);
  if (lbr > 0.05) { bg.addColorStop(0, 'rgba(255,255,180,.95)'); bg.addColorStop(0.5, 'rgba(255,' + (200 + lbr * 55 | 0) + ',20,.9)'); bg.addColorStop(1, 'rgba(220,140,0,.7)'); }
  else { bg.addColorStop(0, dm ? 'rgba(80,100,120,.7)' : 'rgba(220,230,240,.9)'); bg.addColorStop(1, dm ? 'rgba(40,60,80,.6)' : 'rgba(180,195,210,.7)'); }
  ctx.shadowBlur = 0; ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(cx, cy - 4, R, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = lbr > .05 ? 'rgba(200,130,0,.7)' : (dm ? 'rgba(100,130,150,.6)' : 'rgba(140,160,180,.7)'); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy - 4, R, 0, Math.PI * 2); ctx.stroke();
  if (lbr > .05) { ctx.strokeStyle = 'rgba(255,250,100,' + (.5 + lbr * .5) + ')'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx - 5, cy + 4); ctx.lineTo(cx - 1, cy - 4); ctx.lineTo(cx + 3, cy + 2); ctx.lineTo(cx + 6, cy - 6); ctx.stroke(); }
  ctx.fillStyle = dm ? '#4A5A6A' : '#8A9AAA'; ctx.beginPath(); ctx.roundRect(cx - 9, cy + R - 5, 18, 14, 2); ctx.fill();
  ctx.font = 'bold 11px Tajawal'; ctx.fillStyle = dm ? '#8AAAC0' : '#445566'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText('مصباح', cx, cy + R + 12);
}

function _drawBuzzer(ctx, cx, cy, active, intensity, t, dm) {
  var r = 22;
  var g = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
  if (active) { g.addColorStop(0, '#F39C12'); g.addColorStop(1, '#E67E22'); ctx.shadowBlur = 15 * intensity; ctx.shadowColor = 'rgba(243,156,18,.6)'; }
  else { g.addColorStop(0, dm ? '#4A5A6A' : '#9AAABA'); g.addColorStop(1, dm ? '#2A3A4A' : '#6A7A8A'); }
  ctx.fillStyle = g; ctx.strokeStyle = active ? '#D4901A' : (dm ? '#3A4A5A' : '#5A6A7A'); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;
  // ثقب الطنان
  ctx.fillStyle = active ? 'rgba(0,0,0,.5)' : 'rgba(0,0,0,.3)';
  ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill();
  // اهتزاز
  if (active) {
    var shk = Math.sin(t * 20) * 2 * intensity;
    ctx.strokeStyle = 'rgba(255,200,0,.4)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx + shk, cy, r + 5, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.font = 'bold 11px Tajawal'; ctx.fillStyle = dm ? '#8AAAC0' : '#445566'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText('طنان', cx, cy + r + 5);
}

function _drawBell(ctx, cx, cy, active, intensity, t, dm) {
  var shk = active ? Math.sin(t * 18) * 6 * intensity : 0;
  ctx.save();
  ctx.translate(cx + shk, cy);

  var r = 28; // نصف قطر القبة

  // ── ظل/توهج ──
  if (active) { ctx.shadowBlur = 18 * intensity; ctx.shadowColor = 'rgba(142,68,173,.7)'; }

  // ── جسم الجرس: قبة نصف بيضاوية + جانبان متسعان ──
  var bellColor = active ? '#9B59B6' : (dm ? '#5A6A7A' : '#95A5A6');
  var bellStroke = active ? '#6C3483' : (dm ? '#3A4A5A' : '#6A7A8A');
  ctx.fillStyle = bellColor;
  ctx.strokeStyle = bellStroke;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  // من اليسار السفلي → قوس علوي → اليمين السفلي → حافة سفلية متسعة
  ctx.moveTo(-r - 8, 10);
  ctx.quadraticCurveTo(-r - 12, -r * 0.3, -r * 0.5, -r - 4);
  ctx.quadraticCurveTo(0, -r - 14, r * 0.5, -r - 4);
  ctx.quadraticCurveTo(r + 12, -r * 0.3, r + 8, 10);
  ctx.lineTo(-r - 8, 10);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;

  // ── بريق علوي ──
  if (active) {
    var shine = ctx.createLinearGradient(-r * 0.3, -r - 14, r * 0.2, -r * 0.3);
    shine.addColorStop(0, 'rgba(255,255,255,.35)');
    shine.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shine;
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, -r - 4);
    ctx.quadraticCurveTo(0, -r - 12, r * 0.3, -r - 4);
    ctx.quadraticCurveTo(r * 0.1, -r * 0.4, -r * 0.3, -r - 4);
    ctx.fill();
  }

  // ── قاعدة عريضة ──
  ctx.fillStyle = active ? '#7D3C98' : (dm ? '#3A4A5A' : '#7F8C8D');
  ctx.strokeStyle = bellStroke; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(-r - 10, 10, (r + 10) * 2, 10, [0, 0, 5, 5]); ctx.fill(); ctx.stroke();

  // ── عروة الجرس (الحلقة العلوية) ──
  ctx.strokeStyle = active ? '#5B2C6F' : (dm ? '#2A3A4A' : '#566573');
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, -r - 10, 5, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = active ? '#7D3C98' : (dm ? '#3A4A5A' : '#7F8C8D');
  ctx.fill();

  // ── قضيب الطارق ──
  ctx.strokeStyle = active ? '#4A235A' : (dm ? '#2A3A4A' : '#5D6D7E');
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(shk * 0.6, 12); ctx.stroke();

  // ── رأس الطارق ──
  var clapperColor = active ? '#E74C3C' : (dm ? '#4A5A6A' : '#85929E');
  ctx.fillStyle = clapperColor;
  if (active) { ctx.shadowBlur = 8 * intensity; ctx.shadowColor = 'rgba(231,76,60,.6)'; }
  ctx.beginPath(); ctx.arc(shk * 0.6, 14, 5, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  ctx.restore();

  // ── تسمية ──
  ctx.font = 'bold 12px Tajawal'; ctx.fillStyle = dm ? '#8AAAC0' : '#445566';
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText('جرس', cx, cy + 24);
}

// 5-8 TAB 1: طول السلك (شريط قابل للسحب)
function simWireLength1() {
  cancelAnimationFrame(animFrame);
  simState={t:0,len:10,dragging:false,handleX:0};
  var measurements=[];

  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">📏 اسحب نهاية السلك لتغيير طوله</div>
      <div style="font-size:13px;color:#777;text-align:center">أو استخدم الأزرار:</div>
      <div style="display:flex;align-items:center;gap:10px;justify-content:center;margin:8px 0">
        <button onclick="simState.len=Math.max(5,simState.len-5);" style="width:36px;height:36px;border-radius:50%;border:none;background:#E74C3C;color:white;font-size:18px;cursor:pointer">−</button>
        <span id="lenV" style="font-size:20px;font-weight:800;color:#1A8FA8;min-width:60px;text-align:center">10 cm</span>
        <button onclick="simState.len=Math.min(50,simState.len+5);" style="width:36px;height:36px;border-radius:50%;border:none;background:#27AE60;color:white;font-size:18px;cursor:pointer">+</button>
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">⚡ قراءة الأميتر</div>
      <div id="lenAm" style="text-align:center;font-size:22px;font-weight:800;color:#1A8FA8">— A</div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">📋 سجّل قياساتك</div>
      <button onclick="elRecordLen()" style="width:100%;padding:8px;border-radius:8px;background:rgba(26,143,168,.1);border:1.5px solid rgba(26,143,168,.3);color:#1A8FA8;font-family:Tajawal;font-size:13px;cursor:pointer">✏️ سجّل القياس الحالي</button>
      <div id="lenRecs" style="font-size:11px;margin-top:6px"></div>
    </div>
    <div class="info-box" style="font-size:13px">📖 ص٤٨: السلك الطويل له مقاومة أكبر → تيار أقل.</div>`);

  window.elRecordLen=function(){
    var R=0.5+simState.len*.04, I=1.5/R;
    measurements.push({len:simState.len,I:I.toFixed(3)});
    measurements.sort(function(a,b){return a.len-b.len;});
    var el=document.getElementById('lenRecs'); if(!el)return;
    var html='<table style="width:100%;border-collapse:collapse"><tr style="background:rgba(26,143,168,.1)"><th style="padding:3px;font-size:10px">الطول</th><th style="padding:3px;font-size:10px">التيار</th></tr>';
    measurements.forEach(function(m){ html+='<tr><td style="padding:3px;text-align:center">'+m.len+' cm</td><td style="padding:3px;text-align:center;color:#1A8FA8;font-weight:700">'+m.I+' A</td></tr>'; });
    html+='</table>'; el.innerHTML=html;
    try{U9Sound.ping(300+simState.len*4,.1,.1);}catch(ex){}
  };

  var cv=document.getElementById('simCanvas');
  function gp(e){var r=cv.getBoundingClientRect(),sc=cv.width/r.width,s=e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e;return{x:(s.clientX-r.left)*sc,y:(s.clientY-r.top)*sc};}
  function L(){var w=elW(),h=elH(); return{w,h,wx:w*.1,wex:w*.9,wy:h*.48,maxW:w*.8};}

  cv.addEventListener('mousedown',function(e){ var p=gp(e), l=L(), ex=l.wx+l.maxW*(simState.len/50); if(Math.abs(p.x-ex)<20&&Math.abs(p.y-l.wy)<20) simState.dragging=true; });
  cv.addEventListener('mousemove',function(e){ if(!simState.dragging)return; var p=gp(e),l=L(); var newLen=Math.round((p.x-l.wx)/l.maxW*50/5)*5; simState.len=Math.max(5,Math.min(50,newLen)); });
  cv.addEventListener('mouseup',function(){simState.dragging=false;});
  cv.addEventListener('touchstart',function(e){ e.preventDefault(); var p=gp(e),l=L(),ex=l.wx+l.maxW*(simState.len/50); if(Math.abs(p.x-ex)<24&&Math.abs(p.y-l.wy)<24) simState.dragging=true; },{passive:false});
  cv.addEventListener('touchmove',function(e){ if(!simState.dragging)return; e.preventDefault(); var p=gp(e),l=L(); var newLen=Math.round((p.x-l.wx)/l.maxW*50/5)*5; simState.len=Math.max(5,Math.min(50,newLen)); },{passive:false});
  cv.addEventListener('touchend',function(){simState.dragging=false;});

  function draw(){
    var c=elCtx(), l=L(), w=l.w, h=l.h;
    c.clearRect(0,0,w,h); c.fillStyle=isDarkMode()?'#141C28':'#F5F8FA'; c.fillRect(0,0,w,h);
    simState.t+=.04;
    var len=simState.len, R=0.5+len*.04, I=1.5/R, ratio=len/50;
    document.getElementById('lenV').textContent=len+' cm';
    document.getElementById('lenAm').textContent=I.toFixed(3)+' A';

    // ── السلك الأفقي ──
    var wx=l.wx, wy=l.wy, maxW=l.maxW;
    var wireEnd=wx+maxW*ratio;
    // مسار كامل (رمادي)
    c.strokeStyle='rgba(0,0,0,.08)'; c.lineWidth=9; c.lineCap='round';
    c.beginPath(); c.moveTo(wx,wy); c.lineTo(wx+maxW,wy); c.stroke();
    // السلك الفعلي
    c.strokeStyle='#B87333'; c.lineWidth=9;
    c.beginPath(); c.moveTo(wx,wy); c.lineTo(wireEnd,wy); c.stroke();
    // لمعة
    c.strokeStyle='rgba(255,255,255,.3)'; c.lineWidth=3;
    c.beginPath(); c.moveTo(wx,wy-2); c.lineTo(wireEnd,wy-2); c.stroke();
    // مقبض السحب
    c.shadowBlur=simState.dragging?12:4; c.shadowColor='rgba(26,143,168,.4)';
    c.fillStyle=simState.dragging?'#1A8FA8':'#E74C3C';
    c.beginPath(); c.arc(wireEnd,wy,10,0,Math.PI*2); c.fill();
    c.shadowBlur=0;
    c.fillStyle='white'; c.font='bold 12px Arial'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('↔',wireEnd,wy);
    // مشابك
    [wx,wireEnd].forEach(function(mx){ c.fillStyle='#E74C3C'; c.beginPath(); c.roundRect(mx-5,wy-14,10,28,3); c.fill(); });

    // تسمية
    c.strokeStyle='rgba(0,0,0,.3)'; c.lineWidth=1; c.setLineDash([4,4]);
    c.beginPath(); c.moveTo(wx,wy+18); c.lineTo(wireEnd,wy+18); c.stroke(); c.setLineDash([]);
    c.fillStyle=isDarkMode()?'#aaa':'#555'; c.font='bold 13px Tajawal'; c.textAlign='center'; c.textBaseline='top';
    c.fillText(len+' cm',(wx+wireEnd)/2,wy+20);

    // ── إلكترونات ──
    for(var ei=0;ei<Math.round(I*8);ei++){
      var et=((simState.t*I*1.5+ei/10))%1;
      c.fillStyle='rgba(0,200,255,'+(0.8-et*.4)+')'; c.beginPath(); c.arc(wx+maxW*ratio*et,wy,3.5,0,Math.PI*2); c.fill();
    }

    // ── الدائرة الكاملة (بطارية + أميتر + أسلاك توصيل) ──
    var circWireCol = I>.4?'#27AE60':'#E67E22';
    var topY = h*.18;
    var batCx = w*.5, batCy = topY;
    var amCx = wx, amCy = topY;

    // السلك العلوي الأيسر: من الأميتر للبطارية
    c.strokeStyle=circWireCol; c.lineWidth=3;
    c.beginPath(); c.moveTo(amCx, amCy); c.lineTo(batCx - 30, batCy); c.stroke();
    // السلك العلوي الأيمن: من البطارية لنهاية السلك التجريبي
    c.beginPath(); c.moveTo(batCx + 30, batCy); c.lineTo(wireEnd, topY); c.stroke();
    // السلك الرأسي الأيسر: من الأميتر لبداية السلك التجريبي
    c.beginPath(); c.moveTo(amCx, amCy + 14); c.lineTo(wx, wy); c.stroke();
    // السلك الرأسي الأيمن: من نهاية السلك التجريبي للدائرة العلوية
    c.beginPath(); c.moveTo(wireEnd, wy); c.lineTo(wireEnd, topY); c.stroke();

    // ── البطارية ──
    var bw=52, bh=26;
    c.fillStyle='#2C3E50'; c.beginPath(); c.roundRect(batCx-bw/2, batCy-bh/2-2, bw, bh+4, 6); c.fill();
    c.fillStyle='#E74C3C'; c.fillRect(batCx-bw/2+3, batCy-bh/2, 8, bh);
    c.fillStyle='#27AE60'; c.fillRect(batCx+bw/2-11, batCy-bh/2, 8, bh);
    c.fillStyle='#F39C12'; c.fillRect(batCx-bw/2+14, batCy-bh/2+2, bw-28, bh-4);
    c.fillStyle='white'; c.font='bold 9px Arial'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('1.5V', batCx, batCy);
    c.fillStyle='white'; c.font='bold 8px Arial';
    c.fillText('\u2212', batCx-bw/2+7, batCy); c.fillText('+', batCx+bw/2-7, batCy);
    c.fillStyle=isDarkMode()?'#aaa':'#555'; c.font='10px Tajawal'; c.textAlign='center'; c.textBaseline='top';
    c.fillText('\u0628\u0637\u0627\u0631\u064a\u0629', batCx, batCy+bh/2+5);

    // ── الأميتر (دائرة مع إبرة) ──
    var amR=18;
    c.fillStyle=isDarkMode()?'#1C2B3A':'#F0F4F8';
    c.strokeStyle='#1A8FA8'; c.lineWidth=2.5;
    c.beginPath(); c.arc(amCx, amCy, amR, 0, Math.PI*2); c.fill(); c.stroke();
    c.strokeStyle='rgba(26,143,168,.3)'; c.lineWidth=1;
    c.beginPath(); c.arc(amCx, amCy, amR+4, 0, Math.PI*2); c.stroke();
    c.fillStyle='#E74C3C'; c.font='bold 11px Arial'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('A', amCx, amCy-4);
    var needleAngle = -Math.PI*0.7 + (I/1.5)*Math.PI*1.4;
    c.strokeStyle='#E74C3C'; c.lineWidth=2; c.lineCap='round';
    c.beginPath(); c.moveTo(amCx, amCy+2);
    c.lineTo(amCx + Math.cos(needleAngle)*14, amCy + Math.sin(needleAngle)*14); c.stroke();
    c.strokeStyle=isDarkMode()?'#4A6580':'#999'; c.lineWidth=1;
    for(var ti=0;ti<=6;ti++){
      var ta=-Math.PI*0.7+(ti/6)*Math.PI*1.4;
      c.beginPath();
      c.moveTo(amCx+Math.cos(ta)*12, amCy+Math.sin(ta)*12);
      c.lineTo(amCx+Math.cos(ta)*(amR-2), amCy+Math.sin(ta)*(amR-2)); c.stroke();
    }
    c.fillStyle='#1A8FA8'; c.font='bold 11px Tajawal'; c.textAlign='center'; c.textBaseline='top';
    c.fillText(I.toFixed(3)+' A', amCx, amCy+amR+6);
    c.fillStyle=isDarkMode()?'#aaa':'#555'; c.font='10px Tajawal';
    c.fillText('\u0623\u0645\u064a\u062a\u0631', amCx, amCy+amR+18);

    // ── خلاصة ──
    c.fillStyle=isDarkMode()?'rgba(20,28,40,.85)':'rgba(255,255,255,.85)';
    c.beginPath(); c.roundRect(w*.04,h*.6,w*.92,h*.36,12); c.fill();
    c.font='bold 14px Tajawal'; c.fillStyle=isDarkMode()?'#E8F2FA':'#1E2D3D'; c.textAlign='center'; c.textBaseline='top';
    c.fillText(len+' cm → مقاومة '+R.toFixed(2)+' Ω → تيار '+I.toFixed(3)+' A',w/2,h*.62);
    var bY=h*.72,bH=h*.07;
    c.fillStyle='rgba(0,0,0,.06)'; c.beginPath(); c.roundRect(w*.1,bY,w*.8,bH,bH/2); c.fill();
    var bf=I/1.5;
    var bg=c.createLinearGradient(w*.1,bY,w*.1+w*.8*bf,bY);
    bg.addColorStop(0,'rgba(39,174,96,.8)'); bg.addColorStop(1,'rgba(26,143,168,.8)');
    c.fillStyle=bg; c.beginPath(); c.roundRect(w*.1,bY,w*.8*bf,bH,bH/2); c.fill();
    if(bf>.15){ c.font='bold 11px Tajawal'; c.fillStyle='white'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('التيار',w*.5,bY+bH/2); }
    c.font='13px Tajawal'; c.fillStyle=isDarkMode()?'#8AA8C0':'#666'; c.textAlign='center'; c.textBaseline='top';
    c.fillText(len>25?'السلك الطويل: مقاومة أكبر → تيار أقل ↓':'السلك القصير: مقاومة أقل → تيار أكبر ↑',w/2,h*.81);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// 5-8 TAB 2: سُمك السلك
function simWireLength2() {
  cancelAnimationFrame(animFrame);
  var wires=[
    {label:'رفيع جداً (0.5mm)',  th:.5, R:2.8, col:'#E74C3C'},
    {label:'رفيع (1mm)',         th:1,  R:1.4, col:'#E67E22'},
    {label:'متوسط (2mm)',        th:2,  R:.8,  col:'#F1C40F'},
    {label:'سميك (3mm)',         th:3,  R:.5,  col:'#27AE60'},
    {label:'سميك جداً (4mm)',    th:4,  R:.35, col:'#1A8FA8'},
  ];
  simState={t:0,sel:1};
  var localWires=wires;

  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔗 اختر سُمك السلك</div>
      ${wires.map(function(ww,i){ return '<button id="wb'+i+'" onclick="simState.sel='+i+';try{U9Sound.ping();}catch(e){}" style="width:100%;padding:9px 10px;border-radius:10px;border:2px solid rgba(0,0,0,.1);background:white;font-family:Tajawal;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:8px;margin-bottom:5px;transition:all .2s"><span style="display:inline-block;height:'+(ww.th*4+4)+'px;width:32px;background:'+ww.col+';border-radius:3px"></span><span style="flex:1;text-align:right">'+ww.label+'</span><span style="font-size:11px;color:#888">'+ww.R+' Ω</span></button>'; }).join('')}
    </div>
    <div class="info-box" style="font-size:13px">
      📖 ص٤٨: السلك السميك = مقاومة أقل = تيار أكبر.<br>
      (مثل الخرطوم السميك: ماء أكثر!)
    </div>
    <div class="q-box" style="font-size:13px">
      <strong>❓</strong> لماذا كابلات تمديد الكهرباء سميكة؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 الإجابة</button>
      <div class="q-ans-panel">السلك السميك يحمل تياراً أكبر دون أن يسخن أو يحترق، وهذا يمنع الحرائق الكهربائية.</div>
    </div>`);

  var cv=document.getElementById('simCanvas');
  function draw(){
    var c=elCtx(),w=elW(),h=elH();
    c.clearRect(0,0,w,h); c.fillStyle=isDarkMode()?'#141C28':'#F5F8FA'; c.fillRect(0,0,w,h);
    simState.t+=.04;
    var ww=localWires[simState.sel], I=1.5/ww.R;
    // تحديث الأزرار
    localWires.forEach(function(_,i){ var b=document.getElementById('wb'+i); if(b){b.style.borderColor=i===simState.sel?'#1A8FA8':'rgba(0,0,0,.1)';b.style.background=i===simState.sel?'rgba(26,143,168,.08)':'white';}});

    // ── السلك الرئيسي ──
    var wx=w*.1,wy=h*.48,ww2=w*.8;
    c.strokeStyle=ww.col; c.lineWidth=ww.th*7; c.lineCap='round';
    c.beginPath(); c.moveTo(wx,wy); c.lineTo(wx+ww2,wy); c.stroke();
    c.strokeStyle='rgba(255,255,255,.3)'; c.lineWidth=ww.th*2.5;
    c.beginPath(); c.moveTo(wx,wy-ww.th*2); c.lineTo(wx+ww2,wy-ww.th*2); c.stroke();
    c.fillStyle=isDarkMode()?'#aaa':'#555'; c.font='12px Tajawal'; c.textAlign='center'; c.textBaseline='top';
    c.fillText('سُمك: '+ww.th+'mm',w/2,wy+ww.th*4+6);

    // مشابك
    [wx,wx+ww2].forEach(function(mx){ c.fillStyle='#E74C3C'; c.beginPath(); c.roundRect(mx-5,wy-16,10,32,3); c.fill(); });

    // إلكترونات
    var ne=Math.round(I*14);
    for(var ei=0;ei<ne;ei++){
      var et=((simState.t*I*1.2+ei/ne))%1;
      c.fillStyle='rgba(0,210,255,'+(0.8-et*.4)+')'; c.beginPath(); c.arc(wx+ww2*et,wy,3.5,0,Math.PI*2); c.fill();
    }

    // دائرة
    c.strokeStyle=I>.5?'#27AE60':'#E67E22'; c.lineWidth=2;
    c.beginPath(); c.moveTo(wx,wy); c.lineTo(wx,h*.18); c.lineTo(w*.35,h*.18); c.stroke();
    c.beginPath(); c.moveTo(wx+ww2,wy); c.lineTo(wx+ww2,h*.18); c.lineTo(w*.65,h*.18); c.stroke();
    c.fillStyle='#2C3E50'; c.beginPath(); c.roundRect(w*.24,h*.09,56,28,5); c.fill();
    c.fillStyle='#F39C12'; c.fillRect(w*.24+8,h*.09+5,40,18);
    c.fillStyle='white'; c.font='bold 9px Arial'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('1.5V',w*.24+28,h*.09+14);
    c.fillStyle=isDarkMode()?'#1E2A38':'white'; c.strokeStyle='rgba(0,0,0,.2)'; c.lineWidth=1.5;
    c.beginPath(); c.arc(w*.73,h*.18,14,0,Math.PI*2); c.fill(); c.stroke();
    c.fillStyle='#E74C3C'; c.font='bold 11px Arial'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('A',w*.73,h*.18);

    // خلاصة
    c.fillStyle=isDarkMode()?'rgba(20,28,40,.85)':'rgba(255,255,255,.85)';
    c.beginPath(); c.roundRect(w*.04,h*.62,w*.92,h*.34,12); c.fill();
    c.font='bold 14px Tajawal'; c.fillStyle=isDarkMode()?'#E8F2FA':'#1E2D3D'; c.textAlign='center'; c.textBaseline='top';
    c.fillText(ww.label+' → '+ww.R+'Ω → '+I.toFixed(3)+' A',w/2,h*.64);
    var bY=h*.73,bH=h*.07;
    c.fillStyle='rgba(0,0,0,.06)'; c.beginPath(); c.roundRect(w*.1,bY,w*.8,bH,bH/2); c.fill();
    var bf=Math.min(1,I/1.5);
    c.fillStyle=ww.col+'BB'; c.beginPath(); c.roundRect(w*.1,bY,w*.8*bf,bH,bH/2); c.fill();
    if(bf>.15){ c.font='bold 11px Tajawal'; c.fillStyle='white'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('التيار',w*.5,bY+bH/2); }
    c.font='13px Tajawal'; c.fillStyle=isDarkMode()?'#8AA8C0':'#666'; c.textAlign='center'; c.textBaseline='top';
    c.fillText(ww.th>=3?'السلك السميك: مقاومة أقل → تيار أكبر ↑':'السلك الرفيع: مقاومة أكبر → تيار أقل ↓',w/2,h*.82);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 🔋 5-9: كيف اخترع العلماء البطاريات؟
// TAB 1 — بطارية بغداد (Baghdad Battery)
// ══════════════════════════════════════════════════════════
function simBattery1() {
  cancelAnimationFrame(animFrame);
  simState = { t: 0, vinegar: 0, poured: false, voltage: 0, sparks: [] };

  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">🏺 بطارية بغداد — عام ١٩٣٦م</div>
      <div style="font-size:13px;color:var(--text-secondary);line-height:1.7;margin-top:6px">
        عثر العمّال على جرّة فخّار في مقبرة قديمة قرب بغداد. بداخلها قضيب حديد محاط بأنبوب نحاس. عمرها أكثر من <strong>٢٠٠٠ سنة!</strong>
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">⚗️ جرّب بنفسك</div>
      <button class="ctrl-btn" id="btnPour" style="width:100%;background:rgba(26,143,168,0.15);border-color:rgba(26,143,168,0.4);color:#1A8FA8;font-size:14px;padding:10px">
        🫙 اسكب الخل داخل الجرّة
      </button>
      <button class="ctrl-btn" id="btnReset" style="width:100%;margin-top:6px;font-size:13px">🔄 أعِد التجربة</button>
    </div>
    <div class="info-box" style="font-size:13px" id="bagInfo">
      💡 الشعب الساساني ربما استخدم هذه الجرّة لطلاء المعادن بالذهب بالكهرباء!
    </div>
    <div class="q-box" style="font-size:13px">
      <strong>❓</strong> ما المادتان المعدنيتان في الجرّة؟ ولماذا يحتاج الخل؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 الإجابة</button>
      <div class="q-ans-panel">المادتان هما <strong>الحديد</strong> (القضيب) و<strong>النحاس</strong> (الأنبوب). الخل هو السائل الموصِّل الذي يسمح بمرور التيار بين المعدنين — تماماً كمبدأ البطارية الحديثة!</div>
    </div>
  `);

  document.getElementById('btnPour').addEventListener('click', () => {
    if (!simState.poured) {
      simState.poured = true;
      simState.fillLevel = 0;
      document.getElementById('bagInfo').innerHTML = '⚡ انظر! ظهر جهد كهربائي بين المعدنين — مثل البطارية تماماً!';
      document.getElementById('btnPour').disabled = true;
      document.getElementById('btnPour').style.opacity = '0.5';
    }
  });
  document.getElementById('btnReset').addEventListener('click', () => {
    simState.poured = false;
    simState.fillLevel = 0;
    simState.voltage = 0;
    simState.sparks = [];
    document.getElementById('bagInfo').innerHTML = '💡 الشعب الساساني ربما استخدم هذه الجرّة لطلاء المعادن بالذهب بالكهرباء!';
    document.getElementById('btnPour').disabled = false;
    document.getElementById('btnPour').style.opacity = '1';
  });

  function draw() {
    if (currentSim !== 'g6battery' || currentTab !== 0) return;
    var c = elCtx(), w = elW(), h = elH();
    c.clearRect(0, 0, w, h);
    simState.t += 0.04;
    var t = simState.t;
    var dark = isDarkMode();

    // ── خلفية — مشهد بغداد الليلية ──
    var sky = c.createLinearGradient(0, 0, 0, h * 0.55);
    sky.addColorStop(0, dark ? '#0A0A1A' : '#1A0A2E');
    sky.addColorStop(1, dark ? '#1A0820' : '#3D1A5A');
    c.fillStyle = sky; c.fillRect(0, 0, w, h * 0.55);

    // نجوم
    if (!simState.stars) simState.stars = Array.from({length: 40}, () => ({x: Math.random()*w, y: Math.random()*h*0.5, r: Math.random()*1.2+0.3}));
    simState.stars.forEach(function(s) {
      c.beginPath(); c.arc(s.x, s.y, s.r, 0, Math.PI*2);
      c.fillStyle = 'rgba(255,255,200,' + (0.4 + Math.sin(t + s.x) * 0.3) + ')'; c.fill();
    });

    // قمر
    c.save(); c.shadowBlur = 18; c.shadowColor = '#FFFACD';
    c.fillStyle = '#FFF8DC'; c.beginPath(); c.arc(w * 0.85, h * 0.08, 16, 0, Math.PI * 2); c.fill(); c.restore();

    // أرض صحراوية
    var grd = c.createLinearGradient(0, h * 0.55, 0, h);
    grd.addColorStop(0, '#8B6914'); grd.addColorStop(1, '#5C440D');
    c.fillStyle = grd; c.fillRect(0, h * 0.55, w, h * 0.45);

    // ── الجرّة الفخّارية ──
    var jx = w * 0.5, jy = h * 0.58, jw = w * 0.18, jh = h * 0.32;
    c.save();
    // جسم الجرّة
    c.fillStyle = '#B5651D';
    c.beginPath();
    c.moveTo(jx - jw * 0.5, jy);
    c.bezierCurveTo(jx - jw * 0.65, jy + jh * 0.3, jx - jw * 0.7, jy + jh * 0.7, jx - jw * 0.4, jy + jh);
    c.lineTo(jx + jw * 0.4, jy + jh);
    c.bezierCurveTo(jx + jw * 0.7, jy + jh * 0.7, jx + jw * 0.65, jy + jh * 0.3, jx + jw * 0.5, jy);
    c.closePath(); c.fill();
    // ظل الجرّة
    c.fillStyle = 'rgba(0,0,0,0.2)';
    c.beginPath();
    c.moveTo(jx + jw * 0.1, jy);
    c.bezierCurveTo(jx + jw * 0.5, jy + jh * 0.3, jx + jw * 0.55, jy + jh * 0.7, jx + jw * 0.4, jy + jh);
    c.lineTo(jx + jw * 0.35, jy + jh);
    c.bezierCurveTo(jx + jw * 0.5, jy + jh * 0.7, jx + jw * 0.45, jy + jh * 0.3, jx + jw * 0.05, jy);
    c.closePath(); c.fill();
    // فوهة الجرّة
    c.fillStyle = '#8B4513';
    c.beginPath(); c.ellipse(jx, jy, jw * 0.5, jh * 0.06, 0, 0, Math.PI * 2); c.fill();
    c.restore();

    // ── سائل الخل (يملأ تدريجياً) ──
    if (simState.poured) {
      if (simState.fillLevel === undefined) simState.fillLevel = 0;
      if (simState.fillLevel < 1) simState.fillLevel = Math.min(1, simState.fillLevel + 0.012);
      var fl = simState.fillLevel;
      var liquidTop = jy + jh * 0.15 + (1 - fl) * jh * 0.6;
      var liquidH = jh * 0.6 * fl;
      c.save();
      c.beginPath();
      c.moveTo(jx - jw * 0.55, jy);
      c.bezierCurveTo(jx - jw * 0.65, jy + jh * 0.3, jx - jw * 0.7, jy + jh * 0.7, jx - jw * 0.4, jy + jh);
      c.lineTo(jx + jw * 0.4, jy + jh);
      c.bezierCurveTo(jx + jw * 0.7, jy + jh * 0.7, jx + jw * 0.65, jy + jh * 0.3, jx + jw * 0.55, jy);
      c.closePath(); c.clip();
      var liq = c.createLinearGradient(0, liquidTop, 0, liquidTop + liquidH);
      liq.addColorStop(0, 'rgba(210,180,80,0.7)');
      liq.addColorStop(1, 'rgba(180,140,40,0.85)');
      c.fillStyle = liq;
      c.fillRect(jx - jw, liquidTop, jw * 2, liquidH + 10);

      // فقاعات
      if (!simState.bubbles) simState.bubbles = [];
      if (Math.random() < 0.08 && fl > 0.3) simState.bubbles.push({x: jx + (Math.random()-0.5)*jw*0.5, y: liquidTop + liquidH * 0.9, vy: Math.random()*0.8+0.3, r: Math.random()*2.5+1});
      simState.bubbles = simState.bubbles.filter(function(b) { b.y -= b.vy; return b.y > liquidTop; });
      simState.bubbles.forEach(function(b) {
        c.beginPath(); c.arc(b.x, b.y, b.r, 0, Math.PI*2);
        c.strokeStyle = 'rgba(255,255,200,0.6)'; c.lineWidth = 1; c.stroke();
      });
      c.restore();

      simState.voltage = Math.min(1.8, simState.voltage + 0.015);
    }

    // ── القضيب (حديد) — داخل الجرّة ──
    var rodX = jx - jw * 0.1;
    c.fillStyle = '#A0A0A0';
    c.fillRect(rodX - 5, jy - h * 0.08, 10, jh * 0.72);
    // تسمية حديد — خلفية داكنة + خط أبيض كبير
    c.save();
    c.fillStyle = 'rgba(0,0,0,0.55)';
    c.beginPath(); c.roundRect(rodX - 22, jy - h * 0.13, 44, 24, 5); c.fill();
    c.fillStyle = '#FFFFFF';
    c.font = 'bold 15px Tajawal'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('حديد', rodX, jy - h * 0.115);
    c.restore();

    // ── الأنبوب (نحاس) ──
    var tubeX = jx + jw * 0.15;
    c.strokeStyle = '#DAA520'; c.lineWidth = 9;
    c.beginPath(); c.moveTo(tubeX, jy - h * 0.07); c.lineTo(tubeX, jy + jh * 0.67); c.stroke();
    // تسمية نحاس — خلفية داكنة + خط أبيض كبير
    c.save();
    c.fillStyle = 'rgba(0,0,0,0.55)';
    c.beginPath(); c.roundRect(tubeX - 22, jy - h * 0.13, 44, 24, 5); c.fill();
    c.fillStyle = '#FFD700';
    c.font = 'bold 15px Tajawal'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('نحاس', tubeX, jy - h * 0.115);
    c.restore();

    // ── عرض الجهد ──
    var vPanel = { x: w * 0.03, y: h * 0.03, w: w * 0.38, h: h * 0.17 };
    c.fillStyle = 'rgba(255,255,255,0.95)';
    c.beginPath(); c.roundRect(vPanel.x, vPanel.y, vPanel.w, vPanel.h, 12); c.fill();
    c.strokeStyle = '#D4901A'; c.lineWidth = 2.5;
    c.beginPath(); c.roundRect(vPanel.x, vPanel.y, vPanel.w, vPanel.h, 12); c.stroke();
    c.fillStyle = '#A0700A';
    c.font = 'bold 14px Tajawal'; c.textAlign = 'center'; c.textBaseline = 'top';
    c.fillText('⚡ الجهد الكهربائي', vPanel.x + vPanel.w / 2, vPanel.y + 10);
    var vShow = (simState.voltage || 0).toFixed(2);
    c.font = 'bold ' + Math.round(h * 0.065) + 'px Tajawal';
    c.fillStyle = simState.voltage > 0.5 ? '#1A8A40' : '#AAAAAA';
    c.textBaseline = 'middle';
    c.fillText(vShow + ' V', vPanel.x + vPanel.w / 2, vPanel.y + vPanel.h * 0.7);

    // ── نقاط متوهّجة عند بلوغ الجهد ──
    if (simState.voltage > 1.2) {
      if (Math.random() < 0.12) {
        simState.sparks.push({x: rodX + (Math.random()-0.5)*20, y: jy - h*0.05 - Math.random()*10, life: 1});
      }
      simState.sparks = simState.sparks.filter(function(s) { s.life -= 0.06; return s.life > 0; });
      simState.sparks.forEach(function(s) {
        c.save(); c.globalAlpha = s.life;
        c.fillStyle = '#FFD700'; c.shadowBlur = 8; c.shadowColor = '#FFD700';
        c.beginPath(); c.arc(s.x, s.y, 2.5, 0, Math.PI*2); c.fill();
        c.restore();
      });
    }

    // ── لافتة الزمن ──
    c.fillStyle = dark ? 'rgba(212,144,26,0.18)' : 'rgba(212,144,26,0.12)';
    c.beginPath(); c.roundRect(w*0.05, h*0.88, w*0.9, h*0.1, 8); c.fill();
    c.fillStyle = dark ? '#D4A040' : '#7A5010';
    c.font = 'bold 13px Tajawal'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('🕰️  بغداد  —  قبل أكثر من ٢٠٠٠ سنة  (الحضارة الساسانية)', w/2, h*0.93);

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 🐸 TAB 2 — اكتشاف جلفاني (Galvani)
// ══════════════════════════════════════════════════════════
function simBattery2() {
  cancelAnimationFrame(animFrame);
  simState = { t: 0, hookOn: false, shockAnim: 0, twitchCount: 0, mode: 'idle' };

  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">🐸 اكتشاف جلفاني — ١٧٨٠م</div>
      <div style="font-size:13px;color:var(--text-secondary);line-height:1.7;margin-top:6px">
        لويجي جلفاني طبيب إيطالي علّق رجل ضفدع بمشابك نحاس على سلك حديد، فلاحظ ارتعاش العضلات! اعتقد أن السبب هو «كهرباء الحيوان».
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🔬 أجرِ التجربة</div>
      <button class="ctrl-btn" id="btnHook" style="width:100%;background:rgba(39,174,96,0.15);border-color:rgba(39,174,96,0.4);color:#27AE60;font-size:14px;padding:10px">
        🪝 علّق رجل الضفدع على السلك
      </button>
      <button class="ctrl-btn" id="btnTouch" style="width:100%;margin-top:6px;background:rgba(192,57,43,0.12);border-color:rgba(192,57,43,0.3);color:#C0392B;font-size:14px;padding:10px" disabled>
        ⚡ لمس المشبك الحديدي
      </button>
      <button class="ctrl-btn" id="btnResetG" style="width:100%;margin-top:6px;font-size:13px">🔄 أعِد التجربة</button>
    </div>
    <div class="info-box" id="galvInfo" style="font-size:13px">
      🧪 كان جلفاني على صواب في أن ارتعاش العضلات سببه التيار الكهربائي — لكنه أخطأ في مصدره!
    </div>
    <div class="q-box" style="font-size:13px">
      <strong>❓</strong> ماذا لاحظ جلفاني؟ وما استنتاجه الخاطئ؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 الإجابة</button>
      <div class="q-ans-panel">لاحظ <strong>ارتعاش عضلات الضفدع</strong> عند تلامس معدنين مختلفين مع الساق. اعتقد أن التيار يأتي من أعصاب الضفدع («كهرباء الحيوان»)، لكن الحقيقة أن المعدنين المختلفين هما المصدر الحقيقي للتيار.</div>
    </div>
  `);

  document.getElementById('btnHook').addEventListener('click', function() {
    simState.hookOn = true;
    simState.mode = 'hooked';
    this.disabled = true; this.style.opacity = '0.5';
    document.getElementById('btnTouch').disabled = false;
    document.getElementById('galvInfo').innerHTML = '👀 الضفدع معلّق الآن — لاحظ ماذا يحدث عند لمس المشبك!';
  });

  document.getElementById('btnTouch').addEventListener('click', function() {
    simState.mode = 'twitch';
    simState.shockAnim = 1;
    simState.twitchCount = (simState.twitchCount || 0) + 1;
    try { U9Sound.ping(); } catch(e) {}
    document.getElementById('galvInfo').innerHTML = '⚡ ارتعشت العضلات! جلفاني: «هذه كهرباء الحيوان!» — لكن هل هو محقّ؟';
  });

  document.getElementById('btnResetG').addEventListener('click', function() {
    simState = { t: 0, hookOn: false, shockAnim: 0, twitchCount: 0, mode: 'idle' };
    document.getElementById('btnHook').disabled = false; document.getElementById('btnHook').style.opacity = '1';
    document.getElementById('btnTouch').disabled = true;
    document.getElementById('galvInfo').innerHTML = '🧪 كان جلفاني على صواب في أن ارتعاش العضلات سببه التيار الكهربائي — لكنه أخطأ في مصدره!';
  });

  function draw() {
    if (currentSim !== 'g6battery' || currentTab !== 1) return;
    var c = elCtx(), w = elW(), h = elH();
    c.clearRect(0, 0, w, h); simState.t += 0.04;
    var t = simState.t, dark = isDarkMode();

    // خلفية مختبر — أفتح وأوضح
    var bg = c.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#D4C9A8');
    bg.addColorStop(1, '#B8A880');
    c.fillStyle = bg; c.fillRect(0, 0, w, h);

    // جدار المختبر — رف علوي
    c.fillStyle = '#7A5C2A';
    c.fillRect(0, h * 0.06, w, 6);
    c.fillStyle = '#C8A860';
    c.fillRect(0, 0, w, h * 0.06);

    // زجاجات مختبر — أوضح
    [[0.08,'#27AE60',0.6],[0.16,'#1A8FA8',0.5],[0.24,'#E74C3C',0.7]].forEach(function(b) {
      var bx=w*b[0], by=h*0.005, bw=w*0.045, bh=h*0.10;
      c.fillStyle='rgba(255,255,255,0.5)'; c.fillRect(bx, by, bw, bh);
      c.strokeStyle=b[1]; c.lineWidth=2; c.strokeRect(bx, by, bw, bh);
      c.fillStyle=b[1]+'99'; c.fillRect(bx, by+bh*(1-b[2]), bw, bh*b[2]);
    });

    // منضدة — أغمق وأوضح
    c.fillStyle = '#7A5028';
    c.fillRect(0, h * 0.72, w, h * 0.06);
    c.fillStyle = '#5A3818';
    c.fillRect(0, h * 0.78, w, h * 0.22);

    // ── السلك الأفقي — أسمك وأوضح ──
    var wireY = h * 0.23, wireX1 = w * 0.10, wireX2 = w * 0.90;
    c.strokeStyle = '#555555'; c.lineWidth = 6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(wireX1, wireY); c.lineTo(wireX2, wireY); c.stroke();
    // تثبيت السلك
    [wireX1, wireX2].forEach(function(wx) {
      c.fillStyle = '#333'; c.beginPath(); c.arc(wx, wireY, 9, 0, Math.PI*2); c.fill();
    });
    // تسمية السلك — واضحة
    c.save();
    c.fillStyle = 'rgba(0,0,0,0.6)';
    c.beginPath(); c.roundRect(w/2 - 60, wireY - 30, 120, 22, 5); c.fill();
    c.fillStyle = '#FFFFFF'; c.font = 'bold 14px Tajawal'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('سلك حديدي', w/2, wireY - 19);
    c.restore();

    if (simState.hookOn) {
      var hookX = w * 0.5, hookY = wireY;
      var twitch = simState.mode === 'twitch' ? Math.sin(t * 25) * 10 * simState.shockAnim : 0;
      if (simState.shockAnim > 0) simState.shockAnim = Math.max(0, simState.shockAnim - 0.025);

      // مشبك نحاسي — أسمك
      c.strokeStyle = '#DAA520'; c.lineWidth = 5;
      c.beginPath();
      c.moveTo(hookX, hookY);
      c.lineTo(hookX + twitch * 0.2, hookY + h * 0.06);
      c.bezierCurveTo(hookX + twitch*0.3, hookY + h*0.09, hookX + twitch*0.5, hookY + h*0.09, hookX + twitch*0.5, hookY + h*0.13);
      c.stroke();

      var frogY = hookY + h * 0.13 + Math.abs(twitch) * 0.5;
      var frogX = hookX + twitch;

      // ── ضفدع أوضح وأكبر ──
      // جسم الضفدع
      c.fillStyle = '#2E7D32';
      c.beginPath(); c.ellipse(frogX, frogY + h*0.06, w*0.055, h*0.08, 0, 0, Math.PI*2); c.fill();
      c.strokeStyle = '#1B5E20'; c.lineWidth = 2;
      c.beginPath(); c.ellipse(frogX, frogY + h*0.06, w*0.055, h*0.08, 0, 0, Math.PI*2); c.stroke();

      // أرجل
      [[-1,1],[1,-0.5]].forEach(function(leg) {
        var lTwitch = simState.shockAnim > 0 ? leg[0]*Math.sin(t*20)*18 : 0;
        c.strokeStyle = '#388E3C'; c.lineWidth = 6; c.lineCap = 'round';
        c.beginPath();
        c.moveTo(frogX + leg[0]*w*0.03, frogY + h*0.10);
        c.lineTo(frogX + leg[0]*w*0.07 + lTwitch, frogY + h*0.17);
        c.lineTo(frogX + leg[0]*w*0.11 + lTwitch*leg[1], frogY + h*0.22);
        c.stroke();
        // قدم
        c.fillStyle = '#1B5E20';
        c.beginPath(); c.ellipse(frogX + leg[0]*w*0.11 + lTwitch*leg[1], frogY+h*0.23, w*0.03, h*0.012, 0.3*leg[0], 0, Math.PI*2); c.fill();
      });

      // عيون — كبيرة وواضحة
      [-1,1].forEach(function(side) {
        c.fillStyle = '#FDD835';
        c.beginPath(); c.arc(frogX + side*w*0.032, frogY + h*0.02, h*0.022, 0, Math.PI*2); c.fill();
        c.strokeStyle='#F9A825'; c.lineWidth=1.5;
        c.beginPath(); c.arc(frogX + side*w*0.032, frogY + h*0.02, h*0.022, 0, Math.PI*2); c.stroke();
        c.fillStyle = '#1A0A00';
        c.beginPath(); c.arc(frogX + side*w*0.032, frogY + h*0.022, h*0.01, 0, Math.PI*2); c.fill();
      });

      // بريق الصعقة
      if (simState.shockAnim > 0.3) {
        c.save(); c.globalAlpha = simState.shockAnim * 0.9;
        for (var i = 0; i < 8; i++) {
          var angle = (i/8)*Math.PI*2 + t;
          var dist = h*0.08*simState.shockAnim;
          c.strokeStyle = '#FFD700'; c.lineWidth = 3;
          c.beginPath();
          c.moveTo(frogX + Math.cos(angle)*dist*0.3, frogY+h*0.06+Math.sin(angle)*dist*0.3);
          c.lineTo(frogX + Math.cos(angle)*dist, frogY+h*0.06+Math.sin(angle)*dist);
          c.stroke();
        }
        c.restore();
      }

      // تسمية المشبك
      c.save();
      c.fillStyle = 'rgba(0,0,0,0.6)';
      c.beginPath(); c.roundRect(hookX - 70, hookY + h*0.04, 68, 22, 5); c.fill();
      c.fillStyle = '#FFD700'; c.font = 'bold 13px Tajawal'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('مشبك نحاسي 🪝', hookX - 36, hookY + h*0.051);
      c.restore();

    } else {
      // رسم الطبيب — أوضح
      var docX = w * 0.38, docY = h * 0.48;
      // جسم
      c.fillStyle = '#E8D5B0';
      c.beginPath(); c.arc(docX, docY - h*0.10, h*0.08, 0, Math.PI*2); c.fill();
      c.strokeStyle='#C8A870'; c.lineWidth=2;
      c.beginPath(); c.arc(docX, docY - h*0.10, h*0.08, 0, Math.PI*2); c.stroke();
      // معطف
      c.fillStyle = '#FAFAFA';
      c.beginPath(); c.ellipse(docX, docY + h*0.05, w*0.07, h*0.14, 0, 0, Math.PI*2); c.fill();
      c.strokeStyle='#DDD'; c.lineWidth=1.5;
      c.beginPath(); c.ellipse(docX, docY + h*0.05, w*0.07, h*0.14, 0, 0, Math.PI*2); c.stroke();
      // اسم
      c.save();
      c.fillStyle = 'rgba(0,0,0,0.65)';
      c.beginPath(); c.roundRect(docX - 50, docY - h*0.22, 100, 24, 6); c.fill();
      c.fillStyle = '#FFFFFF'; c.font = 'bold 15px Tajawal'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('د. جلفاني', docX, docY - h*0.207);
      c.restore();

      // تعليمات — واضحة
      c.save();
      c.fillStyle = 'rgba(0,0,0,0.55)';
      c.beginPath(); c.roundRect(w*0.38, h*0.42, w*0.55, 28, 7); c.fill();
      c.fillStyle = '#FFFFFF'; c.font = 'bold 15px Tajawal'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('▶ اضغط «علّق رجل الضفدع» للبدء', w*0.655, h*0.434);
      c.restore();
    }

    // عدد الارتعاشات
    if (simState.twitchCount > 0) {
      c.fillStyle = 'rgba(255,255,255,0.92)';
      c.beginPath(); c.roundRect(w*0.62, h*0.25, w*0.34, h*0.11, 10); c.fill();
      c.strokeStyle='#C0392B'; c.lineWidth=2;
      c.beginPath(); c.roundRect(w*0.62, h*0.25, w*0.34, h*0.11, 10); c.stroke();
      c.fillStyle = '#C0392B'; c.font = 'bold 16px Tajawal'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('⚡ ارتعش ' + simState.twitchCount + ' مرّات!', w*0.79, h*0.305);
    }

    // ── لافتة الزمن ──
    c.fillStyle = 'rgba(39,174,96,0.85)';
    c.beginPath(); c.roundRect(w*0.05, h*0.88, w*0.9, h*0.10, 8); c.fill();
    c.fillStyle = '#FFFFFF'; c.font = 'bold 15px Tajawal'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('🕰️  إيطاليا  —  عام ١٧٨٠م  —  لويجي جلفاني', w/2, h*0.93);

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 🔋 TAB 3 — عمود فولتا (Volta's Pile)
// ══════════════════════════════════════════════════════════
function simBattery3() {
  cancelAnimationFrame(animFrame);
  simState = { t: 0, discs: 0, voltage: 0, currentFlow: 0, mode: 'idle', shockFlash: 0 };
  var MAX_DISCS = 8;

  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔋 عمود فولتا — ١٨٠٠م</div>
      <div style="font-size:13px;color:var(--text-secondary);line-height:1.7;margin-top:6px">
        أليساندرو فولتا كرّر تجارب جلفاني بمواد مختلفة واكتشف أن المعدنين (النحاس + الخارصين) مع الورق المبلول بالماء المالح هما مصدر التيار — وليس الضفدع!
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">📦 ابنِ عمود فولتا</div>
      <button class="ctrl-btn" id="btnAddDisc" style="width:100%;background:rgba(212,144,26,0.15);border-color:rgba(212,144,26,0.4);color:#D4901A;font-size:14px;padding:10px">
        ➕ أضف قرص (نحاس + ورق + خارصين)
      </button>
      <div style="margin:8px 0;text-align:center;font-size:13px;color:var(--text-secondary)">
        عدد الأقراص: <strong id="discCount">0</strong> / 8
      </div>
      <button class="ctrl-btn" id="btnShock" style="width:100%;margin-top:2px;background:rgba(192,57,43,0.12);border-color:rgba(192,57,43,0.3);color:#C0392B;font-size:14px;padding:10px" disabled>
        ⚡ اختبر الصدمة الكهربائية
      </button>
      <button class="ctrl-btn" id="btnResetV" style="width:100%;margin-top:6px;font-size:13px">🔄 ابدأ من جديد</button>
    </div>
    <div class="info-box" id="voltaInfo" style="font-size:13px">
      💡 كلما زادت الأقراص زاد الجهد! أضف ٣ أقراص على الأقل لترى التيار.
    </div>
    <div class="q-box" style="font-size:13px">
      <strong>❓</strong> كيف وظّف فولتا التفكير الإبداعي لتطوير أفكار جلفاني؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 الإجابة</button>
      <div class="q-ans-panel">كرّر فولتا تجارب جلفاني بمواد مختلفة وقاس الجهد. استنتج أن التيار ينتج من التفاعل الكيميائي بين معدنين مختلفين مع سائل موصِّل، فبنى عموداً من أقراص متناوبة يُعدّ أولَ بطارية في التاريخ!</div>
    </div>
  `);

  var localState = simState;

  function updateButtons() {
    var dc = document.getElementById('discCount');
    if (dc) dc.textContent = localState.discs;
    var shockBtn = document.getElementById('btnShock');
    if (shockBtn) shockBtn.disabled = localState.discs < 3;
    var addBtn = document.getElementById('btnAddDisc');
    if (addBtn) { addBtn.disabled = localState.discs >= MAX_DISCS; addBtn.style.opacity = localState.discs >= MAX_DISCS ? '0.5' : '1'; }
  }

  document.getElementById('btnAddDisc').addEventListener('click', function() {
    if (localState.discs < MAX_DISCS) {
      localState.discs++;
      localState.voltage = localState.discs * 0.9;
      updateButtons();
      var vI = document.getElementById('voltaInfo');
      if (vI) {
        if (localState.discs < 3) vI.innerHTML = '💡 أضف المزيد من الأقراص — كلما زادت زاد الجهد!';
        else if (localState.discs < 6) vI.innerHTML = '⚡ ممتاز! الجهد الآن ' + localState.voltage.toFixed(1) + ' فولت — جرّب الصدمة!';
        else vI.innerHTML = '🔥 عمود فولتا الكامل! جهد ' + localState.voltage.toFixed(1) + ' فولت — فولتا أرسل نبضة كافت للإحساس بها!';
      }
    }
  });

  document.getElementById('btnShock').addEventListener('click', function() {
    localState.shockFlash = 1.2;
    localState.mode = 'shock';
    try { U9Sound.ping(); } catch(e) {}
    var vI = document.getElementById('voltaInfo');
    if (vI) vI.innerHTML = '🤯 فولتا لمس طرفَي العمود وشعر بصدمة كهربائية! أثبت أن الصدمة تزداد بزيادة الأقراص!';
    setTimeout(function() { localState.mode = 'flowing'; }, 500);
  });

  document.getElementById('btnResetV').addEventListener('click', function() {
    localState.discs = 0; localState.voltage = 0; localState.mode = 'idle'; localState.shockFlash = 0;
    updateButtons();
    var vI = document.getElementById('voltaInfo');
    if (vI) vI.innerHTML = '💡 كلما زادت الأقراص زاد الجهد! أضف ٣ أقراص على الأقل لترى التيار.';
    var shockBtn = document.getElementById('btnShock');
    if (shockBtn) shockBtn.disabled = true;
  });

  function draw() {
    if (currentSim !== 'g6battery' || currentTab !== 2) return;
    var c = elCtx(), w = elW(), h = elH();
    c.clearRect(0, 0, w, h); simState.t += 0.04;
    var t = simState.t, dark = isDarkMode();
    var discs = localState.discs;

    // خلفية مختبر أوروبي كلاسيكي — أفتح وأوضح
    var bg = c.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#C8BEA0');
    bg.addColorStop(1, '#A89878');
    c.fillStyle = bg; c.fillRect(0, 0, w, h);

    // نافذة
    c.fillStyle = dark ? 'rgba(100,150,200,0.12)' : 'rgba(135,206,235,0.35)';
    c.fillRect(w*0.1, h*0.04, w*0.25, h*0.18);
    c.strokeStyle = dark ? '#555' : '#8B6914'; c.lineWidth = 2;
    c.strokeRect(w*0.1, h*0.04, w*0.25, h*0.18);
    c.beginPath(); c.moveTo(w*0.225, h*0.04); c.lineTo(w*0.225, h*0.22); c.stroke();
    c.beginPath(); c.moveTo(w*0.1, h*0.13); c.lineTo(w*0.35, h*0.13); c.stroke();

    // منضدة
    c.fillStyle = dark ? '#2A1A08' : '#9A7040';
    c.fillRect(0, h*0.72, w, h*0.06);
    c.fillStyle = dark ? '#1A0E04' : '#7A5028';
    c.fillRect(0, h*0.78, w, h*0.22);

    // ── العمود ──
    var pileX = w * 0.55, pileBase = h * 0.72;
    var discH = Math.min(h * 0.048, (h * 0.5) / Math.max(MAX_DISCS, 1));
    var discW = w * 0.22;

    // قاعدة
    c.fillStyle = dark ? '#3A2A10' : '#6B4A18';
    c.beginPath(); c.ellipse(pileX, pileBase, discW*0.55, discH*0.3, 0, 0, Math.PI*2); c.fill();

    // الأقراص من أسفل لأعلى
    for (var i = 0; i < discs; i++) {
      var dy = pileBase - (i + 0.5) * discH * 1.05;
      var isNew = i === discs - 1;
      var alpha = isNew ? Math.min(1, (simState.t % 0.5) * 4) : 1;
      c.globalAlpha = alpha;

      // طبقة الخارصين (رمادي مزرق)
      var zGrd = c.createLinearGradient(pileX - discW*0.5, dy, pileX + discW*0.5, dy);
      zGrd.addColorStop(0, '#7A8A95'); zGrd.addColorStop(0.5, '#9AAAB5'); zGrd.addColorStop(1, '#6A7A85');
      c.fillStyle = zGrd;
      c.beginPath(); c.ellipse(pileX, dy + discH*0.1, discW*0.5, discH*0.22, 0, 0, Math.PI*2); c.fill();

      // طبقة الورق المبلول (بيج)
      c.fillStyle = 'rgba(220,200,150,0.8)';
      c.beginPath(); c.ellipse(pileX, dy, discW*0.48, discH*0.18, 0, 0, Math.PI*2); c.fill();

      // طبقة النحاس (ذهبي)
      var cuGrd = c.createLinearGradient(pileX - discW*0.5, dy-discH*0.12, pileX + discW*0.5, dy-discH*0.12);
      cuGrd.addColorStop(0, '#B8760A'); cuGrd.addColorStop(0.5, '#E0A020'); cuGrd.addColorStop(1, '#A06010');
      c.fillStyle = cuGrd;
      c.beginPath(); c.ellipse(pileX, dy - discH*0.12, discW*0.5, discH*0.22, 0, 0, Math.PI*2); c.fill();

      c.globalAlpha = 1;
    }

    // أسطوانة جانبية (عصا الدعم)
    if (discs > 0) {
      c.strokeStyle = dark ? '#5A4020' : '#8B6914'; c.lineWidth = 3;
      c.beginPath();
      c.moveTo(pileX - discW*0.5 - 5, pileBase);
      c.lineTo(pileX - discW*0.5 - 5, pileBase - discs * discH * 1.05);
      c.stroke();
      c.beginPath();
      c.moveTo(pileX + discW*0.5 + 5, pileBase);
      c.lineTo(pileX + discW*0.5 + 5, pileBase - discs * discH * 1.05);
      c.stroke();
    }

    // تسميات الأقراص — بادجات واضحة
    if (discs > 0) {
      var labelY = pileBase - discH * 0.5;
      var cx2 = pileX + discW * 0.55;
      [['خارصين', '#9AAAB5', discH*0.1], ['ورق مبلول', '#C8A060', 0], ['نحاس', '#E0A020', -discH*0.12]].forEach(function(lbl, li) {
        var ly = labelY - li * discH * 0.38;
        var lx = cx2 + w*0.04;
        c.save();
        c.fillStyle = 'rgba(0,0,0,0.65)';
        c.beginPath(); c.roundRect(lx - 4, ly - 11, 70, 22, 5); c.fill();
        c.fillStyle = lbl[1];
        c.font = 'bold 13px Tajawal'; c.textAlign = 'right'; c.textBaseline = 'middle';
        c.fillText(lbl[0], lx + 62, ly);
        c.restore();
        c.strokeStyle = lbl[1]; c.lineWidth = 1.5; c.setLineDash([3,3]);
        c.beginPath(); c.moveTo(cx2, ly + lbl[2]); c.lineTo(lx, ly); c.stroke();
        c.setLineDash([]);
      });
    }

    // ── لوحة الجهد — دائماً بيضاء وواضحة ──
    var vp = { x: w*0.03, y: h*0.28, w: w*0.36, h: h*0.19 };
    c.fillStyle = 'rgba(255,255,255,0.96)';
    c.beginPath(); c.roundRect(vp.x, vp.y, vp.w, vp.h, 12); c.fill();
    c.strokeStyle = '#D4901A'; c.lineWidth = 2.5;
    c.beginPath(); c.roundRect(vp.x, vp.y, vp.w, vp.h, 12); c.stroke();
    c.fillStyle = '#8B6010';
    c.font = 'bold 15px Tajawal'; c.textAlign = 'center'; c.textBaseline = 'top';
    c.fillText('⚡ الجهد الكهربائي', vp.x + vp.w/2, vp.y + 10);
    var vShow = localState.voltage.toFixed(1);
    c.font = 'bold ' + Math.round(h*0.075) + 'px Tajawal';
    c.fillStyle = localState.voltage > 1 ? '#1A7A30' : '#AAAAAA';
    c.textBaseline = 'middle';
    c.fillText(vShow + ' V', vp.x + vp.w/2, vp.y + vp.h*0.68);

    // شريط التيار
    if (localState.mode === 'flowing' || localState.mode === 'shock') {
      var ne = Math.round(Math.min(localState.discs * 2, 16));
      var cx1 = pileX, cy1 = pileBase - discs * discH * 1.05;
      var cx3 = pileX, cy3 = pileBase;
      // سلك علوي
      c.strokeStyle = '#E74C3C'; c.lineWidth = 2; c.setLineDash([]);
      c.beginPath(); c.moveTo(cx1, cy1); c.lineTo(cx1, cy1 - h*0.06); c.lineTo(vp.x + vp.w*0.8, cy1 - h*0.06); c.stroke();
      // سلك سفلي
      c.strokeStyle = '#1A8FA8'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(cx3, cy3); c.lineTo(cx3, cy3 + h*0.04); c.lineTo(vp.x + vp.w*0.8, cy3 + h*0.04); c.stroke();
      // إلكترونات
      for (var ei = 0; ei < ne; ei++) {
        var ef = ((t * 0.8 + ei / ne)) % 1;
        var ex, ey;
        if (ef < 0.3) { ex = cx1 + (vp.x + vp.w*0.8 - cx1)*(ef/0.3); ey = cy1 - h*0.06; }
        else if (ef < 0.7) { ex = vp.x + vp.w*0.8; ey = cy1 - h*0.06 + (cy3 + h*0.04 - (cy1 - h*0.06))*((ef-0.3)/0.4); }
        else { ex = vp.x + vp.w*0.8 - (vp.x + vp.w*0.8 - cx3)*((ef-0.7)/0.3); ey = cy3 + h*0.04; }
        c.fillStyle = 'rgba(0,210,255,0.85)'; c.beginPath(); c.arc(ex, ey, 3, 0, Math.PI*2); c.fill();
      }
    }

    // تأثير الصدمة
    if (localState.shockFlash > 0) {
      c.save(); c.globalAlpha = localState.shockFlash * 0.35;
      c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, w, h);
      c.restore();
      localState.shockFlash = Math.max(0, localState.shockFlash - 0.05);
    }

    // ── لافتة الزمن — واضحة دائماً ──
    c.fillStyle = 'rgba(107,78,154,0.85)';
    c.beginPath(); c.roundRect(w*0.05, h*0.88, w*0.9, h*0.10, 8); c.fill();
    c.fillStyle = '#FFFFFF';
    c.font = 'bold 15px Tajawal'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('🕰️  إيطاليا  —  عام ١٨٠٠م  —  أليساندرو فولتا', w/2, h*0.93);

    // اسم الوحدة (فولت)
    if (localState.discs >= MAX_DISCS) {
      c.fillStyle = dark ? 'rgba(20,28,40,0.9)' : 'rgba(255,255,255,0.92)';
      c.beginPath(); c.roundRect(w*0.05, h*0.54, w*0.38, h*0.09, 8); c.fill();
      c.fillStyle = '#6B4E9A'; c.font = 'bold 12px Tajawal'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('🏅 وحدة الجهد = «فولت» V', w*0.24, h*0.585);
      c.fillStyle = dark ? '#aaa' : '#666'; c.font = '10px Tajawal';
      c.fillText('تكريماً لأليساندرو فولتا', w*0.24, h*0.615);
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

// ===== HELPERS =====
function ctx() { return document.getElementById('simCanvas').getContext('2d'); }
function W() { return document.getElementById('simCanvas').width; }
function H() { return document.getElementById('simCanvas').height; }
function controls(html) { document.getElementById('simControlsPanel').innerHTML = html; }
function dataDisplay(show, rows=[]) {
  const el = document.getElementById('dataDisplay');
  el.style.display = show ? 'block' : 'none';
  el.innerHTML = rows.map(r => `<div class="data-row"><span class="data-key">${r[0]}</span><span class="data-val">${r[1]}</span></div>`).join('');
}
function sl(id, fn) {
  const el = document.getElementById(id);
  if (el) { el.addEventListener('input', fn); fn.call(el); }
}
function tog(id, fn) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', () => { el.classList.toggle('on'); fn(el.classList.contains('on')); });
}
function btn(id, fn) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', fn);
}
function lerp(a, b, t) { return a + (b-a)*t; }
function randBetween(a, b) { return a + Math.random()*(b-a); }


// ===== 7-1: ADAPTATION - TAB 1: FENNEC FOX (الثعلب الرملي) =====
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
    const mx = ((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX - rect.left) * (canvas.width / rect.width);
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
// ║         UNIT 8  —  خصائص المادّة  (v2 Enhanced)         ║
// ╚══════════════════════════════════════════════════════════╝

// ─── shared data ───────────────────────────────────────────
const METALS_DATA = [
  { name:'الحديد',     sym:'Fe', color:'#7A8090', shine:'#B8BCC8', use:'الجسور والهياكل الإنشائية',  shiny:true,  conduct:true,  malleable:true,  magnetic:true,  mp:1538, icon:'🔩', fact:'الحديد أكثر الفلزّات استخداماً في البناء' },
  { name:'النحاس',     sym:'Cu', color:'#C06830', shine:'#E8A060', use:'الأسلاك الكهربائية',         shiny:true,  conduct:true,  malleable:true,  magnetic:false, mp:1085, icon:'🔌', fact:'النحاس ثاني أفضل موصّل للكهرباء بعد الفضة' },
  { name:'الذهب',      sym:'Au', color:'#C8900A', shine:'#F0C840', use:'المجوهرات والدوائر الدقيقة',shiny:true,  conduct:true,  malleable:true,  magnetic:false, mp:1064, icon:'💍', fact:'الذهب لا يصدأ ويظل لامعاً للأبد' },
  { name:'الألومنيوم', sym:'Al', color:'#9AA8B8', shine:'#D0DCE8', use:'الطائرات والعلب والنوافذ',  shiny:true,  conduct:true,  malleable:true,  magnetic:false, mp:660,  icon:'✈️', fact:'الألومنيوم أخف الفلزّات الشائعة وأكثرها في القشرة الأرضية' },
  { name:'الفضة',      sym:'Ag', color:'#B0B8C8', shine:'#E0E8F0', use:'المجوهرات والأدوات الطبية',shiny:true,  conduct:true,  malleable:true,  magnetic:false, mp:962,  icon:'🥈', fact:'الفضة أفضل موصّل للكهرباء والحرارة بين جميع الفلزّات' },
  { name:'الزنك',      sym:'Zn', color:'#8A9898', shine:'#B8C8C8', use:'طلاء الفولاذ لمنع الصدأ',  shiny:true,  conduct:true,  malleable:true,  magnetic:false, mp:420,  icon:'🛡️', fact:'يُستخدم الزنك لحماية الحديد من الصدأ بعملية الغلفنة' },
];
const NM_DATA = [
  { name:'الأكسجين',  sym:'O₂', state:'غاز',  color:'#4A9AE0', use:'التنفّس والمستشفيات وحرق الوقود',icon:'💨', brittle:false, conduct:false, shiny:false, fact:'يشكّل 21٪ من الهواء، ضروري لكل الكائنات الهوائية' },
  { name:'الكربون',   sym:'C',  state:'صلب',  color:'#3A3A4A', use:'تنقية الماء وصناعة الأقلام',    icon:'🪨', brittle:true,  conduct:false, shiny:false, fact:'الألماس والجرافيت كلاهما كربون خالص!' },
  { name:'الكبريت',   sym:'S',  state:'صلب',  color:'#D4C020', use:'تصليب المطاط وصناعة الأسمدة',  icon:'🟡', brittle:true,  conduct:false, shiny:false, fact:'يوجد الكبريت كثيراً بالقرب من البراكين' },
  { name:'الكلور',    sym:'Cl₂',state:'غاز',  color:'#78A840', use:'تعقيم مياه الشرب والمسابح',     icon:'🫧', brittle:false, conduct:false, shiny:false, fact:'ملح الطعام (NaCl) يحتوي على الكلور!' },
  { name:'الهيليوم',  sym:'He', state:'غاز',  color:'#E07878', use:'البالونات والمناطيد',            icon:'🎈', brittle:false, conduct:false, shiny:false, fact:'الهيليوم أخف العناصر بعد الهيدروجين وغير قابل للاشتعال' },
  { name:'السيليكون', sym:'Si', state:'صلب',  color:'#9A9AB0', use:'الرقائق الإلكترونية والألواح الشمسية',icon:'💻', brittle:true, conduct:false, shiny:false, fact:'السيليكون أساس صناعة الإلكترونيات الحديثة' },
  { name:'الفسفور',   sym:'P',  state:'صلب',  color:'#F0802A', use:'الأسمدة وعيدان الثقاب',         icon:'🔥', brittle:true,  conduct:false, shiny:false, fact:'الفسفور الأبيض يشتعل تلقائياً في الهواء' },
  { name:'النيتروجين',sym:'N₂', state:'غاز',  color:'#60A0D0', use:'التبريد السريع وصناعة الأسمدة', icon:'❄️', brittle:false, conduct:false, shiny:false, fact:'يشكّل النيتروجين 78٪ من الهواء الذي نتنفّسه' },
];

function simMetals() {
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
  simState = { selected: null, t: 0 };
  const METALS = METALS_DATA;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔩 اختر الفلزّ — نشاط 1-8</div>
      <span id="metals-btns-ph"></span>    </div>
    <div class="quran-banner" style="margin:6px 0;padding:9px 12px">
      <div class="quran-text" style="font-size:16px">﴿ وَأَلَنَّا لَهُ الْحَدِيدَ ﴾</div>
      <div class="quran-ref">سورة سبأ · الآية ١٠</div>
    </div>
    <div id="metal-info" class="info-box">اضغط على أي فلزّ لاستعراض خصائصه التفصيلية</div>
    <div class="q-box">
      <strong>❓ أسئلة الكتاب (ص٣٧):</strong><br>
      ١- اذكر عشرة فلزّات.<br>
      ٢- لماذا يُستخدم النحاس في صناعة الأسلاك الكهربائية؟<br>
      ٣- ما معنى «قابل للطرق» و«قابل للسحب»؟
    
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- الحديد، النحاس، الذهب، الفضة، الألومنيوم، الزنك، القصدير، الرصاص، النيكل، الكوبالت.<br>٢- لأنه يوصّل الكهرباء جيداً وقابل للسحب.<br>٣- قابل للطرق: يمكن تشكيله بضربه. قابل للسحب: يمكن سحبه على شكل أسلاك.</div>
  </div>
  `);
  buildBtns('metals-btns-ph', METALS, 'window._selMetal', 'mb');

  window._selMetal = (i) => {
    simState.selected = i;
    METALS.forEach((_,j)=>{ const b=document.getElementById('mb'+j); if(b) b.style.outline = j===i?'2px solid #1A8FA8':'none'; });
    const m = METALS[i];
    const sym = m.sym || m.ar;
    document.getElementById('metal-info').innerHTML = `
      <strong style="color:#1A8FA8;font-size:16px;display:block;margin-bottom:8px">${m.icon} ${m.name} (${sym})</strong>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px 8px;font-size:15px;margin-bottom:8px">
        <span>✨ لامع</span><span>${m.shiny?'✅ نعم':'❌ لا'}</span>
        <span>⚡ موصّل كهربائي</span><span>${m.conduct?'✅ نعم':'❌ لا'}</span>
        <span>🔨 قابل للطرق</span><span>${m.malleable?'✅ نعم':'❌ لا'}</span>
        <span>🧲 مغناطيسي</span><span>${m.magnetic?'✅ نعم':'❌ لا'}</span>
        ${m.mp?`<span>🌡️ نقطة الانصهار</span><span>${m.mp}°م</span>`:''}
      </div>
      <div style="padding:7px;background:rgba(212,144,26,0.09);border-radius:6px;font-size:15px;color:#7A5010">
        📌 ${m.use}${m.fact?`<br>💡 ${m.fact}`:''}
      </div>`;
  };

  const cv = document.getElementById('simCanvas');
  cv.onclick = (e) => {
    const r=cv.getBoundingClientRect(), mx=(e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX-r.left, my=(e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientY-r.top;
    const w=cv.width, cols=Math.min(6,Math.floor(w/82));
    const bW=Math.min(76,(w-40)/cols), bH=bW*1.25, sx=(w-cols*(bW+10))/2;
    METALS.forEach((_,i)=>{
      const col=i%cols, row=Math.floor(i/cols), x=sx+col*(bW+10), y=52+row*(bH+10);
      if(mx>=x&&mx<=x+bW&&my>=y&&my<=y+bH) window._selMetal(i);
    });
  };

  function draw() {
    const c=ctx(), w=W(), h=H();
    c.clearRect(0,0,w,h);
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F5F2EC'); bg.addColorStop(1,'#EDEAE3');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    simState.t++;
    const tt=simState.t;

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.min(18,w*0.038)}px Tajawal`;
    c.textAlign='center'; c.fillText('الفلزّات — اضغط على أي فلزّ لاستعراض خصائصه', w/2, 34);

    const cols=Math.min(5,Math.floor(w/130));
    const gap=16;
    const bW=Math.min(Math.floor((w-40-gap*(cols-1))/cols), 150);
    const bH=bW*1.3, sx=(w-(cols*(bW+gap)-gap))/2;

    METALS.forEach((m,i)=>{
      const col=i%cols, row=Math.floor(i/cols), x=sx+col*(bW+gap), y=54+row*(bH+gap);
      const sel=simState.selected===i;
      const pulse=sel?1+Math.sin(tt*0.08)*0.025:1;
      const shine=m.shine||m.color+'EE';

      c.save(); c.translate(x+bW/2,y+bH/2); c.scale(pulse,pulse); c.translate(-bW/2,-bH/2);
      c.shadowColor=sel?'rgba(26,143,168,0.30)':'rgba(0,0,0,0.07)';
      c.shadowBlur=sel?16:5; c.shadowOffsetY=sel?4:2;
      c.fillStyle=sel?'#E4F4F8':'white';
      c.strokeStyle=sel?'#1A8FA8':'rgba(0,0,0,0.07)'; c.lineWidth=sel?2:1;
      c.beginPath(); c.roundRect(0,0,bW,bH,10); c.fill(); c.stroke();
      c.shadowBlur=0; c.shadowOffsetY=0;

      const r=bW*0.27;
      const grad=c.createRadialGradient(bW*0.37,bH*0.23,r*0.1,bW/2,bH*0.31,r);
      grad.addColorStop(0,shine); grad.addColorStop(0.55,m.color); grad.addColorStop(1,m.color+'77');
      c.beginPath(); c.arc(bW/2,bH*0.31,r,0,Math.PI*2); c.fillStyle=grad; c.fill();
      c.beginPath(); c.ellipse(bW*0.37,bH*0.21,r*0.27,r*0.17,-0.5,0,Math.PI*2);
      c.fillStyle='rgba(255,255,255,0.55)'; c.fill();

      const sym=m.sym||m.ar||'';
      c.fillStyle='rgba(255,255,255,0.92)'; c.font=`bold ${Math.min(15,bW*0.13)}px Tajawal`;
      c.textAlign='center'; c.fillText(sym,bW/2,bH*0.34);

      c.fillStyle=sel?'#1A6A80':'#2C3A4A';
      c.font=`bold ${Math.min(15,bW*0.13)}px Tajawal`; c.fillText(m.name,bW/2,bH*0.61);

      c.font=`${Math.min(24,bW*0.20)}px Arial`; c.fillText(m.icon,bW/2,bH*0.82);

      if(sel){ c.fillStyle='#1A8FA8'; c.font=`bold ${Math.min(7.5,bW*0.1)}px Tajawal`;
        c.fillText(m.mp?m.mp+'°م':'', bW/2, bH*0.94); }
      c.restore();
    });

    if(simState.selected!==null){
      const m=METALS[simState.selected];
      const rows=Math.ceil(METALS.length/cols);
      const sy=46+rows*(bH+10)+6;
      if(sy+68<h){
        c.fillStyle='rgba(26,143,168,0.07)'; c.strokeStyle='rgba(26,143,168,0.18)'; c.lineWidth=1;
        c.beginPath(); c.roundRect(10,sy,w-20,66,10); c.fill(); c.stroke();
        c.fillStyle='#1A6A80'; c.font=`bold ${Math.min(12,w*0.028)}px Tajawal`;
        c.textAlign='center'; c.fillText(m.icon+' '+m.name+' — '+m.use,w/2,sy+17);
        const props=[{l:'لامع ✨',ok:m.shiny},{l:'موصّل ⚡',ok:m.conduct},{l:'طرق 🔨',ok:m.malleable},{l:'مغناطيسي 🧲',ok:m.magnetic}];
        props.forEach((p,i)=>{
          const px=10+i*(w-20)/4+(w-20)/8;
          c.fillStyle=p.ok?'#1E7A40':'#8B2020';
          c.font=`bold ${Math.min(10,w*0.024)}px Tajawal`; c.textAlign='center';
          c.fillText((p.ok?'✅ ':'❌ ')+p.l, px, sy+38);
        });
        if(m.fact){ c.fillStyle='#7A6020'; c.font=`${Math.min(10,w*0.023)}px Tajawal`;
          c.fillText('💡 '+m.fact, w/2, sy+56, w-30); }
      }
    }
    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  draw();
}

// ===== 8-1 TAB 2: METAL LAB — مختبر الاختبار =====
function simMetalLab() {
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
  simState = { test: 'shiny', t: 0, metalIdx: 0 };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧪 اختر التجربة</div>
      <button class="ctrl-btn action" id="lt_shiny"    onclick="window._setTest('shiny')">✨ اختبار اللمعة</button>
      <button class="ctrl-btn action" id="lt_conduct"  onclick="window._setTest('conduct')">⚡ اختبار التوصيل</button>
      <button class="ctrl-btn action" id="lt_malleable" onclick="window._setTest('malleable')">🔨 اختبار الطرق</button>
      <button class="ctrl-btn action" id="lt_magnetic" onclick="window._setTest('magnetic')">🧲 اختبار المغناطيسية</button>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🔩 الفلزّ المُختبَر</div>
      <span id="metallab-btns-ph"></span>
    </div>
    <div id="lab-result" class="info-box">اختر تجربة وفلزاً</div>
  `);
  buildBtns('metallab-btns-ph', METALS_DATA, 'window._labMetal', null);

  window._setTest = (t) => { simState.test = t; simState.t = 0; _updateLabResult(); };
  window._labMetal = (i) => { simState.metalIdx = i; simState.t = 0; _updateLabResult(); };

  window._updateLabResult = () => {
    const m = METALS_DATA[simState.metalIdx];
    const t = simState.test;
    const ok = m[t];
    const msgs = {
      shiny:    ['\u2705 ' + m.name + ' \u0644\u0627\u0645\u0639 \u2014 \u0633\u0637\u062d\u0647 \u064a\u0639\u0643\u0633 \u0627\u0644\u0636\u0648\u0621 \u0628\u0639\u062f \u0627\u0644\u062a\u0644\u0645\u064a\u0639', '\u274c \u0647\u0630\u0627 \u0627\u0644\u0645\u0639\u062f\u0646 \u0644\u0627 \u064a\u064f\u0639\u062f\u0651 \u0645\u0646 \u0627\u0644\u0641\u0644\u0632\u0651\u0627\u062a \u0627\u0644\u0644\u0627\u0645\u0639\u0629'],
      conduct:  ['\u2705 ' + m.name + ' \u0645\u0648\u0635\u0651\u0644 \u062c\u064a\u062f \u2014 \u0627\u0644\u0645\u0635\u0628\u0627\u062d \u064a\u064f\u0636\u064a\u0621!', '\u274c ' + m.name + ' \u0644\u0627 \u064a\u0648\u0635\u0651\u0644 \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621 \u062c\u064a\u062f\u0627\u064b'],
      malleable:['\u2705 ' + m.name + ' \u0642\u0627\u0628\u0644 \u0644\u0644\u0637\u0631\u0642 \u2014 \u064a\u062a\u0634\u0643\u0651\u0644 \u062f\u0648\u0646 \u0623\u0646 \u064a\u062a\u0643\u0633\u0651\u0631', '\u274c ' + m.name + ' \u064a\u062a\u0643\u0633\u0651\u0631 \u0639\u0646\u062f \u0627\u0644\u0637\u0631\u0642'],
      magnetic: ['\u2705 ' + m.name + ' \u0645\u063a\u0646\u0627\u0637\u064a\u0633\u064a \u2014 \u064a\u064f\u062c\u0630\u0628 \u0644\u0644\u0645\u063a\u0646\u0627\u0637\u064a\u0633 \u0628\u0642\u0648\u0629!', '\u274c ' + m.name + ' \u063a\u064a\u0631 \u0645\u063a\u0646\u0627\u0637\u064a\u0633\u064a']
    };
    const msg = (msgs[t] || ['',''])[ok ? 0 : 1];
    const color = ok ? '#27AE60' : '#C0392B';
    document.getElementById('lab-result').innerHTML = '<strong style="color:' + color + '">' + msg + '</strong>';
  };

  function draw() {
    const c = ctx(), w = W(), h = H();
    c.clearRect(0,0,w,h);
    c.fillStyle = '#F5F2EC'; c.fillRect(0,0,w,h);
    // Lab bench background
    c.fillStyle = '#E8E0D0'; c.fillRect(0, h*0.72, w, h*0.28);
    c.fillStyle = '#D8CEC0'; c.fillRect(0, h*0.72, w, 4);
    simState.t++;
    const tt = simState.t;
    const m = METALS_DATA[simState.metalIdx];
    const cx = w/2, cy = h*0.42;

    const TITLES = { shiny:'اختبار اللمعة ✨', conduct:'اختبار التوصيل الكهربائي ⚡', malleable:'اختبار الطرق 🔨', magnetic:'اختبار المغناطيسية 🧲' };
    c.fillStyle = '#1E2D3D'; c.font = `bold ${Math.min(16,w*0.036)}px Tajawal`;
    c.textAlign = 'center'; c.fillText(TITLES[simState.test], w/2, 32);
    c.fillStyle = '#5A6A7A'; c.font = `bold ${Math.min(13,w*0.03)}px Tajawal`;
    c.fillText(`الفلزّ: ${m.icon} ${m.name}`, w/2, 54);

    if (simState.test === 'shiny') {
      // Metal block
      const shine = (Math.sin(tt*0.035)+1)/2;
      const grad = c.createRadialGradient(cx-30,cy-20,10, cx,cy,70);
      grad.addColorStop(0,'rgba(255,255,255,0.9)');
      grad.addColorStop(0.3, m.shine); grad.addColorStop(1, m.color);
      c.fillStyle = grad;
      c.beginPath(); c.roundRect(cx-65, cy-40, 130, 80, 10); c.fill();
      c.strokeStyle = m.color+'AA'; c.lineWidth = 2; c.stroke();
      // Shine rays
      for(let i=0;i<10;i++){
        const a=(i/10)*Math.PI*2+tt*0.015;
        const r1=80, r2=105+shine*25;
        c.strokeStyle = `rgba(255,215,80,${shine*0.55})`;
        c.lineWidth = 1.5+shine; c.beginPath();
        c.moveTo(cx+Math.cos(a)*r1, cy+Math.sin(a)*r1*0.6);
        c.lineTo(cx+Math.cos(a)*r2, cy+Math.sin(a)*r2*0.6); c.stroke();
      }
      c.fillStyle = '#B07800'; c.font = `bold ${Math.min(14,w*0.032)}px Tajawal`;
      c.textAlign='center'; c.fillText('سطح لامع — يعكس الضوء', cx, cy+75);

    } else if (simState.test === 'conduct') {
      // Full circuit: battery—wire—metal—wire—bulb—wire back
      const s = Math.min(w*0.85, 340); const lx = cx-s/2, rx = cx+s/2; const by2 = cy;
      // Battery left
      c.fillStyle='#4A7A3A'; c.beginPath(); c.roundRect(lx, by2-22, 34, 44, 5); c.fill();
      c.fillStyle='#6A9A5A'; c.fillRect(lx+34, by2-14, 9, 28);
      c.fillStyle='white'; c.font='bold 16px Arial'; c.textAlign='center';
      c.fillText('+', lx+17, by2+5); c.fillText('−', lx+38, by2+5);
      // Wire segments (animated electron flow)
      const wireSegs = [[lx+43, by2, cx-55, by2],[cx+55, by2, rx-30, by2]];
      wireSegs.forEach(([x1,y1,x2,y2])=>{
        c.strokeStyle='#5080C0'; c.lineWidth=4;
        c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.stroke();
        // Electrons
        const len=Math.hypot(x2-x1,y2-y1);
        for(let e=0;e<3;e++){
          const prog=((tt*1.8+e*33)%len)/len;
          const ex=x1+(x2-x1)*prog, ey=y1+(y2-y1)*prog;
          c.beginPath(); c.arc(ex,ey,4,0,Math.PI*2);
          c.fillStyle='#FFD040'; c.fill();
        }
      });
      // Metal piece centre
      const mg = c.createLinearGradient(cx-50, by2-18, cx+50, by2+18);
      mg.addColorStop(0, m.shine); mg.addColorStop(1, m.color);
      c.fillStyle=mg; c.beginPath(); c.roundRect(cx-50,by2-18,100,36,7); c.fill();
      c.fillStyle='rgba(255,255,255,0.6)'; c.font=`bold ${Math.min(12,w*0.028)}px Tajawal`;
      c.textAlign='center'; c.fillText(m.sym, cx, by2+5);
      // Bulb right
      const bx2=rx-15;
      c.strokeStyle='#8A8A6A'; c.lineWidth=4;
      c.beginPath(); c.moveTo(rx-30, by2); c.lineTo(bx2-25, by2); c.stroke();
      const bulbOn = m.conduct;
      c.beginPath(); c.arc(bx2, by2, 22, 0, Math.PI*2);
      c.fillStyle = bulbOn ? `rgba(255,230,60,${0.7+Math.sin(tt*0.08)*0.3})` : '#E8E0C0';
      if(bulbOn){ c.shadowColor='rgba(255,200,0,0.6)'; c.shadowBlur=25; }
      c.fill(); c.shadowBlur=0;
      c.strokeStyle='#9A8A40'; c.lineWidth=2; c.stroke();
      c.font=`${Math.min(12,w*0.028)}px Arial`; c.fillStyle=bulbOn?'#5A4000':'#888';
      c.fillText(bulbOn?'💡':'○', bx2, by2+5);
      // Result text
      c.fillStyle = bulbOn ? '#1E7A40':'#8B2020';
      c.font=`bold ${Math.min(13,w*0.03)}px Tajawal`; c.textAlign='center';
      c.fillText(bulbOn ? m.name + ' يوصّل — المصباح يُضيء ✅' : m.name + ' لا يوصّل جيداً ❌', cx, cy+72);

    } else if (simState.test === 'malleable') {
      const phase = (tt % 80) / 80;
      const hammerY = cy - 70 + Math.abs(Math.sin(phase*Math.PI)) * 55;
      const flatten = Math.min(18, tt * 0.08);
      // Metal block (gets flatter)
      const mGrad = c.createLinearGradient(cx-55, cy, cx+55, cy+40);
      mGrad.addColorStop(0, m.shine); mGrad.addColorStop(1, m.color);
      c.fillStyle = mGrad;
      c.beginPath(); c.roundRect(cx-55, cy+5, 110, 42-flatten*0.4, 6); c.fill();
      c.strokeStyle = m.color; c.lineWidth = 1.5; c.stroke();
      // Hammer handle
      c.fillStyle = '#8A6A3A';
      c.beginPath(); c.roundRect(cx-5, hammerY-65, 10, 60, 3); c.fill();
      // Hammer head
      c.fillStyle='#5A5A6A';
      c.beginPath(); c.roundRect(cx-22, hammerY-30, 44, 28, 5); c.fill();
      c.fillStyle='#7A7A8A'; c.fillRect(cx-18, hammerY-29, 36, 6);
      // Impact sparks
      if (hammerY > cy + 5) {
        for(let i=0;i<6;i++){
          const a = (i/6)*Math.PI;
          c.strokeStyle=`rgba(255,${160+i*12},40,0.8)`;
          c.lineWidth=1.5; c.beginPath();
          c.moveTo(cx,cy+8);
          c.lineTo(cx+Math.cos(a)*22,cy+8-Math.sin(a)*18); c.stroke();
        }
      }
      c.fillStyle='#1E7A40'; c.font=`bold ${Math.min(13,w*0.03)}px Tajawal`;
      c.textAlign='center'; c.fillText(`${m.name} قابل للطرق 🔨 — يتشكّل ولا يتكسّر`, cx, cy+80);

    } else if (simState.test === 'magnetic') {
      const isMag = m.magnetic;
      const pull = isMag ? (Math.sin(tt*0.04)+1)*0.5 : 0;
      const magCX = cx - 70;
      // Horseshoe magnet
      c.strokeStyle='transparent';
      c.fillStyle='#C0392B'; c.beginPath(); c.roundRect(magCX-25, cy-50, 20, 70, 5); c.fill();
      c.fillStyle='#2980B9'; c.beginPath(); c.roundRect(magCX+5, cy-50, 20, 70, 5); c.fill();
      c.fillStyle='#888'; c.beginPath(); c.roundRect(magCX-25, cy-55, 50, 15, 4); c.fill();
      c.fillStyle='white'; c.font='bold 16px Arial'; c.textAlign='center';
      c.fillText('N', magCX-15, cy+12); c.fillText('S', magCX+15, cy+12);
      // Metal object
      const metX = cx + 40 + (isMag ? -pull*35 : 0);
      const mG2 = c.createLinearGradient(metX-18, cy-20, metX+18, cy+20);
      mG2.addColorStop(0, m.shine); mG2.addColorStop(1, m.color);
      c.fillStyle = mG2; c.beginPath(); c.roundRect(metX-18,cy-20,36,40,6); c.fill();
      c.fillStyle='rgba(255,255,255,0.5)'; c.font=`bold 14px Tajawal`; c.textAlign='center';
      c.fillText(m.sym, metX, cy+4);
      // Field lines if magnetic
      if(isMag){
        for(let i=0;i<5;i++){
          const yOff = (i-2)*15;
          c.strokeStyle = `rgba(180,80,200,${0.15+pull*0.35})`;
          c.lineWidth = 1.2; c.setLineDash([4,4]);
          c.beginPath(); c.moveTo(magCX+5, cy+yOff); c.lineTo(metX-18, cy+yOff); c.stroke();
          c.setLineDash([]);
        }
      }
      c.fillStyle = isMag ? '#8A2EA8' : '#888888';
      c.font=`bold ${Math.min(13,w*0.03)}px Tajawal`; c.textAlign='center';
      c.fillText(isMag ? m.name + ' مغناطيسي — يُجذب! 🧲' : m.name + ' غير مغناطيسي ❌', cx, cy+80);
    }

    // Bottom desc strip
    const DESCS = {
      shiny: 'الفلزّات عادةً لامعة لأنها تعكس الضوء — هذا يساعد في تمييز الفلزّ من اللافلزّ',
      conduct: 'الفلزّات موصّلات ممتازة — الإلكترونات الحرة فيها تنقل الشحنة بسهولة',
      malleable: 'طبقات ذرات الفلزّ تنزلق فوق بعضها عند الطرق — لذا لا تتكسّر بل تتشكّل',
      magnetic: 'الحديد والنيكل والكوبالت فقط مغناطيسية — معظم الفلزّات الأخرى غير مغناطيسية'
    };
    c.fillStyle='rgba(26,143,168,0.07)'; c.strokeStyle='rgba(26,143,168,0.15)'; c.lineWidth=1;
    c.beginPath(); c.roundRect(10, h-58, w-20, 46, 8); c.fill(); c.stroke();
    c.fillStyle='#3A5A6A'; c.font=`${Math.min(11.5,w*0.027)}px Tajawal`; c.textAlign='center';
    c.fillText(DESCS[simState.test], w/2, h-34, w-30);

    animFrame = requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  draw();
}

// ===== 8-2 TAB 1: NON-METALS — خصائص اللافلزّات =====
function simNonMetals() {
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
  simState = { selected: null, t: 0 };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔍 اختر لافلزاً</div>
      <span id="nm-btns-ph"></span>
    </div>
    <div id="nm-info" class="info-box">اضغط على أي لافلزّ لتعرّف على خصائصه</div>
    <div class="q-box">
      <strong>❓ أسئلة الكتاب (ص٣٩):</strong><br>
      ١- اذكر خمسة عناصر من اللافلزّات غير الكبريت والهيليوم.<br>
      ٢- فيم يُستخدم الكبريت؟<br>
      ٣- ما الخاصية التي تميّز الهيليوم وتجعله مفيداً في البالونات؟
    
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- الأكسجين، الكربون، الكلور، الفوسفور، النيتروجين (أو السيليكون).<br>٢- يُستخدم في تنقية الماء وصناعة المطاط الصلب.<br>٣- خفيف جداً — أخفّ من الهواء، لذا يرفع البالونات.</div>
  </div>
  `);
  buildBtns('nm-btns-ph', NM_DATA, 'window._selNM', 'nmb');

  window._selNM = (i) => {
    simState.selected = i;
    NM_DATA.forEach((_,j)=>{ const b=document.getElementById('nmb'+j); if(b) b.style.borderColor=j===i?'#1A8FA8':''; });
    const m = NM_DATA[i];
    document.getElementById('nm-info').innerHTML = `
      <strong style="color:#1A8FA8;font-size:16px;display:block;margin-bottom:7px">${m.icon} ${m.name} (${m.sym})</strong>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:15px">
        <span>الحالة</span><span><strong>${m.state}</strong></span>
        <span>✨ لامع</span><span>${m.shiny?'✅':'❌'}</span>
        <span>⚡ موصّل</span><span>${m.conduct?'✅':'❌ (معظم اللافلزّات)'}</span>
        <span>💥 هش</span><span>${m.brittle===false?(m.state==='غاز'?'— غاز':'❌'):'✅ نعم'}</span>
      </div>
      <div style="margin-top:8px;padding:7px;background:rgba(26,122,152,0.07);border-radius:6px;font-size:15px">
        📌 الاستخدام: ${m.use}<br>💡 ${m.fact}
      </div>`;
  };

  const cv = document.getElementById('simCanvas');
  cv.onclick = (e) => {
    const r=cv.getBoundingClientRect(); const mx=(e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX-r.left, my=(e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientY-r.top;
    const w=cv.width, cols=Math.min(4, Math.floor(w/105));
    const bW=Math.min(96,(w-36)/cols), bH=bW*1.18, startX=(w-cols*(bW+10))/2;
    NM_DATA.forEach((_,i)=>{
      const col=i%cols, row=Math.floor(i/cols);
      const x=startX+col*(bW+10), y=50+row*(bH+10);
      if(mx>=x&&mx<=x+bW&&my>=y&&my<=y+bH) window._selNM(i);
    });
  };

  function draw() {
    const c=ctx(), w=W(), h=H();
    c.clearRect(0,0,w,h);
    c.fillStyle='#F5F2EC'; c.fillRect(0,0,w,h);
    simState.t++;
    const tt=simState.t;

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.min(16,w*0.036)}px Tajawal`;
    c.textAlign='center'; c.fillText('اللافلزّات Non-Metals', w/2, 34);

    const cols=Math.min(4, Math.floor(w/160));
    const gap=16;
    const bW=Math.min(Math.floor((w-36-gap*(cols-1))/cols), 170);
    const bH=bW*1.18;
    const startX=(w-(cols*(bW+gap)-gap))/2;

    NM_DATA.forEach((m,i)=>{
      const col=i%cols, row=Math.floor(i/cols);
      const x=startX+col*(bW+gap), y=54+row*(bH+gap);
      const sel=simState.selected===i;

      c.shadowColor=sel?'rgba(26,143,168,0.25)':'rgba(0,0,0,0.06)';
      c.shadowBlur=sel?14:4; c.shadowOffsetY=sel?3:1;
      c.fillStyle=sel?'#E4F4F8':'white';
      c.strokeStyle=sel?'#1A8FA8':'rgba(0,0,0,0.07)'; c.lineWidth=sel?2:1;
      c.beginPath(); c.roundRect(x,y,bW,bH,10); c.fill(); c.stroke();
      c.shadowBlur=0; c.shadowOffsetY=0;

      // Element background
      const elGrad=c.createRadialGradient(x+bW*0.4,y+bH*0.28,4, x+bW/2,y+bH*0.32, bW*0.3);
      elGrad.addColorStop(0,'rgba(255,255,255,0.7)');
      elGrad.addColorStop(1, m.color+'CC');
      c.beginPath(); c.arc(x+bW/2, y+bH*0.32, bW*0.28, 0, Math.PI*2);
      c.fillStyle=elGrad; c.fill();

      // Gas particles animation
      if(m.state==='غاز'){
        for(let p=0;p<5;p++){
          const a=(p/5)*Math.PI*2+tt*0.025*(p%2?1:-1);
          const pr=bW*0.24+Math.sin(tt*0.04+p)*bW*0.04;
          c.beginPath(); c.arc(x+bW/2+Math.cos(a)*pr, y+bH*0.32+Math.sin(a)*pr*0.7, 3, 0, Math.PI*2);
          c.fillStyle=m.color+'99'; c.fill();
        }
      }

      // Symbol
      c.fillStyle='rgba(255,255,255,0.92)';
      c.font=`bold ${Math.min(16,bW*0.12)}px Tajawal`; c.textAlign='center';
      c.fillText(m.sym, x+bW/2, y+bH*0.35);

      // State badge
      const stateColors={غاز:'#4A9AE0', صلب:'#7A5A3A'};
      c.fillStyle=stateColors[m.state]||'#888'; c.font=`${Math.min(13,bW*0.09)}px Tajawal`;
      c.fillText(m.state, x+bW/2, y+bH*0.47);

      // Name
      c.fillStyle=sel?'#1A6A80':'#2C3A4A';
      c.font=`bold ${Math.min(16,bW*0.12)}px Tajawal`;
      c.fillText(m.name, x+bW/2, y+bH*0.63);

      // Icon
      c.font=`${Math.min(26,bW*0.18)}px Arial`;
      c.fillText(m.icon, x+bW/2, y+bH*0.84);

      if(sel){
        c.fillStyle='#1A8FA8'; c.font=`bold ${Math.min(7.5,bW*0.09)}px Tajawal`;
        c.fillText(m.brittle===false&&m.state==='غاز'?'غاز':m.brittle?'هش':'مرن', x+bW/2, y+bH*0.95);
      }
    });
    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  draw();
}

// ===== 8-2 TAB 2: NON-METAL RESEARCH =====
function simNonMetalResearch() {
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
  simState = { selected: null, t: 0 };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📋 اختر لافلزاً للبحث التفصيلي</div>
      <span id="nmr-btns-ph"></span>
    </div>
    <div id="nmr-info" class="info-box">اختر لافلزاً لعرض بطاقته البحثية الكاملة</div>
  `);
  buildBtns('nmr-btns-ph', NM_DATA, 'window._nmR', null);

  window._nmR = (i) => {
    simState.selected = i;
    const m = NM_DATA[i];
    document.getElementById('nmr-info').innerHTML = `
      <strong style="color:#1A8FA8;font-size:16px;display:block;margin-bottom:8px">${m.icon} ${m.name} (${m.sym})</strong>
      <table style="width:100%;font-size:15px;border-collapse:collapse">
        <tr style="background:rgba(26,143,168,0.07)"><td style="padding:4px 6px;font-weight:700">الحالة</td><td style="padding:4px 6px">${m.state}</td></tr>
        <tr><td style="padding:4px 6px;font-weight:700">الاستخدامات</td><td style="padding:4px 6px">${m.use}</td></tr>
        <tr style="background:rgba(26,143,168,0.07)"><td style="padding:4px 6px;font-weight:700">لامع</td><td style="padding:4px 6px">${m.shiny?'✅':'❌'}</td></tr>
        <tr><td style="padding:4px 6px;font-weight:700">موصّل للكهرباء</td><td style="padding:4px 6px">${m.conduct?'✅':'❌ لا يوصّل'}</td></tr>
        <tr style="background:rgba(26,143,168,0.07)"><td style="padding:4px 6px;font-weight:700">هش</td><td style="padding:4px 6px">${m.brittle===false?'— (غاز)':'✅ نعم'}</td></tr>
      </table>
      <div style="margin-top:8px;padding:8px;background:rgba(212,144,26,0.08);border-radius:6px;font-size:15px;color:#7A5010">💡 ${m.fact}</div>`;
  };

  function draw() {
    const c=ctx(), w=W(), h=H();
    c.clearRect(0,0,w,h);
    simState.t++;
    // Animated background — element symbols floating
    c.fillStyle='#F5F2EC'; c.fillRect(0,0,w,h);
    NM_DATA.forEach((m,i)=>{
      const x = w*0.08 + (i*w*0.12)%(w*0.88);
      const y = h*0.2 + Math.sin(simState.t*0.012+i*1.1)*h*0.12 + i*h*0.09;
      c.fillStyle=m.color+'15'; c.font=`bold ${Math.min(18,w*0.04)}px Tajawal`;
      c.textAlign='center'; c.fillText(m.sym, x, y);
    });
    if(simState.selected===null){
      c.fillStyle='#2C3A4A'; c.font=`bold ${Math.min(17,w*0.038)}px Tajawal`;
      c.textAlign='center'; c.fillText('نشاط 2-8: بحث حول اللافلزّات', w/2, h/2-16);
      c.fillStyle='#7A8A98'; c.font=`${Math.min(13,w*0.03)}px Tajawal`;
      c.fillText('اختر لافلزاً من اللوحة لعرض بطاقته البحثية', w/2, h/2+16);
    } else {
      const m=NM_DATA[simState.selected];
      c.fillStyle=m.color+'33';
      c.beginPath(); c.arc(w/2, h/2, Math.min(w,h)*0.25, 0, Math.PI*2); c.fill();
      c.fillStyle=m.color+'88'; c.font=`${Math.min(60,h*0.18)}px Arial`;
      c.textAlign='center'; c.fillText(m.icon, w/2, h/2+20);
      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.min(18,w*0.04)}px Tajawal`;
      c.fillText(m.name, w/2, h/2-50);
      c.fillStyle='#1A8FA8'; c.font=`bold ${Math.min(14,w*0.032)}px Tajawal`;
      c.fillText(m.sym+' — '+m.state, w/2, h/2-28);
    }
    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  draw();
}

// ===== 8-3 TAB 1: COMPARISON TABLE =====
function simMetalCompare() {
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
  simState = { highlight: -1, t: 0 };

  const ROWS = [
    { prop:'اللمعة ✨',      metal:'✅ لامعة',        nonmetal:'❌ غير لامعة',      mOk:true,  nmOk:false },
    { prop:'الحالة الصلبة',  metal:'✅ صلبة (معظمها)',nonmetal:'⚡ متنوعة',          mOk:true,  nmOk:null },
    { prop:'التوصيل الكهربائي ⚡',metal:'✅ موصّلة',  nonmetal:'❌ معظمها عازلة',   mOk:true,  nmOk:false },
    { prop:'الهشاشة 💥',     metal:'❌ لا تتكسّر',   nonmetal:'✅ هشّة (الصلبة)',   mOk:false, nmOk:true  },
    { prop:'قابلية الطرق 🔨', metal:'✅ قابلة',       nonmetal:'❌ غير قابلة',       mOk:true,  nmOk:false },
    { prop:'التوصيل الحراري 🌡️',metal:'✅ موصّلة',   nonmetal:'❌ معظمها عازلة',   mOk:true,  nmOk:false },
    { prop:'الرنين عند الطرق 🔔',metal:'✅ تُصدر رنيناً',nonmetal:'❌ لا',          mOk:true,  nmOk:false },
    { prop:'نقطة الانصهار 🌡️',metal:'⬆️ عالية عموماً',nonmetal:'⬇️ منخفضة عموماً',mOk:null, nmOk:null },
  ];
  const HL_MAP = { shiny:0, state:1, conduct:2, brittle:3, malleable:4, thermal:5, ring:6, melt:7 };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔦 اضغط لتمييز خاصية</div>
      <button class="ctrl-btn action" onclick="window._hl(0)">✨ اللمعة</button>
      <button class="ctrl-btn action" onclick="window._hl(2)">⚡ التوصيل</button>
      <button class="ctrl-btn action" onclick="window._hl(3)">💥 الهشاشة</button>
      <button class="ctrl-btn action" onclick="window._hl(4)">🔨 الطرق</button>
      <button class="ctrl-btn reset"  onclick="window._hl(-1)">↺ الكل</button>
    </div>
    <div class="q-box">
      <strong>❓ أسئلة الكتاب (ص٤٠-٤١):</strong><br>
      ١- اذكر خمسة أشياء فلزّية وخمسة لافلزّية من الصورة.<br>
      ٢- مادة غير لامعة وهشة وغير موصِّلة — من أيٍّ هي؟<br>
      ٣- الزئبق فلزّ غير مألوف. لماذا؟
    
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- الفلزيّة: لامعة، موصِّلة، غير هشّة. اللافلزيّة: غير لامعة، هشّة، عازلة.<br>٢- من اللافلزيّات (غير لامعة وهشّة وعازلة).<br>٣- لأنه سائل في درجة حرارة الغرفة على عكس بقية الفلزّات.</div>
  </div>
  `);
  window._hl = (r) => { simState.highlight = r; };

  const cv = document.getElementById('simCanvas');
  cv.onclick = (e) => {
    const rect = cv.getBoundingClientRect();
    const my = e.clientY - rect.top;
    const h = cv.height, w = cv.width;
    const tW = Math.min(w-24, 560), tX = (w-tW)/2;
    const rH = Math.min(36, (h-56)/(ROWS.length+1));
    for(let i=0; i<ROWS.length; i++){
      const ry = 44 + rH + i*rH;
      if(my >= ry && my <= ry+rH){ window._hl(simState.highlight===i ? -1 : i); return; }
    }
  };

  function draw() {
    const c=ctx(), w=W(), h=H();
    c.clearRect(0,0,w,h); c.fillStyle='#F5F2EC'; c.fillRect(0,0,w,h);
    simState.t++;

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.min(16,w*0.036)}px Tajawal`;
    c.textAlign='center'; c.fillText('مقارنة الفلزّات ⚙️ واللافلزّات 🫧', w/2, 30);

    const tW=Math.min(w-24, w*0.95), tX=(w-tW)/2;
    const c1=tW*0.40, c2=tW*0.30, c3=tW*0.30;
    const rH=Math.min(Math.round(h*0.1), Math.floor((h-56)/(ROWS.length+1)));

    // Header
    c.fillStyle='#1A8FA8';
    c.beginPath(); c.roundRect(tX,44,tW,rH,[8,8,0,0]); c.fill();
    c.fillStyle='white'; c.font=`bold ${Math.min(15,w*0.030)}px Tajawal`; c.textAlign='center';
    c.fillText('الخاصية', tX+c1/2, 44+rH/2+5);
    c.fillText('الفلزّات ⚙️', tX+c1+c2/2, 44+rH/2+5);
    c.fillText('اللافلزّات 🫧', tX+c1+c2+c3/2, 44+rH/2+5);

    ROWS.forEach((row, i) => {
      const ry=44+rH+i*rH;
      const isHL = i===simState.highlight;
      // Row BG
      if(isHL){
        c.fillStyle='rgba(26,143,168,0.13)';
        c.strokeStyle='rgba(26,143,168,0.35)'; c.lineWidth=1.5;
      } else {
        c.fillStyle = i%2===0?'white':'#FAFAF8';
        c.strokeStyle='rgba(0,0,0,0.04)'; c.lineWidth=0.5;
      }
      c.beginPath(); c.roundRect(tX,ry,tW,rH,0); c.fill(); c.stroke();

      // Property col
      c.fillStyle=isHL?'#0A5A70':'#2C3A4A';
      c.font=`${isHL?'bold ':''}${Math.min(14,w*0.028)}px Tajawal`;
      c.textAlign='right'; c.fillText(row.prop, tX+c1-10, ry+rH/2+5);

      // Metal col
      c.textAlign='center';
      if(row.mOk===true) c.fillStyle='#1E7A40';
      else if(row.mOk===false) c.fillStyle='#8B2020';
      else c.fillStyle='#7A5010';
      c.font=`${Math.min(14,w*0.028)}px Tajawal`;
      c.fillText(row.metal, tX+c1+c2/2, ry+rH/2+5);

      // Non-metal col
      if(row.nmOk===true) c.fillStyle='#1E7A40';
      else if(row.nmOk===false) c.fillStyle='#8B2020';
      else c.fillStyle='#7A5010';
      c.fillText(row.nonmetal, tX+c1+c2+c3/2, ry+rH/2+5);
    });

    // Bottom highlight glow bar
    if(simState.highlight>=0){
      const row=ROWS[simState.highlight];
      const by2=h-55;
      c.fillStyle='rgba(26,143,168,0.08)'; c.strokeStyle='rgba(26,143,168,0.2)'; c.lineWidth=1;
      c.beginPath(); c.roundRect(12,by2,w-24,44,8); c.fill(); c.stroke();
      c.fillStyle='#0A5A70'; c.font=`bold ${Math.min(13,w*0.03)}px Tajawal`; c.textAlign='center';
      c.fillText(`الخاصية المُميَّزة: ${row.prop}`, w/2, by2+16);
      c.fillStyle='#1E7A40'; c.font=`${Math.min(11,w*0.026)}px Tajawal`;
      c.fillText(`فلزّات: ${row.metal}  |  لافلزّات: ${row.nonmetal}`, w/2, by2+34);
    }
    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  draw();
}

// ===== 8-3 TAB 2: MATERIAL IDENTIFICATION LAB =====
function simMaterialTest() {
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
  const ITEMS = [
    { name:'مسمار حديد',   type:'metal',    color:'#7A8090', shine:'#B8C0CC', icon:'🔩', tests:{shiny:true, conduct:true, brittle:false, magnetic:true} },
    { name:'قطعة كبريت',   type:'nonmetal', color:'#C8B818', shine:'#E8D840', icon:'🟡', tests:{shiny:false,conduct:false,brittle:true, magnetic:false} },
    { name:'سلك نحاسي',    type:'metal',    color:'#B86028', shine:'#D89050', icon:'🔌', tests:{shiny:true, conduct:true, brittle:false, magnetic:false} },
    { name:'قطعة كربون',   type:'nonmetal', color:'#3A3A4A', shine:'#6A6A7A', icon:'🪨', tests:{shiny:false,conduct:false,brittle:true, magnetic:false} },
    { name:'شريط ألومنيوم',type:'metal',    color:'#9AA8B8', shine:'#D0DCE8', icon:'✈️', tests:{shiny:true, conduct:true, brittle:false, magnetic:false} },
    { name:'قطعة زجاج',    type:'nonmetal', color:'#A8D0E0', shine:'#C8EEF8', icon:'🪟', tests:{shiny:false,conduct:false,brittle:true, magnetic:false} },
  ];
  simState = { sel: null, test: null, revealed: {}, t:0 };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📦 اختر المادة</div>
      <span id="items-btns-ph"></span>
    </div>
    <div class="ctrl-section" id="test-btns" style="display:none">
      <div class="ctrl-label">🔬 اختر الاختبار</div>
      <button class="ctrl-btn action" onclick="window._doTest('shiny')">✨ اللمعة</button>
      <button class="ctrl-btn action" onclick="window._doTest('conduct')">⚡ التوصيل</button>
      <button class="ctrl-btn action" onclick="window._doTest('brittle')">💥 الهشاشة</button>
      <button class="ctrl-btn action" onclick="window._doTest('magnetic')">🧲 المغناطيسية</button>
    </div>
    <div id="mt-result" class="info-box">اختر مادة للبدء</div>
  `);
  buildBtns('items-btns-ph', ITEMS, 'window._pickItem', 'mti');

  window._pickItem = (i) => {
    simState.sel = i; simState.revealed = {};
    ITEMS.forEach((_,j)=>{ const b=document.getElementById('mti'+j); if(b) b.style.borderColor=j===i?'#1A8FA8':''; });
    document.getElementById('test-btns').style.display='';
    document.getElementById('mt-result').innerHTML = `<strong style="color:#1A8FA8">${ITEMS[i].icon} ${ITEMS[i].name}</strong><br>اختر اختباراً لتحديد ما إذا كانت فلزاً أم لافلزاً`;
  };
  window._doTest = (test) => {
    if(simState.sel===null) return;
    const m=ITEMS[simState.sel]; simState.test=test; simState.revealed[test]=true;
    const labels={shiny:'اللمعة ✨', conduct:'التوصيل ⚡', brittle:'الهشاشة 💥', magnetic:'المغناطيسية 🧲'};
    const res=m.tests[test];
    let msg=`<strong style="color:${res?'#27AE60':'#C0392B'}">${labels[test]}: ${res?'✅ نعم':'❌ لا'}</strong>`;
    const done=Object.keys(simState.revealed).length;
    if(done>=3){
      const isM=m.type==='metal';
      msg+=`<br><br><strong style="color:#1A8FA8;font-size:16px">🏷️ النتيجة: ${m.icon} ${m.name} هو <em>${isM?'فلزّ ⚙️':'لافلزّ 🫧'}</em></strong>`;
    } else {
      msg+=`<br><em style="font-size:15px;color:#888">أجرِ ${3-done} اختبارات أخرى للتأكد من التصنيف</em>`;
    }
    document.getElementById('mt-result').innerHTML=msg;
  };

  function draw(){
    const c=ctx(), w=W(), h=H();
    c.clearRect(0,0,w,h); c.fillStyle='#F5F2EC'; c.fillRect(0,0,w,h);
    // Lab bench
    c.fillStyle='#E0D8C8'; c.fillRect(0,h*0.68,w,h*0.32);
    c.fillStyle='#D0C8B0'; c.fillRect(0,h*0.68,w,5);
    simState.t++;
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.min(16,w*0.036)}px Tajawal`;
    c.textAlign='center'; c.fillText('مختبر تصنيف المواد 🔬', w/2, 32);

    if(simState.sel===null){
      c.fillStyle='#9AA8B5'; c.font=`${Math.min(13,w*0.03)}px Tajawal`;
      c.fillText('اختر مادة من اللوحة لاختبارها', w/2, h/2);
    } else {
      const m=ITEMS[simState.sel];
      const cx=w/2, cy=h*0.4;
      // Object
      const mg=c.createRadialGradient(cx-15,cy-15,5,cx,cy,40);
      mg.addColorStop(0,m.shine); mg.addColorStop(1,m.color);
      c.fillStyle=mg; c.beginPath(); c.roundRect(cx-42,cy-30,84,60,8); c.fill();
      c.fillStyle='rgba(255,255,255,0.4)'; c.font=`${Math.min(20,w*0.045)}px Arial`;
      c.textAlign='center'; c.fillText(m.icon,cx,cy+9);
      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.min(12,w*0.028)}px Tajawal`;
      c.fillText(m.name, cx, cy+55);

      // Test result badges
      const tests=['shiny','conduct','brittle','magnetic'];
      const tlbls=['✨','⚡','💥','🧲'];
      tests.forEach((t,i)=>{
        if(!simState.revealed[t]) return;
        const bx=cx-90+i*46, by=cy+68;
        const ok=m.tests[t];
        c.fillStyle=ok?'rgba(39,174,96,0.15)':'rgba(192,57,43,0.1)';
        c.strokeStyle=ok?'#27AE60':'#C0392B'; c.lineWidth=1.5;
        c.beginPath(); c.roundRect(bx,by,42,32,6); c.fill(); c.stroke();
        c.fillStyle=ok?'#1E7A40':'#8B2020';
        c.font=`bold ${Math.min(10,w*0.025)}px Tajawal`; c.textAlign='center';
        c.fillText(tlbls[i]+(ok?'✅':'❌'), bx+21, by+20);
      });
    }
    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  draw();
}

// ===== 8-4 TAB 1: DAILY MATERIALS =====
function simMaterials() {
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
  const MATS = [
    { name:'الزجاج', en:'Glass', color:'#A0CCE0', shine:'#D0EEF8', icon:'🪟',
      props:['شفاف ✨','مقاوم للماء 💧','صلب لكنه هش 💥','قابل لإعادة التدوير ♻️'],
      uses:'النوافذ · قناني الشرب · الأدوات العلمية · مرايا السيارات',
      pros:'شفاف · لا يتفاعل مع الطعام · يمكن تدويره', cons:'ثقيل · يتكسّر بسهولة',
      fact:'الزجاج مصنوع أساساً من رمل السيليكا SiO₂' },
    { name:'البلاستيك', en:'Plastic', color:'#D890C0', shine:'#F0B8E0', icon:'🧴',
      props:['خفيف الوزن 🪶','مرن أو صلب 🔄','ألوان متنوعة 🎨','قابل للتشكيل ✨'],
      uses:'أواني الطعام · الألعاب · التغليف · الأنابيب',
      pros:'خفيف · رخيص · متنوع الأشكال', cons:'يدوم طويلاً في البيئة — مشكلة للنفايات',
      fact:'يستغرق البلاستيك قرابة 450 سنة ليتحلل!' },
    { name:'الخزفيات', en:'Ceramics', color:'#D4A870', shine:'#F0C890', icon:'🏺',
      props:['صلبة وهشّة 💥','تتحمّل حرارة عالية 🌡️','عازلة للكهرباء ⚡','غير تفاعلية كيميائياً'],
      uses:'الأرضيات والجدران · أواني الطهي · هيكل مكوك الفضاء',
      pros:'تتحمل الحرارة الشديدة · لا تصدأ', cons:'هشّة جداً عند الصدمات',
      fact:'الخزفيات تُستخدم في درع الحرارة لمركبات الفضاء!' },
    { name:'الألياف', en:'Fibres', color:'#90C890', shine:'#B8E8B8', icon:'🧶',
      props:['طبيعية أو صناعية 🌱','مرنة وخيطية','قوية نسبياً لوزنها','نسيج سهل التشكيل'],
      uses:'الملابس القطنية والحريرية · حبال الطائرة الورقية · خيوط جراحية',
      pros:'مريحة · خفيفة · متنوعة', cons:'بعض الألياف الصناعية غير قابلة للتحلل',
      fact:'ألياف الكيفلار أقوى من الفولاذ بخمس مرات لنفس الوزن!' },
  ];
  simState = { selected: null, t: 0 };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🏠 اختر المادة</div>
      <span id="mats-btns-ph"></span>
    </div>
    <div id="mat-info" class="info-box">اختر مادة لتعرّف على خصائصها</div>
    <div class="q-box">
      <strong>❓ أسئلة الكتاب (ص٤٣):</strong><br>
      ١- اذكر خاصيتين مشتركتين دائماً بين الزجاج والبلاستيك.<br>
      ٢- لماذا يُفضَّل البلاستيك في ألعاب الأطفال على المعادن؟<br>
      ٣- ما الخاصية التي تجعل الزجاج مناسباً للنوافذ؟
    
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- كلاهما قابل للتلوين وكلاهما غير موصِّل للكهرباء.<br>٢- أخفّ وأأمن (لا يكسر) وأرخص ويمكن تشكيله بأشكال متعددة.<br>٣- الشفافية — تسمح بمرور الضوء للداخل.</div>
  </div>
  `);
  buildBtns('mats-btns-ph', MATS, 'window._selMat', 'matb');

  window._selMat = (i) => {
    simState.selected = i;
    MATS.forEach((_,j)=>{ const b=document.getElementById('matb'+j); if(b) b.style.borderColor=j===i?'#1A8FA8':''; });
    const m=MATS[i];
    document.getElementById('mat-info').innerHTML = `
      <strong style="color:#1A8FA8;font-size:16px;display:block;margin-bottom:7px">${m.icon} ${m.name} (${m.en})</strong>
      <div style="font-size:15px">
        <strong>الخصائص:</strong> ${m.props.join(' · ')}<br>
        <strong>الاستخدامات:</strong> ${m.uses}<br>
        <span style="color:#1E7A40">✅ مزايا: ${m.pros}</span><br>
        <span style="color:#8B2020">⚠️ عيوب: ${m.cons}</span>
      </div>
      <div style="margin-top:7px;padding:6px;background:rgba(212,144,26,0.08);border-radius:6px;font-size:15px;color:#7A5010">💡 ${m.fact}</div>`;
  };

  const cv=document.getElementById('simCanvas');
  cv.onclick=(e)=>{
    const r=cv.getBoundingClientRect(); const mx=(e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX-r.left, my=(e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientY-r.top;
    const w=cv.width, cols=Math.min(4,Math.floor(w/185));
    const gap4=18;
    const bW=Math.min(Math.floor((w-36-gap4*(cols-1))/cols),200), bH=bW*1.3, sx=(w-(cols*(bW+gap4)-gap4))/2;
    MATS.forEach((_,i)=>{
      const col=i%cols, row=Math.floor(i/cols);
      const x=sx+col*(bW+gap4), y=54+row*(bH+gap4);
      if(mx>=x&&mx<=x+bW&&my>=y&&my<=y+bH) window._selMat(i);
    });
  };

  function draw(){
    const c=ctx(), w=W(), h=H();
    c.clearRect(0,0,w,h); c.fillStyle='#F5F2EC'; c.fillRect(0,0,w,h);
    simState.t++;
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.min(16,w*0.036)}px Tajawal`;
    c.textAlign='center'; c.fillText('المواد في حياتنا اليومية — اضغط للتفاصيل', w/2, 34);

    const cols=Math.min(4,Math.floor(w/185));
    const gap4=18;
    const bW=Math.min(Math.floor((w-36-gap4*(cols-1))/cols),200), bH=bW*1.3, sx=(w-(cols*(bW+gap4)-gap4))/2;

    MATS.forEach((m,i)=>{
      const col=i%cols, row=Math.floor(i/cols);
      const x=sx+col*(bW+gap4), y=54+row*(bH+gap4);
      const sel=simState.selected===i;

      c.shadowColor=sel?'rgba(26,143,168,0.28)':'rgba(0,0,0,0.07)';
      c.shadowBlur=sel?16:4; c.shadowOffsetY=sel?4:2;
      c.fillStyle=sel?'#E4F4F8':'white';
      c.strokeStyle=sel?'#1A8FA8':'rgba(0,0,0,0.07)'; c.lineWidth=sel?2:1;
      c.beginPath(); c.roundRect(x,y,bW,bH,10); c.fill(); c.stroke();
      c.shadowBlur=0; c.shadowOffsetY=0;

      // Colour swatch
      const swH=bH*0.45;
      const sg=c.createLinearGradient(x+bW*0.1,y+6,x+bW*0.9,y+swH);
      sg.addColorStop(0,m.shine); sg.addColorStop(1,m.color);
      c.fillStyle=sg; c.beginPath(); c.roundRect(x+bW*0.08,y+6,bW*0.84,swH,6); c.fill();

      // Icon large
      c.font=`${Math.min(42,bW*0.33)}px Arial`; c.textAlign='center';
      c.fillText(m.icon, x+bW/2, y+swH*0.62+12);

      // Name
      c.fillStyle=sel?'#1A6A80':'#2C3A4A';
      c.font=`bold ${Math.min(17,bW*0.12)}px Tajawal`;
      c.fillText(m.name, x+bW/2, y+swH+28);
      c.fillStyle='#9AA8B5'; c.font=`${Math.min(13,bW*0.09)}px Tajawal`;
      c.fillText(m.en, x+bW/2, y+swH+44);

      // First prop
      c.fillStyle=sel?'#1A8FA8':'#7A8A98'; c.font=`${Math.min(13,bW*0.09)}px Tajawal`;
      c.fillText(m.props[0], x+bW/2, y+bH-12);
    });
    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  draw();
}

// ===== 8-4 TAB 2: GLASS vs PLASTIC — interactive =====
function simGlassPlastic() {
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
  simState = { scene: 'both', t: 0, drop: null, dropT: 0 };

  const GP = {
    glass: {
      name:'الزجاج', color:'#A0CCE0', shine:'#D0EEF8', icon:'🪟',
      props: [
        { lbl:'شفاف تماماً 🪟',   ok:true  },
        { lbl:'مقاوم للماء 💧',   ok:true  },
        { lbl:'صلب وقوي 💪',      ok:true  },
        { lbl:'خفيف الوزن 🪶',    ok:false },
        { lbl:'مقاوم للكسر 🛡️',  ok:false },
        { lbl:'قابل للتدوير ♻️',  ok:true  },
      ]
    },
    plastic: {
      name:'البلاستيك', color:'#D890C0', shine:'#F0B8E0', icon:'🧴',
      props: [
        { lbl:'شفاف تماماً 🪟',   ok:false },
        { lbl:'مقاوم للماء 💧',   ok:true  },
        { lbl:'صلب وقوي 💪',      ok:false },
        { lbl:'خفيف الوزن 🪶',    ok:true  },
        { lbl:'مقاوم للكسر 🛡️',  ok:true  },
        { lbl:'قابل للتدوير ♻️',  ok:false },
      ]
    }
  };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🖼️ وضع العرض</div>
      <button class="ctrl-btn action" onclick="window._gpScene('glass')">🪟 الزجاج فقط</button>
      <button class="ctrl-btn action" onclick="window._gpScene('plastic')">🧴 البلاستيك فقط</button>
      <button class="ctrl-btn action" onclick="window._gpScene('both')">⚖️ مقارنة جنباً لجنب</button>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🧪 محاكاة تجربة</div>
      <button class="ctrl-btn action" onclick="window._gpDrop('glass')">🪟💧 اسكب ماء على الزجاج</button>
      <button class="ctrl-btn action" onclick="window._gpDrop('plastic')">🧴💧 اسكب ماء على البلاستيك</button>
      <button class="ctrl-btn action" onclick="window._gpDrop('break')">💥 أسقط الزجاج</button>
    </div>
    <div class="q-box">
      <strong>💭 تساؤل:</strong> لماذا تُصنع نوافذ المنازل من الزجاج لا البلاستيك؟<br>
      <strong>💭 تساؤل:</strong> لماذا يُفضّل البلاستيك في ألعاب الأطفال؟
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
    <div class="q-ans-panel">النوافذ: الزجاج شفاف تماماً ومقاوم للخدش وأكثر صموداً مع الوقت.<br>الألعاب: البلاستيك خفيف وآمن (لا يتكسّر بحواف حادة) وأرخص ويمكن تلوينه بأشكال متنوعة.</div>
    </div>
  `);

  window._gpScene = (v) => { simState.scene=v; };
  window._gpDrop  = (v) => { simState.drop=v; simState.dropT=0; };

  function draw(){
    const c=ctx(), w=W(), h=H();
    c.clearRect(0,0,w,h); c.fillStyle='#F5F2EC'; c.fillRect(0,0,w,h);
    simState.t++; if(simState.dropT<120) simState.dropT++;
    const tt=simState.t, dt=simState.dropT;

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.min(16,w*0.036)}px Tajawal`;
    c.textAlign='center'; c.fillText('الزجاج 🪟  vs  البلاستيك 🧴', w/2, 30);

    const showG=simState.scene!=='plastic', showP=simState.scene!=='glass';
    const panH=h-60;

    function drawPanel(mat, px, pw){
      const m=GP[mat];
      c.fillStyle=m.color+'22'; c.strokeStyle=m.color+'88'; c.lineWidth=2;
      c.beginPath(); c.roundRect(px,45,pw,panH,12); c.fill(); c.stroke();

      // Header
      const hg=c.createLinearGradient(px,45,px,45+40);
      hg.addColorStop(0,m.color+'AA'); hg.addColorStop(1,m.color+'44');
      c.fillStyle=hg; c.beginPath(); c.roundRect(px,45,pw,40,[12,12,0,0]); c.fill();
      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.min(14,pw*0.14)}px Tajawal`;
      c.textAlign='center'; c.fillText(m.icon+' '+m.name, px+pw/2, 72);

      // Illustration
      const igY=90, igR=Math.min(pw*0.22,28);
      const ig=c.createRadialGradient(px+pw/2-igR*0.3, igY+igR*0.4, igR*0.1, px+pw/2, igY+igR*0.6, igR);
      ig.addColorStop(0, m.shine); ig.addColorStop(1, m.color);
      c.fillStyle=ig; c.beginPath(); c.roundRect(px+pw/2-igR, igY, igR*2, igR*3, igR*0.3); c.fill();
      c.fillStyle='rgba(255,255,255,0.5)'; c.font=`${Math.min(18,igR*0.8)}px Arial`;
      c.textAlign='center'; c.fillText(m.icon, px+pw/2, igY+igR*1.8);

      // Props
      m.props.forEach((p,pi)=>{
        const py=180+pi*30;
        const ok=p.ok;
        c.fillStyle=ok?'rgba(39,174,96,0.1)':'rgba(192,57,43,0.07)';
        c.beginPath(); c.roundRect(px+6, py-14, pw-12, 24, 6); c.fill();
        c.fillStyle=ok?'#1E7A40':'#8B2020';
        c.font=`${Math.min(11,pw*0.11)}px Tajawal`;
        c.textAlign='right'; c.fillText((ok?'✅ ':'❌ ')+p.lbl, px+pw-10, py+2);
      });

      // Drop animation on this panel
      if(simState.drop==='glass'&&mat==='glass'||simState.drop==='plastic'&&mat==='plastic'){
        const dropProgress=dt/80;
        const dy=45+dropProgress*panH*0.5;
        c.fillStyle=`rgba(80,140,220,${0.8*(1-dropProgress)})`;
        for(let d=0;d<3;d++){
          c.beginPath(); c.ellipse(px+pw/2+(d-1)*12,dy,5,8,0,0,Math.PI*2); c.fill();
        }
        if(dt>50){ // splash
          for(let s=0;s<6;s++){
            const a=(s/6)*Math.PI*2;
            const sr=(dt-50)*1.5;
            c.strokeStyle=`rgba(80,140,220,${0.7*(1-(dt-50)/70)})`;
            c.lineWidth=1.5; c.beginPath(); c.moveTo(px+pw/2, dy+20);
            c.lineTo(px+pw/2+Math.cos(a)*sr, dy+20+Math.sin(a)*sr*0.5); c.stroke();
          }
        }
        if(dt>60){
          c.fillStyle='rgba(80,140,220,0.6)'; c.font=`bold ${Math.min(11,pw*0.11)}px Tajawal`;
          c.textAlign='center'; c.fillText('الماء يتدحرج على السطح ✅', px+pw/2, dy+40);
        }
      }
      // Break animation glass
      if(simState.drop==='break'&&mat==='glass'){
        if(dt<30){
          const by2=igY+igR*3+dt*2;
          c.fillStyle=m.color;
          c.beginPath(); c.roundRect(px+pw/2-igR, by2, igR*2, igR*3, igR*0.3); c.fill();
        } else {
          const shards=[[-1.3,0.3],[0.1,-0.6],[1.2,0.4],[-0.5,0.8],[0.7,-0.3]];
          shards.forEach((sh,si)=>{
            const prog=(dt-30)/90;
            const sx2=px+pw/2+sh[0]*(prog*35);
            const sy=igY+igR*3+(si%2?1:-0.5)*prog*40+prog*prog*40;
            c.fillStyle=m.color+'CC'; c.strokeStyle=m.color; c.lineWidth=1;
            c.beginPath(); c.moveTo(sx2,sy); c.lineTo(sx2+10,sy+15);
            c.lineTo(sx2-5,sy+20); c.closePath(); c.fill(); c.stroke();
          });
          c.fillStyle='#8B2020'; c.font=`bold ${Math.min(11,pw*0.11)}px Tajawal`;
          c.textAlign='center'; c.fillText('يتكسّر عند السقوط 💥', px+pw/2, igY+igR*3+80);
        }
      }
    }

    if(showG&&showP){ drawPanel('glass',8,w/2-12); drawPanel('plastic',w/2+4,w/2-12); }
    else if(showG){ drawPanel('glass',12,w-24); }
    else { drawPanel('plastic',12,w-24); }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════════
//  UNIT 7  —  بيّن · محاكيات بأسلوب PhET
// ══════════════════════════════════════════════════════════════════

// ─── مساعدات مشتركة ──────────────────────────────────────────────
function P(id){return document.getElementById(id);}
function pCtrl(html){document.getElementById('simControlsPanel').innerHTML=html;}
function pArrow(c,x1,y1,x2,y2,col,lw){
  lw=lw||2;const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);if(len<2)return;
  const ux=dx/len,uy=dy/len,hs=lw*3.5;
  c.beginPath();c.moveTo(x1,y1);c.lineTo(x2-ux*hs,y2-uy*hs);
  c.strokeStyle=col;c.lineWidth=lw;c.stroke();
  c.beginPath();c.moveTo(x2,y2);c.lineTo(x2-ux*hs-uy*hs,y2-uy*hs+ux*hs);
  c.lineTo(x2-ux*hs+uy*hs,y2-uy*hs-ux*hs);c.closePath();c.fillStyle=col;c.fill();
}
function pBox(c,x,y,w,h,fill,stroke,r){
  r=r||6;c.beginPath();c.roundRect(x,y,w,h,r);
  if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke();}
}
function pTxt(c,t,x,y,col,sz,bold,align){
  c.fillStyle=col||'#333';c.font=(bold?'bold ':'')+((sz||12)+'px Tajawal');
  c.textAlign=align||'center';c.fillText(t,x,y);
}
function pGrad(c,x,y,w,h,c1,c2,vert){
  const g=vert?c.createLinearGradient(x,y,x,y+h):c.createLinearGradient(x,y,x+w,y);
  g.addColorStop(0,c1);g.addColorStop(1,c2);return g;
}
function pSlider(id,min,max,val,step,label,unit,cb){
  return `<div class="ctrl-row">
    <div class="ctrl-name">${label} <span class="ctrl-val" id="${id}V">${val}${unit}</span></div>
    <input type="range" min="${min}" max="${max}" value="${val}" step="${step||1}"
      oninput="document.getElementById('${id}V').textContent=this.value+'${unit}';(${cb})(+this.value)">
  </div>`;
}
function pReadout(label,id,col){
  return `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #F0F0F0">
    <span style="font-size:15px;color:#666">${label}</span>
    <span style="font-size:15px;font-weight:bold;color:${col||'#1A8FA8'}" id="${id}">—</span></div>`;
}




// ╔══════════════════════════════════════════════════════════════╗
// ║   UNIT 9 - القُوى والحركة  (Enhanced v5 - Drag + Big Fonts)║
// ╚══════════════════════════════════════════════════════════════╝

// ── مساعدات رسم مشتركة ─────────────────────────────────────
const U9 = {
  arrow(c,x1,y1,x2,y2,col,lw=3,label='',labelSide=1){
    const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);
    if(len<4)return;
    const ux=dx/len,uy=dy/len,hs=Math.max(lw*5.5,18);
    c.save();c.strokeStyle=col;c.fillStyle=col;c.lineWidth=lw;c.lineCap='round';
    // ظل ناعم للسهم
    c.shadowColor=col+'AA';c.shadowBlur=6;
    c.beginPath();c.moveTo(x1,y1);c.lineTo(x2-ux*hs,y2-uy*hs);c.stroke();
    c.beginPath();c.moveTo(x2,y2);
    c.lineTo(x2-ux*hs-uy*hs*0.6,y2-uy*hs+ux*hs*0.6);
    c.lineTo(x2-ux*hs+uy*hs*0.6,y2-uy*hs-ux*hs*0.6);
    c.closePath();c.fill();
    c.shadowBlur=0;
    if(label){
      // ══ تسمية السهم — خلفية بيضاء صلبة، خط سميك، حجم 16px ══
      const OFFSET = Math.max(lw*8, 30);
      const mx = (x1+x2)/2;
      const my = (y1+y2)/2;
      const px = mx - uy*OFFSET*labelSide;
      const py = my + ux*OFFSET*labelSide;
      c.font = 'bold 16px Tajawal';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      const tw = c.measureText(label).width;
      const bpad = 10, bh = 26;
      // ظل للتسمية
      c.shadowColor = 'rgba(0,0,0,0.15)';
      c.shadowBlur = 5;
      c.fillStyle = 'rgba(255,255,255,1)';
      c.strokeStyle = col;
      c.lineWidth = 2.5;
      c.beginPath();
      c.roundRect(px-tw/2-bpad, py-bh/2, tw+bpad*2, bh, 8);
      c.fill(); c.stroke();
      c.shadowBlur = 0;
      c.fillStyle = col;
      c.fillText(label, px, py);
    }
    c.restore();
  },
  rect(c,x,y,w,h,fill,stroke,r=8,lw=1.5){
    c.save();c.beginPath();c.roundRect(x,y,w,h,r);
    if(fill){c.fillStyle=fill;c.fill();}
    if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}
    c.restore();
  },
  txt(c,t,x,y,col='#333',size=16,bold=false,align='center'){
    c.save();c.font=(bold?'bold ':'')+size+'px Tajawal';
    c.fillStyle=col;c.textAlign=align;c.textBaseline='middle';c.fillText(t,x,y);c.restore();
  },
  grid(c,w,h,col='#D0DDE8',step=50){
    c.save();c.strokeStyle=col;c.lineWidth=0.8;
    for(let x=step;x<w;x+=step){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}
    for(let y=step;y<h;y+=step){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
    c.restore();
  },
  badge(c,label,val,unit,x,y,col='#2980B9',w=140){
    const g=c.createLinearGradient(x,y,x,y+52);
    g.addColorStop(0,col+'22');g.addColorStop(1,col+'0A');
    U9.rect(c,x,y,w,52,null,col,10,2);
    c.save();c.beginPath();c.roundRect(x,y,w,52,10);c.fillStyle=g;c.fill();c.restore();
    U9.txt(c,label,x+w/2,y+16,'#555',15,false);
    U9.txt(c,val,x+w/2,y+33,col,19,true);
    if(unit)U9.txt(c,unit,x+w/2,y+46,'#888',14);
  },
  gauge(c,cx,cy,r,val,max,col,label){
    const a0=Math.PI*0.75,a1=Math.PI*2.25;
    const frac=Math.min(Math.abs(val)/max,1);
    c.save();
    c.beginPath();c.arc(cx,cy,r,a0,a1);c.strokeStyle='#E0E8F0';c.lineWidth=11;c.stroke();
    if(frac>0){
      const fillCol=frac<0.5?'#27AE60':frac<0.8?'#F39C12':'#E74C3C';
      c.beginPath();c.arc(cx,cy,r,a0,a0+(a1-a0)*frac);
      c.strokeStyle=fillCol;c.lineWidth=11;c.stroke();
    }
    const na=a0+(a1-a0)*frac;
    c.strokeStyle='#2C3A4A';c.lineWidth=3;
    c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(na)*(r-10),cy+Math.sin(na)*(r-10));c.stroke();
    c.fillStyle='#2C3A4A';c.beginPath();c.arc(cx,cy,5,0,Math.PI*2);c.fill();
    U9.txt(c,Math.abs(val).toFixed(1),cx,cy+18,col,16,true);
    if(label)U9.txt(c,label,cx,cy+r+18,'#555',15);
    c.restore();
  },
  ground(c,y,w,type){
    type=type||'normal';
    const conf={
      normal:{top:'#8B6914',fill:'#A0752A'},
      smooth:{top:'#29B6F6',fill:'#81D4FA'},
      rough:{top:'#7B3A10',fill:'#A0522D'},
      ice:{top:'#90CAF9',fill:'#DDEEFF'},
      grass:{top:'#388E3C',fill:'#66BB6A'},
    };
    const cl=conf[type]||conf.normal;
    c.fillStyle=cl.fill;c.fillRect(0,y,w,30);
    c.fillStyle=cl.top;c.fillRect(0,y,w,5);
    if(type==='rough'){
      c.strokeStyle='rgba(80,30,0,0.5)';c.lineWidth=2;
      for(let tx=0;tx<w;tx+=12){c.beginPath();c.moveTo(tx,y);c.lineTo(tx+6,y-7);c.stroke();}
    }
    if(type==='ice'){
      c.strokeStyle='rgba(255,255,255,0.8)';c.lineWidth=1.5;
      for(let tx=5;tx<w;tx+=25){c.beginPath();c.moveTo(tx,y+3);c.lineTo(tx+14,y+3);c.stroke();}
    }
    if(type==='grass'){
      c.strokeStyle='#2E7D32';c.lineWidth=1.5;
      for(let tx=4;tx<w;tx+=10){
        c.beginPath();c.moveTo(tx,y);c.quadraticCurveTo(tx-3,y-6,tx,y-10);c.stroke();
      }
    }
  },
  person(c,x,y,scale=1,dir=1,pulling=false){
    // dir=1 يعني يواجه اليسار (يسحب يساراً), dir=-1 يواجه اليمين
    c.save();c.translate(x,y);c.scale(dir*scale,scale);

    // ── ساقان ──
    c.strokeStyle='#546E7A';c.lineWidth=3.5*scale;c.lineCap='round';
    // ساق يسرى
    c.beginPath();c.moveTo(-3,-6);c.lineTo(-6,10);c.stroke();
    // ساق يمنى
    c.beginPath();c.moveTo(3,-6);c.lineTo(7,10);c.stroke();
    // قدمان
    c.strokeStyle='#37474F';c.lineWidth=3*scale;
    c.beginPath();c.moveTo(-6,10);c.lineTo(-10,12);c.stroke();
    c.beginPath();c.moveTo(7,10);c.lineTo(11,12);c.stroke();

    // ── جسم (قميص) ──
    c.fillStyle='#1565C0';c.strokeStyle='#0D47A1';c.lineWidth=1.5;
    c.beginPath();c.roundRect(-9,-38,18,32,4);c.fill();c.stroke();

    // ── ذراع خلفي (أبعد عن الجهة) ──
    c.strokeStyle='#FFCBA4';c.lineWidth=4.5*scale;c.lineCap='round';
    if(pulling){
      // يسحب: ذراع ممدود للأمام (جهة الحبل)
      c.beginPath();c.moveTo(-8,-28);c.quadraticCurveTo(-18,-22,-20,-14);c.stroke();
      // يد خلفية أمامية
      c.beginPath();c.moveTo(8,-28);c.quadraticCurveTo(18,-22,20,-14);c.stroke();
    } else {
      // وقوف عادي
      c.beginPath();c.moveTo(-8,-28);c.quadraticCurveTo(-14,-18,-12,-8);c.stroke();
      c.beginPath();c.moveTo(8,-28);c.quadraticCurveTo(14,-18,12,-8);c.stroke();
    }

    // ── رأس ──
    // رقبة
    c.fillStyle='#FFCBA4';c.strokeStyle='#FFAA80';c.lineWidth=1;
    c.beginPath();c.roundRect(-4,-44,8,8,2);c.fill();
    // وجه
    c.fillStyle='#FFCBA4';c.strokeStyle='#FFAA80';c.lineWidth=1.5;
    c.beginPath();c.arc(0,-52,12,0,Math.PI*2);c.fill();c.stroke();
    // عيون
    c.fillStyle='#37474F';
    c.beginPath();c.arc(-4,-53,1.8,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(4,-53,1.8,0,Math.PI*2);c.fill();
    // ابتسامة صغيرة
    c.strokeStyle='#37474F';c.lineWidth=1.2;
    c.beginPath();c.arc(0,-50,3.5,0.2,Math.PI-0.2);c.stroke();

    // ── شعر ──
    c.fillStyle='#4A2C0A';
    c.beginPath();c.arc(0,-57,8,Math.PI,0);c.fill();
    c.beginPath();c.ellipse(0,-57,9,5,0,Math.PI+0.3,Math.PI*2-0.3);c.fill();

    c.restore();
  },
  particles:{},
  addParticles(id,x,y,col,n=8){
    if(!U9.particles[id])U9.particles[id]=[];
    for(let i=0;i<n;i++){
      U9.particles[id].push({
        x,y,vx:(Math.random()-0.5)*6,vy:-(Math.random()*5+2),
        life:1,col,r:2.5+Math.random()*2.5
      });
    }
  },
  drawParticles(c,id){
    if(!U9.particles[id])return;
    U9.particles[id]=U9.particles[id].filter(p=>{
      p.x+=p.vx;p.y+=p.vy;p.vy+=0.25;p.life-=0.022;
      if(p.life<=0)return false;
      c.save();c.globalAlpha=p.life;
      c.fillStyle=p.col;c.beginPath();c.arc(p.x,p.y,p.r*p.life,0,Math.PI*2);c.fill();
      c.restore();return true;
    });
  },
  // ── دالة مساعدة للحصول على موقع الماوس/اللمس على Canvas ──
  getPos(cv,e){
    const r=cv.getBoundingClientRect();
    const scaleX=cv.width/r.width,scaleY=cv.height/r.height;
    if(e.touches){
      return{x:(e.touches[0].clientX-r.left)*scaleX,y:(e.touches[0].clientY-r.top)*scaleY};
    }
    return{x:((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX-r.left)*scaleX,y:((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientY-r.top)*scaleY};
  }
};

// ── دالة رسم لوحة بيانات موحدة وواضحة ──
// rows = [{l:'اسم', v:'قيمة', col:'#color'}, ...]
// dark=true لخلفية داكنة (على خلفيات فاتحة dark=false)
function drawDataPanel(c, x, y, w, title, rows, dark=true){
  const rowH = 32;
  const titleH = 36;
  const padding = 8;
  const h = titleH + rows.length * rowH + padding;
  const bg = dark ? 'rgba(20,30,48,0.92)' : 'rgba(255,255,255,0.95)';
  const border = dark ? 'rgba(255,255,255,0.2)' : '#BDC3C7';
  const titleCol = dark ? 'white' : '#2C3A4A';

  // الخلفية الرئيسية
  U9.rect(c, x, y, w, h, bg, border, 12, 2);

  // العنوان
  c.save();
  c.fillStyle = dark ? 'rgba(255,255,255,0.12)' : '#F0F4F8';
  c.beginPath(); c.roundRect(x, y, w, titleH-4, [12,12,0,0]); c.fill();
  c.restore();
  U9.txt(c, title, x+w/2, y+titleH/2, titleCol, 16, true);

  // الصفوف
  rows.forEach(({l, v, col}, i) => {
    const ry = y + titleH + i * rowH;
    // خلفية متناوبة خفيفة
    if(i % 2 === 0){
      c.save();
      c.fillStyle = col + (dark ? '18' : '22');
      c.beginPath(); c.roundRect(x+4, ry+2, w-8, rowH-4, 6); c.fill();
      c.restore();
    }
    const midY = ry + rowH/2;
    // اسم المتغير - يسار
    U9.txt(c, l, x + 14, midY, dark ? 'rgba(255,255,255,0.75)' : '#666', 14, false, 'left');
    // القيمة - يمين بلون مميز
    U9.txt(c, v, x + w - 14, midY, col, 15, true, 'right');
  });
}

// ══════════════════════════════════════════════════════════════
// 9-1 Tab 1 - مختبر القوى التفاعلي مع السحب
// ══════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════
// نظام الأصوات - Web Audio API
// ══════════════════════════════════════════════════════════════
const U9Sound = {
  ctx: null,
  _enabled: true,
  _lastScratch: 0,
  init(){
    try{
      if(!this.ctx){
        const AC = window.AudioContext || window.webkitAudioContext;
        if(!AC){ this._enabled=false; return false; }
        this.ctx = new AC();
      }
      if(this.ctx.state==='suspended') this.ctx.resume();
      return true;
    } catch(e){ this._enabled=false; return false; }
  },
  // ارتطام عند السقوط أو الاصطدام - يتناسب مع الكتلة
  thud(vol=0.5, freq=80){
    try{
      if(!this._enabled||!this.init())return;
      const ctx=this.ctx;
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      const dist=ctx.createWaveShaper();
      // distortion لصوت أثقل
      const curve=new Float32Array(256);
      for(let i=0;i<256;i++) curve[i]=Math.tanh((i-128)/32)*0.8;
      dist.curve=curve;
      osc.connect(dist);dist.connect(gain);gain.connect(ctx.destination);
      osc.type='sine';
      osc.frequency.setValueAtTime(freq,ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(15,ctx.currentTime+0.25);
      gain.gain.setValueAtTime(vol,ctx.currentTime);
      gain.gain.setValueAtTime(vol*0.8,ctx.currentTime+0.05);
      gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.4);
      osc.start();osc.stop(ctx.currentTime+0.4);
    }catch(e){}
  },
  // صوت انزلاق / احتكاك (throttled)
  scratch(vol=0.3){
    try{
      const now=Date.now();
      if(now-this._lastScratch<80)return; // throttle
      this._lastScratch=now;
      if(!this._enabled||!this.init())return;
      const ctx=this.ctx;
      const buf=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.12),ctx.sampleRate);
      const data=buf.getChannelData(0);
      for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*0.5;
      const src=ctx.createBufferSource(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();
      filter.type='bandpass';filter.frequency.value=600;filter.Q.value=1.2;
      src.buffer=buf;src.connect(filter);filter.connect(gain);gain.connect(ctx.destination);
      gain.gain.setValueAtTime(vol,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.12);
      src.start();src.stop(ctx.currentTime+0.12);
    }catch(e){}
  },
  // صوت نغمة نظيفة
  ping(freq=440, dur=0.5, vol=0.3){
    try{
      if(!this._enabled||!this.init())return;
      const ctx=this.ctx;
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.connect(gain);gain.connect(ctx.destination);
      osc.type='sine';osc.frequency.value=freq;
      gain.gain.setValueAtTime(vol,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);
      osc.start();osc.stop(ctx.currentTime+dur);
    }catch(e){}
  },
  // صوت نبيه / تنبيه توازن
  balance(){
    try{
      if(!this._enabled||!this.init())return;
      this.ping(523,0.15,0.2);
      setTimeout(()=>this.ping(659,0.15,0.2),120);
    }catch(e){}
  },
  // صوت سقوط متسارع (ينخفض تدريجياً)
  falling(progress=0){
    try{
      if(!this._enabled||!this.init())return;
      const ctx=this.ctx;
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.connect(gain);gain.connect(ctx.destination);
      osc.type='sawtooth';
      const startF=300-progress*200;
      osc.frequency.setValueAtTime(Math.max(startF,80),ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(Math.max(startF*0.7,40),ctx.currentTime+0.08);
      gain.gain.setValueAtTime(0.04,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.08);
      osc.start();osc.stop(ctx.currentTime+0.08);
    }catch(e){}
  },
  // ريح / هواء (مقاومة الهواء)
  wind(vol=0.2){
    try{
      if(!this._enabled||!this.init())return;
      const ctx=this.ctx;
      const buf=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.2),ctx.sampleRate);
      const data=buf.getChannelData(0);
      for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1);
      const src=ctx.createBufferSource(),gain=ctx.createGain();
      const filter=ctx.createBiquadFilter();
      filter.type='lowpass';filter.frequency.value=400;
      src.buffer=buf;src.connect(filter);filter.connect(gain);gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0,ctx.currentTime);
      gain.gain.linearRampToValueAtTime(vol,ctx.currentTime+0.05);
      gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.2);
      src.start();src.stop(ctx.currentTime+0.2);
    }catch(e){}
  },
  // زنبرك / ارتداد
  spring(stretch=0){
    try{
      if(!this._enabled||!this.init())return;
      const ctx=this.ctx;
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.connect(gain);gain.connect(ctx.destination);
      osc.type='triangle';
      const freq=800-stretch*2;
      osc.frequency.setValueAtTime(Math.max(freq,200),ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200,ctx.currentTime+0.2);
      gain.gain.setValueAtTime(0.15,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.2);
      osc.start();osc.stop(ctx.currentTime+0.2);
    }catch(e){}
  },
  // فوز / ميدالية
  win(){
    try{
      if(!this._enabled)return;
      const notes=[523,659,784,1047,1319];
      notes.forEach((f,i)=>setTimeout(()=>this.ping(f,0.4,0.35),i*110));
    }catch(e){}
  },
  // فقاعة / سائل يُسكب
  bubble(vol=0.25){
    try{
      if(!this._enabled||!this.init())return;
      const ctx=this.ctx;
      [0,60,130].forEach(delay=>{
        setTimeout(()=>{
          const osc=ctx.createOscillator(),gain=ctx.createGain();
          osc.connect(gain);gain.connect(ctx.destination);
          osc.type='sine';
          const f=400+Math.random()*300;
          osc.frequency.setValueAtTime(f,ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(f*1.6,ctx.currentTime+0.07);
          gain.gain.setValueAtTime(vol,ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.09);
          osc.start();osc.stop(ctx.currentTime+0.09);
        },delay);
      });
    }catch(e){}
  },
  // قطرة سائل
  drop(vol=0.3){
    try{
      if(!this._enabled||!this.init())return;
      const ctx=this.ctx;
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.connect(gain);gain.connect(ctx.destination);
      osc.type='sine';
      osc.frequency.setValueAtTime(1200,ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400,ctx.currentTime+0.12);
      gain.gain.setValueAtTime(vol,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.14);
      osc.start();osc.stop(ctx.currentTime+0.14);
    }catch(e){}
  },
  // تشيير / فيزبات كيميائية
  sizzle(vol=0.2){
    try{
      if(!this._enabled||!this.init())return;
      const ctx=this.ctx;
      const buf=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.3),ctx.sampleRate);
      const data=buf.getChannelData(0);
      for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*Math.exp(-i/(data.length*0.4));
      const src=ctx.createBufferSource(),gain=ctx.createGain();
      const filter=ctx.createBiquadFilter();
      filter.type='highpass';filter.frequency.value=2000;
      src.buffer=buf;src.connect(filter);filter.connect(gain);gain.connect(ctx.destination);
      gain.gain.setValueAtTime(vol,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.3);
      src.start();src.stop(ctx.currentTime+0.3);
    }catch(e){}
  },
  // نقرة بسيطة للأزرار
  click(vol=0.12){
    try{
      if(!this._enabled||!this.init())return;
      const ctx=this.ctx;
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.connect(gain);gain.connect(ctx.destination);
      osc.type='square';
      osc.frequency.setValueAtTime(800,ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400,ctx.currentTime+0.04);
      gain.gain.setValueAtTime(vol,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.04);
      osc.start();osc.stop(ctx.currentTime+0.04);
    }catch(e){}
  },
  // إجابة صحيحة
  correct(){
    try{
      if(!this._enabled)return;
      this.ping(660,0.25,0.28);
      setTimeout(()=>this.ping(880,0.2,0.22),120);
    }catch(e){}
  },
  // إجابة خاطئة
  wrong(){
    try{
      if(!this._enabled||!this.init())return;
      const ctx=this.ctx;
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.connect(gain);gain.connect(ctx.destination);
      osc.type='sawtooth';
      osc.frequency.setValueAtTime(220,ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100,ctx.currentTime+0.3);
      gain.gain.setValueAtTime(0.25,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.3);
      osc.start();osc.stop(ctx.currentTime+0.3);
    }catch(e){}
  },
  // ارتفاع مستوى / انتقال
  levelup(){
    try{
      if(!this._enabled)return;
      [330,440,550,660].forEach((f,i)=>setTimeout(()=>this.ping(f,0.25,0.25),i*80));
    }catch(e){}
  },
  // سحر / اكتشاف
  magic(vol=0.25){
    try{
      if(!this._enabled||!this.init())return;
      const ctx=this.ctx;
      [0,80,160,240].forEach((delay,i)=>{
        setTimeout(()=>{
          const osc=ctx.createOscillator(),gain=ctx.createGain();
          osc.connect(gain);gain.connect(ctx.destination);
          osc.type='sine';
          const freqs=[1047,1319,1568,2093];
          osc.frequency.setValueAtTime(freqs[i],ctx.currentTime);
          gain.gain.setValueAtTime(vol,ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.25);
          osc.start();osc.stop(ctx.currentTime+0.25);
        },delay);
      });
    }catch(e){}
  },
  // صوت تحريك slider
  slide(vol=0.08){
    try{
      if(!this._enabled||!this.init())return;
      const ctx=this.ctx;
      const now=ctx.currentTime;
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.connect(gain);gain.connect(ctx.destination);
      osc.type='triangle';osc.frequency.value=600;
      gain.gain.setValueAtTime(vol,now);
      gain.gain.exponentialRampToValueAtTime(0.001,now+0.06);
      osc.start();osc.stop(now+0.06);
    }catch(e){}
  }
};

function simForces1(){
  if((currentSim!=='forces'&&currentSim!=='g6forces1'&&currentSim!=='g6forces2')||currentTab!==0)return;
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  const S=simState.u9F1=Object.assign({
    forceL:0,forceR:0,mass:5,
    surfaceType:'normal',
    objX:null,objV:0,objA:0,
    showForces:true,showValues:true,
    paused:false,t:0,trail:[],
    dragging:false,dragOffX:0,
    maxVelocity:0,distance:0,
    dragForce:0, dragActive:false, dragDir:0
  },simState.u9F1||{});

  const SURF={
    normal:{label:'خشب 🪵',fr:0.35,col:'#A0752A'},
    smooth:{label:'زجاج 🪟',fr:0.06,col:'#29B6F6'},
    rough:{label:'خشن 🧱',fr:0.65,col:'#E67E22'},
    ice:{label:'جليد 🧊',fr:0.02,col:'#90CAF9'},
    grass:{label:'عشب 🌿',fr:0.45,col:'#4CAF50'},
  };

  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">📦 كتلة الجسم</div>
  <div class="ctrl-row">
    <div class="ctrl-name">الكتلة: <span class="ctrl-val" id="massV">${S.mass} kg</span></div>
    <input type="range" min="1" max="50" value="${S.mass}"
      oninput="simState.u9F1.mass=+this.value;document.getElementById('massV').textContent=this.value+' kg'">
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">⬅️ قوة اليسار (N)</div>
  <div class="ctrl-row">
    <div class="ctrl-name"><span class="ctrl-val" id="fLV" style="color:#3498DB;font-size:16px;font-weight:bold">${S.forceL} N</span></div>
    <input type="range" min="0" max="200" value="${S.forceL}"
      oninput="simState.u9F1.forceL=+this.value;document.getElementById('fLV').textContent=this.value+' N'">
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">➡️ قوة اليمين (N)</div>
  <div class="ctrl-row">
    <div class="ctrl-name"><span class="ctrl-val" id="fRV" style="color:#E74C3C;font-size:16px;font-weight:bold">${S.forceR} N</span></div>
    <input type="range" min="0" max="200" value="${S.forceR}"
      oninput="simState.u9F1.forceR=+this.value;document.getElementById('fRV').textContent=this.value+' N'">
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">🏔️ نوع السطح</div>
  ${Object.entries(SURF).map(([k,v])=>`
    <button class="ctrl-btn${S.surfaceType===k?' active':''}"
      style="${S.surfaceType===k?'background:'+v.col+';color:#fff;border-color:'+v.col+';font-size:14px':''}"
      onclick="simState.u9F1.surfaceType='${k}';simState.u9F1.objX=null;simState.u9F1.objV=0;simState.u9F1.trail=[];simForces1()">
      ${v.label}</button>
  `).join('')}
</div>
<div class="ctrl-section">
  <div class="ctrl-label" style="font-size:13px">💡 اسحب الصندوق مباشرة على الشاشة!</div>
</div>
<div class="ctrl-section">
  <button class="ctrl-btn play" onclick="simState.u9F1.paused=!simState.u9F1.paused;this.textContent=simState.u9F1.paused?'▶ تشغيل':'⏸ إيقاف'">${S.paused?'▶ تشغيل':'⏸ إيقاف'}</button>
  <button class="ctrl-btn reset" onclick="Object.assign(simState.u9F1,{objX:null,objV:0,trail:[],forceL:0,forceR:0,maxVelocity:0,distance:0,dragActive:false});document.querySelectorAll('#simControlsPanel input[type=range]').forEach(r=>r.value=0);document.getElementById('fLV').textContent='0 N';document.getElementById('fRV').textContent='0 N';simForces1()">↺ إعادة</button>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (ص٤٦-٤٨):</strong><br>
  ١- اكتب جملة لكلٍّ من: دفع، سحب، شد، تدوير.<br>
  ٢- ارسم قدمك تركل كرة وأضف سهم القوّة.

    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- مثال: دفعت الباب / سحبت الكرسي / شددت الحبل / دوّرت المقبض.<br>٢- ارسم قدمك مع سهم يشير في اتجاه حركة الكرة.</div>
  </div>`;

  // ── السحب بالماوس ──
  function getObjBounds(){
    const w=cv.width,h=cv.height;
    const gY=h*0.40;  // الجسم عند 40% — مساحة كافية تحته للوزن
    const ox=S.objX||w/2;
    const bW=75+S.mass*1.8,bH=52+S.mass*1.0;  // أكبر وأوضح
    return{ox,bW,bH,gY,x1:ox-bW/2,y1:gY-bH,x2:ox+bW/2,y2:gY};
  }
  function onDown(e){
    e.preventDefault();
    const pos=U9.getPos(cv,e);
    const b=getObjBounds();
    if(pos.x>=b.x1&&pos.x<=b.x2&&pos.y>=b.y1&&pos.y<=b.y2){
      S.dragging=true;S.paused=false;
      S.dragOffX=pos.x-b.ox;
      S.objV=0;
      cv.style.cursor='grabbing';
    }
  }
  function onMove(e){
    if(!S.dragging)return;
    e.preventDefault();
    const pos=U9.getPos(cv,e);
    const b=getObjBounds();
    const newX=pos.x-S.dragOffX;
    const oldX=S.objX||cv.width/2;
    S.dragDir=newX>oldX?1:-1;
    S.dragForce=Math.abs(newX-oldX)*3;
    S.objX=Math.max(b.bW/2+10,Math.min(cv.width-b.bW/2-10,newX));
    S.objV=(newX-oldX)*0.5;
  }
  function onUp(){
    S.dragging=false;cv.style.cursor='grab';
  }
  cv.addEventListener('mousedown',onDown);
  cv.addEventListener('mousemove',onMove);
  cv.addEventListener('mouseup',onUp);
  cv.addEventListener('touchstart',onDown,{passive:false});
  cv.addEventListener('touchmove',onMove,{passive:false});
  cv.addEventListener('touchend',onUp);
  cv.style.cursor='grab';

  function draw(){
    if((currentSim!=='forces'&&currentSim!=='g6forces1'&&currentSim!=='g6forces2')||currentTab!==0){
      cv.removeEventListener('mousedown',onDown);
      cv.removeEventListener('mousemove',onMove);
      cv.removeEventListener('mouseup',onUp);
      cv.removeEventListener('touchstart',onDown);
      cv.removeEventListener('touchmove',onMove);
      cv.removeEventListener('touchend',onUp);
      cv.style.cursor='default';
      return;
    }
    const w=cv.width,h=cv.height;
    const surf=SURF[S.surfaceType];
    const gY=h*0.40;  // الجسم عند 40% — مساحة كافية تحته للوزن
    const friction=surf.fr*S.mass*10;
    const netF=S.forceR-S.forceL;
    const kineticFr=S.objV!==0?Math.sign(S.objV)*friction:
      Math.abs(netF)>friction?Math.sign(netF)*friction:netF;
    const accel=S.dragging?0:(netF-kineticFr)/S.mass;
    const balanced=Math.abs(netF)<=friction&&S.objV===0&&!S.dragging;

    if(!S.paused&&!S.dragging){
      S.t++;
      S.objA=accel;
      S.objV+=accel*0.016;
      S.objV*=0.999;
      if(S.objX===null)S.objX=w/2;
      S.objX+=S.objV*1.5;
      S.distance+=Math.abs(S.objV*1.5);
      if(Math.abs(S.objV)>S.maxVelocity)S.maxVelocity=Math.abs(S.objV);
      if(S.objX<80){S.objX=80;if(Math.abs(S.objV)>2){U9Sound.thud(0.4);U9.addParticles('f1L',80,gY,'#3498DB',8);}S.objV=0;}
      if(S.objX>w-80){S.objX=w-80;if(Math.abs(S.objV)>2){U9Sound.thud(0.4);U9.addParticles('f1R',w-80,gY,'#E74C3C',8);}S.objV=0;}
      if(S.t%2===0)S.trail.push({x:S.objX,v:Math.abs(S.objV)});
      if(S.trail.length>80)S.trail.shift();
    }

    // خلفية
    c.clearRect(0,0,w,h);
    const sky=c.createLinearGradient(0,0,0,gY);
    sky.addColorStop(0,'#E3F2FD');sky.addColorStop(1,'#F0F8FF');
    c.fillStyle=sky;c.fillRect(0,0,w,gY);
    U9.grid(c,w,h,'#C8DCF0',50);
    c.fillStyle='#F0EDE8';c.fillRect(0,gY,w,h-gY);
    U9.ground(c,gY,w,S.surfaceType);

    // جدران
    c.fillStyle='rgba(44,58,74,0.18)';
    c.fillRect(0,0,10,gY);c.fillRect(w-10,0,10,gY);
    c.strokeStyle='#2C3A4A44';c.lineWidth=2.5;
    c.beginPath();c.moveTo(10,0);c.lineTo(10,gY+5);c.stroke();
    c.beginPath();c.moveTo(w-10,0);c.lineTo(w-10,gY+5);c.stroke();

    const ox=S.objX||w/2;
    const bW=75+S.mass*1.8,bH=52+S.mass*1.0;  // أكبر وأوضح

    // مسار الحركة
    S.trail.forEach((pt,i)=>{
      const alpha=(i/S.trail.length)*0.25;
      c.fillStyle=`rgba(41,128,185,${alpha})`;
      c.beginPath();c.arc(pt.x,gY-bH/2,4*(pt.v/(S.maxVelocity||1))+1,0,Math.PI*2);c.fill();
    });

    // أشخاص — أبعد من الجسم لمنع التداخل مع الأسهم
    const personOffset = Math.max(bW*0.5 + 140, 180);
    if(S.forceL>0) U9.person(c, ox-personOffset, gY, 1.0, 1);
    if(S.forceR>0) U9.person(c, ox+personOffset, gY, 1.0, -1);

    // ①  الجسم أولاً
    const boxG=c.createLinearGradient(ox-bW/2,gY-bH,ox+bW/2,gY);
    boxG.addColorStop(0,'#F5CBA7');boxG.addColorStop(1,'#D4AC0D');
    c.save();
    if(S.dragging){c.shadowColor='rgba(231,76,60,0.5)';c.shadowBlur=20;}
    else if(Math.abs(S.objV)>0.5){c.shadowColor='rgba(41,128,185,0.4)';c.shadowBlur=14;}
    U9.rect(c,ox-bW/2,gY-bH,bW,bH,null,null,8);
    c.fillStyle=boxG;c.fill();
    c.strokeStyle=S.dragging?'#E74C3C':'#B7950B';c.lineWidth=S.dragging?3:2.5;c.stroke();
    c.restore();
    // emoji + كتلة داخل الجسم
    c.font='32px serif'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('📦', ox, gY-bH*0.55);
    U9.txt(c, S.mass+' kg', ox, gY-bH*0.18, '#5D4037', 14, true);

    // ═══════════════════════════════════════════════════════════════
    // نظام السهام — مواضع ثابتة منفصلة بالكامل، لا تداخل مطلقاً
    // المحاور العمودية:  wX = ox-bW*0.5  /  nX = ox+bW*0.5  (خارج الجسم)
    // المحاور الأفقية:   rY = ثلث الجسم من الأعلى / frY = ثلث الجسم من الأسفل
    // ═══════════════════════════════════════════════════════════════
    const wWeight = S.mass*10;

    if(S.showForces){
      // ══════════════════════════════════════════════════════
      // مواضع السهام الستة — محسوبة بدقة من gY و bH
      // ══════════════════════════════════════════════════════
      const midBox   = gY - bH * 0.5;     // منتصف الجسم
      const topBox   = gY - bH;           // أعلى الجسم
      const spaceUp  = topBox - 24;       // المساحة المتاحة فوق الجسم
      const spaceDown= gY - midBox - 10;  // المساحة من المنتصف للأرض

      // طول السهم العمودي — يتأقلم مع المساحة
      const vLenUp   = Math.min(Math.max(wWeight*0.55, 65), spaceUp*0.68, 95);
      const vLenDown = Math.min(spaceDown - 2, vLenUp, 65);

      // ══ 1. التلامس ↑ — فوق الجسم، على يسار المحور ══
      U9.arrow(c,
        ox - bW*0.26, topBox - 10,
        ox - bW*0.26, Math.max(topBox - 10 - vLenUp, 22),
        '#1B5E20', 6,
        S.showValues ? 'N='+wWeight+' N' : 'تلامس', -1);

      // ══ 2. الوزن ↓ — يُرسم في نهاية draw() فوق كل الطبقات ══

      // ══ 3. قوة اليمين → (أحمر) — من الحافة اليمنى، ارتفاع 68% ══
      if(S.forceR>0){
        const rLen = Math.max(S.forceR * 1.0, 80);
        U9.arrow(c,
          ox + bW/2 + 10, gY - bH*0.68,
          ox + bW/2 + 10 + rLen, gY - bH*0.68,
          '#B71C1C', 7,
          S.showValues ? 'F='+S.forceR+' N' : '', 1);
      }

      // ══ 4. قوة اليسار ← (أزرق) — من الحافة اليسرى، نفس ارتفاع اليمين ══
      if(S.forceL>0){
        const lLen = Math.max(S.forceL * 1.0, 80);
        U9.arrow(c,
          ox - bW/2 - 10, gY - bH*0.68,
          ox - bW/2 - 10 - lLen, gY - bH*0.68,
          '#1565C0', 7,
          S.showValues ? 'F='+S.forceL+' N' : '', 1);
      }

      // ══ 5. الاحتكاك (برتقالي) — ارتفاع 30%، فرق 38% عن السهمين الأحمر/الأزرق ══
      if(!balanced && (Math.abs(netF)>0.5 || Math.abs(S.objV)>0.1)){
        const frDir = -Math.sign(netF||S.objV);
        const frLen = Math.max(Math.min(friction * 1.0, 115), 70);
        const frX   = ox + frDir*(bW/2 + 10);
        U9.arrow(c,
          frX, gY - bH*0.28,
          frX + frDir*frLen, gY - bH*0.28,
          '#E65100', 6,
          S.showValues ? 'احتكاك='+friction.toFixed(0)+' N' : 'احتكاك',
          frDir > 0 ? 1 : -1);
      }

      // ══ 6. سحب يدوي (وردي) — 36px فوق السهمين الأفقيين ══
      if(S.dragging && S.dragForce>5)
        U9.arrow(c, ox, gY - bH*0.68 - 36,
          ox + S.dragDir*Math.min(S.dragForce*0.65, 110), gY - bH*0.68 - 36,
          '#AD1457', 5.5, 'سحب', 1);
    }

    // تسمية الكتلة داخل الجسم — لا تتداخل مع الأسهم الخارجية
    if(S.dragging) U9.txt(c,'↔',ox,gY-bH/2,'rgba(231,76,60,0.6)',18,true);

    // لوحة بيانات
    const st=S.dragging?'✋ يُسحب':balanced?'⚖️ متوازن':Math.abs(accel)>0.2?'⚡ يتسارع':'🏃 يتحرك';
    const stCol=balanced?'#27AE60':'#E74C3C';
    const panelRows=[
      {l:'قوة صافية',v:(netF-kineticFr).toFixed(1)+' N',col:'#E74C3C'},
      {l:'تسارع',v:accel.toFixed(2)+' m/s²',col:'#8E44AD'},
      {l:'السرعة',v:Math.abs(S.objV).toFixed(2)+' m/s',col:'#2980B9'},
      {l:'احتكاك',v:friction.toFixed(1)+' N',col:'#E67E22'},
      {l:'الحالة',v:st,col:stCol},
    ];
    drawDataPanel(c,10,10,250,'📊 القياس',panelRows,false);

    // مقياس التسارع
    U9.gauge(c,w-70,80,48,accel,15,'#8E44AD','التسارع');

    // شريط السرعة — يبدأ بعد سهم الوزن (gY+10+85+15=gY+110)
    const vmax=20,vfrac=Math.min(Math.abs(S.objV)/vmax,1);
    const vW=220,vX=(w-vW)/2,vY=gY+110;
    U9.rect(c,vX,vY,vW,16,'#E8EDF0','#BDC3C7',5,1.5);
    if(vfrac>0){
      const vcol=vfrac<0.5?'#27AE60':vfrac<0.8?'#F39C12':'#E74C3C';
      U9.rect(c,vX,vY,vW*vfrac,14,vcol,null,5);
    }
    U9.txt(c,'السرعة: '+Math.abs(S.objV).toFixed(2)+' m/s',w/2,vY+28,'#444',16,true);

    U9.drawParticles(c,'f1L');U9.drawParticles(c,'f1R');

    // ══ سهم الوزن ↓ — تحت الجسم مباشرة في المنطقة المفتوحة ══
    if(S.showForces){
      const _ox2 = S.objX||w/2;
      const _bW2 = 75+S.mass*1.8;
      const _wLen = Math.min(Math.max(S.mass*10*0.5, 65), 85);
      U9.arrow(c,
        _ox2 + _bW2*0.26, gY + 10,
        _ox2 + _bW2*0.26, gY + 10 + _wLen,
        '#6A1B9A', 6,
        S.showValues ? 'W='+(S.mass*10)+' N' : 'الوزن', 1);
    }
    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  if(S.objX===null)S.objX=cv.width/2;
  draw();
}

// ══════════════════════════════════════════════════════════════
// 9-1 Tab 2 - رسم الأجسام الحرة (FBD) — سحب مباشر للسهام
// ══════════════════════════════════════════════════════════════
function simForces2(){
  if((currentSim!=='forces'&&currentSim!=='g6forces1'&&currentSim!=='g6forces2')||(currentTab!==1&&!(currentSim==='g6forces2'&&currentTab===0)))return;
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  const S=simState.u9F2=Object.assign({
    scene:'free',
    showNet:true,showComponents:false,t:0,
    // قوى حرة قابلة للسحب: [mag, angleRad, locked]
    freeForces:[
      {mag:80,  angle:Math.PI*1.5, col:'#E74C3C', label:'وزن W',   locked:false},
      {mag:80,  angle:Math.PI*0.5, col:'#27AE60', label:'تلامس N', locked:false},
      {mag:60,  angle:0,            col:'#3498DB', label:'دفع Fa',  locked:false},
      {mag:40,  angle:Math.PI,      col:'#E67E22', label:'احتكاك', locked:false},
    ],
    angle:30,
    draggingIdx:-1,
  },simState.u9F2||{});

  const SCENES={
    free:    {label:'وضع حر',         icon:'✏️', preset:null},
    static:  {label:'جسم ساكن',        icon:'📦', preset:()=>[
      {mag:70,angle:Math.PI*1.5,col:'#E74C3C',label:'وزن W',locked:false},
      {mag:70,angle:Math.PI*0.5,col:'#27AE60',label:'تلامس N',locked:false},
    ]},
    moving:  {label:'يتحرك بثبات',     icon:'🏃', preset:()=>[
      {mag:60,angle:Math.PI*1.5,col:'#E74C3C',label:'وزن W',locked:false},
      {mag:60,angle:Math.PI*0.5,col:'#27AE60',label:'تلامس N',locked:false},
      {mag:70,angle:0,col:'#3498DB',label:'دفع Fa',locked:false},
      {mag:70,angle:Math.PI,col:'#E67E22',label:'احتكاك',locked:false},
    ]},
    slope:   {label:'على منحدر',       icon:'⛰️', preset:()=>{
      const th=S.angle*Math.PI/180,W=80;
      return[
        {mag:W,angle:Math.PI*1.5,col:'#E74C3C',label:'وزن W',locked:false},
        {mag:W*Math.cos(th),angle:Math.PI*0.5-th,col:'#27AE60',label:'تلامس N',locked:false},
        {mag:W*Math.sin(th),angle:Math.PI+th,col:'#E67E22',label:'احتكاك',locked:false},
      ];
    }},
    parachute:{label:'مظلة هوائية',    icon:'🪂', preset:()=>[
      {mag:75,angle:Math.PI*1.5,col:'#E74C3C',label:'وزن W',locked:false},
      {mag:75,angle:Math.PI*0.5,col:'#3498DB',label:'مقاومة D',locked:false},
    ]},
  };

  function applyPreset(key){
    const p=SCENES[key].preset;
    if(p) S.freeForces=p();
    S.scene=key;
    buildControls();
  }

  function buildControls(){
    const net=calcNet();
    const balanced=net.mag<5;
    document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">🎬 وضع</div>
  ${Object.entries(SCENES).map(([k,v])=>`
    <button class="ctrl-btn${S.scene===k?' active':''}" style="${S.scene===k?'background:#1A8FA8;color:#fff':''};font-size:12px"
      onclick="window._f2preset('${k}')">${v.icon} ${v.label}</button>
  `).join('')}
</div>
${S.scene==='slope'?`
<div class="ctrl-section">
  <div class="ctrl-label">⛰️ زاوية المنحدر: <span class="ctrl-val" id="angV">${S.angle}°</span></div>
  <input type="range" min="5" max="75" value="${S.angle}"
    oninput="simState.u9F2.angle=+this.value;document.getElementById('angV').textContent=this.value+'°';window._f2preset('slope')">
</div>`:''}
<div class="ctrl-section">
  <div class="ctrl-label">➕ أضف قوة</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px">
    <button class="ctrl-btn" style="font-size:12px" onclick="simState.u9F2.freeForces.push({mag:50,angle:0,col:'#9B59B6',label:'قوة '+(simState.u9F2.freeForces.length+1),locked:false})">＋ أفقية →</button>
    <button class="ctrl-btn" style="font-size:12px" onclick="simState.u9F2.freeForces.push({mag:50,angle:Math.PI*0.5,col:'#1ABC9C',label:'قوة '+(simState.u9F2.freeForces.length+1),locked:false})">＋ عمودية ↑</button>
    <button class="ctrl-btn" style="font-size:12px;color:#E74C3C" onclick="if(simState.u9F2.freeForces.length>0)simState.u9F2.freeForces.pop()">✕ حذف آخر</button>
    <button class="ctrl-btn reset" style="font-size:12px" onclick="simState.u9F2.freeForces=[];window._rebuildF2()">↺ مسح</button>
  </div>
</div>
<div class="ctrl-section">
  <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;margin-bottom:4px">
    <input type="checkbox" ${S.showNet?'checked':''} onchange="simState.u9F2.showNet=this.checked"> عرض المحصلة
  </label>
  <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer">
    <input type="checkbox" ${S.showComponents?'checked':''} onchange="simState.u9F2.showComponents=this.checked"> المركبات x,y
  </label>
</div>
<div class="info-box" style="font-size:12px;line-height:1.8">
  <strong>القوى: ${S.freeForces.length}</strong><br>
  Σx = <strong>${net.x.toFixed(1)}</strong> N<br>
  Σy = <strong>${net.y.toFixed(1)}</strong> N<br>
  |F| = <strong style="color:${balanced?'#27AE60':'#E74C3C'}">${net.mag.toFixed(1)}</strong> N<br>
  <span style="color:${balanced?'#27AE60':'#E74C3C'};font-weight:bold">${balanced?'⚖️ متوازنة':'⚡ غير متوازنة'}</span>
</div>
<div style="font-size:10px;color:#AAA;text-align:center;margin-top:4px">💡 اسحب رأس السهم لتغيير القوة</div>`;
  }

  window._f2preset=(k)=>{applyPreset(k);};
  window._rebuildF2=()=>{buildControls();};
  buildControls();

  function calcNet(){
    let nx=0,ny=0;
    S.freeForces.forEach(f=>{nx+=f.mag*Math.cos(f.angle);ny+=f.mag*Math.sin(f.angle);});
    return{x:nx,y:ny,mag:Math.sqrt(nx*nx+ny*ny)};
  }

  // سحب رؤوس السهام
  const OBJ_R=36, SCALE=2.2, HIT=18;
  const getOX=()=>cv.width/2, getOY=()=>cv.height*0.5;

  function onDown(e){
    e.preventDefault();
    const pos=U9.getPos(cv,e);
    const ox=getOX(),oy=getOY();
    let hit=-1,minD=HIT*HIT;
    S.freeForces.forEach((f,i)=>{
      const tx=ox+Math.cos(f.angle)*f.mag*SCALE;
      const ty=oy+Math.sin(f.angle)*f.mag*SCALE;
      const d=(pos.x-tx)**2+(pos.y-ty)**2;
      if(d<minD){minD=d;hit=i;}
    });
    S.draggingIdx=hit;
    if(hit>=0) cv.style.cursor='grabbing';
  }
  function onMove(e){
    if(S.draggingIdx<0)return;
    e.preventDefault();
    const pos=U9.getPos(cv,e);
    const ox=getOX(),oy=getOY();
    const dx=pos.x-ox, dy=pos.y-oy;
    const dist=Math.sqrt(dx*dx+dy*dy);
    const f=S.freeForces[S.draggingIdx];
    f.mag=Math.max(5,Math.min(180,dist/SCALE));
    f.angle=Math.atan2(dy,dx);
    // تحديث لوحة البيانات لحظياً
    const net=calcNet();
    const el=document.querySelector('.info-box');
    if(el){
      const b=net.mag<5;
      el.innerHTML=`<strong>القوى: ${S.freeForces.length}</strong><br>Σx = <strong>${net.x.toFixed(1)}</strong> N<br>Σy = <strong>${net.y.toFixed(1)}</strong> N<br>|F| = <strong style="color:${b?'#27AE60':'#E74C3C'}">${net.mag.toFixed(1)}</strong> N<br><span style="color:${b?'#27AE60':'#E74C3C'};font-weight:bold">${b?'⚖️ متوازنة':'⚡ غير متوازنة'}</span>`;
    }
  }
  function onUp(){S.draggingIdx=-1;cv.style.cursor='default';}
  function onCanvasHover(e){
    if(S.draggingIdx>=0)return;
    const pos=U9.getPos(cv,e);
    const ox=getOX(),oy=getOY();
    let overArrow=false;
    S.freeForces.forEach(f=>{
      const tx=ox+Math.cos(f.angle)*f.mag*SCALE;
      const ty=oy+Math.sin(f.angle)*f.mag*SCALE;
      if((pos.x-tx)**2+(pos.y-ty)**2<HIT*HIT*1.5)overArrow=true;
    });
    cv.style.cursor=overArrow?'grab':'default';
  }
  cv.addEventListener('mousedown',onDown);
  cv.addEventListener('mousemove',onMove);
  cv.addEventListener('mousemove',onCanvasHover);
  cv.addEventListener('mouseup',onUp);
  cv.addEventListener('touchstart',onDown,{passive:false});
  cv.addEventListener('touchmove',onMove,{passive:false});
  cv.addEventListener('touchend',onUp);

  function draw(){
    if((currentSim!=='forces'&&currentSim!=='g6forces1'&&currentSim!=='g6forces2')||(currentTab!==1&&!(currentSim==='g6forces2'&&currentTab===0))){
      cv.removeEventListener('mousedown',onDown);
      cv.removeEventListener('mousemove',onMove);
      cv.removeEventListener('mousemove',onCanvasHover);
      cv.removeEventListener('mouseup',onUp);
      cv.removeEventListener('touchstart',onDown);
      cv.removeEventListener('touchmove',onMove);
      cv.removeEventListener('touchend',onUp);
      return;
    }
    S.t+=0.02;
    const w=cv.width,h=cv.height;
    const ox=getOX(),oy=getOY();

    c.clearRect(0,0,w,h);
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F0F4F8');bg.addColorStop(1,'#E8EEF5');
    c.fillStyle=bg;c.fillRect(0,0,w,h);
    U9.grid(c,w,h,'#D4DCE8',45);

    const net=calcNet();
    const balanced=net.mag<5;

    // سطح تحت الجسم
    if(S.scene!=='parachute'){
      c.fillStyle='#C8B89044';c.fillRect(ox-100,oy+OBJ_R,200,10);
      c.fillStyle='#A0752A';c.fillRect(ox-100,oy+OBJ_R,200,3);
    }
    // منحدر
    if(S.scene==='slope'){
      const th=S.angle*Math.PI/180,sl=220;
      c.save();c.translate(ox-sl/2,oy+OBJ_R+5);c.rotate(-th);
      c.fillStyle='#8B6914';c.fillRect(0,-3,sl,20);c.restore();
    }

    // سهام القوى
    S.freeForces.forEach((f,i)=>{
      const tx=ox+Math.cos(f.angle)*f.mag*SCALE;
      const ty=oy+Math.sin(f.angle)*f.mag*SCALE;
      const isDragging=S.draggingIdx===i;
      const lw=isDragging?5:3.5;

      // السهم بدون تسمية في U9.arrow — نرسم التسمية يدوياً
      U9.arrow(c,ox,oy,tx,ty,f.col,lw,'',1);

      // تسمية ذكية — موضعها يعتمد على اتجاه السهم
      const labelText=f.label+' '+f.mag.toFixed(0)+'N';
      c.font='bold 12px Tajawal';
      const tw=c.measureText(labelText).width;
      const ang=f.angle;
      const arrowLen=f.mag*SCALE;

      // نقطة على السهم بنسبة 60%
      const midX=ox+Math.cos(ang)*arrowLen*0.60;
      const midY=oy+Math.sin(ang)*arrowLen*0.60;

      // حدد الاتجاه: أفقي أم عمودي؟
      const isHoriz=Math.abs(Math.cos(ang))>Math.abs(Math.sin(ang));
      let lx,ly;
      if(isHoriz){
        // سهم أفقي → ضع التسمية فوق أو تحت
        lx=midX;
        ly=midY+(Math.sin(ang)>=0?48:-48);
      } else {
        // سهم عمودي → ضع التسمية يسار أو يمين
        lx=midX+(Math.cos(ang)>=0?-tw/2-52:tw/2+52);
        ly=midY;
      }

      c.save();
      c.fillStyle='rgba(255,255,255,0.97)';
      c.strokeStyle=f.col; c.lineWidth=1.5;
      c.beginPath();c.roundRect(lx-tw/2-7,ly-11,tw+14,22,6);
      c.fill();c.stroke();
      c.fillStyle=f.col;c.textAlign='center';c.textBaseline='middle';
      c.fillText(labelText,lx,ly);
      c.restore();

      // مركبات
      if(S.showComponents&&!isDragging&&f.mag>10){
        c.save();c.setLineDash([5,4]);
        const fx=f.mag*Math.cos(f.angle)*SCALE, fy=f.mag*Math.sin(f.angle)*SCALE;
        if(Math.abs(fx)>5)U9.arrow(c,ox,oy,ox+fx,oy,f.col+'88',1.5,'',1);
        if(Math.abs(fy)>5)U9.arrow(c,ox+fx,oy,ox+fx,oy+fy,f.col+'88',1.5,'',1);
        c.restore();
      }
      // دائرة التحكم عند رأس السهم — PhET style
      const pulse=isDragging?1:1+Math.sin(S.t*3+i)*0.08;
      const r2=(isDragging?13:10)*pulse;
      c.save();
      c.shadowColor=f.col;c.shadowBlur=isDragging?16:6;
      c.beginPath();c.arc(tx,ty,r2,0,Math.PI*2);
      c.fillStyle=isDragging?f.col:'rgba(255,255,255,0.95)';
      c.fill();
      c.strokeStyle=f.col;c.lineWidth=2.5;c.stroke();
      c.shadowBlur=0;
      if(!isDragging){
        c.font='bold 11px Arial';c.textAlign='center';c.textBaseline='middle';c.fillStyle=f.col;
        c.fillText('⊕',tx,ty);
      }
      c.restore();
    });

    // محصلة
    if(S.showNet&&net.mag>5){
      const na=Math.atan2(net.y,net.x);
      const nl=Math.min(net.mag*SCALE*0.55,120);
      c.save();c.setLineDash([9,5]);
      U9.arrow(c,ox,oy,ox+Math.cos(na)*nl,oy+Math.sin(na)*nl,'#E91E63',5,'محصلة '+net.mag.toFixed(0)+'N',1);
      c.restore();
    }

    // الجسم في المنتصف
    const pulse2=balanced?1+Math.sin(S.t*3)*0.02:1;
    const sz=OBJ_R*pulse2;
    const boxG=c.createLinearGradient(ox-sz,oy-sz,ox+sz,oy+sz);
    boxG.addColorStop(0,'#AED6F1');boxG.addColorStop(1,'#5DADE2');
    c.save();
    c.shadowColor=balanced?'rgba(39,174,96,0.4)':'rgba(0,0,0,0.15)';
    c.shadowBlur=balanced?20:8;
    U9.rect(c,ox-sz,oy-sz,sz*2,sz*2,null,null,10);
    c.fillStyle=boxG;c.fill();
    c.strokeStyle=balanced?'#27AE60':'#2980B9';
    c.lineWidth=balanced?3.5:2.5;c.stroke();
    c.restore();
    U9.txt(c,SCENES[S.scene].icon,ox,oy+2,null,30);

    // شارة الحالة
    const badgeCol=balanced?'#27AE60':'#E74C3C';
    U9.rect(c,w/2-95,5,190,26,badgeCol+'18',badgeCol,8,2);
    U9.txt(c,balanced?'⚖️ قوى متوازنة — الجسم ساكن أو بسرعة ثابتة':'⚡ محصلة '+net.mag.toFixed(0)+'N — يتسارع',w/2,22,badgeCol,10,true);

    // لوحة القياسات
    U9.rect(c,w-150,5,142,66,'rgba(255,255,255,0.92)','#BDC3C7',8,1.5);
    U9.txt(c,'Σx = '+net.x.toFixed(1)+' N',w-78,22,'#2980B9',11,true);
    U9.txt(c,'Σy = '+net.y.toFixed(1)+' N',w-78,38,'#8E44AD',11,true);
    U9.txt(c,'|F| = '+net.mag.toFixed(1)+' N',w-78,54,'#E91E63',11,true);

    // تلميح
    U9.txt(c,'💡 اسحب الدوائر ⊕ لتغيير القوى مباشرة',w/2,h-12,'#999',9);

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 9-1 Tab 3 - محصلة القوى (PhET-style)
// ══════════════════════════════════════════════════════════════
function simNetForce(){
  if((currentSim!=='forces'&&currentSim!=='g6forces1'&&currentSim!=='g6forces2')||currentTab!==2)return;
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  function W(){return cv.width;}
  function H(){return cv.height;}

  // ── الثوابت ──
  const CART_MASS = 10;
  const PUSHER_TYPES = [
    {id:'big',   label:'كبير',  N:50, emoji:'🟥', col:'#E74C3C', w:26, h:56},
    {id:'small', label:'صغير',  N:25, emoji:'🟦', col:'#2980B9', w:22, h:44},
  ];

  // ── الحالة ──
  if(!simState.netForce) simState.netForce = {
    // الدافعون: [{type, side:'left'|'right', x, y, dragging}]
    pushers: [],
    cartX: 0.5,   // نسبة من العرض
    cartV: 0,
    running: false,
    won: null,    // null | 'left' | 'right' | 'tie'
    confetti: [],
    t: 0,
    drag: null,   // الشخص المسحوب حالياً
    shelf: {      // رف الاختيار
      items: [
        {type:'big',  side:'left',  x:0, y:0},
        {type:'small',side:'left',  x:0, y:0},
        {type:'big',  side:'right', x:0, y:0},
        {type:'small',side:'right', x:0, y:0},
      ]
    }
  };
  const S = simState.netForce;

  // ── حساب القوى ──
  function totalLeft()  { return S.pushers.filter(p=>p.side==='left' ).reduce((a,p)=>a+PUSHER_TYPES.find(t=>t.id===p.type).N,0); }
  function totalRight() { return S.pushers.filter(p=>p.side==='right').reduce((a,p)=>a+PUSHER_TYPES.find(t=>t.id===p.type).N,0); }
  // اليسار يدفع لليمين (+) ، اليمين يدفع لليسار (-)
  function netF()       { return totalLeft() - totalRight(); }

  // ── مناطق ثابتة ──
  function groundY(){ return H()*0.72; }
  function cartCX() { return S.cartX * W(); }
  function cartW()  { return 72; }
  function cartH()  { return 46; }

  // موضع التعليق لشخص (بجانب الكارت)
  function pusherDefaultX(side, idx){
    const gap = 52;
    if(side==='left')  return cartCX() - cartW()/2 - 30 - idx*gap;
    else               return cartCX() + cartW()/2 + 30 + idx*gap;
  }

  // ── لوحة التحكم ──
  controls(`
    <div class="ctrl-label" style="text-align:center;font-size:15px">🏆 محصلة القوى</div>
    <div class="info-box" style="font-size:13px;line-height:1.8;text-align:center">
      اسحب الأشخاص من الرف<br>وضعهم بجانب الصندوق
    </div>
    <div id="nfForceBar" style="margin:10px 0;padding:10px;background:rgba(26,143,168,0.07);
      border-radius:10px;text-align:center;font-size:14px;font-weight:700">
      ← 0N &nbsp;|&nbsp; محصلة: 0N &nbsp;|&nbsp; 0N →
    </div>
    <button id="nfGoBtn" onclick="window._nfGo()" style="width:100%;padding:14px;
      border-radius:12px;background:linear-gradient(135deg,#F39C12,#E67E22);
      color:white;border:none;font-family:Tajawal;font-size:18px;
      font-weight:800;cursor:pointer;box-shadow:0 4px 16px rgba(243,156,18,0.4);
      margin-bottom:8px">
      🚀 GO!
    </button>
    <button onclick="window._nfReset()" style="width:100%;padding:9px;
      border-radius:10px;background:rgba(0,0,0,0.05);border:1.5px solid rgba(0,0,0,0.1);
      font-family:Tajawal;font-size:14px;cursor:pointer">
      ↺ إعادة
    </button>
    <div class="q-box" style="margin-top:10px">
      <strong>❓ ص٤٦:</strong> متى يكون الجسم في توازن؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">عندما تتساوى القوى من الجانبين — المحصلة = صفر، فيبقى الجسم ساكناً.</div>
    </div>
  `);

  window._nfGo = function(){
    if(S.pushers.length===0) return;
    S.running=true; S.won=null; S.cartV=0; S.confetti=[];
    try{U9Sound.ping(660,0.25,0.2);}catch(e){}
  };
  window._nfReset = function(){
    simState.netForce=null;
    simNetForce();
  };

  function updateBar(){
    const el=document.getElementById('nfForceBar');
    if(!el) return;
    const tL=totalLeft(), tR=totalRight(), net=netF();
    const netCol = Math.abs(net)<1 ? '#27AE60' : '#E74C3C';
    el.innerHTML=`<span style="color:#2980B9">⬅ ${tL}N</span> &nbsp;|&nbsp;
      <span style="color:${netCol};font-size:15px">محصلة: ${net>0?'+':''}${net}N</span>
      &nbsp;|&nbsp; <span style="color:#E74C3C">${tR}N ➡</span>`;
  }

  // ── رسم شخص دافع (Stick figure) ──
  function drawPerson(cx, y, type, side, alpha, highlight){
    const pt = PUSHER_TYPES.find(t=>t.id===type);
    c.globalAlpha = alpha||1;
    c.save(); c.translate(cx, y);
    if(side==='right') c.scale(-1,1); // يواجه اليسار

    const col = pt.col;
    const h   = pt.h;
    const legAnim = S.running ? Math.sin(S.t*0.18)*8 : 0;

    // ظل
    c.fillStyle='rgba(0,0,0,0.1)';
    c.beginPath(); c.ellipse(0,4,pt.w*0.7,5,0,0,Math.PI*2); c.fill();

    // ساقان
    c.strokeStyle=col; c.lineWidth=4; c.lineCap='round';
    c.beginPath(); c.moveTo(-5,-h*0.28); c.lineTo(-8+legAnim,0); c.stroke();
    c.beginPath(); c.moveTo(5,-h*0.28); c.lineTo(8-legAnim,0); c.stroke();

    // جسم
    c.strokeStyle=col; c.lineWidth=5;
    c.beginPath(); c.moveTo(0,-h*0.28); c.lineTo(0,-h*0.78); c.stroke();

    // ذراعان — ذراع الدفع يمتد للأمام
    c.lineWidth=4;
    c.beginPath(); c.moveTo(0,-h*0.65); c.lineTo(pt.w*0.8,-h*0.6); c.stroke(); // ذراع دفع
    c.beginPath(); c.moveTo(0,-h*0.65); c.lineTo(-8,-h*0.5); c.stroke(); // ذراع خلفي

    // رأس
    c.beginPath(); c.arc(0,-h*0.88,10,0,Math.PI*2);
    c.fillStyle=col; c.fill();
    c.strokeStyle='rgba(0,0,0,0.15)'; c.lineWidth=1.5; c.stroke();

    // وجه
    c.fillStyle='white'; c.font='11px serif'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('😤',0,-h*0.88);

    // قيمة القوة — نرسمها بدون عكس
    c.restore(); // نخرج من save الذي فيه scale
    c.save();
    c.fillStyle=col; c.font=`bold ${type==='big'?12:11}px Tajawal`;
    c.textAlign='center'; c.textBaseline='bottom';
    c.fillText(pt.N+'N', cx, y - pt.h - 6);
    c.restore();
    // نعيد save للخروج النظيف
    c.save();

    // هالة عند التحديد
    if(highlight){
      c.strokeStyle='rgba(255,200,0,0.8)'; c.lineWidth=2.5; c.setLineDash([4,3]);
      c.beginPath(); c.arc(0,-h*0.5,pt.w+8,0,Math.PI*2); c.stroke();
      c.setLineDash([]);
    }

    c.restore();
    c.globalAlpha=1;
  }

  // ── رسم الصندوق (عربة) ──
  function drawCart(cx, y){
    const bW=cartW(), bH=cartH();
    // ظل
    c.fillStyle='rgba(0,0,0,0.12)';
    c.beginPath(); c.ellipse(cx+3,y+4,bW*0.55,7,0,0,Math.PI*2); c.fill();
    // جسم
    c.shadowColor='rgba(0,0,0,0.2)'; c.shadowBlur=10;
    const cg=c.createLinearGradient(cx-bW/2,0,cx+bW/2,0);
    cg.addColorStop(0,'#F39C12'); cg.addColorStop(0.5,'#F5B041'); cg.addColorStop(1,'#D68910');
    c.fillStyle=cg;
    c.beginPath(); c.roundRect(cx-bW/2,y-bH,bW,bH,[8,8,4,4]); c.fill();
    c.shadowBlur=0;
    c.strokeStyle='#B7770D'; c.lineWidth=2;
    c.beginPath(); c.roundRect(cx-bW/2,y-bH,bW,bH,[8,8,4,4]); c.stroke();
    // أيقونة
    c.font='20px serif'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('📦',cx,y-bH/2);
    // عجلات
    [-22,22].forEach(ox=>{
      c.beginPath(); c.arc(cx+ox,y+3,9,0,Math.PI*2);
      c.fillStyle='#2C3E50'; c.fill();
      c.beginPath(); c.arc(cx+ox,y+3,4.5,0,Math.PI*2);
      c.fillStyle='#BDC3C7'; c.fill();
    });
  }

  // ── رسم الرف (عناصر قابلة للسحب) ──
  function drawShelf(){
    const sw = W()*0.16, sh = H()*0.72;
    // عنوان
    c.font='bold 12px Tajawal'; c.fillStyle='#546E7A'; c.textAlign='center';
    c.fillText('اسحب ↓', W()*0.08, sh*0.08);
    c.fillText('اسحب ↓', W()*0.92, sh*0.08);

    // رسم كل عنصر في الرف
    S.shelf.items.forEach((item,i)=>{
      const isLeft = item.side==='left';
      const pt = PUSHER_TYPES.find(t=>t.id===item.type);
      const sx = isLeft ? W()*0.08 : W()*0.92;
      const sy = H()*0.25 + (i%2)*H()*0.22;
      item.shelfX = sx; item.shelfY = sy;

      // خلفية
      c.fillStyle=`${pt.col}18`;
      c.beginPath(); c.roundRect(sx-22,sy-pt.h-18,44,pt.h+28,[8]); c.fill();
      c.strokeStyle=`${pt.col}44`; c.lineWidth=1.5;
      c.beginPath(); c.roundRect(sx-22,sy-pt.h-18,44,pt.h+28,[8]); c.stroke();

      drawPerson(sx, sy, item.type, item.side, 1, false);
    });
  }

  // ── كونفيتي + تصفيق ──
  function celebrate(){
    S.confetti=[];
    for(let i=0;i<70;i++){
      S.confetti.push({
        x:Math.random()*W(), y:-20-Math.random()*80,
        vx:(Math.random()-0.5)*5, vy:2+Math.random()*4,
        col:['#E74C3C','#3498DB','#F1C40F','#2ECC71','#9B59B6','#E67E22'][i%6],
        r:4+Math.random()*5, rot:Math.random()*Math.PI*2, rv:(Math.random()-0.5)*0.2,
      });
    }
    // صوت تصفيق
    try{
      const ac=new(window.AudioContext||window.webkitAudioContext)();
      for(let i=0;i<8;i++) setTimeout(()=>{
        const buf=ac.createBuffer(1,ac.sampleRate*0.07,ac.sampleRate);
        const d=buf.getChannelData(0);
        for(let j=0;j<d.length;j++) d[j]=(Math.random()*2-1)*Math.exp(-j/(d.length*0.25));
        const s2=ac.createBufferSource(), g=ac.createGain();
        s2.buffer=buf; g.gain.value=0.28;
        s2.connect(g); g.connect(ac.destination); s2.start();
      }, i*110);
    }catch(e){}
  }

  // ── الرسم الرئيسي ──
  function draw(){
    if((currentSim!=='forces'&&currentSim!=='g6forces1'&&currentSim!=='g6forces2')||currentTab!==2)return;
    S.t++;
    const w=W(), h=H();
    c.clearRect(0,0,w,h);

    // خلفية
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#EBF5FB'); bg.addColorStop(1,'#D6EAF8');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // سقف / حائط
    c.fillStyle='rgba(52,73,94,0.06)';
    c.fillRect(0,0,w,h*0.07);

    // أرضية
    const gy=groundY();
    c.fillStyle='#8D6E63';
    c.fillRect(0,gy,w,6);
    // خطوط الأرضية
    c.fillStyle='rgba(101,67,33,0.12)';
    c.fillRect(0,gy+6,w,h-gy-6);
    ctx2=c; ctx2.strokeStyle='rgba(141,110,99,0.2)'; ctx2.lineWidth=1;
    for(let x=-40;x<w+40;x+=36){
      const shift=(S.cartX*w*0.3)%36;
      ctx2.beginPath(); ctx2.moveTo(x+shift,gy+6); ctx2.lineTo(x+shift+18,h); ctx2.stroke();
    }

    // ── فيزياء ──
    const net=netF();
    if(S.running && !S.won){
      const acc=net/CART_MASS * 0.016;
      S.cartV=(S.cartV+acc)*0.992;
      S.cartX+=S.cartV/w;
      S.cartX=Math.max(0.1,Math.min(0.9,S.cartX));
      // تحديث مواضع الدافعين مع الكارت
      S.pushers.forEach((p,i)=>{
        const idx=S.pushers.filter(pp=>pp.side===p.side).indexOf(p);
        p.x=pusherDefaultX(p.side,idx);
        p.y=gy;
      });
      if(S.cartX<=0.10){ S.won='right'; S.running=false; celebrate(); }
      else if(S.cartX>=0.90){ S.won='left'; S.running=false; celebrate(); }
      else if(Math.abs(net)<0.5 && Math.abs(S.cartV)<0.0005 && S.pushers.length>0){
        S.won='tie'; S.running=false;
      }
    }

    // ── رسم الرف ──
    drawShelf();

    // ── سهم المحصلة (فوق الكارت) ──
    if(Math.abs(net)>1){
      const arLen=Math.min(Math.abs(net)*1.5, 110);
      const dir=net>0?1:-1;
      const arY=gy-cartH()-22;
      const cx2=cartCX();
      c.strokeStyle='#8E44AD'; c.lineWidth=4; c.lineCap='round';
      c.beginPath(); c.moveTo(cx2,arY); c.lineTo(cx2+dir*arLen,arY); c.stroke();
      c.fillStyle='#8E44AD';
      c.beginPath();
      c.moveTo(cx2+dir*(arLen+12),arY);
      c.lineTo(cx2+dir*arLen,arY-7);
      c.lineTo(cx2+dir*arLen,arY+7);
      c.closePath(); c.fill();
      c.font='bold 12px Tajawal'; c.fillStyle='#6C3483';
      c.textAlign='center'; c.textBaseline='bottom';
      c.fillText('محصلة = '+Math.abs(net)+'N',cx2+dir*arLen/2,arY-3);
    }

    // ── رسم الدافعين الموضوعين ──
    S.pushers.forEach((p,i)=>{
      if(S.drag && S.drag.pusher===p) return; // لا ترسم المسحوب
      const isDragged = false;
      c.save();
      // سهم قوة (خط من الشخص للكارت)
      const pt2=PUSHER_TYPES.find(t=>t.id===p.type);
      if(!S.drag){
        c.strokeStyle=pt2.col+'99'; c.lineWidth=2; c.setLineDash([5,4]);
        c.beginPath(); c.moveTo(p.x,p.y-pt2.h*0.5);
        if(p.side==='left') c.lineTo(cartCX()-cartW()/2-4, p.y-pt2.h*0.5);
        else                c.lineTo(cartCX()+cartW()/2+4, p.y-pt2.h*0.5);
        c.stroke(); c.setLineDash([]);
        // رأس السهم
        const arDir=p.side==='left'?1:-1;
        const arX=p.side==='left'?cartCX()-cartW()/2-4:cartCX()+cartW()/2+4;
        c.fillStyle=pt2.col;
        c.beginPath();
        c.moveTo(arX,p.y-pt2.h*0.5);
        c.lineTo(arX-arDir*10,p.y-pt2.h*0.5-6);
        c.lineTo(arX-arDir*10,p.y-pt2.h*0.5+6);
        c.closePath(); c.fill();
      }
      c.restore();
      drawPerson(p.x, p.y, p.type, p.side, 1, false);
    });

    // ── رسم الكارت ──
    drawCart(cartCX(), gy);

    // ── رسم الشخص المسحوب ──
    if(S.drag){
      const p=S.drag;
      // هل هو قريب من جانب الكارت؟
      const nearLeft  = p.x < cartCX()-cartW()/2+60 && p.x > cartCX()-cartW()/2-120;
      const nearRight = p.x > cartCX()+cartW()/2-60 && p.x < cartCX()+cartW()/2+120;
      const nearGround= p.y > groundY()*0.6;
      const snapSide  = nearLeft?'left': nearRight?'right':null;
      if(snapSide && nearGround){
        // دائرة خضراء: "أفلت هنا"
        const sx2=snapSide==='left'?cartCX()-cartW()/2-30:cartCX()+cartW()/2+30;
        c.strokeStyle='rgba(39,174,96,0.7)'; c.lineWidth=2; c.setLineDash([5,3]);
        c.beginPath(); c.arc(sx2, groundY(), 30, 0, Math.PI*2); c.stroke();
        c.setLineDash([]);
        c.fillStyle='rgba(39,174,96,0.1)';
        c.beginPath(); c.arc(sx2, groundY(), 30, 0, Math.PI*2); c.fill();
      }
      drawPerson(p.x, p.y, p.type, p.fromSide||p.side, 0.8, true);
    }

    // ── نتيجة ──
    if(S.won){
      const msg = S.won==='tie'   ? '⚖️ القوى متوازنة — الجسم ثابت!' :
                  S.won==='right' ? '🏆 فاز الفريق الأيمن! القوة الأكبر →' :
                                    '🏆 فاز الفريق الأيسر! ← القوة الأكبر';
      const bgC = S.won==='tie' ? 'rgba(39,174,96,0.92)' : 'rgba(243,156,18,0.92)';
      c.fillStyle=bgC;
      c.beginPath(); c.roundRect(w/2-170,h*0.15,340,52,[12]); c.fill();
      c.fillStyle='white'; c.font='bold 19px Tajawal';
      c.textAlign='center'; c.textBaseline='middle';
      c.fillText(msg,w/2,h*0.15+26);
    }

    // ── كونفيتي ──
    S.confetti=S.confetti.filter(p=>{
      p.x+=p.vx; p.y+=p.vy; p.vy+=0.1; p.rot+=p.rv;
      c.save(); c.translate(p.x,p.y); c.rotate(p.rot);
      c.fillStyle=p.col; c.globalAlpha=Math.max(0,1-p.y/h);
      c.fillRect(-p.r/2,-p.r/2,p.r,p.r);
      c.restore(); c.globalAlpha=1;
      return p.y<h+20;
    });

    // ── شريط المقارنة (أعلى) ──
    {
      const tL=totalLeft(),tR=totalRight(),total=Math.max(tL+tR,1);
      const bW=Math.min(w*0.5,220), bH=12, bX=w/2-bW/2, bY=h*0.04;
      c.fillStyle='rgba(0,0,0,0.07)'; c.beginPath(); c.roundRect(bX,bY,bW,bH,[6]); c.fill();
      const lW=(tL/total)*bW;
      if(lW>0){ c.fillStyle='#2980B9'; c.beginPath(); c.roundRect(bX,bY,lW,bH,[6,0,0,6]); c.fill(); }
      if(bW-lW>0){ c.fillStyle='#E74C3C'; c.beginPath(); c.roundRect(bX+lW,bY,bW-lW,bH,[0,6,6,0]); c.fill(); }
      // خط المنتصف
      c.strokeStyle='white'; c.lineWidth=2;
      c.beginPath(); c.moveTo(bX+bW/2,bY-3); c.lineTo(bX+bW/2,bY+bH+3); c.stroke();
      c.font='11px Tajawal'; c.fillStyle='#555'; c.textAlign='center';
      if(tL>0) c.fillText(tL+'N',bX+lW/2,bY+bH+11);
      if(tR>0) c.fillText(tR+'N',bX+lW+(bW-lW)/2,bY+bH+11);
    }

    // تعليمة إذا لا يوجد أشخاص
    if(S.pushers.length===0 && !S.drag){
      c.font='14px Tajawal'; c.fillStyle='rgba(84,110,122,0.65)'; c.textAlign='center';
      c.fillText('← اسحب الأشخاص من الجانبين وضعهم بجانب الصندوق →',w/2,h*0.5);
    }

    updateBar();
    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }

  // ── أحداث السحب ──
  function getPos(e){
    const r=cv.getBoundingClientRect();
    const t=(e.touches&&e.touches[0])||e;
    return {x:(t.clientX-r.left)*cv.width/r.width,
            y:(t.clientY-r.top)*cv.height/r.height};
  }

  function onDown(e){
    e.preventDefault&&e.preventDefault();
    const p=getPos(e);

    // هل ضغط على شخص موجود على الأرضية؟
    for(let i=S.pushers.length-1;i>=0;i--){
      const pu=S.pushers[i];
      const pt2=PUSHER_TYPES.find(t=>t.id===pu.type);
      if(Math.hypot(p.x-pu.x,p.y-pu.y)<pt2.w+18){
        S.drag={pusher:pu, ox:p.x-pu.x, oy:p.y-pu.y,
                x:pu.x, y:pu.y, type:pu.type, side:pu.side, fromSide:pu.side, isFromFloor:true};
        S.pushers.splice(i,1);
        try{U9Sound.ping(440,0.1,0.08);}catch(ex){}
        return;
      }
    }

    // هل ضغط على عنصر الرف؟
    for(const item of S.shelf.items){
      if(Math.hypot(p.x-item.shelfX,p.y-item.shelfY)<30){
        const newPusher={type:item.type, side:item.side, x:item.shelfX, y:item.shelfY};
        S.drag={pusher:newPusher, ox:p.x-item.shelfX, oy:p.y-item.shelfY,
                x:item.shelfX, y:item.shelfY, type:item.type, side:item.side, fromSide:item.side, isFromFloor:false};
        try{U9Sound.ping(523,0.12,0.1);}catch(ex){}
        return;
      }
    }
  }

  function onMove(e){
    e.preventDefault&&e.preventDefault();
    if(!S.drag) return;
    const p=getPos(e);
    S.drag.x = p.x - S.drag.ox;
    S.drag.y = p.y - S.drag.oy;
    S.drag.pusher.x = S.drag.x;
    S.drag.pusher.y = S.drag.y;
  }

  function onUp(e){
    if(!S.drag) return;
    const p=S.drag;
    const pt2=PUSHER_TYPES.find(t=>t.id===p.type);
    const gy2=groundY();

    // هل قريب من جانب الكارت وعلى مستوى الأرضية؟
    const nearLeft  = p.x < cartCX()-cartW()/2+60 && p.x > cartCX()-cartW()/2-140;
    const nearRight = p.x > cartCX()+cartW()/2-60 && p.x < cartCX()+cartW()/2+140;
    const nearGround= p.y > gy2*0.55;

    let placed=false;
    if(nearGround){
      if(nearLeft || nearRight){
        const side = nearLeft ? 'left' : 'right';
        // لا أكثر من 4 دافعين لكل جهة
        if(S.pushers.filter(pp=>pp.side===side).length < 4){
          const idx=S.pushers.filter(pp=>pp.side===side).length;
          const newP={type:p.type, side, x:pusherDefaultX(side,idx), y:gy2};
          S.pushers.push(newP);
          placed=true;
          S.won=null; S.running=false; S.cartX=0.5; S.cartV=0;
          try{U9Sound.ping(660,0.2,0.15);}catch(ex){}
        }
      }
    }

    if(!placed){
      // إرجاع للرف — صوت
      try{U9Sound.ping(330,0.1,0.08);}catch(ex){}
    }

    S.drag=null;
    updateBar();
  }

  cv.addEventListener('mousedown',  onDown, false);
  cv.addEventListener('mousemove',  onMove, false);
  cv.addEventListener('mouseup',    onUp,   false);
  cv.addEventListener('touchstart', onDown, {passive:false});
  cv.addEventListener('touchmove',  onMove, {passive:false});
  cv.addEventListener('touchend',   onUp,   false);

  draw();
}



// ══════════════════════════════════════════════════════════════
// 9-2 Tab 1 - الميزان الزنبركي التفاعلي (PhET-style)
// ══════════════════════════════════════════════════════════════
function simForcemeter1(){
  if(currentSim!=='forcemeter'||currentTab!==0)return;
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  // ── الكتل المتاحة ──
  const MASSES=[
    {kg:0.1, col:'#3498DB', label:'100g'},
    {kg:0.25,col:'#27AE60', label:'250g'},
    {kg:0.5, col:'#E67E22', label:'500g'},
    {kg:1,   col:'#E74C3C', label:'1 kg'},
    {kg:2,   col:'#9B59B6', label:'2 kg'},
    {kg:5,   col:'#1ABC9C', label:'5 kg'},
  ];

  const G=10; // m/s²

  if(!simState.u9FM1) simState.u9FM1={
    // الكتلة المعلقة حالياً (null = لا شيء)
    hung: null,       // { kg, col, label }
    stretch: 0,       // امتداد الزنبرك الحالي (px)
    vel: 0,           // سرعة الاهتزاز
    // السحب
    dragging: null,   // { source:'shelf'|'hung', idx, mx, my }
    dragObj: null,    // { kg, col, label, x, y }
    // حالة
    t: 0,
  };
  const S=simState.u9FM1;

  // ── لوحة التحكم ──
  controls(`
    <div class="ctrl-label">🔬 الميزان الزنبركي</div>
    <div class="info-box" style="font-size:13px;line-height:1.8">
      اسحب أيّ كتلة من الرف وعلّقها بالخطاف<br>
      <span style="color:#1A8FA8">↕ اسحب للتعليق · ↔ اسحب للإزالة</span>
    </div>
    <div id="fm1Reading" style="margin-top:10px;padding:12px;border-radius:10px;
      background:rgba(231,76,60,0.08);border:2px solid rgba(231,76,60,0.25);
      text-align:center;font-size:22px;font-weight:800;color:#C0392B;
      font-family:monospace">
      0.0 N
    </div>
    <div id="fm1Info" style="margin-top:8px;font-size:13px;color:#555;
      text-align:center;min-height:36px;line-height:1.7"></div>
    <div style="margin-top:8px;padding:8px;background:rgba(26,143,168,0.07);
      border-radius:8px;font-size:12px;color:#1A6A8A;text-align:center">
      W = m × g = m × 10
    </div>
    <div class="q-box" style="margin-top:10px">
      <strong>❓ ص٤٩:</strong> ما وزن جسم كتلته 2 kg؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">W = 2 × 10 = 20 نيوتن</div>
    </div>
  `);

  // ── دوال مساعدة ──
  function W(){return cv.width;}
  function H(){return cv.height;}

  // موضع الخطاف (نقطة التعليق)
  function hookX(){return W()*0.52;}
  function hookY(){return H()*0.12;}
  // طول الزنبرك الطبيعي
  function naturalLen(){return H()*0.28;}
  // أقصى امتداد
  function maxStretch(){return H()*0.35;}
  // موضع نهاية الزنبرك (حيث تعلق الكتلة)
  function springEndY(){return hookY()+naturalLen()+S.stretch;}

  // حجم الكتلة (نصف القطر)
  function massR(kg){return Math.max(18, Math.min(46, 14+kg*8));}

  // موضع الرف (يمين)
  function shelfX(){return W()*0.82;}
  function shelfY(i){return H()*0.22 + i*(H()*0.12);}

  // تحديث لوحة التحكم
  function updateReadout(){
    const rd=document.getElementById('fm1Reading');
    const inf=document.getElementById('fm1Info');
    if(!rd) return;
    if(S.hung){
      const w=+(S.hung.kg*G).toFixed(2);
      rd.textContent=w.toFixed(1)+' N';
      rd.style.color='#C0392B';
      if(inf) inf.innerHTML=`<strong style="color:#E67E22">${S.hung.label}</strong> × 10 = <strong style="color:#C0392B">${w} N</strong>`;
    } else {
      rd.textContent='0.0 N';
      rd.style.color='#95A5A6';
      if(inf) inf.textContent='علّق كتلة لقياس وزنها';
    }
  }

  // ── رسم الميزان الزنبركي ──
  function drawMeter(c,w,h){
    const hx=hookX(), hy=hookY();
    const mW=50, mH=H()*0.20;
    const mTop=10, mX=hx;

    // قضيب التعليق
    c.fillStyle='#546E7A';
    c.beginPath(); c.roundRect(mX-3,0,6,mTop+2,[0,0,2,2]); c.fill();
    // قضيب أفقي (حامل)
    c.fillStyle='#546E7A';
    c.beginPath(); c.roundRect(mX-mW*0.8,mTop-3,mW*1.6,6,[3]); c.fill();

    // جسم الميزان
    const bg2=c.createLinearGradient(mX-mW/2,0,mX+mW/2,0);
    bg2.addColorStop(0,'#B0BEC5');
    bg2.addColorStop(0.25,'#FAFAFA');
    bg2.addColorStop(0.75,'#ECEFF1');
    bg2.addColorStop(1,'#90A4AE');
    c.shadowColor='rgba(0,0,0,0.2)'; c.shadowBlur=12; c.shadowOffsetX=3;
    c.fillStyle=bg2;
    c.beginPath(); c.roundRect(mX-mW/2,mTop,mW,mH,[6,6,12,12]); c.fill();
    c.shadowBlur=0; c.shadowOffsetX=0;
    c.strokeStyle='#78909C'; c.lineWidth=1.5;
    c.beginPath(); c.roundRect(mX-mW/2,mTop,mW,mH,[6,6,12,12]); c.stroke();

    // شريط أحمر أعلى
    c.fillStyle='#E53935';
    c.beginPath(); c.roundRect(mX-mW/2,mTop,mW,12,[6,6,0,0]); c.fill();

    // شاشة رقمية
    const dispY=mTop+16, dispH=26;
    c.fillStyle='#0D1117';
    c.beginPath(); c.roundRect(mX-mW/2+5,dispY,mW-10,dispH,[4]); c.fill();
    c.strokeStyle='#2ECC71'; c.lineWidth=1;
    c.beginPath(); c.roundRect(mX-mW/2+5,dispY,mW-10,dispH,[4]); c.stroke();
    const dispVal=S.hung ? S.hung.kg*G : 0;
    c.fillStyle='#2ECC71';
    c.font='bold 13px monospace';
    c.textAlign='center'; c.textBaseline='middle';
    c.fillText((Math.max(0,dispVal)).toFixed(1)+' N', mX, dispY+dispH/2);

    // تدريج جانبي
    const scX=mX+mW/2+5, scTop=mTop+12, scBot=mTop+mH-8, scH=scBot-scTop, scW=48;
    c.fillStyle='rgba(255,255,255,0.9)';
    c.beginPath(); c.roundRect(scX,scTop,scW,scH,[4]); c.fill();
    c.strokeStyle='#CFD8DC'; c.lineWidth=1;
    c.beginPath(); c.roundRect(scX,scTop,scW,scH,[4]); c.stroke();
    const maxN=50, steps=5;
    for(let i=0;i<=steps;i++){
      const ty=scTop+i*(scH/steps);
      const val=maxN-i*(maxN/steps);
      c.fillStyle='#455A64';
      c.fillRect(scX+3,ty-1,10,2);
      c.font='bold 10px Tajawal';
      c.textAlign='left'; c.textBaseline='middle'; c.fillStyle='#1A252F';
      c.fillText(val+'N', scX+16, ty);
    }
    // خطوط فرعية
    for(let i=1;i<steps*2;i++){
      if(i%2===0) continue;
      const ty=scTop+i*(scH/(steps*2));
      c.fillStyle='#90A4AE';
      c.fillRect(scX+3,ty-0.5,6,1);
    }
    // مؤشر
    if(S.hung){
      const frac=Math.min(S.hung.kg*G/maxN,1);
      const indY=scTop+frac*scH;
      c.fillStyle='#E53935';
      c.fillRect(scX,indY-2,scW,4);
      c.beginPath(); c.moveTo(scX,indY); c.lineTo(scX-8,indY-5); c.lineTo(scX-8,indY+5); c.closePath(); c.fill();
      c.font='bold 10px monospace'; c.fillStyle='#C0392B';
      c.textAlign='left'; c.textBaseline= frac<0.5?'top':'bottom';
      c.fillText((S.hung.kg*G).toFixed(1)+'N', scX+14, frac<0.5?indY+3:indY-3);
    }

    // خطاف
    const hookEndY=mTop+mH;
    c.strokeStyle='#37474F'; c.lineWidth=3; c.lineCap='round';
    c.beginPath(); c.moveTo(mX,hookEndY); c.lineTo(mX,hookEndY+12); c.stroke();
    c.beginPath(); c.arc(mX,hookEndY+17,5,-Math.PI/2,Math.PI/2); c.stroke();

    return {hookEndY: hookEndY+17+5};
  }

  // ── رسم الزنبرك ──
  function drawSpring(c,x,fromY,toY,col){
    const coils=12;
    const coilW=12;
    c.strokeStyle=col||'#455A64'; c.lineWidth=2.5; c.lineCap='round';
    c.beginPath();
    for(let i=0;i<=coils*4;i++){
      const t=i/(coils*4);
      const cy=fromY+t*(toY-fromY);
      const cx=x+(i%4<2?1:-1)*coilW*(i%2===0?0:1);
      i===0?c.moveTo(cx,cy):c.lineTo(cx,cy);
    }
    c.stroke();
    // لمعة
    c.strokeStyle='rgba(255,255,255,0.35)'; c.lineWidth=1.2;
    c.beginPath();
    for(let i=0;i<=coils*4;i++){
      const t=i/(coils*4);
      const cy=fromY+t*(toY-fromY);
      const cx=x+(i%4<2?1:-1)*coilW*(i%2===0?0:1)-2;
      i===0?c.moveTo(cx,cy):c.lineTo(cx,cy);
    }
    c.stroke();
  }

  // ── رسم كتلة ──
  function drawMassObj(c,x,y,m,alpha){
    const r=massR(m.kg);
    c.globalAlpha=alpha||1;
    // ظل
    c.fillStyle='rgba(0,0,0,0.15)';
    c.beginPath(); c.ellipse(x+4,y+r+4,r*0.65,r*0.2,0,0,Math.PI*2); c.fill();
    // جسم
    const g2=c.createRadialGradient(x-r*0.3,y-r*0.3,2,x,y,r);
    g2.addColorStop(0,lightenColor(m.col));
    g2.addColorStop(0.6,m.col);
    g2.addColorStop(1,darkenColor(m.col));
    c.shadowColor='rgba(0,0,0,0.3)'; c.shadowBlur=10;
    c.fillStyle=g2;
    c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill();
    c.shadowBlur=0;
    c.strokeStyle=darkenColor(m.col); c.lineWidth=2;
    c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.stroke();
    // نص
    c.fillStyle='white';
    c.font=`bold ${Math.max(10,Math.min(15,r*0.55))}px Tajawal,Arial`;
    c.textAlign='center'; c.textBaseline='middle';
    c.fillText(m.label,x,y);
    c.globalAlpha=1;
  }

  // ── رسم الرف ──
  function drawShelf(c){
    const sx=shelfX();
    // خلفية الرف
    c.fillStyle='rgba(84,110,122,0.08)';
    c.beginPath(); c.roundRect(sx-40,H()*0.16,80,H()*0.62+20,[8]); c.fill();
    c.strokeStyle='rgba(84,110,122,0.2)'; c.lineWidth=1;
    c.beginPath(); c.roundRect(sx-40,H()*0.16,80,H()*0.62+20,[8]); c.stroke();
    // عنوان الرف
    c.font='bold 12px Tajawal'; c.fillStyle='#546E7A'; c.textAlign='center';
    c.fillText('الكتل', sx, H()*0.14);

    MASSES.forEach((m,i)=>{
      // لا ترسم الكتلة إذا كانت على الخطاف حالياً
      if(S.hung && S.hung===m) return;
      // لا ترسمها إذا كانت تُسحب
      if(S.dragObj && S.dragObj===m) return;
      const sy=shelfY(i);
      // رف صغير
      c.fillStyle='rgba(120,144,156,0.3)';
      c.fillRect(sx-35,sy+massR(m.kg)+4,70,4);
      drawMassObj(c,sx,sy,m,1);
    });
  }

  function lightenColor(hex){
    const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    return `rgb(${Math.min(255,r+60)},${Math.min(255,g+60)},${Math.min(255,b+60)})`;
  }
  function darkenColor(hex){
    const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    return `rgb(${Math.max(0,r-50)},${Math.max(0,g-50)},${Math.max(0,b-50)})`;
  }

  // ── الرسم الرئيسي ──
  function draw(){
    if(currentSim!=='forcemeter'||currentTab!==0)return;
    S.t++;
    const w=W(), h=H();
    c.clearRect(0,0,w,h);

    // خلفية
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F0F7FF'); bg.addColorStop(1,'#E8F4F8');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // سقف
    c.fillStyle='#78909C';
    c.fillRect(0,0,w,8);

    // رسم الميزان
    const {hookEndY}=drawMeter(c,w,h);

    // فيزياء الزنبرك
    const targetStretch = S.hung ? Math.min(S.hung.kg*G*3.5, maxStretch()) : 0;
    S.vel=(S.vel+(targetStretch-S.stretch)*0.14)*0.78;
    S.stretch+=S.vel;

    // الزنبرك من نهاية الميزان لنقطة تعليق الكتلة
    const sx=hookX(), sy=hookEndY;
    const springEnd = sy + naturalLen() + S.stretch;

    if(S.hung){
      drawSpring(c, sx, sy, springEnd, '#546E7A');
      // خيط توصيل
      c.strokeStyle='#546E7A'; c.lineWidth=2;
      c.beginPath(); c.moveTo(sx,sy); c.lineTo(sx,sy+8); c.stroke();

      // الكتلة
      const mr=massR(S.hung.kg);
      drawMassObj(c, sx, springEnd+mr, S.hung, 1);

      // سهم الوزن تحت الكتلة
      const wN=+(S.hung.kg*G).toFixed(1);
      const arLen=Math.max(25, Math.min(70, wN*2.2));
      const arBase=springEnd+mr*2+8;
      c.strokeStyle='#E53935'; c.lineWidth=3; c.lineCap='round';
      c.beginPath(); c.moveTo(sx,arBase); c.lineTo(sx,arBase+arLen); c.stroke();
      c.fillStyle='#E53935';
      c.beginPath(); c.moveTo(sx,arBase+arLen+10); c.lineTo(sx-7,arBase+arLen); c.lineTo(sx+7,arBase+arLen); c.closePath(); c.fill();
      c.font='bold 13px Tajawal'; c.fillStyle='#C0392B';
      c.textAlign='left'; c.textBaseline='middle';
      c.fillText('W = '+wN+' N', sx+12, arBase+arLen/2);
    } else {
      // زنبرك مسترخ
      drawSpring(c, sx, sy, sy+naturalLen()*0.8, '#90A4AE');
      // نقطة الخطاف السفلى
      c.strokeStyle='#546E7A'; c.lineWidth=2;
      c.beginPath(); c.arc(sx, sy+naturalLen()*0.8+5, 5,-Math.PI/2,Math.PI/2); c.stroke();
      // تعليمة
      c.font='14px Tajawal'; c.fillStyle='rgba(84,110,122,0.7)';
      c.textAlign='center'; c.textBaseline='top';
      c.fillText('← علّق كتلة هنا', sx+14, sy+naturalLen()*0.8+18);
    }

    // رسم الرف
    drawShelf(c);

    // مؤشر التعليق عند السحب
    if(S.dragObj){
      const centerX = W()*0.52;
      const dist = Math.abs(S.dragX - centerX);
      const inZone = dist < W()*0.25 && S.dragY > H()*0.05 && S.dragY < H()*0.88;
      c.strokeStyle = inZone ? 'rgba(39,174,96,0.7)' : 'rgba(26,143,168,0.35)';
      c.lineWidth=2; c.setLineDash([5,4]);
      c.beginPath(); c.arc(W()*0.52, H()*0.38, 40, 0, Math.PI*2); c.stroke();
      c.setLineDash([]);
      if(inZone){
        c.fillStyle='rgba(39,174,96,0.12)';
        c.beginPath(); c.arc(W()*0.52, H()*0.38, 40, 0, Math.PI*2); c.fill();
        c.font='12px Tajawal'; c.fillStyle='#27AE60'; c.textAlign='center';
        c.fillText('أفلت للتعليق ✓', W()*0.52, H()*0.38+56);
      }
    }

    // رسم الكتلة أثناء السحب
    if(S.dragObj){
      drawMassObj(c, S.dragX, S.dragY, S.dragObj, 0.85);
      // خط توجيه للخطاف
      if(S.dragY < springEnd-20){
        c.strokeStyle='rgba(26,143,168,0.4)'; c.lineWidth=1.5; c.setLineDash([5,4]);
        c.beginPath(); c.moveTo(S.dragX,S.dragY); c.lineTo(sx,sy); c.stroke();
        c.setLineDash([]);
      }
    }

    updateReadout();
    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }

  // ── أحداث السحب ──
  function getPos(e){
    const r=cv.getBoundingClientRect();
    const t=(e.touches&&e.touches[0])||e;
    return {x:(t.clientX-r.left)*cv.width/r.width, y:(t.clientY-r.top)*cv.height/r.height};
  }

  function onDown(e){
    e.preventDefault&&e.preventDefault();
    const p=getPos(e);
    // هل ضغط على كتلة في الرف؟
    for(let i=0;i<MASSES.length;i++){
      const m=MASSES[i];
      if(S.hung===m) continue;
      if(S.dragObj===m) continue;
      const sx2=shelfX(), sy2=shelfY(i), r2=massR(m.kg);
      if(Math.hypot(p.x-sx2,p.y-sy2)<r2+14){
        S.dragObj=m; S.dragX=p.x; S.dragY=p.y;
        S.dragSource='shelf';
        return;
      }
    }
    // هل ضغط على الكتلة المعلقة؟
    if(S.hung){
      const hx2=hookX();
      const springEnd2=hookY()+naturalLen()+S.stretch;
      const massY=springEnd2+massR(S.hung.kg);
      if(Math.hypot(p.x-hx2,p.y-massY)<massR(S.hung.kg)+14){
        S.dragObj=S.hung; S.dragX=p.x; S.dragY=p.y;
        S.dragSource='hung';
        S.hung=null; S.stretch=0; S.vel=0;
      }
    }
  }

  function onMove(e){
    e.preventDefault&&e.preventDefault();
    if(!S.dragObj) return;
    const p=getPos(e);
    S.dragX=p.x; S.dragY=p.y;
  }

  function onUp(e){
    if(!S.dragObj) return;
    const centerX = cv.width * 0.52;
    const dist = Math.abs(S.dragX - centerX);
    const inHookZone = dist < cv.width * 0.25 && S.dragY > cv.height * 0.05 && S.dragY < cv.height * 0.88;

    if(inHookZone){
      // تعليق على الخطاف
      S.hung = S.dragObj;
      S.stretch = 0; S.vel = 0;
      try{U9Sound.ping(660,0.2,0.15);}catch(e2){}
      updateReadout();
    } else {
      // خارج المنطقة = إزالة (ترجع للرف)
      if(S.dragSource === 'hung'){
        // كانت معلقة → الميزان يرجع للصفر
        updateReadout();
      }
      try{U9Sound.ping(330,0.1,0.1);}catch(e2){}
    }
    S.dragObj = null;
  }

  cv.addEventListener('mousedown',  onDown, false);
  cv.addEventListener('mousemove',  onMove, false);
  cv.addEventListener('mouseup',    onUp,   false);
  cv.addEventListener('touchstart', onDown, {passive:false});
  cv.addEventListener('touchmove',  onMove, {passive:false});
  cv.addEventListener('touchend',   onUp,   false);

  draw();
}



// ══════════════════════════════════════════════════════════════
// 9-2 Tab 2 - تحدي قياس القوى
// ══════════════════════════════════════════════════════════════
function simForcemeter2(){
  if(currentSim!=='forcemeter'||currentTab!==1)return;
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  const S=simState.u9FM2=Object.assign({
    challengeIdx:0,
    userForce:0,pressing:false,
    attempts:[],accuracy:0,
    pressTime:0,score:0
  },simState.u9FM2||{});

  const CHALLENGES=[
    {name:'باب الفصل 🚪',target:8,hint:'ادفع الباب بلطف'},
    {name:'حقيبة مدرسية 🎒',target:25,hint:'ارفع حقيبتك'},
    {name:'صندوق كتب 📦',target:50,hint:'احمل صندوقاً'},
    {name:'سيارة لعبة 🚗',target:90,hint:'ادفع سيارة'},
    {name:'صخرة 🪨',target:120,hint:'تحريك صخرة'},
  ];
  const ch=CHALLENGES[S.challengeIdx];

  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">🎯 التحدي</div>
  ${CHALLENGES.map((ch2,i)=>`
    <button class="ctrl-btn${S.challengeIdx===i?' active':''}" style="${S.challengeIdx===i?'background:#E74C3C;color:#fff':''};font-size:13px"
      onclick="simState.u9FM2.challengeIdx=${i};simState.u9FM2.userForce=0;simState.u9FM2.pressing=false;simForcemeter2()">
      ${ch2.name} (${ch2.target}N)</button>
  `).join('')}
</div>
<div class="ctrl-section">
  <div style="font-size:14px;color:#555;margin-bottom:8px">اضغط مع الاستمرار لتطبيق القوة</div>
  <button class="ctrl-btn play" id="pressBtn"
    onmousedown="simState.u9FM2.pressing=true;simState.u9FM2.pressTime=Date.now()"
    ontouchstart="simState.u9FM2.pressing=true;simState.u9FM2.pressTime=Date.now()"
    onmouseup="window._stopPress()" ontouchend="window._stopPress()"
    style="font-size:16px;padding:16px">👇 اضغط هنا</button>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">📊 نتائجك</div>
  <div style="font-size:14px;color:#1A8FA8">المحاولات: ${S.attempts.length}</div>
  <div style="font-size:14px;color:#27AE60">النقاط: ${S.score}</div>
</div>`;

  window._stopPress=()=>{
    if(S.pressing){
      const result=S.userForce;
      const err=Math.abs(result-ch.target)/ch.target*100;
      S.attempts.push({f:result,err:err.toFixed(0),target:ch.target});
      if(S.attempts.length>12)S.attempts.shift();
      if(err<15)S.score+=3;
      else if(err<30)S.score+=1;
      S.pressing=false;S.userForce=0;
      document.getElementById('simControlsPanel').innerHTML&&simForcemeter2();
    }
  };

  function draw(){
    if(currentSim!=='forcemeter'||currentTab!==1)return;
    const w=cv.width,h=cv.height;

    if(S.pressing){
      const held=(Date.now()-S.pressTime)/1000;
      S.userForce=Math.min(ch.target*1.5,held*ch.target*0.8+Math.sin(held*3)*5);
    }

    c.clearRect(0,0,w,h);
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#FFF9F0');bg.addColorStop(1,'#FFF');
    c.fillStyle=bg;c.fillRect(0,0,w,h);

    // عنوان التحدي
    U9.txt(c,ch.name,w/2,38,'#2C3A4A',24,true);
    U9.txt(c,ch.hint,w/2,62,'#888',17,false);
    U9.txt(c,'الهدف: '+ch.target+' N',w/2,84,'#E74C3C',18,true);

    // مقياس
    const mX=w*0.08,mY=h*0.15,mW=w*0.84,mH=36;
    U9.rect(c,mX,mY,mW,mH,'#EEF2F5','#BDC3C7',8,2);
    // تعبئة
    const frac=Math.min(S.userForce/(ch.target*1.5),1);
    if(frac>0){
      const col=frac<0.7?'#27AE60':frac<0.95?'#F39C12':'#E74C3C';
      const g2=c.createLinearGradient(mX,0,mX+mW,0);
      g2.addColorStop(0,col+'CC');g2.addColorStop(1,col);
      U9.rect(c,mX,mY,mW*frac,mH,null,null,8);
      c.fillStyle=g2;c.fill();
    }
    // خط الهدف
    const targetX=mX+mW*(ch.target/(ch.target*1.5));
    c.strokeStyle='#E74C3C';c.lineWidth=3;c.setLineDash([6,4]);
    c.beginPath();c.moveTo(targetX,mY-8);c.lineTo(targetX,mY+mH+8);c.stroke();
    c.setLineDash([]);
    U9.txt(c,'🎯',targetX,mY-20,'#E74C3C',18,true);
    // قراءة
    U9.txt(c,S.userForce.toFixed(1)+' N',w/2,mY+mH+26,'#1A8FA8',20,true);

    // الجسم المطبق عليه القوة
    const objX=w/2,objY=h*0.45;
    const icons=['🚪','🎒','📦','🚗','🪨'];
    U9.txt(c,icons[S.challengeIdx],objX,objY,null,62);
    if(S.pressing&&S.userForce>5){
      U9.arrow(c,objX-80,objY,objX-80+S.userForce*0.8,objY,'#3498DB',5,S.userForce.toFixed(0)+' N',1);
    }

    // رسم بياني للمحاولات
    if(S.attempts.length>0){
      const gX=mX,gY2=h*0.6,gW=mW,gH=h*0.32;
      U9.rect(c,gX,gY2,gW,gH,'rgba(255,255,255,0.8)','#DDD',10,1.5);
      U9.txt(c,'سجل المحاولات',gX+gW/2,gY2+18,'#555',16,true);
      const barW=(gW-20)/(Math.max(S.attempts.length,12)+1);
      S.attempts.forEach((a,i)=>{
        const bx=gX+10+i*(barW+2);
        const bh=Math.min(a.f/ch.target*(gH-50),gH-50);
        const col=a.err<15?'#27AE60':a.err<30?'#F39C12':'#E74C3C';
        U9.rect(c,bx,gY2+gH-10-bh,barW,bh,col,null,3);
        U9.txt(c,a.f.toFixed(0),bx+barW/2,gY2+gH-14,col,13,true);
      });
      // خط الهدف
      const ty=gY2+gH-10-(ch.target/ch.target*(gH-50));
      c.strokeStyle='#E74C3C';c.lineWidth=2;c.setLineDash([5,3]);
      c.beginPath();c.moveTo(gX+5,ty);c.lineTo(gX+gW-5,ty);c.stroke();
      c.setLineDash([]);
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  draw();
}


// 9-3 Tab 1 - الوزن والجاذبية مع السحب
// ══════════════════════════════════════════════════════════════
function simGravity1(){
  if((currentSim!=='gravity'&&currentSim!=='g6gravity')||currentTab!==0)return;
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  const S=simState.u9G1=Object.assign({
    mass:5,planet:'earth',
    falling:false,dropped:false,
    ballY:0,ballV:0,fallTime:0,
    dragging:false,dragY:0
  },simState.u9G1||{});

  const PLANETS={
    earth:{label:'🌍 الأرض',g:10,col:'#2980B9',sky1:'#87CEEB',sky2:'#E3F2FD'},
    moon:{label:'🌕 القمر',g:1.6,col:'#7F8C8D',sky1:'#1A1A2E',sky2:'#2C2C4A'},
    mars:{label:'🔴 المريخ',g:3.72,col:'#E74C3C',sky1:'#E8A87C',sky2:'#FFCBA4'},
    jupiter:{label:'🪐 المشتري',g:24.8,col:'#D4870A',sky1:'#C4A35A',sky2:'#FFF3E0'},
  };
  const pl=PLANETS[S.planet];
  const groundY=cv.height*0.75; // مرفوع لإعطاء مساحة للسهم وزر "ماذا نستنتج"

  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">⚖️ الكتلة</div>
  <div class="ctrl-name">الكتلة: <span class="ctrl-val" id="gMass">${S.mass} kg</span></div>
  <input type="range" min="1" max="50" value="${S.mass}"
    oninput="simState.u9G1.mass=+this.value;document.getElementById('gMass').textContent=this.value+' kg';simState.u9G1.falling=false;simState.u9G1.dropped=false;simState.u9G1.ballV=0;simState.u9G1.ballY=0">
</div>
<div class="ctrl-section">
  <div class="ctrl-label">🌍 الكوكب</div>
  ${Object.entries(PLANETS).map(([k,v])=>`
    <button class="ctrl-btn${S.planet===k?' active':''}" style="${S.planet===k?'background:'+v.col+';color:#fff':''};font-size:13px"
      onclick="simState.u9G1.planet='${k}';simState.u9G1.falling=false;simState.u9G1.dropped=false;simState.u9G1.ballV=0;simState.u9G1.ballY=0;simGravity1()">
      ${v.label} (g=${v.g})</button>
  `).join('')}
</div>
<div class="ctrl-section">
  <button class="ctrl-btn play" onclick="simState.u9G1.falling=true;simState.u9G1.dropped=true;simState.u9G1.ballV=0;simState.u9G1.fallTime=0">🔽 أسقط الكرة</button>
  <button class="ctrl-btn reset" onclick="simState.u9G1.falling=false;simState.u9G1.dropped=false;simState.u9G1.ballV=0;simState.u9G1.ballY=0;simState.u9G1.fallTime=0">↺ إعادة</button>
</div>
<div class="ctrl-section">
  <div class="ctrl-label" style="font-size:13px">💡 اسحب الكرة لأعلى ثم حررها!</div>
</div>
<div class="q-box">
  <strong>❓ ما العلاقة بين الكتلة والوزن؟</strong>
  <div style="display:flex;flex-direction:column;gap:5px;margin-top:8px">
    <button class="q-opt-btn" onclick="window._grav1Ans(this,false)" style="padding:7px 10px;border-radius:8px;border:1.5px solid rgba(0,0,0,0.1);background:white;font-family:Tajawal;font-size:13px;cursor:pointer;text-align:right">١- الكتلة والوزن يمثلان نفس المصطلح</button>
    <button class="q-opt-btn" onclick="window._grav1Ans(this,false)" style="padding:7px 10px;border-radius:8px;border:1.5px solid rgba(0,0,0,0.1);background:white;font-family:Tajawal;font-size:13px;cursor:pointer;text-align:right">٢- لا توجد علاقة بين الكتلة والوزن</button>
    <button class="q-opt-btn" onclick="window._grav1Ans(this,true)" style="padding:7px 10px;border-radius:8px;border:1.5px solid rgba(0,0,0,0.1);background:white;font-family:Tajawal;font-size:13px;cursor:pointer;text-align:right">٣- بتغيير الكتلة تتغير قوة الوزن للجسم</button>
  </div>
  <div id="grav1Fb" style="display:none;margin-top:8px;padding:8px 10px;border-radius:8px;font-size:13px;line-height:1.7"></div>
</div>`;
  window._grav1Ans=function(btn,correct){
    document.querySelectorAll('.q-opt-btn').forEach(function(b){
      b.disabled=true; b.style.opacity='0.55';
    });
    btn.style.opacity='1';
    btn.style.background=correct?'rgba(39,174,96,0.15)':'rgba(192,57,43,0.12)';
    btn.style.borderColor=correct?'#27AE60':'#C0392B';
    btn.style.fontWeight='700';
    var fb=document.getElementById('grav1Fb');
    if(fb){
      fb.style.display='block';
      fb.style.background=correct?'rgba(39,174,96,0.08)':'rgba(192,57,43,0.06)';
      fb.style.color=correct?'#1E8449':'#C0392B';
      fb.innerHTML=correct
        ?'✅ صحيح! W = m × g — كلما زادت الكتلة زاد الوزن.'
        :'❌ الكتلة والوزن مختلفان. الكتلة ثابتة (kg) والوزن يتغير بحسب الجاذبية (N).';
    }
  };

  function getBallPos(){
    const bY=S.dropped?groundY-30-Math.max(0,groundY*0.8-S.ballY):cv.height*0.18;
    return{x:cv.width/2,y:S.dropped?cv.height*0.18+S.ballY:cv.height*0.18};
  }
  function onDown(e){
    e.preventDefault();
    const pos=U9.getPos(cv,e);
    const bPos={x:cv.width/2,y:S.dropped?cv.height*0.18+S.ballY:cv.height*0.18};
    if(Math.sqrt((pos.x-bPos.x)**2+(pos.y-bPos.y)**2)<30){
      S.dragging=true;S.falling=false;S.ballV=0;
    }
  }
  function onMove(e){
    if(!S.dragging)return;
    e.preventDefault();
    const pos=U9.getPos(cv,e);
    const topY=cv.height*0.1,botY=groundY-30;
    S.ballY=Math.max(0,Math.min(botY-cv.height*0.18,pos.y-cv.height*0.18));
    S.dropped=true;
  }
  function onUp(){
    if(S.dragging){S.dragging=false;S.falling=true;S.fallTime=0;}
  }
  cv.addEventListener('mousedown',onDown);cv.addEventListener('mousemove',onMove);cv.addEventListener('mouseup',onUp);
  cv.addEventListener('touchstart',onDown,{passive:false});cv.addEventListener('touchmove',onMove,{passive:false});cv.addEventListener('touchend',onUp);
  cv.style.cursor='pointer';

  function draw(){
    if((currentSim!=='gravity'&&currentSim!=='g6gravity')||currentTab!==0){
      cv.removeEventListener('mousedown',onDown);cv.removeEventListener('mousemove',onMove);cv.removeEventListener('mouseup',onUp);
      cv.removeEventListener('touchstart',onDown);cv.removeEventListener('touchmove',onMove);cv.removeEventListener('touchend',onUp);
      cv.style.cursor='default';return;
    }
    const w=cv.width,h=cv.height;
    const plNow=PLANETS[S.planet];
    const gNow=plNow.g;
    const W=S.mass*gNow;

    if(S.falling&&!S.dragging){
      S.ballV+=gNow*0.016*2;
      S.ballY+=S.ballV*0.5;
      S.fallTime+=0.016;
      const ballRNow=Math.max(18,Math.min(50,14+S.mass*1.8));
      // صوت سقوط متصاعد (كل 12 frame)
      if(S.t%12===0 && S.ballV>2){
        const progress=Math.min(S.ballY/(groundY-h*0.18),1);
        U9Sound.falling(progress);
      }
      if(S.ballY>=groundY-h*0.18-ballRNow){
        S.ballY=groundY-h*0.18-ballRNow;
        S.falling=false;
        // صوت ارتطام يتناسب مع السرعة والكتلة
        const impactVol=Math.min(0.85, 0.2+S.mass*0.025+S.ballV*0.008);
        const impactFreq=Math.max(25,100-S.mass*2-S.ballV*0.5);
        U9Sound.thud(impactVol, impactFreq);
        U9.addParticles('grav1',w/2,groundY,plNow.col,Math.min(18,8+S.mass));
      }
    }
    if(!S._t) S._t=0; S._t++;

    c.clearRect(0,0,w,h);
    const sky=c.createLinearGradient(0,0,0,h);
    sky.addColorStop(0,plNow.sky1);sky.addColorStop(1,plNow.sky2);
    c.fillStyle=sky;c.fillRect(0,0,w,h);

    // نجوم على القمر/المريخ
    if(S.planet==='moon'||S.planet==='mars'){
      c.fillStyle='rgba(255,255,255,0.8)';
      for(let i=0;i<30;i++){
        const sx=(i*137)%w,sy=(i*73)%(h*0.7);
        c.beginPath();c.arc(sx,sy,1.2,0,Math.PI*2);c.fill();
      }
    }

    // أرضية
    c.fillStyle=plNow.col+'44';c.fillRect(0,groundY,w,h-groundY);
    c.fillStyle=plNow.col;c.fillRect(0,groundY,w,6);

    // مسطرة ارتفاع
    const rulerX=w*0.85;
    const rulerH=groundY-h*0.1;
    c.strokeStyle='rgba(255,255,255,0.5)';c.lineWidth=2;
    c.beginPath();c.moveTo(rulerX,h*0.1);c.lineTo(rulerX,groundY);c.stroke();
    for(let i=0;i<=10;i++){
      const ty=h*0.1+i*(rulerH/10);
      c.fillStyle='rgba(255,255,255,0.7)';
      c.fillRect(rulerX-8,ty,16,2);
      U9.txt(c,(10-i)+' m',rulerX+20,ty,'rgba(255,255,255,0.8)',15,false,'left');
    }

    // الكرة — تكبر مع زيادة الكتلة
    const ballX=w/2,ballRealY=h*0.18+S.ballY;
    const ballR=Math.max(18,Math.min(50,14+S.mass*1.8));
    const ballG=c.createRadialGradient(ballX-ballR*0.3,ballRealY-ballR*0.3,2,ballX,ballRealY,ballR);
    ballG.addColorStop(0,'#FFF');ballG.addColorStop(0.4,plNow.col);ballG.addColorStop(1,plNow.col+'88');
    c.beginPath();c.arc(ballX,ballRealY,ballR,0,Math.PI*2);
    c.fillStyle=ballG;
    c.shadowColor=plNow.col;c.shadowBlur=18;c.fill();c.shadowBlur=0;
    c.strokeStyle='rgba(255,255,255,0.5)';c.lineWidth=2.5;c.stroke();
    U9.txt(c,S.mass+' kg',ballX,ballRealY,'#fff',Math.max(12,Math.min(17,9+S.mass*0.4)),true);

    // سهام — دائماً واضحة، تنطلق من مركز الكرة، طول ثابت
    const arX = ballX + ballR + 14;
    const arLen = 45;
    if(!S.falling){
      U9.arrow(c,arX,ballRealY,arX,ballRealY+arLen,plNow.col,5,'W='+W.toFixed(1)+' N',1);
    } else {
      // سهم التسارع لأسفل أثناء السقوط
      U9.arrow(c,arX,ballRealY,arX,ballRealY+arLen,plNow.col,5,'g='+gNow,1);
    }
    // لوحة بيانات
    const infoRows=[
      {l:'الكتلة',v:S.mass+' kg',col:'#AED6F1'},
      {l:'الجاذبية g',v:gNow+' m/s²',col:plNow.col},
      {l:'الوزن W',v:W.toFixed(1)+' N',col:'#F1948A'},
      {l:'السرعة v',v:S.ballV.toFixed(2)+' m/s',col:'#82E0AA'},
      {l:'الزمن t',v:S.fallTime.toFixed(2)+' s',col:'#F8C471'},
    ];
    drawDataPanel(c,10,10,250,plNow.label,infoRows);

    U9.drawParticles(c,'grav1');
    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 9-3 Tab 2 - سباق الكواكب
// ══════════════════════════════════════════════════════════════
function simGravity2(){
  if((currentSim!=='gravity'&&currentSim!=='g6gravity')||currentTab!==1)return;
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  const S=simState.u9G2=Object.assign({
    selected:['earth','moon','mars','jupiter'],
    mass:5,running:false,
    balls:{},times:{},winner:null,t:0
  },simState.u9G2||{});

  const PLANETS={
    earth:{label:'🌍 الأرض',g:10,col:'#2980B9'},
    moon:{label:'🌕 القمر',g:1.6,col:'#7F8C8D'},
    mars:{label:'🔴 المريخ',g:3.72,col:'#E74C3C'},
    jupiter:{label:'🪐 المشتري',g:24.8,col:'#D4870A'},
    venus:{label:'♀️ الزهرة',g:8.87,col:'#D4AC0D'},
  };

  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">☑️ اختر الكواكب</div>
  ${Object.entries(PLANETS).map(([k,v])=>`
    <label style="display:flex;align-items:center;gap:8px;font-size:14px;margin-bottom:6px;cursor:pointer">
      <input type="checkbox" ${S.selected.includes(k)?'checked':''}
        onchange="const s=simState.u9G2.selected;const i=s.indexOf('${k}');if(this.checked&&i<0)s.push('${k}');else if(!this.checked&&i>=0)s.splice(i,1)">
      <span style="color:${v.col};font-weight:bold">${v.label} (g=${v.g})${k==='earth'?'<br><span style="font-size:11px;color:#888;font-weight:normal">مع إهمال مقاومة الهواء</span>':''}</span>
    </label>
  `).join('')}
</div>
<div class="ctrl-section">
  <div class="ctrl-label">⚖️ الكتلة: <span class="ctrl-val" id="g2Mass">${S.mass} kg</span></div>
  <input type="range" min="1" max="30" value="${S.mass}" oninput="simState.u9G2.mass=+this.value;document.getElementById('g2Mass').textContent=this.value+' kg'">
</div>
<div class="ctrl-section">
  <button class="ctrl-btn play" onclick="simState.u9G2.running=true;simState.u9G2.balls={};simState.u9G2.times={};simState.u9G2.winner=null;simState.u9G2.t=0">🏁 ابدأ السباق</button>
  <button class="ctrl-btn reset" onclick="simState.u9G2.running=false;simState.u9G2.balls={};simState.u9G2.times={};simState.u9G2.winner=null">↺ إعادة</button>
</div>`;

  function draw(){
    if((currentSim!=='gravity'&&currentSim!=='g6gravity')||currentTab!==1)return;
    const w=cv.width,h=cv.height;
    const startY=h*0.08;
    const surfH=Math.min(80,h*0.10);   // سطح أعلى قليلاً
    const sel=S.selected.filter(k=>PLANETS[k]);
    const n=sel.length||1;
    const laneW=w/n;
    const groundY=h-surfH-8;
    const bR_max=26; // أكبر نصف قطر ممكن
    const fallH=groundY-startY-bR_max; // الكرة تقف فوق السطح بمسافة nصف قطرها

    c.clearRect(0,0,w,h);
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#060818');bg.addColorStop(1,'#1A1A3A');
    c.fillStyle=bg;c.fillRect(0,0,w,h);
    c.fillStyle='rgba(255,255,255,0.75)';
    for(let i=0;i<60;i++){const sx=(i*137+11)%w,sy=(i*79+5)%(h*0.85);c.beginPath();c.arc(sx,sy,i%5===0?1.5:0.8,0,Math.PI*2);c.fill();}

    if(S.running){
      S.t+=0.016;
      sel.forEach(k=>{
        if(!S.balls[k])S.balls[k]={y:0,v:0};
        const b=S.balls[k];
        if(b.y<fallH){
          b.v+=PLANETS[k].g*0.016*2;
          b.y+=b.v*0.5;
          if(b.y>=fallH){
            b.y=fallH;
            if(!S.times[k]){
              S.times[k]=S.t;
              if(!S.winner){S.winner=k;U9Sound.win();}
              else{U9Sound.thud(0.4,70);U9Sound.ping(440,0.2,0.2);}
            }
          }
        }
      });
      if(sel.every(k=>S.times[k]))S.running=false;
    }

    sel.forEach((k,i)=>{
      const pl=PLANETS[k];
      const lx=laneW*i, cx=lx+laneW/2;
      const bY=S.balls[k]?startY+S.balls[k].y:startY;
      const bR=Math.max(12,Math.min(26,10+Math.sqrt(S.mass)*2));

      // خط المسار
      c.strokeStyle=pl.col+'33';c.lineWidth=1;c.setLineDash([5,5]);
      c.beginPath();c.moveTo(cx,startY);c.lineTo(cx,groundY);c.stroke();
      c.setLineDash([]);

      // خط المسار
      c.strokeStyle=pl.col+'33';c.lineWidth=1;c.setLineDash([5,5]);
      c.beginPath();c.moveTo(cx,startY);c.lineTo(cx,groundY);c.stroke();
      c.setLineDash([]);

      // الكرة (ترسم أولاً — قبل السطح)
      c.shadowColor='rgba(0,0,0,0.4)';c.shadowBlur=10;
      const bg2=c.createRadialGradient(cx-bR*0.3,bY-bR*0.3,2,cx,bY,bR);
      bg2.addColorStop(0,'#FAD7A0');bg2.addColorStop(0.55,'#E59866');bg2.addColorStop(1,'#784212');
      c.fillStyle=bg2;c.beginPath();c.arc(cx,bY,bR,0,Math.PI*2);c.fill();
      c.shadowBlur=0;
      c.strokeStyle=pl.col;c.lineWidth=2;c.beginPath();c.arc(cx,bY,bR,0,Math.PI*2);c.stroke();
      c.fillStyle='white';
      c.font='bold '+Math.max(8,Math.min(12,Math.round(bR*0.68)))+'px Tajawal,Arial';
      c.textAlign='center';c.textBaseline='middle';
      c.fillText(S.mass+' kg',cx,bY);

      if(S.times[k]){
        U9.rect(c,cx-26,bY-bR-26,52,20,pl.col+'DD',pl.col,4,1.5);
        U9.txt(c,S.times[k].toFixed(2)+' s',cx,bY-bR-16,'#fff',12,true);
      }
      if(k===S.winner){
        c.save();c.font='20px serif';c.textAlign='center';c.textBaseline='middle';
        c.shadowColor='#FFD700';c.shadowBlur=12;
        c.fillText('🥇',cx,bY-bR-34);c.restore();
      }

      // سطح الكوكب (يُرسم فوق الكرة — الاسم دائماً ظاهر)
      const sg=c.createLinearGradient(lx,groundY,lx,h);
      sg.addColorStop(0,pl.col);sg.addColorStop(1,pl.col+'66');
      c.fillStyle=sg;
      c.beginPath();c.roundRect(lx+2,groundY,laneW-4,surfH+8,[6,6,0,0]);c.fill();
      c.strokeStyle=pl.col+'BB';c.lineWidth=1.5;c.setLineDash([]);
      c.beginPath();c.roundRect(lx+2,groundY,laneW-4,surfH+8,[6,6,0,0]);c.stroke();

      // اسم الكوكب وqيمة g — دائماً فوق كل شيء
      const fs=Math.max(10,Math.min(14,laneW*0.13));
      c.fillStyle='rgba(0,0,0,0.55)';
      c.font='bold '+fs+'px Tajawal,Arial';
      c.textAlign='center';c.textBaseline='middle';
      c.fillText(pl.label,cx,groundY+surfH*0.30);
      c.fillStyle='rgba(255,255,255,0.95)';
      c.font='bold '+(fs-1)+'px Tajawal,Arial';
      c.fillText('g='+pl.g+' m/s²',cx,groundY+surfH*0.70);
    });

    if(S.winner&&!S.running){
      U9.rect(c,w/2-155,h*0.35,310,72,'rgba(0,0,0,0.88)','#FFD700',14,3);
      U9.txt(c,'🏆 الفائز: '+PLANETS[S.winner].label,w/2,h*0.35+20,'#FFD700',19,true);
      U9.txt(c,'في '+S.times[S.winner].toFixed(2)+' ثانية',w/2,h*0.35+46,'white',16,false);
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  if(!S.balls||Object.keys(S.balls).length===0){
    S.selected.forEach(k=>{if(!S.balls)S.balls={};S.balls[k]={y:0,v:0};});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 9-4 Tab 1 - الاحتكاك التفاعلي (سحب مباشر - PhET style)
// ══════════════════════════════════════════════════════════════
function simFriction1(){
  if((currentSim!=='friction'&&currentSim!=='g6friction')||currentTab!==0)return;
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  function W(){return cv.width;}
  function H(){return cv.height;}
  function GY(){return H()*0.68;}

  const SURFACES={
    ice:    {label:'جليد 🧊',  mu:0.05, top:'#AED6F1', bot:'#5DADE2'},
    smooth: {label:'بلاط 🪟',  mu:0.15, top:'#D5D8DC', bot:'#99A3A4'},
    wood:   {label:'خشب 🪵',   mu:0.35, top:'#C9A84C', bot:'#9A7D0A'},
    carpet: {label:'سجادة 🟫', mu:0.55, top:'#A04000', bot:'#784212'},
    rough:  {label:'خشن 🧱',   mu:0.75, top:'#7E5109', bot:'#5D4037'},
  };

  const MASS=20, G=10, PX_PER_M=55, DT=1/60;

  if(!simState.fr1) simState.fr1={
    surface:'wood',
    objX:0.5, objV:0,
    isDragging:false,
    dragStartMouseX:0, dragStartObjX:0,
    appliedF:0,        // القوة المحسوبة من السحب
    sparks:[], lastSpark:0, t:0,
  };
  const S=simState.fr1;

  function normalF()  { return MASS*G; }
  function staticMax(){ return SURFACES[S.surface].mu*normalF()*1.3; }
  function kineticF() { return SURFACES[S.surface].mu*normalF(); }
  function fricNow()  {
    if(Math.abs(S.objV)>0.01) return kineticF();
    return Math.min(Math.abs(S.appliedF), staticMax());
  }
  function netF(){
    if(Math.abs(S.appliedF)<=staticMax() && Math.abs(S.objV)<0.01) return 0;
    return S.appliedF - Math.sign(S.appliedF||1)*kineticF();
  }

  // ── لوحة التحكم ──
  controls(`
    <div class="ctrl-label">🏔️ نوع السطح</div>
    <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px">
      ${Object.entries(SURFACES).map(([k,v])=>`
        <button onclick="window._fr1Surf('${k}')" id="frBtn_${k}"
          class="ctrl-btn" style="font-size:13px;text-align:right;padding:7px 10px;
          ${S.surface===k?'background:'+v.bot+';color:white;border-color:'+v.bot+';font-weight:700':''}">
          ${v.label}
          <span style="float:left;opacity:0.75;font-size:11px">μ=${v.mu}</span>
        </button>`).join('')}
    </div>
    <div id="fr1Info" style="padding:10px;background:rgba(26,143,168,0.07);
      border-radius:10px;font-size:13px;line-height:2.3;min-height:90px">
      اسحب الصندوق ←→
    </div>
    <button onclick="window._fr1Reset()"
      style="margin-top:10px;width:100%;padding:9px;border-radius:10px;
      background:rgba(0,0,0,0.05);border:1.5px solid rgba(0,0,0,0.1);
      font-family:Tajawal;font-size:14px;cursor:pointer">↺ إعادة</button>
    <div class="q-box" style="margin-top:10px">
      <strong>❓ ص٥٤:</strong> في أي اتجاه يعمل الاحتكاك؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">الاحتكاك يعمل دائماً عكس اتجاه الحركة أو محاولة الحركة.</div>
    </div>
  `);

  window._fr1Surf=function(k){
    S.surface=k; S.objX=0.5; S.objV=0;
    S.appliedF=0; S.isDragging=false; S.sparks=[];
    Object.keys(SURFACES).forEach(kk=>{
      const b=document.getElementById('frBtn_'+kk); if(!b) return;
      const v=SURFACES[kk];
      b.style.background=kk===k?v.bot:'';
      b.style.color=kk===k?'white':'';
      b.style.borderColor=kk===k?v.bot:'';
      b.style.fontWeight=kk===k?'700':'';
    });
  };
  window._fr1Reset=function(){
    S.objX=0.5; S.objV=0; S.appliedF=0; S.isDragging=false; S.sparks=[];
  };

  function updateInfo(){
    const el=document.getElementById('fr1Info'); if(!el)return;
    const fa=Math.abs(S.appliedF), ff=fricNow(), fn=netF();
    const moving=Math.abs(S.objV)>0.01;
    el.innerHTML=`
      <div>🔴 تطبيق: <strong style="color:#E74C3C">${fa.toFixed(1)} N</strong>
           ${S.appliedF>0?'←':S.appliedF<0?'→':''}</div>
      <div>🔵 احتكاك: <strong style="color:#2980B9">${ff.toFixed(1)} N</strong>
           ${S.appliedF>0?'→':S.appliedF<0?'←':''}</div>
      <div>⚡ محصلة: <strong style="color:${Math.abs(fn)<0.5?'#27AE60':'#E74C3C'}">${fn.toFixed(1)} N</strong></div>
      <div style="margin-top:3px;padding:3px 7px;border-radius:6px;font-size:12px;
        background:${moving?'rgba(231,76,60,0.1)':'rgba(39,174,96,0.1)'}">
        ${moving?'🏃 يتحرك':'🧱 ثابت'}
        — السرعة: ${(Math.abs(S.objV)*PX_PER_M).toFixed(2)} m/s
      </div>`;
  }

  // ── رسم السطح ──
  function drawSurface(){
    const gy=GY(), sf=SURFACES[S.surface];
    const sg=c.createLinearGradient(0,gy,0,H());
    sg.addColorStop(0,sf.top); sg.addColorStop(1,sf.bot);
    c.fillStyle=sg; c.fillRect(0,gy,W(),H()-gy);
    c.fillStyle=sf.bot; c.fillRect(0,gy,W(),5);
    // نسيج حركي
    c.strokeStyle='rgba(0,0,0,0.07)'; c.lineWidth=1;
    const sh=((S.objX*W()*0.4)|0)%28;
    for(let x=-30;x<W()+30;x+=28){
      c.beginPath(); c.moveTo(x+sh,gy+5); c.lineTo(x+sh+14,H()); c.stroke();
    }
    c.font='bold 12px Tajawal'; c.fillStyle='rgba(255,255,255,0.55)';
    c.textAlign='center'; c.textBaseline='top';
    c.fillText(sf.label, W()/2, gy+7);
  }

  // ── رسم سهم أفقي ──
  function arrow(x1,y,len,dir,col,lbl,above){
    if(len<6) return;
    const x2=x1+dir*len;
    c.strokeStyle=col; c.lineWidth=5; c.lineCap='round';
    c.beginPath(); c.moveTo(x1,y); c.lineTo(x2-dir*13,y); c.stroke();
    c.fillStyle=col;
    c.beginPath();
    c.moveTo(x2,y);
    c.lineTo(x2-dir*14,y-8);
    c.lineTo(x2-dir*14,y+8);
    c.closePath(); c.fill();
    c.font='bold 12px Tajawal'; c.fillStyle=col;
    c.textAlign='center'; c.textBaseline=above?'bottom':'top';
    c.fillText(lbl,(x1+x2)/2,above?y-14:y+14);
  }

  // ── رسم الجسم ──
  function drawBox(cx,gy){
    const bW=66,bH=50;
    // ظل
    c.fillStyle='rgba(0,0,0,0.12)';
    c.beginPath(); c.ellipse(cx+4,gy+4,bW*0.5,6,0,0,Math.PI*2); c.fill();
    // جسم
    const gr=c.createLinearGradient(cx,gy-bH,cx,gy);
    gr.addColorStop(0,'#7FB3D3'); gr.addColorStop(1,'#2471A3');
    c.shadowColor='rgba(0,0,0,0.25)'; c.shadowBlur=10;
    c.fillStyle=gr;
    c.beginPath(); c.roundRect(cx-bW/2,gy-bH,bW,bH,[8]); c.fill();
    c.shadowBlur=0;
    c.strokeStyle='#1A5276'; c.lineWidth=2;
    c.beginPath(); c.roundRect(cx-bW/2,gy-bH,bW,bH,[8]); c.stroke();
    c.font='22px serif'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('📦',cx,gy-bH*0.55);
    c.font='bold 11px Tajawal'; c.fillStyle='white'; c.textBaseline='middle';
    c.fillText(MASS+'kg',cx,gy-bH*0.15);
    // عجلات
    [-22,22].forEach(ox=>{
      const rot=S.objX*W()*0.08;
      c.save(); c.translate(cx+ox,gy+2);
      c.beginPath(); c.arc(0,0,9,0,Math.PI*2);
      c.fillStyle='#1C2833'; c.fill();
      c.rotate(rot);
      c.strokeStyle='#AAB7B8'; c.lineWidth=2;
      c.beginPath(); c.moveTo(-6,0); c.lineTo(6,0); c.stroke();
      c.beginPath(); c.moveTo(0,-6); c.lineTo(0,6); c.stroke();
      c.restore();
    });
    return {bW,bH};
  }

  // ── الرسم الرئيسي ──
  function draw(){
    if((currentSim!=='friction'&&currentSim!=='g6friction')||currentTab!==0)return;
    S.t++;
    const w=W(), h=H(), gy=GY();
    c.clearRect(0,0,w,h);

    // خلفية
    const bg=c.createLinearGradient(0,0,0,gy);
    bg.addColorStop(0,'#EBF5FB'); bg.addColorStop(1,'#D6EAF8');
    c.fillStyle=bg; c.fillRect(0,0,w,gy);

    // ── فيزياء ──
    if(!S.isDragging){
      // تطبيق المحصلة
      const fn=netF();
      S.objV += fn/MASS*DT;
      // تباطؤ طبيعي عند عدم السحب
      if(Math.abs(S.appliedF)<1){
        S.objV*=0.88;
        if(Math.abs(S.objV)<0.002) S.objV=0;
      }
    }
    // تحديث موضع
    const dxPx = S.objV*DT*PX_PER_M;
    S.objX=Math.max(0.07,Math.min(0.93,S.objX+dxPx/w));

    // ── سطح ──
    drawSurface();
    const cx=S.objX*w;

    // ── شرر ──
    if(Math.abs(S.objV)>0.4 && S.t-S.lastSpark>5){
      S.lastSpark=S.t;
      for(let i=0;i<4;i++) S.sparks.push({
        x:cx+(Math.random()-0.5)*20, y:gy-4,
        vx:(Math.random()-0.5)*5, vy:-Math.random()*4-1,
        life:1, col:['#F1C40F','#E67E22','#E74C3C'][i%3]
      });
    }
    S.sparks=S.sparks.filter(sp=>{
      sp.x+=sp.vx; sp.y+=sp.vy; sp.vy+=0.3; sp.life-=0.07;
      c.globalAlpha=sp.life; c.fillStyle=sp.col;
      c.beginPath(); c.arc(sp.x,sp.y,2.5,0,Math.PI*2); c.fill();
      c.globalAlpha=1; return sp.life>0;
    });

    // ── رسم الجسم ──
    const {bW,bH}=drawBox(cx,gy);
    const arY=gy-bH*0.5;
    const appDir=S.appliedF>=0?-1:1; // موجب = سحب يسار = اتجاه السهم يسار

    // سهم قوة التطبيق
    if(Math.abs(S.appliedF)>2){
      const len=Math.min(Math.abs(S.appliedF)*0.6,150);
      arrow(cx+appDir*(bW/2+8),arY,len,appDir,'#E74C3C',
            Math.abs(S.appliedF).toFixed(0)+' N',true);
    }

    // سهم الاحتكاك (معاكس)
    const ff=fricNow();
    if(ff>2){
      const len=Math.min(ff*0.6,150);
      arrow(cx-appDir*(bW/2+8),arY,len,-appDir,'#2980B9',
            ff.toFixed(0)+' N',false);
    }

    // ── لافتة حالة ──
    {
      const moving=Math.abs(S.objV)>0.05;
      const fn2=netF();
      const txt=moving
        ?'🏃 يتحرك — محصلة '+fn2.toFixed(1)+' N'
        :Math.abs(S.appliedF)>2
          ?'🧱 ثابت — الاحتكاك يعاكس القوة'
          :'← اسحب الصندوق →';
      const col=moving?'#E74C3C':'#27AE60';
      c.fillStyle=moving?'rgba(231,76,60,0.1)':'rgba(39,174,96,0.1)';
      c.beginPath(); c.roundRect(w/2-140,10,280,40,[10]); c.fill();
      c.strokeStyle=col+'55'; c.lineWidth=1.5;
      c.beginPath(); c.roundRect(w/2-140,10,280,40,[10]); c.stroke();
      c.font='bold 14px Tajawal'; c.fillStyle='#2C3E50';
      c.textAlign='center'; c.textBaseline='middle';
      c.fillText(txt,w/2,30);
    }

    // ── مؤشر سرعة ──
    {
      const spd=Math.abs(S.objV*PX_PER_M);
      const maxS=10, frac=Math.min(spd/maxS,1);
      const bx=14,by=h*0.54,bh=H()*0.10,bww=14;
      c.fillStyle='rgba(20,30,48,0.75)';
      c.beginPath(); c.roundRect(bx-2,by-2,bww+52,bh+18,[8]); c.fill();
      // شريط
      c.fillStyle='rgba(255,255,255,0.1)';
      c.beginPath(); c.roundRect(bx+2,by+2,bww,bh,[4]); c.fill();
      const barCol=frac<0.4?'#2ECC71':frac<0.75?'#F39C12':'#E74C3C';
      c.fillStyle=barCol;
      c.beginPath(); c.roundRect(bx+2,by+2+bh*(1-frac),bww,bh*frac,[4]); c.fill();
      c.font='bold 10px monospace'; c.fillStyle='white';
      c.textAlign='left'; c.textBaseline='middle';
      c.fillText(spd.toFixed(2),bx+bww+6,by+bh/2+2);
      c.font='9px Tajawal'; c.fillStyle='rgba(255,255,255,0.6)';
      c.fillText('m/s',bx+bww+6,by+bh+8);
    }

    updateInfo();
    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }

  // ── السحب المباشر ──
  function getPos(e){
    const r=cv.getBoundingClientRect();
    const t=(e.touches&&e.touches[0])||e;
    return {x:(t.clientX-r.left)*cv.width/r.width,
            y:(t.clientY-r.top)*cv.height/r.height};
  }

  function onDown(e){
    e.preventDefault&&e.preventDefault();
    const p=getPos(e);
    const cx=S.objX*W(), gy=GY();
    // هل الضغط على الصندوق؟
    if(Math.abs(p.x-cx)<40 && p.y>gy-60 && p.y<gy+10){
      S.isDragging=true;
      S.dragStartMouseX=p.x;
      S.dragStartObjX=S.objX;
      S.objV=0;
      try{U9Sound.ping(440,0.1,0.08);}catch(ex){}
    }
  }

  function onMove(e){
    e.preventDefault&&e.preventDefault();
    if(!S.isDragging) return;
    const p=getPos(e);
    const dx=p.x-S.dragStartMouseX; // إزاحة الماوس بالبكسل

    // القوة = مقاومة الاحتكاك × نسبة السحب (تدريجي)
    // dx موجب = سحب يمين → قوة يمين (سالب بمحور الإزاحة)
    const rawForce = dx * 3.5; // N per px
    S.appliedF = -rawForce;    // سالب لأن السحب يمين = قوة ناحية اليمين

    // إذا تجاوزنا الاحتكاك الساكن — يتحرك الجسم مع الإصبع
    if(Math.abs(S.appliedF)>staticMax()){
      const newX=S.dragStartObjX + dx/W();
      S.objX=Math.max(0.07,Math.min(0.93,newX));
      S.objV=dx/W()/DT*0.012;
    }
  }

  function onUp(e){
    if(!S.isDragging) return;
    S.isDragging=false;
    // إذا كان يتحرك بسرعة عالية — اتركه يستمر مع احتكاك
    // إذا كان بطيئاً — أعد القوة للصفر
    if(Math.abs(S.objV)<0.05){
      S.appliedF=0;
      S.objV=0;
    } else {
      S.appliedF=0; // لا يوجد قوة تطبيق بعد الإفلات
    }
  }

  cv.addEventListener('mousedown', onDown,false);
  cv.addEventListener('mousemove', onMove,false);
  cv.addEventListener('mouseup',   onUp,  false);
  cv.addEventListener('touchstart',onDown,{passive:false});
  cv.addEventListener('touchmove', onMove,{passive:false});
  cv.addEventListener('touchend',  onUp,  false);

  draw();
}


// 9-4 Tab 2 - عوامل الاحتكاك — تفاعل مباشر على الـ canvas
// ══════════════════════════════════════════════════════════════
function simFriction2(){
  const _fr2ExpectedTab = (currentSim==='g6frictionInquiry') ? 0 : 1;
  if((currentSim!=='friction'&&currentSim!=='g6friction'&&currentSim!=='g6frictionInquiry')||currentTab!==_fr2ExpectedTab)return;
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  const S=simState.u9Fr2=Object.assign({
    factor:'weight',
    weight:80,roughness:0.35,area:2,
    animT:0,
    // سحب مباشر
    dragging:null, // {type:'weight'|'rough', idx:0|1|2, startX, startVal}
    highlightIdx:-1,
    t:0,
  },simState.u9Fr2||{});

  function buildControls(){
    document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">🔬 العامل المدروس</div>
  <button class="ctrl-btn${S.factor==='weight'?' active':''}" style="${S.factor==='weight'?'background:#3498DB;color:#fff':''}"
    onclick="simState.u9Fr2.factor='weight';simFriction2()">⚖️ الوزن</button>
  <button class="ctrl-btn${S.factor==='rough'?' active':''}" style="${S.factor==='rough'?'background:#E67E22;color:#fff':''}"
    onclick="simState.u9Fr2.factor='rough';simFriction2()">🧱 الخشونة</button>
  <button class="ctrl-btn${S.factor==='area'?' active':''}" style="${S.factor==='area'?'background:#27AE60;color:#fff':''}"
    onclick="simState.u9Fr2.factor='area';simFriction2()">📐 المساحة</button>
</div>
<div class="info-box" style="font-size:12px;line-height:1.9">
  ${S.factor==='weight'?
    `<strong>F = μ × N</strong><br>μ = 0.35 (ثابت)<br>N = الوزن (متغير)<br><br>💡 <em>اسحب الأجسام لأعلى/أسفل!</em>`:
  S.factor==='rough'?
    `<strong>F = μ × N</strong><br>μ = الخشونة (متغير)<br>N = ${S.weight} N (ثابت)<br><br>💡 <em>اسحب الأجسام أفقياً!</em>`:
    `<strong>F = μ × N</strong><br>المساحة <strong>لا تؤثر!</strong><br>F = 0.35 × ${S.weight} N = ${(0.35*S.weight).toFixed(0)} N<br><br>💡 <em>جرب: نفس الاحتكاك!</em>`}
</div>
${S.factor==='weight'?`
<div class="ctrl-section">
  <div class="ctrl-label">⚖️ الوزن المرجعي</div>
  <div class="ctrl-row">
    <div class="ctrl-name"><span class="ctrl-val" id="wF2">${S.weight}</span> N</div>
    <input type="range" min="20" max="200" value="${S.weight}"
      oninput="simState.u9Fr2.weight=+this.value;document.getElementById('wF2').textContent=this.value">
  </div>
</div>`:''}
${S.factor==='rough'?`
<div class="ctrl-section">
  <div class="ctrl-label">μ المرجعي</div>
  <div class="ctrl-row">
    <div class="ctrl-name"><span class="ctrl-val" id="muF2">${S.roughness.toFixed(2)}</span></div>
    <input type="range" min="0.02" max="0.8" step="0.01" value="${S.roughness}"
      oninput="simState.u9Fr2.roughness=+this.value;document.getElementById('muF2').textContent=(+this.value).toFixed(2)">
  </div>
</div>`:''}`;
  }
  buildControls();

  // حساب الحالات الثلاث
  function getCases(){
    if(S.factor==='weight')
      return [{w:S.weight*0.5,mu:0.35,label:'خفيف',col:'#3498DB'},
              {w:S.weight,    mu:0.35,label:'متوسط',col:'#E67E22'},
              {w:S.weight*1.5,mu:0.35,label:'ثقيل',col:'#E74C3C'}];
    if(S.factor==='rough')
      return [{w:S.weight,mu:Math.max(0.02,S.roughness*0.4),label:'ناعم',col:'#3498DB'},
              {w:S.weight,mu:S.roughness,                   label:'متوسط',col:'#E67E22'},
              {w:S.weight,mu:Math.min(0.9,S.roughness*1.8), label:'خشن',col:'#E74C3C'}];
    return [{w:S.weight,mu:0.35,a:1,  label:'صغير',col:'#3498DB'},
            {w:S.weight,mu:0.35,a:2,  label:'متوسط',col:'#E67E22'},
            {w:S.weight,mu:0.35,a:3.5,label:'كبير',col:'#E74C3C'}];
  }

  // سحب الأجسام مباشرة
  function getBoxBounds(i,w2,gY){
    const cases=getCases();
    const cas=cases[i];
    const laneW=w2/3;
    const cx=laneW*i+laneW/2;
    const maxBW=Math.min(laneW*0.38,72);
    const bW=S.factor==='area'?Math.min(maxBW,16*(cas.a||1)+16):Math.min(maxBW,52);
    const bH=S.factor==='weight'?Math.max(22,Math.min(gY*0.32,cas.w*0.30)):Math.min(gY*0.28,44);
    return{cx,bW,bH,cas,gY};
  }

  let hoveredBox=-1;
  function onDown(e){
    e.preventDefault();
    const pos=U9.getPos(cv,e);
    const w2=cv.width,gY=cv.height*0.48;
    for(let i=0;i<3;i++){
      const b=getBoxBounds(i,w2,gY);
      if(pos.x>b.cx-b.bW&&pos.x<b.cx+b.bW&&pos.y>gY-b.bH-30&&pos.y<gY+10){
        S.dragging={idx:i,startX:pos.x,startY:pos.y,
          startW:b.cas.w,startMu:b.cas.mu||0.35};
        cv.style.cursor='grabbing';break;
      }
    }
  }
  function onMove(e){
    const pos=U9.getPos(cv,e);
    const w2=cv.width,gY=cv.height*0.48;
    if(!S.dragging){
      hoveredBox=-1;
      for(let i=0;i<3;i++){
        const b=getBoxBounds(i,w2,gY);
        if(pos.x>b.cx-b.bW&&pos.x<b.cx+b.bW&&pos.y>gY-b.bH-30&&pos.y<gY+10){
          hoveredBox=i;break;
        }
      }
      cv.style.cursor=hoveredBox>=0?'grab':'default';
      return;
    }
    e.preventDefault();
    const dy=S.dragging.startY-pos.y;
    const dx=pos.x-S.dragging.startX;
    if(S.factor==='weight'){
      // سحب لأعلى = زيادة وزن الوسط
      const newW=Math.max(10,Math.min(300,S.dragging.startW+dy*0.8));
      S.weight=newW; // تحديث الوزن المرجعي للمتوسط
    } else if(S.factor==='rough'){
      // سحب أفقياً لتغيير الخشونة
      const newMu=Math.max(0.02,Math.min(0.85,S.dragging.startMu+dx*0.004));
      S.roughness=newMu;
    }
    // تحديث الـ slider
    const sl=document.querySelector('#simControlsPanel input[type=range]');
    if(sl){
      if(S.factor==='weight'){sl.value=S.weight;const el=document.getElementById('wF2');if(el)el.textContent=S.weight.toFixed(0);}
      else if(S.factor==='rough'){sl.value=S.roughness;const el=document.getElementById('muF2');if(el)el.textContent=S.roughness.toFixed(2);}
    }
  }
  function onUp(){S.dragging=null;cv.style.cursor='default';}
  cv.addEventListener('mousedown',onDown);
  cv.addEventListener('mousemove',onMove);
  cv.addEventListener('mouseup',onUp);
  cv.addEventListener('touchstart',onDown,{passive:false});
  cv.addEventListener('touchmove',onMove,{passive:false});
  cv.addEventListener('touchend',onUp);

  function draw(){
    if((currentSim!=='friction'&&currentSim!=='g6friction'&&currentSim!=='g6frictionInquiry')||currentTab!==_fr2ExpectedTab){
      cv.removeEventListener('mousedown',onDown);cv.removeEventListener('mousemove',onMove);cv.removeEventListener('mouseup',onUp);
      cv.removeEventListener('touchstart',onDown);cv.removeEventListener('touchmove',onMove);cv.removeEventListener('touchend',onUp);
      return;
    }
    S.animT+=0.025;S.t+=0.02;
    const w=cv.width,h=cv.height;

    // تقسيم الشاشة: 55% للأجسام، 45% للرسم البياني
    const gY=h*0.48;        // خط الأرضية أعلى — يعطي مساحة للأرقام
    const chartTop=gY+28;   // فجوة كافية بين الأجسام والمستطيل
    const chartH=h-chartTop-52; // مساحة للرسم البياني — مع هامش لزر "ماذا نستنتج"

    const cases=getCases();

    c.clearRect(0,0,w,h);
    // خلفية منطقة الأجسام
    const bg=c.createLinearGradient(0,0,0,gY);
    bg.addColorStop(0,'#FFF8EE');bg.addColorStop(1,'#FFF2DC');
    c.fillStyle=bg;c.fillRect(0,0,w,gY);
    U9.grid(c,w,gY,'#F0E8D8',45);

    // خلفية منطقة الرسم البياني
    c.fillStyle='rgba(255,255,255,0.96)';
    c.beginPath();c.roundRect(6,chartTop,w-12,chartH,10);c.fill();
    c.strokeStyle='rgba(0,0,0,0.07)';c.lineWidth=1.5;
    c.beginPath();c.roundRect(6,chartTop,w-12,chartH,10);c.stroke();

    // أرضية مع نسيج
    c.fillStyle='#EDE5D8';c.fillRect(0,gY,w,6);
    if(S.factor==='rough'){
      for(let xi=0;xi<w;xi+=12){
        c.strokeStyle='rgba(120,66,18,0.3)';c.lineWidth=1;
        c.beginPath();c.moveTo(xi,gY);c.lineTo(xi+6,gY-6);c.stroke();
      }
    }
    c.fillStyle='#A0752A';c.fillRect(0,gY,w,3);

    // الحالات الثلاث — مساحة كل جسم w/3
    const laneW=w/3;
    cases.forEach((cas,i)=>{
      const cx=laneW*i+laneW/2;
      const fr=+(cas.mu*cas.w).toFixed(1);
      // حجم الجسم — مقيّد لمنع التداخل
      const maxBW=Math.min(laneW*0.38, 72);
      const bW=S.factor==='area'?Math.min(maxBW,16*(cas.a||1)+16):Math.min(maxBW,52);
      const bH=S.factor==='weight'?Math.max(22,Math.min(gY*0.32,cas.w*0.30)):Math.min(gY*0.28,44);
      const col=cas.col;
      const isDragging=S.dragging&&S.dragging.idx===i;
      const isHover=hoveredBox===i||isDragging;

      c.save();c.shadowColor=col+(isDragging?'88':'22');c.shadowBlur=isDragging?20:6;
      U9.rect(c,cx-bW,gY-bH,bW*2,bH,col+'2A',col,8,isHover?3:2);
      c.restore();

      // الرقم داخل الجسم
      const fs=Math.max(10,Math.min(14,bW*0.38));
      U9.txt(c,cas.w.toFixed(0)+' N',cx,gY-bH/2,col,fs,true);

      // وزن إضافي فوق الجسم (عامل الوزن فقط)
      if(S.factor==='weight'&&i>0){
        const extraH=Math.min((cas.w-cases[0].w)*0.22,28);
        if(extraH>4){
          U9.rect(c,cx-bW*0.65,gY-bH-extraH-1,bW*1.3,extraH,col+'44',col,4,1.5);
        }
      }

      // تسمية فوق الجسم
      U9.txt(c,cas.label,cx,gY-bH-10,col,11,true);

      // مؤشر السحب
      if(isHover){
        const hint=S.factor==='weight'?'↕':S.factor==='rough'?'↔':'—';
        U9.txt(c,hint,cx,gY-bH-22,'#888',10,true);
      }

      // سهم الاحتكاك — يسار الجسم، محدود الطول، فوق حد الرسم البياني
      const arLen=Math.max(16,Math.min(fr*0.55, laneW*0.38));
      const arY=Math.min(gY-bH/2, chartTop-18); // لا يتجاوز منطقة الرسم البياني
      U9.arrow(c,cx-bW-4,arY,cx-bW-4-arLen,arY,col,3.5,fr.toFixed(0)+' N',1);

      // سهم القوة — يمين الجسم
      U9.arrow(c,cx+bW+4,arY,cx+bW+4+arLen,arY,col,3.5,'',1);

      // خشونة السطح
      if(S.factor==='rough'){
        const dots=Math.max(3,Math.round(cas.mu*14));
        for(let d=0;d<dots;d++){
          const dx2=cx-bW+1+(d/(dots-1||1))*(bW*2-2);
          c.fillStyle=col+'77';c.beginPath();c.arc(dx2,gY+5,2.5,0,Math.PI*2);c.fill();
        }
      }
    });

    // عنوان الاستنتاج — في أعلى منطقة الرسم البياني بمساحة كافية
    const titleCol=S.factor==='area'?'#27AE60':'#1A6A8A';
    const title=S.factor==='weight'?'⚖️ الوزن ↑ ← احتكاك ↑  (F = μN)':
                S.factor==='rough' ?'🧱 الخشونة ↑ ← احتكاك ↑  (F = μN)':
                '📐 المساحة لا تؤثر على الاحتكاك!';
    const titleFs=Math.max(11,Math.min(13,w*0.018));
    // خلفية للعنوان لمنع التداخل
    c.fillStyle='rgba(255,255,255,0.9)';
    c.beginPath();c.roundRect(w/2-180,chartTop+4,360,24,6);c.fill();
    U9.txt(c,title,w/2,chartTop+16,titleCol,titleFs,true);

    // رسم بياني — يبدأ تحت العنوان بمسافة كافية
    const barVals=cases.map(cas=>+(cas.mu*cas.w).toFixed(1));
    const maxVal=Math.max(...barVals,1);
    const gbY=chartTop+34;                // بداية الرسم بعد العنوان
    const gbH=chartH-58;                  // مساحة للتسميات والأرقام تحت
    const totalBarW=w-48;
    const barW=Math.min(totalBarW/3*0.55, 80);
    const laneChart=totalBarW/3;

    cases.forEach((cas,i)=>{
      const bx=24+i*laneChart+(laneChart-barW)/2;
      const bh=Math.max(4, barVals[i]/maxVal*gbH);
      const prog=Math.min(S.animT*1.5,1);
      const actualH=bh*prog;

      // الشريط
      U9.rect(c,bx,gbY+gbH-actualH,barW,actualH,cas.col+'BB',cas.col,6,2);

      // قيمة فوق الشريط — فوق الشريط مباشرة بدون تداخل
      if(prog>0.3){
        const valY=gbY+gbH-actualH-4;
        c.fillStyle=cas.col;
        c.font=`bold ${Math.max(11,Math.min(13,barW*0.28))}px Tajawal,Arial`;
        c.textAlign='center';c.textBaseline='bottom';
        c.fillText(barVals[i].toFixed(0)+' N',bx+barW/2,valY);
      }

      // تسمية تحت الشريط
      c.font=`bold ${Math.max(10,Math.min(13,barW*0.22))}px Tajawal,Arial`;
      c.fillStyle=cas.col;c.textAlign='center';c.textBaseline='top';
      c.fillText(cas.label,bx+barW/2,gbY+gbH+6);
    });

    // خط المقارنة (عامل المساحة)
    if(S.factor==='area'){
      const lineY=gbY+gbH-barVals[0]/maxVal*gbH;
      c.strokeStyle='#27AE60';c.lineWidth=2;c.setLineDash([6,4]);
      c.beginPath();c.moveTo(20,lineY);c.lineTo(w-20,lineY);c.stroke();c.setLineDash([]);
      // خلفية للنص لمنع التداخل مع الأشرطة
      c.fillStyle='rgba(255,255,255,0.85)';
      c.beginPath();c.roundRect(w/2-70,lineY-18,140,18,4);c.fill();
      U9.txt(c,'✓ نفس الاحتكاك!',w/2,lineY-8,'#27AE60',11,true);
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════

// 9-4 Tab 3 - الاحتكاك الجزيئي (PhET Friction style)
// ══════════════════════════════════════════════════════════════
function simFriction3(){
  const _fr3ExpectedTab = (currentSim==='g6frictionInquiry') ? 1 : 2;
  if((currentSim!=='friction'&&currentSim!=='g6friction'&&currentSim!=='g6frictionInquiry')||currentTab!==_fr3ExpectedTab)return;
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  function W(){return cv.width;}
  function H(){return cv.height;}

  const ROUGH={
    smooth:{ label:'ناعم 🧈',  mu:0.05, bumps:0,  atomVib:1,  heatRate:0.00015, col:'#AED6F1' },
    medium:{ label:'متوسط 🪵', mu:0.35, bumps:5,  atomVib:2.5,heatRate:0.0008,  col:'#F0B27A' },
    rough: { label:'خشن 🧱',   mu:0.75, bumps:12, atomVib:5,  heatRate:0.0025,  col:'#E59866' },
  };

  if(!simState.fr3) simState.fr3={
    roughness:'medium',
    topX:0, speed:0,
    isDragging:false, dragStartX:0, dragStartTopX:0, lastX:0,
    heat:0, t:0, sparks:[], atoms:[],
  };
  const S=simState.fr3;

  function initAtoms(){
    S.atoms=[];
    // جزيئات سطح الكتاب الأسفل (صف واحد، ثابتة)
    for(let i=0;i<18;i++) S.atoms.push({
      layer:'bot', idx:i, ox:0, oy:0
    });
    // جزيئات سطح الكتاب الأعلى (صف واحد، تتحرك)
    for(let i=0;i<18;i++) S.atoms.push({
      layer:'top', idx:i, ox:0, oy:0
    });
  }
  if(S.atoms.length===0) initAtoms();

  // ── لوحة التحكم ──
  controls(`
    <div class="ctrl-label" style="font-size:15px">🔬 الاحتكاك الجزيئي</div>
    <div class="info-box" style="font-size:13px;line-height:1.9;text-align:center">
      اسحب الكتاب الأزرق ←→<br>
      وراقب الجزيئات والحرارة!
    </div>
    <div style="margin-top:12px">
      <div class="ctrl-label">خشونة السطح</div>
      <div style="display:flex;flex-direction:column;gap:6px;margin-top:6px">
        ${Object.entries(ROUGH).map(([k,v])=>`
          <button onclick="window._fr3Rough('${k}')" id="fr3Btn_${k}"
            style="padding:10px 12px;border-radius:10px;border:2px solid;
            font-family:Tajawal;font-size:14px;cursor:pointer;text-align:right;
            transition:all 0.2s;
            ${S.roughness===k
              ? 'background:'+v.col+';color:#2C3E50;border-color:'+v.col+';font-weight:700;box-shadow:0 3px 10px '+v.col+'88'
              : 'background:rgba(0,0,0,0.03);color:#555;border-color:rgba(0,0,0,0.1)'}">
            ${v.label}
            <span style="float:left;font-size:11px;opacity:0.7">μ = ${v.mu}</span>
          </button>`).join('')}
      </div>
    </div>
    <div style="margin-top:14px;padding:12px;background:rgba(231,76,60,0.07);
      border-radius:12px;border:1.5px solid rgba(231,76,60,0.15)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <span class="ctrl-label" style="color:#C0392B;margin:0">🌡️ الحرارة</span>
        <span id="fr3Deg" style="font-size:20px;font-weight:800;color:#E74C3C;font-family:monospace">0°</span>
      </div>
      <div style="height:18px;background:rgba(0,0,0,0.08);border-radius:9px;overflow:hidden">
        <div id="fr3Bar" style="height:100%;width:0%;border-radius:9px;
          background:linear-gradient(90deg,#F9E79F,#F39C12,#E74C3C,#C0392B);
          transition:width 0.1s"></div>
      </div>
    </div>
    <div id="fr3Info" style="margin-top:10px;padding:10px;
      background:rgba(26,143,168,0.07);border-radius:10px;
      font-size:13px;line-height:2;min-height:65px">
      ابدأ السحب!
    </div>
    <button onclick="window._fr3Reset()"
      style="margin-top:10px;width:100%;padding:10px;border-radius:10px;
      background:rgba(0,0,0,0.05);border:1.5px solid rgba(0,0,0,0.1);
      font-family:Tajawal;font-size:14px;cursor:pointer">↺ إعادة</button>
    <div class="q-box" style="margin-top:10px">
      <strong>❓ ص٥٥:</strong> لماذا يتولّد الحرارة عند الاحتكاك؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">لأن الجزيئات على السطحين تتصادم وتهتز بشدة، فتتحوّل الطاقة الحركية إلى طاقة حرارية.</div>
    </div>
  `);

  window._fr3Rough=function(k){
    S.roughness=k; S.heat=0; S.speed=0; S.topX=0; S.sparks=[];
    initAtoms();
    Object.keys(ROUGH).forEach(kk=>{
      const b=document.getElementById('fr3Btn_'+kk); if(!b) return;
      const v=ROUGH[kk];
      const sel=kk===k;
      b.style.background=sel?v.col:'rgba(0,0,0,0.03)';
      b.style.color=sel?'#2C3E50':'#555';
      b.style.borderColor=sel?v.col:'rgba(0,0,0,0.1)';
      b.style.fontWeight=sel?'700':'';
      b.style.boxShadow=sel?'0 3px 10px '+v.col+'88':'';
    });
    updateUI();
  };
  window._fr3Reset=function(){
    S.topX=0; S.heat=0; S.speed=0; S.sparks=[]; S.isDragging=false;
    initAtoms(); updateUI();
  };

  function updateUI(){
    const deg=Math.round(S.heat*150);
    const bar=document.getElementById('fr3Bar');
    const degEl=document.getElementById('fr3Deg');
    const info=document.getElementById('fr3Info');
    if(bar) bar.style.width=(S.heat*100).toFixed(1)+'%';
    if(degEl){
      degEl.textContent=deg+'°';
      degEl.style.color=deg<30?'#F39C12':deg<80?'#E74C3C':'#C0392B';
    }
    if(info){
      const spd=Math.abs(S.speed);
      const r=ROUGH[S.roughness];
      info.innerHTML=`
        <div>⚡ السرعة: <strong>${(spd*0.3).toFixed(2)} m/s</strong></div>
        <div>🔴 الخشونة: <strong>${r.label}</strong> (μ=${r.mu})</div>
        <div>🌡️ الحرارة: <strong style="color:#E74C3C">${deg}°</strong></div>
        <div style="font-size:11px;color:#888">
          ${deg>100?'⚠️ ساخن جداً!':deg>50?'🔥 يتولّد حرارة':spd>0.5?'💡 ابدأ تلاحظ الحرارة':'اسحب بقوة أكثر!'}
        </div>`;
    }
  }

  // ── رسم كتاب واقعي ──
  function drawBook(x, y, w2, h2, isTop){
    c.save();
    // ظل
    c.fillStyle='rgba(0,0,0,0.18)';
    c.beginPath(); c.roundRect(x+6,y+6,w2,h2,[6]); c.fill();

    // صفحات الكتاب (من الجانب)
    const pageCount=8;
    for(let i=pageCount;i>=0;i--){
      const py=y+i*(h2*0.04/(pageCount));
      c.fillStyle=`hsl(40,${30+i*3}%,${85+i*1.5}%)`;
      c.beginPath(); c.roundRect(x,py,w2,h2-i*(h2*0.04/pageCount),[i===0?6:2]); c.fill();
    }

    // غلاف الكتاب
    const coverCol  = isTop ? '#2471A3' : '#922B21';
    const spineCol  = isTop ? '#1A5276' : '#7B241C';
    const accentCol = isTop ? '#AED6F1' : '#F1948A';

    // غلاف رئيسي
    c.fillStyle=coverCol;
    c.beginPath(); c.roundRect(x,y,w2,h2,[6]); c.fill();

    // عمود الكتاب (يسار)
    c.fillStyle=spineCol;
    c.beginPath(); c.roundRect(x,y,16,h2,[6,0,0,6]); c.fill();

    // خط زخرفي أفقي
    c.fillStyle=accentCol;
    c.beginPath(); c.roundRect(x+20,y+h2*0.18,w2-28,4,[2]); c.fill();
    c.beginPath(); c.roundRect(x+20,y+h2*0.75,w2-28,4,[2]); c.fill();

    // عنوان
    c.font=`bold ${Math.max(11,w2*0.04)}px Tajawal`;
    c.fillStyle='rgba(255,255,255,0.9)';
    c.textAlign='center'; c.textBaseline='middle';
    c.fillText(isTop?'الكتاب الأعلى':'الكتاب الأسفل', x+w2/2+4, y+h2/2);

    // ليبل "اسحبني"
    if(isTop){
      c.fillStyle='rgba(255,255,255,0.5)';
      c.font=`11px Tajawal`;
      c.fillText('← اسحبني →', x+w2/2+4, y+h2*0.82);
    }

    c.restore();
    return {surfaceY: isTop ? y+h2 : y};
  }

  // ── رسم السطح المتعرج (خشونة) ──
  function drawSurface(x,y,w2,isTop,rough){
    const bumps=rough.bumps;
    if(bumps===0){
      // ناعم — خط مستقيم
      c.strokeStyle=isTop?'rgba(100,180,255,0.5)':'rgba(255,120,100,0.5)';
      c.lineWidth=2;
      c.setLineDash([]);
      c.beginPath(); c.moveTo(x,y); c.lineTo(x+w2,y); c.stroke();
      return;
    }
    // خشن — خط متعرج
    const seg=w2/bumps;
    const ht=rough.bumps===5?4:8;
    c.strokeStyle=isTop?'rgba(100,180,255,0.7)':'rgba(255,120,100,0.7)';
    c.lineWidth=2.5; c.setLineDash([]);
    c.beginPath(); c.moveTo(x,y);
    for(let i=0;i<bumps;i++){
      const bx=x+i*seg;
      const dir=isTop?-1:1;
      c.lineTo(bx+seg/4, y+dir*ht);
      c.lineTo(bx+seg/2, y);
      c.lineTo(bx+3*seg/4, y-dir*ht);
      c.lineTo(bx+seg, y);
    }
    c.stroke();
  }

  // ── رسم الجزيئات ──
  function drawAtoms(botY,topY,topX,rough){
    const w2=W()*0.72, bkX=(W()-w2)/2;
    const spd=Math.abs(S.speed);
    const vib=rough.atomVib * spd * 0.5 + S.heat*4;
    const N=18;

    S.atoms.forEach(a=>{
      const isTop=a.layer==='top';
      const seg=w2/N;
      let baseX, baseY;
      if(isTop){
        baseX = bkX + topX + (a.idx+0.5)*seg;
        baseY = topY + 8;
      } else {
        baseX = bkX + (a.idx+0.5)*seg;
        baseY = botY - 8;
      }

      // اهتزاز
      a.ox=(Math.random()-0.5)*vib*2;
      a.oy=(Math.random()-0.5)*vib;

      const ax=baseX+a.ox, ay=baseY+a.oy;
      const r2=isTop?5:5;

      // لون يتحول مع الحرارة
      const heat2=S.heat;
      let col;
      if(heat2<0.3){
        col=isTop?`rgba(52,152,219,0.85)`:`rgba(192,57,43,0.85)`;
      } else {
        const hf=Math.min((heat2-0.3)/0.7,1);
        col=isTop
          ?`rgba(${Math.round(52+hf*200)},${Math.round(152-hf*60)},${Math.round(219-hf*190)},0.9)`
          :`rgba(${Math.round(192+hf*60)},${Math.round(57+hf*20)},${Math.round(43-hf*20)},0.9)`;
      }

      // رسم الذرة
      const g2=c.createRadialGradient(ax-r2*0.3,ay-r2*0.3,1,ax,ay,r2);
      g2.addColorStop(0,'rgba(255,255,255,0.6)');
      g2.addColorStop(1,col);
      c.beginPath(); c.arc(ax,ay,r2,0,Math.PI*2);
      c.fillStyle=g2; c.fill();

      // هالة اهتزاز
      if(vib>2){
        c.strokeStyle=col.replace('0.9','0.3').replace('0.85','0.3');
        c.lineWidth=1.5;
        c.beginPath(); c.arc(ax,ay,r2+Math.min(vib,6),0,Math.PI*2); c.stroke();
      }
    });
  }

  // ── شرر ──
  function spawnSparks(x,y){
    if(S.t%3!==0) return;
    const n=Math.floor(ROUGH[S.roughness].mu*Math.abs(S.speed)*8);
    for(let i=0;i<Math.min(n,6);i++){
      S.sparks.push({
        x:x+(Math.random()-0.5)*W()*0.4,
        y:y,
        vx:(Math.random()-0.5)*8,
        vy:-Math.random()*6-2,
        life:1,
        r:2+Math.random()*3,
        col:['#F1C40F','#E67E22','#E74C3C','#F39C12'][Math.floor(Math.random()*4)]
      });
    }
  }

  // ── الرسم الرئيسي ──
  function draw(){
    if((currentSim!=='friction'&&currentSim!=='g6friction'&&currentSim!=='g6frictionInquiry')||currentTab!==_fr3ExpectedTab)return;
    S.t++;
    const w=W(), h=H();
    c.clearRect(0,0,w,h);

    // خلفية تتلوّن بالحرارة
    const hf=S.heat;
    const r=Math.round(235+hf*20), g=Math.round(245-hf*50), b2=Math.round(251-hf*70);
    c.fillStyle=`rgb(${r},${g},${b2})`;
    c.fillRect(0,0,w,h);

    // تحديث الحرارة
    const spd=Math.abs(S.speed);
    const rough=ROUGH[S.roughness];
    if(spd>0.3){
      const spdFactor=Math.min(spd,8);
      S.heat=Math.min(1, S.heat+spdFactor*rough.heatRate);
    } else {
      S.heat=Math.max(0, S.heat-0.0015);
    }

    // أبعاد الكتب
    const bkW=w*0.72, bkH=h*0.16;
    const bkX=(w-bkW)/2;
    const midY=h*0.50;
    const botY=midY+4;      // سطح الكتاب الأسفل العلوي
    const topY=midY-4;      // سطح الكتاب الأعلى السفلي
    const tx=bkX+S.topX;   // x الكتاب الأعلى

    // ── رسم الكتاب الأسفل ──
    drawBook(bkX, botY, bkW, bkH, false);
    drawSurface(bkX, botY, bkW, false, rough);

    // ── رسم الكتاب الأعلى ──
    drawBook(tx, topY-bkH, bkW, bkH, true);
    drawSurface(tx, topY, bkW, true, rough);

    // ── منطقة التلامس (توهج حراري) ──
    if(hf>0.05){
      const heatGrad=c.createLinearGradient(0,midY-16,0,midY+16);
      heatGrad.addColorStop(0,'rgba(231,76,60,0)');
      heatGrad.addColorStop(0.5,`rgba(231,76,60,${Math.min(hf*0.55,0.45)})`);
      heatGrad.addColorStop(1,'rgba(231,76,60,0)');
      c.fillStyle=heatGrad;
      c.fillRect(tx, midY-16, bkW, 32);
    }

    // ── الجزيئات ──
    drawAtoms(botY, topY, S.topX, rough);

    // ── شرر ──
    if(spd>0.5) spawnSparks(tx+bkW/2, midY);
    S.sparks=S.sparks.filter(sp=>{
      sp.x+=sp.vx; sp.y+=sp.vy; sp.vy+=0.35; sp.life-=0.055;
      c.globalAlpha=sp.life;
      c.fillStyle=sp.col;
      c.beginPath(); c.arc(sp.x,sp.y,sp.r,0,Math.PI*2); c.fill();
      c.globalAlpha=1;
      return sp.life>0;
    });

    // ── مقبض السحب (مميز) ──
    {
      const hndX=tx+bkW/2, hndY=topY-bkH-18;
      c.fillStyle=S.isDragging?'#F39C12':'rgba(52,152,219,0.9)';
      c.beginPath(); c.roundRect(hndX-36,hndY-14,72,28,[8]); c.fill();
      c.font='bold 13px Tajawal'; c.fillStyle='white';
      c.textAlign='center'; c.textBaseline='middle';
      c.fillText('↔ اسحب',hndX,hndY);
    }

    // ── مؤشر حرارة مرئي ──
    if(hf>0.04){
      const deg=Math.round(hf*150);
      c.font=`bold ${Math.round(18+hf*16)}px Tajawal`;
      c.fillStyle=`rgba(${Math.round(200+hf*55)},${Math.round(80-hf*60)},30,${Math.min(0.9,hf+0.2)})`;
      c.textAlign='center'; c.textBaseline='top';
      c.fillText('🌡️ '+deg+'°', w/2, 10);
    }

    // ── مقارنة مرئية للخشونة ──
    {
      const labels={smooth:'سطح ناعم ← حرارة بطيئة',medium:'سطح متوسط ← حرارة معتدلة',rough:'سطح خشن ← حرارة سريعة!'};
      c.font='13px Tajawal'; c.fillStyle='rgba(52,73,94,0.55)';
      c.textAlign='center'; c.textBaseline='bottom';
      c.fillText(labels[S.roughness], w/2, h-10);
    }

    // تعليمة أولية
    if(spd<0.1 && hf<0.02){
      c.font='14px Tajawal'; c.fillStyle='rgba(52,73,94,0.5)';
      c.textAlign='center'; c.textBaseline='middle';
      c.fillText('← اسحب الكتاب الأزرق ذهاباً وإياباً →', w/2, h*0.82);
    }

    updateUI();
    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }

  // ── السحب ──
  function getPos(e){
    const r=cv.getBoundingClientRect();
    const t=(e.touches&&e.touches[0])||e;
    return {x:(t.clientX-r.left)*W()/r.width,
            y:(t.clientY-r.top)*H()/r.height};
  }

  function onDown(e){
    e.preventDefault&&e.preventDefault();
    const p=getPos(e);
    const bkW=W()*0.72, bkH=H()*0.16;
    const bkX=(W()-bkW)/2;
    const tx=bkX+S.topX, topY=H()*0.50-4;
    if(p.x>tx-10&&p.x<tx+bkW+10&&p.y>topY-bkH-36&&p.y<topY+10){
      S.isDragging=true;
      S.dragStartX=p.x; S.dragStartTopX=S.topX; S.lastX=p.x;
      try{U9Sound.ping(440,0.1,0.08);}catch(ex){}
    }
  }

  function onMove(e){
    e.preventDefault&&e.preventDefault();
    if(!S.isDragging) return;
    const p=getPos(e);
    const dx=p.x-S.dragStartX;
    const maxShift=W()*0.28;
    S.topX=Math.max(-maxShift,Math.min(maxShift,S.dragStartTopX+dx));
    S.speed=(p.x-S.lastX)*0.45;
    S.lastX=p.x;
  }

  function onUp(e){
    if(!S.isDragging) return;
    S.isDragging=false;
    S.speed*=0.4;
  }

  cv.addEventListener('mousedown', onDown,false);
  cv.addEventListener('mousemove', onMove,false);
  cv.addEventListener('mouseup',   onUp,  false);
  cv.addEventListener('touchstart',onDown,{passive:false});
  cv.addEventListener('touchmove', onMove,{passive:false});
  cv.addEventListener('touchend',  onUp,  false);

  draw();
}


// 9-5 Tab 1 - السقوط الحر مع السحب
// ══════════════════════════════════════════════════════════════
function simAirResist1(){
  if((currentSim!=='airresist'&&currentSim!=='g6airresist')||currentTab!==0)return;
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  if(!simState.u9AR1) simState.u9AR1={
    selectedObjs:['parachute','metal','feather'],
    airDensity:1,running:false,
    objs:{},times:{},winner:null,t:0
  };
  const S=simState.u9AR1;

  const OBJECTS={
    parachute:{label:'مظلة 🪂',m:5,Cd:1.2,A:15,col:'#E74C3C',icon:'🪂'},
    feather:{label:'ريشة 🪶',m:0.01,Cd:1.0,A:0.05,col:'#8E44AD',icon:'🪶'},
    metal:{label:'كرة معدن ⚽',m:1,Cd:0.47,A:0.045,col:'#2980B9',icon:'⚽'},
    paper:{label:'ورقة 📄',m:0.005,Cd:1.5,A:0.06,col:'#27AE60',icon:'📄'},
    rock:{label:'حجر 🪨',m:3,Cd:0.8,A:0.02,col:'#7F8C8D',icon:'🪨'},
    balloon:{label:'بالون 🎈',m:0.01,Cd:0.47,A:0.05,col:'#D4870A',icon:'🎈'},
  };

  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">☑️ اختر الأجسام</div>
  ${Object.entries(OBJECTS).map(([k,v])=>`
    <label style="display:flex;align-items:center;gap:8px;font-size:14px;margin-bottom:5px;cursor:pointer">
      <input type="checkbox" ${S.selectedObjs.includes(k)?'checked':''}
        onchange="const s=simState.u9AR1.selectedObjs;const i=s.indexOf('${k}');if(this.checked&&i<0)s.push('${k}');else if(!this.checked&&i>=0)s.splice(i,1)">
      <span style="color:${v.col};font-weight:bold">${v.label}</span>
    </label>
  `).join('')}
</div>
<div class="ctrl-section">
  <div class="ctrl-label">💨 كثافة الهواء: <span class="ctrl-val" id="arDens">${S.airDensity}</span></div>
  <input type="range" min="0" max="3" step="0.1" value="${S.airDensity}"
    oninput="simState.u9AR1.airDensity=+this.value;document.getElementById('arDens').textContent=(+this.value).toFixed(1)">
</div>
<div class="ctrl-section">
  <button class="ctrl-btn play" onclick="simState.u9AR1.running=true;simState.u9AR1.objs={};simState.u9AR1.times={};simState.u9AR1.winner=null;simState.u9AR1.t=0">🔽 أسقط</button>
  <button class="ctrl-btn reset" onclick="simState.u9AR1.running=false;simState.u9AR1.objs={};simState.u9AR1.times={};simState.u9AR1.winner=null">↺ إعادة</button>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (ص٥٦-٥٧):</strong><br>
  ١- اذكر اسمَي القوّتين المؤثِّرتين على المظلّي عندما يهبط نحو الأرض، واذكر اتّجاه كلٍّ منهما.<br>
  ٢- لماذا لا تنفع المظلّة على القمر؟<br>
  <span style="color:#1A8FA8;font-size:13px">💡 جرِّب: اضبط كثافة الهواء = 0 وراقب النتيجة!</span>

    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- الوزن (للأسفل) ومقاومة الهواء (للأعلى).<br>٢- لأن القمر لا يملك هواءً، فلا توجد مقاومة هواء.<br><b>🔬 الاستنتاج:</b> عند كثافة الهواء = صفر (فراغ)، <b>كل الأجسام تصل في نفس الوقت</b> بغض النظر عن كتلتها أو شكلها — لأن الجاذبية تُسرّع جميع الأجسام بنفس المقدار (g = 10 م/ث²).</div>
  </div>`;

  function draw(){
    if((currentSim!=='airresist'&&currentSim!=='g6airresist')||currentTab!==0)return;
    const S=simState.u9AR1;
    const w=cv.width,h=cv.height;
    const startY=h*0.08,groundY=h*0.87;
    const fallH=groundY-startY;
    const sel=S.selectedObjs.filter(k=>OBJECTS[k]);
    const laneW=sel.length>0?Math.min(w/sel.length,130):w;

    c.clearRect(0,0,w,h);
    const sky=c.createLinearGradient(0,0,0,h);
    sky.addColorStop(0,S.airDensity<0.5?'#1A1A2E':'#87CEEB');
    sky.addColorStop(1,S.airDensity<0.5?'#2C2C54':'#B0E2FF');
    c.fillStyle=sky;c.fillRect(0,0,w,h);

    // جزيئات هواء
    if(S.airDensity>0.5&&S.running){
      c.fillStyle='rgba(255,255,255,0.15)';
      for(let i=0;i<S.airDensity*20;i++){
        const px=(i*137+S.t*10)%w,py=(i*71+S.t*5)%h;
        c.beginPath();c.arc(px,py,1.5,0,Math.PI*2);c.fill();
      }
    }
    c.fillStyle='#5D8A3C';c.fillRect(0,groundY,w,h-groundY);
    c.fillStyle='#4A7A2A';c.fillRect(0,groundY,w,5);
    U9.txt(c,'🏁 خط الوصول',w/2,groundY+22,'white',18,true);

    const g=10;
    if(S.running){
      S.t+=0.016;
      sel.forEach((k,idx)=>{
        if(!S.objs[k])S.objs[k]={y:0,v:0,trail:[]};
        const ob=S.objs[k];
        const obj=OBJECTS[k];
        if(ob.y<fallH){
          const drag=0.5*S.airDensity*obj.Cd*obj.A*ob.v*ob.v;
          const accel=g-(drag/obj.m);
          ob.v+=Math.max(accel,0)*0.016*2;
          ob.y+=ob.v*0.5;
          // صوت ريح للأجسام السريعة
          if(S.airDensity>0.3 && ob.v>8 && Math.random()<0.04) U9Sound.wind(0.08*S.airDensity);
          ob.trail.push({y:ob.y,x:0});if(ob.trail.length>40)ob.trail.shift();
          if(ob.y>=fallH){
            ob.y=fallH;
            if(!S.times[k]){
              S.times[k]=S.t;
              if(!S.winner){S.winner=k;U9Sound.win();}
              U9Sound.thud(Math.min(0.65,0.2+obj.m*0.05), obj.m>1?55:110);
            }
          }
        }
      });
      if(sel.every(k=>S.times[k]))S.running=false;
    }

    sel.forEach((k,i)=>{
      const obj=OBJECTS[k];
      const lane=laneW*i+laneW/2;
      const bY=S.objs[k]?startY+S.objs[k].y:startY;
      const bR=22;

      // خط المسار
      c.strokeStyle=obj.col+'44';c.lineWidth=1.5;c.setLineDash([6,4]);
      c.beginPath();c.moveTo(lane,startY);c.lineTo(lane,groundY);c.stroke();c.setLineDash([]);

      // ذيل الحركة
      if(S.objs[k]&&S.objs[k].trail.length>1){
        S.objs[k].trail.forEach((pt,pi)=>{
          const alpha=(pi/S.objs[k].trail.length)*0.25;
          c.fillStyle=obj.col+Math.floor(alpha*255).toString(16).padStart(2,'0');
          c.beginPath();c.arc(lane,startY+pt.y,bR*0.35,0,Math.PI*2);c.fill();
        });
      }

      // ── الجسم: دائرة ملونة + emoji ──
      // الدائرة الخلفية
      c.save();
      const cg=c.createRadialGradient(lane-bR*0.3,bY-bR*0.3,2,lane,bY,bR+5);
      cg.addColorStop(0,obj.col+'EE');cg.addColorStop(1,obj.col+'66');
      c.beginPath();c.arc(lane,bY,bR+5,0,Math.PI*2);
      c.shadowColor=obj.col;c.shadowBlur=16;
      c.fillStyle=cg;c.fill();c.shadowBlur=0;
      c.strokeStyle='rgba(255,255,255,0.55)';c.lineWidth=2;c.stroke();
      // emoji — بفونت صريح يدعم الألوان
      c.font=`${bR*1.65}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",Arial`;
      c.textAlign='center';c.textBaseline='middle';
      c.fillStyle='black'; // بعض المتصفحات تحتاج لون
      c.fillText(obj.icon,lane,bY+1);
      c.restore();

      // سهام القوى — كبيرة خارج الدائرة
      if(S.running&&S.objs[k]&&!S.times[k]){
        const vel=S.objs[k].v||0;
        const wLen=Math.max(Math.min(obj.m*10*0.55,55),10);
        U9.arrow(c,lane,bY+bR+8,lane,bY+bR+8+wLen,'#E74C3C',3.5,'',1);
        if(vel>0.5&&S.airDensity>0.1){
          const drag=0.5*S.airDensity*obj.Cd*obj.A*vel*vel;
          const dLen=Math.max(Math.min(drag*1.2,55),6);
          U9.arrow(c,lane,bY-bR-8,lane,bY-bR-8-dLen,'#3498DB',3.5,'',1);
        }
      }

      // وقت الوصول + ميدالية
      if(S.times[k]){
        U9.rect(c,lane-28,bY+bR+10,56,20,obj.col+'CC','rgba(255,255,255,0.3)',5,1);
        U9.txt(c,S.times[k].toFixed(2)+'s',lane,bY+bR+23,'#fff',11,true);
      }
      // عرض 🥇 فقط إذا كان هناك فائز حقيقي (مقاومة هواء موجودة)
      if(k===S.winner && S.airDensity>0.05){
        c.save();c.font='22px "Apple Color Emoji","Segoe UI Emoji",Arial';
        c.textAlign='center';c.textBaseline='middle';
        c.shadowColor='#FFD700';c.shadowBlur=12;
        c.fillText('🥇',lane,bY-bR-24);c.restore();
      }
      U9.txt(c,obj.label,lane,startY-26,obj.col,12,true);
    });

    // تحقق من حالة التعادل (فراغ أو كثافة منخفضة جداً)
    const allDone=sel.length>0&&sel.every(k=>S.times[k]);
    const timesArr=allDone?sel.map(k=>S.times[k]):[];
    const minT=timesArr.length?Math.min(...timesArr):0;
    const maxT=timesArr.length?Math.max(...timesArr):0;
    const isTie=allDone&&(maxT-minT)<0.08;

    if(allDone&&!S.running){
      if(isTie||S.airDensity<0.05){
        // حالة الفراغ أو التعادل
        U9.rect(c,w/2-195,h/2-40,390,80,'rgba(0,20,60,0.92)','#1A8FA8',14,3);
        U9.txt(c,'⚡ كلّ الأجسام وصلت في نفس الوقت!',w/2,h/2-12,'#7FFFFF',18,true);
        U9.txt(c,'في الفراغ: الجاذبية تُسرّع الجميع بالتساوي ✅',w/2,h/2+14,'white',14,false);
      } else {
        U9.rect(c,w/2-160,h/2-35,320,70,'rgba(0,0,0,0.85)','#FFD700',14,3);
        U9.txt(c,'🏆 '+OBJECTS[S.winner].label+' أسرع!',w/2,h/2-10,'#FFD700',19,true);
        U9.txt(c,'في '+S.times[S.winner].toFixed(2)+' ثانية',w/2,h/2+16,'white',17,false);
      }
    } else if(S.winner&&S.running&&S.airDensity>0.05){
      U9.rect(c,w/2-120,groundY-45,240,36,'rgba(0,0,0,0.7)','#FFD700',10,2);
      U9.txt(c,'🥇 '+OBJECTS[S.winner].label+' وصل أولاً!',w/2,groundY-24,'#FFD700',14,true);
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 9-5 Tab 2 - السرعة الحدّية — سحب مباشر للجسم
// ══════════════════════════════════════════════════════════════
function simAirResist2(){
  if((currentSim!=='airresist'&&currentSim!=='g6airresist')||currentTab!==1)return;
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  const S=simState.u9AR2=Object.assign({
    objKey:'parachute',planet:'earth',
    v:0,t:0,vHistory:[],running:false,
    // تحكم إضافي قابل للسحب
    customArea:25,customMass:80,
    dragging:null, // 'parachute'|'mass'
    dragStart:{x:0,y:0,val:0},
  },simState.u9AR2||{});

  const OBJECTS={
    parachute:{label:'مظلة 🪂',    m:()=>S.customMass, Cd:1.2, A:()=>S.customArea, col:'#E74C3C', draggable:true},
    skydiver: {label:'قافز 🤸',    m:()=>75,            Cd:1.0, A:()=>0.7,          col:'#3498DB', draggable:false},
    ball:     {label:'كرة ⚽',     m:()=>0.45,          Cd:0.47,A:()=>0.038,        col:'#27AE60', draggable:false},
    feather:  {label:'ريشة 🪶',    m:()=>0.003,         Cd:1.0, A:()=>0.003,        col:'#9B59B6', draggable:false},
  };
  const ATMO={
    earth: {label:'🌍 الأرض',  g:10,  rho:1.225, col:'#2980B9', sky:'#1A2A5A'},
    mars:  {label:'🔴 المريخ', g:3.72, rho:0.02,  col:'#E74C3C', sky:'#2A0A00'},
    venus: {label:'♀️ الزهرة', g:8.87, rho:65,    col:'#D4870A', sky:'#1A0A00'},
  };

  function buildControls(){
    const obj=OBJECTS[S.objKey];
    const atm=ATMO[S.planet];
    const m=obj.m(), A=obj.A();
    const termV=atm.rho>0?Math.sqrt(2*m*atm.g/(atm.rho*obj.Cd*A)):Infinity;
    document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">🎯 الجسم</div>
  ${Object.entries(OBJECTS).map(([k,v])=>`
    <button class="ctrl-btn${S.objKey===k?' active':''}" style="${S.objKey===k?'background:'+v.col+';color:#fff':''};font-size:12px"
      onclick="simState.u9AR2.objKey='${k}';simState.u9AR2.v=0;simState.u9AR2.vHistory=[];simAirResist2()">
      ${v.label}</button>
  `).join('')}
</div>
${S.objKey==='parachute'?`
<div class="ctrl-section">
  <div class="ctrl-label">🪂 مساحة المظلة: <span class="ctrl-val" id="arArea">${S.customArea}</span> m²</div>
  <input type="range" min="1" max="50" value="${S.customArea}"
    oninput="simState.u9AR2.customArea=+this.value;document.getElementById('arArea').textContent=this.value;simState.u9AR2.v=0;simState.u9AR2.vHistory=[]">
  <div class="ctrl-label" style="margin-top:8px">⚖️ كتلة المظلة: <span class="ctrl-val" id="arMass">${S.customMass}</span> kg</div>
  <input type="range" min="10" max="200" value="${S.customMass}"
    oninput="simState.u9AR2.customMass=+this.value;document.getElementById('arMass').textContent=this.value;simState.u9AR2.v=0;simState.u9AR2.vHistory=[]">
  <div style="font-size:10px;color:#AAA;margin-top:4px">💡 اسحب المظلة أفقياً لتغيير مساحتها!</div>
</div>`:''}
<div class="ctrl-section">
  <div class="ctrl-label">🌍 الكوكب</div>
  ${Object.entries(ATMO).map(([k,v])=>`
    <button class="ctrl-btn${S.planet===k?' active':''}" style="${S.planet===k?'background:'+v.col+';color:#fff':''};font-size:12px"
      onclick="simState.u9AR2.planet='${k}';simState.u9AR2.v=0;simState.u9AR2.vHistory=[];simAirResist2()">
      ${v.label}</button>
  `).join('')}
</div>
<div class="ctrl-section">
  <button class="ctrl-btn play" onclick="simState.u9AR2.running=!simState.u9AR2.running;this.textContent=simState.u9AR2.running?'⏸ إيقاف':'▶ تشغيل'">${S.running?'⏸ إيقاف':'▶ تشغيل'}</button>
  <button class="ctrl-btn reset" onclick="simState.u9AR2.v=0;simState.u9AR2.t=0;simState.u9AR2.vHistory=[];simState.u9AR2.running=false">↺ إعادة</button>
</div>
<div class="info-box" style="font-size:11px;line-height:1.8">
  <strong>v الحدّية = √(2mg/ρCdA)</strong><br>
  = ${termV===Infinity?'∞':termV.toFixed(1)} m/s<br>
  السرعة الحالية: <strong style="color:${obj.col}">${S.v.toFixed(1)}</strong> m/s
</div>`;
  }
  buildControls();

  // سحب المظلة أفقياً لتغيير مساحتها
  const PARA_X=()=>cv.width*0.22, PARA_Y=()=>cv.height*0.35;
  function onDown(e){
    if(S.objKey!=='parachute')return;
    e.preventDefault();
    const pos=U9.getPos(cv,e);
    const px=PARA_X(),py=PARA_Y();
    if(Math.abs(pos.x-px)<60&&Math.abs(pos.y-py)<50){
      S.dragging='parachute';
      S.dragStart={x:pos.x,y:pos.y,val:S.customArea};
    }
  }
  function onMove(e){
    if(!S.dragging)return;
    e.preventDefault();
    const pos=U9.getPos(cv,e);
    if(S.dragging==='parachute'){
      const dx=pos.x-S.dragStart.x;
      S.customArea=Math.max(1,Math.min(50,S.dragStart.val+dx*0.3));
      S.v=0;S.vHistory=[];
      const sl=document.querySelector('#simControlsPanel input[type=range]');
      if(sl){sl.value=S.customArea;const el=document.getElementById('arArea');if(el)el.textContent=S.customArea.toFixed(0);}
      // تحديث لوحة المعلومات
      const obj2=OBJECTS.parachute;const atm2=ATMO[S.planet];
      const tv=atm2.rho>0?Math.sqrt(2*S.customMass*atm2.g/(atm2.rho*obj2.Cd*S.customArea)):Infinity;
      const inf=document.querySelector('.info-box');
      if(inf)inf.innerHTML=`<strong>v الحدّية = √(2mg/ρCdA)</strong><br>= ${tv.toFixed(1)} m/s<br>السرعة الحالية: <strong style="color:#E74C3C">0.0</strong> m/s`;
    }
  }
  function onUp(){S.dragging=null;cv.style.cursor='default';}
  cv.addEventListener('mousedown',onDown);
  cv.addEventListener('mousemove',onMove);
  cv.addEventListener('mouseup',onUp);
  cv.addEventListener('touchstart',onDown,{passive:false});
  cv.addEventListener('touchmove',onMove,{passive:false});
  cv.addEventListener('touchend',onUp);

  function draw(){
    if((currentSim!=='airresist'&&currentSim!=='g6airresist')||currentTab!==1){
      cv.removeEventListener('mousedown',onDown);cv.removeEventListener('mousemove',onMove);cv.removeEventListener('mouseup',onUp);
      cv.removeEventListener('touchstart',onDown);cv.removeEventListener('touchmove',onMove);cv.removeEventListener('touchend',onUp);
      return;
    }
    const w=cv.width,h=cv.height;
    const obj=OBJECTS[S.objKey];
    const atm=ATMO[S.planet];
    const m=obj.m(), A=obj.A();

    if(S.running){
      S.t+=0.016;
      const drag=0.5*atm.rho*obj.Cd*A*S.v*S.v;
      const accel=Math.max(0,atm.g-(drag/m));
      S.v+=accel*0.016;
      S.vHistory.push(S.v);
      if(S.vHistory.length>200)S.vHistory.shift();
    }

    const termV=atm.rho>0?Math.sqrt(2*m*atm.g/(atm.rho*obj.Cd*A)):Infinity;
    const drag=0.5*atm.rho*obj.Cd*A*S.v*S.v;
    const weight=m*atm.g;
    const balanced=weight>0&&Math.abs(drag-weight)/weight<0.05;

    c.clearRect(0,0,w,h);
    // خلفية سماء ليلية متدرجة
    const sky=c.createLinearGradient(0,0,0,h);
    sky.addColorStop(0,atm.sky);sky.addColorStop(1,atm.sky+'88');
    c.fillStyle=sky;c.fillRect(0,0,w,h);
    // نجوم
    for(let si=0;si<40;si++){
      c.fillStyle=`rgba(255,255,200,${0.3+Math.sin(S.t*0.5+si)*0.2})`;
      c.beginPath();c.arc((si*173)%w,(si*89)%(h*0.8),0.8,0,Math.PI*2);c.fill();
    }

    // الجسم الرئيسي وسهامه
    const ox=PARA_X(),oy=PARA_Y();

    // رسم المظلة أو الجسم
    if(S.objKey==='parachute'){
      const halfW=Math.max(18,Math.sqrt(S.customArea)*6);
      // قبة المظلة
      const paraG=c.createRadialGradient(ox,oy-20,5,ox,oy,halfW);
      paraG.addColorStop(0,'#F1948A');paraG.addColorStop(1,'#E74C3C88');
      c.save();
      c.shadowColor='#E74C3C';c.shadowBlur=S.dragging?24:10;
      c.beginPath();c.arc(ox,oy,halfW,Math.PI,Math.PI*2);
      c.fillStyle=paraG;c.fill();
      c.strokeStyle='#E74C3C';c.lineWidth=2.5;c.stroke();
      c.restore();
      // خطوط المظلة
      for(let si2=-1;si2<=1;si2+=0.5){
        c.strokeStyle='rgba(231,76,60,0.5)';c.lineWidth=1;
        c.beginPath();c.moveTo(ox+si2*halfW,oy);c.lineTo(ox,oy+halfW*0.9);c.stroke();
      }
      // الشخص
      U9.person(c,ox,oy+halfW*0.9+10,0.7);
      // مقياس المساحة
      U9.txt(c,'A='+S.customArea.toFixed(0)+'m²',ox,oy-halfW-12,'#E74C3C',10,true);
      U9.txt(c,S.dragging?'↔ اسحب':'',ox,oy+halfW*0.9+44,'#E74C3C88',9,true);
    } else {
      // إيموجي الجسم
      c.save();c.shadowColor=obj.col;c.shadowBlur=15;
      c.font='44px serif';c.textAlign='center';c.textBaseline='middle';
      c.fillText(obj.label.split(' ')[1]||'⚽',ox,oy);
      c.shadowBlur=0;c.restore();
    }

    // سهام القوى
    const wArrow=Math.min(weight*0.4,80);
    const dArrow=Math.min(drag*0.4,80);
    U9.arrow(c,ox+48,oy,ox+48,oy+wArrow,'#E74C3C',4,'W='+weight.toFixed(0)+'N',1);
    if(drag>0.1) U9.arrow(c,ox+48,oy,ox+48,oy-dArrow,'#3498DB',4,'D='+drag.toFixed(0)+'N',1);

    // حالة الحركة أسفل الجسم
    if(!balanced){
      U9.txt(c,weight>drag?'⬇️ يتسارع...':'⬆️ يتباطأ...',ox,oy+90,'rgba(255,255,255,0.6)',11);
    }

    // ── تخطيط الكانفاس: عمودان ──
    // العمود الأيسر: المظلة + سهام (40%)
    // العمود الأيمن: رسم بياني فوق + أعمدة تحت (60%)
    const pad=8;
    const leftW=Math.round(w*0.42);
    const rightX=leftW+pad;
    const rightW=w-rightX-pad;

    // ── العمود الأيسر: لوحة البيانات ──
    const panH=Math.round(h*0.46);
    U9.rect(c,pad,pad,leftW-pad,panH,'rgba(0,0,0,0.55)','rgba(255,255,255,0.13)',10,1.5);
    c.fillStyle='rgba(255,255,255,0.88)';
    c.font=`bold ${Math.round(w*0.022)}px Tajawal`;c.textAlign='center';
    c.fillText('📊 البيانات',pad+(leftW-pad)/2,pad+16);
    c.strokeStyle='rgba(255,255,255,0.18)';c.lineWidth=1;
    c.beginPath();c.moveTo(pad+6,pad+22);c.lineTo(leftW-6,pad+22);c.stroke();

    const rows=[
      {l:'الكتلة m', v:m+' kg',                       col:'#AED6F1'},
      {l:'الجاذبية g',v:atm.g+' m/s²',               col:'#F1948A'},
      {l:'الوزن W',  v:weight.toFixed(1)+' N',         col:'#E74C3C'},
      {l:'كثافة ρ',  v:atm.rho+' kg/m³',              col:'#85C1E9'},
      {l:'مساحة A',  v:A.toFixed(2)+' m²',            col:obj.col},
      {l:'مقاومة D', v:drag.toFixed(1)+' N',           col:'#3498DB'},
      {l:'سرعة v',   v:S.v.toFixed(1)+' m/s',         col:'#82E0AA'},
      {l:'v الحدّية',v:termV===Infinity?'∞':termV.toFixed(1)+' m/s',col:'#F39C12'},
    ];
    const fs=Math.max(10,Math.round(w*0.021));
    const rowH=(panH-26)/rows.length;
    rows.forEach((row,i)=>{
      const ry=pad+26+i*rowH+rowH*0.65;
      if(i%2===0){c.fillStyle='rgba(255,255,255,0.04)';c.fillRect(pad+2,pad+26+i*rowH,leftW-pad-4,rowH);}
      c.font=`${fs}px Tajawal`;
      c.fillStyle='rgba(255,255,255,0.5)';c.textAlign='right';
      c.fillText(row.l, leftW-10, ry);
      c.fillStyle=row.col;c.textAlign='left';
      c.fillText(row.v, pad+8, ry);
    });

    // ── رسم بياني السرعة (عمود أيمن، النصف العلوي) ──
    const gH=Math.round(h*0.46);
    const gX=rightX, gY=pad, gW=rightW;
    U9.rect(c,gX,gY,gW,gH,'rgba(0,0,0,0.45)','rgba(255,255,255,0.12)',10,1.5);
    U9.txt(c,'منحنى السرعة مع الزمن',gX+gW/2,gY+16,'rgba(255,255,255,0.85)',Math.round(w*0.022),true);

    if(S.vHistory.length>1){
      const maxV=Math.max(termV===Infinity?S.v*1.5:termV*1.4,S.v+1,5);
      if(termV!==Infinity){
        const ty=gY+gH-10-(termV/maxV)*(gH-28);
        c.strokeStyle='#F39C12';c.lineWidth=1.5;c.setLineDash([7,4]);
        c.beginPath();c.moveTo(gX+6,ty);c.lineTo(gX+gW-6,ty);c.stroke();c.setLineDash([]);
        U9.txt(c,'v∞='+termV.toFixed(1)+'m/s',gX+gW-8,ty-7,'#F39C12',Math.round(w*0.018),true,'right');
      }
      c.beginPath();
      S.vHistory.forEach((v2,i)=>{
        const px=gX+8+i*(gW-16)/200;
        const py=gY+gH-10-(v2/maxV)*(gH-28);
        i===0?c.moveTo(px,py):c.lineTo(px,py);
      });
      c.strokeStyle=obj.col;c.lineWidth=2.5;c.stroke();
      const lastPx=Math.min(gX+8+S.vHistory.length*(gW-16)/200,gX+gW-8);
      const lastPy=gY+gH-10-(S.v/maxV)*(gH-28);
      c.fillStyle=obj.col;c.shadowColor=obj.col;c.shadowBlur=8;
      c.beginPath();c.arc(lastPx,lastPy,5,0,Math.PI*2);c.fill();c.shadowBlur=0;
    }

    // ── أعمدة الوزن/المقاومة ──
    const bY=gY+gH+pad;
    const bH=h-bY-pad;
    const bX=pad, bTW=w-pad*2;
    const lblSize=Math.round(w*0.019);
    U9.rect(c,bX,bY,bTW,bH,'rgba(0,0,0,0.45)','rgba(255,255,255,0.12)',10,1.5);

    // عنوان + شارة التوازن في سطر واحد
    const titleTxt = balanced ? '⚖️ توازن! — الوزن = المقاومة' : 'الوزن (أحمر) ← مقاومة الهواء (أزرق)';
    const titleCol = balanced ? '#FFD700' : 'rgba(255,255,255,0.7)';
    U9.txt(c,titleTxt,bX+bTW/2,bY+16,titleCol,lblSize,true);

    const maxF=Math.max(weight,drag,1);
    const barW=bTW*0.18;
    // نترك 28px للعنوان فوق و20px للتسمية تحت
    const barTop=bY+28, barBot=bY+bH-22;
    const barMaxH=barBot-barTop;

    // عمود الوزن
    const wH2=Math.max(2,Math.min(weight/maxF*barMaxH,barMaxH));
    const wGr=c.createLinearGradient(0,barBot-wH2,0,barBot);
    wGr.addColorStop(0,'#E74C3C');wGr.addColorStop(1,'#C0392B88');
    c.fillStyle=wGr;c.fillRect(bX+bTW*0.18,barBot-wH2,barW,wH2);
    c.strokeStyle='#E74C3C';c.lineWidth=1.5;c.strokeRect(bX+bTW*0.18,barBot-wH2,barW,wH2);
    U9.txt(c,'W='+weight.toFixed(0)+'N',bX+bTW*0.18+barW/2,barBot+13,'#E74C3C',lblSize,true);

    // عمود المقاومة
    const dH2=Math.max(2,Math.min(drag/maxF*barMaxH,barMaxH));
    const dGr=c.createLinearGradient(0,barBot-dH2,0,barBot);
    dGr.addColorStop(0,'#3498DB');dGr.addColorStop(1,'#2980B988');
    c.fillStyle=dGr;c.fillRect(bX+bTW*0.58,barBot-dH2,barW,dH2);
    c.strokeStyle='#3498DB';c.lineWidth=1.5;c.strokeRect(bX+bTW*0.58,barBot-dH2,barW,dH2);
    U9.txt(c,'D='+drag.toFixed(0)+'N',bX+bTW*0.58+barW/2,barBot+13,'#3498DB',lblSize,true);

    // خط التوازن
    if(balanced){
      c.strokeStyle='#FFD700';c.lineWidth=2;c.setLineDash([6,3]);
      c.beginPath();c.moveTo(bX+12,barBot-wH2);c.lineTo(bX+bTW-12,barBot-wH2);c.stroke();
      c.setLineDash([]);
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  draw();
}



// ============================================================
// ══════════════════════════════════════════════════════════════
// 9-5 Tab 3 - استقصاء مساحة المظلة
// ══════════════════════════════════════════════════════════════
function simAirResist3(){
  if((currentSim!=='airresist'&&currentSim!=='g6airresist')||currentTab!==2)return;
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  if(!simState.u9AR3) simState.u9AR3={
    area: 5,
    running: false,
    y: 0, v: 0, t: 0,
    trail: [],
    results: window._ar3Results || [],
    finished: false,
  };
  window._ar3Results = simState.u9AR3.results;

  const MASS = 80;
  const G    = 10;
  const RHO  = 1.225;
  const CD   = 2.0;
  const FALL = 200;
  const AREAS = [2, 5, 10, 20, 40];
  // مُضاعِف بصري: يجعل المظلة الصغيرة أسرع بكثير والكبيرة أبطأ بكثير
  const VISUAL_SPEED = 2.5; // ضغط/تمديد الزمن بصرياً

  // ─── دوال مساعدة تقرأ simState.u9AR3 مباشرة (لا closure قديمة) ───
  function resetRun(){
    simState.u9AR3.running=false;
    simState.u9AR3.y=0; simState.u9AR3.v=0; simState.u9AR3.t=0;
    simState.u9AR3.trail=[]; simState.u9AR3.finished=false;
    refreshPanel();
  }
  function clearTable(){
    simState.u9AR3.results=[];
    window._ar3Results=[];
    updateTable();
  }
  function setArea(a){
    simState.u9AR3.area=a;
    resetRun();
  }
  window._ar3Reset=resetRun;
  window._ar3Clear=clearTable;
  window._ar3Area=setArea;

  function updateTable(){
    const el=document.getElementById('inquiryTable');
    if(!el) return;
    const res = window._ar3Results || (simState.u9AR3 && simState.u9AR3.results) || [];
    if(res.length===0){el.innerHTML='';return;}
    el.innerHTML=`
<div class="ctrl-label" style="margin-bottom:6px">📊 نتائج الاستقصاء</div>
<table style="width:100%;border-collapse:collapse;font-size:12px;direction:rtl">
  <tr style="background:#1A3A72;color:white">
    <th style="padding:4px 6px;border-radius:4px 0 0 4px">مساحة المظلة</th>
    <th style="padding:4px 6px">وقت الوصول</th>
    <th style="padding:4px 6px;border-radius:0 4px 4px 0">السرعة الحدّية</th>
  </tr>
  ${res.map((r,i)=>`
  <tr style="background:${i%2===0?'rgba(26,58,114,0.08)':'rgba(26,58,114,0.04)'}">
    <td style="padding:5px 8px;text-align:center;color:#E74C3C;font-weight:bold">${r.area} م²</td>
    <td style="padding:5px 8px;text-align:center;font-weight:600">${r.time != null ? r.time.toFixed(1)+' ث' : '—'}</td>
    <td style="padding:5px 8px;text-align:center;color:#2980B9">${r.termV != null ? r.termV.toFixed(1)+' م/ث' : '—'}</td>
  </tr>`).join('')}
</table>
<div style="color:#888;font-size:11px;margin-top:6px;text-align:center">كلما زادت المساحة → زاد الوقت → قلّت السرعة</div>`;
  }

  function refreshPanel(){
    const cur=simState.u9AR3.area;
    document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">📐 مساحة المظلة</div>
  <div style="display:flex;flex-direction:column;gap:6px;margin-top:6px">
    ${AREAS.map(a=>`
      <button onclick="_ar3Area(${a})" class="area-btn ctrl-btn"
        style="font-size:13px;padding:6px 8px;${cur===a?'background:#E74C3C;color:white;':''}">
        🪂 ${a} م²</button>
    `).join('')}
  </div>
</div>
<div class="ctrl-section">
  <button class="ctrl-btn play" onclick="
    simState.u9AR3.y=0;simState.u9AR3.v=0;simState.u9AR3.t=0;simState.u9AR3.elapsed=0;
    simState.u9AR3.trail=[];simState.u9AR3.finished=false;simState.u9AR3.running=true;
  ">▶ أسقط المظلي</button>
  <button class="ctrl-btn reset" onclick="_ar3Reset()">↺ إعادة</button>
  <button class="ctrl-btn" style="background:#8E44AD;color:white;margin-top:6px"
    onclick="_ar3Clear()">🗑 مسح الجدول</button>
</div>
<div class="ctrl-section" id="inquiryTable" style="direction:rtl"></div>`;
    updateTable();
  }

  refreshPanel();

  function draw(){
    if((currentSim!=='airresist'&&currentSim!=='g6airresist')||currentTab!==2)return;
    const S=simState.u9AR3;  // دائماً أحدث نسخة
    const w=cv.width, h=cv.height;
    const groundY=h*0.88;
    // نبدأ المظلة أسفل قليلاً لتظهر القبة كاملة
    const startY=h*0.16;
    const fallH=groundY-startY;

    c.clearRect(0,0,w,h);

    // خلفية سماء
    const sky=c.createLinearGradient(0,0,0,h);
    sky.addColorStop(0,'#1B3A6B');
    sky.addColorStop(0.6,'#2E86C1');
    sky.addColorStop(1,'#85C1E9');
    c.fillStyle=sky;c.fillRect(0,0,w,h);

    // سحب خلفية
    [[0.15,0.12,80,20],[0.55,0.18,100,18],[0.75,0.08,70,15]].forEach(([fx,fy,rw,rh])=>{
      c.fillStyle='rgba(255,255,255,0.12)';
      c.beginPath();c.ellipse(fx*w,fy*h,rw,rh,0,0,Math.PI*2);c.fill();
    });

    // الأرض
    c.fillStyle='#4A7A2A';c.fillRect(0,groundY,w,h-groundY);
    c.fillStyle='#5D8A3C';c.fillRect(0,groundY,w,8);
    U9.txt(c,'🏁 الأرض',w/2,groundY+18,'white',14,true);

    // خط البداية
    c.strokeStyle='rgba(255,255,255,0.2)';c.lineWidth=1;c.setLineDash([6,4]);
    c.beginPath();c.moveTo(0,startY);c.lineTo(w,startY);c.stroke();c.setLineDash([]);
    U9.txt(c,'↕ 400 م',w*0.88,startY+10,'rgba(255,255,255,0.5)',11,true);

    // ─── محاكاة الفيزياء ───
    if(S.running && !S.finished){
      // السرعة البصرية: المساحة الصغيرة أسرع بصرياً بكثير
      const termV = Math.sqrt(2*MASS*G/(RHO*CD*S.area));
      const areaFactor = 40 / S.area;
      const speedMult = Math.pow(areaFactor, 0.904);
      const dt = 0.016 * speedMult;  // الوقت البصري المُسرَّع
      const dtReal = 0.016;          // الوقت الحقيقي لكل frame
      const steps = 6;
      const dtStep = dt / steps;          // للحركة البصرية
      const dtStepReal = dtReal / steps;  // للوقت الحقيقي
      for(let i=0; i<steps; i++){
        const drag = 0.5*RHO*CD*S.area*S.v*S.v;
        const accel = G - (drag/MASS);
        // حرّك الجسم بصرياً بـ dtStep (مُسرَّع)
        S.v = Math.max(0, S.v + accel*dtStep);
        S.y += S.v*dtStep;
        // لكن احسب الوقت الحقيقي بـ dtStepReal
        S.t += dtStep;
        S.elapsed = (S.elapsed||0) + dtStepReal;
        if(S.y>=FALL){
          S.y=FALL; S.running=false; S.finished=true;
          const exists=S.results.find(r=>r.area===S.area);
          if(!exists){
            const finalTime = S.elapsed > 0 ? S.elapsed : S.t / speedMult;
            window._ar3Results = window._ar3Results || [];
            window._ar3Results.push({area:S.area, time:finalTime, termV:termV});
            window._ar3Results.sort((a,b)=>a.area-b.area);
            S.results = window._ar3Results;
          }
          U9Sound.win();
          setTimeout(updateTable,100);
          break;
        }
      }
      S.trail.push(S.y);
      if(S.trail.length>60)S.trail.shift();
      if(S.v>3 && Math.random()<0.04) U9Sound.wind(0.05);
    }

    // موضع المظلة على الشاشة
    const dispY = S.y>0 ? startY + (S.y/FALL)*fallH : startY;

    // ذيل الحركة
    S.trail.forEach((ty,ti)=>{
      const alpha=(ti/S.trail.length)*0.18;
      c.fillStyle=`rgba(231,76,60,${alpha})`;
      const ty2=startY+(ty/FALL)*fallH;
      c.beginPath();c.arc(w/2,ty2,6,0,Math.PI*2);c.fill();
    });

    // ─── رسم المظلة ───
    const parasX=w/2;
    // مركز القبة = dispY (أسفل الخط بمسافة كافية لظهور القبة)
    const domeR = 10 + Math.sqrt(S.area)*11;
    const parasY = dispY + domeR; // مركز القبة يبدأ بعد ارتفاع القبة من الخط

    // خيوط المظلة
    c.strokeStyle='rgba(255,255,255,0.7)';c.lineWidth=1;
    [[-domeR*0.7,0],[-domeR*0.3,0],[0,0],[domeR*0.3,0],[domeR*0.7,0]].forEach(([dx])=>{
      c.beginPath();c.moveTo(parasX+dx,parasY);c.lineTo(parasX,parasY+domeR+28);c.stroke();
    });

    // قبة المظلة
    c.save();
    const domeGrad=c.createRadialGradient(parasX-domeR*0.2,parasY-domeR*0.3,2,parasX,parasY,domeR*1.1);
    domeGrad.addColorStop(0,'#F1948A');
    domeGrad.addColorStop(0.5,'#E74C3C');
    domeGrad.addColorStop(1,'#922B21');
    c.beginPath();
    c.moveTo(parasX-domeR,parasY);
    c.bezierCurveTo(parasX-domeR,parasY-domeR*1.3,parasX+domeR,parasY-domeR*1.3,parasX+domeR,parasY);
    c.closePath();
    c.shadowColor='rgba(231,76,60,0.4)';c.shadowBlur=14;
    c.fillStyle=domeGrad;c.fill();
    c.strokeStyle='rgba(255,255,255,0.3)';c.lineWidth=1;c.shadowBlur=0;
    [-domeR*0.5,0,domeR*0.5].forEach(dx=>{
      c.beginPath();
      c.moveTo(parasX+dx,parasY);
      c.bezierCurveTo(parasX+dx,parasY-domeR*1.1,parasX+dx,parasY-domeR*1.1,parasX+dx*0.6,parasY-domeR*1.15);
      c.stroke();
    });
    c.restore();
    U9.txt(c,S.area+' م²',parasX,parasY-domeR*1.3-6,'white',13,true);

    // المظلي
    c.save();
    c.font='22px "Apple Color Emoji","Segoe UI Emoji",Arial';
    c.textAlign='center';c.textBaseline='top';
    c.fillText('🧍',parasX-9,parasY+domeR+22);
    c.restore();

    // ─── سهام القوى ───
    if(S.running && S.v>0){
      const weight=MASS*G;
      const drag=0.5*RHO*CD*S.area*S.v*S.v;
      const wLen=Math.min(weight*0.18,60);
      const dLen=Math.min(drag*0.18,60);
      U9.arrow(c,parasX+domeR+22,parasY,parasX+domeR+22,parasY+wLen,'#E74C3C',3,'W',1);
      U9.txt(c,weight.toFixed(0)+'N',parasX+domeR+42,parasY+wLen/2,'#E74C3C',10,false);
      U9.arrow(c,parasX+domeR+22,parasY,parasX+domeR+22,parasY-dLen,'#3498DB',3,'D',1);
      U9.txt(c,drag.toFixed(0)+'N',parasX+domeR+42,parasY-dLen/2,'#3498DB',10,false);
    }

    // ─── بيانات ───
    if(S.running||S.finished){
      U9.rect(c,8,8,178,76,'rgba(0,0,0,0.75)','#3498DB',8,2);
      U9.txt(c,'⏱ '+S.t.toFixed(1)+' ث',97,24,'white',13,true);
      U9.txt(c,'💨 '+S.v.toFixed(1)+' م/ث',97,43,'#3498DB',13,true);
      const termV=Math.sqrt(2*MASS*G/(RHO*CD*S.area));
      U9.txt(c,'🎯 حدّي: '+termV.toFixed(1)+' م/ث',97,62,'#2ECC71',12,true);
    }

    // ─── رسالة الوصول ───
    if(S.finished){
      U9.rect(c,w/2-160,h/2-42,320,84,'rgba(0,0,0,0.88)','#2ECC71',14,3);
      U9.txt(c,'✅ وصل المظلي بأمان!',w/2,h/2-18,'#2ECC71',17,true);
      U9.txt(c,'استغرق '+(S.elapsed||0).toFixed(1)+' ث بمظلة '+S.area+' م²',w/2,h/2+6,'white',14,true);
      const termV2=Math.sqrt(2*MASS*G/(RHO*CD*S.area));
      U9.txt(c,'السرعة الحدّية: '+termV2.toFixed(1)+' م/ث',w/2,h/2+28,'#3498DB',13,true);
    }

    // ─── تعليمة البداية ───
    if(!S.running && !S.finished){
      U9.rect(c,w/2-145,h*0.45,290,46,'rgba(0,0,0,0.7)','#E74C3C',10,2);
      U9.txt(c,'📐 اختر مساحة المظلة',w/2,h*0.45+14,'white',14,true);
      U9.txt(c,'ثم اضغط ▶ أسقط المظلي',w/2,h*0.45+32,'rgba(255,255,255,0.75)',13,true);
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error('SIM ERR:',e)}});
  }
  draw();
}

// UNIT 10 — التبايُن والتصنيف  (PhET-level v2)
// ============================================================

// ══════════════════════════════════════════════════════════
// 10-2 TAB 1 — مخطط التكرار التفاعلي (رسم حقيقي بالفأرة)
// ══════════════════════════════════════════════════════════
function simVariation1() {
  const petalData = [18,20,21,20,19,20,17,21,20,20,19,18,20,21,20,19,20,20,21,17];
  const bins = {}; petalData.forEach(v => bins[v]=(bins[v]||0)+1);
  const vals = [17,18,19,20,21];

  simState = {
    t:0, flowers: petalData.map((v,i) => ({
      id:i, val:v,
      x:0.05+Math.random()*0.88, y:0.12+Math.random()*0.68,
      col:['#E74C3C','#F39C12','#E91E63','#FF9800','#9C27B0'][i%5],
      measured:false, selected:false
    })),
    // Student-drawn bars: key=value, height=studentCount
    drawnBars: {17:0,18:0,19:0,20:0,21:0},
    draggingBar: null,  // which bar being dragged
    dragStartY: 0,
    mode:'measure',   // 'measure' | 'draw'
    showAnswer: false,
    measured: []
  };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📊 مخطط التكرار التفاعلي</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.6;margin-top:4px">
        <strong>١.</strong> وضع القياس — اضغط الزهور لقياسها<br>
        <strong>٢.</strong> وضع الرسم — ارفع الأعمدة بنفسك!<br>
        <strong>٣.</strong> تحقق من إجابتك
      </div>
    </div>
    <div style="display:flex;gap:6px;margin-bottom:6px">
      <button class="ctrl-btn on" id="btnMeasure" style="flex:1;background:rgba(39,174,96,0.25);border-color:rgba(39,174,96,0.6);color:#2DC653">🔬 قياس</button>
      <button class="ctrl-btn" id="btnDraw" style="flex:1;background:rgba(52,152,219,0.2);border-color:rgba(52,152,219,0.5);color:#3498DB">✏️ رسم</button>
    </div>
    <button class="ctrl-btn" id="btnCheck" style="width:100%;margin-bottom:4px;background:rgba(155,89,182,0.2);border-color:rgba(155,89,182,0.5);color:#9B59B6">✅ تحقق من الإجابة</button>
    <button class="ctrl-btn" id="btnReset" style="width:100%;background:rgba(231,76,60,0.15);border-color:rgba(231,76,60,0.4);color:#E74C3C">🔄 إعادة</button>
    <div class="info-box" id="v1Info">اضغط على الزهور لمعرفة عدد بتلاتها</div>
    <div class="q-box"><strong>❓ أسئلة الكتاب (ص٦٢):</strong><br>١- ما عدد البتلات الأكثر تكراراً؟<br>٢- ما الفرق بين البتلات الكثيرة والقليلة؟
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- الأكثر تكراراً: 5 أو 6 بتلات (حسب البيانات).<br>٢- الأزهار ذات البتلات الكثيرة عادةً تستقطب حشرات التلقيح.</div>
  </div>
  `);

  btn('btnMeasure', () => {
    simState.mode='measure';
    document.getElementById('btnMeasure').classList.add('on');
    document.getElementById('btnDraw').classList.remove('on');
    document.getElementById('v1Info').textContent = 'اضغط على الزهور لقياسها';
  });
  btn('btnDraw', () => {
    if(simState.measured.length===0){ document.getElementById('v1Info').textContent='قِس الزهور أولاً!'; return; }
    simState.mode='draw';
    document.getElementById('btnDraw').classList.add('on');
    document.getElementById('btnMeasure').classList.remove('on');
    document.getElementById('v1Info').textContent = 'اسحب الأعمدة للأعلى والأسفل لتعبئة المخطط';
  });
  btn('btnCheck', () => {
    simState.showAnswer = !simState.showAnswer;
    document.getElementById('v1Info').textContent = simState.showAnswer ? 'الإجابة الصحيحة ظاهرة — قارن مع مخططك' : 'اضغط مجدداً لإخفاء الإجابة';
    if(simState.showAnswer) U9Sound.win();
  });
  btn('btnReset', () => {
    simState.measured=[];
    simState.drawnBars={17:0,18:0,19:0,20:0,21:0};
    simState.showAnswer=false;
    simState.flowers.forEach(f=>{f.measured=false;f.selected=false;});
    simState.mode='measure';
    document.getElementById('btnMeasure').classList.add('on');
    document.getElementById('btnDraw').classList.remove('on');
    document.getElementById('v1Info').textContent='تمت الإعادة';
    U9Sound.ping(330,0.2,0.15);
  });

  const canvas = document.getElementById('simCanvas');

  canvas.onmousedown = canvas.ontouchstart = function(e) {
    e.preventDefault();
    const rect=canvas.getBoundingClientRect();
    const mx=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX)-rect.left;
    const my=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientY)-rect.top;
    const w=canvas.width, h=canvas.height;

    if(simState.mode==='measure') {
      simState.flowers.forEach(f => {
        const fx=f.x*w, fy=f.y*h;
        if(Math.hypot(mx-fx,my-fy)<24) {
          f.selected=true; f.measured=true;
          if(!simState.measured.includes(f.id)) simState.measured.push(f.id);
          document.getElementById('v1Info').innerHTML = `🌸 زهرة #${f.id+1}: <strong style="color:${f.col}">${f.val} بتلة</strong>  (تم قياس ${simState.measured.length}/20)`;
          U9Sound.ping(380+f.val*12,0.2,0.15);
          setTimeout(()=>{ f.selected=false; },400);
        }
      });
    } else if(simState.mode==='draw') {
      // Check if clicking on a bar in the draw-chart area
      const chartL=w*0.08, chartR=w*0.92, chartT=h*0.1, chartB=h*0.88;
      const barW=(chartR-chartL)/vals.length;
      vals.forEach((v,i) => {
        const bx=chartL+i*barW+barW*0.1;
        const bw=barW*0.8;
        if(mx>=bx && mx<=bx+bw && my>=chartT && my<=chartB) {
          simState.draggingBar=v;
          simState.dragStartY=my;
          simState.dragStartCount=simState.drawnBars[v];
        }
      });
    }
  };

  canvas.onmousemove = canvas.ontouchmove = function(e) {
    e.preventDefault();
    if(simState.mode!=='draw' || simState.draggingBar===null) return;
    const rect=canvas.getBoundingClientRect();
    const my=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientY)-rect.top;
    const h=canvas.height;
    const maxCount=8, chartT=h*0.1, chartB=h*0.88, chartH=chartB-chartT;
    const dy=simState.dragStartY-my;
    const newCount=Math.max(0,Math.min(maxCount, simState.dragStartCount+Math.round(dy/(chartH/maxCount))));
    if(newCount!==simState.drawnBars[simState.draggingBar]) {
      simState.drawnBars[simState.draggingBar]=newCount;
      U9Sound.ping(300+newCount*40,0.08,0.05);
    }
  };

  canvas.onmouseup = canvas.ontouchend = function() { simState.draggingBar=null; };

  function draw() {
    if(currentSim!=='variation'||currentTab!==0) return;
    const c=ctx(),w=W(),h=H(); simState.t++;
    const t=simState.t;

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F0FFF4'); bg.addColorStop(1,'#E8F5E9');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    if(simState.mode==='measure') {
      // Flower field
      c.fillStyle='rgba(30,77,43,0.6)'; c.font=`bold ${Math.round(h*0.038)}px Tajawal`; c.textAlign='center';
      c.fillText(`قِس الزهور — تم: ${simState.measured.length}/20`,w/2,28);

      simState.flowers.forEach(f => {
        const fx=f.x*w, fy=f.y*h;
        const r=f.measured?20:16;
        const pulse=f.selected?Math.sin(t*0.3)*4:0;
        // Petals
        for(let p=0;p<f.val;p++) {
          const ang=(p/f.val)*Math.PI*2;
          const px=fx+Math.cos(ang)*(r+pulse)*1.25;
          const py=fy+Math.sin(ang)*(r+pulse)*1.25;
          c.beginPath(); c.ellipse(px,py,(r+pulse)*0.5,(r+pulse)*0.28,ang,0,Math.PI*2);
          c.fillStyle=f.measured?f.col:`rgba(180,210,180,0.6)`; c.fill();
        }
        // Center
        c.beginPath(); c.arc(fx,fy,(r+pulse)*0.42,0,Math.PI*2);
        c.fillStyle=f.measured?'#F4D03F':'#CCC'; c.fill();
        c.strokeStyle='rgba(0,0,0,0.1)'; c.lineWidth=1; c.stroke();

        if(f.measured) {
          c.fillStyle='white'; c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
          c.fillText(f.val,fx,fy+4);
          // Badge
          c.fillStyle=f.col; c.beginPath(); c.roundRect(fx-12,fy+r*1.5,24,16,8); c.fill();
          c.fillStyle='white'; c.font=`bold ${Math.round(h*0.022)}px Tajawal`;
          c.fillText(f.val,fx,fy+r*1.5+11);
        }
      });

      // Mini tally — top-left corner, fully inside canvas
      if(simState.measured.length>0) {
        const tally={}; simState.measured.forEach(id=>{ const v=simState.flowers[id].val; tally[v]=(tally[v]||0)+1; });
        const rowH = Math.round(h*0.052);
        const boxW = Math.round(w*0.16);
        const boxH = rowH * (vals.length+1) + 10;
        const tx = 10, ty = 40;

        // Card background
        c.fillStyle='rgba(30,45,61,0.72)';
        c.beginPath(); c.roundRect(tx, ty, boxW, boxH, 12); c.fill();
        c.strokeStyle='rgba(255,255,255,0.15)'; c.lineWidth=1;
        c.beginPath(); c.roundRect(tx, ty, boxW, boxH, 12); c.stroke();

        // Header
        c.fillStyle='rgba(255,255,255,0.18)';
        c.beginPath(); c.roundRect(tx, ty, boxW, rowH, [12,12,0,0]); c.fill();
        c.fillStyle='white'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
        c.fillText('📊 جدول العدد', tx+boxW/2, ty+rowH*0.72);

        // Rows
        vals.forEach((v,i) => {
          const count = tally[v]||0;
          const ry = ty + rowH*(i+1);
          if(i%2===0){ c.fillStyle='rgba(255,255,255,0.06)'; c.fillRect(tx, ry, boxW, rowH); }
          // Value badge
          const badgeCol=['#E74C3C','#F39C12','#27AE60','#3498DB','#9B59B6'][i];
          c.fillStyle=badgeCol+'BB';
          c.beginPath(); c.roundRect(tx+6, ry+4, Math.round(boxW*0.28), rowH-8, 6); c.fill();
          c.fillStyle='white'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
          c.fillText(v, tx+6+Math.round(boxW*0.14), ry+rowH*0.7);
          // Count bar
          const maxPossible=8;
          const barW = Math.round((boxW*0.55) * (count/maxPossible));
          if(barW>0){
            c.fillStyle=badgeCol+'99';
            c.beginPath(); c.roundRect(tx+boxW*0.38, ry+rowH*0.28, barW, rowH*0.44, 4); c.fill();
          }
          // Count number
          c.fillStyle='white'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='right';
          c.fillText(count, tx+boxW-8, ry+rowH*0.7);
        });
      }

    } else {
      // Draw-chart mode
      const chartL=w*0.12, chartR=w*0.91, chartT=h*0.1, chartB=h*0.82;
      const chartH=chartB-chartT;
      const maxCount=8;
      const barW=(chartR-chartL)/vals.length;

      // Background panel
      c.fillStyle='white'; c.beginPath(); c.roundRect(chartL-12,chartT-12,chartR-chartL+24,chartH+16,14); c.fill();
      c.strokeStyle='rgba(39,174,96,0.3)'; c.lineWidth=1.5; c.stroke();

      c.fillStyle='#1E4D2B'; c.font=`bold ${Math.round(h*0.042)}px Tajawal`; c.textAlign='center';
      c.fillText('ارسم مخطط التكرار — اسحب الأعمدة!',w/2,chartT-22);

      // Grid lines
      for(let i=0;i<=maxCount;i++) {
        const gy=chartB-(i/maxCount)*chartH;
        c.strokeStyle=i%2===0?'rgba(0,0,0,0.1)':'rgba(0,0,0,0.05)'; c.lineWidth=1; c.setLineDash([3,3]);
        c.beginPath(); c.moveTo(chartL,gy); c.lineTo(chartR,gy); c.stroke(); c.setLineDash([]);
        c.fillStyle='#7A8A98'; c.font=`${Math.round(h*0.028)}px Tajawal`; c.textAlign='right';
        if(i%2===0) c.fillText(i,chartL-5,gy+4);
      }

      vals.forEach((v,i) => {
        const bx=chartL+i*barW+barW*0.08;
        const bw=barW*0.84;
        const studentCount=simState.drawnBars[v];
        const correctCount=bins[v]||0;

        // Student bar
        const bh=(studentCount/maxCount)*chartH;
        const by=chartB-bh;
        const isDragging=simState.draggingBar===v;
        const grad=c.createLinearGradient(0,by,0,chartB);
        grad.addColorStop(0,isDragging?'#1A8FA8':'#3498DB');
        grad.addColorStop(1,isDragging?'#0D6A82':'#2980B9');
        c.fillStyle=grad;
        c.beginPath(); c.roundRect(bx,by,bw,bh+1,[8,8,0,0]); c.fill();
        if(isDragging){c.strokeStyle='#FFD700';c.lineWidth=3;c.stroke();}

        // Drag handle
        c.fillStyle='rgba(255,255,255,0.9)'; c.beginPath(); c.roundRect(bx+bw/2-20,by-8,40,16,8); c.fill();
        c.fillStyle='#1A8FA8'; c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
        c.fillText('↕ '+studentCount,bx+bw/2,by+4);

        // Correct answer overlay
        if(simState.showAnswer) {
          const ch=(correctCount/maxCount)*chartH;
          const cy=chartB-ch;
          c.strokeStyle='#E74C3C'; c.lineWidth=3; c.setLineDash([6,3]);
          c.beginPath(); c.moveTo(bx,cy); c.lineTo(bx+bw,cy); c.stroke(); c.setLineDash([]);
          const match=studentCount===correctCount;
          c.fillStyle=match?'rgba(39,174,96,0.9)':'rgba(231,76,60,0.9)';
          c.beginPath(); c.arc(bx+bw/2,cy,10,0,Math.PI*2); c.fill();
          c.fillStyle='white'; c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
          c.fillText(match?'✓':'×',bx+bw/2,cy+4);
        }

        // X-axis label
        c.fillStyle='#1E4D2B'; c.font=`bold ${Math.round(h*0.036)}px Tajawal`; c.textAlign='center';
        c.fillText(v,bx+bw/2,chartB+20);
      });

      // Axes
      c.strokeStyle='#2C3A4A'; c.lineWidth=2; c.setLineDash([]);
      c.beginPath(); c.moveTo(chartL,chartT); c.lineTo(chartL,chartB); c.lineTo(chartR,chartB); c.stroke();

      // Axis labels
      c.fillStyle='#5A6A7A'; c.font=`${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
      c.fillText('عدد البتلات ←',w/2,chartB+40);
      c.save(); c.translate(18,h/2); c.rotate(-Math.PI/2);
      c.fillText('عدد الزهور',0,0); c.restore();

      if(simState.showAnswer) {
        c.fillStyle='rgba(231,76,60,0.9)'; c.font=`${Math.round(h*0.028)}px Tajawal`; c.textAlign='right';
        c.fillText('— الإجابة الصحيحة',chartR,chartT+16);
      }
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 10-2 TAB 2 — استقصاء التباين البشري (قياس حقيقي)
// ══════════════════════════════════════════════════════════
function simVariation2() {
  const traits = {
    height: { label:'الطول (cm)', color:'#3498DB', min:140, max:180, unit:'cm',
      question:'ما الوسط الحسابي؟', fact:'التباين في الطول ناتج عن جينات وبيئة (تغذية)' },
    foot:   { label:'مقاس الحذاء', color:'#E74C3C', min:34, max:46, unit:'',
      question:'ما المنوال (الأكثر تكراراً)؟', fact:'مقاس الحذاء يرتبط بالطول ارتباطاً طردياً' },
    hand:   { label:'محيط الرسغ (cm)', color:'#8E44AD', min:13, max:20, unit:'cm',
      question:'ما المدى = الأكبر - الأصغر؟', fact:'محيط الرسغ مثال على التباين المستمر' }
  };

  // 15 simulated students shown as avatars
  const omaniNames = [
    'أحمد','فاطمة','سالم','مريم','خالد',
    'عائشة','ناصر','خولة','سعيد','ميّ',
    'حمد','زينب','راشد','شيماء','عبدالله'
  ];
  const students = Array.from({length:15},(_,i) => ({
    id:i,
    name: omaniNames[i % omaniNames.length],
    height: 145+Math.round(Math.random()*28),
    foot: 36+Math.round(Math.random()*8),
    hand: Math.round((14+Math.random()*5)*10)/10,
    measured: false,
    x: 0.04+(i%5)*0.19,
    y: 0.15+Math.floor(i/5)*0.29
  }));

  simState = { t:0, trait:'height', students, selected:null, stats:null };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔬 استقصاء التباين في الإنسان</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.6;margin-top:4px">
        اضغط على كل طالب لقياسه، ثم احسب الإحصائيات
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">الصفة المقاسة:</div>
      <div style="display:flex;gap:4px;flex-direction:column">
        <button class="ctrl-btn on" id="bth" style="width:100%;background:rgba(52,152,219,0.25);border-color:rgba(52,152,219,0.6);color:#3498DB">📏 الطول</button>
        <button class="ctrl-btn" id="btf" style="width:100%;background:rgba(231,76,60,0.15);border-color:rgba(231,76,60,0.4);color:#E74C3C">👟 مقاس الحذاء</button>
        <button class="ctrl-btn" id="btw" style="width:100%;background:rgba(142,68,173,0.15);border-color:rgba(142,68,173,0.4);color:#8E44AD">⌚ محيط الرسغ</button>
      </div>
    </div>
    <button class="ctrl-btn" id="btnCalcStats" style="width:100%;margin-top:4px;background:rgba(39,174,96,0.2);border-color:rgba(39,174,96,0.5);color:#2DC653">🧮 احسب الإحصائيات</button>
    <button class="ctrl-btn" id="btnMeasureAll" style="width:100%;margin-top:4px;background:rgba(26,143,168,0.2);border-color:rgba(26,143,168,0.5);color:#1A8FA8">📋 قِس الجميع</button>
    <div class="info-box" id="v2Info">اضغط على الطلاب لقياس صفاتهم</div>
    <div class="q-box" id="v2Q">...</div>
  `);

  function setTrait(key) {
    simState.trait=key; simState.stats=null;
    simState.students.forEach(s=>s.measured=false);
    document.getElementById('v2Q').innerHTML=`<strong>❓ ص٦٣:</strong> ${traits[key].question}`;
    document.getElementById('v2Info').textContent='اضغط على الطلاب لقياسهم';
    ['bth','btf','btw'].forEach(id=>document.getElementById(id).classList.remove('on'));
    U9Sound.ping(440,0.2,0.15);
  }
  btn('bth',()=>{ document.getElementById('bth').classList.add('on'); setTrait('height'); });
  btn('btf',()=>{ document.getElementById('btf').classList.add('on'); setTrait('foot'); });
  btn('btw',()=>{ document.getElementById('btw').classList.add('on'); setTrait('hand'); });
  btn('btnMeasureAll',()=>{
    simState.students.forEach(s=>s.measured=true);
    document.getElementById('v2Info').textContent='✅ تم قياس جميع الطلاب — احسب الإحصائيات';
    U9Sound.ping(523,0.25,0.2);
  });
  btn('btnCalcStats',()=>{
    const measured=simState.students.filter(s=>s.measured);
    if(measured.length<3){ document.getElementById('v2Info').textContent='قِس على الأقل 3 طلاب أولاً!'; return; }
    const vals=measured.map(s=>s[simState.trait]);
    const mean=(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1);
    const sorted=[...vals].sort((a,b)=>a-b);
    const med=sorted[Math.floor(sorted.length/2)];
    const freq={}; vals.forEach(v=>{freq[v]=(freq[v]||0)+1;});
    const mode=Object.entries(freq).sort((a,b)=>b[1]-a[1])[0][0];
    const range=Math.max(...vals)-Math.min(...vals);
    simState.stats={mean,med,mode,range,vals,min:Math.min(...vals),max:Math.max(...vals)};
    const tr=traits[simState.trait];
    document.getElementById('v2Info').innerHTML=`
      <strong style="color:${tr.color}">الإحصائيات (${measured.length} طلاب):</strong><br>
      الوسط: <strong>${mean}${tr.unit}</strong> | الوسيط: ${med} | المنوال: ${mode}<br>
      المدى: ${range} | الأصغر: ${Math.min(...vals)} | الأكبر: ${Math.max(...vals)}`;
    U9Sound.win();
  });

  document.getElementById('v2Q').innerHTML=`<strong>❓ ص٦٣:</strong> ${traits['height'].question}`;

  const canvas=document.getElementById('simCanvas');
  canvas.onclick=function(e){
    const rect=canvas.getBoundingClientRect();
    const mx=(e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX-rect.left, my=(e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientY-rect.top;
    const w=canvas.width,h=canvas.height;
    simState.students.forEach(s=>{
      if(Math.hypot(mx-s.x*w, my-s.y*h)<22){
        s.measured=true; simState.selected=s.id;
        const tr=traits[simState.trait];
        const val=s[simState.trait];
        document.getElementById('v2Info').innerHTML=`${s.name}: <strong style="color:${tr.color}">${val}${tr.unit}</strong> (${tr.label})`;
        U9Sound.ping(300+val*5,0.2,0.15);
        setTimeout(()=>{simState.selected=null;},500);
      }
    });
  };

  function draw(){
    if(currentSim!=='variation'||currentTab!==1) return;
    const c=ctx(),w=W(),h=H(); simState.t++;
    const t=simState.t;
    const tr=traits[simState.trait];

    const bg=c.createLinearGradient(0,0,w,h);
    bg.addColorStop(0,'#F8F0FF'); bg.addColorStop(1,'#EDF7FF');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    if(!simState.stats) {
      // Student grid view
      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign='center';
      c.fillText('اضغط على كل طالب لقياس '+tr.label,w/2,28);

      simState.students.forEach(s=>{
        const sx=s.x*w, sy=s.y*h;
        const sel=simState.selected===s.id;
        const val=s[simState.trait];
        // Bar height visualization
        const barH=((val-tr.min)/(tr.max-tr.min))*h*0.17+h*0.04;
        if(s.measured) {
          c.fillStyle=tr.color+'44';
          c.beginPath(); c.roundRect(sx-14,sy-barH+8,28,barH,[4,4,0,0]); c.fill();
          c.strokeStyle=tr.color+'88'; c.lineWidth=1.5; c.stroke();
        }
        // Avatar + name (stacked vertically: emoji then name then value)
        const pulse=sel?Math.sin(t*0.25)*5:0;
        const emojis=['👦','👧','🧒'];
        const emojiSize=Math.round(h*0.075);
        const nameSize=Math.round(h*0.022);
        const valueSize=Math.round(h*0.028);
        const emojiY=sy+4+pulse;
        const nameY=emojiY+Math.max(26,Math.round(emojiSize*0.72));
        const valueBoxY=nameY+Math.max(18,Math.round(nameSize*1.7));

        c.font=`${emojiSize}px serif`;
        c.textAlign='center';
        c.textBaseline='middle';
        c.fillStyle='rgba(0,0,0,0.92)';
        c.fillText(emojis[s.id%3],sx,emojiY);

        // Name label (clearly below the emoji)
        c.textBaseline='top';
        c.fillStyle='rgba(30,45,61,0.9)';
        c.font=`bold ${nameSize}px Tajawal`;
        c.fillText(s.name,sx,nameY);

        // Measured value pill (below the name, avoids overlap)
        if(s.measured){
          c.fillStyle=tr.color;
          c.beginPath(); c.roundRect(sx-18,valueBoxY,36,18,9); c.fill();
          c.fillStyle='white';
          c.font=`bold ${valueSize}px Tajawal`;
          c.textAlign='center';
          c.textBaseline='middle';
          c.fillText(
            val + (simState.trait==='height'||simState.trait==='hand' ? '' : ''),
            sx,
            valueBoxY + 9
          );
        }
        if(sel){
          c.strokeStyle=tr.color; c.lineWidth=3;
          c.beginPath(); c.arc(sx,sy-2,26,0,Math.PI*2); c.stroke();
        }
      });

      const measCount=simState.students.filter(s=>s.measured).length;
      const measTxt = `تم قياس ${measCount}/15 طالباً`;
      const measFont = Math.round(h*0.034);
      c.save();
      c.font = `bold ${measFont}px Tajawal`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      const padX = 16, pillH = 30;
      const pillW = Math.ceil(c.measureText(measTxt).width) + padX*2;
      const pillX = w/2 - pillW/2;
      const pillY = h - 34;
      c.shadowColor = 'rgba(0,0,0,0.25)';
      c.shadowBlur = 8;
      c.fillStyle = 'rgba(0,0,0,0.72)';
      c.beginPath(); c.roundRect(pillX, pillY, pillW, pillH, 14); c.fill();
      c.shadowBlur = 0;
      c.strokeStyle = 'rgba(255,255,255,0.18)';
      c.lineWidth = 1.2;
      c.beginPath(); c.roundRect(pillX, pillY, pillW, pillH, 14); c.stroke();
      c.fillStyle = 'white';
      c.fillText(measTxt, w/2, pillY + pillH/2 + 1);
      c.restore();

    } else {
      // Stats + distribution chart
      const s=simState.stats;
      const chartL=w*0.1, chartR=w*0.88, chartT=h*0.35, chartB=h*0.85;
      const chartH2=chartB-chartT;

      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.042)}px Tajawal`; c.textAlign='center';
      c.fillText('توزيع '+tr.label+' للطلاب',w/2,28);

      // Stat cards
      const cards=[
        {label:'الوسط الحسابي',val:s.mean+tr.unit,col:'#3498DB'},
        {label:'الوسيط',val:s.med+tr.unit,col:'#27AE60'},
        {label:'المنوال',val:s.mode+tr.unit,col:'#8E44AD'},
        {label:'المدى',val:s.range+tr.unit,col:'#E74C3C'}
      ];
      const cardW=(w-40)/4;
      cards.forEach((card,i)=>{
        const cx2=20+i*cardW+cardW/2;
        c.fillStyle=card.col; c.beginPath(); c.roundRect(20+i*cardW,40,cardW-8,62,10); c.fill();
        c.fillStyle='white'; c.font=`bold ${Math.round(h*0.045)}px Tajawal`; c.textAlign='center';
        c.fillText(card.val,cx2,78);
        c.font=`${Math.round(h*0.025)}px Tajawal`;
        c.fillText(card.label,cx2,93);
      });

      // Distribution chart (dot plot)
      const freq={};
      s.vals.forEach(v=>{freq[v]=(freq[v]||0)+1;});
      const uVals=Object.keys(freq).map(Number).sort((a,b)=>a-b);
      const maxF=Math.max(...Object.values(freq));
      const barW2=(chartR-chartL)/uVals.length;

      // Bars
      uVals.forEach((v,i)=>{
        const f=freq[v];
        const bh=(f/maxF)*chartH2*0.9;
        const bx=chartL+i*barW2+barW2*0.1;
        const bw2=barW2*0.8;
        const by=chartB-bh;
        const grad=c.createLinearGradient(0,by,0,chartB);
        grad.addColorStop(0,tr.color);
        grad.addColorStop(1,tr.color+'88');
        c.fillStyle=grad; c.beginPath(); c.roundRect(bx,by,bw2,bh,[6,6,0,0]); c.fill();
        c.fillStyle=tr.color+'44'; c.strokeStyle=tr.color; c.lineWidth=1.5; c.stroke();
        c.fillStyle='white'; c.font=`bold ${Math.round(h*0.034)}px Tajawal`; c.textAlign='center';
        if(f>0) c.fillText(f,bx+bw2/2,by-5);
        c.fillStyle='#1E2D3D'; c.font=`${Math.round(h*0.028)}px Tajawal`;
        c.fillText(v,bx+bw2/2,chartB+18);
      });

      // Mean line
      const mScale=(s.mean-s.min)/(s.max-s.min);
      const validVals=uVals.filter(v=>v>=s.min&&v<=s.max);
      if(validVals.length>0){
        const nearestIdx=uVals.reduce((bi,v,i)=>Math.abs(v-s.mean)<Math.abs(uVals[bi]-s.mean)?i:bi,0);
        const mx2=chartL+nearestIdx*barW2+barW2/2;
        c.strokeStyle='#E74C3C'; c.lineWidth=2.5; c.setLineDash([5,3]);
        c.beginPath(); c.moveTo(mx2,chartT); c.lineTo(mx2,chartB); c.stroke(); c.setLineDash([]);
        c.fillStyle='rgba(231,76,60,0.9)'; c.beginPath(); c.roundRect(mx2-30,chartT-20,60,18,9); c.fill();
        c.fillStyle='white'; c.font=`bold ${Math.round(h*0.025)}px Tajawal`; c.textAlign='center';
        c.fillText('وسط: '+s.mean,mx2,chartT-7);
      }

      c.strokeStyle='#2C3A4A'; c.lineWidth=2; c.setLineDash([]);
      c.beginPath(); c.moveTo(chartL,chartT); c.lineTo(chartL,chartB); c.lineTo(chartR,chartB); c.stroke();

      c.fillStyle='#5A6A7A'; c.font=`${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
      c.fillText(tr.label,w/2,h-8);
      c.save(); c.translate(16,h*0.6); c.rotate(-Math.PI/2);
      c.fillText('عدد الطلاب',0,0); c.restore();

      c.fillStyle='rgba(100,100,100,0.5)'; c.font=`italic ${Math.round(h*0.025)}px Tajawal`; c.textAlign='center';
      c.fillText(tr.fact,w/2,chartB+32);
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 10-4 TAB 1 — مملكة النباتات (مقارنة تفاعلية)
// ══════════════════════════════════════════════════════════
function simPlantClass1() {
  const groups = [
    { id:'moss', name:'الحزازيّات', color:'#5D8A3C', bg:'#E8F5E9',
      emoji:'🌿', scene:'أرض رطبة',
      traits:['نباتات صغيرة جداً','تعيش في أماكن مبللة','تتكاثر بالأبواغ (Spores)','لا أزهار ولا بذور','لها أوراق رقيقة'],
      size:'صغيرة جداً', repro:'أبواغ', flowers:'لا', seeds:'لا', textbook:'ص٦٦'
    },
    { id:'fern', name:'السرخسيّات', color:'#27AE60', bg:'#F1FFF5',
      emoji:'🌱', scene:'ظل وشعاع',
      traits:['أوراقها تُسمّى الخوص (Fronds)','الأبواغ على ظهر الخوص','تعيش في الظل الرطب','أكبر من الحزازيّات','لا أزهار حقيقية'],
      size:'متوسطة', repro:'أبواغ', flowers:'لا', seeds:'لا', textbook:'ص٦٦'
    },
    { id:'conifer', name:'المخروطيّات', color:'#1A8FA8', bg:'#E3F8FF',
      emoji:'🌲', scene:'جبال باردة',
      traits:['أوراق إبريّة صلبة (Needles)','البذور في مخروطات (Cones)','أشجار كبيرة دائمة الخضرة','تتكاثر بالبذور','لا أزهار حقيقية'],
      size:'كبيرة جداً', repro:'بذور', flowers:'لا', seeds:'نعم', textbook:'ص٦٧'
    },
    { id:'flower', name:'النباتات الزهريّة', color:'#E74C3C', bg:'#FFF0F0',
      emoji:'🌸', scene:'حقول ملونة',
      traits:['تنتج أزهاراً جميلة','البذور داخل الأزهار والثمار','الأكثر تنوعاً','تشمل معظم النباتات المعروفة','تعيش في بيئات متعددة'],
      size:'متفاوتة', repro:'بذور في ثمار', flowers:'نعم', seeds:'نعم', textbook:'ص٦٧'
    }
  ];

  simState = { t:0, selected:null, compareMode:false, checklist:{} };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌿 مملكة النباتات</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px">
      ${groups.map(g=>`<button class="ctrl-btn" id="bp_${g.id}" 
        style="background:${g.color}22;border-color:${g.color}55;color:${g.color};font-size:13px;text-align:center;padding:8px 4px"
        onclick="(function(id){ if(simState.selected===id){simState.selected=null;document.getElementById('pInfo').textContent='اضغط على مجموعة لمعرفة خصائصها';}else{simState.selected=id;simState.compareMode=false;U9Sound.ping(440,0.12,0.1);} })('${g.id}')">
        ${g.emoji}<br><strong>${g.name}</strong>
      </button>`).join('')}
    </div>
    <button class="ctrl-btn" id="bCompare" style="width:100%;margin-bottom:4px;background:rgba(52,152,219,0.2);border-color:rgba(52,152,219,0.5);color:#3498DB">📊 مقارنة المجموعات</button>
    <div class="info-box" id="pInfo">اضغط على مجموعة لمعرفة خصائصها</div>
    <div class="q-box"><strong>❓ أسئلة الكتاب (ص٦٧):</strong><br>١- ما الفرق بين المخروطيّات والزهريّات في طريقة التكاثر؟<br>٢- اذكر مثالاً على كلٍّ منهما.
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- الزهريّات تُنتج بذوراً داخل ثمار، المخروطيّات تُنتج بذوراً مكشوفة في مخاريط.<br>٢- زهريّات: التفاح / الورد. مخروطيّات: الصنوبر / التنوب.
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- حزازيّات: أبواغ صغيرة رطبة. سرخسيّات: خوص وأبواغ على ظهرها. مخروطيّات: إبر ومخاريط. زهريّات: أزهار وثمار.<br>٢- البذور أكثر حمايةً وقدرةً على الانتشار من الأبواغ.</div>
  </div>
  </div>
  `);

  btn('bCompare',()=>{
    simState.compareMode=true; simState.selected=null;
    document.getElementById('pInfo').textContent='مقارنة جميع المجموعات جنباً إلى جنب';
    U9Sound.ping(523,0.2,0.18);
  });

  function draw(){
    if(currentSim!=='plantclass'||currentTab!==0) return;
    const c=ctx(),w=W(),h=H(); simState.t++;
    const t=simState.t;

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#E8F8E8'); bg.addColorStop(1,'#C8E6C9');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    if(simState.compareMode) {
      // Side-by-side comparison table
      c.fillStyle='#1E4D2B'; c.font=`bold ${Math.round(h*0.042)}px Tajawal`; c.textAlign='center';
      c.fillText('مقارنة مجموعات النباتات الأربع',w/2,30);

      const rows = [
        {label:'الحجم', key:'size'},
        {label:'التكاثر', key:'repro'},
        {label:'أزهار', key:'flowers'},
        {label:'بذور', key:'seeds'}
      ];
      const colW=w/5;
      const rowH=(h-70)/5;

      // Header
      c.fillStyle='rgba(30,77,43,0.85)'; c.beginPath(); c.roundRect(10,50,w-20,rowH,8); c.fill();
      c.fillStyle='white'; c.font=`bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
      c.fillText('الصفة',colW*0.5,50+rowH*0.65);
      groups.forEach((g,i)=>{
        c.fillText(g.emoji+' '+g.name,colW*(i+1.5),50+rowH*0.65);
      });

      rows.forEach((row,ri)=>{
        const ry=50+(ri+1)*rowH;
        c.fillStyle=ri%2===0?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.4)';
        c.beginPath(); c.roundRect(10,ry,w-20,rowH,4); c.fill();
        c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
        c.fillText(row.label,colW*0.5,ry+rowH*0.65);
        groups.forEach((g,i)=>{
          const val=g[row.key];
          const isGood=val==='نعم'||val==='أبواغ'||val==='بذور'||val==='بذور في ثمار';
          c.fillStyle=val==='نعم'?'#27AE60':val==='لا'?'#E74C3C':g.color;
          c.font=`${Math.round(h*0.028)}px Tajawal`;
          const txt=val.length>6?val.substring(0,6)+'…':val;
          c.fillText(txt,colW*(i+1.5),ry+rowH*0.65);
        });
      });

    } else if(simState.selected) {
      const g=groups.find(x=>x.id===simState.selected);
      const bob=Math.sin(t*0.06)*4;

      // Scene background
      c.fillStyle=g.bg; c.fillRect(0,0,w,h);

      // Big emoji
      c.font=`${Math.round(h*0.18)}px serif`; c.textAlign='center';
      c.fillText(g.emoji,w*0.22,h*0.48+bob);

      // ── Info panel ────────────────────────────────────
      const _lh = Math.round(h*0.046);
      const _pad = 14;
      const _hdrH = _lh + 12;
      const _subH = Math.round(h*0.036);
      const _statsH = 48;
      const _ph = _hdrH + _subH + _pad + g.traits.length*_lh + _pad + _statsH + 8;
      const _pw = w*0.54;
      const _px = w*0.43;
      const _py = Math.max(6, Math.min(h*0.05, h - _ph - 6));

      // Card shadow + bg
      c.shadowColor='rgba(0,0,0,0.18)'; c.shadowBlur=18; c.shadowOffsetY=5;
      c.fillStyle='rgba(255,255,255,0.98)';
      c.beginPath(); c.roundRect(_px,_py,_pw,_ph,16); c.fill();
      c.shadowBlur=0; c.shadowOffsetY=0;
      c.strokeStyle=g.color; c.lineWidth=3; c.stroke();

      // Header strip
      c.fillStyle=g.color;
      c.beginPath(); c.roundRect(_px,_py,_pw,_hdrH,[16,16,0,0]); c.fill();
      c.fillStyle='white'; c.font=`bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign='center';
      c.fillText(g.emoji + '  ' + g.name, _px+_pw/2, _py+_hdrH-6);

      // Textbook sub-row
      const _exY = _py+_hdrH;
      c.fillStyle=g.color+'18'; c.fillRect(_px,_exY,_pw,_subH);
      c.fillStyle=g.color; c.font=`${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
      c.fillText('📖 الكتاب ' + g.textbook, _px+_pw/2, _exY+_subH-5);

      // Traits list
      const _listTop = _exY + _subH + _pad;
      g.traits.forEach((tr,ti)=>{
        const _ry = _listTop + ti*_lh;
        if(ti%2===1){ c.fillStyle='rgba(0,0,0,0.025)'; c.fillRect(_px,_ry,_pw,_lh); }
        // Bullet dot — right side (RTL)
        c.fillStyle=g.color+'BB';
        c.beginPath(); c.arc(_px+_pw-14, _ry+_lh*0.5, 4.5, 0, Math.PI*2); c.fill();
        // Text clipped
        c.fillStyle='#1E2D3D'; c.font=`${Math.round(h*0.027)}px Tajawal`; c.textAlign='right';
        c.save(); c.beginPath(); c.rect(_px+6, _ry, _pw-26, _lh); c.clip();
        c.fillText(tr, _px+_pw-22, _ry+_lh*0.72);
        c.restore();
      });

      // Stat badges
      const _statsY = _listTop + g.traits.length*_lh + 8;
      const _stats=[{l:'الحجم',v:g.size},{l:'التكاثر',v:g.repro},{l:'أزهار',v:g.flowers},{l:'بذور',v:g.seeds}];
      _stats.forEach((st,i)=>{
        const _bx=_px+8+i*(_pw-16)/4;
        const _bc=st.v==='نعم'?'rgba(39,174,96,0.85)':st.v==='لا'?'rgba(231,76,60,0.75)':g.color+'99';
        c.fillStyle=_bc; c.beginPath(); c.roundRect(_bx,_statsY,_pw/4-6,_statsH-4,8); c.fill();
        c.fillStyle='white'; c.font=`bold ${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
        c.fillText(st.l, _bx+(_pw/4-6)/2, _statsY+16);
        c.font=`${Math.round(h*0.022)}px Tajawal`;
        const _sv=st.v.length>6?st.v.substring(0,5)+'…':st.v;
        c.fillText(_sv, _bx+(_pw/4-6)/2, _statsY+32);
      });

      document.getElementById('pInfo').innerHTML=`<strong style="color:${g.color}">${g.name}</strong>: ${g.traits[0]}`;

    } else {
      // Default: 4 دوائر قابلة للضغط
      c.fillStyle='rgba(30,77,43,0.7)'; c.font=`bold ${Math.round(h*0.042)}px Tajawal`; c.textAlign='center';
      c.fillText('اضغط على مجموعة نباتية لاستكشافها',w/2,30);

      groups.forEach((g,i)=>{
        const gx=(i%2)*w/2+w/4;
        const gy=Math.floor(i/2)*h/2+h/4;
        const bob=Math.sin(t*0.06+i*1.5)*4;
        const r=Math.min(w,h)*0.13;

        c.fillStyle=g.bg+'CC'; c.beginPath(); c.arc(gx,gy+bob,r,0,Math.PI*2); c.fill();
        c.strokeStyle=g.color; c.lineWidth=3; c.stroke();
        c.font=`${Math.round(h*0.1)}px serif`; c.textAlign='center';
        c.fillText(g.emoji,gx,gy+bob+12);
        c.fillStyle=g.color; c.font=`bold ${Math.round(h*0.035)}px Tajawal`;
        c.fillText(g.name,gx,gy+r+bob+24);
        c.fillStyle='#5A6A7A'; c.font=`${Math.round(h*0.025)}px Tajawal`;
        c.fillText(g.scene,gx,gy+r+bob+42);
      });

      // تسجيل onclick على الكانفاس
      const cv2=document.getElementById('simCanvas');
      cv2.onclick=function(ev){
        const rect=cv2.getBoundingClientRect();
        const mx=(ev.clientX-rect.left)*cv2.width/rect.width;
        const my=(ev.clientY-rect.top)*cv2.height/rect.height;
        groups.forEach((g,i)=>{
          const gx2=(i%2)*cv2.width/2+cv2.width/4;
          const gy2=Math.floor(i/2)*cv2.height/2+cv2.height/4;
          const r2=Math.min(cv2.width,cv2.height)*0.13;
          if(Math.hypot(mx-gx2,my-gy2)<r2+10){
            if(simState.selected===g.id){
              simState.selected=null; // ضغطة ثانية → ارجع
              document.getElementById('pInfo').textContent='اضغط على مجموعة لمعرفة خصائصها';
            } else {
              simState.selected=g.id; simState.compareMode=false;
              U9Sound.ping(440,0.12,0.1);
              document.getElementById('pInfo').innerHTML=`<strong style="color:${g.color}">${g.name}</strong>: ${g.traits[0]}`;
            }
            groups.forEach(g2=>{ const b=document.getElementById('bp_'+g2.id); if(b) b.style.background=g2.color+(simState.selected===g2.id?'44':'22'); });
          }
        });
      };
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 10-4 TAB 2 — فرز النباتات (drag & drop على شاشة)
// ══════════════════════════════════════════════════════════
function simPlantClass2() {
  const groupDefs = {
    moss:    {name:'حزازيّات', color:'#5D8A3C', x:0.12, y:0.8},
    fern:    {name:'سرخسيّات', color:'#27AE60', x:0.37, y:0.8},
    conifer: {name:'مخروطيّات', color:'#1A8FA8', x:0.62, y:0.8},
    flower:  {name:'زهريّات',   color:'#E74C3C', x:0.87, y:0.8}
  };

  const plantCards = [
    {id:0,name:'الطحلب',    group:'moss',    emoji:'🟢',hint:'صغير جداً في أماكن رطبة'},
    {id:1,name:'السرخس',    group:'fern',    emoji:'🌿',hint:'أوراقه خوص، الأبواغ على ظهرها'},
    {id:2,name:'شجرة الصنوبر',group:'conifer',emoji:'🌲',hint:'إبر وثمار مخروطية'},
    {id:3,name:'الورد',     group:'flower',  emoji:'🌹',hint:'ينتج أزهاراً جميلة'},
    {id:4,name:'الحزاز',    group:'moss',    emoji:'🟩',hint:'نبات صغير أخضر رطب'},
    {id:5,name:'نبات الفراولة',group:'flower',emoji:'🍓',hint:'ينتج أزهاراً وثماراً'},
    {id:6,name:'شجرة الأرز',group:'conifer', emoji:'🎄',hint:'شجرة كبيرة إبرية'},
    {id:7,name:'سرخس الشجر',group:'fern',   emoji:'🌴',hint:'سرخس كبير نادر'}
  ];

  // Scatter cards on the canvas
  const cards = plantCards.map((p,i) => ({
    ...p,
    cx: 0.1+(i%4)*0.22, cy:0.12+(Math.floor(i/4))*0.28,
    dragging:false, placed:null, animY:0
  }));

  simState = { t:0, cards, score:0, total:plantCards.length, dragging:null, dragX:0, dragY:0 };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🎮 فرز النباتات — اسحب للتصنيف!</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.6;margin-top:4px">
        اسحب كل بطاقة نبات إلى مجموعتها الصحيحة في الأسفل
      </div>
    </div>
    <div id="p2Score" style="text-align:center;font-size:28px;font-weight:800;color:#27AE60;margin:10px 0">✅ 0 / 8</div>
    <button class="ctrl-btn" id="btnP2Reset" style="width:100%;background:rgba(231,76,60,0.15);border-color:rgba(231,76,60,0.4);color:#E74C3C">🔄 إعادة</button>
    <div class="info-box" id="p2Info">اسحب النبات إلى مجموعته الصحيحة!</div>
    <div class="q-box">
      <strong>❓ أسئلة الكتاب (ص٦٧):</strong><br>
      ١- صنّف النباتات الأربع المجموعات الصحيحة.<br>
      ٢- ما الفرق بين النباتات التي تُنتج بذوراً وتلك التي تُنتج أبواغاً؟
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- حزازيّات: أبواغ صغيرة رطبة. سرخسيّات: خوص وأبواغ على ظهرها. مخروطيّات: إبر ومخاريط. زهريّات: أزهار وثمار.<br>٢- البذور أكثر حمايةً وقدرةً على الانتشار من الأبواغ.</div>
  </div>
  `);

  btn('btnP2Reset',()=>{
    simState.cards.forEach(c=>{c.placed=null;c.cx=plantCards[c.id].cx||c.cx;c.cy=plantCards[c.id].cy||c.cy;});
    simState.score=0; document.getElementById('p2Score').textContent='✅ 0 / 8';
    document.getElementById('p2Info').textContent='اسحب النبات إلى مجموعته الصحيحة!';
    U9Sound.ping(330,0.2,0.15);
  });

  const canvas=document.getElementById('simCanvas');
  canvas.onmousedown=canvas.ontouchstart=function(e){
    e.preventDefault();
    const rect=canvas.getBoundingClientRect();
    const mx=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX)-rect.left;
    const my=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientY)-rect.top;
    const w=canvas.width,h=canvas.height;
    for(let i=simState.cards.length-1;i>=0;i--){
      const cd=simState.cards[i];
      if(cd.placed) continue;
      const cx=cd.cx*w,cy=cd.cy*h;
      if(Math.abs(mx-cx)<45&&Math.abs(my-cy)<28){
        simState.dragging=cd.id; simState.dragX=mx; simState.dragY=my;
        break;
      }
    }
  };
  canvas.onmousemove=canvas.ontouchmove=function(e){
    e.preventDefault();
    if(simState.dragging===null) return;
    const rect=canvas.getBoundingClientRect();
    simState.dragX=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX)-rect.left;
    simState.dragY=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientY)-rect.top;
  };
  canvas.onmouseup=canvas.ontouchend=function(e){
    if(simState.dragging===null) return;
    const w=canvas.width,h=canvas.height;
    const cd=simState.cards[simState.dragging];
    let dropped=false;
    Object.entries(groupDefs).forEach(([gid,gd])=>{
      const gx=gd.x*w, gy=gd.y*h;
      if(Math.hypot(simState.dragX-gx,simState.dragY-gy)<55){
        if(gid===cd.group){
          cd.placed=gid; simState.score++;
          document.getElementById('p2Score').textContent=`✅ ${simState.score} / 8`;
          document.getElementById('p2Info').innerHTML=`<span style="color:#27AE60">✅ صحيح! ${cd.name} من ${gd.name}</span>`;
          U9Sound.win();
          if(simState.score===8){ setTimeout(()=>{document.getElementById('p2Info').innerHTML='<span style="color:#27AE60">🎉 ممتاز! صنَّفت جميع النباتات!</span>';},300); }
        } else {
          document.getElementById('p2Info').innerHTML=`<span style="color:#E74C3C">❌ ليس كذلك. ${cd.hint}</span>`;
          U9Sound.ping(220,0.3,0.25);
          cd.cx=plantCards[cd.id].cx||cd.cx; cd.cy=plantCards[cd.id].cy||cd.cy;
        }
        dropped=true;
      }
    });
    if(!dropped){ cd.cx=simState.dragX/w; cd.cy=simState.dragY/h; }
    simState.dragging=null;
  };

  function draw(){
    if(currentSim!=='plantclass'||currentTab!==1) return;
    const c=ctx(),w=W(),h=H(); simState.t++;
    const t=simState.t;

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F1F8E9'); bg.addColorStop(1,'#DCEDC8');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    c.fillStyle='#1E4D2B'; c.font=`bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign='center';
    c.fillText('اسحب كل نبات إلى مجموعته الصحيحة',w/2,26);

    // Drop zones at bottom
    Object.entries(groupDefs).forEach(([gid,gd])=>{
      const gx=gd.x*w, gy=gd.y*h;
      const placed=simState.cards.filter(cd=>cd.placed===gid);
      const col=gd.color;
      c.fillStyle=col+'22'; c.beginPath(); c.arc(gx,gy,50,0,Math.PI*2); c.fill();
      c.strokeStyle=col; c.lineWidth=2.5; c.stroke();
      c.fillStyle=col; c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
      c.fillText(gd.name,gx,gy+68);

      // Show placed cards in zone
      placed.forEach((p,pi)=>{
        const px=gx+(pi-placed.length/2+0.5)*32;
        c.font=`${Math.round(h*0.042)}px serif`; c.fillText(p.emoji,px,gy-10);
      });
    });

    // Plant cards (unplaced)
    simState.cards.forEach(cd=>{
      if(cd.placed) return;
      const isDrag=simState.dragging===cd.id;
      const cx=isDrag?simState.dragX:cd.cx*w;
      const cy=isDrag?simState.dragY:cd.cy*h;
      const bob=isDrag?0:Math.sin(t*0.06+cd.id*0.8)*3;

      c.fillStyle=isDrag?'rgba(255,255,255,0.98)':'rgba(255,255,255,0.88)';
      c.beginPath(); c.roundRect(cx-42,cy-24+bob,84,48,12); c.fill();
      c.strokeStyle=isDrag?'#1A8FA8':'rgba(0,0,0,0.15)';
      c.lineWidth=isDrag?3:1.5; c.stroke();

      c.font=`${Math.round(h*0.05)}px serif`; c.textAlign='center';
      c.fillText(cd.emoji,cx,cy+bob);
      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
      c.fillText(cd.name,cx,cy+22+bob);
    });

    // Progress
    const done=simState.cards.filter(cd=>cd.placed).length;
    if(done===8){
      c.fillStyle='rgba(39,174,96,0.9)'; c.beginPath(); c.roundRect(w/2-80,h*0.42,160,40,20); c.fill();
      c.fillStyle='white'; c.font=`bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign='center';
      c.fillText('🎉 أحسنت! 8/8',w/2,h*0.42+26);
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 10-5 TAB 1 — الفقاريّات الخمس (PhET explorer)
// ══════════════════════════════════════════════════════════
function simVertebrates1() {
  const classes = [
    { id:'fish',      name:'الأسماك',      color:'#3498DB', emoji:'🐟', habitat:'ماء',
      traits:['زعانف للسباحة','تتنفس بالخياشيم (Gills)','جسم مكسو بالقشور','تضع البيض في الماء','دم بارد'],
      example:'السردين، سمك القرش', x:0.1, y:0.45 },
    { id:'amphibian', name:'البرمائيّات',  color:'#27AE60', emoji:'🐸', habitat:'ماء + يابسة',
      traits:['جلد أملس رطب بلا قشور','تتنفس بالخياشيم (صغاراً) ثم بالرئتين','تضع البيض في الماء','تعيش في الماء واليابسة','دم بارد'],
      example:'الضفدع، السلمندر', x:0.29, y:0.42 },
    { id:'reptile',   name:'الزواحف',     color:'#E67E22', emoji:'🦎', habitat:'يابسة / ماء',
      traits:['جلد حرشفي جاف','تتنفس بالرئتين','تضع البيض على اليابسة','أربعة أرجل (أو لا أرجل)','دم بارد'],
      example:'الثعبان، التمساح', x:0.5, y:0.4 },
    { id:'bird',      name:'الطيور',       color:'#9B59B6', emoji:'🦅', habitat:'هواء + يابسة',
      traits:['ريش يغطي الجسم','أجنحة للطيران','تتنفس بالرئتين','تضع البيض على اليابسة','دم حار'],
      example:'النسر، البطريق', x:0.71, y:0.38 },
    { id:'mammal',    name:'الثدييّات',   color:'#E74C3C', emoji:'🦁', habitat:'متنوع',
      traits:['شعر يغطي الجسم','تلد أطفالاً أحياء','الأطفال يرضعون حليب الأم','تتنفس بالرئتين','دم حار'],
      example:'الأسد، الحوت', x:0.89, y:0.43 }
  ];

  simState = { t:0, selected:null, quizMode:false, quizQ:null, quizScore:0, quizTotal:0 };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🐾 الفقاريّات الخمس</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:3px;margin-bottom:6px">
      ${classes.map(cl=>`<button class="ctrl-btn" id="bvc_${cl.id}"
        style="width:100%;background:${cl.color}22;border-color:${cl.color}55;color:${cl.color};text-align:right;font-size:13px"
        onclick="(function(){simState.selected='${cl.id}';simState.quizMode=false;U9Sound.ping(440,0.18,0.12);})()">
        ${cl.emoji} ${cl.name} — ${cl.example}
      </button>`).join('')}
    </div>
    <button class="ctrl-btn" id="bvQuiz" style="width:100%;background:rgba(155,89,182,0.2);border-color:rgba(155,89,182,0.5);color:#9B59B6">🎯 اختبر نفسك!</button>
    <div class="info-box" id="vertInfo">اضغط على فئة لمعرفة خصائصها</div>
    <div class="q-box"><strong>❓ أسئلة الكتاب (ص٦٩):</strong><br>١- قارن بين الأسماك والبرمائيّات في طريقة التنفس.<br>٢- ما الخاصية المشتركة بين جميع الفقاريّات؟
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- الأسماك تتنفس بالخياشيم، البرمائيّات تتنفس بالرئتين والجلد.<br>٢- جميعها تمتلك عموداً فقرياً.</div>
  </div>
  `);

  const quizQs = classes.map(cl=>({
    q:`أيّ من هذه خاصيّة ${cl.name}؟`,
    correct:cl.traits[0], wrong:classes.filter(x=>x.id!==cl.id).map(x=>x.traits[0]).slice(0,3),
    classId:cl.id
  }));

  btn('bvQuiz',()=>{
    simState.quizMode=true; simState.selected=null; simState.quizScore=0; simState.quizTotal=0;
    simState.quizQ=[...quizQs].sort(()=>Math.random()-0.5)[0];
    simState.quizAnswered=false;
    const opts=[simState.quizQ.correct,...simState.quizQ.wrong].sort(()=>Math.random()-0.5);
    simState.quizOpts=opts;
    document.getElementById('vertInfo').textContent='اختر الإجابة الصحيحة';
    U9Sound.ping(440,0.2,0.15);
  });

  function draw(){
    if(currentSim!=='vertebrates'||currentTab!==0) return;
    const c=ctx(),w=W(),h=H(); simState.t++;
    const t=simState.t;

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#E3F2FD'); bg.addColorStop(1,'#B3E5FC');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Habitat zones
    c.fillStyle='#64B5F6'; c.fillRect(0,h*0.65,w*0.35,h*0.35); // water
    c.fillStyle='#66BB6A'; c.fillRect(w*0.35,h*0.65,w*0.65,h*0.35); // land
    c.fillStyle='rgba(255,255,255,0.15)'; c.fillRect(0,0,w,h*0.25); // sky

    c.fillStyle='rgba(0,0,0,0.35)'; c.font=`${Math.round(h*0.025)}px Tajawal`; c.textAlign='center';
    c.fillText('بحر',w*0.18,h*0.95); c.fillText('يابسة',w*0.7,h*0.95);

    c.fillStyle='rgba(0,0,0,0.5)'; c.font=`bold ${Math.round(h*0.04)}px Tajawal`;
    c.fillText('الفقاريّات — اضغط على الحيوان',w/2,26);

    if(simState.quizMode && simState.quizQ) {
      const q=simState.quizQ;
      const cl=classes.find(x=>x.id===q.classId);
      const p=14; // padding

      // ── صندوق السؤال ──
      const qBoxH=Math.round(h*0.30);
      U9.rect(c,p,p,w-p*2,qBoxH,'rgba(0,0,0,0.50)','rgba(255,255,255,0.18)',14,1.5);

      // نص السؤال — يتكسر إلى سطرين تلقائياً
      c.fillStyle='white';
      c.font=`bold ${Math.round(h*0.038)}px Tajawal`;
      c.textAlign='center';
      // تقسيم السؤال
      const words=q.q.split(' ');
      let line1='',line2='';
      words.forEach(w2=>{ if((line1+w2).length<14) line1+=w2+' '; else line2+=w2+' '; });
      c.fillText(line1.trim(), w/2, p+Math.round(h*0.075));
      if(line2.trim()) c.fillText(line2.trim(), w/2, p+Math.round(h*0.118));

      // emoji الحيوان
      c.font=`${Math.round(h*0.10)}px serif`;
      c.fillText(cl.emoji, w/2, p+qBoxH-Math.round(h*0.04));

      // ── خيارات الإجابة (شبكة 2×2) ──
      const optGap=8;
      const optTop=qBoxH+p*2;
      const optW=(w-p*2-optGap)/2;
      const optH=Math.round((h-optTop-p*2-optGap)/2);

      simState.quizOpts.forEach((opt,i)=>{
        const col=i%2, row=Math.floor(i/2);
        const ox=p+col*(optW+optGap);
        const oy=optTop+row*(optH+optGap);
        const answered=simState.quizAnswered;
        const isCorrect=opt===q.correct;
        // خلفية الخيار واضحة
        let bgCol = answered
          ? (isCorrect ? '#27AE60' : simState.chosenOpt===opt ? '#E74C3C' : 'rgba(255,255,255,0.25)')
          : 'rgba(255,255,255,0.92)';
        c.shadowColor='rgba(0,0,0,0.12)'; c.shadowBlur=8;
        c.fillStyle=bgCol;
        c.beginPath();c.roundRect(ox,oy,optW,optH,14);c.fill();
        c.shadowBlur=0;
        c.strokeStyle=answered&&isCorrect?'#27AE60':answered&&simState.chosenOpt===opt?'#E74C3C':'rgba(100,100,200,0.25)';
        c.lineWidth=answered?3:1.5;c.stroke();

        // نص الخيار
        const fs=Math.max(13,Math.round(h*0.034));
        const textCol = answered
          ? (isCorrect ? '#fff' : simState.chosenOpt===opt ? '#fff' : 'rgba(30,45,61,0.45)')
          : '#1E2D3D';
        c.fillStyle=textCol;
        c.font=`bold ${fs}px Tajawal`;c.textAlign='center';
        // تقسيم إلى سطرين إذا لزم
        const words2=opt.split(' ');
        let ln1='',ln2='';
        words2.forEach(wd=>{ if((ln1+wd).length<=8) ln1+=wd+' '; else ln2+=wd+' '; });
        ln1=ln1.trim(); ln2=ln2.trim();
        if(ln2){
          c.fillText(ln1, ox+optW/2, oy+optH*0.42);
          c.fillText(ln2, ox+optW/2, oy+optH*0.68);
        } else {
          c.fillText(opt, ox+optW/2, oy+optH*0.57);
        }
        // أيقونة النتيجة
        if(answered){
          c.font=`${Math.round(optH*0.28)}px serif`;
          if(isCorrect) c.fillText('✅',ox+20,oy+Math.round(optH*0.32));
          else if(simState.chosenOpt===opt) c.fillText('❌',ox+20,oy+Math.round(optH*0.32));
        }
      });

      if(!simState.quizAnswered) {
        const canvas=document.getElementById('simCanvas');
        canvas.onclick=function(ev){
          const rect=canvas.getBoundingClientRect();
          const scaleX=w/rect.width, scaleY=h/rect.height;
          const mx=(ev.clientX-rect.left)*scaleX;
          const my=(ev.clientY-rect.top)*scaleY;
          // نفس حسابات الشبكة 2×2 الجديدة
          const p2=14;
          const qBoxH=Math.round(h*0.30);
          const optGap=8;
          const optTop=qBoxH+p2*2;
          const optW=(w-p2*2-optGap)/2;
          const optH=Math.round((h-optTop-p2*2-optGap)/2);
          simState.quizOpts.forEach((opt,i)=>{
            const col=i%2, row=Math.floor(i/2);
            const ox=p2+col*(optW+optGap);
            const oy=optTop+row*(optH+optGap);
            if(mx>=ox&&mx<=ox+optW&&my>=oy&&my<=oy+optH){
              simState.quizAnswered=true; simState.chosenOpt=opt;
              simState.quizTotal++;
              if(opt===q.correct){
                simState.quizScore++; U9Sound.win();
                document.getElementById('vertInfo').innerHTML=`<span style="color:#27AE60">✅ صحيح! (${simState.quizScore}/${simState.quizTotal})</span>`;
              } else {
                U9Sound.ping(220,0.3,0.25);
                document.getElementById('vertInfo').innerHTML=`<span style="color:#E74C3C">❌ الصحيح: ${q.correct}</span>`;
              }
              setTimeout(()=>{
                simState.quizQ=[...quizQs].sort(()=>Math.random()-0.5)[0];
                const opts=[simState.quizQ.correct,...simState.quizQ.wrong].sort(()=>Math.random()-0.5);
                simState.quizOpts=opts; simState.quizAnswered=false;
                document.getElementById('vertInfo').textContent='اختر الإجابة الصحيحة';
              },1500);
            }
          });
        };
      }

    } else {
      // Normal explorer view
      classes.forEach(cl=>{
        const gx=cl.x*w,gy=cl.y*h,sel=simState.selected===cl.id;
        const bob=Math.sin(t*0.07+cl.x*5)*4;

        if(sel){
          c.fillStyle=cl.color+'33'; c.beginPath(); c.arc(gx,gy+bob,36,0,Math.PI*2); c.fill();
          c.strokeStyle=cl.color; c.lineWidth=3; c.stroke();
        }

        c.font=`${Math.round(h*0.09)}px serif`; c.textAlign='center';
        c.fillText(cl.emoji,gx,gy+bob);

        c.fillStyle=sel?'rgba(255,255,255,0.95)':cl.color+'DD';
        c.beginPath(); c.roundRect(gx-44,gy+36+bob,88,20,10); c.fill();
        c.fillStyle=sel?cl.color:'white'; c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
        c.fillText(cl.name,gx,gy+50+bob);

        if(sel) {
          // Card dimensions — generous width, auto height
          const lh = Math.round(h*0.044);          // line height
          const pad = 12;
          const hdrH = lh + 10;                    // header (name only)
          const subH = lh - 4;                     // example row
          // Extra breathing room so last trait line never gets clipped
          const ph = hdrH + subH + pad + cl.traits.length * lh + pad + 12;
          const pw = Math.min(w*0.48, Math.max(w*0.32, 220));

          // Position: center on animal, open upward, clamp
          let bx = Math.max(pad, Math.min(gx - pw/2, w - pw - pad));
          let by = gy - ph - 18;
          if(by < pad) by = gy + 58;
          if(by + ph > h - pad) by = h - ph - pad;

          // Drop shadow
          c.shadowColor = 'rgba(0,0,0,0.22)';
          c.shadowBlur  = 20;
          c.shadowOffsetY = 5;

          // Card background
          c.fillStyle = 'rgba(255,255,255,0.98)';
          c.beginPath(); c.roundRect(bx, by, pw, ph, 14); c.fill();
          c.shadowBlur = 0; c.shadowOffsetY = 0;

          // Border
          c.strokeStyle = cl.color; c.lineWidth = 2.5;
          c.beginPath(); c.roundRect(bx, by, pw, ph, 14); c.stroke();

          // ── Header strip ──────────────────────────────
          c.fillStyle = cl.color;
          c.beginPath(); c.roundRect(bx, by, pw, hdrH, [14,14,0,0]); c.fill();

          c.fillStyle = 'white';
          c.font = `bold ${Math.round(h*0.033)}px Tajawal`;
          c.textAlign = 'center';
          c.fillText(cl.emoji + '  ' + cl.name, bx + pw/2, by + hdrH - 5);

          // ── Example row ───────────────────────────────
          const exY = by + hdrH;
          c.fillStyle = cl.color + '18';
          c.fillRect(bx, exY, pw, subH);
          c.fillStyle = cl.color;
          c.font = `${Math.round(h*0.023)}px Tajawal`;
          c.textAlign = 'center';
          c.fillText('📌 مثال: ' + cl.example, bx + pw/2, exY + subH - 3);

          // ── Traits list ───────────────────────────────
          const listTop = exY + subH + pad;
          cl.traits.forEach((tr, ti) => {
            const rowY = listTop + ti * lh;

            // Zebra stripe
            if (ti % 2 === 1) {
              c.fillStyle = 'rgba(0,0,0,0.025)';
              c.fillRect(bx, rowY, pw, lh);
            }

            // Bullet on the RIGHT side (RTL)
            const dotX = bx + pw - 14;
            const dotY = rowY + lh * 0.5;
            c.fillStyle = cl.color;
            c.beginPath(); c.arc(dotX, dotY, 4, 0, Math.PI*2); c.fill();

            // Text right-aligned, leaving room for bullet
            c.fillStyle = '#1E2D3D';
            c.font = `${Math.round(h*0.026)}px Tajawal`;
            c.textAlign = 'right';

            // Clip so text can't escape card
            c.save();
            c.beginPath();
            c.rect(bx + 6, rowY, pw - 26, lh + 2);
            c.clip();
            c.fillText(tr, bx + pw - 22, rowY + lh * 0.72);
            c.restore();
          });

          document.getElementById('vertInfo').innerHTML =
            `<strong style="color:${cl.color}">${cl.name}:</strong> ${cl.traits[0]}`;
        }
      });

      // Onclick for explorer
      const canvas=document.getElementById('simCanvas');
      canvas.onclick=function(ev){
        const rect=canvas.getBoundingClientRect();
        const mx=ev.clientX-rect.left,my=ev.clientY-rect.top;
        classes.forEach(cl=>{
          if(Math.hypot(mx-cl.x*w,my-cl.y*h)<38){
            simState.selected = simState.selected===cl.id ? null : cl.id;
            if(simState.selected) U9Sound.ping(440,0.12,0.1);
          }
        });
      };
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 10-5 TAB 2 — تصنيف الحيوان (سلسلة بطاقات)
// ══════════════════════════════════════════════════════════
function simVertebrates2() {
  const animals = [
    {name:'السلمون',   class:'fish',      emoji:'🐠',clue:'يعيش كل حياته في الماء ويتنفس بالخياشيم',   funFact:'يهاجر مئات الكيلومترات للتكاثر!'},
    {name:'الضفدع',   class:'amphibian', emoji:'🐸',clue:'يبدأ في الماء ثم ينتقل إلى اليابسة',         funFact:'يمكنه التنفس عبر جلده في الماء'},
    {name:'التمساح',  class:'reptile',   emoji:'🐊',clue:'جلده حرشفي ويضع البيض على اليابسة',          funFact:'يحمي أطفاله بفمه حتى الماء!'},
    {name:'النسر',    class:'bird',      emoji:'🦅',clue:'له أجنحة وريش ويرى بحدة شديدة',              funFact:'يمكنه رؤية الفريسة من 3 كم!'},
    {name:'الحوت',    class:'mammal',    emoji:'🐋',clue:'يعيش في الماء لكنه يتنفس هواءً',             funFact:'أكبر حيوان على وجه الأرض'},
    {name:'السلمندر',  class:'amphibian', emoji:'🦎',clue:'جلده رطب أملس يعيش قرب الماء',               funFact:'يستطيع إعادة نمو ذيله!'},
    {name:'الثعبان',  class:'reptile',   emoji:'🐍',clue:'جلده حرشفي وليس له أرجل',                   funFact:'يشم الهواء بلسانه'},
    {name:'الدلفين',  class:'mammal',    emoji:'🐬',clue:'يُرضع صغاره ويتنفس هواءً رغم عيشه بالبحر', funFact:'يتواصل بأصوات فريدة'}
  ];

  const clsDefs={fish:'أسماك🐟',amphibian:'برمائيّات🐸',reptile:'زواحف🦎',bird:'طيور🦅',mammal:'ثدييّات🦁'};
  const clsColors={fish:'#3498DB',amphibian:'#27AE60',reptile:'#E67E22',bird:'#9B59B6',mammal:'#E74C3C'};

  simState = {
    t:0, remaining:[...animals].sort(()=>Math.random()-0.5),
    current:null, score:0, total:animals.length,
    streak:0, fb:null, showFact:false
  };
  simState.current=simState.remaining.pop()||null;

  // expose globally before controls() renders buttons
  window.tryAnswerV2 = function(cls){ if(window._tryAnswerV2Fn) window._tryAnswerV2Fn(cls); };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🎯 صنِّف الحيوان!</div>
    </div>
    <div id="v2Score" style="text-align:center;font-size:26px;font-weight:800;color:#3498DB;margin:6px 0">النقاط: 0 🔥0</div>
    <button class="ctrl-btn" id="btnV2Retry" style="width:100%;margin-bottom:6px;background:rgba(26,143,168,0.18);border-color:rgba(26,143,168,0.45);color:#1A8FA8">🔄 إعادة المحاولة</button>
    <div class="ctrl-section">
      <div style="display:flex;flex-direction:column;gap:3px">
        ${Object.entries(clsDefs).map(([k,v])=>`<button class="ctrl-btn" id="bva_${k}"
          style="width:100%;background:${clsColors[k]}22;border-color:${clsColors[k]}55;color:${clsColors[k]}"
          onclick="tryAnswerV2('${k}')">${v}</button>`).join('')}
      </div>
    </div>
    <div class="info-box" id="v2Info">صنِّف الحيوان بناءً على وصفه!</div>
    <div class="q-box"><strong>💡 تذكّر:</strong><br>
      أسماك: خياشيم + قشور | برمائيّات: جلد رطب<br>
      زواحف: حراشف + بيض بر | طيور: ريش<br>
      ثدييّات: شعر + إرضاع
    </div>
  `);

  function resetV2(){
    simState.remaining=[...animals].sort(()=>Math.random()-0.5);
    simState.current=simState.remaining.pop()||null;
    simState.score=0; simState.streak=0; simState.fb=null;
    const sc=document.getElementById('v2Score');
    const info=document.getElementById('v2Info');
    if(sc) sc.textContent='النقاط: 0 🔥0';
    if(info) info.textContent='صنِّف الحيوان بناءً على وصفه!';
    U9Sound.ping(330,0.2,0.15);
  }
  btn('btnV2Retry', resetV2);

  window._tryAnswerV2Fn = function(cls){
    if(!simState.current||simState.fb!=null) return;
    const ok=simState.current.class===cls;
    simState.fb=ok;
    if(ok){
      simState.score++; simState.streak++; U9Sound.correct();
      document.getElementById('v2Score').textContent=`النقاط: ${simState.score} 🔥${simState.streak}`;
      U9Sound.win();
      document.getElementById('v2Info').innerHTML=`<span style="color:#27AE60">✅ صحيح! ${simState.streak>2?'🔥سلسلة '+simState.streak+'!':''}</span><br><em>${simState.current.funFact}</em>`;
    } else {
      simState.streak=0;
      U9Sound.wrong();
      document.getElementById('v2Info').innerHTML=`<span style="color:#E74C3C">❌ ${simState.current.clue}</span>`;
      document.getElementById('v2Score').textContent=`النقاط: ${simState.score} 🔥0`;
    }
    setTimeout(()=>{
      simState.current=simState.remaining.pop()||null;
      simState.fb=null;
      if(simState.current) document.getElementById('v2Info').textContent='صنِّف الحيوان!';
    },ok?1400:1800);
  };

  function draw(){
    if(currentSim!=='vertebrates'||currentTab!==1) return;
    const c=ctx(),w=W(),h=H(); simState.t++;
    const t=simState.t;
    const p=16;

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F3E5F5'); bg.addColorStop(1,'#E1F5FE');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // ── انتهاء اللعبة ──
    if(!simState.current){
      const perfect=simState.score===simState.total;
      const iconSize=Math.round(h*0.18);
      c.font=`${iconSize}px serif`; c.textAlign='center';
      c.fillText(perfect?'🏆':'🎉',w/2,h*0.3);
      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.072)}px Tajawal`;
      c.fillText(perfect?'مثالي!':'أحسنت!',w/2,h*0.5);
      c.fillStyle=perfect?'#F4D03F':'#27AE60'; c.font=`bold ${Math.round(h*0.058)}px Tajawal`;
      c.fillText(`${simState.score} / ${simState.total}`,w/2,h*0.63);
      c.fillStyle='#5A6A7A'; c.font=`${Math.round(h*0.034)}px Tajawal`;
      c.fillText(perfect?'حصلت على كل الإجابات!':'جرِّب مجدداً 💪',w/2,h*0.74);

      // Canvas retry button
      const rbW=Math.min(180, w*0.5), rbH=40;
      const rbX=w/2-rbW/2, rbY=h*0.80;
      c.shadowColor='rgba(26,143,168,0.25)'; c.shadowBlur=14; c.shadowOffsetY=4;
      c.fillStyle='rgba(26,143,168,0.92)';
      c.beginPath(); c.roundRect(rbX,rbY,rbW,rbH,20); c.fill();
      c.shadowBlur=0; c.shadowOffsetY=0;
      c.fillStyle='white'; c.font=`bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
      c.fillText('🔄 إعادة المحاولة', w/2, rbY+rbH*0.68);
      simState._retryBtn={x:rbX,y:rbY,w:rbW,h:rbH};

      animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){}});
      return;
    }

    const an=simState.current;
    const bounce=Math.sin(t*0.08)*4;
    const answered=simState.fb!=null;
    const col=clsColors[an.class];

    // ── البطاقة — تملأ الكانفاس بالكامل تقريباً ──
    const cw=w-p*2, ch=h-p*2;
    const cx=p, cy=p+bounce;

    // خلفية البطاقة
    const cardBg=simState.fb===true?'#E8F5E9':simState.fb===false?'#FFEBEE':'white';
    c.shadowColor='rgba(0,0,0,0.15)'; c.shadowBlur=20; c.shadowOffsetY=4;
    c.fillStyle=cardBg;
    c.beginPath(); c.roundRect(cx,cy,cw,ch,20); c.fill();
    c.shadowBlur=0; c.shadowOffsetY=0;
    c.strokeStyle=simState.fb===true?'#27AE60':simState.fb===false?'#E74C3C':col+'66';
    c.lineWidth=3; c.stroke();

    // ── رأس البطاقة بلون الفئة ──
    const hdrH=Math.round(ch*0.14);
    c.fillStyle=col;
    c.beginPath(); c.roundRect(cx,cy,cw,hdrH,[20,20,0,0]); c.fill();
    // عداد المتبقي في الرأس
    const rem=simState.remaining.length+(simState.current?1:0);
    c.fillStyle='rgba(255,255,255,0.85)'; c.font=`${Math.round(h*0.028)}px Tajawal`; c.textAlign='left';
    c.fillText(`${rem}/${simState.total}`,cx+12,cy+hdrH*0.65);
    // النقاط في الرأس
    c.textAlign='right';
    c.fillText(`🔥 ${simState.streak}`,cx+cw-12,cy+hdrH*0.65);

    // ── الـ emoji ──
    const emojiY=cy+hdrH+Math.round(ch*0.24);
    if(!answered){ c.shadowColor=col+'55'; c.shadowBlur=24; }
    c.font=`${Math.round(h*0.22)}px serif`; c.textAlign='center';
    c.fillText(an.emoji,cx+cw/2,emojiY);
    c.shadowBlur=0;

    // ── اسم الحيوان ──
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.062)}px Tajawal`; c.textAlign='center';
    c.fillText(an.name,cx+cw/2,emojiY+Math.round(h*0.07));

    // ── وصف الحيوان (سطران) ──
    c.fillStyle='#5A6A7A'; c.font=`${Math.round(h*0.032)}px Tajawal`;
    const clue=an.clue;
    const midI=clue.lastIndexOf(' ',Math.floor(clue.length/2));
    const l1=clue.slice(0,midI>0?midI:Math.floor(clue.length/2));
    const l2=clue.slice(midI>0?midI+1:Math.floor(clue.length/2));
    const descY=emojiY+Math.round(h*0.12);
    c.fillText(l1,cx+cw/2,descY);
    c.fillText(l2,cx+cw/2,descY+Math.round(h*0.038));

    // ── نتيجة الإجابة ──
    if(simState.fb===true){
      c.fillStyle=col; c.font=`bold ${Math.round(h*0.04)}px Tajawal`;
      c.fillText('✅ '+clsDefs[an.class],cx+cw/2,descY+Math.round(h*0.09));
    } else if(simState.fb===false){
      c.fillStyle='#E74C3C'; c.font=`bold ${Math.round(h*0.035)}px Tajawal`;
      c.fillText('❌ '+an.clue.slice(0,20)+'…',cx+cw/2,descY+Math.round(h*0.09));
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){}});
  }
  // Canvas click: allow retry from inside the canvas end screen
  const cv=document.getElementById('simCanvas');
  cv.onclick=function(ev){
    if(currentSim!=='vertebrates'||currentTab!==1) return;
    if(simState && simState._retryBtn && !simState.current){
      const r=cv.getBoundingClientRect();
      const mx=(ev.clientX-r.left)*(cv.width/r.width);
      const my=(ev.clientY-r.top)*(cv.height/r.height);
      const b=simState._retryBtn;
      if(mx>=b.x&&mx<=b.x+b.w&&my>=b.y&&my<=b.y+b.h){ resetV2(); return; }
    }
  };
  draw();
}

// ══════════════════════════════════════════════════════════
// 10-6 TAB 1 — اللافقاريّات (مختبر التصنيف)
// ══════════════════════════════════════════════════════════
function simInvertebrates1() {
  const groups = [
    { id:'mollusca',   name:'الرخويّات',           color:'#8E44AD', emoji:'🐌',
      traits:['جسم رخو غير مقسَّم','لها قدم عضليّة تساعدها على الحركة','بعضها له صدفة كالحلزون','مثل: الحلزون والأخطبوط والحبّار'],
      legCount:'لا أرجل', body:'قدم عضليّة', shell:'أحياناً', segments:'لا' },
    { id:'annelida',   name:'الحلقيّات',            color:'#E67E22', emoji:'🪱',
      traits:['جسم مقسَّم إلى حلقات (Segments)','لا أرجل حقيقية','لها أشواك (Setae) تساعدها','مثل: دودة الأرض وديدان البحر'],
      legCount:'لا أرجل', body:'حلقات', shell:'لا', segments:'نعم' },
    { id:'arthropoda', name:'مفصليّات الأرجل',      color:'#3498DB', emoji:'🦗',
      traits:['أرجل مفصليّة (Jointed legs)','هيكل خارجي صلب (Exoskeleton)','أكبر مجموعة حيوانية','تشمل: الحشرات والعناكب والسرطانات'],
      legCount:'مفصليّة (متعدد)', body:'هيكل خارجي', shell:'هيكل', segments:'أحياناً' },
    { id:'insecta',    name:'الحشرات',              color:'#27AE60', emoji:'🦋',
      traits:['ستة أرجل مفصليّة','جسم ثلاثة أجزاء: رأس وصدر وبطن','زوجان من الأجنحة','قرنا استشعار (Antennae)'],
      legCount:'٦ أرجل', body:'رأس+صدر+بطن', shell:'هيكل خارجي', segments:'٣ أجزاء' },
    { id:'arachnida',  name:'العنكبوتيّات',          color:'#E74C3C', emoji:'🕷️',
      traits:['ثمانية أرجل مفصليّة','جسمان فقط (الرأس-الصدر والبطن)','لا أجنحة ولا قرون استشعار','مثل: العناكب والعقارب والقراد'],
      legCount:'٨ أرجل', body:'جزءان', shell:'هيكل خارجي', segments:'٢ أجزاء' }
  ];

  simState = { t:0, selected:null, compareMode:false };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🦀 اللافقاريّات</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:3px;margin-bottom:6px">
      ${groups.map(g=>`<button class="ctrl-btn" id="biv_${g.id}"
        style="width:100%;background:${g.color}22;border-color:${g.color}55;color:${g.color};text-align:right;font-size:13px"
        onclick="(function(){simState.selected='${g.id}';simState.compareMode=false;U9Sound.ping(440,0.18,0.12);})()">
        ${g.emoji} ${g.name}
      </button>`).join('')}
    </div>
    <button class="ctrl-btn" id="bInvCmp" style="width:100%;background:rgba(52,152,219,0.2);border-color:rgba(52,152,219,0.5);color:#3498DB">📊 جدول المقارنة</button>
    <div class="info-box" id="invInfo">اضغط على مجموعة لاستكشافها</div>
    <div class="q-box"><strong>❓ أسئلة الكتاب (ص٧١):</strong><br>١- ما الفرق بين الحشرات والعنكبوتيّات في عدد الأرجل وأجزاء الجسم؟<br>٢- اذكر مجموعتين من اللافقاريّات مع مثال لكلٍّ منهما.
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- الحشرات: 6 أرجل و3 أجزاء. العناكب: 8 أرجل وجزءان.<br>٢- القشريّات (مثل: الجمبري) وشوكيّات الجلد (مثل: قنفذ البحر).
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- الحشرات: 6 أرجل / 3 أجزاء. العناكب: 8 أرجل / جزءان.<br>٢- عدد الأرجل وعدد أجزاء الجسم.</div>
  </div>
  </div>
  `);

  btn('bInvCmp',()=>{ simState.compareMode=true; simState.selected=null; U9Sound.ping(523,0.2,0.18); });

  function draw(){
    if(currentSim!=='invertebrates'||currentTab!==0) return;
    const c=ctx(),w=W(),h=H(); simState.t++;
    const t=simState.t;

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#FFF3E0'); bg.addColorStop(1,'#EFEBE9');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    if(simState.compareMode) {
      c.fillStyle='#5D3A1A'; c.font=`bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign='center';
      c.fillText('مقارنة مجموعات اللافقاريّات',w/2,28);

      const attrs=[{label:'الأرجل',key:'legCount'},{label:'الجسم',key:'body'},{label:'قشرة',key:'shell'},{label:'حلقات',key:'segments'}];
      const colW=w/(groups.length+1);
      const rowH=(h-60)/(attrs.length+1);

      // Header row
      c.fillStyle='rgba(94,58,26,0.8)'; c.beginPath(); c.roundRect(10,50,w-20,rowH,6); c.fill();
      c.fillStyle='white'; c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
      c.fillText('الصفة',colW*0.5,50+rowH*0.67);
      groups.forEach((g,i)=>{
        c.font=`${Math.round(h*0.032)}px serif`;
        c.fillText(g.emoji,colW*(i+1.5),50+rowH*0.67);
      });

      attrs.forEach((attr,ri)=>{
        const ry=50+(ri+1)*rowH;
        c.fillStyle=ri%2===0?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.4)';
        c.beginPath(); c.roundRect(10,ry,w-20,rowH,4); c.fill();
        c.fillStyle='#2C3A4A'; c.font=`bold ${Math.round(h*0.029)}px Tajawal`; c.textAlign='center';
        c.fillText(attr.label,colW*0.5,ry+rowH*0.67);
        groups.forEach((g,i)=>{
          const val=g[attr.key];
          c.fillStyle=val==='نعم'?'#27AE60':val==='لا'?'#E74C3C':g.color;
          c.font=`${Math.round(h*0.024)}px Tajawal`;
          const txt=val.length>7?val.substring(0,6)+'…':val;
          c.fillText(txt,colW*(i+1.5),ry+rowH*0.67);
        });
      });

    } else if(simState.selected) {
      const g=groups.find(x=>x.id===simState.selected);
      const bg2=c.createLinearGradient(0,0,0,h);
      bg2.addColorStop(0,'#FFF'); bg2.addColorStop(1,g.color+'11');
      c.fillStyle=bg2; c.fillRect(0,0,w,h);

      const bob=Math.sin(t*0.07)*5;
      c.font=`${Math.round(h*0.2)}px serif`; c.textAlign='center';
      c.fillText(g.emoji,w*0.2,h*0.52+bob);

      const _lh2 = Math.round(h*0.046);
      const _pad2 = 14;
      const _hdrH2 = _lh2 + 12;
      const _statsH2 = 48;
      const _ph2 = _hdrH2 + _pad2 + g.traits.length*_lh2 + _pad2 + _statsH2 + 8;
      const _pw2 = w*0.56;
      const _px2 = w*0.41;
      const _py2 = Math.max(6, Math.min(h*0.05, h - _ph2 - 6));

      // Card
      c.shadowColor='rgba(0,0,0,0.18)'; c.shadowBlur=18; c.shadowOffsetY=5;
      c.fillStyle='rgba(255,255,255,0.98)';
      c.beginPath(); c.roundRect(_px2,_py2,_pw2,_ph2,16); c.fill();
      c.shadowBlur=0; c.shadowOffsetY=0;
      c.strokeStyle=g.color; c.lineWidth=3; c.stroke();

      // Header
      c.fillStyle=g.color;
      c.beginPath(); c.roundRect(_px2,_py2,_pw2,_hdrH2,[16,16,0,0]); c.fill();
      c.fillStyle='white'; c.font=`bold ${Math.round(h*0.038)}px Tajawal`; c.textAlign='center';
      c.fillText(g.emoji + '  ' + g.name, _px2+_pw2/2, _py2+_hdrH2-6);

      // Traits list
      const _listTop2 = _py2 + _hdrH2 + _pad2;
      g.traits.forEach((tr,i)=>{
        const _ry2 = _listTop2 + i*_lh2;
        if(i%2===1){ c.fillStyle='rgba(0,0,0,0.025)'; c.fillRect(_px2,_ry2,_pw2,_lh2); }
        // Bullet right (RTL)
        c.fillStyle=g.color+'BB';
        c.beginPath(); c.arc(_px2+_pw2-14, _ry2+_lh2*0.5, 4.5, 0, Math.PI*2); c.fill();
        // Clipped text
        c.fillStyle='#1E2D3D'; c.font=`${Math.round(h*0.027)}px Tajawal`; c.textAlign='right';
        c.save(); c.beginPath(); c.rect(_px2+6,_ry2,_pw2-26,_lh2); c.clip();
        c.fillText(tr, _px2+_pw2-22, _ry2+_lh2*0.72);
        c.restore();
      });

      // Stat badges
      const _statsY2 = _listTop2 + g.traits.length*_lh2 + 8;
      const _stats2=[{l:'الأرجل',v:g.legCount},{l:'الجسم',v:g.body},{l:'قشرة',v:g.shell},{l:'حلقات',v:g.segments}];
      _stats2.forEach((st,i)=>{
        const _bx2=_px2+8+i*(_pw2-16)/4;
        const _bc2=st.v==='نعم'?'rgba(39,174,96,0.85)':st.v==='لا'?'rgba(231,76,60,0.75)':g.color+'99';
        c.fillStyle=_bc2; c.beginPath(); c.roundRect(_bx2,_statsY2,_pw2/4-6,_statsH2-4,8); c.fill();
        c.fillStyle='white'; c.font=`bold ${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
        c.fillText(st.l, _bx2+(_pw2/4-6)/2, _statsY2+16);
        c.font=`${Math.round(h*0.022)}px Tajawal`;
        const _sv2=st.v.length>7?st.v.substring(0,6)+'…':st.v;
        c.fillText(_sv2, _bx2+(_pw2/4-6)/2, _statsY2+32);
      });


    } else {
      c.fillStyle='#5D3A1A'; c.font=`bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign='center';
      c.fillText('اللافقاريّات — حيوانات بلا عمود فقري',w/2,28);

      groups.forEach((g,i)=>{
        const gx=(i%3)*w/3+w/6+(i>=3?(w/6):0);
        const gy=i<3?h*0.32:h*0.68;
        const bob=Math.sin(t*0.07+i*1.3)*4;
        const sel=simState.selected===g.id;

        // دائرة خلفية للمحددة
        if(sel){
          c.fillStyle=g.color+'22'; c.beginPath(); c.arc(gx,gy+bob-20,50,0,Math.PI*2); c.fill();
          c.strokeStyle=g.color; c.lineWidth=3; c.stroke();
        }

        c.font=`${Math.round(h*0.1)}px serif`; c.textAlign='center';
        c.fillText(g.emoji,gx,gy+bob);

        c.fillStyle=sel?g.color:g.color+'DD';
        c.beginPath(); c.roundRect(gx-55,gy+36+bob,110,24,12); c.fill();
        c.fillStyle='white'; c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
        c.fillText(g.name,gx,gy+52+bob);
      });

      // onclick على الكانفاس
      const cvInv=document.getElementById('simCanvas');
      cvInv.onclick=function(ev){
        const rect=cvInv.getBoundingClientRect();
        const mx=(ev.clientX-rect.left)*cvInv.width/rect.width;
        const my=(ev.clientY-rect.top)*cvInv.height/rect.height;
        groups.forEach((g,i)=>{
          const gx=(i%3)*cvInv.width/3+cvInv.width/6+(i>=3?(cvInv.width/6):0);
          const gy=i<3?cvInv.height*0.32:cvInv.height*0.68;
          if(Math.hypot(mx-gx,my-gy)<65){
            if(simState.selected===g.id){
              simState.selected=null; // ضغطة ثانية → ارجع
              const el=document.getElementById('invInfo');
              if(el) el.textContent='اضغط على مجموعة لاستكشافها';
            } else {
              simState.selected=g.id; simState.compareMode=false;
              U9Sound.ping(440,0.12,0.1);
              const el=document.getElementById('invInfo');
              if(el) el.innerHTML=`<strong style="color:${g.color}">${g.emoji} ${g.name}</strong>: ${g.traits[0]}`;
            }
            groups.forEach(g2=>{
              const b=document.getElementById('biv_'+g2.id);
              if(b) b.style.background=g2.color+(g2.id===simState.selected?'44':'22');
            });
          }
        });
      };
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 10-6 TAB 2 — الحشرات والعناكب (تبديل بزر)
// ══════════════════════════════════════════════════════════
function simInvertebrates2() {

  // ── بيانات الحشرة ──
  const INSECT_Y_SHIFT = 0.09;
  const insectParts = [
    {id:'antennae', label:'قرنا الاستشعار', desc:'تُحسّ بالروائح واللمس والصوت',          tx:0.36, ty:0.03+INSECT_Y_SHIFT},
    {id:'head',     label:'الرأس',          desc:'يحتوي على العينين والفم وقرني الاستشعار', tx:0.36, ty:0.14+INSECT_Y_SHIFT},
    {id:'wings',    label:'الأجنحة',        desc:'زوجان من الأجنحة للطيران',              tx:0.36, ty:0.29+INSECT_Y_SHIFT},
    {id:'thorax',   label:'الصدر',          desc:'مركز الحركة — ترتبط به الأرجل والأجنحة', tx:0.36, ty:0.38+INSECT_Y_SHIFT},
    {id:'legs',     label:'الأرجل (٦)',     desc:'ستة أرجل مفصليّة ترتبط بالصدر',        tx:0.36, ty:0.50+INSECT_Y_SHIFT},
    {id:'abdomen',  label:'البطن',          desc:'يحتوي على معظم الأعضاء الداخلية',      tx:0.36, ty:0.64+INSECT_Y_SHIFT},
  ];


  simState.inv2Mode = 'insect';
  const isInsect = true;
  const parts = insectParts;
  const total = parts.length;

  const labelPositions = parts.map((_,i)=>({x:0.76, y:0.08+i*(0.84/Math.max(parts.length-1,1))}));
  const labels = parts.map((p,i)=>({...p, lx:labelPositions[i].x, ly:labelPositions[i].y, placed:false}));

  simState = { ...simState, t:0, labels, completed:0, dragging:null, dragX:0, dragY:0 };

  function rebuild() {
    const isIns = simState.inv2Mode==='insect';
    const lbs = isIns ? insectParts : spiderParts;
    const ttl = lbs.length;
    controls(`
<div class="ctrl-section">
  <div class="ctrl-label">${isIns?'🦋 سِمِّ أجزاء الحشرة':'🕷️ سِمِّ أجزاء العنكبوت'}</div>
  <div style="font-size:12px;color:rgba(255,255,255,0.65);margin-top:3px">اسحب كل تسمية إلى مكانها الصحيح</div>
</div>

<div id="inv2Score" style="text-align:center;font-size:22px;font-weight:800;color:#27AE60;margin:6px 0">✅ 0 / ${ttl}</div>
<button class="ctrl-btn" id="btnInv2Reset" style="width:100%;background:rgba(231,76,60,0.15);border-color:rgba(231,76,60,0.4);color:#E74C3C">🔄 إعادة</button>
<div class="info-box" id="inv2Info">اسحب التسمية إلى الجزء الصحيح</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (ص٧١):</strong><br>
  ١- صنِّف الحيوانات إلى حشرات وعناكب.<br>
  ٢- ما أهم فرق بين الحشرات والعناكب؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">١- الحشرات: 6 أرجل / 3 أجزاء. العناكب: 8 أرجل / جزءان.<br>٢- عدد الأرجل وعدد أجزاء الجسم.</div>
</div>
    `);
    btn('btnInv2Reset',()=>{
      simState.labels.forEach((l,i)=>{ l.placed=false; l.lx=0.75; l.ly=0.10+i*0.16; });
      simState.completed=0;
      document.getElementById('inv2Score').textContent=`✅ 0 / ${ttl}`;
      document.getElementById('inv2Info').textContent='اسحب التسمية إلى الجزء الصحيح';
      U9Sound.ping(330,0.2,0.15);
    });
  }
  rebuild();

  const canvas=document.getElementById('simCanvas');

  function getXY(e){
    const r=canvas.getBoundingClientRect();
    const t2=e.touches&&e.touches[0]||e;
    return {x:(t2.clientX-r.left)*canvas.width/r.width, y:(t2.clientY-r.top)*canvas.height/r.height};
  }

  canvas.onmousedown=canvas.ontouchstart=function(e){
    e.preventDefault();
    const {x:mx,y:my}=getXY(e);
    for(let i=simState.labels.length-1;i>=0;i--){
      const l=simState.labels[i]; if(l.placed) continue;
      if(Math.abs(mx-l.lx*canvas.width)<55&&Math.abs(my-l.ly*canvas.height)<16){
        simState.dragging=l.id; simState.dragX=mx; simState.dragY=my; break;
      }
    }
  };
  canvas.onmousemove=canvas.ontouchmove=function(e){
    e.preventDefault();
    if(!simState.dragging) return;
    const {x,y}=getXY(e);
    simState.dragX=x; simState.dragY=y;
  };
  canvas.onmouseup=canvas.ontouchend=function(){
    if(!simState.dragging) return;
    const w2=canvas.width, h2=canvas.height;
    const lbl=simState.labels.find(l=>l.id===simState.dragging);
    const isIns=simState.inv2Mode==='insect';
    const R=Math.min(w2,h2)*0.06;
    if(Math.hypot(simState.dragX-lbl.tx*w2, simState.dragY-lbl.ty*h2)<R+20){
      lbl.placed=true; simState.completed++;
      document.getElementById('inv2Score').textContent=`✅ ${simState.completed} / ${simState.labels.length}`;
      document.getElementById('inv2Info').innerHTML=`<span style="color:#27AE60">✅ ${lbl.label}: ${lbl.desc}</span>`;
      U9Sound.correct();
      if(simState.completed===simState.labels.length){ U9Sound.win(); document.getElementById('inv2Info').innerHTML=`<span style="color:#27AE60">🎉 ممتاز! تعرَّفتِ على جميع أجزاء ${isIns?'الحشرة':'العنكبوت'}!</span>`; }
    } else {
      lbl.lx=0.75; lbl.ly=0.10+simState.labels.indexOf(lbl)*0.16;
      U9Sound.ping(220,0.15,0.12);
    }
    simState.dragging=null;
  };

  function drawInsect(c,bx,w,h){
    const sc=Math.min(w,h)/520; // scale factor
    const S=sc;

    // ── خيط تعليق ──
    c.strokeStyle='rgba(120,120,120,0.4)'; c.lineWidth=1;
    c.beginPath(); c.moveTo(bx,0); c.lineTo(bx,h*0.06); c.stroke();

    // ── قرون الاستشعار ──
    c.strokeStyle='#3E2723'; c.lineWidth=2*S;
    c.beginPath(); c.moveTo(bx-6,h*0.11); c.quadraticCurveTo(bx-38*S,h*0.02,bx-30*S,h*-0.01); c.stroke();
    c.beginPath(); c.moveTo(bx+6,h*0.11); c.quadraticCurveTo(bx+38*S,h*0.02,bx+30*S,h*-0.01); c.stroke();
    c.fillStyle='#3E2723';
    c.beginPath(); c.arc(bx-30*S,h*-0.01,4*S,0,Math.PI*2); c.fill();
    c.beginPath(); c.arc(bx+30*S,h*-0.01,4*S,0,Math.PI*2); c.fill();

    // ── الرأس ──
    const headR=26*S;
    const headY=h*0.14;
    const hg=c.createRadialGradient(bx-headR*0.3,headY-headR*0.3,2,bx,headY,headR);
    hg.addColorStop(0,'#A1887F'); hg.addColorStop(1,'#6D4C41');
    c.beginPath(); c.arc(bx,headY,headR,0,Math.PI*2);
    c.fillStyle=hg; c.fill();
    c.strokeStyle='#4E342E'; c.lineWidth=2*S; c.stroke();
    // عيون
    [-1,1].forEach(side=>{
      c.fillStyle='#1A1A2E'; c.beginPath(); c.arc(bx+side*12*S,headY-4*S,6*S,0,Math.PI*2); c.fill();
      c.fillStyle='rgba(255,255,255,0.7)'; c.beginPath(); c.arc(bx+side*10*S,headY-6*S,2.5*S,0,Math.PI*2); c.fill();
    });

    // ── الأجنحة (فوق الصدر) ──
    const wFlap=Math.sin(simState.t*0.12)*0.06;
    const wA=0.50+wFlap;
    const wingY=h*0.34;
    [[bx-68*S,wingY-8*S,0.5],[bx+68*S,wingY-8*S,-0.5],
     [bx-56*S,wingY+14*S,0.3],[bx+56*S,wingY+14*S,-0.3]].forEach(([wx,wy,rot])=>{
      c.beginPath(); c.ellipse(wx,wy,34*S,15*S,rot,0,Math.PI*2);
      c.fillStyle=`rgba(173,216,230,${wA})`; c.fill();
      c.strokeStyle='rgba(121,134,203,0.8)'; c.lineWidth=1.5*S; c.stroke();
      // عروق الجناح
      c.strokeStyle='rgba(100,120,180,0.3)'; c.lineWidth=S;
      c.beginPath(); c.moveTo(wx,wy); c.lineTo(wx+(rot>0?-20:20)*S,wy-10*S); c.stroke();
    });

    // ── الصدر ──
    const thoraxY=h*0.36;
    const thoraxRx=30*S, thoraxRy=28*S;
    const tg=c.createRadialGradient(bx-thoraxRx*0.3,thoraxY-thoraxRy*0.3,3,bx,thoraxY,thoraxRx);
    tg.addColorStop(0,'#8D6E63'); tg.addColorStop(1,'#5D4037');
    c.beginPath(); c.ellipse(bx,thoraxY,thoraxRx,thoraxRy,0,0,Math.PI*2);
    c.fillStyle=tg; c.fill(); c.strokeStyle='#4E342E'; c.lineWidth=2*S; c.stroke();

    // ── الأرجل ٦ (٣ أزواج من الصدر) ──
    const legPairs=[[h*0.29],[h*0.35],[h*0.41]];
    legPairs.forEach(([ly])=>{
      c.strokeStyle='#4E342E'; c.lineWidth=2.5*S;
      // يسار
      c.beginPath(); c.moveTo(bx-thoraxRx,ly);
      c.quadraticCurveTo(bx-70*S,ly+16*S,bx-80*S,ly+34*S); c.stroke();
      // يمين
      c.beginPath(); c.moveTo(bx+thoraxRx,ly);
      c.quadraticCurveTo(bx+70*S,ly+16*S,bx+80*S,ly+34*S); c.stroke();
    });

    // ── البطن ──
    const abdY=h*0.62;
    const abdRx=26*S, abdRy=42*S;
    const ag=c.createRadialGradient(bx-abdRx*0.3,abdY-abdRy*0.4,3,bx,abdY,abdRx);
    ag.addColorStop(0,'#795548'); ag.addColorStop(1,'#4E342E');
    c.beginPath(); c.ellipse(bx,abdY,abdRx,abdRy,0,0,Math.PI*2);
    c.fillStyle=ag; c.fill(); c.strokeStyle='#3E2723'; c.lineWidth=2*S; c.stroke();
    // حلقات البطن
    for(let i=1;i<5;i++){
      c.strokeStyle='rgba(0,0,0,0.12)'; c.lineWidth=1.5*S;
      c.beginPath(); c.ellipse(bx,abdY-abdRy*0.6+i*abdRy*0.26,abdRx*0.95,3*S,0,0,Math.PI*2); c.stroke();
    }

    // ── ظل ──
    c.fillStyle='rgba(0,0,0,0.07)'; c.beginPath();
    c.ellipse(bx,h*0.88,36*S,8*S,0,0,Math.PI*2); c.fill();
  }

  function drawSpider(c,bx,w,h){
    // أحجام ثابتة نسبة للكانفاس — لا scaling معقد
    const cR = Math.round(h*0.09);   // نصف قطر الرأس-الصدر
    const aR = Math.round(h*0.10);   // نصف قطر البطن أفقي
    const aRy= Math.round(h*0.13);   // نصف قطر البطن رأسي
    const cY = Math.round(h*0.30);   // مركز الرأس-الصدر
    const aY = Math.round(h*0.62);   // مركز البطن
    const lw = Math.max(3, Math.round(h*0.007)); // سماكة الأرجل

    // ── خيط من الأعلى ──
    c.strokeStyle='rgba(180,180,210,0.6)'; c.lineWidth=1.5;
    c.beginPath(); c.moveTo(bx,0); c.lineTo(bx,cY-cR); c.stroke();

    // ── ٨ أرجل — قبل رسم الجسم لتظهر خلفه ──
    // ٤ أزواج، تخرج من جانبي الرأس-الصدر
    const legData=[
      // [dy_attach, mx_offset, my_offset, ex, ey]  — من مركز الرأس-الصدر
      {dy:-cR*0.5, mx: cR*2.2, my:-cR*0.3, ex: cR*3.2, ey: cR*0.8},
      {dy:-cR*0.1, mx: cR*2.5, my: cR*0.4, ex: cR*3.6, ey: cR*1.8},
      {dy: cR*0.3, mx: cR*2.5, my: cR*1.0, ex: cR*3.4, ey: cR*0.2},
      {dy: cR*0.6, mx: cR*2.0, my: cR*0.5, ex: cR*2.8, ey:-cR*0.5},
    ];
    c.strokeStyle='#546E7A'; c.lineWidth=lw;
    legData.forEach(({dy,mx,my,ex,ey})=>{
      // يسار
      c.beginPath();
      c.moveTo(bx-cR*0.8, cY+dy);
      c.quadraticCurveTo(bx-mx, cY+my, bx-ex, cY+ey);
      c.stroke();
      // يمين
      c.beginPath();
      c.moveTo(bx+cR*0.8, cY+dy);
      c.quadraticCurveTo(bx+mx, cY+my, bx+ex, cY+ey);
      c.stroke();
    });

    // ── رابط بين الجزءين ──
    c.strokeStyle='#455A64'; c.lineWidth=Math.round(h*0.012);
    c.beginPath(); c.moveTo(bx,cY+cR); c.lineTo(bx,aY-aRy); c.stroke();

    // ── البطن ──
    const ag=c.createRadialGradient(bx-aR*0.3,aY-aRy*0.3,4,bx,aY,aR*1.2);
    ag.addColorStop(0,'#607D8B'); ag.addColorStop(1,'#263238');
    c.beginPath(); c.ellipse(bx,aY,aR,aRy,0,0,Math.PI*2);
    c.fillStyle=ag; c.fill();
    c.strokeStyle='#1C313A'; c.lineWidth=2; c.stroke();
    // نقشة الساعة الرملية
    c.fillStyle='rgba(255,200,50,0.35)';
    c.beginPath(); c.ellipse(bx,aY-aRy*0.35,aR*0.4,aRy*0.2,0,0,Math.PI*2); c.fill();
    c.beginPath(); c.ellipse(bx,aY+aRy*0.25,aR*0.4,aRy*0.2,0,0,Math.PI*2); c.fill();

    // ── الرأس-الصدر ──
    const cg=c.createRadialGradient(bx-cR*0.3,cY-cR*0.3,4,bx,cY,cR*1.1);
    cg.addColorStop(0,'#78909C'); cg.addColorStop(1,'#455A64');
    c.beginPath(); c.arc(bx,cY,cR,0,Math.PI*2);
    c.fillStyle=cg; c.fill();
    c.strokeStyle='#37474F'; c.lineWidth=2; c.stroke();

    // ── عيون ٨ واضحة ──
    const eR=Math.max(4,Math.round(cR*0.16));
    // صف خلفي ٤
    [[-cR*0.55,-cR*0.45],[- cR*0.18,-cR*0.52],[cR*0.18,-cR*0.52],[cR*0.55,-cR*0.45]].forEach(([ex,ey])=>{
      c.fillStyle='#0A0A1A'; c.beginPath(); c.arc(bx+ex,cY+ey,eR,0,Math.PI*2); c.fill();
      c.fillStyle='rgba(255,255,255,0.8)'; c.beginPath(); c.arc(bx+ex-eR*0.4,cY+ey-eR*0.4,eR*0.4,0,Math.PI*2); c.fill();
    });
    // صف أمامي ٤
    [[-cR*0.38,-cR*0.15],[-cR*0.12,-cR*0.22],[cR*0.12,-cR*0.22],[cR*0.38,-cR*0.15]].forEach(([ex,ey])=>{
      c.fillStyle='#050510'; c.beginPath(); c.arc(bx+ex,cY+ey,eR*0.85,0,Math.PI*2); c.fill();
      c.fillStyle='rgba(255,255,255,0.7)'; c.beginPath(); c.arc(bx+ex-eR*0.3,cY+ey-eR*0.3,eR*0.35,0,Math.PI*2); c.fill();
    });

    // ── الحريرة ──
    const spinY=aY+aRy-4;
    c.fillStyle='#546E7A'; c.beginPath(); c.ellipse(bx,spinY,Math.round(h*0.02),Math.round(h*0.015),0,0,Math.PI*2); c.fill();
    c.strokeStyle='rgba(180,180,210,0.5)'; c.lineWidth=1.5;
    c.beginPath(); c.moveTo(bx-6,spinY+6); c.lineTo(bx-8,spinY+24); c.stroke();
    c.beginPath(); c.moveTo(bx,spinY+7); c.lineTo(bx,spinY+28); c.stroke();
    c.beginPath(); c.moveTo(bx+6,spinY+6); c.lineTo(bx+8,spinY+24); c.stroke();

    // ── ظل ──
    c.fillStyle='rgba(0,0,0,0.08)';
    c.beginPath(); c.ellipse(bx,h*0.91,Math.round(h*0.09),Math.round(h*0.018),0,0,Math.PI*2); c.fill();
  }

  function draw(){
    if(currentSim!=='invertebrates'||currentTab!==1) return;
    const c=ctx(), w=W(), h=H(); simState.t++;
    const isIns=simState.inv2Mode==='insect';
    const bx=w*0.28;

    // خلفية
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,isIns?'#E8F5E9':'#ECEFF1');
    bg.addColorStop(1,isIns?'#F3E5F5':'#CFD8DC');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // عنوان
    c.fillStyle=isIns?'#1E4D2B':'#263238';
    c.font=`bold ${Math.round(h*0.038)}px Tajawal`; c.textAlign='center';
    c.fillText(isIns?'سِمِّ أجزاء الحشرة — اسحب التسميات!':'سِمِّ أجزاء العنكبوت — اسحب التسميات!', w/2, 26);

    // ارسم الحشرة أو العنكبوت
    if(isIns){ c.save(); c.translate(0, h*INSECT_Y_SHIFT); drawInsect(c,bx,w,h); c.restore(); }
    else drawSpider(c,bx,w,h);

    // دوائر الأهداف + تسميات الموضوعة
    simState.labels.forEach(lbl=>{
      const tx=lbl.tx*w, ty=lbl.ty*h;
      if(lbl.placed){
        c.fillStyle=isIns?'rgba(39,174,96,0.92)':'rgba(52,152,219,0.92)';
        c.beginPath(); c.roundRect(tx-46,ty-13,92,24,12); c.fill();
        c.fillStyle='white'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
        c.fillText(lbl.label,tx,ty+5);
        // خط وصل
        c.strokeStyle=isIns?'rgba(39,174,96,0.35)':'rgba(52,152,219,0.35)';
        c.lineWidth=1.5; c.setLineDash([3,3]);
        c.beginPath(); c.moveTo(tx+46,ty); c.lineTo(bx-30,ty); c.stroke(); c.setLineDash([]);
      } else {
        c.strokeStyle=isIns?'rgba(39,174,96,0.45)':'rgba(52,152,219,0.45)';
        c.lineWidth=1.5; c.setLineDash([4,4]);
        c.beginPath(); c.arc(tx,ty,18,0,Math.PI*2); c.stroke(); c.setLineDash([]);
      }
    });

    // تسميات على اليمين
    simState.labels.forEach((lbl,i)=>{
      if(lbl.placed) return;
      const isDrag=simState.dragging===lbl.id;
      const lx=isDrag?simState.dragX:lbl.lx*w;
      const ly=isDrag?simState.dragY:lbl.ly*h;
      c.shadowColor=isDrag?'rgba(0,0,0,0.3)':'transparent'; c.shadowBlur=isDrag?12:0;
      c.fillStyle=isDrag?(isIns?'#27AE60':'#3498DB'):(isIns?'rgba(39,174,96,0.88)':'rgba(52,152,219,0.88)');
      c.beginPath(); c.roundRect(lx-52,ly-14,104,26,13); c.fill();
      if(isDrag){c.strokeStyle='#FFD700';c.lineWidth=2.5;c.stroke();}
      c.shadowBlur=0;
      c.fillStyle='white'; c.font=`bold ${Math.round(h*0.027)}px Tajawal`; c.textAlign='center';
      c.fillText(lbl.label,lx,ly+6);
    });

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 10-7 TAB 1 — المفتاح الثنائي التفاعلي
// ══════════════════════════════════════════════════════════
function simDichotomous1() {
  // Richer tree with more animals
  const tree = {
    q:'هل له أرجل؟', icon:'🦵',
    yes:{
      q:'هل له أكثر من ٦ أرجل؟', icon:'🔢',
      yes:{
        q:'هل جسمه مكوَّن من حلقات كثيرة؟', icon:'🔄',
        yes:{
          q:'هل له أكثر من ١٠٠ رجل؟', icon:'🦶',
          yes:{name:'المئويّات 🐛', col:'#6C3483', fact:'المئويّة لها زوج واحد من الأرجل لكل حلقة'},
          no:{name:'الألفيّات 🐌', col:'#8E44AD', fact:'الألفيّة لها زوجان من الأرجل لكل حلقة'}
        },
        no:{
          q:'هل يعيش في الماء؟', icon:'🌊',
          yes:{name:'سرطان البحر 🦀', col:'#E74C3C', fact:'لها ١٠ أرجل وتتنفس بالخياشيم'},
          no:{name:'العقرب 🦂', col:'#C0392B', fact:'له ٨ أرجل وذيل سام'}
        }
      },
      no:{
        q:'هل له ٨ أرجل؟', icon:'🕷️',
        yes:{
          q:'هل يبني شبكة؟', icon:'🕸️',
          yes:{name:'العنكبوت 🕷️', col:'#9B59B6', fact:'ينسج شبكة من الحرير لاصطياد فرائسه'},
          no:{name:'العنكبوتيّات 🦟', col:'#7D3C98', fact:'ثمانية أرجل لكن لا تبني شبكة'}
        },
        no:{
          q:'هل له أجنحة؟', icon:'🦋',
          yes:{
            q:'هل يُلقِّح الأزهار؟', icon:'🌸',
            yes:{name:'النحلة / الفراشة 🐝', col:'#27AE60', fact:'من أهم الحشرات الملقِّحة للنباتات'},
            no:{name:'الذبابة / البعوضة 🦟', col:'#E67E22', fact:'حشرة طائرة لا تُلقِّح الأزهار'}
          },
          no:{name:'النملة 🐜', col:'#D35400', fact:'ستة أرجل وجسم ثلاثي بلا أجنحة'}
        }
      }
    },
    no:{
      q:'هل له جسم طري بلا قشرة صلبة؟', icon:'🐌',
      yes:{
        q:'هل جسمه مقسَّم إلى حلقات؟', icon:'🔄',
        yes:{
          q:'هل يعيش في التربة؟', icon:'🌱',
          yes:{name:'دودة الأرض 🪱', col:'#27AE60', fact:'تُخصِّب التربة وتُهوِّيها بحفر الأنفاق'},
          no:{name:'دودة البحر 🌊', col:'#1A8FA8', fact:'تعيش في البحر وجسمها مُقسَّم إلى حلقات'}
        },
        no:{
          q:'هل له صدفة؟', icon:'🐚',
          yes:{name:'الحلزون 🐌', col:'#8E44AD', fact:'يحمل صدفته على ظهره ويتحرك ببطء'},
          no:{name:'البزاق 🐌', col:'#95A5A6', fact:'مثل الحلزون تماماً لكن بلا صدفة'}
        }
      },
      no:{
        q:'هل له قشرة صلبة خارجية؟', icon:'🦪',
        yes:{
          q:'هل يعيش في الماء؟', icon:'🌊',
          yes:{name:'المحار 🦪', col:'#2E86AB', fact:'يصفِّي الماء ويُنقِّيه ويعيش مُرفَقاً بالصخور'},
          no:{name:'الشاحوط 🐌', col:'#5D6D7E', fact:'يعيش على الأرض ولديه قشرة صلبة'}
        },
        no:{name:'نجم البحر ⭐', col:'#E74C3C', fact:'له ٥ أذرع ويتنفس عبر جلده'}
      }
    }
  };

  simState = { t:0, node:tree, path:[], history:[tree], answered:null };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔑 المفتاح الثنائي</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:4px;line-height:1.5">
        أجب بنعم أو لا على كل سؤال<br>لتصل لاسم الكائن الحيّ
      </div>
    </div>
    <div id="dkQuestion" style="background:rgba(255,255,255,0.12);border-radius:12px;padding:12px;margin:8px 0;font-size:15px;color:white;line-height:1.6;min-height:52px">...</div>
    <div style="display:flex;gap:8px;margin:8px 0">
      <button class="ctrl-btn" id="btnDYes" style="flex:1;background:rgba(39,174,96,0.25);border-color:rgba(39,174,96,0.6);color:#2DC653;font-size:20px;font-weight:800;padding:12px">نعم ✓</button>
      <button class="ctrl-btn" id="btnDNo"  style="flex:1;background:rgba(231,76,60,0.2);border-color:rgba(231,76,60,0.5);color:#E74C3C;font-size:20px;font-weight:800;padding:12px">لا ✗</button>
    </div>
    <button class="ctrl-btn" id="btnDBack" style="width:100%;margin-bottom:4px;background:rgba(212,144,26,0.15);border-color:rgba(212,144,26,0.4);color:#D4901A">⬅️ خطوة للوراء</button>
    <button class="ctrl-btn" id="btnDReset" style="width:100%;background:rgba(100,100,100,0.15);border-color:rgba(100,100,100,0.3);color:#AAA">🔄 ابدأ من جديد</button>
    <div class="info-box" id="dkResult" style="margin-top:6px">...</div>
  `);

  function updateQ(){
    const n=simState.node;
    if(n.q){
      document.getElementById('dkQuestion').innerHTML=`${n.icon||'❓'} ${n.q}`;
      document.getElementById('dkResult').textContent='أجب بنعم أو لا';
      document.getElementById('btnDYes').disabled=false;
      document.getElementById('btnDNo').disabled=false;
    } else {
      document.getElementById('dkQuestion').innerHTML=`🎉 الكائن الحيّ هو:<br><strong style="font-size:22px">${n.name}</strong>`;
      document.getElementById('dkResult').innerHTML=`<em style="color:${n.col}">💡 ${n.fact}</em>`;
      document.getElementById('btnDYes').disabled=true;
      document.getElementById('btnDNo').disabled=true;
      U9Sound.win();
    }
  }
  updateQ();

  btn('btnDYes',()=>{
    if(!simState.node || !simState.node.q) return;
    simState.history.push(simState.node);
    simState.path.push({q:simState.node.q,ans:'نعم'});
    simState.node=simState.node.yes;
    simState.answered='yes';
    updateQ(); U9Sound.ping(523,0.2,0.15);
  });
  btn('btnDNo',()=>{
    if(!simState.node.q) return;
    simState.history.push(simState.node);
    simState.path.push({q:simState.node.q,ans:'لا'});
    simState.node=simState.node.no;
    simState.answered='no';
    updateQ(); U9Sound.ping(392,0.2,0.12);
  });
  btn('btnDBack',()=>{
    if(simState.history.length>1){
      simState.node=simState.history.pop();
      simState.path.pop();
      simState.answered=null;
      updateQ(); U9Sound.ping(330,0.2,0.12);
    }
  });
  btn('btnDReset',()=>{
    simState.node=tree; simState.path=[]; simState.history=[tree]; simState.answered=null;
    updateQ(); U9Sound.ping(330,0.2,0.12);
  });

  // ── Step-by-step path display (replaces cramped tree) ──────────────────
  function draw(){
    if(currentSim!=='dichotomous'||currentTab!==0) return;
    const c=ctx(), w=W(), h=H(); simState.t++;
    const t = simState.t;
    const node = simState.node;

    // ── Background ──────────────────────────────────────────────────────
    const bg=c.createLinearGradient(0,0,w,h);
    bg.addColorStop(0,'#F0F7FF'); bg.addColorStop(1,'#FFF8EC');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    if(!node.q) {
      // ── RESULT SCREEN ──────────────────────────────────────────────────
      const pulse = Math.sin(t*0.08)*5;
      c.fillStyle='rgba(255,255,255,0.92)';
      c.shadowColor='rgba(0,0,0,0.15)'; c.shadowBlur=24; c.shadowOffsetY=6;
      c.beginPath(); c.roundRect(w*0.1,h*0.18+pulse,w*0.8,h*0.52,24); c.fill();
      c.shadowBlur=0; c.shadowOffsetY=0;
      c.strokeStyle=node.col||'#27AE60'; c.lineWidth=4;
      c.beginPath(); c.roundRect(w*0.1,h*0.18+pulse,w*0.8,h*0.52,24); c.stroke();

      c.fillStyle=node.col||'#27AE60';
      c.beginPath(); c.roundRect(w*0.1,h*0.18+pulse,w*0.8,h*0.09,[24,24,0,0]); c.fill();
      c.fillStyle='white'; c.font=`bold ${Math.round(h*0.038)}px Tajawal`; c.textAlign='center';
      c.fillText('🎉 وصلت!', w/2, h*0.18+h*0.065+pulse);

      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.07)}px serif`; c.textAlign='center';
      c.fillText(node.name, w/2, h*0.38+pulse);

      c.fillStyle='rgba(26,143,168,0.1)';
      c.beginPath(); c.roundRect(w*0.15,h*0.48+pulse,w*0.7,h*0.14,14); c.fill();
      c.fillStyle='#1A8FA8'; c.font=`${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
      c.fillText('💡 '+node.fact, w/2, h*0.565+pulse);

      c.fillStyle='rgba(0,0,0,0.35)'; c.font=`${Math.round(h*0.028)}px Tajawal`;
      c.fillText(`وصلت في ${simState.path.length} خطوات`, w/2, h*0.73+pulse);

      // Restart hint button
      const rbX=w/2-70, rbY=h*0.77, rbW=140, rbH=36;
      c.fillStyle='rgba(26,143,168,0.85)';
      c.beginPath(); c.roundRect(rbX,rbY,rbW,rbH,18); c.fill();
      c.fillStyle='white'; c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
      c.fillText('🔄 ابدأ من جديد', w/2, rbY+24);
      simState._resetBtn={x:rbX,y:rbY,w:rbW,h:rbH};

    } else {
      // ── QUESTION CARD ──────────────────────────────────────────────────
      const cardW = Math.min(w*0.82, 560);
      // Make the "puzzle" question clearer/bigger (prevents cramped text)
      const cardH = Math.round(h*0.28);
      const cardX = (w-cardW)/2;
      const cardY = h*0.1;

      c.shadowColor='rgba(0,0,0,0.15)'; c.shadowBlur=20; c.shadowOffsetY=6;
      c.fillStyle='white';
      c.beginPath(); c.roundRect(cardX, cardY, cardW, cardH, 18); c.fill();
      c.shadowBlur=0; c.shadowOffsetY=0;

      c.fillStyle='#1A8FA8';
      c.beginPath(); c.roundRect(cardX,cardY,cardW,Math.round(cardH*0.34),[18,18,0,0]); c.fill();
      c.fillStyle='white'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
      // Compute max depth of tree dynamically
      function maxDepth(n){ if(!n||!n.q) return 0; return 1+Math.max(maxDepth(n.yes),maxDepth(n.no)); }
      const treeDepth = maxDepth(tree);
      c.fillText('السؤال ' + (simState.path.length+1) + ' من ' + treeDepth, w/2, cardY+Math.round(cardH*0.25));

      // Question text
      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.048)}px Tajawal`; c.textAlign='center';
      const qText=node.q;
      if(qText.length>14){
        const sp=qText.lastIndexOf(' ',Math.round(qText.length/2));
        const br=sp>0?sp:Math.round(qText.length/2);
        c.fillText(qText.substring(0,br), w/2, cardY+Math.round(cardH*0.62));
        c.fillText(qText.substring(br), w/2, cardY+Math.round(cardH*0.86));
      } else {
        c.fillText(qText, w/2, cardY+Math.round(cardH*0.72));
      }

      // ── YES / NO big interactive buttons ─────────────────────────────
      const btnY = cardY + cardH + 18;
      const btnW = (cardW*0.48);
      const btnH = Math.round(h*0.2);
      const yesX = (w-cardW)/2;
      const noX  = (w)/2 + 8;

      const yHov = simState._hoverBtn==='yes';
      const nHov = simState._hoverBtn==='no';
      const yPulse = yHov ? Math.sin(t*0.15)*3 : 0;
      const nPulse = nHov ? Math.sin(t*0.15)*3 : 0;

      // YES
      c.shadowColor='rgba(39,174,96,0.3)'; c.shadowBlur=yHov?20:8; c.shadowOffsetY=yHov?6:3;
      c.fillStyle = yHov ? '#27AE60' : 'rgba(39,174,96,0.12)';
      c.strokeStyle='#27AE60'; c.lineWidth=yHov?3:2;
      c.beginPath(); c.roundRect(yesX,btnY+yPulse,btnW,btnH,16); c.fill(); c.stroke();
      c.shadowBlur=0; c.shadowOffsetY=0;

      c.fillStyle = yHov ? 'white' : '#27AE60';
      c.font=`bold ${Math.round(h*0.048)}px Tajawal`; c.textAlign='center';
      c.fillText('✓', yesX+btnW/2, btnY+btnH*0.38+yPulse);
      c.font=`bold ${Math.round(h*0.034)}px Tajawal`;
      c.fillText('نعم', yesX+btnW/2, btnY+btnH*0.62+yPulse);
      if(node.yes){
        c.fillStyle = yHov ? 'rgba(255,255,255,0.8)' : 'rgba(39,174,96,0.65)';
        c.font=`${Math.round(h*0.022)}px Tajawal`;
        const yPrev=node.yes.q?('← '+node.yes.q.substring(0,16)):('🎯 '+node.yes.name.split(' ')[0]);
        c.fillText(yPrev, yesX+btnW/2, btnY+btnH*0.82+yPulse);
      }

      // NO
      c.shadowColor='rgba(231,76,60,0.3)'; c.shadowBlur=nHov?20:8; c.shadowOffsetY=nHov?6:3;
      c.fillStyle = nHov ? '#E74C3C' : 'rgba(231,76,60,0.1)';
      c.strokeStyle='#E74C3C'; c.lineWidth=nHov?3:2;
      c.beginPath(); c.roundRect(noX,btnY+nPulse,btnW,btnH,16); c.fill(); c.stroke();
      c.shadowBlur=0; c.shadowOffsetY=0;

      c.fillStyle = nHov ? 'white' : '#E74C3C';
      c.font=`bold ${Math.round(h*0.048)}px Tajawal`; c.textAlign='center';
      c.fillText('✗', noX+btnW/2, btnY+btnH*0.38+nPulse);
      c.font=`bold ${Math.round(h*0.034)}px Tajawal`;
      c.fillText('لا', noX+btnW/2, btnY+btnH*0.62+nPulse);
      if(node.no){
        c.fillStyle = nHov ? 'rgba(255,255,255,0.8)' : 'rgba(231,76,60,0.65)';
        c.font=`${Math.round(h*0.022)}px Tajawal`;
        const nPrev=node.no.q?('← '+node.no.q.substring(0,16)):('🎯 '+node.no.name.split(' ')[0]);
        c.fillText(nPrev, noX+btnW/2, btnY+btnH*0.82+nPulse);
      }

      // ── Back button (small) ────────────────────────────────────────────
      if(simState.path.length>0){
        const bkX=(w-80)/2, bkY=btnY+btnH+10;
        c.fillStyle='rgba(212,144,26,0.15)'; c.strokeStyle='rgba(212,144,26,0.5)'; c.lineWidth=1.5;
        c.beginPath(); c.roundRect(bkX,bkY,80,28,14); c.fill(); c.stroke();
        c.fillStyle='#D4901A'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
        c.fillText('⬅️ رجوع',w/2,bkY+19);
        simState._backBtn={x:bkX,y:bkY,w:80,h:28};
      } else { simState._backBtn=null; }

      // ── Breadcrumb ────────────────────────────────────────────────────
      if(simState.path.length>0){
        const crY=h-34;
        c.fillStyle='rgba(26,143,168,0.1)';
        c.beginPath(); c.roundRect(8,crY,w-16,28,10); c.fill();
        c.strokeStyle='rgba(26,143,168,0.25)'; c.lineWidth=1; c.stroke();
        const crText=simState.path.map((p,i)=>`${i+1}. ${p.ans}`).join(' → ');
        c.fillStyle='#1A8FA8'; c.font=`${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
        c.fillText(crText, w/2, crY+19);
      }

      // Store button zones for click detection
      simState._yesBtn={x:yesX,y:btnY,w:btnW,h:btnH};
      simState._noBtn={x:noX,y:btnY,w:btnW,h:btnH};
    }

    // Update sidebar text
    const dkEl=document.getElementById('dkQuestion');
    const dkRes=document.getElementById('dkResult');
    if(dkEl){
      if(node.q) dkEl.innerHTML=`${node.icon||'❓'} ${node.q}`;
      else dkEl.innerHTML=`🎉 <strong>${node.name}</strong>`;
    }
    if(dkRes){
      if(node.q) dkRes.textContent='حلّ اللغز: اضغط نعم أو لا (من اللوحة أو من الأزرار على الكانفس)';
      else dkRes.innerHTML=`<em style="color:${node.col}">💡 ${node.fact}</em>`;
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){}});
  }

  // ── Canvas click handler ───────────────────────────────────────────────────
  const canvas=document.getElementById('simCanvas');
  canvas.onclick=function(ev){
    const rect=canvas.getBoundingClientRect();
    const mx=(ev.clientX-rect.left)*(canvas.width/rect.width);
    const my=(ev.clientY-rect.top)*(canvas.height/rect.height);
    const hit=(b)=>b&&mx>=b.x&&mx<=b.x+b.w&&my>=b.y&&my<=b.y+b.h;
    if(hit(simState._resetBtn)){
      simState.node=tree; simState.path=[]; simState.history=[tree]; simState.answered=null;
      U9Sound.ping(330,0.2,0.12); return;
    }
    if(hit(simState._backBtn)){
      if(simState.history.length>1){ simState.node=simState.history.pop(); simState.path.pop(); simState.answered=null; }
      U9Sound.ping(330,0.2,0.12); return;
    }
    if(!simState.node.q) return;
    if(hit(simState._yesBtn)){
      simState.history.push(simState.node);
      simState.path.push({q:simState.node.q,ans:'نعم'});
      simState.node=simState.node.yes; simState.answered='yes';
      U9Sound.ping(523,0.22,0.15);
    } else if(hit(simState._noBtn)){
      simState.history.push(simState.node);
      simState.path.push({q:simState.node.q,ans:'لا'});
      simState.node=simState.node.no; simState.answered='no';
      U9Sound.ping(392,0.22,0.12);
    }
  };
  canvas.onmousemove=function(ev){
    const rect=canvas.getBoundingClientRect();
    const mx=(ev.clientX-rect.left)*(canvas.width/rect.width);
    const my=(ev.clientY-rect.top)*(canvas.height/rect.height);
    const hit=(b)=>b&&mx>=b.x&&mx<=b.x+b.w&&my>=b.y&&my<=b.y+b.h;
    const prev=simState._hoverBtn;
    simState._hoverBtn=hit(simState._yesBtn)?'yes':hit(simState._noBtn)?'no':null;
    canvas.style.cursor=simState._hoverBtn||hit(simState._backBtn)||hit(simState._resetBtn)?'pointer':'default';
  };
  canvas.onmouseleave=function(){ simState._hoverBtn=null; };

  draw();
}

function simDichotomous2() {
  const animals=[
    {name:'نملة 🐜',   legs:6,  wings:false, segments:3, web:false, aquatic:false},
    {name:'عنكبوت 🕷️', legs:8,  wings:false, segments:2, web:true,  aquatic:false},
    {name:'سرطان 🦀',  legs:10, wings:false, segments:0, web:false,  aquatic:true},
    {name:'دودة 🪱',   legs:0,  wings:false, segments:'many',web:false,aquatic:false},
    {name:'بزاق 🐌',   legs:0,  wings:false, segments:0, web:false, aquatic:false},
    {name:'فراشة 🦋',  legs:6,  wings:true,  segments:3, web:false, aquatic:false},
    {name:'عقرب 🦂',   legs:8,  wings:false, segments:2, web:false, aquatic:false},
    {name:'نحلة 🐝',   legs:6,  wings:true,  segments:3, web:false, aquatic:false}
  ];

  const questions=[
    {text:'هل له أكثر من ٦ أرجل؟', key:'legs', check:v=>v>6},
    {text:'هل له أجنحة؟', key:'wings', check:v=>v===true},
    {text:'هل يعيش في الماء؟', key:'aquatic', check:v=>v===true},
    {text:'هل يبني شبكة؟', key:'web', check:v=>v===true},
    {text:'هل جسمه بلا أرجل؟', key:'legs', check:v=>v===0},
    {text:'هل جسمه ٣ أجزاء؟', key:'segments', check:v=>v===3}
  ];

  simState={t:0, selected:null, currentQ:null, remaining:[...animals], filtered:[...animals], qIdx:0, results:[], showAll:false};

  window.applyDichoQ = function(qi){ if(window._applyDichoQFn) window._applyDichoQFn(qi); };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🛠️ صمِّم مفتاحك!</div>
    </div>

    <div style="background:rgba(255,255,255,0.08);border-radius:12px;padding:10px;margin:6px 0">
      <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:6px">التقدّم</div>
      <div id="d2Remain" style="font-size:22px;font-weight:800;color:#FFD700;text-align:center">8</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.6);text-align:center">حيوانات متبقّية</div>
      <div style="height:6px;background:rgba(255,255,255,0.15);border-radius:3px;margin-top:8px">
        <div id="d2Bar" style="height:6px;background:#FFD700;border-radius:3px;width:100%;transition:width 0.4s"></div>
      </div>
    </div>

    <div id="d2Log" style="background:rgba(255,255,255,0.06);border-radius:12px;padding:8px;margin:6px 0;min-height:60px;max-height:200px;overflow-y:auto;font-size:12px;color:rgba(255,255,255,0.8);line-height:1.7">
      <span style="color:rgba(255,255,255,0.4)">اضغط سؤالاً على الكانفس للبدء...</span>
    </div>

    <button class="ctrl-btn" id="btnDichoReset" style="width:100%;margin-top:4px;background:rgba(231,76,60,0.15);border-color:rgba(231,76,60,0.4);color:#E74C3C">🔄 إعادة</button>
    <div class="q-box" style="margin-top:8px"><strong>🎯 الهدف:</strong> استخدم أقل عدد من الأسئلة لتحديد حيوان واحد!</div>
  `);

  function updateD2Sidebar(){
    const rem=simState.filtered.length;
    const total=animals.length;
    const remEl=document.getElementById('d2Remain');
    const barEl=document.getElementById('d2Bar');
    if(remEl) remEl.textContent=rem;
    if(barEl) barEl.style.width=Math.round((rem/total)*100)+'%';
  }

  window._applyDichoQFn = function(qi){
    const q=questions[qi];
    const yes=simState.filtered.filter(a=>q.check(a[q.key]));
    const no=simState.filtered.filter(a=>!q.check(a[q.key]));
    simState.results.push({q:q.text,yes:yes.map(a=>a.name),no:no.map(a=>a.name)});
    // Show BOTH groups on canvas, let user choose which group to keep
    // Store split result so draw() can show YES/NO split
    simState.lastYes=yes;
    simState.lastNo=no;
    simState.pendingSplit=qi;
    U9Sound.ping(440+qi*20,0.2,0.15);

    // Update sidebar log
    const logEl=document.getElementById('d2Log');
    if(logEl){
      const yNames=yes.map(a=>a.name.split(' ')[0]).join('، ')||'—';
      const nNames=no.map(a=>a.name.split(' ')[0]).join('، ')||'—';
      logEl.innerHTML+=(simState.qIdx===0?'':'<hr style="border-color:rgba(255,255,255,0.1);margin:4px 0">') +
        `<div>📌 <strong>${q.text}</strong></div>` +
        `<div style="color:#2DC653">✓ نعم: ${yNames} (${yes.length})</div>` +
        `<div style="color:#FF6B6B">✗ لا: ${nNames} (${no.length})</div>`;
      logEl.scrollTop=logEl.scrollHeight;
    }
  };

  btn('btnDichoReset',()=>{
    simState.filtered=[...animals]; simState.qIdx=0; simState.results=[];
    simState.lastYes=null; simState.lastNo=null; simState.pendingSplit=null;
    if(simState.usedQs) simState.usedQs=[];
    const logEl=document.getElementById('d2Log');
    if(logEl) logEl.innerHTML='<span style="color:rgba(255,255,255,0.4)">اضغط سؤالاً على الكانفس للبدء...</span>';
    updateD2Sidebar();
    U9Sound.ping(330,0.2,0.15);
  });

  function draw(){
    if(currentSim!=='dichotomous'||currentTab!==1) return;
    const c=ctx(),w=W(),h=H(); simState.t++;
    const t=simState.t;

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#EEF2FF'); bg.addColorStop(1,'#FCE4EC');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // ── Title ──────────────────────────────────────────────────────────────
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.038)}px Tajawal`; c.textAlign='center';
    c.fillText('🛠️ صمِّم مفتاحك — اضغط سؤالاً لتصفية الحيوانات', w/2, 28);

    simState._questionBtns = [];

    // ── MODE A: Showing YES/NO split after a question ──────────────────────
    if(simState.pendingSplit !== null && simState.lastYes && simState.lastNo){
      const q = questions[simState.pendingSplit];
      const yes = simState.lastYes;
      const no  = simState.lastNo;

      // Question banner
      c.fillStyle='rgba(26,143,168,0.12)';
      c.beginPath(); c.roundRect(w*0.05, 36, w*0.9, Math.round(h*0.1), 14); c.fill();
      c.strokeStyle='#1A8FA8'; c.lineWidth=1.5;
      c.beginPath(); c.roundRect(w*0.05, 36, w*0.9, Math.round(h*0.1), 14); c.stroke();
      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.034)}px Tajawal`; c.textAlign='center';
      c.fillText('📌 ' + q.text, w/2, 36 + Math.round(h*0.065));

      // Instruction
      c.fillStyle='rgba(0,0,0,0.45)'; c.font=`${Math.round(h*0.026)}px Tajawal`;
      c.fillText('اختر المجموعة التي تريد الاستمرار بها:', w/2, 36 + Math.round(h*0.1) + 22);

      // ── YES group panel ──────────────────────────────────────────────────
      const panelTop = 36 + Math.round(h*0.1) + 42;
      const panelH   = Math.round(h*0.5);
      const panelW   = w*0.44;
      const yX = w*0.03;
      const nX = w*0.53;

      // YES panel
      const yHov = simState._hoverPanel === 'yes';
      c.shadowColor='rgba(39,174,96,0.25)'; c.shadowBlur=yHov?20:8; c.shadowOffsetY=3;
      c.fillStyle=yHov?'rgba(39,174,96,0.12)':'rgba(255,255,255,0.85)';
      c.strokeStyle='#27AE60'; c.lineWidth=yHov?3:1.5;
      c.beginPath(); c.roundRect(yX, panelTop, panelW, panelH, 16); c.fill(); c.stroke();
      c.shadowBlur=0; c.shadowOffsetY=0;

      c.fillStyle='#27AE60'; c.font=`bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
      c.fillText(`✓ نعم  (${yes.length})`, yX+panelW/2, panelTop+32);
      // Animals grid in YES panel
      const yGrid = Math.ceil(yes.length / 2);
      yes.forEach((a, ai) => {
        const gc = ai % 2, gr = Math.floor(ai/2);
        const ax = yX + 12 + gc*(panelW/2-8) + (panelW/2-8)/2;
        const ay = panelTop + 50 + gr*(panelH-56)/Math.max(yGrid,1) + (panelH-56)/Math.max(yGrid,1)*0.5;
        c.font=`${Math.round(h*0.056)}px serif`; c.textAlign='center';
        c.fillText(a.name.split(' ')[1]||'🐾', ax, ay);
        c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.022)}px Tajawal`;
        c.fillText(a.name.split(' ')[0], ax, ay+Math.round(h*0.04));
        c.fillStyle='#27AE60';
      });

      // NO panel
      const nHov = simState._hoverPanel === 'no';
      c.shadowColor='rgba(231,76,60,0.25)'; c.shadowBlur=nHov?20:8; c.shadowOffsetY=3;
      c.fillStyle=nHov?'rgba(231,76,60,0.1)':'rgba(255,255,255,0.85)';
      c.strokeStyle='#E74C3C'; c.lineWidth=nHov?3:1.5;
      c.beginPath(); c.roundRect(nX, panelTop, panelW, panelH, 16); c.fill(); c.stroke();
      c.shadowBlur=0; c.shadowOffsetY=0;

      c.fillStyle='#E74C3C'; c.font=`bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
      c.fillText(`✗ لا  (${no.length})`, nX+panelW/2, panelTop+32);
      const nGrid = Math.ceil(no.length/2);
      no.forEach((a, ai) => {
        const gc = ai%2, gr = Math.floor(ai/2);
        const ax = nX + 12 + gc*(panelW/2-8) + (panelW/2-8)/2;
        const ay = panelTop + 50 + gr*(panelH-56)/Math.max(nGrid,1) + (panelH-56)/Math.max(nGrid,1)*0.5;
        c.font=`${Math.round(h*0.056)}px serif`; c.textAlign='center';
        c.fillText(a.name.split(' ')[1]||'🐾', ax, ay);
        c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.022)}px Tajawal`;
        c.fillText(a.name.split(' ')[0], ax, ay+Math.round(h*0.04));
        c.fillStyle='#E74C3C';
      });

      // Store clickable panels
      simState._yesPanel={x:yX,y:panelTop,w:panelW,h:panelH};
      simState._noPanel ={x:nX, y:panelTop,w:panelW,h:panelH};

      // Hint arrow
      c.fillStyle='rgba(0,0,0,0.35)'; c.font=`${Math.round(h*0.025)}px Tajawal`; c.textAlign='center';
      c.fillText('اضغط على المجموعة التي تريد الاستمرار بها ↑', w/2, panelTop+panelH+28);

    } else {
      // ── MODE B: Normal question selection grid ──────────────────────────
      simState._yesPanel=null; simState._noPanel=null;

      // Animal grid (top 44%)
      const cols=4, gridTop=46, gridH=h*0.44;
      const cellW=w/cols, cellH=gridH/2;
      animals.forEach((a,i)=>{
        const col=i%cols, row=Math.floor(i/cols);
        const ax=col*cellW+cellW/2, ay=gridTop+row*cellH+cellH*0.44;
        const isActive=simState.filtered.includes(a);
        const bob=isActive?Math.sin(t*0.07+i*0.8)*4:0;
        if(isActive){
          c.shadowColor='rgba(26,143,168,0.2)'; c.shadowBlur=10;
          c.fillStyle='rgba(255,255,255,0.9)';
        } else {
          c.shadowBlur=0; c.fillStyle='rgba(200,200,200,0.25)';
        }
        c.beginPath(); c.roundRect(col*cellW+6,gridTop+row*cellH+4,cellW-12,cellH-8,14); c.fill();
        if(isActive){ c.strokeStyle='#1A8FA8'; c.lineWidth=2; c.stroke(); }
        c.shadowBlur=0;
        c.globalAlpha=isActive?1:0.2;
        c.font=`${Math.round(h*0.10)}px serif`; c.textAlign='center';
        c.fillText(a.name.split(' ')[1]||'🐾', ax, ay+bob);
        c.fillStyle=isActive?'#1E2D3D':'#888';
        c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
        c.fillText(a.name.split(' ')[0], ax, ay+Math.round(h*0.058)+bob);
        if(isActive){
          c.fillStyle='rgba(26,143,168,0.85)';
          c.beginPath(); c.roundRect(ax-28,ay+Math.round(h*0.068)+bob,56,16,8); c.fill();
          c.fillStyle='white'; c.font=`bold ${Math.round(h*0.019)}px Tajawal`;
          c.fillText(`أرجل: ${a.legs}`, ax, ay+Math.round(h*0.079)+bob);
        }
        c.globalAlpha=1;
      });

      // Divider
      const divY=gridTop+gridH+6;
      c.strokeStyle='rgba(26,143,168,0.25)'; c.lineWidth=1.5; c.setLineDash([5,4]);
      c.beginPath(); c.moveTo(10,divY); c.lineTo(w-10,divY); c.stroke(); c.setLineDash([]);

      // Remaining badge
      const remCount=simState.filtered.length;
      const badgeCol=remCount===1?'#27AE60':remCount<=3?'#E67E22':'#1A8FA8';
      c.fillStyle=badgeCol+'22'; c.beginPath(); c.roundRect(w/2-70,divY+4,140,22,11); c.fill();
      c.fillStyle=badgeCol; c.font=`bold ${Math.round(h*0.025)}px Tajawal`; c.textAlign='center';
      c.fillText(`متبقّي: ${remCount} حيوانات`, w/2, divY+19);

      // Question buttons grid (2 cols)
      const qAreaTop=divY+34;
      const qCols=2;
      const qBtnW=(w-24)/qCols - 4;
      const qBtnH=Math.round((h-qAreaTop-44) / Math.ceil(questions.length/qCols)) - 4;

      questions.forEach((q,i)=>{
        const qCol=i%qCols, qRow=Math.floor(i/qCols);
        const bx=12+qCol*(qBtnW+8);
        const by=qAreaTop+qRow*(qBtnH+4);
        const isUsed=simState.usedQs&&simState.usedQs.includes(i);
        const isHov=simState._hoverQ===i;
        c.shadowColor=isHov?'rgba(26,143,168,0.3)':'transparent'; c.shadowBlur=isHov?14:0;
        c.fillStyle=isUsed?'rgba(39,174,96,0.1)':isHov?'rgba(26,143,168,0.15)':'rgba(255,255,255,0.82)';
        c.strokeStyle=isUsed?'#27AE60':isHov?'#1A8FA8':'rgba(26,143,168,0.25)';
        c.lineWidth=isHov?2.5:1.5;
        c.beginPath(); c.roundRect(bx,by,qBtnW,qBtnH,10); c.fill(); c.stroke();
        c.shadowBlur=0;
        if(isUsed){
          c.fillStyle='rgba(39,174,96,0.2)'; c.beginPath(); c.roundRect(bx+qBtnW-26,by+3,22,15,7); c.fill();
          c.fillStyle='#27AE60'; c.font=`bold ${Math.round(h*0.018)}px Tajawal`; c.textAlign='center';
          c.fillText('✓',bx+qBtnW-15,by+13);
        }
        c.fillStyle=isUsed?'#5A7A5A':isHov?'#1A8FA8':'#1E2D3D';
        c.font=`bold ${Math.round(Math.min(h*0.026,qBtnH*0.4))}px Tajawal`; c.textAlign='right';
        c.fillText(q.text, bx+qBtnW-10, by+qBtnH*0.62);
        simState._questionBtns.push({x:bx,y:by,w:qBtnW,h:qBtnH,qi:i});
      });

      // Reset button
      const rstY=h-38;
      c.fillStyle=simState._hoverReset?'rgba(231,76,60,0.7)':'rgba(231,76,60,0.12)';
      c.strokeStyle='rgba(231,76,60,0.4)'; c.lineWidth=1.5;
      c.beginPath(); c.roundRect(w/2-52,rstY,104,28,14); c.fill(); c.stroke();
      c.fillStyle=simState._hoverReset?'white':'#E74C3C';
      c.font=`bold ${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
      c.fillText('🔄 إعادة', w/2, rstY+19);
      simState._resetBtn2={x:w/2-52,y:rstY,w:104,h:28};

      // Victory
      if(remCount===1){
        c.fillStyle='rgba(0,0,0,0.45)';
        c.beginPath(); c.roundRect(0,0,w,h,0); c.fill();
        c.fillStyle='rgba(39,174,96,0.95)';
        c.beginPath(); c.roundRect(w*0.1,h*0.28,w*0.8,h*0.2,20); c.fill();
        c.fillStyle='white'; c.font=`bold ${Math.round(h*0.042)}px Tajawal`; c.textAlign='center';
        c.fillText(`🎉 ${simState.filtered[0].name}`, w/2, h*0.36);
        c.font=`${Math.round(h*0.028)}px Tajawal`;
        c.fillText(`في ${simState.qIdx} أسئلة فقط!`, w/2, h*0.4);
      }
    }

    updateD2Sidebar();
    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){}});
  }
  const canvas2=document.getElementById('simCanvas');
  canvas2.onclick=function(ev){
    const _r2=canvas2.getBoundingClientRect();
    const mx=(ev.clientX-_r2.left)*canvas2.width/_r2.width, my=(ev.clientY-_r2.top)*canvas2.height/_r2.height;
    const hit=(b)=>b&&mx>=b.x&&mx<=b.x+b.w&&my>=b.y&&my<=b.y+b.h;

    // ── If in split mode, clicking YES or NO panel ──────────────────────
    if(simState.pendingSplit !== null){
      if(hit(simState._yesPanel)){
        simState.filtered = simState.lastYes;
        simState.qIdx++;
        if(!simState.usedQs) simState.usedQs=[];
        if(!simState.usedQs.includes(simState.pendingSplit)) simState.usedQs.push(simState.pendingSplit);
        simState.pendingSplit=null; simState.lastYes=null; simState.lastNo=null;
        updateD2Sidebar();
        U9Sound.ping(523,0.2,0.15);
        if(simState.filtered.length===1) U9Sound.win();
        return;
      }
      if(hit(simState._noPanel)){
        simState.filtered = simState.lastNo;
        simState.qIdx++;
        if(!simState.usedQs) simState.usedQs=[];
        if(!simState.usedQs.includes(simState.pendingSplit)) simState.usedQs.push(simState.pendingSplit);
        simState.pendingSplit=null; simState.lastYes=null; simState.lastNo=null;
        updateD2Sidebar();
        U9Sound.ping(392,0.2,0.12);
        if(simState.filtered.length===1) U9Sound.win();
        return;
      }
      return; // Ignore clicks outside panels while in split mode
    }

    // ── Normal mode: reset or question buttons ──────────────────────────
    if(hit(simState._resetBtn2)){
      simState.filtered=[...animals]; simState.qIdx=0; simState.usedQs=[];
      simState.pendingSplit=null; simState.lastYes=null; simState.lastNo=null;
      const logEl=document.getElementById('d2Log');
      if(logEl) logEl.innerHTML='<span style="color:rgba(255,255,255,0.4)">اضغط سؤالاً على الكانفس للبدء...</span>';
      updateD2Sidebar();
      U9Sound.ping(330,0.2,0.15); return;
    }
    if(simState._questionBtns){
      for(const btn of simState._questionBtns){
        if(hit(btn)){
          window._applyDichoQFn(btn.qi);
          if(!simState.usedQs) simState.usedQs=[];
          if(!simState.usedQs.includes(btn.qi)) simState.usedQs.push(btn.qi);
          return;
        }
      }
    }
  };
  canvas2.onmousemove=function(ev){
    const _r2=canvas2.getBoundingClientRect();
    const mx=(ev.clientX-_r2.left)*canvas2.width/_r2.width, my=(ev.clientY-_r2.top)*canvas2.height/_r2.height;
    const hit=(b)=>b&&mx>=b.x&&mx<=b.x+b.w&&my>=b.y&&my<=b.y+b.h;
    simState._hoverQ=null; simState._hoverReset=false;
    if(simState.pendingSplit !== null){
      simState._hoverPanel=hit(simState._yesPanel)?'yes':hit(simState._noPanel)?'no':null;
      canvas2.style.cursor=simState._hoverPanel?'pointer':'default';
      return;
    }
    simState._hoverPanel=null;
    simState._hoverReset=hit(simState._resetBtn2);
    if(simState._questionBtns){
      for(const btn of simState._questionBtns){
        if(hit(btn)){ simState._hoverQ=btn.qi; break; }
      }
    }
    canvas2.style.cursor=(simState._hoverQ!==null||simState._hoverReset)?'pointer':'default';
  };
  canvas2.onmouseleave=function(){ simState._hoverQ=null; simState._hoverReset=false; };

  if(!simState.usedQs) simState.usedQs=[];

  draw();
}


// ══════════════════════════════════════════════════════════
// 10-8 TAB 1 — الجينات والصفات (PhET-style)
// ══════════════════════════════════════════════════════════
function simGenetics1() {
  const traits={
    color:{ label:'لون الشعر 💇', color:'#2C3A4A',
      alleles:[{s:'B',name:'أسود',dom:true,col:'#2C3A4A'},{s:'b',name:'أشقر',dom:false,col:'#F4D03F'},{s:'R',name:'أحمر',dom:false,col:'#C0392B'}],
      combos:[{g:'BB',res:'أسود غامق',col:'#2C3A4A'},{g:'Bb',res:'أسود (حامل)',col:'#4A6274'},{g:'bb',res:'أشقر',col:'#F4D03F'},{g:'BR',res:'أسود',col:'#2C3A4A'},{g:'bR',res:'بني',col:'#8B4513'},{g:'RR',res:'أحمر',col:'#C0392B'}]
    },
    height:{ label:'الطول 📏', color:'#27AE60',
      alleles:[{s:'T',name:'طويل',dom:true,col:'#27AE60'},{s:'t',name:'قصير',dom:false,col:'#E67E22'}],
      combos:[{g:'TT',res:'طويل جداً',col:'#1A7A44'},{g:'Tt',res:'طويل',col:'#27AE60'},{g:'tt',res:'قصير',col:'#E67E22'}]
    },
    tongue:{ label:'طيّ اللسان 👅', color:'#8E44AD',
      alleles:[{s:'R',name:'يطوي',dom:true,col:'#8E44AD'},{s:'r',name:'لا يطوي',dom:false,col:'#95A5A6'}],
      combos:[{g:'RR',res:'يطوي (سائد)',col:'#8E44AD'},{g:'Rr',res:'يطوي',col:'#9B59B6'},{g:'rr',res:'لا يطوي',col:'#95A5A6'}]
    }
  };

  simState={t:0, trait:'color', hoveredCombo:null, showDNA:false};

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧬 الجينات والصفات</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:3px;margin-bottom:6px">
      <button class="ctrl-btn on" id="bgt1" style="width:100%;background:rgba(44,58,74,0.3);border-color:rgba(44,58,74,0.6);color:#AAA">💇 لون الشعر</button>
      <button class="ctrl-btn" id="bgt2" style="width:100%;background:rgba(39,174,96,0.2);border-color:rgba(39,174,96,0.5);color:#27AE60">📏 الطول</button>
      <button class="ctrl-btn" id="bgt3" style="width:100%;background:rgba(142,68,173,0.2);border-color:rgba(142,68,173,0.5);color:#8E44AD">👅 طيّ اللسان</button>
    </div>
    <button class="ctrl-btn" id="bgtDNA" style="width:100%;margin-bottom:4px;background:rgba(26,143,168,0.2);border-color:rgba(26,143,168,0.5);color:#1A8FA8">🔬 أظهر الحمض النووي</button>
    <div class="info-box" id="genInfo">اضغط على تركيب جيني لمعرفة نتيجته</div>
    <div class="q-box"><strong>❓ أسئلة الكتاب (ص٧٤):</strong><br>١- ما الفرق بين الجين والكروموسوم؟<br>٢- أين يوجد الحمض النووي في الخليّة؟
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- الجين: تعليمة وراثيّة واحدة. الكروموسوم: يحتوي آلاف الجينات.<br>٢- في نواة الخليّة.</div>
  </div>
  `);

  function setTrait(key){
    simState.trait=key; simState.hoveredCombo=null;
    ['bgt1','bgt2','bgt3'].forEach(id=>document.getElementById(id).classList.remove('on'));
    document.getElementById('genInfo').innerHTML=`<strong>${traits[key].label}</strong>: اضغط على تركيب جيني`;
    U9Sound.ping(440,0.2,0.15);
  }
  btn('bgt1',()=>{document.getElementById('bgt1').classList.add('on');setTrait('color');});
  btn('bgt2',()=>{document.getElementById('bgt2').classList.add('on');setTrait('height');});
  btn('bgt3',()=>{document.getElementById('bgt3').classList.add('on');setTrait('tongue');});
  btn('bgtDNA',()=>{simState.showDNA=!simState.showDNA; U9Sound.ping(440,0.2,0.15);});

  const canvas=document.getElementById('simCanvas');
  canvas.onclick=function(ev){
    const rect=canvas.getBoundingClientRect();
    const mx=ev.clientX-rect.left,my=ev.clientY-rect.top;
    const w=canvas.width,h=canvas.height;
    const tr=traits[simState.trait];
    const comboW=Math.min((w-20)/tr.combos.length - 6, w*0.13);
    const totalComboW=(comboW+6)*tr.combos.length;
    const comboStartX=(w-totalComboW)/2+comboW/2;
    const comboAreaY=h*0.55;
    const bh=Math.min(h*0.32, h-comboAreaY-30);
    tr.combos.forEach((co,i)=>{
      const cx=comboStartX+i*(comboW+6);
      const cy=comboAreaY;
      if(Math.abs(mx-cx)<comboW/2 && my>=cy && my<=cy+bh){
        simState.hoveredCombo=i;
        document.getElementById('genInfo').innerHTML=`<strong style="color:${co.col}">${co.g}</strong>: ${co.res}`;
        U9Sound.ping(400+i*30,0.2,0.15);
      }
    });
  };


  function draw(){
    if(currentSim!=='genetics'||currentTab!==0) return;
    const c=ctx(),w=W(),h=H(); simState.t++;
    const t=simState.t;
    const tr=traits[simState.trait];

    const bg=c.createLinearGradient(0,0,w,h);
    bg.addColorStop(0,'#FCE4EC'); bg.addColorStop(1,'#E3F2FD');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.042)}px Tajawal`; c.textAlign='center';
    c.fillText('الجينات تحدِّد: '+tr.label,w/2,28);

    if(simState.showDNA){
      // DNA helix visualization
      const hx=w*0.18, hy=h*0.35, hH=h*0.5;
      c.fillStyle='#5A6A7A'; c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
      c.fillText('الحمض النووي DNA',hx,hy-14);
      for(let i=0;i<24;i++){
        const py=hy+i*(hH/24);
        const s1x=hx+Math.sin(i*0.65+t*0.04)*22;
        const s2x=hx-Math.sin(i*0.65+t*0.04)*22;
        const cols1=['#E74C3C','#3498DB','#27AE60','#F39C12'];
        c.beginPath(); c.arc(s1x,py,3.5,0,Math.PI*2);
        c.fillStyle=cols1[i%4]; c.fill();
        c.beginPath(); c.arc(s2x,py,3.5,0,Math.PI*2);
        c.fillStyle=cols1[(i+2)%4]; c.fill();
        c.strokeStyle='rgba(0,0,0,0.12)'; c.lineWidth=1;
        c.beginPath(); c.moveTo(s1x,py); c.lineTo(s2x,py); c.stroke();
      }
      c.strokeStyle='rgba(52,152,219,0.35)'; c.lineWidth=1.5; c.setLineDash([3,3]);
      c.beginPath();
      for(let i=0;i<=24;i++){const py=hy+i*(hH/24);const sx=hx+Math.sin(i*0.65+t*0.04)*22;i===0?c.moveTo(sx,py):c.lineTo(sx,py);}
      c.stroke(); c.setLineDash([]);

      // Arrow pointing to a segment
      const highlightY=hy+8*(hH/24);
      c.fillStyle='rgba(231,76,60,0.85)'; c.beginPath(); c.roundRect(hx+30,highlightY-12,80,24,12); c.fill();
      c.fillStyle='white'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
      c.fillText('هذا جين!',hx+70,highlightY+5);
      c.strokeStyle='#E74C3C'; c.lineWidth=2;
      c.beginPath(); c.moveTo(hx+28,highlightY); c.lineTo(hx+10,highlightY); c.stroke();
    }

    // Alleles section — fixed contrast + sizing
    const alL=simState.showDNA?w*0.42:w*0.08;
    const alW=w*0.9-alL;
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='right';
    c.fillText('الأليلات:',w-12,h*0.11);
    tr.alleles.forEach((al,i)=>{
      const ay=h*0.17+i*h*0.1;
      // Bar background (slightly lighter to ensure contrast)
      c.fillStyle=al.col+'EE'; c.beginPath(); c.roundRect(alL,ay-16,alW,32,10); c.fill();
      // Darker left badge with symbol
      c.fillStyle='rgba(0,0,0,0.25)'; c.beginPath(); c.roundRect(alL,ay-16,50,32,[10,0,0,10]); c.fill();
      c.fillStyle='white'; c.font=`bold ${Math.round(h*0.038)}px Tajawal`; c.textAlign='center';
      c.fillText(al.s,alL+25,ay+6);
      // Name + dominance on right
      const domLabel=al.dom?'(سائد 👑)':'(متنحٍّ)';
      c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='right';
      c.fillText(`${al.name} ${domLabel}`,alL+alW-10,ay+6);
    });

    // Combos — fixed sizing to fit canvas
    const comboAreaY=h*0.55;
    const comboW=Math.min((w-20)/tr.combos.length - 6, w*0.13);
    const totalComboW=(comboW+6)*tr.combos.length;
    const comboStartX=(w-totalComboW)/2+comboW/2;
    const bh=Math.min(h*0.32, h-comboAreaY-30);

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
    c.fillText('اضغط على تركيب جيني:',w/2,comboAreaY-12);

    tr.combos.forEach((co,i)=>{
      const cx=comboStartX+i*(comboW+6);
      const cy=comboAreaY;
      const sel=simState.hoveredCombo===i;
      const pulse=sel?Math.sin(t*0.12)*4:0;
      // Card
      c.fillStyle=sel?co.col:co.col+'CC';
      c.beginPath(); c.roundRect(cx-comboW/2,cy+pulse,comboW,bh,12); c.fill();
      if(sel){c.strokeStyle='#FFD700';c.lineWidth=3;c.stroke();}
      // Gene label — large
      c.fillStyle='white'; c.font=`bold ${Math.round(Math.min(h*0.048,comboW*0.35))}px Tajawal`; c.textAlign='center';
      c.fillText(co.g,cx,cy+bh*0.38+pulse);
      // Result — wrapped
      c.font=`${Math.round(h*0.026)}px Tajawal`;
      const res=co.res; const half=Math.ceil(res.length/2);
      if(res.length>5){
        const sp=res.lastIndexOf(' ',half);
        const br=sp>0?sp:half;
        c.fillText(res.substring(0,br),cx,cy+bh*0.6+pulse);
        c.fillText(res.substring(br),cx,cy+bh*0.76+pulse);
      } else {
        c.fillText(res,cx,cy+bh*0.62+pulse);
      }
      if(sel){
        c.fillStyle='rgba(255,255,255,0.85)'; c.beginPath(); c.roundRect(cx-comboW/2+2,cy+bh-20+pulse,comboW-4,18,[0,0,10,10]); c.fill();
        c.fillStyle=co.col; c.font=`bold ${Math.round(h*0.022)}px Tajawal`;
        c.fillText('✓ مختار',cx,cy+bh-6+pulse);
      }
    });

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 10-8 TAB 2 — انتقال الجينات (مربع بانيت تفاعلي)
// ══════════════════════════════════════════════════════════
function simGenetics2() {
  const geneOptions=['B','b','T','t','R','r'];
  const geneColors={B:'#2C3A4A',b:'#F4D03F',T:'#27AE60',t:'#E67E22',R:'#8E44AD',r:'#95A5A6'};
  const geneNames={B:'أسود',b:'أشقر',T:'طويل',t:'قصير',R:'يطوي',r:'لا يطوي'};
  const geneDom={B:true,b:false,T:true,t:false,R:true,r:false};

  simState={t:0,fGene:'B',mGene:'b',offspring:[],spinStart:0,punnetMode:false};

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">👨‍👩‍👧 انتقال الجينات</div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">جين الأب 👨:</div>
      <div style="display:flex;flex-wrap:wrap;gap:3px">
        ${geneOptions.map(g=>`<button class="ctrl-btn" id="fg_${g}"
          style="flex:1;min-width:30px;background:${geneColors[g]}33;border-color:${geneColors[g]}77;color:${geneColors[g]};font-weight:800;font-size:16px"
          onclick="(function(){simState.fGene='${g}';U9Sound.ping(440,0.18,0.12);})()">
          ${g}
        </button>`).join('')}
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">جين الأم 👩:</div>
      <div style="display:flex;flex-wrap:wrap;gap:3px">
        ${geneOptions.map(g=>`<button class="ctrl-btn" id="mg_${g}"
          style="flex:1;min-width:30px;background:${geneColors[g]}33;border-color:${geneColors[g]}77;color:${geneColors[g]};font-weight:800;font-size:16px"
          onclick="(function(){simState.mGene='${g}';U9Sound.ping(440,0.18,0.12);})()">
          ${g}
        </button>`).join('')}
      </div>
    </div>
    <div style="display:flex;gap:6px;margin:6px 0">
      <button class="ctrl-btn" id="btnInherit" style="flex:2;background:rgba(231,76,60,0.2);border-color:rgba(231,76,60,0.5);color:#E74C3C;font-weight:800">🧬 أنتج جيلاً!</button>
      <button class="ctrl-btn" id="btnPunnet" style="flex:1;background:rgba(52,152,219,0.2);border-color:rgba(52,152,219,0.5);color:#3498DB;font-size:12px">مربع بانيت</button>
    </div>
    <div class="info-box" id="gen2Info">اختر جيناتهما ثم أنتج جيلاً جديداً</div>
    <div class="q-box"><strong>❓ ص٧٧:</strong> إذا كان الأب (Bb) والأم (Bb) — ما احتمالات ألوان شعر الأبناء؟
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
    <div class="q-ans-panel">BB (25%) شعر داكن — Bb (50%) شعر داكن — bb (25%) شعر فاتح.<br>النتيجة: 75% داكن، 25% فاتح.</div>
  </div>
  `);

  btn('btnInherit',()=>{
    const f=simState.fGene, m=simState.mGene;
    simState.offspring=[
      {g:f+f,fromF:f,fromM:f},{g:f+m,fromF:f,fromM:m},
      {g:m+f,fromF:m,fromM:f},{g:m+m,fromF:m,fromM:m}
    ];
    simState.spinStart=simState.t; simState.punnetMode=false;
    U9Sound.ping(523,0.25,0.2);
    const fc=geneColors[f]||'#3498DB',mc=geneColors[m]||'#E74C3C';
    document.getElementById('gen2Info').innerHTML=
      `<strong style="color:${fc}">${f}=${geneNames[f]||''}</strong> × <strong style="color:${mc}">${m}=${geneNames[m]||''}</strong> → أربعة احتمالات`;
  });
  btn('btnPunnet',()=>{ simState.punnetMode=!simState.punnetMode; U9Sound.ping(440,0.2,0.15); });

  function draw(){
    if(currentSim!=='genetics'||currentTab!==1) return;
    const c=ctx(),w=W(),h=H(); simState.t++;
    const t=simState.t;
    const gc=geneColors,gn=geneNames;

    const bg=c.createLinearGradient(0,0,w,h);
    bg.addColorStop(0,'#E8F5E9'); bg.addColorStop(1,'#E8EAF6');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.042)}px Tajawal`; c.textAlign='center';
    c.fillText('انتقال الجينات من الآباء إلى الأبناء',w/2,28);

    const fCol=gc[simState.fGene]||'#3498DB';
    const mCol=gc[simState.mGene]||'#E74C3C';

    if(simState.punnetMode && simState.offspring.length>0){
      // Punnett square
      const sq=Math.min(w*0.55,h*0.55), sx=w*0.22, sy=h*0.18;
      const cell=sq/2;
      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.038)}px Tajawal`; c.textAlign='center';
      c.fillText('مربع بانيت',w/2,sy-16);

      // Headers
      c.fillStyle=fCol; c.font=`bold ${Math.round(h*0.05)}px Tajawal`;
      c.fillText(simState.fGene,sx+cell*0.5,sy-4);
      c.fillText(simState.fGene,sx+cell*1.5,sy-4);
      c.fillStyle=mCol;
      c.save(); c.translate(sx-12,sy+cell*0.5); c.rotate(-Math.PI/2); c.fillText(simState.mGene,0,0); c.restore();
      c.save(); c.translate(sx-12,sy+cell*1.5); c.rotate(-Math.PI/2); c.fillText(simState.mGene,0,0); c.restore();

      simState.offspring.forEach((off,i)=>{
        const col2=i%2, row2=Math.floor(i/2);
        const cx=sx+col2*cell, cy=sy+row2*cell;
        c.fillStyle=gc[off.fromF]||'#888';
        c.beginPath(); c.rect(cx,cy,cell,cell); c.fill();
        c.fillStyle='rgba(255,255,255,0.08)'; c.fillRect(cx,cy,cell/2,cell);
        c.strokeStyle='rgba(255,255,255,0.3)'; c.lineWidth=1.5; c.strokeRect(cx,cy,cell,cell);
        c.fillStyle='white'; c.font=`bold ${Math.round(h*0.05)}px Tajawal`; c.textAlign='center';
        c.fillText(off.g,cx+cell/2,cy+cell*0.55);
        c.font=`${Math.round(h*0.025)}px Tajawal`;
        c.fillText(gn[off.fromF]||'',cx+cell/2,cy+cell*0.78);
      });

    } else {
      // Parent avatars
      [[w*0.18,h*0.28,fCol,simState.fGene,'👨','الأب'],[w*0.82,h*0.28,mCol,simState.mGene,'👩','الأم']].forEach(([px,py,col,gene,avatar,label])=>{
        c.fillStyle=col+'55'; c.beginPath(); c.arc(px,py,40,0,Math.PI*2); c.fill();
        c.strokeStyle=col; c.lineWidth=2.5; c.stroke();
        c.font=`${Math.round(h*0.08)}px serif`; c.textAlign='center'; c.fillText(avatar,px,py+10);
        c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.032)}px Tajawal`;
        c.fillText(label+': '+gene,px,py+58);
        c.fillStyle='#7A8A98'; c.font=`${Math.round(h*0.025)}px Tajawal`;
        c.fillText(gn[gene]||'',px,py+74);
        // Gene bubble
        c.fillStyle=col; c.beginPath(); c.arc(px,py-45,16,0,Math.PI*2); c.fill();
        c.fillStyle='white'; c.font=`bold ${Math.round(h*0.04)}px Tajawal`;
        c.fillText(gene,px,py-39);
      });

      // Arrow / lines
      c.strokeStyle='rgba(0,0,0,0.15)'; c.lineWidth=2;
      c.beginPath(); c.moveTo(w*0.22,h*0.32); c.quadraticCurveTo(w/2,h*0.26,w/2,h*0.5); c.stroke();
      c.beginPath(); c.moveTo(w*0.78,h*0.32); c.quadraticCurveTo(w/2,h*0.26,w/2,h*0.5); c.stroke();
      c.fillStyle='rgba(0,0,0,0.3)'; c.font=`${Math.round(h*0.027)}px Tajawal`; c.textAlign='center';
      c.fillText('نصف من كل أب',w/2,h*0.48);

      if(simState.offspring.length>0){
        c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.035)}px Tajawal`; c.textAlign='center';
        c.fillText('الأبناء المحتملون (الاحتماليّة ٢٥٪ لكل):',w/2,h*0.55);
        simState.offspring.forEach((off,i)=>{
          const ox=w*0.12+i*(w*0.2), oy=h*0.66;
          const delay=Math.max(0,(t-(simState.spinStart||0)-i*8));
          const scale=Math.min(1,delay/20);
          c.save(); c.translate(ox+w*0.09,oy); c.scale(scale,scale);
          const fc2=gc[off.fromF]||'#3498DB',mc2=gc[off.fromM]||'#E74C3C';
          c.beginPath(); c.arc(0,0,28,Math.PI,2*Math.PI); c.fillStyle=fc2; c.fill();
          c.beginPath(); c.arc(0,0,28,0,Math.PI); c.fillStyle=mc2; c.fill();
          c.strokeStyle='rgba(255,255,255,0.3)'; c.lineWidth=1.5;
          c.beginPath(); c.moveTo(-28,0); c.lineTo(28,0); c.stroke();
          c.beginPath(); c.arc(0,0,28,0,Math.PI*2); c.strokeStyle='rgba(0,0,0,0.15)'; c.lineWidth=2; c.stroke();
          c.fillStyle='white'; c.font=`bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign='center';
          c.fillText(off.g,0,8);
          c.restore();
          if(scale>0.7){
            c.fillStyle='#5A6A7A'; c.font=`${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
            c.fillText(gn[off.fromF]||'',ox+w*0.09,oy+40);
          }
        });
      } else {
        c.fillStyle='#7A8A98'; c.font=`${Math.round(h*0.036)}px Tajawal`; c.textAlign='center';
        c.fillText('اضغط "أنتج جيلاً" لمشاهدة الأبناء',w/2,h*0.65);
      }
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){}});
  }
  draw();
}





function simStaticElec3(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  if(!simState.se3) simState.se3={
    t:0,
    phase:'intro',          // 'intro' → 'charging' → 'charge1' → 'charge2' → 'test'
    rod1Charged:false,
    rod2Charged:false,
    rod2Type:'same',
    rod2X:0.84, rod2Y:0.44,
    drag:false, ox:0, oy:0,
    deflect:0,
    charge1:0, charge2:0,
    clothX:0.72, clothY:0.42,
    clothDrag:false, clothOx:0, clothOy:0,
    rubCount:0,
    rubSparks:[],
    rubAnim:0,
    showResult:false
  };
  const S=simState.se3;
  let w=cv.width, h=cv.height;

  /* ── Controls panel ── */
  function updateControls(){
    const chargeBar = S.charge1>0
      ? `<div style="margin:6px 0;background:#eee;border-radius:6px;height:8px;overflow:hidden">
           <div style="width:${Math.round(S.charge1/3*100)}%;height:100%;background:linear-gradient(90deg,#8E44AD,#A04DC0);border-radius:6px;transition:width 0.3s"></div>
         </div>
         <div style="font-size:11px;color:#8E44AD;text-align:center">${['','شحنة ضعيفة ⚡','شحنة جيدة ⚡⚡','مشحون بالكامل! ⚡⚡⚡'][S.charge1]}</div>`
      : '';
    controls(`
      <div class="ctrl-section">
        <div class="ctrl-label">📏 التنافر الكهربائي</div>
        <div style="font-size:12.5px;color:#555;line-height:1.8;margin:4px 0">
          ${S.phase==='intro'||S.phase==='charging'?'<b>الخطوة 1:</b> اسحب القماش واحكّه على القضيب لشحنه':''}
          ${S.phase==='charge1'?'✅ القضيب المعلق جاهز — اختر القضيب الثاني':''}
          ${S.phase==='rubrod2'?'<b>الخطوة 2:</b> اسحب قطعة الصوف واحكّها على قضيب الزجاج لشحنه موجباً ➕':''}
          ${S.phase==='charge2'||S.phase==='test'?'<b>الخطوة 2:</b> اسحب القضيب الثاني نحو المعلق':''}
        </div>
        ${chargeBar}
      </div>
      ${S.phase==='charge1'?`
      <div class="ctrl-label" style="margin-top:8px">اختر القضيب الثاني:</div>
      <button class="ctrl-btn" onclick="simState.se3.rod2Type='same';simState.se3.phase='charge2';simState.se3.rod2Charged=true;simState.se3.charge2=3;simState.se3.rod2X=0.82;simState.se3.rod2Y=0.46;window._se3UpdateControls&&window._se3UpdateControls()">
        🟫 بلاستيك (سالب ➖)
      </button>
      <button class="ctrl-btn" style="margin-top:4px" onclick="simState.se3.rod2Type='diff';simState.se3.phase='rubrod2';simState.se3.rod2Charged=false;simState.se3.charge2=0;simState.se3.rod2X=0.82;simState.se3.rod2Y=0.46;simState.se3.woolX=0.62;simState.se3.woolY=0.46;simState.se3.woolDrag=false;simState.se3.woolRubCount=0;window._se3UpdateControls&&window._se3UpdateControls()">
        🔲 زجاج (موجب ➕)
      </button>
      `:''}
      ${S.phase==='rubrod2'?`
      <div style="margin:6px 0;background:#eee;border-radius:6px;height:8px;overflow:hidden">
        <div style="width:${Math.round((S.charge2||0)/3*100)}%;height:100%;background:linear-gradient(90deg,#1A5276,#2E86C1);border-radius:6px;transition:width 0.3s"></div>
      </div>
      <div style="font-size:11px;color:#2E86C1;text-align:center">${['','شحنة ضعيفة ⚡','شحنة جيدة ⚡⚡','مشحون بالكامل! ⚡⚡⚡'][Math.min(3,Math.floor(S.charge2||0))]}</div>
      `:''}
      ${S.phase==='charge2'||S.phase==='test'?`
      <div class="info-box" style="font-size:12.5px;line-height:2;margin-top:6px">
        القضيب المعلق: <strong style="color:#8E44AD">➖ سالب</strong><br>
        القضيب الثاني: <strong style="color:${S.rod2Type==='same'?'#8E44AD':'#C0392B'}">${S.rod2Type==='same'?'➖ سالب (بلاستيك)':'➕ موجب (زجاج)'}</strong><br>
        ${S.rod2Type==='same'?'<span style="color:#C0392B">➖ + ➖ = تنافر 💥</span>':'<span style="color:#27AE60">➖ + ➕ = تجاذب ❤️</span>'}
      </div>
      `:''}
      <button class="ctrl-btn reset" style="margin-top:8px" onclick="simState.se3=null;simStaticElec3()">↺ إعادة</button>
      <div class="q-box" style="margin-top:8px">
        <strong>❓ ماذا يحدث لو اقتربنا بقضيبين من نفس النوع؟</strong>
        <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
        <div class="q-ans-panel">يتنافران — لأن الشحنات المتشابهة تتنافر. القضيب المعلق يبتعد عن القضيب المقترب.</div>
      </div>
    `);
    window._se3UpdateControls=updateControls;
  }
  updateControls();

  /* ── Pointer helpers ── */
  function gp(e){
    const r=cv.getBoundingClientRect(), sc=cv.width/r.width;
    const s=(e.changedTouches&&e.changedTouches[0])||(e.touches&&e.touches[0])||e;
    return{x:(s.clientX-r.left)*sc, y:(s.clientY-r.top)*sc};
  }
  function clothRect(){
    // cloth is slightly larger now
    return{x:S.clothX*w - w*0.10, y:S.clothY*h - h*0.08, ww:w*0.20, hh:h*0.16};
  }
  function rodRect(){
    // match new ROD1_CX=0.42, STRING_L=h*0.12, ROD_L=h*0.28
    const rx = w*0.42;
    const ry = h*0.07 + h*0.12 + h*0.14;   // topY + stringL + rodL/2
    return{x:rx - w*0.016, y:ry - h*0.14, ww:w*0.032, hh:h*0.28};
  }
  function rectsOverlap(a,b){
    return a.x<b.x+b.ww && a.x+a.ww>b.x && a.y<b.y+b.hh && a.y+a.hh>b.y;
  }
  function addSparks(n){
    const rr=rodRect();
    const cx=rr.x+rr.ww/2, cy=rr.y+rr.hh/2;
    for(let i=0;i<n;i++){
      const a=Math.random()*Math.PI*2;
      S.rubSparks.push({x:cx,y:cy,vx:Math.cos(a)*(2+Math.random()*3),vy:Math.sin(a)*(2+Math.random()*3),life:1});
    }
  }

  /* ── Pointer events for cloth + rod2 drag ── */
  let lastClothX=0, lastWoolX=0;
  function onDown(e){
    if(currentSim!=='staticelec'||currentTab!==2)return;
    const p=gp(e);
    // cloth drag (intro / charging phase)
    if(S.phase==='intro'||S.phase==='charging'){
      const cr=clothRect();
      if(p.x>cr.x&&p.x<cr.x+cr.ww&&p.y>cr.y&&p.y<cr.y+cr.hh){
        S.clothDrag=true; S.clothOx=p.x-S.clothX*w; S.clothOy=p.y-S.clothY*h;
        lastClothX=p.x; S.phase='charging';
      }
    }
    // wool drag for glass rod (rubrod2 phase)
    if(S.phase==='rubrod2'){
      const wx=(S.woolX||0.58)*w, wy=(S.woolY||0.46)*h;
      if(Math.hypot(p.x-wx,p.y-wy)<50){
        S.woolDrag=true; S.woolOx=p.x-wx; S.woolOy=p.y-wy; lastWoolX=p.x;
      }
    }
    // rod2 drag
    if(S.phase==='charge2'||S.phase==='test'){
      const rx=S.rod2X*w, ry=S.rod2Y*h;
      if(Math.hypot(p.x-rx,p.y-ry)<60){S.drag=true;S.ox=p.x-rx;S.oy=p.y-ry;}
    }
  }
  function onMove(e){
    if(currentSim!=='staticelec'||currentTab!==2)return;
    const p=gp(e);
    // cloth rubbing
    if(S.clothDrag){
      const dx=p.x-lastClothX;
      lastClothX=p.x;
      S.clothX=Math.max(0.12,Math.min(0.88,(p.x-S.clothOx)/w));
      S.clothY=Math.max(0.10,Math.min(0.80,(p.y-S.clothOy)/h));
      // check overlap with rod → count as rub
      if(rectsOverlap(clothRect(),rodRect())&&Math.abs(dx)>2){
        S.rubAnim=1;
        S.charge1=Math.min(3,S.charge1+0.03);
        if(Math.floor(S.charge1)>S.rubCount){
          S.rubCount=Math.floor(S.charge1);
          addSparks(8);
          updateControls();
        }
        if(S.charge1>=3&&S.phase==='charging'){
          S.phase='charge1'; S.rod1Charged=true; S.charge1=3;
          S.clothDrag=false;
          addSparks(18);
          updateControls();
        }
      }
    }
    // wool rubbing on glass rod
    if(S.woolDrag){
      const dx=p.x-lastWoolX; lastWoolX=p.x;
      S.woolX=Math.max(0.35,Math.min(0.92,(p.x-(S.woolOx||0))/w));
      S.woolY=Math.max(0.10,Math.min(0.78,(p.y-(S.woolOy||0))/h));
      // overlap with rod2?
      const rx=S.rod2X*w, ry=S.rod2Y*h;
      const wx=(S.woolX||0.58)*w, wy=(S.woolY||0.46)*h;
      if(Math.hypot(wx-rx,wy-ry)<w*0.10&&Math.abs(dx)>2){
        S.charge2=Math.min(3,(S.charge2||0)+0.03);
        if(Math.floor(S.charge2)>(S.woolRubCount||0)){
          S.woolRubCount=Math.floor(S.charge2);
          addSparks(8);
          updateControls();
        }
        if(S.charge2>=3&&S.phase==='rubrod2'){
          S.phase='charge2'; S.rod2Charged=true; S.charge2=3;
          S.woolDrag=false;
          addSparks(18);
          try{U9Sound.ping(520,.15,.18);}catch(_){}
          updateControls();
        }
      }
    }
    // rod2 drag
    if(S.drag){
      S.rod2X=Math.max(0.38,Math.min(0.95,(p.x-S.ox)/w));
      S.rod2Y=Math.max(0.15,Math.min(0.75,(p.y-S.oy)/h));
      S.phase='test';
    }
  }
  function onUp(){
    S.clothDrag=false;
    S.woolDrag=false;
    S.drag=false;
  }

  cv.addEventListener('mousedown',onDown);
  cv.addEventListener('mousemove',onMove);
  cv.addEventListener('mouseup',onUp);
  cv.addEventListener('touchstart',e=>{e.preventDefault();onDown(e);},{passive:false});
  cv.addEventListener('touchmove', e=>{e.preventDefault();onMove(e);},{passive:false});
  cv.addEventListener('touchend',  e=>{e.preventDefault();onUp();},{passive:false});


  /* ── Draw draggable cloth ── */
  function drawCloth(){
    if(S.phase!=='intro'&&S.phase!=='charging') return;
    const cr=clothRect();
    const wobble=S.rubAnim>0?Math.sin(S.t*25)*S.rubAnim*3:0;
    S.rubAnim=Math.max(0,S.rubAnim-0.04);
    c.save();
    c.translate(cr.x+cr.ww/2, cr.y+cr.hh/2);
    c.rotate(wobble*0.04);
    // cloth body
    const cg=c.createLinearGradient(-cr.ww/2,-cr.hh/2,cr.ww/2,cr.hh/2);
    cg.addColorStop(0,'#D4A853'); cg.addColorStop(0.5,'#B8902A'); cg.addColorStop(1,'#C8A040');
    c.fillStyle=cg;
    c.strokeStyle='#8B6914'; c.lineWidth=1.5;
    c.beginPath(); c.roundRect(-cr.ww/2,-cr.hh/2,cr.ww,cr.hh,8); c.fill(); c.stroke();
    // texture lines
    c.strokeStyle='rgba(100,70,10,0.18)'; c.lineWidth=1;
    for(let i=1;i<4;i++){
      c.beginPath(); c.moveTo(-cr.ww/2,(-cr.hh/2)+(i*cr.hh/4));
      c.lineTo(cr.ww/2,(-cr.hh/2)+(i*cr.hh/4)); c.stroke();
    }
    for(let j=1;j<4;j++){
      c.beginPath(); c.moveTo((-cr.ww/2)+(j*cr.ww/4),-cr.hh/2);
      c.lineTo((-cr.ww/2)+(j*cr.ww/4),cr.hh/2); c.stroke();
    }
    c.restore();
    // label
    c.font=`bold ${Math.min(13,w*0.027)}px Tajawal`; c.fillStyle='#5A3A10';
    c.textAlign='center'; c.textBaseline='top';
    c.fillText('قطعة قماش',cr.x+cr.ww/2,cr.y+cr.hh+4);
    // hint arrow when not overlapping rod
    if(!rectsOverlap(clothRect(),rodRect())){
      const rod1CX = w*0.42;
      const rod1MY = h*0.07 + h*0.12 + h*0.14;
      const dx = rod1CX - (cr.x+cr.ww/2);
      const dy = rod1MY - (cr.y+cr.hh/2);
      const len = Math.sqrt(dx*dx+dy*dy);
      if(len>10){
        const pulse=0.7+0.3*Math.sin(S.t*4);
        c.save();
        c.globalAlpha=pulse;
        c.strokeStyle='#8E44AD'; c.fillStyle='#8E44AD'; c.lineWidth=2; c.setLineDash([5,4]);
        c.beginPath();
        c.moveTo(cr.x+cr.ww/2,cr.y+cr.hh/2);
        c.lineTo(cr.x+cr.ww/2+dx*0.55, cr.y+cr.hh/2+dy*0.55);
        c.stroke(); c.setLineDash([]);
        c.globalAlpha=1;
        c.restore();
        c.font=`bold ${Math.min(11,w*0.023)}px Tajawal`; c.fillStyle='rgba(142,68,173,0.85)';
        c.textAlign='center';
        c.fillText('اسحب نحو القضيب واحكّه',cr.x+cr.ww/2,cr.y-14);
      }
    } else {
      // rubbing indicator
      c.font=`bold ${Math.min(12,w*0.025)}px Tajawal`; c.fillStyle='#C0392B';
      c.textAlign='center';
      const pulse=0.6+0.4*Math.sin(S.t*8);
      c.globalAlpha=pulse;
      c.fillText('↔ حرّك القماش جيئةً وذهاباً!',cr.x+cr.ww/2,cr.y-14);
      c.globalAlpha=1;
    }
  }

  /* ── Draw spark particles ── */
  function drawSparks(){
    S.rubSparks=S.rubSparks.filter(sp=>{
      sp.x+=sp.vx; sp.y+=sp.vy; sp.vy+=0.12; sp.life-=0.035;
      if(sp.life<=0) return false;
      c.save(); c.globalAlpha=sp.life;
      c.fillStyle=`hsl(${50+Math.random()*30},100%,60%)`;
      c.beginPath(); c.arc(sp.x,sp.y,2+sp.life*2,0,Math.PI*2); c.fill();
      c.restore();
      return true;
    });
  }

  /* ── Charge indicator on rod ── */
  function drawChargeGlow(){
    if(S.charge1<=0) return;
    const rod1CX=w*0.42;
    const midY=h*0.07+h*0.12+h*0.14;
    const glowR=40+S.charge1*20;
    const glow=c.createRadialGradient(rod1CX,midY,0,rod1CX,midY,glowR);
    glow.addColorStop(0,`rgba(160,77,192,${0.18*S.charge1/3})`);
    glow.addColorStop(1,'rgba(160,77,192,0)');
    c.fillStyle=glow;
    c.beginPath(); c.arc(rod1CX,midY,glowR,0,Math.PI*2); c.fill();
  }

  function draw(){
    if(currentSim!=='staticelec'||currentTab!==2)return;
    S.t+=0.04;
    w=cv.width; h=cv.height;
    c.clearRect(0,0,w,h);

    // Background
    c.fillStyle='#F5F0E8'; c.fillRect(0,0,w,h);
    U9.grid(c,w,h,'rgba(180,160,120,0.08)',40);

    // Ceiling beam — centered over hanging rod (ROD1_CX = w*0.42)
    c.fillStyle='#7A5C1E'; c.beginPath(); c.roundRect(w*0.28,h*0.04,w*0.28,h*0.04,5); c.fill();
    c.fillStyle='#9A7428'; c.beginPath(); c.roundRect(w*0.28,h*0.04,w*0.28,h*0.016,4); c.fill();
    // wood grain lines
    c.strokeStyle='rgba(80,50,10,0.15)'; c.lineWidth=1;
    for(let gi=0;gi<3;gi++){
      c.beginPath(); c.moveTo(w*0.28,h*0.048+gi*4); c.lineTo(w*0.56,h*0.048+gi*4); c.stroke();
    }

    // Title
    c.font=`bold ${Math.min(15,w*0.032)}px Tajawal`; c.fillStyle='rgba(60,40,80,0.92)';
    c.textAlign='center'; c.textBaseline='top';
    c.fillText('ملاحظة التنافر الكهربائي 📏',w/2,h*0.015);

    // Charge glow behind rod
    drawChargeGlow();

    // ═══ LAYOUT CONSTANTS ═══
    // القضيب المعلق في المنتصف تماماً، مساحة أوسع للكل
    const ROD1_CX   = w * 0.42;   // مركز القضيب المعلق أفقياً
    const ROD1_TOPY = h * 0.07;   // نقطة التعليق
    const STRING_L  = h * 0.12;
    const ROD_L     = h * 0.28;
    const ROD_W     = Math.max(18, w * 0.032);

    // ── Compute deflection (BUG FIX) ──
    // تنافر → يبتعد عن rod2 (عكس اتجاه rod2)
    // تجاذب → يقترب من rod2 (نفس اتجاه rod2)
    let targetDeflect = 0;
    if(S.phase==='test' && S.rod1Charged && S.rod2Charged){
      const hangMidX = ROD1_CX;
      const hangMidY = ROD1_TOPY + STRING_L + ROD_L * 0.5;
      const dist = Math.hypot(S.rod2X*w - hangMidX, S.rod2Y*h - hangMidY);
      const maxDist = w * 0.38;
      const prox = Math.max(0, 1 - dist/maxDist);
      // dir: +1 = rod2 is to the RIGHT of hanging rod → repulsion deflects LEFT (negative), attraction deflects RIGHT (positive)
      const dir = (S.rod2X*w > ROD1_CX) ? 1 : -1;
      if(S.rod2Type === 'same'){
        // تنافر: يبتعد عن rod2 → عكس dir
        targetDeflect = -dir * prox * 0.60;
      } else {
        // تجاذب: يقترب من rod2 → نفس dir
        targetDeflect = dir * prox * 0.50;
      }
    }
    S.deflect += (targetDeflect - S.deflect) * 0.08;

    // ── Hanging rod ──
    // (rewritten inline to use new layout constants)
    {
      const pivX = ROD1_CX, pivY = ROD1_TOPY;
      const strEndX = pivX + Math.sin(S.deflect) * STRING_L;
      const strEndY = pivY + Math.cos(S.deflect) * STRING_L;
      // ceiling hook dot
      c.fillStyle='#6B5030'; c.beginPath(); c.arc(pivX, pivY, 5, 0, Math.PI*2); c.fill();
      // string
      c.strokeStyle='rgba(80,60,40,0.75)'; c.lineWidth=2;
      c.beginPath(); c.moveTo(pivX,pivY); c.lineTo(strEndX,strEndY); c.stroke();
      // rod body
      c.save(); c.translate(strEndX, strEndY + ROD_L/2); c.rotate(S.deflect);
      const rg = c.createLinearGradient(-ROD_W/2,0,ROD_W/2,0);
      if(S.rod1Charged){
        rg.addColorStop(0,'#6C3483'); rg.addColorStop(0.5,'#9B59B6'); rg.addColorStop(1,'#6C3483');
      } else {
        rg.addColorStop(0,'#7D6448'); rg.addColorStop(0.5,'#A08060'); rg.addColorStop(1,'#7D6448');
      }
      c.fillStyle=rg;
      c.beginPath(); c.roundRect(-ROD_W/2,-ROD_L/2,ROD_W,ROD_L,6); c.fill();
      c.strokeStyle=S.rod1Charged?'#4A235A':'#5D4A30'; c.lineWidth=2; c.stroke();
      if(S.rod1Charged){
        c.font=`bold ${Math.min(15,w*0.030)}px Arial`; c.textAlign='center'; c.fillStyle='rgba(255,255,255,0.9)';
        for(let i=0;i<5;i++) c.fillText('➖',0,-ROD_L*0.38+i*(ROD_L*0.19));
      }
      c.restore();
      // label above ceiling
      c.font=`bold ${Math.min(13,w*0.026)}px Tajawal`;
      c.fillStyle = S.rod1Charged ? '#6C3483' : '#5D4A30';
      c.textAlign='center'; c.textBaseline='bottom';
      c.fillText(S.rod1Charged ? 'قضيب بلاستيك ➖ مشحون' : 'قضيب بلاستيك (محايد)', pivX, pivY - 8);
    }

    // ── Cloth (draggable) ──
    drawCloth();
    drawSparks();

    // ── Charge progress bar on canvas ──
    if((S.phase==='intro'||S.phase==='charging') && S.charge1>0){
      const bw=w*0.34, bx=(w-bw)/2, by=h*0.90, bh=14;
      // track
      c.fillStyle='rgba(180,160,130,0.35)'; c.beginPath(); c.roundRect(bx,by,bw,bh,7); c.fill();
      // fill
      const pg=c.createLinearGradient(bx,0,bx+bw,0);
      pg.addColorStop(0,'#7D3C98'); pg.addColorStop(1,'#D07AFF');
      c.fillStyle=pg;
      c.beginPath(); c.roundRect(bx,by,bw*(S.charge1/3),bh,7); c.fill();
      // label
      c.font=`bold ${Math.min(13,w*0.027)}px Tajawal`; c.fillStyle='#7D3C98';
      c.textAlign='center'; c.textBaseline='bottom';
      c.fillText(`⚡ مستوى الشحن ${['','▮▯▯','▮▮▯','▮▮▮'][Math.floor(S.charge1)]||''}`, w/2, by-4);
    }

    // ── Rod2 (draggable) ──
    if(S.phase==='rubrod2'||S.phase==='charge2'||S.phase==='test'){
      // draw rod2 using new layout proportions
      {
        const rx=S.rod2X*w, ry=S.rod2Y*h;
        const type=S.rod2Type;
        c.save(); c.translate(rx,ry); c.rotate(Math.PI/2);
        const rg2=c.createLinearGradient(-ROD_W/2,0,ROD_W/2,0);
        if(type==='same'){
          rg2.addColorStop(0,'#6C3483'); rg2.addColorStop(0.5,'#9B59B6'); rg2.addColorStop(1,'#6C3483');
        } else {
          rg2.addColorStop(0,'#154360'); rg2.addColorStop(0.5,'#2E86C1'); rg2.addColorStop(1,'#154360');
        }
        c.fillStyle=rg2;
        c.beginPath(); c.roundRect(-ROD_W/2,-ROD_L/2,ROD_W,ROD_L,6); c.fill();
        c.strokeStyle=type==='same'?'#4A235A':'#1A5276'; c.lineWidth=2; c.stroke();
        // charge symbols
        c.font=`bold ${Math.min(15,w*0.030)}px Arial`; c.textAlign='center'; c.fillStyle='rgba(255,255,255,0.9)';
        const sym=type==='same'?'➖':'➕';
        for(let i=0;i<5;i++) c.fillText(sym,0,-ROD_L*0.38+i*(ROD_L*0.19));
        c.restore();
        // label below
        const lbl=type==='same'?'بلاستيك ➖':'زجاج ➕';
        c.font=`bold ${Math.min(13,w*0.026)}px Tajawal`;
        c.fillStyle=type==='same'?'#6C3483':'#2E86C1';
        c.textAlign='center'; c.textBaseline='top';
        c.fillText(lbl, rx, ry+ROD_L*0.55);
        // drag handle hint (pulse)
        if(S.phase==='charge2'){
          const pulse=0.5+0.5*Math.sin(S.t*5);
          c.save(); c.globalAlpha=pulse;
          c.font=`bold ${Math.min(13,w*0.027)}px Tajawal`;
          c.fillStyle='#C0392B'; c.textAlign='center'; c.textBaseline='bottom';
          c.fillText('← اسحب نحو القضيب المعلق', rx, ry-ROD_L*0.55-4);
          c.restore();
        }

        // ── Wool rubbing for glass rod (rubrod2 phase) ──
        if(S.phase==='rubrod2'){
          if(S.woolX===undefined){ S.woolX=0.58; S.woolY=0.46; S.woolDrag=false; S.woolRubCount=0; }
          const wx=S.woolX*w, wy=S.woolY*h;
          const woolW=w*0.10, woolH=h*0.09;

          // Draw wool piece
          c.save();
          c.fillStyle='#D4AC90';
          c.beginPath(); c.roundRect(wx-woolW/2, wy-woolH/2, woolW, woolH, 8); c.fill();
          c.strokeStyle='#A0785A'; c.lineWidth=1.5; c.stroke();
          // wool texture lines
          c.strokeStyle='rgba(120,80,40,0.35)'; c.lineWidth=1;
          for(let wi=1;wi<4;wi++){
            c.beginPath(); c.moveTo(wx-woolW/2+wi*woolW/4, wy-woolH/2);
            c.lineTo(wx-woolW/2+wi*woolW/4, wy+woolH/2); c.stroke();
          }
          c.font=`bold ${Math.min(11,w*0.022)}px Tajawal`; c.fillStyle='#7A5030';
          c.textAlign='center'; c.textBaseline='top';
          c.fillText('صوف 🧶', wx, wy+woolH/2+4);

          // hint arrow toward glass rod
          const nearRod = Math.hypot(wx-rx, wy-ry) < w*0.18;
          if(!nearRod){
            const dx2=rx-wx, dy2=ry-wy, len2=Math.hypot(dx2,dy2)||1;
            const pulse=0.6+0.4*Math.sin(S.t*4);
            c.globalAlpha=pulse;
            c.strokeStyle='#2E86C1'; c.lineWidth=2; c.setLineDash([5,4]);
            c.beginPath(); c.moveTo(wx,wy); c.lineTo(wx+dx2*0.5,wy+dy2*0.5); c.stroke();
            c.setLineDash([]); c.globalAlpha=1;
            c.font=`bold ${Math.min(11,w*0.023)}px Tajawal`; c.fillStyle='rgba(46,134,193,0.9)';
            c.textAlign='center'; c.textBaseline='bottom';
            c.fillText('اسحب الصوف واحكّه على الزجاج', wx, wy-woolH/2-4);
          } else {
            // rubbing animation
            const pulse=0.6+0.4*Math.sin(S.t*8);
            c.globalAlpha=pulse;
            c.font=`bold ${Math.min(12,w*0.025)}px Tajawal`; c.fillStyle='#C0392B';
            c.textAlign='center'; c.textBaseline='bottom';
            c.fillText('↔ حرّك الصوف جيئةً وذهاباً!', wx, wy-woolH/2-4);
            c.globalAlpha=1;
          }
          c.restore();

          // charge progress bar on canvas
          if((S.charge2||0)>0){
            const bw=w*0.34, bx2=(w-bw)/2, by2=h*0.90, bh2=14;
            c.fillStyle='rgba(180,160,130,0.35)'; c.beginPath(); c.roundRect(bx2,by2,bw,bh2,7); c.fill();
            const pg=c.createLinearGradient(bx2,0,bx2+bw,0);
            pg.addColorStop(0,'#1A5276'); pg.addColorStop(1,'#5DADE2');
            c.fillStyle=pg; c.beginPath(); c.roundRect(bx2,by2,bw*((S.charge2||0)/3),bh2,7); c.fill();
            c.font=`bold ${Math.min(13,w*0.027)}px Tajawal`; c.fillStyle='#1A5276';
            c.textAlign='center'; c.textBaseline='bottom';
            c.fillText(`⚡ مستوى الشحن ${['','▮▯▯','▮▮▯','▮▮▮'][Math.min(3,Math.floor(S.charge2||0))]||''}`, w/2, by2-4);
          }
        }
      }

      // ── Force field & result ──
      const hangMidX2 = ROD1_CX + Math.sin(S.deflect)*(STRING_L + ROD_L*0.5);
      const hangMidY2 = ROD1_TOPY + Math.cos(S.deflect)*(STRING_L + ROD_L*0.5);
      const rod2cx = S.rod2X*w, rod2cy = S.rod2Y*h;
      const dist2 = Math.hypot(rod2cx - hangMidX2, rod2cy - hangMidY2);
      const maxDist2 = w*0.40;
      const prox2 = Math.max(0, 1 - dist2/maxDist2);

      if(prox2>0.12 && S.phase==='test'){
        const same = S.rod2Type==='same';
        const baseCol = same ? '#C0392B' : '#27AE60';
        const label = same ? '💥 تنافر!' : '❤️ تجاذب!';

        // dashed force arc
        c.strokeStyle = same
          ? `rgba(192,57,43,${0.35+prox2*0.5})`
          : `rgba(39,174,96,${0.35+prox2*0.5})`;
        c.lineWidth = 2.5 + prox2*3.5;
        c.setLineDash([6,5]);
        c.beginPath();
        c.moveTo(hangMidX2, hangMidY2);
        const mcx = (hangMidX2+rod2cx)/2;
        const mcy = Math.min(hangMidY2, rod2cy) - h*0.10;
        c.quadraticCurveTo(mcx, mcy, rod2cx, rod2cy);
        c.stroke(); c.setLineDash([]);

        // force label on arc midpoint
        c.font=`bold ${Math.min(18,w*0.038)}px Tajawal`;
        c.fillStyle=baseCol;
        c.textAlign='center'; c.textBaseline='middle';
        c.fillText(label, mcx, mcy - 12);

        // big result banner at bottom
        if(prox2>0.35){
          const bw2=w*0.72, bx3=(w-bw2)/2, by3=h*0.83;
          c.fillStyle=same?'rgba(192,57,43,0.09)':'rgba(39,174,96,0.09)';
          c.strokeStyle=same?'rgba(192,57,43,0.45)':'rgba(39,174,96,0.45)'; c.lineWidth=2;
          c.beginPath(); c.roundRect(bx3,by3,bw2,h*0.11,12); c.fill(); c.stroke();
          c.font=`bold ${Math.min(15,w*0.031)}px Tajawal`;
          c.fillStyle=same?'#922B21':'#1A7A40';
          c.textAlign='center'; c.textBaseline='middle';
          c.fillText(
            same ? 'الشحنات المتشابهة  ➖ + ➖  تتنافر 💥'
                 : 'الشحنات المختلفة  ➖ + ➕  تتجاذب ❤️',
            w/2, by3+h*0.055
          );
        }
      }
    }

    // ── Hint text ──
    const hint = S.phase==='charge1' ? 'اختر نوع القضيب الثاني من القائمة على اليسار ←' :
                 S.phase==='rubrod2' ? 'اسحب قطعة الصوف واحكّها على قضيب الزجاج لشحنه 🧶' :
                 S.phase==='charge2' ? 'اسحب القضيب نحو القضيب المعلق 👈' :
                 (S.phase==='test' && Math.abs(S.deflect)<0.02) ? 'قرّب القضيب أكثر لترى التأثير' : '';
    if(hint){
      c.font=`${Math.min(13,w*0.027)}px Tajawal`; c.fillStyle='rgba(100,70,30,0.55)';
      c.textAlign='center'; c.textBaseline='bottom';
      c.fillText(hint, w/2, h*0.975);
    }

    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){console.error('se3 draw error:',e);}});
  }
  draw();
}

