// ══════════════════════════════════════════════════════════════
// الوحدة ١ · جسم الإنسان — الصف السادس (الفصل الدراسي الأول)
// الدرس ١ · أعضاء الجسم
// ══════════════════════════════════════════════════════════════

function g6bBg(dark){ return dark ? '#12141C' : '#F5F3EE'; }
function g6bTxt(dark){ return dark ? '#E8E4D8' : '#2C3A4A'; }
function g6bMut(dark){ return dark ? '#9AA5B5' : '#7A8A98'; }

function _g6bPlayChime(ok){
  try{
    const ac = new (window.AudioContext||window.webkitAudioContext)();
    const t = ac.currentTime;
    const freqs = ok ? [523,659,784] : [220,196];
    freqs.forEach((f,i)=>{
      const o=ac.createOscillator(), g=ac.createGain();
      o.type='sine'; o.frequency.value=f;
      o.connect(g); g.connect(ac.destination);
      const st=t+i*0.09;
      g.gain.setValueAtTime(0,st);
      g.gain.linearRampToValueAtTime(0.09,st+0.02);
      g.gain.exponentialRampToValueAtTime(0.001,st+0.32);
      o.start(st); o.stop(st+0.34);
    });
  }catch(e){}
}
function _g6bPlayPulse(){
  try{
    const ac = new (window.AudioContext||window.webkitAudioContext)();
    const t = ac.currentTime;
    [0,0.18].forEach(off=>{
      const o=ac.createOscillator(), g=ac.createGain();
      o.type='sine'; o.frequency.value=90;
      o.connect(g); g.connect(ac.destination);
      g.gain.setValueAtTime(0,t+off);
      g.gain.linearRampToValueAtTime(0.15,t+off+0.03);
      g.gain.exponentialRampToValueAtTime(0.001,t+off+0.18);
      o.start(t+off); o.stop(t+off+0.2);
    });
  }catch(e){}
}
function _g6bPlayClick(){
  try{
    const ac = new (window.AudioContext||window.webkitAudioContext)();
    const o=ac.createOscillator(), g=ac.createGain();
    o.type='sine'; o.frequency.value=500;
    o.connect(g); g.connect(ac.destination);
    const t=ac.currentTime;
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.06,t+0.015);
    g.gain.exponentialRampToValueAtTime(0.001,t+0.14);
    o.start(t); o.stop(t+0.16);
  }catch(e){}
}

/* ════════════════════════════════════════
   الدرس ١ · التاب ١ — استقصاء: أعضاء الجسم (سحب وإفلات)
════════════════════════════════════════ */
function simG6Body1a(){
  cancelAnimationFrame(animFrame);

  const ORGANS = [
    { id:'brain',  name:'الدماغ',   emoji:'🧠', color:'#F4A6A0', tx:0.50, ty:0.115, fn:'يتحكّم في كل شيء يقوم به الجسم ويستقبل رسائل الحواس.' },
    { id:'heart',  name:'القلب',    emoji:'❤️', color:'#E74C3C', tx:0.44, ty:0.315, fn:'يضخّ الدم ليصل إلى جميع أجزاء الجسم.' },
    { id:'lungs',  name:'الرئتان',  emoji:'🫁', color:'#5DADE2', tx:0.57, ty:0.30,  fn:'تُستخدَمان للتنفّس — دخول الأكسجين وخروج ثاني أكسيد الكربون.' },
    { id:'stomach',name:'المعدة',   emoji:'🍽️', color:'#F5B041', tx:0.46, ty:0.44,  fn:'تهضم الطعام بمزجه مع العصارات الهضمية.' },
    { id:'kidneys',name:'الكليتان', emoji:'🫘', color:'#AF7AC5', tx:0.55, ty:0.475, fn:'تُرشِّحان الدم وتُخرجان الفضلات على شكل بول.' },
    { id:'intestines',name:'الأمعاء',emoji:'🌀', color:'#58D68D', tx:0.50, ty:0.55,  fn:'تُكمل هضم الطعام وتنقل الغذاء الممتص إلى الدم.' },
  ];

  simState = { placed:{}, dragId:null, dragX:0, dragY:0, tray:[], done:false };
  const S = simState;
  ORGANS.forEach((o,i)=>{ S.tray.push({ ...o, x: 0.1 + (i%3)*0.16, y: 0.78 + Math.floor(i/3)*0.15, placed:false }); });

  function renderControls(){
    const n = Object.keys(S.placed).length;
    return `
      <div class="ctrl-section">
        <div class="ctrl-label">🫀 استقصاء: أعضاء الجسم</div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.8;margin-bottom:10px">
          اسحب كل عضو من الأسفل وأفلته في مكانه الصحيح داخل الجسم. حاول أولاً بنفسك قبل قراءة الوظيفة!
        </div>
      </div>
      <div id="g6bProgress" style="font-size:13px;font-weight:700;color:#27AE60;margin-bottom:10px">التقدّم: ${n} / ${ORGANS.length}</div>
      <div id="g6bInfo" style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;border:1px solid rgba(39,174,96,0.18);min-height:40px">
        اسحب أول عضو لتبدأ الاستقصاء 👆
      </div>
      <div id="g6bSummary"></div>`;
  }
  controls(renderControls());

  const cv = document.getElementById('simCanvas');

  function relPos(e){
    const rect = cv.getBoundingClientRect();
    const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
    return { x:(t.clientX-rect.left)/cv.offsetWidth, y:(t.clientY-rect.top)/cv.offsetHeight };
  }
  function findAt(x,y){
    for(let i=S.tray.length-1;i>=0;i--){
      const o = S.tray[i];
      if(o.placed) continue;
      if(Math.abs(x-o.x)<0.06 && Math.abs(y-o.y)<0.06) return o;
    }
    return null;
  }
  function onDown(e){
    const p = relPos(e); const o = findAt(p.x,p.y);
    if(o){ S.dragId=o.id; S.dragX=p.x; S.dragY=p.y; }
  }
  function onMove(e){
    if(!S.dragId) return;
    const p = relPos(e); S.dragX=p.x; S.dragY=p.y;
    const o = S.tray.find(t=>t.id===S.dragId); if(o){ o.x=p.x; o.y=p.y; }
  }
  function onUp(){
    if(!S.dragId) return;
    const o = S.tray.find(t=>t.id===S.dragId);
    const target = ORGANS.find(g=>g.id===o.id);
    const dist = Math.hypot(o.x-target.tx, o.y-target.ty);
    if(dist < 0.08){
      o.x = target.tx; o.y = target.ty; o.placed = true;
      S.placed[o.id] = true;
      _g6bPlayPulse();
      const infoEl = document.getElementById('g6bInfo');
      if(infoEl) infoEl.innerHTML = `<strong>${target.emoji} ${target.name}:</strong> ${target.fn}`;
      const prog = document.getElementById('g6bProgress');
      const n = Object.keys(S.placed).length;
      if(prog) prog.textContent = `التقدّم: ${n} / ${ORGANS.length}`;
      if(n === ORGANS.length && !S.done){
        S.done = true;
        _g6bPlayChime(true);
        const sum = document.getElementById('g6bSummary');
        if(sum) sum.innerHTML = `
          <div style="margin-top:14px;padding:12px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(39,174,96,0.3)">
            <div style="font-size:13px;font-weight:700;color:#16A34A;margin-bottom:6px">🎉 أحسنت! ماذا تعلّمت؟</div>
            <div style="font-size:12px;color:var(--text-secondary);line-height:1.8)">تعرّفت على ستة أعضاء رئيسية في الجسم ومكان كلٍّ منها ووظيفته: الدماغ للتحكّم، والقلب لضخّ الدم، والرئتان للتنفّس، والمعدة والأمعاء للهضم، والكليتان لتنقية الدم.</div>
          </div>`;
      }
    } else {
      _g6bPlayClick();
    }
    S.dragId = null;
  }
  cv.onmousedown = onDown; cv.onmousemove = onMove; cv.onmouseup = onUp; cv.onmouseleave = onUp;
  cv.ontouchstart = e=>{ e.preventDefault(); onDown(e); };
  cv.ontouchmove  = e=>{ e.preventDefault(); onMove(e); };
  cv.ontouchend   = e=>{ e.preventDefault(); onUp(e); };

  function draw(){
    if(currentSim!=='g6body1' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();

    c.fillStyle = g6bBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle = g6bTxt(dark);
    c.font = `bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
    c.fillText('١-١ · أعضاء الجسم', w/2, h*0.045);

    // جسم بسيط (خطوط تخطيطية)
    const bx = w*0.5, by = h*0.06, bw = w*0.28, bh = h*0.62;
    c.strokeStyle = dark? 'rgba(230,220,200,0.55)':'rgba(50,60,75,0.45)';
    c.lineWidth = Math.max(2,h*0.006);
    c.beginPath(); c.arc(bx, by+bh*0.09, bw*0.16, 0, Math.PI*2); c.stroke(); // رأس
    c.beginPath();
    c.moveTo(bx-bw*0.22, by+bh*0.22); c.lineTo(bx-bw*0.3, by+bh*0.66);
    c.lineTo(bx-bw*0.14, by+bh*0.98); c.lineTo(bx, by+bh*0.9);
    c.lineTo(bx+bw*0.14, by+bh*0.98); c.lineTo(bx+bw*0.3, by+bh*0.66);
    c.lineTo(bx+bw*0.22, by+bh*0.22); c.closePath(); c.stroke(); // جذع وأرجل مبسطة

    // مناطق الهدف (خفيفة إن لم توضع بعد)
    ORGANS.forEach(t=>{
      if(!S.placed[t.id]){
        c.save(); c.globalAlpha = 0.18;
        c.fillStyle = t.color;
        c.beginPath(); c.arc(t.tx*w, t.ty*h, w*0.045, 0, Math.PI*2); c.fill();
        c.restore();
      }
    });

    // العناصر القابلة للسحب (وضعت أو ما زالت في الدرج)
    S.tray.forEach(o=>{
      const r = w*0.042;
      c.save();
      if(S.dragId===o.id){ c.shadowColor='rgba(0,0,0,0.35)'; c.shadowBlur=10; }
      c.fillStyle = o.color;
      c.beginPath(); c.arc(o.x*w, o.y*h, r, 0, Math.PI*2); c.fill();
      if(o.placed){ c.strokeStyle='#16A34A'; c.lineWidth=3; c.stroke(); }
      c.restore();
      c.font = `${Math.round(r*1.1)}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(o.emoji, o.x*w, o.y*h);
      c.font = `bold ${Math.round(h*0.02)}px Tajawal`;
      c.fillStyle = g6bTxt(dark);
      c.fillText(o.name, o.x*w, o.y*h + r + h*0.025);
    });
    c.textBaseline = 'alphabetic';

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   الدرس ١ · التاب ٢ — نشاط: اختر العضو المناسب
════════════════════════════════════════ */
function simG6Body1b(){
  cancelAnimationFrame(animFrame);

  const ROUNDS = [
    { q:'أتنفّس', opts:['الرئتان','المعدة','الكليتان'], ans:'الرئتان', emoji:'🌬️' },
    { q:'أفكّر وأتذكّر',   opts:['القلب','الدماغ','الأمعاء'], ans:'الدماغ', emoji:'💭' },
    { q:'أهضم الطعام',    opts:['الرئتان','الدماغ','المعدة'], ans:'المعدة', emoji:'🍎' },
    { q:'أضخّ الدم إلى الجسم كله', opts:['القلب','الكليتان','الرئتان'], ans:'القلب', emoji:'🩸' },
    { q:'أرشّح الفضلات من الدم',  opts:['الكليتان','المعدة','الدماغ'], ans:'الكليتان', emoji:'💧' },
  ];
  simState = { round:0, correct:0, answered:false };
  const S = simState;

  function renderControls(){
    if(S.round >= ROUNDS.length){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🎯 اختر العضو المناسب</div></div>
        <div style="margin-top:10px;padding:14px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(39,174,96,0.3)">
          <div style="font-size:14px;font-weight:700;color:#16A34A;margin-bottom:6px">🎉 انتهى النشاط!</div>
          <div style="font-size:13px;color:var(--text-secondary);margin-bottom:10px">أجبت بشكل صحيح في ${S.correct} من ${ROUNDS.length} مواقف.</div>
          <div style="font-size:12px;color:var(--text-secondary);line-height:1.8">ماذا تعلّمت؟ كل عضو في الجسم مسؤول عن وظيفة محدّدة، وهذه الأعضاء تعمل معاً لتُبقيك حياً وبصحة جيدة.</div>
        </div>
        <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g6bRestart()">↺ العب مرة أخرى</button>`;
    }
    const r = ROUNDS[S.round];
    return `
      <div class="ctrl-section">
        <div class="ctrl-label">🎯 اختر العضو المناسب</div>
        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px">الموقف ${S.round+1} من ${ROUNDS.length}</div>
      </div>
      <div style="font-size:15px;font-weight:700;color:var(--text-primary);background:var(--bg-card2);border-radius:10px;padding:14px;text-align:center;margin-bottom:12px">${r.emoji} "${r.q}"</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${r.opts.map(o=>`<button id="g6bOpt_${o}" onclick="window._g6bAnswer('${o}')" style="padding:11px 14px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-size:14px;font-weight:700;cursor:pointer">${o}</button>`).join('')}
      </div>
      <div id="g6bFeedback" style="margin-top:10px;font-size:13px;min-height:20px"></div>`;
  }
  controls(renderControls());

  window._g6bAnswer = function(choice){
    if(S.answered) return;
    S.answered = true;
    const r = ROUNDS[S.round];
    const ok = choice === r.ans;
    if(ok) S.correct++;
    _g6bPlayChime(ok);
    const btn = document.getElementById('g6bOpt_'+choice);
    if(btn){ btn.style.background = ok?'#27AE60':'#E74C3C'; btn.style.color='white'; btn.style.borderColor = ok?'#27AE60':'#E74C3C'; }
    if(!ok){
      const okBtn = document.getElementById('g6bOpt_'+r.ans);
      if(okBtn){ okBtn.style.background='#27AE60'; okBtn.style.color='white'; okBtn.style.borderColor='#27AE60'; }
    }
    const fb = document.getElementById('g6bFeedback');
    if(fb) fb.innerHTML = ok ? '✅ إجابة صحيحة!' : `❌ الإجابة الصحيحة هي "${r.ans}"`;
    setTimeout(()=>{ S.round++; S.answered=false; controls(renderControls()); }, 1100);
  };
  window._g6bRestart = function(){ S.round=0; S.correct=0; S.answered=false; controls(renderControls()); };

  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g6body1' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    c.fillStyle = g6bBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle = g6bTxt(dark);
    c.font = `bold ${Math.round(h*0.036)}px Tajawal`; c.textAlign='center';
    c.fillText('١-١ · من المسؤول؟', w/2, h*0.09);
    c.font = `${Math.round(h*0.13)}px serif`;
    c.fillText(S.round < ROUNDS.length ? ROUNDS[S.round].emoji : '🎉', w/2, h*0.42);
    c.fillStyle = g6bMut(dark);
    c.font = `${Math.round(h*0.03)}px Tajawal`;
    c.fillText(S.round < ROUNDS.length ? 'اختر إجابتك من القائمة' : 'أحسنت صنعاً!', w/2, h*0.58);
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   الدرس ٢ · التاب ١ — استقصاء: نبضات القلب وضخّ الدم
════════════════════════════════════════ */
function simG6Body2a(){
  cancelAnimationFrame(animFrame);
  simState = { running:false, t:0, speed:1, dots:[] };
  const S = simState;

  function renderControls(){
    return `
      <div class="ctrl-section">
        <div class="ctrl-label">❤️ استقصاء: نبضات القلب</div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.8;margin-bottom:10px">
          اضغط الزر لتبدأ مشاهدة القلب وهو يضخّ الدم، ثم غيّر سرعة النبض ولاحظ ماذا يحدث لحركة الدم.
        </div>
      </div>
      <button class="ctrl-btn play" id="g6bHeartBtn" onclick="window._g6bHeartToggle()">${S.running ? '⏸ إيقاف' : '▶ ابدأ ضخّ الدم'}</button>
      <div class="ctrl-section" style="margin-top:14px">
        <div class="ctrl-label">⚡ سرعة النبض</div>
        <input type="range" min="0.4" max="2.2" step="0.1" value="${S.speed}" oninput="window._g6bHeartSpeed(this.value)" style="width:100%">
      </div>
      <div id="g6bHeartInfo" style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;border:1px solid rgba(231,76,60,0.2);margin-top:10px">
        ❤️ القلب ساكن الآن. اضغط "ابدأ ضخّ الدم" لتشاهد رحلة الدم في الجسم.
      </div>`;
  }
  controls(renderControls());

  window._g6bHeartToggle = function(){
    S.running = !S.running;
    const btn = document.getElementById('g6bHeartBtn');
    if(btn) btn.textContent = S.running ? '⏸ إيقاف' : '▶ ابدأ ضخّ الدم';
    _g6bPlayClick();
    const info = document.getElementById('g6bHeartInfo');
    if(info) info.innerHTML = S.running
      ? '❤️ القلب ينقبض وينبسط باستمرار ليضخّ الدم إلى كل أجزاء الجسم دون توقف!'
      : '⏸ توقّف القلب عن الحركة مؤقتاً — اضغط الزر لإعادة تشغيله.';
  };
  window._g6bHeartSpeed = function(v){
    S.speed = parseFloat(v);
    const info = document.getElementById('g6bHeartInfo');
    if(info && S.running) info.innerHTML = S.speed > 1.3
      ? '⚡ كلما زادت سرعة النبض، زادت سرعة وصول الدم لأجزاء الجسم — يحدث هذا مثلاً أثناء الجري!'
      : '🧘 نبض بطيء يعني القلب مرتاح — يحدث هذا عادة أثناء الراحة أو النوم.';
  };

  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g6body2' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    c.fillStyle = g6bBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle = g6bTxt(dark);
    c.font = `bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
    c.fillText('١-٢ · القلب', w/2, h*0.06);

    if(S.running) S.t += 0.028 * S.speed;
    const beat = S.running ? 1 + Math.max(0, Math.sin(S.t*Math.PI*2))*0.12 : 1;

    // القلب (شكلان دائريان + مثلث)
    const hx = w*0.42, hy = h*0.42, r = w*0.075*beat;
    c.fillStyle = '#E74C3C';
    c.beginPath(); c.arc(hx-r*0.55, hy, r*0.62, 0, Math.PI*2); c.fill();
    c.beginPath(); c.arc(hx+r*0.55, hy, r*0.62, 0, Math.PI*2); c.fill();
    c.beginPath(); c.moveTo(hx-r*1.1, hy+r*0.25); c.lineTo(hx+r*1.1, hy+r*0.25); c.lineTo(hx, hy+r*1.5); c.closePath(); c.fill();

    // مسار دم متحرك نحو الجسم (يمين) وعودته
    const bodyX = w*0.74, bodyY = h*0.42;
    c.strokeStyle = dark?'rgba(230,220,200,0.4)':'rgba(50,60,75,0.35)'; c.lineWidth=2;
    c.beginPath(); c.roundRect(bodyX-w*0.09, bodyY-h*0.22, w*0.18, h*0.44, 12); c.stroke();
    c.font = `${Math.round(h*0.03)}px Tajawal`; c.fillStyle=g6bMut(dark); c.textAlign='center';
    c.fillText('باقي الجسم', bodyX, bodyY+h*0.3);

    if(S.running){
      if(Math.random() < 0.08*S.speed) S.dots.push({x:hx, y:hy, dir:1, age:0});
      S.dots = S.dots.filter(d=>d.age<1);
      S.dots.forEach(d=>{
        d.age += 0.012*S.speed;
        const px = hx + (bodyX-hx)*d.age;
        const py = hy + Math.sin(d.age*Math.PI)*-h*0.06;
        c.fillStyle = d.age<0.5 ? '#E74C3C' : '#3B82F6';
        c.beginPath(); c.arc(px,py,Math.max(3,h*0.011),0,Math.PI*2); c.fill();
      });
    }
    c.fillStyle = g6bTxt(dark); c.font=`bold ${Math.round(h*0.028)}px Tajawal`;
    c.fillText(S.running ? `النبض: ${(S.speed*72|0)} نبضة/د تقريباً` : 'القلب متوقف', w/2, h*0.86);

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   الدرس ٢ · التاب ٢ — نشاط: رتّب مسار الدم داخل القلب
════════════════════════════════════════ */
function simG6Body2b(){
  cancelAnimationFrame(animFrame);
  const STEPS = [
    { id:0, text:'الدم يدخل الأذين الأيمن' },
    { id:1, text:'ينتقل إلى البطين الأيمن ثم إلى الرئتين' },
    { id:2, text:'يعود بالأكسجين إلى الأذين الأيسر' },
    { id:3, text:'ينتقل إلى البطين الأيسر ثم يُضخّ إلى الجسم' },
  ];
  simState = { chips:[], slots:[null,null,null,null], dragId:null, checked:false, done:false };
  const S = simState;
  const shuffled = [...STEPS].sort(()=>Math.random()-0.5);
  shuffled.forEach((s,i)=>{ S.chips.push({ id:s.id, text:s.text, x:0.14+(i%2)*0.36, y:0.68+Math.floor(i/2)*0.15, inSlot:-1 }); });

  function renderControls(){
    return `
      <div class="ctrl-section">
        <div class="ctrl-label">🔀 رتّب مسار الدم داخل القلب</div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.8;margin-bottom:10px">
          اسحب كل بطاقة إلى الخانة المناسبة لترتيب رحلة الدم، ثم اضغط "تحقّق".
        </div>
      </div>
      <button class="ctrl-btn play" onclick="window._g6bCheck()">✅ تحقّق من الترتيب</button>
      <div id="g6bOrderFeedback" style="margin-top:12px;font-size:13px;line-height:1.9;color:var(--text-secondary)"></div>`;
  }
  controls(renderControls());

  const cv = document.getElementById('simCanvas');
  function relPos(e){
    const rect = cv.getBoundingClientRect();
    const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
    return { x:(t.clientX-rect.left)/cv.offsetWidth, y:(t.clientY-rect.top)/cv.offsetHeight };
  }
  const slotPos = [ {x:0.5,y:0.14}, {x:0.5,y:0.32}, {x:0.5,y:0.50}, {x:0.5,y:0.68} ];
  function findChipAt(x,y){
    for(let i=S.chips.length-1;i>=0;i--){
      const ch = S.chips[i];
      if(Math.abs(x-ch.x)<0.17 && Math.abs(y-ch.y)<0.05) return ch;
    }
    return null;
  }
  function onDown(e){ const p=relPos(e); const ch=findChipAt(p.x,p.y); if(ch) S.dragId=ch.id; }
  function onMove(e){
    if(S.dragId==null) return;
    const p = relPos(e);
    const ch = S.chips.find(c=>c.id===S.dragId);
    if(ch){ ch.x=p.x; ch.y=p.y; }
  }
  function onUp(){
    if(S.dragId==null) return;
    const ch = S.chips.find(c=>c.id===S.dragId);
    let placed = false;
    for(let i=0;i<4;i++){
      if(Math.abs(ch.x-slotPos[i].x)<0.22 && Math.abs(ch.y-slotPos[i].y)<0.07){
        if(S.slots[i]==null || S.slots[i]===ch.id){
          if(ch.inSlot>=0) S.slots[ch.inSlot]=null;
          S.slots[i]=ch.id; ch.inSlot=i; ch.x=slotPos[i].x; ch.y=slotPos[i].y;
          placed = true; _g6bPlayClick();
        }
        break;
      }
    }
    if(!placed && ch.inSlot>=0){ ch.x=slotPos[ch.inSlot].x; ch.y=slotPos[ch.inSlot].y; }
    S.dragId = null;
  }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp; cv.onmouseleave=onUp;
  cv.ontouchstart=e=>{e.preventDefault();onDown(e);};
  cv.ontouchmove=e=>{e.preventDefault();onMove(e);};
  cv.ontouchend=e=>{e.preventDefault();onUp(e);};

  window._g6bCheck = function(){
    const allCorrect = S.slots.every((id,i)=>id===i);
    const allFilled = S.slots.every(id=>id!=null);
    _g6bPlayChime(allCorrect && allFilled);
    const fb = document.getElementById('g6bOrderFeedback');
    if(!allFilled){ if(fb) fb.innerHTML = '⚠️ رتّب جميع البطاقات الأربع أولاً.'; return; }
    if(allCorrect){
      S.done = true;
      if(fb) fb.innerHTML = `
        <div style="padding:12px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(39,174,96,0.3)">
          <div style="font-weight:700;color:#16A34A;margin-bottom:6px">🎉 صحيح! ماذا تعلّمت؟</div>
          <div style="color:var(--text-secondary);line-height:1.8">الدم يدخل القلب من جهة، يمر بالرئتين ليأخذ الأكسجين، ثم يعود ليُضخّ من الجهة الأخرى إلى بقية الجسم — رحلة مستمرة لا تتوقف.</div>
        </div>`;
    } else {
      if(fb) fb.innerHTML = '❌ الترتيب غير صحيح — حاول مرة أخرى.';
    }
  };

  function draw(){
    if(currentSim!=='g6body2' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    c.fillStyle = g6bBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle = g6bTxt(dark);
    c.font = `bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
    c.fillText('١-٢ · رتّب مسار الدم', w/2, h*0.045);

    slotPos.forEach((sp,i)=>{
      c.strokeStyle = S.slots[i]!=null ? '#27AE60' : (dark?'rgba(230,220,200,0.4)':'rgba(50,60,75,0.35)');
      c.lineWidth = 2; c.setLineDash(S.slots[i]==null?[6,5]:[]);
      c.beginPath(); c.roundRect(sp.x*w-w*0.19, sp.y*h-h*0.04, w*0.38, h*0.08, 10); c.stroke();
      c.setLineDash([]);
      if(S.slots[i]==null){
        c.fillStyle = g6bMut(dark); c.font=`bold ${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
        c.fillText(`الخطوة ${i+1}`, sp.x*w, sp.y*h+h*0.008);
      }
    });

    S.chips.forEach(ch=>{
      const cw = w*0.34, chh = h*0.075;
      c.save();
      if(S.dragId===ch.id){ c.shadowColor='rgba(0,0,0,0.3)'; c.shadowBlur=8; }
      c.fillStyle = ch.inSlot>=0 ? '#DCFCE7' : (dark?'#2A2F3A':'#FFF');
      c.strokeStyle = ch.inSlot>=0 ? '#27AE60' : '#94A3B8';
      c.lineWidth = 2;
      c.beginPath(); c.roundRect(ch.x*w-cw/2, ch.y*h-chh/2, cw, chh, 10); c.fill(); c.stroke();
      c.restore();
      c.fillStyle = dark?'#1A2530':'#2C3A4A';
      c.font = `${Math.round(h*0.02)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(ch.text, ch.x*w, ch.y*h);
    });
    c.textBaseline='alphabetic';

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   الدرس ٣ · التاب ١ — استقصاء: القلب والنبض
════════════════════════════════════════ */
function simG6Body3a(){
  cancelAnimationFrame(animFrame);
  const STATES = {
    sit:  { label:'🧍 جالس',  emoji:'🧍', target:72,  note:'أثناء الجلوس، جسمك مرتاح ولا يحتاج طاقة إضافية، فنبضك بطيء.' },
    walk: { label:'🚶 يمشي',  emoji:'🚶', target:105, note:'أثناء المشي، تحرّك عضلاتك أكثر فيحتاج جسمك دماً وأكسجين أكثر.' },
    run:  { label:'🏃 يجري',  emoji:'🏃', target:155, note:'أثناء الجري، جسمك يعمل بأقصى طاقته، لذا يسرّع القلب نبضه كثيراً!' },
  };
  simState = { state:'sit', bpm:72, phase:0, beatT:0 };
  const S = simState;

  function renderControls(){
    return `
      <div class="ctrl-section">
        <div class="ctrl-label">🏃 استقصاء: القلب والنبض</div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.8;margin-bottom:10px">
          اختر حالة النشاط وراقب كيف يتغيّر عداد النبض تدريجياً.
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${Object.keys(STATES).map(k=>`<button id="g6bSt_${k}" onclick="window._g6bSetState('${k}')" style="padding:11px 14px;border-radius:9px;border:2px solid ${k===S.state?'#27AE60':'#ddd'};background:${k===S.state?'#27AE60':'var(--bg-ctrl-btn)'};color:${k===S.state?'white':'var(--text-secondary)'};font-family:Tajawal,sans-serif;font-size:14px;font-weight:700;cursor:pointer">${STATES[k].label}</button>`).join('')}
      </div>
      <div id="g6bPulseInfo" style="margin-top:12px;font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;border:1px solid rgba(231,76,60,0.2)">
        ${STATES.sit.note}
      </div>`;
  }
  controls(renderControls());

  window._g6bSetState = function(k){
    S.state = k; _g6bPlayClick();
    document.querySelectorAll('[id^="g6bSt_"]').forEach(b=>{
      const kk = b.id.replace('g6bSt_','');
      b.style.background = kk===k ? '#27AE60':'var(--bg-ctrl-btn)';
      b.style.borderColor = kk===k ? '#27AE60':'#ddd';
      b.style.color = kk===k ? 'white':'var(--text-secondary)';
    });
    const info = document.getElementById('g6bPulseInfo');
    if(info) info.innerHTML = STATES[k].note;
  };

  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g6body3' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    c.fillStyle = g6bBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle = g6bTxt(dark);
    c.font = `bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
    c.fillText('١-٣ · القلب والنبض', w/2, h*0.06);

    const target = STATES[S.state].target;
    S.bpm += (target - S.bpm) * 0.02;
    S.beatT += (S.bpm/60) * 0.016;

    const bounce = S.state==='sit' ? 0 : (S.state==='walk' ? Math.sin(S.beatT*Math.PI*2)*h*0.015 : Math.sin(S.beatT*Math.PI*2)*h*0.03);
    c.font = `${Math.round(h*0.18)}px serif`; c.textAlign='center';
    c.fillText(STATES[S.state].emoji, w*0.38, h*0.5 - bounce);

    // قلب نابض
    const pulse = 1 + Math.max(0, Math.sin(S.beatT*Math.PI*2))*0.25;
    c.font = `${Math.round(h*0.09*pulse)}px serif`;
    c.fillText('❤️', w*0.72, h*0.42);

    c.fillStyle = '#E74C3C'; c.font = `bold ${Math.round(h*0.06)}px Tajawal`;
    c.fillText(Math.round(S.bpm), w*0.72, h*0.6);
    c.fillStyle = g6bMut(dark); c.font = `${Math.round(h*0.025)}px Tajawal`;
    c.fillText('نبضة / دقيقة', w*0.72, h*0.66);

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   الدرس ٣ · التاب ٢ — نشاط: طابِق النشاط بسرعة النبض
════════════════════════════════════════ */
function simG6Body3b(){
  cancelAnimationFrame(animFrame);
  const ZONES = [
    { id:'slow',   label:'🧘 بطيء (٦٠–٨٠)',   x:0.18 },
    { id:'medium', label:'🚶 متوسط (٩٠–١٢٠)', x:0.5  },
    { id:'fast',   label:'🏃 سريع (١٣٠–١٧٠)', x:0.82 },
  ];
  const CHIPS_DEF = [
    { text:'😴 نائم', zone:'slow' },
    { text:'📺 يشاهد التلفاز', zone:'slow' },
    { text:'🚶 يمشي', zone:'medium' },
    { text:'🚴 يركب الدراجة ببطء', zone:'medium' },
    { text:'🏃 يجري بسرعة', zone:'fast' },
    { text:'⚽ يلعب كرة القدم', zone:'fast' },
  ];
  simState = { chips:[], dragId:null };
  const S = simState;
  const shuffled = [...CHIPS_DEF].sort(()=>Math.random()-0.5);
  shuffled.forEach((ch,i)=>{ S.chips.push({ id:i, text:ch.text, correctZone:ch.zone, zone:null, x:0.15+(i%3)*0.32, y:0.68+Math.floor(i/3)*0.13 }); });

  function renderControls(){
    return `
      <div class="ctrl-section">
        <div class="ctrl-label">🎯 طابِق النشاط بسرعة النبض</div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.8;margin-bottom:10px">
          اسحب كل بطاقة نشاط إلى المنطقة المناسبة لسرعة النبض المتوقعة.
        </div>
      </div>
      <button class="ctrl-btn play" onclick="window._g6bCheckZones()">✅ تحقّق</button>
      <div id="g6bZoneFeedback" style="margin-top:12px;font-size:13px;line-height:1.9;color:var(--text-secondary)"></div>`;
  }
  controls(renderControls());

  const cv = document.getElementById('simCanvas');
  function relPos(e){
    const rect = cv.getBoundingClientRect();
    const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
    return { x:(t.clientX-rect.left)/cv.offsetWidth, y:(t.clientY-rect.top)/cv.offsetHeight };
  }
  function findChipAt(x,y){
    for(let i=S.chips.length-1;i>=0;i--){
      const ch = S.chips[i];
      if(Math.abs(x-ch.x)<0.15 && Math.abs(y-ch.y)<0.05) return ch;
    }
    return null;
  }
  function onDown(e){ const p=relPos(e); const ch=findChipAt(p.x,p.y); if(ch) S.dragId=ch.id; }
  function onMove(e){
    if(S.dragId==null) return;
    const p = relPos(e);
    const ch = S.chips.find(c=>c.id===S.dragId);
    if(ch){ ch.x=p.x; ch.y=p.y; }
  }
  function onUp(){
    if(S.dragId==null) return;
    const ch = S.chips.find(c=>c.id===S.dragId);
    let landed = false;
    ZONES.forEach((z,idx)=>{
      if(ch.y < 0.42 && Math.abs(ch.x-z.x)<0.16){ ch.zone=z.id; ch.x=z.x+ (Math.random()-0.5)*0.1; ch.y=0.22+idx*0.001+Math.random()*0.06; landed=true; _g6bPlayClick(); }
    });
    S.dragId = null;
  }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp; cv.onmouseleave=onUp;
  cv.ontouchstart=e=>{e.preventDefault();onDown(e);};
  cv.ontouchmove=e=>{e.preventDefault();onMove(e);};
  cv.ontouchend=e=>{e.preventDefault();onUp(e);};

  window._g6bCheckZones = function(){
    const allPlaced = S.chips.every(ch=>ch.zone!=null);
    const fb = document.getElementById('g6bZoneFeedback');
    if(!allPlaced){ if(fb) fb.innerHTML='⚠️ ضع جميع البطاقات في إحدى المناطق أولاً.'; return; }
    const allCorrect = S.chips.every(ch=>ch.zone===ch.correctZone);
    _g6bPlayChime(allCorrect);
    if(allCorrect){
      if(fb) fb.innerHTML = `
        <div style="padding:12px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(39,174,96,0.3)">
          <div style="font-weight:700;color:#16A34A;margin-bottom:6px">🎉 ممتاز! ماذا تعلّمت؟</div>
          <div style="color:var(--text-secondary);line-height:1.8">كلما زاد نشاطك البدني، زاد احتياج جسمك للطاقة والأكسجين، فيزيد القلب من سرعة نبضه ليواكب هذا الاحتياج.</div>
        </div>`;
    } else {
      if(fb) fb.innerHTML = '❌ بعض البطاقات في مكان غير صحيح — حاول مرة أخرى.';
    }
  };

  function draw(){
    if(currentSim!=='g6body3' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    c.fillStyle = g6bBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle = g6bTxt(dark);
    c.font = `bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
    c.fillText('١-٣ · طابِق النشاط بسرعة النبض', w/2, h*0.045);

    ZONES.forEach(z=>{
      c.strokeStyle = dark?'rgba(230,220,200,0.4)':'rgba(50,60,75,0.35)';
      c.lineWidth = 2; c.setLineDash([6,5]);
      c.beginPath(); c.roundRect(z.x*w-w*0.145, h*0.1, w*0.29, h*0.28, 12); c.stroke();
      c.setLineDash([]);
      c.fillStyle = g6bTxt(dark); c.font=`bold ${Math.round(h*0.024)}px Tajawal`;
      c.fillText(z.label, z.x*w, h*0.095);
    });

    S.chips.forEach(ch=>{
      const cw = w*0.27, chh = h*0.08;
      c.save();
      if(S.dragId===ch.id){ c.shadowColor='rgba(0,0,0,0.3)'; c.shadowBlur=8; }
      c.fillStyle = ch.zone ? '#DCFCE7' : (dark?'#2A2F3A':'#FFF');
      c.strokeStyle = ch.zone ? '#27AE60' : '#94A3B8'; c.lineWidth=2;
      c.beginPath(); c.roundRect(ch.x*w-cw/2, ch.y*h-chh/2, cw, chh, 10); c.fill(); c.stroke();
      c.restore();
      c.fillStyle = dark?'#1A2530':'#2C3A4A';
      c.font = `${Math.round(h*0.019)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(ch.text, ch.x*w, ch.y*h);
    });
    c.textBaseline='alphabetic';

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   الدرس ٣ · التاب ١ — استقصاء: القلب والنبض
════════════════════════════════════════ */
function simG6Body3a(){
  cancelAnimationFrame(animFrame);
  const STATES = [
    { id:0, label:'🧍 جالس', bpm:70,  icon:'🧍' },
    { id:1, label:'🚶 يمشي', bpm:100, icon:'🚶' },
    { id:2, label:'🏃 يجري', bpm:150, icon:'🏃' },
  ];
  simState = { state:0, bpm:70, wave:[], t:0 };
  const S = simState;

  function renderControls(){
    return `
      <div class="ctrl-section">
        <div class="ctrl-label">❤️ استقصاء: القلب والنبض</div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.8;margin-bottom:10px">
          اضغط كل زر بالترتيب ولاحظ كيف يتغيّر عداد النبض والرسم البياني عند تغيّر نشاط الجسم.
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        ${STATES.map(s=>`<button id="g6bState_${s.id}" onclick="window._g6bSetState(${s.id})" style="flex:1;padding:11px 6px;border-radius:9px;border:2px solid ${s.id===S.state?'#27AE60':'#ddd'};background:${s.id===S.state?'#27AE60':'var(--bg-ctrl-btn)'};color:${s.id===S.state?'white':'var(--text-secondary)'};font-family:Tajawal,sans-serif;font-size:13px;font-weight:700;cursor:pointer">${s.label}</button>`).join('')}
      </div>
      <div id="g6bPulseInfo" style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;border:1px solid rgba(231,76,60,0.2)">
        النبض الآن حوالي 70 نبضة/دقيقة — الجسم في حالة راحة.
      </div>`;
  }
  controls(renderControls());

  window._g6bSetState = function(id){
    S.state = id;
    document.querySelectorAll('[id^="g6bState_"]').forEach((b,i)=>{
      b.style.background = i===id ? '#27AE60' : 'var(--bg-ctrl-btn)';
      b.style.borderColor = i===id ? '#27AE60' : '#ddd';
      b.style.color = i===id ? 'white' : 'var(--text-secondary)';
    });
    _g6bPlayClick();
    const info = document.getElementById('g6bPulseInfo');
    const target = STATES[id].bpm;
    if(info) info.innerHTML = id===0
      ? `النبض يعود تدريجياً نحو ${target} نبضة/دقيقة — الجسم في حالة راحة.`
      : `النبض يرتفع تدريجياً نحو ${target} نبضة/دقيقة — كلما زاد المجهود زاد احتياج الجسم للأكسجين، فيسرع القلب.`;
  };

  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g6body3' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    c.fillStyle = g6bBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle = g6bTxt(dark);
    c.font = `bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
    c.fillText('١-٣ · القلب والنبض', w/2, h*0.06);

    const target = STATES[S.state].bpm;
    S.bpm += (target - S.bpm) * 0.02;
    S.t += 0.02 + (S.bpm/70)*0.02;

    // شخصية
    c.font = `${Math.round(h*0.14)}px serif`; c.textAlign='center';
    c.fillText(STATES[S.state].icon, w*0.24, h*0.42);

    // عداد النبض
    c.font = `bold ${Math.round(h*0.09)}px Tajawal`;
    c.fillStyle = '#E74C3C';
    c.fillText(Math.round(S.bpm), w*0.24, h*0.6);
    c.font = `${Math.round(h*0.024)}px Tajawal`; c.fillStyle = g6bMut(dark);
    c.fillText('نبضة / دقيقة', w*0.24, h*0.66);

    // موجة نبض (ECG مبسّط) تتحرك يميناً وتسرع مع البي بي إم
    const waveX0 = w*0.45, waveX1 = w*0.94, waveY = h*0.42, waveH = h*0.14;
    c.strokeStyle = dark? 'rgba(230,220,200,0.3)':'rgba(50,60,75,0.25)'; c.lineWidth=1;
    c.beginPath(); c.moveTo(waveX0,waveY); c.lineTo(waveX1,waveY); c.stroke();
    c.strokeStyle = '#E74C3C'; c.lineWidth = 2.5; c.beginPath();
    const speed = S.bpm/70;
    for(let x=waveX0; x<=waveX1; x+=2){
      const phase = ((x - S.t*80*speed) % 46 + 46) % 46;
      let y = waveY;
      if(phase>18 && phase<22) y = waveY - waveH*((phase-18)/2);
      else if(phase>=22 && phase<26) y = waveY - waveH*((26-phase)/2);
      if(x===waveX0) c.moveTo(x,y); else c.lineTo(x,y);
    }
    c.stroke();

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   الدرس ٣ · التاب ٢ — نشاط: طابق النشاط بسرعة النبض
════════════════════════════════════════ */
function simG6Body3b(){
  cancelAnimationFrame(animFrame);
  const PAIRS = [
    { id:0, act:'😴 النوم',  bpm:60 },
    { id:1, act:'🧍 الجلوس', bpm:80 },
    { id:2, act:'🚶 المشي',  bpm:110 },
    { id:3, act:'🏃 الجري',  bpm:150 },
  ];
  const bpms = [...PAIRS].sort(()=>Math.random()-0.5);
  simState = { selAct:null, selBpm:null, matched:[], wrong:0 };
  const S = simState;

  function renderControls(){
    return `
      <div class="ctrl-section">
        <div class="ctrl-label">🎯 طابق النشاط بسرعة النبض</div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.8;margin-bottom:10px">اضغط نشاطاً ثم اضغط سرعة النبض التي تناسبه.</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${PAIRS.map(p=>{
          const done = S.matched.includes(p.id);
          const sel = S.selAct===p.id;
          return `<button id="g6bAct_${p.id}" ${done?'disabled':''} onclick="window._g6bPickAct(${p.id})" style="padding:10px;border-radius:9px;border:2px solid ${done?'#27AE60':sel?'#F5B041':'#ddd'};background:${done?'#DCFCE7':sel?'#FEF3C7':'var(--bg-ctrl-btn)'};color:${done?'#16A34A':'var(--text-secondary)'};font-family:Tajawal,sans-serif;font-size:14px;font-weight:700;cursor:pointer">${p.act}</button>`;
        }).join('')}
      </div>
      <div style="height:12px"></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${bpms.map(p=>{
          const done = S.matched.includes(p.id);
          const sel = S.selBpm===p.id;
          return `<button id="g6bBpm_${p.id}" ${done?'disabled':''} onclick="window._g6bPickBpm(${p.id})" style="flex:1;min-width:70px;padding:10px;border-radius:9px;border:2px solid ${done?'#27AE60':sel?'#F5B041':'#ddd'};background:${done?'#DCFCE7':sel?'#FEF3C7':'var(--bg-ctrl-btn)'};color:${done?'#16A34A':'var(--text-secondary)'};font-family:Tajawal,sans-serif;font-size:14px;font-weight:700;cursor:pointer">${p.bpm}</button>`;
        }).join('')}
      </div>
      <div id="g6bMatchFeedback" style="margin-top:12px;font-size:13px;line-height:1.9;color:var(--text-secondary)"></div>`;
  }
  controls(renderControls());

  function tryMatch(){
    if(S.selAct==null || S.selBpm==null) return;
    const ok = S.selAct === S.selBpm;
    _g6bPlayChime(ok);
    const fb = document.getElementById('g6bMatchFeedback');
    if(ok){
      S.matched.push(S.selAct);
      if(fb) fb.innerHTML = '✅ تطابق صحيح!';
      if(S.matched.length === PAIRS.length){
        setTimeout(()=>{
          if(fb) fb.innerHTML = `
            <div style="padding:12px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(39,174,96,0.3)">
              <div style="font-weight:700;color:#16A34A;margin-bottom:6px">🎉 أحسنت! ماذا تعلّمت؟</div>
              <div style="color:var(--text-secondary);line-height:1.8">كلما زاد نشاط الجسم البدني، احتاج إلى غذاء وأكسجين أكثر بسرعة، فيرتفع معدل نبض القلب — والعكس صحيح أثناء الراحة والنوم.</div>
            </div>`;
        }, 300);
      }
    } else {
      S.wrong++;
      if(fb) fb.innerHTML = '❌ غير مطابق — حاول مرة أخرى.';
    }
    S.selAct = null; S.selBpm = null;
    controls(renderControls());
    const fb2 = document.getElementById('g6bMatchFeedback');
    if(fb2 && ok===false) fb2.innerHTML = '❌ غير مطابق — حاول مرة أخرى.';
    if(fb2 && ok) fb2.innerHTML = S.matched.length===PAIRS.length ? fb2.innerHTML : '✅ تطابق صحيح!';
  }
  window._g6bPickAct = function(id){ if(S.matched.includes(id)) return; S.selAct = id; _g6bPlayClick(); tryMatch(); };
  window._g6bPickBpm = function(id){ if(S.matched.includes(id)) return; S.selBpm = id; _g6bPlayClick(); tryMatch(); };

  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g6body3' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    c.fillStyle = g6bBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle = g6bTxt(dark);
    c.font = `bold ${Math.round(h*0.036)}px Tajawal`; c.textAlign='center';
    c.fillText('١-٣ · طابق النشاط بالنبض', w/2, h*0.1);
    c.font = `${Math.round(h*0.13)}px serif`;
    c.fillText(S.matched.length===PAIRS.length ? '🎉' : '❤️', w/2, h*0.42);
    c.fillStyle = g6bMut(dark); c.font = `${Math.round(h*0.03)}px Tajawal`;
    c.fillText(`${S.matched.length} / ${PAIRS.length} أزواج متطابقة`, w/2, h*0.58);
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   الدرس ٤ · التاب ١ — استقصاء: الرئتان والتنفس
════════════════════════════════════════ */
function simG6Body4a(){
  cancelAnimationFrame(animFrame);
  simState = { phase:'idle', p:0, particles:[] };
  const S = simState;

  function renderControls(){
    return `
      <div class="ctrl-section">
        <div class="ctrl-label">🫁 استقصاء: الرئتان والتنفس</div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.8;margin-bottom:10px">
          اضغط "شهيق" لتشاهد الرئتين تتمددان ويدخل الأكسجين، ثم اضغط "زفير" لتشاهدهما تنكمشان ويخرج ثاني أكسيد الكربون.
        </div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="ctrl-btn play" style="flex:1" onclick="window._g6bBreathe('in')">🫁 شهيق</button>
        <button class="ctrl-btn play" style="flex:1;background:linear-gradient(135deg,#5DADE2,#3498DB)" onclick="window._g6bBreathe('out')">💨 زفير</button>
      </div>
      <div id="g6bBreathInfo" style="margin-top:12px;font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;border:1px solid rgba(93,173,226,0.25)">
        الرئتان في وضعهما الطبيعي. اضغط "شهيق" لتبدأ.
      </div>`;
  }
  controls(renderControls());

  window._g6bBreathe = function(dir){
    S.phase = dir; S.p = 0; _g6bPlayClick();
    const info = document.getElementById('g6bBreathInfo');
    if(info) info.innerHTML = dir==='in'
      ? '🫁 <strong>الشهيق:</strong> الرئتان تتمددان ويزداد حجمهما، ويدخل الهواء المحمَّل بالأكسجين.'
      : '💨 <strong>الزفير:</strong> الرئتان تنكمشان ويقلّ حجمهما، ويخرج الهواء المحمَّل بثاني أكسيد الكربون.';
    if(dir==='in'){
      for(let i=0;i<4;i++) S.particles.push({x:0.5+(Math.random()-0.5)*0.1, y:0.05, type:'O2', age:0});
    } else {
      for(let i=0;i<4;i++) S.particles.push({x:0.5+(Math.random()-0.5)*0.1, y:0.35, type:'CO2', age:0});
    }
  };

  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g6body4' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    c.fillStyle = g6bBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle = g6bTxt(dark);
    c.font = `bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
    c.fillText('١-٤ · الرئتان والتنفس', w/2, h*0.06);

    if(S.phase==='in' && S.p<1) S.p += 0.025;
    if(S.phase==='out' && S.p<1) S.p += 0.025;
    const scale = S.phase==='in' ? 1 + Math.min(1,S.p)*0.22 : S.phase==='out' ? 1.22 - Math.min(1,S.p)*0.22 : 1;

    const cx = w*0.5, cy = h*0.32;
    ['#5DADE2','#5DADE2'].forEach((col,i)=>{
      const side = i===0?-1:1;
      c.save(); c.translate(cx+side*w*0.05*scale, cy);
      c.scale(scale, scale);
      c.fillStyle = col; c.globalAlpha=0.85;
      c.beginPath(); c.ellipse(0,0,w*0.09,h*0.14,0,0,Math.PI*2); c.fill();
      c.restore();
    });
    c.strokeStyle = dark?'rgba(230,220,200,0.5)':'rgba(50,60,75,0.4)'; c.lineWidth=2;
    c.beginPath(); c.moveTo(cx,cy-h*0.18); c.lineTo(cx,h*0.03); c.stroke();

    S.particles = S.particles.filter(p=>p.age<1);
    S.particles.forEach(p=>{
      p.age += 0.02;
      const py = p.type==='O2' ? p.y + p.age*(cy-p.y) : p.y - p.age*0.3;
      c.fillStyle = p.type==='O2' ? '#3B82F6' : '#94A3B8';
      c.globalAlpha = 1-p.age;
      c.beginPath(); c.arc(p.x*w, py*h, w*0.018, 0, Math.PI*2); c.fill();
      c.globalAlpha=1;
      c.fillStyle='white'; c.font=`bold ${Math.round(h*0.016)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(p.type==='O2'?'O₂':'CO₂', p.x*w, py*h);
    });
    c.textBaseline='alphabetic';

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   الدرس ٤ · التاب ٢ — نشاط: وصّل الأكسجين وأخرج ثاني أكسيد الكربون
════════════════════════════════════════ */
function simG6Body4b(){
  cancelAnimationFrame(animFrame);
  simState = { items:[], score:0, total:6, dragId:null, nextId:0 };
  const S = simState;

  function spawnItem(){
    if(S.nextId >= S.total) return;
    const type = Math.random()<0.5 ? 'O2' : 'CO2';
    S.items.push({ id:S.nextId++, type, x:0.5+(Math.random()-0.5)*0.18, y:0.28, placed:false });
  }
  spawnItem();

  function renderControls(){
    return `
      <div class="ctrl-section">
        <div class="ctrl-label">🔄 وصّل الأكسجين وأخرج ثاني أكسيد الكربون</div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.8;margin-bottom:10px">
          اسحب فقاعة O₂ إلى "الدم"، واسحب فقاعة CO₂ إلى "خارج الجسم".
        </div>
      </div>
      <div id="g6bBreathScore" style="font-size:13px;font-weight:700;color:#27AE60">النقاط: ${S.score} / ${S.total}</div>
      <div id="g6bBreathFb" style="margin-top:10px;font-size:13px;min-height:20px;color:var(--text-secondary)"></div>`;
  }
  controls(renderControls());

  const cv = document.getElementById('simCanvas');
  const zones = { blood: {x:0.22, y:0.75}, out: {x:0.78, y:0.75} };

  function relPos(e){
    const rect = cv.getBoundingClientRect();
    const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
    return { x:(t.clientX-rect.left)/cv.offsetWidth, y:(t.clientY-rect.top)/cv.offsetHeight };
  }
  function findAt(x,y){
    for(let i=S.items.length-1;i>=0;i--){ const it=S.items[i]; if(!it.placed && Math.abs(x-it.x)<0.07 && Math.abs(y-it.y)<0.07) return it; }
    return null;
  }
  function onDown(e){ const p=relPos(e); const it=findAt(p.x,p.y); if(it) S.dragId=it.id; }
  function onMove(e){ if(S.dragId==null) return; const p=relPos(e); const it=S.items.find(i=>i.id===S.dragId); if(it){it.x=p.x;it.y=p.y;} }
  function onUp(){
    if(S.dragId==null) return;
    const it = S.items.find(i=>i.id===S.dragId);
    const distBlood = Math.hypot(it.x-zones.blood.x, it.y-zones.blood.y);
    const distOut = Math.hypot(it.x-zones.out.x, it.y-zones.out.y);
    let ok = null;
    if(distBlood < 0.12){ ok = it.type==='O2'; it.placed=true; }
    else if(distOut < 0.12){ ok = it.type==='CO2'; it.placed=true; }
    if(it.placed){
      _g6bPlayChime(ok);
      if(ok) S.score++;
      const fb = document.getElementById('g6bBreathFb');
      if(fb) fb.innerHTML = ok ? '✅ صحيح!' : `❌ ${it.type==='O2'?'الأكسجين يذهب إلى الدم':'ثاني أكسيد الكربون يخرج من الجسم'}`;
      const sc = document.getElementById('g6bBreathScore');
      if(sc) sc.textContent = `النقاط: ${S.score} / ${S.total}`;
      spawnItem();
      if(S.nextId>=S.total && S.items.every(i=>i.placed)){
        setTimeout(()=>{
          if(fb) fb.innerHTML = `
            <div style="padding:12px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(39,174,96,0.3)">
              <div style="font-weight:700;color:#16A34A;margin-bottom:6px">🎉 أحسنت! ماذا تعلّمت؟</div>
              <div style="color:var(--text-secondary);line-height:1.8">أثناء الشهيق يدخل الأكسجين إلى الدم ليصل لجميع أجزاء الجسم، وأثناء الزفير يتخلّص الجسم من ثاني أكسيد الكربون الناتج عن نشاط الخلايا.</div>
            </div>`;
        }, 400);
      }
    }
    S.dragId = null;
  }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp; cv.onmouseleave=onUp;
  cv.ontouchstart=e=>{e.preventDefault();onDown(e);};
  cv.ontouchmove=e=>{e.preventDefault();onMove(e);};
  cv.ontouchend=e=>{e.preventDefault();onUp(e);};

  function draw(){
    if(currentSim!=='g6body4' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    c.fillStyle = g6bBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle = g6bTxt(dark);
    c.font = `bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
    c.fillText('١-٤ · وصّل ونظّف الدم', w/2, h*0.06);

    Object.entries(zones).forEach(([k,z])=>{
      c.strokeStyle = k==='blood' ? '#E74C3C' : '#5DADE2'; c.lineWidth=2; c.setLineDash([6,5]);
      c.beginPath(); c.arc(z.x*w, z.y*h, w*0.1, 0, Math.PI*2); c.stroke(); c.setLineDash([]);
      c.fillStyle = g6bMut(dark); c.font=`bold ${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
      c.fillText(k==='blood'?'🩸 الدم':'🌬️ خارج الجسم', z.x*w, z.y*h + w*0.135);
    });

    S.items.forEach(it=>{
      if(it.placed) return;
      c.fillStyle = it.type==='O2' ? '#3B82F6' : '#94A3B8';
      c.beginPath(); c.arc(it.x*w, it.y*h, w*0.032, 0, Math.PI*2); c.fill();
      c.fillStyle='white'; c.font=`bold ${Math.round(h*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(it.type==='O2'?'O₂':'CO₂', it.x*w, it.y*h);
    });
    c.textBaseline='alphabetic';

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}
