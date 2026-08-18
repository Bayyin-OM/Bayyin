// ══════════════════════════════════════════════════════════
// الصف الخامس — الوحدة ١: استقصاء نمو النبات
// نشاط ١-١ · البذور (كتاب الصف الخامس ص١٦-١٧)
// ══════════════════════════════════════════════════════════

function g5pBg(dark){ return dark ? '#0B1A10' : '#F0FAF3'; }
function g5pTxt(dark){ return dark ? '#C8EDD4' : '#1A3A25'; }
function g5pMut(dark){ return dark ? '#6BA87A' : '#4A7A5A'; }
function g5pAccent(dark){ return dark ? '#4ADE80' : '#8B5CF6'; }
function g5pGp(cv, e){
  const r = cv.getBoundingClientRect(), sc = cv.width/r.width;
  const s = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
  return { x:(s.clientX-r.left)*sc, y:(s.clientY-r.top)*sc };
}

/* ── تاب ١: استكشف البذرة ── */
function simG5Bio1N1a(){
  cancelAnimationFrame(animFrame);
  const OUT_SPOTS = [
    { id:'coat',  label:'غلاف البذرة', pos:{x:0.5,y:0.42}, info:'الغطاء الخارجي الذي يحمي البذرة.' },
    { id:'scar',  label:'الندبة', pos:{x:0.42,y:0.62}, info:'حيث ترتبط البذرة بالثمرة.' },
  ];
  const IN_SPOTS = [
    { id:'embryo', label:'الجنين', pos:{x:0.44,y:0.36}, info:'نبات صغير جداً داخل البذرة، يُسمّى هذا النبات جنيناً، ويبدأ الجنين بالنمو عندما تتوافر له الظروف التي يحتاج إليها.' },
    { id:'store',  label:'مخزون الغذاء', pos:{x:0.55,y:0.55}, info:'تحتوي البذرة أيضاً على مخزون من الغذاء يمدّها بالطاقة اللازمة للنمو.' },
  ];
  simState = { mode:'out', selected:null, opened:false, quiz:false, riddleIdx:0, riddleOrder:[], wrongPick:null, score:0 };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const ALL = [...OUT_SPOTS, ...IN_SPOTS];

  function shuffle(arr){ const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

  function renderControls(){
    if(!S.quiz){
      const spotsNow = S.opened ? ALL : OUT_SPOTS;
      return `
        <div class="ctrl-section"><div class="ctrl-label">🌰 استكشف البذرة</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:12px">اضغطي على أيّ جزء من البذرة لتتعرّفي عليه.</div>
        <div id="g5sInfo" style="font-size:13px;color:var(--text-secondary);line-height:1.8;min-height:24px;margin-bottom:14px;background:var(--bg-card2);border-radius:8px;padding:${S.selected?'12px':'0px'}">
          ${S.selected ? ('<strong>'+spotsNow.find(s=>s.id===S.selected).label+':</strong> '+spotsNow.find(s=>s.id===S.selected).info) : ''}
        </div>
        ${!S.opened ? `<button class="ctrl-btn play" onclick="window._g5sOpen()">🔍 لنرَ ماذا يوجد داخل البذرة!</button>` :
          `<button class="ctrl-btn play" onclick="window._g5sQuiz()">✅ أين هذا الجزء؟ (اختبري نفسك)</button>`}`;
    }
    if(S.riddleIdx>=S.riddleOrder.length){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🎉 أحسنتِ!</div></div>
        <div style="padding:14px;background:var(--bg-card2);border-radius:10px;font-size:13px;color:var(--text-secondary);line-height:1.9">
          أجبتِ صح على ${S.score} من ${ALL.length}. البذرة تحتوي على غلاف يحميها، وندبة، وجنين، ومخزون غذاء يساعده على النمو.
        </div>
        <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g5sRestart()">↺ أعد النشاط</button>`;
    }
    const cur = ALL.find(s=>s.id===S.riddleOrder[S.riddleIdx]);
    return `
      <div class="ctrl-section"><div class="ctrl-label">✅ أين هذا الجزء؟ (${S.riddleIdx+1} من ${ALL.length})</div></div>
      <div style="font-size:14px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:10px">أين يوجد: ${cur.label}؟</div>
      <div style="font-size:12.5px;color:var(--text-secondary)">اضغطي على الجزء المناسب في الصورة.</div>
      ${S.wrongPick ? `<div style="margin-top:10px;font-size:13px;color:#D97706;background:#FEF3C7;border-radius:8px;padding:10px">💡 ليس هذا الجزء، حاولي مرّة أخرى.</div>` : ''}`;
  }
  controls(renderControls());

  window._g5sOpen = function(){ _g8pPlayDrop(); S.opened=true; S.selected=null; controls(renderControls()); };
  window._g5sQuiz = function(){ _g8pPlayClick(); S.quiz=true; S.riddleIdx=0; S.riddleOrder=shuffle(ALL.map(s=>s.id)); S.score=0; controls(renderControls()); };
  window._g5sRestart = function(){ S.mode='out'; S.selected=null; S.opened=false; S.quiz=false; S.riddleIdx=0; S.wrongPick=null; controls(renderControls()); };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null; cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null;
  cv.onclick = function(e){
    const p = g5pGp(cv,e), w=cv.width, h=cv.height;
    const spotsNow = S.opened || S.quiz ? ALL : OUT_SPOTS;
    let hit=null;
    for(const s of spotsNow){ if(Math.hypot(p.x-s.pos.x*w,p.y-s.pos.y*h) < w*0.09){ hit=s; break; } }
    if(!hit) return;
    if(!S.quiz){ S.selected=hit.id; _g8pPlayClick(); controls(renderControls()); }
    else {
      const target = S.riddleOrder[S.riddleIdx];
      if(hit.id===target){ _g8pPlayDrop(); S.score++; S.wrongPick=null; S.riddleIdx++; }
      else { _g8pPlayClick(); S.wrongPick=hit.id; setTimeout(()=>{S.wrongPick=null; controls(renderControls());},1200); }
      controls(renderControls());
    }
  };

  function draw(){
    if(currentSim!=='g5bio1n1' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g5pBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle=g5pTxt(dark); c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ١-١ · البذور', w/2, h*0.06);

    const cx=w*0.5, cy=h*0.5, R=Math.min(w,h)*0.24;
    if(!S.opened){
      // بذرة فول كاملة (خارجية)
      c.save(); c.translate(cx,cy);
      c.fillStyle='#D9A441'; c.strokeStyle='#8B5E1F'; c.lineWidth=3;
      c.beginPath(); c.ellipse(0,0,R,R*0.72,0,0,Math.PI*2); c.fill(); c.stroke();
      c.fillStyle='#B8863A'; c.beginPath(); c.ellipse(-R*0.12,R*0.18,R*0.16,R*0.08,0.3,0,Math.PI*2); c.fill();
      c.restore();
    } else {
      // بذرة مفتوحة (فلقتان + جنين + مخزون غذاء)
      c.save(); c.translate(cx,cy);
      c.fillStyle='#E8C877'; c.strokeStyle='#8B5E1F'; c.lineWidth=2.5;
      c.beginPath(); c.moveTo(-R*0.05,-R*0.7); c.quadraticCurveTo(-R,-R*0.2,-R*0.05,R*0.7); c.quadraticCurveTo(R*0.15,0,-R*0.05,-R*0.7); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(R*0.05,-R*0.7); c.quadraticCurveTo(R,-R*0.2,R*0.05,R*0.7); c.quadraticCurveTo(-R*0.15,0,R*0.05,-R*0.7); c.closePath(); c.fill(); c.stroke();
      // الجنين (شكل صغير أخضر عند القمة)
      c.fillStyle='#4ADE80'; c.strokeStyle='#166534'; c.lineWidth=1.5;
      c.beginPath(); c.ellipse(-R*0.06,-R*0.55,R*0.13,R*0.16,0,0,Math.PI*2); c.fill(); c.stroke();
      c.restore();
    }

    const spotsNow = S.opened || S.quiz ? ALL : OUT_SPOTS;
    spotsNow.forEach(s=>{
      const x=cx+(s.pos.x-0.5)*w, y=cy+(s.pos.y-0.5)*h;
      const isSel = (!S.quiz && S.selected===s.id) || (S.quiz && S.wrongPick===s.id);
      c.save();
      c.fillStyle = isSel ? (S.quiz && S.wrongPick===s.id ? 'rgba(231,76,60,0.55)':'rgba(74,222,128,0.5)') : (dark?'rgba(255,255,255,0.4)':'rgba(255,255,255,0.85)');
      c.strokeStyle = g5pAccent(dark); c.lineWidth=2;
      c.beginPath(); c.arc(x,y,w*0.022,0,Math.PI*2); c.fill(); c.stroke();
      c.restore();
      if(!S.quiz){
        c.fillStyle=g5pTxt(dark); c.font=`${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
        c.fillText(s.label, x, y-h*0.035);
      }
    });

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ── نشاط ٢-١ · كيف تنمو البذور؟ (إنبات - ص١٨) ── */
function simG5Bio1N2a(){
  cancelAnimationFrame(animFrame);
  const STEPS = [
    { id:'predict', btn:'', info:'' },
    { id:'imbibe',  btn:'💧 تمتص البذرة الماء', info:'اضغطي لترَي البذرة وهي تمتصّ الماء وتنتفخ.' },
    { id:'crack',   btn:'🌱 غلاف البذرة ينفلق', info:'اضغطي لرؤية غلاف البذرة وهو ينفلق.' },
    { id:'root',    btn:'⬇ الجذر الأول ينمو', info:'اضغطي ليبدأ الجذر الأول بالنمو إلى الأسفل في التربة.' },
    { id:'stem',    btn:'⬆ الساق الأول ينمو', info:'اضغطي ليبدأ الساق الأول بالنمو فوق الأرض.' },
    { id:'leaves',  btn:'🍃 الأوراق الأوليّة تبدأ بالنمو', info:'اضغطي لتبدأ الأوراق الأولى بالظهور والنمو.' },
    { id:'shrivel', btn:'✅ اكتمل الإنبات', info:'لاحظي أنّ البذرة تذبل ويصغر حجمها بعد أن استخدم النبات مخزون غذائها.' },
    { id:'done',    btn:'', info:'' },
  ];
  simState = { step:0, predicted:null };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    const st = STEPS[S.step];
    if(st.id==='predict'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🌱 كيف تنمو البذور؟</div></div>
        <div style="font-size:14px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px">هل يمكن أن تنبت البذور بدون ماءٍ أو ضوء؟</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${['تحتاج للماء لتنبت، ولا تحتاج للضوء لتنبت','تحتاج للماء والضوء معاً لتنبت','لا تحتاج لا للماء ولا للضوء'].map((o,i)=>`<button onclick="window._g5gPredict(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:13px">${o}</button>`).join('')}
        </div>`;
    }
    if(st.id==='done'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🎉 أحسنتِ!</div></div>
        <div style="padding:14px;background:var(--bg-card2);border-radius:10px;font-size:13px;color:var(--text-secondary);line-height:1.9">
          تبدأ البذور في الإنبات إذا كانت الظروف الملائمة متوافرة. تحصل البذور على الطاقة اللازمة للإنبات من مخزون الغذاء الموجود بداخلها. تمتص البذور الماء لتبدأ عملية الإنبات. في البداية ينمو الجذر الأول متجهاً إلى الأسفل، ويتبعه الساق الأول حيث ينمو متجهاً إلى الأعلى. <strong>لا تحتاج البذور إلى ضوء لكي تنبت.</strong>
        </div>
        <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g5gRestart()">↺ أعد النشاط</button>`;
    }
    return `
      <div class="ctrl-section"><div class="ctrl-label">🌱 مراحل إنبات بذرة الفول</div></div>
      <div style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:12px">${st.info}</div>
      <button class="ctrl-btn play" onclick="window._g5gNext()">${st.btn}</button>`;
  }
  controls(renderControls());
  window._g5gPredict = function(i){ _g8pPlayClick(); S.predicted=i; S.step=1; controls(renderControls()); };
  window._g5gNext = function(){ _g8pPlayClick(); S.step++; controls(renderControls()); };
  window._g5gRestart = function(){ S.step=0; S.predicted=null; controls(renderControls()); };
  cv.onclick=null;

  function draw(){
    if(currentSim!=='g5bio1n2' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g5pBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle=g5pTxt(dark); c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ٢-١ · كيف تنمو البذور؟', w/2, h*0.06);

    const soilY=h*0.55;
    c.fillStyle= dark?'rgba(139,105,60,0.2)':'rgba(139,105,60,0.15)'; c.fillRect(0,soilY,w,h*0.4);
    c.strokeStyle=g5pMut(dark); c.lineWidth=2; c.beginPath(); c.moveTo(w*0.1,soilY); c.lineTo(w*0.9,soilY); c.stroke();

    const stId = STEPS[S.step].id;
    const idx = STEPS.findIndex(s=>s.id===stId);
    const reached = id => idx > STEPS.findIndex(s=>s.id===id);
    const cx=w*0.5, cy=soilY+h*0.08;

    c.save(); c.translate(cx,cy);
    const size = reached('shrivel') ? 0.6 : 1;
    c.scale(size,size);
    c.fillStyle='#D9A441'; c.strokeStyle='#8B5E1F'; c.lineWidth=2.5;
    c.beginPath(); c.ellipse(0,0,w*0.045,w*0.032,0,0,Math.PI*2); c.fill(); c.stroke();
    if(reached('crack')){
      c.strokeStyle='#8B5E1F'; c.lineWidth=1.5; c.beginPath(); c.moveTo(-w*0.02,-w*0.02); c.lineTo(w*0.02,w*0.02); c.stroke();
    }
    c.restore();

    if(reached('root')){
      c.strokeStyle='#A9895A'; c.lineWidth=Math.max(2,w*0.006); c.lineCap='round';
      c.beginPath(); c.moveTo(cx,cy); c.quadraticCurveTo(cx-w*0.02,cy+h*0.1,cx,cy+h*0.16); c.stroke();
    }
    if(reached('stem')){
      c.strokeStyle='#5F9E52'; c.lineWidth=Math.max(3,w*0.008); c.lineCap='round';
      c.beginPath(); c.moveTo(cx,cy); c.lineTo(cx,cy-h*0.16); c.stroke();
    }
    if(reached('leaves')){
      c.fillStyle='#4ADE80'; c.strokeStyle='#166534'; c.lineWidth=1.5;
      for(const side of [-1,1]){
        c.save(); c.translate(cx,cy-h*0.16); c.rotate(side*0.5);
        c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(side*w*0.04,-h*0.03,side*w*0.07,0); c.quadraticCurveTo(side*w*0.04,h*0.01,0,0); c.fill(); c.stroke();
        c.restore();
      }
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ── نشاط ٣-١ · استقصاء عملية الإنبات: هل تحتاج البذور إلى الهواء؟ (ص٢٠) ── */
function simG5Bio1N3a(){
  cancelAnimationFrame(animFrame);
  simState = { stage:'predict', predicted:null, dayT:0, animating:false, day:0 };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const MAXDAY = 2;

  function renderControls(){
    if(S.stage==='predict'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🌬️ هل تحتاج البذور إلى الهواء لتنبت؟</div></div>
        <div style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:12px">
          سنضع بذوراً في وعاءين متماثلين على مناديل ورقية رطبة، ونضع كل وعاء في كيس: الأول مفتوح (هواء طبيعي)، والثاني نشفط منه الهواء قبل إغلاقه.
        </div>
        <div style="font-size:13px;font-weight:700;margin-bottom:10px">أيّ وعاء تتوقّعين أن تنبت بذوره بشكل أفضل؟</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${['الوعاء المعرَّض للهواء الطبيعي','الوعاء الذي شُفط منه الهواء','ستنبت بذور الوعاءين بنفس الطريقة'].map((o,i)=>`<button onclick="window._g5airPredict(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:13px">${o}</button>`).join('')}
        </div>`;
    }
    if(S.stage==='setup'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🔬 جهّزي التجربة</div></div>
        <div style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px">اضغطي لوضع البذور على مناشف ورقية رطبة داخل الوعاءين، ثمّ إغلاق الكيسين — الأول بهواء طبيعي، والثاني بعد شفط الهواء منه.</div>
        <button class="ctrl-btn play" style="margin-top:12px" onclick="window._g5airSetup()">▶ جهّزي التجربة</button>`;
    }
    if(S.stage==='wait'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">⏱️ انتظري ولاحظي</div></div>
        <div style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px">اترك الكيسين في مكان دافئ. اضغطي للانتقال بين الأيام ومراقبة البذور.</div>
        <button class="ctrl-btn play" style="margin-top:12px" onclick="window._g5airDay()" ${S.animating?'disabled style="opacity:0.5"':''}>${S.animating?'⏳...':'▶ يوم آخر'}</button>`;
    }
    return `
      <div class="ctrl-section"><div class="ctrl-label">🎉 ماذا نستنتج؟</div></div>
      <div style="padding:14px;background:var(--bg-card2);border-radius:10px;font-size:13px;color:var(--text-secondary);line-height:1.9">
        أنبتت بذور الوعاء المعرَّض للهواء بشكل أفضل، بينما لم تنبت (أو أنبتت بشكل أضعف) بذور الوعاء الذي شُفط منه الهواء. هذا يوضّح أنّ البذور تحتاج إلى هواء للإنبات.
      </div>
      <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g5airRestart()">↺ أعد التجربة</button>`;
  }
  controls(renderControls());
  window._g5airPredict = function(i){ _g8pPlayClick(); S.predicted=i; S.stage='setup'; controls(renderControls()); };
  window._g5airSetup = function(){ _g8pPlayDrop(); S.stage='wait'; S.day=0; controls(renderControls()); };
  window._g5airDay = function(){
    _g8pPlayClick(); S.animating=true; S.dayT=0.0001;
    controls(renderControls());
  };
  window._g5airRestart = function(){ S.stage='predict'; S.predicted=null; S.dayT=0; S.animating=false; S.day=0; controls(renderControls()); };
  cv.onclick=null;

  function drawJar(c, x, y, w, h, hasAir, growth){
    c.save(); c.translate(x,y);
    c.fillStyle='#F5F0DC'; c.strokeStyle='#8B6D3A'; c.lineWidth=2.5;
    c.beginPath(); c.roundRect(-w*0.11,-h*0.05,w*0.22,h*0.12,4); c.fill(); c.stroke();
    // بذور مع براعم تنمو حسب growth
    for(let i=0;i<3;i++){
      const bx = (i-1)*w*0.06;
      c.fillStyle='#D9A441'; c.beginPath(); c.ellipse(bx,h*0.05,w*0.012,w*0.009,0,0,Math.PI*2); c.fill();
      if(growth>0){
        c.strokeStyle='#4ADE80'; c.lineWidth=Math.max(1.5,w*0.004);
        c.beginPath(); c.moveTo(bx,h*0.045); c.lineTo(bx,h*0.045-h*0.06*growth); c.stroke();
      }
    }
    // كيس شفاف حول الوعاء
    c.strokeStyle= hasAir ? 'rgba(150,150,150,0.5)' : 'rgba(150,150,150,0.8)'; c.lineWidth=1.5;
    c.beginPath(); c.roundRect(-w*0.15,-h*0.12,w*0.3,h*0.24, hasAir?10:4); c.stroke();
    c.fillStyle=g5pMut(isDarkMode()); c.font=`${Math.round(h*0.05)}px Tajawal`; c.textAlign='center';
    c.fillText(hasAir?'كيس مفتوح (هواء)':'كيس مشفوط الهواء', 0, h*0.16);
    c.restore();
  }

  function draw(){
    if(currentSim!=='g5bio1n3' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g5pBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle=g5pTxt(dark); c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ٣-١ · هل تحتاج البذور إلى الهواء؟', w/2, h*0.06);

    if(S.animating){
      S.dayT += 0.01;
      if(S.dayT>=1){ S.animating=false; S.day = Math.min(MAXDAY, S.day+1); if(S.day>=MAXDAY) S.stage='result'; controls(renderControls()); }
    }

    if(S.stage==='setup' || S.stage==='predict'){
      drawJar(c, w*0.28, h*0.5, w, h, true, 0);
      drawJar(c, w*0.72, h*0.5, w, h, false, 0);
    } else {
      const growthWithAir = Math.min(1, S.day/MAXDAY + (S.animating? S.dayT/MAXDAY:0));
      drawJar(c, w*0.28, h*0.5, w, h, true, growthWithAir);
      drawJar(c, w*0.72, h*0.5, w, h, false, 0);
      c.fillStyle=g5pAccent(dark); c.font=`bold ${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
      c.fillText(`اليوم ${S.day}`, w/2, h*0.85);
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ── نشاط ٤-١ · ماذا يحتاج النبات كي ينمو؟ (ص٢٢-٢٣) ── */
function simG5Bio1N4a(){
  cancelAnimationFrame(animFrame);
  const PLANTS = [
    { name:'عبدالله', cond:'مكان مشمس + رُوي مرتين أسبوعياً', h:25, desc:'أخضر وصحيّ', col:'#22C55E' },
    { name:'محمد',    cond:'مكان ظليل + رُوي مرتين أسبوعياً', h:18, desc:'أخضر فاتح، صحيّ إلى حدّ ما', col:'#84CC16' },
    { name:'سعيد',    cond:'مكان مشمس، لكن نُسي أن يُروى', h:6,  desc:'جافّ وبنيّ', col:'#A16207' },
    { name:'طارق',    cond:'تحت السرير + رُوي مرتين أسبوعياً', h:14, desc:'نحيف وضعيف', col:'#65A30D' },
  ];
  simState = { stage:'intro', revealIdx:0, growT:0 };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    if(S.stage==='intro'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🌿 ماذا يحتاج النبات كي ينمو؟</div></div>
        <div style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:12px">
          زرع أربعة طلاب نباتاتهم في ظروف مختلفة، وقاسوا طولها بعد أسبوعين. راقبي النتائج.
        </div>
        <button class="ctrl-btn play" onclick="window._g5fReveal()">▶ راقبي النباتات الأربعة</button>`;
    }
    if(S.stage==='reveal'){
      const n = S.revealIdx;
      if(n < PLANTS.length){
        return `
          <div class="ctrl-section"><div class="ctrl-label">🌱 نبات ${PLANTS[n].name}</div></div>
          <div style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:12px">
            <strong>الظروف:</strong> ${PLANTS[n].cond}<br><strong>الطول:</strong> ${PLANTS[n].h} cm — <strong>المظهر:</strong> ${PLANTS[n].desc}
          </div>
          <button class="ctrl-btn play" onclick="window._g5fNext()">➡ التالي</button>`;
      }
      return `<div class="ctrl-section"><div class="ctrl-label">📊 قارني النتائج</div></div>
        <button class="ctrl-btn play" onclick="window._g5fQ()">➡ الأسئلة</button>`;
    }
    if(S.stage==='q'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🤔 أسئلة</div></div>
        <div style="font-size:13px;line-height:2;color:var(--text-secondary)">
          <strong>١) أيّ النباتات نما بأفضل حال؟</strong> نبات عبدالله (مشمس + مروي بانتظام).<br>
          <strong>٢) أيّ النباتات نما بأسوأ حال؟</strong> نبات سعيد (جافّ وبنيّ) لأنّه لم يُروَ رغم وجوده في الشمس.<br>
          <strong>٣) لماذا كان نبات محمد أصغر من نبات عبدالله؟</strong> لأنّه كان في مكان ظليل، والنباتات تحتاج الطاقة الضوئية لتنمو جيّداً.<br>
          <strong>٤) لماذا كان نبات طارق نحيفاً وضعيفاً؟</strong> لأنّه كان تحت السرير بعيداً عن الضوء رغم رَيّه بانتظام.
        </div>
        <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g5fRestart()">↺ أعد النشاط</button>`;
    }
  }
  controls(renderControls());
  window._g5fReveal = function(){ _g8pPlayClick(); S.stage='reveal'; S.revealIdx=0; controls(renderControls()); };
  window._g5fNext = function(){ _g8pPlayClick(); S.revealIdx++; controls(renderControls()); };
  window._g5fQ = function(){ _g8pPlayClick(); S.stage='q'; controls(renderControls()); };
  window._g5fRestart = function(){ S.stage='intro'; S.revealIdx=0; controls(renderControls()); };
  cv.onclick=null;

  function draw(){
    if(currentSim!=='g5bio1n4' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g5pBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle=g5pTxt(dark); c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ٤-١ · ماذا يحتاج النبات كي ينمو؟', w/2, h*0.06);

    const baseY = h*0.78, maxH = 25;
    PLANTS.forEach((p,i)=>{
      const x = w*(0.18+i*0.22);
      const show = S.stage!=='intro' && (S.stage!=='reveal' || i<=S.revealIdx);
      c.strokeStyle=g5pMut(dark); c.lineWidth=2; c.beginPath(); c.moveTo(x-w*0.05,baseY); c.lineTo(x+w*0.05,baseY); c.stroke();
      c.fillStyle='#C4885A'; c.beginPath(); c.moveTo(x-w*0.045,baseY); c.lineTo(x-w*0.035,baseY+h*0.05); c.lineTo(x+w*0.035,baseY+h*0.05); c.lineTo(x+w*0.045,baseY); c.closePath(); c.fill();
      c.fillStyle=g5pTxt(dark); c.font=`bold ${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
      c.fillText(p.name, x, baseY+h*0.09);
      if(show){
        const barH = h*0.45*(p.h/maxH);
        c.strokeStyle=p.col; c.lineWidth=Math.max(3,w*0.008); c.lineCap='round';
        c.beginPath(); c.moveTo(x,baseY); c.lineTo(x,baseY-barH); c.stroke();
        c.fillStyle=p.col;
        c.beginPath(); c.ellipse(x,baseY-barH,w*0.02,h*0.015,0,0,Math.PI*2); c.fill();
        c.fillStyle=g5pTxt(dark); c.font=`${Math.round(h*0.014)}px Tajawal`;
        c.fillText(p.h+' cm', x, baseY-barH-h*0.02);
      }
    });

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ── نشاط ٥-١ · النبات والضوء (ص٢٤-٢٥) ── */
function simG5Bio1N5a(){
  cancelAnimationFrame(animFrame);
  simState = { stage:'predict', predicted:null, dayT:0, animating:false, day:0 };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const MAXDAY = 3; // ثلاثة أسابيع مبسّطة إلى ٣ مراحل عرض

  function renderControls(){
    if(S.stage==='predict'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">☀️ النبات والضوء</div></div>
        <div style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:12px">
          نبات (أ) في مكان مشمس بجانب نافذة، ونبات (ب) في خزانة مظلمة. سنروي كليهما بنفس كمية الماء كلّ مرة.
        </div>
        <div style="font-size:13px;font-weight:700;margin-bottom:10px">أيّ نبات تتوقّعين أن ينمو بشكل أفضل؟</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${['النبات (أ) في المكان المشمس','النبات (ب) في الخزانة المظلمة','سينمو كلاهما بنفس الطريقة'].map((o,i)=>`<button onclick="window._g5lPredict(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:13px">${o}</button>`).join('')}
        </div>`;
    }
    if(S.stage==='setup'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🔬 جهّزي التجربة</div></div>
        <div style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px">اضغطي لريّ النبتتين بنفس كمية الماء ووضعهما في مكانيهما.</div>
        <button class="ctrl-btn play" style="margin-top:12px" onclick="window._g5lSetup()">▶ اروِ النبتتين وابدئي</button>`;
    }
    if(S.stage==='wait'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">⏱️ راقبي مرور الأسابيع</div></div>
        <div style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px">اضغطي للانتقال أسبوعاً بعد أسبوع، وراقبي التغيّر التدريجي.</div>
        <button class="ctrl-btn play" style="margin-top:12px" onclick="window._g5lDay()" ${S.animating?'disabled style="opacity:0.5"':''}>${S.animating?'⏳...':'▶ أسبوع آخر'}</button>`;
    }
    const predictedRight = S.predicted===0;
    return `
      <div class="ctrl-section"><div class="ctrl-label">🎉 ماذا تعلّمنا؟</div></div>
      <div style="padding:14px;background:var(--bg-card2);border-radius:10px;font-size:13px;color:var(--text-secondary);line-height:1.9">
        ${predictedRight?'توقّعك كان صحيحاً! ':''}تحتاج النباتات إلى طاقة ضوئية لتنمو جيّداً، وتحتاج إلى طاقة ضوئية لصنع الغذاء داخل أوراقها. النبات (أ) نما أطول وأخضر صحيّاً، بينما النبات (ب) نما ضعيفاً وشاحب اللون بسبب غياب الضوء.
      </div>
      <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g5lRestart()">↺ أعد التجربة</button>`;
  }
  controls(renderControls());
  window._g5lPredict = function(i){ _g8pPlayClick(); S.predicted=i; S.stage='setup'; controls(renderControls()); };
  window._g5lSetup = function(){ _g8pPlayDrop(); S.stage='wait'; S.day=0; controls(renderControls()); };
  window._g5lDay = function(){ _g8pPlayClick(); S.animating=true; S.dayT=0.0001; controls(renderControls()); };
  window._g5lRestart = function(){ S.stage='predict'; S.predicted=null; S.dayT=0; S.animating=false; S.day=0; controls(renderControls()); };
  cv.onclick=null;

  function drawPlant(c,x,y,w,h,growth,healthy){
    const stemH = h*0.28*growth;
    c.strokeStyle = healthy? '#22C55E' : '#A3E635'; c.lineWidth=Math.max(3,w*0.01); c.lineCap='round';
    c.beginPath(); c.moveTo(x,y); c.lineTo(x,y-stemH); c.stroke();
    if(growth>0.2){
      const leafCol = healthy? '#4ADE80' : '#D9F99D';
      c.fillStyle=leafCol; c.strokeStyle= healthy?'#166534':'#65A30D'; c.lineWidth=1.2;
      for(const side of [-1,1]){
        c.save(); c.translate(x,y-stemH*0.6); c.rotate(side*0.6);
        c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(side*w*0.04,-h*0.03,side*w*0.07,0); c.quadraticCurveTo(side*w*0.04,h*0.01,0,0); c.fill(); c.stroke();
        c.restore();
      }
    }
    if(growth>0.5){
      const leafCol = healthy? '#4ADE80' : '#D9F99D';
      c.fillStyle=leafCol; c.strokeStyle= healthy?'#166534':'#65A30D'; c.lineWidth=1.2;
      for(const side of [-1,1]){
        c.save(); c.translate(x,y-stemH); c.rotate(side*0.5);
        c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(side*w*0.045,-h*0.035,side*w*0.08,0); c.quadraticCurveTo(side*w*0.045,h*0.012,0,0); c.fill(); c.stroke();
        c.restore();
      }
    }
  }

  function draw(){
    if(currentSim!=='g5bio1n5' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g5pBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle=g5pTxt(dark); c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ٥-١ · النبات والضوء', w/2, h*0.06);

    if(S.animating){
      S.dayT += 0.012;
      if(S.dayT>=1){ S.animating=false; S.day = Math.min(MAXDAY, S.day+1); if(S.day>=MAXDAY) S.stage='result'; controls(renderControls()); }
    }

    const growth = S.stage==='setup' ? 0 : Math.min(1, S.day/MAXDAY + (S.animating? S.dayT/MAXDAY:0));

    // منطقة النافذة (مشمسة)
    c.save();
    c.fillStyle = dark?'rgba(253,224,71,0.08)':'rgba(253,224,71,0.18)';
    c.fillRect(w*0.08,h*0.18,w*0.34,h*0.5);
    c.strokeStyle=g5pMut(dark); c.lineWidth=2; c.strokeRect(w*0.08,h*0.18,w*0.34,h*0.5);
    c.fillStyle='#FDE047'; c.beginPath(); c.arc(w*0.35,h*0.24,w*0.025,0,Math.PI*2); c.fill();
    c.restore();
    c.fillStyle=g5pMut(dark); c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
    c.fillText('نبات (أ) — مكان مشمس', w*0.25, h*0.72);
    drawPlant(c, w*0.25, h*0.66, w, h, growth, true);

    // منطقة الخزانة (مظلمة)
    c.save();
    c.fillStyle = dark?'rgba(0,0,0,0.3)':'rgba(60,50,70,0.15)';
    c.fillRect(w*0.58,h*0.18,w*0.34,h*0.5);
    c.strokeStyle=g5pMut(dark); c.lineWidth=2; c.strokeRect(w*0.58,h*0.18,w*0.34,h*0.5);
    c.restore();
    c.fillStyle=g5pMut(dark); c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
    c.fillText('نبات (ب) — خزانة مظلمة', w*0.75, h*0.72);
    drawPlant(c, w*0.75, h*0.66, w, h, growth, false);

    if(S.stage==='wait' || S.stage==='result'){
      c.fillStyle=g5pAccent(dark); c.font=`bold ${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
      c.fillText(`الأسبوع ${S.day}`, w/2, h*0.9);
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}
