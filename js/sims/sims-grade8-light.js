// ══════════════════════════════════════════════════════════
// الصف الثامن — الوحدة الثالثة: الضوء (كتاب الصف الثامن ص٥٥-٥٩)
// نشاط ١-٣ · كيف ينتقل الضوء؟
// نشاط ٢-٣ · كيف تتكوّن الظلال؟ (شامل: المواد الشفافة/المعتمة/العاكسة)
// نشاط ٣-٣ · كيف تتكوّن الانعكاسات؟
// ══════════════════════════════════════════════════════════

function g8lGp(cv, e){
  const r = cv.getBoundingClientRect();
  const t = e.touches ? e.touches[0] : e;
  return { x: (t.clientX - r.left) * (cv.width / r.width), y: (t.clientY - r.top) * (cv.height / r.height) };
}
function g8lHeader(c,w,h,dark,title){
  c.save();
  c.fillStyle = dark ? 'rgba(24,14,34,0.92)' : 'rgba(251,245,238,0.92)';
  c.fillRect(0,0,w,h*0.12);
  c.fillStyle=g8cTxt(dark); c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
  c.fillText(title, w/2, h*0.06);
  c.restore();
}

/* ══════════════════════════════════════════════════════════
   تاب ١: هل يسير الضوء في خط مستقيم؟ (ص٥٥)
   ══════════════════════════════════════════════════════════ */
function simG8Bio3N1a(){
  cancelAnimationFrame(animFrame);
  // مواضع الثقوب الابتدائية — واحد منها خارج الخط المستقيم عمداً ليكتشف الطالب أنّ عليه ترتيبها
  const CARD_X = [0.36, 0.56, 0.76];
  simState = {
    stage:'align',              // align → aligned → beaming → result → twist → twistAns → done
    holes: [ {x:CARD_X[0], y:0.36}, {x:CARD_X[1], y:0.58}, {x:CARD_X[2], y:0.44} ],
    dragI:null, beamT:0, twistSel:null,
  };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const CANDLE = {x:0.1, y:0.5}, EYE = {x:0.92,y:0.5};

  function isAligned(){
    // الثقوب على خط مستقيم إذا كانت جميعها قريبة من الخط الواصل بين الشمعة والعين عند نفس x
    return S.holes.every(hpt=> Math.abs(hpt.y - 0.5) < 0.035);
  }

  function renderControls(){
    if(S.stage==='align'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🕯️ هل يسير الضوء في خط مستقيم؟</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:12px">حرّكي البطاقات الثلاث بإصبعك حتى تتراصف ثقوبها على خط واحد بين الشمعة والعين — استخدمي الخيط المشدود كدليل لك.</div>
        <div style="font-size:12px;color:var(--text-secondary);background:var(--bg-card2);border-radius:8px;padding:10px">💡 تنبّئي: هل سيمرّ الضوء لو بقي أحد الثقوب خارج الخط؟</div>
        ${isAligned() ? `<button class="ctrl-btn play" style="margin-top:12px" onclick="window._g8lAligned()">✅ الثقوب متراصفة! تابعي</button>`:''}
      `;
    }
    if(S.stage==='aligned'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">👀 والآن...</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:12px">أحسنتِ! الثقوب الآن على خط مستقيم واحد.</div>
        <button class="ctrl-btn play" onclick="window._g8lBeam()">💡 شاهدي كيف يمرّ الضوء</button>`;
    }
    if(S.stage==='beaming'){
      return `<div class="ctrl-section"><div class="ctrl-label">⏳ ...</div></div><div style="font-size:12.5px;color:var(--text-secondary)">راقبي مسار الضوء من الشمعة إلى العين.</div>`;
    }
    if(S.stage==='result'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🎉 وصل الضوء!</div></div>
        <div style="padding:13px;background:var(--bg-card2);border-radius:10px;font-size:13.5px;line-height:1.9;color:var(--text-secondary);margin-bottom:12px">
          <strong style="color:#D4901A">ينتقل الضوء في خطوط مستقيمة.</strong><br>مرّ ضوء لهب الشمعة عبر الثقوب الثلاثة واحداً بعد الآخر لأنّها كانت على خط مستقيم واحد.
        </div>
        <button class="ctrl-btn play" onclick="window._g8lTwist()">➡ ماذا لو حرّكنا ثقباً؟</button>`;
    }
    if(S.stage==='twist' || S.stage==='twistAns'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🤔 توقّعي</div></div>
        <div style="font-size:13.5px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px">حرّكنا أحد الثقوب قليلاً خارج الخط تلقائياً. هل سيصل الضوء إلى العين الآن؟</div>
        ${S.stage==='twist' ? `
        <div style="display:flex;gap:8px">
          <button onclick="window._g8lTwistAns(true)" style="flex:1;padding:12px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">نعم</button>
          <button onclick="window._g8lTwistAns(false)" style="flex:1;padding:12px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">لا</button>
        </div>` : `
        <div style="padding:12px;background:${S.twistSel===false?'rgba(74,222,128,0.15)':'rgba(239,68,68,0.12)'};border-radius:9px;font-size:13px;line-height:1.8;color:var(--text-secondary)">
          ${S.twistSel===false?'✅ صحيح!':'💡 راقبي الرسم:'} عندما لا تكون الثقوب على خط مستقيم واحد، لا يستطيع الضوء المرور عبرها جميعاً للوصول إلى العين — لأنّ الضوء لا ينحني حول الزوايا.
        </div>
        <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g8lRestart()">↺ أعد النشاط</button>`}
      `;
    }
  }
  controls(renderControls());

  window._g8lAligned = function(){ _g8pPlayClick(); S.stage='aligned'; controls(renderControls()); };
  window._g8lBeam = function(){ _g8pPlayClick(); S.stage='beaming'; S.beamT=0; };
  window._g8lTwist = function(){
    _g8pPlayClick();
    S.stage='twist';
    // إزاحة بسيطة تلقائية لثقب واحد خارج الخط
    S.holes[1].y = 0.5 - 0.12;
    controls(renderControls());
  };
  window._g8lTwistAns = function(v){ _g8pPlayClick(); S.twistSel=v; S.stage='twistAns'; S.beamT=0; controls(renderControls()); };
  window._g8lRestart = function(){
    S.stage='align'; S.holes=[ {x:CARD_X[0],y:0.36}, {x:CARD_X[1],y:0.58}, {x:CARD_X[2],y:0.44} ]; S.beamT=0; S.twistSel=null;
    controls(renderControls());
  };

  function onDown(e){
    if(S.stage!=='align') return;
    const p=g8lGp(cv,e), w=cv.width, h=cv.height;
    S.holes.forEach((hpt,i)=>{ if(Math.hypot(p.x-hpt.x*w,p.y-hpt.y*h) < w*0.045) S.dragI=i; });
  }
  function onMove(e){
    if(S.dragI===null) return;
    e.preventDefault && e.preventDefault();
    const p=g8lGp(cv,e), w=cv.width, h=cv.height;
    S.holes[S.dragI].y = Math.max(0.2, Math.min(0.8, p.y/h));
    if(isAligned()) controls(renderControls());
  }
  function onUp(){ S.dragI=null; }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;
  cv.onclick=null;

  function draw(){
    if(currentSim!=='g8bio3n1' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g8cBg(dark); c.fillRect(0,0,w,h);

    // خيط مشدود إرشادي بين الشمعة والعين (يظهر فقط في مرحلة الترتيب)
    if(S.stage==='align'){
      c.save(); c.strokeStyle=g8cMut(dark); c.globalAlpha=0.5; c.setLineDash([4,4]); c.lineWidth=1.5;
      c.beginPath(); c.moveTo(w*CANDLE.x,h*0.5); c.lineTo(w*EYE.x,h*0.5); c.stroke();
      c.restore();
    }

    // الشمعة
    c.save(); c.translate(w*CANDLE.x,h*0.5);
    c.fillStyle='#E8DCC8'; c.fillRect(-w*0.012,-h*0.02,w*0.024,h*0.09);
    c.fillStyle='#F59E0B'; c.beginPath(); c.moveTo(0,-h*0.02); c.quadraticCurveTo(w*0.018,-h*0.06,0,-h*0.09); c.quadraticCurveTo(-w*0.018,-h*0.06,0,-h*0.02); c.fill();
    c.fillStyle='#EF4444'; c.beginPath(); c.arc(0,-h*0.065,w*0.008,0,Math.PI*2); c.fill();
    c.restore();

    // العين
    c.save(); c.translate(w*EYE.x,h*0.5);
    c.fillStyle=dark?'#2A1F1A':'#fff'; c.strokeStyle=g8cMut(dark); c.lineWidth=2;
    c.beginPath(); c.ellipse(0,0,w*0.035,h*0.026,0,0,Math.PI*2); c.fill(); c.stroke();
    c.fillStyle='#3B2A1A'; c.beginPath(); c.arc(0,0,w*0.014,0,Math.PI*2); c.fill();
    c.restore();
    c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
    c.fillText('عين', w*EYE.x, h*0.58);

    // البطاقات والثقوب
    S.holes.forEach((hpt,i)=>{
      const x=w*hpt.x, y=h*hpt.y;
      c.save();
      c.fillStyle=dark?'#3A2A1A':'#F4E9DA'; c.strokeStyle=g8cMut(dark); c.lineWidth=2;
      c.fillRect(x-w*0.014,y-h*0.14,w*0.028,h*0.28);
      c.strokeRect(x-w*0.014,y-h*0.14,w*0.028,h*0.28);
      c.fillStyle = S.dragI===i ? g8cAccent(dark) : (dark?'#180E22':'#FBF5EE');
      c.beginPath(); c.arc(x,y,w*0.009,0,Math.PI*2); c.fill();
      c.restore();
    });

    // الشعاع المتحرّك
    if(S.stage==='beaming' || (S.stage==='twistAns' && S.beamT!==undefined)){
      S.beamT += 0.018;
      const pts = [ {x:CANDLE.x,y:0.5}, ...S.holes.map(hh=>({x:hh.x,y:hh.y})), {x:EYE.x,y:0.5} ];
      // نتحقق من محاذاة كل جزء قبل رسمه: إن انحرف أحد الثقوب، يتوقف الشعاع عنده
      let blocked = -1;
      for(let i=1;i<pts.length-1;i++){ if(Math.abs(pts[i].y-0.5) > 0.035){ blocked=i; break; } }
      const totalSegs = pts.length-1;
      const segProg = S.beamT * totalSegs;
      c.save(); c.strokeStyle='#FBBF24'; c.lineWidth=Math.max(2,w*0.006); c.lineCap='round';
      c.shadowColor='#FBBF24'; c.shadowBlur=8;
      for(let i=0;i<totalSegs;i++){
        if(blocked>=0 && i>=blocked) break;
        const segT = Math.max(0,Math.min(1, segProg-i));
        if(segT<=0) break;
        const p0=pts[i], p1=pts[i+1];
        const ex = w*(p0.x+(p1.x-p0.x)*segT), ey = h*(p0.y+(p1.y-p0.y)*segT);
        c.beginPath(); c.moveTo(w*p0.x,h*p0.y); c.lineTo(ex,ey); c.stroke();
      }
      c.restore();
      if(blocked>=0){
        if(S.beamT>0.4 && S.stage!=='twistAns'){}
        if(segProg >= blocked){
          c.save(); c.fillStyle='#DC2626'; c.font=`bold ${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
          c.fillText('✋ انقطع مسار الضوء هنا', w*pts[blocked].x, h*pts[blocked].y - h*0.16);
          c.restore();
        }
      } else if(S.beamT>=1 && S.stage==='beaming'){
        S.stage='result'; controls(renderControls());
      }
    } else if(S.stage==='align' || S.stage==='aligned'){
      // خط توضيحي خفيف قبل التشغيل، فقط بين مواضع الثقوب الحالية دون أن يكون شعاعاً فعلياً
    }

    if(S.stage==='result' || (S.stage==='twistAns')){
      c.save(); c.strokeStyle=g8cMut(dark); c.globalAlpha=0.4; c.setLineDash([3,3]); c.lineWidth=1.2;
      const pts = [ {x:CANDLE.x,y:0.5}, ...S.holes.map(hh=>({x:hh.x,y:hh.y})), {x:EYE.x,y:0.5} ];
      c.beginPath(); pts.forEach((p,i)=> i===0?c.moveTo(w*p.x,h*p.y):c.lineTo(w*p.x,h*p.y)); c.stroke();
      c.restore();
    }

    g8lHeader(c,w,h,dark,'نشاط ١-٣ · كيف ينتقل الضوء؟');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   تاب ٢: كيف نرى الأجسام؟ (مضيء / غير مضيء — ص٥٥)
   ══════════════════════════════════════════════════════════ */
function simG8Bio3N1b(){
  cancelAnimationFrame(animFrame);
  simState = { lampOn:true, revealed:false, qSel:null };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    return `
      <div class="ctrl-section"><div class="ctrl-label">📖 كيف نرى الأجسام؟</div></div>
      <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:12px">يقرأ الشخص كتاباً بجانب مصباح. راقبي كيف يصل الضوء إلى عينه.</div>
      ${!S.revealed ? `<button class="ctrl-btn play" onclick="window._g8lRead()">💡 شاهدي كيف ينتقل الضوء</button>` : `
      <div style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:12px">
        💡 <strong>المصباح مضيء (Luminous)</strong> — يصدر الضوء بنفسه.<br>
        📖 <strong>الكتاب غير مضيء (Non-Luminous)</strong> — لا يصدر ضوءاً، لكنّه يعكس الضوء الساقط عليه من المصباح، فنراه عندما يصل هذا الضوء المنعكس إلى أعيننا.
      </div>
      <button class="ctrl-btn ${S.lampOn?'reset':'play'}" onclick="window._g8lToggleLamp()">${S.lampOn?'🔌 ماذا يحدث إذا أطفأنا المصباح؟':'💡 أعيدي إشعال المصباح'}</button>
      ${!S.lampOn ? `
      <div style="margin-top:12px">
        <div style="font-size:13px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:12px;margin-bottom:10px">لماذا لم نعد نرى الكتاب بوضوح؟</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${['لأنّ الكتاب اختفى','لأنّه لا يوجد ضوء منعكس عن الكتاب يصل إلى العين','لأنّ العين توقّفت عن العمل'].map((o,i)=>`
          <button onclick="window._g8lQAns(${i})" style="padding:10px;border-radius:9px;border:2px solid ${S.qSel===null?'#ddd':(i===1?'#22C55E':(i===S.qSel?'#DC2626':'#ddd'))};background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:12.5px">${o}</button>`).join('')}
        </div>
        ${S.qSel!==null?`<div style="margin-top:8px;font-size:12.5px;color:var(--text-secondary)">${S.qSel===1?'✅ صحيح!':'💡'} تعتمد رؤية الأجسام غير المضيئة على وصول الضوء المنعكس عنها إلى العين.</div>`:''}
      </div>`:''}
      `}
    `;
  }
  controls(renderControls());
  window._g8lRead = function(){ _g8pPlayClick(); S.revealed=true; controls(renderControls()); };
  window._g8lToggleLamp = function(){ _g8pPlayClick(); S.lampOn=!S.lampOn; if(S.lampOn) S.qSel=null; controls(renderControls()); };
  window._g8lQAns = function(i){ _g8pPlayClick(); S.qSel=i; if(i===1) _g8pPlayDrop(); controls(renderControls()); };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null;
  cv.onclick=null;

  function draw(){
    if(currentSim!=='g8bio3n1' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g8cBg(dark); c.fillRect(0,0,w,h);

    const lampX=w*0.16, lampY=h*0.32;
    const chairX=w*0.62, seatY=h*0.66;              // مستوى مقعد الكرسي
    const torsoW=w*0.075, torsoH=h*0.16;
    const torsoCX = chairX-w*0.01, torsoBottomY = seatY-h*0.01, torsoTopY = torsoBottomY-torsoH;
    const headR = w*0.032;
    const headCX = torsoCX+w*0.005, headCY = torsoTopY-headR-h*0.008;
    const bookX = torsoCX-w*0.09, bookY = headCY+h*0.09;   // الكتاب ممسوك أسفل الوجه، باتّجاه المصباح
    const eyeX = headCX-headR*0.35, eyeY = headCY-headR*0.05;

    // مصباح بجانب القارئ
    c.save(); c.translate(lampX,lampY);
    c.strokeStyle=g8cMut(dark); c.lineWidth=Math.max(3,w*0.008);
    c.beginPath(); c.moveTo(0,h*0.22); c.lineTo(0,0); c.stroke();
    c.fillStyle='#6B7280'; c.beginPath(); c.ellipse(0,h*0.23,w*0.035,h*0.012,0,0,Math.PI*2); c.fill();
    c.fillStyle= S.lampOn? '#FDE047' : '#9CA3AF'; c.strokeStyle=g8cMut(dark); c.lineWidth=2;
    c.beginPath(); c.moveTo(-w*0.032,0); c.lineTo(w*0.032,0); c.lineTo(w*0.017,-h*0.055); c.lineTo(-w*0.017,-h*0.055); c.closePath(); c.fill(); c.stroke();
    if(S.lampOn){ c.save(); c.globalAlpha=0.45+Math.sin(Date.now()/200)*0.15; c.fillStyle='#FDE047'; c.beginPath(); c.arc(0,-h*0.022,w*0.055,0,Math.PI*2); c.fill(); c.restore(); }
    c.restore();
    c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
    c.fillText(S.lampOn?'💡 مصدر مضيء':'مصباح مطفأ', lampX, lampY+h*0.32);

    // كرسي بسيط (يُرسم أولاً، خلف القارئ)
    c.save(); c.strokeStyle=g8cMut(dark); c.lineWidth=Math.max(3,w*0.008); c.lineCap='round';
    c.beginPath(); c.moveTo(chairX-w*0.085,seatY); c.lineTo(chairX-w*0.085,seatY-h*0.22); c.stroke(); // ظهر الكرسي
    c.beginPath(); c.moveTo(chairX-w*0.085,seatY); c.lineTo(chairX+w*0.09,seatY); c.stroke(); // مقعد
    c.beginPath(); c.moveTo(chairX-w*0.07,seatY); c.lineTo(chairX-w*0.07,seatY+h*0.14); c.stroke(); // أرجل
    c.beginPath(); c.moveTo(chairX+w*0.075,seatY); c.lineTo(chairX+w*0.075,seatY+h*0.14); c.stroke();
    c.restore();

    // جذع القارئ (كتلة بسيطة منتظمة الحجم فوق المقعد مباشرة)
    c.save();
    c.fillStyle='#7C9CBF'; c.strokeStyle='#3E5570'; c.lineWidth=2;
    c.beginPath(); c.roundRect(torsoCX-torsoW/2, torsoTopY, torsoW, torsoH, torsoW*0.35);
    c.fill(); c.stroke();
    c.restore();

    // الرأس (فوق الجذع مباشرة، بلا فجوة)
    c.save();
    c.fillStyle='#E8C9A0'; c.strokeStyle='#B8946B'; c.lineWidth=2;
    c.beginPath(); c.arc(headCX,headCY,headR,0,Math.PI*2); c.fill(); c.stroke();
    // شعر بسيط
    c.fillStyle='#4A3728';
    c.beginPath(); c.arc(headCX,headCY-headR*0.12,headR*1.05,Math.PI*0.95,Math.PI*1.85); c.fill();
    // عين باتّجاه الكتاب
    c.fillStyle='#3B2A1A'; c.beginPath(); c.arc(eyeX,eyeY,w*0.005,0,Math.PI*2); c.fill();
    c.restore();

    // الكتاب المفتوح — صفحتان متماثلتان حول الكعب، أسفل الوجه مباشرة
    c.save(); c.translate(bookX,bookY); c.rotate(-0.06);
    c.fillStyle='#FEFCF6'; c.strokeStyle='#B8946B'; c.lineWidth=2;
    c.beginPath(); c.moveTo(0,-h*0.004); c.quadraticCurveTo(-w*0.045,-h*0.024,-w*0.068,-h*0.005); c.lineTo(-w*0.068,h*0.036); c.quadraticCurveTo(-w*0.045,h*0.016,0,h*0.036); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(0,-h*0.004); c.quadraticCurveTo(w*0.045,-h*0.024,w*0.068,-h*0.005); c.lineTo(w*0.068,h*0.036); c.quadraticCurveTo(w*0.045,h*0.016,0,h*0.036); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle='#D8CBB0'; c.lineWidth=1;
    for(let i=0;i<3;i++){
      const yy=h*(0.004+i*0.011);
      c.beginPath(); c.moveTo(-w*0.055,yy); c.lineTo(-w*0.011,yy+h*0.0025); c.stroke();
      c.beginPath(); c.moveTo(w*0.011,yy+h*0.0025); c.lineTo(w*0.055,yy); c.stroke();
    }
    c.restore();
    c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
    c.fillText('📖 غير مضيء', bookX, bookY+h*0.07);

    if(S.revealed && S.lampOn){
      // ضوء من المصباح إلى الكتاب
      c.save(); c.strokeStyle='#FDE047'; c.lineWidth=Math.max(1.5,w*0.004); c.globalAlpha=0.85;
      c.beginPath(); c.moveTo(lampX,lampY-h*0.03); c.lineTo(bookX-w*0.015,bookY-h*0.008); c.stroke();
      c.restore();
      // ضوء منعكس من الكتاب إلى عين القارئ
      c.save(); c.strokeStyle='#60A5FA'; c.lineWidth=Math.max(1.5,w*0.004); c.globalAlpha=0.85;
      c.beginPath(); c.moveTo(bookX,bookY-h*0.008); c.lineTo(eyeX,eyeY); c.stroke();
      c.restore();
    }

    if(S.revealed && !S.lampOn){
      c.save(); c.fillStyle='#DC2626'; c.font=`${Math.round(h*0.017)}px Tajawal`; c.textAlign='center';
      c.fillText('لا يوجد ضوء كافٍ ليصل إلى العين', w*0.5, h*0.9);
      c.restore();
    }

    g8lHeader(c,w,h,dark,'نشاط ١-٣ · كيف نرى الأجسام؟');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   تاب ١ (نشاط ٢-٣): المواد الشفّافة والمعتمة والعاكسة (ص٥٦)
   ══════════════════════════════════════════════════════════ */
function simG8Bio3N2a(){
  cancelAnimationFrame(animFrame);
  const PARTS = [
    { id:'windshield', label:'الزجاج الأمامي', type:'transparent', card:'🔵 مادة شفّافة', info:'الزجاج الأمامي شفّاف ينفذ الضوء من خلاله (Transmitted) — لذلك نستطيع الرؤية عبره.', xFrac:0.75, yFrac:0.32 },
    { id:'metal',       label:'المعدن اللامع',  type:'reflective',  card:'🪞 سطح عاكس',   info:'المعدن اللامع في مقدّمة السيارة يعكس الضوء الساقط عليه (Reflected).', xFrac:0.9, yFrac:0.58 },
    { id:'plastic',     label:'البلاستيك الأسود (المرآة الجانبية)', type:'opaque', card:'⚫ مادة معتمة', info:'البلاستيك الأسود المعتم يمتصّ الضوء الساقط عليه ولا يسمح له بالمرور من خلاله (Opaque).', xFrac:0.615, yFrac:0.42 },
  ];
  simState = { curId:null, revealed:{}, beamT:0 };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    if(!S.curId){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🚗 ماذا يفعل الضوء عندما يسقط على مواد مختلفة؟</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:12px">اضغطي على أحد أجزاء السيارة، ثم أطلقي الضوء عليه وراقبي ماذا يحدث.</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${PARTS.map(p=>`<button onclick="window._g8lPart('${p.id}')" style="padding:11px;border-radius:9px;border:2px solid ${S.revealed[p.id]?'#22C55E':'#ddd'};background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;display:flex;justify-content:space-between"><span>${p.label}</span><span>${S.revealed[p.id]?'✅':'👆'}</span></button>`).join('')}
        </div>
      `;
    }
    const p = PARTS.find(x=>x.id===S.curId);
    return `
      <div class="ctrl-section"><div class="ctrl-label">${p.label}</div></div>
      ${!S.revealed[p.id] ? `<button class="ctrl-btn play" onclick="window._g8lFire()">🔦 أطلقي الضوء</button>` : `
      <div style="font-size:14px;font-weight:800;color:#D4901A;margin-bottom:8px">${p.card}</div>
      <div style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:12px;margin-bottom:12px">${p.info}</div>
      <button class="ctrl-btn reset" onclick="window._g8lBack()">↺ جرّبي جزءاً آخر</button>`}
    `;
  }
  controls(renderControls());
  window._g8lPart = function(id){ _g8pPlayClick(); S.curId=id; S.beamT=0; controls(renderControls()); };
  window._g8lFire = function(){ _g8pPlayClick(); S.beamT=0.0001; };
  window._g8lBack = function(){ _g8pPlayClick(); S.curId=null; controls(renderControls()); };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null;
  cv.onclick=null;

  function drawCar(c,w,h,dark){
    c.save();
    // نستخدم عرض السيارة كوحدة قياس موحّدة للأبعاد كلّها (أفقياً ورأسياً)
    // لضمان تناسب الشكل بصرياً بغضّ النظر عن أبعاد الكانفس
    const bx=w*0.2, bw=w*0.6, S=bw;
    const baseY=h*0.68;                 // خط الأرض
    const groundY=baseY, beltY=baseY-S*0.24, roofY=baseY-S*0.46;

    // ظل خفيف تحت السيارة
    c.save(); c.fillStyle=dark?'rgba(0,0,0,0.35)':'rgba(0,0,0,0.15)';
    c.beginPath(); c.ellipse(bx+bw*0.5, groundY+S*0.05, bw*0.48, S*0.035, 0,0,Math.PI*2); c.fill(); c.restore();

    // هيكل السيارة (بروفايل جانبي واقعي مبسّط)
    c.beginPath();
    c.moveTo(bx, groundY);
    c.lineTo(bx, beltY+S*0.03);
    c.quadraticCurveTo(bx, beltY-S*0.02, bx+bw*0.1, beltY-S*0.02);
    c.lineTo(bx+bw*0.19, beltY-S*0.02);
    c.quadraticCurveTo(bx+bw*0.26, roofY+S*0.01, bx+bw*0.37, roofY);
    c.lineTo(bx+bw*0.68, roofY);
    c.quadraticCurveTo(bx+bw*0.79, roofY+S*0.01, bx+bw*0.85, beltY-S*0.02);
    c.lineTo(bx+bw*0.92, beltY-S*0.02);
    c.quadraticCurveTo(bx+bw, beltY-S*0.02, bx+bw, beltY+S*0.03);
    c.lineTo(bx+bw, groundY);
    c.closePath();
    const grad = c.createLinearGradient(0,roofY,0,groundY);
    grad.addColorStop(0,'#EF4444'); grad.addColorStop(1,'#B91C1C');
    c.fillStyle=grad; c.strokeStyle='#7F1D1D'; c.lineWidth=2.5; c.lineJoin='round';
    c.fill(); c.stroke();

    // خط لمعان جانبي
    c.save(); c.strokeStyle='rgba(255,255,255,0.35)'; c.lineWidth=2;
    c.beginPath(); c.moveTo(bx+bw*0.06, beltY+S*0.06); c.lineTo(bx+bw*0.94, beltY+S*0.06); c.stroke();
    c.restore();

    // نوافذ (زجاج أمامي، جانبي، خلفي) بإطار غامق موحّد
    c.save();
    c.fillStyle= dark? 'rgba(147,197,253,0.5)':'rgba(191,219,254,0.85)'; c.strokeStyle='#1E293B'; c.lineWidth=2.5;
    c.beginPath();
    c.moveTo(bx+bw*0.205, beltY-S*0.03);
    c.quadraticCurveTo(bx+bw*0.27, roofY+S*0.014, bx+bw*0.375, roofY+S*0.01);
    c.lineTo(bx+bw*0.66, roofY+S*0.01);
    c.quadraticCurveTo(bx+bw*0.77, roofY+S*0.014, bx+bw*0.835, beltY-S*0.03);
    c.closePath(); c.fill(); c.stroke();
    // عمود منتصف (بين الزجاج الأمامي والخلفي)
    c.beginPath(); c.moveTo(bx+bw*0.5, roofY+S*0.011); c.lineTo(bx+bw*0.5, beltY-S*0.03); c.stroke();
    c.restore();

    // مصدّ أمامي وخلفي (بامبر)
    c.fillStyle='#374151';
    c.beginPath(); c.roundRect(bx-S*0.004, groundY-S*0.02, S*0.014, S*0.034, 3); c.fill();
    c.beginPath(); c.roundRect(bx+bw-S*0.01, groundY-S*0.02, S*0.014, S*0.034, 3); c.fill();

    // مقبض الباب
    c.fillStyle='#7F1D1D'; c.beginPath(); c.roundRect(bx+bw*0.56, beltY+S*0.013, S*0.024, S*0.008, 3); c.fill();

    // مصباح أمامي
    c.fillStyle='#FEF9C3'; c.strokeStyle='#CA8A04'; c.lineWidth=1.5;
    c.beginPath(); c.ellipse(bx+bw*0.955, beltY+S*0.013, S*0.012, S*0.014, 0,0,Math.PI*2); c.fill(); c.stroke();

    // أقواس العجلات (سوداء) + عجلات بجنوط — نصف قطر موحّد النسبة مع عرض السيارة
    const wheelR = S*0.075;
    [0.24, 0.76].forEach(fx=>{
      const wx=bx+bw*fx;
      c.fillStyle='#111827';
      c.beginPath(); c.arc(wx,groundY,wheelR,Math.PI,0); c.fill();
      c.beginPath(); c.arc(wx,groundY,wheelR*0.86,0,Math.PI*2); c.fill();
      c.fillStyle='#9CA3AF';
      c.beginPath(); c.arc(wx,groundY,wheelR*0.42,0,Math.PI*2); c.fill();
      c.fillStyle='#4B5563';
      c.beginPath(); c.arc(wx,groundY,wheelR*0.16,0,Math.PI*2); c.fill();
    });

    c.restore();
    return {bx,bw,groundY,beltY,roofY};
  }

  function draw(){
    if(currentSim!=='g8bio3n2' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g8cBg(dark); c.fillRect(0,0,w,h);

    const {bx,bw,groundY,beltY,roofY} = drawCar(c,w,h,dark);

    // مصدر ضوء (مصباح يدوي) قادم من أعلى اليسار
    const srcX=w*0.06, srcY=h*0.16;
    c.save(); c.fillStyle='#4B5563'; c.strokeStyle=g8cMut(dark); c.lineWidth=2;
    c.beginPath(); c.roundRect(srcX-w*0.028,srcY-h*0.022,w*0.056,h*0.044,4); c.fill(); c.stroke();
    c.fillStyle='#FDE047'; c.beginPath(); c.arc(srcX+w*0.03,srcY,w*0.012,0,Math.PI*2); c.fill();
    c.restore();
    c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
    c.fillText('🔦 مصباح', srcX, srcY-h*0.04);

    PARTS.forEach(p=>{
      const px=bx+bw*p.xFrac, py=roofY+(groundY-roofY)*p.yFrac;
      p._px=px; p._py=py;
      c.save();
      if(p.id==='metal'){
        // بقعة لمعان معدني إضافية على غطاء المحرك لتوضيح السطح العاكس
        c.fillStyle='rgba(255,255,255,0.55)'; c.strokeStyle='rgba(255,255,255,0.8)'; c.lineWidth=1.5;
        c.beginPath(); c.ellipse(px,py,w*0.045,h*0.014,-0.15,0,Math.PI*2); c.fill(); c.stroke();
      } else if(p.id==='plastic'){
        // مرآة جانبية سوداء صغيرة بارزة من جسم السيارة
        c.fillStyle='#111827'; c.strokeStyle='#000'; c.lineWidth=2;
        c.beginPath(); c.ellipse(px,py,w*0.028,h*0.02,0.2,0,Math.PI*2); c.fill(); c.stroke();
        c.fillStyle='#1F2937'; c.beginPath(); c.roundRect(px-w*0.01,py+h*0.012,w*0.02,h*0.012,2); c.fill();
      }
      if(S.curId===p.id){ c.strokeStyle=g8cAccent(dark); c.lineWidth=3; c.setLineDash([5,4]);
        c.beginPath(); c.arc(px,py,w*0.06,0,Math.PI*2); c.stroke(); c.setLineDash([]); }
      c.restore();
    });

    if(S.curId){
      const p = PARTS.find(x=>x.id===S.curId);
      const px=p._px, py=p._py;
      if(S.beamT>=1 && !S.revealed[p.id]){ S.revealed[p.id]=true; _g8pPlayDrop(); controls(renderControls()); }
      const t = Math.min(1,S.beamT);
      if(t>0){
        const hitX = srcX+(px-srcX)*Math.min(1,t*1.6), hitY = srcY+(py-srcY)*Math.min(1,t*1.6);
        c.save(); c.strokeStyle='#FBBF24'; c.lineWidth=Math.max(2,w*0.006); c.shadowColor='#FBBF24'; c.shadowBlur=8;
        c.beginPath(); c.moveTo(srcX,srcY); c.lineTo(hitX,hitY); c.stroke(); c.restore();

        if(t>0.65){
          if(p.type==='transparent'){
            // يستمر بنفس الاتجاه عبر الزجاج
            const exitX = px+(px-srcX)*0.35, exitY = py+(py-srcY)*0.35;
            c.save(); c.strokeStyle='#60A5FA'; c.lineWidth=Math.max(2,w*0.006); c.globalAlpha=Math.min(1,(t-0.65)/0.35);
            c.beginPath(); c.moveTo(px,py); c.lineTo(exitX,exitY); c.stroke(); c.restore();
          } else if(p.type==='reflective'){
            // ينعكس بزاوية للأعلى
            const reflX = px + w*0.13, reflY = py - h*0.15;
            c.save(); c.strokeStyle='#93C5FD'; c.lineWidth=Math.max(2,w*0.006); c.globalAlpha=Math.min(1,(t-0.65)/0.35);
            c.beginPath(); c.moveTo(px,py); c.lineTo(reflX,reflY); c.stroke(); c.restore();
          } else {
            // يُمتص: توهّج خفيف عند نقطة السقوط فقط
            c.save(); c.globalAlpha=Math.min(0.6,(t-0.65)/0.35); c.fillStyle='#F59E0B';
            c.beginPath(); c.arc(px,py,w*0.02,0,Math.PI*2); c.fill(); c.restore();
          }
        }
      }
      if(S.revealed[p.id]){
        c.save();
        c.fillStyle=g8cAccent(dark); c.font=`bold ${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
        c.fillText(p.card, px, py - h*0.1);
        c.restore();
      }
    }

    g8lHeader(c,w,h,dark,'نشاط ٢-٣ · المواد الشفّافة والمعتمة والعاكسة');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   تاب ٢ (نشاط ٢-٣): كيف يتكوّن الظلّ؟ (ص٥٧)
   ══════════════════════════════════════════════════════════ */
function simG8Bio3N2b(){
  cancelAnimationFrame(animFrame);
  simState = { stage:'intro', sunX:0.2, beamT:0, qSel:null };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const TREE = {x:0.6, y:0.68};

  function renderControls(){
    if(S.stage==='intro'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🌳 كيف يتكوّن الظلّ؟</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:12px">تحجب الشجرة (جسم معتم) بعض أشعّة الشمس. راقبي أين سيقع الظلّ.</div>
        <button class="ctrl-btn play" onclick="window._g8lSunRays()">☀️ أطلقي أشعّة الشمس</button>`;
    }
    if(S.stage==='beaming'){
      return `<div class="ctrl-section"><div class="ctrl-label">⏳ ...</div></div><div style="font-size:12.5px;color:var(--text-secondary)">راقبي الأشعّة وهي تصطدم بالشجرة.</div>`;
    }
    if(S.stage==='shadowed'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🌑 تكوّن الظلّ!</div></div>
        <div style="padding:13px;background:var(--bg-card2);border-radius:10px;font-size:13.5px;line-height:1.9;color:var(--text-secondary);margin-bottom:12px">
          <strong style="color:#D4901A">يتكوّن الظلّ عندما يحجب جسم معتم الضوء.</strong><br>الضوء ينتقل في خطوط مستقيمة ولا يمكنه الانحناء حول الشجرة، فتتكوّن منطقة مظلمة خلفها.
        </div>
        <button class="ctrl-btn play" onclick="window._g8lMoveSun()">➡ حرّكي الشمس وراقبي الظلّ</button>`;
    }
    if(S.stage==='moveSun'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">☀️ حرّكي الشمس</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:10px">اسحبي الشمس يميناً ويساراً في الرسم وراقبي كيف يتغيّر اتّجاه الظلّ وطوله.</div>
        <button class="ctrl-btn play" onclick="window._g8lConclude()">➡ ماذا نستنتج؟</button>`;
    }
    return `
      <div class="ctrl-section"><div class="ctrl-label">🎉 الاستنتاج</div></div>
      <div style="padding:13px;background:var(--bg-card2);border-radius:10px;font-size:13.5px;line-height:1.9;color:var(--text-secondary);margin-bottom:12px">
        يتكوّن الظلّ عندما يحجب جسم معتم الضوء المنبعث من مصدره. ويتغيّر موضع الظلّ وطوله وفقاً لتغيّر موضع مصدر الضوء (الشمس) في السماء.
      </div>
      <button class="ctrl-btn reset" onclick="window._g8lShadowRestart()">↺ أعد النشاط</button>`;
  }
  controls(renderControls());
  window._g8lSunRays = function(){ _g8pPlayClick(); S.stage='beaming'; S.beamT=0; };
  window._g8lMoveSun = function(){ _g8pPlayClick(); S.stage='moveSun'; controls(renderControls()); };
  window._g8lConclude = function(){ _g8pPlayClick(); S.stage='done'; controls(renderControls()); };
  window._g8lShadowRestart = function(){ S.stage='intro'; S.sunX=0.2; S.beamT=0; controls(renderControls()); };

  function onDown(e){ if(S.stage!=='moveSun') return; S.dragging=true; }
  function onMove(e){
    if(!S.dragging || S.stage!=='moveSun') return;
    e.preventDefault && e.preventDefault();
    const p=g8lGp(cv,e), w=cv.width;
    S.sunX = Math.max(0.08, Math.min(0.5, p.x/w));
  }
  function onUp(){ S.dragging=false; }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;
  cv.onclick=null;

  function drawTree(c,x,y,w,h){
    c.save(); c.translate(x,y);
    c.fillStyle='#92653F'; c.fillRect(-w*0.012,-h*0.12,w*0.024,h*0.12);
    c.fillStyle='#4D7C3A';
    c.beginPath(); c.arc(0,-h*0.16,w*0.06,0,Math.PI*2); c.fill();
    c.beginPath(); c.arc(-w*0.035,-h*0.13,w*0.045,0,Math.PI*2); c.fill();
    c.beginPath(); c.arc(w*0.035,-h*0.13,w*0.045,0,Math.PI*2); c.fill();
    c.restore();
  }

  function draw(){
    if(currentSim!=='g8bio3n2' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g8cBg(dark); c.fillRect(0,0,w,h);

    // أرض
    c.fillStyle=dark?'rgba(139,105,60,0.15)':'rgba(139,105,60,0.12)'; c.fillRect(0,h*0.72,w,h*0.16);

    const sunY=h*0.22, treeX=w*TREE.x, treeY=h*TREE.y;
    const sunPos = { x:w*S.sunX, y:sunY };

    // الشمس
    c.save(); c.fillStyle='#FBBF24'; c.beginPath(); c.arc(sunPos.x,sunPos.y,w*0.035,0,Math.PI*2); c.fill(); c.restore();
    c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
    c.fillText('☀️ اسحبيني', sunPos.x, sunPos.y-h*0.06);

    drawTree(c, treeX, treeY, w, h);

    const showRays = S.stage!=='intro';
    const treeTopY = treeY-h*0.22, treeBotY = treeY;
    // اتّجاه الظلّ: من الشجرة بعيداً عن الشمس أفقياً
    const sunDir = (treeX - sunPos.x);
    const shadowLen = w*0.22 * (1 + Math.abs(sunDir)/(w*0.5));
    const shadowDirX = sunDir>=0 ? 1 : -1;
    const shadowEndX = treeX + shadowDirX*shadowLen;

    if(showRays){
      if(S.stage==='beaming') S.beamT += 0.02;
      const t = S.stage==='beaming' ? Math.min(1,S.beamT) : 1;
      c.save(); c.strokeStyle='#FBBF24'; c.globalAlpha=0.8; c.lineWidth=Math.max(1.5,w*0.004);
      for(let i=-2;i<=2;i++){
        const targetX = treeX + i*w*0.03, targetY = treeBotY - h*0.02 + Math.abs(i)*h*0.01;
        // الشعاع الأوسط يصطدم بالشجرة، البقية تكمل خلفها لتوضيح المنطقة المظلمة
        const hits = Math.abs(i)<=1;
        const exX = sunPos.x+(targetX-sunPos.x)*t, exY = sunPos.y+(targetY-sunPos.y)*t;
        c.beginPath(); c.moveTo(sunPos.x,sunPos.y); c.lineTo(exX,exY); c.stroke();
        if(!hits && t>=1){
          // يكمل الشعاع إلى الأرض
          const groundX = targetX + (targetX-sunPos.x)*0.5, groundY = h*0.86;
          c.save(); c.globalAlpha=0.4;
          c.beginPath(); c.moveTo(targetX,targetY); c.lineTo(groundX,groundY); c.stroke();
          c.restore();
        }
      }
      c.restore();
      if(t>=1 && S.stage==='beaming'){ S.stage='shadowed'; controls(renderControls()); }
    }

    if(S.stage==='shadowed' || S.stage==='moveSun' || S.stage==='done'){
      c.save(); c.fillStyle= dark?'rgba(0,0,0,0.45)':'rgba(30,20,10,0.28)';
      c.beginPath();
      c.moveTo(treeX-w*0.015, treeBotY);
      c.lineTo(shadowEndX, h*0.85);
      c.lineTo(shadowEndX*0.985 + treeX*0.015, h*0.85);
      c.lineTo(treeX+w*0.015, treeBotY);
      c.closePath(); c.fill();
      c.restore();
      c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
      c.fillText('الظلّ', (treeX+shadowEndX)/2, h*0.89);
    }

    g8lHeader(c,w,h,dark,'نشاط ٢-٣ · كيف يتكوّن الظلّ؟');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   تاب ١ (نشاط ٣-٣): المرآة أم الورقة؟ (ص٥٨)
   ══════════════════════════════════════════════════════════ */
function simG8Bio3N3a(){
  cancelAnimationFrame(animFrame);
  simState = { stage:'intro', beamT:0, qSel:null };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    if(S.stage==='intro'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🪞 المرآة أم الورقة؟</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:12px">سيسقط ضوء من مصباح على مرآة وعلى ورقة بجانبها. راقبي الفرق في اتّجاه الضوء المنعكس.</div>
        <button class="ctrl-btn play" onclick="window._g8lLight()">🔦 ابدئي بتسليط الضوء</button>`;
    }
    if(S.stage==='beaming'){
      return `<div class="ctrl-section"><div class="ctrl-label">⏳ ...</div></div><div style="font-size:12.5px;color:var(--text-secondary)">راقبي أشعّة الضوء المنعكسة عن كلّ سطح.</div>`;
    }
    if(S.stage==='result'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🤔 ما الفرق الذي لاحظتِه؟</div></div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:10px">
          ${['الأشعّة تنعكس عن المرآة في اتّجاه واحد منتظم','الأشعّة تنعكس عن الورقة في اتّجاهات متعدّدة (تتشتّت)'].map((o,i)=>`
          <button onclick="window._g8lPick(${i})" style="padding:11px;border-radius:9px;border:2px solid ${S.qSel!==null?'#22C55E':'#ddd'};background:${S.qSel!==null?'rgba(74,222,128,0.12)':'var(--bg-ctrl-btn)'};color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:12.5px">${o}</button>`).join('')}
        </div>
        ${S.qSel!==null ? `<div style="padding:12px;background:var(--bg-card2);border-radius:9px;font-size:13px;line-height:1.9;color:var(--text-secondary)">
          ✅ للمرآة سطح أملس مستوٍ؛ لذا تردّ أشعّة الضوء دون أن تتشتّت، فتعكس كلّ الضوء في نفس الاتّجاه وتعطي صورةً واضحة. أمّا الورقة فسطحها خشن؛ فتتّجه أشعّة الضوء الساقطة عليها فتتشتّت في كلّ الاتّجاهات، فلا تعطي صورةً واضحة.</div>
        <button class="ctrl-btn reset" style="margin-top:10px" onclick="window._g8lMirrorRestart()">↺ أعد النشاط</button>` : ''}
      `;
    }
  }
  controls(renderControls());
  window._g8lLight = function(){ _g8pPlayClick(); S.stage='beaming'; S.beamT=0; };
  window._g8lPick = function(i){ if(S.qSel!==null) return; _g8pPlayClick(); S.qSel=i; _g8pPlayDrop(); controls(renderControls()); };
  window._g8lMirrorRestart = function(){ S.stage='intro'; S.beamT=0; S.qSel=null; controls(renderControls()); };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null;
  cv.onclick=null;

  function draw(){
    if(currentSim!=='g8bio3n3' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g8cBg(dark); c.fillRect(0,0,w,h);

    const srcX=w*0.5, srcY=h*0.2;
    const mirrorX=w*0.26, paperX=w*0.72, surfY=h*0.6;

    // مصدر الضوء
    c.save(); c.fillStyle='#4B5563'; c.strokeStyle=g8cMut(dark); c.lineWidth=2;
    c.beginPath(); c.roundRect(srcX-w*0.03,srcY-h*0.025,w*0.06,h*0.05,4); c.fill(); c.stroke();
    c.restore();
    c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
    c.fillText('مصباح', srcX, srcY-h*0.04);

    // المرآة
    c.save();
    c.fillStyle= dark?'#93C5FD':'#BFDBFE'; c.strokeStyle='#1E40AF'; c.lineWidth=3;
    c.fillRect(mirrorX-w*0.09, surfY-h*0.01, w*0.18, h*0.02);
    c.strokeRect(mirrorX-w*0.09, surfY-h*0.01, w*0.18, h*0.02);
    c.restore();
    c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
    c.fillText('🪞 مرآة (سطح أملس)', mirrorX, surfY+h*0.06);

    // الورقة
    c.save();
    c.fillStyle= dark?'#4B5563':'#F3F4F6'; c.strokeStyle=g8cMut(dark); c.lineWidth=2;
    c.fillRect(paperX-w*0.09, surfY-h*0.008, w*0.18, h*0.016);
    c.strokeRect(paperX-w*0.09, surfY-h*0.008, w*0.18, h*0.016);
    // نسيج خشن (خطوط صغيرة)
    c.strokeStyle=g8cMut(dark); c.lineWidth=0.8; c.globalAlpha=0.5;
    for(let i=0;i<10;i++){ const xx=paperX-w*0.08+i*w*0.017; c.beginPath(); c.moveTo(xx,surfY-h*0.006); c.lineTo(xx+w*0.003,surfY+h*0.006); c.stroke(); }
    c.restore();
    c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
    c.fillText('📄 ورقة (سطح خشن)', paperX, surfY+h*0.06);

    if(S.stage==='beaming' || S.stage==='result'){
      if(S.stage==='beaming') S.beamT += 0.025;
      const t = Math.min(1,S.beamT);
      // شعاع ساقط على المرآة
      c.save(); c.strokeStyle='#FBBF24'; c.lineWidth=Math.max(2,w*0.005); c.shadowColor='#FBBF24'; c.shadowBlur=6;
      const m1x = srcX+(mirrorX-srcX)*Math.min(1,t*2), m1y = srcY+(surfY-srcY)*Math.min(1,t*2);
      c.beginPath(); c.moveTo(srcX,srcY); c.lineTo(m1x,m1y); c.stroke();
      const p1x = srcX+(paperX-srcX)*Math.min(1,t*2), p1y = srcY+(surfY-srcY)*Math.min(1,t*2);
      c.beginPath(); c.moveTo(srcX,srcY); c.lineTo(p1x,p1y); c.stroke();
      c.restore();

      if(t>0.5){
        const rt = Math.min(1,(t-0.5)*2);
        // انعكاس منتظم عن المرآة: حزمة متوازية بزاوية واحدة
        c.save(); c.strokeStyle='#60A5FA'; c.lineWidth=Math.max(1.8,w*0.0045); c.globalAlpha=0.9;
        for(let i=-2;i<=2;i++){
          const fromX = mirrorX + i*w*0.03, fromY=surfY;
          const toX = fromX + w*0.09, toY = surfY - h*0.35;
          c.beginPath(); c.moveTo(fromX,fromY); c.lineTo(fromX+(toX-fromX)*rt, fromY+(toY-fromY)*rt); c.stroke();
        }
        c.restore();
        // انعكاس متشتّت عن الورقة: اتجاهات عشوائية مختلفة
        c.save(); c.strokeStyle='#F87171'; c.lineWidth=Math.max(1.8,w*0.0045); c.globalAlpha=0.9;
        const scatterAngles = [-70,-45,-20,10,35,60];
        scatterAngles.forEach((deg,i)=>{
          const fromX = paperX + (i-2.5)*w*0.02, fromY=surfY;
          const rad = (-90+deg)*Math.PI/180;
          const toX = fromX+Math.cos(rad)*w*0.16, toY=fromY+Math.sin(rad)*w*0.16;
          c.beginPath(); c.moveTo(fromX,fromY); c.lineTo(fromX+(toX-fromX)*rt, fromY+(toY-fromY)*rt); c.stroke();
        });
        c.restore();

        if(rt>=1 && S.stage==='beaming'){ S.stage='result'; controls(renderControls()); }
      }
    }

    g8lHeader(c,w,h,dark,'نشاط ٣-٣ · المرآة أم الورقة؟');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   تاب ٢ (نشاط ٣-٣): زاوية السقوط وزاوية الانعكاس (ص٥٨-٥٩)
   ══════════════════════════════════════════════════════════ */
function simG8Bio3N3b(){
  cancelAnimationFrame(animFrame);
  simState = { angle:40, dragging:false, revealedLabels:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    return `
      <div class="ctrl-section"><div class="ctrl-label">📐 زاوية السقوط وزاوية الانعكاس</div></div>
      <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:12px">اسحبي مصدر الضوء لتغيير زاوية سقوط الشعاع على المرآة، وراقبي الشعاع المنعكس والزاويتين.</div>
      <div style="display:flex;justify-content:space-between;background:var(--bg-card2);border-radius:8px;padding:10px;margin-bottom:10px;font-size:13px;font-weight:700">
        <span style="color:#F59E0B">زاوية السقوط: ${Math.round(S.angle)}°</span>
        <span style="color:#3B82F6">زاوية الانعكاس: ${Math.round(S.angle)}°</span>
      </div>
      <div style="font-size:12px;color:var(--text-secondary);background:var(--bg-card2);border-radius:8px;padding:10px;margin-bottom:12px">
        <strong>قانون الانعكاس:</strong> زاوية السقوط = زاوية الانعكاس
      </div>
      <div style="font-size:12.5px;color:var(--text-secondary)">${S.angle>10&&S.angle<80 ? '👀 لاحظي: كلّما تغيّرت زاوية السقوط، تتغيّر زاوية الانعكاس معها بالمقدار نفسه دائماً.' : ''}</div>
    `;
  }
  controls(renderControls());

  const PIVOT = {x:0.5, y:0.62};
  function srcPosFromAngle(w,h,ang){
    const rad = (90-ang)*Math.PI/180;
    const len = Math.min(w,h)*0.42;
    return { x: w*PIVOT.x - Math.cos(rad)*len, y: h*PIVOT.y - Math.sin(rad)*len };
  }
  function onDown(e){
    const p=g8lGp(cv,e), w=cv.width, h=cv.height;
    const sp = srcPosFromAngle(w,h,S.angle);
    if(Math.hypot(p.x-sp.x,p.y-sp.y) < w*0.09) S.dragging=true;
  }
  function onMove(e){
    if(!S.dragging) return;
    e.preventDefault && e.preventDefault();
    const p=g8lGp(cv,e), w=cv.width, h=cv.height;
    const px=w*PIVOT.x, py=h*PIVOT.y;
    let ang = Math.atan2(px-p.x, py-p.y)*180/Math.PI; // 0 عند العمود المقام
    S.angle = Math.max(5, Math.min(85, ang));
    controls(renderControls());
  }
  function onUp(){ S.dragging=false; }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;
  cv.onclick=null;

  function draw(){
    if(currentSim!=='g8bio3n3' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g8cBg(dark); c.fillRect(0,0,w,h);

    const px=w*PIVOT.x, py=h*PIVOT.y;
    const mirrorHalf = w*0.28;

    // المرآة (خط أفقي)
    c.save(); c.strokeStyle='#1E40AF'; c.lineWidth=Math.max(5,w*0.014); c.lineCap='round';
    c.beginPath(); c.moveTo(px-mirrorHalf,py); c.lineTo(px+mirrorHalf,py); c.stroke();
    c.restore();
    c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
    c.fillText('مرآة', px, py+h*0.05);

    // العمود المقام (خط منقّط عمودي على المرآة عند نقطة السقوط)
    const normalLen = Math.min(w,h)*0.32;
    c.save(); c.strokeStyle=g8cMut(dark); c.setLineDash([5,4]); c.lineWidth=1.8; c.globalAlpha=0.75;
    c.beginPath(); c.moveTo(px,py); c.lineTo(px,py-normalLen); c.stroke();
    c.restore();
    c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
    c.fillText('العمود المقام', px+w*0.09, py-normalLen+h*0.02);

    // الشعاع الساقط
    const srcPos = srcPosFromAngle(w,h,S.angle);
    c.save(); c.strokeStyle='#F59E0B'; c.lineWidth=Math.max(2.5,w*0.006); c.lineCap='round';
    c.beginPath(); c.moveTo(srcPos.x,srcPos.y); c.lineTo(px,py); c.stroke();
    c.restore();
    // رأس سهم على الشعاع الساقط
    (function(){
      const ang = Math.atan2(py-srcPos.y, px-srcPos.x);
      const ah=w*0.018;
      c.save(); c.fillStyle='#F59E0B';
      c.beginPath(); c.moveTo(px,py);
      c.lineTo(px-ah*Math.cos(ang-0.4), py-ah*Math.sin(ang-0.4));
      c.lineTo(px-ah*Math.cos(ang+0.4), py-ah*Math.sin(ang+0.4));
      c.closePath(); c.fill(); c.restore();
    })();

    // مصدر الضوء (مصباح يدوي واقعي قابل للسحب)
    (function(){
      const ang = Math.atan2(py-srcPos.y, px-srcPos.x);
      c.save();
      c.translate(srcPos.x, srcPos.y);
      c.rotate(ang - Math.PI/2);
      const bw = w*0.032, bh = h*0.075;
      // جسم المصباح
      c.fillStyle = S.dragging ? g8cAccent(dark) : '#4B5563'; c.strokeStyle=g8cMut(dark); c.lineWidth=2;
      c.beginPath(); c.roundRect(-bw*0.55, -bh*0.15, bw*1.1, bh*0.75, bw*0.3); c.fill(); c.stroke();
      // رأس المصباح (أوسع قليلاً، جهة الشعاع الخارج)
      c.fillStyle = '#E5E7EB'; c.strokeStyle=g8cMut(dark); c.lineWidth=2;
      c.beginPath();
      c.moveTo(-bw*0.55, -bh*0.15);
      c.lineTo(-bw*0.75, -bh*0.45);
      c.lineTo(bw*0.75, -bh*0.45);
      c.lineTo(bw*0.55, -bh*0.15);
      c.closePath(); c.fill(); c.stroke();
      // زجاج مضيء
      c.fillStyle='#FDE047'; c.beginPath(); c.ellipse(0,-bh*0.45,bw*0.55,bw*0.14,0,0,Math.PI*2); c.fill();
      // زرّ صغير
      c.fillStyle='#DC2626'; c.beginPath(); c.arc(0, bh*0.35, bw*0.14, 0, Math.PI*2); c.fill();
      c.restore();
    })();
    c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.013)}px Tajawal`; c.textAlign='center';
    c.fillText('🔦 اسحبيني', srcPos.x, srcPos.y-h*0.075);

    // الشعاع المنعكس (بنفس الزاوية على الجهة الأخرى من العمود المقام)
    const reflRad = (90-S.angle)*Math.PI/180;
    const reflLen = Math.min(w,h)*0.42;
    const reflX = px + Math.cos(reflRad)*reflLen, reflY = py - Math.sin(reflRad)*reflLen;
    c.save(); c.strokeStyle='#3B82F6'; c.lineWidth=Math.max(2.5,w*0.006); c.lineCap='round';
    c.beginPath(); c.moveTo(px,py); c.lineTo(reflX,reflY); c.stroke();
    (function(){
      const ang = Math.atan2(reflY-py, reflX-px);
      const ah=w*0.018;
      c.save(); c.fillStyle='#3B82F6';
      c.beginPath(); c.moveTo(reflX,reflY);
      c.lineTo(reflX-ah*Math.cos(ang-0.4), reflY-ah*Math.sin(ang-0.4));
      c.lineTo(reflX-ah*Math.cos(ang+0.4), reflY-ah*Math.sin(ang+0.4));
      c.closePath(); c.fill(); c.restore();
    })();
    c.restore();

    // قوسا الزاويتين (بين كل شعاع والعمود المقام)
    c.save(); c.strokeStyle='#F59E0B'; c.lineWidth=2; c.globalAlpha=0.7;
    c.beginPath(); c.arc(px,py, w*0.075, -Math.PI/2, -Math.PI/2-(S.angle*Math.PI/180), true); c.stroke();
    c.restore();
    c.save(); c.strokeStyle='#3B82F6'; c.lineWidth=2; c.globalAlpha=0.7;
    c.beginPath(); c.arc(px,py, w*0.075, -Math.PI/2, -Math.PI/2+(S.angle*Math.PI/180), false); c.stroke();
    c.restore();

    // تسميات الأشعّة — بعيدة عن مسار الشعاع نفسه لتفادي التداخل
    c.fillStyle='#F59E0B'; c.font=`bold ${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
    c.fillText('الشعاع الساقط', (srcPos.x+px)/2 - w*0.06, (srcPos.y+py)/2 - h*0.02);
    c.fillStyle='#3B82F6';
    c.fillText('الشعاع المنعكس', reflX + w*0.02, reflY - h*0.02);

    g8lHeader(c,w,h,dark,'نشاط ٣-٣ · زاوية السقوط وزاوية الانعكاس');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   الصف الثامن — نشاط ٤-٣ · كيف ينكسر الضوء؟ (كتاب الصف الثامن ص٦٠-٦١)
   ══════════════════════════════════════════════════════════ */

/* تاب ١: هل يبدو القلم مكسورًا؟ (ص٦٠) */
function simG8Bio3N4a(){
  cancelAnimationFrame(animFrame);
  simState = { stage:'start', qSel:null };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const QOPTS = ['لأنّ القلم انكسر فعليًا داخل الماء','لأنّ الضوء ينكسر عند انتقاله من الماء إلى الهواء، فتتغيّر الصورة التي نراها','لأنّ الماء يكبّر حجم الأشياء دائمًا'];
  const QANS = 1;

  function renderControls(){
    if(S.stage==='start'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🖊️ هل يبدو القلم مكسورًا؟</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:12px">في الصورة كأس ماء وقلم رصاص بجانبه. ضعي القلم في الماء وراقبي شكله.</div>
        <button class="ctrl-btn play" onclick="window._g8lPencil()">🖊️ ضعي القلم في الماء</button>`;
    }
    if(S.stage==='inWater'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">👀 لاحظي القلم!</div></div>
        <div style="font-size:13px;line-height:1.85;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:12px;margin-bottom:12px">هل يبدو القلم كما هو، أم أنّه يبدو منحنيًا أو مكسورًا عند سطح الماء؟</div>
        <button class="ctrl-btn play" onclick="window._g8lAskWhy()">🤔 لماذا يبدو القلم هكذا؟</button>`;
    }
    if(S.stage==='qAsked' || S.stage==='qAnswered'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🤔 توقّعي</div></div>
        <div style="font-size:13.5px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px">لماذا يبدو القلم مكسورًا أو منحرفًا عند وضعه في الماء؟</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${QOPTS.map((o,i)=>`<button onclick="window._g8lQAns4(${i})" style="padding:10px;border-radius:9px;border:2px solid ${S.qSel===null?'#ddd':(i===QANS?'#22C55E':(i===S.qSel?'#DC2626':'#ddd'))};background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:12.5px">${o}</button>`).join('')}
        </div>
        ${S.stage==='qAnswered' ? `
        <div style="margin-top:10px;padding:13px;background:${S.qSel===QANS?'rgba(74,222,128,0.15)':'rgba(239,68,68,0.1)'};border-radius:10px;font-size:13px;line-height:1.9;color:var(--text-secondary)">
          ${S.qSel===QANS?'✅ صحيح!':'💡'} <strong style="color:#D4901A">الانكسار Refraction:</strong> التغيّر في اتّجاه الشعاع الضوئي عند انتقاله من وسط شفّاف إلى وسط شفّاف آخر (من الماء إلى الهواء أو من الهواء إلى الماء). القلم نفسه لم ينكسر — بل انحرف مسار الضوء القادم منه إلى عينك.
        </div>
        <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g8lRestart4()">↺ أعيدي المحاولة</button>` : ''}
      `;
    }
  }
  controls(renderControls());
  window._g8lPencil = function(){ _g8pPlayClick(); S.stage='inWater'; S.animT=0; controls(renderControls()); };
  window._g8lAskWhy = function(){ _g8pPlayClick(); S.stage='qAsked'; controls(renderControls()); };
  window._g8lQAns4 = function(i){ _g8pPlayClick(); S.qSel=i; S.stage='qAnswered'; if(i===QANS) _g8pPlayDrop(); controls(renderControls()); };
  window._g8lRestart4 = function(){ S.stage='start'; S.qSel=null; controls(renderControls()); };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null; cv.onclick=null;

  function draw(){
    if(currentSim!=='g8bio3n4' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g8cBg(dark); c.fillRect(0,0,w,h);
    const inWater = S.stage!=='start';

    // الكأس — وحدة قياس موحّدة B لكلّ الأبعاد
    const B = w*0.34;
    const cupX = w*0.5, cupTopY = h*0.32, cupH = B*1.05, cupBotY = cupTopY+cupH;
    const waterTopY = cupTopY + cupH*0.22;

    // ظل الكأس
    c.save(); c.fillStyle=dark?'rgba(0,0,0,0.35)':'rgba(0,0,0,0.13)';
    c.beginPath(); c.ellipse(cupX, cupBotY+B*0.03, B*0.42, B*0.05,0,0,Math.PI*2); c.fill(); c.restore();

    // جسم الكأس الزجاجي
    c.save();
    c.beginPath();
    c.moveTo(cupX-B*0.4, cupTopY); c.lineTo(cupX-B*0.34, cupBotY); c.quadraticCurveTo(cupX,cupBotY+B*0.02,cupX+B*0.34,cupBotY);
    c.lineTo(cupX+B*0.4, cupTopY); c.closePath();
    c.fillStyle= dark?'rgba(180,210,230,0.14)':'rgba(200,225,240,0.28)'; c.fill();
    c.strokeStyle=dark?'#8FAFC0':'#9FC3D6'; c.lineWidth=2.5; c.stroke();
    c.restore();

    // الماء
    c.save();
    c.beginPath();
    c.moveTo(cupX-B*0.375, waterTopY); c.lineTo(cupX-B*0.34, cupBotY); c.quadraticCurveTo(cupX,cupBotY+B*0.02,cupX+B*0.34,cupBotY);
    c.lineTo(cupX+B*0.375, waterTopY); c.closePath();
    const wg=c.createLinearGradient(0,waterTopY,0,cupBotY); wg.addColorStop(0,'#7EC8E3'); wg.addColorStop(1,'#3E8FBF');
    c.fillStyle=wg; c.globalAlpha=0.75; c.fill();
    c.restore();
    // خط سطح الماء
    c.save(); c.strokeStyle='#BEE6F5'; c.lineWidth=2; c.globalAlpha=0.85;
    c.beginPath(); c.ellipse(cupX,waterTopY,B*0.375,B*0.035,0,0,Math.PI*2); c.stroke(); c.restore();
    // حافة الكأس العلوية
    c.save(); c.strokeStyle=dark?'#8FAFC0':'#9FC3D6'; c.lineWidth=2.5;
    c.beginPath(); c.ellipse(cupX,cupTopY,B*0.4,B*0.035,0,0,Math.PI*2); c.stroke(); c.restore();

    // القلم
    const pencilLen = B*1.15, pencilW = Math.max(5,B*0.032);
    if(!inWater){
      // القلم مستقيم بجانب الكأس
      const px0 = cupX+B*0.62, py0 = cupTopY-B*0.05, ang=1.05;
      c.save(); c.translate(px0,py0); c.rotate(ang);
      c.fillStyle='#F4C430'; c.strokeStyle='#8A5A1A'; c.lineWidth=1.5;
      c.beginPath(); c.roundRect(-pencilW/2,0,pencilW,pencilLen*0.86,pencilW*0.3); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(-pencilW/2,pencilLen*0.86); c.lineTo(pencilW/2,pencilLen*0.86); c.lineTo(0,pencilLen); c.closePath();
      c.fillStyle='#D9A441'; c.fill(); c.stroke();
      c.restore();
      c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
      c.fillText('قلم رصاص جافّ', px0+Math.sin(ang)*pencilLen*0.5, py0+Math.cos(ang)*pencilLen*0.5+h*0.05);
    } else {
      // القلم مائل يدخل الماء: يبدو منحرفًا عند خط السطح
      const entryX = cupX+B*0.06, ang1=1.0, ang2=0.55;
      const aboveLen = (waterTopY-(cupTopY-B*0.42))/Math.cos(ang1);
      const srcX = entryX - Math.sin(ang1)*aboveLen, srcY = cupTopY-B*0.42;
      // الجزء فوق الماء (مستقيم)
      c.save(); c.strokeStyle='#8A5A1A'; c.lineWidth=pencilW; c.lineCap='round';
      c.beginPath(); c.moveTo(srcX,srcY); c.lineTo(entryX,waterTopY); c.stroke(); c.restore();
      c.save(); c.fillStyle='#F4C430'; c.strokeStyle='#8A5A1A'; c.lineWidth=1;
      c.beginPath(); c.arc(srcX,srcY,pencilW*0.55,0,Math.PI*2); c.fill(); c.stroke(); c.restore();
      // الجزء تحت الماء (بزاوية مختلفة — يبدو منحرفًا عند خط السطح)
      const belowLen = B*0.62;
      const tipX = entryX + Math.sin(ang2)*belowLen, tipY = waterTopY + Math.cos(ang2)*belowLen;
      c.save(); c.globalAlpha=0.88; c.strokeStyle='#B8860B'; c.lineWidth=pencilW*0.92; c.lineCap='round';
      c.beginPath(); c.moveTo(entryX,waterTopY); c.lineTo(tipX,tipY); c.stroke(); c.restore();
      // إبراز نقطة الانحراف عند السطح
      c.save(); c.fillStyle=g8cAccent(dark); c.beginPath(); c.arc(entryX,waterTopY,3.5,0,Math.PI*2); c.fill(); c.restore();
      c.fillStyle=g8cMut(dark); c.font=`bold ${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
      c.fillText('👀 يبدو منحرفًا هنا', entryX+B*0.28, waterTopY-B*0.05);
    }

    g8lHeader(c,w,h,dark,'نشاط ٤-٣ · هل يبدو القلم مكسورًا؟');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* تاب ٢: مسار الشعاع عند دخوله الزجاج (ص٦٠-٦١) */
function simG8Bio3N4b(){
  cancelAnimationFrame(animFrame);
  simState = { angle:30, tried:{}, showQ:false, qSel:null };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const N_GLASS = 1.5;
  const QOPTS = ['كلّما زادت زاوية السقوط، زادت زاوية الانكسار أيضًا','زاوية الانكسار تبقى ثابتة دائمًا مهما تغيّرت زاوية السقوط','كلّما زادت زاوية السقوط، قلّت زاوية الانكسار'];
  const QANS = 0;

  function refrAngle(a){ return Math.asin(Math.sin(a*Math.PI/180)/N_GLASS)*180/Math.PI; }

  function renderControls(){
    const r = refrAngle(S.angle);
    const triedCount = Object.keys(S.tried).length;
    return `
      <div class="ctrl-section"><div class="ctrl-label">📐 مسار الشعاع عند دخوله الزجاج</div></div>
      <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:10px">اختاري زاوية سقوط مختلفة وراقبي كيف ينكسر الشعاع عند دخوله القطعة الزجاجية.</div>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        ${[0,30,60].map(a=>`<button onclick="window._g8lAngle4(${a})" style="flex:1;padding:11px 4px;border-radius:9px;border:2px solid ${S.angle===a?'#D4901A':'#ddd'};background:${S.angle===a?'rgba(212,144,26,0.12)':'var(--bg-ctrl-btn)'};color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:800;cursor:pointer">${a}°</button>`).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;background:var(--bg-card2);border-radius:8px;padding:10px;margin-bottom:10px;font-size:13px;font-weight:700">
        <span style="color:#F59E0B">زاوية السقوط: ${S.angle}°</span>
        <span style="color:#3B82F6">زاوية الانكسار: ${S.angle===0?'0':r.toFixed(0)}°</span>
      </div>
      ${S.angle===0 ? `<div style="font-size:12.5px;background:rgba(74,222,128,0.15);border-radius:8px;padding:10px;margin-bottom:10px">💡 إذا سقط الشعاع عموديًا على السطح (على امتداد العمود المقام)، فإنّه <strong>لا ينحرف</strong>.</div>` :
      `<div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:10px">لاحظي أنّ الشعاع ينحرف نحو العمود المقام عند دخوله الزجاج (وسط أكثف من الهواء).</div>`}
      ${triedCount>=2 ? (!S.showQ ? `<button class="ctrl-btn play" onclick="window._g8lShowQ4b()">🤔 كيف تتغيّر زاوية الانكسار؟</button>` : `
        <div style="font-size:13px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:12px;margin-bottom:10px">كيف تتغيّر زاوية الانكسار عندما تتغيّر زاوية السقوط؟</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${QOPTS.map((o,i)=>`<button onclick="window._g8lQAns4b(${i})" style="padding:10px;border-radius:9px;border:2px solid ${S.qSel===null?'#ddd':(i===QANS?'#22C55E':(i===S.qSel?'#DC2626':'#ddd'))};background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:12.5px">${o}</button>`).join('')}
        </div>
        ${S.qSel!==null?`<div style="margin-top:8px;padding:10px;background:${S.qSel===QANS?'rgba(74,222,128,0.15)':'rgba(239,68,68,0.1)'};border-radius:9px;font-size:12.5px;line-height:1.8;color:var(--text-secondary)">${S.qSel===QANS?'✅ صحيح!':'💡'} كلّما زادت زاوية السقوط، زادت زاوية الانكسار — لكنّ الشعاع يبقى دائمًا أقرب إلى العمود المقام داخل الزجاج منه في الهواء.</div>`:''}
      `) : ''}
    `;
  }
  controls(renderControls());
  window._g8lAngle4 = function(a){ _g8pPlayClick(); S.angle=a; S.tried[a]=true; controls(renderControls()); };
  window._g8lShowQ4b = function(){ _g8pPlayClick(); S.showQ=true; controls(renderControls()); };
  window._g8lQAns4b = function(i){ _g8pPlayClick(); S.qSel=i; if(i===QANS) _g8pPlayDrop(); controls(renderControls()); };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null; cv.onclick=null;

  function draw(){
    if(currentSim!=='g8bio3n4' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g8cBg(dark); c.fillRect(0,0,w,h);

    const entryX = w*0.5, entryY = h*0.44;
    const blockW = w*0.5, blockTop = entryY, blockBot = h*0.84;

    // القطعة الزجاجية
    c.save();
    const gg=c.createLinearGradient(0,blockTop,0,blockBot); gg.addColorStop(0,dark?'rgba(147,197,253,0.22)':'rgba(191,219,254,0.55)'); gg.addColorStop(1,dark?'rgba(147,197,253,0.12)':'rgba(191,219,254,0.3)');
    c.fillStyle=gg; c.strokeStyle=dark?'#93C5FD':'#60A5FA'; c.lineWidth=2.5;
    c.beginPath(); c.roundRect(entryX-blockW/2, blockTop, blockW, blockBot-blockTop, 6); c.fill(); c.stroke();
    c.restore();
    c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
    c.fillText('قطعة زجاجيّة', entryX, blockBot+h*0.045);

    // العمود المقام (عمودي على سطح الزجاج عند نقطة السقوط)
    const normLen = Math.min(w,h)*0.3;
    c.save(); c.strokeStyle=g8cMut(dark); c.setLineDash([5,4]); c.lineWidth=1.8; c.globalAlpha=0.75;
    c.beginPath(); c.moveTo(entryX,entryY-normLen*0.42); c.lineTo(entryX,entryY+normLen*0.68); c.stroke();
    c.restore();
    c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.013)}px Tajawal`; c.textAlign='center';
    c.fillText('العمود المقام', entryX+w*0.1, entryY-normLen*0.42-h*0.012);

    // الشعاع الساقط
    const rad1 = S.angle*Math.PI/180;
    const aboveLen = Math.min(w,h)*0.34;
    const srcX = entryX - Math.sin(rad1)*aboveLen, srcY = entryY - Math.cos(rad1)*aboveLen;
    c.save(); c.strokeStyle='#F59E0B'; c.lineWidth=Math.max(2.5,w*0.006); c.lineCap='round';
    c.beginPath(); c.moveTo(srcX,srcY); c.lineTo(entryX,entryY); c.stroke(); c.restore();
    (function(){ const ang=Math.atan2(entryY-srcY,entryX-srcX), ah=w*0.018;
      c.save(); c.fillStyle='#F59E0B'; c.beginPath(); c.moveTo(entryX,entryY);
      c.lineTo(entryX-ah*Math.cos(ang-0.4),entryY-ah*Math.sin(ang-0.4)); c.lineTo(entryX-ah*Math.cos(ang+0.4),entryY-ah*Math.sin(ang+0.4));
      c.closePath(); c.fill(); c.restore(); })();
    // مصباح يدوي كمصدر
    c.save(); c.translate(srcX,srcY); c.fillStyle='#4B5563'; c.strokeStyle=g8cMut(dark); c.lineWidth=1.5;
    c.beginPath(); c.arc(0,0,w*0.022,0,Math.PI*2); c.fill(); c.stroke(); c.restore();

    // الشعاع المنكسر داخل الزجاج
    const rad2 = refrAngle(S.angle)*Math.PI/180;
    const belowLen = Math.min(w,h)*0.32;
    const destX = entryX + Math.sin(rad2)*belowLen, destY = entryY + Math.cos(rad2)*belowLen;
    c.save(); c.strokeStyle='#3B82F6'; c.lineWidth=Math.max(2.5,w*0.006); c.lineCap='round';
    c.beginPath(); c.moveTo(entryX,entryY); c.lineTo(destX,destY); c.stroke(); c.restore();
    (function(){ const ang=Math.atan2(destY-entryY,destX-entryX), ah=w*0.018;
      c.save(); c.fillStyle='#3B82F6'; c.beginPath(); c.moveTo(destX,destY);
      c.lineTo(destX-ah*Math.cos(ang-0.4),destY-ah*Math.sin(ang-0.4)); c.lineTo(destX-ah*Math.cos(ang+0.4),destY-ah*Math.sin(ang+0.4));
      c.closePath(); c.fill(); c.restore(); })();

    if(S.angle>0){
      c.save(); c.strokeStyle='#F59E0B'; c.lineWidth=2; c.globalAlpha=0.65;
      c.beginPath(); c.arc(entryX,entryY,w*0.06,-Math.PI/2,-Math.PI/2-rad1,true); c.stroke(); c.restore();
      c.save(); c.strokeStyle='#3B82F6'; c.lineWidth=2; c.globalAlpha=0.65;
      c.beginPath(); c.arc(entryX,entryY,w*0.06,Math.PI/2,Math.PI/2-rad2,false); c.stroke(); c.restore();
    }

    c.fillStyle='#F59E0B'; c.font=`bold ${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
    c.fillText('الشعاع الساقط', (srcX+entryX)/2-w*0.09, (srcY+entryY)/2);
    c.fillStyle='#3B82F6';
    c.fillText('الشعاع المنكسر', destX+w*0.02, destY+h*0.03);

    g8lHeader(c,w,h,dark,'نشاط ٤-٣ · مسار الشعاع عند دخوله الزجاج');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   الصف الثامن — نشاط ٥-٣ · طيف الضوء الأبيض (كتاب الصف الثامن ص٦٢-٦٣)
   ══════════════════════════════════════════════════════════ */
const G8_SPECTRUM = [
  {name:'أحمر',    col:'#EF4444', bend:0.10},
  {name:'برتقالي', col:'#F97316', bend:0.16},
  {name:'أصفر',    col:'#FACC15', bend:0.22},
  {name:'أخضر',    col:'#22C55E', bend:0.28},
  {name:'أزرق',    col:'#3B82F6', bend:0.34},
  {name:'نيلي',    col:'#4338CA', bend:0.40},
  {name:'بنفسجي',  col:'#8B5CF6', bend:0.46},
];

/* تاب ١: المنشور الزجاجي — تشتّت الضوء الأبيض */
function simG8Bio3N5a(){
  cancelAnimationFrame(animFrame);
  simState = { stage:'predict', beamT:0, revealMnemonic:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    if(S.stage==='predict'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🔺 المنشور الزجاجي</div></div>
        <div style="font-size:13px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:12px">🤔 توقّعي: ماذا سيحدث للضوء الأبيض عندما يمرّ عبر منشور زجاجي؟</div>
        <button class="ctrl-btn play" onclick="window._g8lFirePrism()">💡 أطلقي الضوء</button>`;
    }
    if(S.stage==='firing'){
      return `<div class="ctrl-section"><div class="ctrl-label">⏳ ...</div></div><div style="font-size:12.5px;color:var(--text-secondary)">راقبي الضوء وهو يمرّ عبر المنشور.</div>`;
    }
    return `
      <div class="ctrl-section"><div class="ctrl-label">🌈 ماذا لاحظتِ؟</div></div>
      <div style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:12px">
        تحلّل الضوء الأبيض إلى ألوان الطيف عند مروره بالمنشور، وتُسمّى هذه الظاهرة <strong style="color:#D4901A">التشتّت Dispersion</strong>.
        تظهر الألوان دائمًا بالترتيب نفسه: أحمر، برتقالي، أصفر، أخضر، أزرق، نيلي، بنفسجي.
      </div>
      ${!S.revealMnemonic ? `<button class="ctrl-btn play" onclick="window._g8lMnemonic()">🔤 كيف نتذكّر ترتيب الألوان؟</button>` : `
      <div style="font-size:20px;font-weight:900;text-align:center;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:10px;letter-spacing:2px;color:#D4901A">Roy G. Biv</div>
      <div style="font-size:12px;color:var(--text-secondary);text-align:center">يأخذ بعض الأشخاص الحرف الأوّل من اسم كلّ لون بالإنجليزية ليتذكّروا ترتيب ألوان الطيف بسهولة.</div>
      <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g8lRestart5a()">↺ أعيدي النشاط</button>`}
    `;
  }
  controls(renderControls());
  window._g8lFirePrism = function(){ _g8pPlayClick(); S.stage='firing'; S.beamT=0; };
  window._g8lMnemonic = function(){ _g8pPlayClick(); S.revealMnemonic=true; controls(renderControls()); };
  window._g8lRestart5a = function(){ S.stage='predict'; S.revealMnemonic=false; S.beamT=0; controls(renderControls()); };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null; cv.onclick=null;

  function draw(){
    if(currentSim!=='g8bio3n5' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g8cBg(dark); c.fillRect(0,0,w,h);

    const boxX=w*0.13, boxY=h*0.5, prismX=w*0.46, prismY=h*0.5, prismS=w*0.16;

    // صندوق الإضاءة
    c.save(); c.translate(boxX,boxY);
    c.fillStyle='#4B5563'; c.strokeStyle=g8cMut(dark); c.lineWidth=2;
    c.beginPath(); c.roundRect(-w*0.045,-h*0.05,w*0.09,h*0.1,6); c.fill(); c.stroke();
    c.fillStyle='#FDE047'; c.beginPath(); c.roundRect(w*0.03,-h*0.014,w*0.02,h*0.028,3); c.fill();
    c.restore();
    c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.013)}px Tajawal`; c.textAlign='center';
    c.fillText('صندوق إضاءة', boxX, boxY+h*0.09);

    // المنشور (مثلث)
    c.save();
    c.beginPath();
    c.moveTo(prismX, prismY-prismS*0.62);
    c.lineTo(prismX-prismS*0.55, prismY+prismS*0.4);
    c.lineTo(prismX+prismS*0.55, prismY+prismS*0.4);
    c.closePath();
    const pg=c.createLinearGradient(prismX,prismY-prismS*0.6,prismX,prismY+prismS*0.4);
    pg.addColorStop(0, dark?'rgba(226,232,240,0.28)':'rgba(226,232,240,0.55)'); pg.addColorStop(1, dark?'rgba(226,232,240,0.12)':'rgba(226,232,240,0.25)');
    c.fillStyle=pg; c.strokeStyle=dark?'#CBD5E1':'#94A3B8'; c.lineWidth=2.5; c.fill(); c.stroke();
    c.restore();
    c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.013)}px Tajawal`; c.textAlign='center';
    c.fillText('منشور زجاجي', prismX, prismY+prismS*0.4+h*0.045);

    if(S.stage!=='predict'){
      if(S.stage==='firing'){ S.beamT=Math.min(1,S.beamT+0.02); if(S.beamT>=1) S.stage='result'; }
      const t=S.beamT;
      // الشعاع الأبيض قبل المنشور
      const beamEndX = boxX + (prismX-prismS*0.4-boxX)*Math.min(1,t*3);
      c.save(); c.strokeStyle='#F8FAFC'; c.lineWidth=Math.max(3,w*0.008); c.lineCap='round'; c.shadowColor='#fff'; c.shadowBlur=6;
      c.beginPath(); c.moveTo(boxX+w*0.045,boxY); c.lineTo(beamEndX,prismY); c.stroke(); c.restore();

      // الطيف بعد المنشور (يظهر تدريجيًا)
      const spreadT = Math.max(0, Math.min(1,(t-0.33)*1.6));
      if(spreadT>0){
        const exitX = prismX+prismS*0.28, exitY = prismY-prismS*0.02;
        G8_SPECTRUM.forEach((col,i)=>{
          const len = w*0.34*spreadT;
          const ex = exitX + Math.cos(col.bend)*len, ey = exitY + Math.sin(col.bend)*len*1.4 - (i-3)*0*0;
          const dy = (i-3)*h*0.028*spreadT;
          c.save(); c.strokeStyle=col.col; c.lineWidth=Math.max(2.5,w*0.006); c.lineCap='round'; c.globalAlpha=0.92;
          c.beginPath(); c.moveTo(exitX,exitY); c.lineTo(exitX+w*0.34*spreadT, exitY+dy); c.stroke(); c.restore();
          if(spreadT>0.85){
            c.fillStyle=col.col; c.font=`bold ${Math.round(h*0.015)}px Tajawal`; c.textAlign='right';
            c.fillText(col.name, exitX+w*0.36*spreadT, exitY+dy+h*0.005);
          }
        });
      }
    }

    g8lHeader(c,w,h,dark,'نشاط ٥-٣ · طيف الضوء الأبيض');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* تاب ٢: أيّ لون ينكسر بزاوية أكبر؟ (ص٦٣) */
function simG8Bio3N5b(){
  cancelAnimationFrame(animFrame);
  simState = { tried:{}, qSel:null, showQ:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const QOPTS = ['الأحمر ينحرف بزاوية أكبر من البنفسجي','البنفسجي ينحرف بزاوية أكبر من الأحمر','ينحرف اللونان بالزاوية نفسها تمامًا'];
  const QANS = 1;

  function renderControls(){
    const triedCount = Object.keys(S.tried).length;
    return `
      <div class="ctrl-section"><div class="ctrl-label">🔴🟣 أيّ لون ينكسر أكثر؟</div></div>
      <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:10px">جرّبي الشعاعين وقارني بين مقدار انحراف كلّ لون عبر المنشور.</div>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <button onclick="window._g8lTryColor('red')" style="flex:1;padding:11px;border-radius:9px;border:2px solid ${S.tried.red?'#EF4444':'#ddd'};background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:800;cursor:pointer">🔴 الأحمر</button>
        <button onclick="window._g8lTryColor('violet')" style="flex:1;padding:11px;border-radius:9px;border:2px solid ${S.tried.violet?'#8B5CF6':'#ddd'};background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:800;cursor:pointer">🟣 البنفسجي</button>
      </div>
      ${triedCount>=2 ? (!S.showQ ? `<button class="ctrl-btn play" onclick="window._g8lShowQ5b()">🤔 أيّهما انحرف أكثر؟</button>` : `
        <div style="display:flex;flex-direction:column;gap:8px">
          ${QOPTS.map((o,i)=>`<button onclick="window._g8lQAns5b(${i})" style="padding:10px;border-radius:9px;border:2px solid ${S.qSel===null?'#ddd':(i===QANS?'#22C55E':(i===S.qSel?'#DC2626':'#ddd'))};background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:12.5px">${o}</button>`).join('')}
        </div>
        ${S.qSel!==null?`<div style="margin-top:8px;padding:10px;background:${S.qSel===QANS?'rgba(74,222,128,0.15)':'rgba(239,68,68,0.1)'};border-radius:9px;font-size:12.5px;line-height:1.8;color:var(--text-secondary)">${S.qSel===QANS?'✅ صحيح!':'💡'} البنفسجي هو الأكثر انحرافًا، والأحمر هو الأقلّ انحرافًا. ولأنّ الألوان تنكسر بزوايا مختلفة، تخرج من المنشور باتّجاهات مختلفة فنراها منفصلة.</div>`:''}`) : ''}
    `;
  }
  controls(renderControls());
  window._g8lTryColor = function(k){ _g8pPlayClick(); S.tried[k]=true; S.lastFired=k; S.fireT=0; controls(renderControls()); };
  window._g8lShowQ5b = function(){ _g8pPlayClick(); S.showQ=true; controls(renderControls()); };
  window._g8lQAns5b = function(i){ _g8pPlayClick(); S.qSel=i; if(i===QANS) _g8pPlayDrop(); controls(renderControls()); };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null; cv.onclick=null;

  function draw(){
    if(currentSim!=='g8bio3n5' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g8cBg(dark); c.fillRect(0,0,w,h);

    const prismX=w*0.42, prismY=h*0.55, prismS=w*0.17;
    c.save();
    c.beginPath();
    c.moveTo(prismX, prismY-prismS*0.62);
    c.lineTo(prismX-prismS*0.55, prismY+prismS*0.4);
    c.lineTo(prismX+prismS*0.55, prismY+prismS*0.4);
    c.closePath();
    const pg=c.createLinearGradient(prismX,prismY-prismS*0.6,prismX,prismY+prismS*0.4);
    pg.addColorStop(0, dark?'rgba(226,232,240,0.28)':'rgba(226,232,240,0.55)'); pg.addColorStop(1, dark?'rgba(226,232,240,0.12)':'rgba(226,232,240,0.25)');
    c.fillStyle=pg; c.strokeStyle=dark?'#CBD5E1':'#94A3B8'; c.lineWidth=2.5; c.fill(); c.stroke();
    c.restore();

    const entryX=prismX-prismS*0.2, entryY=prismY;
    c.save(); c.strokeStyle=g8cMut(dark); c.lineWidth=Math.max(2,w*0.005); c.lineCap='round';
    c.beginPath(); c.moveTo(w*0.08,entryY); c.lineTo(entryX,entryY); c.stroke(); c.restore();

    const DEFS = { red:{col:'#EF4444',bend:0.10,label:'أحمر'}, violet:{col:'#8B5CF6',bend:0.46,label:'بنفسجي'} };
    Object.keys(S.tried).forEach(k=>{
      const d = DEFS[k];
      const exitX = prismX+prismS*0.3, exitY = prismY-prismS*0.02;
      const len = w*0.4;
      const ex = exitX+Math.cos(d.bend)*len, ey = exitY+Math.sin(d.bend)*len*1.5;
      c.save(); c.strokeStyle=d.col; c.lineWidth=Math.max(3,w*0.007); c.lineCap='round'; c.globalAlpha=0.92;
      c.beginPath(); c.moveTo(exitX,exitY); c.lineTo(ex,ey); c.stroke(); c.restore();
      c.fillStyle=d.col; c.font=`bold ${Math.round(h*0.016)}px Tajawal`; c.textAlign='right';
      c.fillText(d.label, ex+w*0.015, ey+h*0.006);
    });

    if(Object.keys(S.tried).length===0){
      c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
      c.fillText('اضغطي على أحد اللونين أعلاه لتجربته', w*0.5, h*0.85);
    }

    g8lHeader(c,w,h,dark,'نشاط ٥-٣ · أيّ لون ينكسر بزاوية أكبر؟');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   الصف الثامن — نشاط ٦-٣ · الضوء الملوّن (كتاب الصف الثامن ص٦٤-٦٥)
   ══════════════════════════════════════════════════════════ */

/* تاب ١: كيف تعمل المرشّحات؟ */
function simG8Bio3N6a(){
  cancelAnimationFrame(animFrame);
  const FILTERS = [
    { id:'red',   label:'مرشّح أحمر 🔴',  col:'#EF4444', passes:['أحمر (وقليل من البرتقالي)'], info:'يسمح المرشّح الأحمر بمرور الضوء الأحمر (وقليل من البرتقالي)، ويمتصّ باقي الألوان (الأصفر والأخضر والأزرق والنيليّ والبنفسجيّ).' },
    { id:'green', label:'مرشّح أخضر 🟢', col:'#22C55E', passes:['أخضر'], info:'يسمح المرشّح الأخضر بمرور الضوء الأخضر فقط تقريبًا، ويمتصّ باقي الألوان.' },
    { id:'blue',  label:'مرشّح أزرق 🔵',  col:'#3B82F6', passes:['أزرق'], info:'يسمح المرشّح الأزرق بمرور الضوء الأزرق غالبًا، ويمتصّ باقي الألوان.' },
  ];
  simState = { curId:null, fired:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    if(!S.curId){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🔍 كيف تعمل المرشّحات؟</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:12px">المرشّح Filter قطعة زجاجية أو بلاستيكية ملوّنة تسمح لبعض ألوان الضوء بالمرور فقط، وتمتصّ الألوان الأخرى. اختاري مرشّحًا لتجربته.</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${FILTERS.map(f=>`<button onclick="window._g8lFilter('${f.id}')" style="padding:11px;border-radius:9px;border:2px solid ${f.col};background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">${f.label}</button>`).join('')}
        </div>`;
    }
    const f = FILTERS.find(x=>x.id===S.curId);
    return `
      <div class="ctrl-section"><div class="ctrl-label">${f.label}</div></div>
      ${!S.fired ? `<button class="ctrl-btn play" onclick="window._g8lFireFilter()">💡 مرّري الضوء الأبيض</button>` : `
      <div style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:12px">${f.info}</div>
      <button class="ctrl-btn reset" onclick="window._g8lFilterBack()">↺ جرّبي مرشّحًا آخر</button>`}
    `;
  }
  controls(renderControls());
  window._g8lFilter = function(id){ _g8pPlayClick(); S.curId=id; S.fired=false; controls(renderControls()); };
  window._g8lFireFilter = function(){ _g8pPlayClick(); S.fired=true; controls(renderControls()); };
  window._g8lFilterBack = function(){ _g8pPlayClick(); S.curId=null; S.fired=false; controls(renderControls()); };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null; cv.onclick=null;

  function draw(){
    if(currentSim!=='g8bio3n6' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g8cBg(dark); c.fillRect(0,0,w,h);

    const boxX=w*0.13, boxY=h*0.5, filterX=w*0.5, filterY=h*0.5, filterW=w*0.06, filterH=h*0.34;

    // صندوق ضوء أبيض
    c.save(); c.translate(boxX,boxY);
    c.fillStyle='#4B5563'; c.strokeStyle=g8cMut(dark); c.lineWidth=2;
    c.beginPath(); c.roundRect(-w*0.045,-h*0.06,w*0.09,h*0.12,6); c.fill(); c.stroke();
    c.fillStyle='#F8FAFC'; c.beginPath(); c.roundRect(w*0.03,-h*0.018,w*0.02,h*0.036,3); c.fill();
    c.restore();
    c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.013)}px Tajawal`; c.textAlign='center';
    c.fillText('💡 ضوء أبيض', boxX, boxY+h*0.11);

    if(S.curId){
      const f = FILTERS_G8L[S.curId];
      // شعاع أبيض قبل المرشح
      c.save(); c.strokeStyle='#F8FAFC'; c.lineWidth=Math.max(4,w*0.012); c.lineCap='round'; c.shadowColor='#fff'; c.shadowBlur=8;
      c.beginPath(); c.moveTo(boxX+w*0.045,boxY); c.lineTo(filterX-filterW/2,filterY); c.stroke(); c.restore();

      // المرشح
      c.save(); c.fillStyle=f.col; c.globalAlpha=0.55; c.strokeStyle=f.col; c.lineWidth=2.5;
      c.beginPath(); c.roundRect(filterX-filterW/2,filterY-filterH/2,filterW,filterH,6); c.fill(); c.stroke(); c.restore();
      c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.013)}px Tajawal`; c.textAlign='center';
      c.fillText('مرشّح', filterX, filterY+filterH/2+h*0.04);

      if(S.fired){
        // شعاع ملون بعد المرشح
        c.save(); c.strokeStyle=f.col; c.lineWidth=Math.max(4,w*0.012); c.lineCap='round'; c.shadowColor=f.col; c.shadowBlur=10;
        c.beginPath(); c.moveTo(filterX+filterW/2,filterY); c.lineTo(w*0.88,filterY); c.stroke(); c.restore();
        c.fillStyle=f.col; c.font=`bold ${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
        c.fillText(`يمرّ: ${f.passes[0]}`, w*0.78, filterY-h*0.045);

        // أسهم ألوان ممتصّة تتوقف عند المرشح
        const absorbed = ['#FACC15','#4338CA','#000000'].filter(x=>x!==f.col);
        absorbed.slice(0,2).forEach((cc,i)=>{
          const ay = filterY - filterH*0.32 + i*filterH*0.64;
          c.save(); c.strokeStyle=g8cMut(dark); c.globalAlpha=0.5; c.lineWidth=2.5; c.lineCap='round';
          c.beginPath(); c.moveTo(filterX-filterW*0.9,ay); c.lineTo(filterX-filterW*0.55,ay); c.stroke(); c.restore();
        });
        c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.012)}px Tajawal`; c.textAlign='center';
        c.fillText('✗ تُمتصّ باقي الألوان', filterX, filterY-filterH/2-h*0.025);
      }
    }

    g8lHeader(c,w,h,dark,'نشاط ٦-٣ · كيف تعمل المرشّحات؟');
    animFrame = requestAnimationFrame(draw);
  }
  const FILTERS_G8L = { red:{col:'#EF4444',passes:['أحمر']}, green:{col:'#22C55E',passes:['أخضر']}, blue:{col:'#3B82F6',passes:['أزرق']} };
  draw();
}

/* تاب ٢: لماذا نرى السيارة حمراء والعشب أخضر؟ (ص٦٥) */
function simG8Bio3N6b(){
  cancelAnimationFrame(animFrame);
  simState = { sunOn:false, revealed:false, dark2:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    if(!S.sunOn){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🚗🌿 لماذا نرى السيارة حمراء والعشب أخضر؟</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:12px">أطلقي أشعة الشمس على السيارة والعشب وراقبي الألوان التي تنعكس نحو أعيننا.</div>
        <button class="ctrl-btn play" onclick="window._g8lSunOn()">☀️ أطلقي أشعة الشمس</button>`;
    }
    if(!S.revealed){
      return `<div class="ctrl-section"><div class="ctrl-label">👀 لاحظي مسار الضوء</div></div>
      <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:12px">لماذا نرى السيارة حمراء والعشب أخضر رغم أنّ ضوء الشمس أبيض؟</div>
      <button class="ctrl-btn play" onclick="window._g8lRevealColors()">💡 اكتشفي السبب</button>`;
    }
    return `
      <div class="ctrl-section"><div class="ctrl-label">🎯 السبب</div></div>
      <div style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:12px">
        يحتوي ضوء الشمس الأبيض على جميع الألوان. <strong style="color:#EF4444">السيارة الحمراء تعكس الضوء الأحمر</strong> وتمتصّ معظم الألوان الأخرى، بينما <strong style="color:#22C55E">العشب يعكس الضوء الأخضر</strong> ويمتصّ معظم الألوان الأخرى. اللون الذي نراه هو لون الضوء الذي ينعكس من الجسم إلى أعيننا.
      </div>
      <button class="ctrl-btn ${S.dark2?'play':'reset'}" onclick="window._g8lToggleSun2()">${S.dark2?'☀️ أعيدي إشعال الشمس':'🌙 أطفئي الشمس'}</button>
      ${S.dark2? `<div style="margin-top:12px;font-size:13px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:13px">هل ستظلّ السيارة تبدو حمراء في الظلام التام؟ لماذا؟<br><span style="font-weight:400;font-size:12.5px;color:var(--text-secondary)">💡 لا — رؤية اللون تحتاج إلى وجود ضوء يصل إلى الجسم ثم ينعكس منه إلى العين. بلا ضوء، لا يوجد شيء لينعكس ونراه.</span></div>` : ''}
    `;
  }
  controls(renderControls());
  window._g8lSunOn = function(){ _g8pPlayClick(); S.sunOn=true; S.beamT=0; controls(renderControls()); };
  window._g8lRevealColors = function(){ _g8pPlayClick(); S.revealed=true; controls(renderControls()); };
  window._g8lToggleSun2 = function(){ _g8pPlayClick(); S.dark2=!S.dark2; controls(renderControls()); };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null; cv.onclick=null;

  function draw(){
    if(currentSim!=='g8bio3n6' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g8cBg(dark); c.fillRect(0,0,w,h);
    const lit = S.sunOn && !S.dark2;

    // الشمس
    const sunX=w*0.16, sunY=h*0.2, sunR=w*0.055;
    c.save();
    c.fillStyle = lit ? '#FDE047' : (dark?'#4B5563':'#D1D5DB');
    c.beginPath(); c.arc(sunX,sunY,sunR,0,Math.PI*2); c.fill();
    if(lit){ c.strokeStyle='#FBBF24'; c.lineWidth=3; for(let i=0;i<8;i++){ const a=i*Math.PI/4;
      c.beginPath(); c.moveTo(sunX+Math.cos(a)*sunR*1.25,sunY+Math.sin(a)*sunR*1.25); c.lineTo(sunX+Math.cos(a)*sunR*1.6,sunY+Math.sin(a)*sunR*1.6); c.stroke(); } }
    c.restore();
    c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
    c.fillText(lit?'☀️ الشمس':'🌙 لا يوجد ضوء', sunX, sunY+sunR+h*0.04);

    // أرضية عشب
    const groundY = h*0.78;
    c.save(); c.fillStyle = lit ? '#4ADE80' : (dark?'#1F2937':'#374151'); c.fillRect(0,groundY,w,h-groundY); c.restore();

    // السيارة
    const carX=w*0.42, carY=groundY, carW=w*0.24, carH=carW*0.42;
    c.save(); c.translate(carX,carY-carH*0.5);
    c.fillStyle = lit ? '#DC2626' : (dark?'#3F1F1F':'#4B2020'); c.strokeStyle='#7F1D1D'; c.lineWidth=2;
    c.beginPath();
    c.moveTo(-carW*0.45,carH*0.5); c.lineTo(-carW*0.45,-carH*0.1); c.quadraticCurveTo(-carW*0.3,-carH*0.55,-carW*0.05,-carH*0.55);
    c.lineTo(carW*0.2,-carH*0.55); c.quadraticCurveTo(carW*0.4,-carH*0.4,carW*0.45,-carH*0.1); c.lineTo(carW*0.45,carH*0.5); c.closePath();
    c.fill(); c.stroke();
    [-carW*0.28,carW*0.28].forEach(fx=>{ c.fillStyle='#111827'; c.beginPath(); c.arc(fx,carH*0.5,carW*0.13,0,Math.PI*2); c.fill();
      c.fillStyle='#9CA3AF'; c.beginPath(); c.arc(fx,carH*0.5,carW*0.06,0,Math.PI*2); c.fill(); });
    c.restore();
    c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
    c.fillText('🚗 سيارة حمراء', carX, carY+h*0.05);

    // عشبة رمزية (نبتة) بجانب السيارة
    const grassX=w*0.72, grassY=groundY;
    c.save(); c.strokeStyle= lit? '#16A34A':(dark?'#374151':'#1F2937'); c.lineWidth=Math.max(3,w*0.008); c.lineCap='round';
    for(let i=-2;i<=2;i++){ c.beginPath(); c.moveTo(grassX+i*w*0.014,grassY); c.lineTo(grassX+i*w*0.014+w*0.008,grassY-h*0.09-Math.abs(i)*h*0.01); c.stroke(); }
    c.restore();
    c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
    c.fillText('🌿 عشب أخضر', grassX, grassY+h*0.05);

    if(S.sunOn && !S.dark2){
      // أشعة شمس بيضاء إلى السيارة والعشب
      c.save(); c.strokeStyle='#F8FAFC'; c.lineWidth=Math.max(2,w*0.005); c.globalAlpha=0.85; c.setLineDash([]);
      c.beginPath(); c.moveTo(sunX,sunY); c.lineTo(carX,carY-carH*0.5); c.stroke();
      c.beginPath(); c.moveTo(sunX,sunY); c.lineTo(grassX,grassY-h*0.05); c.stroke();
      c.restore();
      if(S.revealed){
        // أشعة منعكسة ملونة نحو عين مشاهد فوق يمين المشهد
        const eyeX=w*0.9, eyeY=h*0.14;
        c.save(); c.fillStyle=dark?'#2A1F1A':'#fff'; c.strokeStyle=g8cMut(dark); c.lineWidth=2;
        c.beginPath(); c.ellipse(eyeX,eyeY,w*0.03,h*0.02,0,0,Math.PI*2); c.fill(); c.stroke();
        c.fillStyle='#3B2A1A'; c.beginPath(); c.arc(eyeX,eyeY,w*0.01,0,Math.PI*2); c.fill(); c.restore();
        c.fillStyle=g8cMut(dark); c.font=`${Math.round(h*0.013)}px Tajawal`; c.textAlign='center'; c.fillText('👁️ العين', eyeX, eyeY-h*0.035);

        c.save(); c.strokeStyle='#EF4444'; c.lineWidth=Math.max(2.5,w*0.006); c.globalAlpha=0.9;
        c.beginPath(); c.moveTo(carX,carY-carH*0.5); c.lineTo(eyeX,eyeY); c.stroke(); c.restore();
        c.save(); c.strokeStyle='#22C55E'; c.lineWidth=Math.max(2.5,w*0.006); c.globalAlpha=0.9;
        c.beginPath(); c.moveTo(grassX,grassY-h*0.05); c.lineTo(eyeX,eyeY); c.stroke(); c.restore();
      }
    }
    if(S.dark2){
      c.fillStyle='#DC2626'; c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
      c.fillText('لا يصل ضوء إلى أعيننا من السيارة أو العشب', w*0.5, h*0.92);
    }

    g8lHeader(c,w,h,dark,'نشاط ٦-٣ · لماذا نرى السيارة حمراء؟');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}
