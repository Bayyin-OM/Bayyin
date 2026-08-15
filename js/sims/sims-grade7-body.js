// ══════════════════════════════════════════════════════════
// الصف السابع — الوحدة الأولى
// نشاط ٦-١ · أجهزة جسم الإنسان (كتاب الصف السابع ص٢٤-٢٥)
// ══════════════════════════════════════════════════════════

/* ── تاب ١: من الجهاز المسؤول؟ ── */
function simG7Bio1N6a(){
  cancelAnimationFrame(animFrame);
  const SYSTEMS = {
    nervous:    { label:'الجهاز العصبي', y:0.20, col:'#8B5CF6' },
    respiratory:{ label:'الجهاز التنفسي', y:0.34, col:'#3B82F6' },
    circulatory:{ label:'الجهاز الدوري',  y:0.42, col:'#EF4444' },
    digestive:  { label:'الجهاز الهضمي',  y:0.55, col:'#F59E0B' },
  };
  const SITUATIONS = [
    { text:'"لمستُ كوباً ساخناً فسحبتُ يدي بسرعة."', opts:[['nervous','الجهاز العصبي'],['digestive','الجهاز الهضمي'],['respiratory','الجهاز التنفسي'],['circulatory','الجهاز الدوري']], ans:'nervous' },
    { text:'"أكلتُ تفاحة وتحوّلت إلى مواد غذائية صغيرة يستفيد منها الجسم."', opts:[['respiratory','الجهاز التنفسي'],['digestive','الجهاز الهضمي'],['nervous','الجهاز العصبي'],['circulatory','الجهاز الدوري']], ans:'digestive' },
    { text:'"أخرج جسمي ثاني أكسيد الكربون عند الزفير."', opts:[['circulatory','الجهاز الدوري'],['nervous','الجهاز العصبي'],['respiratory','الجهاز التنفسي'],['digestive','الجهاز الهضمي']], ans:'respiratory' },
    { text:'"بعد أن هُضم الطعام في الأمعاء، كان يجب أن يصل الغذاء إلى جميع أجزاء الجسم."', opts:[['digestive','الجهاز الهضمي'],['respiratory','الجهاز التنفسي'],['circulatory','الجهاز الدوري'],['nervous','الجهاز العصبي']], ans:'circulatory' },
  ];
  simState = { round:0, lit:{}, picked:null, revealed:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    if(S.round>=SITUATIONS.length){
      return `
        <div class="ctrl-section"><div class="ctrl-label">❤️ أحسنتِ!</div></div>
        <div style="padding:14px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(212,60,120,0.3);font-size:13px;color:var(--text-secondary);line-height:1.9">
          جميع أجهزة الجسم تعمل معاً للمحافظة على حياتك. ❤️
        </div>
        <button class="ctrl-btn play" onclick="window._g7bodyTogether()">➡ الأجهزة تعمل معاً</button>
        <button class="ctrl-btn reset" style="margin-top:10px" onclick="window._g7bodyRestart()">↺ أعد النشاط</button>`;
    }
    const s = SITUATIONS[S.round];
    let body = `
      <div class="ctrl-section"><div class="ctrl-label">🧍 من الجهاز المسؤول؟ (${S.round+1} من ٤)</div></div>
      <div style="font-size:14px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px">${s.text}</div>`;
    if(!S.revealed){
      body += `<div style="display:flex;flex-direction:column;gap:8px">
        ${s.opts.map(([id,label])=>`<button onclick="window._g7bodyPick('${id}')" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">${label}</button>`).join('')}
      </div>`;
    } else {
      const ok = S.picked===s.ans;
      body += `<div style="font-size:13px;color:${ok?'#16A34A':'#D97706'};background:${ok?'rgba(39,174,96,0.1)':'#FEF3C7'};border-radius:8px;padding:12px;margin-bottom:12px">
        ${ok?'✅ صحيح! ':'💡 الإجابة الصحيحة: '+SYSTEMS[s.ans].label+'. '}أضاء ${SYSTEMS[s.ans].label} داخل الجسم.
      </div>
      <button class="ctrl-btn play" onclick="window._g7bodyNext()">➡ التالي</button>`;
    }
    return body;
  }
  controls(renderControls());

  window._g7bodyPick = function(id){
    _g8pPlayClick(); S.picked=id; S.revealed=true;
    const s = SITUATIONS[S.round];
    if(id===s.ans){ S.lit[s.ans]=true; _g8pPlayDrop(); }
    controls(renderControls());
  };
  window._g7bodyNext = function(){ _g8pPlayClick(); S.round++; S.picked=null; S.revealed=false; controls(renderControls()); };
  window._g7bodyTogether = function(){ _g8pPlayClick(); Object.keys(SYSTEMS).forEach(k=>S.lit[k]=true); controls(renderControls()); };
  window._g7bodyRestart = function(){ S.round=0; S.lit={}; S.picked=null; S.revealed=false; controls(renderControls()); };
  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null; cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null; cv.onclick=null;

  function draw(){
    if(currentSim!=='g7bio1n6' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7pBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ٦-١ · من الجهاز المسؤول؟', w/2, h*0.06);

    const cx=w*0.5;
    // جسم مبسّط (رأس + جذع)
    c.fillStyle= dark?'#3A3A3A':'#E8DCC8'; c.strokeStyle=g7pMut(dark); c.lineWidth=2;
    c.beginPath(); c.arc(cx,h*0.16,w*0.055,0,Math.PI*2); c.fill(); c.stroke();
    c.beginPath(); c.roundRect(cx-w*0.13,h*0.22,w*0.26,h*0.42,w*0.08); c.fill(); c.stroke();

    Object.keys(SYSTEMS).forEach(id=>{
      const sys = SYSTEMS[id];
      const isLit = !!S.lit[id];
      const pulse = isLit ? (0.85+Math.sin(Date.now()/300)*0.15) : 1;
      c.save();
      c.globalAlpha = isLit ? 1 : 0.18;
      c.fillStyle = sys.col;
      if(isLit){ c.shadowColor=sys.col; c.shadowBlur = w*0.03; }
      c.beginPath(); c.ellipse(cx, h*sys.y, w*0.075*pulse, h*0.05*pulse, 0, 0, Math.PI*2); c.fill();
      c.restore();
      if(isLit){
        c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.014)}px Tajawal`; c.textAlign='right';
        c.fillText(sys.label, cx+w*0.16, h*sys.y+h*0.005);
        c.strokeStyle=sys.col; c.lineWidth=1.5;
        c.beginPath(); c.moveTo(cx+w*0.08,h*sys.y); c.lineTo(cx+w*0.15,h*sys.y); c.stroke();
      }
    });

    if(S.round<SITUATIONS.length && !S.revealed){
      c.fillStyle=g7pMut(dark); c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
      c.fillText('اقرئي الموقف واختاري الجهاز المسؤول 👆', cx, h*0.92);
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ── تاب ٢: رحلة الأكسجين ── */
function simG7Bio1N6b(){
  cancelAnimationFrame(animFrame);
  simState = { started:false, travelT:0, q1Ans:null, q2Ans:null, stage:'travel' };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    if(S.stage==='travel'){
      if(!S.started){
        return `
          <div class="ctrl-section"><div class="ctrl-label">🌬️ رحلة الأكسجين</div></div>
          <div style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:12px">
            الهواء → الجهاز التنفسي → الأكسجين → الدم → خلايا الجسم. اضغطي لمتابعة رحلة الأكسجين.
          </div>
          <button class="ctrl-btn play" onclick="window._g7oxyStart()">▶ تابعي الرحلة</button>`;
      }
      return `
        <div class="ctrl-section"><div class="ctrl-label">🌬️ راقبي جزيئات الأكسجين</div></div>
        <div style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px">
          تدخل جزيئات الأكسجين إلى الرئتين، ثمّ تنتقل إلى الدم، ثمّ تنتقل عبر الأوعية الدموية إلى خلايا الجسم.
        </div>`;
    }
    if(S.stage==='q1'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🤔 سؤال</div></div>
        <div style="font-size:14px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px">أيّ جهاز ساعد على دخول الأكسجين إلى الجسم؟</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${['الجهاز التنفسي','الجهاز الهضمي','الجهاز العصبي'].map((o,i)=>`<button onclick="window._g7oxyQ1(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">${o}</button>`).join('')}
        </div>`;
    }
    if(S.stage==='q2'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🤔 سؤال</div></div>
        <div style="font-size:14px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px">أيّ جهاز ساعد على نقل الأكسجين إلى خلايا الجسم؟</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${['الجهاز العضلي','الجهاز الدوري','الجهاز الهضمي'].map((o,i)=>`<button onclick="window._g7oxyQ2(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">${o}</button>`).join('')}
        </div>`;
    }
    return `
      <div class="ctrl-section"><div class="ctrl-label">🎉 أحسنتِ!</div></div>
      <div style="padding:14px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(212,60,120,0.3);font-size:13px;color:var(--text-secondary);line-height:1.9">
        الجهاز التنفسي يُدخل الأكسجين إلى الجسم، ثمّ يساعد الجهاز الدوري على نقله إلى جميع أجزاء الجسم — الأجهزة تتعاون معاً ولا تعمل منفردة.
      </div>
      <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7oxyRestart()">↺ أعد النشاط</button>`;
  }
  controls(renderControls());

  window._g7oxyStart = function(){ _g8pPlayClick(); S.started=true; S.travelT=0.0001; controls(renderControls()); };
  window._g7oxyQ1 = function(i){
    _g8pPlayClick();
    S.q1Ans=i;
    setTimeout(()=>{ S.stage='q2'; controls(renderControls()); }, i===0?800:1400);
  };
  window._g7oxyQ2 = function(i){
    _g8pPlayClick();
    S.q2Ans=i;
    setTimeout(()=>{ S.stage='done'; controls(renderControls()); }, i===1?800:1400);
  };
  window._g7oxyRestart = function(){
    S.started=false; S.travelT=0; S.q1Ans=null; S.q2Ans=null; S.stage='travel';
    controls(renderControls());
  };
  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null; cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null; cv.onclick=null;

  function draw(){
    if(currentSim!=='g7bio1n6' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7pBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ٦-١ · رحلة الأكسجين', w/2, h*0.06);

    if(S.started && S.travelT<1) S.travelT += 0.006;

    const lungX=w*0.25, lungY=h*0.35, heartX=w*0.5, heartY=h*0.5, cellX=w*0.78, cellY=h*0.68;
    // الرئتان
    c.fillStyle='#93C5FD'; c.strokeStyle='#1D4ED8'; c.lineWidth=2;
    c.beginPath(); c.ellipse(lungX-w*0.03,lungY,w*0.045,h*0.09,0,0,Math.PI*2); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(lungX+w*0.03,lungY,w*0.045,h*0.09,0,0,Math.PI*2); c.fill(); c.stroke();
    c.fillStyle=g7pMut(dark); c.font=`${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
    c.fillText('الرئتان', lungX, lungY+h*0.13);

    // القلب/الجهاز الدوري
    c.fillStyle='#FCA5A5'; c.strokeStyle='#B91C1C'; c.lineWidth=2;
    c.beginPath(); c.arc(heartX,heartY,w*0.04,0,Math.PI*2); c.fill(); c.stroke();
    c.fillStyle=g7pMut(dark); c.fillText('القلب والدم', heartX, heartY+h*0.09);

    // خلايا الجسم
    c.fillStyle='#86EFAC'; c.strokeStyle='#166534'; c.lineWidth=2;
    for(let i=0;i<3;i++){ c.beginPath(); c.arc(cellX, cellY+(i-1)*h*0.05, w*0.02, 0, Math.PI*2); c.fill(); c.stroke(); }
    c.fillStyle=g7pMut(dark); c.fillText('خلايا الجسم', cellX, cellY+h*0.12);

    // مسار الأنابيب
    c.strokeStyle=dark?'rgba(255,255,255,0.2)':'rgba(0,0,0,0.15)'; c.lineWidth=2; c.setLineDash([5,4]);
    c.beginPath(); c.moveTo(lungX,lungY); c.lineTo(heartX,heartY); c.lineTo(cellX,cellY); c.stroke();
    c.setLineDash([]);

    // جزيئات الأكسجين المتحرّكة
    if(S.travelT>0){
      const t = S.travelT;
      for(let i=0;i<4;i++){
        const off = i*0.15;
        const lt = Math.max(0, Math.min(1, (t - off)*1.6));
        if(lt<=0 || lt>=1.3) continue;
        let x,y;
        if(lt<0.5){ const seg=lt/0.5; x=lungX+(heartX-lungX)*seg; y=lungY+(heartY-lungY)*seg; }
        else { const seg=(lt-0.5)/0.5; x=heartX+(cellX-heartX)*seg; y=heartY+(cellY-heartY)*seg; }
        c.fillStyle='#3B82F6';
        c.beginPath(); c.arc(x,y,w*0.012,0,Math.PI*2); c.fill();
        c.fillStyle='#fff'; c.font=`${Math.round(h*0.012)}px Tajawal`; c.textAlign='center';
        c.fillText('O₂', x, y+h*0.004);
      }
    }

    if(S.started && S.travelT>=1 && S.stage==='travel'){
      S.stage='q1'; controls(renderControls());
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}
// ══════════════════════════════════════════════════════════
// الصف السابع — الوحدة الأولى
// نشاط ٧-١ · الهيكل العظمي للإنسان (كتاب الصف السابع ص٢٦-٢٧)
// ══════════════════════════════════════════════════════════

/* ── تاب ١: حارس الأعضاء 🛡️ ── */
function simG7Bio1N7a(){
  cancelAnimationFrame(animFrame);
  const BONES = [
    { id:'skull', label:'الجمجمة', organ:'brain', home:{x:0.15,y:0.24}, hint:'فكّري في العضو الموجود داخل الرأس.' },
    { id:'ribs',  label:'القفص الصدري', organ:'chest', home:{x:0.85,y:0.24}, hint:'أيّ جزء من الهيكل العظمي يحيط بالقلب والرئتين؟' },
  ];
  const ORGANS = {
    brain: { x:0.5, y:0.16, label:'🧠 الدماغ', msg:'أحسنتِ! الجمجمة تحمي الدماغ. 🧠🛡️' },
    chest: { x:0.5, y:0.42, label:'❤️🫁 القلب والرئتان', msg:'أحسنتِ! القفص الصدري يساعد على حماية القلب والرئتين. 🫁❤️' },
  };
  simState = { placed:{}, dragId:null, dragX:0, dragY:0, hint:'', hintT:0, done:false, mode:'build', removedBone:null };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    if(S.mode==='build'){
      const n = Object.keys(S.placed).length;
      if(!S.done){
        return `
          <div class="ctrl-section"><div class="ctrl-label">🛡️ ساعدي حارس الجسم على حماية أعضائه!</div></div>
          <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:10px">اسحبي كل عظمة إلى العضو الذي تحميه (${n} من ٢)</div>
          ${S.hintT>0 ? `<div style="font-size:13px;color:#D97706;background:#FEF3C7;border-radius:8px;padding:10px">💡 ${S.hint}</div>` : ''}`;
      }
      return `
        <div class="ctrl-section"><div class="ctrl-label">🎉 أحسنتِ!</div></div>
        <div style="padding:14px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(39,174,96,0.3);font-size:13px;color:var(--text-secondary);line-height:1.9;margin-bottom:12px">
          يدعّم الهيكل العظمي جسمك ويساعده على الحركة، كما يحمي بعض الأعضاء الرخوة داخل جسمك.
        </div>
        <button class="ctrl-btn play" onclick="window._g7skRemoveMode()">🤔 ماذا يحدث إذا اختفت هذه العظام؟</button>`;
    }
    if(S.mode==='remove'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🤔 ماذا يحدث إذا اختفت هذه العظام؟</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:10px">اختاري عظماً لإزالته وراقبي ماذا يحدث للحماية.</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <button onclick="window._g7skRemove('skull')" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">إزالة الجمجمة</button>
          <button onclick="window._g7skRemove('ribs')" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">إزالة القفص الصدري</button>
        </div>
        ${S.removedBone ? `<div style="margin-top:12px;font-size:13px;color:#D97706;background:#FEF3C7;border-radius:8px;padding:10px">لاحظي: اختفى الدرع عن العضو الذي كانت تحميه هذه العظمة!</div>
        <button class="ctrl-btn play" style="margin-top:10px" onclick="window._g7skWhyQ()">➡ متابعة</button>` : ''}`;
    }
    if(S.mode==='whyq'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🤔 لماذا يحتاج الجسم إلى هذه العظام؟</div></div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${['لحماية بعض الأعضاء الداخلية','لإنتاج الغذاء','لمساعدة الجسم على الهضم','لإنتاج الهواء'].map((o,i)=>`<button id="g7skWhyOpt${i}" onclick="window._g7skWhyAns(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:13px">${o}</button>`).join('')}
        </div>
        <div id="g7skWhyFb" style="margin-top:10px;font-size:13px;color:var(--text-secondary);line-height:1.8"></div>`;
    }
    return `
      <div class="ctrl-section"><div class="ctrl-label">🎉 أحسنتِ!</div></div>
      <div style="padding:14px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(39,174,96,0.3);font-size:13px;color:var(--text-secondary);line-height:1.9">
        لا يدعم الهيكل العظمي جسمك فقط، بل يحمي أيضاً بعض الأعضاء الرخوة بداخله — كالجمجمة التي تحمي الدماغ، والقفص الصدري (الضلوع وعظم القص) الذي يحمي القلب والرئتين.
      </div>
      <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7skRestart()">↺ أعد النشاط</button>`;
  }
  controls(renderControls());

  window._g7skRemoveMode = function(){ _g8pPlayClick(); S.mode='remove'; S.removedBone=null; controls(renderControls()); };
  window._g7skRemove = function(id){ _g8pPlayClick(); S.removedBone=id; controls(renderControls()); };
  window._g7skWhyQ = function(){ _g8pPlayClick(); S.mode='whyq'; controls(renderControls()); };
  window._g7skWhyAns = function(i){
    const ok = i===0; _g8pPlayClick();
    const btn = document.getElementById('g7skWhyOpt'+i);
    if(btn){ btn.style.background= ok?'#27AE60':'#E74C3C'; btn.style.color='white'; btn.style.borderColor= ok?'#27AE60':'#E74C3C'; }
    if(!ok){ const okBtn=document.getElementById('g7skWhyOpt0'); if(okBtn){okBtn.style.background='#27AE60'; okBtn.style.color='white'; okBtn.style.borderColor='#27AE60';} }
    const fb=document.getElementById('g7skWhyFb'); if(fb) fb.innerHTML = ok? '✅ صحيح!' : '💡 الهيكل العظمي يحمي بعض الأعضاء الداخلية.';
    setTimeout(()=>{ S.mode='done2'; controls(renderControls()); }, 1600);
  };
  window._g7skRestart = function(){
    S.placed={}; S.dragId=null; S.hint=''; S.hintT=0; S.done=false; S.mode='build'; S.removedBone=null;
    controls(renderControls());
  };

  function hitBone(p,w,h){
    for(const b of BONES){ if(S.placed[b.id]) continue; const hx=b.home.x*w, hy=b.home.y*h;
      if(Math.hypot(p.x-hx,p.y-hy) < w*0.08) return b; }
    return null;
  }
  function onDown(e){ if(S.mode!=='build' || S.done) return; const p=g7pGp(cv,e); const b=hitBone(p,cv.width,cv.height); if(b){ S.dragId=b.id; S.dragX=p.x; S.dragY=p.y; } }
  function onMove(e){ if(!S.dragId) return; e.preventDefault && e.preventDefault(); const p=g7pGp(cv,e); S.dragX=p.x; S.dragY=p.y; }
  function onUp(){
    if(!S.dragId) return;
    const b = BONES.find(x=>x.id===S.dragId);
    const w=cv.width,h=cv.height;
    const target = ORGANS[b.organ];
    if(Math.hypot(S.dragX-w*target.x, S.dragY-h*target.y) < w*0.13){
      S.placed[b.id]=true; _g8pPlayDrop();
      if(Object.keys(S.placed).length===BONES.length) S.done=true;
    } else {
      _g8pPlayClick(); S.hint=b.hint; S.hintT=120;
    }
    S.dragId=null; controls(renderControls());
  }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;
  cv.onclick=null;

  function drawBody(c,w,h,dark){
    c.fillStyle= dark?'#3A3A3A':'#E8DCC8'; c.strokeStyle=g7pMut(dark); c.lineWidth=2;
    c.beginPath(); c.arc(w*0.5,h*0.16,w*0.055,0,Math.PI*2); c.fill(); c.stroke();
    c.beginPath(); c.roundRect(w*0.37,h*0.22,w*0.26,h*0.42,w*0.08); c.fill(); c.stroke();
  }
  function drawOrganAndShield(c,key,w,h,dark){
    const o = ORGANS[key];
    const boneId = key==='brain' ? 'skull' : 'ribs';
    const protectedNow = S.mode==='build' ? !!S.placed[boneId] : (S.mode!=='build' && S.removedBone!==boneId && (S.mode==='remove'||S.mode==='whyq'||S.mode==='done2'));
    if(protectedNow){
      c.save(); c.globalAlpha=0.35+Math.sin(Date.now()/400)*0.1; c.fillStyle='#60A5FA';
      c.beginPath(); c.arc(w*o.x,h*o.y,w*0.075,0,Math.PI*2); c.fill();
      c.strokeStyle='#2563EB'; c.lineWidth=2; c.globalAlpha=0.8;
      c.beginPath(); c.arc(w*o.x,h*o.y,w*0.075,0,Math.PI*2); c.stroke();
      c.restore();
    }
    c.font=`${Math.round(h*0.045)}px sans-serif`; c.textAlign='center';
    c.fillText(key==='brain'?'🧠':'❤️🫁', w*o.x, h*o.y+h*0.015);
  }

  function draw(){
    if(currentSim!=='g7bio1n7' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7pBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ٧-١ · حارس الأعضاء 🛡️', w/2, h*0.06);

    drawBody(c,w,h,dark);
    drawOrganAndShield(c,'brain',w,h,dark);
    drawOrganAndShield(c,'chest',w,h,dark);

    if(S.mode==='build'){
      BONES.forEach(b=>{
        if(S.placed[b.id] || S.dragId===b.id) return;
        const hx=b.home.x*w, hy=b.home.y*h;
        c.save(); c.fillStyle=dark?'rgba(255,255,255,0.07)':'rgba(255,255,255,0.75)'; c.strokeStyle=g7pMut(dark); c.lineWidth=1.5;
        c.beginPath(); c.roundRect(hx-w*0.09,hy-h*0.05,w*0.18,h*0.1,10); c.fill(); c.stroke();
        c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
        c.fillText(b.label, hx, hy+h*0.006);
        c.restore();
      });
      if(S.dragId){
        const b=BONES.find(x=>x.id===S.dragId);
        c.save(); c.fillStyle='rgba(74,222,128,0.2)'; c.strokeStyle=g7pAccent(dark); c.lineWidth=2;
        c.beginPath(); c.roundRect(S.dragX-w*0.09,S.dragY-h*0.05,w*0.18,h*0.1,10); c.fill(); c.stroke();
        c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
        c.fillText(b.label, S.dragX, S.dragY+h*0.006);
        c.restore();
      }
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ── تاب ٢: أيّ ماصّة تحتاج قوة أكبر لتنثني؟ (نشاط ٧-١ في الكتاب) ── */
function simG7Bio1N7b(){
  cancelAnimationFrame(animFrame);
  const STRAWS = [
    { id:'full',    len:10,   label:'10 سم', force:3 },
    { id:'half',    len:5,    label:'5 سم',  force:6 },
    { id:'quarter', len:2.5,  label:'2.5 سم', force:9 },
  ];
  simState = { stage:'predict', predictId:null, testIdx:0, pulling:false, pullT:0, results:{}, concAns:null, linkAns:null };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    if(S.stage==='predict'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🔮 توقّعي</div></div>
        <div style="font-size:14px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px">أمامك ثلاث ماصّات متماثلة في المادّة والسمك، مختلفة في الطول. أيّها تعتقدين أنها ستحتاج إلى قوّة أكبر لتنثني؟</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${STRAWS.map(s=>`<button onclick="window._g7stPredict('${s.id}')" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">ماصّة ${s.label}</button>`).join('')}
        </div>`;
    }
    if(S.stage==='test'){
      const s = STRAWS[S.testIdx];
      return `
        <div class="ctrl-section"><div class="ctrl-label">🔬 جرّبي (${S.testIdx+1} من ٣)</div></div>
        <div style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;margin-bottom:12px">اضغطي على الميزان الزنبركي واسحبيه برفق لأعلى حتى تنثني ماصّة ${s.label}، وسجّلي قراءة القوّة.</div>
        <button class="ctrl-btn play" onclick="window._g7stPull()" ${S.pulling?'disabled style="opacity:0.5"':''}>${S.pulling?'⏳ جارٍ السحب...':'✋ اسحبي الميزان'}</button>`;
    }
    if(S.stage==='results'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">📊 قارني النتائج</div></div>
        <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:12px">
          <tr style="background:var(--bg-card2)"><th style="padding:8px;border:1px solid #ccc">طول الماصّة</th><th style="padding:8px;border:1px solid #ccc">القوّة (N)</th></tr>
          ${STRAWS.map(s=>`<tr><td style="padding:8px;border:1px solid #ccc;text-align:center">${s.label}</td><td style="padding:8px;border:1px solid #ccc;text-align:center">${S.results[s.id]} N</td></tr>`).join('')}
        </table>
        <div style="font-size:13px;font-weight:700;margin-bottom:8px">ماذا تلاحظين من النتائج؟</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${['كلما قصرت الماصّة احتاجت إلى قوّة أكبر لتنثني','كلما زاد طول الماصّة احتاجت إلى قوّة أكبر لتنثني','لا علاقة لطول الماصّة بالقوّة المطلوبة'].map((o,i)=>`<button id="g7stConcOpt${i}" onclick="window._g7stConclude(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:13px">${o}</button>`).join('')}
        </div>
        <div id="g7stConcFb" style="margin-top:10px;font-size:13px;color:var(--text-secondary);line-height:1.8"></div>`;
    }
    if(S.stage==='compare'){
      const predictedRight = S.predictId==='quarter';
      return `
        <div class="ctrl-section"><div class="ctrl-label">🤔 قارني توقّعك بالنتيجة</div></div>
        <div style="padding:14px;background:var(--bg-card2);border-radius:10px;font-size:13px;color:var(--text-secondary);line-height:1.9;margin-bottom:12px">
          ${predictedRight ? 'توقّعتِ النتيجة الصحيحة! 🎉' : 'توقّعك كان مختلفاً عن النتيجة — وهذا جزء طبيعي من الاستقصاء العلمي، فالتوقّع يمكن أن يتغيّر بناءً على الأدلّة.'}
        </div>
        <button class="ctrl-btn play" onclick="window._g7stLink()">➡ اربطي ذلك بعظامك</button>`;
    }
    if(S.stage==='link'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🦴 من الماصّات إلى العظام</div></div>
        <div style="font-size:14px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px">لماذا لا تكون جميع عظام جسم الإنسان بالشكل والطول نفسه؟</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${['لأن العظام تختلف في شكلها وحجمها بما يتناسب مع الوظائف التي تؤدّيها','لأن بعض العظام أقدم من غيرها','لأن الجسم يختار عشوائياً'].map((o,i)=>`<button id="g7stLinkOpt${i}" onclick="window._g7stLinkAns(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:13px">${o}</button>`).join('')}
        </div>
        <div id="g7stLinkFb" style="margin-top:10px;font-size:13px;color:var(--text-secondary);line-height:1.8"></div>`;
    }
    return `
      <div class="ctrl-section"><div class="ctrl-label">🎉 أحسنتِ!</div></div>
      <div style="padding:14px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(39,174,96,0.3);font-size:13px;color:var(--text-secondary);line-height:1.9">
        اكتشفتِ من خلال التجربة أنّ اختلاف طول الجسم يمكن أن يؤثّر في مقدار القوّة اللازمة للانثناء. وتختلف أطوال العظام وأشكالها بما يتناسب مع الوظائف التي تؤدّيها.
      </div>
      <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7stRestart()">↺ أعد التجربة</button>`;
  }
  controls(renderControls());

  window._g7stPredict = function(id){ _g8pPlayClick(); S.predictId=id; S.stage='test'; S.testIdx=0; controls(renderControls()); };
  window._g7stPull = function(){
    if(S.pulling) return;
    _g8pPlayClick(); S.pulling=true; S.pullT=0.0001;
    controls(renderControls());
  };
  window._g7stConclude = function(i){
    if(S.concAns!==null) return; S.concAns=i;
    const ok = i===0; _g8pPlayClick();
    const btn=document.getElementById('g7stConcOpt'+i);
    if(btn){ btn.style.background=ok?'#27AE60':'#E74C3C'; btn.style.color='white'; btn.style.borderColor=ok?'#27AE60':'#E74C3C'; }
    if(!ok){ const okBtn=document.getElementById('g7stConcOpt0'); if(okBtn){okBtn.style.background='#27AE60'; okBtn.style.color='white'; okBtn.style.borderColor='#27AE60';} }
    const fb=document.getElementById('g7stConcFb'); if(fb) fb.innerHTML = ok?'✅ صحيح!':'💡 لاحظي: كلما قصرت الماصّة زادت القوّة المطلوبة.';
    setTimeout(()=>{ S.stage='compare'; controls(renderControls()); }, 1600);
  };
  window._g7stLink = function(){ _g8pPlayClick(); S.stage='link'; controls(renderControls()); };
  window._g7stLinkAns = function(i){
    if(S.linkAns!==null) return; S.linkAns=i;
    const ok = i===0; _g8pPlayClick();
    const btn=document.getElementById('g7stLinkOpt'+i);
    if(btn){ btn.style.background=ok?'#27AE60':'#E74C3C'; btn.style.color='white'; btn.style.borderColor=ok?'#27AE60':'#E74C3C'; }
    if(!ok){ const okBtn=document.getElementById('g7stLinkOpt0'); if(okBtn){okBtn.style.background='#27AE60'; okBtn.style.color='white'; okBtn.style.borderColor='#27AE60';} }
    const fb=document.getElementById('g7stLinkFb'); if(fb) fb.innerHTML = ok?'✅ صحيح!':'💡 تختلف العظام في شكلها وحجمها بما يتناسب مع وظائفها.';
    setTimeout(()=>{ S.stage='done'; controls(renderControls()); }, 1700);
  };
  window._g7stRestart = function(){
    S.stage='predict'; S.predictId=null; S.testIdx=0; S.pulling=false; S.pullT=0; S.results={}; S.concAns=null; S.linkAns=null;
    controls(renderControls());
  };
  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null; cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null; cv.onclick=null;

  function draw(){
    if(currentSim!=='g7bio1n7' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7pBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ٧-١ · أيّ ماصّة تحتاج قوّة أكبر؟', w/2, h*0.06);

    if(S.pulling){
      S.pullT += 0.02;
      if(S.pullT>=1){
        S.pullT=1; S.pulling=false;
        const s = STRAWS[S.testIdx];
        S.results[s.id] = s.force;
        _g8pPlayDrop();
        setTimeout(()=>{
          S.testIdx++;
          if(S.testIdx>=STRAWS.length) S.stage='results'; 
          S.pullT=0;
          controls(renderControls());
        }, 500);
      }
    }

    if(S.stage==='predict'){
      // اعرض الماصّات الثلاث جنباً إلى جنب
      STRAWS.forEach((s,i)=>{
        const x = w*(0.25+i*0.25), baseY=h*0.75, len=h*0.5*(s.len/10);
        c.strokeStyle='#FBBF24'; c.lineWidth=Math.max(4,w*0.014); c.lineCap='round';
        c.beginPath(); c.moveTo(x,baseY); c.lineTo(x,baseY-len); c.stroke();
        c.fillStyle=g7pTxt(dark); c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
        c.fillText(s.label, x, baseY+h*0.04);
      });
    } else if(S.stage==='test'){
      const s = STRAWS[S.testIdx];
      const cx=w*0.5;
      // الميزان الزنبركي
      const meterTop=h*0.16, meterBot=h*0.5;
      c.strokeStyle=g7pMut(dark); c.lineWidth=3;
      c.beginPath(); c.roundRect(cx-w*0.03,meterTop,w*0.06,meterBot-meterTop,10); c.stroke();
      const needleY = meterTop + (meterBot-meterTop)*0.15 + (meterBot-meterTop)*0.7*S.pullT;
      c.strokeStyle='#EF4444'; c.lineWidth=2;
      c.beginPath(); c.moveTo(cx-w*0.03,needleY); c.lineTo(cx+w*0.03,needleY); c.stroke();
      c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
      c.fillText(`${(s.force*S.pullT).toFixed(1)} N`, cx+w*0.09, needleY);

      // الماصّة تنثني تدريجياً كلما زادت القوة
      const strawY = meterBot+h*0.06, len=h*0.18*(s.len/10)+h*0.03;
      const bendAngle = S.pullT * 0.9;
      c.save(); c.translate(cx,strawY);
      c.strokeStyle='#FBBF24'; c.lineWidth=Math.max(5,w*0.016); c.lineCap='round';
      c.beginPath(); c.moveTo(0,0);
      c.quadraticCurveTo(Math.sin(bendAngle)*len*0.5, len*0.5, Math.sin(bendAngle)*len, len);
      c.stroke();
      c.restore();
      c.fillStyle=g7pMut(dark); c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
      c.fillText(`ماصّة ${s.label}`, cx, strawY+len+h*0.05);
    } else if(S.stage==='results' || S.stage==='compare'){
      // رسم بياني بسيط للنتائج
      const baseY=h*0.7, baseX=w*0.25;
      STRAWS.forEach((s,i)=>{
        const bx = baseX + i*w*0.2;
        const barH = h*0.4*(S.results[s.id]/9);
        c.fillStyle=g7pAccent(dark);
        c.beginPath(); c.roundRect(bx-w*0.05, baseY-barH, w*0.1, barH, 4); c.fill();
        c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
        c.fillText(S.results[s.id]+' N', bx, baseY-barH-h*0.02);
        c.fillStyle=g7pMut(dark); c.font=`${Math.round(h*0.014)}px Tajawal`;
        c.fillText(s.label, bx, baseY+h*0.03);
      });
      c.strokeStyle=g7pMut(dark); c.lineWidth=1.5; c.beginPath(); c.moveTo(w*0.15,baseY); c.lineTo(w*0.85,baseY); c.stroke();
    } else if(S.stage==='link' || S.stage==='done'){
      // انتقال بصري من الماصّات إلى صورة عظام بأطوال مختلفة
      const cx=w*0.5, y=h*0.45;
      const bones = [ {len:0.14,x:-0.22}, {len:0.09,x:0}, {len:0.05,x:0.22} ];
      bones.forEach(b=>{
        c.strokeStyle='#E5DFC8'; c.fillStyle='#F5F0E0'; c.lineWidth=Math.max(6,w*0.02); c.lineCap='round';
        c.beginPath(); c.moveTo(cx+w*b.x, y-h*b.len); c.lineTo(cx+w*b.x, y+h*b.len); c.stroke();
      });
      c.fillStyle=g7pMut(dark); c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
      c.fillText('عظام بأطوال وأشكال مختلفة، بما يتناسب مع وظائفها', cx, y+h*0.22);
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}
