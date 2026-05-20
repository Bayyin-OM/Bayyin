// ══════════════════════════════════════════════════════════════
// بيّن — نظام المصادقة والاشتراك
// ══════════════════════════════════════════════════════════════


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
      .select('subscription_status, subscription_expires_at, active_device_fp')
      .eq('id', user.id)
      .single();

    if (resp.error) {
      console.error('[بيّن] خطأ Supabase:', resp.error.message);
      _authStatus('❌ خطأ: ' + resp.error.message, false);
      document.getElementById('payment-section').style.display = 'block';
      return;
    }

    var status = resp.data && resp.data.subscription_status;

    const expiresAt = resp.data && resp.data.subscription_expires_at;
    const notExpired = !expiresAt || new Date(expiresAt) > new Date();

    if (status === 'active' && notExpired) {
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
// الصف الثامن — وحدة ٧: الجهاز الدوري وتبادل الغازات
// نسخة v2 — تفاعلية كاملة مع controls + questions + sound
// ══════════════════════════════════════════════════════════

// ── مساعد: نسخة خفيفة من U9 للوحدة 7 ──
const U7 = {
  bg(c,w,h,col){ c.fillStyle=col||'#FFF5F5'; c.fillRect(0,0,w,h); },
  grid(c,w,h,col,size){
    c.strokeStyle=col||'rgba(200,50,50,0.06)'; c.lineWidth=1;
    for(let x=0;x<w;x+=size){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}
    for(let y=0;y<h;y+=size){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
  },
  txt(c,t,x,y,col,sz,bold){
    c.fillStyle=col||'#333'; c.font=(bold?'bold ':'')+sz+'px Tajawal';
    c.textAlign='center'; c.textBaseline='middle'; c.fillText(t,x,y);
  },
  pill(c,x,y,w2,h2,col,text,textCol){
    c.fillStyle=col; c.beginPath(); c.roundRect(x-w2/2,y-h2/2,w2,h2,h2/2); c.fill();
    if(text){ c.fillStyle=textCol||'white'; c.font='bold 12px Tajawal'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(text,x,y); }
  },
  heart(c,cx,cy,scale,col){
    c.save(); c.translate(cx,cy); c.scale(scale,scale);
    c.fillStyle=col||'#C0392B';
    c.beginPath();
    c.moveTo(0,8); c.bezierCurveTo(-5,-5,-22,-5,-22,-16);
    c.bezierCurveTo(-22,-28,-5,-28,0,-18);
    c.bezierCurveTo(5,-28,22,-28,22,-16);
    c.bezierCurveTo(22,-5,5,-5,0,8);
    c.fill(); c.restore();
  },
  lung(c,cx,cy,rw,rh,col){
    c.fillStyle=col||'rgba(255,160,160,0.7)'; c.strokeStyle='#C0392B'; c.lineWidth=2;
    c.beginPath(); c.ellipse(cx-rw*0.4,cy,rw*0.5,rh,0,0,Math.PI*2); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(cx+rw*0.4,cy,rw*0.5,rh,0,0,Math.PI*2); c.fill(); c.stroke();
  }
};

// ── نظام الأصوات للوحدة 7 (نبضات قلب) ──
(function(){
  var _hbAC=null, _hbStop=null;
  function getHBAC(){ if(!_hbAC){ try{_hbAC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){} } return _hbAC; }

  window._playHeartbeat = function(rate){
    var ac=getHBAC(); if(!ac) return;
    if(_hbStop){ try{_hbStop();}catch(e){} _hbStop=null; }
    var interval = 60/rate;
    var stopped=false;
    function beat(){
      if(stopped) return;
      ['lub','dub'].forEach(function(type,i){
        setTimeout(function(){
          if(stopped) return;
          var o=ac.createOscillator(), g=ac.createGain();
          o.frequency.value = type==='lub'?60:50;
          o.type='sine';
          var t=ac.currentTime;
          g.gain.setValueAtTime(0,t);
          g.gain.linearRampToValueAtTime(0.25,t+0.02);
          g.gain.exponentialRampToValueAtTime(0.001,t+0.12);
          o.connect(g); g.connect(ac.destination);
          o.start(t); o.stop(t+0.14);
        }, i*150);
      });
      var tid=setTimeout(function(){ beat(); }, interval*1000);
      _hbStop=function(){ stopped=true; clearTimeout(tid); };
    }
    beat();
  };

  window._stopHeartbeat = function(){
    if(_hbStop){ try{_hbStop();}catch(e){} _hbStop=null; }
  };

  // ربط تلقائي مع openSim لوحدة القلب
  var _origOpenSim2 = window.openSim;
  window.openSim = function(type){
    if(_origOpenSim2) _origOpenSim2(type);
    var circSims = ['circsystem','heart8','blood8','vessels8','lungs8','gasex8','respiration8','fitness8','smoking8'];
    if(circSims.indexOf(type)!==-1){
      setTimeout(function(){ try{ window._playHeartbeat(70); }catch(e){} }, 800);
    }
  };
  var _origCloseSim2 = window.closeSim;
  window.closeSim = function(){
    if(_origCloseSim2) _origCloseSim2();
    try{ window._stopHeartbeat(); }catch(e){}
  };
})();

// ══════════════════════════════════════════════════════════
// 7-1 · رحلة الدم في الجهاز الدوري
// ══════════════════════════════════════════════════════════
function simCircSystem1(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.cs1) simState.cs1={t:0,particles:[],running:false,speed:1,showLabels:true};
  const S=simState.cs1;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">❤️ الجهاز الدوري للإنسان</div>
    </div>
    <button class="ctrl-btn play" onclick="simState.cs1.running=!simState.cs1.running;this.textContent=simState.cs1.running?'⏸ إيقاف':'▶ أرسل الدم'">▶ أرسل الدم</button>
    <button class="ctrl-btn reset" onclick="simState.cs1.particles=[];simState.cs1.running=false;simState.cs1.t=0;document.querySelector('.ctrl-btn.play').textContent='▶ أرسل الدم'">↺ إعادة</button>
    <div class="ctrl-section">
      <div class="ctrl-label">سرعة الدورة الدموية</div>
      <input type="range" min="0.5" max="3" step="0.5" value="1" oninput="simState.cs1.speed=+this.value;document.getElementById('cs1spd').textContent=this.value+'×'" style="width:100%">
      <div id="cs1spd" style="text-align:center;font-size:13px;color:#C0392B">1×</div>
    </div>
    <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;margin-top:6px">
      <input type="checkbox" checked onchange="simState.cs1.showLabels=this.checked"> إظهار التسميات
    </label>
    <div class="info-box" style="font-size:12px;line-height:1.8;margin-top:8px">
      🔴 = دم مؤكسج (غني بالأكسجين)<br>
      🔵 = دم غير مؤكسج<br>
      🔄 الدورة الرئوية: قلب←رئة←قلب<br>
      🔄 الدورة الجهازية: قلب←جسم←قلب
    </div>`);

  function draw(){
    if(currentSim!=='circsystem'||currentTab!==0) return;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    // bg
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#FFF0F0';
    c.fillRect(0,0,w,h);
    U7.grid(c,w,h,'rgba(200,50,50,0.04)',40);

    const cx=w*0.48, cy=h*0.5;
    const lungX=cx-w*0.25, lungY=cy-h*0.22;
    const bodyX=cx+w*0.26, bodyY=cy+h*0.14;

    // Vessels (thick background paths)
    const drawCurve=(pts,col,lw)=>{
      c.beginPath(); c.moveTo(pts[0][0],pts[0][1]);
      for(let i=1;i<pts.length;i++) c.lineTo(pts[i][0],pts[i][1]);
      c.strokeStyle=col; c.lineWidth=lw||8; c.lineCap='round'; c.lineJoin='round'; c.stroke();
    };
    // Pulmonary circuit
    drawCurve([[cx-20,cy-20],[cx-60,cy-60],[lungX+20,lungY+20],[lungX,lungY]],'rgba(91,155,213,0.5)',10);
    drawCurve([[lungX,lungY],[lungX+20,lungY+30],[cx-20,cy-30],[cx,cy-20]],'rgba(192,57,43,0.5)',10);
    // Systemic circuit
    drawCurve([[cx+20,cy+10],[cx+60,cy+40],[bodyX-20,bodyY-10],[bodyX,bodyY]],'rgba(192,57,43,0.5)',10);
    drawCurve([[bodyX,bodyY],[bodyX-30,bodyY+20],[cx+30,cy+30],[cx+20,cy+10]],'rgba(91,155,213,0.5)',10);

    // Lungs
    U7.lung(c,lungX,lungY,60,36,'rgba(255,180,180,0.8)');
    if(S.showLabels) U7.txt(c,'الرئتان',lungX,lungY+52,'#C0392B',12,true);

    // Body tissues
    c.fillStyle='rgba(255,220,150,0.8)'; c.strokeStyle='#D4901A'; c.lineWidth=2;
    c.beginPath(); c.roundRect(bodyX-42,bodyY-22,84,44,10); c.fill(); c.stroke();
    if(S.showLabels){
      U7.txt(c,'أنسجة الجسم',bodyX,bodyY-6,'#7A4A10',11,true);
      U7.txt(c,'(عضلات، أعضاء)',bodyX,bodyY+9,'#7A4A10',10,false);
    }

    // Heart (pulsing)
    const pulse=1+Math.sin(S.t*4.5)*0.07;
    c.save(); c.translate(cx,cy); c.scale(pulse,pulse);
    // Left side (oxygenated - red)
    c.fillStyle='#C0392B'; c.beginPath();
    c.moveTo(0,22); c.bezierCurveTo(-4,-4,-22,-4,-22,-14);
    c.bezierCurveTo(-22,-26,-4,-26,0,-16);
    c.bezierCurveTo(4,-26,22,-26,22,-14);
    c.bezierCurveTo(22,-4,4,-4,0,22); c.fill();
    // Dividing line
    c.strokeStyle='rgba(255,255,255,0.4)'; c.lineWidth=2;
    c.beginPath(); c.moveTo(0,-24); c.lineTo(0,20); c.stroke();
    // Left half overlay
    c.fillStyle='rgba(91,155,213,0.35)';
    c.beginPath(); c.moveTo(0,-24); c.lineTo(-22,-24); c.lineTo(-22,20); c.lineTo(0,20); c.closePath(); c.fill();
    c.restore();
    if(S.showLabels) U7.txt(c,'القلب',cx,cy+38,'#7A0000',13,true);

    // Labels overlay
    if(S.showLabels){
      U7.txt(c,'دم غير مؤكسج ←',cx-w*0.19,cy-h*0.06,'#5B9BD5',11,false);
      U7.txt(c,'← دم مؤكسج',cx-w*0.05,cy-h*0.19,'#C0392B',11,false);
      U7.txt(c,'دم مؤكسج ←',cx+w*0.12,cy+h*0.02,'#C0392B',11,false);
      U7.txt(c,'← دم غير مؤكسج',cx+w*0.14,cy+h*0.17,'#5B9BD5',11,false);
    }

    // Spawn particles
    if(S.running && S.t%Math.max(0.3,0.8/S.speed)<0.03){
      const paths=[
        {pts:[[cx-20,cy-20],[cx-60,cy-60],[lungX+20,lungY+20],[lungX,lungY]],oxy:false,next:'fromLung'},
        {pts:[[lungX,lungY],[lungX+20,lungY+30],[cx-20,cy-30],[cx,cy-20]],oxy:true,next:'toBody'},
        {pts:[[cx+20,cy+10],[cx+60,cy+40],[bodyX-20,bodyY-10],[bodyX,bodyY]],oxy:true,next:'fromBody'},
        {pts:[[bodyX,bodyY],[bodyX-30,bodyY+20],[cx+30,cy+30],[cx+20,cy+10]],oxy:false,next:'toLung'}
      ];
      paths.forEach(p=>{
        S.particles.push({pts:p.pts,step:0,oxy:p.oxy,alpha:1});
      });
    }

    // Update & draw particles
    S.particles=S.particles.filter(p=>p.alpha>0.1);
    S.particles.forEach(p=>{
      p.step=Math.min(1,p.step+0.012*S.speed);
      const segs=p.pts.length-1;
      const si=Math.min(Math.floor(p.step*segs),segs-1);
      const st=p.step*segs-si;
      const ax=p.pts[si][0]+(p.pts[si+1][0]-p.pts[si][0])*st;
      const ay=p.pts[si][1]+(p.pts[si+1][1]-p.pts[si][1])*st;
      if(p.step>=0.99) p.alpha=0;
      // Glow
      const g=c.createRadialGradient(ax,ay,0,ax,ay,10);
      g.addColorStop(0,p.oxy?'rgba(220,50,50,1)':'rgba(60,100,200,1)');
      g.addColorStop(1,p.oxy?'rgba(220,50,50,0)':'rgba(60,100,200,0)');
      c.fillStyle=g; c.beginPath(); c.arc(ax,ay,10,0,Math.PI*2); c.fill();
      c.fillStyle=p.oxy?'#C0392B':'#2471A3'; c.beginPath(); c.arc(ax,ay,5,0,Math.PI*2); c.fill();
      c.strokeStyle='white'; c.lineWidth=1; c.stroke();
    });

    const hint=S.running?'الدم يجري الآن في الدورة الدموية...':'اضغط "أرسل الدم" لبدء الدورة الدموية';
    U7.txt(c,hint,w/2,h-18,'#888',12,false);

    S.t+=0.022;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 7-1 TAB 1: الدم المؤكسج وغير المؤكسج ──
function simCircSystem2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.cs2) simState.cs2={t:0,selected:null,quiz:false};
  const S=simState.cs2;

  const zones=[
    {id:'lung',  label:'في الرئتين', x:0.25, y:0.35, color:'#2980B9', text:'الدم يمتص الأكسجين هنا\nيصبح مؤكسجاً (أحمر فاتح)'},
    {id:'tissue',label:'في الأنسجة', x:0.75, y:0.35, color:'#8E44AD', text:'الأكسجين ينتقل للخلايا هنا\nيصبح الدم غير مؤكسج (داكن)'},
    {id:'oxy',   label:'دم مؤكسج', x:0.25, y:0.7,  color:'#C0392B', text:'لون أحمر فاتح\nهيموجلوبين مؤكسج (أوكسيهيموجلوبين)'},
    {id:'deoxy', label:'دم غير مؤكسج', x:0.75, y:0.7, color:'#2C3E6B', text:'لون أحمر داكن مائل للزرقة\nهيموجلوبين فقط (بدون أكسجين)'}
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🩸 الدم المؤكسج وغير المؤكسج</div>
    </div>
    ${zones.map(z=>`<button class="ctrl-btn" onclick="simState.cs2.selected='${z.id}';simState.cs2.quiz=false" style="background:${z.color};color:white;border:none;margin-bottom:4px">${z.label}</button>`).join('')}
    <button class="ctrl-btn reset" onclick="simState.cs2.selected=null">↺ مسح التحديد</button>
    <div class="info-box" style="font-size:12px;line-height:1.9;margin-top:8px">
      الهيموجلوبين يحمل O₂<br>
      في الرئتين: O₂ منخفض → ينتشر للدم<br>
      في الأنسجة: O₂ مرتفع في الدم → ينتشر للخلايا
    </div>`);

  function draw(){
    if(currentSim!=='circsystem'||currentTab!==1) return;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#FFF5F5';
    c.fillRect(0,0,w,h);
    U7.grid(c,w,h,'rgba(200,50,50,0.04)',45);

    U7.txt(c,'الدم المؤكسج مقابل غير المؤكسج',w/2,22,'#7A0000',14,true);

    // Draw central flow diagram
    const midX=w/2, midY=h*0.5;
    // Oxygenated side (left)
    const gOxy=c.createLinearGradient(midX-w*0.2,0,midX,0);
    gOxy.addColorStop(0,'rgba(192,57,43,0.15)'); gOxy.addColorStop(1,'rgba(192,57,43,0.02)');
    c.fillStyle=gOxy; c.fillRect(0,h*0.08,midX,h*0.84);

    const gDeoxy=c.createLinearGradient(midX,0,midX+w*0.2,0);
    gDeoxy.addColorStop(0,'rgba(44,62,107,0.02)'); gDeoxy.addColorStop(1,'rgba(44,62,107,0.15)');
    c.fillStyle=gDeoxy; c.fillRect(midX,h*0.08,w-midX,h*0.84);

    // Draw blood cells side by side
    const cellsOxy=[[midX-w*0.22,h*0.48],[midX-w*0.16,h*0.44],[midX-w*0.14,h*0.52],[midX-w*0.08,h*0.48]];
    const cellsDeoxy=[[midX+w*0.08,h*0.48],[midX+w*0.14,h*0.44],[midX+w*0.16,h*0.52],[midX+w*0.22,h*0.48]];

    cellsOxy.forEach(([cx,cy])=>{
      const r=18+Math.sin(S.t*2)*1.5;
      const g2=c.createRadialGradient(cx-4,cy-4,0,cx,cy,r);
      g2.addColorStop(0,'#E74C3C'); g2.addColorStop(0.6,'#C0392B'); g2.addColorStop(1,'#922B21');
      c.fillStyle=g2; c.beginPath(); c.ellipse(cx,cy,r,r*0.7,0,0,Math.PI*2); c.fill();
      // O2 label
      c.fillStyle='rgba(255,255,255,0.8)'; c.font='bold 9px Tajawal'; c.textAlign='center';
      c.fillText('O₂',cx,cy+2);
    });

    cellsDeoxy.forEach(([cx,cy])=>{
      const r=18+Math.sin(S.t*2+1)*1.5;
      const g2=c.createRadialGradient(cx-4,cy-4,0,cx,cy,r);
      g2.addColorStop(0,'#5D6D7E'); g2.addColorStop(0.6,'#2C3E50'); g2.addColorStop(1,'#1A252F');
      c.fillStyle=g2; c.beginPath(); c.ellipse(cx,cy,r,r*0.7,0,0,Math.PI*2); c.fill();
    });

    // Labels
    U7.txt(c,'دم مؤكسج',midX*0.5,h*0.32,'#C0392B',14,true);
    U7.txt(c,'Oxygenated',midX*0.5,h*0.38,'#C0392B',11,false);
    U7.txt(c,'لون أحمر فاتح',midX*0.5,h*0.61,'#C0392B',12,false);
    U7.txt(c,'هيموجلوبين+O₂',midX*0.5,h*0.67,'#C0392B',12,false);

    U7.txt(c,'دم غير مؤكسج',midX+midX*0.5,h*0.32,'#2C3E6B',14,true);
    U7.txt(c,'Deoxygenated',midX+midX*0.5,h*0.38,'#2C3E6B',11,false);
    U7.txt(c,'لون أحمر داكن مائل للزرقة',midX+midX*0.5,h*0.61,'#2C3E6B',12,false);
    U7.txt(c,'هيموجلوبين بدون O₂',midX+midX*0.5,h*0.67,'#2C3E6B',12,false);

    // Center divider
    c.strokeStyle='rgba(150,150,150,0.3)'; c.lineWidth=2; c.setLineDash([6,4]);
    c.beginPath(); c.moveTo(midX,h*0.08); c.lineTo(midX,h*0.92); c.stroke();
    c.setLineDash([]);

    // Oxygen molecule animation
    const ot=(S.t*0.5)%1;
    const ox_x=midX-w*0.05+Math.sin(S.t)*8;
    const ox_y=h*0.48+Math.cos(S.t*0.8)*10;
    c.fillStyle='rgba(39,174,96,0.9)'; c.beginPath(); c.arc(ox_x,ox_y,5,0,Math.PI*2); c.fill();
    c.font='bold 8px sans-serif'; c.fillStyle='white'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('O₂',ox_x,ox_y);

    // Show selection info
    if(S.selected){
      const z=zones.find(z=>z.id===S.selected);
      if(z){
        c.fillStyle='rgba(255,255,255,0.92)'; c.strokeStyle=z.color; c.lineWidth=3;
        c.beginPath(); c.roundRect(w*0.15,h*0.77,w*0.7,h*0.15,10); c.fill(); c.stroke();
        U7.txt(c,z.text.split('\n')[0],w/2,h*0.815,z.color,13,true);
        U7.txt(c,z.text.split('\n')[1],w/2,h*0.845,z.color,11,false);
      }
    }

    S.t+=0.025;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 7-2 · القلب — تركيبه وكيف يعمل
// ══════════════════════════════════════════════════════════

// ─── دالة رسم القلب التشريحي الحقيقي ───────────────────
// drawAnatomicalHeart(c, cx, cy, size, beatPhase)
// beatPhase: 0=diastole(مرتخي), 1=systole(منقبض)
function drawAnatomicalHeart(c, cx, cy, size, beatPhase, showLabels, highlighted) {
  const S = size;
  const bp = beatPhase; // 0..1  1=fully contracted

  // scale factor: ينقبض إلى 88% ثم يرتد
  const sc = 1 - bp * 0.12;

  c.save();
  c.translate(cx, cy);
  c.scale(sc, sc);

  // ── الظل الخارجي ─────────────────────────────────────
  c.shadowBlur = 28 + bp * 14;
  c.shadowColor = 'rgba(160,20,20,0.35)';

  // ── الجسم الخارجي للقلب (silhouette) ─────────────────
  // شكل القلب الحقيقي: قوس علوي ذو فصّين + قمة سفلية
  function heartPath(s) {
    c.beginPath();
    // نقطة القمة السفلية
    c.moveTo(0, s * 0.82);
    // الجانب الأيسر (من الناحية التشريحية = يمين الشاشة لأن القلب مقلوب)
    c.bezierCurveTo( s*0.05, s*0.55,  s*0.55, s*0.35,  s*0.55,  s*0.05);
    c.bezierCurveTo( s*0.55,-s*0.28,  s*0.25,-s*0.42,  s*0.08, -s*0.38);
    c.bezierCurveTo(-s*0.08,-s*0.34,  0,     -s*0.18,  0,      -s*0.18);
    // الجانب الأيمن
    c.bezierCurveTo( 0,     -s*0.18, -s*0.08,-s*0.34, -s*0.08, -s*0.38);
    c.bezierCurveTo(-s*0.25,-s*0.42, -s*0.55,-s*0.28, -s*0.55,  s*0.05);
    c.bezierCurveTo(-s*0.55, s*0.35, -s*0.05, s*0.55,  0,       s*0.82);
    c.closePath();
  }

  // تدرج خارجي
  const outerG = c.createRadialGradient(-S*0.1,-S*0.25, S*0.05, 0, 0, S*0.85);
  outerG.addColorStop(0, '#e05050');
  outerG.addColorStop(0.45,'#b82020');
  outerG.addColorStop(1,  '#7a1010');
  c.fillStyle = outerG;
  heartPath(S);
  c.fill();
  c.shadowBlur = 0;

  // حدود خارجية
  c.strokeStyle = 'rgba(80,0,0,0.55)';
  c.lineWidth = 2.2;
  heartPath(S);
  c.stroke();

  // ── تفاصيل الأخاديد (grooves) ──────────────────────
  c.strokeStyle = 'rgba(90,0,0,0.38)';
  c.lineWidth = 2.8;
  c.setLineDash([]);
  // الأخدود التاجي (coronary sulcus) — يفصل الأذينين عن البطينين
  c.beginPath();
  c.moveTo(-S*0.52, S*0.04);
  c.bezierCurveTo(-S*0.4,-S*0.04, S*0.4,-S*0.04, S*0.52, S*0.04);
  c.stroke();

  // الأخدود الأمامي البيني (anterior interventricular sulcus)
  c.beginPath();
  c.moveTo(S*0.04,-S*0.14);
  c.bezierCurveTo(S*0.06, S*0.18, S*0.04, S*0.5, 0, S*0.82);
  c.stroke();

  // ── الأذين الأيمن (RA) — يمين الشاشة ─────────────
  const raHl = highlighted==='RA';
  const raG = c.createRadialGradient(-S*0.32,-S*0.28, 0, -S*0.32,-S*0.28, S*0.28);
  raG.addColorStop(0, raHl?'#5b8dd9':'#3a6ab5');
  raG.addColorStop(1, raHl?'#2455a0':'#1a3a7a');
  c.fillStyle = raG;
  c.beginPath();
  c.ellipse(-S*0.32,-S*0.2, S*0.21, S*0.17, -0.2, 0, Math.PI*2);
  c.fill();
  if(raHl){ c.strokeStyle='white'; c.lineWidth=2.5; c.stroke(); }

  // ── الأذين الأيسر (LA) — يسار الشاشة ──────────────
  const laHl = highlighted==='LA';
  const laG = c.createRadialGradient(S*0.3,-S*0.28, 0, S*0.3,-S*0.28, S*0.28);
  laG.addColorStop(0, laHl?'#e86060':'#c0392b');
  laG.addColorStop(1, laHl?'#a02020':'#7b1818');
  c.fillStyle = laG;
  c.beginPath();
  c.ellipse(S*0.3,-S*0.2, S*0.2, S*0.17, 0.2, 0, Math.PI*2);
  c.fill();
  if(laHl){ c.strokeStyle='white'; c.lineWidth=2.5; c.stroke(); }

  // ── حاجز بين الأذينين ──────────────────────────────
  c.strokeStyle='rgba(80,0,0,0.5)'; c.lineWidth=2;
  c.setLineDash([3,2]);
  c.beginPath(); c.moveTo(0,-S*0.38); c.lineTo(0,-S*0.02); c.stroke();
  c.setLineDash([]);

  // ── البطين الأيمن (RV) ─────────────────────────────
  const rvHl = highlighted==='RV';
  // ينقبض أكثر من الأذينين
  const rvSc = 1 - bp*0.08;
  c.save(); c.scale(rvSc,rvSc);
  const rvG = c.createRadialGradient(-S*0.26, S*0.25, 0, -S*0.26, S*0.25, S*0.36);
  rvG.addColorStop(0, rvHl?'#6090e0':'#2c6eb5');
  rvG.addColorStop(1, rvHl?'#1a45a0':'#0e2d70');
  c.fillStyle = rvG;
  c.beginPath();
  c.moveTo(-S*0.04, S*0.01);
  c.bezierCurveTo(-S*0.06, S*0.15, -S*0.5, S*0.22, -S*0.46, S*0.42);
  c.bezierCurveTo(-S*0.36, S*0.58, -S*0.14, S*0.62, 0, S*0.82);
  c.bezierCurveTo(-S*0.02, S*0.5, -S*0.01, S*0.2, S*0.04*rvSc, S*0.01/rvSc);
  c.closePath();
  c.fill();
  if(rvHl){ c.strokeStyle='white'; c.lineWidth=2.5; c.stroke(); }
  c.restore();

  // ── البطين الأيسر (LV) ─────────────────────────────
  const lvHl = highlighted==='LV';
  const lvSc = 1 - bp*0.1; // LV أقوى = ينقبض أكثر
  c.save(); c.scale(lvSc,lvSc);
  const lvG = c.createRadialGradient(S*0.22, S*0.25, 0, S*0.22, S*0.25, S*0.38);
  lvG.addColorStop(0, lvHl?'#ff7070':'#e74c3c');
  lvG.addColorStop(1, lvHl?'#c02020':'#8b1a1a');
  c.fillStyle = lvG;
  c.beginPath();
  c.moveTo(S*0.04, S*0.01);
  c.bezierCurveTo(S*0.06, S*0.15, S*0.5, S*0.22, S*0.46, S*0.42);
  c.bezierCurveTo(S*0.36, S*0.58, S*0.14, S*0.62, 0, S*0.82);
  c.bezierCurveTo(S*0.02, S*0.5, S*0.01, S*0.2, -S*0.04/lvSc, S*0.01/lvSc);
  c.closePath();
  c.fill();
  if(lvHl){ c.strokeStyle='white'; c.lineWidth=2.5; c.stroke(); }
  c.restore();

  // ── حاجز بين البطينين ──────────────────────────────
  c.strokeStyle='rgba(60,0,0,0.55)'; c.lineWidth=2.5;
  c.setLineDash([4,3]);
  c.beginPath(); c.moveTo(0, S*0.02); c.bezierCurveTo(S*0.02,S*0.38, S*0.01,S*0.62, 0,S*0.82); c.stroke();
  c.setLineDash([]);

  // ── الأوردة الرئوية (الداخلة إلى LA) ──────────────
  c.strokeStyle='rgba(220,60,60,0.75)'; c.lineWidth=5;
  c.beginPath(); c.moveTo(S*0.5,-S*0.18); c.lineTo(S*0.42,-S*0.22); c.stroke();
  c.beginPath(); c.moveTo(S*0.5,-S*0.28); c.lineTo(S*0.42,-S*0.26); c.stroke();

  // ── الوريد الأجوف العلوي (إلى RA) ─────────────────
  c.strokeStyle='rgba(50,80,180,0.8)'; c.lineWidth=7;
  c.beginPath(); c.moveTo(-S*0.34,-S*0.5); c.lineTo(-S*0.34,-S*0.36); c.stroke();
  // رأس السهم
  c.fillStyle='rgba(50,80,180,0.8)';
  c.beginPath(); c.moveTo(-S*0.34,-S*0.34); c.lineTo(-S*0.39,-S*0.44); c.lineTo(-S*0.29,-S*0.44); c.closePath(); c.fill();

  // ── الوريد الأجوف السفلي (إلى RA) ─────────────────
  c.strokeStyle='rgba(50,80,180,0.75)'; c.lineWidth=6;
  c.beginPath(); c.moveTo(-S*0.5, S*0.12); c.lineTo(-S*0.4, S*0.06); c.stroke();

  // ── الشريان الرئوي (من RV) ─────────────────────────
  c.strokeStyle='rgba(60,110,210,0.85)'; c.lineWidth=8;
  c.beginPath(); c.moveTo(-S*0.18,-S*0.02); c.bezierCurveTo(-S*0.28,-S*0.25,-S*0.12,-S*0.48, S*0.05,-S*0.5); c.stroke();
  // نهاية مفتوحة
  c.strokeStyle='rgba(60,110,210,0.6)'; c.lineWidth=5;
  c.beginPath(); c.moveTo(S*0.05,-S*0.5); c.lineTo(S*0.14,-S*0.5); c.stroke();
  c.beginPath(); c.moveTo(S*0.05,-S*0.5); c.lineTo(-S*0.02,-S*0.5); c.stroke();

  // ── الشريان الأبهر (من LV) ─────────────────────────
  c.strokeStyle='rgba(220,50,50,0.85)'; c.lineWidth=9;
  c.beginPath(); c.moveTo(S*0.16,-S*0.0); c.bezierCurveTo(S*0.25,-S*0.22, S*0.1,-S*0.5,-S*0.1,-S*0.52); c.stroke();
  // قوس الأبهر
  c.strokeStyle='rgba(200,40,40,0.75)'; c.lineWidth=7;
  c.beginPath(); c.moveTo(-S*0.1,-S*0.52); c.bezierCurveTo(-S*0.28,-S*0.58,-S*0.44,-S*0.42,-S*0.44,-S*0.18); c.stroke();

  // ── تدفق الدم داخل الحجرات (نبضات) ───────────────
  if(bp > 0.3) {
    // جسيمات تخرج مع الانقباض من LV
    const alpha = Math.min(1,(bp-0.3)*2.5);
    for(let i=0;i<3;i++){
      const ang = -Math.PI*0.55 + i*0.22;
      const dist = S*(0.2 + bp*0.35);
      c.fillStyle = `rgba(220,50,50,${alpha*0.7})`;
      c.beginPath(); c.arc(S*0.16+Math.cos(ang)*dist, S*0.0+Math.sin(ang)*dist, 4+i, 0, Math.PI*2); c.fill();
    }
    // جسيمات من RV
    for(let i=0;i<2;i++){
      const ang = -Math.PI*0.75 + i*0.3;
      const dist = S*(0.15 + bp*0.3);
      c.fillStyle = `rgba(60,110,200,${alpha*0.65})`;
      c.beginPath(); c.arc(-S*0.18+Math.cos(ang)*dist, -S*0.02+Math.sin(ang)*dist, 3+i, 0, Math.PI*2); c.fill();
    }
  }

  // ── تأثير اللمعة (highlight) ──────────────────────
  const hl = c.createRadialGradient(-S*0.2,-S*0.3, 0, -S*0.1,-S*0.15, S*0.55);
  hl.addColorStop(0,'rgba(255,255,255,0.18)');
  hl.addColorStop(0.5,'rgba(255,255,255,0.04)');
  hl.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=hl; heartPath(S); c.fill();

  // ── تسميات الحجرات ─────────────────────────────────
  if(showLabels) {
    const lbl=(txt,x,y,col,sz=11)=>{
      c.fillStyle='rgba(0,0,0,0.45)'; c.font=`bold ${sz}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(txt,x+1,y+1);
      c.fillStyle=col; c.fillText(txt,x,y);
    };
    lbl('RA',-S*0.32,-S*0.2,'#a0c4ff',11);
    lbl('LA', S*0.30,-S*0.2,'#ffaaaa',11);
    lbl('RV',-S*0.26, S*0.28,'#6aabff',11);
    lbl('LV', S*0.24, S*0.28,'#ff8888',11);
  }

  c.restore();
}

// ── TAB 0: تركيب القلب ───────────────────────────────────
function simHeart1(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.h1) simState.h1={t:0, highlighted:null, showFlow:true, beatPhase:0};
  const S=simState.h1;

  const chambers=[
    {id:'RA', label:'الأذين الأيمن',  desc:'يستقبل الدم غير المؤكسج القادم من الجسم عبر الوريد الأجوف',   color:'#2C3E6B'},
    {id:'LA', label:'الأذين الأيسر',  desc:'يستقبل الدم المؤكسج القادم من الرئتين عبر الأوردة الرئوية',  color:'#C0392B'},
    {id:'RV', label:'البطين الأيمن',  desc:'يضخ الدم غير المؤكسج إلى الرئتين عبر الشريان الرئوي',       color:'#2980B9'},
    {id:'LV', label:'البطين الأيسر',  desc:'يضخ الدم المؤكسج إلى سائر أعضاء الجسم عبر الشريان الأبهر', color:'#E74C3C'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🫀 تشريح القلب الحقيقي</div>
      <div style="font-size:12px;color:#888">اضغط على حجرة لعرض تفاصيلها</div>
    </div>
    ${chambers.map(ch=>`
      <button class="ctrl-btn" onclick="simState.h1.highlighted='${ch.id}'" style="background:${ch.color};color:white;border:none;font-size:12px;margin-bottom:3px;display:flex;align-items:center;gap:6px">
        <span style="font-size:10px;opacity:0.8">${ch.id}</span> ${ch.label}
      </button>`).join('')}
    <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;margin-top:6px">
      <input type="checkbox" ${S.showFlow?'checked':''} onchange="simState.h1.showFlow=this.checked"> إظهار التدفق
    </label>
    <button class="ctrl-btn reset" onclick="simState.h1.highlighted=null">↺ مسح التحديد</button>
    <div class="info-box" style="font-size:11.5px;line-height:2;margin-top:8px">
      🔵 RA/RV — دم غير مؤكسج<br>
      🔴 LA/LV — دم مؤكسج<br>
      ⚡ الصمامات تمنع الرجوع<br>
      💓 ٧٠ نبضة/دقيقة في الراحة
    </div>`);

  // Click detection على الحجرات
  cv.onclick=function(e){
    const rect=cv.getBoundingClientRect();
    const mx=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX-rect.left)*(cv.width/rect.width);
    const my=(e.clientY-rect.top)*(cv.height/rect.height);
    const cx=cv.width/2, cy=cv.height*0.50;
    const sz=Math.min(cv.width,cv.height)*0.38;
    const pts={
      RA:[-sz*0.32*0.88, -sz*0.2*0.88, sz*0.22],
      LA:[ sz*0.30*0.88, -sz*0.2*0.88, sz*0.22],
      RV:[-sz*0.24*0.88,  sz*0.28*0.88, sz*0.25],
      LV:[ sz*0.22*0.88,  sz*0.28*0.88, sz*0.25],
    };
    Object.entries(pts).forEach(([id,[dx,dy,r]])=>{
      if(Math.hypot(mx-(cx+dx), my-(cy+dy))<r) S.highlighted=id;
    });
  };

  function draw(){
    if(currentSim!=='heart8'||currentTab!==0){ cv.onclick=null; return; }
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#FFF5F5';
    c.fillRect(0,0,w,h);
    U7.grid(c,w,h,'rgba(200,50,50,0.04)',45);

    const cx=w/2, cy=h*0.50;
    const heartSize=Math.min(w,h)*0.38;

    U7.txt(c,'تشريح القلب الحقيقي — الحجرات الأربع',w/2,22,'#7A0000',14,true);

    // نبضة هادئة في تاب التشريح
    const gentleBeat=0.4+Math.sin(S.t*4.5)*0.4; // 0..0.8 — نبض خفيف
    drawAnatomicalHeart(c, cx, cy, heartSize, gentleBeat*0.3, true, S.highlighted);

    // تدفق الدم (نقاط متحركة)
    if(S.showFlow){
      const ft=(S.t*0.35)%1;
      // من RA إلى RV (أزرق)
      const rax=cx-heartSize*0.28, ray=cy-heartSize*0.18;
      const rvx=cx-heartSize*0.22, rvy=cy+heartSize*0.26;
      const rfx=rax+(rvx-rax)*ft, rfy=ray+(rvy-ray)*ft;
      c.fillStyle='rgba(60,110,210,0.85)'; c.beginPath(); c.arc(rfx,rfy,5,0,Math.PI*2); c.fill();
      c.strokeStyle='rgba(60,110,210,0.25)'; c.lineWidth=1.5; c.setLineDash([3,3]);
      c.beginPath(); c.moveTo(rax,ray); c.lineTo(rvx,rvy); c.stroke(); c.setLineDash([]);
      // من LA إلى LV (أحمر)
      const lax=cx+heartSize*0.27, lay=cy-heartSize*0.18;
      const lvx=cx+heartSize*0.20, lvy=cy+heartSize*0.26;
      const lfx=lax+(lvx-lax)*ft, lfy=lay+(lvy-lay)*ft;
      c.fillStyle='rgba(220,60,60,0.85)'; c.beginPath(); c.arc(lfx,lfy,5,0,Math.PI*2); c.fill();
      c.strokeStyle='rgba(220,60,60,0.25)'; c.lineWidth=1.5; c.setLineDash([3,3]);
      c.beginPath(); c.moveTo(lax,lay); c.lineTo(lvx,lvy); c.stroke(); c.setLineDash([]);
    }

    // Info box للحجرة المحددة
    if(S.highlighted){
      const ch=chambers.find(x=>x.id===S.highlighted);
      if(ch){
        c.fillStyle='rgba(255,255,255,0.94)'; c.strokeStyle=ch.color; c.lineWidth=2.5;
        c.beginPath(); c.roundRect(w*0.04,h*0.80,w*0.92,h*0.17,10); c.fill(); c.stroke();
        U7.txt(c,ch.id+' — '+ch.label,w/2,h*0.838,ch.color,13,true);
        U7.txt(c,ch.desc,w/2,h*0.872,'#444',10.5,false);
      }
    }

    // أسماء الأوعية
    U7.txt(c,'الوريد الأجوف',   cx-heartSize*0.33,cy-heartSize*0.62,'#5080d0',9,true);
    U7.txt(c,'الشريان الأبهر',  cx+heartSize*0.05,cy-heartSize*0.62,'#d04040',9,true);
    U7.txt(c,'الشريان الرئوي',  cx-heartSize*0.28,cy-heartSize*0.72,'#4070c0',9,true);

    S.t+=0.022;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── TAB 1: الانقباض والانبساط ────────────────────────────
function simHeart2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.h2) simState.h2={t:0,running:true,bpm:70};
  const S=simState.h2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⚡ الانقباض والانبساط</div>
    </div>
    <button class="ctrl-btn play" onclick="simState.h2.running=!simState.h2.running;this.textContent=simState.h2.running?'⏸ إيقاف':'▶ تشغيل'">⏸ إيقاف</button>
    <div class="ctrl-section" style="margin-top:8px">
      <div class="ctrl-label">معدل النبض (نبضة/دقيقة)</div>
      <input type="range" min="40" max="180" step="5" value="70"
        oninput="simState.h2.bpm=+this.value;document.getElementById('h2bpm').textContent=this.value;window._stopHeartbeat();if(simState.h2.running)window._playHeartbeat(+this.value)"
        style="width:100%">
      <div id="h2bpm" style="text-align:center;font-size:18px;font-weight:800;color:#C0392B">70</div>
    </div>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:8px">
      🔴 انقباض: ضخ الدم للخارج<br>
      🔵 انبساط: امتلاء القلب بالدم<br>
      ✅ الصمامات تمنع الرجوع<br>
      💪 حجم الضربة ≈ 70 مل
    </div>`);

  function draw(){
    if(currentSim!=='heart8'||currentTab!==1){ return; }
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#FFF5F5';
    c.fillRect(0,0,w,h);
    U7.grid(c,w,h,'rgba(200,50,50,0.04)',40);

    const cx=w/2, cy=h*0.45;
    const heartSize=Math.min(w,h)*0.36;

    // ── حساب مرحلة الدورة ──────────────────────────
    const cycleDur=60/S.bpm;
    const phase=(S.t % cycleDur) / cycleDur; // 0..1

    // منحنى النبضة: ارتفاع حاد ثم هبوط ناعم (مثل موجة P-QRS-T)
    // 0..0.12: انقباض سريع, 0.12..0.45: ارتخاء, 0.45..1: دياستول
    let beatPhase;
    if(phase < 0.12)      beatPhase = Math.sin((phase/0.12)*Math.PI);        // صعود وهبوط سريع
    else if(phase < 0.45) beatPhase = Math.max(0,1-((phase-0.12)/0.33)*1.4)*0.25; // تلاشٍ ناعم
    else                   beatPhase = 0;                                      // دياستول كامل

    const systole = phase < 0.35;
    const phaseName = systole ? 'انقباض (Systole)' : 'انبساط (Diastole)';
    const phaseColor = systole ? '#C0392B' : '#2980B9';

    U7.txt(c,'دقة القلب — القلب الحقيقي',w/2,22,'#7A0000',14,true);

    // ── رسم القلب التشريحي مع النبضة ───────────────
    drawAnatomicalHeart(c, cx, cy, heartSize, beatPhase, false, null);

    // ── مرحلة النبضة ────────────────────────────────
    U7.pill(c, cx, cy+heartSize*0.98+22, 220, 32, phaseColor, phaseName, 'white');

    // ── سهام الضخ عند الانقباض ──────────────────────
    if(beatPhase > 0.25){
      const alpha = Math.min(1,(beatPhase-0.25)*3);
      const arrLen = heartSize * 0.3 * beatPhase;
      // أبهر: يسار وأعلى
      c.strokeStyle=`rgba(220,50,50,${alpha})`; c.lineWidth=3;
      c.beginPath(); c.moveTo(cx+heartSize*0.1, cy-heartSize*0.08);
      c.lineTo(cx+heartSize*0.1-arrLen*0.4, cy-heartSize*0.08-arrLen); c.stroke();
      c.fillStyle=`rgba(220,50,50,${alpha})`;
      const ax1=cx+heartSize*0.1-arrLen*0.4, ay1=cy-heartSize*0.08-arrLen;
      c.beginPath(); c.moveTo(ax1,ay1); c.lineTo(ax1-7,ay1+10); c.lineTo(ax1+7,ay1+10); c.closePath(); c.fill();
      // شريان رئوي: يمين وأعلى
      c.strokeStyle=`rgba(60,110,210,${alpha})`; c.lineWidth=3;
      c.beginPath(); c.moveTo(cx-heartSize*0.16, cy-heartSize*0.02);
      c.lineTo(cx-heartSize*0.16-arrLen*0.2, cy-heartSize*0.02-arrLen*0.9); c.stroke();
      c.fillStyle=`rgba(60,110,210,${alpha})`;
      const ax2=cx-heartSize*0.16-arrLen*0.2, ay2=cy-heartSize*0.02-arrLen*0.9;
      c.beginPath(); c.moveTo(ax2,ay2); c.lineTo(ax2-6,ay2+9); c.lineTo(ax2+6,ay2+9); c.closePath(); c.fill();
    }

    // ── خط ECG في الأسفل ────────────────────────────
    const ecgY=h*0.855, ecgH=h*0.075;
    c.strokeStyle='rgba(39,174,96,0.8)'; c.lineWidth=2;
    c.beginPath();
    for(let i=0;i<w;i++){
      const tp=((S.t - (i/w)*cycleDur*4) % cycleDur) / cycleDur;
      let yy;
      const t2=((tp%1)+1)%1;
      if     (t2<0.05)  yy=ecgY;
      else if(t2<0.08)  yy=ecgY-ecgH*0.35;
      else if(t2<0.12)  yy=ecgY-ecgH*2.1;
      else if(t2<0.16)  yy=ecgY+ecgH*0.85;
      else if(t2<0.22)  yy=ecgY-ecgH*0.55;
      else if(t2<0.27)  yy=ecgY;
      else               yy=ecgY;
      i===0?c.moveTo(i,yy):c.lineTo(i,yy);
    }
    c.stroke();
    U7.txt(c,'مخطط القلب الكهربائي (ECG)',w/2,ecgY-ecgH*2.8,'#888',11,false);

    // ── معدل النبض ───────────────────────────────────
    U7.txt(c, S.bpm+' نبضة/دقيقة', w/2, h*0.935, '#C0392B', 16, true);

    if(S.running) S.t += 0.016;
    animFrame=requestAnimationFrame(draw);
  }
  if(S.running) window._playHeartbeat(S.bpm);
  draw();
}


// ══════════════════════════════════════════════════════════
// 7-3 · الدم — مكوّناته ووظائفه
// ══════════════════════════════════════════════════════════
function simBlood1(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.b1) simState.b1={t:0,zoom:null,cells:[]};
  const S=simState.b1;

  // Generate cells once
  if(!S.cells.length){
    for(let i=0;i<60;i++) S.cells.push({
      x:Math.random()*0.7+0.15,y:Math.random()*0.6+0.2,
      type:i<40?'rbc':i<52?'wbc':'platelet',
      phase:Math.random()*Math.PI*2, speed:0.3+Math.random()*0.4, dx:(Math.random()-0.5)*0.001, dy:(Math.random()-0.5)*0.001
    });
  }

  const types={
    rbc:{label:'خلية دم حمراء', color:'#C0392B', size:9, desc:'تحمل الأكسجين بالهيموجلوبين'},
    wbc:{label:'خلية دم بيضاء', color:'#5D6D7E', size:13, desc:'تدافع عن الجسم ضد الميكروبات'},
    platelet:{label:'صفيحة دموية', color:'#F39C12', size:6, desc:'تساعد على تجلط الدم والتئام الجروح'}
  };
  const plasma={label:'البلازما', color:'rgba(255,220,100,0.3)', desc:'السائل الأصفر الناقل للمواد المذابة'};

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🩸 مكوّنات الدم</div>
    </div>
    ${Object.entries(types).map(([k,v])=>`
      <button class="ctrl-btn" onclick="simState.b1.zoom='${k}'" style="border-right:4px solid ${v.color};text-align:right;padding-right:12px;font-size:12px;margin-bottom:3px">
        <div style="font-weight:700">${v.label}</div>
        <div style="font-size:10px;color:#888">${v.desc}</div>
      </button>`).join('')}
    <button class="ctrl-btn" onclick="simState.b1.zoom='plasma'" style="border-right:4px solid #D4A017;font-size:12px;margin-bottom:3px">
      <div style="font-weight:700">${plasma.label}</div>
      <div style="font-size:10px;color:#888">${plasma.desc}</div>
    </button>
    <button class="ctrl-btn reset" onclick="simState.b1.zoom=null">↺ عرض الكل</button>`);

  cv.onclick=function(e){
    const rect=cv.getBoundingClientRect();
    const mx=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX-rect.left)*(cv.width/rect.width)/cv.width;
    const my=(e.clientY-rect.top)*(cv.height/rect.height)/cv.height;
    S.cells.forEach(cell=>{
      if(Math.abs(cell.x-mx)<0.04&&Math.abs(cell.y-my)<0.05) S.zoom=cell.type;
    });
  };

  function draw(){
    if(currentSim!=='blood8'||currentTab!==0){ cv.onclick=null; return; }
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    // Blood plasma background
    c.fillStyle='rgba(255,235,180,0.5)'; c.fillRect(0,0,w,h);
    U7.grid(c,w,h,'rgba(200,100,50,0.06)',35);

    U7.txt(c,'الدم تحت المجهر',w/2,22,'#7A0000',14,true);

    // Plasma label
    U7.txt(c,'البلازما (سائل أصفر باهت)',w/2,h*0.89,'#B8860B',11,false);

    // Move & draw cells
    S.cells.forEach(cell=>{
      cell.x+=cell.dx+Math.sin(S.t*cell.speed+cell.phase)*0.0003;
      cell.y+=cell.dy+Math.cos(S.t*cell.speed+cell.phase)*0.0003;
      if(cell.x<0.1||cell.x>0.9) cell.dx*=-1;
      if(cell.y<0.1||cell.y>0.85) cell.dy*=-1;

      const t=types[cell.type];
      const cx2=cell.x*w, cy2=cell.y*h;
      const r=t.size*(w/500);
      const isZoomed=S.zoom===cell.type;
      const alpha=S.zoom&&!isZoomed?0.2:1;

      c.globalAlpha=alpha;
      if(cell.type==='rbc'){
        // Biconcave disk shape
        const g=c.createRadialGradient(cx2-r*0.2,cy2-r*0.2,0,cx2,cy2,r);
        g.addColorStop(0,'#E74C3C'); g.addColorStop(0.4,'#C0392B'); g.addColorStop(0.8,'#922B21'); g.addColorStop(1,'rgba(192,57,43,0.3)');
        c.fillStyle=g;
        c.beginPath(); c.ellipse(cx2,cy2,r,r*0.65,Math.sin(S.t+cell.phase)*0.5,0,Math.PI*2); c.fill();
        // Center dimple
        c.fillStyle='rgba(100,0,0,0.3)'; c.beginPath(); c.ellipse(cx2,cy2,r*0.3,r*0.2,0,0,Math.PI*2); c.fill();
      } else if(cell.type==='wbc'){
        // Irregular larger cell with nucleus
        c.fillStyle='rgba(93,109,126,0.8)';
        c.beginPath(); c.arc(cx2,cy2,r,0,Math.PI*2); c.fill();
        c.fillStyle='rgba(40,55,70,0.9)'; c.beginPath(); c.arc(cx2+r*0.1,cy2-r*0.1,r*0.55,0,Math.PI*2); c.fill();
      } else {
        // Platelet — small irregular
        c.fillStyle='rgba(243,156,18,0.8)';
        c.beginPath(); c.arc(cx2,cy2,r,0,Math.PI*2); c.fill();
      }
      c.globalAlpha=1;

      if(isZoomed){
        c.strokeStyle='white'; c.lineWidth=2;
        c.beginPath(); c.arc(cx2,cy2,r+3,0,Math.PI*2); c.stroke();
      }
    });

    // Info panel if zoomed
    if(S.zoom&&S.zoom!=='plasma'){
      const t=types[S.zoom];
      c.fillStyle='rgba(255,255,255,0.92)'; c.strokeStyle=t.color; c.lineWidth=2.5;
      c.beginPath(); c.roundRect(w*0.05,h*0.78,w*0.9,h*0.17,10); c.fill(); c.stroke();
      U7.txt(c,t.label,w/2,h*0.81,t.color,13,true);
      U7.txt(c,t.desc,w/2,h*0.84,t.color,11,false);
      // Count info
      const counts={rbc:'5 مليون خلية/مم³',wbc:'4,000-11,000 خلية/مم³',platelet:'150,000-400,000/مم³'};
      U7.txt(c,'العدد الطبيعي: '+counts[S.zoom],w/2,h*0.875,'#555',11,false);
    } else if(S.zoom==='plasma'){
      c.fillStyle='rgba(255,255,255,0.92)'; c.strokeStyle='#D4A017'; c.lineWidth=2.5;
      c.beginPath(); c.roundRect(w*0.05,h*0.78,w*0.9,h*0.17,10); c.fill(); c.stroke();
      U7.txt(c,plasma.label,w/2,h*0.81,'#B8860B',13,true);
      U7.txt(c,plasma.desc,w/2,h*0.84,'#B8860B',11,false);
      U7.txt(c,'تشكّل 55% من حجم الدم الكلي',w/2,h*0.875,'#555',11,false);
    }

    U7.txt(c,'اضغط على خلية لمعرفة تفاصيلها',w/2,h-16,'#888',11,false);

    S.t+=0.02;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 7-3 TAB 1: وظائف الخلايا ──
function simBlood2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.b2) simState.b2={t:0,step:0,playing:true};
  const S=simState.b2;

  const scenarios=[
    {title:'خلايا الدم الحمراء تحمل O₂',color:'#C0392B',fn:drawO2Transport},
    {title:'خلايا الدم البيضاء تبتلع بكتيريا',color:'#2C3E50',fn:drawWBCAttack},
    {title:'الصفائح تُوقف النزيف',color:'#F39C12',fn:drawClotting}
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔬 وظائف مكوّنات الدم</div>
    </div>
    ${scenarios.map((s,i)=>`<button class="ctrl-btn" onclick="simState.b2.step=${i};simState.b2.t=0" style="border-right:4px solid ${s.color};font-size:12px;margin-bottom:4px">
      ${['🔴','⚪','🩹'][i]} ${s.title}
    </button>`).join('')}
    <button class="ctrl-btn play" onclick="simState.b2.playing=!simState.b2.playing;this.textContent=simState.b2.playing?'⏸ إيقاف':'▶ تشغيل'">⏸ إيقاف</button>
    <button class="ctrl-btn reset" onclick="simState.b2.step=(simState.b2.step+1)%3;simState.b2.t=0">← التالي</button>
    <div class="info-box" style="font-size:12px;line-height:1.9;margin-top:8px">
      كل مكوّن من الدم<br>له وظيفة حيوية مختلفة!
    </div>`);

  function drawO2Transport(w,h){
    const cx=w/2, cy=h/2;
    U7.txt(c,'نقل الأكسجين من الرئة إلى الخلايا',w/2,30,'#C0392B',13,true);
    // Lung to tissue path
    c.strokeStyle='rgba(200,50,50,0.25)'; c.lineWidth=30; c.lineCap='round';
    c.beginPath(); c.moveTo(w*0.1,cy); c.lineTo(w*0.9,cy); c.stroke();
    // Label ends
    U7.pill(c,w*0.12,cy-30,80,26,'rgba(60,130,200,0.8)','الرئة','white');
    U7.pill(c,w*0.88,cy-30,80,26,'rgba(150,80,200,0.8)','الأنسجة','white');

    // Animated RBC
    const pos=(S.t*0.15)%1;
    const rbcX=w*0.1+pos*(w*0.8);
    const isOxy=pos<0.5;
    const g=c.createRadialGradient(rbcX-7,cy-5,0,rbcX,cy,14);
    g.addColorStop(0,isOxy?'#E74C3C':'#5D6D7E');
    g.addColorStop(1,isOxy?'#922B21':'#2C3E50');
    c.fillStyle=g; c.beginPath(); c.ellipse(rbcX,cy,14,9,0,0,Math.PI*2); c.fill();
    // O2 dots
    if(isOxy){
      for(let i=0;i<3;i++){
        const a=(Math.PI*2/3)*i+S.t*2;
        c.fillStyle='rgba(0,180,100,0.9)'; c.beginPath();
        c.arc(rbcX+Math.cos(a)*10,cy+Math.sin(a)*6,3,0,Math.PI*2); c.fill();
        c.font='7px sans-serif'; c.fillStyle='white'; c.textAlign='center'; c.textBaseline='middle';
        c.fillText('O₂',rbcX+Math.cos(a)*10,cy+Math.sin(a)*6);
      }
    }
    // Color legend
    U7.txt(c,isOxy?'مؤكسج (أحمر)':'غير مؤكسج (داكن)',w/2,h*0.72,isOxy?'#C0392B':'#5D6D7E',12,true);
  }

  function drawWBCAttack(w,h){
    const cx=w/2, cy=h/2;
    U7.txt(c,'خلية دم بيضاء تبتلع بكتيريا وتقتلها',w/2,30,'#2C3E50',13,true);
    // Bacteria
    const nBac=5;
    for(let i=0;i<nBac;i++){
      const phase=S.t*0.5+i*(Math.PI*2/nBac);
      const br=Math.min(120,90+S.t*5);
      const bx=cx+Math.cos(phase)*br, by=cy+Math.sin(phase)*br*0.6;
      const captured=br<70;
      c.fillStyle=captured?'rgba(50,150,50,0.5)':'rgba(200,50,50,0.8)';
      c.beginPath(); c.ellipse(bx,by,6,10,phase,0,Math.PI*2); c.fill();
      // flagella
      c.strokeStyle=captured?'rgba(50,150,50,0.4)':'rgba(200,50,50,0.6)'; c.lineWidth=1;
      c.beginPath(); c.moveTo(bx,by+10); c.quadraticCurveTo(bx+10,by+20,bx+5,by+28); c.stroke();
    }
    // WBC (amoeba-like)
    const wbcR=38+Math.sin(S.t*2)*4;
    const g=c.createRadialGradient(cx-10,cy-10,0,cx,cy,wbcR);
    g.addColorStop(0,'rgba(93,109,126,0.95)'); g.addColorStop(1,'rgba(52,73,94,0.7)');
    c.fillStyle=g; c.beginPath();
    for(let a=0;a<Math.PI*2;a+=0.3){
      const r2=wbcR+Math.sin(a*4+S.t*3)*6;
      const x=cx+Math.cos(a)*r2, y=cy+Math.sin(a)*r2;
      a===0?c.moveTo(x,y):c.lineTo(x,y);
    }
    c.closePath(); c.fill();
    // Nucleus
    c.fillStyle='rgba(30,50,70,0.9)'; c.beginPath(); c.arc(cx+5,cy-5,14,0,Math.PI*2); c.fill();
    U7.txt(c,'نواة',cx+5,cy-5,'rgba(255,255,255,0.8)',9,false);
    U7.txt(c,'خلية دم بيضاء',cx,cy+wbcR+16,'#2C3E50',11,true);
    U7.txt(c,'تنتج أجساماً مضادة وإنزيمات قاتلة',w/2,h*0.82,'#555',11,false);
  }

  function drawClotting(w,h){
    U7.txt(c,'الصفائح الدموية تُوقف النزيف',w/2,30,'#F39C12',13,true);
    // Vessel with cut
    c.fillStyle='rgba(200,50,50,0.3)'; c.fillRect(0,h*0.35,w,h*0.3);
    // Cut opening
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#FFF5F5';
    c.fillRect(w*0.42,h*0.2,w*0.16,h*0.6);

    // Fibers forming
    const coverage=Math.min(1,S.t*0.04);
    for(let i=0;i<30*coverage;i++){
      const x=w*0.42+i*(w*0.16/30), y=h*0.35+Math.random()*h*0.3;
      c.strokeStyle='rgba(210,150,50,0.6)'; c.lineWidth=1.5;
      c.beginPath(); c.moveTo(x,h*0.35); c.lineTo(x+Math.sin(i)*20,h*0.65); c.stroke();
    }
    // Platelets converging
    for(let i=0;i<8;i++){
      const t2=Math.min(1,S.t*0.05);
      const startX=w*0.4+Math.cos(i)*60, startY=h*0.5+Math.sin(i)*40;
      const endX=w*0.5+Math.cos(i)*10, endY=h*0.5+Math.sin(i)*8;
      const px=startX+(endX-startX)*t2, py=startY+(endY-startY)*t2;
      c.fillStyle='rgba(243,156,18,0.9)'; c.beginPath(); c.arc(px,py,5,0,Math.PI*2); c.fill();
    }
    U7.txt(c,'صفائح تتكتّل عند موضع الجرح',w/2,h*0.82,'#F39C12',11,false);
    U7.txt(c,'وتنتج ألياف فيبرين لسد الجرح',w/2,h*0.87,'#555',11,false);
  }

  function draw(){
    if(currentSim!=='blood8'||currentTab!==1){ cv.onclick=null; return; }
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#FFF5F5';
    c.fillRect(0,0,w,h);
    U7.grid(c,w,h,'rgba(200,50,50,0.04)',40);
    scenarios[S.step].fn(w,h);
    if(S.playing) S.t+=0.018;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 7-4 · الأوعية الدموية
// ══════════════════════════════════════════════════════════
function simVessels1(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.v1) simState.v1={t:0,pressure:80,highlighted:null};
  const S=simState.v1;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔴 الشرايين — تركيبها</div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">ضغط الدم (mmHg)</div>
      <input type="range" min="60" max="160" step="5" value="80"
        oninput="simState.v1.pressure=+this.value;document.getElementById('v1p').textContent=this.value"
        style="width:100%">
      <div id="v1p" style="text-align:center;font-size:18px;font-weight:800;color:#C0392B">80</div>
    </div>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:8px">
      🔴 الشرايين تحمل الدم <strong>من القلب</strong><br>
      جدران سميكة ومرنة<br>
      تتمدد مع كل نبضة (النبض!)<br>
      ✅ السبب: تحمل الدم بضغط عالٍ
    </div>
    <button class="ctrl-btn" onclick="simState.v1.highlighted=!simState.v1.highlighted">🔍 تكبير الجدار</button>`);

  function draw(){
    if(currentSim!=='vessels8'||currentTab!==0) return;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#FFF5F5';
    c.fillRect(0,0,w,h);
    U7.grid(c,w,h,'rgba(200,50,50,0.04)',40);

    U7.txt(c,'الشريان — Artery',w/2,24,'#7A0000',15,true);

    const pFrac=S.pressure/120;
    const pulse=Math.sin(S.t*5)*0.04*pFrac;
    const baseR=h*0.22;
    const outerR=baseR*(1+pulse);
    const innerR=outerR*0.6;

    const cx=w/2, cy=h*0.5;

    // Outer elastic wall
    const gWall=c.createRadialGradient(cx,cy,innerR,cx,cy,outerR);
    gWall.addColorStop(0,'rgba(200,100,100,0.9)');
    gWall.addColorStop(0.5,'rgba(180,60,60,0.95)');
    gWall.addColorStop(1,'rgba(150,30,30,0.8)');
    c.fillStyle=gWall; c.beginPath(); c.arc(cx,cy,outerR,0,Math.PI*2); c.fill();

    // Muscle layer
    c.strokeStyle='rgba(120,40,40,0.5)'; c.lineWidth=3; c.setLineDash([8,4]);
    c.beginPath(); c.arc(cx,cy,outerR*0.82,0,Math.PI*2); c.stroke();
    c.setLineDash([]);

    // Lumen (blood)
    const bloodG=c.createRadialGradient(cx-innerR*0.2,cy-innerR*0.2,0,cx,cy,innerR);
    bloodG.addColorStop(0,'#E74C3C'); bloodG.addColorStop(1,'#922B21');
    c.fillStyle=bloodG; c.beginPath(); c.arc(cx,cy,innerR,0,Math.PI*2); c.fill();

    // Moving blood cells
    for(let i=0;i<8;i++){
      const a=(S.t*1.5+i*(Math.PI*2/8))%(Math.PI*2);
      const r2=innerR*0.6;
      const bx=cx+Math.cos(a)*r2, by=cy+Math.sin(a)*r2*0.4;
      c.fillStyle='rgba(255,100,100,0.7)'; c.beginPath(); c.ellipse(bx,by,6,4,a,0,Math.PI*2); c.fill();
    }

    // Labels
    c.strokeStyle='rgba(255,255,255,0.6)'; c.lineWidth=1.5; c.setLineDash([3,3]);
    [[outerR*0.92,45,'جدار خارجي مرن'],[outerR*0.7,135,'طبقة عضلية'],[innerR*0.5,0,'تجويف الدم (lumen)']].forEach(([r3,deg,label])=>{
      const angle=deg*Math.PI/180;
      const lx=cx+Math.cos(angle)*r3, ly=cy+Math.sin(angle)*r3;
      const ex=cx+Math.cos(angle)*(outerR+30), ey=cy+Math.sin(angle)*(outerR+30);
      c.beginPath(); c.moveTo(lx,ly); c.lineTo(ex,ey); c.stroke();
      c.setLineDash([]);
      c.fillStyle='#333'; c.font='11px Tajawal'; c.textAlign= deg<90?'left':'right';
      c.textBaseline='middle'; c.fillText(label,ex+(deg<90?4:-4),ey);
      c.setLineDash([3,3]);
    });
    c.setLineDash([]);

    // Pressure indicator
    const pColor=S.pressure<90?'#27AE60':S.pressure<120?'#F39C12':'#C0392B';
    U7.txt(c,`الضغط: ${S.pressure} mmHg`,w/2,h*0.88,pColor,14,true);
    U7.txt(c,S.pressure<90?'ضغط طبيعي':S.pressure<120?'ضغط مرتفع قليلاً':'ضغط مرتفع جداً',w/2,h*0.93,pColor,12,false);

    S.t+=0.025;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simVessels2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.v2) simState.v2={t:0,showValve:true};
  const S=simState.v2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔵 الأوردة — تركيبها</div>
    </div>
    <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;margin-bottom:8px">
      <input type="checkbox" ${S.showValve?'checked':''} onchange="simState.v2.showValve=this.checked"> إظهار الصمامات
    </label>
    <div class="info-box" style="font-size:12px;line-height:2">
      🔵 الأوردة تحمل الدم <strong>إلى القلب</strong><br>
      جدران أرق من الشرايين<br>
      تجويف أوسع (قطر أكبر)<br>
      ✅ تحتوي على <strong>صمامات</strong><br>
      تمنع رجوع الدم للأسفل
    </div>`);

  function draw(){
    if(currentSim!=='vessels8'||currentTab!==1) return;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#F5F5FF';
    c.fillRect(0,0,w,h);
    U7.grid(c,w,h,'rgba(50,50,200,0.04)',40);
    U7.txt(c,'الوريد — Vein',w/2,24,'#1A2A6B',15,true);

    // Draw a vein cross-section AND longitudinal view
    const cx=w*0.35, cy=h*0.5;
    const outerR=h*0.22, innerR=outerR*0.75; // Wider lumen, thinner walls

    // Outer wall (thin)
    c.fillStyle='rgba(100,100,180,0.7)'; c.beginPath(); c.arc(cx,cy,outerR,0,Math.PI*2); c.fill();
    // Lumen
    const bloodG=c.createRadialGradient(cx,cy,0,cx,cy,innerR);
    bloodG.addColorStop(0,'#5B9BD5'); bloodG.addColorStop(1,'#2C5F8A');
    c.fillStyle=bloodG; c.beginPath(); c.arc(cx,cy,innerR,0,Math.PI*2); c.fill();
    // Moving blood cells (slower)
    for(let i=0;i<6;i++){
      const a=(S.t*0.8+i*(Math.PI*2/6))%(Math.PI*2);
      const r2=innerR*0.55;
      const bx=cx+Math.cos(a)*r2, by=cy+Math.sin(a)*r2*0.4;
      c.fillStyle='rgba(80,150,220,0.7)'; c.beginPath(); c.ellipse(bx,by,6,4,a,0,Math.PI*2); c.fill();
    }
    // Wall label arrows
    c.strokeStyle='rgba(100,100,180,0.6)'; c.lineWidth=1.5; c.setLineDash([3,3]);
    ['جدار رقيق','تجويف واسع'].forEach((label,i)=>{
      const r3=i===0?outerR*0.88:innerR*0.4;
      const a=i===0?-Math.PI/4:Math.PI/4;
      const lx=cx+Math.cos(a)*r3, ly=cy+Math.sin(a)*r3;
      const ex=cx+Math.cos(a)*(outerR+28), ey=cy+Math.sin(a)*(outerR+28);
      c.beginPath(); c.moveTo(lx,ly); c.lineTo(ex,ey); c.stroke();
      c.setLineDash([]);
      c.fillStyle='#333'; c.font='11px Tajawal';
      c.textAlign=i===0?'right':'right'; c.textBaseline='middle';
      c.fillText(label,ex-4,ey);
      c.setLineDash([3,3]);
    });
    c.setLineDash([]);

    // Longitudinal valve diagram
    const vx=w*0.72, vy=h*0.5, vw=w*0.22, vh=h*0.55;
    c.fillStyle='rgba(100,100,180,0.3)'; c.strokeStyle='rgba(80,80,180,0.6)'; c.lineWidth=2;
    c.beginPath(); c.rect(vx-vw/2,vy-vh/2,vw,vh); c.fill(); c.stroke();
    U7.txt(c,'مقطع طولي',vx,vy-vh/2-12,'#1A2A6B',11,true);

    if(S.showValve){
      // Valve flaps
      const valveY=vy;
      const vo=Math.sin(S.t*0.7)*0.6+0.6; // Open fraction (mostly open)
      [[vx-vw*0.1,valveY,-1],[vx+vw*0.1,valveY,1]].forEach(([vvx,vvy,dir])=>{
        c.fillStyle='rgba(150,100,50,0.8)'; c.strokeStyle='rgba(100,60,20,0.9)'; c.lineWidth=2;
        c.beginPath();
        c.moveTo(vvx,vvy-vh*0.12);
        c.quadraticCurveTo(vvx+dir*vw*0.2*vo,vvy,vvx,vvy+vh*0.12);
        c.closePath(); c.fill(); c.stroke();
      });
      U7.txt(c,'صمام مفتوح',vx,valveY+vh*0.17,'#7A4A10',10,true);
      // Arrow showing blood going UP
      c.strokeStyle='rgba(91,155,213,0.8)'; c.lineWidth=3;
      c.beginPath(); c.moveTo(vx,vy+vh*0.35); c.lineTo(vx,vy-vh*0.35); c.stroke();
      c.fillStyle='rgba(91,155,213,0.8)';
      c.beginPath(); c.moveTo(vx,vy-vh*0.35); c.lineTo(vx-8,vy-vh*0.25); c.lineTo(vx+8,vy-vh*0.25); c.closePath(); c.fill();
    }

    // Blood cells moving upward in vein
    const cellT=(S.t*0.3)%1;
    const bcY=vy+vh/2-cellT*vh;
    c.fillStyle='rgba(91,155,213,0.8)'; c.beginPath(); c.ellipse(vx,bcY,8,5,0,0,Math.PI*2); c.fill();

    U7.txt(c,'الدم يتدفق نحو القلب ↑',vx,vy+vh/2+18,'#2980B9',11,false);

    S.t+=0.025;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simVessels3(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.v3) simState.v3={t:0,showDiffusion:true,zoom:1};
  const S=simState.v3;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔬 الشعيرات الدموية</div>
    </div>
    <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;margin-bottom:8px">
      <input type="checkbox" ${S.showDiffusion?'checked':''} onchange="simState.v3.showDiffusion=this.checked"> إظهار انتشار المواد
    </label>
    <div class="ctrl-section">
      <div class="ctrl-label">تكبير</div>
      <input type="range" min="1" max="3" step="0.5" value="1" oninput="simState.v3.zoom=+this.value;document.getElementById('v3z').textContent=this.value+'×'" style="width:100%">
      <div id="v3z" style="text-align:center;font-size:13px;color:#666">1×</div>
    </div>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:8px">
      أصغر وعاء دموي!<br>
      جدار = طبقة خلية واحدة<br>
      ✅ O₂ وجلوكوز → يخرجان للأنسجة<br>
      ✅ CO₂ ونفايات → يدخلان للدم<br>
      الربط بين الشرايين والأوردة
    </div>`);

  function draw(){
    if(currentSim!=='vessels8'||currentTab!==2) return;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#F5FFF5';
    c.fillRect(0,0,w,h);
    U7.grid(c,w,h,'rgba(50,150,50,0.04)',40);
    U7.txt(c,'الشعيرة الدموية — Capillary',w/2,24,'#1A6B1A',15,true);

    const z=S.zoom;
    const capW=h*0.06*z, capL=w*0.7;
    const cx=w/2, cy=h*0.5;

    // Capillary tube (very thin walls)
    c.fillStyle='rgba(220,120,100,0.6)'; c.strokeStyle='rgba(180,80,60,0.7)'; c.lineWidth=2;
    c.beginPath(); c.rect(cx-capL/2,cy-capW/2,capL,capW); c.fill(); c.stroke();

    // Thin wall indicator
    c.strokeStyle='rgba(180,80,60,0.4)'; c.lineWidth=1; c.setLineDash([2,2]);
    c.beginPath(); c.rect(cx-capL/2+3,cy-capW/2+3,capL-6,capW-6); c.stroke();
    c.setLineDash([]);

    // Wall thickness annotation
    const wallT=3;
    c.strokeStyle='rgba(100,100,100,0.6)'; c.lineWidth=1.5;
    [[cx-capL/2,cy-capW/2,cx-capL/2,cy-capW*0.8,'طبقة خلية واحدة (≈1μm)']].forEach(([x1,y1,x2,y2,lbl])=>{
      c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.stroke();
      c.fillStyle='#444'; c.font='10px Tajawal'; c.textAlign='center'; c.textBaseline='bottom';
      c.fillText(lbl,cx-capL/2,y2-4);
    });

    // Red blood cells barely fitting
    const nRBC=6;
    for(let i=0;i<nRBC;i++){
      const t2=(S.t*0.15+i/nRBC)%1;
      const bx=cx-capL/2+t2*capL;
      const r=capW*0.38;
      c.fillStyle='rgba(192,57,43,0.85)'; c.beginPath(); c.ellipse(bx,cy,r,r*0.72,0,0,Math.PI*2); c.fill();
    }

    // Diffusing molecules
    if(S.showDiffusion){
      const nMol=12;
      for(let i=0;i<nMol;i++){
        const phase=(S.t*0.4+i*(Math.PI*2/nMol))%(Math.PI*2);
        const isO2=i%2===0;
        const startY=isO2?cy-capW*0.3:cy+capW*0.3;
        const progress=Math.sin(phase)*0.5+0.5;
        const mx2=cx-capL*0.35+i*(capL*0.7/nMol);
        const my2=startY+(isO2?-1:1)*capW*(0.7+progress*0.8);
        const alpha=0.5+progress*0.5;
        c.fillStyle=isO2?`rgba(0,180,100,${alpha})`:`rgba(50,50,200,${alpha})`;
        c.beginPath(); c.arc(mx2,my2,4,0,Math.PI*2); c.fill();
        c.font='7px sans-serif'; c.fillStyle='white'; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(isO2?'O₂':'CO₂',mx2,my2);
      }
      // Arrows
      c.fillStyle='rgba(0,180,100,0.5)'; c.font='10px Tajawal'; c.textAlign='center';
      c.fillText('→ O₂ يخرج للأنسجة',cx,cy-capW*0.9);
      c.fillStyle='rgba(50,50,200,0.5)';
      c.fillText('← CO₂ يدخل للدم',cx,cy+capW*0.9);
    }

    // Tissue cells around capillary
    const tissueCols=['rgba(220,190,130,0.3)','rgba(200,170,110,0.25)','rgba(230,200,140,0.28)'];
    for(let i=0;i<8;i++){
      const tx=cx-capL*0.4+i*(capL*0.8/8);
      [[ty=cy-capW*1.6],[ty=cy+capW*1.4]].forEach(([t3])=>{
        c.fillStyle=tissueCols[i%3]; c.strokeStyle='rgba(180,140,80,0.3)'; c.lineWidth=1;
        c.beginPath(); c.roundRect(tx-16,t3-12,32,24,4); c.fill(); c.stroke();
      });
    }
    U7.txt(c,'خلايا الأنسجة (تستهلك O₂)',cx,h*0.86,'#7A5A10',11,false);

    S.t+=0.025;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 7-5 · الجهاز التنفسي
// ══════════════════════════════════════════════════════════
function simLungs1(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.lu1) simState.lu1={t:0,breathing:true,phase:'inhale',breathRate:15};
  const S=simState.lu1;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🫁 الجهاز التنفسي</div>
    </div>
    <button class="ctrl-btn play" onclick="simState.lu1.breathing=!simState.lu1.breathing;this.textContent=simState.lu1.breathing?'⏸ إيقاف':'▶ تشغيل'">⏸ إيقاف</button>
    <div class="ctrl-section" style="margin-top:8px">
      <div class="ctrl-label">معدل التنفس (نفَس/دقيقة)</div>
      <input type="range" min="8" max="40" step="1" value="15"
        oninput="simState.lu1.breathRate=+this.value;document.getElementById('lu1br').textContent=this.value"
        style="width:100%">
      <div id="lu1br" style="text-align:center;font-size:18px;font-weight:800;color:#2980B9">15</div>
    </div>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:8px">
      شهيق: الحجاب الحاجز ينخفض<br>
      الرئتان تتمددان ← هواء يدخل<br>
      زفير: الحجاب يرتفع<br>
      الرئتان تنضغطان ← هواء يخرج<br>
      O₂ في الهواء: 21%
    </div>`);

  function draw(){
    if(currentSim!=='lungs8'||currentTab!==0) return;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#F5F8FF';
    c.fillRect(0,0,w,h);
    U7.grid(c,w,h,'rgba(50,50,200,0.04)',40);
    U7.txt(c,'الجهاز التنفسي — مسار الهواء',w/2,24,'#1A2A7A',15,true);

    const cycleDur=60/S.breathRate;
    if(S.breathing) S.phase=(S.t%(cycleDur))<cycleDur/2?'inhale':'exhale';
    const isInhale=S.phase==='inhale';
    const cycleProgress=isInhale?(S.t%cycleDur)/(cycleDur/2):((S.t%cycleDur)-cycleDur/2)/(cycleDur/2);
    const expansion=isInhale?cycleProgress:1-cycleProgress;

    const cx=w/2, topY=h*0.12;
    // Trachea
    c.fillStyle='rgba(200,200,230,0.6)'; c.strokeStyle='rgba(100,100,180,0.5)'; c.lineWidth=2;
    c.beginPath(); c.rect(cx-12,topY,24,h*0.2); c.fill(); c.stroke();
    U7.txt(c,'القصبة',cx+22,topY+h*0.1,'#555',10,false);
    U7.txt(c,'الهوائية',cx+22,topY+h*0.13,'#555',10,false);

    // Bronchi
    const bY=topY+h*0.2;
    c.strokeStyle='rgba(100,100,180,0.5)'; c.lineWidth=2;
    c.beginPath(); c.moveTo(cx,bY); c.quadraticCurveTo(cx-30,bY+h*0.05,cx-w*0.18,bY+h*0.08); c.stroke();
    c.beginPath(); c.moveTo(cx,bY); c.quadraticCurveTo(cx+30,bY+h*0.05,cx+w*0.18,bY+h*0.08); c.stroke();

    // Lungs (expanding/contracting)
    const lScale=0.85+expansion*0.15;
    [[cx-w*0.22,h*0.55,8,-1],[cx+w*0.22,h*0.55,8,1]].forEach(([lx,ly,sw,dir])=>{
      c.save(); c.translate(lx,ly); c.scale(lScale,lScale);
      const lg=c.createRadialGradient(0,-20,0,0,0,sw*6.5);
      lg.addColorStop(0,'rgba(255,180,180,0.95)');
      lg.addColorStop(0.5,'rgba(240,130,130,0.85)');
      lg.addColorStop(1,'rgba(200,80,80,0.5)');
      c.fillStyle=lg; c.strokeStyle='rgba(180,60,60,0.6)'; c.lineWidth=2;
      c.beginPath();
      c.moveTo(0,-sw*6); c.bezierCurveTo(dir*sw*5,-sw*6,dir*sw*7,-sw*2,dir*sw*7,sw*2);
      c.bezierCurveTo(dir*sw*7,sw*5,dir*sw*4,sw*7,0,sw*7);
      c.bezierCurveTo(-dir*sw*1,sw*7,0,sw*5,0,-sw*6);
      c.fill(); c.stroke();
      // Bronchioles
      for(let i=0;i<4;i++){
        const a=-Math.PI/2+dir*(i-1.5)*0.35;
        c.strokeStyle='rgba(180,80,80,0.5)'; c.lineWidth=1;
        c.beginPath(); c.moveTo(0,-sw*2); c.lineTo(Math.cos(a)*sw*4,Math.sin(a)*sw*4); c.stroke();
      }
      c.restore();
      U7.txt(c,dir<0?'الرئة اليسرى':'الرئة اليمنى',lx,ly+sw*6.5*(lScale)+14,'#C0392B',10,true);
    });

    // Diaphragm
    const diagY=h*0.8-expansion*h*0.04;
    c.fillStyle='rgba(180,120,80,0.5)'; c.strokeStyle='rgba(140,80,40,0.7)'; c.lineWidth=3;
    c.beginPath(); c.ellipse(cx,diagY,w*0.35,h*0.06,0,0,Math.PI); c.fill(); c.stroke();
    U7.txt(c,'الحجاب الحاجز',cx,diagY+18,'#7A4A10',11,true);

    // Air flow particles
    if(S.breathing){
      const nPart=6;
      for(let i=0;i<nPart;i++){
        const prog=(S.t*(S.breathRate/10)+i/nPart)%1;
        const ay=isInhale?topY+prog*(h*0.35):topY+h*0.35-prog*(h*0.35);
        c.fillStyle=isInhale?'rgba(100,200,100,0.7)':'rgba(200,100,100,0.7)';
        c.beginPath(); c.arc(cx+(i%2===0?-5:5),ay,4,0,Math.PI*2); c.fill();
      }
    }

    // Phase label
    const phaseCol=isInhale?'#27AE60':'#C0392B';
    U7.pill(c,w/2,h*0.93,200,28,phaseCol,isInhale?'شهيق ← هواء يدخل':'زفير → هواء يخرج','white');

    // Larynx label
    U7.txt(c,'الحنجرة (صندوق الصوت)',cx+28,topY+6,'#555',9,false);

    if(S.breathing) S.t+=0.016;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simLungs2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.lu2) simState.lu2={t:0,exhaled:0,measuring:false};
  const S=simState.lu2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📏 قياس حجم الهواء</div>
    </div>
    <button class="ctrl-btn play" onclick="simState.lu2.measuring=true;simState.lu2.exhaled=0;simState.lu2.t=0">💨 ازفر بكل طاقتك</button>
    <button class="ctrl-btn reset" onclick="simState.lu2.measuring=false;simState.lu2.exhaled=0">↺ إعادة</button>
    <div id="lu2vol" style="text-align:center;font-size:22px;font-weight:800;color:#2980B9;margin:8px 0">0 مل</div>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:8px">
      السعة الحيوية<br>
      ≈ 3,500 - 5,000 مل للذكور<br>
      ≈ 2,500 - 4,000 مل للإناث<br>
      الهواء الباقي دائماً = 1,200 مل<br>
      (لا يمكن إخراجه)
    </div>`);

  function draw(){
    if(currentSim!=='lungs8'||currentTab!==1) return;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#F5F8FF';
    c.fillRect(0,0,w,h);
    U7.txt(c,'قياس حجم هواء الزفير',w/2,24,'#1A2A7A',15,true);

    // Graduated container
    const bx=w*0.3, by=h*0.15, bw=w*0.4, bh=h*0.65;
    const maxVol=4500;
    if(S.measuring && S.exhaled<maxVol) S.exhaled=Math.min(maxVol,S.exhaled+maxVol*0.008);
    if(document.getElementById('lu2vol')) document.getElementById('lu2vol').textContent=Math.round(S.exhaled)+' مل';

    // Container background
    c.fillStyle='rgba(200,220,255,0.2)'; c.strokeStyle='rgba(100,150,200,0.6)'; c.lineWidth=2;
    c.beginPath(); c.rect(bx,by,bw,bh); c.fill(); c.stroke();

    // Water fill (going down as air comes in)
    const fillFrac=1-S.exhaled/maxVol;
    const fillY=by+bh*fillFrac;
    const waterG=c.createLinearGradient(bx,fillY,bx,by+bh);
    waterG.addColorStop(0,'rgba(100,180,255,0.7)'); waterG.addColorStop(1,'rgba(50,100,200,0.8)');
    c.fillStyle=waterG; c.beginPath(); c.rect(bx,fillY,bw,by+bh-fillY); c.fill();

    // Graduation marks
    for(let v=0;v<=5000;v+=500){
      const yy=by+bh*(1-v/maxVol);
      if(yy<by||yy>by+bh) continue;
      c.strokeStyle='rgba(100,150,200,0.5)'; c.lineWidth=v%1000===0?2:1;
      c.beginPath(); c.moveTo(bx,yy); c.lineTo(bx+12,yy); c.stroke();
      c.beginPath(); c.moveTo(bx+bw-12,yy); c.lineTo(bx+bw,yy); c.stroke();
      if(v%1000===0){
        c.fillStyle='#444'; c.font='11px Tajawal'; c.textAlign='right'; c.textBaseline='middle';
        c.fillText(v+' مل',bx-8,yy);
      }
    }

    // Current level line
    if(S.exhaled>0){
      const curY=by+bh*(1-S.exhaled/maxVol);
      c.strokeStyle='#E74C3C'; c.lineWidth=3;
      c.beginPath(); c.moveTo(bx,curY); c.lineTo(bx+bw,curY); c.stroke();
      // Volume annotation
      c.fillStyle='rgba(231,76,60,0.1)'; c.beginPath(); c.rect(bx,curY,bw,by+bh-curY); c.fill();
    }

    // Tube/mouthpiece
    c.fillStyle='rgba(180,180,220,0.6)'; c.strokeStyle='rgba(100,100,180,0.7)'; c.lineWidth=2;
    c.beginPath(); c.rect(bx+bw-4,by+bh*0.55,w*0.12,8); c.fill(); c.stroke();
    U7.txt(c,'أنبوبة الزفير',bx+bw+w*0.08,by+bh*0.555,'#555',10,false);

    // Person blowing
    const mouthX=bx+bw+w*0.22;
    c.font='48px serif'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(S.measuring?'😤':'😌',mouthX,by+bh*0.55);

    // Result bar
    if(S.exhaled>0){
      const pct=Math.round((S.exhaled/4500)*100);
      U7.txt(c,`${Math.round(S.exhaled)} مل (${pct}% من السعة القصوى)`,w/2,h*0.88,'#2980B9',13,true);
      if(S.exhaled>=4000) U7.txt(c,'ممتاز! 🏆 سعة رئوية جيدة جداً',w/2,h*0.93,'#27AE60',12,false);
    } else {
      U7.txt(c,'اضغط "ازفر" وخذ نفسًا عميقًا',w/2,h*0.88,'#888',12,false);
    }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 7-6 · تبادل الغازات في الحويصلات الهوائية
// ══════════════════════════════════════════════════════════
function simGasEx1(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.gx1) simState.gx1={t:0,o2conc:20,speed:1};
  const S=simState.gx1;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">💨 تبادل الغازات في الحويصلة</div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">تركيز O₂ في الهواء الداخل (%)</div>
      <input type="range" min="5" max="21" step="1" value="20"
        oninput="simState.gx1.o2conc=+this.value;document.getElementById('gx1o2').textContent=this.value+'%'"
        style="width:100%">
      <div id="gx1o2" style="text-align:center;font-size:18px;font-weight:800;color:#27AE60">20%</div>
    </div>
    <div class="ctrl-section" style="margin-top:6px">
      <div class="ctrl-label">سرعة الانتشار</div>
      <input type="range" min="0.5" max="3" step="0.5" value="1"
        oninput="simState.gx1.speed=+this.value" style="width:100%">
    </div>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:8px">
      الانتشار: من ↑ تركيز → ↓ تركيز<br>
      O₂ في الهواء > O₂ في الدم<br>
      → O₂ ينتشر للدم<br>
      CO₂ في الدم > CO₂ في الهواء<br>
      → CO₂ ينتشر للهواء
    </div>`);

  function draw(){
    if(currentSim!=='gasex8'||currentTab!==0) return;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#F5FFF5';
    c.fillRect(0,0,w,h);
    U7.grid(c,w,h,'rgba(50,150,50,0.04)',40);
    U7.txt(c,'تبادل الغازات في الحويصلة الهوائية',w/2,24,'#1A6B1A',15,true);

    const cx=w/2, cy=h*0.48;
    const alR=Math.min(w,h)*0.28; // Alveolus radius

    // Alveolus (air sac)
    const alG=c.createRadialGradient(cx-alR*0.2,cy-alR*0.2,0,cx,cy,alR);
    alG.addColorStop(0,`rgba(100,200,255,${0.3+S.o2conc/30})`);
    alG.addColorStop(0.8,'rgba(150,220,255,0.2)');
    alG.addColorStop(1,'rgba(100,180,255,0.1)');
    c.fillStyle=alG; c.strokeStyle='rgba(80,160,200,0.7)'; c.lineWidth=2.5;
    c.beginPath(); c.arc(cx,cy,alR,0,Math.PI*2); c.fill(); c.stroke();
    U7.txt(c,'الحويصلة الهوائية',cx,cy-alR*0.55,'#1A5A8A',12,true);
    U7.txt(c,`O₂: ${S.o2conc}%`,cx,cy,'#27AE60',14,true);
    U7.txt(c,'CO₂: 0.04%',cx,cy+22,'#E74C3C',12,false);

    // Capillary (blood vessel wrapping around alveolus)
    const capR=alR+24;
    c.strokeStyle='rgba(192,57,43,0.5)'; c.lineWidth=18;
    c.beginPath(); c.arc(cx,cy,capR,0.3,Math.PI*2-0.3); c.stroke();
    // Blood content
    c.strokeStyle='rgba(180,40,40,0.7)'; c.lineWidth=14;
    c.beginPath(); c.arc(cx,cy,capR,0.3,Math.PI*2-0.3); c.stroke();
    U7.txt(c,'شعيرة دموية',cx+capR*0.72,cy-capR*0.72,'#7A0000',10,true);

    // Diffusion arrows (O2 going in, CO2 going out)
    const nArrows=8;
    for(let i=0;i<nArrows;i++){
      const angle=(Math.PI*2/nArrows)*i+S.t*S.speed*0.3;
      const alpha=(S.o2conc/21);

      // O2: alveolus → blood
      const o2prog=((S.t*S.speed*0.5+i/nArrows)%1);
      const o2x=cx+Math.cos(angle)*(alR*0.85+o2prog*30);
      const o2y=cy+Math.sin(angle)*(alR*0.85+o2prog*30);
      c.fillStyle=`rgba(0,180,100,${alpha*(1-o2prog)})`;
      c.beginPath(); c.arc(o2x,o2y,4,0,Math.PI*2); c.fill();
      c.font='7px sans-serif'; c.fillStyle=`rgba(0,150,80,${alpha*(1-o2prog)})`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('O₂',o2x,o2y);

      // CO2: blood → alveolus
      const co2prog=((S.t*S.speed*0.3+i/nArrows+0.5)%1);
      const co2x=cx+Math.cos(angle+Math.PI/8)*(capR-8-co2prog*30);
      const co2y=cy+Math.sin(angle+Math.PI/8)*(capR-8-co2prog*30);
      c.fillStyle=`rgba(200,50,50,${0.5*(1-co2prog)})`;
      c.beginPath(); c.arc(co2x,co2y,3.5,0,Math.PI*2); c.fill();
      c.font='7px sans-serif'; c.fillStyle=`rgba(180,30,30,${0.5*(1-co2prog)})`; c.textAlign='center';
      c.fillText('CO₂',co2x,co2y);
    }

    // Thin wall label
    U7.txt(c,'جدار رقيق جداً (طبقة خلية واحدة)',cx,cy+alR+42,'#555',11,false);
    U7.txt(c,'← تسهّل الانتشار السريع →',cx,cy+alR+58,'#888',10,false);

    // O2 concentration warning
    if(S.o2conc<12){
      U7.pill(c,cx,h*0.9,260,28,'rgba(200,50,50,0.8)','⚠️ تركيز O₂ منخفض! يقل الانتشار','white');
    }

    S.t+=0.016;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simGasEx2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.gx2) simState.gx2={t:0,running:false,size:'small'};
  const S=simState.gx2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧪 لماذا الحويصلات صغيرة؟</div>
      <div style="font-size:11px;color:#888">قارن بين حويصلتين بنفس الحجم الكلي</div>
    </div>
    <button class="ctrl-btn play" onclick="simState.gx2.running=!simState.gx2.running;this.textContent=simState.gx2.running?'⏸ إيقاف':'▶ ابدأ التجربة'">▶ ابدأ التجربة</button>
    <button class="ctrl-btn reset" onclick="simState.gx2.running=false;simState.gx2.t=0">↺ إعادة</button>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:8px">
      مساحة السطح ∝ نصف القطر²<br>
      الحجم ∝ نصف القطر³<br>
      → الصغيرة: نسبة مساحة/حجم أكبر<br>
      → انتشار أسرع وأكثر فعالية!<br>
      300 مليون حويصلة في الرئتين
    </div>`);

  function draw(){
    if(currentSim!=='gasex8'||currentTab!==1) return;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#F5FFF5';
    c.fillRect(0,0,w,h);
    U7.txt(c,'مقارنة: حويصلة كبيرة مقابل حويصلات صغيرة',w/2,22,'#1A6B1A',13,true);

    // Left: one big alveolus
    const lx=w*0.25, midY=h*0.52, bigR=h*0.22;
    c.fillStyle='rgba(150,220,255,0.3)'; c.strokeStyle='rgba(80,160,200,0.7)'; c.lineWidth=2.5;
    c.beginPath(); c.arc(lx,midY,bigR,0,Math.PI*2); c.fill(); c.stroke();
    U7.txt(c,'حويصلة كبيرة',lx,midY-bigR-14,'#1A5A8A',12,true);
    const bigArea=Math.round(Math.PI*4*bigR*bigR/100);
    const bigVol=Math.round(Math.PI*4/3*bigR*bigR*bigR/100);
    U7.txt(c,`المساحة: ${bigArea} وحدة`,lx,midY+bigR+18,'#27AE60',11,false);
    U7.txt(c,`الحجم: ${bigVol} وحدة`,lx,midY+bigR+34,'#E74C3C',11,false);
    // Diffusion (few molecules reach center)
    if(S.running){
      for(let i=0;i<4;i++){
        const a=(Math.PI*2/4)*i+S.t*0.3;
        const prog=Math.min(1,S.t*0.05);
        const dist=bigR*prog*0.6;
        c.fillStyle=`rgba(0,180,100,${1-prog*0.8})`;
        c.beginPath(); c.arc(lx+Math.cos(a)*dist,midY+Math.sin(a)*dist,4,0,Math.PI*2); c.fill();
      }
    }

    // Right: multiple small alveoli (same total volume)
    const rx=w*0.7, smallR=h*0.07, cols=3, rows=3;
    let totalSmallArea=0;
    for(let r=0;r<rows;r++) for(let col=0;col<cols;col++){
      const sx=rx+(col-1)*smallR*2.2;
      const sy=midY+(r-1)*smallR*2.2;
      c.fillStyle='rgba(150,220,255,0.4)'; c.strokeStyle='rgba(80,160,200,0.7)'; c.lineWidth=2;
      c.beginPath(); c.arc(sx,sy,smallR,0,Math.PI*2); c.fill(); c.stroke();
      totalSmallArea+=Math.round(Math.PI*4*smallR*smallR/100);
      // Faster diffusion (smaller = more surface)
      if(S.running){
        const prog=Math.min(1,S.t*0.12);
        c.fillStyle=`rgba(0,180,100,${0.7*(1-prog*0.5)})`;
        c.beginPath(); c.arc(sx,sy,smallR*prog*0.8,0,Math.PI*2); c.fill();
      }
    }
    U7.txt(c,'حويصلات صغيرة',rx,midY-smallR*2.5-14,'#1A5A8A',12,true);
    U7.txt(c,`المساحة: ${totalSmallArea} وحدة`,rx,midY+smallR*2.5+18,'#27AE60',11,false);
    U7.txt(c,`(${Math.round(totalSmallArea/bigArea)}× أكبر!)`,rx,midY+smallR*2.5+34,'#E74C3C',11,true);

    // Winner annotation
    if(S.t>2){
      U7.txt(c,'✅ الحويصلات الصغيرة تتميز بمساحة سطح أكبر',w/2,h*0.9,'#27AE60',12,true);
      U7.txt(c,'→ انتشار أسرع وأكثر كفاءة',w/2,h*0.94,'#555',11,false);
    }

    if(S.running) S.t+=0.016;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 7-7 · التنفس الهوائي
// ══════════════════════════════════════════════════════════
function simRespiration1(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.r1) simState.r1={t:0,running:false,glucoseLeft:100};
  const S=simState.r1;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⚡ معادلة التنفس الهوائي</div>
    </div>
    <button class="ctrl-btn play" onclick="simState.r1.running=!simState.r1.running;simState.r1.glucoseLeft=100;simState.r1.t=0;this.textContent=simState.r1.running?'⏸ إيقاف':'▶ ابدأ التفاعل'">▶ ابدأ التفاعل</button>
    <button class="ctrl-btn reset" onclick="simState.r1.running=false;simState.r1.glucoseLeft=100;simState.r1.t=0">↺ إعادة</button>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:8px">
      <strong>المعادلة:</strong><br>
      جلوكوز + أكسجين →<br>
      ثاني أكسيد الكربون + ماء + طاقة<br><br>
      C₆H₁₂O₆ + 6O₂ →<br>
      6CO₂ + 6H₂O + ATP
    </div>`);

  function draw(){
    if(currentSim!=='respiration8'||currentTab!==0) return;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#FFFFF5';
    c.fillRect(0,0,w,h);
    U7.grid(c,w,h,'rgba(200,200,50,0.04)',40);
    U7.txt(c,'التنفس الهوائي — إنتاج الطاقة',w/2,24,'#7A6A00',15,true);

    // Cell membrane
    const cellX=w/2, cellY=h*0.5, cellR=Math.min(w,h)*0.3;
    const cg=c.createRadialGradient(cellX,cellY,0,cellX,cellY,cellR);
    cg.addColorStop(0,'rgba(255,250,200,0.8)'); cg.addColorStop(1,'rgba(220,220,100,0.2)');
    c.fillStyle=cg; c.strokeStyle='rgba(180,180,50,0.6)'; c.lineWidth=3;
    c.beginPath(); c.arc(cellX,cellY,cellR,0,Math.PI*2); c.fill(); c.stroke();
    U7.txt(c,'خلية حية',cellX,cellY+cellR+16,'#7A6A00',11,true);

    // Mitochondria inside
    for(let i=0;i<3;i++){
      const a=(Math.PI*2/3)*i+S.t*0.1;
      const mx=cellX+Math.cos(a)*cellR*0.4, my=cellY+Math.sin(a)*cellR*0.4;
      c.fillStyle='rgba(200,100,50,0.6)'; c.strokeStyle='rgba(150,60,20,0.7)'; c.lineWidth=1.5;
      c.beginPath(); c.ellipse(mx,my,20,12,a,0,Math.PI*2); c.fill(); c.stroke();
      c.fillStyle='rgba(255,150,80,0.4)';
      c.beginPath(); c.ellipse(mx,my,12,7,a,0,Math.PI*2); c.fill();
      U7.txt(c,'⚡',mx,my,'rgba(255,180,0,0.9)',12,false);
    }
    c.fillStyle='rgba(100,100,100,0.5)'; c.font='9px Tajawal'; c.textAlign='center';
    c.fillText('ميتوكوندريا',cellX+cellR*0.4,cellY+cellR*0.4+18);

    // Glucose molecules entering
    if(S.running){
      const gProg=(S.t*0.2)%1;
      const gx=w*0.12+gProg*(cellX-w*0.12);
      const gy=cellY;
      c.fillStyle='rgba(200,150,50,0.9)'; c.beginPath(); c.arc(gx,gy,10,0,Math.PI*2); c.fill();
      U7.txt(c,'🍬',gx,gy,'#7A4A00',16,false);
      U7.txt(c,'جلوكوز',w*0.08,cellY-20,'#7A4A10',11,true);

      // O2 entering
      const o2Prog=(S.t*0.2+0.5)%1;
      const ox=w*0.12+o2Prog*(cellX-w*0.12);
      const oy=cellY-30;
      c.fillStyle='rgba(50,180,100,0.9)'; c.beginPath(); c.arc(ox,oy,7,0,Math.PI*2); c.fill();
      c.font='8px sans-serif'; c.fillStyle='white'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('O₂',ox,oy);

      // Products exiting
      const pProg=(S.t*0.2+0.3)%1;
      const px=cellX+pProg*(w*0.88-cellX);
      c.fillStyle='rgba(50,50,200,0.7)'; c.beginPath(); c.arc(px,cellY,7,0,Math.PI*2); c.fill();
      c.font='7px sans-serif'; c.fillStyle='white'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('CO₂',px,cellY);

      c.fillStyle='rgba(100,180,255,0.7)'; c.beginPath(); c.arc(px,cellY+22,6,0,Math.PI*2); c.fill();
      c.font='7px sans-serif'; c.fillStyle='white'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('H₂O',px,cellY+22);

      // Energy burst
      if(gProg<0.15){
        const ep=gProg/0.15;
        c.fillStyle=`rgba(255,220,0,${1-ep})`; c.beginPath(); c.arc(cellX,cellY,cellR*ep*0.6,0,Math.PI*2); c.fill();
        U7.txt(c,'⚡',cellX,cellY,`rgba(255,150,0,${1-ep})`,28,false);
      }

      S.glucoseLeft=Math.max(0,100-S.t*3);
    }

    // Equation bar at bottom
    const eqY=h*0.88;
    c.fillStyle='rgba(255,250,220,0.9)'; c.strokeStyle='rgba(180,180,50,0.5)'; c.lineWidth=2;
    c.beginPath(); c.roundRect(w*0.04,eqY,w*0.92,h*0.1,8); c.fill(); c.stroke();
    U7.txt(c,'C₆H₁₂O₆ + 6O₂  →  6CO₂ + 6H₂O + طاقة (ATP)',w/2,eqY+h*0.04,'#5A4A00',12,true);
    U7.txt(c,'جلوكوز + أكسجين → ثاني أكسيد الكربون + ماء + طاقة',w/2,eqY+h*0.075,'#888',11,false);

    if(S.running) S.t+=0.016;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simRespiration2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.r2) simState.r2={t:0,running:true,type:'germinating'};
  const S=simState.r2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌱 تجربة تنفس البازلاء</div>
    </div>
    <button class="ctrl-btn play" onclick="simState.r2.running=!simState.r2.running;this.textContent=simState.r2.running?'⏸ إيقاف':'▶ تشغيل'">⏸ إيقاف</button>
    <button class="ctrl-btn reset" onclick="simState.r2.t=0">↺ إعادة</button>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:8px">
      البذور النابتة تتنفس<br>
      → تنتج حرارة<br>
      البذور الميتة لا تتنفس<br>
      → لا حرارة<br><br>
      المتغير: حالة البذرة<br>
      المقاس: درجة الحرارة
    </div>`);

  function draw(){
    if(currentSim!=='respiration8'||currentTab!==1) return;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#FFFFF5';
    c.fillRect(0,0,w,h);
    U7.txt(c,'تجربة: تنفس البازلاء وإنتاج الحرارة',w/2,24,'#1A6B00',14,true);

    const time=S.running?S.t*0.5:S.t*0.5;
    const germTemp=20+Math.min(12,time*0.8);
    const deadTemp=20+Math.random()*0.1; // stays constant

    // Draw two flasks
    [[w*0.28,h*0.52,'نابتة',germTemp,'#27AE60'],[w*0.72,h*0.52,'ميتة',20,'#7F8C8D']].forEach(([fx,fy,label,temp,col])=>{
      // Flask
      c.fillStyle='rgba(200,240,200,0.3)'; c.strokeStyle='rgba(100,150,100,0.7)'; c.lineWidth=2;
      c.beginPath();
      c.moveTo(fx-40,fy-h*0.28); c.lineTo(fx-40,fy-h*0.08);
      c.quadraticCurveTo(fx-40,fy+h*0.12,fx,fy+h*0.14);
      c.quadraticCurveTo(fx+40,fy+h*0.12,fx+40,fy-h*0.08);
      c.lineTo(fx+40,fy-h*0.28); c.closePath(); c.fill(); c.stroke();

      // Seeds inside
      const seeds=6;
      for(let i=0;i<seeds;i++){
        const si=(i%3)*22-22, sr=Math.floor(i/3)*14;
        const sx=fx+si, sy=fy+h*0.06-sr;
        c.fillStyle=col; c.beginPath(); c.ellipse(sx,sy,8,6,0.3,0,Math.PI*2); c.fill();
        if(label==='نابتة'){
          // Sprout
          c.strokeStyle='rgba(50,200,50,0.8)'; c.lineWidth=1.5;
          c.beginPath(); c.moveTo(sx,sy-6); c.lineTo(sx,sy-14); c.stroke();
        }
      }

      // Thermometer
      const thermoX=fx+50, thermoY=fy-h*0.08;
      const tH=h*0.3;
      const tempFrac=Math.min(1,(temp-18)/15);
      c.fillStyle='rgba(200,200,200,0.5)'; c.strokeStyle='rgba(150,150,150,0.7)'; c.lineWidth=1.5;
      c.beginPath(); c.rect(thermoX-4,thermoY-tH,8,tH); c.fill(); c.stroke();
      c.fillStyle=col; c.beginPath(); c.rect(thermoX-3,thermoY-tH*tempFrac,6,tH*tempFrac); c.fill();
      c.beginPath(); c.arc(thermoX,thermoY+6,8,0,Math.PI*2);
      c.fillStyle=col; c.fill(); c.strokeStyle='rgba(150,150,150,0.7)'; c.stroke();
      U7.txt(c,temp.toFixed(1)+'°C',thermoX,thermoY-tH-14,col,12,true);

      // Heat waves for germinating
      if(label==='نابتة' && temp>23){
        for(let wi=0;wi<3;wi++){
          const wp=(S.t*2+wi*0.33)%1;
          c.strokeStyle=`rgba(255,100,0,${0.5*(1-wp)})`;
          c.lineWidth=1.5;
          c.beginPath(); c.arc(fx,fy,30+wp*30,Math.PI,0); c.stroke();
        }
      }

      U7.txt(c,`بذور ${label}`,fx,fy+h*0.17,col,12,true);
    });

    // Time axis
    const chartX=w*0.1, chartY=h*0.88, chartW=w*0.8, chartH=h*0.08;
    c.fillStyle='rgba(240,240,240,0.5)'; c.beginPath(); c.rect(chartX,chartY,chartW,chartH); c.fill();
    c.strokeStyle='rgba(100,100,100,0.3)'; c.lineWidth=1; c.stroke();
    const chartProg=Math.min(1,S.t*0.03);
    // Germinating temp line
    c.strokeStyle='rgba(39,174,96,0.8)'; c.lineWidth=2.5;
    c.beginPath(); c.moveTo(chartX,chartY+chartH*0.8);
    c.lineTo(chartX+chartW*chartProg,chartY+chartH*(0.8-chartProg*0.7)); c.stroke();
    // Dead temp line (flat)
    c.strokeStyle='rgba(127,140,141,0.7)'; c.lineWidth=2;
    c.beginPath(); c.moveTo(chartX,chartY+chartH*0.9); c.lineTo(chartX+chartW*chartProg,chartY+chartH*0.9); c.stroke();
    U7.txt(c,'الوقت →',chartX+chartW/2,chartY+chartH+10,'#888',10,false);

    if(S.running) S.t+=0.016;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 7-8 · اللياقة البدنية ومعدل النبض
// ══════════════════════════════════════════════════════════
function simFitness1(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.f1) simState.f1={t:0,bpm:70,phase:'rest',history:[],measuring:false,timer:0};
  const S=simState.f1;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">💓 معدل النبض وقياسه</div>
    </div>
    <button class="ctrl-btn" onclick="simState.f1.phase='rest';simState.f1.bpm=70;window._stopHeartbeat();window._playHeartbeat(70);document.getElementById('f1phase').textContent='😴 راحة — 70 نبضة/دقيقة'">😴 راحة</button>
    <button class="ctrl-btn" onclick="simState.f1.phase='walk';simState.f1.bpm=100;window._stopHeartbeat();window._playHeartbeat(100);document.getElementById('f1phase').textContent='🚶 مشي — 100 نبضة/دقيقة'">🚶 مشي</button>
    <button class="ctrl-btn" onclick="simState.f1.phase='run';simState.f1.bpm=150;window._stopHeartbeat();window._playHeartbeat(150);document.getElementById('f1phase').textContent='🏃 جري — 150 نبضة/دقيقة'">🏃 جري</button>
    <button class="ctrl-btn" onclick="simState.f1.phase='sprint';simState.f1.bpm=185;window._stopHeartbeat();window._playHeartbeat(185);document.getElementById('f1phase').textContent='💨 عدو — 185 نبضة/دقيقة'">💨 عدو سريع</button>
    <div id="f1phase" style="text-align:center;font-size:13px;font-weight:700;color:#C0392B;margin:8px 0;padding:8px;background:rgba(192,57,43,0.08);border-radius:8px">😴 راحة — 70 نبضة/دقيقة</div>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:4px">
      قِس نبضك بأصابعك على الرسغ<br>
      عُدّ النبضات لـ 15 ثانية × 4<br>
      الطبيعي: 60-100 نبضة/دقيقة
    </div>`);

  window._playHeartbeat && window._playHeartbeat(S.bpm);

  function draw(){
    if(currentSim!=='fitness8'||currentTab!==0){ window._stopHeartbeat && window._stopHeartbeat(); return; }
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#FFF5F5';
    c.fillRect(0,0,w,h);
    U7.grid(c,w,h,'rgba(200,50,50,0.04)',40);
    U7.txt(c,'معدل النبض في حالات مختلفة',w/2,24,'#7A0000',14,true);

    const cx=w/2, cy=h*0.42;
    // Heart visual
    const pulse=1+Math.sin(S.t*S.bpm/60*Math.PI*2)*0.1;
    const heartCol={rest:'#E74C3C',walk:'#C0392B',run:'#8B0000',sprint:'#5B0000'}[S.phase]||'#E74C3C';
    c.save(); c.translate(cx,cy); c.scale(pulse*1.4,pulse*1.4);
    const hg=c.createRadialGradient(-12,-15,0,0,0,40);
    hg.addColorStop(0,heartCol+'FF'); hg.addColorStop(1,heartCol+'66');
    c.fillStyle=hg;
    c.beginPath();
    c.moveTo(0,30); c.bezierCurveTo(-5,-5,-35,-5,-35,-20);
    c.bezierCurveTo(-35,-40,-5,-40,0,-25);
    c.bezierCurveTo(5,-40,35,-40,35,-20);
    c.bezierCurveTo(35,-5,5,-5,0,30); c.fill();
    c.restore();

    // BPM display
    U7.txt(c,S.bpm+'',cx,cy+10,'white',28,true);
    U7.txt(c,'نبضة/دقيقة',cx,cy+38,'white',10,false);

    // ECG strip
    const ecgY=h*0.73, ecgH=h*0.09;
    c.fillStyle='rgba(0,20,0,0.85)'; c.beginPath(); c.rect(0,ecgY-ecgH*0.5,w,ecgH*2.5); c.fill();
    c.strokeStyle='#00FF88'; c.lineWidth=1.8;
    c.beginPath();
    const ecgSpeed=S.bpm/60;
    for(let i=0;i<w;i++){
      const t2=(S.t*ecgSpeed-(i/w)*ecgSpeed*2.5)%(60/S.bpm);
      const norm=t2/(60/S.bpm);
      let y;
      if(norm<0.05) y=ecgY;
      else if(norm<0.08) y=ecgY-ecgH*0.4;
      else if(norm<0.13) y=ecgY-ecgH*2.8;
      else if(norm<0.18) y=ecgY+ecgH*1.2;
      else if(norm<0.25) y=ecgY-ecgH*0.8;
      else if(norm<0.3) y=ecgY;
      else y=ecgY;
      i===0?c.moveTo(i,y):c.lineTo(i,y);
    }
    c.stroke();
    // ECG labels
    c.fillStyle='rgba(0,255,136,0.6)'; c.font='10px Tajawal'; c.textAlign='left'; c.textBaseline='bottom';
    c.fillText('مخطط القلب الكهربائي (ECG)',6,ecgY-ecgH*0.4);

    // Activity icons
    const acts=[{icon:'😴',bpm:70,label:'راحة'},{icon:'🚶',bpm:100,label:'مشي'},{icon:'🏃',bpm:150,label:'جري'},{icon:'💨',bpm:185,label:'عدو'}];
    acts.forEach((a,i)=>{
      const ax=w*0.12+i*(w*0.76/3);
      const ay=h*0.9;
      const isActive=a.bpm===S.bpm;
      if(isActive){ c.fillStyle='rgba(192,57,43,0.15)'; c.beginPath(); c.roundRect(ax-28,ay-22,56,44,8); c.fill(); }
      c.font='20px serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(a.icon,ax,ay-8);
      c.fillStyle=isActive?'#C0392B':'#888'; c.font=`${isActive?'bold ':''}10px Tajawal`;
      c.textAlign='center'; c.fillText(a.bpm,ax,ay+10);
      c.fillStyle='#aaa'; c.font='9px Tajawal'; c.fillText(a.label,ax,ay+22);
    });

    S.t+=0.016;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simFitness2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.f2) simState.f2={t:0,exercised:false,recover:false,bpmHistory:Array(60).fill(70),elapsed:0};
  const S=simState.f2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📈 معدل التعافي بعد التمرين</div>
    </div>
    <button class="ctrl-btn play" onclick="simState.f2.exercised=true;simState.f2.recover=false;simState.f2.elapsed=0;simState.f2.t=0">🏃 ابدأ التمرين (دقيقتان)</button>
    <button class="ctrl-btn reset" onclick="simState.f2.exercised=false;simState.f2.recover=false;simState.f2.elapsed=0;simState.f2.bpmHistory=Array(60).fill(70);window._stopHeartbeat();window._playHeartbeat(70)">↺ إعادة</button>
    <div id="f2status" style="text-align:center;font-size:12px;color:#888;margin:8px 0">في الراحة</div>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:8px">
      الشخص الرياضي يتعافى أسرع!<br>
      ← القلب أقوى وأكثر كفاءة<br>
      ← الأوعية أكثر مرونة<br><br>
      تمرّن بانتظام لتحسين<br>
      معدل التعافي 💪
    </div>`);

  function draw(){
    if(currentSim!=='fitness8'||currentTab!==1) return;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#FFF5F5';
    c.fillRect(0,0,w,h);
    U7.txt(c,'معدل النبض — قبل وبعد التمرين',w/2,24,'#7A0000',14,true);

    // Current BPM calculation
    let curBPM=70;
    if(S.exercised){
      if(S.elapsed<120) curBPM=Math.min(160,70+S.elapsed*0.75); // exercise: up
      else { curBPM=Math.max(70,160-((S.elapsed-120)*0.6)); } // recovery: down
    }
    // Update BPM history
    if(S.exercised){
      S.bpmHistory.push(curBPM);
      if(S.bpmHistory.length>60) S.bpmHistory.shift();
    }

    // Update status display
    const statusEl=document.getElementById('f2status');
    if(statusEl){
      if(!S.exercised) statusEl.textContent='في الراحة 😌';
      else if(S.elapsed<120) statusEl.textContent=`🏃 يتمرن... ${Math.round(120-S.elapsed)} ثانية`;
      else statusEl.textContent=`😮‍💨 تعافٍ... ${Math.round(S.elapsed-120)} ثانية`;
    }

    // Chart
    const chartX=w*0.1, chartY=h*0.12, chartW=w*0.82, chartH=h*0.58;
    c.fillStyle='rgba(255,255,255,0.5)'; c.strokeStyle='rgba(200,200,200,0.5)'; c.lineWidth=1;
    c.beginPath(); c.rect(chartX,chartY,chartW,chartH); c.fill(); c.stroke();

    // منطقة الراحة (قبل التمرين)
    c.fillStyle='rgba(100,180,100,0.07)';
    c.beginPath(); c.rect(chartX,chartY,chartW*0.27,chartH); c.fill();
    c.fillStyle='rgba(39,174,96,0.5)'; c.font='bold 10px Tajawal'; c.textAlign='center';
    c.fillText('😌 راحة',chartX+chartW*0.135,chartY+14);

    // منطقة التمرين
    c.fillStyle='rgba(220,50,50,0.07)';
    c.beginPath(); c.rect(chartX+chartW*0.27,chartY,chartW*0.23,chartH); c.fill();
    c.fillStyle='rgba(200,50,50,0.5)'; c.font='bold 10px Tajawal'; c.textAlign='center';
    c.fillText('🏃 تمرين',chartX+chartW*0.385,chartY+14);

    // منطقة التعافي
    c.fillStyle='rgba(50,150,255,0.07)';
    c.beginPath(); c.rect(chartX+chartW*0.5,chartY,chartW*0.5,chartH); c.fill();
    c.fillStyle='rgba(50,130,220,0.5)'; c.font='bold 10px Tajawal';
    c.fillText('😮‍💨 تعافي',chartX+chartW*0.75,chartY+14);

    // Grid lines مع أرقام واضحة
    [70,90,110,130,150,170].forEach(bpm=>{
      const yy=chartY+chartH*(1-(bpm-60)/120);
      c.strokeStyle='rgba(200,200,200,0.5)'; c.lineWidth=1;
      c.beginPath(); c.moveTo(chartX,yy); c.lineTo(chartX+chartW,yy); c.stroke();
      c.fillStyle='#777'; c.font='bold 10px Tajawal'; c.textAlign='right';
      c.textBaseline='middle'; c.fillText(bpm,chartX-5,yy);
    });
    // عنوان المحور Y
    c.save(); c.translate(chartX-30,chartY+chartH/2);
    c.rotate(-Math.PI/2); c.fillStyle='#999'; c.font='10px Tajawal';
    c.textAlign='center'; c.fillText('نبضة/دقيقة',0,0); c.restore();

    // BPM line
    c.strokeStyle='rgba(192,57,43,0.9)'; c.lineWidth=2.5;
    c.beginPath();
    S.bpmHistory.forEach((bpm,i)=>{
      const px=chartX+(i/60)*chartW;
      const py=chartY+chartH*(1-(bpm-60)/120);
      i===0?c.moveTo(px,py):c.lineTo(px,py);
    });
    c.stroke();

    // Current point
    if(S.exercised){
      const cpx=chartX+(Math.min(59,S.bpmHistory.length-1)/60)*chartW;
      const cpy=chartY+chartH*(1-(curBPM-60)/120);
      c.fillStyle='#C0392B'; c.beginPath(); c.arc(cpx,cpy,6,0,Math.PI*2); c.fill();
      c.strokeStyle='white'; c.lineWidth=2; c.stroke();
    }

    // BPM label + status
    const bpmColor=curBPM<90?'#27AE60':curBPM<130?'#F39C12':'#C0392B';
    U7.txt(c,'النبض الحالي: '+Math.round(curBPM)+' نبضة/دقيقة',w/2,h*0.76,bpmColor,15,true);

    // تعليمات إذا لم يبدأ بعد
    if(!S.exercised){
      c.fillStyle='rgba(100,100,100,0.15)';
      c.beginPath(); c.roundRect(w*0.2,h*0.35,w*0.6,h*0.2,12); c.fill();
      U7.txt(c,'اضغط "ابدأ التمرين" لترى',w/2,h*0.41,'#888',13,true);
      U7.txt(c,'كيف يرتفع النبض ثم يتعافى',w/2,h*0.47,'#888',12,false);
    }

    // Heart animation
    const pulse2=1+Math.sin(S.t*curBPM/60*Math.PI*2)*0.08;
    c.save(); c.translate(w*0.5,h*0.9); c.scale(pulse2*0.65,pulse2*0.65);
    c.fillStyle=bpmColor;
    c.beginPath();
    c.moveTo(0,22); c.bezierCurveTo(-4,-4,-28,-4,-28,-16);
    c.bezierCurveTo(-28,-34,-4,-34,0,-20);
    c.bezierCurveTo(4,-34,28,-34,28,-16);
    c.bezierCurveTo(28,-4,4,-4,0,22); c.fill();
    c.restore();

    // تحديث نبضات القلب فقط عند تغيّر البي بي إم — لا في كل frame
    var roundedBPM = Math.round(curBPM/5)*5;
    if(S._lastBPM !== roundedBPM){
      S._lastBPM = roundedBPM;
      window._stopHeartbeat && window._stopHeartbeat();
      if(S.exercised) window._playHeartbeat && window._playHeartbeat(roundedBPM);
    }

    if(S.exercised){
      S.elapsed+=0.016*4;
      S.t+=0.016;
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 7-9 · السجائر والصحة
// ══════════════════════════════════════════════════════════
function simSmoking1(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.sm1) simState.sm1={t:0,component:'nicotine'};
  const S=simState.sm1;

  const components={
    nicotine:{label:'النيكوتين',color:'#8E44AD',icon:'🧠',effect:'يضيّق الأوعية الدموية\nيزيد ضغط الدم\nمسبّب للإدمان'},
    tar:{label:'القطران',color:'#2C3E50',icon:'☠️',effect:'يسبّب السرطان (ورم)\nيدمر خلايا الرئة\nيسود لون الرئة'},
    co:{label:'أول أكسيد الكربون',color:'#7F8C8D',icon:'💨',effect:'يرتبط بالهيموجلوبين\nيمنع حمل O₂\nيسبب نقص الأكسجين'},
    particulates:{label:'الجسيمات الدقيقة',color:'#4A235A',icon:'🫁',effect:'تدمّر الحويصلات الهوائية\nتسبب أمراض الرئة\nتزيد احتمال السرطان'}
  };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🚭 مكوّنات دخان السجائر</div>
    </div>
    ${Object.entries(components).map(([k,v])=>`
      <button class="ctrl-btn" onclick="simState.sm1.component='${k}';simState.sm1.t=0" style="border-right:4px solid ${v.color};font-size:12px;margin-bottom:3px">
        ${v.icon} ${v.label}
      </button>`).join('')}
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:8px;background:rgba(200,50,50,0.06)">
      🚭 التدخين يقتل<br>
      4.2 مليون شخص سنوياً<br>
      ½ المدخنين يموتون بسببه
    </div>`);

  function draw(){
    if(currentSim!=='smoking8'||currentTab!==0) return;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#FFF5F5';
    c.fillRect(0,0,w,h);
    U7.grid(c,w,h,'rgba(100,50,50,0.04)',40);
    U7.txt(c,'أضرار مكوّنات دخان السجائر',w/2,24,'#7A0000',14,true);

    const comp=components[S.component];
    const cx=w/2, cy=h*0.44;

    // Cigarette drawing
    const cigL=w*0.5, cigH=h*0.055;
    const cigX=cx-cigL/2, cigY=cy-h*0.35;
    // White part
    c.fillStyle='#F5F5F5'; c.strokeStyle='#ccc'; c.lineWidth=1;
    c.beginPath(); c.rect(cigX,cigY-cigH/2,cigL*0.75,cigH); c.fill(); c.stroke();
    // Filter
    c.fillStyle='rgba(255,200,100,0.8)'; c.beginPath(); c.rect(cigX+cigL*0.75,cigY-cigH/2,cigL*0.15,cigH); c.fill();
    // Burning tip
    c.fillStyle='rgba(255,100,0,0.8)'; c.beginPath(); c.arc(cigX+cigL*0.9,cigY,cigH*0.4,0,Math.PI*2); c.fill();

    // Smoke particles rising
    for(let i=0;i<20;i++){
      const sp=(S.t*0.3+i*0.05)%1;
      const sx=cigX+cigL*0.9+(Math.sin(S.t+i)*20)*(sp);
      const sy=cigY-sp*h*0.5-cigH;
      const alpha=Math.max(0,0.5-sp*0.5);
      c.fillStyle=`${comp.color}${Math.round(alpha*255).toString(16).padStart(2,'0')}`;
      c.beginPath(); c.arc(sx,sy,4+sp*6,0,Math.PI*2); c.fill();
    }

    // Effect on body organ
    const orgY=cy+h*0.05;
    if(S.component==='nicotine'){
      // Blood vessel narrowing
      U7.txt(c,'تضيّق الأوعية الدموية',cx,orgY-30,comp.color,13,true);
      const vesselH=h*0.08;
      const narrowing=0.35+Math.sin(S.t*2)*0.05;
      // Normal vessel (left)
      c.fillStyle='rgba(200,50,50,0.7)'; c.beginPath(); c.rect(cx-w*0.28,orgY-vesselH/2,w*0.22,vesselH); c.fill();
      c.fillStyle='rgba(220,50,50,0.3)'; c.beginPath(); c.rect(cx-w*0.28+3,orgY-vesselH/2+3,w*0.22-6,vesselH-6); c.fill();
      U7.txt(c,'طبيعي',cx-w*0.17,orgY+vesselH/2+14,'#27AE60',10,true);
      // Narrowed vessel (right)
      const narH=vesselH*narrowing;
      c.fillStyle='rgba(150,30,30,0.7)'; c.beginPath(); c.rect(cx+w*0.06,orgY-vesselH/2,w*0.22,vesselH); c.fill();
      c.fillStyle='rgba(120,0,0,0.5)'; c.beginPath(); c.rect(cx+w*0.06+3,orgY-narH/2,w*0.22-6,narH); c.fill();
      U7.txt(c,'بعد النيكوتين',cx+w*0.17,orgY+vesselH/2+14,'#C0392B',10,true);
    } else if(S.component==='co'){
      // Hemoglobin diagram
      U7.txt(c,'أول أكسيد الكربون يحتل مكان الأكسجين',cx,orgY-30,comp.color,12,true);
      [[cx-60,orgY,'O₂','#27AE60','الطبيعي'],[cx+60,orgY,'CO','#7F8C8D','بعد التدخين']].forEach(([hx,hy,mol,col,lbl])=>{
        const hg=c.createRadialGradient(hx,hy,0,hx,hy,25);
        hg.addColorStop(0,'#E74C3C'); hg.addColorStop(1,'#922B21');
        c.fillStyle=hg; c.beginPath(); c.ellipse(hx,hy,25,17,0,0,Math.PI*2); c.fill();
        c.fillStyle=col; c.beginPath(); c.arc(hx,hy-18,8,0,Math.PI*2); c.fill();
        c.font='8px sans-serif'; c.fillStyle='white'; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(mol,hx,hy-18);
        U7.txt(c,lbl,hx,hy+30,col,10,true);
      });
    } else {
      // General effect illustration
      U7.txt(c,comp.effect.split('\n')[0],cx,orgY-20,comp.color,13,true);
      U7.txt(c,comp.effect.split('\n')[1],cx,orgY,comp.color,12,false);
      U7.txt(c,comp.effect.split('\n')[2],cx,orgY+20,'#888',11,false);
    }

    // Component info box
    c.fillStyle='rgba(255,255,255,0.92)'; c.strokeStyle=comp.color; c.lineWidth=2.5;
    c.beginPath(); c.roundRect(w*0.05,h*0.8,w*0.9,h*0.16,10); c.fill(); c.stroke();
    U7.txt(c,comp.icon+' '+comp.label,w/2,h*0.83,comp.color,14,true);
    U7.txt(c,comp.effect.split('\n').join(' — '),w/2,h*0.86,comp.color,10,false);

    S.t+=0.025;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simSmoking2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.sm2) simState.sm2={t:0,damage:0,_seed:42,_pts:null};
  const S=simState.sm2;

  // توليد نقاط ثابتة مرة واحدة باستخدام seed
  function seededRand(seed){ return ((Math.sin(seed)*9301+49297)%233280)/233280; }
  function getPoints(){
    if(S._pts) return S._pts;
    S._pts={alv:[],tar:[]};
    for(let i=0;i<30;i++){
      S._pts.alv.push({rx:seededRand(i*3)*2-1, ry:seededRand(i*3+1)*2-1, rr:seededRand(i*3+2)});
    }
    for(let i=0;i<15;i++){
      S._pts.tar.push({rx:seededRand(i*5+100)*2-1, ry:seededRand(i*5+101)*2-1, rr:seededRand(i*5+102)});
    }
    return S._pts;
  }

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔬 الرئة السليمة مقابل رئة المدخّن</div>
    </div>
    <div class="ctrl-section" style="margin-top:8px">
      <div class="ctrl-label">🚬 سنوات التدخين: <span id="sm2yrs">0 سنة</span></div>
      <input type="range" min="0" max="40" step="1" value="0"
        oninput="simState.sm2.damage=+this.value/40;document.getElementById('sm2yrs').textContent=this.value+' سنة'"
        style="width:100%;margin:6px 0">
    </div>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:8px">
      كلما زاد التدخين:<br>
      → حويصلات هوائية مدمّرة<br>
      → قدرة تنفسية أقل<br>
      → ترسّب القطران (اللون الداكن)<br>
      🚭 التوقف يحسّن الوضع!
    </div>`);

  function drawLung(cx, cy, lw, lh, dir, color){
    const lx=cx+dir*lw*0.28, ly=cy;
    const lg=c.createRadialGradient(lx,ly-lh*0.1,0,lx,ly,lh*0.5);
    lg.addColorStop(0,color); lg.addColorStop(1,color.replace(/[\d.]+\)$/,'0.3)'));
    c.fillStyle=lg; c.strokeStyle='rgba(100,40,40,0.4)'; c.lineWidth=2;
    c.beginPath();
    c.moveTo(lx,ly-lh*0.52);
    c.bezierCurveTo(lx+dir*lw*0.18,ly-lh*0.52,lx+dir*lw*0.35,ly-lh*0.2,lx+dir*lw*0.35,ly);
    c.bezierCurveTo(lx+dir*lw*0.35,ly+lh*0.25,lx+dir*lw*0.15,ly+lh*0.45,lx,ly+lh*0.45);
    c.bezierCurveTo(lx-dir*lw*0.02,ly+lh*0.45,lx,ly+lh*0.25,lx,ly-lh*0.52);
    c.fill(); c.stroke();
  }

  function draw(){
    if(currentSim!=='smoking8'||currentTab!==1) return;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#FFF5F5';
    c.fillRect(0,0,w,h);
    U7.txt(c,'مقارنة: الرئة السليمة × رئة المدخّن',w/2,20,'#7A0000',14,true);

    const pts=getPoints();
    const d=S.damage;

    // نبض تنفس للرئة السليمة
    const breathe=1+Math.sin(S.t*1.8)*0.045;
    const lhBase=h*0.5, lwBase=w*0.26;

    // ── رئة سليمة (يسار) — حيّة تتنفس ──
    const hx=w*0.27, hy=h*0.5;
    const lhH=lhBase*breathe, lwH=lwBase*breathe;
    const healthyColor='rgba(255,120,120,0.9)';
    [-1,1].forEach(dir=>drawLung(hx,hy,lwH,lhH,dir,healthyColor));
    // حويصلات صحية — وردية كبيرة تنبض
    pts.alv.forEach((p)=>{
      const ax=hx+p.rx*lwH*0.32, ay=hy+p.ry*lhH*0.32;
      const ar=(5+p.rr*6)*breathe;
      c.fillStyle='rgba(240,80,80,0.55)';
      c.beginPath(); c.arc(ax,ay,ar,0,Math.PI*2); c.fill();
      // حلقة خارجية
      c.strokeStyle='rgba(200,60,60,0.3)'; c.lineWidth=1;
      c.beginPath(); c.arc(ax,ay,ar*1.5,0,Math.PI*2); c.stroke();
    });
    // تسمية مع خلفية خضراء واضحة
    c.fillStyle='rgba(39,174,96,0.15)'; c.strokeStyle='#27AE60'; c.lineWidth=1.5;
    c.beginPath(); c.roundRect(hx-55,hy+lhH*0.5,110,58,8); c.fill(); c.stroke();
    U7.txt(c,'✅ رئة سليمة 🫁',hx,hy+lhH*0.5+16,'#27AE60',13,true);
    U7.txt(c,'السعة: 100%',hx,hy+lhH*0.5+32,'#27AE60',12,false);
    U7.txt(c,'حويصلات: 30/30 • تتنفس بحرية',hx,hy+lhH*0.5+46,'#27AE60',10,false);

    // ── رئة المدخّن (يمين) ──
    const sx=w*0.73, sy=h*0.5;
    // اللون يتحول من وردي → بني داكن → أسود مع التدخين بشكل واضح جداً
    const rC=Math.round(220 - d*200);
    const gC=Math.round(100 - d*95);
    const bC=Math.round(90  - d*85);
    const smokerColor=`rgba(${rC},${gC},${bC},0.92)`;
    // الرئة المدخّن تتقلص مع الزمن
    const shrink=1-d*0.18;
    const lhS=lhBase*shrink, lwS=lwBase*shrink;
    [-1,1].forEach(dir=>drawLung(sx,sy,lwS,lhS,dir,smokerColor));

    // حويصلات مدمّرة — أقل وأصغر بشكل واضح
    const nAlv=Math.max(0,Math.round(30*(1-d*0.9)));
    pts.alv.slice(0,nAlv).forEach((p)=>{
      const ax=sx+p.rx*lwS*0.3, ay=sy+p.ry*lhS*0.3;
      const ar=Math.max(0.8,(5+p.rr*6)*shrink*(1-d*0.75));
      c.fillStyle=`rgba(140,60,20,0.6)`;
      c.beginPath(); c.arc(ax,ay,ar,0,Math.PI*2); c.fill();
    });

    // ترسّب القطران الداكن — بارز وواضح من أول سنة
    if(d>0.01){
      const nTar=Math.round(d*15);
      pts.tar.slice(0,nTar).forEach(p=>{
        const ax=sx+p.rx*lwS*0.28, ay=sy+p.ry*lhS*0.28;
        const ar=(4+p.rr*10)*d;
        // طبقات قطران: داخلي أسود + هالة بنية
        c.fillStyle=`rgba(8,5,0,${0.4+d*0.5})`;
        c.beginPath(); c.arc(ax,ay,ar,0,Math.PI*2); c.fill();
        c.fillStyle=`rgba(40,20,5,${0.2+d*0.3})`;
        c.beginPath(); c.arc(ax,ay,ar*1.6,0,Math.PI*2); c.fill();
      });
    }

    // مؤشر الضرر بشريط ملوّن
    const barW=lwS*1.8, barX=sx-barW/2, barY=sy-lhS*0.58;
    c.fillStyle='rgba(0,0,0,0.12)'; c.beginPath(); c.roundRect(barX,barY,barW,8,4); c.fill();
    const dmgColor= d<0.3?'#E67E22': d<0.6?'#D35400':'#C0392B';
    c.fillStyle=dmgColor; c.beginPath(); c.roundRect(barX,barY,barW*d,8,4); c.fill();
    U7.txt(c,`ضرر: ${Math.round(d*100)}%`,sx,barY-6,dmgColor,10,true);

    const capacity=Math.round(100*(1-d*0.78));
    const nAlvShow=Math.max(0,Math.round(30*(1-d*0.9)));
    // تسمية مع خلفية حمراء واضحة
    c.fillStyle='rgba(192,57,43,0.1)'; c.strokeStyle='#C0392B'; c.lineWidth=1.5;
    c.beginPath(); c.roundRect(sx-58,sy+lhS*0.5,116,58,8); c.fill(); c.stroke();
    U7.txt(c,'⚠️ رئة المدخّن 🖤',sx,sy+lhS*0.5+16,'#C0392B',13,true);
    U7.txt(c,`السعة: ${capacity}%`,sx,sy+lhS*0.5+32,'#C0392B',12,false);
    U7.txt(c,`حويصلات: ${nAlvShow}/30 • ضرر دائم`,sx,sy+lhS*0.5+46,'#C0392B',10,false);

    // سهم مقارنة وسط
    U7.txt(c,'⟵  مقارنة  ⟶',w/2,sy,'#888',12,false);
    // نص القطران إذا بدأ يظهر
    if(d>0.05){
      U7.txt(c,'◼ قطران',sx,sy+5,'rgba(20,10,0,0.7)',10,true);
    }

    S.t+=0.025;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// الوحدة ١٠ — التكاثر والتطوّر
// ══════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════
// الوحدة ١٠ — التكاثر والتطوّر  (PhET-style محسّن)
// ══════════════════════════════════════════════════════════


function repro_gametes(){
  cancelAnimationFrame(animFrame);
  const cv = document.getElementById('simCanvas');

  // ── State ──────────────────────────────────────────────────
  if(!simState.repro_gametes){
    simState.repro_gametes={
      t:0, pulse:0,
      // Phases: 'anatomy' → 'question' → 'correct_flash' → 'simulation' → 'done'
      phase:'anatomy', anatomyT:0,
      wrongFlash:0, wrongLabel:'',
      correctFlash:0,
      // sperm sim
      spermObjs:[], launched:false, fertilised:false, fertAnim:0, eggTravel:0,
      // clickable zones (set each frame)
      tubeZone:null, uterusZone:null, ovaryZone:null
    };
  }
  const S = simState.repro_gametes;
  S.tab = currentTab;

  // ── Controls ────────────────────────────────────────────────
  function updateControls(){
    if(currentTab!==0){ controls(''); return; }
    if(S.phase==='anatomy'||S.phase==='question'||S.phase==='correct_flash'){
      controls(`
        <div class="ctrl-section">
          <div class="ctrl-label">🔬 الجهاز التناسلي الأنثوي</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.78);line-height:2.1;margin:6px 0">
            ${S.phase==='anatomy'?'تأمّل الرسم التشريحي<br>وتعرّف على أجزائه':'❓ <strong style="color:#FFE050">أين تحدث عملية الإخصاب؟</strong><br>انقر على المنطقة الصحيحة'}
          </div>
          <button class="ctrl-btn reset" onclick="simState.repro_gametes={t:0,pulse:0,phase:'anatomy',anatomyT:0,wrongFlash:0,wrongLabel:'',correctFlash:0,spermObjs:[],launched:false,fertilised:false,fertAnim:0,eggTravel:0,tubeZone:null,uterusZone:null,ovaryZone:null}">↺ إعادة</button>
        </div>
        <div class="info-box" style="font-size:12.5px;line-height:2.2;margin-top:8px">
          🟣 <strong>المبيضان:</strong> ينتجان البويضات<br>
          🌸 <strong>قناة البيض:</strong> تنقل البويضة — موقع الإخصاب<br>
          🩷 <strong>الرحم:</strong> يستقبل البويضة المخصّبة<br>
          🟡 <strong>البويضة:</strong> 23 كروموسوم
        </div>`);
    } else {
      controls(`
        <div class="ctrl-section">
          <div class="ctrl-label">🏊 محاكاة الإخصاب</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.78);line-height:2;margin:6px 0">
            الحيوانات المنوية تسبح عبر الرحم<br>نحو البويضة في قناة البيض 🎯
          </div>
          <button class="ctrl-btn play" onclick="
            var S=simState.repro_gametes;
            S.spermObjs=Array.from({length:35},(_,i)=>({
              x:0.06+Math.random()*0.07, y:0.46+Math.random()*0.12,
              phase:Math.random()*Math.PI*2, done:false,
              speed:0.0013+Math.random()*0.0009,
              wobble:0.16+Math.random()*0.22
            }));
            S.launched=true; S.fertilised=false; S.fertAnim=0; S.eggTravel=0;
          ">🏊 أطلق الحيوانات المنوية</button>
          <button class="ctrl-btn reset" onclick="
            simState.repro_gametes={t:0,pulse:0,phase:'anatomy',anatomyT:0,wrongFlash:0,wrongLabel:'',correctFlash:0,spermObjs:[],launched:false,fertilised:false,fertAnim:0,eggTravel:0,tubeZone:null,uterusZone:null,ovaryZone:null};
          ">↺ إعادة من البداية</button>
        </div>
        <div class="info-box" style="font-size:13px;line-height:2.1;margin-top:8px">
          🥚 البويضة: <strong>23</strong> كروموسوم<br>
          🏊 الحيوان المنوي: <strong>23</strong> كروموسوم<br>
          ✅ بعد الإخصاب: <strong style="color:#FFD700">46 كروموسوم</strong>
        </div>`);
    }
  }
  updateControls();

  // ── Helpers ─────────────────────────────────────────────────
  function gp(e){
    const r=cv.getBoundingClientRect(), sc=cv.width/r.width;
    const s=(e.changedTouches&&e.changedTouches[0])||(e.touches&&e.touches[0])||e;
    return{x:(s.clientX-r.left)*sc,y:(s.clientY-r.top)*sc};
  }

  // Draw a rounded label badge
  function badge(c,text,x,y,col,bgAlpha){
    const fs=Math.min(12,cv.width*0.026);
    c.font=`bold ${fs}px Tajawal`;
    const tw=c.measureText(text).width;
    const pw=tw+16, ph=fs+10;
    c.fillStyle=col.replace(')',`,${bgAlpha||0.22})`).replace('rgb(','rgba(').replace(/,[\d.]+\)$/,`,${bgAlpha||0.22})`);
    // simple semi-transparent bg
    c.save();
    c.fillStyle=`rgba(10,5,30,0.58)`;
    c.beginPath(); c.roundRect(x-pw/2,y-ph/2,pw,ph,6); c.fill();
    c.strokeStyle=col; c.lineWidth=1.5;
    c.beginPath(); c.roundRect(x-pw/2,y-ph/2,pw,ph,6); c.stroke();
    c.fillStyle=col; c.textAlign='center'; c.textBaseline='middle';
    c.shadowColor='rgba(0,0,0,0.9)'; c.shadowBlur=4;
    c.fillText(text,x,y);
    c.restore();
  }

  // Dotted leader line
  function leader(c,x1,y1,x2,y2,col){
    c.save(); c.strokeStyle=col; c.lineWidth=1.5; c.setLineDash([4,4]);
    c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.stroke();
    c.setLineDash([]); c.restore();
  }

  // ── Main draw ────────────────────────────────────────────────
  function draw(){
    if(currentSim!=='repro_gametes') return;
    S.t+=0.04; S.pulse=(S.pulse+0.035)%(Math.PI*2);
    if(S.phase==='anatomy') S.anatomyT++;
    const c=cv.getContext('2d');
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    if(S.tab===0) drawTab0(c,w,h);
    animFrame=requestAnimationFrame(draw);
  }

  // ── TAB 0 ────────────────────────────────────────────────────
  function drawTab0(c,w,h){
    // ── Background: dark medical blue ──
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#0D1B2A'); bg.addColorStop(1,'#1A2E45');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // ── Layout ──
    const cx   = w*0.50;
    const uCY  = h*0.575;
    const uW   = w*0.185;
    const uH   = h*0.205;
    const tubeY= uCY - uH*0.40;

    // ── Organ colours ──
    const COL_TUBE  = 'rgba(220,120,180,';
    const COL_UTER  = 'rgba(230,90,140,';
    const COL_OVARY = 'rgba(200,80,160,';
    const COL_EGG   = 'rgba(255,200,50,';
    const COL_CERV  = 'rgba(200,80,120,';

    // ── PHASE: ANATOMY — show detailed realism ──
    const isAnatomy = (S.phase==='anatomy'||S.phase==='question'||S.phase==='correct_flash');

    // ─── 1. UTERUS (detailed) ───
    // Outer myometrium
    c.save();
    const uGo=c.createRadialGradient(cx,uCY-uH*0.1,uH*0.05,cx,uCY,uH*1.15);
    uGo.addColorStop(0,COL_UTER+'0.55)'); uGo.addColorStop(0.7,COL_UTER+'0.22)'); uGo.addColorStop(1,COL_UTER+'0.04)');
    c.fillStyle=uGo; c.strokeStyle=COL_UTER+'0.90)'; c.lineWidth=3.2;
    c.beginPath();
    c.moveTo(cx,uCY-uH*0.62);
    c.bezierCurveTo(cx+uW*0.72,uCY-uH*0.52, cx+uW*0.78,uCY+uH*0.22, cx,uCY+uH*0.62);
    c.bezierCurveTo(cx-uW*0.78,uCY+uH*0.22, cx-uW*0.72,uCY-uH*0.52, cx,uCY-uH*0.62);
    c.fill(); c.stroke();

    // Inner cavity highlight
    const uGi=c.createLinearGradient(cx-uW*0.3,uCY-uH*0.3,cx+uW*0.3,uCY+uH*0.3);
    uGi.addColorStop(0,'rgba(255,170,200,0.18)'); uGi.addColorStop(1,'transparent');
    c.fillStyle=uGi;
    c.beginPath();
    c.moveTo(cx,uCY-uH*0.38);
    c.bezierCurveTo(cx+uW*0.42,uCY-uH*0.32, cx+uW*0.46,uCY+uH*0.15, cx,uCY+uH*0.42);
    c.bezierCurveTo(cx-uW*0.46,uCY+uH*0.15, cx-uW*0.42,uCY-uH*0.32, cx,uCY-uH*0.38);
    c.fill();

    // Endometrium texture lines
    c.strokeStyle='rgba(255,140,180,0.14)'; c.lineWidth=1;
    for(let i=1;i<=3;i++){
      c.beginPath();
      c.ellipse(cx,uCY,uW*(0.25+i*0.1),uH*(0.12+i*0.08),0,0,Math.PI*2);
      c.stroke();
    }
    c.restore();

    S.uterusZone={x:cx-uW*0.82,y:uCY-uH*0.70,w:uW*1.64,h:uH*1.40};
    if(isAnatomy) badge(c,'🩷 الرحم',cx,uCY+uH*0.12,'rgba(255,160,200,1)');

    // ─── 2. CERVIX + VAGINAL CANAL ───
    const cervW=uW*0.28;
    c.fillStyle=COL_CERV+'0.38)'; c.strokeStyle=COL_CERV+'0.70)'; c.lineWidth=2;
    c.beginPath();
    c.moveTo(cx-cervW,uCY+uH*0.62);
    c.bezierCurveTo(cx-cervW*0.8,uCY+uH*0.78, cx-cervW*0.6,uCY+uH*0.90, cx-cervW*0.4,uCY+uH*0.98);
    c.bezierCurveTo(cx,uCY+uH*1.02, cx,uCY+uH*1.02, cx+cervW*0.4,uCY+uH*0.98);
    c.bezierCurveTo(cx+cervW*0.6,uCY+uH*0.90, cx+cervW*0.8,uCY+uH*0.78, cx+cervW,uCY+uH*0.62);
    c.closePath(); c.fill(); c.stroke();
    if(isAnatomy) badge(c,'عنق الرحم',cx,uCY+uH*0.82,'rgba(220,130,160,1)');

    // ─── 3. FALLOPIAN TUBES (detailed) ───
    // Tube thickness varies along length — wider near uterus, narrow in isthmus, wider at ampulla
    const rtX1=cx+uW*0.62, rtX2=cx+uW*1.48, rtX3=cx+uW*1.92;
    const rtY1=tubeY, rtY2=tubeY-h*0.048, rtY3=tubeY-h*0.135;
    const ltX1=cx-uW*0.62, ltX2=cx-uW*1.48, ltX3=cx-uW*1.92;
    const tubeGlow = (S.phase==='question') ? 0.70+Math.sin(S.pulse*3)*0.28 : 0.90;
    const tubeStrokeW = Math.max(11,w*0.023);

    // Left tube (less prominent — no egg here)
    c.strokeStyle=`rgba(210,110,165,0.52)`; c.lineWidth=tubeStrokeW*0.85; c.lineCap='round';
    c.beginPath(); c.moveTo(ltX1,rtY1);
    c.bezierCurveTo(ltX2,rtY2, ltX3+w*0.018,rtY3+h*0.008, ltX3,rtY3); c.stroke();
    // Left fimbriae
    for(let i=0;i<5;i++){
      const a=(Math.PI+0.4-i*0.18)*Math.PI;
      c.strokeStyle='rgba(200,100,155,0.40)'; c.lineWidth=2.5;
      c.beginPath(); c.moveTo(ltX3,rtY3);
      c.lineTo(ltX3+Math.cos(a)*w*0.022, rtY3+Math.sin(a)*h*0.030); c.stroke();
    }
    if(isAnatomy) badge(c,'قناة البيض',ltX3-w*0.035,rtY3-h*0.04,'rgba(220,150,200,1)');

    // Right tube — highlighted (this is where egg + fertilisation happen)
    // Tube shadow/glow when question active
    if(S.phase==='question'||S.phase==='correct_flash'){
      c.save();
      c.shadowColor=`rgba(255,220,80,${0.35+Math.sin(S.pulse*3)*0.2})`;
      c.shadowBlur=18;
      c.strokeStyle=`rgba(255,220,80,${tubeGlow*0.55})`; c.lineWidth=tubeStrokeW*2.2; c.lineCap='round';
      c.beginPath(); c.moveTo(rtX1,rtY1);
      c.bezierCurveTo(rtX2,rtY2, rtX3-w*0.018,rtY3+h*0.008, rtX3,rtY3); c.stroke();
      c.restore();
    }
    c.strokeStyle=`rgba(235,130,185,${tubeGlow})`; c.lineWidth=tubeStrokeW; c.lineCap='round';
    c.beginPath(); c.moveTo(rtX1,rtY1);
    c.bezierCurveTo(rtX2,rtY2, rtX3-w*0.018,rtY3+h*0.008, rtX3,rtY3); c.stroke();

    // Tube lumen (inner line)
    c.strokeStyle=`rgba(255,180,220,0.22)`; c.lineWidth=tubeStrokeW*0.28;
    c.beginPath(); c.moveTo(rtX1,rtY1);
    c.bezierCurveTo(rtX2,rtY2, rtX3-w*0.018,rtY3+h*0.008, rtX3,rtY3); c.stroke();

    // Right fimbriae
    for(let i=0;i<7;i++){
      const a=(-0.5+i*0.17)*Math.PI;
      const al = (S.phase==='question'||S.phase==='correct_flash') ? tubeGlow*0.9 : 0.7;
      c.strokeStyle=`rgba(240,160,205,${al})`; c.lineWidth=2.8;
      c.beginPath(); c.moveTo(rtX3,rtY3);
      c.lineTo(rtX3+Math.cos(a)*w*0.026, rtY3+Math.sin(a)*h*0.034); c.stroke();
    }

    // Store tube clickable zone
    S.tubeZone={x:Math.min(rtX1,rtX3)-24, y:rtY3-28, w:Math.abs(rtX3-rtX1)+48, h:Math.abs(rtY1-rtY3)+52};

    // Tube label (right tube)
    const tlx=cx+uW*1.08, tly=tubeY-h*0.185;
    if(isAnatomy){
      leader(c,rtX2,rtY2,tlx,tly,`rgba(235,180,215,0.6)`);
      const tlCol = (S.phase==='question') ? 'rgba(255,230,80,1)' : 'rgba(235,180,215,1)';
      badge(c,'🌸 قناة البيض ← موقع الإخصاب',tlx,tly,tlCol);
    }

    // ─── 4. OVARIES (realistic) ───
    const ovR=Math.min(w*0.052,h*0.056,27);
    const ovPos=[[rtX3,rtY3+h*0.005],[ltX3,rtY3+h*0.005]];
    ovPos.forEach(([ox,oy],oi)=>{
      // Ligament
      c.strokeStyle='rgba(200,100,150,0.40)'; c.lineWidth=2;
      c.beginPath(); c.moveTo(oi===0?rtX3:ltX3, rtY3); c.lineTo(ox,oy); c.stroke();
      // Ovary body
      c.save();
      const oGr=c.createRadialGradient(ox-ovR*0.3,oy-ovR*0.3,ovR*0.06,ox,oy,ovR);
      oGr.addColorStop(0,'#FFCCE8'); oGr.addColorStop(0.5,'#D060A8'); oGr.addColorStop(1,'#8A1860');
      c.fillStyle=oGr;
      // Slightly elliptical
      c.beginPath(); c.ellipse(ox,oy,ovR,ovR*0.76,oi===0?-0.2:0.2,0,Math.PI*2); c.fill();
      c.strokeStyle='rgba(255,140,200,0.85)'; c.lineWidth=2; c.stroke();
      // Follicle texture
      c.strokeStyle='rgba(255,200,235,0.28)'; c.lineWidth=1;
      c.beginPath(); c.arc(ox+ovR*0.22,oy-ovR*0.22,ovR*0.30,0,Math.PI*2); c.stroke();
      c.beginPath(); c.arc(ox-ovR*0.20,oy+ovR*0.18,ovR*0.18,0,Math.PI*2); c.stroke();
      c.restore();
      if(isAnatomy){
        leader(c,ox,oy-ovR,ox,oy-ovR-h*0.042,'rgba(200,120,180,0.55)');
        badge(c,'🟣 مبيض',ox,oy-ovR-h*0.055,'rgba(200,140,220,1)');
      }
    });
    S.ovaryZone={x:rtX3-ovR*1.6,y:rtY3-ovR,w:ovR*3.2,h:ovR*2.8};

    // ─── 5. EGG in right tube ───
    // In simulation phase, egg can travel toward uterus
    let eX = cx+uW*1.18, eY = tubeY-h*0.082;
    // Egg stays in place after fertilisation (no movement)
    const eR=Math.min(h*0.075,w*0.065,40);

    // Glow
    const eGlow=c.createRadialGradient(eX,eY,0,eX,eY,eR*2.5);
    eGlow.addColorStop(0,COL_EGG+'0.58)'); eGlow.addColorStop(0.45,COL_EGG+'0.20)'); eGlow.addColorStop(1,'transparent');
    c.fillStyle=eGlow; c.beginPath(); c.arc(eX,eY,eR*2.5,0,Math.PI*2); c.fill();

    // Zona pellucida
    c.strokeStyle='rgba(255,225,120,0.30)'; c.lineWidth=8;
    c.beginPath(); c.arc(eX,eY,eR*1.42,0,Math.PI*2); c.stroke();

    // Egg body
    const eGr=c.createRadialGradient(eX-eR*0.28,eY-eR*0.28,eR*0.06,eX,eY,eR);
    eGr.addColorStop(0,'#FFF0A0'); eGr.addColorStop(0.5,'#E89230'); eGr.addColorStop(1,'#B85E10');
    c.fillStyle=eGr; c.beginPath(); c.arc(eX,eY,eR,0,Math.PI*2); c.fill();
    c.strokeStyle='rgba(255,190,65,0.95)'; c.lineWidth=2.8; c.stroke();

    // Nucleus
    c.fillStyle='rgba(100,40,6,0.72)'; c.beginPath(); c.arc(eX,eY,eR*0.40,0,Math.PI*2); c.fill();

    // Chromosome count inside egg
    const isFert = S.fertilised && (S.phase==='simulation'||S.phase==='done');
    c.fillStyle='white'; c.font=`bold ${Math.round(eR*0.36)}px Tajawal`;
    c.textAlign='center'; c.textBaseline='middle';
    c.shadowColor='rgba(0,0,0,0.6)'; c.shadowBlur=3;
    c.fillText(isFert?'46🧬':'23🧬', eX, eY);
    c.shadowBlur=0;

    // Egg outer label
    if(!isFert){
      badge(c,'🥚 البويضة (23 كروموسوم)',eX,eY+eR+22,'rgba(255,210,80,1)');
    }

    // ─── 6. SPERM SIMULATION ───
    if((S.phase==='simulation'||S.phase==='done') && S.launched){
      S.spermObjs.forEach(sp=>{
        if(sp.done) return;
        const sx2=sp.x*w, sy2=sp.y*h;
        const toX=eX-sx2, toY=eY-sy2;
        const dist=Math.hypot(toX,toY);
        if(dist<eR*1.28 && !S.fertilised){
          S.fertilised=true; S.fertAnim=0;
          try{SoundEngine.chord([440,554,659],0.5,0.2);}catch(_){}
        }
        if(dist<eR+4){ sp.done=true; return; }
        const angle=Math.atan2(toY,toX);
        const wa=angle+Math.sin(S.t*5.5+sp.phase)*sp.wobble;
        sp.x+=Math.cos(wa)*sp.speed; sp.y+=Math.sin(wa)*sp.speed;
        // Draw sperm
        const sx3=sp.x*w, sy3=sp.y*h;
        const ha=Math.atan2(eY-sy3,eX-sx3);
        c.save(); c.translate(sx3,sy3); c.rotate(ha);
        // Head
        const hGr=c.createRadialGradient(-2,-1,1,0,0,8);
        hGr.addColorStop(0,'#D0FFFF'); hGr.addColorStop(1,'#1A8FA8');
        c.fillStyle=hGr; c.beginPath(); c.ellipse(0,0,9,5.5,0,0,Math.PI*2); c.fill();
        // Tail
        c.strokeStyle='rgba(80,215,235,0.72)'; c.lineWidth=1.9;
        c.beginPath();
        for(let i=0;i<15;i++){
          const tx=-9-(i+1)*5.0;
          const ty=Math.sin(S.t*5.5+sp.phase+i*0.75)*6.5*(1-i/17);
          i===0?c.moveTo(tx,ty):c.lineTo(tx,ty);
        }
        c.stroke(); c.restore();
      });
    }

    // ─── 7. FERTILISATION EFFECT ───
    if(isFert){
      S.fertAnim=Math.min(S.fertAnim+1,140);
      // eggTravel disabled
      const prog=S.fertAnim/140;

      // Burst ring
      if(prog<0.55){
        const ring=c.createRadialGradient(eX,eY,eR,eX,eY,eR+prog*70);
        ring.addColorStop(0,'rgba(255,220,80,0.82)'); ring.addColorStop(1,'transparent');
        c.fillStyle=ring; c.beginPath(); c.arc(eX,eY,eR+prog*70,0,Math.PI*2); c.fill();
      }

      // Fertilised egg badge
      badge(c,'🥚 بويضة مخصّبة — 46 كروموسوم',eX,eY+eR+22,'rgba(255,215,60,1)');

      if(prog>0.42){
        const al=Math.min(1,(prog-0.42)/0.25);
        c.globalAlpha=al;
        c.fillStyle='#FFD700'; c.font=`bold ${Math.min(15,w*0.031)}px Tajawal`;
        c.textAlign='center'; c.textBaseline='middle';
        c.shadowColor='rgba(0,0,0,0.8)'; c.shadowBlur=5;
        c.fillText('✅ إخصاب! 23 + 23 = 46 كروموسوم',w/2,h*0.875);
        c.fillStyle='rgba(255,220,120,0.90)'; c.font=`${Math.min(12,w*0.026)}px Tajawal`;
        c.fillText('البويضة المخصّبة تتحرك نحو الرحم للانغراس 🌟',w/2,h*0.925);
        c.shadowBlur=0; c.globalAlpha=1;
      }

    } else if(S.phase==='simulation' && !S.launched){
      c.fillStyle='rgba(200,230,255,0.65)'; c.font=`${Math.min(12,w*0.026)}px Tajawal`;
      c.textAlign='center'; c.textBaseline='middle';
      c.fillText('اضغط "أطلق الحيوانات المنوية" لبدء المحاكاة 👈',w/2,h*0.90);
    }

    // ─── 8. QUESTION PHASE OVERLAY ───
    if(S.phase==='question'){
      const qBY=h*0.77, qBH=h*0.17;
      c.fillStyle='rgba(6,4,18,0.80)';
      c.beginPath(); c.roundRect(w*0.05,qBY,w*0.90,qBH,16); c.fill();
      c.strokeStyle=`rgba(255,215,60,${0.55+Math.sin(S.pulse*2)*0.2})`; c.lineWidth=2;
      c.beginPath(); c.roundRect(w*0.05,qBY,w*0.90,qBH,16); c.stroke();

      c.font=`bold ${Math.min(15,w*0.033)}px Tajawal`;
      c.fillStyle='rgba(255,235,80,0.98)'; c.textAlign='center'; c.textBaseline='middle';
      c.shadowColor='rgba(0,0,0,0.7)'; c.shadowBlur=4;
      c.fillText('❓ أين تحدث عملية الإخصاب؟',w/2,qBY+qBH*0.30);
      c.shadowBlur=0;
      c.font=`${Math.min(12,w*0.026)}px Tajawal`;
      c.fillStyle='rgba(180,220,255,0.88)';
      c.fillText('انقر على المنطقة الصحيحة في الرسم 👆',w/2,qBY+qBH*0.62);

      if(S.wrongFlash>0){
        S.wrongFlash--;
        c.font=`bold ${Math.min(13,w*0.028)}px Tajawal`;
        c.fillStyle='rgba(255,90,90,0.96)';
        c.fillText(`❌ هذا هو ${S.wrongLabel} — حاول مجدداً`,w/2,qBY+qBH*0.88);
      }
    }

    // ─── 9. CORRECT FLASH ───
    if(S.phase==='correct_flash'){
      S.correctFlash++;
      const al=Math.max(0,1-S.correctFlash/55);
      c.fillStyle=`rgba(80,255,150,${al*0.18})`;
      c.fillRect(0,0,w,h);
      c.font=`bold ${Math.min(20,w*0.042)}px Tajawal`;
      c.fillStyle=`rgba(80,255,150,${al*0.96+0.04})`;
      c.textAlign='center'; c.textBaseline='middle';
      c.shadowColor='rgba(0,0,0,0.7)'; c.shadowBlur=6;
      c.fillText('✅ صحيح! الإخصاب يحدث في قناة البيض 🌸',w/2,h*0.5);
      c.shadowBlur=0;
      if(S.correctFlash>55){
        S.phase='simulation';
        S.launched=false; S.fertilised=false; S.fertAnim=0; S.eggTravel=0; S.spermObjs=[];
        updateControls();
      }
    }

    // ─── 10. ANATOMY PHASE hint ───
    if(S.phase==='anatomy'){
      const hBY=h*0.88, hBH=h*0.09;
      c.fillStyle='rgba(6,4,18,0.68)';
      c.beginPath(); c.roundRect(w*0.06,hBY,w*0.88,hBH,12); c.fill();
      c.font=`${Math.min(12.5,w*0.027)}px Tajawal`;
      c.fillStyle='rgba(180,215,255,0.90)'; c.textAlign='center'; c.textBaseline='middle';
      c.shadowColor='rgba(0,0,0,0.7)'; c.shadowBlur=3;
      c.fillText('تأمّل الرسم التشريحي — بعد لحظة سيظهر سؤال 👆',w/2,hBY+hBH*0.5);
      c.shadowBlur=0;
      if(S.anatomyT > 90){ // ~3.5 seconds
        S.phase='question';
        updateControls();
      }
    }

    // ─── 11. Title ───
    c.font=`bold ${Math.min(15,w*0.033)}px Tajawal`;
    c.fillStyle='rgba(200,230,255,0.88)';
    c.textAlign='center'; c.textBaseline='top';
    c.shadowColor='rgba(0,0,0,0.7)'; c.shadowBlur=4;
    c.fillText('🔬 الجهاز التناسلي الأنثوي',w/2,h*0.016);
    c.shadowBlur=0;
  }

  // ── Click / Touch handler ────────────────────────────────────
  function handleClick(e){
    if(currentSim!=='repro_gametes'||S.tab!==0) return;
    if(S.phase!=='question') return;
    const p=gp(e), w=cv.width, h=cv.height;
    function inZ(z){ return z&&p.x>=z.x&&p.x<=z.x+z.w&&p.y>=z.y&&p.y<=z.y+z.h; }

    if(inZ(S.tubeZone)){
      S.phase='correct_flash'; S.correctFlash=0;
      updateControls();
      try{SoundEngine.chord([523,659,784],0.4,0.15);}catch(_){}
    } else if(inZ(S.uterusZone)){
      S.wrongFlash=95; S.wrongLabel='الرحم (مكان نمو الجنين، لا الإخصاب)';
      try{U9Sound&&U9Sound.ping(180,.15,.15);}catch(_){}
    } else if(inZ(S.ovaryZone)){
      S.wrongFlash=95; S.wrongLabel='المبيض (ينتج البويضة، لا الإخصاب)';
      try{U9Sound&&U9Sound.ping(180,.15,.15);}catch(_){}
    }
  }

  cv.addEventListener('click', handleClick);
  cv.addEventListener('touchend', e=>{
    e.preventDefault();
    const t=e.changedTouches&&e.changedTouches[0];
    if(t) handleClick({clientX:t.clientX,clientY:t.clientY});
  }, {passive:false});

  draw();
}




function repro_fertilisation(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.repro_fertilisation) simState.repro_fertilisation={t:0,stage:0,divCount:0,autoDiv:false};
  const S=simState.repro_fertilisation;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧫 مراحل التطور المبكر</div>
      <button class="ctrl-btn play" id="btnNextStage" onclick="simState.repro_fertilisation.stage=Math.min(5,simState.repro_fertilisation.stage+1)">التالي ▶</button>
      <button class="ctrl-btn reset" onclick="simState.repro_fertilisation.stage=0">↺ من البداية</button>
    </div>
    <div class="info-box" id="stageInfo" style="font-size:13px;line-height:2;margin-top:8px">
      المرحلة ١ — البويضة المخصّبة
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ كم عدد الخلايا بعد 3 انقسامات؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">2³ = 8 خلايا — كل انقسام يضاعف العدد</div>
    </div>`);

  const stages=[
    {name:'البويضة المخصّبة',cells:1,color:'#E8962A',desc:'خلية واحدة تحتوي 46 كروموسوم'},
    {name:'مرحلة 2 خلايا',cells:2,color:'#27AE60',desc:'الانقسام الأول — خليتان متماثلتان'},
    {name:'مرحلة 4 خلايا',cells:4,color:'#2980B9',desc:'الانقسام الثاني — أربع خلايا'},
    {name:'مرحلة 8 خلايا',cells:8,color:'#8E44AD',desc:'الانقسام الثالث — ثماني خلايا'},
    {name:'الكرة الخلوية (16+)',cells:16,color:'#C0392B',desc:'تتشكّل الكرة الخلوية'},
    {name:'التعشيش في الرحم',cells:0,color:'#E67E22',desc:'الكرة الخلوية تتعشّش في جدار الرحم'},
  ];

  function draw(){
    if(currentSim!=='repro_fertilisation') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.03;
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#1A0A2E'); bg.addColorStop(1,'#2E0A4E');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    const st=stages[S.stage];
    const el=document.getElementById('stageInfo');
    if(el) el.innerHTML=`المرحلة ${S.stage+1}: <strong>${st.name}</strong><br><span style="font-size:12px">${st.desc}</span>`;

    c.fillStyle='#FFD080'; c.font=`bold ${Math.min(16,w*0.036)}px Tajawal`;
    c.textAlign='center'; c.fillText(st.name,w/2,h*0.1);

    const cx=w/2, cy=h*0.48;
    const outerR=Math.min(w*0.28,h*0.32);

    if(S.stage<5){
      // رسم الكرة الخلوية
      c.strokeStyle=st.color+'66'; c.lineWidth=2;
      c.beginPath(); c.arc(cx,cy,outerR,0,Math.PI*2); c.stroke();

      const n=st.cells;
      if(n===1){
        const gr=c.createRadialGradient(cx-outerR*0.3,cy-outerR*0.3,5,cx,cy,outerR);
        gr.addColorStop(0,'rgba(255,200,80,0.9)'); gr.addColorStop(0.7,st.color); gr.addColorStop(1,st.color+'88');
        c.fillStyle=gr; c.beginPath(); c.arc(cx,cy,outerR,0,Math.PI*2); c.fill();
        c.fillStyle='rgba(100,40,10,0.6)'; c.beginPath(); c.arc(cx,cy,outerR*0.35,0,Math.PI*2); c.fill();
        c.fillStyle='white'; c.font=`bold ${outerR*0.25}px Tajawal`; c.fillText('46🧬',cx,cy+outerR*0.1);
      } else {
        const angleStep=Math.PI*2/n;
        const cellR=outerR/(n<=4?2.5:3.5);
        const cellDist=outerR-(cellR+4);
        for(let i=0;i<n;i++){
          const ang=angleStep*i+S.t*0.008;
          const dx=Math.cos(ang)*cellDist*(n>8?0.7:1);
          const dy=Math.sin(ang)*cellDist*(n>8?0.7:1);
          const gr2=c.createRadialGradient(cx+dx-cellR*0.3,cy+dy-cellR*0.3,2,cx+dx,cy+dy,cellR);
          gr2.addColorStop(0,'rgba(255,255,255,0.8)'); gr2.addColorStop(0.4,st.color); gr2.addColorStop(1,st.color+'99');
          c.fillStyle=gr2; c.beginPath(); c.arc(cx+dx,cy+dy,cellR,0,Math.PI*2); c.fill();
          c.strokeStyle='rgba(255,255,255,0.3)'; c.lineWidth=1; c.stroke();
        }
      }
    } else {
      // تعشيش في الرحم
      const wallY=cy+outerR*0.5;
      c.fillStyle='rgba(200,100,50,0.3)'; c.fillRect(0,wallY,w,h-wallY);
      c.fillStyle='#C0392B'; c.font=`${Math.min(12,w*0.026)}px Tajawal`;
      c.fillText('جدار الرحم',w/2,wallY+20);
      // الكرة الخلوية
      const bR=outerR*0.55;
      for(let i=0;i<12;i++){
        const ang=i/12*Math.PI*2+S.t*0.005;
        const dx=Math.cos(ang)*bR*0.7, dy=Math.sin(ang)*bR*0.7;
        const r2=bR*0.28;
        c.fillStyle='rgba(232,150,42,0.7)'; c.beginPath(); c.arc(cx+dx,wallY-r2*0.5+dy*0.5,r2,0,Math.PI*2); c.fill();
      }
      c.strokeStyle='#E8962A'; c.lineWidth=2; c.beginPath(); c.arc(cx,wallY,bR,0,Math.PI*2); c.stroke();
      c.fillStyle='#FFD080'; c.font=`bold ${Math.min(14,w*0.032)}px Tajawal`;
      c.fillText('تعشيش في جدار الرحم ✅',cx,wallY-bR-15);
    }

    // شريط التقدم
    const pw=w*0.8, px=(w-pw)/2, barY=h*0.88;
    c.fillStyle='rgba(255,255,255,0.1)'; c.beginPath(); c.roundRect(px,barY,pw,8,4); c.fill();
    c.fillStyle=st.color; c.beginPath(); c.roundRect(px,barY,pw*(S.stage+1)/stages.length,8,4); c.fill();
    c.fillStyle='rgba(255,255,255,0.6)'; c.font=`${Math.min(11,w*0.024)}px Tajawal`;
    c.fillText(`${S.stage+1} / ${stages.length}`,w/2,barY+22);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function repro_development(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.repro_development) simState.repro_development={t:0,week:4,dragging:false};
  const S=simState.repro_development;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📅 أسبوع الحمل: <span id="wkDisp" style="color:#FFD700;font-weight:bold">${S.week}</span></div>
      <input type="range" min="4" max="40" step="1" value="${S.week}"
        oninput="simState.repro_development.week=+this.value;document.getElementById('wkDisp').textContent=this.value"
        style="width:100%;margin:8px 0">
    </div>
    <div class="info-box" id="devInfo" style="font-size:13px;line-height:1.9;margin-top:8px">
      الأسبوع 4: قطعة صغيرة جداً
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ متى يبدأ القلب بالنبض؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">القلب يبدأ نبضه نحو الأسبوع 5-6 من الحمل</div>
    </div>`);

  const devStages=[
    {w:4,  size:0.04, desc:'جنين صغير جداً — تبدأ أعضاء رئيسية بالتشكّل', heart:false},
    {w:8,  size:0.09, desc:'الأعضاء الرئيسية تتشكّل — القلب ينبض', heart:true},
    {w:12, size:0.15, desc:'الجنين يتحرك — يمكن رؤيته بالأشعة الصوتية', heart:true},
    {w:20, size:0.26, desc:'يسمع الأصوات ويستجيب للضوء', heart:true},
    {w:28, size:0.38, desc:'عيناه تفتحان — يتدرب على التنفس', heart:true},
    {w:36, size:0.52, desc:'شبه مكتمل — يستعد للولادة', heart:true},
    {w:40, size:0.62, desc:'مكتمل النمو ✅ — جاهز للولادة', heart:true},
  ];

  function draw(){
    if(currentSim!=='repro_development') return;
    const w2=cv.width,h2=cv.height;
    c.clearRect(0,0,w2,h2);
    S.t+=0.04;

    // خلفية
    const bg=c.createLinearGradient(0,0,0,h2);
    bg.addColorStop(0,'#1A0A2E'); bg.addColorStop(1,'#3A1060');
    c.fillStyle=bg; c.fillRect(0,0,w2,h2);

    // جد الأقرب للأسبوع الحالي
    const wk=S.week;
    const st=devStages.reduce((a,b)=>Math.abs(b.w-wk)<Math.abs(a.w-wk)?b:a);
    // تحديث المعلومات
    const el=document.getElementById('devInfo');
    if(el) el.innerHTML=`الأسبوع <strong style="color:#FFD700">${wk}</strong>: ${st.desc}`;

    c.fillStyle='#FFD080'; c.font=`bold ${Math.min(16,w2*0.036)}px Tajawal`;
    c.textAlign='center'; c.fillText(`الأسبوع ${wk} من الحمل`,w2/2,h2*0.1);

    // الرحم
    const rx=w2/2, ry=h2*0.52;
    const rW=Math.min(w2*0.55,h2*0.55);
    c.fillStyle='rgba(200,100,80,0.2)'; c.strokeStyle='rgba(200,120,80,0.5)'; c.lineWidth=3;
    c.beginPath(); c.ellipse(rx,ry,rW/2,rW*0.6,0,0,Math.PI*2); c.fill(); c.stroke();

    // الجنين
    const fSize=st.size*Math.min(rW*0.85, h2*0.6);
    const pulse=st.heart?1+Math.sin(S.t*8)*0.04:1;
    const gr=c.createRadialGradient(rx-fSize*0.15,ry-fSize*0.15,fSize*0.05,rx,ry,fSize*pulse);
    gr.addColorStop(0,'rgba(255,200,150,0.95)'); gr.addColorStop(0.6,'rgba(230,160,120,0.85)'); gr.addColorStop(1,'rgba(200,120,100,0.4)');
    c.fillStyle=gr; c.beginPath(); c.arc(rx,ry,fSize*pulse,0,Math.PI*2); c.fill();

    if(wk>=12){
      // رأس
      c.fillStyle='rgba(255,200,150,0.8)'; c.beginPath();
      c.arc(rx+fSize*0.55,ry-fSize*0.3,fSize*0.35,0,Math.PI*2); c.fill();
    }

    if(st.heart){
      // نبضة قلب
      const hpulse=(Math.sin(S.t*8)+1)/2;
      c.fillStyle=`rgba(255,80,80,${0.5+hpulse*0.5})`;
      c.font=`${fSize*0.5}px Arial`; c.textAlign='center';
      c.fillText('❤',rx,ry+fSize*0.25);
    }

    // شريط المقياس
    c.fillStyle='rgba(255,255,255,0.15)'; c.beginPath(); c.roundRect(w2*0.1,h2*0.87,w2*0.8,10,5); c.fill();
    c.fillStyle='#FFD700'; c.beginPath(); c.roundRect(w2*0.1,h2*0.87,w2*0.8*(wk-4)/36,10,5); c.fill();
    c.fillStyle='rgba(255,255,255,0.7)'; c.font=`${Math.min(12,w2*0.027)}px Tajawal`;
    c.fillText(`الأسبوع ${wk} من 40`,w2/2,h2*0.92);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function repro_growth(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.repro_growth) simState.repro_growth={t:0,age:0,gender:'male'};
  const S=simState.repro_growth;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧒 العمر: <span id="ageDisp" style="color:#FFD700;font-weight:bold">${S.age}</span> سنة</div>
      <input type="range" min="0" max="18" step="1" value="${S.age}"
        oninput="simState.repro_growth.age=+this.value;document.getElementById('ageDisp').textContent=this.value"
        style="width:100%;margin:8px 0">
    </div>
    <div class="ctrl-section" style="margin-top:8px">
      <div class="ctrl-label">الجنس</div>
      <div style="display:flex;gap:8px">
        <button class="ctrl-btn" style="${S.gender==='male'?'background:#2980B9;color:white':''}" onclick="simState.repro_growth.gender='male'">👦 ذكر</button>
        <button class="ctrl-btn" style="${S.gender==='female'?'background:#E91E9C;color:white':''}" onclick="simState.repro_growth.gender='female'">👧 أنثى</button>
      </div>
    </div>
    <div class="info-box" id="growthInfo" style="font-size:13px;line-height:1.9;margin-top:8px">
      ابدأ بتحريك شريط العمر
    </div>`);

  const mileStones=[
    {age:0,  label:'مولود',       heightF:0.28, color:'#F39C12'},
    {age:2,  label:'طفل صغير',    heightF:0.35, color:'#27AE60'},
    {age:6,  label:'طفل',         heightF:0.48, color:'#2980B9'},
    {age:12, label:'مراهق مبكر',  heightF:0.66, color:'#8E44AD'},
    {age:15, label:'مراهق',       heightF:0.82, color:'#E74C3C'},
    {age:18, label:'بالغ',        heightF:1.0,  color:'#1A8FA8'},
  ];
  const puberty={male:'تبدأ المراهقة (البلوغ) عادةً بين 11-13 سنة: نمو سريع وتغيرات في الصوت',female:'تبدأ المراهقة (البلوغ) عادةً بين 10-12 سنة: نمو الثدي وبدء الدورة الشهرية'};

  function draw(){
    if(currentSim!=='repro_growth') return;
    const w2=cv.width,h2=cv.height;
    c.clearRect(0,0,w2,h2);
    S.t+=0.03;

    const bg=c.createLinearGradient(0,0,0,h2);
    bg.addColorStop(0,'#0F2A1E'); bg.addColorStop(1,'#1E4A32');
    c.fillStyle=bg; c.fillRect(0,0,w2,h2);

    const age=S.age;
    // حساب الطول
    const ms=mileStones.reduce((a,b)=>b.age<=age?b:a);
    const nextMs=mileStones.find(m=>m.age>age)||ms;
    const frac=ms.age===nextMs.age?1:(age-ms.age)/(nextMs.age-ms.age);
    const heightF=ms.heightF+(nextMs.heightF-ms.heightF)*frac;

    const el=document.getElementById('growthInfo');
    if(el){
      let info=`العمر: <strong style="color:#FFD700">${age}</strong> سنة — ${ms.label}`;
      if(age>=10&&age<=16) info+=`<br><small style="color:#FFB0B0">⚠️ ${puberty[S.gender]}</small>`;
      el.innerHTML=info;
    }

    c.fillStyle='#80FFB0'; c.font=`bold ${Math.min(16,w2*0.036)}px Tajawal`;
    c.textAlign='center'; c.fillText(`مراحل النمو — العمر ${age} سنة`,w2/2,h2*0.08);

    // رسم الشخصية
    const maxH=h2*0.62;
    const personH=maxH*heightF;
    const baseY=h2*0.82;
    const cx=w2/2;
    const col=S.gender==='male'?'#3498DB':'#E91E9C';

    // رأس
    const headR=personH*0.15;
    c.fillStyle=col+'CC'; c.beginPath(); c.arc(cx,baseY-personH+headR,headR,0,Math.PI*2); c.fill();
    c.strokeStyle=col; c.lineWidth=2; c.stroke();
    // جسم
    c.strokeStyle=col; c.lineWidth=Math.max(2,personH*0.04);
    c.beginPath(); c.moveTo(cx,baseY-personH+headR*2); c.lineTo(cx,baseY-personH*0.35); c.stroke();
    // ذراعان
    c.beginPath(); c.moveTo(cx-personH*0.18,baseY-personH*0.6); c.lineTo(cx,baseY-personH*0.55); c.lineTo(cx+personH*0.18,baseY-personH*0.6); c.stroke();
    // قدمان
    c.beginPath(); c.moveTo(cx,baseY-personH*0.35); c.lineTo(cx-personH*0.12,baseY); c.stroke();
    c.beginPath(); c.moveTo(cx,baseY-personH*0.35); c.lineTo(cx+personH*0.12,baseY); c.stroke();

    // علامة الطول
    c.strokeStyle='rgba(255,255,100,0.4)'; c.lineWidth=1; c.setLineDash([4,4]);
    c.beginPath(); c.moveTo(cx+personH*0.25,baseY-personH); c.lineTo(cx+personH*0.25,baseY); c.stroke();
    c.setLineDash([]);
    c.fillStyle='#FFD700'; c.font=`bold ${Math.min(13,w2*0.03)}px Tajawal`;
    c.textAlign='left';
    c.fillText(`${Math.round(50+heightF*120)} سم`,cx+personH*0.28,baseY-personH*0.5);
    c.textAlign='center';

    // مرحلة
    c.fillStyle=ms.color; c.font=`bold ${Math.min(14,w2*0.032)}px Tajawal`;
    c.fillText(ms.label,cx,h2*0.9);

    // شريط تقدم العمر
    c.fillStyle='rgba(255,255,255,0.1)'; c.beginPath(); c.roundRect(w2*0.08,h2*0.94,w2*0.84,8,4); c.fill();
    c.fillStyle=ms.color; c.beginPath(); c.roundRect(w2*0.08,h2*0.94,w2*0.84*(age/18),8,4); c.fill();

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function repro_lifestyle(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.repro_lifestyle) simState.repro_lifestyle={t:0,choices:{sleep:7,exercise:3,fruits:3,smoking:0,stress:2}};
  const S=simState.repro_lifestyle;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌙 ساعات النوم: <span id="ls_sleep" style="color:#FFD700">${S.choices.sleep}</span></div>
      <input type="range" min="4" max="10" step="1" value="${S.choices.sleep}"
        oninput="simState.repro_lifestyle.choices.sleep=+this.value;document.getElementById('ls_sleep').textContent=this.value"
        style="width:100%;margin:4px 0">
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🏃 أيام الرياضة أسبوعياً: <span id="ls_ex" style="color:#FFD700">${S.choices.exercise}</span></div>
      <input type="range" min="0" max="7" step="1" value="${S.choices.exercise}"
        oninput="simState.repro_lifestyle.choices.exercise=+this.value;document.getElementById('ls_ex').textContent=this.value"
        style="width:100%;margin:4px 0">
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🍎 حصص الفواكه والخضار يومياً: <span id="ls_fr" style="color:#FFD700">${S.choices.fruits}</span></div>
      <input type="range" min="0" max="7" step="1" value="${S.choices.fruits}"
        oninput="simState.repro_lifestyle.choices.fruits=+this.value;document.getElementById('ls_fr').textContent=this.value"
        style="width:100%;margin:4px 0">
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🚬 مستوى التدخين: <span id="ls_sm" style="color:#FF6060">${S.choices.smoking}</span></div>
      <input type="range" min="0" max="5" step="1" value="${S.choices.smoking}"
        oninput="simState.repro_lifestyle.choices.smoking=+this.value;document.getElementById('ls_sm').textContent=this.value"
        style="width:100%;margin:4px 0">
    </div>`);

  function draw(){
    if(currentSim!=='repro_lifestyle') return;
    const w2=cv.width,h2=cv.height;
    c.clearRect(0,0,w2,h2);
    S.t+=0.03;

    const bg=c.createLinearGradient(0,0,0,h2);
    bg.addColorStop(0,'#0A1E2A'); bg.addColorStop(1,'#0D2E40');
    c.fillStyle=bg; c.fillRect(0,0,w2,h2);

    c.fillStyle='#80FFD0'; c.font=`bold ${Math.min(16,w2*0.036)}px Tajawal`;
    c.textAlign='center'; c.fillText('نمط الحياة وصحة الجسم',w2/2,h2*0.08);

    const ch=S.choices;
    const healthScore=Math.min(100,Math.max(0,
      (ch.sleep>=7?20:ch.sleep>=6?12:5)+
      (ch.exercise>=4?25:ch.exercise>=2?15:5)+
      (ch.fruits>=5?20:ch.fruits>=3?12:4)+
      (ch.smoking===0?25:ch.smoking<=2?10:0)+
      (15)
    ));

    // عقرب الصحة
    const meterCX=w2/2, meterCY=h2*0.42;
    const meterR=Math.min(w2*0.3,h2*0.28);
    // نصف دائرة
    c.strokeStyle='rgba(255,255,255,0.1)'; c.lineWidth=meterR*0.28;
    c.beginPath(); c.arc(meterCX,meterCY,meterR,Math.PI,0); c.stroke();
    // ألوان الصحة
    const grad=c.createLinearGradient(meterCX-meterR,meterCY,meterCX+meterR,meterCY);
    grad.addColorStop(0,'#E74C3C'); grad.addColorStop(0.5,'#F39C12'); grad.addColorStop(1,'#27AE60');
    c.strokeStyle=grad; c.lineWidth=meterR*0.26;
    c.beginPath(); c.arc(meterCX,meterCY,meterR,Math.PI,Math.PI+(healthScore/100)*Math.PI); c.stroke();
    // مؤشر
    const angle=Math.PI+(healthScore/100)*Math.PI;
    c.strokeStyle='white'; c.lineWidth=3;
    c.beginPath(); c.moveTo(meterCX,meterCY);
    c.lineTo(meterCX+Math.cos(angle)*meterR*0.85,meterCY+Math.sin(angle)*meterR*0.85);
    c.stroke();
    c.fillStyle='white'; c.beginPath(); c.arc(meterCX,meterCY,8,0,Math.PI*2); c.fill();

    // درجة الصحة
    const color=healthScore>70?'#27AE60':healthScore>40?'#F39C12':'#E74C3C';
    c.fillStyle=color; c.font=`bold ${meterR*0.35}px Tajawal`; c.textAlign='center';
    c.fillText(Math.round(healthScore),meterCX,meterCY-8);
    c.fillStyle='rgba(255,255,255,0.7)'; c.font=`${Math.min(12,w2*0.027)}px Tajawal`;
    c.fillText('/ 100',meterCX,meterCY+12);

    // نصائح
    const tips=[];
    if(ch.sleep<7) tips.push('💤 زد ساعات النوم إلى 8-9 ساعات');
    if(ch.exercise<3) tips.push('🏃 مارس الرياضة 3 أيام أسبوعياً على الأقل');
    if(ch.fruits<3) tips.push('🥦 تناول المزيد من الفواكه والخضار');
    if(ch.smoking>0) tips.push('🚭 التدخين يضر بالصحة — أقلع عنه!');
    if(tips.length===0) tips.push('✅ رائع! أنت تتبع نمط حياة صحياً');

    tips.slice(0,3).forEach((tip,i)=>{
      c.fillStyle=i===0&&ch.smoking>0?'#FF8080':'rgba(255,255,255,0.85)';
      c.font=`${Math.min(12.5,w2*0.028)}px Tajawal`;
      c.fillText(tip,w2/2,h2*0.72+i*22);
    });

    c.fillStyle=color; c.font=`bold ${Math.min(14,w2*0.032)}px Tajawal`;
    c.fillText(healthScore>70?'✅ نمط حياة صحي!':`⚠️ يحتاج تحسيناً`,w2/2,h2*0.92);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// الوحدة ٨ — الأملاح (PhET-style محسّن)
// ══════════════════════════════════════════════════════════

function salts_what(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.salts_what) simState.salts_what={t:0,sel:-1,dragging:false,dropX:0,dropY:0,dropped:false,dropAnim:0};
  const S=simState.salts_what;

  const salts=[
    {name:'كلوريد الصوديوم',formula:'NaCl',emoji:'🧂',color:'#7F8C8D',shine:'#BDC3C7',use:'حفظ الأغذية وإضفاء النكهة',acid:'HCl',base:'NaOH',ions:['Na⁺','Cl⁻']},
    {name:'كبريتات النحاس',formula:'CuSO₄',emoji:'🔵',color:'#2980B9',shine:'#5DADE2',use:'مبيد فطري للبذور',acid:'H₂SO₄',base:'Cu(OH)₂',ions:['Cu²⁺','SO₄²⁻']},
    {name:'نترات الأمونيوم',formula:'NH₄NO₃',emoji:'🌱',color:'#27AE60',shine:'#58D68D',use:'سماد زراعي',acid:'HNO₃',base:'NH₃',ions:['NH₄⁺','NO₃⁻']},
    {name:'كربونات الكالسيوم',formula:'CaCO₃',emoji:'📝',color:'#95A5A6',shine:'#BFC9CA',use:'طباشير السبورة والحجر الجيري',acid:'H₂CO₃',base:'Ca(OH)₂',ions:['Ca²⁺','CO₃²⁻']},
    {name:'كبريتات الألومنيوم',formula:'Al₂(SO₄)₃',emoji:'🎨',color:'#8E44AD',shine:'#BB8FCE',use:'تثبيت الأصباغ بالألياف',acid:'H₂SO₄',base:'Al(OH)₃',ions:['Al³⁺','SO₄²⁻']},
    {name:'كربونات المغنيسيوم',formula:'MgCO₃',emoji:'🤸',color:'#E67E22',shine:'#F0B27A',use:'جفاف اليدين في الرياضة',acid:'H₂CO₃',base:'Mg(OH)₂',ions:['Mg²⁺','CO₃²⁻']},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧂 اختر الملح لتحليله</div>
      ${salts.map((s,i)=>`<button class="ctrl-btn" style="margin:2px 0;width:100%;text-align:right;padding:6px 10px;${i===S.sel?'background:'+s.color+';color:white;':'font-size:13px'}" onclick="simState.salts_what.sel=${i};simState.salts_what.dropped=false;simState.salts_what.dropAnim=0">${s.emoji} ${s.name}</button>`).join('')}
    </div>
    ${S.sel>=0?`<button class="ctrl-btn play" style="margin-top:6px;width:100%" onclick="simState.salts_what.dropped=true;simState.salts_what.dropAnim=0">💧 أذِب في الماء</button>`:''}
    <div class="q-box" style="margin-top:8px">
      <strong>❓ الملح = ؟ + ؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الملح = حمض + قاعدة (بعد تفاعل التعادل) — مثل: HCl + NaOH → NaCl + H₂O</div>
    </div>`);

  function draw(){
    if(currentSim!=='salts_what') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.04;
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#E8F4F8'); bg.addColorStop(1,'#D0E8F0');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    if(S.sel<0){
      c.fillStyle='#1A8FA8'; c.font=`bold ${Math.min(18,w*0.04)}px Tajawal`;
      c.textAlign='center'; c.fillText('اختر ملحاً من القائمة لتحليله',w/2,h*0.45);
      c.font=`${Math.min(13,w*0.03)}px Tajawal`; c.fillStyle='#7A9AB0';
      c.fillText('ستظهر الأيونات والبنية الكيميائية',w/2,h*0.56);
      animFrame=requestAnimationFrame(draw); return;
    }

    const s=salts[S.sel];
    // عنوان
    c.fillStyle=s.color; c.font=`bold ${Math.min(17,w*0.038)}px Tajawal`;
    c.textAlign='center'; c.fillText(`${s.emoji} ${s.name}`,w/2,h*0.09);
    c.fillStyle='#555'; c.font=`bold ${Math.min(14,w*0.032)}px monospace`;
    c.fillText(s.formula,w/2,h*0.16);

    if(!S.dropped){
      // بلورات الملح تتحرك
      for(let i=0;i<12;i++){
        const ang=(i/12)*Math.PI*2+S.t*0.3;
        const r=Math.min(w*0.2,h*0.18)+Math.sin(S.t+i)*4;
        const bx=w/2+Math.cos(ang)*r, by=h*0.48+Math.sin(ang)*r*0.55;
        const sz=12+Math.sin(S.t*0.5+i)*3;
        c.fillStyle=s.color+'CC';
        c.beginPath(); c.roundRect(bx-sz/2,by-sz/2,sz,sz,3); c.fill();
      }
      c.fillStyle=s.color; c.font=`${Math.min(40,h*0.12)}px Arial`;
      c.textAlign='center'; c.fillText(s.emoji,w/2,h*0.56);
      c.fillStyle='rgba(26,143,168,0.6)'; c.font=`${Math.min(12,w*0.027)}px Tajawal`;
      c.fillText('اضغط "أذِب في الماء" لرؤية الأيونات',w/2,h*0.73);
    } else {
      // ذوبان الملح — أيونات تنفصل
      if(S.dropAnim<100) S.dropAnim++;
      const prog=S.dropAnim/100;

      // كأس ماء
      const bx2=w*0.2, bw2=w*0.6, by2=h*0.22;
      const waterColor=`rgba(${s.color.match(/\d+/g).map(Number).map((v,i)=>Math.min(255,v+100)).join(',')},${0.15+prog*0.25})`;
      c.fillStyle=waterColor; c.beginPath(); c.roundRect(bx2,by2,bw2,h*0.6,8); c.fill();
      c.strokeStyle=s.color+'88'; c.lineWidth=2; c.stroke();
      c.fillStyle='#3498DB44'; c.fillRect(bx2+2,by2+2,bw2-4,h*0.05); // حافة
      c.fillStyle='rgba(80,160,210,0.4)'; c.font=`${Math.min(12,w*0.027)}px Tajawal`;
      c.textAlign='center'; c.fillText('ماء H₂O',w/2,by2+h*0.06);

      // أيونات تتحرك
      s.ions.forEach((ion,ii)=>{
        const cnt=5;
        for(let j=0;j<cnt;j++){
          const ang=(ii*Math.PI+j/cnt*Math.PI*2)+S.t*(0.4+ii*0.15);
          const d=(0.15+prog*0.3)*Math.min(w,h)*0.35;
          const ix=w/2+Math.cos(ang)*d, iy=h*0.52+Math.sin(ang)*d*0.5;
          const col=ii===0?s.color:'#C0392B';
          c.fillStyle=col+'CC'; c.beginPath(); c.arc(ix,iy,9,0,Math.PI*2); c.fill();
          c.fillStyle='white'; c.font=`bold ${Math.min(8,w*0.018)}px monospace`;
          c.textAlign='center'; c.fillText(ion,ix,iy+3);
        }
      });

      if(prog>0.5){
        c.fillStyle=s.color; c.font=`bold ${Math.min(13,w*0.03)}px Tajawal`;
        c.fillText(`الاستخدام: ${s.use}`,w/2,h*0.88);
        c.fillStyle='#27AE60'; c.font=`${Math.min(11,w*0.025)}px Tajawal`;
        c.fillText(`من: ${s.acid} + ${s.base}`,w/2,h*0.94);
      }
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function salts_metal(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.salts_metal) simState.salts_metal={t:0,reaction:0,metal:'zinc',acid:'H₂SO₄',bubbles:[],dissolve:0,reacted:false};
  const S=simState.salts_metal;

  const metals={
    zinc:     {name:'الخارصين (Zn)',color:'#7F8C8D',shine:'#BDC3C7',salt:'كبريتات الخارصين',saltF:'ZnSO₄',saltColor:'rgba(127,140,141,0.5)',reacts:true,rate:1.2},
    magnesium:{name:'المغنيسيوم (Mg)',color:'#BDC3C7',shine:'#D5DBDB',salt:'كبريتات المغنيسيوم',saltF:'MgSO₄',saltColor:'rgba(189,195,199,0.4)',reacts:true,rate:2.0},
    iron:     {name:'الحديد (Fe)',color:'#8B6914',shine:'#B7950B',salt:'كبريتات الحديد',saltF:'FeSO₄',saltColor:'rgba(46,204,113,0.5)',reacts:true,rate:0.8},
    copper:   {name:'النحاس (Cu)',color:'#E67E22',shine:'#F0B27A',salt:'لا يتفاعل مع الأحماض المخففة',saltF:'—',saltColor:'transparent',reacts:false,rate:0},
    gold:     {name:'الذهب (Au)',color:'#D4AC0D',shine:'#F7DC6F',salt:'لا يتفاعل',saltF:'—',saltColor:'transparent',reacts:false,rate:0},
  };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔩 اختر الفلز</div>
      ${Object.entries(metals).map(([k,v])=>`<button class="ctrl-btn" style="margin:2px 0;width:100%;text-align:right;${k===S.metal?'background:'+v.color+';color:white;':''}" onclick="simState.salts_metal.metal='${k}';simState.salts_metal.reaction=0;simState.salts_metal.bubbles=[];simState.salts_metal.dissolve=0;simState.salts_metal.reacted=false">${v.name}</button>`).join('')}
    </div>
    <div class="ctrl-section" style="margin-top:8px">
      <button class="ctrl-btn play" style="width:100%" onclick="simState.salts_metal.reaction=1">➕ أضف الفلز للحمض</button>
      <button class="ctrl-btn reset" style="width:100%;margin-top:4px" onclick="simState.salts_metal.reaction=0;simState.salts_metal.bubbles=[];simState.salts_metal.dissolve=0;simState.salts_metal.reacted=false">↺ إعادة</button>
    </div>
    <div class="info-box" style="font-size:12px;line-height:1.9;margin-top:8px">
      📐 فلز + حمض → <strong>ملح + هيدروجين H₂</strong><br>
      <small>(الفلزات غير النشطة لا تتفاعل)</small>
    </div>`);

  function draw(){
    if(currentSim!=='salts_metal') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.05;
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F8F0E8'); bg.addColorStop(1,'#EDE4D5');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    const m=metals[S.metal];

    // عنوان
    c.fillStyle='#1A8FA8'; c.font=`bold ${Math.min(15,w*0.034)}px Tajawal`;
    c.textAlign='center'; c.fillText('نشاط 2-8 · تحضير ملح باستخدام فلز وحمض',w/2,h*0.07);

    // رسم الكأس بشكل أفضل
    const bx=w*0.25,by=h*0.12,bw=w*0.5,bh=h*0.62;
    // جوانب الكأس
    c.strokeStyle='#AAA'; c.lineWidth=2.5;
    c.beginPath(); c.moveTo(bx-bw*0.04,by); c.lineTo(bx,by+bh); c.stroke();
    c.beginPath(); c.moveTo(bx+bw+bw*0.04,by); c.lineTo(bx+bw,by+bh); c.stroke();
    c.beginPath(); c.moveTo(bx,by+bh); c.lineTo(bx+bw,by+bh); c.stroke();

    // سائل الحمض
    const acidY=by+bh*0.22;
    const acidGrad=c.createLinearGradient(bx,acidY,bx,by+bh);
    if(S.reaction>0 && m.reacts && S.dissolve>30){
      acidGrad.addColorStop(0,m.saltColor.replace('0.5','0.35')); acidGrad.addColorStop(1,m.saltColor.replace('0.5','0.6'));
    } else {
      acidGrad.addColorStop(0,'rgba(173,216,230,0.4)'); acidGrad.addColorStop(1,'rgba(144,238,144,0.6)');
    }
    c.fillStyle=acidGrad; c.fillRect(bx+1,acidY,bw-2,by+bh-acidY-1);
    c.fillStyle=S.reaction>0&&m.reacts&&S.dissolve>30?m.color:'#27AE60';
    c.font=`${Math.min(12,w*0.027)}px Tajawal`; c.textAlign='center';
    c.fillText(S.reaction>0&&m.reacts&&S.dissolve>30?m.saltF:'H₂SO₄ (حمض مخفف)',bx+bw/2,acidY+h*0.07);

    if(S.reaction>0){
      if(m.reacts){
        // الفلز يذوب
        S.dissolve=Math.min(100,S.dissolve+m.rate*0.4);
        const remain=1-S.dissolve/100;
        if(remain>0.05){
          const mh=h*0.12*remain;
          const mGrad=c.createLinearGradient(bx+bw*0.3,acidY-mh,bx+bw*0.7,acidY);
          mGrad.addColorStop(0,m.shine); mGrad.addColorStop(1,m.color);
          c.fillStyle=mGrad; c.beginPath(); c.roundRect(bx+bw*0.32,acidY-mh,bw*0.36,mh+4,4); c.fill();
          c.strokeStyle=m.color; c.lineWidth=1.5; c.stroke();
        }
        // فقاعات H₂
        if(Math.random()<0.18*m.rate && S.bubbles.length<35){
          S.bubbles.push({x:bx+bw*(0.25+Math.random()*0.5),y:by+bh*0.8,r:2+Math.random()*4,vy:-1.2-Math.random()*1.2,phase:Math.random()*6});
        }
        S.bubbles=S.bubbles.filter(b=>b.y>by);
        S.bubbles.forEach(b=>{
          b.y+=b.vy; b.x+=Math.sin(S.t*2+b.phase)*1.2;
          c.strokeStyle=`rgba(150,200,255,${0.6+b.r/8})`; c.lineWidth=1.5;
          c.beginPath(); c.arc(b.x,b.y,b.r,0,Math.PI*2); c.stroke();
        });
        // H₂ يتصاعد
        if(S.dissolve>5){
          c.fillStyle='rgba(41,128,185,0.8)'; c.font=`bold ${Math.min(13,w*0.03)}px Tajawal`;
          c.fillText('↑ غاز H₂',bx+bw/2,by+h*0.02);
        }
        // ناتج
        if(S.dissolve>50){
          c.fillStyle=m.color; c.font=`bold ${Math.min(13,w*0.03)}px Tajawal`;
          c.fillText('الملح الناتج: '+m.salt,bx+bw/2,h*0.85);
          c.font=`bold ${Math.min(14,w*0.032)}px monospace`; c.fillStyle=m.color;
          c.fillText(m.saltF,bx+bw/2,h*0.92);
        }
      } else {
        // لا يتفاعل
        c.fillStyle=m.color;
        c.beginPath(); c.roundRect(bx+bw*0.3,by+bh*0.55,bw*0.4,h*0.1,4); c.fill();
        c.fillStyle='#C0392B'; c.font=`bold ${Math.min(14,w*0.032)}px Tajawal`;
        c.fillText('❌ لا يتفاعل!',bx+bw/2,h*0.85);
        c.fillStyle='#555'; c.font=`${Math.min(11,w*0.025)}px Tajawal`;
        c.fillText('الفلزات غير النشطة لا تحلّ محل الهيدروجين',bx+bw/2,h*0.92);
      }
    } else {
      // الفلز فوق الكأس
      const mGrad2=c.createLinearGradient(bx+bw*0.3,by-h*0.14,bx+bw*0.7,by-h*0.04);
      mGrad2.addColorStop(0,m.shine); mGrad2.addColorStop(1,m.color);
      c.fillStyle=mGrad2; c.beginPath(); c.roundRect(bx+bw*0.3,by-h*0.15,bw*0.4,h*0.12,4); c.fill();
      c.strokeStyle=m.color; c.lineWidth=1.5; c.stroke();
      c.fillStyle='rgba(255,255,255,0.7)'; c.font=`bold ${Math.min(11,w*0.025)}px monospace`;
      c.textAlign='center'; c.fillText(m.name.match(/\((\w+)\)/)?.[1]||'M',bx+bw*0.5,by-h*0.1);
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function salts_oxide(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.salts_oxide) simState.salts_oxide={t:0,step:0,heat:0,stirAngle:0};
  const S=simState.salts_oxide;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔵 تحضير كبريتات النحاس</div>
      <button class="ctrl-btn play" style="width:100%" onclick="simState.salts_oxide.step=Math.min(5,simState.salts_oxide.step+1)">التالي ▶</button>
      <button class="ctrl-btn reset" style="width:100%;margin-top:4px" onclick="simState.salts_oxide.step=0;simState.salts_oxide.heat=0">↺ إعادة</button>
    </div>
    <div class="info-box" id="oxideInfo" style="font-size:12px;line-height:1.9;margin-top:8px">
      أكسيد النحاس + حمض الكبريتيك → كبريتات النحاس + ماء<br>
      <strong>CuO + H₂SO₄ → CuSO₄ + H₂O</strong>
    </div>`);

  const steps=[
    {title:'١. صبّ حمض الكبريتيك',color:'rgba(144,238,144,0.4)',label:'H₂SO₄',desc:'صبّ ~100 mL من الحمض في الكأس',showHeat:false,showStir:false,showCrystal:false},
    {title:'٢. إضافة أكسيد النحاس الأسود',color:'rgba(30,20,10,0.6)',label:'CuO أسود',desc:'أضف مسحوق CuO الأسود إلى الحمض',showHeat:false,showStir:false,showCrystal:false},
    {title:'٣. التسخين مع التحريك',color:'rgba(30,20,10,0.5)',label:'تسخين 🔥',desc:'سخّن ببطء مع تحريك مستمر',showHeat:true,showStir:true,showCrystal:false},
    {title:'٤. اللون يتحوّل للأزرق ✅',color:'rgba(41,128,185,0.55)',label:'CuSO₄ أزرق!',desc:'اللون الأزرق يعني اكتمال التفاعل',showHeat:false,showStir:false,showCrystal:false},
    {title:'٥. الترشيح',color:'rgba(41,128,185,0.45)',label:'سائل مرشّح',desc:'رشّح لإزالة CuO غير المتفاعل',showHeat:false,showStir:false,showCrystal:false},
    {title:'٦. التبخير — بلورات CuSO₄ ✅',color:'rgba(41,128,185,0.8)',label:'بلورات!',desc:'بخّر حتى تظهر البلورات الزرقاء الجميلة',showHeat:true,showStir:false,showCrystal:true},
  ];

  function draw(){
    if(currentSim!=='salts_oxide') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.05;
    if(steps[S.step].showHeat) S.heat=Math.min(100,S.heat+0.8);
    S.stirAngle+=steps[S.step].showStir?0.08:0;

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#EEF2F7'); bg.addColorStop(1,'#E0E8F0');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    const st=steps[S.step];
    const el=document.getElementById('oxideInfo');
    if(el) el.innerHTML=`<strong>${st.title}</strong><br>${st.desc}<br><small>CuO + H₂SO₄ → CuSO₄ + H₂O</small>`;

    c.fillStyle='#2980B9'; c.font=`bold ${Math.min(15,w*0.034)}px Tajawal`;
    c.textAlign='center'; c.fillText(st.title,w/2,h*0.08);

    // كأس مخبرية بشكل حقيقي
    const bx=w*0.25,by=h*0.12,bw=w*0.5,bh=h*0.55;
    // جسم الكأس
    c.strokeStyle='#AAA'; c.lineWidth=2;
    c.beginPath(); c.moveTo(bx,by); c.lineTo(bx+bw*0.04,by+bh); c.stroke();
    c.beginPath(); c.moveTo(bx+bw,by); c.lineTo(bx+bw-bw*0.04,by+bh); c.stroke();
    c.beginPath(); c.moveTo(bx+bw*0.04,by+bh); c.lineTo(bx+bw-bw*0.04,by+bh); c.stroke();
    // حافة الكأس
    c.strokeStyle='#CCC'; c.lineWidth=6;
    c.beginPath(); c.moveTo(bx-5,by); c.lineTo(bx+bw+5,by); c.stroke();
    // قياسات جانبية
    for(let i=1;i<=4;i++){
      const ly=by+bh-bh*(i/5);
      c.strokeStyle='rgba(0,0,0,0.1)'; c.lineWidth=1;
      c.beginPath(); c.moveTo(bx+5,ly); c.lineTo(bx+20,ly); c.stroke();
    }

    // سائل
    const liquidY=by+bh*0.15;
    c.fillStyle=st.color;
    c.beginPath(); c.moveTo(bx+4,liquidY); c.lineTo(bx+bw-4,liquidY); c.lineTo(bx+bw-bw*0.04,by+bh-1); c.lineTo(bx+bw*0.04,by+bh-1); c.closePath(); c.fill();
    c.fillStyle='white'; c.font=`bold ${Math.min(13,w*0.028)}px monospace`; c.textAlign='center';
    c.fillText(st.label,bx+bw/2,liquidY+h*0.1);

    // حرارة
    if(st.showHeat){
      for(let i=0;i<6;i++){
        const hx=bx+bw*(0.15+i*0.14);
        const amp=6+Math.sin(S.t*3+i)*3;
        c.strokeStyle=`rgba(231,76,60,${0.5+S.heat/200})`; c.lineWidth=2;
        c.beginPath(); c.moveTo(hx,by+bh+h*0.06); c.quadraticCurveTo(hx-8,by+bh+h*0.03,hx,by+bh); c.stroke();
      }
    }

    // محرك
    if(st.showStir){
      const sx=bx+bw/2, sy=liquidY+h*0.12;
      c.strokeStyle='#888'; c.lineWidth=2;
      c.beginPath(); c.moveTo(sx,by); c.lineTo(sx,sy-8); c.stroke();
      c.save(); c.translate(sx,sy); c.rotate(S.stirAngle);
      c.strokeStyle='#666'; c.lineWidth=3;
      c.beginPath(); c.moveTo(-bw*0.2,0); c.lineTo(bw*0.2,0); c.stroke();
      c.restore();
    }

    // بلورات
    if(st.showCrystal){
      for(let i=0;i<8;i++){
        const cx2=bx+bw*(0.15+i*0.1);
        const cy2=by+bh-h*0.04-Math.random()*0.01*h;
        const cs=8+Math.sin(S.t*0.3+i)*2;
        c.fillStyle='rgba(41,128,185,0.85)';
        c.save(); c.translate(cx2,cy2); c.rotate(S.t*0.01+i);
        c.beginPath(); c.rect(-cs/2,-cs/2,cs,cs); c.fill();
        c.strokeStyle='rgba(100,180,230,0.8)'; c.lineWidth=1; c.stroke();
        c.restore();
      }
    }

    // شريط التقدم
    c.fillStyle='rgba(0,0,0,0.1)'; c.beginPath(); c.roundRect(w*0.1,h*0.85,w*0.8,8,4); c.fill();
    c.fillStyle='#2980B9'; c.beginPath(); c.roundRect(w*0.1,h*0.85,w*0.8*(S.step+1)/steps.length,8,4); c.fill();
    c.fillStyle='#2980B9'; c.font=`${Math.min(11,w*0.025)}px Tajawal`;
    c.fillText(`الخطوة ${S.step+1} من ${steps.length}`,w/2,h*0.93);
    if(S.step===5) c.fillText('CuO + H₂SO₄ → CuSO₄ + H₂O ✅',w/2,h*0.97);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function salts_carbonate(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.salts_carbonate) simState.salts_carbonate={t:0,reaction:0,bubbles:[],co2prog:0,limeTest:false,pourAnim:0};
  const S=simState.salts_carbonate;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🫧 تفاعل كربونات مع حمض</div>
      <button class="ctrl-btn play" style="width:100%" onclick="simState.salts_carbonate.reaction=1;simState.salts_carbonate.pourAnim=0">➕ أضف كربونات النحاس</button>
      <button class="ctrl-btn" style="width:100%;margin-top:4px;background:#27AE60;color:white" onclick="simState.salts_carbonate.limeTest=true">🧪 اختبر بماء الجير</button>
      <button class="ctrl-btn reset" style="width:100%;margin-top:4px" onclick="simState.salts_carbonate.reaction=0;simState.salts_carbonate.bubbles=[];simState.salts_carbonate.co2prog=0;simState.salts_carbonate.limeTest=false;simState.salts_carbonate.pourAnim=0">↺ إعادة</button>
    </div>
    <div class="info-box" style="font-size:12px;line-height:1.9;margin-top:8px">
      كربونات + حمض →<br>
      <strong>ملح + ماء + CO₂</strong><br>
      CO₂ يُعكّر ماء الجير ← تأكيد ✅
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ كيف نُثبت أن الغاز المنطلق هو CO₂؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">نمرّره في ماء الجير Ca(OH)₂ — يتعكّر → يُكوّن CaCO₃ الأبيض الغير ذائب</div>
    </div>`);

  function draw(){
    if(currentSim!=='salts_carbonate') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.05;
    if(S.reaction>0) S.co2prog=Math.min(1,S.co2prog+0.006);

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F0FFF4'); bg.addColorStop(1,'#E0F8E8');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    c.fillStyle='#27AE60'; c.font=`bold ${Math.min(15,w*0.034)}px Tajawal`;
    c.textAlign='center'; c.fillText('نشاط 3-8 · كربونات الفلزات والأحماض',w/2,h*0.07);

    // كأس التفاعل
    const bx=w*0.08,bw=w*0.44,by=h*0.12,bh=h*0.55;
    c.strokeStyle='#AAA'; c.lineWidth=2;
    c.beginPath(); c.moveTo(bx,by); c.lineTo(bx+bw*0.03,by+bh); c.stroke();
    c.beginPath(); c.moveTo(bx+bw,by); c.lineTo(bx+bw-bw*0.03,by+bh); c.stroke();
    c.beginPath(); c.moveTo(bx+bw*0.03,by+bh); c.lineTo(bx+bw-bw*0.03,by+bh); c.stroke();
    c.strokeStyle='#DDD'; c.lineWidth=5; c.beginPath(); c.moveTo(bx-4,by); c.lineTo(bx+bw+4,by); c.stroke();

    const liqY=by+bh*0.25;
    const liqColor=S.reaction>0&&S.co2prog>0.3?'rgba(41,128,185,0.45)':'rgba(144,238,144,0.4)';
    c.fillStyle=liqColor; c.fillRect(bx+2,liqY,bw-4,by+bh-liqY-1);
    c.fillStyle=S.reaction>0&&S.co2prog>0.3?'#2980B9':'#27AE60';
    c.font=`${Math.min(11,w*0.025)}px Tajawal`; c.textAlign='center';
    c.fillText(S.reaction>0&&S.co2prog>0.3?'CuCl₂ (أزرق)':'HCl مخفف',bx+bw/2,liqY+h*0.06);

    // فقاعات
    if(S.reaction>0){
      if(Math.random()<0.22 && S.bubbles.length<40){
        S.bubbles.push({x:bx+bw*(0.2+Math.random()*0.6),y:by+bh*0.75,r:2+Math.random()*4.5,vy:-1.3-Math.random()*1.2,phase:Math.random()*6});
      }
      S.bubbles=S.bubbles.filter(b=>b.y>by-5);
      S.bubbles.forEach(b=>{
        b.y+=b.vy; b.x+=Math.sin(S.t*2.5+b.phase)*1.5;
        c.strokeStyle=`rgba(100,220,130,${0.5+b.r/12})`; c.lineWidth=1.5;
        c.beginPath(); c.arc(b.x,b.y,b.r,0,Math.PI*2); c.stroke();
      });
      c.fillStyle='rgba(39,174,96,0.8)'; c.font=`bold ${Math.min(13,w*0.03)}px Tajawal`;
      c.fillText('↑ CO₂ فوران!',bx+bw/2,by-h*0.01);
    }

    // كأس ماء الجير
    const gx=w*0.57,gw=w*0.38,gy=h*0.24,gh=h*0.38;
    c.strokeStyle='#AAA'; c.lineWidth=2;
    c.beginPath(); c.moveTo(gx,gy); c.lineTo(gx+gw*0.03,gy+gh); c.stroke();
    c.beginPath(); c.moveTo(gx+gw,gy); c.lineTo(gx+gw-gw*0.03,gy+gh); c.stroke();
    c.beginPath(); c.moveTo(gx+gw*0.03,gy+gh); c.lineTo(gx+gw-gw*0.03,gy+gh); c.stroke();
    c.strokeStyle='#DDD'; c.lineWidth=5; c.beginPath(); c.moveTo(gx-3,gy); c.lineTo(gx+gw+3,gy); c.stroke();

    const limeAlpha=S.limeTest?0.3+S.co2prog*0.5:0.3;
    const limeColor=S.limeTest&&S.co2prog>0.4?`rgba(200,200,200,${limeAlpha})`:'rgba(240,248,255,0.5)';
    c.fillStyle=limeColor; c.fillRect(gx+2,gy+gh*0.2,gw-4,gh*0.8);
    c.fillStyle=S.limeTest&&S.co2prog>0.4?'#7F8C8D':'#3498DB';
    c.font=`${Math.min(11,w*0.025)}px Tajawal`; c.textAlign='center';
    c.fillText('ماء الجير Ca(OH)₂',gx+gw/2,gy+gh*0.45);
    if(S.limeTest&&S.co2prog>0.4){
      c.fillStyle='#8B7355'; c.font=`bold ${Math.min(12,w*0.027)}px Tajawal`;
      c.fillText('تعكّر! ✅ CO₂ مؤكّد',gx+gw/2,gy+gh*0.72);
    }
    c.fillStyle='#666'; c.font=`${Math.min(11,w*0.024)}px Tajawal`;
    c.fillText('اختبار CO₂',gx+gw/2,gy-h*0.018);

    // سهم CO₂
    if(S.reaction>0 && S.co2prog>0.2){
      c.strokeStyle='rgba(39,174,96,0.6)'; c.lineWidth=2; c.setLineDash([5,4]);
      c.beginPath(); c.moveTo(bx+bw,by+bh*0.15); c.bezierCurveTo(w*0.52,by,w*0.52,gy+gh*0.1,gx,gy+gh*0.25); c.stroke();
      c.setLineDash([]);
      c.fillStyle='rgba(39,174,96,0.8)'; c.font=`${Math.min(10,w*0.023)}px Tajawal`;
      c.fillText('CO₂ ←',w*0.52,by+h*0.02);
    }

    // معادلة
    c.fillStyle='#27AE60'; c.font=`bold ${Math.min(11,w*0.024)}px monospace`;
    c.fillText('Cu₂CO₃ + 2HCl → 2CuCl + H₂O + CO₂',w/2,h*0.83);
    c.fillStyle=S.co2prog>0.6?'#1E8449':'#AAA'; c.font=`${Math.min(12,w*0.027)}px Tajawal`;
    c.fillText(S.co2prog>0.6?'✅ التفاعل اكتمل — ملح + ماء + CO₂':'أضف الكربونات للبدء',w/2,h*0.9);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// الوحدة ٩ — الصوت (PhET-style محسّن)
// ══════════════════════════════════════════════════════════

const SoundEngine = (function(){
  let ctx=null;
  function getCtx(){ if(!ctx) ctx=new(window.AudioContext||window.webkitAudioContext)(); return ctx; }
  return {
    tone(freq=440, dur=0.4, vol=0.25, type='sine'){
      try{
        const a=getCtx(); const g=a.createGain(); const o=a.createOscillator();
        o.type=type; o.frequency.value=freq;
        g.gain.setValueAtTime(vol,a.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+dur);
        o.connect(g); g.connect(a.destination);
        o.start(); o.stop(a.currentTime+dur);
      }catch(e){}
    },
    chord(freqs=[261,329,392], dur=0.6, vol=0.18){ freqs.forEach(f=>this.tone(f,dur,vol)); },
    drum(dur=0.15, vol=0.3){
      try{
        const a=getCtx(); const g=a.createGain(); const buf=a.createBuffer(1,a.sampleRate*dur,a.sampleRate);
        const d=buf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.exp(-i/d.length*15);
        const src=a.createBufferSource(); src.buffer=buf;
        g.gain.setValueAtTime(vol,a.currentTime); g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+dur);
        src.connect(g); g.connect(a.destination); src.start();
      }catch(e){}
    },
    silence(){}
  };
})();

function sound_pitch(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.sound_pitch) simState.sound_pitch={t:0,loudness:0.5,pitch:440,playReal:false};
  const S=simState.sound_pitch;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔊 شدة الصوت (السعة): <span id="spLoud" style="color:#FFD700">${S.loudness<0.3?'هادئ 🔈':S.loudness<0.7?'متوسط 🔉':'قوي 🔊'}</span></div>
      <input type="range" min="0.05" max="1" step="0.05" value="${S.loudness}"
        oninput="simState.sound_pitch.loudness=+this.value;document.getElementById('spLoud').textContent=+this.value<0.3?'هادئ 🔈':+this.value<0.7?'متوسط 🔉':'قوي 🔊'"
        style="width:100%;margin:6px 0">
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🎵 حدة الصوت / التردد: <span id="spPitch" style="color:#FFD700">${S.pitch} Hz</span></div>
      <input type="range" min="100" max="1000" step="25" value="${S.pitch}"
        oninput="simState.sound_pitch.pitch=+this.value;document.getElementById('spPitch').textContent=this.value+' Hz'"
        style="width:100%;margin:6px 0">
      <div style="display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,0.5)"><span>غليظ 🎸</span><span>رفيع 🎻</span></div>
    </div>
    <button class="ctrl-btn play" style="width:100%;margin-top:6px" onclick="
      try{
        const a=new(AudioContext||webkitAudioContext)();
        const o=a.createOscillator(); const g=a.createGain();
        o.frequency.value=simState.sound_pitch.pitch;
        g.gain.setValueAtTime(simState.sound_pitch.loudness*0.4,a.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+1.2);
        o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime+1.2);
      }catch(e){}
    ">▶ اسمع الصوت الحقيقي 🔊</button>
    <div class="info-box" style="margin-top:8px;font-size:12px;line-height:2">
      🔊 الشدة → سعة الموجة (ارتفاعها)<br>
      🎵 الحدة → تردد الموجة (عدد الموجات/ث)
    </div>`);

  function draw(){
    if(currentSim!=='sound_pitch') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.06;

    // خلفية شاشة أوسيلوسكوب
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#050D05'); bg.addColorStop(1,'#0A1A0A');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    // شبكة
    c.strokeStyle='rgba(0,140,0,0.12)'; c.lineWidth=0.5;
    for(let x=0;x<w;x+=w/10){ c.beginPath(); c.moveTo(x,0); c.lineTo(x,h); c.stroke(); }
    for(let y=0;y<h;y+=h/8){ c.beginPath(); c.moveTo(0,y); c.lineTo(w,y); c.stroke(); }

    const amp=S.loudness*h*0.3;
    const freq=S.pitch/300;
    const midY=h*0.5;

    // خط صفر
    c.strokeStyle='rgba(0,200,0,0.25)'; c.lineWidth=1;
    c.beginPath(); c.moveTo(0,midY); c.lineTo(w,midY); c.stroke();

    // الموجة الرئيسية
    c.strokeStyle='#00FF44'; c.lineWidth=2.5;
    c.shadowColor='#00FF44'; c.shadowBlur=10;
    c.beginPath();
    for(let x=0;x<=w;x+=2){
      const y=midY+Math.sin((x/w)*freq*Math.PI*8+S.t)*amp;
      x===0?c.moveTo(x,y):c.lineTo(x,y);
    }
    c.stroke(); c.shadowBlur=0;

    // قياس السعة
    c.strokeStyle='#FF4444'; c.lineWidth=1.5; c.setLineDash([3,3]);
    c.beginPath(); c.moveTo(w*0.06,midY-amp); c.lineTo(w*0.17,midY-amp); c.stroke();
    c.beginPath(); c.moveTo(w*0.06,midY+amp); c.lineTo(w*0.17,midY+amp); c.stroke();
    c.beginPath(); c.moveTo(w*0.09,midY-amp); c.lineTo(w*0.09,midY+amp); c.stroke();
    c.setLineDash([]);
    c.fillStyle='#FF6666'; c.font=`${Math.min(11,w*0.024)}px Tajawal`;
    c.textAlign='right'; c.fillText('سعة',w*0.085,midY-amp*0.5);
    c.textAlign='center';

    // قياس التردد (فترة واحدة)
    const waveLen=w/(freq*4);
    c.strokeStyle='#44AAFF'; c.lineWidth=1.5; c.setLineDash([3,3]);
    c.beginPath(); c.moveTo(w*0.25,midY+amp+15); c.lineTo(w*0.25+waveLen,midY+amp+15); c.stroke();
    c.setLineDash([]);
    c.fillStyle='#44AAFF'; c.font=`${Math.min(10,w*0.022)}px Tajawal`;
    c.fillText('↔ فترة',w*0.25+waveLen/2,midY+amp+28);

    // معلومات
    c.fillStyle='#00DD33'; c.font=`bold ${Math.min(13,w*0.03)}px Tajawal`;
    c.fillText(`الشدة: ${S.loudness<0.3?'🔈 هادئ':S.loudness<0.7?'🔉 متوسط':'🔊 قوي'}  |  التردد: ${S.pitch} Hz`,w/2,h*0.08);
    c.fillStyle='#44FFAA'; c.font=`${Math.min(11,w*0.025)}px Tajawal`;
    c.fillText(`الحدة: ${S.pitch<300?'غليظ 🎸':S.pitch<700?'متوسط 🎹':'رفيع 🎻'}`,w/2,h*0.94);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function sound_vibration(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.sound_vibration) simState.sound_vibration={t:0,length:0.6,amplitude:0.5,mass:1,plucked:false,pluckT:0};
  const S=simState.sound_vibration;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📏 طول المسطرة: <span id="svLen" style="color:#FFD700">${Math.round(S.length*30)} cm</span></div>
      <input type="range" min="0.2" max="1" step="0.05" value="${S.length}"
        oninput="simState.sound_vibration.length=+this.value;document.getElementById('svLen').textContent=Math.round(+this.value*30)+'cm'"
        style="width:100%;margin:6px 0">
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">↕ مقدار الجذب: <span id="svAmp" style="color:#FFD700">${Math.round(S.amplitude*100)}%</span></div>
      <input type="range" min="0.1" max="1" step="0.05" value="${S.amplitude}"
        oninput="simState.sound_vibration.amplitude=+this.value;document.getElementById('svAmp').textContent=Math.round(+this.value*100)+'%'"
        style="width:100%;margin:6px 0">
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">⚖️ الوزن المعلّق: <span id="svMass" style="color:#FFD700">${S.mass}</span> وحدة</div>
      <input type="range" min="1" max="5" step="1" value="${S.mass}"
        oninput="simState.sound_vibration.mass=+this.value;document.getElementById('svMass').textContent=+this.value"
        style="width:100%;margin:6px 0">
    </div>
    <button class="ctrl-btn play" style="width:100%;margin-top:6px" onclick="
      simState.sound_vibration.plucked=true;
      simState.sound_vibration.pluckT=0;
      try{
        const f=1.5/(simState.sound_vibration.length*Math.sqrt(simState.sound_vibration.mass))*180;
        const a=new(AudioContext||webkitAudioContext)();
        const o=a.createOscillator(); const g=a.createGain();
        o.frequency.value=Math.max(80,Math.min(800,f));
        g.gain.setValueAtTime(0.3*simState.sound_vibration.amplitude,a.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+1.5);
        o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime+1.5);
      }catch(e){}
    ">🎸 اقرع المسطرة</button>
    <div class="info-box" style="margin-top:8px;font-size:12px;line-height:2">
      طول أطول → تردد أقل (أبطأ)<br>
      كتلة أكبر → تردد أقل
    </div>`);

  function draw(){
    if(currentSim!=='sound_vibration') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.05; if(S.plucked) S.pluckT++;
    // تناقص بعد القرع
    const decay=S.plucked?Math.max(0,1-S.pluckT/120):1;

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#1A1205'); bg.addColorStop(1,'#2E2005');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    c.fillStyle='#FFD080'; c.font=`bold ${Math.min(16,w*0.036)}px Tajawal`;
    c.textAlign='center'; c.fillText('الاهتزازات — السعة والتردد',w/2,h*0.07);

    const freq=1.5/(S.length*Math.sqrt(S.mass));
    const deflection=S.amplitude*h*0.18*Math.sin(S.t*freq*6)*decay;

    // طاولة
    c.fillStyle='#8B6914'; c.beginPath(); c.roundRect(w*0.05,h*0.12,w*0.9,h*0.05,4); c.fill();

    // المسطرة (عازف الاهتزاز)
    const anchorX=w*0.28, anchorY=h*0.17;
    const rulerLen=S.length*h*0.5;
    const tipX=anchorX+deflection*0.5, tipY=anchorY+rulerLen;

    // ظل توهج
    if(Math.abs(deflection)>5){
      c.shadowColor='rgba(100,150,255,0.4)'; c.shadowBlur=12;
    }
    c.strokeStyle='#4A90D9'; c.lineWidth=7;
    c.beginPath(); c.moveTo(anchorX,anchorY); c.quadraticCurveTo(anchorX+deflection*0.7,anchorY+rulerLen*0.5,tipX,tipY); c.stroke();
    c.shadowBlur=0;
    // وزن
    const mSize=14+S.mass*4;
    const mGrad=c.createRadialGradient(tipX,tipY+mSize*0.5,2,tipX,tipY+mSize*0.5,mSize);
    mGrad.addColorStop(0,'#BDC3C7'); mGrad.addColorStop(1,'#7F8C8D');
    c.fillStyle=mGrad; c.beginPath(); c.roundRect(tipX-mSize/2,tipY,mSize,mSize*S.mass,4); c.fill();
    c.fillStyle='rgba(255,255,255,0.7)'; c.font=`bold ${mSize*0.55}px Tajawal`; c.textAlign='center';
    c.fillText(`${S.mass}W`,tipX,tipY+mSize*S.mass*0.6);

    // خط الاتزان
    c.strokeStyle='rgba(255,100,100,0.3)'; c.lineWidth=1; c.setLineDash([5,4]);
    c.beginPath(); c.moveTo(anchorX-w*0.07,tipY); c.lineTo(anchorX+w*0.07,tipY); c.stroke();
    c.setLineDash([]);
    // سهم السعة
    c.strokeStyle='rgba(255,80,80,0.6)'; c.lineWidth=1.5;
    c.beginPath(); c.moveTo(anchorX-w*0.06,tipY-S.amplitude*h*0.18); c.lineTo(anchorX-w*0.06,tipY+S.amplitude*h*0.18); c.stroke();
    c.fillStyle='#FF8888'; c.font=`${Math.min(10,w*0.022)}px Tajawal`; c.textAlign='right';
    c.fillText('سعة',anchorX-w*0.07,tipY);
    c.textAlign='center';

    // موجة صوتية تنتشر
    for(let i=0;i<5;i++){
      const waveX=anchorX+w*0.12+i*w*0.12;
      const wAlpha=0.4-i*0.07;
      const wAmp=S.amplitude*h*0.1*decay*(1-i*0.15)*Math.sin(S.t*freq*6-i*0.8);
      if(wAlpha>0&&waveX<w*0.9){
        c.strokeStyle=`rgba(100,200,100,${wAlpha})`; c.lineWidth=1.5;
        c.beginPath();
        for(let y=h*0.2;y<h*0.8;y+=3){
          const xOff=Math.sin((y-h*0.5)*0.08)*wAmp*0.5;
          y===h*0.2?c.moveTo(waveX+xOff,y):c.lineTo(waveX+xOff,y);
        }
        c.stroke();
      }
    }

    // قراءات
    const Hz=(freq*15).toFixed(1);
    c.fillStyle='rgba(0,0,0,0.5)'; c.beginPath(); c.roundRect(w*0.55,h*0.32,w*0.4,h*0.3,8); c.fill();
    c.strokeStyle='rgba(100,180,255,0.3)'; c.lineWidth=1; c.stroke();
    c.fillStyle='#80C4FF'; c.font=`bold ${Math.min(12,w*0.027)}px Tajawal`;
    c.fillText('📊 القراءات',w*0.75,h*0.41);
    c.fillStyle='#FFD700'; c.font=`${Math.min(11,w*0.025)}px Tajawal`;
    c.fillText(`التردد: ${Hz} Hz`,w*0.75,h*0.49);
    c.fillStyle='#80FF80';
    c.fillText(`الطول: ${Math.round(S.length*30)} cm`,w*0.75,h*0.54);
    c.fillStyle='#FFA0A0';
    c.fillText(`الوزن: ${S.mass} وحدة`,w*0.75,h*0.59);

    c.fillStyle='rgba(255,255,255,0.6)'; c.font=`${Math.min(11,w*0.025)}px Tajawal`;
    c.fillText(S.length>0.7?'مسطرة طويلة → تردد أقل':S.length<0.35?'مسطرة قصيرة → تردد أعلى':'اضغط "اقرع المسطرة" لسماع الصوت',w/2,h*0.88);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function sound_travel(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.sound_travel) simState.sound_travel={t:0,vacuum:false,medium:'air',waves:[],particles:[]};
  const S=simState.sound_travel;

  const mediums={
    air:  {name:'هواء',speed:1.0,color:'#3498DB',bgTop:'#87CEEB',bgBot:'#B0DCF0',pColor:'#3498DB',speedLabel:'343 م/ث'},
    water:{name:'ماء', speed:3.5,color:'#1A5276',bgTop:'#1B6CA8',bgBot:'#2E86C1',pColor:'#7FB3D3',speedLabel:'1480 م/ث'},
    solid:{name:'مادة صلبة',speed:10,color:'#7D6608',bgTop:'#C39A4A',bgBot:'#D4B060',pColor:'#F0C060',speedLabel:'5000 م/ث'},
  };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌊 الوسط الناقل</div>
      ${Object.entries(mediums).map(([k,v])=>`<button class="ctrl-btn" style="width:100%;margin:2px 0;${S.medium===k?'background:'+v.color+';color:white;':''}" onclick="simState.sound_travel.medium='${k}';simState.sound_travel.waves=[];simState.sound_travel.particles=[]">${k==='air'?'🌬️':k==='water'?'💧':'🪨'} ${v.name} (${v.speedLabel})</button>`).join('')}
    </div>
    <div class="ctrl-section" style="margin-top:8px">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;color:white">
        <input type="checkbox" ${S.vacuum?'checked':''} onchange="simState.sound_travel.vacuum=this.checked;simState.sound_travel.waves=[];simState.sound_travel.particles=[]">
        <span>🔕 فراغ (لا جزيئات)</span>
      </label>
    </div>
    <div class="info-box" style="margin-top:8px;font-size:12px;line-height:2">
      الصوت = موجة ضغط في الوسط المادي<br>
      الجزيئات تهتز وتدفع بعضها<br>
      في الفراغ: لا جزيئات → لا صوت
    </div>`);

  // تهيئة الجسيمات
  function initParticles(){
    S.particles=[];
    if(S.vacuum) return;
    const med=mediums[S.medium];
    const rows=S.medium==='solid'?6:4;
    const cols=12;
    for(let r=0;r<rows;r++) for(let col=0;col<cols;col++)
      S.particles.push({
        bx:(col+0.5)/cols,by:0.25+r*(0.5/rows),
        dx:0,phase:col*0.3+r*0.7,med:S.medium
      });
  }
  if(S.particles.length===0) initParticles();

  function draw(){
    if(currentSim!=='sound_travel') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.04;

    if(S.vacuum){
      c.fillStyle='#080818'; c.fillRect(0,0,w,h);
      // نجوم
      for(let i=0;i<40;i++){
        const sx=(Math.sin(i*137)*0.5+0.5)*w, sy=(Math.cos(i*97)*0.5+0.5)*h;
        c.fillStyle=`rgba(255,255,255,${0.3+Math.sin(S.t+i)*0.2})`; c.beginPath(); c.arc(sx,sy,1,0,Math.PI*2); c.fill();
      }
      c.fillStyle='#FF4444'; c.font=`bold ${Math.min(19,w*0.042)}px Tajawal`; c.textAlign='center';
      c.fillText('🔕 الصوت لا ينتقل في الفراغ!',w/2,h*0.42);
      c.fillStyle='rgba(255,255,255,0.6)'; c.font=`${Math.min(13,w*0.03)}px Tajawal`;
      c.fillText('لا توجد جزيئات لنقل الاهتزاز',w/2,h*0.55);
      c.fillStyle='rgba(255,255,255,0.3)'; c.font=`${Math.min(11,w*0.025)}px Tajawal`;
      c.fillText('الفضاء الخارجي — صمت مطبق ✨',w/2,h*0.68);
      animFrame=requestAnimationFrame(draw); return;
    }

    const med=mediums[S.medium];
    // خلفية
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,med.bgTop); bg.addColorStop(1,med.bgBot);
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // إضافة موجات دورية
    if(S.t%0.5<0.04) S.waves.push({x:w*0.12,alpha:1});
    S.waves=S.waves.filter(wv=>wv.x<w*1.1&&wv.alpha>0.02);
    S.waves.forEach(wv=>{ wv.x+=med.speed*3.5; wv.alpha*=0.97; });

    // رسم الجسيمات مع الاهتزاز
    S.particles.forEach(p=>{
      let wavePush=0;
      S.waves.forEach(wv=>{
        const dist=Math.abs(p.bx*w-wv.x);
        if(dist<w*0.12) wavePush+=Math.sin((p.bx*w-wv.x)*0.04)*wv.alpha*18;
      });
      p.dx=wavePush;
      const px=p.bx*w+p.dx, py=p.by*h;
      c.fillStyle=S.medium==='solid'?`hsl(${40+p.bx*20},60%,55%)`:med.pColor+'CC';
      const pr=S.medium==='solid'?5:3.5;
      c.beginPath(); c.arc(px,py,pr,0,Math.PI*2); c.fill();
      if(S.medium==='solid'){
        c.strokeStyle=med.pColor+'40'; c.lineWidth=0.8;
        if(p.bx<0.9) c.beginPath(), c.moveTo(px,py), c.lineTo(px+w/12,py), c.stroke();
      }
    });

    // موجات الضغط كمؤشرات بصرية
    S.waves.forEach(wv=>{
      const g=c.createLinearGradient(wv.x-20,0,wv.x+20,0);
      g.addColorStop(0,'transparent'); g.addColorStop(0.5,med.color+Math.round(wv.alpha*80).toString(16).padStart(2,'0')); g.addColorStop(1,'transparent');
      c.fillStyle=g; c.fillRect(wv.x-20,h*0.18,40,h*0.64);
    });

    // مصدر الصوت
    c.fillStyle=med.color+'CC'; c.font=`${Math.min(32,h*0.1)}px Arial`;
    c.textAlign='center'; c.fillText('🔊',w*0.1,h*0.55);

    // أذن
    c.fillText('👂',w*0.9,h*0.55);

    // إشارة الإرسال
    S.waves.filter(wv=>wv.x>w*0.7).forEach(wv=>{
      c.fillStyle=`rgba(255,220,50,${wv.alpha*0.8})`; c.font=`${Math.min(20,h*0.07)}px Arial`;
      c.fillText('🎵',w*0.87,h*0.35);
    });

    // معلومات
    c.fillStyle='rgba(0,0,0,0.45)'; c.beginPath(); c.roundRect(w*0.3,h*0.04,w*0.4,h*0.14,8); c.fill();
    c.fillStyle='white'; c.font=`bold ${Math.min(13,w*0.03)}px Tajawal`;
    c.fillText(`سرعة الصوت في ${med.name}: ${med.speedLabel}`,w/2,h*0.1);
    c.fillStyle='rgba(255,255,255,0.7)'; c.font=`${Math.min(11,w*0.025)}px Tajawal`;
    c.fillText('أسرع في المواد الصلبة > السوائل > الغازات',w/2,h*0.15);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function sound_oscilloscope(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.sound_oscilloscope) simState.sound_oscilloscope={t:0,amp:0.5,freq:2,showLabels:true,freeze:false,frozenT:0};
  const S=simState.sound_oscilloscope;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔊 شدة الصوت (السعة): <span id="soAmp" style="color:#00FF88">${S.amp<0.15?'صمت':S.amp<0.5?'هادئ 🔈':'قوي 🔊'}</span></div>
      <input type="range" min="0" max="1" step="0.05" value="${S.amp}"
        oninput="simState.sound_oscilloscope.amp=+this.value;document.getElementById('soAmp').textContent=+this.value<0.05?'صمت':+this.value<0.5?'هادئ 🔈':'قوي 🔊'"
        style="width:100%;margin:6px 0">
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🎵 حدة الصوت (التردد): <span id="soFreq" style="color:#44DDFF">${S.freq<2.5?'غليظ 🎸':S.freq<4?'متوسط 🎹':'رفيع 🎻'}</span></div>
      <input type="range" min="0.8" max="6" step="0.4" value="${S.freq}"
        oninput="simState.sound_oscilloscope.freq=+this.value;document.getElementById('soFreq').textContent=+this.value<2.5?'غليظ 🎸':+this.value<4?'متوسط 🎹':'رفيع 🎻'"
        style="width:100%;margin:6px 0">
    </div>
    <div style="display:flex;gap:6px;margin-top:6px">
      <button class="ctrl-btn" style="flex:1" onclick="simState.sound_oscilloscope.freeze=!simState.sound_oscilloscope.freeze;simState.sound_oscilloscope.frozenT=simState.sound_oscilloscope.t;this.textContent=simState.sound_oscilloscope.freeze?'▶ تشغيل':'⏸ تجميد'">⏸ تجميد</button>
      <button class="ctrl-btn" style="flex:1" onclick="simState.sound_oscilloscope.showLabels=!simState.sound_oscilloscope.showLabels">🏷 مسميات</button>
    </div>
    <div class="info-box" style="margin-top:8px;font-size:12px;line-height:2">
      📊 السعة أكبر = الصوت أقوى<br>
      📊 الموجات أقرب = التردد أعلى (رفيع)
    </div>`);

  function draw(){
    if(currentSim!=='sound_oscilloscope') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    if(!S.freeze) S.t+=0.06;

    // شاشة أوسيلوسكوب
    c.fillStyle='#050F05'; c.fillRect(0,0,w,h);
    // إطار
    c.strokeStyle='rgba(0,200,0,0.3)'; c.lineWidth=2;
    c.beginPath(); c.roundRect(8,8,w-16,h-16,6); c.stroke();
    // شبكة
    c.strokeStyle='rgba(0,160,0,0.1)'; c.lineWidth=0.5;
    for(let x=0;x<w;x+=w/10){ c.beginPath(); c.moveTo(x,0); c.lineTo(x,h); c.stroke(); }
    for(let y=0;y<h;y+=h/8){ c.beginPath(); c.moveTo(0,y); c.lineTo(w,y); c.stroke(); }
    // محور X
    c.strokeStyle='rgba(0,220,0,0.2)'; c.lineWidth=1.5;
    c.beginPath(); c.moveTo(0,h/2); c.lineTo(w,h/2); c.stroke();

    const amp=S.amp*h*0.36;
    const midY=h/2;

    if(S.amp<0.05){
      // صمت
      c.strokeStyle='#00FF44'; c.lineWidth=2;
      c.beginPath(); c.moveTo(0,midY); c.lineTo(w,midY); c.stroke();
      c.fillStyle='rgba(255,80,80,0.7)'; c.font=`bold ${Math.min(16,w*0.036)}px Tajawal`;
      c.textAlign='center'; c.fillText('🔕 صمت — لا اهتزاز',w/2,h*0.4);
    } else {
      // موجة جيبية
      c.strokeStyle='#00FF44'; c.lineWidth=2.5;
      c.shadowColor='rgba(0,255,68,0.4)'; c.shadowBlur=12;
      c.beginPath();
      for(let x=0;x<=w;x+=1.5){
        const y=midY+Math.sin((x/w)*S.freq*Math.PI*4+S.t)*amp;
        x===0?c.moveTo(x,y):c.lineTo(x,y);
      }
      c.stroke(); c.shadowBlur=0;

      if(S.showLabels){
        // سعة
        c.strokeStyle='rgba(255,60,60,0.7)'; c.lineWidth=1.5; c.setLineDash([3,3]);
        c.beginPath(); c.moveTo(w*0.05,midY-amp); c.lineTo(w*0.18,midY-amp); c.stroke();
        c.beginPath(); c.moveTo(w*0.05,midY+amp); c.lineTo(w*0.18,midY+amp); c.stroke();
        c.beginPath(); c.moveTo(w*0.09,midY-amp); c.lineTo(w*0.09,midY+amp); c.stroke();
        c.setLineDash([]);
        c.fillStyle='#FF7777'; c.font=`${Math.min(11,w*0.024)}px Tajawal`;
        c.textAlign='right'; c.fillText('سعة',w*0.08,midY-amp*0.45);

        // فترة
        const period=w/(S.freq*2);
        c.strokeStyle='rgba(68,170,255,0.7)'; c.lineWidth=1.5; c.setLineDash([3,3]);
        c.beginPath(); c.moveTo(w*0.3,midY+amp+12); c.lineTo(w*0.3+period,midY+amp+12); c.stroke();
        c.setLineDash([]);
        c.fillStyle='#44AAFF'; c.font=`${Math.min(10,w*0.022)}px Tajawal`;
        c.textAlign='center'; c.fillText('← فترة واحدة →',w*0.3+period/2,midY+amp+26);
        c.textAlign='center';
      }
    }

    // معلومات
    c.fillStyle='#00EE44'; c.font=`bold ${Math.min(13,w*0.03)}px Tajawal`;
    c.textAlign='center'; c.fillText(`الشدة: ${S.amp<0.05?'🔕 صمت':S.amp<0.35?'🔈 هادئ':S.amp<0.7?'🔉 متوسط':'🔊 قوي'}  |  الحدة: ${S.freq<2.5?'🎸 غليظ':S.freq<4?'🎹 متوسط':'🎻 رفيع'}`,w/2,h*0.07);
    c.fillStyle='rgba(0,200,100,0.7)'; c.font=`${Math.min(10,w*0.023)}px Tajawal`;
    c.fillText(S.freeze?'⏸ متجمّد':'التردد: '+S.freq.toFixed(1)+' × | السعة: '+Math.round(S.amp*100)+'%',w/2,h*0.95);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}



// أسئلة الوحدة 7 (ماذا نستنتج؟)
// ══════════════════════════════════════════════════════════
// إضافة الأسئلة للـ SIM_QUESTIONS
Object.assign(SIM_QUESTIONS, {
  circsystem:{
    q:'ما الوظيفة الرئيسية للجهاز الدوري في الإنسان؟',
    opts:['هضم الطعام','نقل الأكسجين والمواد الغذائية لجميع خلايا الجسم','تنظيم الحرارة فقط','إنتاج الهرمونات'],
    ans:1,
    fb:'✅ الجهاز الدوري يضخ الدم لتوصيل O₂ والجلوكوز لكل خلية، وإزالة CO₂ والفضلات. القلب + الدم + الأوعية الدموية هم أبطال هذه المهمة!'
  },
  heart8:{
    q:'كم عدد حجرات القلب في الإنسان؟',
    opts:['حجرتان فقط','ثلاث حجرات','أربع حجرات','ست حجرات'],
    ans:2,
    fb:'✅ للقلب 4 حجرات: أذين أيمن + بطين أيمن (الجانب الأيمن = دم غير مؤكسج) + أذين أيسر + بطين أيسر (الجانب الأيسر = دم مؤكسج).'
  },
  blood8:{
    q:'أي مكوّن من مكوّنات الدم يحمل الأكسجين؟',
    opts:['البلازما','خلايا الدم البيضاء','الصفائح الدموية','خلايا الدم الحمراء'],
    ans:3,
    fb:'✅ خلايا الدم الحمراء تحتوي على الهيموجلوبين — الصبغة الحمراء التي ترتبط بالأكسجين في الرئتين وتحمله لكل أنسجة الجسم!'
  },
  vessels8:{
    q:'ما الفرق الرئيسي بين الشرايين والأوردة؟',
    opts:['الشرايين أرق جداراً','الشرايين تحمل الدم من القلب — الأوردة تحمله إلى القلب','الأوردة تحمل الدم المؤكسج دائماً','لا فرق بينهما'],
    ans:1,
    fb:'✅ الشرايين تحمل الدم من القلب (بضغط عالٍ → جدران سميكة مرنة). الأوردة تحمله إلى القلب (بضغط أقل → جدران أرق + صمامات تمنع الرجوع).'
  },
  lungs8:{
    q:'ما وظيفة الحجاب الحاجز في عملية التنفس؟',
    opts:['ينتج الأكسجين','يصفّي الهواء من الجراثيم','يتحرك لأعلى وأسفل مسبباً الشهيق والزفير','يتحكم في صوت الكلام'],
    ans:2,
    fb:'✅ عند الشهيق: الحجاب الحاجز ينخفض → الضغط في الرئتين يقل → الهواء يدخل. عند الزفير: الحجاب يرتفع → الضغط يزيد → الهواء يخرج!'
  },
  gasex8:{
    q:'لماذا تُعدّ الحويصلات الهوائية صغيرة جداً أمراً مفيداً؟',
    opts:['لتوفير المساحة فقط','لتقليل الهواء الداخل','لزيادة مساحة السطح الكلية مما يسرّع تبادل الغازات','لأنها أسهل في التصنيع'],
    ans:2,
    fb:'✅ 300 مليون حويصلة صغيرة = مساحة سطح إجمالية 70 م² (كملعب تنس!). كلما صغرت الحويصلة، زادت نسبة المساحة/الحجم → انتشار O₂ وCO₂ أسرع!'
  },
  respiration8:{
    q:'ما ناتجا التنفس الهوائي داخل الخلايا؟',
    opts:['الأكسجين والجلوكوز','ثاني أكسيد الكربون والماء والطاقة','الأكسجين والطاقة فقط','الجلوكوز والماء'],
    ans:1,
    fb:'✅ جلوكوز + أكسجين → ثاني أكسيد الكربون + ماء + طاقة. الطاقة تُستخدم لكل وظائف الجسم، والـ CO₂ والماء يُطرحان عبر الرئتين!'
  },
  fitness8:{
    q:'لماذا يرتفع معدل النبض أثناء التمرين؟',
    opts:['لأن القلب يتعب','لضخ المزيد من O₂ والجلوكوز للعضلات النشطة','لتبريد الجسم','لأسباب مجهولة'],
    ans:1,
    fb:'✅ العضلات النشطة تحتاج O₂ وجلوكوز أكثر للتنفس الخلوي. القلب يضخ أسرع → المزيد من الدم → المزيد من O₂ والطاقة. لهذا نلهث ونتعرق!'
  },
  smoking8:{
    q:'أي مكوّن من دخان السجائر يمنع خلايا الدم الحمراء من حمل الأكسجين؟',
    opts:['النيكوتين','القطران','أول أكسيد الكربون','الجسيمات الدقيقة'],
    ans:2,
    fb:'✅ أول أكسيد الكربون CO يرتبط بالهيموجلوبين أقوى 200× من O₂! فيحتل مكانه ويمنع حمل الأكسجين → المدخّن يعاني من نقص أكسجين مزمن.'
  },
  // ── أسئلة الوحدة 8 (الأملاح) ──
  salts_what:{
    q:'كيف تتكوّن الأملاح من الأحماض؟',
    opts:['بإضافة الماء للحمض','باستبدال الهيدروجين في الحمض بفلز أو أيون فلزي','بتسخين الحمض','بتبريد الحمض'],
    ans:1,
    fb:'✅ الملح يتكوّن عندما يحلّ الفلز محل الهيدروجين في الحمض. مثال: HCl + Zn → ZnCl₂ + H₂ — كلوريد الخارصين هو الملح!'
  },
  salts_metal:{
    q:'ما الغاز المنطلق عند تفاعل فلز نشط مع حمض مخفف؟',
    opts:['الأكسجين','ثاني أكسيد الكربون','الهيدروجين','النيتروجين'],
    ans:2,
    fb:'✅ عند تفاعل الفلز مع الحمض: فلز + حمض → ملح + هيدروجين↑. يمكن التحقق منه بالشعلة المشتعلة — ينطفئ مع صوت "فرقعة" مميزة!'
  },
  salts_oxide:{
    q:'لماذا نستخدم أكسيد الفلز بدلاً من الفلز مباشرة لتحضير بعض الأملاح؟',
    opts:['لأنه أرخص','لأن الفلزات غير النشطة كالنحاس لا تتفاعل مع الأحماض مباشرة','لأن الأكسيد يُعطي لوناً أجمل','لأن الأكسيد أسرع في الذوبان'],
    ans:1,
    fb:'✅ النحاس والذهب والفضة فلزات غير نشطة — لا تتفاعل مع الأحماض المخففة. الحل: نستخدم أكسيدها (مثل CuO) الذي يتفاعل بسهولة مع الحمض!'
  },
  salts_carbonate:{
    q:'ما المنتجات الثلاثة لتفاعل الكربونات مع الحمض؟',
    opts:['ملح وماء فقط','ملح وأكسجين وماء','ملح وماء وثاني أكسيد الكربون','حمض وفلز وهيدروجين'],
    ans:2,
    fb:'✅ كربونات + حمض → ملح + ماء + CO₂↑. الفوران الذي تراه هو ثاني أكسيد الكربون! يمكن التحقق منه بتمريره في ماء الجير — يُعكّره!'
  },
  // ── أسئلة الوحدة 9 (الصوت) ──
  sound_pitch:{
    q:'ما الفرق بين شدة الصوت وحدة الصوت؟',
    opts:['هما نفس الشيء','الشدة تعني قوة الصوت (عالٍ/هادئ) — الحدة تعني رفاعته (رفيع/غليظ)','الحدة تعني قوة الصوت — الشدة تعني رفاعته','لا يوجد فرق علمي بينهما'],
    ans:1,
    fb:'✅ الشدة (Loudness) تُحدَّد بسعة الاهتزاز — صوت قوي = اهتزاز أكبر. الحدة (Pitch) تُحدَّد بالتردد — صوت رفيع = تردد أعلى (Hz أكثر)!'
  },
  sound_vibration:{
    q:'ما تأثير تقصير طول المسطرة المهتزة على تردد اهتزازها؟',
    opts:['يقل التردد','يزيد التردد','لا يتأثر التردد','يصبح التردد صفراً'],
    ans:1,
    fb:'✅ المسطرة القصيرة تهتز أسرع → تردد أعلى! والعكس: المسطرة الطويلة تهتز أبطأ → تردد أقل. هذا المبدأ يُستخدم في ضبط الآلات الموسيقية!'
  },
  sound_travel:{
    q:'لماذا لا يستطيع الصوت الانتقال في الفراغ؟',
    opts:['لأن الصوت أبطأ من الضوء','لأنه يحتاج وسطاً مادياً من جزيئات لنقل الاهتزاز','لأن الفراغ بارد جداً','لأن الصوت موجة ضوئية'],
    ans:1,
    fb:'✅ الصوت موجة ميكانيكية — تحتاج جزيئات تدفع بعضها بعضاً لنقل الاهتزاز. في الفراغ لا توجد جزيئات → لا صوت! لهذا لا نسمع انفجارات النجوم!'
  },
  sound_oscilloscope:{
    q:'على شاشة جهاز رسم الذبذبات — ماذا يعني ارتفاع الموجة أكثر؟',
    opts:['الصوت أكثر حدة (رفيع أكثر)','الصوت أعلى شدة (أقوى)','الصوت أبطأ انتقالاً','الصوت أكثر تردداً'],
    ans:1,
    fb:'✅ ارتفاع الموجة = السعة الأكبر = شدة أعلى = صوت أقوى! أما الحدة (رفيع/غليظ) فتُحدَّد بعدد الموجات في نفس الفضاء — كلما ازدادت كلما كان الصوت أرفع!'
  },
  // ── أسئلة الوحدة 10 (التكاثر والتطوّر) ──
  repro_gametes:{
    q:'لماذا يحتوي كلٌّ من البويضة والحيوان المنوي على 23 كروموسوماً فقط؟',
    opts:['لأنها خلايا صغيرة','حتى تكون البويضة المخصبة 23+23=46 كروموسوم وهو العدد الطبيعي لخلايا الجسم','لأن 23 رقم مقدّس','لتوفير الطاقة'],
    ans:1,
    fb:'✅ لو كان كل مشيج يحمل 46 كروموسوماً، لأصبح في البويضة المخصبة 92 — وهذا يُسبّب مشاكل وراثية. الطبيعة ذكية: 23+23=46 ✅ دائماً!'
  },
  repro_fertilisation:{
    q:'أين يحدث الإخصاب عادةً في جسم الأنثى؟',
    opts:['في الرحم','في المبيض','في قناة البيض','في المهبل'],
    ans:2,
    fb:'✅ الإخصاب يحدث في قناة البيض! البويضة تخرج من المبيض وتدخل قناة البيض حيث تلتقي بالحيوانات المنوية. ثم تنتقل البويضة المخصبة إلى الرحم للانغراس.'
  },
  repro_development:{
    q:'ما وظيفة المشيمة للجنين؟',
    opts:['حمايته من الصدمات','إنتاج السائل الأمنيوني','نقل الغذاء والأكسجين من دم الأم للجنين','تنظيم درجة حرارة الجنين فقط'],
    ans:2,
    fb:'✅ المشيمة = نظام دعم الحياة للجنين! تنقل O₂ والجلوكوز والمواد الغذائية من دم الأم، وتُزيل CO₂ والفضلات من دم الجنين. الحبل السرّي يربط الجنين بها.'
  },
  repro_growth:{
    q:'كيف يحدث النمو في جسم الإنسان؟',
    opts:['بزيادة حجم الخلايا فقط','بانقسام الخلايا ونموها — خلية واحدة تصبح ملايين','بدخول خلايا جديدة من الطعام','بالتنفس فقط'],
    ans:1,
    fb:'✅ بدأت بخلية واحدة (البويضة المخصبة) ثم انقسمت: 1→2→4→8→16... حتى أصبح جسمك من تريليونات الخلايا! النمو = انقسام متواصل + نمو الخلايا.'
  },
  repro_lifestyle:{
    q:'كيف يؤثر التدخين خلال الحمل على الجنين؟',
    opts:['لا يؤثر لأن المشيمة تحمي الجنين','يجعله أذكى','النيكوتين يدخل دم الجنين ويُبطئ نموه ويقلل وزنه عند الولادة','يؤثر فقط بعد الولادة'],
    ans:2,
    fb:'✅ النيكوتين يعبر المشيمة ويصل لدم الجنين — يُبطئ النمو ويُقلل وزن المولود ويزيد خطر أمراض مستقبلية كالسكري. الأمهات اللواتي دخّنّ قبل الحمل تواجهن مشاكل أيضاً!'
  }
});

// ══════════════════════════════════════════════════════════
// أسئلة الوحدة (الصف التاسع — الأحماض والقواعد)
// ══════════════════════════════════════════════════════════
Object.assign(SIM_QUESTIONS, {
  g9acidprop: {
    q: 'أيّ من الخصائص التالية تميّز الأحماض عن القواعد؟',
    opts: [
      'طعمها مُرّ وملمسها زلق',
      'طعمها حامض وتُحوّل ورقة تبّاع الشمس للأحمر',
      'لا تتفاعل مع المعادن',
      'رقمها الهيدروجيني دائماً أعلى من 7'
    ],
    ans: 1,
    fb: '✅ الأحماض طعمها حامض ومُؤكِّلة وتُحوّل ورقة تبّاع الشمس للأحمر ورقمها pH < 7. أما القواعد فطعمها مُرّ وملمسها زلق وتُحوّل الورقة للأزرق ورقمها pH > 7.'
  },
  g9indicator: {
    q: 'ما لون ورقة تبّاع الشمس عند غمسها في محلول قلوي؟',
    opts: [
      'أحمر',
      'أصفر',
      'أزرق',
      'لا يتغيّر اللون'
    ],
    ans: 2,
    fb: '✅ في المحاليل القلوية تتحوّل ورقة تبّاع الشمس للأزرق، وفي الحمضية للأحمر، وتبقى بنفسجية في المتعادلة. الكاشف العام يُعطي ألواناً مختلفة لكل قيمة pH!'
  },
  g9phscale: {
    q: 'محلول رقمه الهيدروجيني pH = 3 — كيف تُصنِّفه؟',
    opts: [
      'قلوي قوي',
      'متعادل',
      'حمضي متوسط القوة',
      'قلوي ضعيف'
    ],
    ans: 2,
    fb: '✅ مقياس pH يتراوح من 0 إلى 14. pH أقل من 7 = حمضي، pH = 7 = متعادل، pH أكبر من 7 = قلوي. pH = 3 حمضي متوسط (مثل الخل)، بينما pH = 1 حمضي قوي جداً!'
  },
  g9ions: {
    q: 'أيّ الأيونات يكون تركيزه أعلى في المحلول الحمضي؟',
    opts: [
      'أيونات OH⁻',
      'أيونات H⁺',
      'أيونات Na⁺',
      'التركيز متساوٍ دائماً'
    ],
    ans: 1,
    fb: '✅ في المحلول الحمضي: تركيز H⁺ > تركيز OH⁻. في القلوي: تركيز OH⁻ > تركيز H⁺. في المتعادل: H⁺ = OH⁻. هذا هو مبدأ برونستد-لوري للأحماض والقواعد!'
  },
  g9oxides: {
    q: 'ما الذي يُنتَج عند إذابة أكسيد لافلزي (حمضي) في الماء؟',
    opts: [
      'قاعدة/هيدروكسيد',
      'ملح فقط',
      'حمض',
      'غاز الهيدروجين'
    ],
    ans: 2,
    fb: '✅ أكسيد اللافلز + ماء → حمض. مثال: SO₃ + H₂O → H₂SO₄ (حمض الكبريتيك). أما أكسيد الفلز + ماء → قاعدة. والأكاسيد المتذبذبة (كـ Al₂O₃) تتفاعل مع الاثنين!'
  }
});
// ── الوحدة السابعة ──
Object.assign(SIM_QUESTIONS, {
  g9wordeq: {
    q: 'في المعادلة اللفظية: "ماغنيسيوم + أكسجين ← أكسيد الماغنيسيوم" — ما المواد المتفاعلة؟',
    opts: ['أكسيد الماغنيسيوم فقط','الماغنيسيوم والأكسجين','الأكسجين فقط','أكسيد الماغنيسيوم والأكسجين'],
    ans: 1,
    fb: '✅ المواد المتفاعلة هي التي تبدأ بها: الماغنيسيوم + الأكسجين. أما الناتج فهو أكسيد الماغنيسيوم.'
  },
  g9balance: {
    q: 'لموازنة المعادلة: H₂ + O₂ → H₂O — ما المعاملات الصحيحة؟',
    opts: ['H₂ + O₂ → H₂O','2H₂ + O₂ → 2H₂O','H₂ + 2O₂ → 2H₂O','2H₂ + 2O₂ → 2H₂O'],
    ans: 1,
    fb: '✅ 2H₂ + O₂ → 2H₂O صحيحة. على اليسار: 4H+2O. على اليمين: 4H+2O ✓. لا تغيّر الصيَغ، غيّر المعاملات فقط!'
  },
  g9statesym: {
    q: 'ما رمز الحالة الصحيح للمادة المذابة في الماء (محلول مائي)؟',
    opts: ['(s)','(l)','(g)','(aq)'],
    ans: 3,
    fb: '✅ (aq) من aqueous تعني مذاب في الماء. أما (s)=صلب، (l)=سائل، (g)=غاز.'
  },
  g9saltacid: {
    q: 'ما الملح الناتج عن تفاعل NaOH مع H₂SO₄؟',
    opts: ['NaCl','Na₂SO₄','NaNO₃','هيدروكسيد الصوديوم'],
    ans: 1,
    fb: '✅ NaOH + H₂SO₄ → Na₂SO₄ + H₂O. الملح كبريتات الصوديوم لأن الحمض هو حمض الكبريتيك!'
  },
  g9saltmetal: {
    q: 'ماذا يُنتَج عند تفاعل الزنك مع حمض الهيدروكلوريك؟',
    opts: ['كلوريد الزنك + أكسجين','أكسيد الزنك + ماء','كلوريد الزنك + هيدروجين','هيدروكسيد الزنك + كلور'],
    ans: 2,
    fb: '✅ Zn + 2HCl → ZnCl₂ + H₂↑. الفلز+الحمض → ملح+هيدروجين. الهيدروجين يُصدر فرقعة عند الإشعال!'
  },
  g9saltmake: {
    q: 'لماذا نُضيف فائضاً من الفلز أو الأكسيد في الطريقة أ لتحضير الملح الذائب؟',
    opts: ['لزيادة درجة الحرارة','للتأكد من استهلاك الحمض بالكامل','لتسريع التبخير','لتلوين المحلول'],
    ans: 1,
    fb: '✅ نُضيف فائضاً لضمان استهلاك كل الحمض. ثم نُرشّح الفائض ونُبخّر للحصول على بلورات الملح النقي!'
  },
  g9salttitra: {
    q: 'ما المقصود بنقطة النهاية في تجربة المعايرة؟',
    opts: ['عند غليان المحلول','عند تساوي الكميتين','عند تغير لون الكاشف','عند نفاد الحمض'],
    ans: 2,
    fb: '✅ نقطة النهاية هي تغيّر لون الكاشف دلالةً على اكتمال التعادل. عندها نوقف الإضافة ونقيس الحجم!'
  },
  // ── الوحدة التاسعة: التحليل الكيميائي ──
  g9watergas: {
    q: 'ما الكاشف الكيميائي المستخدَم للتحقق من وجود الماء؟',
    opts: ['ورقة تبّاع الشمس الحمراء','كبريتات النحاس (II) اللامائية','ماء الجير','حمض الهيدروكلوريك'],
    ans: 1,
    fb: '✅ كبريتات النحاس (II) اللامائية تتحوّل من الأبيض إلى الأزرق عند إضافة الماء: CuSO₄(أبيض) + 5H₂O → CuSO₄·5H₂O(أزرق). كلوريد الكوبالت اللامائي يتحوّل من الأزرق إلى الوردي أيضاً!'
  },
  g9flametest: {
    q: 'ما لون لهب البنسن الناتج عن وجود أيونات الصوديوم Na⁺؟',
    opts: ['أحمر قرمزي','أصفر مستمر','أرجواني','أخضر-أزرق'],
    ans: 1,
    fb: '✅ Na⁺ يُعطي لوناً أصفر برتقالياً مستمراً وقوياً جداً. Li⁺ أحمر قرمزي، K⁺ أرجواني، Cu²⁺ أخضر-أزرق. الأصفر القوي للصوديوم قد يُخفي ألوان الأيونات الأخرى!'
  },
  g9cationppt: {
    q: 'ما الراسب الناتج عند إضافة NaOH إلى محلول يحتوي على Fe³⁺؟',
    opts: ['راسب أزرق فاتح','راسب أخضر فاتح','راسب بني-محمر','لا يوجد راسب'],
    ans: 2,
    fb: '✅ Fe³⁺ + 3OH⁻ → Fe(OH)₃↓ (بني-محمر). أما Fe²⁺ فيُعطي راسباً أخضر فاتحاً، وCu²⁺ راسباً أزرق فاتحاً. لون الراسب هو المفتاح لتمييز الكاتيونات!'
  },
  g9aniontest: {
    q: 'ما الاختبار الكيميائي المستخدَم للكشف عن أيونات الكبريتات SO₄²⁻؟',
    opts: ['إضافة نترات الفضة AgNO₃','إضافة كلوريد الباريوم BaCl₂ + HCl','إضافة حمض HCl فقط','اختبار اللهب'],
    ans: 1,
    fb: '✅ كلوريد الباريوم يُعطي راسباً أبيض مع SO₄²⁻: Ba²⁺ + SO₄²⁻ → BaSO₄↓ (أبيض). يُضاف HCl أولاً لإزالة CO₃²⁻. الراسب الأبيض لا يذوب في HCl وهذا هو دليل التأكيد!'
  },
  g9chemlab: {
    q: 'في التحليل النوعي، ما الخطوة الأولى لتحديد هوية مركّب مجهول؟',
    opts: ['اختبار الترسيب مباشرةً','تحديد نوع الكاتيون ثم الأنيون','إضافة الأحماض فوراً','قياس درجة الغليان'],
    ans: 1,
    fb: '✅ التحليل النوعي يبدأ بتحديد الكاتيون (باستخدام اختبار اللهب والترسيب) ثم الأنيون (بنترات الفضة وكلوريد الباريوم والأحماض). هذا الترتيب المنهجي يضمن نتائج دقيقة!'
  },
  // ── الوحدة العاشرة: الأرض والغلاف الجوّي ──
  g9aircomp: {
    q: 'ما النسبة المئوية التقريبية للنيتروجين في الهواء الجاف؟',
    opts: ['21%','50%','78%','99%'],
    ans: 2,
    fb: '✅ الهواء يتكوّن تقريباً من 78% نيتروجين (N₂) + 21% أكسجين (O₂) + 0.9% أرغون + 0.04% ثاني أكسيد الكربون + غازات نادرة أخرى. النيتروجين هو المكوّن الرئيسي!'
  },
  g9combustion: {
    q: 'ما الناتج الرئيسي لاحتراق الميثان CH₄ احتراقاً غير كامل (مع نقص الأكسجين)؟',
    opts: ['ثاني أكسيد الكربون CO₂','أكسيد الكربون CO','ثاني أكسيد الكبريت SO₂','النيتروجين N₂'],
    ans: 1,
    fb: '✅ الاحتراق غير الكامل (نقص O₂) ينتج أكسيد الكربون CO السام: 2CH₄ + 3O₂ → 2CO + 4H₂O. أما الاحتراق الكامل (O₂ وفير) فينتج CO₂ + H₂O. CO خطير لأنه يرتبط بالهيموغلوبين!'
  },
  g9acidrain: {
    q: 'أيٌّ من الغازات التالية يُساهم بشكل رئيسي في تكوُّن المطر الحمضي؟',
    opts: ['النيتروجين N₂ والأكسجين O₂','ثاني أكسيد الكبريت SO₂ وأكاسيد النيتروجين NOₓ','الأرغون والهيليوم','ثاني أكسيد الكربون وبخار الماء فقط'],
    ans: 1,
    fb: '✅ SO₂ + H₂O → H₂SO₃ (حمض الكبريتوز) | NO₂ + H₂O → HNO₃ (حمض النيتريك). هذه الأحماض تخفّض pH المطر إلى ما دون 5.6 مما يُسبّب المطر الحمضي الضار!'
  },
  g9greenhouse: {
    q: 'أيٌّ من الغازات التالية أكثر فاعلية كغاز دفيئة بـ 20 مرة مقارنةً بثاني أكسيد الكربون؟',
    opts: ['النيتروجين N₂','الأرغون Ar','الميثان CH₄','الأكسجين O₂'],
    ans: 2,
    fb: '✅ الميثان CH₄ فاعليته كغاز دفيئة تُقارب 20 مرة أكثر من CO₂! يصدر من مناجم الفحم والمواشي والمكبّات. وغازات الدفيئة الرئيسية هي: CO₂ وCH₄ وبخار الماء وأكاسيد النيتروجين.'
  },
  g9limestone: {
    q: 'ما الناتجان الرئيسيان للتفكك الحراري لكربونات الكالسيوم CaCO₃؟',
    opts: ['CaO + CO₂','Ca + CO₃','CaCl₂ + H₂O','Ca(OH)₂ + CO'],
    ans: 0,
    fb: '✅ CaCO₃(s) → CaO(s) + CO₂(g) — التفكك الحراري عند درجات حرارة مرتفعة جداً. CaO (الجير الحيّ) يتفاعل مع الماء: CaO + H₂O → Ca(OH)₂ (الجير المطفأ) القلوي الذي يُعادل التربة الحمضية!'
  }
});

// ── الصف التاسع — فيزياء الوحدة 11: مصادر الطاقة (سؤال لكل تبويب) ──
Object.assign(SIM_QUESTIONS, {
  g9energymix_0: {
    q: 'ما الذي يميّز مصادر الطاقة المتجددة عن غير المتجددة؟',
    opts: [
      'تتجدد بسرعة في الطبيعة مقارنةً باستهلاكنا لها',
      'لا تُنتج أي طاقة على الإطلاق',
      'تعتمد فقط على الفحم والنفط',
      'لا يمكن استخدامها في توليد الكهرباء'
    ],
    ans: 0,
    fb: '✅ المصادر المتجددة (شمس، رياح، ماء…) تُعاد تكوينها أو تتدفق باستمرار. أما الأحفورية والنووي فيعتمدان على وقود مخزّن يستهلك أسرع مما يتكوّن.'
  },
  g9energymix_1: {
    q: 'ماذا يحدث غالباً عند زيادة حصة الوقود الأحفوري في مزيج الطاقة؟',
    opts: [
      'تقل الانبعاثات ويختفي الحاجة للشبكة',
      'ترتفع الانبعاثات الحرارية غالباً مع بقاء تحديات أخرى للتشغيل',
      'تختفي طاقة الرياح تماماً',
      'تصبح جميع المصادر متجددة تلقائياً'
    ],
    ans: 1,
    fb: '✅ الوقود الأحفوري يحرق كربوناً مخزّناً فيزداد CO₂. المزيج المتوازن يقلّل الانبعاثات ويُثبّت التزويد لكنه يحتاج تخطيطاً وتخزيناً وربط شبكة.'
  },
  g9solar_0: {
    q: 'متى يكون سقوط أشعة الشمس على اللوح الشمسي أكثر فعالية تقريباً؟',
    opts: [
      'عندما تكون الأشعة شبه عمودية على سطح اللوح',
      'عندما تكون الأشعة شبه مموازية للوح',
      'عند إطفاء الشمس في المحاكاة فقط',
      'لا تؤثر زاوية السقوط على الإنتاج'
    ],
    ans: 0,
    fb: '✅ كلما اقتربت زاوية السقوط من العمود على السطح زادت المساحة الفعّالة للإشعاع، فيزداد الإنتاج (مع افتراض نفس شدة الإشعاع).'
  },
  g9solar_1: {
    q: 'ماذا تعني كفاءة 30% لجهاز يحوّل الطاقة؟',
    opts: [
      '30% من طاقة الإدخال تُستغل كطاقة مفيدة والباقي فاقد غالباً',
      'الجهاز يعمل 30 ساعة فقط',
      '30% من الجهاز معطّل دائماً',
      'طاقة الإدخال تساوي الصفر'
    ],
    ans: 0,
    fb: '✅ الكفاءة = الطاقة المفيدة ÷ طاقة الإدخال. الباقي يضيع غالباً كحرارة أو احتكاك أو صوت — لذلك نحسّن العزل والتصميم.'
  },
  g9wind_0: {
    q: 'كيف تتغير القدرة النسبية لتوربين رياح عند مضاعفة سرعة الرياح (تقريباً في هذا النموذج)؟',
    opts: [
      'تبقى كما هي',
      'تتضاعف مرتين فقط',
      'تزيد بشكل كبير (تقارب مكعب السرعة)',
      'تنعدم تماماً'
    ],
    ans: 2,
    fb: '✅ في الواقع القدرة تتناسب تقريباً مع مكعب سرعة الرياح P ∝ v³ — لذلك فرق بسيط في السرعة يغيّر الإنتاج كثيراً.'
  },
  g9wind_1: {
    q: 'ما الذي يزيد إنتاج مزرعة الرياح في هذا الاستقصاء؟',
    opts: [
      'زيادة عدد التوربينات و/أو سرعة الرياح',
      'إطفاء جميع التوربينات',
      'تقليل سرعة الرياح فقط دون غير ذلك',
      'عدد التوربينات لا يؤثر أبداً'
    ],
    ans: 0,
    fb: '✅ الإنتاج يجمع مساهمة كل توربين، وكل توربين يستفيد من الريح الأقوى — لذلك العدد والسرعة معاً يحددان المخرجات.'
  },
  g9hydro_0: {
    q: 'في الطاقة الكهرومائية، ماذا يحدث عند زيادة فرق الارتفاع ومعدل تدفق الماء معاً؟',
    opts: [
      'تقل القدرة المائية',
      'تزداد القدرة المنتجة (في النموذج)',
      'لا يتغيّر شيء',
      'يتوقف الماء عن الحركة'
    ],
    ans: 1,
    fb: '✅ طاقة الماء ترتبط بارتفاع السقوط وحجم التدفق — كلما زادا زادت الطاقة المتاحة للتوربينات (مع افتراض نفس الكفاءة).'
  },
  g9hydro_1: {
    q: 'في طاقة المدّ والجزر، كيف يتأثر مؤشر الطاقة النسبي عند زيادة مدى المدّ؟',
    opts: [
      'ينخفض دائماً',
      'يزداد لأن حجم الماء المتحرك والفرق في المستوى يكبر',
      'لا علاقة لمدى المدّ بالطاقة',
      'يصبح سالباً'
    ],
    ans: 1,
    fb: '✅ مدى أكبر يعني فرق منسوب أعلى وكتلة ماء أوسع تتحرك — فيزداد الإمكان النظري لتوليد الطاقة (مع افتراض موقع مناسب للسدّ البحري).'
  },
  g9fossil_0: {
    q: 'أي مقارنة تصف غالباً الفرق بين الوقود الأحفوري والطاقة النووية لتوليد الكهرباء؟',
    opts: [
      'كلاهما بلا انبعاثات كربونية',
      'الأحفوري انبعاثات CO₂ عالية عادةً؛ النووي انبعاثات تشغيل منخفضة لكن مخاطر وبنية تحتية خاصة',
      'النووي لا يُنتج طاقة',
      'لا فرق بينهما بيئياً'
    ],
    ans: 1,
    fb: '✅ الاحتراق الأحفوري يطلق CO₂. المفاعلات لا «تحرق» وقوداً كيميائياً بنفس الطريقة فانبعاثات التشغيل أقل، لكن هناك مخاطر تشغيل، نفايات مشعّة، وتكلفة أمان عالية.'
  },
  g9fossil_1: {
    q: 'ماذا يحدث لمؤشر الانبعاثات عند استبدال جزء من الحصة الأحفورية بمصادر متجددة في المزيج؟',
    opts: [
      'يرتفع دائماً',
      'يقل غالباً',
      'يصبح صفراً فوراً دائماً',
      'لا يتأثر أبداً'
    ],
    ans: 1,
    fb: '✅ المتجددة تقلل غالباً حرق الوقود الكربوني في النموذج، فينخفض المؤشر — لكن التحول الحقيقي يحتاج شبكة وتخزين وتنويع مصادر.'
  },
  g9efficiency_0: {
    q: 'لماذا لا تصل كفاءة أي جهاز حقيقي إلى 100% غالباً؟',
    opts: [
      'لأن جزءاً من الطاقة يضيع كحرارة واحتكاك وصوت',
      'لأن القوانين تمنع أي إنتاج مفيد',
      'لأن الكفاءة لا قيمة لها في الفيزياء',
      'لأن الطاقة المفيدة دائماً أكبر من المدخلات'
    ],
    ans: 0,
    fb: '✅ الفاقد الحراري والاحتكاك والتشويه في الدوائر والمحركات يجعل المخرجات المفيدة أقل من المدخلات — لذلك نحسّن العزل والتشحيم والتصميم.'
  },
  g9efficiency_1: {
    q: 'ماذا يحدث لكفاءة النظام عند تقليل نسبة الفاقد (في هذا النموذج)؟',
    opts: [
      'تنخفض الكفاءة',
      'ترتفع الكفاءة',
      'تبقى 50% دائماً',
      'تصبح الطاقة المفيدة صفراً'
    ],
    ans: 1,
    fb: '✅ هنا الكفاءة = 100% − الفاقد. تقليل الفاقد يعني استغلالاً أفضل لنفس طاقة الإدخال — في الواقع نعالج نوع الفاقد (عزل، احتكاك، ضياع في المحوّلات…).'
  },
  // ── الصف التاسع — فيزياء 12–13: انعكاس وانكسار الضوء ──
  g9refl_0: {
    q: 'في الانعكاس عن سطح مستوٍ (كالمرآة)، ما العلاقة بين زاوية السقوط i وزاوية الانعكاس r (كلتاهما بالنسبة للعمود المقام)؟',
    opts: ['i = 2r', 'i = r', 'i + r = 90°', 'لا علاقة بينهما'],
    ans: 1,
    fb: '✅ قانون الانعكاس: زاوية السقوط = زاوية الانعكاس، وتُقاس الزاويتان من العمود المقام وليس من سطح المرآة مباشرة.'
  },
  g9refl_1: {
    q: 'ما الغرض الأساسي من رسم مخطط الأشعة عند دراسة المرايا؟',
    opts: [
      'زخرفة الرسم فقط',
      'تتبّع مسار الضوء وتحديد اتجاه الصور والأشعة المنعكسة',
      'قياس كتلة المرآة',
      'إثبات أن الضوء لا ينعكس'
    ],
    ans: 1,
    fb: '✅ مخطط الأشعة يُظهر الشعاع الساقط والعمود والشعاع المنعكس — فيساعد على فهم أين تتكوّن الصورة وكيف تتغيّر مع موضع الجسم والمرآة.'
  },
  g9refract_0: {
    q: 'عند مرور ضوء من الهواء إلى وسط أكثر كثافة بصرياً (n أكبر)، ماذا يحدث للشعاع المنكسر بالنسبة للعمود المقام؟',
    opts: [
      'يبتعد عن العمود (زاوية انكسار أكبر من زاوية السقوط)',
      'يقترب من العمود (زاوية انكسار أصغر من زاوية السقوط)',
      'يمشي بلا انحناء دائماً',
      'ينعكس كلياً دائماً'
    ],
    ans: 1,
    fb: '✅ حسب قانون سنيل: عند الدخول إلى وسط أكثر كثافة (n₂ > n₁) ينثني الشعاع نحو العمود، أي r < i.'
  },
  g9refract_1: {
    q: 'عند انتقال الضوء من زجاج (n₁ أكبر) إلى هواء (n₂ أصغر)، متى يحدث الانعكاس الكلي الداخلي؟',
    opts: [
      'عند أي زاوية سقوط',
      'عندما تزيد زاوية السقوط عن الزاوية الحرجة',
      'عندما يكون n₁ = n₂',
      'فقط عند زاوية سقوط صفر'
    ],
    ans: 1,
    fb: '✅ إذا تجاوزت زاوية السقوط الزاوية الحرجة c حيث sin c = n₂/n₁، لا يوجد حل لقانون سنيل للانكسار في الوسط الثاني — فينعكس كل الضوء داخل الوسط الأكثر كثافة.'
  },
  g9refltype_0: {
    q: 'أين يحدث الانعكاس المنتظم غالباً؟',
    opts: ['على سطح خشن جداً', 'على سطح أملس جداً مثل مرآة', 'داخل الماء فقط', 'في الفراغ فقط'],
    ans: 1,
    fb: '✅ السطح الأملس يحافظ على توازي الأشعة المنعكسة فيتكوّن حزم واضحة وصورة. السطح الخشن يشتّت الاتجاهات (انعكاس متشتت).'
  },
  g9refltype_1: {
    q: 'لماذا تُصمَّم شاشات العرض لتعكس الضوء بشكل متشتت؟',
    opts: [
      'لكي يرى الجمهور من زوايا مختلفة دون صورة لامعة ضيقة',
      'لكي لا يرى أحد الشاشة',
      'لزيادة انعكاس منتظم فقط',
      'لأن الشاشة مرآة كاملة'
    ],
    ans: 0,
    fb: '✅ الانعكاس المتشتت يوزّع الضوء في اتجاهات متعددة فيمكن رؤية الصورة من أماكن مختلفة دون وهج مركز (على عكس المرآة اللامعة).'
  },
  g9refractN_0: {
    q: 'ما العلاقة بين معامل الانكسار n وسرعة الضوء v داخل المادة؟',
    opts: [
      'كلما زاد n زادت v دائماً',
      'n = c/v حيث c سرعة الضوء في الفراغ — فكلما زاد n قلّت v',
      'لا علاقة بين n و v',
      'n يعني لون المادة فقط'
    ],
    ans: 1,
    fb: '✅ n = c/v تقريباً في المادة. المادة الأكثر كثافة بصرياً تبطئ الضوء أكثر فتكون n أكبر.'
  },
  g9refractN_1: {
    q: 'عند ثبات زاوية السقوط من الهواء، ماذا يحدث لزاوية الانكسار عند الدخول إلى مادة ذات n أكبر؟',
    opts: ['تزداد', 'تنقص', 'تبقى دائماً 90°', 'تصبح صفراً دائماً'],
    ans: 1,
    fb: '✅ من n₁ sin i = n₂ sin r: إذا زاد n₂ ينقص sin r فيقل r — الشعاع ينحني أكثر نحو العمود.'
  }
});


// ══════════════════════════════════════════════════════════
// أسئلة «ماذا نستنتج؟» — الصف الخامس (الوحدة الرابعة: الضوء والرؤية)
// ══════════════════════════════════════════════════════════
Object.assign(SIM_QUESTIONS, {

  // ١-٤ انتقال الضوء من مصدر — تبويب مختبر الضوء
  g5lighttravel: {
    q: 'ما الذي يثبته مختبر الضوء عن طريقة انتقال الضوء من المصدر؟',
    opts: [
      'ينتقل الضوء في اتجاه واحد فقط نحو الأجسام القريبة',
      'ينتقل الضوء من المصدر في جميع الاتجاهات على شكل أشعة مستقيمة',
      'ينتقل الضوء ببطء ويحتاج وقتاً طويلاً للوصول للجسم',
      'ينتقل الضوء فقط في الأوساط الشفافة'
    ],
    ans: 1,
    fb: '✅ الضوء ينتقل من مصدره في جميع الاتجاهات على شكل أشعة مستقيمة، فيصطدم بالأجسام من حوله وينعكس عنها ليصل إلى أعيننا فنرى.'
  },

  // ١-٤ انتقال الضوء من مصدر — تبويب كيف نرى؟
  g5lighttravel_1: {
    q: 'ما الترتيب الصحيح لمراحل الرؤية عند رؤية الكرة في ضوء الشمس؟',
    opts: [
      'العين ← الكرة ← الشمس',
      'الشمس ← الكرة ← العين',
      'الشمس ← العين ← الكرة',
      'الكرة ← الشمس ← العين'
    ],
    ans: 2,
    fb: '✅ مراحل الرؤية الثلاث: ① الشمس (مصدر الضوء) تُصدر الضوء → ② يصطدم بالكرة وينعكس → ③ الضوء المنعكس يدخل العين فنرى الكرة. بدون مصدر ضوء لا رؤية!'
  },

  // ٢-٤ المرايا — المرآة المستوية
  g5mirror: {
    q: 'ماذا يحدث لزاوية الانعكاس عندما تزيد زاوية السقوط على المرآة؟',
    opts: [
      'تقل زاوية الانعكاس دائماً',
      'تزيد زاوية الانعكاس بنفس المقدار وتظل مساوية لزاوية السقوط',
      'تبقى زاوية الانعكاس ثابتة مهما تغيرت زاوية السقوط',
      'لا توجد علاقة بين الزاويتين'
    ],
    ans: 1,
    fb: '✅ قانون الانعكاس: زاوية السقوط = زاوية الانعكاس دائماً. كلما زادت زاوية السقوط زادت زاوية الانعكاس بنفس المقدار. وكلتا الزاويتين تُقاسان من العمود المقام على سطح المرآة.'
  },

  // ٣-٤ رؤية ما خلفك
  g5behindyou: {
    q: 'لماذا تستطيع رؤية الأجسام التي خلفك باستخدام المرآة؟',
    opts: [
      'لأن المرآة شفافة تماماً والضوء يمر خلالها',
      'لأن المرآة تعكس الضوء القادم من الخلف وتوجهه نحو عينيك',
      'لأن المرآة تُكبّر الأجسام البعيدة',
      'لأن الضوء ينحني تلقائياً حول الأجسام'
    ],
    ans: 1,
    fb: '✅ المرآة تعكس الضوء القادم من الأجسام التي خلفك وتوجهه نحو عينيك. لهذا تستخدم السيارات مرايا جانبية وخلفية، وتستخدم المتاجر مرايا الزوايا لرؤية كل أجزاء المحل.'
  },

  // ٤-٤ الأسطح العاكسة — مقارنة الأسطح
  g5reflection_0: {
    q: 'لماذا تعكس المرآة الضوء بشكل أوضح من الورق الخشن؟',
    opts: [
      'لأن المرآة أكثر صلابة من الورق',
      'لأن المرآة سطحها أملس ومنتظم فيعكس الضوء بزاوية ثابتة',
      'لأن المرآة أثقل من الورق',
      'لأن الورق يمتص الضوء بشكل أقل'
    ],
    ans: 1,
    fb: '✅ السطح الأملس المنتظم (كالمرآة) يعكس الضوء في اتجاه واحد منتظم (انعكاس منتظم) فيعطي صورة واضحة بنسبة ~٩٥٪. السطح الخشن يشتّت الضوء في اتجاهات عشوائية (انعكاس منتشر) فلا يعطي صورة واضحة.'
  },
  g5reflection: {
    q: 'لماذا تعكس المرآة الضوء بشكل أوضح من الورق الخشن؟',
    opts: [
      'لأن المرآة أكثر صلابة من الورق',
      'لأن المرآة سطحها أملس ومنتظم فيعكس الضوء بزاوية ثابتة',
      'لأن المرآة أثقل من الورق',
      'لأن الورق يمتص الضوء بشكل أقل'
    ],
    ans: 1,
    fb: '✅ السطح الأملس المنتظم (كالمرآة) يعكس الضوء في اتجاه واحد منتظم (انعكاس منتظم) فيعطي صورة واضحة بنسبة ~٩٥٪. السطح الخشن يشتّت الضوء في اتجاهات عشوائية (انعكاس منتشر) فلا يعطي صورة واضحة.'
  },

  // ٤-٤ الأسطح العاكسة — قياس الانعكاس
  g5reflection_1: {
    q: 'رتّب هذه الأسطح من الأعلى انعكاساً إلى الأقل: قماش، مرآة، ورق خشن، ورق لامع',
    opts: [
      'ورق لامع ← مرآة ← ورق خشن ← قماش',
      'مرآة ← ورق لامع ← قماش ← ورق خشن',
      'قماش ← مرآة ← ورق لامع ← ورق خشن',
      'مرآة ← قماش ← ورق لامع ← ورق خشن'
    ],
    ans: 0,
    fb: '✅ الترتيب من الأعلى انعكاساً: المرآة (٩٥٪) ← الورق اللامع (٧٠٪) ← القماش (٣٠٪) ← الورق الخشن (١٠٪). كلما كان السطح أكثر نعومة ولمعاناً، كان الانعكاس أوضح وأكبر.'
  },

  // لعبة هندسة الضوء
  g5lightdir: {
    q: 'إذا وجّهت الليزر عمودياً على المرآة (زاوية سقوط = 0°)، أين يذهب الشعاع المنعكس؟',
    opts: [
      'يتشتت في اتجاهات عشوائية',
      'يرتد مباشرةً نحو مصدره بنفس المسار',
      'يسير موازياً لسطح المرآة',
      'يختفي ويُمتص داخل المرآة'
    ],
    ans: 1,
    fb: '✅ عندما يسقط الضوء عمودياً (زاوية سقوط = 0°) يرتد مباشرةً نحو مصدره، لأن زاوية الانعكاس = زاوية السقوط = 0°. هذا هو أساس عمل أجهزة العكس الضوئي (Retroreflectors) في اللوحات الانعكاسية!'
  },

  // حجم الظل
  g5shadowsize: {
    q: 'ماذا نستنتج من قدرتنا على مشاهدة الضوء في الأنبوب المستقيم وعدم قدرتنا في الأنبوب المعوج؟',
    opts: [
      'الضوء ينتقل في خطوط مستقيمة فقط ولا يستطيع الانعطاف',
      'الأنبوب المعوج أطول من المستقيم فيخمد الضوء',
      'الضوء يحتاج هواءً نظيفاً لكي يمر',
      'الأنبوب المعوج يمتص الضوء'
    ],
    ans: 0,
    fb: '✅ الضوء ينتقل في خطوط مستقيمة — في الأنبوب المستقيم يمر الضوء مباشرةً من طرف لطرف فنراه، أما الأنبوب المعوج فيحجب المسار المستقيم فلا يصل الضوء إلى عيننا.'
  },

  g5shadowsize_1: {
    q: 'كيف يتشكّل الظل؟',
    opts: [
      'يتشكل الظل عندما يعكس الجسم الضوء نحو الحائط',
      'يتشكل الظل عندما يحجب الجسم المعتم الضوء',
      'يتشكل الظل فقط عند استخدام مصدر ضوء قوي جداً',
      'يتشكل الظل بسبب امتصاص السطح للضوء'
    ],
    ans: 1,
    fb: '✅ يتشكّل الظل عندما يحجب الجسم المعتم الضوء — فالضوء يسير في خطوط مستقيمة ولا يستطيع الالتفاف حول الجسم، فتنشأ منطقة مظلمة خلفه تُسمى الظل.'
  },

  // الأجسام الشفافة والمعتمة
  g5transparent: {
    q: 'ما الفرق بين الجسم الشفاف والجسم المعتم من حيث تعاملهما مع الضوء؟',
    opts: [
      'الشفاف يمتص الضوء كله، المعتم يعكسه كله',
      'الشفاف يسمح للضوء بالعبور خلاله، المعتم لا يسمح بذلك ويكوّن ظلاً',
      'لا فرق بينهما في التعامل مع الضوء',
      'الشفاف يكوّن ظلاً أكبر من المعتم'
    ],
    ans: 1,
    fb: '✅ الجسم الشفاف (كالزجاج) يسمح للضوء بالمرور خلاله فلا يكوّن ظلاً واضحاً. الجسم المعتم (كالخشب) يمنع الضوء من العبور فيكوّن ظلاً. والجسم شبه الشفاف (كالورق المشمّع) يمرر الضوء جزئياً.'
  },

  // عوامل حجم الظل
  g5shadowfactor: {
    q: 'ما العامل الذي يؤثر في حجم الظل الناتج عن جسم ما؟',
    opts: [
      'لون الجسم فقط',
      'وزن الجسم وكثافته',
      'المسافة بين الجسم ومصدر الضوء والشاشة',
      'درجة حرارة المصدر الضوئي'
    ],
    ans: 2,
    fb: '✅ حجم الظل يتأثر بالمسافة بين الجسم ومصدر الضوء وبينه وبين الشاشة. كلما اقترب الجسم من المصدر أو ابتعد عن الشاشة، كبر الظل. حجم الجسم نفسه يؤثر أيضاً، أما اللون والوزن فلا تأثير لهما.'
  },

  // الساعة الشمسية
  g5sundial: {
    q: 'لماذا يتغير اتجاه الظل وطوله على مدار اليوم في الساعة الشمسية؟',
    opts: [
      'لأن العصا تتحرك مع الوقت',
      'لأن الشمس تتغير موضعها في السماء خلال اليوم نتيجة دوران الأرض',
      'لأن الأرض تتوقف عن الدوران ليلاً',
      'لأن الظل يعتمد على درجة الحرارة'
    ],
    ans: 1,
    fb: '✅ تدور الأرض حول نفسها، مما يجعل الشمس تبدو وكأنها تتحرك في السماء من الشرق إلى الغرب. هذا يغيّر زاوية سقوط الضوء ويُغيّر اتجاه الظل وطوله. الساعة الشمسية تستخدم هذا المبدأ لقياس الوقت!'
  },

  // قوس قزح والألوان
  g5rainbow: {
    q: 'ما الذي يُثبته المنشور الزجاجي عن الضوء الأبيض؟',
    opts: [
      'الضوء الأبيض لون واحد نقي لا يمكن تقسيمه',
      'الضوء الأبيض خليط من الألوان السبعة (طيف الضوء المرئي)',
      'الضوء الأبيض أضعف من الألوان الأخرى',
      'الألوان توجد فقط في الضوء الملوّن وليس الأبيض'
    ],
    ans: 1,
    fb: '✅ الضوء الأبيض مؤلف من خليط الألوان السبعة: أحمر، برتقالي، أصفر، أخضر، أزرق، نيلي، بنفسجي. المنشور الزجاجي يُفرّق هذه الألوان لأن كلاً منها ينكسر بزاوية مختلفة. قوس القزح يحدث بنفس الطريقة عبر قطرات المطر!'
  },

  // الأرض والشمس
  g5earthsun: {
    q: 'ماذا نستنتج من هذا الاستقصاء؟',
    opts: [
      'يتغير حجم الشمس على مدار السنة',
      'تدور الأرض حول الشمس ',
      'تبتعد الأرض عن الشمس في الشتاء وتقترب في الصيف',
      'تتوقف الأرض عن الدوران في الفصول الباردة'
    ],
    ans: 1,
    fb: '✅ الأرض تدور حول الشمس في 365 يوماً (سنة) مع ميل محورها 23.5°. هذا الميل يجعل كمية الضوء والحرارة الواصلة لكل نصف كرة تتغير على مدار السنة، مما يسبب الفصول الأربعة.'
  },

  g5daynight2: {
    q: 'ما السبب الرئيسي لتعاقب الليل والنهار على الأرض؟',
    opts: [
      'تُطفئ الشمس ضوءها ليلاً وتُشعله نهاراً',
      'تدور الأرض حول محورها مرة كل 24 ساعة فيتعرض كل جزء للضوء والظلام بالتناوب',
      'يتحرك القمر أمام الشمس ليحجب ضوءها ليلاً',
      'تبتعد الأرض عن الشمس كل مساء ثم تقترب منها صباحاً'
    ],
    ans: 1,
    fb: '✅ الأرض تدور حول محورها دورةً كاملة كل 24 ساعة. النصف المواجه للشمس يكون نهاراً لأن أشعتها تصله، والنصف الآخر يكون ليلاً لأنه في الظل. هذا الدوران هو ما يُسبّب الشروق والغروب وتعاقب الليل والنهار.'
  },

  g5sunseeming: {
    q: 'ماذا تستنتج من هذا الاستقصاء؟',
    opts: [
      'الشمس تتحرك وتلاحق الطالب في السماء',
      'الشمس ثابتة لكن موقعها يبدو مختلفاً عندما يتغير موقع المراقب',
      'الشمس تدور حول الطالب مرة كل يوم',
      'عين الطالب هي التي تتحرك وليس الشمس'
    ],
    ans: 1,
    fb: '✅ الشمس ثابتة في مكانها (بالنسبة لمراقب على الأرض خلال وقت قصير). عندما تتحرك أنت، تتغير زاوية رؤيتك للشمس فتبدو في موضع مختلف. هذا يُسمى الحركة الظاهرية — وهو نفس المبدأ الذي يُفسّر لماذا تبدو الشمس وكأنها تتحرك عبر السماء خلال اليوم بسبب دوران الأرض.'
  },

  // الليل والنهار
  g5rotation: {
    q: 'ما سبب تعاقب الليل والنهار على الأرض؟',
    opts: [
      'تُطفئ الشمس ضوءها ليلاً وتُشعله نهاراً',
      'يدور القمر حول الأرض فيحجب الشمس ليلاً',
      'تدور الأرض حول نفسها مرة كل 24 ساعة، فنصفها في الضوء والآخر في الظلام',
      'تتحرك الأرض بعيداً عن الشمس كل مساء'
    ],
    ans: 2,
    fb: '✅ تدور الأرض حول نفسها (محورها) مرة واحدة كل 24 ساعة. النصف المقابل للشمس يكون نهاراً، والنصف الآخر يكون ليلاً. ودوران الأرض هو ما يجعل الشمس تبدو طالعة من الشرق وغاربة في الغرب.'
  },

  // الشروق والغروب
  g5sunrise: {
    q: 'لماذا يكون لون السماء أزرق في النهار وبرتقالياً عند الشروق والغروب؟',
    opts: [
      'لأن الشمس تنتج ألواناً مختلفة في أوقات اليوم المختلفة',
      'لأن أشعة الشمس المنخفضة تقطع مسافة أطول في الغلاف الجوي، فتتشتت الأشعة الزرقاء وتصلنا الحمراء والبرتقالية',
      'لأن الغلاف الجوي يتغير لونه الحقيقي عند الشروق والغروب',
      'لأن انعكاس ضوء القمر يُغير ألوان السماء عند الشروق والغروب'
    ],
    ans: 1,
    fb: '✅ عند الشروق والغروب تكون الشمس منخفضة فتمر أشعتها مسافةً أطول داخل الغلاف الجوي. الضوء الأزرق (موجاته قصيرة) يتشتت بعيداً، بينما يصل الأحمر والبرتقالي (موجاتهما أطول) إلى عيوننا. في منتصف النهار تكون الأشعة عمودية والمسافة أقصر، فيصل الأزرق بكثرة ونرى السماء زرقاء.'
  },

  // النجوم
  g5stars: {
    q: 'لماذا نرى النجوم فقط في الليل رغم أنها موجودة دائماً؟',
    opts: [
      'لأن النجوم تنام نهاراً ولا تُصدر ضوءاً',
      'لأن ضوء الشمس القوي نهاراً يجعل السماء مضيئة وتختفي النجوم الخافتة فيها',
      'لأن الغلاف الجوي يحجب ضوء النجوم نهاراً',
      'لأن النجوم تتحرك بعيداً عن الأرض نهاراً'
    ],
    ans: 1,
    fb: '✅ النجوم موجودة دائماً وتُصدر ضوءاً باستمرار، لكن ضوء الشمس القوي نهاراً يُضيء السماء ويجعل ضوء النجوم الخافت غير مرئي. في الليل، تختفي الشمس فتظهر النجوم في السماء المظلمة.'
  },

  // شدة الضوء
  g5lightintensity: {
    q: 'ما العلاقة بين المسافة عن مصدر الضوء وشدة الإضاءة عليك؟',
    opts: [
      'كلما ابتعدت زادت شدة الضوء',
      'كلما ابتعدت قلّت شدة الضوء لأن الأشعة تتشتت على مساحة أكبر',
      'شدة الضوء لا تتغير بالمسافة',
      'شدة الضوء تتضاعف كلما تضاعفت المسافة'
    ],
    ans: 1,
    fb: '✅ كلما ابتعدت عن مصدر الضوء قلّت شدة الإضاءة. الضوء ينتشر على مساحة أكبر كلما ابتعد، فيصل كمية أقل لكل نقطة. هذا يُفسّر لماذا يبدو الجسم أكثر إضاءةً حين يقترب من المصبح.'
  }

});


window.addEventListener('DOMContentLoaded', function() {
  _checkSubscription();
  // إظهار الفوتر في الصفحة الرئيسية عند التحميل
  setTimeout(_updateFooterVisibility, 100);
});


// ══════════════════════════════════════════════════════════
// دوال الجزء الثاني — التكاثر (الوحدة 8)
// ══════════════════════════════════════════════════════════

function repro_gametes2(){
  cancelAnimationFrame(animFrame);

  // Init state
  if(!simState.repro_gametes2||!simState.repro_gametes2.initialized){
    const CARDS=[
      {id:0,trait:'حجمها كبير جداً',          type:'بويضة'},
      {id:1,trait:'لها ذيل تسبح به',           type:'حيوان منوي'},
      {id:2,trait:'تنتج في المبيض',            type:'بويضة'},
      {id:3,trait:'تنتج في الخصية',            type:'حيوان منوي'},
      {id:4,trait:'تحمل كروموسوم X أنثوي',    type:'بويضة'},
      {id:5,trait:'تنتقل في قناة البيض',       type:'بويضة'},
      {id:6,trait:'تسبح نحو البويضة',          type:'حيوان منوي'},
      {id:7,trait:'حجمها صغير جداً',           type:'حيوان منوي'},
      {id:8,trait:'تحمل X أو Y (ذكري)',        type:'حيوان منوي'},
      {id:9,trait:'خلية جنسية أنثوية',         type:'بويضة'},
    ];
    simState.repro_gametes2={
      t:0,drag:null,dragX:0,dragY:0,
      correct:new Set(),wrong:new Set(),
      flash:null,flashT:0,initialized:true,
      cards:CARDS,
      shuffled:[...CARDS].sort(()=>Math.random()-0.5)
    };
  }
  const S=simState.repro_gametes2;
  const CARDS=S.cards;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🎮 مطابقة الكروموسومات</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.78);line-height:1.9;margin:6px 0">
        اسحب كل بطاقة وأفلتها في العمود الصحيح<br>
        🟢 صحيح = تثبت &nbsp;|&nbsp; 🔴 خطأ = ترجع
      </div>
      <button class="ctrl-btn reset" onclick="simState.repro_gametes2=null;repro_gametes2()">↺ إعادة اللعبة</button>
    </div>
    <div class="info-box" style="font-size:13px;line-height:2;margin-top:8px">
      🥚 <strong>البويضة:</strong> كبيرة، أنثوية، في المبيض<br>
      🏊 <strong>الحيوان المنوي:</strong> صغير، ذيل، في الخصية<br>
      كلاهما يحمل <strong>23</strong> كروموسوم
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا 23 + 23 = 46؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">كل مشيج يحمل نصف العدد — عند الإخصاب يتحد النصفان ليعطيا 46 كروموسوماً.</div>
    </div>`);

  // Layout helper
  function L(w,h){
    const pad=Math.round(w*0.018);
    const zW=Math.round(w*0.265);
    const zH=Math.round(h*0.80);
    const zY=Math.round(h*0.13);
    const z1x=pad;
    const z2x=w-pad-zW;
    const midX=z1x+zW+pad;
    const midW=z2x-midX-pad;
    const cW=Math.round(midW*0.92);
    const cH=Math.min(Math.round(h*0.096),52);
    const cX=midX+Math.round((midW-cW)/2);
    return {zW,zH,zY,z1x,z2x,midX,midW,cW,cH,cX};
  }

  // Pointer helpers
  function gp(e){
    const cv=document.getElementById('simCanvas');
    if(!cv)return{x:0,y:0};
    const r=cv.getBoundingClientRect(),sc=cv.width/r.width;
    const s=e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e;
    return{x:(s.clientX-r.left)*sc,y:(s.clientY-r.top)*sc};
  }

  function cardAt(px,py,w,h){
    const l=L(w,h);
    let idx=0;
    for(const card of S.shuffled){
      if(S.correct.has(card.id)){continue;}
      const bx=l.cX,by=l.zY+8+idx*(l.cH+7);
      idx++;
      if(px>=bx&&px<=bx+l.cW&&py>=by&&py<=by+l.cH)return card;
    }
    return null;
  }

  function doDown(e){
    if(currentSim!=='repro_gametes')return;
    const cv=document.getElementById('simCanvas');
    if(!cv)return;
    const p=gp(e),w=cv.width,h=cv.height;
    const card=cardAt(p.x,p.y,w,h);
    if(card){S.drag=card.id;S.dragX=p.x;S.dragY=p.y;}
  }
  function doMove(e){
    if(currentSim!=='repro_gametes'||S.drag===null)return;
    const p=gp(e);S.dragX=p.x;S.dragY=p.y;
  }
  function doUp(e){
    if(currentSim!=='repro_gametes'||S.drag===null)return;
    const cv=document.getElementById('simCanvas');
    if(!cv){S.drag=null;return;}
    const p=gp(e),w=cv.width,h=cv.height;
    const l=L(w,h);
    const card=CARDS.find(c=>c.id===S.drag);
    if(card){
      const inZ1=p.x>=l.z1x&&p.x<=l.z1x+l.zW&&p.y>=l.zY&&p.y<=l.zY+l.zH;
      const inZ2=p.x>=l.z2x&&p.x<=l.z2x+l.zW&&p.y>=l.zY&&p.y<=l.zY+l.zH;
      if(inZ1||inZ2){
        const dropped=inZ1?'بويضة':'حيوان منوي';
        if(dropped===card.type){
          S.correct.add(card.id);S.wrong.delete(card.id);S.flash='correct';S.flashT=0;
          try{U9Sound.ping(660,.1,.12);}catch(_){}
        } else {
          S.wrong.add(card.id);S.flash='wrong';S.flashT=0;
          try{U9Sound.ping(180,.15,.15);}catch(_){}
          setTimeout(()=>{S.wrong.delete(card.id);},1300);
        }
      }
    }
    S.drag=null;
  }

  // Attach events directly to canvas (no clone)
  const _cv=document.getElementById('simCanvas');
  if(_cv){
    if(!_cv._rg2_bound){
      _cv._rg2_bound=true;
      _cv.addEventListener('mousedown', doDown);
      _cv.addEventListener('mousemove', doMove);
      _cv.addEventListener('mouseup',   doUp);
      _cv.addEventListener('touchstart',e=>{e.preventDefault();doDown(e);},{passive:false});
      _cv.addEventListener('touchmove', e=>{e.preventDefault();doMove(e);},{passive:false});
      _cv.addEventListener('touchend',  e=>{e.preventDefault();doUp(e);},  {passive:false});
    } else {
      // Rebind with fresh closures by toggling flag
      _cv._rg2_bound=false;
      _cv.addEventListener('mousedown', doDown);
      _cv.addEventListener('mousemove', doMove);
      _cv.addEventListener('mouseup',   doUp);
      _cv.addEventListener('touchstart',e=>{e.preventDefault();doDown(e);},{passive:false});
      _cv.addEventListener('touchmove', e=>{e.preventDefault();doMove(e);},{passive:false});
      _cv.addEventListener('touchend',  e=>{e.preventDefault();doUp(e);},  {passive:false});
      _cv._rg2_bound=true;
    }
  }

  function draw(){
    if(currentSim!=='repro_gametes')return;
    S.t+=0.04;
    const cv=document.getElementById('simCanvas');
    if(!cv)return;
    const ctx=cv.getContext('2d');
    const w=cv.width,h=cv.height;
    ctx.clearRect(0,0,w,h);

    // Background
    const bg=ctx.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#0A1A30');bg.addColorStop(1,'#142850');
    ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);

    const l=L(w,h);

    // Title
    ctx.fillStyle='rgba(180,220,255,0.9)';
    ctx.font=`bold ${Math.min(15,w*0.031)}px Tajawal`;
    ctx.textAlign='center';ctx.textBaseline='top';
    ctx.fillText('🎮 مطابقة خصائص الأمشاج — اسحب وأفلت',w/2,h*0.014);

    // Score
    const done=S.correct.size;
    ctx.font=`bold ${Math.min(14,w*0.030)}px Tajawal`;
    ctx.fillStyle='rgba(255,220,100,0.95)';
    ctx.fillText(`✅ ${done} / ${CARDS.length}`,w/2,h*0.055);

    // Win screen
    if(done===CARDS.length){
      const p=0.85+Math.sin(S.t*4)*0.15;
      ctx.save();ctx.globalAlpha=p;
      ctx.font=`bold ${Math.min(22,w*0.047)}px Tajawal`;
      ctx.fillStyle='#FFD700';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText('🎉 ممتاز! اكتملت المطابقة!',w/2,h*0.5);
      ctx.restore();
      animFrame=requestAnimationFrame(draw);return;
    }

    // Drop zones
    const ZONES=[
      {x:l.z1x,label:'🥚 البويضة',       col:'rgba(255,160,50,', type:'بويضة'},
      {x:l.z2x,label:'🏊 الحيوان المنوي', col:'rgba(26,143,168,',  type:'حيوان منوي'},
    ];
    ZONES.forEach(z=>{
      ctx.fillStyle=z.col+'0.12)';ctx.strokeStyle=z.col+'0.55)';ctx.lineWidth=2.5;
      ctx.beginPath();ctx.roundRect(z.x,l.zY,l.zW,l.zH,12);ctx.fill();ctx.stroke();
      ctx.font=`bold ${Math.min(13,w*0.026)}px Tajawal`;
      ctx.fillStyle=z.col+'0.95)';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(z.label,z.x+l.zW/2,l.zY-16);
    });

    // Placed cards in zones
    const eggDone=CARDS.filter(c=>S.correct.has(c.id)&&c.type==='بويضة');
    const sprDone=CARDS.filter(c=>S.correct.has(c.id)&&c.type==='حيوان منوي');
    [eggDone,sprDone].forEach((arr,zi)=>{
      const zx=ZONES[zi].x;
      const cW2=l.zW*0.88,cH2=Math.min(Math.round(h*0.076),38);
      arr.forEach((card,ci)=>{
        const bx=zx+(l.zW-cW2)/2,by=l.zY+8+ci*(cH2+5);
        ctx.fillStyle=zi===0?'rgba(255,160,50,0.22)':'rgba(26,143,168,0.22)';
        ctx.strokeStyle=zi===0?'rgba(255,160,50,0.5)':'rgba(26,143,168,0.5)';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.roundRect(bx,by,cW2,cH2,8);ctx.fill();ctx.stroke();
        ctx.font=`${Math.min(11,w*0.023)}px Tajawal`;ctx.fillStyle='rgba(255,255,255,0.88)';
        ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillText('✅ '+card.trait,bx+cW2/2,by+cH2/2);
      });
    });

    // Unplaced centre cards
    let ci=0;
    S.shuffled.forEach(card=>{
      if(S.correct.has(card.id))return;
      const isDrag=(S.drag===card.id);
      const isWrong=S.wrong.has(card.id);
      const bx=isDrag?S.dragX-l.cW/2:l.cX;
      const by=isDrag?S.dragY-l.cH/2:l.zY+8+ci*(l.cH+7);
      if(!isDrag)ci++;
      if(isDrag){ctx.save();ctx.shadowColor='rgba(120,210,255,0.7)';ctx.shadowBlur=20;}
      ctx.fillStyle=isWrong?'rgba(231,76,60,0.32)':'rgba(255,255,255,0.10)';
      ctx.strokeStyle=isWrong?'rgba(231,76,60,0.85)':isDrag?'rgba(120,210,255,0.8)':'rgba(255,255,255,0.25)';
      ctx.lineWidth=isDrag?2.8:1.8;
      ctx.beginPath();ctx.roundRect(bx,by,l.cW,l.cH,10);ctx.fill();ctx.stroke();
      if(isDrag)ctx.restore();
      ctx.font=`bold ${Math.min(15,w*0.034)}px Tajawal`;ctx.fillStyle='white';
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(card.trait,bx+l.cW/2,by+l.cH/2);
    });

    // Flash
    if(S.flash){
      S.flashT++;
      ctx.font=`bold ${Math.min(19,w*0.040)}px Tajawal`;
      ctx.fillStyle=S.flash==='correct'?'#4AE88A':'#FF6060';
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(S.flash==='correct'?'✅ صحيح!':'❌ حاولي مجدداً',w/2,h*0.91);
      if(S.flashT>45){S.flash=null;S.flashT=0;}
    }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function repro_fertilisation2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.repro_fertilisation2) simState.repro_fertilisation2={t:0};
  const S=simState.repro_fertilisation2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📊 رحلة الزيجوت</div>
      <div class="info-box" style="font-size:12px;line-height:2.1;margin-top:6px">
        ١ 🥚 إخصاب → زيجوت (46 كروموسوم)<br>
        ２ ⚪⚪ يومان → خليتان<br>
        ３ ⚪×4 ثلاثة أيام → 4 خلايا<br>
        ４ 🔵 أربعة أيام → مورولا<br>
        ٥ 🏠 6-10 أيام → تعشيش في الرحم
      </div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ بعد كم يوم يتعشّش الجنين في الرحم؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">حوالي 6-10 أيام بعد الإخصاب — الكرة الخلوية تنتقل عبر قناة البيض وتنغرس في جدار الرحم.</div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ما الفرق بين التوأم المتطابق وغير المتطابق؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">المتطابق: زيجوت واحدة تنقسم → متطابقان وراثياً. غير المتطابق: بويضتان + حيوانان منويان → مختلفان وراثياً.</div>
    </div>`);

  const stages=[
    {icon:'🥚',label:'إخصاب',x:0.1,color:'#E8962A'},
    {icon:'⚪⚪',label:'يومان',x:0.28,color:'#27AE60'},
    {icon:'⚪×4',label:'٣ أيام',x:0.46,color:'#2980B9'},
    {icon:'🔵',label:'مورولا',x:0.64,color:'#8E44AD'},
    {icon:'🏠',label:'تعشيش',x:0.82,color:'#C0392B'},
  ];

  function draw(){
    if(currentSim!=='repro_fertilisation') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.025;
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#0D1A2E'); bg.addColorStop(1,'#1A2E50');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    c.fillStyle='#FFD080'; c.font=`bold ${Math.min(16,w*0.036)}px Tajawal`;
    c.textAlign='center'; c.fillText('رحلة الزيجوت من الإخصاب للتعشيش',w/2,h*0.07);

    const lineY=h*0.5;
    c.strokeStyle='rgba(255,200,100,0.35)'; c.lineWidth=3;
    c.beginPath(); c.moveTo(w*0.08,lineY); c.lineTo(w*0.9,lineY); c.stroke();

    stages.forEach((st,i)=>{
      const sx=st.x*w;
      const pulse=1+Math.sin(S.t*2+i*1.2)*0.08;
      c.fillStyle=st.color; c.beginPath(); c.arc(sx,lineY,10*pulse,0,Math.PI*2); c.fill();
      c.font=`${Math.min(22,h*0.07)}px Arial`; c.textAlign='center';
      c.fillText(st.icon,sx,lineY-h*0.16);
      c.fillStyle=st.color; c.font=`bold ${Math.min(11,w*0.025)}px Tajawal`;
      c.fillText(st.label,sx,lineY+h*0.1);
      if(i<stages.length-1){
        c.strokeStyle='rgba(255,200,100,0.5)'; c.lineWidth=1.5;
        const nx=stages[i+1].x*w;
        c.beginPath(); c.moveTo(sx+14,lineY); c.lineTo(nx-14,lineY); c.stroke();
      }
    });

    c.fillStyle='rgba(255,255,255,0.55)'; c.font=`${Math.min(12,w*0.027)}px Tajawal`;
    c.textAlign='center'; c.fillText('قناة البيض → الرحم في 6-10 أيام 🧬',w/2,h*0.92);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function repro_development2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.repro_development2) simState.repro_development2={t:0,trimester:0};
  const S=simState.repro_development2;

  const trimData=[
    {title:'الثلاثية الأولى (أسابيع 1-12)',color:'#8E44AD',icon:'🔮',size:0.07,
     points:['تتشكّل الأعضاء الرئيسية','القلب يبدأ النبض (أ5-6)','الجنين ~6 سم — 14 غ','الغثيان شائع']},
    {title:'الثلاثية الثانية (أسابيع 13-26)',color:'#2980B9',icon:'👶',size:0.22,
     points:['الجنين يتحرك ويركل','تتشكّل البصمات والشعر','الجنين ~35 سم — 900 غ','يمكن تحديد الجنس']},
    {title:'الثلاثية الثالثة (أسابيع 27-40)',color:'#27AE60',icon:'🍼',size:0.4,
     points:['نمو سريع في الوزن','الرئتان تنضجان','الجنين ~50 سم — 3-4 كغ','استعداد للولادة']},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📅 ثلاثيات الحمل</div>
      ${trimData.map((td,i)=>`<button class="ctrl-btn" style="width:100%;margin:2px 0;${S.trimester===i?'background:'+td.color+';color:white':''}" onclick="simState.repro_development2.trimester=${i}">${td.icon} ${td.title.substring(0,18)}</button>`).join('')}
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ما دور المشيمة؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">المشيمة تنقل O₂ والغذاء من دم الأم للجنين، وتُخرج CO₂ والفضلات — دون أن يختلط الدمان مباشرة.</div>
    </div>`);

  function draw(){
    if(currentSim!=='repro_development') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.03;
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#1A0A2E'); bg.addColorStop(1,'#2E1050');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    const td=trimData[S.trimester];
    c.fillStyle=td.color; c.font=`bold ${Math.min(14,w*0.032)}px Tajawal`;
    c.textAlign='center'; c.fillText(td.title,w/2,h*0.08);

    const fSize=td.size*Math.min(w*0.5,h*0.55);
    const cx2=w*0.3, cy2=h*0.48;
    const pulse=1+Math.sin(S.t*8)*0.03;
    const gr=c.createRadialGradient(cx2-fSize*0.2,cy2-fSize*0.2,fSize*0.05,cx2,cy2,fSize*pulse);
    gr.addColorStop(0,'rgba(255,200,150,0.95)'); gr.addColorStop(0.7,'rgba(230,160,120,0.8)'); gr.addColorStop(1,'rgba(200,120,100,0.3)');
    c.fillStyle=gr; c.beginPath(); c.arc(cx2,cy2,fSize*pulse,0,Math.PI*2); c.fill();
    if(S.trimester>0){
      c.fillStyle='rgba(255,200,150,0.8)'; c.beginPath();
      c.arc(cx2+fSize*0.6,cy2-fSize*0.35,fSize*0.38,0,Math.PI*2); c.fill();
    }
    c.font=`${Math.min(fSize*0.6,32)}px Arial`; c.textAlign='center';
    c.fillText(td.icon,cx2,cy2+fSize*0.22);

    const bx2=w*0.55, startY=h*0.24;
    td.points.forEach((pt,i)=>{
      const py2=startY+i*(h*0.155);
      c.fillStyle='rgba(255,255,255,0.07)'; c.beginPath(); c.roundRect(bx2,py2-13,w*0.4,28,5); c.fill();
      c.fillStyle=td.color; c.font=`bold ${Math.min(12,w*0.025)}px Arial`; c.textAlign='left';
      c.fillText('✓',bx2+6,py2+4);
      c.fillStyle='rgba(255,255,255,0.88)'; c.font=`${Math.min(11,w*0.025)}px Tajawal`;
      c.fillText(pt,bx2+24,py2+4);
    });
    c.textAlign='center';
    c.fillStyle='rgba(255,255,255,0.1)'; c.beginPath(); c.roundRect(w*0.1,h*0.88,w*0.8,10,5); c.fill();
    c.fillStyle=td.color; c.beginPath(); c.roundRect(w*0.1,h*0.88,w*0.8*[0.3,0.65,1][S.trimester],10,5); c.fill();
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function repro_growth2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.repro_growth2) simState.repro_growth2={t:0};
  const S=simState.repro_growth2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📊 مراحل النمو الإنساني</div>
      <div class="info-box" style="font-size:12px;line-height:2;margin-top:6px">
        🍼 رضاعة (0-2): نمو سريع جداً<br>
        🎒 طفولة (3-12): تعلّم وتطور<br>
        🧑 مراهقة (10-18): بلوغ وتغيرات<br>
        👨 بلوغ (18+): نمو مكتمل
      </div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ما هرمون البلوغ في الذكور والإناث؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الذكور: التستوستيرون (من الخصيتين). الإناث: الإستروجين والبروجستيرون (من المبيضين). كلاهما يتحكم في التغيرات الجسدية عند البلوغ.</div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ما التغيرات المشتركة بين الجنسين عند البلوغ؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">نمو الشعر في الإبط والعانة، ازدياد التعرق، حبوب البشرة، نمو سريع في الطول، تطور الجهاز التناسلي، تغيرات عاطفية.</div>
    </div>`);

  const stages=[
    {name:'رضاعة',age:'0-2',icon:'🍼',color:'#F39C12',desc:'3× الوزن الأولي'},
    {name:'طفولة مبكرة',age:'3-6',icon:'🎒',color:'#27AE60',desc:'لغة وحركة'},
    {name:'طفولة متأخرة',age:'7-12',icon:'📚',color:'#2980B9',desc:'تعلّم اجتماعي'},
    {name:'مراهقة',age:'10-18',icon:'🧑',color:'#8E44AD',desc:'بلوغ وتغيرات'},
    {name:'بلوغ',age:'18+',icon:'👨‍🎓',color:'#1A8FA8',desc:'نمو مكتمل'},
  ];

  function draw(){
    if(currentSim!=='repro_growth') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.02;
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#0E2218'); bg.addColorStop(1,'#1A3D2A');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    c.fillStyle='#80FFB0'; c.font=`bold ${Math.min(16,w*0.036)}px Tajawal`;
    c.textAlign='center'; c.fillText('مراحل النمو الإنساني',w/2,h*0.07);

    const barW=w*0.8/stages.length;
    stages.forEach((st,i)=>{
      const bx2=w*0.1+i*barW;
      const barH=h*(0.15+i*0.08);
      const by2=h*0.82-barH;
      const active=Math.floor(S.t*0.5)%stages.length===i;
      const gr=c.createLinearGradient(bx2,by2,bx2,h*0.82);
      gr.addColorStop(0,st.color+'EE'); gr.addColorStop(1,st.color+'66');
      c.fillStyle=gr; c.beginPath(); c.roundRect(bx2+4,by2,barW-8,barH,6); c.fill();
      if(active){ c.strokeStyle='white'; c.lineWidth=2; c.stroke(); }
      c.font=`${Math.min(18,barW*0.5)}px Arial`; c.textAlign='center';
      c.fillText(st.icon,bx2+barW/2,by2-8);
      c.fillStyle=st.color; c.font=`bold ${Math.min(10,w*0.022)}px Tajawal`;
      c.fillText(st.name,bx2+barW/2,h*0.87);
      c.fillStyle='rgba(255,255,255,0.55)'; c.font=`${Math.min(9,w*0.02)}px Tajawal`;
      c.fillText(st.age+' سنة',bx2+barW/2,h*0.91);
    });
    const cur=stages[Math.floor(S.t*0.5)%stages.length];
    c.fillStyle='rgba(0,0,0,0.35)'; c.beginPath(); c.roundRect(w*0.1,h*0.93,w*0.8,h*0.055,6); c.fill();
    c.fillStyle=cur.color; c.font=`${Math.min(12,w*0.027)}px Tajawal`;
    c.fillText(cur.desc,w/2,h*0.96);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function repro_lifestyle2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.repro_lifestyle2) simState.repro_lifestyle2={t:0,sel:0};
  const S=simState.repro_lifestyle2;

  const topics=[
    {name:'التغذية',icon:'🥗',color:'#27AE60',
     good:['بروتين: بيض ولحم وبقوليات','كالسيوم: ألبان وخضار ورقية','حمض الفوليك قبل الحمل'],
     bad:['الأغذية المصنّعة الزائدة','السكر المكرّر الزائد','الحمية القاسية']},
    {name:'النشاط البدني',icon:'🏃',color:'#2980B9',
     good:['30 دقيقة يومياً على الأقل','مشي وسباحة ودراجة','تقوّي العظام والقلب'],
     bad:['جلوس مطوّل >8 ساعات','الإفراط في التمرين','الخمول التام']},
    {name:'الصحة النفسية',icon:'🧠',color:'#8E44AD',
     good:['نوم 8-9 ساعات للمراهقين','التحدث مع المقربين','هوايات وأنشطة ممتعة'],
     bad:['الإجهاد المزمن','العزلة الاجتماعية','التنمر والمشاكل المكبوتة']},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">نمط الحياة الصحي</div>
      ${topics.map((t,i)=>`<button class="ctrl-btn" style="width:100%;margin:2px 0;${S.sel===i?'background:'+t.color+';color:white':''}" onclick="simState.repro_lifestyle2.sel=${i}">${t.icon} ${t.name}</button>`).join('')}
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا يحتاج المراهقون نوماً أكثر؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الدماغ والجسم ينموان بسرعة — هرمون النمو يُفرز أثناء النوم العميق. قلة النوم تؤثر على الذاكرة والتركيز.</div>
    </div>`);

  function draw(){
    if(currentSim!=='repro_lifestyle') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.025;
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#0A1820'); bg.addColorStop(1,'#142030');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    const tp=topics[S.sel];
    c.fillStyle=tp.color; c.font=`bold ${Math.min(16,w*0.036)}px Tajawal`;
    c.textAlign='center'; c.fillText(`${tp.icon} ${tp.name} — مقارنة`,w/2,h*0.08);

    const colW=w*0.42;
    c.fillStyle='rgba(39,174,96,0.12)'; c.beginPath(); c.roundRect(w*0.04,h*0.13,colW,h*0.72,10); c.fill();
    c.strokeStyle='#27AE6055'; c.lineWidth=1.5; c.stroke();
    c.fillStyle='#27AE60'; c.font=`bold ${Math.min(13,w*0.03)}px Tajawal`;
    c.fillText('✅ مفيد',w*0.04+colW/2,h*0.19);
    tp.good.forEach((pt,i)=>{
      c.fillStyle='rgba(255,255,255,0.82)'; c.font=`${Math.min(11,w*0.025)}px Tajawal`;
      c.fillText(pt,w*0.04+colW/2,h*0.28+i*h*0.15);
    });

    c.fillStyle='rgba(192,57,43,0.12)'; c.beginPath(); c.roundRect(w*0.54,h*0.13,colW,h*0.72,10); c.fill();
    c.strokeStyle='#C0392B55'; c.lineWidth=1.5; c.stroke();
    c.fillStyle='#C0392B'; c.font=`bold ${Math.min(13,w*0.03)}px Tajawal`;
    c.fillText('❌ ضار',w*0.54+colW/2,h*0.19);
    tp.bad.forEach((pt,i)=>{
      c.fillStyle='rgba(255,200,200,0.82)'; c.font=`${Math.min(11,w*0.025)}px Tajawal`;
      c.fillText(pt,w*0.54+colW/2,h*0.28+i*h*0.15);
    });

    c.fillStyle='rgba(255,255,255,0.45)'; c.font=`bold ${Math.min(15,h*0.05)}px Arial`;
    c.fillText('VS',w/2,h*0.52);
    c.fillStyle='rgba(255,255,255,0.45)'; c.font=`${Math.min(11,w*0.025)}px Tajawal`;
    c.fillText('اختر موضوعاً للمقارنة',w/2,h*0.92);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// دوال الجزء الثاني — الأملاح (الوحدة 8)
// ══════════════════════════════════════════════════════════

function salts_what2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.salts_what2) simState.salts_what2={t:0};
  const S=simState.salts_what2;

  const examples=[
    {acid:'HCl',base:'NaOH',salt:'NaCl',name:'كلوريد الصوديوم',color:'#7F8C8D'},
    {acid:'H₂SO₄',base:'CuO',salt:'CuSO₄',name:'كبريتات النحاس',color:'#2980B9'},
    {acid:'HNO₃',base:'KOH',salt:'KNO₃',name:'نترات البوتاسيوم',color:'#27AE60'},
    {acid:'HCl',base:'Mg(OH)₂',salt:'MgCl₂',name:'كلوريد المغنيسيوم',color:'#E67E22'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧂 تسمية الأملاح ومعادلاتها</div>
      <div class="info-box" style="font-size:12px;line-height:2;margin-top:6px">
        القاعدة: اسم الفلز + اسم الأنيون<br>
        HCl + NaOH → <strong>كلوريد الصوديوم</strong><br>
        H₂SO₄ + CuO → <strong>كبريتات النحاس</strong>
      </div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ما ناتج: H₂SO₄ + ZnO ؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">ZnSO₄ + H₂O — كبريتات الخارصين + ماء. أكسيد الخارصين قاعدة تتفاعل مع الحمض لتنتج ملح + ماء.</div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ما أيونات NaCl في الماء؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">Na⁺ (موجب) + Cl⁻ (سالب) — ينفصلان في الماء مكوّنَين محلولاً موصّلاً للكهرباء.</div>
    </div>`);

  function draw(){
    if(currentSim!=='salts_what') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.025;
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F0F8FF'); bg.addColorStop(1,'#E0EEFF');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    c.fillStyle='#1A5276'; c.font=`bold ${Math.min(16,w*0.036)}px Tajawal`;
    c.textAlign='center'; c.fillText('حمض + قاعدة → ملح + ماء',w/2,h*0.07);

    const idx=Math.floor(S.t*0.4)%examples.length;
    const ex=examples[idx];
    const midY=h*0.35;
    const parts=[
      {text:ex.acid,color:'#C0392B',label:'حمض'},
      {text:'+',color:'#333',label:''},
      {text:ex.base,color:'#27AE60',label:'قاعدة'},
      {text:'→',color:'#555',label:''},
      {text:ex.salt,color:ex.color,label:'ملح ✅'},
      {text:'+',color:'#333',label:''},
      {text:'H₂O',color:'#3498DB',label:'ماء'},
    ];
    const partW=w/(parts.length+1);
    parts.forEach((p,i)=>{
      const px=(i+0.8)*partW;
      c.fillStyle=p.color; c.font=`bold ${Math.min(14,w*0.03)}px monospace`;
      c.fillText(p.text,px,midY);
      if(p.label){ c.fillStyle='rgba(0,0,0,0.45)'; c.font=`${Math.min(10,w*0.022)}px Tajawal`; c.fillText(p.label,px,midY+18); }
    });
    c.fillStyle=ex.color; c.font=`bold ${Math.min(18,w*0.04)}px Tajawal`;
    c.fillText(ex.name,w/2,h*0.55);

    // جدول
    const rows=[['الحمض','يعطي H⁺',ex.acid],['القاعدة','يعطي OH⁻',ex.base],['الملح','أيون+ + أيون-',ex.salt]];
    const tX=w*0.08, tY=h*0.64, tW=w*0.84, cellH=h*0.075, colW2=tW/3;
    ['المركّب','طبيعته','مثال'].forEach((col,i)=>{
      c.fillStyle='#1A5276'; c.fillRect(tX+i*colW2,tY,colW2-2,cellH);
      c.fillStyle='white'; c.font=`bold ${Math.min(11,w*0.024)}px Tajawal`; c.textAlign='center';
      c.fillText(col,tX+i*colW2+colW2/2,tY+cellH*0.62);
    });
    rows.forEach((row,ri)=>{
      row.forEach((cell,ci)=>{
        c.fillStyle=ri%2===0?'rgba(0,0,0,0.06)':'rgba(0,0,0,0.02)';
        c.fillRect(tX+ci*colW2,tY+cellH*(ri+1),colW2-2,cellH);
        c.fillStyle='#333'; c.font=`${Math.min(11,w*0.023)}px Tajawal`;
        c.fillText(cell,tX+ci*colW2+colW2/2,tY+cellH*(ri+1)+cellH*0.62);
      });
    });
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function salts_metal2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.salts_metal2) simState.salts_metal2={t:0};
  const S=simState.salts_metal2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⚡ سلسلة النشاط الكيميائي</div>
      <div class="info-box" style="font-size:12px;line-height:2;margin-top:6px">
        أكثر نشاطاً → يتفاعل مع ماء + أحماض<br>
        K > Na > Mg > Al > Zn > Fe > Cu > Ag > Au<br>
        الفلزات فوق H تتفاعل مع الأحماض
      </div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا لا يتفاعل الذهب مع الأحماض؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الذهب في أسفل سلسلة النشاط — يحتاج الماء الملكي (HCl+HNO₃) فقط. لهذا يُستخدم للمجوهرات — لا يصدأ ولا يتآكل.</div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ معادلة الخارصين مع H₂SO₄؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">Zn + H₂SO₄ → ZnSO₄ + H₂↑ — الخارصين يحلّ محل الهيدروجين لأنه فوقه في السلسلة.</div>
    </div>`);

  const metals=['K','Na','Mg','Al','Zn','Fe','Ni','Cu','Ag','Au'];
  const colors=['#E74C3C','#E67E22','#BDC3C7','#95A5A6','#7F8C8D','#8B6914','#AAB7B8','#E67E22','#C0C0C0','#D4AC0D'];
  const active=[true,true,true,true,true,true,true,false,false,false];

  function draw(){
    if(currentSim!=='salts_metal') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.02;
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F5F5DC'); bg.addColorStop(1,'#EDE8D0');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    c.fillStyle='#2C3E50'; c.font=`bold ${Math.min(15,w*0.034)}px Tajawal`;
    c.textAlign='center'; c.fillText('سلسلة النشاط الكيميائي للفلزات',w/2,h*0.07);

    // سهم النشاط
    c.strokeStyle='rgba(231,76,60,0.4)'; c.lineWidth=3;
    c.beginPath(); c.moveTo(w*0.06,h*0.85); c.lineTo(w*0.06,h*0.15); c.stroke();
    c.beginPath(); c.moveTo(w*0.03,h*0.18); c.lineTo(w*0.06,h*0.15); c.lineTo(w*0.09,h*0.18); c.stroke();
    c.save(); c.translate(w*0.03,h*0.5); c.rotate(-Math.PI/2);
    c.fillStyle='#C0392B'; c.font=`bold ${Math.min(11,w*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText('النشاط يزداد ↑',0,0); c.restore();

    const bw2=(w*0.85)/metals.length;
    metals.forEach((m,i)=>{
      const bx2=w*0.12+i*bw2;
      const heightRatio=0.08+(metals.length-1-i)*0.07;
      const bh=h*heightRatio, by2=h*0.82-bh;
      const gr=c.createLinearGradient(bx2,by2,bx2,h*0.82);
      gr.addColorStop(0,colors[i]+'EE'); gr.addColorStop(1,colors[i]+'88');
      c.fillStyle=gr; c.beginPath(); c.roundRect(bx2+2,by2,bw2-4,bh,4); c.fill();
      c.fillStyle=active[i]?'#27AE60':'#C0392B'; c.font=`${Math.min(10,w*0.022)}px Arial`;
      c.textAlign='center'; c.fillText(active[i]?'✓':'✗',bx2+bw2/2,by2-5);
      c.fillStyle='#2C3E50'; c.font=`bold ${Math.min(10,bw2*0.5)}px monospace`;
      c.fillText(m,bx2+bw2/2,h*0.87);
    });

    // خط فاصل عند النحاس
    const hIdx=7;
    const lineX=w*0.12+hIdx*bw2;
    c.strokeStyle='rgba(231,76,60,0.5)'; c.lineWidth=2; c.setLineDash([5,4]);
    c.beginPath(); c.moveTo(lineX,h*0.12); c.lineTo(lineX,h*0.84); c.stroke();
    c.setLineDash([]);
    c.fillStyle='#C0392B'; c.font=`${Math.min(10,w*0.022)}px Tajawal`;
    c.textAlign='center'; c.fillText('← تتفاعل مع الأحماض | لا تتفاعل →',lineX,h*0.11);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function salts_oxide2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.salts_oxide2) simState.salts_oxide2={t:0,sel:0};
  const S=simState.salts_oxide2;

  const oxides=[
    {name:'أكسيد النحاس',formula:'CuO',acid:'H₂SO₄',salt:'CuSO₄',saltName:'كبريتات النحاس',color:'#2980B9'},
    {name:'أكسيد الحديد',formula:'Fe₂O₃',acid:'HCl',salt:'FeCl₃',saltName:'كلوريد الحديد',color:'#C0392B'},
    {name:'أكسيد الزنك',formula:'ZnO',acid:'H₂SO₄',salt:'ZnSO₄',saltName:'كبريتات الخارصين',color:'#7F8C8D'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧪 أكسيد فلز + حمض</div>
      ${oxides.map((ox,i)=>`<button class="ctrl-btn" style="width:100%;margin:2px 0;${S.sel===i?'background:'+ox.color+';color:white':''}" onclick="simState.salts_oxide2.sel=${i}">${ox.formula} + ${ox.acid}</button>`).join('')}
    </div>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:8px">
      أكسيد الفلز + حمض → ملح + ماء<br>
      <small>لا ينطلق H₂ (لأن الأكسيد قاعدة، لا فلز)</small>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ما الفرق عن تفاعل الفلز+حمض؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">فلز + حمض → ملح + H₂↑. أكسيد + حمض → ملح + H₂O فقط. الأكسيد قاعدة بالفعل فلا ينطلق هيدروجين.</div>
    </div>`);

  function draw(){
    if(currentSim!=='salts_oxide') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.03;
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#FAFAFA'); bg.addColorStop(1,'#F0F0F0');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    const ox=oxides[S.sel];
    c.fillStyle=ox.color; c.font=`bold ${Math.min(14,w*0.032)}px Tajawal`;
    c.textAlign='center'; c.fillText(`${ox.formula} + ${ox.acid} → ${ox.salt} + H₂O`,w/2,h*0.08);

    // رسم معادلة مرئية
    const drawB=(bx,by,bw,bh,liqColor,label)=>{
      c.strokeStyle='#AAA'; c.lineWidth=2;
      c.beginPath(); c.moveTo(bx,by); c.lineTo(bx+bw*0.04,by+bh); c.stroke();
      c.beginPath(); c.moveTo(bx+bw,by); c.lineTo(bx+bw-bw*0.04,by+bh); c.stroke();
      c.beginPath(); c.moveTo(bx+bw*0.04,by+bh); c.lineTo(bx+bw-bw*0.04,by+bh); c.stroke();
      c.strokeStyle='#CCC'; c.lineWidth=5; c.beginPath(); c.moveTo(bx-3,by); c.lineTo(bx+bw+3,by); c.stroke();
      c.fillStyle=liqColor; c.fillRect(bx+2,by+bh*0.25,bw-4,bh*0.73);
      c.fillStyle='#444'; c.font=`bold ${Math.min(11,w*0.025)}px monospace`; c.textAlign='center';
      c.fillText(label,bx+bw/2,by+bh*0.55);
    };

    drawB(w*0.07,h*0.15,w*0.32,h*0.55,'rgba(144,238,144,0.4)',ox.acid);
    drawB(w*0.62,h*0.15,w*0.34,h*0.55,ox.color+'44',ox.salt);

    // الأكسيد
    c.fillStyle='#2C2C2CSS'; c.fillStyle='rgba(80,60,40,0.8)'; c.beginPath();
    c.roundRect(w*0.2,h*0.12,w*0.12,h*0.07,4); c.fill();
    c.fillStyle='white'; c.font=`bold ${Math.min(11,w*0.024)}px monospace`; c.textAlign='center';
    c.fillText(ox.formula,w*0.26,h*0.17);

    c.strokeStyle='#555'; c.lineWidth=2;
    c.beginPath(); c.moveTo(w*0.43,h*0.43); c.lineTo(w*0.58,h*0.43); c.stroke();
    c.beginPath(); c.moveTo(w*0.55,h*0.4); c.lineTo(w*0.58,h*0.43); c.lineTo(w*0.55,h*0.46); c.stroke();

    c.fillStyle=ox.color; c.font=`bold ${Math.min(13,w*0.029)}px Tajawal`;
    c.fillText(ox.saltName,w*0.62+w*0.17,h*0.62);
    c.fillStyle='#3498DB'; c.font=`${Math.min(11,w*0.025)}px monospace`;
    c.fillText('+ H₂O',w*0.62+w*0.17,h*0.72);

    c.fillStyle='rgba(0,0,0,0.55)'; c.font=`${Math.min(12,w*0.027)}px Tajawal`;
    c.fillText('❌ لا ينطلق غاز H₂ (فرق عن الفلز مباشرة)',w/2,h*0.85);
    c.fillStyle='#27AE60'; c.font=`bold ${Math.min(12,w*0.027)}px Tajawal`;
    c.fillText('ملح + ماء فقط ✅',w/2,h*0.91);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function salts_carbonate2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.salts_carbonate2) simState.salts_carbonate2={t:0};
  const S=simState.salts_carbonate2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔬 مقارنة طرق تحضير الأملاح</div>
      <div class="info-box" style="font-size:12px;line-height:2;margin-top:6px">
        1️⃣ فلز + حمض → ملح + H₂↑<br>
        2️⃣ أكسيد + حمض → ملح + H₂O<br>
        3️⃣ كربونات + حمض → ملح + H₂O + CO₂↑<br>
        4️⃣ حمض + قاعدة → ملح + H₂O
      </div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ كيف نختبر CO₂؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">نمرّره في ماء الجير Ca(OH)₂ — يتعكّر ويتشكّل راسب أبيض من CaCO₃. هذا الاختبار خاص بـ CO₂.</div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا تُستخدم الكربونات في إطفاء الحرائق؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">CO₂ الناتج يُغطي اللهب ويمنع الأكسجين — طفايات CO₂ تعمل على هذا المبدأ.</div>
    </div>`);

  const methods=[
    {label:'فلز + حمض',eq:'Zn + H₂SO₄ → ZnSO₄ + H₂↑',gas:'H₂ ↑',color:'#3498DB',icon:'🔩'},
    {label:'أكسيد + حمض',eq:'CuO + H₂SO₄ → CuSO₄ + H₂O',gas:'لا غاز',color:'#8E44AD',icon:'⬛'},
    {label:'كربونات + حمض',eq:'CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂',gas:'CO₂ ↑',color:'#27AE60',icon:'🪨'},
    {label:'تعادل',eq:'NaOH + HCl → NaCl + H₂O',gas:'لا غاز',color:'#E67E22',icon:'🧪'},
  ];

  function draw(){
    if(currentSim!=='salts_carbonate') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.025;
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F0FFF8'); bg.addColorStop(1,'#E0F8F0');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    c.fillStyle='#1A5232'; c.font=`bold ${Math.min(15,w*0.034)}px Tajawal`;
    c.textAlign='center'; c.fillText('طرق تحضير الأملاح — مقارنة شاملة',w/2,h*0.07);

    methods.forEach((m,i)=>{
      const row=Math.floor(i/2), col=i%2;
      const bx=col===0?w*0.04:w*0.53;
      const by=h*0.13+row*(h*0.41);
      const bw=w*0.43, bh=h*0.37;
      const active=Math.floor(S.t*0.5)%methods.length===i;
      c.fillStyle=active?m.color+'22':'rgba(255,255,255,0.7)';
      c.beginPath(); c.roundRect(bx,by,bw,bh,10); c.fill();
      c.strokeStyle=active?m.color:'rgba(0,0,0,0.08)'; c.lineWidth=active?2:1; c.stroke();
      c.fillStyle=m.color; c.font=`bold ${Math.min(12,w*0.027)}px Tajawal`;
      c.textAlign='center'; c.fillText(`${m.icon} ${m.label}`,bx+bw/2,by+bh*0.22);
      c.fillStyle='#2C3E50'; c.font=`${Math.min(9.5,w*0.021)}px monospace`;
      c.fillText(m.eq,bx+bw/2,by+bh*0.5);
      const gasColor=m.gas==='لا غاز'?'#888':m.color;
      c.fillStyle=gasColor; c.font=`bold ${Math.min(11,w*0.025)}px Tajawal`;
      c.fillText(`الغاز: ${m.gas}`,bx+bw/2,by+bh*0.78);
    });
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// دوال الجزء الثاني — الصوت (الوحدة 9)
// ══════════════════════════════════════════════════════════

function sound_pitch2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.sound_pitch2) simState.sound_pitch2={t:0,sel:2};
  const S=simState.sound_pitch2;

  const instruments=[
    {name:'طبلة 🥁',freq:80,color:'#E74C3C'},
    {name:'غيتار 🎸',freq:250,color:'#E67E22'},
    {name:'بيانو 🎹',freq:440,color:'#F39C12'},
    {name:'فلوت 🎷',freq:700,color:'#27AE60'},
    {name:'صافرة 📯',freq:950,color:'#2980B9'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🎵 الأدوات الموسيقية والتردد</div>
      ${instruments.map((ins,i)=>`<button class="ctrl-btn" style="width:100%;margin:2px 0;${S.sel===i?'background:'+ins.color+';color:white':''}" onclick="simState.sound_pitch2.sel=${i};try{const a=new(AudioContext||webkitAudioContext)();const o=a.createOscillator();const g=a.createGain();o.frequency.value=${ins.freq};g.gain.setValueAtTime(0.22,a.currentTime);g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+0.8);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+0.8);}catch(e){}">${ins.name} — ${ins.freq} Hz</button>`).join('')}
    </div>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:6px">
      نطاق سمع الإنسان: 20 - 20,000 Hz<br>
      فوق صوتي: >20,000 Hz (الخفافيش والدلافين)
    </div>`);

  function draw(){
    if(currentSim!=='sound_pitch') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.06;
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#050D05'); bg.addColorStop(1,'#0A1A0A');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    c.strokeStyle='rgba(0,140,0,0.1)'; c.lineWidth=0.5;
    for(let x=0;x<w;x+=w/10){ c.beginPath(); c.moveTo(x,0); c.lineTo(x,h); c.stroke(); }
    for(let y=0;y<h;y+=h/8){ c.beginPath(); c.moveTo(0,y); c.lineTo(w,y); c.stroke(); }

    const ins=instruments[S.sel];
    c.fillStyle=ins.color; c.font=`bold ${Math.min(14,w*0.032)}px Tajawal`;
    c.textAlign='center'; c.fillText(`${ins.name} — ${ins.freq} Hz`,w/2,h*0.09);

    [[instruments[2].freq,'rgba(255,200,0,0.35)',0.2,'مرجع (بيانو)'],[ins.freq,ins.color+'CC',0.5,'المختار']].forEach(([freq,color,amp,label],wi)=>{
      const midY=h*(wi===0?0.35:0.65);
      const amplitude=h*0.1;
      const fRatio=freq/300;
      c.strokeStyle=color; c.lineWidth=wi===0?1.5:2.5;
      if(wi===1){ c.shadowColor=ins.color+'88'; c.shadowBlur=8; }
      c.beginPath();
      for(let x=0;x<=w;x+=2){
        const y=midY+Math.sin((x/w)*fRatio*Math.PI*8+S.t)*amplitude;
        x===0?c.moveTo(x,y):c.lineTo(x,y);
      }
      c.stroke(); c.shadowBlur=0;
      c.fillStyle=color; c.font=`${Math.min(11,w*0.024)}px Tajawal`;
      c.textAlign='right'; c.fillText(label,w*0.98,midY-amplitude-5);
    });
    c.textAlign='center';
    c.fillStyle='rgba(255,255,255,0.45)'; c.font=`${Math.min(11,w*0.025)}px Tajawal`;
    c.fillText('اضغط على الأداة لسماعها 🎵',w/2,h*0.93);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function sound_vibration2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.sound_vibration2) simState.sound_vibration2={t:0,sel:0};
  const S=simState.sound_vibration2;

  const objects=[
    {name:'وتر قصير مشدود',icon:'🎸',freq:2.8,color:'#E67E22',desc:'قصير + مشدود → تردد أعلى'},
    {name:'وتر طويل مرخي',icon:'🎸',freq:1.2,color:'#27AE60',desc:'طويل + مرخي → تردد أقل'},
    {name:'مسطرة قصيرة',icon:'📏',freq:3.5,color:'#3498DB',desc:'قصيرة → اهتزاز سريع'},
    {name:'مسطرة طويلة',icon:'📏',freq:1.0,color:'#8E44AD',desc:'طويلة → اهتزاز بطيء'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🎵 العوامل المؤثرة على التردد</div>
      ${objects.map((o,i)=>`<button class="ctrl-btn" style="width:100%;margin:2px 0;${S.sel===i?'background:'+o.color+';color:white':''}" onclick="simState.sound_vibration2.sel=${i};simState.sound_vibration2.t=0">${o.icon} ${o.name}</button>`).join('')}
    </div>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:6px">
      تردد أعلى ← طول أقل / شد أكبر / كتلة أقل
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا الأوتار الغليظة أعمق صوتاً؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الوتر الغليظ أثقل — يهتز أبطأ → تردد أقل → صوت أعمق.</div>
    </div>`);

  function draw(){
    if(currentSim!=='sound_vibration') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.05;
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#1A1205'); bg.addColorStop(1,'#2E2005');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    const ob=objects[S.sel];
    c.fillStyle=ob.color; c.font=`bold ${Math.min(15,w*0.034)}px Tajawal`;
    c.textAlign='center'; c.fillText(`${ob.icon} ${ob.name}`,w/2,h*0.08);

    // موجة الاهتزاز مع تناقص
    c.strokeStyle=ob.color+'CC'; c.lineWidth=2.5;
    c.shadowColor=ob.color+'88'; c.shadowBlur=8;
    c.beginPath();
    for(let x=0;x<=w;x+=2){
      const t2=x/w*6;
      const dec=Math.exp(-t2*0.5);
      const y=h*0.38+Math.sin(t2*ob.freq*Math.PI*2+S.t*2)*h*0.12*dec;
      x===0?c.moveTo(x,y):c.lineTo(x,y);
    }
    c.stroke(); c.shadowBlur=0;

    c.strokeStyle='rgba(255,255,255,0.12)'; c.lineWidth=1; c.setLineDash([4,4]);
    c.beginPath(); c.moveTo(0,h*0.38); c.lineTo(w,h*0.38); c.stroke();
    c.setLineDash([]);

    c.fillStyle='rgba(255,255,255,0.75)'; c.font=`bold ${Math.min(12,w*0.027)}px Tajawal`;
    c.fillText('مقارنة الأجسام',w/2,h*0.6);

    objects.forEach((o,i)=>{
      const bx=w*0.1+i*(w*0.22);
      const barH=h*0.18*(o.freq/4);
      const by=h*0.8-barH;
      const isSel=i===S.sel;
      const gr=c.createLinearGradient(bx,by,bx,h*0.8);
      gr.addColorStop(0,o.color+'EE'); gr.addColorStop(1,o.color+'66');
      c.fillStyle=gr; c.beginPath(); c.roundRect(bx+2,by,w*0.17,barH,4); c.fill();
      if(isSel){ c.strokeStyle='white'; c.lineWidth=2.5; c.stroke(); }
      c.font=`${Math.min(16,w*0.036)}px Arial`; c.textAlign='center';
      c.fillText(o.icon,bx+w*0.085,by-6);
      c.fillStyle='rgba(255,255,255,0.65)'; c.font=`${Math.min(9,w*0.02)}px Tajawal`;
      c.fillText((o.freq*100).toFixed(0)+' Hz',bx+w*0.085,h*0.84);
    });
    c.textAlign='center';
    c.fillStyle=ob.color; c.font=`${Math.min(12,w*0.027)}px Tajawal`;
    c.fillText(ob.desc,w/2,h*0.92);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function sound_travel2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.sound_travel2) simState.sound_travel2={t:0,sel:0};
  const S=simState.sound_travel2;

  const scenarios=[
    {name:'الهواء',icon:'🌬️',speed:343,color:'#3498DB',bg:'#87CEEB',desc:'جزيئات متباعدة — أبطأ'},
    {name:'الماء',icon:'💧',speed:1480,color:'#1A5276',bg:'#2E86C1',desc:'جزيئات أقرب — 4x أسرع من الهواء'},
    {name:'الفولاذ',icon:'⚙️',speed:5100,color:'#7D6608',bg:'#B7950B',desc:'جزيئات متلاصقة — 15x أسرع'},
    {name:'الفراغ',icon:'🌌',speed:0,color:'#8E44AD',bg:'#2C3E50',desc:'لا جزيئات — الصوت لا ينتقل'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔊 سرعة الصوت في الأوساط</div>
      ${scenarios.map((s,i)=>`<button class="ctrl-btn" style="width:100%;margin:2px 0;${S.sel===i?'background:'+s.color+';color:white':''}" onclick="simState.sound_travel2.sel=${i}">${s.icon} ${s.name} (${s.speed||'لا ينتقل'} م/ث)</button>`).join('')}
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا نسمع الرعد بعد البرق؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الضوء يسافر 300,000 كم/ث (فوري). الصوت يسير 343 م/ث فقط. كل 3 ثوانٍ تأخير ≈ 1 كم بُعد.</div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا الغواصات تستخدم السونار؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الصوت ينتقل سريعاً في الماء (1480 م/ث) — السونار يُرسل موجات ويقيس وقت العودة لتحديد المسافة.</div>
    </div>`);

  function draw(){
    if(currentSim!=='sound_travel') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.04;
    const sc=scenarios[S.sel];

    if(sc.speed===0){
      c.fillStyle='#080818'; c.fillRect(0,0,w,h);
      for(let i=0;i<50;i++){
        const sx=(Math.sin(i*137)*0.5+0.5)*w, sy=(Math.cos(i*97)*0.5+0.5)*h;
        c.fillStyle=`rgba(255,255,255,${0.3+Math.sin(S.t+i)*0.2})`; c.beginPath(); c.arc(sx,sy,1,0,Math.PI*2); c.fill();
      }
      c.fillStyle='#FF4444'; c.font=`bold ${Math.min(18,w*0.04)}px Tajawal`; c.textAlign='center';
      c.fillText('🔕 الصوت لا ينتقل في الفراغ!',w/2,h*0.42);
      c.fillStyle='rgba(255,255,255,0.6)'; c.font=`${Math.min(13,w*0.03)}px Tajawal`;
      c.fillText('لا جزيئات لنقل الاهتزازات',w/2,h*0.54);
      animFrame=requestAnimationFrame(draw); return;
    }

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,sc.bg+'AA'); bg.addColorStop(1,sc.bg+'55');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    c.fillStyle='white'; c.font=`bold ${Math.min(15,w*0.034)}px Tajawal`;
    c.textAlign='center'; c.fillText(`${sc.icon} الصوت في ${sc.name}: ${sc.speed} م/ث`,w/2,h*0.07);

    // جزيئات
    const density=sc.name==='الفولاذ'?12:sc.name==='الماء'?8:5;
    const spacing=w/(density+1);
    for(let r=0;r<3;r++) for(let col=0;col<density;col++){
      const bx=(col+1)*spacing, by=h*0.45+(r-1)*h*0.12;
      const wave=Math.sin(S.t*3-col*0.5)*h*0.03*(sc.speed/5100);
      const pr=sc.name==='الفولاذ'?8:sc.name==='الماء'?5:3;
      c.fillStyle=sc.color+'CC'; c.beginPath(); c.arc(bx+wave,by,pr,0,Math.PI*2); c.fill();
    }

    // مقارنة الأوساط
    c.fillStyle='rgba(255,255,255,0.8)'; c.font=`bold ${Math.min(12,w*0.027)}px Tajawal`;
    c.fillText('مقارنة السرعات',w/2,h*0.66);
    const maxBar=w*0.7;
    scenarios.filter(s=>s.speed>0).forEach((s,i)=>{
      const by2=h*0.72+i*h*0.065;
      const bw=maxBar*(s.speed/5100);
      const active=s.name===sc.name;
      c.fillStyle=active?s.color:'rgba(255,255,255,0.2)';
      c.beginPath(); c.roundRect(w*0.15,by2,bw,h*0.042,4); c.fill();
      c.fillStyle=active?'white':'rgba(255,255,255,0.5)';
      c.font=`${Math.min(10,w*0.023)}px Tajawal`; c.textAlign='left';
      c.fillText(`${s.icon} ${s.name}: ${s.speed} م/ث`,w*0.15+bw+6,by2+h*0.029);
    });
    c.textAlign='center';
    c.fillStyle=sc.color; c.font=`${Math.min(12,w*0.027)}px Tajawal`;
    c.fillText(sc.desc,w/2,h*0.94);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function sound_oscilloscope2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.sound_oscilloscope2) simState.sound_oscilloscope2={t:0,sel:0};
  const S=simState.sound_oscilloscope2;

  const sounds=[
    {name:'نغمة نقية',type:'sine',color:'#00FF44',freq:2,amp:0.6,desc:'موجة جيبية منتظمة — نغمة صافية'},
    {name:'صوت بشري',type:'voice',color:'#44FFAA',freq:2,amp:0.5,desc:'موجة معقدة — مزيج ترددات'},
    {name:'ضوضاء',type:'noise',color:'#FF8844',freq:5,amp:0.4,desc:'موجة عشوائية — أصوات غير منتظمة'},
    {name:'نبضة طبلة',type:'drum',color:'#FF4444',freq:1,amp:0.8,desc:'سعة كبيرة تتناقص سريعاً'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📺 أنواع الموجات الصوتية</div>
      ${sounds.map((s,i)=>`<button class="ctrl-btn" style="width:100%;margin:2px 0;${S.sel===i?'background:'+s.color.replace('FF','88')+';color:#000':''}" onclick="simState.sound_oscilloscope2.sel=${i};simState.sound_oscilloscope2.t=0">${s.name}</button>`).join('')}
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ما الفرق بين النغمة والضوضاء؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">النغمة: موجات منتظمة بتردد ثابت. الضوضاء: موجات عشوائية بترددات مختلطة — لا حدة محددة.</div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ كيف يعمل الأوسيلوسكوب؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">يُحوّل تغيرات الضغط الهوائي إلى إشارة كهربائية ثم يرسمها — السعة = الشدة، وعدد الموجات = التردد.</div>
    </div>`);

  function draw(){
    if(currentSim!=='sound_oscilloscope') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.06;
    c.fillStyle='#050F05'; c.fillRect(0,0,w,h);
    c.strokeStyle='rgba(0,200,0,0.25)'; c.lineWidth=2;
    c.beginPath(); c.roundRect(8,8,w-16,h-16,6); c.stroke();
    c.strokeStyle='rgba(0,160,0,0.08)'; c.lineWidth=0.5;
    for(let x=0;x<w;x+=w/10){ c.beginPath(); c.moveTo(x,0); c.lineTo(x,h); c.stroke(); }
    for(let y=0;y<h;y+=h/8){ c.beginPath(); c.moveTo(0,y); c.lineTo(w,y); c.stroke(); }

    const snd=sounds[S.sel];
    const amp=snd.amp*h*0.3, midY=h*0.45;
    c.strokeStyle=snd.color; c.lineWidth=2.5;
    c.shadowColor=snd.color+'88'; c.shadowBlur=10;
    c.beginPath();
    for(let x=0;x<=w;x+=2){
      let y;
      if(snd.type==='sine') y=midY+Math.sin((x/w)*snd.freq*Math.PI*6+S.t)*amp;
      else if(snd.type==='voice') y=midY+(Math.sin((x/w)*snd.freq*Math.PI*6+S.t)*0.6+Math.sin((x/w)*snd.freq*Math.PI*12+S.t*1.3)*0.25+Math.sin((x/w)*snd.freq*Math.PI*18+S.t*0.7)*0.15)*amp;
      else if(snd.type==='noise') y=midY+(Math.sin((x/w)*snd.freq*Math.PI*8+S.t)*0.4+(Math.random()-0.5)*0.6)*amp;
      else{ const dec=Math.exp(-(x/w)*4); y=midY+Math.sin((x/w)*snd.freq*Math.PI*4+S.t)*amp*dec; }
      x===0?c.moveTo(x,y):c.lineTo(x,y);
    }
    c.stroke(); c.shadowBlur=0;
    c.strokeStyle='rgba(0,200,0,0.18)'; c.lineWidth=1;
    c.beginPath(); c.moveTo(0,midY); c.lineTo(w,midY); c.stroke();

    c.fillStyle=snd.color; c.font=`bold ${Math.min(14,w*0.032)}px Tajawal`;
    c.textAlign='center'; c.fillText(snd.name,w/2,h*0.1);
    c.fillStyle='rgba(255,255,255,0.65)'; c.font=`${Math.min(11,w*0.025)}px Tajawal`;
    c.fillText(snd.desc,w/2,h*0.88);

    // مصغرات للمقارنة
    sounds.forEach((s,i)=>{
      const bx=w*0.1+i*(w*0.2);
      const isSel=i===S.sel;
      c.strokeStyle=isSel?s.color:s.color+'44'; c.lineWidth=isSel?1.8:1;
      c.beginPath();
      for(let x2=0;x2<w*0.15;x2+=2){
        const t3=x2/(w*0.15);
        let y2;
        if(s.type==='sine') y2=Math.sin(t3*Math.PI*6+S.t)*h*0.04;
        else if(s.type==='voice') y2=(Math.sin(t3*Math.PI*6+S.t)*0.6+Math.sin(t3*Math.PI*12+S.t)*0.4)*h*0.035;
        else if(s.type==='noise') y2=(Math.sin(t3*Math.PI*8+S.t)*0.4+(Math.random()-0.5)*0.6)*h*0.03;
        else y2=Math.sin(t3*Math.PI*4+S.t)*Math.exp(-t3*4)*h*0.05;
        const drawY=h*0.73+y2;
        x2===0?c.moveTo(bx+x2,drawY):c.lineTo(bx+x2,drawY);
      }
      c.stroke();
      c.fillStyle=isSel?s.color:'rgba(255,255,255,0.35)';
      c.font=`${Math.min(9,w*0.02)}px Tajawal`; c.textAlign='center';
      c.fillText(s.name,bx+w*0.075,h*0.82);
    });
    c.textAlign='center';
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════
//   الصف الخامس — وحدة ٤: الطريقة التي نرى بها الأشياء
// ══════════════════════════════════════════════════

function simG5LightTravel() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">💡 الضوء والرؤية</div>
  <div class="ctrl-desc">
    اسحب مصدر الضوء 🟡 حول الشاشة وشاهد كيف تصل الأشعة للأجسام ثم تنعكس نحو العين 👁️
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">📖 ماذا تعلّمنا؟</div>
  <div class="ctrl-desc">
    ① الضوء يصدر من <b>مصدر الضوء</b><br>
    ② يصطدم بالجسم فينعكس<br>
    ③ ينتقل الضوء المنعكس إلى عيننا فنرى
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٤):</strong><br>
  ١- لماذا لا نرى الأجسام في الظلام التام؟<br>
  ٢- ما الفرق بين الجسم المضيء والجسم المرئي؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">١- لأنه لا يوجد ضوء ينعكس من الأجسام إلى عيوننا.<br>٢- الجسم المضيء ينتج ضوءه بنفسه (كالشمس)، بينما الجسم المرئي يعكس ضوءاً يصله من مصدر آخر.</div>
</div>`;
  const cv = document.getElementById('simCanvas');
  const c = cv.getContext('2d');
  const w = cv.width, h = cv.height;
  const S = simState;
  if (!S.init) {
    S.init = true;
    S.srcX = 0.2; S.srcY = 0.5;
    S.dragging = false;
    S.objects = [
      { x: 0.6, y: 0.35, r: 0.04, color: '#E74C3C', label: 'كرة' },
      { x: 0.75, y: 0.65, r: 0.04, color: '#27AE60', label: 'مكعب' },
    ];
    S.showRays = true;
    cv.onmousedown = function(e) {
      const rect = cv.getBoundingClientRect();
      const mx = ((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX - rect.left) / cv.offsetWidth;
      const my = (e.clientY - rect.top) / cv.offsetHeight;
      const dx = mx - S.srcX, dy = my - S.srcY;
      if (Math.sqrt(dx*dx+dy*dy) < 0.06) S.dragging = true;
    };
    cv.ontouchstart = function(e) {
      e.preventDefault();
      const rect = cv.getBoundingClientRect();
      const t = e.touches[0];
      const mx = (t.clientX - rect.left) / cv.offsetWidth;
      const my = (t.clientY - rect.top) / cv.offsetHeight;
      const dx = mx - S.srcX, dy = my - S.srcY;
      if (Math.sqrt(dx*dx+dy*dy) < 0.08) S.dragging = true;
    };
    cv.onmousemove = function(e) {
      if (!S.dragging) return;
      const rect = cv.getBoundingClientRect();
      S.srcX = Math.max(0.05, Math.min(0.45, ((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX - rect.left) / cv.offsetWidth));
      S.srcY = Math.max(0.1, Math.min(0.9, (e.clientY - rect.top) / cv.offsetHeight));
    };
    cv.ontouchmove = function(e) {
      e.preventDefault();
      if (!S.dragging) return;
      const rect = cv.getBoundingClientRect();
      const t = e.touches[0];
      S.srcX = Math.max(0.05, Math.min(0.45, (t.clientX - rect.left) / cv.offsetWidth));
      S.srcY = Math.max(0.1, Math.min(0.9, (t.clientY - rect.top) / cv.offsetHeight));
    };
    cv.onmouseup = cv.ontouchend = function() { S.dragging = false; };
  }
  function draw() {
    if (currentSim !== 'g5lighttravel') return;
    c.fillStyle = '#0a0a1a';
    c.fillRect(0, 0, w, h);
    // Background stars
    c.fillStyle = 'rgba(255,255,255,0.4)';
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 137 + 23) % 100) / 100 * w;
      const sy = ((i * 89 + 7) % 100) / 100 * h;
      c.beginPath(); c.arc(sx, sy, 1, 0, Math.PI*2); c.fill();
    }
    const sx = S.srcX * w, sy = S.srcY * h;
    // Draw rays to each object and to eye
    S.objects.forEach(obj => {
      const ox = obj.x * w, oy = obj.y * h;
      const ang = Math.atan2(oy - sy, ox - sx);
      const dist = Math.sqrt((ox-sx)**2 + (oy-sy)**2);
      // Gradient ray
      const grad = c.createLinearGradient(sx, sy, ox, oy);
      grad.addColorStop(0, 'rgba(255,230,80,0.9)');
      grad.addColorStop(1, 'rgba(255,230,80,0.1)');
      c.strokeStyle = grad;
      c.lineWidth = 2;
      c.setLineDash([8, 4]);
      c.beginPath(); c.moveTo(sx, sy); c.lineTo(ox - obj.r*w * Math.cos(ang), oy - obj.r*h * Math.sin(ang)); c.stroke();
      c.setLineDash([]);
      // Arrow head
      c.fillStyle = 'rgba(255,230,80,0.7)';
      c.save(); c.translate(ox - obj.r*w*1.4*Math.cos(ang), oy - obj.r*h*1.4*Math.sin(ang));
      c.rotate(ang); c.beginPath(); c.moveTo(8,0); c.lineTo(-4,4); c.lineTo(-4,-4); c.fill(); c.restore();
      // Reflected ray to eye
      const eyeX = 0.92 * w, eyeY = S.srcY * h;
      const rGrad = c.createLinearGradient(ox, oy, eyeX, eyeY);
      rGrad.addColorStop(0, obj.color + '99');
      rGrad.addColorStop(1, obj.color + '33');
      c.strokeStyle = rGrad; c.lineWidth = 1.5; c.setLineDash([5,5]);
      c.beginPath(); c.moveTo(ox, oy); c.lineTo(eyeX, eyeY); c.stroke();
      c.setLineDash([]);
    });
    // Animated photons along rays
    const pT = (Date.now() % 1200) / 1200; // 0..1 cycle
    S.objects.forEach(obj => {
      const ox = obj.x * w, oy = obj.y * h;
      // Outgoing photon (source → object)
      const pFrac = pT;
      const pX = sx + (ox - sx) * pFrac;
      const pY = sy + (oy - sy) * pFrac;
      const gph = c.createRadialGradient(pX, pY, 0, pX, pY, 5);
      gph.addColorStop(0, 'rgba(255,255,180,1)');
      gph.addColorStop(1, 'rgba(255,255,180,0)');
      c.fillStyle = gph; c.beginPath(); c.arc(pX, pY, 5, 0, Math.PI*2); c.fill();
      // Return photon (object → eye)
      const eyeX = 0.92 * w, eyeY = S.srcY * h;
      const pFrac2 = (pT + 0.5) % 1;
      const pX2 = ox + (eyeX - ox) * pFrac2;
      const pY2 = oy + (eyeY - oy) * pFrac2;
      const gph2 = c.createRadialGradient(pX2, pY2, 0, pX2, pY2, 4);
      gph2.addColorStop(0, obj.color + 'FF');
      gph2.addColorStop(1, obj.color + '00');
      c.fillStyle = gph2; c.beginPath(); c.arc(pX2, pY2, 4, 0, Math.PI*2); c.fill();
    });
    // Light source glow
    const grd = c.createRadialGradient(sx, sy, 0, sx, sy, w*0.1);
    grd.addColorStop(0, 'rgba(255,230,80,0.9)'); grd.addColorStop(1, 'rgba(255,230,80,0)');
    c.fillStyle = grd; c.beginPath(); c.arc(sx, sy, w*0.1, 0, Math.PI*2); c.fill();
    // Source icon
    c.fillStyle = '#FFE050'; c.beginPath(); c.arc(sx, sy, w*0.025, 0, Math.PI*2); c.fill();
    c.fillStyle = '#fff'; c.font = `bold ${Math.max(11,w*0.028)}px Tajawal`; c.textAlign = 'center';
    c.fillText('مصدر الضوء', sx, sy - w*0.045);
    c.fillText('(اسحب)', sx, sy + w*0.05);
    // Objects
    S.objects.forEach(obj => {
      c.fillStyle = obj.color;
      c.beginPath(); c.arc(obj.x*w, obj.y*h, obj.r*w, 0, Math.PI*2); c.fill();
      c.fillStyle = '#fff'; c.font = `bold ${Math.max(10,w*0.022)}px Tajawal`; c.textAlign = 'center';
      c.fillText(obj.label, obj.x*w, obj.y*h + obj.r*w + 16);
    });
    // Eye
    const ex = 0.92*w, ey = S.srcY*h;
    c.fillStyle = '#fff'; c.font = `${Math.max(18,w*0.045)}px serif`; c.textAlign='center';
    c.fillText('👁️', ex, ey+8);
    // Info box
    // Info box — full width centered
    const infoText = '💡 الضوء ينتقل: مصدر الضوء ← الجسم ← ينعكس ← العين';
    const infoFontSz = Math.max(10, Math.min(w*0.021, 13));
    c.font = `bold ${infoFontSz}px Tajawal`;
    const infoTW = c.measureText(infoText).width + 28;
    const infoBoxX = Math.max(w*0.02, (w - infoTW) / 2);
    c.fillStyle='rgba(255,255,255,0.1)'; c.strokeStyle='rgba(255,255,255,0.2)'; c.lineWidth=1;
    c.beginPath(); c.roundRect(infoBoxX, h*0.02, Math.min(infoTW, w*0.96), h*0.09, 8); c.fill(); c.stroke();
    c.fillStyle='#FFE050'; c.textAlign='center';
    c.fillText(infoText, w*0.5, h*0.075);
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG5HowWeSee() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">👁️ كيف نرى الأشياء؟</div>
  <div class="ctrl-desc">
    شاهد الرسم المتحرّك الذي يوضّح المراحل الثلاث لعملية الرؤية
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">🔢 مراحل الرؤية</div>
  <div class="ctrl-desc">
    ① مصدر الضوء يُصدر الضوء<br>
    ② الضوء يصطدم بالجسم وينعكس<br>
    ③ الضوء المنعكس يدخل العين
  </div>
</div>
<div class="q-box">
  <strong>❓ فكّر:</strong><br>
  كيف لمنى أن ترى الكرة في الصباح؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">
    ينتقل الضوء من الشمس ☀️ ← الكرة ⚽ ← عين منى 👁️<br>
    الشمس تُصدر الضوء، فيصطدم بالكرة وينعكس نحو عين منى فتراها.
  </div>
</div>`;
  const cv = document.getElementById('simCanvas');
  const c = cv.getContext('2d');
  const w = cv.width, h = cv.height;
  const S = simState;
  if (!S.init2) {
    S.init2 = true;
    S.step = 0;
    S.t = 0;
  }
  function draw() {
    if (currentSim !== 'g5lighttravel') return;
    S.t += 0.018;
    c.fillStyle = '#0d1117'; c.fillRect(0,0,w,h);

    // Sky gradient background
    const skyGrad = c.createLinearGradient(0,0,0,h*0.6);
    skyGrad.addColorStop(0,'#1a3a5c'); skyGrad.addColorStop(1,'#0d1117');
    c.fillStyle = skyGrad; c.fillRect(0,0,w,h*0.6);

    // Ground
    c.fillStyle = '#1a2e1a'; c.fillRect(0, h*0.72, w, h*0.28);

    const steps = [
      { icon:'☀️', label:'الشمس\n(مصدر الضوء)', x:0.1, y:0.22, color:'#FFD700', size: 0.065 },
      { icon:'⚽', label:'الكرة', x:0.5, y:0.65, color:'#E8E8E8', size: 0.048 },
      { icon:'👁️', label:'عين منى', x:0.88, y:0.45, color:'#3498DB', size: 0.048 },
    ];

    // Animated beam: sun → ball → eye
    const cycle = (S.t % 4) / 4; // 0..1 repeating over 4 units of time

    // Phase 1: sun → ball (cycle 0..0.5)
    // Phase 2: ball → eye (cycle 0.5..1)
    const phase1 = Math.min(1, cycle / 0.45);
    const phase2 = Math.max(0, Math.min(1, (cycle - 0.5) / 0.45));

    // Ray: sun → ball
    const s0x = steps[0].x*w, s0y = steps[0].y*h;
    const s1x = steps[1].x*w, s1y = steps[1].y*h;
    const s2x = steps[2].x*w, s2y = steps[2].y*h;

    // Sun glow
    const sunGlow = c.createRadialGradient(s0x,s0y,0,s0x,s0y,w*0.09);
    sunGlow.addColorStop(0,'rgba(255,220,50,0.5)'); sunGlow.addColorStop(1,'rgba(255,220,50,0)');
    c.fillStyle=sunGlow; c.beginPath(); c.arc(s0x,s0y,w*0.09,0,Math.PI*2); c.fill();

    // Draw ray 1 (sun→ball)
    if (phase1 > 0) {
      const endX = s0x + (s1x-s0x)*phase1;
      const endY = s0y + (s1y-s0y)*phase1;
      const rg1 = c.createLinearGradient(s0x,s0y,s1x,s1y);
      rg1.addColorStop(0,'rgba(255,220,50,0.9)'); rg1.addColorStop(1,'rgba(255,220,50,0.2)');
      c.strokeStyle=rg1; c.lineWidth=3; c.setLineDash([]);
      c.beginPath(); c.moveTo(s0x,s0y); c.lineTo(endX,endY); c.stroke();
      // Arrowhead
      if (phase1 > 0.3) {
        const ax = s0x+(s1x-s0x)*Math.min(phase1,0.85);
        const ay = s0y+(s1y-s0y)*Math.min(phase1,0.85);
        const ang = Math.atan2(s1y-s0y, s1x-s0x);
        c.fillStyle='rgba(255,220,50,0.9)';
        c.save(); c.translate(ax,ay); c.rotate(ang);
        c.beginPath(); c.moveTo(8,0); c.lineTo(-5,4); c.lineTo(-5,-4); c.fill(); c.restore();
      }
      // Label on ray 1
      if (phase1 > 0.6) {
        c.fillStyle='rgba(255,220,50,0.85)'; c.font=`bold ${Math.max(10,w*0.021)}px Tajawal`; c.textAlign='center';
        const lx=(s0x+s1x)/2-20, ly=(s0y+s1y)/2-14;
        c.fillText('① ضوء من الشمس', lx, ly);
      }
    }

    // Draw ray 2 (ball→eye)
    if (phase2 > 0) {
      const endX = s1x + (s2x-s1x)*phase2;
      const endY = s1y + (s2y-s1y)*phase2;
      const rg2 = c.createLinearGradient(s1x,s1y,s2x,s2y);
      rg2.addColorStop(0,'rgba(100,200,255,0.9)'); rg2.addColorStop(1,'rgba(100,200,255,0.2)');
      c.strokeStyle=rg2; c.lineWidth=2.5;
      c.beginPath(); c.moveTo(s1x,s1y); c.lineTo(endX,endY); c.stroke();
      if (phase2 > 0.3) {
        const ax = s1x+(s2x-s1x)*Math.min(phase2,0.85);
        const ay = s1y+(s2y-s1y)*Math.min(phase2,0.85);
        const ang = Math.atan2(s2y-s1y, s2x-s1x);
        c.fillStyle='rgba(100,200,255,0.9)';
        c.save(); c.translate(ax,ay); c.rotate(ang);
        c.beginPath(); c.moveTo(8,0); c.lineTo(-5,4); c.lineTo(-5,-4); c.fill(); c.restore();
      }
      if (phase2 > 0.5) {
        c.fillStyle='rgba(100,200,255,0.85)'; c.font=`bold ${Math.max(10,w*0.021)}px Tajawal`; c.textAlign='center';
        const lx=(s1x+s2x)/2+10, ly=(s1y+s2y)/2-14;
        c.fillText('③ ضوء منعكس للعين', lx, ly);
      }
    }

    // Draw steps
    steps.forEach((s, i) => {
      const sz = s.size * w;
      c.fillStyle = s.color+'22'; c.strokeStyle=s.color; c.lineWidth=2;
      c.beginPath(); c.arc(s.x*w, s.y*h, sz, 0, Math.PI*2); c.fill(); c.stroke();
      c.font=`${Math.max(20,sz*1.0)}px serif`; c.textAlign='center';
      c.fillText(s.icon, s.x*w, s.y*h+8);
      c.fillStyle='rgba(255,255,255,0.9)'; c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`;
      c.textAlign='center';
      const lines = s.label.split('\n');
      lines.forEach((ln,li)=> c.fillText(ln, s.x*w, s.y*h + sz + 18 + li*16));
      // step numbers
      const nums=['①','','②',''];
      if(i===1 && phase1 >= 0.95){
        c.fillStyle='#27AE60'; c.font=`bold ${Math.max(11,w*0.023)}px Tajawal`;
        c.fillText('② ينعكس الضوء', s.x*w, s.y*h - sz - 8);
      }
    });

    // Bottom summary
    c.fillStyle='rgba(255,255,255,0.8)'; c.font=`bold ${Math.max(11,w*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText('الشمس ☀️  ←  الكرة ⚽  ←  عين منى 👁️', w/2, h*0.92);

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG5MirrorFlat() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">🪞 المرآة المستوية — استقصاء المرايا المعكوسة</div>
  <div class="ctrl-desc">
    اسحب <b>مصدر الضوء 💡</b> — كلما اقتربت من المرآة قلّت الزاوية ✅<br>
    كلما ابتعدت عن المرآة (أطلت الشعاع) كلما قلّت الزاوية أيضاً.
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">📐 قانون الانعكاس</div>
  <div class="ctrl-name" style="font-size:15px;font-weight:700;color:var(--teal,#1A8FA8);text-align:center;padding:8px;background:rgba(26,143,168,0.08);border-radius:8px">
    زاوية السقوط = زاوية الانعكاس
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٤ · د٢):</strong><br>
  ما هي زاوية السقوط؟ وما هي زاوية الانعكاس؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">زاوية السقوط: الزاوية بين الشعاع الساقط والعمود المقام على سطح المرآة.<br>زاوية الانعكاس: الزاوية بين الشعاع المنعكس والعمود المقام — وهما دائماً متساويتان!</div>
</div>`;
  const cv = document.getElementById('simCanvas');
  const c = cv.getContext('2d');
  const S = simState;
  if (!S.mirrorInit) {
    S.mirrorInit = true;
    S.angleDeg = 35;    // angle between ray and mirror surface (2–88)
    S.rayLen = 0;
    S.dragging = false;
    S.dragMode = '';
  }

  function getGeom() {
    const w = cv.width, h = cv.height;
    const mirX = w * 0.55, mirY = h * 0.5;
    if (!S.rayLen) S.rayLen = w * 0.32;
    const len = Math.max(w*0.10, Math.min(w*0.65, S.rayLen));
    // angleDeg = angle between ray and the VERTICAL mirror surface
    // → srcX is to the left:  dx = len * cos(rad)  [horizontal component]
    //   srcY is above:         dy = len * sin(rad)  [vertical component, but sin gives small dy for small angle]
    // Small angle → ray nearly horizontal (grazes mirror) ✓
    // Large angle → ray nearly perpendicular to mirror ✓
    const rad = S.angleDeg * Math.PI / 180;
    const srcX = mirX - len * Math.sin(rad);   // small angle → small horizontal offset (close to mirror)
    const srcY = mirY - len * Math.cos(rad);   // small angle → large vertical offset
    const angleDeg = S.angleDeg;
    const rayLen = len;
    const handleX = srcX + (mirX - srcX) * 0.60;
    const handleY = srcY + (mirY - srcY) * 0.60;
    return { w, h, mirX, mirY, srcX, srcY, angleDeg, rad, rayLen, handleX, handleY };
  }

  function evtPos(e) {
    const rect = cv.getBoundingClientRect();
    const src = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
    return {
      x: (src.clientX - rect.left) * (cv.width / rect.width),
      y: (src.clientY - rect.top) * (cv.height / rect.height)
    };
  }

  function tryDrag(px, py) {
    const G = getGeom();
    const handleR = Math.max(20, G.w*0.04);
    const srcR    = Math.max(26, G.w*0.055);
    if (Math.hypot(px - G.handleX, py - G.handleY) < handleR) {
      S.dragging = true;
      S.dragMode = 'handle';
    } else if (Math.hypot(px - G.srcX, py - G.srcY) < srcR) {
      S.dragging = true;
      S.dragMode = 'source';
    }
  }
  function onMove(px, py) {
    if (!S.dragging) return;
    const w = cv.width, h = cv.height;
    const mirX = w * 0.55, mirY = h * 0.5;
    if (S.dragMode === 'source') {
      // Dragging the bulb → change angle between ray and mirror surface
      const clampX = Math.max(w*0.03, Math.min(mirX - w*0.03, px));
      const clampY = Math.max(h*0.04, Math.min(mirY - h*0.04, py));
      const dx = mirX - clampX;  // horizontal distance from mirror
      const dy = mirY - clampY;  // vertical distance (how far above)
      // angle from mirror surface = atan2(horizontal, vertical) = atan2(dx, dy)
      // small dx (close to mirror) → small angle ✓
      S.angleDeg = Math.max(2, Math.min(88, Math.round(Math.atan2(dx, dy) * 180 / Math.PI)));
    } else if (S.dragMode === 'handle') {
      // Dragging the handle → change ray length only (keep angle)
      const dx = mirX - px;
      const dy = mirY - py;
      const dist = Math.sqrt(dx*dx + dy*dy);
      S.rayLen = Math.max(w*0.10, Math.min(w*0.65, dist));
    }
  }

  cv.onmousedown  = function(e){ if(currentSim!=='g5mirror') return; tryDrag(...Object.values(evtPos(e))); };
  cv.onmousemove  = function(e){ if(currentSim!=='g5mirror') return; onMove(...Object.values(evtPos(e))); };
  cv.onmouseup = cv.onmouseleave = function(){ S.dragging = false; S.dragMode = ''; };
  cv.ontouchstart = function(e){ if(currentSim!=='g5mirror') return; e.preventDefault(); tryDrag(...Object.values(evtPos(e))); };
  cv.ontouchmove  = function(e){ e.preventDefault(); onMove(...Object.values(evtPos(e))); };
  cv.ontouchend   = function(){ S.dragging = false; S.dragMode = ''; };

  function draw() {
    if (currentSim !== 'g5mirror') return;
    const G = getGeom();
    const { w, h, mirX, mirY, srcX, srcY, angleDeg, rad } = G;

    c.fillStyle = '#1a1a2e'; c.fillRect(0,0,w,h);

    // Mirror (vertical)
    const mLen = h * 0.30;
    c.strokeStyle = '#C0C0FF'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(mirX, mirY - mLen); c.lineTo(mirX, mirY + mLen); c.stroke();
    const mirGrad = c.createLinearGradient(mirX-10, 0, mirX+6, 0);
    mirGrad.addColorStop(0,'rgba(200,200,255,0.3)'); mirGrad.addColorStop(1,'rgba(200,200,255,0)');
    c.fillStyle = mirGrad; c.fillRect(mirX-10, mirY-mLen, 16, mLen*2);
    c.strokeStyle='rgba(180,180,255,0.2)'; c.lineWidth=1;
    for(let hy=mirY-mLen; hy<mirY+mLen; hy+=14){
      c.beginPath(); c.moveTo(mirX,hy); c.lineTo(mirX+10,hy+10); c.stroke();
    }
    c.fillStyle='#aac'; c.font=`bold ${Math.max(10,w*0.020)}px Tajawal`; c.textAlign='center';
    c.fillText('مرآة مستوية', mirX+36, Math.min(mirY + mLen + 22, h*0.92));


    // الشعاع الساقط: من srcX,srcY (أعلى يسار) → mirX,mirY
    //   اتجاهه: atan2(dy, dx) حيث dy = mirY-srcY > 0, dx = mirX-srcX > 0
    //   rad = angleDeg * π/180 = الزاوية من الأفق (العمود المقام)
    // الشعاع المنعكس: ينعكس بالنسبة للمرآة الرأسية → dy يُعكس علامته
    //   refEnd: (mirX + dx, mirY - dy) = (mirX + rayLen*cos(rad), mirY - rayLen*sin(rad))
    //   لكن dx = mirX - srcX = rayLen*cos(rad), dy = mirY - srcY = rayLen*sin(rad)
    const refEndX = mirX + (mirX - srcX);   // = mirX + dx (goes right, same horizontal distance)
    const refEndY = mirY - (mirY - srcY);   // = mirY - dy (goes up, symmetric about normal line)

    // Reflected ray (draw first so source glow appears on top)
    c.strokeStyle = '#4AFF9D'; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(mirX, mirY); c.lineTo(refEndX, refEndY); c.stroke();
    const arrowX2 = mirX + (refEndX-mirX)*0.6, arrowY2 = mirY + (refEndY-mirY)*0.6;
    c.save(); c.translate(arrowX2, arrowY2); c.rotate(Math.atan2(refEndY-mirY, refEndX-mirX));
    c.fillStyle='#4AFF9D'; c.beginPath(); c.moveTo(8,0); c.lineTo(-5,4); c.lineTo(-5,-4); c.fill(); c.restore();

    // Incident ray
    c.strokeStyle = '#FFD700'; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(srcX, srcY); c.lineTo(mirX, mirY); c.stroke();
    const arrowFrac = 0.72;
    const arrowX = srcX + (mirX-srcX)*arrowFrac, arrowY = srcY + (mirY-srcY)*arrowFrac;
    c.save(); c.translate(arrowX, arrowY); c.rotate(Math.atan2(mirY-srcY, mirX-srcX));
    c.fillStyle='#FFD700'; c.beginPath(); c.moveTo(8,0); c.lineTo(-5,4); c.lineTo(-5,-4); c.fill(); c.restore();

    // Angle arcs — measured between ray and the VERTICAL mirror surface
    const arcR = Math.min(55, h*0.09);
    const fontSize = Math.max(11, w*0.022);
    const angleText = `${angleDeg}°`;
    c.font = `bold ${fontSize}px Tajawal`;

    // المرآة رأسية:
    //   فوق نقطة الارتطام = -π/2
    // الشعاع الساقط يأتي من أعلى يسار:
    //   incDir ≈ -(π - rad_from_mirror)  →  نحسبها مباشرة
    //   الزاوية من المرآة = angleDeg  →  incDir = -(π/2 + angleDeg°)  لأن الشعاع يسار المرآة
    //   بالـ radians: incDir = -π/2 - rad   (فوق يسار بمقدار angleDeg من المرآة)
    const rad_m = angleDeg * Math.PI / 180;  // زاوية من المرآة بالـ radians
    const mirrorUp = -Math.PI / 2;
    const incAngle  = mirrorUp - rad_m;   // اتجاه الشعاع الساقط (يسار المرآة)
    const refAngle  = mirrorUp + rad_m;   // اتجاه الشعاع المنعكس (يمين المرآة)

    // قوس السقوط: من incAngle إلى mirrorUp (CCW = false → يسير من incAngle باتجاه عقارب الساعة إلى mirrorUp)
    c.strokeStyle = 'rgba(255,215,0,0.85)'; c.lineWidth = 2.5;
    c.beginPath(); c.arc(mirX, mirY, arcR, incAngle, mirrorUp, false); c.stroke();
    const incMid = incAngle + rad_m * 0.5;
    c.fillStyle = '#FFD700'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(angleText, mirX + arcR * 0.68 * Math.cos(incMid), mirY + arcR * 0.68 * Math.sin(incMid));

    // قوس الانعكاس: من mirrorUp إلى refAngle (CCW = false → يسير باتجاه عقارب الساعة)
    c.strokeStyle = 'rgba(74,255,157,0.85)'; c.lineWidth = 2.5;
    c.beginPath(); c.arc(mirX, mirY, arcR, mirrorUp, refAngle, false); c.stroke();
    const refMid = mirrorUp + rad_m * 0.5;
    c.fillStyle = '#4AFF9D';
    c.fillText(angleText, mirX + arcR * 0.68 * Math.cos(refMid), mirY + arcR * 0.68 * Math.sin(refMid));
    c.textBaseline = 'alphabetic';

    // Light source (draggable bulb)
    const srcGlow = c.createRadialGradient(srcX, srcY, 0, srcX, srcY, w*0.07);
    srcGlow.addColorStop(0,'rgba(255,230,80,0.6)'); srcGlow.addColorStop(1,'rgba(255,230,80,0)');
    c.fillStyle=srcGlow; c.beginPath(); c.arc(srcX,srcY,w*0.07,0,Math.PI*2); c.fill();
    c.fillStyle='#FFE040'; c.beginPath(); c.arc(srcX, srcY, Math.max(10,w*0.022), 0, Math.PI*2); c.fill();
    c.strokeStyle= S.dragging ? '#FF8800' : '#CC9900'; c.lineWidth=2; c.stroke();
    c.fillStyle='#FFE880'; c.font=`bold ${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText('💡 مصدر الضوء', srcX, srcY - Math.max(16,w*0.036));
    c.fillStyle='rgba(255,230,150,0.7)'; c.font=`${Math.max(8,w*0.015)}px Tajawal`;
    c.fillText('(اسحب)', srcX, srcY + Math.max(22,w*0.038));

    // ── Handle for stretching/shrinking the ray ──
    const { handleX, handleY } = G;
    const isHandleDrag = S.dragging && S.dragMode === 'handle';
    const hR = Math.max(8, w*0.016);
    const hGlow = c.createRadialGradient(handleX, handleY, 0, handleX, handleY, hR*2.5);
    hGlow.addColorStop(0, isHandleDrag ? 'rgba(255,160,0,0.55)' : 'rgba(255,200,80,0.4)');
    hGlow.addColorStop(1, 'rgba(255,200,80,0)');
    c.fillStyle = hGlow; c.beginPath(); c.arc(handleX, handleY, hR*2.5, 0, Math.PI*2); c.fill();
    c.fillStyle = isHandleDrag ? '#FF9500' : '#FFD700';
    c.beginPath(); c.arc(handleX, handleY, hR, 0, Math.PI*2); c.fill();
    c.strokeStyle = isHandleDrag ? '#FF6600' : 'rgba(255,255,255,0.6)'; c.lineWidth = 2;
    c.stroke();
    // Arrow hints on handle (←→)
    c.fillStyle = 'rgba(255,255,255,0.9)'; c.font = `bold ${Math.max(9, w*0.017)}px sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('↔', handleX, handleY);
    c.textBaseline = 'alphabetic';
    c.fillStyle = 'rgba(255,220,120,0.75)'; c.font = `${Math.max(8,w*0.014)}px Tajawal`; c.textAlign = 'center';
    c.fillText('(مدّد / قصّر)', handleX, handleY + hR + Math.max(13,w*0.026));

    // Eye at reflected ray end
    c.font=`${Math.max(16,w*0.035)}px serif`; c.textAlign='center';
    c.fillText('👁️', refEndX, refEndY + 8);
    c.fillStyle='rgba(100,255,180,0.7)'; c.font=`${Math.max(8,w*0.016)}px Tajawal`;
    c.fillText('العين', refEndX, refEndY + Math.max(22,w*0.045));

    // Ray labels
    const incLabelX = srcX + (mirX-srcX)*0.42, incLabelY = srcY + (mirY-srcY)*0.42 - 14;
    c.fillStyle='#FFD700'; c.font=`bold ${Math.max(9,w*0.019)}px Tajawal`; c.textAlign='center';
    c.fillText('شعاع ساقط', incLabelX, Math.max(18, incLabelY));
    const refLabelX = mirX + (refEndX-mirX)*0.42, refLabelY = mirY + (refEndY-mirY)*0.42 - 14;
    c.fillStyle='#4AFF9D';
    c.fillText('شعاع منعكس', refLabelX, Math.max(18, refLabelY));

    // Law bar
    const lawText = `قانون الانعكاس: ${angleDeg}° = ${angleDeg}° ✅`;
    const lawFontSz = Math.max(11, Math.min(w*0.022, 17));
    c.font = `bold ${lawFontSz}px Tajawal`;
    const lawW = c.measureText(lawText).width + 28;
    const lawY = h * 0.93;
    c.fillStyle = 'rgba(10,10,30,0.88)';
    c.beginPath(); c.roundRect((w-Math.min(lawW,w*0.96))/2, lawY - lawFontSz - 4, Math.min(lawW, w*0.96), lawFontSz + 16, 8); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.92)'; c.textAlign = 'center';
    c.fillText(lawText, w/2, lawY);

    c.fillStyle='rgba(160,160,220,0.65)'; c.font=`${Math.max(9,w*0.017)}px Tajawal`;
    c.fillText('اسحب 💡 لتغيير الزاوية — اسحب ↔ على الشعاع لتمديده أو تقصيره', w/2, h * 0.975);
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}
function simG5MirrorCurved() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">🔄 نوع المرآة</div>
  <button class="ctrl-btn" onclick="simState.curvedInit=false;simState.mirrorType=0;simG5MirrorCurved()" style="margin-bottom:6px">🔭 مقعّرة (تجمّع)</button>
  <button class="ctrl-btn" onclick="simState.curvedInit=false;simState.mirrorType=1;simG5MirrorCurved()">🚗 محدّبة (تشتيت)</button>
  <div class="ctrl-desc">أو انقر مباشرة على الكانفاس للتبديل</div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">💡 الفرق بينهما</div>
  <div class="ctrl-desc">
    🔭 <b>المقعّرة:</b> تجمّع الأشعة في البؤرة — تُكبّر الصورة (التلسكوبات، المصابيح)<br>
    🚗 <b>المحدّبة:</b> تشتّت الأشعة — رؤية أوسع (مرايا السيارات، المتاجر)
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٤ · د٢-ب):</strong><br>
  أين تُستخدم المرايا المقعّرة في الحياة؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">المصابيح الأمامية للسيارات، تلسكوبات الفضاء، الأطباق اللاقطة للشمس، مرايا الحلاقة المكبّرة.</div>
</div>`;
  const cv = document.getElementById('simCanvas');
  const c = cv.getContext('2d');
  const w = cv.width, h = cv.height;
  const S = simState;
  if (!S.curvedInit) {
    S.curvedInit = true;
    S.mirrorType = 0; // 0=concave, 1=convex
    S.objDist = 0.5;
    cv.onclick = function() { S.mirrorType = 1 - S.mirrorType; };
  }
  function draw() {
    if (currentSim !== 'g5mirror') return;
    c.fillStyle = '#0d1120'; c.fillRect(0,0,w,h);
    const cx2 = w*0.55, cy2 = h*0.5;
    const R = h*0.4;
    const isConcave = S.mirrorType === 0;
    // Draw curved mirror arc
    c.strokeStyle = '#8888FF'; c.lineWidth = 4;
    c.beginPath();
    if (isConcave) {
      c.arc(cx2 + R*0.3, cy2, R*0.7, Math.PI*0.6, Math.PI*1.4);
    } else {
      c.arc(cx2 - R*0.3, cy2, R*0.7, -Math.PI*0.4, Math.PI*0.4);
    }
    c.stroke();
    const typeLabel = isConcave ? 'مرآة مقعّرة (تجمّع)' : 'مرآة محدّبة (تشتيت)';
    c.fillStyle='#aac'; c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`; c.textAlign='center';
    c.fillText(typeLabel, cx2, h*0.88);
    c.fillStyle='rgba(200,200,255,0.6)'; c.font=`${Math.max(9,w*0.019)}px Tajawal`;
    c.fillText('انقر للتبديل بين المرآتين', cx2, h*0.93);
    // Draw rays
    const numRays = 5;
    for (let i = 0; i < numRays; i++) {
      const ry = cy2 + (i - numRays/2) * h * 0.08;
      c.strokeStyle = `hsl(${50 + i*20},100%,65%)`; c.lineWidth = 1.8;
      c.beginPath(); c.moveTo(w*0.05, ry); c.lineTo(cx2, ry); c.stroke();
      if (isConcave) {
        // Rays converge to focal point
        const fp = cx2 - h*0.15;
        c.beginPath(); c.moveTo(cx2, ry); c.lineTo(fp, cy2); c.stroke();
      } else {
        // Rays diverge
        const ang = (ry - cy2) / (h * 0.5) * 0.4;
        c.beginPath(); c.moveTo(cx2, ry);
        c.lineTo(cx2 - h*0.3, ry - Math.sin(ang)*h*0.35); c.stroke();
      }
    }
    if (isConcave) {
      const fp = cx2 - h*0.15;
      c.fillStyle='#FFD700'; c.font=`${Math.max(16,w*0.035)}px serif`;
      c.fillText('🔥', fp-10, cy2+8);
      c.fillStyle='#FFD700'; c.font=`${Math.max(9,w*0.019)}px Tajawal`; c.textAlign='center';
      c.fillText('البؤرة', fp, cy2-16);
    }
    c.fillStyle='rgba(255,255,255,0.8)'; c.font=`bold ${Math.max(11,w*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText(isConcave ? '🔭 المرآة المقعّرة تجمّع الأشعة المتوازية في نقطة واحدة' : '🚗 المرآة المحدّبة تشتّت الأشعة وتعطي رؤية أوسع', w/2, h*0.1);
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG5BehindYou() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">🔍 رؤية ما خلفك</div>
  <div class="ctrl-desc">
    <b>اسحب المرآة</b> لتحريكها يميناً/يساراً/أعلى/أسفل<br>
    <b>اسحب طرف المرآة</b> لتغيير ميلها
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">📌 تطبيقات في الحياة</div>
  <div class="ctrl-desc">
    🚗 مرايا السيارة الجانبية والخلفية<br>
    🏪 مرايا زوايا المتاجر والمستشفيات<br>
    💈 مرايا صالونات الحلاقة المزدوجة
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٤ · د٣):</strong><br>
  لماذا تستخدم الحافلات مرايا كبيرة جانبية؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">لأن الحافلة طويلة والسائق لا يستطيع رؤية ما حولها مباشرة — المرايا تعكس الضوء القادم من الجوانب وتُوسّع مجال الرؤية.</div>
</div>`;
  const cv = document.getElementById('simCanvas');
  const c = cv.getContext('2d');
  const S = simState;

  if (!S.bInit) {
    S.bInit = true; S.t = 0;
    // Mirror: center position + tilt angle
    S.mCX = 0.80; S.mCY = 0.50;   // center (0..1)
    S.mTilt = 45;                   // degrees (20..70)
    S.mHalf = 0.22;                 // half-length in canvas height fraction

    S.dragMode = null; // 'body' | 'tip'

    function getPointer(e) {
      const rect = cv.getBoundingClientRect();
      const src = e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e;
      return {
        fx: (src.clientX - rect.left) / rect.width,
        fy: (src.clientY - rect.top)  / rect.height
      };
    }
    function onDown(e) {
      const p = getPointer(e);
      const w2 = cv.width, h2 = cv.height;
      const mTiltRad = (S.mTilt - 45) * Math.PI / 180;
      const mHh = S.mHalf * h2;
      const tipX = S.mCX * w2 + Math.sin(mTiltRad) * mHh;
      const tipY = S.mCY * h2 - Math.cos(mTiltRad) * mHh;
      const px = p.fx * w2, py = p.fy * h2;
      // Check if near tip
      if (Math.hypot(px - tipX, py - tipY) < 25) { S.dragMode = 'tip'; return; }
      // Check if near center
      if (Math.hypot(px - S.mCX*w2, py - S.mCY*h2) < mHh * 0.6) { S.dragMode = 'body'; S._dox = px - S.mCX*w2; S._doy = py - S.mCY*h2; }
    }
    function onMove(e) {
      if (!S.dragMode) return;
      const p = getPointer(e);
      const w2 = cv.width, h2 = cv.height;
      if (S.dragMode === 'body') {
        S.mCX = Math.max(0.42, Math.min(0.95, (p.fx*w2 - S._dox) / w2));
        S.mCY = Math.max(0.18, Math.min(0.82, (p.fy*h2 - S._doy) / h2));
      } else if (S.dragMode === 'tip') {
        const dx = p.fx - S.mCX, dy = p.fy - S.mCY;
        // angle from center to tip: tip is at top
        const ang = Math.atan2(dx, -dy) * 180/Math.PI; // degrees from vertical
        S.mTilt = Math.max(20, Math.min(70, 45 + ang));
      }
    }
    function onUp() { S.dragMode = null; }
    cv.addEventListener('mousedown', onDown);
    cv.addEventListener('mousemove', onMove);
    cv.addEventListener('mouseup', onUp);
    cv.addEventListener('touchstart', e=>{e.preventDefault();onDown(e);},{passive:false});
    cv.addEventListener('touchmove',  e=>{e.preventDefault();onMove(e);},{passive:false});
    cv.addEventListener('touchend',   e=>{e.preventDefault();onUp();},{passive:false});
  }

  function drawArrow(ctx, x1, y1, x2, y2, color) {
    const ang = Math.atan2(y2-y1, x2-x1);
    const mx2 = x1+(x2-x1)*0.55, my2 = y1+(y2-y1)*0.55;
    ctx.fillStyle = color;
    ctx.save(); ctx.translate(mx2, my2); ctx.rotate(ang);
    ctx.beginPath(); ctx.moveTo(9,0); ctx.lineTo(-5,4); ctx.lineTo(-5,-4); ctx.fill();
    ctx.restore();
  }

  function draw() {
    if (currentSim !== 'g5behindyou') return;
    const w = cv.width, h = cv.height;
    S.t += 0.02;
    c.fillStyle = '#111'; c.fillRect(0,0,w,h);

    // Background grid
    c.strokeStyle='rgba(255,255,255,0.04)'; c.lineWidth=1;
    for(let gx=0;gx<w;gx+=40){c.beginPath();c.moveTo(gx,0);c.lineTo(gx,h);c.stroke();}
    for(let gy=0;gy<h;gy+=40){c.beginPath();c.moveTo(0,gy);c.lineTo(w,gy);c.stroke();}

    // Mirror geometry
    const mTiltRad = (S.mTilt - 45) * Math.PI / 180;
    const mHh = S.mHalf * h;
    const mcx = S.mCX * w, mcy = S.mCY * h;
    const mTopX = mcx + Math.sin(mTiltRad)*mHh,  mTopY = mcy - Math.cos(mTiltRad)*mHh;
    const mBotX = mcx - Math.sin(mTiltRad)*mHh,  mBotY = mcy + Math.cos(mTiltRad)*mHh;

    // Light source (lamp) - fixed top-left area
    const lampX = w*0.08, lampY = h*0.20;
    const lampGlow = c.createRadialGradient(lampX,lampY,0,lampX,lampY,w*0.07);
    lampGlow.addColorStop(0,'rgba(255,230,80,0.7)'); lampGlow.addColorStop(1,'rgba(255,230,80,0)');
    c.fillStyle=lampGlow; c.beginPath(); c.arc(lampX,lampY,w*0.07,0,Math.PI*2); c.fill();
    c.fillStyle='#FFE040'; c.beginPath(); c.arc(lampX,lampY,Math.max(7,w*0.016),0,Math.PI*2); c.fill();
    c.fillStyle='#FFE880'; c.font=`bold ${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='center';
    c.fillText('💡 مصدر الضوء', lampX, lampY - Math.max(13,w*0.030));

    // Object (gift box) - left side
    const ox = w*0.18, oy = h*0.52;
    c.font=`${Math.max(28,w*0.055)}px serif`; c.textAlign='center';
    c.fillText('🎁', ox, oy+10);
    c.fillStyle='rgba(255,200,200,0.85)'; c.font=`bold ${Math.max(9,w*0.019)}px Tajawal`; c.textAlign='center';
    c.fillText('الجسم', ox, oy+Math.max(28,w*0.056));

    // Person (viewer) - left-center
    const px2 = w*0.38, py2 = h*0.55;
    c.font=`${Math.max(28,w*0.058)}px serif`; c.textAlign='center';
    c.fillText('🧑', px2, py2);
    c.fillStyle='rgba(255,255,255,0.7)'; c.font=`bold ${Math.max(9,w*0.019)}px Tajawal`;
    c.fillText('المشاهد 👁️', px2, py2+Math.max(28,w*0.056));

    // ── Mirror normal vector (perpendicular to mirror surface) ──
    const mirrorDX = mTopX - mBotX, mirrorDY = mTopY - mBotY;
    const mirrorLen = Math.sqrt(mirrorDX*mirrorDX + mirrorDY*mirrorDY);
    // Normal pointing left (away from right side)
    const nx = -mirrorDY/mirrorLen, ny = mirrorDX/mirrorLen;
    const nxLeft = nx < 0 ? nx : -nx; // ensure pointing generally left
    const nyLeft = nx < 0 ? ny : -ny;

    // ── RAY 1: lamp → object (animated photons) ──
    c.strokeStyle='rgba(255,220,60,0.55)'; c.lineWidth=1.5; c.setLineDash([5,4]);
    c.beginPath(); c.moveTo(lampX, lampY); c.lineTo(ox, oy-10); c.stroke(); c.setLineDash([]);
    // Two staggered photons on lamp→object ray
    const pTL1 = (Date.now() % 900) / 900;
    const pTL2 = (pTL1 + 0.5) % 1;
    [[pTL1,'rgba(255,235,100,1)','rgba(255,220,60,0)'],[pTL2,'rgba(255,250,160,1)','rgba(255,220,60,0)']].forEach(([t,c0,c1])=>{
      const bpx = lampX + (ox - lampX)*t, bpy = lampY + (oy-10 - lampY)*t;
      const bpg = c.createRadialGradient(bpx,bpy,0,bpx,bpy,7);
      bpg.addColorStop(0,c0); bpg.addColorStop(1,c1);
      c.fillStyle=bpg; c.beginPath(); c.arc(bpx,bpy,7,0,Math.PI*2); c.fill();
    });

    // ── RAY 2: object → mirror (hits center) ──
    const toMirAngle = Math.atan2(mcy - oy, mcx - ox);
    c.strokeStyle='#FFD700'; c.lineWidth=2.5; c.setLineDash([7,4]);
    c.beginPath(); c.moveTo(ox, oy); c.lineTo(mcx, mcy); c.stroke(); c.setLineDash([]);
    drawArrow(c, ox, oy, mcx, mcy, '#FFD700');

    // ── RAY 3: reflected → viewer (المشاهد يرى الجسم) ──
    const idx2 = mcx - ox, idy = mcy - oy;
    const iLen = Math.sqrt(idx2*idx2+idy*idy);
    const inX = idx2/iLen, inY = idy/iLen;
    const dot = inX*nxLeft + inY*nyLeft;
    const refX = inX - 2*dot*nxLeft;
    const refY = inY - 2*dot*nyLeft;
    const refLen = Math.max(w,h)*0.8;
    const refEndX = mcx + refX*refLen, refEndY = mcy + refY*refLen;
    // clip to canvas
    const tMax = Math.min(
      refX !== 0 ? (refX>0?(w-mcx)/refX:(-mcx)/refX) : Infinity,
      refY !== 0 ? (refY>0?(h-mcy)/refY:(-mcy)/refY) : Infinity
    );
    const rfx = mcx + refX*Math.min(refLen,tMax*0.9);
    const rfy = mcy + refY*Math.min(refLen,tMax*0.9);
    c.strokeStyle='#FF9900'; c.lineWidth=2.5; c.setLineDash([7,4]);
    c.beginPath(); c.moveTo(mcx, mcy); c.lineTo(rfx, rfy); c.stroke(); c.setLineDash([]);
    drawArrow(c, mcx, mcy, rfx, rfy, '#FF9900');

    // Animated photon on object→mirror ray
    const pT = (Date.now() % 1000) / 1000;
    const ppx = ox + (mcx-ox)*pT, ppy = oy + (mcy-oy)*pT;
    const pg = c.createRadialGradient(ppx,ppy,0,ppx,ppy,8);
    pg.addColorStop(0,'rgba(255,230,80,1)'); pg.addColorStop(1,'rgba(255,230,80,0)');
    c.fillStyle=pg; c.beginPath(); c.arc(ppx,ppy,8,0,Math.PI*2); c.fill();
    // Animated photon on mirror→viewer ray
    const pT2 = (pT + 0.5) % 1;
    const ppx2 = mcx + (rfx-mcx)*pT2, ppy2 = mcy + (rfy-mcy)*pT2;
    const pg2 = c.createRadialGradient(ppx2,ppy2,0,ppx2,ppy2,8);
    pg2.addColorStop(0,'rgba(255,180,60,1)'); pg2.addColorStop(1,'rgba(255,180,60,0)');
    c.fillStyle=pg2; c.beginPath(); c.arc(ppx2,ppy2,8,0,Math.PI*2); c.fill();

    // ── Mirror surface ──
    // Sheen
    c.strokeStyle='rgba(180,180,255,0.22)'; c.lineWidth=14;
    c.beginPath(); c.moveTo(mTopX,mTopY); c.lineTo(mBotX,mBotY); c.stroke();
    // Main line
    c.strokeStyle='#C0C0FF'; c.lineWidth=5;
    c.beginPath(); c.moveTo(mTopX,mTopY); c.lineTo(mBotX,mBotY); c.stroke();
    // Tip handle (draggable indicator)
    c.fillStyle='rgba(200,200,255,0.8)'; c.beginPath(); c.arc(mTopX,mTopY,7,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(100,100,200,0.9)'; c.font=`${Math.max(8,w*0.016)}px Tajawal`; c.textAlign='center';
    c.fillText('↕ اسحب للإمالة', mTopX, mTopY - 12);
    // Mirror body drag hint
    c.fillStyle='rgba(180,180,255,0.6)'; c.font=`bold ${Math.max(8,w*0.017)}px Tajawal`; c.textAlign='center';
    c.fillText('مرآة', mcx+22, mcy);
    c.font=`${Math.max(7,w*0.014)}px Tajawal`;
    c.fillText('(اسحب لتحريك)', mcx+22, mcy+14);

    // Normal dashed
    c.strokeStyle='rgba(255,255,255,0.2)'; c.lineWidth=1; c.setLineDash([4,4]);
    c.beginPath(); c.moveTo(mcx - nxLeft*45, mcy - nyLeft*45); c.lineTo(mcx + nxLeft*60, mcy + nyLeft*60); c.stroke();
    c.setLineDash([]);

    // ── Light path label sequence ──
    const seqY = h*0.93;
    const seqFontSz = Math.max(10, Math.min(w*0.020, 15));
    const seqText = '🧑 المشاهد  ←  المرآة  ←  الجسم  ←  مصدر الضوء 💡';
    c.font=`bold ${seqFontSz}px Tajawal`;
    const seqW = c.measureText(seqText).width + 28;
    const seqX = (w - seqW) / 2;
    c.fillStyle='rgba(0,0,0,0.65)';
    c.beginPath(); c.roundRect(seqX, seqY-seqFontSz-4, Math.min(seqW,w*0.96), seqFontSz+18, 8); c.fill();
    c.fillStyle='rgba(255,220,100,0.95)'; c.textAlign='center';
    c.fillText(seqText, w/2, seqY);

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}


// ===== الصف السادس — الشغل المبذول =====

function simG6Work1() {
  // TAB 1: ملعب كرة القدم — الشغل مبذول أم لا؟
  const panel = document.getElementById('simControlsPanel');
  panel.innerHTML = `
<div class="ctrl-section">
  <div class="ctrl-label">⚽ استقصاء الشغل المبذول</div>
  <div class="ctrl-desc">الشغل = القوة × المسافة<br>غيّر قوة الركلة وشاهد كيف يتغيّر الشغل!</div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">💪 قوة الركلة</div>
  <div style="display:flex;flex-direction:column;gap:8px;margin-top:6px;" id="force-btns">
    <button onclick="window._setForce(100,this)" style="width:100%;padding:10px 14px;border-radius:10px;border:2px solid #E0E0E0;background:white;font-family:Tajawal;font-size:14px;font-weight:700;cursor:pointer;text-align:right;transition:all 0.2s;">
      🟢 ركلة خفيفة — <span style="color:#27AE60;">100 نيوتن</span>
    </button>
    <button onclick="window._setForce(200,this)" style="width:100%;padding:10px 14px;border-radius:10px;border:2px solid #E0E0E0;background:white;font-family:Tajawal;font-size:14px;font-weight:700;cursor:pointer;text-align:right;transition:all 0.2s;">
      🟡 ركلة متوسطة — <span style="color:#D4901A;">200 نيوتن</span>
    </button>
    <button onclick="window._setForce(350,this)" style="width:100%;padding:10px 14px;border-radius:10px;border:2px solid #E0E0E0;background:white;font-family:Tajawal;font-size:14px;font-weight:700;cursor:pointer;text-align:right;transition:all 0.2s;">
      🔴 ركلة قوية — <span style="color:#C0392B;">350 نيوتن</span>
    </button>
  </div>
</div>
<div class="ctrl-section" id="kick-ctrl">
  <div id="kick-status" style="padding:10px;border-radius:10px;background:rgba(192,57,43,0.1);border:1.5px solid rgba(192,57,43,0.3);color:#C0392B;font-family:Tajawal;font-size:14px;font-weight:700;text-align:center;margin-bottom:10px;">
    ⛔ اختر قوة الركلة أولاً
  </div>
  <button id="kick-btn" onclick="window._kickBall && window._kickBall()" disabled style="width:100%;padding:13px;border-radius:12px;background:#ccc;color:white;border:none;font-family:Tajawal;font-size:16px;font-weight:700;cursor:not-allowed;opacity:0.7;">
    ⚽ اركل الكرة!
  </button>
</div>
<div class="ctrl-section" id="work-result" style="display:none">
  <div class="ctrl-label">📊 النتيجة</div>
  <div id="work-calc" style="font-family:Tajawal;font-size:13px;line-height:2;padding:8px;background:rgba(39,174,96,0.08);border-radius:10px;border:1.5px solid rgba(39,174,96,0.25);">
  </div>
</div>
<div class="q-box" style="margin-top:12px">
  <strong>❓ سؤال:</strong> متى يُبذل الشغل على جسم ما؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 الإجابة</button>
  <div class="q-ans-panel">يُبذل الشغل فقط عندما تؤثر قوة في جسم <strong>ويتحرك</strong> في اتجاه القوة. إذا لم يتحرك الجسم → الشغل = صفر.</div>
</div>`;

  const cv = document.getElementById('simCanvas');
  const c = cv.getContext('2d');
  const w = cv.width, h = cv.height;
  const S = simState;

  // State
  S.w1 = S.w1 || { phase: 'idle', ballX: 0, ballY: 0, ballVx: 0, kicked: false, trail: [], t: 0, force: null };
  const ws = S.w1;
  ws.phase = 'idle';
  ws.kicked = false;
  ws.trail = [];
  ws.t = 0;
  ws.force = null;

  // Field dimensions
  const fieldX = w * 0.05, fieldY = h * 0.22, fieldW = w * 0.9, fieldH = h * 0.55;
  const goalW = fieldW * 0.08, goalH = fieldH * 0.3;
  const boyX = fieldX + fieldW * 0.25;
  const boyY = fieldY + fieldH * 0.62;
  ws.ballX = boyX + fieldW * 0.1;
  ws.ballY = fieldY + fieldH * 0.68;
  const goalX = fieldX + fieldW - goalW;
  const goalY = fieldY + fieldH * 0.35;

  // Force colours
  const FORCE_COLORS = { 100: '#27AE60', 200: '#D4901A', 350: '#C0392B' };
  const FORCE_SPEEDS = { 100: 0.007, 200: 0.012, 350: 0.019 };

  window._setForce = function(f, btn) {
    ws.force = f;
    // Reset sim if ball was kicked
    if (ws.kicked) {
      ws.kicked = false;
      ws.phase = 'idle';
      ws.trail = [];
      ws.ballX = boyX + fieldW * 0.1;
      ws.ballY = fieldY + fieldH * 0.68;
      ws.ballVx = 0;
      document.getElementById('work-result').style.display = 'none';
    }
    // Highlight selected button
    document.querySelectorAll('#force-btns button').forEach(b => {
      b.style.background = 'white';
      b.style.borderColor = '#E0E0E0';
      b.style.transform = '';
    });
    btn.style.background = FORCE_COLORS[f] + '18';
    btn.style.borderColor = FORCE_COLORS[f];
    btn.style.transform = 'scale(1.02)';
    // Enable kick button
    const kickBtn = document.getElementById('kick-btn');
    kickBtn.disabled = false;
    kickBtn.style.background = `linear-gradient(135deg,${FORCE_COLORS[f]},${FORCE_COLORS[f]}cc)`;
    kickBtn.style.cursor = 'pointer';
    kickBtn.style.opacity = '1';
    kickBtn.textContent = '⚽ اركل الكرة!';
    const st = document.getElementById('kick-status');
    st.style.background = FORCE_COLORS[f] + '18';
    st.style.borderColor = FORCE_COLORS[f] + '55';
    st.style.color = FORCE_COLORS[f];
    st.textContent = `💪 القوة المختارة: ${f} نيوتن — جاهز للركل!`;
  };

  window._kickBall = function() {
    if (!ws.force) return;
    if (ws.kicked) {
      // Reset
      ws.kicked = false;
      ws.phase = 'idle';
      ws.trail = [];
      ws.ballX = boyX + fieldW * 0.1;
      ws.ballY = fieldY + fieldH * 0.68;
      ws.ballVx = 0;
      document.getElementById('kick-btn').textContent = '⚽ اركل الكرة!';
      const st = document.getElementById('kick-status');
      st.style.background = FORCE_COLORS[ws.force] + '18';
      st.style.borderColor = FORCE_COLORS[ws.force] + '55';
      st.style.color = FORCE_COLORS[ws.force];
      st.textContent = `💪 القوة المختارة: ${ws.force} نيوتن — جاهز للركل!`;
      document.getElementById('work-result').style.display = 'none';
      return;
    }
    ws.kicked = true;
    ws.phase = 'moving';
    ws.ballVx = fieldW * FORCE_SPEEDS[ws.force];
    document.getElementById('kick-btn').textContent = '🔄 أعِد التجربة';
    const st = document.getElementById('kick-status');
    st.style.background = 'rgba(39,174,96,0.1)';
    st.style.borderColor = 'rgba(39,174,96,0.3)';
    st.style.color = '#1e8449';
    st.textContent = '✅ الكرة تتحرك — يُبذل شغل! 🎉';
  };

  function drawField() {
    // Sky gradient
    const sky = c.createLinearGradient(0,0,0,fieldY);
    sky.addColorStop(0,'#87CEEB'); sky.addColorStop(1,'#B8E0F0');
    c.fillStyle = sky; c.fillRect(0,0,w,fieldY+10);

    // Grass
    const grass = c.createLinearGradient(fieldX, fieldY, fieldX, fieldY+fieldH);
    grass.addColorStop(0,'#2E8B3A'); grass.addColorStop(1,'#1E6B2A');
    c.fillStyle = grass; c.fillRect(fieldX, fieldY, fieldW, fieldH);

    // Field stripes
    for (let i=0; i<8; i++) {
      const stripW = fieldW/8;
      if (i%2===0) { c.fillStyle='rgba(255,255,255,0.04)'; c.fillRect(fieldX+i*stripW, fieldY, stripW, fieldH); }
    }

    // Field lines
    c.strokeStyle='rgba(255,255,255,0.6)'; c.lineWidth=2;
    // Border
    c.strokeRect(fieldX+2, fieldY+2, fieldW-4, fieldH-4);
    // Center line
    c.beginPath(); c.moveTo(fieldX+fieldW/2, fieldY+2); c.lineTo(fieldX+fieldW/2, fieldY+fieldH-2); c.stroke();
    // Center circle
    c.beginPath(); c.arc(fieldX+fieldW/2, fieldY+fieldH/2, fieldH*0.18, 0, Math.PI*2); c.stroke();
    // Center dot
    c.fillStyle='white'; c.beginPath(); c.arc(fieldX+fieldW/2, fieldY+fieldH/2, 4, 0, Math.PI*2); c.fill();

    // Goal posts (right side)
    c.fillStyle='white'; c.lineWidth=3;
    c.strokeStyle='white';
    c.strokeRect(goalX, goalY, goalW, goalH);
    c.fillStyle='rgba(255,255,255,0.1)'; c.fillRect(goalX, goalY, goalW, goalH);

    // Goal net lines
    c.strokeStyle='rgba(255,255,255,0.25)'; c.lineWidth=0.8;
    for (let nx=goalX; nx<goalX+goalW; nx+=12) {
      c.beginPath(); c.moveTo(nx, goalY); c.lineTo(nx, goalY+goalH); c.stroke();
    }
    for (let ny=goalY; ny<goalY+goalH; ny+=10) {
      c.beginPath(); c.moveTo(goalX, ny); c.lineTo(goalX+goalW, ny); c.stroke();
    }
  }

  function drawBoy(bx, by, kicked) {
    const sc = h * 0.0012;
    // Shadow
    c.fillStyle='rgba(0,0,0,0.15)';
    c.beginPath(); c.ellipse(bx, by+2, 16*sc*50, 5*sc*50, 0, 0, Math.PI*2); c.fill();

    // Legs
    c.strokeStyle='#1565C0'; c.lineWidth=5;
    // Left leg
    c.beginPath(); c.moveTo(bx, by-20); c.lineTo(bx-12, by); c.stroke();
    // Right leg (kicked)
    c.beginPath();
    if (kicked && ws.phase==='moving') {
      c.moveTo(bx, by-20); c.lineTo(bx+18, by-10);
    } else {
      c.moveTo(bx, by-20); c.lineTo(bx+10, by);
    }
    c.stroke();
    // Shoes
    c.fillStyle='#1A1A1A';
    c.beginPath(); c.ellipse(bx-12, by+3, 8, 4, 0, 0, Math.PI*2); c.fill();
    c.beginPath();
    if (kicked && ws.phase==='moving') {
      c.ellipse(bx+18, by-8, 9, 4, -0.4, 0, Math.PI*2);
    } else {
      c.ellipse(bx+10, by+3, 8, 4, 0, 0, Math.PI*2);
    }
    c.fill();

    // Body
    c.fillStyle='#E53935'; c.lineWidth=2; c.strokeStyle='#B71C1C';
    c.beginPath(); c.roundRect(bx-12, by-55, 24, 35, 5); c.fill(); c.stroke();
    // Arms
    c.strokeStyle='#E53935'; c.lineWidth=5;
    if (kicked && ws.phase==='moving') {
      c.beginPath(); c.moveTo(bx-10, by-45); c.lineTo(bx-28, by-30); c.stroke();
      c.beginPath(); c.moveTo(bx+10, by-45); c.lineTo(bx+22, by-25); c.stroke();
    } else {
      c.beginPath(); c.moveTo(bx-10, by-45); c.lineTo(bx-22, by-32); c.stroke();
      c.beginPath(); c.moveTo(bx+10, by-45); c.lineTo(bx+22, by-32); c.stroke();
    }
    // Head
    c.fillStyle='#FFCC80';
    c.beginPath(); c.arc(bx, by-65, 15, 0, Math.PI*2); c.fill();
    c.strokeStyle='#FF9800'; c.lineWidth=1.5; c.stroke();
    // Hair
    c.fillStyle='#5D3A1A';
    c.beginPath(); c.arc(bx, by-75, 12, Math.PI, Math.PI*2); c.fill();
    // Eyes
    c.fillStyle='#333';
    c.beginPath(); c.arc(bx-5, by-66, 2, 0, Math.PI*2); c.fill();
    c.beginPath(); c.arc(bx+5, by-66, 2, 0, Math.PI*2); c.fill();
    // Smile
    c.strokeStyle='#333'; c.lineWidth=1.5;
    c.beginPath(); c.arc(bx, by-60, 6, 0.2, Math.PI-0.2); c.stroke();
  }

  function drawBall(bx, by) {
    // Ball shadow
    c.fillStyle='rgba(0,0,0,0.2)';
    c.beginPath(); c.ellipse(bx, by+12, 12, 4, 0, 0, Math.PI*2); c.fill();
    // Ball
    const ballR = Math.max(10, w*0.022);
    const ballGrad = c.createRadialGradient(bx-3, by-3, 1, bx, by, ballR);
    ballGrad.addColorStop(0,'#ffffff'); ballGrad.addColorStop(0.5,'#eeeeee'); ballGrad.addColorStop(1,'#cccccc');
    c.fillStyle = ballGrad;
    c.beginPath(); c.arc(bx, by, ballR, 0, Math.PI*2); c.fill();
    c.strokeStyle='#555'; c.lineWidth=1.5; c.stroke();
    // Pentagon patches
    c.fillStyle='#222';
    const patches = [
      [0,-ballR*0.5],[ballR*0.4,ballR*0.3],[-ballR*0.4,ballR*0.3]
    ];
    patches.forEach(([px,py])=>{
      c.beginPath();
      for (let a=0;a<5;a++) {
        const ang = a*Math.PI*2/5 - Math.PI/2;
        const pr = ballR*0.28;
        a===0 ? c.moveTo(bx+px+Math.cos(ang)*pr, by+py+Math.sin(ang)*pr)
               : c.lineTo(bx+px+Math.cos(ang)*pr, by+py+Math.sin(ang)*pr);
      }
      c.closePath(); c.fill();
    });
  }

  function draw() {
    if (currentSim !== 'g6work') return;
    ws.t += 0.03;

    c.fillStyle = '#87CEEB'; c.fillRect(0,0,w,h);
    drawField();

    // Trail
    if (ws.trail.length > 1) {
      for (let ti=1; ti<ws.trail.length; ti++) {
        const alpha = (ti/ws.trail.length)*0.6;
        c.strokeStyle = `rgba(255,200,50,${alpha})`;
        c.lineWidth = Math.max(1, ti/ws.trail.length*4);
        c.setLineDash([6,4]);
        c.beginPath();
        c.moveTo(ws.trail[ti-1].x, ws.trail[ti-1].y);
        c.lineTo(ws.trail[ti].x, ws.trail[ti].y);
        c.stroke();
      }
      c.setLineDash([]);
      // Distance arrow
      if (ws.trail.length > 5) {
        const tx0 = ws.trail[0].x, ty0 = ws.trail[0].y;
        const txN = ws.trail[ws.trail.length-1].x, tyN = ws.trail[ws.trail.length-1].y;
        const dist = Math.round((txN-tx0)/fieldW*100*10)/10;
        c.strokeStyle='#FFD700'; c.fillStyle='#FFD700'; c.lineWidth=2; c.setLineDash([]);
        c.beginPath(); c.moveTo(tx0, ty0+24); c.lineTo(txN, tyN+24);
        // Arrow heads
        c.moveTo(txN, tyN+24); c.lineTo(txN-8, tyN+19); c.moveTo(txN, tyN+24); c.lineTo(txN-8, tyN+29);
        c.stroke();
        c.font=`bold ${Math.max(10,w*0.018)}px Tajawal`; c.textAlign='center';
        c.fillText(`المسافة: ${dist} م`, (tx0+txN)/2, ty0+44);
      }
    }

    // Update ball position
    if (ws.phase === 'moving' && ws.ballX < goalX + goalW/2) {
      ws.trail.push({ x: ws.ballX, y: ws.ballY });
      if (ws.trail.length > 80) ws.trail.shift();
      ws.ballX += ws.ballVx;
      ws.ballVx *= 0.997;
      // Slight bounce
      ws.ballY = fieldY + fieldH * 0.68 - Math.abs(Math.sin(ws.t * 8)) * 8;

      // Show result when ball reaches goal area
      if (ws.ballX > fieldX + fieldW * 0.55) {
        const distM = Math.round((ws.ballX - (boyX + fieldW * 0.1)) / fieldW * 10 * 10) / 10;
        const force = ws.force || 200;
        const work = Math.round(force * distM);
        const col = FORCE_COLORS[force];
        const wr = document.getElementById('work-result');
        if (wr) {
          wr.style.display = 'block';
          document.getElementById('work-calc').innerHTML =
            `💪 <strong>القوة المبذولة:</strong> <span style="color:${col};font-weight:900;">${force} نيوتن</span><br>` +
            `📏 <strong>المسافة المقطوعة:</strong> ${distM} متر<br>` +
            `━━━━━━━━━━━━━━━━━<br>` +
            `📐 الشغل = القوة × المسافة<br>` +
            `🟢 <strong style="color:${col};">الشغل = ${force} × ${distM} = ${work} جول</strong>`;
        }
      }
    }

    // Draw boy
    drawBoy(boyX, boyY, ws.kicked);

    // Draw ball
    drawBall(ws.ballX, ws.ballY);

    // Status label above scene
    c.fillStyle='rgba(0,0,0,0.55)';
    c.beginPath(); c.roundRect(w*0.1, h*0.04, w*0.8, h*0.11, 12); c.fill();
    c.fillStyle='white';
    c.font=`bold ${Math.max(11,w*0.022)}px Tajawal`;
    c.textAlign='center';
    if (!ws.kicked) {
      c.fillText('⛔ الكرة ساكنة — الشغل المبذول = صفر', w/2, h*0.1);
    } else {
      c.fillStyle='#4DF';
      c.fillText('✅ الكرة تتحرك — يُبذل شغل!', w/2, h*0.1);
    }

    // Arrow showing force direction when kicked
    if (ws.kicked && ws.phase==='moving' && ws.ballX < goalX) {
      const arrowCol = (ws.force && FORCE_COLORS[ws.force]) || '#FF4444';
      c.strokeStyle=arrowCol; c.fillStyle=arrowCol; c.lineWidth=3;
      const arrowY = ws.ballY - 28;
      c.beginPath(); c.moveTo(ws.ballX-30, arrowY); c.lineTo(ws.ballX+30, arrowY); c.stroke();
      c.beginPath(); c.moveTo(ws.ballX+30, arrowY); c.lineTo(ws.ballX+18, arrowY-7); c.lineTo(ws.ballX+18, arrowY+7); c.fill();
      c.font=`bold ${Math.max(9,w*0.016)}px Tajawal`; c.textAlign='center';
      c.fillText(`${ws.force || 200} ن →`, ws.ballX, arrowY-12);
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG6Work2() {
  // TAB 2: احسب الشغل — تجارب متعددة
  const panel = document.getElementById('simControlsPanel');
  panel.innerHTML = `
<div class="ctrl-section">
  <div class="ctrl-label">🧮 احسب الشغل بنفسك</div>
  <div class="ctrl-desc">غيّر القوة والمسافة واحسب الشغل المبذول</div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">⚡ القوة المبذولة (نيوتن)</div>
  <input type="range" id="force-slider" min="50" max="500" value="200" step="50"
    style="width:100%;margin:8px 0"
    oninput="document.getElementById('force-val').textContent=this.value;window._calcWork&&window._calcWork()">
  <div style="text-align:center;font-family:Tajawal;font-weight:700;color:var(--text-primary)">
    <span id="force-val">200</span> نيوتن
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">📏 المسافة المقطوعة (متر)</div>
  <input type="range" id="dist-slider" min="1" max="20" value="8" step="1"
    style="width:100%;margin:8px 0"
    oninput="document.getElementById('dist-val').textContent=this.value;window._calcWork&&window._calcWork()">
  <div style="text-align:center;font-family:Tajawal;font-weight:700;color:var(--text-primary)">
    <span id="dist-val">8</span> متر
  </div>
</div>
<div id="work-box" style="padding:14px;border-radius:12px;background:rgba(39,174,96,0.08);border:2px solid rgba(39,174,96,0.3);margin-top:4px;font-family:Tajawal;font-size:14px;line-height:2.2;text-align:center">
  <div style="font-size:13px;color:var(--text-secondary)">الشغل = القوة × المسافة</div>
  <div id="work-formula" style="font-size:16px;font-weight:700;color:#1e8449">
    الشغل = 200 × 8 = 1600 جول
  </div>
</div>
<div class="q-box" style="margin-top:12px">
  <strong>❓ جرّب:</strong> إذا تضاعفت المسافة، ماذا يحدث للشغل؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 الإجابة</button>
  <div class="q-ans-panel">يتضاعف الشغل أيضاً! الشغل يتناسب طردياً مع كل من القوة والمسافة.</div>
</div>`;

  window._calcWork = function() {
    const F = parseInt(document.getElementById('force-slider').value);
    const d = parseInt(document.getElementById('dist-slider').value);
    const W = F * d;
    document.getElementById('work-formula').textContent = `الشغل = ${F} × ${d} = ${W} جول`;
    document.getElementById('work-formula').style.color = W > 2000 ? '#E53935' : W > 1000 ? '#F57C00' : '#1e8449';
  };

  const cv = document.getElementById('simCanvas');
  const c = cv.getContext('2d');
  const w = cv.width, h = cv.height;
  const S = simState;
  S.w2t = 0;

  function draw() {
    if (currentSim !== 'g6work') return;
    S.w2t += 0.02;
    c.fillStyle = '#0d1520'; c.fillRect(0,0,w,h);

    const F = document.getElementById('force-slider') ? parseInt(document.getElementById('force-slider').value) : 200;
    const d = document.getElementById('dist-slider') ? parseInt(document.getElementById('dist-slider').value) : 8;
    const W = F * d;

    // Draw football pitch top-down view
    const fieldX = w*0.04, fieldY = h*0.05, fieldW = w*0.92, fieldH = h*0.45;
    const grass = c.createLinearGradient(fieldX,fieldY,fieldX,fieldY+fieldH);
    grass.addColorStop(0,'#2E8B3A'); grass.addColorStop(1,'#236828');
    c.fillStyle=grass; c.beginPath(); c.roundRect(fieldX,fieldY,fieldW,fieldH,8); c.fill();
    c.strokeStyle='white'; c.lineWidth=2; c.strokeRect(fieldX+4,fieldY+4,fieldW-8,fieldH-8);
    c.beginPath(); c.moveTo(fieldX+fieldW/2,fieldY+4); c.lineTo(fieldX+fieldW/2,fieldY+fieldH-4); c.stroke();
    c.beginPath(); c.arc(fieldX+fieldW/2, fieldY+fieldH/2, fieldH*0.2, 0, Math.PI*2); c.stroke();

    // Ball start and end position based on distance
    const ballStartX = fieldX + fieldW*0.1;
    const ballY = fieldY + fieldH*0.5;
    const maxDist = fieldW * 0.8;
    const ballTravelX = (d/20) * maxDist;
    const ballEndX = ballStartX + ballTravelX;

    // Animated ball position
    const progress = (Math.sin(S.w2t * 0.8) + 1) / 2; // 0 to 1
    const ballX = ballStartX + progress * ballTravelX;

    // Trail
    c.strokeStyle='rgba(255,220,50,0.5)'; c.lineWidth=2; c.setLineDash([6,4]);
    c.beginPath(); c.moveTo(ballStartX, ballY); c.lineTo(ballEndX, ballY); c.stroke();
    c.setLineDash([]);

    // Distance bracket
    c.strokeStyle='#FFD700'; c.fillStyle='#FFD700'; c.lineWidth=2;
    c.beginPath(); c.moveTo(ballStartX, ballY+26); c.lineTo(ballEndX, ballY+26); c.stroke();
    c.beginPath(); c.moveTo(ballStartX,ballY+20); c.lineTo(ballStartX,ballY+32); c.stroke();
    c.beginPath(); c.moveTo(ballEndX,ballY+20); c.lineTo(ballEndX,ballY+32); c.stroke();
    c.font=`bold ${Math.max(10,w*0.02)}px Tajawal`; c.textAlign='center';
    c.fillText(`${d} متر`, (ballStartX+ballEndX)/2, ballY+46);

    // Force arrow
    if (progress < 0.95) {
      c.strokeStyle='#FF5252'; c.fillStyle='#FF5252'; c.lineWidth=3;
      c.beginPath(); c.moveTo(ballX-20, ballY-30); c.lineTo(ballX+20, ballY-30); c.stroke();
      c.beginPath(); c.moveTo(ballX+20,ballY-30); c.lineTo(ballX+8,ballY-37); c.lineTo(ballX+8,ballY-23); c.fill();
      c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.textAlign='center';
      c.fillStyle='#FF5252'; c.fillText(`${F} ن`, ballX, ballY-42);
    }

    // Ball
    const br = Math.max(10,w*0.022);
    const bg = c.createRadialGradient(ballX-3,ballY-3,1,ballX,ballY,br);
    bg.addColorStop(0,'#fff'); bg.addColorStop(1,'#ccc');
    c.fillStyle=bg; c.beginPath(); c.arc(ballX,ballY,br,0,Math.PI*2); c.fill();
    c.strokeStyle='#555'; c.lineWidth=1.5; c.stroke();
    c.fillStyle='#222';
    [[0,-br*0.5],[br*0.4,br*0.3],[-br*0.4,br*0.3]].forEach(([px,py])=>{
      c.beginPath();
      for(let a=0;a<5;a++){const ag=a*Math.PI*2/5-Math.PI/2,r=br*0.28;a===0?c.moveTo(ballX+px+Math.cos(ag)*r,ballY+py+Math.sin(ag)*r):c.lineTo(ballX+px+Math.cos(ag)*r,ballY+py+Math.sin(ag)*r);}
      c.closePath(); c.fill();
    });

    // Work display
    const workColor = W > 2000 ? '#FF5252' : W > 1000 ? '#FFA726' : '#66BB6A';
    const barW = Math.min(w*0.88, (W/10000)*w*0.88);

    c.fillStyle='rgba(255,255,255,0.06)'; c.beginPath(); c.roundRect(w*0.06,h*0.56,w*0.88,h*0.08,8); c.fill();
    const barGrad = c.createLinearGradient(w*0.06,0,w*0.06+barW,0);
    barGrad.addColorStop(0,'#27AE60'); barGrad.addColorStop(1,workColor);
    c.fillStyle=barGrad; c.beginPath(); c.roundRect(w*0.06,h*0.56,barW,h*0.08,8); c.fill();

    c.fillStyle='white'; c.font=`bold ${Math.max(12,w*0.025)}px Tajawal`; c.textAlign='center';
    c.fillText(`⚡ ${F} ن × ${d} م = ${W} جول`, w/2, h*0.615);

    // Summary cards
    const cards = [
      { label:'القوة', val:`${F} ن`, color:'#FF5252', icon:'⚡' },
      { label:'المسافة', val:`${d} م`, color:'#FFA726', icon:'📏' },
      { label:'الشغل', val:`${W} ج`, color:'#66BB6A', icon:'💡' },
    ];
    const cardW = w*0.28, cardH = h*0.15;
    cards.forEach((card,i)=>{
      const cx = w*0.06 + i*(cardW + w*0.025);
      const cy = h*0.7;
      c.fillStyle='rgba(255,255,255,0.07)'; c.beginPath(); c.roundRect(cx,cy,cardW,cardH,10); c.fill();
      c.strokeStyle=card.color+'66'; c.lineWidth=1.5; c.strokeRect(cx+0.5,cy+0.5,cardW-1,cardH-1);
      c.fillStyle=card.color; c.font=`${Math.max(18,w*0.04)}px serif`; c.textAlign='center';
      c.fillText(card.icon, cx+cardW/2, cy+cardH*0.38);
      c.fillStyle='rgba(255,255,255,0.7)'; c.font=`${Math.max(8,w*0.014)}px Tajawal`;
      c.fillText(card.label, cx+cardW/2, cy+cardH*0.6);
      c.fillStyle='white'; c.font=`bold ${Math.max(10,w*0.02)}px Tajawal`;
      c.fillText(card.val, cx+cardW/2, cy+cardH*0.85);
    });

    c.fillStyle='rgba(255,255,255,0.5)'; c.font=`${Math.max(8,w*0.014)}px Tajawal`; c.textAlign='center';
    c.fillText('الشغل = القوة (نيوتن) × المسافة (متر) → الناتج بالجول', w/2, h*0.93);

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG6Work3() {
  // TAB 3: ماذا تستنتج؟ — ملخص + سؤال اختياري
  const panel = document.getElementById('simControlsPanel');
  panel.innerHTML = `
<div class="ctrl-section">
  <div class="ctrl-label">💡 ماذا تستنتج؟</div>
  <div class="ctrl-desc">لخّص ما تعلّمته عن الشغل المبذول</div>
</div>
<div class="ctrl-section" style="background:rgba(39,174,96,0.06);border-radius:12px;padding:12px;border:1.5px solid rgba(39,174,96,0.2)">
  <div style="font-family:Tajawal;font-size:14px;line-height:2.2;color:var(--text-primary)">
    ✅ <strong>الشغل يُبذل فقط عند تحرّك الجسم</strong><br>
    📐 <strong>الشغل = القوة × المسافة</strong><br>
    📏 <strong>وحدة الشغل هي الجول (J)</strong><br>
    ⛔ <strong>إذا لم يتحرك الجسم → الشغل = صفر</strong><br>
    🏟️ <strong>مثال:</strong> ركل كرة بقوة 200 ن على مسافة 8 م<br>
    &nbsp;&nbsp;&nbsp;&nbsp;→ الشغل = 200 × 8 = 1600 جول
  </div>
</div>
<div class="q-box" style="margin-top:10px">
  <strong>❓ سؤال التحقق:</strong><br>
  ولد يدفع جداراً بقوة 300 نيوتن لكن الجدار لا يتحرك. كم مقدار الشغل المبذول؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 الإجابة</button>
  <div class="q-ans-panel">الشغل = صفر! لأن الجدار لم يتحرك، ورغم أن القوة مبذولة إلا أن الإزاحة = 0، فالشغل = 300 × 0 = <strong>0 جول</strong>.</div>
</div>`;

  const cv = document.getElementById('simCanvas');
  const c = cv.getContext('2d');
  const w = cv.width, h = cv.height;
  const S = simState;
  S.w3t = 0;

  function draw() {
    if (currentSim !== 'g6work') return;
    S.w3t += 0.02;

    c.fillStyle='#0d1520'; c.fillRect(0,0,w,h);

    // Title
    c.fillStyle='white'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText('📋 ملخص: قانون الشغل المبذول', w/2, h*0.07);

    // Formula box
    const fboxX=w*0.08, fboxY=h*0.1, fboxW=w*0.84, fboxH=h*0.15;
    const fgrad=c.createLinearGradient(fboxX,fboxY,fboxX+fboxW,fboxY+fboxH);
    fgrad.addColorStop(0,'rgba(39,174,96,0.2)'); fgrad.addColorStop(1,'rgba(39,174,96,0.05)');
    c.fillStyle=fgrad; c.beginPath(); c.roundRect(fboxX,fboxY,fboxW,fboxH,12); c.fill();
    c.strokeStyle='rgba(39,174,96,0.4)'; c.lineWidth=2; c.strokeRect(fboxX+1,fboxY+1,fboxW-2,fboxH-2);
    c.fillStyle='#4DF'; c.font=`bold ${Math.max(16,w*0.036)}px Tajawal`; c.textAlign='center';
    c.fillText('الشغل (ج) = القوة (ن) × المسافة (م)', w/2, fboxY+fboxH*0.45);
    c.fillStyle='rgba(255,255,255,0.6)'; c.font=`${Math.max(10,w*0.018)}px Tajawal`;
    c.fillText('W = F × d    →    الجول = نيوتن × متر', w/2, fboxY+fboxH*0.8);

    // Three scenario cards
    const scenarios = [
      { title:'جسم ساكن', icon:'⛔', F:200, d:0, color:'#FF5252', note:'لا حركة = لا شغل' },
      { title:'كرة تتحرك', icon:'⚽', F:200, d:8, color:'#66BB6A', note:'شغل = 1600 ج' },
      { title:'قوة أكبر', icon:'💪', F:400, d:8, color:'#FFA726', note:'شغل = 3200 ج' },
    ];
    const cW=w*0.28, cH=h*0.28, cY=h*0.3;
    scenarios.forEach((sc,i)=>{
      const cx=w*0.06+i*(cW+w*0.025);
      c.fillStyle='rgba(255,255,255,0.05)'; c.beginPath(); c.roundRect(cx,cY,cW,cH,12); c.fill();
      c.strokeStyle=sc.color+'55'; c.lineWidth=1.5; c.strokeRect(cx+1,cY+1,cW-2,cH-2);
      // Pulsing icon
      const pulse = 1+Math.sin(S.w3t*2+i*1.2)*0.08;
      c.font=`${Math.max(22,w*0.05)*pulse}px serif`; c.textAlign='center';
      c.fillText(sc.icon, cx+cW/2, cY+cH*0.3);
      c.fillStyle='white'; c.font=`bold ${Math.max(9,w*0.018)}px Tajawal`;
      c.fillText(sc.title, cx+cW/2, cY+cH*0.48);
      c.fillStyle='rgba(255,255,255,0.6)'; c.font=`${Math.max(8,w*0.014)}px Tajawal`;
      c.fillText(`F=${sc.F}ن  d=${sc.d}م`, cx+cW/2, cY+cH*0.63);
      c.fillStyle=sc.color; c.font=`bold ${Math.max(9,w*0.018)}px Tajawal`;
      c.fillText(sc.note, cx+cW/2, cY+cH*0.8);
      const W=sc.F*sc.d;
      // Mini bar
      const bX=cx+cW*0.1, bY=cY+cH*0.88, bW=(cW*0.8), bH=h*0.02;
      c.fillStyle='rgba(255,255,255,0.1)'; c.beginPath(); c.roundRect(bX,bY,bW,bH,4); c.fill();
      const filled = W>0 ? Math.min(1,W/3200)*bW : 0;
      if(filled>0){const bg2=c.createLinearGradient(bX,0,bX+filled,0);bg2.addColorStop(0,'#27AE60');bg2.addColorStop(1,sc.color);c.fillStyle=bg2;c.beginPath();c.roundRect(bX,bY,filled,bH,4);c.fill();}
    });

    // Key rule boxes at bottom
    const rules = [
      { text:'إذا تحرّك الجسم → شغل موجود ✅', color:'#66BB6A' },
      { text:'إذا لم يتحرك → الشغل = صفر ⛔', color:'#FF5252' },
      { text:'القوة أكبر أو مسافة أطول → شغل أكبر 📈', color:'#FFA726' },
    ];
    const rY = h*0.64;
    rules.forEach((rule,i)=>{
      const ry=rY+i*h*0.1;
      c.fillStyle='rgba(255,255,255,0.04)'; c.beginPath(); c.roundRect(w*0.06,ry,w*0.88,h*0.085,8); c.fill();
      c.strokeStyle=rule.color+'44'; c.lineWidth=1; c.strokeRect(w*0.06+1,ry+1,w*0.88-2,h*0.085-2);
      c.fillStyle=rule.color; c.font=`bold ${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='center';
      c.fillText(rule.text, w/2, ry+h*0.053);
    });

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG5ReflectionCompare() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">✨ مقارنة الأسطح العاكسة</div>
  <div class="ctrl-desc">
    شاهد كيف تنعكس صورة البطة على كل سطح — المرآة تعطي صورة واضحة والسطوح الخشنة تشتّت الصورة
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">📊 ترتيب الأسطح (الأعلى انعكاساً)</div>
  <div class="ctrl-desc">
    🥇 المرآة — انعكاس منتظم (٩٥٪)<br>
    🥈 الورق اللامع — انعكاس شبه منتظم (٧٠٪)<br>
    🥉 القماش — انعكاس منتشر (٣٠٪)<br>
    ▪ الورق الخشن — انعكاس منتشر جداً (١٠٪)
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٤ · د٤):</strong><br>
  لماذا السطوح اللامعة تعكس الضوء أفضل من الخشنة؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">السطوح اللامعة منتظمة وملساء فتعكس الأشعة بزاوية ثابتة (انعكاس منتظم) فتظهر الصورة واضحة. السطوح الخشنة تشتّت الأشعة في اتجاهات مختلفة (انعكاس منتشر) فتختفي الصورة.</div>
</div>`;
  const cv = document.getElementById('simCanvas');
  const c = cv.getContext('2d');
  const w = cv.width, h = cv.height;
  const S = simState;
  if (!S.rInit) {
    S.rInit = true;
    S.t = 0;
    // Pre-render the duck to an offscreen canvas
    S.duckCanvas = document.createElement('canvas');
    S.duckCanvas.width = 120; S.duckCanvas.height = 80;
    const dc = S.duckCanvas.getContext('2d');
    drawDuckScene(dc, 120, 80);
  }
  S.t = 0;

  // Draw a duck using canvas shapes
  function drawDuckScene(dc, dw, dh) {
    // Sky / water background
    const skyGrad = dc.createLinearGradient(0,0,0,dh*0.55);
    skyGrad.addColorStop(0,'#87CEEB'); skyGrad.addColorStop(1,'#B0E0F0');
    dc.fillStyle = skyGrad; dc.fillRect(0,0,dw,dh*0.55);
    // Water
    const waterGrad = dc.createLinearGradient(0,dh*0.55,0,dh);
    waterGrad.addColorStop(0,'#1E6B8C'); waterGrad.addColorStop(1,'#0A3D5C');
    dc.fillStyle = waterGrad; dc.fillRect(0,dh*0.55,dw,dh*0.45);

    const cx = dw*0.5, cy = dh*0.47;
    const sc = dw/120;

    // Body
    dc.save();
    dc.translate(cx, cy);
    dc.beginPath();
    dc.ellipse(0, 0, 35*sc, 22*sc, 0, 0, Math.PI*2);
    dc.fillStyle = '#8B6914'; dc.fill();
    dc.strokeStyle='#5a3f00'; dc.lineWidth=1; dc.stroke();

    // Wing highlight
    dc.beginPath();
    dc.ellipse(-5*sc, 2*sc, 22*sc, 13*sc, -0.2, 0, Math.PI*2);
    dc.fillStyle='#A07820'; dc.fill();

    // Head
    dc.beginPath();
    dc.ellipse(28*sc, -14*sc, 13*sc, 12*sc, 0, 0, Math.PI*2);
    dc.fillStyle='#1A6B3A'; dc.fill();
    dc.strokeStyle='#0a3d20'; dc.lineWidth=1; dc.stroke();

    // Neck
    dc.beginPath();
    dc.ellipse(20*sc, -6*sc, 7*sc, 10*sc, -0.3, 0, Math.PI*2);
    dc.fillStyle='#1A6B3A'; dc.fill();

    // White ring
    dc.beginPath();
    dc.arc(22*sc, -7*sc, 5*sc, 0, Math.PI*2);
    dc.strokeStyle='white'; dc.lineWidth=2.5*sc; dc.stroke();

    // Beak
    dc.beginPath();
    dc.ellipse(40*sc, -13*sc, 9*sc, 5*sc, 0.1, 0, Math.PI*2);
    dc.fillStyle='#E8A020'; dc.fill();
    dc.strokeStyle='#b07010'; dc.lineWidth=0.8; dc.stroke();

    // Eye
    dc.beginPath();
    dc.arc(33*sc, -16*sc, 2.5*sc, 0, Math.PI*2);
    dc.fillStyle='#1a1a1a'; dc.fill();
    dc.beginPath();
    dc.arc(33.8*sc, -16.8*sc, 0.8*sc, 0, Math.PI*2);
    dc.fillStyle='white'; dc.fill();

    // Tail
    dc.beginPath();
    dc.moveTo(-35*sc, -5*sc);
    dc.quadraticCurveTo(-50*sc, -20*sc, -42*sc, -5*sc);
    dc.fillStyle='#5a3f00'; dc.fill();

    dc.restore();

    // Feet
    dc.strokeStyle='#E8A020'; dc.lineWidth=1.5*sc;
    dc.beginPath(); dc.moveTo(cx-8*sc, cy+18*sc); dc.lineTo(cx-5*sc, cy+28*sc); dc.stroke();
    dc.beginPath(); dc.moveTo(cx+5*sc, cy+18*sc); dc.lineTo(cx+8*sc, cy+28*sc); dc.stroke();
  }

  const surfaces = [
    { name:'مرآة', roughness:0, color:'#C8D8FF', reflectivity:0.95, label:'انعكاس منتظم', labelColor:'#4DF' },
    { name:'ورق لامع', roughness:0.2, color:'#FFFACC', reflectivity:0.7, label:'انعكاس شبه منتظم', labelColor:'#FD7' },
    { name:'قماش', roughness:0.65, color:'#DEBB8A', reflectivity:0.3, label:'انعكاس منتشر', labelColor:'#FA8' },
    { name:'ورق خشن', roughness:1.0, color:'#C8A882', reflectivity:0.1, label:'انعكاس منتشر جداً', labelColor:'#F55' },
  ];

  function draw() {
    if (currentSim !== 'g5reflection') return;
    S.t = (S.t || 0) + 0.02;
    c.fillStyle='#0d1520'; c.fillRect(0,0,w,h);
    const colW = w / surfaces.length;

    // Title
    c.fillStyle='rgba(255,255,255,0.9)';
    c.font=`bold ${Math.max(11,w*0.022)}px Tajawal`;
    c.textAlign='center';
    c.fillText('كيف تنعكس صورة البطة على أسطح مختلفة؟', w/2, h*0.05);

    // Draw duck above surfaces (original object)
    const duckSrcW = colW * 0.65, duckSrcH = duckSrcW * (80/120);
    const duckSrcY = h * 0.1;

    surfaces.forEach((surf, i) => {
      const bx = i * colW;
      const surfCX = bx + colW * 0.5;
      const surfY = h * 0.52; // surface line Y
      const surfH = h * 0.06;

      // --- DUCK ABOVE SURFACE (original) ---
      const duckAboveX = surfCX - duckSrcW/2;
      const duckAboveY = surfY - duckSrcH - h*0.02;
      if (S.duckCanvas) {
        c.save();
        c.globalAlpha = 1;
        c.drawImage(S.duckCanvas, duckAboveX, duckAboveY, duckSrcW, duckSrcH);
        c.restore();
      }

      // "الجسم الأصلي" label only on first column
      if (i === 0) {
        c.fillStyle='rgba(255,255,255,0.7)';
        c.font=`${Math.max(8,w*0.013)}px Tajawal`;
        c.textAlign='center';
        c.fillText('الجسم الأصلي', surfCX, duckAboveY - 4);
      }

      // --- SURFACE ---
      // Base color
      const surfGrad = c.createLinearGradient(bx, surfY, bx, surfY+surfH);
      surfGrad.addColorStop(0, surf.color + 'EE');
      surfGrad.addColorStop(1, surf.color + '88');
      c.fillStyle = surfGrad;
      c.fillRect(bx+1, surfY, colW-2, surfH);

      // Surface texture (bumps for rough)
      if (surf.roughness > 0.1) {
        const bump = surf.roughness * 5;
        c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 1;
        c.beginPath();
        for (let x2 = bx; x2 <= bx+colW; x2 += 8) {
          const y2 = surfY + bump * Math.sin((x2 - bx) * 0.8 + S.t * 0.1);
          x2 === bx ? c.moveTo(x2, y2) : c.lineTo(x2, y2);
        }
        c.stroke();
      } else {
        // Mirror shine line
        c.strokeStyle='rgba(255,255,255,0.6)'; c.lineWidth=1.5;
        c.beginPath(); c.moveTo(bx+2, surfY+2); c.lineTo(bx+colW-2, surfY+2); c.stroke();
      }

      // Surface name label
      c.fillStyle='rgba(30,30,30,0.85)';
      c.font=`bold ${Math.max(9,w*0.018)}px Tajawal`;
      c.textAlign='center';
      c.fillText(surf.name, surfCX, surfY + surfH*0.65);

      // --- REFLECTED DUCK BELOW SURFACE ---
      const reflW = duckSrcW;
      const reflH = duckSrcH;
      const reflX = surfCX - reflW/2;
      const reflY = surfY + surfH + h*0.01;

      if (S.duckCanvas) {
        // Create offscreen to apply distortion
        const offC = document.createElement('canvas');
        offC.width = Math.ceil(reflW); offC.height = Math.ceil(reflH);
        const oc = offC.getContext('2d');

        if (surf.roughness < 0.05) {
          // Perfect mirror: flip vertically, full alpha
          oc.save();
          oc.translate(0, reflH);
          oc.scale(1, -1);
          oc.globalAlpha = surf.reflectivity;
          oc.drawImage(S.duckCanvas, 0, 0, reflW, reflH);
          oc.restore();
        } else {
          // Distorted reflection: draw row by row with horizontal offset
          const strips = Math.max(4, Math.floor(reflH));
          for (let row = 0; row < strips; row++) {
            const srcRow = strips - 1 - row; // flip
            const xShift = (Math.random()-0.5) * surf.roughness * reflW * 0.35;
            const warpY = (Math.random()-0.5) * surf.roughness * 3;
            const srcFrac = srcRow / strips;
            const dstFrac = row / strips;
            oc.drawImage(
              S.duckCanvas,
              0, srcFrac * 80, 120, 80/strips,
              xShift, dstFrac * reflH + warpY, reflW, reflH/strips
            );
          }
          // Apply alpha overlay to fade
          oc.globalCompositeOperation = 'destination-in';
          oc.fillStyle = `rgba(0,0,0,${surf.reflectivity})`;
          oc.fillRect(0,0,reflW,reflH);
        }

        // Draw with blur effect for rough surfaces
        c.save();
        if (surf.roughness > 0.5) {
          c.filter = `blur(${Math.round(surf.roughness * 5)}px)`;
        }
        c.globalAlpha = surf.reflectivity;
        c.drawImage(offC, reflX, reflY, reflW, reflH);
        c.filter = 'none';
        c.restore();
      }

      // Animated light rays (incident + reflected) — fixed start + clearer cloth lines
      const rayPhase = S.t * 0.7 + i * 0.8;
      const incAngle = 0.6 + Math.sin(rayPhase) * 0.2;
      const rayLen = h * 0.12;
      // Incident ray from above-left
      const rayStartX = surfCX + Math.cos(Math.PI + incAngle) * rayLen;
      const rayStartY = surfY - Math.sin(incAngle) * rayLen;
      c.save();
      c.strokeStyle = 'rgba(255,220,60,0.85)'; c.lineWidth = 2.5;
      c.setLineDash([6,3]);
      c.beginPath(); c.moveTo(rayStartX, rayStartY); c.lineTo(surfCX, surfY); c.stroke();
      c.setLineDash([]);
      // Arrow on incident ray
      const arrowFrac = 0.6;
      const arx = rayStartX + (surfCX-rayStartX)*arrowFrac, ary = rayStartY + (surfY-rayStartY)*arrowFrac;
      const arAng = Math.atan2(surfY-rayStartY, surfCX-rayStartX);
      c.fillStyle='rgba(255,220,60,0.85)';
      c.save(); c.translate(arx,ary); c.rotate(arAng);
      c.beginPath(); c.moveTo(6,0); c.lineTo(-4,3); c.lineTo(-4,-3); c.fill(); c.restore();

      // Reflected rays — more visible for rough surfaces (cloth especially)
      const numRays = surf.roughness < 0.1 ? 1 : Math.max(3, Math.round(1 + surf.roughness * 6));
      for (let r = 0; r < numRays; r++) {
        const spread = numRays > 1 ? (r/(numRays-1) - 0.5) * surf.roughness * 1.6 : 0;
        const reflAng = incAngle + spread;
        // Make cloth and rough paper rays much more visible
        const baseAlpha = surf.roughness > 0.5
          ? Math.min(0.9, 0.5 + (0.4/numRays))  // cloth/rough: each ray more visible
          : Math.min(0.9, (surf.reflectivity / Math.max(1,numRays)) * 3);
        c.strokeStyle = `rgba(255,200,80,${baseAlpha})`;
        c.lineWidth = surf.roughness > 0.5 ? Math.max(1.5, 2.5 * surf.reflectivity) : Math.max(0.8, 2 * surf.reflectivity);
        c.beginPath();
        c.moveTo(surfCX, surfY);
        c.lineTo(surfCX + Math.cos(reflAng) * rayLen * 0.75, surfY - Math.sin(reflAng) * rayLen * 0.75);
        c.stroke();
      }
      c.restore();

      // Labels below reflected image — spaced so they never overlap
      const labelBaseY = surfY + surfH + h*0.01 + duckSrcH + h*0.015;
      const lineH = Math.max(16, h*0.038);

      // Clarity label
      const clarityColors = ['#4DF','#FD7','#FA8','#F55'];
      const clarityLabels = ['صورة واضحة جداً ✅','صورة واضحة 🟡','صورة ضبابية 🟠','لا صورة ❌'];
      const clarityIdx = surf.roughness < 0.1 ? 0 : surf.roughness < 0.3 ? 1 : surf.roughness < 0.7 ? 2 : 3;
      const lFontSz = Math.max(8, Math.min(w*0.016, 13));
      c.fillStyle = clarityColors[clarityIdx];
      c.font = `bold ${lFontSz}px Tajawal`;
      c.textAlign = 'center';
      c.fillText(clarityLabels[clarityIdx], surfCX, labelBaseY);

      c.fillStyle = `rgba(255,210,100,0.9)`;
      c.font = `${Math.max(7,w*0.014)}px Tajawal`;
      c.fillText(`${Math.round(surf.reflectivity*100)}٪ انعكاس`, surfCX, labelBaseY + lineH);

      c.fillStyle = 'rgba(200,200,200,0.65)';
      c.font = `${Math.max(7,w*0.013)}px Tajawal`;
      c.fillText(surf.label, surfCX, labelBaseY + lineH*2);

      // Divider
      if (i < surfaces.length-1) {
        c.strokeStyle='rgba(255,255,255,0.08)'; c.lineWidth=1;
        c.beginPath(); c.moveTo(bx+colW, h*0.07); c.lineTo(bx+colW, h*0.97); c.stroke();
      }
    });

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}
function simG5ReflectionMeasure() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">📊 قياس الانعكاس</div>
  <div class="ctrl-desc">
    انقر على الأسطح المختلفة لقياس معامل انعكاسها وقارن النتائج في الجدول
  </div>
</div>
<div class="q-box">
  <strong>❓ استنتاج:</strong><br>
  ما العلاقة بين ملمس السطح ودرجة انعكاس الضوء؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">✅ كلما كان السطح أكثر نعومةً ولمعاناً، زادت درجة انعكاس الضوء وكانت الصورة أوضح (انعكاس منتظم). السطوح الخشنة تشتّت الضوء في اتجاهات مختلفة (انعكاس منتشر) فتختفي الصورة.</div>
</div>`;
  const cv = document.getElementById('simCanvas');
  const c = cv.getContext('2d');
  const w = cv.width, h = cv.height;
  const S = simState;
  const data = [
    {name:'مرآة',val:95,color:'#C0C0FF'},
    {name:'ألمنيوم',val:75,color:'#C0C080'},
    {name:'ورق لامع',val:70,color:'#FFFF80'},
    {name:'قماش',val:30,color:'#D2A060'},
    {name:'ورق خشن',val:10,color:'#C0A080'},
  ];
  if (!S.rmInit) {
    S.rmInit=true; S.selected=-1;
    const bW = cv.width*0.12, gap = cv.width*0.04, startX = cv.width*0.1, baseY = cv.height*0.75;
    function getBar(mx, my) {
      for (let i=0; i<data.length; i++) {
        const bx = startX + i*(bW+gap);
        const bH = (data[i].val/100)*cv.height*0.5;
        if (mx>=bx && mx<=bx+bW && my>=baseY-bH && my<=baseY) return i;
      }
      return -1;
    }
    cv.style.cursor = 'pointer';
    cv.onclick = function(e) {
      const rect = cv.getBoundingClientRect();
      const mx = ((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX-rect.left)/rect.width*cv.width;
      const my = (e.clientY-rect.top)/rect.height*cv.height;
      const idx = getBar(mx, my);
      S.selected = (S.selected===idx) ? -1 : idx;
    };
    cv.ontouchend = function(e) {
      e.preventDefault();
      const rect = cv.getBoundingClientRect();
      const t = e.changedTouches[0];
      const mx = (t.clientX-rect.left)/rect.width*cv.width;
      const my = (t.clientY-rect.top)/rect.height*cv.height;
      const idx = getBar(mx, my);
      S.selected = (S.selected===idx) ? -1 : idx;
    };
  }
  function draw() {
    if (currentSim !== 'g5reflection') return;
    c.fillStyle='#0d1117'; c.fillRect(0,0,w,h);
    const bW = w*0.12, gap = w*0.04, startX = w*0.1, baseY = h*0.75;
    data.forEach((d,i)=>{
      const bH = (d.val/100)*h*0.5;
      const bx = startX + i*(bW+gap);
      const isS = i===S.selected;
      const grad = c.createLinearGradient(bx,baseY-bH,bx,baseY);
      grad.addColorStop(0, isS ? '#fff' : d.color);
      grad.addColorStop(1, d.color+'44');
      c.fillStyle = grad;
      c.fillRect(bx, baseY-bH, bW, bH);
      if(isS){c.strokeStyle='#FFD700';c.lineWidth=3;c.strokeRect(bx,baseY-bH,bW,bH);}
      c.fillStyle='rgba(255,255,255,0.85)'; c.font=`bold ${Math.max(9,w*0.02)}px Tajawal`;
      c.textAlign='center'; c.fillText(d.name, bx+bW/2, baseY+20);
      c.fillStyle = isS ? '#FFD700' : d.color;
      c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`;
      c.fillText(d.val+'%', bx+bW/2, baseY-bH-10);
    });
    // Axis
    c.strokeStyle='rgba(255,255,255,0.3)'; c.lineWidth=1;
    c.beginPath(); c.moveTo(w*0.08, h*0.18); c.lineTo(w*0.08, baseY+5); c.lineTo(w*0.95, baseY+5); c.stroke();
    c.fillStyle='rgba(255,255,255,0.7)'; c.font=`${Math.max(10,w*0.02)}px Tajawal`;
    c.textAlign='center'; c.fillText('نسبة انعكاس الضوء %', w/2, h*0.12);
    // Info panel on click
    if (S.selected >= 0) {
      const d = data[S.selected];
      c.fillStyle='rgba(0,0,0,0.6)'; c.beginPath(); c.roundRect(w*0.25, h*0.08, w*0.5, h*0.08, 8); c.fill();
      c.fillStyle='#FFD700'; c.font=`bold ${Math.max(11,w*0.024)}px Tajawal`; c.textAlign='center';
      c.fillText(`${d.name}: ${d.val}% انعكاس`, w/2, h*0.135);
    } else {
      c.fillStyle='rgba(255,220,100,0.6)'; c.font=`${Math.max(10,w*0.02)}px Tajawal`; c.textAlign='center';
      c.fillText('← انقر على أي عمود لعرض تفاصيله →', w/2, h*0.88);
    }
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG5LightDirection() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">🎯 لعبة هندسة الضوء</div>
  <div class="ctrl-desc">
    اسحب الليزر 🔴 بحرية في أي اتجاه — كلما اقتربت من العمود المقام قلّت الزاوية ✅<br>
    اسحب <strong>طرف الشعاع</strong> لتمديده أو تقصيره.
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">📐 القانون الذي نُثبته</div>
  <div class="ctrl-name" style="font-size:15px;font-weight:700;color:var(--teal,#1A8FA8);text-align:center;padding:8px;background:rgba(26,143,168,0.08);border-radius:8px">
    زاوية السقوط = زاوية الانعكاس ✅
  </div>
</div>
<div class="q-box">
  <strong>❓ استنتاج:</strong><br>
  ماذا يحدث إذا سقط الضوء عمودياً على المرآة (زاوية ٠°)؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">يرتد الضوء مباشرةً نحو مصدره — زاوية السقوط = زاوية الانعكاس = ٠°، أي يرتد بنفس المسار.</div>
</div>`;
  const cv = document.getElementById('simCanvas');
  const c = cv.getContext('2d');
  const S = simState;

  if (!S.ldInit) {
    S.ldInit = true;
    S.t = 0;
    S.laserX = 0.12;
    S.laserY = 0.26;
    S.laserLen = 0.50;
    S.draggingLaser = false;
    S.draggingTip = false;
    S.photonT = 0;
  }

  function getGeom() {
    const w = cv.width, h = cv.height;
    const mirrorY = h * 0.68;
    const mirrorX1 = w * 0.14, mirrorX2 = w * 0.88;
    const laserSrcX = S.laserX * w;
    const laserSrcY = S.laserY * h;
    const hitX = mirrorX1 + (mirrorX2 - mirrorX1) * S.laserLen;
    const hitY = mirrorY;
    const dxInc = hitX - laserSrcX;
    const dyInc = hitY - laserSrcY;
    const lenInc = Math.sqrt(dxInc*dxInc + dyInc*dyInc);
    const incUx = dxInc/lenInc, incUy = dyInc/lenInc;
    const dot = incUy * (-1);
    const refUx = incUx;
    const refUy = incUy - 2*dot*(-1);
    const incAngleDeg = Math.round(Math.abs(Math.atan2(Math.abs(incUx), Math.abs(incUy)) * 180 / Math.PI));
    return { w, h, mirrorY, mirrorX1, mirrorX2, laserSrcX, laserSrcY, hitX, hitY, incUx, incUy, refUx, refUy, incAngleDeg, lenInc };
  }

  function evtPos(e) {
    const rect = cv.getBoundingClientRect();
    const src = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
    return {
      x: (src.clientX - rect.left) * (cv.width / rect.width),
      y: (src.clientY - rect.top) * (cv.height / rect.height)
    };
  }

  function tryStartDrag(px, py) {
    const G = getGeom();
    if (Math.hypot(px - G.laserSrcX, py - G.laserSrcY) < Math.max(26, G.w*0.07)) {
      S.draggingLaser = true; return;
    }
    if (Math.hypot(px - G.hitX, py - G.hitY) < 24) {
      S.draggingTip = true; return;
    }
    const dx = G.hitX - G.laserSrcX, dy = G.hitY - G.laserSrcY;
    const len2 = dx*dx + dy*dy;
    const t2 = Math.max(0,Math.min(1,((px-G.laserSrcX)*dx+(py-G.laserSrcY)*dy)/len2));
    const cx2 = G.laserSrcX+t2*dx, cy2 = G.laserSrcY+t2*dy;
    if (Math.hypot(px-cx2, py-cy2) < 18) { S.draggingLaser = true; }
  }

  function onMove(px, py) {
    const G = getGeom();
    const { w, h } = G;
    const mirrorY = h * 0.68;
    if (S.draggingLaser) {
      S.laserX = Math.max(0.02, Math.min(0.95, px / w));
      S.laserY = Math.max(0.04, Math.min((mirrorY - 10) / h, py / h));
    }
    if (S.draggingTip) {
      const mirrorX1 = w * 0.14, mirrorX2 = w * 0.88;
      const clampedX = Math.max(mirrorX1 + w*0.02, Math.min(mirrorX2 - w*0.02, px));
      S.laserLen = (clampedX - mirrorX1) / (mirrorX2 - mirrorX1);
    }
  }

  cv.onmousedown = function(e) {
    if (currentSim !== 'g5lightdir') return;
    const p = evtPos(e);
    tryStartDrag(p.x, p.y);
  };
  cv.onmousemove = function(e) {
    if (currentSim !== 'g5lightdir') return;
    if (!S.draggingLaser && !S.draggingTip) return;
    const p = evtPos(e);
    onMove(p.x, p.y);
  };
  cv.onmouseup = cv.onmouseleave = function() { S.draggingLaser = false; S.draggingTip = false; };
  cv.ontouchstart = function(e) {
    if (currentSim !== 'g5lightdir') return;
    e.preventDefault();
    const p = evtPos(e);
    tryStartDrag(p.x, p.y);
  };
  cv.ontouchmove = function(e) {
    e.preventDefault();
    if (!S.draggingLaser && !S.draggingTip) return;
    const p = evtPos(e);
    onMove(p.x, p.y);
  };
  cv.ontouchend = function() { S.draggingLaser = false; S.draggingTip = false; };

  function draw() {
    if (currentSim !== 'g5lightdir') { cancelAnimationFrame(animFrame); return; }
    S.t += 0.025;
    S.photonT = (S.photonT + 0.012) % 1;

    const G = getGeom();
    const { w, h, mirrorY, mirrorX1, mirrorX2, laserSrcX, laserSrcY, hitX, hitY, incUx, incUy, refUx, refUy, incAngleDeg } = G;

    c.fillStyle = '#0d1020'; c.fillRect(0, 0, w, h);

    // === MIRROR ===
    const mirGrad = c.createLinearGradient(mirrorX1, mirrorY, mirrorX2, mirrorY);
    mirGrad.addColorStop(0,'rgba(160,160,255,0.2)');
    mirGrad.addColorStop(0.5,'rgba(200,200,255,0.9)');
    mirGrad.addColorStop(1,'rgba(160,160,255,0.2)');
    c.strokeStyle = mirGrad; c.lineWidth = 5;
    c.beginPath(); c.moveTo(mirrorX1, mirrorY); c.lineTo(mirrorX2, mirrorY); c.stroke();
    c.fillStyle='rgba(180,180,255,0.7)'; c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`; c.textAlign='center';
    c.fillText('مرآة أفقية', (mirrorX1+mirrorX2)/2, mirrorY + 22);
    c.strokeStyle='rgba(100,100,180,0.25)'; c.lineWidth=1;
    for(let hx=mirrorX1; hx<mirrorX2; hx+=12){
      c.beginPath(); c.moveTo(hx, mirrorY); c.lineTo(hx-8, mirrorY+10); c.stroke();
    }

    // === NORMAL LINE at hit point ===
    c.strokeStyle='rgba(255,255,255,0.35)'; c.lineWidth=1.5; c.setLineDash([5,5]);
    c.beginPath(); c.moveTo(hitX, mirrorY - h*0.38); c.lineTo(hitX, mirrorY + h*0.12); c.stroke();
    c.setLineDash([]);
    c.fillStyle='rgba(255,255,255,0.55)'; c.font=`${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='center';
    c.fillText('العمود المقام', hitX, mirrorY - h*0.36);

    // === INCIDENT RAY ===
    const incGrad = c.createLinearGradient(laserSrcX, laserSrcY, hitX, hitY);
    incGrad.addColorStop(0,'rgba(255,60,60,0.95)'); incGrad.addColorStop(1,'rgba(255,80,80,0.5)');
    c.strokeStyle=incGrad; c.lineWidth=3; c.setLineDash([]);
    c.beginPath(); c.moveTo(laserSrcX, laserSrcY); c.lineTo(hitX, hitY); c.stroke();

    // Photon on incident ray
    const phaseInc = S.photonT < 0.5 ? S.photonT / 0.5 : 1;
    if (phaseInc < 1) {
      const px2 = laserSrcX + (hitX-laserSrcX)*phaseInc;
      const py2 = laserSrcY + (hitY-laserSrcY)*phaseInc;
      const pg = c.createRadialGradient(px2,py2,0,px2,py2,12);
      pg.addColorStop(0,'rgba(255,200,200,1)'); pg.addColorStop(1,'rgba(255,60,60,0)');
      c.fillStyle=pg; c.beginPath(); c.arc(px2,py2,12,0,Math.PI*2); c.fill();
    }

    // === REFLECTED RAY ===
    const refLen = G.lenInc; // same length as incident
    const refEndX = hitX + refUx * refLen;
    const refEndY = hitY + refUy * refLen;
    const refGrad = c.createLinearGradient(hitX, hitY, refEndX, refEndY);
    refGrad.addColorStop(0,'rgba(255,190,60,0.9)'); refGrad.addColorStop(1,'rgba(255,180,60,0.1)');
    c.strokeStyle=refGrad; c.lineWidth=3;
    c.beginPath(); c.moveTo(hitX, hitY); c.lineTo(refEndX, refEndY); c.stroke();

    // Photon on reflected ray
    const phaseRef = S.photonT >= 0.5 ? (S.photonT - 0.5) / 0.5 : 0;
    if (phaseRef > 0) {
      const px2 = hitX + (refEndX-hitX)*phaseRef;
      const py2 = hitY + (refEndY-hitY)*phaseRef;
      const pg = c.createRadialGradient(px2,py2,0,px2,py2,12);
      pg.addColorStop(0,'rgba(255,230,150,1)'); pg.addColorStop(1,'rgba(255,160,40,0)');
      c.fillStyle=pg; c.beginPath(); c.arc(px2,py2,12,0,Math.PI*2); c.fill();
    }

    // === ANGLE ARCS ===
    const arcR = Math.min(50, h*0.1);
    const incFromNormal = Math.atan2(Math.abs(incUx), Math.abs(incUy));
    // Incident arc (left of normal, above mirror)
    c.strokeStyle='rgba(255,80,80,0.9)'; c.lineWidth=2.5;
    c.beginPath();
    c.arc(hitX, mirrorY, arcR, -Math.PI/2 - incFromNormal, -Math.PI/2, false);
    c.stroke();
    // Reflected arc (right of normal, above mirror)
    c.strokeStyle='rgba(80,220,80,0.9)'; c.lineWidth=2.5;
    c.beginPath();
    c.arc(hitX, mirrorY, arcR, -Math.PI/2, -Math.PI/2 + incFromNormal, false);
    c.stroke();

    // Angle labels
    const lFontSz = Math.max(12, w*0.024);
    c.font = `bold ${lFontSz}px Tajawal`;
    const angTxt = `${incAngleDeg}°`;

    // Left label (incident)
    const incLX = hitX - arcR - 24;
    const incLY = mirrorY - arcR*0.5;
    const tw1 = c.measureText(angTxt).width;
    c.fillStyle='rgba(0,0,0,0.75)';
    c.beginPath(); c.roundRect(incLX-tw1/2-5, incLY-lFontSz*0.8, tw1+10, lFontSz+4, 5); c.fill();
    c.fillStyle='#FF6060'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(angTxt, incLX, incLY-lFontSz*0.2);

    // Right label (reflected)
    const refLX = hitX + arcR + 24;
    const tw2 = c.measureText(angTxt).width;
    c.fillStyle='rgba(0,0,0,0.75)';
    c.beginPath(); c.roundRect(refLX-tw2/2-5, incLY-lFontSz*0.8, tw2+10, lFontSz+4, 5); c.fill();
    c.fillStyle='#50DD50'; c.textAlign='center';
    c.fillText(angTxt, refLX, incLY-lFontSz*0.2);
    c.textBaseline='alphabetic';

    c.font=`${Math.max(8,w*0.015)}px Tajawal`;
    c.fillStyle='rgba(255,100,100,0.8)'; c.textAlign='center';
    c.fillText('زاوية سقوط', incLX, mirrorY + 16);
    c.fillStyle='rgba(80,220,80,0.8)';
    c.fillText('زاوية انعكاس', refLX, mirrorY + 16);

    // === LASER SOURCE (draggable) ===
    const laserGlow = c.createRadialGradient(laserSrcX, laserSrcY, 0, laserSrcX, laserSrcY, w*0.06);
    laserGlow.addColorStop(0,'rgba(255,80,80,0.8)'); laserGlow.addColorStop(1,'rgba(255,80,80,0)');
    c.fillStyle=laserGlow; c.beginPath(); c.arc(laserSrcX, laserSrcY, w*0.06, 0, Math.PI*2); c.fill();
    c.fillStyle='#FF3030'; c.beginPath(); c.arc(laserSrcX, laserSrcY, w*0.02, 0, Math.PI*2); c.fill();
    c.fillStyle='rgba(255,120,120,0.95)'; c.font=`bold ${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText('🔴 ليزر', laserSrcX, laserSrcY - w*0.04);
    c.fillStyle='rgba(255,200,200,0.7)'; c.font=`${Math.max(8,w*0.015)}px Tajawal`;
    c.fillText('(اسحب)', laserSrcX, laserSrcY + w*0.04);

    // === TIP HANDLE at hit point (elastic end) ===
    const tipPulse = Math.sin(S.t*5)*2;
    c.fillStyle='rgba(255,180,60,0.9)';
    c.beginPath(); c.arc(hitX, hitY, 10+tipPulse, 0, Math.PI*2); c.fill();
    c.strokeStyle='white'; c.lineWidth=1.5; c.stroke();
    c.fillStyle='white'; c.font=`bold ${Math.max(7,w*0.013)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('↔', hitX, hitY);
    c.textBaseline='alphabetic';

    // Hit flash
    const flashAlpha = Math.sin(S.t*8)*0.3+0.4;
    const hitGlow = c.createRadialGradient(hitX, mirrorY, 0, hitX, mirrorY, 18);
    hitGlow.addColorStop(0,`rgba(255,220,80,${flashAlpha})`); hitGlow.addColorStop(1,'rgba(255,220,80,0)');
    c.fillStyle=hitGlow; c.beginPath(); c.arc(hitX,mirrorY,18,0,Math.PI*2); c.fill();

    // === RESULT BOX ===
    const boxFontSz = Math.max(11, w*0.022);
    c.font = `bold ${boxFontSz}px Tajawal`;
    const line1 = `زاوية السقوط = ${incAngleDeg}°`;
    const line2 = `زاوية الانعكاس = ${incAngleDeg}°`;
    const boxW = Math.max(c.measureText(line1).width, c.measureText(line2).width) + 28;
    const boxX = w - boxW - w*0.03;
    const boxY = h*0.05;
    const boxH = boxFontSz*2 + 26;
    c.fillStyle='rgba(0,0,0,0.6)';
    c.strokeStyle='rgba(39,174,96,0.7)'; c.lineWidth=1.5;
    c.beginPath(); c.roundRect(boxX, boxY, boxW, boxH, 8); c.fill(); c.stroke();
    c.fillStyle='#4ADE80'; c.textAlign='center';
    c.fillText(line1, boxX+boxW/2, boxY+boxFontSz+6);
    c.fillText(line2, boxX+boxW/2, boxY+boxFontSz*2+14);

    // Instruction
    const instrFontSz = Math.max(10, w*0.019);
    c.fillStyle='rgba(255,255,255,0.6)'; c.font=`bold ${instrFontSz}px Tajawal`; c.textAlign='center';
    c.fillText('← اسحب الليزر للأعلى/الأسفل · اسحب طرف الشعاع لتمديده أو تقصيره', w*0.45, h*0.96);

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════
//   الصف الخامس — وحدة ٥: الظلال
// ══════════════════════════════════════════════════

function simG5ShadowLab() {
  // ── تجربة الأنابيب: الضوء يسير في خطوط مستقيمة ──
  const S = simState;
  if (!S.pipeInit) {
    S.pipeInit = true;
    S.pipeSelected = 'straight';
    S.photonT = 0;
  }

  document.getElementById('simControlsPanel').innerHTML = `
<div class="ctrl-section">
  <div class="ctrl-label">🔦 تجربة الأنابيب</div>
  <div class="ctrl-desc">
    انظر من طرف الأنبوب — هل يصلك الضوء؟
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">🧪 اختر الأنبوب</div>
  <div class="ctrl-btns-grid">
    <button id="pipe-btn-straight" class="ctrl-btn action" onclick="window._selectPipe('straight')">📏 أنبوب مستقيم</button>
    <button id="pipe-btn-bent" class="ctrl-btn" onclick="window._selectPipe('bent')">〰️ أنبوب معوج</button>
  </div>
</div>
<div id="pipe-result-box" style="margin-top:8px;padding:10px 12px;border-radius:10px;font-family:Tajawal;font-size:14px;font-weight:700;text-align:center;transition:all 0.3s">
</div>
<div class="q-box">
  <strong>❓ ماذا نستنتج؟</strong><br>
  لماذا يصل الضوء في الأنبوب المستقيم دون المعوج؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">لأن الضوء ينتقل في خطوط مستقيمة فقط — لا يستطيع الانعطاف داخل الأنبوب المعوج، بينما في الأنبوب المستقيم يمر مباشرةً من طرف إلى طرف.</div>
</div>`;

  window._selectPipe = function(type) {
    S.pipeSelected = type;
    S.photonT = 0;
    ['straight','bent'].forEach(t => {
      const btn = document.getElementById('pipe-btn-' + t);
      if (!btn) return;
      btn.className = 'ctrl-btn' + (t === type ? ' action' : '');
    });
    const box = document.getElementById('pipe-result-box');
    if (!box) return;
    if (type === 'straight') {
      box.style.background = 'rgba(39,174,96,0.15)';
      box.style.border = '1.5px solid rgba(39,174,96,0.4)';
      box.style.color = '#27AE60';
      box.innerHTML = '👁️ ترى الضوء! — الأنبوب المستقيم يسمح للضوء بالمرور';
    } else {
      box.style.background = 'rgba(192,57,43,0.12)';
      box.style.border = '1.5px solid rgba(192,57,43,0.35)';
      box.style.color = '#C0392B';
      box.innerHTML = '🚫 لا ترى الضوء! — الأنبوب المعوج يحجب الضوء';
    }
    try{playTick&&playTick();}catch(e){}
  };

  setTimeout(() => window._selectPipe(S.pipeSelected), 50);

  const cv = document.getElementById('simCanvas');
  const c = cv.getContext('2d');

  function drawStraightPipe(w, h) {
    const bg = c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#0a0e1a'); bg.addColorStop(1,'#111825');
    c.fillStyle = bg; c.fillRect(0,0,w,h);

    const pipeY = h * 0.42;
    const pipeH = h * 0.12;
    const pipeStartX = w * 0.08;
    const pipeEndX = w * 0.90;

    // جسم الأنبوب
    const pg = c.createLinearGradient(0, pipeY, 0, pipeY + pipeH);
    pg.addColorStop(0,'#4A6080'); pg.addColorStop(0.3,'#6A8090'); pg.addColorStop(0.7,'#3A5070'); pg.addColorStop(1,'#2A3A50');
    c.fillStyle = pg;
    c.beginPath(); c.roundRect(pipeStartX, pipeY, pipeEndX - pipeStartX, pipeH, 6); c.fill();
    c.strokeStyle='rgba(100,160,220,0.4)'; c.lineWidth=1.5; c.stroke();

    // الفراغ الداخلي
    const innerY = pipeY + pipeH*0.2, innerH = pipeH*0.6;
    c.fillStyle='#080C14';
    c.beginPath(); c.roundRect(pipeStartX+6, innerY, pipeEndX-pipeStartX-12, innerH, 3); c.fill();

    // شعاع الضوء
    S.photonT = (S.photonT + 0.008) % 1;
    const beamCY = pipeY + pipeH/2;
    const beamGrad = c.createLinearGradient(pipeStartX,0,pipeEndX,0);
    beamGrad.addColorStop(0,'rgba(255,220,50,0)'); beamGrad.addColorStop(0.05,'rgba(255,220,50,0.9)');
    beamGrad.addColorStop(0.95,'rgba(255,220,50,0.9)'); beamGrad.addColorStop(1,'rgba(255,220,50,0)');
    c.fillStyle=beamGrad; c.fillRect(pipeStartX+6, beamCY-2, pipeEndX-pipeStartX-12, 4);

    // فوتون متحرك — من المصدر (يمين) نحو العين (يسار)
    const px = pipeEndX - (pipeEndX-pipeStartX)*S.photonT;
    const pGlow = c.createRadialGradient(px,beamCY,0,px,beamCY,16);
    pGlow.addColorStop(0,'rgba(255,255,180,1)'); pGlow.addColorStop(1,'rgba(255,200,0,0)');
    c.fillStyle=pGlow; c.beginPath(); c.arc(px,beamCY,16,0,Math.PI*2); c.fill();

    // مصدر الضوء (يمين)
    const srcX=pipeEndX+w*0.025, srcY=beamCY;
    const sg=c.createRadialGradient(srcX,srcY,0,srcX,srcY,w*0.08);
    sg.addColorStop(0,'rgba(255,220,60,1)'); sg.addColorStop(1,'rgba(255,150,0,0)');
    c.fillStyle=sg; c.beginPath(); c.arc(srcX,srcY,w*0.08,0,Math.PI*2); c.fill();
    c.fillStyle='#FFE040'; c.beginPath(); c.arc(srcX,srcY,w*0.022,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,220,80,0.9)'; c.font=`bold ${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='center';
    c.fillText('🔦 مصدر الضوء', srcX, srcY-w*0.05);

    // عين (يسار)
    const eyeX=pipeStartX-w*0.035, eyeY=beamCY;
    c.fillStyle='white'; c.beginPath(); c.ellipse(eyeX,eyeY,w*0.03,w*0.019,0,0,Math.PI*2); c.fill();
    c.strokeStyle='#333'; c.lineWidth=1; c.stroke();
    c.fillStyle='#3B82F6'; c.beginPath(); c.arc(eyeX,eyeY,w*0.013,0,Math.PI*2); c.fill();
    c.fillStyle='#111'; c.beginPath(); c.arc(eyeX,eyeY,w*0.007,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,255,255,0.85)'; c.beginPath(); c.arc(eyeX+w*0.006,eyeY-w*0.005,w*0.003,0,Math.PI*2); c.fill();
    // هالة خضراء حول العين
    const halo=c.createRadialGradient(eyeX,eyeY,0,eyeX,eyeY,w*0.065);
    halo.addColorStop(0,'rgba(39,174,96,0.4)'); halo.addColorStop(1,'rgba(39,174,96,0)');
    c.fillStyle=halo; c.beginPath(); c.arc(eyeX,eyeY,w*0.065,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,255,255,0.85)'; c.font=`bold ${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='center';
    c.fillText('👁️ عينك', eyeX, eyeY+w*0.048);

    // صندوق النتيجة
    c.fillStyle='rgba(0,0,0,0.55)'; c.strokeStyle='rgba(39,174,96,0.5)'; c.lineWidth=1.5;
    c.beginPath(); c.roundRect(w*0.25,h*0.06,w*0.5,h*0.1,8); c.fill(); c.stroke();
    c.fillStyle='#4ADE80'; c.font=`bold ${Math.max(10,w*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText('✅ الضوء يصل إلى العين!', w*0.5, h*0.125);

    // تسمية
    c.fillStyle='rgba(180,210,255,0.7)'; c.font=`bold ${Math.max(9,w*0.02)}px Tajawal`; c.textAlign='center';
    c.fillText('أنبوب مستقيم — الضوء يمر بخط مستقيم', w*0.5, pipeY+pipeH+h*0.07);
  }

  function drawBentPipe(w, h) {
    const bg = c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#0a0e1a'); bg.addColorStop(1,'#111825');
    c.fillStyle = bg; c.fillRect(0,0,w,h);

    // قطعة أفقية أولى (يمين)
    const s1sx=w*0.52, s1ex=w*0.88, s1y=h*0.32, s1h=h*0.10;
    // قطعة أفقية ثانية (يسار، أسفل)
    const s2sx=w*0.18, s2ex=w*0.52, s2y=h*0.54, s2h=h*0.10;
    // الكوع الرأسي
    const elbowX=s1sx, elbowW=s1h;

    const pcol = (y1,y2) => { const g=c.createLinearGradient(0,y1,0,y2); g.addColorStop(0,'#4A6080'); g.addColorStop(0.4,'#6A8090'); g.addColorStop(1,'#2A3A50'); return g; };

    // رسم الأنابيب
    c.fillStyle=pcol(s1y,s1y+s1h); c.beginPath(); c.roundRect(s1sx,s1y,s1ex-s1sx,s1h,[0,6,6,0]); c.fill();
    c.strokeStyle='rgba(100,160,220,0.35)'; c.lineWidth=1.5; c.stroke();
    c.fillStyle='#3A5070'; c.beginPath(); c.roundRect(elbowX-elbowW*0.1,s1y+s1h*0.5,elbowW*1.2,s2y-s1y,4); c.fill();
    c.strokeStyle='rgba(100,160,220,0.25)'; c.lineWidth=1.5; c.stroke();
    c.fillStyle=pcol(s2y,s2y+s2h); c.beginPath(); c.roundRect(s2sx,s2y,s2ex-s2sx,s2h,[6,0,0,6]); c.fill();
    c.strokeStyle='rgba(100,160,220,0.35)'; c.lineWidth=1.5; c.stroke();

    // الفراغ الداخلي
    c.fillStyle='#080C14';
    c.fillRect(s1sx+4, s1y+s1h*0.2, s1ex-s1sx-8, s1h*0.6);
    c.fillRect(elbowX+s1h*0.15, s1y+s1h*0.7, s1h*0.7, s2y-s1y-s1h*0.2);
    c.fillRect(s2sx+4, s2y+s2h*0.2, s2ex-s2sx-8, s2h*0.6);

    // مصدر الضوء (يمين)
    const srcX=s1ex+w*0.025, srcY=s1y+s1h/2;
    const sg=c.createRadialGradient(srcX,srcY,0,srcX,srcY,w*0.08);
    sg.addColorStop(0,'rgba(255,220,60,1)'); sg.addColorStop(1,'rgba(255,150,0,0)');
    c.fillStyle=sg; c.beginPath(); c.arc(srcX,srcY,w*0.08,0,Math.PI*2); c.fill();
    c.fillStyle='#FFE040'; c.beginPath(); c.arc(srcX,srcY,w*0.022,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,220,80,0.9)'; c.font=`bold ${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='center';
    c.fillText('🔦 مصدر الضوء', srcX, srcY-w*0.05);

    // الضوء يتحرك في الجزء الأول ثم يصطدم
    S.photonT = (S.photonT + 0.007) % 1;
    const seg1Len = s1ex - s1sx;
    const beam1Y = s1y + s1h/2;
    // شعاع ثابت في الجزء الأول
    c.fillStyle='rgba(255,220,50,0.4)'; c.fillRect(s1sx+4, beam1Y-2, seg1Len-8, 4);

    if (S.photonT < 0.5) {
      // الفوتون يتحرك من المصدر (يمين) نحو الكوع (يسار) → من s1ex نحو s1sx
      const px = s1ex - seg1Len*(S.photonT*2);
      const pg=c.createRadialGradient(px,beam1Y,0,px,beam1Y,14);
      pg.addColorStop(0,'rgba(255,255,150,1)'); pg.addColorStop(1,'rgba(255,200,0,0)');
      c.fillStyle=pg; c.beginPath(); c.arc(px,beam1Y,14,0,Math.PI*2); c.fill();
      const tg=c.createLinearGradient(px,0,s1ex,0);
      tg.addColorStop(0,'rgba(255,220,50,0)'); tg.addColorStop(1,'rgba(255,220,50,0.6)');
      c.fillStyle=tg; c.fillRect(px, beam1Y-2, s1ex-px, 4);
    } else {
      const impactAlpha = Math.sin((S.photonT-0.5)*Math.PI*5)*0.5+0.5;
      const impX = elbowX + s1h*0.6;
      const ig=c.createRadialGradient(impX,beam1Y,0,impX,beam1Y,22);
      ig.addColorStop(0,`rgba(255,80,40,${impactAlpha})`); ig.addColorStop(1,'rgba(255,50,0,0)');
      c.fillStyle=ig; c.beginPath(); c.arc(impX,beam1Y,22,0,Math.PI*2); c.fill();
      c.fillStyle=`rgba(255,120,60,${impactAlpha*0.9})`;
      c.font=`bold ${Math.max(14,w*0.028)}px serif`; c.textAlign='center';
      c.fillText('🚫', impX, beam1Y-24);
    }

    // عين (يسار)
    const eyeX=s2sx-w*0.035, eyeY=s2y+s2h/2;
    c.fillStyle='white'; c.beginPath(); c.ellipse(eyeX,eyeY,w*0.03,w*0.019,0,0,Math.PI*2); c.fill();
    c.strokeStyle='#333'; c.lineWidth=1; c.stroke();
    c.fillStyle='#3B82F6'; c.beginPath(); c.arc(eyeX,eyeY,w*0.013,0,Math.PI*2); c.fill();
    c.fillStyle='#111'; c.beginPath(); c.arc(eyeX,eyeY,w*0.007,0,Math.PI*2); c.fill();
    // ظلام حول العين (لا ضوء)
    c.fillStyle='rgba(0,0,0,0.55)'; c.beginPath(); c.ellipse(eyeX,eyeY,w*0.034,w*0.025,0,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,255,255,0.6)'; c.font=`bold ${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='center';
    c.fillText('👁️ عينك', eyeX, eyeY+w*0.048);

    // صندوق النتيجة
    c.fillStyle='rgba(0,0,0,0.6)'; c.strokeStyle='rgba(192,57,43,0.55)'; c.lineWidth=1.5;
    c.beginPath(); c.roundRect(w*0.18,h*0.04,w*0.64,h*0.1,8); c.fill(); c.stroke();
    c.fillStyle='#FF6B6B'; c.font=`bold ${Math.max(10,w*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText('❌ الضوء لا يصل إلى العين!', w*0.5, h*0.105);

    // تسمية
    c.fillStyle='rgba(255,180,100,0.7)'; c.font=`bold ${Math.max(9,w*0.02)}px Tajawal`; c.textAlign='center';
    c.fillText('أنبوب معوج — الضوء يتوقف عند الكوع', w*0.5, h*0.82);
  }

  function draw() {
    if (currentSim !== 'g5shadowsize' || currentTab !== 0) return;
    const w = cv.width, h = cv.height;
    c.clearRect(0,0,w,h);
    if (S.pipeSelected === 'straight') {
      drawStraightPipe(w, h);
    } else {
      drawBentPipe(w, h);
    }
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}
function simG5ShadowInquiry() {
  const S = simState;
  if (!S.sqInit) {
    S.sqInit = true;
    S.sqShape = 0;
    S.sqAnim = 0;
  }

  document.getElementById('simControlsPanel').innerHTML = `
<div class="ctrl-section">
  <div class="ctrl-label">🎭 استقصاء الظل</div>
  <div class="ctrl-desc">انقر على الكانفاس لتغيير الشكل وشاهد ظله الأسود على الحائط</div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">🔷 الأشكال المتاحة</div>
  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:6px" id="sq-btns"></div>
</div>
<div class="q-box">
  <strong>❓ سؤال الكتاب (و٥ · د١):</strong><br>
  ما الشروط اللازمة لتكوّن الظل؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">مصدر ضوء + جسم معتم + سطح لاستقبال الظل.</div>
</div>`;

  const shapes = [
    { label: '🦅', name: 'عصفور' },
    { label: '✋', name: 'يد' },
    { label: '🐘', name: 'فيل' },
    { label: '🏠', name: 'بيت' },
    { label: '⭐', name: 'نجمة' },
  ];

  // بناء أزرار الاختيار
  const btnsEl = document.getElementById('sq-btns');
  if (btnsEl) {
    btnsEl.innerHTML = shapes.map((sh, i) => `
      <button id="sq-btn-${i}" onclick="window._sqSelect(${i})"
        style="padding:8px 4px;border-radius:10px;border:2px solid rgba(26,143,168,0.4);
        background:rgba(26,143,168,0.1);color:#4DC4E0;font-family:Tajawal;font-size:18px;
        cursor:pointer;transition:all .18s;display:flex;flex-direction:column;align-items:center;gap:2px">
        ${sh.label}<span style="font-size:10px;font-weight:600">${sh.name}</span>
      </button>`).join('');
  }

  window._sqSelect = function(i) {
    S.sqShape = i;
    S.sqAnim = 0;
    shapes.forEach((_, idx) => {
      const btn = document.getElementById('sq-btn-' + idx);
      if (!btn) return;
      const active = idx === i;
      btn.style.background = active ? 'rgba(26,143,168,0.45)' : 'rgba(26,143,168,0.1)';
      btn.style.borderColor = active ? '#4DC4E0' : 'rgba(26,143,168,0.4)';
      btn.style.color = active ? '#fff' : '#4DC4E0';
      btn.style.transform = active ? 'scale(1.1)' : 'scale(1)';
    });
    try{playTick&&playTick();}catch(e){}
  };

  // تفعيل أول زر
  setTimeout(() => window._sqSelect(S.sqShape), 50);

  const cv = document.getElementById('simCanvas');
  const c = cv.getContext('2d');
  cv.onclick = function() { window._sqSelect((S.sqShape + 1) % shapes.length); };

  function draw() {
    if (currentSim !== 'g5shadowsize' || currentTab !== 1) { cv.onclick = null; return; }
    S.sqAnim++;
    const w = cv.width, h = cv.height;
    c.clearRect(0, 0, w, h);

    // خلفية مضيئة
    c.fillStyle = '#ffd580';
    c.fillRect(0, 0, w, h);

    // مصدر الضوء (يمين في RTL)
    const lx = w * 0.12, ly = h * 0.30;
    const grd = c.createRadialGradient(lx, ly, 0, lx, ly, w * 0.28);
    grd.addColorStop(0, 'rgba(255,255,200,0.95)');
    grd.addColorStop(1, 'rgba(255,220,100,0)');
    c.fillStyle = grd; c.beginPath(); c.arc(lx, ly, w*0.28, 0, Math.PI*2); c.fill();
    c.fillStyle = '#FFE000'; c.beginPath(); c.arc(lx, ly, w*0.032, 0, Math.PI*2); c.fill();
    c.fillStyle = '#7A5500'; c.font = `bold ${Math.max(9,w*0.019)}px Tajawal`; c.textAlign = 'center';
    c.fillText('مصدر الضوء', lx, ly + w*0.055);

    // الحائط (يسار في RTL)
    c.fillStyle = '#e8d5b0'; c.fillRect(w*0.85, 0, w*0.15, h);
    c.strokeStyle = 'rgba(0,0,0,0.18)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(w*0.85, 0); c.lineTo(w*0.85, h); c.stroke();
    c.fillStyle = '#8A6840'; c.font = `bold ${Math.max(9,w*0.019)}px Tajawal`; c.textAlign = 'center';
    c.fillText('الحائط', w*0.925, h*0.08);

    // الجسم (وسط)
    const ox = w*0.50, oy = h*0.44;
    const fontSize = Math.max(55, w*0.10);
    c.font = `${fontSize}px serif`; c.textAlign = 'center';
    c.fillText(shapes[S.sqShape].label, ox, oy);

    // ── الظل الأسود على الحائط — نفس شكل الإيموجي لكن أسود ──
    const wallX = w * 0.85;
    const objTop    = oy - fontSize * 0.52;
    const objBottom = oy + fontSize * 0.18;
    const objLeft   = ox - fontSize * 0.38;
    const objRight  = ox + fontSize * 0.38;

    function projectToWall(px, py) {
      const t = (wallX - lx) / (px - lx);
      return { x: wallX, y: ly + (py - ly) * t };
    }

    const topProj    = projectToWall(objLeft,  objTop);
    const bottomProj = projectToWall(objRight, objBottom);

    const shadowH = Math.abs(bottomProj.y - topProj.y);
    const shadowW = shadowH * 0.80;
    const shadowCY = (topProj.y + bottomProj.y) / 2;

    // رسم الإيموجي بشكله الحقيقي لكن بلون أسود:
    // نستخدم offscreen canvas لرسم الإيموجي ثم source-in لتلوينه أسود
    const ofc = document.createElement('canvas');
    ofc.width  = Math.ceil(shadowW * 1.4);
    ofc.height = Math.ceil(shadowH * 1.4);
    const oc = ofc.getContext('2d');
    oc.font = `${fontSize}px serif`;
    oc.textAlign = 'center';
    oc.textBaseline = 'middle';
    oc.fillText(shapes[S.sqShape].label, ofc.width/2, ofc.height/2);
    // اجعل كل بكسل غير شفاف أسود
    oc.globalCompositeOperation = 'source-in';
    oc.fillStyle = 'rgba(0,0,0,0.90)';
    oc.fillRect(0,0,ofc.width,ofc.height);

    // ارسم الظل على الكانفاس الرئيسي مع تمديد حسب الإسقاط
    c.save();
    c.filter = 'blur(2px)';
    c.drawImage(ofc,
      wallX + 2,
      shadowCY - ofc.height * (shadowH / ofc.height) * 0.55,
      shadowW,
      shadowH * 1.05
    );
    c.filter = 'none';
    c.restore();

    // ── فوتونات متحركة لتوضيح انتقال الضوء ──
    // نرسم عدة فوتونات في خطوط مستقيمة تنطلق من المصدر
    // بعضها يصطدم بالجسم (يتوقف) والباقي يكمل للحائط
    if (!S.sqPhotonT) S.sqPhotonT = 0;
    S.sqPhotonT = (S.sqPhotonT + 0.012) % 1;
    const pt = S.sqPhotonT;

    // مسارات الفوتونات: [startY نسبي، هل يصطدم؟]
    const photonPaths = [
      { fy: 0.15, blocked: false },  // فوق الجسم → يكمل للحائط
      { fy: 0.35, blocked: true  },  // يصطدم بالجسم
      { fy: 0.50, blocked: true  },  // يصطدم بالجسم
      { fy: 0.65, blocked: true  },  // يصطدم بالجسم
      { fy: 0.80, blocked: false },  // تحت الجسم → يكمل للحائط
    ];

    photonPaths.forEach((pp, idx) => {
      const pSrcY = ly + (h * pp.fy - ly) * 0; // كلها تبدأ من المصدر
      const targetY = h * pp.fy;

      // اتجاه الشعاع من المصدر نحو الهدف
      const dirX = targetY > ly ? (ox - lx) : (wallX - lx);
      // نقطة على الشعاع بنسبة pt
      let fX, fY, blocked = pp.blocked;

      if (!blocked) {
        // مسار مباشر من المصدر إلى الحائط
        const tgt2X = wallX, tgt2Y = targetY;
        fX = lx + (tgt2X - lx) * pt;
        fY = ly  + (tgt2Y - ly) * pt;
      } else {
        // مسار من المصدر نحو مركز الجسم، يتوقف عنده
        const stopX = ox, stopY = oy;
        if (pt < 0.5) {
          fX = lx + (stopX - lx) * (pt * 2);
          fY = ly  + (stopY - ly) * (pt * 2);
        } else {
          // وهج الاصطدام
          fX = stopX; fY = stopY;
        }
      }

      // رسم الفوتون
      const alpha = blocked && pt >= 0.5 ? (1 - (pt - 0.5) * 2) : 0.9;
      const gph = c.createRadialGradient(fX, fY, 0, fX, fY, 7);
      if (blocked && pt >= 0.5) {
        // وهج احمر عند الاصطدام
        gph.addColorStop(0, `rgba(255,100,50,${alpha})`);
        gph.addColorStop(1, 'rgba(255,50,0,0)');
      } else {
        gph.addColorStop(0, `rgba(255,240,120,${alpha})`);
        gph.addColorStop(1, 'rgba(255,200,0,0)');
      }
      c.fillStyle = gph;
      c.beginPath(); c.arc(fX, fY, 7, 0, Math.PI * 2); c.fill();
    });

    // نص توضيحي — سطرين بمسافة
    c.fillStyle = 'rgba(80,40,0,0.72)';
    c.font = `bold ${Math.max(9,w*0.018)}px Tajawal`; c.textAlign = 'center';
    c.fillText('الضوء يسير في خطوط مستقيمة', w*0.5, h*0.89);
    c.fillText('الجسم المعتم يمنعه فيتكوّن الظل', w*0.5, h*0.93);

    // تسمية الشكل
    c.fillStyle = 'rgba(80,40,0,0.7)';
    c.font = `bold ${Math.max(10,w*0.022)}px Tajawal`; c.textAlign = 'center';
    c.fillText(`${shapes[S.sqShape].label} — ${shapes[S.sqShape].name}`, ox, h*0.80);
    c.font = `${Math.max(9,w*0.018)}px Tajawal`;
    c.fillText('انقر لتغيير الشكل', ox, h*0.86);

    // ملاحظة الظل
    c.fillStyle = 'rgba(80,40,0,0.55)';
    c.font = `${Math.max(8,w*0.016)}px Tajawal`; c.textAlign = 'center';
    c.fillText('الظل يحتفظ بملامح الشكل — لكنه أسود بدون تفاصيل', w*0.5, h*0.97);

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}
function simG5TransparentTest() {
  const S = simState;
  if (!S.ttInit2) {
    S.ttInit2 = true;
    S.ttSel = -1;
    S.ttAnim = 0;
    S.ttLightOn = true; // المصباح يدوي — on/off
  }

  const materials = [
    { name:'زجاج شفاف',     icon:'🪟', transmission:0.95, color:'#AEE4FF88', tint:[255,240,80],  type:'شفاف',      desc:'يسمح بمرور الضوء كله تقريباً' },
    { name:'ورق مشمّع',     icon:'📄', transmission:0.55, color:'#FFFACD99', tint:[255,230,120], type:'شبه شفاف',  desc:'يسمح بمرور نصف الضوء' },
    { name:'بلاستيك ملوّن', icon:'🟩', transmission:0.35, color:'#90EE9099', tint:[255,210,80],  type:'شبه شفاف',  desc:'يسمح بمرور جزء من الضوء' },
    { name:'ورق أبيض',      icon:'📃', transmission:0.12, color:'#F5F5F5CC', tint:[180,160,60],  type:'شبه معتم',  desc:'يمنع معظم الضوء' },
    { name:'خشب',           icon:'🪵', transmission:0,    color:'#8B6914CC', tint:[0,0,0],       type:'معتم',      desc:'يمنع الضوء تماماً' },
    { name:'حجر',           icon:'🪨', transmission:0,    color:'#888888CC', tint:[0,0,0],       type:'معتم',      desc:'يمنع الضوء تماماً' },
  ];

  // بناء أزرار الاختيار في لوحة التحكم
  document.getElementById('simControlsPanel').innerHTML = `
<div class="ctrl-section">
  <div class="ctrl-label">🔬 اختبار المواد والضوء</div>
  <div class="ctrl-desc">انقر على مادة لوضعها بين المصبح والحائط وشاهد ظل الروبوت عليه</div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">🔦 المصباح اليدوي</div>
  <button id="tt2-torch-btn" onclick="window._ttToggleLight()"
    style="width:100%;padding:10px;border-radius:12px;border:2px solid #4DC4E0;
    background:rgba(26,143,168,0.3);color:#fff;font-family:Tajawal;font-size:15px;
    font-weight:700;cursor:pointer;transition:all .2s;margin-top:4px">
    🔦 المصباح: <span id="tt2-torch-state">مضاء ✅</span>
  </button>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">🧪 اختر المادة</div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:6px">
    ${materials.map((m,i)=>`
    <button id="tt2-btn-${i}" onclick="window._ttSel(${i})"
      style="padding:8px 4px;border-radius:10px;border:2px solid rgba(26,143,168,0.4);
      background:rgba(26,143,168,0.1);color:#4DC4E0;font-family:Tajawal;font-size:13px;
      font-weight:700;cursor:pointer;transition:all .18s;display:flex;flex-direction:column;align-items:center;gap:2px">
      <span style="font-size:18px">${m.icon}</span>${m.name}
    </button>`).join('')}
  </div>
</div>
<div id="tt2-result" style="margin-top:8px;padding:10px 12px;border-radius:10px;font-family:Tajawal;font-size:13px;display:none"></div>
<div class="ctrl-section" style="margin-top:10px">
  <div class="ctrl-label">🌑 درجات الظل</div>
  <div style="display:flex;flex-direction:column;gap:4px;margin-top:6px;font-family:Tajawal;font-size:12px">
    <div style="display:flex;align-items:center;gap:8px">
      <div style="width:24px;height:16px;border-radius:4px;background:rgba(0,0,0,0.96);border:1px solid rgba(255,255,255,0.15)"></div>
      <span>معتم — ظل غامق جداً (0%)</span>
    </div>
    <div style="display:flex;align-items:center;gap:8px">
      <div style="width:24px;height:16px;border-radius:4px;background:rgba(0,0,0,0.78);border:1px solid rgba(255,255,255,0.15)"></div>
      <span>شبه معتم — ظل غامق (22%)</span>
    </div>
    <div style="display:flex;align-items:center;gap:8px">
      <div style="width:24px;height:16px;border-radius:4px;background:rgba(255,220,80,0.45);border:1px solid rgba(255,255,255,0.15)"></div>
      <span>شبه شفاف — ظل ذهبي خفيف (55%)</span>
    </div>
    <div style="display:flex;align-items:center;gap:8px">
      <div style="width:24px;height:16px;border-radius:4px;background:rgba(255,240,80,0.12);border:1px solid rgba(255,255,255,0.15)"></div>
      <span>شفاف — بقعة ضوء فقط (95%)</span>
    </div>
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٥ · د٢):</strong><br>
  لماذا نستخدم الزجاج في نوافذ البيوت؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">لأنه شفاف يسمح بدخول الضوء للغرفة وفي نفس الوقت يمنع دخول الهواء البارد والحشرات.</div>
</div>`;

  const typeColors = { 'شفاف':'#27AE60', 'شبه شفاف':'#D4901A', 'شبه معتم':'#E67E22', 'معتم':'#C0392B' };

  window._ttToggleLight = function() {
    S.ttLightOn = !S.ttLightOn;
    const stateEl = document.getElementById('tt2-torch-state');
    const btnEl = document.getElementById('tt2-torch-btn');
    if (stateEl) stateEl.textContent = S.ttLightOn ? 'مضاء ✅' : 'مطفأ ❌';
    if (btnEl) {
      btnEl.style.background = S.ttLightOn ? 'rgba(26,143,168,0.3)' : 'rgba(80,80,80,0.3)';
      btnEl.style.borderColor = S.ttLightOn ? '#4DC4E0' : '#888';
    }
    try{playTick&&playTick();}catch(e){}
  };

  window._ttSel = function(i) {
    S.ttSel = i;
    S.ttAnim = 0;
    materials.forEach((_, idx) => {
      const btn = document.getElementById('tt2-btn-' + idx);
      if (!btn) return;
      const active = idx === i;
      btn.style.background = active ? 'rgba(26,143,168,0.45)' : 'rgba(26,143,168,0.1)';
      btn.style.borderColor = active ? '#4DC4E0' : 'rgba(26,143,168,0.4)';
      btn.style.color = active ? '#fff' : '#4DC4E0';
      btn.style.transform = active ? 'scale(1.08)' : 'scale(1)';
    });
    const mat = materials[i];
    const pct = Math.round(mat.transmission * 100);
    const col = typeColors[mat.type] || '#aaa';
    const resultEl = document.getElementById('tt2-result');
    if (resultEl) {
      resultEl.style.display = 'block';
      resultEl.style.background = `rgba(${col==='#27AE60'?'39,174,96':col==='#C0392B'?'192,57,43':'212,144,26'},0.12)`;
      resultEl.style.border = `1.5px solid ${col}55`;
      resultEl.style.color = col;
      resultEl.innerHTML = `<strong>${mat.icon} ${mat.name}</strong> — ${mat.type}<br>
        <span style="font-size:12px;opacity:0.85">${mat.desc} (${pct}% من الضوء يمر)</span>`;
    }
    try{playTick&&playTick();}catch(e){}
  };

  const cv = document.getElementById('simCanvas');
  const c = cv.getContext('2d');

  // دالة رسم المصباح اليدوي الواقعي — يشير للجهة اليسرى (اتجاه الشعاع)
  function drawTorch(cx, cy, w, on) {
    const sz = Math.min(w * 0.06, 52);
    c.save();
    c.translate(cx, cy);
    // نحوّل المحاور: المصباح يشير لليمين
    // المقبض لليسار، الفوهة/العدسة لليمين
    c.rotate(Math.PI / 2);  // دوران 90° عكس عقارب الساعة → الأعلى يصبح اليمين

    // ── جسم المصباح (أسطوانة رأسية) ──
    const bodyW = sz * 0.55;
    const bodyH = sz * 1.6;
    const bodyX = -bodyW / 2;
    const bodyY = -bodyH * 0.35;

    const bodyGrad = c.createLinearGradient(bodyX, 0, bodyX + bodyW, 0);
    bodyGrad.addColorStop(0,   '#2a2a2a');
    bodyGrad.addColorStop(0.3, on ? '#777' : '#555');
    bodyGrad.addColorStop(0.7, on ? '#999' : '#666');
    bodyGrad.addColorStop(1,   '#1a1a1a');
    c.fillStyle = bodyGrad;
    c.beginPath();
    c.roundRect(bodyX, bodyY, bodyW, bodyH, sz * 0.12);
    c.fill();

    // حزوز المقبض
    c.strokeStyle = 'rgba(0,0,0,0.35)';
    c.lineWidth = sz * 0.04;
    for (let i = 0; i < 5; i++) {
      const gy = bodyY + bodyH * 0.55 + i * sz * 0.14;
      c.beginPath();
      c.moveTo(bodyX + sz*0.06, gy);
      c.lineTo(bodyX + bodyW - sz*0.06, gy);
      c.stroke();
    }

    // ── رأس المصباح (أوسع، في الأعلى) ──
    const headH = sz * 0.55;
    const headW = sz * 0.78;
    const headY = bodyY - headH + sz * 0.08;

    const headGrad = c.createLinearGradient(-headW/2, 0, headW/2, 0);
    headGrad.addColorStop(0,   '#222');
    headGrad.addColorStop(0.4, on ? '#999' : '#666');
    headGrad.addColorStop(0.6, on ? '#bbb' : '#777');
    headGrad.addColorStop(1,   '#333');
    c.fillStyle = headGrad;
    c.beginPath();
    c.roundRect(-headW/2, headY, headW, headH, sz * 0.10);
    c.fill();

    // حافة معدنية لامعة حول الرأس
    c.strokeStyle = on ? 'rgba(200,200,200,0.6)' : 'rgba(120,120,120,0.4)';
    c.lineWidth = sz * 0.045;
    c.beginPath();
    c.roundRect(-headW/2, headY, headW, headH, sz * 0.10);
    c.stroke();

    // ── العدسة (دائرة في وسط الرأس) ──
    const lensCY = headY + headH / 2;
    const lensR  = sz * 0.24;

    if (on) {
      // هالة خارجية
      const glow = c.createRadialGradient(0, lensCY, 0, 0, lensCY, lensR * 3.5);
      glow.addColorStop(0, 'rgba(255,250,180,0.85)');
      glow.addColorStop(0.4, 'rgba(255,220,60,0.35)');
      glow.addColorStop(1, 'rgba(255,160,0,0)');
      c.fillStyle = glow;
      c.beginPath(); c.arc(0, lensCY, lensR * 3.5, 0, Math.PI*2); c.fill();
    }

    // جسم العدسة
    c.fillStyle = on ? '#FFE940' : '#2a2a2a';
    c.beginPath(); c.arc(0, lensCY, lensR, 0, Math.PI*2); c.fill();

    if (on) {
      // تدرج داخل العدسة
      const lGrad = c.createRadialGradient(-lensR*0.3, lensCY - lensR*0.3, 0, 0, lensCY, lensR);
      lGrad.addColorStop(0, 'rgba(255,255,220,1)');
      lGrad.addColorStop(0.6, 'rgba(255,235,80,0.8)');
      lGrad.addColorStop(1, 'rgba(255,160,0,0.5)');
      c.fillStyle = lGrad;
      c.beginPath(); c.arc(0, lensCY, lensR, 0, Math.PI*2); c.fill();
      // نقطة لمعان
      c.fillStyle = 'rgba(255,255,255,0.85)';
      c.beginPath(); c.ellipse(-lensR*0.3, lensCY - lensR*0.35, lensR*0.18, lensR*0.12, -0.4, 0, Math.PI*2); c.fill();
    }

    // حلقة معدنية حول العدسة
    c.strokeStyle = on ? 'rgba(180,180,180,0.7)' : 'rgba(80,80,80,0.6)';
    c.lineWidth = sz * 0.04;
    c.beginPath(); c.arc(0, lensCY, lensR + sz*0.03, 0, Math.PI*2); c.stroke();

    // ── زر التشغيل على الجسم ──
    const btnY = bodyY + bodyH * 0.30;
    c.fillStyle = on ? '#E74C3C' : '#555';
    c.beginPath(); c.arc(0, btnY, sz * 0.10, 0, Math.PI*2); c.fill();
    if (on) {
      c.strokeStyle = '#C0392B'; c.lineWidth = sz * 0.03; c.stroke();
    }

    c.restore();
  }

  // دالة رسم روبوت مبسّط (بدل الإيموجي)
  function drawRobot(cx, cy, w) {
    const s = w * 0.038;
    c.save();
    // رأس
    c.fillStyle = '#4DC4E0';
    c.beginPath(); c.roundRect(cx - s*0.7, cy - s*2.0, s*1.4, s*1.2, s*0.2); c.fill();
    c.strokeStyle = '#1A8FA8'; c.lineWidth = 1.5; c.stroke();
    // عيون
    c.fillStyle = '#fff';
    c.beginPath(); c.arc(cx - s*0.3, cy - s*1.55, s*0.2, 0, Math.PI*2); c.fill();
    c.beginPath(); c.arc(cx + s*0.3, cy - s*1.55, s*0.2, 0, Math.PI*2); c.fill();
    c.fillStyle = '#1A2A3A';
    c.beginPath(); c.arc(cx - s*0.28, cy - s*1.53, s*0.1, 0, Math.PI*2); c.fill();
    c.beginPath(); c.arc(cx + s*0.28, cy - s*1.53, s*0.1, 0, Math.PI*2); c.fill();
    // فم
    c.strokeStyle = '#1A8FA8'; c.lineWidth = 1.5;
    c.beginPath(); c.arc(cx, cy - s*1.2, s*0.25, 0.15*Math.PI, 0.85*Math.PI); c.stroke();
    // هوائي
    c.beginPath(); c.moveTo(cx, cy - s*2.0); c.lineTo(cx, cy - s*2.5); c.stroke();
    c.fillStyle = '#E74C3C'; c.beginPath(); c.arc(cx, cy - s*2.55, s*0.12, 0, Math.PI*2); c.fill();
    // جسم
    c.fillStyle = '#5DADE2';
    c.beginPath(); c.roundRect(cx - s*0.8, cy - s*0.8, s*1.6, s*1.4, s*0.15); c.fill();
    c.strokeStyle = '#2E86C1'; c.lineWidth = 1.5; c.stroke();
    // زر صدر
    c.fillStyle = '#FFD700'; c.beginPath(); c.arc(cx, cy - s*0.15, s*0.2, 0, Math.PI*2); c.fill();
    // ذراعان
    c.fillStyle = '#4DC4E0';
    c.beginPath(); c.roundRect(cx - s*1.35, cy - s*0.75, s*0.5, s*1.1, s*0.2); c.fill();
    c.beginPath(); c.roundRect(cx + s*0.85, cy - s*0.75, s*0.5, s*1.1, s*0.2); c.fill();
    // ساقان
    c.fillStyle = '#2E86C1';
    c.beginPath(); c.roundRect(cx - s*0.6, cy + s*0.6, s*0.5, s*0.9, s*0.15); c.fill();
    c.beginPath(); c.roundRect(cx + s*0.1, cy + s*0.6, s*0.5, s*0.9, s*0.15); c.fill();
    c.restore();
  }

  // النقر على الكانفاس — تبديل المادة أو تشغيل/إطفاء المصباح
  cv.onclick = function(e) {
    const rect = cv.getBoundingClientRect();
    const px = ((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX - rect.left) / rect.width * cv.width;
    const py = ((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientY - rect.top) / rect.height * cv.height;
    const w = cv.width, h = cv.height;
    const lx = w * 0.12, ly = h * 0.42;
    const torchR = w * 0.10;
    // نقر على المصباح
    if (Math.hypot(px - lx, py - ly) < torchR) {
      window._ttToggleLight(); return;
    }
    // نقر على المادة
    const matX = cv.width * 0.50, matW = cv.width * 0.16;
    if (px >= matX - matW && px <= matX + matW) {
      if (S.ttSel < 0) window._ttSel(0);
      else window._ttSel((S.ttSel + 1) % materials.length);
    }
  };

  function draw() {
    if (currentSim !== 'g5transparent') { cv.onclick = null; return; }
    S.ttAnim++;
    const w = cv.width, h = cv.height;
    c.clearRect(0, 0, w, h);

    const mat = S.ttSel >= 0 ? materials[S.ttSel] : null;
    const trans = mat ? mat.transmission : 1;
    const lightOn = S.ttLightOn;

    // ── خلفية الغرفة ──
    const ambientR = lightOn ? (20 + Math.round(trans*80)) : 15;
    const ambientG = lightOn ? (20 + Math.round(trans*70)) : 15;
    const roomGrad = c.createLinearGradient(0, 0, w, 0);
    if (lightOn) {
      roomGrad.addColorStop(0, '#fdf0c0');
      roomGrad.addColorStop(0.30, '#f5e090');
      roomGrad.addColorStop(0.42, '#c8b870');
      roomGrad.addColorStop(0.58, `rgba(${ambientR},${ambientG},10,1)`);
      roomGrad.addColorStop(1,    `rgba(${15+Math.round(trans*60)},${15+Math.round(trans*55)},10,1)`);
    } else {
      roomGrad.addColorStop(0, '#1a1a1a');
      roomGrad.addColorStop(1, '#111');
    }
    c.fillStyle = roomGrad; c.fillRect(0, 0, w, h);

    // أرضية
    c.fillStyle = 'rgba(0,0,0,0.10)'; c.fillRect(0, h*0.75, w, h*0.25);
    c.strokeStyle = 'rgba(0,0,0,0.15)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(0, h*0.75); c.lineTo(w, h*0.75); c.stroke();

    // ── المصباح اليدوي (يسار) ──
    const lx = w * 0.12, ly = h * 0.42;

    if (lightOn) {
      // توهج المصباح
      const lg = c.createRadialGradient(lx, ly - Math.min(w*0.06,52)*0.55, 0, lx, ly, w*0.26);
      lg.addColorStop(0, 'rgba(255,240,80,0.95)');
      lg.addColorStop(0.25, 'rgba(255,220,40,0.6)');
      lg.addColorStop(1, 'rgba(255,180,0,0)');
      c.fillStyle = lg; c.beginPath(); c.arc(lx, ly, w*0.30, 0, Math.PI*2); c.fill();
    }
    drawTorch(lx, ly, w, lightOn);

    // نص الزر تحت المصباح
    c.fillStyle = lightOn ? '#7A5500' : '#888';
    c.font = `bold ${Math.max(8,w*0.016)}px Tajawal`; c.textAlign = 'center';
    c.fillText(lightOn ? '🔦 انقر للإطفاء' : '🔦 انقر للتشغيل', lx, ly + w*0.075);

    // ── شعاع الضوء ──
    const matX = w * 0.50, matW = w*0.13, matTop = h*0.18, matBot = h*0.74;
    const beamH = w * 0.05;

    if (lightOn) {
      // شعاع قبل المادة
      const beamGrad1 = c.createLinearGradient(lx + w*0.04, 0, matX - matW/2, 0);
      beamGrad1.addColorStop(0, 'rgba(255,240,80,0.75)');
      beamGrad1.addColorStop(1, 'rgba(255,230,60,0.55)');
      c.fillStyle = beamGrad1;
      c.fillRect(lx + w*0.07, ly - beamH/2, matX - matW/2 - lx - w*0.07, beamH);

      // شعاع بعد المادة
      if (trans > 0) {
        const [tr, tg, tb] = mat ? mat.tint : [255,240,80];
        const beamGrad2 = c.createLinearGradient(matX + matW/2, 0, w*0.87, 0);
        beamGrad2.addColorStop(0, `rgba(${tr},${tg},${tb},${trans * 0.85})`);
        beamGrad2.addColorStop(1, `rgba(${tr},${tg},${tb},${trans * 0.2})`);
        c.fillStyle = beamGrad2;
        c.fillRect(matX + matW/2, ly - beamH/2, w*0.87 - matX - matW/2, beamH * (0.3 + trans * 0.7));
      }
    }

    // ── الروبوت في الوسط (بين المصدر والمادة) ──
    const robotX = w * 0.31, robotY = h * 0.50;
    drawRobot(robotX, robotY, w);
    c.fillStyle = 'rgba(0,0,0,0.45)';
    c.font = `bold ${Math.max(7,w*0.013)}px Tajawal`; c.textAlign = 'center';
    c.fillText('الروبوت', robotX, robotY + w*0.048);
    // اسم المادة تحت الروبوت
    if (mat) {
      const col = typeColors[mat.type] || '#888';
      c.fillStyle = col;
      c.font = `bold ${Math.max(8,w*0.016)}px Tajawal`; c.textAlign = 'center';
      c.fillText(`مصنوع من: ${mat.name}`, robotX, robotY + w*0.068);
    }

    // ── المادة في الوسط (w=0.50) ──
    const shadowAlpha = (mat && lightOn) ? 1 - trans : 0;

    if (mat) {
      // ظل على الأرض
      if (shadowAlpha > 0.05) {
        const shGrad = c.createLinearGradient(matX + matW, 0, w*0.90, 0);
        shGrad.addColorStop(0, `rgba(0,0,0,${shadowAlpha * 0.5})`);
        shGrad.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = shGrad;
        c.fillRect(matX + matW/2, h*0.75, w*0.88 - matX - matW/2, h*0.16);
      }

      // جسم المادة (شبه شفاف لنرى الروبوت والشعاع من خلالها إذا شفافة)
      c.fillStyle = mat.color;
      c.beginPath(); c.roundRect(matX - matW/2, matTop, matW, matBot - matTop, 10); c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 2; c.stroke();

      // أيقونة المادة
      c.font = `${Math.max(20,w*0.040)}px serif`; c.textAlign = 'center';
      c.fillText(mat.icon, matX, h*0.48);

      // اسم المادة
      c.fillStyle = 'rgba(0,0,0,0.75)';
      c.font = `bold ${Math.max(8,w*0.016)}px Tajawal`; c.textAlign = 'center';
      c.fillText(mat.name, matX, matBot + h*0.045);

      // شارة النوع
      const col = typeColors[mat.type] || '#aaa';
      const badgeText = `بواسطة ${mat.name}`;
      c.fillStyle = col + 'DD';
      const badgeW = Math.max(w*0.14, c.measureText(badgeText).width + w*0.03);
      c.beginPath(); c.roundRect(matX - badgeW/2, matTop + h*0.02, badgeW, h*0.05, 5); c.fill();
      c.fillStyle = 'white'; c.font = `bold ${Math.max(7,w*0.015)}px Tajawal`; c.textAlign = 'center';
      c.fillText(badgeText, matX, matTop + h*0.053);

    } else {
      // لا مادة مختارة
      c.fillStyle = 'rgba(0,0,0,0.18)';
      c.beginPath(); c.roundRect(matX - matW/2, matTop, matW, matBot - matTop, 8); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.3)'; c.lineWidth = 2; c.setLineDash([6,5]); c.stroke(); c.setLineDash([]);
      c.fillStyle = 'rgba(255,255,255,0.5)'; c.font = `bold ${Math.max(8,w*0.017)}px Tajawal`; c.textAlign = 'center';
      c.fillText('اختر', matX, h*0.44);
      c.fillText('مادة', matX, h*0.51);
    }

    // ── الحائط (يسار) ──
    c.fillStyle = '#D4C49A';
    c.fillRect(w*0.88, 0, w*0.12, h);
    c.strokeStyle = 'rgba(0,0,0,0.2)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(w*0.88, 0); c.lineTo(w*0.88, h); c.stroke();
    c.fillStyle = '#8A7040'; c.font = `bold ${Math.max(9,w*0.019)}px Tajawal`; c.textAlign = 'center';
    c.fillText('الحائط', w*0.94, h*0.07);

    // ── ظل الروبوت على الحائط ──
    if (lightOn && mat) {
      const wallLeft = w * 0.88;
      const wallCX = w * 0.94;
      const wallCY = ly;
      // حجم الظل أصغر ليبقى داخل الحائط (عرض الحائط = w*0.12)
      const shadowSize = Math.min(w * 0.055, w * 0.058);

      if (shadowAlpha > 0.05) {
        const [tr, tg, tb] = mat.tint;
        const shColor = trans > 0.1
          ? `rgba(${tr},${tg},${tb},${Math.min(0.9, shadowAlpha * 0.85)})`
          : `rgba(0,0,0,${Math.min(0.92, shadowAlpha * 0.92)})`;

        const ofc = document.createElement('canvas');
        const ofcW = Math.ceil(shadowSize * 3.2);
        const ofcH = Math.ceil(shadowSize * 5.5);
        ofc.width = ofcW; ofc.height = ofcH;
        const oc = ofc.getContext('2d');
        oc.save();
        oc.translate(ofcW/2, ofcH * 0.55);
        const s = shadowSize * 0.7;
        oc.fillStyle = '#000';
        // رأس
        oc.beginPath(); oc.roundRect(-s*0.7, -s*2.0, s*1.4, s*1.2, s*0.2); oc.fill();
        // جسم
        oc.beginPath(); oc.roundRect(-s*0.8, -s*0.8, s*1.6, s*1.4, s*0.15); oc.fill();
        // ذراعان
        oc.beginPath(); oc.roundRect(-s*1.35, -s*0.75, s*0.5, s*1.1, s*0.2); oc.fill();
        oc.beginPath(); oc.roundRect(s*0.85, -s*0.75, s*0.5, s*1.1, s*0.2); oc.fill();
        // ساقان
        oc.beginPath(); oc.roundRect(-s*0.6, s*0.6, s*0.5, s*0.9, s*0.15); oc.fill();
        oc.beginPath(); oc.roundRect(s*0.1, s*0.6, s*0.5, s*0.9, s*0.15); oc.fill();
        // هوائي
        oc.beginPath(); oc.moveTo(0, -s*2.0); oc.lineTo(0, -s*2.5);
        oc.strokeStyle = '#000'; oc.lineWidth = s*0.12; oc.stroke();
        oc.beginPath(); oc.arc(0, -s*2.6, s*0.12, 0, Math.PI*2); oc.fill();
        oc.restore();
        oc.globalCompositeOperation = 'source-in';
        oc.fillStyle = shColor;
        oc.fillRect(0, 0, ofcW, ofcH);

        // رسم الظل داخل حدود الحائط فقط
        c.save();
        c.beginPath(); c.rect(wallLeft, 0, w - wallLeft, h); c.clip();
        const blurAmt = trans > 0.3 ? Math.round(trans*3+1) : 1;
        c.filter = `blur(${blurAmt}px)`;
        // نضع مركز الظل عند wallCX
        c.drawImage(ofc, wallCX - ofcW/2, wallCY - ofcH*0.52, ofcW, ofcH);
        c.filter = 'none';
        c.restore();
      } else if (trans > 0.05) {
        const [tr, tg, tb] = mat.tint;
        const wlGrad = c.createRadialGradient(wallCX, wallCY, 0, wallCX, wallCY, w*0.05);
        wlGrad.addColorStop(0, `rgba(${tr},${tg},${tb},${trans * 0.9})`);
        wlGrad.addColorStop(1, `rgba(${tr},${tg},${tb},0)`);
        c.fillStyle = wlGrad; c.beginPath(); c.arc(wallCX, wallCY, w*0.05, 0, Math.PI*2); c.fill();
      }
    } else if (lightOn && !mat) {
      const wlGrad = c.createRadialGradient(w*0.94, ly, 0, w*0.94, ly, w*0.06);
      wlGrad.addColorStop(0, 'rgba(255,240,100,0.9)');
      wlGrad.addColorStop(1, 'rgba(255,220,50,0)');
      c.fillStyle = wlGrad; c.beginPath(); c.arc(w*0.94, ly, w*0.06, 0, Math.PI*2); c.fill();
    }

    // ── تعليمة إذا لا مادة ──
    if (!mat || !lightOn) {
      c.fillStyle = 'rgba(0,0,0,0.5)';
      c.beginPath(); c.roundRect(w*0.18, h*0.87, w*0.64, h*0.10, 20); c.fill();
      c.fillStyle = 'rgba(255,215,0,0.9)';
      c.font = `${Math.max(9,w*0.018)}px Tajawal`; c.textAlign = 'center';
      const msg = !lightOn ? '🔦 اضغط على المصباح لتشغيله' : '👆 اختر مادة من القائمة لاختبارها';
      c.fillText(msg, w/2, h*0.933);
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}
function simG5Silhouette() {
  // ── د٣: دمى الظل — محاكاة عرض دمية الظل ──
  const S = simState;
  if (!S.silInit) {
    S.silInit = true; S.currentShape = 0; S.silAnim = 0;
    S.puppetX = 0.50; S.puppetDragging = false;
  }

  const shapes = [
    { icon:'✋', name:'يد الفراشة', hint:'ضمّ يديك ليكوّنا جناحَي فراشة' },
    { icon:'🐊', name:'تمساح', hint:'أصابعك تمثّل فم التمساح' },
    { icon:'🦅', name:'طائر', hint:'باعد ذراعيك لتمثل الجناحين' },
    { icon:'🐇', name:'أرنب', hint:'رفع أصبعين للأذنين' },
    { icon:'🦊', name:'ثعلب', hint:'يد مفرودة مع أذنين' },
  ];

  document.getElementById('simControlsPanel').innerHTML = `
<div class="ctrl-section">
  <div class="ctrl-label">🎭 عرض دمى الظل</div>
  <div class="ctrl-desc">اختر شكل الدمية واسحبها أقرب أو أبعد من مصدر الضوء لتغيير حجم الظل على الشاشة</div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">🤚 اختر الشكل</div>
  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-top:6px">
    ${shapes.map((sh,i)=>`
    <button id="sil-btn-${i}" onclick="window._silSel(${i})"
      style="padding:7px 2px;border-radius:9px;border:2px solid rgba(212,144,26,0.4);
      background:rgba(212,144,26,0.08);color:#D4901A;font-family:Tajawal;font-size:16px;
      cursor:pointer;transition:all .18s;display:flex;flex-direction:column;align-items:center;gap:1px">
      ${sh.icon}<span style="font-size:9px;font-weight:600">${sh.name}</span>
    </button>`).join('')}
  </div>
</div>
<div id="sil-hint" style="margin-top:6px;padding:8px 10px;background:rgba(212,144,26,0.08);border-radius:8px;
  border:1px solid rgba(212,144,26,0.25);font-family:Tajawal;font-size:13px;color:#D4901A;text-align:center"></div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٥ · د٣):</strong><br>
  لماذا تُستخدم دمى الظل في مسرح الظل؟ وكيف تتحكم بحجمها؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">تُستخدم لأن الجسم المعتم يمنع الضوء فيتكوّن ظل بشكله على الشاشة. يمكن التحكم في الحجم بتقريب الدمية من مصدر الضوء (يكبر الظل) أو إبعادها (يصغر).</div>
</div>`;

  window._silSel = function(i) {
    S.currentShape = i;
    shapes.forEach((_,idx) => {
      const btn = document.getElementById('sil-btn-'+idx);
      if (!btn) return;
      const a = idx===i;
      btn.style.background = a?'rgba(212,144,26,0.4)':'rgba(212,144,26,0.08)';
      btn.style.borderColor = a?'#D4901A':'rgba(212,144,26,0.4)';
      btn.style.color = a?'#fff':'#D4901A';
      btn.style.transform = a?'scale(1.1)':'scale(1)';
    });
    const hintEl = document.getElementById('sil-hint');
    if (hintEl) hintEl.textContent = '💡 ' + shapes[i].hint;
    try{playTick&&playTick();}catch(e){}
  };
  setTimeout(() => window._silSel(S.currentShape), 50);

  const cv = document.getElementById('simCanvas');
  const c = cv.getContext('2d');

  cv.onmousedown = function(e){
    const rect=cv.getBoundingClientRect();
    const mx=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX-rect.left)/rect.width;
    if(Math.abs(mx - S.puppetX) < 0.12) S.puppetDragging=true;
  };
  cv.onmousemove = function(e){
    if(!S.puppetDragging) return;
    const rect=cv.getBoundingClientRect();
    S.puppetX = Math.max(0.2, Math.min(0.80, ((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX-rect.left)/rect.width));
  };
  cv.ontouchstart = function(e){e.preventDefault();
    const rect=cv.getBoundingClientRect();
    S.puppetX=Math.max(0.2,Math.min(0.80,(e.touches[0].clientX-rect.left)/rect.width));
    S.puppetDragging=true;
  };
  cv.ontouchmove = function(e){e.preventDefault();
    if(!S.puppetDragging) return;
    const rect=cv.getBoundingClientRect();
    S.puppetX=Math.max(0.2,Math.min(0.80,(e.touches[0].clientX-rect.left)/rect.width));
  };
  cv.onmouseup = cv.ontouchend = function(){S.puppetDragging=false;};

  function draw(){
    if(currentSim!=='g5silhouette') { cv.onmousedown=cv.onmousemove=cv.ontouchstart=cv.ontouchmove=null; return; }
    S.silAnim++;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);

    const wallX = w*0.80;
    const lx=w*0.08, ly=h*0.40;

    // ── خلفية مسرح الظل ──
    // جانب المصدر: دافئ مضيء
    const bgGrad = c.createLinearGradient(0,0,w,0);
    bgGrad.addColorStop(0,'#FFF5D6');
    bgGrad.addColorStop(0.72,'#FFE090');
    bgGrad.addColorStop(0.80,'#C8A850');
    bgGrad.addColorStop(1,'#B89030');
    c.fillStyle=bgGrad; c.fillRect(0,0,w,h);

    // أرضية
    c.fillStyle='rgba(100,60,0,0.10)'; c.fillRect(0,h*0.76,w,h*0.24);
    c.strokeStyle='rgba(100,60,0,0.18)'; c.lineWidth=1;
    c.beginPath(); c.moveTo(0,h*0.76); c.lineTo(w,h*0.76); c.stroke();

    // ── مخروط الضوء ──
    c.fillStyle='rgba(255,235,100,0.20)';
    c.beginPath(); c.moveTo(lx,ly); c.lineTo(wallX,h*0.05); c.lineTo(wallX,h*0.78); c.closePath(); c.fill();

    // ── الشاشة (يسار) — مستطيل أبيض مضيء ──
    // ظل الشاشة الخلفي
    c.fillStyle='rgba(0,0,0,0.15)'; c.fillRect(wallX+6,4,w-wallX-6,h-4);
    // جسم الشاشة
    c.fillStyle='#FEFAF0';
    c.fillRect(wallX,0,w-wallX,h);
    // إطار الشاشة
    c.strokeStyle='#8B6520'; c.lineWidth=3;
    c.beginPath(); c.moveTo(wallX,0); c.lineTo(wallX,h); c.stroke();
    // خطوط أفقية خفيفة (مظهر القماش)
    for(let i=1;i<6;i++){
      c.strokeStyle='rgba(180,140,60,0.06)'; c.lineWidth=0.5;
      c.beginPath(); c.moveTo(wallX,h*i/6); c.lineTo(w,h*i/6); c.stroke();
    }
    c.fillStyle='#6A4510'; c.font=`bold ${Math.max(10,w*0.020)}px Tajawal`; c.textAlign='center';
    c.fillText('الشاشة', (wallX+w)/2, h*0.06);

    // ── مصدر الضوء ──
    const lg=c.createRadialGradient(lx,ly,0,lx,ly,w*0.20);
    lg.addColorStop(0,'rgba(255,245,100,1)'); lg.addColorStop(0.4,'rgba(255,220,50,0.55)'); lg.addColorStop(1,'rgba(255,200,0,0)');
    c.fillStyle=lg; c.beginPath(); c.arc(lx,ly,w*0.20,0,Math.PI*2); c.fill();
    c.fillStyle='#FFE800'; c.beginPath(); c.arc(lx,ly,w*0.026,0,Math.PI*2); c.fill();
    c.strokeStyle='#CC9900'; c.lineWidth=2; c.stroke();
    c.fillStyle='#5A3800'; c.font=`bold ${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='center';
    c.fillText('مصدر الضوء', lx, ly+w*0.052);

    // ── الدمية ──
    const px = S.puppetX*w;
    const puppetBodyH = h*0.38;  // ارتفاع جسم الدمية
    const puppetTopY  = h*0.20;  // أعلى الدمية
    const puppetBotY  = puppetTopY + puppetBodyH;
    const puppetCY    = (puppetTopY + puppetBotY) / 2;
    const fontSize    = Math.max(48, w*0.088);

    // حساب موضع الظل على الشاشة (إسقاط من المصدر)
    const distRatio   = Math.max(0, Math.min(1, (S.puppetX - 0.12) / (0.78 - 0.12)));
    const shadowScale = 3.6 - distRatio * 2.8;  // 3.6× قريب → 0.8× بعيد
    const shH = fontSize * shadowScale * 0.72;
    const shW = fontSize * shadowScale * 0.62;

    // موضع مركز الظل على الشاشة (إسقاط هندسي)
    const tRatio = (wallX - lx) / (px - lx);
    const shadowCY = ly + (puppetCY - ly) * tRatio;

    // ── رسم الظل على الشاشة: نفس شكل الإيموجي لكن أسود ──
    const ofc = document.createElement('canvas');
    ofc.width  = Math.ceil(shW * 1.5 + 20);
    ofc.height = Math.ceil(shH * 1.5 + 20);
    const oc = ofc.getContext('2d');
    oc.font = `${fontSize}px serif`;
    oc.textAlign = 'center';
    oc.textBaseline = 'middle';
    oc.fillText(shapes[S.currentShape].icon, ofc.width/2, ofc.height/2);
    oc.globalCompositeOperation = 'source-in';
    oc.fillStyle = 'rgba(0,0,0,0.88)';
    oc.fillRect(0,0,ofc.width,ofc.height);
    // رسمه على الشاشة الرئيسية
    c.save();
    c.filter = 'blur(1.5px)';
    c.drawImage(ofc,
      wallX + 3,
      shadowCY - shH*0.55,
      shW, shH
    );
    c.filter = 'none';
    c.restore();

    // أشعة حدود الظل (خطوط متقطعة)
    c.strokeStyle='rgba(200,150,10,0.25)'; c.lineWidth=1.2; c.setLineDash([5,7]);
    c.beginPath(); c.moveTo(lx,ly); c.lineTo(px, puppetTopY); c.lineTo(wallX, shadowCY-shH*0.52); c.stroke();
    c.beginPath(); c.moveTo(lx,ly); c.lineTo(px, puppetBotY); c.lineTo(wallX, shadowCY+shH*0.48); c.stroke();
    c.setLineDash([]);

    // ── رسم الدمية (الإيموجي الملوّن) ──
    c.font=`${fontSize}px serif`; c.textAlign='center';
    c.fillText(shapes[S.currentShape].icon, px, puppetCY + fontSize*0.35);

    // عصا الدمية (خط رأسي من القاعدة للأرضية)
    c.strokeStyle='#6B3A10'; c.lineWidth=4;
    c.beginPath(); c.moveTo(px, puppetBotY+fontSize*0.05); c.lineTo(px, h*0.76); c.stroke();
    // قبضة العصا
    c.fillStyle='#8B4513';
    c.beginPath(); c.roundRect(px-14, h*0.72, 28, h*0.06, 5); c.fill();

    // مؤشر "اسحب" تحت القبضة
    if(!S.puppetDragging){
      c.fillStyle='rgba(60,30,0,0.55)';
      c.beginPath(); c.roundRect(px-w*0.08, h*0.79, w*0.16, h*0.065, 8); c.fill();
      c.fillStyle='rgba(255,240,160,0.95)'; c.font=`${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='center';
      c.fillText('← اسحب →', px, h*0.835);
    }

    // اسم الشكل
    c.fillStyle='rgba(60,30,0,0.60)'; c.font=`bold ${Math.max(9,w*0.019)}px Tajawal`; c.textAlign='center';
    c.fillText(shapes[S.currentShape].name, px, h*0.88);

    // صندوق المعلومات
    const shadowSizeCm = Math.round(shadowScale * 10);
    const statusTxt = distRatio<0.28?'قريب — ظل كبير':distRatio>0.72?'بعيد — ظل صغير':'متوسط';
    c.fillStyle='rgba(60,30,0,0.48)'; c.strokeStyle='rgba(180,130,10,0.55)'; c.lineWidth=1;
    c.beginPath(); c.roundRect(w*0.16,h*0.02,w*0.56,h*0.09,7); c.fill(); c.stroke();
    c.fillStyle='#FFD040'; c.font=`bold ${Math.max(10,w*0.021)}px Tajawal`; c.textAlign='center';
    c.fillText(`حجم الظل: ${shadowSizeCm} وحدة  |  ${statusTxt}`, w*0.44, h*0.078);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG5ShadowFactor() {
  // ── د٤: ما الذي يؤثر على حجم الظل؟ ── ثلاثة متغيرات
  const S = simState;
  if (!S.sf2Init) {
    S.sf2Init = true;
    S.sf2Variable = 'objDist'; // المتغير النشط
    S.sf2ObjDist  = 50;  // مسافة الجسم من المصدر (20–120 سم)
    S.sf2WallDist = 50;  // مسافة الجسم من الشاشة (10–80 سم)
    S.sf2ObjSize  = 5;   // حجم الجسم (2–12 سم)
    S.sf2Recorded = {};
    S.sf2Anim = 0;
  }

  document.getElementById('simControlsPanel').innerHTML = `
<div class="ctrl-section">
  <div class="ctrl-label">📏 اختر المتغيّر</div>
  <div class="ctrl-btns-grid">
    <button id="sf-v1" class="ctrl-btn action" onclick="window._sfVar('objDist')">🔦 غيّر مسافة مصدر الضوء</button>
    <button id="sf-v2" class="ctrl-btn" onclick="window._sfVar('wallDist')">🖥 غيّر مسافة الشاشة</button>
    <button id="sf-v3" class="ctrl-btn" onclick="window._sfVar('objSize')">📦 غيّر حجم الجسم</button>
  </div>
</div>
<div id="sf-slider-wrap" class="ctrl-section" style="margin-top:4px">
  <div class="ctrl-label" id="sf-slider-label"></div>
  <input id="sf-slider" type="range" style="width:100%" oninput="window._sfSlide(this.value)">
</div>
<div class="ctrl-section" style="padding:10px 12px;background:rgba(255,215,0,0.07);border-radius:10px;border:1px solid rgba(255,215,0,0.2)">
  <div class="ctrl-label" style="color:#FFD700">📊 القياسات المسجّلة</div>
  <div id="sf-table" style="margin-top:5px;font-family:Tajawal;font-size:12px;color:rgba(255,255,255,0.75)">
    جرّب قيماً مختلفة لتسجّل القياسات
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٥ · د٤):</strong><br>
  ما العوامل التي تؤثر على حجم الظل؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">١- مسافة الجسم عن مصدر الضوء: كلما اقترب الجسم كبر الظل<br>٢- مسافة الجسم عن الشاشة: كلما ابتعد الجسم عن الشاشة كبر الظل<br>٣- حجم الجسم: كلما كبر الجسم كبر ظله</div>
</div>`;

  const varCfg = {
    objDist:  { label:'مسافة مصدر الضوء عن الجسم (الجسم والشاشة ثابتان)', min:20, max:120, unit:'سم', key:'sf2ObjDist' },
    wallDist: { label:'مسافة الشاشة عن الجسم (الجسم ومصدر الضوء ثابتان)', min:10, max:80,  unit:'سم', key:'sf2WallDist' },
    objSize:  { label:'حجم الجسم (مصدر الضوء والشاشة ثابتان)',             min:2,  max:14,  unit:'سم', key:'sf2ObjSize' },
  };

  function updateSlider() {
    const cfg = varCfg[S.sf2Variable];
    const slEl = document.getElementById('sf-slider');
    const lbEl = document.getElementById('sf-slider-label');
    if (!slEl || !lbEl) return;
    slEl.min = cfg.min; slEl.max = cfg.max; slEl.value = S[cfg.key];
    lbEl.textContent = `${cfg.label}: ${S[cfg.key]} ${cfg.unit}`;
  }

  function calcShadow() {
    // نموذج بسيط: الظل = (حجم الجسم × مسافة الشاشة) / مسافة المصدر
    return Math.round((S.sf2ObjSize * (S.sf2ObjDist + S.sf2WallDist)) / S.sf2ObjDist * 3);
  }

  function updateTable() {
    const tableEl = document.getElementById('sf-table');
    if (!tableEl) return;
    const rec = S.sf2Recorded;
    const keys = Object.keys(rec);
    if (keys.length === 0) { tableEl.textContent = 'جرّب قيماً مختلفة لتسجّل القياسات'; return; }
    const cfg = varCfg[S.sf2Variable];
    tableEl.innerHTML = `<table style="width:100%;border-collapse:collapse;text-align:center">
      <tr style="color:#4DC4E0;border-bottom:1px solid rgba(255,255,255,0.15)">
        <td style="padding:3px">${cfg.label}</td>
        ${keys.map(k=>`<td style="padding:3px">${k}</td>`).join('')}
      </tr>
      <tr>
        <td style="padding:3px;color:#FFD700">الظل (سم)</td>
        ${keys.map(k=>`<td style="padding:3px;color:#FFD700;font-weight:700">${rec[k]}</td>`).join('')}
      </tr>
    </table>
    ${keys.length>=3?'<div style="margin-top:5px;color:#90EE90;font-size:11px">💡 لاحظ الاتجاه!</div>':''}`;
  }

  window._sfVar = function(v) {
    S.sf2Variable = v; S.sf2Recorded = {};
    ['v1','v2','v3'].forEach((id,i) => {
      const btn = document.getElementById('sf-'+id);
      if (!btn) return;
      const vs = ['objDist','wallDist','objSize'][i];
      btn.className = 'ctrl-btn' + (vs===v?' action':'');
    });
    updateSlider(); updateTable();
  };

  window._sfSlide = function(val) {
    const cfg = varCfg[S.sf2Variable];
    S[cfg.key] = +val;
    const lbEl = document.getElementById('sf-slider-label');
    if (lbEl) lbEl.textContent = `${cfg.label}: ${val} ${cfg.unit}`;
    const shadow = calcShadow();
    S.sf2Recorded[val] = shadow;
    updateTable();
    try{playTick&&playTick();}catch(e){}
  };

  updateSlider(); updateTable();

  const cv = document.getElementById('simCanvas');
  const c = cv.getContext('2d');

  // الشكل الحالي للدمية حسب المتغير النشط
  const puppetShapes = [
    { icon:'✋', name:'يد' },
    { icon:'🦅', name:'طائر' },
    { icon:'🐇', name:'أرنب' },
    { icon:'🐊', name:'تمساح' },
    { icon:'🦊', name:'ثعلب' },
  ];
  if (!S.sfPuppetShape) S.sfPuppetShape = 0;
  if (!S.sfPuppetX) S.sfPuppetX = 0.50;
  S.sfPuppetDragging = S.sfPuppetDragging || false;

  // إضافة أزرار اختيار الدمية للتحكم
  const existingPuppetBtns = document.getElementById('sf-puppet-btns');
  if (!existingPuppetBtns) {
    const puppetWrap = document.createElement('div');
    puppetWrap.className = 'ctrl-section';
    puppetWrap.id = 'sf-puppet-section';
    puppetWrap.innerHTML = `<div class="ctrl-label">🎭 اختر شكل الدمية</div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-top:6px" id="sf-puppet-btns">
        ${puppetShapes.map((sh,i)=>`<button id="sfp-btn-${i}" onclick="window._sfpSel(${i})"
          style="padding:6px 2px;border-radius:8px;border:2px solid rgba(212,144,26,0.4);
          background:rgba(212,144,26,0.08);color:#D4901A;font-family:Tajawal;font-size:15px;
          cursor:pointer;transition:all .18s;display:flex;flex-direction:column;align-items:center;gap:1px">
          ${sh.icon}<span style="font-size:9px;font-weight:600">${sh.name}</span></button>`).join('')}
      </div>`;
    const ctrlPanel = document.getElementById('simControlsPanel');
    if (ctrlPanel) {
      const qbox = ctrlPanel.querySelector('.q-box');
      if (qbox) ctrlPanel.insertBefore(puppetWrap, qbox);
      else ctrlPanel.appendChild(puppetWrap);
    }
  }
  window._sfpSel = function(i) {
    S.sfPuppetShape = i;
    puppetShapes.forEach((_,idx) => {
      const b = document.getElementById('sfp-btn-'+idx);
      if (!b) return;
      b.style.background = idx===i?'rgba(212,144,26,0.45)':'rgba(212,144,26,0.08)';
      b.style.borderColor = idx===i?'#D4901A':'rgba(212,144,26,0.4)';
      b.style.color = idx===i?'#fff':'#D4901A';
    });
  };
  setTimeout(()=>window._sfpSel(S.sfPuppetShape), 60);

  function getEvtX(e) {
    const rect = cv.getBoundingClientRect();
    const src = (e.touches&&e.touches[0]) || (e.changedTouches&&e.changedTouches[0]) || e;
    return src.clientX - rect.left;
  }

  cv.onmousedown = function(e) {
    if(currentSim!=='g5shadowfactor') return;
    const px = getEvtX(e);
    const cw = cv.width;
    if (S.sf2Variable === 'objDist') {
      // حساب موضع المصدر الحالي
      const puppetFixed = cw * 0.52;
      const lightX_cur = puppetFixed - (S.sf2ObjDist / 120) * (puppetFixed - cw*0.04);
      if (Math.abs(px - lightX_cur) < cw * 0.12) S.sfDragging = 'light';
    } else if (S.sf2Variable === 'wallDist') {
      // الشاشة تتحرك — نحسب موضعها الحالي
      const puppetFixed = cw * 0.45;
      const wallX_cur = puppetFixed + (S.sf2WallDist / 80) * (cw * 0.48);
      if (Math.abs(px - wallX_cur) < cw * 0.10) S.sfDragging = 'wall';
    }
    // objSize → لا سحب
  };

  cv.onmousemove = function(e) {
    if (!S.sfDragging || currentSim!=='g5shadowfactor') return;
    const px = getEvtX(e);
    const cw = cv.width;
    if (S.sfDragging === 'light') {
      // سحب مصدر الضوء — الجسم ثابت في 0.52
      const puppetFixed = cw * 0.52;
      const dist = Math.max(0, puppetFixed - px);
      S.sf2ObjDist = Math.round(Math.max(20, Math.min(120, (dist / (puppetFixed - cw*0.04)) * 120)));
      const sl = document.getElementById('sf-slider'); if(sl){sl.value=S.sf2ObjDist; sl.dispatchEvent(new Event('input'));}
    } else if (S.sfDragging === 'wall') {
      // سحب الشاشة — الجسم ثابت في 0.45
      const puppetFixed = cw * 0.45;
      const dist = Math.max(0, px - puppetFixed);
      S.sf2WallDist = Math.round(Math.max(10, Math.min(80, (dist / (cw * 0.48)) * 80)));
      const sl = document.getElementById('sf-slider'); if(sl){sl.value=S.sf2WallDist; sl.dispatchEvent(new Event('input'));}
    }
  };

  cv.ontouchstart = function(e) { e.preventDefault(); cv.onmousedown(e); };
  cv.ontouchmove  = function(e) { e.preventDefault(); cv.onmousemove(e); };
  cv.onmouseup = cv.onmouseleave = cv.ontouchend = function() { S.sfDragging = null; };

  function draw() {
    if (currentSim !== 'g5shadowfactor' || currentTab !== 0) {
      cv.onmousedown=cv.onmousemove=cv.ontouchstart=cv.ontouchmove=null; return;
    }
    S.sf2Anim++;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);

    // ── عرض دمى الظل مع تأثير المتغيرات ──
    const shadowCm = calcShadow();

    // حساب مواضع ديناميكية من المتغيرات
    const totalRange = w * 0.87;

    // حساب مواضع العناصر حسب المتغير النشط
    let lightX, puppetX, wallX;
    const ly = h * 0.40;

    if (S.sf2Variable === 'objDist') {
      // المصدر يتحرك — الجسم والشاشة ثابتان
      puppetX = w * 0.52;
      wallX   = w * 0.82;
      // المصدر: كلما زاد sf2ObjDist ابتعد عن الجسم (تحرك يساراً)
      lightX  = puppetX - (S.sf2ObjDist / 120) * (puppetX - w*0.04);
      lightX  = Math.max(w*0.04, lightX);
    } else if (S.sf2Variable === 'wallDist') {
      // الشاشة تتحرك — الجسم والمصدر ثابتان
      lightX  = w * 0.08;
      puppetX = w * 0.45;
      wallX   = puppetX + (S.sf2WallDist / 80) * (w * 0.48);
      wallX   = Math.min(wallX, w * 0.93);
    } else {
      // حجم الجسم — الكل ثابت
      lightX  = w * 0.08;
      puppetX = w * 0.48;
      wallX   = w * 0.82;
    }
    const lx = lightX;

    // خلفية مسرح الظل — تتحول مع موضع الشاشة
    const wallFrac = wallX / w;
    const bgGrad = c.createLinearGradient(0,0,w,0);
    bgGrad.addColorStop(0,'#FFF5D6');
    bgGrad.addColorStop(Math.max(0.4, wallFrac - 0.08),'#FFE090');
    bgGrad.addColorStop(wallFrac,'#C8A850');
    bgGrad.addColorStop(1,'#B89030');
    c.fillStyle=bgGrad; c.fillRect(0,0,w,h);

    // أرضية
    c.fillStyle='rgba(100,60,0,0.10)'; c.fillRect(0,h*0.76,w,h*0.24);
    c.strokeStyle='rgba(100,60,0,0.18)'; c.lineWidth=1;
    c.beginPath(); c.moveTo(0,h*0.76); c.lineTo(w,h*0.76); c.stroke();

    // مخروط الضوء (يتوسع حتى الشاشة)
    c.fillStyle='rgba(255,235,100,0.22)';
    c.beginPath(); c.moveTo(lx,ly); c.lineTo(wallX,h*0.04); c.lineTo(wallX,h*0.78); c.closePath(); c.fill();

    // الشاشة (تتحرك)
    c.fillStyle='rgba(0,0,0,0.12)'; c.fillRect(wallX+5,4,w-wallX-5,h-4);
    c.fillStyle='#FEFAF0'; c.fillRect(wallX,0,w-wallX,h);
    c.strokeStyle='#8B6520'; c.lineWidth=3;
    c.beginPath(); c.moveTo(wallX,0); c.lineTo(wallX,h); c.stroke();
    c.fillStyle='#6A4510'; c.font=`bold ${Math.max(10,w*0.020)}px Tajawal`; c.textAlign='center';
    c.fillText('الشاشة', Math.min(wallX + w*0.06, w - 10), h*0.06);

    // مصدر الضوء
    const lg=c.createRadialGradient(lx,ly,0,lx,ly,w*0.20);
    lg.addColorStop(0,'rgba(255,245,100,1)'); lg.addColorStop(0.4,'rgba(255,220,50,0.55)'); lg.addColorStop(1,'rgba(255,200,0,0)');
    c.fillStyle=lg; c.beginPath(); c.arc(lx,ly,w*0.20,0,Math.PI*2); c.fill();
    c.fillStyle='#FFE800'; c.beginPath(); c.arc(lx,ly,w*0.026,0,Math.PI*2); c.fill();
    c.strokeStyle='#CC9900'; c.lineWidth=2; c.stroke();
    c.fillStyle='#5A3800'; c.font=`bold ${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='center';
    c.fillText('مصدر الضوء', lx, ly+w*0.052);

    // الدمية
    const puppetBodyH = h*0.38;
    const puppetTopY  = h*0.20;
    const puppetBotY  = puppetTopY + puppetBodyH;
    const puppetCY    = (puppetTopY + puppetBotY) / 2;
    const fontSize    = Math.max(42, w*0.080) * (S.sf2ObjSize/7);

    // حساب حجم الظل بناءً على القانون الفيزيائي الحقيقي
    // shadowSize/objSize = (objDist + wallDist) / objDist
    const physScale = (S.sf2ObjDist + S.sf2WallDist) / S.sf2ObjDist;
    const shadowScale = Math.min(physScale, 5.0);
    const shH = fontSize * shadowScale * 0.80;
    const shW = fontSize * shadowScale * 0.70;
    const tRatio = (wallX - lx) / Math.max(1, puppetX - lx);
    const shadowCY = ly + (puppetCY - ly) * tRatio;

    // ظل الدمية على الشاشة — يُرسم بحجم مكبّر يعكس المتغيرات
    const shadowFontSize = fontSize * shadowScale;
    const ofc = document.createElement('canvas');
    ofc.width  = Math.ceil(shadowFontSize * 1.5 + 20);
    ofc.height = Math.ceil(shadowFontSize * 1.5 + 20);
    const oc = ofc.getContext('2d');
    oc.font = `${shadowFontSize}px serif`;
    oc.textAlign = 'center'; oc.textBaseline = 'middle';
    oc.fillText(puppetShapes[S.sfPuppetShape].icon, ofc.width/2, ofc.height/2);
    oc.globalCompositeOperation = 'source-in';
    oc.fillStyle = 'rgba(0,0,0,0.90)';
    oc.fillRect(0,0,ofc.width,ofc.height);
    c.save();
    // clip داخل الشاشة فقط
    c.beginPath(); c.rect(wallX, 0, w - wallX, h); c.clip();
    c.filter = 'blur(1.5px)';
    c.drawImage(ofc, wallX+3, shadowCY - ofc.height*0.5, ofc.width, ofc.height);
    c.filter = 'none'; c.restore();

    // أشعة حواف الظل
    c.strokeStyle='rgba(200,150,10,0.25)'; c.lineWidth=1.2; c.setLineDash([5,7]);
    c.beginPath(); c.moveTo(lx,ly); c.lineTo(puppetX, puppetTopY); c.lineTo(wallX, shadowCY-shH*0.52); c.stroke();
    c.beginPath(); c.moveTo(lx,ly); c.lineTo(puppetX, puppetBotY); c.lineTo(wallX, shadowCY+shH*0.48); c.stroke();
    c.setLineDash([]);

    // الدمية (ملوّنة)
    c.font=`${fontSize}px serif`; c.textAlign='center';
    c.fillText(puppetShapes[S.sfPuppetShape].icon, puppetX, puppetCY + fontSize*0.35);

    // عصا الدمية
    c.strokeStyle='#6B3A10'; c.lineWidth=4;
    c.beginPath(); c.moveTo(puppetX, puppetBotY+fontSize*0.05); c.lineTo(puppetX, h*0.76); c.stroke();
    c.fillStyle='#8B4513';
    c.beginPath(); c.roundRect(puppetX-14, h*0.72, 28, h*0.06, 5); c.fill();

    // مؤشر السحب — على العنصر المتحرك حسب المتغير
    if (S.sf2Variable === 'objDist') {
      // مؤشر على مصدر الضوء
      c.fillStyle='rgba(60,30,0,0.55)';
      c.beginPath(); c.roundRect(lx-w*0.07, ly+w*0.055, w*0.14, h*0.065, 8); c.fill();
      c.fillStyle='rgba(255,240,160,0.95)'; c.font=`${Math.max(9,w*0.017)}px Tajawal`; c.textAlign='center';
      c.fillText('← اسحب →', lx, ly+w*0.055+h*0.045);
    } else if (S.sf2Variable === 'wallDist') {
      // مؤشر على الشاشة
      c.fillStyle='rgba(60,30,0,0.55)';
      c.beginPath(); c.roundRect(wallX-w*0.07, h*0.79, w*0.14, h*0.065, 8); c.fill();
      c.fillStyle='rgba(255,240,160,0.95)'; c.font=`${Math.max(9,w*0.017)}px Tajawal`; c.textAlign='center';
      c.fillText('← اسحب →', wallX, h*0.835);
    }

    // صندوق المعلومات
    const varLabel = S.sf2Variable==='wallDist'
      ? `مسافة الشاشة: ${S.sf2WallDist}سم  |  ظل: ${shadowCm}سم`
      : S.sf2Variable==='objDist'
      ? `مسافة المصدر: ${S.sf2ObjDist}سم  |  ظل: ${shadowCm}سم`
      : `حجم الجسم: ${S.sf2ObjSize}سم  |  ظل: ${shadowCm}سم`;
    const statusTxt = shadowScale > 2.5 ? '— ظل كبير' : shadowScale < 1.5 ? '— ظل صغير' : '— ظل متوسط';
    c.fillStyle='rgba(60,30,0,0.48)'; c.strokeStyle='rgba(180,130,10,0.55)'; c.lineWidth=1;
    c.beginPath(); c.roundRect(w*0.10,h*0.02,w*0.70,h*0.09,7); c.fill(); c.stroke();
    c.fillStyle='#FFD040'; c.font=`bold ${Math.max(10,w*0.021)}px Tajawal`; c.textAlign='center';
    c.fillText(`${varLabel}  ${statusTxt}`, w*0.45, h*0.078);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG5ShadowFactorSize() {
  // ── د٥: طول الظل خلال اليوم (عصا شمسية) ──
  const S = simState;
  if (!S.sun5Init) {
    S.sun5Init = true;
    S.sun5Hour = 6; // من 6 صباحاً إلى 18 مساءً
    S.sun5Recorded = {};
    S.sun5Anim = 0;
  }

  document.getElementById('simControlsPanel').innerHTML = `
<div class="ctrl-section">
  <div class="ctrl-label">☀️ العصا الشمسية</div>
  <div class="ctrl-desc">غيّر الوقت وشاهد كيف يتغيّر طول الظل واتجاهه خلال اليوم</div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">🕐 الوقت: <span id="sun5-time">06:00</span></div>
  <input id="sun5-slider" type="range" min="6" max="18" step="1" value="6" oninput="window._sun5Set(+this.value)" style="width:100%">
  <div style="display:flex;justify-content:space-between;font-family:Tajawal;font-size:11px;color:rgba(255,255,255,0.5);margin-top:2px">
    <span>6 ص</span><span>9 ص</span><span>12 ظ</span><span>3 م</span><span>6 م</span>
  </div>
</div>
<div class="ctrl-section" style="padding:10px 12px;background:rgba(255,215,0,0.07);border-radius:10px;border:1px solid rgba(255,215,0,0.2)">
  <div class="ctrl-label" style="color:#FFD700">📊 القياسات</div>
  <div id="sun5-table" style="margin-top:5px;font-family:Tajawal;font-size:12px;color:rgba(255,255,255,0.75)">
    جرّب أوقاتاً مختلفة لتسجّل القياسات
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٥ · د٥):</strong><br>
  متى يكون الظل أطول؟ ومتى يكون أقصر؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">أطول ما يكون في الصباح الباكر وآخر النهار لأن الشمس تكون قريبة من الأفق (زاوية منخفضة). أقصر ما يكون عند الظهيرة لأن الشمس تكون في أعلى نقطة (قريبة من الوضع العمودي).</div>
</div>`;

  function calcShadow(h) {
    // الزاوية: 6ص=0°، 12ظ=90°(عمودي)، 18م=0°
    const angle = Math.abs(h - 12) / 6; // 1=أفق، 0=ظهيرة
    const shadowLen = Math.round(angle * 85 + 5);
    return shadowLen;
  }

  function updateTable() {
    const tableEl = document.getElementById('sun5-table');
    if (!tableEl) return;
    const rec = S.sun5Recorded;
    const keys = Object.keys(rec).sort((a,b)=>a-b);
    if (!keys.length) { tableEl.textContent='جرّب أوقاتاً مختلفة لتسجّل القياسات'; return; }
    tableEl.innerHTML = `<table style="width:100%;border-collapse:collapse;text-align:center">
      <tr style="color:#4DC4E0;border-bottom:1px solid rgba(255,255,255,0.15)">
        <td style="padding:3px">الوقت</td>${keys.map(k=>`<td style="padding:3px">${k}:00</td>`).join('')}
      </tr>
      <tr>
        <td style="padding:3px;color:#FFD700">الظل (سم)</td>${keys.map(k=>`<td style="padding:3px;color:#FFD700;font-weight:700">${rec[k]}</td>`).join('')}
      </tr>
    </table>
    ${keys.length>=4?'<div style="margin-top:4px;color:#90EE90;font-size:11px">💡 في الظهيرة (12) الظل أقصر ما يكون!</div>':''}`;
  }

  window._sun5Set = function(h) {
    S.sun5Hour = h;
    const timeEl = document.getElementById('sun5-time');
    if (timeEl) timeEl.textContent = `${String(h).padStart(2,'0')}:00`;
    S.sun5Recorded[h] = calcShadow(h);
    updateTable();
    try{playTick&&playTick();}catch(e){}
  };

  // تسجيل الوقت الحالي
  if (!S.sun5Recorded[S.sun5Hour]) window._sun5Set(S.sun5Hour);

  const cv = document.getElementById('simCanvas');
  const c = cv.getContext('2d');

  function draw() {
    if (currentSim !== 'g5shadowfactor' || currentTab !== 1) return;
    S.sun5Anim++;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);

    const hour = S.sun5Hour;
    const shadowCm = calcShadow(hour);
    // الزاوية من الشمس (0=أفق، π/2=قمة)
    const sunElevAngle = (1 - Math.abs(hour-12)/6) * Math.PI/2;
    // الشمس تكون شرقاً قبل 12 وغرباً بعدها
    const sunSide = hour <= 12 ? 1 : -1; // 1=يمين(شرق) -1=يسار(غرب)

    // تدرج السماء حسب الوقت
    const dayFactor = Math.sin(sunElevAngle);
    const skyTop = `rgb(${Math.round(10+dayFactor*120)},${Math.round(20+dayFactor*150)},${Math.round(60+dayFactor*150)})`;
    const skyBot = `rgb(${Math.round(dayFactor*200)},${Math.round(dayFactor*180)},${Math.round(dayFactor*120)})`;
    const skyGrad = c.createLinearGradient(0,0,0,h*0.65);
    skyGrad.addColorStop(0, skyTop); skyGrad.addColorStop(1, skyBot);
    c.fillStyle=skyGrad; c.fillRect(0,0,w,h*0.65);

    // الأرض
    const groundGrad = c.createLinearGradient(0,h*0.65,0,h);
    groundGrad.addColorStop(0,'#8AB840'); groundGrad.addColorStop(1,'#6A8C20');
    c.fillStyle=groundGrad; c.fillRect(0,h*0.65,w,h*0.35);

    // الشمس
    const sunR = w*0.06;
    const sunX = w*0.5 + sunSide * (1 - dayFactor) * w*0.38;
    const sunY = h*0.65 - dayFactor * h*0.55;
    const sunGlow = c.createRadialGradient(sunX,sunY,0,sunX,sunY,sunR*3);
    sunGlow.addColorStop(0,`rgba(255,255,180,${0.5+dayFactor*0.4})`);
    sunGlow.addColorStop(1,'rgba(255,200,0,0)');
    c.fillStyle=sunGlow; c.beginPath(); c.arc(sunX,sunY,sunR*3,0,Math.PI*2); c.fill();
    c.fillStyle=`rgb(255,${Math.round(200+dayFactor*55)},${Math.round(dayFactor*100)})`;
    c.beginPath(); c.arc(sunX,sunY,sunR,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,255,255,0.85)'; c.font=`${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='center';
    c.fillText(`${String(hour).padStart(2,'0')}:00`, sunX, sunY+sunR+h*0.04);

    // العصا
    const stickX = w*0.50, stickBaseY = h*0.65, stickH = h*0.22;
    const stickTopY = stickBaseY - stickH;
    c.strokeStyle='#5A3010'; c.lineWidth=4;
    c.beginPath(); c.moveTo(stickX, stickBaseY); c.lineTo(stickX, stickTopY); c.stroke();
    // رأس العصا
    c.fillStyle='#8B5020'; c.beginPath(); c.arc(stickX, stickTopY, 5, 0, Math.PI*2); c.fill();

    // الظل على الأرض
    const shadowPx = (shadowCm / 90) * w * 0.55;
    const shadowDir = -sunSide; // الظل في الاتجاه المعاكس للشمس
    const shadowEndX = stickX + shadowDir * shadowPx;

    const shGrad = c.createLinearGradient(stickX,0,shadowEndX,0);
    shGrad.addColorStop(0,'rgba(10,30,10,0.90)');
    shGrad.addColorStop(0.6,'rgba(10,30,10,0.60)');
    shGrad.addColorStop(1,'rgba(10,30,10,0)');
    c.fillStyle=shGrad;
    c.beginPath();
    c.moveTo(stickX-5, stickBaseY);
    c.lineTo(stickX+5, stickBaseY);
    c.lineTo(shadowEndX+shadowDir*10, stickBaseY+8);
    c.lineTo(shadowEndX-shadowDir*4, stickBaseY+8);
    c.closePath(); c.fill();

    // خط الأشعة من الشمس عبر رأس العصا
    c.strokeStyle='rgba(255,220,50,0.3)'; c.lineWidth=1.2; c.setLineDash([4,5]);
    c.beginPath(); c.moveTo(sunX,sunY); c.lineTo(stickX,stickTopY); c.lineTo(shadowEndX,stickBaseY); c.stroke();
    c.setLineDash([]);

    // قياس الظل
    const mY = stickBaseY + h*0.09;
    if (Math.abs(shadowPx) > 8) {
      c.strokeStyle='#FFD700'; c.lineWidth=2;
      c.beginPath(); c.moveTo(stickX,mY); c.lineTo(shadowEndX,mY); c.stroke();
      c.fillStyle='#FFD700';
      c.beginPath(); c.moveTo(stickX-4,mY-3); c.lineTo(stickX-4,mY+3); c.lineTo(stickX-8,mY); c.fill();
      c.beginPath(); c.moveTo(shadowEndX+4*shadowDir,mY-3); c.lineTo(shadowEndX+4*shadowDir,mY+3); c.lineTo(shadowEndX+8*shadowDir,mY); c.fill();
      c.fillStyle='#FFD700'; c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`; c.textAlign='center';
      c.fillText(`${shadowCm} سم`, (stickX+shadowEndX)/2, mY-8);
    }

    // صندوق النتيجة
    c.fillStyle='rgba(0,0,0,0.55)'; c.strokeStyle='rgba(255,220,50,0.35)'; c.lineWidth=1;
    c.beginPath(); c.roundRect(w*0.02,h*0.02,w*0.66,h*0.10,7); c.fill(); c.stroke();
    c.fillStyle='#FFE050'; c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`; c.textAlign='right';
    c.fillText(`${String(hour).padStart(2,'0')}:00  |  الظل: ${shadowCm} سم  |  ${hour===12?'أقصر ظل':Math.abs(hour-12)>=5?'أطول ظل':''}`, w*0.67, h*0.085);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG5Sundial() {
  // ── درس ٥-٥: العصا الشمسية المستقلة — مع شمس متحركة وظل واضح ──
  const S = simState;
  if (!S.sunInit) {
    S.sunInit = true;
    S.sunHour = 8;
    S.sunAnimating = false;
    S.sunAutoT = 0;
    S.sunRecorded = {};
    S.sunAnim = 0;
  }

  document.getElementById('simControlsPanel').innerHTML = `
<div class="ctrl-section">
  <div class="ctrl-label">🌞 العصا الشمسية</div>
  <div class="ctrl-desc">غيّر الوقت وراقب كيف تتحرك الشمس عبر السماء ويتغيّر طول الظل</div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">🕐 الوقت: <span id="sdl-time">08:00</span></div>
  <input id="sdl-slider" type="range" min="6" max="18" step="0.5" value="8"
    oninput="window._sdlSet(+this.value)" style="width:100%">
  <div style="display:flex;justify-content:space-between;font-family:Tajawal;font-size:11px;color:rgba(255,255,255,0.55);margin-top:2px">
    <span>٦ص</span><span>٩ص</span><span>١٢ظ</span><span>٣م</span><span>٦م</span>
  </div>
</div>
<div class="ctrl-section">
  <button onclick="window._sdlAnimate()" id="sdl-anim-btn"
    style="width:100%;padding:10px;border-radius:10px;border:2px solid rgba(255,215,0,0.5);
    background:rgba(255,215,0,0.1);color:#FFD700;font-family:Tajawal;font-size:14px;font-weight:700;cursor:pointer">
    ▶ تشغيل حركة الشمس تلقائياً
  </button>
</div>
<div class="ctrl-section" style="padding:10px 12px;background:rgba(255,215,0,0.07);border-radius:10px;border:1px solid rgba(255,215,0,0.2)">
  <div class="ctrl-label" style="color:#FFD700">📊 القياسات المسجّلة</div>
  <div id="sdl-table" style="margin-top:5px;font-family:Tajawal;font-size:12px;color:rgba(255,255,255,0.75)">
    جرّب أوقاتاً مختلفة لتسجّل القياسات
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٥ · د٥):</strong><br>
  متى يكون الظل أطول؟ ومتى أقصر؟ ولماذا؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">أطول في الصباح والمساء (الشمس منخفضة)، وأقصر عند الظهيرة (الشمس في أعلى نقطة). الكرة الأرضية تدور حول الشمس مما يغيّر زاوية الضوء على الأرض.</div>
</div>`;

  function calcShadow(h) {
    const angle = Math.abs(h - 12) / 6;
    return Math.round(angle * 85 + 5);
  }

  function fmtTime(h) {
    const hh = Math.floor(h); const mm = h%1===0?'00':'30';
    return `${String(hh).padStart(2,'0')}:${mm}`;
  }

  function updateTable() {
    const el = document.getElementById('sdl-table'); if(!el) return;
    const rec = S.sunRecorded;
    const keys = Object.keys(rec).map(Number).sort((a,b)=>a-b);
    if(!keys.length){ el.textContent='جرّب أوقاتاً مختلفة لتسجّل القياسات'; return; }
    el.innerHTML = `<table style="width:100%;border-collapse:collapse;text-align:center">
      <tr style="color:#4DC4E0;border-bottom:1px solid rgba(255,255,255,0.15)">
        <td style="padding:3px">الوقت</td>${keys.map(k=>`<td style="padding:3px">${fmtTime(k)}</td>`).join('')}
      </tr><tr>
        <td style="padding:3px;color:#FFD700">الظل (سم)</td>${keys.map(k=>`<td style="padding:3px;color:#FFD700;font-weight:700">${rec[k]}</td>`).join('')}
      </tr></table>
      ${keys.length>=4?'<div style="margin-top:4px;color:#90EE90;font-size:11px">💡 عند الظهيرة (12) الظل أقصر!</div>':''}`;
  }

  window._sdlSet = function(h) {
    S.sunHour = h;
    const el = document.getElementById('sdl-time'); if(el) el.textContent = fmtTime(h);
    const sl = document.getElementById('sdl-slider'); if(sl) sl.value = h;
    S.sunRecorded[h] = calcShadow(h);
    updateTable();
    try{playTick&&playTick();}catch(e){}
  };

  window._sdlAnimate = function() {
    S.sunAnimating = !S.sunAnimating;
    S.sunAutoT = S.sunHour;
    const btn = document.getElementById('sdl-anim-btn');
    if(btn) btn.textContent = S.sunAnimating ? '⏸ إيقاف' : '▶ تشغيل حركة الشمس تلقائياً';
  };

  if (!S.sunRecorded[S.sunHour]) window._sdlSet(S.sunHour);

  const cv = document.getElementById('simCanvas');
  const c = cv.getContext('2d');

  function draw() {
    if (currentSim !== 'g5sundial') {
      cv.onmousedown = cv.onmousemove = null; return;
    }
    S.sunAnim++;

    // تحديث الوقت التلقائي
    if (S.sunAnimating) {
      S.sunAutoT = (S.sunAutoT || 6);
      S.sunAutoT += 0.015;
      if (S.sunAutoT > 18) S.sunAutoT = 6;
      S.sunHour = S.sunAutoT;
      const el = document.getElementById('sdl-time'); if(el) el.textContent = fmtTime(S.sunHour);
      const sl = document.getElementById('sdl-slider'); if(sl) sl.value = S.sunHour;
    }

    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);

    const hour = S.sunHour;
    const shadowCm = calcShadow(hour);
    const sunElevAngle = (1 - Math.abs(hour-12)/6) * Math.PI/2;
    const sunSide = hour <= 12 ? 1 : -1;
    const dayFactor = Math.sin(sunElevAngle);

    // ── السماء ──
    const skyTop = `rgb(${Math.round(10+dayFactor*110)},${Math.round(20+dayFactor*140)},${Math.round(60+dayFactor*145)})`;
    const skyBot = `rgb(${Math.round(dayFactor*180)},${Math.round(dayFactor*160)},${Math.round(dayFactor*110)})`;
    const skyGrad = c.createLinearGradient(0,0,0,h*0.65);
    skyGrad.addColorStop(0, skyTop); skyGrad.addColorStop(1, skyBot);
    c.fillStyle=skyGrad; c.fillRect(0,0,w,h*0.65);

    // ── الأرض ──
    const groundGrad = c.createLinearGradient(0,h*0.65,0,h);
    groundGrad.addColorStop(0,'#9CC840'); groundGrad.addColorStop(1,'#6A8C20');
    c.fillStyle=groundGrad; c.fillRect(0,h*0.65,w,h*0.35);

    // خطوط الأرض
    c.strokeStyle='rgba(0,0,0,0.08)'; c.lineWidth=1;
    for(let gi=1;gi<4;gi++){
      c.beginPath(); c.moveTo(0,h*0.65+h*0.35*gi/4); c.lineTo(w,h*0.65+h*0.35*gi/4); c.stroke();
    }

    // ── الشمس ──
    const sunR = w*0.065;
    const sunX = w*0.5 + sunSide*(1-dayFactor)*w*0.36;
    const sunY = h*0.65 - dayFactor*h*0.57;

    // هالة الشمس
    const sunHalo=c.createRadialGradient(sunX,sunY,0,sunX,sunY,sunR*4);
    sunHalo.addColorStop(0,`rgba(255,255,200,${0.35+dayFactor*0.35})`);
    sunHalo.addColorStop(1,'rgba(255,200,0,0)');
    c.fillStyle=sunHalo; c.beginPath(); c.arc(sunX,sunY,sunR*4,0,Math.PI*2); c.fill();

    // جسم الشمس
    c.fillStyle=`rgb(255,${Math.round(200+dayFactor*55)},${Math.round(dayFactor*80)})`;
    c.beginPath(); c.arc(sunX,sunY,sunR,0,Math.PI*2); c.fill();
    c.strokeStyle='rgba(255,220,100,0.7)'; c.lineWidth=2; c.stroke();

    // أشعة الشمس
    for(let ri=0;ri<8;ri++){
      const ra=ri*Math.PI/4 + S.sunAnim*0.01;
      c.strokeStyle=`rgba(255,220,80,${0.3+dayFactor*0.3})`; c.lineWidth=1.5;
      c.beginPath();
      c.moveTo(sunX+Math.cos(ra)*(sunR+4), sunY+Math.sin(ra)*(sunR+4));
      c.lineTo(sunX+Math.cos(ra)*(sunR+12), sunY+Math.sin(ra)*(sunR+12)); c.stroke();
    }
    c.fillStyle=`rgba(255,255,180,${0.6+dayFactor*0.35})`; c.font=`bold ${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='center';
    c.fillText(fmtTime(hour), sunX, sunY+sunR+h*0.042);

    // ── مسار الشمس (قوس) ──
    c.strokeStyle=`rgba(255,200,80,${0.2+dayFactor*0.2})`; c.lineWidth=1.5; c.setLineDash([4,6]);
    c.beginPath();
    for(let ht=6;ht<=18;ht+=0.2){
      const ea=(1-Math.abs(ht-12)/6)*Math.PI/2;
      const sd2=ht<=12?1:-1;
      const sx2=w*0.5+sd2*(1-Math.sin(ea))*w*0.36;
      const sy2=h*0.65-Math.sin(ea)*h*0.57;
      if(ht===6) c.moveTo(sx2,sy2); else c.lineTo(sx2,sy2);
    }
    c.stroke(); c.setLineDash([]);

    // نص "مسار الشمس"
    c.fillStyle=`rgba(255,220,100,${0.4+dayFactor*0.3})`; c.font=`${Math.max(8,w*0.015)}px Tajawal`; c.textAlign='center';
    c.fillText('مسار الشمس', w*0.5, h*0.08);

    // ── العصا ──
    const stickX = w*0.50, stickBaseY = h*0.65, stickH = h*0.24;
    const stickTopY = stickBaseY - stickH;
    // ظل العصا (على الأرض)
    const shadowPx = (shadowCm/90)*w*0.55;
    const shadowDir = -sunSide;
    const shadowEndX = stickX + shadowDir*shadowPx;

    // رسم الظل بوضوح — ظل واضح وعريض على الأرض
    const shadowWidth = Math.max(12, stickH * 0.22);
    // ظل خارجي (ضبابي للواقعية)
    const shBlur = c.createLinearGradient(stickX, 0, shadowEndX, 0);
    shBlur.addColorStop(0, 'rgba(0,0,0,0.30)');
    shBlur.addColorStop(1, 'rgba(0,0,0,0.0)');
    c.fillStyle = shBlur;
    c.beginPath();
    c.moveTo(stickX - shadowWidth * 2, stickBaseY);
    c.lineTo(stickX + shadowWidth * 2, stickBaseY);
    c.lineTo(shadowEndX + shadowDir * shadowWidth * 4, stickBaseY + 10);
    c.lineTo(shadowEndX - shadowDir * shadowWidth * 2, stickBaseY + 10);
    c.closePath(); c.fill();
    // الظل الأساسي الغامق الواضح
    const shGrad = c.createLinearGradient(stickX, 0, shadowEndX, 0);
    shGrad.addColorStop(0, 'rgba(10,30,10,0.92)');
    shGrad.addColorStop(0.6, 'rgba(10,30,10,0.65)');
    shGrad.addColorStop(1, 'rgba(10,30,10,0.05)');
    c.fillStyle = shGrad;
    c.beginPath();
    c.moveTo(stickX - shadowWidth * 0.7, stickBaseY - 1);
    c.lineTo(stickX + shadowWidth * 0.7, stickBaseY - 1);
    c.lineTo(shadowEndX + shadowDir * shadowWidth * 2.5, stickBaseY + 7);
    c.lineTo(shadowEndX - shadowDir * shadowWidth * 0.5, stickBaseY + 7);
    c.closePath(); c.fill();

    // خط قياس الظل
    const mY = stickBaseY + h*0.07;
    if(Math.abs(shadowPx)>10){
      c.strokeStyle='rgba(255,230,0,0.9)'; c.lineWidth=2;
      c.beginPath(); c.moveTo(stickX,mY); c.lineTo(shadowEndX,mY); c.stroke();
      c.fillStyle='rgba(255,230,0,0.9)';
      c.beginPath(); c.moveTo(stickX-4,mY-3); c.lineTo(stickX-4,mY+3); c.lineTo(stickX-9,mY); c.fill();
      c.beginPath(); c.moveTo(shadowEndX+4*shadowDir,mY-3); c.lineTo(shadowEndX+4*shadowDir,mY+3); c.lineTo(shadowEndX+9*shadowDir,mY); c.fill();
      c.fillStyle='#FFE000'; c.font=`bold ${Math.max(11,w*0.024)}px Tajawal`; c.textAlign='center';
      c.fillText(`${shadowCm} سم`, (stickX+shadowEndX)/2, mY-9);
    }

    // العصا نفسها (فوق الظل)
    c.strokeStyle='#5A3010'; c.lineWidth=5;
    c.beginPath(); c.moveTo(stickX,stickBaseY); c.lineTo(stickX,stickTopY); c.stroke();
    c.fillStyle='#8B5020'; c.beginPath(); c.arc(stickX,stickTopY,6,0,Math.PI*2); c.fill();
    // قاعدة العصا
    c.fillStyle='#6A4010';
    c.beginPath(); c.ellipse(stickX,stickBaseY,8,4,0,0,Math.PI*2); c.fill();

    // خط الشعاع من الشمس
    c.strokeStyle='rgba(255,220,50,0.35)'; c.lineWidth=1.5; c.setLineDash([5,5]);
    c.beginPath(); c.moveTo(sunX,sunY); c.lineTo(stickX,stickTopY); c.lineTo(shadowEndX,stickBaseY); c.stroke();
    c.setLineDash([]);

    // ── صندوق النتيجة ──
    c.fillStyle='rgba(0,0,0,0.60)'; c.strokeStyle='rgba(255,215,0,0.4)'; c.lineWidth=1.5;
    c.beginPath(); c.roundRect(w*0.02,h*0.02,w*0.96,h*0.10,8); c.fill(); c.stroke();
    c.fillStyle='#FFE050'; c.font=`bold ${Math.max(11,w*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText(
      `${fmtTime(hour)}  |  الظل: ${shadowCm} سم  |  ${hour===12?'⭐ أقصر ظل':Math.abs(hour-12)>=5?'↕ أطول ظل':''}`,
      w/2, h*0.088
    );

    // ملاحظة الكرة الأرضية
    c.fillStyle='rgba(180,220,255,0.7)'; c.font=`${Math.max(8,w*0.016)}px Tajawal`; c.textAlign='center';
    c.fillText('الكرة الأرضية تدور → الشمس تبدو تتحرك عبر السماء خلال اليوم', w/2, h*0.97);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG5LightIntensity() {
  // ── د٦: شدة الضوء — ٣ بيئات بسيطة ──
  const S = simState;
  if (!S.li6Init) { S.li6Init = true; S.li6Place = -1; S.li6Anim = 0; }

  const places = [
    { name:'في الشمس المباشرة', icon:'☀️', lux:100000, color:'#FFD700', desc:'ضوء قوي جداً — شمس مباشرة في الخارج',       bar:1.00 },
    { name:'في الظل (في الخارج)',icon:'🌳', lux:10000,  color:'#90EE90', desc:'ضوء جيد — تحت شجرة أو في منطقة مظللة',     bar:0.55 },
    { name:'داخل غرفة الصف',    icon:'🏫', lux:500,    color:'#4DC4E0', desc:'ضوء متوسط — إضاءة داخلية عادية',            bar:0.22 },
    { name:'داخل الخزانة',      icon:'🚪', lux:5,      color:'#9B72E0', desc:'شبه مظلم — لا يكاد يوجد ضوء',               bar:0.04 },
  ];

  document.getElementById('simControlsPanel').innerHTML = `
<div class="ctrl-section">
  <div class="ctrl-label">☀️ قياس شدة الضوء</div>
  <div class="ctrl-desc">اختر المكان وشاهد مقياس الإضاءة</div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">📍 اختر المكان</div>
  <div style="display:flex;flex-direction:column;gap:7px;margin-top:6px">
    ${places.map((p,i)=>`
    <button id="li6-btn-${i}" onclick="window._li6Sel(${i})"
      style="padding:10px 12px;border-radius:10px;border:2px solid rgba(26,143,168,0.35);
      background:rgba(26,143,168,0.08);color:#4DC4E0;font-family:Tajawal;font-size:14px;
      font-weight:700;cursor:pointer;transition:all .18s;text-align:right;display:flex;align-items:center;gap:8px">
      <span style="font-size:20px">${p.icon}</span>${p.name}
    </button>`).join('')}
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٥ · د٦):</strong><br>
  لماذا تحتاج النباتات في البيوت الزجاجية إلى قياس شدة الضوء؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">لأن النباتات تحتاج لكميّة ضوء كافية للتمثيل الضوئي. الضوء القليل يضعف النمو والضوء الزائد يحرق الأوراق، لذا يجب قياس شدة الضوء والتحكم فيها.</div>
</div>`;

  window._li6Sel = function(i) {
    S.li6Place = i; S.li6Anim = 0;
    places.forEach((_,idx)=>{
      const btn=document.getElementById('li6-btn-'+idx);
      if(!btn) return;
      const a=idx===i;
      btn.style.background = a?`rgba(26,143,168,0.45)`:'rgba(26,143,168,0.08)';
      btn.style.borderColor = a?'#4DC4E0':'rgba(26,143,168,0.35)';
      btn.style.color = a?'#fff':'#4DC4E0';
      btn.style.transform = a?'scale(1.03)':'scale(1)';
    });
    try{playTick&&playTick();}catch(e){}
  };

  const cv = document.getElementById('simCanvas');
  const c = cv.getContext('2d');

  function draw() {
    if (currentSim !== 'g5lightintensity') return;
    S.li6Anim++;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);

    const place = S.li6Place >= 0 ? places[S.li6Place] : null;
    const barFill = place ? place.bar : 0;
    const lux = place ? place.lux : 0;

    // خلفية — تتغير حسب الإضاءة
    const brightness = Math.round(barFill * 50);
    c.fillStyle=`rgb(${5+brightness*2},${8+brightness*2},${15+brightness})`;
    c.fillRect(0,0,w,h);

    // ── صورة البيئة ──
    const sceneX=w*0.12, sceneY=h*0.10, sceneW=w*0.56, sceneH=h*0.55;
    c.fillStyle=`rgba(${30+brightness*3},${35+brightness*3},${40+brightness*2},0.9)`;
    c.beginPath(); c.roundRect(sceneX,sceneY,sceneW,sceneH,10); c.fill();
    c.strokeStyle=`rgba(255,255,255,${0.05+barFill*0.2})`; c.lineWidth=1.5; c.stroke();

    // رسم البيئة
    if (place) {
      // توهّج الإضاءة في المشهد
      const glowR = sceneW * 0.6 * barFill;
      const sceneGlow = c.createRadialGradient(sceneX+sceneW/2,sceneY+sceneH*0.3,0,sceneX+sceneW/2,sceneY+sceneH*0.3,glowR);
      sceneGlow.addColorStop(0,`rgba(255,240,180,${barFill*0.7})`);
      sceneGlow.addColorStop(1,'rgba(255,220,100,0)');
      c.fillStyle=sceneGlow; c.fillRect(sceneX,sceneY,sceneW,sceneH);

      // أيقونة البيئة
      c.font=`${Math.max(50,w*0.10)}px serif`; c.textAlign='center';
      c.fillText(place.icon, sceneX+sceneW/2, sceneY+sceneH*0.52);

      // اسم المكان
      c.fillStyle=`rgba(255,255,255,${0.5+barFill*0.4})`;
      c.font=`bold ${Math.max(9,w*0.02)}px Tajawal`; c.textAlign='center';
      c.fillText(place.name, sceneX+sceneW/2, sceneY+sceneH*0.82);
      // الوصف
      c.fillStyle='rgba(255,255,255,0.55)'; c.font=`${Math.max(8,w*0.016)}px Tajawal`;
      c.fillText(place.desc, sceneX+sceneW/2, sceneY+sceneH*0.92);
    } else {
      c.fillStyle='rgba(255,255,255,0.3)'; c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`; c.textAlign='center';
      c.fillText('اختر مكاناً من القائمة', sceneX+sceneW/2, sceneY+sceneH*0.55);
    }

    // ── جهاز قياس الضوء ──
    const devX=w*0.74, devY=h*0.10, devW=w*0.22, devH=h*0.68;
    c.fillStyle='rgba(20,30,45,0.92)';
    c.beginPath(); c.roundRect(devX,devY,devW,devH,10); c.fill();
    c.strokeStyle='rgba(100,180,220,0.4)'; c.lineWidth=1.5; c.stroke();

    // عنوان الجهاز
    c.fillStyle='rgba(100,200,240,0.9)'; c.font=`bold ${Math.max(8,w*0.016)}px Tajawal`; c.textAlign='center';
    c.fillText('جهاز', devX+devW/2, devY+h*0.045);
    c.fillText('قياس الضوء', devX+devW/2, devY+h*0.075);

    // شاشة الجهاز
    const screenX=devX+devW*0.1, screenY=devY+devH*0.15, screenW=devW*0.8, screenH=devH*0.30;
    c.fillStyle='#0a1a0a'; c.beginPath(); c.roundRect(screenX,screenY,screenW,screenH,5); c.fill();
    c.strokeStyle='rgba(0,255,100,0.3)'; c.lineWidth=1; c.stroke();

    // رقم القراءة
    const luxStr = lux >= 1000 ? `${(lux/1000).toFixed(0)}k` : `${lux}`;
    c.fillStyle=place?`rgba(0,255,80,${0.6+barFill*0.4})`:'rgba(0,180,60,0.4)';
    c.font=`bold ${Math.max(16,w*0.034)}px monospace`; c.textAlign='center';
    c.fillText(luxStr, screenX+screenW/2, screenY+screenH*0.62);
    c.font=`${Math.max(8,w*0.015)}px Tajawal`; c.textAlign='center';
    c.fillText('لوكس', screenX+screenW/2, screenY+screenH*0.88);

    // شريط الإضاءة
    const barX=devX+devW*0.30, barTop=devY+devH*0.50, barH2=devH*0.38, barW2=devW*0.40;
    // خلفية الشريط
    c.fillStyle='rgba(0,0,0,0.4)'; c.beginPath(); c.roundRect(barX,barTop,barW2,barH2,4); c.fill();
    // الجزء المضيء
    const litH = Math.max(2, barH2 * barFill);
    const barCol = place ? place.color : '#444';
    if (barFill > 0.01) {
      const barGrad2 = c.createLinearGradient(0,barTop+barH2-litH,0,barTop+barH2);
      barGrad2.addColorStop(0,barCol+'CC'); barGrad2.addColorStop(1,barCol+'66');
      c.fillStyle=barGrad2;
      c.beginPath(); c.roundRect(barX,barTop+barH2-litH,barW2,litH,4); c.fill();
    }
    // علامات على الشريط
    ['عالية','متوسطة','منخفضة','معدومة'].forEach((lbl,i)=>{
      const ty = barTop+barH2*(i/3.5+0.05);
      c.strokeStyle='rgba(255,255,255,0.15)'; c.lineWidth=0.5;
      c.beginPath(); c.moveTo(barX,ty); c.lineTo(barX+barW2,ty); c.stroke();
      c.fillStyle='rgba(255,255,255,0.4)'; c.font=`${Math.max(6,w*0.012)}px Tajawal`; c.textAlign='right';
      c.fillText(lbl, barX-2, ty+3);
    });

    if (!place) {
      c.fillStyle='rgba(255,255,255,0.3)'; c.font=`${Math.max(8,w*0.016)}px Tajawal`; c.textAlign='center';
      c.fillText('اختر', devX+devW/2, h*0.75);
      c.fillText('مكاناً', devX+devW/2, h*0.80);
    }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}


// ══════════════════════════════════════════════════
//   الصف الخامس — وحدة ٦: حركات الأرض
// ══════════════════════════════════════════════════

// ══════════════════════════════════════════════════
//   الصف الخامس — وحدة ٥ · درس ٧: قوس المطر
// ══════════════════════════════════════════════════

function simG5Rainbow() {
  // ── تجربة المنشور: الضوء الأبيض → ألوان قوس المطر ──
  const S = simState;
  if (!S.rb1Init) { S.rb1Init=true; S.rb1Anim=0; S.rb1SrcX=0.08; S.rb1SrcY=0.50; S.rb1TipX=0.38; S.rb1TipY=0.50; S.rb1DragMode=null; }

  document.getElementById('simControlsPanel').innerHTML = `
<div class="ctrl-section">
  <div class="ctrl-label">🔬 تجربة المنشور</div>
  <div class="ctrl-desc">اسحب شعاع الضوء <b>للأعلى والأسفل</b> لتغيير موضعه، أو استخدم الشريط لتغيير <b>زاوية السقوط</b></div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">📐 زاوية السقوط: <span id="rb-angle-val">0°</span></div>
  <input id="rb-angle-slider" type="range" min="-35" max="35" value="0" step="1"
    oninput="window._rbAngle(+this.value)" style="width:100%">
  <div style="display:flex;justify-content:space-between;font-family:Tajawal;font-size:11px;color:rgba(255,255,255,0.5);margin-top:2px">
    <span>↑ أعلى</span><span>مباشر</span><span>↓ أسفل</span>
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">🌈 ألوان الطيف بالترتيب</div>
  <div style="display:flex;gap:4px;margin-top:6px;border-radius:8px;overflow:hidden;height:28px">
    ${['#FF0000','#FF7700','#FFFF00','#00CC00','#0099FF','#4400CC','#8800BB'].map((c,i)=>
      `<div style="flex:1;background:${c};opacity:0.85"></div>`).join('')}
  </div>
  <div style="display:flex;justify-content:space-between;font-family:Tajawal;font-size:10px;color:rgba(255,255,255,0.6);margin-top:3px">
    <span>أحمر</span><span>برتقالي</span><span>أصفر</span><span>أخضر</span><span>أزرق</span><span>نيلي</span><span>بنفسجي</span>
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٥ · د٧):</strong><br>
  ١- لماذا ينقسم الضوء الأبيض إلى ألوان في المنشور؟<br>
  ٢- كيف يتكوّن قوس المطر؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">١- لأن الضوء الأبيض مزيج من ألوان مختلفة، وكل لون ينكسر بزاوية مختلفة عند مروره في المنشور فتنفصل الألوان.<br>٢- قطرات المطر تعمل كمناشير صغيرة — تنكسر أشعة الشمس عند دخولها وخروجها من كل قطرة فتنتج قوساً ملوّناً.</div>
</div>`;

  const cv = document.getElementById('simCanvas');
  const c = cv.getContext('2d');

  function evtPos(e) {
    const rect = cv.getBoundingClientRect();
    const src = (e.touches&&e.touches[0])||(e.changedTouches&&e.changedTouches[0])||e;
    return { fx:(src.clientX-rect.left)/rect.width, fy:(src.clientY-rect.top)/rect.height };
  }

  function tryDrag(fx, fy) {
    const w2=cv.width, h2=cv.height;
    // Near source
    if (Math.hypot((fx-S.rb1SrcX)*w2, (fy-S.rb1SrcY)*h2) < 30) { S.rb1DragMode='src'; return; }
    // Near tip
    if (Math.hypot((fx-S.rb1TipX)*w2, (fy-S.rb1TipY)*h2) < 22) { S.rb1DragMode='tip'; return; }
    // Along beam
    const dx=S.rb1TipX-S.rb1SrcX, dy=S.rb1TipY-S.rb1SrcY;
    const len2=dx*dx+dy*dy;
    const t=Math.max(0,Math.min(1,((fx-S.rb1SrcX)*dx+(fy-S.rb1SrcY)*dy)/len2));
    const cx=S.rb1SrcX+t*dx, cy=S.rb1SrcY+t*dy;
    if (Math.hypot((fx-cx)*cv.width,(fy-cy)*cv.height)<18) { S.rb1DragMode='src'; }
  }

  cv.onmousedown = function(e){ const p=evtPos(e); tryDrag(p.fx,p.fy); };
  cv.onmousemove = function(e){
    if(!S.rb1DragMode) return;
    const p=evtPos(e);
    if(S.rb1DragMode==='src'){
      S.rb1SrcX=Math.max(0.02,Math.min(0.35,p.fx));
      S.rb1SrcY=Math.max(0.10,Math.min(0.90,p.fy));
    } else {
      S.rb1TipX=Math.max(0.30,Math.min(0.48,p.fx));
      S.rb1TipY=Math.max(0.10,Math.min(0.90,p.fy));
    }
  };
  cv.ontouchstart=function(e){e.preventDefault(); const p=evtPos(e); tryDrag(p.fx,p.fy);};
  cv.ontouchmove=function(e){e.preventDefault();
    if(!S.rb1DragMode) return;
    const p=evtPos(e);
    if(S.rb1DragMode==='src'){
      S.rb1SrcX=Math.max(0.02,Math.min(0.35,p.fx));
      S.rb1SrcY=Math.max(0.10,Math.min(0.90,p.fy));
    } else {
      S.rb1TipX=Math.max(0.30,Math.min(0.48,p.fx));
      S.rb1TipY=Math.max(0.10,Math.min(0.90,p.fy));
    }
  };
  cv.onmouseup=cv.ontouchend=function(){S.rb1DragMode=null;};

  // ── تعريف دالة زاوية الشريط ──
  window._rbAngle = function(val) {
    const el = document.getElementById('rb-angle-val');
    if (el) el.textContent = val + '°';
    // تحويل الزاوية إلى إزاحة Y للمصدر
    // val بين -35 و 35 درجة
    const centerY = 0.50;
    const rangeY  = 0.38;
    S.rb1SrcY = centerY + (val / 35) * rangeY;
    S.rb1SrcY = Math.max(0.10, Math.min(0.90, S.rb1SrcY));
    // أيضاً اضبط tipY ليبقى في المنتصف
    S.rb1TipY = 0.50;
  };

  const colors = [
    {c:'#FF2200', label:'أحمر',     offset:0.18},
    {c:'#FF8800', label:'برتقالي',  offset:0.12},
    {c:'#FFEE00', label:'أصفر',     offset:0.06},
    {c:'#00CC44', label:'أخضر',     offset:0.00},
    {c:'#0088FF', label:'أزرق',     offset:-0.06},
    {c:'#3300BB', label:'نيلي',     offset:-0.12},
    {c:'#9900CC', label:'بنفسجي',   offset:-0.18},
  ];

  function draw(){
    if(currentSim!=='g5rainbow' || currentTab!==0){
      cv.onmousedown=cv.onmousemove=cv.ontouchstart=cv.ontouchmove=null; return;
    }
    S.rb1Anim++;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);

    // خلفية مظلمة
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#080C18'); bg.addColorStop(1,'#0D1520');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    const srcX = S.rb1SrcX * w;
    const srcY = S.rb1SrcY * h;
    const tipX = S.rb1TipX * w;
    const tipY = S.rb1TipY * h;

    const prismX = w*0.42;
    const prismTop = h*0.20, prismBot = h*0.80;
    const prismMid = (prismTop+prismBot)/2;

    // ── المنشور (مثلث) ──
    const pt1 = {x:prismX,        y:prismTop};
    const pt2 = {x:prismX+w*0.06, y:prismBot};
    const pt3 = {x:prismX-w*0.06, y:prismBot};
    const prismGrad=c.createLinearGradient(pt3.x,0,pt1.x+w*0.06,0);
    prismGrad.addColorStop(0,'rgba(150,200,255,0.18)');
    prismGrad.addColorStop(0.5,'rgba(200,230,255,0.35)');
    prismGrad.addColorStop(1,'rgba(150,200,255,0.18)');
    c.fillStyle=prismGrad;
    c.beginPath(); c.moveTo(pt1.x,pt1.y); c.lineTo(pt2.x,pt2.y); c.lineTo(pt3.x,pt3.y); c.closePath(); c.fill();
    c.strokeStyle='rgba(180,220,255,0.6)'; c.lineWidth=1.8; c.stroke();
    c.fillStyle='rgba(180,220,255,0.55)'; c.font=`bold ${Math.max(9,w*0.019)}px Tajawal`; c.textAlign='center';
    c.fillText('المنشور', prismX, prismBot+h*0.045);

    // نقطة الدخول في المنشور (طرف الشعاع = نقطة الدخول)
    const entryX = tipX;
    const entryY = tipY;

    // حساب زاوية الشعاع من المصدر
    const beamDX = entryX - srcX;
    const beamDY = entryY - srcY;
    const incAngleRad = Math.atan2(beamDY, beamDX);
    const incAngleDeg = Math.round(Math.atan2(Math.abs(beamDY), Math.abs(beamDX)) * 180 / Math.PI);

    // ── الشعاع الأبيض الداخل ──
    c.strokeStyle='rgba(255,255,255,0.9)'; c.lineWidth=6;
    c.beginPath(); c.moveTo(srcX, srcY); c.lineTo(entryX, entryY); c.stroke();

    // وهج المصدر
    const srcGlow=c.createRadialGradient(srcX,srcY,0,srcX,srcY,w*0.07);
    srcGlow.addColorStop(0,'rgba(255,255,255,0.95)'); srcGlow.addColorStop(1,'rgba(255,255,255,0)');
    c.fillStyle=srcGlow; c.beginPath(); c.arc(srcX,srcY,w*0.07,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,255,255,0.9)'; c.font=`bold ${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='center';
    c.fillText('ضوء أبيض', srcX, srcY - h*0.05);

    // مقبض المصدر (دائرة قابلة للسحب)
    c.fillStyle='rgba(255,255,255,0.25)'; c.beginPath(); c.arc(srcX,srcY,18,0,Math.PI*2); c.fill();
    c.strokeStyle='rgba(255,255,255,0.7)'; c.lineWidth=2; c.stroke();
    c.fillStyle='rgba(255,255,255,0.8)'; c.font=`${Math.max(8,w*0.015)}px Tajawal`; c.textAlign='center';
    c.fillText('⊕ اسحب', srcX, srcY + h*0.055);

    // مقبض الطرف (نقطة الدخول للمنشور)
    const tipPulse = Math.sin(S.rb1Anim*0.08)*2;
    c.fillStyle='rgba(180,220,255,0.35)'; c.beginPath(); c.arc(entryX,entryY,14+tipPulse,0,Math.PI*2); c.fill();
    c.strokeStyle='rgba(180,220,255,0.8)'; c.lineWidth=2; c.stroke();
    c.fillStyle='rgba(200,230,255,0.9)'; c.font=`${Math.max(8,w*0.014)}px Tajawal`; c.textAlign='center';
    c.fillText('↔', entryX, entryY);

    // ── الشعاع داخل المنشور (من نقطة الدخول إلى نقطة الخروج) ──
    const exitX = prismX + w*0.032;
    // نقطة الخروج تتغير بناءً على زاوية الشعاع الداخل (الانكسار داخل المنشور)
    const exitY = prismMid + (entryY - prismMid) * 0.5 + incAngleRad * h * 0.08;
    c.strokeStyle='rgba(255,255,255,0.35)'; c.lineWidth=3; c.setLineDash([3,4]);
    c.beginPath(); c.moveTo(entryX,entryY); c.lineTo(exitX,exitY); c.stroke();
    c.setLineDash([]);

    // ── الألوان الخارجة — زاوية الانكسار تتغير بوضوح مع زاوية السقوط ──
    const angleShift = incAngleRad * 0.7;
    const baseAngleRad = (30 * Math.PI / 180) + angleShift;
    const rayLen = Math.min(w, h) * 0.55;

    colors.forEach((col,i) => {
      const rayAngle = baseAngleRad + col.offset * 2.2;
      const endX = exitX + Math.cos(rayAngle) * rayLen;
      const endY = exitY + Math.sin(rayAngle) * rayLen;
      c.strokeStyle=col.c; c.lineWidth=4; c.globalAlpha=0.88;
      c.beginPath(); c.moveTo(exitX,exitY); c.lineTo(endX,endY); c.stroke();
      c.globalAlpha=1;
      const labelX = exitX + Math.cos(rayAngle)*(rayLen*0.88);
      const labelY = exitY + Math.sin(rayAngle)*(rayLen*0.88);
      c.fillStyle=col.c; c.font=`bold ${Math.max(8,w*0.016)}px Tajawal`; c.textAlign='center';
      c.fillText(col.label, labelX, labelY);
    });

    // ── تسمية الانكسار ──
    c.fillStyle='rgba(180,220,255,0.6)'; c.font=`${Math.max(8,w*0.016)}px Tajawal`; c.textAlign='center';
    c.fillText('الانكسار', exitX+w*0.04, exitY-h*0.04);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG5RainDrop() {
  // ── قطرة المطر: كيف تكوّن قوس المطر ──
  const S = simState;
  if (!S.rb2Init) { S.rb2Init=true; S.rb2Anim=0; S.rb2Step=0; S.rb2AutoPlay=false; }

  document.getElementById('simControlsPanel').innerHTML = `
<div class="ctrl-section">
  <div class="ctrl-label">💧 قطرة المطر = منشور صغير</div>
  <div class="ctrl-desc">شاهد كيف تنكسر أشعة الشمس داخل قطرة مطر وتنعكس لتكوّن قوس المطر</div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">📖 خطوات التكوين</div>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-top:6px">
    ${['دخول الضوء','انكسار داخل القطرة','انعكاس','خروج وتشتت'].map((s,i)=>`
    <button id="rb2-step-${i}" onclick="window._rb2Step(${i})"
      style="padding:7px 3px;border-radius:8px;border:2px solid rgba(26,143,168,0.4);
      background:rgba(26,143,168,0.1);color:#4DC4E0;font-family:Tajawal;font-size:11px;
      font-weight:700;cursor:pointer;transition:all .18s;text-align:center">${i+1}. ${s}</button>`).join('')}
  </div>
</div>
<div id="rb2-desc" style="margin-top:8px;padding:9px 11px;border-radius:9px;background:rgba(26,143,168,0.1);
  border:1.5px solid rgba(26,143,168,0.3);font-family:Tajawal;font-size:13px;color:#4DC4E0;text-align:right"></div>
<div class="q-box">
  <strong>❓ لماذا قوس المطر نصف دائرة؟</strong>
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">لأن زاوية خروج الضوء من قطرة المطر ثابتة (~42 درجة). كل القطرات على نفس الزاوية من عينك تُشكّل قوساً دائرياً حول نقطة مقابلة للشمس.</div>
</div>`;

  const steps = [
    { label:'دخول الضوء',           desc:'أشعة الشمس (ضوء أبيض) تصطدم بسطح قطرة المطر وتنكسر عند الدخول' },
    { label:'انكسار داخل القطرة',   desc:'داخل القطرة، كل لون ينكسر بزاوية مختلفة — الأحمر أقل انكساراً والبنفسجي أكثر' },
    { label:'انعكاس داخلي',         desc:'الضوء يصطدم بالجدار الخلفي للقطرة وينعكس من الداخل' },
    { label:'خروج وتشتت الألوان',   desc:'عند الخروج ينكسر الضوء مرة ثانية — الألوان تتفرق وتشكّل قوس المطر!' },
  ];

  window._rb2Step = function(i) {
    S.rb2Step = i;
    steps.forEach((_,idx)=>{
      const btn=document.getElementById('rb2-step-'+idx);
      if(!btn) return;
      const a=idx===i;
      btn.style.background=a?'rgba(26,143,168,0.45)':'rgba(26,143,168,0.1)';
      btn.style.borderColor=a?'#4DC4E0':'rgba(26,143,168,0.4)';
      btn.style.color=a?'#fff':'#4DC4E0';
    });
    const descEl=document.getElementById('rb2-desc');
    if(descEl) descEl.textContent=steps[i].desc;
    try{playTick&&playTick();}catch(e){}
  };
  setTimeout(()=>window._rb2Step(S.rb2Step),50);

  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const colors=['#FF2200','#FF8800','#FFEE00','#00CC44','#0088FF','#3300BB','#9900CC'];

  function draw(){
    if(currentSim!=='g5rainbow'||currentTab!==1){return;}
    S.rb2Anim++;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);

    // خلفية
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#0a0e20'); bg.addColorStop(1,'#0d1525');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // القطرة
    const cx=w*0.52, cy=h*0.50, r=Math.min(w,h)*0.22;
    // ظل القطرة
    c.fillStyle='rgba(100,160,220,0.08)';
    c.beginPath(); c.arc(cx+6,cy+8,r,0,Math.PI*2); c.fill();
    // جسم القطرة
    const dropGrad=c.createRadialGradient(cx-r*0.3,cy-r*0.3,0,cx,cy,r);
    dropGrad.addColorStop(0,'rgba(180,220,255,0.55)');
    dropGrad.addColorStop(0.6,'rgba(100,170,240,0.35)');
    dropGrad.addColorStop(1,'rgba(60,130,210,0.20)');
    c.fillStyle=dropGrad; c.beginPath(); c.arc(cx,cy,r,0,Math.PI*2); c.fill();
    c.strokeStyle='rgba(150,210,255,0.55)'; c.lineWidth=2; c.stroke();
    // انعكاس داخلي
    c.fillStyle='rgba(255,255,255,0.12)';
    c.beginPath(); c.ellipse(cx-r*0.25,cy-r*0.30,r*0.18,r*0.10,-0.5,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(100,170,255,0.5)'; c.font=`bold ${Math.max(9,w*0.02)}px Tajawal`; c.textAlign='center';
    c.fillText('قطرة مطر', cx, cy+r+h*0.045);

    const step=S.rb2Step;

    // الشمس (يمين)
    const sunX=w*0.08, sunY=h*0.28;
    const sunGlow=c.createRadialGradient(sunX,sunY,0,sunX,sunY,w*0.07);
    sunGlow.addColorStop(0,'rgba(255,230,80,1)'); sunGlow.addColorStop(1,'rgba(255,180,0,0)');
    c.fillStyle=sunGlow; c.beginPath(); c.arc(sunX,sunY,w*0.07,0,Math.PI*2); c.fill();
    c.fillStyle='#FFE040'; c.beginPath(); c.arc(sunX,sunY,w*0.025,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,230,80,0.85)'; c.font=`bold ${Math.max(8,w*0.017)}px Tajawal`; c.textAlign='center';
    c.fillText('الشمس', sunX, sunY+w*0.05);

    // الزاوية التي يضرب بها الشعاع القطرة
    const hitAngle = -0.35; // راديان
    const hitX = cx + r * Math.cos(Math.PI + hitAngle);
    const hitY = cy + r * Math.sin(Math.PI + hitAngle);

    if(step >= 0) {
      // الشعاع الأبيض من الشمس إلى القطرة
      c.strokeStyle='rgba(255,255,255,0.75)'; c.lineWidth=3;
      c.beginPath(); c.moveTo(sunX,sunY); c.lineTo(hitX,hitY); c.stroke();
      // نقطة الدخول
      c.fillStyle='rgba(255,255,200,0.9)';
      c.beginPath(); c.arc(hitX,hitY,5,0,Math.PI*2); c.fill();
    }

    // نقطة الانعكاس (الجدار الخلفي)
    const reflX = cx + r*0.85, reflY = cy - r*0.1;

    if(step >= 1) {
      // داخل القطرة — الضوء يتجه للانعكاس
      // نرسم عدة أشعة ملونة منفصلة قليلاً
      colors.forEach((col,i)=>{
        const offset=(i-3)*0.025;
        c.strokeStyle=col; c.lineWidth=2; c.globalAlpha=0.6;
        c.beginPath(); c.moveTo(hitX,hitY); c.lineTo(reflX,reflY+offset*h); c.stroke();
      });
      c.globalAlpha=1;
    }

    if(step >= 2) {
      // الانعكاس من الجدار الخلفي
      c.fillStyle='rgba(255,200,50,0.8)';
      c.beginPath(); c.arc(reflX,reflY,6,0,Math.PI*2); c.fill();
      // نقطة وميض
      c.fillStyle='rgba(255,255,255,0.9)';
      c.font=`${Math.max(14,w*0.026)}px serif`; c.textAlign='center';
      c.fillText('✦', reflX, reflY+5);
    }

    // نقطة الخروج (أسفل القطرة يسار)
    const exitX = cx - r*0.7, exitY = cy + r*0.7;

    if(step >= 2) {
      // الشعاع من الانعكاس إلى الخروج
      colors.forEach((col,i)=>{
        const offset=(i-3)*0.02;
        c.strokeStyle=col; c.lineWidth=2; c.globalAlpha=0.55;
        c.beginPath(); c.moveTo(reflX,reflY+offset*h*0.5); c.lineTo(exitX+offset*w*0.3,exitY); c.stroke();
      });
      c.globalAlpha=1;
    }

    if(step >= 3) {
      // الألوان الخارجة — تتشتت كقوس
      c.fillStyle='rgba(255,200,50,0.8)';
      c.beginPath(); c.arc(exitX,exitY,6,0,Math.PI*2); c.fill();

      colors.forEach((col,i)=>{
        const angle = Math.PI*0.65 + (i-3)*0.055;
        const ex2 = exitX + Math.cos(angle)*w*0.40;
        const ey2 = exitY + Math.sin(angle)*h*0.55;
        const lg2=c.createLinearGradient(exitX,exitY,ex2,ey2);
        lg2.addColorStop(0,col+'CC'); lg2.addColorStop(1,col+'22');
        c.strokeStyle=col; c.lineWidth=3.5; c.globalAlpha=0.85;
        c.beginPath(); c.moveTo(exitX,exitY); c.lineTo(ex2,ey2); c.stroke();
        c.globalAlpha=1;
        // تسمية آخر لون فقط
        if(i===0||i===6){
          c.fillStyle=col; c.font=`bold ${Math.max(8,w*0.016)}px Tajawal`; c.textAlign='center';
          c.fillText(i===0?'أحمر':'بنفسجي', ex2, ey2+ (i===0?-8:12));
        }
      });

      // قوس المطر الناتج (صغير تلميحي)
      const arcX=w*0.82, arcY=h*0.65;
      for(let i=0;i<colors.length;i++){
        c.strokeStyle=colors[i]; c.lineWidth=3; c.globalAlpha=0.7;
        c.beginPath();
        c.arc(arcX,arcY+10, (h*0.12)+(i*h*0.012), Math.PI,0);
        c.stroke();
      }
      c.globalAlpha=1;
      c.fillStyle='rgba(255,255,255,0.6)'; c.font=`bold ${Math.max(8,w*0.018)}px Tajawal`; c.textAlign='center';
      c.fillText('قوس المطر', arcX, arcY+h*0.03);
    }

    // عنوان الخطوة
    c.fillStyle='rgba(0,0,0,0.55)'; c.strokeStyle='rgba(26,143,168,0.4)'; c.lineWidth=1;
    c.beginPath(); c.roundRect(w*0.08,h*0.02,w*0.84,h*0.09,7); c.fill(); c.stroke();
    c.fillStyle='#4DC4E0'; c.font=`bold ${Math.max(9,w*0.021)}px Tajawal`; c.textAlign='center';
    c.fillText(`${step+1}. ${steps[step].label}`, w*0.5, h*0.075);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}


// ══════════════════════════════════════════════════════════
// 🌍 استقصاء ٢-٦ · تعاقب الليل والنهار
// الشمس ثابتة — الأرض تدور حول محورها — الليل والنهار يتعاقبان
// ══════════════════════════════════════════════════════════
function simG5DayNight2() {
  cancelAnimationFrame(animFrame);

  let angle  = 0;
  let speed  = 0.010;
  let paused = false;
  const cv   = document.getElementById('simCanvas');

  // القارات: (lon, lat) بالراديان على سطح الكرة
  const LANDS = [
    { lon:-1.70, lat: 0.55, pts:[[-0.55,-0.28],[0.55,-0.28],[0.60,0.10],[0.30,0.32],[-0.10,0.35],[-0.50,0.20],[-0.65,-0.05]] }, // أمريكا الشمالية
    { lon:-1.15, lat:-0.25, pts:[[-0.28,-0.48],[0.18,-0.48],[0.32,0.00],[0.20,0.48],[-0.10,0.50],[-0.30,0.20],[-0.35,-0.15]] }, // أمريكا الجنوبية
    { lon: 0.25, lat: 0.78, pts:[[-0.30,-0.22],[0.25,-0.28],[0.38,0.05],[0.15,0.28],[-0.20,0.22],[-0.32,0.00]] }, // أوروبا
    { lon: 0.22, lat: 0.00, pts:[[-0.30,-0.55],[0.22,-0.55],[0.38,-0.10],[0.28,0.50],[0.00,0.68],[-0.22,0.45],[-0.35,0.00],[-0.35,-0.28]] }, // أفريقيا
    { lon: 1.55, lat: 0.55, pts:[[-0.80,-0.30],[-0.10,-0.55],[0.65,-0.45],[0.90,-0.10],[0.75,0.28],[0.30,0.40],[-0.10,0.35],[-0.50,0.18],[-0.80,0.00]] }, // آسيا
    { lon: 2.30, lat:-0.42, pts:[[-0.35,-0.22],[0.28,-0.28],[0.40,0.05],[0.22,0.28],[-0.10,0.30],[-0.38,0.10]] }, // أستراليا
    { lon:-0.82, lat: 1.10, pts:[[-0.18,-0.18],[0.12,-0.18],[0.18,0.10],[0.00,0.22],[-0.18,0.10]] }, // جرينلاند
    { lon: 0.00, lat:-1.38, pts:[[-1.0,-0.15],[1.0,-0.15],[1.0,0.15],[-1.0,0.15]] }, // أنتاركتيكا
  ];

  function lonLatToXYZ(lon, lat) {
    const cosLat = Math.cos(lat);
    return { x: cosLat * Math.sin(lon), y: Math.sin(lat), z: cosLat * Math.cos(lon) };
  }

  function project(x, y, z, rot, cx, cy, R) {
    const xr =  x * Math.cos(rot) + z * Math.sin(rot);
    const yr =  y;
    const zr = -x * Math.sin(rot) + z * Math.cos(rot);
    return { px: cx + xr * R, py: cy - yr * R, zr };
  }

  function drawEarth(ctx, cx, cy, R, rot) {
    const D = Math.ceil(R * 2) + 8;
    const off = document.createElement('canvas');
    off.width = off.height = D;
    const oc = off.getContext('2d');
    const half = D / 2;

    // خطوة 1: رسم المحيط pixel-by-pixel بإضاءة فيزيائية صحيحة
    const id = oc.createImageData(D, D);
    const data = id.data;
    for (let row = 0; row < D; row++) {
      for (let col = 0; col < D; col++) {
        const nx = (col - half) / R;
        const ny = (row - half) / R;
        const n2 = nx*nx + ny*ny;
        if (n2 > 1.0) continue;
        const nz = Math.sqrt(1.0 - n2);
        // دوران عكسي حول Y
        const wx =  nx * Math.cos(-rot) + nz * Math.sin(-rot);
        // الشمس في اتجاه −X → dot = −wx
        const raw = -wx;
        const lit = Math.max(0, Math.min(1, (raw + 0.09) / 0.18));
        let r, g, b;
        if (lit > 0.01) {
          const t = lit;
          r = Math.round(20  + t * 50);
          g = Math.round(80  + t * 100);
          b = Math.round(160 + t * 80);
          if (lit < 0.35) {
            const tw = (0.35 - lit) / 0.35;
            r = Math.round(r + tw * 80);
            g = Math.round(g + tw * 20);
          }
        } else {
          r = 3; g = 6; b = 22;
        }
        const idx = (row * D + col) * 4;
        data[idx] = r; data[idx+1] = g; data[idx+2] = b; data[idx+3] = 255;
      }
    }
    oc.putImageData(id, 0, 0);

    // خطوة 2: clip ورسم القارات
    oc.save();
    oc.beginPath(); oc.arc(half, half, R, 0, Math.PI*2); oc.clip();
    LANDS.forEach(land => {
      const verts = land.pts.map(([dlon, dlat]) => {
        const p3 = lonLatToXYZ(land.lon + dlon, land.lat + dlat);
        return project(p3.x, p3.y, p3.z, rot, half, half, R);
      });
      const cen3 = lonLatToXYZ(land.lon, land.lat);
      const cenRx = cen3.x * Math.cos(-rot) + cen3.z * Math.sin(-rot);
      const cenLit = Math.max(0, Math.min(1, (-cenRx + 0.09) / 0.18));
      const isAntarctic = Math.abs(land.lat) > 1.2;
      let dr, dg, db, nr, ng, nb;
      if (isAntarctic) { dr=235; dg=245; db=255; nr=40; ng=55; nb=80; }
      else { dr=52; dg=160; db=72; nr=8; ng=30; nb=14; }
      const cr = Math.round(nr + (dr-nr)*cenLit);
      const cg = Math.round(ng + (dg-ng)*cenLit);
      const cb = Math.round(nb + (db-nb)*cenLit);
      const visCount = verts.filter(v => v.zr > -0.1).length;
      if (visCount < 2) return;
      oc.beginPath();
      oc.moveTo(verts[0].px, verts[0].py);
      for (let i = 1; i < verts.length; i++) oc.lineTo(verts[i].px, verts[i].py);
      oc.closePath();
      oc.fillStyle = `rgb(${cr},${cg},${cb})`;
      oc.fill();
      if (cenLit > 0.15) { oc.strokeStyle = `rgba(30,80,30,${cenLit*0.4})`; oc.lineWidth = 0.5; oc.stroke(); }
    });
    oc.restore();

    // خطوة 3: أضواء المدن في الليل
    oc.save();
    oc.beginPath(); oc.arc(half, half, R, 0, Math.PI*2); oc.clip();
    const CITIES = [
      [-1.62, 0.84],[-0.13, 0.89],[2.35, 0.84],[1.39, 0.62],[0.37, 0.52],
      [2.17, 0.62],[-0.77, 0.35],[2.63,-0.60],[-1.98, 0.79],[0.68, 0.86],[2.03, 0.57],[0.24, 0.61]
    ];
    CITIES.forEach(([lon, lat]) => {
      const p3 = lonLatToXYZ(lon, lat);
      const pr = project(p3.x, p3.y, p3.z, rot, half, half, R);
      if (pr.zr < 0.05) return;
      const wxC = p3.x * Math.cos(-rot) + p3.z * Math.sin(-rot);
      const litC = Math.max(0, Math.min(1, (-wxC + 0.09) / 0.18));
      if (litC > 0.25) return;
      const alpha = (0.25 - litC) / 0.25 * 0.9;
      const glow = oc.createRadialGradient(pr.px,pr.py,0, pr.px,pr.py, R*0.045);
      glow.addColorStop(0, `rgba(255,220,100,${alpha})`); glow.addColorStop(1, 'rgba(255,190,60,0)');
      oc.beginPath(); oc.arc(pr.px, pr.py, R*0.045, 0, Math.PI*2); oc.fillStyle = glow; oc.fill();
      oc.beginPath(); oc.arc(pr.px, pr.py, R*0.012, 0, Math.PI*2);
      oc.fillStyle = `rgba(255,245,180,${alpha})`; oc.fill();
    });
    oc.restore();

    // خطوة 4: هالة الغلاف الجوي
    const atmo = oc.createRadialGradient(half, half, R*0.88, half, half, R*1.20);
    atmo.addColorStop(0,'rgba(100,180,255,0.28)'); atmo.addColorStop(0.5,'rgba(60,130,220,0.10)'); atmo.addColorStop(1,'rgba(20,60,180,0)');
    oc.beginPath(); oc.arc(half, half, R*1.20, 0, Math.PI*2); oc.fillStyle = atmo; oc.fill();

    // خطوة 5: حافة الكرة
    oc.beginPath(); oc.arc(half, half, R, 0, Math.PI*2);
    oc.strokeStyle = 'rgba(80,150,230,0.45)'; oc.lineWidth = 2; oc.stroke();

    ctx.drawImage(off, cx - half, cy - half);

    // خطوة 6: المحور المائل 23.5°
    ctx.save();
    ctx.translate(cx, cy);
    const tilt = 23.5 * Math.PI / 180;
    const axX = Math.sin(tilt)*R*1.32, axY = Math.cos(tilt)*R*1.32;
    ctx.beginPath(); ctx.moveTo(-axX,-axY); ctx.lineTo(axX,axY);
    ctx.strokeStyle='rgba(200,230,255,0.55)'; ctx.lineWidth=1.5;
    ctx.setLineDash([5,4]); ctx.stroke(); ctx.setLineDash([]);
    [-1,1].forEach(d=>{ ctx.beginPath(); ctx.arc(d*axX,d*axY,4,0,Math.PI*2); ctx.fillStyle='rgba(220,240,255,0.90)'; ctx.fill(); });
    ctx.restore();
  }

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌍 تعاقب الليل والنهار</div>
      <div class="ctrl-desc" style="font-size:12.5px;color:var(--text-secondary);line-height:2.0">
        ☀️ الشمس <strong style="color:var(--gold)">ثابتة</strong> في مكانها<br>
        🔄 الأرض <strong style="color:var(--teal)">تدور حول محورها</strong><br>
        الجانب المضيء = <strong style="color:#FFD54F">نهار</strong> · الجانب المظلم = <strong style="color:#90B8FF">ليل</strong>
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">⚙️ التحكّم</div>
      <button class="ctrl-btn" id="dn2-play-btn" style="width:100%;margin-bottom:8px"
        onclick="(function(){window._dn2paused=!window._dn2paused;document.getElementById('dn2-play-btn').textContent=window._dn2paused?'▶ متابعة':'⏸ إيقاف';})()">⏸ إيقاف</button>
      <div class="ctrl-label" style="font-size:12px">🔄 سرعة الدوران</div>
      <input type="range" id="dn2-spd" min="1" max="10" value="5" style="width:100%;margin:5px 0 8px"
        oninput="window._dn2speed=(+this.value/5)*0.010">
      <button class="ctrl-btn" style="width:100%"
        onclick="(function(){window._dn2angle=0;window._dn2paused=false;window._dn2speed=0.010;var sl=document.getElementById('dn2-spd');if(sl)sl.value=5;var b=document.getElementById('dn2-play-btn');if(b)b.textContent='⏸ إيقاف';})()">↺ إعادة</button>
    </div>
    <div class="q-box" style="margin-top:10px">
      <strong>❓ لماذا يتعاقب الليل والنهار كل 24 ساعة؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">لأن الأرض تُكمل دورةً كاملة حول محورها في 24 ساعة. كل منطقة تمر بالنهار ثم الليل ثم النهار مجدداً.</div>
    </div>
    <div class="info-box" style="margin-top:10px;font-size:12px;line-height:2.0">
      🌅 <strong>الشروق:</strong> انتقال من الظلام إلى الضوء<br>
      🌇 <strong>الغروب:</strong> انتقال من الضوء إلى الظلام<br>
      ⏱ <strong>يوم كامل:</strong> 24 ساعة = دورة واحدة
    </div>`);

  window._dn2angle  = angle;
  window._dn2speed  = speed;
  window._dn2paused = paused;

  function draw() {
    if (currentSim !== 'g5sunseeming') { cancelAnimationFrame(animFrame); return; }
    paused = window._dn2paused;
    speed  = window._dn2speed !== undefined ? window._dn2speed : speed;
    if (!paused) { window._dn2angle = (window._dn2angle || 0) + speed; angle = window._dn2angle; }
    else { angle = window._dn2angle || 0; }

    const c = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    c.clearRect(0,0,W,H);

    const bg = c.createRadialGradient(W*0.5,H*0.5,0, W*0.5,H*0.5,Math.max(W,H)*0.7);
    bg.addColorStop(0,'#060D1A'); bg.addColorStop(1,'#010408');
    c.fillStyle = bg; c.fillRect(0,0,W,H);

    const STARS=[[.04,.08,1.4],[.14,.21,1.0],[.20,.06,1.2],[.08,.45,0.9],[.22,.73,1.1],[.03,.84,0.8],[.17,.92,1.3],[.88,.10,1.0],[.94,.33,1.2],[.82,.55,0.9],[.96,.70,1.1],[.87,.88,0.8],[.72,.03,1.3],[.62,.15,1.0],[.52,.94,1.2],[.37,.04,0.9],[.42,.80,1.1],[.77,.77,0.8],[.30,.59,1.0],[.67,.50,1.2],[.47,.33,0.9],[.59,.67,1.1],[.79,.23,0.8],[.11,.61,1.3],[.91,.51,1.0],[.55,.12,0.7],[.28,.38,0.9],[.85,.62,1.1],[.15,.75,0.8],[.70,.90,1.0]];
    STARS.forEach(([sx,sy,sz],i)=>{ const p=0.55+0.45*Math.sin(Date.now()/1500+i*2.1); c.beginPath(); c.arc(sx*W,sy*H,sz*p*0.9,0,Math.PI*2); c.fillStyle=`rgba(255,255,255,${0.45*p})`; c.fill(); });

    const minD = Math.min(W, H);
    const sunR=minD*0.105, earthR=minD*0.170;
    const sunX=W*0.18, sunY=H*0.48, earthX=W*0.63, earthY=H*0.48;

    // أشعة الشمس
    const dx0=earthX-sunX, dy0=earthY-sunY, dd=Math.sqrt(dx0*dx0+dy0*dy0), ux=dx0/dd, uy=dy0/dd;
    for(let i=-4;i<=4;i++){
      const sp=i*0.06, bx=ux*Math.cos(sp)-uy*Math.sin(sp), by=ux*Math.sin(sp)+uy*Math.cos(sp);
      const x1=sunX+bx*sunR*1.05,y1=sunY+by*sunR*1.05,x2=earthX-bx*earthR*0.95,y2=earthY-by*earthR*0.95;
      const rg=c.createLinearGradient(x1,y1,x2,y2), al=0.55-Math.abs(i)*0.06;
      rg.addColorStop(0,`rgba(255,230,80,${al})`); rg.addColorStop(0.65,`rgba(255,210,50,${al*0.25})`); rg.addColorStop(1,'rgba(255,200,40,0)');
      c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.strokeStyle=rg; c.lineWidth=1.5; c.stroke();
    }

    // الشمس
    const h1=c.createRadialGradient(sunX,sunY,sunR*0.5,sunX,sunY,sunR*2.5);
    h1.addColorStop(0,'rgba(255,200,50,0.22)'); h1.addColorStop(1,'rgba(255,100,0,0)');
    c.beginPath(); c.arc(sunX,sunY,sunR*2.5,0,Math.PI*2); c.fillStyle=h1; c.fill();
    const sg=c.createRadialGradient(sunX-sunR*0.25,sunY-sunR*0.25,sunR*0.05,sunX,sunY,sunR);
    sg.addColorStop(0,'#FFFBD0'); sg.addColorStop(0.28,'#FFE040'); sg.addColorStop(0.68,'#FF9500'); sg.addColorStop(1,'#CC3800');
    c.beginPath(); c.arc(sunX,sunY,sunR,0,Math.PI*2); c.fillStyle=sg; c.fill();
    for(let i=0;i<12;i++){
      const ra=(i/12)*Math.PI*2+Date.now()/2200, len=0.45+0.12*Math.sin(Date.now()/800+i*0.8);
      c.beginPath(); c.moveTo(sunX+Math.cos(ra)*sunR*1.08,sunY+Math.sin(ra)*sunR*1.08); c.lineTo(sunX+Math.cos(ra)*sunR*(1+len),sunY+Math.sin(ra)*sunR*(1+len));
      c.strokeStyle=`rgba(255,215,60,${0.35+0.10*Math.sin(Date.now()/600+i)})`; c.lineWidth=1.8; c.stroke();
    }

    drawEarth(c, earthX, earthY, earthR, angle);

    // تسمية الشمس
    const sunLY=sunY+sunR+22;
    c.textAlign='center'; c.textBaseline='top';
    c.font=`bold ${Math.round(minD*0.036)}px Tajawal`; c.fillStyle='#FFE87A';
    c.fillText('☀️ الشمس', sunX, sunLY);
    c.font=`${Math.round(minD*0.022)}px Tajawal`; c.fillStyle='rgba(255,215,80,0.70)';
    c.fillText('ثابتة في مكانها', sunX, sunLY+24);

    // تسمية الأرض
    const earthLY=earthY+earthR+22;
    c.font=`bold ${Math.round(minD*0.036)}px Tajawal`; c.fillStyle='#8ED8FF';
    c.fillText('🌍 الأرض', earthX, earthLY);
    c.font=`${Math.round(minD*0.022)}px Tajawal`; c.fillStyle='rgba(140,215,255,0.70)';
    c.fillText('تدور حول محورها', earthX, earthLY+24);

    // تسميات نهار/ليل — فوق الكرة بمسافة آمنة في بادجات
    const labelY=earthY-earthR-36;
    c.font=`bold ${Math.round(minD*0.028)}px Tajawal`;
    const dayLabel='☀️ نهار', nightLabel='🌙 ليل';
    const dayLX=earthX-earthR-18, nitLX=earthX+earthR+18;
    const dayW=c.measureText(dayLabel).width+20;
    c.fillStyle='rgba(255,215,50,0.15)'; c.beginPath(); c.roundRect(dayLX-dayW,labelY-14,dayW,28,8); c.fill();
    c.strokeStyle='rgba(255,215,50,0.35)'; c.lineWidth=1; c.stroke();
    c.textAlign='right'; c.fillStyle='#FFD54F'; c.fillText(dayLabel, dayLX, labelY+1);
    const nitW=c.measureText(nightLabel).width+20;
    c.fillStyle='rgba(130,180,255,0.15)'; c.beginPath(); c.roundRect(nitLX,labelY-14,nitW,28,8); c.fill();
    c.strokeStyle='rgba(130,180,255,0.35)'; c.lineWidth=1; c.stroke();
    c.textAlign='left'; c.fillStyle='#A0C8FF'; c.fillText(nightLabel, nitLX+10, labelY+1);

    // مؤشر الدوران
    const deg=Math.round(((angle%(Math.PI*2))+(Math.PI*2))%(Math.PI*2)/(Math.PI*2)*360);
    c.font=`${Math.round(H*0.028)}px Tajawal`; c.textAlign='left'; c.textBaseline='top';
    c.fillStyle='rgba(150,200,255,0.60)'; c.fillText(`🔄 ${deg}°`, 14, 14);

    animFrame = requestAnimationFrame(draw);
  }

  draw();
}
function simG5SunSeeming() {
  cancelAnimationFrame(animFrame);
  const cv = document.getElementById('simCanvas');
  if (cv._g5ss_cleanup) cv._g5ss_cleanup();
  cv._g5ss_cleanup = null;

  if (!simState.g5ss_new) simState.g5ss_new = {};
  const S = simState.g5ss_new;
  S.timeH   = 6;
  S.dragging = false;
  S.dragX0  = 0;
  S.timeH0  = 6;
  S._moved  = false;

  window._g5ss_fmtTime = function(h) {
    const hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
    const ampm = hh < 12 ? 'ص' : 'م';
    const h12  = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
    return `${String(h12).padStart(2,'0')}:${String(mm).padStart(2,'0')} ${ampm}`;
  };

  // ── أحداث السحب ──
  const onMD = e => {
    S.dragging = true; S._moved = true;
    S.dragX0 = (e.touches ? e.touches[0].clientX : e.clientX);
    S.timeH0 = S.timeH;
    cv.style.cursor = 'grabbing';
  };
  const onMM = e => {
    if (!S.dragging) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    S.timeH = Math.min(18, Math.max(6, S.timeH0 - (x - S.dragX0) * 0.038));
    const sl = document.getElementById('g5ss_slider');
    if (sl) sl.value = S.timeH;
    const lb = document.getElementById('g5ss_time_lbl');
    if (lb) lb.textContent = window._g5ss_fmtTime(S.timeH);
  };
  const onMU = () => { S.dragging = false; cv.style.cursor = 'grab'; };
  const onTS = e => { e.preventDefault(); onMD(e); };
  const onTM = e => { e.preventDefault(); onMM(e); };

  cv.style.cursor = 'grab';
  cv.addEventListener('mousedown', onMD);
  cv.addEventListener('mousemove', onMM);
  document.addEventListener('mouseup', onMU);
  cv.addEventListener('touchstart', onTS, { passive: false });
  cv.addEventListener('touchmove',  onTM, { passive: false });
  cv.addEventListener('touchend',   onMU);

  cv._g5ss_cleanup = () => {
    cv.removeEventListener('mousedown', onMD);
    cv.removeEventListener('mousemove', onMM);
    document.removeEventListener('mouseup', onMU);
    cv.removeEventListener('touchstart', onTS);
    cv.removeEventListener('touchmove',  onTM);
    cv.removeEventListener('touchend',   onMU);
    cv.style.cursor = '';
  };

  // ── لوحة التحكم ──
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🕐 الوقت من اليوم</div>
      <div style="font-size:12px;color:var(--text-secondary);line-height:1.8;margin:4px 0 10px">
        اسحب الشريط <strong>أو اسحب الكانفس</strong><br>
        يميناً ← ويساراً لتدوير الأرض ☀️
      </div>
      <input type="range" min="6" max="18" step="0.05" value="6" id="g5ss_slider"
        style="width:100%;margin-bottom:8px"
        oninput="simState.g5ss_new.timeH=+this.value;simState.g5ss_new._moved=true;document.getElementById('g5ss_time_lbl').textContent=window._g5ss_fmtTime(+this.value);">
      <div id="g5ss_time_lbl" style="text-align:center;font-weight:800;font-size:16px;color:var(--teal);margin-bottom:6px">٦:٠٠ ص</div>
    </div>
    <div class="info-box" style="font-size:12px;line-height:2.1;margin-top:6px">
      ☀️ <strong>الشمس ثابتة</strong> تماماً في مكانها<br>
      🌍 <strong>الأرض تدور</strong> وتأخذك معها<br>
      👁️ <strong>زاوية نظرك</strong> هي التي تتغير
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا نرى الشمس ترتفع وتنزل؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الشمس ثابتة ولا تتحرك أبداً! الأرض هي التي تدور. عندما تدور بك نحو الشمس تراها «تشرق»، وعندما تبتعد تراها «تغرب». إنه وهم بصري!</div>
    </div>
  `);

  function getMsg(h) {
    if (h <= 6.4)  return { t: 'الشمس ثابتة! الأرض تديرك نحوها الآن',        s: '🌅 وقت الشروق — أنت تتجه نحو الشمس' };
    if (h <= 9.0)  return { t: 'لاحظ كيف تدور معك مع الأرض!',                s: '🌤️ الصباح الباكر — زاوية رؤيتك ترتفع' };
    if (h <= 11.5) return { t: 'الأرض تواصل دورانها وأنت معها!',              s: '☀️ الضحى — زاوية نظرك للشمس ترتفع' };
    if (h <= 12.5) return { t: 'الأرض جعلتك تواجه الشمس مباشرةً',            s: '🌞 وقت الظهيرة — أنت مواجه للشمس تماماً' };
    if (h <= 15)   return { t: 'الأرض بدأت تبعدك عن مواجهة الشمس',           s: '🌤️ بعد الظهر — زاوية نظرك تنخفض' };
    if (h <= 17.5) return { t: 'الأرض تديرك بعيداً عن الشمس تدريجياً',       s: '🌇 العصر — تقترب من الغروب' };
    return         { t: 'الشمس ثابتة! الأرض أدارتك بعيداً عنها',             s: '🌆 وقت الغروب — أنت تبتعد عن الشمس' };
  }

  if (!window._g5ss2_stars) {
    window._g5ss2_stars = Array.from({ length: 65 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 0.4 + Math.random() * 1.2, ph: Math.random() * Math.PI * 2,
    }));
  }

  // ── مساعد لتفتيح اللون ──
  function lighter(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgb(${Math.min(255,((n>>16)&0xff)+a)},${Math.min(255,((n>>8)&0xff)+a)},${Math.min(255,(n&0xff)+a)})`;
  }

  function draw() {
    if (currentSim !== 'g5sunseeming') {
      if (cv._g5ss_cleanup) cv._g5ss_cleanup();
      cancelAnimationFrame(animFrame);
      return;
    }

    const c = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    c.clearRect(0, 0, W, H);

    const h = S.timeH;
    const t = (h - 6) / 12; // 0 شروق → 1 غروب
    // زاوية دوران الأرض: t=0 → مائل +67.5°, t=0.5 → 0°, t=1 → -67.5°
    const earthRot = (0.5 - t) * (Math.PI * 0.75);

    // ── 1. خلفية الفضاء ──
    const bg = c.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0,   '#010510');
    bg.addColorStop(0.6, '#081428');
    bg.addColorStop(1,   '#040C1C');
    c.fillStyle = bg; c.fillRect(0, 0, W, H);

    // ── 2. نجوم ──
    window._g5ss2_stars.forEach(st => {
      const p = 0.45 + 0.55 * Math.sin(Date.now() / 1700 + st.ph);
      c.beginPath();
      c.arc(st.x * W, st.y * H * 0.72, Math.max(0.1, st.r * p), 0, Math.PI * 2);
      c.fillStyle = `rgba(255,255,255,${0.55 * p})`; c.fill();
    });

    // ── 3. الشمس (ثابتة في الأعلى) ──
    const sunX = W * 0.50;
    const sunY = H * 0.115;
    const sunR = Math.min(W, H) * 0.068;

    // هالة
    const halo = c.createRadialGradient(sunX, sunY, sunR * 0.3, sunX, sunY, sunR * 4.8);
    halo.addColorStop(0,   'rgba(255,240,80,0.50)');
    halo.addColorStop(0.3, 'rgba(255,180,30,0.20)');
    halo.addColorStop(0.65,'rgba(255,100,0,0.07)');
    halo.addColorStop(1,   'rgba(255,50,0,0)');
    c.beginPath(); c.arc(sunX, sunY, sunR * 4.8, 0, Math.PI * 2);
    c.fillStyle = halo; c.fill();

    // جسم الشمس
    const sg = c.createRadialGradient(sunX - sunR*0.30, sunY - sunR*0.30, sunR*0.05, sunX, sunY, sunR);
    sg.addColorStop(0,   '#FFFDE7'); sg.addColorStop(0.25,'#FFE840');
    sg.addColorStop(0.60,'#FFA000'); sg.addColorStop(1,   '#E65000');
    c.beginPath(); c.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    c.fillStyle = sg; c.fill();
    c.beginPath(); c.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    c.strokeStyle = 'rgba(255,225,60,0.55)'; c.lineWidth = 2; c.stroke();

    // أشعة
    const rayT = Date.now() / 1000;
    for (let i = 0; i < 16; i++) {
      const ra = (i / 16) * Math.PI * 2 + rayT * 0.28;
      const r1 = sunR * 1.18, r2 = sunR * (1.58 + (i%2)*0.30);
      c.strokeStyle = `rgba(255,210,55,${0.32 + 0.14*Math.sin(rayT*2.2+i*0.7)})`;
      c.lineWidth = 2.5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(sunX+Math.cos(ra)*r1, sunY+Math.sin(ra)*r1);
      c.lineTo(sunX+Math.cos(ra)*r2, sunY+Math.sin(ra)*r2); c.stroke();
    }
    c.lineCap = 'butt';

    // تسمية الشمس
    c.textAlign = 'center'; c.textBaseline = 'top';
    c.font = `bold ${Math.round(H*0.028)}px Tajawal`;
    c.fillStyle = '#FFE87A'; c.shadowColor = 'rgba(0,0,0,0.9)'; c.shadowBlur = 6;
    c.fillText('☀️ الشمس', sunX, sunY + sunR + 7);
    c.font = `${Math.round(H*0.018)}px Tajawal`;
    c.fillStyle = 'rgba(255,240,120,0.80)';
    c.fillText('ثابتة — لا تتحرك أبداً!', sunX, sunY + sunR + 7 + Math.round(H*0.030));
    c.shadowBlur = 0;

    // ── 4. الكرة الأرضية الكاملة ──
    // المركز تحت الشاشة بحيث تظهر نصف كرة كبيرة
    const earthCX = W * 0.50;
    const earthCY = H * 1.02;
    const earthR  = Math.min(W * 0.70, H * 0.75);

    // ارسم الكرة الكاملة (دائرة 360°) — لا clip جزئي
    c.save();
    c.translate(earthCX, earthCY);
    c.rotate(earthRot);

    // clip على الكرة الكاملة فقط (دائرة)
    c.save();
    c.beginPath(); c.arc(0, 0, earthR, 0, Math.PI * 2); c.clip();

    // المحيط
    const ocean = c.createRadialGradient(-earthR*0.15, -earthR*0.28, earthR*0.08, 0, 0, earthR);
    ocean.addColorStop(0,   '#2196F3'); ocean.addColorStop(0.5, '#1565C0');
    ocean.addColorStop(0.85,'#0D47A1'); ocean.addColorStop(1,   '#0A3070');
    c.beginPath(); c.arc(0, 0, earthR, 0, Math.PI * 2);
    c.fillStyle = ocean; c.fill();

    // القارات — كل قارة بزاوية طولية (lon) وعرضية (lat)
    // نرسمها على الكرة بشكل إهليلجي (perspective)
    const CONT = [
      // lon°   lat°   rx     ry    col_light       col_dark
      [-100,  35,  0.195, 0.165, '#6BAA3A', '#4A8A28'],  // أمريكا الشمالية
      [ -65, -15,  0.110, 0.170, '#4AAA30', '#357820'],  // أمريكا الجنوبية
      [  15,  18,  0.095, 0.095, '#A8884A', '#886035'],  // أوروبا
      [  18, -10,  0.120, 0.185, '#D4B035', '#B09022'],  // أفريقيا
      [  80,  35,  0.260, 0.165, '#7AAA3A', '#5A8828'],  // آسيا
      [ 135, -25,  0.110, 0.090, '#C09040', '#9A7028'],  // أستراليا
      [   0, -75,  0.220, 0.055, '#E0EEF8', '#C8DCF0'],  // أنتاركتيكا
    ];

    CONT.forEach(([lon, lat, rxF, ryF, colL, colD]) => {
      const lonR = lon * Math.PI / 180;
      const latR = lat * Math.PI / 180;
      const cosLon = Math.cos(lonR);
      // فقط الجانب المرئي (cos > -0.1 يعني حتى الحافة بقليل)
      const px  = Math.sin(lonR) * Math.cos(latR) * earthR;
      const py  = -Math.sin(latR) * earthR;
      const scX = Math.max(0.02, Math.abs(cosLon));
      const rxPx = rxF * earthR * scX;
      const ryPx = ryF * earthR * 0.52;
      if (rxPx < 3) return;

      const cg = c.createRadialGradient(px-rxPx*0.3, py-ryPx*0.3, 0, px, py, Math.max(rxPx,ryPx));
      cg.addColorStop(0, lighter(colL, 40));
      cg.addColorStop(0.5, colL); cg.addColorStop(1, colD);

      c.beginPath(); c.ellipse(px, py, rxPx, ryPx, 0, 0, Math.PI * 2);
      c.fillStyle = cg; c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.18)'; c.lineWidth = 0.8; c.stroke();
    });

    // خطوط الشبكة (grid)
    c.globalAlpha = 0.07; c.strokeStyle = '#fff'; c.lineWidth = 0.8;
    for (let i = 0; i < 12; i++) {
      const a = (i/12) * Math.PI;
      const cosA = Math.cos(a);
      if (Math.abs(cosA) < 0.04) continue;
      c.beginPath(); c.ellipse(0, 0, Math.abs(cosA)*earthR, earthR, 0, 0, Math.PI*2); c.stroke();
    }
    [-0.5,-0.25,0,0.25,0.5].forEach(latN => {
      const yy = latN * earthR;
      const rx2 = Math.sqrt(Math.max(0, earthR*earthR - yy*yy));
      c.beginPath(); c.ellipse(0, yy, rx2, rx2*0.20, 0, 0, Math.PI*2); c.stroke();
    });
    c.globalAlpha = 1;

    // ظل الليل (الجانب الأيسر = بعيد عن الشمس)
    // الشمس في الإحداثيات المحلية للأرض تكون في اتجاه -earthRot من الأعلى
    // بما أن الشمس ثابتة فوق، نحسب اتجاهها في الإطار المحلي
    const shadowGrad = c.createLinearGradient(-earthR*0.6, -earthR, earthR*0.6, -earthR);
    shadowGrad.addColorStop(0,    'rgba(2,5,18,0.88)');
    shadowGrad.addColorStop(0.25, 'rgba(2,5,18,0.50)');
    shadowGrad.addColorStop(0.45, 'rgba(2,5,18,0)');
    shadowGrad.addColorStop(0.55, 'rgba(2,5,18,0)');
    shadowGrad.addColorStop(0.75, 'rgba(2,5,18,0.50)');
    shadowGrad.addColorStop(1,    'rgba(2,5,18,0.88)');
    c.beginPath(); c.arc(0, 0, earthR, 0, Math.PI * 2);
    c.fillStyle = shadowGrad; c.fill();

    c.restore(); // restore clip الكرة

    // ── غلاف جوي (خارج clip الكرة) ──
    const atm = c.createRadialGradient(0, 0, earthR*0.93, 0, 0, earthR*1.10);
    atm.addColorStop(0,   'rgba(80,155,255,0)');
    atm.addColorStop(0.5, 'rgba(80,155,255,0.17)');
    atm.addColorStop(1,   'rgba(60,120,230,0)');
    c.beginPath(); c.arc(0, 0, earthR*1.10, 0, Math.PI*2);
    c.fillStyle = atm; c.fill();

    // حافة الكرة
    c.beginPath(); c.arc(0, 0, earthR, 0, Math.PI*2);
    c.strokeStyle = 'rgba(100,170,255,0.45)'; c.lineWidth = 2.5; c.stroke();

    c.restore(); // restore translate+rotate

    // ── 5. الشخص (يقف على القمة) ──
    // موضع قمة الكرة بعد التدوير والإزاحة
    // النقطة (0, -earthR) في الإطار المحلي → تحوّل للعالمي
    const topX = earthCX + (0 * Math.cos(earthRot) - (-earthR) * Math.sin(earthRot));
    const topY = earthCY + (0 * Math.sin(earthRot) + (-earthR) * Math.cos(earthRot));

    // حجم الشخص (أصغر بكثير، متناسب مع الكرة)
    const pSz = earthR * 0.072;

    c.save();
    c.translate(topX, topY);
    c.rotate(earthRot); // يقف عمودياً على السطح

    // ظل
    c.beginPath(); c.ellipse(0, pSz*0.08, pSz*0.48, pSz*0.12, 0, 0, Math.PI*2);
    c.fillStyle = 'rgba(0,0,0,0.32)'; c.fill();

    // ساقان
    c.lineCap = 'round';
    c.strokeStyle = '#2255BB'; c.lineWidth = pSz*0.28;
    c.beginPath();
    c.moveTo(-pSz*0.18, -pSz*0.05); c.lineTo(-pSz*0.28, pSz*0.55);
    c.moveTo( pSz*0.18, -pSz*0.05); c.lineTo( pSz*0.28, pSz*0.55);
    c.stroke();

    // جسم
    c.fillStyle = '#3A99EE';
    c.beginPath(); c.roundRect(-pSz*0.32, -pSz*0.88, pSz*0.64, pSz*0.86, pSz*0.14);
    c.fill(); c.strokeStyle='#1A77CC'; c.lineWidth=0.8; c.stroke();

    // شارة
    c.fillStyle = 'rgba(255,255,255,0.4)';
    c.beginPath(); c.roundRect(-pSz*0.20, -pSz*0.76, pSz*0.40, pSz*0.28, pSz*0.06); c.fill();

    // ذراعان
    c.strokeStyle = '#3A99EE'; c.lineWidth = pSz*0.26;
    c.beginPath();
    c.moveTo(-pSz*0.32, -pSz*0.68); c.lineTo(-pSz*0.62, -pSz*0.28);
    c.moveTo( pSz*0.32, -pSz*0.68); c.lineTo( pSz*0.62, -pSz*0.28);
    c.stroke(); c.lineCap = 'butt';

    // رأس
    const hR = pSz * 0.42;
    const hY = -pSz*0.88 - hR;

    // هالة بسيطة
    c.beginPath(); c.arc(0, hY, hR*1.3, 0, Math.PI*2);
    c.fillStyle = 'rgba(255,220,80,0.12)'; c.fill();

    // وجه
    const fG = c.createRadialGradient(-hR*0.2, hY-hR*0.25, hR*0.05, 0, hY, hR);
    fG.addColorStop(0, '#FFE8A5'); fG.addColorStop(0.65, '#FFD07A'); fG.addColorStop(1, '#E0A840');
    c.beginPath(); c.arc(0, hY, hR, 0, Math.PI*2);
    c.fillStyle = fG; c.fill(); c.strokeStyle='#C89030'; c.lineWidth=1.2; c.stroke();

    // عيون
    c.fillStyle = '#1A2A4A';
    c.beginPath(); c.arc(-hR*0.28, hY-hR*0.04, hR*0.11, 0, Math.PI*2); c.fill();
    c.beginPath(); c.arc( hR*0.28, hY-hR*0.04, hR*0.11, 0, Math.PI*2); c.fill();
    c.fillStyle = 'white';
    c.beginPath(); c.arc(-hR*0.22, hY-hR*0.11, hR*0.042, 0, Math.PI*2); c.fill();
    c.beginPath(); c.arc( hR*0.34, hY-hR*0.11, hR*0.042, 0, Math.PI*2); c.fill();

    // ابتسامة
    c.beginPath(); c.arc(0, hY+hR*0.18, hR*0.28, 0.22, Math.PI-0.22);
    c.strokeStyle='#9A6820'; c.lineWidth=hR*0.10; c.lineCap='round'; c.stroke();
    c.lineCap='butt';

    c.restore();

    // موضع العين في الإطار العالمي (لخط النظر)
    const eyeOff  = pSz * (0.88 + 0.42 + 0.04); // من قمة الأرض إلى العين
    const eyeX = earthCX + (-eyeOff * Math.sin(earthRot));
    const eyeY = earthCY + (-eyeOff * Math.cos(earthRot));

    // ── 6. خط النظر ──
    const sunEdgeX = sunX;
    const sunEdgeY = sunY + sunR * 1.05;

    c.save();
    c.setLineDash([9, 5]);
    c.strokeStyle = 'rgba(255,238,60,0.85)'; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(eyeX, eyeY); c.lineTo(sunEdgeX, sunEdgeY); c.stroke();
    c.setLineDash([]);

    // سهم عند الشمس
    const dx2 = sunEdgeX - eyeX, dy2 = sunEdgeY - eyeY;
    const len2 = Math.sqrt(dx2*dx2+dy2*dy2) || 1;
    const ux = dx2/len2, uy = dy2/len2;
    const aX = sunEdgeX - ux*3, aY = sunEdgeY - uy*3;
    const px2 = -uy, py2 = ux;
    c.fillStyle = 'rgba(255,238,60,0.90)';
    c.beginPath(); c.moveTo(aX, aY);
    c.lineTo(aX-ux*13+px2*6, aY-uy*13+py2*6);
    c.lineTo(aX-ux*13-px2*6, aY-uy*13-py2*6);
    c.closePath(); c.fill();

    // تسمية
    const midX = (eyeX+sunEdgeX)/2 + (t<0.5?42:-42);
    const midY = (eyeY+sunEdgeY)/2;
    c.font = `bold ${Math.round(H*0.020)}px Tajawal`;
    c.fillStyle = 'rgba(255,245,110,0.95)';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.shadowColor = 'rgba(0,0,0,0.95)'; c.shadowBlur = 6;
    c.fillText('👁️ خط النظر', midX, midY);
    c.shadowBlur = 0; c.restore();

    // ── 7. صندوق الرسالة ──
    const msg = getMsg(h);
    const bW  = Math.min(W*0.86, 420);
    const bX  = (W-bW)/2;
    const bY  = H * 0.565;
    const bH  = Math.round(H * 0.125);
    const br2 = 13;

    c.save();
    c.beginPath();
    c.moveTo(bX+br2, bY); c.lineTo(bX+bW-br2, bY);
    c.quadraticCurveTo(bX+bW, bY, bX+bW, bY+br2);
    c.lineTo(bX+bW, bY+bH-br2);
    c.quadraticCurveTo(bX+bW, bY+bH, bX+bW-br2, bY+bH);
    c.lineTo(bX+br2, bY+bH);
    c.quadraticCurveTo(bX, bY+bH, bX, bY+bH-br2);
    c.lineTo(bX, bY+br2);
    c.quadraticCurveTo(bX, bY, bX+br2, bY); c.closePath();
    const bbg = c.createLinearGradient(bX, bY, bX, bY+bH);
    bbg.addColorStop(0, 'rgba(6,16,42,0.91)'); bbg.addColorStop(1, 'rgba(3,8,22,0.91)');
    c.fillStyle = bbg; c.fill();
    c.strokeStyle = 'rgba(110,210,255,0.38)'; c.lineWidth = 1.4; c.stroke();

    c.textAlign = 'center'; c.textBaseline = 'top';
    c.font = `bold ${Math.round(H*0.026)}px Tajawal`;
    c.fillStyle = '#FFE87A'; c.shadowColor='rgba(0,0,0,0.9)'; c.shadowBlur=5;
    c.fillText(msg.t, W/2, bY + bH*0.09); c.shadowBlur=0;
    c.font = `${Math.round(H*0.020)}px Tajawal`;
    c.fillStyle = 'rgba(165,218,255,0.92)';
    c.fillText(msg.s, W/2, bY + bH*0.56);
    c.restore();

    // ── 8. شريط الوقت ──
    const sH = 46, sY = H - sH;
    c.fillStyle = 'rgba(3,9,26,0.93)'; c.fillRect(0, sY, W, sH);
    c.strokeStyle = 'rgba(100,160,255,0.20)'; c.lineWidth=1;
    c.beginPath(); c.moveTo(0, sY); c.lineTo(W, sY); c.stroke();

    const icons = [
      {h:6,'e':'🌅','l':'الشروق'},{h:9,'e':'🌤️','l':'الصباح'},
      {h:12,'e':'🌞','l':'الظهيرة'},{h:15,'e':'☀️','l':'العصر'},{h:18,'e':'🌇','l':'الغروب'},
    ];
    icons.forEach(ic => {
      const px3 = ((ic.h-6)/12)*W;
      c.font = `${Math.round(sH*0.40)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(ic.e, px3, sY+sH*0.35);
      c.font=`bold ${Math.round(sH*0.22)}px Tajawal`; c.fillStyle='rgba(195,222,255,0.62)';
      c.fillText(ic.l, px3, sY+sH*0.76);
    });

    const indX = ((h-6)/12)*W;
    c.strokeStyle='rgba(255,218,55,0.95)'; c.lineWidth=2.8; c.setLineDash([5,3]);
    c.beginPath(); c.moveTo(indX, sY); c.lineTo(indX, H); c.stroke(); c.setLineDash([]);

    const lbX2 = Math.min(W-38, Math.max(38, indX));
    c.fillStyle='rgba(4,10,26,0.82)';
    c.fillRect(lbX2-32, sY+1, 64, Math.round(sH*0.34));
    c.font=`bold ${Math.round(sH*0.29)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
    c.fillStyle='#FFE066'; c.shadowColor='rgba(0,0,0,0.7)'; c.shadowBlur=3;
    c.fillText(window._g5ss_fmtTime(h), lbX2, sY+2); c.shadowBlur=0;

    // تلميح السحب
    if (!S._moved) {
      c.font=`${Math.round(H*0.021)}px Tajawal`; c.textAlign='center'; c.textBaseline='bottom';
      c.fillStyle='rgba(180,220,255,0.52)';
      c.fillText('← اسحب هنا لتدوير الأرض →', W/2, sY-8);
    }

    animFrame = requestAnimationFrame(draw);
  }

  draw();
}

function simG5Sunrise() {
  cancelAnimationFrame(animFrame);

  let timeMin  = 360;
  let playing  = false;
  let lastTs   = 0;

  const cv = document.getElementById('simCanvas');

  // نجوم عشوائية ثابتة
  if(!window._srStars){
    window._srStars = Array.from({length:55},()=>({x:Math.random(),y:Math.random(),r:0.4+Math.random()*1.1,ph:Math.random()*Math.PI*2}));
  }
  const STARS_SR = window._srStars;

  // ── وقت → ارتفاع الشمس ──
  function sunElev(m){ return Math.sin(((m-720)/720)*Math.PI)*90; }

  // ── مرحلة السماء ──
  function skyPhase(m){
    const n=((m%1440)+1440)%1440;
    if(n<270)  return 'night';
    if(n<330)  return 'pre-dawn';
    if(n<375)  return 'dawn';
    if(n<425)  return 'sunrise';
    if(n<540)  return 'morning';
    if(n<900)  return 'day';
    if(n<1020) return 'afternoon';
    if(n<1080) return 'sunset';
    if(n<1140) return 'dusk';
    return 'night';
  }

  // ── خلط ألوان ──
  function lc(c1,c2,t){
    t=Math.max(0,Math.min(1,t));
    const p=s=>parseInt(s,16);
    const r=Math.round(p(c1.slice(1,3))+(p(c2.slice(1,3))-p(c1.slice(1,3)))*t);
    const g=Math.round(p(c1.slice(3,5))+(p(c2.slice(3,5))-p(c1.slice(3,5)))*t);
    const b=Math.round(p(c1.slice(5,7))+(p(c2.slice(5,7))-p(c1.slice(5,7)))*t);
    return `rgb(${r},${g},${b})`;
  }

  // ── ألوان السماء ──
  function skyColors(m){
    const ph=skyPhase(m), n=((m%1440)+1440)%1440;
    if(ph==='night')    return {top:'#020810',mid:'#050D1C',bot:'#0A1428',sun:null};
    if(ph==='pre-dawn'){const p=(n-270)/60; return {top:lc('#020810','#150C30',p),mid:lc('#050D1C','#2D1848',p),bot:lc('#0A1428','#4A1E35',p),sun:null};}
    if(ph==='dawn')     {const p=(n-330)/45; return {top:lc('#150C30','#2A1060',p),mid:lc('#2D1848','#8B3525',p),bot:lc('#4A1E35','#D45520',p),sun:{c:'#FF4500',gl:'rgba(255,100,0,0.4)'}};}
    if(ph==='sunrise')  {const p=(n-375)/50; return {top:lc('#2A1060','#1A4080',p),mid:lc('#8B3525','#FF7030',p),bot:lc('#D45520','#FFCC55',p),sun:{c:lc('#FF6600','#FFAA00',p),gl:'rgba(255,160,0,0.5)'}};}
    if(ph==='morning')  {const p=(n-425)/115; return {top:lc('#1A4080','#2B80CC',p),mid:lc('#FF7030','#5BAEE8',p),bot:lc('#FFCC55','#8CD4F5',p),sun:{c:lc('#FFAA00','#FFFAEE',p),gl:`rgba(255,220,100,${0.5-p*0.3})`}};}
    if(ph==='day')      return {top:'#1665AA',mid:'#3B9AD9',bot:'#87CEEB',sun:{c:'#FFFAEE',gl:'rgba(255,250,200,0.35)'}};
    if(ph==='afternoon'){const p=(n-900)/120; return {top:lc('#1665AA','#1A5B90',p),mid:lc('#3B9AD9','#5CB0D8',p),bot:lc('#87CEEB','#C4E4F5',p),sun:{c:lc('#FFFAEE','#FFEE88',p),gl:`rgba(255,230,100,${0.3+p*0.2})`}};}
    if(ph==='sunset')   {const p=(n-1020)/60; return {top:lc('#1A5B90','#2A1060',p),mid:lc('#5CB0D8','#FF6620',p),bot:lc('#C4E4F5','#FFCC44',p),sun:{c:lc('#FFEE88','#FF5500',p),gl:`rgba(255,140,0,${0.4+p*0.2})`}};}
    if(ph==='dusk')     {const p=(n-1080)/60; return {top:lc('#2A1060','#0A0820',p),mid:lc('#FF6620','#6B1A50',p),bot:lc('#FFCC44','#3A1035',p),sun:p<0.55?{c:'#FF3300',gl:'rgba(255,80,0,0.35)'}:null};}
    return {top:'#020810',mid:'#050D1C',bot:'#0A1428',sun:null};
  }

  // ── عرض الوقت ──
  function fmtTime(m){
    const h=Math.floor(((m%1440)+1440)%1440/60), mn=Math.floor(m%60);
    const suf=h<12?'ص':'م', hd=h===0?12:h>12?h-12:h;
    return `${String(hd).padStart(2,'0')}:${String(mn).padStart(2,'0')} ${suf}`;
  }

  // ── رسم منظر السطح ──
  function drawSurface(c, W, H) {
    const col=skyColors(timeMin), ph=skyPhase(timeMin), elev=sunElev(timeMin);
    const horizY=H*0.68;

    // حساب موضع الشمس بقوس واقعي (شروق من اليمين، غروب من اليسار)
    const mn2=((timeMin%1440)+1440)%1440;
    const arcAngle = ((mn2 - 360) / 720) * Math.PI;
    const arcCenterX = W * 0.5;
    const arcCenterY = horizY + H * 0.10;
    const arcRx = W * 0.54;
    const arcRy = horizY * 0.90;
    const sX = arcCenterX + Math.cos(Math.PI - arcAngle) * arcRx;
    const sY = arcCenterY - Math.abs(Math.sin(arcAngle)) * arcRy;
    const sunVisible = elev > -10 && col.sun;
    const elevF = Math.min(1, Math.max(0, (elev + 10) / 100));
    const sR = Math.min(W,H) * (0.055 - elevF * 0.030);

    // السماء
    const sky=c.createLinearGradient(0,0,0,horizY);
    sky.addColorStop(0,col.top); sky.addColorStop(0.45,col.mid); sky.addColorStop(0.85,col.bot); sky.addColorStop(1,col.bot);
    c.fillStyle=sky; c.fillRect(0,0,W,horizY);

    // توهج الأفق عند الشروق/الغروب
    if(sunVisible && elev < 25){
      const hgAlpha=Math.max(0,0.55-elev*0.022);
      const hg=c.createRadialGradient(sX,horizY,0,sX,horizY,W*0.55);
      const gc2=(ph==='sunset'||ph==='dusk')?`rgba(255,100,20,${hgAlpha})`:`rgba(255,140,40,${hgAlpha})`;
      hg.addColorStop(0,gc2); hg.addColorStop(0.5,gc2.replace(hgAlpha.toFixed(2),(hgAlpha*0.35).toFixed(2))); hg.addColorStop(1,'rgba(255,80,0,0)');
      c.fillStyle=hg; c.fillRect(0,0,W,horizY+H*0.05);
    }

    // نجوم
    if(ph==='night'||ph==='pre-dawn'||ph==='dusk'){
      const sa=(ph==='night')?.95:(ph==='pre-dawn')?.55:.22;
      STARS_SR.forEach(s=>{
        if(s.y>0.60) return;
        const p=0.5+0.5*Math.sin(Date.now()/1400+s.ph);
        c.beginPath();c.arc(s.x*W,s.y*horizY,s.r*p*0.9,0,Math.PI*2);
        c.fillStyle=`rgba(255,255,255,${sa*p})`;c.fill();
      });
    }

    // قمر (هلال واقعي)
    if(ph==='night'||ph==='pre-dawn'){
      const mX=W*0.78,mY=H*0.13,mR=Math.min(W,H)*0.038;
      const mg=c.createRadialGradient(mX,mY,mR*0.6,mX,mY,mR*2.2);
      mg.addColorStop(0,'rgba(210,225,255,.18)');mg.addColorStop(1,'rgba(210,225,255,0)');
      c.beginPath();c.arc(mX,mY,mR*2.2,0,Math.PI*2);c.fillStyle=mg;c.fill();
      const mf=c.createRadialGradient(mX-mR*0.25,mY-mR*0.25,mR*0.05,mX,mY,mR);
      mf.addColorStop(0,'#FEFEFA');mf.addColorStop(0.5,'#E8EEF8');mf.addColorStop(1,'#B8C8DC');
      c.beginPath();c.arc(mX,mY,mR,0,Math.PI*2);c.fillStyle=mf;c.fill();
      c.save();c.globalCompositeOperation='destination-out';
      c.beginPath();c.arc(mX+mR*0.38,mY-mR*0.08,mR*0.82,0,Math.PI*2);c.fill();
      c.globalCompositeOperation='source-over';c.restore();
    }

    // الشمس
    if(sunVisible){
      c.save();
      c.beginPath();c.rect(0,0,W,horizY+sR*0.6);c.clip();
      // أشعة عند الأفق
      if(elev<30&&elev>-8){
        const nRays=16,rayAlpha=Math.max(0,0.055*(1-elev/30));
        for(let i=0;i<nRays;i++){
          const ra=(i/nRays)*Math.PI*2,rayLen=H*0.20;
          const rg2=c.createLinearGradient(sX,sY,sX+Math.cos(ra)*rayLen,sY+Math.sin(ra)*rayLen);
          rg2.addColorStop(0,`rgba(255,200,80,${rayAlpha*3})`);rg2.addColorStop(1,'rgba(255,160,40,0)');
          c.beginPath();c.moveTo(sX,sY);c.lineTo(sX+Math.cos(ra)*rayLen,sY+Math.sin(ra)*rayLen);
          c.strokeStyle=rg2;c.lineWidth=2;c.stroke();
        }
      }
      // هالة
      if(col.sun&&col.sun.gl){
        const glR=sR*(elev<15?5.5:3.5);
        const sg2=c.createRadialGradient(sX,sY,sR*0.3,sX,sY,glR);
        const glBase=col.sun.gl;
        sg2.addColorStop(0,glBase);sg2.addColorStop(0.4,glBase.replace(/[\d.]+\)$/,'0.10)'));sg2.addColorStop(1,'rgba(255,100,0,0)');
        c.beginPath();c.arc(sX,sY,glR,0,Math.PI*2);c.fillStyle=sg2;c.fill();
      }
      // جسم الشمس
      const sf2=c.createRadialGradient(sX-sR*0.22,sY-sR*0.22,sR*0.04,sX,sY,sR);
      sf2.addColorStop(0,'#FFFEF8');sf2.addColorStop(0.25,col.sun?col.sun.c:'#FFFACC');sf2.addColorStop(1,col.sun?col.sun.c:'#FFD700');
      c.beginPath();c.arc(sX,sY,sR,0,Math.PI*2);c.fillStyle=sf2;c.fill();
      c.restore();
      // خط زاوية الأشعة نهاراً
      if(elev>10){
        const ar=(-90+elev)*Math.PI/180,ll=H*0.15;
        c.beginPath();c.moveTo(sX,Math.min(sY,horizY-2));c.lineTo(sX+Math.cos(ar)*ll,sY+Math.sin(ar)*ll);
        c.strokeStyle=`rgba(255,250,130,${Math.min(0.30,elev*0.004)})`;c.lineWidth=1.5;c.setLineDash([4,5]);c.stroke();c.setLineDash([]);
      }
    }

    // سحب واقعية
    if(ph==='day'||ph==='morning'||ph==='afternoon'){
      const cop=ph==='morning'?0.82:ph==='afternoon'?0.70:0.78;
      [[0.12,0.15,1.1,1],[0.38,0.10,0.85,0.9],[0.62,0.18,1.25,0.95],[0.84,0.12,0.9,0.85]].forEach(([cx2,cy2,sc2,op])=>{
        const bx2=cx2*W,by2=cy2*horizY,cr2=Math.min(W,H)*0.045*sc2;
        c.save();c.globalAlpha=cop*op;
        c.fillStyle='rgba(170,195,220,0.25)';
        c.beginPath();c.ellipse(bx2,by2+cr2*0.5,cr2*1.8,cr2*0.45,0,0,Math.PI*2);c.fill();
        [[0,0,1],[cr2*0.68,cr2*0.18,0.75],[-cr2*0.62,cr2*0.12,0.72],[cr2*0.28,-cr2*0.2,0.65],[-cr2*0.28,-cr2*0.1,0.60]].forEach(([dx,dy,rs])=>{
          const cgr=c.createRadialGradient(bx2+dx-cr2*rs*0.15,by2+dy-cr2*rs*0.15,cr2*rs*0.05,bx2+dx,by2+dy,cr2*rs);
          cgr.addColorStop(0,'rgba(255,255,255,0.98)');cgr.addColorStop(0.6,'rgba(238,244,255,0.90)');cgr.addColorStop(1,'rgba(210,225,245,0.0)');
          c.beginPath();c.arc(bx2+dx,by2+dy,cr2*rs,0,Math.PI*2);c.fillStyle=cgr;c.fill();
        });
        c.restore();
      });
    }

    // خط الأفق
    c.beginPath();c.moveTo(0,horizY);c.lineTo(W,horizY);c.strokeStyle='rgba(255,255,255,.06)';c.lineWidth=1;c.stroke();

    // أرضية
    const grd=c.createLinearGradient(0,horizY,0,H);
    let gc3;
    if(ph==='day'||ph==='morning')      gc3=['#3A7A28','#256018','#0D2A08'];
    else if(ph==='afternoon')           gc3=['#2E6A20','#1A4810','#0A2006'];
    else if(ph==='sunrise')             gc3=['#2A4A1A','#162A0C','#060E04'];
    else if(ph==='sunset'||ph==='dusk') gc3=['#3A4A1A','#22300E','#080E04'];
    else                                gc3=['#0E1C0A','#060E05','#020504'];
    grd.addColorStop(0,gc3[0]);grd.addColorStop(0.4,gc3[1]);grd.addColorStop(1,gc3[2]);
    c.fillStyle=grd;c.fillRect(0,horizY,W,H-horizY);

    // انعكاس ضوء الشمس على الأرض
    if(sunVisible&&elev<20){
      const glA=Math.max(0,0.20-elev*0.01);
      const gg=c.createRadialGradient(sX,horizY,0,sX,horizY,W*0.45);
      gg.addColorStop(0,`rgba(255,140,30,${glA})`);gg.addColorStop(0.5,`rgba(255,100,10,${(glA*0.3).toFixed(2)})`);gg.addColorStop(1,'rgba(255,60,0,0)');
      c.fillStyle=gg;c.fillRect(0,horizY-H*0.04,W,H*0.16);
    }

    // أشجار واقعية (مخروط ثلاثي الطبقات)
    const treePositions=[0.04,0.10,0.17,0.24,0.30,0.64,0.70,0.77,0.84,0.90,0.96];
    const treeLight=(ph==='day'||ph==='morning')?1:(ph==='afternoon')?0.85:(ph==='sunrise'||ph==='sunset')?0.45:0.15;
    treePositions.forEach((tx,ti)=>{
      const seed=tx*137.5+ti*31;
      const tH=H*(0.09+0.06*((Math.sin(seed)*0.5+0.5)));
      const tW=tH*0.55;
      const tX=tx*W,tY=horizY;
      // جذع
      const trunkH=tH*0.28,trunkW=Math.max(3,tW*0.12);
      const trunkCol=treeLight>0.5?'#5C3A1E':treeLight>0.3?'#2A1A0C':'#0E0804';
      c.fillStyle=trunkCol;c.fillRect(tX-trunkW/2,tY-trunkH,trunkW,trunkH);
      // 3 طبقات مخروط
      for(let layer=0;layer<3;layer++){
        const ly=tY-trunkH-(layer*tH*0.27);
        const lw=tW*(1-layer*0.22);
        const lh=tH*(0.45+layer*0.08);
        const g=c.createLinearGradient(tX-lw/2,ly-lh,tX+lw/2,ly);
        let treeBase,treeDark;
        if(ph==='day'||ph==='morning'){treeBase=`rgba(${30+layer*8},${100+layer*12},${20+layer*5},1)`;treeDark='rgba(15,60,10,1)';}
        else if(ph==='afternoon'){treeBase=`rgba(${25+layer*6},${88+layer*10},${18+layer*4},1)`;treeDark='rgba(12,50,8,1)';}
        else if(ph==='sunrise'){treeBase=`rgba(${20+layer*4},${55+layer*8},${12+layer*3},0.9)`;treeDark='rgba(8,30,6,1)';}
        else if(ph==='sunset'||ph==='dusk'){treeBase=`rgba(${35+layer*5},${50+layer*8},${10+layer*3},0.85)`;treeDark='rgba(12,22,4,1)';}
        else{treeBase=`rgba(${10+layer*3},${20+layer*5},${5+layer*2},0.9)`;treeDark='rgba(4,8,2,1)';}
        g.addColorStop(0,treeBase);g.addColorStop(1,treeDark);
        c.fillStyle=g;
        c.beginPath();c.moveTo(tX,ly-lh);c.lineTo(tX-lw/2,ly);c.lineTo(tX+lw/2,ly);c.closePath();c.fill();
      }
      // إضاءة جانبية من الشمس
      if(sunVisible&&treeLight>0.3){
        const lightSide=sX<tX?1:-1,lightAlpha=treeLight*0.18;
        c.save();c.globalAlpha=lightAlpha;
        c.fillStyle=ph==='day'?'rgba(200,240,150,1)':'rgba(255,180,80,1)';
        for(let layer=0;layer<3;layer++){
          const ly=horizY-trunkH-(layer*tH*0.27);
          const lw=tH*0.55*(1-layer*0.22);
          c.beginPath();c.moveTo(tX,ly-tH*(0.45+layer*0.08));c.lineTo(tX+lightSide*lw*0.5,ly);c.lineTo(tX,ly);c.closePath();c.fill();
        }
        c.restore();
      }
    });

    // دبوس الطالب
    const pinX=W*0.5;
    c.fillStyle='#E53935';c.beginPath();c.arc(pinX,horizY-28,10,0,Math.PI*2);c.fill();
    c.fillStyle='#FFFFFF';c.beginPath();c.arc(pinX,horizY-28,4,0,Math.PI*2);c.fill();
    c.strokeStyle='#C62828';c.lineWidth=2.5;c.beginPath();c.moveTo(pinX,horizY-18);c.lineTo(pinX,horizY-1);c.stroke();
    c.font=`bold ${Math.round(Math.min(W,H)*0.025)}px Tajawal`;c.textAlign='center';c.fillStyle='rgba(255,255,255,.90)';c.textBaseline='bottom';
    c.fillText('📍 أنت هنا',pinX,horizY-42);

    // ساعة ومرحلة
    const phLabel={'night':'🌙 ليل','pre-dawn':'🌌 ما قبل الفجر','dawn':'🌄 فجر','sunrise':'🌅 شروق','morning':'🌤️ صباح','day':'☀️ نهار','afternoon':'🌤️ بعد الظهر','sunset':'🌇 غروب','dusk':'🌆 شفق'};
    c.font=`bold ${Math.round(Math.min(W,H)*0.033)}px Tajawal`;c.textAlign='left';c.textBaseline='top';
    c.fillStyle='rgba(255,255,255,.88)';c.fillText(`⏰ ${fmtTime(timeMin)}`,14,14);
    c.font=`${Math.round(Math.min(W,H)*0.026)}px Tajawal`;c.fillStyle='rgba(255,255,255,.62)';
    c.fillText(phLabel[ph]||'',14,14+Math.round(Math.min(W,H)*0.040));
  }

  // ── Controls ──
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⏰ الوقت</div>
      <div id="sr-time-disp" style="text-align:center;font-size:19px;font-weight:900;padding:9px;border-radius:10px;margin-bottom:8px;transition:all .3s">🌅 ٦:٠٠ ص</div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:3px"><span>١٢ ص</span><span>الوقت</span><span>١١:٥٩ م</span></div>
      <input type="range" id="sr-slider" min="0" max="1440" value="360" step="1" style="width:100%;margin-bottom:10px"
        oninput="window._srTime=+this.value">
      <div class="btn-row">
        <button class="ctrl-btn primary" id="sr-play-btn"
          onclick="(function(){window._srPlaying=!window._srPlaying;document.getElementById('sr-play-btn').textContent=window._srPlaying?'⏸ إيقاف':'▶ تشغيل';})()">▶ تشغيل</button>
        <button class="ctrl-btn"
          onclick="(function(){window._srPlaying=false;window._srTime=360;var sl=document.getElementById('sr-slider');if(sl)sl.value=360;var b=document.getElementById('sr-play-btn');if(b)b.textContent='▶ تشغيل';})()">↺ إعادة</button>
      </div>
      <div style="margin-top:8px">
        <div class="ctrl-label" style="font-size:11px;margin-bottom:3px">⚡ السرعة</div>
        <input type="range" id="sr-spd" min="1" max="8" value="3" style="width:100%" oninput="window._srSpeed=+this.value">
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🎨 مرحلة السماء</div>
      <div style="position:relative;display:flex;height:22px;border-radius:8px;overflow:hidden;margin:4px 0 8px;border:1px solid rgba(0,0,0,.08)">
        <div style="flex:1;background:linear-gradient(to left,#030A1A,#2D1848)"></div>
        <div style="flex:1;background:linear-gradient(to left,#2D1848,#8B3A1A)"></div>
        <div style="flex:1;background:linear-gradient(to left,#8B3A1A,#FF6B1A)"></div>
        <div style="flex:1;background:linear-gradient(to left,#FF6B1A,#87CEEB)"></div>
        <div style="flex:2;background:#87CEEB"></div>
        <div style="flex:1;background:linear-gradient(to left,#87CEEB,#FF6B1A)"></div>
        <div style="flex:1;background:linear-gradient(to left,#FF6B1A,#2D1848)"></div>
        <div style="flex:1;background:linear-gradient(to left,#2D1848,#030A1A)"></div>
        <div id="sr-phase-marker" style="position:absolute;top:0;width:4px;height:22px;background:white;border-radius:2px;box-shadow:0 0 5px rgba(0,0,0,.3);pointer-events:none;transition:left .15s"></div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:5px;font-size:11px;color:var(--muted)">
        <span>🌑 ليل</span><span>🌄 فجر</span><span>🌅 شروق</span><span>☀️ نهار</span><span>🌇 غروب</span>
      </div>
      <div style="margin-top:8px;display:flex;align-items:center;justify-content:space-between;padding:7px 11px;background:var(--bg);border-radius:9px;font-size:12px">
        <span>زاوية الشمس</span>
        <span id="sr-angle-val" style="font-size:17px;font-weight:900;color:var(--teal)">—</span>
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">💡 استكشف وفكّر</div>
      <div class="q-box"><strong>❓ هل الشمس تتحرك أم الأرض؟</strong>
        <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
        <div class="q-ans-panel">الشمس ثابتة في مكانها — الأرض هي التي تدور حول محورها من الغرب إلى الشرق، مما يجعل الشمس تبدو وكأنها تشرق من الشرق وتغرب في الغرب.</div>
      </div>
      <div class="q-box" style="margin-top:6px">
        <strong>❓ لماذا تتغير ألوان السماء؟</strong>
        <div style="font-size:11px;margin-top:3px;color:var(--muted)">لاحظ زاوية الأشعة عند الشروق والظهر</div>
        <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
        <div class="q-ans-panel">عند الشروق والغروب تمر أشعة الشمس بمسار أطول في الغلاف الجوي، فتتشتت الألوان الزرقاء ويبقى الأحمر والبرتقالي. أما عند الظهر فالأشعة مباشرة فتبدو السماء زرقاء.</div>
      </div>
    </div>
    <div class="ctrl-section">
      <div style="background:linear-gradient(135deg,rgba(26,143,168,.10),rgba(212,144,26,.08));border:2px solid rgba(26,143,168,.25);border-radius:12px;padding:11px 13px">
        <div style="font-size:13px;font-weight:800;color:var(--teal);margin-bottom:5px">🔬 الاستنتاج العلمي</div>
        <div style="font-size:12px;line-height:1.9">
          ✅ الشروق والغروب بسبب <strong style="color:var(--teal)">دوران الأرض</strong><br>
          ✅ الألوان تتغير بسبب <strong style="color:var(--gold)">زاوية أشعة الشمس</strong>
        </div>
      </div>
      <div class="info-box" style="margin-top:8px;font-size:12px;line-height:2">
        🌅 <strong>الشروق:</strong> ~٦:٠٠ ص<br>
        ☀️ <strong>ذروة النهار:</strong> ~١٢:٠٠ ظ<br>
        🌇 <strong>الغروب:</strong> ~١٨:٠٠ م
      </div>
    </div>`);

  window._srTime    = timeMin;
  window._srPlaying = false;
  window._srSpeed   = 3;

  function draw(ts) {
    if(currentSim !== 'g5sunrise') { cancelAnimationFrame(animFrame); return; }

    if(window._srPlaying){
      const dt=ts-lastTs;
      if(dt>14){ window._srTime=((window._srTime||360)+(window._srSpeed||3)*dt/60)%1440; lastTs=ts; }
    } else { lastTs=ts; }
    timeMin = window._srTime || 360;

    // مزامنة الشريط
    const sl=document.getElementById('sr-slider');
    if(sl) sl.value=Math.round(timeMin);

    // تحديث الوقت
    const ph=skyPhase(timeMin), elev=sunElev(timeMin);
    const phMeta={'night':{bg:'rgba(10,20,50,.12)',c:'#5577AA',em:'🌙'},'pre-dawn':{bg:'rgba(40,20,80,.12)',c:'#8866CC',em:'🌌'},'dawn':{bg:'rgba(180,80,30,.12)',c:'#CC5520',em:'🌄'},'sunrise':{bg:'rgba(255,130,30,.15)',c:'#CC6610',em:'🌅'},'morning':{bg:'rgba(50,150,220,.10)',c:'#1A7AAA',em:'🌤️'},'day':{bg:'rgba(30,130,200,.10)',c:'#1A6A9A',em:'☀️'},'afternoon':{bg:'rgba(50,140,200,.10)',c:'#1A6A9A',em:'🌤️'},'sunset':{bg:'rgba(255,110,20,.15)',c:'#BB5510',em:'🌇'},'dusk':{bg:'rgba(120,40,100,.12)',c:'#884466',em:'🌆'}};
    const pcol=phMeta[ph]||phMeta['night'];
    const td=document.getElementById('sr-time-disp');
    if(td){td.style.background=pcol.bg;td.style.color=pcol.c;td.textContent=`${pcol.em} ${fmtTime(timeMin)}`;}
    const av=document.getElementById('sr-angle-val');
    if(av){if(elev<-5){av.textContent='تحت الأفق';av.style.color='var(--muted)';}else{av.textContent=Math.round(elev)+'°';av.style.color=elev>45?'#FF9800':elev>10?'var(--teal)':'#DD5500';}}
    const pm=document.getElementById('sr-phase-marker');
    if(pm){const pct=(((timeMin%1440)+1440)%1440)/1440*100;pm.style.left=`calc(${pct}% - 2px)`;}

    const c2=cv.getContext('2d');
    const W=cv.width, H=cv.height;
    c2.clearRect(0,0,W,H);
    drawSurface(c2,W,H);

    animFrame=requestAnimationFrame(draw);
  }
  lastTs=performance.now();
  animFrame=requestAnimationFrame(draw);
}

function simG5EarthSun() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">🌍 النظام الشمسي المصغّر</div>
  <div class="ctrl-desc">
    شاهد حركة الأرض حول الشمس والقمر حول الأرض في آنٍ واحد
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">📅 حقائق المدارات</div>
  <div class="ctrl-desc">
    🌍 الأرض تدور حول الشمس في <b>٣٦٥ يوماً</b><br>
    🌙 القمر يدور حول الأرض في <b>٢٩.٥ يوماً</b><br>
    🔄 الأرض تدور حول نفسها كل <b>٢٤ ساعة</b>
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٦ · د١):</strong><br>
  ١-  كيف تتحرك الأرض بالنسبة لشمس ؟<br>
  ٢- اشرح الفرق بين النجم والكوكب؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">١- تدور الأرض حول الشمس .<br>٢- يشع النجم الضوء والحرارة أما الكوكب فيعكس الضوء.</div>
</div>`;
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const w=cv.width, h=cv.height;
  const S=simState;
  if(!S.esInit){S.esInit=true;S.t=0;S.speed=1;S.paused=false;
    cv.onclick=function(){S.paused=!S.paused;};
  }
  function draw(){
    if(currentSim!=='g5earthsun') return;
    if(!S.paused) S.t+=0.008*S.speed;
    c.fillStyle='#000510'; c.fillRect(0,0,w,h);
    // Stars
    for(let i=0;i<80;i++){
      const sx=((i*137+13)%100)/100*w, sy=((i*97+7)%100)/100*h;
      const blink=0.3+0.7*Math.sin(S.t*2+i);
      c.fillStyle=`rgba(255,255,255,${blink*0.8})`;
      c.beginPath(); c.arc(sx,sy,0.8,0,Math.PI*2); c.fill();
    }
    const cx2=w*0.5, cy2=h*0.5;
    // Sun
    const sunG=c.createRadialGradient(cx2,cy2,0,cx2,cy2,w*0.09);
    sunG.addColorStop(0,'#FFF7C0'); sunG.addColorStop(0.4,'#FFD700'); sunG.addColorStop(1,'rgba(255,150,0,0)');
    c.fillStyle=sunG; c.beginPath(); c.arc(cx2,cy2,w*0.09,0,Math.PI*2); c.fill();
    c.fillStyle='#FFE000'; c.beginPath(); c.arc(cx2,cy2,w*0.05,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,255,200,0.9)'; c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`; c.textAlign='center';
    c.fillText('الشمس', cx2, cy2+w*0.075);
    // Earth orbit
    const earthR=w*0.3;
    c.strokeStyle='rgba(255,255,255,0.12)'; c.lineWidth=1; c.setLineDash([3,3]);
    c.beginPath(); c.ellipse(cx2,cy2,earthR,earthR*0.85,0,0,Math.PI*2); c.stroke(); c.setLineDash([]);
    const earthAngle=S.t;
    const ex=cx2+earthR*Math.cos(earthAngle), ey=cy2+earthR*0.85*Math.sin(earthAngle);
    // Earth glow
    const eg=c.createRadialGradient(ex,ey,0,ex,ey,w*0.05);
    eg.addColorStop(0,'rgba(100,200,255,0.6)'); eg.addColorStop(1,'rgba(100,200,255,0)');
    c.fillStyle=eg; c.beginPath(); c.arc(ex,ey,w*0.05,0,Math.PI*2); c.fill();
    // Earth
    c.fillStyle='#1A6FA8';
    c.beginPath(); c.arc(ex,ey,w*0.032,0,Math.PI*2); c.fill();
    c.fillStyle='#27AE60';
    c.beginPath(); c.arc(ex+w*0.008,ey-w*0.005,w*0.018,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,255,255,0.9)'; c.font=`${Math.max(9,w*0.019)}px Tajawal`; c.textAlign='center';
    c.fillText('الأرض', ex, ey+w*0.05);
    // Moon orbit around Earth
    const moonR=w*0.065;
    c.strokeStyle='rgba(255,255,255,0.08)'; c.lineWidth=1; c.setLineDash([2,2]);
    c.beginPath(); c.arc(ex,ey,moonR,0,Math.PI*2); c.stroke(); c.setLineDash([]);
    const moonAngle=S.t*12;
    const mx2=ex+moonR*Math.cos(moonAngle), my2=ey+moonR*0.8*Math.sin(moonAngle);
    c.fillStyle='#C8C8C8'; c.beginPath(); c.arc(mx2,my2,w*0.012,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,255,255,0.7)'; c.font=`${Math.max(8,w*0.016)}px Tajawal`; c.textAlign='center';
    c.fillText('القمر', mx2, my2+w*0.025);
    // Info
    const dayCount=Math.floor((S.t/(Math.PI*2))*365)%365;
    c.fillStyle='rgba(0,0,0,0.55)'; c.strokeStyle='rgba(255,255,255,0.15)'; c.lineWidth=1;
    c.beginPath(); c.roundRect(w*0.02,h*0.02,w*0.5,h*0.1,6); c.fill(); c.stroke();
    c.fillStyle='#4DC4E0'; c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`; c.textAlign='right';
    c.fillText(`اليوم: ${dayCount} من 365 🗓️`, w*0.51, h*0.065);
    c.fillStyle='rgba(255,255,255,0.6)'; c.font=`${Math.max(9,w*0.018)}px Tajawal`;
    c.fillText('انقر للإيقاف/الاستمرار', w*0.51, h*0.1);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG5OrbitalPaths() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">🔄 مسارات الكواكب</div>
  <div class="ctrl-desc">
    شاهد المسارات البيضاوية للكواكب حول الشمس ولاحظ الفرق في سرعاتها
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">💡 قانون كيبلر</div>
  <div class="ctrl-desc">
    الكوكب الأقرب من الشمس يتحرّك <b>أسرع</b> في مداره
  </div>
</div>
<div class="q-box">
  <strong>❓ فكّر:</strong><br>
  هل نستطيع أن نعيش على الأرض بدون وجود شمس؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">لا، لانه لو لم تكن هناك شمس لن تنمو النباتات حيث أنها تحتاج إلى ضوء وحرارة بالتالي عدم وجود نباتات يعني عدم وجود حيوانات، بالاضافة إلى أن الشمس تؤدي إلى تبخر الماء وتشكل الأمطار وبدون ذلك لن نستطيع العيش على الأرض .</div>
</div>`;
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const w=cv.width, h=cv.height;
  const S=simState;
  if(!S.opInit){S.opInit=true;S.t=0;}
  function draw(){
    if(currentSim!=='g5earthsun') return;
    S.t+=0.01;
    c.fillStyle='#000818'; c.fillRect(0,0,w,h);
    // Title
    c.fillStyle='rgba(255,255,255,0.9)'; c.font=`bold ${Math.max(12,w*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText('مقارنة مدارات الكواكب', w/2, h*0.08);
    // Solar system overview: Sun centered
    const cx2=w*0.5, cy2=h*0.50;
    const sunR=Math.max(18,w*0.038);
    const sg=c.createRadialGradient(cx2,cy2,0,cx2,cy2,sunR*2);
    sg.addColorStop(0,'#FFF7C0'); sg.addColorStop(0.4,'#FFD700'); sg.addColorStop(1,'rgba(255,150,0,0)');
    c.fillStyle=sg; c.beginPath(); c.arc(cx2,cy2,sunR*2,0,Math.PI*2); c.fill();
    c.fillStyle='#FFE000'; c.beginPath(); c.arc(cx2,cy2,sunR,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,255,200,0.9)'; c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`; c.textAlign='center';
    c.fillText('الشمس', cx2, cy2+sunR+16);
    // نضمن أن المدارات لا تتجاوز حدود الكانفس
    // cy2=h*0.50 → أقصى ry مسموح = h*0.42 (مع هامش للنص)
    const maxRy = h * 0.40;
    const planets=[
      {name:'عطارد',rx:w*0.10,ry:Math.min(h*0.08, maxRy), speed:4.15,size:5, color:'#A0A0A0',period:'88 يوم'},
      {name:'الزهرة',rx:w*0.16,ry:Math.min(h*0.13, maxRy), speed:1.62,size:8, color:'#E8C080',period:'225 يوم'},
      {name:'الأرض', rx:w*0.22,ry:Math.min(h*0.18, maxRy), speed:1,   size:9, color:'#4488FF',period:'365 يوم'},
      {name:'المريخ',rx:w*0.29,ry:Math.min(h*0.22, maxRy), speed:0.53,size:7, color:'#CC4400',period:'687 يوم'},
    ];
    planets.forEach(p=>{
      // Draw elliptical orbit path
      c.strokeStyle='rgba(255,255,255,0.15)'; c.lineWidth=1; c.setLineDash([3,4]);
      c.beginPath(); c.ellipse(cx2,cy2,p.rx,p.ry,0,0,Math.PI*2); c.stroke(); c.setLineDash([]);
      // Planet position on ellipse
      const angle=S.t*p.speed;
      const px2=cx2+p.rx*Math.cos(angle);
      const py=cy2+p.ry*Math.sin(angle);
      // Planet glow
      const pg=c.createRadialGradient(px2,py,0,px2,py,p.size*2.5);
      pg.addColorStop(0,p.color+'99'); pg.addColorStop(1,'rgba(0,0,0,0)');
      c.fillStyle=pg; c.beginPath(); c.arc(px2,py,p.size*2.5,0,Math.PI*2); c.fill();
      // Planet
      c.fillStyle=p.color;
      c.beginPath(); c.arc(px2,py,p.size,0,Math.PI*2); c.fill();
      // Label
      c.fillStyle='rgba(255,255,255,0.85)'; c.font=`bold ${Math.max(9,w*0.019)}px Tajawal`; c.textAlign='center';
      c.fillText(p.name, px2, py+p.size+14);
      c.fillStyle='rgba(255,255,255,0.45)'; c.font=`${Math.max(8,w*0.015)}px Tajawal`;
      c.fillText(p.period, px2, py+p.size+26);
    });
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG5DayNight() {
  cancelAnimationFrame(animFrame);

  let angle  = 0;
  let speed  = 0.010;
  let paused = false;
  const cv   = document.getElementById('simCanvas');

  // القارات المحسّنة (مع أنتاركتيكا وجرينلاند)
  const LANDS_DN=[
    { lon:-1.70, lat: 0.55, pts:[[-0.55,-0.28],[0.55,-0.28],[0.60,0.10],[0.30,0.32],[-0.10,0.35],[-0.50,0.20],[-0.65,-0.05]] },
    { lon:-1.15, lat:-0.25, pts:[[-0.28,-0.48],[0.18,-0.48],[0.32,0.00],[0.20,0.48],[-0.10,0.50],[-0.30,0.20],[-0.35,-0.15]] },
    { lon: 0.25, lat: 0.78, pts:[[-0.30,-0.22],[0.25,-0.28],[0.38,0.05],[0.15,0.28],[-0.20,0.22],[-0.32,0.00]] },
    { lon: 0.22, lat: 0.00, pts:[[-0.30,-0.55],[0.22,-0.55],[0.38,-0.10],[0.28,0.50],[0.00,0.68],[-0.22,0.45],[-0.35,0.00],[-0.35,-0.28]] },
    { lon: 1.55, lat: 0.55, pts:[[-0.80,-0.30],[-0.10,-0.55],[0.65,-0.45],[0.90,-0.10],[0.75,0.28],[0.30,0.40],[-0.10,0.35],[-0.50,0.18],[-0.80,0.00]] },
    { lon: 2.30, lat:-0.42, pts:[[-0.35,-0.22],[0.28,-0.28],[0.40,0.05],[0.22,0.28],[-0.10,0.30],[-0.38,0.10]] },
    { lon:-0.82, lat: 1.10, pts:[[-0.18,-0.18],[0.12,-0.18],[0.18,0.10],[0.00,0.22],[-0.18,0.10]] },
    { lon: 0.00, lat:-1.38, pts:[[-1.0,-0.15],[1.0,-0.15],[1.0,0.15],[-1.0,0.15]] },
  ];

  function lonLatToXYZ_DN(lon, lat) {
    const c2 = Math.cos(lat);
    return { x: c2*Math.sin(lon), y: Math.sin(lat), z: c2*Math.cos(lon) };
  }
  function projectDN(x, y, z, rot, cx, cy, R) {
    const xr =  x*Math.cos(rot) + z*Math.sin(rot);
    const yr =  y;
    const zr = -x*Math.sin(rot) + z*Math.cos(rot);
    return { px: cx+xr*R, py: cy-yr*R, zr };
  }

  // رسم الكرة الأرضية المحسّنة
  function drawEarthDN(ctx, cx, cy, R, rot) {
    const D=Math.ceil(R*2)+8; const off=document.createElement('canvas'); off.width=off.height=D; const oc=off.getContext('2d'); const half=D/2;
    const id=oc.createImageData(D,D); const data=id.data;
    for(let row=0;row<D;row++){for(let col=0;col<D;col++){
      const nx=(col-half)/R, ny=(row-half)/R, n2=nx*nx+ny*ny; if(n2>1) continue;
      const nz=Math.sqrt(1-n2), wx=nx*Math.cos(-rot)+nz*Math.sin(-rot);
      const raw=wx, lit=Math.max(0,Math.min(1,(raw+0.09)/0.18));
      let r,g,b;
      if(lit>0.01){const t2=lit;r=Math.round(20+t2*50);g=Math.round(80+t2*100);b=Math.round(160+t2*80);if(lit<0.35){const tw=(0.35-lit)/0.35;r=Math.round(r+tw*80);g=Math.round(g+tw*20);}}
      else{r=3;g=6;b=22;}
      const idx=(row*D+col)*4; data[idx]=r;data[idx+1]=g;data[idx+2]=b;data[idx+3]=255;
    }}
    oc.putImageData(id,0,0);
    oc.save(); oc.beginPath(); oc.arc(half,half,R,0,Math.PI*2); oc.clip();
    LANDS_DN.forEach(land=>{
      const verts=land.pts.map(([dl,dlt])=>{
        const p3=lonLatToXYZ_DN(land.lon+dl,land.lat+dlt);
        return projectDN(p3.x,p3.y,p3.z,rot,half,half,R);
      });
      const cen3=lonLatToXYZ_DN(land.lon,land.lat);
      const cenRx=cen3.x*Math.cos(-rot)+cen3.z*Math.sin(-rot);
      const cenLit=Math.max(0,Math.min(1,(cenRx+0.09)/0.18));
      const isAntarctic=Math.abs(land.lat)>1.2;
      let dr,dg,db,nr,ng,nb;
      if(isAntarctic){dr=235;dg=245;db=255;nr=40;ng=55;nb=80;}
      else{dr=52;dg=160;db=72;nr=8;ng=30;nb=14;}
      const cr=Math.round(nr+(dr-nr)*cenLit), cg2=Math.round(ng+(dg-ng)*cenLit), cb2=Math.round(nb+(db-nb)*cenLit);
      if(verts.filter(v=>v.zr>-0.1).length<2) return;
      oc.beginPath(); oc.moveTo(verts[0].px,verts[0].py);
      for(let i=1;i<verts.length;i++) oc.lineTo(verts[i].px,verts[i].py);
      oc.closePath(); oc.fillStyle=`rgb(${cr},${cg2},${cb2})`; oc.fill();
      if(cenLit>0.15){oc.strokeStyle=`rgba(30,80,30,${cenLit*0.4})`;oc.lineWidth=0.5;oc.stroke();}
    });
    // أضواء مدن ليلية
    const CITIES_DN=[[-1.62,0.84],[-0.13,0.89],[2.35,0.84],[1.39,0.62],[0.37,0.52],[2.17,0.62],[-0.77,0.35],[2.63,-0.60],[-1.98,0.79],[0.68,0.86],[2.03,0.57],[0.24,0.61]];
    CITIES_DN.forEach(([lon2,lat2])=>{
      const p3=lonLatToXYZ_DN(lon2,lat2);
      const pr=projectDN(p3.x,p3.y,p3.z,rot,half,half,R);
      if(pr.zr<0.05) return;
      const wxC=p3.x*Math.cos(-rot)+p3.z*Math.sin(-rot);
      const litC=Math.max(0,Math.min(1,(-wxC+0.09)/0.18));
      if(litC>0.20) return;
      const alpha=(0.25-litC)/0.25*0.9;
      const glow2=oc.createRadialGradient(pr.px,pr.py,0,pr.px,pr.py,R*0.045);
      glow2.addColorStop(0,`rgba(255,220,100,${alpha})`); glow2.addColorStop(1,'rgba(255,190,60,0)');
      oc.beginPath(); oc.arc(pr.px,pr.py,R*0.045,0,Math.PI*2); oc.fillStyle=glow2; oc.fill();
      oc.beginPath(); oc.arc(pr.px,pr.py,R*0.012,0,Math.PI*2); oc.fillStyle=`rgba(255,245,180,${alpha})`; oc.fill();
    });
    oc.restore();
    // هالة الغلاف الجوي — على الحافة فقط لا يغطي الأرض
    const atmo=oc.createRadialGradient(half,half,R*0.96,half,half,R*1.18);
    atmo.addColorStop(0,'rgba(80,160,255,0.22)'); atmo.addColorStop(0.6,'rgba(50,110,220,0.07)'); atmo.addColorStop(1,'rgba(20,60,180,0)');
    oc.beginPath(); oc.arc(half,half,R*1.18,0,Math.PI*2); oc.fillStyle=atmo; oc.fill();
    oc.beginPath(); oc.arc(half,half,R,0,Math.PI*2); oc.strokeStyle='rgba(80,150,230,0.40)'; oc.lineWidth=1.5; oc.stroke();
    ctx.drawImage(off,cx-half,cy-half);
    ctx.save(); ctx.translate(cx,cy);
    const tilt=23.5*Math.PI/180, axX=Math.sin(tilt)*R*1.32, axY=Math.cos(tilt)*R*1.32;
    ctx.beginPath(); ctx.moveTo(-axX,-axY); ctx.lineTo(axX,axY);
    ctx.strokeStyle='rgba(200,230,255,0.55)'; ctx.lineWidth=1.5; ctx.setLineDash([5,4]); ctx.stroke(); ctx.setLineDash([]);
    [-1,1].forEach(d=>{ctx.beginPath();ctx.arc(d*axX,d*axY,4,0,Math.PI*2);ctx.fillStyle='rgba(220,240,255,0.90)';ctx.fill();});
    ctx.restore();
  }

  // ── Controls ──
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌍 تعاقب الليل والنهار</div>
      <div class="ctrl-desc" style="font-size:12.5px;color:var(--text-secondary);line-height:2.0">
        ☀️ الشمس <strong style="color:var(--gold)">ثابتة</strong> في مكانها<br>
        🔄 الأرض <strong style="color:var(--teal)">تدور حول محورها</strong><br>
        الجانب المضيء = <strong style="color:#FFD54F">نهار</strong> · الجانب المظلم = <strong style="color:#90B8FF">ليل</strong>
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">⚙️ التحكّم</div>
      <button class="ctrl-btn" id="dn-play-btn" style="width:100%;margin-bottom:8px"
        onclick="(function(){window._dnpaused=!window._dnpaused;document.getElementById('dn-play-btn').textContent=window._dnpaused?'▶ متابعة':'⏸ إيقاف';})()">⏸ إيقاف</button>
      <div class="ctrl-label" style="font-size:12px">🔄 سرعة الدوران</div>
      <input type="range" id="dn-spd" min="1" max="10" value="5" style="width:100%;margin:5px 0 8px"
        oninput="window._dnspeed=(+this.value/5)*0.010">
      <button class="ctrl-btn" style="width:100%"
        onclick="(function(){window._dnangle=0;window._dnpaused=false;window._dnspeed=0.010;var sl=document.getElementById('dn-spd');if(sl)sl.value=5;var b=document.getElementById('dn-play-btn');if(b)b.textContent='⏸ إيقاف';})()">↺ إعادة</button>
    </div>
    <div class="q-box" style="margin-top:6px">
      <strong>❓ أسئلة الكتاب (و٦ · د٣):</strong><br>
      <span style="font-size:12px">١- لماذا نرى الشمس تشرق من الشرق؟<br>
      ٢- في أيّ اتجاه تدور الأرض حول محورها؟</span>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">١- لأن الأرض تدور من الغرب إلى الشرق، فالجزء الشرقي يواجه الشمس أولاً.<br>٢- من الغرب إلى الشرق (عكس اتجاه عقارب الساعة عند النظر من القطب الشمالي).</div>
    </div>
    <div class="info-box" style="margin-top:8px;font-size:12px;line-height:2.0">
      🌅 <strong>الشروق:</strong> انتقال من الظلام إلى الضوء<br>
      🌇 <strong>الغروب:</strong> انتقال من الضوء إلى الظلام<br>
      ⏱ <strong>يوم كامل:</strong> 24 ساعة = دورة واحدة
    </div>`);

  window._dnangle  = angle;
  window._dnspeed  = speed;
  window._dnpaused = paused;

  // نجوم عشوائية ثابتة
  if(!window._dnStars){
    window._dnStars = Array.from({length:55},()=>({x:Math.random(),y:Math.random(),r:0.4+Math.random()*1.1,ph:Math.random()*Math.PI*2}));
  }
  const STARS_DN = window._dnStars;

  // حزم ضوئية: كل حزمة عبارة عن فوتون يتحرك من الشمس إلى الأرض
  // offset: إزاحة عمودية نسبية (-1 إلى 1)
  const BEAMS = [
    {off:-0.32, phase:0.00},
    {off:-0.16, phase:0.22},
    {off: 0.00, phase:0.44},
    {off: 0.16, phase:0.66},
    {off: 0.32, phase:0.88},
  ];

  function draw() {
    if(currentSim!=='g5rotation' && currentSim!=='g5earthorbit') { cancelAnimationFrame(animFrame); return; }

    paused = window._dnpaused;
    speed  = window._dnspeed !== undefined ? window._dnspeed : speed;
    if(!paused) { window._dnangle = (window._dnangle||0) + speed; angle = window._dnangle; }
    else { angle = window._dnangle||0; }

    const c = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    c.clearRect(0,0,W,H);

    // خلفية فضاء
    const bg=c.createRadialGradient(W*.5,H*.5,0,W*.5,H*.5,Math.max(W,H)*.72);
    bg.addColorStop(0,'#060E20'); bg.addColorStop(1,'#010408');
    c.fillStyle=bg; c.fillRect(0,0,W,H);

    // نجوم
    const T=Date.now();
    STARS_DN.forEach((s,i)=>{
      const p=0.50+0.50*Math.sin(T/1500+s.ph);
      c.beginPath(); c.arc(s.x*W,s.y*H,s.r*p*0.9,0,Math.PI*2);
      c.fillStyle=`rgba(255,255,255,${0.40*p+0.15})`; c.fill();
    });

    const minD=Math.min(W,H);
    const sunR=minD*0.105, earthR=minD*0.175;
    const sunX=W*0.17, sunY=H*0.48;
    const earthX=W*0.63, earthY=H*0.48;

    // ── الحزم الضوئية المتحركة ──
    // حزمة خلفية ثابتة (تدرج لوني)
    const beamSpread = earthR * 1.10; // عرض شعاع الضوء عند الأرض
    const sunEdgeX = sunX + sunR * 1.05;
    const earthEdgeX = earthX - earthR * 0.96;

    // تدرج الضوء العريض كمنطقة مضيئة
    const areaGrad = c.createLinearGradient(sunEdgeX, 0, earthEdgeX, 0);
    areaGrad.addColorStop(0, 'rgba(255,240,120,0.10)');
    areaGrad.addColorStop(0.5,'rgba(255,235,100,0.05)');
    areaGrad.addColorStop(1, 'rgba(255,235,100,0.0)');
    c.beginPath();
    c.moveTo(sunEdgeX, sunY - sunR*0.8);
    c.lineTo(earthEdgeX, earthY - beamSpread);
    c.lineTo(earthEdgeX, earthY + beamSpread);
    c.lineTo(sunEdgeX, sunY + sunR*0.8);
    c.closePath();
    c.fillStyle = areaGrad; c.fill();

    // الحزم المتحركة الفردية
    BEAMS.forEach((beam, idx) => {
      const beamY_sun  = sunY  + beam.off * sunR  * 0.75;
      const beamY_earth= earthY + beam.off * earthR * 0.88;

      // خط الحزمة المتقطع
      c.save();
      c.beginPath();
      c.moveTo(sunEdgeX, beamY_sun);
      c.lineTo(earthEdgeX, beamY_earth);
      c.strokeStyle='rgba(255,240,100,0.12)';
      c.lineWidth=1.2; c.setLineDash([5,9]); c.stroke(); c.setLineDash([]); c.restore();

      // فوتون يتحرك على الحزمة
      const t_photon = ((T/900 * 0.55 + beam.phase) % 1.0); // 0→1 على طول الحزمة
      const px_ph = sunEdgeX  + t_photon * (earthEdgeX - sunEdgeX);
      const py_ph = beamY_sun + t_photon * (beamY_earth - beamY_sun);

      // ألق الفوتون
      const glowR = minD * 0.022;
      const pg = c.createRadialGradient(px_ph, py_ph, 0, px_ph, py_ph, glowR);
      pg.addColorStop(0, 'rgba(255,255,200,0.95)');
      pg.addColorStop(0.35,'rgba(255,240,80,0.65)');
      pg.addColorStop(1,   'rgba(255,220,0,0)');
      c.beginPath(); c.arc(px_ph, py_ph, glowR, 0, Math.PI*2);
      c.fillStyle=pg; c.fill();

      // نقطة مركز الفوتون
      c.beginPath(); c.arc(px_ph, py_ph, minD*0.006, 0, Math.PI*2);
      c.fillStyle='rgba(255,255,220,0.95)'; c.fill();

      // ذيل الفوتون (trail)
      const trailLen = 0.12;
      const t_tail = Math.max(0, t_photon - trailLen);
      const px_tail = sunEdgeX  + t_tail * (earthEdgeX - sunEdgeX);
      const py_tail = beamY_sun + t_tail * (beamY_earth - beamY_sun);
      const tg = c.createLinearGradient(px_tail, py_tail, px_ph, py_ph);
      tg.addColorStop(0,'rgba(255,240,80,0)');
      tg.addColorStop(1,'rgba(255,240,80,0.45)');
      c.beginPath(); c.moveTo(px_tail,py_tail); c.lineTo(px_ph,py_ph);
      c.strokeStyle=tg; c.lineWidth=1.8; c.stroke();
    });

    // ── الشمس ──
    const ha=c.createRadialGradient(sunX,sunY,sunR*0.4,sunX,sunY,sunR*2.8);
    ha.addColorStop(0,'rgba(255,210,60,0.25)'); ha.addColorStop(1,'rgba(255,100,0,0)');
    c.beginPath(); c.arc(sunX,sunY,sunR*2.8,0,Math.PI*2); c.fillStyle=ha; c.fill();
    const sg=c.createRadialGradient(sunX-sunR*0.22,sunY-sunR*0.22,sunR*0.05,sunX,sunY,sunR);
    sg.addColorStop(0,'#FFFDCC'); sg.addColorStop(0.25,'#FFE240'); sg.addColorStop(0.65,'#FF9500'); sg.addColorStop(1,'#CC3500');
    c.beginPath(); c.arc(sunX,sunY,sunR,0,Math.PI*2); c.fillStyle=sg; c.fill();
    for(let i=0;i<14;i++){
      const ra=(i/14)*Math.PI*2+T/2400, len=0.42+0.14*Math.sin(T/700+i*0.9);
      c.beginPath();
      c.moveTo(sunX+Math.cos(ra)*sunR*1.07, sunY+Math.sin(ra)*sunR*1.07);
      c.lineTo(sunX+Math.cos(ra)*sunR*(1+len), sunY+Math.sin(ra)*sunR*(1+len));
      c.strokeStyle=`rgba(255,215,60,${0.30+0.12*Math.sin(T/500+i)})`; c.lineWidth=1.8; c.stroke();
    }

    // ── الأرض ──
    drawEarthDN(c, earthX, earthY, earthR, angle);

    // تسميات
    c.textAlign='center'; c.textBaseline='top';
    const sunLY=sunY+sunR+20;
    c.font=`bold ${Math.round(minD*0.034)}px Tajawal`; c.fillStyle='#FFE87A'; c.fillText('☀️ الشمس',sunX,sunLY);
    c.font=`${Math.round(minD*0.020)}px Tajawal`; c.fillStyle='rgba(255,215,80,.65)'; c.fillText('ثابتة في مكانها',sunX,sunLY+22);

    const earthLY=earthY+earthR+20;
    c.font=`bold ${Math.round(minD*0.034)}px Tajawal`; c.fillStyle='#8ED8FF'; c.fillText('🌍 الأرض',earthX,earthLY);
    c.font=`${Math.round(minD*0.020)}px Tajawal`; c.fillStyle='rgba(140,215,255,.65)'; c.fillText('تدور حول محورها',earthX,earthLY+22);

    const gap=earthR+26;
    // بادجات نهار/ليل فوق الكرة
    const labelY = earthY - earthR - 36;
    c.font = `bold ${Math.round(minD*0.027)}px Tajawal`;
    const dayLabel='نهار ☀️', nightLabel='🌙 ليل';
    // نهار على اليسار (جهة الشمس)
    const dayLX = earthX - earthR - 14;
    const dayW  = c.measureText(dayLabel).width + 20;
    c.fillStyle='rgba(255,215,50,0.15)'; c.beginPath(); c.roundRect(dayLX-dayW, labelY-14, dayW, 28, 8); c.fill();
    c.strokeStyle='rgba(255,215,50,0.40)'; c.lineWidth=1; c.stroke();
    c.textAlign='right'; c.fillStyle='#FFD54F'; c.textBaseline='middle';
    c.fillText(dayLabel, dayLX, labelY);
    // ليل على اليمين
    const nitLX = earthX + earthR + 14;
    const nitW  = c.measureText(nightLabel).width + 20;
    c.fillStyle='rgba(130,180,255,0.15)'; c.beginPath(); c.roundRect(nitLX, labelY-14, nitW, 28, 8); c.fill();
    c.strokeStyle='rgba(130,180,255,0.40)'; c.lineWidth=1; c.stroke();
    c.textAlign='left'; c.fillStyle='#90B8FF';
    c.fillText(nightLabel, nitLX, labelY);
    c.textBaseline='alphabetic';

    // مؤشر الدوران
    const deg=Math.round(((angle%(Math.PI*2))+(Math.PI*2))%(Math.PI*2)/(Math.PI*2)*360);
    c.font=`${Math.round(H*0.028)}px Tajawal`; c.textAlign='left'; c.textBaseline='top';
    c.fillStyle='rgba(150,200,255,0.60)'; c.fillText(`🔄 ${deg}°`,14,14);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}


function simG5Seasons() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">🍂 الفصول الأربعة</div>
  <div class="ctrl-desc">
    شاهد كيف يُسبّب ميل محور الأرض تغيّر الفصول خلال دورانها حول الشمس
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">🌐 سبب الفصول في عُمان</div>
  <div class="ctrl-desc">
    🌞 <b>الصيف:</b> الشمس أعلى، الأشعة أكثر تركيزاً<br>
    ❄️ <b>الشتاء:</b> الشمس أخفض، الأشعة أكثر انتشاراً<br>
    ⚠️ السبب ليس المسافة من الشمس!
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٦ · د٣-ب):</strong><br>
  لماذا تشهد عُمان صيفاً حاراً وليس شتاءً بارداً جداً؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">لأن عُمان تقع قرب خط الاستواء، فتصلها أشعة الشمس بزاوية كبيرة طوال العام مما يجعل درجات الحرارة مرتفعة نسبياً. الشتاء أقل حرارة لكن لا يكون بارداً كالمناطق الشمالية.</div>
</div>`;
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const w=cv.width, h=cv.height;
  const S=simState;
  if(!S.seasInit){S.seasInit=true;S.t=0;S.paused=false;cv.onclick=function(){S.paused=!S.paused;};}
  function draw(){
    if(currentSim!=='g5rotation' && currentSim!=='g5earthorbit') return;
    if(!S.paused) S.t+=0.01;
    c.fillStyle='#000511'; c.fillRect(0,0,w,h);
    for(let i=0;i<60;i++){
      const sx=((i*173)%100)/100*w, sy=((i*97)%100)/100*h;
      c.fillStyle=`rgba(255,255,255,${0.2+0.4*Math.sin(S.t+i)})`;
      c.beginPath(); c.arc(sx,sy,0.7,0,Math.PI*2); c.fill();
    }
    const cx2=w*0.5, cy2=h*0.5;
    // الشمس — كبيرة وواقعية بدون إيموجي
    const sunR = Math.min(w,h)*0.13;
    // هالة خارجية
    const sg2=c.createRadialGradient(cx2,cy2,0,cx2,cy2,sunR*2.2);
    sg2.addColorStop(0,'rgba(255,240,100,0.35)');
    sg2.addColorStop(0.5,'rgba(255,180,0,0.12)');
    sg2.addColorStop(1,'rgba(255,140,0,0)');
    c.fillStyle=sg2; c.beginPath(); c.arc(cx2,cy2,sunR*2.2,0,Math.PI*2); c.fill();
    // الجسم الرئيسي
    const sg=c.createRadialGradient(cx2-sunR*0.25,cy2-sunR*0.25,0,cx2,cy2,sunR);
    sg.addColorStop(0,'#FFFDE0');
    sg.addColorStop(0.3,'#FFE840');
    sg.addColorStop(0.75,'#FFC200');
    sg.addColorStop(1,'#FF8C00');
    c.fillStyle=sg; c.beginPath(); c.arc(cx2,cy2,sunR,0,Math.PI*2); c.fill();
    // شعاع ضوء خارج
    for(let ri=0;ri<12;ri++){
      const ra=ri*(Math.PI/6)+S.t*0.3;
      const r1=sunR*1.08, r2=sunR*1.22+Math.sin(S.t*2+ri)*sunR*0.04;
      c.strokeStyle=`rgba(255,220,60,${0.3+0.2*Math.sin(S.t+ri)})`;
      c.lineWidth=sunR*0.06;
      c.beginPath();
      c.moveTo(cx2+Math.cos(ra)*r1, cy2+Math.sin(ra)*r1);
      c.lineTo(cx2+Math.cos(ra)*r2, cy2+Math.sin(ra)*r2);
      c.stroke();
    }
    // مدار الأرض
    const orR=Math.min(w,h)*0.38;
    c.strokeStyle='rgba(255,255,255,0.12)'; c.lineWidth=1; c.setLineDash([3,4]);
    c.beginPath(); c.ellipse(cx2,cy2,orR,orR*0.55,0,0,Math.PI*2); c.stroke(); c.setLineDash([]);
    // موضع الأرض
    const ex=cx2+orR*Math.cos(S.t), ey=cy2+orR*0.55*Math.sin(S.t);
    const earthR = Math.min(w,h)*0.038;
    // محور الميل
    const tiltAngle=23.5*Math.PI/180;
    const axLen=earthR*1.7;
    c.strokeStyle='rgba(255,255,255,0.6)'; c.lineWidth=1.5;
    c.beginPath();
    c.moveTo(ex-Math.sin(tiltAngle)*axLen, ey-Math.cos(tiltAngle)*axLen);
    c.lineTo(ex+Math.sin(tiltAngle)*axLen, ey+Math.cos(tiltAngle)*axLen);
    c.stroke();
    // الأرض — كوكب واقعي
    const earthGrad=c.createRadialGradient(ex-earthR*0.3,ey-earthR*0.3,0,ex,ey,earthR);
    earthGrad.addColorStop(0,'#4AADE0');
    earthGrad.addColorStop(0.5,'#1a6fa8');
    earthGrad.addColorStop(1,'#0d3a5c');
    c.fillStyle=earthGrad; c.beginPath(); c.arc(ex,ey,earthR,0,Math.PI*2); c.fill();
    // قارات
    c.fillStyle='#27ae60';
    c.beginPath(); c.ellipse(ex+earthR*0.15,ey-earthR*0.25,earthR*0.32,earthR*0.22,0.4,0,Math.PI*2); c.fill();
    c.beginPath(); c.ellipse(ex-earthR*0.3,ey+earthR*0.1,earthR*0.24,earthR*0.32,-0.3,0,Math.PI*2); c.fill();
    // غلاف جوي خفيف
    c.strokeStyle='rgba(100,180,255,0.25)'; c.lineWidth=earthR*0.18;
    c.beginPath(); c.arc(ex,ey,earthR+earthR*0.09,0,Math.PI*2); c.stroke();
    // Season label — بدون إيموجي، نص واضح فقط
    const seasonAngle=((S.t%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
    let season=''; let sColor='#fff';
    if(seasonAngle<Math.PI*0.5){season='الربيع';sColor='#90EE90';}
    else if(seasonAngle<Math.PI){season='الصيف';sColor='#FFD700';}
    else if(seasonAngle<Math.PI*1.5){season='الخريف';sColor='#FFA500';}
    else{season='الشتاء';sColor='#ADD8E6';}
    // اسم الفصل فوق الأرض مباشرة
    c.fillStyle=sColor; c.font=`bold ${Math.max(14,w*0.032)}px Tajawal`; c.textAlign='center';
    c.fillText(season, ex, ey-32);
    // صندوق المعلومات — ثلاثة أسطر منفصلة بوضوح
    const boxW=w*0.46, boxH=h*0.16, boxX=w*0.02, boxY=h*0.02;
    c.fillStyle='rgba(0,0,0,0.55)'; c.strokeStyle='rgba(255,255,255,0.18)'; c.lineWidth=1;
    c.beginPath(); c.roundRect(boxX, boxY, boxW, boxH, 8); c.fill(); c.stroke();
    // السطر الأول: الفصل الحالي
    c.fillStyle=sColor; c.font=`bold ${Math.max(12,w*0.026)}px Tajawal`; c.textAlign='right';
    c.fillText(`الفصل الحالي: ${season}`, boxX+boxW-10, boxY + boxH*0.30);
    // السطر الثاني
    c.fillStyle='rgba(255,255,255,0.75)'; c.font=`${Math.max(10,w*0.020)}px Tajawal`;
    c.fillText('ميل محور الأرض يُسبّب تغيّر الفصول', boxX+boxW-10, boxY + boxH*0.60);
    // السطر الثالث
    c.fillStyle='rgba(200,200,200,0.55)'; c.font=`${Math.max(9,w*0.017)}px Tajawal`;
    c.fillText('انقر للإيقاف / الاستمرار', boxX+boxW-10, boxY + boxH*0.88);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG5StarMap() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">🗺️ خريطة السماء الليلية</div>
  <div class="ctrl-desc">
    انقر على أي نجم لمعرفة اسمه ومعلوماته، وحاول تعرّف الكوكبات
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">⭐ أبرز النجوم</div>
  <div class="ctrl-desc">
    ⭐ <b>الشمس:</b> أقرب نجم لنا<br>
    🌟 <b>سهيل:</b> ثاني ألمع نجم في السماء<br>
    🧭 <b>النجم القطبي:</b> يشير دائماً للشمال<br>
    💫 <b>المجرّة:</b> مجرتنا درب التبّانة
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٦ · د٧):</strong><br>
  لماذا لا نرى النجوم في النهار رغم أنها موجودة دائماً؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">لأن ضوء الشمس القوي يُضيء الغلاف الجوي ويجعله مضيئاً جداً — فيطغى على ضوء النجوم الباهتة. ليلاً تغيب الشمس فنرى النجوم بوضوح.</div>
</div>`;
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const w=cv.width, h=cv.height;
  const S=simState;
  if(!S.smInit){
    S.smInit=true;S.t=0;S.hovered=-1;
    const stars=[
      {x:0.5,y:0.2,name:'النجم القطبي',mag:2.1,color:'#FFE8D0',constellation:'الدب الأصغر'},
      {x:0.25,y:0.3,name:'الشعرى اليمانية',mag:1.5,color:'#CCE0FF',constellation:'الكلب الأكبر'},
      {x:0.75,y:0.35,name:'نجم الجدي',mag:3.6,color:'#FFE0C0',constellation:'الجدي'},
      {x:0.4,y:0.55,name:'منكب الجوزاء',mag:0.5,color:'#FFB060',constellation:'الجبار'},
      {x:0.6,y:0.58,name:'رجل الجبار',mag:0.1,color:'#B8D8FF',constellation:'الجبار'},
      {x:0.2,y:0.65,name:'الذيل',mag:1.2,color:'#FFF0D0',constellation:'العقرب'},
      {x:0.8,y:0.25,name:'الدبران',mag:0.9,color:'#FF8844',constellation:'الثور'},
      {x:0.55,y:0.42,name:'القلب',mag:1.0,color:'#FF4444',constellation:'العقرب'},
    ];
    S.stars=stars;
    cv.onmousemove=function(e){
      const rect=cv.getBoundingClientRect();
      const mx=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX-rect.left)/cv.offsetWidth, my=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientY-rect.top)/cv.offsetHeight;
      S.hovered=-1;
      stars.forEach((st,i)=>{ if(Math.hypot(mx-st.x,my-st.y)<0.05) S.hovered=i; });
    };
    cv.ontouchmove=function(e){e.preventDefault();
      const rect=cv.getBoundingClientRect(),t=e.touches[0];
      const mx=(t.clientX-rect.left)/cv.offsetWidth, my=(t.clientY-rect.top)/cv.offsetHeight;
      S.hovered=-1;
      stars.forEach((st,i)=>{ if(Math.hypot(mx-st.x,my-st.y)<0.07) S.hovered=i; });
    };
  }
  function draw(){
    if(currentSim!=='g5stars') return;
    S.t+=0.005;
    // Night sky
    const bgGrd=c.createRadialGradient(w/2,h/2,0,w/2,h/2,Math.max(w,h));
    bgGrd.addColorStop(0,'#0a0a1a'); bgGrd.addColorStop(1,'#000005');
    c.fillStyle=bgGrd; c.fillRect(0,0,w,h);
    // Milky way suggestion
    c.save(); c.globalAlpha=0.15;
    const mwGrd=c.createLinearGradient(0,h*0.3,w,h*0.7);
    mwGrd.addColorStop(0,'rgba(200,200,255,0)'); mwGrd.addColorStop(0.5,'rgba(200,200,255,0.4)'); mwGrd.addColorStop(1,'rgba(200,200,255,0)');
    c.fillStyle=mwGrd; c.save(); c.rotate(-0.3);
    c.fillRect(-w*0.5,h*0.2,w*2,h*0.3); c.restore(); c.restore();
    // Background stars
    for(let i=0;i<200;i++){
      const sx=((i*137+23)%100)/100*w, sy=((i*89+7)%100)/100*h;
      const tw=(1+Math.sin(S.t*1.5+i))*0.5;
      c.fillStyle=`rgba(255,255,255,${tw*0.5})`;
      c.beginPath(); c.arc(sx,sy,Math.random()*0.8+0.2,0,Math.PI*2); c.fill();
    }
    // Named stars
    S.stars.forEach((st,i)=>{
      const sx=st.x*w, sy=st.y*h;
      const size=Math.max(3, (3-st.mag*0.8)*2.5);
      const tw=0.7+0.3*Math.sin(S.t*2+i);
      // Glow
      const g=c.createRadialGradient(sx,sy,0,sx,sy,size*4);
      g.addColorStop(0,st.color+'AA'); g.addColorStop(1,st.color+'00');
      c.fillStyle=g; c.beginPath(); c.arc(sx,sy,size*4,0,Math.PI*2); c.fill();
      // Star
      c.fillStyle=st.color;
      c.beginPath(); c.arc(sx,sy,size*tw,0,Math.PI*2); c.fill();
      // Hover info
      if(i===S.hovered){
        c.strokeStyle='rgba(255,255,255,0.4)'; c.lineWidth=1;
        c.beginPath(); c.arc(sx,sy,size*8,0,Math.PI*2); c.stroke();
        const bW=w*0.35, bH=h*0.12;
        const bx=Math.min(sx+10, w-bW-10), by=Math.max(sy-bH-10, 10);
        c.fillStyle='rgba(0,0,20,0.85)'; c.strokeStyle='rgba(255,255,255,0.25)'; c.lineWidth=1;
        c.beginPath(); c.roundRect(bx,by,bW,bH,6); c.fill(); c.stroke();
        c.fillStyle=st.color; c.font=`bold ${Math.max(11,w*0.024)}px Tajawal`; c.textAlign='right';
        c.fillText(st.name, bx+bW-8, by+22);
        c.fillStyle='rgba(255,255,255,0.75)'; c.font=`${Math.max(9,w*0.019)}px Tajawal`;
        c.fillText(`الكوكبة: ${st.constellation}`, bx+bW-8, by+42);
        c.fillText(`القدر: ${st.mag}`, bx+bW-8, by+60);
      } else {
        c.fillStyle='rgba(255,255,255,0.6)'; c.font=`${Math.max(8,w*0.016)}px Tajawal`; c.textAlign='center';
        c.fillText(st.name, sx, sy+size+14);
      }
    });
    c.fillStyle='rgba(255,255,255,0.8)'; c.font=`bold ${Math.max(11,w*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText('خريطة النجوم العربية — مرّر الماوس فوق نجم لمعرفة تفاصيله', w/2, h*0.95);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG5StarNames() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">✨ أسماء النجوم</div>
  <div class="ctrl-desc">
    انقر على كل نجم لاكتشاف اسمه العربي الأصيل وموقعه في السماء
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">🌍 النجوم في التراث العُماني</div>
  <div class="ctrl-desc">
    كان البحّارة العُمانيون يستخدمون النجوم للملاحة في المحيط الهندي منذ آلاف السنين — "علم الأنواء" تراث عُماني أصيل
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٦ · د٧-ب):</strong><br>
  كيف يستخدم البحّارة النجم القطبي في الملاحة؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">النجم القطبي (الجدي) يبقى ثابتاً دائماً فوق القطب الشمالي — البحّار يحدّد الشمال بالنظر إليه، ثم يعرف باقي الاتجاهات. ارتفاعه فوق الأفق يُخبره بخط عرضه الجغرافي أيضاً.</div>
</div>`;
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const w=cv.width, h=cv.height;
  const S=simState;
  if(!S.snInit){S.snInit=true;S.t=0;S.currentConst=0;S.timer=0;}
  const constellations=[
    {name:'الجبار (أوريون)',color:'#4DC4E0',stars:[{x:0.45,y:0.3},{x:0.55,y:0.28},{x:0.5,y:0.45},{x:0.42,y:0.55},{x:0.58,y:0.53},{x:0.5,y:0.65}],lines:[[0,1],[0,2],[1,2],[2,3],[2,4],[3,5],[4,5]],fact:'أوريون الجبار يُرى في معظم أنحاء العالم'},
    {name:'الدب الأكبر',color:'#FFD700',stars:[{x:0.2,y:0.2},{x:0.3,y:0.18},{x:0.4,y:0.22},{x:0.5,y:0.26},{x:0.55,y:0.38},{x:0.5,y:0.48},{x:0.4,y:0.45}],lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],fact:'مقبض المغرفة يشير نحو النجم القطبي'},
    {name:'العقرب',color:'#FF6644',stars:[{x:0.3,y:0.3},{x:0.4,y:0.35},{x:0.5,y:0.32},{x:0.55,y:0.42},{x:0.5,y:0.52},{x:0.42,y:0.6},{x:0.48,y:0.7},{x:0.56,y:0.72}],lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]],fact:'قلب العقرب نجم أحمر عملاق'},
  ];
  function draw(){
    if(currentSim!=='g5stars') return;
    S.t+=0.008; S.timer++;
    if(S.timer>200){S.timer=0;S.currentConst=(S.currentConst+1)%constellations.length;}
    c.fillStyle='#000010'; c.fillRect(0,0,w,h);
    for(let i=0;i<150;i++){
      const sx=((i*173)%100)/100*w, sy=((i*97)%100)/100*h;
      c.fillStyle=`rgba(255,255,255,${0.1+0.3*Math.sin(S.t*2+i)})`;
      c.beginPath(); c.arc(sx,sy,0.7,0,Math.PI*2); c.fill();
    }
    const con=constellations[S.currentConst];
    // Draw lines
    c.strokeStyle=con.color+'55'; c.lineWidth=1.5; c.setLineDash([3,3]);
    con.lines.forEach(([a,b])=>{
      const sa=con.stars[a], sb=con.stars[b];
      c.beginPath(); c.moveTo(sa.x*w,sa.y*h); c.lineTo(sb.x*w,sb.y*h); c.stroke();
    });
    c.setLineDash([]);
    // Draw stars
    con.stars.forEach(st=>{
      const g=c.createRadialGradient(st.x*w,st.y*h,0,st.x*w,st.y*h,15);
      g.addColorStop(0,con.color+'CC'); g.addColorStop(1,con.color+'00');
      c.fillStyle=g; c.beginPath(); c.arc(st.x*w,st.y*h,15,0,Math.PI*2); c.fill();
      c.fillStyle=con.color; c.beginPath(); c.arc(st.x*w,st.y*h,4,0,Math.PI*2); c.fill();
    });
    // Name
    c.fillStyle=con.color; c.font=`bold ${Math.max(14,w*0.032)}px Tajawal`; c.textAlign='center';
    c.fillText(con.name, w/2, h*0.12);
    c.fillStyle='rgba(255,255,255,0.7)'; c.font=`${Math.max(10,w*0.021)}px Tajawal`;
    c.fillText(con.fact, w/2, h*0.88);
    // Progress
    const prog=S.timer/200;
    c.fillStyle='rgba(255,255,255,0.15)'; c.fillRect(w*0.1,h*0.93,w*0.8,4);
    c.fillStyle=con.color; c.fillRect(w*0.1,h*0.93,w*0.8*prog,4);
    c.fillStyle='rgba(255,255,255,0.5)'; c.font=`${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='center';
    c.fillText(`${S.currentConst+1} / ${constellations.length} كوكبات`, w/2, h*0.97);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ═══ Stub functions for simG5BehindYou extra tabs ═══
// (already defined above as simG5BehindYou)

// ═══════════════════════════════════════════════════════
// الصف التاسع — الوحدة ٦: الأحماض والقواعد
// ═══════════════════════════════════════════════════════

// ── 6-1 Tab1: تصنيف المحاليل ──

// ══════════════════════════════════════════════════════════════════
// الصف التاسع — وحدة 6: خصائص الأحماض والقواعد
// نسخة مُحسَّنة: تفاعل كامل، رسوم متحركة، جودة الصف السابع
// ══════════════════════════════════════════════════════════════════

// ── 6-1 Tab1: تصنيف المحاليل (تفاعلي - انقر لتصنيف) ──
function simG9AcidProp1() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, selected:null, hover:null, classified:{} };
  const S = simState;

  const solutions = [
    { id:'lemon',  name:'عصير الليمون', icon:'🍋', ph:2.5, type:'acid',    x:0.12, y:0.38, desc:'حمض الستريك — حامض الطعم، آمن' },
    { id:'vinegar',name:'الخل',          icon:'🫙', ph:3.0, type:'acid',    x:0.30, y:0.38, desc:'حمض الإيثانويك — يُستخدم في الطبخ' },
    { id:'coffee', name:'القهوة',        icon:'☕', ph:5.0, type:'acid',    x:0.48, y:0.38, desc:'حمضي خفيف — آمن للشرب' },
    { id:'water',  name:'الماء النقي',   icon:'💧', ph:7.0, type:'neutral', x:0.66, y:0.38, desc:'pH=7 تماماً — المرجع المتعادل' },
    { id:'soap',   name:'ماء الصابون',   icon:'🧼', ph:9.0, type:'base',    x:0.12, y:0.72, desc:'قلوي خفيف — زلق الملمس' },
    { id:'ammonia',name:'محلول الأمونيا',icon:'🧪', ph:11.5,type:'base',    x:0.30, y:0.72, desc:'قلوي — رائحة نفّاذة' },
    { id:'lime',   name:'ماء الجير',     icon:'⬜', ph:12.4,type:'base',    x:0.48, y:0.72, desc:'Ca(OH)₂ — قلوي قوي' },
    { id:'hcl',    name:'حمض الهيدروكلوريك',icon:'⚠️',ph:1.0,type:'acid', x:0.66, y:0.72, desc:'حمض قوي جداً — خطر ⚠️' },
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📋 التصنيف</div>
      <div class="info-box" style="margin-bottom:6px">
        <b style="color:#C0392B">🍋 حمضي (pH &lt; 7)</b><br>
        <span id="acid-list" style="font-size:12px">—</span>
      </div>
      <div class="info-box" style="background:rgba(39,174,96,0.06);border-color:rgba(39,174,96,0.2);margin-bottom:6px">
        <b style="color:#27AE60">💧 متعادل (pH = 7)</b><br>
        <span id="neutral-list" style="font-size:12px">—</span>
      </div>
      <div class="info-box" style="background:rgba(21,101,192,0.06);border-color:rgba(21,101,192,0.2)">
        <b style="color:#1565C0">🧼 قلوي (pH &gt; 7)</b><br>
        <span id="base-list" style="font-size:12px">—</span>
      </div>
    </div>
    <div id="sol-detail" class="info-box" style="min-height:54px;text-align:center">
      انقر على أي محلول لمعرفة خصائصه 👆
    </div>
    <div class="q-box">
      <strong>❓ ما الفرق بين الحمض القوي والضعيف؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الحمض القوي يتأيّن بالكامل في الماء (مثل HCl pH=1). الضعيف يتأيّن جزئياً (مثل الخل pH=3). كلما قلّ pH ازداد الحمض قوةً وخطورة.</div>
    </div>`);

  const cv = document.getElementById('simCanvas');
  function getColor(type){ return type==='acid'?'#E74C3C':type==='base'?'#2980B9':'#27AE60'; }
  function getBg(type){ return type==='acid'?'rgba(231,76,60,0.12)':type==='base'?'rgba(41,128,185,0.12)':'rgba(39,174,96,0.12)'; }

  function updateLists(){
    const acids = solutions.filter(s=>s.type==='acid').map(s=>s.name).join('، ');
    const neutrals = solutions.filter(s=>s.type==='neutral').map(s=>s.name).join('، ');
    const bases = solutions.filter(s=>s.type==='base').map(s=>s.name).join('، ');
    const el = id => document.getElementById(id);
    if(el('acid-list')) el('acid-list').textContent = acids||'—';
    if(el('neutral-list')) el('neutral-list').textContent = neutrals||'—';
    if(el('base-list')) el('base-list').textContent = bases||'—';
  }
  updateLists();

  cv.onclick = function(e){
    const r=cv.getBoundingClientRect();
    const mx=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX-r.left)*(cv.width/r.width), my=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientY-r.top)*(cv.height/r.height);
    solutions.forEach(sol=>{
      if(Math.hypot(mx-sol.x*cv.width, my-sol.y*cv.height)<40){
        S.selected = S.selected===sol.id ? null : sol.id;
        try{U9Sound.ping();}catch(e){}
        const box=document.getElementById('sol-detail');
        if(box && S.selected){
          box.innerHTML=`<strong style="font-size:16px">${sol.icon} ${sol.name}</strong><br>
            <span style="color:${getColor(sol.type)};font-weight:700">pH = ${sol.ph}</span><br>
            <span style="font-size:13px;color:#555">${sol.desc}</span>`;
          box.style.borderColor=getColor(sol.type);
          box.style.borderRight=`4px solid ${getColor(sol.type)}`;
        }
        S.classified[sol.id]=true;
        updateLists();
      }
    });
  };
  cv.onmousemove = function(e){
    const r=cv.getBoundingClientRect();
    const mx=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX-r.left)*(cv.width/r.width), my=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientY-r.top)*(cv.height/r.height);
    S.hover=null;
    solutions.forEach(sol=>{ if(Math.hypot(mx-sol.x*cv.width, my-sol.y*cv.height)<44) S.hover=sol.id; });
    cv.style.cursor=S.hover?'pointer':'default';
  };

  function draw(){
    if(currentSim!=='g9acidprop'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t+=0.02;

    // Background gradient
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F8F5EF'); bg.addColorStop(1,'#EDE8E0');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // pH bar
    const bx=w*0.06, by=h*0.06, bw=w*0.88, bh=16;
    const grad=c.createLinearGradient(bx,0,bx+bw,0);
    grad.addColorStop(0,'#E74C3C'); grad.addColorStop(0.35,'#F39C12');
    grad.addColorStop(0.5,'#27AE60'); grad.addColorStop(0.65,'#2980B9'); grad.addColorStop(1,'#1A237E');
    c.fillStyle=grad; c.beginPath(); c.roundRect(bx,by,bw,bh,8); c.fill();
    c.fillStyle='rgba(0,0,0,0.08)'; c.beginPath(); c.roundRect(bx,by,bw,bh/2,8); c.fill();
    [0,7,14].forEach(n=>{
      const px=bx+(n/14)*bw;
      c.fillStyle='rgba(255,255,255,0.8)'; c.fillRect(px-0.5,by,1,bh);
      c.fillStyle='#333'; c.font=`bold ${Math.max(9,w*0.019)}px Tajawal`; c.textAlign='center';
      c.fillText(n, px, by+bh+12);
    });
    c.fillStyle='#C0392B'; c.font=`${Math.max(10,w*0.021)}px Tajawal`; c.textAlign='center';
    c.fillText('◀ حمضي', bx+bw*0.15, by-5);
    c.fillStyle='#27AE60'; c.fillText('متعادل', bx+bw*0.5, by-5);
    c.fillStyle='#1565C0'; c.fillText('قلوي ▶', bx+bw*0.85, by-5);

    // Sections labels
    ['حمضي 🍋','قلوي 🧼'].forEach((lbl,i)=>{
      const sx=w*(i===0?0.06:0.51), sy=h*0.27, sw=w*(i===0?0.44:0.44), sh=h*0.54;
      c.fillStyle=i===0?'rgba(231,76,60,0.04)':'rgba(41,128,185,0.04)';
      c.beginPath(); c.roundRect(sx,sy,sw,sh,12); c.fill();
      c.strokeStyle=i===0?'rgba(231,76,60,0.15)':'rgba(41,128,185,0.15)';
      c.lineWidth=1.5; c.beginPath(); c.roundRect(sx,sy,sw,sh,12); c.stroke();
    });
    // neutral zone
    c.fillStyle='rgba(39,174,96,0.04)';
    c.beginPath(); c.roundRect(w*0.59,h*0.27,w*0.1,h*0.54,12); c.fill();

    // Draw each solution as a floating bottle/beaker
    solutions.forEach((sol,idx)=>{
      const ax=sol.x*w, ay=sol.y*h;
      const isSel=S.selected===sol.id, isHov=S.hover===sol.id;
      const bob=Math.sin(S.t*1.1+idx*0.9)*(isHov?6:3);
      const cy2=ay+bob;
      const r=isHov||isSel?44:38;

      // pH dot on scale bar
      const phX=bx+(sol.ph/14)*bw;
      c.fillStyle=getColor(sol.type);
      c.beginPath(); c.arc(phX,by+bh/2,5,0,Math.PI*2); c.fill();
      c.strokeStyle='#fff'; c.lineWidth=1.5; c.stroke();

      // Connecting line from dot to icon
      c.strokeStyle=getColor(sol.type)+'55'; c.lineWidth=1;
      c.setLineDash([4,4]);
      c.beginPath(); c.moveTo(phX,by+bh); c.lineTo(ax,cy2-r-4); c.stroke();
      c.setLineDash([]);

      // Glow for selected/hover
      if(isSel||isHov){
        c.shadowBlur=20; c.shadowColor=getColor(sol.type);
      }

      // Beaker body
      c.fillStyle=getBg(sol.type);
      c.beginPath(); c.ellipse(ax,cy2,r,r*0.85,0,0,Math.PI*2); c.fill();
      c.strokeStyle=isSel?getColor(sol.type):'rgba(0,0,0,0.12)';
      c.lineWidth=isSel?2.5:1.5; c.beginPath(); c.ellipse(ax,cy2,r,r*0.85,0,0,Math.PI*2); c.stroke();
      c.shadowBlur=0;

      // Liquid wave inside
      c.save();
      c.beginPath(); c.ellipse(ax,cy2,r-2,r*0.83,0,0,Math.PI*2); c.clip();
      c.fillStyle=getColor(sol.type)+'33';
      c.beginPath();
      c.moveTo(ax-r, cy2+r*0.2);
      for(let xi=0;xi<=r*2;xi++){
        const wave=Math.sin((xi/r)*Math.PI*2+S.t*2)*4;
        c.lineTo(ax-r+xi, cy2+wave);
      }
      c.lineTo(ax+r,cy2+r*0.85); c.lineTo(ax-r,cy2+r*0.85); c.closePath(); c.fill();
      c.restore();

      // Icon
      c.font=`${r*0.85}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(sol.icon,ax,cy2);

      // pH badge
      const phtxt=`pH ${sol.ph}`;
      c.font=`bold ${Math.max(9,w*0.019)}px Tajawal`;
      const bwt=c.measureText(phtxt).width+12;
      c.fillStyle=getColor(sol.type)+'CC';
      c.beginPath(); c.roundRect(ax-bwt/2,cy2-r-18,bwt,16,6); c.fill();
      c.fillStyle='#fff'; c.textBaseline='middle';
      c.fillText(phtxt, ax, cy2-r-10);

      // Name
      c.fillStyle=isSel?getColor(sol.type):'#444';
      c.font=`bold ${Math.max(9,w*0.019)}px Tajawal`; c.textBaseline='top';
      c.fillText(sol.name, ax, cy2+r*0.85+6);
    });

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 6-1 Tab2: الأحماض العضوية ──
function simG9AcidProp2() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, sel:0, hover:-1 };
  const S = simState;

  const acids = [
    { name:'حمض الإيثانويك (الخل)', formula:'CH₃COOH', source:'الخل المنزلي', ph:3.0, icon:'🫙', color:'#F4A460', strength:'ضعيف' },
    { name:'حمض الستريك', formula:'C₆H₈O₇', source:'الليمون والبرتقال', ph:2.2, icon:'🍋', color:'#FFD700', strength:'ضعيف' },
    { name:'حمض اللاكتيك', formula:'CH₃CH(OH)COOH', source:'الحليب واللبن', ph:3.5, icon:'🥛', color:'#F0F0F0', strength:'ضعيف' },
    { name:'حمض الكربونيك', formula:'H₂CO₃', source:'المشروبات الغازية', ph:3.9, icon:'🥤', color:'#87CEEB', strength:'ضعيف' },
    { name:'حمض الهيدروكلوريك', formula:'HCl', source:'حمض قوي / المعدة', ph:1.0, icon:'⚠️', color:'#FF6B6B', strength:'قوي' },
    { name:'حمض الكبريتيك', formula:'H₂SO₄', source:'بطاريات السيارات', ph:0.5, icon:'🔋', color:'#FF4444', strength:'قوي' },
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🍋 اختر الحمض</div>
      <div class="ctrl-btns-grid-1" id="acid-btns">
        ${acids.map((a,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="acid-btn-${i}" onclick="simState.sel=${i};document.querySelectorAll('[id^=acid-btn-]').forEach((b,j)=>b.classList.toggle('active',j===${i}))">${a.icon} ${a.name}</button>`).join('')}
      </div>
    </div>
    <div class="q-box">
      <strong>❓ ما الفرق بين الأحماض العضوية وغير العضوية؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الأحماض العضوية تحتوي على الكربون (مثل CH₃COOH) وعادة ضعيفة وموجودة في الطعام. غير العضوية كـ HCl وH₂SO₄ عادة أقوى وأكثر خطورة.</div>
    </div>`);

  const cv=document.getElementById('simCanvas');

  function draw(){
    if(currentSim!=='g9acidprop'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const acid=acids[S.sel||0];

    // Background
    const bg=c.createLinearGradient(0,0,w,h);
    bg.addColorStop(0,'#FFF8EE'); bg.addColorStop(1,'#FFF0DD');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Animated bubbles
    for(let i=0;i<10;i++){
      const bx=(i/10)*w+(Math.sin(S.t*0.015+i)*20);
      const by=h-((S.t*0.7+i*70)%h);
      const br=4+i%4;
      c.fillStyle=acid.color+'22';
      c.beginPath(); c.arc(bx,by,br,0,Math.PI*2); c.fill();
    }

    // Big flask
    const fx=w*0.32, fy=h*0.32, fr=Math.min(w,h)*0.22;
    // Flask glow
    c.shadowBlur=30; c.shadowColor=acid.color+'88';
    const radGrad=c.createRadialGradient(fx-fr*0.3,fy-fr*0.3,fr*0.1,fx,fy,fr);
    radGrad.addColorStop(0,acid.color+'AA'); radGrad.addColorStop(1,acid.color+'44');
    c.fillStyle=radGrad; c.beginPath(); c.arc(fx,fy,fr,0,Math.PI*2); c.fill();
    c.shadowBlur=0;
    c.strokeStyle=acid.color+'CC'; c.lineWidth=3;
    c.beginPath(); c.arc(fx,fy,fr,0,Math.PI*2); c.stroke();

    // Liquid fill animated
    const fillR=fr*(0.55+0.08*Math.sin(S.t*0.04));
    c.save(); c.beginPath(); c.arc(fx,fy,fr-2,0,Math.PI*2); c.clip();
    c.fillStyle=acid.color+'55';
    const waveY=fy+fr-fillR;
    c.beginPath(); c.moveTo(fx-fr,waveY);
    for(let xi=0;xi<=fr*2;xi++){
      c.lineTo(fx-fr+xi, waveY+Math.sin((xi/fr)*Math.PI*2+S.t*0.06)*6);
    }
    c.lineTo(fx+fr,fy+fr); c.lineTo(fx-fr,fy+fr); c.closePath(); c.fill();
    c.restore();

    // Icon in flask
    c.font=`${Math.max(32,fr*0.85)}px serif`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(acid.icon, fx, fy+fr*0.05);

    // Info panel
    const ix=w*0.60, iy=h*0.08, iw=w*0.37, ih=h*0.84;
    c.fillStyle='rgba(255,255,255,0.93)';
    c.beginPath(); c.roundRect(ix,iy,iw,ih,14); c.fill();
    c.strokeStyle=acid.color+'66'; c.lineWidth=2;
    c.beginPath(); c.roundRect(ix,iy,iw,ih,14); c.stroke();

    const tx=ix+iw-12, lineH=h*0.065;
    c.textAlign='right'; c.textBaseline='top';

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(12,w*0.026)}px Tajawal`;
    c.fillText(acid.name, tx, iy+14);

    const rows=[
      ['الصيغة الكيميائية:', acid.formula, '#1A8FA8'],
      ['المصدر:', acid.source, '#555'],
      ['القوة:', acid.strength==='قوي'?'قوي ⚠️':'ضعيف ✅', acid.strength==='قوي'?'#C0392B':'#27AE60'],
    ];
    rows.forEach((row,ri)=>{
      const ry=iy+14+lineH*(ri+1)+8;
      c.fillStyle='#888'; c.font=`${Math.max(10,w*0.021)}px Tajawal`;
      c.fillText(row[0], tx, ry);
      c.fillStyle=row[2]||'#1E2D3D'; c.font=`bold ${Math.max(11,w*0.023)}px Tajawal`;
      c.fillText(row[1], tx, ry+lineH*0.45);
    });

    // pH gauge
    const gy=iy+14+lineH*4+12, gx=ix+8, gw=iw-20, gh=14;
    c.fillStyle='#F0F0F0'; c.beginPath(); c.roundRect(gx,gy,gw,gh,7); c.fill();
    const phGrad=c.createLinearGradient(gx,0,gx+gw,0);
    phGrad.addColorStop(0,'#E74C3C'); phGrad.addColorStop(0.5,'#27AE60'); phGrad.addColorStop(1,'#1565C0');
    c.fillStyle=phGrad; c.beginPath(); c.roundRect(gx,gy,gw,gh,7); c.fill();
    const pm=gx+(acid.ph/14)*gw;
    c.fillStyle='#1E2D3D'; c.beginPath(); c.arc(pm,gy+gh/2,10,0,Math.PI*2); c.fill();
    c.strokeStyle='#fff'; c.lineWidth=2; c.beginPath(); c.arc(pm,gy+gh/2,10,0,Math.PI*2); c.stroke();
    c.fillStyle='#fff'; c.font=`bold ${Math.max(8,w*0.018)}px Tajawal`; c.textAlign='center';
    c.fillText(acid.ph, pm, gy+gh/2+1);

    c.fillStyle='#C0392B'; c.font=`bold ${Math.max(14,w*0.03)}px Tajawal`; c.textAlign='right';
    c.fillText(`pH = ${acid.ph}`, tx, gy+gh+12);
    const str=acid.ph<3?'حمض قوي جداً ⚠️':acid.ph<5?'حمض متوسط القوة':'حمض ضعيف';
    c.fillStyle='#555'; c.font=`${Math.max(10,w*0.022)}px Tajawal`;
    c.fillText(str, tx, gy+gh+30);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 6-1 Tab3: القواعد والقلويات ──
function simG9AcidProp3() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, sel:0, hover:-1 };
  const S = simState;

  const bases = [
    { name:'هيدروكسيد الصوديوم', formula:'NaOH',     use:'صناعة الصابون',       ph:14,  icon:'🧴', color:'#3498DB', soluble:true },
    { name:'هيدروكسيد الكالسيوم',formula:'Ca(OH)₂',  use:'تعديل حموضة التربة', ph:12.4,icon:'⬜', color:'#95A5A6', soluble:false },
    { name:'هيدروكسيد الأمونيوم', formula:'NH₄OH',   use:'المنظفات المنزلية',   ph:11.5,icon:'🧪', color:'#9B59B6', soluble:true },
    { name:'هيدروكسيد المغنيسيوم',formula:'Mg(OH)₂', use:'علاج حموضة المعدة',  ph:10.5,icon:'💊', color:'#1ABC9C', soluble:false },
    { name:'كربونات الصوديوم',    formula:'Na₂CO₃',  use:'صناعة الزجاج',       ph:11.6,icon:'🔬', color:'#2ECC71', soluble:true },
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧴 اختر القاعدة</div>
      <div class="ctrl-btns-grid-1">
        ${bases.map((b,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="base-btn-${i}" onclick="simState.sel=${i};document.querySelectorAll('[id^=base-btn-]').forEach((btn,j)=>btn.classList.toggle('active',j===${i}))">${b.icon} ${b.name}</button>`).join('')}
      </div>
    </div>
    <div class="info-box">
      🔑 القلويات: قواعد تذوب في الماء وتُعطي أيونات <b>OH⁻</b>
    </div>
    <div class="q-box">
      <strong>❓ لماذا نستخدم Mg(OH)₂ لعلاج حموضة المعدة؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">هيدروكسيد المغنيسيوم قاعدة ضعيفة آمنة تُعادل حمض المعدة الزائد (HCl). يُعطي ارتياحاً سريعاً دون أن يضرّ بوظائف الجسم.</div>
    </div>`);

  const cv=document.getElementById('simCanvas');

  function draw(){
    if(currentSim!=='g9acidprop'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const base=bases[S.sel||0];

    // Background
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F0F8FF'); bg.addColorStop(1,'#E8F4FD');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Beaker drawing
    const bkx=w*0.18, bky=h*0.12, bkw=w*0.28, bkh=h*0.70;

    // Beaker glass
    c.fillStyle='rgba(200,220,255,0.15)';
    c.beginPath(); c.moveTo(bkx,bky); c.lineTo(bkx,bky+bkh); c.lineTo(bkx+bkw,bky+bkh); c.lineTo(bkx+bkw,bky); c.closePath(); c.fill();
    c.strokeStyle='rgba(120,150,200,0.5)'; c.lineWidth=2;
    c.beginPath(); c.moveTo(bkx,bky); c.lineTo(bkx,bky+bkh); c.lineTo(bkx+bkw,bky+bkh); c.lineTo(bkx+bkw,bky); c.stroke();
    // Rim
    c.strokeStyle='rgba(120,150,200,0.6)'; c.lineWidth=3;
    c.beginPath(); c.moveTo(bkx-4,bky); c.lineTo(bkx+bkw+4,bky); c.stroke();

    // Liquid
    const lh=bkh*0.72;
    c.fillStyle=base.color+'22';
    c.fillRect(bkx+2, bky+bkh-lh, bkw-4, lh);
    // Wave
    c.fillStyle=base.color+'44';
    c.beginPath(); c.moveTo(bkx+2,bky+bkh-lh);
    for(let xi=0;xi<=bkw-4;xi++){
      c.lineTo(bkx+2+xi, bky+bkh-lh+Math.sin((xi/bkw)*Math.PI*4+S.t*0.07)*5);
    }
    c.lineTo(bkx+bkw-2,bky+bkh); c.lineTo(bkx+2,bky+bkh); c.closePath(); c.fill();

    // OH⁻ ions floating
    for(let i=0;i<8;i++){
      const ix=bkx+14+((i*37+S.t*0.6)%(bkw-30));
      const iy=bky+bkh-10-((i*47+S.t*0.8)%(lh-20));
      c.fillStyle=base.color+'CC';
      c.beginPath(); c.arc(ix,iy,8,0,Math.PI*2); c.fill();
      c.fillStyle='#fff'; c.font=`bold ${Math.max(7,w*0.014)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('OH⁻',ix,iy);
    }
    // Icon in beaker
    c.font=`${Math.max(28,bkw*0.55)}px serif`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(base.icon, bkx+bkw/2, bky+bkh*0.32);

    // Info panel right
    const ix=w*0.52, iy=h*0.08, iw=w*0.46, ih=h*0.85;
    c.fillStyle='rgba(255,255,255,0.95)';
    c.beginPath(); c.roundRect(ix,iy,iw,ih,14); c.fill();
    c.strokeStyle=base.color+'66'; c.lineWidth=2;
    c.beginPath(); c.roundRect(ix,iy,iw,ih,14); c.stroke();

    const tx=ix+iw-12;
    c.textAlign='right'; c.textBaseline='top';
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(12,w*0.025)}px Tajawal`;
    c.fillText(base.name, tx, iy+12);

    const rows=[
      ['الصيغة:',base.formula,'#1A8FA8'],
      ['pH:',`${base.ph}`,'#C0392B'],
      ['الاستخدام:',base.use,'#555'],
      ['تذوب في الماء؟:',base.soluble?'✅ قلوية (تذوب)':'قاعدة غير ذائبة', base.soluble?'#27AE60':'#E67E22'],
    ];
    rows.forEach((row,ri)=>{
      const ry=iy+14+ri*h*0.13;
      c.fillStyle='#888'; c.font=`${Math.max(10,w*0.021)}px Tajawal`;
      c.fillText(row[0], tx, ry+h*0.04);
      c.fillStyle=row[2]; c.font=`bold ${Math.max(11,w*0.023)}px Tajawal`;
      c.fillText(row[1], tx, ry+h*0.07);
    });

    // pH bar
    const gy=iy+h*0.58, gx=ix+8, gw=iw-20, gh=14;
    const phGrad=c.createLinearGradient(gx,0,gx+gw,0);
    phGrad.addColorStop(0,'#E74C3C'); phGrad.addColorStop(0.5,'#27AE60'); phGrad.addColorStop(1,'#1565C0');
    c.fillStyle=phGrad; c.beginPath(); c.roundRect(gx,gy,gw,gh,7); c.fill();
    const pm=gx+(base.ph/14)*gw;
    c.fillStyle='#fff'; c.beginPath(); c.arc(pm,gy+gh/2,9,0,Math.PI*2); c.fill();
    c.strokeStyle=base.color; c.lineWidth=2; c.beginPath(); c.arc(pm,gy+gh/2,9,0,Math.PI*2); c.stroke();
    c.fillStyle=base.color; c.font=`bold ${Math.max(8,w*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(base.ph, pm, gy+gh/2);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 6-2 Tab1: ورق تبّاع الشمس — قابل للسحب ──
function simG9Indicator1() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, dipped:{}, paperX:0.5, paperY:0.12, dragging:false };
  const S = simState;

  const solutions = [
    { id:'hcl',    label:'حمض\nالهيدروكلوريك', ph:1,   color:'#C0392B', bgCol:'rgba(231,76,60,',   type:'acid',    emoji:'⚠️', typeLabel:'حمضي قوي' },
    { id:'lemon',  label:'عصير\nالليمون',        ph:2.5, color:'#E67E22', bgCol:'rgba(243,156,18,',  type:'acid',    emoji:'🍋', typeLabel:'حمضي' },
    { id:'coffee', label:'القهوة',               ph:5,   color:'#8B4513', bgCol:'rgba(139,69,19,',   type:'acid',    emoji:'☕', typeLabel:'حمضي خفيف' },
    { id:'water',  label:'الماء\nالنقي',          ph:7,   color:'#7D3C98', bgCol:'rgba(125,60,152,',  type:'neutral', emoji:'💧', typeLabel:'متعادل' },
    { id:'soap',   label:'ماء\nالصابون',          ph:9,   color:'#2980B9', bgCol:'rgba(41,128,185,',  type:'base',    emoji:'🧼', typeLabel:'قلوي' },
    { id:'ammonia',label:'الأمونيا',              ph:11.5,color:'#1A5276', bgCol:'rgba(26,82,118,',   type:'base',    emoji:'🧪', typeLabel:'قلوي قوي' },
  ];

  let paperColor={r:220,g:208,b:170};
  let isDipping=false, dipProgress=0, dipTarget=null, dipPhase=0, colorProgress=0, lastDipped=null, dipCount=0, dipAnim=0;

  function hexToRgb(hex){ return {r:parseInt(hex.slice(1,3),16),g:parseInt(hex.slice(3,5),16),b:parseInt(hex.slice(5,7),16)}; }
  function lerpColor(a,b,t){ return {r:Math.round(a.r+(b.r-a.r)*t),g:Math.round(a.g+(b.g-a.g)*t),b:Math.round(a.b+(b.b-a.b)*t)}; }

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📄 ورق تبّاع الشمس</div>
      <div class="info-box" style="text-align:center;line-height:1.8">
        اسحب ورقة تبّاع الشمس<br>نحو أي محلول لترى لونها!
      </div>
      <div id="dipResult" style="margin-top:8px;padding:10px;border-radius:10px;
        background:rgba(26,143,168,0.06);border:1.5px solid rgba(26,143,168,0.2);
        font-size:14px;color:#555;line-height:1.7;min-height:54px;">
        اسحب الورقة فوق أحد الكؤوس...
      </div>
      <div id="dipScore" style="margin-top:6px;font-size:13px;color:#1A8FA8;text-align:center;font-weight:700"></div>
    </div>
    <div style="padding:8px 10px;background:rgba(212,144,26,0.07);border-radius:8px;font-size:13px;color:#7A5010;line-height:1.8;margin-top:8px">
      🔴 حمض &nbsp;|&nbsp; 🟣 متعادل &nbsp;|&nbsp; 🔵 قلوي
    </div>
    <div class="q-box">
      <strong>❓ لماذا لا تُستخدم ورقة تبّاع الشمس لقياس pH الدقيق؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">ورقة تبّاع الشمس تُعطي 3 ألوان فقط (أحمر/بنفسجي/أزرق). للقياس الدقيق نستخدم الكاشف العام أو جهاز pH الرقمي.</div>
    </div>`);

  const cv=document.getElementById('simCanvas');

  function draw(){
    if(currentSim!=='g9indicator'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t+=0.02;

    // Background - lab bench
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F0F8FF'); bg.addColorStop(1,'#E8EEF8');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    c.fillStyle='rgba(180,160,130,0.18)';
    c.beginPath(); c.roundRect(0,h*0.72,w,h*0.28,0); c.fill();
    c.fillStyle='rgba(160,140,110,0.3)'; c.fillRect(0,h*0.72,w,3);

    if(dipCount===0&&!isDipping){
      c.font=`bold ${Math.max(12,w*0.026)}px Tajawal`; c.fillStyle='rgba(80,110,160,0.65)';
      c.textAlign='center'; c.textBaseline='top';
      c.fillText('↓ اسحب الورقة نحو أي كأس', w/2, h*0.04);
    }

    // Advance dip animation
    if(isDipping){
      dipProgress+=0.022;
      if(dipPhase===0&&dipProgress>0.38) dipPhase=1;
      else if(dipPhase===1){
        const blend=(dipProgress-0.38)/0.37;
        colorProgress=Math.min(1,blend*1.3);
        paperColor=lerpColor(paperColor,hexToRgb(dipTarget.color),colorProgress);
        if(dipProgress>0.75) dipPhase=2;
      } else if(dipPhase===2&&dipProgress>=1.0){
        isDipping=false; dipProgress=0; dipPhase=0;
        S.paperX=0.5; S.paperY=0.12;
      }
    }

    // Draw beakers
    const n=solutions.length;
    solutions.forEach((sol,i)=>{
      const bx=w*(0.09+i*(0.84/(n-1)));
      const by=h*0.68, bW=Math.min(w*0.13,58), bH=bW*1.25;
      const isDipped=S.dipped[sol.id];
      const isActive=isDipping&&dipTarget&&dipTarget.id===sol.id;

      // Glass
      const glassG=c.createLinearGradient(bx-bW/2,0,bx+bW/2,0);
      glassG.addColorStop(0,'rgba(220,235,255,0.6)'); glassG.addColorStop(0.3,'rgba(255,255,255,0.15)');
      glassG.addColorStop(0.7,'rgba(255,255,255,0.1)'); glassG.addColorStop(1,'rgba(200,220,255,0.5)');
      c.fillStyle=glassG; c.strokeStyle=isActive?'rgba(26,143,168,0.8)':'rgba(120,150,200,0.4)';
      c.lineWidth=isActive?2.5:1.8;
      c.beginPath();
      c.moveTo(bx-bW/2+4,by-bH); c.lineTo(bx-bW/2,by);
      c.quadraticCurveTo(bx-bW/2,by+8,bx-bW/2+8,by+8);
      c.lineTo(bx+bW/2-8,by+8); c.quadraticCurveTo(bx+bW/2,by+8,bx+bW/2,by);
      c.lineTo(bx+bW/2-4,by-bH); c.closePath(); c.fill(); c.stroke();

      // Liquid
      const liqH=bH*0.68, liqY=by-liqH+4;
      c.fillStyle=isDipped?sol.bgCol+'0.42)':isActive?sol.bgCol+'0.32)':sol.bgCol+'0.18)';
      c.beginPath();
      c.moveTo(bx-bW/2+3,liqY); c.lineTo(bx-bW/2+1,by+2);
      c.lineTo(bx+bW/2-1,by+2); c.lineTo(bx+bW/2-3,liqY); c.closePath(); c.fill();
      // Surface shimmer
      c.fillStyle='rgba(255,255,255,0.28)';
      c.beginPath(); c.ellipse(bx,liqY+2,bW/2-6,4,0,0,Math.PI*2); c.fill();
      // Ripple
      if(isActive&&dipPhase>=1){
        const rp=(dipProgress-0.38)*80, ra=Math.max(0,0.6-(dipProgress-0.38)*1.2);
        c.strokeStyle=`rgba(255,255,255,${ra})`; c.lineWidth=2;
        c.beginPath(); c.ellipse(bx,liqY+6,rp*0.4,rp*0.12,0,0,Math.PI*2); c.stroke();
      }
      // Color stain after dip
      if(isDipped){
        const sc2=hexToRgb(sol.color);
        const stripG=c.createLinearGradient(0,liqY,0,by);
        stripG.addColorStop(0,`rgba(${sc2.r},${sc2.g},${sc2.b},0)`);
        stripG.addColorStop(0.4,`rgba(${sc2.r},${sc2.g},${sc2.b},0.35)`);
        stripG.addColorStop(1,`rgba(${sc2.r},${sc2.g},${sc2.b},0.5)`);
        c.fillStyle=stripG;
        c.beginPath(); c.moveTo(bx-bW/2+3,liqY); c.lineTo(bx-bW/2+1,by+2);
        c.lineTo(bx+bW/2-1,by+2); c.lineTo(bx+bW/2-3,liqY); c.closePath(); c.fill();
      }

      // Emoji & label
      c.font=`${Math.round(bW*0.42)}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(sol.emoji, bx, by-bH*0.35);
      c.font=`bold ${Math.max(9,Math.round(w*0.018))}px Tajawal`; c.fillStyle='#334';
      c.textBaseline='top';
      sol.label.split('\n').forEach((line,li)=>c.fillText(line,bx,by+12+li*13));
      c.fillStyle='#1A8FA8'; c.font=`bold ${Math.max(9,Math.round(w*0.019))}px Tajawal`;
      c.fillText('pH '+sol.ph, bx, by+12+sol.label.split('\n').length*13);

      // Ripple ring
      if(lastDipped===sol.id&&dipAnim>0){
        const dc=hexToRgb(sol.color);
        c.strokeStyle=`rgba(${dc.r},${dc.g},${dc.b},${dipAnim})`; c.lineWidth=2.5;
        c.beginPath(); c.ellipse(bx,by-bH*0.4,(1-dipAnim)*bW*0.8,(1-dipAnim)*bW*0.25,0,0,Math.PI*2); c.stroke();
        dipAnim=Math.max(0,dipAnim-0.022);
      }
    });

    // Draw litmus paper
    let drawPX, drawPY, submergeDepth=0;
    const restY=S.paperY*h;
    if(!isDipping){ drawPX=S.paperX*w; drawPY=restY; }
    else {
      const bx2=w*(0.09+solutions.findIndex(s=>s.id===dipTarget.id)*(0.84/(n-1)));
      const by2=h*0.68, bH2=Math.min(w*0.13,58)*1.25;
      if(dipPhase===0){ const t=dipProgress/0.38; drawPX=S.paperX*w+(bx2-S.paperX*w)*t; drawPY=restY+(by2-bH2*0.7-restY)*t; }
      else if(dipPhase===1){ drawPX=bx2; drawPY=by2-bH2*0.7; submergeDepth=Math.min(44,(dipProgress-0.38)/0.37*44); }
      else { const t=(dipProgress-0.75)/0.25; drawPX=bx2+(0.5*w-bx2)*t; drawPY=(by2-bH2*0.7)+(0.12*h-(by2-bH2*0.7))*t; submergeDepth=Math.max(0,44-t*44); }
    }

    c.save();
    const pW=22, pHstrip=54, pHhandle=26;
    const fc=paperColor;
    // Shadow
    c.fillStyle='rgba(0,0,0,0.1)';
    c.beginPath(); c.ellipse(drawPX+4,drawPY+pHhandle+pHstrip+4,pW*0.5,5,0,0,Math.PI*2); c.fill();
    // Handle
    const hGrad=c.createLinearGradient(drawPX-pW/2,0,drawPX+pW/2,0);
    hGrad.addColorStop(0,'#E8D8A8'); hGrad.addColorStop(0.5,'#F4E8C0'); hGrad.addColorStop(1,'#D8C898');
    c.fillStyle=hGrad; c.strokeStyle='rgba(140,110,50,0.3)'; c.lineWidth=1;
    c.beginPath(); c.roundRect(drawPX-pW/2,drawPY,pW,pHhandle,[4,4,0,0]); c.fill(); c.stroke();
    for(let i=0;i<3;i++){ c.strokeStyle='rgba(120,90,40,0.2)'; c.lineWidth=0.8; c.beginPath(); c.moveTo(drawPX-pW/2+4,drawPY+7+i*6); c.lineTo(drawPX+pW/2-4,drawPY+7+i*6); c.stroke(); }
    // Strip
    c.save();
    const visH=Math.max(2,pHstrip-submergeDepth);
    c.beginPath(); c.rect(drawPX-pW/2,drawPY+pHhandle,pW,visH); c.clip();
    const blendT=colorProgress, beigePx=Math.round(pHstrip*(1-blendT)), colorPx=pHstrip-beigePx;
    if(beigePx>0&&beigePx<visH){ c.fillStyle='rgba(220,208,170,1)'; c.beginPath(); c.rect(drawPX-pW/2+1,drawPY+pHhandle,pW-2,Math.min(beigePx,visH)); c.fill(); }
    if(colorPx>0){
      const sy=drawPY+pHhandle+beigePx, sh=Math.min(colorPx,visH-beigePx);
      if(sh>0){
        const cg=c.createLinearGradient(0,sy,0,sy+sh);
        cg.addColorStop(0,`rgba(${fc.r},${fc.g},${fc.b},${0.5+blendT*0.3})`);
        cg.addColorStop(1,`rgba(${fc.r},${fc.g},${fc.b},1)`);
        c.fillStyle=cg; c.beginPath(); c.rect(drawPX-pW/2+1,sy,pW-2,sh); c.fill();
        if(blendT>0.05&&blendT<0.99){ c.fillStyle=`rgba(${fc.r},${fc.g},${fc.b},0.3)`; c.beginPath(); c.ellipse(drawPX,sy+2,pW/2-1,4,0,0,Math.PI*2); c.fill(); }
      }
    } else { c.fillStyle='rgba(220,208,170,1)'; c.beginPath(); c.rect(drawPX-pW/2+1,drawPY+pHhandle,pW-2,visH); c.fill(); }
    c.strokeStyle='rgba(0,0,0,0.15)'; c.lineWidth=1.2;
    c.beginPath(); c.roundRect(drawPX-pW/2,drawPY+pHhandle,pW,visH,[0,0,4,4]); c.stroke();
    c.restore();
    if(!isDipping){ c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`; c.fillStyle='rgba(60,45,20,0.85)'; c.textAlign='center'; c.textBaseline='top'; c.fillText('ورق تبّاع الشمس',drawPX,drawPY+pHhandle+pHstrip+6); }
    // Color badge
    if(colorProgress>0.45&&lastDipped&&!isDipping){
      const dp=solutions.find(s=>s.id===lastDipped);
      if(dp){ c.font='bold 13px Tajawal'; const tw=c.measureText(dp.typeLabel).width; const bwt=tw+28;
        c.fillStyle='rgba(30,45,70,0.10)'; c.strokeStyle='rgba(30,45,70,0.3)'; c.lineWidth=1.5;
        c.beginPath(); c.roundRect(drawPX-bwt/2,drawPY-48,bwt,30,10); c.fill(); c.stroke();
        c.fillStyle='rgba(30,45,70,0.85)'; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(dp.typeLabel,drawPX,drawPY-33); }
    }
    c.restore();
    animFrame=requestAnimationFrame(draw);
  }

  // Drag
  function getPos(e){ const r=cv.getBoundingClientRect(); const touch=e.touches&&e.touches[0]||e; return {x:(touch.clientX-r.left)*cv.width/r.width,y:(touch.clientY-r.top)*cv.height/r.height}; }
  function onStart(e){ if(isDipping) return; e.preventDefault&&e.preventDefault(); const pos=getPos(e); if(Math.hypot(pos.x-S.paperX*cv.width,pos.y-(S.paperY+0.05)*cv.height)<60) S.dragging=true; }
  function onMove(e){ if(!S.dragging||isDipping) return; e.preventDefault&&e.preventDefault(); const pos=getPos(e); S.paperX=Math.max(0.05,Math.min(0.95,pos.x/cv.width)); S.paperY=Math.max(0.03,Math.min(0.60,(pos.y-35)/cv.height)); }
  function onEnd(e){
    if(!S.dragging||isDipping) return; S.dragging=false;
    if(S.paperY*cv.height>cv.height*0.38){
      let closest=null,minDist=Infinity;
      solutions.forEach((sol,i)=>{ const bx=0.09+i*(0.84/(solutions.length-1)); const d=Math.abs(S.paperX-bx); if(d<minDist){minDist=d;closest=sol;} });
      if(closest&&minDist<0.13){
        isDipping=true; dipProgress=0; dipPhase=0; dipTarget=closest; lastDipped=closest.id;
        dipAnim=1; dipCount++; colorProgress=0; S.dipped[closest.id]=true;
        try{U9Sound.ping(600,0.15,0.12);}catch(e){}
        setTimeout(()=>{
          const box=document.getElementById('dipResult');
          if(box){ box.innerHTML=`<div style="display:flex;align-items:center;gap:8px;justify-content:center;margin-bottom:4px"><span style="font-size:22px">${closest.emoji}</span><strong style="font-size:15px">${closest.label.replace('\n',' ')}</strong></div><div style="color:${closest.color};font-weight:700;font-size:15px">${closest.typeLabel} — pH ${closest.ph}</div><div style="font-size:13px;color:#555;margin-top:3px">${closest.type==='acid'?'الورقة تحمرّ 🔴 — حمض':closest.type==='neutral'?'الورقة تبقى بنفسجية 🟣 — متعادل':'الورقة تزرقّ 🔵 — قلوي'}</div>`; box.style.borderRight=`4px solid ${closest.color}`; }
          const sc=document.getElementById('dipScore'); const done=Object.keys(S.dipped).length;
          if(sc) sc.textContent=`✅ ${done} من ${solutions.length} محاليل مكتملة`;
          if(done===solutions.length) setTimeout(()=>{ try{buddySay('ممتاز! 🌟 اختبرت جميع المحاليل — أحمر=حمض، بنفسجي=متعادل، أزرق=قلوي!',7000);}catch(e){} },500);
        },600); return;
      }
    }
    S.paperX=0.5; S.paperY=0.12;
  }
  cv.onmousedown=onStart; cv.onmousemove=onMove; cv.onmouseup=onEnd;
  cv.addEventListener('touchstart',onStart,{passive:false});
  cv.addEventListener('touchmove',onMove,{passive:false});
  cv.addEventListener('touchend',onEnd,{passive:false});
  draw();
}

// ── 6-2 Tab2: الكاشف العام — تفاعلي ──
function simG9Indicator2() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, ph:7 };
  const S = simState;

  function getUniversalColor(ph){
    if(ph<1) return '#FF0000'; if(ph<2) return '#FF2200'; if(ph<3) return '#FF4400';
    if(ph<4) return '#FF6600'; if(ph<5) return '#FFAA00'; if(ph<6) return '#FFDD00';
    if(ph<7) return '#88CC00'; if(ph<8) return '#00AA44'; if(ph<9) return '#00AAAA';
    if(ph<10) return '#0066FF'; if(ph<11) return '#2200FF'; if(ph<12) return '#4400CC';
    if(ph<13) return '#660099'; return '#880077';
  }
  function getColorLabel(ph){
    if(ph<2) return 'أحمر قاني'; if(ph<3) return 'أحمر'; if(ph<4) return 'أحمر برتقالي';
    if(ph<5) return 'برتقالي'; if(ph<6) return 'أصفر'; if(ph<7) return 'أخضر مصفر';
    if(ph<8) return 'أخضر'; if(ph<9) return 'أخضر مزرق'; if(ph<10) return 'أزرق';
    if(ph<11) return 'أزرق غامق'; if(ph<12) return 'بنفسجي'; return 'بنفسجي غامق';
  }

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🎨 اضبط الرقم الهيدروجيني</div>
      <input type="range" min="0" max="14" step="0.5" value="7"
        oninput="simState.ph=+this.value" style="width:100%;direction:ltr">
      <div style="text-align:center;margin-top:8px;font-size:24px;font-weight:800;color:var(--teal)" id="ph-val-display">pH = 7</div>
    </div>
    <div class="info-box" id="ui-result">
      لون الكاشف: <b>أخضر</b><br>التصنيف: متعادل
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">📊 جدول الألوان</div>
      <div style="font-size:11px;line-height:2.2;font-family:Tajawal">
        🔴 pH 0-3 &nbsp;|&nbsp; 🟠 pH 3-5<br>
        🟡 pH 5-6 &nbsp;|&nbsp; 🟢 pH 6-8<br>
        🔵 pH 8-11 &nbsp;|&nbsp; 🟣 pH 11-14
      </div>
    </div>
    <div class="q-box">
      <strong>❓ ما ميزة الكاشف العام على ورقة تبّاع الشمس؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الكاشف العام يُعطي ألواناً مختلفة لكل قيمة pH من 0-14، مما يُتيح تحديد قيمة pH التقريبية بدقة أكبر من ورقة تبّاع الشمس التي تُعطي 3 ألوان فقط.</div>
    </div>`);

  const cv=document.getElementById('simCanvas');

  function draw(){
    if(currentSim!=='g9indicator'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const ph=S.ph||7, col=getUniversalColor(ph);

    // Update UI
    const phEl=document.getElementById('ph-val-display');
    if(phEl) phEl.textContent=`pH = ${ph}`;
    const res=document.getElementById('ui-result');
    if(res){ const type=ph<7?'حمضي 🍋':ph>7?'قلوي 🧼':'متعادل 💧'; res.innerHTML=`لون الكاشف: <b>${getColorLabel(ph)}</b><br>pH = ${ph} | ${type}`; }

    // Bg
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F8F5EF'); bg.addColorStop(1,'#EDE8E0');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Big test tube / flask
    const tx=w*0.34, ty=h*0.08, tw2=w*0.32, th=h*0.72;
    // Shadow
    c.fillStyle='rgba(0,0,0,0.06)'; c.beginPath(); c.ellipse(tx+tw2/2+6,ty+th,tw2*0.4,10,0,0,Math.PI*2); c.fill();
    // Glass tube body
    c.strokeStyle='rgba(120,150,200,0.5)'; c.lineWidth=3;
    const glassG=c.createLinearGradient(tx,0,tx+tw2,0);
    glassG.addColorStop(0,'rgba(220,235,255,0.7)'); glassG.addColorStop(0.3,'rgba(255,255,255,0.2)');
    glassG.addColorStop(0.7,'rgba(255,255,255,0.1)'); glassG.addColorStop(1,'rgba(200,220,255,0.6)');
    c.fillStyle=glassG;
    c.beginPath(); c.moveTo(tx,ty); c.lineTo(tx,ty+th-tw2/2); c.quadraticCurveTo(tx,ty+th,tx+tw2/2,ty+th); c.quadraticCurveTo(tx+tw2,ty+th,tx+tw2,ty+th-tw2/2); c.lineTo(tx+tw2,ty); c.closePath(); c.fill(); c.stroke();

    // Liquid inside with wave
    const lh2=th*0.82;
    c.save();
    c.beginPath(); c.moveTo(tx+2,ty+th-lh2); c.lineTo(tx+2,ty+th-tw2/2); c.quadraticCurveTo(tx+2,ty+th-2,tx+tw2/2,ty+th-2); c.quadraticCurveTo(tx+tw2-2,ty+th-2,tx+tw2-2,ty+th-tw2/2); c.lineTo(tx+tw2-2,ty+th-lh2); c.closePath(); c.clip();
    c.fillStyle=col+'BB'; c.fillRect(tx+2,ty+th-lh2,tw2-4,lh2);
    // Wave on top
    c.fillStyle=col+'55';
    c.beginPath(); c.moveTo(tx+2,ty+th-lh2);
    for(let xi=0;xi<=tw2-4;xi++){ c.lineTo(tx+2+xi, ty+th-lh2+Math.sin((xi/(tw2))*Math.PI*3+S.t*0.08)*6); }
    c.lineTo(tx+tw2-2,ty+th-lh2-6); c.closePath(); c.fill();
    c.restore();

    // pH label in tube
    c.fillStyle='rgba(255,255,255,0.92)'; c.font=`bold ${Math.max(18,w*0.045)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(`pH = ${ph}`, tx+tw2/2, ty+th*0.42);

    // Color name
    c.fillStyle=col; c.font=`bold ${Math.max(12,w*0.027)}px Tajawal`;
    c.fillText(getColorLabel(ph), tx+tw2/2, ty+th*0.57);

    // Full spectrum bar at bottom
    const barX=w*0.05, barY=h*0.87, barW=w*0.9, barH=20;
    const grad=c.createLinearGradient(barX,0,barX+barW,0);
    ['#FF0000','#FF4400','#FF8800','#FFCC00','#88CC00','#00AA44','#00AAAA','#0066FF','#4400CC','#880077'].forEach((cl,i)=>grad.addColorStop(i/9,cl));
    c.fillStyle=grad; c.beginPath(); c.roundRect(barX,barY,barW,barH,10); c.fill();
    // Gloss
    c.fillStyle='rgba(255,255,255,0.3)'; c.beginPath(); c.roundRect(barX,barY,barW,barH/2,10); c.fill();
    // Marker
    const marker=barX+(ph/14)*barW;
    c.fillStyle='#fff'; c.beginPath(); c.arc(marker,barY+barH/2,11,0,Math.PI*2); c.fill();
    c.strokeStyle='#333'; c.lineWidth=2; c.beginPath(); c.arc(marker,barY+barH/2,11,0,Math.PI*2); c.stroke();
    c.fillStyle='#333'; c.font=`bold ${Math.max(8,w*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(ph,marker,barY+barH/2);
    [0,7,14].forEach(n=>{ c.fillStyle='#555'; c.font=`${Math.max(9,w*0.019)}px Tajawal`; c.textAlign='center'; c.textBaseline='top'; c.fillText(n,barX+(n/14)*barW,barY+barH+5); });

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 6-2 Tab3: الكاشف الطبيعي ──
function simG9Indicator3() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, selNat:0, phNat:7 };
  const S = simState;

  const naturals=[
    { name:'عصير الكرنب الأحمر', emoji:'🥬', acid:'أحمر 🔴', neutral:'بنفسجي 🟣', base:'أخضر/أصفر 💛', acC:'#FF2244', neuC:'#9933CC', basC:'#88BB00' },
    { name:'عصير التوت', emoji:'🫐', acid:'أحمر وردي 🌸', neutral:'بنفسجي 🟣', base:'أزرق 🔵', acC:'#CC2244', neuC:'#7744AA', basC:'#3355CC' },
    { name:'زهرة الهيدرانجيا', emoji:'💐', acid:'وردي/أحمر 🌸', neutral:'بنفسجي 🟣', base:'أزرق 🔵', acC:'#FF6699', neuC:'#9944BB', basC:'#4466FF' },
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌸 اختر الكاشف الطبيعي</div>
      <div class="ctrl-btns-grid-1">
        ${naturals.map((n,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="nat-btn-${i}" onclick="simState.selNat=${i};document.querySelectorAll('[id^=nat-btn-]').forEach((b,j)=>{b.classList.toggle('active',j===${i})})">${n.emoji} ${n.name}</button>`).join('')}
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">📊 قيمة pH</div>
      <input type="range" min="1" max="13" value="7" oninput="simState.phNat=+this.value" style="width:100%;direction:ltr;margin-top:6px">
      <div id="nat-ph-display" style="text-align:center;font-size:18px;font-weight:800;margin-top:6px;color:var(--teal)">pH = 7</div>
    </div>
    <div class="info-box">
      الكواشف الطبيعية مستخرجة من نباتات تحتوي على أنثوسيانين — صبغة تتأثر بدرجة الحموضة
    </div>
    <div class="q-box">
      <strong>❓ كيف تصنع كاشفاً طبيعياً من الكرنب الأحمر؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">اغلِ أوراق الكرنب الأحمر في الماء وصفّ العصير — تحصل على محلول بنفسجي يتحوّل للأحمر في الأحماض وللأخضر في القلويّات!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');

  function draw(){
    if(currentSim!=='g9indicator'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const nat=naturals[S.selNat||0];
    const ph=S.phNat||7;
    const col=ph<7?nat.acC:ph>7?nat.basC:nat.neuC;
    const label=ph<7?nat.acid:ph>7?nat.base:nat.neutral;

    const phEl=document.getElementById('nat-ph-display');
    if(phEl) phEl.textContent=`pH = ${ph}`;

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F5F0FF'); bg.addColorStop(1,'#EDE8F5');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Title
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.027)}px Tajawal`; c.textAlign='center';
    c.fillText(`${nat.emoji} ${nat.name}`, w/2, h*0.07);

    // Three flask comparison
    ['حمضي\npH < 7','متعادل\npH = 7','قلوي\npH > 7'].forEach((lbl,i)=>{
      const fx=w*(0.12+i*0.30), fy=h*0.13, fw=w*0.24, fh=h*0.52;
      const fc2=i===0?nat.acC:i===1?nat.neuC:nat.basC;
      // Flask body
      const g=c.createLinearGradient(fx,0,fx+fw,0);
      g.addColorStop(0,fc2+'44'); g.addColorStop(0.5,fc2+'88'); g.addColorStop(1,fc2+'44');
      c.fillStyle=g; c.beginPath(); c.roundRect(fx,fy,fw,fh,fw*0.35); c.fill();
      c.strokeStyle='rgba(0,0,0,0.12)'; c.lineWidth=1.5; c.beginPath(); c.roundRect(fx,fy,fw,fh,fw*0.35); c.stroke();
      // Liquid
      c.fillStyle=fc2+'AA';
      c.beginPath(); c.roundRect(fx+4,fy+fh*0.22,fw-8,fh*0.7,fw*0.3); c.fill();
      // Wave
      c.fillStyle=fc2+'55';
      c.beginPath(); c.moveTo(fx+4,fy+fh*0.22);
      for(let xi=0;xi<=fw-8;xi++){ c.lineTo(fx+4+xi,fy+fh*0.22+Math.sin((xi/(fw))*Math.PI*2+S.t*0.06+(i*2))*5); }
      c.lineTo(fx+fw-4,fy+fh*0.25); c.closePath(); c.fill();
      // Color label
      const lpart=i===0?nat.acid:i===1?nat.neutral:nat.base;
      c.fillStyle='rgba(255,255,255,0.9)'; c.font=`bold ${Math.max(9,w*0.019)}px Tajawal`; c.textAlign='center';
      c.fillText(lpart,fx+fw/2,fy+fh*0.60);
      // Bottom label
      c.fillStyle='#333'; c.font=`${Math.max(9,w*0.019)}px Tajawal`; c.textBaseline='top';
      lbl.split('\n').forEach((l,li)=>c.fillText(l,fx+fw/2,fy+fh+10+li*14));
      c.textBaseline='alphabetic';
    });

    // Current pH result box
    const type=ph<7?'حمضي 🍋':ph>7?'قلوي 🧼':'متعادل 💧';
    const rbx=w*0.05, rby=h*0.80, rbw=w*0.90, rbh=h*0.14;
    c.fillStyle='rgba(255,255,255,0.92)';
    c.beginPath(); c.roundRect(rbx,rby,rbw,rbh,12); c.fill();
    c.strokeStyle=col+'99'; c.lineWidth=2; c.beginPath(); c.roundRect(rbx,rby,rbw,rbh,12); c.stroke();
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(12,w*0.025)}px Tajawal`; c.textAlign='center';
    c.fillText(`pH = ${ph}  |  ${type}  |  اللون: ${label}`, w/2, rby+rbh*0.55);
    // Color swatch
    c.fillStyle=col; c.beginPath(); c.roundRect(rbx+8,rby+rbh*0.2,20,rbh*0.6,6); c.fill();

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 6-3 Tab1: سلّم pH — تفاعلي بالهوفر ──
function simG9PhScale1() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, hov:-1, sel:-1 };
  const S = simState;

  const items=[
    {ph:0,  name:'حمض الهيدروكلوريك المركّز',icon:'⚗️',col:'#FF0000'},
    {ph:1,  name:'العصارة المعدية',            icon:'🫀',col:'#FF2200'},
    {ph:2.5,name:'عصير الليمون',              icon:'🍋',col:'#FF5500'},
    {ph:3,  name:'الخل',                      icon:'🫙',col:'#FF7700'},
    {ph:5,  name:'القهوة',                    icon:'☕',col:'#FFAA00'},
    {ph:5.6,name:'المطر الطبيعي',             icon:'🌧️',col:'#CCBB00'},
    {ph:7,  name:'الماء النقي',               icon:'💧',col:'#27AE60'},
    {ph:7.4,name:'الدم',                      icon:'🩸',col:'#2ECC71'},
    {ph:8.5,name:'صودا الخبز',                icon:'🧁',col:'#1ABC9C'},
    {ph:9,  name:'معجون الأسنان',             icon:'🪥',col:'#3399FF'},
    {ph:11.5,name:'المنظفات المنزلية',         icon:'🧴',col:'#5533FF'},
    {ph:12.4,name:'ماء الجير',                icon:'⬜',col:'#4400EE'},
    {ph:14, name:'هيدروكسيد الصوديوم',        icon:'⚠️',col:'#3300BB'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📊 مقياس pH</div>
      <div class="info-box" style="margin-bottom:6px">
        <b>pH &lt; 7 → حمضي 🍋</b><br>
        <span style="font-size:12px">كلما قلّ pH ازداد الحمض قوة</span>
      </div>
      <div class="info-box" style="background:rgba(39,174,96,0.06);border-color:rgba(39,174,96,0.2);margin-bottom:6px">
        <b>pH = 7 → متعادل 💧</b><br>
        <span style="font-size:12px">H⁺ = OH⁻</span>
      </div>
      <div class="info-box" style="background:rgba(21,101,192,0.06);border-color:rgba(21,101,192,0.2)">
        <b>pH &gt; 7 → قلوي 🧼</b><br>
        <span style="font-size:12px">كلما زاد pH ازداد القلويّ قوة</span>
      </div>
    </div>
    <div id="scale-detail" class="info-box" style="min-height:48px;text-align:center">
      مرّر المؤشر على الأيقونات أو انقر لمعرفة التفاصيل
    </div>
    <div class="q-box">
      <strong>❓ بكم مرة أقوى حمض pH=1 من pH=3؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">مقياس pH لوغاريتمي — كل وحدة تعني 10 أضعاف. pH=1 أقوى من pH=3 بـ100 مرة! لهذا حمض الهيدروكلوريك أخطر بكثير من الخل.</div>
    </div>`);

  const cv=document.getElementById('simCanvas');

  cv.onmousemove=function(e){
    const r=cv.getBoundingClientRect(), mx=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX-r.left)*(cv.width/r.width), my=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientY-r.top)*(cv.height/r.height);
    let found=-1;
    items.forEach((it,i)=>{
      const bx=cv.width*0.08+(it.ph/14)*cv.width*0.84, by=cv.height*0.14+i*(cv.height*0.74/items.length);
      if(Math.hypot(mx-bx,my-by)<18) found=i;
    });
    if(found!==S.hov){ S.hov=found; cv.style.cursor=found>=0?'pointer':'default';
      const box=document.getElementById('scale-detail');
      if(box&&found>=0){ const it=items[found]; box.innerHTML=`<strong>${it.icon} ${it.name}</strong><br><span style="color:${it.col};font-weight:700">pH = ${it.ph}</span>`; box.style.borderColor=it.col; }
    }
  };
  cv.onclick=function(e){
    const r=cv.getBoundingClientRect(), mx=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX-r.left)*(cv.width/r.width), my=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientY-r.top)*(cv.height/r.height);
    items.forEach((it,i)=>{
      const bx=cv.width*0.08+(it.ph/14)*cv.width*0.84, by=cv.height*0.14+i*(cv.height*0.74/items.length);
      if(Math.hypot(mx-bx,my-by)<18){ S.sel=S.sel===i?-1:i; try{U9Sound.ping();}catch(e){} }
    });
  };

  function draw(){
    if(currentSim!=='g9phscale'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#F8F5EF'); bg.addColorStop(1,'#EDE8E0');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Scale bar
    const bx=w*0.08, by=h*0.06, bw=w*0.84, bh=22;
    const grad=c.createLinearGradient(bx,0,bx+bw,0);
    grad.addColorStop(0,'#FF0000'); grad.addColorStop(0.35,'#FF8800');
    grad.addColorStop(0.5,'#27AE60'); grad.addColorStop(0.65,'#2980B9'); grad.addColorStop(1,'#3300BB');
    c.fillStyle=grad; c.beginPath(); c.roundRect(bx,by,bw,bh,11); c.fill();
    c.fillStyle='rgba(255,255,255,0.25)'; c.beginPath(); c.roundRect(bx,by,bw,bh/2,11); c.fill();
    for(let i=0;i<=14;i++){
      const px=bx+(i/14)*bw;
      c.fillStyle='rgba(255,255,255,0.6)'; c.fillRect(px-0.5,by,1,bh);
      c.fillStyle='#333'; c.font=`bold ${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='center';
      c.fillText(i,px,by+bh+12);
    }
    c.fillStyle='#C0392B'; c.font=`${Math.max(10,w*0.02)}px Tajawal`; c.textAlign='left'; c.fillText('◀ حمضي',bx,by-5);
    c.fillStyle='#27AE60'; c.textAlign='center'; c.fillText('متعادل',bx+bw*0.5,by-5);
    c.fillStyle='#1565C0'; c.textAlign='right'; c.fillText('قلوي ▶',bx+bw,by-5);

    // Items
    items.forEach((it,i)=>{
      const px=bx+(it.ph/14)*bw;
      const py=by+bh+26+i*(h*0.68/items.length);
      const isHov=S.hov===i, isSel=S.sel===i;

      // Line from bar to item
      c.strokeStyle=it.col+(isHov||isSel?'99':'44'); c.lineWidth=isHov||isSel?1.5:1;
      c.setLineDash([4,4]);
      c.beginPath(); c.moveTo(px,by+bh); c.lineTo(px,py-14); c.stroke();
      c.setLineDash([]);

      // Dot on bar
      c.fillStyle=it.col; c.beginPath(); c.arc(px,by+bh/2,6,0,Math.PI*2); c.fill();
      c.strokeStyle='rgba(255,255,255,0.7)'; c.lineWidth=1.5; c.stroke();

      // Item circle
      const r=isHov||isSel?17:13;
      if(isHov||isSel){ c.shadowBlur=12; c.shadowColor=it.col; }
      c.fillStyle=isHov||isSel?it.col:'rgba(255,255,255,0.85)';
      c.beginPath(); c.arc(px,py,r,0,Math.PI*2); c.fill();
      c.strokeStyle=it.col; c.lineWidth=isHov||isSel?2.5:1.5; c.beginPath(); c.arc(px,py,r,0,Math.PI*2); c.stroke();
      c.shadowBlur=0;

      // Icon
      c.font=`${Math.max(12,r*0.85)}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillStyle=isHov||isSel?'#fff':'#333'; c.fillText(it.icon,px,py+1);

      // Tooltip for selected
      if(isSel){
        const tpW=150, tpH=42, tpX=Math.min(px+r+6, w-tpW-4), tpY=py-tpH/2;
        c.fillStyle='rgba(255,255,255,0.97)';
        c.beginPath(); c.roundRect(tpX,tpY,tpW,tpH,8); c.fill();
        c.strokeStyle=it.col+'88'; c.lineWidth=1.5; c.beginPath(); c.roundRect(tpX,tpY,tpW,tpH,8); c.stroke();
        c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(10,w*0.02)}px Tajawal`; c.textAlign='right';
        c.fillText(it.name,tpX+tpW-8,tpY+14);
        c.fillStyle=it.col; c.font=`bold ${Math.max(11,w*0.023)}px Tajawal`;
        c.fillText(`pH = ${it.ph}`,tpX+tpW-8,tpY+30);
      }
    });
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 6-3 Tab2: اختبر محاليل يومية — مجسّ pH تفاعلي ──
function simG9PhScale2() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, selected:null, probe:{x:0.5,y:0.2}, dragging:false };
  const S = simState;

  const solutions=[
    {name:'ماء الليمون', ph:2.5, col:'#FFD700', x:0.15, y:0.45, icon:'🍋'},
    {name:'الحليب',      ph:6.5, col:'#FFFFF0', x:0.32, y:0.45, icon:'🥛'},
    {name:'الماء النقي', ph:7.0, col:'#87CEEB', x:0.50, y:0.45, icon:'💧'},
    {name:'ماء البحر',   ph:8.1, col:'#006994', x:0.67, y:0.45, icon:'🌊'},
    {name:'الأمونيا',    ph:11.5,col:'#B0E0E6', x:0.84, y:0.45, icon:'🧪'},
    {name:'المطر الحمضي',ph:4.2, col:'#D3D3D3', x:0.15, y:0.75, icon:'🌧️'},
    {name:'عصير التوت',  ph:3.3, col:'#8B008B', x:0.32, y:0.75, icon:'🫐'},
    {name:'القهوة',      ph:5.0, col:'#8B4513', x:0.50, y:0.75, icon:'☕'},
    {name:'ماء الصابون', ph:9.5, col:'#90EE90', x:0.67, y:0.75, icon:'🧼'},
    {name:'ماء الجير',   ph:12.4,col:'#E8E8E8', x:0.84, y:0.75, icon:'⬜'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔬 مجسّ pH</div>
      <div id="ph-reading" style="background:#1E2D3D;color:#00FF88;font-family:monospace;font-size:24px;text-align:center;padding:14px;border-radius:10px;margin:8px 0;letter-spacing:2px;box-shadow:0 0 20px rgba(0,255,136,0.2)">pH = --</div>
      <div class="info-box" id="ph-detail" style="min-height:50px">اسحب مجسّ pH نحو أي محلول لقياسه</div>
    </div>
    <div class="q-box">
      <strong>❓ لماذا pH الدم يتراوح بين 7.35-7.45 دائماً؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الجسم يُحافظ على pH الدم في نطاق ضيق لأن الإنزيمات تعمل بكفاءة فقط في هذا النطاق. أي انحراف يُسبّب حالة طارئة طبية (حماض أو قلواء الدم).</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  let measuredSol=null;

  function getPos(e){ const r=cv.getBoundingClientRect(); const touch=e.touches&&e.touches[0]||e; return {x:(touch.clientX-r.left)*cv.width/r.width,y:(touch.clientY-r.top)*cv.height/r.height}; }
  function onStart(e){ e.preventDefault&&e.preventDefault(); const pos=getPos(e); if(Math.hypot(pos.x-S.probe.x*cv.width,pos.y-S.probe.y*cv.height)<40) S.dragging=true; }
  function onMove(e){ if(!S.dragging) return; e.preventDefault&&e.preventDefault(); const pos=getPos(e); S.probe.x=Math.max(0.05,Math.min(0.95,pos.x/cv.width)); S.probe.y=Math.max(0.05,Math.min(0.92,pos.y/cv.height)); }
  function onEnd(e){
    if(!S.dragging) return; S.dragging=false;
    let closest=null, minDist=Infinity;
    solutions.forEach(sol=>{ const d=Math.hypot(S.probe.x-sol.x,S.probe.y-sol.y); if(d<minDist){minDist=d;closest=sol;} });
    if(closest&&minDist<0.12){
      measuredSol=closest; S.selected=closest.name; try{U9Sound.ping();}catch(e){}
      const type=closest.ph<7?'حمضي 🍋':closest.ph>7?'قلوي 🧼':'متعادل 💧';
      const rdEl=document.getElementById('ph-reading'); if(rdEl) rdEl.textContent=`pH = ${closest.ph}`;
      const dtEl=document.getElementById('ph-detail'); if(dtEl) dtEl.innerHTML=`<b>${closest.icon} ${closest.name}</b><br>pH = ${closest.ph} | ${type}`;
    }
  }
  cv.onmousedown=onStart; cv.onmousemove=onMove; cv.onmouseup=onEnd;
  cv.addEventListener('touchstart',onStart,{passive:false});
  cv.addEventListener('touchmove',onMove,{passive:false});
  cv.addEventListener('touchend',onEnd,{passive:false});
  cv.style.cursor='grab';

  function draw(){
    if(currentSim!=='g9phscale'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#F0F4F8'); bg.addColorStop(1,'#E8EEF5');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.027)}px Tajawal`; c.textAlign='center';
    c.fillText('اسحب مجسّ pH نحو أي محلول لقياسه', w/2, h*0.07);

    solutions.forEach(sol=>{
      const sx=sol.x*w, sy=sol.y*h, r=36;
      const isSel=S.selected===sol.name;
      // Beaker
      c.fillStyle=sol.col+'BB';
      c.strokeStyle=isSel?'#1A8FA8':'rgba(0,0,0,0.15)';
      c.lineWidth=isSel?3:1.5;
      if(isSel){ c.shadowBlur=15; c.shadowColor='#1A8FA8'; }
      c.beginPath(); c.arc(sx,sy,r,0,Math.PI*2); c.fill(); c.stroke();
      c.shadowBlur=0;
      // Wave inside
      c.save(); c.beginPath(); c.arc(sx,sy,r-2,0,Math.PI*2); c.clip();
      c.fillStyle=sol.col+'66';
      c.beginPath(); c.moveTo(sx-r,sy+r*0.2);
      for(let xi=0;xi<=r*2;xi++){ c.lineTo(sx-r+xi,sy+r*0.2+Math.sin((xi/r)*Math.PI*2+S.t*0.07)*5); }
      c.lineTo(sx+r,sy+r); c.lineTo(sx-r,sy+r); c.closePath(); c.fill();
      c.restore();
      // Icon
      c.font=`${Math.max(18,r*0.55)}px serif`; c.textAlign='center'; c.textBaseline='middle'; c.fillText(sol.icon,sx,sy+3);
      // Name
      c.fillStyle='#333'; c.font=`${Math.max(9,w*0.019)}px Tajawal`; c.textBaseline='top'; c.fillText(sol.name,sx,sy+r+6);
      if(isSel){ c.fillStyle='#C0392B'; c.font=`bold ${Math.max(9,w*0.02)}px Tajawal`; c.fillText(`pH ${sol.ph}`,sx,sy+r+20); }
    });

    // Draw pH probe (draggable)
    const px=S.probe.x*w, py=S.probe.y*h;
    // Wire
    c.strokeStyle='rgba(50,50,50,0.4)'; c.lineWidth=2; c.setLineDash([6,4]);
    c.beginPath(); c.moveTo(px,py-30); c.lineTo(px,py-60); c.stroke(); c.setLineDash([]);
    // Body of probe
    c.fillStyle='#2C3E50';
    c.beginPath(); c.roundRect(px-14,py-30,28,22,[6,6,0,0]); c.fill();
    c.fillStyle='#ECF0F1';
    c.beginPath(); c.roundRect(px-12,py-28,24,18,[4,4,0,0]); c.fill();
    // Screen on probe
    c.fillStyle='#1E8449'; c.font=`bold ${Math.max(7,w*0.013)}px monospace`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(measuredSol?`${measuredSol.ph}`:'--',px,py-19);
    // Tip
    const tipCol=measuredSol?(measuredSol.ph<7?'#E74C3C':measuredSol.ph>7?'#2980B9':'#27AE60'):'#BDC3C7';
    c.fillStyle=tipCol;
    c.beginPath(); c.roundRect(px-6,py-8,12,38,[0,0,6,6]); c.fill();
    // Tip gloss
    c.fillStyle='rgba(255,255,255,0.2)'; c.beginPath(); c.roundRect(px-4,py-6,5,34,[0,0,3,3]); c.fill();
    // Sensor bulb
    if(S.dragging){ c.shadowBlur=10; c.shadowColor=tipCol; }
    c.fillStyle=tipCol; c.beginPath(); c.arc(px,py+30,7,0,Math.PI*2); c.fill();
    c.strokeStyle='rgba(255,255,255,0.5)'; c.lineWidth=1.5; c.beginPath(); c.arc(px,py+30,7,0,Math.PI*2); c.stroke();
    c.shadowBlur=0;

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 6-3 Tab3: التخفيف والتركيز ──
function simG9PhScale3() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, conc:1.0, acidType:'acid' };
  const S = simState;

  function calcPh(conc,type){
    if(conc<=0) return 7;
    if(type==='acid') return Math.max(0, -Math.log10(conc));
    else return Math.min(14, 14+Math.log10(conc));
  }

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">💧 التخفيف والتركيز</div>
      <div class="ctrl-name" style="font-size:13px;font-weight:400;margin-bottom:6px">نوع المحلول:</div>
      <select onchange="simState.acidType=this.value" style="width:100%;padding:8px;border-radius:8px;font-family:Tajawal;font-size:14px;border:1.5px solid rgba(0,0,0,0.1);background:var(--bg-card);color:var(--text-primary);margin-bottom:12px">
        <option value="acid">حمض الهيدروكلوريك HCl</option>
        <option value="base">هيدروكسيد الصوديوم NaOH</option>
      </select>
      <div class="ctrl-name" style="font-size:13px;font-weight:400;margin-bottom:6px">التركيز (mol/L):</div>
      <input type="range" min="0" max="4" step="0.1" value="1" oninput="simState.conc=+this.value" style="width:100%;direction:ltr">
      <div style="text-align:center;font-size:16px;font-weight:800;margin-top:6px;color:var(--teal)" id="conc-label">1.0 mol/L</div>
    </div>
    <div class="info-box" id="conc-result">pH = 0</div>
    <div class="q-box">
      <strong>❓ ماذا يحدث لـ pH الحمض عند تخفيفه بالماء؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">تخفيف الحمض يُقلل تركيز H⁺ مما يرفع pH نحو 7 (يصبح أقل حمضية). لكنه لن يصبح قلوياً أبداً بالتخفيف — يقترب من pH=7 فقط.</div>
    </div>`);

  const cv=document.getElementById('simCanvas');

  function draw(){
    if(currentSim!=='g9phscale'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const conc=S.conc||1, type=S.acidType||'acid';
    const ph=Math.round(calcPh(conc,type)*10)/10;
    const phClamped=Math.max(0,Math.min(14,ph));

    // Update UI
    const cl=document.getElementById('conc-label'); if(cl) cl.textContent=`${conc.toFixed(1)} mol/L`;
    const cr=document.getElementById('conc-result'); if(cr){
      const t2=phClamped<7?'حمضي 🍋':phClamped>7?'قلوي 🧼':'متعادل 💧';
      cr.innerHTML=`<b>pH = ${ph.toFixed(2)}</b> → ${t2}`;
    }

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#F8F5EF'); bg.addColorStop(1,'#EDE8E0');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Title
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(12,w*0.027)}px Tajawal`; c.textAlign='center';
    c.fillText(type==='acid'?'حمض الهيدروكلوريك HCl':'هيدروكسيد الصوديوم NaOH', w/2, h*0.07);

    // Beaker series showing dilution
    const levels=[1,0.5,0.1,0.01];
    levels.forEach((lv,i)=>{
      const bx=w*(0.12+i*0.22), by=h*0.75, bw2=w*0.16, bh2=h*0.45;
      const concLv=conc*lv;
      const phLv=calcPh(concLv,type);
      const phCl=Math.max(0,Math.min(14,phLv));
      let beakerCol;
      if(type==='acid'){ const t=phCl/7; beakerCol=`rgba(231,${Math.round(76+t*100)},60,${0.6-t*0.3})`; }
      else { const t=(phCl-7)/7; beakerCol=`rgba(41,${Math.round(128+t*50)},185,${0.3+t*0.4})`; }

      // Beaker outline
      c.strokeStyle='rgba(120,150,200,0.5)'; c.lineWidth=1.5;
      c.beginPath(); c.moveTo(bx,by-bh2); c.lineTo(bx,by); c.lineTo(bx+bw2,by); c.lineTo(bx+bw2,by-bh2); c.stroke();
      c.strokeStyle='rgba(120,150,200,0.4)'; c.lineWidth=2.5;
      c.beginPath(); c.moveTo(bx-3,by-bh2); c.lineTo(bx+bw2+3,by-bh2); c.stroke();

      // Liquid
      const liqH=bh2*0.8;
      c.fillStyle=beakerCol; c.fillRect(bx+2,by-liqH,bw2-4,liqH);
      // Wave
      c.fillStyle=beakerCol.replace(/[\d.]+\)$/,'0.3)');
      c.beginPath(); c.moveTo(bx+2,by-liqH);
      for(let xi=0;xi<=bw2-4;xi++){ c.lineTo(bx+2+xi,by-liqH+Math.sin((xi/bw2)*Math.PI*2+S.t*0.06+i)*5); }
      c.lineTo(bx+bw2-2,by-liqH-4); c.closePath(); c.fill();

      // pH label
      c.fillStyle='rgba(255,255,255,0.9)'; c.font=`bold ${Math.max(9,w*0.02)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(`pH=${phLv.toFixed(1)}`, bx+bw2/2, by-liqH*0.5);

      // Concentration below
      c.fillStyle='#444'; c.font=`${Math.max(8,w*0.018)}px Tajawal`; c.textBaseline='top';
      c.fillText(`×${lv}`, bx+bw2/2, by+6);
      c.fillText(`${concLv.toFixed(3)}M`, bx+bw2/2, by+20);
    });

    // Arrow between beakers
    for(let i=0;i<3;i++){
      const ax=w*(0.12+i*0.22)+w*0.16+4, ay=h*0.54;
      c.fillStyle='#1A8FA8'; c.font=`${Math.max(14,w*0.03)}px serif`; c.textAlign='center';
      c.fillText('→', ax+w*0.05, ay);
      c.fillStyle='#888'; c.font=`${Math.max(8,w*0.018)}px Tajawal`; c.textBaseline='top';
      c.fillText('تخفيف', ax+w*0.05, ay+h*0.04);
    }

    // pH bar at bottom
    const barX=w*0.05, barY=h*0.88, barW=w*0.9, barH=18;
    const phGrad=c.createLinearGradient(barX,0,barX+barW,0);
    phGrad.addColorStop(0,'#E74C3C'); phGrad.addColorStop(0.5,'#27AE60'); phGrad.addColorStop(1,'#1565C0');
    c.fillStyle=phGrad; c.beginPath(); c.roundRect(barX,barY,barW,barH,9); c.fill();
    c.fillStyle='rgba(255,255,255,0.3)'; c.beginPath(); c.roundRect(barX,barY,barW,barH/2,9); c.fill();
    const marker=barX+(phClamped/14)*barW;
    c.fillStyle='#1E2D3D'; c.beginPath(); c.arc(marker,barY+barH/2,11,0,Math.PI*2); c.fill();
    c.strokeStyle='#fff'; c.lineWidth=2; c.beginPath(); c.arc(marker,barY+barH/2,11,0,Math.PI*2); c.stroke();
    c.fillStyle='#fff'; c.font=`bold ${Math.max(8,w*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(ph.toFixed(1),marker,barY+barH/2);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 6-4 Tab1: الأيونات في المحاليل — تفاعلي ──
function simG9Ions1() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, ionPh:7 };
  const S = simState;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⚛️ اضبط pH المحلول</div>
      <input type="range" min="0" max="14" step="1" value="7"
        oninput="simState.ionPh=+this.value" style="width:100%;direction:ltr">
      <div id="ion-ph" style="text-align:center;font-size:22px;font-weight:800;margin-top:8px;color:var(--teal)">pH = 7</div>
    </div>
    <div class="info-box" id="ion-info">
      H⁺ = OH⁻ → محلول متعادل
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">📚 تعريف برونستد-لوري</div>
      <div class="ctrl-name" style="font-size:13px;font-weight:400;line-height:1.9">
        🍋 <b>الحمض:</b> مانح أيون H⁺<br>
        🧼 <b>القاعدة:</b> قابلة أيون H⁺
      </div>
    </div>
    <div class="q-box">
      <strong>❓ كيف يتعادل الماء النقي نفسه؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الماء يتأيّن جزئياً: H₂O ⇌ H⁺ + OH⁻. كلا الأيونين يتشكّلان بنفس الكمية (10⁻⁷ mol/L) لذا H⁺ = OH⁻ والمحلول متعادل pH=7.</div>
    </div>`);

  const cv=document.getElementById('simCanvas');

  function draw(){
    if(currentSim!=='g9ions'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const ph=S.ionPh||7;

    // Update UI
    const phEl=document.getElementById('ion-ph'); if(phEl) phEl.textContent=`pH = ${ph}`;
    const infoEl=document.getElementById('ion-info');
    if(infoEl){
      if(ph<7) infoEl.innerHTML=`H⁺ <b style="color:#C0392B">أكثر</b> من OH⁻<br>→ محلول <b>حمضي 🍋</b>`;
      else if(ph>7) infoEl.innerHTML=`OH⁻ <b style="color:#2980B9">أكثر</b> من H⁺<br>→ محلول <b>قلوي 🧼</b>`;
      else infoEl.innerHTML=`H⁺ = OH⁻<br>→ محلول <b>متعادل 💧</b>`;
    }

    // Background
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F0F8FF'); bg.addColorStop(1,'#E8F0FA');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Big beaker
    const bkx=w*0.15, bky=h*0.08, bkw=w*0.70, bkh=h*0.76;
    // Glass
    const glassG=c.createLinearGradient(bkx,0,bkx+bkw,0);
    glassG.addColorStop(0,'rgba(220,235,255,0.5)'); glassG.addColorStop(0.2,'rgba(255,255,255,0.1)');
    glassG.addColorStop(0.8,'rgba(255,255,255,0.08)'); glassG.addColorStop(1,'rgba(200,220,255,0.45)');
    c.fillStyle=glassG;
    c.beginPath(); c.moveTo(bkx,bky); c.lineTo(bkx,bky+bkh); c.lineTo(bkx+bkw,bky+bkh); c.lineTo(bkx+bkw,bky); c.closePath(); c.fill();
    c.strokeStyle='rgba(120,150,200,0.45)'; c.lineWidth=2.5;
    c.beginPath(); c.moveTo(bkx,bky); c.lineTo(bkx,bky+bkh); c.lineTo(bkx+bkw,bky+bkh); c.lineTo(bkx+bkw,bky); c.stroke();
    // Rim
    c.strokeStyle='rgba(120,150,200,0.55)'; c.lineWidth=3.5;
    c.beginPath(); c.moveTo(bkx-5,bky); c.lineTo(bkx+bkw+5,bky); c.stroke();
    // Liquid tint based on pH
    const phT=ph/14;
    const liqR=Math.round(231-phT*190), liqG=Math.round(76+phT*100), liqB=Math.round(60+phT*125);
    c.fillStyle=`rgba(${liqR},${liqG},${liqB},0.08)`;
    c.fillRect(bkx+2,bky,bkw-4,bkh);

    // H+ ions count
    const hCount=ph<7?Math.floor((7-ph)*3.5+3):ph===7?3:Math.max(1,Math.floor((9-ph)));
    const ohCount=ph>7?Math.floor((ph-7)*3.5+3):ph===7?3:Math.max(1,Math.floor((9-ph)));
    const hC=Math.min(hCount,22), ohC=Math.min(ohCount,22);

    // Draw H+ ions (red)
    for(let i=0;i<hC;i++){
      const ix=bkx+20+((i*53+S.t*0.5)%(bkw-40));
      const iy=bky+bkh*0.15+((i*37+S.t*0.7)%(bkh*0.65));
      const pulse=1+Math.sin(S.t*0.1+i*0.7)*0.12;
      const r2=9*pulse;
      c.shadowBlur=8; c.shadowColor='rgba(231,76,60,0.5)';
      c.fillStyle='#E74C3C'; c.beginPath(); c.arc(ix,iy,r2,0,Math.PI*2); c.fill();
      c.shadowBlur=0;
      c.fillStyle='#fff'; c.font=`bold ${Math.max(7,w*0.014)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('H⁺',ix,iy);
    }
    // Draw OH- ions (blue)
    for(let i=0;i<ohC;i++){
      const ix=bkx+30+((i*61+S.t*0.45+30)%(bkw-40));
      const iy=bky+bkh*0.2+((i*41+S.t*0.6+20)%(bkh*0.6));
      const pulse=1+Math.sin(S.t*0.08+i*0.9+2)*0.12;
      const r2=9*pulse;
      c.shadowBlur=8; c.shadowColor='rgba(41,128,185,0.5)';
      c.fillStyle='#2980B9'; c.beginPath(); c.arc(ix,iy,r2,0,Math.PI*2); c.fill();
      c.shadowBlur=0;
      c.fillStyle='#fff'; c.font=`bold ${Math.max(7,w*0.014)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('OH⁻',ix,iy);
    }

    // Type label
    const typeCol=ph<7?'#C0392B':ph>7?'#2980B9':'#27AE60';
    const typeAr=ph<7?'حمضي 🍋':ph>7?'قلوي 🧼':'متعادل 💧';
    c.fillStyle='rgba(255,255,255,0.94)'; c.beginPath(); c.roundRect(w*0.2,h*0.88,w*0.6,h*0.09,10); c.fill();
    c.strokeStyle=typeCol+'66'; c.lineWidth=1.5; c.beginPath(); c.roundRect(w*0.2,h*0.88,w*0.6,h*0.09,10); c.stroke();
    c.fillStyle=typeCol; c.font=`bold ${Math.max(13,w*0.028)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(`pH = ${ph} | ${typeAr}`, w/2, h*0.925);

    // Legend
    const legX=w*0.02, legY=h*0.82;
    [{col:'#E74C3C',lbl:'H⁺'},{col:'#2980B9',lbl:'OH⁻'}].forEach((lg,i)=>{
      c.fillStyle=lg.col; c.beginPath(); c.arc(legX+8,legY+i*22,8,0,Math.PI*2); c.fill();
      c.fillStyle='#333'; c.font=`${Math.max(10,w*0.021)}px Tajawal`; c.textAlign='left'; c.textBaseline='middle';
      c.fillText(lg.lbl,legX+20,legY+i*22);
    });

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 6-4 Tab2: العلاقة بين H⁺ وpH — منحنى تفاعلي ──
function simG9Ions2() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, hover:{ph:null}, mouseX:-1 };
  const S = simState;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📈 العلاقة بين [H⁺] وpH</div>
      <table style="width:100%;border-collapse:collapse;font-size:11px;font-family:Tajawal">
        <tr style="background:rgba(26,143,168,0.1)"><td style="padding:4px;font-weight:700">pH</td><td style="padding:4px;font-weight:700;direction:ltr">[H⁺] mol/L</td><td style="padding:4px;font-weight:700">النوع</td></tr>
        ${[0,1,2,4,7,10,12,14].map(p=>`<tr style="border-bottom:1px solid rgba(0,0,0,0.05)"><td style="padding:3px;text-align:center">${p}</td><td style="padding:3px;text-align:center;direction:ltr">${(Math.pow(10,-p)).toExponential(0)}</td><td style="padding:3px;text-align:center;color:${p<7?'#C0392B':p>7?'#1565C0':'#27AE60'}">${p<7?'حمضي':p>7?'قلوي':'متعادل'}</td></tr>`).join('')}
      </table>
    </div>
    <div class="q-box">
      <strong>❓ لماذا العلاقة بين H⁺ وpH عكسية ولوغاريتمية؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">pH = -log[H⁺]. كلما زاد تركيز H⁺ (حمض أقوى)، كان اللوغاريتم السالب أصغر (pH أقل). المقياس لوغاريتمي — pH=1 يعني 10× تركيز pH=2!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  cv.onmousemove=function(e){ const r=cv.getBoundingClientRect(); S.mouseX=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX-r.left)*cv.width/r.width; };
  cv.onmouseleave=function(){ S.mouseX=-1; };

  function draw(){
    if(currentSim!=='g9ions'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#F8F5EF'); bg.addColorStop(1,'#EDE8E0');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(12,w*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText('العلاقة العكسية: كلما زاد pH قلّ تركيز H⁺', w/2, h*0.07);

    const ox=w*0.13, oy=h*0.88, aw=w*0.82, ah=h*0.74;

    // Grid lines
    c.strokeStyle='rgba(0,0,0,0.07)'; c.lineWidth=1; c.setLineDash([4,4]);
    [0,7,14].forEach(p=>{ const fx=ox+(p/14)*aw; c.beginPath(); c.moveTo(fx,oy-ah); c.lineTo(fx,oy); c.stroke(); });
    [0,-7,-14].forEach(logH=>{ const fy=oy-((logH+14)/14)*ah; c.beginPath(); c.moveTo(ox,fy); c.lineTo(ox+aw,fy); c.stroke(); });
    c.setLineDash([]);

    // Axes
    c.strokeStyle='#555'; c.lineWidth=2;
    c.beginPath(); c.moveTo(ox,oy-ah); c.lineTo(ox,oy); c.lineTo(ox+aw,oy); c.stroke();
    // Axis labels
    c.fillStyle='#333'; c.font=`bold ${Math.max(10,w*0.021)}px Tajawal`; c.textAlign='center';
    c.fillText('pH', ox+aw/2, oy+h*0.07);
    c.save(); c.translate(ox-h*0.05,oy-ah/2); c.rotate(-Math.PI/2);
    c.fillText('[H⁺]',0,0); c.restore();

    // Tick labels
    c.fillStyle='#555'; c.font=`${Math.max(8,w*0.018)}px Tajawal`;
    [0,7,14].forEach(p=>{ c.textAlign='center'; c.textBaseline='top'; c.fillText(p,ox+(p/14)*aw,oy+5); });
    [0,-7,-14].forEach(logH=>{ const fy=oy-((logH+14)/14)*ah; c.textAlign='right'; c.textBaseline='middle'; c.fillText(`10^${logH}`,ox-5,fy); });

    // Colored zones
    const zones=[{x0:0,x1:7,col:'rgba(231,76,60,0.05)'},{x0:7,x1:7.1,col:'rgba(39,174,96,0.1)'},{x0:7,x1:14,col:'rgba(41,128,185,0.05)'}];
    zones.forEach(z=>{ c.fillStyle=z.col; c.fillRect(ox+z.x0/14*aw,oy-ah,((z.x1-z.x0)/14)*aw,ah); });

    // Curve
    c.strokeStyle='#1A8FA8'; c.lineWidth=2.5;
    c.beginPath();
    for(let ph=0;ph<=14;ph+=0.1){
      const fx=ox+(ph/14)*aw, fy=oy-((-ph+14)/14)*ah;
      if(ph===0) c.moveTo(fx,fy); else c.lineTo(fx,fy);
    }
    c.stroke();
    // Gradient fill under curve
    const cfill=c.createLinearGradient(0,oy-ah,0,oy);
    cfill.addColorStop(0,'rgba(26,143,168,0.15)'); cfill.addColorStop(1,'rgba(26,143,168,0)');
    c.fillStyle=cfill;
    c.beginPath(); c.moveTo(ox,oy);
    for(let ph=0;ph<=14;ph+=0.1){ c.lineTo(ox+(ph/14)*aw, oy-((-ph+14)/14)*ah); }
    c.lineTo(ox+aw,oy); c.closePath(); c.fill();

    // Interactive cursor line
    if(S.mouseX>ox&&S.mouseX<ox+aw){
      const curPh=((S.mouseX-ox)/aw)*14;
      const curFy=oy-((-curPh+14)/14)*ah;
      c.strokeStyle='rgba(212,144,26,0.6)'; c.lineWidth=1.5; c.setLineDash([5,5]);
      c.beginPath(); c.moveTo(S.mouseX,oy); c.lineTo(S.mouseX,curFy); c.stroke(); c.setLineDash([]);
      c.fillStyle='#D4901A'; c.beginPath(); c.arc(S.mouseX,curFy,7,0,Math.PI*2); c.fill();
      c.strokeStyle='#fff'; c.lineWidth=2; c.beginPath(); c.arc(S.mouseX,curFy,7,0,Math.PI*2); c.stroke();
      // Tooltip
      const tpH=`pH = ${curPh.toFixed(1)}`; const tH=`[H⁺] = 10^${(-curPh).toFixed(0)}`;
      c.fillStyle='rgba(255,255,255,0.95)'; c.beginPath(); c.roundRect(S.mouseX+10,curFy-30,130,44,8); c.fill();
      c.strokeStyle='rgba(212,144,26,0.5)'; c.lineWidth=1.5; c.beginPath(); c.roundRect(S.mouseX+10,curFy-30,130,44,8); c.stroke();
      c.fillStyle='#D4901A'; c.font=`bold ${Math.max(10,w*0.021)}px Tajawal`; c.textAlign='right'; c.textBaseline='top';
      c.fillText(tpH, S.mouseX+135, curFy-26);
      c.fillStyle='#555'; c.font=`${Math.max(9,w*0.019)}px Tajawal`;
      c.fillText(tH, S.mouseX+135, curFy-10);
    }

    // Moving dot on curve
    const animPh=(S.t*0.04)%14;
    const animFx=ox+(animPh/14)*aw, animFy=oy-((-animPh+14)/14)*ah;
    c.fillStyle='#C0392B'; c.beginPath(); c.arc(animFx,animFy,6,0,Math.PI*2); c.fill();

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 6-5 Tab1: الأكاسيد الحمضية ──
function simG9Oxides1() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, selOx1:0 };
  const S = simState;

  const oxides=[
    { name:'ثاني أكسيد الكربون', formula:'CO₂', element:'كربون (لافلز)', product:'H₂CO₃ حمض الكربونيك', ph:5.5, icon:'💨', desc:'يذوب في ماء الأمطار فيكوّن المطر الحمضي' },
    { name:'ثاني أكسيد الكبريت', formula:'SO₂', element:'كبريت (لافلز)', product:'H₂SO₃ حمض الكبريتوز', ph:3.5, icon:'🏭', desc:'ينبعث من المصانع ويسبّب التلوث' },
    { name:'ثاني أكسيد النيتروجين', formula:'NO₂', element:'نيتروجين (لافلز)', product:'HNO₃ حمض النيتريك', ph:3.0, icon:'🚗', desc:'ينبعث من عوادم السيارات' },
    { name:'ثالث أكسيد الكبريت', formula:'SO₃', element:'كبريت (لافلز)', product:'H₂SO₄ حمض الكبريتيك', ph:1.5, icon:'⚠️', desc:'يكوّن حمض الكبريتيك القوي' },
    { name:'ثاني أكسيد السيليكون', formula:'SiO₂', element:'سيليكون (شبه فلز)', product:'H₂SiO₃ حمض السيليك', ph:5, icon:'🪨', desc:'الرمل والكوارتز — شبه ذائب' },
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⚗️ أكاسيد لافلزية حمضية</div>
      <div class="ctrl-btns-grid-1">
        ${oxides.map((o,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="ox1-btn-${i}" onclick="simState.selOx1=${i};document.querySelectorAll('[id^=ox1-btn-]').forEach((b,j)=>{b.classList.toggle('active',j===${i})})">${o.icon} ${o.formula} — ${o.name}</button>`).join('')}
      </div>
    </div>
    <div class="info-box">
      <b>الأكسيد الحمضي =</b> أكسيد لافلز + ماء → حمض
    </div>
    <div class="q-box">
      <strong>❓ كيف يُسبّب SO₂ المطرَ الحمضي؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">SO₂ المنبعث من المصانع يتحد مع بخار الماء مكوّناً H₂SO₃ وH₂SO₄. تذوب هذه الأحماض في الأمطار لتصبح حمضية (pH أقل من 5.6) وتُتلف النباتات والمباني.</div>
    </div>`);

  const cv=document.getElementById('simCanvas');

  function draw(){
    if(currentSim!=='g9oxides'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const ox=oxides[S.selOx1||0];

    // Background warm
    const bg=c.createLinearGradient(0,0,w,h); bg.addColorStop(0,'#FFF8EE'); bg.addColorStop(1,'#FFF0D8');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Animated particles (gas molecules)
    for(let i=0;i<12;i++){
      const px2=(i/12)*w+(Math.sin(S.t*0.013+i*1.1)*25);
      const py2=h-((S.t*0.5+i*50)%h);
      c.fillStyle='rgba(255,140,0,0.15)';
      c.beginPath(); c.arc(px2,py2,6+i%3,0,Math.PI*2); c.fill();
    }

    // Title
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText(ox.name, w/2, h*0.07);

    // Reaction boxes
    const boxes=[
      {label:ox.formula, sublabel:'الأكسيد الحمضي', col:'#FF8C00', bg:'#FFE0B2'},
      {label:'+', sublabel:'', col:'#555', bg:'transparent'},
      {label:'H₂O', sublabel:'الماء', col:'#0288D1', bg:'#B3E5FC'},
      {label:'→', sublabel:'', col:'#27AE60', bg:'transparent'},
      {label:ox.product.split(' ')[0], sublabel:'الحمض الناتج', col:'#C0392B', bg:'#FFCDD2'},
    ];
    const bW=w*0.165, bH=h*0.22, bY=h*0.17;
    const totalW=boxes.length*(bW+w*0.02)-w*0.02;
    const startX=(w-totalW)/2;

    boxes.forEach((box,i)=>{
      const bx=startX+i*(bW+w*0.02);
      if(box.bg==='transparent'){
        // operator
        if(box.sublabel==='') {
          const pulse=box.label==='→'?Math.sin(S.t*0.06)*3:0;
          c.fillStyle=box.col; c.font=`bold ${Math.max(20,w*0.045)}px serif`; c.textAlign='center'; c.textBaseline='middle';
          c.fillText(box.label, bx+bW/2, bY+bH/2+pulse);
        }
        return;
      }
      // Box
      c.fillStyle=box.bg; c.beginPath(); c.roundRect(bx,bY,bW,bH,10); c.fill();
      c.strokeStyle=box.col+'88'; c.lineWidth=1.5; c.beginPath(); c.roundRect(bx,bY,bW,bH,10); c.stroke();
      c.fillStyle=box.col; c.font=`bold ${Math.max(13,w*0.028)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(box.label, bx+bW/2, bY+bH*0.42);
      c.fillStyle='#888'; c.font=`${Math.max(9,w*0.018)}px Tajawal`;
      c.fillText(box.sublabel, bx+bW/2, bY+bH*0.76);
    });

    // pH result
    c.fillStyle='rgba(192,57,43,0.08)'; c.beginPath(); c.roundRect(w*0.1,h*0.45,w*0.8,h*0.1,10); c.fill();
    c.strokeStyle='rgba(192,57,43,0.2)'; c.lineWidth=1.5; c.beginPath(); c.roundRect(w*0.1,h*0.45,w*0.8,h*0.1,10); c.stroke();
    c.fillStyle='#C0392B'; c.font=`bold ${Math.max(12,w*0.026)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(`pH الناتج = ${ox.ph} → حمضي 🍋`, w/2, h*0.50);

    // pH bar
    const barX=w*0.06, barY=h*0.60, barW2=w*0.88, barH=16;
    const phGrad=c.createLinearGradient(barX,0,barX+barW2,0);
    phGrad.addColorStop(0,'#E74C3C'); phGrad.addColorStop(0.5,'#27AE60'); phGrad.addColorStop(1,'#1565C0');
    c.fillStyle=phGrad; c.beginPath(); c.roundRect(barX,barY,barW2,barH,8); c.fill();
    c.fillStyle='rgba(255,255,255,0.3)'; c.beginPath(); c.roundRect(barX,barY,barW2,barH/2,8); c.fill();
    const mX=barX+(ox.ph/14)*barW2;
    c.fillStyle='#fff'; c.beginPath(); c.arc(mX,barY+barH/2,10,0,Math.PI*2); c.fill();
    c.strokeStyle='#C0392B'; c.lineWidth=2; c.beginPath(); c.arc(mX,barY+barH/2,10,0,Math.PI*2); c.stroke();
    c.fillStyle='#C0392B'; c.font=`bold ${Math.max(8,w*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(ox.ph,mX,barY+barH/2);
    [0,7,14].forEach(n=>{ c.fillStyle='#555'; c.font=`${Math.max(8,w*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='top'; c.fillText(n,barX+(n/14)*barW2,barY+barH+4); });

    // Description
    c.fillStyle='rgba(255,255,255,0.9)'; c.beginPath(); c.roundRect(w*0.08,h*0.74,w*0.84,h*0.12,10); c.fill();
    c.fillStyle='#555'; c.font=`${Math.max(11,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(ox.desc, w/2, h*0.80);
    c.fillStyle='#888'; c.font=`${Math.max(10,w*0.021)}px Tajawal`;
    c.fillText(`العنصر: ${ox.element}`, w/2, h*0.845);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 6-5 Tab2: الأكاسيد القاعدية ──
function simG9Oxides2() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, selOx2:0 };
  const S = simState;

  const oxides=[
    { name:'أكسيد الصوديوم', formula:'Na₂O', product:'NaOH هيدروكسيد الصوديوم', ph:14, icon:'⚪', desc:'يتفاعل بشدة مع الماء' },
    { name:'أكسيد الكالسيوم (الجير)', formula:'CaO', product:'Ca(OH)₂ هيدروكسيد الكالسيوم', ph:12.4, icon:'🪨', desc:'يُستخدم في الزراعة لتعديل التربة' },
    { name:'أكسيد المغنيسيوم', formula:'MgO', product:'Mg(OH)₂ هيدروكسيد المغنيسيوم', ph:10.5, icon:'💊', desc:'يُستخدم في علاج حموضة المعدة' },
    { name:'أكسيد النحاس (II)', formula:'CuO', product:'Cu(OH)₂ هيدروكسيد النحاس', ph:9, icon:'🔵', desc:'لا يذوب في الماء بسهولة' },
    { name:'أكسيد الحديد (III)', formula:'Fe₂O₃', product:'Fe(OH)₃ هيدروكسيد الحديد', ph:8, icon:'🟤', desc:'الصدأ — يتكوّن عند تأكسد الحديد' },
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧱 أكاسيد فلزية قاعدية</div>
      <div class="ctrl-btns-grid-1">
        ${oxides.map((o,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="ox2-btn-${i}" onclick="simState.selOx2=${i};document.querySelectorAll('[id^=ox2-btn-]').forEach((b,j)=>{b.classList.toggle('active',j===${i})})">${o.icon} ${o.formula} — ${o.name}</button>`).join('')}
      </div>
    </div>
    <div class="info-box" style="background:rgba(39,174,96,0.06);border-color:rgba(39,174,96,0.2)">
      <b>الأكسيد القاعدي =</b> أكسيد فلز + ماء → قاعدة/هيدروكسيد
    </div>
    <div class="q-box">
      <strong>❓ لماذا يُضاف الجير (CaO) للتربة الزراعية؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">أكسيد الكالسيوم CaO قاعدي — عند إضافته للتربة الحمضية يتفاعل مع الأحماض ويرفع pH التربة نحو المتعادل، مما يُحسّن قدرة النباتات على امتصاص المغذيات.</div>
    </div>`);

  const cv=document.getElementById('simCanvas');

  function draw(){
    if(currentSim!=='g9oxides'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const ox=oxides[S.selOx2||0];

    const bg=c.createLinearGradient(0,0,w,h); bg.addColorStop(0,'#F0FFF4'); bg.addColorStop(1,'#E8F5EC');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // OH⁻ ions floating
    for(let i=0;i<8;i++){
      const px=w*0.1+((i*71+S.t*0.4)%(w*0.8));
      const py=h*0.15+((i*53+S.t*0.6)%(h*0.55));
      c.fillStyle='rgba(39,174,96,0.15)';
      c.beginPath(); c.arc(px,py,8,0,Math.PI*2); c.fill();
      c.fillStyle='rgba(39,174,96,0.5)'; c.font=`bold ${Math.max(6,w*0.013)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('OH⁻',px,py);
    }

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText(ox.name, w/2, h*0.07);

    // Reaction boxes - green theme
    const bW=w*0.165, bH=h*0.22, bY=h*0.14;
    const boxData=[
      {label:ox.formula, sub:'الأكسيد القاعدي', col:'#27AE60', bg:'#C8E6C9'},
      {label:'+', sub:'', col:'#555', bg:'transparent'},
      {label:'H₂O', sub:'الماء', col:'#0288D1', bg:'#B3E5FC'},
      {label:'→', sub:'', col:'#27AE60', bg:'transparent'},
      {label:ox.product.split(' ')[0], sub:'القاعدة', col:'#27AE60', bg:'#C8E6C9'},
    ];
    const totalW2=boxData.length*(bW+w*0.02)-w*0.02;
    const startX2=(w-totalW2)/2;
    boxData.forEach((box,i)=>{
      const bx=startX2+i*(bW+w*0.02);
      if(box.bg==='transparent'){
        const pulse=box.label==='→'?Math.sin(S.t*0.06)*3:0;
        c.fillStyle=box.col; c.font=`bold ${Math.max(20,w*0.045)}px serif`; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(box.label, bx+bW/2, bY+bH/2+pulse);
        return;
      }
      c.fillStyle=box.bg; c.beginPath(); c.roundRect(bx,bY,bW,bH,10); c.fill();
      c.strokeStyle=box.col+'88'; c.lineWidth=1.5; c.beginPath(); c.roundRect(bx,bY,bW,bH,10); c.stroke();
      c.fillStyle=box.col; c.font=`bold ${Math.max(13,w*0.028)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(box.label, bx+bW/2, bY+bH*0.42);
      c.fillStyle='#888'; c.font=`${Math.max(9,w*0.018)}px Tajawal`;
      c.fillText(box.sub, bx+bW/2, bY+bH*0.76);
    });

    // pH result
    c.fillStyle='rgba(39,174,96,0.08)'; c.beginPath(); c.roundRect(w*0.1,h*0.42,w*0.8,h*0.1,10); c.fill();
    c.strokeStyle='rgba(39,174,96,0.2)'; c.lineWidth=1.5; c.beginPath(); c.roundRect(w*0.1,h*0.42,w*0.8,h*0.1,10); c.stroke();
    c.fillStyle='#27AE60'; c.font=`bold ${Math.max(12,w*0.026)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(`pH الناتج = ${ox.ph} → قلوي 🧼`, w/2, h*0.47);

    // pH bar
    const barX=w*0.06, barY=h*0.58, barW2=w*0.88, barH=16;
    const phGrad=c.createLinearGradient(barX,0,barX+barW2,0);
    phGrad.addColorStop(0,'#E74C3C'); phGrad.addColorStop(0.5,'#27AE60'); phGrad.addColorStop(1,'#1565C0');
    c.fillStyle=phGrad; c.beginPath(); c.roundRect(barX,barY,barW2,barH,8); c.fill();
    c.fillStyle='rgba(255,255,255,0.3)'; c.beginPath(); c.roundRect(barX,barY,barW2,barH/2,8); c.fill();
    const mX=barX+(ox.ph/14)*barW2;
    c.fillStyle='#fff'; c.beginPath(); c.arc(mX,barY+barH/2,10,0,Math.PI*2); c.fill();
    c.strokeStyle='#27AE60'; c.lineWidth=2; c.beginPath(); c.arc(mX,barY+barH/2,10,0,Math.PI*2); c.stroke();
    c.fillStyle='#27AE60'; c.font=`bold ${Math.max(8,w*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(ox.ph,mX,barY+barH/2);

    c.fillStyle='rgba(255,255,255,0.9)'; c.beginPath(); c.roundRect(w*0.08,h*0.74,w*0.84,h*0.12,10); c.fill();
    c.fillStyle='#555'; c.font=`${Math.max(11,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(ox.desc, w/2, h*0.80);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 6-5 Tab3: الأكاسيد المتذبذبة ──
function simG9Oxides3() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, ampho:0, testWith:'acid' };
  const S = simState;

  const amphotericOxides=[
    { name:'أكسيد الألومنيوم', formula:'Al₂O₃', withAcid:'AlCl₃ + H₂O', withBase:'NaAlO₂ + H₂O', icon:'⚪', use:'صناعة الألومنيوم' },
    { name:'أكسيد الزنك', formula:'ZnO', withAcid:'ZnCl₂ + H₂O', withBase:'Na₂ZnO₂ + H₂O', icon:'🔘', use:'مراهم الجلد' },
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔄 الأكاسيد المتذبذبة</div>
      <div class="ctrl-btns-grid-1">
        ${amphotericOxides.map((o,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="ampho-btn-${i}" onclick="simState.ampho=${i};document.querySelectorAll('[id^=ampho-btn-]').forEach((b,j)=>{b.classList.toggle('active',j===${i})})">${o.icon} ${o.formula} — ${o.name}</button>`).join('')}
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🧪 اختبره مع</div>
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn stop" onclick="simState.testWith='acid';document.querySelector('.ctrl-btn.action').classList.remove('active');this.classList.add('active')">🍋 حمض HCl</button>
        <button class="ctrl-btn action" onclick="simState.testWith='base';document.querySelector('.ctrl-btn.stop').classList.remove('active');this.classList.add('active')">🧼 قاعدة NaOH</button>
      </div>
    </div>
    <div class="info-box">
      <b>المتذبذب =</b> يتفاعل مع الحمض كقاعدة، ومع القاعدة كحمض!
    </div>
    <div class="q-box">
      <strong>❓ ما الفائدة العملية من الأكاسيد المتذبذبة؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">Al₂O₃ يُستخدم في تكرير الألومنيوم وصناعة الكورندوم (أصلب المواد). ZnO في مراهم الجلد والدهانات. تذبذبها يجعلها تعمل في أوساط حمضية وقاعدية!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');

  function draw(){
    if(currentSim!=='g9oxides'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const ox=amphotericOxides[S.ampho||0];
    const isAcid=S.testWith==='acid';
    const reagent=isAcid?'HCl (حمض)':'NaOH (قاعدة)';
    const product=isAcid?ox.withAcid:ox.withBase;
    const productType=isAcid?'كقاعدة 🧼':'كحمض 🍋';
    const reacColor=isAcid?'#C0392B':'#27AE60';

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#F3F0FF'); bg.addColorStop(1,'#EAE7F5');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText(`${ox.formula} (${ox.name}) — أكسيد متذبذب`, w/2, h*0.07);

    // Center oxide circle
    const cx2=w*0.5, cy2=h*0.38, r2=Math.min(w,h)*0.13;
    c.shadowBlur=20; c.shadowColor='#9C27B088';
    const radG=c.createRadialGradient(cx2-r2*0.3,cy2-r2*0.3,r2*0.1,cx2,cy2,r2);
    radG.addColorStop(0,'#CE93D8CC'); radG.addColorStop(1,'#9C27B077');
    c.fillStyle=radG; c.beginPath(); c.arc(cx2,cy2,r2,0,Math.PI*2); c.fill();
    c.shadowBlur=0;
    c.strokeStyle='#7B1FA2'; c.lineWidth=3; c.beginPath(); c.arc(cx2,cy2,r2,0,Math.PI*2); c.stroke();
    c.fillStyle='#fff'; c.font=`bold ${Math.max(14,w*0.03)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(ox.formula, cx2, cy2-5);
    c.fillStyle='rgba(255,255,255,0.7)'; c.font=`${Math.max(9,w*0.018)}px Tajawal`;
    c.fillText('متذبذب', cx2, cy2+12);

    // Left circle (acid)
    const lx=w*0.14, ly=h*0.36, lr=Math.min(w,h)*0.10;
    const acidActive=isAcid&&Math.floor(S.t/25)%2===0;
    c.shadowBlur=isAcid?15:0; c.shadowColor='#C0392B88';
    c.fillStyle=acidActive?'#FFCDD2':'#FFE8E8';
    c.beginPath(); c.arc(lx,ly,lr,0,Math.PI*2); c.fill();
    c.shadowBlur=0;
    c.strokeStyle='#C0392B'; c.lineWidth=isAcid?2.5:1.5; c.beginPath(); c.arc(lx,ly,lr,0,Math.PI*2); c.stroke();
    c.fillStyle='#C0392B'; c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('HCl', lx, ly-6); c.fillText('حمض', lx, ly+10);

    // Right circle (base)
    const rx=w*0.86, ry=h*0.36;
    const baseActive=!isAcid&&Math.floor(S.t/25)%2===0;
    c.shadowBlur=!isAcid?15:0; c.shadowColor='#27AE6088';
    c.fillStyle=baseActive?'#C8E6C9':'#E8F5E9';
    c.beginPath(); c.arc(rx,ry,lr,0,Math.PI*2); c.fill();
    c.shadowBlur=0;
    c.strokeStyle='#27AE60'; c.lineWidth=!isAcid?2.5:1.5; c.beginPath(); c.arc(rx,ry,lr,0,Math.PI*2); c.stroke();
    c.fillStyle='#27AE60'; c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('NaOH', rx, ry-6); c.fillText('قاعدة', rx, ry+10);

    // Arrow from active side to center
    c.strokeStyle=reacColor; c.lineWidth=2.5;
    const fromX=isAcid?lx+lr:rx-lr, fromY=isAcid?ly:ry;
    const toX=isAcid?cx2-r2:cx2+r2, toY=cy2;
    const midX=(fromX+toX)/2+(Math.sin(S.t*0.07)*8), midY=(fromY+toY)/2-20;
    c.beginPath(); c.moveTo(fromX,fromY); c.quadraticCurveTo(midX,midY,toX,toY); c.stroke();
    // Arrowhead
    const angle=Math.atan2(toY-midY,toX-midX);
    c.fillStyle=reacColor; c.beginPath();
    c.moveTo(toX,toY);
    c.lineTo(toX-12*Math.cos(angle-0.4),toY-12*Math.sin(angle-0.4));
    c.lineTo(toX-12*Math.cos(angle+0.4),toY-12*Math.sin(angle+0.4));
    c.closePath(); c.fill();

    // Reaction box
    const rbx=w*0.08, rby=h*0.60, rbw=w*0.84, rbh=h*0.14;
    c.fillStyle=isAcid?'rgba(231,76,60,0.08)':'rgba(39,174,96,0.08)';
    c.beginPath(); c.roundRect(rbx,rby,rbw,rbh,10); c.fill();
    c.strokeStyle=reacColor+'44'; c.lineWidth=1.5; c.beginPath(); c.roundRect(rbx,rby,rbw,rbh,10); c.stroke();
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(11,w*0.024)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(`${ox.formula} + ${reagent} → ${product}`, w/2, rby+rbh*0.38);
    c.fillStyle=reacColor; c.font=`${Math.max(10,w*0.022)}px Tajawal`;
    c.fillText(`يتصرّف الأكسيد ${productType} في هذه الحالة`, w/2, rby+rbh*0.72);

    // Key fact
    c.fillStyle='rgba(255,255,255,0.92)'; c.beginPath(); c.roundRect(w*0.06,h*0.79,w*0.88,h*0.12,10); c.fill();
    c.fillStyle='#7B1FA2'; c.font=`bold ${Math.max(11,w*0.023)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('المتذبذب: يتفاعل مع الأحماض والقواعد على حدٍّ سواء', w/2, h*0.83);
    c.fillStyle='#888'; c.font=`${Math.max(10,w*0.02)}px Tajawal`;
    c.fillText(`الاستخدام: ${ox.use}`, w/2, h*0.868);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}



// ══════════════════════════════════════════════════════════
// الصف التاسع — الوحدة السابعة: معادلات التفاعلات الكيميائية
// ══════════════════════════════════════════════════════════

// ─── 7-1 TAB 1: المعادلات اللفظية ───
function simG9WordEq1(){
  cancelAnimationFrame(animFrame);
  simState={t:0, selected:-1, step:0, feedback:''};
  const S=simState;

  const reactions=[
    {reactants:['ماغنيسيوم','أكسجين'], products:['أكسيد الماغنيسيوم'], icon:'🔥', eq:'Mg + O₂ → MgO'},
    {reactants:['هيدروجين','أكسجين'], products:['ماء'], icon:'💧', eq:'H₂ + O₂ → H₂O'},
    {reactants:['حمض الهيدروكلوريك','هيدروكسيد الصوديوم'], products:['كلوريد الصوديوم','ماء'], icon:'🧪', eq:'HCl + NaOH → NaCl + H₂O'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📝 اختر التفاعل</div>
      <div class="ctrl-btns-grid-1">
        ${reactions.map((r,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="rxn-btn-${i}" onclick="simState.selected=${i};simState.t=0;document.querySelectorAll('[id^=rxn-btn-]').forEach((b,j)=>b.classList.toggle('active',j===${i}))">${r.icon} التفاعل ${i+1}</button>`).join('')}
      </div>
    </div>
    <div class="info-box" style="margin-top:8px">
      <b>قاعدة:</b> المواد المتفاعلة (Reactants) ← قبل السهم<br>
      المواد الناتجة (Products) ← بعد السهم
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ماذا يعني السهم في المعادلة اللفظية؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">السهم يعني "تُنتِج" أو "تتحول إلى". يُشير من المتفاعلات إلى النواتج. بعض العلماء يكتبون → بدلاً من كلمة "تُنتِج".</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9wordeq'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const ri=Math.max(0,S.selected||0);
    const rx=reactions[ri];
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#FFF8E1'); bg.addColorStop(1,'#FFF3CD');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Title
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(14,w*0.032)}px Tajawal`; c.textAlign='center';
    c.fillText('المعادلة اللفظية — كيف نصف التفاعل بالكلمات', w/2, h*0.07);

    const bw=Math.min(w*0.27,160), bh=Math.min(h*0.10,48), gap=Math.min(w*0.04,30);
    const totalR=rx.reactants.length;
    const totalP=rx.products.length;
    const arrowX=w*0.5;
    const startRx=arrowX - totalR*(bw+gap)/2 - bw/2 - gap/2;
    const startPx=arrowX + gap*1.5;
    const by=h*0.36;

    // Draw reactant boxes
    rx.reactants.forEach((name,i)=>{
      const bx=startRx + i*(bw+gap);
      const pulse=i===0?Math.sin(S.t*0.06)*3:0;
      c.shadowBlur=12+pulse; c.shadowColor='rgba(192,57,43,0.35)';
      c.fillStyle='#FFCDD2'; c.beginPath(); c.roundRect(bx,by-bh/2,bw,bh,10); c.fill();
      c.shadowBlur=0; c.strokeStyle='#C0392B'; c.lineWidth=2;
      c.beginPath(); c.roundRect(bx,by-bh/2,bw,bh,10); c.stroke();
      c.fillStyle='#C0392B'; c.font=`bold ${Math.max(11,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(name, bx+bw/2, by);
      if(i<totalR-1){
        c.fillStyle='#7A8A98'; c.font=`bold ${Math.max(14,w*0.028)}px Tajawal`;
        c.fillText('+', bx+bw+gap/2, by);
      }
    });

    // Arrow
    const aw=Math.min(w*0.07,50);
    const bounce=Math.sin(S.t*0.05)*3;
    c.strokeStyle='#1E2D3D'; c.lineWidth=3;
    c.beginPath(); c.moveTo(arrowX-aw/2,by+bounce); c.lineTo(arrowX+aw/2,by+bounce); c.stroke();
    c.fillStyle='#1E2D3D'; c.beginPath();
    c.moveTo(arrowX+aw/2,by+bounce);
    c.lineTo(arrowX+aw/2-10,by+bounce-7);
    c.lineTo(arrowX+aw/2-10,by+bounce+7);
    c.closePath(); c.fill();
    c.fillStyle='#7A8A98'; c.font=`${Math.max(9,w*0.017)}px Tajawal`; c.textAlign='center';
    c.fillText('تُنتِج', arrowX, by-aw*0.45);

    // Draw product boxes
    rx.products.forEach((name,i)=>{
      const bx=startPx + i*(bw+gap);
      const pulse=Math.sin(S.t*0.06+2)*3;
      c.shadowBlur=12+pulse; c.shadowColor='rgba(39,174,96,0.35)';
      c.fillStyle='#C8E6C9'; c.beginPath(); c.roundRect(bx,by-bh/2,bw,bh,10); c.fill();
      c.shadowBlur=0; c.strokeStyle='#27AE60'; c.lineWidth=2;
      c.beginPath(); c.roundRect(bx,by-bh/2,bw,bh,10); c.stroke();
      c.fillStyle='#27AE60'; c.font=`bold ${Math.max(11,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(name, bx+bw/2, by);
      if(i<totalP-1){
        c.fillStyle='#7A8A98'; c.font=`bold ${Math.max(14,w*0.028)}px Tajawal`;
        c.fillText('+', bx+bw+gap/2, by);
      }
    });

    // Labels
    c.textBaseline='alphabetic';
    c.fillStyle='rgba(192,57,43,0.7)'; c.font=`${Math.max(10,w*0.018)}px Tajawal`;
    c.textAlign='center';
    c.fillText('المواد المتفاعلة (Reactants)', startRx + totalR*(bw+gap)/2, by+bh/2+22);
    c.fillStyle='rgba(39,174,96,0.7)';
    c.fillText('المواد الناتجة (Products)', startPx + totalP*(bw+gap)/2, by+bh/2+22);

    // Full equation box
    const ebx=w*0.08, eby=h*0.62, ebw=w*0.84, ebh=h*0.12;
    c.fillStyle='rgba(26,143,168,0.08)'; c.beginPath(); c.roundRect(ebx,eby,ebw,ebh,12); c.fill();
    c.strokeStyle='rgba(26,143,168,0.25)'; c.lineWidth=1.5; c.beginPath(); c.roundRect(ebx,eby,ebw,ebh,12); c.stroke();
    c.fillStyle='#1A8FA8'; c.font=`bold ${Math.max(11,w*0.024)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('المعادلة الرمزية: ' + rx.eq, w/2, eby+ebh/2);

    // Legend
    const ly2=h*0.82;
    c.fillStyle='#1E2D3D'; c.font=`${Math.max(10,w*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText('💡 المعادلة اللفظية = وصف التفاعل بأسماء المواد بدون رموز كيميائية', w/2, ly2);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 7-1 TAB 2: المواد المتفاعلة والناتجة ───
function simG9WordEq2(){
  cancelAnimationFrame(animFrame);
  simState={t:0, chosen:null, score:0, answered:false};
  const S=simState;

  const quiz=[
    {eq:'كربون + أكسجين → ثاني أكسيد الكربون', reactants:['كربون','أكسجين'], products:['ثاني أكسيد الكربون'], q:'ما ناتج هذا التفاعل؟', opts:['كربون','أكسجين','ثاني أكسيد الكربون','مونوكسيد الكربون'], ans:2},
    {eq:'هيدروجين + نيتروجين → أمونيا', reactants:['هيدروجين','نيتروجين'], products:['أمونيا'], q:'ما المتفاعلات في هذه المعادلة؟', opts:['هيدروجين فقط','أمونيا','هيدروجين ونيتروجين','نيتروجين وأمونيا'], ans:2},
  ];
  const qi=Math.floor(S.t/400)%quiz.length;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🎯 تحدِّ نفسك</div>
      <div class="info-box">اقرأ المعادلة اللفظية واختر الإجابة الصحيحة</div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا يهمّنا تحديد المتفاعلات والنواتج؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">لأنها تحدد ما نحتاجه وما ننتجه في التفاعل. في الصناعة: نختار المتفاعلات ونُعظّم النواتج المطلوبة!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  const optColors=['#1A8FA8','#D4901A','#6B4E9A','#27AE60'];

  function draw(){
    if(currentSim!=='g9wordeq'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const q=quiz[Math.floor(S.t/600)%quiz.length];

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#E8F5E9'); bg.addColorStop(1,'#C8E6C9');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Equation display
    const ebx=w*0.06, eby=h*0.06, ebw=w*0.88, ebh=h*0.13;
    c.fillStyle='rgba(255,255,255,0.85)'; c.beginPath(); c.roundRect(ebx,eby,ebw,ebh,12); c.fill();
    c.strokeStyle='rgba(26,143,168,0.3)'; c.lineWidth=2; c.beginPath(); c.roundRect(ebx,eby,ebw,ebh,12); c.stroke();
    c.fillStyle='#1A8FA8'; c.font=`bold ${Math.max(12,w*0.025)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('⚗️ ' + q.eq, w/2, eby+ebh/2);

    // Question
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.027)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText('❓ ' + q.q, w/2, h*0.29);

    // Options
    const optW=Math.min(w*0.42,190), optH=Math.min(h*0.10,44), gx=Math.min(w*0.03,16), gy=Math.min(h*0.03,12);
    q.opts.forEach((opt,i)=>{
      const col=i%2, row=Math.floor(i/2);
      const ox=w*0.05 + col*(optW+gx) + (w-2*optW-gx)*0.05;
      const oy=h*0.34 + row*(optH+gy);
      const isChosen=S.chosen===i;
      const isCorrect=i===q.ans;
      let bg2, stroke;
      if(S.answered){ bg2=isCorrect?'#C8E6C9':isChosen?'#FFCDD2':'rgba(255,255,255,0.7)'; stroke=isCorrect?'#27AE60':isChosen?'#C0392B':'#ccc';}
      else { bg2=isChosen?optColors[i]+'33':'rgba(255,255,255,0.8)'; stroke=isChosen?optColors[i]:'#ccc'; }
      c.fillStyle=bg2; c.beginPath(); c.roundRect(ox,oy,optW,optH,10); c.fill();
      c.strokeStyle=stroke; c.lineWidth=2; c.beginPath(); c.roundRect(ox,oy,optW,optH,10); c.stroke();
      c.fillStyle=isChosen&&!S.answered?optColors[i]:'#1E2D3D';
      c.font=`${Math.max(10,w*0.020)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(opt, ox+optW/2, oy+optH/2);
    });

    // Feedback
    if(S.answered){
      const fb=S.chosen===q.ans?'✅ صحيح! '+q.eq:'❌ خطأ — الإجابة الصحيحة: '+q.opts[q.ans];
      c.fillStyle=S.chosen===q.ans?'#27AE60':'#C0392B';
      c.font=`bold ${Math.max(11,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText(fb, w/2, h*0.72);
    }

    animFrame=requestAnimationFrame(draw);
  }

  const cv2=document.getElementById('simCanvas');
  cv2.onclick=function(e){
    if(S.answered)return;
    const q=quiz[Math.floor(S.t/600)%quiz.length];
    const rect=cv2.getBoundingClientRect(), mx=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX-rect.left)*(cv2.width/rect.width), my=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientY-rect.top)*(cv2.height/rect.height);
    const w=cv2.width,h=cv2.height;
    const optW=Math.min(w*0.42,190), optH=Math.min(h*0.10,44), gx=Math.min(w*0.03,16), gy=Math.min(h*0.03,12);
    q.opts.forEach((opt,i)=>{
      const col=i%2,row=Math.floor(i/2);
      const ox=w*0.05+col*(optW+gx)+(w-2*optW-gx)*0.05, oy=h*0.34+row*(optH+gy);
      if(mx>=ox&&mx<=ox+optW&&my>=oy&&my<=oy+optH){ S.chosen=i; S.answered=true; }
    });
  };
  draw();
}

// ─── 7-1 TAB 3: تجربة احتراق الماغنيسيوم ───
function simG9WordEq3(){
  cancelAnimationFrame(animFrame);
  simState={t:0, burning:false, done:false, flame:0};
  const S=simState;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔥 تجربة: احتراق الماغنيسيوم</div>
      <button class="ctrl-btn" id="burn-btn" onclick="simState.burning=true;simState.done=false;simState.flame=0;this.disabled=true">🔥 أشعِل الشريط</button>
      <button class="ctrl-btn stop" style="margin-top:6px" onclick="simState.burning=false;simState.done=false;simState.flame=0;document.getElementById('burn-btn').disabled=false">🔄 إعادة</button>
    </div>
    <div class="info-box" style="margin-top:8px">
      <b>الملاحظة:</b> يحترق الماغنيسيوم بضوء أبيض ساطع<br>
      <b>الناتج:</b> مسحوق أبيض (أكسيد الماغنيسيوم)
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ماذا تستنتج؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">عند احتراق الماغنيسيوم في الهواء، يتحد مع أكسجين الهواء لينتج أكسيد الماغنيسيوم. المعادلة: ماغنيسيوم + أكسجين → أكسيد الماغنيسيوم. هذا تفاعل اتحاد!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9wordeq'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#1a1a2e'); bg.addColorStop(1,'#16213e');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    if(S.burning){ S.flame=Math.min(S.flame+1,80); if(S.flame>=80) S.done=true; }

    const stripX=w*0.48, stripBottom=h*0.72, stripLen=h*0.22;

    // Mg strip
    c.strokeStyle='#C0C0C0'; c.lineWidth=6; c.lineCap='round';
    c.beginPath(); c.moveTo(stripX, stripBottom); c.lineTo(stripX, stripBottom-stripLen); c.stroke();
    c.strokeStyle='#E8E8E8'; c.lineWidth=3;
    c.beginPath(); c.moveTo(stripX, stripBottom); c.lineTo(stripX, stripBottom-stripLen); c.stroke();

    // Flame
    if(S.burning && S.flame>0){
      const flameH=S.flame*2.5;
      const fx=stripX, fy=stripBottom-stripLen;
      for(let i=0;i<20;i++){
        const fh=flameH*(0.5+Math.random()*0.5);
        const fw=Math.min(w*0.06,30)*(1-i/20);
        const alpha=Math.max(0,1-i/18);
        const hue=Math.random()<0.5?`rgba(255,255,${Math.floor(Math.random()*100)},${alpha})`:`rgba(255,${Math.floor(150+Math.random()*100)},0,${alpha})`;
        c.fillStyle=hue;
        c.beginPath();
        c.ellipse(fx+(Math.random()-0.5)*fw, fy-fh*0.5, fw*0.5, fh*0.5, 0, 0, Math.PI*2);
        c.fill();
      }
      // White bright center
      c.shadowBlur=30; c.shadowColor='#ffffff';
      c.fillStyle='rgba(255,255,255,0.9)';
      c.beginPath(); c.ellipse(fx, fy-flameH*0.2, Math.min(w*0.02,12), Math.min(h*0.04,20), 0, 0, Math.PI*2); c.fill();
      c.shadowBlur=0;

      // Flying ash particles
      for(let i=0;i<8;i++){
        const angle=-Math.PI*0.5 + (Math.random()-0.5)*1.5;
        const dist=(S.flame*3+Math.random()*30);
        const ax=fx+Math.cos(angle)*dist, ay=fy+Math.sin(angle)*dist;
        c.fillStyle=`rgba(255,255,255,${0.4+Math.random()*0.5})`;
        c.beginPath(); c.arc(ax,ay,Math.random()*3+1,0,Math.PI*2); c.fill();
      }
    }

    // White powder result
    if(S.done){
      for(let i=0;i<30;i++){
        const px=stripX+(Math.random()-0.5)*(w*0.2), py=h*0.85+Math.random()*(h*0.08);
        c.fillStyle=`rgba(240,240,240,${0.4+Math.random()*0.6})`;
        c.beginPath(); c.arc(px,py,Math.random()*4+2,0,Math.PI*2); c.fill();
      }
      c.fillStyle='#E8E8E8'; c.font=`bold ${Math.max(12,w*0.025)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('MgO — أكسيد الماغنيسيوم (مسحوق أبيض)', w/2, h*0.94);
    }

    // Equation panel
    const eby=h*0.04;
    c.fillStyle='rgba(255,255,255,0.12)'; c.beginPath(); c.roundRect(w*0.05,eby,w*0.9,h*0.09,10); c.fill();
    c.fillStyle='#FFF'; c.font=`bold ${Math.max(11,w*0.023)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('ماغنيسيوم + أكسجين → أكسيد الماغنيسيوم', w/2, eby+h*0.045);

    // Stage labels
    c.fillStyle='rgba(255,255,255,0.7)'; c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    if(!S.burning) c.fillText('انقر "أشعل الشريط" لبدء التجربة 🔥', w/2, h*0.82);
    else if(!S.done) c.fillText('يحترق الماغنيسيوم بضوء أبيض ساطع...', w/2, h*0.82);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// ─── 7-2 TAB 1: حفظ الذرات (قانون بقاء المادة) ───
function simG9Balance1(){
  cancelAnimationFrame(animFrame);
  simState={t:0, eqi:0};
  const S=simState;

  const examples=[
    {label:'احتراق الهيدروجين', reactants:[{name:'H₂',count:2,col:'#3498DB'},{name:'O₂',count:1,col:'#E74C3C'}], products:[{name:'H₂O',count:2,col:'#1ABC9C'}], atoms:{H:{r:4,p:4},O:{r:2,p:2}}},
    {label:'احتراق الماغنيسيوم', reactants:[{name:'Mg',count:2,col:'#9B59B6'},{name:'O₂',count:1,col:'#E74C3C'}], products:[{name:'MgO',count:2,col:'#F39C12'}], atoms:{Mg:{r:2,p:2},O:{r:2,p:2}}},
    {label:'تفاعل الزنك مع HCl', reactants:[{name:'Zn',count:1,col:'#7F8C8D'},{name:'HCl',count:2,col:'#E74C3C'}], products:[{name:'ZnCl₂',count:1,col:'#2ECC71'},{name:'H₂',count:1,col:'#3498DB'}], atoms:{Zn:{r:1,p:1},H:{r:2,p:2},Cl:{r:2,p:2}}},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⚖️ اختر المعادلة</div>
      <div class="ctrl-btns-grid-1">
        ${examples.map((e,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="eq-btn-${i}" onclick="simState.eqi=${i};document.querySelectorAll('[id^=eq-btn-]').forEach((b,j)=>b.classList.toggle('active',j===${i}))">${e.label}</button>`).join('')}
      </div>
    </div>
    <div class="info-box" style="margin-top:8px"><b>قانون بقاء المادة:</b> عدد ذرات كل عنصر في المتفاعلات = عددها في النواتج</div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ماذا تستنتج عن الكتلة؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">كتلة المتفاعلات = كتلة النواتج دائماً! الذرات لا تُخلق ولا تُفنى في التفاعلات الكيميائية — تترتّب فقط بشكل مختلف.</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9balance'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const eq=examples[S.eqi||0];

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#E8EAF6'); bg.addColorStop(1,'#C5CAE9');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText('⚖️ قانون بقاء المادة — الذرات محفوظة', w/2, h*0.07);

    // Draw balance scale
    const scx=w*0.5, scy=h*0.55, armLen=w*0.3;
    const bob=Math.sin(S.t*0.04)*3;
    c.strokeStyle='#5D4037'; c.lineWidth=5;
    c.beginPath(); c.moveTo(scx,scy-h*0.05); c.lineTo(scx,scy+h*0.12); c.stroke(); // pillar
    c.beginPath(); c.moveTo(scx-armLen,scy+bob); c.lineTo(scx+armLen,scy-bob); c.stroke(); // arm

    // Left pan (reactants)
    c.strokeStyle='#5D4037'; c.lineWidth=2;
    const lpx=scx-armLen, lpy=scy+bob;
    c.beginPath(); c.moveTo(lpx,lpy); c.lineTo(lpx,lpy+h*0.12); c.stroke();
    c.beginPath(); c.ellipse(lpx,lpy+h*0.12,w*0.12,h*0.02,0,0,Math.PI*2); c.stroke();
    c.fillStyle='rgba(198,40,40,0.15)'; c.beginPath(); c.ellipse(lpx,lpy+h*0.12,w*0.12,h*0.02,0,0,Math.PI*2); c.fill();
    // Label
    c.fillStyle='#C62828'; c.font=`bold ${Math.max(11,w*0.020)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    const rLabel=eq.reactants.map(r=>r.count>1?r.count+'×'+r.name:r.name).join(' + ');
    c.fillText(rLabel, lpx, lpy+h*0.17);
    c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.fillStyle='#888';
    c.fillText('المتفاعلات', lpx, lpy+h*0.21);

    // Right pan (products)
    const rpx=scx+armLen, rpy=scy-bob;
    c.strokeStyle='#5D4037'; c.lineWidth=2;
    c.beginPath(); c.moveTo(rpx,rpy); c.lineTo(rpx,rpy+h*0.12); c.stroke();
    c.beginPath(); c.ellipse(rpx,rpy+h*0.12,w*0.12,h*0.02,0,0,Math.PI*2); c.stroke();
    c.fillStyle='rgba(27,136,71,0.15)'; c.beginPath(); c.ellipse(rpx,rpy+h*0.12,w*0.12,h*0.02,0,0,Math.PI*2); c.fill();
    c.fillStyle='#1B8847'; c.font=`bold ${Math.max(11,w*0.020)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    const pLabel=eq.products.map(p=>p.count>1?p.count+'×'+p.name:p.name).join(' + ');
    c.fillText(pLabel, rpx, rpy+h*0.17);
    c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.fillStyle='#888';
    c.fillText('النواتج', rpx, rpy+h*0.21);

    // Atom count panel
    const apx=w*0.06, apy=h*0.77, apw=w*0.88, aph=h*0.16;
    c.fillStyle='rgba(255,255,255,0.8)'; c.beginPath(); c.roundRect(apx,apy,apw,aph,10); c.fill();
    c.strokeStyle='rgba(93,64,55,0.2)'; c.lineWidth=1.5; c.beginPath(); c.roundRect(apx,apy,apw,aph,10); c.stroke();
    c.fillStyle='#5D4037'; c.font=`bold ${Math.max(11,w*0.020)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
    c.fillText('عدد الذرات', w/2, apy+6);
    const elements=Object.entries(eq.atoms);
    const cellW=(apw-20)/elements.length;
    elements.forEach(([el,{r,p}],i)=>{
      const ex=apx+10+i*cellW+cellW*0.1, ey=apy+aph*0.35;
      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(10,w*0.020)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(el+': متفاعلات='+r+' / نواتج='+p, ex+cellW*0.3, ey);
      c.fillStyle=r===p?'#27AE60':'#C0392B';
      c.font=`${Math.max(11,w*0.022)}px Tajawal`;
      c.fillText(r===p?'✅':'❌', ex+cellW*0.3, ey+aph*0.3);
    });

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 7-2 TAB 2: خطوات الموازنة ───
function simG9Balance2(){
  cancelAnimationFrame(animFrame);
  simState={t:0, step:0, eqi:0, coeffs:[1,1,1,1]};
  const S=simState;

  const equations=[
    {
      label:'H₂ + O₂ → H₂O',
      terms:[{f:'H₂',atoms:{H:2}},{f:'O₂',atoms:{O:2}},'→',{f:'H₂O',atoms:{H:2,O:1}}],
      balanced:[2,1,0,2],
      hint:'ابدأ بـ H: ضع 2 أمام H₂O، ثم O: 2 أمام H₂'
    },
    {
      label:'Mg + O₂ → MgO',
      terms:[{f:'Mg',atoms:{Mg:1}},{f:'O₂',atoms:{O:2}},'→',{f:'MgO',atoms:{Mg:1,O:1}}],
      balanced:[2,1,0,2],
      hint:'ضع 2 أمام Mg وأمام MgO لموازنة Mg، ثم O متوازن بالفعل'
    },
  ];

  const eq=equations[S.eqi||0];
  const coeff=[1,1,1,1];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⚖️ وازن المعادلة</div>
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn" onclick="simState.step=Math.max(0,simState.step-1)">⬅️ السابق</button>
        <button class="ctrl-btn action" onclick="simState.step=Math.min(3,simState.step+1)">التالي ➡️</button>
      </div>
      <button class="ctrl-btn stop" style="margin-top:6px" onclick="simState.step=0">🔄 إعادة</button>
    </div>
    <div class="info-box" style="margin-top:8px">
      <b>قاعدة الموازنة:</b><br>
      1️⃣ عدِّد ذرات كل جانب<br>
      2️⃣ غيِّر المعاملات فقط (لا الصِّيَغ!)<br>
      3️⃣ تحقق من التساوي
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا لا نغيّر الصيغة (مثلاً H₃ بدلاً من H₂)؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">لأن الصيغة تصف مركباً حقيقياً بطبيعته الكيميائية. H₂ هو الهيدروجين الجزيئي ولا يمكن تغيير طبيعة المادة في المعادلة!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  const steps=[
    {title:'الخطوة ١: اكتب المعادلة غير الموزونة', coeff:[1,1,1,1]},
    {title:'الخطوة ٢: عدِّد الذرات على كل جانب', coeff:[1,1,1,1]},
    {title:'الخطوة ٣: عدِّل المعاملات', coeff:[2,1,1,2]},
    {title:'✅ الخطوة ٤: تحقق من الموازنة', coeff:[2,1,1,2]},
  ];

  function draw(){
    if(currentSim!=='g9balance'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const st=steps[Math.min(S.step||0,3)];

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#FFF3E0'); bg.addColorStop(1,'#FFE0B2');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText(st.title, w/2, h*0.08);

    // Draw equation terms
    const terms=['H₂','O₂','→','H₂O'];
    const coeffs=st.coeff;
    const termW=Math.min(w*0.18,90), termH=Math.min(h*0.12,52);
    const totalW=terms.length*termW + 3*Math.min(w*0.03,20);
    const startX=(w-totalW)/2;
    const ty=h*0.32;
    let cx2=startX;

    terms.forEach((term,i)=>{
      if(term==='→'){
        c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(18,w*0.04)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
        c.fillText('→', cx2+termW/2, ty+termH/2);
        cx2+=termW;
        return;
      }
      const cf=coeffs[i<2?i:i+1]||1;
      const col=i<2?'rgba(192,57,43,0.1)':'rgba(39,174,96,0.1)';
      const stk=i<2?'#C0392B':'#27AE60';

      c.fillStyle=col; c.beginPath(); c.roundRect(cx2,ty,termW,termH,10); c.fill();
      c.strokeStyle=stk; c.lineWidth=2; c.beginPath(); c.roundRect(cx2,ty,termW,termH,10); c.stroke();

      c.fillStyle='#1E2D3D'; c.textAlign='center'; c.textBaseline='middle';
      if(cf>1){
        c.font=`bold ${Math.max(14,w*0.032)}px Tajawal`;
        c.fillText(cf+'×'+term, cx2+termW/2, ty+termH/2);
      } else {
        c.font=`bold ${Math.max(14,w*0.032)}px Tajawal`;
        c.fillText(term, cx2+termW/2, ty+termH/2);
      }
      cx2+=termW+Math.min(w*0.015,10);
    });

    // Atom count display (step 2+)
    if((S.step||0)>=1){
      const items=[
        {el:'H',left:coeffs[0]*2, right:coeffs[3]*2},
        {el:'O',left:coeffs[1]*2, right:coeffs[3]*1},
      ];
      const tabX=w*0.06, tabY=h*0.52, tabW=w*0.88/items.length, tabH=h*0.13;
      items.forEach((it,i)=>{
        const tx=tabX+i*tabW;
        const balanced=it.left===it.right;
        const highlight=(S.step||0)>=2?balanced:'';
        c.fillStyle=highlight?'rgba(39,174,96,0.12)':'rgba(255,255,255,0.7)';
        c.beginPath(); c.roundRect(tx+4,tabY,tabW-8,tabH,8); c.fill();
        c.strokeStyle=highlight?'#27AE60':'#ccc'; c.lineWidth=1.5; c.beginPath(); c.roundRect(tx+4,tabY,tabW-8,tabH,8); c.stroke();
        c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(12,w*0.024)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
        c.fillText('ذرات '+it.el, tx+tabW/2, tabY+6);
        c.font=`${Math.max(10,w*0.019)}px Tajawal`;
        c.fillStyle='#C0392B'; c.fillText('يسار: '+it.left, tx+tabW/2, tabY+tabH*0.4);
        c.fillStyle='#27AE60'; c.fillText('يمين: '+it.right, tx+tabW/2, tabY+tabH*0.65);
        if((S.step||0)>=2){ c.fillStyle=balanced?'#27AE60':'#C0392B'; c.font=`bold ${Math.max(14,w*0.030)}px Tajawal`; c.fillText(balanced?'✅':'🔧', tx+tabW/2, tabY+tabH*0.82); }
      });
    }

    // Final message
    if((S.step||0)>=3){
      c.fillStyle='rgba(39,174,96,0.12)'; c.beginPath(); c.roundRect(w*0.08,h*0.72,w*0.84,h*0.12,12); c.fill();
      c.fillStyle='#27AE60'; c.font=`bold ${Math.max(12,w*0.024)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('✅ المعادلة موزونة: 2H₂ + O₂ → 2H₂O', w/2, h*0.78);
    }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 7-2 TAB 3: تجربة H₂ + O₂ ───
function simG9Balance3(){
  cancelAnimationFrame(animFrame);
  simState={t:0, react:false, done:false, bubbles:[], drops:[]};
  const S=simState;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">💧 إنتاج الماء من عناصره</div>
      <button class="ctrl-btn action" id="react-btn" onclick="simState.react=true;this.disabled=true">⚡ افجُر الخليط</button>
      <button class="ctrl-btn stop" style="margin-top:6px" onclick="simState.react=false;simState.done=false;simState.bubbles=[];simState.drops=[];simState.t=0;document.getElementById('react-btn').disabled=false">🔄 إعادة</button>
    </div>
    <div class="info-box" style="margin-top:8px">
      <b>المعادلة الموزونة:</b><br>
      2H₂ + O₂ → 2H₂O<br>
      2 جزيء هيدروجين + 1 جزيء أكسجين = 2 جزيء ماء
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ماذا تستنتج؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">يتحد الهيدروجين والأكسجين بنسبة 2:1 لإنتاج الماء. المعاملات في المعادلة تمثل نسب الجزيئات. هذه النسبة ثابتة لا تتغيّر!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9balance'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#E3F2FD'); bg.addColorStop(1,'#BBDEFB');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // H2 molecules (blue) - 2 of them
    const mols=[
      {x:w*0.2, y:h*0.4, label:'H₂', col:'#3498DB', r:Math.min(w,h)*0.06},
      {x:w*0.35, y:h*0.5, label:'H₂', col:'#3498DB', r:Math.min(w,h)*0.06},
      {x:w*0.5, y:h*0.4, label:'O₂', col:'#E74C3C', r:Math.min(w,h)*0.07},
    ];

    if(!S.react){
      mols.forEach(m=>{
        const bounce=Math.sin(S.t*0.04+m.x)*4;
        c.shadowBlur=15; c.shadowColor=m.col+'66';
        c.fillStyle=m.col+'33'; c.beginPath(); c.arc(m.x,m.y+bounce,m.r,0,Math.PI*2); c.fill();
        c.shadowBlur=0; c.strokeStyle=m.col; c.lineWidth=2.5; c.beginPath(); c.arc(m.x,m.y+bounce,m.r,0,Math.PI*2); c.stroke();
        c.fillStyle=m.col; c.font=`bold ${Math.max(12,w*0.025)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(m.label, m.x, m.y+bounce);
      });

      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('2H₂ + O₂ ← جزيئات المتفاعلة', w/2, h*0.72);
    } else {
      // Explosion then water drops
      if(S.t<50){
        const alpha=S.t/50;
        for(let i=0;i<20;i++){
          const angle=Math.random()*Math.PI*2, dist=S.t*3*Math.random();
          c.fillStyle=`rgba(255,${Math.floor(150+Math.random()*105)},0,${1-alpha})`;
          c.beginPath(); c.arc(w*0.35+Math.cos(angle)*dist, h*0.45+Math.sin(angle)*dist, 5+Math.random()*8, 0, Math.PI*2); c.fill();
        }
        c.shadowBlur=40; c.shadowColor='#fff'; c.fillStyle='rgba(255,255,255,0.9)';
        c.beginPath(); c.arc(w*0.35,h*0.45,30*alpha,0,Math.PI*2); c.fill(); c.shadowBlur=0;
      } else {
        S.done=true;
        // Two water drops
        [[w*0.3,h*0.45],[w*0.6,h*0.45]].forEach(([dx,dy],i)=>{
          const bounce=Math.sin(S.t*0.05+i)*4;
          c.shadowBlur=20; c.shadowColor='#1A8FA888';
          c.fillStyle='rgba(26,143,168,0.3)'; c.beginPath(); c.arc(dx,dy+bounce,Math.min(w,h)*0.09,0,Math.PI*2); c.fill();
          c.shadowBlur=0; c.strokeStyle='#1A8FA8'; c.lineWidth=2.5; c.beginPath(); c.arc(dx,dy+bounce,Math.min(w,h)*0.09,0,Math.PI*2); c.stroke();
          c.fillStyle='#1A8FA8'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
          c.fillText('H₂O', dx, dy+bounce);
        });
        c.fillStyle='#27AE60'; c.font=`bold ${Math.max(12,w*0.025)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
        c.fillText('✅ 2H₂ + O₂ → 2H₂O — ناتجان من الماء!', w/2, h*0.72);
      }
    }

    // Title
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText('تجربة احتراق الهيدروجين في الأكسجين', w/2, h*0.08);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// ─── 7-3 TAB 1: رموز الحالة الفيزيائية ───
function simG9StateSym1(){
  cancelAnimationFrame(animFrame);
  simState={t:0, quiz:[], qi:0, chosen:-1, answered:false};
  const S=simState;

  const states=[
    {sym:'(s)', name:'صلب', ar:'Solid', col:'#8D6E63', icon:'🪨', ex:'CaCO₃(s) — الرخام صلب'},
    {sym:'(l)', name:'سائل', ar:'Liquid', col:'#1A8FA8', icon:'💧', ex:'H₂O(l) — الماء سائل'},
    {sym:'(g)', name:'غاز', ar:'Gas', col:'#7B1FA2', icon:'💨', ex:'CO₂(g) — غاز ثاني أكسيد الكربون'},
    {sym:'(aq)', name:'محلول مائي', ar:'Aqueous', col:'#27AE60', icon:'🧪', ex:'NaCl(aq) — ملح مذاب في الماء'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🏷️ رموز الحالة الفيزيائية</div>
      <div class="info-box">تُضاف هذه الرموز بعد الصيغة الكيميائية لتوضيح حالة المادة</div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا نُضيف رموز الحالة؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">رموز الحالة تُكمل المعلومات — نفس المادة قد تكون في حالات مختلفة. مثلاً H₂O قد تكون ثلجاً (s) أو ماءً (l) أو بخاراً (g)، وهذا يؤثر في التفاعل!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9statesym'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#F3E5F5'); bg.addColorStop(1,'#E1BEE7');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.027)}px Tajawal`; c.textAlign='center';
    c.fillText('رموز الحالة الفيزيائية في المعادلات الكيميائية', w/2, h*0.07);

    const cardW=Math.min(w*0.43,190), cardH=Math.min(h*0.22,100);
    const gapX=(w-2*cardW)/3, gapY=Math.min(h*0.03,16);
    states.forEach((st,i)=>{
      const col=i%2, row=Math.floor(i/2);
      const cx2=gapX + col*(cardW+gapX), cy2=h*0.14 + row*(cardH+gapY);
      const bounce=Math.sin(S.t*0.04+i*1.2)*3;

      c.shadowBlur=15; c.shadowColor=st.col+'44';
      c.fillStyle=st.col+'18'; c.beginPath(); c.roundRect(cx2,cy2+bounce,cardW,cardH,14); c.fill();
      c.shadowBlur=0; c.strokeStyle=st.col; c.lineWidth=2.5; c.beginPath(); c.roundRect(cx2,cy2+bounce,cardW,cardH,14); c.stroke();

      c.fillStyle=st.col; c.font=`bold ${Math.max(18,w*0.040)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
      c.fillText(st.sym, cx2+cardW/2, cy2+bounce+8);
      c.font=`bold ${Math.max(13,w*0.025)}px Tajawal`;
      c.fillText(st.name+' — '+st.icon, cx2+cardW/2, cy2+bounce+cardH*0.38);
      c.fillStyle='#555'; c.font=`${Math.max(9,w*0.015)}px Tajawal`;
      c.fillText(st.ex, cx2+cardW/2, cy2+bounce+cardH*0.68);
    });

    // Example equation
    const eby=h*0.67, ebh=h*0.12;
    c.fillStyle='rgba(255,255,255,0.85)'; c.beginPath(); c.roundRect(w*0.05,eby,w*0.9,ebh,10); c.fill();
    c.strokeStyle='rgba(107,78,154,0.3)'; c.lineWidth=1.5; c.beginPath(); c.roundRect(w*0.05,eby,w*0.9,ebh,10); c.stroke();
    c.fillStyle='#4A148C'; c.font=`bold ${Math.max(11,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('2K(s) + 2H₂O(l) → 2KOH(aq) + H₂(g)', w/2, eby+ebh/2);

    // Animated pulse around aq symbol
    const pulse=0.5+0.5*Math.sin(S.t*0.07);
    c.shadowBlur=10*pulse; c.shadowColor='#27AE60';
    c.fillStyle='rgba(39,174,96,0.2)'; c.beginPath(); c.arc(w*0.68,eby+ebh/2,Math.min(w,h)*0.055*(0.9+0.1*pulse),0,Math.PI*2); c.fill();
    c.shadowBlur=0;

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 7-3 TAB 2: تفاعل البوتاسيوم مع الماء ───
function simG9StateSym2(){
  cancelAnimationFrame(animFrame);
  simState={t:0, added:false, reacting:false, particles:[]};
  const S=simState;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">💥 تفاعل K مع الماء</div>
      <button class="ctrl-btn action" id="k-btn" onclick="simState.added=true;setTimeout(()=>simState.reacting=true,1000);this.disabled=true">➕ أضِف قطعة بوتاسيوم</button>
      <button class="ctrl-btn stop" style="margin-top:6px" onclick="simState.added=false;simState.reacting=false;simState.particles=[];simState.t=0;document.getElementById('k-btn').disabled=false">🔄 إعادة</button>
    </div>
    <div class="info-box" style="margin-top:8px">
      <b>المعادلة مع رموز الحالة:</b><br>
      2K(s) + 2H₂O(l) →<br>
      2KOH(aq) + H₂(g)
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ماذا تستنتج عن رموز الحالة؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">K صلب (s) ← يبدأ كقطعة صلبة. H₂O سائل (l) ← الماء في درجة الغرفة. KOH محلول مائي (aq) ← ينذوب في الماء. H₂ غاز (g) ← يتصاعد كفقاعات. رموز الحالة تُوضّح ما يحدث بالفعل!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9statesym'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;

    // Background
    c.fillStyle='#1a3a4a'; c.fillRect(0,0,w,h);

    // Beaker (water)
    const bx=w*0.2, by=h*0.2, bw=w*0.6, bh=h*0.65;
    c.fillStyle='rgba(26,143,168,0.25)'; c.fillRect(bx,by,bw,bh);
    c.strokeStyle='rgba(255,255,255,0.4)'; c.lineWidth=3;
    c.beginPath(); c.moveTo(bx,by); c.lineTo(bx,by+bh); c.lineTo(bx+bw,by+bh); c.lineTo(bx+bw,by); c.stroke();
    c.fillStyle='rgba(26,143,168,0.6)'; c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.textAlign='left'; c.textBaseline='alphabetic';
    c.fillText('H₂O(l)', bx+8, by+bh-8);

    // K piece
    if(S.added){
      const kx=bx+bw/2, ky=by+(S.reacting?Math.min(bh*0.4,bh*0.4*(Math.min(S.t-50,40)/40)):bh*0.1);
      c.fillStyle='#B0BEC5'; c.beginPath(); c.roundRect(kx-15,ky-12,30,24,6); c.fill();
      c.strokeStyle='#78909C'; c.lineWidth=2; c.beginPath(); c.roundRect(kx-15,ky-12,30,24,6); c.stroke();
      c.fillStyle='#37474F'; c.font=`bold ${Math.max(10,w*0.020)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('K(s)', kx, ky);
    }

    // Reaction effects
    if(S.reacting && S.t>50){
      // Bubbles (H2 gas)
      if(Math.random()<0.3) S.particles.push({x:bx+bw*0.3+Math.random()*bw*0.4, y:by+bh*0.6, r:Math.random()*5+2, vy:-1.5-Math.random()*2});
      S.particles=S.particles.filter(p=>p.y>by);
      S.particles.forEach(p=>{ p.y+=p.vy; p.x+=Math.sin(p.y*0.1)*1.5; c.strokeStyle='rgba(255,255,255,0.6)'; c.lineWidth=1.5; c.beginPath(); c.arc(p.x,p.y,p.r,0,Math.PI*2); c.stroke(); });

      // Color change (KOH dissolving - purple tint)
      const alpha=Math.min((S.t-50)/100,0.3);
      c.fillStyle=`rgba(100,200,100,${alpha})`; c.fillRect(bx+2,by,bw-4,bh);

      // Flame on K surface
      if(S.t<150){
        for(let i=0;i<8;i++){
          const flx=bx+bw/2+(Math.random()-0.5)*30, fly=by+bh*0.3;
          c.fillStyle=`rgba(255,${Math.floor(100+Math.random()*155)},0,${0.5+Math.random()*0.4})`;
          c.beginPath(); c.ellipse(flx,fly,4+Math.random()*6,8+Math.random()*10,0,0,Math.PI*2); c.fill();
        }
      }

      // Labels
      c.fillStyle='rgba(255,255,255,0.9)'; c.font=`bold ${Math.max(10,w*0.019)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('H₂(g) ↑ — فقاعات الهيدروجين', w*0.5, by-10);
      c.fillStyle='rgba(100,230,130,0.9)'; c.fillText('KOH(aq) — يذوب في الماء', w*0.5, by+bh+20);
    }

    // Equation
    c.fillStyle='rgba(255,255,255,0.85)'; c.beginPath(); c.roundRect(w*0.03,h*0.88,w*0.94,h*0.1,10); c.fill();
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(10,w*0.019)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('2K(s) + 2H₂O(l) → 2KOH(aq) + H₂(g)', w/2, h*0.93);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 7-3 TAB 3: المعادلات الأيونية ───
function simG9StateSym3(){
  cancelAnimationFrame(animFrame);
  simState={t:0, step:0};
  const S=simState;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔋 المعادلات الأيونية الصافية</div>
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn" onclick="simState.step=Math.max(0,simState.step-1)">⬅️ رجوع</button>
        <button class="ctrl-btn action" onclick="simState.step=Math.min(3,simState.step+1)">التالي ➡️</button>
      </div>
    </div>
    <div class="info-box" style="margin-top:8px">
      الأيونات المتفرجة (Spectator ions): تظهر على كلا الجانبين ولا تشارك في التفاعل — نحذفها!
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ما فائدة المعادلة الأيونية الصافية؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">تُظهر ما يحدث فعلاً على مستوى الأيونات. مثلاً: أي حمض + أي قاعدة قوية تعطي نفس المعادلة الأيونية H⁺ + OH⁻ → H₂O. هذا يُسهّل الفهم والتعميم!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  const stepsData=[
    {title:'المعادلة الكاملة الموزونة', eq:'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)'},
    {title:'فصل الأيونات (المذابة في الماء)', eq:'[H⁺ + Cl⁻] + [Na⁺ + OH⁻] → [Na⁺ + Cl⁻] + H₂O'},
    {title:'تحديد الأيونات المتفرجة (تُشطب)', eq:'[H⁺ + ~~Cl⁻~~] + [~~Na⁺~~ + OH⁻] → [~~Na⁺~~ + ~~Cl⁻~~] + H₂O', crossed:['Na⁺','Cl⁻']},
    {title:'✅ المعادلة الأيونية الصافية', eq:'H⁺(aq) + OH⁻(aq) → H₂O(l)'},
  ];

  function draw(){
    if(currentSim!=='g9statesym'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const st=stepsData[Math.min(S.step||0,3)];

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#E0F2F1'); bg.addColorStop(1,'#B2DFDB');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Step indicator
    [0,1,2,3].forEach(i=>{
      const sx=w*0.1+i*(w*0.8/3), sy=h*0.07;
      c.fillStyle=i<=(S.step||0)?'#1A8FA8':'rgba(0,0,0,0.15)';
      c.beginPath(); c.arc(sx,sy,Math.min(w,h)*0.028,0,Math.PI*2); c.fill();
      c.fillStyle='white'; c.font=`bold ${Math.max(10,w*0.019)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(i+1, sx, sy);
    });

    // Step title
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText('الخطوة '+(S.step+1)+': '+st.title, w/2, h*0.16);

    // Equation box
    const eby=h*0.22, ebh=h*0.14;
    const col=(S.step||0)===3?'rgba(39,174,96,0.15)':'rgba(255,255,255,0.8)';
    c.fillStyle=col; c.beginPath(); c.roundRect(w*0.04,eby,w*0.92,ebh,12); c.fill();
    c.strokeStyle=(S.step||0)===3?'#27AE60':'rgba(26,143,168,0.3)'; c.lineWidth=2; c.beginPath(); c.roundRect(w*0.04,eby,w*0.92,ebh,12); c.stroke();
    c.fillStyle=(S.step||0)===3?'#27AE60':'#1A8FA8'; c.font=`bold ${Math.max(11,w*0.021)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(st.eq.replace(/~~/g,''), w/2, eby+ebh/2);

    // Ion visualization
    if((S.step||0)>=1){
      const ions=[
        {label:'H⁺', col:'#E74C3C', x:w*0.13, spectator:false},
        {label:'Cl⁻', col:'#7F8C8D', x:w*0.26, spectator:true},
        {label:'Na⁺', col:'#7F8C8D', x:w*0.55, spectator:true},
        {label:'OH⁻', col:'#27AE60', x:w*0.68, spectator:false},
        {label:'→', col:'#1E2D3D', x:w*0.42, spectator:false, arrow:true},
        {label:'H₂O', col:'#1A8FA8', x:w*0.84, spectator:false, product:true},
      ];
      const iy=h*0.48, ir=Math.min(w,h)*0.07;
      ions.forEach(ion=>{
        if(ion.arrow){ c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(20,w*0.04)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle'; c.fillText('→',ion.x,iy); return; }
        const isSpectator=ion.spectator&&(S.step||0)>=2;
        const alpha=isSpectator?0.3:1;
        c.globalAlpha=alpha;
        c.shadowBlur=isSpectator?0:12; c.shadowColor=ion.col+'88';
        c.fillStyle=ion.col+'22'; c.beginPath(); c.arc(ion.x,iy,ir,0,Math.PI*2); c.fill();
        c.shadowBlur=0; c.strokeStyle=ion.col; c.lineWidth=isSpectator?1:2.5; c.beginPath(); c.arc(ion.x,iy,ir,0,Math.PI*2); c.stroke();
        c.fillStyle=ion.col; c.font=`bold ${Math.max(10,w*0.020)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(ion.label, ion.x, iy);
        c.globalAlpha=1;
        if(isSpectator){
          c.strokeStyle='rgba(150,0,0,0.6)'; c.lineWidth=2;
          c.beginPath(); c.moveTo(ion.x-ir*0.7,iy-ir*0.7); c.lineTo(ion.x+ir*0.7,iy+ir*0.7); c.stroke();
        }
      });
    }

    // Labels
    if((S.step||0)>=2){
      c.fillStyle='#C0392B'; c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('أيونات متفرجة — تُحذف', w*0.245, h*0.62);
      c.fillStyle='#1A8FA8'; c.fillText('تشارك في التفاعل', w*0.72, h*0.62);
    }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// الصف التاسع — الوحدة الثامنة: تكوين الأملاح
// ══════════════════════════════════════════════════════════

// ─── 8-1 TAB 1: حمض + قاعدة (تعادل) ───
function simG9SaltAcid1(){
  cancelAnimationFrame(animFrame);
  simState={t:0, acid:0, base:0, drops:0, ph:7, neutralised:false, acidVol:50, baseVol:50};
  const S=simState;

  const pairs=[
    {acid:'HCl',base:'NaOH', salt:'NaCl', fullName:'كلوريد الصوديوم', acid_name:'حمض الهيدروكلوريك', base_name:'هيدروكسيد الصوديوم'},
    {acid:'H₂SO₄',base:'KOH', salt:'K₂SO₄', fullName:'كبريتات البوتاسيوم', acid_name:'حمض الكبريتيك', base_name:'هيدروكسيد البوتاسيوم'},
    {acid:'HNO₃',base:'NaOH', salt:'NaNO₃', fullName:'نترات الصوديوم', acid_name:'حمض النيتريك', base_name:'هيدروكسيد الصوديوم'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧪 اختر التفاعل</div>
      <div class="ctrl-btns-grid-1">
        ${pairs.map((p,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="pair-btn-${i}" onclick="simState.pairIdx=${i};simState.ph=7;simState.drops=0;simState.neutralised=false;document.querySelectorAll('[id^=pair-btn-]').forEach((b,j)=>b.classList.toggle('active',j===${i}))">${p.acid} + ${p.base}</button>`).join('')}
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🔬 أضِف قطرات الحمض</div>
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn stop" onclick="if(simState.ph>1){simState.ph=Math.max(1,simState.ph-1.5);simState.drops++}">+ قطرة حمض</button>
        <button class="ctrl-btn action" onclick="if(simState.ph<13){simState.ph=Math.min(13,simState.ph+1.5);simState.drops++}">+ قطرة قاعدة</button>
      </div>
      <button class="ctrl-btn" style="margin-top:6px" onclick="simState.ph=7;simState.drops=0;simState.neutralised=false">🔄 إعادة</button>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ماذا تستنتج عن تفاعل التعادل؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الحمض يُعادل القاعدة تماماً عند pH=7. الناتج دائماً ملح + ماء. الملح يعتمد على نوع الحمض والقاعدة: HCl + NaOH → NaCl + H₂O. هذه أهم طرق تحضير الأملاح!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9saltacid'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const pair=pairs[S.pairIdx||0];
    const ph=S.ph||7;
    if(Math.abs(ph-7)<0.5) S.neutralised=true;

    // pH color
    const phColors={0:'#8B0000',1:'#C0392B',2:'#E74C3C',3:'#E67E22',4:'#F39C12',5:'#F1C40F',6:'#ABEBC6',7:'#27AE60',8:'#1ABC9C',9:'#16A085',10:'#1A8FA8',11:'#2980B9',12:'#1F618D',13:'#154360'};
    const phFloor=Math.floor(ph);
    const solutionCol=phColors[Math.max(0,Math.min(13,phFloor))]||'#27AE60';

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#FAFAFA'); bg.addColorStop(1,'#F0F0F0');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Beaker
    const bx=w*0.22, by=h*0.12, bw=w*0.56, bh=h*0.55;
    c.fillStyle=solutionCol+'44'; c.fillRect(bx,by+bh*0.05,bw,bh*0.95);
    c.strokeStyle='#90A4AE'; c.lineWidth=4;
    c.beginPath(); c.moveTo(bx,by); c.lineTo(bx,by+bh); c.lineTo(bx+bw,by+bh); c.lineTo(bx+bw,by); c.stroke();

    // Solution particles
    for(let i=0;i<15;i++){
      const px=bx+10+Math.random()*(bw-20), py=by+bh*0.1+Math.random()*bh*0.85;
      const isH=ph<7, col2=isH?'#E74C3C88':'#27AE6088';
      c.fillStyle=col2; c.beginPath(); c.arc(px,py,3,0,Math.PI*2); c.fill();
    }

    // pH meter
    const pmx=bx+bw+Math.min(w*0.04,16), pmy=by, pmh=bh;
    c.fillStyle='#ECEFF1'; c.beginPath(); c.roundRect(pmx,pmy,Math.min(w*0.12,55),pmh,8); c.fill();
    c.strokeStyle='#90A4AE'; c.lineWidth=2; c.beginPath(); c.roundRect(pmx,pmy,Math.min(w*0.12,55),pmh,8); c.stroke();
    const needle=pmy + pmh*(1-ph/14);
    c.fillStyle=solutionCol; c.fillRect(pmx+4,needle,Math.min(w*0.12,55)-8,pmh-(needle-pmy));
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(10,w*0.021)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('pH', pmx+Math.min(w*0.06,27.5), pmy-15);
    c.font=`bold ${Math.max(12,w*0.026)}px Tajawal`;
    c.fillText(ph.toFixed(1), pmx+Math.min(w*0.06,27.5), needle-12);

    // Status
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(12,w*0.025)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    const status=ph<6.5?'🍋 محلول حمضي':ph>7.5?'🧼 محلول قلوي':'⚖️ متعادل — pH = 7';
    c.fillText(status, w*0.35, by+bh+30);

    // Equation
    const eby=h*0.79, ebh=h*0.12;
    const ecol=S.neutralised?'rgba(39,174,96,0.15)':'rgba(255,255,255,0.8)';
    c.fillStyle=ecol; c.beginPath(); c.roundRect(w*0.04,eby,w*0.92,ebh,10); c.fill();
    c.fillStyle=S.neutralised?'#27AE60':'#1E2D3D'; c.font=`bold ${Math.max(10,w*0.019)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(`${pair.acid} + ${pair.base} → ${pair.salt} + H₂O`, w/2, eby+ebh*0.4);
    if(S.neutralised){
      c.fillStyle='rgba(39,174,96,0.7)'; c.font=`${Math.max(9,w*0.016)}px Tajawal`;
      c.fillText(`✅ الملح الناتج: ${pair.fullName}`, w/2, eby+ebh*0.75);
    }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 8-1 TAB 2: حمض + أكسيد فلزي ───
function simG9SaltAcid2(){
  cancelAnimationFrame(animFrame);
  simState={t:0, selected:0, reacting:false, progress:0};
  const S=simState;

  const oxides=[
    {oxide:'CuO', acid:'H₂SO₄', salt:'CuSO₄', water:'H₂O', name:'كبريتات النحاس(II)', color:'#1A8FA8', oxColor:'#8B4513', desc:'بلورات زرقاء'},
    {oxide:'MgO', acid:'HCl', salt:'MgCl₂', water:'H₂O', name:'كلوريد الماغنيسيوم', color:'#27AE60', oxColor:'#FFFFFF', desc:'محلول عديم اللون'},
    {oxide:'Na₂O', acid:'HCl', salt:'NaCl', water:'H₂O', name:'كلوريد الصوديوم', color:'#F39C12', oxColor:'#F5F5F5', desc:'ملح الطعام'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔥 حمض + أكسيد فلزي → ملح + ماء</div>
      <div class="ctrl-btns-grid-1">
        ${oxides.map((o,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="ox-btn-${i}" onclick="simState.selected=${i};simState.reacting=false;simState.progress=0;document.querySelectorAll('[id^=ox-btn-]').forEach((b,j)=>b.classList.toggle('active',j===${i}))">${o.oxide} + ${o.acid}</button>`).join('')}
      </div>
    </div>
    <div class="ctrl-section">
      <button class="ctrl-btn action" onclick="simState.reacting=true">⚗️ ابدأ التفاعل</button>
      <button class="ctrl-btn stop" style="margin-top:6px" onclick="simState.reacting=false;simState.progress=0">🔄 إعادة</button>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ما الفرق عن تفاعل الحمض مع القاعدة؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">التفاعل مماثل — الناتج ملح + ماء. لكن الأكسيد الفلزي صلب لا سائل. لذا نُضيف فائضاً منه ونُرشّح الزائد. لا يوجد كاشف هنا لتحديد نقطة التعادل!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9saltacid'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    if(S.reacting && S.progress<100) S.progress+=0.5;
    const ox=oxides[S.selected||0];
    const prog=S.progress||0;

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#FFF8E1'); bg.addColorStop(1,'#FFE082');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText('حمض + أكسيد فلزي → ملح + ماء', w/2, h*0.07);

    // Left beaker (acid)
    const lbx=w*0.04, lby=h*0.15, lbw=w*0.28, lbh=h*0.45;
    const acidAlpha=Math.max(0,1-prog/80);
    c.fillStyle=`rgba(231,76,60,${0.2*acidAlpha})`; c.fillRect(lbx,lby,lbw,lbh);
    c.strokeStyle='#90A4AE'; c.lineWidth=3;
    c.beginPath(); c.moveTo(lbx,lby); c.lineTo(lbx,lby+lbh); c.lineTo(lbx+lbw,lby+lbh); c.lineTo(lbx+lbw,lby); c.stroke();
    c.fillStyle='#C0392B'; c.font=`bold ${Math.max(11,w*0.020)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText(ox.acid, lbx+lbw/2, lby+lbh+18);
    c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.fillStyle='#888';
    c.fillText('الحمض', lbx+lbw/2, lby+lbh+32);

    // Right beaker (oxide)
    const rbx=w*0.68, rby=h*0.15, rbw=w*0.28, rbh=h*0.45;
    const oxAlpha=Math.max(0,1-prog/80);
    c.fillStyle=`rgba(139,69,19,${0.15*oxAlpha})`; c.fillRect(rbx,rby,rbw,rbh);
    c.strokeStyle='#90A4AE'; c.lineWidth=3;
    c.beginPath(); c.moveTo(rbx,rby); c.lineTo(rbx,rby+rbh); c.lineTo(rbx+rbw,rby+rbh); c.lineTo(rbx+rbw,rby); c.stroke();
    // Oxide powder particles
    for(let i=0;i<12;i++){
      if(Math.random()<oxAlpha){
        c.fillStyle=ox.oxColor+'CC'; c.beginPath(); c.arc(rbx+10+Math.random()*(rbw-20), rby+rbh*0.4+Math.random()*rbh*0.5, 4+Math.random()*4,0,Math.PI*2); c.fill();
      }
    }
    c.fillStyle='#8D6E63'; c.font=`bold ${Math.max(11,w*0.020)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText(ox.oxide, rbx+rbw/2, rby+rbh+18);
    c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.fillStyle='#888';
    c.fillText('أكسيد فلزي', rbx+rbw/2, rby+rbh+32);

    // Arrow
    if(S.reacting){
      c.strokeStyle=ox.color; c.lineWidth=3;
      const ax1=lbx+lbw+5, ax2=rbx-5, ay=lby+lbh/2;
      c.beginPath(); c.moveTo(ax1,ay); c.lineTo(ax2,ay); c.stroke();
      c.fillStyle=ox.color; c.beginPath(); c.moveTo(ax2,ay); c.lineTo(ax2-12,ay-7); c.lineTo(ax2-12,ay+7); c.closePath(); c.fill();
    }

    // Product beaker (center, appears when progress>50)
    if(prog>30){
      const pbx=w*0.34, pby=h*0.55, pbw=w*0.32, pbh=h*0.3;
      const alpha=Math.min((prog-30)/40,1);
      c.globalAlpha=alpha;
      c.fillStyle=ox.color+'33'; c.fillRect(pbx,pby,pbw,pbh);
      c.strokeStyle='#90A4AE'; c.lineWidth=3;
      c.beginPath(); c.moveTo(pbx,pby); c.lineTo(pbx,pby+pbh); c.lineTo(pbx+pbw,pby+pbh); c.lineTo(pbx+pbw,pby); c.stroke();
      c.fillStyle=ox.color; c.font=`bold ${Math.max(12,w*0.024)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText(ox.salt, pbx+pbw/2, pby+pbh+18);
      c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.fillStyle='#666';
      c.fillText(ox.name+' + H₂O', pbx+pbw/2, pby+pbh+34);
      c.globalAlpha=1;
    }

    // Equation
    const eby=h*0.87, ebh=h*0.1;
    c.fillStyle='rgba(255,255,255,0.8)'; c.beginPath(); c.roundRect(w*0.04,eby,w*0.92,ebh,10); c.fill();
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(10,w*0.020)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(`${ox.oxide}(s) + ${ox.acid}(aq) → ${ox.salt}(aq) + H₂O(l)`, w/2, eby+ebh/2);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 8-1 TAB 3: جدول الأملاح المتكوّنة ───
function simG9SaltAcid3(){
  cancelAnimationFrame(animFrame);
  simState={t:0, selAcid:0, selBase:0};
  const S=simState;

  const acids=['HCl', 'H₂SO₄', 'HNO₃'];
  const bases=['NaOH', 'KOH', 'MgO', 'CuO'];
  const saltTable=[
    ['NaCl','Na₂SO₄','NaNO₃'],
    ['KCl','K₂SO₄','KNO₃'],
    ['MgCl₂','MgSO₄','Mg(NO₃)₂'],
    ['CuCl₂','CuSO₄','Cu(NO₃)₂'],
  ];
  const saltNames=[
    ['كلوريد الصوديوم','كبريتات الصوديوم','نترات الصوديوم'],
    ['كلوريد البوتاسيوم','كبريتات البوتاسيوم','نترات البوتاسيوم'],
    ['كلوريد الماغنيسيوم','كبريتات الماغنيسيوم','نترات الماغنيسيوم'],
    ['كلوريد النحاس(II)','كبريتات النحاس(II)','نترات النحاس(II)'],
  ];
  const saltColors=['#27AE60','#1A8FA8','#D4901A','#6B4E9A'];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🏆 جدول الأملاح — اختر الحمض والقاعدة</div>
      <div class="ctrl-label" style="font-size:13px;margin-top:4px">الحمض:</div>
      <div class="ctrl-btns-grid">
        ${acids.map((a,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="acid-btn-${i}" onclick="simState.selAcid=${i};document.querySelectorAll('[id^=acid-btn-]').forEach((b,j)=>b.classList.toggle('active',j===${i}))">${a}</button>`).join('')}
      </div>
      <div class="ctrl-label" style="font-size:13px;margin-top:6px">القاعدة/الأكسيد:</div>
      <div class="ctrl-btns-grid-1">
        ${bases.map((b,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="base-btn-${i}" onclick="simState.selBase=${i};document.querySelectorAll('[id^=base-btn-]').forEach((b2,j)=>b2.classList.toggle('active',j===${i}))">${b}</button>`).join('')}
      </div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9saltacid'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const ai=S.selAcid||0, bi=S.selBase||0;
    const salt=saltTable[bi][ai];
    const saltName=saltNames[bi][ai];
    const saltCol=saltColors[bi];

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#E8EAF6'); bg.addColorStop(1,'#C5CAE9');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText('🏆 جدول تكوين الأملاح', w/2, h*0.07);

    // Salt display
    const pulse=0.5+0.5*Math.sin(S.t*0.06);
    const sr=Math.min(w,h)*0.18*(0.95+0.05*pulse);
    const sx=w*0.5, sy=h*0.34;
    c.shadowBlur=25*pulse; c.shadowColor=saltCol+'88';
    c.fillStyle=saltCol+'22'; c.beginPath(); c.arc(sx,sy,sr,0,Math.PI*2); c.fill();
    c.shadowBlur=0; c.strokeStyle=saltCol; c.lineWidth=3; c.beginPath(); c.arc(sx,sy,sr,0,Math.PI*2); c.stroke();
    c.fillStyle=saltCol; c.font=`bold ${Math.max(18,w*0.045)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(salt, sx, sy-8);
    c.font=`${Math.max(10,w*0.018)}px Tajawal`; c.fillStyle='#555';
    c.fillText(saltName, sx, sy+sr*0.55);

    // Equation
    const eby=h*0.62, ebh=h*0.12;
    c.fillStyle='rgba(255,255,255,0.85)'; c.beginPath(); c.roundRect(w*0.04,eby,w*0.92,ebh,10); c.fill();
    c.strokeStyle=saltCol+'44'; c.lineWidth=2; c.beginPath(); c.roundRect(w*0.04,eby,w*0.92,ebh,10); c.stroke();
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(11,w*0.021)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(`${acids[ai]} + ${bases[bi]} → ${salt} + H₂O`, w/2, eby+ebh/2);

    // Acid column label
    c.fillStyle='#C0392B'; c.font=`bold ${Math.max(12,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText('الحمض: '+acids[ai], w*0.25, h*0.55);
    // Base column label
    c.fillStyle='#27AE60'; c.fillText('القاعدة: '+bases[bi], w*0.75, h*0.55);

    // Salt type note
    const typeNote=ai===0?'كلوريد ← من HCl':ai===1?'كبريتات ← من H₂SO₄':'نترات ← من HNO₃';
    c.fillStyle='rgba(107,78,154,0.7)'; c.font=`${Math.max(9,w*0.017)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText('💡 '+typeNote, w/2, h*0.79);
    c.fillText('القاعدة تُحدد شقّ الفلز في الملح 🔑', w/2, h*0.83);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 8-2 TAB 1: حمض + فلز نشيط ───
function simG9SaltMetal1(){
  cancelAnimationFrame(animFrame);
  simState={t:0, selMetal:0, reacting:false, bubbles:[], progress:0};
  const S=simState;

  const metals=[
    {metal:'Mg',acid:'H₂SO₄',salt:'MgSO₄',name:'كبريتات الماغنيسيوم',col:'#9B59B6',eq:'Mg(s) + H₂SO₄(aq) → MgSO₄(aq) + H₂(g)'},
    {metal:'Zn',acid:'HCl',salt:'ZnCl₂',name:'كلوريد الزنك',col:'#1A8FA8',eq:'Zn(s) + 2HCl(aq) → ZnCl₂(aq) + H₂(g)'},
    {metal:'Fe',acid:'H₂SO₄',salt:'FeSO₄',name:'كبريتات الحديد(II)',col:'#D4901A',eq:'Fe(s) + H₂SO₄(aq) → FeSO₄(aq) + H₂(g)'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">💥 فلز + حمض → ملح + هيدروجين</div>
      <div class="ctrl-btns-grid-1">
        ${metals.map((m,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="met-btn-${i}" onclick="simState.selMetal=${i};simState.reacting=false;simState.progress=0;simState.bubbles=[];document.querySelectorAll('[id^=met-btn-]').forEach((b,j)=>b.classList.toggle('active',j===${i}))">${m.metal} + ${m.acid}</button>`).join('')}
      </div>
    </div>
    <div class="ctrl-section">
      <button class="ctrl-btn action" onclick="simState.reacting=true">⚗️ أدخِل الفلز</button>
      <button class="ctrl-btn stop" style="margin-top:6px" onclick="simState.reacting=false;simState.progress=0;simState.bubbles=[]">🔄 إعادة</button>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ماذا تستنتج عن الهيدروجين الناتج؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">يتصاعد غاز الهيدروجين كفقاعات يمكن اختباره بعود مشتعل (يُسمع صوت فرقعة). الفلز يحلّ محل الهيدروجين في الحمض ليكوّن الملح. الفلزات الأكثر نشاطاً تتفاعل أسرع!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9saltmetal'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    if(S.reacting && S.progress<100) S.progress+=0.4;
    const m=metals[S.selMetal||0];
    const prog=S.progress||0;

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#FFF3E0'); bg.addColorStop(1,'#FFE0B2');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Beaker with acid
    const bx=w*0.2, by=h*0.12, bw=w*0.6, bh=h*0.6;
    c.fillStyle=`rgba(231,76,60,${0.15+0.05*Math.sin(S.t*0.05)})`; c.fillRect(bx,by+bh*0.05,bw,bh*0.95);
    c.strokeStyle='#90A4AE'; c.lineWidth=4;
    c.beginPath(); c.moveTo(bx,by); c.lineTo(bx,by+bh); c.lineTo(bx+bw,by+bh); c.lineTo(bx+bw,by); c.stroke();
    c.fillStyle='rgba(231,76,60,0.5)'; c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.textAlign='left'; c.textBaseline='alphabetic';
    c.fillText(m.acid+'(aq)', bx+8, by+bh-8);

    // Metal strip
    if(S.reacting){
      const metH=bh*(1-prog/110);
      const mx=bx+bw/2;
      c.fillStyle=m.col; c.beginPath(); c.roundRect(mx-12, by+bh*0.05, 24, metH, 4); c.fill();
      c.strokeStyle=m.col+'88'; c.lineWidth=2; c.beginPath(); c.roundRect(mx-12, by+bh*0.05, 24, metH, 4); c.stroke();
      c.fillStyle='#fff'; c.font=`bold ${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(m.metal, mx, by+bh*0.12);

      // H2 Bubbles
      if(Math.random()<0.35) S.bubbles.push({x:bx+bw*0.3+Math.random()*bw*0.4, y:by+bh*0.8, r:2+Math.random()*4, vy:-1.2-Math.random()*1.8});
      S.bubbles=S.bubbles.filter(b=>b.y>by-10);
      S.bubbles.forEach(b=>{ b.y+=b.vy; b.x+=Math.sin(b.y*0.08)*1.5; c.strokeStyle='rgba(52,152,219,0.7)'; c.lineWidth=1.5; c.beginPath(); c.arc(b.x,b.y,b.r,0,Math.PI*2); c.stroke(); });

      // H2 label
      c.fillStyle='#3498DB'; c.font=`bold ${Math.max(10,w*0.020)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('H₂(g) ↑', bx+bw/2, by-8);
    } else {
      // Show metal next to beaker
      const mx=bx-Math.min(w*0.10,50), my=by+bh*0.3;
      c.fillStyle=m.col+'33'; c.beginPath(); c.roundRect(mx,my,Math.min(w*0.09,42),bh*0.3,6); c.fill();
      c.strokeStyle=m.col; c.lineWidth=2.5; c.beginPath(); c.roundRect(mx,my,Math.min(w*0.09,42),bh*0.3,6); c.stroke();
      c.fillStyle=m.col; c.font=`bold ${Math.max(11,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(m.metal, mx+Math.min(w*0.045,21), my+bh*0.15);
    }

    // Salt coloring of solution
    if(prog>40){
      const alpha=Math.min((prog-40)/50,0.35);
      c.fillStyle=m.col+Math.floor(alpha*255).toString(16).padStart(2,'0'); c.fillRect(bx+2,by+bh*0.05,bw-4,bh*0.95);
      c.fillStyle=m.col; c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.textAlign='right'; c.textBaseline='alphabetic';
      c.fillText(m.salt+'(aq)', bx+bw-8, by+bh-8);
    }

    // Equation
    const eby=h*0.78, ebh=h*0.11;
    c.fillStyle='rgba(255,255,255,0.85)'; c.beginPath(); c.roundRect(w*0.04,eby,w*0.92,ebh,10); c.fill();
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(10,w*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(m.eq, w/2, eby+ebh/2);

    // Title
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText('فلز + حمض → ملح + هيدروجين ↑', w/2, h*0.08);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 8-2 TAB 2: حمض + كربونات ───
function simG9SaltMetal2(){
  cancelAnimationFrame(animFrame);
  simState={t:0, reacting:false, bubbles:[], progress:0, selIdx:0};
  const S=simState;

  const carbonates=[
    {carb:'CaCO₃', acid:'HCl', salt:'CaCl₂', co2:'CO₂', eq:'CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)'},
    {carb:'Na₂CO₃', acid:'H₂SO₄', salt:'Na₂SO₄', co2:'CO₂', eq:'Na₂CO₃(aq) + H₂SO₄(aq) → Na₂SO₄(aq) + H₂O(l) + CO₂(g)'},
    {carb:'MgCO₃', acid:'HCl', salt:'MgCl₂', co2:'CO₂', eq:'MgCO₃(s) + 2HCl(aq) → MgCl₂(aq) + H₂O(l) + CO₂(g)'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌬️ كربونات + حمض → ملح + ماء + CO₂</div>
      <div class="ctrl-btns-grid-1">
        ${carbonates.map((ca,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="carb-btn-${i}" onclick="simState.selIdx=${i};simState.reacting=false;simState.progress=0;simState.bubbles=[];document.querySelectorAll('[id^=carb-btn-]').forEach((b,j)=>b.classList.toggle('active',j===${i}))">${ca.carb} + ${ca.acid}</button>`).join('')}
      </div>
    </div>
    <div class="ctrl-section">
      <button class="ctrl-btn action" onclick="simState.reacting=true">⚗️ أضِف الحمض</button>
      <button class="ctrl-btn stop" style="margin-top:6px" onclick="simState.reacting=false;simState.progress=0;simState.bubbles=[]">🔄 إعادة</button>
    </div>
    <div class="info-box" style="margin-top:8px">الكربونات + حمض → ثلاثة نواتج:<br>ملح + ماء + غاز CO₂ ↑<br>الفوران دليل على CO₂!</div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ماذا تستنتج؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">تفاعل الكربونات ينتج 3 مواد! CO₂ يمكن اختباره بماء الجير (يُعكّره). هذا مختلف عن الفلز+حمض الذي ينتج H₂. الكربونات لا تُنتج هيدروجيناً!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9saltmetal'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    if(S.reacting && S.progress<100) S.progress+=0.45;
    const ca=carbonates[S.selIdx||0];
    const prog=S.progress||0;

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#E8F5E9'); bg.addColorStop(1,'#A5D6A7');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText('كربونات + حمض → ملح + ماء + CO₂', w/2, h*0.07);

    // Beaker
    const bx=w*0.2, by=h*0.13, bw=w*0.6, bh=h*0.55;
    c.fillStyle=`rgba(231,76,60,0.15)`; c.fillRect(bx,by+bh*0.4,bw,bh*0.6);
    // Carbonate solid at bottom
    if(prog<80){
      for(let i=0;i<15;i++){
        c.fillStyle='rgba(180,180,180,0.8)'; c.beginPath(); c.arc(bx+15+Math.random()*(bw-30),by+bh*0.6+Math.random()*bh*0.3,4+Math.random()*6,0,Math.PI*2); c.fill();
      }
    }
    c.strokeStyle='#90A4AE'; c.lineWidth=4;
    c.beginPath(); c.moveTo(bx,by); c.lineTo(bx,by+bh); c.lineTo(bx+bw,by+bh); c.lineTo(bx+bw,by); c.stroke();

    if(S.reacting){
      // Foam / bubbles (CO2)
      if(Math.random()<0.45) S.bubbles.push({x:bx+bw*0.2+Math.random()*bw*0.6, y:by+bh*0.65+Math.random()*bh*0.2, r:3+Math.random()*6, vy:-2-Math.random()*2.5});
      S.bubbles=S.bubbles.filter(b=>b.y>by-10);
      S.bubbles.forEach(b=>{ b.y+=b.vy; b.x+=Math.sin(b.y*0.06)*2; c.strokeStyle='rgba(100,180,100,0.75)'; c.lineWidth=2; c.beginPath(); c.arc(b.x,b.y,b.r,0,Math.PI*2); c.stroke(); });

      // Foam cap
      for(let i=0;i<20;i++){
        const fx=bx+Math.random()*bw, fy=by+bh*0.38+Math.random()*bh*0.05;
        c.fillStyle='rgba(255,255,255,0.7)'; c.beginPath(); c.arc(fx,fy,3+Math.random()*5,0,Math.PI*2); c.fill();
      }
      c.fillStyle='rgba(100,180,100,0.8)'; c.font=`bold ${Math.max(11,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('CO₂(g) ↑ — يُعكّر ماء الجير', w/2, by-8);
    } else {
      c.fillStyle='#7A8A98'; c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText(ca.carb+' — كربونات', w/2, by+bh-8);
    }

    // Equation
    const eby=h*0.76, ebh=h*0.12;
    c.fillStyle='rgba(255,255,255,0.85)'; c.beginPath(); c.roundRect(w*0.03,eby,w*0.94,ebh,10); c.fill();
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(9,w*0.017)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(ca.eq, w/2, eby+ebh/2);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 8-2 TAB 3: تفاعل CaCO₃ مع HCl بالتفصيل ───
function simG9SaltMetal3(){
  cancelAnimationFrame(animFrame);
  simState={t:0, step:0};
  const S=simState;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⚗️ تفاعل CaCO₃ + 2HCl بالتفصيل</div>
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn" onclick="simState.step=Math.max(0,simState.step-1)">⬅️ رجوع</button>
        <button class="ctrl-btn action" onclick="simState.step=Math.min(4,simState.step+1)">التالي ➡️</button>
      </div>
      <button class="ctrl-btn stop" style="margin-top:6px" onclick="simState.step=0">🔄 إعادة</button>
    </div>
    <div class="info-box" style="margin-top:8px">
      <b>المعادلة الأيونية الصافية:</b><br>
      2H⁺(aq) + CaCO₃(s) →<br>
      Ca²⁺(aq) + H₂O(l) + CO₂(g)
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا تتفاعل الكربونات مع الأحماض؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">أيونات H⁺ تهاجم أيون CO₃²⁻ وتكسره إلى CO₂ وH₂O. CO₂ لا يذوب كثيراً في الماء فيتصاعد كغاز. الفوران الذي نراه هو هذا الغاز!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  const stepsTxt=[
    'الخطوة ١: المواد المتفاعلة — رخام CaCO₃ وحمض HCl',
    'الخطوة ٢: تأيُّن الحمض — HCl → H⁺ + Cl⁻',
    'الخطوة ٣: هجوم H⁺ على CaCO₃',
    'الخطوة ٤: تكوين النواتج — CaCl₂ + H₂O + CO₂',
    'الخطوة ٥: المعادلة الأيونية الصافية الموزونة',
  ];

  function draw(){
    if(currentSim!=='g9saltmetal'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const st=S.step||0;

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#FCE4EC'); bg.addColorStop(1,'#F8BBD0');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Step indicator dots
    [0,1,2,3,4].forEach(i=>{
      c.fillStyle=i<=st?'#C0392B':'rgba(0,0,0,0.15)';
      c.beginPath(); c.arc(w*0.1+i*w*0.2,h*0.07,Math.min(w,h)*0.022,0,Math.PI*2); c.fill();
    });

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(12,w*0.024)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText(stepsTxt[st], w/2, h*0.17);

    if(st===0){
      // Show solid marble + acid beaker
      c.fillStyle='#90A4AE88'; c.beginPath(); c.roundRect(w*0.1,h*0.25,w*0.3,h*0.4,10); c.fill();
      c.strokeStyle='#607D8B'; c.lineWidth=2; c.beginPath(); c.roundRect(w*0.1,h*0.25,w*0.3,h*0.4,10); c.stroke();
      c.fillStyle='#455A64'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('CaCO₃', w*0.25, h*0.45);
      c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.fillStyle='#78909C'; c.fillText('رخام/حجر جيري (s)', w*0.25, h*0.55);

      c.fillStyle='rgba(231,76,60,0.2)'; c.beginPath(); c.roundRect(w*0.6,h*0.25,w*0.3,h*0.4,10); c.fill();
      c.strokeStyle='#C0392B'; c.lineWidth=2; c.beginPath(); c.roundRect(w*0.6,h*0.25,w*0.3,h*0.4,10); c.stroke();
      c.fillStyle='#C0392B'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('HCl', w*0.75, h*0.45);
      c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.fillStyle='#E74C3C'; c.fillText('حمض (aq)', w*0.75, h*0.55);
    }

    if(st===1){
      // HCl splitting
      const ions=[{l:'H⁺',x:w*0.3,col:'#C0392B'},{l:'Cl⁻',x:w*0.7,col:'#7F8C8D'}];
      c.fillStyle='rgba(231,76,60,0.15)'; c.beginPath(); c.roundRect(w*0.1,h*0.28,w*0.8,h*0.15,12); c.fill();
      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('HCl', w*0.5, h*0.355);
      const sep=Math.sin(S.t*0.05)*5+20;
      ions.forEach(ion=>{
        c.fillStyle=ion.col+'33'; c.beginPath(); c.arc(ion.x+(ion.l==='H⁺'?-sep:sep),h*0.55,Math.min(w,h)*0.09,0,Math.PI*2); c.fill();
        c.strokeStyle=ion.col; c.lineWidth=2; c.beginPath(); c.arc(ion.x+(ion.l==='H⁺'?-sep:sep),h*0.55,Math.min(w,h)*0.09,0,Math.PI*2); c.stroke();
        c.fillStyle=ion.col; c.font=`bold ${Math.max(14,w*0.028)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(ion.l, ion.x+(ion.l==='H⁺'?-sep:sep), h*0.55);
      });
      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(16,w*0.030)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('→', w*0.5, h*0.55);
    }

    if(st===2){
      // H+ attacking CaCO3
      const angle=S.t*0.06;
      const cx2=w*0.6, cy2=h*0.48, cr=Math.min(w,h)*0.12;
      c.fillStyle='#90A4AE33'; c.beginPath(); c.arc(cx2,cy2,cr,0,Math.PI*2); c.fill();
      c.strokeStyle='#607D8B'; c.lineWidth=3; c.beginPath(); c.arc(cx2,cy2,cr,0,Math.PI*2); c.stroke();
      c.fillStyle='#455A64'; c.font=`bold ${Math.max(12,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('CaCO₃', cx2, cy2);
      // H+ orbiting
      const hx=cx2+Math.cos(angle)*(cr+25), hy=cy2+Math.sin(angle)*(cr+25);
      const hx2=cx2+Math.cos(angle+Math.PI)*(cr+25), hy2=cy2+Math.sin(angle+Math.PI)*(cr+25);
      [[hx,hy],[hx2,hy2]].forEach(([px,py])=>{
        c.fillStyle='#FFCDD2'; c.beginPath(); c.arc(px,py,Math.min(w,h)*0.05,0,Math.PI*2); c.fill();
        c.strokeStyle='#C0392B'; c.lineWidth=2; c.beginPath(); c.arc(px,py,Math.min(w,h)*0.05,0,Math.PI*2); c.stroke();
        c.fillStyle='#C0392B'; c.font=`bold ${Math.max(12,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
        c.fillText('H⁺', px, py);
      });
    }

    if(st===3){
      const products=[{f:'CaCl₂',n:'ملح',col:'#27AE60',x:w*0.2},{f:'H₂O',n:'ماء',col:'#1A8FA8',x:w*0.5},{f:'CO₂↑',n:'غاز',col:'#8E44AD',x:w*0.8}];
      products.forEach(p=>{
        const bounce=Math.sin(S.t*0.06+p.x)*5;
        c.shadowBlur=15; c.shadowColor=p.col+'66';
        c.fillStyle=p.col+'22'; c.beginPath(); c.arc(p.x,h*0.45+bounce,Math.min(w,h)*0.1,0,Math.PI*2); c.fill();
        c.shadowBlur=0; c.strokeStyle=p.col; c.lineWidth=2.5; c.beginPath(); c.arc(p.x,h*0.45+bounce,Math.min(w,h)*0.1,0,Math.PI*2); c.stroke();
        c.fillStyle=p.col; c.font=`bold ${Math.max(12,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(p.f, p.x, h*0.45+bounce-5);
        c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.fillStyle='#666';
        c.fillText(p.n, p.x, h*0.45+bounce+Math.min(w,h)*0.10+8);
      });
    }

    if(st===4){
      const ebx=w*0.04, eby=h*0.26, ebw=w*0.92;
      const eqs=['CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)','2H⁺(aq) + CaCO₃(s) → Ca²⁺(aq) + H₂O(l) + CO₂(g)'];
      const labels=['المعادلة الرمزية الكاملة:','المعادلة الأيونية الصافية:'];
      eqs.forEach((eq,i)=>{
        const ebh=h*0.10;
        c.fillStyle=i===1?'rgba(39,174,96,0.15)':'rgba(255,255,255,0.8)'; c.beginPath(); c.roundRect(ebx,eby+i*(ebh+h*0.03),ebw,ebh,10); c.fill();
        c.fillStyle='#7A8A98'; c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
        c.fillText(labels[i], w/2, eby+i*(ebh+h*0.03)+4);
        c.fillStyle=i===1?'#27AE60':'#1E2D3D'; c.font=`bold ${Math.max(10,w*0.019)}px Tajawal`; c.textBaseline='middle';
        c.fillText(eq, w/2, eby+i*(ebh+h*0.03)+ebh*0.65);
      });
    }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 8-3 TAB 1: الطريقة أ: فلز + حمض ───
function simG9SaltMake1(){
  cancelAnimationFrame(animFrame);
  simState={t:0, step:0};
  const S=simState;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔬 خطوات تحضير الملح الذائب</div>
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn" onclick="simState.step=Math.max(0,simState.step-1)">⬅️ رجوع</button>
        <button class="ctrl-btn action" onclick="simState.step=Math.min(4,simState.step+1)">التالي ➡️</button>
      </div>
      <button class="ctrl-btn stop" style="margin-top:6px" onclick="simState.step=0">🔄 من البداية</button>
    </div>
    <div class="info-box" style="margin-top:8px">
      <b>لتحضير MgSO₄:</b><br>
      Mg (فائض) + H₂SO₄ → MgSO₄ + H₂↑
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا نُضيف الفلز بالفائض؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">لضمان استهلاك كل الحمض كلياً حتى لا يبقى حمض حرّ في المحلول. الفائض من الفلز نُزيله بالترشيح. إذا ترك الحمض يُفسد نقاوة الملح!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  const steps=[
    {title:'الخطوة ١: أضِف فائضاً من المعدن إلى الحمض', icon:'⚗️'},
    {title:'الخطوة ٢: قلِّب حتى يتوقف الفوران', icon:'🌀'},
    {title:'الخطوة ٣: رشِّح المحلول لإزالة الفائض', icon:'🔽'},
    {title:'الخطوة ٤: سخِّن لتبخير الماء', icon:'🔥'},
    {title:'الخطوة ٥: برِّد للحصول على البلورات ✅', icon:'❄️'},
  ];
  const colors=['#C0392B','#E67E22','#1A8FA8','#E74C3C','#3498DB'];

  function draw(){
    if(currentSim!=='g9saltmake'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const st=S.step||0;

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#F1F8E9'); bg.addColorStop(1,'#DCEDC8');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Step tracker
    steps.forEach((s,i)=>{
      const sx=w*0.08+i*w*0.18, sy=h*0.08;
      c.fillStyle=i<st?'#27AE60':i===st?colors[st]:'rgba(0,0,0,0.12)';
      c.beginPath(); c.arc(sx,sy,Math.min(w,h)*0.028,0,Math.PI*2); c.fill();
      c.fillStyle='white'; c.font=`bold ${Math.max(9,w*0.017)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(s.icon, sx, sy);
    });

    // Step title
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText(steps[st].title, w/2, h*0.18);

    const bx=w*0.2, by=h*0.22, bw=w*0.6, bh=h*0.5;

    if(st===0){
      // Acid in beaker
      c.fillStyle='rgba(231,76,60,0.2)'; c.fillRect(bx,by+bh*0.3,bw,bh*0.7);
      c.strokeStyle='#90A4AE'; c.lineWidth=3; c.beginPath(); c.moveTo(bx,by); c.lineTo(bx,by+bh); c.lineTo(bx+bw,by+bh); c.lineTo(bx+bw,by); c.stroke();
      c.fillStyle='rgba(231,76,60,0.5)'; c.font=`${Math.max(10,w*0.019)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('H₂SO₄(aq)', w/2, by+bh-8);
      // Metal being added
      const bounce=Math.abs(Math.sin(S.t*0.04))*bh*0.1;
      c.fillStyle='#9B59B6'; c.beginPath(); c.roundRect(w*0.46,by-bounce,bw*0.08,bh*0.15,4); c.fill();
      c.fillStyle='white'; c.font=`bold ${Math.max(10,w*0.019)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('Mg', w*0.5, by-bounce+bh*0.075);
      c.fillStyle='#555'; c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('↓ فائض من المعدن', w*0.5, by+bh+24);
    }

    if(st===1){
      // Stirring with bubbles
      c.fillStyle='rgba(155,89,182,0.2)'; c.fillRect(bx,by+bh*0.3,bw,bh*0.7);
      c.strokeStyle='#90A4AE'; c.lineWidth=3; c.beginPath(); c.moveTo(bx,by); c.lineTo(bx,by+bh); c.lineTo(bx+bw,by+bh); c.lineTo(bx+bw,by); c.stroke();
      for(let i=0;i<15;i++){
        const bpx=bx+10+Math.random()*(bw-20), bpy=by+bh*0.35+Math.random()*bh*0.55;
        c.strokeStyle='rgba(52,152,219,0.6)'; c.lineWidth=1.5; c.beginPath(); c.arc(bpx,bpy,3+Math.random()*4,0,Math.PI*2); c.stroke();
      }
      // Stirring rod animation
      const ang=S.t*0.1;
      const rx=w*0.5+Math.cos(ang)*bw*0.15, ry=by+bh*0.4+Math.sin(ang)*bh*0.08;
      c.strokeStyle='#8E44AD'; c.lineWidth=5; c.lineCap='round';
      c.beginPath(); c.moveTo(w*0.5,by); c.lineTo(rx,ry); c.stroke();
      c.fillStyle='#555'; c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('تقليب مستمر — H₂↑ تتصاعد حتى يتوقف الفوران', w/2, by+bh+24);
    }

    if(st===2){
      // Filter funnel
      c.strokeStyle='#90A4AE'; c.lineWidth=2;
      c.beginPath(); c.moveTo(w*0.3,by); c.lineTo(w*0.5,by+bh*0.35); c.lineTo(w*0.7,by); c.stroke();
      c.beginPath(); c.arc(w*0.5,by,bw*0.37,0,Math.PI,true); c.stroke();
      // Filter paper
      c.fillStyle='rgba(255,255,255,0.6)'; c.beginPath(); c.moveTo(w*0.3,by); c.lineTo(w*0.5,by+bh*0.35); c.lineTo(w*0.7,by); c.closePath(); c.fill();
      // Solid residue on filter
      c.fillStyle='#9B59B6'; c.beginPath(); c.arc(w*0.5,by+bh*0.12,bw*0.06,0,Math.PI*2); c.fill();
      c.fillStyle='white'; c.font=`${Math.max(9,w*0.017)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('Mg↑', w*0.5, by+bh*0.12);
      // Filtrate dripping
      const dropY=by+bh*0.35+Math.abs(Math.sin(S.t*0.04))*(bh*0.3);
      c.fillStyle='rgba(26,143,168,0.6)'; c.beginPath(); c.arc(w*0.5,dropY,6,0,Math.PI*2); c.fill();
      c.fillStyle='#1A8FA8'; c.font=`bold ${Math.max(10,w*0.019)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('MgSO₄(aq) — محلول الملح', w*0.5, by+bh+24);
    }

    if(st===3){
      // Evaporation
      c.fillStyle='rgba(26,143,168,0.3)'; c.fillRect(bx,by+bh*0.7,bw,bh*0.3);
      c.strokeStyle='#90A4AE'; c.lineWidth=3; c.beginPath(); c.moveTo(bx,by); c.lineTo(bx,by+bh); c.lineTo(bx+bw,by+bh); c.lineTo(bx+bw,by); c.stroke();
      // Steam
      for(let i=0;i<8;i++){
        const sx2=bx+bw*0.2+i*(bw*0.08), sy2=by+bh*0.6-Math.abs(Math.sin(S.t*0.05+i))*bh*0.3;
        c.fillStyle=`rgba(255,255,255,${0.3+0.4*Math.random()})`;
        c.beginPath(); c.arc(sx2,sy2,5+Math.random()*8,0,Math.PI*2); c.fill();
      }
      // Heat source
      c.fillStyle='#E74C3C'; c.font=`${Math.max(20,w*0.04)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('🔥', w*0.5, by+bh+20);
      c.fillStyle='#555'; c.font=`${Math.max(9,w*0.016)}px Tajawal`;
      c.fillText('التسخين لتبخير الماء — يزيد تركيز المحلول', w*0.5, by+bh+38);
    }

    if(st===4){
      // Crystal formation
      c.fillStyle='rgba(52,152,219,0.15)'; c.fillRect(bx,by+bh*0.75,bw,bh*0.25);
      c.strokeStyle='#90A4AE'; c.lineWidth=3; c.beginPath(); c.moveTo(bx,by); c.lineTo(bx,by+bh); c.lineTo(bx+bw,by+bh); c.lineTo(bx+bw,by); c.stroke();
      // Crystals (hexagons)
      const crystals=[[w*0.3,by+bh*0.82],[w*0.45,by+bh*0.79],[w*0.6,by+bh*0.83],[w*0.38,by+bh*0.87],[w*0.55,by+bh*0.86]];
      crystals.forEach(([cx2,cy2])=>{
        const cr=Math.min(w,h)*0.04*(0.9+0.1*Math.sin(S.t*0.04));
        c.fillStyle='rgba(52,152,219,0.4)'; c.strokeStyle='#3498DB'; c.lineWidth=2;
        c.beginPath();
        for(let i=0;i<6;i++){ const a=i*Math.PI/3; c.lineTo(cx2+cr*Math.cos(a),cy2+cr*Math.sin(a)); }
        c.closePath(); c.fill(); c.stroke();
      });
      c.fillStyle='#27AE60'; c.font=`bold ${Math.max(12,w*0.025)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('✅ بلورات MgSO₄ النقية!', w*0.5, by+bh+24);
      c.fillStyle='#3498DB'; c.font=`${Math.max(9,w*0.016)}px Tajawal`;
      c.fillText('❄️ التبريد يُرسّب البلورات من المحلول', w*0.5, by+bh+40);
    }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 8-3 TAB 2: التبخير والتبلور ───
function simG9SaltMake2(){
  cancelAnimationFrame(animFrame);
  simState={t:0, temp:25, heating:false, crystals:[], phase:'liquid'};
  const S=simState;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">💎 التبخير والتبلور</div>
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn stop" id="heat-btn" onclick="simState.heating=true;this.disabled=true;document.getElementById('cool-btn').disabled=false">🔥 سخِّن</button>
        <button class="ctrl-btn action" id="cool-btn" disabled onclick="simState.heating=false;document.getElementById('heat-btn').disabled=false">❄️ برِّد</button>
      </div>
      <button class="ctrl-btn" style="margin-top:6px" onclick="simState.temp=25;simState.heating=false;simState.crystals=[];simState.phase='liquid';document.getElementById('heat-btn').disabled=false;document.getElementById('cool-btn').disabled=true">🔄 إعادة</button>
    </div>
    <div class="info-box" style="margin-top:8px">
      📈 عند التسخين: تتبخر المياه ويزيد التركيز<br>
      ❄️ عند التبريد: تنبثق البلورات من المحلول
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ماذا تستنتج؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الذوبانية تتناقص عند التبريد، لذا يترسّب الملح الزائد على هيئة بلورات. البلورات نقية لأن الشوائب لا تترسّب معها — هذه طريقة التنقية بالتبلور!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9saltmake'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    if(S.heating && S.temp<100) S.temp=Math.min(100, S.temp+0.3);
    if(!S.heating && S.temp>20) S.temp=Math.max(20, S.temp-0.2);
    if(S.temp>85 && S.crystals.length===0) S.phase='evap';
    if(S.temp<50 && S.phase==='evap') S.phase='crystal';
    if(S.phase==='crystal' && Math.random()<0.08 && S.crystals.length<20)
      S.crystals.push({x:w*0.22+Math.random()*(w*0.56), y:h*0.65+Math.random()*h*0.18, size:3+Math.random()*10});

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#E3F2FD'); bg.addColorStop(1,'#BBDEFB');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Temperature gauge
    const gaugeX=w*0.85, gaugeY=h*0.1, gaugeH=h*0.6;
    c.fillStyle='rgba(255,255,255,0.7)'; c.beginPath(); c.roundRect(gaugeX-18,gaugeY,36,gaugeH,18); c.fill();
    c.strokeStyle='#90A4AE'; c.lineWidth=2; c.beginPath(); c.roundRect(gaugeX-18,gaugeY,36,gaugeH,18); c.stroke();
    const fillH=gaugeH*(S.temp/100);
    const tempCol=S.temp>70?'#C0392B':S.temp>40?'#E67E22':'#3498DB';
    c.fillStyle=tempCol; c.beginPath(); c.roundRect(gaugeX-16,gaugeY+gaugeH-fillH+2,32,fillH-4,14); c.fill();
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(10,w*0.019)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText(Math.round(S.temp)+'°C', gaugeX, gaugeY+gaugeH+18);
    c.fillText('🌡️', gaugeX, gaugeY-12);

    // Beaker
    const bx=w*0.12, by=h*0.18, bw=w*0.66, bh=h*0.56;
    const waterLevel=bh*(1-Math.max(0,(S.temp-30)/80)*0.6);
    c.fillStyle=S.temp>70?'rgba(231,76,60,0.2)':'rgba(26,143,168,0.25)';
    c.fillRect(bx,by+bh-waterLevel,bw,waterLevel);
    // Steam
    if(S.temp>70){
      for(let i=0;i<6;i++){
        const sx=bx+bw*0.15+i*(bw*0.12), sy=by+bh*0.2-Math.abs(Math.sin(S.t*0.04+i))*h*0.15;
        c.fillStyle=`rgba(255,255,255,${0.2+0.3*Math.random()})`;
        c.beginPath(); c.arc(sx,sy,6+Math.random()*8,0,Math.PI*2); c.fill();
      }
    }
    c.strokeStyle='#90A4AE'; c.lineWidth=4;
    c.beginPath(); c.moveTo(bx,by); c.lineTo(bx,by+bh); c.lineTo(bx+bw,by+bh); c.lineTo(bx+bw,by); c.stroke();

    // Crystals
    S.crystals.forEach(cr=>{
      const pulse=0.9+0.1*Math.sin(S.t*0.05);
      c.fillStyle='rgba(52,152,219,0.4)'; c.strokeStyle='#2980B9'; c.lineWidth=1.5;
      c.beginPath();
      for(let i=0;i<6;i++){ const a=i*Math.PI/3; c.lineTo(cr.x+cr.size*pulse*Math.cos(a),cr.y+cr.size*pulse*Math.sin(a)); }
      c.closePath(); c.fill(); c.stroke();
    });

    // Status text
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(12,w*0.024)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    const status=S.phase==='crystal'?'💎 تتكوّن البلورات!':S.temp>70?'🔥 يتبخر الماء...':S.temp>40?'♨️ يتركز المحلول':'💧 محلول الملح';
    c.fillText(status, w*0.45, by+bh+28);
    c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.fillStyle='#7A8A98';
    if(S.crystals.length>0) c.fillText('عدد البلورات: '+S.crystals.length, w*0.45, by+bh+44);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 8-3 TAB 3: تحضير CuSO₄ مخبرياً ───
function simG9SaltMake3(){
  cancelAnimationFrame(animFrame);
  simState={t:0, stage:0, progress:0};
  const S=simState;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧫 تحضير كبريتات النحاس CuSO₄</div>
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn" onclick="simState.stage=Math.max(0,simState.stage-1);simState.progress=0">⬅️ رجوع</button>
        <button class="ctrl-btn action" onclick="simState.stage=Math.min(3,simState.stage+1);simState.progress=0">التالي ➡️</button>
      </div>
    </div>
    <div class="info-box" style="margin-top:8px">
      <b>التفاعل:</b><br>
      CuO(s) + H₂SO₄(aq) →<br>
      CuSO₄(aq) + H₂O(l)<br>
      <b>اللون:</b> أزرق مميز 💙
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا CuSO₄ أزرق اللون؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">أيونات Cu²⁺ تمتص الضوء الأحمر والأصفر وتعكس الأزرق. عند التجفيف (CuSO₄ اللامائي) يصبح أبيض — يُستخدم لاختبار وجود الماء: يصبح أزرق عند تبلله!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  const stages=[
    {title:'أضِف أكسيد النحاس(II) الأسود إلى H₂SO₄'},
    {title:'سخِّن مع التقليب حتى يذوب الأكسيد'},
    {title:'رشِّح المحلول الأزرق لإزالة الفائض'},
    {title:'✅ بخِّر وبرِّد → بلورات CuSO₄ الزرقاء'},
  ];

  function draw(){
    if(currentSim!=='g9saltmake'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    S.progress=Math.min(S.progress+0.5,100);
    const st=S.stage||0;
    const prog=S.progress/100;

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#E0F7FA'); bg.addColorStop(1,'#B2EBF2');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Stage dots
    [0,1,2,3].forEach(i=>{ c.fillStyle=i<=st?'#1A8FA8':'rgba(0,0,0,0.12)'; c.beginPath(); c.arc(w*0.15+i*w*0.22,h*0.07,Math.min(w,h)*0.025,0,Math.PI*2); c.fill(); });
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(12,w*0.024)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText(stages[st].title, w/2, h*0.17);

    const bx=w*0.2, by=h*0.22, bw=w*0.6, bh=h*0.5;
    const blueAlpha=st>=1?Math.min(prog*0.6,0.5):0;

    // Liquid in beaker
    c.fillStyle=`rgba(231,76,60,${Math.max(0,0.15-blueAlpha)})`; c.fillRect(bx,by+bh*0.2,bw,bh*0.8);
    c.fillStyle=`rgba(26,143,168,${blueAlpha})`; c.fillRect(bx,by+bh*0.2,bw,bh*0.8);

    // CuO particles (stage 0)
    if(st===0){
      for(let i=0;i<20;i++){
        c.fillStyle='rgba(60,30,10,0.8)'; c.beginPath(); c.arc(bx+15+Math.random()*(bw-30),by+bh*0.25+Math.random()*bh*0.6,3+Math.random()*4,0,Math.PI*2); c.fill();
      }
    }

    // Steam (stage 1)
    if(st===1){
      for(let i=0;i<5;i++){
        const sx=bx+bw*0.2+i*(bw*0.15), sy=by+bh*0.1-Math.abs(Math.sin(S.t*0.04+i))*h*0.12;
        c.fillStyle=`rgba(255,255,255,${0.25+Math.random()*0.3})`; c.beginPath(); c.arc(sx,sy,5+Math.random()*7,0,Math.PI*2); c.fill();
      }
      c.fillStyle='#E74C3C'; c.font=`${Math.max(16,w*0.04)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('🔥', w/2, by+bh+28);
    }

    // Beaker outline
    c.strokeStyle='#90A4AE'; c.lineWidth=4;
    c.beginPath(); c.moveTo(bx,by); c.lineTo(bx,by+bh); c.lineTo(bx+bw,by+bh); c.lineTo(bx+bw,by); c.stroke();

    // CuSO4 Crystals (stage 3)
    if(st===3){
      const crystN=Math.floor(S.t/30)+5;
      for(let i=0;i<Math.min(crystN,18);i++){
        const cx2=bx+bw*0.1+((i*73)%(bw*0.8)), cy2=by+bh*0.4+((i*37)%(bh*0.45));
        const cr=4+Math.sin(i)*4;
        c.fillStyle='rgba(26,143,168,0.7)'; c.strokeStyle='#0097A7'; c.lineWidth=2;
        c.beginPath();
        for(let j=0;j<6;j++){ const a=j*Math.PI/3; c.lineTo(cx2+cr*Math.cos(a),cy2+cr*Math.sin(a)); }
        c.closePath(); c.fill(); c.stroke();
      }
      c.fillStyle='#0097A7'; c.font=`bold ${Math.max(12,w*0.024)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('💙 بلورات CuSO₄ · 5H₂O الزرقاء!', w/2, by+bh+28);
    }

    // Salt label
    if(st>=1 && st<3){
      c.fillStyle='#1A8FA8'; c.font=`bold ${Math.max(12,w*0.024)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('CuSO₄(aq) — محلول أزرق اللون', w/2, by+bh+28);
    }

    // Equation
    const eby=h*0.79, ebh=h*0.1;
    c.fillStyle='rgba(255,255,255,0.8)'; c.beginPath(); c.roundRect(w*0.04,eby,w*0.92,ebh,10); c.fill();
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('CuO(s) + H₂SO₄(aq) → CuSO₄(aq) + H₂O(l)', w/2, eby+ebh/2);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 8-4 TAB 1: المعايرة (Titration) ───
function simG9SaltTitra1(){
  cancelAnimationFrame(animFrame);
  simState={t:0, vol:0, dropping:false, ph:1.5, done:false, drops:[]};
  const S=simState;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌡️ المعايرة — قطرة بقطرة</div>
      <button class="ctrl-btn action" id="drop-btn" onclick="simState.dropping=true;this.textContent='⏸ وقف';this.onclick=function(){simState.dropping=false;this.textContent='▶ استمرار';this.onclick=function(){simState.dropping=true;this.textContent='⏸ وقف';}}">▶ أضِف القاعدة</button>
      <button class="ctrl-btn stop" style="margin-top:6px" onclick="simState.vol=0;simState.ph=1.5;simState.done=false;simState.drops=[];simState.dropping=false;document.getElementById('drop-btn').textContent='▶ أضِف القاعدة'">🔄 إعادة</button>
    </div>
    <div class="info-box" style="margin-top:8px">
      <b>الإعداد:</b> HCl في المخروطية<br>
      <b>كاشف:</b> بضع قطرات فينولفتالين (عديم اللون في الحمض)<br>
      <b>السحاحة:</b> NaOH (القاعدة)
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ماذا تستنتج عن نقطة النهاية؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">عند تغيّر لون الكاشف من عديم اللون إلى وردي فاتح دائم (قطرة واحدة زائدة)، وصلنا لنقطة النهاية. الملح الناتج: NaCl. نقيس الحجم ونحسب التركيز!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9salttitra'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    if(S.dropping && !S.done){
      S.vol=Math.min(S.vol+0.15, 25);
      S.ph=Math.min(1.5+S.vol*0.45, 13);
      if(S.vol>=24.5) S.done=true;
      if(Math.random()<0.4) S.drops.push({x:w*0.5, y:h*0.12, vy:3, t:0});
    }
    S.drops=S.drops.filter(d=>d.y<h*0.6);
    S.drops.forEach(d=>{ d.y+=d.vy; d.t++; });

    const nearEnd=S.ph>6.5 && S.ph<8;
    const past=S.ph>=7;
    const solutionCol=past?'rgba(255,20,147,0.25)':'rgba(231,76,60,0.15)';

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#FFF3E0'); bg.addColorStop(1,'#FFCCBC');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Burette (top)
    const bux=w*0.44, buy=h*0.02, buw=w*0.12, buh=h*0.42;
    c.fillStyle='rgba(26,143,168,0.3)'; c.fillRect(bux,buy,buw,buh*(1-S.vol/25));
    c.strokeStyle='#90A4AE'; c.lineWidth=2;
    c.beginPath(); c.moveTo(bux,buy); c.lineTo(bux,buy+buh); c.moveTo(bux+buw,buy); c.lineTo(bux+buw,buy+buh); c.stroke();
    // Volume markings
    for(let v=0;v<=25;v+=5){
      const my=buy+buh*(v/25);
      c.strokeStyle='rgba(0,0,0,0.3)'; c.lineWidth=1;
      c.beginPath(); c.moveTo(bux-5,my); c.lineTo(bux,my); c.stroke();
      c.fillStyle='#555'; c.font=`${Math.max(8,w*0.013)}px Tajawal`; c.textAlign='right'; c.textBaseline='middle';
      c.fillText(v, bux-6, my);
    }
    c.fillStyle='#1A8FA8'; c.font=`bold ${Math.max(9,w*0.017)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText('NaOH', bux+buw/2, buy+buh+12);
    c.fillStyle='#E74C3C'; c.font=`bold ${Math.max(9,w*0.016)}px Tajawal`;
    c.fillText(S.vol.toFixed(1)+' mL', bux+buw/2, buy+buh+26);

    // Drops falling
    S.drops.forEach(d=>{
      c.fillStyle='rgba(26,143,168,0.8)'; c.beginPath(); c.ellipse(d.x,d.y,4,6,0,0,Math.PI*2); c.fill();
    });

    // Conical flask
    const fx=w*0.28, fy=h*0.52, fw=w*0.44, fh=h*0.35;
    c.fillStyle=solutionCol;
    c.beginPath(); c.moveTo(fx+fw*0.3,fy); c.lineTo(fx,fy+fh); c.lineTo(fx+fw,fy+fh); c.lineTo(fx+fw*0.7,fy); c.closePath(); c.fill();
    c.strokeStyle='#90A4AE'; c.lineWidth=3;
    c.beginPath(); c.moveTo(fx+fw*0.3,fy); c.lineTo(fx,fy+fh); c.lineTo(fx+fw,fy+fh); c.lineTo(fx+fw*0.7,fy); c.stroke();
    c.beginPath(); c.roundRect(fx+fw*0.3,fy-h*0.06,fw*0.4,h*0.07,4); c.stroke();

    // pH indicator
    const phCol=S.ph<7?'rgba(231,76,60,0.8)':'rgba(255,20,147,0.8)';
    c.fillStyle=phCol; c.font=`bold ${Math.max(12,w*0.026)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('pH = '+S.ph.toFixed(1), fx+fw/2, fy+fh*0.55);

    // Endpoint
    if(S.done){
      c.shadowBlur=20; c.shadowColor='#FF69B4';
      c.fillStyle='rgba(255,20,147,0.15)'; c.beginPath(); c.moveTo(fx+fw*0.3,fy); c.lineTo(fx,fy+fh); c.lineTo(fx+fw,fy+fh); c.lineTo(fx+fw*0.7,fy); c.closePath(); c.fill();
      c.shadowBlur=0;
      c.fillStyle='#C2185B'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('✅ نقطة النهاية! اللون وردي!', w/2, fy+fh+28);
      c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.fillStyle='#888';
      c.fillText('الملح الناتج: NaCl — كلوريد الصوديوم', w/2, fy+fh+44);
    }

    // Equation
    const eby=h*0.90, ebh=h*0.08;
    c.fillStyle='rgba(255,255,255,0.8)'; c.beginPath(); c.roundRect(w*0.04,eby,w*0.92,ebh,10); c.fill();
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)', w/2, eby+ebh/2);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 8-4 TAB 2: الترسيب (Precipitation) ───
function simG9SaltTitra2(){
  cancelAnimationFrame(animFrame);
  simState={t:0, selPpt:0, dropped:false, particles:[]};
  const S=simState;

  const ppts=[
    {a:'CuSO₄',b:'NaOH',ppt:'Cu(OH)₂',aq:'Na₂SO₄',col:'#1A8FA8',name:'هيدروكسيد النحاس(II)'},
    {a:'BaCl₂',b:'MgSO₄',ppt:'BaSO₄',aq:'MgCl₂',col:'#FAFAFA',name:'كبريتات الباريوم'},
    {a:'AgNO₃',b:'NaCl',ppt:'AgCl',aq:'NaNO₃',col:'#FFFFEE',name:'كلوريد الفضة'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧊 الترسيب — تكوين راسب</div>
      <div class="ctrl-btns-grid-1">
        ${ppts.map((p,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="ppt-btn-${i}" onclick="simState.selPpt=${i};simState.dropped=false;simState.particles=[];document.querySelectorAll('[id^=ppt-btn-]').forEach((b,j)=>b.classList.toggle('active',j===${i}))">${p.a}+${p.b}</button>`).join('')}
      </div>
    </div>
    <div class="ctrl-section">
      <button class="ctrl-btn action" onclick="simState.dropped=true">➕ امزِج المحلولَين</button>
      <button class="ctrl-btn stop" style="margin-top:6px" onclick="simState.dropped=false;simState.particles=[]">🔄 إعادة</button>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ماذا تستنتج عن الأملاح غير الذائبة؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">بعض الأملاح غير قابلة للذوبان — تترسب فوراً عند المزج. الراسب ملح غير ذائب نجمعه بالترشيح. يُستخدم هذا لتحضير أملاح لا يمكن تحضيرها بالطرق الأخرى!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9salttitra'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const p=ppts[S.selPpt||0];
    if(S.dropped && Math.random()<0.15 && S.particles.length<50)
      S.particles.push({x:w*0.3+Math.random()*w*0.4, y:h*0.4+Math.random()*h*0.1, vy:1.5+Math.random()*2, settled:false});
    S.particles.forEach(pp=>{ if(!pp.settled){ pp.y+=pp.vy; if(pp.y>h*0.7) pp.settled=true; } });

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#F3E5F5'); bg.addColorStop(1,'#E1BEE7');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText('الترسيب — تكوين ملح غير ذائب', w/2, h*0.07);

    if(!S.dropped){
      // Two separate beakers
      const beakers=[{x:w*0.08,label:p.a,col:'rgba(52,152,219,0.2)'},{x:w*0.56,label:p.b,col:'rgba(39,174,96,0.2)'}];
      beakers.forEach(bk=>{
        const bkx=bk.x, bky=h*0.2, bkw=w*0.32, bkh=h*0.5;
        c.fillStyle=bk.col; c.fillRect(bkx,bky,bkw,bkh);
        c.strokeStyle='#90A4AE'; c.lineWidth=3;
        c.beginPath(); c.moveTo(bkx,bky); c.lineTo(bkx,bky+bkh); c.lineTo(bkx+bkw,bky+bkh); c.lineTo(bkx+bkw,bky); c.stroke();
        c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(12,w*0.024)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
        c.fillText(bk.label, bkx+bkw/2, bky+bkh+20);
      });
      c.fillStyle='#6B4E9A'; c.font=`bold ${Math.max(16,w*0.032)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('+', w/2, h*0.45);
    } else {
      // Mixed beaker
      const bx=w*0.15, by=h*0.15, bw=w*0.7, bh=h*0.6;
      c.fillStyle='rgba(200,200,200,0.2)'; c.fillRect(bx,by,bw,bh);
      c.strokeStyle='#90A4AE'; c.lineWidth=4;
      c.beginPath(); c.moveTo(bx,by); c.lineTo(bx,by+bh); c.lineTo(bx+bw,by+bh); c.lineTo(bx+bw,by); c.stroke();

      // Settled precipitate layer
      const settled=S.particles.filter(p=>p.settled);
      if(settled.length>0){
        const layerH=Math.min(settled.length*2,60);
        c.fillStyle=p.col+'CC'; c.fillRect(bx+2,by+bh-layerH,bw-4,layerH);
        c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(10,w*0.020)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(p.ppt+'↓ — '+p.name+' (راسب)', bx+bw/2, by+bh-layerH/2);
      }

      // Falling particles
      S.particles.filter(pp=>!pp.settled).forEach(pp=>{
        c.fillStyle=p.col+'AA'; c.beginPath(); c.arc(pp.x,pp.y,4,0,Math.PI*2); c.fill();
      });

      // Aqueous label
      c.fillStyle='#27AE60'; c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText(p.aq+'(aq) يبقى في المحلول', bx+bw/2, by+20);
    }

    // Equation
    const eby=h*0.82, ebh=h*0.10;
    c.fillStyle='rgba(255,255,255,0.85)'; c.beginPath(); c.roundRect(w*0.04,eby,w*0.92,ebh,10); c.fill();
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(9,w*0.017)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(p.a+'(aq) + '+p.b+'(aq) → '+p.ppt+'(s)↓ + '+p.aq+'(aq)', w/2, eby+ebh/2);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 8-4 TAB 3: اختيار طريقة التحضير المناسبة ───
function simG9SaltTitra3(){
  cancelAnimationFrame(animFrame);
  simState={t:0, selSalt:0, answered:false, chosen:-1};
  const S=simState;

  const salts=[
    {name:'NaCl',full:'كلوريد الصوديوم',soluble:true, method:'معايرة (HCl + NaOH)',why:'كلاهما ذائب → نحتاج كاشفاً للتعادل'},
    {name:'MgSO₄',full:'كبريتات الماغنيسيوم',soluble:true, method:'Mg + H₂SO₄ (فائض+ترشيح)',why:'Mg فلز نشيط → حمض + فلز بالفائض'},
    {name:'Cu(OH)₂',full:'هيدروكسيد النحاس',soluble:false, method:'ترسيب (CuSO₄ + NaOH)',why:'غير ذائب → نُرسّبه من محلولين'},
    {name:'BaSO₄',full:'كبريتات الباريوم',soluble:false, method:'ترسيب (BaCl₂ + MgSO₄)',why:'غير ذائب جداً → ترسيب مباشر'},
  ];
  const methods=['معايرة','فلز + حمض (فائض)','أكسيد + حمض','ترسيب'];
  const methodColors=['#1A8FA8','#9B59B6','#E67E22','#27AE60'];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🎯 اختر طريقة تحضير الملح المناسبة</div>
      <div class="ctrl-btns-grid-1">
        ${salts.map((s,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="salt-btn-${i}" onclick="simState.selSalt=${i};simState.answered=false;simState.chosen=-1;document.querySelectorAll('[id^=salt-btn-]').forEach((b,j)=>b.classList.toggle('active',j===${i}))">${s.name} (${s.soluble?'ذائب':'غير ذائب'})</button>`).join('')}
      </div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ القاعدة العامة لاختيار الطريقة؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">
        ✅ ذائب + كلاهما أيون → معايرة<br>
        ✅ ذائب + فلز نشيط → فائض + ترشيح<br>
        ✅ ذائب + أكسيد/كربونات → فائض + ترشيح + تبخير<br>
        ✅ غير ذائب → ترسيب مباشر
      </div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9salttitra'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const salt=salts[S.selSalt||0];
    const correct=methods.indexOf(salt.method.split(' ')[0]);

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#E8F5E9'); bg.addColorStop(1,'#C8E6C9');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText('كيف نُحضِّر '+salt.name+' ('+salt.full+')?', w/2, h*0.08);

    // Solubility badge
    const sCol=salt.soluble?'#27AE60':'#C0392B';
    c.fillStyle=sCol+'22'; c.beginPath(); c.roundRect(w*0.36,h*0.12,w*0.28,h*0.07,20); c.fill();
    c.fillStyle=sCol; c.font=`bold ${Math.max(11,w*0.021)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(salt.soluble?'💧 ذائب في الماء':'🚫 غير ذائب', w*0.5, h*0.155);

    // Method buttons
    const optW=Math.min(w*0.43,190), optH=Math.min(h*0.10,44), gx=Math.min(w*0.04,16), gy=Math.min(h*0.03,12);
    methods.forEach((meth,i)=>{
      const col=i%2, row=Math.floor(i/2);
      const ox=w*0.05+col*(optW+gx)+(w-2*optW-gx)*0.05;
      const oy=h*0.26+row*(optH+gy);
      const isChosen=S.chosen===i;
      const corrIdx=['معايرة','فلز','أكسيد','ترسيب'].findIndex(k=>salt.method.includes(k));
      const isCorrect=S.answered && i===corrIdx;
      const isWrong=S.answered && isChosen && i!==corrIdx;

      c.fillStyle=isCorrect?'rgba(39,174,96,0.2)':isWrong?'rgba(192,57,43,0.15)':isChosen?methodColors[i]+'22':'rgba(255,255,255,0.75)';
      c.beginPath(); c.roundRect(ox,oy,optW,optH,10); c.fill();
      c.strokeStyle=isCorrect?'#27AE60':isWrong?'#C0392B':isChosen?methodColors[i]:'#ccc';
      c.lineWidth=2; c.beginPath(); c.roundRect(ox,oy,optW,optH,10); c.stroke();
      c.fillStyle=isChosen?methodColors[i]:'#1E2D3D';
      c.font=`${Math.max(10,w*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(meth, ox+optW/2, oy+optH/2);
    });

    // Feedback
    if(S.answered){
      const fbx=w*0.05, fby=h*0.59, fbw=w*0.9, fbh=h*0.14;
      c.fillStyle='rgba(39,174,96,0.12)'; c.beginPath(); c.roundRect(fbx,fby,fbw,fbh,12); c.fill();
      c.fillStyle='#27AE60'; c.font=`bold ${Math.max(11,w*0.021)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
      c.fillText('✅ الطريقة الصحيحة: '+salt.method, w/2, fby+8);
      c.fillStyle='#555'; c.font=`${Math.max(9,w*0.016)}px Tajawal`;
      c.fillText('السبب: '+salt.why, w/2, fby+fbh*0.55);
    }

    // Hint
    c.fillStyle='#6B4E9A'; c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText('💡 اضغط على الطريقة التي تختارها', w/2, h*0.56);

    animFrame=requestAnimationFrame(draw);
  }

  document.getElementById('simCanvas').onclick=function(e){
    if(S.answered) return;
    const rect=this.getBoundingClientRect(), mx=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX-rect.left)*(this.width/rect.width), my=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientY-rect.top)*(this.height/rect.height);
    const w=this.width, h=this.height;
    const optW=Math.min(w*0.43,190), optH=Math.min(h*0.10,44), gx=Math.min(w*0.04,16), gy=Math.min(h*0.03,12);
    methods.forEach((m,i)=>{
      const col=i%2, row=Math.floor(i/2);
      const ox=w*0.05+col*(optW+gx)+(w-2*optW-gx)*0.05, oy=h*0.26+row*(optH+gy);
      if(mx>=ox&&mx<=ox+optW&&my>=oy&&my<=oy+optH){ S.chosen=i; S.answered=true; }
    });
  };
  draw();
}
