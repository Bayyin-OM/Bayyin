// ══════════════════════════════════════════════════════════════
// الوحدة ١ · جسم الإنسان — الصف السادس (الفصل الدراسي الأول)
// الدرس ١ · أعضاء الجسم
// ══════════════════════════════════════════════════════════════

function g6bBg(dark){ return dark ? '#12141C' : '#F5F3EE'; }
function g6bTxt(dark){ return dark ? '#E8E4D8' : '#2C3A4A'; }
function g6bMut(dark){ return dark ? '#9AA5B5' : '#7A8A98'; }

// ─── مساعد: التفاف النص داخل عرض محدد على الكانفس (لمنع تداخل النص) ───
function g6bWrapText(c, text, cx, cy, maxW, lineH){
  const words = text.split(' ');
  let lines = [], cur = '';
  words.forEach(w=>{
    const test = cur ? cur+' '+w : w;
    if(c.measureText(test).width > maxW && cur){ lines.push(cur); cur = w; }
    else cur = test;
  });
  if(cur) lines.push(cur);
  const startY = cy - (lines.length-1)*lineH/2;
  lines.forEach((ln,i)=> c.fillText(ln, cx, startY + i*lineH));
  return lines.length;
}

// ─── حقن أنماط بصرية مشتركة (اهتزاز الخطأ، نبض النجاح) مرة واحدة ───
(function _g6bInjectStyles(){
  if(document.getElementById('g6bStyles')) return;
  const st = document.createElement('style'); st.id = 'g6bStyles';
  st.textContent = `
    @keyframes g6bShake { 10%,90%{transform:translateX(-2px)} 20%,80%{transform:translateX(4px)} 30%,50%,70%{transform:translateX(-7px)} 40%,60%{transform:translateX(7px)} }
    @keyframes g6bPop { 0%{transform:scale(1)} 40%{transform:scale(1.08)} 100%{transform:scale(1)} }
    .g6b-shake { animation: g6bShake 0.42s; }
    .g6b-pop { animation: g6bPop 0.32s; }
  `;
  document.head.appendChild(st);
})();
function _g6bFlash(el, ok){
  if(!el) return;
  el.classList.remove('g6b-shake','g6b-pop');
  void el.offsetWidth;
  el.classList.add(ok ? 'g6b-pop' : 'g6b-shake');
}

// ─── رسومات أعضاء واقعية (منحنيات تشريحية بدل الأشكال الهندسية البسيطة) ───
function g6bDrawHeart(c, cx, cy, s, dark){
  c.save(); c.translate(cx,cy); c.scale(s,s);
  const grad = c.createLinearGradient(-40,-40,40,50);
  grad.addColorStop(0, dark?'#F27C6E':'#E85C4A'); grad.addColorStop(1, dark?'#B5372A':'#B8291A');
  c.fillStyle = grad;
  c.beginPath();
  c.moveTo(0,18);
  c.bezierCurveTo(-55,-18, -42,-58, -8,-46);
  c.bezierCurveTo(6,-52, 12,-52, 0,-30);
  c.bezierCurveTo(-8,-52, -2,-52, 12,-46);
  c.bezierCurveTo(46,-58, 55,-18, 0,18);
  c.closePath(); c.fill();
  // الأبهر والأوعية الخارجة من الأعلى
  c.strokeStyle = dark?'#8FA8D6':'#5C7FB8'; c.lineWidth=6; c.lineCap='round';
  c.beginPath(); c.moveTo(-6,-46); c.quadraticCurveTo(4,-70,-14,-78); c.stroke();
  c.strokeStyle = dark?'#F2A0A0':'#D46A5E'; c.lineWidth=5;
  c.beginPath(); c.moveTo(10,-44); c.quadraticCurveTo(20,-64,34,-68); c.stroke();
  // خط الحاجز الفاصل بين البطينين (واقعية)
  c.strokeStyle='rgba(0,0,0,0.18)'; c.lineWidth=2;
  c.beginPath(); c.moveTo(0,-30); c.quadraticCurveTo(-4,0,0,16); c.stroke();
  c.restore();
}
function g6bDrawLungPair(c, cx, cy, s, dark){
  c.save(); c.translate(cx,cy); c.scale(s,s);
  const col = dark? '#E8879A' : '#E6A0AE';
  [-1,1].forEach(side=>{
    c.save(); c.scale(side,1);
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(10,-55);
    c.bezierCurveTo(45,-55, 52,-10, 42,35);
    c.bezierCurveTo(36,60, 14,58, 12,30);
    c.bezierCurveTo(2,40, 10,-10, 10,-55);
    c.closePath(); c.fill();
    // فصوص الرئة (خطوط فاصلة)
    c.strokeStyle='rgba(120,40,55,0.25)'; c.lineWidth=1.5;
    c.beginPath(); c.moveTo(14,-10); c.quadraticCurveTo(30,-5,40,5); c.stroke();
    c.beginPath(); c.moveTo(14,18); c.quadraticCurveTo(28,20,38,28); c.stroke();
    c.restore();
  });
  // القصبة الهوائية والشعب
  c.strokeStyle = dark?'#D8D8D8':'#BFC5CC'; c.lineWidth=7; c.lineCap='round';
  c.beginPath(); c.moveTo(0,-72); c.lineTo(0,-30); c.stroke();
  c.lineWidth=5;
  c.beginPath(); c.moveTo(0,-30); c.lineTo(-18,-14); c.stroke();
  c.beginPath(); c.moveTo(0,-30); c.lineTo(18,-14); c.stroke();
  c.restore();
}
function g6bDrawBrain(c, cx, cy, s, dark){
  c.save(); c.translate(cx,cy); c.scale(s,s);
  const grad = c.createRadialGradient(-10,-15,5,0,0,60);
  grad.addColorStop(0, dark?'#E8B4A8':'#F0BFAE'); grad.addColorStop(1, dark?'#C98C7E':'#D99C86');
  c.fillStyle = grad;
  c.beginPath();
  c.moveTo(-52,-4);
  c.bezierCurveTo(-58,-34,-30,-52,0,-48);
  c.bezierCurveTo(30,-52,58,-34,52,-4);
  c.bezierCurveTo(56,20,38,34,20,30);
  c.bezierCurveTo(22,42,4,46,0,34);
  c.bezierCurveTo(-4,46,-22,42,-20,30);
  c.bezierCurveTo(-38,34,-56,20,-52,-4);
  c.closePath(); c.fill();
  // تلافيف الدماغ (خطوط منحنية متعددة تحاكي الثنيات)
  c.strokeStyle = 'rgba(120,60,45,0.35)'; c.lineWidth=1.6;
  const folds = [ [-40,-24,-10,-38,20,-26], [-44,-4,-18,-14,10,-4], [-40,16,-14,8,14,18], [4,-40,26,-30,44,-14], [6,-6,26,2,42,10] ];
  folds.forEach(f=>{ c.beginPath(); c.moveTo(f[0],f[1]); c.quadraticCurveTo(f[2],f[3],f[4],f[5]); c.stroke(); });
  // الفصيص الفاصل بين نصفي الدماغ
  c.strokeStyle='rgba(90,45,35,0.3)'; c.lineWidth=2;
  c.beginPath(); c.moveTo(0,-46); c.lineTo(0,28); c.stroke();
  // المخيخ
  c.fillStyle = dark?'#D89E86':'#C98668';
  c.beginPath(); c.ellipse(28,26,16,11,0.3,0,Math.PI*2); c.fill();
  c.strokeStyle='rgba(90,45,35,0.3)'; c.lineWidth=1;
  for(let i=-2;i<=2;i++){ c.beginPath(); c.moveTo(20+i*5,18); c.lineTo(24+i*5,34); c.stroke(); }
  c.restore();
}
// ─── جسم بشري تخطيطي واقعي (رأس، كتفان، خصر، أرجل) ───
function g6bDrawBodyOutline(c, bx, by, bw, bh, dark){
  const stroke = dark? 'rgba(230,220,200,0.55)':'rgba(60,68,80,0.5)';
  c.save();
  c.strokeStyle = stroke; c.fillStyle = dark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)';
  c.lineWidth = Math.max(2,bh*0.006);
  // الرأس
  c.beginPath(); c.ellipse(bx, by+bh*0.07, bw*0.13, bh*0.075, 0, 0, Math.PI*2); c.fill(); c.stroke();
  // الرقبة والجذع والأرجل بمنحنى واحد ناعم
  c.beginPath();
  c.moveTo(bx-bw*0.05, by+bh*0.14);
  c.lineTo(bx-bw*0.06, by+bh*0.18);
  c.bezierCurveTo(bx-bw*0.32, by+bh*0.2, bx-bw*0.34, by+bh*0.3, bx-bw*0.26, by+bh*0.42);
  c.bezierCurveTo(bx-bw*0.3, by+bh*0.5, bx-bw*0.28, by+bh*0.58, bx-bw*0.2, by+bh*0.63);
  c.bezierCurveTo(bx-bw*0.22, by+bh*0.75, bx-bw*0.22, by+bh*0.9, bx-bw*0.16, by+bh*0.99);
  c.lineTo(bx-bw*0.04, by+bh*0.99);
  c.bezierCurveTo(bx-bw*0.05, by+bh*0.82, bx-bw*0.03, by+bh*0.7, bx, by+bh*0.66);
  c.bezierCurveTo(bx+bw*0.03, by+bh*0.7, bx+bw*0.05, by+bh*0.82, bx+bw*0.04, by+bh*0.99);
  c.lineTo(bx+bw*0.16, by+bh*0.99);
  c.bezierCurveTo(bx+bw*0.22, by+bh*0.9, bx+bw*0.22, by+bh*0.75, bx+bw*0.2, by+bh*0.63);
  c.bezierCurveTo(bx+bw*0.28, by+bh*0.58, bx+bw*0.3, by+bh*0.5, bx+bw*0.26, by+bh*0.42);
  c.bezierCurveTo(bx+bw*0.34, by+bh*0.3, bx+bw*0.32, by+bh*0.2, bx+bw*0.06, by+bh*0.18);
  c.lineTo(bx+bw*0.05, by+bh*0.14);
  c.closePath(); c.fill(); c.stroke();
  // الذراعان
  [-1,1].forEach(side=>{
    c.beginPath();
    c.moveTo(bx+side*bw*0.28, by+bh*0.22);
    c.bezierCurveTo(bx+side*bw*0.4, by+bh*0.3, bx+side*bw*0.42, by+bh*0.42, bx+side*bw*0.36, by+bh*0.52);
    c.stroke();
  });
  c.restore();
}
function g6bDrawStomach(c, cx, cy, s, dark){
  c.save(); c.translate(cx,cy); c.scale(s,s);
  const grad = c.createLinearGradient(-20,-30,20,30);
  grad.addColorStop(0, dark?'#F0C674':'#F5B041'); grad.addColorStop(1, dark?'#D19A3E':'#D68A1E');
  c.fillStyle = grad;
  c.beginPath();
  c.moveTo(-14,-38);
  c.bezierCurveTo(18,-40, 30,-20, 26,0);
  c.bezierCurveTo(24,18, 8,32, -10,24);
  c.bezierCurveTo(-24,18, -22,0, -12,-4);
  c.bezierCurveTo(-24,-8, -26,-30, -14,-38);
  c.closePath(); c.fill();
  c.strokeStyle='rgba(0,0,0,0.15)'; c.lineWidth=1.5; c.stroke();
  c.restore();
}
function g6bDrawIntestineCoil(c, cx, cy, s, dark){
  c.save(); c.translate(cx,cy); c.scale(s,s);
  c.strokeStyle = dark?'#7FC998':'#58A06E'; c.lineWidth=9; c.lineCap='round';
  const path = [[-24,-24],[16,-24],[16,-6],[-20,-6],[-20,12],[16,12],[16,28],[-16,28]];
  c.beginPath(); path.forEach((p,i)=> i===0?c.moveTo(p[0],p[1]):c.lineTo(p[0],p[1]));
  c.stroke();
  c.restore();
}

function g6bDrawKidney(c, cx, cy, s, dark){
  c.save(); c.translate(cx,cy); c.scale(s,s);
  const grad = c.createLinearGradient(-30,-40,30,40);
  grad.addColorStop(0, dark?'#B98AC9':'#A569BD'); grad.addColorStop(1, dark?'#8A5A9E':'#7D4A93');
  c.fillStyle = grad;
  c.beginPath();
  c.moveTo(0,-46);
  c.bezierCurveTo(28,-46, 34,-14, 34,0);
  c.bezierCurveTo(34,14, 26,20, 12,14);
  c.bezierCurveTo(2,10, 2,-10, 12,-14);
  c.bezierCurveTo(20,-18, 20,-30, 8,-38);
  c.bezierCurveTo(2,-44, -6,-46, -14,-44);
  c.bezierCurveTo(-30,-38, -34,-10, -30,16);
  c.bezierCurveTo(-26,42, -4,50, 8,44);
  c.bezierCurveTo(-6,50, -30,44, -34,16);
  c.bezierCurveTo(-38,-14, -28,-46, 0,-46);
  c.closePath(); c.fill();
  // الحوض الكلوي (منطقة أفتح داخل التقعّر)
  c.fillStyle = dark?'#D4B3E0':'#C7A0D6'; c.globalAlpha=0.55;
  c.beginPath(); c.ellipse(10,-2,12,14,0,0,Math.PI*2); c.fill(); c.globalAlpha=1;
  // الحالب
  c.strokeStyle = dark?'#D4B3E0':'#9B6FAE'; c.lineWidth=5; c.lineCap='round';
  c.beginPath(); c.moveTo(6,20); c.quadraticCurveTo(2,50,-4,70); c.stroke();
  c.restore();
}


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

    // جسم بشري تخطيطي واقعي
    const bx = w*0.5, by = h*0.06, bw = w*0.28, bh = h*0.62;
    g6bDrawBodyOutline(c, bx, by, bw, bh, dark);

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
    const G6B_ORGAN_DRAW = {
      brain: (c,x,y,r,dark)=>g6bDrawBrain(c,x,y,r*0.024,dark),
      heart: (c,x,y,r,dark)=>g6bDrawHeart(c,x,y,r*0.024,dark),
      lungs: (c,x,y,r,dark)=>g6bDrawLungPair(c,x,y,r*0.014,dark),
      stomach: (c,x,y,r,dark)=>g6bDrawStomach(c,x,y,r*0.026,dark),
      kidneys: (c,x,y,r,dark)=>g6bDrawKidney(c,x,y,r*0.022,dark),
      intestines: (c,x,y,r,dark)=>g6bDrawIntestineCoil(c,x,y,r*0.022,dark),
    };
    S.tray.forEach(o=>{
      const dragging = S.dragId===o.id;
      const r = w*0.042 * (dragging ? 1.18 : 1);
      c.save();
      if(dragging){ c.shadowColor='rgba(0,0,0,0.4)'; c.shadowBlur=14; }
      c.fillStyle = dark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)';
      c.beginPath(); c.arc(o.x*w, o.y*h, r, 0, Math.PI*2); c.fill();
      if(o.placed){ c.strokeStyle='#16A34A'; c.lineWidth=3; c.stroke(); }
      else if(dragging){ c.strokeStyle='#F5B041'; c.lineWidth=2.5; c.stroke(); }
      c.restore();
      const drawFn = G6B_ORGAN_DRAW[o.id];
      if(drawFn) drawFn(c, o.x*w, o.y*h, r, dark);
      c.textAlign='center'; c.textBaseline='middle';
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
    if(btn){ btn.style.background = ok?'#27AE60':'#E74C3C'; btn.style.color='white'; btn.style.borderColor = ok?'#27AE60':'#E74C3C'; _g6bFlash(btn, ok); }
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

    // القلب (رسم تشريحي واقعي)
    const hx = w*0.42, hy = h*0.42, r = w*0.075*beat;
    g6bDrawHeart(c, hx, hy, r*0.021, dark);

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
  const trayPos = [ {x:0.26,y:0.82}, {x:0.74,y:0.82}, {x:0.26,y:0.94}, {x:0.74,y:0.94} ];
  shuffled.forEach((s,i)=>{ S.chips.push({ id:s.id, text:s.text, x:trayPos[i].x, y:trayPos[i].y, inSlot:-1 }); });

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
      if(Math.abs(x-ch.x)<0.20 && Math.abs(y-ch.y)<0.06) return ch;
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
      c.beginPath(); c.roundRect(sp.x*w-w*0.21, sp.y*h-h*0.045, w*0.42, h*0.09, 10); c.stroke();
      c.setLineDash([]);
      if(S.slots[i]==null){
        c.fillStyle = g6bMut(dark); c.font=`bold ${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
        c.fillText(`الخطوة ${i+1}`, sp.x*w, sp.y*h+h*0.008);
      }
    });

    S.chips.forEach(ch=>{
      const dragging = S.dragId===ch.id;
      const cw = w*0.42*(dragging?1.05:1), chh = h*0.11*(dragging?1.08:1);
      c.save();
      if(dragging){ c.shadowColor='rgba(0,0,0,0.32)'; c.shadowBlur=12; }
      c.fillStyle = ch.inSlot>=0 ? '#DCFCE7' : (dark?'#2A2F3A':'#FFF');
      c.strokeStyle = ch.inSlot>=0 ? '#27AE60' : (dragging ? '#F5B041' : '#94A3B8');
      c.lineWidth = dragging ? 3 : 2;
      c.beginPath(); c.roundRect(ch.x*w-cw/2, ch.y*h-chh/2, cw, chh, 10); c.fill(); c.stroke();
      c.restore();
      c.fillStyle = dark?'#1A2530':'#2C3A4A';
      c.font = `${Math.round(h*0.019)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      g6bWrapText(c, ch.text, ch.x*w, ch.y*h, cw*0.88, h*0.026);
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
  simState = { selAct:null, selBpm:null, matched:[], flashId:null, flashOk:false, flashT:0 };
  const S = simState;

  function renderControls(){
    return `
      <div class="ctrl-section">
        <div class="ctrl-label">🎯 طابق النشاط بسرعة النبض</div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.8;margin-bottom:10px">اضغط نشاطاً من العمود الأيمن، ثم اضغط سرعة النبض التي تناسبه من العمود الأيسر — كل ذلك في الشاشة المقابلة.</div>
      </div>
      <div id="g6bMatchFeedback" style="font-size:13px;line-height:1.9;color:var(--text-secondary)"></div>
      <div style="margin-top:10px;font-weight:700;color:#27AE60">التقدّم: ${S.matched.length} / ${PAIRS.length}</div>`;
  }
  controls(renderControls());

  const cv = document.getElementById('simCanvas');
  function relPos(e){
    const rect = cv.getBoundingClientRect();
    const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
    return { x:(t.clientX-rect.left)/cv.offsetWidth, y:(t.clientY-rect.top)/cv.offsetHeight };
  }
  function actRect(i){ return { x:0.73, y:0.22+i*0.17, w:0.46, h:0.13 }; }
  function bpmRect(i){ return { x:0.27, y:0.22+i*0.17, w:0.34, h:0.13 }; }
  function hit(r,x,y){ return Math.abs(x-r.x)<r.w/2 && Math.abs(y-r.y)<r.h/2; }

  function tryMatch(){
    if(S.selAct==null || S.selBpm==null) return;
    const ok = S.selAct === S.selBpm;
    _g6bPlayChime(ok);
    S.flashOk = ok; S.flashT = 1;
    const fb = document.getElementById('g6bMatchFeedback');
    if(fb) fb.innerHTML = ok ? '✅ تطابق صحيح!' : '❌ غير مطابق — حاول مرة أخرى.';
    setTimeout(()=>{
      if(ok) S.matched.push(S.selAct);
      S.selAct = null; S.selBpm = null; S.flashT = 0;
      controls(renderControls());
      if(ok && S.matched.length === PAIRS.length){
        const fb2 = document.getElementById('g6bMatchFeedback');
        if(fb2) fb2.innerHTML = `
          <div style="padding:12px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(39,174,96,0.3)">
            <div style="font-weight:700;color:#16A34A;margin-bottom:6px">🎉 أحسنت! ماذا تعلّمت؟</div>
            <div style="color:var(--text-secondary);line-height:1.8">كلما زاد نشاط الجسم البدني، احتاج إلى غذاء وأكسجين أكثر بسرعة، فيرتفع معدل نبض القلب — والعكس صحيح أثناء الراحة والنوم.</div>
          </div>`;
      }
    }, ok ? 650 : 550);
  }
  function onClick(e){
    const p = relPos(e);
    PAIRS.forEach((pr,i)=>{
      if(S.matched.includes(pr.id)) return;
      if(hit(actRect(i), p.x, p.y)){ S.selAct = pr.id; _g6bPlayClick(); tryMatch(); }
    });
    bpms.forEach((pr,i)=>{
      if(S.matched.includes(pr.id)) return;
      if(hit(bpmRect(i), p.x, p.y)){ S.selBpm = pr.id; _g6bPlayClick(); tryMatch(); }
    });
  }
  cv.onmousedown = onClick;
  cv.ontouchstart = e=>{ e.preventDefault(); onClick(e); };
  cv.onmousemove=null; cv.onmouseup=null; cv.onmouseleave=null; cv.ontouchmove=null; cv.ontouchend=null;

  function drawBtn(c,w,h,r,label,state){
    // state: 'normal' | 'selected' | 'matched' | 'correct' | 'wrong'
    const colors = {
      normal:  { bg: isDarkMode()?'#2A2F3A':'#FFF', bd:'#94A3B8', tx: g6bTxt(isDarkMode()) },
      selected:{ bg:'#FEF3C7', bd:'#F5B041', tx:'#7A5B10' },
      matched: { bg:'#DCFCE7', bd:'#27AE60', tx:'#16A34A' },
      correct: { bg:'#27AE60', bd:'#27AE60', tx:'#FFFFFF' },
      wrong:   { bg:'#E74C3C', bd:'#E74C3C', tx:'#FFFFFF' },
    }[state];
    const bx = r.x*w-r.w*w/2, by = r.y*h-r.h*h/2, bw = r.w*w, bh = r.h*h;
    c.save();
    if(state==='selected'){ c.shadowColor='rgba(0,0,0,0.2)'; c.shadowBlur=10; }
    c.fillStyle = colors.bg; c.strokeStyle = colors.bd; c.lineWidth = state==='normal'?2:3;
    c.beginPath(); c.roundRect(bx,by,bw,bh,14); c.fill(); c.stroke();
    c.restore();
    c.fillStyle = colors.tx; c.font = `bold ${Math.round(h*0.032)}px Tajawal`;
    c.textAlign='center'; c.textBaseline='middle';
    c.fillText(label, r.x*w, r.y*h);
    if(state==='matched'){ c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.fillText('✓', r.x*w + bw/2 - w*0.03, r.y*h - bh/2 + h*0.015); }
  }

  function draw(){
    if(currentSim!=='g6body3' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    c.fillStyle = g6bBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle = g6bTxt(dark);
    c.font = `bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
    c.fillText('١-٣ · طابق النشاط بالنبض', w/2, h*0.06);
    c.font = `${Math.round(h*0.022)}px Tajawal`; c.fillStyle = g6bMut(dark);
    c.fillText('النشاط', w*0.73, h*0.14); c.fillText('سرعة النبض', w*0.27, h*0.14);

    if(S.flashT>0) S.flashT -= 0.03;

    PAIRS.forEach((pr,i)=>{
      const r = actRect(i);
      let state = 'normal';
      if(S.matched.includes(pr.id)) state='matched';
      else if(S.flashT>0 && S.selAct===pr.id) state = S.flashOk?'correct':'wrong';
      else if(S.selAct===pr.id) state='selected';
      drawBtn(c,w,h,r,pr.act,state);
    });
    bpms.forEach((pr,i)=>{
      const r = bpmRect(i);
      let state = 'normal';
      if(S.matched.includes(pr.id)) state='matched';
      else if(S.flashT>0 && S.selBpm===pr.id) state = S.flashOk?'correct':'wrong';
      else if(S.selBpm===pr.id) state='selected';
      drawBtn(c,w,h,r,String(pr.bpm),state);
    });

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
    g6bDrawLungPair(c, cx, cy, scale*w*0.0016, dark);

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

/* ════════════════════════════════════════
   الدرس ٥ · التاب ١ — استقصاء: رحلة الطعام في الجهاز الهضمي
════════════════════════════════════════ */
function simG6Body5a(){
  cancelAnimationFrame(animFrame);
  const PATH = [
    { id:'mouth', name:'الفم', x:0.5, y:0.1,  fn:'تمضغ الأسنان الطعام وتقطّعه، ويبدأ اللُّعاب في هضمه.' },
    { id:'esoph', name:'المريء', x:0.5, y:0.28, fn:'أنبوب يدفع الطعام الذي تم ابتلاعه نحو المعدة.' },
    { id:'stom',  name:'المعدة', x:0.44,y:0.46, fn:'تمتزج الطعام بعصارات هضمية لتتحوّل إلى سائل سميك.' },
    { id:'sint',  name:'الأمعاء الدقيقة', x:0.5, y:0.62, fn:'تُفتّت الطعام لجزيئات صغيرة تنتقل إلى الدم.' },
    { id:'lint',  name:'الأمعاء الغليظة', x:0.4, y:0.78, fn:'تتخلّص من بقايا الطعام غير المهضوم على شكل فضلات.' },
  ];
  const FOODS = [ {id:'bread',label:'🍞 خبز'}, {id:'apple',label:'🍎 تفاحة'}, {id:'milk',label:'🥛 حليب'} ];
  simState = { food:null, step:-1 };
  const S = simState;

  function renderControls(){
    if(S.food==null){
      return `
        <div class="ctrl-section">
          <div class="ctrl-label">🍽️ استقصاء: رحلة الطعام</div>
          <div style="font-size:13px;color:var(--text-secondary);line-height:1.8;margin-bottom:10px">اختر نوع الطعام لتشاهد رحلته داخل جهازك الهضمي.</div>
        </div>
        <div style="display:flex;gap:8px">
          ${FOODS.map(f=>`<button onclick="window._g6bPickFood('${f.id}')" style="flex:1;padding:12px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-size:16px;font-weight:700;cursor:pointer">${f.label}</button>`).join('')}
        </div>`;
    }
    const atEnd = S.step >= PATH.length-1;
    return `
      <div class="ctrl-section">
        <div class="ctrl-label">🍽️ رحلة الطعام</div>
        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px">الخطوة ${Math.max(0,S.step)+1} من ${PATH.length}</div>
      </div>
      <div id="g6bFoodInfo" style="font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;border:1px solid rgba(245,176,65,0.25);min-height:60px">
        ${S.step<0 ? 'اضغط "التالي" لتبدأ رحلة الطعام.' : `<strong>${PATH[S.step].name}:</strong> ${PATH[S.step].fn}`}
      </div>
      <button class="ctrl-btn play" style="margin-top:12px" onclick="window._g6bFoodNext()" ${atEnd?'disabled':''}>${atEnd?'✅ اكتملت الرحلة':'➡ التالي'}</button>
      <button class="ctrl-btn reset" style="margin-top:8px" onclick="window._g6bFoodReset()">↺ اختر طعاماً آخر</button>
      ${atEnd ? `<div style="margin-top:12px;padding:12px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(39,174,96,0.3)">
          <div style="font-weight:700;color:#16A34A;margin-bottom:6px">🎉 ماذا تعلّمت؟</div>
          <div style="color:var(--text-secondary);font-size:12px;line-height:1.8">يمرّ الطعام برحلة طويلة من الفم حتى الأمعاء الغليظة، وفي كل مرحلة يقوم عضو مختلف بدور معيّن حتى يستفيد الجسم من الغذاء.</div>
        </div>` : ''}`;
  }
  controls(renderControls());

  window._g6bPickFood = function(id){ S.food=id; S.step=-1; _g6bPlayClick(); controls(renderControls()); };
  window._g6bFoodNext = function(){
    S.step = Math.min(PATH.length-1, S.step+1);
    _g6bPlayClick();
    if(S.step===PATH.length-1) _g6bPlayChime(true);
    controls(renderControls());
  };
  window._g6bFoodReset = function(){ S.food=null; S.step=-1; controls(renderControls()); };

  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g6body5' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    c.fillStyle = g6bBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle = g6bTxt(dark);
    c.font = `bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
    c.fillText('١-٥ · الجهاز الهضمي', w/2, h*0.045);

    c.strokeStyle = dark?'rgba(230,220,200,0.4)':'rgba(50,60,75,0.35)'; c.lineWidth=3;
    c.beginPath();
    PATH.forEach((p,i)=>{ if(i===0) c.moveTo(p.x*w,p.y*h); else c.lineTo(p.x*w,p.y*h); });
    c.stroke();

    PATH.forEach((p,i)=>{
      const reached = S.food!=null && i<=S.step;
      c.fillStyle = reached ? '#F5B041' : (dark?'rgba(255,255,255,0.15)':'rgba(0,0,0,0.12)');
      c.beginPath(); c.arc(p.x*w, p.y*h, w*0.026, 0, Math.PI*2); c.fill();
      c.fillStyle = g6bMut(dark); c.font=`${Math.round(h*0.02)}px Tajawal`; c.textAlign='right'; c.direction='rtl';
      c.fillText(p.name, p.x*w - w*0.05, p.y*h + h*0.008);
    });
    c.direction='ltr'; c.textAlign='center';

    if(S.food!=null && S.step>=0){
      const p = PATH[S.step];
      const emoji = {bread:'🍞',apple:'🍎',milk:'🥛'}[S.food];
      c.font = `${Math.round(h*0.05)}px serif`;
      c.fillText(emoji, p.x*w + w*0.07, p.y*h + h*0.015);
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   الدرس ٥ · التاب ٢ — نشاط: رتّب أعضاء الجهاز الهضمي
════════════════════════════════════════ */
function simG6Body5b(){
  cancelAnimationFrame(animFrame);
  const STEPS = [
    { id:0, text:'الفم' }, { id:1, text:'المريء' }, { id:2, text:'المعدة' },
    { id:3, text:'الأمعاء الدقيقة' }, { id:4, text:'الأمعاء الغليظة' },
  ];
  simState = { chips:[], slots:[null,null,null,null,null], dragId:null, done:false };
  const S = simState;
  const shuffled = [...STEPS].sort(()=>Math.random()-0.5);
  const trayPos = [ {x:0.19,y:0.85}, {x:0.5,y:0.85}, {x:0.81,y:0.85}, {x:0.34,y:0.955}, {x:0.66,y:0.955} ];
  shuffled.forEach((s,i)=>{ S.chips.push({ id:s.id, text:s.text, x:trayPos[i].x, y:trayPos[i].y, inSlot:-1 }); });

  function renderControls(){
    return `
      <div class="ctrl-section">
        <div class="ctrl-label">🔀 رتّب أعضاء الجهاز الهضمي</div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.8;margin-bottom:10px">اسحب كل بطاقة إلى مكانها الصحيح بترتيب رحلة الطعام، ثم اضغط "تحقّق".</div>
      </div>
      <button class="ctrl-btn play" onclick="window._g6bCheck5()">✅ تحقّق من الترتيب</button>
      <div id="g6bOrderFeedback5" style="margin-top:12px;font-size:13px;line-height:1.9;color:var(--text-secondary)"></div>`;
  }
  controls(renderControls());

  const cv = document.getElementById('simCanvas');
  function relPos(e){
    const rect = cv.getBoundingClientRect();
    const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
    return { x:(t.clientX-rect.left)/cv.offsetWidth, y:(t.clientY-rect.top)/cv.offsetHeight };
  }
  const slotPos = [ {x:0.5,y:0.09}, {x:0.5,y:0.24}, {x:0.5,y:0.39}, {x:0.5,y:0.54}, {x:0.5,y:0.69} ];
  function findChipAt(x,y){
    for(let i=S.chips.length-1;i>=0;i--){ const ch=S.chips[i]; if(Math.abs(x-ch.x)<0.14 && Math.abs(y-ch.y)<0.055) return ch; }
    return null;
  }
  function onDown(e){ const p=relPos(e); const ch=findChipAt(p.x,p.y); if(ch) S.dragId=ch.id; }
  function onMove(e){ if(S.dragId==null) return; const p=relPos(e); const ch=S.chips.find(c=>c.id===S.dragId); if(ch){ch.x=p.x;ch.y=p.y;} }
  function onUp(){
    if(S.dragId==null) return;
    const ch = S.chips.find(c=>c.id===S.dragId);
    let placed = false;
    for(let i=0;i<5;i++){
      if(Math.abs(ch.x-slotPos[i].x)<0.22 && Math.abs(ch.y-slotPos[i].y)<0.06){
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

  window._g6bCheck5 = function(){
    const allFilled = S.slots.every(id=>id!=null);
    const allCorrect = S.slots.every((id,i)=>id===i);
    _g6bPlayChime(allCorrect && allFilled);
    const fb = document.getElementById('g6bOrderFeedback5');
    if(!allFilled){ if(fb) fb.innerHTML='⚠️ رتّب جميع البطاقات الخمس أولاً.'; return; }
    if(allCorrect){
      S.done = true;
      if(fb) fb.innerHTML = `
        <div style="padding:12px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(39,174,96,0.3)">
          <div style="font-weight:700;color:#16A34A;margin-bottom:6px">🎉 صحيح! ماذا تعلّمت؟</div>
          <div style="color:var(--text-secondary);line-height:1.8">يمرّ الطعام بترتيب محدّد: الفم، ثم المريء، ثم المعدة، ثم الأمعاء الدقيقة، وأخيراً الأمعاء الغليظة — وكل عضو له دور مختلف في هذه الرحلة.</div>
        </div>`;
    } else {
      if(fb) fb.innerHTML = '❌ الترتيب غير صحيح — حاول مرة أخرى.';
    }
  };

  function draw(){
    if(currentSim!=='g6body5' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    c.fillStyle = g6bBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle = g6bTxt(dark);
    c.font = `bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
    c.fillText('١-٥ · رتّب الجهاز الهضمي', w/2, h*0.04);

    slotPos.forEach((sp,i)=>{
      c.strokeStyle = S.slots[i]!=null ? '#27AE60' : (dark?'rgba(230,220,200,0.4)':'rgba(50,60,75,0.35)');
      c.lineWidth=2; c.setLineDash(S.slots[i]==null?[6,5]:[]);
      c.beginPath(); c.roundRect(sp.x*w-w*0.19, sp.y*h-h*0.035, w*0.38, h*0.07, 10); c.stroke(); c.setLineDash([]);
      if(S.slots[i]==null){
        c.fillStyle = g6bMut(dark); c.font=`bold ${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
        c.fillText(`الخطوة ${i+1}`, sp.x*w, sp.y*h+h*0.007);
      }
    });
    S.chips.forEach(ch=>{
      const dragging = S.dragId===ch.id;
      const cw=w*0.29*(dragging?1.05:1), chh=h*0.075*(dragging?1.08:1);
      c.save();
      if(dragging){ c.shadowColor='rgba(0,0,0,0.32)'; c.shadowBlur=12; }
      c.fillStyle = ch.inSlot>=0 ? '#FEF3C7' : (dark?'#2A2F3A':'#FFF');
      c.strokeStyle = ch.inSlot>=0 ? '#F5B041' : (dragging?'#27AE60':'#94A3B8'); c.lineWidth=dragging?3:2;
      c.beginPath(); c.roundRect(ch.x*w-cw/2, ch.y*h-chh/2, cw, chh, 10); c.fill(); c.stroke();
      c.restore();
      c.fillStyle = dark?'#1A2530':'#2C3A4A'; c.font=`${Math.round(h*0.019)}px Tajawal`;
      c.textAlign='center'; c.textBaseline='middle'; g6bWrapText(c, ch.text, ch.x*w, ch.y*h, cw*0.85, h*0.025);
    });
    c.textBaseline='alphabetic';
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   الدرس ٦ · التاب ١ — استقصاء: كيف تعمل الكليتان؟
════════════════════════════════════════ */
function simG6Body6a(){
  cancelAnimationFrame(animFrame);
  simState = { running:false, particles:[], filtered:0 };
  const S = simState;

  function renderControls(){
    return `
      <div class="ctrl-section">
        <div class="ctrl-label">🫘 استقصاء: كيف تعمل الكليتان؟</div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.8;margin-bottom:10px">
          الدم يدخل الكليتين محمَّلاً بالماء والفضلات والأملاح. اضغط الزر لتشغيل الترشيح وشاهد كيف تفصل الكليتان الفضلات عن الدم.
        </div>
      </div>
      <button class="ctrl-btn play" id="g6bKidneyBtn" onclick="window._g6bKidneyToggle()">🔬 شغّل الترشيح</button>
      <div id="g6bKidneyInfo" style="margin-top:12px;font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;border:1px solid rgba(175,122,197,0.25)">
        الدم يصل إلى الكليتين محمَّلاً بالماء والفضلات والأملاح.
      </div>`;
  }
  controls(renderControls());

  window._g6bKidneyToggle = function(){
    S.running = !S.running; _g6bPlayClick();
    const btn = document.getElementById('g6bKidneyBtn');
    if(btn) btn.textContent = S.running ? '⏸ إيقاف الترشيح' : '🔬 شغّل الترشيح';
    const info = document.getElementById('g6bKidneyInfo');
    if(info) info.innerHTML = S.running
      ? 'الكليتان تُرشِّحان الدم الآن: الماء والمواد المفيدة تعود إلى الدم، بينما تتحوّل الفضلات إلى بول.'
      : 'توقّف الترشيح. اضغط الزر لإعادة تشغيله.';
  };

  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g6body6' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    c.fillStyle = g6bBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle = g6bTxt(dark);
    c.font = `bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
    c.fillText('١-٦ · ما وظيفة الكُليتين؟', w/2, h*0.06);

    // كليتان
    [-1,1].forEach(side=>{
      c.save(); c.translate(w*0.5+side*w*0.09, h*0.42); c.scale(side,1);
      g6bDrawKidney(c, 0, 0, w*0.0019, dark);
      c.restore();
    });
    c.fillStyle = g6bMut(dark); c.font=`${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText('الكليتان', w/2, h*0.62);

    if(S.running && Math.random()<0.06){
      const types = ['💧','🧂','🗑️'];
      S.particles.push({ type: types[Math.floor(Math.random()*3)], age:0, side: Math.random()<0.5?-1:1 });
    }
    S.particles = S.particles.filter(p=>p.age<1);
    S.particles.forEach(p=>{
      p.age += 0.015;
      const startY = h*0.14, midY = h*0.42;
      let x, y;
      if(p.age < 0.5){
        x = w*0.5 + p.side*w*0.09*(p.age*2);
        y = startY + (midY-startY)*(p.age*2);
      } else {
        const goingBack = p.type !== '🗑️';
        x = w*0.5 + p.side*w*0.09 + (goingBack ? -p.side*w*0.22 : 0)*((p.age-0.5)*2);
        y = midY + (goingBack ? -h*0.05 : h*0.28)*((p.age-0.5)*2);
      }
      c.font = `${Math.round(h*0.03)}px serif`; c.textAlign='center';
      c.fillText(p.type, x, y);
    });

    c.fillStyle = g6bTxt(dark); c.font=`bold ${Math.round(h*0.024)}px Tajawal`;
    c.fillText('🩸 الدم', w/2, h*0.11);
    c.fillText('💧🧂 يعود للدم', w*0.5-w*0.28, h*0.32);
    c.fillText('🚽 بول', w/2, h*0.9);

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   الدرس ٦ · التاب ٢ — نشاط: فرز المواد
════════════════════════════════════════ */
function simG6Body6b(){
  cancelAnimationFrame(animFrame);
  const ITEMS = [
    { id:0, label:'💧 الماء اللازم للجسم', ans:'blood' },
    { id:1, label:'🗑️ الفضلات', ans:'urine' },
    { id:2, label:'🧂 الأملاح الزائدة', ans:'urine' },
    { id:3, label:'🧬 المواد المفيدة', ans:'blood' },
    { id:4, label:'💧 الماء الزائد', ans:'urine' },
    { id:5, label:'🧂 الأملاح اللازمة', ans:'blood' },
  ];
  simState = { idx:0, score:0, flash:null, flashT:0 };
  const S = simState;

  function renderControls(){
    if(S.idx >= ITEMS.length){
      return `
        <div class="ctrl-section"><div class="ctrl-label">🧪 لعبة فرز المواد</div></div>
        <div style="margin-top:10px;padding:14px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(39,174,96,0.3)">
          <div style="font-weight:700;color:#16A34A;margin-bottom:6px">🎉 انتهت اللعبة!</div>
          <div style="font-size:13px;color:var(--text-secondary);margin-bottom:10px">فرزت ${S.score} من ${ITEMS.length} بشكل صحيح.</div>
          <div style="font-size:12px;color:var(--text-secondary);line-height:1.8">ماذا تعلّمت؟ الكليتان تحافظان على المواد المفيدة للجسم وتتخلّصان فقط من الفضلات والزوائد على شكل بول.</div>
        </div>
        <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g6bSortRestart()">↺ العب مرة أخرى</button>`;
    }
    return `
      <div class="ctrl-section">
        <div class="ctrl-label">🧪 لعبة فرز المواد</div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.8">شاهد المادة في الشاشة المقابلة، واضغط الوجهة الصحيحة لها هناك.</div>
      </div>
      <div style="margin-top:8px;font-weight:700;color:#27AE60">${S.idx+1} / ${ITEMS.length}</div>
      <div id="g6bSortFb" style="margin-top:10px;font-size:13px;min-height:20px"></div>`;
  }
  controls(renderControls());

  window._g6bSortRestart = function(){ S.idx=0; S.score=0; controls(renderControls()); };

  const cv = document.getElementById('simCanvas');
  function relPos(e){
    const rect = cv.getBoundingClientRect();
    const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
    return { x:(t.clientX-rect.left)/cv.offsetWidth, y:(t.clientY-rect.top)/cv.offsetHeight };
  }
  const bloodRect = { x:0.28, y:0.75, w:0.4, h:0.16 };
  const urineRect = { x:0.72, y:0.75, w:0.4, h:0.16 };
  function hit(r,x,y){ return Math.abs(x-r.x)<r.w/2 && Math.abs(y-r.y)<r.h/2; }

  function onClick(e){
    if(S.idx>=ITEMS.length || S.flashT>0) return;
    const p = relPos(e);
    let choice = null;
    if(hit(bloodRect,p.x,p.y)) choice='blood';
    else if(hit(urineRect,p.x,p.y)) choice='urine';
    if(!choice) return;
    const it = ITEMS[S.idx];
    const ok = choice===it.ans;
    if(ok) S.score++;
    _g6bPlayChime(ok);
    S.flash = choice; S.flashT = 1;
    const fb = document.getElementById('g6bSortFb');
    if(fb) fb.innerHTML = ok ? '✅ صحيح!' : `❌ الصحيح: ${it.ans==='blood'?'تعود للدم':'تتحول لبول'}`;
    setTimeout(()=>{ S.idx++; S.flash=null; S.flashT=0; controls(renderControls()); }, 900);
  }
  cv.onmousedown = onClick;
  cv.ontouchstart = e=>{ e.preventDefault(); onClick(e); };
  cv.onmousemove=null; cv.onmouseup=null; cv.onmouseleave=null; cv.ontouchmove=null; cv.ontouchend=null;

  function drawZone(c,w,h,r,label,icon,active,ok){
    const bx=r.x*w-r.w*w/2, by=r.y*h-r.h*h/2, bw=r.w*w, bh=r.h*h;
    let bg = isDarkMode()?'#2A2F3A':'#FFF', bd = icon==='blood'?'#E74C3C':'#AF7AC5';
    if(active){ bg = ok?'#27AE60':'#E74C3C'; bd = bg; }
    c.save();
    if(active){ c.shadowColor='rgba(0,0,0,0.25)'; c.shadowBlur=12; }
    c.fillStyle = bg; c.strokeStyle = bd; c.lineWidth = 3;
    c.beginPath(); c.roundRect(bx,by,bw,bh,16); c.fill(); c.stroke();
    c.restore();
    c.fillStyle = active ? '#FFFFFF' : bd;
    c.font = `bold ${Math.round(h*0.036)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(label, r.x*w, r.y*h);
  }

  function draw(){
    if(currentSim!=='g6body6' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    c.fillStyle = g6bBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle = g6bTxt(dark);
    c.font = `bold ${Math.round(h*0.036)}px Tajawal`; c.textAlign='center';
    c.fillText('١-٦ · فرز المواد', w/2, h*0.08);

    if(S.flashT>0) S.flashT -= 0.03;

    if(S.idx < ITEMS.length){
      const it = ITEMS[S.idx];
      c.fillStyle = dark?'#2A2F3A':'#FFF'; c.strokeStyle='#F5B041'; c.lineWidth=2;
      c.beginPath(); c.roundRect(w*0.5-w*0.34, h*0.18, w*0.68, h*0.28, 16); c.fill(); c.stroke();
      c.font = `${Math.round(h*0.06)}px Tajawal`; c.fillStyle=g6bTxt(dark);
      c.textAlign='center'; c.textBaseline='middle';
      c.fillText(it.label, w/2, h*0.32);

      drawZone(c,w,h,bloodRect,'🩸 تعود للدم','blood', S.flashT>0 && S.flash==='blood', S.flash==='blood' ? it.ans==='blood' : null);
      drawZone(c,w,h,urineRect,'🚽 تتحول لبول','urine', S.flashT>0 && S.flash==='urine', S.flash==='urine' ? it.ans==='urine' : null);
    } else {
      c.font = `${Math.round(h*0.13)}px serif`; c.textAlign='center';
      c.fillText('🎉', w/2, h*0.4);
      c.fillStyle = g6bMut(dark); c.font=`${Math.round(h*0.03)}px Tajawal`;
      c.fillText('أحسنت صنعاً!', w/2, h*0.58);
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   الدرس ٧ · التاب ١ — استقصاء: كيف يعمل الدماغ؟
════════════════════════════════════════ */
function simG6Body7a(){
  cancelAnimationFrame(animFrame);
  const SCENES = [
    { id:'hot', label:'🔥 لمس شيء ساخن', sense:'الجلد', signal:'إشارة الألم', action:'سحب اليد بسرعة!' },
    { id:'ball', label:'⚽ رؤية كرة', sense:'العين', signal:'إشارة الرؤية', action:'التقاط الكرة أو تجنّبها!' },
    { id:'sound', label:'🔊 سماع صوت', sense:'الأذن', signal:'إشارة السمع', action:'الالتفات نحو الصوت!' },
  ];
  simState = { scene:null, p:0 };
  const S = simState;

  function renderControls(){
    return `
      <div class="ctrl-section">
        <div class="ctrl-label">🧠 استقصاء: كيف يعمل الدماغ؟</div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.8;margin-bottom:10px">اختر موقفاً وشاهد كيف تنتقل الإشارة من الحاسة إلى الدماغ، ثم يعود الأمر إلى العضلات.</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${SCENES.map(s=>`<button onclick="window._g6bScene('${s.id}')" style="padding:12px;border-radius:9px;border:2px solid ${S.scene===s.id?'#27AE60':'#ddd'};background:${S.scene===s.id?'#27AE60':'var(--bg-ctrl-btn)'};color:${S.scene===s.id?'white':'var(--text-secondary)'};font-family:Tajawal,sans-serif;font-size:14px;font-weight:700;cursor:pointer">${s.label}</button>`).join('')}
      </div>
      <div id="g6bBrainInfo" style="margin-top:12px;font-size:13px;line-height:1.9;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:13px;border:1px solid rgba(244,166,160,0.3);min-height:40px">
        اختر موقفاً لتشاهد رحلة الإشارة العصبية.
      </div>`;
  }
  controls(renderControls());

  window._g6bScene = function(id){
    S.scene = id; S.p = 0.0001; _g6bPlayClick();
    controls(renderControls());
  };

  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g6body7' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    c.fillStyle = g6bBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle = g6bTxt(dark);
    c.font = `bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
    c.fillText('١-٧ · ما وظيفة الدماغ؟', w/2, h*0.06);

    const bx=w*0.5, by=h*0.14, bw=w*0.22, bh=h*0.7;
    g6bDrawBodyOutline(c, bx, by, bw, bh, dark);
    const headX=bx, headY=by+bh*0.07, handX=bx+bw*0.36, handY=by+bh*0.52, eyeX=bx-bw*0.06, eyeY=by+bh*0.06;

    // الدماغ داخل الرأس
    g6bDrawBrain(c, headX, headY, bw*0.0026, dark);

    const sceneMeta = { hot:{iconPos:'hand',icon:'🔥'}, ball:{iconPos:'eye',icon:'⚽'}, sound:{iconPos:'ear',icon:'🔊'} };
    const meta = S.scene ? sceneMeta[S.scene] : null;

    // نقطة الحاسة (تتغيّر حسب الموقف)
    const sensePt = meta && meta.iconPos==='hand' ? {x:handX,y:handY} : {x:eyeX,y:eyeY};
    if(meta){
      c.font = `${Math.round(bh*0.06)}px serif`; c.textAlign='center';
      c.fillText(meta.icon, sensePt.x + bw*0.16, sensePt.y - bh*0.03);
    }

    // توهّج العضلة (اليد) عند رد الفعل
    if(S.scene && S.p>=0.5){
      const glowA = Math.min(1,(S.p-0.5)*2);
      c.save(); c.globalAlpha = glowA*0.6;
      const gg = c.createRadialGradient(handX,handY,2,handX,handY,bw*0.22);
      gg.addColorStop(0,'#F39C12'); gg.addColorStop(1,'rgba(243,156,18,0)');
      c.fillStyle = gg; c.beginPath(); c.arc(handX,handY,bw*0.22,0,Math.PI*2); c.fill();
      c.restore();
    }
    // توهّج الدماغ عند وصول الإشارة
    if(S.scene && S.p>=0.03 && S.p<0.55){
      c.save(); c.globalAlpha = 0.35;
      const gg = c.createRadialGradient(headX,headY,2,headX,headY,bw*0.22);
      gg.addColorStop(0,'#F4A6A0'); gg.addColorStop(1,'rgba(244,166,160,0)');
      c.fillStyle = gg; c.beginPath(); c.arc(headX,headY,bw*0.22,0,Math.PI*2); c.fill();
      c.restore();
    }

    c.fillStyle = g6bMut(dark); c.font=`${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
    c.fillText('🧠 الدماغ', headX, headY - bh*0.13);
    c.fillText('💪 العضلة', handX + bw*0.02, handY + bh*0.09);

    if(S.scene){
      const sc = SCENES.find(s=>s.id===S.scene);
      if(S.p<1) S.p += 0.012;
      let dotX, dotY, label;
      if(S.p < 0.5){ dotX = sensePt.x + (headX-sensePt.x)*(S.p*2); dotY = sensePt.y + (headY-sensePt.y)*(S.p*2); label = sc.signal; }
      else { dotX = headX + (handX-headX)*((S.p-0.5)*2); dotY = headY + (handY-headY)*((S.p-0.5)*2); label = sc.action; }
      c.fillStyle = '#F39C12';
      c.beginPath(); c.arc(dotX,dotY,w*0.012,0,Math.PI*2); c.fill();
      c.fillStyle = g6bTxt(dark); c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
      c.fillText(label, w/2, h*0.93);
      if(S.p>=1){
        c.font=`${Math.round(h*0.024)}px Tajawal`; c.fillStyle=g6bMut(dark);
        c.fillText(`${sc.sense} → الدماغ → العضلات`, w/2, h*0.85);
      }
    }

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   الدرس ٧ · التاب ٢ — نشاط: من المسؤول؟
════════════════════════════════════════ */
function simG6Body7b(){
  cancelAnimationFrame(animFrame);
  const PAIRS = [
    { id:0, sense:'👁️ العين',  fn:'الرؤية' },
    { id:1, sense:'👂 الأذن',  fn:'السمع' },
    { id:2, sense:'✋ الجلد',  fn:'اللمس' },
    { id:3, sense:'👃 الأنف',  fn:'الشمّ' },
    { id:4, sense:'👅 اللسان', fn:'التذوّق' },
  ];
  const fns = [...PAIRS].sort(()=>Math.random()-0.5);
  simState = { selSense:null, selFn:null, matched:[], flashOk:false, flashT:0 };
  const S = simState;

  function renderControls(){
    return `
      <div class="ctrl-section">
        <div class="ctrl-label">🎯 من المسؤول؟</div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.8;margin-bottom:10px">اضغط الحاسة من العمود الأيمن، ثم اضغط الوظيفة التي يتحكم بها الدماغ من خلالها من العمود الأيسر — في الشاشة المقابلة.</div>
      </div>
      <div id="g6bBrainMatchFb" style="font-size:13px;line-height:1.9;color:var(--text-secondary)"></div>
      <div style="margin-top:10px;font-weight:700;color:#27AE60">التقدّم: ${S.matched.length} / ${PAIRS.length}</div>`;
  }
  controls(renderControls());

  const cv = document.getElementById('simCanvas');
  function relPos(e){
    const rect = cv.getBoundingClientRect();
    const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
    return { x:(t.clientX-rect.left)/cv.offsetWidth, y:(t.clientY-rect.top)/cv.offsetHeight };
  }
  function senseRect(i){ return { x:0.75, y:0.16+i*0.155, w:0.42, h:0.12 }; }
  function fnRect(i){ return { x:0.25, y:0.16+i*0.155, w:0.34, h:0.12 }; }
  function hit(r,x,y){ return Math.abs(x-r.x)<r.w/2 && Math.abs(y-r.y)<r.h/2; }

  function tryMatch(){
    if(S.selSense==null || S.selFn==null) return;
    const ok = S.selSense === S.selFn;
    _g6bPlayChime(ok);
    S.flashOk = ok; S.flashT = 1;
    const fb = document.getElementById('g6bBrainMatchFb');
    if(fb) fb.innerHTML = ok ? '✅ تطابق صحيح!' : '❌ غير مطابق — حاول مرة أخرى.';
    setTimeout(()=>{
      if(ok) S.matched.push(S.selSense);
      S.selSense = null; S.selFn = null; S.flashT = 0;
      controls(renderControls());
      if(ok && S.matched.length === PAIRS.length){
        const fb2 = document.getElementById('g6bBrainMatchFb');
        if(fb2) fb2.innerHTML = `
          <div style="padding:12px;background:var(--bg-card2);border-radius:10px;border:1px solid rgba(39,174,96,0.3)">
            <div style="font-weight:700;color:#16A34A;margin-bottom:6px">🎉 أحسنت! ماذا تعلّمت؟</div>
            <div style="color:var(--text-secondary);line-height:1.8">الدماغ يستقبل إشارات من جميع الحواس الخمس (العين، الأذن، الجلد، الأنف، اللسان)، ويفسّرها، ثم يرسل الأوامر المناسبة إلى بقية الجسم — كل ذلك خلال أجزاء من الثانية!</div>
          </div>`;
      }
    }, ok ? 650 : 550);
  }
  function onClick(e){
    const p = relPos(e);
    PAIRS.forEach((pr,i)=>{
      if(S.matched.includes(pr.id)) return;
      if(hit(senseRect(i), p.x, p.y)){ S.selSense = pr.id; _g6bPlayClick(); tryMatch(); }
    });
    fns.forEach((pr,i)=>{
      if(S.matched.includes(pr.id)) return;
      if(hit(fnRect(i), p.x, p.y)){ S.selFn = pr.id; _g6bPlayClick(); tryMatch(); }
    });
  }
  cv.onmousedown = onClick;
  cv.ontouchstart = e=>{ e.preventDefault(); onClick(e); };
  cv.onmousemove=null; cv.onmouseup=null; cv.onmouseleave=null; cv.ontouchmove=null; cv.ontouchend=null;

  function drawBtn(c,w,h,r,label,state){
    const dark = isDarkMode();
    const colors = {
      normal:  { bg: dark?'#2A2F3A':'#FFF', bd:'#94A3B8', tx: g6bTxt(dark) },
      selected:{ bg:'#FEF3C7', bd:'#F5B041', tx:'#7A5B10' },
      matched: { bg:'#DCFCE7', bd:'#27AE60', tx:'#16A34A' },
      correct: { bg:'#27AE60', bd:'#27AE60', tx:'#FFFFFF' },
      wrong:   { bg:'#E74C3C', bd:'#E74C3C', tx:'#FFFFFF' },
    }[state];
    const bx=r.x*w-r.w*w/2, by=r.y*h-r.h*h/2, bw=r.w*w, bh=r.h*h;
    c.save();
    if(state==='selected'){ c.shadowColor='rgba(0,0,0,0.2)'; c.shadowBlur=10; }
    c.fillStyle = colors.bg; c.strokeStyle = colors.bd; c.lineWidth = state==='normal'?2:3;
    c.beginPath(); c.roundRect(bx,by,bw,bh,14); c.fill(); c.stroke();
    c.restore();
    c.fillStyle = colors.tx; c.font = `bold ${Math.round(h*0.03)}px Tajawal`;
    c.textAlign='center'; c.textBaseline='middle';
    c.fillText(label, r.x*w, r.y*h);
  }

  function draw(){
    if(currentSim!=='g6body7' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = isDarkMode();
    c.fillStyle = g6bBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle = g6bTxt(dark);
    c.font = `bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
    c.fillText('١-٧ · من المسؤول؟', w/2, h*0.055);
    c.font = `${Math.round(h*0.02)}px Tajawal`; c.fillStyle = g6bMut(dark);
    c.fillText('الحاسة', w*0.75, h*0.1); c.fillText('الوظيفة', w*0.25, h*0.1);

    if(S.flashT>0) S.flashT -= 0.03;

    PAIRS.forEach((pr,i)=>{
      const r = senseRect(i);
      let state = 'normal';
      if(S.matched.includes(pr.id)) state='matched';
      else if(S.flashT>0 && S.selSense===pr.id) state = S.flashOk?'correct':'wrong';
      else if(S.selSense===pr.id) state='selected';
      drawBtn(c,w,h,r,pr.sense,state);
    });
    fns.forEach((pr,i)=>{
      const r = fnRect(i);
      let state = 'normal';
      if(S.matched.includes(pr.id)) state='matched';
      else if(S.flashT>0 && S.selFn===pr.id) state = S.flashOk?'correct':'wrong';
      else if(S.selFn===pr.id) state='selected';
      drawBtn(c,w,h,r,pr.fn,state);
    });

    animFrame = requestAnimationFrame(draw);
  }
  draw();
}
