// ══════════════════════════════════════════════════════════
// الصف السابع — الوحدة الرابعة: الخلايا والكائنات الحية
// ٤-١ خصائص الكائنات الحية · ٤-٢ الكائنات الدقيقة · ٤-٣ التحلل
// ٤-٤ الكائنات الدقيقة والغذاء · ٤-٦ الخلايا النباتية · ٤-٧ الخلايا الحيوانية
// ══════════════════════════════════════════════════════════

function g7cBg(dark){ return dark ? '#0B1A10' : '#F0FAF3'; }
function g7cTxt(dark){ return dark ? '#C8EDD4' : '#1A3A25'; }
function g7cMut(dark){ return dark ? '#6BA87A' : '#4A7A5A'; }
function g7cAccent(dark){ return dark ? '#4ADE80' : '#16A34A'; }
function g7cCard(dark){ return dark ? 'rgba(74,222,128,0.10)' : 'rgba(22,163,74,0.08)'; }
function g7cClamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function g7cRand(a,b){ return a+Math.random()*(b-a); }
function g7cLerp(a,b,t){ return a+(b-a)*t; }
function g7cGp(cv,e){
  const r=cv.getBoundingClientRect(), sc=cv.width/r.width;
  const s=(e.touches&&e.touches[0])||(e.changedTouches&&e.changedTouches[0])||e;
  return { x:(s.clientX-r.left)*sc, y:(s.clientY-r.top)*sc };
}
function g7cTitle(c,w,h,dark,text){
  c.fillStyle=g7cTxt(dark); c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
  c.fillText(text, w/2, h*0.062);
}
function g7cRRect(c,x,y,w,h,r){ c.beginPath(); if(c.roundRect) c.roundRect(x,y,w,h,r); else c.rect(x,y,w,h); }
function g7cMCQ(id, opts){
  return `<div style="display:flex;flex-direction:column;gap:8px">
    ${opts.map((o,i)=>`<button id="${id}${i}" onclick="window._${id}Ans(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:13.5px;text-align:right">${o}</button>`).join('')}
  </div><div id="${id}Fb" style="margin-top:10px;font-size:13.5px;line-height:1.8;color:var(--text-secondary)"></div>`;
}
function g7cAnswerMCQ(id, i, correctIdx, msg){
  const btn=document.getElementById(id+i);
  const ok = i===correctIdx;
  if(btn){ btn.style.background= ok?'#27AE60':'#E74C3C'; btn.style.color='white'; btn.style.borderColor= ok?'#27AE60':'#E74C3C'; }
  if(!ok){ const okBtn=document.getElementById(id+correctIdx); if(okBtn){ okBtn.style.background='#27AE60'; okBtn.style.color='white'; okBtn.style.borderColor='#27AE60'; } }
  const fb=document.getElementById(id+'Fb');
  if(fb) fb.innerHTML=(ok?'💡 أحسنت! ':'💡 ')+msg;
  return ok;
}
function g7cEmoji(c,emoji,x,y,size){
  c.font=`${size}px sans-serif`; c.textAlign='center'; c.textBaseline='middle';
  c.fillText(emoji,x,y);
  c.textBaseline='alphabetic';
}

/* ══════════════════════════════════════════════════════════
   ٤-١ · خصائص الكائنات الحية — هل هو حي أم غير حي أم ميت؟
   ══════════════════════════════════════════════════════════ */
function simG7Cell1a(){
  cancelAnimationFrame(animFrame);

  const TRAITS = ['تتحرّك','تنمو','تتغذّى','تتكاثر','تستجيب للمؤثّرات','تتنفّس','تطرح الفضلات'];
  const ALL_TRUE = [1,1,1,1,1,1,1];
  const ITEMS1 = [
    { id:'tree',  icon:'🌳', label:'شجرة',           group:'alive',     traits:ALL_TRUE, note:'الشجرة كائن حي: تنمو وتتغذّى وتتكاثر بالبذور.' },
    { id:'cat',   icon:'🐈', label:'قطّة',            group:'alive',     traits:ALL_TRUE, note:'القطّة تمتلك خصائص الحياة السبع جميعها.' },
    { id:'flower',icon:'🌺', label:'زهرة',           group:'alive',     traits:ALL_TRUE, note:'الزهرة جزء من نبات حيّ ينمو ويتكاثر.' },
    { id:'rock',  icon:'🪨', label:'صخرة',           group:'nonliving', traits:[0,0,0,0,0,0,0], note:'الصخرة لم تكن حيّة أبداً، ولا تمتلك أيّ خاصية من خصائص الحياة.' },
    { id:'car',   icon:'🚗', label:'سيّارة',          group:'nonliving', traits:[1,0,0,0,1,0,0], note:'تتحرّك وتستجيب لبعض المؤثّرات، لكنّها لا تنمو ولا تتكاثر ولا تتنفّس.' },
    { id:'phone', icon:'📱', label:'هاتف',           group:'nonliving', traits:[0,0,0,0,1,0,0], note:'يستجيب لمؤثّرات مثل اللمس، لكنّه لا يمتلك بقيّة خصائص الحياة.' },
    { id:'leaf',  icon:'🍂', label:'ورقة شجرة جافّة', group:'dead',      traits:[0,0,0,0,0,0,0], note:'كانت جزءاً من كائن حيّ في الماضي، لكنّها لم تعد حيّة الآن.' },
    { id:'bone',  icon:'🦴', label:'عظمة حيوان',     group:'dead',      traits:[0,0,0,0,0,0,0], note:'بقيت من كائن حيّ توقّف عن أداء وظائف الحياة.' },
    { id:'log',   icon:'🪵', label:'جذع شجرة مقطوع', group:'dead',      traits:[0,0,0,0,0,0,0], note:'جذع كان جزءاً من شجرة حيّة، ولم يعد ينمو أو يتغذّى الآن.' },
  ];
  const ITEMS2 = [
    { id:'egg',      icon:'🥚', label:'بيضة',          group:'alive',     traits:ALL_TRUE, note:'البيضة المخصَّبة تحوي جنيناً حيّاً ينمو ويتنفّس داخلها.' },
    { id:'mushroom', icon:'🍄', label:'فطر',           group:'alive',     traits:ALL_TRUE, note:'الفطر كائن حيّ يتغذّى وينمو ويتكاثر بالأبواغ.' },
    { id:'cactus',   icon:'🌵', label:'صبّار',         group:'alive',     traits:ALL_TRUE, note:'الصبّار نبات حيّ يقوم بجميع وظائف الحياة رغم بيئته الجافّة.' },
    { id:'bike',     icon:'🚲', label:'درّاجة',        group:'nonliving', traits:[1,0,0,0,0,0,0], note:'تتحرّك عند دفعها، لكنّها لا تنمو ولا تتغذّى ولا تتنفّس.' },
    { id:'wood',     icon:'🪵', label:'قطعة خشب',     group:'dead',      traits:[0,0,0,0,0,0,0], note:'كانت جزءاً من شجرة حيّة ولم تعد تؤدّي وظائف الحياة.' },
  ];
  const ZONES = [
    { id:'alive',     label:'🟢 كائن حي الآن',        color:'#22C55E' },
    { id:'dead',      label:'⬛ كان حيّاً وأصبح ميتاً', color:'#4B5563' },
    { id:'nonliving', label:'⚪ شيء غير حي',           color:'#94A3B8' },
  ];

  simState = {
    stage:'sort1', items: ITEMS1.map(it=>({...it, placed:false, wrong:false})),
    dragId:null, dragX:0, dragY:0, hint:'', hintT:0,
    selected:null, examined:{}, qAnswered:false,
  };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function allPlaced(){ return S.items.every(it=>it.placed); }
  function doneCount(){ return S.items.filter(it=>it.placed).length; }

  function renderControls(){
    const stageLabel = S.stage==='sort1' ? 'المرحلة ١: صنّف العناصر' : 'التحدّي النهائي: كن محقّقاً علمياً';
    let html = `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🔬 ${stageLabel}</div></div>`;
    if(!allPlaced()){
      html += `<div style="font-size:13px;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:12px;margin-bottom:10px">اسحب كل عنصر إلى المجموعة الصحيحة أعلى الشاشة.</div>
        ${S.hintT>0 ? `<div style="font-size:13px;color:#D97706;background:#FEF3C7;border-radius:8px;padding:10px;margin-bottom:10px">💡 ${S.hint}</div>` : ''}
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:12px">تصنيف صحيح: ${doneCount()} / ${S.items.length}</div>`;
    } else {
      html += `<div class="info-box" style="margin-bottom:10px">🎉 أحسنت! تمّ التصنيف بنجاح.</div>`;
    }
    if(doneCount()>0){
      html += `<div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:8px">اضغط على أيّ عنصر مُصنَّف في الصورة، ثمّ اضغط «افحص الكائن».</div>`;
      if(S.selected){
        const it = S.items.find(x=>x.id===S.selected);
        html += `<button class="ctrl-btn play" onclick="window._g7c1Examine()">🧪 افحص الكائن: ${it.icon} ${it.label}</button>`;
        if(S.examined[it.id]){
          html += `<div class="ctrl-section" style="margin-top:12px"><div class="ctrl-label" style="font-size:14px">خصائص الحياة السبع</div></div>
            <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px">
              ${TRAITS.map((t,i)=>`<div style="display:flex;align-items:center;gap:8px;font-size:13px">
                <span>${it.traits[i]?'🟩':'🟥'}</span><span>${it.traits[i]?t:'لا '+t}</span>
              </div>`).join('')}
            </div>
            <div class="info-box" style="font-size:13px">${it.group==='alive'?('إذن '+it.label+' كائن حي.'):it.group==='dead'?it.note:('بعض الأشياء غير الحيّة قد تمتلك بعض الصفات المشابهة للكائنات الحية، لكنّها لا تمتلك جميع خصائص الكائن الحي.')}</div>`;
        }
      }
    }
    if(allPlaced()){
      if(S.stage==='sort1'){
        html += `<button class="ctrl-btn" style="margin-top:12px" onclick="window._g7c1Next()">➡️ التحدّي النهائي: كن محقّقاً علمياً</button>`;
      } else {
        html += `<div class="ctrl-section" style="margin-top:12px"><div class="ctrl-label" style="font-size:15px">❓ وجد خالد جذع شجرة مقطوعاً على الأرض. إلى أيّ مجموعة ينتمي؟</div></div>
          ${g7cMCQ('g7c1q',['كائن حي','كائن كان حيّاً وأصبح ميتاً','شيء غير حي','لا يمكن تصنيفه'])}
          <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7c1Restart()">↺ أعد النشاط</button>`;
      }
    }
    return html;
  }

  controls(renderControls());

  window._g7c1Examine = function(){
    _g8pPlayClick(); S.examined[S.selected]=true; controls(renderControls());
  };
  window._g7c1Next = function(){
    _g8pPlayClick();
    S.stage='sort2'; S.items = ITEMS2.map(it=>({...it, placed:false, wrong:false}));
    S.selected=null; S.examined={}; S.hint=''; S.hintT=0;
    controls(renderControls());
  };
  window._g7c1qAns = function(i){
    if(S.qAnswered) return; S.qAnswered=true;
    g7cAnswerMCQ('g7c1q', i, 1, 'جذع الشجرة كان جزءاً من كائن حيّ، لكنّه لم يعد ينمو أو يتغذّى أو يؤدّي وظائف الحياة، لذلك يُعدّ كائناً ميتاً.');
  };
  window._g7c1Restart = function(){
    S.stage='sort1'; S.items = ITEMS1.map(it=>({...it, placed:false, wrong:false}));
    S.dragId=null; S.hint=''; S.hintT=0; S.selected=null; S.examined={}; S.qAnswered=false;
    controls(renderControls());
  };

  function layout(w,h){
    const unplaced = S.items.filter(it=>!it.placed);
    const n = unplaced.length || 1;
    const cols = Math.min(n,5);
    const rows = Math.ceil(n/cols);
    const gx = w*0.9/cols, gy = h*0.12;
    const startX = w*0.05+gx/2, startY = h*0.74;
    unplaced.forEach((it,i)=>{
      const col = i%cols, row = Math.floor(i/cols);
      it.homeX = startX+col*gx; it.homeY = startY+row*gy - (rows>1?row*2:0);
    });
  }
  function zoneRects(w,h){
    const zw = w*0.29, zh = h*0.16, gap=(w-zw*3)/4;
    return ZONES.map((z,i)=>({...z, x:gap+i*(zw+gap), y:h*0.1, w:zw, h:zh}));
  }
  function updateSlots(w,h){
    const zones = zoneRects(w,h);
    zones.forEach(z=>{
      const grp = S.items.filter(i=>i.placed && i.group===z.id);
      grp.forEach((it,i)=>{
        it.slotX = z.x+z.w*0.16+ (i%4)*(z.w*0.22);
        it.slotY = z.y+z.h*0.62 + Math.floor(i/4)*(z.h*0.38);
      });
    });
  }
  function hitItem(p,w,h){
    for(const it of S.items){ if(it.placed) continue;
      if(Math.hypot(p.x-it.homeX,p.y-it.homeY) < w*0.045) return it;
    }
    return null;
  }
  function hitZone(p,w,h){
    for(const z of zoneRects(w,h)){
      if(p.x>=z.x&&p.x<=z.x+z.w&&p.y>=z.y&&p.y<=z.y+z.h) return z;
    }
    return null;
  }
  function hitPlacedItem(p,w,h){
    updateSlots(w,h);
    for(const it of S.items){
      if(!it.placed) continue;
      if(Math.hypot(p.x-it.slotX,p.y-it.slotY) < w*0.035) return it;
    }
    return null;
  }

  function onDown(e){
    const p = g7cGp(cv,e), w=cv.width, h=cv.height;
    const placedHit = hitPlacedItem(p,w,h);
    if(placedHit){ _g8pPlayClick(); S.selected=placedHit.id; controls(renderControls()); return; }
    if(allPlaced()) return;
    const it = hitItem(p,w,h);
    if(it){ S.dragId=it.id; S.dragX=p.x; S.dragY=p.y; }
  }
  function onMove(e){
    if(!S.dragId) return;
    e.preventDefault && e.preventDefault();
    const p = g7cGp(cv,e); S.dragX=p.x; S.dragY=p.y;
  }
  function onUp(){
    if(!S.dragId) return;
    const it = S.items.find(x=>x.id===S.dragId);
    const w=cv.width, h=cv.height;
    const z = hitZone({x:S.dragX,y:S.dragY}, w, h);
    if(z && z.id===it.group){
      it.placed=true; _g8pPlayDrop();
      layout(w,h); updateSlots(w,h);
    } else if(z){
      _g8pPlayClick(); S.hint='ليس هذا المكان الصحيح — فكّر في خصائص الحياة السبع.'; S.hintT=120;
    }
    S.dragId=null; controls(renderControls());
  }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;
  cv.onclick=null;

  function draw(){
    if(currentSim!=='g7cell1' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7cBg(dark); c.fillRect(0,0,w,h);
    if(S.hintT>0) S.hintT--;

    const zones = zoneRects(w,h);
    zones.forEach(z=>{
      c.fillStyle = dark? 'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)';
      g7cRRect(c,z.x,z.y,z.w,z.h,12); c.fill();
      c.strokeStyle=z.color; c.lineWidth=2.5; g7cRRect(c,z.x,z.y,z.w,z.h,12); c.stroke();
      c.fillStyle=g7cTxt(dark); c.font=`bold ${Math.round(h*0.018)}px Tajawal`; c.textAlign='center';
      c.fillText(z.label, z.x+z.w/2, z.y+z.h*0.24);
    });

    // العناصر الموضوعة تبقى ظاهرة داخل مربّعها فور تصنيفها الصحيح
    updateSlots(w,h);
    S.items.forEach(it=>{
      if(!it.placed) return;
      if(S.selected===it.id){
        c.fillStyle=g7cAccent(dark); c.globalAlpha=0.22;
        c.beginPath(); c.arc(it.slotX,it.slotY,w*0.032,0,Math.PI*2); c.fill(); c.globalAlpha=1;
      }
      g7cEmoji(c,it.icon,it.slotX,it.slotY,Math.round(w*0.032));
    });

    // العناصر غير المصنَّفة بعد، في صفّ الانتظار أسفل الشاشة
    if(!allPlaced()) layout(w,h);
    S.items.forEach(it=>{
      if(it.placed) return;
      if(S.dragId===it.id) return;
      g7cEmoji(c,it.icon,it.homeX,it.homeY,Math.round(w*0.038));
      c.fillStyle=g7cMut(dark); c.font=`${Math.round(h*0.013)}px Tajawal`; c.textAlign='center';
      c.fillText(it.label, it.homeX, it.homeY+h*0.035);
    });
    if(S.dragId){
      const it=S.items.find(x=>x.id===S.dragId);
      c.globalAlpha=0.85; g7cEmoji(c,it.icon,S.dragX,S.dragY,Math.round(w*0.045)); c.globalAlpha=1;
    }

    g7cTitle(c,w,h,dark,'٤-١ · خصائص الكائنات الحية');
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   ٤-٢ · الكائنات الدقيقة — استزراع الكائنات الدقيقة من الهواء
   ══════════════════════════════════════════════════════════ */
function simG7Cell2a(){
  cancelAnimationFrame(animFrame);
  const PLACES = [
    { id:'class', label:'الصف الدراسي', mult:1.0 },
    { id:'garden',label:'الحديقة',       mult:1.6 },
    { id:'bin',   label:'قرب سلة المهملات', mult:2.4 },
    { id:'lab',   label:'المختبر',       mult:0.7 },
  ];
  const DURATIONS = [ {v:10,label:'10 ثوانٍ',mult:0.2}, {v:30,label:'30 ثانية',mult:0.5}, {v:60,label:'دقيقة واحدة',mult:0.8}, {v:300,label:'5 دقائق',mult:1.6} ];
  const DAYS = [0,1,2,3,5];

  simState = {
    stage:'choosePlace', place:null, dur:null, lidOpen:false, exposing:false, exposeT:0,
    sealed:false, dayIdx:0, colonies:[], selColony:null, compareMode:false, qAnswered:false,
  };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function colonyCount(dayIdx, durMult, placeMult){
    const day = DAYS[dayIdx];
    if(day===0) return 0;
    const base = Math.round(2 + day*day*0.9);
    return Math.max(0, Math.round(base*durMult*placeMult));
  }

  function genColonies(){
    const durMult = S.dur.mult, placeMult = S.place.mult;
    const n = colonyCount(S.dayIdx, durMult, placeMult);
    const list = [];
    for(let i=0;i<n;i++){
      list.push({
        x:g7cRand(0.18,0.82), y:g7cRand(0.2,0.85),
        r:g7cRand(0.012,0.03),
        type: Math.random()<0.75?'bacteria':'fungus',
        color: Math.random()<0.5? '#F2B705':'#EF6C5A',
      });
    }
    S.colonies = list;
  }

  function renderControls(){
    if(S.stage==='choosePlace'){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🦠 استزراع الكائنات الدقيقة من الهواء</div></div>
        <div style="font-size:13.5px;color:var(--text-secondary);margin-bottom:10px">من أيّ مكان تريد جمع الكائنات الدقيقة؟</div>
        <div class="ctrl-btns-grid-1">
          ${PLACES.map((p,i)=>`<button onclick="window._g7c2Place(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:13.5px">${p.label}</button>`).join('')}
        </div>`;
    }
    if(S.stage==='expose'){
      let html = `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🥣 تعريض طبق بتري للهواء</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:8px">الموقع: <b>${S.place.label}</b></div>`;
      if(!S.lidOpen){
        html += `<button class="ctrl-btn" onclick="window._g7c2Lid()">🫙 ارفع الغطاء</button>`;
      } else {
        html += `<div class="ctrl-row"><div class="ctrl-name">مدّة التعرّض</div></div>
          <div class="ctrl-btns-grid" style="margin-bottom:10px">
            ${DURATIONS.map((d,i)=>`<button class="ctrl-btn ${S.dur===d?'active':''}" onclick="window._g7c2Dur(${i})">${d.label}</button>`).join('')}
          </div>`;
        if(S.dur){
          html += S.exposing
            ? `<div class="info-box">⏳ يتعرّض الطبق للهواء...</div>`
            : `<button class="ctrl-btn play" onclick="window._g7c2Start()">▶️ ابدأ</button>`;
        }
        if(S.exposeT>=1 && !S.exposing){
          html += `<button class="ctrl-btn" style="margin-top:10px" onclick="window._g7c2Close()">🫙 أغلق الطبق</button>`;
        }
      }
      return html;
    }
    // sealed
    let html = `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">📅 اليوم ${DAYS[S.dayIdx]}</div></div>
      <div class="info-box" style="margin-bottom:10px">تمّ حفظ العيّنة بأمان.</div>
      <input type="range" min="0" max="4" step="1" value="${S.dayIdx}" oninput="window._g7c2Seek(this.value)" style="width:100%;margin-bottom:6px">
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-secondary);margin-bottom:10px">${DAYS.map(d=>`<span>${d}</span>`).join('')}</div>
      <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:10px">عدد المستعمرات: ${S.colonies.length}</div>`;
    if(S.selColony){
      html += `<div class="info-box" style="margin-bottom:10px">${S.selColony.type==='bacteria'?'🦠 <b>بكتيريا</b>: مستعمرات صغيرة، حوافّ ناعمة.':'🍄 <b>فطريات مجهرية</b>: أكبر حجماً، حوافّ زغبية.'}</div>`;
    }
    html += `<button class="ctrl-btn" onclick="window._g7c2Compare()">${S.compareMode?'🔙 رجوع':'🔍 قارن مع طبق آخر'}</button>`;
    if(DAYS[S.dayIdx]>=5){
      html += `<div class="ctrl-section" style="margin-top:12px"><div class="ctrl-label" style="font-size:15px">❓ فتح طالبان طبقي بتري معقّمين: الأول أغلقه مباشرة، والثاني تركه مفتوحاً 5 دقائق. أيّ الطبقين يحتوي على مستعمرات أكثر؟</div></div>
        ${g7cMCQ('g7c2q',['الطبق الأول','الطبق الثاني','سيحتويان على العدد نفسه','لن تنمو مستعمرات في أيّ منهما'])}
        <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7c2Restart()">↺ أعد النشاط</button>`;
    }
    return html;
  }

  controls(renderControls());

  window._g7c2Place = function(i){ _g8pPlayClick(); S.place=PLACES[i]; S.stage='expose'; controls(renderControls()); };
  window._g7c2Lid = function(){ _g8pPlayClick(); S.lidOpen=true; controls(renderControls()); };
  window._g7c2Dur = function(i){ _g8pPlayClick(); S.dur=DURATIONS[i]; controls(renderControls()); };
  window._g7c2Start = function(){
    _g8pPlayClick(); S.exposing=true; controls(renderControls());
    setTimeout(()=>{ S.exposing=false; S.exposeT=1; controls(renderControls()); }, 1400);
  };
  window._g7c2Close = function(){
    _g8pPlayDrop(); S.stage='sealed'; S.sealed=true; S.dayIdx=0; genColonies(); controls(renderControls());
  };
  window._g7c2Seek = function(v){ _g8pPlayClick(); S.dayIdx=+v; S.selColony=null; genColonies(); controls(renderControls()); };
  window._g7c2Compare = function(){ _g8pPlayClick(); S.compareMode=!S.compareMode; controls(renderControls()); };
  window._g7c2qAns = function(i){
    if(S.qAnswered) return; S.qAnswered=true;
    g7cAnswerMCQ('g7c2q', i, 1, 'توجد كائنات دقيقة في الهواء، وكلّما بقي الطبق مفتوحاً مدّة أطول زادت فرصة وصول عدد أكبر منها إلى الأجار ونموّ مستعمرات أكثر.');
  };
  window._g7c2Restart = function(){
    S.stage='choosePlace'; S.place=null; S.dur=null; S.lidOpen=false; S.exposing=false; S.exposeT=0;
    S.sealed=false; S.dayIdx=0; S.colonies=[]; S.selColony=null; S.compareMode=false; S.qAnswered=false;
    controls(renderControls());
  };

  function dishRect(cx,cy,r,w,h,c,dark,colonies,label){
    c.fillStyle= dark?'#3a2b12':'#F3E3B4'; c.beginPath(); c.arc(cx,cy,r,0,Math.PI*2); c.fill();
    c.strokeStyle=g7cMut(dark); c.lineWidth=w*0.006; c.stroke();
    colonies.forEach(col=>{
      c.fillStyle=col.color; c.globalAlpha=0.85;
      c.beginPath(); c.arc(cx-r+col.x*2*r, cy-r+col.y*2*r, col.r*r*2, 0, Math.PI*2); c.fill();
      c.globalAlpha=1;
    });
    c.fillStyle=g7cMut(dark); c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
    c.fillText(label, cx, cy+r+h*0.035);
  }

  function draw(){
    if(currentSim!=='g7cell2' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7cBg(dark); c.fillRect(0,0,w,h);

    if(S.stage==='choosePlace'){
      g7cEmoji(c,'🥣',w/2,h*0.45,Math.round(w*0.09));
      c.fillStyle=g7cMut(dark); c.font=`${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
      c.fillText('طبق بتري معقَّم يحتوي على أجار', w/2, h*0.62);
    } else if(S.stage==='expose'){
      const cx=w*0.5, cy=h*0.48, r=w*0.16;
      dishRect(cx,cy,r,w,h,c,dark,[],'');
      if(S.lidOpen){
        c.strokeStyle=g7cAccent(dark); c.lineWidth=2; c.setLineDash([4,4]);
        c.beginPath(); c.arc(cx,cy,r*1.15,0,Math.PI*2); c.stroke(); c.setLineDash([]);
        if(S.exposing || S.exposeT>=1){
          if(!S._particles) S._particles=Array.from({length:26},()=>({a:g7cRand(0,Math.PI*2),d:g7cRand(0,1),s:g7cRand(0.3,0.8)}));
          S._particles.forEach(p=>{
            p.d = g7cClamp(p.d + 0.01*p.s, 0, 1);
            const px=cx+Math.cos(p.a)*r*1.3*(1-p.d), py=cy+Math.sin(p.a)*r*1.3*(1-p.d);
            c.fillStyle=dark?'#93C5FD':'#3B82F6'; c.globalAlpha=0.6;
            c.beginPath(); c.arc(px,py,w*0.004,0,Math.PI*2); c.fill(); c.globalAlpha=1;
            if(p.d>=1) p.d=0;
          });
        }
      } else {
        c.fillStyle= dark?'#8b8378':'#B0A98F';
        c.beginPath(); c.arc(cx,cy,r*1.02,0,Math.PI*2); c.globalAlpha=0.5; c.fill(); c.globalAlpha=1;
      }
      c.fillStyle=g7cMut(dark); c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
      c.fillText(S.lidOpen? 'الغطاء مرفوع' : 'الغطاء مغلق', cx, cy+r+h*0.04);
    } else {
      const cx1 = S.compareMode? w*0.28 : w*0.5, cy=h*0.46, r = S.compareMode? w*0.14:w*0.17;
      dishRect(cx1,cy,r,w,h,c,dark,S.colonies,`اليوم ${DAYS[S.dayIdx]} — ${S.place.label} (${S.dur.label})`);
      if(S.compareMode){
        const shortDur=DURATIONS[0], longDur=DURATIONS[3];
        const c1 = []; const n1=colonyCount(S.dayIdx, shortDur.mult, S.place.mult);
        for(let i=0;i<n1;i++) c1.push({x:g7cRand(0.2,0.8),y:g7cRand(0.2,0.8),r:g7cRand(0.012,0.028),color:Math.random()<0.5?'#F2B705':'#EF6C5A'});
        const c2 = []; const n2=colonyCount(S.dayIdx, longDur.mult, S.place.mult);
        for(let i=0;i<n2;i++) c2.push({x:g7cRand(0.2,0.8),y:g7cRand(0.2,0.8),r:g7cRand(0.012,0.028),color:Math.random()<0.5?'#F2B705':'#EF6C5A'});
        dishRect(w*0.5,cy,r,w,h,c,dark,c1,`تعرّض 10 ثوانٍ (${n1})`);
        dishRect(w*0.74,cy,r,w,h,c,dark,c2,`تعرّض 5 دقائق (${n2})`);
      }
      // clickable colony
      cv._colonyHit = (p)=>{
        for(const col of S.colonies){
          const cx=cx1-r+col.x*2*r, cy2=cy-r+col.y*2*r;
          if(Math.hypot(p.x-cx,p.y-cy2) < w*0.02){ return col; }
        }
        return null;
      };
    }
    g7cTitle(c,w,h,dark,'٤-٢ · استزراع الكائنات الدقيقة من الهواء');
    animFrame=requestAnimationFrame(draw);
  }
  cv.onclick = function(e){
    if(S.stage!=='sealed' || !cv._colonyHit) return;
    const p = g7cGp(cv,e);
    const col = cv._colonyHit(p);
    if(col){ _g8pPlayClick(); S.selColony=col; controls(renderControls()); }
  };
  cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null; cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null;
  draw();
}

/* ══════════════════════════════════════════════════════════
   ٤-٣ · الكائنات الدقيقة والتحلل — أثر درجة الحرارة
   ══════════════════════════════════════════════════════════ */
function simG7Cell3a(){
  cancelAnimationFrame(animFrame);
  const DAYS=[0,1,2,3,4,5,6];
  simState = {
    stage:'predict', predicted:null, ready:false, running:false, dayIdx:0,
    warmTemp:30, showMicro:false, qAnswered:false,
  };
  const S = simState;
  const cv = document.getElementById('simCanvas');

  function coverage(day, temp){
    if(day===0) return 0;
    const rate = g7cClamp(temp/30, 0.05, 1.6);
    return g7cClamp(1-Math.exp(-0.32*rate*day), 0, 1);
  }

  function renderControls(){
    if(S.stage==='predict'){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🍞 تأثير درجة الحرارة على التحلّل</div></div>
        <div style="font-size:13.5px;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:12px;margin-bottom:10px">قطعتا خبز متماثلتان: الأولى في الثلاجة 4°C، والثانية في مكان دافئ 30°C.</div>
        <div style="font-size:14px;font-weight:700;margin-bottom:10px">❓ أيّ قطعة خبز تتوقّع أن يظهر عليها العفن أوّلاً؟</div>
        <div class="ctrl-btns-grid-1">
          <button onclick="window._g7c3Predict(0)" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:13.5px">خبز الثلاجة 🧊</button>
          <button onclick="window._g7c3Predict(1)" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:13.5px">الخبز في المكان الدافئ ☀️</button>
        </div>`;
    }
    if(!S.running){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🧪 إعداد التجربة</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:10px">أضف بضع قطرات ماء وغطِّ الطبقين، ثمّ ابدأ التجربة.</div>
        <button class="ctrl-btn play" onclick="window._g7c3Start()">▶️ ابدأ التجربة</button>`;
    }
    let html = `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">📅 اليوم ${DAYS[S.dayIdx]}</div></div>
      <input type="range" min="0" max="6" step="1" value="${S.dayIdx}" oninput="window._g7c3Seek(this.value)" style="width:100%;margin-bottom:10px">
      <div class="ctrl-row"><div class="ctrl-name">🌡️ درجة حرارة المكان الدافئ</div></div>
      <input type="range" min="0" max="40" step="10" value="${S.warmTemp}" oninput="window._g7c3Temp(this.value)" style="width:100%;margin-bottom:6px">
      <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:10px">${S.warmTemp}°C</div>
      <button class="ctrl-btn" onclick="window._g7c3Micro()">${S.showMicro?'🔽 إخفاء':'🔬'} شاهد الكائنات الدقيقة</button>`;
    if(S.showMicro){
      html += `<div class="info-box" style="margin-top:10px">🔥 المكان الدافئ: تنمو وتتكاثر الكائنات الدقيقة بسرعة أكبر.<br>🧊 الثلاجة: تنمو وتتكاثر ببطء أكبر.</div>`;
    }
    if(S.dayIdx>=6){
      html += `<div class="ctrl-section" style="margin-top:12px"><div class="ctrl-label" style="font-size:15px">📈 الاستنتاج</div></div>
        <div class="info-box" style="margin-bottom:10px">كلّما كانت درجة الحرارة أعلى ضمن الظروف المناسبة، ازداد معدّل التحلّل. وتُبطئ الثلاجة التحلّل لأنّ نموّ الكائنات الدقيقة يكون أبطأ.</div>
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:15px">❓ نسي طالبان قطعة خبز رطبة لمدّة أسبوع: الأولى في الثلاجة، والثانية في مطبخ دافئ. على أيّ قطعة تتوقّع ظهور كمّية أكبر من العفن؟</div></div>
        ${g7cMCQ('g7c3q',['قطعة الثلاجة','القطعة في المطبخ الدافئ','القطعتان ستظهر عليهما الكمّية نفسها','لن يظهر عفن على أيّ منهما'])}
        <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7c3Restart()">↺ أعد النشاط</button>`;
    }
    return html;
  }
  controls(renderControls());

  window._g7c3Predict = function(i){ _g8pPlayClick(); S.predicted=i; S.stage='setup'; controls(renderControls()); };
  window._g7c3Start = function(){ _g8pPlayClick(); S.running=true; S.dayIdx=0; controls(renderControls()); };
  window._g7c3Seek = function(v){ _g8pPlayClick(); S.dayIdx=+v; controls(renderControls()); };
  window._g7c3Temp = function(v){ _g8pPlayClick(); S.warmTemp=+v; controls(renderControls()); };
  window._g7c3Micro = function(){ _g8pPlayClick(); S.showMicro=!S.showMicro; controls(renderControls()); };
  window._g7c3qAns = function(i){
    if(S.qAnswered) return; S.qAnswered=true;
    g7cAnswerMCQ('g7c3q', i, 1, 'تنمو معظم الكائنات الدقيقة بصورة أسرع في البيئات الدافئة، لذلك يزداد التحلّل ويظهر العفن بسرعة أكبر مقارنةً بالأطعمة المحفوظة في الثلاجة.');
  };
  window._g7c3Restart = function(){
    S.stage='predict'; S.predicted=null; S.running=false; S.dayIdx=0; S.warmTemp=30; S.showMicro=false; S.qAnswered=false;
    controls(renderControls());
  };

  function drawBread(c,cx,cy,r,w,h,dark,cov,label){
    c.fillStyle= dark?'#8a6a3c':'#D9A85C';
    g7cRRect(c,cx-r,cy-r*0.7,r*2,r*1.4,10); c.fill();
    c.strokeStyle=g7cMut(dark); c.lineWidth=2; g7cRRect(c,cx-r,cy-r*0.7,r*2,r*1.4,10); c.stroke();
    if(cov>0){
      const n=Math.round(cov*22);
      for(let i=0;i<n;i++){
        const seed=i*37.13;
        const px=cx-r*0.85+ (Math.sin(seed)*0.5+0.5)*r*1.7;
        const py=cy-r*0.55+ (Math.cos(seed*1.7)*0.5+0.5)*r*1.1;
        c.fillStyle= i%2===0? '#6B8E23':'#DAD25A'; c.globalAlpha=0.85;
        c.beginPath(); c.arc(px,py,r*0.09,0,Math.PI*2); c.fill(); c.globalAlpha=1;
      }
    }
    c.fillStyle=g7cMut(dark); c.font=`${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
    c.fillText(label, cx, cy+r*0.95+h*0.03);
  }

  function draw(){
    if(currentSim!=='g7cell3' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7cBg(dark); c.fillRect(0,0,w,h);

    if(S.stage!=='predict'){
      const covFridge = coverage(S.dayIdx, 4);
      const covWarm = coverage(S.dayIdx, S.warmTemp);
      drawBread(c,w*0.28,h*0.42,w*0.14,w,h,dark,covFridge,'🧊 الثلاجة 4°C');
      drawBread(c,w*0.72,h*0.42,w*0.14,w,h,dark,covWarm,`☀️ مكان دافئ ${S.warmTemp}°C`);

      if(S.showMicro){
        [{cx:w*0.28,rate:4/30},{cx:w*0.72,rate:S.warmTemp/30}].forEach(o=>{
          const n = Math.round(6+o.rate*10);
          for(let i=0;i<n;i++){
            const ang = i*2.4+performance.now()*0.0005*(1+o.rate);
            const rr = w*0.04+ (i%3)*w*0.01;
            const px=o.cx+Math.cos(ang)*rr, py=h*0.66+Math.sin(ang)*rr*0.6;
            c.fillStyle=dark?'#86EFAC':'#16A34A';
            c.beginPath(); c.arc(px,py,w*0.005,0,Math.PI*2); c.fill();
          }
        });
      }

      // simple chart
      const gx=w*0.12, gy=h*0.78, gw=w*0.76, gh=h*0.14;
      c.strokeStyle=g7cMut(dark); c.lineWidth=1.5;
      c.beginPath(); c.moveTo(gx,gy); c.lineTo(gx,gy+gh); c.lineTo(gx+gw,gy+gh); c.stroke();
      c.fillStyle=g7cMut(dark); c.font=`${Math.round(h*0.012)}px Tajawal`; c.textAlign='center';
      c.fillText('الأيام →', gx+gw/2, gy+gh+h*0.025);
      function plot(color, tempFn){
        c.strokeStyle=color; c.lineWidth=2.5; c.beginPath();
        for(let d=0; d<=S.dayIdx; d++){
          const x=gx+(d/6)*gw, y=gy+gh-(coverage(d,tempFn)*gh);
          if(d===0) c.moveTo(x,y); else c.lineTo(x,y);
        }
        c.stroke();
      }
      plot('#3B82F6',4);
      plot('#F97316',S.warmTemp);
    } else {
      g7cEmoji(c,'🍞',w*0.35,h*0.45,Math.round(w*0.08));
      g7cEmoji(c,'🍞',w*0.65,h*0.45,Math.round(w*0.08));
      c.fillStyle=g7cMut(dark); c.font=`${Math.round(h*0.017)}px Tajawal`; c.textAlign='center';
      c.fillText('🧊 الثلاجة 4°C', w*0.35, h*0.6);
      c.fillText('☀️ مكان دافئ 30°C', w*0.65, h*0.6);
    }
    g7cTitle(c,w,h,dark,'٤-٣ · الكائنات الدقيقة والتحلّل');
    animFrame=requestAnimationFrame(draw);
  }
  cv.onclick=null; cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null; cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null;
  draw();
}

/* ══════════════════════════════════════════════════════════
   ٤-٤(أ) · صنع الزبادي
   ══════════════════════════════════════════════════════════ */
function simG7Cell4a(){
  cancelAnimationFrame(animFrame);
  const PLACES=[{id:'cold',label:'بارد ❄️',mult:0.3},{id:'mid',label:'معتدل 🌤️',mult:0.7},{id:'warm',label:'دافئ 🔥',mult:1.2}];
  simState = { added:false, stirred:false, covered:false, place:null, hour:0, showBac:false,
    addAnimT:0, stirAnimT:0, coverAnimT:0 };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const STAGES=[
    'الحليب سائل.','تبدأ البكتيريا بالتكاثر.','يبدأ الحليب بالتماسك تدريجياً.','يتغيّر الحليب بشكل أوضح.','يتكوّن الزبادي.',
  ];

  function renderControls(){
    if(!S.added){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🥛 صنع الزبادي</div></div>
        <div style="font-size:13px;color:var(--text-secondary);margin-bottom:10px">كأس حليب 150 mL — أضف ملعقة زبادي طازج.</div>
        <button class="ctrl-btn play" onclick="window._g7c4aAdd()">🥄 أضف ملعقة الزبادي</button>`;
    }
    if(S.addAnimT>0){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🥄 جارٍ إضافة الزبادي...</div></div>
        <div class="info-box">شاهد الملعقة وهي تُفرغ الزبادي داخل كأس الحليب.</div>`;
    }
    if(!S.stirred){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🥄 حرّك الخليط</div></div>
        <div class="info-box" style="margin-bottom:10px">امزج الزبادي مع الحليب جيّداً حتى يتجانسا.</div>
        <button class="ctrl-btn play" onclick="window._g7c4aStir()">🌀 حرّك الخليط</button>`;
    }
    if(S.stirAnimT>0){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🌀 جارٍ التحريك...</div></div>
        <div class="info-box">تُمزَج البكتيريا الموجودة في الزبادي مع الحليب بالكامل.</div>`;
    }
    if(!S.covered){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🫙 غطِّ الوعاء</div></div>
        <button class="ctrl-btn play" onclick="window._g7c4aCover()">🫙 غطِّ الوعاء</button>`;
    }
    if(S.coverAnimT>0){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🫙 جارٍ التغطية...</div></div>`;
    }
    if(!S.place){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">📍 اختر مكان الحفظ</div></div>
        <div class="ctrl-btns-grid-1">
          ${PLACES.map((p,i)=>`<button onclick="window._g7c4aPlace(${i})" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:13.5px">${p.label}</button>`).join('')}
        </div>`;
    }
    let html = `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">⏱️ الساعة ${S.hour}</div></div>
      <input type="range" min="0" max="4" step="1" value="${S.hour}" oninput="window._g7c4aSeek(this.value)" style="width:100%;margin-bottom:10px">
      <div class="info-box" style="margin-bottom:10px">${STAGES[Math.min(S.hour,4)]}</div>
      <button class="ctrl-btn" onclick="window._g7c4aBac()">${S.showBac?'🔽 إخفاء':'🦠'} شاهد البكتيريا</button>`;
    if(S.showBac){
      html += `<div class="info-box" style="margin-top:10px">🦠 تتغذّى البكتيريا على السكر الموجود في الحليب، ثمّ تنتج <b>حمض اللاكتيك</b>، فيتغيّر الحليب ويتحوّل إلى زبادي.</div>`;
    }
    if(S.hour>=4){
      html += `<div class="ctrl-section" style="margin-top:12px"><div class="ctrl-label" style="font-size:14px">✅ الاستنتاج</div></div>
        <div class="info-box" style="margin-bottom:10px">تتغذّى بكتيريا الزبادي على السكر الموجود في الحليب وتنتج حمض اللاكتيك، ممّا يساعد على تحويل الحليب إلى زبادي. ويكون التحوّل أسرع في الظروف الدافئة المناسبة.</div>
        <button class="ctrl-btn reset" onclick="window._g7c4aRestart()">↺ أعد النشاط</button>`;
    }
    return html;
  }
  controls(renderControls());
  window._g7c4aAdd = function(){
    _g8pPlayClick(); S.added=true; S.addAnimT=55; controls(renderControls());
  };
  window._g7c4aStir = function(){
    _g8pPlayClick(); S.stirred=true; S.stirAnimT=70; controls(renderControls());
  };
  window._g7c4aCover = function(){
    _g8pPlayClick(); S.covered=true; S.coverAnimT=35; controls(renderControls());
  };
  window._g7c4aPlace = function(i){ _g8pPlayClick(); S.place=PLACES[i]; S.hour=0; controls(renderControls()); };
  window._g7c4aSeek = function(v){ _g8pPlayClick(); S.hour=+v; controls(renderControls()); };
  window._g7c4aBac = function(){ _g8pPlayClick(); S.showBac=!S.showBac; controls(renderControls()); };
  window._g7c4aRestart = function(){
    S.added=false; S.stirred=false; S.covered=false; S.place=null; S.hour=0; S.showBac=false;
    S.addAnimT=0; S.stirAnimT=0; S.coverAnimT=0;
    controls(renderControls());
  };

  function draw(){
    if(currentSim!=='g7cell4' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7cBg(dark); c.fillRect(0,0,w,h);

    const cx=w*0.5, cupW=w*0.28, cupH=h*0.32, topY=h*0.3;

    // إنقاص عدّادات الرسوم المتحركة
    let anyAnim=false;
    if(S.addAnimT>0){ S.addAnimT--; anyAnim=true; if(S.addAnimT===0) controls(renderControls()); }
    if(S.stirAnimT>0){ S.stirAnimT--; anyAnim=true; if(S.stirAnimT===0) controls(renderControls()); }
    if(S.coverAnimT>0){ S.coverAnimT--; anyAnim=true; if(S.coverAnimT===0) controls(renderControls()); }

    // الكأس
    c.strokeStyle=g7cMut(dark); c.lineWidth=w*0.006;
    c.beginPath(); c.moveTo(cx-cupW/2,topY); c.lineTo(cx-cupW/2*0.85,topY+cupH); c.lineTo(cx+cupW/2*0.85,topY+cupH); c.lineTo(cx+cupW/2,topY); c.closePath(); c.stroke();

    const mult = S.place? S.place.mult : 0;
    const prog = S.place ? g7cClamp((S.hour/4)*mult/0.7, 0, 1) : 0;
    c.save();
    c.beginPath(); c.moveTo(cx-cupW/2,topY); c.lineTo(cx-cupW/2*0.85,topY+cupH); c.lineTo(cx+cupW/2*0.85,topY+cupH); c.lineTo(cx+cupW/2,topY); c.closePath(); c.clip();
    // الحليب (يظهر فور إضافة الزبادي)
    if(S.added){
      c.fillStyle = dark? 'rgba(255,255,255,0.82)' : 'rgba(250,250,245,0.95)';
      c.fillRect(cx-cupW/2,topY,cupW,cupH);
    }
    // ملعقة زبادي تسقط داخل الكأس (رسوم متحركة)
    if(S.addAnimT>0){
      const t = 1-(S.addAnimT/55);
      const spoonY = g7cLerp(topY-cupH*0.6, topY+cupH*0.25, g7cClamp(t*1.3,0,1));
      c.save(); c.globalAlpha = t<0.9?1:1-((t-0.9)/0.1);
      g7cEmoji(c, '🥄', cx, spoonY, Math.round(w*0.05));
      c.restore();
      if(t>0.55){
        c.fillStyle='#F5F0E6'; c.globalAlpha=g7cClamp((t-0.55)/0.45,0,1);
        c.beginPath(); c.ellipse(cx,topY+cupH*0.3,cupW*0.16,cupH*0.08,0,0,Math.PI*2); c.fill();
        c.globalAlpha=1;
      }
    } else if(S.added && !S.stirred){
      c.fillStyle='#F5F0E6';
      c.beginPath(); c.ellipse(cx,topY+cupH*0.3,cupW*0.16,cupH*0.08,0,0,Math.PI*2); c.fill();
    }
    // تحريك الخليط برسوم دوّامة
    if(S.stirAnimT>0){
      const spins = (70-S.stirAnimT)*0.35;
      const spoonAng = spins;
      const sx = cx+Math.cos(spoonAng)*cupW*0.22, sy=topY+cupH*0.45+Math.sin(spoonAng)*cupH*0.14;
      c.strokeStyle=dark?'rgba(255,255,255,0.5)':'rgba(120,100,70,0.45)'; c.lineWidth=2;
      for(let k=0;k<3;k++){
        const rr = cupW*(0.1+k*0.06);
        c.beginPath(); c.arc(cx,topY+cupH*0.45,rr,spoonAng+k, spoonAng+k+Math.PI*1.2); c.stroke();
      }
      g7cEmoji(c,'🥄', sx, sy, Math.round(w*0.038));
    } else if(S.stirred){
      // مزيج متجانس بعد التحريك
      for(let i=0;i<10;i++){
        const seed=i*13.7;
        const px=cx-cupW*0.35+(Math.sin(seed)*0.5+0.5)*cupW*0.7;
        const py=topY+cupH*0.25+(Math.cos(seed*1.3)*0.5+0.5)*cupH*0.55;
        c.fillStyle=dark?'rgba(255,255,255,0.2)':'rgba(220,210,190,0.5)';
        c.beginPath(); c.arc(px,py,cupW*0.012,0,Math.PI*2); c.fill();
      }
    }
    // تجمّد/تماسك الحليب حسب مرور الوقت بعد اختيار المكان
    if(prog>0.15){
      for(let i=0;i<Math.round(prog*30);i++){
        const seed=i*13.7+3;
        const px=cx-cupW*0.4+(Math.sin(seed)*0.5+0.5)*cupW*0.8;
        const py=topY+cupH*0.2+(Math.cos(seed*1.3)*0.5+0.5)*cupH*0.7;
        c.fillStyle=dark?'rgba(255,255,255,0.3)':'rgba(210,210,200,0.65)';
        c.beginPath(); c.arc(px,py,cupW*0.015,0,Math.PI*2); c.fill();
      }
    }
    c.restore();

    // غطاء الوعاء
    if(S.covered){
      const lidT = S.coverAnimT>0 ? 1-(S.coverAnimT/35) : 1;
      const lidY = g7cLerp(topY-h*0.12, topY-h*0.006, g7cClamp(lidT,0,1));
      c.fillStyle= dark?'rgba(200,200,255,0.18)':'rgba(200,220,255,0.5)';
      c.strokeStyle=g7cAccent(dark); c.lineWidth=w*0.005;
      g7cRRect(c,cx-cupW/2-4,lidY,cupW+8,h*0.014,4); c.fill(); c.stroke();
    }

    if(S.showBac && S.place){
      for(let i=0;i<10;i++){
        const ang=i*0.9+performance.now()*0.001;
        const px=cx+Math.cos(ang)*cupW*0.25, py=topY+cupH*0.55+Math.sin(ang)*cupH*0.22;
        c.fillStyle=dark?'#86EFAC':'#16A34A';
        c.beginPath(); c.arc(px,py,w*0.006,0,Math.PI*2); c.fill();
      }
    }

    c.fillStyle=g7cMut(dark); c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
    c.fillText(S.place? `المكان: ${S.place.label}`: (S.added?'كأس حليب + زبادي':'كأس حليب 150 mL'), cx, topY+cupH+h*0.05);

    g7cTitle(c,w,h,dark,'٤-٤ (أ) · صنع الزبادي');
    animFrame=requestAnimationFrame(draw);
  }
  cv.onclick=null; cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null; cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null;
  draw();
}

/* ══════════════════════════════════════════════════════════
   ٤-٤(ب) · كيف تؤثّر الخميرة على عجينة الخبز؟
   ══════════════════════════════════════════════════════════ */
function simG7Cell4b(){
  cancelAnimationFrame(animFrame);
  const TEMPS=[{id:'cold',label:'بارد ❄️',mult:0.4},{id:'mid',label:'معتدل 🌤️',mult:1},{id:'warm',label:'دافئ 🔥',mult:1.6}];
  simState = { stage:'predict', predicted:null, running:false, t:0, temp:TEMPS[1], showYeast:false, qAnswered:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const TIMES=[0,30,60,120]; // minutes

  function volA(minute){ // with yeast
    const base = {0:20,30:30,60:50,120:80}[minute];
    const scaled = 20 + (base-20)*S.temp.mult;
    return Math.round(g7cClamp(scaled,20,110));
  }
  function volB(minute){ // without yeast
    return {0:20,30:20,60:21,120:22}[minute];
  }

  function renderControls(){
    if(S.stage==='predict'){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🍞 تأثير الخميرة على عجينة الخبز</div></div>
        <div style="font-size:13px;color:var(--text-secondary);background:var(--bg-card2);border-radius:10px;padding:12px;margin-bottom:10px">أسطوانتان مدرَّجتان: A تحتوي على عجينة بخميرة، وB عجينة بدون خميرة. الحجم الابتدائي لكلتيهما 20 mL.</div>
        <div style="font-size:14px;font-weight:700;margin-bottom:10px">❓ أيّ عجينة تتوقّع أن يزداد حجمها أكثر؟</div>
        <div class="ctrl-btns-grid-1">
          <button onclick="window._g7c4bPredict(0)" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:13.5px">A — بخميرة</button>
          <button onclick="window._g7c4bPredict(1)" style="padding:11px;border-radius:9px;border:2px solid #ddd;background:var(--bg-ctrl-btn);color:var(--text-secondary);font-family:Tajawal,sans-serif;font-weight:700;cursor:pointer;font-size:13.5px">B — بدون خميرة</button>
        </div>`;
    }
    if(!S.running){
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🌡️ درجة الحرارة</div></div>
        <div class="ctrl-btns-grid" style="margin-bottom:12px">
          ${TEMPS.map((t,i)=>`<button class="ctrl-btn ${S.temp.id===t.id?'active':''}" onclick="window._g7c4bTemp(${i})">${t.label}</button>`).join('')}
        </div>
        <button class="ctrl-btn play" onclick="window._g7c4bStart()">▶️ ابدأ</button>`;
    }
    let html = `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">⏱️ بعد ${TIMES[S.t]} دقيقة</div></div>
      <input type="range" min="0" max="3" step="1" value="${S.t}" oninput="window._g7c4bSeek(this.value)" style="width:100%;margin-bottom:10px">
      <div class="ctrl-btns-grid" style="margin-bottom:10px">
        ${TEMPS.map((t,i)=>`<button class="ctrl-btn ${S.temp.id===t.id?'active':''}" onclick="window._g7c4bTemp(${i})">${t.label}</button>`).join('')}
      </div>
      <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:10px">A (بخميرة): ${volA(TIMES[S.t])} mL — B (بدون خميرة): ${volB(TIMES[S.t])} mL</div>
      <button class="ctrl-btn" onclick="window._g7c4bYeast()">${S.showYeast?'🔽 إخفاء':'🦠'} شاهد الخميرة</button>`;
    if(S.showYeast){
      html += `<div class="info-box" style="margin-top:10px">🦠 خلايا الخميرة تستهلك السكر، ثمّ تنتج 🫧 <b>غاز ثاني أكسيد الكربون</b>، فتتكوّن فقاعات داخل العجينة ويزداد حجمها.</div>`;
    }
    if(S.t>=3){
      html += `<div class="ctrl-section" style="margin-top:12px"><div class="ctrl-label" style="font-size:14px">📊 المقارنة النهائية</div></div>
        <table style="width:100%;border-collapse:collapse;font-size:12.5px;margin-bottom:10px">
          <tr style="background:var(--bg-card2)"><th style="padding:6px">العجينة</th><th style="padding:6px">الحجم النهائي</th></tr>
          <tr><td style="padding:6px;text-align:center">مع خميرة</td><td style="padding:6px;text-align:center">كبير (${volA(120)} mL)</td></tr>
          <tr><td style="padding:6px;text-align:center">بدون خميرة</td><td style="padding:6px;text-align:center">شبه ثابت (${volB(120)} mL)</td></tr>
        </table>
        <button class="ctrl-btn reset" onclick="window._g7c4bRestart()">↺ أعد النشاط</button>`;
    }
    return html;
  }
  controls(renderControls());
  window._g7c4bPredict = function(i){ _g8pPlayClick(); S.predicted=i; S.stage='setup'; controls(renderControls()); };
  window._g7c4bTemp = function(i){ _g8pPlayClick(); S.temp=TEMPS[i]; controls(renderControls()); };
  window._g7c4bStart = function(){ _g8pPlayClick(); S.running=true; S.t=0; controls(renderControls()); };
  window._g7c4bSeek = function(v){ _g8pPlayClick(); S.t=+v; controls(renderControls()); };
  window._g7c4bYeast = function(){ _g8pPlayClick(); S.showYeast=!S.showYeast; controls(renderControls()); };
  window._g7c4bRestart = function(){
    S.stage='predict'; S.predicted=null; S.running=false; S.t=0; S.temp=TEMPS[1]; S.showYeast=false;
    controls(renderControls());
  };

  function drawCylinder(c,cx,baseY,w,h,dark,vol,label,bubbles){
    const cw=w*0.13, maxH=h*0.42, maxVol=110;
    const fillH = g7cClamp(vol/maxVol,0,1)*maxH;
    c.strokeStyle=g7cMut(dark); c.lineWidth=w*0.005;
    c.beginPath(); c.moveTo(cx-cw/2,baseY-maxH); c.lineTo(cx-cw/2,baseY); c.lineTo(cx+cw/2,baseY); c.lineTo(cx+cw/2,baseY-maxH); c.stroke();
    c.fillStyle= dark?'rgba(217,168,92,0.55)':'rgba(217,168,92,0.75)';
    c.fillRect(cx-cw/2,baseY-fillH,cw,fillH);
    if(bubbles && fillH>4){
      for(let i=0;i<Math.round(fillH/6);i++){
        const seed=i*17.3+performance.now()*0.001;
        const px=cx-cw*0.35+(Math.sin(seed)*0.5+0.5)*cw*0.7;
        const py=baseY-4-((seed*23)%fillH);
        c.fillStyle=dark?'rgba(255,255,255,0.4)':'rgba(255,255,255,0.6)';
        c.beginPath(); c.arc(px,py,cw*0.05,0,Math.PI*2); c.fill();
      }
    }
    // grid marks
    c.strokeStyle=g7cMut(dark); c.lineWidth=1;
    for(let m=0;m<=5;m++){
      const y=baseY-maxH*(m/5);
      c.beginPath(); c.moveTo(cx-cw/2,y); c.lineTo(cx-cw/2-6,y); c.stroke();
    }
    c.fillStyle=g7cTxt(dark); c.font=`bold ${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
    c.fillText(`${vol} mL`, cx, baseY-maxH-h*0.02);
    c.fillStyle=g7cMut(dark); c.font=`${Math.round(h*0.015)}px Tajawal`;
    c.fillText(label, cx, baseY+h*0.035);
  }

  function draw(){
    if(currentSim!=='g7cell4' || currentTab!==1){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7cBg(dark); c.fillRect(0,0,w,h);
    const baseY=h*0.75;
    if(S.stage==='predict'){
      drawCylinder(c,w*0.35,baseY,w,h,dark,20,'A — بخميرة',false);
      drawCylinder(c,w*0.65,baseY,w,h,dark,20,'B — بدون خميرة',false);
    } else {
      drawCylinder(c,w*0.35,baseY,w,h,dark,volA(TIMES[S.t]),'A — بخميرة',S.showYeast && S.t>0);
      drawCylinder(c,w*0.65,baseY,w,h,dark,volB(TIMES[S.t]),'B — بدون خميرة',false);
    }
    g7cTitle(c,w,h,dark,'٤-٤ (ب) · الخميرة وعجينة الخبز');
    animFrame=requestAnimationFrame(draw);
  }
  cv.onclick=null; cv.onmousedown=null; cv.onmousemove=null; cv.onmouseup=null; cv.ontouchstart=null; cv.ontouchmove=null; cv.ontouchend=null;
  draw();
}

/* ══════════════════════════════════════════════════════════
   ٤-٦ · الخلايا النباتية — فحص خلايا البصل بالمجهر
   ══════════════════════════════════════════════════════════ */
function simG7Cell6a(){
  cancelAnimationFrame(animFrame);
  const STEPS=[
    { id:'peel',  label:'اسحب قطعة صغيرة من قشرة البصل', done:false },
    { id:'water', label:'ضع قطرة ماء على الشريحة',        done:false },
    { id:'place', label:'ضع قشرة البصل على الشريحة',      done:false },
    { id:'cover', label:'ضع الغطاء الزجاجي ببطء',          done:false },
  ];
  const PARTS = [
    { id:'wall', label:'جدار الخلية', desc:'يعطي الخلية شكلها ويساعد على دعمها وحمايتها.' },
    { id:'cyto', label:'السيتوبلازم', desc:'مادة هلامية تحدث فيها كثير من التفاعلات الكيميائية للخلية.' },
    { id:'nuc',  label:'النواة',      desc:'تتحكّم في أنشطة الخلية.' },
    { id:'vac',  label:'الفجوة العصارية', desc:'تخزّن الماء والعصارة الخلوية وتحافظ على انتفاخ الخلية.' },
  ];
  simState = { stepIdx:0, stepAnimType:null, stepAnimT:0, coverFast:false, coverMsg:'', zoom:4, focus:0.5, foundParts:{}, selPart:null,
    magnify:false, magRot:0, dragRot:false, challengeDone:false, qAnswered:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const ZOOMS=[4,10,40];

  function allFound(){ return PARTS.every(p=>S.foundParts[p.id]); }

  function renderControls(){
    if(S.stepIdx < STEPS.length){
      if(S.stepAnimT>0){
        return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🧅 إعداد الشريحة</div></div>
          <div class="info-box">⏳ جارٍ التنفيذ: ${STEPS[S.stepIdx].label}...</div>`;
      }
      return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🧅 إعداد الشريحة</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:6px">الخطوة ${S.stepIdx+1} من ${STEPS.length}</div>
        <div style="font-size:13px;color:var(--text-secondary);margin-bottom:10px">${STEPS[S.stepIdx].label}</div>
        <button class="ctrl-btn play" onclick="window._g7c6Step()">✅ نفّذ الخطوة</button>
        ${S.coverMsg? `<div class="info-box" style="margin-top:10px;color:#D97706">${S.coverMsg}</div>`:''}`;
    }
    if(!S.magnify){
      let html = `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🔬 استخدم المجهر</div></div>
        <div class="ctrl-row"><div class="ctrl-name">التكبير</div></div>
        <div class="ctrl-btns-grid" style="margin-bottom:10px">
          ${ZOOMS.map(z=>`<button class="ctrl-btn ${S.zoom===z?'active':''}" onclick="window._g7c6Zoom(${z})">${z}x</button>`).join('')}
        </div>
        <div class="ctrl-row"><div class="ctrl-name">🎛️ عجلة التركيز</div></div>
        <input type="range" min="0" max="1" step="0.02" value="${S.focus}" oninput="window._g7c6Focus(this.value)" style="width:100%;margin-bottom:10px">`;
      if(S.zoom>=40){
        html += `<div class="info-box" style="margin-bottom:10px">🔎 ابحث عن مكوّنات الخلية: اضغط على أجزاء الخلية في الصورة.</div>
          <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:8px">اكتُشف: ${Object.keys(S.foundParts).length} / ${PARTS.length}</div>`;
        if(S.selPart){
          const p = PARTS.find(x=>x.id===S.selPart);
          html += `<div class="info-box" style="margin-bottom:10px"><b>${p.label}:</b> ${p.desc}</div>`;
        }
        if(allFound()){
          html += `<button class="ctrl-btn" onclick="window._g7c6Magnify()">🔬 كبّر أكثر</button>`;
        }
      }
      return html;
    }
    // magnify mode — 3D model
    let html = `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🔬 داخل الخلية</div></div>
      <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:10px">اسحب النموذج لتدويره، واضغط على الأجزاء لعرض وصفها.</div>`;
    if(S.selPart){
      const p = PARTS.find(x=>x.id===S.selPart);
      html += `<div class="info-box" style="margin-bottom:10px"><b>${p.label}:</b> ${p.desc}</div>`;
    }
    if(!S.challengeDone){
      html += `<button class="ctrl-btn" onclick="window._g7c6Challenge()">🕵️ التحدّي النهائي</button>`;
    } else {
      html += `<div class="ctrl-section" style="margin-top:10px"><div class="ctrl-label" style="font-size:15px">🔍 هل هذه خلية نباتية؟</div></div>
        <div class="info-box" style="margin-bottom:10px">✅ جدار خلية واضح<br>✅ فجوة كبيرة<br>✅ شكل منتظم<br><br><b>نعم، إنّها خلية نباتية.</b></div>
        <div class="ctrl-section"><div class="ctrl-label" style="font-size:15px">❓ ما الجزء الذي يساعد الخلية النباتية على الحفاظ على شكلها المنتظم؟</div></div>
        ${g7cMCQ('g7c6q',['السيتوبلازم','النواة','جدار الخلية','الفجوة العصارية'])}
        <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7c6Restart()">↺ أعد النشاط</button>`;
    }
    return html;
  }
  controls(renderControls());

  window._g7c6Step = function(){
    if(S.stepAnimT>0) return;
    _g8pPlayClick();
    S.coverMsg='';
    S.stepAnimType = STEPS[S.stepIdx].id;
    S.stepAnimT = 55;
    controls(renderControls());
  };
  window._g7c6Zoom = function(z){ _g8pPlayClick(); S.zoom=z; controls(renderControls()); };
  window._g7c6Focus = function(v){ S.focus=+v; controls(renderControls()); };
  window._g7c6Magnify = function(){ _g8pPlayClick(); S.magnify=true; S.selPart=null; controls(renderControls()); };
  window._g7c6Challenge = function(){ _g8pPlayClick(); S.challengeDone=true; controls(renderControls()); };
  window._g7c6qAns = function(i){
    if(S.qAnswered) return; S.qAnswered=true;
    g7cAnswerMCQ('g7c6q', i, 2, 'جدار الخلية قوي وصلب، ولذلك يساعد الخلايا النباتية على الحفاظ على شكلها المنتظم ويوفّر لها الدعم والحماية.');
  };
  window._g7c6Restart = function(){
    S.stepIdx=0; S.stepAnimType=null; S.stepAnimT=0; S.zoom=4; S.focus=0.5; S.foundParts={}; S.selPart=null; S.magnify=false; S.magRot=0;
    S.challengeDone=false; S.qAnswered=false; S.coverMsg='';
    controls(renderControls());
  };

  // مخطّط خلية نباتية واحدة واضحة عند تكبير 40x (جدار – سيتوبلازم – فجوة – نواة)
  function onionCellLayout(w,h){
    const cx=w*0.5, cy=h*0.5, cw=Math.min(w*0.5,h*0.62), ch=Math.min(h*0.5,w*0.4);
    return {
      cx,cy,cw,ch,
      wall: {x:cx, y:cy-ch*0.44, r:w*0.032, kind:'point-top'},
      cyto: {x:cx+cw*0.33, y:cy-ch*0.3,  r:w*0.032, kind:'point'},
      vac:  {x:cx-cw*0.05, y:cy+ch*0.03, r:Math.min(cw,ch)*0.26, kind:'shape'},
      nuc:  {x:cx-cw*0.33, y:cy+ch*0.32, r:Math.min(cw,ch)*0.115, kind:'shape'},
    };
  }
  function partHit(p,w,h){
    const L = onionCellLayout(w,h);
    for(const part of PARTS){
      const pos = L[part.id];
      if(Math.hypot(p.x-pos.x,p.y-pos.y) < Math.max(pos.r*1.5, w*0.045)) return part;
    }
    return null;
  }
  // مواضع مكوّنات النموذج المُكبَّر (وضع «كبّر أكثر»)
  function magnifyLayout(w,h){
    const cx=w*0.5, cy=h*0.5, rw=w*0.34, rh=h*0.42;
    const skew = Math.sin(S.magRot)*0.25;
    return {
      cx,cy,rw,rh,skew,
      wall: {x:cx, y:cy-rh*0.42},
      cyto: {x:cx+rw*0.3+skew*10, y:cy-rh*0.28},
      vac:  {x:cx+rw*0.12+skew*10, y:cy+rh*0.05},
      nuc:  {x:cx-rw*0.2+skew*10, y:cy+rh*0.1},
    };
  }
  function magnifyHit(p,w,h){
    const L = magnifyLayout(w,h);
    for(const part of PARTS){
      const pos = L[part.id];
      if(Math.hypot(p.x-pos.x,p.y-pos.y) < w*0.05) return part;
    }
    return null;
  }
  function onDown(e){
    if(!S.magnify) return;
    S.dragRot=true; S._lastX=g7cGp(cv,e).x;
  }
  function onMove(e){
    if(!S.dragRot) return;
    e.preventDefault && e.preventDefault();
    const x=g7cGp(cv,e).x;
    S.magRot += (x-S._lastX)*0.01; S._lastX=x;
  }
  function onUp(){ S.dragRot=false; }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;
  cv.onclick = function(e){
    const p = g7cGp(cv,e), w=cv.width, h=cv.height;
    if(S.stepIdx>=STEPS.length && S.zoom>=40 && !S.magnify){
      const part = partHit(p,w,h);
      if(part){ _g8pPlayClick(); S.foundParts[part.id]=true; S.selPart=part.id; controls(renderControls()); }
    } else if(S.magnify){
      const part = magnifyHit(p,w,h);
      if(part){ _g8pPlayClick(); S.selPart=part.id; controls(renderControls()); }
    }
  };

  function drawOnionCell(c,w,h,dark,zoomLvl,focus,clickable){
    const clarity = 1-Math.abs(focus-0.5)*1.6;
    const cx0=w*0.5, cy0=h*0.5, r0=Math.min(w,h)*0.42;
    c.save();
    c.beginPath(); c.arc(cx0,cy0,r0,0,Math.PI*2); c.clip();
    c.fillStyle= dark?'#123018':'#EAF7EC'; c.fillRect(0,0,w,h);

    if(zoomLvl===4){
      c.fillStyle=g7cMut(dark); c.font=`${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
      c.fillText('نسيج البصل بصورة عامّة', cx0, cy0);
      for(let i=0;i<6;i++){
        c.strokeStyle=g7cMut(dark); c.globalAlpha=0.25; c.lineWidth=2;
        c.beginPath(); c.ellipse(cx0,cy0, r0*0.9-(i*8), r0*0.5-(i*4), 0,0,Math.PI*2); c.stroke();
      }
      c.globalAlpha=1;
    } else if(zoomLvl===10){
      const rows=4, cols=3, cw=(r0*2)/cols, ch=(r0*2)/rows;
      c.globalAlpha=g7cClamp(clarity,0.15,1);
      for(let ry=0;ry<rows;ry++){
        for(let rx=0;rx<cols;rx++){
          const x=cx0-r0+rx*cw, y=cy0-r0+ry*ch;
          c.strokeStyle=g7cAccent(dark); c.lineWidth=2;
          g7cRRect(c,x+2,y+2,cw-4,ch-4,4); c.stroke();
        }
      }
      c.globalAlpha=1;
      c.fillStyle=g7cMut(dark); c.font=`${Math.round(h*0.017)}px Tajawal`; c.textAlign='center';
      c.fillText('تبدأ الخلايا بالظهور', cx0, cy0-r0*0.55);
    } else {
      // ── تكبير 40x: خلية نباتية واحدة واضحة، مثل الرسم التوضيحي في الكتاب ──
      const L = onionCellLayout(w,h);
      c.globalAlpha = g7cClamp(clarity,0.2,1);
      // جدار الخلية (المستطيل الخارجي)
      c.fillStyle = dark?'#0F2A17':'#DFF3E2';
      g7cRRect(c,L.cx-L.cw/2,L.cy-L.ch/2,L.cw,L.ch,10); c.fill();
      c.strokeStyle='#166534'; c.lineWidth=Math.max(4,w*0.008);
      g7cRRect(c,L.cx-L.cw/2,L.cy-L.ch/2,L.cw,L.ch,10); c.stroke();
      // السيتوبلازم (طبقة رقيقة تحت الجدار)
      c.fillStyle= dark?'rgba(74,222,128,0.16)':'rgba(22,163,74,0.14)';
      g7cRRect(c,L.cx-L.cw/2+6,L.cy-L.ch/2+6,L.cw-12,L.ch-12,7); c.fill();
      // الفجوة العصارية (بيضاوية كبيرة داخل الخلية)
      c.fillStyle='rgba(96,165,250,0.5)';
      c.beginPath(); c.ellipse(L.vac.x,L.vac.y,L.vac.r*1.35,L.vac.r,0,0,Math.PI*2); c.fill();
      c.strokeStyle='#2563EB'; c.lineWidth=1.5;
      c.beginPath(); c.ellipse(L.vac.x,L.vac.y,L.vac.r*1.35,L.vac.r,0,0,Math.PI*2); c.stroke();
      // النواة (دائرة أرجوانية صغيرة)
      c.fillStyle='#7C3AED';
      c.beginPath(); c.arc(L.nuc.x,L.nuc.y,L.nuc.r,0,Math.PI*2); c.fill();
      c.strokeStyle='#5B21B6'; c.lineWidth=1.5; c.stroke();
      c.globalAlpha=1;

      // نقاط تفاعلية + خطوط رابطة + تسميات، فقط عند الوضوح الكافي
      if(clarity>0.45 && clickable){
        PARTS.forEach((part,i)=>{
          const pos = L[part.id];
          const found = S.foundParts[part.id];
          c.fillStyle= found? g7cAccent(dark):(dark?'rgba(255,255,255,0.55)':'rgba(60,60,60,0.4)');
          c.beginPath(); c.arc(pos.x,pos.y,Math.max(pos.r*0.22,w*0.012),0,Math.PI*2); c.fill();
          if(S.selPart===part.id){
            c.strokeStyle=g7cAccent(dark); c.lineWidth=2;
            c.beginPath(); c.arc(pos.x,pos.y,Math.max(pos.r*0.22,w*0.012)+5,0,Math.PI*2); c.stroke();
          }
          if(found){
            // خط رابط + تسمية خارج الخلية لتفادي التداخل
            const labelY = pos.y < L.cy ? L.cy-L.ch/2-h*0.045-(i%2)*h*0.032 : L.cy+L.ch/2+h*0.045+(i%2)*h*0.032;
            c.strokeStyle=g7cMut(dark); c.lineWidth=1.2; c.setLineDash([3,3]);
            c.beginPath(); c.moveTo(pos.x,pos.y); c.lineTo(pos.x,labelY); c.stroke(); c.setLineDash([]);
            c.fillStyle=g7cTxt(dark); c.font=`bold ${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
            c.fillText(part.label, pos.x, labelY + (labelY<L.cy? -h*0.012 : h*0.022));
          }
        });
      }
    }
    c.restore();
    c.strokeStyle=g7cMut(dark); c.lineWidth=3;
    c.beginPath(); c.arc(cx0,cy0,r0,0,Math.PI*2); c.stroke();
  }

  function drawMagnifiedModel(c,w,h,dark){
    const L = magnifyLayout(w,h);
    c.save();
    c.translate(L.cx,L.cy);
    const lcx=L.wall.x-L.cx, rw=L.rw, rh=L.rh, skew=L.skew;
    c.fillStyle= dark?'#0F2A17':'#DCF5E3';
    g7cRRect(c,-rw/2+skew*20,-rh/2,rw,rh,18); c.fill();
    c.strokeStyle='#166534'; c.lineWidth=6; g7cRRect(c,-rw/2+skew*20,-rh/2,rw,rh,18); c.stroke();
    // vacuole
    c.fillStyle='rgba(96,165,250,0.55)';
    c.beginPath(); c.ellipse(L.vac.x-L.cx,L.vac.y-L.cy,rw*0.32,rh*0.3,0,0,Math.PI*2); c.fill();
    c.strokeStyle='#2563EB'; c.lineWidth=1.5;
    c.beginPath(); c.ellipse(L.vac.x-L.cx,L.vac.y-L.cy,rw*0.32,rh*0.3,0,0,Math.PI*2); c.stroke();
    // nucleus
    c.fillStyle='#7C3AED';
    c.beginPath(); c.ellipse(L.nuc.x-L.cx,L.nuc.y-L.cy,rw*0.14,rh*0.12,0,0,Math.PI*2); c.fill();
    c.strokeStyle='#5B21B6'; c.lineWidth=1.5; c.stroke();
    c.restore();

    PARTS.forEach(part=>{
      const pos = L[part.id];
      c.fillStyle = S.selPart===part.id? g7cAccent(dark):(dark?'rgba(255,255,255,0.5)':'rgba(60,60,60,0.4)');
      c.beginPath(); c.arc(pos.x,pos.y,w*0.012,0,Math.PI*2); c.fill();
      if(S.selPart===part.id){
        c.strokeStyle=g7cAccent(dark); c.lineWidth=2;
        c.beginPath(); c.arc(pos.x,pos.y,w*0.017,0,Math.PI*2); c.stroke();
        c.fillStyle=g7cTxt(dark); c.font=`bold ${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
        c.fillText(part.label, pos.x, pos.y - w*0.03);
      }
    });
    c.fillStyle=g7cMut(dark); c.font=`${Math.round(h*0.015)}px Tajawal`; c.textAlign='center';
    c.fillText('اسحب لتدوير النموذج', L.cx, L.cy+L.rh*0.65);
  }

  function drawOnionSetupScene(c,w,h,dark){
    const peelDone = S.stepIdx>=1, waterDone = S.stepIdx>=2, placeDone = S.stepIdx>=3, coverDone = S.stepIdx>=4;
    const animT = S.stepAnimT>0 ? 1-(S.stepAnimT/55) : 1;
    const anim = S.stepAnimT>0 ? S.stepAnimType : null;

    const midY = h*0.46;
    const onionX=w*0.27, onionY=midY, onionR=w*0.08;
    const slideCx=w*0.68, slideCy=midY, slideW=w*0.3, slideH=h*0.055;

    // سهم متقطّع يربط بين البصلة والشريحة (يوضّح اتجاه نقل العيّنة)
    c.strokeStyle=dark?'rgba(255,255,255,0.18)':'rgba(0,0,0,0.12)'; c.lineWidth=2; c.setLineDash([6,6]);
    c.beginPath(); c.moveTo(onionX+onionR*1.1,midY); c.lineTo(slideCx-slideW/2-w*0.015,midY); c.stroke();
    c.setLineDash([]);

    // البصلة
    const onionScale = peelDone? 0.88: 1;
    g7cEmoji(c,'🧅',onionX,onionY,Math.round(onionR*2*onionScale));
    c.fillStyle=g7cMut(dark); c.font=`${Math.round(h*0.013)}px Tajawal`; c.textAlign='center';
    c.fillText('البصلة', onionX, onionY+onionR*1.15+h*0.03);

    // خطوة القشر: سكّين يمرّ فوق البصلة
    if(anim==='peel'){
      const kx = g7cLerp(onionX-onionR*1.1, onionX+onionR*1.1, animT);
      g7cEmoji(c,'🔪',kx,onionY-onionR*0.4,Math.round(w*0.045));
    }

    // قطعة القشر الرقيقة: شريط شفّاف منحنٍ ملتصق بحافّة البصلة، ثمّ ينتقل إلى الشريحة
    let peelX = onionX+onionR*0.95, peelY = onionY-onionR*0.15, peelAngle=-0.25;
    if(anim==='place'){
      const t=animT;
      peelX = g7cLerp(onionX+onionR*0.95, slideCx, t);
      peelY = g7cLerp(onionY-onionR*0.15, slideCy, t);
      peelAngle = g7cLerp(-0.25, 0, t);
    } else if(placeDone){
      peelX = slideCx; peelY = slideCy; peelAngle=0;
    }
    if(peelDone){
      c.save();
      c.translate(peelX,peelY); c.rotate(peelAngle);
      c.globalAlpha = 0.8;
      c.fillStyle = dark? 'rgba(250,245,230,0.55)':'rgba(255,252,240,0.85)';
      c.strokeStyle = '#C9A227'; c.lineWidth=1.5;
      g7cRRect(c,-w*0.045,-h*0.012,w*0.09,h*0.024,10); c.fill(); c.stroke();
      c.globalAlpha=1;
      c.restore();
    }

    // الشريحة الزجاجية
    c.fillStyle= dark?'rgba(147,197,253,0.15)':'rgba(191,219,254,0.5)';
    c.strokeStyle=g7cMut(dark); c.lineWidth=2;
    g7cRRect(c,slideCx-slideW/2,slideCy-slideH/2,slideW,slideH,4); c.fill(); c.stroke();
    c.fillStyle=g7cMut(dark); c.font=`${Math.round(h*0.013)}px Tajawal`; c.textAlign='center';
    c.fillText('الشريحة الزجاجية', slideCx, slideCy+slideH/2+h*0.032);

    // قطرة الماء
    if(anim==='water'){
      const dy = g7cLerp(midY-h*0.22, slideCy, g7cClamp(animT*1.15,0,1));
      g7cEmoji(c,'💧',slideCx-slideW*0.2,dy,Math.round(w*0.038));
    } else if(waterDone){
      c.fillStyle= dark?'rgba(147,197,253,0.55)':'rgba(59,130,246,0.35)';
      c.beginPath(); c.ellipse(slideCx-slideW*0.2,slideCy,slideW*0.06,slideH*0.28,0,0,Math.PI*2); c.fill();
    }

    // الغطاء الزجاجي
    if(anim==='cover'){
      const gy = g7cLerp(slideCy-h*0.16, slideCy-slideH*0.05, animT);
      c.fillStyle= dark?'rgba(200,200,255,0.2)':'rgba(200,220,255,0.55)';
      c.strokeStyle=g7cAccent(dark); c.lineWidth=1.5;
      g7cRRect(c,slideCx-slideW*0.4,gy,slideW*0.8,slideH*0.7,4); c.fill(); c.stroke();
    } else if(coverDone){
      c.fillStyle= dark?'rgba(200,200,255,0.2)':'rgba(200,220,255,0.55)';
      c.strokeStyle=g7cAccent(dark); c.lineWidth=1.5;
      g7cRRect(c,slideCx-slideW*0.4,slideCy-slideH*0.35,slideW*0.8,slideH*0.7,4); c.fill(); c.stroke();
    }

    c.fillStyle=g7cTxt(dark); c.font=`bold ${Math.round(h*0.017)}px Tajawal`; c.textAlign='center';
    const label = anim ? STEPS[S.stepIdx].label : (S.stepIdx<STEPS.length? STEPS[S.stepIdx].label : 'اكتملت الشريحة');
    c.fillText(label, w/2, h*0.88);
  }

  function draw(){
    if(currentSim!=='g7cell6' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7cBg(dark); c.fillRect(0,0,w,h);

    if(S.stepAnimT>0){
      S.stepAnimT--;
      if(S.stepAnimT===0){ S.stepIdx++; S.stepAnimType=null; controls(renderControls()); }
    }

    if(S.stepIdx < STEPS.length || S.stepAnimT>0){
      drawOnionSetupScene(c,w,h,dark);
    } else if(!S.magnify){
      drawOnionCell(c,w,h,dark,S.zoom,S.focus,true);
      c.fillStyle=g7cMut(dark); c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
      c.fillText(`تكبير ${S.zoom}x`, w/2, h*0.95);
    } else {
      drawMagnifiedModel(c,w,h,dark);
    }
    g7cTitle(c,w,h,dark,'٤-٦ · فحص الخلايا النباتية');
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   ٤-٧ · الخلايا الحيوانية — فحص خلايا الخدّ
   ══════════════════════════════════════════════════════════ */
function simG7Cell7a(){
  cancelAnimationFrame(animFrame);
  const STEPS=[
    { id:'swab',  label:'اسحب عوداً قطنياً من داخل الفم واجمع عيّنة من خلايا الخدّ' },
    { id:'stain', label:'أضف قطرة من صبغة الميثيلين الأزرق' },
    { id:'cover', label:'ضع غطاء الشريحة' },
    { id:'stage', label:'ضع الشريحة على منصّة المجهر' },
  ];
  const PARTS = [
    { id:'mem',  label:'غشاء الخلية', desc:'يتحكّم فيما يدخل إلى الخلية وما يخرج منها.', x:0.5,y:0.5,rr:0.34 },
    { id:'cyto', label:'السيتوبلازم', desc:'تحدث داخله معظم التفاعلات الكيميائية في الخلية.', x:0.5,y:0.5,rr:0.2 },
    { id:'nuc',  label:'النواة',      desc:'مركز التحكّم في الخلية.', x:0.42,y:0.46,rr:0.09 },
  ];
  simState = { stepIdx:0, stepAnimT:0, stained:false, zoom:40, focus:0.2, foundParts:{}, selPart:null,
    challenge:false, dragId:null, placed:{}, dragX:0, dragY:0, compareMode:false, qAnswered:false };
  const S = simState;
  const cv = document.getElementById('simCanvas');
  const ZOOMS=[40,100,400];

  function renderControls(){
    if(S.stepIdx < STEPS.length){
      if(S.stepAnimT>0){
        return `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">👄 إعداد الشريحة</div></div>
          <div class="info-box">⏳ جارٍ التنفيذ: ${STEPS[S.stepIdx].label}...</div>`;
      }
      let html = `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">👄 إعداد الشريحة</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:6px">الخطوة ${S.stepIdx+1} من ${STEPS.length}</div>
        <div style="font-size:13px;color:var(--text-secondary);margin-bottom:10px">${STEPS[S.stepIdx].label}</div>
        <button class="ctrl-btn play" onclick="window._g7c7Step()">✅ نفّذ الخطوة</button>`;
      if(STEPS[S.stepIdx].id==='stain'){
        html += `<div class="info-box" style="margin-top:10px">تساعد الصبغة على رؤية الخلايا وأجزائها بوضوح أكبر.</div>`;
      }
      return html;
    }
    let html = `<div class="ctrl-section"><div class="ctrl-label" style="font-size:16px">🔬 استخدم المجهر</div></div>
      <div class="ctrl-row"><div class="ctrl-name">التكبير</div></div>
      <div class="ctrl-btns-grid" style="margin-bottom:10px">
        ${ZOOMS.map(z=>`<button class="ctrl-btn ${S.zoom===z?'active':''}" onclick="window._g7c7Zoom(${z})">${z}x</button>`).join('')}
      </div>
      <div class="ctrl-row"><div class="ctrl-name">🎛️ عجلة التركيز</div></div>
      <input type="range" min="0" max="1" step="0.02" value="${S.focus}" oninput="window._g7c7Focus(this.value)" style="width:100%;margin-bottom:10px">`;
    if(!S.stained){
      html += `<div class="info-box" style="margin-bottom:10px;color:#D97706">❓ لماذا يصعب رؤية الخلايا؟ (لم تُضف الصبغة بعد)</div>
        <button class="ctrl-btn" onclick="window._g7c7Stain()">🟦 أضف صبغة الميثيلين الأزرق</button>`;
    } else if(S.zoom>=100){
      html += `<div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:8px">اضغط على أجزاء الخلية: اكتُشف ${Object.keys(S.foundParts).length} / ${PARTS.length}</div>`;
      if(S.selPart){
        const p=PARTS.find(x=>x.id===S.selPart);
        html += `<div class="info-box" style="margin-bottom:10px"><b>${p.label}:</b> ${p.desc}</div>`;
      }
      if(Object.keys(S.foundParts).length===PARTS.length && !S.challenge){
        html += `<button class="ctrl-btn" onclick="window._g7c7Challenge()">🕵️ كن عالم أحياء: التحدّي التفاعلي</button>`;
      }
    }
    if(S.challenge){
      const done = PARTS.every(p=>S.placed[p.id]);
      html += `<div class="ctrl-section" style="margin-top:12px"><div class="ctrl-label" style="font-size:14px">🏷️ اسحب التسميات إلى مكانها الصحيح</div></div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:8px">${Object.keys(S.placed).length} / ${PARTS.length}</div>`;
      if(done){
        html += `<div class="info-box" style="margin-bottom:10px">🏆 أحسنت! نجحت في تحديد أجزاء الخلية الحيوانية.</div>
          <button class="ctrl-btn" onclick="window._g7c7Compare()">${S.compareMode?'🔙 رجوع':'🔬 مقارنة مع الخلية النباتية'}</button>`;
        if(S.compareMode){
          html += `<div class="info-box" style="margin-top:10px;font-size:12.5px;line-height:1.9">
            <b>الخلية الحيوانية:</b> ❌ لا جدار خلوي · ❌ لا بلاستيدات خضراء · ✅ غشاء خلية · ✅ نواة · ✅ سيتوبلازم<br><br>
            <b>الخلية النباتية:</b> ✅ جدار خلوي · ✅ فجوة كبيرة · ✅ غشاء خلية · ✅ نواة · ✅ سيتوبلازم
          </div>`;
        }
        html += `<div class="ctrl-section" style="margin-top:12px"><div class="ctrl-label" style="font-size:15px">❓ لاحظت جزءاً داكن اللون امتصّ كمّية كبيرة من الصبغة الزرقاء. ما هذا الجزء غالباً؟</div></div>
          ${g7cMCQ('g7c7q',['غشاء الخلية','النواة','السيتوبلازم','جدار الخلية'])}
          <button class="ctrl-btn reset" style="margin-top:12px" onclick="window._g7c7Restart()">↺ أعد النشاط</button>`;
      }
    }
    return html;
  }
  controls(renderControls());

  window._g7c7Step = function(){
    if(S.stepAnimT>0) return;
    _g8pPlayClick(); S.stepAnimT=55; controls(renderControls());
  };
  window._g7c7Stain = function(){ _g8pPlayClick(); S.stained=true; controls(renderControls()); };
  window._g7c7Zoom = function(z){ _g8pPlayClick(); S.zoom=z; controls(renderControls()); };
  window._g7c7Focus = function(v){ S.focus=+v; controls(renderControls()); };
  window._g7c7Challenge = function(){ _g8pPlayClick(); S.challenge=true; controls(renderControls()); };
  window._g7c7Compare = function(){ _g8pPlayClick(); S.compareMode=!S.compareMode; controls(renderControls()); };
  window._g7c7qAns = function(i){
    if(S.qAnswered) return; S.qAnswered=true;
    g7cAnswerMCQ('g7c7q', i, 1, 'تظهر النواة عادةً بلون أغمق بعد استخدام صبغة الميثيلين الأزرق، لذلك يسهل تمييزها تحت المجهر.');
  };
  window._g7c7Restart = function(){
    S.stepIdx=0; S.stepAnimT=0; S.stained=false; S.zoom=40; S.focus=0.2; S.foundParts={}; S.selPart=null;
    S.challenge=false; S.dragId=null; S.placed={}; S.compareMode=false; S.qAnswered=false;
    controls(renderControls());
  };

  function partHit(p,w,h){
    const cx=w*0.5, cy=h*0.46;
    for(const part of PARTS){
      const px=cx, py=cy - (part.id==='nuc'? h*0.02: 0);
      const rr = part.rr*Math.min(w,h);
      const dist = Math.hypot(p.x-px,p.y-py);
      if(part.id==='mem' && dist<rr && dist>rr*0.62) return part;
      if(part.id==='cyto' && dist<rr*0.62 && dist>0.28*rr) return part;
      if(part.id==='nuc' && dist<rr*0.32) return part;
    }
    return null;
  }
  function labelHomes(w,h){
    return PARTS.map((p,i)=>({...p, hx:w*0.15+ (i%3)*(w*0.35), hy:h*0.86}));
  }
  function hitLabel(p,w,h){
    for(const l of labelHomes(w,h)){
      if(S.placed[l.id]) continue;
      if(Math.hypot(p.x-l.hx,p.y-l.hy) < w*0.07) return l;
    }
    return null;
  }
  function slotFor(id,w,h){
    const cx=w*0.5, cy=h*0.46;
    if(id==='nuc') return {x:cx, y:cy-h*0.02};
    if(id==='cyto') return {x:cx-w*0.09, y:cy+h*0.05};
    return {x:cx, y:cy-h*0.16};
  }
  function hitSlot(p,w,h){
    for(const part of PARTS){
      const s = slotFor(part.id,w,h);
      if(Math.hypot(p.x-s.x,p.y-s.y) < w*0.06) return part;
    }
    return null;
  }

  function onDown(e){
    const p = g7cGp(cv,e), w=cv.width, h=cv.height;
    if(S.challenge){
      const l = hitLabel(p,w,h);
      if(l){ S.dragId=l.id; S.dragX=p.x; S.dragY=p.y; }
      return;
    }
  }
  function onMove(e){
    if(!S.dragId) return;
    e.preventDefault && e.preventDefault();
    const p = g7cGp(cv,e); S.dragX=p.x; S.dragY=p.y;
  }
  function onUp(){
    if(!S.dragId) return;
    const w=cv.width, h=cv.height;
    const slot = hitSlot({x:S.dragX,y:S.dragY},w,h);
    if(slot && slot.id===S.dragId){ S.placed[S.dragId]=true; _g8pPlayDrop(); }
    else { _g8pPlayClick(); }
    S.dragId=null; controls(renderControls());
  }
  cv.onmousedown=onDown; cv.onmousemove=onMove; cv.onmouseup=onUp;
  cv.ontouchstart=onDown; cv.ontouchmove=onMove; cv.ontouchend=onUp;
  cv.onclick = function(e){
    if(S.challenge) return;
    const p=g7cGp(cv,e), w=cv.width, h=cv.height;
    if(S.stepIdx>=STEPS.length && S.stained && S.zoom>=100){
      const part = partHit(p,w,h);
      if(part){ _g8pPlayClick(); S.foundParts[part.id]=true; S.selPart=part.id; controls(renderControls()); }
    }
  };

  function drawCheekCell(c,w,h,dark,zoom,focus,stained,interactive){
    const cx=w*0.5, cy=h*0.46;
    const clarity = stained? g7cClamp(1-Math.abs(focus-0.2)*1.4,0.15,1) : 0.25;
    const baseR = Math.min(w,h)*0.32 * (zoom/40>1? 1+((zoom-40)/400):1);
    const rr = Math.min(baseR, Math.min(w,h)*0.36);
    c.globalAlpha = clarity;
    // غشاء الخلية (حلقة خارجية واضحة اللون)
    c.fillStyle = stained? (dark?'#1E3A8A':'#93C5FD') : (dark?'#334155':'#CBD5E1');
    c.beginPath(); c.ellipse(cx,cy,rr,rr*0.86,0,0,Math.PI*2); c.fill();
    c.strokeStyle=g7cAccent(dark); c.lineWidth=2.5; c.stroke();
    // السيتوبلازم (طبقة داخلية)
    c.fillStyle = stained? (dark?'#1D4ED8':'#BFDBFE') : (dark?'#3f4b5c':'#DDE3EA');
    c.beginPath(); c.ellipse(cx,cy,rr*0.66,rr*0.58,0,0,Math.PI*2); c.fill();
    // النواة (دائرة أصغر وغير مركزية، كما تبدو حقيقةً)
    const nucX=cx-rr*0.16, nucY=cy-rr*0.04;
    c.fillStyle = stained? '#1E1B4B' : '#64748B';
    c.beginPath(); c.ellipse(nucX,nucY,rr*0.22,rr*0.19,0,0,Math.PI*2); c.fill();
    c.globalAlpha=1;

    if(interactive && zoom>=100 && stained && clarity>0.5){
      const anchors = {
        mem:  { ax:cx, ay:cy-rr*0.86, lx:cx, ly:cy-rr*1.12, align:'above' },
        cyto: { ax:cx, ay:cy+rr*0.55, lx:cx, ly:cy+rr*1.14, align:'below' },
        nuc:  { ax:nucX, ay:nucY, lx:cx-rr*1.28, ly:nucY, align:'left' },
      };
      PARTS.forEach(part=>{
        if(!S.foundParts[part.id]) return;
        const a = anchors[part.id]; if(!a) return;
        c.strokeStyle=g7cMut(dark); c.lineWidth=1.2; c.setLineDash([3,3]);
        c.beginPath(); c.moveTo(a.ax,a.ay); c.lineTo(a.lx,a.ly); c.stroke(); c.setLineDash([]);
        c.fillStyle=g7cAccent(dark);
        c.beginPath(); c.arc(a.ax,a.ay,3.5,0,Math.PI*2); c.fill();
        c.fillStyle=g7cTxt(dark); c.font=`bold ${Math.round(h*0.015)}px Tajawal`;
        c.textAlign = a.align==='left' ? 'right' : 'center';
        c.fillText(part.label, a.align==='left'? a.lx-6 : a.lx, a.align==='above'? a.ly-4 : a.ly+14);
        c.textAlign='center';
      });
    }
  }

  function drawCheekSetupScene(c,w,h,dark){
    const swabDone = S.stepIdx>=1, stainDoneStep = S.stepIdx>=2, coverDoneStep = S.stepIdx>=3, stageDone = S.stepIdx>=4;
    const animT = S.stepAnimT>0 ? 1-(S.stepAnimT/55) : 1;
    const anim = S.stepAnimT>0 ? STEPS[S.stepIdx].id : null;

    const midY = h*0.46;
    const mouthX=w*0.26, mouthY=midY;
    const slideCx=w*0.68, slideCy=midY, slideW=w*0.3, slideH=h*0.055;
    const dotRx = slideW*0.09, dotRy = slideH*0.36;

    // سهم متقطّع يربط بين الفم والشريحة
    c.strokeStyle=dark?'rgba(255,255,255,0.18)':'rgba(0,0,0,0.12)'; c.lineWidth=2; c.setLineDash([6,6]);
    c.beginPath(); c.moveTo(mouthX+w*0.06,midY); c.lineTo(slideCx-slideW/2-w*0.015,midY); c.stroke();
    c.setLineDash([]);

    // الفم (مصدر العيّنة)
    g7cEmoji(c,'👄',mouthX,mouthY,Math.round(w*0.075));
    c.fillStyle=g7cMut(dark); c.font=`${Math.round(h*0.013)}px Tajawal`; c.textAlign='center';
    c.fillText('عيّنة من الخدّ', mouthX, mouthY+w*0.075*0.62+h*0.032);

    // الشريحة الزجاجية
    c.fillStyle= dark?'rgba(147,197,253,0.15)':'rgba(191,219,254,0.5)';
    c.strokeStyle=g7cMut(dark); c.lineWidth=2;
    g7cRRect(c,slideCx-slideW/2,slideCy-slideH/2,slideW,slideH,4); c.fill(); c.stroke();
    c.fillStyle=g7cMut(dark); c.font=`${Math.round(h*0.013)}px Tajawal`; c.textAlign='center';
    c.fillText('الشريحة الزجاجية', slideCx, slideCy+slideH/2+h*0.032);

    // العود القطني ينقل العيّنة من الفم إلى الشريحة
    if(anim==='swab'){
      const sx=g7cLerp(mouthX+w*0.05,slideCx,animT), sy=g7cLerp(mouthY,slideCy,animT);
      c.strokeStyle=dark?'#D6D3D1':'#78716C'; c.lineWidth=w*0.006; c.lineCap='round';
      c.beginPath(); c.moveTo(sx-w*0.03,sy+w*0.02); c.lineTo(sx,sy); c.stroke();
      c.fillStyle='#FDE68A'; c.beginPath(); c.arc(sx,sy,w*0.013,0,Math.PI*2); c.fill();
    }
    let dotAlpha = swabDone ? 1 : 0;
    if(anim==='swab') dotAlpha = animT;
    if(dotAlpha>0){
      c.fillStyle= stainDoneStep||anim==='stain' ? 'rgba(59,130,246,0.55)' : (dark?'rgba(255,182,193,0.5)':'rgba(244,114,182,0.55)');
      c.globalAlpha=dotAlpha;
      c.beginPath(); c.ellipse(slideCx,slideCy,dotRx,dotRy,0,0,Math.PI*2); c.fill();
      c.globalAlpha=1;
    }

    // قطرة الصبغة الزرقاء
    if(anim==='stain'){
      const dy = g7cLerp(midY-h*0.22, slideCy, g7cClamp(animT*1.15,0,1));
      g7cEmoji(c,'🔵',slideCx,dy,Math.round(w*0.028));
      if(animT>0.5){
        c.fillStyle='rgba(37,99,235,0.5)'; c.globalAlpha=(animT-0.5)*1.6;
        c.beginPath(); c.ellipse(slideCx,slideCy,dotRx,dotRy,0,0,Math.PI*2); c.fill(); c.globalAlpha=1;
      }
    } else if(stainDoneStep){
      c.fillStyle='rgba(29,78,216,0.55)';
      c.beginPath(); c.ellipse(slideCx,slideCy,dotRx,dotRy,0,0,Math.PI*2); c.fill();
    }

    // الغطاء الزجاجي
    if(anim==='cover'){
      const gy = g7cLerp(slideCy-h*0.16, slideCy-slideH*0.05, animT);
      c.fillStyle= dark?'rgba(200,200,255,0.2)':'rgba(200,220,255,0.55)';
      c.strokeStyle=g7cAccent(dark); c.lineWidth=1.5;
      g7cRRect(c,slideCx-slideW*0.4,gy,slideW*0.8,slideH*0.7,4); c.fill(); c.stroke();
    } else if(coverDoneStep){
      c.fillStyle= dark?'rgba(200,200,255,0.2)':'rgba(200,220,255,0.55)';
      c.strokeStyle=g7cAccent(dark); c.lineWidth=1.5;
      g7cRRect(c,slideCx-slideW*0.4,slideCy-slideH*0.35,slideW*0.8,slideH*0.7,4); c.fill(); c.stroke();
    }

    // منصّة المجهر
    const stageY = h*0.8;
    c.strokeStyle=g7cMut(dark); c.lineWidth=2;
    g7cRRect(c,slideCx-w*0.11,stageY,w*0.22,h*0.022,3); c.stroke();
    c.fillStyle=g7cMut(dark); c.font=`${Math.round(h*0.012)}px Tajawal`; c.textAlign='center';
    c.fillText('منصّة المجهر', slideCx, stageY+h*0.045);
    if(anim==='stage'){
      const sy = g7cLerp(slideCy, stageY, animT);
      c.fillStyle= dark?'rgba(147,197,253,0.15)':'rgba(191,219,254,0.5)';
      c.strokeStyle=g7cMut(dark); c.lineWidth=2;
      g7cRRect(c,slideCx-slideW/2,sy-slideH/2,slideW,slideH,4); c.fill(); c.stroke();
    } else if(stageDone){
      c.fillStyle= dark?'rgba(147,197,253,0.2)':'rgba(191,219,254,0.6)';
      c.strokeStyle=g7cAccent(dark); c.lineWidth=2;
      g7cRRect(c,slideCx-slideW/2,stageY-slideH*0.3,slideW,slideH*0.6,4); c.fill(); c.stroke();
    }

    c.fillStyle=g7cTxt(dark); c.font=`bold ${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
    const label = anim ? STEPS[S.stepIdx].label : (S.stepIdx<STEPS.length? STEPS[S.stepIdx].label : 'اكتملت الشريحة');
    c.fillText(label, w/2, h*0.96);
  }

  function draw(){
    if(currentSim!=='g7cell7' || currentTab!==0){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=isDarkMode();
    c.fillStyle=g7cBg(dark); c.fillRect(0,0,w,h);

    if(S.stepAnimT>0){
      S.stepAnimT--;
      if(S.stepAnimT===0){ S.stepIdx++; controls(renderControls()); }
    }

    if(S.stepIdx < STEPS.length || S.stepAnimT>0){
      drawCheekSetupScene(c,w,h,dark);
    } else if(!S.challenge){
      drawCheekCell(c,w,h,dark,S.zoom,S.focus,S.stained,true);
      c.fillStyle=g7cMut(dark); c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center';
      c.fillText(`تكبير ${S.zoom}x`, w/2, h*0.94);
    } else {
      drawCheekCell(c,w,h,dark,100,0.2,true,false);
      PARTS.forEach(part=>{
        const s = slotFor(part.id,w,h);
        if(!S.placed[part.id]){
          c.strokeStyle=g7cMut(dark); c.setLineDash([4,3]); c.lineWidth=1.5;
          c.beginPath(); c.arc(s.x,s.y,w*0.028,0,Math.PI*2); c.stroke(); c.setLineDash([]);
        }
      });
      labelHomes(w,h).forEach(l=>{
        if(S.placed[l.id]) return;
        if(S.dragId===l.id) return;
        c.fillStyle=dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.05)';
        g7cRRect(c,l.hx-w*0.08,l.hy-h*0.03,w*0.16,h*0.06,8); c.fill();
        c.strokeStyle=g7cAccent(dark); c.lineWidth=1.5; g7cRRect(c,l.hx-w*0.08,l.hy-h*0.03,w*0.16,h*0.06,8); c.stroke();
        c.fillStyle=g7cTxt(dark); c.font=`${Math.round(h*0.015)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(l.label, l.hx, l.hy);
        c.textBaseline='alphabetic';
      });
      if(S.dragId){
        const l = PARTS.find(x=>x.id===S.dragId);
        c.fillStyle=dark?'rgba(255,255,255,0.15)':'rgba(0,0,0,0.08)';
        g7cRRect(c,S.dragX-w*0.08,S.dragY-h*0.03,w*0.16,h*0.06,8); c.fill();
        c.fillStyle=g7cTxt(dark); c.font=`${Math.round(h*0.015)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(l.label, S.dragX, S.dragY);
        c.textBaseline='alphabetic';
      }
    }
    g7cTitle(c,w,h,dark,'٤-٧ · فحص الخلايا الحيوانية');
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}
