// ══════════════════════════════════════════════════════════
// الصف السابع — الوحدة الأولى
// نشاط ٨-١ · المفاصل (كتاب الصف السابع ص٢٨-٢٩)
// نشاط ٩-١ · العضلات (كتاب الصف السابع ص٣٠-٣١)
// نشاط ١٠-١ · دراسة جسم الإنسان (كتاب الصف السابع ص٣٢-٣٣)
// ══════════════════════════════════════════════════════════

function g7pHeader(c,w,h,dark,title){
  c.save();
  c.fillStyle = dark ? 'rgba(11,26,16,0.92)' : 'rgba(240,250,243,0.92)';
  c.fillRect(0,0,w,h*0.12);
  c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
  c.fillText(title, w/2, h*0.06);
  c.restore();
}

/* ── تاب ١: جرّب الحركة واكتشف المفصل ── */
function simG7Bio1N8a(){
  cancelAnimationFrame(animFrame);
  const JOINTS = [
    { id:'skull',    label:'الجمجمة',   type:'fixed', range:0,   seg1:'عظام القحف', seg2:'عظم الفكّ',
      info:'تتصل عظام الجمجمة الثابتة ببعضها بثبات لحماية الدماغ، أمّا عظم الفكّ فيتّصل بمفصل متحرّك يسمح له بالحركة عند مضغ الغذاء أو التكلّم.' },
    { id:'elbow',    label:'المرفق (الكوع)', type:'hinge', range:120, seg1:'العضد', seg2:'الساعد',
      info:'مفصل المرفق مفصل رَزّي (Hinge Joint) — لا يمكنه الحركة إلّا في اتّجاه واحد، فهو يتحرّك مثل الباب المثبّت في الرزّة.' },
    { id:'shoulder', label:'الكتف',      type:'ball',  range:150, seg1:'لوح الكتف', seg2:'العضد',
      info:'مفصل الكتف مفصل كرويّ (Ball-and-socket Joint) — الكرة الموجودة على إحدى العظمتين تدخل في حقّ العظمة الأخرى، فيمكنه التحرّك في جميع الاتّجاهات تقريباً.' },
  ];
  const CLASSIFY = [
    { id:'finger', label:'مفصل إصبع اليد', ans:'hinge' },
    { id:'knee',   label:'مفصل الركبة',    ans:'hinge' },
    { id:'toe',    label:'مفصل إصبع القدم', ans:'hinge' },
    { id:'hip',    label:'مفصل الفخذ',     ans:'ball'  },
  ];
  const TYPE_LABEL = { fixed:'مفصل ثابت', hinge:'مفصل رَزّي', ball:'مفصل كرويّ' };
  simState = { stage:'pick', tried:{}, angle:0, dragging:false, shake:0, boundFlash:0, cIdx:0, cSel:null, cCorrectN:0, finalSel:null };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function allTried(){ return JOINTS.every(j=>S.tried[j.id]); }

  function renderControls(){
    if(S.stage==='pick'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🦴 جرّب تحريك كل مفصل واكتشف نوعه!</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:12px">اختاري مفصلاً، ثمّ حاولي تحريكه بإصبعك في الرسم — راقبي إلى أين يمكنه أن يتحرّك.</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${JOINTS.map(j=>`<button onclick="window._g7jPick('${j.id}')" style="padding:12px;border-radius:10px;border:2px solid ${S.tried[j.id]?'#22C55E':'#ddd'};background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;display:flex;justify-content:space-between">
            <span>${j.label}</span><span>${S.tried[j.id]?'✅':'👆'}</span></button>`).join('')}
        </div>
        ${allTried() ? `<button class="ctrl-btn play" style="margin-top:14px" onclick="window._g7jClassify()">➡ اختبري نفسك: ما نوع هذا المفصل؟</button>` : ''}
      `;
    }
    if(S.stage==='explore'){
      const j = JOINTS.find(x=>x.id===S.curId);
      return `
        <div class="ctrl-section"><div class="ctrl-label">🖐 ${j.label}</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:10px">حاولي سحب الجزء المتحرّك في الرسم (${j.seg2}) بإصبعك.</div>
        ${S.tried[j.id] ? `<div style="font-size:13px;line-height:1.8;background:rgba(74,222,128,0.12);border-right:4px solid #22C55E;border-radius:8px;padding:12px;margin-bottom:10px">
          <strong>✅ ${TYPE_LABEL[j.type]}</strong><br>${j.info}</div>` :
          `<div style="font-size:12.5px;color:var(--text-secondary)">جرّبي السحب أولاً لتكتشفي مدى الحركة.</div>`}
        <button class="ctrl-btn reset" onclick="window._g7jBack()">↺ العودة لاختيار مفصل آخر</button>
      `;
    }
    if(S.stage==='classify'){
      if(S.cIdx>=CLASSIFY.length){
        return `
          <div class="ctrl-section"><div class="ctrl-label">🎉 أحسنتِ!</div></div>
          <div style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">أجبتِ صح عن ${S.cCorrectN} من ${CLASSIFY.length}.</div>
          <button class="ctrl-btn play" onclick="window._g7jFinal()">➡ سؤال أخير</button>`;
      }
      const cur = CLASSIFY[S.cIdx];
      const opts = ['fixed','hinge','ball'];
      return `
        <div class="ctrl-section"><div class="ctrl-label">🤔 سؤال ${S.cIdx+1} من ${CLASSIFY.length}</div></div>
        <div style="font-size:14px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px">ما نوع ${cur.label}؟</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${opts.map(o=>{
            let bg='var(--bg-ctrl-btn)', bd='#ddd', col='var(--text-secondary)';
            if(S.cSel!==null){
              if(o===cur.ans){ bg='#DCFCE7'; bd='#22C55E'; col='#166534'; }
              else if(o===S.cSel){ bg='#FEE2E2'; bd='#DC2626'; col='#991B1B'; }
            }
            return `<button ${S.cSel!==null?'disabled':''} onclick="window._g7jAnswer('${o}')" style="padding:11px;border-radius:9px;border:2px solid ${bd};background:${bg};color:${col};font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">${TYPE_LABEL[o]}</button>`;
          }).join('')}
        </div>
        ${S.cSel!==null ? `<div style="margin-top:10px;font-size:12.5px;color:var(--text-secondary)">${S.cSel===cur.ans?'✅ صحيح! يتحرّك هذا المفصل في اتّجاه واحد فقط مثل المرفق تماماً، أو في اتّجاهات متعدّدة مثل الكتف.':'💡 قارني حركته بحركة المرفق (اتّجاه واحد) أو حركة الكتف (اتّجاهات متعدّدة) — أيّهما أشبه؟'}</div>
        <button class="ctrl-btn play" style="margin-top:10px" onclick="window._g7jNextClassify()">➡ ${S.cIdx+1<CLASSIFY.length?'التالي':'متابعة'}</button>` : ''}
      `;
    }
    if(S.stage==='final'){
      const opts = ['ثني الركبة','فتح وإغلاق الفم','تحريك الذراع أو الساق في اتّجاهات متعدّدة/دائريّة','تحريك أصابع اليد'];
      const ansI = 2;
      return `
        <div class="ctrl-section"><div class="ctrl-label">🧩 تخيّلي...</div></div>
        <div style="font-size:13.5px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px;line-height:1.8">تخيّلي أنّ مفاصل جسمك كلّها أصبحت من النوع الرَزّي مثل مفصل المرفق، ما الحركة التي ستفقدينها؟</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${opts.map((o,i)=>{
            let bg='var(--bg-ctrl-btn)', bd='#ddd', col='var(--text-secondary)';
            if(S.finalSel!==null){
              if(i===ansI){ bg='#DCFCE7'; bd='#22C55E'; col='#166534'; }
              else if(i===S.finalSel){ bg='#FEE2E2'; bd='#DC2626'; col='#991B1B'; }
            }
            return `<button ${S.finalSel!==null?'disabled':''} onclick="window._g7jFinalAns(${i})" style="padding:11px;border-radius:9px;border:2px solid ${bd};background:${bg};color:${col};font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:13px">${o}</button>`;
          }).join('')}
        </div>
        ${S.finalSel!==null ? `<div style="margin-top:12px;padding:12px;background:var(--bg-card2);border-radius:8px;font-size:13px;line-height:1.8;color:var(--text-secondary)">${S.finalSel===ansI?'✅':'💡'} تسمح المفاصل الكرويّة مثل الكتف والفخذ بالحركة في اتّجاهات متعدّدة، بينما تسمح المفاصل الرَزّية بحركة محدودة في اتّجاه واحد فقط.</div>
        <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7jRestart()">↺ أعد النشاط</button>` : ''}
      `;
    }
  }
  controls(renderControls());

  window._g7jPick = function(id){ _g8pPlayClick(); S.curId=id; S.stage='explore'; S.angle=0; controls(renderControls()); };
  window._g7jBack = function(){ _g8pPlayClick(); S.stage='pick'; controls(renderControls()); };
  window._g7jClassify = function(){ _g8pPlayClick(); S.stage='classify'; S.cIdx=0; S.cSel=null; S.cCorrectN=0; controls(renderControls()); };
  window._g7jAnswer = function(o){
    if(S.cSel!==null) return;
    _g8pPlayClick(); S.cSel=o;
    if(o===CLASSIFY[S.cIdx].ans){ S.cCorrectN++; _g8pPlayDrop(); }
    controls(renderControls());
  };
  window._g7jNextClassify = function(){ _g8pPlayClick(); S.cIdx++; S.cSel=null; controls(renderControls()); };
  window._g7jFinal = function(){ _g8pPlayClick(); S.stage='final'; S.finalSel=null; controls(renderControls()); };
  window._g7jFinalAns = function(i){ if(S.finalSel!==null) return; _g8pPlayClick(); S.finalSel=i; if(i===2) _g8pPlayDrop(); controls(renderControls()); };
  window._g7jRestart = function(){ S.stage='pick'; S.tried={}; controls(renderControls()); };

  function pivotAndBase(w,h){ return { px: w*0.5, py: h*0.56, seg1Len: w*0.16, seg2Len: w*0.2 }; }

  function onDown(e){
    if(S.stage!=='explore') return;
    const p = g7pGp(cv,e), w=cv.width, h=cv.height;
    const {px,py,seg1Len} = pivotAndBase(w,h);
    const j = JOINTS.find(x=>x.id===S.curId);
    const tipX = px + Math.cos((180-S.angle)*Math.PI/180)*(j.type==='fixed'? w*0.15 : w*0.19);
    const tipY = py + Math.sin((180-S.angle)*Math.PI/180)*(j.type==='fixed'? w*0.15 : w*0.19);
    if(Math.hypot(p.x-tipX,p.y-tipY) < w*0.09){ S.dragging=true; }
  }
  function onMove(e){
    if(!S.dragging || S.stage!=='explore') return;
    e.preventDefault && e.preventDefault();
    const p = g7pGp(cv,e), w=cv.width, h=cv.height;
    const {px,py} = pivotAndBase(w,h);
    const j = JOINTS.find(x=>x.id===S.curId);
    let ang = Math.atan2(p.y-py, p.x-px)*180/Math.PI; // 0..±180, measured from +x axis
    let bend = 180 - Math.abs(ang); // 0 when pointing left (straight), increases as it swings toward pointing right
    if(ang<0) bend = -bend*0.001; // ignore below-axis stray drags, keep near current
    if(j.type==='fixed'){
      S.angle = (S.angle||0)*0.5; // شبه ثابت، يهتز قليلاً فقط
      S.shake = 14;
    } else {
      let clamped = Math.max(0, Math.min(j.range, bend));
      S.angle = clamped;
      if(clamped>=j.range-0.5 && bend>j.range){ S.boundFlash = 18; }
    }
    if(!S.tried[S.curId] && Math.abs(S.angle) > (j.type==='fixed'?2:8)){
      S.tried[S.curId]=true; _g8pPlayDrop(); controls(renderControls());
    }
  }
  function onUp(){ S.dragging=false; }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;
  cv.onclick=null;

  function draw(){
    if(currentSim!=='g7bio1n8' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7pBg(dark); c.fillRect(0,0,w,h);

    if(S.stage==='explore'){
      const j = JOINTS.find(x=>x.id===S.curId);
      const {px,py,seg1Len} = pivotAndBase(w,h);
      if(S.shake>0) S.shake--;
      if(S.boundFlash>0) S.boundFlash--;
      const shakeOff = S.shake>0 ? Math.sin(S.shake*2)*w*0.006 : 0;

      // الجزء الثابت (يمتد لليسار دائماً)
      c.strokeStyle='#B8946B'; c.lineWidth=Math.max(10,w*0.032); c.lineCap='round';
      c.beginPath(); c.moveTo(px,py); c.lineTo(px-seg1Len,py); c.stroke();
      c.fillStyle=g7pMut(dark); c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
      c.fillText(j.seg1, px-seg1Len, py-h*0.055);

      // الجزء المتحرّك
      const dispAngle = j.type==='fixed' ? shakeOff*300 : S.angle;
      const rad = (180-dispAngle)*Math.PI/180;
      const seg2Len = j.type==='fixed' ? w*0.15 : w*0.19;
      const tipX = px + Math.cos(rad)*seg2Len, tipY = py + Math.sin(rad)*seg2Len;
      c.strokeStyle = S.dragging ? g7pAccent(dark) : '#D8B78C'; c.lineWidth=Math.max(10,w*0.032); c.lineCap='round';
      c.beginPath(); c.moveTo(px,py); c.lineTo(tipX,tipY); c.stroke();
      c.fillStyle=g7pMut(dark); c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
      c.fillText(j.seg2, tipX, tipY + (tipY>py? h*0.06 : -h*0.045));

      // نقطة المفصل (المحور)
      c.fillStyle= j.type==='fixed' ? '#9CA3AF' : g7pAccent(dark);
      c.beginPath(); c.arc(px,py,w*0.02,0,Math.PI*2); c.fill();
      c.strokeStyle=dark?'#0B1A10':'#fff'; c.lineWidth=2; c.stroke();

      // مقياس زاوية بصري لمفصل الرزّي والكرويّ
      if(j.type!=='fixed'){
        c.save(); c.strokeStyle=g7pMut(dark); c.globalAlpha=0.35; c.lineWidth=2; c.setLineDash([4,4]);
        c.beginPath(); c.arc(px,py,seg2Len*0.55,Math.PI, Math.PI-(j.range*Math.PI/180), true); c.stroke();
        c.restore();
      }

      c.fillStyle = j.type==='fixed' ? '#DC2626' : g7pAccent(dark);
      c.font=`bold ${Math.round(h*0.017)}px Tajawal`; c.textAlign='center';
      if(j.type==='fixed') c.fillText('🔒 لا تتحرّك بينهما تقريباً', px, h*0.86);
      else if(S.boundFlash>0) c.fillText('🚫 هذا أقصى مدى للحركة', px, h*0.86);
      else c.fillText(S.dragging ? '👆 استمرّي بالسحب' : '👆 اسحبي الجزء المتحرّك', px, h*0.86);
    } else {
      // عرض توضيحي مصغّر للمفاصل الثلاثة في شاشة الاختيار/التصنيف
      const items = [
        {label:'ثابت', x:w*0.2, icon:'skull'},
        {label:'رَزّي', x:w*0.5, icon:'elbow'},
        {label:'كرويّ', x:w*0.8, icon:'shoulder'},
      ];
      items.forEach(it=>{
        const cy=h*0.42, r=w*0.05;
        c.strokeStyle=g7pMut(dark); c.lineWidth=Math.max(6,w*0.018); c.lineCap='round';
        c.beginPath(); c.moveTo(it.x-r,cy); c.lineTo(it.x,cy); c.stroke();
        let ang2 = it.icon==='skull'? 0 : it.icon==='elbow'? 55 : 100;
        const rad=(180-ang2)*Math.PI/180;
        c.beginPath(); c.moveTo(it.x,cy); c.lineTo(it.x+Math.cos(rad)*r, cy+Math.sin(rad)*r); c.stroke();
        c.fillStyle=g7pAccent(dark); c.beginPath(); c.arc(it.x,cy,w*0.009,0,Math.PI*2); c.fill();
        c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
        c.fillText(it.label, it.x, cy+h*0.08);
      });
    }

    g7pHeader(c,w,h,dark,'نشاط ٨-١ · المفاصل');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
/* ── تاب ١: من الذي تحرّك؟ ── */
function simG7Bio1N9a(){
  cancelAnimationFrame(animFrame);
  simState = { stage:'straight', animT:0, qAnswered:false, qSel:null };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    if(S.stage==='straight'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">💪 من الذي تحرّك؟</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:12px">راقبي ماذا يحدث للعضلتين داخل الذراع عند رفعها.</div>
        <button class="ctrl-btn play" onclick="window._g7mRaise()">⬆️ ارفعي الذراع</button>`;
    }
    if(S.stage==='raising'){
      return `<div class="ctrl-section"><div class="ctrl-label">⏳ ...</div></div><div style="font-size:12.5px;color:var(--text-secondary)">راقبي العضلتين وهما تتغيّران.</div>`;
    }
    if(S.stage==='bent'){
      if(!S.qAnswered){
        const opts=['العضلة ثلاثية الرؤوس','العضلة ذات الرأسين','كلتاهما بالطريقة نفسها','لا تعمل أيّ عضلة'];
        return `
          <div class="ctrl-section"><div class="ctrl-label">🤔 سؤال سريع</div></div>
          <div style="font-size:14px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px">أيّ عضلة انقبضت أثناء رفع الذراع؟</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${opts.map((o,i)=>`<button onclick="window._g7mAns(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:13px">${o}</button>`).join('')}
          </div>`;
      }
      return `
        <div class="ctrl-section"><div class="ctrl-label">${S.qSel===1?'✅ صحيح!':'💡 ليست هذه الإجابة'}</div></div>
        <div style="font-size:13px;line-height:1.8;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:12px;margin-bottom:12px">عند ثني المرفق تنقبض العضلة ذات الرأسين (تصبح أقصر وأزيد سماكة) وتساعد على سحب عظام الذراع، بينما تنبسط العضلة ثلاثية الرؤوس وتصبح أطول.</div>
        <button class="ctrl-btn play" onclick="window._g7mLower()">⬇️ افردي الذراع</button>`;
    }
    if(S.stage==='lowering'){
      return `<div class="ctrl-section"><div class="ctrl-label">⏳ ...</div></div><div style="font-size:12.5px;color:var(--text-secondary)">راقبي العضلتين وهما تعكسان الأدوار.</div>`;
    }
    return `
      <div class="ctrl-section"><div class="ctrl-label">🎉 أحسنتِ!</div></div>
      <div style="padding:14px;background:var(--bg-card2);border-radius:10px;font-size:13px;color:var(--text-secondary);line-height:1.9;margin-bottom:12px">
        💡 تعمل العضلات في أزواج، فعندما تنقبض إحدى العضلتين تنبسط الأخرى. لا تستطيع العضلة أن تدفع العظم، بل تستطيع فقط أن تشدّه (تسحبه).
      </div>
      <button class="ctrl-btn reset" onclick="window._g7mRestart()">↺ أعد النشاط</button>`;
  }
  controls(renderControls());

  window._g7mRaise = function(){ _g8pPlayClick(); S.stage='raising'; S.animT=0; };
  window._g7mAns = function(i){ _g8pPlayClick(); S.qSel=i; S.qAnswered=true; if(i===1) _g8pPlayDrop(); controls(renderControls()); };
  window._g7mLower = function(){ _g8pPlayClick(); S.stage='lowering'; S.animT=0; };
  window._g7mRestart = function(){ S.stage='straight'; S.animT=0; S.qAnswered=false; S.qSel=null; controls(renderControls()); };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null;
  cv.onclick=null;

  function drawArm(c,w,h,bendT,dark){
    // bendT: 0 = مستقيمة (الساعد يكمل بامتداد العضد نحو الأسفل)، 1 = منثنية بالكامل (الساعد مطويّ نحو الكتف)
    const shX=w*0.32, shY=h*0.32, elX = shX, elY = shY + h*0.28;
    const flexAngle = bendT*2.3; // 0 = بامتداد العضد، ‎~132°‎ = مطويّة بالكامل نحو الكتف
    const wrX = elX + Math.sin(flexAngle)*w*0.22, wrY = elY + Math.cos(flexAngle)*h*0.24;
    // العضد (ثابت الطول من الكتف للمرفق)
    c.strokeStyle='#D8B78C'; c.lineWidth=Math.max(16,w*0.05); c.lineCap='round';
    c.beginPath(); c.moveTo(shX,shY); c.lineTo(elX,elY); c.stroke();
    // الساعد (من المرفق للمعصم، يدور حول المرفق)
    c.beginPath(); c.moveTo(elX,elY); c.lineTo(wrX,wrY); c.stroke();

    // العضلة ذات الرأسين (أمام العضد) — تقصر وتزداد سماكة عند الانقباض
    const bicepsBulge = 1 + bendT*0.7;
    c.save();
    c.strokeStyle='#EF4444'; c.lineCap='round';
    c.lineWidth = Math.max(8,w*0.024)*bicepsBulge;
    const midX=(shX+elX)/2 - w*0.02, midY=(shY+elY)/2;
    c.beginPath(); c.moveTo(shX-w*0.01,shY+h*0.02); c.quadraticCurveTo(midX,midY, elX-w*0.015,elY-h*0.01); c.stroke();
    c.restore();
    c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
    c.fillText(`ذات الرأسين ${bendT>0.5?'(منقبضة 💪)':'(مسترخية)'}`, midX-w*0.09, midY-h*0.02);

    // العضلة ثلاثية الرؤوس (خلف العضد) — تطول عند الانبساط، تقصر عند الانقباض
    const tricepsBulge = 1 + (1-bendT)*0.7;
    c.save();
    c.strokeStyle='#3B82F6'; c.lineCap='round';
    c.lineWidth = Math.max(8,w*0.024)*tricepsBulge;
    const midX2=(shX+elX)/2 + w*0.025, midY2=(shY+elY)/2;
    c.beginPath(); c.moveTo(shX+w*0.01,shY+h*0.02); c.quadraticCurveTo(midX2,midY2, elX+w*0.015,elY-h*0.01); c.stroke();
    c.restore();
    c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.014)}px Tajawal`; c.textAlign='center';
    c.fillText(`ثلاثية الرؤوس ${bendT>0.5?'(مسترخية)':'(منقبضة 💪)'}`, midX2+w*0.11, midY2+h*0.03);

    // نقطة المرفق
    c.fillStyle='#B8946B'; c.beginPath(); c.arc(elX,elY,w*0.016,0,Math.PI*2); c.fill();

    return {shX,shY,elX,elY,wrX,wrY};
  }

  function draw(){
    if(currentSim!=='g7bio1n9' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7pBg(dark); c.fillRect(0,0,w,h);

    if(S.stage==='raising'){ S.animT+=0.03; if(S.animT>=1){ S.animT=1; S.stage='bent'; controls(renderControls()); } }
    if(S.stage==='lowering'){ S.animT-=0.03; if(S.animT<=0){ S.animT=0; S.stage='done'; controls(renderControls()); } }
    const bendT = S.stage==='straight' ? 0 : S.stage==='done' ? 0 : S.animT;

    drawArm(c,w,h,bendT,dark);

    g7pHeader(c,w,h,dark,'نشاط ٩-١ · العضلات');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ── تاب ٢: شدّ الحبل ── */
function simG7Bio1N9b(){
  cancelAnimationFrame(animFrame);
  const ROUNDS = [
    { prompt:'أريد ثني الذراع.', ans:'biceps', anim:'bend' },
    { prompt:'أريد جعل الذراع مستقيمة.', ans:'triceps', anim:'straight' },
  ];
  simState = { stage:'round', rIdx:0, sel:null, bendT:0.5, animTo:null, animT:0.5, finalSel:null, done:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function renderControls(){
    if(S.stage==='round'){
      const r = ROUNDS[S.rIdx];
      return `
        <div class="ctrl-section"><div class="ctrl-label">🪢 شدّ الحبل</div></div>
        <div style="font-size:14px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px">${r.prompt}<br><span style="font-size:12px;font-weight:400;color:var(--text-secondary)">أيّ عضلة يجب أن تنقبض؟</span></div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <button onclick="window._g7tPick('biceps')" style="padding:12px;border-radius:9px;border:2px solid #EF4444;background:var(--bg-ctrl-btn);color:#EF4444;font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">🔴 العضلة ذات الرأسين</button>
          <button onclick="window._g7tPick('triceps')" style="padding:12px;border-radius:9px;border:2px solid #3B82F6;background:var(--bg-ctrl-btn);color:#3B82F6;font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">🔵 العضلة ثلاثية الرؤوس</button>
        </div>
        ${S.sel ? `<div style="margin-top:10px;font-size:12.5px;color:var(--text-secondary)">${S.sel===r.ans?'✅ صحيح! راقبي كيف تشدّ العضلة العظم.':'💡 فكّري: أيّ عضلة تسحب الساعد نحو الكتف، وأيّهما تسحبه بعيداً عنه؟'}</div>
        ${S.sel===r.ans? `<button class="ctrl-btn play" style="margin-top:10px" onclick="window._g7tNext()">➡ ${S.rIdx+1<ROUNDS.length?'التالي':'التحدّي الأخير'}</button>`:''}` : ''}
      `;
    }
    if(S.stage==='challenge'){
      if(S.finalSel===null){
        return `
          <div class="ctrl-section"><div class="ctrl-label">🏆 التحدّي النهائي</div></div>
          <div style="font-size:13.5px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px;line-height:1.8">هل يمكن للعضلة ذات الرأسين وحدها أن ترفع الذراع وتجعلها مستقيمة مرّة أخرى؟</div>
          <div style="display:flex;gap:8px">
            <button onclick="window._g7tFinal(0)" style="flex:1;padding:12px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">نعم</button>
            <button onclick="window._g7tFinal(1)" style="flex:1;padding:12px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">لا</button>
          </div>`;
      }
      return `
        <div class="ctrl-section"><div class="ctrl-label">${S.finalSel===1?'✅ صحيح!':'💡 فكّري مرّة أخرى'}</div></div>
        <div style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:12px;margin-bottom:12px">تستطيع العضلة أن تشدّ (تسحب) العظم عند انقباضها فقط، لكنّها لا تستطيع أن تدفعه. لذلك تحتاج ذراعك لعضلتين تعملان في اتّجاهين متعاكسين.</div>
        <div style="text-align:center;font-size:15px;font-weight:800;color:#D97706;margin-bottom:12px">🏆 تعمل العضلات في أزواج متعاكسة</div>
        <button class="ctrl-btn play" onclick="window._g7tFinalQ()">➡ سؤال ختامي</button>`;
    }
    if(S.stage==='finalq'){
      const opts=['العضلة ثلاثية الرؤوس','العضلة ذات الرأسين','كلتاهما منقبضتان بالدرجة نفسها','لا تعمل أيّ عضلة'];
      return `
        <div class="ctrl-section"><div class="ctrl-label">🧩 سؤال تفاعليّ</div></div>
        <div style="font-size:13px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px;line-height:1.8">رفع أحمد حقيبة مدرسيّة من الأرض، فثنى مرفقه وارتفعت الحقيبة. أيّ العضلتين كانت منقبضة أثناء ثني المرفق؟</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${opts.map((o,i)=>`<button onclick="window._g7tFq(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:13px">${o}</button>`).join('')}
        </div>
      `;
    }
    return `
      <div class="ctrl-section"><div class="ctrl-label">🎉 أحسنتِ!</div></div>
      <div style="padding:14px;background:var(--bg-card2);border-radius:10px;font-size:13px;color:var(--text-secondary);line-height:1.9;margin-bottom:12px">
        أحسنتِ! عند ثني المرفق تنقبض العضلة ذات الرأسين وتساعد على سحب عظام الذراع، بينما تكون العضلة ثلاثية الرؤوس في حالة ارتخاء (انبساط).
      </div>
      <button class="ctrl-btn reset" onclick="window._g7tRestart()">↺ أعد النشاط</button>`;
  }
  controls(renderControls());

  window._g7tPick = function(id){
    if(S.sel) return;
    _g8pPlayClick(); S.sel=id;
    const r = ROUNDS[S.rIdx];
    if(id===r.ans){ _g8pPlayDrop(); S.animTo = r.anim==='bend' ? 1 : 0; }
    controls(renderControls());
  };
  window._g7tNext = function(){
    _g8pPlayClick();
    S.rIdx++; S.sel=null;
    if(S.rIdx>=ROUNDS.length){ S.stage='challenge'; }
    controls(renderControls());
  };
  window._g7tFinal = function(i){ if(S.finalSel!==null) return; _g8pPlayClick(); S.finalSel=i; if(i===1) _g8pPlayDrop(); controls(renderControls()); };
  window._g7tFinalQ = function(){ _g8pPlayClick(); S.stage='finalq'; controls(renderControls()); };
  window._g7tFq = function(i){ _g8pPlayClick(); if(i===1) _g8pPlayDrop(); S.stage='done'; controls(renderControls()); };
  window._g7tRestart = function(){ S.stage='round'; S.rIdx=0; S.sel=null; S.animTo=null; S.animT=0.5; S.finalSel=null; controls(renderControls()); };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null;
  cv.onclick=null;

  function draw(){
    if(currentSim!=='g7bio1n9' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7pBg(dark); c.fillRect(0,0,w,h);

    if(S.animTo!==null){
      S.animT += (S.animTo - S.animT) * 0.08;
      if(Math.abs(S.animTo-S.animT) < 0.01) S.animT = S.animTo;
    }
    const t = S.animT; // 0 = مستقيمة (ثلاثية الرؤوس منقبضة)، 1 = منثنية (ذات الرأسين منقبضة)
    const boneY = h*0.5, boneX1 = w*0.5 - w*0.12*(1-t*0.3), boneX2 = w*0.5 + w*0.12;

    // العظم في المنتصف
    c.strokeStyle='#D8B78C'; c.lineWidth=Math.max(14,w*0.045); c.lineCap='round';
    c.beginPath(); c.moveTo(w*0.5-w*0.14,boneY); c.lineTo(w*0.5+w*0.14,boneY); c.stroke();

    // حبل العضلة ذات الرأسين (يسحب لليسار/أعلى)
    const biceps = 0.5+t*0.5;
    c.strokeStyle='#EF4444'; c.lineWidth=Math.max(10,w*0.03)*(0.7+biceps*0.6); c.lineCap='round';
    c.beginPath(); c.moveTo(w*0.14,h*0.28); c.lineTo(w*0.5-w*0.14*(0.4+t*0.3),boneY); c.stroke();
    c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
    c.fillText('🔴 ذات الرأسين', w*0.14, h*0.22);

    // حبل العضلة ثلاثية الرؤوس (يسحب لليمين/أسفل)
    const triceps = 0.5+(1-t)*0.5;
    c.strokeStyle='#3B82F6'; c.lineWidth=Math.max(10,w*0.03)*(0.7+triceps*0.6); c.lineCap='round';
    c.beginPath(); c.moveTo(w*0.86,h*0.72); c.lineTo(w*0.5+w*0.14*(0.4+(1-t)*0.3),boneY); c.stroke();
    c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
    c.fillText('🔵 ثلاثية الرؤوس', w*0.86, h*0.8);

    // اتجاه السحب (سهمان متعاكسان)
    c.save(); c.globalAlpha=0.5; c.fillStyle=g7pMut(dark); c.font=`${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
    c.fillText('⬅', w*0.32, boneY-h*0.05);
    c.fillText('➡', w*0.68, boneY+h*0.07);
    c.restore();

    g7pHeader(c,w,h,dark,'نشاط ٩-١ · شدّ الحبل');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
/* ── تاب ١: من أنا؟ (علماء دراسة جسم الإنسان) ── */
function simG7Bio1N10a(){
  cancelAnimationFrame(animFrame);
  const SCIENTISTS = {
    anatomist: { label:'عالِم التشريح', en:'Anatomist', icon:'🩻', col:'#8B5CF6',
      desc:'يدرس عالِم التشريح تركيب جسم الإنسان، ويستخدم الأشعّة السينيّة والمقطعيّة والرنين المغناطيسيّ لرؤية ما بداخل الجسم دون الحاجة إلى فتحه.' },
    sportsPhys: { label:'عالِم فسيولوجيا الرياضة', en:'Sports Physiologist', icon:'🏃', col:'#F59E0B',
      desc:'يدرس عالِم فسيولوجيا الرياضة ما يحدث لجسم الرياضيّ عندما يمارس التمارين الرياضيّة، ويدرس أثر النظام الغذائيّ والتدريب على القلب والرئتين.' },
    neuro: { label:'عالِم الأعصاب', en:'Neuroscientist', icon:'🧠', col:'#3B82F6',
      desc:'عالِم الأعصاب هو عالِم فسيولوجيا يدرس كيف يعمل الدماغ وباقي أعضاء الجهاز العصبيّ، ويبحث كيف يرسل الدماغ إشاراته العصبيّة إلى أجزاء الجسم الأخرى.' },
  };
  const CARDS = [
    { icon:'🧠', prompt:'أريد أن أعرف كيف يرسل الدماغ الرسائل إلى اليد.', ans:'neuro' },
    { icon:'🏃', prompt:'أريد معرفة تأثير التدريب الرياضيّ على عضلات لاعب كرة القدم.', ans:'sportsPhys' },
    { icon:'🩻', prompt:'أريد معرفة شكل العظام والأعضاء داخل الجسم دون إجراء عمليّة جراحيّة.', ans:'anatomist' },
    { icon:'🧠', prompt:'يريد الطبيب معرفة سبب عدم تحكّم مريض بحركة يده بعد حادث.', ans:'neuro' },
  ];
  simState = { idx:0, sel:null, learned:{}, stage:'cards', finalSel:null };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const OPT_ORDER = ['anatomist','sportsPhys','neuro'];

  function renderControls(){
    if(S.stage==='cards'){
      if(S.idx>=CARDS.length){
        return `
          <div class="ctrl-section"><div class="ctrl-label">🏆 أصبحتِ مساعدة العلماء!</div></div>
          <div style="font-size:13px;color:var(--text-secondary);line-height:2;margin-bottom:12px">
            ${Object.keys(S.learned).map(k=>`${SCIENTISTS[k].icon} ${SCIENTISTS[k].label}`).join('<br>')}
          </div>
          <div style="font-size:12.5px;color:var(--text-secondary);background:var(--bg-card2);border-radius:8px;padding:10px;margin-bottom:12px">يساعد العلماء من تخصّصات مختلفة على فهم جسم الإنسان.</div>
          <button class="ctrl-btn play" onclick="window._g7sFinal()">➡ سؤال أخير</button>`;
      }
      const cur = CARDS[S.idx];
      return `
        <div class="ctrl-section"><div class="ctrl-label">🔎 من أنا؟ (${S.idx+1} من ${CARDS.length})</div></div>
        <div style="font-size:14px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px;line-height:1.8">${cur.icon} "${cur.prompt}"</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${OPT_ORDER.map(k=>{
            let bg='var(--bg-ctrl-btn)', bd='#ddd', col='var(--text-secondary)';
            if(S.sel!==null){
              if(k===cur.ans){ bg='#DCFCE7'; bd='#22C55E'; col='#166534'; }
              else if(k===S.sel){ bg='#FEE2E2'; bd='#DC2626'; col='#991B1B'; }
            }
            return `<button ${S.sel!==null?'disabled':''} onclick="window._g7sPick('${k}')" style="padding:11px;border-radius:9px;border:2px solid ${bd};background:${bg};color:${col};font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:13px">${SCIENTISTS[k].label}</button>`;
          }).join('')}
        </div>
        ${S.sel!==null ? `<div style="margin-top:10px;padding:10px;background:var(--bg-card2);border-radius:8px;font-size:12.5px;color:var(--text-secondary);line-height:1.8">${S.sel===cur.ans?'✅':'💡'} ${SCIENTISTS[cur.ans].desc}</div>
        <button class="ctrl-btn play" style="margin-top:10px" onclick="window._g7sNext()">➡ ${S.idx+1<CARDS.length?'التالي':'متابعة'}</button>` : ''}
      `;
    }
    if(S.stage==='final'){
      const opts = [
        'خالد محقّ، فجميع العلماء يدرسون الشيء نفسه بالطريقة نفسها.',
        'خالد غير محقّ، فكلّ فئة من العلماء تدرس جانباً مختلفاً من جسم الإنسان.',
        'خالد محقّ لأنّهم يستخدمون الأجهزة نفسها فقط.',
        'لا يمكن معرفة الإجابة.',
      ];
      const ansI=1;
      return `
        <div class="ctrl-section"><div class="ctrl-label">🧩 رأيك؟</div></div>
        <div style="font-size:13px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px;line-height:1.8">يقول خالد: "جميع العلماء الذين يدرسون جسم الإنسان يقومون بالعمل نفسه." ما رأيك؟</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${opts.map((o,i)=>{
            let bg='var(--bg-ctrl-btn)', bd='#ddd', col='var(--text-secondary)';
            if(S.finalSel!==null){
              if(i===ansI){ bg='#DCFCE7'; bd='#22C55E'; col='#166534'; }
              else if(i===S.finalSel){ bg='#FEE2E2'; bd='#DC2626'; col='#991B1B'; }
            }
            return `<button ${S.finalSel!==null?'disabled':''} onclick="window._g7sFinalAns(${i})" style="padding:10px;border-radius:9px;border:2px solid ${bd};background:${bg};color:${col};font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:12.5px;text-align:right">${o}</button>`;
          }).join('')}
        </div>
        ${S.finalSel!==null ? `<div style="margin-top:12px;padding:12px;background:var(--bg-card2);border-radius:8px;font-size:12.5px;line-height:1.9;color:var(--text-secondary)">يدرس علماء التشريح تركيب الجسم، ويدرس علماء الفسيولوجيا كيفيّة عمل الجسم (مثل عالِم فسيولوجيا الرياضة وعالِم الأعصاب). لذلك يتعاون العلماء من تخصّصات مختلفة لفهم جسم الإنسان بصورة أفضل.</div>
        <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7sRestart()">↺ أعد النشاط</button>` : ''}
      `;
    }
  }
  controls(renderControls());

  window._g7sPick = function(k){
    if(S.sel!==null) return;
    _g8pPlayClick(); S.sel=k;
    if(k===CARDS[S.idx].ans){ _g8pPlayDrop(); S.learned[k]=true; }
    controls(renderControls());
  };
  window._g7sNext = function(){ _g8pPlayClick(); S.idx++; S.sel=null; controls(renderControls()); };
  window._g7sFinal = function(){ _g8pPlayClick(); S.stage='final'; S.finalSel=null; controls(renderControls()); };
  window._g7sFinalAns = function(i){ if(S.finalSel!==null) return; _g8pPlayClick(); S.finalSel=i; if(i===1) _g8pPlayDrop(); controls(renderControls()); };
  window._g7sRestart = function(){ S.idx=0; S.sel=null; S.learned={}; S.stage='cards'; S.finalSel=null; controls(renderControls()); };

  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null;
  cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null;
  cv.onclick=null;

  function draw(){
    if(currentSim!=='g7bio1n10' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7pBg(dark); c.fillRect(0,0,w,h);

    const revealed = S.stage==='cards' ? (S.sel && S.sel===CARDS[S.idx] && CARDS[S.idx].ans) : null;
    const showKey = S.stage==='cards' && S.idx<CARDS.length && S.sel===CARDS[S.idx].ans ? CARDS[S.idx].ans
                   : S.stage==='cards' && S.idx>=CARDS.length ? null : null;

    if(showKey){
      const sc = SCIENTISTS[showKey];
      const cx=w*0.5, cy=h*0.5;
      c.save();
      c.fillStyle=sc.col+'22'; c.beginPath(); c.arc(cx,cy,w*0.22,0,Math.PI*2); c.fill();
      c.strokeStyle=sc.col; c.lineWidth=3; c.beginPath(); c.arc(cx,cy,w*0.22,0,Math.PI*2); c.stroke();
      c.font=`${Math.round(h*0.11)}px sans-serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(sc.icon, cx, cy-h*0.02);
      c.restore();
      c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.02)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText(sc.label, cx, cy+w*0.16);
      c.fillStyle=g7pMut(dark); c.font=`${Math.round(h*0.015)}px Tajawal`;
      c.fillText(sc.en, cx, cy+w*0.16+h*0.035);
    } else if(S.stage==='cards' && S.idx<CARDS.length){
      c.fillStyle=g7pMut(dark); c.font=`${Math.round(h*0.09)}px sans-serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('🔎', w*0.5, h*0.5);
      c.fillStyle=g7pMut(dark); c.font=`${Math.round(h*0.017)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('من أنا؟ اختاري التخصّص المناسب 👉', w*0.5, h*0.72);
    } else {
      // شاشة التخرّج: عرض جميع التخصّصات التي تعرّفت عليها الطالبة
      const keys = Object.keys(S.learned);
      keys.forEach((k,i)=>{
        const sc = SCIENTISTS[k];
        const cx = w*(0.22+i*(0.56/Math.max(1,keys.length-1||1))), cy=h*0.5;
        const x = keys.length===1? w*0.5 : cx;
        c.save();
        c.fillStyle=sc.col+'22'; c.beginPath(); c.arc(x,cy,w*0.09,0,Math.PI*2); c.fill();
        c.strokeStyle=sc.col; c.lineWidth=2; c.beginPath(); c.arc(x,cy,w*0.09,0,Math.PI*2); c.stroke();
        c.font=`${Math.round(h*0.055)}px sans-serif`; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(sc.icon, x, cy);
        c.restore();
      });
      c.fillStyle=g7pTxt(dark); c.font=`bold ${Math.round(h*0.024)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('🏆 أصبحتِ مساعدة العلماء!', w*0.5, h*0.75);
    }

    g7pHeader(c,w,h,dark,'نشاط ١٠-١ · دراسة جسم الإنسان');
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}
