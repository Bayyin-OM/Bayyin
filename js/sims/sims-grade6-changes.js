// ══════════════════════════════════════════════════════════════
// الوحدة ٣ · تغيّرات المادة — الصف السادس (الفصل الدراسي الأول)
// المرجع: كتاب العلوم للصف السادس — ص٥٤ - ٦٨
// ══════════════════════════════════════════════════════════════

function g6cBg(dark){ return dark ? '#1A140F' : '#FBF3E9'; }
function g6cCard(dark){ return dark ? '#241C14' : '#FFFFFF'; }
function g6cTxt(dark){ return dark ? '#F5E6D3' : '#3A2A18'; }
function g6cMut(dark){ return dark ? '#C9A87E' : '#8A6D4E'; }
function g6cAccent(){ return '#E67E22'; }
function g6cGp(cv, e){
  const r = cv.getBoundingClientRect(), sc = cv.width / r.width;
  const s = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
  return { x: (s.clientX - r.left) * sc, y: (s.clientY - r.top) * sc };
}
function g6cIsDark(){ return document.documentElement.classList.contains('dark-mode'); }
function g6cSnd(ok){ try{ ok ? _g8pPlayDrop() : _g8pPlayClick(); }catch(e){} }
function g6cLerp(a,b,t){ return a+(b-a)*Math.max(0,Math.min(1,t)); }
function g6cClamp(v,a,b){ return Math.max(a,Math.min(b,v)); }

/* ══════════════════════════════════════════════════════════
   ١-٣ (أ) — استقصاء: ذوبان الثلج وتجمّده (تغيّر قابل للعكس)
   ══════════════════════════════════════════════════════════ */
function simG6Chg1a(){
  cancelAnimationFrame(animFrame);
  simState = { phase:'idle', t:0, ice:1, predictChoice:null, predictShown:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  const PREDICT_OPTS = [
    { id:'ice',   text:'❄️ سيتحوّل إلى ثلج مرة أخرى' },
    { id:'water', text:'💧 سيبقى ماءً إلى الأبد' },
    { id:'gas',   text:'💨 سيتحوّل إلى بخار' },
  ];

  function panel(){
    let html = '<div class="ctrl-section"><div class="ctrl-label">🔬 استقصاء: ماذا يحدث للثلج؟</div>';
    if(S.phase==='idle'){
      html += '<div style="font-size:13px;color:var(--text-secondary);line-height:1.9;margin-bottom:10px">اضغط الزر لوضع مكعب الثلج في الشمس، وراقب ماذا يحدث له.</div></div>' +
        '<button class="ctrl-btn play" onclick="window._g6c1aMelt()">☀️ ضع الثلج في الشمس</button>';
      controls(html); return;
    }
    if(S.phase==='melting'){
      html += '<div style="font-size:13px;color:var(--text-secondary);line-height:1.9">الثلج يذوب تدريجياً بفعل الحرارة... 🔥</div></div>';
      controls(html); return;
    }
    if(S.phase==='melted' && !S.predictShown){
      html += '<div class="info-box">💧 لاحظ أنّ الثلج تحوّل الآن بالكامل إلى ماء سائل.</div></div>' +
        '<div class="ctrl-section"><div class="ctrl-label">🤔 توقّع الآن</div>' +
        '<div style="font-size:14px;font-weight:700;margin-bottom:10px">إذا وضعنا هذا الماء في الثلاّجة، ماذا تتوقّع أن يحدث؟</div>' +
        '<div style="display:flex;flex-direction:column;gap:8px">' +
        PREDICT_OPTS.map(o=>`<button class="ctrl-btn" onclick="window._g6c1aPredict('${o.id}')" style="text-align:right">${o.text}</button>`).join('') +
        '</div></div>';
      controls(html); return;
    }
    if(S.phase==='melted' && S.predictShown){
      html += '<div class="info-box">💭 توقّعك: '+ PREDICT_OPTS.find(o=>o.id===S.predictChoice).text +'</div></div>' +
        '<div class="ctrl-section"><button class="ctrl-btn play" onclick="window._g6c1aFreeze()">🧊 ضعه في الثلاّجة الآن</button></div>';
      controls(html); return;
    }
    if(S.phase==='freezing'){
      html += '<div style="font-size:13px;color:var(--text-secondary);line-height:1.9">البرودة تسحب الحرارة من الماء رويداً رويداً... ❄️</div></div>';
      controls(html); return;
    }
    if(S.phase==='frozen'){
      const correct = S.predictChoice==='ice';
      html += '<div class="info-box">'+(correct
        ? '💡 أحسنت! توقّعك كان صحيحاً — عاد الماء ثلجاً تماماً كما كان في البداية.'
        : '💡 لاحظ أنّ الماء عاد ثلجاً من جديد، تماماً كما كان قبل أن يذوب! جرّب في المرة القادمة أن تُلاحظ ماذا حدث للثلج أول مرة قبل أن تتوقّع.') +
        '</div></div>' +
        '<div class="ctrl-section"><div class="ctrl-label">🧠 الاستنتاج</div>' +
        '<div class="info-box" style="border-color:#27AE60">🔁 هذا النوع من التغيّر يُسمّى <b>تغيّراً قابلاً للعكس</b>؛ لأنّ المادّة (الماء) عادت إلى حالتها الأصلية (الثلج) دون أن تتكوّن مادّة جديدة.</div>' +
        '<button class="ctrl-btn reset" onclick="window._g6c1aRestart()">↺ أعد التجربة</button>' +
        '<button class="ctrl-btn action" onclick="switchSimTab(1)">التالي: عود الثقاب 🔥 ←</button></div>';
      controls(html); return;
    }
  }

  window._g6c1aMelt = function(){
    if(S.phase!=='idle') return;
    g6cSnd(true); S.phase='melting'; S.t=0; panel();
  };
  window._g6c1aPredict = function(id){
    S.predictChoice=id; S.predictShown=true; g6cSnd(true); panel();
  };
  window._g6c1aFreeze = function(){
    if(S.phase!=='melted') return;
    g6cSnd(true); S.phase='freezing'; S.t=0; panel();
  };
  window._g6c1aRestart = function(){
    simState = { phase:'idle', t:0, ice:1, predictChoice:null, predictShown:false };
    panel();
  };
  panel();

  function draw(){
    if(currentSim!=='g6changes1'||currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const dark=g6cIsDark(); const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=g6cBg(dark); c.fillRect(0,0,w,h);
    S.t++;

    if(S.phase==='melting'){ S.ice = g6cClamp(S.ice - 0.008, 0, 1); if(S.ice<=0){ S.phase='melted'; panel(); } }
    if(S.phase==='freezing'){ S.ice = g6cClamp(S.ice + 0.008, 0, 1); if(S.ice>=1){ S.phase='frozen'; g6cSnd(true); panel(); } }

    const cx=w*0.5, cy=h*0.5, dishR=w*0.22;
    // طبق
    c.fillStyle = dark?'#3A2E1E':'#E8D5B5'; c.strokeStyle=g6cMut(dark); c.lineWidth=w*0.006;
    c.beginPath(); c.ellipse(cx,cy+dishR*0.75,dishR*1.15,dishR*0.32,0,0,Math.PI*2); c.fill(); c.stroke();

    // ماء متجمّع (يزداد كلما ذاب الثلج)
    const waterLevel = 1-S.ice;
    if(waterLevel>0.02){
      c.save();
      c.beginPath(); c.ellipse(cx,cy+dishR*0.75,dishR*1.1,dishR*0.28,0,0,Math.PI*2); c.clip();
      c.fillStyle = dark?'rgba(56,189,248,0.55)':'rgba(41,128,185,0.45)';
      c.beginPath(); c.ellipse(cx,cy+dishR*0.75, dishR*1.1*waterLevel+dishR*0.15, dishR*0.28*waterLevel+dishR*0.06, 0,0,Math.PI*2); c.fill();
      c.restore();
    }

    // مكعّب الثلج (يتقلّص)
    if(S.ice>0.01){
      const size = dishR*1.15*S.ice;
      c.save();
      c.translate(cx, cy - dishR*0.15*S.ice);
      const alpha = 0.55+0.35*S.ice;
      c.fillStyle = `rgba(186,230,253,${alpha})`;
      c.strokeStyle = `rgba(56,189,248,${alpha})`; c.lineWidth=w*0.005;
      c.beginPath();
      if(c.roundRect) c.roundRect(-size/2,-size/2,size,size,size*0.15); else c.rect(-size/2,-size/2,size,size);
      c.fill(); c.stroke();
      c.restore();
    }

    // شمس أو ثلاجة حسب الطور
    c.textAlign='center'; c.textBaseline='middle';
    if(S.phase==='melting' || S.phase==='idle'){
      c.font=`${w*0.09}px serif`;
      c.fillText('☀️', cx, cy - dishR*1.7);
    }
    if(S.phase==='freezing' || S.phase==='frozen'){
      c.font=`${w*0.09}px serif`;
      c.fillText('❄️', cx, cy - dishR*1.7);
    }

    c.font=`bold ${Math.round(h*0.022)}px Tajawal`; c.fillStyle=g6cTxt(dark);
    const label = {idle:'مكعّب ثلج 🧊', melting:'الثلج يذوب...', melted:'أصبح ماءً 💧', freezing:'الماء يتجمّد...', frozen:'عاد ثلجاً مجدداً! 🧊'}[S.phase];
    c.fillText(label, cx, h*0.86);

    g6cTitleBar(c,w,h,dark,'١-٣ (أ) · ذوبان الثلج وتجمّده');
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   ١-٣ (ب) — استقصاء: إشعال عود الثقاب (تغيّر غير قابل للعكس)
   ══════════════════════════════════════════════════════════ */
function simG6Chg1b(){
  cancelAnimationFrame(animFrame);
  simState = { phase:'idle', t:0, burn:0, predictChoice:null, predictShown:false, tried:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function panel(){
    let html = '<div class="ctrl-section"><div class="ctrl-label">🔬 استقصاء: إشعال عود الثقاب</div>';
    if(S.phase==='idle'){
      html += '<div style="font-size:13px;color:var(--text-secondary);line-height:1.9;margin-bottom:10px">اضغط الزر لإشعال عود الثقاب، وراقب ماذا يحدث له.</div></div>' +
        '<button class="ctrl-btn play" onclick="window._g6c1bBurn()">🔥 أشعل عود الثقاب</button>';
      controls(html); return;
    }
    if(S.phase==='burning'){
      html += '<div style="font-size:13px;color:var(--text-secondary);line-height:1.9">النار تلتهم الخشب... 🔥</div></div>';
      controls(html); return;
    }
    if(S.phase==='burned' && !S.predictShown){
      html += '<div class="info-box">🖤 لاحظ أنّ عود الثقاب احترق بالكامل وتحوّل إلى مادّة سوداء.</div></div>' +
        '<div class="ctrl-section"><div class="ctrl-label">🤔 توقّع الآن</div>' +
        '<div style="font-size:14px;font-weight:700;margin-bottom:10px">هل تعتقد أنّه يمكن إرجاع العود المحترق إلى شكله الأوّل (الخشب) إذا بَرَّدناه؟</div>' +
        '<div style="display:flex;flex-direction:column;gap:8px">' +
        '<button class="ctrl-btn" onclick="window._g6c1bPredict(\'yes\')">نعم، يمكن إرجاعه</button>' +
        '<button class="ctrl-btn" onclick="window._g6c1bPredict(\'no\')">لا، لا يمكن إرجاعه</button>' +
        '</div></div>';
      controls(html); return;
    }
    if(S.phase==='burned' && S.predictShown && !S.tried){
      html += '<div class="ctrl-section"><button class="ctrl-btn play" onclick="window._g6c1bTry()">↺ حاول إرجاعه (برّده)</button></div>';
      controls(html); return;
    }
    if(S.tried){
      const correct = S.predictChoice==='no';
      html += '<div class="info-box">'+(correct
        ? '💡 أحسنت! توقّعك كان صحيحاً — لم يتغيّر شيء مهما بَرَّدنا العود.'
        : '💡 لاحظ أنّه لم يحدث شيء عندما حاولنا تبريده! العود يبقى أسود مهما فعلنا.') +
        ' الخشب تحوّل إلى مادّة جديدة تماماً (الكربون الأسود) ولا يمكن إرجاعه إلى الخشب الأصلي.</div></div>' +
        '<div class="ctrl-section"><div class="ctrl-label">🧠 الاستنتاج</div>' +
        '<div class="info-box" style="border-color:#E74C3C">🔥 هذا النوع من التغيّر يُسمّى <b>تغيّراً غير قابل للعكس</b>؛ لأنّه تكوّنت مادّة جديدة (الكربون) لا يمكن الرجوع منها إلى المادّة الأصلية.</div>' +
        '<button class="ctrl-btn reset" onclick="window._g6c1bRestart()">↺ أعد التجربة</button>' +
        '<button class="ctrl-btn action" onclick="switchSimTab(2)">التالي: صنّف التغيّرات 🧩 ←</button></div>';
      controls(html); return;
    }
  }

  window._g6c1bBurn = function(){ if(S.phase!=='idle') return; g6cSnd(true); S.phase='burning'; S.t=0; panel(); };
  window._g6c1bPredict = function(id){ S.predictChoice=id; S.predictShown=true; g6cSnd(true); panel(); };
  window._g6c1bTry = function(){ S.tried=true; g6cSnd(S.predictChoice==='no'); panel(); };
  window._g6c1bRestart = function(){
    simState = { phase:'idle', t:0, burn:0, predictChoice:null, predictShown:false, tried:false };
    panel();
  };
  panel();

  function draw(){
    if(currentSim!=='g6changes1'||currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const dark=g6cIsDark(); const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=g6cBg(dark); c.fillRect(0,0,w,h);
    S.t++;

    if(S.phase==='burning'){ S.burn = g6cClamp(S.burn+0.012,0,1); if(S.burn>=1){ S.phase='burned'; g6cSnd(true); panel(); } }

    const cx=w*0.5, cy=h*0.55;
    const stickLen=h*0.34, stickW=w*0.022;

    c.save();
    c.translate(cx,cy);
    c.rotate(-Math.PI*0.06);
    // جسم العود: الجزء المحترق أسود من الأعلى بنسبة S.burn
    const woodCol = dark?'#C9A87E':'#C89B6C';
    const charCol = '#1C1815';
    const burnY = -stickLen/2 + stickLen*S.burn;
    // خشب
    c.fillStyle = woodCol;
    c.fillRect(-stickW/2, burnY, stickW, stickLen/2 - burnY + stickLen/2);
    // الجزء المتفحّم
    c.fillStyle = charCol;
    c.fillRect(-stickW/2, -stickLen/2, stickW, burnY+stickLen/2);
    // رأس الكبريت (يختفي بعد الاحتراق مباشرة)
    if(S.burn<0.08){
      c.fillStyle = '#B03A2E';
      c.beginPath(); c.arc(0,-stickLen/2, stickW*1.1, 0, Math.PI*2); c.fill();
    }
    c.restore();

    // لهب متحرّك عند نقطة الاحتراق
    if(S.phase==='burning'){
      const flameY = cy - stickLen/2 + stickLen*S.burn - stickLen*0.02;
      const flameX = cx + Math.sin(-Math.PI*0.06)*0;
      c.save();
      c.translate(cx + (stickLen*S.burn)*Math.sin(Math.PI*0.06)*-1, flameY);
      const flick = Math.sin(S.t*0.5)*w*0.006;
      c.font=`${w*0.055}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('🔥', flick, 0);
      c.restore();
      // دخان بسيط
      c.fillStyle = dark? 'rgba(200,200,200,0.25)':'rgba(100,100,100,0.22)';
      for(let i=0;i<3;i++){
        const sy = flameY - w*0.03 - i*w*0.03 - (S.t%40)*0.5;
        c.beginPath(); c.arc(cx-stickLen*S.burn*Math.sin(Math.PI*0.06)+i*4, sy, w*0.012+i*2, 0, Math.PI*2); c.fill();
      }
    }

    c.font=`bold ${Math.round(h*0.022)}px Tajawal`; c.fillStyle=g6cTxt(dark); c.textAlign='center';
    const label = {idle:'عود ثقاب 🩹', burning:'يحترق...', burned:'احترق بالكامل 🖤'}[S.phase] || (S.tried?'ما زال أسود، لم يتغيّر شيء':'احترق بالكامل 🖤');
    c.fillText(label, cx, h*0.86);

    g6cTitleBar(c,w,h,dark,'١-٣ (ب) · إشعال عود الثقاب');
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   ١-٣ (ج) — صنّف التغيّرات + التحدي النهائي (الفشار)
   ══════════════════════════════════════════════════════════ */
var G6C_ITEMS = [
  { id:'i1', text:'تجمّد الماء إلى ثلج',       correct:'rev', home:{x:0.14,y:0.22} },
  { id:'i2', text:'طيّ ورقة',                  correct:'rev', home:{x:0.14,y:0.36} },
  { id:'i3', text:'انصهار الشمع ثم تصلّبه',    correct:'rev', home:{x:0.14,y:0.50} },
  { id:'i4', text:'احتراق ورقة',                correct:'irr', home:{x:0.62,y:0.22} },
  { id:'i5', text:'صدأ مسمار حديدي',            correct:'irr', home:{x:0.62,y:0.36} },
  { id:'i6', text:'خبز عجينة الكعك في الفرن',   correct:'irr', home:{x:0.62,y:0.50} },
];
function simG6Chg1c(){
  cancelAnimationFrame(animFrame);
  simState = { placed:{}, dragId:null, dragX:0, dragY:0, wrong:null, wrongT:0, done:false, challengeAnswered:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const ZONES = [
    { id:'rev', label:'قابل للعكس 🔁', x:0.27, col:'#27AE60' },
    { id:'irr', label:'غير قابل للعكس 🔥', x:0.73, col:'#E74C3C' },
  ];

  function panel(){
    const n = Object.keys(S.placed).length;
    let html = '';
    if(!S.done){
      html = '<div class="ctrl-section"><div class="ctrl-label">🧩 صنّف التغيّرات</div>' +
        '<div style="font-size:13px;color:var(--text-secondary);line-height:1.9">اسحب كل بطاقة إلى المكان الصحيح: قابل للعكس أم غير قابل للعكس؟ ('+n+' من '+G6C_ITEMS.length+')</div></div>';
      controls(html); return;
    }
    if(!S.challengeAnswered){
      html = '<div class="ctrl-section"><div class="ctrl-label">🎉 أحسنت! صنّفت كل التغيّرات بنجاح</div></div>' +
        '<div class="ctrl-section"><div class="ctrl-label">🏆 التحدي النهائي</div>' +
        '<div style="font-size:14px;font-weight:700;line-height:1.8;margin-bottom:10px">سُخِّن الزيت في إناء الطهو، وعند إضافة حبيبات الذرة بدأت — بعد دقيقة — بالفرقعة لتتحوّل إلى فِشار. هل هذا تغيّر قابل للعكس أم غير قابل للعكس؟</div>' +
        '<div style="display:flex;flex-direction:column;gap:8px">' +
        '<button id="g6c1cOpt0" class="ctrl-btn" onclick="window._g6c1cChallenge(0)">قابل للعكس</button>' +
        '<button id="g6c1cOpt1" class="ctrl-btn" onclick="window._g6c1cChallenge(1)">غير قابل للعكس</button>' +
        '</div><div id="g6c1cFb" style="margin-top:10px;font-size:13px;color:var(--text-secondary);line-height:1.8"></div></div>';
      controls(html); return;
    }
    html = '<div class="ctrl-section"><div class="ctrl-label">🎉 أحسنت في كل شيء!</div>' +
      '<div class="info-box">تذكّر: إذا تكوّنت مادّة جديدة (كالكربون أو الفِشار) فالتغيّر غالباً <b>غير قابل للعكس</b>. أمّا إذا بقيت المادّة نفسها وتغيّر شكلها أو حالتها فقط، فالتغيّر <b>قابل للعكس</b>.</div>' +
      '<button class="ctrl-btn reset" onclick="window._g6c1cRestart()">↺ أعد النشاط</button></div>';
    controls(html);
  }

  window._g6c1cChallenge = function(i){
    if(S.challengeAnswered) return; S.challengeAnswered=true;
    const ok = i===1; g6cSnd(ok);
    const btn = document.getElementById('g6c1cOpt'+i);
    if(btn){ btn.style.background = ok?'#27AE60':'#E74C3C'; btn.style.color='white'; btn.style.borderColor= ok?'#27AE60':'#E74C3C'; }
    if(!ok){ const okBtn=document.getElementById('g6c1cOpt1'); if(okBtn){ okBtn.style.background='#27AE60'; okBtn.style.color='white'; okBtn.style.borderColor='#27AE60'; } }
    const fb = document.getElementById('g6c1cFb');
    if(fb) fb.innerHTML = '💡 صحيح! حبّة الذرة تحوّلت إلى مادّة جديدة تماماً (الفِشار) بفعل الحرارة، ولا يمكن ضغط الفِشار لإعادته حبّة ذرة مرّة أخرى — لذلك هذا تغيّر غير قابل للعكس.';
    setTimeout(()=>panel(), 300);
  };
  window._g6c1cRestart = function(){
    simState = { placed:{}, dragId:null, dragX:0, dragY:0, wrong:null, wrongT:0, done:false, challengeAnswered:false };
    panel();
  };

  function hitChip(p,w,h){
    for(const it of G6C_ITEMS){
      if(S.placed[it.id]) continue;
      const hx=it.home.x*w, hy=it.home.y*h;
      if(Math.abs(p.x-hx)<w*0.16 && Math.abs(p.y-hy)<h*0.05) return it;
    }
    return null;
  }
  function onDown(e){ if(S.done) return; const p=g6cGp(cv,e); const it=hitChip(p,cv.width,cv.height); if(it){ S.dragId=it.id; S.dragX=p.x; S.dragY=p.y; } }
  function onMove(e){ if(!S.dragId) return; e.preventDefault&&e.preventDefault(); const p=g6cGp(cv,e); S.dragX=p.x; S.dragY=p.y; }
  function onUp(){
    if(!S.dragId) return;
    const it = G6C_ITEMS.find(x=>x.id===S.dragId);
    const w=cv.width, h=cv.height;
    let hitZone=null;
    for(const z of ZONES){ if(Math.abs(S.dragX-z.x*w)<w*0.18 && S.dragY>h*0.6) { hitZone=z; break; } }
    if(hitZone && hitZone.id===it.correct){
      S.placed[it.id]=hitZone.id; g6cSnd(true);
      if(Object.keys(S.placed).length===G6C_ITEMS.length) S.done=true;
      panel();
    } else if(hitZone){
      S.wrong=it.id; S.wrongT=30; g6cSnd(false);
    }
    S.dragId=null;
  }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;
  panel();

  function drawChip(c,text,x,y,w,h,dark,state){
    c.save();
    const isWarn = state==='warn', isOk = state==='ok';
    c.fillStyle = isWarn ? 'rgba(231,76,60,0.9)' : isOk ? 'rgba(39,174,96,0.9)' : g6cCard(dark);
    c.strokeStyle = isWarn ? '#E74C3C' : isOk ? '#27AE60' : g6cAccent();
    c.lineWidth=2;
    const cw=w*0.30, ch=h*0.075;
    c.beginPath();
    if(c.roundRect) c.roundRect(x-cw/2,y-ch/2,cw,ch,10); else c.rect(x-cw/2,y-ch/2,cw,ch);
    c.fill(); c.stroke();
    c.font=`bold ${Math.round(h*0.017)}px Tajawal`;
    c.fillStyle = (isWarn||isOk) ? '#fff' : g6cTxt(dark);
    c.textAlign='center'; c.textBaseline='middle';
    c.fillText(text, x, y+1);
    c.restore();
  }

  function draw(){
    if(currentSim!=='g6changes1'||currentTab!==2){ cancelAnimationFrame(animFrame); return; }
    const dark=g6cIsDark(); const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=g6cBg(dark); c.fillRect(0,0,w,h);
    if(S.wrongT>0) S.wrongT--; else S.wrong=null;

    ZONES.forEach(z=>{
      c.save();
      c.fillStyle = z.col+'18'; c.strokeStyle=z.col+'90'; c.lineWidth=2; c.setLineDash([6,5]);
      const zx=z.x*w, zy=h*0.6, zw=w*0.36, zh=h*0.32;
      c.beginPath(); c.roundRect ? c.roundRect(zx-zw/2,zy,zw,zh,14) : c.rect(zx-zw/2,zy,zw,zh);
      c.fill(); c.stroke(); c.setLineDash([]);
      c.fillStyle=z.col; c.font=`bold ${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
      c.fillText(z.label, zx, zy+zh+h*0.045);
      c.restore();
    });

    const stacks={};
    G6C_ITEMS.forEach(it=>{
      if(!S.placed[it.id]) return;
      const z = ZONES.find(zz=>zz.id===S.placed[it.id]);
      stacks[z.id]=(stacks[z.id]||0);
      const idx=stacks[z.id]++;
      const zx=z.x*w, zy=h*0.6+h*0.055+idx*h*0.09;
      drawChip(c, it.text, zx, zy, w, h, dark, 'ok');
    });

    G6C_ITEMS.forEach(it=>{
      if(S.placed[it.id]||S.dragId===it.id) return;
      const hx=it.home.x*w, hy=it.home.y*h;
      const shake = (S.wrong===it.id) ? Math.sin(S.wrongT*2)*w*0.01 : 0;
      drawChip(c, it.text, hx+shake, hy, w, h, dark, S.wrong===it.id?'warn':null);
    });

    if(S.dragId){
      const it = G6C_ITEMS.find(x=>x.id===S.dragId);
      drawChip(c, it.text, S.dragX, S.dragY, w, h, dark, null);
    }

    if(!S.done){
      c.fillStyle=g6cMut(dark); c.font=`${Math.round(h*0.017)}px Tajawal`; c.textAlign='center';
      c.fillText(`اكتمل ${Object.keys(S.placed).length} من ٦ 🔗`, w/2, h*0.95);
    }

    g6cTitleBar(c,w,h,dark,'١-٣ (ج) · صنّف التغيّرات');
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// شريط عنوان بسيط أعلى الكانفس (نفس نمط بقية المحاكيات)
function g6cTitleBar(c,w,h,dark,text){
  c.save();
  c.fillStyle = g6cMut(dark); c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='right'; c.textBaseline='top';
  c.fillText(text, w*0.98, h*0.015);
  c.restore();
}

/* ══════════════════════════════════════════════════════════════
   الدرس ٢-٣ + ٤-٣ (مدمجان) — اختر طريقة الفصل الصحيحة
   ══════════════════════════════════════════════════════════════ */

// بطاقة عام لعرض بطاقة/شريحة مع حالات (عادي / صحيح / خطأ)
function g6cChip(c,text,x,y,w,h,dark,state){
  c.save();
  const isWarn = state==='warn', isOk = state==='ok';
  c.fillStyle = isWarn ? 'rgba(231,76,60,0.9)' : isOk ? 'rgba(39,174,96,0.9)' : g6cCard(dark);
  c.strokeStyle = isWarn ? '#E74C3C' : isOk ? '#27AE60' : g6cAccent();
  c.lineWidth=2;
  const cw=w*0.27, ch=h*0.072;
  c.beginPath();
  if(c.roundRect) c.roundRect(x-cw/2,y-ch/2,cw,ch,10); else c.rect(x-cw/2,y-ch/2,cw,ch);
  c.fill(); c.stroke();
  c.font=`bold ${Math.round(h*0.0155)}px Tajawal`;
  c.fillStyle = (isWarn||isOk) ? '#fff' : g6cTxt(dark);
  c.textAlign='center'; c.textBaseline='middle';
  c.fillText(text, x, y+1);
  c.restore();
}

/* ── تبويب أ: غربال أم فرز باليد؟ (٢-٣) ── */
var G6C_SIEVE_ROUNDS = [
  { id:'r1', label:'حصى كبير + رمل ناعم', big:{emoji:'🪨',name:'حصى'}, small:{emoji:'🟤',name:'رمل'}, correct:'sieve' },
  { id:'r2', label:'حبّات فول سوداني + زبيب', big:{emoji:'🥜',name:'فول سوداني'}, small:{emoji:'🍇',name:'زبيب'}, correct:'hand' },
];
function _g6c2aBuildParticles(round){
  const arr=[];
  for(let i=0;i<7;i++) arr.push({ type:'big', emoji:round.big.emoji, nx:0.2+Math.random()*0.6, ny:0.22+Math.random()*0.18, t:0, done:false });
  for(let i=0;i<7;i++) arr.push({ type:'small', emoji:round.small.emoji, nx:0.2+Math.random()*0.6, ny:0.22+Math.random()*0.18, t:0, done:false });
  return arr;
}
function simG6Chg2a(){
  cancelAnimationFrame(animFrame);
  simState = { roundIdx:0, phase:'choose', t:0, success:null, particles:_g6c2aBuildParticles(G6C_SIEVE_ROUNDS[0]) };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function round(){ return G6C_SIEVE_ROUNDS[S.roundIdx]; }

  function panel(){
    const r = round();
    let html = '<div class="ctrl-section"><div class="ctrl-label">🔬 استقصاء: افصل المخلوط الصلب</div>' +
      '<div style="font-size:13px;color:var(--text-secondary);line-height:1.9;margin-bottom:6px">الجولة '+(S.roundIdx+1)+' من '+G6C_SIEVE_ROUNDS.length+' — المخلوط: <b>'+r.label+'</b></div></div>';
    if(S.phase==='choose'){
      html += '<div class="ctrl-section"><div class="ctrl-label">🤔 أي أداة تختار؟</div>' +
        '<div style="display:flex;flex-direction:column;gap:8px">' +
        '<button class="ctrl-btn" onclick="window._g6c2aChoose(\'sieve\')">🔲 الغربال</button>' +
        '<button class="ctrl-btn" onclick="window._g6c2aChoose(\'hand\')">✋ الفرز باليد</button>' +
        '</div></div>';
      controls(html); return;
    }
    if(S.phase==='running'){
      html += '<div style="font-size:13px;color:var(--text-secondary)">جارٍ الفصل... ⏳</div>';
      controls(html); return;
    }
    if(S.phase==='result'){
      if(S.success){
        html += '<div class="info-box" style="border-color:#27AE60">✅ نجحت! '+ (S.method==='sieve'
          ? 'حبيبات '+r.small.name+' الصغيرة مرّت عبر ثقوب الغربال، بينما بقيت حبيبات '+r.big.name+' الكبيرة فوقه.'
          : 'استطعت فرز كل حبّة بيدك لأن حجم '+r.big.name+' يختلف بوضوح عن '+r.small.name+' ويمكن تمييزها.') + '</div>';
        html += '<button class="ctrl-btn action" onclick="window._g6c2aNext()">'+(S.roundIdx<G6C_SIEVE_ROUNDS.length-1?'الجولة التالية ←':'التالي: الترشيح 🧻 ←')+'</button>';
      } else {
        html += '<div class="info-box" style="border-color:#E74C3C">❌ '+ S.failMsg +'</div>' +
          '<button class="ctrl-btn reset" onclick="window._g6c2aRetry()">↺ جرّب أداة أخرى</button>';
      }
      controls(html); return;
    }
    if(S.phase==='summary'){
      html += '<div class="ctrl-section"><div class="ctrl-label">🧠 ماذا تستنتج؟</div>' +
        '<div class="info-box">الغربال يعمل جيداً عندما تختلف حبيبات المخلوط بوضوح في الحجم (كالحصى والرمل). أمّا عندما تتشابه الحبيبات في الحجم (كالفول السوداني والزبيب)، فنحتاج إلى الفرز باليد.</div>' +
        '<button class="ctrl-btn action" onclick="switchSimTab(1)">التالي: الترشيح 🧻 ←</button></div>';
      controls(html); return;
    }
  }

  window._g6c2aChoose = function(method){
    const r = round();
    S.method = method; S.phase='running'; S.t=0;
    S.success = (method===r.correct);
    g6cSnd(true);
    panel();
  };
  window._g6c2aRetry = function(){
    S.phase='choose'; S.particles=_g6c2aBuildParticles(round()); panel();
  };
  window._g6c2aNext = function(){
    if(S.roundIdx<G6C_SIEVE_ROUNDS.length-1){
      S.roundIdx++; S.phase='choose'; S.particles=_g6c2aBuildParticles(round());
      panel();
    } else {
      S.phase='summary'; panel();
    }
  };
  panel();

  function draw(){
    if(currentSim!=='g6changes2'||currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const dark=g6cIsDark(); const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=g6cBg(dark); c.fillRect(0,0,w,h);
    S.t++;

    const r = round();
    const meshY = h*0.55;

    if(S.phase==='running'){
      S.t2 = (S.t2||0)+1;
      if(S.method==='sieve'){
        S.particles.forEach(p=>{
          if(S.success && p.type==='small'){ p.ny = g6cLerp(p.ny, 0.78, 0.03); }
          else if(S.success && p.type==='big'){ p.ny = g6cLerp(p.ny, meshY/h - 0.03, 0.03); }
          else { p.ny += Math.sin((S.t2+p.nx*40))*0.0015; } // اهتزاز بلا فصل عند الفشل
        });
      } else { // hand
        if(S.success){
          const idx = Math.floor(S.t2/12);
          S.particles.forEach((p,i)=>{
            if(i<=idx){
              const destX = p.type==='big'?0.25:0.75;
              p.nx=g6cLerp(p.nx,destX,0.25); p.ny=g6cLerp(p.ny,0.78,0.25);
            }
          });
        } else {
          S.particles.forEach(p=>{ p.nx += Math.sin(S.t2*0.2+p.ny*30)*0.001; });
        }
      }
      if(S.t2>=110){
        S.phase='result';
        if(!S.success){
          S.failMsg = S.method==='sieve'
            ? 'الغربال لم يفصل شيئاً! حبيبات '+r.big.name+' و'+r.small.name+' متقاربة في الحجم، فبقيت مختلطة فوق الغربال.'
            : 'حبيبات '+r.small.name+' صغيرة جداً ويصعب التقاطها واحدة تلو الأخرى باليد!';
        }
        S.t2=0; g6cSnd(!!S.success); panel();
      }
    }

    // إناء المخلوط
    c.strokeStyle=g6cMut(dark); c.lineWidth=w*0.005;
    c.beginPath(); c.rect(w*0.14,h*0.16,w*0.72,h*0.32); c.stroke();

    // الغربال (خط الشبكة) يظهر فقط إذا الطريقة المختارة sieve
    if(S.method==='sieve' && (S.phase==='running'||S.phase==='result')){
      c.save();
      c.strokeStyle = g6cAccent(); c.lineWidth=w*0.006;
      c.beginPath(); c.moveTo(w*0.14,meshY); c.lineTo(w*0.86,meshY); c.stroke();
      c.setLineDash([4,4]); c.lineWidth=1.5;
      for(let x=w*0.16;x<w*0.85;x+=w*0.03){ c.beginPath(); c.moveTo(x,meshY-4); c.lineTo(x,meshY+4); c.stroke(); }
      c.setLineDash([]);
      c.fillStyle=g6cMut(dark); c.font=`${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
      c.fillText('غربال 🔲', w*0.5, meshY-h*0.03);
      c.restore();
    }

    S.particles.forEach(p=>{
      c.font=`${w*0.028}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(p.emoji, p.nx*w, p.ny*h);
    });

    c.font=`bold ${Math.round(h*0.02)}px Tajawal`; c.fillStyle=g6cTxt(dark); c.textAlign='center';
    c.fillText(r.label, w*0.5, h*0.10);

    g6cTitleBar(c,w,h,dark,'٢-٣ · غربال أم فرز باليد؟');
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ── تبويب ب: الترشيح (٤-٣) ── */
function simG6Chg2b(){
  cancelAnimationFrame(animFrame);
  simState = { phase:'predict', predictChoice:null, pourT:0, specks:[] };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function panel(){
    let html = '<div class="ctrl-section"><div class="ctrl-label">🔬 استقصاء: فصل المخاليط بالترشيح</div>';
    if(S.phase==='predict'){
      html += '<div style="font-size:13px;color:var(--text-secondary);line-height:1.9;margin-bottom:10px">لدينا ماء مخلوط برمل ناعم (ماء موحل). سنمرّره عبر قمع ترشيح بداخله ورقة ترشيح.</div></div>' +
        '<div class="ctrl-section"><div class="ctrl-label">🤔 توقّع الآن</div>' +
        '<div style="font-size:14px;font-weight:700;margin-bottom:10px">ماذا سيحدث للماء الموحل بعد مروره عبر ورقة الترشيح؟</div>' +
        '<div style="display:flex;flex-direction:column;gap:8px">' +
        '<button class="ctrl-btn" onclick="window._g6c2bPredict(\'clear\')">سيصبح صافياً، ويبقى الرمل على الورقة</button>' +
        '<button class="ctrl-btn" onclick="window._g6c2bPredict(\'same\')">سيبقى موحلاً كما هو</button>' +
        '<button class="ctrl-btn" onclick="window._g6c2bPredict(\'gone\')">سيختفي الرمل تماماً من دون أثر</button>' +
        '</div></div>';
      controls(html); return;
    }
    if(S.phase==='ready'){
      html += '<div class="ctrl-section"><button class="ctrl-btn play" onclick="window._g6c2bPour()">🧻 ابدأ الترشيح</button></div>';
      controls(html); return;
    }
    if(S.phase==='pouring'){
      html += '<div style="font-size:13px;color:var(--text-secondary)">الماء يمرّ عبر الورقة... 💧</div>';
      controls(html); return;
    }
    if(S.phase==='done'){
      const correct = S.predictChoice==='clear';
      html += '<div class="info-box">'+(correct
        ? '💡 أحسنت! توقّعك كان صحيحاً — أصبح الماء صافياً وبقي الرمل على ورقة الترشيح.'
        : '💡 لاحظ أنّ الماء أصبح صافياً تماماً، بينما بقيت كل حبيبات الرمل على ورقة الترشيح ولم تختفِ.') +
        '</div></div>' +
        '<div class="ctrl-section"><div class="ctrl-label">🧠 الاستنتاج</div>' +
        '<div class="info-box" style="border-color:#27AE60">🧻 يحتوي <b>المرشِّح</b> على ثقوب دقيقة جداً تسمح بمرور جزيئات الماء الصغيرة، لكنها تمنع مرور حبيبات الرمل الأكبر — لذلك يُستخدم <b>الترشيح</b> لفصل مادّة صلبة غير قابلة للذوبان عن سائل.</div>' +
        '<button class="ctrl-btn reset" onclick="window._g6c2bRestart()">↺ أعد التجربة</button>' +
        '<button class="ctrl-btn action" onclick="switchSimTab(2)">التالي: التحدي الأخير 🏆 ←</button></div>';
      controls(html); return;
    }
  }

  window._g6c2bPredict = function(id){ S.predictChoice=id; S.phase='ready'; g6cSnd(true); panel(); };
  window._g6c2bPour = function(){
    S.phase='pouring'; S.pourT=0;
    S.specks=[];
    g6cSnd(true); panel();
  };
  window._g6c2bRestart = function(){
    simState = { phase:'predict', predictChoice:null, pourT:0, specks:[] };
    panel();
  };
  panel();

  function draw(){
    if(currentSim!=='g6changes2'||currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const dark=g6cIsDark(); const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=g6cBg(dark); c.fillRect(0,0,w,h);

    if(S.phase==='pouring'){
      S.pourT++;
      if(S.pourT%6===0 && S.specks.length<26){
        S.specks.push({ x:0.44+Math.random()*0.12, y:0.40, settled:false });
      }
      S.specks.forEach(sp=>{ if(!sp.settled){ sp.y=g6cLerp(sp.y,0.47,0.15); if(sp.y>0.465) sp.settled=true; } });
      if(S.pourT>=160){ S.phase='done'; g6cSnd(true); panel(); }
    }

    const cx=w*0.5;
    const funnelTopY=h*0.28, funnelBotY=h*0.48, cupTopY=h*0.55, cupBotY=h*0.82;
    const pourProgress = S.phase==='pouring' ? g6cClamp(S.pourT/160,0,1) : (S.phase==='done'?1:0);

    // الوعاء الأعلى (الماء الموحل) — يفرغ تدريجياً
    const topLevel = 1-pourProgress;
    if(topLevel>0.02 && (S.phase==='predict'||S.phase==='ready'||S.phase==='pouring')){
      c.save();
      c.beginPath(); c.moveTo(cx-w*0.14,funnelTopY); c.lineTo(cx+w*0.14,funnelTopY); c.lineTo(cx+w*0.02,funnelBotY); c.lineTo(cx-w*0.02,funnelBotY); c.closePath(); c.clip();
      c.fillStyle = dark?'rgba(140,110,60,0.75)':'rgba(150,110,60,0.55)';
      c.beginPath(); c.rect(cx-w*0.16, funnelTopY+(funnelBotY-funnelTopY)*(1-topLevel), w*0.32, (funnelBotY-funnelTopY)*topLevel+10); c.fill();
      c.restore();
    }
    // قمع
    c.strokeStyle=g6cMut(dark); c.lineWidth=w*0.006;
    c.beginPath(); c.moveTo(cx-w*0.14,funnelTopY); c.lineTo(cx+w*0.14,funnelTopY); c.lineTo(cx+w*0.02,funnelBotY); c.lineTo(cx-w*0.02,funnelBotY); c.closePath(); c.stroke();
    // ورقة الترشيح (مثلث داخل القمع)
    c.strokeStyle=g6cAccent(); c.lineWidth=w*0.004; c.setLineDash([3,3]);
    c.beginPath(); c.moveTo(cx-w*0.12,funnelTopY+4); c.lineTo(cx,funnelBotY-4); c.lineTo(cx+w*0.12,funnelTopY+4); c.stroke();
    c.setLineDash([]);
    // حبيبات الرمل المتجمّعة على الورقة
    S.specks.forEach(sp=> {
      c.fillStyle = '#8A5A2E';
      c.beginPath(); c.arc(sp.x*w, sp.y*h, w*0.006, 0, Math.PI*2); c.fill();
    });

    // قطرات تتساقط
    if(S.phase==='pouring' && S.pourT%9<5){
      c.fillStyle = dark?'rgba(125,211,252,0.85)':'rgba(41,128,185,0.7)';
      c.beginPath(); c.arc(cx, funnelBotY + (S.pourT%9)*4, w*0.006, 0, Math.PI*2); c.fill();
    }

    // الكأس السفلي (الماء الصافي يتجمّع)
    c.strokeStyle=g6cMut(dark); c.lineWidth=w*0.005;
    c.beginPath(); c.rect(cx-w*0.11, cupTopY, w*0.22, cupBotY-cupTopY); c.stroke();
    const clearLevel = pourProgress;
    if(clearLevel>0.02){
      c.fillStyle = dark?'rgba(56,189,248,0.55)':'rgba(41,128,185,0.4)';
      const fillH=(cupBotY-cupTopY)*clearLevel;
      c.fillRect(cx-w*0.11, cupBotY-fillH, w*0.22, fillH);
    }

    c.font=`bold ${Math.round(h*0.019)}px Tajawal`; c.fillStyle=g6cTxt(dark); c.textAlign='center';
    c.fillText(S.phase==='done' ? 'ماء صافٍ ✅ + رمل على الورقة' : 'ماء موحل + رمل', cx, h*0.90);

    g6cTitleBar(c,w,h,dark,'٤-٣ · الترشيح');
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ── تبويب ج: التحدي الأخير — اختر الأداة الصحيحة ── */
var G6C_TOOL_ITEMS = [
  { id:'t1', text:'حصى + تربة رملية', correct:'sieve', home:{x:0.18,y:0.20} },
  { id:'t2', text:'فول سوداني + زبيب', correct:'hand',  home:{x:0.50,y:0.20} },
  { id:'t3', text:'ماء مخلوط برمل (موحل)', correct:'filter', home:{x:0.82,y:0.20} },
  { id:'t4', text:'قهوة مطحونة + ماء', correct:'filter', home:{x:0.34,y:0.34} },
];
function simG6Chg2c(){
  cancelAnimationFrame(animFrame);
  simState = { placed:{}, dragId:null, dragX:0, dragY:0, wrong:null, wrongT:0, done:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const ZONES = [
    { id:'sieve',  label:'🔲 الغربال',    x:0.18, col:'#D4901A' },
    { id:'hand',   label:'✋ الفرز باليد', x:0.5,  col:'#8E44AD' },
    { id:'filter', label:'🧻 الترشيح',    x:0.82, col:'#1A8FA8' },
  ];

  function panel(){
    const n = Object.keys(S.placed).length;
    if(!S.done){
      controls('<div class="ctrl-section"><div class="ctrl-label">🏆 التحدي الأخير: اختر الأداة الصحيحة</div>' +
        '<div style="font-size:13px;color:var(--text-secondary);line-height:1.9">اسحب كل مخلوط إلى الأداة المناسبة لفصله. ('+n+' من '+G6C_TOOL_ITEMS.length+')</div></div>');
      return;
    }
    controls('<div class="ctrl-section"><div class="ctrl-label">🎉 أحسنت! أتممت الوحدة</div>' +
      '<div class="info-box">اخترت الأداة الصحيحة لكل مخلوط بناءً على حجم حبيباته وحالته (صلب مع صلب، أو صلب مع سائل).</div></div>' +
      '<div class="ctrl-section"><div class="ctrl-label">🤔 تحدَّث عن!</div>' +
      '<div class="info-box">كيف يمكن فصل مخلوط من <b>الرمل والملح</b>؟ الغربال والفرز باليد لن ينجحا هنا لأنّ الحبيبات متقاربة جداً في الحجم... فهل يوجد حل آخر؟ 💭 سنكتشف الإجابة في الدرس القادم!</div>' +
      '<button class="ctrl-btn reset" onclick="window._g6c2cRestart()">↺ أعد النشاط</button></div>');
  }
  window._g6c2cRestart = function(){
    simState = { placed:{}, dragId:null, dragX:0, dragY:0, wrong:null, wrongT:0, done:false };
    panel();
  };

  function hitChip(p,w,h){
    for(const it of G6C_TOOL_ITEMS){
      if(S.placed[it.id]) continue;
      const hx=it.home.x*w, hy=it.home.y*h;
      if(Math.abs(p.x-hx)<w*0.15 && Math.abs(p.y-hy)<h*0.05) return it;
    }
    return null;
  }
  function onDown(e){ if(S.done) return; const p=g6cGp(cv,e); const it=hitChip(p,cv.width,cv.height); if(it){ S.dragId=it.id; S.dragX=p.x; S.dragY=p.y; } }
  function onMove(e){ if(!S.dragId) return; e.preventDefault&&e.preventDefault(); const p=g6cGp(cv,e); S.dragX=p.x; S.dragY=p.y; }
  function onUp(){
    if(!S.dragId) return;
    const it = G6C_TOOL_ITEMS.find(x=>x.id===S.dragId);
    const w=cv.width, h=cv.height;
    let hitZone=null;
    for(const z of ZONES){ if(Math.abs(S.dragX-z.x*w)<w*0.14 && S.dragY>h*0.55) { hitZone=z; break; } }
    if(hitZone && hitZone.id===it.correct){
      S.placed[it.id]=hitZone.id; g6cSnd(true);
      if(Object.keys(S.placed).length===G6C_TOOL_ITEMS.length) S.done=true;
      panel();
    } else if(hitZone){
      S.wrong=it.id; S.wrongT=30; g6cSnd(false);
    }
    S.dragId=null;
  }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;
  panel();

  function draw(){
    if(currentSim!=='g6changes2'||currentTab!==2){ cancelAnimationFrame(animFrame); return; }
    const dark=g6cIsDark(); const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=g6cBg(dark); c.fillRect(0,0,w,h);
    if(S.wrongT>0) S.wrongT--; else S.wrong=null;

    ZONES.forEach(z=>{
      c.save();
      c.fillStyle=z.col+'18'; c.strokeStyle=z.col+'90'; c.lineWidth=2; c.setLineDash([6,5]);
      const zx=z.x*w, zy=h*0.58, zw=w*0.27, zh=h*0.30;
      c.beginPath(); c.roundRect?c.roundRect(zx-zw/2,zy,zw,zh,14):c.rect(zx-zw/2,zy,zw,zh);
      c.fill(); c.stroke(); c.setLineDash([]);
      c.fillStyle=z.col; c.font=`bold ${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
      c.fillText(z.label, zx, zy+zh+h*0.04);
      c.restore();
    });

    const stacks={};
    G6C_TOOL_ITEMS.forEach(it=>{
      if(!S.placed[it.id]) return;
      const z=ZONES.find(zz=>zz.id===S.placed[it.id]);
      stacks[z.id]=(stacks[z.id]||0);
      const idx=stacks[z.id]++;
      g6cChip(c, it.text, z.x*w, h*0.58+h*0.05+idx*h*0.085, w, h, dark, 'ok');
    });

    G6C_TOOL_ITEMS.forEach(it=>{
      if(S.placed[it.id]||S.dragId===it.id) return;
      const hx=it.home.x*w, hy=it.home.y*h;
      const shake=(S.wrong===it.id)?Math.sin(S.wrongT*2)*w*0.01:0;
      g6cChip(c, it.text, hx+shake, hy, w, h, dark, S.wrong===it.id?'warn':null);
    });
    if(S.dragId){
      const it=G6C_TOOL_ITEMS.find(x=>x.id===S.dragId);
      g6cChip(c, it.text, S.dragX, S.dragY, w, h, dark, null);
    }
    if(!S.done){
      c.fillStyle=g6cMut(dark); c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
      c.fillText(`اكتمل ${Object.keys(S.placed).length} من ٤ 🔗`, w/2, h*0.5);
    }

    g6cTitleBar(c,w,h,dark,'التحدي الأخير · اختر الأداة الصحيحة');
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}
