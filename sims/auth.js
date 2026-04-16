// بيّن — نظام المصادقة والاشتراك
// ══════════════════════════════════════════════════════════════

const _SUPA_URL = 'https://serezytdauldrfuphjxf.supabase.co';
const _SUPA_KEY = 'sb_publishable_giuJIokNaFOQ2EWCRZoCOw_1bQhvTNQ';

// ══════════════════════════════════════════════════════════════
// نظام حماية الجهاز — Device Fingerprint + Session Lock
// ══════════════════════════════════════════════════════════════
const _FP_KEY = '_bayyin_fp';

async function _getDeviceFingerprint() {
  try {
    var components = [
      navigator.userAgent || '',
      navigator.language || '',
      screen.width + 'x' + screen.height,
      screen.colorDepth || '',
      (Intl && Intl.DateTimeFormat ? Intl.DateTimeFormat().resolvedOptions().timeZone : '') || '',
      navigator.hardwareConcurrency || '',
      navigator.platform || '',
    ];
    // Canvas fingerprint
    try {
      var cv2 = document.createElement('canvas');
      var ctx2 = cv2.getContext('2d');
      ctx2.textBaseline = 'top';
      ctx2.font = '14px Arial';
      ctx2.fillStyle = '#1A8FA8';
      ctx2.fillText('bayyin-fp-2026', 2, 2);
      components.push(cv2.toDataURL());
    } catch(e2) {}
    // WebGL fingerprint
    try {
      var gl2 = document.createElement('canvas').getContext('webgl');
      if (gl2) {
        var ext2 = gl2.getExtension('WEBGL_debug_renderer_info');
        if (ext2) components.push(gl2.getParameter(ext2.UNMASKED_RENDERER_WEBGL) || '');
      }
    } catch(e3) {}

    var raw = components.join('|||');
    var encoder = new TextEncoder();
    var data = encoder.encode(raw);
    var hashBuffer = await crypto.subtle.digest('SHA-256', data);
    var hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(function(b){ return b.toString(16).padStart(2,'0'); }).join('');
  } catch(e) {
    return btoa(navigator.userAgent + screen.width + screen.height).slice(0, 64);
  }
}

let _db;
try {
  if (!window.supabase) throw new Error('Supabase not loaded');
  // Clear any existing Supabase sessions from localStorage
  try {
    Object.keys(localStorage).forEach(function(key) {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    });
  } catch(e) {}

  _db = window.supabase.createClient(_SUPA_URL, _SUPA_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: window.sessionStorage
    }
  });
} catch(e) {
  console.error('[بيّن] فشل تحميل Supabase:', e);
  document.addEventListener('DOMContentLoaded', function() {
    var overlay = document.getElementById('auth-overlay');
    if (overlay) overlay.style.display = 'flex';
    _authStatus('❌ خطأ في الاتصال — يرجى تحديث الصفحة', false);
  });
}

function _authStatus(msg, ok) {
  var el = document.getElementById('auth-status');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  el.style.color = ok ? '#27AE60' : '#C0392B';
  el.style.background = ok ? 'rgba(39,174,96,0.08)' : 'rgba(192,57,43,0.08)';
}

var _subCheckInterval = null;

function _lockPlatform(reason) {
  // إيقاف الفحص الدوري
  if (_subCheckInterval) { clearInterval(_subCheckInterval); _subCheckInterval = null; }
  // إيقاف أي أنيميشن شغّال
  if (typeof cancelAnimationFrame !== 'undefined' && typeof animFrame !== 'undefined') cancelAnimationFrame(animFrame);
  // إخفاء المنصة
  var app = document.getElementById('app');
  if (app) { app.style.display = 'none'; app.classList.remove('open'); }
  var landing = document.getElementById('landing');
  if (landing) landing.style.display = 'none';
  var overlay = document.getElementById('auth-overlay');
  if (overlay) overlay.style.display = 'flex';

  if (reason === 'device') {
    // طرد بسبب جهاز آخر — أظهر شاشة تسجيل الدخول مع رسالة
    document.getElementById('payment-section').style.display = 'none';
    document.getElementById('auth-email').style.display = '';
    document.getElementById('auth-pass').style.display = '';
    document.getElementById('auth-submit-btn').style.display = '';
    var authVis = document.getElementById('auth-visitor-bar');
    if (authVis) authVis.style.display = 'none';
    var authSub2 = document.querySelector('.auth-sub');
    if (authSub2) { authSub2.style.display = ''; authSub2.textContent = 'كل حساب مخصص لجهاز واحد فقط — يرجى الاشتراك بحساب خاص بك'; }
    // امسح البصمة المحلية
    try { localStorage.removeItem(_FP_KEY); } catch(e) {}
    _authStatus('⚠️ هذا الحساب مفتوح على جهاز آخر — كل حساب لجهاز واحد فقط. إذا كنت صاحب الحساب يرجى إعادة تسجيل الدخول', false);
  } else {
    // انتهاء اشتراك — أظهر شاشة الدفع
    document.getElementById('payment-section').style.display = 'block';
    document.getElementById('auth-email').style.display = 'none';
    document.getElementById('auth-pass').style.display = 'none';
    document.getElementById('auth-submit-btn').style.display = 'none';
    document.getElementById('auth-visitor-bar').style.display = 'none';
    var authSub3 = document.querySelector('.auth-sub');
    if (authSub3) authSub3.style.display = 'none';
    _authStatus('⏰ انتهت مدة اشتراكك — يرجى التجديد', false);
  }
}

async function _periodicSubCheck() {
  try {
    var userResp = await _db.auth.getUser();
    var user = userResp && userResp.data && userResp.data.user;
    if (!user) { _lockPlatform(); return; }

    var resp = await _db.from('profiles')
      .select('subscription_status, active_device_fp')
      .eq('id', user.id)
      .single();

    var status = resp.data && resp.data.subscription_status;
    if (status !== 'active') { _lockPlatform(); return; }

    // ── فحص بصمة الجهاز ──
    try {
      var savedFp   = localStorage.getItem(_FP_KEY);
      var remoteFp  = resp.data && resp.data.active_device_fp;
      if (remoteFp && savedFp && remoteFp !== savedFp) {
        _lockPlatform('device');
        return;
      }
    } catch(fpErr) { console.log('fp check error:', fpErr); }

  } catch(e) { console.log('periodic sub check error:', e); }
}

function _unlockPlatform() {
  var overlay = document.getElementById('auth-overlay');
  if (overlay) overlay.style.display = 'none';
  var landing = document.getElementById('landing');
  if (landing) landing.style.removeProperty('display');
  var footer = document.getElementById('bayyin-footer');
  if (footer) footer.style.display = 'block';
  document.getElementById('grade-picker').style.display = 'none';
  var app = document.getElementById('app');
  if (app) { app.style.display = 'none'; app.classList.remove('open'); }
  setTimeout(function(){ _showSubscriptionDays(); }, 800);
  // فحص فوري عند الدخول ثم كل 10 ثوانٍ
  if (_subCheckInterval) clearInterval(_subCheckInterval);
  setTimeout(_periodicSubCheck, 1500); // فحص بعد 1.5 ثانية من الدخول
  _subCheckInterval = setInterval(_periodicSubCheck, 10 * 1000);
}

async function handleLogin() {
  var email = (document.getElementById('auth-email').value || '').trim().toLowerCase();
  var pass  = (document.getElementById('auth-pass').value || '');
  var btn   = document.getElementById('auth-submit-btn');

  if (!_db) {
    _authStatus('❌ خطأ في الاتصال — يرجى تحديث الصفحة', false); return;
  }
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    _authStatus('يرجى إدخال بريد إلكتروني صحيح', false); return;
  }
  if (pass.length < 6) {
    _authStatus('كلمة المرور يجب أن تكون 6 أحرف على الأقل', false); return;
  }

  btn.disabled = true;
  btn.textContent = '⏳ جاري...';
  _authStatus('جاري الاتصال...', true);

  try {
    var signIn = await _db.auth.signInWithPassword({ email, password: pass });

    if (signIn.error) {
      if (signIn.error.message.includes('Invalid login credentials') ||
          signIn.error.message.includes('invalid_credentials')) {

        _authStatus('جاري إنشاء حساب جديد...', true);
        var signUp = await _db.auth.signUp({ email, password: pass });

        if (signUp.error) {
          _authStatus('❌ ' + signUp.error.message, false);
          return;
        }

        if (signUp.data.user) {
          await _db.from('profiles').upsert({
            id: signUp.data.user.id,
            email: email,
            subscription_status: 'pending'
          }, { onConflict: 'id' });
        }

        _authStatus('✅ تم إنشاء الحساب! جاري فحص الاشتراك...', true);
      } else {
        _authStatus('❌ ' + signIn.error.message, false);
        return;
      }
    } else {
      _authStatus('✅ تم تسجيل الدخول! جاري فحص الاشتراك...', true);
    }

    // ── حفظ بصمة الجهاز بعد الدخول الناجح ──
    try {
      var fp = await _getDeviceFingerprint();
      localStorage.setItem(_FP_KEY, fp);
      var curUser = (await _db.auth.getUser()).data.user;
      if (curUser) {
        await _db.from('profiles').update({ active_device_fp: fp }).eq('id', curUser.id);
      }
    } catch(fpErr) { console.log('fp save error:', fpErr); }

    await _checkSubscription();

  } catch (err) {
    _authStatus('❌ خطأ: ' + err.message, false);
  } finally {
    btn.disabled = false;
    btn.textContent = 'تسجيل دخول / إنشاء حساب';
  }
}

async function _checkSubscription() {
  try {
    if (!_db) {
      var overlay = document.getElementById('auth-overlay');
      if (overlay) overlay.style.display = 'flex';
      _authStatus('❌ خطأ في الاتصال — يرجى تحديث الصفحة', false);
      return;
    }
    var userResp = await _db.auth.getUser();
    var user = userResp.data.user;
    if (!user) {
      var overlay = document.getElementById('auth-overlay');
      if (overlay) overlay.style.display = 'flex';
      return;
    }

    var resp = await _db.from('profiles')
      .select('subscription_status, active_device_fp')
      .eq('id', user.id)
      .single();

    if (resp.error) {
      console.error('[بيّن] خطأ Supabase:', resp.error.message);
      _authStatus('❌ خطأ: ' + resp.error.message, false);
      document.getElementById('payment-section').style.display = 'block';
      return;
    }

    var status = resp.data && resp.data.subscription_status;

    if (status === 'active') {
      _unlockPlatform();
    } else {
      // أخفِ حقول الدخول وأظهر صفحة الدفع بشكل واضح
      document.getElementById('payment-section').style.display = 'block';
      document.getElementById('auth-email').style.display = 'none';
      document.getElementById('auth-pass').style.display = 'none';
      document.getElementById('auth-submit-btn').style.display = 'none';
      document.getElementById('auth-visitor-bar').style.display = 'none';
      var authSub = document.querySelector('.auth-sub');
      if(authSub) authSub.style.display = 'none';
      _authStatus('', false);
    }
  } catch (err) {
    console.error('checkSubscription error:', err);
    _authStatus('❌ خطأ غير متوقع: ' + err.message, false);
  }
}




// ══════════════════════════════════════════════════════════
