// ══════════════════════════════════════════════════════════
// الصف الخامس — الوحدة الثالثة: حالات المادة
// ٤-٣(ب) استعادة الملح · ٧-٣(ب) استقصاء الغليان · ٨-٣ استقصاء الانصهار
// ══════════════════════════════════════════════════════════

function g5w2Lerp(a,b,t){ return a+(b-a)*t; }
function g5w2Clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function g5w2Rand(a,b){ return a+Math.random()*(b-a); }
function g5w2MCQ(id, opts){
  return `<div style="display:flex;flex-direction:column;gap:8px">
    ${opts.map((o,i)=>`<button id="${id}${i}" onclick="window._${id}Ans(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:13.5px;text-align:right">${o}</button>`).join('')}
  </div><div id="${id}Fb" style="margin-top:10px;font-size:13.5px;line-height:1.8;color:var(--text-secondary)"></div>`;
}
function g5w2AnswerMCQ(id, i, correctIdx, correctMsg, wrongMsgPrefix){
  const btn = document.getElementById(id+i);
  const ok = i===correctIdx;
  if(btn){ btn.style.background = ok?'#27AE60':'#E74C3C'; btn.style.color='white'; btn.style.borderColor= ok?'#27AE60':'#E74C3C'; }
  if(!ok){ const okBtn=document.getElementById(id+correctIdx); if(okBtn){ okBtn.style.background='#27AE60'; okBtn.style.color='white'; okBtn.style.borderColor='#27AE60'; } }
  const fb=document.getElementById(id+'Fb');
  if(fb) fb.innerHTML = (ok?'💡 أحسنت! ':'💡 ')+correctMsg;
  return ok;
}

/* ══════════════════════════════════════════════════════════
   ٤-٣ (ب) · هل يمكنك استعادة الملح؟
   ══════════════════════════════════════════════════════════ */
function simG5Water2a(){
  cancelAnimationFrame(animFrame);
  simState = { stage:'setup', salt:5, water:50, dissolveT:0, predicted:null, heatT:0, recovered:0,
    q2Done:false, q3Done:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  cv.onclick=null;

  function renderControls(){
    if(S.stage==='setup' || S.stage==='dissolving'){
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🧂 هل يمكنك استعادة الملح؟</div></div>
        <div style="font-size:13.5px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:12px;margin-bottom:10px">
          يأتي معظم الملح الذي نضعه على الطعام من ماء البحر. كيف يمكننا الحصول على الملح من ماء البحر؟
        </div>
        <div class="ctrl-row">
          <div class="ctrl-name">كتلة الملح <span class="ctrl-val">${S.salt} g</span></div>
          <input type="range" min="1" max="15" step="1" value="${S.salt}" ${S.stage!=='setup'?'disabled':''} oninput="window._g5w2Salt(+this.value)">
        </div>
        <div class="ctrl-row">
          <div class="ctrl-name">حجم الماء <span class="ctrl-val">${S.water} ml</span></div>
          <input type="range" min="20" max="80" step="5" value="${S.water}" ${S.stage!=='setup'?'disabled':''} oninput="window._g5w2Water(+this.value)">
        </div>
        <button class="ctrl-btn play" style="margin-top:10px" onclick="window._g5w2Dissolve()" ${S.stage!=='setup'?'disabled':''}>١) أذب الملح في الماء</button>`;
    }
    if(S.stage==='predict'){
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">✓ تمّ إذابة الملح — لا يمكن رؤيته الآن</div></div>
        <div style="font-size:14.5px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:10px">٢) تنبّئي: ماذا سيحدث عند تبخير المحلول؟</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${['سيبقى الملح صلباً في قاع الوعاء','سيتبخّر الملح مع الماء ولن يتبقى شيء','سيتحوّل الملح إلى سائل'].map((o,i)=>`<button onclick="window._g5w2Predict(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:13.5px">${o}</button>`).join('')}
        </div>`;
    }
    if(S.stage==='ready'){
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🔥 جاهزة للتسخين</div></div>
        <div style="font-size:13.5px;color:var(--text-secondary);margin-bottom:10px">تنبّؤك مسجَّل. اضغطي لتسخين المحلول وملاحظة ما يحدث.</div>
        <button class="ctrl-btn play" onclick="window._g5w2Heat()">٣) سخّني المحلول للتبخير</button>`;
    }
    if(S.stage==='heating'){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">⏳ يتبخّر الماء...</div></div>
        <div style="font-size:13.5px;color:var(--text-secondary)">راقبي مستوى المحلول والبخار المتصاعد.</div>`;
    }
    if(S.stage==='result'){
      const correct = S.predicted===0;
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">${correct?'✅ اكتمل التبخير!':'⚠️ اكتمل التبخير — راجعي تنبّؤك'}</div></div>
        <div style="font-size:14px;line-height:1.9;color:var(--text-secondary);background:${correct?'rgba(39,174,96,0.12)':'rgba(231,76,60,0.1)'};border-radius:10px;padding:13px;margin-bottom:12px">
          تبخّر الماء بالكامل تقريباً، واستُعيد نحو <strong>${S.recovered} g</strong> من الملح الصلب في قاع الوعاء.<br>
          السبب: درجة غليان الماء أقلّ بكثير من درجة انصهار الملح، لذا يتحوّل الماء إلى بخار ويتصاعد، بينما يبقى الملح صلباً لأنّه لا يتبخّر عند هذه الحرارة.
        </div>
        <button class="ctrl-btn play" onclick="window._g5w2Q2()">➡ أكمل الاستنتاج</button>`;
    }
    if(S.stage==='q2'){
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:15.5px">أكملي: لقد اكتشفتِ أنّه كان من ____ فصل المادّة الصلبة عن السائلة باستخدام التبخير.</div></div>
        ${g5w2MCQ('g5w2q2', ['الممكن','غير الممكن'])}`;
    }
    return `
      <div class="ctrl-section"><div class="ctrl-label" style="font-size:15.5px">ما اسم المادّة الصلبة (الملح) التي ذابت لتكوين المحلول؟</div></div>
      ${g5w2MCQ('g5w2q3', ['مادّة مذابة','مادّة مذيبة','بلّورة'])}
      ${S.q3Done? `<button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g5w2Restart()">↺ أعد النشاط</button>`:''}
    `;
  }
  controls(renderControls());

  window._g5w2Salt = function(v){ S.salt=v; controls(renderControls()); };
  window._g5w2Water = function(v){ S.water=v; controls(renderControls()); };
  window._g5w2Dissolve = function(){ _g8pPlayDrop(); S.stage='dissolving'; S.dissolveT=0.0001; controls(renderControls()); };
  window._g5w2Predict = function(i){ _g8pPlayClick(); S.predicted=i; S.stage='ready'; controls(renderControls()); };
  window._g5w2Heat = function(){ _g8pPlayClick(); S.stage='heating'; S.heatT=0.0001; controls(renderControls()); };
  window._g5w2Q2 = function(){ _g8pPlayClick(); S.stage='q2'; controls(renderControls()); };
  window._g5w2q2Ans = function(i){
    if(S.q2Done) return; S.q2Done=true;
    g5w2AnswerMCQ('g5w2q2', i, 0, 'التبخير يفصل المذاب الصلب (الملح) عن المذيب السائل (الماء) بترك السائل يتحوّل إلى بخار.');
    setTimeout(()=>{ S.stage='q3'; controls(renderControls()); }, 1400);
  };
  window._g5w2q3Ans = function(i){
    if(S.q3Done) return; S.q3Done=true;
    g5w2AnswerMCQ('g5w2q3', i, 0, 'المادّة المذابة هي المادّة التي تذوب (الملح)، أمّا المادّة المذيبة فهي السائل الذي يذوب فيه (الماء).');
    setTimeout(()=>controls(renderControls()), 300);
  };
  window._g5w2Restart = function(){
    S.stage='setup'; S.dissolveT=0; S.predicted=null; S.heatT=0; S.recovered=0; S.q2Done=false; S.q3Done=false;
    controls(renderControls());
  };

  function draw(){
    if(currentSim!=='g5water2' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g5wBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle=g5wTxt(dark); c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
    c.fillText('٤-٣(ب) · هل يمكنك استعادة الملح؟', w/2, h*0.065);

    if(S.stage==='dissolving'){
      S.dissolveT += 0.05;
      if(S.dissolveT>=1){ S.dissolveT=1; S.stage='predict'; controls(renderControls()); }
    }
    if(S.stage==='heating'){
      S.heatT += 0.012;
      if(S.heatT>=1){
        S.heatT=1;
        const loss = g5w2Rand(0,0.3);
        S.recovered = Math.max(0.1, S.salt-loss).toFixed(1);
        S.stage='result'; controls(renderControls());
      }
    }

    const cupX=w*0.5, cupY=h*0.34, cupW=w*0.34, cupH=h*0.42;
    c.strokeStyle=g5wMut(dark); c.lineWidth=w*0.006; c.lineCap='round';
    c.beginPath(); c.moveTo(cupX-cupW/2,cupY); c.lineTo(cupX-cupW/2,cupY+cupH); c.lineTo(cupX+cupW/2,cupY+cupH); c.lineTo(cupX+cupW/2,cupY); c.stroke();

    let level = 1;
    if(S.stage==='heating') level = g5w2Lerp(1,0.05,S.heatT);
    if(S.stage==='result' || S.stage==='q2' || S.stage==='q3') level=0.05;

    c.save();
    c.beginPath(); c.rect(cupX-cupW/2,cupY,cupW,cupH); c.clip();
    c.fillStyle = dark?'rgba(56,189,248,0.35)':'rgba(49,172,208,0.5)';
    c.fillRect(cupX-cupW/2, cupY+cupH*(1-level), cupW, cupH*level);
    // حبيبات الملح قبل الإذابة
    if(S.stage==='setup' || (S.stage==='dissolving' && S.dissolveT<1)){
      const n = Math.min(14, Math.round(S.salt*1.4));
      const fadeAlpha = S.stage==='dissolving' ? (1-S.dissolveT) : 1;
      c.globalAlpha = fadeAlpha;
      c.fillStyle='#fff';
      for(let i=0;i<n;i++){
        const gx = cupX-cupW*0.35+ (i*37%(cupW*0.7));
        const gy = cupY+cupH*0.86 + (i*19%(cupH*0.08));
        c.fillRect(gx,gy,w*0.007,w*0.007);
      }
      c.globalAlpha=1;
    }
    // بلورات بعد التبخر
    if(S.stage==='result' || S.stage==='q2' || S.stage==='q3'){
      const n = Math.min(20, Math.round(S.salt*2));
      c.fillStyle='#fff'; c.strokeStyle='#cbd5e1'; c.lineWidth=0.6;
      for(let i=0;i<n;i++){
        const gx = cupX-cupW*0.4+ (i*29%(cupW*0.8));
        const gy = cupY+cupH*0.9 + (i*13%(cupH*0.06));
        c.fillRect(gx,gy,w*0.008,w*0.008); c.strokeRect(gx,gy,w*0.008,w*0.008);
      }
    }
    c.restore();

    // بخار متصاعد أثناء التسخين
    if(S.stage==='heating'){
      if(!S._steam) S._steam = Array.from({length:8},()=>({nx:g5w2Rand(0.3,0.7), ny:g5w2Rand(0.6,1.1), sp:g5w2Rand(0.006,0.014)}));
      S._steam.forEach(st=>{
        st.ny -= st.sp;
        if(st.ny<-0.1){ st.ny=1.05; st.nx=g5w2Rand(0.3,0.7); }
        c.globalAlpha = g5w2Clamp(1-st.ny,0.05,0.5);
        c.fillStyle = dark?'#E5F6FD':'#fff';
        c.beginPath(); c.arc(cupX-cupW/2+st.nx*cupW, cupY+st.ny*cupH, w*0.016,0,Math.PI*2); c.fill();
      });
      c.globalAlpha=1;
      // لهب
      const flameY=cupY+cupH+h*0.05;
      c.fillStyle='#4B5563'; c.fillRect(cupX-cupW*0.5,flameY,cupW,h*0.03);
      for(let i=-2;i<=2;i++){
        const fx=cupX+i*cupW*0.16, fh=h*0.03*(0.7+0.3*Math.sin(performance.now()*0.01+i*2));
        c.fillStyle='#F97316';
        c.beginPath(); c.moveTo(fx,flameY); c.quadraticCurveTo(fx-w*0.01,flameY-fh*0.6,fx,flameY-fh); c.quadraticCurveTo(fx+w*0.01,flameY-fh*0.6,fx,flameY); c.fill();
      }
    }

    c.fillStyle=g5wMut(dark); c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
    c.fillText(S.stage==='setup'?`${S.salt}g ملح + ${S.water}ml ماء`:'', cupX, cupY-h*0.02);

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   ٧-٣ (ب) · استقصاء درجة غليان الماء
   ══════════════════════════════════════════════════════════ */
function simG5Water3a(){
  cancelAnimationFrame(animFrame);
  simState = { stage:'intro', t:0, playing:false, timer:null, speed:1, log:[], boiled:false, qIdx:0 };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  cv.onclick=null;
  const MAXT=16;
  function tempAt(t){ return Math.min(100, 20+t*10); }

  const QUESTIONS = [
    { q:'ما درجة الحرارة التي بدأ عندها الماء بالغليان؟', opts:['80°C','90°C','100°C','110°C'], correct:2, fb:'درجة غليان الماء النقي هي ١٠٠°C عند الضغط الجوي العادي.' },
    { q:'هل ازدادت درجة الحرارة بعدما بدأ الماء في الغليان؟', opts:['نعم استمرّت بالارتفاع بسرعة','لا، بقيت ثابتة لأنّ الطاقة تُستخدم لتحويل الماء إلى بخار','نعم لكن ببطء شديد'], correct:1, fb:'تبقى الحرارة ثابتة عند ١٠٠°C أثناء الغليان، لأنّ الطاقة المضافة تُستخدم لتحويل الماء السائل إلى بخار بدل رفع الحرارة.' },
    { q:'ما الفقاعات الموجودة في الماء المغلي؟', opts:['فقاعات هواء عادية','فقاعات من بخار الماء (الحالة الغازية للماء)','فقاعات صابون'], correct:1, fb:'الفقاعات هي بخار ماء تكوّن من تحوّل الماء السائل القريب من مصدر الحرارة إلى غاز، فيرتفع لأنّ كثافته أقلّ.' },
  ];

  function renderControls(){
    if(S.stage==='intro'){
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🔬 استقصاء درجة غليان الماء</div></div>
        <div style="font-size:13.5px;line-height:1.9;color:var(--text-secondary);background:rgba(231,76,60,0.08);border-right:4px solid #E74C3C;border-radius:8px;padding:12px;margin-bottom:12px">
          ⚠️ <strong>الأمن والسلامة:</strong> يمكن أن يشكّل الماء المغلي والبخار خطورة ويسبّبان الحروق. لا تلمسي الدورق الساخن.
        </div>
        <div style="font-size:13.5px;color:var(--text-secondary);margin-bottom:10px">سيقوم معلّمك بغلي كمّية من الماء، وستقيسين درجة الحرارة كلّ دقيقتين حتى يغلي الماء.</div>
        <button class="ctrl-btn play" onclick="window._g5w3Start()">🔥 بدء التسخين</button>`;
    }
    const rows = S.log.map(r=>`<tr><td style="padding:5px;border-bottom:1px solid var(--border-color,#ddd);text-align:center">${r.t}</td><td style="padding:5px;border-bottom:1px solid var(--border-color,#ddd);text-align:center">${r.temp.toFixed(1)}</td><td style="padding:5px;border-bottom:1px solid var(--border-color,#ddd);text-align:center;font-size:12px">${r.status}</td></tr>`).join('');
    if(S.stage==='running' || S.stage==='finished'){
      let html = `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">📈 التجربة جارية</div></div>
        <div style="display:flex;gap:8px;margin-bottom:10px">
          <button class="ctrl-btn ${S.playing?'stop':'play'}" style="flex:1" onclick="window._g5w3Toggle()">${S.playing?'⏸ إيقاف':'▶ استمرار'}</button>
          <button class="ctrl-btn action" style="flex:1" onclick="window._g5w3Speed()">تسريع ×${S.speed}</button>
        </div>
        <div style="max-height:150px;overflow-y:auto;border:1px solid var(--border-color,#ddd);border-radius:8px;margin-bottom:10px">
          <table style="width:100%;border-collapse:collapse;font-size:12.5px">
            <thead><tr style="background:var(--bg-card2)"><th style="padding:5px">الزمن (د)</th><th style="padding:5px">الحرارة °C</th><th style="padding:5px">الملاحظة</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
      if(S.stage==='finished'){
        html += `<button class="ctrl-btn play" onclick="window._g5w3Q()">➡ أسئلة الاستقصاء</button>`;
      }
      return html;
    }
    if(S.stage==='question'){
      if(S.qIdx>=QUESTIONS.length){
        return `
          <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">💡 ماذا تعلّمنا؟</div></div>
          <div style="padding:13px;background:var(--bg-card2);border-radius:10px;font-size:14px;line-height:1.9;color:var(--text-secondary)">
            عندما يغلي الماء فإنّه يتحوّل من سائل إلى غاز يُطلق عليه اسم <strong>بخار</strong>. تكتسب جزيئات الماء السائل طاقة عند تسخينها ثمّ تتحوّل إلى غاز. درجة غليان الماء النقي هي <strong>١٠٠°C</strong>.
          </div>
          <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g5w3Restart()">↺ أعد الاستقصاء</button>`;
      }
      const cur = QUESTIONS[S.qIdx];
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:15px">سؤال ${S.qIdx+1} من ${QUESTIONS.length}: ${cur.q}</div></div>
        ${g5w2MCQ('g5w3q', cur.opts)}`;
    }
  }
  controls(renderControls());

  function logRow(t,temp){
    let status = temp<100?'تسخين مستمرّ':'غليان وبخار (حرارة ثابتة)';
    if(temp>=100 && !S.boiled){ status='🔥 بدأ الغليان!'; S.boiled=true; }
    S.log.push({t,temp,status});
  }

  window._g5w3Start = function(){
    _g8pPlayClick(); S.stage='running'; S.playing=true; S.t=0; S.log=[]; S.boiled=false;
    logRow(0,20);
    controls(renderControls());
    S.timer = setInterval(()=>{
      S.t++;
      const temp = tempAt(S.t);
      if(S.t%2===0) logRow(S.t,temp);
      if(S.t>=MAXT){ S.playing=false; clearInterval(S.timer); S.timer=null; S.stage='finished'; }
      controls(renderControls());
    }, 900/S.speed);
  };
  window._g5w3Toggle = function(){
    _g8pPlayClick();
    if(S.playing){ S.playing=false; clearInterval(S.timer); S.timer=null; }
    else {
      S.playing=true;
      S.timer = setInterval(()=>{
        S.t++;
        const temp = tempAt(S.t);
        if(S.t%2===0) logRow(S.t,temp);
        if(S.t>=MAXT){ S.playing=false; clearInterval(S.timer); S.timer=null; S.stage='finished'; }
        controls(renderControls());
      }, 900/S.speed);
    }
    controls(renderControls());
  };
  window._g5w3Speed = function(){
    _g8pPlayClick(); S.speed = S.speed===1?2:(S.speed===2?3:1);
    if(S.playing){ clearInterval(S.timer);
      S.timer = setInterval(()=>{
        S.t++;
        const temp = tempAt(S.t);
        if(S.t%2===0) logRow(S.t,temp);
        if(S.t>=MAXT){ S.playing=false; clearInterval(S.timer); S.timer=null; S.stage='finished'; }
        controls(renderControls());
      }, 900/S.speed);
    }
    controls(renderControls());
  };
  window._g5w3Q = function(){ _g8pPlayClick(); S.stage='question'; S.qIdx=0; controls(renderControls()); };
  window._g5w3qAns = function(i){
    const cur = QUESTIONS[S.qIdx];
    g5w2AnswerMCQ('g5w3q', i, cur.correct, cur.fb);
    setTimeout(()=>{ S.qIdx++; controls(renderControls()); }, 1500);
  };
  window._g5w3Restart = function(){
    if(S.timer){ clearInterval(S.timer); S.timer=null; }
    S.stage='intro'; S.t=0; S.playing=false; S.speed=1; S.log=[]; S.boiled=false; S.qIdx=0;
    controls(renderControls());
  };

  function draw(){
    if(currentSim!=='g5water3' || currentTab!==0){
      cancelAnimationFrame(animFrame);
      if(S.timer){ clearInterval(S.timer); S.timer=null; }
      return;
    }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g5wBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle=g5wTxt(dark); c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
    c.fillText('٧-٣(ب) · استقصاء درجة غليان الماء', w/2, h*0.065);

    const temp = S.stage==='intro'?20:tempAt(S.t);
    const cupX=w*0.27, cupY=h*0.32, cupW=w*0.26, cupH=h*0.38;
    c.strokeStyle=g5wMut(dark); c.lineWidth=w*0.006; c.lineCap='round';
    c.beginPath(); c.moveTo(cupX-cupW/2,cupY); c.lineTo(cupX-cupW/2,cupY+cupH); c.lineTo(cupX+cupW/2,cupY+cupH); c.lineTo(cupX+cupW/2,cupY); c.stroke();
    c.save(); c.beginPath(); c.rect(cupX-cupW/2,cupY,cupW,cupH); c.clip();
    c.fillStyle = dark?'rgba(56,189,248,0.32)':'rgba(49,172,208,0.5)';
    c.fillRect(cupX-cupW/2,cupY+cupH*0.15,cupW,cupH*0.9);
    if(!S._parts) S._parts = Array.from({length:14},()=>({nx:Math.random(),ny:g5w2Rand(0.2,0.95),vx:g5w2Rand(-1,1),vy:g5w2Rand(-1,1)}));
    const speedF = g5w2Lerp(0.4,2.2,(temp-20)/80);
    S._parts.forEach(p=>{
      p.nx+=p.vx*0.004*speedF; p.ny+=p.vy*0.004*speedF;
      if(p.nx<0.05||p.nx>0.95) p.vx*=-1; if(p.ny<0.2||p.ny>0.95) p.vy*=-1;
      p.nx=g5w2Clamp(p.nx,0.05,0.95); p.ny=g5w2Clamp(p.ny,0.2,0.95);
      c.fillStyle= dark?'#7DD3FC':'#0369A1';
      c.beginPath(); c.arc(cupX-cupW/2+p.nx*cupW, cupY+p.ny*cupH, w*0.007,0,Math.PI*2); c.fill();
    });
    if(temp>=70){
      if(!S._bub) S._bub = Array.from({length:8},()=>({nx:g5w2Rand(0.2,0.8),ny:g5w2Rand(0.3,1),sp:g5w2Rand(0.004,0.009)}));
      S._bub.forEach(b=>{ b.ny -= b.sp*(temp>=100?1.8:1); if(b.ny<0.15){b.ny=1;b.nx=g5w2Rand(0.2,0.8);}
        c.strokeStyle= dark?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.9)'; c.lineWidth=1.5;
        c.beginPath(); c.arc(cupX-cupW/2+b.nx*cupW, cupY+b.ny*cupH, w*0.01,0,Math.PI*2); c.stroke();
      });
    }
    c.restore();
    if(temp>=100){
      if(!S._steam) S._steam = Array.from({length:7},()=>({nx:g5w2Rand(0.25,0.75),ny:g5w2Rand(0.6,1.1),sp:g5w2Rand(0.005,0.011)}));
      S._steam.forEach(st=>{ st.ny-=st.sp; if(st.ny<-0.1){st.ny=1.05;st.nx=g5w2Rand(0.25,0.75);}
        c.globalAlpha=g5w2Clamp(1-st.ny,0.05,0.5); c.fillStyle= dark?'#E5F6FD':'#fff';
        c.beginPath(); c.arc(cupX-cupW/2+st.nx*cupW, cupY+st.ny*cupH, w*0.016,0,Math.PI*2); c.fill();
      });
      c.globalAlpha=1;
    }
    if(S.stage!=='intro'){
      const flameY=cupY+cupH+h*0.045;
      c.fillStyle='#4B5563'; c.fillRect(cupX-cupW*0.5,flameY,cupW,h*0.03);
      for(let i=-2;i<=2;i++){
        const fx=cupX+i*cupW*0.16, fh=h*0.028*(0.7+0.3*Math.sin(performance.now()*0.01+i*2));
        c.fillStyle='#F97316';
        c.beginPath(); c.moveTo(fx,flameY); c.quadraticCurveTo(fx-w*0.01,flameY-fh*0.6,fx,flameY-fh); c.quadraticCurveTo(fx+w*0.01,flameY-fh*0.6,fx,flameY); c.fill();
      }
    }

    // ميزان الحرارة
    const thX=w*0.52, thY=h*0.16, thH=h*0.42;
    c.strokeStyle=g5wMut(dark); c.lineWidth=w*0.007; c.lineCap='round';
    c.beginPath(); c.moveTo(thX,thY); c.lineTo(thX,thY+thH); c.stroke();
    c.fillStyle=dark?'#1E2A38':'#fff'; c.beginPath(); c.arc(thX,thY+thH+h*0.018,w*0.018,0,Math.PI*2); c.fill();
    c.strokeStyle=g5wMut(dark); c.lineWidth=2; c.beginPath(); c.arc(thX,thY+thH+h*0.018,w*0.018,0,Math.PI*2); c.stroke();
    const fillFrac = g5w2Clamp((temp-15)/95,0.06,0.98);
    c.strokeStyle='#E74C3C'; c.lineWidth=w*0.012; c.lineCap='round';
    c.beginPath(); c.moveTo(thX,thY+thH*(1-fillFrac)); c.lineTo(thX,thY+thH+h*0.014); c.stroke();
    c.fillStyle='#E74C3C'; c.beginPath(); c.arc(thX,thY+thH+h*0.018,w*0.022,0,Math.PI*2); c.fill();
    c.fillStyle=g5wTxt(dark); c.font=`bold ${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText(temp.toFixed(1)+'°C', thX, thY-h*0.02);

    // رسم بياني
    const gx=w*0.68, gy=h*0.18, gw=w*0.28, gh=h*0.38;
    c.strokeStyle=g5wMut(dark); c.lineWidth=1.5;
    c.beginPath(); c.moveTo(gx,gy); c.lineTo(gx,gy+gh); c.lineTo(gx+gw,gy+gh); c.stroke();
    c.fillStyle=g5wTxt(dark); c.font=`bold ${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
    c.fillText('الحرارة/الزمن', gx+gw/2, gy-h*0.015);
    if(S.log.length>1){
      c.strokeStyle=g5wAccent(dark); c.lineWidth=w*0.005;
      c.beginPath();
      S.log.forEach((r,i)=>{
        const px=gx+(r.t/MAXT)*gw, py=gy+gh-((r.temp-20)/85)*gh;
        i===0?c.moveTo(px,py):c.lineTo(px,py);
      });
      c.stroke();
      S.log.forEach(r=>{
        const px=gx+(r.t/MAXT)*gw, py=gy+gh-((r.temp-20)/85)*gh;
        c.fillStyle=g5wAccent(dark); c.beginPath(); c.arc(px,py,w*0.006,0,Math.PI*2); c.fill();
      });
    }

    c.fillStyle=g5wMut(dark); c.font=`${Math.round(h*0.017)}px Tajawal`; c.textAlign='center';
    c.fillText(S.stage==='intro'?'اضغطي "بدء التسخين"':'الزمن: '+S.t+' دقيقة', w*0.27, h*0.86);

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   ٨-٣ · استقصاء درجة انصهار الثلج
   ══════════════════════════════════════════════════════════ */
function simG5Water4a(){
  cancelAnimationFrame(animFrame);
  simState = { stage:'setup', salt:0, iceAmt:8, t:0, playing:false, timer:null, log:[], qIdx:0 };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  cv.onclick=null;
  const startTemp=-6, warmupLen=4, postMeltLen=8;
  const QUESTIONS = [
    { q:'ما درجة الحرارة التي ينصهر عندها الثلج النقي (بدون ملح)؟', opts:['-5°C','0°C','5°C','10°C'], correct:1, fb:'درجة انصهار الثلج النقي هي ٠°C، وهي نفسها درجة تجمّد الماء.' },
    { q:'كيف يؤثّر وضع الملح في درجة انصهار الثلج؟', opts:['يخفضها، فيذوب الثلج عند حرارة أقلّ من الصفر','يرفعها فيحتاج الثلج حرارة أعلى لينصهر','لا يؤثّر إطلاقاً'], correct:0, fb:'يخفض الملح درجة انصهار الثلج، ولهذا نستخدم الملح لإذابة الثلوج المتجمّدة على الطرق في الشتاء.' },
  ];
  function meltTemp(){ return S.salt===0?0:(S.salt===1?-2:-4); }

  function renderControls(){
    if(S.stage==='setup'){
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🧊 استقصاء درجة انصهار الثلج</div></div>
        <div style="font-size:13.5px;color:var(--text-secondary);margin-bottom:10px">اضبطي كمّية الثلج والملح، ثمّ ابدئي التجربة وراقبي درجة الحرارة أثناء انصهار الثلج.</div>
        <div class="ctrl-row"><div class="ctrl-name">كمّية الثلج</div></div>
        <div class="ctrl-btns-grid-1" style="margin-bottom:8px">
          ${['صغيرة','متوسطة','كبيرة'].map((l,i)=>`<button class="ctrl-btn ${S.iceAmt===[5,8,11][i]?'active':''}" onclick="window._g5w4Ice(${[5,8,11][i]})">${l}</button>`).join('')}
        </div>
        <div class="ctrl-row"><div class="ctrl-name">الملح المضاف</div></div>
        <div class="ctrl-btns-grid-1" style="margin-bottom:10px">
          ${['بدون ملح','ملح قليل','ملح كثير'].map((l,i)=>`<button class="ctrl-btn ${S.salt===i?'active':''}" onclick="window._g5w4Salt(${i})">${l}</button>`).join('')}
        </div>
        <button class="ctrl-btn play" onclick="window._g5w4Start()">▶ ابدئي التجربة</button>`;
    }
    const rows = S.log.map(r=>`<tr><td style="padding:5px;border-bottom:1px solid var(--border-color,#ddd);text-align:center">${r.t}</td><td style="padding:5px;border-bottom:1px solid var(--border-color,#ddd);text-align:center">${r.temp.toFixed(1)}</td></tr>`).join('');
    if(S.stage==='running' || S.stage==='finished'){
      let html = `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">📈 التجربة جارية</div></div>
        <div style="max-height:150px;overflow-y:auto;border:1px solid var(--border-color,#ddd);border-radius:8px;margin-bottom:10px">
          <table style="width:100%;border-collapse:collapse;font-size:12.5px">
            <thead><tr style="background:var(--bg-card2)"><th style="padding:5px">الزمن (د)</th><th style="padding:5px">الحرارة °C</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
      if(S.stage==='finished') html += `<button class="ctrl-btn play" onclick="window._g5w4Q()">➡ أسئلة الاستقصاء</button>`;
      return html;
    }
    if(S.stage==='question'){
      if(S.qIdx>=QUESTIONS.length){
        return `
          <div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">💡 ماذا تعلّمنا؟</div></div>
          <div style="padding:13px;background:var(--bg-card2);border-radius:10px;font-size:14px;line-height:1.9;color:var(--text-secondary)">
            يحدث الانصهار عندما تتحوّل المادّة الصلبة إلى سائلة. تكتسب جزيئات المادّة الصلبة طاقة حرارية عند تسخينها فتتحوّل إلى سائل. درجة انصهار الثلج النقي هي <strong>٠°C</strong>.
          </div>
          <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g5w4Restart()">↺ أعد الاستقصاء</button>`;
      }
      const cur = QUESTIONS[S.qIdx];
      return `
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:15px">سؤال ${S.qIdx+1} من ${QUESTIONS.length}: ${cur.q}</div></div>
        ${g5w2MCQ('g5w4q', cur.opts)}`;
    }
  }
  controls(renderControls());

  function tempAt(t){
    const mt = meltTemp();
    if(t<=warmupLen){ const f=t/warmupLen; return startTemp+(mt-startTemp)*f; }
    if(t<=warmupLen+S.iceAmt){ return mt; }
    let j=t-(warmupLen+S.iceAmt), tt=mt;
    for(let k=0;k<j;k++) tt = tt+(25-tt)*0.2;
    return tt;
  }

  window._g5w4Ice = function(v){ S.iceAmt=v; controls(renderControls()); };
  window._g5w4Salt = function(v){ S.salt=v; controls(renderControls()); };
  window._g5w4Start = function(){
    _g8pPlayClick(); S.stage='running'; S.playing=true; S.t=0; S.log=[{t:0,temp:startTemp}];
    controls(renderControls());
    const total = warmupLen+S.iceAmt+postMeltLen;
    S.timer = setInterval(()=>{
      S.t++;
      const temp = tempAt(S.t);
      S.log.push({t:S.t,temp});
      if(S.t>=total){ S.playing=false; clearInterval(S.timer); S.timer=null; S.stage='finished'; }
      controls(renderControls());
    }, 500);
  };
  window._g5w4Q = function(){ _g8pPlayClick(); S.stage='question'; S.qIdx=0; controls(renderControls()); };
  window._g5w4qAns = function(i){
    const cur = QUESTIONS[S.qIdx];
    g5w2AnswerMCQ('g5w4q', i, cur.correct, cur.fb);
    setTimeout(()=>{ S.qIdx++; controls(renderControls()); }, 1500);
  };
  window._g5w4Restart = function(){
    if(S.timer){ clearInterval(S.timer); S.timer=null; }
    S.stage='setup'; S.t=0; S.playing=false; S.log=[]; S.qIdx=0; controls(renderControls());
  };

  function draw(){
    if(currentSim!=='g5water4' || currentTab!==0){
      cancelAnimationFrame(animFrame);
      if(S.timer){ clearInterval(S.timer); S.timer=null; }
      return;
    }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g5wBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle=g5wTxt(dark); c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
    c.fillText('٨-٣ · استقصاء درجة انصهار الثلج', w/2, h*0.065);

    const temp = S.log.length? S.log[S.log.length-1].temp : startTemp;
    const total = warmupLen+S.iceAmt+postMeltLen;
    let meltFrac=0;
    if(S.t>warmupLen) meltFrac = g5w2Clamp((S.t-warmupLen)/S.iceAmt,0,1);

    const cupX=w*0.3, cupY=h*0.28, cupW=w*0.28, cupH=h*0.42;
    c.strokeStyle=g5wMut(dark); c.lineWidth=w*0.006; c.lineCap='round';
    c.beginPath(); c.moveTo(cupX-cupW/2,cupY); c.lineTo(cupX-cupW/2,cupY+cupH); c.lineTo(cupX+cupW/2,cupY+cupH); c.lineTo(cupX+cupW/2,cupY); c.stroke();
    c.save(); c.beginPath(); c.rect(cupX-cupW/2,cupY,cupW,cupH); c.clip();
    const waterH = cupH*0.12 + cupH*0.6*meltFrac;
    c.fillStyle= S.t>warmupLen+S.iceAmt ? (dark?'rgba(147,197,253,0.4)':'rgba(191,224,240,0.85)') : (dark?'rgba(200,230,250,0.25)':'rgba(227,242,250,0.85)');
    c.fillRect(cupX-cupW/2, cupY+cupH-waterH, cupW, waterH);
    if(meltFrac<1){
      const cubeSize = cupW*0.22*(1-meltFrac*0.7);
      const positions=[[cupX-cupW*0.28,cupY+cupH-waterH-cubeSize-4],[cupX,cupY+cupH-waterH-cubeSize-10],[cupX+cupW*0.28,cupY+cupH-waterH-cubeSize-2]];
      c.fillStyle= dark?'rgba(224,247,255,0.9)':'#EFF7FB'; c.strokeStyle='#9FD3EA'; c.lineWidth=2;
      positions.forEach(p=>{ c.fillRect(p[0],p[1],cubeSize,cubeSize); c.strokeRect(p[0],p[1],cubeSize,cubeSize); });
    }
    c.restore();

    // ميزان الحرارة
    const thX=w*0.52, thY=h*0.14, thH=h*0.46;
    c.strokeStyle=g5wMut(dark); c.lineWidth=w*0.007; c.lineCap='round';
    c.beginPath(); c.moveTo(thX,thY); c.lineTo(thX,thY+thH); c.stroke();
    c.fillStyle=dark?'#1E2A38':'#fff'; c.beginPath(); c.arc(thX,thY+thH+h*0.018,w*0.018,0,Math.PI*2); c.fill();
    c.strokeStyle=g5wMut(dark); c.lineWidth=2; c.beginPath(); c.arc(thX,thY+thH+h*0.018,w*0.018,0,Math.PI*2); c.stroke();
    const fillFrac = g5w2Clamp((temp+8)/33,0.06,0.98);
    c.strokeStyle= temp<0?'#0284C7':'#E74C3C'; c.lineWidth=w*0.012; c.lineCap='round';
    c.beginPath(); c.moveTo(thX,thY+thH*(1-fillFrac)); c.lineTo(thX,thY+thH+h*0.014); c.stroke();
    c.fillStyle= temp<0?'#0284C7':'#E74C3C'; c.beginPath(); c.arc(thX,thY+thH+h*0.018,w*0.022,0,Math.PI*2); c.fill();
    c.fillStyle=g5wTxt(dark); c.font=`bold ${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText(temp.toFixed(1)+'°C', thX, thY-h*0.02);

    // رسم بياني
    const gx=w*0.68, gy=h*0.14, gw=w*0.28, gh=h*0.46;
    c.strokeStyle=g5wMut(dark); c.lineWidth=1.5;
    c.beginPath(); c.moveTo(gx,gy); c.lineTo(gx,gy+gh); c.lineTo(gx+gw,gy+gh); c.stroke();
    c.fillStyle=g5wTxt(dark); c.font=`bold ${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
    c.fillText('الحرارة/الزمن', gx+gw/2, gy-h*0.015);
    c.setLineDash([4,3]); c.strokeStyle='#D85A30'; c.lineWidth=1.3;
    const ym = gy+gh-((meltTemp()+8)/33)*gh;
    c.beginPath(); c.moveTo(gx,ym); c.lineTo(gx+gw,ym); c.stroke(); c.setLineDash([]);
    if(S.log.length>1){
      c.strokeStyle=g5wAccent(dark); c.lineWidth=w*0.005;
      c.beginPath();
      S.log.forEach((r,i)=>{ const px=gx+(r.t/total)*gw, py=gy+gh-((r.temp+8)/33)*gh; i===0?c.moveTo(px,py):c.lineTo(px,py); });
      c.stroke();
    }

    c.fillStyle=g5wMut(dark); c.font=`${Math.round(h*0.017)}px Tajawal`; c.textAlign='center';
    c.fillText(S.stage==='setup'?'اضبطي الخيارات ثمّ ابدئي':'الزمن: '+S.t+' دقيقة', cupX, h*0.86);

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}
