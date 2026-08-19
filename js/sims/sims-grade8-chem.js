// ══════════════════════════════════════════════════════════
// الصف الثامن — الوحدة الثانية: العناصر والمركّبات
// نشاط ٩-٢ · المركّبات والمخاليط (كتاب الصف الثامن ص٤٨-٤٩)
// ══════════════════════════════════════════════════════════

function g8cBg(dark){ return dark ? '#180E22' : '#FBF5EE'; }
function g8cTxt(dark){ return dark ? '#F0DFC8' : '#3A2A1A'; }
function g8cMut(dark){ return dark ? '#B79A78' : '#8A6D4A'; }
function g8cAccent(dark){ return dark ? '#F0B429' : '#D4901A'; }

/* ── تاب ١: خلط الحديد مع الكبريت (نشاط ٩-٢ أ + ب) ── */
function simG8Chem2N9a(){
  cancelAnimationFrame(animFrame);
  const STEPS = [
    { id:'start', btn:'▶ ابدأ التجربة', info:'أمامك طبقان: أحدهما فيه مسحوق الكبريت الأصفر، والآخر فيه برادة الحديد الرمادية. لكلّ مادة خصائصها الخاصة.' },
    { id:'mix',   btn:'🥄 اخلط بينهما', info:'اضغط لخلط برادة الحديد مع مسحوق الكبريت في وعاء واحد.' },
    { id:'q1',    btn:'➡ متابعة', info:'', question:{
        q:'هل ما زلت تستطيع تمييز حبيبات الحديد عن حبيبات الكبريت في الخليط؟',
        opts:['نعم، لا يزال كلّ منهما محتفظاً بخصائصه ويمكن فصلهما بمغناطيس','لا، تحوّلا إلى مادة واحدة موحّدة لا يمكن تمييزها','تبخّر الكبريت بالكامل فور الخلط'],
        ans:0, fb:'✅ صحيح! هذا خليط (مخلوط) فقط — لا يزال كل عنصر محتفظاً بخصائصه، ويمكن فصل الحديد عن الكبريت باستخدام مغناطيس دون أي تفاعل كيميائي.'
      } },
    { id:'heat',  btn:'🔥 سخّن المخلوط', info:'اضغط لتسخين المخلوط. توقّف عن التسخين عندما يبدأ المخلوط بالتوهّج — سيتّحد الحديد والكبريت معاً ويشكّلان كبريتيد الحديد.' },
    { id:'q2',    btn:'➡ استنتج', info:'', question:{
        q:'ماذا حدث للمادة الناتجة بعد التسخين؟',
        opts:['أصبحت مادة جديدة (كبريتيد الحديد) خصائصها مختلفة تماماً عن الحديد والكبريت، ولا يمكن فصلها بمغناطيس','بقيت خليطاً كما كانت قبل التسخين','عادت المادة إلى حديد وكبريت منفصلَين'],
        ans:0, fb:'✅ صحيح! عند تسخين الحديد والكبريت معاً، تتّحد ذرّاتهما كيميائياً وتُكوّن مركّباً جديداً هو كبريتيد الحديد، وهو لا يوصّل الحرارة أو الكهرباء وليس ممغنطاً — خصائص مختلفة كليّاً عن الحديد وحده.'
      } },
    { id:'done',  btn:'', info:'' },
  ];
  const MAIN_IDS = STEPS.filter(s=>!s.question && s.id!=='done').map(s=>s.id);
  simState = { step:0, transT:1, heatT:0, mixT:1, answered:false };
  const S = simState;
  const idxOf = (id) => STEPS.findIndex(s=>s.id===id);

  function renderControls(){
    const st = STEPS[S.step];
    if(st.id==='done'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">⚗️ ماذا استنتجنا؟</div></div>
        <div style="padding:14px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(212,144,26,0.35)">
          <div style="font-weight:700;color:#D4901A;margin-bottom:8px">🎉 مخلوط أم مركّب؟</div>
          <div style="font-size:13px;color:var(--text-secondary);line-height:1.9">
            • تحتوي المخاليط على عنصر و/أو مركّبات مختلفة غير متّحدة معاً كيميائياً (غير مرتبطة).<br>
            • يحمل المركّب خصائص مختلفة عن خصائص العناصر التي يتكوّن منها.<br>
            • في المخلوط، يحتفظ كلّ عنصر أو مركّب بخصائصه.
          </div>
        </div>
        <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g8cIronRestart()">↺ أعد التجربة</button>`;
    }
    let mainNum = 0;
    for(const id of MAIN_IDS){ if(idxOf(id) <= S.step) mainNum++; }
    mainNum = Math.max(1, mainNum);
    const progressHtml = `
      <div style="font-size:12px;color:var(--text-secondary);margin-bottom:6px">الخطوة ${mainNum} من ${MAIN_IDS.length}</div>
      <div style="height:6px;background:var(--bg-card2);border-radius:3px;overflow:hidden;margin-bottom:10px">
        <div style="height:100%;width:${Math.round(mainNum/MAIN_IDS.length*100)}%;background:#D4901A;transition:width .3s"></div>
      </div>`;
    if(st.question){
      const q = st.question;
      return `
        <div class="ctrl-section"><div class="ctrl-label">⚗️ استقصاء: الحديد والكبريت</div></div>
        ${progressHtml}
        <div style="font-size:14px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px">${q.q}</div>
        <div id="g8cIronOpts" style="display:flex;flex-direction:column;gap:8px">
          ${q.opts.map((o,i)=>`<button id="g8cIronOpt${i}" onclick="window._g8cIronAnswer(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">${o}</button>`).join('')}
        </div>
        <div id="g8cIronFb" style="margin-top:10px;font-size:13px;color:var(--text-secondary);line-height:1.8"></div>`;
    }
    return `
      <div class="ctrl-section">
        <div class="ctrl-label">⚗️ استقصاء: الحديد والكبريت</div>
        ${progressHtml}
      </div>
      <div id="g8cIronInfo" style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;border:1px solid rgba(212,144,26,0.25);margin-bottom:12px">${st.info}</div>
      <button class="ctrl-btn play" id="g8cIronBtn" onclick="window._g8cIronNext()">${st.btn}</button>`;
  }
  controls(renderControls());

  window._g8cIronNext = function(){
    _g8pPlayClick();
    const st = STEPS[S.step];
    if(st.id==='heat'){
      _g8pPlayFire();
      S.heatT = 0.0001;
      const btn = document.getElementById('g8cIronBtn');
      if(btn){ btn.setAttribute('disabled','true'); btn.style.opacity='0.5'; btn.textContent='⏳ درجة الحرارة ترتفع...'; }
      return;
    }
    S.step++;
    S.transT = 0.0001;
    controls(renderControls());
  };
  window._g8cIronAnswer = function(i){
    if(S.answered) return; S.answered = true;
    const q = STEPS[S.step].question;
    const ok = i===q.ans;
    _g8pPlayClick();
    const btn = document.getElementById('g8cIronOpt'+i);
    if(btn){ btn.style.background = ok?'#27AE60':'#E74C3C'; btn.style.color='white'; btn.style.borderColor= ok?'#27AE60':'#E74C3C'; }
    if(!ok){
      const okBtn = document.getElementById('g8cIronOpt'+q.ans);
      if(okBtn){ okBtn.style.background='#27AE60'; okBtn.style.color='white'; okBtn.style.borderColor='#27AE60'; }
    }
    const fb = document.getElementById('g8cIronFb');
    if(fb) fb.innerHTML = q.fb;
    setTimeout(()=>{ S.step++; S.transT=0.0001; S.answered=false; controls(renderControls()); }, 1700);
  };
  window._g8cIronRestart = function(){
    S.step=0; S.transT=1; S.heatT=0; S.answered=false;
    controls(renderControls());
  };

  const cv = document.getElementById('simCanvas');
  // جسيمات عشوائية ثابتة (تُحسب مرّة واحدة) لتمثيل برادة الحديد وحبيبات الكبريت داخل الخليط
  const GRAIN_N = 46;
  const GRAINS = [];
  for(let i=0;i<GRAIN_N;i++){
    GRAINS.push({ a: Math.random()*Math.PI*2, r: Math.random(), type: i%2===0?'iron':'sulfur', jx: (Math.random()-0.5), jy:(Math.random()-0.5) });
  }

  function draw(){
    if(currentSim!=='g8chem2n9' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    c.fillStyle = g8cBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle = g8cTxt(dark);
    c.font = `bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ٩-٢ · الحديد والكبريت', w/2, h*0.05);

    const stId = STEPS[S.step] ? STEPS[S.step].id : 'done';
    const idx = idxOf(stId);
    const justAfter   = (id) => idx === idxOf(id) + 1;
    const activeSince = (id) => idx >= idxOf(id) + 1;
    if(S.transT<1) S.transT += 0.045;
    const tt = Math.min(1, S.transT);

    if(S.heatT>0 && S.heatT<1){
      S.heatT += 0.006;
      if(S.heatT>=1){
        S.heatT = 1;
        S.step++; S.transT = 0.0001;
        controls(renderControls());
      }
    }

    const mixed = activeSince('mix');
    const mixIn = justAfter('mix') ? tt : 1;

    if(!mixed){
      // ── طبقان منفصلان: الكبريت يساراً، الحديد يميناً ──
      const dishY = h*0.42, dishR = w*0.15;
      const sulfurX = w*0.30, ironX = w*0.70;
      // طبق الكبريت
      c.fillStyle = dark? '#3A2E10':'#F5E7B0'; c.strokeStyle=g8cMut(dark); c.lineWidth=3;
      c.beginPath(); c.ellipse(sulfurX, dishY, dishR, dishR*0.32, 0, 0, Math.PI*2); c.fill(); c.stroke();
      c.fillStyle = '#EAB308';
      for(let i=0;i<40;i++){
        const rr = Math.random()*dishR*0.85, aa = Math.random()*Math.PI*2;
        c.beginPath(); c.arc(sulfurX+Math.cos(aa)*rr, dishY+Math.sin(aa)*rr*0.32, Math.max(1.5,w*0.003), 0, Math.PI*2); c.fill();
      }
      c.fillStyle = g8cTxt(dark); c.font=`bold ${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
      c.fillText('الكبريت', sulfurX, dishY+dishR*0.32+h*0.05);
      c.font=`${Math.round(h*0.015)}px Tajawal`; c.fillStyle=g8cMut(dark);
      const sProps = ['هشّ','أصفر اللون','لا يوصّل الحرارة/الكهرباء','ليس ممغنطاً'];
      sProps.forEach((p,i)=> c.fillText(p, sulfurX, dishY+dishR*0.32+h*0.08+i*h*0.028));

      // طبق الحديد
      c.fillStyle = dark? '#2A2A30':'#E5E7EB'; c.strokeStyle=g8cMut(dark); c.lineWidth=3;
      c.beginPath(); c.ellipse(ironX, dishY, dishR, dishR*0.32, 0, 0, Math.PI*2); c.fill(); c.stroke();
      c.fillStyle = '#6B7280';
      for(let i=0;i<40;i++){
        const rr = Math.random()*dishR*0.85, aa = Math.random()*Math.PI*2;
        c.save(); c.translate(ironX+Math.cos(aa)*rr, dishY+Math.sin(aa)*rr*0.32); c.rotate(aa);
        c.fillRect(-w*0.006,-w*0.0012,w*0.012,w*0.0024);
        c.restore();
      }
      c.fillStyle = g8cTxt(dark); c.font=`bold ${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
      c.fillText('برادة الحديد', ironX, dishY+dishR*0.32+h*0.05);
      c.font=`${Math.round(h*0.015)}px Tajawal`; c.fillStyle=g8cMut(dark);
      const iProps = ['صلب وقويّ','رماديّ اللون','يوصّل الحرارة/الكهرباء','ممغنط'];
      iProps.forEach((p,i)=> c.fillText(p, ironX, dishY+dishR*0.32+h*0.08+i*h*0.028));
    } else {
      // ── وعاء واحد فيه الخليط (بعد الخلط)، يتحوّل تدريجياً بالتسخين إلى كتلة موحّدة ──
      const potX=w*0.5, potY=h*0.32, potW=w*0.30, potH=h*0.20;
      const lerp=(a,b,t)=>a+(b-a)*t;
      const bx = mixed && stId!=='start' ? lerp(0,1,mixIn) : 1; // موضع مؤقت (غير مستخدم مباشرة)

      c.fillStyle = dark?'rgba(210,220,230,0.10)':'rgba(255,255,255,0.5)'; c.strokeStyle=g8cMut(dark); c.lineWidth=3;
      c.beginPath();
      c.moveTo(potX-potW/2,potY); c.lineTo(potX-potW*0.42,potY+potH);
      c.quadraticCurveTo(potX,potY+potH+h*0.02,potX+potW*0.42,potY+potH);
      c.lineTo(potX+potW/2,potY); c.closePath(); c.fill(); c.stroke();

      c.save(); c.beginPath();
      c.moveTo(potX-potW*0.47,potY+h*0.01); c.lineTo(potX+potW*0.47,potY+h*0.01);
      c.lineTo(potX+potW*0.4,potY+potH); c.lineTo(potX-potW*0.4,potY+potH); c.closePath(); c.clip();

      // heatFrac: تقدّم التحوّل الكيميائي (٠ = خليط، ١ = مركّب كامل)
      const heatFrac = activeSince('heat') ? (justAfter('heat') ? S.heatT : 1) : 0;

      if(heatFrac<1){
        // رسم حبيبات مميّزة (حديد + كبريت) — تتقلّص وتندمج تدريجياً مع ارتفاع الحرارة
        for(const g of GRAINS){
          const gx = potX + Math.cos(g.a)*g.r*potW*0.42*mixIn + g.jx*w*0.01;
          const gy = potY+potH*0.55 + Math.sin(g.a)*g.r*potH*0.42*mixIn + g.jy*h*0.01;
          const shrink = 1-heatFrac*0.4;
          if(g.type==='sulfur'){ c.fillStyle='#EAB308'; c.beginPath(); c.arc(gx,gy,Math.max(1.5,w*0.0035)*shrink,0,Math.PI*2); c.fill(); }
          else { c.fillStyle='#6B7280'; c.save(); c.translate(gx,gy); c.rotate(g.a); c.fillRect(-w*0.005*shrink,-w*0.001,w*0.01*shrink,w*0.002); c.restore(); }
        }
      }
      if(heatFrac>0.05){
        // توهّج وامتزاج الألوان تدريجياً نحو الأسود الرمادي (كبريتيد الحديد)
        c.globalAlpha = Math.min(1,heatFrac*1.3);
        const glow = c.createRadialGradient(potX,potY+potH*0.55,0,potX,potY+potH*0.55,potW*0.45);
        const compCol = _g8pLerpColor('#8A6D2A', '#3F3A3D', heatFrac);
        glow.addColorStop(0, heatFrac<0.9 ? '#F97316' : compCol);
        glow.addColorStop(1, compCol);
        c.fillStyle = glow;
        c.beginPath(); c.ellipse(potX,potY+potH*0.55,potW*0.42*mixIn,potH*0.42*mixIn,0,0,Math.PI*2); c.fill();
        c.globalAlpha = 1;
      }
      c.restore();

      c.fillStyle = g8cTxt(dark); c.font=`bold ${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
      let label = 'مخلوط الحديد والكبريت';
      if(heatFrac>0.05 && heatFrac<1) label = 'جارٍ التسخين...';
      if(heatFrac>=1) label = 'كبريتيد الحديد (مركّب جديد)';
      c.fillText(label, potX, potY+potH+h*0.06);

      // مصدر الحرارة
      const fireOn = activeSince('heat') && S.heatT<1;
      if(fireOn || (S.heatT>=1 && idx<=idxOf('heat')+1)){
        const fScale = justAfter('heat') ? Math.min(1,S.heatT*3) : 1;
        c.save(); c.translate(potX, potY+potH+h*0.12); c.scale(fScale,fScale);
        const flick = Math.sin(Date.now()/90)*3;
        for(let i=-1;i<=1;i++){
          const grad = c.createLinearGradient(0,-30,0,4);
          grad.addColorStop(0, '#FDE68A'); grad.addColorStop(0.5, i===0?'#F97316':'#FB923C'); grad.addColorStop(1,'#EA580C');
          c.fillStyle = grad;
          c.beginPath(); c.moveTo(i*9,0);
          c.quadraticCurveTo(i*9+7+flick*0.3,-16,i*9,-28-Math.abs(flick));
          c.quadraticCurveTo(i*9-7-flick*0.3,-16,i*9,0); c.fill();
        }
        c.restore();
      }

      if(activeSince('heat') && S.heatT<1){
        const pct = Math.round(S.heatT*100);
        c.fillStyle = g8cAccent(dark); c.font=`bold ${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
        c.fillText(`🌡️ درجة الحرارة ترتفع... ${pct}%`, w/2, h*0.88);
      }

      // مقارنة قبل/بعد بعد اكتمال التسخين
      if(idx > idxOf('heat')+1){
        c.font=`${Math.round(h*0.017)}px Tajawal`; c.fillStyle=g8cMut(dark); c.textAlign='center';
        c.fillText('قبل: مخلوط (حديد + كبريت)   ↓ تسخين ↓   بعد: مركّب (كبريتيد الحديد)', w/2, h*0.94);
      }
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ── تاب ٢: الهواء — مخلوط من الغازات (كتاب الصف الثامن ص٤٩) ── */
function simG8Chem2N9b(){
  cancelAnimationFrame(animFrame);
  const GASES = [
    { id:'n2', name:'النيتروجين', formula:'N₂', col:'#3B82F6', atoms:2, info:'الغاز الأكثر وجوداً في الهواء.' },
    { id:'o2', name:'الأكسجين', formula:'O₂', col:'#EF4444', atoms:2, info:'الغاز الذي تحتاجه الكائنات الحيّة للتنفّس.' },
    { id:'co2', name:'ثاني أكسيد الكربون', formula:'CO₂', col:'#1F2937', atoms:3, info:'يتكوّن من ذرّة كربون مرتبطة بذرّتَي أكسجين.' },
    { id:'h2o', name:'بخار الماء', formula:'H₂O', col:'#E5E7EB', atoms:3, info:'كمّيته في الهواء متغيّرة، وترتبط بالرطوبة.' },
  ];
  const STEPS = [
    { id:'start',  btn:'🔍 اعرض مكونات الهواء', info:'ممّ يتكوّن الهواء؟ اضغط لتكتشف الغازات التي يتكوّن منها.' },
    { id:'reveal', btn:'🥤 اخلط بينها', info:'هذه الجزيئات الأربعة موجودة في الهواء. اضغط على أيّ جزيء لمعرفة معلومة عنه، ثمّ اضغط الزر لخلطها معاً.' },
    { id:'mix',    btn:'➡ متابعة', info:'لاحظ كيف بقيت الجزيئات مميّزة ولم تتّحد كيميائياً — هذا هو الهواء: مخلوط من عدّة غازات.' },
    { id:'q1',     btn:'', info:'', question:{
        q:'لماذا يُعتبر الهواء مخلوطاً وليس مركّباً؟',
        opts:['لأنّ غازاته غير متّحدة كيميائياً، ويحتفظ كلّ غاز بخصائصه الخاصة','لأنّه يحتوي على غاز واحد فقط','لأنّ جزيئاته تتّحد لتكوّن غازاً جديداً'],
        ans:0, fb:'✅ صحيح! يحتوي الهواء على عدّة عناصر ومركّبات (نيتروجين وأكسجين وثاني أكسيد كربون وبخار ماء) غير متّحدة معاً كيميائياً، ويحتفظ كلّ منها بخصائصه — لذلك الهواء مخلوط.'
      } },
    { id:'done',   btn:'', info:'' },
  ];
  const MAIN_IDS = STEPS.filter(s=>!s.question && s.id!=='done').map(s=>s.id);
  simState = { step:0, transT:1, answered:false, selectedGas:null };
  const S = simState;
  const idxOf = (id) => STEPS.findIndex(s=>s.id===id);

  function renderControls(){
    const st = STEPS[S.step];
    if(st.id==='done'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">💨 ماذا استنتجنا؟</div></div>
        <div style="padding:14px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(212,144,26,0.35)">
          <div style="font-weight:700;color:#D4901A;margin-bottom:8px">🎉 الهواء مخلوط من عدّة غازات!</div>
          <div style="font-size:13px;color:var(--text-secondary);line-height:1.9">
            يحتوي الهواء على النيتروجين والأكسجين وثاني أكسيد الكربون وبخار الماء وكمّيات صغيرة من غازات أخرى — وكلّها موجودة معاً دون أن تتّحد كيميائياً.
          </div>
        </div>
        <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g8cAirRestart()">↺ أعد التجربة</button>`;
    }
    let mainNum = 0;
    for(const id of MAIN_IDS){ if(idxOf(id) <= S.step) mainNum++; }
    mainNum = Math.max(1, mainNum);
    const progressHtml = `
      <div style="font-size:12px;color:var(--text-secondary);margin-bottom:6px">الخطوة ${mainNum} من ${MAIN_IDS.length}</div>
      <div style="height:6px;background:var(--bg-card2);border-radius:3px;overflow:hidden;margin-bottom:10px">
        <div style="height:100%;width:${Math.round(mainNum/MAIN_IDS.length*100)}%;background:#D4901A;transition:width .3s"></div>
      </div>`;
    if(st.question){
      const q = st.question;
      return `
        <div class="ctrl-section"><div class="ctrl-label">💨 استقصاء: الهواء مخلوط من الغازات</div></div>
        ${progressHtml}
        <div style="font-size:14px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px">${q.q}</div>
        <div id="g8cAirOpts" style="display:flex;flex-direction:column;gap:8px">
          ${q.opts.map((o,i)=>`<button id="g8cAirOpt${i}" onclick="window._g8cAirAnswer(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">${o}</button>`).join('')}
        </div>
        <div id="g8cAirFb" style="margin-top:10px;font-size:13px;color:var(--text-secondary);line-height:1.8"></div>`;
    }
    let gasInfo = '';
    if(st.id==='reveal'){
      gasInfo = `<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px">
        ${GASES.map(g=>`<button onclick="window._g8cAirSelect('${g.id}')" style="text-align:right;padding:9px;border-radius:8px;border:1.5px solid ${g.col}55;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">${g.formula} · ${g.name}</button>`).join('')}
      </div>
      <div id="g8cAirGasInfo" style="font-size:12.5px;color:var(--text-secondary);line-height:1.8;min-height:20px;margin-bottom:8px">${S.selectedGas ? GASES.find(g=>g.id===S.selectedGas).info : 'اضغط على أيّ جزيء أعلاه لمعرفة معلومة عنه'}</div>`;
    }
    return `
      <div class="ctrl-section">
        <div class="ctrl-label">💨 استقصاء: الهواء مخلوط من الغازات</div>
        ${progressHtml}
      </div>
      <div id="g8cAirInfo" style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;border:1px solid rgba(212,144,26,0.25);margin-bottom:12px">${st.info}</div>
      ${gasInfo}
      <button class="ctrl-btn play" onclick="window._g8cAirNext()">${st.btn}</button>`;
  }
  controls(renderControls());

  window._g8cAirSelect = function(id){
    _g8pPlayClick();
    S.selectedGas = id;
    const el = document.getElementById('g8cAirGasInfo');
    if(el) el.textContent = GASES.find(g=>g.id===id).info;
  };
  window._g8cAirNext = function(){
    _g8pPlayClick();
    S.step++;
    S.transT = 0.0001;
    controls(renderControls());
  };
  window._g8cAirAnswer = function(i){
    if(S.answered) return; S.answered = true;
    const q = STEPS[S.step].question;
    const ok = i===q.ans;
    _g8pPlayClick();
    const btn = document.getElementById('g8cAirOpt'+i);
    if(btn){ btn.style.background = ok?'#27AE60':'#E74C3C'; btn.style.color='white'; btn.style.borderColor= ok?'#27AE60':'#E74C3C'; }
    if(!ok){
      const okBtn = document.getElementById('g8cAirOpt'+q.ans);
      if(okBtn){ okBtn.style.background='#27AE60'; okBtn.style.color='white'; okBtn.style.borderColor='#27AE60'; }
    }
    const fb = document.getElementById('g8cAirFb');
    if(fb) fb.innerHTML = q.fb;
    setTimeout(()=>{ S.step++; S.transT=0.0001; S.answered=false; controls(renderControls()); }, 1700);
  };
  window._g8cAirRestart = function(){
    S.step=0; S.transT=1; S.answered=false; S.selectedGas=null;
    controls(renderControls());
  };

  const cv = document.getElementById('simCanvas');
  // مواضع أوّلية ثابتة لكلّ جزيء (تُستخدم قبل الخلط)
  const HOME_POS = [
    { x:0.22, y:0.30 }, { x:0.42, y:0.30 }, { x:0.62, y:0.30 }, { x:0.80, y:0.30 },
  ];
  // مواضع مبعثرة (بعد الخلط) — قريبة من بعضها في منتصف اللوحة لتوضّح أنّها مخلوط متجانس، وليست مبعثرة في كل الاتجاهات
  const SCATTER = (function(){
    const cx=0.5, cy=0.44, spread=0.16;
    const pts = [];
    for(let i=0;i<HOME_POS.length;i++){
      let tries=0, x,y;
      do{
        x = cx + (Math.random()-0.5)*spread*2;
        y = cy + (Math.random()-0.5)*spread*1.3;
        tries++;
      } while(pts.some(p=>Math.hypot(p.x-x,p.y-y)<0.09) && tries<30);
      pts.push({ x, y, spin: Math.random()*Math.PI*2 });
    }
    return pts;
  })();

  function drawMolecule(c, g, cx, cy, scale){
    const r = Math.max(6, scale*0.028);
    c.save(); c.translate(cx,cy);
    if(g.id==='n2'){
      c.fillStyle=g.col;
      c.beginPath(); c.arc(-r*0.7,0,r,0,Math.PI*2); c.fill();
      c.beginPath(); c.arc(r*0.7,0,r,0,Math.PI*2); c.fill();
    } else if(g.id==='o2'){
      c.fillStyle=g.col;
      c.beginPath(); c.arc(-r*0.7,0,r,0,Math.PI*2); c.fill();
      c.beginPath(); c.arc(r*0.7,0,r,0,Math.PI*2); c.fill();
    } else if(g.id==='co2'){
      c.fillStyle='#1F2937'; c.beginPath(); c.arc(0,0,r*0.9,0,Math.PI*2); c.fill();
      c.fillStyle='#EF4444';
      c.beginPath(); c.arc(-r*1.5,0,r*0.75,0,Math.PI*2); c.fill();
      c.beginPath(); c.arc(r*1.5,0,r*0.75,0,Math.PI*2); c.fill();
    } else { // h2o
      c.fillStyle='#EF4444'; c.beginPath(); c.arc(0,-r*0.3,r*0.95,0,Math.PI*2); c.fill();
      c.fillStyle=dark_h2o(); 
      c.beginPath(); c.arc(-r*1.1,r*0.55,r*0.65,0,Math.PI*2); c.fill();
      c.beginPath(); c.arc(r*1.1,r*0.55,r*0.65,0,Math.PI*2); c.fill();
    }
    c.restore();
  }
  function dark_h2o(){ return '#F3F4F6'; }

  function draw(){
    if(currentSim!=='g8chem2n9' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    c.fillStyle = g8cBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle = g8cTxt(dark);
    c.font = `bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ٩-٢ · الهواء مخلوط من عدّة غازات', w/2, h*0.05);

    const stId = STEPS[S.step] ? STEPS[S.step].id : 'done';
    const idx = idxOf(stId);
    const justAfter   = (id) => idx === idxOf(id) + 1;
    const activeSince = (id) => idx >= idxOf(id) + 1;
    if(S.transT<1) S.transT += 0.035;
    const tt = Math.min(1, S.transT);

    if(!activeSince('start')){
      c.fillStyle = g8cMut(dark); c.font=`${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
      c.fillText('ممّ يتكوّن الهواء؟ 🌫️', w/2, h*0.4);
      animFrame = requestAnimationFrame(draw);
      return;
    }

    const scattered = activeSince('reveal');
    const scatterT = justAfter('reveal') ? tt : 1;

    if(scattered){
      // دائرة توضّح أنّ الغازات أصبحت مجتمعة معاً في نفس الحيّز (الهواء) بعد الخلط
      c.save();
      c.globalAlpha = 0.5*Math.min(1,scatterT);
      c.strokeStyle = g8cAccent(dark); c.setLineDash([6,5]); c.lineWidth=2;
      c.beginPath(); c.arc(w*0.5, h*0.44, Math.min(w,h)*0.24, 0, Math.PI*2); c.stroke();
      c.restore();
    }

    GASES.forEach((g,i)=>{
      const home = HOME_POS[i], scat = SCATTER[i];
      let px, py;
      if(!scattered){
        px = w*home.x; py = h*home.y;
      } else {
        px = w*(home.x + (scat.x-home.x)*scatterT);
        py = h*(home.y + (scat.y-home.y)*scatterT);
      }
      drawMolecule(c, g, px, py, Math.min(w,h));
      if(!scattered || scatterT<1){
        c.fillStyle = g8cTxt(dark); c.font=`bold ${Math.round(h*0.019)}px Tajawal`; c.textAlign='center';
        c.fillText(g.formula, px, py+h*0.05);
        c.font=`${Math.round(h*0.014)}px Tajawal`; c.fillStyle=g8cMut(dark);
        c.fillText(g.name, px, py+h*0.075);
      }
    });

    if(scattered && scatterT>=1){
      c.fillStyle = g8cAccent(dark); c.font=`bold ${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
      c.fillText('💨 الهواء مخلوط من عدّة غازات', w/2, h*0.86);
      c.font=`${Math.round(h*0.015)}px Tajawal`; c.fillStyle=g8cMut(dark);
      c.fillText('كلّ جزيء محتفظ بشكله وخصائصه — لا يوجد اتّحاد كيميائي بينها', w/2, h*0.90);
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   نشاط ٢-٢ · الذرّات والعناصر — مكوّنات الذرة
   (كتاب الصف الثامن، الوحدة الثانية، ص٣٥)
   ══════════════════════════════════════════════════════════ */
function simG8Chem2N2a(){
  cancelAnimationFrame(animFrame);
  const PARTICLES = {
    nucleus:  { name:'نواة الذرّة', info:'تتجمّع البروتونات والنيوترونات معاً بالقرب من بعضها في مركز الذرّة وتشكّل نواة الذرّة.' },
    proton:   { name:'البروتون', info:'يحمل شحنة كهربائية موجبة. كتلته أكبر بكثير من كتلة الإلكترون.' },
    neutron:  { name:'النيوترون', info:'لا يحمل أيّ شحنة كهربائية. كتلته قريبة جداً من كتلة البروتون.' },
    electron: { name:'الإلكترون', info:'يحمل شحنة كهربائية سالبة، ويتحرّك حول نواة الذرّة. كتلته أقلّ بكثير من كتلة البروتون والنيوترون.' },
  };
  const STEPS = [
    { id:'start',  btn:'🔍 اعرض ذرّة الهيليوم', info:'دعنا نستكشف مكوّنات الذرّة معاً، باستخدام ذرّة الهيليوم مثالاً.' },
    { id:'shown',  btn:'▶ شاهد حركة الإلكترونات', info:'هذه ذرّة الهيليوم: نواة في المركز تحتوي على بروتونين ونيوترونين، وإلكترونان يدوران حولها. لاحظ المساحة الفارغة الكبيرة بين النواة والإلكترونات — لا يوجد أيّ شيء بداخلها إطلاقاً.' },
    { id:'moving', btn:'➡ متابعة', info:'اضغط على أيّ جزء من الذرّة أدناه لتتعرّف عليه أكثر، ثمّ اضغط "متابعة".' },
    { id:'q1', btn:'', info:'', question:{
        q:'ما الجسيم الموجود في الذرّة الذي يحمل شحنة كهربائية موجبة؟',
        opts:['البروتون','النيوترون','الإلكترون'], ans:0,
        fb:'✅ صحيح! يحمل البروتون شحنة كهربائية موجبة، بينما لا يحمل النيوترون أيّ شحنة، ويحمل الإلكترون شحنة سالبة.'
      } },
    { id:'q2', btn:'', info:'', question:{
        q:'أيّ الجسيمات الثلاثة له أقلّ كتلة؟',
        opts:['الإلكترون','البروتون','النيوترون'], ans:0,
        fb:'✅ صحيح! تكون كتلة البروتونات والنيوترونات أكبر بكثير من كتلة الإلكترونات — والتي تكاد كتلتها تكون مهملة مقارنةً بهما.'
      } },
    { id:'done', btn:'', info:'' },
  ];
  const MAIN_IDS = STEPS.filter(s=>!s.question && s.id!=='done').map(s=>s.id);
  simState = { step:0, transT:1, answered:false, selectedPart:null };
  const S = simState;
  const idxOf = (id) => STEPS.findIndex(s=>s.id===id);

  function renderControls(){
    const st = STEPS[S.step];
    if(st.id==='done'){
      return `
        <div class="ctrl-section"><div class="ctrl-label">⚛️ ماذا استنتجنا؟</div></div>
        <div style="padding:14px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(212,144,26,0.35)">
          <div style="font-weight:700;color:#D4901A;margin-bottom:8px">🎉 مكوّنات الذرّة</div>
          <div style="font-size:13px;color:var(--text-secondary);line-height:1.9">
            • لكلّ عنصر الرمز الكيميائي الخاصّ به.<br>
            • تتكوّن الذرّات من بروتونات ونيوترونات وإلكترونات.<br>
            • تتكوّن نواة الذرّة من بروتونات ونيوترونات.<br>
            • تتحرّك الإلكترونات حول نواة الذرّة.
          </div>
        </div>
        <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g8cAtomRestart()">↺ أعد الاستكشاف</button>`;
    }
    let mainNum = 0;
    for(const id of MAIN_IDS){ if(idxOf(id) <= S.step) mainNum++; }
    mainNum = Math.max(1, mainNum);
    const progressHtml = `
      <div style="font-size:12px;color:var(--text-secondary);margin-bottom:6px">الخطوة ${mainNum} من ${MAIN_IDS.length}</div>
      <div style="height:6px;background:var(--bg-card2);border-radius:3px;overflow:hidden;margin-bottom:10px">
        <div style="height:100%;width:${Math.round(mainNum/MAIN_IDS.length*100)}%;background:#D4901A;transition:width .3s"></div>
      </div>`;
    if(st.question){
      const q = st.question;
      return `
        <div class="ctrl-section"><div class="ctrl-label">⚛️ استقصاء: مكوّنات الذرّة</div></div>
        ${progressHtml}
        <div style="font-size:14px;font-weight:700;background:var(--bg-card2);border-radius:10px;padding:14px;margin-bottom:12px">${q.q}</div>
        <div id="g8cAtomOpts" style="display:flex;flex-direction:column;gap:8px">
          ${q.opts.map((o,i)=>`<button id="g8cAtomOpt${i}" onclick="window._g8cAtomAnswer(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer">${o}</button>`).join('')}
        </div>
        <div id="g8cAtomFb" style="margin-top:10px;font-size:13px;color:var(--text-secondary);line-height:1.8"></div>`;
    }
    let exploreHtml = '';
    if(st.id==='moving'){
      exploreHtml = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
        ${Object.keys(PARTICLES).map(k=>`<button onclick="window._g8cAtomSelect('${k}')" style="padding:9px;border-radius:8px;border:1.5px solid #D4901A55;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:12.5px">${PARTICLES[k].name}</button>`).join('')}
      </div>
      <div id="g8cAtomPartInfo" style="font-size:12.5px;color:var(--text-secondary);line-height:1.8;min-height:20px;margin-bottom:10px;background:var(--bg-card2);border-radius:8px;padding:${S.selectedPart?'10px':'0px'}">${S.selectedPart ? ('<strong>'+PARTICLES[S.selectedPart].name+':</strong> '+PARTICLES[S.selectedPart].info) : ''}</div>`;
    }
    return `
      <div class="ctrl-section">
        <div class="ctrl-label">⚛️ استقصاء: مكوّنات الذرّة</div>
        ${progressHtml}
      </div>
      <div id="g8cAtomInfo" style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;border:1px solid rgba(212,144,26,0.25);margin-bottom:12px">${st.info}</div>
      ${exploreHtml}
      <button class="ctrl-btn play" onclick="window._g8cAtomNext()">${st.btn}</button>`;
  }
  controls(renderControls());

  window._g8cAtomSelect = function(k){
    _g8pPlayClick();
    S.selectedPart = k;
    controls(renderControls());
  };
  window._g8cAtomNext = function(){
    _g8pPlayClick();
    S.step++;
    S.transT = 0.0001;
    controls(renderControls());
  };
  window._g8cAtomAnswer = function(i){
    if(S.answered) return; S.answered = true;
    const q = STEPS[S.step].question;
    const ok = i===q.ans;
    _g8pPlayClick();
    const btn = document.getElementById('g8cAtomOpt'+i);
    if(btn){ btn.style.background = ok?'#27AE60':'#E74C3C'; btn.style.color='white'; btn.style.borderColor= ok?'#27AE60':'#E74C3C'; }
    if(!ok){
      const okBtn = document.getElementById('g8cAtomOpt'+q.ans);
      if(okBtn){ okBtn.style.background='#27AE60'; okBtn.style.color='white'; okBtn.style.borderColor='#27AE60'; }
    }
    const fb = document.getElementById('g8cAtomFb');
    if(fb) fb.innerHTML = q.fb;
    setTimeout(()=>{ S.step++; S.transT=0.0001; S.answered=false; controls(renderControls()); }, 1700);
  };
  window._g8cAtomRestart = function(){
    S.step=0; S.transT=1; S.answered=false; S.selectedPart=null;
    controls(renderControls());
  };

  const cv = document.getElementById('simCanvas');

  function draw(){
    if(currentSim!=='g8chem2n2' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    c.fillStyle = g8cBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle = g8cTxt(dark);
    c.font = `bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ٢-٢ · مكوّنات الذرّة', w/2, h*0.05);

    const stId = STEPS[S.step] ? STEPS[S.step].id : 'done';
    const idx = idxOf(stId);
    if(S.transT<1) S.transT += 0.05;
    const tt = Math.min(1, S.transT);

    if(idx < idxOf('shown')){
      c.fillStyle = g8cMut(dark); c.font=`${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
      c.fillText('اضغط الزر لعرض ذرّة الهيليوم ⚛️', w/2, h*0.45);
      animFrame = requestAnimationFrame(draw);
      return;
    }

    const cx = w*0.5, cy = h*0.46;
    const orbitR = Math.min(w,h)*0.26;
    const isMoving = idx >= idxOf('moving');
    const showIn = idx===idxOf('shown') ? tt : 1;

    // ── المسار الذي يتّبعه الإلكترون (دائرة خفيفة) ──
    c.save(); c.globalAlpha = 0.5*showIn;
    c.strokeStyle = g8cMut(dark); c.setLineDash([4,6]); c.lineWidth=1.5;
    c.beginPath(); c.arc(cx,cy,orbitR,0,Math.PI*2); c.stroke();
    c.setLineDash([]);
    c.restore();

    // ── النواة: بروتونان (أحمر) ونيوترونان (رمادي مزرق) متلاصقة في المركز ──
    const nucR = Math.max(7, Math.min(w,h)*0.018);
    const nucOffsets = [ {x:-nucR*0.9,y:-nucR*0.5,type:'p'}, {x:nucR*0.9,y:-nucR*0.5,type:'n'}, {x:-nucR*0.9,y:nucR*0.5,type:'n'}, {x:nucR*0.9,y:nucR*0.5,type:'p'} ];
    const nucGlow = document.getElementById('g8cAtomPartInfo') && S.selectedPart==='nucleus';
    if(S.selectedPart==='nucleus' && idx>=idxOf('moving')){
      c.save(); c.globalAlpha=0.25; c.fillStyle=g8cAccent(dark);
      c.beginPath(); c.arc(cx,cy,nucR*2.6,0,Math.PI*2); c.fill(); c.restore();
    }
    nucOffsets.forEach(o=>{
      c.beginPath(); c.arc(cx+o.x*showIn, cy+o.y*showIn, nucR*showIn, 0, Math.PI*2);
      c.fillStyle = o.type==='p' ? '#EF4444' : '#6B7280';
      c.fill();
      c.strokeStyle = dark?'#00000055':'#ffffff88'; c.lineWidth=1; c.stroke();
    });

    // ── الإلكترونان: يدوران باستمرار بعد الوصول لخطوة "moving" فما بعد ──
    const elR = Math.max(5, Math.min(w,h)*0.013);
    const baseAngle = isMoving ? (Date.now()/1100) : (Math.PI*0.15);
    for(let i=0;i<2;i++){
      const ang = baseAngle + i*Math.PI;
      const ex = cx+Math.cos(ang)*orbitR*showIn, ey = cy+Math.sin(ang)*orbitR*0.55*showIn;
      c.beginPath(); c.arc(ex,ey,elR,0,Math.PI*2);
      c.fillStyle = '#22C55E'; c.fill();
      c.strokeStyle = dark?'#00000055':'#ffffff88'; c.lineWidth=1; c.stroke();
      if(idx===idxOf('shown')){
        // علامة × على المسار كما في الكتاب
        c.strokeStyle = g8cMut(dark); c.lineWidth=1.5;
        c.beginPath(); c.moveTo(ex-4,ey-4); c.lineTo(ex+4,ey+4); c.moveTo(ex-4,ey+4); c.lineTo(ex+4,ey-4); c.stroke();
      }
    }

    // ── تسميات (تظهر في مرحلة العرض الأولى فقط لتفادي الازدحام لاحقاً) ──
    if(idx===idxOf('shown')){
      c.fillStyle = g8cTxt(dark); c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
      c.globalAlpha = showIn;
      c.fillText('نواة الذرّة (بروتونات + نيوترونات)', cx, cy+nucR*2+h*0.045);
      c.fillText('إلكترون', cx, cy-orbitR*0.55-h*0.02);
      c.fillText('مساحة فارغة', cx+orbitR*0.55, cy-orbitR*0.2);
      c.globalAlpha = 1;
    }
    if(idx>=idxOf('shown')){
      c.fillStyle = g8cAccent(dark); c.font=`bold ${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
      c.fillText('ذرّة الهيليوم He', cx, cy+orbitR+h*0.09);
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}
