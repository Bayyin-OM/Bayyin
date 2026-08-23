// ══════════════════════════════════════════════════════════════
// الوحدة ٢ · الكائنات الحية في البيئة — الصف السادس (الفصل الدراسي الأول)
// المرجع: كتاب العلوم للصف السادس — ص٣٤ - ٥١
// ══════════════════════════════════════════════════════════════

function g6eBg(dark){ return dark ? '#101A12' : '#F3F8F0'; }
function g6eTxt(dark){ return dark ? '#E4F0E0' : '#22331E'; }
function g6eMut(dark){ return dark ? '#8FB08A' : '#5C7A54'; }
function g6eGp(cv, e){
  const r = cv.getBoundingClientRect(), sc = cv.width / r.width;
  const s = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
  return { x: (s.clientX - r.left) * sc, y: (s.clientY - r.top) * sc };
}
function g6eWrap(c, text, cx, cy, maxW, lineH){
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
function g6eIsDark(){ return document.documentElement.classList.contains('dark-mode'); }
function g6eSnd(ok){ try{ ok ? _g8pPlayDrop() : _g8pPlayClick(); }catch(e){} }

// ════════════════════════════════════════════════════════════
// ٢-١ · السلاسل الغذائية في الموطن الطبيعي المحلي
// تبويب أ: استكشف الموطن الطبيعي
// ════════════════════════════════════════════════════════════
var G6E_HABITAT = [
  { id:'plant',  emoji:'🌱', name:'النبات', x:0.18, y:0.55, r:0.09,
    info:'النبات كائن مُنتِج؛ يصنع غذاءه بنفسه، وهو الغذاء الذي تعتمد عليه معظم الكائنات الأخرى في الموطن الطبيعي.' },
  { id:'insect', emoji:'🐛', name:'الحشرة (اليرقة)', x:0.34, y:0.68, r:0.075,
    info:'تتغذّى اليرقة على أوراق النباتات، وتُعدّ من الآفات التي تُسبِّب ثقوباً في سيقان النبات.' },
  { id:'bird',   emoji:'🐦', name:'الطائر', x:0.55, y:0.32, r:0.08,
    info:'يتغذّى بعض الطيور على اليرقات والحشرات، فتساعد في مكافحة الآفات التي تضرّ بالنباتات.' },
  { id:'animal', emoji:'🦎', name:'حيوان آخر', x:0.72, y:0.60, r:0.08,
    info:'يعيش هذا الحيوان في نفس الموطن الطبيعي، وله علاقة غذائية بالنباتات أو الحيوانات الأخرى حوله.' },
  { id:'water',  emoji:'💧', name:'الماء', x:0.86, y:0.80, r:0.07,
    info:'الماء جزء أساسي من الموطن الطبيعي؛ تحتاج إليه جميع الكائنات الحية والنباتات للنمو والبقاء على قيد الحياة.' },
  { id:'soil',   emoji:'🌍', name:'التربة', x:0.10, y:0.85, r:0.075,
    info:'التربة هي أساس الموطن الطبيعي؛ منها تمتصّ النباتات الماء والمغذّيات اللازمة للنمو.' },
];

function _g6e1aPanel(){
  const S = simState;
  var html = '<div class="ctrl-section"><div class="ctrl-label">🔎 استكشف الموطن الطبيعي المحلي</div>' +
    '<div style="font-size:13px;color:var(--text-secondary);line-height:1.9">اضغط على أي عنصر في الصورة لتتعرّف على دوره في الموطن الطبيعي.</div></div>';
  if(S.sel){
    var o = G6E_HABITAT.find(x=>x.id===S.sel);
    html += '<div class="info-box">' + o.emoji + ' <b>' + o.name + '</b><br><br>' + o.info + '</div>';
  } else {
    html += '<div class="info-box">👆 لم تختر عنصراً بعد.</div>';
  }
  controls(html);
}
function simG6Eco1a(){
  cancelAnimationFrame(animFrame);
  simState = { t:0, sel:null };
  const S = simState;
  _g6e1aPanel();
  const cv = document.getElementById('simCanvas');
  cv.onclick = function(e){
    const p = g6eGp(cv, e), w=cv.width, h=cv.height;
    for(const o of G6E_HABITAT){
      if(Math.hypot(p.x-o.x*w, p.y-o.y*h) < o.r*w*1.3){ S.sel=o.id; g6eSnd(true); _g6e1aPanel(); return; }
    }
  };
  function draw(){
    if(currentSim!=='g6eco1'||currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const dark=g6eIsDark(); const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0, dark?'#12241A':'#DCEFDA'); bg.addColorStop(1, dark?'#0E1810':'#EFF7E8');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    // أرضية
    c.fillStyle = dark?'#3A2E1E':'#C9A671'; c.fillRect(0, h*0.86, w, h*0.14);
    c.fillStyle=g6eTxt(dark); c.font=`bold ${Math.max(12,w*0.024)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
    c.fillText('اضغط على كل عنصر في الموطن الطبيعي', w/2, h*0.02);

    G6E_HABITAT.forEach(o=>{
      const x=o.x*w, y=o.y*h, r=o.r*w;
      const isSel = S.sel===o.id;
      const pulse = isSel ? 1+Math.sin(S.t*0.1)*0.08 : 1;
      c.fillStyle = isSel ? 'rgba(212,144,26,0.22)' : 'rgba(255,255,255,0.35)';
      c.beginPath(); c.arc(x,y,r*1.25*pulse,0,Math.PI*2); c.fill();
      if(isSel){ c.strokeStyle='#D4901A'; c.lineWidth=2.5; c.beginPath(); c.arc(x,y,r*1.25*pulse,0,Math.PI*2); c.stroke(); }
      c.font=`${r*1.5}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(o.emoji, x, y);
      c.font=`bold ${Math.max(10,w*0.017)}px Tajawal`; c.fillStyle=g6eTxt(dark);
      c.fillText(o.name, x, y+r*1.55);
    });
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// تبويب ب: منتج أم مستهلك؟ (سحب وإفلات)
var G6E_SORT_ITEMS = [
  { id:'plant',  emoji:'🌱', name:'النبات', type:'producer' },
  { id:'insect', emoji:'🐛', name:'الحشرة', type:'consumer' },
  { id:'bird',   emoji:'🐦', name:'الطائر', type:'consumer' },
];
function _g6e1bPanel(){
  const S=simState;
  const n = Object.keys(S.placed).length;
  var html = '<div class="ctrl-section"><div class="ctrl-label">🌱 منتج أم مستهلك؟</div>' +
    '<div style="font-size:13px;color:var(--text-secondary);line-height:1.9">اسحب كل كائن إلى المنطقة الصحيحة: هل يصنع غذاءه بنفسه (منتِج)، أم يحصل عليه من كائن آخر (مستهلِك)؟</div></div>' +
    '<div style="font-size:13px;font-weight:700;color:#27AE60;margin-top:8px">التقدّم: '+n+' / '+G6E_SORT_ITEMS.length+'</div>';
  if(S.msg) html += '<div class="info-box" style="margin-top:10px">'+S.msg+'</div>';
  if(n===G6E_SORT_ITEMS.length){
    html += '<div class="info-box" style="margin-top:10px">✅ أحسنت! النبات كائن منتِج لأنه يصنع غذاءه بنفسه، أمّا الحشرة والطائر فكائنات مستهلِكة تحصل على غذائها من كائنات أخرى.</div>';
  }
  controls(html);
}
function simG6Eco1b(){
  cancelAnimationFrame(animFrame);
  simState = { t:0, placed:{}, dragId:null, dragX:0, dragY:0, msg:'', tray:[] };
  const S=simState;
  const trayX=[0.20,0.50,0.80];
  G6E_SORT_ITEMS.forEach((o,i)=> S.tray.push({...o, x:trayX[i], y:0.82}));
  _g6e1bPanel();
  const cv=document.getElementById('simCanvas');
  const ZONES = { producer:{x:0.28,y:0.30}, consumer:{x:0.72,y:0.30} };

  function hit(p,w,h){
    for(const o of S.tray){ if(o.placed) continue;
      if(Math.hypot(p.x-o.x*w,p.y-o.y*h) < w*0.075) return o; }
    return null;
  }
  function onDown(e){ const p=g6eGp(cv,e); const o=hit(p,cv.width,cv.height); if(o){ S.dragId=o.id; S.dragX=p.x; S.dragY=p.y; } }
  function onMove(e){ if(!S.dragId) return; e.preventDefault&&e.preventDefault(); const p=g6eGp(cv,e); S.dragX=p.x; S.dragY=p.y; }
  function onUp(){
    if(!S.dragId) return;
    const o = S.tray.find(x=>x.id===S.dragId);
    const w=cv.width,h=cv.height;
    const pz = ZONES.producer, cz = ZONES.consumer;
    const distP = Math.hypot(S.dragX-pz.x*w, S.dragY-pz.y*h);
    const distC = Math.hypot(S.dragX-cz.x*w, S.dragY-cz.y*h);
    const zoneR = w*0.20;
    if(distP < zoneR || distC < zoneR){
      const chosen = distP < distC ? 'producer' : 'consumer';
      if(chosen === o.type){
        o.placed=true; S.placed[o.id]=true; g6eSnd(true);
        S.msg = '✅ أحسنت!';
      } else {
        g6eSnd(false);
        S.msg = '❌ حاول مرة أخرى، وفكّر في الكائن الذي يصنع غذاءه بنفسه والكائن الذي يحصل على غذائه من كائن آخر.';
      }
    }
    S.dragId=null; _g6e1bPanel();
  }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;

  function draw(){
    if(currentSim!=='g6eco1'||currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const dark=g6eIsDark(); const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    c.fillStyle=g6eBg(dark); c.fillRect(0,0,w,h);

    [['producer','🌱 المنتِج','#27AE60'],['consumer','🐾 المستهلِك','#1A8FA8']].forEach(([key,label,col])=>{
      const z=ZONES[key];
      c.fillStyle = col+'18'; c.strokeStyle=col+'80'; c.lineWidth=2; c.setLineDash([6,5]);
      c.beginPath(); c.arc(z.x*w, z.y*h, w*0.19, 0, Math.PI*2); c.fill(); c.stroke(); c.setLineDash([]);
      c.fillStyle=col; c.font=`bold ${Math.max(11,w*0.021)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(label, z.x*w, z.y*h - w*0.15 - 8);
    });

    S.tray.forEach(o=>{
      if(o.placed) return;
      const isDrag = S.dragId===o.id;
      const x = isDrag ? S.dragX : o.x*w, y = isDrag ? S.dragY : o.y*h;
      c.font=`${w*0.06}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(o.emoji, x, y);
      c.font=`bold ${Math.max(10,w*0.016)}px Tajawal`; c.fillStyle=g6eTxt(dark);
      if(!isDrag) c.fillText(o.name, x, y+w*0.05);
    });
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// تبويب ج: ابنِ سلسلة غذائية + تحدي الاختفاء
var G6E_CHAIN_POOL = [
  { id:'plant',  emoji:'🌱', name:'نبات' },
  { id:'insect', emoji:'🐛', name:'حشرة' },
  { id:'frog',   emoji:'🐸', name:'ضفدع' },
  { id:'bird',   emoji:'🦅', name:'طائر مفترس' },
];
function _g6e1cPanel(){
  const S=simState;
  var html = '<div class="ctrl-section"><div class="ctrl-label">🔗 ابنِ سلسلة غذائية</div>' +
    '<div style="font-size:13px;color:var(--text-secondary);line-height:1.9">اضغط على الكائنات بالترتيب الصحيح لتكوين سلسلة غذائية (من المُنتِج إلى المفترس)، بحيث يشير كل سهم إلى الكائن الذي يتغذّى.</div></div>';
  html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0">' +
    G6E_CHAIN_POOL.map(o=>'<button class="ctrl-btn" onclick="window._g6e1cAdd(\''+o.id+'\')" style="flex:1;min-width:70px">'+o.emoji+' '+o.name+'</button>').join('') + '</div>';
  html += '<div style="font-size:13px;font-weight:700;margin-top:6px">سلسلتك: '+ (S.chain.length? S.chain.map(id=>G6E_CHAIN_POOL.find(o=>o.id===id).emoji).join(' ← ') : '—') +'</div>';
  if(S.chain.length){
    html += '<button class="ctrl-btn reset" style="width:100%;margin-top:8px" onclick="window._g6e1cReset()">↺ إعادة</button>';
  }
  if(S.chain.length===4){
    html += '<div class="info-box" style="margin-top:12px">✅ أحسنت! هذه سلسلة غذائية صحيحة: 🌱 نبات ← 🐛 حشرة ← 🐸 ضفدع ← 🦅 طائر مفترس.</div>';
    html += '<div class="ctrl-section" style="margin-top:10px"><div class="ctrl-label">⚠️ التحدّي</div>' +
      '<div style="font-size:13px;color:var(--text-secondary);margin-bottom:8px">اختر كائناً، ثم اضغط: ماذا يحدث إذا اختفى هذا الكائن؟</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      S.chain.map(id=>{ const o=G6E_CHAIN_POOL.find(x=>x.id===id); return '<button class="ctrl-btn'+(S.removedId===id?' active':'')+'" onclick="window._g6e1cRemove(\''+id+'\')">'+o.emoji+' '+o.name+'</button>'; }).join('') +
      '</div></div>';
    if(S.removedId){
      const idx = S.chain.indexOf(S.removedId);
      const affected = G6E_CHAIN_POOL.find(o=>o.id===S.chain[idx+1]);
      const removedName = G6E_CHAIN_POOL.find(o=>o.id===S.removedId).name;
      html += '<div class="info-box" style="margin-top:10px">⚠️ إذا اختفى <b>'+removedName+'</b>، ' +
        (affected ? ('فلن يجد <b>'+affected.name+'</b> ما يتغذّى عليه، وسيتأثر بشدّة، وقد تتأثر باقي حلقات السلسلة بعده تباعاً.')
                  : 'فسيفقد الكائن الذي كان يتغذّى عليه مصدر غذائه.') +
        '<br><br><b>الخلاصة:</b> الكائنات في السلسلة الغذائية تعتمد على بعضها بعضاً.</div>';
    }
  }
  controls(html);
}
window._g6e1cAdd = function(id){
  const S=simState;
  if(S.chain.length>=4 || S.chain.includes(id)) return;
  S.chain.push(id); g6eSnd(true); _g6e1cPanel();
};
window._g6e1cReset = function(){ simState.chain=[]; simState.removedId=null; _g6e1cPanel(); };
window._g6e1cRemove = function(id){ simState.removedId=id; g6eSnd(true); _g6e1cPanel(); };
function simG6Eco1c(){
  cancelAnimationFrame(animFrame);
  simState = { t:0, chain:[], removedId:null };
  const S=simState;
  _g6e1cPanel();
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g6eco1'||currentTab!==2){ cancelAnimationFrame(animFrame); return; }
    const dark=g6eIsDark(); const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    c.fillStyle=g6eBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle=g6eTxt(dark); c.font=`bold ${Math.max(12,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
    c.fillText('السلسلة الغذائية التي بنيتها', w/2, h*0.05);

    if(!S.chain.length){
      c.font=`${Math.max(12,w*0.02)}px Tajawal`; c.fillStyle=g6eMut(dark); c.textBaseline='middle';
      c.fillText('اضغط على الأزرار في اللوحة لبناء السلسلة', w/2, h*0.5);
    } else {
      const n=S.chain.length, gap=w*0.8/Math.max(1,n-1||1), startX=w*0.1;
      S.chain.forEach((id,i)=>{
        const o=G6E_CHAIN_POOL.find(x=>x.id===id);
        const x = n===1? w/2 : startX+i*gap, y=h*0.5;
        const removed = S.removedId===id;
        c.globalAlpha = removed?0.25:1;
        if(i>0){
          const px = n===1? w/2 : startX+(i-1)*gap;
          const brokenBefore = S.removedId && S.chain.indexOf(S.removedId) < i;
          c.strokeStyle = brokenBefore? 'rgba(192,57,43,0.4)' : (dark?'#8FB08A':'#5C7A54');
          c.lineWidth=2.5; if(brokenBefore) c.setLineDash([5,5]);
          c.beginPath(); c.moveTo(px+w*0.05,y); c.lineTo(x-w*0.05,y); c.stroke(); c.setLineDash([]);
          c.beginPath(); c.moveTo(x-w*0.05,y); c.lineTo(x-w*0.08,y-8); c.lineTo(x-w*0.08,y+8); c.closePath();
          c.fillStyle=c.strokeStyle; c.fill();
        }
        c.font=`${w*0.07}px serif`; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(o.emoji, x, y);
        c.font=`bold ${Math.max(10,w*0.016)}px Tajawal`; c.fillStyle=g6eTxt(dark);
        c.fillText(o.name, x, y+w*0.055);
        if(removed){ c.strokeStyle='#C0392B'; c.lineWidth=3; c.beginPath(); c.moveTo(x-w*0.035,y-w*0.035); c.lineTo(x+w*0.035,y+w*0.035); c.moveTo(x+w*0.035,y-w*0.035); c.lineTo(x-w*0.035,y+w*0.035); c.stroke(); }
        c.globalAlpha=1;
      });
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ════════════════════════════════════════════════════════════
// ٢-٢ · السلاسل الغذائية تبدأ بالنباتات
// ════════════════════════════════════════════════════════════
var G6E_SUN_CHAIN = [
  { id:'sun',    emoji:'☀️', name:'الشمس' },
  { id:'plant',  emoji:'🌱', name:'النبات' },
  { id:'insect', emoji:'🐛', name:'حشرة' },
  { id:'bird',   emoji:'🦅', name:'مفترس' },
];
function _g6e2aPanel(){
  const S=simState;
  var html = '<div class="ctrl-section"><div class="ctrl-label">☀️ ابدأ السلسلة من الشمس</div>' +
    '<div style="font-size:13px;color:var(--text-secondary);line-height:1.9">اضغط أولاً على الشمس ☀️، ثم على النبات 🌱، وهكذا بالترتيب — وشاهد الطاقة تنتقل عبر السلسلة.</div></div>';
  html += '<div style="font-size:13px;font-weight:700;margin:8px 0">التقدّم: '+S.step+' / '+G6E_SUN_CHAIN.length+'</div>';
  if(S.step===G6E_SUN_CHAIN.length){
    html += '<div class="info-box">☀️ <b>الشمس هي مصدر الطاقة</b> التي تبدأ بها السلسلة الغذائية، والنباتات تبدأ السلاسل الغذائية لأنها كائنات مُنتِجة تصنع غذاءها بنفسها باستخدام ضوء الشمس والماء وثاني أكسيد الكربون.</div>';
  }
  controls(html);
}
function simG6Eco2a(){
  cancelAnimationFrame(animFrame);
  simState = { t:0, step:0, glow:0 };
  const S=simState;
  _g6e2aPanel();
  const cv=document.getElementById('simCanvas');
  const POS = [ {x:0.15,y:0.20}, {x:0.38,y:0.55}, {x:0.62,y:0.30}, {x:0.86,y:0.55} ];
  cv.onclick = function(e){
    const p=g6eGp(cv,e), w=cv.width, h=cv.height;
    const nextIdx = S.step;
    if(nextIdx>=POS.length) return;
    const pos = POS[nextIdx];
    if(Math.hypot(p.x-pos.x*w, p.y-pos.y*h) < w*0.10){
      S.step++; S.glow=30; g6eSnd(true); _g6e2aPanel();
    }
  };
  function draw(){
    if(currentSim!=='g6eco2'||currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const dark=g6eIsDark(); const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0, dark?'#12241A':'#EAF6E4'); bg.addColorStop(1, dark?'#0E1810':'#F8FCF3');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    if(S.glow>0) S.glow--;

    for(let i=0;i<POS.length-1;i++){
      if(i < S.step-1 || (i===S.step-1 && S.step>=1)){
        if(i+1 <= S.step-1){
          const p1=POS[i], p2=POS[i+1];
          c.strokeStyle = '#F4C542'; c.lineWidth=3;
          c.beginPath(); c.moveTo(p1.x*w+w*0.06, p1.y*h); c.lineTo(p2.x*w-w*0.06, p2.y*h); c.stroke();
        }
      }
    }
    POS.forEach((pos,i)=>{
      const o=G6E_SUN_CHAIN[i];
      const x=pos.x*w, y=pos.y*h;
      const active = i < S.step;
      const isNext = i === S.step;
      if(active){
        c.save(); c.shadowBlur = (i===S.step-1 && S.glow>0) ? 25 : 10; c.shadowColor='#F4C542';
        c.fillStyle='rgba(244,197,66,0.25)'; c.beginPath(); c.arc(x,y,w*0.09,0,Math.PI*2); c.fill(); c.restore();
      } else if(isNext){
        const pulse=1+Math.sin(S.t*0.12)*0.12;
        c.strokeStyle='#D4901A'; c.lineWidth=2.5; c.setLineDash([5,5]);
        c.beginPath(); c.arc(x,y,w*0.085*pulse,0,Math.PI*2); c.stroke(); c.setLineDash([]);
      } else {
        c.globalAlpha=0.35;
      }
      c.font=`${w*0.07}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(o.emoji, x, y);
      c.globalAlpha=1;
      c.font=`bold ${Math.max(10,w*0.017)}px Tajawal`; c.fillStyle=g6eTxt(dark);
      c.fillText(o.name, x, y+w*0.065);
    });
    if(S.step===0){
      c.fillStyle=g6eMut(dark); c.font=`${Math.max(11,w*0.019)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
      c.fillText('ابدأ بالضغط على ☀️ الشمس', w/2, h*0.85);
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function _g6e2bPanel(){
  const S=simState;
  var html = '<div class="ctrl-section"><div class="ctrl-label">🤔 ماذا يحدث إذا لم ينمُ النبات؟</div>' +
    '<div style="font-size:13px;color:var(--text-secondary);line-height:1.9">قبل أن تشاهد المحاكاة، ماذا تتوقّع أن يحدث للسلسلة الغذائية؟</div></div>';
  if(!S.predicted){
    html += '<div style="display:flex;flex-direction:column;gap:8px">' +
      '<button class="ctrl-btn" onclick="window._g6e2bPredict(0)">لن يتأثر أي كائن آخر</button>' +
      '<button class="ctrl-btn" onclick="window._g6e2bPredict(1)">ستتأثر الكائنات التي تعتمد على النبات</button>' +
      '</div>';
  } else {
    html += '<button class="ctrl-btn play" style="width:100%" onclick="window._g6e2bRun()">▶ شاهد المحاكاة</button>';
  }
  if(S.stage>=1) html += '<div class="info-box" style="margin-top:10px">🌱 يقلّ عدد النباتات...</div>';
  if(S.stage>=2) html += '<div class="info-box" style="margin-top:10px">🐛 يقلّ الغذاء المتاح للحشرة</div>';
  if(S.stage>=3) html += '<div class="info-box" style="margin-top:10px">🦅 يتأثر الكائن الذي يعتمد عليها</div>';
  if(S.stage>=3){
    html += '<div class="ctrl-section" style="margin-top:12px"><div class="ctrl-label">📌 الاستنتاج</div>' +
      '<div style="font-size:13px;line-height:1.9;color:var(--text-secondary)">تعتمد الكائنات الأخرى على النباتات بشكل مباشر أو غير مباشر للحصول على الغذاء والطاقة.</div></div>';
  }
  controls(html);
}
window._g6e2bPredict = function(i){ simState.predicted=i+1; g6eSnd(true); _g6e2bPanel(); };
window._g6e2bRun = function(){
  const S=simState; S.stage=0; g6eSnd(true);
  const steps=[1,2,3];
  steps.forEach((s,idx)=> setTimeout(()=>{ S.stage=s; _g6e2bPanel(); }, (idx+1)*900));
};
function simG6Eco2b(){
  cancelAnimationFrame(animFrame);
  simState = { t:0, predicted:0, stage:0 };
  _g6e2bPanel();
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g6eco2'||currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const S=simState; const dark=g6eIsDark(); const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    c.fillStyle=g6eBg(dark); c.fillRect(0,0,w,h);
    const items = [
      {emoji:'🌱', label:'النبات', shrink:S.stage>=1},
      {emoji:'🐛', label:'الحشرة', shrink:S.stage>=2},
      {emoji:'🦅', label:'المفترس', shrink:S.stage>=3},
    ];
    const gap = w*0.8/(items.length-1), startX=w*0.1, y=h*0.45;
    items.forEach((it,i)=>{
      const x=startX+i*gap;
      const scale = it.shrink ? 0.55 : 1;
      c.save(); c.translate(x,y); c.scale(scale,scale);
      c.font=`${w*0.09}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.globalAlpha = it.shrink? 0.55:1;
      c.fillText(it.emoji, 0, 0);
      c.restore();
      c.globalAlpha=1;
      c.font=`bold ${Math.max(10,w*0.016)}px Tajawal`; c.fillStyle=g6eTxt(dark); c.textAlign='center'; c.textBaseline='top';
      c.fillText(it.label, x, y+w*0.06);
      if(it.shrink){
        c.fillStyle='#C0392B'; c.font=`${Math.max(10,w*0.017)}px Tajawal`;
        c.fillText('↓ يقلّ', x, y+w*0.09);
      }
      if(i<items.length-1){
        c.strokeStyle=g6eMut(dark); c.lineWidth=2;
        c.beginPath(); c.moveTo(x+w*0.05,y); c.lineTo(x+gap-w*0.05,y); c.stroke();
      }
    });
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ════════════════════════════════════════════════════════════
// ٢-٣ · الكائنات الحية المستهلِكة في السلاسل الغذائية
// ════════════════════════════════════════════════════════════
var G6E_WEB = [
  { id:'plant',  emoji:'🌱', name:'نبات' },
  { id:'insect', emoji:'🐛', name:'حشرة' },
  { id:'frog',   emoji:'🐸', name:'ضفدع' },
  { id:'bird',   emoji:'🦅', name:'طائر مفترس' },
];
function _g6e3aPanel(){
  const S=simState;
  var html = '<div class="ctrl-section"><div class="ctrl-label">🔗 من يأكل من؟</div>' +
    '<div style="font-size:13px;color:var(--text-secondary);line-height:1.9">اضغط بالترتيب الصحيح لوضع الأسهم بين الكائنات، بحيث يشير كل سهم إلى الكائن الذي يتغذّى (مُفترِس) على الكائن السابق (فريسة).</div></div>';
  html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0">' +
    G6E_WEB.map(o=>'<button class="ctrl-btn'+(S.order.includes(o.id)?' active':'')+'" onclick="window._g6e3aAdd(\''+o.id+'\')">'+o.emoji+' '+o.name+'</button>').join('') + '</div>';
  if(S.order.length===4){
    html += '<div class="info-box">✅ 🌱 → 🐛 → 🐸 → 🦅 — يوضّح السهم انتقال الغذاء والطاقة من كائن إلى آخر.</div>' +
      '<button class="ctrl-btn play" style="width:100%;margin-top:8px" onclick="window._g6e3aScenario(1)">📍 الموقف الأول: اختفت الحشرات</button>';
  }
  if(S.scenario===1 && !S.ans1){
    html += '<div class="q-box"><strong>ماذا تتوقّع أن يحدث للضفادع؟</strong>' +
      '<div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">' +
      '<button class="ctrl-btn" onclick="window._g6e3aAns(1,0)">لن يتأثر الضفدع</button>' +
      '<button class="ctrl-btn" onclick="window._g6e3aAns(1,1)">سيقلّ غذاء الضفدع فيتأثر عدده</button></div></div>';
  }
  if(S.ans1!==undefined){
    html += '<div class="info-box">🐸 عندما تختفي الحشرات، يفقد الضفدع مصدر غذائه الرئيسي، فيقلّ عدد الضفادع في هذا الموطن.</div>' +
      '<button class="ctrl-btn play" style="width:100%;margin-top:8px" onclick="window._g6e3aScenario(2)">📍 الموقف الثاني: زاد عدد الحشرات</button>';
  }
  if(S.scenario===2 && S.ans2===undefined){
    html += '<div class="q-box"><strong>ماذا تتوقّع أن يحدث للكائن الذي يتغذّى عليها (الضفدع)؟</strong>' +
      '<div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">' +
      '<button class="ctrl-btn" onclick="window._g6e3aAns(2,0)">يزيد غذاؤه فقد يزيد عدده</button>' +
      '<button class="ctrl-btn" onclick="window._g6e3aAns(2,1)">لا علاقة بين الأمرين</button></div></div>';
  }
  if(S.ans2!==undefined){
    html += '<div class="info-box">🐸 زيادة عدد الحشرات تعني غذاءً أكثر للضفادع، ما قد يساعد على زيادة أعدادها.</div>' +
      '<button class="ctrl-btn play" style="width:100%;margin-top:8px" onclick="window._g6e3aScenario(3)">📍 الموقف الثالث: اختفى المفترس (الطائر)</button>';
  }
  if(S.scenario===3 && S.ans3===undefined){
    html += '<div class="q-box"><strong>ماذا قد يحدث للكائنات التي كان يتغذّى عليها (الضفادع)؟</strong>' +
      '<div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">' +
      '<button class="ctrl-btn" onclick="window._g6e3aAns(3,0)">قد يزيد عددها لعدم وجود مَن يفترسها</button>' +
      '<button class="ctrl-btn" onclick="window._g6e3aAns(3,1)">تختفي فوراً</button></div></div>';
  }
  if(S.ans3!==undefined){
    html += '<div class="info-box">🦅 عندما يختفي المفترس، تقلّ الفريسة (المتحكِّم في عددها)، فقد يزيد عدد الضفادع لعدم وجود من يفترسها.</div>' +
      '<div class="ctrl-section" style="margin-top:10px"><div class="ctrl-label">📌 الخلاصة</div>' +
      '<div style="font-size:13px;line-height:1.9;color:var(--text-secondary)">تعتمد الكائنات الحية في السلسلة الغذائية على بعضها بعضاً؛ فأي تغيّر في عدد أحدها يؤثّر في باقي الكائنات المرتبطة به.</div></div>';
  }
  controls(html);
}
window._g6e3aAdd = function(id){
  const S=simState;
  const expected = G6E_WEB[S.order.length];
  if(!expected || expected.id!==id){ g6eSnd(false); return; }
  S.order.push(id); g6eSnd(true); _g6e3aPanel();
};
window._g6e3aScenario = function(n){ simState.scenario=n; _g6e3aPanel(); };
window._g6e3aAns = function(scenario, i){
  simState['ans'+scenario] = i; g6eSnd(true); _g6e3aPanel();
};
function simG6Eco3a(){
  cancelAnimationFrame(animFrame);
  simState = { t:0, order:[], scenario:0 };
  const S=simState;
  _g6e3aPanel();
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g6eco3'||currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const dark=g6eIsDark(); const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    c.fillStyle=g6eBg(dark); c.fillRect(0,0,w,h);
    const gap=w*0.8/(G6E_WEB.length-1), startX=w*0.1, y=h*0.5;
    G6E_WEB.forEach((o,i)=>{
      const x=startX+i*gap;
      const active = S.order.includes(o.id);
      const affected = (S.scenario===1 && o.id==='insect') || (S.scenario===2 && o.id==='insect') ||
                        (S.scenario===3 && o.id==='bird');
      c.globalAlpha = affected? 0.3 : 1;
      c.font=`${w*0.07}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(o.emoji, x, y);
      c.globalAlpha=1;
      c.font=`bold ${Math.max(10,w*0.016)}px Tajawal`; c.fillStyle=g6eTxt(dark);
      c.fillText(o.name, x, y+w*0.06);
      if(i>0 && S.order.includes(G6E_WEB[i-1].id) && S.order.includes(o.id)){
        const px=startX+(i-1)*gap;
        c.strokeStyle = dark?'#8FB08A':'#5C7A54'; c.lineWidth=2.5;
        c.beginPath(); c.moveTo(px+w*0.045,y); c.lineTo(x-w*0.045,y); c.stroke();
        c.beginPath(); c.moveTo(x-w*0.045,y); c.lineTo(x-w*0.07,y-7); c.lineTo(x-w*0.07,y+7); c.closePath();
        c.fillStyle=c.strokeStyle; c.fill();
      }
    });
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ════════════════════════════════════════════════════════════
// ٢-٤ · السلاسل الغذائية في المواطن الطبيعية المختلفة
// ════════════════════════════════════════════════════════════
var G6E_HABS = {
  savanna: { label:'🌳 السافانا', color:'#8AA84A',
    items:[
      {id:'tree', emoji:'🌳', name:'شجرة', role:'producer'},
      {id:'zebra', emoji:'🦓', name:'حمار وحشي', role:'consumer'},
      {id:'lion', emoji:'🦁', name:'أسد', role:'predator'},
    ] },
  ocean: { label:'🌊 المحيط', color:'#4A90C4',
    items:[
      {id:'algae', emoji:'🌿', name:'طحالب/عوالق', role:'producer'},
      {id:'fish', emoji:'🐟', name:'سمكة', role:'consumer'},
      {id:'shark', emoji:'🦈', name:'قرش', role:'predator'},
    ] },
};
var G6E_HAB_POOL = [
  {id:'tree', emoji:'🌳', name:'شجرة', hab:'savanna'},
  {id:'zebra', emoji:'🦓', name:'حمار وحشي', hab:'savanna'},
  {id:'lion', emoji:'🦁', name:'أسد', hab:'savanna'},
  {id:'algae', emoji:'🌿', name:'طحالب/عوالق', hab:'ocean'},
  {id:'fish', emoji:'🐟', name:'سمكة', hab:'ocean'},
  {id:'shark', emoji:'🦈', name:'قرش', hab:'ocean'},
];
function _g6e4aPanel(){
  const S=simState;
  const n=Object.keys(S.placed).length;
  var html = '<div class="ctrl-section"><div class="ctrl-label">🌳🌊 موطنان – كائنات مختلفة</div>' +
    '<div style="font-size:13px;color:var(--text-secondary);line-height:1.9">اسحب كل كائن إلى الموطن المناسب له: السافانا أم المحيط.</div></div>' +
    '<div style="font-size:13px;font-weight:700;margin-top:6px">التقدّم: '+n+' / '+G6E_HAB_POOL.length+'</div>';
  if(S.msg) html += '<div class="info-box" style="margin-top:8px">'+S.msg+'</div>';
  if(n===G6E_HAB_POOL.length){
    html += '<div class="info-box" style="margin-top:8px">✅ أحسنت! كل كائن في موطنه الصحيح — انتقل للتبويب التالي لبناء سلسلتين غذائيتين ومناقشة سؤال التفكير.</div>';
  }
  controls(html);
}
function simG6Eco4a(){
  cancelAnimationFrame(animFrame);
  simState = { t:0, placed:{}, dragId:null, dragX:0, dragY:0, msg:'', tray:[] };
  const S=simState;
  const trayPos = [[0.14,0.85],[0.30,0.85],[0.46,0.85],[0.60,0.85],[0.76,0.85],[0.90,0.85]];
  G6E_HAB_POOL.forEach((o,i)=> S.tray.push({...o, x:trayPos[i][0], y:trayPos[i][1]}));
  _g6e4aPanel();
  const cv=document.getElementById('simCanvas');
  const ZONES = { savanna:{x:0.27,y:0.32}, ocean:{x:0.73,y:0.32} };

  function hit(p,w,h){ for(const o of S.tray){ if(o.placed) continue; if(Math.hypot(p.x-o.x*w,p.y-o.y*h)<w*0.07) return o; } return null; }
  function onDown(e){ const p=g6eGp(cv,e); const o=hit(p,cv.width,cv.height); if(o){ S.dragId=o.id; S.dragX=p.x; S.dragY=p.y; } }
  function onMove(e){ if(!S.dragId) return; e.preventDefault&&e.preventDefault(); const p=g6eGp(cv,e); S.dragX=p.x; S.dragY=p.y; }
  function onUp(){
    if(!S.dragId) return;
    const o=S.tray.find(x=>x.id===S.dragId); const w=cv.width,h=cv.height;
    const ds=Math.hypot(S.dragX-ZONES.savanna.x*w, S.dragY-ZONES.savanna.y*h);
    const doo=Math.hypot(S.dragX-ZONES.ocean.x*w, S.dragY-ZONES.ocean.y*h);
    const zoneR=w*0.24;
    if(ds<zoneR || doo<zoneR){
      const chosen = ds<doo ? 'savanna':'ocean';
      if(chosen===o.hab){ o.placed=true; S.placed[o.id]=true; g6eSnd(true); S.msg='✅ أحسنت!'; }
      else { g6eSnd(false); S.msg='❌ حاول مرة أخرى — فكّر في المكان الذي يعيش فيه هذا الكائن.'; }
    }
    S.dragId=null; _g6e4aPanel();
  }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;

  function draw(){
    if(currentSim!=='g6eco4'||currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const dark=g6eIsDark(); const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    c.fillStyle=g6eBg(dark); c.fillRect(0,0,w,h);
    [['savanna','🌳 السافانا','#8AA84A'],['ocean','🌊 المحيط','#4A90C4']].forEach(([key,label,col])=>{
      const z=ZONES[key];
      c.fillStyle=col+'18'; c.strokeStyle=col+'80'; c.lineWidth=2; c.setLineDash([6,5]);
      c.beginPath(); c.arc(z.x*w,z.y*h,w*0.22,0,Math.PI*2); c.fill(); c.stroke(); c.setLineDash([]);
      c.fillStyle=col; c.font=`bold ${Math.max(11,w*0.021)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(label, z.x*w, z.y*h - w*0.18);
    });
    S.tray.forEach(o=>{
      if(o.placed) return;
      const isDrag=S.dragId===o.id;
      const x=isDrag?S.dragX:o.x*w, y=isDrag?S.dragY:o.y*h;
      c.font=`${w*0.05}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(o.emoji, x, y);
      if(!isDrag){ c.font=`bold ${Math.max(9,w*0.013)}px Tajawal`; c.fillStyle=g6eTxt(dark); c.fillText(o.name, x, y+w*0.04); }
    });
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function _g6e4bPanel(){
  const S=simState;
  var html = '<div class="ctrl-section"><div class="ctrl-label">🔗 ابنِ سلسلتين غذائيتين</div>' +
    '<div style="font-size:13px;color:var(--text-secondary);line-height:1.9">اضغط على أزرار السافانا بالترتيب، ثم أزرار المحيط بالترتيب.</div></div>';
  ['savanna','ocean'].forEach(hab=>{
    const H = G6E_HABS[hab];
    html += '<div style="font-weight:800;color:'+H.color+';margin-top:10px">'+H.label+'</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:6px 0">' +
      H.items.map(o=>'<button class="ctrl-btn'+(S[hab].includes(o.id)?' active':'')+'" onclick="window._g6e4bAdd(\''+hab+'\',\''+o.id+'\')">'+o.emoji+' '+o.name+'</button>').join('') + '</div>' +
      '<div style="font-size:13px">'+ (S[hab].length? S[hab].map(id=>H.items.find(o=>o.id===id).emoji).join(' ← '):'—') +'</div>';
  });
  if(S.savanna.length===3 && S.ocean.length===3 && !S.qAnswered){
    html += '<div class="q-box" style="margin-top:12px"><strong>🤔 لماذا تختلف السلاسل الغذائية من موطن طبيعي إلى آخر؟</strong>' +
      '<button class="ctrl-btn action" style="width:100%;margin-top:8px" onclick="window._g6e4bReveal()">أظهر الإجابة 💡</button></div>';
  }
  if(S.qAnswered){
    html += '<div class="info-box" style="margin-top:10px">لأن الكائنات الحية الموجودة تختلف من موطن إلى آخر، لذلك تختلف السلاسل الغذائية.</div>';
  }
  controls(html);
}
window._g6e4bAdd = function(hab, id){
  const S=simState; const H=G6E_HABS[hab];
  const expected = H.items[S[hab].length];
  if(!expected || expected.id!==id){ g6eSnd(false); return; }
  S[hab].push(id); g6eSnd(true); _g6e4bPanel();
};
window._g6e4bReveal = function(){ simState.qAnswered=true; _g6e4bPanel(); };
function simG6Eco4b(){
  cancelAnimationFrame(animFrame);
  simState = { t:0, savanna:[], ocean:[], qAnswered:false };
  const S=simState;
  _g6e4bPanel();
  const cv=document.getElementById('simCanvas');
  function drawChain(c, items, order, cx, cy, w, dir){
    const gap = w*0.24;
    order.forEach((id,i)=>{
      const o=items.find(x=>x.id===id);
      const x=cx+ (i-1)*gap, y=cy;
      c.font=`${w*0.055}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(o.emoji, x, y);
      c.font=`bold ${Math.max(9,w*0.014)}px Tajawal`; c.fillStyle=dir; c.fillText(o.name, x, y+w*0.045);
      if(i>0){
        c.strokeStyle=dir; c.lineWidth=2;
        c.beginPath(); c.moveTo(x-gap+w*0.035,y); c.lineTo(x-w*0.035,y); c.stroke();
        c.beginPath(); c.moveTo(x-w*0.035,y); c.lineTo(x-w*0.055,y-6); c.lineTo(x-w*0.055,y+6); c.closePath(); c.fillStyle=dir; c.fill();
      }
    });
  }
  function draw(){
    if(currentSim!=='g6eco4'||currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const dark=g6eIsDark(); const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    c.fillStyle=g6eBg(dark); c.fillRect(0,0,w,h);
    c.font=`bold ${Math.max(12,w*0.02)}px Tajawal`; c.fillStyle='#8AA84A'; c.textAlign='center'; c.textBaseline='top';
    c.fillText('🌳 سلسلة السافانا', w/2, h*0.08);
    drawChain(c, G6E_HABS.savanna.items, S.savanna, w/2, h*0.28, w, '#8AA84A');
    c.font=`bold ${Math.max(12,w*0.02)}px Tajawal`; c.fillStyle='#4A90C4';
    c.fillText('🌊 سلسلة المحيط', w/2, h*0.55);
    drawChain(c, G6E_HABS.ocean.items, S.ocean, w/2, h*0.75, w, '#4A90C4');
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ════════════════════════════════════════════════════════════
// ٢-٥ · إزالة الغابات
// ════════════════════════════════════════════════════════════
var G6E_FOREST_ACTIONS = [
  { id:'plant',   label:'🌱 زراعة الأشجار', dTree:+2, positive:true },
  { id:'furn',    label:'🪑 قطع الأشجار لصناعة الأثاث', dTree:-2 },
  { id:'fuel',    label:'🔥 قطع الأشجار للوقود', dTree:-2 },
  { id:'farm',    label:'🌾 تحويل الأرض للزراعة', dTree:-2 },
  { id:'house',   label:'🏠 تحويل الأرض للسكن', dTree:-2 },
];
function _g6e5aPanel(){
  const S=simState;
  var html = '<div class="ctrl-section"><div class="ctrl-label">🌳 ماذا سيحدث للغابة؟</div>' +
    '<div style="font-size:13px;color:var(--text-secondary);line-height:1.9">اختر أحد الإجراءات وشاهد أثره على الغابة والمؤشرات البيئية.</div></div>';
  html += '<div style="display:flex;flex-direction:column;gap:8px">' +
    G6E_FOREST_ACTIONS.map(a=>'<button class="ctrl-btn" onclick="window._g6e5aAct(\''+a.id+'\')">'+a.label+'</button>').join('') + '</div>';
  html += '<div class="ctrl-section" style="margin-top:14px"><div class="ctrl-label">📊 المؤشرات البيئية</div>' +
    '<div style="font-size:13px;line-height:2.1">' +
    '🌳 عدد الأشجار: <b>'+S.trees+'</b><br>' +
    '🐾 الكائنات الموجودة: <b>'+S.animals+'</b><br>' +
    '🌱 النباتات: <b>'+S.plants+'</b><br>' +
    '💨 ثاني أكسيد الكربون: <b>'+S.co2+'</b><br>' +
    '🌬️ الأكسجين: <b>'+S.o2+'</b>' +
    '</div></div>';
  if(S.lastMsg) html += '<div class="info-box" style="margin-top:10px">'+S.lastMsg+'</div>';
  if(S.actionsUsed>=3){
    html += '<div class="q-box" style="margin-top:12px"><strong>🤔 كيف يمكن أن تؤثر إزالة الغابات في البيئة؟</strong>' +
      '<button class="ctrl-btn action" style="width:100%;margin-top:8px" onclick="window._g6e5aReveal()">أظهر الخلاصة 💡</button></div>';
  }
  if(S.revealed){
    html += '<div class="info-box" style="margin-top:10px">تحدث إزالة الغابات عندما تُدمَّر الغابات بقطع أشجارها، وتترك إزالة الغابات آثاراً سلبية على البيئة: فقر التربة، اختفاء بعض النباتات والحيوانات، وارتفاع نسبة ثاني أكسيد الكربون المسبِّب للاحتباس الحراري.</div>';
  }
  controls(html);
}
window._g6e5aAct = function(id){
  const S=simState; const a=G6E_FOREST_ACTIONS.find(x=>x.id===id);
  S.trees = Math.max(2, Math.min(14, S.trees + a.dTree));
  if(a.positive){
    S.plants = Math.min(10, S.plants+1); S.animals = Math.min(10, S.animals+1);
    S.co2 = Math.max(1, S.co2-1); S.o2 = Math.min(10, S.o2+1);
    S.lastMsg = '🌱 زراعة الأشجار تزيد عدد الأشجار تدريجياً وتُحسِّن البيئة.';
  } else {
    S.plants = Math.max(1, S.plants-1); S.animals = Math.max(1, S.animals-1);
    S.co2 = Math.min(10, S.co2+1); S.o2 = Math.max(1, S.o2-1);
    S.lastMsg = '🪓 قلَّ عدد الأشجار، وتغيّرت البيئة، وقلّت بعض الكائنات التي تعتمد على الأشجار.';
  }
  S.actionsUsed = (S.actionsUsed||0)+1;
  g6eSnd(a.positive);
  _g6e5aPanel();
};
window._g6e5aReveal = function(){ simState.revealed=true; _g6e5aPanel(); };
function simG6Eco5a(){
  cancelAnimationFrame(animFrame);
  simState = { t:0, trees:8, animals:6, plants:6, co2:4, o2:6, actionsUsed:0, lastMsg:'', revealed:false };
  const S=simState;
  _g6e5aPanel();
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g6eco5'||currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const dark=g6eIsDark(); const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0, dark?'#122019':'#E4F2E0'); bg.addColorStop(1, dark?'#0E1810':'#F6FAF2');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    c.fillStyle= dark?'#3A2E1E':'#C9A671'; c.fillRect(0,h*0.82,w,h*0.18);

    const maxTrees=14, cols=7;
    const treeCount = Math.round(S.trees);
    for(let i=0;i<maxTrees;i++){
      const col=i%cols, row=Math.floor(i/cols);
      const x = w*0.1 + col*(w*0.8/(cols-1));
      const y = h*0.72 - row*h*0.28;
      c.globalAlpha = i<treeCount ? 1 : 0.12;
      c.font=`${w*0.055}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('🌳', x, y);
    }
    c.globalAlpha=1;
    c.fillStyle=g6eTxt(dark); c.font=`bold ${Math.max(11,w*0.02)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
    c.fillText('عدد الأشجار الحالي: '+treeCount, w/2, h*0.03);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ════════════════════════════════════════════════════════════
// ٢-٦ · تلوث الهواء
// ════════════════════════════════════════════════════════════
var G6E_AIR_SITES = [
  { id:'res',  label:'🏠 منطقة سكنية', particles:8,  color:'#8AA8C4' },
  { id:'road', label:'🚗 قرب طريق مزدحم', particles:20, color:'#C49A4A' },
  { id:'fac',  label:'🏭 قرب مصنع', particles:30, color:'#C0392B' },
  { id:'green',label:'🌳 منطقة خضراء', particles:3,  color:'#27AE60' },
];
function _g6e6aPanel(){
  const S=simState;
  var html = '<div class="ctrl-section"><div class="ctrl-label">🔬 محطة مراقبة الهواء</div>' +
    '<div style="font-size:13px;color:var(--text-secondary);line-height:1.9">اسحب شريحة الفازلين إلى كل موقع من المواقع الأربعة، ثم انتظر وافحصها لترى جسيمات الغبار.</div></div>';
  html += '<div style="font-size:13px;font-weight:700;margin-top:6px">المواقع المجهَّزة: '+Object.keys(S.placed).length+' / 4</div>';
  if(Object.keys(S.placed).length===4 && !S.waited){
    html += '<button class="ctrl-btn play" style="width:100%;margin-top:10px" onclick="window._g6e6aWait()">⏳ انتظر ثم افحص الشرائح</button>';
  }
  if(S.waited){
    html += '<div class="info-box" style="margin-top:10px">🔎 افحص كل شريحة بعدسة مكبّرة — سُجِّلت النتائج تلقائياً في الجدول (التبويب التالي).</div>';
  }
  controls(html);
}
window._g6e6aWait = function(){ simState.waited=true; g6eSnd(true); _g6e6aPanel(); };
function simG6Eco6a(){
  cancelAnimationFrame(animFrame);
  simState = { t:0, placed:{}, dragId:null, dragX:0, dragY:0, waited:false, tray:[] };
  const S=simState;
  S.tray.push({ x:0.5, y:0.85 });
  _g6e6aPanel();
  const cv=document.getElementById('simCanvas');
  const ZONES = { res:{x:0.16,y:0.28}, road:{x:0.40,y:0.28}, fac:{x:0.62,y:0.28}, green:{x:0.86,y:0.28} };

  function onDown(e){
    const p=g6eGp(cv,e), w=cv.width, h=cv.height;
    if(S.dragId) return;
    if(Math.hypot(p.x-S.tray[0].x*w, p.y-S.tray[0].y*h) < w*0.06) S.dragId='slide';
  }
  function onMove(e){ if(!S.dragId) return; e.preventDefault&&e.preventDefault(); const p=g6eGp(cv,e); S.tray[0].x=p.x/cv.width; S.tray[0].y=p.y/cv.height; }
  function onUp(){
    if(!S.dragId) return;
    const w=cv.width,h=cv.height;
    for(const key in ZONES){
      const z=ZONES[key];
      if(Math.hypot(S.tray[0].x*w-z.x*w, S.tray[0].y*h-z.y*h) < w*0.09){
        S.placed[key]=true; g6eSnd(true);
      }
    }
    S.tray[0].x=0.5; S.tray[0].y=0.85;
    S.dragId=null; _g6e6aPanel();
  }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;

  function draw(){
    if(currentSim!=='g6eco6'||currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const dark=g6eIsDark(); const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    c.fillStyle=g6eBg(dark); c.fillRect(0,0,w,h);
    G6E_AIR_SITES.forEach(site=>{
      const z=ZONES[site.id];
      const has = S.placed[site.id];
      c.fillStyle = site.color+(has?'30':'12'); c.strokeStyle=site.color+'80'; c.lineWidth=2;
      c.beginPath(); c.roundRect(z.x*w-w*0.09, z.y*h-w*0.09, w*0.18, w*0.18, 10); c.fill(); c.stroke();
      c.font=`${w*0.045}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(site.label.split(' ')[0], z.x*w, z.y*h);
      c.font=`bold ${Math.max(8,w*0.012)}px Tajawal`; c.fillStyle=g6eTxt(dark);
      c.fillText(site.label.substring(site.label.indexOf(' ')+1), z.x*w, z.y*h+w*0.11);
      if(has){
        c.fillStyle='#27AE60'; c.font=`${Math.max(12,w*0.02)}px Tajawal`;
        c.fillText('✅', z.x*w+w*0.06, z.y*h-w*0.07);
        if(S.waited){
          // رسم جسيمات غبار متناسبة مع كمية التلوث
          for(let i=0;i<site.particles*0.4;i++){
            const rx=z.x*w-w*0.07+((i*13)%(w*0.14));
            const ry=z.y*h-w*0.07+((i*19)%(w*0.14));
            c.fillStyle='rgba(60,50,40,0.5)';
            c.beginPath(); c.arc(rx,ry,1.4,0,Math.PI*2); c.fill();
          }
        }
      }
    });
    // شريحة الفازلين القابلة للسحب
    const sx=S.tray[0].x*w, sy=S.tray[0].y*h;
    c.fillStyle='rgba(240,230,200,0.9)'; c.strokeStyle='rgba(150,130,80,0.6)'; c.lineWidth=1.5;
    c.beginPath(); c.roundRect(sx-w*0.05, sy-w*0.03, w*0.10, w*0.06, 4); c.fill(); c.stroke();
    c.fillStyle='#7A6A40'; c.font=`bold ${Math.max(8,w*0.012)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('شريحة فازلين', sx, sy);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function _g6e6bPanel(){
  const S=simState;
  var html = '<div class="ctrl-section"><div class="ctrl-label">📊 الجدول والرسم البياني</div>' +
    '<div style="font-size:13px;color:var(--text-secondary)">هذه نتائج تجربة شرائح الفازلين في المواقع الأربعة.</div></div>';
  html += '<table style="width:100%;border-collapse:collapse;font-size:12.5px;font-family:Tajawal;margin-top:8px">' +
    '<tr style="background:rgba(26,143,168,0.1)"><td style="padding:6px;font-weight:700">الموقع</td><td style="padding:6px;font-weight:700">عدد الجسيمات</td></tr>' +
    G6E_AIR_SITES.map(s=>'<tr style="border-bottom:1px solid rgba(0,0,0,0.06)"><td style="padding:5px">'+s.label+'</td><td style="padding:5px;text-align:center">'+s.particles+'</td></tr>').join('') +
    '</table>';
  if(!S.showChart){
    html += '<button class="ctrl-btn play" style="width:100%;margin-top:10px" onclick="window._g6e6bChart()">📈 حوّل النتائج إلى رسم بياني</button>';
  }
  if(S.qShown===undefined && S.showChart){
    html += '<div class="q-box" style="margin-top:10px"><strong>❓ أي موقع يحتوي على عدد أكبر من جسيمات الغبار؟ ولماذا؟</strong>' +
      '<button class="ctrl-btn action" style="width:100%;margin-top:8px" onclick="window._g6e6bReveal()">أظهر الإجابة 💡</button></div>';
  }
  if(S.qShown){
    html += '<div class="info-box" style="margin-top:8px">🏭 المنطقة القريبة من المصنع سجّلت أكبر عدد من جسيمات الغبار؛ لأن أدخنة العادم الناتجة من حرق الفحم والنفط في المصانع ومحطات الطاقة تُلوِّث الهواء وتترك آثاراً سلبية على البيئة وصحة الإنسان.</div>';
  }
  controls(html);
}
window._g6e6bChart = function(){ simState.showChart=true; g6eSnd(true); _g6e6bPanel(); };
window._g6e6bReveal = function(){ simState.qShown=true; _g6e6bPanel(); };
function simG6Eco6b(){
  cancelAnimationFrame(animFrame);
  simState = { t:0, showChart:false, qShown:undefined };
  _g6e6bPanel();
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g6eco6'||currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const S=simState; const dark=g6eIsDark(); const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    c.fillStyle=g6eBg(dark); c.fillRect(0,0,w,h);
    c.fillStyle=g6eTxt(dark); c.font=`bold ${Math.max(12,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
    c.fillText(S.showChart? 'عدد جسيمات الغبار في كل موقع' : 'اضغط الزر لعرض الرسم البياني', w/2, h*0.04);
    if(!S.showChart) return void (animFrame=requestAnimationFrame(draw));

    const maxP = Math.max(...G6E_AIR_SITES.map(s=>s.particles));
    const baseY = h*0.85, barW = w*0.14, gap=w*0.20, startX=w*0.14;
    G6E_AIR_SITES.forEach((s,i)=>{
      const bh = (s.particles/maxP) * h*0.55;
      const x = startX + i*gap;
      c.fillStyle=s.color;
      c.beginPath(); c.roundRect(x-barW/2, baseY-bh, barW, bh, 4); c.fill();
      c.fillStyle=g6eTxt(dark); c.font=`bold ${Math.max(10,w*0.017)}px Tajawal`; c.textAlign='center'; c.textBaseline='bottom';
      c.fillText(s.particles+'', x, baseY-bh-4);
      c.font=`${Math.max(9,w*0.013)}px Tajawal`; c.textBaseline='top';
      c.fillText(s.label.split(' ')[0], x, baseY+6);
    });
    c.strokeStyle=g6eMut(dark); c.lineWidth=1.5;
    c.beginPath(); c.moveTo(w*0.05, baseY); c.lineTo(w*0.95, baseY); c.stroke();
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ════════════════════════════════════════════════════════════
// ٢-٧ · الأمطار الحمَضية (بدون pH أو حسابات)
// ════════════════════════════════════════════════════════════
function _g6e7Panel(){
  const S=simState;
  var html = '<div class="ctrl-section"><div class="ctrl-label">🌧️ كيف تؤثّر الأمطار الحمَضية في النباتات؟</div>' +
    '<div style="font-size:13px;color:var(--text-secondary);line-height:1.9">النبات الأول يُروى بماء الصنبور العادي، والنبات الثاني يُروى بعصير الليمون (ماء حمضي بسيط). راقب التغيّر خلال ثلاثة أيام.</div></div>';
  if(S.day===0){
    html += '<button class="ctrl-btn play" style="width:100%" onclick="window._g6e7Next()">▶ ابدأ — اليوم الأول</button>';
  } else if(S.day<3){
    html += '<div class="info-box">اليوم '+['','الأول','الثاني','الثالث'][S.day]+': النبات الثاني (عصير الليمون) بدأ يتأثّر — أوراقه تذبل قليلاً.</div>' +
      '<button class="ctrl-btn play" style="width:100%;margin-top:8px" onclick="window._g6e7Next()">▶ التالي — اليوم '+['','الثاني','الثالث'][S.day]+'</button>';
  } else {
    html += '<div class="info-box">✅ اكتملت الأيام الثلاثة — النبات الثاني (عصير الليمون) تأثّر بوضوح: ذبلت أوراقه وتساقط بعضها.</div>';
    html += '<div class="q-box"><strong>🤔 أي نبات تأثّر أكثر؟</strong>' +
      '<div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">' +
      '<button class="ctrl-btn" onclick="window._g6e7Ans(0)">النبات الأول (ماء الصنبور)</button>' +
      '<button class="ctrl-btn" onclick="window._g6e7Ans(1)">النبات الثاني (عصير الليمون)</button></div>' +
      '<div id="g6e7fb" style="margin-top:8px;font-size:13px"></div></div>';
  }
  if(S.answered){
    html += '<div class="info-box" style="margin-top:10px">تُضعِف الأمطار الحمضية النباتات؛ فتفقد التربة جزءاً من عناصرها المغذّية، ويضعف نمو النبات، وتتساقط الأوراق التي تصنع الغذاء. وقد تؤثّر الأمطار الحمضية أيضاً في الكائنات الحية (مثل بيض الضفادع) وفي المباني الحجرية.</div>';
  }
  controls(html);
}
window._g6e7Next = function(){ simState.day++; g6eSnd(true); _g6e7Panel(); };
window._g6e7Ans = function(i){
  const fb=document.getElementById('g6e7fb'); if(!fb) return;
  if(i===1){ fb.innerHTML='✅ صحيح! النبات الذي رُوي بعصير الليمون تأثّر أكثر.'; fb.style.color='#1E8449'; simState.answered=true; g6eSnd(true); setTimeout(_g6e7Panel,300); }
  else { fb.innerHTML='❌ ليس هذا — قارن حالة الأوراق في النبات الثاني.'; fb.style.color='#C0392B'; }
};
function simG6Eco7(){
  cancelAnimationFrame(animFrame);
  simState = { t:0, day:0, answered:false };
  const S=simState;
  _g6e7Panel();
  const cv=document.getElementById('simCanvas');
  function drawPlant(c, x, y, w, wilt){
    const scale = 1 - wilt*0.15;
    c.save(); c.translate(x,y); c.scale(scale,scale);
    // إناء
    c.fillStyle='#B5714A'; c.beginPath(); c.moveTo(-w*0.09,0); c.lineTo(w*0.09,0); c.lineTo(w*0.07,w*0.13); c.lineTo(-w*0.07,w*0.13); c.closePath(); c.fill();
    // ساق
    c.strokeStyle='#4A7A3A'; c.lineWidth=w*0.012;
    c.beginPath(); c.moveTo(0,0); c.lineTo(0,-w*0.16); c.stroke();
    // أوراق (تذبل حسب wilt)
    const leafColor = wilt>0.5 ? '#C4A24A' : '#4CAF50';
    [-1,1].forEach((side,i)=>{
      const droop = wilt * 0.6 * side;
      c.save(); c.translate(0,-w*0.10 - i*w*0.04);
      c.rotate(side*0.5 + droop);
      c.fillStyle=leafColor;
      c.beginPath(); c.ellipse(side*w*0.06, 0, w*0.07, w*0.03, 0, 0, Math.PI*2); c.fill();
      c.restore();
    });
    c.restore();
  }
  function draw(){
    if(currentSim!=='g6eco7'){ cancelAnimationFrame(animFrame); return; }
    const dark=g6eIsDark(); const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    c.fillStyle=g6eBg(dark); c.fillRect(0,0,w,h);
    const wilt2 = Math.min(1, S.day/3);
    drawPlant(c, w*0.32, h*0.62, w, 0);
    drawPlant(c, w*0.68, h*0.62, w, wilt2);
    c.fillStyle=g6eTxt(dark); c.font=`bold ${Math.max(10,w*0.017)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
    c.fillText('💧 ماء الصنبور', w*0.32, h*0.80);
    c.fillText('🍋 عصير الليمون', w*0.68, h*0.80);
    c.font=`bold ${Math.max(11,w*0.019)}px Tajawal`; c.fillStyle=g6eMut(dark);
    c.fillText(S.day===0?'قبل البدء':'اليوم '+['', 'الأول','الثاني','الثالث'][S.day], w/2, h*0.04);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ════════════════════════════════════════════════════════════
// ٢-٨ · إعادة التدوير
// ════════════════════════════════════════════════════════════
var G6E_WASTE_ITEMS = [
  { id:'box',   emoji:'📦', name:'صندوق', bin:'recycle' },
  { id:'can',   emoji:'🥫', name:'علبة', bin:'recycle' },
  { id:'bottle',emoji:'🍾', name:'زجاجة', bin:'recycle' },
  { id:'plastic',emoji:'🧴', name:'عبوة بلاستيكية', bin:'reuse' },
  { id:'plant', emoji:'🍎', name:'بقايا نباتية', bin:'compost' },
];
var G6E_BINS = [
  { id:'recycle', label:'♻️ إعادة تدوير', color:'#27AE60' },
  { id:'reuse',   label:'🔄 إعادة استخدام', color:'#1A8FA8' },
  { id:'compost', label:'🌱 سماد', color:'#8AA84A' },
  { id:'trash',   label:'🗑️ نفايات', color:'#7A8A98' },
];
function _g6e8Panel(){
  const S=simState;
  const n=Object.keys(S.placed).length;
  var html = '<div class="ctrl-section"><div class="ctrl-label">♻️ إلى أين تذهب هذه النفايات؟</div>' +
    '<div style="font-size:13px;color:var(--text-secondary);line-height:1.9">اسحب كل عنصر إلى المكان المناسب له.</div></div>' +
    '<div style="font-size:13px;font-weight:700;margin-top:6px">التقدّم: '+n+' / '+G6E_WASTE_ITEMS.length+'</div>';
  if(S.msg) html += '<div class="info-box" style="margin-top:8px">'+S.msg+'</div>';
  if(n===G6E_WASTE_ITEMS.length){
    html += '<div class="q-box" style="margin-top:10px"><strong>🤔 كيف تساعد إعادة الاستخدام وإعادة التدوير في حماية البيئة؟</strong>' +
      '<button class="ctrl-btn action" style="width:100%;margin-top:8px" onclick="window._g6e8Reveal()">أظهر الإجابة 💡</button></div>';
  }
  if(S.revealed){
    html += '<div class="info-box" style="margin-top:8px">تساعد إعادة الاستخدام وإعادة التدوير في حماية البيئة عن طريق: تقليل كمية النفايات، والاستفادة من المواد مرّة أخرى بدل معالجتها لتصبح منتجاً جديداً، وتقليل استهلاك الموارد الطبيعية.</div>';
  }
  controls(html);
}
window._g6e8Reveal = function(){ simState.revealed=true; _g6e8Panel(); };
function simG6Eco8(){
  cancelAnimationFrame(animFrame);
  simState = { t:0, placed:{}, dragId:null, dragX:0, dragY:0, msg:'', revealed:false, tray:[] };
  const S=simState;
  const trayPos = [[0.14,0.85],[0.34,0.85],[0.50,0.85],[0.66,0.85],[0.86,0.85]];
  G6E_WASTE_ITEMS.forEach((o,i)=> S.tray.push({...o, x:trayPos[i][0], y:trayPos[i][1]}));
  _g6e8Panel();
  const cv=document.getElementById('simCanvas');
  const binX = [0.14,0.40,0.62,0.86];
  function zones(){ return G6E_BINS.map((b,i)=>({...b, x:binX[i], y:0.28})); }

  function hit(p,w,h){ for(const o of S.tray){ if(o.placed) continue; if(Math.hypot(p.x-o.x*w,p.y-o.y*h)<w*0.06) return o; } return null; }
  function onDown(e){ const p=g6eGp(cv,e); const o=hit(p,cv.width,cv.height); if(o){ S.dragId=o.id; S.dragX=p.x; S.dragY=p.y; } }
  function onMove(e){ if(!S.dragId) return; e.preventDefault&&e.preventDefault(); const p=g6eGp(cv,e); S.dragX=p.x; S.dragY=p.y; }
  function onUp(){
    if(!S.dragId) return;
    const o=S.tray.find(x=>x.id===S.dragId); const w=cv.width,h=cv.height;
    let best=null, bd=Infinity;
    zones().forEach(z=>{ const d=Math.hypot(S.dragX-z.x*w, S.dragY-z.y*h); if(d<bd){ bd=d; best=z; } });
    if(best && bd < w*0.13){
      if(best.id===o.bin){ o.placed=true; S.placed[o.id]=true; g6eSnd(true); S.msg='✅ أحسنت!'; }
      else { g6eSnd(false); S.msg='❌ حاول مرة أخرى، وفكّر في نوع المادة وكيف يمكن التعامل معها.'; }
    }
    S.dragId=null; _g6e8Panel();
  }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;

  function draw(){
    if(currentSim!=='g6eco8'){ cancelAnimationFrame(animFrame); return; }
    const dark=g6eIsDark(); const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    c.fillStyle=g6eBg(dark); c.fillRect(0,0,w,h);
    zones().forEach(z=>{
      c.fillStyle=z.color+'18'; c.strokeStyle=z.color+'80'; c.lineWidth=2;
      c.beginPath(); c.roundRect(z.x*w-w*0.10, z.y*h-w*0.08, w*0.20, w*0.16, 10); c.fill(); c.stroke();
      c.font=`${w*0.04}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(z.label.split(' ')[0], z.x*w, z.y*h-w*0.01);
      c.font=`bold ${Math.max(8,w*0.011)}px Tajawal`; c.fillStyle=z.color;
      c.fillText(z.label.substring(z.label.indexOf(' ')+1), z.x*w, z.y*h+w*0.05);
    });
    S.tray.forEach(o=>{
      if(o.placed) return;
      const isDrag=S.dragId===o.id;
      const x=isDrag?S.dragX:o.x*w, y=isDrag?S.dragY:o.y*h;
      c.font=`${w*0.045}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(o.emoji, x, y);
      if(!isDrag){ c.font=`bold ${Math.max(8,w*0.012)}px Tajawal`; c.fillStyle=g6eTxt(dark); c.fillText(o.name, x, y+w*0.038); }
    });
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ════════════════════════════════════════════════════════════
// ٢-٩ · الاعتناء بالبيئة
// ════════════════════════════════════════════════════════════
var G6E_HOME_ITEMS = [
  { id:'tap',   emoji:'🚰', name:'صنبور مفتوح', fixedEmoji:'🚱', q:'كيف تقلّل استهلاك الماء؟', opts:['ترك الصنبور مفتوحاً','إغلاق الصنبور جيداً'], ans:1,
    fb:'🌱 أحسنت! إغلاق الصنبور جيداً ومعالجة تسرّب الماء يساعدان على الحفاظ عليه.' },
  { id:'lamp',  emoji:'💡', name:'مصباح مضاء دون حاجة', fixedEmoji:'🔅', q:'كيف تقلّل استهلاك الطاقة؟', opts:['ترك المصباح مضاءً','إطفاء المصباح عند عدم الحاجة واستخدام مصابيح موفِّرة'], ans:1,
    fb:'🌱 أحسنت! إطفاء الكهرباء غير المستخدمة واستخدام مصابيح موفّرة للطاقة يحافظان على الطاقة.' },
  { id:'car',   emoji:'🚗', name:'سيارة', fixedEmoji:'🚲', q:'ما أفضل وسيلة تنقّل توفّر الطاقة؟', opts:['استخدام السيارة دائماً','المشي أو ركوب الدرّاجة الهوائية'], ans:1,
    fb:'🌱 أحسنت! المشي أو ركوب الدرّاجة الهوائية بدلاً من السيارة يقلّل استهلاك الطاقة.' },
  { id:'solar', emoji:'☀️', name:'إضاءة الحديقة', fixedEmoji:'☀️✅', q:'كيف تُضيء حديقة منزلك بطريقة صديقة للبيئة؟', opts:['مصابيح عادية بلا داعٍ','مصابيح تعمل بالطاقة الشمسية'], ans:1,
    fb:'🌱 أحسنت! تُستخدَم مصابيح الطاقة الشمسية لإنارة الحدائق المنزلية لأنها أقلّ كلفة وصديقة للبيئة.' },
  { id:'trash', emoji:'🗑️', name:'نفايات متناثرة', fixedEmoji:'✅', q:'ماذا تفعل بالنفايات لحماية البيئة والحيوانات؟', opts:['تركها متناثرة','وضعها في مكانها الصحيح وتقليلها'], ans:1,
    fb:'🌱 أحسنت! القمامة المتناثرة تُلوِّث بيئتنا وتؤذي الحيوانات التي قد تحسبها طعاماً.' },
];
function _g6e9Panel(){
  const S=simState;
  const n=Object.keys(S.fixed).length;
  var html = '<div class="ctrl-section"><div class="ctrl-label">🏡 اجعل منزلك أكثر حفاظاً على البيئة</div>' +
    '<div style="font-size:13px;color:var(--text-secondary);line-height:1.9">اضغط على كل عنصر في المنزل، واختر التصرّف الأفضل للحفاظ على البيئة.</div></div>';
  html += '<div style="font-size:13px;font-weight:700;margin-top:6px">التحسينات: '+n+' / '+G6E_HOME_ITEMS.length+'</div>';
  if(S.active!==null){
    const it = G6E_HOME_ITEMS[S.active];
    if(!S.fixed[it.id]){
      html += '<div class="q-box" style="margin-top:10px"><strong>'+it.q+'</strong>' +
        '<div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">' +
        it.opts.map((o,i)=>'<button class="ctrl-btn" onclick="window._g6e9Ans('+S.active+','+i+')">'+o+'</button>').join('') +
        '</div><div id="g6e9fb" style="margin-top:8px;font-size:13px"></div></div>';
    }
  }
  if(n===G6E_HOME_ITEMS.length){
    html += '<div class="info-box" style="margin-top:10px">🌍 رائع! اختياراتك تساعد في الاعتناء بالبيئة.</div>';
  }
  controls(html);
}
window._g6e9Select = function(i){ simState.active=i; g6eSnd(true); _g6e9Panel(); };
window._g6e9Ans = function(i, choice){
  const S=simState; const it=G6E_HOME_ITEMS[i];
  const fb=document.getElementById('g6e9fb'); if(!fb) return;
  if(choice===it.ans){
    fb.innerHTML='✅ '+it.fb; fb.style.color='#1E8449';
    S.fixed[it.id]=true; g6eSnd(true);
    setTimeout(_g6e9Panel, 500);
  } else {
    fb.innerHTML='❌ فكّر أكثر في التصرّف الأنسب للبيئة.'; fb.style.color='#C0392B';
  }
};
function simG6Eco9(){
  cancelAnimationFrame(animFrame);
  simState = { t:0, active:null, fixed:{} };
  const S=simState;
  _g6e9Panel();
  const cv=document.getElementById('simCanvas');
  const POS = [
    {x:0.18,y:0.30},{x:0.50,y:0.20},{x:0.80,y:0.32},{x:0.20,y:0.68},{x:0.72,y:0.70}
  ];
  cv.onclick = function(e){
    const p=g6eGp(cv,e), w=cv.width, h=cv.height;
    G6E_HOME_ITEMS.forEach((it,i)=>{
      const pos=POS[i];
      if(Math.hypot(p.x-pos.x*w, p.y-pos.y*h) < w*0.08){ window._g6e9Select(i); }
    });
  };
  function draw(){
    if(currentSim!=='g6eco9'){ cancelAnimationFrame(animFrame); return; }
    const dark=g6eIsDark(); const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0, dark?'#122019':'#EAF4EE'); bg.addColorStop(1, dark?'#0E1810':'#F8FBF6');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    c.fillStyle=g6eTxt(dark); c.font=`bold ${Math.max(12,w*0.02)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
    c.fillText('اضغط على كل عنصر لتحسين البيئة المنزلية', w/2, h*0.03);

    G6E_HOME_ITEMS.forEach((it,i)=>{
      const pos=POS[i]; const x=pos.x*w, y=pos.y*h;
      const fixed = S.fixed[it.id];
      const isActive = S.active===i;
      if(isActive && !fixed){
        c.strokeStyle='#D4901A'; c.lineWidth=2.5; c.setLineDash([5,5]);
        c.beginPath(); c.arc(x,y,w*0.09,0,Math.PI*2); c.stroke(); c.setLineDash([]);
      }
      if(fixed){
        c.fillStyle='rgba(39,174,96,0.15)';
        c.beginPath(); c.arc(x,y,w*0.09,0,Math.PI*2); c.fill();
      }
      c.font=`${w*0.06}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(fixed? it.fixedEmoji : it.emoji, x, y);
      c.font=`bold ${Math.max(9,w*0.014)}px Tajawal`; c.fillStyle=g6eTxt(dark);
      c.fillText(it.name, x, y+w*0.065);
      if(fixed){ c.fillStyle='#27AE60'; c.font=`${Math.max(11,w*0.018)}px Tajawal`; c.fillText('✅', x+w*0.06, y-w*0.06); }
    });
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}
