// ══════════════════════════════════════════════════════════
// الصف الخامس — الوحدة ١: استقصاء نمو النبات
// ══════════════════════════════════════════════════════════

function g5pBg(dark){ return dark ? '#0B1A10' : '#F0FAF3'; }
function g5pTxt(dark){ return dark ? '#C8EDD4' : '#1A3A25'; }
function g5pMut(dark){ return dark ? '#6BA87A' : '#4A7A5A'; }
function g5pAccent(dark){ return dark ? '#4ADE80' : '#8B5CF6'; }
function g5pClamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
function g5pLerp(a,b,t){ return a + (b-a)*t; }
function g5pGp(cv, e){
  const r = cv.getBoundingClientRect(), sc = cv.width/r.width;
  const s = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
  return { x:(s.clientX-r.left)*sc, y:(s.clientY-r.top)*sc };
}
function g5RRect(c,x,y,w,h,r){ c.beginPath(); if(c.roundRect) c.roundRect(x,y,w,h,r); else c.rect(x,y,w,h); }

/* بذرة فول واضحة: شكل كلوي حقيقي (قضمة جانبية) + بريق + ندبة */
function g5DrawBean(c, cx, cy, R, dark, rot){
  c.save(); c.translate(cx,cy); c.rotate(rot||-0.22);
  c.fillStyle = '#D9A441';
  c.beginPath(); c.ellipse(0,0,R,R*0.74,0,0,Math.PI*2); c.fill();
  c.save();
  c.beginPath(); c.ellipse(0,0,R,R*0.74,0,0,Math.PI*2); c.clip();
  c.globalCompositeOperation='destination-out';
  c.beginPath(); c.ellipse(R*0.62,-R*0.02,R*0.5,R*0.36,0,0,Math.PI*2); c.fill();
  c.restore();
  c.strokeStyle='#8B5E1F'; c.lineWidth=Math.max(2.5,R*0.05);
  c.beginPath(); c.ellipse(0,0,R,R*0.74,0,0,Math.PI*2); c.stroke();
  // بريق (لمعة)
  c.fillStyle='rgba(255,255,255,0.35)';
  c.beginPath(); c.ellipse(-R*0.32,-R*0.28,R*0.28,R*0.14,-0.4,0,Math.PI*2); c.fill();
  // الندبة (hilum)
  c.fillStyle='#6B4A1E';
  c.beginPath(); c.ellipse(R*0.05,R*0.5,R*0.14,R*0.05,0.3,0,Math.PI*2); c.fill();
  c.restore();
}

/* رأس عنوان أكبر وأوضح لجميع أنشطة الصف الخامس */
function g5Title(c,w,h,dark,text){
  c.fillStyle=g5pTxt(dark); c.font=`bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
  c.fillText(text, w/2, h*0.062);
}

/* ══════════════════════════════════════════════════════════
   نشاط ١-١ · البذور — استكشاف + انفلاق تفاعلي عند الضغط على البذرة
   ══════════════════════════════════════════════════════════ */
function simG5Bio1N1a(){
  cancelAnimationFrame(animFrame);
  const OUT_SPOTS = [
    { id:'coat',  label:'غلاف البذرة', pos:{x:0.5,y:0.36}, info:'الغطاء الخارجي الذي يحمي البذرة.' },
    { id:'scar',  label:'الندبة', pos:{x:0.58,y:0.66}, info:'حيث ترتبط البذرة بالثمرة.' },
  ];
  const IN_SPOTS = [
    { id:'embryo', label:'الجنين', pos:{x:0.40,y:0.34}, info:'نبات صغير جداً داخل البذرة، يُسمّى هذا النبات جنيناً، ويبدأ الجنين بالنمو عندما تتوافر له الظروف التي يحتاج إليها.' },
    { id:'store',  label:'مخزون الغذاء', pos:{x:0.60,y:0.58}, info:'تحتوي البذرة أيضاً على مخزون من الغذاء يمدّها بالطاقة اللازمة للنمو.' },
  ];
  simState = { selected:null, opened:false, splitting:false, splitT:0, quiz:false, riddleIdx:0, riddleOrder:[], wrongPick:null, score:0 };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const ALL = [...OUT_SPOTS, ...IN_SPOTS];

  function shuffle(arr){ const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

  function renderControls(){
    if(!S.quiz){
      const spotsNow = S.opened ? ALL : OUT_SPOTS;
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🌰 استكشفي البذرة</div></div>
        <div style="font-size:14px;color:var(--text-secondary);line-height:1.9;margin-bottom:12px">اضغطي على أيّ جزء من البذرة لتتعرّفي عليه.</div>
        <div id="g5sInfo" style="font-size:14.5px;color:var(--text-secondary);line-height:1.9;min-height:24px;margin-bottom:14px;background:var(--bg-card2);border-radius:8px;padding:${S.selected?'12px':'0px'}">
          ${S.selected ? ('<strong>'+spotsNow.find(s=>s.id===S.selected).label+':</strong> '+spotsNow.find(s=>s.id===S.selected).info) : ''}
        </div>
        ${!S.opened ? `<div style="font-size:14px;font-weight:700;background:rgba(139,92,246,0.12);border-right:4px solid #8B5CF6;border-radius:8px;padding:10px 12px;margin-bottom:10px">👆 اضغطي على البذرة نفسها لتنفلق!</div>
          <button class="ctrl-btn play" onclick="window._g5sOpen()">🔍 أو اضغطي هنا لرؤية ما بداخلها</button>` :
          `<button class="ctrl-btn play" onclick="window._g5sQuiz()">✅ أين هذا الجزء؟ (اختبري نفسك)</button>`}`;
    }
    if(S.riddleIdx>=S.riddleOrder.length){
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🎉 أحسنتِ!</div></div>
        <div style="padding:14px;background:var(--bg-card2);border-radius:10px;font-size:14.5px;color:var(--text-secondary);line-height:1.9">
          أجبتِ صح على ${S.score} من ${ALL.length}. البذرة تحتوي على غلاف يحميها، وندبة، وجنين، ومخزون غذاء يساعده على النمو.
        </div>
        <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g5sRestart()">↺ أعد النشاط</button>`;
    }
    const cur = ALL.find(s=>s.id===S.riddleOrder[S.riddleIdx]);
    return `
      <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">✅ أين هذا الجزء؟ (${S.riddleIdx+1} من ${ALL.length})</div></div>
      <div style="font-size:15px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:10px">أين يوجد: ${cur.label}؟</div>
      <div style="font-size:13.5px;color:var(--text-secondary)">اضغطي على الجزء المناسب في الصورة.</div>
      ${S.wrongPick ? `<div style="margin-top:10px;font-size:14px;color:#D97706;background:#FEF3C7;border-radius:8px;padding:10px">💡 ليس هذا الجزء، حاولي مرّة أخرى.</div>` : ''}`;
  }
  controls(renderControls());

  window._g5sOpen = function(){
    if(S.opened || S.splitting) return;
    _g8pPlayDrop(); S.splitting=true; S.splitT=0.0001; S.selected=null;
  };
  window._g5sQuiz = function(){ _g8pPlayClick(); S.quiz=true; S.riddleIdx=0; S.riddleOrder=shuffle(ALL.map(s=>s.id)); S.score=0; controls(renderControls()); };
  window._g5sRestart = function(){ S.selected=null; S.opened=false; S.splitting=false; S.splitT=0; S.quiz=false; S.riddleIdx=0; S.wrongPick=null; controls(renderControls()); };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null; cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null;
  cv.onclick = function(e){
    const p = g5pGp(cv,e), w=cv.width, h=cv.height;
    const spotsNow = S.opened || S.quiz ? ALL : OUT_SPOTS;
    let hit=null;
    for(const s of spotsNow){ if(Math.hypot(p.x-s.pos.x*w,p.y-s.pos.y*h) < w*0.034){ hit=s; break; } }
    if(hit){
      if(!S.quiz){ S.selected=hit.id; _g8pPlayClick(); controls(renderControls()); }
      else {
        const target = S.riddleOrder[S.riddleIdx];
        if(hit.id===target){ _g8pPlayDrop(); S.score++; S.wrongPick=null; S.riddleIdx++; }
        else { _g8pPlayClick(); S.wrongPick=hit.id; setTimeout(()=>{S.wrongPick=null; controls(renderControls());},1200); }
        controls(renderControls());
      }
      return;
    }
    if(!S.opened && !S.splitting && !S.quiz){
      const cx=w*0.5, cy=h*0.5, R=Math.min(w,h)*0.28;
      if(Math.hypot(p.x-cx,p.y-cy) < R*1.2) window._g5sOpen();
    }
  };

  function draw(){
    if(currentSim!=='g5bio1n1' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g5pBg(dark); c.fillRect(0,0,w,h);
    g5Title(c,w,h,dark,'نشاط ١-١ · البذور');

    const cx=w*0.5, cy=h*0.52, R=Math.min(w,h)*0.28;

    if(S.splitting){
      S.splitT += 0.032;
      if(S.splitT>=1){ S.splitT=1; S.splitting=false; S.opened=true; }
    }

    if(!S.opened && !S.splitting){
      // نبضة دعوة للضغط
      const pulse = 1 + Math.sin(performance.now()*0.004)*0.03;
      c.save(); c.globalAlpha=0.25; c.strokeStyle=g5pAccent(dark); c.lineWidth=w*0.01;
      c.beginPath(); c.ellipse(cx,cy,R*1.18*pulse,R*0.9*pulse,-0.22,0,Math.PI*2); c.stroke(); c.restore();
      g5DrawBean(c, cx, cy, R, dark);
    } else {
      const t = S.opened ? 1 : g5pLerp(0,1, S.splitT<0.5 ? 0 : (S.splitT-0.5)*2);
      const gap = g5pLerp(0, R*0.62, S.splitT<0.5 ? S.splitT*2*0.4 : t);
      const rotOut = g5pLerp(0, 0.22, S.splitT);
      // الفلقتان
      [-1,1].forEach(side=>{
        c.save(); c.translate(cx+side*gap*0.55, cy);
        c.rotate(side*rotOut*0.9 - 0.22*(side===-1?1:-1)*0.15);
        c.fillStyle='#E8C877'; c.strokeStyle='#8B5E1F'; c.lineWidth=Math.max(2.5,R*0.045);
        c.beginPath();
        c.moveTo(side*R*0.06, -R*0.82);
        c.quadraticCurveTo(side*R*1.05, -R*0.22, side*R*0.06, R*0.82);
        c.quadraticCurveTo(side*-R*0.22, 0, side*R*0.06, -R*0.82);
        c.closePath(); c.fill(); c.stroke();
        c.restore();
      });
      // الجنين ومخزون الغذاء يظهران تدريجياً بعد الانفلاق
      const revealA = g7sClampSafe(S.splitT);
      c.save(); c.globalAlpha = revealA;
      c.translate(cx,cy);
      c.fillStyle='#4ADE80'; c.strokeStyle='#166534'; c.lineWidth=2;
      c.beginPath(); c.ellipse(-R*0.12,-R*0.4,R*0.16,R*0.2,0,0,Math.PI*2); c.fill(); c.stroke();
      c.fillStyle='rgba(139,94,31,0.25)';
      c.beginPath(); c.ellipse(R*0.1,R*0.18,R*0.34,R*0.4,0,0,Math.PI*2); c.fill();
      c.restore();
    }

    const spotsNow = S.opened || S.quiz ? ALL : OUT_SPOTS;
    spotsNow.forEach(s=>{
      const x=cx+(s.pos.x-0.5)*w, y=cy+(s.pos.y-0.5)*h;
      const isSel = (!S.quiz && S.selected===s.id) || (S.quiz && S.wrongPick===s.id);
      c.save();
      c.fillStyle = isSel ? (S.quiz && S.wrongPick===s.id ? 'rgba(231,76,60,0.55)':'rgba(74,222,128,0.5)') : (dark?'rgba(255,255,255,0.45)':'rgba(255,255,255,0.9)');
      c.strokeStyle = g5pAccent(dark); c.lineWidth=2.5;
      c.beginPath(); c.arc(x,y,w*0.026,0,Math.PI*2); c.fill(); c.stroke();
      c.restore();
      if(!S.quiz){
        c.fillStyle=g5pTxt(dark); c.font=`bold ${Math.round(h*0.019)}px Tajawal`; c.textAlign='center';
        c.fillText(s.label, x, y-h*0.045);
      }
    });

    if(!S.opened && !S.splitting){
      c.fillStyle=g5pMut(dark); c.font=`${Math.round(h*0.017)}px Tajawal`; c.textAlign='center';
      c.fillText('👆 اضغطي على البذرة', cx, cy+R+h*0.06);
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}
function g7sClampSafe(v){ return Math.max(0,Math.min(1,v)); }

/* ══════════════════════════════════════════════════════════
   نشاط ٢-١ · كيف تنمو البذور؟ — اسحبي البذرة والماء إلى الحوض
   ثمّ تعمل الساعة تلقائياً وتنبت البذرة خطوة بخطوة
   ══════════════════════════════════════════════════════════ */
function simG5Bio1N2a(){
  cancelAnimationFrame(animFrame);
  const GSTEPS = [
    { id:'imbibe',  info:'💧 البذرة تمتصّ الماء وتنتفخ.' },
    { id:'crack',   info:'🌱 غلاف البذرة ينفلق.' },
    { id:'root',    info:'⬇ الجذر الأول ينمو متّجهاً إلى الأسفل في التربة.' },
    { id:'stem',    info:'⬆ الساق الأول ينمو متّجهاً إلى الأعلى.' },
    { id:'leaves',  info:'🍃 الأوراق الأوليّة تبدأ بالنمو.' },
    { id:'shrivel', info:'✅ اكتمل الإنبات! لاحظي أنّ البذرة تذبل ويصغر حجمها بعد أن استخدم النبات مخزون غذائها.' },
  ];
  simState = { stage:'predict', predicted:null, placed:{seed:false,water:false}, dragType:null, dragX:0, dragY:0, growIdx:-1, growTimer:null };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const SEED_HOME={x:0.20,y:0.20}, WATER_HOME={x:0.80,y:0.20}, POT={x:0.5,y:0.62};

  function renderControls(){
    if(S.stage==='predict'){
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🌱 كيف تنمو البذور؟</div></div>
        <div style="font-size:15px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px">هل يمكن أن تنبت البذور بدون ماءٍ أو ضوء؟</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${['تحتاج للماء لتنبت، ولا تحتاج للضوء لتنبت','تحتاج للماء والضوء معاً لتنبت','لا تحتاج لا للماء ولا للضوء'].map((o,i)=>`<button onclick="window._g5gPredict(${i})" style="padding:12px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:14px">${o}</button>`).join('')}
        </div>`;
    }
    if(S.stage==='assemble'){
      const n = (S.placed.seed?1:0)+(S.placed.water?1:0);
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🪣 جهّزي بذرة الفول للإنبات</div></div>
        <div style="font-size:14.5px;color:var(--text-secondary);line-height:1.9;margin-bottom:10px">اسحبي البذرة إلى الحوض، ثمّ اسحبي الماء إلى الحوض.</div>
        <div style="font-size:14px;font-weight:700;background:var(--bg-card2);border-radius:8px;padding:10px;text-align:center">اكتمل ${n} من ٢ 🧩</div>`;
    }
    if(S.stage==='growing'){
      const cur = GSTEPS[S.growIdx] || GSTEPS[GSTEPS.length-1];
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">⏱️ الساعة تعمل... البذرة تتغيّر!</div></div>
        <div style="font-size:15px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:14px">${cur.info}</div>`;
    }
    return `
      <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🎉 أحسنتِ!</div></div>
      <div style="padding:14px;background:var(--bg-card2);border-radius:10px;font-size:14.5px;color:var(--text-secondary);line-height:1.9">
        تبدأ البذور في الإنبات إذا كانت الظروف الملائمة متوافرة. تحصل البذور على الطاقة اللازمة للإنبات من مخزون الغذاء الموجود بداخلها. تمتصّ البذور الماء لتبدأ عملية الإنبات. في البداية ينمو الجذر الأول متجهاً إلى الأسفل، ويتبعه الساق الأول حيث ينمو متجهاً إلى الأعلى. <strong>لا تحتاج البذور إلى ضوء لكي تنبت.</strong>
      </div>
      <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g5gRestart()">↺ أعد النشاط</button>`;
  }
  controls(renderControls());

  window._g5gPredict = function(i){ _g8pPlayClick(); S.predicted=i; S.stage='assemble'; controls(renderControls()); };
  window._g5gRestart = function(){
    if(S.growTimer){ clearInterval(S.growTimer); S.growTimer=null; }
    S.stage='predict'; S.predicted=null; S.placed={seed:false,water:false}; S.growIdx=-1; controls(renderControls());
  };
  function startGrowth(){
    S.stage='growing'; S.growIdx=0; controls(renderControls());
    S.growTimer = setInterval(()=>{
      S.growIdx++;
      if(S.growIdx>=GSTEPS.length){ clearInterval(S.growTimer); S.growTimer=null; S.stage='done'; }
      controls(renderControls());
    }, 1500);
  }

  function onDown(e){
    if(S.stage!=='assemble') return;
    const p=g5pGp(cv,e), w=cv.width, h=cv.height;
    if(!S.placed.seed && Math.hypot(p.x-SEED_HOME.x*w,p.y-SEED_HOME.y*h) < w*0.08){ S.dragType='seed'; S.dragX=p.x; S.dragY=p.y; return; }
    if(!S.placed.water && Math.hypot(p.x-WATER_HOME.x*w,p.y-WATER_HOME.y*h) < w*0.08){ S.dragType='water'; S.dragX=p.x; S.dragY=p.y; }
  }
  function onMove(e){ if(!S.dragType) return; e.preventDefault && e.preventDefault(); const p=g5pGp(cv,e); S.dragX=p.x; S.dragY=p.y; }
  function onUp(){
    if(!S.dragType) return;
    const w=cv.width, h=cv.height;
    if(Math.hypot(S.dragX-POT.x*w, S.dragY-POT.y*h) < w*0.19){
      S.placed[S.dragType]=true; _g8pPlayDrop();
      if(S.placed.seed && S.placed.water) setTimeout(startGrowth, 500);
      controls(renderControls());
    }
    S.dragType=null;
  }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;
  cv.onclick=null;

  function draw(){
    if(currentSim!=='g5bio1n2' || currentTab!==0){
      cancelAnimationFrame(animFrame);
      if(S.growTimer){ clearInterval(S.growTimer); S.growTimer=null; }
      return;
    }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g5pBg(dark); c.fillRect(0,0,w,h);
    g5Title(c,w,h,dark,'نشاط ٢-١ · كيف تنمو البذور؟');

    if(S.stage==='predict') { animFrame = requestAnimationFrame(draw); return; }

    // الحوض/الوعاء
    const potX=POT.x*w, potY=POT.y*h, potW=w*0.32, potH=h*0.16;
    c.save();
    c.fillStyle= dark?'rgba(139,105,60,0.35)':'rgba(139,105,60,0.28)';
    g5RRect(c, potX-potW/2, potY-potH*0.15, potW, potH, 10); c.fill();
    c.strokeStyle=g5pMut(dark); c.lineWidth=3; g5RRect(c, potX-potW/2, potY-potH*0.15, potW, potH, 10); c.stroke();
    c.restore();
    c.fillStyle=g5pMut(dark); c.font=`${Math.round(h*0.017)}px Tajawal`; c.textAlign='center';
    c.fillText('🪣 الحوض', potX, potY+potH*0.65);

    if(S.stage==='assemble'){
      // أيقونتا البذرة والماء القابلتان للسحب
      if(!S.placed.seed){
        const x = S.dragType==='seed'?S.dragX:SEED_HOME.x*w, y = S.dragType==='seed'?S.dragY:SEED_HOME.y*h;
        g5DrawBean(c, x, y, w*0.05, dark, -0.2);
        if(S.dragType!=='seed'){ c.fillStyle=g5pTxt(dark); c.font=`bold ${Math.round(h*0.017)}px Tajawal`; c.textAlign='center'; c.fillText('بذرة', x, y+w*0.09); }
      } else {
        c.font=`${Math.round(h*0.03)}px Tajawal`; c.textAlign='center'; c.fillText('✅', potX-potW*0.28, potY-potH*0.2);
      }
      if(!S.placed.water){
        const x = S.dragType==='water'?S.dragX:WATER_HOME.x*w, y = S.dragType==='water'?S.dragY:WATER_HOME.y*h;
        c.font=`${Math.round(h*0.07)}px Tajawal`; c.textAlign='center'; c.fillStyle=g5pTxt(dark); c.fillText('💧', x, y);
        if(S.dragType!=='water'){ c.fillStyle=g5pTxt(dark); c.font=`bold ${Math.round(h*0.017)}px Tajawal`; c.fillText('ماء', x, y+w*0.055); }
      } else {
        c.font=`${Math.round(h*0.03)}px Tajawal`; c.textAlign='center'; c.fillText('✅', potX+potW*0.28, potY-potH*0.2);
      }
      animFrame = requestAnimationFrame(draw);
      return;
    }

    // ── مرحلة النمو (تلقائية) ──
    const idx = S.growIdx>=0 ? S.growIdx : GSTEPS.length;
    const reached = id => idx > GSTEPS.findIndex(s=>s.id===id);
    const cy2 = potY - h*0.02;
    c.save(); c.translate(potX,cy2);
    const size = reached('shrivel') ? 0.55 : 1;
    c.scale(size,size);
    c.fillStyle='#D9A441'; c.strokeStyle='#8B5E1F'; c.lineWidth=3;
    c.beginPath(); c.ellipse(0,0,w*0.045,w*0.033,0,0,Math.PI*2); c.fill(); c.stroke();
    if(reached('crack')){ c.strokeStyle='#8B5E1F'; c.lineWidth=2; c.beginPath(); c.moveTo(-w*0.02,-w*0.02); c.lineTo(w*0.02,w*0.02); c.stroke(); }
    c.restore();
    if(reached('root')){
      c.strokeStyle='#A9895A'; c.lineWidth=Math.max(3,w*0.007); c.lineCap='round';
      c.beginPath(); c.moveTo(potX,cy2); c.quadraticCurveTo(potX-w*0.02,cy2+h*0.11,potX,cy2+h*0.17); c.stroke();
    }
    if(reached('stem')){
      c.strokeStyle='#5F9E52'; c.lineWidth=Math.max(4,w*0.009); c.lineCap='round';
      c.beginPath(); c.moveTo(potX,cy2); c.lineTo(potX,cy2-h*0.18); c.stroke();
    }
    if(reached('leaves')){
      c.fillStyle='#4ADE80'; c.strokeStyle='#166534'; c.lineWidth=1.5;
      for(const side of [-1,1]){
        c.save(); c.translate(potX,cy2-h*0.18); c.rotate(side*0.5);
        c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(side*w*0.045,-h*0.035,side*w*0.08,0); c.quadraticCurveTo(side*w*0.045,h*0.012,0,0); c.fill(); c.stroke();
        c.restore();
      }
    }
    // ساعة تدور بجانب الحوض أثناء النمو
    const clockX = potX+potW*0.55, clockY = potY-potH*1.6;
    c.save(); c.translate(clockX,clockY);
    c.fillStyle= dark?'#12283A':'#fff'; c.strokeStyle=g5pAccent(dark); c.lineWidth=2.5;
    c.beginPath(); c.arc(0,0,w*0.032,0,Math.PI*2); c.fill(); c.stroke();
    const spin = S.stage==='growing' ? performance.now()*0.003 : 0;
    c.strokeStyle=g5pAccent(dark); c.lineWidth=2.5; c.lineCap='round';
    c.beginPath(); c.moveTo(0,0); c.lineTo(Math.cos(spin)*w*0.02, Math.sin(spin)*w*0.02); c.stroke();
    c.beginPath(); c.moveTo(0,0); c.lineTo(Math.cos(spin*0.3)*w*0.014, Math.sin(spin*0.3)*w*0.014); c.stroke();
    c.restore();
    c.fillStyle=g5pMut(dark); c.font=`${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
    c.fillText(S.stage==='growing'?'⏱️ تعمل...':'✅ اكتمل', clockX, clockY+w*0.06);

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   عناصر مساعدة مشتركة لأنشطة التجميع بالسحب (٣-١أ / ٣-١ب)
   ══════════════════════════════════════════════════════════ */
const G5_TOOL_EMOJI = { seed:'🌱', towel:'🧻', water:'💧', bag:'🛍️', band:'➰', straw:'🥤', soil:'🟫' };
const G5_TOOL_NAME  = { seed:'بذرة', towel:'منشفة ورقية', water:'ماء', bag:'كيس بلاستيكي', band:'رابطة', straw:'ماصّة', soil:'تربة' };

/* ══════════════════════════════════════════════════════════
   نشاط ٣-١أ · هل تحتاج البذور إلى الهواء؟ — تجميع بالسحب
   ══════════════════════════════════════════════════════════ */
function simG5Bio1N3a(){
  cancelAnimationFrame(animFrame);
  const STEPS = [
    { type:'seed',  target:'A', need:3, label:'اسحبي بذرة إلى الطبق الأوّل (٣ بذور)' },
    { type:'towel', target:'A', need:1, label:'اسحبي المنشفة الورقية إلى الطبق الأوّل' },
    { type:'water', target:'A', need:1, label:'اسحبي الماء لترطيب المنشفة' },
    { type:'bag',   target:'A', need:1, label:'اسحبي الكيس البلاستيكي ليغطّي الطبق' },
    { type:'band',  target:'A', need:1, label:'اسحبي الرابطة لإغلاق الكيس (يبقى الهواء الطبيعي بداخله)' },
    { type:'seed',  target:'B', need:3, label:'اسحبي بذرة إلى الطبق الثاني (٣ بذور)' },
    { type:'towel', target:'B', need:1, label:'اسحبي المنشفة الورقية إلى الطبق الثاني' },
    { type:'water', target:'B', need:1, label:'اسحبي الماء لترطيب المنشفة' },
    { type:'bag',   target:'B', need:1, label:'اسحبي الكيس البلاستيكي ليغطّي الطبق' },
    { type:'straw', target:'B', need:1, label:'اسحبي الماصّة لشفط الهواء من الكيس، ثمّ أغلقيه' },
  ];
  const TOOL_HOME = { seed:{x:0.10,y:0.16}, towel:{x:0.26,y:0.16}, water:{x:0.42,y:0.16}, bag:{x:0.58,y:0.16}, band:{x:0.74,y:0.16}, straw:{x:0.90,y:0.16} };
  const DISH = { A:{x:0.28,y:0.55}, B:{x:0.72,y:0.55} };
  simState = { stage:'predict', predicted:null, stepIdx:0, subCount:0,
    dish:{ A:{seeds:0,towel:false,water:false,bag:false,sealed:false}, B:{seeds:0,towel:false,water:false,bag:false,sealed:false} },
    dragging:false, dragX:0, dragY:0, day:0, dayT:0, animating:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const MAXDAY = 2;

  function renderControls(){
    if(S.stage==='predict'){
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🌬️ هل تحتاج البذور إلى الهواء لتنبت؟</div></div>
        <div style="font-size:14px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:12px">
          سنضع بذوراً في طبقين على مناديل ورقية رطبة، ونضع كل طبق في كيس: الأول مُحكم الإغلاق بهواء طبيعي، والثاني نشفط منه الهواء قبل إغلاقه.
        </div>
        <div style="font-size:14.5px;font-weight:700;margin-bottom:10px">أيّ طبق تتوقّعين أن تنبت بذوره بشكل أفضل؟</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${['الطبق المعرَّض للهواء الطبيعي','الطبق الذي شُفط منه الهواء','ستنبت بذور الطبقين بنفس الطريقة'].map((o,i)=>`<button onclick="window._g5airPredict(${i})" style="padding:12px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:14px">${o}</button>`).join('')}
        </div>`;
    }
    if(S.stage==='assemble'){
      const st = STEPS[S.stepIdx];
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🔬 جهّزي التجربة بنفسك</div></div>
        <div style="font-size:14.5px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:10px">${st.label}</div>
        ${st.need>1?`<div style="font-size:13.5px;color:var(--text-secondary)">اكتمل ${S.subCount} من ${st.need}</div>`:''}
        <div style="font-size:13px;color:var(--text-secondary);margin-top:8px">خطوة ${S.stepIdx+1} من ${STEPS.length}</div>`;
    }
    if(S.stage==='wait'){
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">⏱️ انتظري ولاحظي</div></div>
        <div style="font-size:14px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px">الطبقان في مكان دافئ. اضغطي للانتقال بين الأيام ومراقبة البذور.</div>
        <button class="ctrl-btn play" style="margin-top:12px" onclick="window._g5airDay()" ${S.animating?'disabled':''}>${S.animating?'⏳...':'▶ يوم آخر'}</button>`;
    }
    return `
      <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🎉 ماذا نستنتج؟</div></div>
      <div style="padding:14px;background:var(--bg-card2);border-radius:10px;font-size:14.5px;color:var(--text-secondary);line-height:1.9">
        أنبتت بذور الطبق المعرَّض للهواء (A) بشكل جيّد وأصبحت أكبر، بينما لم تنبت — أو أنبتت بشكل أضعف بكثير — بذور الطبق الذي شُفط منه الهواء (B) فبقيت صغيرة. هذا يوضّح أنّ البذور تحتاج إلى هواء للإنبات.
      </div>
      <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g5airRestart()">↺ أعد التجربة</button>`;
  }
  controls(renderControls());

  window._g5airPredict = function(i){ _g8pPlayClick(); S.predicted=i; S.stage='assemble'; S.stepIdx=0; S.subCount=0; controls(renderControls()); };
  window._g5airDay = function(){ _g8pPlayClick(); S.animating=true; S.dayT=0.0001; controls(renderControls()); };
  window._g5airRestart = function(){
    S.stage='predict'; S.predicted=null; S.stepIdx=0; S.subCount=0;
    S.dish={ A:{seeds:0,towel:false,water:false,bag:false,sealed:false}, B:{seeds:0,towel:false,water:false,bag:false,sealed:false} };
    S.day=0; S.dayT=0; S.animating=false; controls(renderControls());
  };

  function onDown(e){
    if(S.stage!=='assemble') return;
    const st=STEPS[S.stepIdx]; const home=TOOL_HOME[st.type];
    const p=g5pGp(cv,e), w=cv.width, h=cv.height;
    if(Math.hypot(p.x-home.x*w,p.y-home.y*h) < w*0.075){ S.dragging=true; S.dragX=p.x; S.dragY=p.y; }
  }
  function onMove(e){ if(!S.dragging) return; e.preventDefault && e.preventDefault(); const p=g5pGp(cv,e); S.dragX=p.x; S.dragY=p.y; }
  function onUp(){
    if(!S.dragging) return; S.dragging=false;
    const st=STEPS[S.stepIdx]; const w=cv.width, h=cv.height;
    const target = DISH[st.target];
    if(Math.hypot(S.dragX-target.x*w, S.dragY-target.y*h) < w*0.17){
      _g8pPlayDrop();
      if(st.type==='seed'){ S.subCount++; S.dish[st.target].seeds++; if(S.subCount>=st.need){ S.subCount=0; S.stepIdx++; } }
      else { S.dish[st.target][st.type]=true; if(st.type==='band'||st.type==='straw') S.dish[st.target].sealed=true; S.stepIdx++; }
      if(S.stepIdx>=STEPS.length){ S.stage='wait'; S.day=0; }
      controls(renderControls());
    }
  }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;
  cv.onclick=null;

  function drawToolbar(c,w,h,dark){
    if(S.stage!=='assemble') return;
    const st = STEPS[S.stepIdx];
    Object.keys(TOOL_HOME).forEach(type=>{
      const home = TOOL_HOME[type];
      const active = type===st.type;
      const x = (active && S.dragging) ? S.dragX : home.x*w, y = (active && S.dragging) ? S.dragY : home.y*h;
      c.save();
      c.globalAlpha = active ? 1 : 0.32;
      c.font = `${Math.round(h*(active?0.075:0.05))}px Tajawal`; c.fillStyle=g5pTxt(dark); c.textAlign='center'; c.textBaseline='middle';
      c.fillText(G5_TOOL_EMOJI[type], x, y);
      c.textBaseline='alphabetic';
      if(active){
        c.fillStyle=g5pTxt(dark); c.font=`bold ${Math.round(h*0.016)}px Tajawal`;
        c.fillText(G5_TOOL_NAME[type], x, y+h*0.065);
      }
      c.restore();
    });
  }

  function drawDish(c,w,h,dark,side){
    const d = DISH[side], st = S.dish[side];
    const dx=d.x*w, dy=d.y*h, dr=w*0.13;
    c.save();
    c.fillStyle= dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.05)';
    c.strokeStyle=g5pMut(dark); c.lineWidth=2.5;
    c.beginPath(); c.ellipse(dx,dy,dr,dr*0.62,0,0,Math.PI*2); c.fill(); c.stroke();
    // منشفة
    if(st.towel){ c.fillStyle= dark?'rgba(255,255,255,0.85)':'#fff'; c.strokeStyle='#cbd5e1'; c.lineWidth=1.5;
      c.beginPath(); c.ellipse(dx,dy,dr*0.85,dr*0.5,0,0,Math.PI*2); c.fill(); c.stroke(); }
    // البذور
    for(let i=0;i<st.seeds;i++){
      const bx = dx+(i-1)*dr*0.35, by=dy+dr*0.05;
      g5DrawBean(c, bx, by, w*0.022, dark, 0.3*i);
    }
    // قطرات ماء
    if(st.water){ c.font=`${Math.round(h*0.02)}px Tajawal`; c.textAlign='center'; c.fillStyle=g5pTxt(dark);
      [-1,0,1].forEach(o=> c.fillText('💧', dx+o*dr*0.4, dy-dr*0.55)); }
    // الكيس البلاستيكي
    if(st.bag){
      const shrink = st.sealed && side==='B' ? 0.78 : 1; // الكيس ينكمش قليلاً بعد سحب الهواء
      c.strokeStyle= dark?'rgba(200,230,255,0.65)':'rgba(60,110,150,0.55)'; c.lineWidth=2; c.setLineDash([5,4]);
      c.beginPath(); c.ellipse(dx,dy,dr*1.22*shrink,dr*0.85*shrink,0,0,Math.PI*2); c.stroke(); c.setLineDash([]);
    }
    // الإغلاق
    if(st.sealed){
      c.font=`${Math.round(h*0.028)}px Tajawal`; c.textAlign='center'; c.fillStyle=g5pTxt(dark);
      c.fillText(side==='A'?'➰':'🥤', dx, dy+dr*1.1);
    }
    c.restore();
    c.fillStyle=g5pTxt(dark); c.font=`bold ${Math.round(h*0.018)}px Tajawal`; c.textAlign='center';
    c.fillText(side==='A'?'الطبق A — هواء طبيعي':'الطبق B — بدون هواء', dx, dy+dr*1.35);
  }

  function draw(){
    if(currentSim!=='g5bio1n3' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g5pBg(dark); c.fillRect(0,0,w,h);
    g5Title(c,w,h,dark,'نشاط ٣-١أ · هل تحتاج البذور إلى الهواء؟');

    if(S.animating){
      S.dayT += 0.01;
      if(S.dayT>=1){ S.animating=false; S.day = Math.min(MAXDAY, S.day+1); if(S.day>=MAXDAY) S.stage='result'; controls(renderControls()); }
    }

    if(S.stage==='predict'){ animFrame = requestAnimationFrame(draw); return; }

    if(S.stage==='assemble'){
      drawToolbar(c,w,h,dark);
      drawDish(c,w,h,dark,'A');
      drawDish(c,w,h,dark,'B');
    } else {
      const growthA = Math.min(1, S.day/MAXDAY + (S.animating? S.dayT/MAXDAY:0));
      [ ['A',true], ['B',false] ].forEach(([side,hasAir])=>{
        const d=DISH[side]; const dx=d.x*w, dy=d.y*h, dr=w*0.13;
        c.save();
        c.fillStyle= dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.05)';
        c.strokeStyle=g5pMut(dark); c.lineWidth=2.5;
        c.beginPath(); c.ellipse(dx,dy,dr,dr*0.62,0,0,Math.PI*2); c.fill(); c.stroke();
        for(let i=0;i<3;i++){
          const bx = dx+(i-1)*dr*0.4, by=dy+dr*0.1;
          g5DrawBean(c, bx, by, w*0.02, dark, 0.2*i);
          const gr = hasAir ? growthA : 0;
          if(gr>0){ c.strokeStyle='#4ADE80'; c.lineWidth=Math.max(2,w*0.005); c.beginPath(); c.moveTo(bx,by-w*0.02); c.lineTo(bx,by-w*0.02-dr*0.9*gr); c.stroke(); }
        }
        c.strokeStyle= dark?'rgba(200,230,255,0.5)':'rgba(60,110,150,0.45)'; c.lineWidth=2; c.setLineDash([5,4]);
        c.beginPath(); c.ellipse(dx,dy,dr*(hasAir?1.25:0.98),dr*(hasAir?0.9:0.68),0,0,Math.PI*2); c.stroke(); c.setLineDash([]);
        c.restore();
        c.fillStyle=g5pTxt(dark); c.font=`bold ${Math.round(h*0.017)}px Tajawal`; c.textAlign='center';
        c.fillText(hasAir?'الطبق A — هواء طبيعي':'الطبق B — بدون هواء', dx, dy+dr*1.35);
      });
      c.fillStyle=g5pAccent(dark); c.font=`bold ${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
      c.fillText(`اليوم ${S.day}`, w/2, h*0.85);
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   نشاط ٣-١ب · هل تحتاج البذور إلى الدفء؟ — تجميع بالسحب
   ══════════════════════════════════════════════════════════ */
function simG5Bio1N3b(){
  cancelAnimationFrame(animFrame);
  const STEPS = [
    { type:'soil', target:'A', need:1, label:'اسحبي التربة إلى الإناء الأوّل (☀️ المكان الدافئ)' },
    { type:'seed', target:'A', need:3, label:'اسحبي البذور إلى الإناء الأوّل (٣ بذور)' },
    { type:'water',target:'A', need:1, label:'اسحبي الماء إلى الإناء الأوّل' },
    { type:'soil', target:'B', need:1, label:'اسحبي التربة إلى الإناء الثاني (❄️ المكان البارد)' },
    { type:'seed', target:'B', need:3, label:'اسحبي البذور إلى الإناء الثاني (٣ بذور)' },
    { type:'water',target:'B', need:1, label:'اسحبي الماء إلى الإناء الثاني' },
  ];
  const TOOL_HOME = { soil:{x:0.5,y:0.15}, seed:{x:0.5,y:0.15}, water:{x:0.5,y:0.15} };
  const POT = { A:{x:0.28,y:0.6}, B:{x:0.72,y:0.6} };
  simState = { stage:'predict', predicted:null, stepIdx:0, subCount:0,
    pot:{ A:{soil:false,seeds:0,water:false}, B:{soil:false,seeds:0,water:false} },
    dragging:false, dragX:0, dragY:0, day:0, dayT:0, animating:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const MAXDAY = 3;

  function renderControls(){
    if(S.stage==='predict'){
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🌡️ هل تحتاج البذور إلى الدفء لتنبت؟</div></div>
        <div style="font-size:14px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:12px">
          سنضع تربة وكمّية البذور نفسها وكمّية الماء نفسها في إناءين: الأوّل في مكان دافئ، والثاني في مكان بارد (كالثلّاجة)، لمدّة زمنية واحدة.
        </div>
        <div style="font-size:14.5px;font-weight:700;margin-bottom:10px">أيّ إناء تتوقّعين أن تنبت بذوره؟</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${['الإناء في المكان الدافئ','الإناء في المكان البارد','سينبتان بنفس الطريقة'].map((o,i)=>`<button onclick="window._g5warmPredict(${i})" style="padding:12px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:14px">${o}</button>`).join('')}
        </div>`;
    }
    if(S.stage==='assemble'){
      const st = STEPS[S.stepIdx];
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🔬 جهّزي التجربة بنفسك</div></div>
        <div style="font-size:14.5px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:10px">${st.label}</div>
        ${st.need>1?`<div style="font-size:13.5px;color:var(--text-secondary)">اكتمل ${S.subCount} من ${st.need}</div>`:''}
        <div style="font-size:13px;color:var(--text-secondary);margin-top:8px">خطوة ${S.stepIdx+1} من ${STEPS.length}</div>`;
    }
    if(S.stage==='wait'){
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">⏱️ انتظري ولاحظي</div></div>
        <div style="font-size:14px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px">اضغطي للانتقال بين الأيام ومراقبة الإناءين.</div>
        <button class="ctrl-btn play" style="margin-top:12px" onclick="window._g5warmDay()" ${S.animating?'disabled':''}>${S.animating?'⏳...':'▶ يوم آخر'}</button>`;
    }
    return `
      <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🎉 ماذا نستنتج؟</div></div>
      <div style="padding:14px;background:var(--bg-card2);border-radius:10px;font-size:14.5px;color:var(--text-secondary);line-height:1.9">
        أنبتت بذور الإناء الموجود في المكان الدافئ (☀️)، بينما لم تنبت بذور الإناء البارد (❄️) رغم حصولها على التربة والماء نفسهما. هذا يوضّح أنّ البذور تحتاج إلى درجة حرارة مناسبة (دفء) لتنبت.
      </div>
      <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g5warmRestart()">↺ أعد التجربة</button>`;
  }
  controls(renderControls());

  window._g5warmPredict = function(i){ _g8pPlayClick(); S.predicted=i; S.stage='assemble'; S.stepIdx=0; S.subCount=0; controls(renderControls()); };
  window._g5warmDay = function(){ _g8pPlayClick(); S.animating=true; S.dayT=0.0001; controls(renderControls()); };
  window._g5warmRestart = function(){
    S.stage='predict'; S.predicted=null; S.stepIdx=0; S.subCount=0;
    S.pot={ A:{soil:false,seeds:0,water:false}, B:{soil:false,seeds:0,water:false} };
    S.day=0; S.dayT=0; S.animating=false; controls(renderControls());
  };

  function onDown(e){
    if(S.stage!=='assemble') return;
    const st=STEPS[S.stepIdx]; const home=TOOL_HOME[st.type];
    const p=g5pGp(cv,e), w=cv.width, h=cv.height;
    if(Math.hypot(p.x-home.x*w,p.y-home.y*h) < w*0.08){ S.dragging=true; S.dragX=p.x; S.dragY=p.y; }
  }
  function onMove(e){ if(!S.dragging) return; e.preventDefault && e.preventDefault(); const p=g5pGp(cv,e); S.dragX=p.x; S.dragY=p.y; }
  function onUp(){
    if(!S.dragging) return; S.dragging=false;
    const st=STEPS[S.stepIdx]; const w=cv.width, h=cv.height;
    const target = POT[st.target];
    if(Math.hypot(S.dragX-target.x*w, S.dragY-target.y*h) < w*0.17){
      _g8pPlayDrop();
      if(st.type==='seed'){ S.subCount++; S.pot[st.target].seeds++; if(S.subCount>=st.need){ S.subCount=0; S.stepIdx++; } }
      else { S.pot[st.target][st.type]=true; S.stepIdx++; }
      if(S.stepIdx>=STEPS.length){ S.stage='wait'; S.day=0; }
      controls(renderControls());
    }
  }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;
  cv.onclick=null;

  function drawPot(c,w,h,dark,side,warmLabel){
    const d=POT[side], st=S.pot[side];
    const px=d.x*w, py=d.y*h, pw=w*0.22, ph=h*0.16;
    // منطقة توضّح الحرارة
    c.save();
    c.fillStyle = side==='A' ? (dark?'rgba(253,224,71,0.10)':'rgba(253,224,71,0.20)') : (dark?'rgba(125,211,252,0.10)':'rgba(125,211,252,0.20)');
    g5RRect(c, px-pw*1.1, py-ph*2.1, pw*2.2, ph*2.6, 16); c.fill();
    c.strokeStyle=g5pMut(dark); c.lineWidth=1.5; c.setLineDash([4,4]);
    g5RRect(c, px-pw*1.1, py-ph*2.1, pw*2.2, ph*2.6, 16); c.stroke(); c.setLineDash([]);
    c.font=`${Math.round(h*0.03)}px Tajawal`; c.textAlign='center'; c.fillStyle=g5pTxt(dark);
    c.fillText(side==='A'?'☀️':'❄️', px, py-ph*1.6);
    c.fillStyle=g5pTxt(dark); c.font=`bold ${Math.round(h*0.016)}px Tajawal`;
    c.fillText(warmLabel, px, py-ph*1.15);
    c.restore();
    // الإناء
    c.save();
    c.fillStyle='#C4885A'; c.strokeStyle='#8B5E1F'; c.lineWidth=2.5;
    c.beginPath(); c.moveTo(px-pw/2,py-ph*0.1); c.lineTo(px-pw*0.4,py+ph*0.9); c.lineTo(px+pw*0.4,py+ph*0.9); c.lineTo(px+pw/2,py-ph*0.1); c.closePath(); c.fill(); c.stroke();
    if(st.soil){ c.fillStyle='#6B4A2E'; c.beginPath(); c.ellipse(px,py-ph*0.1,pw*0.5,ph*0.14,0,0,Math.PI*2); c.fill(); }
    for(let i=0;i<st.seeds;i++){ g5DrawBean(c, px+(i-1)*pw*0.22, py-ph*0.08, w*0.016, dark, 0.3*i); }
    if(st.water){ c.font=`${Math.round(h*0.018)}px Tajawal`; c.textAlign='center'; c.fillText('💧', px+pw*0.3, py-ph*0.35); }
    c.restore();
    c.fillStyle=g5pTxt(dark); c.font=`bold ${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
    c.fillText(side==='A'?'الإناء A':'الإناء B', px, py+ph*1.15);
  }

  function draw(){
    if(currentSim!=='g5bio1n3' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g5pBg(dark); c.fillRect(0,0,w,h);
    g5Title(c,w,h,dark,'نشاط ٣-١ب · هل تحتاج البذور إلى الدفء؟');

    if(S.animating){
      S.dayT += 0.01;
      if(S.dayT>=1){ S.animating=false; S.day = Math.min(MAXDAY, S.day+1); if(S.day>=MAXDAY) S.stage='result'; controls(renderControls()); }
    }
    if(S.stage==='predict'){ animFrame = requestAnimationFrame(draw); return; }

    if(S.stage==='assemble'){
      const st = STEPS[S.stepIdx];
      const home = TOOL_HOME[st.type];
      const x = S.dragging?S.dragX:home.x*w, y = S.dragging?S.dragY:home.y*h;
      c.save(); c.font=`${Math.round(h*0.08)}px Tajawal`; c.fillStyle=g5pTxt(dark); c.textAlign='center'; c.textBaseline='middle';
      c.fillText(G5_TOOL_EMOJI[st.type], x, y); c.textBaseline='alphabetic';
      c.fillStyle=g5pTxt(dark); c.font=`bold ${Math.round(h*0.017)}px Tajawal`;
      c.fillText(G5_TOOL_NAME[st.type], x, y+h*0.06);
      c.restore();
      drawPot(c,w,h,dark,'A','مكان دافئ');
      drawPot(c,w,h,dark,'B','مكان بارد');
    } else {
      const growth = Math.min(1, S.day/MAXDAY + (S.animating? S.dayT/MAXDAY:0));
      [['A',true,'مكان دافئ'],['B',false,'مكان بارد']].forEach(([side,warm,label])=>{
        drawPot(c,w,h,dark,side,label);
        if(warm && growth>0){
          const d=POT[side], px=d.x*w, py=d.y*h, ph=h*0.16;
          c.strokeStyle='#4ADE80'; c.lineWidth=Math.max(3,w*0.007); c.lineCap='round';
          c.beginPath(); c.moveTo(px,py-ph*0.1); c.lineTo(px,py-ph*0.1-ph*1.3*growth); c.stroke();
          if(growth>0.5){
            c.fillStyle='#4ADE80'; c.strokeStyle='#166534'; c.lineWidth=1.5;
            for(const s2 of [-1,1]){ c.save(); c.translate(px,py-ph*0.1-ph*1.3*growth); c.rotate(s2*0.5);
              c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(s2*w*0.03,-h*0.02,s2*w*0.05,0); c.quadraticCurveTo(s2*w*0.03,h*0.008,0,0); c.fill(); c.stroke(); c.restore(); }
          }
        }
      });
      c.fillStyle=g5pAccent(dark); c.font=`bold ${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
      c.fillText(`اليوم ${S.day}`, w/2, h*0.9);
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   نشاط ٤-١ · ماذا يحتاج النبات كي ينمو؟ — عرض بأربعة أقسام واضحة
   ══════════════════════════════════════════════════════════ */
function simG5Bio1N4a(){
  cancelAnimationFrame(animFrame);
  const PLANTS = [
    { name:'عبدالله', place:'sun',    water:'🚿 رُوي مرتين أسبوعياً', h:25, desc:'أخضر وصحيّ', col:'#22C55E', healthy:true },
    { name:'محمد',    place:'shade',  water:'🚿 رُوي مرتين أسبوعياً', h:18, desc:'أخضر فاتح، صحيّ إلى حدّ ما', col:'#84CC16', healthy:true },
    { name:'سعيد',    place:'sunDry', water:'🚱 نُسي أن يُروى', h:6,  desc:'جافّ وبنيّ', col:'#A16207', healthy:false },
    { name:'طارق',    place:'bed',    water:'🚿 رُوي مرتين أسبوعياً', h:14, desc:'نحيف وضعيف', col:'#65A30D', healthy:true, thin:true },
  ];
  const QUESTIONS = [
    { q:'١) أيّ النباتات نما بأفضل حال؟ ولماذا؟', a:'نبات عبدالله — لأنّه كان في مكان مشمس ورُوي بانتظام؛ توفّرت له الشمس والماء معاً.' },
    { q:'٢) أيّ النباتات نما بأسوأ حال؟ ولماذا؟', a:'نبات سعيد — كان في الشمس لكنّه لم يُروَ، فذبل وجفّ رغم توفّر الضوء.' },
    { q:'٣) لماذا كان نبات محمد أصغر من نبات عبدالله رغم أنّ كليهما رُوي بانتظام؟', a:'لأنّ محمد كان في مكان ظليل؛ النباتات تحتاج إلى الضوء لصنع غذائها والنمو جيّداً.' },
    { q:'٤) لماذا كان نبات طارق نحيفاً وضعيفاً رغم أنّه رُوي بانتظام؟', a:'لأنّه كان تحت السرير بعيداً عن الضوء تماماً — الماء وحده لا يكفي، فالنبات يحتاج الضوء أيضاً.' }
  ];
  simState = { stage:'intro', revealIdx:0, qIdx:0, showAns:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    if(S.stage==='intro'){
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🌿 ماذا يحتاج النبات كي ينمو؟</div></div>
        <div style="font-size:14px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:12px">
          زرع أربعة طلاب نباتاتهم في ظروف مختلفة، وقاسوا طولها بعد أسبوعين. راقبي مكان كل نبات وكمّية سقايته.
        </div>
        <button class="ctrl-btn play" onclick="window._g5fReveal()">▶ راقبي النباتات الأربعة</button>`;
    }
    if(S.stage==='reveal'){
      const n = S.revealIdx;
      if(n < PLANTS.length){
        return `
          <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🌱 نبات ${PLANTS[n].name}</div></div>
          <div style="font-size:14.5px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:12px">
            <strong>السقاية:</strong> ${PLANTS[n].water}<br><strong>الطول:</strong> ${PLANTS[n].h} cm — <strong>المظهر:</strong> ${PLANTS[n].desc}
          </div>
          <button class="ctrl-btn play" onclick="window._g5fNext()">➡ التالي</button>`;
      }
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">📊 قارني النتائج</div></div>
        <div style="font-size:13.5px;color:var(--text-secondary);margin-bottom:12px">تأمّلي الأقسام الأربعة جيّداً — أيّ نبات الأطول؟ وأيّهم الأقصر؟</div>
        <button class="ctrl-btn play" onclick="window._g5fQ()">➡ الأسئلة</button>`;
    }
    if(S.stage==='q'){
      if(S.qIdx >= QUESTIONS.length){
        return `
          <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🎉 أحسنتِ!</div></div>
          <div style="padding:14px;background:var(--bg-card2);border-radius:10px;font-size:14.5px;color:var(--text-secondary);line-height:1.9">
            النبات يحتاج <strong>ضوءاً وماءً معاً</strong> لينمو بشكل صحّي. نقص أيٍّ منهما — حتى مع توفّر الآخر — يجعل النبات ضعيفاً أو يجعله يذبل.
          </div>
          <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g5fRestart()">↺ أعد النشاط</button>`;
      }
      const cur = QUESTIONS[S.qIdx];
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🤔 سؤال ${S.qIdx+1} من ${QUESTIONS.length}</div></div>
        <div style="font-size:15px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px;line-height:1.8">${cur.q}</div>
        ${!S.showAns ?
          `<div style="font-size:13.5px;color:var(--text-secondary);margin-bottom:10px">فكّري في إجابتك أولاً، ثمّ اضغطي لإظهارها.</div>
           <button class="ctrl-btn play" onclick="window._g5fShowAns()">💡 أظهري الإجابة</button>` :
          `<div style="font-size:14px;line-height:1.8;color:var(--text-secondary);background:rgba(74,222,128,0.12);border-right:4px solid #22C55E;border-radius:8px;padding:12px;margin-bottom:12px"><strong>الإجابة:</strong> ${cur.a}</div>
           <button class="ctrl-btn play" onclick="window._g5fNextQ()">➡ ${S.qIdx+1<QUESTIONS.length?'السؤال التالي':'إنهاء'}</button>`}
      `;
    }
  }
  controls(renderControls());
  window._g5fReveal = function(){ _g8pPlayClick(); S.stage='reveal'; S.revealIdx=0; controls(renderControls()); };
  window._g5fNext = function(){ _g8pPlayClick(); S.revealIdx++; controls(renderControls()); };
  window._g5fQ = function(){ _g8pPlayClick(); S.stage='q'; S.qIdx=0; S.showAns=false; controls(renderControls()); };
  window._g5fShowAns = function(){ _g8pPlayDrop(); S.showAns=true; controls(renderControls()); };
  window._g5fNextQ = function(){ _g8pPlayClick(); S.qIdx++; S.showAns=false; controls(renderControls()); };
  window._g5fRestart = function(){ S.stage='intro'; S.revealIdx=0; S.qIdx=0; S.showAns=false; controls(renderControls()); };
  cv.onclick=null; cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null; cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null;

  function drawQuadrantBg(c,x0,y0,qw,qh,dark,place){
    c.save();
    if(place==='sun'){
      c.fillStyle= dark?'rgba(253,224,71,0.10)':'rgba(253,224,71,0.22)';
      g5RRect(c,x0,y0,qw,qh,16); c.fill();
      c.fillStyle='#FDE047'; c.beginPath(); c.arc(x0+qw*0.85,y0+qh*0.16,qw*0.05,0,Math.PI*2); c.fill();
    } else if(place==='shade'){
      c.fillStyle= dark?'rgba(148,163,184,0.10)':'rgba(100,116,139,0.14)';
      g5RRect(c,x0,y0,qw,qh,16); c.fill();
      c.fillStyle= dark?'rgba(200,200,220,0.5)':'rgba(120,130,150,0.55)';
      c.beginPath(); c.ellipse(x0+qw*0.82,y0+qh*0.16,qw*0.06,qh*0.035,0,0,Math.PI*2); c.fill();
      c.beginPath(); c.ellipse(x0+qw*0.90,y0+qh*0.19,qw*0.045,qh*0.028,0,0,Math.PI*2); c.fill();
    } else if(place==='sunDry'){
      c.fillStyle= dark?'rgba(253,224,71,0.08)':'rgba(253,224,71,0.16)';
      g5RRect(c,x0,y0,qw,qh,16); c.fill();
      c.fillStyle='#FDE047'; c.beginPath(); c.arc(x0+qw*0.85,y0+qh*0.16,qw*0.05,0,Math.PI*2); c.fill();
      c.strokeStyle='rgba(139,90,30,0.5)'; c.lineWidth=1.5;
      for(let i=0;i<3;i++){ c.beginPath(); c.moveTo(x0+qw*(0.2+i*0.22),y0+qh*0.88); c.lineTo(x0+qw*(0.26+i*0.22),y0+qh*0.94); c.stroke(); }
    } else { // bed
      c.fillStyle= dark?'rgba(10,15,25,0.55)':'rgba(50,55,75,0.28)';
      g5RRect(c,x0,y0,qw,qh,16); c.fill();
      c.fillStyle= dark?'#3a4a5f':'#8892a8';
      c.fillRect(x0+qw*0.12,y0+qh*0.14,qw*0.76,qh*0.06);
      for(let i=0;i<4;i++) c.fillRect(x0+qw*(0.14+i*0.18),y0+qh*0.14,qw*0.02,qh*0.1);
      c.fillStyle=g5pMut(dark); c.font=`${Math.round(qh*0.05)}px Tajawal`; c.textAlign='center';
      c.fillText('🛏️ تحت السرير', x0+qw*0.5, y0+qh*0.12);
    }
    c.restore();
  }

  function drawTree(c,cx,baseY,maxSpan,growth,col,thin,healthy){
    const trunkH = maxSpan*0.55*growth;
    const trunkW = thin? maxSpan*0.03 : maxSpan*0.06;
    c.fillStyle='#8B5E34'; c.strokeStyle='#5C3B1E'; c.lineWidth=1.5;
    g5RRect(c, cx-trunkW/2, baseY-trunkH, trunkW, trunkH, trunkW*0.4); c.fill(); c.stroke();
    if(!healthy){
      // نبات ذابل جافّ
      c.strokeStyle='#92400E'; c.lineWidth=Math.max(2,maxSpan*0.02); c.lineCap='round';
      c.save(); c.translate(cx,baseY-trunkH); c.rotate(0.5);
      c.beginPath(); c.moveTo(0,0); c.lineTo(maxSpan*0.12,maxSpan*0.05); c.stroke();
      c.restore();
      return;
    }
    const canopyR = (thin? maxSpan*0.09 : maxSpan*0.16) * Math.max(0.35,growth);
    const cy = baseY-trunkH;
    c.fillStyle=col; c.strokeStyle='rgba(0,0,0,0.15)'; c.lineWidth=1.5;
    [[0,0],[-canopyR*0.7,canopyR*0.35],[canopyR*0.7,canopyR*0.35]].forEach(([ox,oy])=>{
      c.beginPath(); c.arc(cx+ox, cy-canopyR*0.5+oy, canopyR, 0, Math.PI*2); c.fill(); c.stroke();
    });
  }

  function draw(){
    if(currentSim!=='g5bio1n4' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g5pBg(dark); c.fillRect(0,0,w,h);
    g5Title(c,w,h,dark,'نشاط ٤-١ · ماذا يحتاج النبات كي ينمو؟');

    const allShown = S.stage==='q' || (S.stage==='reveal' && S.revealIdx>=PLANTS.length);
    const gap=w*0.02, top=h*0.11, qw=(w-gap*3)/2, qh=(h-top-gap*2-h*0.02)/2;
    const QPOS = [ {x0:gap,y0:top}, {x0:gap*2+qw,y0:top}, {x0:gap,y0:top+qh+gap}, {x0:gap*2+qw,y0:top+qh+gap} ];

    let tallestI=0, shortestI=0;
    PLANTS.forEach((p,i)=>{ if(p.h>PLANTS[tallestI].h) tallestI=i; if(p.h<PLANTS[shortestI].h) shortestI=i; });

    PLANTS.forEach((p,i)=>{
      const q = QPOS[i];
      const show = S.stage!=='intro' && (S.stage!=='reveal' || i<=S.revealIdx);
      drawQuadrantBg(c,q.x0,q.y0,qw,qh,dark,p.place);
      c.fillStyle=g5pTxt(dark); c.font=`bold ${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
      c.fillText(p.name, q.x0+qw*0.5, q.y0+qh*0.13);
      c.fillStyle=g5pMut(dark); c.font=`${Math.round(h*0.014)}px Tajawal`;
      c.fillText(p.water, q.x0+qw*0.5, q.y0+qh*0.94);
      const baseY = q.y0+qh*0.82;
      c.strokeStyle=g5pMut(dark); c.lineWidth=1.5; c.beginPath(); c.moveTo(q.x0+qw*0.1,baseY); c.lineTo(q.x0+qw*0.9,baseY); c.stroke();
      if(show){
        drawTree(c, q.x0+qw*0.5, baseY, Math.min(qw,qh), p.h/25, p.col, p.thin, p.healthy);
        c.fillStyle=g5pTxt(dark); c.font=`bold ${Math.round(h*0.017)}px Tajawal`; c.textAlign='center';
        c.fillText(p.h+' cm', q.x0+qw*0.5, q.y0+qh*0.24);
        if(allShown && i===tallestI){ c.font=`${Math.round(h*0.026)}px Tajawal`; c.fillText('👑', q.x0+qw*0.5, q.y0+qh*0.05); }
        if(allShown && i===shortestI){ c.fillStyle='#DC2626'; c.font=`bold ${Math.round(h*0.014)}px Tajawal`; c.fillText('الأقصر', q.x0+qw*0.85, q.y0+qh*0.13); }
        if(allShown && i===tallestI){ c.fillStyle='#16A34A'; c.font=`bold ${Math.round(h*0.014)}px Tajawal`; c.fillText('الأطول', q.x0+qw*0.85, q.y0+qh*0.13); }
      }
    });

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   نشاط ٥-١ · النبات والضوء — زر "ابدئي نمو النبات" يُشغّل النمو تلقائياً
   ══════════════════════════════════════════════════════════ */
function simG5Bio1N5a(){
  cancelAnimationFrame(animFrame);
  simState = { stage:'predict', predicted:null, dayT:0, animating:false, day:0, autoTimer:null };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const MAXDAY = 3;

  function renderControls(){
    if(S.stage==='predict'){
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">☀️ النبات والضوء</div></div>
        <div style="font-size:14px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:12px">
          نبات (أ) في مكان مشمس بجانب نافذة، ونبات (ب) في خزانة مظلمة. سنروي كليهما بنفس كمية الماء كلّ مرة.
        </div>
        <div style="font-size:14.5px;font-weight:700;margin-bottom:10px">أيّ نبات تتوقّعين أن ينمو بشكل أفضل؟</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${['النبات (أ) في المكان المشمس','النبات (ب) في الخزانة المظلمة','سينمو كلاهما بنفس الطريقة'].map((o,i)=>`<button onclick="window._g5lPredict(${i})" style="padding:12px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:14px">${o}</button>`).join('')}
        </div>`;
    }
    if(S.stage==='ready'){
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🔬 جهّزي التجربة</div></div>
        <div style="font-size:14px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:12px">اضغطي على الزر لريّ النبتتين بنفس كمّية الماء، ثمّ ستبدأ الشجرة بالنمو تلقائياً أسبوعاً بعد أسبوع.</div>
        <button class="ctrl-btn play" onclick="window._g5lStart()">🌱 ابدئي نمو النبات</button>`;
    }
    if(S.stage==='wait'){
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">⏱️ النبات ينمو تلقائياً...</div></div>
        <div style="font-size:14px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px">راقبي الفرق بين النبتتين أسبوعاً بعد أسبوع.</div>`;
    }
    const predictedRight = S.predicted===0;
    return `
      <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🎉 ماذا تعلّمنا؟</div></div>
      <div style="padding:14px;background:var(--bg-card2);border-radius:10px;font-size:14.5px;color:var(--text-secondary);line-height:1.9">
        ${predictedRight?'توقّعك كان صحيحاً! ':''}نبات (أ) — المشمس — نما أطول بكثير وأخضر صحيّاً؛ بينما نبات (ب) — في الخزانة المظلمة — بقي قصيراً جداً وشاحب اللون رغم أنّه رُوي بنفس الكمية بالضبط. الماء وحده لا يكفي: النبات يحتاج إلى الضوء أيضاً ليصنع غذاءه وينمو.
      </div>
      <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g5lRestart()">↺ أعد التجربة</button>`;
  }
  controls(renderControls());

  window._g5lPredict = function(i){ _g8pPlayClick(); S.predicted=i; S.stage='ready'; controls(renderControls()); };
  window._g5lStart = function(){
    _g8pPlayDrop(); S.stage='wait'; S.day=0; controls(renderControls());
    S.autoTimer = setInterval(()=>{
      S.animating=true; S.dayT=0.0001;
    }, 1600);
  };
  window._g5lRestart = function(){
    if(S.autoTimer){ clearInterval(S.autoTimer); S.autoTimer=null; }
    S.stage='predict'; S.predicted=null; S.dayT=0; S.animating=false; S.day=0; controls(renderControls());
  };
  cv.onclick=null;

  function drawPlant(c,x,y,w,h,growth,healthy){
    const effGrowth = growth*(healthy?1:0.32);
    const stemH = h*0.28*effGrowth;
    c.strokeStyle = healthy? '#22C55E' : '#BEF264'; c.lineWidth= healthy? Math.max(3,w*0.01) : Math.max(1.5,w*0.005); c.lineCap='round';
    c.beginPath(); c.moveTo(x,y); c.lineTo(x,y-stemH); c.stroke();
    if(effGrowth>0.15 && effGrowth<=0.45){
      const leafCol = healthy? '#4ADE80' : '#EEF9C8';
      c.fillStyle=leafCol; c.strokeStyle= healthy?'#166534':'#A3B36A'; c.lineWidth=1;
      for(const side of [-1,1]){
        c.save(); c.translate(x,y-stemH*0.6); c.rotate(side*0.6);
        const s = healthy?1:0.55;
        c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(side*w*0.04*s,-h*0.03*s,side*w*0.07*s,0); c.quadraticCurveTo(side*w*0.04*s,h*0.01*s,0,0); c.fill(); c.stroke();
        c.restore();
      }
    }
    if(effGrowth>0.45){
      const leafCol = healthy? '#4ADE80' : '#EEF9C8';
      c.fillStyle=leafCol; c.strokeStyle= healthy?'#166534':'#A3B36A'; c.lineWidth=1;
      for(const side of [-1,1]){
        c.save(); c.translate(x,y-stemH*0.6); c.rotate(side*0.6);
        const s = healthy?1:0.55;
        c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(side*w*0.04*s,-h*0.03*s,side*w*0.07*s,0); c.quadraticCurveTo(side*w*0.04*s,h*0.01*s,0,0); c.fill(); c.stroke();
        c.restore();
      }
      c.fillStyle=leafCol; c.strokeStyle= healthy?'#166534':'#A3B36A'; c.lineWidth=1;
      for(const side of [-1,1]){
        c.save(); c.translate(x,y-stemH); c.rotate(side*0.5);
        const s = healthy?1:0.55;
        c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(side*w*0.045*s,-h*0.035*s,side*w*0.08*s,0); c.quadraticCurveTo(side*w*0.045*s,h*0.012*s,0,0); c.fill(); c.stroke();
        c.restore();
      }
    }
    return Math.round(effGrowth*20);
  }

  function draw(){
    if(currentSim!=='g5bio1n5' || currentTab!==0){
      cancelAnimationFrame(animFrame);
      if(S.autoTimer){ clearInterval(S.autoTimer); S.autoTimer=null; }
      return;
    }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g5pBg(dark); c.fillRect(0,0,w,h);
    g5Title(c,w,h,dark,'نشاط ٥-١ · النبات والضوء');

    if(S.animating){
      S.dayT += 0.012;
      if(S.dayT>=1){
        S.animating=false; S.day = Math.min(MAXDAY, S.day+1);
        if(S.day>=MAXDAY){ S.stage='result'; if(S.autoTimer){ clearInterval(S.autoTimer); S.autoTimer=null; } }
        controls(renderControls());
      }
    }

    const growth = S.stage==='ready' ? 0 : Math.min(1, S.day/MAXDAY + (S.animating? S.dayT/MAXDAY:0));

    c.save();
    c.fillStyle = dark?'rgba(253,224,71,0.08)':'rgba(253,224,71,0.18)';
    c.fillRect(w*0.08,h*0.18,w*0.34,h*0.5);
    c.strokeStyle=g5pMut(dark); c.lineWidth=2; c.strokeRect(w*0.08,h*0.18,w*0.34,h*0.5);
    c.fillStyle='#FDE047'; c.beginPath(); c.arc(w*0.35,h*0.24,w*0.025,0,Math.PI*2); c.fill();
    c.restore();
    c.fillStyle=g5pMut(dark); c.font=`${Math.round(h*0.017)}px Tajawal`; c.textAlign='center';
    c.fillText('نبات (أ) — مكان مشمس', w*0.25, h*0.72);
    const cmA = drawPlant(c, w*0.25, h*0.66, w, h, growth, true);

    c.save();
    c.fillStyle = dark?'rgba(0,0,0,0.3)':'rgba(60,50,70,0.15)';
    c.fillRect(w*0.58,h*0.18,w*0.34,h*0.5);
    c.strokeStyle=g5pMut(dark); c.lineWidth=2; c.strokeRect(w*0.58,h*0.18,w*0.34,h*0.5);
    c.restore();
    c.fillStyle=g5pMut(dark); c.font=`${Math.round(h*0.017)}px Tajawal`; c.textAlign='center';
    c.fillText('نبات (ب) — خزانة مظلمة', w*0.75, h*0.72);
    const cmB = drawPlant(c, w*0.75, h*0.66, w, h, growth, false);

    if(S.stage==='wait' || S.stage==='result'){
      c.fillStyle=g5pAccent(dark); c.font=`bold ${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
      c.fillText(`الأسبوع ${S.day}`, w/2, h*0.9);
      c.fillStyle='#16A34A'; c.font=`bold ${Math.round(h*0.018)}px Tajawal`;
      c.fillText(cmA+' سم', w*0.25, h*0.78);
      c.fillStyle= (cmB>0)?'#CA8A04':'#9CA3AF'; c.font=`bold ${Math.round(h*0.018)}px Tajawal`;
      c.fillText(cmB+' سم', w*0.75, h*0.78);
      if(S.stage==='result'){
        c.fillStyle='#16A34A'; c.font=`${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
        c.fillText('👑 الأطول', w*0.25, h*0.16);
      }
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}
