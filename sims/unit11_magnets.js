// الوحدة 11 · المغناطيسيّة والكهرباء — الصف الثامن
// بنفس أسلوب PhET — نظيف ومنظم
// ══════════════════════════════════════════════════════════════

// ─── مساعد: رسم مغناطيس شريطي ───
function _drawBarMagnet(c, cx, cy, mw, mh, flipped) {
  const nc = flipped ? '#2980B9' : '#C0392B';
  const sc = flipped ? '#C0392B' : '#2980B9';
  // half right = N, half left = S
  c.fillStyle = sc; c.beginPath(); c.roundRect(cx - mw/2, cy - mh/2, mw/2, mh, [8,0,0,8]); c.fill();
  c.fillStyle = nc; c.beginPath(); c.roundRect(cx, cy - mh/2, mw/2, mh, [0,8,8,0]); c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 2;
  c.beginPath(); c.roundRect(cx - mw/2, cy - mh/2, mw, mh, 8); c.stroke();
  c.font = `bold ${Math.round(mh*0.38)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle'; c.fillStyle='white';
  c.fillText(flipped?'ش':'ج', cx - mw/4, cy);
  c.fillText(flipped?'ج':'ش', cx + mw/4, cy);
}

// ─── مساعد: رسم بطارية ───
function _drawBattery(c, x, y, voltage) {
  c.fillStyle='#2C3E50'; c.beginPath(); c.roundRect(x-22,y-32,44,64,6); c.fill();
  c.fillStyle='#F39C12';
  for(let i=0;i<3;i++) c.fillRect(x-13, y-22+i*18, 26, 12);
  c.fillStyle='white'; c.font='bold 11px Arial'; c.textAlign='center'; c.textBaseline='middle';
  c.fillText(voltage+'V', x, y+8);
}

// ─── مساعد: رسم مصباح ───
function _drawBulb(c, x, y, on, t) {
  if(on){ c.shadowBlur=22+Math.sin(t*5)*4; c.shadowColor='rgba(255,210,0,.75)'; }
  c.fillStyle = on ? `rgba(255,215,50,${0.6+Math.sin(t*5)*.12})` : 'rgba(180,180,180,.45)';
  c.beginPath(); c.arc(x, y, 18, 0, Math.PI*2); c.fill();
  c.shadowBlur=0;
  c.strokeStyle = on ? '#F39C12' : '#AAA'; c.lineWidth=2;
  c.beginPath(); c.arc(x, y, 18, 0, Math.PI*2); c.stroke();
  // filament
  c.strokeStyle = on ? 'rgba(255,200,0,.9)' : 'rgba(150,150,150,.5)'; c.lineWidth=1.5;
  c.beginPath(); c.moveTo(x-5,y+12); c.lineTo(x-2,y+4); c.lineTo(x+1,y+9); c.lineTo(x+4,y+3); c.lineTo(x+7,y+12); c.stroke();
  // base
  c.fillStyle='#555'; c.beginPath(); c.roundRect(x-9,y+14,18,11,3); c.fill();
}

// ══════════════════════════════════════════════════════════════
// 11-1 · TAB 1 — الجذب والتنافر
// ══════════════════════════════════════════════════════════════
function simMagnets1() {
  cancelAnimationFrame(animFrame);
  const cv = document.getElementById('simCanvas');
  const c  = cv.getContext('2d');

  if(!simState.mag1) simState.mag1 = {
    mags: [{x:.28,y:.48,vx:0,vy:0,flipped:false},{x:.72,y:.48,vx:0,vy:0,flipped:true}],
    drag:-1, ox:0, oy:0, t:0
  };
  const S = simState.mag1;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧲 تحكّم بالمغناطيسين</div>
      <button class="ctrl-btn" onclick="simState.mag1.mags[0].flipped=!simState.mag1.mags[0].flipped;simState.mag1.mags[0].vx=0;simState.mag1.mags[0].vy=0">🔄 اقلب الأيمن</button>
      <button class="ctrl-btn" onclick="simState.mag1.mags[1].flipped=!simState.mag1.mags[1].flipped;simState.mag1.mags[1].vx=0;simState.mag1.mags[1].vy=0">🔄 اقلب الأيسر</button>
    </div>
    <div class="info-box" style="font-size:13px;line-height:2">
      🔴 <strong>ش</strong> = شمالي &nbsp; 🔵 <strong>ج</strong> = جنوبي<br>
      ش ↔ ج = <strong style="color:#27AE60">تجاذب ❤️</strong><br>
      ش ↔ ش = <strong style="color:#E74C3C">تنافر 💥</strong><br>
      ج ↔ ج = <strong style="color:#E74C3C">تنافر 💥</strong>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">💡 اسحب مغناطيساً لتقريبه</div>
    </div>`);

  function gp(e){const r=cv.getBoundingClientRect(),sc=cv.width/r.width,s=e.touches?e.touches[0]:e;return{x:(s.clientX-r.left)*sc,y:(s.clientY-r.top)*sc};}
  function down(e){e.preventDefault();const p=gp(e),w=cv.width,h=cv.height;
    S.mags.forEach((m,i)=>{if(Math.hypot(p.x-m.x*w,p.y-m.y*h)<60){S.drag=i;S.ox=p.x-m.x*w;S.oy=p.y-m.y*h;m.vx=0;m.vy=0;}});}
  function move(e){if(S.drag<0)return;e.preventDefault();const p=gp(e),w=cv.width,h=cv.height;
    S.mags[S.drag].x=Math.max(.06,Math.min(.94,(p.x-S.ox)/w));
    S.mags[S.drag].y=Math.max(.12,Math.min(.82,(p.y-S.oy)/h));}
  function up(){S.drag=-1;}
  cv.addEventListener('mousedown',down);cv.addEventListener('mousemove',move);cv.addEventListener('mouseup',up);
  cv.addEventListener('touchstart',down,{passive:false});cv.addEventListener('touchmove',move,{passive:false});cv.addEventListener('touchend',up);

  function draw(){
    if(currentSim!=='magnets'||currentTab!==0){cv.removeEventListener('mousedown',down);cv.removeEventListener('mousemove',move);cv.removeEventListener('mouseup',up);return;}
    S.t+=.04;
    const w=cv.width,h=cv.height;
    const mW=Math.min(w*.24,120), mH=Math.max(30,Math.min(h*.1,46));
    const m0=S.mags[0],m1=S.mags[1];

    // فيزياء التحريك التلقائي
    const x0=m0.x*w,y0=m0.y*h,x1=m1.x*w,y1=m1.y*h;
    const dist=Math.hypot(x1-x0,y1-y0);
    const dx=(x1-x0)/Math.max(dist,1),dy=(y1-y0)/Math.max(dist,1);

    // القطب الأيمن لـ m0 والأيمن من منظور m1 (الأيسر)
    const m0R=m0.flipped?'S':'N';
    const m1L=m1.flipped?'N':'S';
    const isAttract=(m0R!==m1L);

    if(S.drag<0 && dist<w*.7){
      const strength=Math.min(1,Math.pow(w*.3/Math.max(dist,30),2))*0.004;
      const sign=isAttract?1:-1;
      // m0 تتحرك نحو/بعيداً عن m1
      m0.vx+=dx*sign*strength; m0.vy+=dy*sign*strength;
      // m1 تتحرك عكس m0
      m1.vx-=dx*sign*strength; m1.vy-=dy*sign*strength;
    }
    // احتكاك + تطبيق السرعة
    S.mags.forEach((m,i)=>{
      if(S.drag===i){m.vx=0;m.vy=0;return;}
      m.vx*=0.82; m.vy*=0.82;
      m.x=Math.max(.06,Math.min(.94,m.x+m.vx));
      m.y=Math.max(.12,Math.min(.82,m.y+m.vy));
    });
    // منع التداخل
    const minDist=(mW/w)+0.02;
    if(dist/w<minDist){
      const push=(minDist-dist/w)/2;
      if(S.drag!==0){m0.x-=dx*push;m0.y-=dy*push;}
      if(S.drag!==1){m1.x+=dx*push;m1.y+=dy*push;}
    }

    const nx0=m0.x*w,ny0=m0.y*h,nx1=m1.x*w,ny1=m1.y*h;
    const ndist=Math.hypot(nx1-nx0,ny1-ny0);
    const ndx=(nx1-nx0)/Math.max(ndist,1),ndy=(ny1-ny0)/Math.max(ndist,1);

    c.clearRect(0,0,w,h);
    const bg=c.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#EEF4FF');bg.addColorStop(1,'#E0ECFF');
    c.fillStyle=bg;c.fillRect(0,0,w,h);
    U9.grid(c,w,h,'rgba(100,130,200,0.07)',44);

    // سهام القوة
    if(ndist<w*.6){
      const force=Math.max(0,1-ndist/(w*.55));
      const col=isAttract?'#27AE60':'#E74C3C';
      const arLen=Math.min(force*60,55);
      if(arLen>6){
        if(isAttract){
          U9.arrow(c,nx0+ndx*mW*.52,ny0+ndy*mW*.52,nx0+ndx*(mW*.52+arLen),ny0+ndy*(mW*.52+arLen),col,4,'',1);
          U9.arrow(c,nx1-ndx*mW*.52,ny1-ndy*mW*.52,nx1-ndx*(mW*.52+arLen),ny1-ndy*(mW*.52+arLen),col,4,'',1);
        } else {
          U9.arrow(c,nx0+ndx*mW*.52,ny0,nx0+ndx*(mW*.52+arLen),ny0,col,4,'',1);
          U9.arrow(c,nx1-ndx*mW*.52,ny1,nx1-ndx*(mW*.52+arLen),ny1,col,4,'',1);
        }
        c.font=`bold ${12+force*5|0}px Tajawal`;c.fillStyle=col;c.textAlign='center';c.textBaseline='middle';
        c.fillText(isAttract?'❤️ تجاذب':'💥 تنافر',(nx0+nx1)/2,Math.min(ny0,ny1)-40);
      }
    }

    _drawBarMagnet(c,nx0,ny0,mW,mH,m0.flipped);
    _drawBarMagnet(c,nx1,ny1,mW,mH,m1.flipped);
    c.font='12px Tajawal';c.fillStyle='rgba(80,100,150,.4)';c.textAlign='center';c.textBaseline='bottom';
    c.fillText('✋ اسحب مغناطيساً لتقريبه أو أبعده',w/2,h-6);
    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }
  draw();
}
// ══════════════════════════════════════════════════════════════
// 11-1 · TAB 2 — المواد المغناطيسية
// ══════════════════════════════════════════════════════════════
function simMagnets2() {
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  const ITEMS=[
    {id:'fe',label:'حديد',        icon:'🔩',magnetic:true},
    {id:'ni',label:'نيكل',        icon:'🪙',magnetic:true},
    {id:'co',label:'كوبالت',      icon:'⚙️', magnetic:true},
    {id:'pc',label:'مشبك فولاذ',  icon:'📎',magnetic:true},
    {id:'cu',label:'نحاس',        icon:'🪛', magnetic:false},
    {id:'al',label:'ألمنيوم',     icon:'✈️', magnetic:false},
    {id:'au',label:'ذهب',         icon:'💛',magnetic:false},
    {id:'ag',label:'فضة',         icon:'🥈',magnetic:false},
    {id:'wd',label:'خشب',         icon:'🪵', magnetic:false},
    {id:'gl',label:'زجاج',        icon:'🥃', magnetic:false},
    {id:'pl',label:'بلاستيك',     icon:'📏', magnetic:false},
    {id:'wa',label:'ماء',         icon:'💧',magnetic:false},
  ];

  if(!simState.mag2) simState.mag2={tested:{},dragId:null,dragX:0,dragY:0,ox:0,oy:0,t:0};
  const S=simState.mag2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧲 اختبار المواد</div>
      <div style="font-size:13px;color:#666">اسحب أي مادة نحو المغناطيس</div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">📋 نتائجك</div>
      <div id="mag2res" style="font-size:12px;line-height:1.9"></div>
    </div>
    <button onclick="simState.mag2.tested={};simState.mag2.dragId=null;document.getElementById('mag2res').innerHTML=''" style="width:100%;padding:8px;border-radius:8px;border:1.5px solid rgba(192,57,43,.2);background:rgba(192,57,43,.06);color:#C0392B;font-family:Tajawal;font-size:13px;cursor:pointer">🔄 إعادة</button>
    <div class="info-box" style="font-size:12px;margin-top:8px">
      ✅ مغناطيسية: حديد · نيكل · كوبالت · مشبك فولاذ<br>
      ❌ غير مغناطيسية: نحاس · ألمنيوم · ذهب · فضة · خشب · زجاج · بلاستيك · ماء
    </div>`);

  function updRes(){
    const el=document.getElementById('mag2res'); if(!el)return;
    const html=Object.entries(S.tested).map(([id,mag])=>{
      const it=ITEMS.find(x=>x.id===id);
      return `<div>${it.icon} ${it.label}: <strong style="color:${mag?'#27AE60':'#E74C3C'}">${mag?'✅ مغناطيسية':'❌ غير مغناطيسية'}</strong></div>`;
    }).join('');
    el.innerHTML=html||'<span style="color:#aaa">لم يُختبر شيء بعد</span>';
  }

  function gp(e){const r=cv.getBoundingClientRect(),sc=cv.width/r.width,s=e.touches?e.touches[0]:e;return{x:(s.clientX-r.left)*sc,y:(s.clientY-r.top)*sc};}
  function getPos(i,w,h){const cols=4,iw=Math.min(w*.22,84),ih=iw*.85,gap=7,total=cols*(iw+gap)-gap,sx=(w-total)/2+iw/2,row=Math.floor(i/cols),col=i%cols;return{x:sx+col*(iw+gap),y:h*.57+row*(ih+gap)+ih/2,iw,ih};}

  cv.addEventListener('mousedown',e=>{const p=gp(e),w=cv.width,h=cv.height;ITEMS.forEach((it,i)=>{if(S.tested[it.id]!==undefined)return;const pos=getPos(i,w,h);if(Math.abs(p.x-pos.x)<pos.iw/2&&Math.abs(p.y-pos.y)<pos.ih/2){S.dragId=it.id;S.ox=p.x-pos.x;S.oy=p.y-pos.y;}});});
  cv.addEventListener('mousemove',e=>{if(!S.dragId)return;const p=gp(e);S.dragX=p.x-S.ox;S.dragY=p.y-S.oy;});
  cv.addEventListener('mouseup',e=>{
    if(!S.dragId)return;
    const w=cv.width,h=cv.height,mx=w*.5,my=h*.22;
    if(Math.hypot(S.dragX-mx,S.dragY-my)<w*.18){
      const it=ITEMS.find(x=>x.id===S.dragId);
      S.tested[S.dragId]=it.magnetic; updRes();
      try{if(it.magnetic)U9Sound.win();else U9Sound.ping(220,.2,.2);}catch(ex){}
    }
    S.dragId=null;
  });
  cv.addEventListener('touchstart',e=>{e.preventDefault();const t=e.touches[0];cv.dispatchEvent(new MouseEvent('mousedown',{clientX:t.clientX,clientY:t.clientY}));},{passive:false});
  cv.addEventListener('touchmove',e=>{e.preventDefault();const t=e.touches[0];cv.dispatchEvent(new MouseEvent('mousemove',{clientX:t.clientX,clientY:t.clientY}));},{passive:false});
  cv.addEventListener('touchend',e=>{e.preventDefault();cv.dispatchEvent(new MouseEvent('mouseup'));});

  function draw(){
    if(currentSim!=='magnets'||currentTab!==1)return;
    S.t+=.04;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle='#F2F6FF'; c.fillRect(0,0,w,h);
    U9.grid(c,w,h,'rgba(100,130,200,0.07)',44);

    // Horseshoe magnet
    const mx=w*.5,my=h*.22,mR=Math.min(w*.24,115),mT=Math.min(h*.10,44);
    c.strokeStyle='#777'; c.lineWidth=mT*.9; c.lineCap='round';
    c.beginPath(); c.arc(mx,my,mR,Math.PI,0); c.stroke();
    // poles
    c.fillStyle='#C0392B'; c.beginPath(); c.roundRect(mx-mR-mT*.45,my-mT*.2,mT*.9,mT*.55,4); c.fill();
    c.fillStyle='#2980B9'; c.beginPath(); c.roundRect(mx+mR-mT*.45,my-mT*.2,mT*.9,mT*.55,4); c.fill();
    c.font=`bold ${mT*.42|0}px Tajawal`; c.textAlign='center'; c.textBaseline='middle'; c.fillStyle='white';
    c.fillText('ش',mx-mR,my+mT*.2); c.fillText('ج',mx+mR,my+mT*.2);

    // drop zone
    c.strokeStyle='rgba(26,143,168,.5)'; c.lineWidth=2; c.setLineDash([5,4]);
    c.beginPath(); c.ellipse(mx,my+mR*.6,mR*.42,mR*.25,0,0,Math.PI*2); c.stroke(); c.setLineDash([]);
    c.font='11px Tajawal'; c.fillStyle='rgba(26,143,168,.6)'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('أفلت هنا',mx,my+mR*.6);

    // tray
    c.fillStyle='rgba(225,235,248,.92)'; c.beginPath(); c.roundRect(0,h*.52,w,h*.48,0); c.fill();
    c.strokeStyle='rgba(100,130,200,.18)'; c.lineWidth=1; c.beginPath(); c.moveTo(0,h*.52); c.lineTo(w,h*.52); c.stroke();

    // items
    ITEMS.forEach((it,i)=>{
      if(S.dragId===it.id)return;
      if(S.tested[it.id]!==undefined){
        // show result at magnet
        return;
      }
      const pos=getPos(i,w,h);
      c.fillStyle='rgba(255,255,255,.97)'; c.strokeStyle='rgba(0,0,0,.1)'; c.lineWidth=1.5;
      c.shadowBlur=6; c.shadowColor='rgba(0,0,0,.1)';
      c.beginPath(); c.roundRect(pos.x-pos.iw/2,pos.y-pos.ih/2,pos.iw,pos.ih,12); c.fill(); c.stroke();
      c.shadowBlur=0;
      c.font=`${pos.iw*.40|0}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(it.icon,pos.x,pos.y-pos.ih*.10);
      c.font=`bold ${pos.iw*.19|0}px Tajawal`; c.fillStyle='#333'; c.textBaseline='bottom';
      c.fillText(it.label,pos.x,pos.y+pos.ih/2-3);
    });

    // show tested items near magnet
    const testedArr=Object.keys(S.tested);
    testedArr.forEach((id,i)=>{
      const it=ITEMS.find(x=>x.id===id), mag=S.tested[id];
      const tx=mx+(mag?-1:1)*(mR+50+i%4*30), ty=my+(i<4?-30:10);
      c.font='20px serif'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(it.icon,tx,ty);
      if(mag){
        c.strokeStyle='#27AE60'; c.lineWidth=1.5; c.setLineDash([4,3]);
        c.beginPath(); c.moveTo(tx,ty); c.lineTo(mx-mR,my); c.stroke(); c.setLineDash([]);
      }
    });

    // dragged
    if(S.dragId){
      const it=ITEMS.find(x=>x.id===S.dragId),iw=92,ih=74;
      c.shadowBlur=18; c.shadowColor='rgba(26,143,168,.4)';
      c.fillStyle='rgba(255,255,255,.97)'; c.strokeStyle='#1A8FA8'; c.lineWidth=2.5;
      c.beginPath(); c.roundRect(S.dragX-iw/2,S.dragY-ih/2,iw,ih,12); c.fill(); c.stroke();
      c.shadowBlur=0;
      c.font='32px serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(it.icon,S.dragX,S.dragY-8);
      c.font='bold 12px Tajawal'; c.fillStyle='#333'; c.textBaseline='bottom'; c.fillText(it.label,S.dragX,S.dragY+ih/2-2);
    }

    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 11-3 · TAB 1 — خطوط المجال المغناطيسي
// ══════════════════════════════════════════════════════════════
function simMagField1() {
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  if(!simState.mf1) simState.mf1={mode:'single',t:0};
  const S=simState.mf1;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧲 نوع التركيب</div>
      <button class="ctrl-btn${S.mode==='single'?' active':''}" onclick="simState.mf1.mode='single';simMagField1()">🔴 مغناطيس واحد</button>
      <button class="ctrl-btn${S.mode==='attract'?' active':''}" onclick="simState.mf1.mode='attract';simMagField1()">❤️ قطبان مختلفان</button>
      <button class="ctrl-btn${S.mode==='repel'?' active':''}" onclick="simState.mf1.mode='repel';simMagField1()">💥 قطبان متشابهان</button>
    </div>
    <div class="info-box" style="font-size:13px;line-height:1.9">
      📌 خطوط المجال:<br>
      • تخرج من القطب <strong>الشمالي 🔴</strong><br>
      • تدخل إلى القطب <strong>الجنوبي 🔵</strong><br>
      • الخطوط المتقاربة = مجال أقوى
    </div>`);

  function fieldLines(sources,w,h){
    // sources: [{cx,cy,sign}] sign=+1 for N pole, -1 for S pole
    // Draw lines starting from each N pole, following field
    sources.forEach(src=>{
      if(src.sign<0) return;
      const N=20;
      for(let li=0;li<N;li++){
        const a0=(li/N)*Math.PI*2;
        let px=src.cx+Math.cos(a0)*22, py=src.cy+Math.sin(a0)*22;
        c.beginPath(); c.moveTo(px,py);
        let steps=0;
        for(let s=0;s<180;s++){
          let fx=0,fy=0;
          sources.forEach(s2=>{
            const dx=px-s2.cx, dy=py-s2.cy;
            const d=Math.max(18,Math.hypot(dx,dy));
            fx+=s2.sign*dx/(d*d*d)*9000;
            fy+=s2.sign*dy/(d*d*d)*9000;
          });
          const fm=Math.hypot(fx,fy)||1;
          px+=fx/fm*4.5; py+=fy/fm*4.5;
          steps++;
          // stop if we hit an S pole (within 22px)
          let hitS=false;
          sources.forEach(s2=>{ if(s2.sign<0&&Math.hypot(px-s2.cx,py-s2.cy)<22) hitS=true; });
          if(hitS||px<2||px>w-2||py<2||py>h-2) break;
          c.lineTo(px,py);
        }
        const alpha=0.12+(li%5===0?0.2:li%3===0?0.1:0.04);
        c.strokeStyle=`rgba(26,143,168,${alpha})`; c.lineWidth=1.5; c.stroke();
      }
    });
  }

  function draw(){
    if(currentSim!=='magfield'||currentTab!==0)return;
    S.t+=.03;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle='#F5F0FF'; c.fillRect(0,0,w,h);
    U9.grid(c,w,h,'rgba(130,100,200,0.06)',44);

    const mW=Math.min(w*.2,105), mH=Math.min(h*.09,40);
    const cy2=h*.46;

    if(S.mode==='single'){
      const cx=w*.5;
      // مغناطيس واحد: N يمين (+), S يسار (-)
      fieldLines([{cx:cx+mW*0.26,cy:cy2,sign:1},{cx:cx-mW*0.26,cy:cy2,sign:-1}],w,h);
      _drawBarMagnet(c,cx,cy2,mW,mH,false);
      U9.txt(c,'مغناطيس واحد',w/2,h*.12,'#6C3483',14,true);

    } else if(S.mode==='attract'){
      // m1 (يسار): S يسار | N يمين  ←→  m2 (يمين) مقلوب: N يسار | S يمين
      // القطبان المتقابلان: N(m1) يواجه N(m2 left)... لا — نريد N يواجه S
      // m1 flipped=false: left=S, right=N
      // m2 flipped=true:  left=N, right=S
      // الوجه: N(m1 right) يواجه N(m2 left) ← هذا خاطئ!
      // الصحيح للتجاذب: N(m1 right) يواجه S(m2 left)
      // إذاً m2 flipped=false أيضاً لكن مرآة → left=S, right=N
      // نضع m1 على اليسار وm2 على اليمين، كلاهما flipped=false
      // m1: cx1, N على cx1+mW/4 (يمين m1)
      // m2: cx2, S على cx2-mW/4 (يسار m2) ← هذا يعني m2 له S على يساره = flipped=false
      // لكن _drawBarMagnet(flipped=false): left=S(ج), right=N(ش)
      // إذاً cx2 left = S → يواجه cx1 right = N ✓ تجاذب صح!
      const gap = mW*0.1; // فجوة صغيرة بين المغناطيسَين
      const cx1=w*.5-mW/2-gap/2, cx2=w*.5+mW/2+gap/2;
      fieldLines([
        {cx:cx1+mW*0.26, cy:cy2, sign:1},   // N m1 (يمين m1، يواجه S m2)
        {cx:cx1-mW*0.26, cy:cy2, sign:-1},   // S m1 (يسار m1، بعيد)
        {cx:cx2-mW*0.26, cy:cy2, sign:-1},   // S m2 (يسار m2، يواجه N m1) ✓
        {cx:cx2+mW*0.26, cy:cy2, sign:1}    // N m2 (يمين m2، بعيد)
      ],w,h);
      _drawBarMagnet(c,cx1,cy2,mW,mH,false);
      _drawBarMagnet(c,cx2,cy2,mW,mH,false);
      U9.txt(c,'قطبان مختلفان — تجاذب ❤️',w/2,h*.12,'#27AE60',14,true);
      c.fillStyle='#27AE60'; c.font='bold 11px Tajawal'; c.textAlign='center';
      c.fillText('ش → ج',w/2,cy2-mH*0.85);

    } else {
      // قطبان متشابهان: m1 N يمين يواجه m2 N يسار → تنافر
      // m1 flipped=false: right=N; m2 flipped=true: left=N
      const gap = mW*1.0;
      const cx1=w*.5-mW/2-gap/2, cx2=w*.5+mW/2+gap/2;
      fieldLines([
        {cx:cx1+mW*0.26, cy:cy2, sign:1},   // N m1 (يمين، يواجه N m2)
        {cx:cx1-mW*0.26, cy:cy2, sign:-1},  // S m1 (يسار)
        {cx:cx2-mW*0.26, cy:cy2, sign:1},   // N m2 (يسار، يواجه N m1) → تنافر!
        {cx:cx2+mW*0.26, cy:cy2, sign:-1}   // S m2 (يمين)
      ],w,h);
      _drawBarMagnet(c,cx1,cy2,mW,mH,false);
      _drawBarMagnet(c,cx2,cy2,mW,mH,true);
      U9.txt(c,'قطبان متشابهان — تنافر 💥',w/2,h*.12,'#E74C3C',14,true);
      // repel arrows
      c.strokeStyle='rgba(231,76,60,0.5)'; c.lineWidth=2;
      c.beginPath(); c.moveTo(cx1+mW*0.3+8,cy2); c.lineTo(cx1+mW*0.3+30,cy2); c.stroke();
      c.beginPath(); c.moveTo(cx2-mW*0.3-8,cy2); c.lineTo(cx2-mW*0.3-30,cy2); c.stroke();
      c.fillStyle='#E74C3C'; c.font='bold 11px Tajawal'; c.textAlign='center';
      c.fillText('ش ← ← ش',w/2,cy2-mH*0.85);
    }
    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 11-3 · TAB 2 — بوصلة تفاعلية
// ══════════════════════════════════════════════════════════════
function simMagField2() {
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  if(!simState.mf2) simState.mf2={magX:.5,magY:.45,flipped:false,drag:false,t:0};
  const S=simState.mf2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧭 بوصلة تفاعلية</div>
      <button class="ctrl-btn" onclick="simState.mf2.flipped=!simState.mf2.flipped">🔄 اقلب المغناطيس</button>
      <div style="font-size:13px;color:#666;margin-top:8px">اسحب المغناطيس وشاهد البوصلات</div>
    </div>
    <div class="info-box" style="font-size:13px;line-height:1.9">
      🧭 إبرة البوصلة (الحمراء) تشير<br>
      دائماً نحو القطب <strong>الجنوبي</strong><br>
      للمغناطيس
    </div>`);

  function gp(e){const r=cv.getBoundingClientRect(),sc=cv.width/r.width,s=e.touches?e.touches[0]:e;return{x:(s.clientX-r.left)*sc,y:(s.clientY-r.top)*sc};}
  cv.addEventListener('mousedown',e=>{const p=gp(e),w=cv.width,h=cv.height;if(Math.hypot(p.x-S.magX*w,p.y-S.magY*h)<55){S.drag=true;S.ox=p.x-S.magX*w;S.oy=p.y-S.magY*h;}});
  cv.addEventListener('mousemove',e=>{if(!S.drag)return;const p=gp(e),w=cv.width,h=cv.height;S.magX=Math.max(.08,Math.min(.92,(p.x-S.ox)/w));S.magY=Math.max(.12,Math.min(.8,(p.y-S.oy)/h));});
  cv.addEventListener('mouseup',()=>S.drag=false);
  cv.addEventListener('touchstart',e=>{e.preventDefault();const t=e.touches[0];const p=gp(e);const w=cv.width,h=cv.height;if(Math.hypot(p.x-S.magX*w,p.y-S.magY*h)<55){S.drag=true;S.ox=p.x-S.magX*w;S.oy=p.y-S.magY*h;}},{passive:false});
  cv.addEventListener('touchmove',e=>{e.preventDefault();if(!S.drag)return;const p=gp(e);const w=cv.width,h=cv.height;S.magX=Math.max(.08,Math.min(.92,(p.x-S.ox)/w));S.magY=Math.max(.12,Math.min(.8,(p.y-S.oy)/h));},{passive:false});
  cv.addEventListener('touchend',()=>S.drag=false);

  function draw(){
    if(currentSim!=='magfield'||currentTab!==1)return;
    S.t+=.03;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle='#FFF9F0'; c.fillRect(0,0,w,h);
    U9.grid(c,w,h,'rgba(200,160,80,0.07)',50);

    const mx=S.magX*w, my=S.magY*h;
    const mW=Math.min(w*.2,105), mH=Math.min(h*.09,40);
    // south pole X
    const southX = S.flipped ? mx+mW/2 : mx-mW/2;

    // compass grid
    const cols=5,rows=4;
    for(let r2=0;r2<rows;r2++) for(let col=0;col<cols;col++){
      const cx2=(col+.5)/cols*w, cy2=(r2+.5)/rows*h;
      if(Math.hypot(cx2-mx,cy2-my)<mW*.7) continue;
      const ang=Math.atan2(cy2-my,cx2-southX)+Math.PI;
      const R=15;
      c.fillStyle='rgba(255,255,255,.9)'; c.strokeStyle='#C8D8E8'; c.lineWidth=1;
      c.beginPath(); c.arc(cx2,cy2,R,0,Math.PI*2); c.fill(); c.stroke();
      // red half (N pole of compass)
      c.fillStyle='#E74C3C'; c.beginPath();
      c.moveTo(cx2+Math.cos(ang)*R*.82,cy2+Math.sin(ang)*R*.82);
      c.lineTo(cx2+Math.cos(ang+2.5)*R*.3,cy2+Math.sin(ang+2.5)*R*.3);
      c.lineTo(cx2+Math.cos(ang-2.5)*R*.3,cy2+Math.sin(ang-2.5)*R*.3);
      c.closePath(); c.fill();
      // grey half
      c.fillStyle='#7F8C8D'; c.beginPath();
      c.moveTo(cx2+Math.cos(ang+Math.PI)*R*.82,cy2+Math.sin(ang+Math.PI)*R*.82);
      c.lineTo(cx2+Math.cos(ang+2.5)*R*.3,cy2+Math.sin(ang+2.5)*R*.3);
      c.lineTo(cx2+Math.cos(ang-2.5)*R*.3,cy2+Math.sin(ang-2.5)*R*.3);
      c.closePath(); c.fill();
    }

    _drawBarMagnet(c,mx,my,mW,mH,S.flipped);
    U9.txt(c,'✋ اسحب المغناطيس',w/2,h-8,'rgba(100,100,100,.45)',12,true);
    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 11-4 · TAB 1 — اصنع كهرومغناطيساً
// ══════════════════════════════════════════════════════════════
function simElectromagnet1() {
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  if(!simState.em1) simState.em1={coils:5,voltage:6,on:false,t:0};
  const S=simState.em1;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔌 التشغيل</div>
      <button class="ctrl-btn play" id="em1btn" onclick="simState.em1.on=!simState.em1.on;document.getElementById('em1btn').textContent=simState.em1.on?'⏹ إيقاف':'▶ تشغيل'">▶ تشغيل</button>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🔁 اللفّات: <span class="ctrl-val" id="em1c">${S.coils}</span></div>
      <input type="range" min="1" max="15" value="${S.coils}" oninput="simState.em1.coils=+this.value;document.getElementById('em1c').textContent=this.value">
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🔋 الجهد: <span class="ctrl-val" id="em1v">${S.voltage}</span> V</div>
      <input type="range" min="1" max="12" step="1" value="${S.voltage}" oninput="simState.em1.voltage=+this.value;document.getElementById('em1v').textContent=this.value">
    </div>
    <div class="info-box" style="font-size:13px">
      💪 القوة ≈ <strong id="em1f">${S.coils*S.voltage}</strong> وحدة<br>
      اللفّات ↑ أو الجهد ↑ = قوة أكبر
    </div>`);

  function updF(){ const el=document.getElementById('em1f'); if(el) el.textContent=S.on?S.coils*S.voltage:0; }

  function draw(){
    if(currentSim!=='electromagnet'||currentTab!==0)return;
    S.t+=.05; updF();
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#EEF6FF'); bg.addColorStop(1,'#E4F0FF');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    const coreX=w*.45, coreY=h*.45, coreW=w*.32, coreH=h*.07;
    // iron core
    const cg=c.createLinearGradient(0,coreY-coreH/2,0,coreY+coreH/2);
    cg.addColorStop(0,'#9EAAB8'); cg.addColorStop(.5,'#E8EEF4'); cg.addColorStop(1,'#7A8A98');
    c.fillStyle=cg; c.beginPath(); c.roundRect(coreX-coreW/2,coreY-coreH/2,coreW,coreH,6); c.fill();
    c.strokeStyle='#8090A0'; c.lineWidth=1.5; c.stroke();
    c.font='11px Tajawal'; c.fillStyle='#667'; c.textAlign='center'; c.textBaseline='top';
    c.fillText('نواة حديدية',coreX,coreY+coreH/2+4);

    // coils
    const nC=Math.min(S.coils,14);
    for(let i=0;i<nC;i++){
      const t2=i/nC;
      const ccx=coreX-coreW/2+t2*coreW+coreW/nC/2;
      const rx=coreW/nC*.44, ry=coreH*.72;
      c.strokeStyle=S.on?'#E67E22':'#95A5A6'; c.lineWidth=3;
      c.beginPath(); c.ellipse(ccx,coreY,rx,ry,0,0,Math.PI*2); c.stroke();
      if(S.on){
        const ft=((S.t*1.8+i*.4)%1);
        const fx=ccx+Math.cos(ft*Math.PI*2)*rx, fy=coreY+Math.sin(ft*Math.PI*2)*ry;
        c.fillStyle='rgba(255,200,50,.85)'; c.beginPath(); c.arc(fx,fy,3,0,Math.PI*2); c.fill();
      }
    }

    // battery left
    _drawBattery(c,w*.12,coreY,S.voltage);
    // wires
    const wc=S.on?'#E67E22':'#999';
    c.strokeStyle=wc; c.lineWidth=3; c.lineCap='round';
    c.beginPath(); c.moveTo(w*.12,coreY-32); c.lineTo(w*.12,coreY-h*.18); c.lineTo(coreX-coreW/2,coreY-h*.18); c.stroke();
    c.beginPath(); c.moveTo(w*.12,coreY+32); c.lineTo(w*.12,coreY+h*.18); c.lineTo(coreX-coreW/2,coreY+h*.18); c.stroke();

    // field from N pole (right)
    if(S.on){
      const nX=coreX+coreW/2+8;
      const fLen=Math.min(w*.22*(S.coils*S.voltage/80),w*.24);
      for(let fi=-2;fi<=2;fi++){
        const fy2=coreY+fi*coreH*.45;
        c.strokeStyle=`rgba(231,76,60,${.35+fLen/(w*.24)*.4})`; c.lineWidth=1.5; c.setLineDash([4,4]);
        c.beginPath(); c.moveTo(nX,fy2); c.lineTo(nX+fLen,fy2); c.stroke(); c.setLineDash([]);
        c.fillStyle=`rgba(231,76,60,.6)`;
        c.beginPath(); c.moveTo(nX+fLen+7,fy2); c.lineTo(nX+fLen,fy2-5); c.lineTo(nX+fLen,fy2+5); c.closePath(); c.fill();
      }
      c.font='bold 13px Tajawal'; c.textAlign='center'; c.fillStyle='#C0392B';
      c.fillText('ش',coreX+coreW/2+12,coreY-coreH-10);
      c.fillStyle='#2980B9'; c.fillText('ج',coreX-coreW/2-12,coreY-coreH-10);
      // attracted items
      if(S.coils*S.voltage>10){
        const pullX=coreX+coreW/2+fLen+22;
        ['🔩','📎','🔧'].forEach((it,i)=>{
          c.font='20px serif'; c.textAlign='center'; c.textBaseline='middle';
          c.fillText(it,pullX+i*5,coreY-24+i*22);
        });
      }
    }
    U9.txt(c,S.on?`لفّات:${S.coils} · جهد:${S.voltage}V · قوة:${S.coils*S.voltage}`:'⬆ اضغط تشغيل لتشغيل الكهرومغناطيس',w/2,h*.1,'#888',13,true);
    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 11-4 · TAB 2 — مقارنة قوة الكهرومغناطيس
// ══════════════════════════════════════════════════════════════
function simElectromagnet2() {
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  if(!simState.em2) simState.em2={running:false,t:0};
  const S=simState.em2;

  const CFG=[
    {label:'٣ لفّات',  coils:3,  voltage:6, col:'#3498DB'},
    {label:'٨ لفّات',  coils:8,  voltage:6, col:'#E67E22'},
    {label:'١٥ لفّة',  coils:15, voltage:6, col:'#E74C3C'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⚖️ مقارنة القوى</div>
      <div style="font-size:13px;color:#666">نفس الجهد (6V) — عدد لفّات مختلف</div>
    </div>
    <button class="ctrl-btn play" onclick="simState.em2.running=true;simState.em2.t=0">▶ ابدأ التجربة</button>
    <button class="ctrl-btn reset" onclick="simState.em2.running=false;simState.em2.t=0">↺ إعادة</button>
    <div class="info-box" style="font-size:13px;line-height:1.9">
      ${CFG.map(g=>`<span style="color:${g.col}">●</span> ${g.label} → قوة ${g.coils*g.voltage}`).join('<br>')}
    </div>`);

  function draw(){
    if(currentSim!=='electromagnet'||currentTab!==1)return;
    if(S.running) S.t+=.018;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle='#F8F5FF'; c.fillRect(0,0,w,h);
    U9.grid(c,w,h,'rgba(150,100,200,0.06)',45);

    const lW=w/3, coreH=Math.min(h*.07,36);
    CFG.forEach((cfg,i)=>{
      const cx2=lW*i+lW/2, coreY=h*.42, coreW=lW*.55;
      const force=cfg.coils*cfg.voltage, maxF=15*6;
      const frac=Math.min(1,force/maxF);

      // core
      const cg2=c.createLinearGradient(0,coreY-coreH/2,0,coreY+coreH/2);
      cg2.addColorStop(0,'#B0BEC5'); cg2.addColorStop(.5,'#ECEFF1'); cg2.addColorStop(1,'#90A4AE');
      c.fillStyle=cg2; c.beginPath(); c.roundRect(cx2-coreW/2,coreY-coreH/2,coreW,coreH,5); c.fill();
      c.strokeStyle='#9EAAB8'; c.lineWidth=1; c.stroke();

      // coils
      const nC=Math.min(cfg.coils,12);
      for(let ci=0;ci<nC;ci++){
        const ccx=cx2-coreW/2+(ci/nC)*coreW+coreW/nC/2;
        c.strokeStyle=cfg.col; c.lineWidth=2.2;
        c.beginPath(); c.ellipse(ccx,coreY,coreW/nC*.42,coreH*.7,0,0,Math.PI*2); c.stroke();
      }
      U9.txt(c,cfg.label,cx2,coreY-coreH/2-14,cfg.col,12,true);

      // bar
      const gbH=h*.28, gbY=h*.82, bW=lW*.36;
      const bh=Math.max(4,frac*gbH*Math.min(S.t*1.8,1));
      U9.rect(c,cx2-bW/2,gbY-bh,bW,bh,cfg.col+'CC',cfg.col,6,2);
      if(bh>12) U9.txt(c,force+' وحدة',cx2,gbY-bh-10,cfg.col,11,true);
      U9.txt(c,cfg.label,cx2,gbY+10,cfg.col,10,true);

      // attracted items
      if(S.running&&S.t>.4){
        const cnt=Math.floor(frac*4), pullP=Math.min(1,(S.t-.4)*.9);
        for(let ii=0;ii<cnt;ii++){
          const iy=h*.18-ii*16+(coreY-h*.18)*(1-pullP);
          c.font='13px serif'; c.textAlign='center'; c.textBaseline='middle';
          c.fillText('🔩',cx2+(ii%2===0?-10:10),iy);
        }
      }
    });
    U9.txt(c,'الجهد: 6V لجميع الكهرومغناطيسات',w/2,h*.1,'#888',13,true);
    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 11-6 · TAB 1 — الكهرباء الساكنة
// ══════════════════════════════════════════════════════════════
function simStaticElec1() {
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  if(!simState.se1) simState.se1={charge:0,t:0,papers:Array.from({length:8},(_,i)=>({x:.38+i%4*.07,y:.65+Math.floor(i/4)*.07,liftT:0,lifted:false}))};
  const S=simState.se1;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🎈 الكهرباء الساكنة</div>
      <button class="ctrl-btn play" onclick="window._rub()">🎈 احتكِ بالشعر (اضغط مرات)</button>
      <div id="seQ" style="text-align:center;font-size:20px;font-weight:800;margin-top:8px;color:#8E44AD">الشحنة: محايد</div>
    </div>
    <button class="ctrl-btn reset" onclick="simState.se1.charge=0;simState.se1.papers.forEach(p=>{p.lifted=false;p.liftT=0});document.getElementById('seQ').textContent='الشحنة: محايد'">↺ إعادة</button>
    <div class="info-box" style="font-size:13px;line-height:1.9">
      الاحتكاك ينقل إلكترونات من<br>
      الشعر → البالون<br>
      البالون يصبح <strong>➖ سالب</strong><br>
      ويجذب الأوراق المحايدة
    </div>`);

  window._rub=function(){
    S.charge=Math.min(5,S.charge+1);
    const el=document.getElementById('seQ');
    if(el) el.textContent='الشحنة: '+'➖'.repeat(S.charge);
    try{U9Sound.ping(280+S.charge*60,.1,.12);}catch(e){}
    S.papers.forEach((p,i)=>{if(i<S.charge*1.8) p.lifted=true;});
  };

  function draw(){
    if(currentSim!=='staticelec'||currentTab!==0)return;
    S.t+=.04;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle='#FFF8ED'; c.fillRect(0,0,w,h);
    U9.grid(c,w,h,'rgba(200,160,50,0.07)',45);

    // table
    c.fillStyle='#C8903A'; c.beginPath(); c.roundRect(w*.28,h*.7,w*.44,h*.05,4); c.fill();

    // balloon
    const bx=w*.28, by=h*.42, bR=42, bo=Math.sin(S.t*1.8)*4;
    if(S.charge>0){c.shadowBlur=22;c.shadowColor='rgba(142,68,173,.35)';}
    c.fillStyle=S.charge>0?'#9B59B6':'#BB85D8';
    c.beginPath(); c.ellipse(bx,by+bo,bR*.85,bR,0,0,Math.PI*2); c.fill();
    c.shadowBlur=0;
    c.strokeStyle='#6C3483'; c.lineWidth=1.5; c.beginPath(); c.ellipse(bx,by+bo,bR*.85,bR,0,0,Math.PI*2); c.stroke();
    // string
    c.strokeStyle='#777'; c.lineWidth=1.5;
    c.beginPath(); c.moveTo(bx,by+bo+bR); c.bezierCurveTo(bx+8,by+bo+bR+25,bx-5,by+bo+bR+50,bx,by+bo+bR+72); c.stroke();
    // charge symbols
    if(S.charge>0){
      c.font='11px Arial'; c.fillStyle='#FF8888';
      for(let i=0;i<Math.min(S.charge*2,10);i++){
        const a=(i/10)*Math.PI*2+S.t*.3;
        c.fillText('➖',bx+Math.cos(a)*bR*.75,by+bo+Math.sin(a)*bR*.88);
      }
    }
    c.font='bold 12px Tajawal'; c.fillStyle='white'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('🎈',bx,by+bo);

    // person head
    c.font='52px serif'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('👤',w*.62,h*.38);
    // static hair if charged
    if(S.charge>2){
      for(let i=0;i<5;i++){
        const ha=-Math.PI/2+(i-2)*.28;
        c.strokeStyle='#7A5C3A'; c.lineWidth=2;
        c.beginPath(); c.moveTo(w*.62+Math.cos(ha)*18,h*.38-26);
        c.lineTo(w*.62+Math.cos(ha-.35)*(18+22),h*.38-26-Math.sin(Math.abs(ha))*22); c.stroke();
      }
    }

    // papers
    S.papers.forEach(p=>{
      if(p.lifted) p.liftT=Math.min(1,(p.liftT||0)+.025);
      const ty=p.lifted?(h*.52+(by+bo-h*.52)*p.liftT):(h*p.y);
      c.fillStyle='#FFF9C4'; c.strokeStyle='#E8C030'; c.lineWidth=1;
      c.beginPath(); c.roundRect(p.x*w-9,ty-5,18,11,2); c.fill(); c.stroke();
    });

    U9.txt(c,'اضغط زر الاحتكاك عدة مرات ☝️',w/2,h-.08*h,'rgba(120,80,20,.5)',12,true);
    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 11-6 · TAB 2 — التجاذب والتنافر بين الشحنات
// ══════════════════════════════════════════════════════════════
function simStaticElec2() {
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  if(!simState.se2) simState.se2={q1:'pos',q2:'neg',balls:[{x:.3,y:.45},{x:.7,y:.45}],drag:-1,ox:0,oy:0,t:0};
  const S=simState.se2;

  function rebuild(){
    controls(`
      <div class="ctrl-section">
        <div class="ctrl-label">⚡ الكرة اليمنى</div>
        <button class="ctrl-btn${S.q1==='pos'?' active':''}" onclick="simState.se2.q1='pos';window._se2rebuild()" style="${S.q1==='pos'?'background:#C0392B;color:#fff':''}">➕ موجبة</button>
        <button class="ctrl-btn${S.q1==='neg'?' active':''}" onclick="simState.se2.q1='neg';window._se2rebuild()" style="${S.q1==='neg'?'background:#2980B9;color:#fff':''}">➖ سالبة</button>
      </div>
      <div class="ctrl-section">
        <div class="ctrl-label">⚡ الكرة اليسرى</div>
        <button class="ctrl-btn${S.q2==='pos'?' active':''}" onclick="simState.se2.q2='pos';window._se2rebuild()" style="${S.q2==='pos'?'background:#C0392B;color:#fff':''}">➕ موجبة</button>
        <button class="ctrl-btn${S.q2==='neg'?' active':''}" onclick="simState.se2.q2='neg';window._se2rebuild()" style="${S.q2==='neg'?'background:#2980B9;color:#fff':''}">➖ سالبة</button>
      </div>
      <div class="info-box" style="font-size:13px;line-height:1.9">
        ➕ + ➖ = <strong style="color:#27AE60">تجاذب ❤️</strong><br>
        ➕ + ➕ = <strong style="color:#E74C3C">تنافر 💥</strong><br>
        ➖ + ➖ = <strong style="color:#E74C3C">تنافر 💥</strong><br>
        <em style="color:#888">اسحب الكرات للتقريب</em>
      </div>`);
  }
  window._se2rebuild=rebuild;
  rebuild();

  function gp(e){const r=cv.getBoundingClientRect(),sc=cv.width/r.width,s=e.touches?e.touches[0]:e;return{x:(s.clientX-r.left)*sc,y:(s.clientY-r.top)*sc};}
  function down(e){e.preventDefault();const p=gp(e),w=cv.width,h=cv.height;S.balls.forEach((b,i)=>{if(Math.hypot(p.x-b.x*w,p.y-b.y*h)<34){S.drag=i;S.ox=p.x-b.x*w;S.oy=p.y-b.y*h;}});}
  function move(e){if(S.drag<0)return;e.preventDefault();const p=gp(e),w=cv.width,h=cv.height;S.balls[S.drag].x=Math.max(.07,Math.min(.93,(p.x-S.ox)/w));S.balls[S.drag].y=Math.max(.12,Math.min(.82,(p.y-S.oy)/h));}
  function up(){S.drag=-1;}
  cv.addEventListener('mousedown',down);cv.addEventListener('mousemove',move);cv.addEventListener('mouseup',up);
  cv.addEventListener('touchstart',down,{passive:false});cv.addEventListener('touchmove',move,{passive:false});cv.addEventListener('touchend',up);

  function draw(){
    if(currentSim!=='staticelec'||currentTab!==1)return;
    S.t+=.04;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle='#F0F8FF'; c.fillRect(0,0,w,h);
    U9.grid(c,w,h,'rgba(100,130,200,0.07)',44);

    const b0=S.balls[0],b1=S.balls[1];
    const x0=b0.x*w,y0=b0.y*h,x1=b1.x*w,y1=b1.y*h;
    const dist=Math.hypot(x1-x0,y1-y0);
    const attract=(S.q1!==S.q2);

    if(dist<w*.6){
      const force=Math.max(0,1-dist/(w*.6));
      const col=attract?'#27AE60':'#E74C3C';
      c.strokeStyle=col+Math.round(force*180).toString(16).padStart(2,'0');
      c.lineWidth=force*5; c.setLineDash([6,4]);
      c.beginPath(); c.moveTo(x0,y0); c.lineTo(x1,y1); c.stroke(); c.setLineDash([]);
      if(force>.06){
        c.font=`bold ${12+force*7|0}px Tajawal`; c.fillStyle=col; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(attract?'❤️ تجاذب':'💥 تنافر',(x0+x1)/2,(y0+y1)/2-26);
      }
    }

    [[x0,y0,S.q1,'١'],[x1,y1,S.q2,'٢']].forEach(([bx,by,q,lbl])=>{
      const col=q==='pos'?'#C0392B':'#2980B9';
      const grd=c.createRadialGradient(bx-9,by-9,2,bx,by,30);
      grd.addColorStop(0,q==='pos'?'#FF8888':'#5DA8E8'); grd.addColorStop(1,col);
      c.shadowBlur=16; c.shadowColor=col+'88';
      c.fillStyle=grd; c.beginPath(); c.arc(bx,by,30,0,Math.PI*2); c.fill();
      c.shadowBlur=0;
      c.strokeStyle=col; c.lineWidth=2.5; c.beginPath(); c.arc(bx,by,30,0,Math.PI*2); c.stroke();
      c.font='bold 20px Arial'; c.fillStyle='white'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(q==='pos'?'➕':'➖',bx,by-5);
      c.font='11px Tajawal'; c.textBaseline='top'; c.fillStyle=col; c.fillText('كرة '+lbl,bx,by+34);
    });

    U9.txt(c,'✋ اسحب الكرات',w/2,h-8,'rgba(80,100,140,.45)',12,true);
    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 11-9 · TAB 1 — الدائرة المتسلسلة
// ══════════════════════════════════════════════════════════════
function simCircuit8Series() {
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  if(!simState.c8s) simState.c8s={bulbs:[true,true,true],voltage:9,t:0};
  const S=simState.c8s;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔋 الجهد: <span class="ctrl-val" id="c8sV">${S.voltage}</span> V</div>
      <input type="range" min="3" max="12" step="3" value="${S.voltage}" oninput="simState.c8s.voltage=+this.value;document.getElementById('c8sV').textContent=this.value">
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">💡 افصل المصابيح</div>
      ${[0,1,2].map(i=>`<button class="ctrl-btn" onclick="simState.c8s.bulbs[${i}]=!simState.c8s.bulbs[${i}]">💡 مصباح ${['١','٢','٣'][i]}</button>`).join('')}
    </div>
    <div class="info-box" style="font-size:13px;line-height:1.9">
      ⚠️ في التسلسل:<br>
      إيقاف <strong>أي</strong> مصباح<br>
      = الكل ينطفئ!<br>
      <em style="color:#888">مسار واحد للتيار</em>
    </div>`);

  function draw(){
    if(currentSim!=='circuit8'||currentTab!==0)return;
    S.t+=.04;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle='#F8F4FF'; c.fillRect(0,0,w,h);
    U9.grid(c,w,h,'rgba(150,100,200,0.06)',44);

    const allOn=S.bulbs.every(b=>b);
    const I=allOn?+(S.voltage/(S.bulbs.length*10)).toFixed(2):0;
    const wc=allOn?'#27AE60':'#999', lw=allOn?3:2;

    const top=h*.28,bot=h*.7,left=w*.1,right=w*.9;
    c.strokeStyle=wc; c.lineWidth=lw;
    [[left,top,right,top],[left,bot,right,bot],[left,top,left,bot],[right,top,right,bot]].forEach(([ax,ay,bx,by])=>{
      c.beginPath(); c.moveTo(ax,ay); c.lineTo(bx,by); c.stroke();
    });

    // electrons
    if(allOn){
      const path=[{x:left,y:top},{x:right,y:top},{x:right,y:bot},{x:left,y:bot}];
      const segs=path.map((p,i)=>({...p,...path[(i+1)%4]}));
      const totalL=(right-left)*2+(bot-top)*2;
      for(let ei=0;ei<5;ei++){
        const d=((S.t*.35+ei/5)%1)*totalL;
        let cum=0,ex=left,ey=top;
        for(let si=0;si<4;si++){
          const seg=si%2===0?(right-left):(bot-top);
          if(d<=cum+seg){const r2=(d-cum)/seg;
            const pts=[{x:left,y:top},{x:right,y:top},{x:right,y:bot},{x:left,y:bot}];
            ex=pts[si].x+(pts[(si+1)%4].x-pts[si].x)*r2;
            ey=pts[si].y+(pts[(si+1)%4].y-pts[si].y)*r2; break;}
          cum+=seg;
        }
        c.fillStyle='rgba(0,200,255,.8)'; c.beginPath(); c.arc(ex,ey,5,0,Math.PI*2); c.fill();
      }
    }

    // battery
    _drawBattery(c,left,( top+bot)/2,S.voltage);

    // bulbs
    [w*.38,w*.58,w*.78].forEach((bx,i)=>{
      _drawBulb(c,bx,top,S.bulbs[i]&&allOn,S.t);
      c.font='11px Tajawal'; c.fillStyle=S.bulbs[i]?'#555':'#C0392B'; c.textAlign='center'; c.textBaseline='top';
      c.fillText(S.bulbs[i]?'متصل':'مفصول',bx,top+30);
    });

    U9.txt(c,`الدائرة المتسلسلة · I = ${I} A`,w/2,h*.12,'#6C3483',14,true);
    if(!allOn) U9.txt(c,'⚠️ قطع التسلسل — الكل انطفأ!',w/2,h*.88,'#E74C3C',13,true);
    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 11-9 · TAB 2 — الدائرة المتوازية
// ══════════════════════════════════════════════════════════════
function simCircuit8Parallel() {
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  if(!simState.c8p) simState.c8p={bulbs:[true,true,true],voltage:9,t:0};
  const S=simState.c8p;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔋 الجهد: <span class="ctrl-val" id="c8pV">${S.voltage}</span> V</div>
      <input type="range" min="3" max="12" step="3" value="${S.voltage}" oninput="simState.c8p.voltage=+this.value;document.getElementById('c8pV').textContent=this.value">
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">💡 افصل المصابيح</div>
      ${[0,1,2].map(i=>`<button class="ctrl-btn" onclick="simState.c8p.bulbs[${i}]=!simState.c8p.bulbs[${i}]">💡 مصباح ${['١','٢','٣'][i]}</button>`).join('')}
    </div>
    <div class="info-box" style="font-size:13px;line-height:1.9">
      ✅ في التوازي:<br>
      كل مصباح على فرع <strong>مستقل</strong><br>
      إيقاف واحد لا يؤثر على الباقين!<br>
      <em style="color:#888">هكذا يوصَّل منزلك</em>
    </div>`);

  function draw(){
    if(currentSim!=='circuit8'||currentTab!==1)return;
    S.t+=.04;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle='#F4FFF6'; c.fillRect(0,0,w,h);
    U9.grid(c,w,h,'rgba(50,150,80,0.06)',44);

    const railTop=h*.28,railBot=h*.7,mainLeft=w*.1;
    const brXs=[w*.42,w*.62,w*.82];

    // main rails
    c.strokeStyle='#888'; c.lineWidth=3;
    c.beginPath(); c.moveTo(mainLeft,railTop); c.lineTo(brXs[2]+18,railTop); c.stroke();
    c.beginPath(); c.moveTo(mainLeft,railBot); c.lineTo(brXs[2]+18,railBot); c.stroke();
    c.beginPath(); c.moveTo(mainLeft,railTop); c.lineTo(mainLeft,railBot); c.stroke();

    // battery
    _drawBattery(c,mainLeft,(railTop+railBot)/2,S.voltage);

    // branches
    brXs.forEach((bx,i)=>{
      const on=S.bulbs[i];
      c.strokeStyle=on?'#27AE60':'#CCC'; c.lineWidth=on?2.5:1.5;
      c.beginPath(); c.moveTo(bx,railTop); c.lineTo(bx,railBot); c.stroke();
      _drawBulb(c,bx,(railTop+railBot)/2,on,S.t+i);
      // electron in branch
      if(on){
        const ft=((S.t*.45+i*.33)%1);
        const ey=railTop+ft*(railBot-railTop);
        c.fillStyle='rgba(0,200,100,.75)'; c.beginPath(); c.arc(bx,ey,4,0,Math.PI*2); c.fill();
      }
      c.font='11px Tajawal'; c.fillStyle=on?'#555':'#C0392B'; c.textAlign='center'; c.textBaseline='top';
      c.fillText(on?'متصل':'مفصول',bx,( railTop+railBot)/2+34);
    });

    const onCnt=S.bulbs.filter(b=>b).length;
    U9.txt(c,`الدائرة المتوازية · ${onCnt} مصابيح تضيء`,w/2,h*.12,'#1E8449',14,true);
    if(onCnt<3) U9.txt(c,'✅ الباقون يضيئون باستقلالية!',w/2,h*.88,'#27AE60',13,true);
    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 11-2 · TAB 1 — مقارنة أنواع المغناطيس (قياس القوة)
// ══════════════════════════════════════════════════════════════
function simMagCompare1() {
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.mc1) simState.mc1={selected:-1,results:[0,0,0],testing:false,t:0};
  const S=simState.mc1;
  const MAGS=[
    {name:'مغناطيس قضيب',  icon:'🔴', strength:3, col:'#E74C3C'},
    {name:'مغناطيس حدوة',  icon:'🧲', strength:7, col:'#E67E22'},
    {name:'نيوديميوم',      icon:'⬛', strength:12, col:'#2C3E50'},
  ];
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧲 اختر المغناطيس للاختبار</div>
      ${MAGS.map((m,i)=>`<button class="ctrl-btn${S.selected===i?' play':''}" onclick="simState.mc1.selected=${i};simState.mc1.testing=false;simState.mc1.t=0">${m.icon} ${m.name}</button>`).join('')}
    </div>
    <button class="ctrl-btn play" onclick="if(simState.mc1.selected>=0){simState.mc1.testing=true;simState.mc1.t=0}">▶ ابدأ الاختبار</button>
    <button class="ctrl-btn reset" onclick="simState.mc1.results=[0,0,0];simState.mc1.testing=false;simState.mc1.t=0">↺ إعادة الكل</button>
    <div class="info-box" style="font-size:12px;line-height:1.8">
      📎 نتائج المشابك:<br>
      ${MAGS.map((m,i)=>`<span style="color:${m.col}">${m.icon} ${m.name}: ${S.results[i]} مشبك</span>`).join('<br>')}
    </div>`);

  function draw(){
    if(currentSim!=='magcompare'||currentTab!==0)return;
    if(S.testing && S.selected>=0) S.t+=.025;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle='#F0F4F8'; c.fillRect(0,0,w,h);
    U9.grid(c,w,h,'rgba(100,150,200,0.05)',44);

    const mx=w*.35,my=h*.4;
    if(S.selected<0){
      U9.txt(c,'⬆ اختر مغناطيساً من القائمة',w/2,h*.5,'#888',14,true);
      animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
      return;
    }
    const mag=MAGS[S.selected];
    const prog=Math.min(1,S.t);
    // كتلة المغناطيس
    const mg=c.createLinearGradient(mx-36,my-18,mx+36,my+18);
    mg.addColorStop(0,mag.col+'DD'); mg.addColorStop(1,mag.col+'88');
    c.fillStyle=mg; c.beginPath(); c.roundRect(mx-36,my-18,72,36,8); c.fill();
    c.strokeStyle=mag.col; c.lineWidth=2; c.stroke();
    c.font='bold 22px serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(mag.icon,mx,my);
    c.font='11px Tajawal'; c.fillStyle=mag.col; c.textBaseline='top'; c.fillText(mag.name,mx,my+22);

    // مشابك تنجذب
    const cnt=Math.floor(prog*mag.strength);
    if(S.testing && prog>=1 && S.results[S.selected]===0) S.results[S.selected]=mag.strength;
    for(let i=0;i<cnt;i++){
      const ang=-Math.PI/2+(i/(mag.strength-1||1))*Math.PI;
      const r=72+i*8;
      const px2=mx+Math.cos(ang)*r, py2=my+Math.sin(ang)*r*0.5+10;
      c.font='16px serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('📎',px2,py2);
    }
    // شريط قوة
    const barW=w*.45,barH=14,bx=w*.5+20,by=h*.72;
    c.fillStyle='#E8E8E8'; c.beginPath(); c.roundRect(bx,by,barW,barH,7); c.fill();
    const pf=prog*mag.strength/12;
    const bg2=c.createLinearGradient(bx,0,bx+barW,0);
    bg2.addColorStop(0,'#27AE60'); bg2.addColorStop(.6,'#F39C12'); bg2.addColorStop(1,'#E74C3C');
    c.fillStyle=bg2; c.beginPath(); c.roundRect(bx,by,barW*pf,barH,7); c.fill();
    U9.txt(c,`${mag.icon} القوة: ${cnt} مشبك من أصل ${mag.strength}`,w*.72,by-14,mag.col,12,true);

    if(!S.testing) U9.txt(c,'⬆ اضغط "ابدأ الاختبار"',w/2,h*.85,'#888',12,true);
    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 11-2 · TAB 2 — اختبار المواد المغناطيسية
// ══════════════════════════════════════════════════════════════
function simMagCompare2() {
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.mc2) simState.mc2={dragId:null,dragX:0,dragY:0,ox:0,oy:0,tested:{},t:0};
  const S=simState.mc2;

  const ITEMS=[
    {id:'fe', name:'حديد',     icon:'🔩', mag:true},
    {id:'al', name:'ألومنيوم', icon:'✈️', mag:false},
    {id:'st', name:'فولاذ',   icon:'⚙️',  mag:true},
    {id:'cu', name:'نحاس',    icon:'🪛',  mag:false},
    {id:'pl', name:'بلاستيك', icon:'📏',  mag:false},
    {id:'ni', name:'نيكل',    icon:'🪙',  mag:true},
  ];

  function updControls(){
    const testedHTML = Object.entries(S.tested).map(([id,mag])=>{
      const it=ITEMS.find(x=>x.id===id);
      return `<div style="margin:3px 0">${it.icon} ${it.name}: <strong style="color:${mag?'#27AE60':'#E74C3C'}">${mag?'✅ مغناطيسية':'❌ غير مغناطيسية'}</strong></div>`;
    }).join('') || '<span style="color:#aaa;font-size:11px">اسحب مادة نحو المغناطيس</span>';

    controls(`
      <div class="ctrl-section">
        <div class="ctrl-label">🔬 اختبار المواد</div>
        <div style="font-size:12px;color:#666">اسحب أي مادة نحو المغناطيس</div>
      </div>
      <div class="ctrl-section">
        <div class="ctrl-label">📋 النتائج</div>
        <div id="mc2res" style="font-size:12px;line-height:1.9">${testedHTML}</div>
      </div>
      <button onclick="simState.mc2.tested={};simState.mc2.dragId=null;simMagCompare2()" style="width:100%;padding:8px;border-radius:8px;border:1.5px solid rgba(192,57,43,.2);background:rgba(192,57,43,.06);color:#C0392B;font-family:Tajawal;font-size:13px;cursor:pointer">🔄 إعادة</button>
      <div class="info-box" style="font-size:12px;margin-top:8px;line-height:1.8">
        ✅ مغناطيسية: حديد · فولاذ · نيكل<br>
        ❌ غير مغناطيسية: ألومنيوم · نحاس · بلاستيك
      </div>`);
  }
  updControls();

  // تحديث قسم النتائج فقط دون إعادة رسم الكنترولز
  function updRes(){
    const el=document.getElementById('mc2res'); if(!el)return;
    const html=Object.entries(S.tested).map(([id,mag])=>{
      const it=ITEMS.find(x=>x.id===id);
      return `<div style="margin:3px 0">${it.icon} ${it.name}: <strong style="color:${mag?'#27AE60':'#E74C3C'}">${mag?'✅ مغناطيسية':'❌ غير مغناطيسية'}</strong></div>`;
    }).join('') || '<span style="color:#aaa;font-size:11px">اسحب مادة نحو المغناطيس</span>';
    el.innerHTML=html;
  }

  function getItemPos(i,w,h){
    const cols=2, iw=Math.min(w*.18,74), ih=iw*.85, gap=10;
    const totalW=cols*(iw+gap)-gap;
    const sx=w*.62 + (i%cols)*(iw+gap) - totalW/2 + iw/2;
    const sy=h*.22 + Math.floor(i/cols)*(ih+gap) + ih/2;
    return {x:sx, y:sy, iw, ih};
  }

  function gp(e){
    const r=cv.getBoundingClientRect(), sc=cv.width/r.width;
    const s=e.touches?e.touches[0]:e;
    return {x:(s.clientX-r.left)*sc, y:(s.clientY-r.top)*sc};
  }

  // ── أحداث السحب ──
  cv.onmousedown=function(e){
    const p=gp(e), w=cv.width, h=cv.height;
    ITEMS.forEach((it,i)=>{
      if(S.tested[it.id]!==undefined) return;
      const pos=getItemPos(i,w,h);
      if(Math.abs(p.x-pos.x)<pos.iw/2+4 && Math.abs(p.y-pos.y)<pos.ih/2+4){
        S.dragId=it.id; S.ox=p.x-pos.x; S.oy=p.y-pos.y;
        S.dragX=pos.x; S.dragY=pos.y;
      }
    });
  };
  cv.onmousemove=function(e){
    if(!S.dragId) return;
    const p=gp(e); S.dragX=p.x-S.ox; S.dragY=p.y-S.oy;
  };
  cv.onmouseup=function(){
    if(!S.dragId) return;
    const w=cv.width, h=cv.height;
    const mx=w*.22, my=h*.5;
    if(Math.hypot(S.dragX-mx, S.dragY-my) < w*.22){
      const it=ITEMS.find(x=>x.id===S.dragId);
      S.tested[S.dragId]=it.mag;
      updRes();
      try{ if(it.mag) U9Sound.win(); else U9Sound.ping(220,.2,.2); }catch(ex){}
    }
    S.dragId=null;
  };
  cv.ontouchstart=function(e){e.preventDefault();const t=e.touches[0];cv.onmousedown({clientX:t.clientX,clientY:t.clientY});};
  cv.ontouchmove=function(e){e.preventDefault();const t=e.touches[0];cv.onmousemove({clientX:t.clientX,clientY:t.clientY});};
  cv.ontouchend=function(e){e.preventDefault();cv.onmouseup();};
  cv.onclick=null;

  function draw(){
    if(currentSim!=='magcompare'||currentTab!==1)return;
    S.t+=.04;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle='#F8F5FF'; c.fillRect(0,0,w,h);
    U9.grid(c,w,h,'rgba(150,100,200,0.05)',44);

    // ── المغناطيس (أكبر) ──
    const mx=w*.22, my=h*.5;
    const mW=Math.min(w*.12,58), mH=Math.min(h*.28,130);
    const mg=c.createLinearGradient(mx-mW,my-mH/2,mx+mW,my+mH/2);
    mg.addColorStop(0,'#E74C3C'); mg.addColorStop(.48,'#EE7777');
    mg.addColorStop(.52,'#6699DD'); mg.addColorStop(1,'#2980B9');
    c.fillStyle=mg; c.shadowBlur=18; c.shadowColor='rgba(100,100,200,.25)';
    c.beginPath(); c.roundRect(mx-mW,my-mH/2,mW*2,mH,14); c.fill(); c.shadowBlur=0;
    c.strokeStyle='rgba(0,0,0,.15)'; c.lineWidth=2; c.stroke();
    // النصوص
    c.font=`bold ${Math.min(mW*.45,20)|0}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillStyle='white';
    c.fillText('ش', mx, my-mH*.28);
    c.fillText('ج', mx, my+mH*.28);
    // خط فاصل
    c.strokeStyle='rgba(255,255,255,.35)'; c.lineWidth=1.5;
    c.beginPath(); c.moveTo(mx-mW+6,my); c.lineTo(mx+mW-6,my); c.stroke();
    // تأثير جذب (نبض)
    const pulse=0.5+Math.sin(S.t*2)*.15;
    c.strokeStyle=`rgba(26,143,168,${pulse*.4})`; c.lineWidth=2; c.setLineDash([5,4]);
    c.beginPath(); c.ellipse(mx+mW+15,my,mW*.6,mH*.35,0,0,Math.PI*2); c.stroke(); c.setLineDash([]);
    c.font='11px Tajawal'; c.fillStyle=`rgba(26,143,168,${pulse*.7})`; c.textAlign='center';
    c.fillText('أفلت هنا', mx+mW+15, my);
    U9.txt(c,'🧲 مغناطيس', mx, my+mH/2+16, '#555', 12, true);

    // ── المواد ──
    ITEMS.forEach((it,i)=>{
      if(S.dragId===it.id) return;
      if(S.tested[it.id]!==undefined) return; // اختُبرت — لا ترسم في صينيتها
      const pos=getItemPos(i,w,h);
      // بطاقة
      c.fillStyle='rgba(255,255,255,.97)'; c.strokeStyle='rgba(0,0,0,.1)'; c.lineWidth=1.5;
      c.shadowBlur=7; c.shadowColor='rgba(0,0,0,.12)';
      c.beginPath(); c.roundRect(pos.x-pos.iw/2,pos.y-pos.ih/2,pos.iw,pos.ih,12); c.fill(); c.stroke();
      c.shadowBlur=0;
      c.font=`${pos.iw*.42|0}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(it.icon, pos.x, pos.y-pos.ih*.10);
      c.font=`bold ${pos.iw*.20|0}px Tajawal`; c.fillStyle='#333'; c.textBaseline='bottom';
      c.fillText(it.name, pos.x, pos.y+pos.ih/2-3);
    });

    // ── المواد المُختبَرة تظهر بجانب المغناطيس ──
    const testedArr=Object.entries(S.tested);
    testedArr.forEach(([id,mag],i)=>{
      const it=ITEMS.find(x=>x.id===id);
      const side = mag ? 1 : -1; // مغناطيسية: يمين المغناطيس / غير مغناطيسية: يسار
      const baseX = mag ? mx+mW+50+Math.floor(i/4)*36 : mx-mW-50-Math.floor(i/4)*36;
      const ty = my-60 + (i%4)*36;
      c.font='24px serif'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(it.icon, baseX, ty);
      c.font='bold 10px Tajawal'; c.fillStyle=mag?'#27AE60':'#E74C3C'; c.textBaseline='top';
      c.fillText(it.name, baseX, ty+14);
      if(mag){
        c.strokeStyle='rgba(39,174,96,.4)'; c.lineWidth=1.5; c.setLineDash([4,3]);
        c.beginPath(); c.moveTo(baseX-10,ty); c.lineTo(mx+mW+4,my); c.stroke(); c.setLineDash([]);
      }
    });

    // ── المادة المسحوبة ──
    if(S.dragId){
      const it=ITEMS.find(x=>x.id===S.dragId), iw=82, ih=68;
      c.shadowBlur=20; c.shadowColor='rgba(26,143,168,.4)';
      c.fillStyle='rgba(255,255,255,.97)'; c.strokeStyle='#1A8FA8'; c.lineWidth=2.5;
      c.beginPath(); c.roundRect(S.dragX-iw/2,S.dragY-ih/2,iw,ih,12); c.fill(); c.stroke();
      c.shadowBlur=0;
      c.font='28px serif'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(it.icon, S.dragX, S.dragY-8);
      c.font='bold 12px Tajawal'; c.fillStyle='#333'; c.textBaseline='bottom';
      c.fillText(it.name, S.dragX, S.dragY+ih/2-3);
    }

    // تعليمة إذا لم يُختبر شيء
    if(testedArr.length===0 && !S.dragId){
      U9.txt(c,'⬅ اسحب أي مادة نحو المغناطيس',w*.6,h*.78,'#AAA',12,true);
    }

    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 11-5 · TAB 1 — أثر عدد اللفّات على قوة الكهرومغناطيس
// ══════════════════════════════════════════════════════════════
function simEmStronger1() {
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.ems1) simState.ems1={coils:5,current:2,running:false,t:0};
  const S=simState.ems1;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔁 عدد اللفّات: <span class="ctrl-val" id="ems1c">${S.coils}</span></div>
      <input type="range" min="1" max="20" value="${S.coils}" oninput="simState.ems1.coils=+this.value;document.getElementById('ems1c').textContent=this.value">
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">⚡ التيار ثابت: <span class="ctrl-val">2</span> A</div>
      <div style="font-size:12px;color:#888;padding:4px 0">نختبر أثر اللفّات فقط</div>
    </div>
    <button class="ctrl-btn play" onclick="simState.ems1.running=true;simState.ems1.t=0">▶ شغّل</button>
    <button class="ctrl-btn reset" onclick="simState.ems1.running=false;simState.ems1.t=0">↺ إيقاف</button>
    <div class="info-box" style="font-size:13px">
      💪 القوة ≈ <strong id="ems1f">${S.coils*S.current}</strong> وحدة<br>
      <em>اللفّات ↑ = قوة ↑</em>
    </div>`);

  function draw(){
    if(currentSim!=='emstronger'||currentTab!==0)return;
    if(S.running) S.t+=.04;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#EDF6FF'); bg.addColorStop(1,'#E3F0FF');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    const el=document.getElementById('ems1f'); if(el) el.textContent=S.running?S.coils*S.current:0;
    const force=S.running?S.coils*S.current:0;

    // core
    const cx=w*.48,cy=h*.45,cW=w*.38,cH=h*.07;
    const cg=c.createLinearGradient(0,cy-cH/2,0,cy+cH/2);
    cg.addColorStop(0,'#9EAAB8'); cg.addColorStop(.5,'#E8EEF4'); cg.addColorStop(1,'#7A8A98');
    c.fillStyle=cg; c.beginPath(); c.roundRect(cx-cW/2,cy-cH/2,cW,cH,6); c.fill();
    c.strokeStyle='#8090A0'; c.lineWidth=1.5; c.stroke();
    c.font='11px Tajawal'; c.fillStyle='#667'; c.textAlign='center'; c.textBaseline='top';
    c.fillText('نواة حديدية',cx,cy+cH/2+4);

    // coils
    const nC=Math.min(S.coils,18);
    for(let i=0;i<nC;i++){
      const ccx=cx-cW/2+(i/nC)*cW+cW/nC/2;
      const rx=cW/nC*.44, ry=cH*.72;
      c.strokeStyle=S.running?'#E67E22':'#95A5A6'; c.lineWidth=3;
      c.beginPath(); c.ellipse(ccx,cy,rx,ry,0,0,Math.PI*2); c.stroke();
      if(S.running){
        const ft=((S.t*2+i*.4)%1);
        const fx=ccx+Math.cos(ft*Math.PI*2)*rx, fy=cy+Math.sin(ft*Math.PI*2)*ry;
        c.fillStyle='rgba(255,200,50,.9)'; c.beginPath(); c.arc(fx,fy,3,0,Math.PI*2); c.fill();
      }
    }
    c.font='10px Tajawal'; c.fillStyle='#888'; c.textAlign='center'; c.textBaseline='top';
    c.fillText(`${S.coils} لفّة`,cx,cy-cH/2-16);

    // poles
    if(S.running){
      c.font='bold 14px Tajawal'; c.textAlign='center';
      c.fillStyle='#C0392B'; c.fillText('ش',cx+cW/2+14,cy-10);
      c.fillStyle='#2980B9'; c.fillText('ج',cx-cW/2-14,cy-10);
    }

    // attracted objects
    if(S.running && force>0){
      const pullP=Math.min(1,S.t*.6);
      const maxItems=Math.min(6,Math.floor(force/4)+1);
      for(let ii=0;ii<maxItems;ii++){
        const startX=cx+cW/2+80+ii*18, endX=cx+cW/2+14;
        const ox=startX+(endX-startX)*pullP;
        c.font='14px serif'; c.textAlign='center'; c.textBaseline='middle';
        c.fillText('🔩',ox,cy-14+ii%2*22);
      }
    }

    // battery (left)
    _drawBattery(c,w*.1,cy,4.5);
    const wc=S.running?'#E67E22':'#CCC';
    c.strokeStyle=wc; c.lineWidth=2.5; c.lineCap='round';
    c.beginPath(); c.moveTo(w*.1,cy-30); c.lineTo(w*.1,cy-h*.16); c.lineTo(cx-cW/2,cy-h*.16); c.stroke();
    c.beginPath(); c.moveTo(w*.1,cy+30); c.lineTo(w*.1,cy+h*.16); c.lineTo(cx-cW/2,cy+h*.16); c.stroke();

    // force bar
    const bY=h*.82, bW=w*.6, bX=w*.2;
    c.fillStyle='#E8E8E8'; c.beginPath(); c.roundRect(bX,bY,bW,14,7); c.fill();
    const frac=Math.min(1,force/(20*2));
    const barG=c.createLinearGradient(bX,0,bX+bW,0);
    barG.addColorStop(0,'#3498DB'); barG.addColorStop(.5,'#F39C12'); barG.addColorStop(1,'#E74C3C');
    c.fillStyle=barG; c.beginPath(); c.roundRect(bX,bY,bW*frac*Math.min(1,S.t),14,7); c.fill();
    U9.txt(c,`القوة: ${force} وحدة | اللفّات: ${S.coils} | التيار: ${S.current}A`,w/2,bY-16,'#555',12,true);
    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 11-5 · TAB 2 — أثر شدة التيار على قوة الكهرومغناطيس
// ══════════════════════════════════════════════════════════════
function simEmStronger2() {
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.ems2) simState.ems2={coils:8,current:1,running:false,t:0};
  const S=simState.ems2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⚡ شدة التيار: <span class="ctrl-val" id="ems2a">${S.current}</span> A</div>
      <input type="range" min="1" max="6" value="${S.current}" oninput="simState.ems2.current=+this.value;document.getElementById('ems2a').textContent=this.value">
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🔁 اللفّات ثابتة: <span class="ctrl-val">8</span></div>
      <div style="font-size:12px;color:#888;padding:4px 0">نختبر أثر التيار فقط</div>
    </div>
    <button class="ctrl-btn play" onclick="simState.ems2.running=true;simState.ems2.t=0">▶ شغّل</button>
    <button class="ctrl-btn reset" onclick="simState.ems2.running=false;simState.ems2.t=0">↺ إيقاف</button>
    <div class="info-box" style="font-size:13px">
      💪 القوة ≈ <strong id="ems2f">${S.coils*S.current}</strong> وحدة<br>
      <em>التيار ↑ = قوة ↑</em>
    </div>`);

  function draw(){
    if(currentSim!=='emstronger'||currentTab!==1)return;
    if(S.running) S.t+=.04;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#FFF8EE'); bg.addColorStop(1,'#FAEEDD');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    const el=document.getElementById('ems2f'); if(el) el.textContent=S.running?S.coils*S.current:0;
    const force=S.running?S.coils*S.current:0;

    const cx=w*.48,cy=h*.44,cW=w*.38,cH=h*.07;
    const cg=c.createLinearGradient(0,cy-cH/2,0,cy+cH/2);
    cg.addColorStop(0,'#9EAAB8'); cg.addColorStop(.5,'#E8EEF4'); cg.addColorStop(1,'#7A8A98');
    c.fillStyle=cg; c.beginPath(); c.roundRect(cx-cW/2,cy-cH/2,cW,cH,6); c.fill();
    c.strokeStyle='#8090A0'; c.lineWidth=1.5; c.stroke();
    c.font='11px Tajawal'; c.fillStyle='#667'; c.textAlign='center'; c.textBaseline='top';
    c.fillText('نواة حديدية',cx,cy+cH/2+4);

    // الإلكترونات تتدفق بسرعة تعتمد على التيار
    const nC=8;
    for(let i=0;i<nC;i++){
      const ccx=cx-cW/2+(i/nC)*cW+cW/nC/2;
      const rx=cW/nC*.44, ry=cH*.72;
      c.strokeStyle=S.running?`hsl(${30+S.current*10},80%,50%)`:'#95A5A6'; c.lineWidth=3;
      c.beginPath(); c.ellipse(ccx,cy,rx,ry,0,0,Math.PI*2); c.stroke();
      if(S.running){
        const speed=S.current*.5;
        const ft=((S.t*speed+i*.4)%1);
        const fx=ccx+Math.cos(ft*Math.PI*2)*rx, fy=cy+Math.sin(ft*Math.PI*2)*ry;
        c.fillStyle=`rgba(255,${100+S.current*20},50,.9)`; c.beginPath(); c.arc(fx,fy,4,0,Math.PI*2); c.fill();
      }
    }
    c.font='10px Tajawal'; c.fillStyle='#888'; c.textAlign='center'; c.textBaseline='top';
    c.fillText('8 لفّات ثابتة',cx,cy-cH/2-16);

    if(S.running){
      c.font='bold 14px Tajawal';
      c.fillStyle='#C0392B'; c.textAlign='center'; c.fillText('ش',cx+cW/2+14,cy-10);
      c.fillStyle='#2980B9'; c.fillText('ج',cx-cW/2-14,cy-10);
    }

    if(S.running && force>0){
      const pullP=Math.min(1,S.t*.6);
      const maxItems=Math.min(8,Math.floor(force/6)+1);
      for(let ii=0;ii<maxItems;ii++){
        const startX=cx+cW/2+90+ii*16, endX=cx+cW/2+14;
        const ox=startX+(endX-startX)*pullP;
        c.font='13px serif'; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(ii%2===0?'🔩':'📎',ox,cy-12+ii%3*20);
      }
    }

    // ammeter display
    const amX=w*.12,amY=h*.68,amR=38;
    c.strokeStyle='#555'; c.lineWidth=2;
    c.beginPath(); c.arc(amX,amY,amR,Math.PI,0); c.stroke();
    c.beginPath(); c.moveTo(amX-amR,amY); c.lineTo(amX+amR,amY); c.stroke();
    const ang2=Math.PI*(1-S.current/6);
    c.strokeStyle='#E74C3C'; c.lineWidth=2.5;
    c.beginPath(); c.moveTo(amX,amY); c.lineTo(amX+Math.cos(ang2)*amR*.8,amY-Math.sin(ang2)*amR*.8); c.stroke();
    c.font='bold 11px Tajawal'; c.fillStyle='#555'; c.textAlign='center'; c.textBaseline='top';
    c.fillText('أميتر',amX,amY+6); c.fillText(`${S.current} A`,amX,amY+20);

    _drawBattery(c,w*.1,cy,S.current*2);
    const wc=S.running?`hsl(${30+S.current*10},80%,50%)`:'#CCC';
    c.strokeStyle=wc; c.lineWidth=2.5; c.lineCap='round';
    c.beginPath(); c.moveTo(w*.1,cy-30); c.lineTo(w*.1,cy-h*.16); c.lineTo(cx-cW/2,cy-h*.16); c.stroke();
    c.beginPath(); c.moveTo(w*.1,cy+30); c.lineTo(w*.1,cy+h*.16); c.lineTo(cx-cW/2,cy+h*.16); c.stroke();

    const bY=h*.84,bW=w*.6,bX=w*.2;
    c.fillStyle='#E8E8E8'; c.beginPath(); c.roundRect(bX,bY,bW,14,7); c.fill();
    const frac=Math.min(1,force/(8*6));
    const barG=c.createLinearGradient(bX,0,bX+bW,0);
    barG.addColorStop(0,'#3498DB'); barG.addColorStop(.5,'#F39C12'); barG.addColorStop(1,'#E74C3C');
    c.fillStyle=barG; c.beginPath(); c.roundRect(bX,bY,bW*frac*Math.min(1,S.t),14,7); c.fill();
    U9.txt(c,`القوة: ${force} وحدة | اللفّات: ${S.coils} | التيار: ${S.current}A`,w/2,bY-16,'#555',12,true);
    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 11-7 · TAB 1 — قياس الشحنة الكهربائية
// ══════════════════════════════════════════════════════════════
function simCharges1() {
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.ch1) simState.ch1={selected:-1,rubbed:false,measured:false,t:0};
  const S=simState.ch1;
  const RODS=[
    {name:'بوليثين + صوف',    charge:'سالبة −', val:-0.032, col:'#2980B9', icon:'🔵'},
    {name:'أكريليك + قطن',    charge:'موجبة +', val:+0.028, col:'#E74C3C', icon:'🔴'},
    {name:'زجاج + حرير',      charge:'موجبة +', val:+0.019, col:'#E67E22', icon:'🟠'},
  ];
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧪 اختر المادة للدلك</div>
      ${RODS.map((r,i)=>`<button class="ctrl-btn${S.selected===i?' play':''}" onclick="simState.ch1.selected=${i};simState.ch1.rubbed=false;simState.ch1.measured=false;simState.ch1.t=0">${r.icon} ${r.name}</button>`).join('')}
    </div>
    <button class="ctrl-btn play" onclick="if(simState.ch1.selected>=0)simState.ch1.rubbed=true">🤚 ادلك!</button>
    <button class="ctrl-btn" onclick="if(simState.ch1.rubbed)simState.ch1.measured=true">📟 قِس الشحنة</button>
    <div class="info-box" style="font-size:12px;line-height:1.8">
      💡 الاحتكاك ينقل إلكترونات<br>
      − سالبة = اكتسب إلكترونات<br>
      + موجبة = فقد إلكترونات
    </div>`);

  function draw(){
    if(currentSim!=='charges'||currentTab!==0)return;
    S.t+=.04;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle='#F8F6FF'; c.fillRect(0,0,w,h);
    U9.grid(c,w,h,'rgba(100,80,200,0.05)',44);

    if(S.selected<0){
      U9.txt(c,'⬆ اختر مادةً لبدء التجربة',w/2,h*.5,'#888',14,true);
      animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
      return;
    }
    const rod=RODS[S.selected];
    // القضيب
    const rx=w*.38,ry=h*.45,rW=w*.26,rH=h*.1;
    const rg=c.createLinearGradient(rx-rW/2,0,rx+rW/2,0);
    rg.addColorStop(0,rod.col+'44'); rg.addColorStop(.5,rod.col+'AA'); rg.addColorStop(1,rod.col+'44');
    c.fillStyle=rg; c.beginPath(); c.roundRect(rx-rW/2,ry-rH/2,rW,rH,8); c.fill();
    c.strokeStyle=rod.col; c.lineWidth=2; c.stroke();
    c.font='12px Tajawal'; c.fillStyle=rod.col; c.textAlign='center'; c.textBaseline='bottom';
    c.fillText(rod.name.split('+')[0].trim(),rx,ry-rH/2-4);

    // الشحنات المرئية
    if(S.rubbed){
      const sign=rod.val<0?'−':'+';
      const col=rod.val<0?'#2980B9':'#E74C3C';
      for(let i=0;i<8;i++){
        const px2=rx-rW/2+18+i*(rW-36)/7;
        const py2=ry+(i%2===0?-rH*.3:rH*.3);
        c.font='bold 13px sans-serif'; c.fillStyle=col; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(sign,px2,py2);
      }
    }

    // جهاز القياس
    const mx2=w*.78,my2=h*.48;
    c.fillStyle='#2C3E50'; c.beginPath(); c.roundRect(mx2-48,my2-40,96,80,10); c.fill();
    c.fillStyle='#ECF0F1'; c.beginPath(); c.roundRect(mx2-38,my2-28,76,46,6); c.fill();
    if(S.measured){
      c.font='bold 16px monospace'; c.fillStyle=rod.val<0?'#2980B9':'#E74C3C'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(`${rod.val>0?'+':''}${rod.val} nC`,mx2,my2);
      c.font='11px Tajawal'; c.fillStyle='#888'; c.textBaseline='top'; c.fillText('COULOMBMETER',mx2,my2+26);
    } else {
      c.font='bold 16px monospace'; c.fillStyle='#555'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('_ _ _',mx2,my2);
    }

    // سلك التوصيل
    if(S.measured){
      c.strokeStyle='#E74C3C'; c.lineWidth=2; c.setLineDash([4,3]);
      c.beginPath(); c.moveTo(rx+rW/2,ry); c.lineTo(mx2-48,my2); c.stroke();
      c.setLineDash([]);
      const charge=rod.charge;
      U9.txt(c,`الشحنة: ${charge}`,w*.58,h*.75,rod.col,13,true);
    }

    if(!S.rubbed) U9.txt(c,'⬆ اضغط "ادلك" لشحن القضيب',w/2,h*.85,'#888',12,true);
    else if(!S.measured) U9.txt(c,'⬆ اضغط "قِس الشحنة" لمعرفة النوع',w/2,h*.85,'#888',12,true);

    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 11-7 · TAB 2 — تجاذب وتنافر الشحنات
// ══════════════════════════════════════════════════════════════
function simCharges2() {
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.ch2) simState.ch2={q1:'+',q2:'+',sep:160,t:0};
  const S=simState.ch2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⊕ شحنة الكرة الأولى</div>
      <button class="ctrl-btn${S.q1==='+'?' play':''}" onclick="simState.ch2.q1='+'">+ موجبة</button>
      <button class="ctrl-btn${S.q1==='-'?' play':''}" onclick="simState.ch2.q1='-'">− سالبة</button>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">⊕ شحنة الكرة الثانية</div>
      <button class="ctrl-btn${S.q2==='+'?' play':''}" onclick="simState.ch2.q2='+'">+ موجبة</button>
      <button class="ctrl-btn${S.q2==='-'?' play':''}" onclick="simState.ch2.q2='-'">− سالبة</button>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">📏 المسافة بينهما</div>
      <input type="range" min="80" max="260" value="${S.sep}" oninput="simState.ch2.sep=+this.value">
    </div>
    <div class="info-box" style="font-size:12px;line-height:1.8" id="ch2info">
      الأضداد تتجاذب — المتشابهة تتنافر
    </div>`);

  function draw(){
    if(currentSim!=='charges'||currentTab!==1)return;
    S.t+=.05;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle='#F5F8FF'; c.fillRect(0,0,w,h);
    U9.grid(c,w,h,'rgba(100,120,200,0.05)',44);

    const cx=w*.5,cy=h*.46,r=32;
    const attract=S.q1!==S.q2;
    const x1=cx-S.sep/2, x2=cx+S.sep/2;

    // خيط التعليق
    c.strokeStyle='#AAA'; c.lineWidth=1.5;
    c.beginPath(); c.moveTo(cx,h*.12); c.lineTo(x1,cy); c.stroke();
    c.beginPath(); c.moveTo(cx,h*.12); c.lineTo(x2,cy); c.stroke();
    // نقطة التعليق
    c.fillStyle='#888'; c.beginPath(); c.arc(cx,h*.12,5,0,Math.PI*2); c.fill();

    const cols={'+':'#E74C3C','-':'#2980B9'};
    // سهم القوة
    const fLen=Math.max(20,60*(1-S.sep/300));
    const fCol=attract?'#27AE60':'#E74C3C';
    if(attract){
      // تجاذب → سهمان للداخل
      [[x1,1],[x2,-1]].forEach(([bx,dir])=>{
        c.strokeStyle=fCol; c.lineWidth=3;
        c.beginPath(); c.moveTo(bx+dir*r,cy); c.lineTo(bx+dir*(r+fLen),cy); c.stroke();
        c.fillStyle=fCol;
        c.beginPath(); c.moveTo(bx+dir*r,cy); c.lineTo(bx+dir*(r+14),cy-7); c.lineTo(bx+dir*(r+14),cy+7); c.closePath(); c.fill();
      });
    } else {
      // تنافر → سهمان للخارج
      [[x1,-1],[x2,1]].forEach(([bx,dir])=>{
        c.strokeStyle=fCol; c.lineWidth=3;
        c.beginPath(); c.moveTo(bx+dir*r,cy); c.lineTo(bx+dir*(r+fLen),cy); c.stroke();
        c.fillStyle=fCol;
        c.beginPath(); c.moveTo(bx+dir*(r+fLen),cy); c.lineTo(bx+dir*(r+fLen-14),cy-7); c.lineTo(bx+dir*(r+fLen-14),cy+7); c.closePath(); c.fill();
      });
    }

    // الكرتان
    [[x1,S.q1],[x2,S.q2]].forEach(([bx,q])=>{
      const col=cols[q];
      const gr=c.createRadialGradient(bx-r*.3,cy-r*.3,2,bx,cy,r);
      gr.addColorStop(0,col+'FF'); gr.addColorStop(1,col+'88');
      c.fillStyle=gr; c.beginPath(); c.arc(bx,cy,r,0,Math.PI*2); c.fill();
      c.strokeStyle=col+'AA'; c.lineWidth=2; c.stroke();
      c.font='bold 20px sans-serif'; c.fillStyle='white'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(q,bx,cy);
    });

    const status=attract?'تتجاذب ✅ (أضداد)':'تتنافر ⚠️ (متشابهة)';
    const el=document.getElementById('ch2info'); if(el) el.textContent=status;
    U9.txt(c,status,w/2,h*.78,attract?'#27AE60':'#E74C3C',14,true);
    U9.txt(c,`${S.q1===S.q2?'شحنتان متشابهتان':'شحنتان مختلفتان'}`,w/2,h*.88,'#888',12,true);
    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 11-8 · TAB 1 — الشحن بالاحتكاك (حركة الإلكترونات)
// ══════════════════════════════════════════════════════════════
function simElectrons1() {
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.el1) simState.el1={rubbing:false,rubCount:0,t:0};
  const S=simState.el1;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🤚 ادلك الأكريليك بالقطن</div>
      <button class="ctrl-btn play" id="el1rub" onmousedown="simState.el1.rubbing=true" onmouseup="simState.el1.rubbing=false" ontouchstart="simState.el1.rubbing=true" ontouchend="simState.el1.rubbing=false">
        🤚 اضغط مع الاستمرار للدلك
      </button>
    </div>
    <button class="ctrl-btn reset" onclick="simState.el1.rubCount=0;simState.el1.t=0">↺ إعادة</button>
    <div class="info-box" style="font-size:12px;line-height:1.9">
      الأكريليك → يفقد e⁻ → <strong style="color:#E74C3C">شحنة +</strong><br>
      القطن → يكتسب e⁻ → <strong style="color:#2980B9">شحنة −</strong>
    </div>`);

  function draw(){
    if(currentSim!=='electrons'||currentTab!==0)return;
    S.t+=.04;
    if(S.rubbing && S.rubCount<20) S.rubCount+=.08;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle='#FEFAF5'; c.fillRect(0,0,w,h);
    U9.grid(c,w,h,'rgba(200,150,50,0.05)',44);

    const aX=w*.32,aY=h*.45,cX=w*.68,cY=h*.45;
    const rW=w*.22,rH=h*.12;

    // حركة الدلك
    const shakeX=S.rubbing?Math.sin(S.t*15)*8:0;

    // القطن
    c.fillStyle='#F5E6D0'; c.strokeStyle='#C4A27A'; c.lineWidth=2;
    c.beginPath(); c.roundRect(cX-rW/2+shakeX,cY-rH/2,rW,rH,10); c.fill(); c.stroke();
    c.font='12px Tajawal'; c.fillStyle='#8B5E3C'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('قماش قطن',cX+shakeX,cY);

    // الأكريليك
    c.fillStyle='#D6EAF8'; c.strokeStyle='#2980B9'; c.lineWidth=2;
    c.beginPath(); c.roundRect(aX-rW/2,aY-rH/2,rW,rH,10); c.fill(); c.stroke();
    c.font='12px Tajawal'; c.fillStyle='#1A5276'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('قضيب أكريليك',aX,aY);

    // إلكترونات تنتقل
    const eCount=Math.floor(S.rubCount);
    for(let i=0;i<eCount;i++){
      const prog=((S.t*.4+i*.15)%1);
      const ex=cX+shakeX+(aX-cX)*prog;
      const ey=cY+(Math.sin(prog*Math.PI)*h*.12)*(i%2===0?-1:1);
      c.fillStyle='rgba(41,128,185,0.85)'; c.beginPath(); c.arc(ex,ey,5,0,Math.PI*2); c.fill();
      c.font='bold 9px sans-serif'; c.fillStyle='white'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('e⁻',ex,ey);
    }

    // الشحنات المتراكمة
    if(eCount>0){
      // موجبة على الأكريليك
      for(let i=0;i<Math.min(eCount,8);i++){
        const px2=aX-rW/2+8+i*(rW-16)/7;
        c.font='bold 11px sans-serif'; c.fillStyle='#E74C3C'; c.textAlign='center'; c.textBaseline='middle';
        c.fillText('+',px2,aY);
      }
      // سالبة على القطن
      for(let i=0;i<Math.min(eCount,8);i++){
        const px2=cX-rW/2+8+i*(rW-16)/7+shakeX;
        c.font='bold 11px sans-serif'; c.fillStyle='#2980B9'; c.textAlign='center'; c.textBaseline='middle';
        c.fillText('−',px2,cY);
      }
      U9.txt(c,`${eCount} إلكترون انتقل`,w/2,h*.78,'#555',12,true);
    }

    // نتيجة
    if(eCount>=10){
      U9.txt(c,'الأكريليك: موجب ⊕',aX,aY-rH/2-22,'#E74C3C',12,true);
      U9.txt(c,'القطن: سالب ⊖',cX,cY-rH/2-22,'#2980B9',12,true);
    }

    if(!S.rubbing && eCount<2) U9.txt(c,'⬆ اضغط مع الاستمرار للدلك',w/2,h*.88,'#888',12,true);
    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 11-8 · TAB 2 — بنية الذرة والإلكترونات
// ══════════════════════════════════════════════════════════════
function simElectrons2() {
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.el2) simState.el2={mode:'neutral',t:0};
  const S=simState.el2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⚛️ حالة الذرة</div>
      <button class="ctrl-btn${S.mode==='neutral'?' play':''}" onclick="simState.el2.mode='neutral'">متعادلة</button>
      <button class="ctrl-btn${S.mode==='positive'?' play':''}" onclick="simState.el2.mode='positive'">مشحونة موجبة</button>
      <button class="ctrl-btn${S.mode==='negative'?' play':''}" onclick="simState.el2.mode='negative'">مشحونة سالبة</button>
    </div>
    <div class="info-box" style="font-size:12px;line-height:1.9">
      ⚛️ الذرة المتعادلة:<br>
      شحنات + = شحنات −<br>
      فقدان e⁻ → شحنة +<br>
      اكتساب e⁻ → شحنة −
    </div>`);

  function draw(){
    if(currentSim!=='electrons'||currentTab!==1)return;
    S.t+=.03;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle='#0D1117'; c.fillRect(0,0,w,h);

    const cx=w*.5,cy=h*.48;
    const eCount=S.mode==='negative'?4:S.mode==='positive'?2:3;
    const protons=3;

    // النواة
    const nR=38;
    const ng=c.createRadialGradient(cx-8,cy-8,2,cx,cy,nR);
    ng.addColorStop(0,'#F39C12'); ng.addColorStop(1,'#E67E22');
    c.fillStyle=ng; c.beginPath(); c.arc(cx,cy,nR,0,Math.PI*2); c.fill();
    c.font='bold 11px Tajawal'; c.fillStyle='white'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(`${protons}+`,cx,cy-6); c.fillText('نواة',cx,cy+8);

    // مدارات وإلكترونات
    const orbits=[72,110,148];
    [1,2,3].forEach((orbit,oi)=>{
      const r=orbits[oi];
      c.strokeStyle='rgba(255,255,255,0.1)'; c.lineWidth=1;
      c.beginPath(); c.arc(cx,cy,r,0,Math.PI*2); c.stroke();
    });

    // الإلكترونات: مدار 1 → 2، مدار 2 → 1 أو 2 حسب الوضع
    const positions=[];
    if(eCount>=1) positions.push({r:orbits[0],ang:S.t*2,layer:0});
    if(eCount>=2) positions.push({r:orbits[0],ang:S.t*2+Math.PI,layer:0});
    if(eCount>=3) positions.push({r:orbits[1],ang:S.t*1.3,layer:1});
    if(eCount>=4) positions.push({r:orbits[1],ang:S.t*1.3+Math.PI,layer:1});

    positions.forEach(pos=>{
      const ex=cx+Math.cos(pos.ang)*pos.r;
      const ey=cy+Math.sin(pos.ang)*pos.r;
      const eg=c.createRadialGradient(ex-2,ey-2,1,ex,ey,8);
      eg.addColorStop(0,'#74B9FF'); eg.addColorStop(1,'#2980B9');
      c.fillStyle=eg; c.beginPath(); c.arc(ex,ey,8,0,Math.PI*2); c.fill();
      c.font='bold 9px sans-serif'; c.fillStyle='white'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('e⁻',ex,ey);
    });

    // الحالة والشحنة
    const netCharge=protons-eCount;
    const chargeStr=netCharge===0?'متعادلة (٠)':netCharge>0?`موجبة (+${netCharge})`:`سالبة (${netCharge})`;
    const chargeCol=netCharge===0?'#ECF0F1':netCharge>0?'#E74C3C':'#3498DB';
    U9.txt(c,`الشحنة الكلية: ${chargeStr}`,w/2,h*.85,chargeCol,13,true);
    U9.txt(c,`بروتونات: +${protons} | إلكترونات: ${eCount}`,w/2,h*.1,'#95A5A6',12,true);
    if(S.mode==='positive') U9.txt(c,'⬆ فقد إلكترونات بالدلك',w/2,h*.92,'#E74C3C',11,true);
    else if(S.mode==='negative') U9.txt(c,'⬆ اكتسب إلكترونات إضافية',w/2,h*.92,'#3498DB',11,true);
    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 11-10 · TAB 1 — الخلايا على التوالي
// ══════════════════════════════════════════════════════════════
function simCellVoltage1() {
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.cv1) simState.cv1={cells:1,t:0};
  const S=simState.cv1;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔋 عدد الخلايا: <span class="ctrl-val" id="cv1n">${S.cells}</span></div>
      <input type="range" min="1" max="4" step="1" value="${S.cells}" oninput="simState.cv1.cells=+this.value;document.getElementById('cv1n').textContent=this.value">
    </div>
    <div class="info-box" style="font-size:13px;line-height:2">
      🔋 كل خلية: 1.5 V<br>
      ⚡ الجهد الكلي: <strong id="cv1v">${S.cells*1.5}</strong> V<br>
      💡 التيار: <strong id="cv1i">${(S.cells*1.5/10).toFixed(2)}</strong> A
    </div>`);

  function draw(){
    if(currentSim!=='cellvoltage'||currentTab!==0)return;
    S.t+=.04;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle='#F2FFF4'; c.fillRect(0,0,w,h);
    U9.grid(c,w,h,'rgba(40,150,80,0.05)',44);

    const el1=document.getElementById('cv1v'); if(el1) el1.textContent=(S.cells*1.5).toFixed(1);
    const el2=document.getElementById('cv1i'); if(el2) el2.textContent=(S.cells*1.5/10).toFixed(2);
    const totalV=S.cells*1.5;
    const current=totalV/10;

    // رسم الخلايا على التوالي
    const startX=w*.12, cellW=52, gap=10;
    const totalW=(S.cells*(cellW+gap))-gap;
    const startXC=w*.5-totalW/2;
    const batY=h*.42;

    for(let i=0;i<S.cells;i++){
      const bx=startXC+i*(cellW+gap);
      // قضبان البطارية
      c.strokeStyle='#555'; c.lineWidth=4;
      c.beginPath(); c.moveTo(bx+18,batY-22); c.lineTo(bx+18,batY+22); c.stroke();
      c.lineWidth=1.5;
      c.beginPath(); c.moveTo(bx+28,batY-14); c.lineTo(bx+28,batY+14); c.stroke();
      c.font='9px Tajawal'; c.fillStyle='#888'; c.textAlign='center'; c.textBaseline='top';
      c.fillText('1.5V',bx+23,batY+24);
      // وصلة بين الخلايا
      if(i<S.cells-1){
        c.strokeStyle='#555'; c.lineWidth=2;
        c.beginPath(); c.moveTo(bx+cellW,batY); c.lineTo(bx+cellW+gap,batY); c.stroke();
      }
    }

    // الدائرة الخارجية
    const circL=startXC-40, circR=startXC+totalW+40;
    c.strokeStyle='#27AE60'; c.lineWidth=3; c.lineCap='round';
    [[circL,batY-30,circR,batY-30],[circL,batY+30,circR,batY+30],
     [circL,batY-30,circL,batY+30],[circR,batY-30,circR,batY+30]].forEach(([ax,ay,bx,by])=>{
      c.beginPath(); c.moveTo(ax,ay); c.lineTo(bx,by); c.stroke();
    });

    // المصباح
    _drawBulb(c,circR+40,batY,true,S.t, Math.min(1,totalV/6));
    c.font='10px Tajawal'; c.fillStyle='#555'; c.textAlign='center'; c.textBaseline='top';
    c.fillText('مصباح',circR+40,batY+26);

    // الإلكترونات
    const pathLen=(circR-circL)*2+(60)*2;
    for(let ei=0;ei<Math.min(8,S.cells*2);ei++){
      const d=((S.t*current*.3+ei/8)%1)*pathLen;
      const pts=[{x:circL,y:batY-30},{x:circR,y:batY-30},{x:circR,y:batY+30},{x:circL,y:batY+30}];
      const segs=[(circR-circL),60,(circR-circL),60];
      let cum=0,ex=circL,ey=batY-30;
      for(let si=0;si<4;si++){
        if(d<=cum+segs[si]){
          const r2=(d-cum)/segs[si];
          ex=pts[si].x+(pts[(si+1)%4].x-pts[si].x)*r2;
          ey=pts[si].y+(pts[(si+1)%4].y-pts[si].y)*r2; break;
        }
        cum+=segs[si];
      }
      c.fillStyle='rgba(41,128,185,0.8)'; c.beginPath(); c.arc(ex,ey,4,0,Math.PI*2); c.fill();
    }

    // فولتمير
    const vmX=w*.5, vmY=h*.8;
    c.fillStyle='#2C3E50'; c.beginPath(); c.roundRect(vmX-50,vmY-22,100,44,8); c.fill();
    c.fillStyle='#ECF0F1'; c.beginPath(); c.roundRect(vmX-40,vmY-14,80,28,5); c.fill();
    c.font='bold 14px monospace'; c.fillStyle='#27AE60'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(`${totalV.toFixed(1)} V`,vmX,vmY);
    c.font='10px Tajawal'; c.fillStyle='#AAA'; c.textBaseline='top'; c.fillText('Voltmeter',vmX,vmY+16);

    U9.txt(c,`${S.cells} خلية × 1.5V = ${totalV.toFixed(1)}V`,w/2,h*.12,'#1E8449',14,true);
    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 11-10 · TAB 2 — الجهد والتيار
// ══════════════════════════════════════════════════════════════
function simCellVoltage2() {
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.cv2) simState.cv2={cells:1,running:false,t:0};
  const S=simState.cv2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔋 عدد الخلايا: <span class="ctrl-val" id="cv2n">${S.cells}</span></div>
      <input type="range" min="1" max="4" step="1" value="${S.cells}" oninput="simState.cv2.cells=+this.value;document.getElementById('cv2n').textContent=this.value">
    </div>
    <button class="ctrl-btn play" onclick="simState.cv2.running=true;simState.cv2.t=0">▶ ابدأ</button>
    <button class="ctrl-btn reset" onclick="simState.cv2.running=false;simState.cv2.t=0">↺ إعادة</button>
    <div class="info-box" style="font-size:12px;line-height:1.9">
      جهد أعلى → تيار أكبر<br>
      تيار أكبر → مصباح أشد إضاءة<br>
      <strong id="cv2sum">—</strong>
    </div>`);

  const CFG=[{cells:1,col:'#3498DB'},{cells:2,col:'#F39C12'},{cells:3,col:'#E74C3C'},{cells:4,col:'#8E44AD'}];

  function draw(){
    if(currentSim!=='cellvoltage'||currentTab!==1)return;
    if(S.running) S.t+=.02;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle='#F8F4FF'; c.fillRect(0,0,w,h);
    U9.grid(c,w,h,'rgba(150,80,200,0.05)',44);

    const el=document.getElementById('cv2sum');
    if(el) el.textContent=`${S.cells}×1.5=${(S.cells*1.5).toFixed(1)}V → ${(S.cells*1.5/10).toFixed(2)}A`;

    const colW=w/4;
    CFG.forEach((cfg,i)=>{
      const cx2=colW*i+colW/2;
      const v=cfg.cells*1.5, curr=v/10;
      const brightness=Math.min(1,curr/0.6);
      const prog=Math.min(1,S.t*1.5)*brightness;

      // الخلايا
      for(let ci=0;ci<cfg.cells;ci++){
        const bY=h*.28-ci*18;
        c.strokeStyle=cfg.col; c.lineWidth=3;
        c.beginPath(); c.moveTo(cx2-12,bY-8); c.lineTo(cx2-12,bY+8); c.stroke();
        c.lineWidth=1.5;
        c.beginPath(); c.moveTo(cx2+4,bY-5); c.lineTo(cx2+4,bY+5); c.stroke();
      }
      c.font='9px Tajawal'; c.fillStyle=cfg.col; c.textAlign='center'; c.textBaseline='top';
      c.fillText(`${v.toFixed(1)}V`,cx2,h*.35);

      // مصباح
      const bulbY=h*.56;
      _drawBulb(c,cx2,bulbY,true,S.t+i,prog);

      // سطوع المصباح - هالة
      if(prog>0.1){
        const glow=c.createRadialGradient(cx2,bulbY,5,cx2,bulbY,32);
        glow.addColorStop(0,`rgba(255,220,50,${prog*.5})`);
        glow.addColorStop(1,'rgba(255,220,50,0)');
        c.fillStyle=glow; c.beginPath(); c.arc(cx2,bulbY,32,0,Math.PI*2); c.fill();
      }

      // شريط التيار
      const bH=h*.18, bW=12, bX=cx2-6, bY2=h*.78;
      c.fillStyle='#E8E8E8'; c.beginPath(); c.roundRect(bX,bY2-bH,bW,bH,4); c.fill();
      c.fillStyle=cfg.col+'CC'; c.beginPath(); c.roundRect(bX,bY2-bH*prog,bW,bH*prog,4); c.fill();
      c.font='9px Tajawal'; c.fillStyle=cfg.col; c.textAlign='center'; c.textBaseline='top';
      c.fillText(`${curr.toFixed(2)}A`,cx2,bY2+3);
    });

    U9.txt(c,'الجهد ↑ = التيار ↑ = الإضاءة ↑',w/2,h*.1,'#555',13,true);
    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 11-11 · TAB 1 — المقاومة الثابتة
// ══════════════════════════════════════════════════════════════
function simResistance1() {
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.res1) simState.res1={voltage:6,resistance:10,t:0};
  const S=simState.res1;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔋 الجهد: <span class="ctrl-val" id="res1v">${S.voltage}</span> V</div>
      <input type="range" min="1" max="12" step="1" value="${S.voltage}" oninput="simState.res1.voltage=+this.value;document.getElementById('res1v').textContent=this.value">
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">〰️ المقاومة: <span class="ctrl-val" id="res1r">${S.resistance}</span> Ω</div>
      <input type="range" min="2" max="40" step="2" value="${S.resistance}" oninput="simState.res1.resistance=+this.value;document.getElementById('res1r').textContent=this.value">
    </div>
    <div class="info-box" style="font-size:13px;line-height:2">
      التيار = الجهد ÷ المقاومة<br>
      I = V ÷ R<br>
      I = <span id="res1i">${(S.voltage/S.resistance).toFixed(2)}</span> A
    </div>`);

  function draw(){
    if(currentSim!=='resistance'||currentTab!==0)return;
    S.t+=.04;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle='#F5F8FF'; c.fillRect(0,0,w,h);
    U9.grid(c,w,h,'rgba(80,120,200,0.05)',44);

    const el=document.getElementById('res1i'); if(el) el.textContent=(S.voltage/S.resistance).toFixed(2);
    const I=S.voltage/S.resistance;
    const brightness=Math.min(1,I/0.6);

    const top=h*.22,bot=h*.72,left=w*.1,right=w*.85;
    // دائرة
    const wc=`hsl(${200+I*30},70%,45%)`;
    c.strokeStyle=wc; c.lineWidth=3; c.lineCap='round';
    [[left,top,right,top],[left,bot,right,bot],[left,top,left,bot]].forEach(([ax,ay,bx,by])=>{
      c.beginPath(); c.moveTo(ax,ay); c.lineTo(bx,by); c.stroke();
    });
    // رسم المقاومة على السلك العلوي
    const rCX=w*.55,rCY=top;
    c.strokeStyle=wc; c.lineWidth=3;
    c.beginPath(); c.moveTo(right,top); c.lineTo(rCX+48,top); c.stroke();
    c.beginPath(); c.moveTo(left+4,top); c.lineTo(rCX-48,top); c.stroke();
    // رمز المقاومة (مستطيل متعرج)
    c.fillStyle='#FFF'; c.strokeStyle='#E67E22'; c.lineWidth=2;
    c.beginPath(); c.roundRect(rCX-48,top-12,96,24,4); c.fill(); c.stroke();
    c.font='bold 11px monospace'; c.fillStyle='#E67E22'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(`${S.resistance} Ω`,rCX,top);
    c.font='10px Tajawal'; c.fillStyle='#888'; c.textBaseline='top'; c.fillText('مقاومة',rCX,top+14);

    // البطارية
    _drawBattery(c,left,(top+bot)/2,S.voltage);

    // المصباح
    _drawBulb(c,right,(top+bot)/2,true,S.t,brightness);
    c.beginPath(); c.moveTo(right,top); c.lineTo(right,(top+bot)/2-24); c.stroke();
    c.beginPath(); c.moveTo(right,(top+bot)/2+24); c.lineTo(right,bot); c.stroke();

    // الإلكترونات
    const pathSegs=[(right-left),(bot-top)/2+24,(bot-top)/2+24,(right-left)];
    const pathPts=[{x:left,y:top},{x:right,y:top},{x:right,y:bot},{x:left,y:bot}];
    const totalL=pathSegs.reduce((a,b)=>a+b,0);
    const eSpeed=Math.min(I*.15,.08);
    for(let ei=0;ei<6;ei++){
      const d=((S.t*eSpeed+ei/6)%1)*totalL;
      let cum=0,ex=left,ey=top;
      for(let si=0;si<4;si++){
        if(d<=cum+pathSegs[si]){
          const r2=(d-cum)/pathSegs[si];
          ex=pathPts[si].x+(pathPts[(si+1)%4].x-pathPts[si].x)*r2;
          ey=pathPts[si].y+(pathPts[(si+1)%4].y-pathPts[si].y)*r2; break;
        }
        cum+=pathSegs[si];
      }
      c.fillStyle=`rgba(41,128,185,${0.5+brightness*.4})`; c.beginPath(); c.arc(ex,ey,4,0,Math.PI*2); c.fill();
    }

    // الأميتر
    const amX=w*.5,amY=bot+36,amR=30;
    c.strokeStyle='#2C3E50'; c.lineWidth=2;
    c.beginPath(); c.arc(amX,amY,amR,Math.PI,0); c.stroke();
    c.beginPath(); c.moveTo(amX-amR,amY); c.lineTo(amX+amR,amY); c.stroke();
    const ang3=Math.PI*(1-Math.min(1,I/.6));
    c.strokeStyle='#E74C3C'; c.lineWidth=2;
    c.beginPath(); c.moveTo(amX,amY); c.lineTo(amX+Math.cos(ang3)*amR*.8,amY-Math.sin(ang3)*amR*.8); c.stroke();
    c.font='10px Tajawal'; c.fillStyle='#555'; c.textAlign='center'; c.textBaseline='top';
    c.fillText('A',amX,amY+5); c.fillText(`${I.toFixed(2)}A`,amX,amY+18);

    U9.txt(c,`I = ${S.voltage}V ÷ ${S.resistance}Ω = ${I.toFixed(2)}A`,w/2,h*.9,'#555',13,true);
    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 11-11 · TAB 2 — المقاومة المتغيرة
// ══════════════════════════════════════════════════════════════
function simResistance2() {
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.res2) simState.res2={voltage:6,slider:0.5,t:0};
  const S=simState.res2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔋 الجهد: <span class="ctrl-val" id="res2v">${S.voltage}</span> V</div>
      <input type="range" min="3" max="9" step="3" value="${S.voltage}" oninput="simState.res2.voltage=+this.value;document.getElementById('res2v').textContent=this.value">
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🎛️ منزلق المقاومة المتغيرة</div>
      <input type="range" min="0" max="1" step="0.05" value="${S.slider}" oninput="simState.res2.slider=+this.value">
      <div style="display:flex;justify-content:space-between;font-size:11px;color:#888;padding:0 2px">
        <span>أدنى مقاومة</span><span>أعلى مقاومة</span>
      </div>
    </div>
    <div class="info-box" style="font-size:12px;line-height:1.9">
      المقاومة: <strong id="res2r">—</strong> Ω<br>
      التيار: <strong id="res2i">—</strong> A<br>
      <em>حرّك المنزلق وشوف الفرق</em>
    </div>`);

  function draw(){
    if(currentSim!=='resistance'||currentTab!==1)return;
    S.t+=.04;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#FFF8EE'); bg.addColorStop(1,'#FAEEDD');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    const R=Math.max(2,Math.round(S.slider*38+2));
    const I=+(S.voltage/R).toFixed(2);
    const brightness=Math.min(1,I/.6);
    const el1=document.getElementById('res2r'); if(el1) el1.textContent=R;
    const el2=document.getElementById('res2i'); if(el2) el2.textContent=I.toFixed(2);

    const top=h*.22,bot=h*.7,left=w*.1,right=w*.82;
    const wc=`hsl(${40+I*80},75%,45%)`;
    c.strokeStyle=wc; c.lineWidth=3; c.lineCap='round';
    [[left,top,right,top],[left,bot,right,bot],[left,top,left,bot]].forEach(([ax,ay,bx,by])=>{
      c.beginPath(); c.moveTo(ax,ay); c.lineTo(bx,by); c.stroke();
    });

    // المقاومة المتغيرة على السلك العلوي
    const rvX=w*.5, rvY=top;
    c.strokeStyle=wc; c.lineWidth=3;
    c.beginPath(); c.moveTo(right,top); c.lineTo(rvX+60,top); c.stroke();
    c.beginPath(); c.moveTo(left+4,top); c.lineTo(rvX-60,top); c.stroke();
    // رسم مقاومة متغيرة (مستطيل + سهم)
    c.fillStyle='#FFF9EE'; c.strokeStyle='#E67E22'; c.lineWidth=2;
    c.beginPath(); c.roundRect(rvX-60,top-12,120,24,4); c.fill(); c.stroke();
    // شريط داخلي
    c.fillStyle='#F39C12'; c.beginPath(); c.roundRect(rvX-58,top-6,S.slider*116,12,3); c.fill();
    // منزلق
    const sliderX=rvX-60+S.slider*116;
    c.fillStyle='#E74C3C'; c.beginPath(); c.roundRect(sliderX-6,top-18,12,36,3); c.fill();
    c.font='10px Tajawal'; c.fillStyle='#E67E22'; c.textAlign='center'; c.textBaseline='top';
    c.fillText(`${R} Ω`,rvX,top+14);

    _drawBattery(c,left,(top+bot)/2,S.voltage);
    _drawBulb(c,right,(top+bot)/2,true,S.t,brightness);
    c.strokeStyle=wc; c.lineWidth=3; c.lineCap='round';
    c.beginPath(); c.moveTo(right,top); c.lineTo(right,(top+bot)/2-24); c.stroke();
    c.beginPath(); c.moveTo(right,(top+bot)/2+24); c.lineTo(right,bot); c.stroke();

    // إلكترونات
    const pPts=[{x:left,y:top},{x:right,y:top},{x:right,y:bot},{x:left,y:bot}];
    const pSegs=[(right-left),(bot-top)/2+24,(bot-top)/2+24,(right-left)];
    const tL=pSegs.reduce((a,b)=>a+b,0);
    const spd=Math.max(0.01,I*.12);
    for(let ei=0;ei<5;ei++){
      const d=((S.t*spd+ei/5)%1)*tL;
      let cum=0,ex=left,ey2=top;
      for(let si=0;si<4;si++){
        if(d<=cum+pSegs[si]){
          const r2=(d-cum)/pSegs[si];
          ex=pPts[si].x+(pPts[(si+1)%4].x-pPts[si].x)*r2;
          ey2=pPts[si].y+(pPts[(si+1)%4].y-pPts[si].y)*r2; break;
        }
        cum+=pSegs[si];
      }
      c.fillStyle=`rgba(41,128,185,0.8)`; c.beginPath(); c.arc(ex,ey2,4,0,Math.PI*2); c.fill();
    }

    // مقياس سطوع
    const bX=w*.88,bY=h*.3,bH=h*.4,bW=16;
    c.fillStyle='#E8E8E8'; c.beginPath(); c.roundRect(bX,bY,bW,bH,6); c.fill();
    const bGrad=c.createLinearGradient(0,bY+bH,0,bY);
    bGrad.addColorStop(0,'#FFF3CD'); bGrad.addColorStop(1,'#FFD700');
    c.fillStyle=bGrad; c.beginPath(); c.roundRect(bX,bY+bH*(1-brightness),bW,bH*brightness,6); c.fill();
    c.font='9px Tajawal'; c.fillStyle='#555'; c.textAlign='center'; c.textBaseline='top';
    c.fillText('سطوع',bX+bW/2,bY+bH+4);

    U9.txt(c,`V=${S.voltage} R=${R}Ω I=${I.toFixed(2)}A`,w/2,h*.88,'#555',13,true);
    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }
  draw();
}
// ══════════════════════════════════════════════════════════════
// 11-12 · TAB 1 — الدائرة المتوازية (مستقل)
// ══════════════════════════════════════════════════════════════
function simParallel12a() {
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.p12a) simState.p12a={bulbs:[true,true,true],voltage:6,t:0};
  const S=simState.p12a;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔋 الجهد: <span class="ctrl-val" id="p12aV">${S.voltage}</span> V</div>
      <input type="range" min="3" max="9" step="3" value="${S.voltage}" oninput="simState.p12a.voltage=+this.value;document.getElementById('p12aV').textContent=this.value">
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">💡 افصل / وصّل مصباحاً</div>
      ${[0,1,2].map(i=>`<button class="ctrl-btn${S.bulbs[i]?' play':''}" onclick="simState.p12a.bulbs[${i}]=!simState.p12a.bulbs[${i}]">💡 مصباح ${['١','٢','٣'][i]}</button>`).join('')}
    </div>
    <div class="info-box" style="font-size:13px;line-height:2">
      ✅ في التوازي:<br>
      كل مصباح فرع <strong>مستقل</strong><br>
      إيقاف واحد لا يؤثر على الباقين
    </div>`);

  function draw(){
    if(currentSim!=='parallel12'||currentTab!==0)return;
    S.t+=.04;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle='#F0FFF4'; c.fillRect(0,0,w,h);
    U9.grid(c,w,h,'rgba(40,150,80,0.05)',44);

    const rTop=h*.22,rBot=h*.72,mL=w*.1;
    const brXs=[w*.4,w*.6,w*.8];
    const I_branch=+(S.voltage/15).toFixed(2);

    // الشينات الرئيسية
    c.strokeStyle='#555'; c.lineWidth=3; c.lineCap='round';
    c.beginPath(); c.moveTo(mL,rTop); c.lineTo(brXs[2]+22,rTop); c.stroke();
    c.beginPath(); c.moveTo(mL,rBot); c.lineTo(brXs[2]+22,rBot); c.stroke();
    c.beginPath(); c.moveTo(mL,rTop); c.lineTo(mL,rBot); c.stroke();

    _drawBattery(c,mL,(rTop+rBot)/2,S.voltage);

    brXs.forEach((bx,i)=>{
      const on=S.bulbs[i];
      c.strokeStyle=on?'#27AE60':'#CCC'; c.lineWidth=on?2.5:1.5;
      c.beginPath(); c.moveTo(bx,rTop); c.lineTo(bx,rBot); c.stroke();
      _drawBulb(c,bx,(rTop+rBot)/2,on,S.t+i);
      // إلكترون في الفرع
      if(on){
        const ey=rTop+((S.t*.5+i*.33)%1)*(rBot-rTop);
        c.fillStyle='rgba(39,174,96,.8)'; c.beginPath(); c.arc(bx,ey,4,0,Math.PI*2); c.fill();
      }
      c.font='10px Tajawal'; c.fillStyle=on?'#27AE60':'#C0392B'; c.textAlign='center'; c.textBaseline='top';
      c.fillText(on?`${I_branch}A`:'مفصول',bx,(rTop+rBot)/2+28);
    });

    const onCnt=S.bulbs.filter(b=>b).length;
    const Itotal=+(onCnt*I_branch).toFixed(2);
    U9.txt(c,`${onCnt} مصابيح تضيء · I الكلي = ${Itotal} A`,w/2,h*.1,'#1E8449',13,true);
    if(onCnt<3) U9.txt(c,'✅ الفروع المتبقية تعمل باستقلالية!',w/2,h*.88,'#27AE60',12,true);
    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 11-12 · TAB 2 — مقارنة التسلسل والتوازي
// ══════════════════════════════════════════════════════════════
function simParallel12b() {
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.p12b) simState.p12b={voltage:6,t:0,running:false};
  const S=simState.p12b;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔋 الجهد: <span class="ctrl-val" id="p12bV">${S.voltage}</span> V</div>
      <input type="range" min="3" max="9" step="3" value="${S.voltage}" oninput="simState.p12b.voltage=+this.value;document.getElementById('p12bV').textContent=this.value">
    </div>
    <button class="ctrl-btn play" onclick="simState.p12b.running=true;simState.p12b.t=0">▶ قارن</button>
    <button class="ctrl-btn reset" onclick="simState.p12b.running=false;simState.p12b.t=0">↺ إعادة</button>
    <div class="info-box" style="font-size:12px;line-height:1.9">
      تسلسل: تيار واحد عبر الكل<br>
      توازي: كل فرع له تياره<br>
      <em>المنازل تستخدم التوازي!</em>
    </div>`);

  function draw(){
    if(currentSim!=='parallel12'||currentTab!==1)return;
    if(S.running) S.t+=.025;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle='#FAFBFF'; c.fillRect(0,0,w,h);
    U9.grid(c,w,h,'rgba(80,100,200,0.05)',44);

    // ===== الجانب الأيسر: تسلسل =====
    const lMid=w*.25, top=h*.2, bot=h*.72;
    const Is=+(S.voltage/30).toFixed(2);
    U9.txt(c,'التسلسل',lMid,top-18,'#8E44AD',13,true);

    c.strokeStyle='#8E44AD'; c.lineWidth=2.5;
    [[lMid-60,top,lMid+60,top],[lMid-60,bot,lMid+60,bot],
     [lMid-60,top,lMid-60,bot],[lMid+60,top,lMid+60,bot]].forEach(([ax,ay,bx,by])=>{
      c.beginPath(); c.moveTo(ax,ay); c.lineTo(bx,by); c.stroke();
    });
    _drawBattery(c,lMid-60,(top+bot)/2,S.voltage);
    [lMid,lMid+40].forEach((bx,i)=>_drawBulb(c,bx,top,true,S.t+i,Math.min(1,Is/0.1)));
    c.font='11px Tajawal'; c.fillStyle='#8E44AD'; c.textAlign='center'; c.textBaseline='top';
    c.fillText(`I = ${Is} A (أضعف)`,lMid,bot+10);
    // إلكترون
    if(S.running){
      const pLen=(lMid+60-lMid+60)*2+(bot-top)*2;
      const d=((S.t*.3)%1)*pLen;
      const pts=[{x:lMid-60,y:top},{x:lMid+60,y:top},{x:lMid+60,y:bot},{x:lMid-60,y:bot}];
      const segs=[120,(bot-top),120,(bot-top)];
      let cum=0,ex=lMid-60,ey=top;
      for(let si=0;si<4;si++){
        if(d<=cum+segs[si]){const r2=(d-cum)/segs[si]; ex=pts[si].x+(pts[(si+1)%4].x-pts[si].x)*r2; ey=pts[si].y+(pts[(si+1)%4].y-pts[si].y)*r2; break;} cum+=segs[si];
      }
      c.fillStyle='rgba(142,68,173,.8)'; c.beginPath(); c.arc(ex,ey,4,0,Math.PI*2); c.fill();
    }

    // ===== الجانب الأيمن: توازي =====
    const rMid=w*.75;
    const Ip=+(S.voltage/15).toFixed(2);
    U9.txt(c,'التوازي',rMid,top-18,'#27AE60',13,true);

    c.strokeStyle='#555'; c.lineWidth=2.5;
    c.beginPath(); c.moveTo(rMid-60,top); c.lineTo(rMid+60,top); c.stroke();
    c.beginPath(); c.moveTo(rMid-60,bot); c.lineTo(rMid+60,bot); c.stroke();
    c.beginPath(); c.moveTo(rMid-60,top); c.lineTo(rMid-60,bot); c.stroke();
    _drawBattery(c,rMid-60,(top+bot)/2,S.voltage);
    [rMid,rMid+40].forEach((bx,i)=>{
      c.strokeStyle='#27AE60'; c.lineWidth=2;
      c.beginPath(); c.moveTo(bx,top); c.lineTo(bx,bot); c.stroke();
      _drawBulb(c,bx,(top+bot)/2,true,S.t+i,Math.min(1,Ip/0.3));
      if(S.running){
        const ey2=top+((S.t*.5+i*.5)%1)*(bot-top);
        c.fillStyle='rgba(39,174,96,.8)'; c.beginPath(); c.arc(bx,ey2,4,0,Math.PI*2); c.fill();
      }
    });
    c.font='11px Tajawal'; c.fillStyle='#27AE60'; c.textAlign='center'; c.textBaseline='top';
    c.fillText(`I = ${Ip}A×2 (أقوى)`,rMid,bot+10);

    // فاصل
    c.strokeStyle='#DDD'; c.lineWidth=1; c.setLineDash([6,4]);
    c.beginPath(); c.moveTo(w*.5,top-30); c.lineTo(w*.5,bot+30); c.stroke();
    c.setLineDash([]);

    if(!S.running) U9.txt(c,'⬆ اضغط "قارن" لبدء المقارنة',w/2,h*.88,'#888',12,true);
    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }
  draw();
}

(function(){
  var landing = document.getElementById('landing');
  if(!landing) return;

  var bg     = document.getElementById('px-bg');
  var scene  = document.getElementById('px-scene');
  var dune1  = document.getElementById('px-dune1');
  var dune2  = document.getElementById('px-dune2');
  var dune3  = document.getElementById('px-dune3');
  var hero   = document.querySelector('.hero-illustration');
  var heroTxt= document.querySelector('.hero-text');

  var ticking = false;

  function onScroll() {
    if(!ticking){
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  function onMouse(e) {
    var cx = (e.clientX / window.innerWidth  - 0.5) * 2;
    var cy = (e.clientY / window.innerHeight - 0.5) * 2;
    applyMouse(cx, cy);
  }

  function applyMouse(cx, cy) {
    if(bg)    bg.style.transform    = `translate(${cx*10}px, ${cy*8}px) scale(1.04)`;
    if(hero)  hero.style.transform  = `translate(${cx*-14}px, ${cy*-10}px)`;
    if(heroTxt) heroTxt.style.transform = `translate(${cx*6}px, ${cy*4}px)`;
    if(dune1) dune1.style.transform = `translateX(${cx*18}px)`;
    if(dune2) dune2.style.transform = `translateX(${cx*10}px)`;
    if(dune3) dune3.style.transform = `translateX(${cx*5}px)`;
  }

  function update() {
    var scrollY = window.scrollY || 0;
    if(scene) scene.style.transform = `translateY(${scrollY * 0.3}px)`;
    ticking = false;
  }

  landing.addEventListener('mousemove', onMouse, {passive:true});
  window.addEventListener('scroll', onScroll, {passive:true});

  var style = document.createElement('style');
  style.textContent = `
    #px-bg { transition: transform 0.1s ease-out; }
    .hero-illustration { transition: transform 0.12s ease-out; }
    .hero-text { transition: transform 0.10s ease-out; }
    #px-dune1,#px-dune2,#px-dune3 { transition: transform 0.08s ease-out; }
  `;
  document.head.appendChild(style);
})();

/* ── Nature Sounds Engine ── */
(function(){
  var _ac = null;
  var _nodes = {};   // active sound nodes
  var _current = null;

  function getAC(){
    if(!_ac) _ac = new (window.AudioContext||window.webkitAudioContext)();
    if(_ac.state==='suspended') _ac.resume();
    return _ac;
  }

  // ── صوت العصفور (chirp) ──
  function chirp(ac, freq, t, vol){
    vol = vol || 0.12;
    var osc = ac.createOscillator();
    var gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq*1.5, t+0.06);
    osc.frequency.exponentialRampToValueAtTime(freq*1.2, t+0.12);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t+0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t+0.18);
    osc.start(t); osc.stop(t+0.2);
  }

  function startBirds(vol, interval){
    vol = vol || 0.12; interval = interval || 1800;
    var ac = getAC(), stopped = false;
    function schedule(){
      if(stopped) return;
      var now = ac.currentTime;
      var freqs = [1800,2200,1600,2500];
      var n = Math.floor(Math.random()*2)+1;
      for(var i=0;i<n;i++){
        var f = freqs[Math.floor(Math.random()*freqs.length)];
        chirp(ac, f*(0.9+Math.random()*0.2), now+Math.random()*0.3, vol);
        if(Math.random()>0.6)
          chirp(ac, f*0.8, now+0.22+Math.random()*0.2, vol);
      }
      _nodes.birdsTimer = setTimeout(schedule, interval+Math.random()*interval);
    }
    schedule();
    return function(){ stopped=true; clearTimeout(_nodes.birdsTimer); };
  }

  // ── صوت الموج ──
  function startOcean(vol){
    vol = vol || 0.18;
    var ac = getAC(), mg = ac.createGain(), stopped = false;
    mg.gain.value = vol; mg.connect(ac.destination);
    function makeWave(freq, delay){
      if(stopped) return;
      var buf = ac.createBuffer(1, ac.sampleRate*2.5, ac.sampleRate);
      var d = buf.getChannelData(0);
      for(var i=0;i<d.length;i++) d[i]=(Math.random()*2-1);
      var src=ac.createBufferSource(); src.buffer=buf;
      var flt=ac.createBiquadFilter(); flt.type='bandpass'; flt.frequency.value=freq; flt.Q.value=0.8;
      var g=ac.createGain(), t=ac.currentTime+delay;
      g.gain.setValueAtTime(0,t);
      g.gain.linearRampToValueAtTime(1,t+0.8);
      g.gain.setValueAtTime(1,t+1.2);
      g.gain.exponentialRampToValueAtTime(0.001,t+2.4);
      src.connect(flt); flt.connect(g); g.connect(mg);
      src.start(t); src.stop(t+2.5);
      if(!stopped) setTimeout(function(){ makeWave(freq,0); }, (delay+1800+Math.random()*600));
    }
    makeWave(300,0); makeWave(250,0.7); makeWave(200,1.4);
    return function(){ stopped=true; try{mg.gain.linearRampToValueAtTime(0,ac.currentTime+0.5);}catch(e){} };
  }

  // ── ريح خفيفة ──
  function startWind(vol){
    vol = vol || 0.04;
    var ac=getAC(), buf=ac.createBuffer(1,ac.sampleRate*4,ac.sampleRate);
    var d=buf.getChannelData(0);
    for(var i=0;i<d.length;i++) d[i]=(Math.random()*2-1);
    var src=ac.createBufferSource(); src.buffer=buf; src.loop=true;
    var flt=ac.createBiquadFilter(); flt.type='lowpass'; flt.frequency.value=350;
    var g=ac.createGain(); g.gain.value=vol;
    src.connect(flt); flt.connect(g); g.connect(ac.destination); src.start();
    return function(){ try{src.stop();}catch(e){} };
  }

  // ── غابة هادئة (عصفور نادر + ريح خفيفة) ──
  function startForest(){
    var s1=startWind(0.025);
    var s2=startBirds(0.04, 4000);
    return function(){ s1(); s2(); };
  }

  // ── مختبر (نقرات وطنين خفيف جداً) ──
  function startLab(){
    var ac=getAC(), stopped=false;
    // طنين هادئ جداً = صوت تهوية المختبر
    var buf=ac.createBuffer(1,ac.sampleRate*3,ac.sampleRate);
    var d=buf.getChannelData(0);
    for(var i=0;i<d.length;i++) d[i]=(Math.random()*2-1);
    var src=ac.createBufferSource(); src.buffer=buf; src.loop=true;
    var flt=ac.createBiquadFilter(); flt.type='highpass'; flt.frequency.value=800;
    var g=ac.createGain(); g.gain.value=0.015;
    src.connect(flt); flt.connect(g); g.connect(ac.destination); src.start();
    // نقرة خفيفة متقطعة أحياناً
    function drip(){
      if(stopped) return;
      var osc=ac.createOscillator(), gg=ac.createGain();
      osc.connect(gg); gg.connect(ac.destination);
      osc.type='sine'; osc.frequency.value=900+Math.random()*400;
      var t=ac.currentTime;
      gg.gain.setValueAtTime(0,t);
      gg.gain.linearRampToValueAtTime(0.04,t+0.01);
      gg.gain.exponentialRampToValueAtTime(0.001,t+0.15);
      osc.start(t); osc.stop(t+0.16);
      _nodes.labTimer=setTimeout(drip, 3000+Math.random()*4000);
    }
    drip();
    return function(){ stopped=true; clearTimeout(_nodes.labTimer); try{src.stop();}catch(e){} };
  }

  // ── حفيف هواء خفيف (للقوى) ──
  function startWhoosh(){
    var ac=getAC(), stopped=false;
    function puff(){
      if(stopped) return;
      var buf=ac.createBuffer(1,ac.sampleRate*0.4,ac.sampleRate);
      var d=buf.getChannelData(0);
      for(var i=0;i<d.length;i++) d[i]=(Math.random()*2-1);
      var src=ac.createBufferSource(); src.buffer=buf;
      var flt=ac.createBiquadFilter(); flt.type='bandpass'; flt.frequency.value=600; flt.Q.value=1.5;
      var g=ac.createGain(), t=ac.currentTime;
      g.gain.setValueAtTime(0,t);
      g.gain.linearRampToValueAtTime(0.05,t+0.05);
      g.gain.exponentialRampToValueAtTime(0.001,t+0.35);
      src.connect(flt); flt.connect(g); g.connect(ac.destination);
      src.start(t); src.stop(t+0.4);
      _nodes.whooshTimer=setTimeout(puff, 4000+Math.random()*3000);
    }
    puff();
    return function(){ stopped=true; clearTimeout(_nodes.whooshTimer); };
  }

  // ── خريطة الاستقصاءات للأصوات ──
  var SOUND_MAP = {
    // نشاط 7-5: الإنسان — يُتحكم فيه عبر openSim مباشرة (بحر أو عصافير حسب التاب)
    // نشاط 7: البيئة
    foodchain:      'birds_soft',
    foodweb:        'birds_soft',
    decomposer:     'forest',
    conservation:   'birds_soft',
    pollution:      'wind_soft',
    ozone:          'wind_soft',
    // نشاط 8: المواد — بدون صوت
    // metals, nonmetals, metalcompare, materials
    // نشاط 10: التصنيف
    variation:      'birds_soft',
    plantclass:     'forest',
    vertebrates:    'birds_soft',
    invertebrates:  'forest',
    dichotomous:    'birds_soft',
    // genetics — بدون صوت
    // نشاط 11: الأحماض — بدون صوت
    // acidbase, indicator, phscale, neutralisation, neutralapp, acidinquiry
  };

  var _stopFn = null;

  function stopCurrent(){
    if(_stopFn){ try{_stopFn();}catch(e){} _stopFn=null; }
    _current=null;
  }

  function playSoundFor(simType){
    var sound = SOUND_MAP[simType] || null;
    if(sound===_current) return;
    stopCurrent();
    if(!sound) return;
    _current=sound;
    try{
      if(sound==='birds')       _stopFn=startBirds(0.12,1800);
      else if(sound==='birds_soft') _stopFn=startBirds(0.05,3500);
      else if(sound==='ocean')  _stopFn=startOcean(0.18);
      else if(sound==='forest') _stopFn=startForest();
      else if(sound==='lab')    _stopFn=startLab();
      else if(sound==='whoosh') _stopFn=startWhoosh();
      else if(sound==='wind_soft') _stopFn=startWind(0.03);
    }catch(e){ console.warn('Nature sound error:',e); }
  }

  // ── ربط مع openSim و closeSim ──
  var _origOpenSim = window.openSim;
  window.openSim = function(type){
    if(_origOpenSim) _origOpenSim(type);
    setTimeout(function(){
      if(type==='human'){
        // تاب 0 = صيد الأسماك → بحر ، تاب 1 = زراعة → عصافير
        var tab = window.currentTab || 0;
        var sound = tab===0 ? 'ocean' : 'birds';
        stopCurrent(); _current=sound;
        try{ _stopFn = sound==='ocean' ? startOcean(0.18) : startBirds(0.12,1800); }catch(e){}
      } else {
        playSoundFor(type);
      }
    }, 1200);
  };

  // عند تبديل تاب في استقصاء الإنسان

  var _origCloseSim = window.closeSim;
  window.closeSim = function(){
    if(_origCloseSim) _origCloseSim();
    stopCurrent();
  };

  window._playSoundFor = playSoundFor;
  window._stopNatureSound = stopCurrent;
  window._playOcean = function(){ stopCurrent(); _current='ocean'; try{_stopFn=startOcean(0.18);}catch(e){} };
  window._playBirds = function(){ stopCurrent(); _current='birds'; try{_stopFn=startBirds(0.12,1800);}catch(e){} };
})();

// ══════════════════════════════════════════════════════════════
