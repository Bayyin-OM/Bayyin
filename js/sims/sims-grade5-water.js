// ══════════════════════════════════════════════════════════
// الصف الخامس — الوحدة الثالثة: الدرس الأول · التبخر
// استقصاء: أين يتبخر الماء أسرع؟ (كوب في الشمس مقابل كوب في الظلام)
// ══════════════════════════════════════════════════════════

function g5wBg(dark){ return dark ? '#0B1A20' : '#EEF8FC'; }
function g5wTxt(dark){ return dark ? '#CFEFFB' : '#17324D'; }
function g5wMut(dark){ return dark ? '#6FA8C0' : '#4B6B7A'; }
function g5wAccent(dark){ return dark ? '#38BDF8' : '#087EA4'; }
function g5wLerp(a,b,t){ return a+(b-a)*t; }
function g5wClamp(v,a,b){ return Math.max(a,Math.min(b,v)); }

function simG5Water1a(){
  cancelAnimationFrame(animFrame);
  const SUN_START=0.78, SUN_END=0.16, DARK_START=0.78, DARK_END=0.70;
  simState = {
    stage:'intro',        // intro -> marked -> animating -> compare -> observe -> conclude -> question
    markSet:false,
    levelSun:SUN_START, levelDark:DARK_START,
    animT:0,
    qAnswered:false,
  };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  cv.onclick=null; cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null; cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null;

  function renderControls(){
    if(S.stage==='intro'){
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🔬 أين يتبخّر الماء أسرع؟</div></div>
        <div style="font-size:14px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:12px">
          أمامك كوبان متماثلان بهما نفس كمّية الماء: الأوّل ☀️ عند حافّة نافذة مشمسة (مكان دافئ)، والثاني 🚪 داخل خزانة (مكان بارد).
        </div>
        <div style="font-size:14px;font-weight:700;background:rgba(8,126,164,0.1);border-right:4px solid var(--accent-color,#087EA4);border-radius:8px;padding:10px 12px;margin-bottom:12px">📍 أوّلاً: حدّدي مستوى الماء في الكوبين حتى تستطيعي المقارنة لاحقاً.</div>
        <button class="ctrl-btn play" onclick="window._g5wMark()">📍 حدّدي مستوى الماء</button>`;
    }
    if(S.stage==='marked'){
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">✅ تمّ تحديد العلامة</div></div>
        <div style="font-size:14px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:12px">
          لاحظي الخطّ المتقطّع عند مستوى الماء الحالي في الكوبين. الآن سنترك الكوبين في مكانيهما لمدّة يومين.
        </div>
        <button class="ctrl-btn play" onclick="window._g5wPass()">▶ مرور يومين</button>`;
    }
    if(S.stage==='animating'){
      const dayNum = S.animT<0.5 ? 1 : 2;
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">⏳ الوقت يمرّ...</div></div>
        <div style="font-size:15px;font-weight:700;text-align:center;background:var(--bg-card2);border-radius:10px;padding:14px">اليوم ${dayNum} من ٢</div>`;
    }
    if(S.stage==='compare'){
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🔍 قارني بين الكوبين</div></div>
        <div style="font-size:14px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:12px">
          انظري إلى الفرق بين مستوى الماء الحالي والعلامة التي حدّدتها في كلّ كوب.
        </div>
        <button class="ctrl-btn play" onclick="window._g5wObserve()">➡ ماذا لاحظت؟</button>`;
    }
    if(S.stage==='observe'){
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">👀 ماذا لاحظت؟</div></div>
        <div style="font-size:14.5px;line-height:2;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px">
          ☀️ الماء في الكوب الموجود في الشمس <strong>انخفض مستواه بشكل واضح</strong>.<br>
          🚪 الماء في الكوب الموجود في المكان البارد <strong>بقي تقريباً كما هو</strong>.
        </div>
        <button class="ctrl-btn play" onclick="window._g5wConclude()">➡ الاستنتاج</button>`;
    }
    if(S.stage==='conclude'){
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🧠 الاستنتاج</div></div>
        <div style="font-size:15px;font-weight:700;line-height:1.9;background:rgba(39,174,96,0.12);border-right:4px solid #27AE60;border-radius:10px;padding:14px;margin-bottom:12px">
          يتبخّر الماء بصورة أسرع عند تعرّضه للحرارة (أشعّة الشمس).
        </div>
        <button class="ctrl-btn play" onclick="window._g5wQuestion()">➡ السؤال التفاعلي</button>`;
    }
    // question
    return `
      <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">❓ في أيّ كوب تبخّر الماء بشكل أسرع؟ ولماذا؟</div></div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${['الكوب الموجود في المكان البارد','الكوب الموجود في الشمس؛ لأنّ الحرارة تساعد على زيادة سرعة التبخّر','الكوبان بالسرعة نفسها','لا يتبخّر الماء'].map((o,i)=>`<button id="g5wOpt${i}" onclick="window._g5wAnswer(${i})" style="padding:12px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:14px">${o}</button>`).join('')}
      </div>
      <div id="g5wFb" style="margin-top:12px;font-size:14px;line-height:1.9;color:var(--text-secondary)"></div>
      ${S.qAnswered? `<button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g5wRestart()">↺ أعد الاستقصاء</button>`:''}
    `;
  }
  controls(renderControls());

  window._g5wMark = function(){ _g8pPlayClick(); S.markSet=true; S.stage='marked'; controls(renderControls()); };
  window._g5wPass = function(){ _g8pPlayClick(); S.stage='animating'; S.animT=0.0001; controls(renderControls()); };
  window._g5wObserve = function(){ _g8pPlayClick(); S.stage='observe'; controls(renderControls()); };
  window._g5wConclude = function(){ _g8pPlayDrop(); S.stage='conclude'; controls(renderControls()); };
  window._g5wQuestion = function(){ _g8pPlayClick(); S.stage='question'; controls(renderControls()); };
  window._g5wAnswer = function(i){
    if(S.qAnswered) return; S.qAnswered=true;
    const ok = i===1; _g8pPlayClick();
    const btn = document.getElementById('g5wOpt'+i);
    if(btn){ btn.style.background = ok?'#27AE60':'#E74C3C'; btn.style.color='white'; btn.style.borderColor= ok?'#27AE60':'#E74C3C'; }
    if(!ok){ const okBtn=document.getElementById('g5wOpt1'); if(okBtn){ okBtn.style.background='#27AE60'; okBtn.style.color='white'; okBtn.style.borderColor='#27AE60'; } }
    const fb = document.getElementById('g5wFb');
    if(fb) fb.innerHTML = '💡 أحسنت! تبخّر الماء في الكوب الموجود في الشمس كان أسرع بسبب تعرّضه للحرارة.';
    setTimeout(()=>controls(renderControls()), 300);
  };
  window._g5wRestart = function(){
    S.stage='intro'; S.markSet=false; S.levelSun=SUN_START; S.levelDark=DARK_START; S.animT=0; S.qAnswered=false;
    controls(renderControls());
  };

  function drawCup(c, cx, w, h, dark, level, markLevel, showMark, label, icon, dropHint){
    const cupW=w*0.24, cupH=h*0.44, cupY=h*0.36, cupBottom=cupY+cupH;
    // خلفية توضح البيئة (شمس/ظلام)
    c.save();
    c.fillStyle = icon==='☀️' ? (dark?'rgba(253,224,71,0.08)':'rgba(253,224,71,0.16)') : (dark?'rgba(30,41,59,0.35)':'rgba(51,65,85,0.10)');
    const bgY=h*0.14, bgH=h*0.72;
    c.beginPath(); if(c.roundRect) c.roundRect(cx-cupW*1.05, bgY, cupW*2.1, bgH, 16); else c.rect(cx-cupW*1.05, bgY, cupW*2.1, bgH);
    c.fill();
    c.restore();

    c.font=`${Math.round(h*0.045)}px Tajawal`; c.textAlign='center'; c.fillStyle=g5wTxt(dark);
    c.fillText(icon, cx, h*0.22);
    c.fillStyle=g5wTxt(dark); c.font=`bold ${Math.round(h*0.02)}px Tajawal`;
    c.fillText(label, cx, h*0.28);

    // الكوب
    c.save();
    c.beginPath(); c.rect(cx-cupW/2, cupY, cupW, cupH); c.clip();
    c.fillStyle = dark?'rgba(56,189,248,0.35)':'rgba(49,172,208,0.55)';
    const waterY = cupBottom - cupH*level;
    c.fillRect(cx-cupW/2, waterY, cupW, cupBottom-waterY);
    c.restore();
    c.strokeStyle=g5wMut(dark); c.lineWidth=w*0.006; c.lineCap='round';
    c.beginPath(); c.moveTo(cx-cupW/2,cupY); c.lineTo(cx-cupW/2,cupBottom); c.lineTo(cx+cupW/2,cupBottom); c.lineTo(cx+cupW/2,cupY); c.stroke();

    // خط العلامة الأصلي
    if(showMark){
      const markY = cupBottom - cupH*markLevel;
      c.save();
      c.strokeStyle='#E74C3C'; c.lineWidth=2; c.setLineDash([5,4]);
      c.beginPath(); c.moveTo(cx-cupW*0.62, markY); c.lineTo(cx+cupW*0.62, markY); c.stroke();
      c.setLineDash([]);
      c.fillStyle='#E74C3C'; c.font=`${Math.round(h*0.014)}px Tajawal`; c.textAlign='right';
      c.fillText('العلامة الأصلية', cx-cupW*0.68, markY+4);
      c.restore();

      if(dropHint){
        const curY = cupBottom - cupH*level;
        if(curY - markY > h*0.02){
          c.save();
          c.strokeStyle='#E74C3C'; c.lineWidth=2; c.lineCap='round';
          const ax = cx+cupW*0.75;
          c.beginPath(); c.moveTo(ax,markY); c.lineTo(ax,curY); c.stroke();
          c.beginPath(); c.moveTo(ax,markY); c.lineTo(ax-4,markY+7); c.moveTo(ax,markY); c.lineTo(ax+4,markY+7); c.stroke();
          c.beginPath(); c.moveTo(ax,curY); c.lineTo(ax-4,curY-7); c.moveTo(ax,curY); c.lineTo(ax+4,curY-7); c.stroke();
          c.restore();
        }
      }
    }
    c.fillStyle=g5wMut(dark); c.font=`${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
    c.fillText(Math.round(level*100)+'%', cx, cupBottom+h*0.035);
  }

  function draw(){
    if(currentSim!=='g5water1' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g5wBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle=g5wTxt(dark); c.font=`bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
    c.fillText('٣-٣ · أين يتبخّر الماء أسرع؟', w/2, h*0.07);

    if(S.stage==='animating'){
      S.animT += 0.012;
      if(S.animT>=1){ S.animT=1; S.levelSun=SUN_END; S.levelDark=DARK_END; S.stage='compare'; controls(renderControls()); }
      else { S.levelSun = g5wLerp(SUN_START,SUN_END,S.animT); S.levelDark = g5wLerp(DARK_START,DARK_END,S.animT); }
    }

    const showMark = S.markSet;
    const showDrop = S.stage==='compare' || S.stage==='observe' || S.stage==='conclude' || S.stage==='question';
    drawCup(c, w*0.28, w, h, dark, S.levelSun, SUN_START, showMark, 'مكان مشمس', '☀️', showDrop);
    drawCup(c, w*0.72, w, h, dark, S.levelDark, DARK_START, showMark, 'مكان بارد', '🚪', showDrop);

    if(S.stage==='animating'){
      const dayNum = S.animT<0.5?1:2;
      c.fillStyle=g5wAccent(dark); c.font=`bold ${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
      c.fillText('⏱️ اليوم '+dayNum+' من ٢', w/2, h*0.94);
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}
