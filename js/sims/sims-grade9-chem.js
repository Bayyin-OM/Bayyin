// ══════════════════════════════════════════════════════════
// الصف التاسع — الوحدة التاسعة: التحليل الكيميائي
// ══════════════════════════════════════════════════════════

function _drawBeakerU9(c,x,y,w,h,liqCol,liqAlpha){
  const a=Math.max(0,Math.min(1,liqAlpha));
  const hex=Math.round(a*255).toString(16).padStart(2,'0');
  c.fillStyle=liqCol+hex;
  c.fillRect(x,y+h*0.05,w,h*0.95);
  c.strokeStyle='#90A4AE'; c.lineWidth=3;
  c.beginPath(); c.moveTo(x,y); c.lineTo(x,y+h); c.lineTo(x+w,y+h); c.lineTo(x+w,y); c.stroke();
}
function _lbl(c,txt,x,y,col,sz){
  c.fillStyle=col||'#1E2D3D';
  c.font=`bold ${sz||13}px Tajawal`;
  c.textAlign='center'; c.textBaseline='alphabetic';
  c.fillText(txt,x,y);
}
function _bubbles(c,bx,by,bw,bh,t,col){
  for(let i=0;i<8;i++){
    const px=bx+10+((i*137+t*0.7)%(bw-20));
    const py=by+bh-(((t*0.8+i*60)%(bh*0.85)));
    c.fillStyle=col||'rgba(255,255,255,0.7)';
    c.beginPath(); c.arc(px,py,2+i%3,0,Math.PI*2); c.fill();
  }
}

// ══ 9-1 Tab 1: الكشف عن الماء ══
function simG9WaterGas1(){
  cancelAnimationFrame(animFrame);
  simState={t:0, selected:0, waterAdded:false};
  const S=simState;
  const tests=[
    {name:'كبريتات النحاس (II) اللامائية', formula:'CuSO₄ (لامائي)', before:'أبيض', after:'أزرق', beforeCol:'#F5F5F5', afterCol:'#1A8FA8', icon:'🔵', eq:'CuSO₄ + 5H₂O → CuSO₄·5H₂O', desc:'يتحوّل من الأبيض إلى الأزرق — ذلك يؤكّد وجود الماء'},
    {name:'كلوريد الكوبالت (II) اللامائي', formula:'CoCl₂ (لامائي)', before:'أزرق', after:'وردي', beforeCol:'#1A5FB4', afterCol:'#E91E8C', icon:'🩷', eq:'CoCl₂ + 6H₂O → CoCl₂·6H₂O', desc:'يتحوّل من الأزرق إلى الوردي — كاشف حسّاس جداً للرطوبة'},
    {name:'ورق كاشف الكوبالت (II)', formula:'ورقة تبّاع الشمس الكوبالتية', before:'أزرق', after:'وردي', beforeCol:'#1A6ECC', afterCol:'#F06292', icon:'📄', eq:'CoCl₂(أزرق) + H₂O → CoCl₂·H₂O(وردي)', desc:'الورق يتغيّر من الأزرق إلى الوردي عند تعرّضه للبخار'},
  ];
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧪 اختر الكاشف اللامائي</div>
      <div class="ctrl-btns-grid-1">
        ${tests.map((t,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="wt-btn-${i}" onclick="simState.selected=${i};simState.waterAdded=false;document.querySelectorAll('[id^=wt-btn-]').forEach((b,j)=>b.classList.toggle('active',j===${i}))">${t.icon} ${t.name}</button>`).join('')}
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn action" onclick="simState.waterAdded=true">💧 أضِف الماء</button>
        <button class="ctrl-btn" onclick="simState.waterAdded=false">🔄 إعادة</button>
      </div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا نُسمّي هذه المواد "لامائية"؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">اللامائي (Anhydrous) يعني "بلا ماء". عند تسخين هذه المركّبات تفقد جزيئات الماء. عند إعادة إضافة الماء تُصبح "مائية" (Hydrated) وتغيّر لونها. هذه الخاصية تجعلها كواشف ممتازة للكشف عن وجود الماء!</div>
    </div>`);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9watergas'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const test=tests[S.selected||0];
    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#E3F2FD'); bg.addColorStop(1,'#BBDEFB');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    _lbl(c,'اختبار الكشف عن الماء — الكواشف اللامائية',w/2,h*0.07,'#0D47A1',Math.max(12,w*0.022));
    // Before beaker
    const bw2=w*0.27, bh2=h*0.38, by2=h*0.14;
    const bx1=w*0.07;
    _drawBeakerU9(c,bx1,by2,bw2,bh2,test.beforeCol,0.4);
    c.font=`${Math.max(20,w*0.038)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(test.icon,bx1+bw2/2,by2+bh2*0.45);
    _lbl(c,'قبل الإضافة',bx1+bw2/2,by2+bh2+18,'#555',Math.max(10,w*0.018));
    _lbl(c,test.before,bx1+bw2/2,by2+bh2+34,test.beforeCol,Math.max(10,w*0.018));
    // Arrow
    const ax=w*0.40, ay=by2+bh2*0.4;
    c.strokeStyle='#1565C0'; c.lineWidth=2;
    c.beginPath(); c.moveTo(ax,ay); c.lineTo(ax+w*0.14,ay); c.stroke();
    c.fillStyle='#1565C0'; c.beginPath(); c.moveTo(ax+w*0.14,ay); c.lineTo(ax+w*0.14-10,ay-6); c.lineTo(ax+w*0.14-10,ay+6); c.closePath(); c.fill();
    if(S.waterAdded){
      c.fillStyle='#1A8FA8'; c.font=`${Math.max(13,w*0.023)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('💧 H₂O',ax+w*0.07,ay-18);
    }
    // After beaker
    const bx2=w*0.61;
    const afterCol=S.waterAdded?test.afterCol:test.beforeCol;
    const afterAlpha=S.waterAdded?0.55:0.15;
    _drawBeakerU9(c,bx2,by2,bw2,bh2,afterCol,afterAlpha);
    if(S.waterAdded) _bubbles(c,bx2,by2,bw2,bh2,S.t,'rgba(255,255,255,0.5)');
    c.font=`${Math.max(20,w*0.038)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(test.icon,bx2+bw2/2,by2+bh2*0.45);
    _lbl(c,'بعد الإضافة',bx2+bw2/2,by2+bh2+18,'#555',Math.max(10,w*0.018));
    _lbl(c,S.waterAdded?test.after:test.before,bx2+bw2/2,by2+bh2+34,S.waterAdded?test.afterCol:test.beforeCol,Math.max(10,w*0.018));
    // Result
    if(S.waterAdded){
      const ry=h*0.66, rh=h*0.19;
      c.fillStyle='rgba(26,143,168,0.12)'; c.beginPath(); c.roundRect(w*0.04,ry,w*0.92,rh,12); c.fill();
      c.fillStyle='#1A8FA8'; c.font=`bold ${Math.max(11,w*0.021)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
      c.fillText('✅ تغيُّر اللون يؤكّد وجود الماء',w/2,ry+6);
      c.fillStyle='#555'; c.font=`${Math.max(9,w*0.016)}px Tajawal`;
      c.fillText(test.eq,w/2,ry+rh*0.45);
      c.fillText(test.desc,w/2,ry+rh*0.72);
    }
    c.fillStyle='#0D47A1'; c.font=`bold ${Math.max(10,w*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText(test.formula,w/2,h*0.11);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ 9-1 Tab 2: O₂ و H₂ ══
function simG9WaterGas2(){
  cancelAnimationFrame(animFrame);
  simState={t:0, gas:0, testing:false, progress:0};
  const S=simState;
  const gases=[
    {name:'الأكسجين O₂', icon:'O₂', col:'#1A8FA8', bgCol:'#E0F7FA', test:'عود ثقاب مُتوهِّج', result:'يشتعل العود 🔥', resultSub:'الأكسجين يُساعد على الاحتراق لكنه لا يحترق بنفسه', effect:'glow'},
    {name:'الهيدروجين H₂', icon:'H₂', col:'#E74C3C', bgCol:'#FFF3E0', test:'عود ثقاب مُشتعل', result:'فرقعة حادة 💥', resultSub:'2H₂ + O₂ → 2H₂O — احتراق متفجّر', effect:'pop'},
  ];
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧪 اختر الغاز</div>
      <div class="ctrl-btns-grid">
        ${gases.map((g,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="gas2b-${i}" onclick="simState.gas=${i};simState.testing=false;simState.progress=0;document.querySelectorAll('[id^=gas2b-]').forEach((b,j)=>b.classList.toggle('active',j===${i}))">${g.icon}</button>`).join('')}
      </div>
    </div>
    <div class="ctrl-section">
      <button class="ctrl-btn action" onclick="simState.testing=true;simState.progress=0">🔬 ابدأ الاختبار</button>
      <button class="ctrl-btn" style="margin-top:6px" onclick="simState.testing=false;simState.progress=0">🔄 إعادة</button>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا يحترق H₂ بفرقعة حادة؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">H₂ يتفاعل مع O₂ في الهواء بسرعة كبيرة: 2H₂ + O₂ → 2H₂O. هذا التفاعل السريع يُطلق طاقة حرارية هائلة تُحدث موجة انضغاطية نسمعها فرقعة. في حين أن O₂ لا يحترق بنفسه بل يُعزّز احتراق غيره.</div>
    </div>`);
  const cv=document.getElementById('simCanvas');

  // ── helpers for flask + splint scene ──
  function _drawFlask(c,cx,by,fw,fh,gasCol,t){
    // Flask body (round bottom)
    const neckW=fw*0.28, neckH=fh*0.28;
    const bodyR=fw*0.44;
    const bodyCY=by+neckH+bodyR*0.82;

    // Gas fill inside flask (slightly transparent)
    c.save();
    c.beginPath();
    // neck inside
    c.rect(cx-neckW*0.5+4,by+2,neckW-8,neckH+4);
    c.arc(cx,bodyCY,bodyR-5,0,Math.PI*2);
    c.clip();
    const gfill=c.createRadialGradient(cx,bodyCY,0,cx,bodyCY,bodyR);
    gfill.addColorStop(0,gasCol+'55');
    gfill.addColorStop(1,gasCol+'22');
    c.fillStyle=gfill;
    c.fillRect(cx-bodyR,by,bodyR*2,neckH+bodyR*2);
    // floating gas particles
    for(let i=0;i<14;i++){
      const px=cx-bodyR*0.7+((i*61+t*0.4)%(bodyR*1.4));
      const py=bodyCY-bodyR*0.7+((i*47+t*0.35)%(bodyR*1.4));
      const dist=Math.hypot(px-cx,py-bodyCY);
      if(dist<bodyR-8){
        c.fillStyle=gasCol+'77';
        c.beginPath(); c.arc(px,py,2.5,0,Math.PI*2); c.fill();
      }
    }
    c.restore();

    // Flask glass outline
    c.strokeStyle='#90CAF9'; c.lineWidth=3;
    // neck
    c.beginPath();
    c.moveTo(cx-neckW*0.5,by+neckH);
    c.lineTo(cx-neckW*0.5,by);
    c.stroke();
    c.beginPath();
    c.moveTo(cx+neckW*0.5,by+neckH);
    c.lineTo(cx+neckW*0.5,by);
    c.stroke();
    // shoulder curves
    c.beginPath();
    c.moveTo(cx-neckW*0.5,by+neckH);
    c.bezierCurveTo(cx-neckW*0.5,by+neckH+bodyR*0.5, cx-bodyR,bodyCY-bodyR*0.3, cx-bodyR,bodyCY);
    c.stroke();
    c.beginPath();
    c.moveTo(cx+neckW*0.5,by+neckH);
    c.bezierCurveTo(cx+neckW*0.5,by+neckH+bodyR*0.5, cx+bodyR,bodyCY-bodyR*0.3, cx+bodyR,bodyCY);
    c.stroke();
    // bottom arc
    c.beginPath();
    c.arc(cx,bodyCY,bodyR,0,Math.PI);
    c.stroke();
    // glass highlight
    c.strokeStyle='rgba(255,255,255,0.6)'; c.lineWidth=2;
    c.beginPath();
    c.arc(cx-bodyR*0.3,bodyCY-bodyR*0.25,bodyR*0.18,Math.PI*0.8,Math.PI*1.6);
    c.stroke();

    return {neckW,neckH,bodyR,bodyCY,neckTopY:by};
  }

  function _drawSplint(c,cx,tipY,isGlowing,isFlame,prog,gasCol,t){
    // wooden stick (angled slightly)
    const stickLen=Math.max(120,tipY*0.55);
    const angle=-0.08;
    const dx=Math.sin(angle)*stickLen;
    const dy=-Math.cos(angle)*stickLen;
    // wood gradient
    const sg=c.createLinearGradient(cx,tipY,cx+dx,tipY+dy);
    sg.addColorStop(0,'#5D4037'); sg.addColorStop(0.5,'#8D6E63'); sg.addColorStop(1,'#A1887F');
    c.strokeStyle=sg; c.lineWidth=6; c.lineCap='round';
    c.beginPath(); c.moveTo(cx,tipY); c.lineTo(cx+dx,tipY+dy); c.stroke();
    c.lineCap='butt';

    // glowing tip (O₂ case)
    if(isGlowing){
      const glow=c.createRadialGradient(cx,tipY,0,cx,tipY,18+Math.sin(t*0.18)*4);
      glow.addColorStop(0,'rgba(255,255,255,0.95)');
      glow.addColorStop(0.25,'rgba(255,200,50,0.85)');
      glow.addColorStop(0.6,'rgba(255,120,0,0.5)');
      glow.addColorStop(1,'rgba(255,60,0,0)');
      c.fillStyle=glow; c.beginPath(); c.arc(cx,tipY,18+Math.sin(t*0.18)*4,0,Math.PI*2); c.fill();
      // ember sparks
      for(let i=0;i<5;i++){
        const sa=Math.sin(t*0.15+i*1.3), ca=Math.cos(t*0.12+i*0.9);
        c.fillStyle=`rgba(255,${150+i*20},0,${0.7-i*0.1})`;
        c.beginPath(); c.arc(cx+sa*8,tipY+ca*6-4,2,0,Math.PI*2); c.fill();
      }
    }

    // full flame (H₂ explosion)
    if(isFlame){
      // big burst
      const burst=Math.min(1,(prog-0.55)*4);
      for(let i=0;i<16;i++){
        const fa=i*(Math.PI*2/16)+t*0.05;
        const fr=burst*(35+Math.sin(t*0.2+i)*12);
        const fc=c.createRadialGradient(cx+Math.cos(fa)*fr*0.3,tipY+Math.sin(fa)*fr*0.3,0,cx,tipY,fr);
        fc.addColorStop(0,'rgba(255,255,200,0.9)');
        fc.addColorStop(0.3,'rgba(255,180,0,0.7)');
        fc.addColorStop(0.7,'rgba(255,60,0,0.4)');
        fc.addColorStop(1,'rgba(255,0,0,0)');
        c.fillStyle=fc; c.beginPath(); c.arc(cx,tipY,fr,0,Math.PI*2); c.fill();
      }
      // shock lines
      if(burst>0.3){
        c.strokeStyle=`rgba(255,220,100,${burst*0.6})`; c.lineWidth=2;
        for(let i=0;i<8;i++){
          const sa=i*(Math.PI*2/8)+t*0.03;
          const r1=burst*20, r2=burst*55;
          c.beginPath();
          c.moveTo(cx+Math.cos(sa)*r1,tipY+Math.sin(sa)*r1);
          c.lineTo(cx+Math.cos(sa)*r2,tipY+Math.sin(sa)*r2);
          c.stroke();
        }
      }
    }
  }

  function draw(){
    if(currentSim!=='g9watergas'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    if(S.testing && S.progress<100) S.progress+=0.6;
    const gas=gases[S.gas||0];
    const prog=S.progress/100;

    /* ── fixed pixel zones ──
       [0      → TY ]  title
       [TY     → BY ]  flask + splint scene
       [BY     → BY+BH]  bench strip
       [BY+BH  → h  ]  result strip               */
    const TY=h*0.08, BY=h*0.70, BH=h*0.08;

    // background
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,gas.bgCol); bg.addColorStop(1,'#fff');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // bench strip
    const bg2=c.createLinearGradient(0,BY,0,BY+BH);
    bg2.addColorStop(0,'#BCAAA4'); bg2.addColorStop(1,'#795548');
    c.fillStyle=bg2; c.fillRect(0,BY,w,BH);
    c.strokeStyle='#4E342E'; c.lineWidth=2;
    c.beginPath(); c.moveTo(0,BY); c.lineTo(w,BY); c.stroke();

    // result strip (below bench)
    c.fillStyle='#F5F5F5'; c.fillRect(0,BY+BH,w,h-BY-BH);

    // ── title (zone 1) ──
    c.font=`bold ${Math.max(13,w*0.021)}px Tajawal`;
    c.textAlign='center'; c.textBaseline='middle';
    c.fillStyle=gas.col;
    c.fillText('اختبار '+gas.name+' بعود الثقاب', w/2, TY/2);

    // ── flask (zone 2, centered) ──
    const fcx=w*0.50;
    const avail=BY-TY;
    // Hard-clamp so flask always fits inside scene zone
    const bodyR=Math.min(w*0.110, avail*0.30, 120);
    const neckW=bodyR*0.48, neckH=bodyR*0.80;
    const bodyCY=BY - bodyR - 8;
    const neckTopY=bodyCY - bodyR - neckH;

    // gas fill (clipped)
    c.save();
    c.beginPath();
    c.rect(fcx-neckW/2+2, neckTopY, neckW-4, neckH+4);
    c.arc(fcx, bodyCY, bodyR-3, 0, Math.PI*2);
    c.clip();
    const gf=c.createRadialGradient(fcx,bodyCY-bodyR*0.2,0,fcx,bodyCY,bodyR);
    gf.addColorStop(0,gas.col+'60'); gf.addColorStop(1,gas.col+'18');
    c.fillStyle=gf;
    c.fillRect(fcx-bodyR,neckTopY,bodyR*2,neckH+bodyR*2+8);
    for(let i=0;i<14;i++){
      const px=fcx-bodyR*0.7+((i*59+S.t*0.35)%(bodyR*1.4));
      const py=bodyCY-bodyR*0.7+((i*43+S.t*0.3)%(bodyR*1.4));
      if(Math.hypot(px-fcx,py-bodyCY)<bodyR-5){
        c.fillStyle=gas.col+'77'; c.beginPath(); c.arc(px,py,2,0,Math.PI*2); c.fill();
      }
    }
    c.restore();

    // flask glass
    c.strokeStyle='rgba(100,181,246,0.85)'; c.lineWidth=2.5;
    c.beginPath(); c.moveTo(fcx-neckW/2,neckTopY+neckH); c.lineTo(fcx-neckW/2,neckTopY); c.stroke();
    c.beginPath(); c.moveTo(fcx+neckW/2,neckTopY+neckH); c.lineTo(fcx+neckW/2,neckTopY); c.stroke();
    c.beginPath(); c.moveTo(fcx-neckW/2,neckTopY+neckH);
    c.bezierCurveTo(fcx-neckW/2,neckTopY+neckH+bodyR*0.5,fcx-bodyR,bodyCY-bodyR*0.3,fcx-bodyR,bodyCY); c.stroke();
    c.beginPath(); c.moveTo(fcx+neckW/2,neckTopY+neckH);
    c.bezierCurveTo(fcx+neckW/2,neckTopY+neckH+bodyR*0.5,fcx+bodyR,bodyCY-bodyR*0.3,fcx+bodyR,bodyCY); c.stroke();
    c.beginPath(); c.arc(fcx,bodyCY,bodyR,0,Math.PI); c.stroke();
    c.strokeStyle='rgba(255,255,255,0.5)'; c.lineWidth=1.5;
    c.beginPath(); c.arc(fcx-bodyR*0.3,bodyCY-bodyR*0.28,bodyR*0.16,Math.PI*0.75,Math.PI*1.55); c.stroke();

    // gas label inside body
    c.font=`bold ${Math.max(12,bodyR*0.4)}px Tajawal`;
    c.textAlign='center'; c.textBaseline='middle';
    c.fillStyle=gas.col+'99';
    c.fillText(gas.icon, fcx, bodyCY+bodyR*0.1);

    // ── splint ──
    const tipX=fcx+neckW*0.05;
    const tipStart=TY+4;
    const tipEnd=neckTopY+neckH*0.5;
    const tipY=S.testing ? tipStart+(tipEnd-tipStart)*Math.min(prog*1.8,1) : tipStart;

    const ang=-0.20, sLen=h*0.20;
    const ex=tipX+Math.sin(ang)*sLen, ey=tipY-Math.cos(ang)*sLen;
    const sg=c.createLinearGradient(tipX,tipY,ex,ey);
    sg.addColorStop(0,'#3E2723'); sg.addColorStop(0.5,'#8D6E63'); sg.addColorStop(1,'#BCAAA4');
    c.strokeStyle=sg; c.lineWidth=7; c.lineCap='round';
    c.beginPath(); c.moveTo(tipX,tipY); c.lineTo(ex,ey); c.stroke();
    c.lineCap='butt';

    // O2 glow
    if(gas.effect==='glow' && prog>0.05){
      const pulse=10+Math.sin(S.t*0.22)*3;
      const gl=c.createRadialGradient(tipX,tipY,0,tipX,tipY,pulse*2.5);
      gl.addColorStop(0,'rgba(255,255,180,1)'); gl.addColorStop(0.3,'rgba(255,160,0,0.9)');
      gl.addColorStop(0.7,'rgba(255,60,0,0.35)'); gl.addColorStop(1,'rgba(255,0,0,0)');
      c.fillStyle=gl; c.beginPath(); c.arc(tipX,tipY,pulse*2.5,0,Math.PI*2); c.fill();
      c.fillStyle='rgba(255,255,220,0.95)';
      c.beginPath(); c.arc(tipX,tipY,3,0,Math.PI*2); c.fill();
      if(prog>0.4){
        for(let i=0;i<6;i++){
          const sa=S.t*0.14+i*1.0, sr=pulse*0.6+i*2.5;
          c.fillStyle=`rgba(255,${140+i*15},0,${0.7-i*0.1})`;
          c.beginPath(); c.arc(tipX+Math.cos(sa)*sr,tipY+Math.sin(sa)*sr-sr*0.2,2,0,Math.PI*2); c.fill();
        }
      }
    }

    // H2 burst
    if(gas.effect==='pop' && tipY>=neckTopY+neckH*0.05 && prog>0.5){
      const burst=Math.min(1,(prog-0.5)*2.6);
      for(let r=0;r<3;r++){
        const rr=(burst-r*0.13)*bodyR*1.3;
        if(rr>0){ c.strokeStyle=`rgba(255,200,50,${0.5*(1-burst)})`; c.lineWidth=3;
          c.beginPath(); c.arc(fcx,bodyCY,rr,0,Math.PI*2); c.stroke(); }
      }
      const fb=c.createRadialGradient(fcx,bodyCY,0,fcx,bodyCY,burst*bodyR*1.1);
      fb.addColorStop(0,'rgba(255,255,200,0.95)'); fb.addColorStop(0.3,'rgba(255,160,0,0.8)');
      fb.addColorStop(0.7,'rgba(255,50,0,0.4)'); fb.addColorStop(1,'rgba(255,0,0,0)');
      c.fillStyle=fb; c.beginPath(); c.arc(fcx,bodyCY,burst*bodyR*1.1,0,Math.PI*2); c.fill();
      for(let i=0;i<12;i++){
        const fa=i*(Math.PI*2/12)+S.t*0.04;
        const fr=burst*bodyR*(0.5+Math.sin(S.t*0.15+i)*0.28);
        c.fillStyle=`rgba(255,${100+i*10},0,${0.85-burst*0.55})`;
        c.beginPath(); c.arc(fcx+Math.cos(fa)*fr,bodyCY+Math.sin(fa)*fr,2.5+i%3,0,Math.PI*2); c.fill();
      }
    }

    // ── bench label (one line, centered) ──
    c.font=`bold ${Math.max(11,w*0.017)}px Tajawal`;
    c.textAlign='center'; c.textBaseline='middle';
    c.fillStyle='rgba(255,255,255,0.9)';
    c.fillText(gas.name, fcx, BY+BH/2);

    // ── result strip (zone 4) ──
    if(S.progress>58){
      const ry=BY+BH, rh=h-ry;
      // reaction outcome
      c.font=`bold ${Math.max(13,w*0.022)}px Tajawal`;
      c.textAlign='center'; c.textBaseline='middle';
      c.fillStyle=gas.col;
      c.fillText(gas.result, w/2, ry+rh*0.33);
      // sub text
      c.font=`${Math.max(10,w*0.016)}px Tajawal`;
      c.fillStyle='#555';
      c.fillText(gas.resultSub, w/2, ry+rh*0.68);
    } else {
      // hint
      c.font=`${Math.max(10,w*0.016)}px Tajawal`;
      c.textAlign='center'; c.textBaseline='middle';
      c.fillStyle='#999';
      c.fillText('اضغط "ابدأ الاختبار" لإدخال عود الثقاب', w/2, BY+BH+( h-BY-BH)*0.5);
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ 9-1 Tab 3: NH₃ و CO₂ و Cl₂ ══
function simG9WaterGas3(){
  cancelAnimationFrame(animFrame);
  simState={t:0, gas:0, testing:false, progress:0};
  const S=simState;
  const gases=[
    {name:'الأمونيا NH₃', col:'#27AE60', bgCol:'#E8F5E9', smell:'رائحة نفاذة', test:'ورقة تبّاع الشمس الحمراء', result:'تتحوّل من الأحمر إلى الأزرق', resultIcon:'🔵', eq:'NH₃ + H₂O ⇌ NH₄⁺ + OH⁻ (محلول قلوي)'},
    {name:'ثاني أكسيد الكربون CO₂', col:'#6B4E9A', bgCol:'#F3E5F5', smell:'عديم الرائحة', test:'إمرار في ماء الجير', result:'راسب أبيض (يعكّر ماء الجير)', resultIcon:'⚪', eq:'Ca(OH)₂ + CO₂ → CaCO₃↓ + H₂O'},
    {name:'الكلور Cl₂', col:'#7B8D2A', bgCol:'#F9FBE7', smell:'رائحة خانقة', test:'ورقة تبّاع الشمس الزرقاء الرطبة', result:'أحمر ثم أبيض (مُبيَّضة تماماً)', resultIcon:'⬜', eq:'Cl₂ + H₂O → HCl + HOCl (حمضي + مُبيِّض)'},
  ];
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌬️ اختر الغاز</div>
      <div class="ctrl-btns-grid-1">
        ${gases.map((g,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="gas3b-${i}" onclick="simState.gas=${i};simState.testing=false;simState.progress=0;document.querySelectorAll('[id^=gas3b-]').forEach((b,j)=>b.classList.toggle('active',j===${i}))">${g.name}</button>`).join('')}
      </div>
    </div>
    <div class="ctrl-section">
      <button class="ctrl-btn action" onclick="simState.testing=true">🧪 أجرِ الاختبار</button>
      <button class="ctrl-btn" style="margin-top:6px" onclick="simState.testing=false;simState.progress=0">🔄 إعادة</button>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ كيف نُميِّز الأمونيا عن الكلور؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">كلاهما برائحة نفاذة لكن: الأمونيا تُحوِّل ورقة تبّاع الشمس الحمراء إلى الأزرق (قلوية). الكلور يُحوِّل ورقة تبّاع الشمس الزرقاء إلى الأحمر ثم يُبيِّضها تماماً (تأثير التبييض). CO₂ بلا رائحة ويُعكِّر ماء الجير فقط.</div>
    </div>`);
  const cv=document.getElementById('simCanvas');

  // ── draw Erlenmeyer flask (source) ──
  // fw = desired flask width; the function anchors the bottom to bodyCY passed from caller
  function _drawSourceFlask(c,cx,by,fw,gasCol,t){
    const neckW=fw*0.26, neckH=fw*0.38, bodyR=fw*0.42;
    // bodyCY: centre of round bottom — computed from 'by' downward
    const bodyCY=by+neckH+bodyR*0.85;
    // Clip everything so gas fill stays inside flask outline
    c.save();
    c.beginPath();
    c.rect(cx-neckW*0.5+3,by,neckW-6,neckH+4);
    c.arc(cx,bodyCY,bodyR-4,0,Math.PI*2);
    c.clip();
    const gf=c.createRadialGradient(cx,bodyCY,0,cx,bodyCY,bodyR);
    gf.addColorStop(0,gasCol+'66'); gf.addColorStop(1,gasCol+'22');
    c.fillStyle=gf;
    c.fillRect(cx-bodyR,by,bodyR*2,neckH+bodyR*2);
    for(let i=0;i<12;i++){
      const px=cx-bodyR*0.7+((i*59+t*0.35)%(bodyR*1.4));
      const py=bodyCY-bodyR*0.6+((i*43+t*0.3)%(bodyR*1.2));
      if(Math.hypot(px-cx,py-bodyCY)<bodyR-8){
        c.fillStyle=gasCol+'88'; c.beginPath(); c.arc(px,py,2,0,Math.PI*2); c.fill();
      }
    }
    c.restore();
    // outline
    c.strokeStyle='#90CAF9'; c.lineWidth=2.5;
    c.beginPath(); c.moveTo(cx-neckW*0.5,by+neckH); c.lineTo(cx-neckW*0.5,by); c.stroke();
    c.beginPath(); c.moveTo(cx+neckW*0.5,by+neckH); c.lineTo(cx+neckW*0.5,by); c.stroke();
    c.beginPath(); c.moveTo(cx-neckW*0.5,by+neckH);
    c.bezierCurveTo(cx-neckW*0.5,by+neckH+bodyR*0.5,cx-bodyR,bodyCY-bodyR*0.3,cx-bodyR,bodyCY); c.stroke();
    c.beginPath(); c.moveTo(cx+neckW*0.5,by+neckH);
    c.bezierCurveTo(cx+neckW*0.5,by+neckH+bodyR*0.5,cx+bodyR,bodyCY-bodyR*0.3,cx+bodyR,bodyCY); c.stroke();
    c.beginPath(); c.arc(cx,bodyCY,bodyR,0,Math.PI); c.stroke();
    // highlight
    c.strokeStyle='rgba(255,255,255,0.5)'; c.lineWidth=1.5;
    c.beginPath(); c.arc(cx-bodyR*0.28,bodyCY-bodyR*0.22,bodyR*0.16,Math.PI*0.8,Math.PI*1.6); c.stroke();
    return {neckW,neckH,bodyR,bodyCY,neckTopX:cx,neckTopY:by};
  }

  // ── draw litmus paper strip ──
  function _drawLitmusPaper(c,cx,py,pw,ph,r,g,b,label,labelCol){
    // paper shadow
    c.fillStyle='rgba(0,0,0,0.08)';
    c.beginPath(); c.roundRect(cx-pw/2+3,py+3,pw,ph,4); c.fill();
    // paper body
    c.fillStyle=`rgb(${r},${g},${b})`;
    c.beginPath(); c.roundRect(cx-pw/2,py,pw,ph,4); c.fill();
    // paper texture lines
    c.strokeStyle=`rgba(0,0,0,0.06)`; c.lineWidth=1;
    for(let li=1;li<5;li++){
      c.beginPath(); c.moveTo(cx-pw/2+3,py+ph*li/5); c.lineTo(cx+pw/2-3,py+ph*li/5); c.stroke();
    }
    // border
    c.strokeStyle='rgba(0,0,0,0.15)'; c.lineWidth=1.5;
    c.beginPath(); c.roundRect(cx-pw/2,py,pw,ph,4); c.stroke();
    _lbl(c,label,cx,py+ph+18,labelCol,12);
  }

  // ── draw beaker (for CO₂ lime water) ──
  function _drawBeakerCO2(c,cx,by,bw,bh,turbidity){
    // water fill
    const wc=c.createLinearGradient(cx-bw/2,by,cx+bw/2,by+bh);
    wc.addColorStop(0,`rgba(220,240,255,${0.5+turbidity*0.4})`);
    wc.addColorStop(1,`rgba(180,200,220,${0.4+turbidity*0.4})`);
    c.fillStyle=wc;
    c.beginPath(); c.roundRect(cx-bw/2+3,by+6,bw-6,bh-10,2); c.fill();
    // white precipitate settling
    if(turbidity>0.3){
      const pAmount=Math.floor((turbidity-0.3)*20);
      for(let i=0;i<pAmount;i++){
        const px2=cx-bw*0.35+((i*37)%(bw*0.7));
        const py2=by+bh*(0.55+0.35*(i%3)/3);
        c.fillStyle=`rgba(240,240,240,${Math.min(1,turbidity*1.2)})`;
        c.beginPath(); c.arc(px2,py2,2+i%2,0,Math.PI*2); c.fill();
      }
      // white layer at bottom
      const layH=bh*(turbidity-0.3)*0.6;
      c.fillStyle=`rgba(240,240,240,${turbidity*0.8})`;
      c.beginPath(); c.roundRect(cx-bw/2+3,by+bh-10-layH,bw-6,layH,1); c.fill();
    }
    // beaker glass
    c.strokeStyle='#78909C'; c.lineWidth=3;
    c.beginPath();
    c.moveTo(cx-bw/2,by); c.lineTo(cx-bw/2,by+bh);
    c.lineTo(cx+bw/2,by+bh); c.lineTo(cx+bw/2,by); c.stroke();
    // spout
    c.beginPath(); c.moveTo(cx+bw/2-5,by); c.lineTo(cx+bw/2+bw*0.15,by-bh*0.08); c.stroke();
    // highlight
    c.strokeStyle='rgba(255,255,255,0.4)'; c.lineWidth=2;
    c.beginPath(); c.moveTo(cx-bw*0.38,by+bh*0.1); c.lineTo(cx-bw*0.38,by+bh*0.6); c.stroke();
  }

  function draw(){
    if(currentSim!=='g9watergas'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    if(S.testing && S.progress<100) S.progress+=0.55;
    const gas=gases[S.gas||0];
    const prog=S.progress/100;

    /* zones:
       title  : 0      → TY
       scene  : TY     → BY      (flask left 40%, indicator right 55%)
       bench  : BY     → BY+BH
       result : BY+BH  → h                                              */
    // Title zone enlarged to fit two lines comfortably
    const TY=h*0.15, BY=h*0.70, BH=h*0.07;

    // background
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,gas.bgCol); bg.addColorStop(1,'#fff');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // bench
    const bg2=c.createLinearGradient(0,BY,0,BY+BH);
    bg2.addColorStop(0,'#BCAAA4'); bg2.addColorStop(1,'#795548');
    c.fillStyle=bg2; c.fillRect(0,BY,w,BH);
    c.strokeStyle='#4E342E'; c.lineWidth=2;
    c.beginPath(); c.moveTo(0,BY); c.lineTo(w,BY); c.stroke();

    // result bg
    c.fillStyle='#F5F5F5'; c.fillRect(0,BY+BH,w,h-BY-BH);

    // title — upper half of title zone
    c.font=`bold ${Math.max(15,w*0.023)}px Tajawal`;
    c.textAlign='center'; c.textBaseline='middle';
    c.fillStyle=gas.col;
    c.fillText(gas.name, w/2, TY*0.32);

    // subtitle (smell) — lower half, clear gap
    c.font=`${Math.max(12,w*0.017)}px Tajawal`;
    c.fillStyle='#444';
    c.fillText('الرائحة: '+gas.smell, w/2, TY*0.72);

    // ── source flask (left side, anchored to bench) ──
    const sceneH=BY-TY;
    // Clamp flask width so body fits within scene height
    const fW=Math.min(w*0.26, sceneH*0.55, 190);
    const fCX=w*0.22;
    // Compute dimensions to anchor bottom of flask to bench
    const _fBodyR=fW*0.42, _fNeckH=fW*0.38;
    // fTY = neck top = BY - bodyR*0.85 - neckH - bodyR - 8 (gap)
    const fTY=BY - _fBodyR - _fBodyR*0.85 - _fNeckH - 8;
    // Safety: never above TY+10
    const fTYsafe=Math.max(TY+10, fTY);
    const fl=_drawSourceFlask(c,fCX,fTYsafe,fW,gas.col,S.t);

    // gas name on bench
    c.font=`bold ${Math.max(10,w*0.016)}px Tajawal`;
    c.textAlign='center'; c.textBaseline='middle';
    c.fillStyle='rgba(255,255,255,0.88)';
    c.fillText(gas.name, fCX, BY+BH/2);

    // gas flow particles
    if(S.testing){
      const sx=fCX+fl.neckW*0.5+4, sy=fl.neckTopY+fl.neckH*0.3;
      const ex2=w*0.50, ey2=TY+sceneH*0.25;
      for(let i=0;i<9;i++){
        const age=((S.t*0.016+i*0.11)%1)*Math.min(prog*2,1);
        const gx=sx+(ex2-sx)*age, gy=sy+(ey2-sy)*age+Math.sin(age*5+i)*7;
        const al=Math.round((1-age*0.65)*120).toString(16).padStart(2,'0');
        c.fillStyle=gas.col+al;
        c.beginPath(); c.arc(gx,gy,2.2,0,Math.PI*2); c.fill();
      }
    }

    // ── indicator (right side) ──
    // Limit indicator height to 55% of scene so it doesn't fill the whole canvas
    const iCX=w*0.73, iH=Math.min(sceneH*0.52, 220);
    // Centre the indicator vertically in the scene zone
    const iTY=TY + (sceneH - iH)*0.38;

    if(S.gas===1){
      // CO2: lime water beaker — proportional width
      const bW=Math.min(w*0.28, 200);
      _drawBeakerCO2(c,iCX,iTY,bW,iH,prog*0.85);
      // label ABOVE beaker — clear background so text doesn't overlap
      c.font=`bold ${Math.max(10,w*0.016)}px Tajawal`;
      c.textAlign='center'; c.textBaseline='bottom';
      c.fillStyle=gas.col;
      c.fillText('ماء الجير Ca(OH)₂', iCX, iTY-6);
      // bench label
      c.font=`bold ${Math.max(10,w*0.016)}px Tajawal`;
      c.textBaseline='middle';
      c.fillStyle='rgba(255,255,255,0.92)';
      c.fillText('ماء الجير', iCX, BY+BH/2);
    } else {
      // NH3 / Cl2: litmus strip — compact width
      const pW=Math.min(w*0.18, 130), pH=iH;
      let r,g2,b2,topLabel,stateLabel,stateCol;

      if(S.gas===0){
        // NH3: red→blue
        r=Math.round(192+(26-192)*prog);
        g2=Math.round(57+(143-57)*prog);
        b2=Math.round(43+(168-43)*prog);
        topLabel='ورقة تبّاع الشمس الحمراء';
        stateLabel=prog<0.15?'🔴 حمراء':prog<0.7?'🔄 تتحوّل...':'🔵 زرقاء';
        stateCol='#27AE60';
      } else {
        // Cl2: blue→red→white
        if(prog<0.45){
          const t2=prog/0.45;
          r=Math.round(32+(192-32)*t2); g2=Math.round(119+(57-119)*t2); b2=Math.round(180+(43-180)*t2);
          stateLabel=prog<0.1?'🔵 زرقاء':prog<0.35?'🔄 تتحمّر...':'🔴 حمراء';
        } else {
          const t2=(prog-0.45)/0.55;
          r=Math.round(192+(248-192)*t2); g2=Math.round(57+(248-57)*t2); b2=Math.round(43+(248-43)*t2);
          stateLabel=t2<0.4?'🔄 تتبيّض...':'⬜ بيضاء';
        }
        topLabel='ورقة تبّاع الشمس الزرقاء';
        stateCol='#7B8D2A';
      }

      // label ABOVE strip with enough gap
      c.font=`bold ${Math.max(10,w*0.016)}px Tajawal`;
      c.textAlign='center'; c.textBaseline='bottom';
      c.fillStyle=stateCol;
      c.fillText(topLabel, iCX, iTY-6);

      // draw strip
      _drawLitmusPaper(c, iCX, iTY, pW, pH, r, g2, b2, '', stateCol);

      // state label centred inside the strip
      c.font=`bold ${Math.max(12,w*0.019)}px Tajawal`;
      c.textAlign='center'; c.textBaseline='middle';
      c.fillStyle='rgba(255,255,255,0.95)';
      c.fillText(stateLabel, iCX, iTY+pH/2);

      // bench label
      c.font=`bold ${Math.max(10,w*0.016)}px Tajawal`;
      c.fillStyle='rgba(255,255,255,0.92)';
      c.fillText('ورقة تبّاع الشمس', iCX, BY+BH/2);
    }

    // ── result strip ──
    if(S.progress>58){
      const ry=BY+BH, rh=h-ry;
      // result background tint
      c.fillStyle='rgba(255,255,255,0.85)'; c.fillRect(0,ry,w,rh);
      c.font=`bold ${Math.max(13,w*0.021)}px Tajawal`;
      c.textAlign='center'; c.textBaseline='middle';
      c.fillStyle=gas.col;
      c.fillText('✅ '+gas.result, w/2, ry+rh*0.30);
      // equation with dark colour for legibility
      c.font=`${Math.max(11,w*0.016)}px Tajawal`;
      c.fillStyle='#333';
      c.fillText(gas.eq, w/2, ry+rh*0.68);
    } else {
      c.font=`${Math.max(11,w*0.016)}px Tajawal`;
      c.textAlign='center'; c.textBaseline='middle';
      c.fillStyle='#666';
      c.fillText('اضغط "أجرِ الاختبار" لتشغيل الغاز', w/2, BY+BH+(h-BY-BH)*0.5);
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}



// ══════════════════════════════════════════════════════════════
// 🔥 9-2 اختبار اللهب — نسخة تفاعلية محسّنة
// ══════════════════════════════════════════════════════════════

// ══ 9-2 Tab 1: ألوان اللهب (تفاعلي — اسحب العينة إلى اللهب) ══
window._f1Ions=[
  {ion:'Li⁺', name:'الليثيوم',  col:'#E53935', desc:'أحمر قرمزي',      rgb:[229,83,53]},
  {ion:'Na⁺', name:'الصوديوم',  col:'#FDD835', desc:'أصفر برتقالي',    rgb:[253,216,53]},
  {ion:'K⁺',  name:'البوتاسيوم',col:'#AB47BC', desc:'أرجواني',          rgb:[171,71,188]},
  {ion:'Cu²⁺',name:'النحاس',    col:'#00897B', desc:'أخضر-أزرق',       rgb:[0,137,123]},
  {ion:'Fe²⁺',name:'الحديد II', col:'#FFA000', desc:'برتقالي ذهبي',    rgb:[255,160,0]},
  {ion:'Ca²⁺',name:'الكالسيوم', col:'#EF5350', desc:'أحمر آجوري',      rgb:[239,83,80]},
];
function simG9FlameTest1(){
  cancelAnimationFrame(animFrame);
  const ions=window._f1Ions;
  simState={t:0, hoveredTube:null, inFlame:false, burningIdx:null, showLabel:false, labelTimer:0, score:0, tried:{}};
  const S=simState;
  const cv=document.getElementById('simCanvas');

  controls(`
    <div style="padding:4px 0 2px;font-size:13px;color:var(--text-secondary);text-align:center;line-height:1.5">
      🧪 اضغط على أنبوب لإشعاله في اللهب<br>
      <span style="font-size:11px;opacity:0.7">شاهد لون اللهب وتعلَّم خصائص كل أيون</span>
    </div>
    <div id="f1-info" class="info-box" style="min-height:58px;font-size:13px;text-align:center;line-height:1.7;transition:all 0.3s">
      👆 اضغط على أي أنبوب اختبار
    </div>
    <div style="margin-top:8px">
      <div class="ctrl-label">✅ الأيونات التي اختبرتها: <span id="f1-score">0</span>/${ions.length}</div>
      <div id="f1-progress" style="height:6px;background:var(--border-color);border-radius:3px;margin-top:4px;overflow:hidden">
        <div id="f1-prog-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#27AE60,#1A8FA8);border-radius:3px;transition:width 0.5s"></div>
      </div>
    </div>
    <div class="q-box" style="margin-top:10px">
      <strong>❓ لماذا تختلف ألوان اللهب لكل عنصر؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الحرارة تُثير إلكترونات الأيون إلى مستويات طاقة أعلى. عند عودتها تُطلَق فوتونات بطول موجي محدَّد لكل عنصر — أساس طيف الانبعاث الذري!</div>
    </div>
  `);

  cv.onclick=function(e){
    const rect=this.getBoundingClientRect();
    const mx=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX-rect.left)*(this.width/rect.width);
    const my=(e.clientY-rect.top)*(this.height/rect.height);
    const w=this.width, h=this.height;
    ions.forEach((ion,i)=>{
      const tx=_tubeX(i,ions.length,w), ty=h*0.72;
      if(Math.abs(mx-tx)<22 && Math.abs(my-ty)<45){
        S.burningIdx=i; S.showLabel=true; S.labelTimer=0;
        if(!S.tried[i]){
          S.tried[i]=true;
          S.score=Object.keys(S.tried).length;
          document.getElementById('f1-score').textContent=S.score;
          document.getElementById('f1-prog-bar').style.width=(S.score/ions.length*100)+'%';
        }
        document.getElementById('f1-info').innerHTML=`<strong style="color:${ion.col};font-size:15px">${ion.ion} — ${ion.name}</strong><br>لون اللهب: <span style="color:${ion.col};font-weight:700;font-size:14px">${ion.desc}</span>`;
      }
    });
  };

  function _tubeX(i,n,w){ return w*(0.12+i*(0.78/(n-1))); }

  function draw(){
    if(currentSim!=='g9flametest'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    if(S.labelTimer!==undefined) S.labelTimer++;

    // Dark lab background
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#0D1117'); bg.addColorStop(1,'#1A2035');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Title
    c.fillStyle='#9DC8E8'; c.font=`bold ${Math.max(12,w*0.022)}px Tajawal`;
    c.textAlign='center'; c.textBaseline='middle';
    c.fillText('اضغط على أنبوب لمشاهدة لون اللهب 🔥',w/2,h*0.055);

    // Central Bunsen burner
    const bx=w/2, by=h*0.50;
    // Base
    c.fillStyle='#444'; c.beginPath(); c.roundRect(bx-w*0.06,by,w*0.12,h*0.12,4); c.fill();
    c.fillStyle='#333'; c.beginPath(); c.roundRect(bx-w*0.09,by+h*0.10,w*0.18,h*0.035,3); c.fill();

    // Flame (always on)
    const burningIon = S.burningIdx!==null ? ions[S.burningIdx] : null;
    const flameCol = burningIon ? burningIon.col : '#1A8FA8';
    const flameCol2 = burningIon ? burningIon.rgb : [26,143,168];
    for(let l=0;l<8;l++){
      const fh=h*(0.14+0.04*Math.sin(S.t*0.13+l));
      const fw=w*(0.025+0.008*Math.sin(S.t*0.09+l*0.7));
      const grad=c.createRadialGradient(bx,by,0,bx,by-fh*0.5,fh);
      const alpha=burningIon?1:0.6;
      grad.addColorStop(0,`rgba(255,255,255,${alpha})`);
      grad.addColorStop(0.25,`rgba(${flameCol2[0]},${flameCol2[1]},${flameCol2[2]},${alpha*0.9})`);
      grad.addColorStop(0.7,`rgba(${flameCol2[0]},${flameCol2[1]},${flameCol2[2]},${alpha*0.4})`);
      grad.addColorStop(1,'transparent');
      c.fillStyle=grad;
      c.beginPath(); c.ellipse(bx+(l-3.5)*w*0.018,by-fh*0.38,fw,fh*0.44,0,0,Math.PI*2); c.fill();
    }
    // Glow when burning
    if(burningIon){
      const glow=c.createRadialGradient(bx,by-h*0.08,0,bx,by-h*0.08,h*0.22);
      glow.addColorStop(0,burningIon.col+'44'); glow.addColorStop(1,'transparent');
      c.fillStyle=glow; c.fillRect(0,0,w,h);
    }

    // Wire if burning
    if(S.burningIdx!==null){
      const tx=_tubeX(S.burningIdx,ions.length,w);
      c.strokeStyle=ions[S.burningIdx].col+'BB'; c.lineWidth=3;
      c.beginPath(); c.moveTo(tx,h*0.68); c.bezierCurveTo(tx,h*0.55,bx,h*0.48,bx,by-h*0.05); c.stroke();
      // small glow at wire tip
      const gwg=c.createRadialGradient(bx,by-h*0.05,0,bx,by-h*0.05,12);
      gwg.addColorStop(0,'#FFF'); gwg.addColorStop(1,'transparent');
      c.fillStyle=gwg; c.fillRect(bx-12,by-h*0.08,24,20);
    }

    // Test tubes at bottom
    ions.forEach((ion,i)=>{
      const tx=_tubeX(i,ions.length,w), ty=h*0.72;
      const isBurning=S.burningIdx===i;
      const isDone=S.tried && S.tried[i];

      // Glow under selected
      if(isBurning){
        const tg=c.createRadialGradient(tx,ty,0,tx,ty,30);
        tg.addColorStop(0,ion.col+'55'); tg.addColorStop(1,'transparent');
        c.fillStyle=tg; c.fillRect(tx-30,ty-30,60,60);
      }

      // Tube body
      const tw=14, th=38;
      c.fillStyle=isDone?ion.col+'33':'rgba(135,206,235,0.15)';
      c.strokeStyle=isBurning?ion.col:'rgba(135,206,235,0.5)';
      c.lineWidth=isBurning?2.5:1.5;
      c.beginPath();
      c.moveTo(tx-tw/2,ty-th/2);
      c.lineTo(tx-tw/2,ty+th/2-tw/2);
      c.arc(tx,ty+th/2-tw/2,tw/2,Math.PI,0);
      c.lineTo(tx+tw/2,ty-th/2);
      c.closePath();
      c.fill(); c.stroke();

      // Liquid in tube
      c.fillStyle=ion.col+(isDone?'BB':'66');
      c.beginPath();
      c.moveTo(tx-tw/2+2,ty+2);
      c.lineTo(tx-tw/2+2,ty+th/2-tw/2-1);
      c.arc(tx,ty+th/2-tw/2-1,tw/2-2,Math.PI,0);
      c.lineTo(tx+tw/2-2,ty+2);
      c.closePath();
      c.fill();

      // Ion label
      c.fillStyle=isBurning?ion.col:'#AAA';
      c.font=`bold ${Math.max(9,w*0.018)}px Tajawal`;
      c.textAlign='center'; c.textBaseline='top';
      c.fillText(ion.ion,tx,ty+th/2+6);

      // Checkmark if done
      if(isDone && !isBurning){
        c.fillStyle='#27AE60'; c.font=`${Math.max(9,w*0.016)}px Arial`;
        c.fillText('✓',tx,ty-th/2-14);
      }
    });

    // Bottom flame color display
    if(burningIon && S.labelTimer<240){
      const alpha=S.labelTimer>180?1-(S.labelTimer-180)/60:1;
      c.globalAlpha=alpha;
      c.fillStyle=`rgba(0,0,0,0.55)`;
      c.beginPath(); c.roundRect(w*0.05,h*0.87,w*0.90,h*0.10,8); c.fill();
      c.fillStyle=burningIon.col;
      c.font=`bold ${Math.max(11,w*0.022)}px Tajawal`;
      c.textAlign='center'; c.textBaseline='middle';
      c.fillText(`${burningIon.ion} ← لون ${burningIon.desc}`,w/2,h*0.922);
      c.globalAlpha=1;
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ 9-2 Tab 2: حدِّد الكاتيون المجهول (مع نقاط وسرعة) ══
window._f2Ions=[
  {ion:'Li⁺', col:'#E53935', desc:'أحمر قرمزي',   rgb:[229,83,53]},
  {ion:'Na⁺', col:'#FDD835', desc:'أصفر',          rgb:[253,216,53]},
  {ion:'K⁺',  col:'#AB47BC', desc:'أرجواني',       rgb:[171,71,188]},
  {ion:'Cu²⁺',col:'#00897B', desc:'أخضر-أزرق',    rgb:[0,137,123]},
  {ion:'Ca²⁺',col:'#EF5350', desc:'أحمر آجوري',   rgb:[239,83,80]},
];
function simG9FlameTest2(){
  cancelAnimationFrame(animFrame);
  const ions=window._f2Ions;
  let qi=Math.floor(Math.random()*ions.length);
  simState={t:0, qi, answered:false, streak:0, score:0, total:0, feedback:'', fbTimer:0, usedQs:[qi]};
  const S=simState;

  window.newQFlame2=function(){
    // إذا استُخدمت كل الأسئلة، نعيد الدورة
    if(S.usedQs.length >= ions.length) S.usedQs=[];
    let newQi;
    do{ newQi=Math.floor(Math.random()*ions.length); }while(S.usedQs.includes(newQi));
    S.usedQs.push(newQi);
    S.qi=newQi; S.answered=false; S.feedback=''; S.fbTimer=0;
    document.getElementById('f2-fb').innerHTML='';
    // Update button states
    document.querySelectorAll('[id^=f2btn-]').forEach(b=>b.classList.remove('correct','wrong'));
  };

  window._f2Answer=function(i){
    if(S.answered) return;
    S.answered=true; S.total++;
    const correct=i===S.qi;
    if(correct){ S.streak++; S.score+=10+(S.streak>1?S.streak*2:0); S.feedback='✅'; }
    else{ S.streak=0; S.feedback='❌'; }
    document.getElementById('f2-score').textContent=S.score;
    document.getElementById('f2-streak').textContent=S.streak;
    document.getElementById('f2-acc').textContent=S.total>0?Math.round((S.score/(S.total*10))*100)+'%':'—';
    const btn=document.getElementById('f2btn-'+i);
    if(btn) btn.classList.add(correct?'correct':'wrong');
    if(!correct){
      const cb=document.getElementById('f2btn-'+S.qi);
      if(cb) cb.classList.add('correct');
    }
    document.getElementById('f2-fb').innerHTML=correct
      ?`<span style="color:#27AE60;font-size:15px">✅ ممتاز! ${ions[S.qi].ion} يعطي لهباً ${ions[S.qi].desc} ${S.streak>2?'🔥 سلسلة '+S.streak+'!':''}</span>`
      :`<span style="color:#C0392B">❌ الصحيح: <strong style="color:${ions[S.qi].col}">${ions[S.qi].ion}</strong> (${ions[S.qi].desc})</span>`;
    setTimeout(()=>{ if(S.answered) window.newQFlame2(); }, 1500);
  };

  controls(`
    <div class="ctrl-section">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px">
        <div style="text-align:center;background:rgba(39,174,96,0.1);border:1px solid rgba(39,174,96,0.3);border-radius:8px;padding:6px">
          <div style="font-size:10px;color:var(--text-secondary)">النقاط</div>
          <div id="f2-score" style="font-size:18px;font-weight:800;color:#27AE60">0</div>
        </div>
        <div style="text-align:center;background:rgba(212,144,26,0.1);border:1px solid rgba(212,144,26,0.3);border-radius:8px;padding:6px">
          <div style="font-size:10px;color:var(--text-secondary)">السلسلة 🔥</div>
          <div id="f2-streak" style="font-size:18px;font-weight:800;color:#D4901A">0</div>
        </div>
        <div style="text-align:center;background:rgba(26,143,168,0.1);border:1px solid rgba(26,143,168,0.3);border-radius:8px;padding:6px">
          <div style="font-size:10px;color:var(--text-secondary)">الدقة</div>
          <div id="f2-acc" style="font-size:18px;font-weight:800;color:#1A8FA8">—</div>
        </div>
      </div>
      <div class="ctrl-label">🔍 ما الأيون الذي يُنتج هذا اللهب؟</div>
      <div class="ctrl-btns-grid-1">
        ${ions.map((ion,i)=>`<button class="ctrl-btn f2-opt" id="f2btn-${i}" onclick="window._f2Answer(${i})" style="border-right:4px solid ${ion.col}33;transition:all 0.2s">${ion.ion}</button>`).join('')}
      </div>
    </div>
    <div id="f2-fb" style="padding:8px;text-align:center;font-size:13px;font-weight:700;min-height:36px"></div>
    <button class="ctrl-btn action" style="margin-top:4px" onclick="window.newQFlame2()">🎲 لهب جديد</button>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ما محدودية اختبار اللهب؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">بعض الأيونات ألوانها متقاربة (Li⁺ و Ca²⁺ كلاهما أحمر). Na⁺ لونه الأصفر يُخفي ألوان الآخرين. لذلك يُدمَج مع اختبارات الترسيب للتأكيد.</div>
    </div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9flametest'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const ion=ions[S.qi];
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#0A0E1A'); bg.addColorStop(1,'#0D1117');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Stars
    for(let s=0;s<30;s++){
      const sx=((s*137+13)%w), sy=((s*89+7)%(h*0.5));
      const a=0.3+0.3*Math.sin(S.t*0.02+s);
      c.fillStyle=`rgba(255,255,255,${a})`; c.beginPath(); c.arc(sx,sy,0.8,0,Math.PI*2); c.fill();
    }

    _lbl(c,'ما الأيون الذي يُنتج هذا اللون؟',w/2,h*0.07,'#9DC8E8',Math.max(13,w*0.024));

    // Big flame
    const fx=w/2, fy=h*0.60;
    const [r,g,b]=ion.rgb;

    // Outer glow
    const outerGlow=c.createRadialGradient(fx,fy-h*0.1,0,fx,fy-h*0.1,h*0.35);
    outerGlow.addColorStop(0,`rgba(${r},${g},${b},0.3)`);
    outerGlow.addColorStop(1,'transparent');
    c.fillStyle=outerGlow; c.fillRect(0,0,w,h);

    for(let l=0;l<9;l++){
      const fh=h*(0.32+0.05*Math.sin(S.t*0.10+l));
      const fw=w*(0.055+0.012*Math.sin(S.t*0.08+l*0.5));
      const grad=c.createRadialGradient(fx,fy,0,fx,fy-fh*0.5,fh);
      grad.addColorStop(0,'#FFFFFF');
      grad.addColorStop(0.15,`rgba(255,240,200,1)`);
      grad.addColorStop(0.35,`rgba(${r},${g},${b},0.95)`);
      grad.addColorStop(0.75,`rgba(${r},${g},${b},0.55)`);
      grad.addColorStop(1,'transparent');
      c.fillStyle=grad;
      c.beginPath(); c.ellipse(fx+(l-4)*w*0.022,fy-fh*0.4,fw,fh*0.46,0,0,Math.PI*2); c.fill();
    }

    // Bunsen burner
    c.fillStyle='#3A3A3A'; c.beginPath(); c.roundRect(fx-w*0.05,fy,w*0.10,h*0.17,5); c.fill();
    c.fillStyle='#2A2A2A'; c.beginPath(); c.roundRect(fx-w*0.08,fy+h*0.15,w*0.16,h*0.04,3); c.fill();
    _lbl(c,'موقد بنسن',fx,fy+h*0.22,'#666',Math.max(9,w*0.017));

    // Mystery label or reveal
    if(!S.answered){
      // Pulsing question mark
      const pulse=1+0.05*Math.sin(S.t*0.08);
      c.save(); c.translate(w/2,h*0.20); c.scale(pulse,pulse);
      c.fillStyle='rgba(255,255,255,0.92)';
      c.font=`bold ${Math.max(32,w*0.07)}px Tajawal`;
      c.textAlign='center'; c.textBaseline='middle';
      c.fillText('؟',0,0);
      c.restore();
    } else {
      // Revealed ion name
      c.fillStyle=ion.col;
      c.font=`bold ${Math.max(20,w*0.042)}px Tajawal`;
      c.textAlign='center'; c.textBaseline='middle';
      c.fillText(`⁺${ion.ion}`,w/2,h*0.20);
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ 9-2 Tab 3: نشاط اللهب (خطوات تفاعلية) ══
function simG9FlameTest3(){
  cancelAnimationFrame(animFrame);
  simState={t:0, step:0, solution:0, steps_done:{}};
  const S=simState;
  const solutions=[
    {name:'LiCl (كلوريد الليثيوم)', ion:'Li⁺', col:'#E53935', rgb:[229,83,53], color:'أحمر قرمزي'},
    {name:'NaCl (كلوريد الصوديوم)', ion:'Na⁺', col:'#FDD835', rgb:[253,216,53], color:'أصفر'},
    {name:'KCl (كلوريد البوتاسيوم)',  ion:'K⁺',  col:'#AB47BC', rgb:[171,71,188], color:'أرجواني'},
    {name:'CuSO₄ (كبريتات النحاس)',   ion:'Cu²⁺',col:'#00897B', rgb:[0,137,123], color:'أخضر-أزرق'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧪 اختر المحلول</div>
      <div class="ctrl-btns-grid-1">
        ${solutions.map((s,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="f3s-${i}" 
          onclick="simState.solution=${i};simState.step=0;simState.steps_done={};
          document.querySelectorAll('[id^=f3s-]').forEach((b,j)=>b.classList.toggle('active',j===${i}));
          document.getElementById('f3-steplabel').textContent='الخطوة 1: نظِّف السلك';"
        ><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${s.col};margin-left:6px"></span>${s.ion}</button>`).join('')}
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">📋 خطوات التجربة</div>
      <div id="f3-steplabel" style="font-size:12px;color:var(--text-secondary);margin-bottom:6px;text-align:center">الخطوة 1: نظِّف السلك</div>
      <div class="ctrl-btns-grid-1">
        <button class="ctrl-btn" id="f3step1" onclick="simState.step=1;simState.steps_done[1]=true;
          document.getElementById('f3-steplabel').textContent='✓ السلك نظيف — الخطوة 2: غمِّس في المحلول';
          document.getElementById('f3step1').classList.add('active')">١. نظِّف السلك بـ HCl</button>
        <button class="ctrl-btn" id="f3step2" onclick="if(!simState.steps_done[1]){return;}simState.step=2;simState.steps_done[2]=true;
          document.getElementById('f3-steplabel').textContent='✓ السلك مُحمَّل — الخطوة 3: أدخِل في اللهب';
          document.getElementById('f3step2').classList.add('active')">٢. غمِّس السلك في المحلول</button>
        <button class="ctrl-btn action" id="f3step3" onclick="if(!simState.steps_done[2]){return;}simState.step=3;simState.steps_done[3]=true;
          document.getElementById('f3-steplabel').textContent='🔥 لاحظ اللون!';
          document.getElementById('f3step3').classList.add('active')">٣. أدخِل في لهب البنسن 🔥</button>
        <button class="ctrl-btn stop" onclick="simState.step=0;simState.steps_done={};
          ['f3step1','f3step2','f3step3'].forEach(id=>document.getElementById(id).classList.remove('active'));
          document.getElementById('f3-steplabel').textContent='الخطوة 1: نظِّف السلك'">🔄 أعِد التجربة</button>
      </div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا نُنظِّف السلك بـ HCl أولاً؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">السلك قد يحمل بقايا من تجربة سابقة تُلوِّث النتيجة. HCl يُذيب الشوائب المعدنية. نُكرِّر التنظيف حتى يُعطي اللهب لوناً أزرق نقياً بلا لون مُضاف.</div>
    </div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9flametest'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const sol=solutions[S.solution||0];
    const [r,g,b]=sol.rgb;

    // Background
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#111820'); bg.addColorStop(1,'#1A2230');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Step indicators
    [1,2,3].forEach((step,i)=>{
      const sx=w*(0.22+i*0.28), sy=h*0.06;
      const done=S.step>=step, active=S.step===step;
      c.fillStyle=done?'#27AE60':active?'#D4901A':'rgba(255,255,255,0.15)';
      c.beginPath(); c.arc(sx,sy,11,0,Math.PI*2); c.fill();
      c.fillStyle='#fff'; c.font=`bold ${Math.max(10,w*0.018)}px Tajawal`;
      c.textAlign='center'; c.textBaseline='middle';
      c.fillText(done&&!active?'✓':step,sx,sy);
      if(i<2){
        c.strokeStyle=S.step>step?'#27AE60':'rgba(255,255,255,0.2)';
        c.lineWidth=2; c.setLineDash([4,3]);
        c.beginPath(); c.moveTo(sx+12,sy); c.lineTo(sx+w*0.28-12,sy); c.stroke();
        c.setLineDash([]);
      }
    });

    // Bunsen burner
    const bfx=w*0.50, bfy=h*0.58;
    c.fillStyle='#444'; c.beginPath(); c.roundRect(bfx-w*0.055,bfy,w*0.11,h*0.18,5); c.fill();
    c.fillStyle='#333'; c.beginPath(); c.roundRect(bfx-w*0.085,bfy+h*0.16,w*0.17,h*0.04,3); c.fill();

    // Flame
    if(S.step>=3){
      const [fr,fg,fb]=[r,g,b];
      for(let l=0;l<7;l++){
        const fh=h*(0.22+0.04*Math.sin(S.t*0.12+l));
        const fw=w*(0.04+0.01*Math.sin(S.t*0.09+l));
        const grad=c.createRadialGradient(bfx,bfy,0,bfx,bfy-fh*0.5,fh);
        grad.addColorStop(0,'#FFF'); grad.addColorStop(0.3,`rgba(${fr},${fg},${fb},0.95)`);
        grad.addColorStop(0.8,`rgba(${fr},${fg},${fb},0.4)`); grad.addColorStop(1,'transparent');
        c.fillStyle=grad; c.beginPath(); c.ellipse(bfx+(l-3)*w*0.02,bfy-fh*0.38,fw,fh*0.44,0,0,Math.PI*2); c.fill();
      }
      // Glow
      const gl=c.createRadialGradient(bfx,bfy-h*0.15,0,bfx,bfy-h*0.15,h*0.28);
      gl.addColorStop(0,`rgba(${r},${g},${b},0.25)`); gl.addColorStop(1,'transparent');
      c.fillStyle=gl; c.fillRect(0,0,w,h);
    } else {
      // Blue pilot flame
      for(let l=0;l<4;l++){
        const fh=h*(0.10+0.015*Math.sin(S.t*0.1+l));
        const grad=c.createRadialGradient(bfx,bfy,0,bfx,bfy-fh*0.5,fh);
        grad.addColorStop(0,'#FFF'); grad.addColorStop(0.4,'#1A8FA8AA'); grad.addColorStop(1,'transparent');
        c.fillStyle=grad; c.beginPath(); c.ellipse(bfx+(l-1.5)*w*0.015,bfy-fh*0.35,w*0.025,fh*0.4,0,0,Math.PI*2); c.fill();
      }
    }

    // Wire
    const wireStartX=w*0.72, wireStartY=h*0.15;
    c.strokeStyle=S.step>=2?sol.col+'CC':'#888';
    c.lineWidth=3;
    if(S.step>=3){
      c.beginPath(); c.moveTo(wireStartX,wireStartY); c.bezierCurveTo(wireStartX,h*0.45,bfx+w*0.05,bfy-h*0.06,bfx,bfy-h*0.03); c.stroke();
    } else {
      c.beginPath(); c.moveTo(wireStartX,wireStartY); c.lineTo(wireStartX-w*0.04,h*0.65); c.stroke();
    }
    c.fillStyle='#888'; c.beginPath(); c.arc(wireStartX,wireStartY,5,0,Math.PI*2); c.fill();
    c.fillStyle='#666'; c.fillRect(wireStartX-2,wireStartY-2,w*0.05,h*0.018);
    _lbl(c,'مقبض السلك',wireStartX+w*0.05,wireStartY,'#888',Math.max(8,w*0.015));

    // HCl beaker (step 1)
    const hclBx=w*0.06, hclBy=h*0.50;
    const hclBw=w*0.18, hclBh=h*0.28;
    _drawBeakerU9(c,hclBx,hclBy,hclBw,hclBh,'#E74C3C',S.step>=1?0.25:0.08);
    _lbl(c,'HCl مخفَّف',hclBx+hclBw/2,hclBy+hclBh+16,'#E74C3C',Math.max(8,w*0.015));

    // Sample beaker (step 2+)
    const smBx=w*0.06, smBy=h*0.20;
    const smBw=w*0.18, smBh=h*0.25;
    _drawBeakerU9(c,smBx,smBy,smBw,smBh,sol.col,S.step>=2?0.35:0.12);
    _lbl(c,sol.ion,smBx+smBw/2,smBy+smBh+16,sol.col,Math.max(8,w*0.015));

    // Result banner
    if(S.step===3){
      c.fillStyle='rgba(0,0,0,0.55)';
      c.beginPath(); c.roundRect(w*0.04,h*0.83,w*0.92,h*0.12,8); c.fill();
      c.fillStyle=sol.col; c.font=`bold ${Math.max(12,w*0.022)}px Tajawal`;
      c.textAlign='center'; c.textBaseline='middle';
      c.fillText(`${sol.ion} → لهب ${sol.color} 🎯`,w/2,h*0.893);
    }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 🧪 9-3 ترسيب الكاتيونات — نسخة تفاعلية محسّنة
// ══════════════════════════════════════════════════════════════

// ══ 9-3 Tab 1: NaOH + كاتيونات ══
function simG9CationPpt1(){
  cancelAnimationFrame(animFrame);
  const cations=[
    {ion:'Fe²⁺', col:'#388E3C', desc:'راسب أخضر فاتح',   excess:'يبقى الراسب', dissolve:false, eq:'Fe²⁺ + 2OH⁻ → Fe(OH)₂↓'},
    {ion:'Fe³⁺', col:'#8B2500', desc:'راسب بني محمر',     excess:'يبقى الراسب', dissolve:false, eq:'Fe³⁺ + 3OH⁻ → Fe(OH)₃↓'},
    {ion:'Cu²⁺', col:'#0288D1', desc:'راسب أزرق فاتح',   excess:'يبقى الراسب', dissolve:false, eq:'Cu²⁺ + 2OH⁻ → Cu(OH)₂↓'},
    {ion:'Ca²⁺', col:'#BDBDBD', desc:'راسب أبيض',         excess:'يبقى الراسب', dissolve:false, eq:'Ca²⁺ + 2OH⁻ → Ca(OH)₂↓'},
    {ion:'Zn²⁺', col:'#90A4AE', desc:'راسب أبيض',         excess:'يذوب → [Zn(OH)₄]²⁻', dissolve:true, eq:'Zn²⁺ + 2OH⁻ → Zn(OH)₂↓'},
  ];
  simState={t:0, selected:0, drops:0, reacted:false, excess:false, animDropY:-1};
  const S=simState;

  window._cp1Select=function(i){
    S.selected=i; S.drops=0; S.reacted=false; S.excess=false; S.animDropY=-1;
    document.querySelectorAll('[id^=cp1-]').forEach((b,j)=>b.classList.toggle('active',j===i));
    document.getElementById('cp1-result').innerHTML='<span style="opacity:0.5">أضِف NaOH لمشاهدة النتيجة</span>';
  };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⚗️ اختر الكاتيون</div>
      <div class="ctrl-btns-grid-1">
        ${cations.map((cat,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="cp1-${i}" 
          style="border-right:4px solid ${cat.col}66"
          onclick="window._cp1Select(${i})">${cat.ion}</button>`).join('')}
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🔬 أضِف النواشف</div>
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn action" onclick="
          if(simState.drops<8){simState.drops++;if(simState.drops>=2)simState.reacted=true;simState.animDropY=0;}
          const c=document.getElementById('cp1-result');
          const cat=({ion:'Fe²⁺',col:'#388E3C',desc:'راسب أخضر فاتح',excess:'يبقى الراسب',dissolve:false,eq:'Fe²⁺ + 2OH⁻ → Fe(OH)₂↓'},{ion:'Fe³⁺',col:'#8B2500',desc:'راسب بني محمر',excess:'يبقى الراسب',dissolve:false,eq:'Fe³⁺ + 3OH⁻ → Fe(OH)₃↓'},{ion:'Cu²⁺',col:'#0288D1',desc:'راسب أزرق فاتح',excess:'يبقى الراسب',dissolve:false,eq:'Cu²⁺ + 2OH⁻ → Cu(OH)₂↓'},{ion:'Ca²⁺',col:'#BDBDBD',desc:'راسب أبيض',excess:'يبقى الراسب',dissolve:false,eq:'Ca²⁺ + 2OH⁻ → Ca(OH)₂↓'},{ion:'Zn²⁺',col:'#90A4AE',desc:'راسب أبيض',excess:'يذوب → [Zn(OH)₄]²⁻',dissolve:true,eq:'Zn²⁺ + 2OH⁻ → Zn(OH)₂↓'})[simState.selected];
          if(simState.drops>=2&&c)c.innerHTML='<span style=color:'+['#388E3C','#8B2500','#0288D1','#BDBDBD','#90A4AE'][simState.selected]+'>'+['راسب أخضر فاتح ✅','راسب بني محمر ✅','راسب أزرق فاتح ✅','راسب أبيض ✅','راسب أبيض ✅'][simState.selected]+'</span>'
        ">+ قطرة NaOH</button>
        <button class="ctrl-btn stop" onclick="
          simState.excess=true;simState.drops=10;simState.reacted=true;
          const el=document.getElementById('cp1-result');
          const msgs=['يبقى الراسب','يبقى الراسب','يبقى الراسب','يبقى الراسب','يذوب → [Zn(OH)₄]²⁻'];
          if(el)el.innerHTML='<strong>فائض NaOH: </strong>'+msgs[simState.selected];
        ">+ فائض NaOH</button>
      </div>
      <button class="ctrl-btn" style="margin-top:6px" onclick="window._cp1Select(simState.selected)">🔄 إعادة</button>
    </div>
    <div id="cp1-result" class="info-box" style="min-height:36px;font-size:13px;text-align:center;margin-top:6px">
      <span style="opacity:0.5">أضِف NaOH لمشاهدة النتيجة</span>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا يذوب هيدروكسيد الزنك في الفائض؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">Zn(OH)₂ متذبذب (Amphoteric) — يتفاعل مع الأحماض والقواعد. في فائض NaOH: Zn(OH)₂ + 2OH⁻ → [Zn(OH)₄]²⁻ (يذوب). هذا يُميِّزه عن Ca²⁺ الذي لا يذوب!</div>
    </div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9cationppt'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const cat=cations[S.selected||0];
    const prog=Math.min((S.drops||0)/6,1);

    // Background gradient
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F3E5F5'); bg.addColorStop(1,'#E8D5F0');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    _lbl(c,'NaOH يُرسِّب الكاتيونات',w/2,h*0.055,'#4A148C',Math.max(13,w*0.025));

    // Sample beaker (left)
    const bx1=w*0.06, by1=h*0.12, bw1=w*0.32, bh1=h*0.44;
    _drawBeakerU9(c,bx1,by1,bw1,bh1,'#87CEEB',0.22);
    _lbl(c,`محلول ${cat.ion}`,bx1+bw1/2,by1+bh1+18,'#1E2D3D',Math.max(10,w*0.018));

    // NaOH dropper (animated drops)
    const dX=bx1+bw1/2, dY=by1-h*0.07;
    c.fillStyle='#F3E5F5'; c.strokeStyle='#7B1FA2'; c.lineWidth=2;
    c.beginPath(); c.roundRect(dX-w*0.016,dY,w*0.032,h*0.06,4); c.fill(); c.stroke();
    _lbl(c,'NaOH',dX,dY-8,'#6B4E9A',Math.max(9,w*0.016));
    // Dropper tip
    c.fillStyle='#7B1FA2';
    c.beginPath(); c.moveTo(dX-4,dY+h*0.06); c.lineTo(dX+4,dY+h*0.06); c.lineTo(dX,dY+h*0.075); c.closePath(); c.fill();

    // Animated drop
    if(S.drops>0 && S.animDropY>=0){
      S.animDropY+=h*0.04;
      const dropAlpha=S.animDropY<bh1*0.5?1:0;
      if(dropAlpha>0){
        c.fillStyle=`rgba(123,31,162,${dropAlpha*0.7})`;
        c.beginPath(); c.ellipse(dX,dY+h*0.075+S.animDropY,4,6,0,0,Math.PI*2); c.fill();
      }
    }

    // NaOH drop count indicator
    if(S.drops>0){
      for(let d=0;d<Math.min(S.drops,6);d++){
        c.fillStyle='rgba(123,31,162,0.6)';
        c.beginPath(); c.arc(bx1+bw1*0.2+d*bw1*0.11,by1+bh1*0.18,3,0,Math.PI*2); c.fill();
      }
    }

    // Result beaker (right)
    const bx2=w*0.58, by2=by1, bw2=w*0.36, bh2=bh1;
    _drawBeakerU9(c,bx2,by2,bw2,bh2,'#87CEEB',0.06);

    if(S.reacted){
      const dissolved=cat.dissolve&&S.excess;
      if(!dissolved){
        const pAlpha=Math.min(prog*1.2,0.75);
        const pH=bh2*0.38*prog;
        // Precipitate
        c.fillStyle=cat.col+(Math.round(pAlpha*200).toString(16).padStart(2,'0'));
        c.fillRect(bx2+2,by2+bh2-pH,bw2-4,pH);
        // Precipitate particles
        c.save(); c.beginPath(); c.rect(bx2+2,by2+bh2-pH,bw2-4,pH); c.clip();
        for(let p=0;p<20;p++){
          const px=bx2+5+((S.t*0.3+p*37)%(bw2-10));
          const py=by2+bh2-pH+2+((S.t*0.1+p*17)%pH);
          c.fillStyle=cat.col+'99'; c.beginPath(); c.arc(px,py,2+Math.sin(p)*1.5,0,Math.PI*2); c.fill();
        }
        c.restore();
        // Turbid water above precipitate
        c.fillStyle=cat.col+'18'; c.fillRect(bx2+2,by2,bw2-4,bh2-pH);
      } else {
        // Dissolved - clear solution
        c.fillStyle='rgba(26,143,168,0.1)'; c.fillRect(bx2,by2,bw2,bh2);
        _lbl(c,'محلول شفاف ← ذاب!',bx2+bw2/2,by2+bh2*0.45,'#1A8FA8',Math.max(11,w*0.020));
      }
    }
    _lbl(c,'الناتج',bx2+bw2/2,by2+bh2+18,'#1E2D3D',Math.max(10,w*0.018));

    // Equation & result box
    if(S.reacted){
      const ry=h*0.66, rh=h*0.22;
      c.fillStyle='rgba(74,20,140,0.07)'; c.beginPath(); c.roundRect(w*0.04,ry,w*0.92,rh,10); c.fill();
      c.strokeStyle='rgba(74,20,140,0.15)'; c.lineWidth=1.5;
      c.beginPath(); c.roundRect(w*0.04,ry,w*0.92,rh,10); c.stroke();
      const dispText=S.excess?cat.excess:cat.desc;
      _lbl(c,'🔬 '+dispText,w/2,ry+rh*0.28,'#4A148C',Math.max(11,w*0.021));
      c.fillStyle='#555'; c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText(cat.eq,w/2,ry+rh*0.65);
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ 9-3 Tab 2: NH₃ + كاتيونات ══
function simG9CationPpt2(){
  cancelAnimationFrame(animFrame);
  const cations=[
    {ion:'Fe²⁺', col:'#388E3C', desc:'راسب أخضر فاتح (مثل NaOH)', excess:'يبقى الراسب', dissolve:false},
    {ion:'Fe³⁺', col:'#8B2500', desc:'راسب بني محمر (مثل NaOH)',   excess:'يبقى الراسب', dissolve:false},
    {ion:'Cu²⁺', col:'#0288D1', desc:'راسب أزرق فاتح أولاً',       excess:'أزرق داكن [Cu(NH₃)₄]²⁺', dissolve:true},
    {ion:'Ca²⁺', col:'#BDBDBD', desc:'لا راسب واضح (NH₃ ضعيفة)',   excess:'لا تغيُّر', dissolve:false},
    {ion:'Zn²⁺', col:'#90A4AE', desc:'راسب أبيض',                   excess:'يذوب → شفاف', dissolve:true},
  ];
  simState={t:0, selected:0, drops:0, reacted:false, excess:false};
  const S=simState;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">💨 اختر الكاتيون</div>
      <div class="ctrl-btns-grid-1">
        ${cations.map((cat,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="cp2-${i}" 
          style="border-right:4px solid ${cat.col}66"
          onclick="simState.selected=${i};simState.drops=0;simState.reacted=false;simState.excess=false;document.querySelectorAll('[id^=cp2-]').forEach((b,j)=>b.classList.toggle('active',j===${i}))">${cat.ion}</button>`).join('')}
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">إضافة الأمونيا NH₃</div>
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn action" onclick="if(simState.drops<8){simState.drops++;if(simState.drops>=2)simState.reacted=true;}">+ قطرة NH₃</button>
        <button class="ctrl-btn stop" onclick="simState.excess=true;simState.drops=10;simState.reacted=true;">+ فائض NH₃</button>
      </div>
      <button class="ctrl-btn" style="margin-top:6px" onclick="simState.drops=0;simState.reacted=false;simState.excess=false;">🔄 إعادة</button>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ما الفرق بين NaOH و NH₃ كواشف؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">Cu²⁺ يذوب في فائض NH₃ → أزرق داكن جميل. Ca²⁺ لا يُرسَّب بـ NH₃ لأنها قاعدة ضعيفة. هذه الفروق تُساعد في التمييز الدقيق بين الكاتيونات!</div>
    </div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9cationppt'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const cat=cations[S.selected||0];
    const prog=Math.min((S.drops||0)/6,1);

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#E8F5E9'); bg.addColorStop(1,'#C8E6C9');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    _lbl(c,'NH₃ (الأمونيا) — واشف الكاتيونات',w/2,h*0.055,'#1B5E20',Math.max(13,w*0.024));

    // NH₃ gas bubbles rising in background
    for(let b=0;b<6;b++){
      const bx=w*(0.1+b*0.15), by_b=h*(0.8-((S.t*0.004+b*0.15)%0.7));
      const ba=0.08+0.04*Math.sin(S.t*0.05+b);
      c.fillStyle=`rgba(76,175,80,${ba})`;
      c.beginPath(); c.arc(bx,by_b,4+b*1.5,0,Math.PI*2); c.fill();
    }

    // Sample beaker
    const bx1=w*0.06, by1=h*0.12, bw1=w*0.32, bh1=h*0.44;
    _drawBeakerU9(c,bx1,by1,bw1,bh1,'#87CEEB',0.22);
    _lbl(c,`محلول ${cat.ion}`,bx1+bw1/2,by1+bh1+18,'#1E2D3D',Math.max(10,w*0.018));

    // NH₃ dropper
    const dX=bx1+bw1/2, dY=by1-h*0.07;
    c.fillStyle='#E8F5E9'; c.strokeStyle='#4CAF50'; c.lineWidth=2;
    c.beginPath(); c.roundRect(dX-w*0.016,dY,w*0.032,h*0.06,4); c.fill(); c.stroke();
    _lbl(c,'NH₃',dX,dY-8,'#2E7D32',Math.max(9,w*0.016));
    // NH₃ molecules floating from dropper
    for(let nm=0;nm<3;nm++){
      const nx=dX+(nm-1)*8, ny=dY-nm*8-Math.sin(S.t*0.07+nm)*5;
      c.fillStyle='rgba(76,175,80,0.35)'; c.beginPath(); c.arc(nx,ny,3,0,Math.PI*2); c.fill();
    }

    // Result beaker
    const bx2=w*0.58, by2=by1, bw2=w*0.36, bh2=bh1;
    _drawBeakerU9(c,bx2,by2,bw2,bh2,'#87CEEB',0.06);

    if(S.reacted){
      const dissolved=cat.dissolve&&S.excess;
      if(!dissolved && cat.ion!=='Ca²⁺'){
        const pA=Math.min(prog*1.1,0.72);
        const pH=bh2*0.38*prog;
        c.fillStyle=cat.col+(Math.round(pA*195).toString(16).padStart(2,'0'));
        c.fillRect(bx2+2,by2+bh2-pH,bw2-4,pH);
        c.fillStyle=cat.col+'15'; c.fillRect(bx2+2,by2,bw2-4,bh2-pH);
      } else if(dissolved){
        const exCol=S.selected===2?'#1565C0':'#78909C';
        c.fillStyle=exCol+'22'; c.fillRect(bx2,by2,bw2,bh2);
        _lbl(c,S.selected===2?'أزرق داكن ✨':'شفاف',bx2+bw2/2,by2+bh2*0.45,exCol,Math.max(11,w*0.019));
      } else {
        // Ca²⁺ - very slight turbidity
        c.fillStyle='rgba(200,200,200,0.05)'; c.fillRect(bx2,by2,bw2,bh2);
      }
    }
    _lbl(c,'الناتج',bx2+bw2/2,by2+bh2+18,'#1E2D3D',Math.max(10,w*0.018));

    if(S.reacted){
      const ry=h*0.66, rh=h*0.22;
      c.fillStyle='rgba(27,94,32,0.07)'; c.beginPath(); c.roundRect(w*0.04,ry,w*0.92,rh,10); c.fill();
      c.strokeStyle='rgba(27,94,32,0.15)'; c.lineWidth=1.5;
      c.beginPath(); c.roundRect(w*0.04,ry,w*0.92,rh,10); c.stroke();
      const dispText=S.excess?cat.excess:cat.desc;
      _lbl(c,'🔬 '+dispText,w/2,ry+rh*0.38,'#1B5E20',Math.max(11,w*0.021));
      // Compare with NaOH
      if(S.excess){
        const compareTexts={
          'Fe²⁺':'مثل NaOH — يبقى','Fe³⁺':'مثل NaOH — يبقى',
          'Cu²⁺':'بخلاف NaOH — يذوب ويصبح أزرق داكن!',
          'Ca²⁺':'بخلاف NaOH — NH₃ ضعيفة لا تُرسِّب Ca²⁺',
          'Zn²⁺':'مثل NaOH — يذوب في الفائض'
        };
        c.fillStyle='#888'; c.font=`${Math.max(8,w*0.014)}px Tajawal`;
        c.textAlign='center'; c.textBaseline='alphabetic';
        c.fillText('مقارنة: '+compareTexts[cat.ion],w/2,ry+rh*0.78);
      }
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ 9-3 Tab 3: حدِّد الكاتيون (لعبة تعليمية) ══
window._cp3Cations=['Fe²⁺','Fe³⁺','Cu²⁺','Ca²⁺','Zn²⁺'];
window._cp3Colors={
  'Fe²⁺':'#388E3C','Fe³⁺':'#8B2500','Cu²⁺':'#0288D1','Ca²⁺':'#BDBDBD','Zn²⁺':'#90A4AE'
};
window._cp3Results={
  'Fe²⁺':{naoh:'أخضر فاتح، يبقى',  nh3:'أخضر فاتح، يبقى'},
  'Fe³⁺':{naoh:'بني محمر، يبقى',    nh3:'بني محمر، يبقى'},
  'Cu²⁺':{naoh:'أزرق فاتح، يبقى',   nh3:'أزرق ثم يذوب → أزرق داكن'},
  'Ca²⁺':{naoh:'أبيض، يبقى',        nh3:'لا راسب تقريباً'},
  'Zn²⁺':{naoh:'أبيض، يذوب',        nh3:'أبيض ثم يذوب → شفاف'},
};
function simG9CationPpt3(){
  cancelAnimationFrame(animFrame);
  const cations=window._cp3Cations;
  const results=window._cp3Results;
  const colors=window._cp3Colors;
  let qi=Math.floor(Math.random()*cations.length);
  let useNaOH=Math.random()>0.5;
  simState={t:0, qi, useNaOH, chosen:null, score:0, streak:0, total:0, answeredCations:new Set(), usedQs:[qi]};
  const S=simState;

  window.newQCation3=function(){
    if(S.usedQs.length >= cations.length) S.usedQs=[];
    let newQi; do{ newQi=Math.floor(Math.random()*cations.length); }while(S.usedQs.includes(newQi));
    S.usedQs.push(newQi);
    S.qi=newQi; S.useNaOH=Math.random()>0.5; S.chosen=null;
    document.querySelectorAll('[id^=cp3btn-]').forEach(b=>b.classList.remove('correct','wrong','active'));
    const r=results[cations[S.qi]][S.useNaOH?'naoh':'nh3'];
    document.getElementById('cp3-q').innerHTML=`عند إضافة <strong style="color:${S.useNaOH?'#7B1FA2':'#2E7D32'}">${S.useNaOH?'NaOH':'NH₃'}</strong> نحصل على: <strong>${r}</strong>`;
    document.getElementById('cp3-fb').innerHTML='';
  };

  window._cp3Answer=function(i){
    if(S.chosen!==null) return;
    S.chosen=cations[i]; S.total++;
    S.answeredCations.add(cations[S.qi]);
    const correct=cations[i]===cations[S.qi];
    if(correct){ S.streak++; S.score+=10+(S.streak>1?S.streak*2:0); }
    else { S.streak=0; }
    document.getElementById('cp3-score').textContent=S.score;
    document.getElementById('cp3-streak').textContent=S.streak>0?'🔥'.repeat(Math.min(S.streak,5)):'—';
    const btn=document.getElementById('cp3btn-'+i);
    if(btn) btn.classList.add(correct?'correct':'wrong');
    if(!correct){
      const cb=document.getElementById('cp3btn-'+S.qi);
      if(cb) cb.classList.add('correct');
    }
    document.getElementById('cp3-fb').innerHTML=correct
      ?`<span style="color:#27AE60">✅ ممتاز! ${S.streak>2?'سلسلة '+S.streak+' 🔥':''}</span>`
      :`<span style="color:#C0392B">❌ الصحيح: <strong style="color:${colors[cations[S.qi]]}">${cations[S.qi]}</strong></span>`;
    setTimeout(()=>{ if(S.chosen!==null) window.newQCation3(); }, 1600);
  };

  controls(`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">
      <div style="text-align:center;background:rgba(39,174,96,0.1);border:1px solid rgba(39,174,96,0.3);border-radius:8px;padding:6px">
        <div style="font-size:10px;color:var(--text-secondary)">النقاط</div>
        <div id="cp3-score" style="font-size:20px;font-weight:800;color:#27AE60">0</div>
      </div>
      <div style="text-align:center;background:rgba(212,144,26,0.1);border:1px solid rgba(212,144,26,0.3);border-radius:8px;padding:6px">
        <div style="font-size:10px;color:var(--text-secondary)">السلسلة</div>
        <div id="cp3-streak" style="font-size:16px;font-weight:800;color:#D4901A">—</div>
      </div>
    </div>
    <div id="cp3-q" class="info-box" style="font-size:13px;text-align:center;line-height:1.7;margin-bottom:8px">
      عند إضافة <strong style="color:${useNaOH?'#7B1FA2':'#2E7D32'}">${useNaOH?'NaOH':'NH₃'}</strong> نحصل على: <strong>${results[cations[qi]][useNaOH?'naoh':'nh3']}</strong>
    </div>
    <div class="ctrl-label">ما الكاتيون المجهول؟</div>
    <div class="ctrl-btns-grid-1">
      ${cations.map((cat,i)=>`<button class="ctrl-btn" id="cp3btn-${i}" 
        style="border-right:4px solid ${colors[cat]}77;transition:all 0.2s"
        onclick="window._cp3Answer(${i})">${cat}</button>`).join('')}
    </div>
    <div id="cp3-fb" style="padding:8px;text-align:center;font-size:13px;font-weight:700;min-height:36px"></div>
    <button class="ctrl-btn action" style="margin-top:4px" onclick="window.newQCation3()">🎲 سؤال جديد</button>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9cationppt'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;

    // Background
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#FFF8E7'); bg.addColorStop(1,'#FFF3E0');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // عنوان الجدول يوضّح الكاشف المستخدم
    const reagentLabel = S.useNaOH ? 'NaOH' : 'NH₃';
    const reagentColor = S.useNaOH ? '#7B1FA2' : '#2E7D32';
    _lbl(c,'جدول نتائج اختبار الترسيب',w/2,h*0.055,'#E65100',Math.max(13,w*0.025));

    // الجدول: عمودان أثناء السؤال، ثلاثة أعمدة بعد الإجابة
    const showBothCols = S.chosen !== null;
    const colW = w * (showBothCols ? 0.31 : 0.46);
    const rows=Object.entries(results);
    const rowH=h*0.105, sx=w*0.02, sy=h*0.09;

    // رأس الجدول
    const headerCols = showBothCols
      ? ['الكاتيون', `مع ${reagentLabel}`, `مع ${S.useNaOH?'NH₃':'NaOH'}`]
      : ['الكاتيون', `← مع ${reagentLabel}`];
    headerCols.forEach((col,i)=>{
      const hx=sx+i*colW, hy=sy;
      let hColor = '#E65100';
      if(i===1) hColor = reagentColor;
      if(i===2) hColor = '#546E7A';
      c.fillStyle=hColor;
      c.beginPath(); c.roundRect(hx+1,hy,colW-3,rowH*0.68,4); c.fill();
      c.fillStyle='#fff'; c.font=`bold ${Math.max(8,w*0.015)}px Tajawal`;
      c.textAlign='center'; c.textBaseline='middle';
      c.fillText(col,hx+colW/2,hy+rowH*0.34);
    });

    // صفوف الجدول
    rows.forEach(([cat,res],ri)=>{
      const ry=sy+rowH*(ri+0.68);
      const isTarget=cat===cations[S.qi];
      const isChosen=S.chosen===cat;
      const isAnswered=S.answeredCations.has(cat);

      let rowBg='rgba(255,255,255,0.6)';
      if(isTarget && S.chosen){ rowBg='rgba(39,174,96,0.15)'; }
      else if(isChosen && !isTarget){ rowBg='rgba(192,57,43,0.12)'; }
      else if(isTarget && !S.chosen){ rowBg='rgba(255,165,0,0.08)'; }
      c.fillStyle=rowBg;
      c.beginPath(); c.roundRect(sx+1,ry,w*0.94,rowH*0.84,4); c.fill();

      if(isTarget){
        c.strokeStyle=S.chosen?'#27AE60':'#FF8F00'; c.lineWidth=S.chosen?2:1.5;
        c.beginPath(); c.roundRect(sx+1,ry,w*0.94,rowH*0.84,4); c.stroke();
      }

      const showDot = !isTarget || S.chosen !== null;
      c.fillStyle = showDot ? colors[cat] : '#CCCCCC';
      c.beginPath(); c.arc(sx+12,ry+rowH*0.42,6,0,Math.PI*2); c.fill();

      const showCatName = isAnswered || (isTarget && S.chosen !== null);
      const showResult = isAnswered;
      const showSecond = isAnswered && showBothCols;

      const activeRes = S.useNaOH ? res.naoh : res.nh3;
      const secondRes = S.useNaOH ? res.nh3 : res.naoh;

      // عمود الكاتيون
      c.fillStyle = showCatName ? (isTarget&&S.chosen?'#1B5E20':colors[cat]) : '#999999';
      c.font = `${Math.max(9,w*0.016)}px Tajawal`;
      c.textAlign='center'; c.textBaseline='middle';
      c.fillText(showCatName ? cat : (isTarget ? '؟' : '—'), sx+colW/2, ry+rowH*0.42);

      // عمود الكاشف المستخدم
      c.fillStyle = showResult ? (isTarget&&S.chosen?'#1B5E20':'#37474F') : '#CCCCCC';
      c.font = `${Math.max(8,w*0.014)}px Tajawal`;
      c.fillText(showResult ? activeRes : '???', sx+colW+colW/2, ry+rowH*0.42);

      // عمود الكاشف الثاني (يظهر بعد الإجابة فقط)
      if(showBothCols){
        c.fillStyle = showSecond ? '#546E7A' : '#CCCCCC';
        c.font = `${Math.max(8,w*0.013)}px Tajawal`;
        c.fillText(showSecond ? secondRes : '???', sx+colW*2+colW/2, ry+rowH*0.42);
      }

      if(showResult){
        c.strokeStyle=reagentColor+'33'; c.lineWidth=1;
        c.beginPath(); c.roundRect(sx+colW+1,ry,colW-2,rowH*0.84,2); c.stroke();
      }
    });

    if(S.score>0){
      c.fillStyle='rgba(39,174,96,0.1)'; c.beginPath();
      c.roundRect(w*0.70,h*0.82,w*0.26,h*0.12,8); c.fill();
      c.fillStyle='#27AE60'; c.font=`bold ${Math.max(12,w*0.022)}px Tajawal`;
      c.textAlign='center'; c.textBaseline='middle';
      c.fillText('⭐ '+S.score,w*0.83,h*0.88);
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// ⚗️ 9-4 اختبار الأنيونات — نسخة تفاعلية محسّنة
// ══════════════════════════════════════════════════════════════

// ══ 9-4 Tab 1: Cl⁻ و Br⁻ بـ AgNO₃ ══
function simG9AnionTest1(){
  cancelAnimationFrame(animFrame);
  const anions=[
    {ion:'Cl⁻', col:'#E0E0E0', colName:'أبيض',       eq:'Ag⁺ + Cl⁻ → AgCl↓ (أبيض)',    nh3:'يذوب في NH₃ مخفَّفة ✅',    rgb:[220,220,220]},
    {ion:'Br⁻', col:'#FFF59D', colName:'أصفر كريمي',  eq:'Ag⁺ + Br⁻ → AgBr↓ (كريمي)',  nh3:'يذوب في NH₃ مركَّزة فقط ⚠️', rgb:[255,245,157]},
    {ion:'I⁻',  col:'#FFF176', colName:'أصفر',        eq:'Ag⁺ + I⁻ → AgI↓ (أصفر)',     nh3:'لا يذوب في NH₃ ❌',          rgb:[255,241,118]},
  ];
  simState={t:0, selected:0, drops:0, reacted:false, testNH3:false, nh3Added:false};
  const S=simState;

  window._at1Select=function(i){
    S.selected=i; S.drops=0; S.reacted=false; S.testNH3=false; S.nh3Added=false;
    document.querySelectorAll('[id^=at1-]').forEach((b,j)=>b.classList.toggle('active',j===i));
    document.getElementById('at1-res').innerHTML='<span style="opacity:0.5">أضِف AgNO₃ لمشاهدة التفاعل</span>';
  };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🥈 اختر الأنيون</div>
      <div class="ctrl-btns-grid">
        ${anions.map((a,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="at1-${i}" onclick="window._at1Select(${i})">${a.ion}</button>`).join('')}
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn action" onclick="simState.drops=Math.min(simState.drops+1,6);if(simState.drops>=2){simState.reacted=true;document.getElementById('at1-res').innerHTML='<strong>راسب '+['أبيض','أصفر كريمي','أصفر'][simState.selected]+'</strong> ← '+['AgCl','AgBr','AgI'][simState.selected];}">+ قطرة AgNO₃</button>
        <button class="ctrl-btn" onclick="if(simState.reacted){simState.nh3Added=true;simState.testNH3=true;document.getElementById('at1-res').innerHTML='مع NH₃: '+['يذوب ← Cl⁻ مؤكَّد ✅','يذوب جزئياً ← Br⁻ ⚠️','لا يذوب ← I⁻ مؤكَّد ✅'][simState.selected];}else{alert('أضِف AgNO₃ أولاً!');}">+ اختبار NH₃</button>
      </div>
      <button class="ctrl-btn" style="margin-top:6px" onclick="window._at1Select(simState.selected)">🔄 إعادة</button>
    </div>
    <div id="at1-res" class="info-box" style="min-height:36px;font-size:13px;text-align:center;margin-top:6px">
      <span style="opacity:0.5">أضِف AgNO₃ لمشاهدة التفاعل</span>
    </div>
    <div class="info-box" style="margin-top:6px;font-size:12px;text-align:center">
      💡 يُضاف HNO₃ المخفَّف أولاً لإزالة CO₃²⁻
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ كيف نُميِّز Cl⁻ عن Br⁻ و I⁻؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">Cl⁻ أبيض يذوب في NH₃ مخفَّفة | Br⁻ كريمي يذوب في NH₃ مركَّزة فقط | I⁻ أصفر لا يذوب أبداً. الفرق في لون الراسب وسلوكه مع الأمونيا!</div>
    </div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9aniontest'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const anion=anions[S.selected||0];
    const prog=Math.min((S.drops||0)/5,1);

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#ECEFF1'); bg.addColorStop(1,'#CFD8DC');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    _lbl(c,'اختبار نترات الفضة AgNO₃',w/2,h*0.055,'#37474F',Math.max(13,w*0.025));

    // Sample beaker
    const bx1=w*0.06, by1=h*0.12, bw1=w*0.32, bh1=h*0.44;
    _drawBeakerU9(c,bx1,by1,bw1,bh1,'#87CEEB',0.22);
    _lbl(c,`محلول ${anion.ion}`,bx1+bw1/2,by1+bh1+18,'#37474F',Math.max(10,w*0.018));

    // AgNO₃ dropper
    const dX=bx1+bw1/2, dY=by1-h*0.07;
    c.fillStyle='#FFFDE7'; c.strokeStyle='#FFC107'; c.lineWidth=2;
    c.beginPath(); c.roundRect(dX-w*0.016,dY,w*0.032,h*0.06,4); c.fill(); c.stroke();
    _lbl(c,'AgNO₃',dX,dY-8,'#F57F17',Math.max(8,w*0.015));
    c.fillStyle='#FFC107';
    c.beginPath(); c.moveTo(dX-4,dY+h*0.06); c.lineTo(dX+4,dY+h*0.06); c.lineTo(dX,dY+h*0.075); c.closePath(); c.fill();

    // Result beaker
    const bx2=w*0.59, by2=by1, bw2=w*0.35, bh2=bh1;
    _drawBeakerU9(c,bx2,by2,bw2,bh2,'#87CEEB',0.06);

    if(S.reacted){
      // Check if dissolved after NH₃
      const dissolved=S.nh3Added&&(anion.ion==='Cl⁻'||(anion.ion==='Br⁻'));
      if(!dissolved){
        const pH=bh2*0.36;
        // Precipitate cloud effect
        c.fillStyle=anion.col+'CC'; c.fillRect(bx2+2,by2+bh2-pH,bw2-4,pH);
        // Particles
        for(let p=0;p<22;p++){
          const px=bx2+6+(p*31+S.t*0.3)%(bw2-12);
          const py=by2+bh2-pH+3+(p*19+S.t*0.15)%pH;
          c.fillStyle=anion.col+'99'; c.beginPath();
          c.arc(px,py,1.5+Math.sin(p)*1,0,Math.PI*2); c.fill();
        }
        // Turbid water
        c.fillStyle=anion.col+'14'; c.fillRect(bx2+2,by2,bw2-4,bh2-pH);
      } else {
        // Dissolved after NH₃
        c.fillStyle='rgba(100,200,255,0.1)'; c.fillRect(bx2,by2,bw2,bh2);
        _lbl(c,'ذاب! ✅',bx2+bw2/2,by2+bh2*0.45,'#1A8FA8',Math.max(11,w*0.020));
      }
    }
    _lbl(c,'الناتج',bx2+bw2/2,by2+bh2+18,'#1E2D3D',Math.max(10,w*0.018));

    if(S.reacted){
      const ry=h*0.65, rh=h*0.23;
      c.fillStyle='rgba(55,71,79,0.07)'; c.beginPath(); c.roundRect(w*0.04,ry,w*0.92,rh,10); c.fill();
      c.strokeStyle='rgba(55,71,79,0.12)'; c.lineWidth=1.5;
      c.beginPath(); c.roundRect(w*0.04,ry,w*0.92,rh,10); c.stroke();
      _lbl(c,`✅ راسب ${anion.colName}`,w/2,ry+rh*0.25,'#37474F',Math.max(11,w*0.022));
      c.fillStyle='#555'; c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText(anion.eq,w/2,ry+rh*0.55);
      c.fillStyle=S.nh3Added?'#1A8FA8':'#888';
      c.fillText('مع NH₃: '+anion.nh3,w/2,ry+rh*0.82);
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ 9-4 Tab 2: SO₄²⁻ بـ BaCl₂ (تفاعلي خطوة بخطوة) ══
function simG9AnionTest2(){
  cancelAnimationFrame(animFrame);
  simState={t:0, drops:0, reacted:false, addedHCl:false, showBaSO4:false};
  const S=simState;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⚪ اختبار SO₄²⁻ بكلوريد الباريوم BaCl₂</div>
      <div class="info-box" style="font-size:12px;text-align:center;margin-bottom:8px">
        ⚠️ يجب إضافة HCl أولاً لإزالة CO₃²⁻ التي تُعطي راسباً أبيض زائفاً
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-btns-grid-1">
        <button class="ctrl-btn" id="at2-hcl" onclick="
          simState.addedHCl=true;
          document.getElementById('at2-hcl').classList.add('active');
          document.getElementById('at2-status').textContent='✓ HCl مُضاف — جاهز لاختبار BaCl₂';
          document.getElementById('at2-status').style.color='#27AE60';">
          ١. أضِف HCl المخفَّف</button>
        <button class="ctrl-btn action" onclick="
          if(!simState.addedHCl){
            document.getElementById('at2-status').textContent='❌ أضِف HCl أولاً!';
            document.getElementById('at2-status').style.color='#C0392B';
            return;
          }
          simState.drops++;if(simState.drops>=2)simState.reacted=true;
          document.getElementById('at2-status').textContent='BaCl₂ مُضاف — '+simState.drops+' قطرة';
        ">٢. أضِف BaCl₂</button>
      </div>
      <button class="ctrl-btn" style="margin-top:6px" onclick="
        simState.drops=0;simState.reacted=false;simState.addedHCl=false;
        document.getElementById('at2-hcl').classList.remove('active');
        document.getElementById('at2-status').textContent='ابدأ بإضافة HCl أولاً';
        document.getElementById('at2-status').style.color='';
      ">🔄 إعادة</button>
    </div>
    <div id="at2-status" class="info-box" style="min-height:32px;font-size:13px;text-align:center;margin-top:4px">
      ابدأ بإضافة HCl أولاً
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا يُضاف HCl أولاً؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">CO₃²⁻ تُرسِّب أيضاً مع Ba²⁺ → BaCO₃ أبيض. بإضافة HCl: CO₃²⁻ + 2H⁺ → H₂O + CO₂↑. أما BaSO₄ فلا يذوب في HCl — هذا هو مفتاح التمييز!</div>
    </div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9aniontest'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F5F5F5'); bg.addColorStop(1,'#EEEEEE');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    _lbl(c,'اختبار كلوريد الباريوم BaCl₂',w/2,h*0.055,'#37474F',Math.max(13,w*0.025));

    // Step indicators
    ['إضافة HCl','إضافة BaCl₂','الراسب'].forEach((step,i)=>{
      const sx=w*(0.20+i*0.30), sy=h*0.10;
      const done=(i===0&&S.addedHCl)||(i===1&&S.reacted)||(i===2&&S.reacted);
      c.fillStyle=done?'#27AE60':'rgba(0,0,0,0.15)';
      c.beginPath(); c.arc(sx,sy,10,0,Math.PI*2); c.fill();
      c.fillStyle='#fff'; c.font=`bold ${Math.max(9,w*0.018)}px Tajawal`;
      c.textAlign='center'; c.textBaseline='middle';
      c.fillText(done?'✓':(i+1),sx,sy);
      _lbl(c,step,sx,sy+18,done?'#27AE60':'#888',Math.max(8,w*0.013));
      if(i<2){
        c.strokeStyle=done?'rgba(39,174,96,0.4)':'rgba(0,0,0,0.15)'; c.lineWidth=1.5; c.setLineDash([3,3]);
        c.beginPath(); c.moveTo(sx+11,sy); c.lineTo(sx+w*0.30-11,sy); c.stroke(); c.setLineDash([]);
      }
    });

    // Main beaker
    const bx=w*0.26, by=h*0.16, bw3=w*0.48, bh3=h*0.44;
    _drawBeakerU9(c,bx,by,bw3,bh3,'#87CEEB',0.18);
    _lbl(c,'محلول SO₄²⁻',bx+bw3/2,by+bh3+18,'#37474F',Math.max(10,w*0.018));

    // HCl layer
    if(S.addedHCl){
      c.fillStyle='rgba(231,76,60,0.07)'; c.fillRect(bx+2,by,bw3-4,bh3*0.2);
      _lbl(c,'HCl ✓',bx+bw3/2,by+bh3*0.1,'#C0392B',Math.max(9,w*0.016));
      // Bubbles from CO₃²⁻ reacting
      for(let b=0;b<5;b++){
        const bba=((S.t*0.02+b*0.2)%1);
        const bbx=bx+bw3*0.2+b*bw3*0.15;
        const bby=by+bh3*(0.8-bba*0.6);
        c.fillStyle=`rgba(231,76,60,${(1-bba)*0.3})`;
        c.beginPath(); c.arc(bbx,bby,2+b,0,Math.PI*2); c.fill();
      }
    }

    // BaSO₄ precipitate
    if(S.reacted){
      const pH=bh3*0.30;
      c.fillStyle='rgba(210,210,210,0.92)'; c.fillRect(bx+2,by+bh3-pH,bw3-4,pH);
      // Precipitate texture
      for(let p=0;p<25;p++){
        const px=bx+5+(p*41+S.t*0.2)%(bw3-10);
        const py=by+bh3-pH+3+(p*23)%pH;
        c.fillStyle='rgba(170,170,170,0.7)'; c.beginPath(); c.arc(px,py,1.5+Math.sin(p)*1,0,Math.PI*2); c.fill();
      }
    }

    if(S.reacted){
      const ry=h*0.70, rh=h*0.21;
      c.fillStyle='rgba(55,71,79,0.07)'; c.beginPath(); c.roundRect(w*0.04,ry,w*0.92,rh,10); c.fill();
      _lbl(c,'✅ راسب أبيض لا يذوب في HCl → SO₄²⁻ موجود!',w/2,ry+rh*0.30,'#27AE60',Math.max(11,w*0.020));
      c.fillStyle='#555'; c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('Ba²⁺ + SO₄²⁻ → BaSO₄↓ (أبيض لا يذوب)',w/2,ry+rh*0.72);
    } else if(!S.addedHCl){
      _lbl(c,'ابدأ بإضافة HCl أولاً 👆',w/2,h*0.72,'#888',Math.max(11,w*0.020));
    } else {
      _lbl(c,'الآن أضِف BaCl₂ 👆',w/2,h*0.72,'#1A8FA8',Math.max(11,w*0.020));
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ 9-4 Tab 3: CO₃²⁻ و NO₃⁻ (محسّنة مع ورقة تبّاع الشمس) ══
function simG9AnionTest3(){
  cancelAnimationFrame(animFrame);
  simState={t:0, gas:0, testing:false, progress:0};
  const S=simState;
  const anions=[
    {ion:'CO₃²⁻', col:'#6B4E9A', bgCol:'#F3E5F5',
     test:'إضافة حمض HCl → CO₂ يُعكِّر ماء الجير',
     eq:'CO₃²⁻ + 2H⁺ → H₂O + CO₂↑',
     eq2:'Ca(OH)₂ + CO₂ → CaCO₃↓ (ماء الجير يعكر)',
     result:'فوران + راسب أبيض في ماء الجير'},
    {ion:'NO₃⁻',  col:'#C0392B', bgCol:'#FFF3E0',
     test:'NaOH + ألومنيوم → NH₃↑',
     eq:'3NO₃⁻ + 8Al + 5OH⁻ + 2H₂O → 3NH₃↑ + 8AlO₂⁻',
     eq2:'NH₃ يُحوِّل ورقة تبّاع الشمس الحمراء → زرقاء',
     result:'رائحة نفّاذة + ورقة تبّاع الشمس تتحوّل للأزرق'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌬️ اختر الأنيون للاختبار</div>
      <div class="ctrl-btns-grid">
        ${anions.map((a,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="at3-${i}" 
          style="border-right:4px solid ${a.col}66"
          onclick="simState.gas=${i};simState.testing=false;simState.progress=0;
          document.querySelectorAll('[id^=at3-]').forEach((b,j)=>b.classList.toggle('active',j===${i}));
          document.getElementById('at3-desc').textContent='${a.test}'">
          ${a.ion}</button>`).join('')}
      </div>
    </div>
    <div id="at3-desc" class="info-box" style="font-size:12px;text-align:center;margin:6px 0">${anions[0].test}</div>
    <div class="ctrl-section">
      <button class="ctrl-btn action" onclick="simState.testing=true;simState.progress=0">🧪 أجرِ الاختبار</button>
      <button class="ctrl-btn" style="margin-top:6px" onclick="simState.testing=false;simState.progress=0">🔄 إعادة</button>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا يُضاف الألومنيوم في اختبار NO₃⁻؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الألومنيوم عامل اختزال قويّ يختزل NO₃⁻ إلى NH₃ في الوسط القلوي. الغاز الناتج يُكشَف برائحته وتأثيره على ورقة تبّاع الشمس الحمراء (تتحوّل للأزرق).</div>
    </div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9aniontest'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    if(S.testing && S.progress<100) S.progress+=0.8;
    const anion=anions[S.gas||0];
    const prog=S.progress/100;

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,anion.bgCol); bg.addColorStop(1,'#ffffff');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    _lbl(c,`اختبار ${anion.ion}`,w/2,h*0.055,anion.col,Math.max(13,w*0.025));

    // Main beaker
    const bx=w*0.26, by=h*0.12, bw4=w*0.48, bh4=h*0.44;
    _drawBeakerU9(c,bx,by,bw4,bh4,'#87CEEB',0.2);
    _lbl(c,`محلول ${anion.ion}`,bx+bw4/2,by+bh4+18,anion.col,Math.max(10,w*0.018));

    if(S.testing){
      if(S.gas===0){
        // CO₃²⁻ — Bubbles (CO₂ gas)
        for(let b=0;b<15;b++){
          const age=((S.t*0.025+b/15)%1);
          const bx2=bx+bw4*0.15+b*(bw4*0.7/14);
          const by2=by+bh4*(1-age);
          const size=2+age*4;
          const alpha=(1-age)*0.6*Math.min(prog*3,1);
          c.fillStyle=`rgba(150,100,200,${alpha})`;
          c.beginPath(); c.arc(bx2,by2,size,0,Math.PI*2); c.fill();
        }
        // Limewater beaker
        if(prog>0.25){
          const lbx=w*0.78, lby=by+h*0.04, lbw=w*0.18, lbh=h*0.30;
          const turbidity=Math.min((prog-0.25)/0.5,1);
          _drawBeakerU9(c,lbx,lby,lbw,lbh,'rgba(180,180,180,'+turbidity*0.7+')',0.25);
          c.strokeStyle='#90A4AE'; c.lineWidth=1.5;
          c.strokeRect(lbx,lby,lbw,lbh);
          _lbl(c,'ماء الجير',lbx+lbw/2,lby+lbh+16,'#6B4E9A',Math.max(8,w*0.014));
          if(turbidity>0.3) _lbl(c,'عكر ⚪',lbx+lbw/2,lby+lbh*0.5,'#7B1FA2',Math.max(8,w*0.015));

          // CO₂ pipe
          c.strokeStyle=anion.col+'66'; c.lineWidth=2;
          c.beginPath(); c.moveTo(bx+bw4/2,by); c.bezierCurveTo(bx+bw4/2,by-h*0.06,lbx+lbw/2,lby-h*0.06,lbx+lbw/2,lby); c.stroke();
          _lbl(c,'CO₂↑',bx+bw4/2+w*0.08,by-h*0.04,anion.col,Math.max(9,w*0.016));
        }
      } else {
        // NO₃⁻ — NH₃ gas
        for(let g=0;g<12;g++){
          const age=((S.t*0.018+g/12)%1);
          const gx=bx+bw4*0.2+g*(bw4*0.6/11);
          const gy=by-age*h*0.28;
          const gsz=2+age*5;
          c.fillStyle=`rgba(192,57,43,${(1-age)*0.5*Math.min(prog*3,1)})`;
          c.beginPath(); c.arc(gx,gy,gsz,0,Math.PI*2); c.fill();
        }

        // Litmus paper with color transition
        const lbx=w*0.76, lby=by-h*0.02, lbw=w*0.20, lbh=h*0.32;
        const rr=192, rg_=57, rb=43, br_=26, bg_=143, bb=168;
        const mr=Math.round(rr*(1-prog)+br_*prog);
        const mg=Math.round(rg_*(1-prog)+bg_*prog);
        const mb=Math.round(rb*(1-prog)+bb*prog);
        // Paper gradient (red to blue)
        const paperGrad=c.createLinearGradient(lbx,lby,lbx,lby+lbh);
        paperGrad.addColorStop(0,`rgb(${mr},${mg},${mb})`);
        paperGrad.addColorStop(1,`rgb(${Math.max(mr-20,0)},${Math.max(mg-20,0)},${Math.max(mb-20,0)})`);
        c.fillStyle=paperGrad; c.beginPath(); c.roundRect(lbx,lby,lbw,lbh,4); c.fill();
        c.strokeStyle='rgba(0,0,0,0.2)'; c.lineWidth=1.5;
        c.beginPath(); c.roundRect(lbx,lby,lbw,lbh,4); c.stroke();

        // Label on paper
        c.fillStyle='rgba(255,255,255,0.7)'; c.font=`bold ${Math.max(8,w*0.015)}px Tajawal`;
        c.textAlign='center'; c.textBaseline='middle';
        c.fillText('ورقة تبّاع',lbx+lbw/2,lby+lbh*0.4);
        c.fillText('الشمس',lbx+lbw/2,lby+lbh*0.6);

        if(prog>0.4){
          _lbl(c,prog>0.7?'أزرق! ✅':'يتحوّل...',lbx+lbw/2,lby+lbh+16,`rgb(${mr},${mg},${mb})`,Math.max(9,w*0.016));
        }

        // NH₃ arrow
        _lbl(c,'NH₃↑',bx+bw4/2+w*0.06,by-h*0.05,anion.col,Math.max(9,w*0.016));
      }
    }

    // Result box
    if(S.progress>50){
      const ry=h*0.66, rh=h*0.24;
      c.fillStyle=anion.col+'0D'; c.beginPath(); c.roundRect(w*0.04,ry,w*0.92,rh,10); c.fill();
      c.strokeStyle=anion.col+'22'; c.lineWidth=1.5;
      c.beginPath(); c.roundRect(w*0.04,ry,w*0.92,rh,10); c.stroke();
      _lbl(c,'✅ '+anion.result,w/2,ry+rh*0.23,anion.col,Math.max(10,w*0.019));
      c.fillStyle='#555'; c.font=`${Math.max(8,w*0.014)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText(anion.eq,w/2,ry+rh*0.56);
      c.fillText(anion.eq2,w/2,ry+rh*0.82);
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 🔬 9-5 مختبر التحليل المتكامل — نسخة تفاعلية محسّنة
// ══════════════════════════════════════════════════════════════

// ══ 9-5 Tab 1: تحديد الكاتيون (لعبة تحديات) ══
window._lab1Mysteries=[
  {cation:'Fe³⁺', flameDesc:'برتقالي',    naohDesc:'بني محمر',    col:'#8B2500', flameCol:'#FFA000'},
  {cation:'Cu²⁺', flameDesc:'أخضر-أزرق', naohDesc:'أزرق فاتح',   col:'#0288D1', flameCol:'#00897B'},
  {cation:'Na⁺',  flameDesc:'أصفر',       naohDesc:'لا راسب',     col:'#FDD835', flameCol:'#FDD835'},
  {cation:'Fe²⁺', flameDesc:'برتقالي',    naohDesc:'أخضر فاتح',   col:'#388E3C', flameCol:'#FFA000'},
  {cation:'K⁺',   flameDesc:'أرجواني',    naohDesc:'لا راسب',     col:'#AB47BC', flameCol:'#AB47BC'},
  {cation:'Ca²⁺', flameDesc:'أحمر آجوري', naohDesc:'أبيض، يبقى', col:'#BDBDBD', flameCol:'#EF5350'},
];
function simG9ChemLab1(){
  cancelAnimationFrame(animFrame);
  const mysteries=window._lab1Mysteries;
  const cOpts=['Fe³⁺','Cu²⁺','Na⁺','Fe²⁺','K⁺','Ca²⁺'];
  let qi=Math.floor(Math.random()*mysteries.length);
  simState={t:0, qi, chosen:null, score:0, streak:0, total:0, test:'flame', hintsUsed:0, usedQs:[qi]};
  const S=simState;

  window.newQChemLab1=function(){
    if(S.usedQs.length >= mysteries.length) S.usedQs=[];
    let nqi; do{ nqi=Math.floor(Math.random()*mysteries.length); }while(S.usedQs.includes(nqi));
    S.usedQs.push(nqi);
    S.qi=nqi; S.chosen=null; S.test='flame'; S.hintsUsed=0;
    document.querySelectorAll('[id^=lab1btn-]').forEach(b=>b.classList.remove('correct','wrong'));
    document.getElementById('lab1-fb').innerHTML='';
    _updateLab1Clues();
  };
  window._lab1SetTest=function(t){
    S.test=t;
    document.querySelectorAll('[id^=lab1test-]').forEach(b=>b.classList.remove('active'));
    document.getElementById('lab1test-'+t).classList.add('active');
    _updateLab1Clues();
  };
  window._updateLab1Clues=function(){
    const m=mysteries[S.qi];
    const clues=S.test==='flame'
      ?`🔥 لون اللهب: <strong>${m.flameDesc}</strong>`
      :`🧪 مع NaOH: <strong>${m.naohDesc}</strong>`;
    document.getElementById('lab1-clue').innerHTML=clues;
  };
  window._lab1Answer=function(cat){
    if(S.chosen!==null) return;
    S.chosen=cat; S.total++;
    const correct=cat===mysteries[S.qi].cation;
    if(correct){ S.streak++; S.score+=10+(S.streak>1?S.streak:0); }
    else S.streak=0;
    document.getElementById('lab1-score').textContent=S.score;
    document.getElementById('lab1-streak').textContent=S.streak;
    document.querySelectorAll('[id^=lab1btn-]').forEach(b=>{
      if(b.dataset.cat===cat) b.classList.add(correct?'correct':'wrong');
      if(!correct && b.dataset.cat===mysteries[S.qi].cation) b.classList.add('correct');
    });
    document.getElementById('lab1-fb').innerHTML=correct
      ?`<span style="color:#27AE60">✅ ممتاز! ${mysteries[S.qi].cation} ${S.streak>2?'🔥 '+S.streak:''}!</span>`
      :`<span style="color:#C0392B">❌ الصحيح: <strong>${mysteries[S.qi].cation}</strong></span>`;
    setTimeout(()=>{ if(S.chosen!==null) window.newQChemLab1(); }, 1600);
  };

  const m=mysteries[qi];
  controls(`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">
      <div style="text-align:center;background:rgba(39,174,96,0.1);border:1px solid rgba(39,174,96,0.3);border-radius:8px;padding:6px">
        <div style="font-size:10px;color:var(--text-secondary)">النقاط</div>
        <div id="lab1-score" style="font-size:20px;font-weight:800;color:#27AE60">0</div>
      </div>
      <div style="text-align:center;background:rgba(212,144,26,0.1);border:1px solid rgba(212,144,26,0.3);border-radius:8px;padding:6px">
        <div style="font-size:10px;color:var(--text-secondary)">السلسلة 🔥</div>
        <div id="lab1-streak" style="font-size:20px;font-weight:800;color:#D4901A">0</div>
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🔍 اختر نوع الاختبار</div>
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn active" id="lab1test-flame" onclick="window._lab1SetTest('flame')">🔥 اللهب</button>
        <button class="ctrl-btn" id="lab1test-naoh" onclick="window._lab1SetTest('naoh')">🧪 NaOH</button>
      </div>
    </div>
    <div id="lab1-clue" class="info-box" style="font-size:13px;text-align:center;margin:6px 0">
      🔥 لون اللهب: <strong>${m.flameDesc}</strong>
    </div>
    <div class="ctrl-label">ما الكاتيون؟</div>
    <div class="ctrl-btns-grid-1">
      ${cOpts.map(cat=>`<button class="ctrl-btn" id="lab1btn-${cat.replace('+','p').replace('²','2').replace('³','3')}" data-cat="${cat}"
        style="border-right:4px solid ${(mysteries.find(m=>m.cation===cat)||{col:'#888'}).col}55"
        onclick="window._lab1Answer('${cat}')">${cat}</button>`).join('')}
    </div>
    <div id="lab1-fb" style="padding:8px;text-align:center;font-size:13px;font-weight:700;min-height:36px"></div>
    <button class="ctrl-btn action" style="margin-top:4px" onclick="window.newQChemLab1()">🎲 كاتيون جديد</button>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9chemlab'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const mystery=mysteries[S.qi||0];

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#0F1A24'); bg.addColorStop(1,'#1A2A3A');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    _lbl(c,'🔬 تحديد الكاتيون المجهول',w/2,h*0.055,'#9DC8E8',Math.max(13,w*0.025));

    if(S.test==='flame'){
      // Flame test visualization
      const fx=w/2, fy=h*0.58;
      const fCol=mystery.flameCol;
      // Glow
      const gl=c.createRadialGradient(fx,fy-h*0.12,0,fx,fy-h*0.12,h*0.30);
      gl.addColorStop(0,fCol+'40'); gl.addColorStop(1,'transparent');
      c.fillStyle=gl; c.fillRect(0,0,w,h);
      for(let l=0;l<8;l++){
        const fh=h*(0.28+0.04*Math.sin(S.t*0.11+l));
        const fw=w*(0.05+0.01*Math.sin(S.t*0.09+l));
        const grad=c.createRadialGradient(fx,fy,0,fx,fy-fh*0.5,fh);
        grad.addColorStop(0,'#FFF'); grad.addColorStop(0.2,'#FFFDE7');
        grad.addColorStop(0.45,fCol); grad.addColorStop(0.8,fCol+'55'); grad.addColorStop(1,'transparent');
        c.fillStyle=grad; c.beginPath(); c.ellipse(fx+(l-3.5)*w*0.02,fy-fh*0.38,fw,fh*0.45,0,0,Math.PI*2); c.fill();
      }
      c.fillStyle='#3A3A3A'; c.beginPath(); c.roundRect(fx-w*0.05,fy,w*0.10,h*0.16,5); c.fill();
      c.fillStyle='#2A2A2A'; c.beginPath(); c.roundRect(fx-w*0.08,fy+h*0.14,w*0.16,h*0.04,3); c.fill();
      _lbl(c,'موقد بنسن',fx,fy+h*0.22,'#666',Math.max(9,w*0.016));
      _lbl(c,'🔥 لون اللهب: '+mystery.flameDesc,w/2,h*0.15,fCol,Math.max(11,w*0.022));
    } else {
      // NaOH precipitation visualization
      const bx=w*0.27, by=h*0.14, bw=w*0.46, bh=h*0.44;
      const bg2=c.createLinearGradient(0,0,0,h);
      bg2.addColorStop(0,'#EDE7F6'); bg2.addColorStop(1,'#D1C4E9');
      // Partial background overlay
      c.fillStyle='rgba(237,229,246,0.3)'; c.fillRect(0,0,w,h);
      _drawBeakerU9(c,bx,by,bw,bh,'#87CEEB',0.15);
      const naohColor=mystery.naohDesc.includes('بني')?'#8B2500':
                      mystery.naohDesc.includes('أخضر')?'#388E3C':
                      mystery.naohDesc.includes('أزرق')?'#0288D1':
                      mystery.naohDesc.includes('أبيض')?'#BDBDBD':'transparent';
      if(naohColor!=='transparent'){
        const pH=bh*0.30;
        c.fillStyle=naohColor+'BB'; c.fillRect(bx+2,by+bh-pH,bw-4,pH);
        for(let p=0;p<18;p++){
          const px=bx+5+(p*37+S.t*0.3)%(bw-10);
          const py=by+bh-pH+3+(p*23)%pH;
          c.fillStyle=naohColor+'77'; c.beginPath(); c.arc(px,py,1.5+Math.sin(p)*1,0,Math.PI*2); c.fill();
        }
      }
      _lbl(c,'🧪 مع NaOH: '+mystery.naohDesc,w/2,h*0.12,'#4A148C',Math.max(11,w*0.020));
    }

    // Question mark or revealed
    if(!S.chosen){
      const pulse=1+0.06*Math.sin(S.t*0.07);
      c.save(); c.translate(w*0.88,h*0.18); c.scale(pulse,pulse);
      c.fillStyle='rgba(255,255,255,0.9)';
      c.font=`bold ${Math.max(24,w*0.055)}px Tajawal`;
      c.textAlign='center'; c.textBaseline='middle';
      c.fillText('؟',0,0); c.restore();
    } else {
      c.fillStyle=mystery.col;
      c.font=`bold ${Math.max(18,w*0.038)}px Tajawal`;
      c.textAlign='center'; c.textBaseline='middle';
      c.fillText(mystery.cation,w*0.88,h*0.18);
    }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ 9-5 Tab 2: تحديد الأنيون (مع خرائط مفاهيم) ══
window._lab2Mysteries=[
  {anion:'Cl⁻',   ag:'راسب أبيض (يذوب في NH₃)', ba:'لا راسب', hcl:'لا فوران'},
  {anion:'Br⁻',   ag:'راسب كريمي',               ba:'لا راسب', hcl:'لا فوران'},
  {anion:'SO₄²⁻', ag:'لا راسب مميز',              ba:'أبيض لا يذوب في HCl', hcl:'لا فوران'},
  {anion:'CO₃²⁻', ag:'لا راسب مع Ag⁺ مباشرة',    ba:'أبيض يذوب في HCl',   hcl:'فوران — CO₂↑'},
  {anion:'NO₃⁻',  ag:'لا راسب',                   ba:'لا راسب',             hcl:'لا فوران (اختبر بـ Al+NaOH)'},
];
function simG9ChemLab2(){
  cancelAnimationFrame(animFrame);
  const mysteries=window._lab2Mysteries;
  const aOpts=['Cl⁻','Br⁻','SO₄²⁻','CO₃²⁻','NO₃⁻'];
  let qi=Math.floor(Math.random()*mysteries.length);
  simState={t:0, qi, chosen:null, score:0, streak:0, total:0, usedQs:[qi]};
  const S=simState;

  window.newQChemLab2=function(){
    if(S.usedQs.length >= mysteries.length) S.usedQs=[];
    let nqi; do{ nqi=Math.floor(Math.random()*mysteries.length); }while(S.usedQs.includes(nqi));
    S.usedQs.push(nqi);
    S.qi=nqi; S.chosen=null;
    document.querySelectorAll('[id^=lab2btn-]').forEach(b=>b.classList.remove('correct','wrong'));
    document.getElementById('lab2-fb').innerHTML='';
    _updateLab2();
  };
  window._updateLab2=function(){
    const m=mysteries[S.qi];
    document.getElementById('lab2-clues').innerHTML=`
      🥈 AgNO₃: <strong>${m.ag}</strong><br>
      ⚪ BaCl₂: <strong>${m.ba}</strong><br>
      🫧 مع HCl: <strong>${m.hcl}</strong>`;
  };
  window._lab2Answer=function(anion){
    if(S.chosen!==null) return;
    S.chosen=anion; S.total++;
    const correct=anion===mysteries[S.qi].anion;
    if(correct){ S.streak++; S.score+=10+(S.streak>1?S.streak:0); }
    else S.streak=0;
    document.getElementById('lab2-score').textContent=S.score;
    document.getElementById('lab2-streak').textContent=S.streak;
    document.querySelectorAll('[id^=lab2btn-]').forEach(b=>{
      if(b.dataset.anion===anion) b.classList.add(correct?'correct':'wrong');
      if(!correct && b.dataset.anion===mysteries[S.qi].anion) b.classList.add('correct');
    });
    document.getElementById('lab2-fb').innerHTML=correct
      ?`<span style="color:#27AE60">✅ ممتاز! ${S.streak>2?'سلسلة '+S.streak+' 🔥':''}</span>`
      :`<span style="color:#C0392B">❌ الصحيح: <strong>${mysteries[S.qi].anion}</strong></span>`;
    setTimeout(()=>{ if(S.chosen!==null) window.newQChemLab2(); }, 1600);
  };

  controls(`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">
      <div style="text-align:center;background:rgba(39,174,96,0.1);border:1px solid rgba(39,174,96,0.3);border-radius:8px;padding:6px">
        <div style="font-size:10px;color:var(--text-secondary)">النقاط</div>
        <div id="lab2-score" style="font-size:20px;font-weight:800;color:#27AE60">0</div>
      </div>
      <div style="text-align:center;background:rgba(212,144,26,0.1);border:1px solid rgba(212,144,26,0.3);border-radius:8px;padding:6px">
        <div style="font-size:10px;color:var(--text-secondary)">السلسلة 🔥</div>
        <div id="lab2-streak" style="font-size:20px;font-weight:800;color:#D4901A">0</div>
      </div>
    </div>
    <div id="lab2-clues" class="info-box" style="font-size:12px;line-height:2;margin-bottom:8px">
      🥈 AgNO₃: <strong>${mysteries[qi].ag}</strong><br>
      ⚪ BaCl₂: <strong>${mysteries[qi].ba}</strong><br>
      🫧 مع HCl: <strong>${mysteries[qi].hcl}</strong>
    </div>
    <div class="ctrl-label">ما الأنيون المجهول؟</div>
    <div class="ctrl-btns-grid-1">
      ${aOpts.map(a=>`<button class="ctrl-btn" id="lab2btn-${a.replace('⁻','n').replace('²','2')}" data-anion="${a}"
        onclick="window._lab2Answer('${a}')">${a}</button>`).join('')}
    </div>
    <div id="lab2-fb" style="padding:8px;text-align:center;font-size:13px;font-weight:700;min-height:36px"></div>
    <button class="ctrl-btn action" style="margin-top:4px" onclick="window.newQChemLab2()">🎲 أنيون جديد</button>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9chemlab'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const m=mysteries[S.qi||0];

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#0F2027'); bg.addColorStop(1,'#203A43');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    _lbl(c,'🔬 حدِّد الأنيون المجهول',w/2,h*0.055,'#9DC8E8',Math.max(13,w*0.025));

    const tests=[
      {label:'AgNO₃ 🥈', val:m.ag,  col:'#FDD835', x:0.17},
      {label:'BaCl₂ ⚪',  val:m.ba,  col:'#90A4AE', x:0.50},
      {label:'HCl 🫧',    val:m.hcl, col:'#E74C3C', x:0.83},
    ];
    const bw5=w*0.27, bh5=h*0.34, by5=h*0.12;

    tests.forEach(t=>{
      const bx5=t.x*w-bw5/2;
      // Beaker
      _drawBeakerU9(c,bx5,by5,bw5,bh5,'#87CEEB',0.12);
      _lbl(c,t.label,t.x*w,by5-10,t.col,Math.max(9,w*0.017));

      // Result panel in beaker
      c.fillStyle='rgba(255,255,255,0.06)'; c.beginPath();
      c.roundRect(bx5+3,by5+bh5*0.5,bw5-6,bh5*0.46,4); c.fill();

      // Result text (word wrap)
      c.fillStyle='#CCC'; c.font=`${Math.max(7,w*0.013)}px Tajawal`;
      c.textAlign='center'; c.textBaseline='middle';
      const words=t.val.split(' ');
      let line='', lines=[], maxW=bw5*0.85;
      words.forEach(word=>{
        const test2=line?line+' '+word:word;
        if(c.measureText(test2).width>maxW&&line){ lines.push(line); line=word; }
        else line=test2;
      });
      lines.push(line);
      const startY=by5+bh5*0.68;
      lines.forEach((ln,li)=>c.fillText(ln,t.x*w,startY+li*(Math.max(7,w*0.013)*1.4)));

      // Reaction indicator
      const hasReaction=t.val!=='لا راسب'&&t.val!=='لا راسب مع Ag⁺ مباشرة'&&t.val!=='لا راسب مميز'&&t.val!=='لا فوران'&&t.val!=='لا فوران (اختبر بـ Al+NaOH)';
      if(hasReaction){
        c.fillStyle=t.col+'33'; c.fillRect(bx5+2,by5+bh5*0.5,bw5-4,6);
        c.fillStyle=t.col; c.fillRect(bx5+2,by5+bh5*0.5,bw5-4,6);
      }
    });

    // Answer section
    if(S.chosen){
      const correct=S.chosen===m.anion;
      c.fillStyle=correct?'rgba(39,174,96,0.15)':'rgba(192,57,43,0.12)';
      c.beginPath(); c.roundRect(w*0.1,h*0.58,w*0.80,h*0.12,10); c.fill();
      c.strokeStyle=correct?'#27AE60':'#C0392B'; c.lineWidth=2;
      c.beginPath(); c.roundRect(w*0.1,h*0.58,w*0.80,h*0.12,10); c.stroke();
      _lbl(c,`إجابتك: ${S.chosen} ${correct?'✅':'❌'}`,w/2,h*0.645,correct?'#27AE60':'#C0392B',Math.max(12,w*0.023));
    } else {
      // Mystery unknown
      const pulse=1+0.05*Math.sin(S.t*0.07);
      c.save(); c.translate(w/2,h*0.645); c.scale(pulse,pulse);
      c.fillStyle='rgba(255,255,255,0.85)';
      c.font=`bold ${Math.max(20,w*0.04)}px Tajawal`;
      c.textAlign='center'; c.textBaseline='middle';
      c.fillText('الأنيون المجهول = ؟',0,0); c.restore();
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ 9-5 Tab 3: مادة مجهولة كاملة (لعبة المحقق) ══
function simG9ChemLab3(){
  cancelAnimationFrame(animFrame);
  const salts=[
    {salt:'FeCl₃',  cation:'Fe³⁺', anion:'Cl⁻',   flameDesc:'برتقالي', naohDesc:'بني محمر', agDesc:'أبيض', baDesc:'لا راسب', fc:'#FFA000', nc:'#8B2500'},
    {salt:'CuSO₄',  cation:'Cu²⁺', anion:'SO₄²⁻', flameDesc:'أخضر-أزرق', naohDesc:'أزرق فاتح', agDesc:'لا راسب', baDesc:'أبيض (BaSO₄)', fc:'#00897B', nc:'#1A8FA8'},
    {salt:'NaCl',   cation:'Na⁺',  anion:'Cl⁻',   flameDesc:'أصفر', naohDesc:'لا راسب', agDesc:'أبيض', baDesc:'لا راسب', fc:'#FDD835', nc:'#87CEEB'},
    {salt:'FeSO₄',  cation:'Fe²⁺', anion:'SO₄²⁻', flameDesc:'برتقالي', naohDesc:'أخضر فاتح', agDesc:'لا راسب', baDesc:'أبيض (BaSO₄)', fc:'#FFA000', nc:'#388E3C'},
    {salt:'Na₂CO₃', cation:'Na⁺',  anion:'CO₃²⁻', flameDesc:'أصفر', naohDesc:'لا راسب', agDesc:'لا راسب', baDesc:'أبيض يذوب في HCl', fc:'#FDD835', nc:'#87CEEB'},
  ];
  const cOpts=['Na⁺','K⁺','Cu²⁺','Fe²⁺','Fe³⁺','Ca²⁺'];
  const aOpts=['Cl⁻','SO₄²⁻','CO₃²⁻','NO₃⁻'];
  let qi=Math.floor(Math.random()*salts.length);
  simState={t:0, qi, guessC:null, guessA:null, done:false, score:0, streak:0, total:0, revealedTests:{}, usedQs:[qi]};
  const S=simState;

  window.newQChemLab3=function(){
    if(S.usedQs.length >= salts.length) S.usedQs=[];
    let nqi; do{ nqi=Math.floor(Math.random()*salts.length); }while(S.usedQs.includes(nqi));
    S.usedQs.push(nqi);
    S.qi=nqi; S.guessC=null; S.guessA=null; S.done=false; S.revealedTests={};
    document.querySelectorAll('[id^=lab3c-],[id^=lab3a-]').forEach(b=>b.classList.remove('active','correct','wrong'));
    document.getElementById('lab3-fb').innerHTML='';
    _updateLab3Tests();
  };
  window._updateLab3Tests=function(){
    const m=salts[S.qi];
    ['flame','naoh','ag','ba'].forEach(test=>{
      const el=document.getElementById('lab3-'+test);
      if(el) el.textContent=S.revealedTests[test]?({
        flame:'🔥 اللهب: '+m.flameDesc,naoh:'🧪 NaOH: '+m.naohDesc,
        ag:'🥈 AgNO₃: '+m.agDesc,ba:'⚪ BaCl₂: '+m.baDesc
      }[test]):'اضغط للكشف';
    });
  };
  window._lab3RevealTest=function(test){
    S.revealedTests[test]=true;
    window._updateLab3Tests();
    document.getElementById('lab3-'+test).style.opacity='1';
    document.getElementById('lab3-'+test).style.color='var(--text-primary)';
  };
  window._lab3SelectCation=function(cat){
    S.guessC=cat;
    document.querySelectorAll('[id^=lab3c-]').forEach(b=>b.classList.remove('active'));
    document.getElementById('lab3c-'+cat.replace('+','p').replace('²','2').replace('³','3')).classList.add('active');
  };
  window._lab3SelectAnion=function(a){
    S.guessA=a;
    document.querySelectorAll('[id^=lab3a-]').forEach(b=>b.classList.remove('active'));
    document.getElementById('lab3a-'+a.replace('⁻','n').replace('²','2')).classList.add('active');
  };
  window._lab3Check=function(){
    if(!S.guessC||!S.guessA){
      document.getElementById('lab3-fb').innerHTML='<span style="color:#D4901A">⚠️ اختر الكاتيون والأنيون أولاً</span>';
      return;
    }
    S.done=true; S.total++;
    const m=salts[S.qi];
    const ok=S.guessC===m.cation&&S.guessA===m.anion;
    if(ok){ S.streak++; S.score+=15+(S.streak>1?S.streak*2:0); }
    else S.streak=0;
    document.getElementById('lab3-score').textContent=S.score;
    document.getElementById('lab3-streak').textContent=S.streak;
    document.getElementById('lab3-fb').innerHTML=ok
      ?`<span style="color:#27AE60">🏆 ممتاز! المادة: <strong>${m.salt}</strong> ${S.streak>2?'🔥 سلسلة '+S.streak:''}!</span>`
      :`<span style="color:#C0392B">❌ الجواب: ${m.cation} + ${m.anion} = <strong>${m.salt}</strong></span>`;
    setTimeout(()=>{ if(S.done) window.newQChemLab3(); }, 2000);
  };

  const m=salts[qi];
  controls(`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">
      <div style="text-align:center;background:rgba(39,174,96,0.1);border:1px solid rgba(39,174,96,0.3);border-radius:8px;padding:6px">
        <div style="font-size:10px;color:var(--text-secondary)">النقاط</div>
        <div id="lab3-score" style="font-size:20px;font-weight:800;color:#27AE60">0</div>
      </div>
      <div style="text-align:center;background:rgba(212,144,26,0.1);border:1px solid rgba(212,144,26,0.3);border-radius:8px;padding:6px">
        <div style="font-size:10px;color:var(--text-secondary)">السلسلة 🔥</div>
        <div id="lab3-streak" style="font-size:20px;font-weight:800;color:#D4901A">0</div>
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🕵️ اكشف الاختبارات (اضغط للكشف)</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:6px">
        <button class="ctrl-btn" id="lab3-flame" onclick="window._lab3RevealTest('flame')" style="font-size:11px;opacity:0.6">🔥 اللهب</button>
        <button class="ctrl-btn" id="lab3-naoh"  onclick="window._lab3RevealTest('naoh')"  style="font-size:11px;opacity:0.6">🧪 NaOH</button>
        <button class="ctrl-btn" id="lab3-ag"    onclick="window._lab3RevealTest('ag')"    style="font-size:11px;opacity:0.6">🥈 AgNO₃</button>
        <button class="ctrl-btn" id="lab3-ba"    onclick="window._lab3RevealTest('ba')"    style="font-size:11px;opacity:0.6">⚪ BaCl₂</button>
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">الكاتيون:</div>
      <div class="ctrl-btns-grid">
        ${cOpts.map(cat=>`<button class="ctrl-btn" id="lab3c-${cat.replace('+','p').replace('²','2').replace('³','3')}" 
          onclick="window._lab3SelectCation('${cat}')">${cat}</button>`).join('')}
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">الأنيون:</div>
      <div class="ctrl-btns-grid">
        ${aOpts.map(a=>`<button class="ctrl-btn" id="lab3a-${a.replace('⁻','n').replace('²','2')}" 
          onclick="window._lab3SelectAnion('${a}')">${a}</button>`).join('')}
      </div>
    </div>
    <button class="ctrl-btn action" onclick="window._lab3Check()">🔬 تحقَّق من الإجابة</button>
    <div id="lab3-fb" style="padding:8px;text-align:center;font-size:13px;font-weight:700;min-height:36px"></div>
    <button class="ctrl-btn" style="margin-top:4px" onclick="window.newQChemLab3()">🎲 مادة جديدة</button>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9chemlab'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const salt=salts[S.qi||0];

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#1A2A3A'); bg.addColorStop(1,'#0A1520');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    _lbl(c,'🏆 مختبر التحليل الكيميائي الكامل',w/2,h*0.055,'#FFD700',Math.max(12,w*0.022));

    const cx=w/2, cy=h*0.46;
    const cr=Math.min(w,h)*0.11;
    const nr=Math.min(w,h)*0.08;
    const r=Math.min(w,h)*0.27;

    const tests2=[
      {key:'flame', label:'اللهب 🔥', val:salt.flameDesc, col:salt.fc, ang:-Math.PI/2},
      {key:'naoh',  label:'NaOH 🧪',  val:salt.naohDesc,  col:salt.nc, ang:0},
      {key:'ag',    label:'AgNO₃ 🥈', val:salt.agDesc,    col:'#FDD835', ang:Math.PI/2},
      {key:'ba',    label:'BaCl₂ ⚪',  val:salt.baDesc,    col:'#90A4AE', ang:Math.PI},
    ];

    tests2.forEach(t=>{
      t.tx=Math.max(nr+5,Math.min(w-nr-5,cx+r*Math.cos(t.ang)));
      t.ty=Math.max(nr+25,Math.min(h-nr-5,cy+r*Math.sin(t.ang)));
    });

    // Connecting lines
    tests2.forEach(t=>{
      const revealed=S.revealedTests[t.key];
      c.strokeStyle=revealed?t.col+'66':t.col+'22'; c.lineWidth=revealed?2:1.5;
      if(revealed) c.setLineDash([]);
      else c.setLineDash([5,5]);
      c.beginPath(); c.moveTo(cx,cy); c.lineTo(t.tx,t.ty); c.stroke();
      c.setLineDash([]);
    });

    // Central mystery circle
    const centerPulse=S.done?1:1+0.04*Math.sin(S.t*0.06);
    c.save(); c.translate(cx,cy); c.scale(centerPulse,centerPulse);
    c.fillStyle='rgba(255,215,0,0.12)'; c.beginPath(); c.arc(0,0,cr,0,Math.PI*2); c.fill();
    c.strokeStyle=S.done?'#27AE60':'#FFD700BB'; c.lineWidth=2.5;
    c.beginPath(); c.arc(0,0,cr,0,Math.PI*2); c.stroke();
    c.fillStyle=S.done?'#27AE60':'#FFD700';
    c.font=`bold ${Math.max(13,Math.min(w*0.030,20))}px Tajawal`;
    c.textAlign='center'; c.textBaseline='middle';
    c.fillText(S.done?salt.salt:'مجهول',0,0);
    c.restore();

    // Test nodes
    const fs1=Math.max(9,Math.min(w*0.015,13));
    const fs2=Math.max(7,Math.min(w*0.013,11));
    tests2.forEach(t=>{
      const revealed=S.revealedTests[t.key];
      c.fillStyle=revealed?t.col+'2A':t.col+'0F';
      c.beginPath(); c.arc(t.tx,t.ty,nr,0,Math.PI*2); c.fill();
      c.strokeStyle=revealed?t.col+'99':t.col+'33'; c.lineWidth=revealed?2:1.5;
      c.beginPath(); c.arc(t.tx,t.ty,nr,0,Math.PI*2); c.stroke();
      c.fillStyle=revealed?t.col:'#666';
      c.font=`bold ${fs1}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(t.label,t.tx,t.ty-fs1*0.8);
      c.fillStyle=revealed?'#DDD':'#444';
      c.font=`${fs2}px Tajawal`;
      const words=t.val.split(' ');
      let line='',lines=[],maxW2=nr*1.7;
      words.forEach(word=>{ const test3=line?line+' '+word:word; if(c.measureText(test3).width>maxW2&&line){lines.push(line);line=word;}else line=test3; });
      lines.push(line);
      const startY2=t.ty+fs2*0.5;
      lines.forEach((ln,li)=>c.fillText(revealed?ln:'؟',t.tx,startY2+li*fs2*1.35));
    });

    // Guess display
    if(S.guessC||S.guessA){
      const gy=h*0.87;
      c.fillStyle=S.done?'rgba(39,174,96,0.12)':'rgba(255,215,0,0.08)';
      c.beginPath(); c.roundRect(w*0.08,gy-h*0.045,w*0.84,h*0.085,10); c.fill();
      c.strokeStyle=S.done?'rgba(39,174,96,0.3)':'rgba(255,215,0,0.2)'; c.lineWidth=1.5;
      c.beginPath(); c.roundRect(w*0.08,gy-h*0.045,w*0.84,h*0.085,10); c.stroke();
      c.fillStyle=S.done?'#27AE60':'#FFD700';
      c.font=`bold ${Math.max(11,fs1)}px Tajawal`;
      c.textAlign='center'; c.textBaseline='middle';
      c.fillText('تخمينك: '+(S.guessC||'؟')+' + '+(S.guessA||'؟'),w/2,gy);
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════════════════
// الوحدة العاشرة — الأرض والغلاف الجوّي  (نسخة محسّنة تفاعلياً)
// ══════════════════════════════════════════════════════════════════════

// ══ 10-1 Tab 1: طبقات الغلاف الجوّي التفاعلية ══

// ══ 10-1 Tab 1: طبقات الغلاف الجوّي التفاعلية ══
function simG9AirComp1(){
  cancelAnimationFrame(animFrame);
  const layers=[
    {name:'الغلاف الخارجي',  alt:'500–10000 كم', temp:'-∞ إلى 2000°C', col:'#0A0520', feat:'تتلاشى الجزيئات تدريجياً في الفضاء'},
    {name:'الغلاف المتأيّن', alt:'80–500 كم',    temp:'-90°C إلى 1500°C',col:'#1A0A4A',feat:'يعكس موجات الراديو — GPS والاتصالات'},
    {name:'الميزوسفير',      alt:'50–80 كم',     temp:'-90°C أبرد نقطة',col:'#0D2B6B',feat:'حيث تحترق معظم النيازك والشهب'},
    {name:'الستراتوسفير',    alt:'12–50 كم',     temp:'-60°C إلى 0°C', col:'#1A4A8A',feat:'طبقة الأوزون — تحجب الأشعة فوق البنفسجية'},
    {name:'التروبوسفير',     alt:'0–12 كم',      temp:'+15°C إلى -60°C',col:'#1E6BA8',feat:'الطقس والمطر والغيوم — نعيش هنا!'},
  ];
  simState={t:0, sel:-1, probe:1.0, probeAnim:false};
  const S=simState;
  window._layerSel=function(i){
    S.sel=(S.sel===i)?-1:i;
    document.querySelectorAll('[id^="lay-btn-"]').forEach((b,j)=>b.classList.toggle('active',j===S.sel));
    const info=document.getElementById('lay-info');
    if(S.sel>=0){
      const l=layers[S.sel];
      info.innerHTML=`<strong style="color:#5BC8F5">${l.name}</strong><br>الارتفاع: ${l.alt} | الحرارة: ${l.temp}<br>📌 ${l.feat}`;
    } else { info.innerHTML='انقر على طبقة لمعرفة تفاصيلها'; }
  };
  window._launchProbe=function(){
    S.probe=1.0; S.probeAnim=true;
    document.getElementById('probe-btn').disabled=true;
  };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌍 طبقات الغلاف الجوّي — انقر لاستكشاف</div>
      <div class="ctrl-btns-grid">
        ${layers.map((l,i)=>`<button class="ctrl-btn" id="lay-btn-${i}" onclick="window._layerSel(${i})" style="border-right:4px solid ${l.col.replace('#0A0520','#8B5CF6').replace('#1A0A4A','#6D28D9').replace('#0D2B6B','#2563EB').replace('#1A4A8A','#0EA5E9').replace('#1E6BA8','#38BDF8')};font-size:11px">${l.name}</button>`).join('')}
      </div>
    </div>
    <div id="lay-info" class="info-box" style="font-size:12px;min-height:52px;text-align:center">انقر على طبقة لمعرفة تفاصيلها</div>
    <div class="ctrl-section" style="margin-top:8px">
      <button class="ctrl-btn action" id="probe-btn" onclick="window._launchProbe()">🚀 أطلق مسباراً إلى الفضاء!</button>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا يصعب التنفس فوق 3000م؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">كلما ارتفعنا، قلَّ الضغط الجوي وتباعدت جزيئات الهواء. فوق 3000م، الأكسجين موجود بنفس النسبة (21%) لكن كثافته تقل — كل شهقة تجلب أكسجيناً أقل!</div>
    </div>
  `);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9aircomp'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;

    // Space bg
    const spaceBg=c.createLinearGradient(0,0,0,h);
    spaceBg.addColorStop(0,'#020408'); spaceBg.addColorStop(0.15,'#0A0520');
    spaceBg.addColorStop(0.5,'#0D2B6B'); spaceBg.addColorStop(0.8,'#1E6BA8');
    spaceBg.addColorStop(1,'#3B9FD4');
    c.fillStyle=spaceBg; c.fillRect(0,0,w,h);

    // Stars
    for(let i=0;i<50;i++){
      const sx=(i*173+w*0.1)%w, sy=(i*97)%(h*0.2);
      const br=0.3+0.7*Math.abs(Math.sin(S.t*0.01+i*0.7));
      c.fillStyle=`rgba(255,255,255,${br*0.8})`; c.beginPath(); c.arc(sx,sy,0.7,0,Math.PI*2); c.fill();
    }

    // Draw atmosphere layers (bottom-up = surface to space)
    const layerH=h*0.13;
    const layerCols=[
      ['#1E6BA8','#2A8FCC'],  // Troposphere
      ['#1A4A8A','#235DAF'],  // Stratosphere
      ['#0D2B6B','#143488'],  // Mesosphere
      ['#1A0A4A','#22115E'],  // Ionosphere
      ['#0A0520','#120832'],  // Exosphere
    ];
    const layerY=[h*0.72, h*0.58, h*0.44, h*0.30, h*0.16];

    layers.forEach((l,i)=>{
      const ly=layerY[i];
      const isSel=(S.sel===i);
      const gr=c.createLinearGradient(0,ly,0,ly+layerH);
      gr.addColorStop(0,layerCols[i][1]+(isSel?'FF':'AA'));
      gr.addColorStop(1,layerCols[i][0]+(isSel?'DD':'66'));
      c.fillStyle=gr;
      c.fillRect(0, ly, w, layerH+(i===0?h*0.3:0));

      // Highlight border
      if(isSel){
        c.strokeStyle='rgba(91,200,245,0.8)'; c.lineWidth=2;
        c.beginPath(); c.moveTo(0,ly); c.lineTo(w,ly); c.stroke();
      }

      // Layer label
      const fs=Math.max(9,w*0.022);
      c.fillStyle=isSel?'#5BC8F5':'rgba(255,255,255,0.85)';
      c.font=`${isSel?'bold ':''} ${fs}px Tajawal`;
      c.textAlign='right'; c.textBaseline='middle';
      c.fillText(l.name, w*0.95, ly+layerH*0.45);
      c.fillStyle='rgba(255,255,255,0.5)';
      c.font=`${Math.max(7,w*0.015)}px Tajawal`;
      c.fillText(l.alt, w*0.95, ly+layerH*0.72);
    });

    // Earth surface
    const earthGr=c.createLinearGradient(0,h*0.85,0,h);
    earthGr.addColorStop(0,'#2E7D32'); earthGr.addColorStop(1,'#1B5E20');
    c.fillStyle=earthGr; c.fillRect(0,h*0.85,w,h*0.15);
    // Ocean
    c.fillStyle='#1565C0'; c.fillRect(0,h*0.87,w*0.4,h*0.13);
    c.fillStyle='rgba(255,255,255,0.2)';
    for(let i=0;i<5;i++) c.fillRect(i*w*0.08,h*0.88,w*0.04,2);

    // Probe animation
    if(S.probeAnim){
      const probeY=h*0.85*(1-S.probe)+h*0.02;
      // Rocket body
      c.fillStyle='#E0E0E0'; c.beginPath(); c.roundRect(w*0.1-6,probeY-20,12,28,3); c.fill();
      c.fillStyle='#EF5350'; c.beginPath(); c.moveTo(w*0.1,probeY-20); c.lineTo(w*0.1-6,probeY-10); c.lineTo(w*0.1+6,probeY-10); c.closePath(); c.fill();
      // Flame
      const flameAlpha=0.6+0.4*Math.sin(S.t*0.3);
      c.fillStyle=`rgba(255,${Math.round(100+100*Math.random())},0,${flameAlpha})`;
      c.beginPath(); c.moveTo(w*0.1-4,probeY+8); c.lineTo(w*0.1+4,probeY+8); c.lineTo(w*0.1,probeY+18+Math.random()*8); c.closePath(); c.fill();
      // Exhaust trail
      for(let i=0;i<10;i++){
        c.fillStyle=`rgba(255,200,100,${0.15*(10-i)/10})`;
        c.beginPath(); c.arc(w*0.1+(Math.random()-0.5)*4, probeY+20+i*5, 3, 0,Math.PI*2); c.fill();
      }
      S.probe-=0.005;
      if(S.probe<=0){
        S.probeAnim=false;
        const pb=document.getElementById('probe-btn');
        if(pb){ pb.disabled=false; pb.textContent='🚀 أطلق مسباراً مجدداً!'; }
      }
    }

    // Altitude indicator
    const altFrac=S.probeAnim?(1-S.probe):0;
    if(S.probeAnim){
      const altKm=Math.round(altFrac*500);
      c.fillStyle='rgba(0,0,0,0.5)'; c.beginPath(); c.roundRect(w*0.02,h*0.02,w*0.25,h*0.07,6); c.fill();
      c.fillStyle='#5BC8F5'; c.font=`bold ${Math.max(9,w*0.02)}px Tajawal`;
      c.textAlign='center'; c.fillText(`↑ ${altKm} كم`, w*0.14,h*0.058);
    }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ 10-1 Tab 2: الغازات النبيلة — مختبر تفاعلي ══
function simG9AirComp2(){
  cancelAnimationFrame(animFrame);
  const nobles=[
    {sym:'He',name:'هيليوم', use:'البالونات والغوص 🎈',col:'#60A5FA',pct:'0.0005%',prop:'أخف من الهواء',electrons:2, shell:[2]},
    {sym:'Ne',name:'نيون',   use:'لافتات النيون 💡',   col:'#F87171',pct:'0.0018%',prop:'يُضيء باللون الأحمر',electrons:10,shell:[2,8]},
    {sym:'Ar',name:'أرغون',  use:'المصابيح الكهربائية 💡',col:'#C084FC',pct:'0.93%', prop:'يمنع تأكسد الفتيل',electrons:18,shell:[2,8,8]},
    {sym:'Kr',name:'كريبتون',use:'مصابيح فلاش 📸',    col:'#34D399',pct:'0.0001%',prop:'ضوء أبيض ساطع',electrons:36,shell:[2,8,18,8]},
    {sym:'Xe',name:'زينون',  use:'مصابيح السيارات 🚗',col:'#FBBF24',pct:'0.000009%',prop:'ضوء أزرق قوي',electrons:54,shell:[2,8,18,18,8]},
  ];
  simState={t:0, sel:0, voltage:0, sparking:false};
  const S=simState;
  window._nobleSel2=function(i){
    S.sel=i; S.voltage=0; S.sparking=false;
    document.querySelectorAll('.noble-btn2').forEach(function(b,j){b.classList.toggle('active',j===i);});
    document.getElementById('volt-val').textContent='0';
    document.getElementById('glow-state').textContent='أضف جهداً كهربائياً';
    document.getElementById('volt-slider').value=0;
  };
  window._setVoltage=function(v){
    S.voltage=+v; S.sparking=v>30;
    document.getElementById('volt-val').textContent=v;
    const g=nobles[S.sel];
    const state=v<10?'أضف جهداً كهربائياً':v<40?`${g.name} يتأيّن...`:v<70?`✨ يُضيء بلون ${g.name}!`:`🔆 ضوء ${g.name} ساطع جداً!`;
    document.getElementById('glow-state').textContent=state;
  };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⚗️ اختر الغاز النبيل</div>
      <div class="ctrl-btns-grid">
        ${nobles.map((g,i)=>`<button class="ctrl-btn noble-btn2${i===0?' active':''}" onclick="window._nobleSel2(${i})" style="border-right:3px solid ${g.col}">${g.sym} — ${g.name}</button>`).join('')}
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">⚡ الجهد الكهربائي: <span id="volt-val">0</span> V</div>
      <input type="range" id="volt-slider" min="0" max="100" value="0" oninput="window._setVoltage(this.value)" style="width:100%">
    </div>
    <div id="glow-state" class="info-box" style="font-size:12px;text-align:center;min-height:36px">أضف جهداً كهربائياً</div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا تُسمى "نبيلة"؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">تمتلك 8 إلكترونات في المستوى الخارجي (He: 2) فهي مستقرة تماماً ولا تتفاعل في الظروف العادية — مثل النبلاء الذين لا يختلطون بالعامة!</div>
    </div>
  `);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9aircomp'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const g=nobles[S.sel||0];
    const glowFrac=S.voltage/100;

    // Dark bg
    c.fillStyle='#06090F'; c.fillRect(0,0,w,h);
    // Stars
    for(let i=0;i<25;i++){const sx=(i*193)%w, sy=(i*83)%(h*0.25);c.fillStyle=`rgba(255,255,255,${0.2+0.3*Math.abs(Math.sin(S.t*0.02+i))})`;c.beginPath();c.arc(sx,sy,0.6,0,Math.PI*2);c.fill();}

    // Tube (discharge tube)
    const tx=w*0.12, ty=h*0.12, tw=w*0.76, th=h*0.22;
    // Glow inside tube
    if(glowFrac>0.1){
      const intensity=0.1+glowFrac*0.7+0.1*Math.sin(S.t*0.1);
      const grd=c.createLinearGradient(tx,ty,tx+tw,ty);
      grd.addColorStop(0,g.col+'11'); grd.addColorStop(0.5,g.col+Math.round(intensity*255).toString(16).padStart(2,'0')); grd.addColorStop(1,g.col+'11');
      c.fillStyle=grd; c.beginPath(); c.roundRect(tx+3,ty+3,tw-6,th-6,14); c.fill();
      // Glow halo
      const hrd=c.createRadialGradient(tx+tw/2,ty+th/2,th*0.1,tx+tw/2,ty+th/2,tw*0.6);
      hrd.addColorStop(0,g.col+Math.round(glowFrac*80).toString(16).padStart(2,'0')); hrd.addColorStop(1,g.col+'00');
      c.fillStyle=hrd; c.fillRect(0,0,w,h*0.55);
    }
    // Tube border
    c.strokeStyle=glowFrac>0.1?g.col:'#3A4A5A'; c.lineWidth=3;
    c.beginPath(); c.roundRect(tx,ty,tw,th,16); c.stroke();
    // Electrodes
    c.fillStyle='#78909C'; c.fillRect(tx-12,ty+th*0.2,12,th*0.6); c.fillRect(tx+tw,ty+th*0.2,12,th*0.6);
    // Electrode connectors
    if(S.sparking){
      c.strokeStyle=g.col; c.lineWidth=1;
      for(let i=0;i<3;i++){
        const ry=ty+th*0.3+i*th*0.15;
        c.beginPath(); c.moveTo(tx-12,ry); c.lineTo(tx-25,ry+(Math.random()-0.5)*10); c.stroke();
        c.beginPath(); c.moveTo(tx+tw+12,ry); c.lineTo(tx+tw+25,ry+(Math.random()-0.5)*10); c.stroke();
      }
    }

    // Gas symbol in tube
    const symFs=Math.max(18,w*0.06)*Math.min(1,1+glowFrac*0.3);
    c.fillStyle=glowFrac>0.1?g.col:'rgba(150,170,190,0.6)';
    c.font=`bold ${symFs}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(g.sym, tx+tw/2, ty+th/2);

    // Electron shell diagram (below tube)
    const cx2=w/2, cy2=h*0.58;
    const shells=g.shell;
    const radii=[0,18,32,46,58,70].map(r=>r*Math.min(w,h)*0.0012+h*0.04);

    // Nucleus
    const nucR=Math.min(w,h)*0.025;
    const nucGrd=c.createRadialGradient(cx2,cy2,0,cx2,cy2,nucR);
    nucGrd.addColorStop(0,'#FFF3'); nucGrd.addColorStop(1,g.col+'66');
    c.fillStyle=nucGrd; c.beginPath(); c.arc(cx2,cy2,nucR,0,Math.PI*2); c.fill();
    c.fillStyle='#fff'; c.font=`bold ${Math.max(8,w*0.016)}px Tajawal`;
    c.textAlign='center'; c.textBaseline='middle'; c.fillText(g.sym,cx2,cy2);

    shells.forEach((eCount,si)=>{
      const r=radii[si+1];
      // Orbit
      c.strokeStyle=`rgba(${parseInt(g.col.slice(1,3),16)},${parseInt(g.col.slice(3,5),16)},${parseInt(g.col.slice(5,7),16)},0.3)`;
      c.lineWidth=1; c.beginPath(); c.arc(cx2,cy2,r,0,Math.PI*2); c.stroke();
      // Electrons
      for(let e=0;e<eCount;e++){
        const angle=(e/eCount)*Math.PI*2 + S.t*0.02*(si%2===0?1:-1);
        const ex=cx2+Math.cos(angle)*r, ey=cy2+Math.sin(angle)*r;
        c.fillStyle=g.col; c.beginPath(); c.arc(ex,ey,2.5+glowFrac*1.5,0,Math.PI*2); c.fill();
        if(glowFrac>0.4){
          c.fillStyle=g.col+'44'; c.beginPath(); c.arc(ex,ey,4+glowFrac*3,0,Math.PI*2); c.fill();
        }
      }
    });

    // Info row
    const iy=h*0.82;
    c.fillStyle='rgba(255,255,255,0.05)'; c.beginPath(); c.roundRect(w*0.04,iy,w*0.92,h*0.14,8); c.fill();
    const fs2=Math.max(8,w*0.018);
    c.fillStyle=g.col; c.font=`bold ${fs2*1.1}px Tajawal`; c.textAlign='center';
    c.fillText(g.name, w/2, iy+h*0.04);
    c.fillStyle='#B0C4D8'; c.font=`${fs2*0.9}px Tajawal`;
    c.fillText(`${g.use}  |  نسبته: ${g.pct}`, w/2, iy+h*0.09);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ 10-1 Tab 3: مقارنة غازات الهواء — بار تفاعلي ══
function simG9AirComp3(){
  cancelAnimationFrame(animFrame);
  const data=[
    {name:'N₂',full:'النيتروجين',pct:78,col:'#3B82F6',use:'الغلاف + تصنيع NH₃',react:'غير نشيط — رابطة ثلاثية N≡N',icon:'🔵'},
    {name:'O₂',full:'الأكسجين', pct:21,col:'#EF4444',use:'التنفس + الاحتراق',react:'نشيط — يتفاعل مع معظم المواد',icon:'🔴'},
    {name:'Ar', full:'الأرغون',  pct:0.9,col:'#A855F7',use:'المصابيح الكهربائية',react:'غير نشيط — غاز نبيل',icon:'🟣'},
    {name:'CO₂',full:'ثاني أكسيد الكربون',pct:0.04,col:'#22C55E',use:'البناء الضوئي',react:'يُذيب في الماء → حمضي',icon:'🟢'},
    {name:'H₂O',full:'بخار الماء',pct:2,col:'#06B6D4',use:'دورة الماء + الطقس',react:'يتكثف → مطر وسحاب',icon:'🔵'},
  ];
  simState={t:0, sel:-1, breathMode:false, molecules:[]};
  const S=simState;
  // Init molecules
  for(let i=0;i<80;i++) S.molecules.push({x:Math.random(),y:Math.random(),vx:(Math.random()-0.5)*0.003,vy:(Math.random()-0.5)*0.003,type:Math.random()<0.78?0:Math.random()<0.95?1:Math.random()<0.9?2:3});
  window._airCmp3=function(i){S.sel=(S.sel===i)?-1:i;};
  window._toggleBreath=function(){S.breathMode=!S.breathMode; document.getElementById('breath-btn').textContent=S.breathMode?'⏸ إيقاف التنفس':'🫁 محاكاة التنفس';};

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔬 انقر على الغاز لمعرفة التفاصيل</div>
      <div class="ctrl-btns-grid">
        ${data.map((d,i)=>`<button class="ctrl-btn" onclick="window._airCmp3(${i})" style="border-right:3px solid ${d.col};font-size:11px">${d.icon} ${d.name}<br><small>${d.pct}%</small></button>`).join('')}
      </div>
    </div>
    <div id="air3-info" class="info-box" style="font-size:12px;min-height:48px;text-align:center">انقر على غاز لمعرفة تفاصيله</div>
    <div class="ctrl-section" style="margin-top:8px">
      <button class="ctrl-btn action" id="breath-btn" onclick="window._toggleBreath()">🫁 محاكاة التنفس</button>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا CO₂ في الهواء 0.04% لكنه مهم جداً؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">رغم نسبته الضئيلة، CO₂ أساسي للبناء الضوئي (غذاء النباتات) وتنظيم حرارة الأرض! زيادته الصغيرة (من 0.028% قبل الصناعة إلى 0.04% اليوم) كافية لتغيير المناخ.</div>
    </div>
  `);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9aircomp'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;

    // Update info display
    const info=document.getElementById('air3-info');
    if(S.sel>=0&&info){
      const d=data[S.sel];
      info.innerHTML=`<strong style="color:${d.col}">${d.icon} ${d.full} (${d.name})</strong><br>الاستخدام: ${d.use}<br>التفاعلية: ${d.react}`;
    } else if(info && S.sel<0){info.innerHTML='انقر على غاز لمعرفة تفاصيله';}

    // Full white/light bg
    c.fillStyle='#EEF2F7'; c.fillRect(0,0,w,h);

    // ── Top half: molecule simulation box ──
    const simBoxH=h*0.42;
    const simBg=c.createLinearGradient(0,0,0,simBoxH);
    simBg.addColorStop(0,'#0F2A45'); simBg.addColorStop(1,'#1E4976');
    c.fillStyle=simBg; c.fillRect(0,0,w,simBoxH);

    // Title inside sim box
    _lbl(c,'جزيئات الهواء',w/2,h*0.06,'rgba(255,255,255,0.7)',Math.max(9,w*0.018));

    // Molecules
    S.molecules.forEach(m=>{
      m.x+=m.vx*(S.breathMode?2:1); m.y+=m.vy*(S.breathMode?1.5:1);
      if(m.x<0)m.x=1; if(m.x>1)m.x=0;
      const maxY=simBoxH/h;
      if(m.y<0||m.y>maxY){m.vy*=-1; m.y=Math.max(0.01,Math.min(maxY-0.01,m.y));}
      const d=data[m.type];
      const isSel=(S.sel===m.type);
      c.fillStyle=d.col+(isSel?'FF':'AA');
      const sz=isSel?5:2.5;
      c.beginPath(); c.arc(m.x*w, m.y*h, sz, 0, Math.PI*2); c.fill();
      if(isSel){c.strokeStyle=d.col+'88'; c.lineWidth=1; c.beginPath(); c.arc(m.x*w,m.y*h,sz+3,0,Math.PI*2); c.stroke();}
    });

    // Breath animation (in sim box)
    if(S.breathMode){
      const lungR=w*0.07*(1+0.18*Math.sin(S.t*0.05));
      const lx=w*0.5, ly=simBoxH*0.55;
      c.fillStyle='rgba(239,68,68,0.18)'; c.beginPath(); c.arc(lx-lungR*0.55,ly,lungR,0,Math.PI*2); c.fill();
      c.fillStyle='rgba(239,68,68,0.18)'; c.beginPath(); c.arc(lx+lungR*0.55,ly,lungR,0,Math.PI*2); c.fill();
      c.fillStyle='rgba(255,255,255,0.85)'; c.font=`${Math.max(8,w*0.02)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('🫁 التنفس!', lx, ly);
    }

    // ── Bottom half: bar chart ──
    const chartTop=simBoxH+h*0.06;
    const barAreaH=h-chartTop-h*0.08;
    const barY=chartTop+barAreaH;       // baseline of bars
    const maxBH=barAreaH*0.85;

    // Chart title
    _lbl(c,'نسب غازات الهواء (مقياس لوغاريتمي)',w/2,simBoxH+h*0.04,'#2C3A4A',Math.max(8,w*0.018));

    const logPcts=data.map(d=>Math.max(0.15,Math.log10(d.pct+0.001)*0.75+2.3));
    const maxLP=Math.max(...logPcts);
    // 5 bars across full width with even spacing
    const totalBars=data.length;
    const gap2=w*0.03;
    const bw=(w-gap2*(totalBars+1))/totalBars;
    data.forEach((d,i)=>{
      const bx=gap2+i*(bw+gap2);
      const bh=maxBH*(logPcts[i]/maxLP);
      const isSel=(S.sel===i);
      // Bar gradient
      const gr=c.createLinearGradient(bx,barY-bh,bx,barY);
      gr.addColorStop(0,d.col+(isSel?'FF':'DD')); gr.addColorStop(1,d.col+'55');
      c.fillStyle=gr; c.beginPath(); c.roundRect(bx,barY-bh,bw,bh,5); c.fill();
      // Selection border
      if(isSel){c.strokeStyle=d.col; c.lineWidth=2.5; c.beginPath(); c.roundRect(bx,barY-bh,bw,bh,5); c.stroke();}
      // Pct label above bar
      const fs=Math.max(8,w*0.017);
      c.fillStyle=isSel?d.col:'#4A5568'; c.font=`bold ${fs}px Tajawal`; c.textAlign='center'; c.textBaseline='bottom';
      c.fillText(d.pct+'%', bx+bw/2, barY-bh-3);
      // Gas name below baseline
      c.fillStyle=isSel?d.col:'#2C3A4A'; c.font=`bold ${fs}px Tajawal`; c.textBaseline='top';
      c.fillText(d.name, bx+bw/2, barY+4);
    });
    // Baseline
    c.strokeStyle='#94A3B8'; c.lineWidth=1.5; c.beginPath(); c.moveTo(gap2*0.5,barY); c.lineTo(w-gap2*0.5,barY); c.stroke();

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ 10-2 Tab 1: الاحتراق الكامل — مختبر تفاعلي ══
function simG9Combustion1(){
  cancelAnimationFrame(animFrame);
  simState={t:0, burning:false, o2Level:100, products:[], flame:[], limeWater:'clear', limeTest:false};
  const S=simState;
  window._ignite=function(){S.burning=true; document.getElementById('ignite-btn').disabled=true; document.getElementById('stop-btn').disabled=false;};
  window._extinguish=function(){S.burning=false; document.getElementById('ignite-btn').disabled=false; document.getElementById('stop-btn').disabled=true;};
  window._testLime=function(){S.limeTest=true; setTimeout(()=>{S.limeTest=false;},3000);};

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔥 الاحتراق الكامل — CH₄ + 2O₂</div>
      <div class="info-box" style="font-size:12px">
        <strong>CH₄ + 2O₂ → CO₂ + 2H₂O</strong><br>
        الأكسجين كافٍ → CO₂ وبخار ماء فقط
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn action" id="ignite-btn" onclick="window._ignite()">🔥 أشعل</button>
        <button class="ctrl-btn" id="stop-btn" onclick="window._extinguish()" disabled>⏹ أطفئ</button>
        <button class="ctrl-btn" onclick="window._testLime()">🧪 اختبر ماء الجير</button>
      </div>
    </div>
    <div id="comb1-status" class="info-box" style="font-size:12px;text-align:center;min-height:48px">أشعل اللهب للبدء</div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ كيف تُثبت أن منتج الاحتراق هو CO₂؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">مرِّر الغاز الناتج في ماء الجير Ca(OH)₂ — إذا تعكَّر يعني أن CO₂ موجود! التفاعل: Ca(OH)₂ + CO₂ → CaCO₃↓ (الراسب الأبيض)</div>
    </div>
  `);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9combustion'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;

    // Lab background
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F0F4F8'); bg.addColorStop(1,'#DDE4EC');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    // Lab bench
    c.fillStyle='#8B6E4E'; c.fillRect(0,h*0.82,w,h*0.18);
    c.fillStyle='#A0825C'; c.fillRect(0,h*0.82,w,h*0.025);

    // Bunsen burner
    const bx=w*0.35, by=h*0.82;
    c.fillStyle='#607D8B'; c.fillRect(bx-12,by-h*0.15,24,h*0.15);
    c.fillStyle='#546E7A'; c.fillRect(bx-18,by-h*0.04,36,h*0.04);
    c.fillStyle='#455A64'; c.fillRect(bx-25,by-h*0.06,50,h*0.02);

    // Flame
    if(S.burning){
      S.t%3===0 && S.flame.push({x:bx,y:by-h*0.15,vx:(Math.random()-0.5)*1.5,vy:-2-Math.random()*2,life:1,sz:Math.random()*8+4});
      S.flame=S.flame.filter(f=>f.life>0.05);
      S.flame.forEach(f=>{
        f.x+=f.vx; f.y+=f.vy; f.life-=0.04; f.vx*=0.98;
        const r=Math.round(255),g2=Math.round(f.life*200),b=0;
        c.globalAlpha=f.life*0.8;
        c.fillStyle=`rgb(${r},${g2},${b})`;
        c.beginPath(); c.arc(f.x,f.y,f.sz*f.life,0,Math.PI*2); c.fill();
      });
      c.globalAlpha=1;
      // Produce molecules
      if(S.t%15===0){
        S.products.push({x:bx+(Math.random()-0.5)*20,y:by-h*0.2,type:'CO₂',col:'#22C55E',vy:-1.2,vx:(Math.random()-0.5)*0.8,life:1});
        S.products.push({x:bx+(Math.random()-0.5)*20,y:by-h*0.2,type:'H₂O',col:'#60A5FA',vy:-1.5,vx:(Math.random()-0.5)*0.8,life:1});
      }
    } else {
      S.flame=[];
    }

    // Product molecules floating up
    S.products=S.products.filter(p=>p.life>0.05&&p.y>0);
    S.products.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.life-=0.005;
      c.globalAlpha=p.life;
      c.fillStyle=p.col; c.beginPath(); c.arc(p.x,p.y,4,0,Math.PI*2); c.fill();
      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(7,w*0.016)}px Tajawal`; c.textAlign='center';
      c.fillText(p.type,p.x,p.y-8);
    });
    c.globalAlpha=1;

    // Lime water beaker
    const lx=w*0.65, lby=h*0.65, lw=w*0.18, lh=h*0.2;
    // Beaker
    c.strokeStyle='#90A4AE'; c.lineWidth=2;
    c.beginPath(); c.moveTo(lx,lby); c.lineTo(lx-lw*0.05,lby+lh); c.lineTo(lx+lw+lw*0.05,lby+lh); c.lineTo(lx+lw,lby); c.stroke();
    // Water
    const cloudiness=S.limeTest?Math.min(1,(S.t%150)/100):0;
    const waterCol=`rgba(${Math.round(200+55*(1-cloudiness))},${Math.round(220+35*(1-cloudiness))},${255},0.8)`;
    c.fillStyle=waterCol; c.fillRect(lx+2,lby+lh*0.15,lw-4,lh*0.8);
    c.fillStyle='rgba(255,255,255,0.3)'; c.fillRect(lx+2,lby+lh*0.15,lw-4,lh*0.06);
    _lbl(c,'ماء الجير',lx+lw/2,lby-10,'#546E7A',Math.max(8,w*0.016));
    if(S.limeTest){
      _lbl(c,cloudiness>0.5?'تعكّر! CO₂ موجود ✅':'يتغيّر...', lx+lw/2,lby+lh+20,'#EF4444',Math.max(9,w*0.018));
    }

    // Status
    const status=document.getElementById('comb1-status');
    if(status){
      const co2Count=S.products.filter(p=>p.type==='CO₂').length;
      const h2oCount=S.products.filter(p=>p.type==='H₂O').length;
      status.innerHTML=S.burning
        ?`🔥 يحترق! CO₂ المنبعث: ${co2Count} | بخار الماء: ${h2oCount}<br>التفاعل: CH₄ + 2O₂ → CO₂ + 2H₂O`
        :'⏹ اللهب مطفأ — أشعله لرؤية منتجات الاحتراق';
    }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ 10-2 Tab 2: الاحتراق غير الكامل — CO الخطير ══
function simG9Combustion2(){
  cancelAnimationFrame(animFrame);
  simState={t:0, o2Slider:100, burning:false, particles:[], danger:0};
  const S=simState;
  window._setO2=function(v){S.o2Slider=+v; document.getElementById('o2-val').textContent=v+'%'; if(S.burning){}};
  window._igniteComb2=function(on){S.burning=on; document.getElementById('ign2-btn').textContent=on?'⏹ أطفئ':'🔥 أشعل';};

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">💨 نسبة الأكسجين المتاحة: <span id="o2-val">100</span>%</div>
      <input type="range" min="10" max="100" value="100" oninput="window._setO2(this.value)" style="width:100%">
    </div>
    <div class="ctrl-section">
      <div class="info-box" style="font-size:12px">
        <strong>كامل (O₂ وفير):</strong> CH₄ + 2O₂ → <span style="color:#22C55E">CO₂</span> + 2H₂O<br>
        <strong>غير كامل (O₂ ناقص):</strong> 2CH₄ + 3O₂ → <span style="color:#EF4444">2CO</span> + 4H₂O
      </div>
    </div>
    <div class="ctrl-section">
      <button class="ctrl-btn action" id="ign2-btn" onclick="window._igniteComb2(!simState.burning)">🔥 أشعل</button>
    </div>
    <div id="comb2-danger" class="info-box" style="font-size:12px;text-align:center;min-height:40px">اضبط نسبة الأكسجين وأشعل اللهب</div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا CO أخطر من CO₂؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">CO يرتبط بالهيموغلوبين بقوة 200× أكثر من O₂! فيمنع نقل الأكسجين للخلايا → تسمم الدم. CO عديم اللون والرائحة — لا يُشعر به حتى الإغماء!</div>
    </div>
  `);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9combustion'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const o2=S.o2Slider;
    const isComplete=o2>=70;

    // Background — gets darker/redder with CO
    const dangerFrac=Math.max(0,(70-o2)/60);
    S.danger=dangerFrac;
    const r=Math.round(220+35*dangerFrac), g2=Math.round(235-100*dangerFrac), b=Math.round(245-120*dangerFrac);
    c.fillStyle=`rgb(${r},${g2},${b})`; c.fillRect(0,0,w,h);

    if(dangerFrac>0.3){
      c.fillStyle=`rgba(239,68,68,${dangerFrac*0.15})`; c.fillRect(0,0,w,h);
      _lbl(c,'⚠️ تحذير: CO في الهواء!',w/2,h*0.08,'#DC2626',Math.max(10,w*0.022));
    }

    // Burner
    const bx=w*0.5, by=h*0.78;
    c.fillStyle='#607D8B'; c.fillRect(bx-14,by-h*0.12,28,h*0.12);
    c.fillStyle='#546E7A'; c.fillRect(bx-20,by-h*0.03,40,h*0.03);

    // Flame color changes
    if(S.burning){
      const flameCol=isComplete?'#3B82F6':`rgb(${Math.round(255)},${Math.round(isComplete?150:50)},0)`;
      S.t%4===0 && S.particles.push({
        x:bx+(Math.random()-0.5)*16,y:by-h*0.12,
        vx:(Math.random()-0.5)*1.2,vy:-1.8-Math.random()*1.5,
        type:isComplete?'CO₂':(Math.random()<(1-o2/100)*0.8?'CO':'CO₂'),
        life:1, sz:4+Math.random()*4
      });
    }
    S.particles=S.particles.filter(p=>p.life>0.05&&p.y>0);
    S.particles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.life-=0.008;
      const col=p.type==='CO'?`rgba(239,68,68,${p.life})`:`rgba(34,197,94,${p.life})`;
      c.fillStyle=col; c.beginPath(); c.arc(p.x,p.y,p.sz*p.life,0,Math.PI*2); c.fill();
      c.fillStyle=`rgba(30,45,60,${p.life*0.9})`; c.font=`bold ${Math.max(7,w*0.015)}px Tajawal`;
      c.textAlign='center'; c.fillText(p.type,p.x,p.y-8);
    });
    if(S.burning){
      // Flame shape
      for(let f=0;f<8;f++){
        const fa=S.t*0.1+f;
        const fh=h*0.08*(0.7+0.3*Math.sin(fa));
        c.globalAlpha=0.6+0.4*Math.sin(fa);
        const flameGrd=c.createRadialGradient(bx,by-h*0.06,0,bx,by-h*0.06,fh);
        flameGrd.addColorStop(0,isComplete?'#60A5FA':'#FFF');
        flameGrd.addColorStop(0.5,isComplete?'#3B82F6':`rgb(255,${Math.round(o2)},0)`);
        flameGrd.addColorStop(1,'rgba(0,0,0,0)');
        c.fillStyle=flameGrd; c.beginPath(); c.arc(bx,by-h*0.06,fh,0,Math.PI*2); c.fill();
      }
      c.globalAlpha=1;
    }

    // O2 tank visual
    const tx=w*0.12, ty=h*0.25, tw=w*0.15, th=h*0.35;
    c.fillStyle='#B0BEC5'; c.beginPath(); c.roundRect(tx,ty,tw,th,tw*0.4); c.fill();
    c.fillStyle='#90A4AE'; c.fillRect(tx+tw*0.2,ty-h*0.04,tw*0.6,h*0.04);
    const fillH=th*(o2/100);
    const tankGrd=c.createLinearGradient(tx,ty+th-fillH,tx,ty+th);
    tankGrd.addColorStop(0,'#60A5FA'); tankGrd.addColorStop(1,'#2563EB');
    c.fillStyle=tankGrd; c.beginPath(); c.roundRect(tx+4,ty+th-fillH,tw-8,fillH,tw*0.35); c.fill();
    _lbl(c,'O₂',tx+tw/2,ty+th/2,'#1E3A5F',Math.max(12,w*0.03));
    _lbl(c,o2+'%',tx+tw/2,ty+th*0.7,'#1E3A5F',Math.max(9,w*0.018));

    // Product label
    const pType=isComplete?'CO₂ (آمن ✅)':`CO + CO₂ (${dangerFrac>0.3?'خطر! ⚠️':'تحذير'})`;
    _lbl(c,'النواتج: '+pType,w*0.6,h*0.88,isComplete?'#16A34A':'#DC2626',Math.max(9,w*0.02));

    const dangerEl=document.getElementById('comb2-danger');
    if(dangerEl) dangerEl.innerHTML=isComplete
      ?'✅ احتراق كامل — نواتج آمنة: CO₂ وبخار ماء'
      :`⚠️ احتراق غير كامل! نسبة CO الخطرة: ${Math.round(dangerFrac*100)}% | نقص O₂: ${Math.round(100-o2)}%`;

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ 10-2 Tab 3: مقارنة المنتجات ══
function simG9Combustion3(){
  cancelAnimationFrame(animFrame);
  simState={t:0, scenario:'complete'};
  const S=simState;
  window._setCombScenario=function(s){S.scenario=s; document.querySelectorAll('.comb3-btn').forEach(b=>b.classList.toggle('active',b.dataset.s===s));};

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📊 اختر نوع الاحتراق للمقارنة</div>
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn comb3-btn active" data-s="complete" onclick="window._setCombScenario('complete')" style="border-right:3px solid #22C55E">✅ كامل</button>
        <button class="ctrl-btn comb3-btn" data-s="incomplete" onclick="window._setCombScenario('incomplete')" style="border-right:3px solid #EF4444">⚠️ غير كامل</button>
        <button class="ctrl-btn comb3-btn" data-s="soot" onclick="window._setCombScenario('soot')" style="border-right:3px solid #374151">🟫 احتراق ناقص جداً</button>
      </div>
    </div>
    <div class="info-box" style="font-size:12px">
      📌 كثير من حوادث التسمم بأول أكسيد الكربون تحدث من سخانات غاز في غرف مغلقة!
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ما الفرق المرئي بين الاحتراق الكامل وغير الكامل؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الاحتراق الكامل: لهب أزرق شفاف لا دخان. غير الكامل: لهب أصفر/برتقالي يصاحبه دخان أسود (جزيئات كربون = سُخام). السُّخام دليل قاطع على الاحتراق الناقص!</div>
    </div>
  `);

  const cv=document.getElementById('simCanvas');
  const scenarios={
    complete:{label:'الاحتراق الكامل',eq:'CH₄ + 2O₂ → CO₂ + 2H₂O',products:['CO₂','H₂O','H₂O'],cols:['#22C55E','#60A5FA','#60A5FA'],flameCol:'#3B82F6',smoke:0,safe:true,tag:'✅ آمن — CO₂ وبخار ماء'},
    incomplete:{label:'الاحتراق غير الكامل',eq:'2CH₄ + 3O₂ → 2CO + 4H₂O',products:['CO','CO','H₂O'],cols:['#EF4444','#EF4444','#60A5FA'],flameCol:'#F59E0B',smoke:0.3,safe:false,tag:'⚠️ خطر — CO سام!'},
    soot:{label:'الاحتراق الناقص جداً',eq:'CH₄ + O₂ → C + 2H₂O',products:['C','C','H₂O'],cols:['#374151','#374151','#60A5FA'],flameCol:'#F97316',smoke:0.8,safe:false,tag:'🟫 سُخام كربون — تلوث شديد'},
  };
  function draw(){
    if(currentSim!=='g9combustion'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const sc=scenarios[S.scenario];

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F8FAFC'); bg.addColorStop(1,'#E2E8F0');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    _lbl(c,sc.label,w/2,h*0.06,'#1E2D3D',Math.max(11,w*0.025));
    _lbl(c,sc.eq,w/2,h*0.13,'#374151',Math.max(9,w*0.018));

    // Burner + flame
    const bx=w*0.5, by=h*0.72;
    c.fillStyle='#78909C'; c.fillRect(bx-12,by-h*0.12,24,h*0.12);
    // Flame
    for(let i=0;i<6;i++){
      const fa=S.t*0.08+i;
      const fh=h*0.1*(0.6+0.4*Math.sin(fa));
      c.globalAlpha=0.5+0.4*Math.sin(fa+1);
      const gr=c.createRadialGradient(bx,by-h*0.05,0,bx,by-h*0.05,fh);
      gr.addColorStop(0,'#FFF'); gr.addColorStop(0.4,sc.flameCol); gr.addColorStop(1,'rgba(0,0,0,0)');
      c.fillStyle=gr; c.beginPath(); c.arc(bx,by-h*0.05,fh,0,Math.PI*2); c.fill();
    }
    c.globalAlpha=1;

    // Smoke
    if(sc.smoke>0){
      for(let i=0;i<15;i++){
        const sx=bx+(i%3-1)*15+(Math.sin(S.t*0.03+i)*10), sy=by-h*0.2-(i*h*0.025);
        c.globalAlpha=sc.smoke*(1-(i/15))*0.6;
        c.fillStyle=S.scenario==='soot'?'#374151':'#9CA3AF';
        c.beginPath(); c.arc(sx,sy,6+i*2,0,Math.PI*2); c.fill();
      }
      c.globalAlpha=1;
    }

    // Products rising
    sc.products.forEach((prod,i)=>{
      const px=bx+(i-1)*w*0.12, py=by-h*0.35-Math.sin(S.t*0.02+i)*h*0.05;
      c.fillStyle=sc.cols[i]; c.beginPath(); c.arc(px,py,Math.max(12,w*0.035),0,Math.PI*2); c.fill();
      c.fillStyle='#fff'; c.font=`bold ${Math.max(9,w*0.02)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(prod,px,py);
    });

    // Safety tag
    c.fillStyle=sc.safe?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)';
    c.beginPath(); c.roundRect(w*0.1,h*0.82,w*0.8,h*0.1,8); c.fill();
    _lbl(c,sc.tag,w/2,h*0.87,sc.safe?'#16A34A':'#DC2626',Math.max(10,w*0.022));

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ 10-3 Tab 1: تكوُّن المطر الحمضي ══
function simG9AcidRain1(){
  cancelAnimationFrame(animFrame);
  simState={t:0, so2:0, no2:0, clouds:[], drops:[], pH:7.0, factory:false, cars:0};
  const S=simState;
  // Init clouds
  for(let i=0;i<3;i++) S.clouds.push({x:0.15+i*0.3,y:0.15+i*0.04,w:0.18,h:0.08,pH:7});
  window._toggleFactory=function(){S.factory=!S.factory; document.getElementById('fact-btn').textContent=S.factory?'🏭 أوقف المصنع':'🏭 شغّل المصنع';};
  window._setCars=function(v){S.cars=+v; document.getElementById('cars-val').textContent=v;};

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌧️ مصادر تلوّث الهواء</div>
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn action" id="fact-btn" onclick="window._toggleFactory()">🏭 شغّل المصنع</button>
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🚗 عدد السيارات: <span id="cars-val">0</span></div>
      <input type="range" min="0" max="10" value="0" oninput="window._setCars(this.value)" style="width:100%">
    </div>
    <div id="acid1-info" class="info-box" style="font-size:12px;text-align:center;min-height:44px">
      SO₂ + H₂O → H₂SO₃ | NO₂ + H₂O → HNO₃
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ما pH المطر الطبيعي وما pH المطر الحمضي؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">المطر الطبيعي pH ≈ 5.6 (حمضي قليلاً بسبب CO₂ الجوي). المطر الحمضي pH < 5.6 وقد يصل إلى 4 أو أقل عند التلوث الشديد — أكثر حمضية من عصير الطماطم!</div>
    </div>
  `);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9acidrain'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;

    // Sky
    const pollution=Math.min(1,(S.factory?0.4:0)+(S.cars*0.05));
    const skyR=Math.round(100+pollution*80), skyG=Math.round(160-pollution*60), skyB=Math.round(200-pollution*60);
    c.fillStyle=`rgb(${skyR},${skyG},${skyB})`; c.fillRect(0,0,w,h*0.8);
    // Ground
    c.fillStyle='#4CAF50'; c.fillRect(0,h*0.8,w,h*0.2);
    c.fillStyle='#388E3C'; c.fillRect(0,h*0.8,w,h*0.02);

    // Factory
    if(S.factory){
      const fx=w*0.12, fy=h*0.55;
      c.fillStyle='#546E7A'; c.fillRect(fx,fy,w*0.12,h*0.27); // building
      c.fillStyle='#455A64'; c.fillRect(fx+w*0.015,fy-h*0.08,w*0.025,h*0.08); // chimney1
      c.fillStyle='#455A64'; c.fillRect(fx+w*0.06,fy-h*0.1,w*0.025,h*0.1); // chimney2
      // SO2 smoke
      for(let i=0;i<8;i++){
        const sx=fx+w*0.027+((S.t*0.5+i*20)%w)*0.3, sy=fy-h*0.08-(S.t*0.3+i*8)%(h*0.35);
        if(sy>0&&sy<fy){
          c.globalAlpha=0.5-i*0.05;
          c.fillStyle='#FDD835';
          c.beginPath(); c.arc(sx,sy,5+i,0,Math.PI*2); c.fill();
        }
      }
      c.globalAlpha=1;
      _lbl(c,'SO₂',fx+w*0.02,fy-h*0.15,'#FDD835',Math.max(8,w*0.018));
    }

    // Cars
    for(let i=0;i<S.cars;i++){
      const cx2=(((S.t*0.8+i*w/10)%w)), cy2=h*0.77;
      c.fillStyle=['#E53935','#1E88E5','#43A047','#8E24AA','#F4511E'][i%5];
      c.fillRect(cx2,cy2,w*0.06,h*0.025); c.fillRect(cx2+w*0.012,cy2-h*0.018,w*0.036,h*0.018);
      // Exhaust
      c.globalAlpha=0.4; c.fillStyle='#9E9E9E';
      c.beginPath(); c.arc(cx2-3,cy2+h*0.012,4,0,Math.PI*2); c.fill(); c.globalAlpha=1;
    }

    // pH of clouds
    const totalPollution=((S.factory?0.5:0)+(S.cars*0.05));
    const targetPH=Math.max(3.5,7-totalPollution*3.5);
    S.clouds.forEach(cl=>{
      cl.pH+=(targetPH-cl.pH)*0.01;
      const acidFrac=Math.max(0,(7-cl.pH)/3.5);
      const cr=Math.round(200+55*acidFrac), cg=Math.round(200-100*acidFrac), cb=Math.round(220-100*acidFrac);
      c.fillStyle=`rgba(${cr},${cg},${cb},0.9)`;
      c.beginPath(); c.ellipse(cl.x*w,cl.y*h,cl.w*w,cl.h*h,0,0,Math.PI*2); c.fill();
      c.fillStyle=`rgba(${Math.round(cr*0.8)},${Math.round(cg*0.8)},${Math.round(cb*0.8)},0.7)`;
      c.beginPath(); c.ellipse(cl.x*w-cl.w*w*0.3,cl.y*h+cl.h*h*0.2,cl.w*w*0.6,cl.h*h*0.7,0,0,Math.PI*2); c.fill();
      c.beginPath(); c.ellipse(cl.x*w+cl.w*w*0.3,cl.y*h+cl.h*h*0.15,cl.w*w*0.55,cl.h*h*0.65,0,0,Math.PI*2); c.fill();
      _lbl(c,`pH ${cl.pH.toFixed(1)}`,cl.x*w,cl.y*h,acidFrac>0.3?'#D32F2F':'#1E2D3D',Math.max(8,w*0.018));
      // Rain drops
      if(S.t%8===0 && totalPollution>0) S.drops.push({x:cl.x*w+(Math.random()-0.5)*cl.w*w,y:cl.y*h+cl.h*h,pH:cl.pH,vy:3});
    });
    S.drops=S.drops.filter(d=>d.y<h*0.82);
    S.drops.forEach(d=>{
      d.y+=d.vy;
      const af=Math.max(0,(7-d.pH)/3.5);
      c.fillStyle=`rgba(${Math.round(100+155*af)},${Math.round(150-100*af)},${255-Math.round(100*af)},0.8)`;
      c.fillRect(d.x,d.y,2,8);
    });

    // pH meter
    const meterX=w*0.75, meterY=h*0.15;
    c.fillStyle='rgba(255,255,255,0.9)'; c.beginPath(); c.roundRect(meterX,meterY,w*0.22,h*0.5,8); c.fill();
    c.strokeStyle='#CBD5E1'; c.lineWidth=1.5; c.beginPath(); c.roundRect(meterX,meterY,w*0.22,h*0.5,8); c.stroke();
    _lbl(c,'⚗️ pH',meterX+w*0.11,meterY+h*0.05,'#1E2D3D',Math.max(9,w*0.02));
    const phScale=[[3,'#DC2626'],[4,'#EA580C'],[5,'#CA8A04'],[6,'#65A30D'],[7,'#16A34A']];
    phScale.forEach(([ph,col],i)=>{
      const yp=meterY+h*0.12+i*(h*0.07);
      const isActive=Math.abs(targetPH-ph)<0.7;
      c.fillStyle=isActive?col:col+'44'; c.fillRect(meterX+w*0.03,yp,w*0.16*(isActive?1:0.5),h*0.055);
      _lbl(c,'pH '+ph,meterX+w*0.11,yp+h*0.027,'#fff',Math.max(7,w*0.016));
    });

    const info=document.getElementById('acid1-info');
    if(info) info.innerHTML=`pH السحاب الحالي: <strong>${targetPH.toFixed(1)}</strong> ${targetPH<5.6?'🔴 مطر حمضي!':targetPH<6?'🟡 قريب من الحمضي':'🟢 طبيعي'}<br>SO₂ ${S.factory?'✅ مرتفع':'❌ منخفض'} | NOₓ ${S.cars>3?'✅ مرتفع':'❌ منخفض'}`;

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ 10-3 Tab 2: تأثير المطر الحمضي على البيئة ══
function simG9AcidRain2(){
  cancelAnimationFrame(animFrame);
  simState={t:0, pH:5.6, raining:false, drops:[], trees:[],stones:[],fish:[]};
  const S=simState;
  // Init scene
  for(let i=0;i<5;i++) S.trees.push({x:0.08+i*0.18,health:1,lean:0});
  for(let i=0;i<3;i++) S.stones.push({x:0.1+i*0.35,damage:0});
  for(let i=0;i<6;i++) S.fish.push({x:Math.random(),y:0.75+Math.random()*0.12,vx:(Math.random()-0.5)*0.003,health:1});
  window._setPH2=function(v){S.pH=+v; document.getElementById('ph2-val').textContent=(+v).toFixed(1); S.raining=true;};
  window._stopRain=function(){S.raining=false; document.getElementById('rain2-btn').textContent='🌧️ ابدأ المطر';};

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌧️ pH المطر: <span id="ph2-val">5.6</span></div>
      <input type="range" min="3.0" max="7.0" step="0.1" value="5.6" oninput="window._setPH2(this.value)" style="width:100%">
    </div>
    <div class="ctrl-section">
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn action" id="rain2-btn" onclick="simState.raining=!simState.raining;this.textContent=simState.raining?'⏸ إيقاف المطر':'🌧️ ابدأ المطر'">🌧️ ابدأ المطر</button>
        <button class="ctrl-btn" onclick="simState.trees.forEach(t=>{t.health=1;t.lean=0;});simState.stones.forEach(s=>s.damage=0);simState.fish.forEach(f=>f.health=1)">🔄 استعادة</button>
      </div>
    </div>
    <div id="rain2-effects" class="info-box" style="font-size:12px;text-align:center;min-height:44px">اضبط pH المطر وشاهد التأثيرات</div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ كيف يضر المطر الحمضي بالأشجار؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">يُحلِّل أوراقها ويُتلف مساماتها (الثغور) فيُعطّل التنفس والبناء الضوئي. يُحرِّر أيوناً معدنية سامة في التربة كـ Al³⁺ وMn²⁺ تُعيق امتصاص الجذور للعناصر الغذائية.</div>
    </div>
  `);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9acidrain'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const acidFrac=Math.max(0,(5.6-S.pH)/2.6);

    // Sky
    c.fillStyle=`rgb(${Math.round(130+80*acidFrac)},${Math.round(160-60*acidFrac)},${Math.round(200-80*acidFrac)})`; c.fillRect(0,0,w,h*0.55);
    // Lake
    const lakeCol=acidFrac>0.4?`rgba(${Math.round(100+100*acidFrac)},${Math.round(160-80*acidFrac)},${Math.round(180-80*acidFrac)},0.85)`:'rgba(64,164,223,0.85)';
    c.fillStyle=lakeCol; c.fillRect(0,h*0.68,w,h*0.2);
    c.fillStyle='rgba(255,255,255,0.15)'; c.fillRect(0,h*0.68,w,h*0.015);
    // Ground
    c.fillStyle=`rgb(${Math.round(60+acidFrac*40)},${Math.round(100-acidFrac*50)},30)`; c.fillRect(0,h*0.55,w,h*0.15);

    // Fish
    S.fish.forEach(f=>{
      if(S.raining&&acidFrac>0.3) f.health=Math.max(0,f.health-acidFrac*0.0005);
      f.x+=f.vx; if(f.x<0)f.x=1; if(f.x>1)f.x=0;
      const dead=f.health<0.3;
      c.fillStyle=dead?'#6B7280':`rgba(${Math.round(255*acidFrac)},${Math.round(200*(1-acidFrac))},${Math.round(255*(1-acidFrac))},0.9)`;
      c.beginPath();
      c.moveTo(f.x*w,f.y*h);
      c.lineTo(f.x*w-w*0.03,f.y*h-h*0.015); c.lineTo(f.x*w-w*0.04,f.y*h);
      c.lineTo(f.x*w-w*0.03,f.y*h+h*0.015); c.closePath(); c.fill();
      if(dead){ c.fillStyle='rgba(239,68,68,0.7)'; c.beginPath(); c.arc(f.x*w,f.y*h,3,0,Math.PI*2); c.fill(); }
    });

    // Trees
    S.trees.forEach(t=>{
      if(S.raining&&acidFrac>0.1) t.health=Math.max(0,t.health-acidFrac*0.0002);
      const tx2=t.x*w, ty2=h*0.55;
      // Trunk
      c.fillStyle=`rgb(${Math.round(80+acidFrac*40)},${Math.round(50+acidFrac*10)},20)`;
      c.fillRect(tx2-4,ty2-h*0.12,8,h*0.12);
      // Leaves
      const leafCol=t.health>0.7?'#22C55E':t.health>0.4?'#84CC16':'#A16207';
      c.fillStyle=leafCol+(t.health<0.4?'CC':'FF');
      c.beginPath(); c.arc(tx2,ty2-h*0.14,w*0.04*t.health,0,Math.PI*2); c.fill();
      if(t.health<0.3){
        // Falling leaves
        for(let l=0;l<3;l++){
          const lx=tx2+(Math.sin(S.t*0.02+l)*20), ly=ty2-h*0.05-l*15;
          c.fillStyle='#A16207'; c.beginPath(); c.ellipse(lx,ly,4,2,(S.t*0.05+l),0,Math.PI*2); c.fill();
        }
      }
    });

    // Stone monuments
    S.stones.forEach(s=>{
      if(S.raining&&acidFrac>0.2) s.damage=Math.min(1,s.damage+acidFrac*0.0003);
      const sx=s.x*w, sy=h*0.56;
      c.fillStyle=`rgb(${Math.round(150-s.damage*50)},${Math.round(150-s.damage*50)},${Math.round(150-s.damage*50)})`;
      c.fillRect(sx-12,sy-h*0.07*(1-s.damage*0.3),24,h*0.07*(1-s.damage*0.3));
      if(s.damage>0.3){
        c.strokeStyle='rgba(0,0,0,0.3)'; c.lineWidth=1;
        for(let cr=0;cr<Math.floor(s.damage*5);cr++){
          c.beginPath(); c.moveTo(sx-8+cr*4,sy-h*0.04); c.lineTo(sx-8+cr*4+3,sy); c.stroke();
        }
      }
    });

    // Rain drops
    if(S.raining){
      S.t%2===0 && S.drops.push({x:Math.random()*w, y:0, vy:4+Math.random()*3});
      S.drops=S.drops.filter(d=>d.y<h*0.88);
      S.drops.forEach(d=>{
        d.y+=d.vy;
        c.fillStyle=acidFrac>0.4?`rgba(255,${Math.round(180-100*acidFrac)},0,0.7)`:'rgba(100,160,220,0.7)';
        c.fillRect(d.x,d.y,2,7);
      });
    }

    const ef=document.getElementById('rain2-effects');
    const avgTree=S.trees.reduce((a,t)=>a+t.health,0)/S.trees.length;
    const deadFish=S.fish.filter(f=>f.health<0.3).length;
    if(ef) ef.innerHTML=`صحة الأشجار: ${Math.round(avgTree*100)}% | أسماك متضررة: ${deadFish}/6<br>${acidFrac>0.5?'⚠️ دمار بيئي شديد — التربة والماء تأثّرا!':acidFrac>0.2?'🟡 تأثير معتدل — الكائنات الحساسة تتضرر':'🟢 تأثير طفيف'}`;

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ 10-3 Tab 3: حلول التلوّث ══
function simG9AcidRain3(){
  cancelAnimationFrame(animFrame);
  const solutions=[
    {name:'مداخن مرشَّحة',icon:'🏭',eff:0.7,col:'#3B82F6',desc:'تُمسك SO₂ قبل خروجه في المداخن باستخدام الحجر الجيري — تُقلّل SO₂ بنسبة 95%!'},
    {name:'سيارات هجينة',icon:'🚗',eff:0.5,col:'#22C55E',desc:'محركات كهربائية + بنزين = نصف انبعاثات NOₓ فقط مقارنة بالسيارات التقليدية'},
    {name:'طاقة متجددة',icon:'☀️',eff:0.9,col:'#F59E0B',desc:'الطاقة الشمسية والرياح لا تحرق وقوداً → صفر انبعاثات SO₂ وNOₓ!'},
    {name:'الجير في البحيرات',icon:'🌊',eff:0.6,col:'#8B5CF6',desc:'إضافة CaCO₃ لرفع pH البحيرات المتضررة وإنقاذ الأسماك'},
  ];
  simState={t:0, active:[], pollutionLevel:1.0};
  const S=simState;
  window._toggleSol=function(i){
    const idx=S.active.indexOf(i);
    if(idx>=0) S.active.splice(idx,1); else S.active.push(i);
    document.querySelectorAll('.sol-btn').forEach((b,j)=>b.classList.toggle('active',S.active.includes(j)));
    const totalEff=S.active.reduce((a,ai)=>a+solutions[ai].eff*0.25,0);
    S.pollutionLevel=Math.max(0.05,1-totalEff);
  };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🛡️ اختر الحلول البيئية (يمكن تفعيل أكثر من حل)</div>
      <div class="ctrl-btns-grid">
        ${solutions.map((s,i)=>`<button class="ctrl-btn sol-btn" onclick="window._toggleSol(${i})" style="border-right:3px solid ${s.col};font-size:11px">${s.icon} ${s.name}</button>`).join('')}
      </div>
    </div>
    <div id="sol3-info" class="info-box" style="font-size:12px;min-height:48px">انقر على الحل لتفعيله وشاهد التأثير</div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ما اتفاقية هلسنكي؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">اتفاقية دولية (1985م) أُلزمت فيها الدول بخفض انبعاثات SO₂ بنسبة 30% خلال 10 سنوات. أسهمت في تحسّن ملحوظ في جودة الهواء بأوروبا. نموذج للتعاون البيئي الدولي!</div>
    </div>
  `);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9acidrain'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const pl=S.pollutionLevel;

    // Sky color based on pollution
    c.fillStyle=`rgb(${Math.round(130+100*pl)},${Math.round(170-70*pl)},${Math.round(220-80*pl)})`; c.fillRect(0,0,w,h*0.6);
    // Ground
    c.fillStyle=`rgb(${Math.round(50+60*(1-pl))},${Math.round(80+80*(1-pl))},30)`; c.fillRect(0,h*0.6,w,h*0.4);

    // Cityscape
    const buildings=[{x:0.05,w:0.08,h:0.2},{x:0.18,w:0.1,h:0.3},{x:0.35,w:0.07,h:0.18},{x:0.7,w:0.1,h:0.25},{x:0.85,w:0.08,h:0.15}];
    buildings.forEach(b=>{
      c.fillStyle=`rgba(${Math.round(70+20*(1-pl))},${Math.round(90+20*(1-pl))},${Math.round(110+20*(1-pl))},0.9)`;
      c.fillRect(b.x*w,h*0.6-b.h*h,b.w*w,b.h*h);
      // Windows
      c.fillStyle='rgba(255,220,100,0.4)';
      for(let wi=0;wi<3;wi++) for(let wj=0;wj<4;wj++){
        if(Math.random()>0.3) c.fillRect(b.x*w+wi*b.w*w*0.25+b.w*w*0.1,h*0.6-b.h*h+wj*h*0.04+h*0.01,b.w*w*0.12,h*0.022);
      }
    });

    // Pollution cloud (smog)
    if(pl>0.1){
      c.fillStyle=`rgba(${Math.round(150+50*pl)},${Math.round(130+30*pl)},${Math.round(100)},${pl*0.35})`;
      c.fillRect(0,h*0.3,w,h*0.35);
    }

    // Sun visibility
    const sunAlpha=Math.max(0.1,1-pl*0.8);
    c.globalAlpha=sunAlpha;
    const sunGrd=c.createRadialGradient(w*0.8,h*0.1,0,w*0.8,h*0.1,w*0.12);
    sunGrd.addColorStop(0,'#FFF'); sunGrd.addColorStop(0.4,'#FCD34D'); sunGrd.addColorStop(1,'rgba(0,0,0,0)');
    c.fillStyle=sunGrd; c.beginPath(); c.arc(w*0.8,h*0.1,w*0.12,0,Math.PI*2); c.fill();
    c.globalAlpha=1;

    // Active solutions icons
    S.active.forEach((si,i)=>{
      const sol=solutions[si];
      const ix=w*(0.1+i*0.22), iy=h*0.65;
      c.fillStyle=sol.col+'33'; c.beginPath(); c.arc(ix,iy,w*0.07,0,Math.PI*2); c.fill();
      c.fillStyle=sol.col; c.font=`${Math.max(14,w*0.04)}px Arial`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(sol.icon,ix,iy);
      // Checkmark
      c.fillStyle='#22C55E'; c.font=`bold ${Math.max(10,w*0.02)}px Tajawal`; c.fillText('✅',ix+w*0.05,iy-w*0.05);
    });

    // Pollution meter
    const mX=w*0.05, mY=h*0.05, mW=w*0.9, mH=h*0.06;
    c.fillStyle='rgba(255,255,255,0.3)'; c.beginPath(); c.roundRect(mX,mY,mW,mH,mH/2); c.fill();
    const mGrd=c.createLinearGradient(mX,mY,mX+mW,mY);
    mGrd.addColorStop(0,'#22C55E'); mGrd.addColorStop(0.5,'#F59E0B'); mGrd.addColorStop(1,'#EF4444');
    c.fillStyle=mGrd; c.beginPath(); c.roundRect(mX,mY,mW*pl,mH,mH/2); c.fill();
    _lbl(c,`تلوث الهواء: ${Math.round(pl*100)}%`,mX+mW/2,mY-8,pl>0.5?'#DC2626':'#16A34A',Math.max(9,w*0.02));

    const info=document.getElementById('sol3-info');
    if(info){
      if(S.active.length>0){
        const lastSol=solutions[S.active[S.active.length-1]];
        info.innerHTML=`<strong style="color:${lastSol.col}">${lastSol.icon} ${lastSol.name}:</strong><br>${lastSol.desc}<br>نسبة التلوث انخفضت إلى ${Math.round(pl*100)}%`;
      } else {info.innerHTML='انقر على الحل لتفعيله وشاهد التأثير';}
    }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ 10-4 Tab 1: آلية تأثير الدفيئة — تفاعلي محسّن ══
function simG9Greenhouse1(){
  cancelAnimationFrame(animFrame);
  simState={t:0, co2Ppm:400, photons:[], heat:[], temp:15, year:2024};
  const S=simState;
  window._setCO2=function(v){S.co2Ppm=+v; document.getElementById('co2-ppm').textContent=v;};
  window._simYear=function(d){S.year=Math.max(1850,Math.min(2100,S.year+d)); document.getElementById('gh-year').textContent=S.year; const ppm=Math.round(280+Math.max(0,S.year-1850)*0.95); S.co2Ppm=Math.min(800,ppm); document.getElementById('co2-ppm').textContent=S.co2Ppm;};

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌍 تركيز CO₂: <span id="co2-ppm">400</span> جزء في المليون (ppm)</div>
      <input type="range" min="280" max="800" value="400" oninput="window._setCO2(this.value)" style="width:100%">
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">📅 السنة: <span id="gh-year">2024</span></div>
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn" onclick="window._simYear(-50)">◀ 1850</button>
        <button class="ctrl-btn" onclick="window._simYear(50)">2100 ▶</button>
      </div>
    </div>
    <div class="info-box" style="font-size:12px">
      ☀️ موجات شمسية قصيرة → تخترق الغلاف ✅<br>
      🌡️ موجات حرارية طويلة ← الأرض تُشعّها → غازات الدفيئة تحبسها! 🔄
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ما درجة حرارة الأرض بدون تأثير الدفيئة؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">بدون غازات الدفيئة ستكون -18°C! بمعنى أن تأثير الدفيئة الطبيعي يرفع الحرارة بنحو 33°C — هذا ضروري للحياة. المشكلة في التعزيز الزائد بسبب الأنشطة البشرية.</div>
    </div>
  `);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9greenhouse'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const co2Frac=Math.min(1,(S.co2Ppm-280)/520);
    S.temp=15+co2Frac*8;

    // Space bg
    c.fillStyle='#040A14'; c.fillRect(0,0,w,h);
    for(let i=0;i<60;i++){const sx=(i*197)%w,sy=(i*113)%(h*0.5);c.fillStyle=`rgba(255,255,255,${0.15+0.3*Math.abs(Math.sin(S.t*0.02+i))})`;c.beginPath();c.arc(sx,sy,0.6,0,Math.PI*2);c.fill();}

    // Atmosphere (visible layer)
    const atY=h*0.18, atH=h*0.18;
    const atAlpha=0.08+co2Frac*0.45;
    const atGrd=c.createLinearGradient(0,atY,0,atY+atH);
    atGrd.addColorStop(0,'rgba(100,220,100,0)');
    atGrd.addColorStop(0.5,`rgba(80,${Math.round(200-co2Frac*100)},80,${atAlpha})`);
    atGrd.addColorStop(1,'rgba(100,220,100,0)');
    c.fillStyle=atGrd; c.fillRect(0,atY,w,atH);
    _lbl(c,`CO₂: ${S.co2Ppm} ppm`,w/2,atY+atH/2,'rgba(100,220,100,0.9)',Math.max(8,w*0.018));

    // Sun
    const sunGrd=c.createRadialGradient(w*0.1,h*0.06,0,w*0.1,h*0.06,h*0.06);
    sunGrd.addColorStop(0,'#FFFDE7'); sunGrd.addColorStop(0.4,'#FDD835'); sunGrd.addColorStop(1,'rgba(0,0,0,0)');
    c.fillStyle=sunGrd; c.beginPath(); c.arc(w*0.1,h*0.06,h*0.06,0,Math.PI*2); c.fill();
    // Sun rays
    for(let r=0;r<8;r++){const ra=r/8*Math.PI*2; c.strokeStyle='rgba(253,216,53,0.3)'; c.lineWidth=1.5; c.beginPath(); c.moveTo(w*0.1+Math.cos(ra)*h*0.06,h*0.06+Math.sin(ra)*h*0.06); c.lineTo(w*0.1+Math.cos(ra)*h*0.1,h*0.06+Math.sin(ra)*h*0.1); c.stroke();}

    // Earth
    const er=w*0.2, ecx=w/2, ecy=h*0.75;
    const heatR=Math.round(20+co2Frac*60), heatAdj=Math.round(co2Frac*40);
    const eGrd=c.createRadialGradient(ecx-er*0.2,ecy-er*0.3,er*0.05,ecx,ecy,er);
    eGrd.addColorStop(0,`rgb(${60+heatR},${Math.max(50,140-heatAdj*2)},${Math.max(20,80-heatAdj)})`);
    eGrd.addColorStop(0.6,`rgb(${30+heatR},${Math.max(30,100-heatAdj*2)},${Math.max(10,60-heatAdj)})`);
    eGrd.addColorStop(1,`rgb(${20+heatR},${Math.max(20,60-heatAdj)},${Math.max(10,40-heatAdj)})`);
    c.fillStyle=eGrd; c.beginPath(); c.arc(ecx,ecy,er,0,Math.PI*2); c.fill();
    // Ocean (gets smaller)
    c.fillStyle=`rgba(${Math.round(30+heatAdj)},${Math.round(100-heatAdj)},${Math.round(180-heatAdj*2)},0.7)`;
    c.beginPath(); c.arc(ecx-er*0.2,ecy-er*0.1,er*Math.max(0.3,0.5-co2Frac*0.2),0,Math.PI*2); c.fill();
    c.strokeStyle='rgba(100,180,255,0.2)'; c.lineWidth=3; c.beginPath(); c.arc(ecx,ecy,er,0,Math.PI*2); c.stroke();

    // Solar photons (yellow, go down)
    if(S.t%5===0) S.photons.push({x:w*0.1+Math.random()*20,y:h*0.12,vx:1.5+Math.random(),vy:2.5+Math.random(),a:0.9,type:'solar'});
    // Heat photons from earth (red/orange, go up, bounce back)
    if(S.t%6===0) S.heat.push({x:ecx+(Math.random()-0.5)*er*1.4,y:ecy-er*0.9,vx:(Math.random()-0.5)*0.8,vy:-2-Math.random(),a:0.85,bounces:0});

    S.photons=S.photons.filter(p=>p.a>0.05&&p.y<h&&p.x<w);
    S.heat=S.heat.filter(p=>p.a>0.05&&p.bounces<3);
    S.photons.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.a-=0.018; c.globalAlpha=p.a;c.fillStyle='#FDD835';c.beginPath();c.arc(p.x,p.y,3,0,Math.PI*2);c.fill();});
    S.heat.forEach(p=>{
      if(p.y<=atY+atH&&!p.bounced&&Math.random()<co2Frac*0.75){p.vy=Math.abs(p.vy)*0.7;p.bounces++;p.bounced=true;} else {p.bounced=false;}
      p.x+=p.vx; p.y+=p.vy; p.a-=0.01;
      c.globalAlpha=p.a; c.fillStyle=`hsl(${Math.round(20-co2Frac*20)},100%,55%)`; c.beginPath(); c.arc(p.x,p.y,2.5,0,Math.PI*2); c.fill();
    });
    c.globalAlpha=1;

    // Temperature gauge
    const tgX=w*0.04, tgY=h*0.04, tgH=h*0.25, tgW=w*0.06;
    c.fillStyle='rgba(255,255,255,0.1)'; c.beginPath(); c.roundRect(tgX,tgY,tgW,tgH,tgW/3); c.fill();
    c.strokeStyle='rgba(255,255,255,0.3)'; c.lineWidth=1; c.beginPath(); c.roundRect(tgX,tgY,tgW,tgH,tgW/3); c.stroke();
    const tempFrac=(S.temp-(-18))/(35-(-18));
    const tempGrd=c.createLinearGradient(tgX,tgY+tgH,tgX,tgY);
    tempGrd.addColorStop(0,'#3B82F6'); tempGrd.addColorStop(0.4,'#22C55E'); tempGrd.addColorStop(0.7,'#F59E0B'); tempGrd.addColorStop(1,'#EF4444');
    c.fillStyle=tempGrd; c.beginPath(); c.roundRect(tgX+2,tgY+tgH*(1-tempFrac),tgW-4,tgH*tempFrac,tgW/3-2); c.fill();
    _lbl(c,`${S.temp.toFixed(1)}°C`,tgX+tgW/2,tgY-8,'#FCD34D',Math.max(8,w*0.018));

    // Year + CO2 info
    _lbl(c,`📅 ${S.year}م`,w*0.85,h*0.04,'rgba(255,255,255,0.9)',Math.max(9,w*0.02));

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ 10-4 Tab 2: غازات الدفيئة ومصادرها — محسّن ══
function simG9Greenhouse2(){
  cancelAnimationFrame(animFrame);
  const ghGases=[
    {name:'CO₂',  full:'ثاني أكسيد الكربون', src:'حرق الوقود الأحفوري + إزالة الغابات', pwr:1,   pct:76, col:'#EF4444', icon:'🏭'},
    {name:'CH₄',  full:'الميثان',             src:'المواشي + مكبّات النفايات + مناجم الفحم', pwr:20,  pct:16, col:'#F97316', icon:'🐄'},
    {name:'N₂O',  full:'أكسيد ثنائي النيتروجين',src:'الأسمدة الزراعية + حرق الكتلة الحيوية',pwr:298, pct:6,  col:'#A855F7', icon:'🌾'},
    {name:'H₂O',  full:'بخار الماء',          src:'التبخر الطبيعي من المحيطات',            pwr:1,   pct:36, col:'#60A5FA', icon:'🌊'},
    {name:'CFCs', full:'مركبات الكلوروفلوروكربون',src:'أجهزة تبريد قديمة + رذاذ الأيروسول',pwr:5000,pct:2,  col:'#14B8A6', icon:'❄️'},
  ];
  simState={t:0, sel:0, bubbles:[]};
  const S=simState;
  for(let i=0;i<30;i++) S.bubbles.push({x:Math.random(),y:Math.random(),r:2+Math.random()*6,vy:-0.003-Math.random()*0.002,type:Math.floor(Math.random()*5)});
  window._ghSel2=function(i){S.sel=i;document.querySelectorAll('[id^="gh2b-"]').forEach((b,j)=>b.classList.toggle('active',j===i));};

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🏭 اختر غاز دفيئة</div>
      <div class="ctrl-btns-grid">
        ${ghGases.map((g,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="gh2b-${i}" onclick="window._ghSel2(${i})" style="border-right:3px solid ${g.col};font-size:11px">${g.icon} ${g.name}</button>`).join('')}
      </div>
    </div>
    <div id="gh2b-info" class="info-box" style="font-size:12px;min-height:56px;text-align:center">اختر غازاً لرؤية تفاصيله</div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا CH₄ أخطر من CO₂ رغم كميته الأقل؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">قوة تأثير الميثان كغاز دفيئة 20 مرة أعلى من CO₂ لكل وحدة كتلة. لكن CO₂ يبقى في الغلاف لـ 300-1000 سنة بينما CH₄ يتحلل في 12 سنة — كلاهما خطر لأسباب مختلفة!</div>
    </div>
  `);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9greenhouse'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const g=ghGases[S.sel||0];

    // Update info
    const el=document.getElementById('gh2b-info');
    if(el) el.innerHTML=`<strong style="color:${g.col}">${g.icon} ${g.name} — ${g.full}</strong><br>المصدر: ${g.src}<br>قوة التأثير: <strong style="color:${g.col}">${g.pwr}×</strong> مقارنةً بـ CO₂ | المساهمة: ${g.pct}%`;

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#0F172A'); bg.addColorStop(1,'#1E293B');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Floating gas bubbles
    S.bubbles.forEach(b=>{
      b.y+=b.vy; if(b.y<-0.05) b.y=1.05;
      const gg=ghGases[b.type];
      const isSel=(b.type===S.sel);
      c.globalAlpha=isSel?0.8:0.25;
      c.fillStyle=gg.col; c.beginPath(); c.arc(b.x*w,b.y*h,b.r*(isSel?1.5:1),0,Math.PI*2); c.fill();
    });
    c.globalAlpha=1;

    // Donut chart
    const cx2=w/2, cy2=h*0.36, r=Math.min(w,h)*0.22, innerR=r*0.48;
    let startA=-Math.PI/2;
    const totalPct=ghGases.reduce((a,gg)=>a+gg.pct,0);
    ghGases.forEach((gg,i)=>{
      const sa=(gg.pct/totalPct)*2*Math.PI;
      const isSel=(S.sel===i);
      const rr=isSel?r*1.1:r;
      const midA=startA+sa/2;
      c.beginPath(); c.moveTo(cx2+Math.cos(startA)*innerR,cy2+Math.sin(startA)*innerR);
      c.arc(cx2,cy2,rr,startA,startA+sa);
      c.arc(cx2,cy2,innerR,startA+sa,startA,true);
      c.closePath();
      c.fillStyle=gg.col+(isSel?'FF':'88'); c.fill();
      c.strokeStyle='#0F172A'; c.lineWidth=2; c.stroke();
      if(gg.pct>5){
        const lx=cx2+Math.cos(midA)*(r*0.73),ly=cy2+Math.sin(midA)*(r*0.73);
        c.fillStyle='#fff'; c.font=`bold ${Math.max(7,w*0.016)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(gg.name,lx,ly);
      }
      startA+=sa;
    });
    // Center icon
    c.font=`${Math.max(18,w*0.05)}px Arial`; c.textAlign='center'; c.textBaseline='middle'; c.fillText(g.icon,cx2,cy2);

    // Power bar
    const py=h*0.68, ph=h*0.05, pw=w*0.88, maxPwr=5000;
    _lbl(c,'قوة التأثير الإشعاعي (× CO₂)',w/2,py-10,'#94A3B8',Math.max(8,w*0.016));
    c.fillStyle='rgba(255,255,255,0.07)'; c.beginPath(); c.roundRect(w*0.06,py,pw,ph,ph/2); c.fill();
    const pGrd=c.createLinearGradient(w*0.06,py,w*0.06+pw,py);
    pGrd.addColorStop(0,g.col+'CC'); pGrd.addColorStop(1,g.col);
    c.fillStyle=pGrd; c.beginPath(); c.roundRect(w*0.06,py,pw*(Math.min(g.pwr,maxPwr)/maxPwr),ph,ph/2); c.fill();
    _lbl(c,`${g.pwr === 1?'1×':g.pwr+'× CO₂'}`,w/2,py+ph+h*0.03,g.col,Math.max(10,w*0.022));

    // Timeline bar
    const tY=h*0.82;
    _lbl(c,'مساهمة غازات الدفيئة في الاحترار العالمي',w/2,tY-8,'#94A3B8',Math.max(8,w*0.016));
    let bx=w*0.04;
    ghGases.forEach(gg=>{
      const bw=w*0.9*(gg.pct/totalPct);
      c.fillStyle=gg.col+(S.sel===ghGases.indexOf(gg)?'FF':'AA');
      c.fillRect(bx,tY,bw,h*0.05);
      if(bw>w*0.07){c.fillStyle='#fff'; c.font=`${Math.max(7,w*0.014)}px Tajawal`; c.textAlign='center'; c.fillText(gg.name,bx+bw/2,tY+h*0.028);}
      bx+=bw;
    });

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ 10-4 Tab 3: التغيُّرات المناخية وحلولها ══
function simG9Greenhouse3(){
  cancelAnimationFrame(animFrame);
  simState={t:0, year:1850, speed:1, iceLevel:1, seaLevel:0, co2Trend:280, events:[]};
  const S=simState;
  const milestones=[
    {year:1750,label:'الثورة الصناعية',co2:280,temp:13.8,event:'بدأ حرق الفحم على نطاق واسع'},
    {year:1900,label:'السيارات',co2:295,temp:14.0,event:'انتشار المحركات الاحتراقية'},
    {year:1950,label:'النمو الصناعي',co2:310,temp:14.2,event:'تضاعف الإنتاج الصناعي العالمي'},
    {year:1988,label:'تحذير العلماء',co2:353,temp:14.6,event:'IPCC: الهيئة الدولية لتغير المناخ'},
    {year:2015,label:'اتفاقية باريس',co2:400,temp:15.1,event:'هدف: أقل من 2°C احترار'},
    {year:2024,label:'اليوم',co2:422,temp:15.4,event:'أعلى مستوى CO₂ منذ 3 مليون سنة!'},
    {year:2050,label:'هدف الحياد الكربوني',co2:440,temp:15.8,event:'إذا تصرفنا الآن: تثبيت درجة الحرارة'},
    {year:2100,label:'المستقبل (سيناريو أسوأ)',co2:800,temp:19,event:'ارتفاع 4°C — كوارث مناخية'},
  ];
  window._setSpeed=function(s){S.speed=s;};

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⏩ سرعة الزمن</div>
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn" onclick="window._setSpeed(0.5)">× ½</button>
        <button class="ctrl-btn active" onclick="window._setSpeed(1)">× 1</button>
        <button class="ctrl-btn" onclick="window._setSpeed(3)">× 3</button>
        <button class="ctrl-btn" onclick="simState.year=1750">↺ 1750م</button>
      </div>
    </div>
    <div id="gh3-milestone" class="info-box" style="font-size:12px;min-height:56px;text-align:center">اشاهد التغيُّرات عبر الزمن</div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ما أهداف اتفاقية باريس 2015م؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">وقّعت 196 دولة على تحديد الاحترار العالمي بـ 1.5-2°C فوق مستويات ما قبل الصناعة. يستلزم ذلك خفض انبعاثات CO₂ بـ 45% بحلول 2030 والوصول لـ "الحياد الكربوني" بحلول 2050.</div>
    </div>
  `);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9greenhouse'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    S.year=Math.min(2100,S.year+(S.speed*0.1));
    const yr=S.year;
    const progress=(yr-1750)/(2100-1750);

    // Interpolate climate data
    let m1=milestones[0],m2=milestones[milestones.length-1];
    for(let i=0;i<milestones.length-1;i++){if(yr>=milestones[i].year&&yr<milestones[i+1].year){m1=milestones[i];m2=milestones[i+1];break;}}
    const mFrac=m1.year===m2.year?0:(yr-m1.year)/(m2.year-m1.year);
    const co2=m1.co2+(m2.co2-m1.co2)*mFrac;
    const temp=m1.temp+(m2.temp-m1.temp)*mFrac;
    const iceFrac=Math.max(0,1-(co2-280)/550);
    const seaRise=(1-iceFrac)*30;

    // Sky color based on temp
    const heatFrac=(temp-13.8)/5;
    c.fillStyle=`rgb(${Math.round(100+100*heatFrac)},${Math.round(150-50*heatFrac)},${Math.round(200-100*heatFrac)})`; c.fillRect(0,0,w,h*0.5);
    // CO2 haze
    c.fillStyle=`rgba(150,${Math.round(180-co2*0.1)},100,${Math.min(0.4,(co2-280)/600)})`; c.fillRect(0,0,w,h*0.5);

    // Arctic ice
    const iceW=w*(0.3+iceFrac*0.4), iceH=h*0.08*iceFrac;
    c.fillStyle=`rgba(220,240,255,${0.5+iceFrac*0.4})`; c.beginPath(); c.ellipse(w/2,h*0.35,iceW/2,iceH,0,0,Math.PI*2); c.fill();
    c.strokeStyle='rgba(180,220,250,0.6)'; c.lineWidth=1.5; c.beginPath(); c.ellipse(w/2,h*0.35,iceW/2,iceH,0,0,Math.PI*2); c.stroke();
    _lbl(c,`الجليد القطبي: ${Math.round(iceFrac*100)}%`,w/2,h*0.35,'#1E3A5F',Math.max(8,w*0.017));

    // Sea level
    const seaY=h*0.5-seaRise*h*0.003;
    c.fillStyle=`rgba(${Math.round(30+heatFrac*50)},${Math.round(100-heatFrac*40)},${Math.round(180-heatFrac*60)},0.85)`; c.fillRect(0,seaY,w,h-seaY);
    c.fillStyle='rgba(255,255,255,0.15)'; c.fillRect(0,seaY,w,h*0.01);
    _lbl(c,`ارتفاع البحر: +${seaRise.toFixed(1)} سم`,w/2,seaY+h*0.04,'#E0F2FE',Math.max(8,w*0.018));

    // Coastline effects
    if(seaRise>15){
      c.fillStyle='rgba(255,255,255,0.1)'; c.fillRect(0,seaY,w*0.2,h*0.06); // flooded coast
      _lbl(c,'⚠️ فيضان ساحلي',w*0.1,seaY+h*0.04,'#FCD34D',Math.max(8,w*0.016));
    }

    // Temperature gauge  
    const tgX=w*0.82, tgY=h*0.04, tgH=h*0.45, tgW=w*0.07;
    c.fillStyle='rgba(0,0,0,0.3)'; c.beginPath(); c.roundRect(tgX,tgY,tgW,tgH,tgW/2); c.fill();
    const tFrac=(temp-13.5)/6;
    const tGrd=c.createLinearGradient(tgX,tgY+tgH,tgX,tgY);
    tGrd.addColorStop(0,'#3B82F6'); tGrd.addColorStop(0.4,'#22C55E'); tGrd.addColorStop(0.7,'#F59E0B'); tGrd.addColorStop(1,'#EF4444');
    c.fillStyle=tGrd; c.beginPath(); c.roundRect(tgX+2,tgY+tgH*(1-Math.min(1,tFrac)),tgW-4,tgH*Math.min(1,tFrac),tgW/2-2); c.fill();
    _lbl(c,`${temp.toFixed(1)}°C`,tgX+tgW/2,tgY-8,'#FCD34D',Math.max(8,w*0.018));

    // Timeline
    const tlY=h*0.86, tlW=w*0.85, tlX=w*0.07;
    c.strokeStyle='rgba(255,255,255,0.2)'; c.lineWidth=2; c.beginPath(); c.moveTo(tlX,tlY); c.lineTo(tlX+tlW,tlY); c.stroke();
    const progX=tlX+tlW*progress;
    c.fillStyle='#FCD34D'; c.beginPath(); c.arc(progX,tlY,5,0,Math.PI*2); c.fill();
    // Year label
    _lbl(c,`📅 ${Math.floor(yr)}م`,w/2,tlY+h*0.04,'#E2E8F0',Math.max(9,w*0.02));
    // CO2 label
    _lbl(c,`CO₂: ${Math.round(co2)} ppm`,w/2,h*0.05,`hsl(${Math.round(120-heatFrac*120)},80%,60%)`,Math.max(9,w*0.022));

    // Milestone markers
    milestones.forEach(m=>{
      const mx=tlX+tlW*((m.year-1750)/350);
      c.fillStyle=yr>=m.year?'#FCD34D':'rgba(255,255,255,0.2)';
      c.beginPath(); c.arc(mx,tlY,3,0,Math.PI*2); c.fill();
    });

    // Current milestone info
    const curM=[...milestones].reverse().find(m=>yr>=m.year)||milestones[0];
    const mEl=document.getElementById('gh3-milestone');
    if(mEl) mEl.innerHTML=`<strong style="color:#FCD34D">📍 ${curM.label}</strong><br>${curM.event}<br>CO₂: ${Math.round(co2)} ppm | 🌡️ ${temp.toFixed(1)}°C`;

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ 10-5 Tab 1: التفكك الحراري لـ CaCO₃ — فرن تفاعلي ══
function simG9Limestone1(){
  cancelAnimationFrame(animFrame);
  simState={t:0, temp:20, heating:false, reaction:0, co2Bubbles:[], caoBalls:[]};
  const S=simState;
  window._toggleHeat=function(){S.heating=!S.heating; document.getElementById('heat-btn').textContent=S.heating?'🔥 إيقاف التسخين':'🔥 تسخين الفرن';};
  window._setTemp=function(v){S.temp=+v; document.getElementById('ls1-temp').textContent=v+'°C';};

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌡️ درجة الحرارة: <span id="ls1-temp">20</span>°C</div>
      <input type="range" min="20" max="1000" value="20" oninput="window._setTemp(this.value)" style="width:100%">
    </div>
    <div class="ctrl-section">
      <button class="ctrl-btn action" id="heat-btn" onclick="window._toggleHeat()">🔥 تسخين الفرن</button>
      <button class="ctrl-btn" onclick="simState.temp=20;simState.reaction=0;simState.co2Bubbles=[];simState.caoBalls=[];document.querySelector('input[type=range]').value=20;document.getElementById('ls1-temp').textContent='20°C'">↺ إعادة تعيين</button>
    </div>
    <div id="ls1-status" class="info-box" style="font-size:12px;text-align:center;min-height:52px">
      CaCO₃(s) → CaO(s) + CO₂(g)<br>يحتاج إلى حرارة أعلى من 840°C
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا يُستخدم الجير الحيّ CaO في البناء؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">CaO + H₂O → Ca(OH)₂ (الجير المطفأ) يتفاعل مع CO₂ الهواء ليُكوِّن CaCO₃ صلباً — هذا أساس ملاط البناء التقليدي! بمرور الوقت يتصلّب ويُقوِّي الجدران.</div>
    </div>
  `);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9limestone'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    if(S.heating) S.temp=Math.min(1000,S.temp+2);
    const reactionFrac=Math.max(0,(S.temp-840)/(1000-840));
    S.reaction=Math.min(1,S.reaction+reactionFrac*0.005);

    // Lab background
    c.fillStyle='#1A1A2E'; c.fillRect(0,0,w,h);
    // Kiln / furnace
    const kx=w*0.2, ky=h*0.2, kw=w*0.6, kh=h*0.55;
    const kGrd=c.createLinearGradient(kx,ky,kx,ky+kh);
    kGrd.addColorStop(0,'#3D1A00'); kGrd.addColorStop(1,'#1A0A00');
    c.fillStyle=kGrd; c.beginPath(); c.roundRect(kx,ky,kw,kh,12); c.fill();
    // Glow inside
    if(S.temp>200){
      const intensity=Math.min(1,(S.temp-200)/600);
      const grd=c.createRadialGradient(w/2,ky+kh*0.6,kh*0.1,w/2,ky+kh*0.6,kh*0.6);
      grd.addColorStop(0,`rgba(255,${Math.round(200-intensity*150)},0,${intensity*0.8})`);
      grd.addColorStop(0.6,`rgba(255,${Math.round(100-intensity*80)},0,${intensity*0.3})`);
      grd.addColorStop(1,'rgba(0,0,0,0)');
      c.fillStyle=grd; c.beginPath(); c.roundRect(kx+4,ky+4,kw-8,kh-8,10); c.fill();
    }
    c.strokeStyle=S.temp>840?`rgba(255,${Math.round(200-S.reaction*150)},0,0.6)`:'#5A3010'; c.lineWidth=3; c.beginPath(); c.roundRect(kx,ky,kw,kh,12); c.stroke();

    // CaCO3 rocks in kiln
    const numRocks=Math.round(8*(1-S.reaction));
    for(let i=0;i<numRocks;i++){
      const rx=kx+kw*0.15+i*(kw*0.08), ry=ky+kh*0.65;
      c.fillStyle=`rgb(${Math.round(200+S.temp*0.05)},${Math.round(190)},${Math.round(180)})`;
      c.beginPath(); c.arc(rx,ry,kh*0.06,0,Math.PI*2); c.fill();
      c.strokeStyle='rgba(255,255,255,0.2)'; c.lineWidth=1; c.beginPath(); c.arc(rx,ry,kh*0.06,0,Math.PI*2); c.stroke();
      c.fillStyle='rgba(0,0,0,0.5)'; c.font=`${Math.max(7,w*0.015)}px Tajawal`; c.textAlign='center'; c.fillText('CaCO₃',rx,ry+kh*0.1);
    }

    // CaO product forming
    if(S.reaction>0.1){
      const numCao=Math.round(8*S.reaction);
      for(let i=0;i<numCao;i++){
        const rx=kx+kw*0.15+i*(kw*0.08), ry=ky+kh*0.5;
        const ir=Math.min(1,(S.reaction-0.1)*5);
        c.fillStyle=`rgba(${Math.round(240+15*ir)},${Math.round(220+15*ir)},${Math.round(180+20*ir)},${ir})`;
        c.beginPath(); c.arc(rx,ry,kh*0.055,0,Math.PI*2); c.fill();
        c.fillStyle=`rgba(0,0,0,${ir*0.5})`; c.font=`${Math.max(6,w*0.013)}px Tajawal`; c.textAlign='center'; c.fillText('CaO',rx,ry+kh*0.09);
      }
    }

    // CO2 bubbles
    if(S.reaction>0&&S.t%8===0) S.co2Bubbles.push({x:kx+Math.random()*kw,y:ky+kh*0.4,vy:-1.5-Math.random(),r:4+Math.random()*5,life:1});
    S.co2Bubbles=S.co2Bubbles.filter(b=>b.life>0.05&&b.y>0);
    S.co2Bubbles.forEach(b=>{b.y+=b.vy;b.x+=(Math.random()-0.5)*0.5;b.life-=0.015;
      c.globalAlpha=b.life*0.7; c.fillStyle='#22C55E'; c.beginPath(); c.arc(b.x,b.y,b.r,0,Math.PI*2); c.fill();
      c.strokeStyle='rgba(34,197,94,0.4)'; c.lineWidth=1; c.beginPath(); c.arc(b.x,b.y,b.r,0,Math.PI*2); c.stroke();
      if(b.y<ky&&b.life>0.4){c.fillStyle='rgba(34,197,94,0.6)'; c.font=`${Math.max(7,w*0.014)}px Tajawal`; c.textAlign='center'; c.fillText('CO₂',b.x,b.y-8);}
    });
    c.globalAlpha=1;

    // Temperature display
    const tempFrac=S.temp/1000;
    const tCol=S.temp<400?'#60A5FA':S.temp<840?'#F59E0B':'#EF4444';
    _lbl(c,`🌡️ ${Math.round(S.temp)}°C`,w/2,ky-h*0.04,tCol,Math.max(10,w*0.025));
    // Reaction progress bar
    c.fillStyle='rgba(255,255,255,0.1)'; c.fillRect(kx,ky+kh+h*0.02,kw,h*0.04);
    c.fillStyle=`hsl(${Math.round(120*(1-S.reaction))},80%,55%)`; c.fillRect(kx,ky+kh+h*0.02,kw*S.reaction,h*0.04);
    _lbl(c,`تفاعل التحلل: ${Math.round(S.reaction*100)}%`,w/2,ky+kh+h*0.06,'#E2E8F0',Math.max(9,w*0.018));

    const st=document.getElementById('ls1-status');
    if(st) st.innerHTML=S.temp<840
      ?`🌡️ ${Math.round(S.temp)}°C — أقل من حرارة التفاعل (840°C)<br>لا تفاعل بعد — ارفع الحرارة!`
      :`✅ التفاعل بدأ! CaCO₃ → CaO + CO₂<br>التحلل: ${Math.round(S.reaction*100)}% | CO₂ مُطلَق!`;

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ 10-5 Tab 2: الجير الحيّ ومنتجاته ══
function simG9Limestone2(){
  cancelAnimationFrame(animFrame);
  const products=[
    {name:'الجير المطفأ',     formula:'Ca(OH)₂',     src:'CaO + H₂O',         use:'معالجة مياه الصرف + طلاء الجدران',col:'#E8E8E8',rx:'CaO + H₂O → Ca(OH)₂ + حرارة',pH:12,icon:'🏗️'},
    {name:'ماء الجير',        formula:'Ca(OH)₂(aq)', src:'ذوبان Ca(OH)₂ في الماء',use:'الكشف عن CO₂ في المختبر',col:'#E3F2FD',rx:'Ca(OH)₂ + CO₂ → CaCO₃↓ (عكر)',pH:11,icon:'🧪'},
    {name:'كربونات الكالسيوم',formula:'CaCO₃',       src:'Ca(OH)₂ + CO₂',use:'الحجر الجيري — بناء + جير تربة',col:'#ECEFF1',rx:'Ca(OH)₂ + CO₂ → CaCO₃↓ + H₂O',pH:9,icon:'🪨'},
  ];
  simState={t:0, sel:0, co2Test:false, particles:[]};
  const S=simState;
  window._lsSel2=function(i){S.sel=i;S.co2Test=false;S.particles=[];document.querySelectorAll('[id^="ls2b-"]').forEach((b,j)=>b.classList.toggle('active',j===i));};
  window._addCO2=function(){S.co2Test=true; S.particles=[]; for(let i=0;i<20;i++) S.particles.push({x:Math.random(),y:Math.random()*0.4,vx:(Math.random()-0.5)*0.003,vy:0.002,type:'co2'});};

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🏗️ منتجات الحجر الجيري</div>
      <div class="ctrl-btns-grid">
        ${products.map((p,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="ls2b-${i}" onclick="window._lsSel2(${i})">${p.icon} ${p.formula}</button>`).join('')}
      </div>
    </div>
    <div id="ls2b-info" class="info-box" style="font-size:12px;min-height:64px;text-align:center">اختر منتجاً</div>
    <div class="ctrl-section" style="margin-top:8px">
      <button class="ctrl-btn action" onclick="window._addCO2()">💨 مرِّر CO₂ في ماء الجير</button>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ كيف يُستخدم ماء الجير لاكتشاف CO₂؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">Ca(OH)₂ + CO₂ → CaCO₃↓ + H₂O. الراسب الأبيض CaCO₃ يجعل المحلول عكراً — هذا دليل على CO₂! زيادة CO₂ تُذيب الراسب: CaCO₃ + CO₂ + H₂O → Ca(HCO₃)₂ (المحلول يصفّ مجدداً).</div>
    </div>
  `);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9limestone'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const p=products[S.sel||0];

    const el=document.getElementById('ls2b-info');
    if(el) el.innerHTML=`<strong style="color:#795548">${p.icon} ${p.name} (${p.formula})</strong><br>المصدر: ${p.src}<br>الاستخدام: ${p.use}<br><code style="background:rgba(0,0,0,0.05);padding:2px 6px;border-radius:4px">${p.rx}</code><br>pH ≈ ${p.pH}`;

    // Lab background
    c.fillStyle='#F8F6F0'; c.fillRect(0,0,w,h);
    c.fillStyle='#8B6E4E'; c.fillRect(0,h*0.85,w,h*0.15);
    c.fillStyle='#9A7D5E'; c.fillRect(0,h*0.85,w,h*0.02);

    // Flow diagram
    _lbl(c,'سلسلة تحوّلات الحجر الجيري',w/2,h*0.07,'#1E2D3D',Math.max(11,w*0.024));
    const nodes=[
      {x:w*0.5, y:h*0.17,label:'CaCO₃',sub:'الحجر الجيري',col:'#ECEFF1',border:'#B0BEC5'},
      {x:w*0.5, y:h*0.33,label:'CaO',  sub:'الجير الحيّ',  col:'#FFF9C4',border:'#F57F17'},
      {x:w*0.28,y:h*0.52,label:'Ca(OH)₂',sub:'الجير المطفأ',col:'#E8F5E9',border:'#4CAF50'},
      {x:w*0.72,y:h*0.52,label:'Ca(OH)₂\n(aq)',sub:'ماء الجير',col:'#E3F2FD',border:'#2196F3'},
      {x:w*0.5, y:h*0.7, label:'CaCO₃↓',sub:'راسب أبيض',  col:'#FAFAFA',border:'#90A4AE'},
    ];
    const arrows=[[0,1,'حرارة ≥840°C 🔥'],[1,2,'+ H₂O 💧'],[2,3,'+ H₂O زائد'],[2,4,'+ CO₂'],[3,4,'+ CO₂']];
    arrows.forEach(([from,to,lbl])=>{
      const nx1=nodes[from].x,ny1=nodes[from].y+h*0.042;
      const nx2=nodes[to].x,  ny2=nodes[to].y-h*0.042;
      c.strokeStyle='rgba(100,80,60,0.3)'; c.lineWidth=1.5;
      c.setLineDash([4,3]); c.beginPath(); c.moveTo(nx1,ny1); c.lineTo(nx2,ny2); c.stroke(); c.setLineDash([]);
      const fs=Math.max(6,w*0.013);
      c.fillStyle='#7D6E5A'; c.font=`${fs}px Tajawal`; c.textAlign='center';
      c.fillText(lbl,(nx1+nx2)/2+(nx2>nx1?w*0.05:-w*0.05),(ny1+ny2)/2);
    });

    nodes.forEach((n,i)=>{
      const isSel=(p.formula.includes(n.label.replace('↓','').replace('\n(aq)','').replace('(aq)',''))||
                  (i===1&&S.sel===0&&false)||(i===2&&S.sel===0)||(i===3&&S.sel===1)||(i===4&&(S.sel===1||S.sel===2)));
      const rr=Math.min(w,h)*0.065;
      c.fillStyle=isSel?n.col:n.col+'88';
      c.beginPath(); c.arc(n.x,n.y,rr,0,Math.PI*2); c.fill();
      c.strokeStyle=isSel?n.border:n.border+'55'; c.lineWidth=isSel?2.5:1.5;
      c.beginPath(); c.arc(n.x,n.y,rr,0,Math.PI*2); c.stroke();
      const lbl=n.label.replace('\n(aq)','');
      c.fillStyle=isSel?'#1A2A3A':'#546E7A'; c.font=`bold ${Math.max(8,w*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(lbl,n.x,n.y);
      c.fillStyle='#6D4C41'; c.font=`${Math.max(6,w*0.013)}px Tajawal`; c.fillText(n.sub,n.x,n.y+rr+h*0.025);
    });

    // CO2 test particles
    if(S.co2Test){
      S.particles.forEach(b=>{
        b.y+=b.vy; if(b.y>0.5){b.type='react';b.vy=0;b.vx=0;}
        c.fillStyle=b.type==='co2'?'rgba(34,197,94,0.7)':'rgba(220,220,220,0.9)';
        c.beginPath(); c.arc(b.x*w,b.y*h,4,0,Math.PI*2); c.fill();
      });
      // Cloudiness effect in node 3
      const n=nodes[3];
      const cloudAlpha=Math.min(0.5,S.particles.filter(b=>b.type==='react').length*0.02);
      c.fillStyle=`rgba(200,200,200,${cloudAlpha})`;
      c.beginPath(); c.arc(n.x,n.y,Math.min(w,h)*0.065,0,Math.PI*2); c.fill();
      if(cloudAlpha>0.3) _lbl(c,'تعكُّر! ✅',n.x,n.y+h*0.08,'#EF4444',Math.max(8,w*0.018));
    }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ 10-5 Tab 3: معالجة التربة الحمضية — مختبر الزراعة ══
function simG9Limestone3(){
  cancelAnimationFrame(animFrame);
  simState={t:0, pH:4.0, limeAdded:0, crops:[], rainTimer:0, raining:false, drops:[]};
  const S=simState;
  for(let i=0;i<9;i++) S.crops.push({x:0.06+i*0.1, growth:0, withered:false});
  window._addLime=function(amt){
    S.pH=Math.min(7.5,+(S.pH+amt).toFixed(1));
    S.limeAdded++;
    document.getElementById('ls3-ph').textContent=S.pH.toFixed(1);
    for(let i=0;i<5;i++) S.drops.push({x:Math.random(),y:-0.05,vy:0.02,type:'lime'});
  };
  window._addRain=function(){S.raining=true; S.rainTimer=100; S.pH=Math.max(3.5,S.pH-0.5); document.getElementById('ls3-ph').textContent=S.pH.toFixed(1);};

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌱 pH التربة: <span id="ls3-ph">4.0</span></div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn action" onclick="window._addLime(0.5)">🪨 أضِف جيراً (0.5)</button>
        <button class="ctrl-btn action" onclick="window._addLime(1.0)">🪨🪨 جير مضاعف (1.0)</button>
        <button class="ctrl-btn" onclick="window._addRain()">🌧️ مطر حمضي (pH 4)</button>
        <button class="ctrl-btn reset" onclick="simState.pH=4.0;simState.limeAdded=0;simState.crops.forEach(c=>{c.growth=0;c.withered=false;});document.getElementById('ls3-ph').textContent='4.0'">↺ إعادة</button>
      </div>
    </div>
    <div id="ls3-status" class="info-box" style="font-size:12px;text-align:center;min-height:44px"></div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ما النطاق المثالي لـ pH التربة الزراعية؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">معظم المحاصيل: pH 6.0–7.0. الحموضة الشديدة (< 5) تُطلق Al³⁺ وMn²⁺ السامَّين. القلوية الزائدة (> 7.5) تُعيق امتصاص الحديد والزنك. الجير يوازن ويُصحح!</div>
    </div>
  `);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9limestone'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    if(S.rainTimer>0) S.rainTimer--;
    else S.raining=false;
    const pH=S.pH;
    const healthFrac=pH<5?0:(pH<5.5?0.2:(pH<6?0.5:(pH<7.5?1:0.7)));
    const acidFrac=Math.max(0,(5.5-pH)/2);

    // Sky
    const skyR=Math.round(100+acidFrac*80), skyG=Math.round(150+healthFrac*40-acidFrac*50), skyB=Math.round(200+healthFrac*30-acidFrac*60);
    c.fillStyle=`rgb(${skyR},${skyG},${skyB})`; c.fillRect(0,0,w,h*0.45);
    // Sun
    if(pH>=5.5){c.fillStyle=`rgba(255,220,50,${healthFrac*0.8})`; c.beginPath(); c.arc(w*0.85,h*0.12,h*0.07*healthFrac,0,Math.PI*2); c.fill();}

    // Ground layers
    c.fillStyle=`rgb(${Math.round(60+healthFrac*40)},${Math.round(40+healthFrac*30)},20)`; c.fillRect(0,h*0.45,w,h*0.55);
    c.fillStyle=`rgb(${Math.round(80+healthFrac*50)},${Math.round(55+healthFrac*35)},25)`; c.fillRect(0,h*0.45,w,h*0.08);
    // Soil texture
    for(let i=0;i<15;i++){const gx=i*w*0.07,gy=h*0.46+((i*13)%(h*0.06));c.fillStyle=`rgba(0,0,0,0.1)`;c.beginPath();c.arc(gx,gy,3,0,Math.PI*2);c.fill();}

    // pH bar at top
    const pbx=w*0.05, pby=h*0.04, pbw=w*0.6, pbh=h*0.05;
    const pGrd=c.createLinearGradient(pbx,pby,pbx+pbw,pby);
    pGrd.addColorStop(0,'#EF4444'); pGrd.addColorStop(0.3,'#F97316'); pGrd.addColorStop(0.5,'#22C55E'); pGrd.addColorStop(1,'#3B82F6');
    c.fillStyle=pGrd; c.beginPath(); c.roundRect(pbx,pby,pbw,pbh,pbh/2); c.fill();
    const indX=pbx+pbw*((pH-3.5)/5);
    c.fillStyle='#1E2D3D'; c.beginPath(); c.moveTo(indX,pby-3); c.lineTo(indX-5,pby-12); c.lineTo(indX+5,pby-12); c.closePath(); c.fill();
    _lbl(c,`pH ${pH.toFixed(1)}`,indX,pby-14,'#1E2D3D',Math.max(8,w*0.018));
    ['3.5','5','6','7','8+'].forEach((lbl,i)=>{c.fillStyle='#4A5568'; c.font=`${Math.max(7,w*0.014)}px Tajawal`; c.textAlign='center'; c.fillText(lbl,pbx+pbw*i/4,pby+pbh+h*0.025);});

    // Crops
    S.crops.forEach((crop,i)=>{
      crop.growth=Math.min(1,crop.growth+(healthFrac*0.004));
      if(pH<4.5&&crop.growth>0.1) crop.withered=true;
      const cx2=crop.x*w, baseY=h*0.45;
      const stemH=h*0.22*crop.growth*(crop.withered?0.5:1);
      if(stemH>2){
        c.strokeStyle=crop.withered?`rgb(100,70,20)`:`rgb(${Math.round(20+healthFrac*30)},${Math.round(100+healthFrac*80)},20)`;
        c.lineWidth=2.5; c.beginPath(); c.moveTo(cx2,baseY); c.lineTo(crop.withered?cx2+stemH*0.3:cx2,baseY-stemH); c.stroke();
        if(crop.growth>0.35&&!crop.withered){
          // Leaves
          c.fillStyle=`rgba(${Math.round(20+healthFrac*40)},${Math.round(120+healthFrac*80)},30,0.9)`;
          c.beginPath(); c.ellipse(cx2-w*0.025,baseY-stemH*0.6,w*0.025,h*0.02,Math.PI/5,0,Math.PI*2); c.fill();
          c.beginPath(); c.ellipse(cx2+w*0.025,baseY-stemH*0.75,w*0.025,h*0.02,-Math.PI/5,0,Math.PI*2); c.fill();
        }
        if(crop.growth>0.7&&!crop.withered&&healthFrac>0.7){
          // Flower/fruit
          c.fillStyle=`rgba(255,180,50,0.9)`; c.beginPath(); c.arc(cx2,baseY-stemH,w*0.022,0,Math.PI*2); c.fill();
        }
      }
    });

    // Lime particles and rain
    S.drops=S.drops.filter(d=>d.y<1.1);
    if(S.raining) for(let i=0;i<3;i++) S.drops.push({x:Math.random(),y:-0.02,vy:0.02,type:'acid'});
    S.drops.forEach(d=>{
      d.y+=d.vy; d.x+=(Math.random()-0.5)*0.005;
      c.fillStyle=d.type==='lime'?'rgba(245,245,220,0.8)':'rgba(255,150,0,0.7)';
      c.fillRect(d.x*w,d.y*h,2,d.type==='acid'?8:5);
    });

    // Status
    const st=document.getElementById('ls3-status');
    const stStr=pH<4.5?'🔴 تربة شديدة الحموضة — المحاصيل تذبل!':pH<5.5?'🟡 حموضة معتدلة — تحتاج معالجة':pH<7?'🟢 ممتاز! pH مثالي للزراعة':'🔵 قلوي قليلاً — توقف عن إضافة الجير';
    if(st) st.innerHTML=`${stStr}<br>كمية الجير المضافة: ${S.limeAdded} وحدة | صحة المحاصيل: ${Math.round(healthFrac*100)}%`;

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// الصف التاسع — فيزياء الوحدة 11: موارد الطاقة والكفاءة
// ══════════════════════════════════════════════════════════
function simG9Energy1(){
  cancelAnimationFrame(animFrame);
  const items = [
    {id:'solar',   name:'الطاقة الشمسية',       emoji:'☀️', type:'renew'},
    {id:'wind',    name:'طاقة الرياح',          emoji:'💨', type:'renew'},
    {id:'hydro',   name:'الطاقة الكهرومائية',   emoji:'💧', type:'renew'},
    {id:'tidal',   name:'طاقة المدّ والجزر',    emoji:'🌊', type:'renew'},
    {id:'geo',     name:'الطاقة الحرارية الجوفية', emoji:'🌋', type:'renew'},
    {id:'coal',    name:'الفحم',                emoji:'🪨', type:'non'},
    {id:'oil',     name:'النفط',                emoji:'🛢️', type:'non'},
    {id:'gas',     name:'الغاز الطبيعي',        emoji:'🔥', type:'non'},
    {id:'nuclear', name:'الطاقة النووية',       emoji:'⚛️', type:'non'}
  ];
  simState = {
    t:0,
    items: items.map((it, i)=>({
      ...it,
      x: 0.14 + (i%3)*0.36,
      y: 0.17 + Math.floor(i/3)*0.14,
      placed: null
    })),
    dragId: null,
    ox: 0, oy: 0,
    score: 0
  };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">♻️ صنّف مصادر الطاقة</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.75);line-height:1.65;margin-top:4px">
        اسحب كل بطاقة إلى المستطيل المناسب. اضغط <strong>💡 ماذا نستنتج؟</strong> أسفل الشاشة بعد التجربة.
      </div>
    </div>
    <div class="info-box" id="g9e1-info" style="line-height:1.7">اسحب بطاقة باستخدام الفأرة أو اللمس ✋</div>
    <button class="ctrl-btn reset" style="width:100%;margin-top:6px" onclick="simG9Energy1()">↺ إعادة</button>
    <div class="q-box" style="margin-top:10px;font-size:13px;line-height:1.7">
      <strong>❓ تلميح سريع</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">عرض</button>
      <div class="q-ans-panel">المتجددة: شمس، رياح، ماء، أمواج، حرارة أرضية… | غير المتجددة: أحفوريات ووقود نووي (وقود مخزّن).</div>
    </div>
  `);

  const cv = document.getElementById('simCanvas');
  function g9e1CardMetrics(w,h){
    return { cw: Math.min(200, w*0.26), ch: Math.max(40, Math.round(h*0.062)) };
  }
  function hitCard(mx,my,w,h){
    const {cw,ch}=g9e1CardMetrics(w,h);
    for(const it of simState.items){
      const px=it.x*w, py=it.y*h;
      if(mx>px-cw/2 && mx<px+cw/2 && my>py-ch/2 && my<py+ch/2){
        return {it, cw, ch};
      }
    }
    return null;
  }

  function _g9e1Pos(e){
    const r=cv.getBoundingClientRect();
    const p = (e.touches && e.touches[0]) ? e.touches[0] : ((e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0] : e);
    return { mx: p.clientX - r.left, my: p.clientY - r.top };
  }
  function _g9e1Start(mx,my){
    const w=cv.width, h=cv.height;
    const hit=hitCard(mx,my,w,h);
    if(hit){
      simState.dragId = hit.it.id;
      simState.ox = mx - hit.it.x*w;
      simState.oy = my - hit.it.y*h;
    }
  }
  function _g9e1Move(mx,my){
    if(!simState.dragId) return;
    const w=cv.width, h=cv.height;
    const it=simState.items.find(x=>x.id===simState.dragId);
    if(!it) return;
    it.x = (mx - simState.ox) / w;
    it.y = (my - simState.oy) / h;
  }
  function _g9e1End(mx,my){
    if(!simState.dragId) return;
    const w=cv.width, h=cv.height;
    const renewBox = {x:w*0.06,y:h*0.56,w:w*0.42,h:h*0.34};
    const nonBox   = {x:w*0.52,y:h*0.56,w:w*0.42,h:h*0.34};
    const it=simState.items.find(x=>x.id===simState.dragId);
    simState.dragId=null;
    if(!it) return;
    const dropIn = (b)=> mx>b.x && mx<b.x+b.w && my>b.y && my<b.y+b.h;
    let placed=null;
    if(dropIn(renewBox)) placed='renew';
    else if(dropIn(nonBox)) placed='non';
    if(!placed) return;
    it.placed = placed;
    const arr = simState.items.filter(x=>x.placed===placed);
    const idx = arr.indexOf(it);
    const cols = 2;
    const sx = (placed==='renew'?renewBox.x:nonBox.x);
    const sy = (placed==='renew'?renewBox.y:nonBox.y);
    const bw = (placed==='renew'?renewBox.w:nonBox.w);
    const rowGap = Math.max(46, Math.round(h*0.065));
    const topPad = Math.max(56, Math.round(h*0.072));
    it.x = (sx + bw*0.25 + (idx%cols)*bw*0.5) / w;
    it.y = (sy + topPad + Math.floor(idx/cols)*rowGap) / h;
    const correct = (it.type===placed);
    const info=document.getElementById('g9e1-info');
    if(correct){
      U9Sound && U9Sound.win && U9Sound.win();
      if(info) info.innerHTML = `✅ صحيح: <strong>${it.name}</strong> ${it.emoji} — ${placed==='renew'?'متجددة':'غير متجددة'}.`;
    }else{
      U9Sound && U9Sound.ping && U9Sound.ping(200,0.2,0.15);
      if(info) info.innerHTML = `❌ ليست في هذا الصندوق — أعد المحاولة: <strong>${it.name}</strong> ${it.emoji}`;
      it.placed = null;
    }
  }

  cv.onmousedown = (e)=>{
    if(currentSim!=='g9energymix') return;
    const {mx,my}=_g9e1Pos(e);
    _g9e1Start(mx,my);
  };
  cv.onmousemove = (e)=>{
    if(currentSim!=='g9energymix') return;
    const {mx,my}=_g9e1Pos(e);
    _g9e1Move(mx,my);
  };
  cv.onmouseup = (e)=>{
    if(currentSim!=='g9energymix') return;
    const {mx,my}=_g9e1Pos(e);
    _g9e1End(mx,my);
  };
  cv.onmouseleave = ()=>{ if(simState.dragId) simState.dragId=null; };
  cv.ontouchstart = (e)=>{
    if(currentSim!=='g9energymix') return;
    const {mx,my}=_g9e1Pos(e);
    _g9e1Start(mx,my);
  };
  cv.ontouchmove = (e)=>{
    if(!simState.dragId) return;
    e.preventDefault();
    const {mx,my}=_g9e1Pos(e);
    _g9e1Move(mx,my);
  };
  cv.ontouchend = (e)=>{
    if(currentSim!=='g9energymix') return;
    const {mx,my}=_g9e1Pos(e);
    _g9e1End(mx,my);
  };

  function draw(){
    if(currentSim!=='g9energymix'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    simState.t += 0.02;
    const bg=c.createLinearGradient(0,0,w,h);
    bg.addColorStop(0,'#F3F8FF'); bg.addColorStop(1,'#FFF7ED');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    const titleSize = Math.round(Math.min(h*0.042, w*0.055));
    c.fillStyle='rgba(30,45,61,0.9)';
    c.font=`bold ${titleSize}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
    c.fillText('صنّف مصادر الطاقة', w/2, 12);
    c.fillStyle='rgba(30,45,61,0.45)'; c.font=`${Math.max(11, Math.round(titleSize*0.48))}px Tajawal`;
    c.fillText('منطقة البطاقات أعلاه — مناطق الإسقاط أسفل', w/2, 12+titleSize+6);

    const renewBox = {x:w*0.06,y:h*0.56,w:w*0.42,h:h*0.34};
    const nonBox   = {x:w*0.52,y:h*0.56,w:w*0.42,h:h*0.34};
    const zone = (b, title, col)=>{
      c.fillStyle=col+'16'; c.beginPath(); c.roundRect(b.x,b.y,b.w,b.h,16); c.fill();
      c.strokeStyle=col+'66'; c.lineWidth=2; c.beginPath(); c.roundRect(b.x,b.y,b.w,b.h,16); c.stroke();
      c.fillStyle=col; c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
      c.fillText(title, b.x+b.w/2, b.y+8);
      c.fillStyle='rgba(0,0,0,0.38)'; c.font=`${Math.max(11, Math.round(h*0.02))}px Tajawal`;
      c.fillText('أسقط البطاقة داخل المستطيل', b.x+b.w/2, b.y+38);
    };
    zone(renewBox,'♻️ متجددة','#16A34A');
    zone(nonBox,'⛽ غير متجددة','#DC2626');

    const {cw,ch}=g9e1CardMetrics(w,h);
    simState.items.forEach((it, i)=>{
      const x=it.x*w, y=it.y*h;
      const isDrag = simState.dragId===it.id;
      c.save();
      c.shadowColor='rgba(0,0,0,0.18)'; c.shadowBlur=isDrag?16:10;
      const col = it.type==='renew' ? '#16A34A' : '#DC2626';
      c.fillStyle='rgba(255,255,255,0.92)'; c.beginPath(); c.roundRect(x-cw/2,y-ch/2,cw,ch,14); c.fill();
      c.strokeStyle=col+'55'; c.lineWidth=2; c.beginPath(); c.roundRect(x-cw/2,y-ch/2,cw,ch,14); c.stroke();
      c.shadowBlur=0;
      c.fillStyle=col; c.beginPath(); c.roundRect(x-cw/2,y-ch/2,8,ch,14); c.fill();
      const nameFont = Math.max(11, Math.round(h*0.024));
      c.fillStyle='#1E2D3D'; c.font=`bold ${nameFont}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      const shortName = it.name.length>16 ? it.name.slice(0,15)+'…' : it.name;
      c.fillText(`${it.emoji} ${shortName}`, x, y+1);
      c.restore();
    });

    const placedCount = simState.items.filter(it=>it.placed).length;
    const barY = h*0.915;
    c.fillStyle='rgba(30,45,61,0.55)'; c.beginPath(); c.roundRect(w*0.2,barY,w*0.6,30,15); c.fill();
    c.fillStyle='white'; c.font=`bold ${Math.max(12, Math.round(h*0.026))}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(`تم التصنيف: ${placedCount} / ${simState.items.length}`, w/2, barY+15);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG9Energy2(){
  cancelAnimationFrame(animFrame);
  simState = { t:0, Ein:100, Euse:30, time:8, mode:'energy' };
  const S=simState;
  function clamp(n,a,b){ return Math.max(a,Math.min(b,n)); }
  window._g9eSet = function(k,v){
    S[k]=+v;
    if(k==='Euse') S.Euse=clamp(S.Euse,0,S.Ein);
    if(k==='Ein')  S.Ein =clamp(S.Ein,1,500);
    if(k==='time') S.time=clamp(S.time,1,60);
    const eff = (S.Euse/S.Ein)*100;
    var effEl = document.getElementById('g9e-eff');
    var einEl = document.getElementById('g9e-ein');
    var useEl = document.getElementById('g9e-euse');
    var tEl   = document.getElementById('g9e-time');
    if(effEl) effEl.textContent = isFinite(eff)?eff.toFixed(0):'0';
    if(einEl) einEl.textContent = S.Ein.toFixed(0);
    if(useEl) useEl.textContent = S.Euse.toFixed(0);
    if(tEl)   tEl.textContent   = S.time.toFixed(0);
  };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📈 حاسبة الكفاءة</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.75);line-height:1.6;margin-top:4px">
        غيّر طاقة الإدخال والطاقة المفيدة، وشاهد نسبة الكفاءة.
      </div>
    </div>
    <div class="info-box" style="text-align:center">
      الكفاءة = <strong>الطاقة المفيدة ÷ طاقة الإدخال × 100%</strong><br>
      الكفاءة الحالية: <strong><span id="g9e-eff">30</span>%</strong><br>
      <span style="font-size:12px;opacity:0.8">يمكنك أيضاً حساب القدرة (P = E/t)</span>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">طاقة الإدخال Ein: <span id="g9e-ein">100</span> J</div>
      <input type="range" min="10" max="500" value="100" oninput="window._g9eSet('Ein',this.value)" style="width:100%">
      <div class="ctrl-label" style="margin-top:8px">الطاقة المفيدة Euse: <span id="g9e-euse">30</span> J</div>
      <input type="range" min="0" max="500" value="30" oninput="window._g9eSet('Euse',this.value)" style="width:100%">
      <div class="ctrl-label" style="margin-top:8px">الزمن t: <span id="g9e-time">8</span> s</div>
      <input type="range" min="1" max="60" value="8" oninput="window._g9eSet('time',this.value)" style="width:100%">
    </div>
    <div class="info-box" style="margin-top:8px;font-size:12px;line-height:1.65;opacity:0.95">
      بعد ضبط القيم، افتح <strong>💡 ماذا نستنتج؟</strong> أسفل الشاشة وجاوب عن سؤال الكفاءة.
    </div>
  `);
  window._g9eSet('Ein', S.Ein);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(!(currentSim==='g9efficiency' || currentSim==='g9solar')){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const eff = S.Euse/S.Ein;
    const effPct = isFinite(eff)?eff*100:0;
    const pIn = S.Ein/S.time;
    const pUse = S.Euse/S.time;

    // Background
    const bg=c.createLinearGradient(0,0,w,h);
    bg.addColorStop(0,'#0B1220'); bg.addColorStop(1,'#102A43');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Title
    c.fillStyle='rgba(255,255,255,0.92)';
    c.font=`bold ${Math.round(h*0.05)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
    const simTitle = currentSim==='g9solar' ? 'الطاقة الشمسية — كفاءة التحويل' : 'حاسبة الكفاءة';
    c.fillText(simTitle, w/2, 16);

    // Efficiency ring
    const cx=w*0.32, cy=h*0.55, r=Math.min(w,h)*0.18;
    c.strokeStyle='rgba(255,255,255,0.14)'; c.lineWidth=18; c.beginPath(); c.arc(cx,cy,r,0,Math.PI*2); c.stroke();
    const start=-Math.PI/2;
    const col = effPct>=70 ? '#22C55E' : effPct>=40 ? '#F59E0B' : '#EF4444';
    c.strokeStyle=col; c.lineWidth=18; c.beginPath(); c.arc(cx,cy,r,start,start+Math.PI*2*clamp(eff,0,1)); c.stroke();
    c.fillStyle='white'; c.font=`bold ${Math.round(h*0.075)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(`${Math.round(effPct)}%`, cx, cy);
    c.font=`${Math.round(h*0.028)}px Tajawal`; c.fillStyle='rgba(255,255,255,0.8)';
    c.fillText('الكفاءة', cx, cy + r*0.72);

    // Sankey-ish bars
    const bx=w*0.58, by=h*0.3, bw=w*0.32, bh=h*0.5;
    c.fillStyle='rgba(255,255,255,0.06)'; c.beginPath(); c.roundRect(bx,by,bw,bh,18); c.fill();
    c.strokeStyle='rgba(255,255,255,0.12)'; c.lineWidth=1.5; c.beginPath(); c.roundRect(bx,by,bw,bh,18); c.stroke();

    const inH = bh*0.85;
    const useH = inH*clamp(eff,0,1);
    const lossH = inH-useH;
    const barW = bw*0.26;
    const x1=bx+bw*0.22, x2=bx+bw*0.62;
    // Input
    c.fillStyle='rgba(59,130,246,0.85)'; c.beginPath(); c.roundRect(x1-barW/2, by+bh*0.1, barW, inH, 12); c.fill();
    // Useful
    c.fillStyle='rgba(34,197,94,0.85)'; c.beginPath(); c.roundRect(x2-barW/2, by+bh*0.1+(inH-useH), barW, useH, 12); c.fill();
    // Loss
    c.fillStyle='rgba(239,68,68,0.75)'; c.beginPath(); c.roundRect(x2-barW/2, by+bh*0.1, barW, lossH, 12); c.fill();

    const fsz=Math.round(h*0.028);
    c.fillStyle='rgba(255,255,255,0.92)'; c.font=`bold ${fsz}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
    c.fillText('إدخال', x1, by+bh*0.1+inH+10);
    c.fillText('مفيدة', x2, by+bh*0.1+(inH-useH)+useH+10);
    c.fillStyle='rgba(255,255,255,0.75)'; c.font=`${Math.round(h*0.024)}px Tajawal`;
    c.fillText(`Ein = ${S.Ein.toFixed(0)} J`, x1, by+bh*0.1+inH+36);
    c.fillText(`Euse = ${S.Euse.toFixed(0)} J`, x2, by+bh*0.1+inH+36);

    const pboxTop = h*0.76;
    c.fillStyle='rgba(255,255,255,0.08)'; c.beginPath(); c.roundRect(w*0.06,pboxTop,w*0.88,62,16); c.fill();
    c.strokeStyle='rgba(255,255,255,0.14)'; c.stroke();
    const pfs = Math.max(11, Math.round(h*0.024));
    c.fillStyle='white'; c.font=`bold ${pfs}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(`القدرة المدخلة: Pin = ${pIn.toFixed(1)} W`, w/2, pboxTop + 20);
    c.fillStyle='rgba(255,255,255,0.88)'; c.font=`bold ${pfs}px Tajawal`;
    c.fillText(`القدرة المفيدة: Puse = ${pUse.toFixed(1)} W — الزمن t = ${S.time.toFixed(0)} s`, w/2, pboxTop + 44);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// Wrappers + extended unit 11 simulations
function simG9EnergyMix1(){ simG9Energy1(); }
function simG9EnergyMix2(){
  cancelAnimationFrame(animFrame);
  simState={solar:20,wind:20,hydro:20,fossil:20,nuclear:20};
  window._mixPreset=function(which){
    if(which==='bal'){ simState.solar=20; simState.wind=20; simState.hydro=20; simState.fossil=20; simState.nuclear=20; }
    if(which==='clean'){ simState.solar=35; simState.wind=30; simState.hydro=25; simState.fossil=5; simState.nuclear=5; }
    if(which==='fossil'){ simState.solar=5; simState.wind=5; simState.hydro=10; simState.fossil=65; simState.nuclear=15; }
    ['solar','wind','hydro','fossil','nuclear'].forEach(function(x){
      var el=document.getElementById('mx-'+x); if(el) el.textContent=simState[x];
      var rg=document.getElementById('mxr-'+x); if(rg) rg.value=simState[x];
    });
  };
  window._mixSet=function(k,v){
    simState[k]=+v;
    var sum=simState.solar+simState.wind+simState.hydro+simState.fossil+simState.nuclear;
    if(sum===0) return;
    ['solar','wind','hydro','fossil','nuclear'].forEach(function(x){
      simState[x]=Math.round(simState[x]*100/sum);
      var el=document.getElementById('mx-'+x); if(el) el.textContent=simState[x];
      var rg=document.getElementById('mxr-'+x); if(rg) rg.value=simState[x];
    });
  };
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧩 صمّم مزيج الطاقة (مجموع النسب ≈ 100%)</div>
      <div style="font-size:13px;color:rgba(255,255,255,.78);line-height:1.65;margin-top:4px">
        حرّك المنزلقات أو اختر سيناريو جاهز. راقب الأعمدة ومؤشر الانبعاثات. سؤال الاستنتاج من الزر أسفل الشاشة.
      </div>
    </div>
    <div class="ctrl-btns-grid" style="margin-top:6px">
      <button class="ctrl-btn action" onclick="window._mixPreset('bal')">⚖️ متوازن</button>
      <button class="ctrl-btn" onclick="window._mixPreset('clean')">🌿 أنظف</button>
      <button class="ctrl-btn" onclick="window._mixPreset('fossil')">🛢️ أحفوري أكثر</button>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">☀️ شمسية <span id="mx-solar">20</span>%</div><input id="mxr-solar" type="range" min="0" max="100" value="20" oninput="window._mixSet('solar',this.value)" style="width:100%">
      <div class="ctrl-label">💨 رياح <span id="mx-wind">20</span>%</div><input id="mxr-wind" type="range" min="0" max="100" value="20" oninput="window._mixSet('wind',this.value)" style="width:100%">
      <div class="ctrl-label">💧 مائية <span id="mx-hydro">20</span>%</div><input id="mxr-hydro" type="range" min="0" max="100" value="20" oninput="window._mixSet('hydro',this.value)" style="width:100%">
      <div class="ctrl-label">🛢️ أحفوري <span id="mx-fossil">20</span>%</div><input id="mxr-fossil" type="range" min="0" max="100" value="20" oninput="window._mixSet('fossil',this.value)" style="width:100%">
      <div class="ctrl-label">⚛️ نووي <span id="mx-nuclear">20</span>%</div><input id="mxr-nuclear" type="range" min="0" max="100" value="20" oninput="window._mixSet('nuclear',this.value)" style="width:100%">
    </div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9energymix'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); c.fillStyle='#0F172A'; c.fillRect(0,0,w,h);
    const vals=[simState.solar,simState.wind,simState.hydro,simState.fossil,simState.nuclear];
    const cols=['#F59E0B','#22C55E','#0EA5E9','#EF4444','#A855F7'];
    const names=['شمسية','رياح','مائية','أحفوري','نووي'];
    const n=5, gap=w*0.028, bw=(w*0.82 - gap*(n-1))/n, x0=w*0.09;
    const baseY=h*0.68, maxH=h*0.42;
    vals.forEach((v,i)=>{
      const bh=maxH*(v/100);
      const bx=x0+i*(bw+gap);
      c.fillStyle=cols[i];
      c.beginPath(); c.roundRect(bx,baseY-bh,bw,bh,10); c.fill();
      c.fillStyle='rgba(255,255,255,.92)'; c.font=`bold ${Math.max(11,Math.round(h*0.022))}px Tajawal`; c.textAlign='center'; c.textBaseline='bottom';
      c.fillText(v+'%', bx+bw/2, baseY-bh-6);
    });
    const lblY = baseY+14;
    c.fillStyle='rgba(148,163,184,.95)'; c.font=`${Math.max(11,Math.round(h*0.02))}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
    names.forEach((nm,i)=>{
      const bx=x0+i*(bw+gap);
      c.fillText(nm, bx+bw/2, lblY);
    });
    const emissions=Math.round(simState.fossil*1.0 + simState.nuclear*0.15 + simState.hydro*0.08 + simState.wind*0.03 + simState.solar*0.02);
    c.fillStyle='rgba(255,255,255,.95)'; c.font=`bold ${Math.min(22,Math.round(h*0.038))}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
    c.fillText('مؤشر الانبعاثات (نموذج تعليمي): '+emissions, w/2, h*0.08);
    c.fillStyle= emissions<30 ? '#4ADE80' : '#FBBF24';
    c.font=`bold ${Math.round(h*0.028)}px Tajawal`;
    c.fillText(emissions<30?'حالة: منخفض نسبياً':'حالة: مرتفع نسبياً — قلّل الأحفوري', w/2, h*0.08 + Math.round(h*0.045));
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG9Solar1(){
  cancelAnimationFrame(animFrame);
  simState={angle:45,irr:70};
  window._solSet=function(k,v){simState[k]=+v; var el=document.getElementById('sol-'+k); if(el) el.textContent=v; var r=document.getElementById('solr-'+k); if(r) r.value=v;};
  window._solAngle=function(a){ window._solSet('angle', a); };
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">☀️ زاوية اللوح: <span id="sol-angle">45</span>°</div>
      <input id="solr-angle" type="range" min="0" max="90" value="45" oninput="window._solSet('angle',this.value)" style="width:100%">
      <div class="ctrl-btns-grid" style="margin-top:8px">
        <button class="ctrl-btn" onclick="window._solAngle(0)">0° أفقي</button>
        <button class="ctrl-btn action" onclick="window._solAngle(45)">45°</button>
        <button class="ctrl-btn" onclick="window._solAngle(90)">90° عمودي</button>
      </div>
      <div class="ctrl-label" style="margin-top:8px">شدة الإشعاع: <span id="sol-irr">70</span>%</div>
      <input id="solr-irr" type="range" min="20" max="100" value="70" oninput="window._solSet('irr',this.value)" style="width:100%">
      <div class="info-box" style="margin-top:8px;font-size:12px;line-height:1.65">انقر قرب اللوح على الشاشة لمحاذاة الزاوية تقريباً مع اتجاه الشعاع.</div>
    </div>
  `);
  const cv=document.getElementById('simCanvas');
  cv.onclick=function(e){
    if(currentSim!=='g9solar') return;
    const r=cv.getBoundingClientRect();
    const mx=(e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX-r.left, my=(e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientY-r.top;
    const w=cv.width, h=cv.height;
    const px=w*0.58, py=h*0.62;
    const dx=mx-px, dy=my-py;
    let deg=Math.atan2(dy,dx)*180/Math.PI;
    deg=Math.max(0, Math.min(90, Math.round(-deg)));
    window._solSet('angle', deg);
  };
  function draw(){
    if(currentSim!=='g9solar'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); c.fillStyle='#EAF4FF'; c.fillRect(0,0,w,h);
    const ang=simState.angle*Math.PI/180;
    const sunX=w*0.14,sunY=h*0.18;
    c.fillStyle='rgba(255,215,80,0.95)'; c.beginPath(); c.arc(sunX,sunY,32,0,Math.PI*2); c.fill();
    const px=w*0.58,py=h*0.62,l=Math.min(150,w*0.34);
    c.save(); c.translate(px,py); c.rotate(-ang);
    c.fillStyle='#475569'; c.strokeStyle='#334155'; c.lineWidth=2;
    c.beginPath(); c.roundRect(-l/2,-12,l,24,8); c.fill(); c.stroke();
    c.fillStyle='rgba(30,58,138,0.25)'; c.fillRect(-l/2,-12,l,24);
    c.restore();
    const effRaw=Math.cos(ang);
    const efficiency=Math.max(0, effRaw)*0.92*(simState.irr/100);
    c.strokeStyle='rgba(245,158,11,0.55)'; c.lineWidth=2.5;
    const sx=sunX+28, sy=sunY+22, ex=px-18, ey=py-6;
    c.beginPath(); c.moveTo(sx,sy); c.lineTo(ex,ey); c.stroke();
    c.setLineDash([6,6]); c.strokeStyle='rgba(245,158,11,0.35)'; c.beginPath();
    c.moveTo(px,py); c.lineTo(px,py+70); c.stroke(); c.setLineDash([]);
    c.fillStyle='rgba(30,45,61,0.88)'; c.font=`bold ${Math.min(20,Math.round(h*0.034))}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
    c.fillText('شعاع شمسي — زاوية سطح اللوح: '+simState.angle+'°', w/2, h*0.06);
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.032)}px Tajawal`; c.textBaseline='bottom';
    c.fillText('كفاءة تقريبية: '+Math.round(efficiency*100)+'%', w/2, h*0.94);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG9Solar2(){
  cancelAnimationFrame(animFrame);
  simState={area:12, eff:18, irr:850, t:0};
  window._sol2Set=function(k,v){
    simState[k]=+v;
    var el=document.getElementById('s2-'+k); if(el) el.textContent=(k==='eff'?v+'%':k==='irr'?v+' W/m²':v+' m²');
  };
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📐 مساحة الألواح: <span id="s2-area">12 m²</span></div>
      <input type="range" min="1" max="50" value="12" oninput="window._sol2Set('area',this.value)" style="width:100%">
      <div class="ctrl-label" style="margin-top:8px">⚡ كفاءة اللوح: <span id="s2-eff">18%</span></div>
      <input type="range" min="5" max="25" value="18" oninput="window._sol2Set('eff',this.value)" style="width:100%">
      <div class="ctrl-label" style="margin-top:8px">☀️ شدة الإشعاع: <span id="s2-irr">850 W/m²</span></div>
      <input type="range" min="200" max="1200" value="850" oninput="window._sol2Set('irr',this.value)" style="width:100%">
      <div class="ctrl-btns-grid" style="margin-top:10px">
        <button class="ctrl-btn" onclick="window._sol2Set('irr',300);document.querySelector('#s2-irr').textContent='300 W/m²'">🌥️ غائم</button>
        <button class="ctrl-btn action" onclick="window._sol2Set('irr',850);document.querySelector('#s2-irr').textContent='850 W/m²'">⛅ جزئي</button>
        <button class="ctrl-btn" onclick="window._sol2Set('irr',1100);document.querySelector('#s2-irr').textContent='1100 W/m²'">☀️ صافٍ</button>
      </div>
    </div>
    <div class="q-box"><strong>💡 ماذا نستنتج؟</strong><br>القدرة = المساحة × الإشعاع × الكفاءة. تضاعف المساحة يضاعف الإنتاج، والكفاءة الأعلى تعني ألواحاً أصغر لنفس الطاقة.</div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9solar'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    simState.t+=0.016;
    c.clearRect(0,0,w,h);
    // Sky gradient based on irradiance
    const irrFrac=simState.irr/1200;
    const skyTop=`rgba(${Math.round(135+40*(1-irrFrac))},${Math.round(185+30*(1-irrFrac))},${Math.round(220+35*(1-irrFrac))},1)`;
    const bg=c.createLinearGradient(0,0,0,h*0.55);
    bg.addColorStop(0, irrFrac>0.8?'#87CEEB':irrFrac>0.5?'#B0C4DE':'#C8D8E8');
    bg.addColorStop(1,'#D4E8F5');
    c.fillStyle=bg; c.fillRect(0,0,w,h*0.6);
    c.fillStyle='#E8D5A3'; c.fillRect(0,h*0.6,w,h*0.4);
    // Sun
    const sunR=28+irrFrac*12;
    const sunGlow=c.createRadialGradient(w*0.15,h*0.12,0,w*0.15,h*0.12,sunR*2.2);
    sunGlow.addColorStop(0,`rgba(255,240,100,${0.5*irrFrac})`);
    sunGlow.addColorStop(1,'rgba(255,240,100,0)');
    c.fillStyle=sunGlow; c.beginPath(); c.arc(w*0.15,h*0.12,sunR*2.2,0,Math.PI*2); c.fill();
    c.fillStyle=`rgba(255,220,60,${0.7+0.3*irrFrac})`; c.beginPath(); c.arc(w*0.15,h*0.12,sunR,0,Math.PI*2); c.fill();
    // Clouds if low irradiance
    if(simState.irr<700){
      const cloudAlpha=Math.min(0.9,(700-simState.irr)/500);
      c.fillStyle=`rgba(220,230,240,${cloudAlpha})`;
      [[w*0.35,h*0.1,55,28],[w*0.55,h*0.07,40,22],[w*0.42,h*0.13,45,20]].forEach(([cx,cy,rx,ry])=>{
        c.beginPath(); c.ellipse(cx+Math.sin(simState.t*0.3)*10,cy,rx,ry,0,0,Math.PI*2); c.fill();
      });
    }
    // Solar panels on ground
    const panelArea=Math.min(simState.area,50);
    const nPanels=Math.min(panelArea,18), cols=Math.min(nPanels,6), rows=Math.ceil(nPanels/cols);
    const pw=Math.min(55,w*0.08), ph=pw*0.6;
    const startX=w*0.22, startY=h*0.55;
    for(let i=0;i<nPanels;i++){
      const col=i%cols, row=Math.floor(i/cols);
      const px=startX+col*(pw+8), py=startY-row*(ph*0.7+5);
      // Panel body
      c.fillStyle='#1A3A6B'; c.beginPath(); c.roundRect(px,py,pw,ph,3); c.fill();
      // Grid lines
      c.strokeStyle='rgba(100,160,220,0.4)'; c.lineWidth=0.8;
      for(let g=1;g<3;g++){c.beginPath();c.moveTo(px+pw*g/3,py);c.lineTo(px+pw*g/3,py+ph);c.stroke();}
      for(let g=1;g<2;g++){c.beginPath();c.moveTo(px,py+ph*g/2);c.lineTo(px+pw,py+ph*g/2);c.stroke();}
      // Shine effect
      c.fillStyle=`rgba(180,220,255,${0.08+0.12*irrFrac})`; c.fillRect(px+2,py+2,pw*0.3,ph*0.35);
    }
    // Power calculations
    const P_kW=(simState.area*simState.irr*(simState.eff/100)/1000);
    const P_day=(P_kW*5).toFixed(1);
    // Energy flow animation: rays from sun to panels
    if(irrFrac>0.3){
      c.strokeStyle=`rgba(255,220,60,${0.35*irrFrac})`;
      c.lineWidth=1.5; c.setLineDash([5,8]);
      const rayTargets=[[startX+pw/2,startY-ph/2],[startX+cols/2*(pw+8),startY-ph/2]];
      rayTargets.forEach(([tx,ty])=>{
        c.beginPath();
        c.moveTo(w*0.15+sunR,h*0.12+sunR*0.5);
        c.lineTo(tx,ty); c.stroke();
      });
      c.setLineDash([]);
    }
    // Power display box
    const boxY=h*0.1, boxH=h*0.34;
    c.fillStyle='rgba(255,255,255,0.92)';
    c.beginPath(); c.roundRect(w*0.65,boxY,w*0.3,boxH,14); c.fill();
    c.strokeStyle='rgba(26,143,168,0.3)'; c.lineWidth=1.5; c.stroke();
    c.fillStyle='#1A3A6B'; c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText('📊 الحساب', w*0.8, boxY+h*0.055);
    c.fillStyle='#27AE60'; c.font=`bold ${Math.round(h*0.04)}px Tajawal`;
    c.fillText(`${P_kW.toFixed(2)} kW`, w*0.8, boxY+h*0.13);
    c.fillStyle='#555'; c.font=`${Math.round(h*0.024)}px Tajawal`;
    c.fillText(`اليومي ≈ ${P_day} kWh`, w*0.8, boxY+h*0.185);
    c.fillText(`${simState.area} m² × ${simState.eff}%`, w*0.8, boxY+h*0.235);
    // Power bar
    const barX=w*0.67, barY=boxY+boxH-h*0.07, barW=w*0.26, barH=h*0.035;
    const fracPow=Math.min(1,P_kW/18);
    c.fillStyle='#E0E0E0'; c.beginPath(); c.roundRect(barX,barY,barW,barH,6); c.fill();
    const barGrad=c.createLinearGradient(barX,0,barX+barW,0);
    barGrad.addColorStop(0,'#27AE60'); barGrad.addColorStop(1,'#F4D03F');
    c.fillStyle=barGrad; c.beginPath(); c.roundRect(barX,barY,barW*fracPow,barH,6); c.fill();
    c.fillStyle='rgba(30,45,61,0.75)'; c.font=`${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
    c.fillText(`القدرة: ${P_kW.toFixed(1)} / 18 kW`, w*0.8, barY+barH+h*0.025);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG9Wind1(){
  cancelAnimationFrame(animFrame);
  simState={v:8};
  window._windV=v=>{simState.v=+v; var el=document.getElementById('wind-v'); if(el) el.textContent=v;};
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">💨 سرعة الرياح: <span id="wind-v">8</span> m/s</div>
      <input type="range" min="2" max="20" value="8" oninput="window._windV(this.value)" style="width:100%">
      <div class="info-box" style="margin-top:8px;font-size:12px;line-height:1.65">في النموذج التقريبي: القدرة ∝ v³. جرّب السرعات ثم سؤال الاستنتج من الأسفل.</div>
    </div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9wind'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); c.fillStyle='#ECFEFF'; c.fillRect(0,0,w,h);
    const cx=w*0.5,cy=h*0.5,r=70,speed=simState.v;
    c.strokeStyle='#64748B'; c.lineWidth=6; c.beginPath(); c.moveTo(cx,cy); c.lineTo(cx,h*0.85); c.stroke();
    c.save(); c.translate(cx,cy); c.rotate((Date.now()/1000)*(speed/8));
    c.fillStyle='#0EA5E9';
    for(let i=0;i<3;i++){ c.rotate((Math.PI*2)/3); c.beginPath(); c.moveTo(0,0); c.lineTo(r,8); c.lineTo(r,-8); c.closePath(); c.fill(); }
    c.restore();
    const p=Math.round(Math.pow(speed,3));
    c.fillStyle='rgba(30,45,61,0.88)'; c.font=`bold ${Math.min(20,Math.round(h*0.034))}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
    c.fillText('توربين رياح — سرعة '+speed+' m/s', w/2, h*0.06);
    c.fillStyle='#0F172A'; c.font=`bold ${Math.round(h*0.038)}px Tajawal`; c.textBaseline='bottom';
    c.fillText('قدرة نسبية ∝ v³ ← '+p, w/2, h*0.93);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}
function simG9Wind2(){
  cancelAnimationFrame(animFrame);
  simState={n:6,v:10};
  window._wfSet=function(k,v){simState[k]=+v; var el=document.getElementById('wf-'+k); if(el) el.textContent=v;};
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌀 مزرعة الرياح</div>
      <div class="ctrl-label">عدد التوربينات: <span id="wf-n">6</span></div>
      <input type="range" min="1" max="20" value="6" oninput="window._wfSet('n',this.value)" style="width:100%">
      <div class="ctrl-label" style="margin-top:8px">سرعة الرياح: <span id="wf-v">10</span> m/s</div>
      <input type="range" min="3" max="20" value="10" oninput="window._wfSet('v',this.value)" style="width:100%">
    </div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9wind'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); c.fillStyle='#ECFEFF'; c.fillRect(0,0,w,h);
    const cols=5,rows=4,total=simState.n,cellW=w*0.16,cellH=h*0.18;
    let idx=0;
    for(let r=0;r<rows;r++) for(let k=0;k<cols;k++){
      if(idx>=total) break;
      const x=w*0.12+k*cellW, y=h*0.28+r*cellH;
      c.strokeStyle='#64748B'; c.lineWidth=2; c.beginPath(); c.moveTo(x,y); c.lineTo(x,y+40); c.stroke();
      c.save(); c.translate(x,y); c.rotate((Date.now()/1000)*(simState.v/10));
      c.fillStyle='#0EA5E9';
      for(let i=0;i<3;i++){ c.rotate((Math.PI*2)/3); c.beginPath(); c.moveTo(0,0); c.lineTo(20,3); c.lineTo(20,-3); c.closePath(); c.fill(); }
      c.restore(); idx++;
    }
    const out=Math.round(total*Math.pow(simState.v,3)/120);
    c.fillStyle='rgba(30,45,61,0.88)'; c.font=`bold ${Math.min(20,Math.round(h*0.032))}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
    c.fillText('مزرعة رياح — '+total+' توربين', w/2, h*0.05);
    c.fillStyle='#0F172A'; c.font=`bold ${Math.round(h*0.036)}px Tajawal`; c.textBaseline='bottom';
    c.fillText('إنتاج نسبي: '+out+' (سرعة '+simState.v+' m/s)', w/2, h*0.92);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG9Hydro1(){
  cancelAnimationFrame(animFrame);
  simState={head:30, flow:50, t:0, particles:[]};
  window._hySet=function(k,v){simState[k]=+v; var el=document.getElementById('hy-'+k); if(el) el.textContent=(k==='head'?v+' m':v+'%');};
  for(let i=0;i<18;i++) simState.particles.push({x:0.12+Math.random()*0.33,y:Math.random(),speed:0.002+Math.random()*0.002});
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">💧 ارتفاع الخزان: <span id="hy-head">30 m</span></div>
      <input type="range" min="5" max="80" value="30" oninput="window._hySet('head',this.value)" style="width:100%">
      <div class="ctrl-label" style="margin-top:8px">🔧 معدل التدفق: <span id="hy-flow">50%</span></div>
      <input type="range" min="10" max="100" value="50" oninput="window._hySet('flow',this.value)" style="width:100%">
      <div class="ctrl-btns-grid" style="margin-top:10px">
        <button class="ctrl-btn" onclick="window._hySet('head',10);window._hySet('flow',20)">⬇️ منخفض</button>
        <button class="ctrl-btn action" onclick="window._hySet('head',30);window._hySet('flow',50)">🔁 وسط</button>
        <button class="ctrl-btn" onclick="window._hySet('head',70);window._hySet('flow',90)">⬆️ عالٍ</button>
      </div>
    </div>
    <div class="q-box"><strong>💡 ماذا نستنتج؟</strong><br>القدرة = ρ × g × Q × h. رفع منسوب الماء أو زيادة التدفق يزيد الطاقة الكهرومائية المولَّدة.</div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9hydro'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    simState.t+=0.018;
    const t=simState.t, flowFrac=simState.flow/100, headFrac=simState.head/80;
    c.clearRect(0,0,w,h);
    const sky=c.createLinearGradient(0,0,0,h*0.5);
    sky.addColorStop(0,'#87CEEB'); sky.addColorStop(1,'#B8D8E8');
    c.fillStyle=sky; c.fillRect(0,0,w,h);
    c.fillStyle='#8B7355'; c.fillRect(0,h*0.72,w,h*0.28);
    c.fillStyle='#7A8A6A';
    c.beginPath(); c.moveTo(0,h*0.72); c.lineTo(0,h*0.38); c.lineTo(w*0.08,h*0.3); c.lineTo(w*0.12,h*0.72); c.closePath(); c.fill();
    c.fillStyle='#7A8A6A';
    c.beginPath(); c.moveTo(w*0.47,h*0.72); c.lineTo(w*0.47,h*0.25); c.lineTo(w*0.6,h*0.18); c.lineTo(w*0.72,h*0.72); c.closePath(); c.fill();
    const waterY=h*(0.3+0.25*(1-headFrac));
    const waterGrad=c.createLinearGradient(0,waterY,0,h*0.72);
    waterGrad.addColorStop(0,'#0EA5E9'); waterGrad.addColorStop(1,'#1D4ED8');
    c.fillStyle=waterGrad;
    c.beginPath(); c.moveTo(w*0.12,waterY);
    for(let x=w*0.12;x<=w*0.47;x+=8){ c.lineTo(x, waterY+Math.sin((x*0.05)+t*2.5)*3); }
    c.lineTo(w*0.47,h*0.72); c.lineTo(w*0.12,h*0.72); c.closePath(); c.fill();
    simState.particles.forEach(p=>{
      p.x += p.speed*flowFrac;
      if(p.x > 0.46) p.x = 0.13;
      const px=p.x*w, py=waterY+8+p.y*(h*0.72-waterY-16);
      if(py>h*0.72||py<waterY+4) return;
      c.fillStyle='rgba(180,230,255,0.5)'; c.beginPath(); c.arc(px,py,2.5,0,Math.PI*2); c.fill();
    });
    const damGrad=c.createLinearGradient(w*0.47,0,w*0.52,0);
    damGrad.addColorStop(0,'#4A5568'); damGrad.addColorStop(1,'#6B7280');
    c.fillStyle=damGrad;
    c.beginPath(); c.moveTo(w*0.47,h*0.22); c.lineTo(w*0.52,h*0.26); c.lineTo(w*0.52,h*0.72); c.lineTo(w*0.47,h*0.72); c.closePath(); c.fill();
    c.strokeStyle='#374151'; c.lineWidth=10;
    c.beginPath(); c.moveTo(w*0.49,h*0.55); c.lineTo(w*0.49,h*0.68); c.stroke();
    if(flowFrac>0.1){
      const jetLen=flowFrac*w*0.18;
      const jetGrad=c.createLinearGradient(w*0.49,h*0.68,w*0.49+jetLen,h*0.68);
      jetGrad.addColorStop(0,'#0EA5E9'); jetGrad.addColorStop(1,'rgba(14,165,233,0)');
      c.fillStyle=jetGrad;
      c.beginPath(); c.ellipse(w*0.49+jetLen/2,h*0.685,jetLen/2,5+flowFrac*6,0,0,Math.PI*2); c.fill();
    }
    const tx=w*0.58, ty=h*0.69;
    c.fillStyle='#374151'; c.beginPath(); c.arc(tx,ty,16,0,Math.PI*2); c.fill();
    c.save(); c.translate(tx,ty); c.rotate(t*3*flowFrac);
    c.fillStyle='#64748B';
    for(let i=0;i<4;i++){c.rotate(Math.PI/2);c.beginPath();c.moveTo(0,0);c.lineTo(12,4);c.lineTo(12,-4);c.closePath();c.fill();}
    c.restore();
    c.fillStyle='#4B5563'; c.beginPath(); c.roundRect(w*0.62,h*0.645,w*0.1,h*0.07,6); c.fill();
    c.fillStyle='rgba(255,220,60,0.9)'; c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText('⚡',w*0.67,h*0.7);
    c.strokeStyle='#F59E0B'; c.lineWidth=2.5; c.setLineDash([5,5]);
    c.beginPath(); c.moveTo(w*0.72,h*0.68); c.lineTo(w*0.88,h*0.68); c.stroke(); c.setLineDash([]);
    const P=Math.round(simState.head*flowFrac*12);
    const boxX=w*0.73, boxY=h*0.11;
    c.fillStyle='rgba(255,255,255,0.93)'; c.beginPath(); c.roundRect(boxX,boxY,w*0.24,h*0.34,14); c.fill();
    c.strokeStyle='rgba(14,165,233,0.3)'; c.lineWidth=1.5; c.stroke();
    c.fillStyle='#0C4A6E'; c.font=`bold ${Math.round(h*0.027)}px Tajawal`; c.textAlign='center';
    c.fillText('⚡ الطاقة المولَّدة',boxX+w*0.12,boxY+h*0.052);
    c.fillStyle='#0EA5E9'; c.font=`bold ${Math.round(h*0.042)}px Tajawal`;
    c.fillText(`${P} kW`,boxX+w*0.12,boxY+h*0.13);
    c.fillStyle='#555'; c.font=`${Math.round(h*0.022)}px Tajawal`;
    c.fillText(`ارتفاع: ${simState.head} m`,boxX+w*0.12,boxY+h*0.185);
    c.fillText(`تدفق: ${simState.flow}%`,boxX+w*0.12,boxY+h*0.235);
    const bY=boxY+h*0.275, bX=boxX+w*0.02, bW=w*0.2;
    c.fillStyle='#E0E0E0'; c.beginPath(); c.roundRect(bX,bY,bW,h*0.03,4); c.fill();
    const pGrad=c.createLinearGradient(bX,0,bX+bW,0);
    pGrad.addColorStop(0,'#0EA5E9'); pGrad.addColorStop(1,'#06B6D4');
    c.fillStyle=pGrad; c.beginPath(); c.roundRect(bX,bY,bW*Math.min(1,P/960),h*0.03,4); c.fill();
    c.fillStyle='rgba(30,45,61,0.85)'; c.font=`${Math.round(h*0.024)}px Tajawal`; c.textAlign='right';
    c.fillText(`↕ ${simState.head} m`,w*0.46,waterY+12);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}
function simG9Hydro2(){
  cancelAnimationFrame(animFrame);
  simState={tide:2.0,period:12};
  window._tdSet=(k,v)=>{simState[k]=+v; var el=document.getElementById('td-'+k); if(el) el.textContent=v;};
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌙 طاقة المدّ والجزر</div>
      <div class="ctrl-label">مدى المدّ: <span id="td-tide">2.0</span> m</div>
      <input type="range" min="0.5" max="6" step="0.1" value="2.0" oninput="window._tdSet('tide',this.value)" style="width:100%">
      <div class="ctrl-label" style="margin-top:8px">الدورة: <span id="td-period">12</span> ساعة</div>
      <input type="range" min="6" max="24" value="12" oninput="window._tdSet('period',this.value)" style="width:100%">
    </div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9hydro'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,t=Date.now()/1000;
    c.clearRect(0,0,w,h); c.fillStyle='#E0F2FE'; c.fillRect(0,0,w,h);
    const A=simState.tide*10;
    const y=h*0.55+Math.sin(t*2*Math.PI/simState.period)*A;
    c.fillStyle='#0EA5E9'; c.beginPath(); c.moveTo(0,y);
    for(let x=0;x<=w;x+=16){ c.lineTo(x, y+Math.sin((x+t*60)/40)*6); }
    c.lineTo(w,h); c.lineTo(0,h); c.closePath(); c.fill();
    const p=Math.round(simState.tide*simState.tide*22);
    c.fillStyle='rgba(30,45,61,0.9)'; c.font=`bold ${Math.min(18,Math.round(h*0.03))}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
    c.fillText('مدّ وجزر — مدى '+simState.tide+' m | دورة '+simState.period+' س', w/2, h*0.055);
    c.fillStyle='#0C4A6E'; c.font=`bold ${Math.round(h*0.034)}px Tajawal`; c.textBaseline='bottom';
    c.fillText('قدرة نسبية: '+p, w/2, h*0.92);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG9Fossil1(){
  cancelAnimationFrame(animFrame);
  simState={src:'coal', t:0};
  const DATA={
    coal:   {name:'الفحم',        emoji:'🪨', color:'#374151', co2:100, energy:65,  cost:35, risk:70, smoke:1.0},
    oil:    {name:'النفط',        emoji:'🛢️', color:'#78350F', co2:88,  energy:80,  cost:55, risk:55, smoke:0.75},
    gas:    {name:'الغاز الطبيعي', emoji:'🔥', color:'#0369A1', co2:55,  energy:78,  cost:60, risk:40, smoke:0.4},
    nuclear:{name:'نووي',         emoji:'⚛️', color:'#6B21A8', co2:5,   energy:95,  cost:80, risk:85, smoke:0.0}
  };
  window._fSrc=function(s){simState.src=s; const btns=document.querySelectorAll('.fossil-btn'); btns.forEach(b=>b.classList.remove('action')); const active=document.getElementById('fb-'+s); if(active) active.classList.add('action');};
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⛽ اختر مصدر الوقود</div>
      <div class="ctrl-btns-grid">
        <button id="fb-coal" class="ctrl-btn fossil-btn action" onclick="window._fSrc('coal')">🪨 فحم</button>
        <button id="fb-oil" class="ctrl-btn fossil-btn" onclick="window._fSrc('oil')">🛢️ نفط</button>
        <button id="fb-gas" class="ctrl-btn fossil-btn" onclick="window._fSrc('gas')">🔥 غاز</button>
        <button id="fb-nuclear" class="ctrl-btn fossil-btn" onclick="window._fSrc('nuclear')">⚛️ نووي</button>
      </div>
    </div>
    <div class="q-box"><strong>💡 ماذا نستنتج؟</strong><br>الوقود الأحفوري يُنتج CO₂ كثيراً. النووي كثافة عالية لكن مخاطر أعلى. الغاز أنظف الأحفوريات. لا مصدر مثالي.</div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9fossil'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    simState.t+=0.02;
    const t=simState.t, d=DATA[simState.src];
    c.clearRect(0,0,w,h);
    // Background
    const bgGrad=c.createLinearGradient(0,0,0,h);
    bgGrad.addColorStop(0,'#111827'); bgGrad.addColorStop(1,'#1F2937');
    c.fillStyle=bgGrad; c.fillRect(0,0,w,h);
    // Smoke / radiation effect
    if(d.smoke > 0){
      for(let i=0;i<5;i++){
        const sx=w*0.5+Math.sin(t*0.5+i*1.2)*w*0.08;
        const sy=h*(0.35-((t*0.06*d.smoke+i*0.12)%0.35));
        const alpha=Math.max(0, 0.3*d.smoke - ((t*0.06*d.smoke+i*0.12)%0.35)*0.8);
        const r=12+((t*30*d.smoke+i*40)%40);
        c.fillStyle=`rgba(150,150,150,${alpha})`;
        c.beginPath(); c.arc(sx,sy,r,0,Math.PI*2); c.fill();
      }
    } else {
      // Nuclear glow
      const glow=c.createRadialGradient(w*0.5,h*0.35,0,w*0.5,h*0.35,60);
      glow.addColorStop(0,`rgba(168,85,247,${0.2+0.1*Math.sin(t)})`);
      glow.addColorStop(1,'rgba(168,85,247,0)');
      c.fillStyle=glow; c.beginPath(); c.arc(w*0.5,h*0.35,60,0,Math.PI*2); c.fill();
    }
    // Source icon area
    c.fillStyle=d.color+'33'; c.beginPath(); c.arc(w*0.5,h*0.28,45,0,Math.PI*2); c.fill();
    c.strokeStyle=d.color; c.lineWidth=2.5; c.stroke();
    c.font=`${Math.round(h*0.065)}px serif`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(d.emoji,w*0.5,h*0.28);
    c.fillStyle='white'; c.font=`bold ${Math.round(h*0.032)}px Tajawal`; c.textBaseline='top';
    c.fillText(d.name,w*0.5,h*0.06);
    // Metrics bars
    const metrics=[
      {label:'كثافة الطاقة', val:d.energy, color:'#22C55E'},
      {label:'انبعاثات CO₂',  val:d.co2,    color:'#EF4444'},
      {label:'الكُلفة',       val:d.cost,   color:'#F59E0B'},
      {label:'المخاطر',       val:d.risk,   color:'#A855F7'},
    ];
    const barY0=h*0.5, barH=h*0.07, gap=h*0.095;
    metrics.forEach((m,i)=>{
      const y=barY0+i*gap;
      const barX=w*0.28, barW=w*0.56;
      // Label
      c.fillStyle='rgba(255,255,255,0.85)'; c.font=`${Math.round(h*0.026)}px Tajawal`; c.textAlign='right';
      c.fillText(m.label, w*0.26, y+barH*0.5);
      // Background bar
      c.fillStyle='rgba(255,255,255,0.08)'; c.beginPath(); c.roundRect(barX,y,barW,barH,5); c.fill();
      // Animated fill
      const anim=Math.min(m.val/100, simState.t/8);
      const fillGrad=c.createLinearGradient(barX,0,barX+barW,0);
      fillGrad.addColorStop(0,m.color+'BB'); fillGrad.addColorStop(1,m.color);
      c.fillStyle=fillGrad; c.beginPath(); c.roundRect(barX,y,barW*Math.min(1,anim),barH,5); c.fill();
      // Value text
      c.fillStyle='white'; c.font=`bold ${Math.round(h*0.024)}px Tajawal`; c.textAlign='left';
      c.fillText(`${m.val}%`, barX+barW*Math.min(1,m.val/100)+4, y+barH*0.55);
    });
    // Bottom summary line
    const isGood=d.co2<30;
    c.fillStyle=isGood?'#22C55E':'#F59E0B';
    c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText(isGood?'✅ انبعاثات منخفضة — خيار أنظف':'⚠️ انبعاثات عالية — تأثير على المناخ', w*0.5, h*0.94);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}
function simG9Fossil2(){
  cancelAnimationFrame(animFrame);
  simState={fossil:60, t:0};
  window._feSet=function(k,v){
    simState[k]=+v;
    if(k==='fossil') simState.renew=100-simState.fossil; else simState.fossil=100-simState.renew;
    var f=document.getElementById('fe-f'); var r=document.getElementById('fe-r');
    if(f) f.textContent=simState.fossil; if(r) r.textContent=(100-simState.fossil);
  };
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌍 مزيج الطاقة في المدينة</div>
      <div class="ctrl-label">⛽ أحفوري: <span id="fe-f">60</span>% — ♻️ متجدد: <span id="fe-r">40</span>%</div>
      <input type="range" min="0" max="100" value="60" oninput="window._feSet('fossil',this.value)" style="width:100%">
      <div class="ctrl-btns-grid" style="margin-top:10px">
        <button class="ctrl-btn" onclick="window._feSet('fossil',100)">💨 أحفوري كلياً</button>
        <button class="ctrl-btn action" onclick="window._feSet('fossil',50)">⚖️ مختلط</button>
        <button class="ctrl-btn" onclick="window._feSet('fossil',0)">🌿 متجدد كلياً</button>
      </div>
    </div>
    <div class="q-box"><strong>💡 ماذا نستنتج؟</strong><br>كلما زاد الاعتماد على المصادر المتجددة، قلّت انبعاثات CO₂ وتحسّن هواء المدينة وصحة السكان.</div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9fossil'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    simState.t+=0.02;
    const t=simState.t, frac=simState.fossil/100, clean=1-frac;
    c.clearRect(0,0,w,h);
    // Dynamic sky based on pollution
    const skyR=Math.round(100+frac*80), skyG=Math.round(150-frac*60), skyB=Math.round(200-frac*80);
    const skyGrad=c.createLinearGradient(0,0,0,h*0.65);
    skyGrad.addColorStop(0,`rgb(${skyR},${skyG},${skyB})`);
    skyGrad.addColorStop(1,`rgb(${skyR+30},${skyG+20},${skyB-30})`);
    c.fillStyle=skyGrad; c.fillRect(0,0,w,h);
    // Smog layer
    if(frac>0.1){
      const smogAlpha=frac*0.5;
      c.fillStyle=`rgba(120,100,60,${smogAlpha})`;
      c.fillRect(0,h*0.35,w,h*0.2);
    }
    // Sun / visibility
    const sunAlpha=0.2+clean*0.75;
    const sunGlow=c.createRadialGradient(w*0.8,h*0.1,0,w*0.8,h*0.1,55);
    sunGlow.addColorStop(0,`rgba(255,240,100,${sunAlpha})`);
    sunGlow.addColorStop(1,'rgba(255,240,100,0)');
    c.fillStyle=sunGlow; c.beginPath(); c.arc(w*0.8,h*0.1,55,0,Math.PI*2); c.fill();
    c.fillStyle=`rgba(255,220,60,${sunAlpha})`; c.beginPath(); c.arc(w*0.8,h*0.1,22,0,Math.PI*2); c.fill();
    // Smoke stacks (based on fossil %)
    const nStacks=Math.round(frac*5)+1;
    for(let i=0;i<nStacks;i++){
      const sx=w*(0.1+i*0.18), sy=h*0.58;
      c.fillStyle='#374151'; c.fillRect(sx-8,sy-h*0.12,16,h*0.12);
      // Smoke puffs
      for(let p=0;p<4;p++){
        const py=(t*0.06*frac+p*0.18)%0.28;
        const pr=10+py*35;
        const pa=Math.max(0,frac*0.5*(1-py/0.28));
        c.fillStyle=`rgba(100,90,70,${pa})`;
        c.beginPath(); c.arc(sx+Math.sin(t+p)*8, sy-h*0.12-h*py, pr, 0, Math.PI*2); c.fill();
      }
    }
    // Renewable elements (solar panels on rooftops, wind turbines)
    if(clean>0.2){
      // Wind turbines
      for(let i=0;i<Math.round(clean*3);i++){
        const tx=w*(0.15+i*0.3), ty=h*0.45;
        c.strokeStyle='rgba(100,180,220,0.85)'; c.lineWidth=3;
        c.beginPath(); c.moveTo(tx,ty); c.lineTo(tx,ty+h*0.12); c.stroke();
        c.save(); c.translate(tx,ty); c.rotate(t*2.5*clean);
        c.fillStyle='rgba(100,180,220,0.75)';
        for(let b=0;b<3;b++){c.rotate(Math.PI*2/3);c.beginPath();c.moveTo(0,0);c.lineTo(18,4);c.lineTo(18,-4);c.closePath();c.fill();}
        c.restore();
      }
    }
    // City buildings
    const buildings=[[0.04,0.32,0.1],[0.16,0.22,0.12],[0.29,0.28,0.1],[0.55,0.2,0.13],[0.7,0.3,0.09],[0.82,0.18,0.12],[0.91,0.26,0.07]];
    buildings.forEach(([bx,bh,bw])=>{
      c.fillStyle=`rgba(40,50,60,${0.6+frac*0.3})`;
      c.fillRect(w*bx,h*(1-bh),w*bw,h*bh);
      // Windows
      c.fillStyle=`rgba(255,240,150,${0.4+clean*0.4})`;
      for(let wr=0;wr<4;wr++) for(let wc=0;wc<3;wc++){
        c.fillRect(w*bx+wc*(w*bw/3)+3,h*(1-bh)+wr*(h*bh/5)+5,w*bw/4,h*bh/7);
      }
    });
    // Ground
    c.fillStyle=`rgb(${Math.round(60-frac*20)},${Math.round(80-frac*15)},${Math.round(40)})`;
    c.fillRect(0,h*0.78,w,h*0.22);
    // CO2 indicator panel
    const co2=Math.round(frac*90+clean*15);
    const pColor=co2>65?'#EF4444':co2>35?'#F59E0B':'#22C55E';
    const panX=w*0.03, panY=h*0.05;
    c.fillStyle='rgba(0,0,0,0.6)'; c.beginPath(); c.roundRect(panX,panY,w*0.42,h*0.3,14); c.fill();
    c.fillStyle='rgba(255,255,255,0.9)'; c.font=`bold ${Math.round(h*0.027)}px Tajawal`; c.textAlign='center';
    c.fillText('مؤشر انبعاثات CO₂',panX+w*0.21,panY+h*0.055);
    c.fillStyle=pColor; c.font=`bold ${Math.round(h*0.06)}px Tajawal`;
    c.fillText(`${co2}`,panX+w*0.21,panY+h*0.155);
    c.fillStyle='rgba(255,255,255,0.75)'; c.font=`${Math.round(h*0.025)}px Tajawal`;
    c.fillText(co2>65?'⚠️ تلوث عالٍ':co2>35?'🔶 متوسط':'✅ نظيف',panX+w*0.21,panY+h*0.22);
    // CO2 bar
    const bX=panX+w*0.03, bY=panY+h*0.25, bW=w*0.36;
    c.fillStyle='rgba(255,255,255,0.15)'; c.beginPath(); c.roundRect(bX,bY,bW,h*0.028,4); c.fill();
    c.fillStyle=pColor; c.beginPath(); c.roundRect(bX,bY,bW*(co2/100),h*0.028,4); c.fill();
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG9Efficiency1(){
  cancelAnimationFrame(animFrame);
  simState={Ein:100, Eout:65, device:'bulb', t:0};
  const DEVICES={
    bulb:   {name:'مصباح كهربائي', emoji:'💡', defaultEff:15, color:'#F59E0B'},
    led:    {name:'LED', emoji:'🔦', defaultEff:80, color:'#22C55E'},
    motor:  {name:'محرك كهربائي', emoji:'⚙️', defaultEff:70, color:'#3B82F6'},
    car:    {name:'محرك سيارة', emoji:'🚗', defaultEff:25, color:'#EF4444'},
    solar:  {name:'لوح شمسي', emoji:'☀️', defaultEff:18, color:'#D97706'},
  };
  window._effDev=function(d){
    simState.device=d;
    simState.Eout=Math.round(simState.Ein*DEVICES[d].defaultEff/100);
    var s=document.getElementById('eff-s'); if(s){s.min=1;s.max=simState.Ein;s.value=simState.Eout;}
    var ev=document.getElementById('eff-eout'); if(ev) ev.textContent=simState.Eout;
  };
  window._effSetOut=function(v){simState.Eout=Math.min(+v, simState.Ein); var e=document.getElementById('eff-eout'); if(e) e.textContent=simState.Eout;};
  window._effSetIn=function(v){simState.Ein=+v; simState.Eout=Math.min(simState.Eout,simState.Ein); var e=document.getElementById('eff-ein'); if(e) e.textContent=v; var s=document.getElementById('eff-s'); if(s){s.max=v;s.value=simState.Eout;}};
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔧 اختر الجهاز</div>
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn action" onclick="window._effDev('bulb')">💡 مصباح</button>
        <button class="ctrl-btn" onclick="window._effDev('led')">🔦 LED</button>
        <button class="ctrl-btn" onclick="window._effDev('motor')">⚙️ محرك</button>
        <button class="ctrl-btn" onclick="window._effDev('car')">🚗 سيارة</button>
        <button class="ctrl-btn" onclick="window._effDev('solar')">☀️ شمسي</button>
      </div>
      <div class="ctrl-label" style="margin-top:8px">طاقة الدخل Ein: <span id="eff-ein">100</span> J</div>
      <input type="range" min="20" max="300" value="100" oninput="window._effSetIn(this.value)" style="width:100%">
      <div class="ctrl-label" style="margin-top:8px">طاقة الخرج Eout: <span id="eff-eout">65</span> J</div>
      <input id="eff-s" type="range" min="1" max="100" value="65" oninput="window._effSetOut(this.value)" style="width:100%">
    </div>
    <div class="q-box"><strong>💡 الكفاءة = Eout ÷ Ein × 100%</strong><br>جرّب أجهزة مختلفة وقارن كفاءتها. LED أكفأ من المصباح العادي بكثير!</div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9efficiency'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    simState.t+=0.022;
    const t=simState.t, dev=DEVICES[simState.device];
    const eff=simState.Ein>0?(simState.Eout/simState.Ein)*100:0;
    const loss=100-eff;
    c.clearRect(0,0,w,h);
    c.fillStyle='#0F172A'; c.fillRect(0,0,w,h);
    // Title
    c.fillStyle='white'; c.font=`bold ${Math.round(h*0.038)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
    c.fillText(`${dev.emoji} ${dev.name}`, w*0.5, h*0.03);
    // Sankey-style flow diagram
    const flowY=h*0.22, flowH=h*0.12, boxW=w*0.18, boxH=flowH;
    // Input box (left)
    c.fillStyle='rgba(59,130,246,0.25)'; c.beginPath(); c.roundRect(w*0.04,flowY,boxW,boxH,8); c.fill();
    c.strokeStyle='#3B82F6'; c.lineWidth=2; c.stroke();
    c.fillStyle='#93C5FD'; c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText(`Ein`,w*0.04+boxW/2,flowY+boxH*0.22);
    c.fillStyle='#DBEAFE'; c.font=`bold ${Math.round(h*0.034)}px Tajawal`;
    c.fillText(`${simState.Ein} J`,w*0.04+boxW/2,flowY+boxH*0.62);
    // Main flow arrow
    const arrowColor='#60A5FA';
    const flowX1=w*0.04+boxW, flowX2=w*0.4;
    c.strokeStyle=arrowColor; c.lineWidth=Math.max(8, flowH*0.5);
    c.lineCap='round'; c.beginPath(); c.moveTo(flowX1,flowY+boxH/2); c.lineTo(flowX2,flowY+boxH/2); c.stroke();
    c.lineCap='butt';
    // Animated energy particles on main flow
    for(let i=0;i<5;i++){
      const px=flowX1+((flowX2-flowX1)*((t*0.35+i*0.2)%1));
      c.fillStyle='rgba(255,255,255,0.7)'; c.beginPath(); c.arc(px,flowY+boxH/2,4,0,Math.PI*2); c.fill();
    }
    // Device box (center)
    c.fillStyle=dev.color+'44'; c.beginPath(); c.roundRect(w*0.4,flowY-boxH*0.3,boxW*1.1,boxH*1.6,12); c.fill();
    c.strokeStyle=dev.color; c.lineWidth=2.5; c.stroke();
    c.font=`${Math.round(h*0.05)}px serif`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(dev.emoji, w*0.4+boxW*0.55, flowY+boxH*0.5);
    // Useful output arrow (right)
    const outFrac=Math.max(0.03,eff/100);
    const outH=Math.max(6,flowH*outFrac);
    c.strokeStyle=dev.color; c.lineWidth=Math.max(4,outH);
    c.lineCap='round'; c.beginPath();
    c.moveTo(w*0.4+boxW*1.1, flowY+boxH/2);
    c.lineTo(w*0.82, flowY+boxH/2); c.stroke(); c.lineCap='butt';
    // Animated useful output particles
    for(let i=0;i<4;i++){
      const px=(w*0.4+boxW*1.1)+((w*0.82-(w*0.4+boxW*1.1))*((t*0.3+i*0.25)%1));
      c.fillStyle=dev.color+'CC'; c.beginPath(); c.arc(px,flowY+boxH/2,3,0,Math.PI*2); c.fill();
    }
    // Output box (right)
    c.fillStyle=dev.color+'22'; c.beginPath(); c.roundRect(w*0.82,flowY,boxW,boxH,8); c.fill();
    c.strokeStyle=dev.color; c.lineWidth=2; c.stroke();
    c.fillStyle=dev.color; c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
    c.fillText('Eout',w*0.82+boxW/2,flowY+boxH*0.22);
    c.font=`bold ${Math.round(h*0.034)}px Tajawal`;
    c.fillText(`${simState.Eout} J`,w*0.82+boxW/2,flowY+boxH*0.62);
    // Heat loss arrow (downward)
    if(loss>2){
      const lossH=Math.max(6,flowH*(loss/100));
      c.strokeStyle='#EF4444'; c.lineWidth=Math.max(3,lossH*0.7); c.lineCap='round';
      c.beginPath(); c.moveTo(w*0.55,flowY+boxH/2); c.lineTo(w*0.55,flowY+boxH/2+h*0.14); c.stroke(); c.lineCap='butt';
      // Arrow head
      c.fillStyle='#EF4444';
      c.beginPath(); c.moveTo(w*0.55,flowY+boxH/2+h*0.15); c.lineTo(w*0.52,flowY+boxH/2+h*0.12); c.lineTo(w*0.58,flowY+boxH/2+h*0.12); c.closePath(); c.fill();
      // Heat label
      c.fillStyle='#FCA5A5'; c.font=`${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
      c.fillText(`طاقة مهدرة: ${(simState.Ein-simState.Eout)} J`,w*0.55,flowY+boxH/2+h*0.18);
      // Heat animation
      for(let i=0;i<3;i++){
        const hy=flowY+boxH/2+h*0.06*((t*0.4+i*0.33)%1);
        c.fillStyle=`rgba(239,68,68,${0.4-((t*0.4+i*0.33)%1)*0.4})`;
        c.font=`${Math.round(h*0.028)}px serif`; c.fillText('🌡️',w*0.55+Math.sin(t+i*2)*12,hy);
      }
    }
    // Big efficiency display
    const effColor=eff>=60?'#22C55E':eff>=30?'#F59E0B':'#EF4444';
    const bigY=h*0.56;
    c.fillStyle='rgba(255,255,255,0.06)'; c.beginPath(); c.roundRect(w*0.15,bigY,w*0.7,h*0.3,18); c.fill();
    c.fillStyle=effColor; c.font=`bold ${Math.round(h*0.072)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
    c.fillText(`${eff.toFixed(1)}%`, w*0.5, bigY+h*0.03);
    c.fillStyle='rgba(255,255,255,0.7)'; c.font=`${Math.round(h*0.026)}px Tajawal`;
    c.fillText(`الكفاءة = ${simState.Eout} ÷ ${simState.Ein} × 100`, w*0.5, bigY+h*0.135);
    c.fillStyle=effColor; c.font=`${Math.round(h*0.025)}px Tajawal`;
    c.fillText(eff>=60?'✅ جيد':eff>=30?'🔶 متوسط':'❌ منخفض — معظم الطاقة تُهدر', w*0.5, bigY+h*0.195);
    // Progress arc
    const arcX=w*0.5, arcY=bigY-h*0.03;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}
function simG9Efficiency2(){
  cancelAnimationFrame(animFrame);
  simState={lossType:'heat', loss:35, t:0};
  window._lsSet=function(v){simState.loss=+v; var e=document.getElementById('ls-v'); if(e) e.textContent=v+'%';};
  window._lsType=function(t){
    simState.lossType=t;
    const btns=['heat','friction','sound']; btns.forEach(b=>{ var el=document.getElementById('lt-'+b); if(el) el.classList.remove('action'); });
    var a=document.getElementById('lt-'+t); if(a) a.classList.add('action');
  };
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">♻️ نوع الطاقة المهدرة</div>
      <div class="ctrl-btns-grid">
        <button id="lt-heat" class="ctrl-btn action" onclick="window._lsType('heat')">🔥 حرارة</button>
        <button id="lt-friction" class="ctrl-btn" onclick="window._lsType('friction')">⚙️ احتكاك</button>
        <button id="lt-sound" class="ctrl-btn" onclick="window._lsType('sound')">🔊 صوت</button>
      </div>
      <div class="ctrl-label" style="margin-top:8px">نسبة الفاقد: <span id="ls-v">35%</span></div>
      <input type="range" min="5" max="80" value="35" oninput="window._lsSet(this.value)" style="width:100%">
      <div class="ctrl-btns-grid" style="margin-top:10px">
        <button class="ctrl-btn" onclick="window._lsSet(75);document.getElementById('ls-v').textContent='75%'">📉 فاقد عالٍ</button>
        <button class="ctrl-btn action" onclick="window._lsSet(35);document.getElementById('ls-v').textContent='35%'">⚖️ متوسط</button>
        <button class="ctrl-btn" onclick="window._lsSet(8);document.getElementById('ls-v').textContent='8%'">📈 فاقد منخفض</button>
      </div>
    </div>
    <div class="q-box"><strong>💡 ماذا نستنتج؟</strong><br>تقليل الفاقد بالعزل الحراري أو التزييت يرفع كفاءة الجهاز دون الحاجة لطاقة إضافية.</div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9efficiency'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    simState.t+=0.022;
    const t=simState.t, lossFrac=simState.loss/100, eff=1-lossFrac;
    c.clearRect(0,0,w,h);
    c.fillStyle='#0F172A'; c.fillRect(0,0,w,h);
    c.fillStyle='rgba(255,255,255,0.9)'; c.font=`bold ${Math.round(h*0.036)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
    c.fillText('نظام تحويل الطاقة', w*0.5, h*0.03);
    // Machine body
    const mx=w*0.38, my=h*0.3, mw=w*0.24, mh=h*0.22;
    const machineGrad=c.createLinearGradient(mx,my,mx+mw,my+mh);
    machineGrad.addColorStop(0,'#1E3A5F'); machineGrad.addColorStop(1,'#2D5A8E');
    c.fillStyle=machineGrad; c.beginPath(); c.roundRect(mx,my,mw,mh,12); c.fill();
    c.strokeStyle='rgba(100,160,220,0.5)'; c.lineWidth=2; c.stroke();
    // Spinning gear inside machine
    c.save(); c.translate(mx+mw/2, my+mh/2); c.rotate(t*(1+eff));
    c.strokeStyle='rgba(100,200,255,0.7)'; c.lineWidth=3;
    for(let i=0;i<8;i++){
      c.rotate(Math.PI/4);
      c.beginPath(); c.moveTo(0,12); c.lineTo(0,22); c.stroke();
    }
    c.beginPath(); c.arc(0,0,12,0,Math.PI*2); c.fillStyle='rgba(100,200,255,0.3)'; c.fill(); c.stroke();
    c.restore();
    // Input energy arrow
    c.strokeStyle='#3B82F6'; c.lineWidth=10+lossFrac*5; c.lineCap='round';
    c.beginPath(); c.moveTo(w*0.06,my+mh/2); c.lineTo(mx,my+mh/2); c.stroke(); c.lineCap='butt';
    c.fillStyle='#93C5FD'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText('طاقة الدخل', w*0.14, my+mh/2-h*0.05);
    c.fillText('100%', w*0.14, my+mh/2+h*0.025);
    for(let i=0;i<4;i++){
      const px=w*0.06+((w*0.32-w*0.06)*((t*0.3+i*0.25)%1));
      c.fillStyle='rgba(147,197,253,0.8)'; c.beginPath(); c.arc(px,my+mh/2,4,0,Math.PI*2); c.fill();
    }
    // Useful output arrow
    const outW=6+eff*16;
    c.strokeStyle='#22C55E'; c.lineWidth=outW; c.lineCap='round';
    c.beginPath(); c.moveTo(mx+mw, my+mh/2); c.lineTo(w*0.94,my+mh/2); c.stroke(); c.lineCap='butt';
    c.fillStyle='#86EFAC'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText('طاقة مفيدة', w*0.86, my+mh/2-h*0.05);
    c.fillStyle='#22C55E'; c.fillText(`${Math.round(eff*100)}%`, w*0.86, my+mh/2+h*0.025);
    for(let i=0;i<4;i++){
      const px=(mx+mw)+((w*0.94-(mx+mw))*((t*0.28+i*0.25)%1));
      c.fillStyle='rgba(134,239,172,0.8)'; c.beginPath(); c.arc(px,my+mh/2,3+eff*2,0,Math.PI*2); c.fill();
    }
    // Loss arrow (downward)
    const lossType=simState.lossType;
    const lossColor=lossType==='heat'?'#EF4444':lossType==='friction'?'#F59E0B':'#A855F7';
    const lossEmoji=lossType==='heat'?'🔥':lossType==='friction'?'⚙️':'🔊';
    const lossLabel=lossType==='heat'?'طاقة حرارية':lossType==='friction'?'احتكاك':'صوت';
    const lossW=Math.max(5,lossFrac*22);
    c.strokeStyle=lossColor; c.lineWidth=lossW; c.lineCap='round';
    c.beginPath(); c.moveTo(mx+mw/2,my+mh); c.lineTo(mx+mw/2,h*0.7); c.stroke(); c.lineCap='butt';
    c.fillStyle=lossColor; c.beginPath(); c.moveTo(mx+mw/2,h*0.72); c.lineTo(mx+mw/2-12,h*0.68); c.lineTo(mx+mw/2+12,h*0.68); c.closePath(); c.fill();
    // Animated loss particles
    for(let i=0;i<Math.round(lossFrac*6);i++){
      const ry=(my+mh)+((h*0.7-(my+mh))*((t*0.25*lossFrac+i*0.18)%1));
      const rx=mx+mw/2+Math.sin(t*2+i)*15*lossFrac;
      const ra=Math.max(0,0.7-(((t*0.25*lossFrac+i*0.18)%1)*0.8));
      c.fillStyle=lossColor.replace(')',`,${ra})`).replace('rgb','rgba');
      c.font=`${Math.round(h*0.025)}px serif`; c.textAlign='center';
      c.fillText(lossEmoji,rx,ry);
    }
    c.fillStyle=lossColor; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText(`${lossLabel}: ${simState.loss}%`, mx+mw/2, h*0.77);
    // Bottom efficiency display
    const effColor=eff>0.65?'#22C55E':eff>0.4?'#F59E0B':'#EF4444';
    const dispY=h*0.81;
    c.fillStyle='rgba(255,255,255,0.05)'; c.beginPath(); c.roundRect(w*0.12,dispY,w*0.76,h*0.14,14); c.fill();
    // Horizontal efficiency bar
    const barX=w*0.16, barW=w*0.68, barY2=dispY+h*0.03;
    c.fillStyle='rgba(239,68,68,0.3)'; c.beginPath(); c.roundRect(barX,barY2,barW,h*0.035,6); c.fill();
    const effGrad=c.createLinearGradient(barX,0,barX+barW,0);
    effGrad.addColorStop(0,'#22C55E'); effGrad.addColorStop(0.6,'#86EFAC'); effGrad.addColorStop(1,'#F59E0B');
    c.fillStyle=effGrad; c.beginPath(); c.roundRect(barX,barY2,barW*eff,h*0.035,6); c.fill();
    c.fillStyle='white'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText(`الكفاءة = ${Math.round(eff*100)}% — الفاقد = ${simState.loss}%`, w*0.5, dispY+h*0.1);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// الصف التاسع — الوحدة 12: صورة المرآة المستوية (١٢-٢)
// ══════════════════════════════════════════════════════════
function simG9Mirror1(){
  cancelAnimationFrame(animFrame);
  simState={objD:120, t:0};
  window._mirD=function(v){simState.objD=+v; var e=document.getElementById('mir-d'); if(e) e.textContent=v+' px';};
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🕯️ خصائص صورة المرآة المستوية</div>
      <div class="ctrl-label">📏 بعد الجسم عن المرآة: <span id="mir-d">120 px</span></div>
      <input type="range" min="30" max="260" value="120" oninput="window._mirD(this.value)" style="width:100%">
      <div class="ctrl-btns-grid" style="margin-top:8px">
        <button class="ctrl-btn" onclick="window._mirD(50)">🔍 قريب</button>
        <button class="ctrl-btn action" onclick="window._mirD(120)">📍 وسط</button>
        <button class="ctrl-btn" onclick="window._mirD(230)">🔭 بعيد</button>
      </div>
    </div>
    <div class="q-box"><strong>💡 ماذا نستنتج؟</strong><br>صورة المرآة المستوية دائماً: تقديرية، معتدلة (غير مقلوبة)، بحجم الجسم نفسه، وبعدها خلف المرآة يساوي بعد الجسم أمامها.</div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9mirror'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    simState.t+=0.018;
    const t=simState.t, d=simState.objD;
    c.clearRect(0,0,w,h);
    // Background
    c.fillStyle='#F8FAFC'; c.fillRect(0,0,w,h*0.85);
    c.fillStyle='#EEE8E0'; c.fillRect(0,h*0.85,w,h*0.15);
    // Mirror (vertical, center)
    const mx=w*0.52;
    // Mirror surface with shimmer
    const mirGrad=c.createLinearGradient(mx,0,mx+18,0);
    mirGrad.addColorStop(0,'#94A3B8'); mirGrad.addColorStop(0.4,'#E2E8F0'); mirGrad.addColorStop(1,'#94A3B8');
    c.fillStyle=mirGrad; c.fillRect(mx,h*0.12,18,h*0.68);
    // Mirror hatch marks (indicating it's a mirror)
    c.strokeStyle='#64748B'; c.lineWidth=1.5;
    for(let i=0;i<12;i++){
      const y=h*0.12+i*(h*0.68/12);
      c.beginPath(); c.moveTo(mx+18,y); c.lineTo(mx+28,y+10); c.stroke();
    }
    // Object (candle) - left of mirror
    const ox=mx-d, oh=h*0.2;
    // Candle body
    c.fillStyle='#F59E0B'; c.fillRect(ox-8,h*0.55,16,oh*0.6);
    // Candle flame
    const flameY=h*0.55-oh*0.1;
    const flamePulse=Math.sin(t*4)*3;
    c.fillStyle='rgba(255,200,50,0.9)';
    c.beginPath(); c.ellipse(ox,flameY+flamePulse/2,8,14+flamePulse,0,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,100,30,0.7)';
    c.beginPath(); c.ellipse(ox,flameY+2+flamePulse/2,4,8,0,0,Math.PI*2); c.fill();
    // Object label
    c.fillStyle='#92400E'; c.font=`bold ${Math.round(h*0.025)}px Tajawal`; c.textAlign='center';
    c.fillText('الجسم', ox, h*0.5-oh*0.1-h*0.03);
    c.fillText(`${d} px`, ox, h*0.5-oh*0.1-h*0.065);
    // Rays from flame tip to mirror
    const rays=[-0.3, 0, 0.3];
    rays.forEach(ra=>{
      const ry=h*0.55-oh*0.1+flameY*0+h*0.01;
      const hitY=h*0.55-oh*0.1 + ra*h*0.25;
      const hitX=mx;
      // Incident ray
      c.strokeStyle='rgba(245,158,11,0.5)'; c.lineWidth=1.8; c.setLineDash([4,4]);
      c.beginPath(); c.moveTo(ox,h*0.55-oh*0.1); c.lineTo(hitX,Math.max(h*0.14,Math.min(h*0.78,hitY))); c.stroke();
      // Reflected ray (toward eye)
      const eyeX=w*0.06, eyeY=h*0.45;
      c.strokeStyle='rgba(6,182,212,0.45)'; c.lineWidth=1.8;
      c.beginPath(); c.moveTo(hitX,Math.max(h*0.14,Math.min(h*0.78,hitY))); c.lineTo(eyeX,eyeY); c.stroke();
      c.setLineDash([]);
    });
    // Virtual image (right of mirror, same distance)
    const ix=mx+d, imgH=oh;
    // Ghost image (dashed, translucent)
    c.globalAlpha=0.38;
    c.fillStyle='#F59E0B'; c.fillRect(ix-8,h*0.55,16,imgH*0.6);
    c.fillStyle='rgba(255,200,50,0.9)';
    c.beginPath(); c.ellipse(ix,h*0.55-imgH*0.1,8,14,0,0,Math.PI*2); c.fill();
    c.globalAlpha=1;
    // Dashed line from object to image through mirror
    c.strokeStyle='rgba(30,45,61,0.25)'; c.lineWidth=1.5; c.setLineDash([5,5]);
    c.beginPath(); c.moveTo(ox,h*0.55-oh*0.1); c.lineTo(ix,h*0.55-imgH*0.1); c.stroke(); c.setLineDash([]);
    // Distance markers
    c.strokeStyle='#1A8FA8'; c.lineWidth=1.5;
    const lineY=h*0.82;
    c.beginPath(); c.moveTo(ox,lineY); c.lineTo(mx,lineY); c.stroke();
    c.beginPath(); c.moveTo(mx,lineY); c.lineTo(ix,lineY); c.stroke();
    [[ox,mx,'أمام المرآة'],[mx,ix,'خلف المرآة']].forEach(([x1,x2,lbl],i)=>{
      const mid=(x1+x2)/2;
      c.fillStyle=i===0?'#1A8FA8':'rgba(30,45,61,0.45)';
      c.font=`${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
      c.fillText(lbl,mid,lineY-h*0.02);
      c.fillText(`${d} px`,mid,lineY+h*0.03);
    });
    // Properties panel
    const panX=w*0.62, panY=h*0.09;
    c.fillStyle='rgba(255,255,255,0.96)'; c.beginPath(); c.roundRect(panX,panY,w*0.34,h*0.42,14); c.fill();
    c.strokeStyle='rgba(26,143,168,0.35)'; c.lineWidth=1.5; c.stroke();
    c.fillStyle='#0C4A6E'; c.font=`bold ${Math.round(h*0.027)}px Tajawal`; c.textAlign='center';
    c.fillText('📊 خصائص الصورة',panX+w*0.17,panY+h*0.052);
    const props=[['النوع','تقديرية 🔮'],['الاتجاه','معتدلة ✅'],['الحجم','مساوٍ للجسم'],['البعد',d+' px (خلف)'],['الجانب','مقلوبة جانبياً ↔️']];
    props.forEach(([k,v],i)=>{
      c.fillStyle='#1E3A8A'; c.font=`bold ${Math.round(h*0.023)}px Tajawal`; c.textAlign='right';
      c.fillText(k+':',panX+w*0.18,panY+h*(0.115+i*0.065));
      c.fillStyle='#374151'; c.font=`${Math.round(h*0.022)}px Tajawal`; c.textAlign='left';
      c.fillText(v,panX+w*0.19,panY+h*(0.115+i*0.065));
    });
    // Eye
    c.font=`${Math.round(h*0.04)}px serif`; c.textAlign='center';
    c.fillText('👁️',w*0.06,h*0.48);
    c.fillStyle='rgba(30,45,61,0.55)'; c.font=`${Math.round(h*0.022)}px Tajawal`;
    c.fillText('المراقب',w*0.06,h*0.52);
    // Image label
    c.fillStyle='rgba(30,45,61,0.4)'; c.font=`bold ${Math.round(h*0.023)}px Tajawal`; c.textAlign='center';
    c.fillText('الصورة التقديرية',ix,h*0.44);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG9Mirror2(){
  cancelAnimationFrame(animFrame);
  simState={t:0, word:'مرحبا', step:0};
  const WORDS=['مرحبا','عُمان','سيارة'];
  window._mirWord=function(i){simState.word=WORDS[i]; var btns=document.querySelectorAll('.mw-btn'); btns.forEach(b=>b.classList.remove('action')); var el=document.getElementById('mw-'+i); if(el) el.classList.add('action');};
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">↔️ الانعكاس الجانبي (Left-Right Inverted)</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.75);line-height:1.6;margin-top:4px">
        في المرآة المستوية الصورة مقلوبة من اليسار إلى اليمين — وهذا سبب انعكاس الكتابة.
      </div>
      <div class="ctrl-label" style="margin-top:8px">اختر كلمة:</div>
      <div class="ctrl-btns-grid">
        <button id="mw-0" class="ctrl-btn mw-btn action" onclick="window._mirWord(0)">مرحبا</button>
        <button id="mw-1" class="ctrl-btn mw-btn" onclick="window._mirWord(1)">عُمان</button>
        <button id="mw-2" class="ctrl-btn mw-btn" onclick="window._mirWord(2)">سيارة</button>
      </div>
    </div>
    <div class="q-box"><strong>💡 ماذا نستنتج؟</strong><br>الصورة في المرآة مقلوبة جانبياً (يمين↔يسار) لكنها غير مقلوبة رأسياً. لهذا تبدو الكتابة معكوسة في المرآة.</div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9mirror'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    simState.t+=0.02;
    const t=simState.t;
    c.clearRect(0,0,w,h);
    c.fillStyle='#1E293B'; c.fillRect(0,0,w,h);
    // Mirror line
    const mx=w*0.5;
    const mirGrad=c.createLinearGradient(mx,0,mx+14,0);
    mirGrad.addColorStop(0,'#64748B'); mirGrad.addColorStop(0.5,'#CBD5E1'); mirGrad.addColorStop(1,'#64748B');
    c.fillStyle=mirGrad; c.fillRect(mx,h*0.08,14,h*0.84);
    c.fillStyle='rgba(203,213,225,0.15)'; c.fillRect(mx,h*0.08,14,h*0.84);
    // Shimmer animation
    const shimY=(t*0.3%1)*h*0.84+h*0.08;
    const shimGrad=c.createLinearGradient(0,shimY-20,0,shimY+20);
    shimGrad.addColorStop(0,'rgba(255,255,255,0)');
    shimGrad.addColorStop(0.5,'rgba(255,255,255,0.3)');
    shimGrad.addColorStop(1,'rgba(255,255,255,0)');
    c.fillStyle=shimGrad; c.fillRect(mx,shimY-20,14,40);
    // Person/Object (left)
    const person=[
      {emoji:'👤',y:0.35,size:0.1},
    ];
    c.font=`${Math.round(h*0.12)}px serif`; c.textAlign='center';
    c.fillText('🧍',mx-w*0.2, h*0.55);
    c.fillStyle='#94A3B8'; c.font=`${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText('الشخص', mx-w*0.2, h*0.63);
    // Word written (normal)
    const fontSize=Math.round(h*0.06);
    c.font=`bold ${fontSize}px Tajawal`; c.textAlign='center';
    c.fillStyle='#F59E0B';
    c.fillText(simState.word, mx-w*0.2, h*0.75);
    // Mirror image (right) - horizontally flipped
    c.save();
    c.translate(mx+w*0.2*2, 0);
    c.scale(-1, 1);
    // Mirror person
    c.font=`${Math.round(h*0.12)}px serif`; c.textAlign='center';
    c.globalAlpha=0.7;
    c.fillText('🧍', mx-w*0.2, h*0.55);
    // Mirror word (flipped)
    c.font=`bold ${fontSize}px Tajawal`;
    c.fillStyle='rgba(6,182,212,0.85)';
    c.fillText(simState.word, mx-w*0.2, h*0.75);
    c.globalAlpha=1;
    c.restore();
    // Labels
    c.fillStyle='rgba(6,182,212,0.8)'; c.font=`${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText('الصورة في المرآة',mx+w*0.2,h*0.63);
    // Rays showing reflection
    for(let ri=0;ri<3;ri++){
      const ry=h*(0.35+ri*0.15);
      c.strokeStyle='rgba(245,158,11,0.3)'; c.lineWidth=1.5; c.setLineDash([4,4]);
      c.beginPath(); c.moveTo(mx-w*0.2,ry); c.lineTo(mx+8,ry); c.stroke();
      c.strokeStyle='rgba(6,182,212,0.3)';
      c.beginPath(); c.moveTo(mx+8,ry); c.lineTo(mx+w*0.2,ry); c.stroke(); c.setLineDash([]);
    }
    // Explanation
    c.fillStyle='rgba(255,255,255,0.7)'; c.font=`${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText('لاحظ: الكتابة معكوسة يميناً↔يساراً في الصورة',w*0.5,h*0.89);
    c.fillStyle='rgba(245,158,11,0.8)'; c.font=`bold ${Math.round(h*0.022)}px Tajawal`;
    c.fillText('← الأصل',mx-w*0.2,h*0.83);
    c.fillStyle='rgba(6,182,212,0.8)';
    c.fillText('الصورة →',mx+w*0.2,h*0.83);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// الصف التاسع — الوحدة 12: نشاط مخطط الأشعة (١٢-٣)
// ══════════════════════════════════════════════════════════
function simG9RayRefl1(){
  cancelAnimationFrame(animFrame);
  simState={objD:100, objH:70, t:0, step:0, autoStep:false};
  window._rrD=function(v){simState.objD=+v; var e=document.getElementById('rr-d'); if(e) e.textContent=v+' px';};
  window._rrStep=function(s){simState.step=+s;};
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">✏️ نشاط ١-١٢ · مخطط الأشعة للمرآة</div>
      <div class="ctrl-label">📏 بعد الجسم: <span id="rr-d">100 px</span></div>
      <input type="range" min="40" max="220" value="100" oninput="window._rrD(this.value)" style="width:100%">
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🔢 خطوات رسم المخطط</div>
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn action" onclick="window._rrStep(0)">① الجسم</button>
        <button class="ctrl-btn" onclick="window._rrStep(1)">② شعاع ١</button>
        <button class="ctrl-btn" onclick="window._rrStep(2)">③ شعاع ٢</button>
        <button class="ctrl-btn" onclick="window._rrStep(3)">④ الصورة</button>
      </div>
    </div>
    <div class="q-box"><strong>💡 كيف نرسم؟</strong><br>①ارسم الجسم — ②شعاع من رأسه يسقط عمودياً على المرآة فينعكس للخلف — ③شعاع آخر يتجه للمراقب وينعكس — ④تقاطع الامتدادات = الصورة.</div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9rayrefl'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    simState.t+=0.016;
    const step=simState.step, d=simState.objD, oh=simState.objH;
    c.clearRect(0,0,w,h);
    // Grid background (like graph paper)
    c.fillStyle='#FAFAF5'; c.fillRect(0,0,w,h);
    c.strokeStyle='rgba(30,45,61,0.06)'; c.lineWidth=1;
    const grid=20;
    for(let x=0;x<w;x+=grid){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}
    for(let y=0;y<h;y+=grid){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
    const mx=w*0.55, cy=h*0.55;
    // Mirror
    c.strokeStyle='rgba(30,45,61,0.45)'; c.lineWidth=7; c.lineCap='round';
    c.beginPath(); c.moveTo(mx,h*0.15); c.lineTo(mx,h*0.88); c.stroke();
    // Hatch marks
    c.strokeStyle='#94A3B8'; c.lineWidth=1.5;
    for(let i=0;i<14;i++){
      const y=h*0.15+i*(h*0.73/14);
      c.beginPath(); c.moveTo(mx,y); c.lineTo(mx+14,y+10); c.stroke();
    }
    // Object top point
    const ox=mx-d, oy=cy-oh;
    // Step 0: Object arrow
    c.strokeStyle='#F59E0B'; c.lineWidth=4;
    c.beginPath(); c.moveTo(ox,cy); c.lineTo(ox,oy); c.stroke();
    c.fillStyle='#F59E0B';
    c.beginPath(); c.moveTo(ox,oy); c.lineTo(ox-8,oy+16); c.lineTo(ox+8,oy+16); c.closePath(); c.fill();
    c.fillStyle='#92400E'; c.font=`bold ${Math.round(h*0.025)}px Tajawal`; c.textAlign='center';
    c.fillText('O الجسم', ox, cy+h*0.04);
    if(step>=1){
      // Ray 1: horizontal from top of object to mirror → reflects straight back
      const r1HitX=mx, r1HitY=oy;
      c.strokeStyle='#EF4444'; c.lineWidth=3;
      c.beginPath(); c.moveTo(ox,oy); c.lineTo(r1HitX,r1HitY); c.stroke();
      // Arrow
      c.fillStyle='#EF4444';
      c.beginPath(); c.moveTo(r1HitX,r1HitY); c.lineTo(r1HitX-14,r1HitY-6); c.lineTo(r1HitX-14,r1HitY+6); c.closePath(); c.fill();
      // Normal at hit point
      c.strokeStyle='rgba(26,143,168,0.6)'; c.lineWidth=2; c.setLineDash([5,5]);
      c.beginPath(); c.moveTo(mx-h*0.15,r1HitY); c.lineTo(mx+h*0.15,r1HitY); c.stroke(); c.setLineDash([]);
      // Reflected ray 1 goes back parallel (horizontal), extend into virtual space
      c.strokeStyle='#EF4444'; c.lineWidth=3;
      c.beginPath(); c.moveTo(r1HitX,r1HitY); c.lineTo(r1HitX-w*0.06,r1HitY); c.stroke();
      c.setLineDash([6,5]); c.strokeStyle='rgba(239,68,68,0.5)';
      c.beginPath(); c.moveTo(r1HitX,r1HitY); c.lineTo(mx+d,r1HitY); c.stroke(); c.setLineDash([]);
      c.fillStyle='#EF4444'; c.font=`${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
      c.fillText('شعاع ①',ox+(r1HitX-ox)/2,oy-h*0.03);
    }
    if(step>=2){
      // Ray 2: from top of object to a chosen point on mirror, reflects to eye
      const eyeX=w*0.1, eyeY=cy+oh*0.5;
      const r2HitX=mx;
      // Find hit point by law of reflection: i=r, angles from normal (horizontal)
      // Simple: choose hit at mirror such that reflected ray goes to eye
      // incident direction from (ox,oy) to (mx, r2HitY). Reflected from (mx,r2HitY) to (eyeX,eyeY)
      // Using property: image at (mx+d, cy-oh), so rays should converge there
      // r2HitY from image: line from image(mx+d,oy) to eye(eyeX,eyeY), intersect x=mx
      const ix2=mx+d, iy2=oy;
      const t2=(mx-eyeX)/(ix2-eyeX);
      const r2HitY=eyeY+(iy2-eyeY)*t2;
      const hity=Math.max(h*0.17,Math.min(h*0.86,r2HitY));
      c.strokeStyle='#22C55E'; c.lineWidth=3;
      c.beginPath(); c.moveTo(ox,oy); c.lineTo(r2HitX,hity); c.stroke();
      c.fillStyle='#22C55E';
      const a2=Math.atan2(hity-oy,r2HitX-ox);
      c.beginPath(); c.moveTo(r2HitX,hity); c.lineTo(r2HitX-14*Math.cos(a2-0.5),hity-14*Math.sin(a2-0.5)); c.lineTo(r2HitX-14*Math.cos(a2+0.5),hity-14*Math.sin(a2+0.5)); c.closePath(); c.fill();
      // Reflected ray to eye
      c.strokeStyle='#22C55E'; c.lineWidth=3;
      c.beginPath(); c.moveTo(r2HitX,hity); c.lineTo(eyeX,eyeY); c.stroke();
      // Dashed extension behind mirror
      c.setLineDash([6,5]); c.strokeStyle='rgba(34,197,94,0.5)';
      c.beginPath(); c.moveTo(r2HitX,hity); c.lineTo(ix2,iy2); c.stroke(); c.setLineDash([]);
      c.fillStyle='#22C55E'; c.font=`${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
      c.fillText('شعاع ②',(ox+r2HitX)/2,hity-h*0.04);
      // Eye
      c.font=`${Math.round(h*0.04)}px serif`; c.textAlign='center';
      c.fillText('👁️',eyeX,eyeY);
    }
    if(step>=3){
      // Image
      const imgX=mx+d, imgY=cy-oh;
      c.strokeStyle='rgba(107,114,128,0.6)'; c.lineWidth=3; c.setLineDash([4,4]);
      c.beginPath(); c.moveTo(imgX,cy); c.lineTo(imgX,imgY); c.stroke(); c.setLineDash([]);
      c.fillStyle='rgba(107,114,128,0.6)';
      c.beginPath(); c.moveTo(imgX,imgY); c.lineTo(imgX-8,imgY+16); c.lineTo(imgX+8,imgY+16); c.closePath(); c.fill();
      c.fillStyle='#374151'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
      c.fillText('I الصورة',imgX,cy+h*0.04);
      // Distance markers
      const lineY=h*0.9;
      c.strokeStyle='#1A8FA8'; c.lineWidth=1.5;
      c.beginPath(); c.moveTo(ox,lineY); c.lineTo(mx,lineY); c.stroke();
      c.beginPath(); c.moveTo(mx,lineY); c.lineTo(imgX,lineY); c.stroke();
      c.fillStyle='#1A8FA8'; c.font=`${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
      c.fillText(`الجسم → المرآة = ${d}px`,(ox+mx)/2,lineY-h*0.02);
      c.fillStyle='rgba(55,65,81,0.6)';
      c.fillText(`المرآة ← الصورة = ${d}px`,(mx+imgX)/2,lineY-h*0.02);
      // Conclusion box
      const bX=w*0.04, bY=h*0.06;
      c.fillStyle='rgba(255,255,255,0.95)'; c.beginPath(); c.roundRect(bX,bY,w*0.38,h*0.16,10); c.fill();
      c.strokeStyle='#1A8FA8'; c.lineWidth=1.5; c.stroke();
      c.fillStyle='#0C4A6E'; c.font=`bold ${Math.round(h*0.025)}px Tajawal`; c.textAlign='center';
      c.fillText('✅ الاستنتاج',bX+w*0.19,bY+h*0.04);
      c.fillStyle='#374151'; c.font=`${Math.round(h*0.022)}px Tajawal`;
      c.fillText('بعد الصورة = بعد الجسم',bX+w*0.19,bY+h*0.085);
      c.fillText('الصورة تقديرية ومعتدلة',bX+w*0.19,bY+h*0.128);
    }
    // Mirror label
    c.fillStyle='rgba(30,45,61,0.7)'; c.font=`bold ${Math.round(h*0.025)}px Tajawal`; c.textAlign='center';
    c.fillText('مرآة مستوية',mx+w*0.04,h*0.1);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG9RayRefl2(){
  cancelAnimationFrame(animFrame);
  simState={ang:30, t:0};
  window._rrAng=function(v){simState.ang=+v; var e=document.getElementById('rr-ang'); if(e) e.textContent=v+'°';};
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🎯 قانون الانعكاس — زوايا مختلفة</div>
      <div class="ctrl-label">زاوية السقوط i: <span id="rr-ang">30°</span></div>
      <input type="range" min="5" max="85" value="30" oninput="window._rrAng(this.value)" style="width:100%">
      <div class="ctrl-btns-grid" style="margin-top:8px">
        <button class="ctrl-btn" onclick="window._rrAng(15)">15°</button>
        <button class="ctrl-btn action" onclick="window._rrAng(30)">30°</button>
        <button class="ctrl-btn" onclick="window._rrAng(45)">45°</button>
        <button class="ctrl-btn" onclick="window._rrAng(60)">60°</button>
        <button class="ctrl-btn" onclick="window._rrAng(75)">75°</button>
      </div>
    </div>
    <div class="q-box"><strong>💡 ماذا نستنتج؟</strong><br>مهما تغيرت زاوية السقوط، زاوية الانعكاس تساويها دائماً. وكلا الزاويتين والعمود المقام في نفس المستوى.</div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9rayrefl'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    simState.t+=0.016;
    c.clearRect(0,0,w,h);
    c.fillStyle='#F8FAFC'; c.fillRect(0,0,w,h);
    const cx=w*0.5, my=h*0.58;
    // Mirror
    c.strokeStyle='rgba(30,45,61,0.5)'; c.lineWidth=10; c.lineCap='round';
    c.beginPath(); c.moveTo(w*0.12,my); c.lineTo(w*0.88,my); c.stroke();
    c.strokeStyle='rgba(255,255,255,0.5)'; c.lineWidth=2;
    c.beginPath(); c.moveTo(w*0.12,my-2); c.lineTo(w*0.88,my-2); c.stroke();
    for(let i=0;i<14;i++){
      const x=w*0.12+i*(w*0.76/14);
      c.strokeStyle='#94A3B8'; c.lineWidth=1.5;
      c.beginPath(); c.moveTo(x,my); c.lineTo(x+10,my+14); c.stroke();
    }
    // Normal
    c.setLineDash([7,5]); c.strokeStyle='rgba(26,143,168,0.7)'; c.lineWidth=2.5;
    c.beginPath(); c.moveTo(cx,my-h*0.38); c.lineTo(cx,my+h*0.22); c.stroke(); c.setLineDash([]);
    c.fillStyle='rgba(26,143,168,0.9)'; c.font=`${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText('العمود المقام',cx,my+h*0.07);
    const ang=simState.ang*Math.PI/180;
    const L=h*0.34;
    // Incident ray
    c.strokeStyle='#F59E0B'; c.lineWidth=5; c.lineCap='round';
    const ix0=cx-Math.sin(ang)*L, iy0=my-Math.cos(ang)*L;
    c.beginPath(); c.moveTo(ix0,iy0); c.lineTo(cx,my); c.stroke();
    c.fillStyle='#F59E0B';
    const ia=Math.atan2(my-iy0,cx-ix0);
    c.beginPath(); c.moveTo(cx,my); c.lineTo(cx-14*Math.cos(ia-0.5),my-14*Math.sin(ia-0.5)); c.lineTo(cx-14*Math.cos(ia+0.5),my-14*Math.sin(ia+0.5)); c.closePath(); c.fill();
    // Reflected ray
    c.strokeStyle='#06B6D4'; c.lineWidth=5;
    const rx1=cx+Math.sin(ang)*L, ry1=my-Math.cos(ang)*L;
    c.beginPath(); c.moveTo(cx,my); c.lineTo(rx1,ry1); c.stroke();
    c.fillStyle='#06B6D4';
    const ra=Math.atan2(ry1-my,rx1-cx);
    c.beginPath(); c.moveTo(rx1,ry1); c.lineTo(rx1-14*Math.cos(ra-0.5),ry1-14*Math.sin(ra-0.5)); c.lineTo(rx1-14*Math.cos(ra+0.5),ry1-14*Math.sin(ra+0.5)); c.closePath(); c.fill();
    // Angle arcs
    const arcR=h*0.09;
    c.strokeStyle='rgba(245,158,11,0.8)'; c.lineWidth=2.5;
    c.beginPath(); c.arc(cx,my,arcR,-(Math.PI/2+ang),-Math.PI/2,false); c.stroke();
    c.strokeStyle='rgba(6,182,212,0.8)';
    c.beginPath(); c.arc(cx,my,arcR,-Math.PI/2,-(Math.PI/2-ang),false); c.stroke();
    // Angle labels
    c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
    c.fillStyle='#B45309';
    c.fillText(`i=${simState.ang}°`,cx-arcR*1.2,my-arcR*0.5);
    c.fillStyle='#0E7490';
    c.fillText(`r=${simState.ang}°`,cx+arcR*1.2,my-arcR*0.5);
    // Big equation
    const bY=h*0.08;
    c.fillStyle='rgba(255,255,255,0.97)'; c.beginPath(); c.roundRect(w*0.2,bY,w*0.6,h*0.14,12); c.fill();
    c.strokeStyle='rgba(26,143,168,0.3)'; c.lineWidth=1.5; c.stroke();
    c.fillStyle='#0C4A6E'; c.font=`bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign='center';
    c.fillText(`i = r = ${simState.ang}°`,w*0.5,bY+h*0.055);
    c.fillStyle='#374151'; c.font=`${Math.round(h*0.025)}px Tajawal`;
    c.fillText('قانون الانعكاس: زاوية السقوط = زاوية الانعكاس',w*0.5,bY+h*0.105);
    // Ray labels
    c.fillStyle='#92400E'; c.font=`bold ${Math.round(h*0.025)}px Tajawal`; c.textAlign='center';
    c.fillText('شعاع ساقط',(ix0+cx)/2,iy0+h*0.05);
    c.fillStyle='#0E7490';
    c.fillText('شعاع منعكس',(cx+rx1)/2,ry1+h*0.05);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// الصف التاسع — الوحدة 12: أنواع الانعكاس (١٢-٤)
// ══════════════════════════════════════════════════════════
function simG9ReflType1(){
  cancelAnimationFrame(animFrame);
  simState={surface:'smooth', roughness:0, t:0};
  window._rfSurf=function(s,r){simState.surface=s; simState.roughness=r; var btns=document.querySelectorAll('.rfs-btn'); btns.forEach(b=>b.classList.remove('action')); var el=document.getElementById('rfs-'+s); if(el) el.classList.add('action');};
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔦 نوع الانعكاس</div>
      <div class="ctrl-btns-grid">
        <button id="rfs-smooth" class="ctrl-btn rfs-btn action" onclick="window._rfSurf('smooth',0)">🪞 مرآة لامعة</button>
        <button id="rfs-semi" class="ctrl-btn rfs-btn" onclick="window._rfSurf('semi',0.4)">📄 ورق أبيض</button>
        <button id="rfs-rough" class="ctrl-btn rfs-btn" onclick="window._rfSurf('rough',1)">🧱 جدار خشن</button>
      </div>
    </div>
    <div class="info-box" style="margin-top:8px;font-size:12px;line-height:1.7">
      راقب اتجاه الأشعة المنعكسة. سؤال الاستنتاج من زر <strong>💡 ماذا نستنتج؟</strong> أسفل الشاشة.
    </div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9refltype'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    simState.t+=0.018;
    const t=simState.t, r=simState.roughness, sc=simState.surface;
    c.clearRect(0,0,w,h);
    c.fillStyle='#0F172A'; c.fillRect(0,0,w,h);
    // Title
    const titles={smooth:'انعكاس منتظم (Regular Reflection)',semi:'انعكاس جزئي — أقل انتظاماً',rough:'انعكاس متشتت (Diffuse Reflection)'};
    c.fillStyle='white'; c.font=`bold ${Math.round(h*0.034)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
    c.fillText(titles[sc],w*0.5,h*0.03);
    // Surface
    const surfY=h*0.62;
    if(sc==='smooth'){
      const sg=c.createLinearGradient(0,surfY,0,surfY+h*0.08);
      sg.addColorStop(0,'#CBD5E1'); sg.addColorStop(0.5,'#F8FAFC'); sg.addColorStop(1,'#94A3B8');
      c.fillStyle=sg; c.fillRect(0,surfY,w,h*0.08);
    } else if(sc==='semi'){
      c.fillStyle='#F5F5F0'; c.fillRect(0,surfY,w,h*0.08);
    } else {
      c.fillStyle='#78716C'; c.fillRect(0,surfY,w,h*0.08);
      for(let i=0;i<40;i++){
        const bx=Math.random()*w, by=surfY+Math.random()*h*0.08;
        const br=2+Math.random()*5;
        c.fillStyle='rgba(0,0,0,0.3)'; c.beginPath(); c.arc(bx,by,br,0,Math.PI*2); c.fill();
      }
    }
    // Surface bumps (for rough surface)
    if(sc==='rough'){
      c.strokeStyle='#57534E'; c.lineWidth=2;
      for(let i=0;i<20;i++){
        const bx=i*w/20+w/40;
        const by2=surfY+(Math.random()*0.5-0.25)*h*0.05;
        c.beginPath(); c.moveTo(bx-10,surfY); c.lineTo(bx,by2); c.lineTo(bx+10,surfY); c.stroke();
      }
    }
    // Incident rays (parallel, from above-left)
    const nRays=sc==='smooth'?1:7;
    const spacing=w/(nRays+1);
    for(let ri=0;ri<nRays;ri++){
      const rx=(ri+1)*spacing;
      const incAng=40*Math.PI/180;
      // Surface normal at this point
      let localNorm=-Math.PI/2; // perfectly vertical for smooth
      if(sc==='rough') localNorm=-Math.PI/2+(Math.random()*r-r/2)*0.8;
      else if(sc==='semi') localNorm=-Math.PI/2+(Math.random()*r-r/2)*0.3;
      // Incident ray
      const iLen=h*0.35;
      const ix0=rx-Math.sin(incAng)*iLen, iy0=surfY-Math.cos(incAng)*iLen;
      c.strokeStyle='rgba(245,158,11,0.85)'; c.lineWidth=ri===0&&sc==='smooth'?4:2.5; c.lineCap='round';
      c.beginPath(); c.moveTo(ix0,iy0); c.lineTo(rx,surfY); c.stroke();
      // Reflected ray
      const reflAng=2*localNorm-(-Math.PI/2+incAng)+(Math.random()*r-r/2)*0.15;
      const rLen=h*0.3;
      const rx1=rx+Math.cos(reflAng+Math.PI/2)*rLen, ry1=surfY+Math.sin(reflAng+Math.PI/2)*rLen;
      c.strokeStyle=sc==='smooth'?'rgba(6,182,212,0.9)':'rgba(167,139,250,0.7)';
      c.lineWidth=ri===0&&sc==='smooth'?4:2;
      c.beginPath(); c.moveTo(rx,surfY); c.lineTo(rx1,ry1); c.stroke();
      // Normal line (for smooth only)
      if(sc==='smooth'&&ri===0){
        c.setLineDash([5,5]); c.strokeStyle='rgba(26,143,168,0.5)'; c.lineWidth=1.5;
        c.beginPath(); c.moveTo(rx,surfY-h*0.25); c.lineTo(rx,surfY+h*0.1); c.stroke(); c.setLineDash([]);
      }
    }
    // Labels
    const scDescriptions={
      smooth:['الشعاع الساقط','الشعاع المنعكس','✅ اتجاه واحد منتظم\n— يتكون صورة واضحة'],
      semi:['أشعة ساقطة','أشعة منعكسة متشتتة قليلاً','🔶 انعكاس جزئي — صورة غير واضحة'],
      rough:['أشعة ساقطة متوازية','أشعة منعكسة في كل الاتجاهات','❌ لا صورة — الضوء يتشتت']
    };
    c.fillStyle='rgba(245,158,11,0.9)'; c.font=`${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText(scDescriptions[sc][0],w*0.2,h*0.3);
    c.fillStyle=sc==='smooth'?'rgba(6,182,212,0.9)':'rgba(167,139,250,0.9)';
    c.fillText(scDescriptions[sc][1],w*0.75,h*0.3);
    // Result box
    const bY=h*0.75;
    c.fillStyle='rgba(255,255,255,0.08)'; c.beginPath(); c.roundRect(w*0.1,bY,w*0.8,h*0.18,12); c.fill();
    c.fillStyle='white'; c.font=`bold ${Math.round(h*0.027)}px Tajawal`; c.textAlign='center';
    c.fillText(scDescriptions[sc][2].replace('\n','  '),w*0.5,bY+h*0.07);
    const srfLabels={smooth:'مرآة لامعة (سطح أملس)',semi:'ورق أبيض (سطح شبه أملس)',rough:'جدار خشن (سطح خشن)'};
    c.fillStyle='rgba(255,255,255,0.6)'; c.font=`${Math.round(h*0.024)}px Tajawal`;
    c.fillText(srfLabels[sc],w*0.5,bY+h*0.135);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG9ReflType2(){
  cancelAnimationFrame(animFrame);
  simState={app:'mirror', t:0};
  window._rfApp=function(a){simState.app=a; var btns=document.querySelectorAll('.rfa-btn'); btns.forEach(b=>b.classList.remove('action')); var el=document.getElementById('rfa-'+a); if(el) el.classList.add('action');};
  const APPS={
    mirror:{name:'مرآة الرؤية',emoji:'🚗',type:'منتظم',color:'#06B6D4',desc:'تعتمد على الانعكاس المنتظم لإعطاء صورة واضحة للطريق خلف السيارة.'},
    telescope:{name:'تلسكوب فلكي',emoji:'🔭',type:'منتظم',color:'#3B82F6',desc:'يستخدم مرايا دقيقة جداً لتجميع الضوء القادم من النجوم البعيدة.'},
    screen:{name:'شاشة سينما',emoji:'🎬',type:'متشتت',color:'#A855F7',desc:'الشاشة تعكس الضوء بشكل متشتت حتى يتمكن الجمهور كله من رؤية الصورة.'},
    road:{name:'علامات الطريق',emoji:'🛑',type:'متشتت',color:'#22C55E',desc:'تُصمم للانعكاس المتشتت لتكون مرئية من جميع الزوايا وتوجيه السائقين.'},
  };
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">💡 تطبيقات الانعكاس في الحياة</div>
      <div class="ctrl-btns-grid">
        <button id="rfa-mirror" class="ctrl-btn rfa-btn action" onclick="window._rfApp('mirror')">🚗 مرآة سيارة</button>
        <button id="rfa-telescope" class="ctrl-btn rfa-btn" onclick="window._rfApp('telescope')">🔭 تلسكوب</button>
        <button id="rfa-screen" class="ctrl-btn rfa-btn" onclick="window._rfApp('screen')">🎬 شاشة</button>
        <button id="rfa-road" class="ctrl-btn rfa-btn" onclick="window._rfApp('road')">🛑 علامة طريق</button>
      </div>
    </div>
    <div class="info-box" style="margin-top:8px;font-size:12px;line-height:1.7">
      لاحظ نوع الانعكاس لكل تطبيق. ثم جاوب من زر الاستنتاج أسفل الشاشة.
    </div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9refltype'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    simState.t+=0.02;
    const t=simState.t, app=APPS[simState.app];
    c.clearRect(0,0,w,h);
    c.fillStyle='#0F172A'; c.fillRect(0,0,w,h);
    // Header
    c.fillStyle='white'; c.font=`bold ${Math.round(h*0.036)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
    c.fillText(`${app.emoji} ${app.name}`,w*0.5,h*0.03);
    // Type badge
    const badgeColor=app.type==='منتظم'?'#0EA5E9':'#A855F7';
    c.fillStyle=badgeColor+'33'; c.beginPath(); c.roundRect(w*0.35,h*0.1,w*0.3,h*0.06,20); c.fill();
    c.strokeStyle=badgeColor; c.lineWidth=1.5; c.stroke();
    c.fillStyle=badgeColor; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText(`انعكاس ${app.type}`,w*0.5,h*0.12);
    // Animated visualization
    const surfY=h*0.6, cx2=w*0.5;
    // Surface
    if(app.type==='منتظم'){
      const sg=c.createLinearGradient(w*0.15,surfY,w*0.85,surfY+h*0.06);
      sg.addColorStop(0,'#64748B'); sg.addColorStop(0.5,'#E2E8F0'); sg.addColorStop(1,'#64748B');
      c.fillStyle=sg; c.fillRect(w*0.15,surfY,w*0.7,h*0.06);
      // Shimmer
      const sX=w*0.15+(t*0.15%1)*w*0.7;
      const sg2=c.createLinearGradient(sX-20,0,sX+20,0);
      sg2.addColorStop(0,'rgba(255,255,255,0)'); sg2.addColorStop(0.5,'rgba(255,255,255,0.4)'); sg2.addColorStop(1,'rgba(255,255,255,0)');
      c.fillStyle=sg2; c.fillRect(w*0.15,surfY,w*0.7,h*0.06);
      // Parallel incident + reflected
      for(let ri=0;ri<5;ri++){
        const rx=w*0.25+ri*w*0.125;
        const iL=h*0.28;
        c.strokeStyle='rgba(245,158,11,0.8)'; c.lineWidth=2.5;
        c.beginPath(); c.moveTo(rx-Math.sin(0.6)*iL,surfY-Math.cos(0.6)*iL); c.lineTo(rx,surfY); c.stroke();
        c.strokeStyle=app.color; c.lineWidth=2.5;
        c.beginPath(); c.moveTo(rx,surfY); c.lineTo(rx+Math.sin(0.6)*iL,surfY-Math.cos(0.6)*iL); c.stroke();
      }
    } else {
      c.fillStyle='#D4C4A8'; c.fillRect(w*0.15,surfY,w*0.7,h*0.06);
      for(let i=0;i<25;i++){
        const bx=w*0.15+i*w*0.7/25+w*0.014;
        const bump=(Math.sin(i*1.7)*0.5+0.5)*h*0.025;
        c.fillStyle='#A0856A';
        c.beginPath(); c.arc(bx,surfY+bump,4+Math.random()*4,0,Math.PI*2); c.fill();
      }
      // Random scattered rays
      for(let ri=0;ri<5;ri++){
        const rx=w*0.25+ri*w*0.125;
        const iL=h*0.28;
        c.strokeStyle='rgba(245,158,11,0.8)'; c.lineWidth=2.5;
        c.beginPath(); c.moveTo(rx-Math.sin(0.6)*iL,surfY-Math.cos(0.6)*iL); c.lineTo(rx,surfY); c.stroke();
        // Scattered reflections
        for(let s=0;s<4;s++){
          const scAng=-Math.PI/2+(Math.random()-0.5)*Math.PI*1.2;
          c.strokeStyle=`${app.color}88`; c.lineWidth=1.8;
          c.beginPath(); c.moveTo(rx,surfY); c.lineTo(rx+Math.cos(scAng)*h*0.22,surfY+Math.sin(scAng)*h*0.22); c.stroke();
        }
      }
    }
    // Description box
    const bY=h*0.71;
    c.fillStyle='rgba(255,255,255,0.07)'; c.beginPath(); c.roundRect(w*0.06,bY,w*0.88,h*0.2,14); c.fill();
    c.strokeStyle=app.color+'44'; c.lineWidth=1.5; c.stroke();
    c.fillStyle='rgba(255,255,255,0.88)'; c.font=`${Math.round(h*0.027)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    // Wrap text
    const words=app.desc.split(' '); let line=''; let ly=bY+h*0.065;
    words.forEach(word=>{
      const test=line+word+' ';
      if(c.measureText(test).width>w*0.82&&line!=''){c.fillText(line.trim(),w*0.5,ly);ly+=h*0.048;line=word+' ';}else{line=test;}
    });
    if(line) c.fillText(line.trim(),w*0.5,ly);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}
// ══════════════════════════════════════════════════════════
// الصف التاسع — فيزياء الوحدة 12: انعكاس الضوء (أسلوب تفاعلي قريب من PhET)
// ══════════════════════════════════════════════════════════
function simG9Refl1(){
  cancelAnimationFrame(animFrame);
  simState={t:0, ang:35, showNormal:true, showWaves:true, drag:false};
  const S=simState;
  function clampAng(v){ return Math.max(5, Math.min(80, Math.round(v))); }
  window._setReflAng=function(v){
    S.ang=clampAng(+v);
    var a=document.getElementById('refl-ang'); if(a) a.textContent=S.ang;
    var rg=document.getElementById('refl-rg'); if(rg) rg.value=S.ang;
  };
  window._reflPreset=function(a){ window._setReflAng(a); };
  window._reflTN=function(){
    S.showNormal=!S.showNormal;
    var b=document.getElementById('refl-tn');
    if(b){ b.classList.toggle('action',S.showNormal); b.textContent=S.showNormal?'العمود: ظاهر':'العمود: مخفي'; }
  };
  window._reflTW=function(){
    S.showWaves=!S.showWaves;
    var b=document.getElementById('refl-tw');
    if(b){ b.classList.toggle('action',S.showWaves); b.textContent=S.showWaves?'موجات ضوء: نعم':'موجات ضوء: لا'; }
  };
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📐 قانون الانعكاس — مرآة مستوية</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.78);line-height:1.65;margin-top:4px">
        حرّك شريط الزاوية، أو <strong>اسحب مقبض الشعاع</strong> على الشاشة. الزوايا من العمود المقام. سؤال الاستنتاج من الزر أسفل الشاشة.
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">زاوية السقوط i = زاوية الانعكاس r : <span id="refl-ang">35</span>°</div>
      <input id="refl-rg" type="range" min="5" max="80" value="35" oninput="window._setReflAng(this.value)" style="width:100%">
      <div class="ctrl-btns-grid" style="margin-top:8px">
        <button class="ctrl-btn" onclick="window._reflPreset(10)">10°</button>
        <button class="ctrl-btn action" onclick="window._reflPreset(35)">35°</button>
        <button class="ctrl-btn" onclick="window._reflPreset(55)">55°</button>
        <button class="ctrl-btn" onclick="window._reflPreset(75)">75°</button>
      </div>
    </div>
    <div class="ctrl-btns-grid">
      <button id="refl-tn" class="ctrl-btn action" onclick="window._reflTN()">العمود: ظاهر</button>
      <button id="refl-tw" class="ctrl-btn action" onclick="window._reflTW()">موجات ضوء: نعم</button>
    </div>
    <div class="info-box" style="margin-top:10px;text-align:center;line-height:1.75;font-size:13px">
      <strong>i = r</strong> (بالنسبة للعمود)<br>
      اسحب الدائرة البرتقالية عند طرف الشعاع الساقط لتدويره.
    </div>
  `);

  const cv=document.getElementById('simCanvas');
  function rayGeom(w,h){
    const midX=w*0.5, midY=h*0.56, mirrorY=midY;
    const i=(Math.PI/180)*S.ang, L=Math.min(w,h)*0.52;
    const incDir={x:Math.sin(i), y:Math.cos(i)};
    const refDir={x:Math.sin(i), y:-Math.cos(i)};
    const p0={x:midX-incDir.x*L,y:mirrorY-incDir.y*L};
    const hit={x:midX,y:mirrorY};
    const p1={x:midX+refDir.x*L,y:mirrorY+refDir.y*L};
    return {midX,midY,mirrorY,i,L,p0,hit,p1};
  }
  function distPointSeg(px,py,x1,y1,x2,y2){
    const dx=x2-x1, dy=y2-y1, t=Math.max(0,Math.min(1,((px-x1)*dx+(py-y1)*dy)/(dx*dx+dy*dy||1)));
    const qx=x1+t*dx, qy=y1+t*dy;
    return Math.hypot(px-qx,py-qy);
  }
  function posFromEvt(e){
    const r=cv.getBoundingClientRect();
    const p=(e.touches&&e.touches[0])||(e.changedTouches&&e.changedTouches[0])||e;
    return {mx:p.clientX-r.left,my:p.clientY-r.top};
  }
  function tryStartDrag(mx,my,w,h){
    const G=rayGeom(w,h);
    const dTip=Math.hypot(mx-G.p0.x,my-G.p0.y);
    const dSeg=distPointSeg(mx,my,G.p0.x,G.p0.y,G.hit.x,G.hit.y);
    if(dTip<26||dSeg<18){ S.drag=true; return true; }
    return false;
  }
  function updateAngFromPointer(mx,my,w,h){
    const G=rayGeom(w,h);
    const dx=G.midX-mx, dy=G.mirrorY-my;
    if(dy<8) return;
    let deg=Math.atan2(Math.abs(dx),dy)*180/Math.PI;
    window._setReflAng(deg);
  }
  cv.onmousedown=function(e){ if(currentSim!=='g9refl')return; const {mx,my}=posFromEvt(e); tryStartDrag(mx,my,cv.width,cv.height); };
  cv.onmousemove=function(e){
    if(!S.drag||currentSim!=='g9refl') return;
    const {mx,my}=posFromEvt(e);
    updateAngFromPointer(mx,my,cv.width,cv.height);
  };
  cv.onmouseup=cv.onmouseleave=function(){ S.drag=false; };
  cv.ontouchstart=function(e){ if(currentSim!=='g9refl')return; const {mx,my}=posFromEvt(e); if(tryStartDrag(mx,my,cv.width,cv.height)) e.preventDefault(); };
  cv.ontouchmove=function(e){
    if(!S.drag) return;
    e.preventDefault();
    const {mx,my}=posFromEvt(e);
    updateAngFromPointer(mx,my,cv.width,cv.height);
  };
  cv.ontouchend=function(){ S.drag=false; };

  function draw(){
    if(currentSim!=='g9refl'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t+=0.02;
    const bg=c.createLinearGradient(0,0,w,h);
    bg.addColorStop(0,'#F0F9FF'); bg.addColorStop(1,'#EEF2FF');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    const {midX,midY,mirrorY,i,L,p0,hit,p1}=rayGeom(w,h);

    c.fillStyle='rgba(30,45,61,0.06)'; c.fillRect(0,0,w,mirrorY);

    c.strokeStyle='rgba(30,45,61,0.4)'; c.lineWidth=10; c.lineCap='round';
    c.beginPath(); c.moveTo(w*0.16,mirrorY); c.lineTo(w*0.84,mirrorY); c.stroke();
    c.strokeStyle='rgba(255,255,255,0.65)'; c.lineWidth=2;
    c.beginPath(); c.moveTo(w*0.16,mirrorY-2); c.lineTo(w*0.84,mirrorY-2); c.stroke();
    c.fillStyle='rgba(30,45,61,0.85)'; c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center'; c.textBaseline='bottom';
    c.fillText('سطح مرآة مستوية', midX, mirrorY-10);

    if(S.showNormal){
      c.strokeStyle='rgba(26,143,168,0.75)'; c.lineWidth=3; c.setLineDash([7,6]);
      c.beginPath(); c.moveTo(midX, mirrorY-h*0.34); c.lineTo(midX, mirrorY+h*0.22); c.stroke(); c.setLineDash([]);
      c.fillStyle='#1A8FA8'; c.font=`bold ${Math.round(h*0.022)}px Tajawal`; c.textBaseline='top';
      c.fillText('N عمود مقام', midX+6, mirrorY+10);
    }

    function drawRayTube(x1,y1,x2,y2,isInc){
      if(!S.showWaves){
        c.strokeStyle=isInc?'#D97706':'#0891B2'; c.lineWidth=5; c.lineCap='round';
        c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.stroke();
        return;
      }
      const grad=c.createLinearGradient(x1,y1,x2,y2);
      if(isInc){ grad.addColorStop(0,'#FDE68A'); grad.addColorStop(0.5,'#F59E0B'); grad.addColorStop(1,'#EA580C'); }
      else { grad.addColorStop(0,'#67E8F9'); grad.addColorStop(0.5,'#06B6D4'); grad.addColorStop(1,'#0E7490'); }
      c.strokeStyle=grad; c.lineWidth=7; c.lineCap='round';
      c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.stroke();
      const steps=10, wx=x2-x1, wy=y2-y1;
      for(let k=0;k<=steps;k++){
        const t=k/steps, px=x1+wx*t, py=y1+wy*t, ph=Math.sin(S.t*3+k*0.7)*4;
        c.strokeStyle=isInc?'rgba(245,158,11,0.35)':'rgba(6,182,212,0.35)';
        c.lineWidth=2;
        c.beginPath(); c.moveTo(px-ph,py); c.lineTo(px+ph,py); c.stroke();
      }
    }
    drawRayTube(p0.x,p0.y,hit.x,hit.y,true);
    drawRayTube(hit.x,hit.y,p1.x,p1.y,false);

    function arrow(x1,y1,x2,y2,col){
      const ang=Math.atan2(y2-y1,x2-x1), ah=13;
      c.fillStyle=col;
      c.beginPath(); c.moveTo(x2,y2);
      c.lineTo(x2-ah*Math.cos(ang-0.45), y2-ah*Math.sin(ang-0.45));
      c.lineTo(x2-ah*Math.cos(ang+0.45), y2-ah*Math.sin(ang+0.45));
      c.closePath(); c.fill();
    }
    arrow(p0.x,p0.y,hit.x,hit.y,'#B45309');
    arrow(hit.x,hit.y,p1.x,p1.y,'#0E7490');

    c.strokeStyle='rgba(245,158,11,0.85)'; c.lineWidth=2.5;
    const arcR=Math.min(w,h)*0.095;
    c.beginPath(); c.arc(midX,mirrorY,arcR,-Math.PI/2,-Math.PI/2+i,false); c.stroke();
    c.strokeStyle='rgba(6,182,212,0.85)';
    c.beginPath(); c.arc(midX,mirrorY,arcR,-Math.PI/2-i,-Math.PI/2,false); c.stroke();

    c.fillStyle='#F59E0B'; c.beginPath(); c.arc(p0.x,p0.y,14+Math.sin(S.t*4)*2,0,Math.PI*2); c.fill();
    c.strokeStyle='white'; c.lineWidth=2; c.stroke();
    c.fillStyle='white'; c.font=`bold ${11}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('اسحب',p0.x,p0.y);

    c.fillStyle='rgba(15,23,42,0.9)'; c.font=`bold ${Math.min(20,Math.round(h*0.032))}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
    c.fillText('i = '+Math.round(S.ang)+'°   |   r = '+Math.round(S.ang)+'°', midX, mirrorY+h*0.26);
    c.fillStyle='rgba(51,65,85,0.75)'; c.font=`${Math.round(h*0.022)}px Tajawal`;
    c.fillText('قانون الانعكاس: زاوية السقوط = زاوية الانعكاس (من العمود)', midX, mirrorY+h*0.31);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG9Refl2(){
  cancelAnimationFrame(animFrame);
  simState={t:0, boxX:0.22, boxY:0.32, ang:-28, dragging:false, showExt:true};
  const S=simState;
  const cv=document.getElementById('simCanvas');
  window._rdSetAng=function(v){S.ang=+v; var e=document.getElementById('rd-ang'); if(e)e.textContent=v; var r=document.getElementById('rd-rg'); if(r)r.value=v;};
  window._rdToggleExt=function(){
    S.showExt=!S.showExt;
    var b=document.getElementById('rd-ext'); if(b){ b.classList.toggle('action',S.showExt); b.textContent=S.showExt?'امتداد افتراضي: ظاهر':'امتداد افتراضي: مخفي'; }
  };
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🎯 مخطط الأشعة — مرآة عمودية</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.78);line-height:1.65;margin-top:4px">
        اسحب <strong>صندوق المصدر</strong> على الشاشة (أو باللمس). غيّر زاوية الشعاع. راقب تساوي زاويتي السقوط والانعكاس عن <em>العمود الأفقي</em> عند المرآة.
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">ميل الشعاع (°): <span id="rd-ang">-28</span></div>
      <input id="rd-rg" type="range" min="-75" max="75" value="-28" oninput="window._rdSetAng(this.value)" style="width:100%">
      <div class="ctrl-btns-grid" style="margin-top:8px">
        <button class="ctrl-btn" onclick="window._rdSetAng(-50)">↙️ −50</button>
        <button class="ctrl-btn action" onclick="window._rdSetAng(-28)">وسط</button>
        <button class="ctrl-btn" onclick="window._rdSetAng(40)">↗️ 40</button>
      </div>
    </div>
    <div class="ctrl-btns-grid">
      <button id="rd-ext" class="ctrl-btn action" onclick="window._rdToggleExt()">امتداد افتراضي: ظاهر</button>
    </div>
    <button class="ctrl-btn reset" style="width:100%;margin-top:8px" onclick="simG9Refl2()">↺ إعادة</button>
    <div class="q-box" style="margin-top:10px;font-size:13px;line-height:1.7">
      <strong>❓ كيف أرسم المخطط؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">عرض</button>
      <div class="q-ans-panel">عمود عند نقطة السقوط على المرآة → شعاع ساقط → شعاع منعكس بنفس الزاوية عن العمود. الامتداد الافتراضي يساعد على تخيّل مسار الضوء.</div>
    </div>
    <div class="info-box" style="margin-top:8px;font-size:12px;line-height:1.65">سؤال «ماذا نستنتج» عن مخطط الأشعة من الزر أسفل الشاشة.</div>
  `);

  function _rdPos(e){
    const r=cv.getBoundingClientRect();
    const p=(e.touches&&e.touches[0])||(e.changedTouches&&e.changedTouches[0])||e;
    return {mx:p.clientX-r.left,my:p.clientY-r.top};
  }
  cv.onmousedown=function(e){
    if(currentSim!=='g9refl') return;
    const {mx,my}=_rdPos(e), w=cv.width, h=cv.height;
    const bx=S.boxX*w, by=S.boxY*h;
    if(Math.hypot(mx-bx,my-by)<38) S.dragging=true;
  };
  cv.onmousemove=function(e){
    if(!S.dragging) return;
    const {mx,my}=_rdPos(e), w=cv.width, h=cv.height;
    S.boxX=Math.max(0.1,Math.min(0.55,mx/w));
    S.boxY=Math.max(0.12,Math.min(0.55,my/h));
  };
  cv.onmouseup=cv.onmouseleave=function(){ S.dragging=false; };
  cv.ontouchstart=function(e){
    if(currentSim!=='g9refl') return;
    const {mx,my}=_rdPos(e), w=cv.width, h=cv.height;
    const bx=S.boxX*w, by=S.boxY*h;
    if(Math.hypot(mx-bx,my-by)<42){ S.dragging=true; e.preventDefault(); }
  };
  cv.ontouchmove=function(e){
    if(!S.dragging) return;
    e.preventDefault();
    const {mx,my}=_rdPos(e), w=cv.width, h=cv.height;
    S.boxX=Math.max(0.1,Math.min(0.55,mx/w));
    S.boxY=Math.max(0.12,Math.min(0.55,my/h));
  };
  cv.ontouchend=function(){ S.dragging=false; };

  function draw(){
    if(currentSim!=='g9refl'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    c.fillStyle='#F7FAFC'; c.fillRect(0,0,w,h);

    // Mirror as vertical line for variety
    const mx=w*0.66;
    c.strokeStyle='rgba(30,45,61,0.35)'; c.lineWidth=10; c.lineCap='round';
    c.beginPath(); c.moveTo(mx,h*0.18); c.lineTo(mx,h*0.86); c.stroke();
    c.strokeStyle='rgba(255,255,255,0.6)'; c.lineWidth=2;
    c.beginPath(); c.moveTo(mx-2,h*0.18); c.lineTo(mx-2,h*0.86); c.stroke();

    // Hit point at mirror where ray meets (solve intersection with line x=mx)
    const bx=S.boxX*w, by=S.boxY*h;
    const ang=(Math.PI/180)*S.ang;
    const dir={x:Math.cos(ang), y:Math.sin(ang)};

    // parametric: p = (bx,by) + t*dir. Find t where x=mx
    const tHit = (mx - bx) / (dir.x || 1e-6);
    const hx = mx;
    const hy = by + tHit*dir.y;

    // Clamp if no intersection in bounds
    const hitY = Math.max(h*0.2, Math.min(h*0.84, hy));

    // Normal (horizontal) at hit point since mirror vertical
    c.strokeStyle='rgba(26,143,168,0.7)'; c.lineWidth=3; c.setLineDash([6,5]);
    c.beginPath(); c.moveTo(mx- w*0.22, hitY); c.lineTo(mx+ w*0.16, hitY); c.stroke();
    c.setLineDash([]);

    // Incident ray from box to hit
    c.strokeStyle='#F59E0B'; c.lineWidth=5; c.lineCap='round';
    c.beginPath(); c.moveTo(bx,by); c.lineTo(hx, hitY); c.stroke();

    // Reflected ray: reflect across normal (horizontal) => invert y component
    const refDir={x:-dir.x, y:dir.y}; // mirror vertical reflection flips x
    const L=Math.min(w,h)*0.8;
    const rx = hx + refDir.x*L;
    const ry = hitY + refDir.y*L;
    c.strokeStyle='#06B6D4'; c.lineWidth=5;
    c.beginPath(); c.moveTo(hx,hitY); c.lineTo(rx,ry); c.stroke();

    if(S.showExt){
      c.setLineDash([9,7]); c.strokeStyle='rgba(6,182,212,0.42)'; c.lineWidth=2.5;
      c.beginPath(); c.moveTo(hx,hitY); c.lineTo(hx-refDir.x*w*0.55, hitY-refDir.y*w*0.55); c.stroke(); c.setLineDash([]);
      c.fillStyle='rgba(6,182,212,0.75)'; c.font=`${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
      c.fillText('امتداد الشعاع (خلف المرآة)', hx-refDir.x*w*0.28, hitY-refDir.y*w*0.28-8);
    }

    // Ray box
    c.shadowColor='rgba(0,0,0,0.2)'; c.shadowBlur=10;
    c.fillStyle='rgba(255,255,255,0.95)'; c.beginPath(); c.roundRect(bx-36,by-24,72,48,14); c.fill();
    c.shadowBlur=0;
    c.strokeStyle='rgba(245,158,11,0.55)'; c.lineWidth=2; c.stroke();
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('مصدر ضوء', bx, by);

    // Labels
    c.fillStyle='rgba(30,45,61,0.9)'; c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
    c.fillText('اسحب «مصدر الضوء» — راقب تساوي الزاويتين عن العمود الأفقي', w/2, 14);

    // Angle calc relative to normal (horizontal): angle between ray and normal = |atan2(dy,dx)| for incident toward mirror
    const incAng = Math.abs(Math.atan2(dir.y, dir.x)) * 180/Math.PI;
    c.fillStyle='rgba(0,0,0,0.55)'; c.beginPath(); c.roundRect(w*0.12,h*0.88,w*0.76,40,14); c.fill();
    c.fillStyle='white'; c.font=`${Math.round(h*0.028)}px Tajawal`; c.textBaseline='middle';
    c.fillText(`زاوية السقوط ≈ ${incAng.toFixed(0)}°  |  زاوية الانعكاس ≈ ${incAng.toFixed(0)}°`, w/2, h*0.88+20);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// الصف التاسع — فيزياء الوحدة 13: انكسار الضوء (قانون سنيل — PhET-style)
// ══════════════════════════════════════════════════════════
function simG9Refract1(){
  cancelAnimationFrame(animFrame);
  simState={a:35,n2:1.5,drag:false,t:0,showNorm:true};
  const S=simState;
  window._setRefA=function(v){S.a=+v; var el=document.getElementById('rf-a'); if(el)el.textContent=v; var rg=document.getElementById('rf-rga'); if(rg)rg.value=v;};
  window._setRefN=function(v){S.n2=+v; var el=document.getElementById('rf-n'); if(el)el.textContent=(+v).toFixed(2); var rg=document.getElementById('rf-rgn'); if(rg)rg.value=v;};
  window._rfMat=function(n){ window._setRefN(n); };
  window._rfTN=function(){
    S.showNorm=!S.showNorm;
    var b=document.getElementById('rf-tn'); if(b){ b.classList.toggle('action',S.showNorm); b.textContent=S.showNorm?'العمود: ظاهر':'العمود: مخفي'; }
  };
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔎 قانون سنيل — هواء → مادة</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.78);line-height:1.65;margin-top:4px">
        n₁ = 1.00 (هواء). غيّر n₂ وزاوية السقوط i. اسحب <strong>مقبض الشعاع</strong> على الشاشة. تحقق من n₁sin i = n₂sin r. الاستنتاج من الزر أسفل الشاشة.
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">زاوية السقوط i: <span id="rf-a">35</span>°</div>
      <input id="rf-rga" type="range" min="5" max="85" value="35" oninput="window._setRefA(this.value)" style="width:100%">
      <div class="ctrl-btns-grid" style="margin-top:8px">
        <button class="ctrl-btn" onclick="window._setRefA(15)">15°</button>
        <button class="ctrl-btn action" onclick="window._setRefA(35)">35°</button>
        <button class="ctrl-btn" onclick="window._setRefA(60)">60°</button>
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">معامل الانكسار n₂: <span id="rf-n">1.50</span></div>
      <input id="rf-rgn" type="range" min="1.10" max="2.20" step="0.01" value="1.50" oninput="window._setRefN(this.value)" style="width:100%">
      <div class="ctrl-btns-grid" style="margin-top:8px">
        <button class="ctrl-btn" onclick="window._rfMat(1.33)">💧 ماء 1.33</button>
        <button class="ctrl-btn action" onclick="window._rfMat(1.50)">🪟 زجاج 1.50</button>
        <button class="ctrl-btn" onclick="window._rfMat(2.00)">💎 شبه ألماس 2.00</button>
      </div>
    </div>
    <div class="ctrl-btns-grid">
      <button id="rf-tn" class="ctrl-btn action" onclick="window._rfTN()">العمود: ظاهر</button>
    </div>
    <div class="info-box" style="margin-top:8px;font-size:12px;line-height:1.7">
      عند الدخول إلى وسط أكثر كثافة ينثني الشعاع <strong>نحو العمود</strong> (r أصغر من i).
    </div>
  `);
  const cv=document.getElementById('simCanvas');
  function geom(w,h){
    const cx=w*0.5, cy=h*0.5, L=Math.min(w,h)*0.44;
    const i=S.a*Math.PI/180, n1=1, n2=S.n2;
    const sr=Math.min(1,(n1/n2)*Math.sin(i));
    const r=Math.asin(sr);
    const p0={x:cx-Math.sin(i)*L,y:cy-Math.cos(i)*L};
    const p1={x:cx+Math.sin(r)*L,y:cy+Math.cos(r)*L};
    return {cx,cy,L,i,r,n1,n2,p0,p1};
  }
  function posE(e){
    const r=cv.getBoundingClientRect();
    const p=(e.touches&&e.touches[0])||(e.changedTouches&&e.changedTouches[0])||e;
    return {mx:p.clientX-r.left,my:p.clientY-r.top};
  }
  function tryDrag(mx,my,w,h){
    const G=geom(w,h);
    if(Math.hypot(mx-G.p0.x,my-G.p0.y)<24){ S.drag=true; return; }
    if(Math.abs(mx-G.cx)<22&&my<G.cy-10&&my>G.cy-G.L-20) S.drag=true;
  }
  function ptrToAngle(mx,my,w,h){
    const G=geom(w,h);
    const dx=G.cx-mx, dy=G.cy-my;
    if(dy<6) return;
    let deg=Math.atan2(Math.abs(dx),dy)*180/Math.PI;
    window._setRefA(Math.max(5,Math.min(85,Math.round(deg))));
  }
  cv.onmousedown=function(e){ if(currentSim!=='g9refract')return; const {mx,my}=posE(e); tryDrag(mx,my,cv.width,cv.height); };
  cv.onmousemove=function(e){ if(!S.drag||currentSim!=='g9refract')return; ptrToAngle(posE(e).mx,posE(e).my,cv.width,cv.height); };
  cv.onmouseup=cv.onmouseleave=function(){ S.drag=false; };
  cv.ontouchstart=function(e){ if(currentSim!=='g9refract')return; tryDrag(posE(e).mx,posE(e).my,cv.width,cv.height); if(S.drag)e.preventDefault(); };
  cv.ontouchmove=function(e){ if(!S.drag)return; e.preventDefault(); const p=posE(e); ptrToAngle(p.mx,p.my,cv.width,cv.height); };
  cv.ontouchend=function(){ S.drag=false; };

  function draw(){
    if(currentSim!=='g9refract'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    S.t+=0.02;
    c.clearRect(0,0,w,h);
    const sky=c.createLinearGradient(0,0,0,h*0.5);
    sky.addColorStop(0,'#E0F2FE'); sky.addColorStop(1,'#BAE6FD');
    c.fillStyle=sky; c.fillRect(0,0,w,h*0.5);
    const mat=c.createLinearGradient(0,h*0.5,0,h);
    const hue=S.n2>1.8?'180,70%':'200,65%';
    mat.addColorStop(0,`hsla(${hue},0.35,0.92,0.95)`);
    mat.addColorStop(1,`hsla(${hue},0.45,0.75,0.9)`);
    c.fillStyle=mat; c.fillRect(0,h*0.5,w,h*0.5);
    c.strokeStyle='rgba(30,45,61,0.45)'; c.lineWidth=3;
    c.beginPath(); c.moveTo(0,h*0.5); c.lineTo(w,h*0.5); c.stroke();

    const {cx,cy,L,i,r,n1,n2,p0,p1}=geom(w,h);

    if(S.showNorm){
      c.setLineDash([7,6]); c.strokeStyle='rgba(26,143,168,0.75)'; c.lineWidth=2;
      c.beginPath(); c.moveTo(cx,h*0.1); c.lineTo(cx,h*0.9); c.stroke(); c.setLineDash([]);
    }

    function waveRay(x1,y1,x2,y2,inc){
      const gr=c.createLinearGradient(x1,y1,x2,y2);
      if(inc){ gr.addColorStop(0,'#FDE68A'); gr.addColorStop(1,'#EA580C'); }
      else { gr.addColorStop(0,'#7DD3FC'); gr.addColorStop(1,'#0369A1'); }
      c.strokeStyle=gr; c.lineWidth=6; c.lineCap='round';
      c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.stroke();
      const wx=x2-x1, wy=y2-y1;
      for(let k=0;k<=8;k++){
        const t=k/8, px=x1+wx*t, py=y1+wy*t, ph=Math.sin(S.t*2.8+k*0.8)*3.5;
        c.strokeStyle=inc?'rgba(234,88,12,0.35)':'rgba(3,105,161,0.35)'; c.lineWidth=2;
        c.beginPath(); c.moveTo(px-ph,py); c.lineTo(px+ph,py); c.stroke();
      }
    }
    waveRay(p0.x,p0.y,cx,cy,true);
    waveRay(cx,cy,p1.x,p1.y,false);

    c.fillStyle='#F59E0B'; c.beginPath(); c.arc(p0.x,p0.y,13+Math.sin(S.t*3)*1.5,0,Math.PI*2); c.fill();
    c.strokeStyle='white'; c.lineWidth=2; c.stroke();
    c.fillStyle='white'; c.font=`bold 10px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('اسحب',p0.x,p0.y);

    const arcR=Math.min(w,h)*0.09;
    c.strokeStyle='rgba(245,158,11,0.85)'; c.lineWidth=2.5;
    c.beginPath(); c.arc(cx,cy,arcR,-Math.PI/2,-Math.PI/2+i,false); c.stroke();
    c.strokeStyle='rgba(14,165,233,0.85)';
    c.beginPath(); c.arc(cx,cy,arcR,-Math.PI/2,-Math.PI/2+i+r,false); c.stroke();

    c.fillStyle='rgba(15,23,42,0.9)'; c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText('i = '+S.a.toFixed(0)+'°', cx-w*0.18, cy-h*0.12);
    c.fillText('r = '+(r*180/Math.PI).toFixed(1)+'°', cx+w*0.18, cy+h*0.1);

    c.fillStyle='rgba(30,45,61,0.55)'; c.font=`${Math.round(h*0.022)}px Tajawal`;
    c.fillText('هواء n₁ = '+n1.toFixed(2), w*0.12, h*0.08);
    c.fillText('مادة n₂ = '+n2.toFixed(2), w*0.12, h*0.62);

    c.fillStyle='rgba(255,255,255,0.92)'; c.beginPath(); c.roundRect(w*0.18,h*0.78,w*0.64,46,12); c.fill();
    c.strokeStyle='rgba(26,143,168,0.25)'; c.stroke();
    c.fillStyle='#0C4A6E'; c.font=`bold ${Math.round(h*0.024)}px Tajawal`;
    c.fillText('n₁ sin(i) = '+ (n1*Math.sin(i)).toFixed(3) +'   |   n₂ sin(r) = '+ (n2*Math.sin(r)).toFixed(3), w/2, h*0.805);
    c.fillStyle='#64748B'; c.font=`${Math.round(h*0.02)}px Tajawal`;
    c.fillText('يجب أن يتطابقا (نموذج رقمي)', w/2, h*0.835);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG9Refract2(){
  cancelAnimationFrame(animFrame);
  simState={n1:1.52,a:42,drag:false,t:0};
  const S=simState;
  window._setCritA=function(v){S.a=+v; var el=document.getElementById('cr-a'); if(el)el.textContent=v; var rg=document.getElementById('cr-rg'); if(rg)rg.value=v;};
  window._setCritN=function(v){S.n1=+v; var el=document.getElementById('cr-n'); if(el)el.textContent=(+v).toFixed(2); var rg=document.getElementById('cr-rgn'); if(rg)rg.value=v;};
  window._critPreset=function(mode){
    var n1=S.n1, n2=1, cdeg=Math.asin(n2/n1)*180/Math.PI;
    if(mode==='below') window._setCritA(Math.max(5,Math.round(cdeg-6)));
    if(mode==='at') window._setCritA(Math.round(cdeg));
    if(mode==='above') window._setCritA(Math.min(80,Math.round(cdeg+8)));
  };
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌈 زاوية حرجة — زجاج → هواء</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.78);line-height:1.65;margin-top:4px">
        الوسط السفلي: زجاج (n₁). الأعلى: هواء (n₂ = 1). إذا تجاوزت i الزاوية الحرجة c يحدث <strong>انعكاس كلي داخلي</strong>. اسحب مقبض الشعاع على الشاشة.
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">معامل n₁ للزجاج: <span id="cr-n">1.52</span></div>
      <input id="cr-rgn" type="range" min="1.35" max="1.75" step="0.01" value="1.52" oninput="window._setCritN(this.value)" style="width:100%">
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">زاوية السقوط i: <span id="cr-a">42</span>°</div>
      <input id="cr-rg" type="range" min="5" max="80" value="42" oninput="window._setCritA(this.value)" style="width:100%">
      <div class="ctrl-btns-grid" style="margin-top:8px">
        <button class="ctrl-btn" onclick="window._critPreset('below')">قبل الحرجة</button>
        <button class="ctrl-btn action" onclick="window._critPreset('at')">عند c تقريباً</button>
        <button class="ctrl-btn" onclick="window._critPreset('above')">بعد الحرجة</button>
      </div>
    </div>
    <div class="info-box" style="margin-top:8px;font-size:12px;line-height:1.7">
      c = sin⁻¹(n₂/n₁). جرّب الأزرار ثم افتح سؤال الاستنتاج من الأسفل.
    </div>
  `);
  const cv=document.getElementById('simCanvas');
  function geom(w,h){
    const cx=w*0.5, cy=h*0.5, L=Math.min(w,h)*0.42;
    const i=S.a*Math.PI/180, n1=S.n1, n2=1;
    const crit=Math.asin(n2/n1);
    const tir=i>crit;
    let r=0, pRefr={x:cx,y:cy};
    if(!tir) r=Math.asin(Math.min(0.999,(n1/n2)*Math.sin(i)));
    if(!tir) pRefr={x:cx+Math.sin(r)*L,y:cy-Math.cos(r)*L};
    const p0={x:cx-Math.sin(i)*L,y:cy+Math.cos(i)*L};
    return {cx,cy,L,i,n1,n2,crit,tir,r,p0,pRefr};
  }
  function posE(e){
    const r=cv.getBoundingClientRect();
    const p=(e.touches&&e.touches[0])||(e.changedTouches&&e.changedTouches[0])||e;
    return {mx:p.clientX-r.left,my:p.clientY-r.top};
  }
  cv.onmousedown=function(e){ if(currentSim!=='g9refract')return; const {mx,my}=posE(e),w=cv.width,h=cv.height,G=geom(w,h);
    if(Math.hypot(mx-G.p0.x,my-G.p0.y)<24) S.drag=true;
  };
  cv.onmousemove=function(e){ if(!S.drag||currentSim!=='g9refract')return; const {mx,my}=posE(e),w=cv.width,h=cv.height,G=geom(w,h);
    const dx=G.cx-mx, dy=my-G.cy;
    if(dy>8){ let deg=Math.atan2(Math.abs(dx),dy)*180/Math.PI; window._setCritA(Math.max(5,Math.min(80,Math.round(deg)))); }
  };
  cv.onmouseup=cv.onmouseleave=function(){ S.drag=false; };
  cv.ontouchstart=function(e){ if(currentSim!=='g9refract')return; const {mx,my}=posE(e),G=geom(cv.width,cv.height);
    if(Math.hypot(mx-G.p0.x,my-G.p0.y)<26){ S.drag=true; e.preventDefault(); }
  };
  cv.ontouchmove=function(e){ if(!S.drag)return; e.preventDefault(); const {mx,my}=posE(e),G=geom(cv.width,cv.height);
    const dx=G.cx-mx, dy=my-G.cy; if(dy>8){ let deg=Math.atan2(Math.abs(dx),dy)*180/Math.PI; window._setCritA(Math.max(5,Math.min(80,Math.round(deg)))); }
  };
  cv.ontouchend=function(){ S.drag=false; };

  function draw(){
    if(currentSim!=='g9refract'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    S.t+=0.02;
    c.clearRect(0,0,w,h);
    const glass=c.createLinearGradient(0,0,0,h*0.5);
    glass.addColorStop(0,'#BBF7D0'); glass.addColorStop(1,'#4ADE80');
    c.fillStyle=glass; c.fillRect(0,0,w,h*0.5);
    c.fillStyle='#E0F2FE'; c.fillRect(0,h*0.5,w,h*0.5);
    c.strokeStyle='rgba(30,45,61,0.4)'; c.lineWidth=3;
    c.beginPath(); c.moveTo(0,h*0.5); c.lineTo(w,h*0.5); c.stroke();

    const {cx,cy,L,i,n1,n2,crit,tir,r,p0,pRefr}=geom(w,h);

    c.setLineDash([7,6]); c.strokeStyle='rgba(26,143,168,0.7)'; c.lineWidth=2;
    c.beginPath(); c.moveTo(cx,h*0.08); c.lineTo(cx,h*0.92); c.stroke(); c.setLineDash([]);

    c.strokeStyle='#F59E0B'; c.lineWidth=6; c.lineCap='round';
    c.beginPath(); c.moveTo(p0.x,p0.y); c.lineTo(cx,cy); c.stroke();

    if(tir){
      const pRef={x:cx+Math.sin(i)*L,y:cy+Math.cos(i)*L};
      c.strokeStyle='#06B6D4'; c.lineWidth=6;
      c.beginPath(); c.moveTo(cx,cy); c.lineTo(pRef.x,pRef.y); c.stroke();
      c.fillStyle='rgba(220,38,38,0.95)'; c.font=`bold ${Math.min(20,Math.round(h*0.032))}px Tajawal`; c.textAlign='center';
      c.fillText('⚡ انعكاس كلي داخلي (TIR)', w/2, h*0.06);
    }else{
      c.strokeStyle='#0EA5E9'; c.lineWidth=6;
      c.beginPath(); c.moveTo(cx,cy); c.lineTo(pRefr.x,pRefr.y); c.stroke();
      c.fillStyle='rgba(22,163,74,0.95)'; c.font=`bold ${Math.min(20,Math.round(h*0.032))}px Tajawal`; c.textAlign='center';
      c.fillText('↗ انكسار إلى الهواء', w/2, h*0.06);
    }

    c.fillStyle='#F59E0B'; c.beginPath(); c.arc(p0.x,p0.y,13,0,Math.PI*2); c.fill();
    c.strokeStyle='white'; c.lineWidth=2; c.stroke();
    c.fillStyle='white'; c.font='bold 10px Tajawal'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('اسحب',p0.x,p0.y);

    const cdeg=crit*180/Math.PI;
    c.fillStyle='rgba(15,23,42,0.88)'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText('i = '+S.a.toFixed(0)+'°   |   c ≈ '+cdeg.toFixed(1)+'°   |   n₁='+n1.toFixed(2)+'  n₂='+n2.toFixed(2), w/2, h*0.88);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// الصف التاسع — الوحدة 13: معامل الانكسار (١٣-٢)
// ══════════════════════════════════════════════════════════
function simG9RefractN1(){
  cancelAnimationFrame(animFrame);
  const MATERIALS=[
    {name:'فراغ',   emoji:'🌌', n:1.000, color:'#94A3B8'},
    {name:'هواء',   emoji:'💨', n:1.0003,color:'#BAE6FD'},
    {name:'ماء',    emoji:'💧', n:1.33,  color:'#0EA5E9'},
    {name:'زجاج',   emoji:'🪟', n:1.50,  color:'#67E8F9'},
    {name:'برسبيكس',emoji:'🔷', n:1.50,  color:'#60A5FA'},
    {name:'ألماس',  emoji:'💎', n:2.40,  color:'#A78BFA'},
  ];
  simState={mat:2, t:0};
  window._refNMat=function(i){simState.mat=i; var btns=document.querySelectorAll('.matn-btn'); btns.forEach(b=>b.classList.remove('action')); var a=document.getElementById('mn-'+i); if(a) a.classList.add('action');};
  const btnHtml = MATERIALS.map((m,i)=>`<button id="mn-${i}" class="ctrl-btn matn-btn${i===2?' action':''}" onclick="window._refNMat(${i})">${m.emoji} ${m.name}</button>`).join('');
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">💎 اختر المادة الشفافة</div>
      <div class="ctrl-btns-grid">${btnHtml}</div>
    </div>
    <div class="info-box" style="margin-top:8px;font-size:12px;line-height:1.7">
      تغيّر المادة يغيّر n وزاوية الانكسار عند i ثابتة. الاستنتاج من الزر أسفل الشاشة.
    </div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9refractN'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    simState.t+=0.018;
    const t=simState.t, m=MATERIALS[simState.mat];
    c.clearRect(0,0,w,h);
    // Sky/Air zone
    c.fillStyle='#EAF4FF'; c.fillRect(0,0,w,h*0.45);
    // Material zone
    const matGrad=c.createLinearGradient(0,h*0.45,0,h);
    matGrad.addColorStop(0,m.color+'55'); matGrad.addColorStop(1,m.color+'22');
    c.fillStyle=matGrad; c.fillRect(0,h*0.45,w,h*0.55);
    // Interface line
    c.strokeStyle='rgba(30,45,61,0.3)'; c.lineWidth=2.5;
    c.beginPath(); c.moveTo(0,h*0.45); c.lineTo(w,h*0.45); c.stroke();
    // Normal (dashed)
    c.setLineDash([6,5]); c.strokeStyle='#1A8FA8'; c.lineWidth=1.5;
    c.beginPath(); c.moveTo(w*0.5,h*0.08); c.lineTo(w*0.5,h*0.92); c.stroke(); c.setLineDash([]);
    // Fixed angle of incidence = 40°
    const i=40*Math.PI/180;
    const r_rad=Math.asin(Math.min(0.999,(1.0/m.n)*Math.sin(i)));
    const L=h*0.36;
    const cx=w*0.5, cy=h*0.45;
    // Incident ray (animated photon)
    c.strokeStyle='#F59E0B'; c.lineWidth=4;
    c.beginPath(); c.moveTo(cx-Math.sin(i)*L,cy-Math.cos(i)*L); c.lineTo(cx,cy); c.stroke();
    // Refracted ray
    c.strokeStyle=m.color==='#94A3B8'?'#F59E0B':m.color; c.lineWidth=4;
    c.beginPath(); c.moveTo(cx,cy); c.lineTo(cx+Math.sin(r_rad)*L,cy+Math.cos(r_rad)*L); c.stroke();
    // Animated photon on incident
    const pf=(t*0.25)%1;
    const px=cx-Math.sin(i)*L*(1-pf), py=cy-Math.cos(i)*L*(1-pf);
    c.fillStyle='#FFF7'; c.beginPath(); c.arc(px,py,7,0,Math.PI*2); c.fill();
    c.fillStyle='#F59E0B'; c.beginPath(); c.arc(px,py,4.5,0,Math.PI*2); c.fill();
    // Animated photon on refracted
    const pf2=(t*0.25/m.n)%1;
    const rx=cx+Math.sin(r_rad)*L*pf2, ry=cy+Math.cos(r_rad)*L*pf2;
    c.fillStyle='#FFF7'; c.beginPath(); c.arc(rx,ry,7,0,Math.PI*2); c.fill();
    c.fillStyle=m.color; c.beginPath(); c.arc(rx,ry,4.5,0,Math.PI*2); c.fill();
    // Angle labels
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText(`i = 40°`, w*0.28, h*0.35);
    c.fillText(`r = ${(r_rad*180/Math.PI).toFixed(1)}°`, w*0.72, h*0.58);
    // Info panel
    const panX=w*0.03, panY=h*0.05;
    c.fillStyle='rgba(255,255,255,0.92)'; c.beginPath(); c.roundRect(panX,panY,w*0.38,h*0.28,12); c.fill();
    c.strokeStyle=m.color; c.lineWidth=2; c.stroke();
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
    c.fillText(`${m.emoji} ${m.name}`, panX+w*0.19, panY+h*0.055);
    c.font=`bold ${Math.round(h*0.038)}px Tajawal`;
    c.fillStyle=m.color; c.fillText(`n = ${m.n.toFixed(4)}`, panX+w*0.19, panY+h*0.125);
    c.fillStyle='#555'; c.font=`${Math.round(h*0.025)}px Tajawal`;
    const vlight=Math.round((3e8/m.n)/1e6)/100;
    c.fillText(`v = ${vlight.toFixed(2)} × 10⁸ m/s`, panX+w*0.19, panY+h*0.185);
    c.fillStyle='#888'; c.font=`${Math.round(h*0.021)}px Tajawal`;
    c.fillText(`الضوء في الفراغ: 3×10⁸ m/s`, panX+w*0.19, panY+h*0.235);
    // Labels on zones
    c.fillStyle='rgba(30,45,61,0.6)'; c.font=`${Math.round(h*0.026)}px Tajawal`; c.textAlign='left';
    c.fillText('هواء (n = 1.00)', w*0.55, h*0.1);
    c.fillStyle=m.color; c.fillText(`${m.name} (n = ${m.n.toFixed(2)})`, w*0.55, h*0.9);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG9RefractN2(){
  cancelAnimationFrame(animFrame);
  const MATS=[
    {name:'ماء',    n:1.33, v:2.25, color:'#0EA5E9', emoji:'💧'},
    {name:'برسبيكس',n:1.50, v:2.00, color:'#60A5FA', emoji:'🔷'},
    {name:'زجاج',  n:1.60, v:1.88, color:'#67E8F9', emoji:'🪟'},
    {name:'ألماس', n:2.40, v:1.25, color:'#A78BFA', emoji:'💎'},
  ];
  simState={t:0};
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧪 مقارنة معاملات الانكسار</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.75);line-height:1.6;margin-top:4px">
        كل مادة لها معامل انكسار مختلف يعكس كثافتها البصرية وسرعة الضوء بداخلها.
      </div>
    </div>
    <div class="info-box" style="margin-top:8px;font-size:12px;line-height:1.7">
      قارن أشرطة n وسرعة الضوء v. ثم افتح سؤال الاستنتاج من الأسفل.
    </div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9refractN'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    simState.t+=0.018;
    c.clearRect(0,0,w,h);
    c.fillStyle='#F8FAFC'; c.fillRect(0,0,w,h);
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.036)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
    c.fillText('مقارنة بين المواد الشفافة', w/2, h*0.02);
    const barX=w*0.12, barW=w*0.55, barH=h*0.075, gap=h*0.115, top=h*0.1;
    const maxN=2.5;
    MATS.forEach((m,i)=>{
      const y=top+i*gap;
      // Label
      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.027)}px Tajawal`; c.textAlign='right';
      c.fillText(`${m.emoji} ${m.name}`, barX-6, y+barH*0.28);
      // Background bar
      c.fillStyle='#E2E8F0'; c.beginPath(); c.roundRect(barX,y,barW,barH,6); c.fill();
      // Animated fill
      const anim=Math.min(m.n/maxN, simState.t/5);
      const grad=c.createLinearGradient(barX,0,barX+barW,0);
      grad.addColorStop(0,m.color+'AA'); grad.addColorStop(1,m.color);
      c.fillStyle=grad; c.beginPath(); c.roundRect(barX,y,barW*Math.min(1,anim),barH,6); c.fill();
      // n value
      c.fillStyle='white'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='left';
      if(anim>0.15) c.fillText(`n = ${m.n}`, barX+6, y+barH*0.28);
      // Speed
      c.fillStyle='#475569'; c.font=`${Math.round(h*0.022)}px Tajawal`; c.textAlign='left';
      c.fillText(`v = ${m.v} × 10⁸ m/s`, barX+barW+8, y+barH*0.3);
      // Animated refraction angle preview (small)
      const aX=w*0.88, aY=y+barH*0.5, aR=barH*0.55;
      const inc=40*Math.PI/180, ref=Math.asin(Math.min(0.999,Math.sin(inc)/m.n));
      c.strokeStyle=m.color; c.lineWidth=2;
      c.beginPath(); c.moveTo(aX-aR*Math.sin(inc),aY-aR*Math.cos(inc)); c.lineTo(aX,aY); c.lineTo(aX+aR*Math.sin(ref),aY+aR*Math.cos(ref)); c.stroke();
      c.setLineDash([3,3]); c.strokeStyle='#94A3B8'; c.lineWidth=1;
      c.beginPath(); c.moveTo(aX,aY-aR*0.9); c.lineTo(aX,aY+aR*0.9); c.stroke(); c.setLineDash([]);
    });
    // Reference line
    c.strokeStyle='rgba(30,45,61,0.2)'; c.lineWidth=1.5; c.setLineDash([4,4]);
    const refX=barX+barW*(1/maxN);
    c.beginPath(); c.moveTo(refX,top-6); c.lineTo(refX,top+gap*MATS.length); c.stroke(); c.setLineDash([]);
    c.fillStyle='rgba(30,45,61,0.5)'; c.font=`${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
    c.fillText('n=1 (فراغ)', refX, top-10);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// الصف التاسع — الوحدة 13: الانعكاس الكلي الداخلي TIR (١٣-٣)
// ══════════════════════════════════════════════════════════
function simG9TIR1(){
  cancelAnimationFrame(animFrame);
  simState={angle:20, n:1.5, t:0};
  window._tirA=function(v){simState.angle=+v; var e=document.getElementById('tir-a'); if(e) e.textContent=v+'°';};
  window._tirN=function(v){simState.n=+v; var e=document.getElementById('tir-n'); if(e) e.textContent=(+v).toFixed(2);};
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔬 استكشاء الزاوية الحرجة</div>
      <div class="ctrl-label">زاوية السقوط i: <span id="tir-a">20°</span></div>
      <input type="range" min="1" max="89" value="20" oninput="window._tirA(this.value)" style="width:100%">
      <div class="ctrl-btns-grid" style="margin-top:8px">
        <button class="ctrl-btn" onclick="window._tirA(15)">⬇️ صغيرة</button>
        <button class="ctrl-btn action" onclick="window._tirA(42)">🎯 حرجة</button>
        <button class="ctrl-btn" onclick="window._tirA(65)">⬆️ كبيرة</button>
      </div>
      <div class="ctrl-label" style="margin-top:10px">معامل الانكسار n: <span id="tir-n">1.50</span></div>
      <input type="range" min="1.30" max="2.00" step="0.01" value="1.50" oninput="window._tirN(this.value)" style="width:100%">
    </div>
    <div class="q-box"><strong>💡 ماذا نستنتج؟</strong><br>الزاوية الحرجة = sin⁻¹(1/n). عند تجاوزها لا يخرج ضوء — كل الضوء ينعكس داخلياً بنسبة 100%.</div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9tir'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    simState.t+=0.02;
    const t=simState.t, ang=simState.angle, n=simState.n;
    const crit=Math.asin(1/n)*180/Math.PI;
    const isTIR=ang>=crit;
    c.clearRect(0,0,w,h);
    // Zones (Glass below, Air above)
    const intf=h*0.5;
    c.fillStyle='#DFF7EC'; c.fillRect(0,0,w,intf); // glass (light enters from below)
    c.fillStyle='#EAF4FF'; c.fillRect(0,intf,w,h-intf);
    // Zone labels
    c.fillStyle='rgba(30,45,61,0.55)'; c.font=`${Math.round(h*0.026)}px Tajawal`; c.textAlign='left';
    c.fillText(`زجاج (n = ${n.toFixed(2)})`, w*0.04, intf-h*0.04);
    c.fillText('هواء (n = 1.00)', w*0.04, intf+h*0.04);
    // Interface
    c.strokeStyle='rgba(30,45,61,0.25)'; c.lineWidth=2;
    c.beginPath(); c.moveTo(0,intf); c.lineTo(w,intf); c.stroke();
    // Normal
    c.setLineDash([6,5]); c.strokeStyle='#1A8FA8'; c.lineWidth=1.5;
    c.beginPath(); c.moveTo(w*0.5,h*0.1); c.lineTo(w*0.5,h*0.9); c.stroke(); c.setLineDash([]);
    const cx=w*0.5, cy=intf, ir=ang*Math.PI/180;
    const L=h*0.36;
    // Incident ray (upward from glass)
    c.strokeStyle='#F59E0B'; c.lineWidth=5; c.lineCap='round';
    c.beginPath(); c.moveTo(cx-Math.sin(ir)*L, cy+Math.cos(ir)*L); c.lineTo(cx,cy); c.stroke();
    // Animated incident photon
    const pf=(t*0.22)%1;
    const ipx=cx-Math.sin(ir)*L*(1-pf), ipy=cy+Math.cos(ir)*L*(1-pf);
    c.fillStyle='#FFF8'; c.beginPath(); c.arc(ipx,ipy,7,0,Math.PI*2); c.fill();
    c.fillStyle='#F59E0B'; c.beginPath(); c.arc(ipx,ipy,4.5,0,Math.PI*2); c.fill();
    c.lineCap='butt';
    if(isTIR){
      // Total internal reflection — reflected ray stays in glass
      c.strokeStyle='#06B6D4'; c.lineWidth=5; c.lineCap='round';
      c.beginPath(); c.moveTo(cx,cy); c.lineTo(cx+Math.sin(ir)*L, cy+Math.cos(ir)*L); c.stroke(); c.lineCap='butt';
      // Reflected photon
      const rf2=(t*0.22)%1;
      const rpx=cx+Math.sin(ir)*L*rf2, rpy=cy+Math.cos(ir)*L*rf2;
      c.fillStyle='#FFF8'; c.beginPath(); c.arc(rpx,rpy,7,0,Math.PI*2); c.fill();
      c.fillStyle='#06B6D4'; c.beginPath(); c.arc(rpx,rpy,4.5,0,Math.PI*2); c.fill();
      // TIR label
      c.fillStyle='#DC2626'; c.font=`bold ${Math.round(h*0.036)}px Tajawal`; c.textAlign='center';
      c.fillText('⛔ انعكاس كلي داخلي TIR', w*0.5, h*0.08);
      c.fillStyle='rgba(220,38,38,0.08)'; c.fillRect(0,0,w,intf);
    } else {
      // Partial refraction + partial reflection
      const sinR=Math.sin(ir)*n;
      if(sinR<=1){
        const rr=Math.asin(sinR);
        c.strokeStyle='#0EA5E9'; c.lineWidth=4; c.lineCap='round';
        c.beginPath(); c.moveTo(cx,cy); c.lineTo(cx+Math.sin(rr)*L*0.9, cy-Math.cos(rr)*L*0.9); c.stroke(); c.lineCap='butt';
        // Refracted photon
        const rf3=(t*0.22)%1;
        const rfx=cx+Math.sin(rr)*L*0.9*rf3, rfy=cy-Math.cos(rr)*L*0.9*rf3;
        c.fillStyle='#FFF8'; c.beginPath(); c.arc(rfx,rfy,6,0,Math.PI*2); c.fill();
        c.fillStyle='#0EA5E9'; c.beginPath(); c.arc(rfx,rfy,3.5,0,Math.PI*2); c.fill();
        // Weak reflected ray
        c.strokeStyle='rgba(6,182,212,0.35)'; c.lineWidth=2;
        c.beginPath(); c.moveTo(cx,cy); c.lineTo(cx+Math.sin(ir)*L*0.5, cy+Math.cos(ir)*L*0.5); c.stroke();
        c.fillStyle='#16A34A'; c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
        c.fillText('✅ الضوء يخرج للهواء', w*0.5, h*0.08);
        c.fillStyle='#1E2D3D'; c.font=`${Math.round(h*0.026)}px Tajawal`;
        c.fillText(`زاوية الانكسار = ${(rr*180/Math.PI).toFixed(1)}°`, w*0.5, h*0.14);
      }
    }
    // Bottom display
    const panY=h*0.84;
    c.fillStyle='rgba(30,45,61,0.08)'; c.beginPath(); c.roundRect(w*0.05,panY,w*0.9,h*0.13,12); c.fill();
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText(`زاوية السقوط i = ${ang}°   |   الزاوية الحرجة c = ${crit.toFixed(1)}°`, w*0.5, panY+h*0.04);
    const status=isTIR?'🔴 i > c → انعكاس كلي':'🟢 i < c → ينكسر الضوء للخارج';
    c.fillStyle=isTIR?'#DC2626':'#16A34A'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`;
    c.fillText(status, w*0.5, panY+h*0.09);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG9TIR2(){
  cancelAnimationFrame(animFrame);
  simState={scenario:'prism', t:0};
  window._tirScene=function(s){simState.scenario=s; var btns=document.querySelectorAll('.tir-btn'); btns.forEach(b=>b.classList.remove('action')); var a=document.getElementById('ts-'+s); if(a) a.classList.add('action');};
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">💡 كيف يعمل الانعكاس الكلي؟</div>
      <div class="ctrl-btns-grid">
        <button id="ts-prism" class="ctrl-btn tir-btn action" onclick="window._tirScene('prism')">🔺 منشور</button>
        <button id="ts-diamond" class="ctrl-btn tir-btn" onclick="window._tirScene('diamond')">💎 ألماس</button>
        <button id="ts-pool" class="ctrl-btn tir-btn" onclick="window._tirScene('pool')">🏊 حوض سباحة</button>
      </div>
    </div>
    <div class="q-box"><strong>💡 ماذا نستنتج؟</strong><br>الانعكاس الكلي الداخلي يُستخدم في المناشير البصرية والألماس والألياف البصرية لتوجيه الضوء بكفاءة 100%.</div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9tir'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    simState.t+=0.02;
    const t=simState.t, sc=simState.scenario;
    c.clearRect(0,0,w,h);
    c.fillStyle='#0F172A'; c.fillRect(0,0,w,h);
    c.fillStyle='white'; c.font=`bold ${Math.round(h*0.034)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
    if(sc==='prism'){
      c.fillText('منشور يعكس الضوء بزاوية 90°',w/2,h*0.03);
      // Prism shape
      c.fillStyle='rgba(103,232,249,0.15)'; c.strokeStyle='#67E8F9'; c.lineWidth=2.5;
      c.beginPath(); c.moveTo(w*0.3,h*0.75); c.lineTo(w*0.7,h*0.75); c.lineTo(w*0.3,h*0.25); c.closePath(); c.fill(); c.stroke();
      // Incoming ray (horizontal left)
      const ry=h*0.5;
      c.strokeStyle='#F59E0B'; c.lineWidth=4;
      c.beginPath(); c.moveTo(w*0.06,ry); c.lineTo(w*0.3,ry); c.stroke();
      // TIR inside prism (goes down)
      c.strokeStyle='#0EA5E9'; c.lineWidth=4;
      c.beginPath(); c.moveTo(w*0.3,ry); c.lineTo(w*0.3,h*0.75); c.stroke();
      // Exit ray (downward)
      c.strokeStyle='#22C55E'; c.lineWidth=4;
      c.beginPath(); c.moveTo(w*0.3,h*0.75); c.lineTo(w*0.3,h*0.92); c.stroke();
      // Animated photons
      const f=((t*0.2)%1);
      const segs=[{x1:w*0.06,y1:ry,x2:w*0.3,y2:ry,col:'#F59E0B'},{x1:w*0.3,y1:ry,x2:w*0.3,y2:h*0.75,col:'#0EA5E9'},{x1:w*0.3,y1:h*0.75,x2:w*0.3,y2:h*0.92,col:'#22C55E'}];
      const totalLen=3, seg=Math.floor(f*totalLen), frac=(f*totalLen)%1;
      if(seg<segs.length){const s=segs[seg];const px=s.x1+(s.x2-s.x1)*frac,py=s.y1+(s.y2-s.y1)*frac;c.fillStyle='white';c.beginPath();c.arc(px,py,7,0,Math.PI*2);c.fill();c.fillStyle=s.col;c.beginPath();c.arc(px,py,4.5,0,Math.PI*2);c.fill();}
      c.fillStyle='rgba(255,255,255,0.7)'; c.font=`${Math.round(h*0.024)}px Tajawal`; c.textAlign='left';
      c.fillText('شعاع ساقط →',w*0.06,ry-h*0.04);
      c.fillText('↓ انعكاس كلي',w*0.32,ry+h*0.13);
      c.fillText('↓ شعاع خارج',w*0.32,h*0.88);
    } else if(sc==='diamond'){
      c.fillText('الألماس يبرق بسبب الانعكاس الكلي (c≈25°)',w/2,h*0.03);
      // Diamond shape
      c.fillStyle='rgba(167,139,250,0.2)'; c.strokeStyle='#A78BFA'; c.lineWidth=2;
      const dx=w*0.5, dy=h*0.5;
      c.beginPath(); c.moveTo(dx,dy-h*0.28); c.lineTo(dx+w*0.22,dy); c.lineTo(dx,dy+h*0.32); c.lineTo(dx-w*0.22,dy); c.closePath(); c.fill(); c.stroke();
      // Multiple TIR beams inside
      const beams=[{x:dx-w*0.1,y:dy-h*0.1,ang:-40},{x:dx+w*0.05,y:dy-h*0.15,ang:50},{x:dx-w*0.05,y:dy+h*0.08,ang:-30}];
      beams.forEach((b,i)=>{
        const a=b.ang*Math.PI/180+t*0.3+i*1;
        c.strokeStyle=`hsl(${260+i*30},80%,70%)`; c.lineWidth=2.5;
        c.beginPath(); c.moveTo(b.x,b.y); c.lineTo(b.x+Math.cos(a)*w*0.18,b.y+Math.sin(a)*h*0.18); c.stroke();
      });
      c.fillStyle='rgba(255,255,255,0.75)'; c.font=`${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
      c.fillText('الضوء يتردد داخل الألماس',w/2,h*0.87);
      c.fillText('ويخرج متلألئاً من الوجوه الخارجية',w/2,h*0.92);
    } else {
      c.fillText('حوض سباحة — الضوء محبوس تحت الماء',w/2,h*0.03);
      c.fillStyle='rgba(14,165,233,0.25)'; c.fillRect(0,h*0.45,w,h*0.55);
      c.strokeStyle='#0EA5E9'; c.lineWidth=2;
      c.beginPath(); c.moveTo(0,h*0.45); c.lineTo(w,h*0.45); c.stroke();
      // "window" in water where light can escape
      const critW=Math.asin(1/1.33)*180/Math.PI;
      c.fillStyle='rgba(255,255,255,0.15)'; c.beginPath(); c.arc(w*0.5,h*0.45,w*0.18,Math.PI,2*Math.PI); c.fill();
      c.fillStyle='rgba(255,255,255,0.8)'; c.font=`${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
      c.fillText(`نافذة هروب الضوء (زاوية حرجة ${critW.toFixed(0)}°)`,w*0.5,h*0.38);
      // Rays from below
      const nRays=5;
      for(let i=0;i<nRays;i++){
        const rayAng=(i/(nRays-1)-0.5)*Math.PI*1.2;
        const startX=w*0.5+Math.sin(rayAng)*w*0.3, startY=h*0.85;
        const endX=w*0.5, endY=h*0.45;
        const isEscape=Math.abs(rayAng)<Math.asin(1/1.33);
        c.strokeStyle=isEscape?'#F59E0B':'rgba(14,165,233,0.6)'; c.lineWidth=isEscape?3:2;
        c.beginPath(); c.moveTo(startX,startY); c.lineTo(endX+(endX-startX)*0.1,endY+(endY-startY)*0.1); c.stroke();
        if(isEscape){
          c.beginPath(); c.moveTo(endX,endY); c.lineTo(endX+Math.sin(rayAng)*w*0.2,endY-h*0.25); c.stroke();
        } else {
          c.strokeStyle='rgba(14,165,233,0.5)'; c.beginPath(); c.moveTo(endX,endY); c.lineTo(startX+(startX-endX)*0.5,startY+(startY-endY)*0.5); c.stroke();
        }
      }
      c.fillStyle='rgba(255,255,255,0.7)'; c.font=`${Math.round(h*0.023)}px Tajawal`; c.textAlign='center';
      c.fillText('الأشعة خارج زاوية الهروب تنعكس كلياً داخل الماء',w/2,h*0.93);
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// الصف التاسع — الوحدة 13: الألياف البصرية (١٣-٤)
// ══════════════════════════════════════════════════════════
function simG9Fiber1(){
  cancelAnimationFrame(animFrame);
  simState={bend:0.3, t:0, photons:[]};
  for(let i=0;i<6;i++) simState.photons.push({phase:i/6, speed:0.4+Math.random()*0.1});
  window._fiberBend=function(v){simState.bend=+v; var e=document.getElementById('fb-bend'); if(e) e.textContent=Math.round(v*100)+'%';};
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">💡 الليف البصري</div>
      <div class="ctrl-label">مدى الانحناء: <span id="fb-bend">30%</span></div>
      <input type="range" min="0" max="0.8" step="0.01" value="0.3" oninput="window._fiberBend(this.value)" style="width:100%">
      <div class="ctrl-btns-grid" style="margin-top:8px">
        <button class="ctrl-btn action" onclick="window._fiberBend(0);document.getElementById('fb-bend').textContent='0%'">📏 مستقيم</button>
        <button class="ctrl-btn" onclick="window._fiberBend(0.4);document.getElementById('fb-bend').textContent='40%'">〰️ منحنٍ</button>
        <button class="ctrl-btn" onclick="window._fiberBend(0.75);document.getElementById('fb-bend').textContent='75%'">🌀 منحنٍ جداً</button>
      </div>
    </div>
    <div class="q-box"><strong>💡 ماذا نستنتج؟</strong><br>الضوء يتردد داخل الليف بالانعكاس الكلي الداخلي المتكرر — حتى مع الانحناء الشديد لا يتسرب الضوء للخارج.</div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9fiber'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    simState.t+=0.018;
    const t=simState.t, bend=simState.bend;
    c.clearRect(0,0,w,h);
    c.fillStyle='#0F172A'; c.fillRect(0,0,w,h);
    // Draw fiber path using bezier
    const fiberW=h*0.09;
    const p0={x:w*0.04,y:h*0.5};
    const p3={x:w*0.96,y:h*0.5};
    const cp1={x:w*0.35,y:h*0.5-h*bend};
    const cp2={x:w*0.65,y:h*0.5+h*bend};
    // Fiber cladding (outer)
    c.strokeStyle='rgba(100,160,220,0.25)'; c.lineWidth=fiberW+8;
    c.beginPath(); c.moveTo(p0.x,p0.y); c.bezierCurveTo(cp1.x,cp1.y,cp2.x,cp2.y,p3.x,p3.y); c.stroke();
    // Fiber core
    c.strokeStyle='rgba(30,60,120,0.9)'; c.lineWidth=fiberW;
    c.beginPath(); c.moveTo(p0.x,p0.y); c.bezierCurveTo(cp1.x,cp1.y,cp2.x,cp2.y,p3.x,p3.y); c.stroke();
    // Fiber inner glow
    c.strokeStyle='rgba(100,200,255,0.12)'; c.lineWidth=fiberW*0.6;
    c.beginPath(); c.moveTo(p0.x,p0.y); c.bezierCurveTo(cp1.x,cp1.y,cp2.x,cp2.y,p3.x,p3.y); c.stroke();
    // Animated photons along bezier
    const getBezier=(t)=>{
      const mt=1-t;
      return {
        x:mt*mt*mt*p0.x+3*mt*mt*t*cp1.x+3*mt*t*t*cp2.x+t*t*t*p3.x,
        y:mt*mt*mt*p0.y+3*mt*mt*t*cp1.y+3*mt*t*t*cp2.y+t*t*t*p3.y
      };
    };
    simState.photons.forEach(ph=>{
      ph.phase=(ph.phase+ph.speed*0.006)%1;
      const pos=getBezier(ph.phase);
      const glow=c.createRadialGradient(pos.x,pos.y,0,pos.x,pos.y,10);
      glow.addColorStop(0,'rgba(255,220,60,0.9)'); glow.addColorStop(1,'rgba(255,220,60,0)');
      c.fillStyle=glow; c.beginPath(); c.arc(pos.x,pos.y,10,0,Math.PI*2); c.fill();
      c.fillStyle='#FFF7'; c.beginPath(); c.arc(pos.x,pos.y,5,0,Math.PI*2); c.fill();
      c.fillStyle='#F59E0B'; c.beginPath(); c.arc(pos.x,pos.y,3,0,Math.PI*2); c.fill();
    });
    // Entry glow
    const entryGlow=c.createRadialGradient(p0.x,p0.y,0,p0.x,p0.y,30);
    entryGlow.addColorStop(0,'rgba(255,220,60,0.5)'); entryGlow.addColorStop(1,'rgba(255,220,60,0)');
    c.fillStyle=entryGlow; c.beginPath(); c.arc(p0.x,p0.y,30,0,Math.PI*2); c.fill();
    // Exit glow
    const exitGlow=c.createRadialGradient(p3.x,p3.y,0,p3.x,p3.y,30);
    exitGlow.addColorStop(0,'rgba(255,220,60,0.4)'); exitGlow.addColorStop(1,'rgba(255,220,60,0)');
    c.fillStyle=exitGlow; c.beginPath(); c.arc(p3.x,p3.y,30,0,Math.PI*2); c.fill();
    // Labels
    c.fillStyle='rgba(255,255,255,0.8)'; c.font=`${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText('📡 مصدر الضوء (ليزر)', p0.x+w*0.07, h*0.15);
    c.fillText('📲 المستقبل', p3.x-w*0.07, h*0.15);
    c.fillStyle='rgba(100,200,255,0.6)'; c.font=`${Math.round(h*0.024)}px Tajawal`;
    c.fillText('الغلاف (cladding)', w/2, h*0.2);
    c.fillStyle='rgba(30,140,220,0.8)';
    c.fillText('القلب (core) — n أعلى', w/2, h*0.78);
    c.fillStyle='rgba(255,220,60,0.9)'; c.font=`bold ${Math.round(h*0.025)}px Tajawal`;
    c.fillText('⚡ الضوء يصل 100% بالانعكاس الكلي المتكرر', w/2, h*0.92);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG9Fiber2(){
  cancelAnimationFrame(animFrame);
  simState={app:'med', t:0};
  window._fiberApp=function(a){simState.app=a; var btns=document.querySelectorAll('.fapp-btn'); btns.forEach(b=>b.classList.remove('action')); var el=document.getElementById('fa-'+a); if(el) el.classList.add('action');};
  const APPS={
    med:{name:'المنظار الداخلي', emoji:'🏥', desc:'يُستخدم في الطب لرؤية داخل جسم الإنسان دون جراحة. حزمتان: واحدة للإضاءة وأخرى للصورة.', color:'#22C55E'},
    net:{name:'شبكات الاتصال', emoji:'🌐', desc:'تنقل الألياف البصرية إشارات رقمية بسرعة الضوء — أسرع وأوثوق من الكابلات النحاسية.', color:'#3B82F6'},
    dec:{name:'الإضاءة الزخرفية', emoji:'💡', desc:'تُستخدم الألياف البصرية في الديكور والإضاءة لنقل الضوء لمسافات بعيدة دون فقد.', color:'#F59E0B'},
  };
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📡 تطبيقات الألياف البصرية</div>
      <div class="ctrl-btns-grid">
        <button id="fa-med" class="ctrl-btn fapp-btn action" onclick="window._fiberApp('med')">🏥 طب</button>
        <button id="fa-net" class="ctrl-btn fapp-btn" onclick="window._fiberApp('net')">🌐 اتصالات</button>
        <button id="fa-dec" class="ctrl-btn fapp-btn" onclick="window._fiberApp('dec')">💡 ديكور</button>
      </div>
    </div>
    <div class="q-box"><strong>💡 ماذا نستنتج؟</strong><br>الألياف البصرية ثورة تقنية تعتمد على TIR: لا فقد في الضوء، تحمل آلاف المكالمات في وقت واحد، وتُمكّن الطب من رؤية ما لا يُرى.</div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9fiber'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    simState.t+=0.02;
    const t=simState.t, app=APPS[simState.app];
    c.clearRect(0,0,w,h);
    c.fillStyle='#0F172A'; c.fillRect(0,0,w,h);
    // Title
    c.fillStyle='white'; c.font=`bold ${Math.round(h*0.038)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
    c.fillText(`${app.emoji} ${app.name}`, w/2, h*0.03);
    // Animated fibers
    const nFibers=simState.app==='net'?8:simState.app==='dec'?12:3;
    const colors=['#22C55E','#3B82F6','#F59E0B','#EC4899','#A78BFA','#67E8F9','#FB923C','#FACC15','#86EFAC','#93C5FD','#FDA4AF','#FDE68A'];
    for(let fi=0;fi<nFibers;fi++){
      const yOffset=(fi/(nFibers-1)-0.5)*h*0.35;
      const bend=(fi%2===0?1:-1)*0.15;
      const p0={x:w*0.06,y:h*0.55+yOffset};
      const p3={x:w*0.94,y:h*0.55+(fi%2===0?-1:1)*yOffset*0.5};
      const cp1={x:w*0.35,y:p0.y-h*bend};
      const cp2={x:w*0.65,y:p3.y+h*bend};
      c.strokeStyle=colors[fi%colors.length]+'44'; c.lineWidth=6;
      c.beginPath(); c.moveTo(p0.x,p0.y); c.bezierCurveTo(cp1.x,cp1.y,cp2.x,cp2.y,p3.x,p3.y); c.stroke();
      // Photon
      const ph=((t*0.3+fi*0.13)%1);
      const mt=1-ph;
      const px=mt*mt*mt*p0.x+3*mt*mt*ph*cp1.x+3*mt*ph*ph*cp2.x+ph*ph*ph*p3.x;
      const py=mt*mt*mt*p0.y+3*mt*mt*ph*cp1.y+3*mt*ph*ph*cp2.y+ph*ph*ph*p3.y;
      c.fillStyle=colors[fi%colors.length]; c.beginPath(); c.arc(px,py,5,0,Math.PI*2); c.fill();
    }
    // Description box
    const bY=h*0.12;
    c.fillStyle='rgba(255,255,255,0.08)'; c.beginPath(); c.roundRect(w*0.05,bY,w*0.9,h*0.22,14); c.fill();
    c.strokeStyle=app.color+'66'; c.lineWidth=1.5; c.stroke();
    c.fillStyle='rgba(255,255,255,0.88)'; c.font=`${Math.round(h*0.027)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    // Wrap text
    const words=app.desc.split(' '); let line=''; let lineY=bY+h*0.065; const lineH=h*0.045;
    words.forEach(word=>{
      const test=line+word+' ';
      if(c.measureText(test).width>w*0.82 && line!=''){
        c.fillText(line.trim(),w/2,lineY); lineY+=lineH; line=word+' ';
      } else { line=test; }
    });
    if(line) c.fillText(line.trim(),w/2,lineY);
    // Stats
    c.fillStyle=app.color; c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center'; c.textBaseline='bottom';
    const stats={med:'تحمل حزمتين: إضاءة + تصوير',net:'تنقل مليار بت/ثانية',dec:'لا سخونة — أمان تام'};
    c.fillText(`✨ ${stats[simState.app]}`, w/2, h*0.93);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// الصف التاسع — الوحدة 14: مخطط الأشعة التفاعلي (١٤-٢)
// ══════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════
// الوحدة ١٤ · TAB 1: أنواع العدسات وتأثيرها على الأشعة
// ══════════════════════════════════════════════════════════════════════
function simG9RayDiagram1(){
  cancelAnimationFrame(animFrame);
  simState={step:0,d:2.6,f:1,t:0};
  const S=simState;
  const steps=[
    'اضغط "التالي" — الجسم بعيد (d > 2f) عن العدسة',
    '① الشعاع ١: مواز للمحور → ينكسر عبر البؤرة F بعد العدسة',
    '② الشعاع ٢: يمرّ بمركز العدسة (O) دون انكسار — مستقيم',
    '③ نقطة تقاطع الشعاعَين = رأس الصورة (I)',
    '✅ الصورة حقيقية · مقلوبة · مصغَّرة · بين F و 2F'
  ];
  window._rd1Step=function(n){
    S.step=Math.max(0,Math.min(4,n));
    const el=document.getElementById('rd1-info'); if(el) el.textContent=steps[S.step];
    const sn=document.getElementById('rd1-sn'); if(sn) sn.textContent=S.step+'/4';
  };
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📐 مخطط الأشعة: d > 2f → صورة حقيقية</div>
      <div style="font-size:12px;color:var(--text-secondary);line-height:1.7">اتبع الخطوات لرسم الشعاعَين وفق الكتاب (نشاط ١-١٤).</div>
    </div>
    <div id="rd1-info" style="background:rgba(59,130,246,.1);border:1.5px solid rgba(59,130,246,.3);border-radius:10px;padding:10px;font-size:13px;font-family:Tajawal;line-height:1.6;min-height:52px">${steps[0]}</div>
    <div style="display:flex;align-items:center;gap:8px;margin-top:10px">
      <button onclick="window._rd1Step(0)" style="padding:7px 12px;border-radius:8px;border:2px solid var(--border-color);background:var(--surface);font-family:Tajawal;cursor:pointer">↩ بداية</button>
      <span id="rd1-sn" style="flex:1;text-align:center;font-family:Tajawal;color:var(--text-secondary);font-size:13px">0/4</span>
      <button onclick="window._rd1Step(simState.step+1)" style="padding:7px 16px;border-radius:8px;border:none;background:#3B82F6;color:white;font-family:Tajawal;font-size:14px;cursor:pointer;font-weight:700">التالي →</button>
    </div>
    <div class="info-box" style="margin-top:8px;font-size:12px;line-height:1.7">
      📌 قانون العدسة: <strong>1/f = 1/d_o + 1/d_i</strong>
    </div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9raydiagram'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    S.t+=0.016;
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,dm=isDarkMode();
    c.clearRect(0,0,w,h);
    c.fillStyle=dm?'#070D18':'#EEF3FF'; c.fillRect(0,0,w,h);
    c.strokeStyle=dm?'rgba(255,255,255,.04)':'rgba(0,0,180,.04)'; c.lineWidth=1;
    for(let gx=0;gx<w;gx+=28){c.beginPath();c.moveTo(gx,0);c.lineTo(gx,h);c.stroke();}
    for(let gy=0;gy<h;gy+=28){c.beginPath();c.moveTo(0,gy);c.lineTo(w,gy);c.stroke();}

    const cx=w*0.48, cy=h*0.55, f=w*0.13;
    const dox=f*S.d, oh=h*0.21;
    const di=(f*dox)/(dox-f), ih=oh*(di/dox);
    const ox=cx-dox, ix=cx+di, iy=cy+ih;

    // محور
    c.strokeStyle=dm?'rgba(200,220,255,.4)':'rgba(30,58,138,.25)'; c.lineWidth=1.5; c.setLineDash([8,6]);
    c.beginPath(); c.moveTo(0,cy); c.lineTo(w,cy); c.stroke(); c.setLineDash([]);
    // علامات f و 2f
    [cx-f,cx+f,cx-2*f,cx+2*f].forEach((px,i)=>{
      c.strokeStyle=i<2?'rgba(239,68,68,.3)':'rgba(100,130,200,.2)'; c.lineWidth=1; c.setLineDash([4,4]);
      c.beginPath(); c.moveTo(px,cy-h*0.44); c.lineTo(px,cy+h*0.28); c.stroke(); c.setLineDash([]);
      c.fillStyle=i<2?'#EF4444':(dm?'rgba(200,200,255,.55)':'rgba(80,100,180,.6)');
      c.font='bold 12px Tajawal'; c.textAlign='center'; c.textBaseline='top';
      c.fillText(i<2?'F':'2f',px,cy+6);
      if(i<2){c.fillStyle='#EF4444';c.beginPath();c.arc(px,cy,5,0,Math.PI*2);c.fill();}
    });
    // عدسة
    const lH=h*0.5, lW=13;
    c.fillStyle=dm?'rgba(99,179,237,.15)':'rgba(59,130,246,.1)';
    c.strokeStyle='#3B82F6'; c.lineWidth=3;
    c.beginPath();
    c.moveTo(cx-lW,cy-lH/2); c.quadraticCurveTo(cx+lW*1.8,cy,cx-lW,cy+lH/2);
    c.lineTo(cx+lW,cy+lH/2); c.quadraticCurveTo(cx-lW*1.8,cy,cx+lW,cy-lH/2);
    c.closePath(); c.fill(); c.stroke();
    [[1,cy-lH/2],[-1,cy+lH/2]].forEach(([d2,y])=>{
      c.fillStyle='#3B82F6';
      c.beginPath(); c.moveTo(cx,y); c.lineTo(cx-9*d2,y+16*d2); c.lineTo(cx+9*d2,y+16*d2); c.closePath(); c.fill();
    });
    // الجسم
    c.strokeStyle='#F59E0B'; c.lineWidth=3;
    c.beginPath(); c.moveTo(ox,cy); c.lineTo(ox,cy-oh); c.stroke();
    c.fillStyle='#F59E0B';
    c.beginPath(); c.moveTo(ox,cy-oh); c.lineTo(ox-6,cy-oh+12); c.lineTo(ox+6,cy-oh+12); c.closePath(); c.fill();
    c.font='bold 13px Tajawal'; c.fillStyle=dm?'#FCD34D':'#92400E'; c.textAlign='center'; c.textBaseline='bottom';
    c.fillText('O',ox,cy-oh-4);
    // الشعاع 1
    if(S.step>=1){
      const a=S.step===1?(0.55+Math.sin(S.t*4)*0.45):1; c.globalAlpha=a;
      c.strokeStyle='#EF4444'; c.lineWidth=2.5;
      c.beginPath(); c.moveTo(ox,cy-oh); c.lineTo(cx,cy-oh); c.stroke();
      c.beginPath(); c.moveTo(cx,cy-oh); c.lineTo(ix,iy); c.stroke();
      // سهم
      const ang=Math.atan2(iy-(cy-oh),ix-cx);
      c.fillStyle='#EF4444';
      c.beginPath(); c.moveTo(ix,iy); c.lineTo(ix-10*Math.cos(ang-0.3),iy-10*Math.sin(ang-0.3)); c.lineTo(ix-10*Math.cos(ang+0.3),iy-10*Math.sin(ang+0.3)); c.closePath(); c.fill();
      c.globalAlpha=1;
      c.font='11px Tajawal'; c.fillStyle='#EF4444'; c.textAlign='right'; c.textBaseline='bottom';
      c.fillText('شعاع ①',cx-4,cy-oh-4);
    }
    // الشعاع 2
    if(S.step>=2){
      const a=S.step===2?(0.55+Math.sin(S.t*4)*0.45):1; c.globalAlpha=a;
      c.strokeStyle='#10B981'; c.lineWidth=2.5;
      c.beginPath(); c.moveTo(ox,cy-oh); c.lineTo(ix,iy); c.stroke();
      const ang2=Math.atan2(iy-(cy-oh),ix-ox);
      c.fillStyle='#10B981';
      c.beginPath(); c.moveTo(ix,iy); c.lineTo(ix-10*Math.cos(ang2-0.3),iy-10*Math.sin(ang2-0.3)); c.lineTo(ix-10*Math.cos(ang2+0.3),iy-10*Math.sin(ang2+0.3)); c.closePath(); c.fill();
      c.globalAlpha=1;
      c.font='11px Tajawal'; c.fillStyle='#10B981'; c.textAlign='left'; c.textBaseline='middle';
      c.fillText('شعاع ②',cx+8,cy-oh*0.3);
    }
    // نقطة التقاطع
    if(S.step>=3){
      const r=6+Math.sin(S.t*5)*2;
      c.fillStyle='#7C3AED'; c.beginPath(); c.arc(ix,iy,r,0,Math.PI*2); c.fill();
      c.strokeStyle='white'; c.lineWidth=2; c.stroke();
      c.font='bold 12px Tajawal'; c.fillStyle='#7C3AED'; c.textAlign='left'; c.textBaseline='middle';
      c.fillText(' I (رأس الصورة)',ix,iy);
    }
    // الصورة الكاملة + بطاقة
    if(S.step>=4){
      c.strokeStyle='#7C3AED'; c.lineWidth=3;
      c.beginPath(); c.moveTo(ix,cy); c.lineTo(ix,iy); c.stroke();
      c.fillStyle='#7C3AED';
      c.beginPath(); c.moveTo(ix,iy); c.lineTo(ix-6,iy-12); c.lineTo(ix+6,iy-12); c.closePath(); c.fill();
      const bx=w*0.02, by=h*0.05, bw=w*0.41, bH=80;
      c.fillStyle=dm?'rgba(124,58,237,.15)':'rgba(124,58,237,.09)';
      c.strokeStyle='rgba(124,58,237,.45)'; c.lineWidth=1.5;
      c.beginPath(); c.roundRect(bx,by,bw,bH,10); c.fill(); c.stroke();
      c.font='bold 15px Tajawal'; c.fillStyle='#7C3AED'; c.textAlign='center'; c.textBaseline='top';
      c.fillText('✅ خصائص الصورة',bx+bw/2,by+8);
      c.font='13px Tajawal'; c.fillStyle=dm?'#C4B5FD':'#5B21B6';
      c.fillText('حقيقية  |  مقلوبة  |  مصغَّرة',bx+bw/2,by+30);
      c.fillText('تقع بين F و 2F من العدسة',bx+bw/2,by+52);
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════════════════
// ١٤-٢ · TAB 2: الجسم قريب (d < f) → صورة تقديرية — مخطط أشعة
// ══════════════════════════════════════════════════════════════════════
function simG9RayDiagram2(){
  cancelAnimationFrame(animFrame);
  simState={step:0,d:0.58,f:1,t:0};
  const S=simState;
  const steps=[
    'اضغط "التالي" — الجسم داخل البؤرة (d < f)',
    '① الشعاع ١: مواز للمحور → ينكسر عبر F بعد العدسة (يتباعد)',
    '② الشعاع ٢: يمرّ بمركز العدسة (O) دون انحراف',
    '③ امدد الشعاعَين للخلف (خط متقطع) — يتقاطعان خلف العدسة',
    '✅ الصورة تقديرية · معتدلة · مكبَّرة — مبدأ العدسة المكبِّرة 🔍'
  ];
  window._rd2Step=function(n){
    S.step=Math.max(0,Math.min(4,n));
    const el=document.getElementById('rd2-info'); if(el) el.textContent=steps[S.step];
    const sn=document.getElementById('rd2-sn'); if(sn) sn.textContent=S.step+'/4';
  };
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔍 مخطط الأشعة: d &lt; f → صورة تقديرية</div>
      <div style="font-size:12px;color:var(--text-secondary);line-height:1.7">عند وضع الجسم بين العدسة وبؤرتها تتكوّن صورة تقديرية مكبَّرة.</div>
    </div>
    <div id="rd2-info" style="background:rgba(139,92,246,.1);border:1.5px solid rgba(139,92,246,.3);border-radius:10px;padding:10px;font-size:13px;font-family:Tajawal;line-height:1.6;min-height:52px">${steps[0]}</div>
    <div style="display:flex;align-items:center;gap:8px;margin-top:10px">
      <button onclick="window._rd2Step(0)" style="padding:7px 12px;border-radius:8px;border:2px solid var(--border-color);background:var(--surface);font-family:Tajawal;cursor:pointer">↩ بداية</button>
      <span id="rd2-sn" style="flex:1;text-align:center;font-family:Tajawal;color:var(--text-secondary);font-size:13px">0/4</span>
      <button onclick="window._rd2Step(simState.step+1)" style="padding:7px 16px;border-radius:8px;border:none;background:#8B5CF6;color:white;font-family:Tajawal;font-size:14px;cursor:pointer;font-weight:700">التالي →</button>
    </div>
    <div class="info-box" style="margin-top:8px;font-size:12px;line-height:1.7">
      📌 هذا هو مبدأ <strong>العدسة المكبِّرة (المجهر البسيط)</strong>
    </div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9raydiagram'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    S.t+=0.016;
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,dm=isDarkMode();
    c.clearRect(0,0,w,h);
    c.fillStyle=dm?'#070D18':'#F5F0FF'; c.fillRect(0,0,w,h);
    c.strokeStyle=dm?'rgba(255,255,255,.04)':'rgba(100,0,180,.04)'; c.lineWidth=1;
    for(let gx=0;gx<w;gx+=28){c.beginPath();c.moveTo(gx,0);c.lineTo(gx,h);c.stroke();}
    for(let gy=0;gy<h;gy+=28){c.beginPath();c.moveTo(0,gy);c.lineTo(w,gy);c.stroke();}

    const cx=w*0.5, cy=h*0.55, f=w*0.17;
    const dox=f*S.d, oh=h*0.16;
    const di=(f*dox)/(dox-f); // سالب
    const mag=Math.abs(di/dox);
    const ih=oh*mag;
    const ox=cx-dox;
    const virtX=cx+di; // سالب → يسار

    // محور
    c.strokeStyle=dm?'rgba(200,220,255,.4)':'rgba(80,20,180,.2)'; c.lineWidth=1.5; c.setLineDash([8,6]);
    c.beginPath(); c.moveTo(0,cy); c.lineTo(w,cy); c.stroke(); c.setLineDash([]);
    // F
    c.fillStyle='#EF4444'; c.beginPath(); c.arc(cx+f,cy,5,0,Math.PI*2); c.fill();
    c.font='bold 12px Tajawal'; c.fillStyle='#EF4444'; c.textAlign='center'; c.textBaseline='top'; c.fillText('F',cx+f,cy+6);
    c.strokeStyle='rgba(239,68,68,.25)'; c.lineWidth=1; c.setLineDash([4,4]);
    c.beginPath(); c.moveTo(cx+f,cy-h*0.44); c.lineTo(cx+f,cy+h*0.28); c.stroke(); c.setLineDash([]);

    // عدسة
    const lH=h*0.5, lW=13;
    c.fillStyle=dm?'rgba(139,92,246,.15)':'rgba(139,92,246,.1)';
    c.strokeStyle='#8B5CF6'; c.lineWidth=3;
    c.beginPath();
    c.moveTo(cx-lW,cy-lH/2); c.quadraticCurveTo(cx+lW*1.8,cy,cx-lW,cy+lH/2);
    c.lineTo(cx+lW,cy+lH/2); c.quadraticCurveTo(cx-lW*1.8,cy,cx+lW,cy-lH/2);
    c.closePath(); c.fill(); c.stroke();
    [[1,cy-lH/2],[-1,cy+lH/2]].forEach(([d2,y])=>{
      c.fillStyle='#8B5CF6';
      c.beginPath(); c.moveTo(cx,y); c.lineTo(cx-9*d2,y+16*d2); c.lineTo(cx+9*d2,y+16*d2); c.closePath(); c.fill();
    });

    // الجسم
    c.strokeStyle='#F59E0B'; c.lineWidth=3;
    c.beginPath(); c.moveTo(ox,cy); c.lineTo(ox,cy-oh); c.stroke();
    c.fillStyle='#F59E0B';
    c.beginPath(); c.moveTo(ox,cy-oh); c.lineTo(ox-5,cy-oh+10); c.lineTo(ox+5,cy-oh+10); c.closePath(); c.fill();
    c.font='bold 12px Tajawal'; c.fillStyle=dm?'#FCD34D':'#92400E'; c.textAlign='center'; c.textBaseline='bottom';
    c.fillText('O',ox,cy-oh-4);

    // الشعاع 1 (مواز → عبر F → يتباعد بعد العدسة)
    if(S.step>=1){
      const a=S.step===1?(0.55+Math.sin(S.t*4)*0.45):1; c.globalAlpha=a;
      c.strokeStyle='#EF4444'; c.lineWidth=2.5;
      c.beginPath(); c.moveTo(ox,cy-oh); c.lineTo(cx,cy-oh); c.stroke();
      // بعد العدسة: باتجاه F ثم يتباعد
      const extX2=cx+f*2.8, extY2=cy+oh*(f*2.8/f);
      c.beginPath(); c.moveTo(cx,cy-oh); c.lineTo(Math.min(extX2,w),Math.min(extY2,h)); c.stroke();
      c.globalAlpha=1;
      c.font='11px Tajawal'; c.fillStyle='#EF4444'; c.textAlign='right'; c.textBaseline='bottom';
      c.fillText('شعاع ①',cx-4,cy-oh-4);
    }
    // الشعاع 2 (مركز العدسة → مستقيم)
    if(S.step>=2){
      const a=S.step===2?(0.55+Math.sin(S.t*4)*0.45):1; c.globalAlpha=a;
      c.strokeStyle='#10B981'; c.lineWidth=2.5;
      // من رأس الجسم عبر مركز العدسة O ومستمر
      const slope2=(cy-oh-cy)/(ox-cx);
      const extX3=cx+f*2.5, extY3=cy-oh+slope2*(extX3-ox)*(-1);
      c.beginPath(); c.moveTo(ox,cy-oh); c.lineTo(Math.min(extX3,w),extY3); c.stroke();
      c.globalAlpha=1;
      c.font='11px Tajawal'; c.fillStyle='#10B981'; c.textAlign='left'; c.textBaseline='middle';
      c.fillText('شعاع ②',cx+8,cy-oh*0.4);
    }
    // امتداد للخلف (خط متقطع)
    if(S.step>=3){
      const a=S.step===3?(0.55+Math.sin(S.t*4)*0.45):1; c.globalAlpha=a;
      c.setLineDash([7,5]);
      c.strokeStyle='rgba(239,68,68,.6)'; c.lineWidth=2;
      c.beginPath(); c.moveTo(cx,cy-oh); c.lineTo(virtX,cy-ih); c.stroke();
      c.strokeStyle='rgba(16,185,129,.6)';
      c.beginPath(); c.moveTo(cx,cy-oh); c.lineTo(virtX,cy-ih); c.stroke();
      c.setLineDash([]); c.globalAlpha=1;
      // نقطة التقاطع الوهمية
      const r=6+Math.sin(S.t*5)*2;
      c.fillStyle='#8B5CF6'; c.beginPath(); c.arc(virtX,cy-ih,r,0,Math.PI*2); c.fill();
      c.font='bold 12px Tajawal'; c.fillStyle='#8B5CF6'; c.textAlign='right'; c.textBaseline='middle';
      c.fillText('I ',virtX,cy-ih);
    }
    // الصورة التقديرية كاملة + بطاقة
    if(S.step>=4){
      c.setLineDash([6,4]);
      c.strokeStyle='#8B5CF6'; c.lineWidth=3;
      c.beginPath(); c.moveTo(virtX,cy); c.lineTo(virtX,cy-ih); c.stroke(); c.setLineDash([]);
      c.fillStyle='rgba(139,92,246,.18)';
      c.beginPath(); c.rect(virtX-8,cy-ih,16,ih); c.fill();
      c.fillStyle='#8B5CF6';
      c.beginPath(); c.moveTo(virtX,cy-ih); c.lineTo(virtX-6,cy-ih+12); c.lineTo(virtX+6,cy-ih+12); c.closePath(); c.fill();
      c.font='bold 12px Tajawal'; c.fillStyle='#8B5CF6'; c.textAlign='center'; c.textBaseline='bottom';
      c.fillText('الصورة التقديرية',virtX,cy-ih-4);
      const bx=w*0.54, by=h*0.05, bw=w*0.44, bH=82;
      c.fillStyle=dm?'rgba(139,92,246,.15)':'rgba(139,92,246,.09)';
      c.strokeStyle='rgba(139,92,246,.45)'; c.lineWidth=1.5;
      c.beginPath(); c.roundRect(bx,by,bw,bH,10); c.fill(); c.stroke();
      c.font='bold 15px Tajawal'; c.fillStyle='#8B5CF6'; c.textAlign='center'; c.textBaseline='top';
      c.fillText('✅ خصائص الصورة',bx+bw/2,by+8);
      c.font='13px Tajawal'; c.fillStyle=dm?'#C4B5FD':'#5B21B6';
      c.fillText('تقديرية  |  معتدلة  |  مكبَّرة',bx+bw/2,by+30);
      c.fillText('التكبير = '+mag.toFixed(1)+'×  |  نفس جهة الجسم',bx+bw/2,by+52);
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════════════════
// الوحدة ١٤ · TAB 1: أنواع العدسات — محدّبة ومقعرة
// ══════════════════════════════════════════════════════════════════════
function simG9Lens1(){
  cancelAnimationFrame(animFrame);
  simState={type:'convex',t:0};
  const S=simState;
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔬 نوع العدسة</div>
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn action" id="lb-cx" onclick="window._lensType('convex')">محدّبة (مجمِّعة) 🔭</button>
        <button class="ctrl-btn" id="lb-cc" onclick="window._lensType('concave')">مقعرة (مفرِّقة) 🔻</button>
      </div>
    </div>
    <div class="info-box" style="font-size:12px;margin-top:6px;line-height:1.85">
      <strong>العدسة المحدّبة (Converging lens):</strong><br>
      تجمع الأشعة المتوازية عند <strong>البؤرة F</strong> على المحور.<br><br>
      <strong>العدسة المقعرة (Diverging lens):</strong><br>
      تفرّق الأشعة وكأنها صادرة من بؤرة تقديرية خلف العدسة.
    </div>
    <div class="q-box" style="margin-top:8px;font-size:12px">
      🧠 في أيّ نوع من العدسات تتكوّن صورة حقيقية على شاشة؟
    </div>
  `);
  window._lensType=function(t){
    S.type=t;
    document.getElementById('lb-cx').classList.toggle('action',t==='convex');
    document.getElementById('lb-cc').classList.toggle('action',t==='concave');
  };
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9lens'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    S.t+=0.022;
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,dm=isDarkMode();
    c.clearRect(0,0,w,h);
    c.fillStyle=dm?'#0E1620':'#F5F8FF'; c.fillRect(0,0,w,h);
    c.fillStyle=dm?'rgba(255,255,255,.04)':'rgba(0,0,0,.04)';
    for(let gx=30;gx<w;gx+=32) for(let gy=30;gy<h;gy+=32){c.beginPath();c.arc(gx,gy,1.2,0,Math.PI*2);c.fill();}

    const cx=w/2, cy=h/2, lH=h*0.52, lW=26, f=w*0.19;
    // محور
    c.strokeStyle=dm?'rgba(255,255,255,.2)':'rgba(0,0,0,.12)'; c.lineWidth=1.5; c.setLineDash([6,5]);
    c.beginPath(); c.moveTo(0,cy); c.lineTo(w,cy); c.stroke(); c.setLineDash([]);
    // عدسة
    c.fillStyle=dm?'rgba(99,179,237,.18)':'rgba(59,130,246,.12)';
    c.strokeStyle=dm?'#60A5FA':'#3B82F6'; c.lineWidth=3;
    c.beginPath();
    if(S.type==='convex'){
      c.moveTo(cx-lW,cy-lH/2); c.quadraticCurveTo(cx+lW*1.7,cy,cx-lW,cy+lH/2);
      c.lineTo(cx+lW,cy+lH/2); c.quadraticCurveTo(cx-lW*1.7,cy,cx+lW,cy-lH/2);
    }else{
      c.moveTo(cx-lW,cy-lH/2); c.quadraticCurveTo(cx-lW*0.35,cy,cx-lW,cy+lH/2);
      c.lineTo(cx+lW,cy+lH/2); c.quadraticCurveTo(cx+lW*0.35,cy,cx+lW,cy-lH/2);
    }
    c.closePath(); c.fill(); c.stroke();
    // بؤرة
    if(S.type==='convex'){
      c.fillStyle='#EF4444'; c.beginPath(); c.arc(cx+f,cy,6,0,Math.PI*2); c.fill();
      c.font='bold 14px Tajawal'; c.fillStyle='#B91C1C'; c.textAlign='center'; c.textBaseline='bottom';
      c.fillText('F',cx+f,cy-10);
    }
    // أشعة (5 أشعة متوازية من اليسار)
    const nR=5;
    for(let ri=0;ri<nR;ri++){
      const ry=cy-lH/2+lH/(nR+1)*(ri+1);
      const hitY=ry-cy;
      const alpha=0.7+Math.sin(S.t*1.8+ri)*0.18;
      c.strokeStyle=`rgba(251,191,36,${alpha})`; c.lineWidth=2.5; c.lineCap='round';
      c.beginPath(); c.moveTo(0,ry); c.lineTo(cx,ry); c.stroke();
      if(S.type==='convex'){
        // ينكسر نحو البؤرة
        const g2=c.createLinearGradient(cx,ry,cx+f,cy);
        g2.addColorStop(0,`rgba(239,68,68,${alpha})`);
        g2.addColorStop(1,`rgba(16,185,129,${alpha})`);
        c.strokeStyle=g2; c.beginPath(); c.moveTo(cx,ry); c.lineTo(cx+f,cy); c.stroke();
        if(Math.abs(hitY)>3){
          const extX=w, extY=cy+(cy-ry)*(w-cx-f)/f;
          c.strokeStyle=`rgba(16,185,129,${alpha*0.45})`; c.setLineDash([5,4]);
          c.beginPath(); c.moveTo(cx+f,cy); c.lineTo(Math.min(extX,w),Math.max(0,Math.min(h,extY))); c.stroke(); c.setLineDash([]);
        }
      }else{
        // تتباعد
        const slope=(ry-cy)/(cx-(cx-f));
        const extX=w, extY=ry+slope*(extX-cx);
        c.strokeStyle=`rgba(239,68,68,${alpha})`; c.lineWidth=2.5;
        c.beginPath(); c.moveTo(cx,ry); c.lineTo(Math.min(extX,w),Math.max(0,Math.min(h,extY))); c.stroke();
        c.strokeStyle=`rgba(239,68,68,${alpha*0.3})`; c.setLineDash([4,4]);
        c.beginPath(); c.moveTo(cx,ry); c.lineTo(cx-f,cy); c.stroke(); c.setLineDash([]);
      }
    }
    c.fillStyle=dm?'#E8F4FF':'#1A2A3A'; c.font='bold 17px Tajawal'; c.textAlign='center'; c.textBaseline='top';
    c.fillText(S.type==='convex'?'عدسة محدّبة — تجمع الأشعة عند البؤرة F':'عدسة مقعرة — تفرّق الأشعة',w/2,14);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════════════════
// الوحدة ١٤ · TAB 2: تكوّن الصورة — حرّك الجسم وشاهد التغيير
// ══════════════════════════════════════════════════════════════════════
function simG9Lens2(){
  cancelAnimationFrame(animFrame);
  const F=72;
  simState={d:190,f:F,t:0};
  const S=simState;
  window._lensSetD=function(v){S.d=Math.max(5,+v); var e=document.getElementById('ld-d'); if(e) e.textContent=S.d;};
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📏 بعد الجسم (d): <span id="ld-d">190</span> px  |  f = ${F} px</div>
      <input type="range" min="10" max="280" value="190" oninput="window._lensSetD(this.value)" style="width:100%">
      <div class="ctrl-btns-grid" style="margin-top:6px">
        <button class="ctrl-btn" onclick="window._lensSetD(40)">d &lt; f</button>
        <button class="ctrl-btn" onclick="window._lensSetD(${F*2})">d = 2f</button>
        <button class="ctrl-btn action" onclick="window._lensSetD(190)">d &gt; 2f</button>
        <button class="ctrl-btn" onclick="window._lensSetD(260)">d ≫ 2f</button>
      </div>
    </div>
    <div id="ld-info" class="info-box" style="font-size:13px;line-height:1.8;margin-top:6px">حرّك الشريط لترى تأثير بعد الجسم على الصورة</div>
    <div class="q-box" style="margin-top:8px;font-size:12px">
      📌 قانون العدسة: <strong>1/f = 1/d_o + 1/d_i</strong><br>
      f = ${F} px (ثابت)
    </div>
  `);
  const cv=document.getElementById('simCanvas');
  function imgType(d,f){
    if(d<=f) return {label:'تقديرية',desc:'معتدلة · مكبَّرة · أبعد من الجسم',col:'#8B5CF6',real:false};
    if(Math.abs(d-2*f)<5) return {label:'حقيقية',desc:'مقلوبة · بنفس الحجم · عند 2f',col:'#0891B2',real:true};
    if(d<2*f) return {label:'حقيقية',desc:'مقلوبة · مكبَّرة · أبعد من 2f',col:'#059669',real:true};
    return {label:'حقيقية',desc:'مقلوبة · مصغَّرة · بين f و 2f',col:'#D97706',real:true};
  }
  function draw(){
    if(currentSim!=='g9lens'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    S.t+=0.015;
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,dm=isDarkMode();
    c.clearRect(0,0,w,h);
    c.fillStyle=dm?'#0E1620':'#F5F8FF'; c.fillRect(0,0,w,h);
    const sc=Math.min(w,h)/520;
    const cx=w*0.52, cy=h*0.58, f=S.f*sc, dox=S.d*sc;
    const di=(f*dox)/(dox-f);
    const info=imgType(S.d,S.f);
    // محور
    c.strokeStyle=dm?'rgba(255,255,255,.2)':'rgba(0,0,0,.12)'; c.lineWidth=1.5; c.setLineDash([6,5]);
    c.beginPath(); c.moveTo(0,cy); c.lineTo(w,cy); c.stroke(); c.setLineDash([]);
    // عدسة
    const lH=h*0.48, lW=13*sc;
    c.fillStyle=dm?'rgba(99,179,237,.18)':'rgba(59,130,246,.11)';
    c.strokeStyle='#3B82F6'; c.lineWidth=3;
    c.beginPath();
    c.moveTo(cx-lW,cy-lH/2); c.quadraticCurveTo(cx+lW*1.9,cy,cx-lW,cy+lH/2);
    c.lineTo(cx+lW,cy+lH/2); c.quadraticCurveTo(cx-lW*1.9,cy,cx+lW,cy-lH/2);
    c.closePath(); c.fill(); c.stroke();
    // بؤرتان + 2f
    [-f,f].forEach((fx,i)=>{
      c.fillStyle='#EF4444'; c.beginPath(); c.arc(cx+fx,cy,5,0,Math.PI*2); c.fill();
      c.font='bold 12px Tajawal'; c.fillStyle='#B91C1C'; c.textAlign='center'; c.textBaseline='bottom';
      c.fillText('F',cx+fx,cy-7);
    });
    c.fillStyle=dm?'rgba(255,255,255,.3)':'rgba(0,0,0,.2)'; c.font='11px Tajawal'; c.textBaseline='top';
    c.fillText('2f',cx-2*f,cy+13); c.fillText('2f',cx+2*f,cy+13);
    // جسم
    const oh=55*sc, ox=cx-dox;
    c.strokeStyle='#F59E0B'; c.lineWidth=3;
    c.beginPath(); c.moveTo(ox,cy); c.lineTo(ox,cy-oh); c.stroke();
    c.fillStyle='#F59E0B';
    c.beginPath(); c.moveTo(ox,cy-oh); c.lineTo(ox-6,cy-oh+11); c.lineTo(ox+6,cy-oh+11); c.closePath(); c.fill();
    c.font='bold 12px Tajawal'; c.fillStyle='#B45309'; c.textAlign='center'; c.textBaseline='bottom';
    c.fillText('الجسم',ox,cy-oh-3);
    // صورة
    if(isFinite(di)&&Math.abs(di)<w*0.8){
      const ix=cx+di;
      const ih=info.real?oh*(di/dox)*(-1):(oh*1.35);
      const imgY=info.real?cy+ih:cy-ih;
      if(info.real){
        c.strokeStyle=info.col; c.lineWidth=3;
        c.beginPath(); c.moveTo(ix,cy); c.lineTo(ix,imgY); c.stroke();
        c.fillStyle=info.col;
        c.beginPath(); c.moveTo(ix,imgY); c.lineTo(ix-6,imgY+12); c.lineTo(ix+6,imgY+12); c.closePath(); c.fill();
      }else{
        c.setLineDash([5,4]); c.strokeStyle=info.col; c.lineWidth=2.5;
        c.beginPath(); c.moveTo(ix,cy); c.lineTo(ix,imgY); c.stroke(); c.setLineDash([]);
        c.fillStyle=info.col+'90';
        c.beginPath(); c.rect(ix-7,cy-ih,14,ih); c.fill();
        c.fillStyle=info.col;
        c.beginPath(); c.moveTo(ix,imgY); c.lineTo(ix-6,imgY-11); c.lineTo(ix+6,imgY-11); c.closePath(); c.fill();
      }
      c.font='bold 12px Tajawal'; c.fillStyle=info.col; c.textAlign='center'; c.textBaseline='top';
      c.fillText('الصورة',ix,cy+8);
    }
    // شريط الحالة
    const sbH=58,sbY=h-sbH-8;
    c.fillStyle=dm?'rgba(14,22,34,.94)':'rgba(255,255,255,.95)';
    c.beginPath(); c.roundRect(10,sbY,w-20,sbH,11); c.fill();
    c.strokeStyle=info.real?'rgba(39,174,96,.3)':'rgba(139,92,246,.3)'; c.lineWidth=1.5;
    c.beginPath(); c.roundRect(10,sbY,w-20,sbH,11); c.stroke();
    c.font='bold 16px Tajawal'; c.fillStyle=info.col; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('صورة '+info.label+' — '+info.desc,w/2,sbY+sbH/2-9);
    c.font='12px Tajawal'; c.fillStyle=dm?'#8AA8C0':'#666';
    c.fillText('d_o = '+S.d+' px  |  f = '+S.f+' px  |  d_i = '+(isFinite(di)?Math.round(di)+'px':'∞'),w/2,sbY+sbH/2+11);
    const el=document.getElementById('ld-info');
    if(el) el.innerHTML='<strong style="color:'+info.col+'">صورة '+info.label+'</strong> — '+info.desc;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════════════════
// الوحدة ١٤ · TAB 3: نشاط ١-١٤ — مخطط الأشعة خطوة بخطوة (d > 2f)
// ══════════════════════════════════════════════════════════════════════
function simG9Lens3(){
  cancelAnimationFrame(animFrame);
  simState={step:0,d:2.5,f:1,t:0};
  const S=simState;
  const steps=[
    'الخطوة ١: حدّد موقع البؤرة F وارسم الجسم O (d > 2f)',
    'الخطوة ٢: الشعاع ①  — مواز للمحور → ينكسر عبر F الأمامية',
    'الخطوة ٣: الشعاع ②  — يمرّ بمركز العدسة O بلا انحراف',
    'الخطوة ٤: نقطة التقاطع = رأس الصورة (I) — ارسم الصورة للأسفل',
    'الخطوة ٥: الصورة حقيقية · مقلوبة · مصغَّرة (تقع بين f و 2f)'
  ];
  window._ls3Step=function(n){
    S.step=Math.max(0,Math.min(4,n));
    const el=document.getElementById('ls3-info'); if(el) el.textContent=steps[S.step];
    const sn=document.getElementById('ls3-sn'); if(sn) sn.textContent=(S.step+1)+'/5';
  };
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📐 نشاط ١-١٤ · ارسم مخطط الأشعة (d > 2f)</div>
      <div style="font-size:12px;color:var(--text-secondary);line-height:1.7">اتبع الخطوات الخمس لتحديد موقع الصورة الحقيقية وفق الكتاب.</div>
    </div>
    <div id="ls3-info" style="background:rgba(59,130,246,.1);border:1.5px solid rgba(59,130,246,.3);border-radius:10px;padding:10px;font-size:13px;font-family:Tajawal;line-height:1.6;min-height:52px">${steps[0]}</div>
    <div style="display:flex;align-items:center;gap:8px;margin-top:10px">
      <button onclick="window._ls3Step(S.step-1)" style="padding:7px 12px;border-radius:8px;border:2px solid var(--border-color);background:var(--surface);font-family:Tajawal;cursor:pointer">← السابق</button>
      <span id="ls3-sn" style="flex:1;text-align:center;font-family:Tajawal;color:var(--text-secondary);font-size:13px">1/5</span>
      <button onclick="window._ls3Step(simState.step+1)" style="padding:7px 16px;border-radius:8px;border:none;background:#3B82F6;color:white;font-family:Tajawal;font-size:14px;cursor:pointer;font-weight:700">التالي →</button>
    </div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9lens'||currentTab!==2){cancelAnimationFrame(animFrame);return;}
    S.t+=0.016;
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,dm=isDarkMode();
    c.clearRect(0,0,w,h);
    c.fillStyle=dm?'#070D18':'#EEF3FF'; c.fillRect(0,0,w,h);
    c.strokeStyle=dm?'rgba(255,255,255,.04)':'rgba(0,0,180,.04)'; c.lineWidth=1;
    for(let gx=0;gx<w;gx+=28){c.beginPath();c.moveTo(gx,0);c.lineTo(gx,h);c.stroke();}
    for(let gy=0;gy<h;gy+=28){c.beginPath();c.moveTo(0,gy);c.lineTo(w,gy);c.stroke();}

    const cx=w*0.48, cy=h*0.55, f=w*0.135;
    const dox=f*S.d, oh=h*0.22;
    const di=(f*dox)/(dox-f), ih=oh*(di/dox);
    const ox=cx-dox, ix=cx+di, iy=cy+ih;

    // محور
    c.strokeStyle=dm?'rgba(200,220,255,.35)':'rgba(30,58,138,.25)'; c.lineWidth=1.5; c.setLineDash([8,6]);
    c.beginPath(); c.moveTo(0,cy); c.lineTo(w,cy); c.stroke(); c.setLineDash([]);
    // F و 2F
    [cx-f,cx+f,cx-2*f,cx+2*f].forEach((px,i)=>{
      c.strokeStyle=i<2?'rgba(239,68,68,.3)':'rgba(100,130,200,.2)'; c.lineWidth=1; c.setLineDash([4,4]);
      c.beginPath(); c.moveTo(px,cy-h*0.44); c.lineTo(px,cy+h*0.3); c.stroke(); c.setLineDash([]);
      c.fillStyle=i<2?'#EF4444':(dm?'rgba(200,200,255,.55)':'rgba(80,100,180,.6)');
      c.font='bold 12px Tajawal'; c.textAlign='center'; c.textBaseline='top';
      c.fillText(i<2?'F':'2f',px,cy+6);
      if(i<2){c.fillStyle='#EF4444';c.beginPath();c.arc(px,cy,5,0,Math.PI*2);c.fill();}
    });
    // عدسة
    const lH=h*0.5, lW=12;
    c.fillStyle=dm?'rgba(99,179,237,.14)':'rgba(59,130,246,.09)';
    c.strokeStyle='#3B82F6'; c.lineWidth=3;
    c.beginPath();
    c.moveTo(cx-lW,cy-lH/2); c.quadraticCurveTo(cx+lW*1.8,cy,cx-lW,cy+lH/2);
    c.lineTo(cx+lW,cy+lH/2); c.quadraticCurveTo(cx-lW*1.8,cy,cx+lW,cy-lH/2);
    c.closePath(); c.fill(); c.stroke();
    [[1,cy-lH/2],[-1,cy+lH/2]].forEach(([d2,y])=>{
      c.fillStyle='#3B82F6';
      c.beginPath(); c.moveTo(cx,y); c.lineTo(cx-9*d2,y+16*d2); c.lineTo(cx+9*d2,y+16*d2); c.closePath(); c.fill();
    });
    // جسم (دائماً ظاهر من الخطوة 0)
    c.strokeStyle='#F59E0B'; c.lineWidth=3;
    c.beginPath(); c.moveTo(ox,cy); c.lineTo(ox,cy-oh); c.stroke();
    c.fillStyle='#F59E0B';
    c.beginPath(); c.moveTo(ox,cy-oh); c.lineTo(ox-6,cy-oh+12); c.lineTo(ox+6,cy-oh+12); c.closePath(); c.fill();
    c.font='bold 13px Tajawal'; c.fillStyle=dm?'#FCD34D':'#92400E'; c.textAlign='center'; c.textBaseline='bottom';
    c.fillText('O',ox,cy-oh-4);
    // شعاع 1
    if(S.step>=1){
      const a=S.step===1?(0.5+Math.sin(S.t*4)*0.5):1; c.globalAlpha=a;
      c.strokeStyle='#EF4444'; c.lineWidth=2.5;
      c.beginPath(); c.moveTo(ox,cy-oh); c.lineTo(cx,cy-oh); c.stroke();
      c.beginPath(); c.moveTo(cx,cy-oh); c.lineTo(ix,iy); c.stroke();
      const ang=Math.atan2(iy-(cy-oh),ix-cx);
      c.fillStyle='#EF4444';
      c.beginPath(); c.moveTo(ix,iy); c.lineTo(ix-10*Math.cos(ang-0.3),iy-10*Math.sin(ang-0.3)); c.lineTo(ix-10*Math.cos(ang+0.3),iy-10*Math.sin(ang+0.3)); c.closePath(); c.fill();
      c.globalAlpha=1;
      c.font='11px Tajawal'; c.fillStyle='#EF4444'; c.textAlign='right'; c.textBaseline='bottom';
      c.fillText('①',cx-4,cy-oh-4);
    }
    // شعاع 2
    if(S.step>=2){
      const a=S.step===2?(0.5+Math.sin(S.t*4)*0.5):1; c.globalAlpha=a;
      c.strokeStyle='#10B981'; c.lineWidth=2.5;
      c.beginPath(); c.moveTo(ox,cy-oh); c.lineTo(ix,iy); c.stroke();
      const ang2=Math.atan2(iy-(cy-oh),ix-ox);
      c.fillStyle='#10B981';
      c.beginPath(); c.moveTo(ix,iy); c.lineTo(ix-10*Math.cos(ang2-0.3),iy-10*Math.sin(ang2-0.3)); c.lineTo(ix-10*Math.cos(ang2+0.3),iy-10*Math.sin(ang2+0.3)); c.closePath(); c.fill();
      c.globalAlpha=1;
      c.font='11px Tajawal'; c.fillStyle='#10B981'; c.textAlign='left'; c.textBaseline='middle';
      c.fillText('②',cx+8,cy-oh*0.28);
    }
    // نقطة تقاطع I
    if(S.step>=3){
      const r=6+Math.sin(S.t*5)*2;
      c.fillStyle='#7C3AED'; c.beginPath(); c.arc(ix,iy,r,0,Math.PI*2); c.fill();
      c.strokeStyle='white'; c.lineWidth=2; c.stroke();
      c.font='bold 12px Tajawal'; c.fillStyle='#7C3AED'; c.textAlign='left'; c.textBaseline='middle';
      c.fillText(' I',ix,iy);
    }
    // الصورة كاملة + بطاقة
    if(S.step>=4){
      c.strokeStyle='#7C3AED'; c.lineWidth=3;
      c.beginPath(); c.moveTo(ix,cy); c.lineTo(ix,iy); c.stroke();
      c.fillStyle='#7C3AED';
      c.beginPath(); c.moveTo(ix,iy); c.lineTo(ix-6,iy-12); c.lineTo(ix+6,iy-12); c.closePath(); c.fill();
      const bx=w*0.03, by=h*0.05, bw=w*0.4, bH=82;
      c.fillStyle=dm?'rgba(124,58,237,.15)':'rgba(124,58,237,.09)';
      c.strokeStyle='rgba(124,58,237,.45)'; c.lineWidth=1.5;
      c.beginPath(); c.roundRect(bx,by,bw,bH,10); c.fill(); c.stroke();
      c.font='bold 15px Tajawal'; c.fillStyle='#7C3AED'; c.textAlign='center'; c.textBaseline='top';
      c.fillText('✅ خصائص الصورة',bx+bw/2,by+8);
      c.font='13px Tajawal'; c.fillStyle=dm?'#C4B5FD':'#5B21B6';
      c.fillText('حقيقية  |  مقلوبة  |  مصغَّرة',bx+bw/2,by+30);
      c.fillText('تقع بين F و 2F',bx+bw/2,by+52);
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════════════════
// الوحدة ١٤ · TAB 4: العدسة المكبِّرة — الجسم داخل البؤرة (d < f)
// ══════════════════════════════════════════════════════════════════════
function simG9Lens4(){
  cancelAnimationFrame(animFrame);
  const fPx=65;
  simState={d:38,f:fPx,t:0};
  const S=simState;
  window._magSetD=function(v){S.d=Math.min(+v,S.f-3); var e=document.getElementById('mg-d'); if(e) e.textContent=S.d;};
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔍 العدسة المكبِّرة — الجسم داخل البؤرة</div>
      <div style="background:rgba(139,92,246,.1);border:1.5px solid rgba(139,92,246,.3);border-radius:10px;padding:10px;font-size:12px;color:var(--text-secondary);line-height:1.75">
        الجسم <strong>بين العدسة والبؤرة</strong> → صورة <strong>تقديرية مكبَّرة معتدلة</strong> على الجانب ذاته من الجسم.<br>
        هذا هو مبدأ <strong>العدسة المكبِّرة والمجهر البسيط</strong>.
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">📏 بعد الجسم: <span id="mg-d">38</span> px  (f = ${fPx}px)</div>
      <input type="range" min="5" max="${fPx-3}" value="38" oninput="window._magSetD(this.value)" style="width:100%">
    </div>
    <div id="mg-info" class="info-box" style="font-size:12px;line-height:1.8;margin-top:6px">التكبير يزداد كلما اقترب الجسم من البؤرة</div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9lens'||currentTab!==3){cancelAnimationFrame(animFrame);return;}
    S.t+=0.015;
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,dm=isDarkMode();
    c.clearRect(0,0,w,h);
    c.fillStyle=dm?'#0E1620':'#F5F8FF'; c.fillRect(0,0,w,h);
    const sc=Math.min(w,h)/460;
    const cx=w*0.5, cy=h*0.56, f=S.f*sc, dox=S.d*sc;
    const di=(f*dox)/(dox-f); // سالب
    const mag=Math.abs(di/dox);
    const oh=48*sc, ih=oh*mag;
    const ox=cx-dox, virtX=cx+di;

    // محور
    c.strokeStyle=dm?'rgba(255,255,255,.2)':'rgba(0,0,0,.12)'; c.lineWidth=1.5; c.setLineDash([6,5]);
    c.beginPath(); c.moveTo(0,cy); c.lineTo(w,cy); c.stroke(); c.setLineDash([]);
    // بؤرة
    c.fillStyle='#EF4444'; c.beginPath(); c.arc(cx+f,cy,5,0,Math.PI*2); c.fill();
    c.font='bold 13px Tajawal'; c.fillStyle='#B91C1C'; c.textAlign='center'; c.textBaseline='bottom'; c.fillText('F',cx+f,cy-8);
    c.strokeStyle='rgba(239,68,68,.25)'; c.lineWidth=1; c.setLineDash([4,4]);
    c.beginPath(); c.moveTo(cx+f,cy-h*0.44); c.lineTo(cx+f,cy+h*0.28); c.stroke(); c.setLineDash([]);
    // عدسة
    const lH=h*0.5, lW=13*sc;
    c.fillStyle=dm?'rgba(139,92,246,.15)':'rgba(139,92,246,.09)';
    c.strokeStyle='#8B5CF6'; c.lineWidth=3;
    c.beginPath();
    c.moveTo(cx-lW,cy-lH/2); c.quadraticCurveTo(cx+lW*1.9,cy,cx-lW,cy+lH/2);
    c.lineTo(cx+lW,cy+lH/2); c.quadraticCurveTo(cx-lW*1.9,cy,cx+lW,cy-lH/2);
    c.closePath(); c.fill(); c.stroke();
    // جسم
    c.strokeStyle='#F59E0B'; c.lineWidth=3;
    c.beginPath(); c.moveTo(ox,cy); c.lineTo(ox,cy-oh); c.stroke();
    c.fillStyle='#F59E0B';
    c.beginPath(); c.moveTo(ox,cy-oh); c.lineTo(ox-5,cy-oh+10); c.lineTo(ox+5,cy-oh+10); c.closePath(); c.fill();
    c.font='bold 12px Tajawal'; c.fillStyle='#B45309'; c.textAlign='center'; c.textBaseline='bottom';
    c.fillText('الجسم',ox,cy-oh-3);
    // شعاع 1 مواز
    c.strokeStyle='rgba(239,68,68,.75)'; c.lineWidth=2.5;
    c.beginPath(); c.moveTo(ox,cy-oh); c.lineTo(cx,cy-oh); c.stroke();
    c.beginPath(); c.moveTo(cx,cy-oh); c.lineTo(cx+f*2.4,cy+oh*2.2); c.stroke();
    // شعاع 2 مركز
    const slope2=(cy-oh-cy)/(ox-cx);
    c.strokeStyle='rgba(16,185,129,.75)'; c.lineWidth=2.5;
    c.beginPath(); c.moveTo(ox,cy-oh); c.lineTo(cx+f*2.4,cy-oh*(1+(f*2.4)/(Math.abs(ox-cx)))); c.stroke();
    // امتداد وهمي للخلف
    c.setLineDash([6,5]);
    c.strokeStyle='rgba(239,68,68,.45)'; c.lineWidth=1.8;
    c.beginPath(); c.moveTo(cx,cy-oh); c.lineTo(virtX,cy-ih); c.stroke();
    c.strokeStyle='rgba(16,185,129,.45)';
    c.beginPath(); c.moveTo(cx,cy-oh); c.lineTo(virtX,cy-ih); c.stroke();
    c.setLineDash([]);
    // الصورة التقديرية
    c.setLineDash([6,4]);
    c.strokeStyle='#8B5CF6'; c.lineWidth=2.5;
    c.beginPath(); c.moveTo(virtX,cy); c.lineTo(virtX,cy-ih); c.stroke(); c.setLineDash([]);
    c.fillStyle='rgba(139,92,246,.18)';
    c.beginPath(); c.rect(virtX-8,cy-ih,16,ih); c.fill();
    c.fillStyle='#8B5CF6';
    c.beginPath(); c.moveTo(virtX,cy-ih); c.lineTo(virtX-6,cy-ih+11); c.lineTo(virtX+6,cy-ih+11); c.closePath(); c.fill();
    c.font='bold 12px Tajawal'; c.fillStyle='#8B5CF6'; c.textAlign='center'; c.textBaseline='bottom';
    c.fillText('الصورة التقديرية',virtX,cy-ih-4);
    // شريط الحالة
    const sbH=58,sbY=h-sbH-8;
    c.fillStyle=dm?'rgba(14,22,34,.94)':'rgba(255,255,255,.95)';
    c.beginPath(); c.roundRect(10,sbY,w-20,sbH,11); c.fill();
    c.strokeStyle='rgba(139,92,246,.4)'; c.lineWidth=1.5;
    c.beginPath(); c.roundRect(10,sbY,w-20,sbH,11); c.stroke();
    c.font='bold 16px Tajawal'; c.fillStyle='#7C3AED'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('صورة تقديرية · معتدلة · مكبَّرة  |  التكبير = '+mag.toFixed(1)+'×',w/2,sbY+sbH/2-9);
    c.font='12px Tajawal'; c.fillStyle=dm?'#8AA8C0':'#666';
    c.fillText('d_o = '+S.d+' px  |  f = '+S.f+' px  |  d_i = '+Math.abs(di).toFixed(0)+' px (تقديرية)',w/2,sbY+sbH/2+11);
    const el=document.getElementById('mg-info');
    if(el) el.innerHTML='<strong style="color:#7C3AED">التكبير = '+mag.toFixed(2)+'×</strong>  |  كلما قرب الجسم من F زاد التكبير';
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}


// ══════════════════════════════════════════════════════════
// الصف التاسع — فيزياء الوحدة 15: التيار وفرق الجهد والقوة الدافعة
// ══════════════════════════════════════════════════════════

// ─── نشاط ١-١٥ : التيار الكهربائي والشحنة ─── تاب 1
// ══════════════════════════════════════════════════════════
// الصف التاسع — فيزياء الوحدة 15 + 16 (خلفية فاتحة)
// ══════════════════════════════════════════════════════════

/* ── ألوان مشتركة ── */
const C15 = {
  bg:'#F8FAFC', bgAlt:'#EEF2F7', border:'#CBD5E1',
  wire:'#1E40AF', wireHL:'#3B82F6',
  bat:'#92400E', batFill:'#FEF3C7',
  bulb:'#78350F', bulbGlow:'#FCD34D',
  ammeter:'#065F46', voltmeter:'#4C1D95',
  electron:'#2563EB',
  text:'#1E293B', textSub:'#475569',
  accent:'#0369A1', accentGreen:'#047857', accentRed:'#B91C1C',
  panel:'rgba(241,245,249,0.97)', panelBorder:'#CBD5E1'
};

function dm15(){ return document.documentElement.classList.contains('dark-mode'); }
function bg15(){ return dm15()?'#0F172A':'#F8FAFC'; }
function txt15(){ return dm15()?'#E2E8F0':'#1E293B'; }
function wire15(){ return dm15()?'#60A5FA':'#1E40AF'; }
function panel15(){ return dm15()?'rgba(15,23,42,0.95)':'rgba(241,245,249,0.97)'; }
function panelTxt15(){ return dm15()?'#E2E8F0':'#1E293B'; }

/* ═══════════════════════════════════════════════
   نشاط ١-١٥ · التيار الكهربائي والشحنة — تاب 1
   ═══════════════════════════════════════════════ */
function simG9Current1(){
  cancelAnimationFrame(animFrame);
  simState={V:6, closed:true, t:0, electrons:[]};
  simState.electrons=Array.from({length:14},(_,i)=>({angle:(i/14)*Math.PI*2}));
  window._setCurrV=v=>{simState.V=+v; var e=document.getElementById('cv-V'); if(e) e.textContent=v;};
  window._toggleSwitch=()=>{simState.closed=!simState.closed; var e=document.getElementById('cv-sw'); if(e) e.textContent=simState.closed?'مغلق ✓':'مفتوح ✗';};
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔋 جهد البطارية: <span id="cv-V">6</span> V</div>
      <input type="range" min="1" max="12" value="6" oninput="window._setCurrV(this.value)" style="width:100%">
      <div class="ctrl-label" style="margin-top:10px">🔌 المفتاح: <span id="cv-sw">مغلق ✓</span></div>
      <button class="ctrl-btn action" onclick="window._toggleSwitch()" style="margin-top:6px;width:100%">تبديل المفتاح</button>
    </div>
    <div class="q-box"><strong>🔬 نلاحظ:</strong><br>زيادة الجهد → زيادة سرعة الإلكترونات → زيادة شدة التيار I.<br>عند فتح المفتاح: الدائرة مفتوحة → لا تيار → I = 0.</div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9current'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    const dark=dm15();
    c.fillStyle=bg15(); c.fillRect(0,0,w,h);

    const I=(simState.V/6);
    const cx=w*0.5, cy=h*0.5, rx=w*0.3, ry=h*0.28;

    /* ── مسار الدائرة (مستطيل مدوّر) ── */
    const L=cx-rx, R=cx+rx, T=cy-ry, B=cy+ry;
    c.strokeStyle=wire15(); c.lineWidth=4;
    c.beginPath();
    c.moveTo(L+28,T); c.lineTo(R-28,T);
    c.moveTo(R,T+28); c.lineTo(R,B-28);
    c.moveTo(R-28,B); c.lineTo(L+28,B);
    c.moveTo(L,B-28); c.lineTo(L,T+28);
    // زوايا
    c.moveTo(R-28,T); c.quadraticCurveTo(R,T,R,T+28);
    c.moveTo(R,B-28); c.quadraticCurveTo(R,B,R-28,B);
    c.moveTo(L+28,B); c.quadraticCurveTo(L,B,L,B-28);
    c.moveTo(L,T+28); c.quadraticCurveTo(L,T,L+28,T);
    c.stroke();

    /* ── بطارية (يسار) ── */
    const bx=L, by=cy;
    c.fillStyle=dark?'#1E3A5F':'#DBEAFE';
    c.beginPath(); c.roundRect(bx-26,by-44,52,88,10); c.fill();
    c.strokeStyle=dark?'#60A5FA':'#1E40AF'; c.lineWidth=1.5; c.stroke();
    // شرائح البطارية
    [[bx,by-28,16,4],[bx,by-14,11,2.5],[bx,by+2,16,4],[bx,by+16,11,2.5],[bx,by+28,16,4]].forEach(([x,y,len,lw])=>{
      c.strokeStyle=dark?'#93C5FD':'#1D4ED8'; c.lineWidth=lw;
      c.beginPath(); c.moveTo(x-len/2,y); c.lineTo(x+len/2,y); c.stroke();
    });
    c.fillStyle=dark?'#FCD34D':'#92400E'; c.font=`bold ${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText(`${simState.V}V`,bx,by+56);

    /* ── مصباح (يمين) ── */
    const lx=R, ly=cy;
    const glow=simState.closed?Math.min(1,I*0.9):0;
    if(glow>0.05){
      const gr=c.createRadialGradient(lx,ly,4,lx,ly,42);
      gr.addColorStop(0,`rgba(253,224,71,${0.85*glow})`);
      gr.addColorStop(1,'rgba(253,224,71,0)');
      c.fillStyle=gr; c.beginPath(); c.arc(lx,ly,42,0,Math.PI*2); c.fill();
    }
    c.fillStyle=dark?'#1E3A5F':'#FFF7ED';
    c.beginPath(); c.arc(lx,ly,20,0,Math.PI*2); c.fill();
    c.strokeStyle=simState.closed?`rgba(217,119,6,${0.5+0.5*glow})`:(dark?'#475569':'#94A3B8'); c.lineWidth=2.5; c.stroke();
    c.strokeStyle=dark?'#FCD34D':'#92400E'; c.lineWidth=2;
    c.beginPath(); c.moveTo(lx-12,ly-12); c.lineTo(lx+12,ly+12);
    c.moveTo(lx+12,ly-12); c.lineTo(lx-12,ly+12); c.stroke();
    // ساق المصباح
    c.strokeStyle=dark?'#64748B':'#94A3B8'; c.lineWidth=2;
    c.beginPath(); c.moveTo(lx-8,ly+18); c.lineTo(lx-8,ly+28); c.moveTo(lx+8,ly+18); c.lineTo(lx+8,ly+28); c.stroke();

    /* ── أميتر (أسفل وسط) ── */
    const ax=cx, ay=B;
    c.fillStyle=dark?'#064E3B':'#D1FAE5';
    c.beginPath(); c.arc(ax,ay,20,0,Math.PI*2); c.fill();
    c.strokeStyle=dark?'#34D399':'#047857'; c.lineWidth=2.5; c.stroke();
    c.fillStyle=dark?'#6EE7B7':'#065F46'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText('A',ax,ay+7);
    c.fillStyle=dark?'#34D399':'#047857'; c.font=`bold ${Math.round(h*0.022)}px Tajawal`;
    c.fillText(`${simState.closed?(I).toFixed(2):'0.00'} A`,ax,ay+36);

    /* ── مفتاح (أعلى وسط) ── */
    const sx=cx, sy=T;
    const swColor=simState.closed?(dark?'#4ADE80':'#15803D'):(dark?'#F87171':'#DC2626');
    c.strokeStyle=swColor; c.lineWidth=3;
    c.beginPath();
    if(simState.closed){ c.moveTo(sx-20,sy); c.lineTo(sx+20,sy); }
    else { c.moveTo(sx-20,sy); c.lineTo(sx,sy-16); }
    c.stroke();
    c.fillStyle=swColor; c.beginPath(); c.arc(sx-20,sy,4,0,Math.PI*2); c.fill();
    c.beginPath(); c.arc(sx+20,sy,4,0,Math.PI*2); c.fill();

    /* ── إلكترونات ── */
    if(simState.closed){
      simState.t+=0.016;
      const spd=I*0.016*4;
      simState.electrons.forEach(el=>{
        el.angle-=spd;
        const perim=2*(2*rx+2*ry);
        let p=((-el.angle/(Math.PI*2)*perim)%perim+perim)%perim;
        const w2=2*rx, h2=2*ry;
        let ex,ey;
        if(p<w2){ex=R-p;ey=T;}
        else if(p<w2+h2){ex=L;ey=T+(p-w2);}
        else if(p<2*w2+h2){ex=L+(p-w2-h2);ey=B;}
        else{ex=R;ey=B-(p-2*w2-h2);}
        c.beginPath(); c.arc(ex,ey,5,0,Math.PI*2);
        c.fillStyle=dark?'#60A5FA':'#1D4ED8'; c.fill();
        c.strokeStyle=dark?'rgba(147,197,253,0.8)':'rgba(29,78,216,0.4)'; c.lineWidth=1; c.stroke();
        c.fillStyle='white'; c.font=`bold 8px sans-serif`; c.textAlign='center'; c.textBaseline='middle';
        c.fillText('−',ex,ey); c.textBaseline='alphabetic';
      });
    }

    /* ── لوحة القياسات ── */
    const px=w*0.02, py=h*0.03, pw=w*0.3, ph=h*0.2;
    c.fillStyle=panel15(); c.beginPath(); c.roundRect(px,py,pw,ph,10); c.fill();
    c.strokeStyle=dark?'#334155':'#CBD5E1'; c.lineWidth=1; c.stroke();
    const lx2=px+pw-10;
    c.textAlign='right'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`;
    c.fillStyle=dark?'#FCD34D':'#92400E'; c.fillText(`V = ${simState.V} V`,lx2,py+h*0.068);
    c.fillStyle=dark?'#34D399':'#047857'; c.fillText(`I = ${simState.closed?I.toFixed(3):'0.000'} A`,lx2,py+h*0.115);
    c.fillStyle=dark?'#60A5FA':'#1E40AF'; c.fillText(`Q = ${(simState.closed?I*simState.t:0).toFixed(1)} C`,lx2,py+h*0.162);

    /* عنوان */
    c.fillStyle=txt15(); c.textAlign='center'; c.font=`bold ${Math.round(h*0.03)}px Tajawal`;
    c.fillText('نشاط ١-١٥ · التيار الكهربائي والشحنة',w/2,h*0.95);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ═══════════════════════════════════════════════
   نشاط ١-١٥ · تاب 2 — منحنى Q-t
   ═══════════════════════════════════════════════ */
function simG9Current2(){
  cancelAnimationFrame(animFrame);
  simState={V:6,t:0,running:false,history:[]};
  window._setCurrV2=v=>{simState.V=+v; var e=document.getElementById('cv2-V'); if(e) e.textContent=v;};
  window._toggleRun2=()=>{simState.running=!simState.running; if(simState.running){simState.t=0;simState.history=[];} var e=document.getElementById('cv2-run'); if(e) e.textContent=simState.running?'⏹ إيقاف':'▶ ابدأ القياس';};
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔋 جهد البطارية: <span id="cv2-V">6</span> V</div>
      <input type="range" min="1" max="12" value="6" oninput="window._setCurrV2(this.value)" style="width:100%">
      <button id="cv2-run" class="ctrl-btn action" onclick="window._toggleRun2()" style="margin-top:10px;width:100%">▶ ابدأ القياس</button>
    </div>
    <div class="q-box"><strong>📊 Q = I × t</strong><br>ميل المنحنى = شدة التيار I.<br>كلما زاد الجهد، ازداد الميل (ازداد التيار).</div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9current'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=bg15(); c.fillRect(0,0,w,h);
    const dark=dm15();
    const I=simState.V/6;
    if(simState.running){simState.t+=0.06; simState.history.push({t:simState.t,Q:I*simState.t}); if(simState.t>12)simState.running=false;}
    const ox=w*0.12,oy=h*0.84,gw=w*0.83,gh=h*0.68;
    /* شبكة */
    for(let i=0;i<=4;i++){
      const gy=oy-gh*i/4;
      c.strokeStyle=dark?'rgba(51,65,85,0.4)':'rgba(203,213,225,0.8)'; c.lineWidth=1;
      c.beginPath(); c.moveTo(ox,gy); c.lineTo(ox+gw,gy); c.stroke();
      c.fillStyle=dark?'#64748B':'#475569'; c.font=`${Math.round(h*0.022)}px Tajawal`; c.textAlign='right';
      c.fillText((I*12*i/4).toFixed(1),ox-4,gy+4);
    }
    for(let i=0;i<=4;i++){
      const gx=ox+gw*i/4;
      c.strokeStyle=dark?'rgba(51,65,85,0.4)':'rgba(203,213,225,0.8)'; c.lineWidth=1;
      c.beginPath(); c.moveTo(gx,oy); c.lineTo(gx,oy-gh); c.stroke();
      c.fillStyle=dark?'#64748B':'#475569'; c.font=`${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
      c.fillText((12*i/4).toFixed(0),gx,oy+h*0.03);
    }
    /* محاور */
    c.strokeStyle=dark?'#475569':'#94A3B8'; c.lineWidth=2;
    c.beginPath(); c.moveTo(ox,oy-gh); c.lineTo(ox,oy); c.lineTo(ox+gw,oy); c.stroke();
    c.fillStyle=dark?'#94A3B8':'#475569'; c.font=`${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText('الزمن t (ثانية)',ox+gw/2,oy+h*0.055);
    c.save(); c.translate(ox-h*0.045,oy-gh/2); c.rotate(-Math.PI/2);
    c.fillText('الشحنة Q (كولوم)',0,0); c.restore();
    /* منحنى */
    if(simState.history.length>1){
      c.strokeStyle=dark?'#3B82F6':'#1E40AF'; c.lineWidth=2.5;
      c.beginPath();
      simState.history.forEach((p,i)=>{
        const x=ox+gw*(p.t/12), y=oy-gh*(p.Q/(I*12));
        i===0?c.moveTo(x,y):c.lineTo(x,y);
      });
      c.stroke();
      const last=simState.history[simState.history.length-1];
      c.beginPath(); c.arc(ox+gw*(last.t/12),oy-gh*(last.Q/(I*12)),5,0,Math.PI*2);
      c.fillStyle=dark?'#F472B6':'#BE185D'; c.fill();
    }
    /* لوحة */
    c.fillStyle=panel15(); c.beginPath(); c.roundRect(w*0.62,h*0.04,w*0.36,h*0.18,10); c.fill();
    c.strokeStyle=dark?'#334155':'#CBD5E1'; c.lineWidth=1; c.stroke();
    c.textAlign='right'; c.font=`bold ${Math.round(h*0.027)}px Tajawal`;
    c.fillStyle=dark?'#FCD34D':'#92400E'; c.fillText(`I = ${I.toFixed(2)} A`,w*0.96,h*0.1);
    c.fillStyle=dark?'#34D399':'#047857'; c.fillText(`Q = ${(I*simState.t).toFixed(2)} C`,w*0.96,h*0.148);
    c.fillStyle=dark?'#60A5FA':'#1E40AF'; c.fillText(`t = ${simState.t.toFixed(1)} s`,w*0.96,h*0.196);
    c.fillStyle=txt15(); c.textAlign='center'; c.font=`bold ${Math.round(h*0.03)}px Tajawal`;
    c.fillText('العلاقة بين الشحنة Q والزمن t',w/2,h*0.95);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ═══════════════════════════════════════════════
   نشاط ٢-١٥ · فرق الجهد والـ e.m.f — تاب 1
   ═══════════════════════════════════════════════ */
function simG9Voltage1(){
  cancelAnimationFrame(animFrame);
  simState={emf:6,Rext:10};
  window._setEmf=v=>{simState.emf=+v; var e=document.getElementById('vg-emf'); if(e) e.textContent=(+v).toFixed(0);};
  window._setRext=v=>{simState.Rext=+v; var e=document.getElementById('vg-R'); if(e) e.textContent=(+v).toFixed(0);};
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⚡ القوة الدافعة (e.m.f): <span id="vg-emf">6</span> V</div>
      <input type="range" min="1" max="12" value="6" oninput="window._setEmf(this.value)" style="width:100%">
      <div class="ctrl-label" style="margin-top:10px">🔩 المقاومة الخارجية R: <span id="vg-R">10</span> Ω</div>
      <input type="range" min="1" max="40" value="10" oninput="window._setRext(this.value)" style="width:100%">
    </div>
    <div class="q-box"><strong>📐 القانون:</strong><br>e.m.f = p.d. (خارجي) + V (داخلي ضائع)<br>الفولتميتر يقيس p.d. بين طرفَي الحمل.</div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9voltage'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=bg15(); c.fillRect(0,0,w,h);
    const dark=dm15();
    const r_int=0.5, I=simState.emf/(r_int+simState.Rext);
    const pd=I*simState.Rext, vLost=I*r_int;

    /* ── دائرة مستطيلة ── */
    const L=w*0.1,R2=w*0.88,T=h*0.18,B=h*0.78;
    c.strokeStyle=wire15(); c.lineWidth=3.5;
    [[L+30,T,R2-30,T],[R2,T+30,R2,B-30],[R2-30,B,L+30,B],[L,B-30,L,T+30]].forEach(([x1,y1,x2,y2])=>{
      c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.stroke();
    });
    c.beginPath();
    c.moveTo(R2-30,T); c.quadraticCurveTo(R2,T,R2,T+30);
    c.moveTo(R2,B-30); c.quadraticCurveTo(R2,B,R2-30,B);
    c.moveTo(L+30,B); c.quadraticCurveTo(L,B,L,B-30);
    c.moveTo(L,T+30); c.quadraticCurveTo(L,T,L+30,T);
    c.stroke();

    /* بطارية */
    const bx=L,by=(T+B)/2;
    c.fillStyle=dark?'#1E3A5F':'#DBEAFE'; c.beginPath(); c.roundRect(bx-28,by-48,56,96,10); c.fill();
    c.strokeStyle=dark?'#60A5FA':'#1E40AF'; c.lineWidth=1.5; c.stroke();
    c.strokeStyle=dark?'#93C5FD':'#1D4ED8';
    [[bx,by-32,18,4],[bx,by-18,13,2.5],[bx,by-4,18,4],[bx,by+10,13,2.5],[bx,by+24,18,4]].forEach(([x,y,len,lw])=>{
      c.lineWidth=lw; c.beginPath(); c.moveTo(x-len/2,y); c.lineTo(x+len/2,y); c.stroke();
    });
    c.fillStyle=dark?'#FCD34D':'#92400E'; c.font=`bold ${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText('e.m.f',bx,by+58); c.fillText(`${simState.emf}V`,bx,by+74);

    /* المقاومة الخارجية */
    const rx=R2, ry=(T+B)/2;
    c.fillStyle=dark?'#1E1B4B':'#EDE9FE'; c.beginPath(); c.roundRect(rx-30,ry-26,60,52,8); c.fill();
    c.strokeStyle=dark?'#818CF8':'#4338CA'; c.lineWidth=1.5; c.stroke();
    c.strokeStyle=dark?'#818CF8':'#4338CA'; c.lineWidth=2.5;
    c.beginPath();
    for(let i=0;i<=6;i++){const zx=rx-36+i*12,zy=ry+(i%2===0?9:-9);i===0?c.moveTo(zx,zy):c.lineTo(zx,zy);}
    c.stroke();
    c.fillStyle=dark?'#A5B4FC':'#3730A3'; c.font=`bold ${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
    c.fillText(`${simState.Rext} Ω`,rx,ry+36);

    /* فولتميتر (على التوازي مع المقاومة) */
    const vmY=T-h*0.06;
    c.strokeStyle=dark?'#818CF8':'#6D28D9'; c.lineWidth=1.5; c.setLineDash([5,4]);
    c.beginPath(); c.moveTo(R2,T); c.lineTo(R2,vmY); c.moveTo(R2-w*0.1,T); c.lineTo(R2-w*0.1,vmY);
    c.moveTo(R2-w*0.1,vmY); c.lineTo(R2,vmY); c.stroke(); c.setLineDash([]);
    const vmx=R2-w*0.05, vmy=vmY;
    c.fillStyle=dark?'#1E1B4B':'#EDE9FE'; c.beginPath(); c.arc(vmx,vmy,20,0,Math.PI*2); c.fill();
    c.strokeStyle=dark?'#818CF8':'#6D28D9'; c.lineWidth=2; c.stroke();
    c.fillStyle=dark?'#A5B4FC':'#4C1D95'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText('V',vmx,vmy+7);
    c.fillStyle=dark?'#818CF8':'#4C1D95'; c.font=`bold ${Math.round(h*0.024)}px Tajawal`;
    c.fillText(`${pd.toFixed(2)} V`,vmx,vmy-28);

    /* لوحة القياسات */
    c.fillStyle=panel15(); c.beginPath(); c.roundRect(w*0.03,h*0.04,w*0.42,h*0.26,10); c.fill();
    c.strokeStyle=dark?'#334155':'#CBD5E1'; c.lineWidth=1; c.stroke();
    c.textAlign='right'; const lx3=w*0.43;
    c.font=`bold ${Math.round(h*0.027)}px Tajawal`;
    c.fillStyle=dark?'#FCD34D':'#92400E'; c.fillText(`e.m.f = ${simState.emf} V`,lx3,h*0.1);
    c.fillStyle=dark?'#34D399':'#047857'; c.fillText(`I = ${I.toFixed(3)} A`,lx3,h*0.147);
    c.fillStyle=dark?'#60A5FA':'#1E40AF'; c.fillText(`p.d = ${pd.toFixed(2)} V`,lx3,h*0.194);
    c.fillStyle=dark?'#F87171':'#B91C1C'; c.fillText(`V داخلي = ${vLost.toFixed(2)} V`,lx3,h*0.241);
    c.fillStyle=dark?'#94A3B8':'#64748B'; c.font=`${Math.round(h*0.02)}px Tajawal`;
    c.fillText(`${simState.emf} = ${pd.toFixed(2)} + ${vLost.toFixed(2)} ✓`,lx3,h*0.278);

    c.fillStyle=txt15(); c.textAlign='center'; c.font=`bold ${Math.round(h*0.03)}px Tajawal`;
    c.fillText('نشاط ٢-١٥ · فرق الجهد والقوة الدافعة الكهربائية',w/2,h*0.95);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ═══════════════════════════════════════════════
   نشاط ٢-١٥ · تاب 2 — E = Q × V
   ═══════════════════════════════════════════════ */
function simG9Voltage2(){
  cancelAnimationFrame(animFrame);
  simState={Q:10,pd:6};
  window._setQ=v=>{simState.Q=+v; var e=document.getElementById('ve-Q'); if(e) e.textContent=v;};
  window._setPD=v=>{simState.pd=+v; var e=document.getElementById('ve-pd'); if(e) e.textContent=v;};
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔋 فرق الجهد p.d: <span id="ve-pd">6</span> V</div>
      <input type="range" min="1" max="24" value="6" oninput="window._setPD(this.value)" style="width:100%">
      <div class="ctrl-label" style="margin-top:10px">🔵 الشحنة Q: <span id="ve-Q">10</span> C</div>
      <input type="range" min="1" max="50" value="10" oninput="window._setQ(this.value)" style="width:100%">
    </div>
    <div class="q-box"><strong>📐 E = Q × V</strong><br>الطاقة المنقولة = الشحنة × فرق الجهد.<br>1 فولت = 1 جول لكل كولوم.</div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9voltage'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); c.fillStyle=bg15(); c.fillRect(0,0,w,h);
    const dark=dm15();
    const E=simState.Q*simState.pd;
    const maxE=50*24, frac=Math.min(1,E/maxE);

    /* معادلة */
    c.fillStyle=panel15(); c.beginPath(); c.roundRect(w*0.05,h*0.04,w*0.9,h*0.12,10); c.fill();
    c.strokeStyle=dark?'#334155':'#CBD5E1'; c.lineWidth=1; c.stroke();
    c.fillStyle=dark?'#FCD34D':'#92400E'; c.font=`bold ${Math.round(h*0.038)}px Tajawal`; c.textAlign='center';
    c.fillText(`E = Q × V = ${simState.Q} × ${simState.pd} = ${E} J`,w/2,h*0.12);

    /* شريط الطاقة */
    const bx=w*0.15,by=h*0.22,bw=w*0.7,bh=h*0.42;
    c.fillStyle=dark?'#1E293B':'#F1F5F9'; c.beginPath(); c.roundRect(bx,by,bw,bh,12); c.fill();
    c.strokeStyle=dark?'#334155':'#CBD5E1'; c.lineWidth=1.5; c.stroke();
    const fillY=by+bh*(1-frac);
    const gr=c.createLinearGradient(0,fillY,0,by+bh);
    gr.addColorStop(0,dark?'#0284C7':'#38BDF8');
    gr.addColorStop(1,dark?'#0C4A6E':'#0369A1');
    c.fillStyle=gr; c.beginPath(); c.roundRect(bx,fillY,bw,bh*frac,frac>0.98?12:[0,0,12,12]); c.fill();
    c.fillStyle=dark?'white':'#1E293B'; c.font=`bold ${Math.round(h*0.072)}px Tajawal`; c.textAlign='center';
    c.fillText(`${E.toFixed(0)} J`,w/2,h*0.475);
    c.fillStyle=dark?'rgba(255,255,255,0.6)':'rgba(30,41,59,0.6)'; c.font=`${Math.round(h*0.028)}px Tajawal`;
    c.fillText('الطاقة المنقولة (جول)',w/2,by-12);

    /* جدول مقارنة */
    c.fillStyle=panel15(); c.beginPath(); c.roundRect(w*0.05,h*0.68,w*0.9,h*0.22,10); c.fill();
    c.strokeStyle=dark?'#334155':'#CBD5E1'; c.lineWidth=1; c.stroke();
    const rows=[
      {lbl:'فرق الجهد p.d',val:`${simState.pd} V`,col:dark?'#FCD34D':'#92400E'},
      {lbl:'الشحنة Q',val:`${simState.Q} C`,col:dark?'#60A5FA':'#1E40AF'},
      {lbl:'الطاقة E',val:`${E} J`,col:dark?'#34D399':'#047857'},
      {lbl:'1 V تكافئ',val:'1 J/C',col:dark?'#A78BFA':'#6D28D9'},
    ];
    rows.forEach((r,i)=>{
      const rx=w*(0.09+i*0.225),ry=h*0.71;
      c.fillStyle=r.col; c.font=`bold ${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
      c.fillText(r.lbl,rx+w*0.08,ry+h*0.048);
      c.fillStyle=dark?'white':'#1E293B'; c.font=`bold ${Math.round(h*0.032)}px Tajawal`;
      c.fillText(r.val,rx+w*0.08,ry+h*0.1);
    });

    c.fillStyle=txt15(); c.textAlign='center'; c.font=`bold ${Math.round(h*0.03)}px Tajawal`;
    c.fillText('E = Q × V — الطاقة والشحنة وفرق الجهد',w/2,h*0.95);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ═══════════════════════════════════════════════
   نشاط ٣-١٥ · قانون أوم — تاب 1 : منحنى I-V
   ═══════════════════════════════════════════════ */
function simG9Ohm1(){
  cancelAnimationFrame(animFrame);
  simState={V:0,R:10,pts:[],mode:'ohmic',sweeping:false};
  window._setOhmR=v=>{simState.R=+v;simState.pts=[];var e=document.getElementById('oh-R');if(e)e.textContent=v;};
  window._setOhmMode=m=>{simState.mode=m;simState.pts=[];};
  window._sweepIV=()=>{simState.pts=[];simState.sweeping=true;simState.V=0;};
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔩 المقاومة R: <span id="oh-R">10</span> Ω</div>
      <input type="range" min="2" max="40" value="10" oninput="window._setOhmR(this.value)" style="width:100%">
      <div class="ctrl-label" style="margin-top:10px">🔬 نوع المقاوم</div>
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn action" onclick="window._setOhmMode('ohmic')">مقاوم أومي</button>
        <button class="ctrl-btn" onclick="window._setOhmMode('bulb')">مصباح</button>
      </div>
      <button class="ctrl-btn" onclick="window._sweepIV()" style="margin-top:8px;width:100%">📈 ارسم المنحنى</button>
    </div>
    <div class="q-box"><strong>📐 R = V / I</strong><br>أومي: خط مستقيم، R ثابتة.<br>مصباح: منحنى، R تزداد مع الحرارة.</div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9ohm'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); c.fillStyle=bg15(); c.fillRect(0,0,w,h);
    const dark=dm15();
    if(simState.sweeping){
      simState.V+=0.3;
      const I=simState.mode==='ohmic'?simState.V/simState.R:simState.V/(simState.R*(1+simState.V*0.18));
      simState.pts.push({V:simState.V,I});
      if(simState.V>=12)simState.sweeping=false;
    }
    const Vmax=12;
    const Imax=simState.mode==='ohmic'?Vmax/simState.R:Vmax/(simState.R*1.05);
    const ox=w*0.13,oy=h*0.84,gw=w*0.82,gh=h*0.68;
    /* شبكة */
    for(let i=0;i<=5;i++){
      const gy=oy-gh*i/5;
      c.strokeStyle=dark?'rgba(71,85,105,0.4)':'rgba(203,213,225,0.8)'; c.lineWidth=1;
      c.beginPath(); c.moveTo(ox,gy); c.lineTo(ox+gw,gy); c.stroke();
      c.fillStyle=dark?'#64748B':'#475569'; c.font=`${Math.round(h*0.022)}px Tajawal`; c.textAlign='right';
      c.fillText((Imax*i/5).toFixed(3),ox-4,gy+4);
    }
    for(let i=0;i<=6;i++){
      const gx=ox+gw*i/6;
      c.strokeStyle=dark?'rgba(71,85,105,0.4)':'rgba(203,213,225,0.8)'; c.lineWidth=1;
      c.beginPath(); c.moveTo(gx,oy); c.lineTo(gx,oy-gh); c.stroke();
      c.fillStyle=dark?'#64748B':'#475569'; c.font=`${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
      c.fillText((Vmax*i/6).toFixed(0),gx,oy+h*0.028);
    }
    c.strokeStyle=dark?'#475569':'#64748B'; c.lineWidth=2;
    c.beginPath(); c.moveTo(ox,oy-gh); c.lineTo(ox,oy); c.lineTo(ox+gw,oy); c.stroke();
    c.fillStyle=dark?'#94A3B8':'#475569'; c.font=`${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText('فرق الجهد V (V)',ox+gw/2,oy+h*0.06);
    c.save(); c.translate(ox-h*0.055,oy-gh/2); c.rotate(-Math.PI/2); c.fillText('شدة التيار I (A)',0,0); c.restore();
    /* منحنى */
    if(simState.pts.length>1){
      const lineCol=simState.mode==='ohmic'?(dark?'#3B82F6':'#1E40AF'):(dark?'#F97316':'#C2410C');
      c.strokeStyle=lineCol; c.lineWidth=3;
      c.beginPath();
      simState.pts.forEach((p,i)=>{
        const x=ox+gw*(p.V/Vmax),y=oy-gh*(p.I/Imax);
        i===0?c.moveTo(x,y):c.lineTo(x,y);
      });
      c.stroke();
      const last=simState.pts[simState.pts.length-1];
      c.beginPath(); c.arc(ox+gw*(last.V/Vmax),oy-gh*(last.I/Imax),6,0,Math.PI*2);
      c.fillStyle=dark?'#F472B6':'#BE185D'; c.fill();
    }
    /* بطاقة نتائج */
    if(simState.pts.length>3){
      const last=simState.pts[simState.pts.length-1];
      const Rc=last.I>0?last.V/last.I:simState.R;
      c.fillStyle=panel15(); c.beginPath(); c.roundRect(w*0.56,h*0.04,w*0.42,h*0.22,10); c.fill();
      c.strokeStyle=dark?'#334155':'#CBD5E1'; c.lineWidth=1; c.stroke();
      c.textAlign='right'; c.font=`bold ${Math.round(h*0.027)}px Tajawal`;
      c.fillStyle=dark?'#60A5FA':'#1E40AF'; c.fillText(`V = ${last.V.toFixed(1)} V`,w*0.96,h*0.1);
      c.fillStyle=dark?'#34D399':'#047857'; c.fillText(`I = ${last.I.toFixed(4)} A`,w*0.96,h*0.148);
      c.fillStyle=dark?'#FCD34D':'#92400E'; c.fillText(`R = ${Rc.toFixed(1)} Ω`,w*0.96,h*0.196);
      c.fillStyle=dark?'#94A3B8':'#64748B'; c.font=`${Math.round(h*0.02)}px Tajawal`;
      c.fillText(simState.mode==='ohmic'?'خط مستقيم ✓ أومي':'منحنى ✓ غير أومي',w*0.96,h*0.236);
    }
    c.fillStyle=txt15(); c.textAlign='center'; c.font=`bold ${Math.round(h*0.03)}px Tajawal`;
    c.fillText('نشاط ٣-١٥ · منحنى I–V وقانون أوم',w/2,h*0.95);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ═══════════════════════════════════════════════
   نشاط ٣-١٥ · تاب 2 — مقاوم أومي vs مصباح
   ═══════════════════════════════════════════════ */
function simG9Ohm2(){
  cancelAnimationFrame(animFrame);
  simState={V:6,R:10};
  window._setOhmV2=v=>{simState.V=+v;var e=document.getElementById('oh2-V');if(e)e.textContent=v;};
  window._setOhmR2=v=>{simState.R=+v;var e=document.getElementById('oh2-R');if(e)e.textContent=v;};
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔋 فرق الجهد V: <span id="oh2-V">6</span> V</div>
      <input type="range" min="1" max="12" value="6" oninput="window._setOhmV2(this.value)" style="width:100%">
      <div class="ctrl-label" style="margin-top:10px">🔩 المقاومة الأساسية R: <span id="oh2-R">10</span> Ω</div>
      <input type="range" min="2" max="40" value="10" oninput="window._setOhmR2(this.value)" style="width:100%">
    </div>
    <div class="q-box"><strong>🔬 الفرق الجوهري:</strong><br>المقاوم الأومي: R ثابتة دائماً.<br>المصباح: R تزداد مع ارتفاع درجة الحرارة.</div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9ohm'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); c.fillStyle=bg15(); c.fillRect(0,0,w,h);
    const dark=dm15();
    const R_ohm=simState.R, R_bulb=simState.R*(1+simState.V*0.18);
    const I_ohm=simState.V/R_ohm, I_bulb=simState.V/R_bulb;

    /* رسم بطاقتين */
    const cards=[
      {label:'مقاوم أومي',R:R_ohm,I:I_ohm,note:'R ثابتة ✓',acol:dark?'#3B82F6':'#1E40AF',bg:dark?'#1E3A5F':'#DBEAFE',type:'ohmic'},
      {label:'مصباح كهربائي',R:R_bulb,I:I_bulb,note:'R تتغير مع T',acol:dark?'#F97316':'#C2410C',bg:dark?'#431407':'#FFF7ED',type:'bulb'}
    ];
    const cw=w*0.38, ch=h*0.72, gap=w*0.06;
    const startX=(w-2*cw-gap)/2;

    cards.forEach((card,i)=>{
      const bx=startX+i*(cw+gap), by=h*0.1;
      c.fillStyle=card.bg; c.beginPath(); c.roundRect(bx,by,cw,ch,14); c.fill();
      c.strokeStyle=card.acol; c.lineWidth=2.5; c.stroke();

      /* عنوان البطاقة */
      c.fillStyle=card.acol; c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
      c.fillText(card.label,bx+cw/2,by+h*0.065);

      /* رسم المكوّن */
      const mx=bx+cw/2, my=by+ch*0.38;
      if(card.type==='ohmic'){
        c.strokeStyle=card.acol; c.lineWidth=3;
        c.beginPath(); c.moveTo(mx-cw*0.38,my); c.lineTo(mx-cw*0.25,my); c.stroke();
        c.beginPath();
        for(let j=0;j<=8;j++){const zx=mx-cw*0.25+j*cw*0.06,zy=my+(j%2===0?10:-10);j===0?c.moveTo(zx,zy):c.lineTo(zx,zy);}
        c.stroke();
        c.beginPath(); c.moveTo(mx+cw*0.25,my); c.lineTo(mx+cw*0.38,my); c.stroke();
      } else {
        const glow=Math.min(1,I_bulb*2.5);
        if(glow>0.1){const gr=c.createRadialGradient(mx,my,5,mx,my,44);gr.addColorStop(0,`rgba(253,224,71,${0.8*glow})`);gr.addColorStop(1,'rgba(253,224,71,0)');c.fillStyle=gr;c.beginPath();c.arc(mx,my,44,0,Math.PI*2);c.fill();}
        c.fillStyle=card.bg; c.beginPath(); c.arc(mx,my,22,0,Math.PI*2); c.fill();
        c.strokeStyle=card.acol; c.lineWidth=2.5; c.stroke();
        c.strokeStyle=dark?'#FCD34D':'#92400E'; c.lineWidth=2;
        c.beginPath(); c.moveTo(mx-13,my-13); c.lineTo(mx+13,my+13); c.moveTo(mx+13,my-13); c.lineTo(mx-13,my+13); c.stroke();
      }

      /* قيم */
      const yBase=by+ch*0.55;
      c.textAlign='center';
      c.fillStyle=dark?'#E2E8F0':'#1E293B'; c.font=`bold ${Math.round(h*0.028)}px Tajawal`;
      c.fillText(`R = ${card.R.toFixed(1)} Ω`,bx+cw/2,yBase);
      c.fillText(`I = ${card.I.toFixed(3)} A`,bx+cw/2,yBase+h*0.06);
      /* ملاحظة */
      c.fillStyle=card.bg.includes('EDE')||card.bg.includes('FFF')?card.acol:card.acol;
      c.fillStyle=dark?card.acol+'CC':card.acol;
      c.font=`bold ${Math.round(h*0.025)}px Tajawal`;
      const noteY=by+ch-h*0.04;
      c.fillStyle=card.acol; c.beginPath(); c.roundRect(bx+cw*0.1,noteY-h*0.044,cw*0.8,h*0.052,6); c.fill();
      c.fillStyle='white'; c.font=`bold ${Math.round(h*0.023)}px Tajawal`;
      c.fillText(card.note,bx+cw/2,noteY);
    });

    /* رأس مشترك */
    c.fillStyle=panel15(); c.beginPath(); c.roundRect(w*0.05,h*0.04,w*0.9,h*0.055,8); c.fill();
    c.fillStyle=txt15(); c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText(`الجهد المضبوط: ${simState.V} V — الأومي vs المصباح`,w/2,h*0.076);

    c.fillStyle=txt15(); c.font=`bold ${Math.round(h*0.03)}px Tajawal`;
    c.fillText('نشاط ٣-١٥ · مقاوم أومي مقابل مصباح',w/2,h*0.95);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ═══════════════════════════════════════════════
   نشاط ٤-١٥ · القدرة — تاب 1
   ═══════════════════════════════════════════════ */
function simG9Power1(){
  cancelAnimationFrame(animFrame);
  simState={I:2,V:12};
  window._setPowI=v=>{simState.I=+v;var e=document.getElementById('pw-I');if(e)e.textContent=(+v).toFixed(1);};
  window._setPowV=v=>{simState.V=+v;var e=document.getElementById('pw-V');if(e)e.textContent=v;};
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⚡ شدة التيار I: <span id="pw-I">2.0</span> A</div>
      <input type="range" min="0.1" max="10" step="0.1" value="2" oninput="window._setPowI(this.value)" style="width:100%">
      <div class="ctrl-label" style="margin-top:10px">🔋 فرق الجهد V: <span id="pw-V">12</span> V</div>
      <input type="range" min="1" max="240" value="12" oninput="window._setPowV(this.value)" style="width:100%">
    </div>
    <div class="q-box"><strong>⚡ معادلات القدرة:</strong><br>P = I × V (واط)<br>P = I² × R<br>1 واط = 1 جول/ثانية</div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9power15'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); c.fillStyle=bg15(); c.fillRect(0,0,w,h);
    const dark=dm15();
    const P=simState.I*simState.V, R=simState.V/simState.I;
    const maxP=2400, frac=Math.min(1,P/maxP);

    /* مقياس نصف دائري */
    const cx=w*0.5, cy=h*0.48, rad=Math.min(w,h)*0.28;
    c.strokeStyle=dark?'#334155':'#E2E8F0'; c.lineWidth=22; c.lineCap='round';
    c.beginPath(); c.arc(cx,cy,rad,Math.PI*0.75,Math.PI*0.25,false); c.stroke();
    const col=P<500?(dark?'#34D399':'#15803D'):P<1500?(dark?'#FBBF24':'#D97706'):(dark?'#F87171':'#DC2626');
    c.strokeStyle=col; c.lineWidth=22;
    c.beginPath(); c.arc(cx,cy,rad,Math.PI*0.75,Math.PI*0.75+Math.PI*1.5*frac,false); c.stroke();
    c.lineCap='butt';
    /* قراءة */
    c.fillStyle=txt15(); c.textAlign='center';
    c.font=`bold ${Math.round(h*0.085)}px Tajawal`; c.fillText(P.toFixed(1),cx,cy+h*0.03);
    c.fillStyle=dark?'#64748B':'#94A3B8'; c.font=`${Math.round(h*0.034)}px Tajawal`;
    c.fillText('واط (W)',cx,cy+h*0.085);
    /* مؤشر */
    const angle=Math.PI*0.75+Math.PI*1.5*frac;
    c.strokeStyle=col; c.lineWidth=3;
    c.beginPath(); c.moveTo(cx,cy); c.lineTo(cx+rad*0.7*Math.cos(angle),cy+rad*0.7*Math.sin(angle)); c.stroke();

    /* معادلات */
    c.fillStyle=panel15(); c.beginPath(); c.roundRect(w*0.04,h*0.72,w*0.92,h*0.18,10); c.fill();
    c.strokeStyle=dark?'#334155':'#CBD5E1'; c.lineWidth=1; c.stroke();
    c.textAlign='center'; c.font=`bold ${Math.round(h*0.03)}px Tajawal`;
    c.fillStyle=dark?'#60A5FA':'#1E40AF';
    c.fillText(`P = I × V = ${simState.I} × ${simState.V} = ${P.toFixed(1)} W`,w/2,h*0.786);
    c.fillStyle=dark?'#34D399':'#047857';
    c.fillText(`R = V/I = ${R.toFixed(2)} Ω  →  P = I²R = ${(simState.I*simState.I*R).toFixed(1)} W`,w/2,h*0.846);

    /* قيم صغيرة */
    c.fillStyle=panel15(); c.beginPath(); c.roundRect(w*0.04,h*0.04,w*0.44,h*0.12,8); c.fill();
    c.fillStyle=dark?'#FCD34D':'#92400E'; c.font=`bold ${Math.round(h*0.027)}px Tajawal`; c.textAlign='right';
    c.fillText(`I = ${simState.I} A`,w*0.46,h*0.094);
    c.fillStyle=dark?'#60A5FA':'#1E40AF';
    c.fillText(`V = ${simState.V} V`,w*0.46,h*0.138);

    c.fillStyle=txt15(); c.textAlign='center'; c.font=`bold ${Math.round(h*0.03)}px Tajawal`;
    c.fillText('نشاط ٤-١٥ · القدرة الكهربائية P = I × V',w/2,h*0.95);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ═══════════════════════════════════════════════
   نشاط ٤-١٥ · تاب 2 — الطاقة والتكلفة
   ═══════════════════════════════════════════════ */
function simG9Power2(){
  cancelAnimationFrame(animFrame);
  simState={P:60,hrs:5};
  window._setPowP2=v=>{simState.P=+v;var e=document.getElementById('pw2-P');if(e)e.textContent=v;};
  window._setPowH=v=>{simState.hrs=+v;var e=document.getElementById('pw2-H');if(e)e.textContent=v;};
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">💡 القدرة P: <span id="pw2-P">60</span> W</div>
      <input type="range" min="10" max="3000" step="10" value="60" oninput="window._setPowP2(this.value)" style="width:100%">
      <div class="ctrl-label" style="margin-top:10px">⏱ وقت الاستخدام: <span id="pw2-H">5</span> ساعة</div>
      <input type="range" min="1" max="24" value="5" oninput="window._setPowH(this.value)" style="width:100%">
    </div>
    <div class="q-box"><strong>💰 E = P × t</strong><br>1 كيلوواط·ساعة = 3,600,000 J<br>التكلفة = kWh × سعر الوحدة</div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9power15'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); c.fillStyle=bg15(); c.fillRect(0,0,w,h);
    const dark=dm15();
    const P=simState.P, t_s=simState.hrs*3600;
    const E_J=P*t_s, E_kWh=E_J/3600000, cost=E_kWh*0.025;

    /* مقارنة الأجهزة */
    const devices=[{n:'مصباح',P:60,i:'💡'},{n:'تلفزيون',P:150,i:'📺'},{n:'مكيف',P:2000,i:'❄️'},{n:'مروحة',P:80,i:'🌀'}];
    c.fillStyle=panel15(); c.beginPath(); c.roundRect(w*0.03,h*0.03,w*0.94,h*0.3,10); c.fill();
    c.strokeStyle=dark?'#334155':'#CBD5E1'; c.lineWidth=1; c.stroke();
    c.fillStyle=dark?'#94A3B8':'#475569'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText(`مقارنة استهلاك الطاقة خلال ${simState.hrs} ساعة`,w/2,h*0.078);
    devices.forEach((d,i)=>{
      const dE=(d.P*simState.hrs*3600)/3600000;
      const bx=w*(0.07+i*0.23), by=h*0.1;
      const sel=Math.abs(d.P-P)<80;
      c.fillStyle=sel?(dark?'rgba(59,130,246,0.15)':'rgba(219,234,254,0.9)'):(dark?'rgba(30,41,59,0.5)':'rgba(248,250,252,0.9)');
      c.beginPath(); c.roundRect(bx,by,w*0.2,h*0.2,8); c.fill();
      if(sel){c.strokeStyle=dark?'#3B82F6':'#1E40AF';c.lineWidth=2;c.stroke();}
      c.fillStyle=txt15(); c.font=`${Math.round(h*0.034)}px Tajawal`; c.textAlign='center';
      c.fillText(d.i,bx+w*0.1,by+h*0.075);
      c.font=`bold ${Math.round(h*0.022)}px Tajawal`; c.fillText(d.n,bx+w*0.1,by+h*0.125);
      c.fillStyle=dark?'#60A5FA':'#1E40AF'; c.fillText(`${d.P}W`,bx+w*0.1,by+h*0.162);
      c.fillStyle=dark?'#34D399':'#047857'; c.fillText(`${dE.toFixed(3)} kWh`,bx+w*0.1,by+h*0.198);
    });

    /* نتائج */
    c.fillStyle=panel15(); c.beginPath(); c.roundRect(w*0.03,h*0.37,w*0.94,h*0.5,10); c.fill();
    c.strokeStyle=dark?'#334155':'#CBD5E1'; c.lineWidth=1; c.stroke();
    const rows2=[
      [`القدرة`,`${P} W`,dark?'#FCD34D':'#92400E'],
      [`الوقت`,`${simState.hrs} ساعة = ${t_s.toLocaleString()} ثانية`,dark?'#60A5FA':'#1E40AF'],
      [`الطاقة E = P×t`,`${(E_J/1000).toFixed(1)} كيلوجول`,dark?'#34D399':'#047857'],
      [`بالكيلوواط·ساعة`,`${E_kWh.toFixed(3)} kWh`,dark?'#A78BFA':'#6D28D9'],
      [`التكلفة (0.025 ر.ع/kWh)`,`${cost.toFixed(3)} ر.ع.`,dark?'#F87171':'#B91C1C'],
    ];
    rows2.forEach((r,i)=>{
      const ry=h*0.43+i*h*0.086;
      c.fillStyle=r[2]; c.font=`bold ${Math.round(h*0.027)}px Tajawal`; c.textAlign='right';
      c.fillText(r[0]+': '+r[1],w*0.94,ry);
    });

    c.fillStyle=txt15(); c.textAlign='center'; c.font=`bold ${Math.round(h*0.03)}px Tajawal`;
    c.fillText('نشاط ٤-١٥ · الطاقة المستهلكة والتكلفة',w/2,h*0.95);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ═══════════════════════════════════════════════
   نشاط ١-١٦ · قياس المقاومة — تاب 1
   ═══════════════════════════════════════════════ */
function simG9OhmsLaw1(){
  cancelAnimationFrame(animFrame);
  simState={V:6,R:20,animT:0};
  window._setOL_V=v=>{simState.V=+v;var e=document.getElementById('ol-V');if(e)e.textContent=v;};
  window._setOL_R=v=>{simState.R=+v;var e=document.getElementById('ol-R');if(e)e.textContent=v;};
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔋 جهد المصدر: <span id="ol-V">6</span> V</div>
      <input type="range" min="1" max="20" value="6" oninput="window._setOL_V(this.value)" style="width:100%">
      <div class="ctrl-label" style="margin-top:10px">🔩 المقاومة الحقيقية: <span id="ol-R">20</span> Ω</div>
      <input type="range" min="2" max="100" value="20" oninput="window._setOL_R(this.value)" style="width:100%">
    </div>
    <div class="q-box"><strong>🔬 كيف نقيس R؟</strong><br>• الأميتر (A) على التوالي → يقيس I<br>• الفولتميتر (V) على التوازي → يقيس V<br>• R = V ÷ I</div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9ohmslaw'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    simState.animT+=0.03;
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); c.fillStyle=bg15(); c.fillRect(0,0,w,h);
    const dark=dm15();
    const I=simState.V/simState.R, Rmeas=(simState.V/I).toFixed(1);

    /* ── حدود الدائرة — كلها داخل الكانفس ── */
    const L=w*0.18, R2=w*0.82, T=h*0.22, B=h*0.72;
    const midX=(L+R2)/2, midY=(T+B)/2;
    const cr=20; // corner radius

    /* رسم الأسلاك */
    c.strokeStyle=wire15(); c.lineWidth=3.5; c.lineJoin='round';
    c.beginPath();
    c.moveTo(L+cr,T); c.lineTo(R2-cr,T);
    c.quadraticCurveTo(R2,T,R2,T+cr);
    c.lineTo(R2,B-cr);
    c.quadraticCurveTo(R2,B,R2-cr,B);
    c.lineTo(L+cr,B);
    c.quadraticCurveTo(L,B,L,B-cr);
    c.lineTo(L,T+cr);
    c.quadraticCurveTo(L,T,L+cr,T);
    c.stroke();

    /* ── بطارية (يسار وسط) ── */
    const bx=L, by=midY;
    // جسم البطارية
    c.fillStyle=dark?'#1E3A5F':'#DBEAFE';
    c.beginPath(); c.roundRect(bx-22,by-40,44,80,8); c.fill();
    c.strokeStyle=dark?'#60A5FA':'#1E40AF'; c.lineWidth=1.5; c.stroke();
    // شرائح البطارية
    const stripes=[[by-26,14,3.5],[by-14,10,2],[by-2,14,3.5],[by+10,10,2],[by+22,14,3.5]];
    stripes.forEach(([sy,len,lw])=>{
      c.strokeStyle=dark?'#93C5FD':'#1D4ED8'; c.lineWidth=lw;
      c.beginPath(); c.moveTo(bx-len/2,sy); c.lineTo(bx+len/2,sy); c.stroke();
    });
    // قطبان + و −
    c.fillStyle=dark?'#F87171':'#DC2626'; c.font=`bold ${Math.round(h*0.022)}px Arial`; c.textAlign='center';
    c.fillText('+',bx,by-48);
    c.fillStyle=dark?'#60A5FA':'#1E40AF';
    c.fillText('−',bx,by+56);
    // قيمة الجهد
    c.fillStyle=dark?'#FCD34D':'#92400E'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`;
    c.fillText(`${simState.V}V`,bx,by+70);
    // تسمية
    c.fillStyle=dark?'#93C5FD':'#1E40AF'; c.font=`${Math.round(h*0.019)}px Tajawal`;
    c.fillText('بطارية',bx,by-60);

    /* ── مقاومة (يمين وسط) ── */
    const rx=R2, ry=midY;
    // صندوق المقاومة
    c.fillStyle=dark?'#1E1B4B':'#EDE9FE';
    c.beginPath(); c.roundRect(rx-28,ry-22,56,44,6); c.fill();
    c.strokeStyle=dark?'#818CF8':'#4338CA'; c.lineWidth=1.5; c.stroke();
    // موجة المقاومة
    c.strokeStyle=dark?'#818CF8':'#4338CA'; c.lineWidth=2.5; c.lineJoin='round';
    c.beginPath();
    const zn=6, zw=44, zh=7;
    for(let i=0;i<=zn;i++){
      const zx=rx-zw/2+i*(zw/zn), zy=ry+(i%2===0?zh:-zh);
      i===0?c.moveTo(zx,zy):c.lineTo(zx,zy);
    }
    c.stroke();
    c.fillStyle=dark?'#A5B4FC':'#3730A3'; c.font=`bold ${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
    c.fillText(`R=${simState.R}Ω`,rx,ry+34);
    c.fillStyle=dark?'#A5B4FC':'#3730A3'; c.font=`${Math.round(h*0.019)}px Tajawal`;
    c.fillText('مقاومة',rx,ry-30);

    /* ── أميتر (أسفل وسط) — داخل السلك ── */
    const ax=midX, ay=B;
    c.fillStyle=dark?'#064E3B':'#D1FAE5';
    c.beginPath(); c.arc(ax,ay,20,0,Math.PI*2); c.fill();
    c.strokeStyle=dark?'#34D399':'#047857'; c.lineWidth=2.5; c.stroke();
    c.fillStyle=dark?'#6EE7B7':'#065F46'; c.font=`bold ${Math.round(h*0.025)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('A',ax,ay); c.textBaseline='alphabetic';
    // قراءة الأميتر — تحت الدائرة داخل الكانفس
    c.fillStyle=dark?'#34D399':'#047857'; c.font=`bold ${Math.round(h*0.022)}px Tajawal`;
    c.fillText(`${I.toFixed(3)} A`,ax,ay+32);

    /* ── فولتميتر (على التوازي مع R، داخل الكانفس) ── */
    // أسلاك الفولتميتر تخرج من نقطتين على الضلع العلوي والسفلي بجانب R
    const vm_topX=R2, vm_topY=T;
    const vm_botX=R2, vm_botY=B;
    const vm_cx=R2+w*0.09;   // مركز الفولتميتر أمام R (يمين)
    const vm_cy=midY;

    c.strokeStyle=dark?'#818CF8':'#6D28D9'; c.lineWidth=1.5; c.setLineDash([5,4]);
    c.beginPath();
    // خط من نقطة أعلى R إلى الفولتميتر
    c.moveTo(vm_topX,vm_topY); c.lineTo(vm_cx,vm_topY);
    c.lineTo(vm_cx,vm_cy-20);
    // خط من نقطة أسفل R إلى الفولتميتر
    c.moveTo(vm_botX,vm_botY); c.lineTo(vm_cx,vm_botY);
    c.lineTo(vm_cx,vm_cy+20);
    c.stroke(); c.setLineDash([]);

    // دائرة الفولتميتر
    // تحقق أن vm_cx + 22 < w
    const safe_vmx = Math.min(vm_cx, w*0.93);
    c.fillStyle=dark?'#1E1B4B':'#EDE9FE';
    c.beginPath(); c.arc(safe_vmx,vm_cy,20,0,Math.PI*2); c.fill();
    c.strokeStyle=dark?'#818CF8':'#6D28D9'; c.lineWidth=2; c.stroke();
    c.fillStyle=dark?'#A5B4FC':'#4C1D95'; c.font=`bold ${Math.round(h*0.024)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('V',safe_vmx,vm_cy); c.textBaseline='alphabetic';
    // قراءة الفولتميتر
    c.fillStyle=dark?'#818CF8':'#4C1D95'; c.font=`bold ${Math.round(h*0.021)}px Tajawal`;
    c.fillText(`${simState.V.toFixed(2)} V`,safe_vmx,vm_cy-28);
    // تسمية
    c.fillStyle=dark?'#818CF8':'#6D28D9'; c.font=`${Math.round(h*0.018)}px Tajawal`;
    c.fillText('فولتميتر',safe_vmx,vm_cy+32);

    /* ── إلكترونات متحركة ── */
    const nE=7;
    for(let i=0;i<nE;i++){
      const phase=(simState.animT*I*2+i/nE)*Math.PI*2;
      const pw=R2-L, ph=B-T;
      const perim=2*(pw+ph);
      let p=((phase/(Math.PI*2))%1)*perim;
      let ex,ey;
      if(p<pw){ex=R2-p;ey=T;}
      else if(p<pw+ph){ex=L;ey=T+(p-pw);}
      else if(p<2*pw+ph){ex=L+(p-pw-ph);ey=B;}
      else{ex=R2;ey=B-(p-2*pw-ph);}
      c.beginPath(); c.arc(ex,ey,5,0,Math.PI*2);
      c.fillStyle=dark?'#60A5FA':'#2563EB'; c.fill();
      c.strokeStyle=dark?'rgba(147,197,253,0.5)':'rgba(37,99,235,0.3)'; c.lineWidth=1; c.stroke();
      // علامة −
      c.fillStyle='white'; c.font='bold 8px Arial'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('−',ex,ey); c.textBaseline='alphabetic';
    }

    /* ── لوحة القياسات (يسار أعلى) ── */
    const px=w*0.02, py=h*0.04, pW=w*0.38, pH=h*0.16;
    c.fillStyle=panel15(); c.beginPath(); c.roundRect(px,py,pW,pH,10); c.fill();
    c.strokeStyle=dark?'#334155':'#CBD5E1'; c.lineWidth=1; c.stroke();
    c.textAlign='right'; c.font=`bold ${Math.round(h*0.028)}px Tajawal`;
    c.fillStyle=dark?'#FCD34D':'#92400E';
    c.fillText(`V = ${simState.V} V`,px+pW-10,py+pH*0.38);
    c.fillStyle=dark?'#34D399':'#047857';
    c.fillText(`I = ${I.toFixed(3)} A`,px+pW-10,py+pH*0.72);

    /* ── معادلة النتيجة (أسفل) ── */
    const eqY=h*0.8, eqH=h*0.12;
    c.fillStyle=panel15(); c.beginPath(); c.roundRect(w*0.05,eqY,w*0.9,eqH,10); c.fill();
    c.strokeStyle=dark?'#334155':'#CBD5E1'; c.lineWidth=1; c.stroke();
    c.fillStyle=dark?'#3B82F6':'#1E40AF'; c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
    c.fillText(`R = V ÷ I = ${simState.V} ÷ ${I.toFixed(3)} = ${Rmeas} Ω`,w/2,eqY+eqH*0.62);

    /* عنوان */
    c.fillStyle=txt15(); c.font=`bold ${Math.round(h*0.027)}px Tajawal`; c.textAlign='center';
    c.fillText('نشاط ١-١٦ · دائرة قياس المقاومة',w/2,h*0.96);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ═══════════════════════════════════════════════
   نشاط ١-١٦ · تاب 2 — جدول التحقق من قانون أوم
   ═══════════════════════════════════════════════ */
function simG9OhmsLaw2(){
  cancelAnimationFrame(animFrame);
  simState={R:20};
  window._setOL2_R=v=>{simState.R=+v;var e=document.getElementById('ol2-R');if(e)e.textContent=v;};
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔩 المقاومة R: <span id="ol2-R">20</span> Ω</div>
      <input type="range" min="2" max="100" value="20" oninput="window._setOL2_R(this.value)" style="width:100%">
    </div>
    <div class="q-box"><strong>📋 جدول ١-١٦:</strong><br>V يزداد → I يزداد بنفس النسبة.<br>النسبة V/I = R ثابتة ← قانون أوم ✓</div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9ohmslaw'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); c.fillStyle=bg15(); c.fillRect(0,0,w,h);
    const dark=dm15();
    const R=simState.R, Vs=[1,2,4,6,8,10,12];
    const tx=w*0.04,ty=h*0.06,tw=w*0.92,rowH=h*0.093;
    /* رأس الجدول */
    c.fillStyle=dark?'#1E3A5F':'#DBEAFE'; c.beginPath(); c.roundRect(tx,ty,tw,rowH*0.88,8); c.fill();
    const cols3=[0,tw*0.33,tw*0.66];
    ['فرق الجهد V (V)','شدة التيار I (A)','المقاومة R = V/I (Ω)'].forEach((hdr,i)=>{
      c.fillStyle=dark?'#93C5FD':'#1E40AF'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
      c.fillText(hdr,tx+cols3[i]+tw*0.28/2,ty+rowH*0.62);
    });
    /* الصفوف */
    Vs.forEach((V,ri)=>{
      const I=V/R, Rc=V/I;
      const ry2=ty+rowH*(ri+1);
      c.fillStyle=ri%2===0?(dark?'rgba(30,41,59,0.6)':'rgba(248,250,252,0.9)'):(dark?'rgba(15,23,42,0.4)':'white');
      c.beginPath(); c.roundRect(tx,ry2,tw,rowH*0.9,4); c.fill();
      [[V.toFixed(1),dark?'#FCD34D':'#92400E'],[I.toFixed(4),dark?'#34D399':'#047857'],[Rc.toFixed(1),dark?'#60A5FA':'#1E40AF']].forEach(([val,col],ci)=>{
        c.fillStyle=col; c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
        c.fillText(val,tx+cols3[ci]+tw*0.28/2,ry2+rowH*0.64);
      });
    });
    /* تذييل */
    const fy=ty+rowH*8.1;
    c.fillStyle=dark?'#1E3A5F':'#DBEAFE'; c.beginPath(); c.roundRect(tx,fy,tw,h*0.1,8); c.fill();
    c.strokeStyle=dark?'#60A5FA':'#1E40AF'; c.lineWidth=1.5; c.stroke();
    c.fillStyle=dark?'#60A5FA':'#1E40AF'; c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
    c.fillText(`R ثابتة = ${R} Ω في جميع الصفوف — قانون أوم محقق ✓`,w/2,fy+h*0.065);

    c.fillStyle=txt15(); c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.fillText('جدول ١-١٦ · التحقق من قانون أوم',w/2,h*0.975);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ═══════════════════════════════════════════════
   نشاط ٢-١٦ · عوامل المقاومة السلكية — تاب 1
   ═══════════════════════════════════════════════ */
function simG9WireRes1(){
  cancelAnimationFrame(animFrame);
  simState={L:1.0,A:1.0,rho:0.17};
  const mats={نحاس:0.17,ألومنيوم:0.28,حديد:1.0,نيكروم:6.4};
  window._setWL=v=>{simState.L=+v;var e=document.getElementById('wr-L');if(e)e.textContent=(+v).toFixed(1);};
  window._setWA=v=>{simState.A=+v;var e=document.getElementById('wr-A');if(e)e.textContent=(+v).toFixed(1);};
  window._setWMat=m=>{simState.rho=mats[m]||0.17;var e=document.getElementById('wr-mat');if(e)e.textContent=m;};
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📏 طول السلك L: <span id="wr-L">1.0</span> م</div>
      <input type="range" min="0.5" max="4" step="0.5" value="1" oninput="window._setWL(this.value)" style="width:100%">
      <div class="ctrl-label" style="margin-top:10px">🔘 مساحة المقطع A: <span id="wr-A">1.0</span> mm²</div>
      <input type="range" min="0.5" max="4" step="0.5" value="1" oninput="window._setWA(this.value)" style="width:100%">
      <div class="ctrl-label" style="margin-top:10px">⚗️ المادة: <span id="wr-mat">نحاس</span></div>
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn action" onclick="window._setWMat('نحاس')">نحاس</button>
        <button class="ctrl-btn" onclick="window._setWMat('ألومنيوم')">ألومنيوم</button>
        <button class="ctrl-btn" onclick="window._setWMat('حديد')">حديد</button>
        <button class="ctrl-btn" onclick="window._setWMat('نيكروم')">نيكروم</button>
      </div>
    </div>
    <div class="q-box"><strong>📐 القانون:</strong><br>R ∝ L (طردي مع الطول)<br>R ∝ 1/A (عكسي مع المقطع)<br>R = ρ × L / A</div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9wireres'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); c.fillStyle=bg15(); c.fillRect(0,0,w,h);
    const dark=dm15();
    const R=simState.rho*simState.L/simState.A;
    const matColors={0.17:dark?'#F59E0B':'#D97706',0.28:dark?'#9CA3AF':'#6B7280',1.0:dark?'#64748B':'#475569',6.4:dark?'#F87171':'#DC2626'};
    const wCol=matColors[simState.rho]||'#94A3B8';

    /* رسم السلك */
    const wireLen=Math.min(w*0.72,w*0.15*simState.L);
    const wireH=Math.max(8,Math.min(h*0.14,h*0.035*simState.A));
    const wx=w*0.12,wy=h*0.28;
    c.fillStyle=wCol; c.beginPath(); c.roundRect(wx,wy-wireH/2,wireLen,wireH,wireH/3); c.fill();
    c.strokeStyle=dark?'rgba(255,255,255,0.15)':'rgba(0,0,0,0.1)'; c.lineWidth=1; c.stroke();
    /* أسهم الطول */
    c.strokeStyle=dark?'rgba(255,255,255,0.4)':'rgba(100,116,139,0.7)'; c.lineWidth=1; c.setLineDash([4,4]);
    c.beginPath(); c.moveTo(wx,wy+wireH/2+14); c.lineTo(wx+wireLen,wy+wireH/2+14); c.stroke(); c.setLineDash([]);
    c.fillStyle=dark?'#94A3B8':'#475569'; c.font=`bold ${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText(`L = ${simState.L} م`,wx+wireLen/2,wy+wireH/2+30);
    /* مقطع عرضي */
    c.beginPath(); c.ellipse(wx+wireLen+36,wy,wireH*0.45,wireH/2,0,0,Math.PI*2);
    c.fillStyle=wCol; c.fill(); c.strokeStyle=dark?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.15)'; c.lineWidth=1.5; c.stroke();
    c.fillStyle=dark?'#94A3B8':'#475569'; c.font=`${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
    c.fillText(`A = ${simState.A} mm²`,wx+wireLen+36,wy+wireH/2+22);

    /* مقارنة أعمدة */
    const bars=[
      {lbl:'الطول L',val:simState.L,col:dark?'#60A5FA':'#1E40AF'},
      {lbl:'1/المقطع',val:1/simState.A,col:dark?'#A78BFA':'#6D28D9'},
      {lbl:'المقاومية ρ',val:simState.rho,col:dark?'#F59E0B':'#D97706'},
      {lbl:'R الكلية',val:R,col:dark?'#34D399':'#047857'},
    ];
    const maxBar=Math.max(...bars.map(b=>b.val),1)*1.2;
    const barX=w*0.05,barY=h*0.48,barW=w*0.9,barH=h*0.32;
    const bw=barW/bars.length-16;
    bars.forEach((b,i)=>{
      const bx=barX+i*(bw+16),bh2=barH*(b.val/maxBar);
      const by=barY+barH-bh2;
      c.fillStyle=b.col+'22'; c.beginPath(); c.roundRect(bx,barY,bw,barH,6); c.fill();
      c.fillStyle=b.col; c.beginPath(); c.roundRect(bx,by,bw,bh2,6); c.fill();
      c.fillStyle=txt15(); c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
      c.fillText(b.val.toFixed(2),bx+bw/2,by-8);
      c.fillStyle=dark?'#94A3B8':'#475569'; c.font=`${Math.round(h*0.021)}px Tajawal`;
      c.fillText(b.lbl,bx+bw/2,barY+barH+18);
    });

    /* نتيجة */
    c.fillStyle=panel15(); c.beginPath(); c.roundRect(w*0.04,h*0.83,w*0.92,h*0.1,10); c.fill();
    c.strokeStyle=dark?'#334155':'#CBD5E1'; c.lineWidth=1; c.stroke();
    c.fillStyle=dark?'#FCD34D':'#92400E'; c.font=`bold ${Math.round(h*0.034)}px Tajawal`; c.textAlign='center';
    c.fillText(`R = ρ × L / A = ${simState.rho} × ${simState.L} / ${simState.A} = ${R.toFixed(2)} وحدة`,w/2,h*0.896);

    c.fillStyle=txt15(); c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.fillText('نشاط ٢-١٦ · عوامل المقاومة السلكية',w/2,h*0.975);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ═══════════════════════════════════════════════
   نشاط ٢-١٦ · تاب 2 — نوع المادة
   ═══════════════════════════════════════════════ */
function simG9WireRes2(){
  cancelAnimationFrame(animFrame);
  simState={V:6};
  window._setWV2=v=>{simState.V=+v;var e=document.getElementById('wr2-V');if(e)e.textContent=v;};
  const matData=[
    {name:'نحاس',rho:0.17,color:'#D97706',bg:'#FEF3C7',darkBg:'#451a00',icon:'🟡'},
    {name:'ألومنيوم',rho:0.28,color:'#6B7280',bg:'#F1F5F9',darkBg:'#1e2938',icon:'⬜'},
    {name:'حديد',rho:1.0,color:'#475569',bg:'#F8FAFC',darkBg:'#0f172a',icon:'🔘'},
    {name:'نيكروم',rho:6.4,color:'#DC2626',bg:'#FFF1F2',darkBg:'#450a0a',icon:'🔴'},
  ];
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔋 الجهد المطبق: <span id="wr2-V">6</span> V</div>
      <input type="range" min="1" max="12" value="6" oninput="window._setWV2(this.value)" style="width:100%">
    </div>
    <div class="q-box"><strong>⚗️ المقاومية ρ:</strong><br>النحاس: ρ صغيرة جداً → موصل ممتاز.<br>النيكروم: ρ كبيرة → يُستخدم في عناصر التسخين.</div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9wireres'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); c.fillStyle=bg15(); c.fillRect(0,0,w,h);
    const dark=dm15();
    const cw=w*0.2,ch=h*0.78,gap=w*0.04;
    const startX=(w-4*(cw+gap)+gap)/2;
    matData.forEach((mat,i)=>{
      const R=mat.rho/1,I=simState.V/R;
      const heatFrac=Math.min(1,R/6.4);
      const bx=startX+i*(cw+gap),by=h*0.08;
      c.fillStyle=dark?mat.darkBg:mat.bg; c.beginPath(); c.roundRect(bx,by,cw,ch,12); c.fill();
      c.strokeStyle=mat.color; c.lineWidth=2; c.stroke();
      /* اسم */
      c.fillStyle=mat.color; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
      c.fillText(mat.icon,bx+cw/2,by+h*0.065); c.fillText(mat.name,bx+cw/2,by+h*0.115);
      /* سلك */
      const wireY=by+h*0.19, wireH2=Math.max(4,8*heatFrac+3);
      if(heatFrac>0.3){
        const gr=c.createRadialGradient(bx+cw/2,wireY,0,bx+cw/2,wireY,20);
        gr.addColorStop(0,`rgba(255,150,0,${0.5*heatFrac})`); gr.addColorStop(1,'rgba(255,100,0,0)');
        c.fillStyle=gr; c.beginPath(); c.arc(bx+cw/2,wireY,20,0,Math.PI*2); c.fill();
      }
      c.strokeStyle=heatFrac>0.5?`rgb(${Math.round(200+55*heatFrac)},${Math.round(120*(1-heatFrac))},0)`:mat.color;
      c.lineWidth=wireH2; c.lineCap='round';
      c.beginPath(); c.moveTo(bx+cw*0.15,wireY); c.lineTo(bx+cw*0.85,wireY); c.stroke(); c.lineCap='butt';
      /* قيم */
      c.textAlign='center'; c.font=`bold ${Math.round(h*0.023)}px Tajawal`;
      c.fillStyle=dark?'#E2E8F0':'#1E293B'; c.fillText(`ρ = ${mat.rho}`,bx+cw/2,by+h*0.28);
      c.fillStyle=mat.color; c.fillText(`R = ${R.toFixed(2)} Ω`,bx+cw/2,by+h*0.35);
      c.fillStyle=dark?'#34D399':'#047857'; c.fillText(`I = ${I.toFixed(3)} A`,bx+cw/2,by+h*0.42);
      /* مؤشر حرارة */
      const htH=ch*0.22*heatFrac, htY=by+ch-htH-h*0.08;
      const hGr=c.createLinearGradient(0,htY,0,htY+htH);
      hGr.addColorStop(0,'rgba(239,68,68,0)'); hGr.addColorStop(1,`rgba(239,68,68,${0.5+0.4*heatFrac})`);
      c.fillStyle=hGr; c.beginPath(); c.roundRect(bx+cw*0.2,htY,cw*0.6,htH,4); c.fill();
      c.fillStyle=dark?'#FCA5A5':'#B91C1C'; c.font=`${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
      c.fillText(`🌡️ ${(heatFrac*100).toFixed(0)}%`,bx+cw/2,by+ch-h*0.022);
    });
    c.fillStyle=txt15(); c.textAlign='center'; c.font=`bold ${Math.round(h*0.028)}px Tajawal`;
    c.fillText(`الجهد: ${simState.V} V — نوع المادة يؤثر على R والتيار والحرارة`,w/2,h*0.975);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ═══════════════════════════════════════════════
   نشاط ٣-١٦ · خاصية I-V — تاب 1: المقاوم الأومي
   ═══════════════════════════════════════════════ */
function simG9IVChar1(){
  cancelAnimationFrame(animFrame);
  simState={R:25,pts:[],sweeping:false,Vcur:0};
  window._setIVC_R=v=>{simState.R=+v;simState.pts=[];var e=document.getElementById('ivc-R');if(e)e.textContent=v;};
  window._startSweep1=()=>{simState.pts=[];simState.sweeping=true;simState.Vcur=0;};
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔩 المقاومة R: <span id="ivc-R">25</span> Ω</div>
      <input type="range" min="5" max="100" value="25" oninput="window._setIVC_R(this.value)" style="width:100%">
      <button class="ctrl-btn action" onclick="window._startSweep1()" style="margin-top:10px;width:100%">📈 ارسم المنحنى</button>
    </div>
    <div class="q-box"><strong>🔬 المقاوم الأومي:</strong><br>I = V/R → العلاقة خطية.<br>ميل الخط = 1/R (ثابت لا يتغير).</div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9ivchar'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); c.fillStyle=bg15(); c.fillRect(0,0,w,h);
    const dark=dm15();
    if(simState.sweeping){simState.Vcur+=0.25;simState.pts.push({V:simState.Vcur,I:simState.Vcur/simState.R});if(simState.Vcur>=12)simState.sweeping=false;}
    const Vmax=12,Imax=Vmax/simState.R;
    const ox=w*0.13,oy=h*0.84,gw=w*0.82,gh=h*0.68;
    for(let i=0;i<=5;i++){
      const gy=oy-gh*i/5;
      c.strokeStyle=dark?'rgba(71,85,105,0.4)':'rgba(203,213,225,0.8)'; c.lineWidth=1;
      c.beginPath(); c.moveTo(ox,gy); c.lineTo(ox+gw,gy); c.stroke();
      c.fillStyle=dark?'#64748B':'#475569'; c.font=`${Math.round(h*0.022)}px Tajawal`; c.textAlign='right';
      c.fillText((Imax*i/5).toFixed(3),ox-4,gy+4);
    }
    for(let i=0;i<=6;i++){
      const gx=ox+gw*i/6;
      c.strokeStyle=dark?'rgba(71,85,105,0.4)':'rgba(203,213,225,0.8)'; c.lineWidth=1;
      c.beginPath(); c.moveTo(gx,oy); c.lineTo(gx,oy-gh); c.stroke();
      c.fillStyle=dark?'#64748B':'#475569'; c.font=`${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
      c.fillText((Vmax*i/6).toFixed(0),gx,oy+h*0.03);
    }
    c.strokeStyle=dark?'#475569':'#94A3B8'; c.lineWidth=2;
    c.beginPath(); c.moveTo(ox,oy-gh); c.lineTo(ox,oy); c.lineTo(ox+gw,oy); c.stroke();
    c.fillStyle=dark?'#94A3B8':'#475569'; c.font=`${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText('فرق الجهد V (V)',ox+gw/2,oy+h*0.055);
    c.save(); c.translate(ox-h*0.055,oy-gh/2); c.rotate(-Math.PI/2); c.fillText('شدة التيار I (A)',0,0); c.restore();
    if(simState.pts.length>1){
      c.strokeStyle=dark?'#3B82F6':'#1E40AF'; c.lineWidth=3;
      c.beginPath(); simState.pts.forEach((p,i)=>{const x=ox+gw*(p.V/Vmax),y=oy-gh*(p.I/Imax);i===0?c.moveTo(x,y):c.lineTo(x,y);}); c.stroke();
      const last=simState.pts[simState.pts.length-1];
      c.beginPath(); c.arc(ox+gw*(last.V/Vmax),oy-gh*(last.I/Imax),6,0,Math.PI*2);
      c.fillStyle=dark?'#F472B6':'#BE185D'; c.fill();
    }
    if(simState.pts.length>5){
      c.fillStyle=panel15(); c.beginPath(); c.roundRect(w*0.56,h*0.04,w*0.42,h*0.2,10); c.fill();
      c.strokeStyle=dark?'#334155':'#CBD5E1'; c.lineWidth=1; c.stroke();
      c.textAlign='right'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`;
      c.fillStyle=dark?'#60A5FA':'#1E40AF'; c.fillText(`R = ${simState.R} Ω`,w*0.96,h*0.1);
      c.fillStyle=dark?'#34D399':'#047857'; c.fillText(`ميل الخط = 1/R = ${(1/simState.R).toFixed(4)}`,w*0.96,h*0.148);
      c.fillStyle=dark?'#FCD34D':'#92400E'; c.fillText('خط مستقيم ✓ أومي',w*0.96,h*0.196);
    }
    c.fillStyle=txt15(); c.textAlign='center'; c.font=`bold ${Math.round(h*0.03)}px Tajawal`;
    c.fillText('نشاط ٣-١٦ · خاصية I–V للمقاوم الأومي',w/2,h*0.95);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ═══════════════════════════════════════════════
   نشاط ٣-١٦ · تاب 2: المصباح (غير أومي)
   ═══════════════════════════════════════════════ */
function simG9IVChar2(){
  cancelAnimationFrame(animFrame);
  simState={R0:10,pts:[],sweeping:false,Vcur:0};
  window._setIVC2_R=v=>{simState.R0=+v;simState.pts=[];var e=document.getElementById('ivc2-R');if(e)e.textContent=v;};
  window._startSweep2=()=>{simState.pts=[];simState.sweeping=true;simState.Vcur=0;};
  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">💡 مقاومة المصباح (بارد): <span id="ivc2-R">10</span> Ω</div>
      <input type="range" min="5" max="50" value="10" oninput="window._setIVC2_R(this.value)" style="width:100%">
      <button class="ctrl-btn action" onclick="window._startSweep2()" style="margin-top:10px;width:100%">📈 ارسم المنحنى</button>
    </div>
    <div class="q-box"><strong>💡 المصباح (غير أومي):</strong><br>R تزداد مع ارتفاع درجة الحرارة.<br>المنحنى منحنٍ (ليس خطاً).<br>الميل يتناقص = R تتزايد.</div>
  `);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9ivchar'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); c.fillStyle=bg15(); c.fillRect(0,0,w,h);
    const dark=dm15();
    if(simState.sweeping){simState.Vcur+=0.2;const Reff=simState.R0*(1+simState.Vcur*0.22);simState.pts.push({V:simState.Vcur,I:simState.Vcur/Reff,R:Reff});if(simState.Vcur>=12)simState.sweeping=false;}
    const Vmax=12,Imax=simState.pts.length?Math.max(...simState.pts.map(p=>p.I))*1.15:Vmax/simState.R0;
    const ox=w*0.13,oy=h*0.84,gw=w*0.82,gh=h*0.68;
    for(let i=0;i<=5;i++){
      const gy=oy-gh*i/5;
      c.strokeStyle=dark?'rgba(71,85,105,0.4)':'rgba(203,213,225,0.8)'; c.lineWidth=1;
      c.beginPath(); c.moveTo(ox,gy); c.lineTo(ox+gw,gy); c.stroke();
      c.fillStyle=dark?'#64748B':'#475569'; c.font=`${Math.round(h*0.022)}px Tajawal`; c.textAlign='right';
      c.fillText((Imax*i/5).toFixed(3),ox-4,gy+4);
    }
    for(let i=0;i<=6;i++){
      const gx=ox+gw*i/6;
      c.strokeStyle=dark?'rgba(71,85,105,0.4)':'rgba(203,213,225,0.8)'; c.lineWidth=1;
      c.beginPath(); c.moveTo(gx,oy); c.lineTo(gx,oy-gh); c.stroke();
      c.fillStyle=dark?'#64748B':'#475569'; c.font=`${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
      c.fillText((Vmax*i/6).toFixed(0),gx,oy+h*0.03);
    }
    c.strokeStyle=dark?'#475569':'#94A3B8'; c.lineWidth=2;
    c.beginPath(); c.moveTo(ox,oy-gh); c.lineTo(ox,oy); c.lineTo(ox+gw,oy); c.stroke();
    c.fillStyle=dark?'#94A3B8':'#475569'; c.font=`${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText('فرق الجهد V (V)',ox+gw/2,oy+h*0.055);
    c.save(); c.translate(ox-h*0.055,oy-gh/2); c.rotate(-Math.PI/2); c.fillText('شدة التيار I (A)',0,0); c.restore();
    /* خط أومي مرجعي */
    if(simState.pts.length>2){
      c.strokeStyle=dark?'rgba(59,130,246,0.35)':'rgba(30,64,175,0.3)'; c.lineWidth=2; c.setLineDash([6,5]);
      c.beginPath(); c.moveTo(ox,oy); c.lineTo(ox+gw,oy-gh*(Vmax/simState.R0/Imax)); c.stroke(); c.setLineDash([]);
      c.fillStyle=dark?'rgba(59,130,246,0.6)':'rgba(30,64,175,0.5)'; c.font=`${Math.round(h*0.02)}px Tajawal`; c.textAlign='left';
      c.fillText('مرجع أومي (R ثابت)',ox+gw*0.25,oy-gh*(Vmax/simState.R0/Imax)*0.5);
    }
    /* منحنى المصباح */
    if(simState.pts.length>1){
      c.strokeStyle=dark?'#F97316':'#C2410C'; c.lineWidth=3;
      c.beginPath(); simState.pts.forEach((p,i)=>{const x=ox+gw*(p.V/Vmax),y=oy-gh*(p.I/Imax);i===0?c.moveTo(x,y):c.lineTo(x,y);}); c.stroke();
      const last=simState.pts[simState.pts.length-1];
      const glow=last.V/12;
      if(glow>0.4){const gr=c.createRadialGradient(ox+gw*(last.V/Vmax),oy-gh*(last.I/Imax),2,ox+gw*(last.V/Vmax),oy-gh*(last.I/Imax),16);gr.addColorStop(0,`rgba(253,224,71,${0.8*glow})`);gr.addColorStop(1,'rgba(253,224,71,0)');c.fillStyle=gr;c.beginPath();c.arc(ox+gw*(last.V/Vmax),oy-gh*(last.I/Imax),16,0,Math.PI*2);c.fill();}
      c.beginPath(); c.arc(ox+gw*(last.V/Vmax),oy-gh*(last.I/Imax),6,0,Math.PI*2);
      c.fillStyle=dark?'#FCD34D':'#D97706'; c.fill();
    }
    if(simState.pts.length>5){
      const last=simState.pts[simState.pts.length-1];
      c.fillStyle=panel15(); c.beginPath(); c.roundRect(w*0.56,h*0.04,w*0.42,h*0.22,10); c.fill();
      c.strokeStyle=dark?'#334155':'#CBD5E1'; c.lineWidth=1; c.stroke();
      c.textAlign='right'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`;
      c.fillStyle=dark?'#F97316':'#C2410C'; c.fillText(`V = ${last.V.toFixed(1)} V`,w*0.96,h*0.1);
      c.fillStyle=dark?'#FCD34D':'#D97706'; c.fillText(`I = ${last.I.toFixed(3)} A`,w*0.96,h*0.148);
      c.fillStyle=dark?'#F87171':'#B91C1C'; c.fillText(`R = ${last.R.toFixed(1)} Ω ↑`,w*0.96,h*0.196);
      c.fillStyle=dark?'#94A3B8':'#64748B'; c.font=`${Math.round(h*0.02)}px Tajawal`;
      c.fillText('منحنى ✓ غير أومي',w*0.96,h*0.235);
    }
    c.fillStyle=txt15(); c.textAlign='center'; c.font=`bold ${Math.round(h*0.03)}px Tajawal`;
    c.fillText('نشاط ٣-١٦ · خاصية I–V للمصباح (غير أومي)',w/2,h*0.95);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}



// ══════════════════════════════════════════════════════════
// 🌿 استقصاءات الأحياء — الصف التاسع — الوحدة ٧
// التغذية في النبات (نشاط ١ → ٨، ٣ تبويبات لكل نشاط)
// ══════════════════════════════════════════════════════════

/* ── helpers مشتركة ── */
function bioBg(){ return dm15()?'#0B1A10':'#F0FAF3'; }
function bioTxt(){ return dm15()?'#C8EDD4':'#1A3A25'; }
function bioMut(){ return dm15()?'#6BA87A':'#4A7A5A'; }
function bioAccent(){ return dm15()?'#4ADE80':'#16A34A'; }
function bioCard(){ return dm15()?'rgba(255,255,255,0.06)':'rgba(255,255,255,0.85)'; }
function bioShadow(){ return dm15()?'rgba(0,0,0,0.4)':'rgba(0,0,0,0.08)'; }

function bioInfoPanel(lines, icon){
  return `<div class="q-box" style="font-size:14px;line-height:1.8">${icon ? `<strong>${icon}</strong><br>` : ''}${lines.join('<br>')}</div>`;
}

function bioDrawCard(c, x, y, w, h, title, value, unit, color, dark){
  c.fillStyle = dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.9)';
  c.beginPath(); c.roundRect(x, y, w, h, 10); c.fill();
  c.strokeStyle = color; c.lineWidth = 2;
  c.beginPath(); c.roundRect(x, y, w, h, 10); c.stroke();
  c.fillStyle = dark ? '#9CA3AF' : '#6B7280'; c.font = `${Math.round(h*0.22)}px Tajawal`; c.textAlign = 'center';
  c.fillText(title, x + w/2, y + h*0.38);
  c.fillStyle = color; c.font = `bold ${Math.round(h*0.34)}px Tajawal`;
  c.fillText(value, x + w/2, y + h*0.68);
  c.fillStyle = dark ? '#9CA3AF' : '#6B7280'; c.font = `${Math.round(h*0.18)}px Tajawal`;
  c.fillText(unit, x + w/2, y + h*0.88);
}

/* ════════════════════════════════════════
   نشاط ١-٧ · أنواع التغذية
════════════════════════════════════════ */
function simG9Bio7N1a(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0, selected: null };
  controls(bioInfoPanel([
    '🌿 <strong>التغذية الذاتية (Autotrophs)</strong>: تصنع غذاءها بنفسها',
    '🔬 مثال: النباتات الخضراء، الطحالب، البكتيريا الضوئية',
    '🦁 <strong>التغذية الغيرية (Heterotrophs)</strong>: تحصل على غذائها من الكائنات الأخرى',
    '🔬 مثال: الحيوانات، الفطريات، معظم البكتيريا',
  ], '🌿 أنواع التغذية'));
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n1'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.02;
    const c = cv.getContext('2d'), w = cv.width, h = cv.height;
    const dark = dm15();
    c.fillStyle = bioBg(); c.fillRect(0,0,w,h);
    // عنوان
    c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.045)}px Tajawal`; c.textAlign = 'center';
    c.fillText('التغذية الذاتية مقابل التغذية الغيرية', w/2, h*0.09);
    // بطاقة النبات (يمين)
    const cx1 = w*0.28, cy = h*0.35, bw = w*0.36, bh = h*0.42;
    c.fillStyle = dark ? 'rgba(22,163,74,0.15)' : 'rgba(220,252,231,0.9)';
    c.beginPath(); c.roundRect(cx1 - bw/2, cy, bw, bh, 14); c.fill();
    c.strokeStyle = bioAccent(); c.lineWidth = 2.5;
    c.beginPath(); c.roundRect(cx1 - bw/2, cy, bw, bh, 14); c.stroke();
    c.font = `${Math.round(bh*0.28)}px serif`; c.textAlign = 'center';
    c.fillText('🌿', cx1, cy + bh*0.35);
    c.fillStyle = bioAccent(); c.font = `bold ${Math.round(bh*0.13)}px Tajawal`;
    c.fillText('ذاتية التغذية', cx1, cy + bh*0.56);
    c.fillStyle = bioMut(); c.font = `${Math.round(bh*0.1)}px Tajawal`;
    c.fillText('تصنع غذاءها بالضوء', cx1, cy + bh*0.72);
    c.fillStyle = dark?'#86EFAC':'#15803D'; c.font = `${Math.round(bh*0.09)}px Tajawal`;
    c.fillText('☀️ + H₂O + CO₂ → سكر', cx1, cy + bh*0.88);
    // بطاقة الحيوان (يسار)
    const cx2 = w*0.72;
    c.fillStyle = dark ? 'rgba(234,88,12,0.15)' : 'rgba(255,237,213,0.9)';
    c.beginPath(); c.roundRect(cx2 - bw/2, cy, bw, bh, 14); c.fill();
    c.strokeStyle = dark?'#FB923C':'#EA580C'; c.lineWidth = 2.5;
    c.beginPath(); c.roundRect(cx2 - bw/2, cy, bw, bh, 14); c.stroke();
    c.font = `${Math.round(bh*0.28)}px serif`; c.textAlign = 'center';
    c.fillText('🦁', cx2, cy + bh*0.35);
    c.fillStyle = dark?'#FB923C':'#EA580C'; c.font = `bold ${Math.round(bh*0.13)}px Tajawal`;
    c.fillText('غيرية التغذية', cx2, cy + bh*0.56);
    c.fillStyle = bioMut(); c.font = `${Math.round(bh*0.1)}px Tajawal`;
    c.fillText('تحصل على غذاء جاهز', cx2, cy + bh*0.72);
    c.fillStyle = dark?'#FCA5A5':'#991B1B'; c.font = `${Math.round(bh*0.09)}px Tajawal`;
    c.fillText('🍃 تأكل نباتات أو حيوانات', cx2, cy + bh*0.88);
    // سهم في المنتصف
    c.fillStyle = dark?'#D1D5DB':'#374151'; c.font = `bold ${Math.round(h*0.06)}px Arial`; c.textAlign = 'center';
    c.fillText('⟵', w/2, cy + bh/2 + h*0.02);
    c.fillStyle = bioMut(); c.font = `${Math.round(h*0.025)}px Tajawal`;
    c.fillText('تعتمد على', w/2, cy + bh/2 + h*0.07);
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG9Bio7N1b(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0 };
  controls(bioInfoPanel([
    '🧬 <strong>المواد العضوية</strong>: تحتوي على كربون — سكر، نشا، بروتين، دهون',
    '⚗️ <strong>المواد غير العضوية</strong>: لا تحتوي على كربون — ماء، أملاح، ثاني أكسيد الكربون',
    '🌿 النباتات تحوِّل المواد غير العضوية → مواد عضوية عبر التمثيل الضوئي',
  ], '🧬 المواد العضوية وغير العضوية'));
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n1'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.015;
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = dm15();
    c.fillStyle = bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.045)}px Tajawal`; c.textAlign = 'center';
    c.fillText('المواد العضوية وغير العضوية', w/2, h*0.09);
    const items = [
      { emoji:'🍬', name:'سكر جلوكوز', type:'عضوية', color: dark?'#4ADE80':'#16A34A', x:0.17 },
      { emoji:'🌾', name:'نشا', type:'عضوية', color: dark?'#4ADE80':'#16A34A', x:0.37 },
      { emoji:'💧', name:'ماء H₂O', type:'غير عضوية', color: dark?'#60A5FA':'#2563EB', x:0.57 },
      { emoji:'💨', name:'CO₂', type:'غير عضوية', color: dark?'#60A5FA':'#2563EB', x:0.77 },
    ];
    items.forEach(item => {
      const ix = w * item.x, iy = h * 0.3, iw = w*0.15, ih = h*0.45;
      c.fillStyle = item.type === 'عضوية' ? (dark?'rgba(74,222,128,0.12)':'rgba(220,252,231,0.9)') : (dark?'rgba(96,165,250,0.12)':'rgba(219,234,254,0.9)');
      c.beginPath(); c.roundRect(ix - iw/2, iy, iw, ih, 12); c.fill();
      c.strokeStyle = item.color; c.lineWidth = 2;
      c.beginPath(); c.roundRect(ix - iw/2, iy, iw, ih, 12); c.stroke();
      c.font = `${Math.round(ih*0.22)}px serif`; c.textAlign = 'center';
      c.fillText(item.emoji, ix, iy + ih*0.3);
      c.fillStyle = item.color; c.font = `bold ${Math.round(ih*0.11)}px Tajawal`;
      c.fillText(item.name, ix, iy + ih*0.52);
      c.fillStyle = dark?'#9CA3AF':'#6B7280'; c.font = `${Math.round(ih*0.09)}px Tajawal`;
      c.fillText(item.type, ix, iy + ih*0.68);
    });
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG9Bio7N1c(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0, answers: {}, score: null };
  const organisms = [
    { name:'الأشجار', emoji:'🌳', answer:'ذاتية' },
    { name:'الأسماك', emoji:'🐟', answer:'غيرية' },
    { name:'العشب', emoji:'🌱', answer:'ذاتية' },
    { name:'الأسد', emoji:'🦁', answer:'غيرية' },
  ];
  let html = `<div class="ctrl-section"><div class="ctrl-label">🎯 صنِّف كل كائن: ذاتي أم غيري؟</div>`;
  organisms.forEach((org, i) => {
    html += `<div style="display:flex;align-items:center;gap:10px;margin:8px 0;padding:8px;background:var(--bg-card2);border-radius:10px">
      <span style="font-size:24px">${org.emoji}</span>
      <span style="flex:1;font-weight:700">${org.name}</span>
      <button onclick="window._bioAns(${i},'ذاتية')" id="bio1c_${i}_a" style="padding:6px 12px;border-radius:8px;border:2px solid var(--border-color);background:var(--bg-ctrl-btn);cursor:pointer;font-family:Tajawal;font-weight:700">ذاتية</button>
      <button onclick="window._bioAns(${i},'غيرية')" id="bio1c_${i}_b" style="padding:6px 12px;border-radius:8px;border:2px solid var(--border-color);background:var(--bg-ctrl-btn);cursor:pointer;font-family:Tajawal;font-weight:700">غيرية</button>
    </div>`;
  });
  html += `<button onclick="window._bioCheck()" style="width:100%;padding:10px;margin-top:10px;border-radius:10px;background:#16A34A;color:white;font-family:Tajawal;font-weight:700;font-size:15px;border:none;cursor:pointer">✅ تحقق من إجاباتك</button>
  <div id="bio1c_result" style="margin-top:8px;font-weight:700;text-align:center;font-size:15px"></div></div>`;
  controls(html);
  window._bioAns = (i, val) => { simState.answers[i] = val; };
  window._bioCheck = () => {
    let score = 0;
    organisms.forEach((org, i) => {
      if(simState.answers[i] === org.answer) score++;
    });
    document.getElementById('bio1c_result').innerHTML =
      score === 4 ? '🎉 ممتاز! جميع إجاباتك صحيحة' :
      `✅ أجبت ${score} من ${organisms.length} بشكل صحيح — راجع الإجابات`;
  };
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n1'||currentTab!==2){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.01;
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = dm15();
    c.fillStyle = bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.05)}px Tajawal`; c.textAlign = 'center';
    c.fillText('🎯 صنِّف الكائنات الحية', w/2, h*0.15);
    const emojis = ['🌳','🐟','🌱','🦁'];
    emojis.forEach((e, i) => {
      const x = w * (0.2 + i * 0.2), y = h * 0.35;
      c.font = `${Math.round(h*0.12)}px serif`; c.textAlign = 'center';
      c.fillText(e, x, y + h*0.1);
    });
    c.fillStyle = bioMut(); c.font = `${Math.round(h*0.03)}px Tajawal`; c.textAlign = 'center';
    c.fillText('استخدم اللوحة الجانبية للتصنيف', w/2, h*0.65);
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   نشاط ٢-٧ · التمثيل الضوئي
════════════════════════════════════════ */
function simG9Bio7N2a(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0 };
  controls(bioInfoPanel([
    '☀️ <strong>معادلة التمثيل الضوئي:</strong>',
    '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂',
    '🔋 طاقة الضوء تحوِّل ثاني أكسيد الكربون والماء إلى جلوكوز وأكسجين',
    '🌿 تحدث داخل البلاستيدات الخضراء في خلايا النبات',
  ], '☀️ معادلة التمثيل الضوئي'));
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n2'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.02;
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = dm15();
    c.fillStyle = bioBg(); c.fillRect(0,0,w,h);
    // ضوء الشمس يتحرك
    const sunX = w*0.5, sunY = h*0.12 + Math.sin(simState.t)*h*0.01;
    c.fillStyle = dark?'#FCD34D':'#FBBF24'; c.font = `${Math.round(h*0.1)}px serif`; c.textAlign = 'center';
    c.fillText('☀️', sunX, sunY);
    // أشعة
    for(let i=0; i<6; i++){
      const angle = (i/6)*Math.PI*2 + simState.t*0.3;
      c.strokeStyle = dark?'rgba(252,211,77,0.4)':'rgba(251,191,36,0.5)';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(sunX + Math.cos(angle)*30, sunY - 20 + Math.sin(angle)*30);
      c.lineTo(sunX + Math.cos(angle)*55, sunY - 20 + Math.sin(angle)*55);
      c.stroke();
    }
    // ورقة النبات
    const lx = w*0.5, ly = h*0.42, lr = h*0.18;
    c.fillStyle = dark?'rgba(74,222,128,0.3)':'rgba(134,239,172,0.8)';
    c.beginPath(); c.ellipse(lx, ly, lr*1.6, lr, -0.3, 0, Math.PI*2); c.fill();
    c.strokeStyle = dark?'#4ADE80':'#16A34A'; c.lineWidth = 2;
    c.beginPath(); c.ellipse(lx, ly, lr*1.6, lr, -0.3, 0, Math.PI*2); c.stroke();
    c.fillStyle = dark?'#4ADE80':'#166534'; c.font = `${Math.round(h*0.035)}px Tajawal`; c.textAlign = 'center';
    c.fillText('🍃 ورقة النبات', lx, ly + h*0.035);
    // مدخلات ومخرجات
    const arrowY = h*0.7;
    // CO2
    c.fillStyle = dark?'#FCA5A5':'#DC2626'; c.font = `bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign = 'center';
    c.fillText('CO₂ + H₂O', w*0.25, arrowY);
    c.fillStyle = dark?'#D1D5DB':'#6B7280'; c.font = `${Math.round(h*0.055)}px Arial`;
    c.fillText('→', w*0.5, arrowY + h*0.02);
    // ناتج
    c.fillStyle = dark?'#86EFAC':'#15803D'; c.font = `bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign = 'center';
    c.fillText('C₆H₁₂O₆ + O₂', w*0.75, arrowY);
    c.fillStyle = bioMut(); c.font = `${Math.round(h*0.028)}px Tajawal`;
    c.fillText('(جلوكوز + أكسجين)', w*0.75, arrowY + h*0.05);
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG9Bio7N2b(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0 };
  controls(bioInfoPanel([
    '🍃 <strong>الكلوروفيل</strong>: الصبغة الخضراء في البلاستيدات الخضراء',
    '🌈 يمتص الضوء الأحمر والأزرق ويعكس الأخضر → لذلك النبات يبدو أخضر',
    '⚡ يحوِّل طاقة الضوء إلى طاقة كيميائية (ATP)',
    '🔬 يوجد في الكلوروبلاست داخل خلايا النبات',
  ], '🍃 الكلوروفيل والطاقة الضوئية'));
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n2'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.02;
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = dm15();
    c.fillStyle = bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.045)}px Tajawal`; c.textAlign = 'center';
    c.fillText('الكلوروفيل يمتص الضوء', w/2, h*0.09);
    // طيف الضوء
    const colors = ['#EF4444','#F97316','#EAB308','#22C55E','#3B82F6','#8B5CF6','#EC4899'];
    const bandW = w*0.7 / colors.length;
    colors.forEach((col, i) => {
      const bx = w*0.15 + i*bandW, bh2 = h*0.14;
      const absorbed = i===0 || i===4; // أحمر وأزرق ممتص
      c.fillStyle = col + (absorbed ? 'FF' : '44');
      c.fillRect(bx, h*0.18, bandW, bh2);
      if(absorbed){
        c.fillStyle = dark?'white':'#111';
        c.font = `bold ${Math.round(bh2*0.35)}px Arial`; c.textAlign = 'center';
        c.fillText('↓', bx + bandW/2, h*0.18 + bh2*0.65);
      }
    });
    // الكلوروبلاست
    c.fillStyle = dark?'rgba(74,222,128,0.2)':'rgba(220,252,231,0.9)';
    c.beginPath(); c.ellipse(w/2, h*0.56, w*0.22, h*0.12, 0, 0, Math.PI*2); c.fill();
    c.strokeStyle = bioAccent(); c.lineWidth = 2.5;
    c.beginPath(); c.ellipse(w/2, h*0.56, w*0.22, h*0.12, 0, 0, Math.PI*2); c.stroke();
    c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.035)}px Tajawal`; c.textAlign = 'center';
    c.fillText('🍃 كلوروبلاست', w/2, h*0.56 + h*0.015);
    // إشارة الطاقة
    const pulse = 0.7 + Math.sin(simState.t*2)*0.3;
    c.fillStyle = dark?`rgba(250,204,21,${pulse})`:`rgba(234,179,8,${pulse})`;
    c.font = `${Math.round(h*0.06)}px serif`; c.textAlign = 'center';
    c.fillText('⚡ ATP', w/2, h*0.78);
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG9Bio7N2c(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0, light: true, water: true, co2: true };
  controls(`<div class="ctrl-section">
    <div class="ctrl-label">⚙️ شروط التمثيل الضوئي</div>
    <label style="display:flex;align-items:center;gap:10px;margin:8px 0;font-weight:700">
      <input type="checkbox" checked onchange="simState.light=this.checked" style="width:20px;height:20px"> ☀️ الضوء
    </label>
    <label style="display:flex;align-items:center;gap:10px;margin:8px 0;font-weight:700">
      <input type="checkbox" checked onchange="simState.water=this.checked" style="width:20px;height:20px"> 💧 الماء
    </label>
    <label style="display:flex;align-items:center;gap:10px;margin:8px 0;font-weight:700">
      <input type="checkbox" checked onchange="simState.co2=this.checked" style="width:20px;height:20px"> 💨 ثاني أكسيد الكربون
    </label>
    <div id="bio2c_result" style="margin-top:12px;padding:10px;border-radius:10px;background:var(--bg-card2);font-weight:700;text-align:center"></div>
  </div>`);
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n2'||currentTab!==2){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.025;
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = dm15();
    const active = simState.light && simState.water && simState.co2;
    c.fillStyle = bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.045)}px Tajawal`; c.textAlign = 'center';
    c.fillText('شروط التمثيل الضوئي', w/2, h*0.09);
    // ورقة
    c.fillStyle = active ? (dark?'rgba(74,222,128,0.4)':'rgba(134,239,172,0.9)') : (dark?'rgba(100,100,100,0.3)':'rgba(200,200,200,0.8)');
    c.beginPath(); c.ellipse(w/2, h*0.45, w*0.25, h*0.15, 0, 0, Math.PI*2); c.fill();
    c.strokeStyle = active ? bioAccent() : (dark?'#6B7280':'#9CA3AF'); c.lineWidth = 2.5;
    c.beginPath(); c.ellipse(w/2, h*0.45, w*0.25, h*0.15, 0, 0, Math.PI*2); c.stroke();
    c.font = `${Math.round(h*0.07)}px serif`; c.textAlign = 'center';
    c.fillText(active ? '🌿' : '🍂', w/2, h*0.45 + h*0.03);
    // فقاعات O2 إذا نشط
    if(active){
      for(let i = 0; i < 5; i++){
        const bx = w*0.4 + (i * w*0.05) + Math.sin(simState.t + i)*w*0.02;
        const by = h*0.35 - ((simState.t * h*0.05 + i * h*0.06) % (h*0.22));
        c.fillStyle = dark?'rgba(147,197,253,0.6)':'rgba(59,130,246,0.5)';
        c.beginPath(); c.arc(bx, by, h*0.015, 0, Math.PI*2); c.fill();
        c.strokeStyle = dark?'#93C5FD':'#2563EB'; c.lineWidth = 1;
        c.beginPath(); c.arc(bx, by, h*0.015, 0, Math.PI*2); c.stroke();
      }
    }
    // نتيجة
    const res = document.getElementById('bio2c_result');
    if(res) res.textContent = active ? '✅ التمثيل الضوئي يعمل بكفاءة!' : '⚠️ التمثيل الضوئي متوقف — يلزم توفر جميع الشروط';
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   نشاط ٣-٧ · تركيب ورقة النبات
════════════════════════════════════════ */
function simG9Bio7N3a(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0, hover: -1 };
  controls(bioInfoPanel([
    '🔬 <strong>طبقات ورقة النبات من الأعلى للأسفل:</strong>',
    '1️⃣ البشرة العليا: طبقة شفافة تحمي الورقة',
    '2️⃣ النسيج العمادي: خلايا طويلة تحتوي على كلوروبلاست',
    '3️⃣ النسيج الإسفنجي: خلايا متفرقة تتيح تبادل الغازات',
    '4️⃣ البشرة السفلى: تحتوي على الثغور',
  ], '🔬 طبقات الورقة'));
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n3'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.01;
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = dm15();
    c.fillStyle = bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign = 'center';
    c.fillText('مقطع عرضي في ورقة النبات', w/2, h*0.07);
    const layers = [
      { name:'البشرة العليا', color: dark?'rgba(186,230,253,0.7)':'rgba(224,242,254,0.9)', h:0.08 },
      { name:'النسيج العمادي', color: dark?'rgba(74,222,128,0.4)':'rgba(187,247,208,0.9)', h:0.22 },
      { name:'النسيج الإسفنجي', color: dark?'rgba(134,239,172,0.25)':'rgba(220,252,231,0.8)', h:0.22 },
      { name:'البشرة السفلى', color: dark?'rgba(186,230,253,0.5)':'rgba(207,250,254,0.9)', h:0.08 },
    ];
    let ly = h * 0.14;
    const lx = w*0.1, lw = w*0.55;
    layers.forEach(layer => {
      const lh = h * layer.h;
      c.fillStyle = layer.color;
      c.beginPath(); c.roundRect(lx, ly, lw, lh, 4); c.fill();
      c.strokeStyle = dark?'rgba(255,255,255,0.2)':'rgba(0,0,0,0.15)'; c.lineWidth = 1;
      c.beginPath(); c.roundRect(lx, ly, lw, lh, 4); c.stroke();
      // تسمية
      c.fillStyle = bioTxt(); c.font = `${Math.round(lh*0.5)}px Tajawal`; c.textAlign = 'right';
      c.fillText(layer.name, w*0.95, ly + lh*0.65);
      // خط توصيل
      c.strokeStyle = bioMut(); c.lineWidth = 1; c.setLineDash([3,3]);
      c.beginPath(); c.moveTo(lx + lw, ly + lh/2); c.lineTo(w*0.95 - c.measureText(layer.name).width - 5, ly + lh/2); c.stroke();
      c.setLineDash([]);
      ly += lh;
    });
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG9Bio7N3b(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0, open: true };
  controls(`<div class="ctrl-section">
    <div class="ctrl-label">🚪 حالة الثغر</div>
    <label style="display:flex;align-items:center;gap:10px;margin:10px 0;font-weight:700">
      <input type="checkbox" checked onchange="simState.open=this.checked" style="width:20px;height:20px"> الثغر مفتوح (نهاراً)
    </label>
    ${bioInfoPanel([
      '🚪 <strong>الثغور</strong>: فتحات صغيرة في البشرة السفلى',
      '☀️ تفتح نهاراً لدخول CO₂ وخروج O₂',
      '🌙 تغلق ليلاً للحفاظ على الماء',
      '💧 خلايا حارسة تتحكم في الفتح والإغلاق',
    ], '')}`);
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n3'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.02;
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = dm15();
    c.fillStyle = bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.045)}px Tajawal`; c.textAlign = 'center';
    c.fillText('الثغور والخلايا الحارسة', w/2, h*0.09);
    const cx = w/2, cy = h*0.45, size = h*0.18;
    const gap = simState.open ? size*0.35 : size*0.05;
    // خلية حارسة يمين
    c.fillStyle = dark?'rgba(74,222,128,0.35)':'rgba(134,239,172,0.85)';
    c.beginPath(); c.ellipse(cx - size*0.4, cy, size*0.35, size*0.7, 0.3, 0, Math.PI*2); c.fill();
    c.strokeStyle = bioAccent(); c.lineWidth = 2; c.stroke();
    // خلية حارسة يسار
    c.fillStyle = dark?'rgba(74,222,128,0.35)':'rgba(134,239,172,0.85)';
    c.beginPath(); c.ellipse(cx + size*0.4, cy, size*0.35, size*0.7, -0.3, 0, Math.PI*2); c.fill();
    c.strokeStyle = bioAccent(); c.lineWidth = 2; c.stroke();
    // الفتحة
    c.fillStyle = dark?'rgba(15,23,42,0.8)':'rgba(240,253,244,0.9)';
    c.beginPath(); c.ellipse(cx, cy, gap, size*0.3, 0, 0, Math.PI*2); c.fill();
    // سهام الغازات
    if(simState.open){
      c.fillStyle = dark?'#FCA5A5':'#DC2626'; c.font = `${Math.round(h*0.028)}px Tajawal`; c.textAlign = 'center';
      c.fillText('← CO₂', cx - w*0.2, cy - h*0.08);
      c.fillStyle = dark?'#86EFAC':'#16A34A';
      c.fillText('O₂ →', cx + w*0.2, cy + h*0.08);
    }
    c.fillStyle = bioMut(); c.font = `${Math.round(h*0.03)}px Tajawal`; c.textAlign = 'center';
    c.fillText(simState.open ? '🌞 الثغر مفتوح' : '🌙 الثغر مغلق', w/2, h*0.82);
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG9Bio7N3c(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0 };
  controls(bioInfoPanel([
    '🌿 <strong>الأوعية الوعائية</strong>: تنقل المواد عبر النبات',
    '🪵 <strong>الخشب (Xylem)</strong>: ينقل الماء والأملاح من الجذور إلى الأوراق',
    '🍬 <strong>اللحاء (Phloem)</strong>: ينقل السكر (الجلوكوز) من الأوراق لبقية النبات',
  ], '🌿 الأوعية الوعائية'));
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n3'||currentTab!==2){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.02;
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = dm15();
    c.fillStyle = bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign = 'center';
    c.fillText('الأوعية الوعائية في النبات', w/2, h*0.08);
    // نبات بسيط
    const px = w/2, py = h*0.85, stemH = h*0.55;
    // ساق
    c.strokeStyle = dark?'#6B7280':'#92400E'; c.lineWidth = 12;
    c.beginPath(); c.moveTo(px, py); c.lineTo(px, py - stemH); c.stroke();
    // خشب (ماء يصعد)
    const waterY = py - ((simState.t * 60) % stemH);
    c.fillStyle = dark?'#60A5FA':'#2563EB';
    c.beginPath(); c.arc(px - 4, waterY, 5, 0, Math.PI*2); c.fill();
    // لحاء (سكر ينزل)
    const sugarY = (py - stemH) + ((simState.t * 40) % stemH);
    c.fillStyle = dark?'#FCD34D':'#D97706';
    c.beginPath(); c.arc(px + 4, sugarY, 5, 0, Math.PI*2); c.fill();
    // ورقة
    c.fillStyle = dark?'rgba(74,222,128,0.5)':'rgba(134,239,172,0.9)';
    c.beginPath(); c.ellipse(px + w*0.1, py - stemH*0.6, w*0.12, h*0.07, 0.5, 0, Math.PI*2); c.fill();
    c.strokeStyle = bioAccent(); c.lineWidth = 1.5; c.stroke();
    // تسميات
    c.fillStyle = dark?'#60A5FA':'#2563EB'; c.font = `${Math.round(h*0.028)}px Tajawal`; c.textAlign = 'right';
    c.fillText('↑ خشب (ماء)', px - 20, h*0.5);
    c.fillStyle = dark?'#FCD34D':'#D97706'; c.textAlign = 'left';
    c.fillText('↓ لحاء (سكر)', px + 20, h*0.6);
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   نشاط ٤-٧ · الكشف عن الكلوروفيل
════════════════════════════════════════ */
function simG9Bio7N4a(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0 };
  controls(bioInfoPanel([
    '🌈 الكلوروفيل يمتص الضوء الأحمر (650-680nm) والأزرق (430-450nm)',
    '🟢 يعكس الأخضر → لذلك تبدو الأوراق خضراء',
    '🔴 بدون كلوروفيل لا يمتص الضوء → لا تمثيل ضوئي',
  ], '🌈 الكلوروفيل وامتصاص الضوء'));
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n4'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.015;
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = dm15();
    c.fillStyle = bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign = 'center';
    c.fillText('طيف امتصاص الكلوروفيل', w/2, h*0.08);
    // رسم منحنى الامتصاص
    const graphX = w*0.1, graphY = h*0.18, graphW = w*0.8, graphH = h*0.55;
    c.fillStyle = dark?'rgba(255,255,255,0.04)':'rgba(255,255,255,0.8)';
    c.beginPath(); c.roundRect(graphX, graphY, graphW, graphH, 10); c.fill();
    c.strokeStyle = dark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'; c.lineWidth = 1; c.stroke();
    // خلفية الطيف
    const gradient = c.createLinearGradient(graphX, 0, graphX + graphW, 0);
    gradient.addColorStop(0, 'rgba(139,0,255,0.3)');
    gradient.addColorStop(0.2, 'rgba(0,0,255,0.3)');
    gradient.addColorStop(0.4, 'rgba(0,255,0,0.3)');
    gradient.addColorStop(0.6, 'rgba(255,255,0,0.3)');
    gradient.addColorStop(0.8, 'rgba(255,165,0,0.3)');
    gradient.addColorStop(1, 'rgba(255,0,0,0.3)');
    c.fillStyle = gradient;
    c.fillRect(graphX + 5, graphY + 5, graphW - 10, graphH - 10);
    // منحنى الامتصاص
    c.strokeStyle = dark?'#4ADE80':'#16A34A'; c.lineWidth = 3;
    c.beginPath();
    for(let x = 0; x <= graphW; x++){
      const wl = 400 + (x/graphW)*300; // 400-700nm
      const abs = 0.8*Math.exp(-Math.pow(wl-430,2)/500) + 0.9*Math.exp(-Math.pow(wl-662,2)/500);
      const y = graphY + graphH - abs * graphH * 0.8;
      x===0 ? c.moveTo(graphX + x, y) : c.lineTo(graphX + x, y);
    }
    c.stroke();
    // محاور
    c.fillStyle = bioMut(); c.font = `${Math.round(h*0.025)}px Tajawal`; c.textAlign = 'center';
    c.fillText('400nm (بنفسجي)', graphX + graphW*0.05, graphY + graphH + h*0.06);
    c.fillText('700nm (أحمر)', graphX + graphW*0.95, graphY + graphH + h*0.06);
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG9Bio7N4b(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0, hasChlorophyll: true, hasLight: true };
  controls(`<div class="ctrl-section">
    <div class="ctrl-label">🔬 تجربة الكلوروفيل والضوء</div>
    <label style="display:flex;align-items:center;gap:10px;margin:8px 0;font-weight:700">
      <input type="checkbox" checked onchange="simState.hasChlorophyll=this.checked" style="width:18px;height:18px"> 🍃 يوجد كلوروفيل
    </label>
    <label style="display:flex;align-items:center;gap:10px;margin:8px 0;font-weight:700">
      <input type="checkbox" checked onchange="simState.hasLight=this.checked" style="width:18px;height:18px"> ☀️ يوجد ضوء
    </label>
    ${bioInfoPanel(['الضوء والكلوروفيل كلاهما ضروري لإنتاج النشا'], '💡')}`);
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n4'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.02;
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = dm15();
    const active = simState.hasChlorophyll && simState.hasLight;
    c.fillStyle = bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign = 'center';
    c.fillText('الكلوروفيل + الضوء = نشا', w/2, h*0.09);
    // ورقة
    c.fillStyle = simState.hasChlorophyll ? (dark?'rgba(74,222,128,0.35)':'rgba(187,247,208,0.9)') : (dark?'rgba(156,163,175,0.2)':'rgba(229,231,235,0.9)');
    c.beginPath(); c.ellipse(w/2, h*0.45, w*0.25, h*0.15, 0, 0, Math.PI*2); c.fill();
    c.strokeStyle = simState.hasChlorophyll ? bioAccent() : (dark?'#6B7280':'#9CA3AF'); c.lineWidth = 2.5; c.stroke();
    c.font = `${Math.round(h*0.07)}px serif`; c.textAlign = 'center';
    c.fillText(simState.hasChlorophyll ? '🍃' : '🍂', w/2, h*0.45 + h*0.03);
    // ضوء
    if(simState.hasLight){
      c.fillStyle = dark?'rgba(252,211,77,0.8)':'rgba(251,191,36,0.9)';
      c.font = `${Math.round(h*0.07)}px serif`;
      c.fillText('☀️', w/2, h*0.16);
    }
    // نتيجة
    c.fillStyle = active ? (dark?'#4ADE80':'#16A34A') : (dark?'#F87171':'#DC2626');
    c.font = `bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign = 'center';
    c.fillText(active ? '✅ ينتج النشا' : '❌ لا ينتج النشا', w/2, h*0.72);
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG9Bio7N4c(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0 };
  controls(bioInfoPanel([
    '🧪 <strong>خطوات التجربة:</strong>',
    '1️⃣ غطِّ جزءاً من الورقة بورق أسود لمنع الضوء',
    '2️⃣ اترك النبات في الضوء 6 ساعات',
    '3️⃣ أزل الكلوروفيل بالغلي في الكحول',
    '4️⃣ أضف محلول اليود',
    '🔵 الجزء المكشوف يتحول أزرق أسود (يوجد نشا)',
    '🟡 الجزء المغطى يبقى بني صفراوي (لا نشا)',
  ], '🧪 تجربة الورقة الخضراء'));
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n4'||currentTab!==2){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.01;
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = dm15();
    c.fillStyle = bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign = 'center';
    c.fillText('تجربة: الكلوروفيل والنشا', w/2, h*0.08);
    // ورقتان
    const leaves = [{x:w*0.28, label:'مغطى بورق أسود', starch:false},{x:w*0.72, label:'مكشوف للضوء', starch:true}];
    leaves.forEach(leaf => {
      c.fillStyle = leaf.starch ? (dark?'rgba(30,30,120,0.5)':'rgba(30,30,180,0.4)') : (dark?'rgba(180,140,60,0.4)':'rgba(212,184,100,0.7)');
      c.beginPath(); c.ellipse(leaf.x, h*0.44, w*0.17, h*0.14, 0, 0, Math.PI*2); c.fill();
      c.strokeStyle = leaf.starch ? (dark?'#6366F1':'#3730A3') : (dark?'#B45309':'#92400E'); c.lineWidth = 2; c.stroke();
      c.fillStyle = bioTxt(); c.font = `${Math.round(h*0.028)}px Tajawal`; c.textAlign = 'center';
      c.fillText(leaf.label, leaf.x, h*0.64);
      c.fillStyle = leaf.starch ? (dark?'#818CF8':'#3730A3') : (dark?'#FCD34D':'#B45309');
      c.font = `bold ${Math.round(h*0.03)}px Tajawal`;
      c.fillText(leaf.starch ? '🔵 نشا موجود' : '🟡 لا نشا', leaf.x, h*0.72);
    });
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   نشاط ٥-٧ · الكشف عن النشا
════════════════════════════════════════ */
function simG9Bio7N5a(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0 };
  controls(bioInfoPanel([
    '🟤 <strong>اختبار اليود للنشا:</strong>',
    '• محلول اليود (لوغول): لون بني برتقالي',
    '• عند وجود النشا: يتحول إلى أزرق أسود',
    '⚗️ النشا مصنوع من وحدات جلوكوز متصلة',
    '🔬 اليود يدخل في حلزون النشا ويعطي اللون الأزرق',
  ], '🟤 اختبار اليود للنشا'));
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n5'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.02;
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = dm15();
    c.fillStyle = bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign = 'center';
    c.fillText('اختبار اليود — تغيُّر اللون', w/2, h*0.08);
    // أنبوبتان
    const tubes = [
      { x: w*0.3, label: 'بدون نشا', iodine: dark?'#B45309':'#D97706', result: dark?'#B45309':'#D97706', resLabel: 'بني برتقالي — سالب' },
      { x: w*0.7, label: 'مع نشا', iodine: dark?'#B45309':'#D97706', result: dark?'#1E1B4B':'#1E3A8A', resLabel: 'أزرق أسود — موجب 🔬' },
    ];
    tubes.forEach(tube => {
      // أنبوبة اختبار
      c.strokeStyle = dark?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.3)'; c.lineWidth = 2;
      c.fillStyle = tube.result;
      c.beginPath();
      c.moveTo(tube.x - w*0.05, h*0.25);
      c.lineTo(tube.x - w*0.05, h*0.65);
      c.arc(tube.x, h*0.65, w*0.05, Math.PI, 0);
      c.lineTo(tube.x + w*0.05, h*0.25);
      c.fill(); c.stroke();
      // تسميات
      c.fillStyle = bioTxt(); c.font = `${Math.round(h*0.028)}px Tajawal`; c.textAlign = 'center';
      c.fillText(tube.label, tube.x, h*0.22);
      c.fillStyle = dark?'#D1D5DB':'#374151'; c.font = `bold ${Math.round(h*0.025)}px Tajawal`;
      c.fillText(tube.resLabel, tube.x, h*0.78);
    });
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG9Bio7N5b(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0, step: 0 };
  controls(`<div class="ctrl-section">
    <div class="ctrl-label">🔬 خطوات التجربة المخبرية</div>
    <button onclick="simState.step=Math.min(simState.step+1,4)" style="width:100%;padding:10px;margin:5px 0;border-radius:10px;background:#16A34A;color:white;font-family:Tajawal;font-weight:700;font-size:14px;border:none;cursor:pointer">▶ الخطوة التالية</button>
    <button onclick="simState.step=0" style="width:100%;padding:8px;margin:5px 0;border-radius:10px;background:var(--bg-card2);color:var(--text-primary);font-family:Tajawal;font-weight:700;font-size:14px;border:2px solid var(--border-color);cursor:pointer">🔄 إعادة</button>
  </div>`);
  const steps = ['انتزاع الورقة وتسخينها في ماء مغلي','تسخينها في الكحول لإزالة الكلوروفيل','غسلها بالماء البارد','وضعها في طبق بتري وإضافة اليود','ملاحظة تغيُّر اللون'];
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n5'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.01;
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = dm15();
    c.fillStyle = bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign = 'center';
    c.fillText(`خطوة ${simState.step + 1} من ${steps.length}`, w/2, h*0.1);
    const emojis = ['🌿','🧪','💧','🔬','🔵'];
    c.font = `${Math.round(h*0.2)}px serif`; c.textAlign = 'center';
    c.fillText(emojis[simState.step], w/2, h*0.45);
    c.fillStyle = bioTxt(); c.font = `${Math.round(h*0.035)}px Tajawal`; c.textAlign = 'center';
    // تقطيع النص إذا طال
    const words = steps[simState.step];
    c.fillText(words, w/2, h*0.65);
    // شريط التقدم
    c.fillStyle = dark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.08)';
    c.beginPath(); c.roundRect(w*0.1, h*0.8, w*0.8, h*0.04, 10); c.fill();
    c.fillStyle = bioAccent();
    c.beginPath(); c.roundRect(w*0.1, h*0.8, w*0.8 * ((simState.step+1)/steps.length), h*0.04, 10); c.fill();
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG9Bio7N5c(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0 };
  controls(bioInfoPanel([
    '📊 <strong>تفسير النتائج:</strong>',
    '🔵 لون أزرق أسود → نشا موجود → تمثيل ضوئي حدث',
    '🟡 لون بني برتقالي → لا نشا → لم يحدث تمثيل ضوئي',
    '🔍 المنطقة المغطاة ببقى بني → لا ضوء = لا نشا',
    '✅ الاستنتاج: الضوء والكلوروفيل شرطان للتمثيل الضوئي',
  ], '📊 تفسير النتائج'));
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n5'||currentTab!==2){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.01;
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = dm15();
    c.fillStyle = bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign = 'center';
    c.fillText('ملخص نتائج اختبار النشا', w/2, h*0.08);
    const rows = [
      {cond:'مغطى + كلوروفيل', result:'لا نشا', color:dark?'#D97706':'#92400E', icon:'🟡'},
      {cond:'مكشوف + كلوروفيل', result:'نشا موجود', color:dark?'#6366F1':'#1E3A8A', icon:'🔵'},
      {cond:'مكشوف + بلا كلوروفيل', result:'لا نشا', color:dark?'#D97706':'#92400E', icon:'🟡'},
    ];
    rows.forEach((row, i) => {
      const ry = h*(0.22 + i*0.22), rh = h*0.16;
      c.fillStyle = dark?'rgba(255,255,255,0.05)':'rgba(255,255,255,0.85)';
      c.beginPath(); c.roundRect(w*0.05, ry, w*0.9, rh, 10); c.fill();
      c.fillStyle = bioTxt(); c.font = `${Math.round(rh*0.35)}px Tajawal`; c.textAlign = 'right';
      c.fillText(row.cond, w*0.88, ry + rh*0.65);
      c.fillStyle = row.color; c.font = `bold ${Math.round(rh*0.35)}px Tajawal`; c.textAlign = 'left';
      c.fillText(`${row.icon} ${row.result}`, w*0.12, ry + rh*0.65);
    });
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   نشاط ٦-٧ · التمثيل الضوئي في نبات مائي
════════════════════════════════════════ */
function simG9Bio7N6a(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0, distance: 20, bubbles: [] };
  controls(`<div class="ctrl-section">
    <div class="ctrl-label">💡 المسافة من المصباح: <span id="bio6a_dist">20</span> cm</div>
    <input type="range" min="5" max="50" value="20" oninput="simState.distance=+this.value;document.getElementById('bio6a_dist').textContent=this.value" style="width:100%">
    ${bioInfoPanel(['كلما قلّت المسافة زادت شدة الضوء وزاد معدل الفقاعات'], '💧')}`);
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n6'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.03;
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = dm15();
    const rate = Math.max(0.1, 1 - simState.distance/55);
    // إضافة فقاعات
    if(Math.random() < rate * 0.4) simState.bubbles.push({x: w*0.45 + (Math.random()-0.5)*w*0.08, y: h*0.55, r: 3+Math.random()*4});
    simState.bubbles.forEach(b => { b.y -= 1.5 + rate*1.5; });
    simState.bubbles = simState.bubbles.filter(b => b.y > h*0.15);
    c.fillStyle = dark?'#0F172A':'#EFF6FF'; c.fillRect(0,0,w,h);
    // ماء
    c.fillStyle = dark?'rgba(59,130,246,0.15)':'rgba(186,230,253,0.5)';
    c.fillRect(w*0.2, h*0.2, w*0.6, h*0.6);
    // نبات إيلوديا
    c.strokeStyle = dark?'#4ADE80':'#16A34A'; c.lineWidth = 3;
    for(let i=0;i<3;i++){
      c.beginPath(); c.moveTo(w*0.42+i*w*0.04, h*0.75); c.quadraticCurveTo(w*0.4+i*w*0.04+Math.sin(simState.t+i)*8,h*0.55,w*0.44+i*w*0.04,h*0.38); c.stroke();
    }
    // مصباح
    const lx = w*0.5, ly = h*0.1 + simState.distance/50*h*0.1;
    c.font = `${Math.round(h*0.08)}px serif`; c.textAlign = 'center';
    c.fillText('💡', lx, ly);
    // فقاعات
    simState.bubbles.forEach(b => {
      c.fillStyle = dark?'rgba(147,197,253,0.5)':'rgba(59,130,246,0.4)';
      c.beginPath(); c.arc(b.x, b.y, b.r, 0, Math.PI*2); c.fill();
      c.strokeStyle = dark?'#93C5FD':'#3B82F6'; c.lineWidth = 1; c.stroke();
    });
    // معدل الفقاعات
    c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.035)}px Tajawal`; c.textAlign = 'center';
    c.fillText(`معدل O₂: ${Math.round(rate*100)}%`, w/2, h*0.9);
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG9Bio7N6b(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0 };
  controls(bioInfoPanel([
    '📈 <strong>العلاقة بين المسافة ومعدل التمثيل:</strong>',
    '• شدة الضوء تقل بمربع المسافة',
    '• معدل فقاعات O₂ يقل بزيادة المسافة',
    '🔍 الرسم البياني يوضح علاقة عكسية',
  ], '📈 الرسم البياني'));
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n6'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.01;
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = dm15();
    c.fillStyle = bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign = 'center';
    c.fillText('العلاقة بين شدة الضوء ومعدل التمثيل', w/2, h*0.08);
    const gx = w*0.15, gy = h*0.15, gw = w*0.75, gh = h*0.6;
    // إطار
    c.strokeStyle = dark?'rgba(255,255,255,0.2)':'rgba(0,0,0,0.2)'; c.lineWidth = 1.5;
    c.strokeRect(gx, gy, gw, gh);
    // منحنى
    c.strokeStyle = bioAccent(); c.lineWidth = 3;
    c.beginPath();
    for(let i=0;i<=50;i++){
      const x = gx + (i/50)*gw;
      const rate = 1/(1+i*0.08);
      const y = gy + gh - rate*gh*0.85;
      i===0?c.moveTo(x,y):c.lineTo(x,y);
    }
    c.stroke();
    // محاور
    c.fillStyle = bioMut(); c.font = `${Math.round(h*0.03)}px Tajawal`; c.textAlign = 'center';
    c.fillText('المسافة من المصباح (cm) →', gx + gw/2, gy + gh + h*0.07);
    c.save(); c.translate(gx - h*0.06, gy + gh/2); c.rotate(-Math.PI/2);
    c.fillText('معدل O₂ ←', 0, 0); c.restore();
    // نقاط بيانات
    [[5,0.9],[10,0.7],[20,0.5],[30,0.35],[40,0.25],[50,0.18]].forEach(([d,r])=>{
      const px = gx + (d/50)*gw, py = gy + gh - r*gh*0.85;
      c.fillStyle = bioAccent();
      c.beginPath(); c.arc(px, py, 5, 0, Math.PI*2); c.fill();
    });
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG9Bio7N6c(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0 };
  controls(bioInfoPanel([
    '🔍 <strong>استنتج العلاقة:</strong>',
    '✅ زيادة شدة الضوء → زيادة معدل التمثيل الضوئي',
    '✅ كلما قلّت المسافة → زادت الفقاعات (O₂)',
    '⚠️ لكن هناك حد أقصى — عند التشبع الضوئي يتوقف الزيادة',
    '📌 العامل المحدود يصبح CO₂ أو الكلوروفيل وليس الضوء',
  ], '🔍 استنتج العلاقة'));
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n6'||currentTab!==2){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.015;
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = dm15();
    c.fillStyle = bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign = 'center';
    c.fillText('ملخص الاستنتاجات', w/2, h*0.09);
    const points = ['↑ شدة الضوء ← قرب المصباح', '↑ معدل O₂ ← تمثيل أكثر', '⚠️ حد أقصى عند التشبع', '📌 عوامل أخرى قد تحدّ'];
    points.forEach((pt, i) => {
      const py = h*(0.25 + i*0.16);
      const alpha = 0.5 + Math.sin(simState.t + i*0.8)*0.5;
      c.fillStyle = dark?`rgba(74,222,128,${alpha})`:`rgba(22,163,74,${alpha})`;
      c.beginPath(); c.arc(w*0.12, py, h*0.025, 0, Math.PI*2); c.fill();
      c.fillStyle = bioTxt(); c.font = `${Math.round(h*0.033)}px Tajawal`; c.textAlign = 'right';
      c.fillText(pt, w*0.9, py + h*0.012);
    });
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   نشاط ٧-٧ · تأثير شدة الضوء
════════════════════════════════════════ */
function simG9Bio7N7a(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0, intensity: 50, bubbles: [] };
  controls(`<div class="ctrl-section">
    <div class="ctrl-label">💡 شدة الضوء: <span id="bio7a_int">50</span>%</div>
    <input type="range" min="0" max="100" value="50" oninput="simState.intensity=+this.value;document.getElementById('bio7a_int').textContent=this.value" style="width:100%">
    ${bioInfoPanel(['شدة الضوء تؤثر مباشرة على معدل التمثيل الضوئي'], '💡')}`);
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n7'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.03;
    const rate = simState.intensity / 100;
    if(rate > 0.1 && Math.random() < rate * 0.3) simState.bubbles.push({x: w*0.45 + (Math.random()-0.5)*40, y: h*0.6, r: 2+Math.random()*5});
    simState.bubbles.forEach(b => b.y -= 1 + rate*2);
    simState.bubbles = simState.bubbles.filter(b => b.y > 0);
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = dm15();
    c.fillStyle = dark?'#071810':'#F0FFF4'; c.fillRect(0,0,w,h);
    // مؤشر الشدة
    const brightness = `rgba(252,211,77,${rate*0.8 + 0.1})`;
    c.fillStyle = brightness; c.font = `${Math.round(h*0.12)}px serif`; c.textAlign = 'center';
    c.fillText('☀️', w/2, h*0.15);
    // ورقة
    c.fillStyle = rate > 0 ? (dark?'rgba(74,222,128,0.4)':'rgba(187,247,208,0.9)') : (dark?'rgba(100,100,100,0.3)':'rgba(200,200,200,0.8)');
    c.beginPath(); c.ellipse(w/2, h*0.48, w*0.22, h*0.13, 0, 0, Math.PI*2); c.fill();
    c.strokeStyle = rate > 0 ? bioAccent() : '#9CA3AF'; c.lineWidth = 2.5; c.stroke();
    c.font = `${Math.round(h*0.06)}px serif`; c.textAlign = 'center';
    c.fillText('🌿', w/2, h*0.5);
    // فقاعات
    simState.bubbles.forEach(b => {
      c.fillStyle = dark?'rgba(147,197,253,0.5)':'rgba(59,130,246,0.45)';
      c.beginPath(); c.arc(b.x, b.y, b.r, 0, Math.PI*2); c.fill();
    });
    const bw = w*0.8, bx = w*0.1, bbarW = bw * rate;
    c.fillStyle = dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)';
    c.beginPath(); c.roundRect(bx, h*0.78, bw, h*0.05, 8); c.fill();
    c.fillStyle = bioAccent();
    c.beginPath(); c.roundRect(bx, h*0.78, bbarW, h*0.05, 8); c.fill();
    c.fillStyle = bioTxt(); c.font = `${Math.round(h*0.03)}px Tajawal`; c.textAlign = 'center';
    c.fillText(`معدل التمثيل: ${Math.round(rate*100)}%`, w/2, h*0.9);
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG9Bio7N7b(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0 };
  controls(bioInfoPanel([
    '📈 <strong>منحنى التشبع الضوئي:</strong>',
    '• المنطقة أ: زيادة الضوء → زيادة التمثيل (علاقة طردية)',
    '• نقطة التشبع: أقصى معدل للتمثيل',
    '• المنطقة ب: زيادة الضوء لا تزيد المعدل',
    '⚠️ العامل المحدود يكون CO₂ أو الكلوروفيل',
  ], '📈 منحنى التشبع الضوئي'));
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n7'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.01;
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = dm15();
    c.fillStyle = bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign = 'center';
    c.fillText('منحنى التشبع الضوئي', w/2, h*0.07);
    const gx=w*0.13,gy=h*0.13,gw=w*0.78,gh=h*0.65;
    c.strokeStyle=dark?'rgba(255,255,255,0.2)':'rgba(0,0,0,0.15)'; c.lineWidth=1.5; c.strokeRect(gx,gy,gw,gh);
    // منحنى
    c.strokeStyle=bioAccent(); c.lineWidth=3; c.beginPath();
    for(let i=0;i<=100;i++){
      const x=gx+(i/100)*gw;
      const rate = Math.min(1, i/60) * (1 - Math.exp(-i*0.05));
      const y=gy+gh-rate*gh*0.85;
      i===0?c.moveTo(x,y):c.lineTo(x,y);
    }
    c.stroke();
    // نقطة التشبع
    const satX = gx + gw*0.6, satY = gy + gh*0.15;
    c.fillStyle = dark?'#F87171':'#DC2626';
    c.beginPath(); c.arc(satX, satY, 7, 0, Math.PI*2); c.fill();
    c.fillStyle = dark?'#F87171':'#DC2626'; c.font = `bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign = 'right';
    c.fillText('نقطة التشبع', satX - 12, satY - 12);
    // تسمية المناطق
    c.fillStyle=dark?'#86EFAC':'#15803D'; c.font=`${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText('منطقة أ: علاقة طردية', gx+gw*0.3, gy+gh+h*0.05);
    c.fillStyle=dark?'#FCA5A5':'#DC2626';
    c.fillText('منطقة ب: تشبع', gx+gw*0.8, gy+gh+h*0.05);
    c.fillStyle=bioMut(); c.font=`${Math.round(h*0.025)}px Tajawal`; c.textAlign='center';
    c.fillText('شدة الضوء ←', gx+gw/2, gy+gh+h*0.1);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG9Bio7N7c(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0, src: 0 };
  const sources = ['مصباح عادي 100W', 'مصباح LED', 'ضوء الشمس'];
  const rates = [0.5, 0.75, 1.0];
  controls(`<div class="ctrl-section">
    <div class="ctrl-label">⚡ مصدر الضوء</div>
    ${sources.map((s,i)=>`<label style="display:flex;align-items:center;gap:10px;margin:8px 0;font-weight:700"><input type="radio" name="bioSrc" ${i===0?'checked':''} onchange="simState.src=${i}" style="width:18px;height:18px"> ${s}</label>`).join('')}
  </div>`);
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n7'||currentTab!==2){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.02;
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = dm15();
    c.fillStyle = bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign = 'center';
    c.fillText('مقارنة مصادر الضوء', w/2, h*0.08);
    sources.forEach((src, i) => {
      const bx = w*(0.18+i*0.28), by = h*0.55, bw2 = w*0.18, bh = h*0.35*rates[i];
      // عمود
      c.fillStyle = i===simState.src ? bioAccent() : (dark?'rgba(74,222,128,0.2)':'rgba(187,247,208,0.6)');
      c.beginPath(); c.roundRect(bx-bw2/2, by-bh, bw2, bh, 8); c.fill();
      c.strokeStyle = i===simState.src ? (dark?'#4ADE80':'#16A34A') : (dark?'rgba(74,222,128,0.4)':'rgba(22,163,74,0.4)');
      c.lineWidth = i===simState.src ? 2.5 : 1.5; c.stroke();
      c.fillStyle = bioTxt(); c.font = `${Math.round(h*0.028)}px Tajawal`; c.textAlign = 'center';
      c.fillText(src, bx, by + h*0.06);
      c.fillStyle = i===simState.src ? bioAccent() : bioMut();
      c.font = `bold ${Math.round(h*0.032)}px Tajawal`;
      c.fillText(`${Math.round(rates[i]*100)}%`, bx, by - bh - h*0.02);
    });
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   نشاط ٨-٧ · تأثير درجة الحرارة
════════════════════════════════════════ */
function simG9Bio7N8a(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0, temp: 25, bubbles: [] };
  controls(`<div class="ctrl-section">
    <div class="ctrl-label">🌡️ درجة الحرارة: <span id="bio8a_tmp">25</span> °م</div>
    <input type="range" min="0" max="50" value="25" oninput="simState.temp=+this.value;document.getElementById('bio8a_tmp').textContent=this.value" style="width:100%">
    ${bioInfoPanel(['الدرجة المثلى للتمثيل الضوئي: 25-35°م'], '🌡️')}`);
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n8'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.025;
    const T = simState.temp;
    const rate = T < 5 ? 0.05 : T > 45 ? 0.05 : Math.exp(-Math.pow(T-30,2)/200);
    if(rate > 0.1 && Math.random() < rate * 0.3) simState.bubbles.push({x:w*0.45+(Math.random()-0.5)*40, y:h*0.6, r:2+Math.random()*5});
    simState.bubbles.forEach(b=>b.y -= 1+rate*2);
    simState.bubbles = simState.bubbles.filter(b=>b.y>0);
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = dm15();
    c.fillStyle = bioBg(); c.fillRect(0,0,w,h);
    // مؤشر حرارة
    const heatColor = T < 15 ? '#60A5FA' : T < 35 ? '#4ADE80' : '#F87171';
    c.fillStyle = heatColor; c.font = `${Math.round(h*0.1)}px serif`; c.textAlign = 'center';
    c.fillText('🌡️', w*0.15, h*0.25);
    c.fillStyle = heatColor; c.font = `bold ${Math.round(h*0.05)}px Tajawal`;
    c.fillText(`${T}°م`, w*0.15, h*0.35);
    // ورقة
    c.fillStyle = rate > 0.3 ? (dark?'rgba(74,222,128,0.4)':'rgba(187,247,208,0.9)') : (dark?'rgba(156,163,175,0.25)':'rgba(209,250,229,0.5)');
    c.beginPath(); c.ellipse(w*0.56, h*0.48, w*0.22, h*0.14, 0, 0, Math.PI*2); c.fill();
    c.strokeStyle = rate > 0.3 ? bioAccent() : '#9CA3AF'; c.lineWidth = 2.5; c.stroke();
    c.font = `${Math.round(h*0.065)}px serif`; c.textAlign = 'center';
    c.fillText(rate > 0.3 ? '🌿' : '🍂', w*0.56, h*0.5);
    simState.bubbles.forEach(b => {
      c.fillStyle = dark?'rgba(147,197,253,0.5)':'rgba(59,130,246,0.45)';
      c.beginPath(); c.arc(b.x, b.y, b.r, 0, Math.PI*2); c.fill();
    });
    c.fillStyle = bioTxt(); c.font = `${Math.round(h*0.03)}px Tajawal`; c.textAlign = 'center';
    c.fillText(`معدل التمثيل: ${Math.round(rate*100)}%`, w/2, h*0.88);
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG9Bio7N8b(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0 };
  controls(bioInfoPanel([
    '🔬 <strong>الإنزيمات والحرارة:</strong>',
    '✅ الدرجة المثلى (25-35°م): إنزيمات نشطة → تمثيل جيد',
    '❄️ درجة منخفضة: الإنزيمات بطيئة → تمثيل ضعيف',
    '🔥 درجة مرتفعة (+45°م): الإنزيمات تتغيّر وتُعطَّل',
    '📌 الإنزيمات بروتينات تتحطم بالحرارة الزائدة',
  ], '🔬 الدرجة المثلى للإنزيمات'));
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n8'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.01;
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = dm15();
    c.fillStyle = bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign = 'center';
    c.fillText('منحنى نشاط الإنزيم مع درجة الحرارة', w/2, h*0.08);
    const gx=w*0.13, gy=h*0.15, gw=w*0.78, gh=h*0.58;
    c.strokeStyle=dark?'rgba(255,255,255,0.15)':'rgba(0,0,0,0.12)'; c.lineWidth=1.5; c.strokeRect(gx,gy,gw,gh);
    c.strokeStyle=bioAccent(); c.lineWidth=3; c.beginPath();
    for(let t=0;t<=50;t++){
      const x=gx+(t/50)*gw;
      const act = t<5?0.05:t>45?0.05:Math.exp(-Math.pow(t-30,2)/200);
      const y=gy+gh-act*gh*0.9;
      t===0?c.moveTo(x,y):c.lineTo(x,y);
    }
    c.stroke();
    // نقطة مثلى
    const optX=gx+gw*0.6, optY=gy+gh*0.1;
    c.fillStyle=dark?'#FCD34D':'#D97706';
    c.beginPath(); c.arc(optX,optY,7,0,Math.PI*2); c.fill();
    c.fillStyle=dark?'#FCD34D':'#D97706'; c.font=`bold ${Math.round(h*0.027)}px Tajawal`; c.textAlign='left';
    c.fillText('الدرجة المثلى ~30°م',optX+12,optY-5);
    c.fillStyle=bioMut(); c.font=`${Math.round(h*0.025)}px Tajawal`; c.textAlign='center';
    c.fillText('درجة الحرارة (°م) →', gx+gw/2, gy+gh+h*0.08);
    ['0','10','20','30','40','50'].forEach((v,i)=>{
      c.fillStyle=bioMut(); c.font=`${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
      c.fillText(v, gx+i*(gw/5), gy+gh+h*0.04);
    });
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG9Bio7N8c(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0 };
  controls(bioInfoPanel([
    '⚖️ <strong>مقارنة بين درجتين:</strong>',
    '❄️ عند 10°م: الإنزيمات بطيئة جداً — معدل منخفض جداً',
    '🔥 عند 80°م: الإنزيمات مُعطَّلة — معدل يكاد يكون صفراً',
    '✅ الفرق يوضح أن لكل درجة حرارة تأثير مختلف',
  ], '⚖️ مقارنة 10°م مقابل 80°م'));
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n8'||currentTab!==2){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.015;
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = dm15();
    c.fillStyle = bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign = 'center';
    c.fillText('مقارنة التمثيل عند درجات مختلفة', w/2, h*0.08);
    const compare = [
      {temp:'10°م',rate:0.08,emoji:'❄️',color:dark?'#60A5FA':'#2563EB',x:w*0.25},
      {temp:'25°م',rate:0.85,emoji:'✅',color:dark?'#4ADE80':'#16A34A',x:w*0.5},
      {temp:'80°م',rate:0.04,emoji:'🔥',color:dark?'#F87171':'#DC2626',x:w*0.75},
    ];
    compare.forEach(item => {
      const bh = h*0.45*item.rate, by = h*0.65;
      c.fillStyle = item.color + '55';
      c.beginPath(); c.roundRect(item.x-w*0.09, by-bh, w*0.18, bh, 8); c.fill();
      c.strokeStyle = item.color; c.lineWidth = 2.5; c.stroke();
      c.font = `${Math.round(h*0.055)}px serif`; c.textAlign = 'center';
      c.fillText(item.emoji, item.x, by - bh - h*0.04);
      c.fillStyle = item.color; c.font = `bold ${Math.round(h*0.032)}px Tajawal`;
      c.fillText(item.temp, item.x, by + h*0.05);
      c.fillStyle = bioTxt(); c.font = `${Math.round(h*0.026)}px Tajawal`;
      c.fillText(`${Math.round(item.rate*100)}%`, item.x, by + h*0.1);
    });
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   موضوع ٤-٧ · الأملاح المعدنية (n9)
   النيترات والماغنيسيوم
════════════════════════════════════════ */
function simG9Bio7N9a(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0 };
  controls(bioInfoPanel([
    '🌱 <strong>النيتروجين</strong>: ضروري لبناء البروتينات والكلوروفيل وجميع الأحماض الأمينية',
    '⚗️ <strong>مصدره في النبات</strong>: يمتصه من التربة على شكل أيونات النترات (NO₃⁻)',
    '🍃 <strong>عند نقص النيترات</strong>: أوراق صفراء اللون، صغيرة الحجم، ضعف النمو',
    '💡 النبات لا يستطيع استخدام نيتروجين الهواء مباشرةً — يحتاج إلى أيونات النترات من التربة',
  ], '🌱 النيترات ونقص النيتروجين'));
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n9'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.015;
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = dm15();
    c.fillStyle = bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.042)}px Tajawal`; c.textAlign = 'center';
    c.fillText('نقص أيونات النترات في النبات', w/2, h*0.09);
    // نبات صحي
    const p1x = w*0.28, leafH = h*0.42, leafY = h*0.22;
    // ساق
    c.strokeStyle = dark?'#86EFAC':'#15803D'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(p1x, leafY+leafH); c.lineTo(p1x, leafY+leafH+h*0.12); c.stroke();
    // أوراق خضراء كبيرة
    [[-0.28,-0.12],[0.28,-0.24],[-0.32,-0.35],[0.32,-0.47]].forEach(([dx,dy])=>{
      c.fillStyle = dark?'rgba(74,222,128,0.85)':'rgba(34,197,94,0.85)';
      c.beginPath(); c.ellipse(p1x+dx*w*0.25, leafY+leafH+dy*leafH, w*0.1, h*0.055, dx>0?0.5:-0.5, 0, Math.PI*2); c.fill();
      c.strokeStyle = dark?'#4ADE80':'#15803D'; c.lineWidth=1.5; c.stroke();
    });
    c.fillStyle = dark?'#4ADE80':'#15803D'; c.font = `bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
    c.fillText('نبات سليم', p1x, leafY+leafH+h*0.2);
    c.fillStyle = bioMut(); c.font = `${Math.round(h*0.026)}px Tajawal`;
    c.fillText('تربة غنية بالنترات', p1x, leafY+leafH+h*0.27);
    // نبات مريض (نقص نيترات)
    const p2x = w*0.72;
    c.strokeStyle = dark?'#FDE68A':'#CA8A04'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(p2x, leafY+leafH); c.lineTo(p2x, leafY+leafH+h*0.12); c.stroke();
    [[-0.2,-0.09],[0.2,-0.18],[-0.22,-0.27]].forEach(([dx,dy])=>{
      c.fillStyle = dark?'rgba(253,230,138,0.8)':'rgba(253,224,71,0.75)';
      c.beginPath(); c.ellipse(p2x+dx*w*0.25, leafY+leafH+dy*leafH, w*0.07, h*0.04, dx>0?0.5:-0.5, 0, Math.PI*2); c.fill();
      c.strokeStyle = dark?'#FCD34D':'#CA8A04'; c.lineWidth=1.5; c.stroke();
    });
    c.fillStyle = dark?'#FCD34D':'#B45309'; c.font = `bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
    c.fillText('نبات ناقص نيترات', p2x, leafY+leafH+h*0.2);
    c.fillStyle = bioMut(); c.font = `${Math.round(h*0.026)}px Tajawal`;
    c.fillText('أوراق صفراء صغيرة', p2x, leafY+leafH+h*0.27);
    // سهم في المنتصف وعلامة x
    c.fillStyle = dark?'#F87171':'#DC2626'; c.font = `bold ${Math.round(h*0.05)}px Arial`; c.textAlign='center';
    c.fillText('NO₃⁻', w/2, h*0.48);
    c.fillStyle = dark?'#F87171':'#DC2626'; c.font = `${Math.round(h*0.04)}px serif`; c.textAlign='center';
    c.fillText('✗', w/2, h*0.57);
    c.fillStyle = bioMut(); c.font = `${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText('غياب الأيون', w/2, h*0.64);
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG9Bio7N9b(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0 };
  controls(bioInfoPanel([
    '💚 <strong>الماغنيسيوم</strong>: عنصر مركزي في جزيء الكلوروفيل',
    '🔬 كل جزيء كلوروفيل يحتوي على ذرة ماغنيسيوم واحدة في مركزه',
    '🍃 <strong>عند نقص الماغنيسيوم</strong>: اصفرار أوراق النبات (كلوروز) مع بقاء العروق خضراء',
    '💡 المصدر: أيونات الماغنيسيوم (Mg²⁺) التي تمتصها النبتة من التربة',
  ], '💚 الماغنيسيوم ونقص الكلوروفيل'));
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n9'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.015;
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = dm15();
    c.fillStyle = bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.042)}px Tajawal`; c.textAlign = 'center';
    c.fillText('دور الماغنيسيوم في الكلوروفيل', w/2, h*0.09);
    // رسم جزيء كلوروفيل مبسّط
    const cx = w/2, cy = h*0.42, R = Math.min(w,h)*0.13;
    // حلقة الكلوروفيل
    const pulse = 0.9 + Math.sin(simState.t*1.5)*0.1;
    c.strokeStyle = dark?`rgba(74,222,128,${pulse})`:`rgba(21,128,61,${pulse})`;
    c.lineWidth = 3;
    for(let i=0;i<4;i++){
      const ang = (i/4)*Math.PI*2;
      c.beginPath(); c.arc(cx+Math.cos(ang)*R*0.7, cy+Math.sin(ang)*R*0.7, R*0.35, 0, Math.PI*2); c.stroke();
    }
    // Mg في المركز
    c.fillStyle = dark?'rgba(74,222,128,0.2)':'rgba(187,247,208,0.9)';
    c.beginPath(); c.arc(cx, cy, R*0.32, 0, Math.PI*2); c.fill();
    c.strokeStyle = dark?'#4ADE80':'#15803D'; c.lineWidth = 3;
    c.beginPath(); c.arc(cx, cy, R*0.32, 0, Math.PI*2); c.stroke();
    c.fillStyle = dark?'#4ADE80':'#15803D'; c.font = `bold ${Math.round(R*0.55)}px Tajawal`; c.textAlign='center';
    c.fillText('Mg²⁺', cx, cy + R*0.13);
    // تسمية
    c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
    c.fillText('جزيء الكلوروفيل', w/2, h*0.67);
    c.fillStyle = bioMut(); c.font = `${Math.round(h*0.027)}px Tajawal`;
    c.fillText('الماغنيسيوم في مركز كل جزيء', w/2, h*0.74);
    // مقارنة ورقة
    c.fillStyle = dark?'rgba(74,222,128,0.6)':'rgba(134,239,172,0.8)';
    c.beginPath(); c.ellipse(w*0.2, h*0.84, w*0.1, h*0.045, 0.4, 0, Math.PI*2); c.fill();
    c.fillStyle = dark?'#4ADE80':'#15803D'; c.font = `${Math.round(h*0.025)}px Tajawal`; c.textAlign='center';
    c.fillText('مع Mg²⁺ ✓', w*0.2, h*0.9);
    c.fillStyle = dark?'rgba(253,230,138,0.7)':'rgba(254,240,138,0.85)';
    c.beginPath(); c.ellipse(w*0.8, h*0.84, w*0.1, h*0.045, 0.4, 0, Math.PI*2); c.fill();
    c.fillStyle = dark?'#FCD34D':'#B45309'; c.font = `${Math.round(h*0.025)}px Tajawal`; c.textAlign='center';
    c.fillText('بدون Mg²⁺ ✗', w*0.8, h*0.9);
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG9Bio7N9c(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0, answers: {}, checked: false };
  const questions = [
    { q: 'أي أيون يحتاجه النبات لصنع البروتين؟', opts: ['NO₃⁻ (النترات)', 'Mg²⁺ (الماغنيسيوم)', 'K⁺ (البوتاسيوم)'], ans: 0 },
    { q: 'ما علامة نقص الماغنيسيوم في النبات؟', opts: ['تساقط الأوراق', 'اصفرار الأوراق مع عروق خضراء', 'توقف النمو'], ans: 1 },
    { q: 'كيف يصل النيتروجين إلى النبات؟', opts: ['من الهواء مباشرة', 'عبر الضوء', 'عبر أيونات النترات من التربة'], ans: 2 },
  ];
  let html = `<div class="ctrl-section"><div class="ctrl-label">🔬 اختبر فهمك: الأملاح المعدنية</div>`;
  questions.forEach((q, qi) => {
    html += `<div style="margin:12px 0;padding:10px;background:var(--bg-card2);border-radius:10px">
      <div style="font-weight:700;margin-bottom:8px;font-size:14px">${qi+1}. ${q.q}</div>`;
    q.opts.forEach((opt, oi) => {
      html += `<label style="display:flex;align-items:center;gap:8px;margin:5px 0;cursor:pointer;padding:6px 8px;border-radius:8px;border:1.5px solid var(--border-color);background:var(--bg-q-opt)">
        <input type="radio" name="bio9q${qi}" value="${oi}" onchange="simState.answers[${qi}]=${oi}" style="width:16px;height:16px"> 
        <span style="font-size:13px">${opt}</span></label>`;
    });
    html += `</div>`;
  });
  html += `<button onclick="window._bio9check()" style="width:100%;padding:10px;margin-top:8px;border-radius:10px;background:#16A34A;color:white;font-family:Tajawal;font-weight:700;font-size:15px;border:none;cursor:pointer">✅ تحقق من إجاباتك</button>
  <div id="bio9_result" style="margin-top:8px;font-weight:700;text-align:center;font-size:15px;padding:8px"></div></div>`;
  controls(html);
  window._bio9check = () => {
    let score = 0;
    questions.forEach((q,i) => { if(simState.answers[i]===q.ans) score++; });
    const r = document.getElementById('bio9_result');
    if(r) r.innerHTML = score===3 ? '🎉 ممتاز! جميع الإجابات صحيحة' : `✅ ${score} من ${questions.length} صحيح — راجع الإجابات`;
  };
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n9'||currentTab!==2){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.01;
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = dm15();
    c.fillStyle = bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.045)}px Tajawal`; c.textAlign = 'center';
    c.fillText('مقارنة الأيونات المعدنية', w/2, h*0.1);
    const items = [
      { sym:'NO₃⁻', name:'النترات', use:'بناء البروتين والكلوروفيل', color:dark?'#4ADE80':'#15803D', x:0.28 },
      { sym:'Mg²⁺', name:'الماغنيسيوم', use:'مركز جزيء الكلوروفيل', color:dark?'#60A5FA':'#2563EB', x:0.72 },
    ];
    items.forEach(item => {
      const ix = w*item.x, iy = h*0.22, iw = w*0.3, ih = h*0.5;
      c.fillStyle = item.color + (dark?'22':'18');
      c.beginPath(); c.roundRect(ix-iw/2, iy, iw, ih, 14); c.fill();
      c.strokeStyle = item.color; c.lineWidth = 2.5;
      c.beginPath(); c.roundRect(ix-iw/2, iy, iw, ih, 14); c.stroke();
      c.fillStyle = item.color; c.font = `bold ${Math.round(h*0.055)}px Tajawal`; c.textAlign='center';
      c.fillText(item.sym, ix, iy+ih*0.22);
      c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.033)}px Tajawal`;
      c.fillText(item.name, ix, iy+ih*0.44);
      c.fillStyle = bioMut(); c.font = `${Math.round(h*0.026)}px Tajawal`;
      const words = item.use.split(' ');
      words.forEach((w2,wi) => {
        c.fillText(w2, ix, iy+ih*(0.58+wi*0.1));
      });
    });
    c.fillStyle = bioMut(); c.font = `${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText('استخدم اللوحة الجانبية للإجابة', w/2, h*0.88);
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════
   موضوع ٤-٧ · نقل السكروز (n10)
   تحويل الجلوكوز إلى سكروز ونقله عبر اللحاء
════════════════════════════════════════ */
function simG9Bio7N10a(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0 };
  controls(bioInfoPanel([
    '🍬 <strong>الجلوكوز</strong>: السكر المنتج مباشرة بالتمثيل الضوئي في الورقة',
    '🔄 <strong>لماذا يتحول إلى سكروز؟</strong>: الجلوكوز قابل للذوبان جداً ويتفاعل مع جزيئات أخرى',
    '📦 <strong>السكروز</strong>: سكر ثنائي أكثر استقراراً وأقل تفاعلاً — مثالي للنقل',
    '🚌 السكروز صغير الحجم ويذوب في الماء بسهولة → مناسب للنقل عبر أنابيب اللحاء',
  ], '🍬 لماذا نقل الجلوكوز إلى سكروز؟'));
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n10'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.018;
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = dm15();
    c.fillStyle = bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.042)}px Tajawal`; c.textAlign = 'center';
    c.fillText('تحويل الجلوكوز → سكروز للنقل', w/2, h*0.09);
    // جلوكوز
    const g1x = w*0.22, g1y = h*0.28, gR = h*0.1;
    c.fillStyle = dark?'rgba(253,224,71,0.25)':'rgba(254,240,138,0.9)';
    c.beginPath(); c.arc(g1x, g1y, gR, 0, Math.PI*2); c.fill();
    c.strokeStyle = dark?'#FCD34D':'#CA8A04'; c.lineWidth=2.5;
    c.beginPath(); c.arc(g1x, g1y, gR, 0, Math.PI*2); c.stroke();
    c.fillStyle = dark?'#FCD34D':'#92400E'; c.font=`bold ${Math.round(gR*0.55)}px Tajawal`; c.textAlign='center';
    c.fillText('C₆H₁₂O₆', g1x, g1y+gR*0.2);
    c.fillStyle = bioMut(); c.font=`${Math.round(h*0.025)}px Tajawal`;
    c.fillText('جلوكوز', g1x, g1y+gR+h*0.05);
    c.fillStyle = dark?'#FCA5A5':'#DC2626'; c.font=`${Math.round(h*0.022)}px Tajawal`;
    c.fillText('⚠️ عالي التفاعل', g1x, g1y+gR+h*0.09);
    // + جلوكوز ثاني
    const g2x = w*0.42;
    c.fillStyle = dark?'rgba(253,224,71,0.25)':'rgba(254,240,138,0.9)';
    c.beginPath(); c.arc(g2x, g1y, gR, 0, Math.PI*2); c.fill();
    c.strokeStyle = dark?'#FCD34D':'#CA8A04'; c.lineWidth=2.5;
    c.beginPath(); c.arc(g2x, g1y, gR, 0, Math.PI*2); c.stroke();
    c.fillStyle = dark?'#FCD34D':'#92400E'; c.font=`bold ${Math.round(gR*0.55)}px Tajawal`; c.textAlign='center';
    c.fillText('C₆H₁₂O₆', g2x, g1y+gR*0.2);
    c.fillStyle = bioMut(); c.font=`${Math.round(h*0.025)}px Tajawal`;
    c.fillText('جلوكوز', g2x, g1y+gR+h*0.05);
    // إشارة +
    c.fillStyle = bioTxt(); c.font=`bold ${Math.round(h*0.06)}px Arial`; c.textAlign='center';
    c.fillText('+', w*0.32, g1y+h*0.01);
    // سهم التحويل
    const arrowX = w*0.52;
    c.strokeStyle = dark?'#86EFAC':'#15803D'; c.lineWidth=3;
    c.beginPath(); c.moveTo(arrowX, g1y); c.lineTo(arrowX+w*0.12, g1y); c.stroke();
    c.fillStyle = dark?'#86EFAC':'#15803D';
    c.beginPath(); c.moveTo(arrowX+w*0.12, g1y-h*0.018); c.lineTo(arrowX+w*0.12+w*0.025, g1y); c.lineTo(arrowX+w*0.12, g1y+h*0.018); c.fill();
    c.fillStyle = bioMut(); c.font=`${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
    c.fillText('إنزيم', arrowX+w*0.06, g1y-h*0.03);
    c.fillText('− ماء', arrowX+w*0.06, g1y+h*0.038);
    // سكروز ناتج
    const sx = w*0.79, sy = h*0.28, sR = h*0.115;
    const pulse = 0.85+Math.sin(simState.t*1.8)*0.15;
    c.fillStyle = dark?`rgba(74,222,128,${pulse*0.3})`:`rgba(187,247,208,${pulse*0.95})`;
    c.beginPath(); c.arc(sx, sy, sR, 0, Math.PI*2); c.fill();
    c.strokeStyle = dark?`rgba(74,222,128,${pulse})`:`rgba(21,128,61,${pulse})`; c.lineWidth=3;
    c.beginPath(); c.arc(sx, sy, sR, 0, Math.PI*2); c.stroke();
    c.fillStyle = dark?'#4ADE80':'#15803D'; c.font=`bold ${Math.round(sR*0.48)}px Tajawal`; c.textAlign='center';
    c.fillText('C₁₂H₂₂O₁₁', sx, sy+sR*0.2);
    c.fillStyle = bioMut(); c.font=`${Math.round(h*0.025)}px Tajawal`;
    c.fillText('سكروز', sx, sy+sR+h*0.05);
    c.fillStyle = dark?'#86EFAC':'#166534'; c.font=`${Math.round(h*0.022)}px Tajawal`;
    c.fillText('✅ مستقر وقابل للنقل', sx, sy+sR+h*0.09);
    // خط أنبوب اللحاء في الأسفل
    c.fillStyle = bioTxt(); c.font=`bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
    c.fillText('↓', w/2, h*0.73);
    c.fillStyle = dark?'rgba(74,222,128,0.2)':'rgba(187,247,208,0.8)';
    c.beginPath(); c.roundRect(w*0.1, h*0.78, w*0.8, h*0.1, 10); c.fill();
    c.strokeStyle = dark?'#4ADE80':'#15803D'; c.lineWidth=2;
    c.beginPath(); c.roundRect(w*0.1, h*0.78, w*0.8, h*0.1, 10); c.stroke();
    c.fillStyle = dark?'#4ADE80':'#15803D'; c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
    c.fillText('🚰 أنبوب اللحاء (Phloem tube) — ينقل السكروز', w/2, h*0.84);
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG9Bio7N10b(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0, particles: [] };
  for(let i=0;i<18;i++){
    simState.particles.push({ x: Math.random(), y: Math.random(), vy: 0.003+Math.random()*0.004, phase: Math.random()*Math.PI*2 });
  }
  controls(bioInfoPanel([
    '🌿 <strong>أنابيب اللحاء (Phloem tubes)</strong>: أنابيب رفيعة تنقل السكروز في جميع أنحاء النبات',
    '📍 <strong>مصدر النقل</strong>: الأوراق (حيث يصنع السكر) → بقية أجزاء النبات',
    '🎯 <strong>وجهات السكروز</strong>: الجذور، الثمار، البذور، الساق — أي خلية تحتاج طاقة',
    '🔄 السكروز يمكن تحويله إلى جلوكوز مرة أخرى في الخلية المستهدفة لإطلاق الطاقة',
  ], '🌿 أنابيب اللحاء وتوزيع السكر'));
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n10'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.018;
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = dm15();
    c.fillStyle = bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.038)}px Tajawal`; c.textAlign = 'center';
    c.fillText('أنابيب اللحاء — نقل السكروز', w/2, h*0.07);
    // رسم نبات مبسط: ورقة في الأعلى، ساق، جذور
    const stX = w*0.5, stTop = h*0.12, stBot = h*0.82, stW = w*0.045;
    // ساق
    c.fillStyle = dark?'rgba(134,239,172,0.25)':'rgba(187,247,208,0.7)';
    c.beginPath(); c.roundRect(stX-stW/2, stTop, stW, stBot-stTop, 8); c.fill();
    c.strokeStyle = dark?'#4ADE80':'#15803D'; c.lineWidth=2;
    c.beginPath(); c.roundRect(stX-stW/2, stTop, stW, stBot-stTop, 8); c.stroke();
    // ورقة
    c.fillStyle = dark?'rgba(74,222,128,0.6)':'rgba(134,239,172,0.85)';
    c.beginPath(); c.ellipse(stX, stTop+h*0.01, w*0.15, h*0.06, 0, 0, Math.PI*2); c.fill();
    c.strokeStyle = dark?'#4ADE80':'#15803D'; c.lineWidth=2;
    c.beginPath(); c.ellipse(stX, stTop+h*0.01, w*0.15, h*0.06, 0, 0, Math.PI*2); c.stroke();
    c.fillStyle = dark?'#4ADE80':'#166534'; c.font=`bold ${Math.round(h*0.027)}px Tajawal`; c.textAlign='center';
    c.fillText('☀️ ورقة — مصنع السكر', stX, stTop+h*0.065);
    // جذور
    [[-0.28,0.88],[0.28,0.88],[0,0.93],[-0.18,0.96],[0.18,0.97]].forEach(([dx,dy])=>{
      c.strokeStyle = dark?'rgba(134,239,172,0.4)':'rgba(21,128,61,0.5)'; c.lineWidth=3;
      c.beginPath(); c.moveTo(stX+dx*stW*1.5, stBot); c.bezierCurveTo(stX+dx*w*0.18, h*dy, stX+dx*w*0.25, h*(dy+0.03), stX+dx*w*0.3, h*(dy+0.01)); c.stroke();
    });
    c.fillStyle = dark?'rgba(134,239,172,0.5)':'rgba(21,128,61,0.4)'; c.font=`${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText('جذور', stX, h*0.96);
    // تسميات لأجزاء النبات
    const labels = [
      {x:w*0.2, y:h*0.4, txt:'ثمار 🍎', col:dark?'#FCA5A5':'#DC2626'},
      {x:w*0.8, y:h*0.55, txt:'بذور 🌰', col:dark?'#FCD34D':'#92400E'},
      {x:w*0.2, y:h*0.72, txt:'ساق 🌿', col:dark?'#86EFAC':'#15803D'},
    ];
    labels.forEach(l=>{
      c.fillStyle = l.col; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
      c.fillText(l.txt, l.x, l.y);
      c.strokeStyle = l.col+'88'; c.lineWidth=1.5; c.setLineDash([5,4]);
      c.beginPath(); c.moveTo(l.x+(l.x<stX?w*0.08:-w*0.08), l.y-h*0.01); c.lineTo(stX+(l.x<stX?stW/2:-stW/2), l.y); c.stroke();
      c.setLineDash([]);
    });
    // جسيمات السكروز تتحرك للأسفل
    simState.particles.forEach(p=>{
      p.y += p.vy;
      if(p.y > 1) p.y = 0.12;
      const px = stX + (Math.sin(p.phase + simState.t*0.5)*stW*0.3);
      const py = p.y * h;
      if(py > stTop && py < stBot){
        const r = Math.round(h*0.014);
        c.fillStyle = dark?'rgba(253,224,71,0.85)':'rgba(234,179,8,0.9)';
        c.beginPath(); c.arc(px, py, r, 0, Math.PI*2); c.fill();
        c.strokeStyle = dark?'#FCD34D':'#92400E'; c.lineWidth=1;
        c.beginPath(); c.arc(px, py, r, 0, Math.PI*2); c.stroke();
      }
    });
    c.fillStyle = dark?'#FCD34D':'#92400E'; c.font=`${Math.round(h*0.023)}px Tajawal`; c.textAlign='center';
    c.fillText('● سكروز يتحرك عبر اللحاء', stX+w*0.22, h*0.35);
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG9Bio7N10c(){
  cancelAnimationFrame(animFrame);
  simState = { t: 0, selected: null };
  const destinations = [
    { id:'growth', label:'النمو والتكاثر', emoji:'🌱', desc:'بناء خلايا جديدة في نقاط النمو', x:0.22, y:0.3 },
    { id:'fruit', label:'الثمار والبذور', emoji:'🍎', desc:'تخزين الطاقة في الثمار والبذور', x:0.78, y:0.3 },
    { id:'roots', label:'الجذور', emoji:'🌿', desc:'تخزين السكر وبناء الجذور', x:0.22, y:0.7 },
    { id:'energy', label:'إنتاج الطاقة', emoji:'⚡', desc:'التنفس الخلوي في جميع الخلايا', x:0.78, y:0.7 },
  ];
  let html = `<div class="ctrl-section"><div class="ctrl-label">🔄 مصير الجلوكوز في النبات</div>`;
  destinations.forEach(d=>{
    html += `<div onclick="simState.selected='${d.id}'; document.querySelectorAll('.dest-btn').forEach(b=>b.style.background='var(--bg-ctrl-btn)'); this.style.background='var(--bg-info-box)'" class="dest-btn" style="display:flex;align-items:center;gap:10px;margin:7px 0;padding:8px 10px;border-radius:10px;border:1.5px solid var(--border-color);background:var(--bg-ctrl-btn);cursor:pointer">
      <span style="font-size:20px">${d.emoji}</span>
      <div><div style="font-weight:700;font-size:13px">${d.label}</div><div style="font-size:12px;color:var(--text-secondary)">${d.desc}</div></div>
    </div>`;
  });
  html += `</div>`;
  controls(html);
  const cv = document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio7n10'||currentTab!==2){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.015;
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, dark = dm15();
    c.fillStyle = bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle = bioTxt(); c.font = `bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign = 'center';
    c.fillText('مصير الجلوكوز الناتج عن التمثيل الضوئي', w/2, h*0.08);
    // مركز: جلوكوز
    const cx2 = w*0.5, cy2 = h*0.5;
    const pulse2 = 0.8+Math.sin(simState.t*2)*0.2;
    c.fillStyle = dark?`rgba(253,224,71,${pulse2*0.3})`:`rgba(254,240,138,${pulse2*0.9})`;
    c.beginPath(); c.arc(cx2, cy2, h*0.1, 0, Math.PI*2); c.fill();
    c.strokeStyle = dark?`rgba(253,224,71,${pulse2})`:`rgba(202,138,4,${pulse2})`; c.lineWidth=3;
    c.beginPath(); c.arc(cx2, cy2, h*0.1, 0, Math.PI*2); c.stroke();
    c.fillStyle = dark?'#FCD34D':'#92400E'; c.font=`bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
    c.fillText('جلوكوز', cx2, cy2-h*0.015);
    c.fillStyle = bioMut(); c.font=`${Math.round(h*0.023)}px Tajawal`;
    c.fillText('C₆H₁₂O₆', cx2, cy2+h*0.03);
    // وجهات
    destinations.forEach(d=>{
      const dx = d.x*w, dy2 = d.y*h;
      const isSelected = simState.selected===d.id;
      // خط
      const lineAlpha = isSelected ? 0.9 : 0.35+Math.sin(simState.t+d.x*3)*0.15;
      c.strokeStyle = dark?`rgba(74,222,128,${lineAlpha})`:`rgba(21,128,61,${lineAlpha})`; c.lineWidth = isSelected?3:1.5;
      c.setLineDash(isSelected?[]:[6,4]);
      c.beginPath(); c.moveTo(cx2,cy2); c.lineTo(dx,dy2); c.stroke();
      c.setLineDash([]);
      // دائرة الوجهة
      c.fillStyle = isSelected ? (dark?'rgba(74,222,128,0.3)':'rgba(187,247,208,0.9)') : (dark?'rgba(74,222,128,0.1)':'rgba(220,252,231,0.6)');
      c.beginPath(); c.arc(dx,dy2,h*0.07,0,Math.PI*2); c.fill();
      c.strokeStyle = dark?'#4ADE80':'#15803D'; c.lineWidth=isSelected?2.5:1.5;
      c.beginPath(); c.arc(dx,dy2,h*0.07,0,Math.PI*2); c.stroke();
      c.font=`${Math.round(h*0.055)}px serif`; c.textAlign='center';
      c.fillText(d.emoji, dx, dy2-h*0.007);
      c.fillStyle = dark?'#D1FAE5':'#065F46'; c.font=`bold ${Math.round(h*0.024)}px Tajawal`;
      c.fillText(d.label, dx, dy2+h*0.055);
    });
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}


/* ═══════════════════════════════════════════════════════════════
   الوحدة الثامنة — الهضم في الإنسان
   8 استقصاءات × 3 تبويبات = 24 دالة
═══════════════════════════════════════════════════════════════ */

/* helpers مشتركة مع الوحدة السابعة (bioBg, bioTxt …) */

/* ════════ نشاط ١-٨ · مراحل الهضم ════════ */

/* ═══════════════════════════════════════════════════════════════
   الوحدة الثامنة — الهضم في الإنسان  (نسخة مُحسَّنة بالرسوم الكاملة)
   8 استقصاءات × 3 تبويبات = 24 دالة
═══════════════════════════════════════════════════════════════ */

/* ─── أدوات رسم مشتركة ─── */
function drawRoundedRect(c,x,y,w,h,r,fill,stroke,lw){
  c.beginPath();c.roundRect(x,y,w,h,r);
  if(fill){c.fillStyle=fill;c.fill();}
  if(stroke){c.strokeStyle=stroke;c.lineWidth=lw||2;c.stroke();}
}
function drawArrow(c,x1,y1,x2,y2,col,lw,headSize){
  const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);
  if(len<1)return;
  const ux=dx/len,uy=dy/len,hs=headSize||12;
  c.strokeStyle=col;c.lineWidth=lw||2.5;
  c.beginPath();c.moveTo(x1,y1);c.lineTo(x2-ux*hs*0.7,y2-uy*hs*0.7);c.stroke();
  c.fillStyle=col;c.beginPath();
  c.moveTo(x2,y2);
  c.lineTo(x2-ux*hs+uy*hs*0.5,y2-uy*hs-ux*hs*0.5);
  c.lineTo(x2-ux*hs-uy*hs*0.5,y2-uy*hs+ux*hs*0.5);
  c.closePath();c.fill();
}
function drawLabel(c,text,x,y,col,size,align){
  c.fillStyle=col;c.font=`bold ${size}px Tajawal`;c.textAlign=align||'center';c.fillText(text,x,y);
}
function drawSmallLabel(c,text,x,y,col,size,align){
  c.fillStyle=col;c.font=`${size||13}px Tajawal`;c.textAlign=align||'center';c.fillText(text,x,y);
}

/* ════════════════════════════════════════════════
   نشاط ١-٨ · مراحل الهضم
════════════════════════════════════════════════ */
function simG9Bio8N1a(){
  cancelAnimationFrame(animFrame);
  simState={t:0, activeStage:-1};

  const stagesInfo=[
    {label:'١. الابتلاع',en:'Ingestion', col:'#3B82F6', organ:'mouth',
     detail:'إدخال الطعام عبر الفم — الأسنان تقطع ميكانيكياً واللعاب يرطّبه ويبدأ أميليز اللعاب هضم النشا'},
    {label:'٢. الهضم',en:'Digestion', col:'#10B981', organ:'stomach',
     detail:'تفكيك جزيئات الطعام الكبيرة إلى صغيرة — يشمل الهضم الميكانيكي (تقلصات المعدة) والكيميائي (HCl + أنزيمات البنكرياس)'},
    {label:'٣. الامتصاص',en:'Absorption', col:'#F59E0B', organ:'smallIntestine',
     detail:'جزيئات صغيرة (جلوكوز، أحماض أمينية، دهون) تعبر جدار الأمعاء الدقيقة → الدم عبر الخملات'},
    {label:'٤. التبرّز',en:'Egestion', col:'#EF4444', organ:'rectum',
     detail:'طرح الفضلات غير المهضومة — الأمعاء الغليظة تمتص الماء أولاً وتُشكِّل البراز ثم يُطرح'},
  ];

  controls(`<div class="ctrl-section">
    <div class="ctrl-label">🔄 مراحل الهضم الأربع</div>
    <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:8px">انقري على مرحلة أو على العضو في الجسم</div>
    <div style="display:flex;flex-direction:column;gap:6px">
      ${stagesInfo.map((s,i)=>`<button onclick="simState.activeStage=${i}" id="stage_btn_${i}"
        style="padding:8px 10px;border-radius:9px;border:2px solid ${s.col}44;background:var(--bg-ctrl-btn);
        font-family:Tajawal;font-size:13px;cursor:pointer;text-align:right;transition:all 0.2s">
        <span style="color:${s.col};font-weight:700">${s.label}</span>
        <span style="color:var(--text-secondary);font-size:11px"> — ${s.en}</span>
      </button>`).join('')}
    </div>
    <div id="bio8_stage_info" style="margin-top:8px;padding:12px;border-radius:10px;background:var(--bg-card2);
      font-size:12.5px;line-height:1.8;min-height:70px;transition:all 0.3s">
      ← انقري على مرحلة لرؤية تفاصيلها
    </div>
  </div>`);

  const cv=document.getElementById('simCanvas');
  cv.onclick=function(e){
    const rect=cv.getBoundingClientRect();
    const mx=(e.clientX-rect.left)*(cv.width/rect.width);
    const my=(e.clientY-rect.top)*(cv.height/rect.height);
    const found=findOrganAtClick(mx,my,cv.width,cv.height);
    if(found){
      const idx=stagesInfo.findIndex(s=>s.organ===found);
      if(idx>=0) simState.activeStage=idx;
    }
  };

  let lastStage=-1;
  function draw(){
    if(currentSim!=='g9bio8n1'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.016;
    if(simState.activeStage!==lastStage){
      lastStage=simState.activeStage;
      const s=stagesInfo[simState.activeStage];
      if(s){
        const el=document.getElementById('bio8_stage_info');
        if(el) el.innerHTML=`<strong style="color:${s.col}">${s.label}:</strong><br>${s.detail}`;
        stagesInfo.forEach((_,i)=>{
          const btn=document.getElementById(`stage_btn_${i}`);
          if(btn){btn.style.background=i===simState.activeStage?stagesInfo[i].col+'33':'var(--bg-ctrl-btn)';
            btn.style.borderColor=i===simState.activeStage?stagesInfo[i].col:stagesInfo[i].col+'44';}
        });
      }
    }
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,dark=dm15();
    c.fillStyle=bioBg();c.fillRect(0,0,w,h);
    drawLabel(c,'مراحل الهضم الأربع — انقري على عضو',w/2,h*0.05,bioTxt(),Math.round(h*0.033));

    const sel=simState.activeStage>=0?stagesInfo[simState.activeStage].organ:null;
    drawAnatomicalBody(c,w,h,dark);
    drawAnatomicalOrgans(c,w,h,simState.t,sel,dark);
    drawAnatomicalLabels(c,w,h,sel,dark);

    const bw=w*0.2, bh=h*0.08, by=h*0.88;
    stagesInfo.forEach((s,i)=>{
      const bx=w*(0.05+i*0.24);
      const isActive=simState.activeStage===i;
      const pulse=isActive?1+Math.sin(simState.t*2.5)*0.04:1;
      c.fillStyle=s.col+(isActive?'44':'18');
      c.beginPath();c.roundRect(bx,by,bw*pulse,bh,8);c.fill();
      c.strokeStyle=s.col;c.lineWidth=isActive?2.5:1.5;c.stroke();
      c.fillStyle=s.col;c.font=`bold ${Math.round(h*0.022)}px Tajawal`;c.textAlign='center';
      c.fillText(s.label,bx+bw/2,by+bh*0.45);
      c.fillStyle=dark?'#9CA3AF':'#6B7280';c.font=`${Math.round(h*0.018)}px Tajawal`;
      c.fillText(s.en,bx+bw/2,by+bh*0.78);
    });

    const fp=(simState.t*0.05)%1;
    const path=[
      {x:w*0.54,y:h*0.12},{x:w*0.49,y:h*0.25},{x:w*0.38,y:h*0.44},
      {x:w*0.48,y:h*0.63},{x:w*0.24,y:h*0.62},{x:w*0.49,y:h*0.83},
    ];
    const seg=Math.min(Math.floor(fp*(path.length-1)),path.length-2);
    const fr=(fp*(path.length-1))-seg;
    const fx=path[seg].x+(path[seg+1].x-path[seg].x)*fr;
    const fy=path[seg].y+(path[seg+1].y-path[seg].y)*fr;
    c.fillStyle='#FCD34D';c.beginPath();c.arc(fx,fy,h*0.015,0,Math.PI*2);c.fill();

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}
function simG9Bio8N1b(){
  cancelAnimationFrame(animFrame);
  simState={t:0,step:0};

  const steps=[
    {
      place:'خارج الجسم',
      col:'#6B7280',
      detail:'الثعلب يرى وجبته — الجهاز الهضمي يستعد: تزداد إفرازات اللعاب والمعدة استجابةً للرائحة والمنظر',
      drawFn: function(c,w,h,t,col){const dark=dm15();
        // ثعلب يتطلع للطعام
        drawFoxBody(c,w*0.3,h*0.5,h*0.18,col,0,t);
        // طعام أمامه
        c.font=`${Math.round(h*0.1)}px serif`;c.textAlign='center';c.fillText('🐇',w*0.65,h*0.52);
        // خطوط شم
        for(let i=0;i<4;i++){
          const sx=w*0.52-i*w*0.03,sy=h*(0.42-i*0.05);
          c.strokeStyle=col+(Math.round((1-i*0.2)*200).toString(16).padStart(2,'0'));
          c.lineWidth=1.5;c.setLineDash([3,3]);
          c.beginPath();c.moveTo(sx,sy);c.bezierCurveTo(sx-w*0.04,sy-h*0.03,sx-w*0.06,sy-h*0.02,w*0.3+h*0.1,h*0.45);c.stroke();
          c.setLineDash([]);
        }
        drawLabel(c,'الثعلب يشم رائحة الطعام',w/2,h*0.82,col,Math.round(h*0.028));
        drawSmallLabel(c,'الجهاز الهضمي يستعد للاستقبال',w/2,h*0.9,dark?'#9CA3AF':'#6B7280',Math.round(h*0.023));
      }
    },
    {
      place:'١. الابتلاع',
      col:'#3B82F6',
      detail:'الثعلب يأكل — الأسنان الحادة تمزّق اللحم ميكانيكياً. اللعاب يرطّب الطعام ويبدأ أميليز اللعاب هضم أي نشا. تتشكّل البلعة وتنزل عبر المريء',
      drawFn: function(c,w,h,t,col){const dark=dm15();
        drawFoxBody(c,w*0.28,h*0.48,h*0.18,col,1,t);
        // فم مفتوح مع طعام
        c.font=`${Math.round(h*0.07)}px serif`;c.textAlign='center';c.fillText('🍖',w*0.55,h*0.46);
        // سهم إلى الفم
        drawArrow(c,w*0.5,h*0.46,w*0.38+h*0.1,h*0.44,col,3,10);
        // مريء
        c.strokeStyle=col+'88';c.lineWidth=8;
        c.beginPath();c.moveTo(w*0.28,h*0.58);c.bezierCurveTo(w*0.3,h*0.65,w*0.32,h*0.7,w*0.35,h*0.75);c.stroke();
        // بلعة تنزل
        const bp=((t*0.5)%1);
        const bpx=w*0.28+bp*w*0.07,bpy=h*0.58+bp*h*0.17;
        c.fillStyle='#FCD34D';c.beginPath();c.arc(bpx,bpy,h*0.018,0,Math.PI*2);c.fill();
        // اللعاب
        c.fillStyle=col+'44';
        for(let i=0;i<5;i++){c.beginPath();c.arc(w*(0.31+i*0.025),h*0.55,h*0.008,0,Math.PI*2);c.fill();}
        drawLabel(c,'الابتلاع والبلع',w/2,h*0.82,col,Math.round(h*0.028));
        drawSmallLabel(c,'أسنان + لعاب (أميليز) → بلعة تنزل للمعدة',w/2,h*0.9,dark?'#9CA3AF':'#6B7280',Math.round(h*0.022));
      }
    },
    {
      place:'٢. الهضم',
      col:'#10B981',
      detail:'الكيموس يتشكّل في المعدة: حمض HCl يقتل البكتيريا، البيبسين يبدأ هضم البروتين. ثم الأمعاء الدقيقة تُكمل الهضم بأنزيمات البنكرياس والعصارة الصفراوية',
      drawFn: function(c,w,h,t,col){const dark=dm15();
        // معدة ثعلب
        drawFoxBody(c,w*0.15,h*0.45,h*0.15,col,2,t);
        // رسم معدة داخلية
        const mx=w*0.55,my=h*0.38,mw=w*0.28,mh=h*0.28;
        c.fillStyle=col+'22';
        c.beginPath();
        c.moveTo(mx-mw*0.45,my+mh*0.1);
        c.bezierCurveTo(mx-mw*0.55,my,mx-mw*0.55,my+mh*0.7,mx-mw*0.2,my+mh*0.85);
        c.bezierCurveTo(mx+mw*0.1,my+mh*0.95,mx+mw*0.5,my+mh*0.6,mx+mw*0.45,my+mh*0.1);
        c.bezierCurveTo(mx+mw*0.35,my-mh*0.15,mx+mw*0.0,my-mh*0.15,mx-mw*0.45,my+mh*0.1);
        c.closePath();c.fill();
        c.strokeStyle=col;c.lineWidth=2.5;c.stroke();
        // موجات هضم
        for(let i=0;i<3;i++){
          const wave=Math.sin(t*3+i*1.2)*mh*0.05;
          c.strokeStyle=col+(Math.round(180-i*40).toString(16).padStart(2,'0'));
          c.lineWidth=1.5;c.beginPath();
          c.moveTo(mx-mw*0.35,my+mh*0.3+i*mh*0.18+wave);
          c.bezierCurveTo(mx-mw*0.1,my+mh*0.25+i*mh*0.18,mx+mw*0.1,my+mh*0.35+i*mh*0.18,mx+mw*0.3,my+mh*0.3+i*mh*0.18+wave);
          c.stroke();
        }
        // تسميات كيميائية
        c.fillStyle=col;c.font=`bold ${Math.round(h*0.022)}px Tajawal`;c.textAlign='center';
        c.fillText('HCl + بيبسين',mx,my+mh+h*0.05);
        // أمعاء دقيقة
        c.strokeStyle=col+'66';c.lineWidth=6;
        c.beginPath();c.moveTo(mx,my+mh*0.9);
        for(let i=0;i<5;i++)c.lineTo(mx+(i%2===0?mw*0.2:-mw*0.1),my+mh+h*0.08+i*h*0.05);
        c.stroke();
        drawLabel(c,'الهضم في المعدة والأمعاء',w/2,h*0.83,col,Math.round(h*0.027));
        drawSmallLabel(c,'HCl + أنزيمات = هضم كيميائي كامل',w/2,h*0.9,dark?'#9CA3AF':'#6B7280',Math.round(h*0.022));
      }
    },
    {
      place:'٣. الامتصاص',
      col:'#F59E0B',
      detail:'الخملات تمتص الجلوكوز والأحماض الأمينية عبر الشعيرات الدموية → الدم ينقلها للكبد ثم لخلايا الجسم. الدهون تُمتص في الأوعية اللمفاوية',
      drawFn: function(c,w,h,t,col){const dark=dm15();
        drawFoxBody(c,w*0.15,h*0.48,h*0.15,col,3,t);
        // قطاع عرضي لجدار الأمعاء
        const ix=w*0.42,iy=h*0.22,iw=w*0.52,ih=h*0.52;
        c.fillStyle=col+'15';c.beginPath();c.roundRect(ix,iy,iw,ih,12);c.fill();
        c.strokeStyle=col;c.lineWidth=2;c.beginPath();c.roundRect(ix,iy,iw,ih,12);c.stroke();
        drawLabel(c,'قطاع عرضي — جدار الأمعاء الدقيقة',ix+iw/2,iy-h*0.02,dark?'#9CA3AF':'#6B7280',Math.round(h*0.02));
        // خملات
        const numV=7;
        for(let vi=0;vi<numV;vi++){
          const vx=ix+iw*(0.07+vi*(0.86/numV));
          const vh2=ih*0.45;
          const vtop=iy+ih*0.05;
          // جسم الخملة
          c.fillStyle=col+'44';
          c.beginPath();c.moveTo(vx-iw*0.035,vtop+vh2);c.lineTo(vx-iw*0.02,vtop);c.lineTo(vx+iw*0.02,vtop);c.lineTo(vx+iw*0.035,vtop+vh2);c.closePath();c.fill();
          c.strokeStyle=col;c.lineWidth=1.5;c.stroke();
          // زغيبات
          for(let z=0;z<5;z++){
            const zx=vx+(-2+z)*iw*0.008;
            c.strokeStyle=col;c.lineWidth=1.2;c.beginPath();c.moveTo(zx,vtop);c.lineTo(zx,vtop-ih*0.06);c.stroke();
          }
          // وعاء دموي
          c.strokeStyle='#EF4444';c.lineWidth=2;
          c.beginPath();c.moveTo(vx-iw*0.02,vtop+vh2*0.25);c.bezierCurveTo(vx-iw*0.01,vtop+vh2*0.6,vx+iw*0.01,vtop+vh2*0.6,vx+iw*0.02,vtop+vh2*0.25);c.stroke();
        }
        // جزيئات متحركة تُمتص
        for(let p=0;p<6;p++){
          const pp=((t*0.4+p*0.17)%1);
          const pvx=ix+iw*(0.1+p*(0.13));
          const pvy=iy+ih*(0.6-pp*0.4);
          c.fillStyle=p%2===0?'#3B82F6':'#10B981';
          c.beginPath();c.arc(pvx,pvy,ih*0.025,0,Math.PI*2);c.fill();
        }
        // وعاء دم رئيسي
        c.fillStyle='#EF444422';c.beginPath();c.roundRect(ix,iy+ih*0.72,iw,ih*0.25,8);c.fill();
        c.strokeStyle='#EF4444';c.lineWidth=2;c.stroke();
        drawLabel(c,'🩸 الدم يحمل الغذاء المُمتَص',ix+iw/2,iy+ih*0.87,dark?'#F87171':'#DC2626',Math.round(h*0.023));
        drawLabel(c,'الامتصاص عبر الخملات',w/2,h*0.84,col,Math.round(h*0.027));
      }
    },
    {
      place:'٤. التبرّز',
      col:'#EF4444',
      detail:'الفضلات غير المهضومة (ألياف، خلايا ميتة، بكتيريا) تصل الأمعاء الغليظة — تُمتص منها الماء والأملاح، تتشكّل البراز وتُطرح عبر فتحة الشرج',
      drawFn: function(c,w,h,t,col){const dark=dm15();
        drawFoxBody(c,w*0.15,h*0.48,h*0.15,col,4,t);
        // قولون
        const qx=w*0.38,qy=h*0.2,qw=w*0.56,qh=h*0.58;
        // رسم القولون على شكل إطار
        c.strokeStyle=col;c.lineWidth=12;c.lineCap='round';c.lineJoin='round';
        c.beginPath();
        c.moveTo(qx+qw*0.1,qy);
        c.lineTo(qx+qw*0.9,qy);
        c.arcTo(qx+qw,qy,qx+qw,qy+qh*0.15,qh*0.12);
        c.lineTo(qx+qw,qy+qh*0.7);
        c.arcTo(qx+qw,qy+qh,qx+qw*0.6,qy+qh,qh*0.12);
        c.lineTo(qx+qw*0.5,qy+qh);
        c.stroke();
        c.lineWidth=10;
        c.beginPath();
        c.moveTo(qx+qw*0.5,qy);
        c.lineTo(qx,qy);
        c.arcTo(qx-qw*0.05,qy,qx-qw*0.05,qy+qh*0.3,qh*0.12);
        c.lineTo(qx-qw*0.05,qy+qh*0.5);
        c.arcTo(qx-qw*0.05,qy+qh,qx+qw*0.2,qy+qh,qh*0.12);
        c.stroke();
        // فضلات تتحرك داخل القولون
        for(let fi=0;fi<4;fi++){
          const fpos=((t*0.2+fi*0.25)%1);
          const fx=qx+qw*(0.15+fpos*0.65),fy=qy+h*0.04;
          c.fillStyle=col+'77';c.beginPath();c.arc(fx,fy,h*0.022,0,Math.PI*2);c.fill();
        }
        // سهم خروج
        drawArrow(c,qx+qw*0.5,qy+qh+h*0.02,qx+qw*0.5,qy+qh+h*0.1,col,4,12);
        drawLabel(c,'فتحة الشرج — طرح الفضلات',qx+qw*0.5,qy+qh+h*0.15,col,Math.round(h*0.025));
        // امتصاص ماء
        c.fillStyle='#60A5FA';c.font=`${Math.round(h*0.025)}px serif`;c.textAlign='right';
        c.fillText('💧 امتصاص الماء',qx+qw*0.9,qy+qh*0.45);
        drawLabel(c,'التبرّز — طرح الفضلات',w/2,h*0.84,col,Math.round(h*0.027));
        drawSmallLabel(c,'الأمعاء الغليظة تمتص الماء → يتشكّل البراز',w/2,h*0.91,dark?'#9CA3AF':'#6B7280',Math.round(h*0.022));
      }
    },
  ];

  function drawFoxBody(c,x,y,size,col,mood,t){
    // جسم الثعلب مرسوم بالكامل
    const s=size;
    // جسم
    c.fillStyle='#E67E22';
    c.beginPath();c.ellipse(x,y,s*0.55,s*0.4,-0.2,0,Math.PI*2);c.fill();
    // بطن أبيض
    c.fillStyle='#FDEBD0';
    c.beginPath();c.ellipse(x+s*0.05,y+s*0.05,s*0.3,s*0.25,-0.15,0,Math.PI*2);c.fill();
    // رأس
    c.fillStyle='#E67E22';
    c.beginPath();c.arc(x+s*0.55,y-s*0.15,s*0.32,0,Math.PI*2);c.fill();
    // خطم
    c.fillStyle='#FDEBD0';
    c.beginPath();c.ellipse(x+s*0.78,y-s*0.08,s*0.18,s*0.13,0.2,0,Math.PI*2);c.fill();
    c.fillStyle='#333';c.beginPath();c.arc(x+s*0.88,y-s*0.1,s*0.04,0,Math.PI*2);c.fill();
    // عين
    c.fillStyle='#1a1a1a';c.beginPath();c.arc(x+s*0.67,y-s*0.25,s*0.06,0,Math.PI*2);c.fill();
    c.fillStyle='white';c.beginPath();c.arc(x+s*0.69,y-s*0.27,s*0.02,0,Math.PI*2);c.fill();
    // أذن
    c.fillStyle='#E67E22';
    c.beginPath();c.moveTo(x+s*0.55,y-s*0.44);c.lineTo(x+s*0.48,y-s*0.65);c.lineTo(x+s*0.68,y-s*0.48);c.closePath();c.fill();
    c.fillStyle='#F39C12';
    c.beginPath();c.moveTo(x+s*0.57,y-s*0.46);c.lineTo(x+s*0.52,y-s*0.58);c.lineTo(x+s*0.64,y-s*0.49);c.closePath();c.fill();
    // ذيل
    c.fillStyle='#E67E22';
    c.beginPath();c.moveTo(x-s*0.5,y);c.bezierCurveTo(x-s*0.9,y-s*0.3,x-s*0.85,y-s*0.65,x-s*0.55,y-s*0.5);
    c.bezierCurveTo(x-s*0.75,y-s*0.3,x-s*0.7,y+s*0.1,x-s*0.5,y);c.closePath();c.fill();
    c.fillStyle='white';
    c.beginPath();c.arc(x-s*0.7,y-s*0.55,s*0.12,0,Math.PI*2);c.fill();
    // أرجل
    c.fillStyle='#E67E22';
    c.beginPath();c.ellipse(x-s*0.15,y+s*0.38,s*0.12,s*0.2,0.1,0,Math.PI*2);c.fill();
    c.beginPath();c.ellipse(x+s*0.2,y+s*0.38,s*0.12,s*0.2,0.1,0,Math.PI*2);c.fill();
  }

  controls(`<div class="ctrl-section">
    <div class="ctrl-label">🦊 رحلة الطعام في الثعلب</div>
    <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:8px">
      ${steps.map((s,i)=>`<button onclick="simState.step=${i}" id="fox_btn_${i}" style="padding:7px 10px;border-radius:8px;border:2px solid ${s.col}44;background:var(--bg-ctrl-btn);font-family:Tajawal;font-size:13px;cursor:pointer;text-align:right;transition:all 0.2s"><span style="color:${s.col};font-weight:700">${s.place}</span></button>`).join('')}
    </div>
    <div id="fox_info" style="padding:10px;border-radius:10px;background:var(--bg-card2);font-size:12.5px;line-height:1.8;min-height:70px">← اختاري مرحلة لرؤية تفاصيلها</div>
  </div>`);

  const cv=document.getElementById('simCanvas');
  let lastStep=-1;
  function draw(){
    if(currentSim!=='g9bio8n1'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.018;
    if(simState.step!==lastStep){
      lastStep=simState.step;
      const el=document.getElementById('fox_info');
      const s=steps[simState.step];
      if(el)el.innerHTML=`<strong style="color:${s.col}">${s.place}:</strong><br>${s.detail}`;
      steps.forEach((_,i)=>{
        const btn=document.getElementById(`fox_btn_${i}`);
        if(btn)btn.style.background=i===simState.step?steps[i].col+'33':'var(--bg-ctrl-btn)';
      });
    }
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,dark=dm15();
    c.fillStyle=bioBg();c.fillRect(0,0,w,h);
    const s=steps[simState.step];
    // خلفية ملونة طفيفة
    c.fillStyle=s.col+'0D';c.fillRect(0,0,w,h);
    // شريط تقدم
    c.fillStyle=dark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)';
    c.beginPath();c.roundRect(w*0.05,h*0.04,w*0.9,h*0.04,6);c.fill();
    c.fillStyle=s.col+'BB';
    c.beginPath();c.roundRect(w*0.05,h*0.04,w*0.9*((simState.step+1)/steps.length),h*0.04,6);c.fill();
    drawLabel(c,s.place,w/2,h*0.14,s.col,Math.round(h*0.038));
    s.drawFn(c,w,h,simState.t,s.col);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG9Bio8N1c(){
  cancelAnimationFrame(animFrame);
  simState={t:0,drag:null,placed:{},checked:false};

  const stages=[
    {id:'ingest',label:'الابتلاع',col:'#3B82F6'},
    {id:'digest',label:'الهضم',col:'#10B981'},
    {id:'absorb',label:'الامتصاص',col:'#F59E0B'},
    {id:'egest',label:'التبرّز',col:'#EF4444'},
  ];
  const scenarios=[
    {text:'الأسنان تقطع الطبق',ans:'ingest'},
    {text:'أميليز البنكرياس يعمل',ans:'digest'},
    {text:'الجلوكوز يدخل الدم',ans:'absorb'},
    {text:'الفضلات تُطرح',ans:'egest'},
    {text:'اللعاب يرطّب الطعام',ans:'ingest'},
    {text:'الخملات تمتص الأحماض الأمينية',ans:'absorb'},
  ];

  let html=`<div class="ctrl-section"><div class="ctrl-label">🎯 اختبر فهمك: صنِّفي كل سيناريو</div>`;
  scenarios.forEach((sc,i)=>{
    html+=`<div style="margin:6px 0;padding:8px;background:var(--bg-card2);border-radius:8px;border:1.5px solid var(--border-color)">
      <div style="font-size:12.5px;font-weight:700;margin-bottom:5px">${i+1}. ${sc.text}</div>
      <select id="sc_${i}" style="width:100%;padding:5px;border-radius:6px;border:1px solid var(--border-color);background:var(--bg-ctrl-btn);font-family:Tajawal;font-size:12px">
        <option value="">اختاري المرحلة...</option>
        ${stages.map(s=>`<option value="${s.id}">${s.label}</option>`).join('')}
      </select>
    </div>`;
  });
  html+=`<button onclick="window._b8n1c_check()" style="width:100%;padding:9px;margin-top:6px;border-radius:10px;background:#E67E22;color:white;font-family:Tajawal;font-weight:700;font-size:14px;border:none;cursor:pointer">✅ تحقق</button>
  <div id="b8n1c_res" style="margin-top:8px;font-size:12px;padding:8px;border-radius:8px;background:var(--bg-card2)"></div></div>`;
  controls(html);

  window._b8n1c_check=()=>{
    let sc=0;
    const msgs=[];
    scenarios.forEach((s,i)=>{
      const sel=document.getElementById(`sc_${i}`);
      const val=sel?sel.value:'';
      const correct=val===s.ans;
      if(correct)sc++;
      else msgs.push(`<span style="color:#EF4444">✗ رقم ${i+1}: الصحيح هو ${stages.find(st=>st.id===s.ans)?.label}</span>`);
      if(sel)sel.style.border=`2px solid ${correct?'#10B981':'#EF4444'}`;
    });
    const el=document.getElementById('b8n1c_res');
    if(el)el.innerHTML=sc===scenarios.length?`🎉 <strong style="color:#10B981">ممتاز! جميع إجاباتك صحيحة (${sc}/${scenarios.length})</strong>`:`<strong>نتيجتك: ${sc}/${scenarios.length}</strong><br>${msgs.join('<br>')}`;
  };

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio8n1'||currentTab!==2){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.012;
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,dark=dm15();
    c.fillStyle=bioBg();c.fillRect(0,0,w,h);
    drawLabel(c,'مراحل الهضم الأربع — مرجع سريع',w/2,h*0.1,bioTxt(),Math.round(h*0.038));
    stages.forEach((s,i)=>{
      const bx=w*(0.05+i*0.24),by=h*0.22,bw=w*0.2,bh=h*0.62;
      c.fillStyle=s.col+'18';c.beginPath();c.roundRect(bx,by,bw,bh,12);c.fill();
      c.strokeStyle=s.col;c.lineWidth=2;c.beginPath();c.roundRect(bx,by,bw,bh,12);c.stroke();
      // أيقونة
      c.font=`${Math.round(h*0.08)}px serif`;c.textAlign='center';
      c.fillText(['👄','⚙️','🩸','🚪'][i],bx+bw/2,by+bh*0.32);
      drawLabel(c,s.label,bx+bw/2,by+bh*0.53,s.col,Math.round(h*0.026));
      // رقم
      c.fillStyle=s.col+'44';c.beginPath();c.arc(bx+bw*0.85,by+h*0.04,h*0.03,0,Math.PI*2);c.fill();
      c.fillStyle=s.col;c.font=`bold ${Math.round(h*0.028)}px Tajawal`;c.textAlign='center';c.fillText(`${i+1}`,bx+bw*0.85,by+h*0.05);
    });
    drawSmallLabel(c,'أجيبي على الأسئلة في اللوحة الجانبية',w/2,h*0.9,dark?'#9CA3AF':'#6B7280',Math.round(h*0.026));
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════════════
   نشاط ٢-٨ · الهضم الميكانيكي والكيميائي
════════════════════════════════════════════════ */
function simG9Bio8N2a(){
  cancelAnimationFrame(animFrame);
  simState={t:0,showSmall:false};

  controls(`<div class="ctrl-section">
    <div class="ctrl-label">🦷 الهضم الميكانيكي</div>
    <div style="font-size:13px;color:var(--text-secondary);margin-bottom:10px;line-height:1.7">تفكيك الطعام إلى أجزاء صغيرة <strong>دون تغيير تركيبه الكيميائي</strong></div>
    <button onclick="simState.showSmall=!simState.showSmall" style="width:100%;padding:10px;border-radius:10px;background:#2563EB;color:white;font-family:Tajawal;font-weight:700;font-size:14px;border:none;cursor:pointer">🦷 تقطيع الطعام</button>
    <div style="margin-top:12px;display:grid;grid-template-columns:1fr;gap:7px">
      <div style="padding:9px;background:rgba(37,99,235,0.1);border-radius:8px;border:1px solid rgba(37,99,235,0.3);font-size:12.5px;line-height:1.7">
        <strong style="color:#2563EB">✓ أمثلة الهضم الميكانيكي:</strong><br>
        • أسنان القاطعة: تقطع وتمزّق<br>
        • أسنان الطاحنة: تطحن وتسحق<br>
        • تقلصات المعدة: تعجن وتخلط<br>
        • تمعّج الأمعاء: يحرّك ويمزج
      </div>
      <div style="padding:9px;background:rgba(37,99,235,0.08);border-radius:8px;border:1px solid rgba(37,99,235,0.2);font-size:12.5px">
        <strong style="color:#2563EB">🔗 الهدف:</strong> زيادة السطح المعرَّض لعمل الأنزيمات الكيميائية
      </div>
    </div>
  </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio8n2'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.018;
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,dark=dm15();
    c.fillStyle=bioBg();c.fillRect(0,0,w,h);
    drawLabel(c,'الهضم الميكانيكي — الأسنان تقطع الطعام',w/2,h*0.09,bioTxt(),Math.round(h*0.038));

    // رسم فم كبير مع أسنان
    const mx=w*0.5,my=h*0.38,mr=h*0.22;
    // الفك العلوي
    c.fillStyle=dark?'rgba(253,186,116,0.3)':'rgba(254,215,170,0.8)';
    c.beginPath();c.arc(mx,my-mr*0.2,mr,Math.PI,Math.PI*2);c.fill();
    c.strokeStyle=dark?'#FB923C':'#EA580C';c.lineWidth=2.5;c.stroke();
    // الفك السفلي
    c.fillStyle=dark?'rgba(253,186,116,0.3)':'rgba(254,215,170,0.8)';
    c.beginPath();c.arc(mx,my+mr*0.2,mr,0,Math.PI);c.fill();
    c.strokeStyle=dark?'#FB923C':'#EA580C';c.lineWidth=2.5;c.stroke();

    // أسنان علوية
    const numTeeth=8;
    for(let ti=0;ti<numTeeth;ti++){
      const angle=Math.PI+ti*(Math.PI/numTeeth)+Math.PI/(numTeeth*2);
      const tx=mx+mr*0.85*Math.cos(angle);
      const ty=my-mr*0.2+mr*0.85*Math.sin(angle);
      // شكل السن
      const toothH=ti===0||ti===numTeeth-1?mr*0.18:mr*0.14;
      c.save();c.translate(tx,ty);c.rotate(angle+Math.PI/2);
      c.fillStyle='white';c.strokeStyle='#ddd';c.lineWidth=1;
      c.beginPath();c.roundRect(-mr*0.06,-toothH/2,mr*0.12,toothH,mr*0.02);c.fill();c.stroke();
      c.restore();
    }
    // أسنان سفلية (معكوسة)
    for(let ti=0;ti<numTeeth;ti++){
      const angle=ti*(Math.PI/numTeeth)+Math.PI/(numTeeth*2);
      const tx=mx+mr*0.85*Math.cos(angle);
      const ty=my+mr*0.2+mr*0.85*Math.sin(angle);
      const toothH=ti===0||ti===numTeeth-1?mr*0.18:mr*0.14;
      c.save();c.translate(tx,ty);c.rotate(angle-Math.PI/2);
      c.fillStyle='white';c.strokeStyle='#ddd';c.lineWidth=1;
      c.beginPath();c.roundRect(-mr*0.06,-toothH/2,mr*0.12,toothH,mr*0.02);c.fill();c.stroke();
      c.restore();
    }

    // طعام (قبل / بعد)
    if(!simState.showSmall){
      // خبز كبير في المنتصف
      c.fillStyle=dark?'rgba(253,224,71,0.5)':'rgba(254,240,138,0.9)';
      c.beginPath();c.roundRect(mx-mr*0.35,my-mr*0.18,mr*0.7,mr*0.36,8);c.fill();
      c.strokeStyle=dark?'#FCD34D':'#CA8A04';c.lineWidth=2;c.stroke();
      // نمط الخبز
      c.strokeStyle=dark?'#FCD34D55':'#CA8A0444';c.lineWidth=1;
      for(let l=0;l<4;l++){c.beginPath();c.moveTo(mx-mr*0.25+l*mr*0.15,my-mr*0.15);c.lineTo(mx-mr*0.22+l*mr*0.15,my+mr*0.12);c.stroke();}
      drawLabel(c,'طعام كامل (قبل التقطيع)',w/2,h*0.69,dark?'#FCD34D':'#92400E',Math.round(h*0.027));
    } else {
      // قطع صغيرة
      const crumbs=[[0.36,0.32],[0.48,0.28],[0.6,0.34],[0.38,0.44],[0.5,0.46],[0.62,0.42],[0.42,0.54],[0.56,0.52]];
      crumbs.forEach(([px,py])=>{
        c.fillStyle=dark?'rgba(253,224,71,0.55)':'rgba(254,240,138,0.9)';
        c.beginPath();c.roundRect(w*px-h*0.035,h*py-h*0.025,h*0.07,h*0.05,4);c.fill();
        c.strokeStyle=dark?'#FCD34D':'#CA8A04';c.lineWidth=1.5;c.stroke();
      });
      drawLabel(c,'قطع صغيرة — سطح أكبر للأنزيمات ✓',w/2,h*0.69,dark?'#4ADE80':'#15803D',Math.round(h*0.027));
    }

    // حركة الفك
    const jawOpen=simState.showSmall?0:Math.abs(Math.sin(simState.t*2))*h*0.05;
    c.fillStyle=dark?'rgba(253,186,116,0.15)':'rgba(254,215,170,0.4)';
    c.beginPath();c.arc(mx,my+mr*0.2+jawOpen,mr,0,Math.PI);c.fill();

    // معلومة سطح
    const boxY=h*0.76;
    c.fillStyle=dark?'rgba(37,99,235,0.15)':'rgba(219,234,254,0.8)';c.beginPath();c.roundRect(w*0.05,boxY,w*0.9,h*0.12,10);c.fill();
    c.strokeStyle=dark?'#3B82F6':'#2563EB';c.lineWidth=1.5;c.stroke();
    drawSmallLabel(c,'💡 الهضم الميكانيكي لا يغيّر التركيب الكيميائي للطعام',w/2,boxY+h*0.038,dark?'#93C5FD':'#1D4ED8',Math.round(h*0.024));
    drawSmallLabel(c,'لكنه يزيد المساحة المعرَّضة → يُسرِّع الهضم الكيميائي',w/2,boxY+h*0.078,dark?'#93C5FD':'#1D4ED8',Math.round(h*0.022));

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG9Bio8N2b(){
  cancelAnimationFrame(animFrame);
  simState={t:0,activeRow:-1};

  controls(`<div class="ctrl-section">
    <div class="ctrl-label">🧪 الهضم الكيميائي — الأنزيمات</div>
    <div style="font-size:13px;color:var(--text-secondary);margin-bottom:8px">انقري على أي تفاعل في الرسم لرؤية تفاصيله</div>
    <div id="chem_detail" style="padding:10px;border-radius:10px;background:var(--bg-card2);font-size:13px;line-height:1.8;min-height:80px">← انقري على تفاعل أنزيمي</div>
    <div style="margin-top:10px;padding:9px;background:rgba(109,40,217,0.1);border-radius:8px;border:1px solid rgba(109,40,217,0.25);font-size:12.5px">
      💡 الأنزيمات مُحفِّزات بيولوجية: تُسرِّع التفاعل ولا تُستهلك بعده
    </div>
  </div>`);

  function getRows(dark){return[
    {
      from:'النشا',fromFormula:'(C₆H₁₀O₅)ₙ',fromCol:dark?'#FCD34D':'#CA8A04',
      enz:'أميليز',enzCol:'#7C3AED',
      to:'جلوكوز',toFormula:'C₆H₁₂O₆',toCol:dark?'#4ADE80':'#15803D',
      detail:'الأميليز يقطع الروابط الجليكوسيدية في سلسلة النشا. يُفرَز من الغدد اللعابية (الفم) والبنكرياس. النشا جزيء ضخم لا يمكن امتصاصه — الجلوكوز صغير وقابل للامتصاص'
    },
    {
      from:'بروتين',fromFormula:'سلسلة أحماض أمينية',fromCol:dark?'#FCA5A5':'#DC2626',
      enz:'بروتييز',enzCol:'#7C3AED',
      to:'أحماض أمينية',toFormula:'NH₂-CHR-COOH',toCol:dark?'#60A5FA':'#2563EB',
      detail:'البروتييز (بيبسين في المعدة، تريبسين في الأمعاء) يقطع الروابط الببتيدية. البيبسين يعمل في بيئة حمضية (pH=2)، التريبسين في بيئة قلوية (pH=8)'
    },
    {
      from:'دهون',fromFormula:'جليسيريد ثلاثي',fromCol:dark?'#FDE68A':'#D97706',
      enz:'ليبييز',enzCol:'#7C3AED',
      to:'أحماض دهنية + جليسرول',toFormula:'R-COOH + C₃H₈O₃',toCol:dark?'#C4B5FD':'#7C3AED',
      detail:'الليبييز البنكرياسي يقطع الروابط الإسترية في الجليسيريدات الثلاثية. لكن الدهون لا تذوب في الماء — لذلك العصارة الصفراوية تستحلبها أولاً إلى قطرات صغيرة لتُمكِّن الليبييز من العمل'
    },
  ];}

  const cv=document.getElementById('simCanvas');
  cv.onclick=function(e){
    const rect=cv.getBoundingClientRect();
    const my2=(e.clientY-rect.top)*(cv.height/rect.height);
    const h=cv.height;
    const rows=getRows(dm15());
    rows.forEach((r,i)=>{
      const ry=h*(0.2+i*0.25);
      if(my2>ry&&my2<ry+h*0.22){
        simState.activeRow=i;
        const el=document.getElementById('chem_detail');
        if(el)el.innerHTML=`<strong style="color:${r.enzCol}">${r.enz}:</strong><br>${r.detail}`;
      }
    });
  };

  function drawMolecule(c,x,y,size,col,formula,name,isLarge){
    const dark=dm15();
    if(isLarge){
      // جزيء كبير — سلسلة
      const nodes=5;
      for(let i=0;i<nodes;i++){
        const nx=x-size*(nodes/2-i)*0.5,ny=y+Math.sin(i*0.8)*size*0.15;
        c.fillStyle=col+'55';c.beginPath();c.arc(nx,ny,size*0.22,0,Math.PI*2);c.fill();
        c.strokeStyle=col;c.lineWidth=2;c.stroke();
        if(i<nodes-1){
          const nx2=x-size*(nodes/2-i-1)*0.5,ny2=y+Math.sin((i+1)*0.8)*size*0.15;
          c.strokeStyle=col+'88';c.lineWidth=3;c.beginPath();c.moveTo(nx,ny);c.lineTo(nx2,ny2);c.stroke();
        }
      }
    } else {
      // جزيء صغير
      c.fillStyle=col+'44';c.beginPath();c.arc(x,y,size*0.35,0,Math.PI*2);c.fill();
      c.strokeStyle=col;c.lineWidth=2;c.stroke();
    }
    c.fillStyle=col;c.font=`bold ${Math.round(size*0.3)}px Tajawal`;c.textAlign='center';c.fillText(name,x,y+size*0.6);
    c.fillStyle=dark?'#9CA3AF':'#6B7280';c.font=`${Math.round(size*0.22)}px Tajawal`;c.fillText(formula,x,y+size*0.82);
  }

  function draw(){
    if(currentSim!=='g9bio8n2'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.018;
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,dark=dm15();
    const rows=getRows(dark);
    c.fillStyle=bioBg();c.fillRect(0,0,w,h);
    drawLabel(c,'الأنزيمات تُحوِّل جزيئات كبيرة → صغيرة قابلة للامتصاص',w/2,h*0.09,bioTxt(),Math.round(h*0.034));

    rows.forEach((r,i)=>{
      const ry=h*(0.17+i*0.27),rh=h*0.23;
      const isActive=simState.activeRow===i;
      // خلفية الصف
      c.fillStyle=isActive?r.fromCol+'18':dark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)';
      c.beginPath();c.roundRect(w*0.02,ry,w*0.96,rh,10);c.fill();
      c.strokeStyle=isActive?r.fromCol:dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)';
      c.lineWidth=isActive?2:1;c.stroke();

      const cly=ry+rh/2;
      // مادة أولية
      drawMolecule(c,w*0.17,cly,rh*0.45,r.fromCol,r.fromFormula,r.from,true);
      // سهم + أنزيم
      const pulse=0.5+Math.abs(Math.sin(simState.t*2+i))*0.5;
      drawArrow(c,w*0.34,cly,w*0.59,cly,r.enzCol+Math.round(pulse*200).toString(16).padStart(2,'0'),3,12);
      // أيقونة الأنزيم فوق السهم (مقص)
      c.fillStyle=r.enzCol;c.font=`${Math.round(rh*0.35)}px serif`;c.textAlign='center';
      c.fillText('✂️',w*0.465,cly-rh*0.05);
      c.fillStyle=r.enzCol;c.font=`bold ${Math.round(rh*0.17)}px Tajawal`;c.textAlign='center';
      c.fillText(r.enz,w*0.465,cly+rh*0.2);
      // ناتج
      drawMolecule(c,w*0.8,cly,rh*0.42,r.toCol,r.toFormula,r.to,false);
      // جزيئات متحركة
      const ppos=((simState.t*0.5+i*0.33)%1);
      const ppx=w*(0.34+ppos*0.25);
      c.fillStyle=r.fromCol;c.beginPath();c.arc(ppx,cly+Math.sin(simState.t*3+i)*rh*0.08,rh*0.07,0,Math.PI*2);c.fill();
    });
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG9Bio8N2c(){
  cancelAnimationFrame(animFrame);
  simState={t:0,foodSize:1.0,enzymeActive:false};

  controls(`<div class="ctrl-section">
    <div class="ctrl-label">⚖️ الهضم الميكانيكي + الكيميائي معاً</div>
    <div style="font-size:13px;color:var(--text-secondary);margin-bottom:10px">جرِّبي كيف يزيد الهضم الميكانيكي من كفاءة الأنزيمات</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      <button onclick="simState.foodSize=Math.max(0.2,simState.foodSize-0.2)" style="padding:9px;border-radius:8px;background:#2563EB;color:white;font-family:Tajawal;font-weight:700;font-size:13px;border:none;cursor:pointer">🦷 هضم ميكانيكي: قطِّعي الطعام</button>
      <button onclick="simState.enzymeActive=!simState.enzymeActive" style="padding:9px;border-radius:8px;background:#7C3AED;color:white;font-family:Tajawal;font-weight:700;font-size:13px;border:none;cursor:pointer">🧪 فعِّلي/أوقفي الأنزيمات</button>
      <button onclick="simState.foodSize=1.0;simState.enzymeActive=false" style="padding:9px;border-radius:8px;background:var(--bg-ctrl-btn);font-family:Tajawal;font-size:13px;border:1px solid var(--border-color);cursor:pointer">🔄 إعادة تعيين</button>
    </div>
    <div id="mech_chem_info" style="margin-top:10px;padding:10px;border-radius:10px;background:var(--bg-card2);font-size:12.5px;line-height:1.8"></div>
  </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio8n2'||currentTab!==2){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.018;
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,dark=dm15();
    c.fillStyle=bioBg();c.fillRect(0,0,w,h);
    drawLabel(c,'الهضم الميكانيكي والكيميائي يعملان معاً',w/2,h*0.08,bioTxt(),Math.round(h*0.036));

    const sz=simState.foodSize;
    const pieces=Math.round(1/sz);
    const enzymeSpeed=simState.enzymeActive?1:0;
    const surface=Math.round((1/sz)*100)/100;

    // شريط المعلومات
    c.fillStyle=dark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)';c.beginPath();c.roundRect(w*0.02,h*0.14,w*0.96,h*0.1,8);c.fill();
    drawSmallLabel(c,`حجم القطعة: ${Math.round(sz*100)}%   |   عدد القطع: ${pieces}   |   المساحة: ${surface}×   |   سرعة الأنزيمات: ${simState.enzymeActive?'عالية ✓':'منخفضة ✗'}`,w/2,h*0.2,dark?'#A7F3D0':'#065F46',Math.round(h*0.023));

    // رسم قطع الطعام
    const cols=Math.ceil(Math.sqrt(pieces)),rows2=Math.ceil(pieces/cols);
    const zone_x=w*0.05,zone_y=h*0.28,zone_w=w*0.45,zone_h=h*0.55;
    c.fillStyle=dark?'rgba(253,224,71,0.08)':'rgba(254,240,138,0.15)';c.beginPath();c.roundRect(zone_x,zone_y,zone_w,zone_h,10);c.fill();
    drawSmallLabel(c,'الطعام',zone_x+zone_w/2,zone_y-h*0.02,dark?'#FCD34D':'#92400E',Math.round(h*0.022));
    let pi=0;
    for(let r=0;r<rows2&&pi<pieces;r++){
      for(let cc=0;cc<cols&&pi<pieces;cc++,pi++){
        const px=zone_x+zone_w*(0.1+cc*(0.8/Math.max(cols-1,1))),py=zone_y+zone_h*(0.12+r*(0.75/Math.max(rows2-1,1)));
        const ps=sz*h*0.08*(0.7+Math.sin(simState.t*2+pi)*0.1);
        c.fillStyle=dark?'rgba(253,224,71,0.55)':'rgba(254,240,138,0.9)';
        c.beginPath();c.roundRect(px-ps/2,py-ps/2,ps,ps,ps*0.2);c.fill();
        c.strokeStyle=dark?'#FCD34D':'#CA8A04';c.lineWidth=1.5;c.stroke();
      }
    }

    // أنزيمات
    if(simState.enzymeActive){
      const numEnz=Math.min(pieces*2,20);
      for(let ei=0;ei<numEnz;ei++){
        const angle=(ei/numEnz)*Math.PI*2+simState.t*(0.5+surface*0.3);
        const er=zone_h*0.35;
        const ex=zone_x+zone_w/2+Math.cos(angle)*er*(0.3+0.5*Math.random()),ey=zone_y+zone_h/2+Math.sin(angle)*er*0.5*(0.3+0.5*Math.random());
        c.fillStyle='#7C3AED88';c.beginPath();c.arc(ex,ey,h*0.015,0,Math.PI*2);c.fill();
        c.font=`${Math.round(h*0.025)}px serif`;c.textAlign='center';c.fillText('✂️',ex,ey+h*0.01);
      }
    }

    // سهم + نواتج
    if(simState.enzymeActive&&sz<0.8){
      drawArrow(c,w*0.52,h*0.55,w*0.6,h*0.55,dark?'#4ADE80':'#15803D',3,12);
      const res_x=w*0.62,res_y=h*0.28,res_w=w*0.35,res_h=h*0.55;
      c.fillStyle=dark?'rgba(74,222,128,0.08)':'rgba(187,247,208,0.2)';c.beginPath();c.roundRect(res_x,res_y,res_w,res_h,10);c.fill();
      drawSmallLabel(c,'نواتج قابلة للامتصاص',res_x+res_w/2,res_y-h*0.02,dark?'#4ADE80':'#15803D',Math.round(h*0.022));
      const products=['جلوكوز','أحماض أمينية','أحماض دهنية'];
      const productCols=[dark?'#FCD34D':'#D97706',dark?'#60A5FA':'#2563EB',dark?'#C4B5FD':'#7C3AED'];
      products.forEach((p,pi)=>{
        const py2=res_y+res_h*(0.2+pi*0.28);
        for(let di=0;di<5;di++){
          c.fillStyle=productCols[pi]+'88';c.beginPath();c.arc(res_x+res_w*(0.15+di*0.18),py2,h*0.022,0,Math.PI*2);c.fill();
        }
        drawSmallLabel(c,p,res_x+res_w*0.5,py2+h*0.042,productCols[pi],Math.round(h*0.021));
      });
    }

    const infoEl=document.getElementById('mech_chem_info');
    if(infoEl){
      if(sz>=0.8)infoEl.innerHTML='<span style="color:#D97706">⚠️ الطعام لا يزال كبيراً — استخدمي الهضم الميكانيكي لتقطيعه أولاً</span>';
      else if(!simState.enzymeActive)infoEl.innerHTML='<span style="color:#2563EB">✓ الطعام مقطَّع الآن — فعِّلي الأنزيمات لإتمام الهضم الكيميائي</span>';
      else infoEl.innerHTML='<span style="color:#10B981">🎉 ممتاز! الهضم الميكانيكي قطَّع الطعام وزاد السطح → الأنزيمات تعمل بكفاءة عالية → نواتج قابلة للامتصاص!</span>';
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════════════
   نشاط ٣-٨ · القناة الهضمية — رسم تشريحي واقعي
════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════
   الدالة الرئيسية: رسم الجسم والجهاز الهضمي تشريحياً
══════════════════════════════════════════════════════ */
function drawAnatomicalBody(c, w, h, dark) {
  // نسب ثابتة بناءً على حجم الكانفاس
  const bx = w * 0.5;   // محور الجسم
  const headCY = h * 0.10;
  const headR  = h * 0.065;
  const neck_y = headCY + headR * 0.9;
  const shldr_y = neck_y + h * 0.04;
  const hip_y   = h * 0.72;

  // جسم (شفاف/رمادي فاتح)
  const bodyGrad = c.createLinearGradient(bx - w*0.22, 0, bx + w*0.22, 0);
  bodyGrad.addColorStop(0,   dark ? 'rgba(180,200,220,0.10)' : 'rgba(210,225,235,0.45)');
  bodyGrad.addColorStop(0.35,dark ? 'rgba(180,200,220,0.18)' : 'rgba(220,233,242,0.60)');
  bodyGrad.addColorStop(0.65,dark ? 'rgba(180,200,220,0.18)' : 'rgba(220,233,242,0.60)');
  bodyGrad.addColorStop(1,   dark ? 'rgba(180,200,220,0.10)' : 'rgba(210,225,235,0.45)');

  // رأس
  c.fillStyle = dark ? 'rgba(180,200,220,0.20)' : 'rgba(215,228,238,0.55)';
  c.strokeStyle = dark ? 'rgba(150,180,210,0.30)' : 'rgba(160,185,210,0.45)';
  c.lineWidth = 1.5;
  c.beginPath();
  c.arc(bx, headCY, headR, 0, Math.PI * 2);
  c.fill(); c.stroke();

  // رقبة
  c.fillStyle = dark ? 'rgba(180,200,220,0.18)' : 'rgba(215,228,238,0.5)';
  c.beginPath();
  c.roundRect(bx - w*0.035, neck_y - h*0.01, w*0.07, h*0.05, 4);
  c.fill(); c.stroke();

  // جذع (مخروطي)
  c.fillStyle = bodyGrad;
  c.strokeStyle = dark ? 'rgba(150,180,210,0.25)' : 'rgba(160,185,210,0.40)';
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(bx - w*0.04, neck_y + h*0.04);
  c.bezierCurveTo(bx - w*0.23, shldr_y, bx - w*0.24, shldr_y + h*0.08, bx - w*0.22, shldr_y + h*0.22);
  c.bezierCurveTo(bx - w*0.21, shldr_y + h*0.38, bx - w*0.18, hip_y - h*0.05, bx - w*0.14, hip_y);
  c.lineTo(bx + w*0.14, hip_y);
  c.bezierCurveTo(bx + w*0.18, hip_y - h*0.05, bx + w*0.21, shldr_y + h*0.38, bx + w*0.22, shldr_y + h*0.22);
  c.bezierCurveTo(bx + w*0.24, shldr_y + h*0.08, bx + w*0.23, shldr_y, bx + w*0.04, neck_y + h*0.04);
  c.closePath();
  c.fill(); c.stroke();

  // حوض
  c.fillStyle = dark ? 'rgba(180,200,220,0.15)' : 'rgba(215,228,238,0.40)';
  c.beginPath();
  c.moveTo(bx - w*0.14, hip_y);
  c.bezierCurveTo(bx - w*0.18, hip_y + h*0.04, bx - w*0.17, hip_y + h*0.1, bx - w*0.1, hip_y + h*0.12);
  c.lineTo(bx + w*0.1, hip_y + h*0.12);
  c.bezierCurveTo(bx + w*0.17, hip_y + h*0.1, bx + w*0.18, hip_y + h*0.04, bx + w*0.14, hip_y);
  c.closePath();
  c.fill(); c.stroke();

  // ذراعان
  [-1, 1].forEach(side => {
    c.fillStyle = dark ? 'rgba(180,200,220,0.15)' : 'rgba(215,228,238,0.40)';
    c.strokeStyle = dark ? 'rgba(150,180,210,0.22)' : 'rgba(160,185,210,0.35)';
    c.lineWidth = 1.2;
    const ax = bx + side * w * 0.225;
    const ay = shldr_y + h * 0.06;
    c.beginPath();
    c.moveTo(ax - side*w*0.01, ay);
    c.bezierCurveTo(ax + side*w*0.07, ay + h*0.08, ax + side*w*0.09, ay + h*0.25, ax + side*w*0.06, ay + h*0.42);
    c.bezierCurveTo(ax + side*w*0.03, ay + h*0.55, ax + side*w*0.01, ay + h*0.58, ax, ay + h*0.58);
    c.bezierCurveTo(ax - side*w*0.02, ay + h*0.58, ax - side*w*0.04, ay + h*0.55, ax - side*w*0.05, ay + h*0.42);
    c.bezierCurveTo(ax - side*w*0.07, ay + h*0.25, ax - side*w*0.065, ay + h*0.08, ax - side*w*0.01, ay);
    c.closePath();
    c.fill(); c.stroke();
  });
}

function drawAnatomicalOrgans(c, w, h, t, selectedOrgan, dark) {
  const bx = w * 0.5;
  const headCY = h * 0.10;
  const headR  = h * 0.065;

  // ── دالة مساعدة: تدرّج لوني عضوي ──
  function orgGrad(x1,y1,x2,y2, col1, col2) {
    const g = c.createLinearGradient(x1,y1,x2,y2);
    g.addColorStop(0, col1); g.addColorStop(1, col2); return g;
  }
  function isHL(key) { return selectedOrgan === key; }
  function glowOrgan(key, col) {
    if(isHL(key)) {
      c.shadowColor = col; c.shadowBlur = 20;
    }
  }
  function resetGlow() { c.shadowBlur = 0; }

  /* ── ١. الفم والبلعوم ── */
  {
    const mx = bx + w*0.04, my = headCY + headR*0.25;
    glowOrgan('mouth','#E07070');
    // تجويف الفم (بيضاوي دافئ)
    c.fillStyle = isHL('mouth') ? '#D4635588' : orgGrad(mx-w*0.04,my,mx+w*0.04,my,'#C0605888','#A84848AA');
    c.strokeStyle = isHL('mouth') ? '#C05050' : '#A8484888';
    c.lineWidth = 1.8;
    c.beginPath();
    c.ellipse(mx, my, w*0.038, h*0.022, -0.3, 0, Math.PI*2);
    c.fill(); c.stroke();
    resetGlow();
    // البلعوم (أسفل الفم)
    c.fillStyle = '#B85050BB';
    c.strokeStyle = '#9B404088';
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(mx - w*0.018, my + h*0.015);
    c.bezierCurveTo(mx - w*0.02, my + h*0.04, bx - w*0.02, headCY + headR*0.95, bx - w*0.018, headCY + headR + h*0.02);
    c.bezierCurveTo(bx - w*0.005, headCY + headR + h*0.04, bx + w*0.005, headCY + headR + h*0.04, bx + w*0.012, headCY + headR + h*0.02);
    c.bezierCurveTo(bx + w*0.01, headCY + headR*0.95, mx + w*0.005, my + h*0.04, mx + w*0.012, my + h*0.015);
    c.closePath(); c.fill(); c.stroke();
  }

  /* ── ٢. المريء ── */
  {
    const esTop = headCY + headR + h*0.03;
    const esBot = h*0.34;
    const esx   = bx - w*0.015;
    glowOrgan('esophagus','#C06080');
    c.strokeStyle = isHL('esophagus') ? '#D07090' : '#B05070BB';
    c.lineWidth = isHL('esophagus') ? w*0.025 : w*0.02;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(esx, esTop);
    c.bezierCurveTo(esx - w*0.005, esTop + h*0.06, esx - w*0.01, esBot - h*0.06, esx - w*0.005, esBot);
    c.stroke();
    // موجات تمعّج
    if(t) {
      for(let wi = 0; wi < 3; wi++) {
        const wp = (t*0.5 + wi*0.33) % 1;
        const wy = esTop + (esBot - esTop)*wp;
        c.fillStyle = '#E08090CC';
        c.beginPath(); c.arc(esx - w*0.005, wy, w*0.012, 0, Math.PI*2); c.fill();
      }
    }
    resetGlow();
  }

  /* ── ٣. الكبد (الأكبر — يمين المشاهد = يسار الصورة) ── */
  {
    const lx = bx + w*0.06, ly = h*0.36;
    const lw = w*0.23, lh = h*0.14;
    glowOrgan('liver','#8B2020');
    const liverGrad = orgGrad(lx-lw*0.5, ly, lx+lw*0.4, ly+lh, '#7B1A1AEE','#9B2525EE');
    c.fillStyle = liverGrad;
    c.strokeStyle = isHL('liver') ? '#FF5555' : '#6B181888';
    c.lineWidth = isHL('liver') ? 2.5 : 2;
    c.beginPath();
    c.moveTo(lx - lw*0.52, ly + lh*0.35);
    c.bezierCurveTo(lx - lw*0.55, ly - lh*0.05, lx - lw*0.15, ly - lh*0.55, lx + lw*0.3,  ly - lh*0.15);
    c.bezierCurveTo(lx + lw*0.55, ly + lh*0.1,  lx + lw*0.5,  ly + lh*0.65, lx + lw*0.2,  ly + lh*0.8);
    c.bezierCurveTo(lx - lw*0.05, ly + lh*0.95, lx - lw*0.4,  ly + lh*0.75, lx - lw*0.52, ly + lh*0.35);
    c.closePath(); c.fill(); c.stroke();
    // فصّ أيسر أصغر
    c.fillStyle = '#6B1A1ACC';
    c.beginPath();
    c.moveTo(lx - lw*0.52, ly + lh*0.35);
    c.bezierCurveTo(lx - lw*0.58, ly + lh*0.1, lx - lw*0.45, ly - lh*0.1, lx - lw*0.2,  ly + lh*0.05);
    c.bezierCurveTo(lx - lw*0.3,  ly + lh*0.45, lx - lw*0.38, ly + lh*0.55, lx - lw*0.52, ly + lh*0.35);
    c.closePath(); c.fill();
    resetGlow();

    /* ── ٤. المرارة (تحت الكبد) ── */
    {
      const gx = lx - lw*0.08, gy = ly + lh*0.88;
      glowOrgan('gallbladder','#5B8C3A');
      c.fillStyle = isHL('gallbladder') ? '#6DAF44CC' : '#4A7A30CC';
      c.strokeStyle = isHL('gallbladder') ? '#90D060' : '#3A6020AA';
      c.lineWidth = isHL('gallbladder') ? 2 : 1.5;
      c.beginPath();
      c.moveTo(gx, gy - h*0.02);
      c.bezierCurveTo(gx + w*0.04, gy - h*0.02, gx + w*0.055, gy + h*0.01, gx + w*0.04, gy + h*0.038);
      c.bezierCurveTo(gx + w*0.025, gy + h*0.058, gx - w*0.005, gy + h*0.062, gx - w*0.015, gy + h*0.04);
      c.bezierCurveTo(gx - w*0.025, gy + h*0.018, gx - w*0.012, gy - h*0.005, gx, gy - h*0.02);
      c.closePath(); c.fill(); c.stroke();
      resetGlow();
    }
  }

  /* ── ٥. المعدة (يسار المشاهد = يمين الصورة) ── */
  {
    const sx = bx - w*0.1, sy = h*0.37;
    const sw = w*0.2, sh = h*0.16;
    glowOrgan('stomach','#C87050');
    const stomGrad = orgGrad(sx-sw*0.5, sy, sx+sw*0.3, sy+sh, '#B86040EE','#D07858EE');
    c.fillStyle = stomGrad;
    c.strokeStyle = isHL('stomach') ? '#F09060' : '#9A503088';
    c.lineWidth = isHL('stomach') ? 2.5 : 2;
    c.beginPath();
    c.moveTo(sx - sw*0.38, sy - sh*0.15);
    c.bezierCurveTo(sx - sw*0.62, sy + sh*0.0,  sx - sw*0.68, sy + sh*0.52, sx - sw*0.32, sy + sh*0.72);
    c.bezierCurveTo(sx - sw*0.05, sy + sh*0.88, sx + sw*0.32, sy + sh*0.68, sx + sw*0.42, sy + sh*0.22);
    c.bezierCurveTo(sx + sw*0.48, sy - sh*0.08, sx + sw*0.28, sy - sh*0.38, sx + sw*0.02, sy - sh*0.42);
    c.bezierCurveTo(sx - sw*0.18, sy - sh*0.45, sx - sw*0.2,  sy - sh*0.28, sx - sw*0.38, sy - sh*0.15);
    c.closePath(); c.fill(); c.stroke();
    // تقلصات داخلية
    if(t) {
      for(let ci = 0; ci < 3; ci++) {
        const contract = Math.sin(t*2.2 + ci*1.1)*sh*0.025;
        c.strokeStyle = '#D8806888'; c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(sx - sw*0.38, sy + sh*(0.1+ci*0.2) + contract);
        c.bezierCurveTo(sx - sw*0.1, sy + sh*(0.05+ci*0.2), sx + sw*0.1, sy + sh*(0.08+ci*0.2), sx + sw*0.32, sy + sh*(0.1+ci*0.2) + contract);
        c.stroke();
      }
    }
    resetGlow();
  }

  /* ── ٦. البنكرياس (خلف المعدة، بيج/برتقالي فاتح) ── */
  {
    const px = bx - w*0.15, py = h*0.50;
    const pw = w*0.28, ph = h*0.055;
    glowOrgan('pancreas','#D4A040');
    const panGrad = orgGrad(px-pw*0.5, py, px+pw*0.4, py+ph, '#C8943AEE','#DEB050EE');
    c.fillStyle = panGrad;
    c.strokeStyle = isHL('pancreas') ? '#F0C060' : '#B07A2888';
    c.lineWidth = isHL('pancreas') ? 2 : 1.5;
    c.beginPath();
    c.moveTo(px - pw*0.5, py + ph*0.5);
    c.bezierCurveTo(px - pw*0.5, py - ph*0.2, px - pw*0.2, py - ph*0.65, px + pw*0.05, py - ph*0.3);
    c.bezierCurveTo(px + pw*0.25, py + ph*0.0,  px + pw*0.52, py - ph*0.15, px + pw*0.55, py + ph*0.42);
    c.bezierCurveTo(px + pw*0.52, py + ph*0.85, px + pw*0.2,  py + ph*0.92, px - pw*0.05, py + ph*0.75);
    c.bezierCurveTo(px - pw*0.28, py + ph*0.6,  px - pw*0.5,  py + ph*0.88, px - pw*0.5, py + ph*0.5);
    c.closePath(); c.fill(); c.stroke();
    resetGlow();
  }

  /* ── ٧. الأمعاء الدقيقة (لفات كثيفة في المنتصف) ── */
  {
    const six = bx - w*0.02, siy = h*0.525;
    const siW = w*0.28, siH = h*0.22;
    glowOrgan('smallIntestine','#E08080');
    const siCol = isHL('smallIntestine') ? '#E89090' : '#D06868';
    // لفات أمعاء دقيقة — رسم كثيف يشبه الصورة الحقيقية
    c.lineCap = 'round'; c.lineJoin = 'round';
    const siLoops = [
      // [cx, cy, rx, ry, rot]
      [six - siW*0.28, siy + siH*0.05, siW*0.17, siH*0.08, 0.1],
      [six + siW*0.05, siy + siH*0.00, siW*0.22, siH*0.09, -0.05],
      [six + siW*0.28, siy + siH*0.06, siW*0.15, siH*0.08, 0.15],
      [six - siW*0.22, siy + siH*0.19, siW*0.19, siH*0.08, -0.08],
      [six + siW*0.08, siy + siH*0.18, siW*0.24, siH*0.09, 0.06],
      [six + siW*0.30, siy + siH*0.20, siW*0.14, siH*0.07, -0.12],
      [six - siW*0.30, siy + siH*0.33, siW*0.16, siH*0.08, 0.08],
      [six - siW*0.06, siy + siH*0.33, siW*0.26, siH*0.09, -0.06],
      [six + siW*0.26, siy + siH*0.34, siW*0.18, siH*0.08, 0.1],
      [six - siW*0.24, siy + siH*0.48, siW*0.2,  siH*0.09, -0.1],
      [six + siW*0.06, siy + siH*0.48, siW*0.25, siH*0.09, 0.05],
      [six + siW*0.28, siy + siH*0.49, siW*0.16, siH*0.08, -0.08],
      [six - siW*0.28, siy + siH*0.63, siW*0.17, siH*0.08, 0.12],
      [six + siW*0.02, siy + siH*0.62, siW*0.28, siH*0.09, -0.04],
      [six + siW*0.30, siy + siH*0.63, siW*0.14, siH*0.07, 0.15],
      [six - siW*0.2,  siy + siH*0.77, siW*0.22, siH*0.09, -0.06],
      [six + siW*0.12, siy + siH*0.77, siW*0.24, siH*0.09, 0.08],
      [six + siW*0.30, siy + siH*0.78, siW*0.15, siH*0.07, -0.1],
      [six - siW*0.25, siy + siH*0.92, siW*0.18, siH*0.07, 0.06],
      [six + siW*0.05, siy + siH*0.92, siW*0.27, siH*0.08, -0.07],
    ];
    // رسم طبقتين: خلفية داكنة + مقدمة مضيئة
    siLoops.forEach(([lx, ly, lrx, lry, rot], idx) => {
      c.strokeStyle = dark ? '#C05858BB' : '#C05858AA';
      c.lineWidth = isHL('smallIntestine') ? siH*0.075 : siH*0.065;
      c.beginPath(); c.ellipse(lx, ly, lrx, lry, rot, 0, Math.PI*2); c.stroke();
    });
    siLoops.forEach(([lx, ly, lrx, lry, rot]) => {
      const hiGrad = c.createRadialGradient(lx - lrx*0.2, ly - lry*0.3, 0, lx, ly, Math.max(lrx, lry));
      hiGrad.addColorStop(0, '#EE9090CC');
      hiGrad.addColorStop(0.5, '#D06868AA');
      hiGrad.addColorStop(1, '#B04848AA');
      c.strokeStyle = hiGrad;
      c.lineWidth = isHL('smallIntestine') ? siH*0.055 : siH*0.045;
      c.beginPath(); c.ellipse(lx, ly, lrx*0.88, lry*0.88, rot, 0, Math.PI*2); c.stroke();
    });
    resetGlow();

    // مواد تُمتص متحركة
    if(t && isHL('smallIntestine')) {
      for(let pi = 0; pi < 6; pi++) {
        const pp = (t*0.4 + pi*0.17) % 1;
        const li = Math.min(Math.floor(pp * siLoops.length), siLoops.length-1);
        const [lx2, ly2, lrx2, lry2] = siLoops[li];
        const ang = t*2 + pi;
        c.fillStyle = ['#FCD34DCC','#60A5FACC','#4ADE80CC'][pi%3];
        c.beginPath(); c.arc(lx2 + Math.cos(ang)*lrx2*0.5, ly2 + Math.sin(ang)*lry2*0.5, h*0.012, 0, Math.PI*2); c.fill();
      }
    }
  }

  /* ── ٨. الأمعاء الغليظة (إطار حول الدقيقة) ── */
  {
    const lICol = isHL('largeIntestine') ? '#C070C0' : '#9050A0';
    const lx1 = bx - w*0.26, lx2 = bx + w*0.22;
    const ly1 = h*0.505, ly2 = h*0.76;
    const tubW = isHL('largeIntestine') ? h*0.038 : h*0.03;
    glowOrgan('largeIntestine','#A060B0');

    // رسم الأمعاء الغليظة بشكل إطار واقعي
    function drawColon(col1, col2, lw2, inset) {
      const g = orgGrad(lx1, ly1, lx1, ly2, col1, col2);
      c.strokeStyle = g; c.lineWidth = lw2; c.lineCap = 'round'; c.lineJoin = 'round';
      const r = h*0.042;
      const i = inset;
      c.beginPath();
      // صاعد (يمين)
      c.moveTo(lx2 - i, ly2 - r);
      c.lineTo(lx2 - i, ly1 + r*1.2);
      c.arcTo(lx2 - i, ly1 - i, lx2 - i - r, ly1 - i, r);
      // عرضي علوي
      c.lineTo(lx1 + i + r, ly1 - i);
      c.arcTo(lx1 + i, ly1 - i, lx1 + i, ly1 + r*0.8, r);
      // نازل (يسار)
      c.lineTo(lx1 + i, ly2 - r*0.8);
      c.arcTo(lx1 + i, ly2 + i, lx1 + i + r, ly2 + i, r);
      // عرضي سفلي جزئي
      c.lineTo(bx - w*0.06, ly2 + i);
      c.stroke();
    }
    // طبقة خلفية داكنة
    drawColon('#703880CC','#804090CC', tubW * 1.35, 0);
    // طبقة أمامية مضيئة
    drawColon('#C070C0CC','#B060B0CC', tubW, 0);
    // هوسترات (تعريجات)
    const haustraCols = [
      [lx2, ly1, ly2, 1, 0],
      [lx1, ly1, ly2, -1, 0],
    ];
    haustraCols.forEach(([hx, hy1, hy2, side, _]) => {
      c.strokeStyle = dark ? '#D090D099' : '#C080C099';
      c.lineWidth = 1.5;
      for(let hi = 0; hi < 5; hi++) {
        const hy = hy1 + (hy2 - hy1) * (0.1 + hi * 0.18);
        c.beginPath();
        c.moveTo(hx - side*tubW*0.3, hy);
        c.lineTo(hx + side*tubW*0.3, hy);
        c.stroke();
      }
    });
    resetGlow();

    /* ── ٩. المستقيم والشرج ── */
    {
      const rx = bx - w*0.06, ry1 = ly2 + h*0.01;
      const ry2 = h*0.845;
      glowOrgan('rectum','#E04040');
      c.strokeStyle = isHL('rectum') ? '#F06060' : '#A04040BB';
      c.lineWidth = isHL('rectum') ? h*0.032 : h*0.026;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(rx, ry1);
      c.bezierCurveTo(rx - w*0.01, ry1 + (ry2-ry1)*0.3, rx - w*0.015, ry1 + (ry2-ry1)*0.65, rx - w*0.005, ry2);
      c.stroke();
      // فتحة الشرج
      c.fillStyle = isHL('rectum') ? '#D05050' : '#904040AA';
      c.beginPath(); c.ellipse(rx - w*0.005, ry2, h*0.016, h*0.01, 0.2, 0, Math.PI*2); c.fill();
      resetGlow();
    }
  }
}

/* ══════════════════════════════════════════════════════
   التسميات التشريحية مع خطوط الإشارة (مثل الصورة تماماً)
══════════════════════════════════════════════════════ */
function drawAnatomicalLabels(c, w, h, selectedOrgan, dark) {
  const bx = w*0.5;
  const headCY = h*0.10;
  const headR  = h*0.065;

  // كل تسمية: {key, name, ox,oy (نقطة العضو), lx,ly (نقطة النص)}
  const labels = [
    {key:'mouth',         name:'الفم',              ox: bx+w*0.055, oy: headCY+headR*0.28,  lx: w*0.88, ly: h*0.115},
    {key:'esophagus',     name:'المريء',            ox: bx-w*0.015, oy: h*0.25,             lx: w*0.88, ly: h*0.28},
    {key:'liver',         name:'الكبد',             ox: bx+w*0.1,   oy: h*0.37,             lx: w*0.08, ly: h*0.36},
    {key:'gallbladder',   name:'المرارة',           ox: bx+w*0.03,  oy: h*0.505,            lx: w*0.08, ly: h*0.465},
    {key:'stomach',       name:'المعدة',            ox: bx-w*0.18,  oy: h*0.44,             lx: w*0.88, ly: h*0.41},
    {key:'pancreas',      name:'البنكرياس',         ox: bx+w*0.12,  oy: h*0.515,            lx: w*0.88, ly: h*0.52},
    {key:'smallIntestine',name:'أمعاء دقيقة',      ox: bx-w*0.05,  oy: h*0.64,             lx: w*0.08, ly: h*0.585},
    {key:'largeIntestine',name:'أمعاء غليظة',      ox: bx-w*0.26,  oy: h*0.62,             lx: w*0.08, ly: h*0.66},
    {key:'rectum',        name:'الشرج',             ox: bx-w*0.02,  oy: h*0.83,             lx: w*0.88, ly: h*0.78},
  ];

  const organColors = {
    mouth:'#E07070', esophagus:'#C06080', liver:'#8B2020',
    gallbladder:'#5B8C3A', stomach:'#C87050', pancreas:'#C8943A',
    smallIntestine:'#D06868', largeIntestine:'#9050A0', rectum:'#A04040',
  };

  labels.forEach(lb => {
    const isSel = selectedOrgan === lb.key;
    const col = organColors[lb.key];

    // خط الإشارة (مستقيم مائل مثل الصورة الطبية تماماً)
    c.strokeStyle = isSel ? col : (dark ? col+'99' : col+'88');
    c.lineWidth = isSel ? 1.8 : 1.2;
    c.setLineDash([]);
    c.beginPath();
    c.moveTo(lb.ox, lb.oy);
    // خط مائل
    const midX = lb.lx > bx ? lb.lx - w*0.07 : lb.lx + w*0.07;
    c.lineTo(midX, lb.ly);
    // خط أفقي عند النص
    c.lineTo(lb.lx, lb.ly);
    c.stroke();

    // نقطة عند العضو
    c.fillStyle = isSel ? col : col+'BB';
    c.beginPath(); c.arc(lb.ox, lb.oy, isSel ? 4 : 3, 0, Math.PI*2); c.fill();

    // نص التسمية
    const align = lb.lx > bx ? 'right' : 'left';
    c.fillStyle = isSel ? col : (dark ? '#E5E7EB' : '#1F2937');
    c.font = `${isSel ? 'bold ' : ''}${Math.round(h*0.032)}px Tajawal`;
    c.textAlign = align;
    c.fillText(lb.name, lb.lx + (align==='left' ? 6 : -6), lb.ly + 5);
  });
}

/* ══════════════════════════════════════════════════════
   معلومات الأعضاء
══════════════════════════════════════════════════════ */
const organInfo = {
  mouth:         {name:'الفم',              col:'#E07070', func:'تفتيت الطعام بالأسنان + أميليز اللعاب يهضم النشا + اللسان يشكّل البلعة', detail:'الغدد اللعابية تُفرز 1.5 لتر/يوم. أسنان القاطعة تمزّق والطاحنة تطحن. مدة الإقامة: ~30 ثانية.'},
  esophagus:     {name:'المريء',            col:'#C06080', func:'ينقل البلعة من الفم للمعدة بالحركة التمعّجية', detail:'أنبوب عضلي طوله ~25 سم. لا يحدث هضم هنا. تستغرق البلعة ~10 ثوانٍ للوصول للمعدة.'},
  stomach:       {name:'المعدة',            col:'#C87050', func:'HCl (pH=2) يقتل البكتيريا + بيبسين يهضم البروتين + تقلصات تعجن الطعام → الكيموس', detail:'تسع 1-2 لتر. يبقى الطعام 2-4 ساعات. الكيموس يُدفع للاثني عشر عبر البواب.'},
  liver:         {name:'الكبد',             col:'#8B2020', func:'يُفرز العصارة الصفراوية لاستحلاب الدهون. يعالج الغذاء الممتص ويُخزِّن الجليكوجين', detail:'أكبر غدة في الجسم (~1.5 كغ). يُنتج 500-1000 مل صفراء/يوم. يُعطِّل السموم ويُنظِّم سكر الدم.'},
  gallbladder:   {name:'المرارة',           col:'#5B8C3A', func:'تُخزِّن وتُركِّز العصارة الصفراوية ثم تُطلقها عند وصول الدهون', detail:'حجمها 50 مل. الصفراء تستحلب الدهون ميكانيكياً لتُمكِّن الليبييز من الهضم الكيميائي.'},
  pancreas:      {name:'البنكرياس',         col:'#C8943A', func:'يُفرز: أميليز + تريبسين (بروتييز) + ليبييز + بيكربونات تُعادِل الكيموس الحمضي', detail:'غدة مزدوجة: هضمية + صماء (أنسولين/جلوكاجون). يُفرز ~1.5 لتر من العصارة البنكرياسية يومياً.'},
  smallIntestine:{name:'الأمعاء الدقيقة',  col:'#D06868', func:'الهضم الكامل + الامتصاص عبر الخملات (250م² سطح امتصاص)', detail:'طولها 5-7 أمتار (اثني عشر → صائم → لفائفي). الخملات والزغيبات تُضخِّم السطح. مدة الإقامة: 2-4 ساعات.'},
  largeIntestine:{name:'الأمعاء الغليظة', col:'#9050A0', func:'امتصاص الماء والأملاح + بكتيريا نافعة تُنتج فيتامين K + تشكيل البراز', detail:'طولها ~1.5 متر. تحتوي تريليونات البكتيريا النافعة. مدة الإقامة: 10-20 ساعة.'},
  rectum:        {name:'المستقيم والشرج',  col:'#A04040', func:'تخزين البراز في المستقيم حتى يُطرح عبر فتحة الشرج', detail:'المستقيم طوله ~15 سم. مصرّتان (داخلية وخارجية) تتحكمان في التبرّز.'},
};

/* ── hit zones للنقر ── */
function findOrganAtClick(mx, my, w, h) {
  const bx = w*0.5, headCY = h*0.10, headR = h*0.065;
  const zones = [
    {key:'mouth',         x:bx+w*0.04,  y:headCY+headR*0.25, r:h*0.055},
    {key:'esophagus',     x:bx-w*0.015, y:h*0.25,            r:h*0.04},
    {key:'liver',         x:bx+w*0.1,   y:h*0.38,            r:h*0.09},
    {key:'gallbladder',   x:bx+w*0.02,  y:h*0.505,           r:h*0.038},
    {key:'stomach',       x:bx-w*0.12,  y:h*0.43,            r:h*0.085},
    {key:'pancreas',      x:bx-w*0.08,  y:h*0.515,           r:h*0.055},
    {key:'smallIntestine',x:bx-w*0.02,  y:h*0.63,            r:h*0.135},
    {key:'largeIntestine',x:bx-w*0.25,  y:h*0.62,            r:h*0.05},
    {key:'rectum',        x:bx-w*0.01,  y:h*0.82,            r:h*0.045},
  ];
  for(const z of zones) {
    const dx=mx-z.x, dy=my-z.y;
    if(dx*dx+dy*dy < z.r*z.r) return z.key;
  }
  return null;
}

/* ════════════════════════════════════════════════
   نشاط ٣أ — الخريطة التشريحية التفاعلية
════════════════════════════════════════════════ */
function simG9Bio8N3a(){
  cancelAnimationFrame(animFrame);
  simState={t:0, selected:null};

  controls(`<div class="ctrl-section">
    <div class="ctrl-label">🫁 الجهاز الهضمي — انقري على أي عضو</div>
    <div id="organ_info" style="padding:12px;border-radius:10px;background:var(--bg-card2);min-height:100px;font-size:13px;line-height:1.85;transition:all 0.3s">
      <span style="color:var(--text-secondary)">← انقري على أي عضو في الرسم التشريحي</span>
    </div>
    <div style="margin-top:10px;padding:9px;background:rgba(16,185,129,0.08);border-radius:8px;border:1px solid rgba(16,185,129,0.2);font-size:12px;line-height:1.6">
      💡 القناة الهضمية من الفم للشرج: <strong>~9 أمتار</strong>
    </div>
    <div style="margin-top:8px;display:grid;grid-template-columns:1fr 1fr;gap:4px">
      ${Object.entries(organInfo).map(([k,v])=>`<button onclick="simState.selected='${k}'" id="orgbtnA_${k}" style="padding:5px 6px;border-radius:7px;border:1.5px solid ${v.col}44;background:var(--bg-ctrl-btn);font-family:Tajawal;font-size:11px;cursor:pointer;text-align:center;color:${v.col};font-weight:700;transition:all 0.2s">${v.name}</button>`).join('')}
    </div>
  </div>`);

  const cv = document.getElementById('simCanvas');
  cv.onclick = function(e){
    const rect = cv.getBoundingClientRect();
    const mx = (e.clientX-rect.left)*(cv.width/rect.width);
    const my = (e.clientY-rect.top)*(cv.height/rect.height);
    const found = findOrganAtClick(mx, my, cv.width, cv.height);
    if(found) { simState.selected = found; updateInfoPanel(found); }
  };

  function updateInfoPanel(key) {
    const info = organInfo[key];
    const el = document.getElementById('organ_info');
    if(el) el.innerHTML = `<strong style="color:${info.col};font-size:14px">${info.name}</strong><br>
      <span style="color:var(--text-secondary);font-size:12px;line-height:1.7">${info.func}</span>
      <div style="margin-top:7px;font-size:12px;color:var(--text-secondary);border-top:1px solid var(--border-color);padding-top:6px">${info.detail}</div>`;
    Object.keys(organInfo).forEach(k=>{
      const btn=document.getElementById(`orgbtnA_${k}`);
      if(btn){btn.style.background=k===key?organInfo[k].col+'33':'var(--bg-ctrl-btn)';btn.style.borderColor=k===key?organInfo[k].col:organInfo[k].col+'44';}
    });
  }

  let lastSel = null;
  function draw(){
    if(currentSim!=='g9bio8n3'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    simState.t += 0.016;
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,dark=dm15();
    c.fillStyle=bioBg(); c.fillRect(0,0,w,h);
    // طعام متحرك
    const foodProg = (simState.t*0.05)%1;
    drawAnatomicalBody(c,w,h,dark);
    drawAnatomicalOrgans(c,w,h,simState.t,simState.selected,dark);
    // طعام
    {
      const path=[
        {x:w*0.5+w*0.04, y:h*0.12},{x:w*0.5-w*0.015,y:h*0.25},
        {x:w*0.5-w*0.12, y:h*0.44},{x:w*0.5-w*0.02,  y:h*0.63},
        {x:w*0.5-w*0.25, y:h*0.62},{x:w*0.5-w*0.01,  y:h*0.82},
      ];
      const seg=Math.min(Math.floor(foodProg*(path.length-1)),path.length-2);
      const fr=(foodProg*(path.length-1))-seg;
      const fx=path[seg].x+(path[seg+1].x-path[seg].x)*fr;
      const fy=path[seg].y+(path[seg+1].y-path[seg].y)*fr;
      const grd=c.createRadialGradient(fx,fy,0,fx,fy,h*0.03);
      grd.addColorStop(0,'#FCD34DFF'); grd.addColorStop(1,'#FCD34D00');
      c.fillStyle=grd; c.beginPath();c.arc(fx,fy,h*0.03,0,Math.PI*2);c.fill();
      c.fillStyle='#FCD34D'; c.beginPath();c.arc(fx,fy,h*0.014,0,Math.PI*2);c.fill();
    }
    drawAnatomicalLabels(c,w,h,simState.selected,dark);
    if(simState.selected!==lastSel){lastSel=simState.selected;if(simState.selected)updateInfoPanel(simState.selected);}
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════════════
   نشاط ٣ب — وظائف الأعضاء التفصيلية
════════════════════════════════════════════════ */
function simG9Bio8N3b(){
  cancelAnimationFrame(animFrame);
  simState={t:0, selected:'stomach'};
  const organKeys=Object.keys(organInfo);

  let html=`<div class="ctrl-section"><div class="ctrl-label">📋 اختاري عضواً لرؤية وظيفته</div><div style="display:flex;flex-direction:column;gap:4px">`;
  organKeys.forEach(k=>{
    const info=organInfo[k];
    html+=`<button onclick="simState.selected='${k}'" id="orgbtnB_${k}" style="padding:7px 10px;border-radius:8px;border:2px solid ${info.col}33;background:var(--bg-ctrl-btn);font-family:Tajawal;font-size:12.5px;cursor:pointer;text-align:right;transition:all 0.2s;color:${info.col};font-weight:700">${info.name}</button>`;
  });
  html+=`</div><div id="organ_detailB" style="margin-top:8px;padding:11px;border-radius:10px;background:var(--bg-card2);font-size:12.5px;line-height:1.9;min-height:90px"></div></div>`;
  controls(html);

  const cv=document.getElementById('simCanvas');
  let lastSel=null;
  function draw(){
    if(currentSim!=='g9bio8n3'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.016;
    if(simState.selected!==lastSel){
      lastSel=simState.selected;
      const info=organInfo[simState.selected];
      const el=document.getElementById('organ_detailB');
      if(el) el.innerHTML=`<strong style="color:${info.col}">${info.name}:</strong><br>🔧 ${info.func}<br><br>📝 ${info.detail}`;
      organKeys.forEach(k=>{
        const btn=document.getElementById(`orgbtnB_${k}`);
        if(btn){btn.style.background=k===simState.selected?organInfo[k].col+'33':'var(--bg-ctrl-btn)';btn.style.borderColor=k===simState.selected?organInfo[k].col:organInfo[k].col+'33';}
      });
    }
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,dark=dm15();
    c.fillStyle=bioBg();c.fillRect(0,0,w,h);
    drawAnatomicalBody(c,w,h,dark);
    drawAnatomicalOrgans(c,w,h,simState.t,simState.selected,dark);
    drawAnatomicalLabels(c,w,h,simState.selected,dark);
    // نبضة حول العضو المحدد
    const info=organInfo[simState.selected];
    const pulse=0.4+Math.abs(Math.sin(simState.t*2.5))*0.6;
    const z=findOrganAtClick(w*0.5,h*0.5,w,h); // just for reference
    c.strokeStyle=info.col+Math.round(pulse*180).toString(16).padStart(2,'0');
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════════════
   نشاط ٣ج — رحلة الطعام التفصيلية
════════════════════════════════════════════════ */
function simG9Bio8N3c(){
  cancelAnimationFrame(animFrame);
  simState={t:0, step:0};

  const journey=[
    {organ:'mouth',         place:'الفم',              col:'#E07070', time:'~30 ثانية',  action:'الأسنان تقطع الطعام ميكانيكياً، اللعاب يُرطّبه، أميليز اللعاب يبدأ هضم النشا، اللسان يشكّل البلعة ويدفعها للبلع'},
    {organ:'esophagus',     place:'المريء',            col:'#C06080', time:'~10 ثوانٍ', action:'التمعّج يدفع البلعة للأسفل — أنبوب عضلي لا يهضم بل ينقل فقط. السرعة ~3-4 سم/ثانية'},
    {organ:'stomach',       place:'المعدة',            col:'#C87050', time:'2-4 ساعات', action:'HCl يقتل البكتيريا (pH=2)، البيبسين يهضم البروتين، تقلصات قوية تعجن الطعام → يتكوّن الكيموس'},
    {organ:'smallIntestine',place:'الأمعاء الدقيقة',  col:'#D06868', time:'2-4 ساعات', action:'العصارة الصفراوية تستحلب الدهون، إنزيمات البنكرياس تُكمل الهضم، الخملات تمتص الجلوكوز والأحماض الأمينية والدهون'},
    {organ:'largeIntestine',place:'الأمعاء الغليظة', col:'#9050A0', time:'10-20 ساعة', action:'الماء والأملاح تُمتص، بكتيريا نافعة تُنتج فيتامين K، البراز يتشكّل ويتكثّف تدريجياً'},
    {organ:'rectum',        place:'المستقيم والشرج',  col:'#A04040', time:'متغير',       action:'البراز يُخزَّن في المستقيم ثم يُطرح عبر فتحة الشرج — انتهاء رحلة الغذاء (~24-72 ساعة إجمالاً)'},
  ];

  controls(`<div class="ctrl-section">
    <div class="ctrl-label">🚶 رحلة الطعام — تتبّعي خطوة بخطوة</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">
      <button onclick="simState.step=Math.max(0,simState.step-1)" style="padding:8px;border-radius:8px;background:var(--bg-ctrl-btn);font-family:Tajawal;font-size:16px;border:1px solid var(--border-color);cursor:pointer">◀ السابق</button>
      <button onclick="simState.step=Math.min(${journey.length-1},simState.step+1)" style="padding:8px;border-radius:8px;background:#10B981;color:white;font-family:Tajawal;font-size:16px;border:none;cursor:pointer">التالي ▶</button>
    </div>
    <div style="display:flex;gap:3px;margin-bottom:8px">
      ${journey.map((j,i)=>`<div id="jp3_${i}" onclick="simState.step=${i}" style="flex:1;height:7px;border-radius:4px;background:${j.col}44;cursor:pointer;transition:all 0.3s"></div>`).join('')}
    </div>
    <div id="journey_info3" style="padding:11px;border-radius:10px;background:var(--bg-card2);font-size:12.5px;line-height:1.85;min-height:90px"></div>
  </div>`);

  const cv=document.getElementById('simCanvas');
  let lastStep=-1;
  function draw(){
    if(currentSim!=='g9bio8n3'||currentTab!==2){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.016;
    if(simState.step!==lastStep){
      lastStep=simState.step;
      const j=journey[simState.step];
      const el=document.getElementById('journey_info3');
      if(el) el.innerHTML=`<strong style="color:${j.col};font-size:14px">${j.place}</strong> <span style="background:${j.col}22;color:${j.col};padding:2px 8px;border-radius:20px;font-size:11px">${j.time}</span><br><span style="color:var(--text-secondary)">${j.action}</span>`;
      journey.forEach((_,i)=>{
        const bar=document.getElementById(`jp3_${i}`);
        if(bar){bar.style.background=i<=simState.step?journey[i].col:journey[i].col+'44';bar.style.height=i===simState.step?'10px':'7px';}
      });
    }
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,dark=dm15();
    c.fillStyle=bioBg();c.fillRect(0,0,w,h);
    const j=journey[simState.step];
    c.fillStyle=j.col+'07';c.fillRect(0,0,w,h);
    drawLabel(c,`${simState.step+1}/${journey.length}: ${j.place}`,w/2,h*0.05,j.col,Math.round(h*0.033));
    // الطعام عند موضع العضو
    const fp=simState.step/(journey.length-1)+Math.sin(simState.t*0.6)*0.015;
    drawAnatomicalBody(c,w,h,dark);
    drawAnatomicalOrgans(c,w,h,simState.t,j.organ,dark);
    drawAnatomicalLabels(c,w,h,j.organ,dark);
    // طعام
    const foodPath=[
      {x:w*0.5+w*0.04,y:h*0.12},{x:w*0.5-w*0.015,y:h*0.25},
      {x:w*0.5-w*0.12,y:h*0.44},{x:w*0.5-w*0.02,y:h*0.63},
      {x:w*0.5-w*0.25,y:h*0.62},{x:w*0.5-w*0.01,y:h*0.82},
    ];
    const si=Math.min(simState.step,foodPath.length-2);
    const pulse2=0.5+Math.abs(Math.sin(simState.t*3))*0.5;
    const fx=foodPath[si].x,fy=foodPath[si].y;
    c.fillStyle=j.col+Math.round(pulse2*120).toString(16).padStart(2,'0');
    c.beginPath();c.arc(fx,fy,h*0.04,0,Math.PI*2);c.fill();
    c.fillStyle='#FCD34D';c.beginPath();c.arc(fx,fy,h*0.016,0,Math.PI*2);c.fill();
    c.fillStyle='#92400E';c.font=`bold ${Math.round(h*0.018)}px Tajawal`;c.textAlign='center';c.fillText('طعام',fx,fy-h*0.032);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════════════
   نشاط ٤-٨ · الأنزيمات الهضمية
════════════════════════════════════════════════ */
function simG9Bio8N4a(){
  cancelAnimationFrame(animFrame);
  simState={t:0};
  controls(`<div class="ctrl-section">
    <div class="ctrl-label">🌾 الأميليز — هضم النشا</div>
    <div style="display:flex;flex-direction:column;gap:7px">
      <div style="padding:10px;background:rgba(253,224,71,0.12);border-radius:9px;border:1px solid rgba(253,224,71,0.3);font-size:12.5px;line-height:1.8">
        <strong style="color:#D97706">الأميليز (Amylase)</strong><br>
        يهضم النشا → جلوكوز<br>
        📍 <strong>الفم</strong>: أميليز اللعاب (يبدأ)<br>
        📍 <strong>البنكرياس</strong>: أميليز البنكرياس (يُكمل في الأمعاء الدقيقة)
      </div>
      <div style="padding:9px;background:rgba(74,222,128,0.1);border-radius:8px;border:1px solid rgba(74,222,128,0.25);font-size:12px">
        <strong style="color:#10B981">التفاعل:</strong><br>
        (C₆H₁₀O₅)ₙ + H₂O → n × C₆H₁₂O₆<br>
        النشا → جلوكوز
      </div>
    </div>
  </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio8n4'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.016;
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,dark=dm15();
    c.fillStyle=bioBg();c.fillRect(0,0,w,h);

    // جسم كامل يسار
    const scaleX=w*0.38/w, scaleY=Math.min(scaleX,0.75);
    c.save();c.translate(0,(h-h*scaleY)*0.5);c.scale(scaleX,scaleY);
    drawAnatomicalBody(c,w,h,dark);
    drawAnatomicalOrgans(c,w,h,simState.t,'mouth',dark);
    c.restore();
    c.fillStyle=dark?'#FCD34D':'#D97706';
    c.font=`bold ${Math.round(h*0.024)}px Tajawal`;c.textAlign='center';
    c.fillText('🌾 الفم والبنكرياس',w*0.19,h*0.94);

    // لوحة التفاعل يمين
    const px=w*0.40, pw=w*0.58;
    // حجم العقدة ثابت مناسب
    const nodeR = Math.min(h*0.048, pw/20);

    // مناطق Y مع فراغات كافية
    const titleY  = h*0.08;
    const scissors = h*0.20;          // المقص
    const chainY  = h*0.30;           // مركز سلسلة النشا
    const arrowY1 = chainY+nodeR+h*0.04;
    const arrowY2 = arrowY1+h*0.07;
    const resultLabelY = arrowY2+h*0.04;
    const productY = resultLabelY+h*0.07; // مركز دوائر الجلوكوز

    // عنوان
    drawLabel(c,'سلسلة النشا (C₆H₁₀O₅)ₙ',px+pw/2,titleY,dark?'#FCD34D':'#D97706',Math.round(h*0.028));

    const n=8;
    const startX=px+pw*0.06, endX=px+pw*0.94, step=(endX-startX)/(n-1);

    // روابط
    for(let i=0;i<n-1;i++){
      c.strokeStyle=dark?'#FCD34D44':'#CA8A0444';c.lineWidth=3;
      c.beginPath();c.moveTo(startX+i*step+nodeR,chainY);c.lineTo(startX+(i+1)*step-nodeR,chainY);c.stroke();
    }
    // عقد النشا
    for(let i=0;i<n;i++){
      const nx=startX+i*step;
      const wave=Math.sin(simState.t*1.5+i*0.4)*h*0.006;
      c.fillStyle=dark?'rgba(253,224,71,0.65)':'rgba(254,240,138,0.95)';
      c.beginPath();c.arc(nx,chainY+wave,nodeR,0,Math.PI*2);c.fill();
      c.strokeStyle=dark?'#FCD34D':'#CA8A04';c.lineWidth=2;c.stroke();
      c.fillStyle=dark?'#FCD34D':'#92400E';
      c.font=`bold ${Math.round(nodeR*0.55)}px Tajawal`;c.textAlign='center';
      c.fillText('C₆',nx,chainY+wave+nodeR*0.22);
    }

    // أميليز (مقص) — فوق السلسلة
    const ap=((simState.t*0.25)%1);
    const ax=startX+ap*(endX-startX);
    c.font=`${Math.round(nodeR*1.3)}px serif`;c.textAlign='center';
    c.fillText('✂️',ax,scissors+nodeR*0.3);
    c.fillStyle=dark?'#A78BFA':'#6D28D9';
    c.font=`bold ${Math.round(h*0.022)}px Tajawal`;c.textAlign='center';
    c.fillText('أميليز',ax,scissors-h*0.01);

    // سهم
    drawArrow(c,px+pw/2,arrowY1,px+pw/2,arrowY2,dark?'#4ADE80':'#15803D',2.5,10);

    // عنوان الناتج
    c.fillStyle=dark?'#4ADE80':'#15803D';
    c.font=`bold ${Math.round(h*0.024)}px Tajawal`;c.textAlign='center';
    c.fillText('جزيئات جلوكوز (C₆H₁₂O₆) — قابلة للامتصاص ✓',px+pw/2,resultLabelY);

    // دوائر الجلوكوز — أصغر من النشا لتناسب
    const gNodeR = nodeR*0.82;
    for(let gi=0;gi<n;gi++){
      const gx=startX+gi*step;
      const pp=(simState.t*0.25)%1;
      const appear=gi<Math.floor(pp*n+1)?1:0.2;
      c.fillStyle=dark?`rgba(134,239,172,${0.3+appear*0.6})`:`rgba(187,247,208,${0.5+appear*0.4})`;
      c.beginPath();c.arc(gx,productY+Math.sin(simState.t+gi)*h*0.010,gNodeR,0,Math.PI*2);c.fill();
      c.strokeStyle=dark?`rgba(74,222,128,${appear})`:`rgba(21,128,61,${appear})`;c.lineWidth=1.5;c.stroke();
    }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}
function simG9Bio8N4b(){
  cancelAnimationFrame(animFrame);
  simState={t:0};
  controls(`<div class="ctrl-section">
    <div class="ctrl-label">🐟 البروتييز — هضم البروتين</div>
    <div style="display:flex;flex-direction:column;gap:7px">
      <div style="padding:10px;background:rgba(252,165,165,0.12);border-radius:9px;border:1px solid rgba(252,165,165,0.3);font-size:12.5px;line-height:1.8">
        <strong style="color:#DC2626">البروتييز (Protease)</strong><br>
        📍 <strong>المعدة</strong>: بيبسين (pH=2) — يبدأ<br>
        📍 <strong>البنكرياس</strong>: تريبسين (pH=8) — يُكمل<br>
        🔗 يقطع الروابط الببتيدية
      </div>
      <div style="padding:9px;background:rgba(96,165,250,0.1);border-radius:8px;border:1px solid rgba(96,165,250,0.25);font-size:12px">
        <strong style="color:#2563EB">الناتج:</strong><br>
        بروتين → أحماض أمينية حرّة (NH₂-CHR-COOH)
      </div>
    </div>
  </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio8n4'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.016;
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,dark=dm15();
    c.fillStyle=bioBg();c.fillRect(0,0,w,h);

    // جسم كامل يسار
    const scaleX=w*0.38/w, scaleY=Math.min(scaleX,0.75);
    c.save();c.translate(0,(h-h*scaleY)*0.5);c.scale(scaleX,scaleY);
    drawAnatomicalBody(c,w,h,dark);
    drawAnatomicalOrgans(c,w,h,simState.t,'stomach',dark);
    c.restore();
    c.fillStyle=dark?'#FCA5A5':'#DC2626';
    c.font=`bold ${Math.round(h*0.024)}px Tajawal`;c.textAlign='center';
    c.fillText('🐟 المعدة والبنكرياس',w*0.19,h*0.94);

    // لوحة
    const px=w*0.40, pw=w*0.58;
    const nodeR = Math.min(h*0.044, pw/24);

    const titleY   = h*0.08;
    const scissors = h*0.19;
    const chainY   = h*0.30;
    const arrowY1  = chainY+nodeR+h*0.04;
    const arrowY2  = arrowY1+h*0.07;
    const resultLabelY = arrowY2+h*0.04;
    const productY = resultLabelY+h*0.07;

    drawLabel(c,'سلسلة بروتين (روابط ببتيدية)',px+pw/2,titleY,dark?'#FCA5A5':'#DC2626',Math.round(h*0.027));

    const n=10;
    const startX=px+pw*0.04, endX=px+pw*0.96, step=(endX-startX)/(n-1);
    const aaNames=['Ala','Gly','Lys','Phe','Ser','Pro','Thr','Val','Ile','Leu'];

    // روابط ببتيدية
    for(let i=0;i<n-1;i++){
      const nx=startX+i*step, nx2=startX+(i+1)*step;
      c.strokeStyle=dark?'#FCA5A544':'#DC262633';c.lineWidth=3;
      c.beginPath();c.moveTo(nx+nodeR,chainY);c.lineTo(nx2-nodeR,chainY);c.stroke();
      // نص CO-NH بين العقد — فوق الخط
      c.fillStyle=dark?'#FCA5A555':'#DC262644';
      c.font=`${Math.round(nodeR*0.42)}px Tajawal`;c.textAlign='center';
      c.fillText('CO-NH',(nx+nx2)/2,chainY-nodeR*0.9);
    }
    // عقد البروتين
    for(let i=0;i<n;i++){
      const nx=startX+i*step;
      c.fillStyle=dark?'rgba(252,165,165,0.55)':'rgba(254,226,226,0.92)';
      c.beginPath();c.arc(nx,chainY,nodeR,0,Math.PI*2);c.fill();
      c.strokeStyle=dark?'#FCA5A5':'#DC2626';c.lineWidth=1.8;c.stroke();
      c.fillStyle=dark?'#FCA5A5':'#B91C1C';
      c.font=`bold ${Math.round(nodeR*0.50)}px Tajawal`;c.textAlign='center';
      c.fillText(aaNames[i],nx,chainY+nodeR*0.22);
    }

    // بروتييز
    const ap=((simState.t*0.28)%1);
    const bx=startX+ap*(endX-startX);
    c.font=`${Math.round(nodeR*1.3)}px serif`;c.textAlign='center';c.fillText('✂️',bx,scissors+nodeR*0.3);
    c.fillStyle=dark?'#A78BFA':'#6D28D9';
    c.font=`bold ${Math.round(h*0.021)}px Tajawal`;c.textAlign='center';
    c.fillText('بروتييز',bx,scissors-h*0.01);

    // سهم
    drawArrow(c,px+pw/2,arrowY1,px+pw/2,arrowY2,dark?'#60A5FA':'#2563EB',2.5,10);

    // عنوان الناتج
    c.fillStyle=dark?'#60A5FA':'#1D4ED8';
    c.font=`bold ${Math.round(h*0.023)}px Tajawal`;c.textAlign='center';
    c.fillText('أحماض أمينية حرّة — قابلة للامتصاص ✓',px+pw/2,resultLabelY);

    // دوائر الأحماض الأمينية — 8 فقط لأنها أوسع قليلاً
    const showN=8;
    const gNodeR=nodeR*0.78;
    const gStep=(endX-startX)/(showN-1);
    for(let gi=0;gi<showN;gi++){
      const gx=startX+gi*gStep;
      const pp=(simState.t*0.28)%1, appear=gi<Math.floor(pp*showN+1)?1:0.2;
      c.fillStyle=dark?`rgba(96,165,250,${0.3+appear*0.6})`:`rgba(219,234,254,${0.5+appear*0.4})`;
      c.beginPath();c.arc(gx,productY+Math.sin(simState.t+gi)*h*0.009,gNodeR,0,Math.PI*2);c.fill();
      c.strokeStyle=dark?`rgba(96,165,250,${appear})`:`rgba(37,99,235,${appear})`;c.lineWidth=1.5;c.stroke();
      c.fillStyle=dark?`rgba(96,165,250,${appear})`:`rgba(37,99,235,${appear})`;
      c.font=`${Math.round(gNodeR*0.46)}px Tajawal`;c.textAlign='center';
      c.fillText(aaNames[gi%10],gx,productY+Math.sin(simState.t+gi)*h*0.009+gNodeR*0.22);
    }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}
function simG9Bio8N4c(){
  cancelAnimationFrame(animFrame);
  simState={t:0, showBile:false};
  controls(`<div class="ctrl-section">
    <div class="ctrl-label">🧈 الليبييز — هضم الدهون</div>
    <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:8px">الدهون لا تذوب في الماء — تحتاج العصارة الصفراوية أولاً</div>
    <button onclick="simState.showBile=!simState.showBile"
      style="width:100%;padding:9px;border-radius:9px;background:#D97706;color:white;font-family:Tajawal;font-weight:700;font-size:14px;border:none;cursor:pointer">
      🟡 إضافة / إزالة العصارة الصفراوية
    </button>
    <div style="margin-top:8px;padding:9px;background:rgba(217,119,6,0.1);border-radius:8px;border:1px solid rgba(217,119,6,0.25);font-size:12px;line-height:1.7">
      <strong style="color:#D97706">الخطوات:</strong><br>
      1️⃣ العصارة تستحلب الدهون (ميكانيكي)<br>
      2️⃣ الليبييز يهضم القطرات الصغيرة (كيميائي)<br>
      3️⃣ الناتج: أحماض دهنية + جليسرول
    </div>
  </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio8n4'||currentTab!==2){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.016;
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,dark=dm15();
    c.fillStyle=bioBg();c.fillRect(0,0,w,h);

    // جسم كامل يسار
    const scaleX=w*0.38/w, scaleY=Math.min(scaleX,0.75);
    const offY=(h-h*scaleY)*0.5;
    c.save();c.translate(0,offY);c.scale(scaleX,scaleY);
    drawAnatomicalBody(c,w,h,dark);
    drawAnatomicalOrgans(c,w,h,simState.t,'pancreas',dark);
    c.restore();
    c.fillStyle=dark?'#FDE68A':'#D97706';
    c.font=`bold ${Math.round(h*0.025)}px Tajawal`;c.textAlign='center';
    c.fillText('🧈 البنكرياس والأمعاء الدقيقة', w*0.19, h*0.94);

    // لوحة الدهون
    const px=w*0.40, py=h*0.08, pw=w*0.58, ph=h*0.84;

    const stateLabel = simState.showBile ? 'بعد الاستحلاب — قطرات صغيرة ✅' : 'قبل الاستحلاب — قطرات كبيرة ⚠️';
    const stateCol = simState.showBile ? (dark?'#4ADE80':'#15803D') : (dark?'#FDE68A':'#D97706');
    drawLabel(c, stateLabel, px+pw/2, py+h*0.06, stateCol, Math.round(h*0.026));

    if(!simState.showBile){
      // قطرات دهن كبيرة — خمس قطرات مرتبة بشكل شبكي
      const drops=[[0.22,0.30,0.115],[0.55,0.25,0.10],[0.82,0.32,0.105],[0.30,0.58,0.09],[0.68,0.56,0.095]];
      drops.forEach(([bx,by,br])=>{
        const cx=px+pw*bx, cy=py+ph*by, r=ph*br;
        c.fillStyle=dark?'rgba(253,230,138,0.55)':'rgba(254,240,138,0.90)';
        c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.fill();
        c.strokeStyle=dark?'#FDE68A':'#D97706';c.lineWidth=2.5;c.stroke();
        c.font=`${Math.round(r*0.65)}px serif`;c.textAlign='center';
        c.fillText('🧈',cx,cy+r*0.28);
      });
      c.fillStyle=dark?'#F87171':'#DC2626';
      c.font=`bold ${Math.round(h*0.022)}px Tajawal`;c.textAlign='center';
      c.fillText('⚠️ سطح صغير — الليبييز لا يعمل بكفاءة',px+pw/2,py+ph*0.84);
    } else {
      // قطرات صغيرة كثيرة مع مقصات
      for(let di=0;di<40;di++){
        const angle=(di/40)*Math.PI*2*4+simState.t*(0.08+di*0.002);
        const r2=ph*(0.07+Math.sin(di*1.7)*0.10);
        const cx2=px+pw*0.5+Math.cos(angle)*r2*1.15;
        const cy2=py+ph*0.42+Math.sin(angle)*r2*0.72;
        c.fillStyle=dark?'rgba(253,230,138,0.55)':'rgba(254,240,138,0.78)';
        c.beginPath();c.arc(cx2,cy2,h*0.021,0,Math.PI*2);c.fill();
        c.strokeStyle=dark?'#FDE68A':'#D97706';c.lineWidth=1;c.stroke();
        if(di%6===0){c.font=`${Math.round(h*0.022)}px serif`;c.textAlign='center';c.fillText('✂️',cx2,cy2-h*0.023);}
      }
      // ناتجان
      const products=[[0.22,0.83,'أحماض دهنية','#C4B5FD'],[0.75,0.83,'جليسرول','#86EFAC']];
      products.forEach(([bx,by,lbl,col])=>{
        const cx=px+pw*bx;
        c.fillStyle=col+'44';c.beginPath();c.roundRect(cx-pw*0.14,py+ph*by-ph*0.055,pw*0.28,ph*0.11,8);c.fill();
        c.strokeStyle=col;c.lineWidth=2;c.stroke();
        c.fillStyle=col;c.font=`bold ${Math.round(h*0.024)}px Tajawal`;c.textAlign='center';
        c.fillText(lbl,cx,py+ph*by+ph*0.022);
      });
      c.fillStyle=dark?'#4ADE80':'#15803D';
      c.font=`bold ${Math.round(h*0.022)}px Tajawal`;c.textAlign='center';
      c.fillText('✅ سطح ضخم — الليبييز يعمل بكفاءة عالية',px+pw/2,py+ph*0.78);
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}
function simG9Bio8N5a(){
  cancelAnimationFrame(animFrame);
  simState={t:0};
  controls(`<div class="ctrl-section">
    <div class="ctrl-label">🟡 العُصارة الصفراوية</div>
    <div style="display:flex;flex-direction:column;gap:6px">
      <div style="padding:9px;background:rgba(202,138,4,0.12);border-radius:9px;border:1px solid rgba(202,138,4,0.3);font-size:12.5px;line-height:1.8">
        <strong style="color:#CA8A04">المسار:</strong><br>
        🏥 الكبد ← يُفرزها<br>
        🟢 المرارة ← تُخزِّنها<br>
        🟡 قناة صفراوية مشتركة ← تنقلها<br>
        🌿 الاثني عشر ← تصل هنا
      </div>
      <div style="padding:9px;background:rgba(109,40,217,0.1);border-radius:8px;border:1px solid rgba(109,40,217,0.25);font-size:12px;line-height:1.7">
        <strong style="color:#7C3AED">⚠️ لا تحتوي أنزيمات</strong><br>
        تستحلب الدهون ميكانيكياً فقط<br>
        تحتوي بيكربونات لتعديل pH الكيموس
      </div>
    </div>
  </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio8n5'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.016;
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,dark=dm15();
    c.fillStyle=bioBg();c.fillRect(0,0,w,h);
    drawLabel(c,'مسار العصارة الصفراوية في الجسم',w/2,h*0.05,bioTxt(),Math.round(h*0.033));

    drawAnatomicalBody(c,w,h,dark);
    drawAnatomicalOrgans(c,w,h,simState.t,'liver',dark);
    // تسميات مختارة فقط (بدون كل التسميات لتفادي التداخل)
    const bx=w*0.5;
    const organLabels=[
      {key:'liver',   name:'الكبد',   ox:bx+w*0.1,  oy:h*0.37, lx:w*0.08, ly:h*0.34, col:'#8B2020'},
      {key:'gallbladder', name:'المرارة', ox:bx+w*0.03, oy:h*0.505,lx:w*0.08, ly:h*0.48, col:'#5B8C3A'},
      {key:'smallIntestine',name:'الاثني عشر',ox:bx-w*0.05,oy:h*0.535,lx:w*0.88,ly:h*0.55,col:'#D06868'},
    ];
    organLabels.forEach(lb=>{
      const isSel = lb.key==='liver';
      c.strokeStyle=isSel?lb.col:lb.col+'99';c.lineWidth=isSel?1.8:1.2;c.setLineDash([]);
      c.beginPath();c.moveTo(lb.ox,lb.oy);
      const midX=lb.lx>bx?lb.lx-w*0.07:lb.lx+w*0.07;
      c.lineTo(midX,lb.ly);c.lineTo(lb.lx,lb.ly);c.stroke();
      c.fillStyle=lb.col;c.beginPath();c.arc(lb.ox,lb.oy,isSel?4:3,0,Math.PI*2);c.fill();
      const align=lb.lx>bx?'right':'left';
      c.fillStyle=isSel?lb.col:(dark?'#E5E7EB':'#1F2937');
      c.font=`${isSel?'bold ':''}${Math.round(h*0.030)}px Tajawal`;
      c.textAlign=align;
      c.fillText(lb.name,lb.lx+(align==='left'?6:-6),lb.ly+5);
    });

    // مسار الصفراء
    const livPt ={x:bx+w*0.1,   y:h*0.39};
    const gallPt={x:bx+w*0.03,  y:h*0.505};
    const duoPt ={x:bx-w*0.08,  y:h*0.535};

    c.strokeStyle=dark?'#FCD34DCC':'#D97706CC';c.lineWidth=3.5;c.setLineDash([6,3]);
    c.beginPath();
    c.moveTo(livPt.x,livPt.y);
    c.bezierCurveTo(livPt.x-w*0.04,livPt.y+h*0.03,gallPt.x+w*0.04,gallPt.y-h*0.02,gallPt.x,gallPt.y);
    c.stroke();
    c.beginPath();
    c.moveTo(gallPt.x,gallPt.y);
    c.bezierCurveTo(gallPt.x-w*0.04,gallPt.y+h*0.01,duoPt.x+w*0.04,duoPt.y-h*0.01,duoPt.x,duoPt.y);
    c.stroke();
    c.setLineDash([]);

    // قطرات عصارة متحركة
    for(let pi=0;pi<5;pi++){
      const pp=((simState.t*0.4+pi*0.2)%2);
      let fx,fy;
      if(pp<1){
        fx=livPt.x+(gallPt.x-livPt.x)*pp;
        fy=livPt.y+(gallPt.y-livPt.y)*pp+Math.sin(pp*Math.PI)*h*0.02;
      } else {
        const fr=pp-1;
        fx=gallPt.x+(duoPt.x-gallPt.x)*fr;
        fy=gallPt.y+(duoPt.y-gallPt.y)*fr;
      }
      c.fillStyle=dark?'rgba(253,224,71,0.9)':'rgba(202,138,4,0.85)';
      c.beginPath();c.arc(fx,fy,h*0.014,0,Math.PI*2);c.fill();
    }

    // تسميات النقاط (فوق النقاط مباشرة)
    const ptLabels=[
      [livPt, 'يُفرزها', '#8B2020', 'right'],
      [gallPt,'تُخزِّنها','#5B8C3A','left'],
      [duoPt, 'تصل هنا','#D06868','left'],
    ];
    ptLabels.forEach(([pt,lbl,col,align])=>{
      c.fillStyle=col;c.font=`bold ${Math.round(h*0.020)}px Tajawal`;
      c.textAlign=align;
      const tx=align==='right'?pt.x-w*0.015:pt.x+w*0.015;
      c.fillText(lbl,tx,pt.y-h*0.025);
    });

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}
function simG9Bio8N5b(){
  cancelAnimationFrame(animFrame);
  simState={t:0,emulsified:false,lipaseActive:false};

  controls(`<div class="ctrl-section">
    <div class="ctrl-label">💧 استحلاب الدهون — تجربة تفاعلية</div>
    <div style="font-size:13px;color:var(--text-secondary);margin-bottom:10px">شاهدي كيف تُحسِّن العصارة الصفراوية من عمل الليبييز</div>
    <div style="display:flex;flex-direction:column;gap:7px">
      <button onclick="simState.emulsified=!simState.emulsified" style="padding:9px;border-radius:8px;background:#D97706;color:white;font-family:Tajawal;font-weight:700;font-size:14px;border:none;cursor:pointer">🟡 العصارة الصفراوية (الاستحلاب)</button>
      <button onclick="simState.lipaseActive=!simState.lipaseActive" style="padding:9px;border-radius:8px;background:#7C3AED;color:white;font-family:Tajawal;font-weight:700;font-size:14px;border:none;cursor:pointer">✂️ تفعيل الليبييز</button>
      <button onclick="simState.emulsified=false;simState.lipaseActive=false" style="padding:9px;border-radius:8px;background:var(--bg-ctrl-btn);font-family:Tajawal;font-size:13px;border:1px solid var(--border-color);cursor:pointer">🔄 إعادة تعيين</button>
    </div>
    <div id="emul_info" style="margin-top:10px;padding:10px;border-radius:10px;background:var(--bg-card2);font-size:12.5px;line-height:1.8;min-height:60px"></div>
  </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio8n5'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.015;
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,dark=dm15();
    c.fillStyle=bioBg();c.fillRect(0,0,w,h);

    const infoEl=document.getElementById('emul_info');
    if(!simState.emulsified){
      drawLabel(c,'قبل الاستحلاب — قطرات دهن كبيرة',w/2,h*0.09,dark?'#FDE68A':'#D97706',Math.round(h*0.034));
      // 5 قطرات كبيرة
      [[0.25,0.38,0.1],[0.52,0.3,0.09],[0.72,0.41,0.1],[0.4,0.58,0.09],[0.65,0.58,0.08]].forEach(([bx,by,br])=>{
        c.fillStyle=dark?'rgba(253,230,138,0.45)':'rgba(254,240,138,0.85)';
        c.beginPath();c.arc(w*bx,h*by,h*br,0,Math.PI*2);c.fill();
        c.strokeStyle=dark?'#FDE68A':'#D97706';c.lineWidth=2.5;c.stroke();
        c.font=`${Math.round(h*br*0.6)}px serif`;c.textAlign='center';c.fillText('🧈',w*bx,h*by+h*br*0.25);
        // ليبييز لا يستطيع الدخول
        if(simState.lipaseActive){
          c.font=`${Math.round(h*0.03)}px serif`;c.fillText('✂️',w*bx+h*br,h*by-h*br);
          c.strokeStyle='#EF4444';c.lineWidth=2;
          c.beginPath();c.moveTo(w*bx+h*br-h*0.015,h*by-h*br-h*0.01);c.lineTo(w*bx+h*br+h*0.015,h*by-h*br+h*0.01);c.stroke();
        }
      });
      c.fillStyle=dark?'#F87171':'#DC2626';c.font=`bold ${Math.round(h*0.025)}px Tajawal`;c.textAlign='center';
      c.fillText('⚠️ السطح الكلي صغير — الليبييز يعمل ببطء',w/2,h*0.8);
      if(infoEl)infoEl.innerHTML='<strong style="color:#D97706">قبل الاستحلاب:</strong> 5 قطرات كبيرة فقط — الليبييز لا يمكنه الوصول لداخل القطرات. أضيفي العصارة الصفراوية!';
    } else {
      // قطرات صغيرة جداً
      const numD=simState.lipaseActive?50:40;
      drawLabel(c,simState.lipaseActive?'الليبييز يهضم القطرات الصغيرة ✓':'بعد الاستحلاب — قطرات صغيرة كثيرة',w/2,h*0.09,simState.lipaseActive?dark?'#4ADE80':'#15803D':dark?'#FDE68A':'#D97706',Math.round(h*0.034));
      for(let di=0;di<numD;di++){
        const angle=(di/numD)*Math.PI*2*4+simState.t*(0.12+di*0.002);
        const r2=h*(0.05+Math.sin(di*1.7)*0.14);
        const dx=w*0.5+Math.cos(angle)*r2*1.3,dy=h*0.45+Math.sin(angle)*r2*0.75;
        if(simState.lipaseActive&&di%7===0){
          // منتجات الهضم
          c.fillStyle=dark?'rgba(196,181,253,0.7)':'rgba(237,233,254,0.85)';
          c.beginPath();c.arc(dx,dy,h*0.016,0,Math.PI*2);c.fill();
        } else {
          c.fillStyle=dark?'rgba(253,230,138,0.5)':'rgba(254,240,138,0.75)';
          c.beginPath();c.arc(dx,dy,h*(simState.lipaseActive?0.018:0.025),0,Math.PI*2);c.fill();
          c.strokeStyle=dark?'#FDE68A':'#D97706';c.lineWidth=1;c.stroke();
          if(simState.lipaseActive&&di%4===0){
            c.font=`${Math.round(h*0.02)}px serif`;c.textAlign='center';c.fillText('✂️',dx,dy-h*0.02);
          }
        }
      }
      if(!simState.lipaseActive){
        c.fillStyle=dark?'#4ADE80':'#15803D';c.font=`bold ${Math.round(h*0.025)}px Tajawal`;c.textAlign='center';
        c.fillText('✅ السطح الكلي ضخم جداً — جاهز للليبييز',w/2,h*0.8);
        if(infoEl)infoEl.innerHTML='<strong style="color:#15803D">✅ بعد الاستحلاب:</strong> الدهون تحوّلت لقطرات صغيرة كثيرة — السطح الكلي تضاعف مئات المرات! الآن فعِّلي الليبييز.';
      } else {
        // نواتج
        [[0.2,0.83,'أحماض دهنية'],[0.6,0.83,'جليسرول']].forEach(([px,py,lbl])=>{
          c.fillStyle=dark?'rgba(196,181,253,0.35)':'rgba(237,233,254,0.8)';c.beginPath();c.roundRect(w*px-w*0.12,h*py-h*0.035,w*0.24,h*0.075,8);c.fill();
          c.strokeStyle=dark?'#C4B5FD':'#7C3AED';c.lineWidth=2;c.stroke();
          c.fillStyle=dark?'#C4B5FD':'#6D28D9';c.font=`bold ${Math.round(h*0.024)}px Tajawal`;c.textAlign='center';c.fillText(lbl,w*px,h*py+h*0.015);
        });
        if(infoEl)infoEl.innerHTML='<strong style="color:#10B981">🎉 هضم الدهون مكتمل:</strong> الليبييز يهضم القطرات الصغيرة → أحماض دهنية + جليسرول قابلان للامتصاص في الأوعية اللمفاوية!';
      }
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG9Bio8N5c(){
  cancelAnimationFrame(animFrame);
  simState={t:0};
  controls(`<div class="ctrl-section">
    <div class="ctrl-label">🫁 البنكرياس — مصنع الأنزيمات</div>
    <div style="display:flex;flex-direction:column;gap:6px">
      <div style="padding:9px;background:rgba(124,58,237,0.12);border-radius:9px;border:1px solid rgba(124,58,237,0.3);font-size:12.5px;line-height:1.8">
        <strong style="color:#7C3AED">العُصارة البنكرياسية تحتوي:</strong><br>
        🌾 أميليز → يهضم النشا<br>
        🐟 تريبسين → يهضم البروتين<br>
        🧈 ليبييز → يهضم الدهون<br>
        ⚗️ NaHCO₃ → يُعادِل الكيموس (pH=8)
      </div>
      <div style="padding:8px;background:rgba(124,58,237,0.08);border-radius:8px;border:1px solid rgba(124,58,237,0.2);font-size:12px">
        💡 غدة مزدوجة: هضمية (أنزيمات) + صماء (أنسولين/جلوكاجون)
      </div>
    </div>
  </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio8n5'||currentTab!==2){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.016;
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,dark=dm15();
    c.fillStyle=bioBg();c.fillRect(0,0,w,h);
    drawLabel(c,'البنكرياس — يُفرز الأنزيمات للأمعاء الدقيقة',w/2,h*0.05,bioTxt(),Math.round(h*0.033));

    drawAnatomicalBody(c,w,h,dark);
    drawAnatomicalOrgans(c,w,h,simState.t,'pancreas',dark);
    drawAnatomicalLabels(c,w,h,'pancreas',dark);

    const bx=w*0.5,panPt={x:bx-w*0.08,y:h*0.515},siPt={x:bx-w*0.02,y:h*0.58};
    const enzymes=[
      {name:'أميليز',col:'#FCD34D'},{name:'تريبسين',col:'#FCA5A5'},
      {name:'ليبييز',col:'#86EFAC'},{name:'NaHCO₃',col:'#93C5FD'},
    ];
    enzymes.forEach((e,i)=>{
      const drop=((simState.t*0.5+i*0.25)%1);
      const ex=panPt.x+(siPt.x-panPt.x)*drop+Math.sin(drop*Math.PI)*w*0.03;
      const ey=panPt.y+(siPt.y-panPt.y)*drop;
      c.fillStyle=e.col+'BB';c.beginPath();c.arc(ex,ey,h*0.016,0,Math.PI*2);c.fill();
      c.strokeStyle=e.col;c.lineWidth=1.5;c.stroke();
      if(drop<0.15||drop>0.85){
        c.fillStyle=e.col;c.font=`bold ${Math.round(h*0.018)}px Tajawal`;c.textAlign='center';
        c.fillText(e.name,ex,ey-h*0.025);
      }
    });

    c.strokeStyle=dark?'#C4B5FD55':'#7C3AED44';c.lineWidth=3;c.setLineDash([4,3]);
    c.beginPath();c.moveTo(panPt.x,panPt.y);
    c.bezierCurveTo(panPt.x+w*0.02,panPt.y+h*0.02,siPt.x-w*0.02,siPt.y-h*0.02,siPt.x,siPt.y);
    c.stroke();c.setLineDash([]);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}
function simG9Bio8N6a(){
  cancelAnimationFrame(animFrame);
  simState={t:0};

  controls(bioInfoPanel([
    '🌿 <strong>الخملات (Villi)</strong>: نتوءات إصبعية على جدار الأمعاء الدقيقة، طولها 0.5-1.5مم',
    '🔬 كل خملة مُغطّاة بزغيبات (Microvilli) تزيد السطح أكثر',
    '🩸 داخل كل خملة: شُعيرات دموية تمتص السكريات والأحماض الأمينية',
    '🌊 وعاء لمفاوي (كيلوس) يمتص الأحماض الدهنية والجليسرول',
    '📐 مجموع السطح: من ~1م² (أنبوب أملس) → ~250م² مع الخملات!',
  ],'🔬 تركيب الخملة الواحدة — مقطع عرضي'));

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio8n6'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.012;
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,dark=dm15();
    c.fillStyle=bioBg();c.fillRect(0,0,w,h);
    drawLabel(c,'تركيب الخملة الواحدة — مقطع تفصيلي',w/2,h*0.07,bioTxt(),Math.round(h*0.035));

    const vcx=w*0.5,vtop=h*0.14,vbot=h*0.82,vwTop=w*0.16,vwBot=w*0.22;
    // جسم الخملة
    c.fillStyle=dark?'rgba(134,239,172,0.2)':'rgba(187,247,208,0.7)';
    c.beginPath();
    c.moveTo(vcx-vwBot/2,vbot);
    c.lineTo(vcx-vwTop/2,vtop+h*0.04);
    c.quadraticCurveTo(vcx,vtop,vcx+vwTop/2,vtop+h*0.04);
    c.lineTo(vcx+vwBot/2,vbot);
    c.closePath();c.fill();
    c.strokeStyle=dark?'#4ADE80':'#15803D';c.lineWidth=2.5;c.stroke();

    // طبقة الظهارة (جدار الخملة)
    c.strokeStyle=dark?'#4ADE80':'#15803D';c.lineWidth=4;
    c.beginPath();c.moveTo(vcx-vwBot/2,vbot);c.lineTo(vcx-vwTop/2,vtop+h*0.04);c.stroke();
    c.beginPath();c.moveTo(vcx+vwBot/2,vbot);c.lineTo(vcx+vwTop/2,vtop+h*0.04);c.stroke();

    // زغيبات على القمة
    const numMicro=12;
    for(let zi=0;zi<numMicro;zi++){
      const zx=vcx+((-numMicro/2+zi+0.5)/(numMicro/2))*vwTop/2;
      c.strokeStyle=dark?'#4ADE80':'#15803D';c.lineWidth=2;
      c.beginPath();c.moveTo(zx,vtop+h*0.04);c.lineTo(zx,vtop-h*0.045);c.stroke();
      // رأس الزغيبة
      c.fillStyle=dark?'#4ADE80':'#15803D';c.beginPath();c.arc(zx,vtop-h*0.045,h*0.007,0,Math.PI*2);c.fill();
    }
    c.fillStyle=dark?'#4ADE80':'#166534';c.font=`${Math.round(h*0.021)}px Tajawal`;c.textAlign='right';
    c.fillText('زغيبات دقيقة →',vcx-vwTop/2-h*0.01,vtop+h*0.01);

    // شُعيرة دموية داخل الخملة
    c.strokeStyle='#EF4444';c.lineWidth=3;
    c.beginPath();
    c.moveTo(vcx-vwTop*0.35,vtop+h*0.12);
    c.bezierCurveTo(vcx-vwTop*0.2,h*0.4,vcx+vwTop*0.2,h*0.4,vcx+vwTop*0.35,vtop+h*0.12);
    c.bezierCurveTo(vcx+vwTop*0.2,h*0.55,vcx-vwTop*0.1,h*0.58,vcx-vwTop*0.35,h*0.5);
    c.stroke();
    c.fillStyle=dark?'#F87171':'#B91C1C';c.font=`${Math.round(h*0.02)}px Tajawal`;c.textAlign='left';
    c.fillText('← شُعيرة دموية',vcx+vwBot/2+h*0.015,h*0.33);

    // وعاء لمفاوي مركزي
    c.strokeStyle=dark?'#FCD34D':'#D97706';c.lineWidth=4;
    c.beginPath();c.moveTo(vcx,vtop+h*0.12);c.lineTo(vcx,vbot-h*0.06);c.stroke();
    c.fillStyle=dark?'#FCD34D':'#D97706';c.font=`${Math.round(h*0.02)}px Tajawal`;c.textAlign='right';
    c.fillText('وعاء لمفاوي ←',vcx-vwBot/2-h*0.015,h*0.55);

    // جزيئات تُمتص تتحرك
    const items=[
      {col:'#3B82F6',y:0.35,label:'جلوكوز'},
      {col:'#60A5FA',y:0.45,label:'أحماض أمينية'},
      {col:'#FCD34D',y:0.55,label:'دهون → لمف'},
    ];
    items.forEach((item,i)=>{
      const ptime=((simState.t*0.35+i*0.33)%1);
      // جزيء يتحرك من الجانب نحو الداخل
      const px2=vcx-vwBot*0.45+ptime*vwBot*0.35;
      const py2=h*(item.y)+Math.sin(simState.t*2+i)*h*0.015;
      c.fillStyle=item.col+'CC';c.beginPath();c.arc(px2,py2,h*0.016,0,Math.PI*2);c.fill();
      if(ptime>0.7){
        // يدخل الوعاء
        c.fillStyle=item.col+'55';c.beginPath();c.arc(vcx+(i-1)*vwTop*0.12,py2,h*0.012,0,Math.PI*2);c.fill();
      }
    });

    // ملصق "داخل الخملة"
    c.fillStyle=dark?'rgba(134,239,172,0.15)':'rgba(187,247,208,0.3)';
    c.beginPath();c.roundRect(vcx+vwBot/2+h*0.01,h*0.5,w*0.28,h*0.23,8);c.fill();
    c.strokeStyle=dark?'#4ADE80':'#15803D';c.lineWidth=1;c.stroke();
    [['🩸','دم','جلوكوز+أحم. أمينية'],['💛','لمف','دهون']] .forEach(([em,label,what],li)=>{
      const lx=vcx+vwBot/2+h*0.02,ly=h*(0.55+li*0.1);
      c.font=`${Math.round(h*0.022)}px serif`;c.textAlign='left';c.fillText(em,lx,ly);
      c.fillStyle=dark?'#E5E7EB':'#374151';c.font=`${Math.round(h*0.019)}px Tajawal`;c.fillText(`${label}: ${what}`,lx+h*0.035,ly);
    });

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG9Bio8N6b(){
  cancelAnimationFrame(animFrame);
  simState={t:0};

  controls(bioInfoPanel([
    '📐 بدون خملات: السطح الداخلي ~1م² (أنبوب أملس)',
    '🌿 مع الخملات: السطح يصل ~10م²',
    '🔬 مع الزغيبات الدقيقة (microvilli): ~250م²',
    '⚡ هذا السطح الضخم = امتصاص سريع وكامل',
    '💡 250م² ≈ ملعب تنس كامل! كله في أمعاء بطول 5 أمتار فقط',
  ],'📐 كيف تُضاعف الخملات السطح؟'));

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio8n6'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.012;
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,dark=dm15();
    c.fillStyle=bioBg();c.fillRect(0,0,w,h);
    drawLabel(c,'تضاعف السطح من الخملات والزغيبات',w/2,h*0.08,bioTxt(),Math.round(h*0.036));

    const panels=[
      {title:'أنبوب أملس',surface:'~1 م²',col:'#EF4444',x:0.04,y:0.17,w:0.29,h:0.7,
       drawFn:function(c,px,py,pw,ph){const dark=dm15();
        // مقطع أنبوبي أملس
        c.fillStyle=dark?'rgba(248,113,113,0.15)':'rgba(254,226,226,0.7)';
        c.beginPath();c.roundRect(w*px,h*py,w*pw,h*ph,10);c.fill();
        // خط أملس
        c.strokeStyle=dark?'#F87171':'#DC2626';c.lineWidth=4;
        c.beginPath();c.moveTo(w*(px+0.02),h*(py+0.35));c.lineTo(w*(px+pw-0.02),h*(py+0.35));c.stroke();
        c.fillStyle=dark?'#F87171':'#B91C1C';c.font=`bold ${Math.round(h*0.026)}px Tajawal`;c.textAlign='center';
        c.fillText('~1 م²',w*(px+pw/2),h*(py+0.5));
        c.fillStyle=dark?'#FCA5A5':'#DC2626';c.font=`${Math.round(h*0.022)}px Tajawal`;
        c.fillText('سطح صغير!',w*(px+pw/2),h*(py+0.6));
       }
      },
      {title:'مع خملات',surface:'~10 م²',col:'#F59E0B',x:0.36,y:0.17,w:0.27,h:0.7,
       drawFn:function(c,px,py,pw,ph){const dark=dm15();
        c.fillStyle=dark?'rgba(251,191,36,0.12)':'rgba(254,240,138,0.5)';
        c.beginPath();c.roundRect(w*px,h*py,w*pw,h*ph,10);c.fill();
        // خملات
        const numV=10;
        const baseY=h*(py+0.58),topY=h*(py+0.25);
        for(let vi=0;vi<numV;vi++){
          const vx=w*(px+0.03+vi*(pw-0.06)/(numV-1));
          c.fillStyle=dark?'rgba(251,191,36,0.4)':'rgba(254,240,138,0.8)';
          c.beginPath();c.moveTo(vx-w*0.012,baseY);c.lineTo(vx-w*0.006,topY);c.lineTo(vx+w*0.006,topY);c.lineTo(vx+w*0.012,baseY);c.fill();
          c.strokeStyle=dark?'#FCD34D':'#D97706';c.lineWidth=1.5;c.stroke();
        }
        c.fillStyle=dark?'#FCD34D':'#D97706';c.font=`bold ${Math.round(h*0.026)}px Tajawal`;c.textAlign='center';
        c.fillText('~10 م²',w*(px+pw/2),h*(py+0.72));
       }
      },
      {title:'مع خملات وزغيبات',surface:'~250 م²',col:'#10B981',x:0.66,y:0.17,w:0.3,h:0.7,
       drawFn:function(c,px,py,pw,ph){const dark=dm15();
        c.fillStyle=dark?'rgba(74,222,128,0.12)':'rgba(187,247,208,0.5)';
        c.beginPath();c.roundRect(w*px,h*py,w*pw,h*ph,10);c.fill();
        // خملات مع زغيبات
        const numV=8;
        const baseY=h*(py+0.58),topY=h*(py+0.3);
        for(let vi=0;vi<numV;vi++){
          const vx=w*(px+0.03+vi*(pw-0.06)/(numV-1));
          c.fillStyle=dark?'rgba(74,222,128,0.35)':'rgba(187,247,208,0.75)';
          c.beginPath();c.moveTo(vx-w*0.013,baseY);c.lineTo(vx-w*0.007,topY);c.lineTo(vx+w*0.007,topY);c.lineTo(vx+w*0.013,baseY);c.fill();
          c.strokeStyle=dark?'#4ADE80':'#15803D';c.lineWidth=1.5;c.stroke();
          // زغيبات
          for(let z=-2;z<=2;z++){
            const zx=vx+z*w*0.003;
            c.strokeStyle=dark?'#4ADE80':'#15803D';c.lineWidth=1;
            c.beginPath();c.moveTo(zx,topY);c.lineTo(zx,topY-h*0.05);c.stroke();
          }
        }
        c.fillStyle=dark?'#4ADE80':'#166534';c.font=`bold ${Math.round(h*0.026)}px Tajawal`;c.textAlign='center';
        c.fillText('~250 م² ✓',w*(px+pw/2),h*(py+0.72));
        // نبض على الحد
        const pulse2=0.5+Math.abs(Math.sin(simState.t*2))*0.4;
        c.strokeStyle=`rgba(74,222,128,${pulse2})`;c.lineWidth=2.5;
        c.beginPath();c.roundRect(w*px+2,h*py+2,w*pw-4,h*ph-4,10);c.stroke();
       }
      },
    ];

    panels.forEach(p=>{
      c.strokeStyle=p.col;c.lineWidth=2;
      c.beginPath();c.roundRect(w*p.x,h*p.y,w*p.w,h*p.h,10);c.stroke();
      drawLabel(c,p.title,w*(p.x+p.w/2),h*(p.y-0.03),p.col,Math.round(h*0.026));
      p.drawFn(c,p.x,p.y,p.w,p.h);
    });

    // مقارنة في الأسفل
    c.fillStyle=dark?'rgba(74,222,128,0.15)':'rgba(187,247,208,0.4)';c.beginPath();c.roundRect(w*0.04,h*0.92,w*0.92,h*0.06,8);c.fill();
    drawSmallLabel(c,'💡 الزغيبات تُضاعف السطح 250 مرة — مساحة ملعب تنس كامل في أمعاء طولها 5 أمتار!',w/2,h*0.96,dark?'#4ADE80':'#15803D',Math.round(h*0.023));

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG9Bio8N6c(){
  cancelAnimationFrame(animFrame);
  simState={t:0,selected:null};

  controls(`<div class="ctrl-section">
    <div class="ctrl-label">🔀 مسارات الامتصاص داخل الخملة</div>
    <div style="font-size:13px;color:var(--text-secondary);margin-bottom:8px">انقري على نوع الجزيء لتتبّع مساره</div>
    <div style="display:flex;flex-direction:column;gap:7px">
      ${[['glucose','🍬 جلوكوز','#3B82F6','دم → وريد بابي → كبد → جسم'],['aa','🔗 أحماض أمينية','#10B981','دم → كبد → خلايا الجسم'],['fat','💧 دهون','#F59E0B','لمف → قناة صدرية → دم → جسم']].map(([id,label,col,path])=>`
      <button onclick="simState.selected='${id}'" style="padding:8px;border-radius:8px;border:2px solid ${col}44;background:var(--bg-ctrl-btn);font-family:Tajawal;font-size:13px;cursor:pointer;text-align:right">
        <span style="color:${col};font-weight:700">${label}</span> <span style="color:var(--text-secondary);font-size:12px">← ${path}</span>
      </button>`).join('')}
    </div>
    <div id="absorb_info" style="margin-top:8px;padding:10px;border-radius:10px;background:var(--bg-card2);font-size:12.5px;line-height:1.8;min-height:60px">← انقري على نوع جزيء</div>
  </div>`);

  const cv=document.getElementById('simCanvas');
  const itemsData={
    glucose:{col:'#3B82F6',label:'جلوكوز',via:'دموي',detail:'الجلوكوز وأيونات الأملاح تُمتص بالانتقال النشط. تدخل الشعيرات الدموية → الوريد البابي الكبدي → الكبد يعالجها → الدم → الخلايا'},
    aa:{col:'#10B981',label:'أحماض أمينية',via:'دموي',detail:'الأحماض الأمينية أيضاً تُمتص بالانتقال النشط. تدخل الشعيرات الدموية مباشرة → الكبد → تُستخدم لبناء البروتينات أو مصدر طاقة'},
    fat:{col:'#F59E0B',label:'دهون',via:'لمفاوي',detail:'الأحماض الدهنية والجليسرول تُمتص بالانتشار → تتحد لتكوين كيلوميكرونات (chylomicrons) → الوعاء اللمفاوي (كيلوس) → القناة الصدرية → الدم قرب القلب'},
  };

  let lastSel=null;
  function draw(){
    if(currentSim!=='g9bio8n6'||currentTab!==2){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.014;
    if(simState.selected!==lastSel){
      lastSel=simState.selected;
      const el=document.getElementById('absorb_info');
      if(el&&simState.selected)el.innerHTML=`<strong style="color:${itemsData[simState.selected].col}">${itemsData[simState.selected].label} (مسار ${itemsData[simState.selected].via}):</strong><br>${itemsData[simState.selected].detail}`;
    }
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,dark=dm15();
    c.fillStyle=bioBg();c.fillRect(0,0,w,h);
    drawLabel(c,'الامتصاص عبر الخملة — المسارات',w/2,h*0.08,bioTxt(),Math.round(h*0.035));

    const vcx=w*0.5,vtop=h*0.15,vbot=h*0.78,vwTop=w*0.18,vwBot=w*0.24;
    // خملة
    c.fillStyle=dark?'rgba(134,239,172,0.18)':'rgba(187,247,208,0.65)';
    c.beginPath();c.moveTo(vcx-vwBot/2,vbot);c.lineTo(vcx-vwTop/2,vtop+h*0.04);
    c.quadraticCurveTo(vcx,vtop,vcx+vwTop/2,vtop+h*0.04);c.lineTo(vcx+vwBot/2,vbot);c.closePath();c.fill();
    c.strokeStyle=dark?'#4ADE80':'#15803D';c.lineWidth=2;c.stroke();

    // زغيبات
    for(let zi=0;zi<10;zi++){
      const zx=vcx+((-5+zi+0.5)/5)*vwTop/2;
      c.strokeStyle=dark?'#4ADE80':'#15803D';c.lineWidth=1.8;
      c.beginPath();c.moveTo(zx,vtop+h*0.04);c.lineTo(zx,vtop-h*0.04);c.stroke();
    }

    // شُعيرة دموية
    c.strokeStyle='#EF4444';c.lineWidth=3;
    c.beginPath();c.moveTo(vcx-vwTop*0.4,h*0.25);c.bezierCurveTo(vcx-vwTop*0.2,h*0.45,vcx+vwTop*0.2,h*0.45,vcx+vwTop*0.4,h*0.25);c.stroke();
    c.fillStyle=dark?'#F87171':'#B91C1C';c.font=`${Math.round(h*0.019)}px Tajawal`;c.textAlign='left';
    c.fillText('← شُعيرة دموية',vcx+vwBot/2+h*0.01,h*0.32);

    // وعاء لمفاوي
    c.strokeStyle=dark?'#FCD34D':'#D97706';c.lineWidth=4;
    c.beginPath();c.moveTo(vcx,vtop+h*0.1);c.lineTo(vcx,vbot-h*0.06);c.stroke();
    c.fillStyle=dark?'#FCD34D':'#D97706';c.font=`${Math.round(h*0.019)}px Tajawal`;c.textAlign='right';
    c.fillText('وعاء لمفاوي ←',vcx-vwBot/2-h*0.01,h*0.58);

    // جزيئات متحركة
    const selected=simState.selected;
    Object.entries(itemsData).forEach(([key,item])=>{
      const isSelected=selected===key||!selected;
      const alpha=isSelected?1:0.2;
      for(let pi=0;pi<4;pi++){
        const ptime=((simState.t*0.35+pi*0.25+Object.keys(itemsData).indexOf(key)*0.1)%1);
        // من الجانب → داخل الخملة
        const fromX=vcx-(vwBot/2+w*0.08)*(1-ptime),fromY=h*(0.3+Object.keys(itemsData).indexOf(key)*0.1);
        c.fillStyle=item.col+(Math.round(alpha*200).toString(16).padStart(2,'0'));
        c.beginPath();c.arc(fromX,fromY,h*0.016,0,Math.PI*2);c.fill();
        if(ptime>0.6){
          // يتجه نحو الوعاء المناسب
          const targetX=item.via==='لمفاوي'?vcx:vcx-vwTop*0.2;
          const targetY=fromY;
          const progX=fromX+(targetX-fromX)*((ptime-0.6)/0.4);
          c.fillStyle=item.col+(Math.round(alpha*150).toString(16).padStart(2,'0'));
          c.beginPath();c.arc(progX,targetY,h*0.013,0,Math.PI*2);c.fill();
        }
      }
    });

    // مفتاح الألوان
    const legend=[['glucose','🍬 جلوكوز','#3B82F6'],['aa','🔗 أ.أمينية','#10B981'],['fat','💧 دهون','#F59E0B']];
    legend.forEach(([key,label,col],i)=>{
      const lx=w*(0.1+i*0.3),ly=h*0.88;
      c.fillStyle=col+(selected===key||!selected?'BB':'33');c.beginPath();c.arc(lx,ly,h*0.018,0,Math.PI*2);c.fill();
      c.fillStyle=col+(selected===key||!selected?'':44);c.font=`${Math.round(h*0.022)}px Tajawal`;c.textAlign='center';c.fillText(label,lx,ly+h*0.038);
    });

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════════════
   نشاط ٧-٨ · محاكاة الديلسة
════════════════════════════════════════════════ */
function simG9Bio8N7a(){
  cancelAnimationFrame(animFrame);
  simState={t:0};

  controls(bioInfoPanel([
    '🔭 <strong>الديلسة (Dialysis)</strong>: انتقال المواد عبر غشاء شبه نافذ من تركيز عالٍ → منخفض',
    '📏 الغشاء له مسام بحجم معيّن — تعبر منه جزيئات صغيرة فقط',
    '🌾 النشا: جزيء ضخم (C₆H₁₀O₅)ₙ — لا يعبر',
    '🍬 الجلوكوز: جزيء صغير C₆H₁₂O₆ — يعبر',
    '💡 هذا يُحاكي جدار الأمعاء الدقيقة تماماً',
  ],'🎓 مبدأ الديلسة والغشاء شبه النافذ'));

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio8n7'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.015;
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,dark=dm15();
    c.fillStyle=bioBg();c.fillRect(0,0,w,h);
    drawLabel(c,'الغشاء شبه النافذ — من يعبر ومن لا يعبر؟',w/2,h*0.08,bioTxt(),Math.round(h*0.034));

    // غشاء وسطي
    const gx=w*0.45,gy=h*0.14,gw=w*0.1,gh=h*0.73;
    c.fillStyle=dark?'rgba(253,224,71,0.28)':'rgba(254,240,138,0.65)';
    c.beginPath();c.roundRect(gx,gy,gw,gh,8);c.fill();
    c.strokeStyle=dark?'#FCD34D':'#D97706';c.lineWidth=2.5;c.stroke();
    // مسام الغشاء
    for(let pi=0;pi<7;pi++){
      const py=h*(0.21+pi*0.09);
      c.fillStyle=bioBg();
      c.beginPath();c.ellipse(gx+gw/2,py,gw*0.12,h*0.022,0,0,Math.PI*2);c.fill();
      c.strokeStyle=dark?'#FCD34D':'#D97706';c.lineWidth=1;c.stroke();
      // حجم المسم
      c.fillStyle=dark?'#9CA3AF':'#6B7280';c.font=`${Math.round(h*0.015)}px Tajawal`;c.textAlign='center';c.fillText('مسام',gx+gw/2,py+h*0.013);
    }
    c.fillStyle=dark?'#FCD34D':'#D97706';c.font=`bold ${Math.round(h*0.022)}px Tajawal`;c.textAlign='center';c.fillText('غشاء',gx+gw/2,gy+gh+h*0.04);

    // جزيئات نشا (كبيرة — يسار، لا تعبر)
    for(let ni=0;ni<5;ni++){
      const nangle=(ni/5)*Math.PI*2+simState.t*0.15;
      const nx=w*0.22+Math.cos(nangle)*w*0.16,ny=h*0.48+Math.sin(nangle)*h*0.28;
      c.fillStyle=dark?'rgba(253,224,71,0.5)':'rgba(254,240,138,0.85)';
      c.beginPath();c.arc(nx,ny,h*0.042,0,Math.PI*2);c.fill();
      c.strokeStyle=dark?'#FCD34D':'#CA8A04';c.lineWidth=2;c.stroke();
      // خط ربط (سلسلة)
      if(ni<4){
        const nangle2=(ni+1)/5*Math.PI*2+simState.t*0.15;
        const nx2=w*0.22+Math.cos(nangle2)*w*0.16,ny2=h*0.48+Math.sin(nangle2)*h*0.28;
        c.strokeStyle=dark?'#FCD34D55':'#CA8A0444';c.lineWidth=3;c.beginPath();c.moveTo(nx,ny);c.lineTo(nx2,ny2);c.stroke();
      }
    }
    drawLabel(c,'نشا — جزيء ضخم',w*0.22,h*0.14,dark?'#FCD34D':'#92400E',Math.round(h*0.025));
    // X لا يعبر
    c.strokeStyle='#EF4444';c.lineWidth=3;
    c.beginPath();c.moveTo(gx-h*0.03,h*0.5-h*0.02);c.lineTo(gx-h*0.01,h*0.5+h*0.02);c.stroke();
    c.beginPath();c.moveTo(gx-h*0.03,h*0.5+h*0.02);c.lineTo(gx-h*0.01,h*0.5-h*0.02);c.stroke();
    c.fillStyle='#EF4444';c.font=`bold ${Math.round(h*0.022)}px Tajawal`;c.textAlign='center';c.fillText('✗ لا يعبر',w*0.22,h*0.84);

    // جزيئات جلوكوز (صغيرة — تعبر)
    for(let gi=0;gi<9;gi++){
      const gangle=(gi/9)*Math.PI*2*2+simState.t*0.4;
      const grx=w*0.77+Math.cos(gangle)*w*0.15,gry=h*0.48+Math.sin(gangle)*h*0.27;
      c.fillStyle=dark?'rgba(134,239,172,0.6)':'rgba(187,247,208,0.85)';
      c.beginPath();c.arc(grx,gry,h*0.018,0,Math.PI*2);c.fill();
      c.strokeStyle=dark?'#4ADE80':'#15803D';c.lineWidth=1.5;c.stroke();
    }
    // جلوكوز يعبر الغشاء
    for(let gi=0;gi<3;gi++){
      const cross=((simState.t*0.4+gi*0.33)%1);
      const crossX=gx+gw*0.5+((cross-0.5)*gw*2);
      if(Math.abs(cross-0.5)<0.35){
        c.fillStyle=dark?'rgba(134,239,172,0.85)':'rgba(187,247,208,0.9)';
        c.beginPath();c.arc(crossX,h*(0.35+gi*0.18),h*0.018,0,Math.PI*2);c.fill();
      }
    }
    drawLabel(c,'جلوكوز — جزيء صغير',w*0.77,h*0.14,dark?'#4ADE80':'#15803D',Math.round(h*0.025));
    c.fillStyle=dark?'#4ADE80':'#15803D';c.font=`bold ${Math.round(h*0.022)}px Tajawal`;c.textAlign='center';c.fillText('✓ يعبر الغشاء',w*0.77,h*0.84);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG9Bio8N7b(){
  cancelAnimationFrame(animFrame);
  simState={t:0,results:{starch_inside:'',starch_outside:'',glucose_inside:'',glucose_outside:''}};

  controls(`<div class="ctrl-section">
    <div class="ctrl-label">🧫 تجربة الديلسة — خطوة بخطوة</div>
    <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:8px;line-height:1.7">محلول نشا + جلوكوز داخل أنبوبة الديلسة — ماء مقطَّر في الكأس</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px">
      <div style="padding:9px;background:var(--bg-card2);border-radius:9px;font-size:12px">
        <div style="font-weight:800;margin-bottom:6px;color:#7C3AED">اختبار النشا (يود)</div>
        <div style="margin-bottom:5px">داخل الأنبوبة:</div>
        <select onchange="simState.results.starch_inside=this.value" style="width:100%;padding:5px;border-radius:6px;border:1px solid var(--border-color);background:var(--bg-ctrl-btn);font-family:Tajawal;font-size:12px;margin-bottom:5px">
          <option value="">اختاري...</option><option value="blue">أزرق أسود (نشا موجود)</option><option value="none">لا تغيير (لا نشا)</option>
        </select>
        <div style="margin-bottom:5px">خارج الأنبوبة:</div>
        <select onchange="simState.results.starch_outside=this.value" style="width:100%;padding:5px;border-radius:6px;border:1px solid var(--border-color);background:var(--bg-ctrl-btn);font-family:Tajawal;font-size:12px">
          <option value="">اختاري...</option><option value="blue">أزرق أسود (نشا موجود)</option><option value="none">لا تغيير (لا نشا)</option>
        </select>
      </div>
      <div style="padding:9px;background:var(--bg-card2);border-radius:9px;font-size:12px">
        <div style="font-weight:800;margin-bottom:6px;color:#D97706">اختبار الجلوكوز (بنيديكت)</div>
        <div style="margin-bottom:5px">داخل الأنبوبة:</div>
        <select onchange="simState.results.glucose_inside=this.value" style="width:100%;padding:5px;border-radius:6px;border:1px solid var(--border-color);background:var(--bg-ctrl-btn);font-family:Tajawal;font-size:12px;margin-bottom:5px">
          <option value="">اختاري...</option><option value="orange">أحمر/برتقالي (سكر ✓)</option><option value="blue">يبقى أزرق (لا سكر)</option>
        </select>
        <div style="margin-bottom:5px">خارج الأنبوبة:</div>
        <select onchange="simState.results.glucose_outside=this.value" style="width:100%;padding:5px;border-radius:6px;border:1px solid var(--border-color);background:var(--bg-ctrl-btn);font-family:Tajawal;font-size:12px">
          <option value="">اختاري...</option><option value="orange">أحمر/برتقالي (سكر ✓)</option><option value="blue">يبقى أزرق (لا سكر)</option>
        </select>
      </div>
    </div>
    <button onclick="window._b8n7check()" style="width:100%;padding:9px;margin-top:8px;border-radius:10px;background:#7C3AED;color:white;font-family:Tajawal;font-weight:700;font-size:14px;border:none;cursor:pointer">✅ تحقق من نتائجك</button>
    <div id="b8n7_res" style="margin-top:6px;font-size:12.5px;padding:8px;border-radius:8px;background:var(--bg-card2);min-height:40px"></div>
  </div>`);

  window._b8n7check=()=>{
    const r=simState.results;
    const correct=r.starch_inside==='blue'&&r.starch_outside==='none'&&r.glucose_inside==='orange'&&r.glucose_outside==='orange';
    const el=document.getElementById('b8n7_res');
    if(el)el.innerHTML=correct?
      '🎉 <strong style="color:#10B981">ممتاز!</strong> النشا داخل فقط (لا يعبر الغشاء) والجلوكوز داخل وخارج (يعبر) — استنتاج: الغشاء انتقائي الشبه النفاذية':
      '⚠️ <strong>راجعي:</strong> النشا يبقى داخل الأنبوبة فقط (كبير لا يعبر). الجلوكوز يظهر داخل وخارج (صغير يعبر). اليود أزرق مع نشا. بنيديكت برتقالي مع جلوكوز.';
  };

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9bio8n7'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.012;
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,dark=dm15();
    c.fillStyle=bioBg();c.fillRect(0,0,w,h);
    drawLabel(c,'إعداد تجربة الديلسة',w/2,h*0.08,bioTxt(),Math.round(h*0.035));

    // كأس كبير
    c.strokeStyle=dark?'#60A5FA':'#2563EB';c.lineWidth=3;c.lineCap='round';
    c.beginPath();c.moveTo(w*0.1,h*0.18);c.lineTo(w*0.05,h*0.85);c.lineTo(w*0.95,h*0.85);c.lineTo(w*0.9,h*0.18);c.stroke();
    // ماء في الكأس
    c.fillStyle=dark?'rgba(96,165,250,0.12)':'rgba(219,234,254,0.5)';
    c.beginPath();c.moveTo(w*0.07,h*0.35);c.lineTo(w*0.07,h*0.83);c.lineTo(w*0.93,h*0.83);c.lineTo(w*0.93,h*0.35);
    // موجة ماء
    for(let wi=0;wi<10;wi++)c.lineTo(w*(0.93-wi*0.086),h*(0.35+Math.sin(simState.t*2+wi*0.6)*0.01));
    c.closePath();c.fill();
    c.fillStyle=dark?'#93C5FD':'#1E40AF';c.font=`${Math.round(h*0.022)}px Tajawal`;c.textAlign='center';c.fillText('ماء مقطَّر',w*0.2,h*0.55);

    // أنبوبة الديلسة
    const tx=w*0.35,ty=h*0.12,tw=w*0.3,th=h*0.65;
    c.fillStyle=dark?'rgba(253,224,71,0.22)':'rgba(254,240,138,0.65)';
    c.beginPath();c.roundRect(tx,ty,tw,th,tw*0.1);c.fill();
    c.strokeStyle=dark?'#FCD34D':'#D97706';c.lineWidth=3;c.stroke();
    // نوع الغشاء
    c.strokeStyle=dark?'#FCD34D':'#D97706';c.lineWidth=1;c.setLineDash([4,3]);
    c.beginPath();c.rect(tx+3,ty+3,tw-6,th-6);c.stroke();c.setLineDash([]);
    drawLabel(c,'أنبوبة الديلسة',tx+tw/2,ty-h*0.02,dark?'#FCD34D':'#D97706',Math.round(h*0.023));

    // محتوى (نشا + جلوكوز)
    for(let mi=0;mi<8;mi++){
      const angle=(mi/8)*Math.PI*2+simState.t*0.3;
      const mx=tx+tw/2+Math.cos(angle)*tw*0.28,my=ty+th*0.4+Math.sin(angle)*th*0.22;
      // نشا (كبير)
      if(mi<4){
        c.fillStyle=dark?'rgba(253,224,71,0.6)':'rgba(254,240,138,0.8)';
        c.beginPath();c.arc(mx,my,tw*0.07,0,Math.PI*2);c.fill();
        c.strokeStyle=dark?'#FCD34D':'#CA8A04';c.lineWidth=2;c.stroke();
      } else {
        // جلوكوز (صغير)
        c.fillStyle=dark?'rgba(134,239,172,0.7)':'rgba(187,247,208,0.85)';
        c.beginPath();c.arc(mx,my,tw*0.04,0,Math.PI*2);c.fill();
        c.strokeStyle=dark?'#4ADE80':'#15803D';c.lineWidth=1.5;c.stroke();
      }
    }
    // جلوكوز يتسرب للخارج
    for(let gi=0;gi<4;gi++){
      const gp=((simState.t*0.3+gi*0.25)%1);
      if(gp>0.3&&gp<0.8){
        const gx2=tx+tw+(gp-0.3)*w*0.2;
        const gy2=ty+th*(0.3+gi*0.15);
        c.fillStyle=dark?'rgba(134,239,172,0.7)':'rgba(187,247,208,0.8)';
        c.beginPath();c.arc(gx2,gy2,tw*0.035,0,Math.PI*2);c.fill();
      }
    }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG9Bio8N7c(){
  cancelAnimationFrame(animFrame);
  // state: which test is active (0=iodine-in, 1=iodine-out, 2=benedict-in, 3=benedict-out), heating anim
  simState={t:0, active:null, revealed:{}, heating:false, heatT:0, conclusion:false};

  const tests=[
    {id:'iodIn',  side:'داخل',  mol:'نشا',     reagent:'يود',      expect:'blue',  label:'نشا داخل الأنبوبة'},
    {id:'iodOut', side:'خارج',  mol:'نشا',     reagent:'يود',      expect:'none',  label:'نشا خارج الأنبوبة'},
    {id:'benIn',  side:'داخل',  mol:'جلوكوز', reagent:'بنيديكت',  expect:'orange',label:'جلوكوز داخل الأنبوبة'},
    {id:'benOut', side:'خارج',  mol:'جلوكوز', reagent:'بنيديكت',  expect:'orange',label:'جلوكوز خارج الأنبوبة'},
  ];

  const colorMap={
    blue:   {fill:'#1E1B4B', label:'أزرق أسود 🔵', meaning:'نشا موجود ✓'},
    none:   {fill:'#D97706', label:'لا تغيير 🟡',  meaning:'لا نشا — لم يعبر ✓'},
    orange: {fill:'#C2410C', label:'أحمر برتقالي 🔴', meaning:'جلوكوز موجود ✓'},
  };

  controls(`<div class="ctrl-section">
    <div class="ctrl-label">🧪 فسِّري نتائج تجربة الديلسة</div>
    <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:10px;line-height:1.7">انقري على أنبوبة الاختبار لإضافة الكاشف وكشف النتيجة</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
      ${tests.map((t,i)=>`<button id="testbtn_${t.id}" onclick="simState.active='${t.id}';simState.heating=true;simState.heatT=0" style="padding:8px 6px;border-radius:9px;border:2px solid ${t.reagent==='يود'?'#7C3AED44':'#D9770644'};background:var(--bg-ctrl-btn);font-family:Tajawal;font-size:12px;cursor:pointer;text-align:center;transition:all 0.2s">
        <div style="font-size:16px">${t.reagent==='يود'?'🟤':'🔵'}</div>
        <div style="font-weight:700;color:${t.reagent==='يود'?'#7C3AED':'#D97706'};font-size:12px">${t.reagent}</div>
        <div style="color:var(--text-secondary);font-size:11px">${t.label}</div>
      </button>`).join('')}
    </div>
    <button onclick="simState.conclusion=!simState.conclusion" style="width:100%;margin-top:8px;padding:9px;border-radius:10px;background:#7C3AED;color:white;font-family:Tajawal;font-weight:700;font-size:13px;border:none;cursor:pointer">💡 الاستنتاج</button>
    <div id="n7c_conclusion" style="display:none;margin-top:8px;padding:10px;border-radius:10px;background:rgba(109,40,217,0.12);border:1.5px solid #7C3AED55;font-size:12.5px;line-height:1.8">
      <strong style="color:#7C3AED">الاستنتاج:</strong><br>
      ✅ النشا يبقى داخل الأنبوبة — <strong>حجمه كبير</strong> يمنعه من عبور مسام الغشاء<br>
      ✅ الجلوكوز وُجد داخل وخارج — <strong>حجمه صغير</strong> يسمح له بالعبور<br>
      🔬 الغشاء شبه النافذ يُحاكي جدار الأمعاء الدقيقة تماماً
    </div>
  </div>`);

  // Toggle conclusion panel
  const origOnclick_n7c = ()=>{
    const el=document.getElementById('n7c_conclusion');
    if(el) el.style.display = simState.conclusion ? 'block' : 'none';
  };

  const cv=document.getElementById('simCanvas');

  // Draw a test tube with liquid and color
  function drawTestTube(c,cx,cy,tw,th,liquidColor,labelTop,labelBot,glowing,t){
    const dark=dm15();
    // Glass body
    c.fillStyle=dark?'rgba(255,255,255,0.06)':'rgba(200,230,255,0.25)';
    c.beginPath();
    c.moveTo(cx-tw/2,cy-th/2);
    c.lineTo(cx-tw/2,cy+th*0.35);
    c.quadraticCurveTo(cx-tw/2,cy+th/2,cx,cy+th/2);
    c.quadraticCurveTo(cx+tw/2,cy+th/2,cx+tw/2,cy+th*0.35);
    c.lineTo(cx+tw/2,cy-th/2);
    c.closePath();c.fill();
    // Liquid fill
    if(liquidColor){
      const grad=c.createLinearGradient(cx-tw/2,cy,cx+tw/2,cy);
      grad.addColorStop(0,liquidColor+'CC');
      grad.addColorStop(0.5,liquidColor+'FF');
      grad.addColorStop(1,liquidColor+'AA');
      c.fillStyle=grad;
      c.beginPath();
      c.moveTo(cx-tw*0.45,cy-th*0.05+Math.sin(t*2)*th*0.01);
      c.lineTo(cx-tw*0.45,cy+th*0.32);
      c.quadraticCurveTo(cx-tw*0.45,cy+th*0.44,cx,cy+th*0.44);
      c.quadraticCurveTo(cx+tw*0.45,cy+th*0.44,cx+tw*0.45,cy+th*0.32);
      c.lineTo(cx+tw*0.45,cy-th*0.05+Math.sin(t*2)*th*0.01);
      c.closePath();c.fill();
      // Bubble animation
      if(glowing){
        for(let b=0;b<3;b++){
          const bp=((t*0.8+b*0.33)%1);
          const bx=cx+(-0.3+b*0.3)*tw*0.4;
          const by=cy+th*0.44-bp*th*0.4;
          c.fillStyle='rgba(255,255,255,0.5)';
          c.beginPath();c.arc(bx,by,tw*0.04,0,Math.PI*2);c.fill();
        }
      }
      // Shimmer
      c.fillStyle='rgba(255,255,255,0.15)';
      c.beginPath();c.ellipse(cx-tw*0.15,cy+th*0.05,tw*0.08,th*0.12,0,0,Math.PI*2);c.fill();
    }
    // Glass outline
    c.strokeStyle=dark?'rgba(147,197,253,0.5)':'rgba(96,165,250,0.6)';c.lineWidth=2;
    c.beginPath();
    c.moveTo(cx-tw/2,cy-th/2);
    c.lineTo(cx-tw/2,cy+th*0.35);
    c.quadraticCurveTo(cx-tw/2,cy+th/2,cx,cy+th/2);
    c.quadraticCurveTo(cx+tw/2,cy+th/2,cx+tw/2,cy+th*0.35);
    c.lineTo(cx+tw/2,cy-th/2);
    c.stroke();
    // Rim
    c.fillStyle=dark?'rgba(147,197,253,0.3)':'rgba(96,165,250,0.2)';
    c.beginPath();c.roundRect(cx-tw/2-2,cy-th/2-6,tw+4,10,3);c.fill();
    c.strokeStyle=dark?'rgba(147,197,253,0.5)':'rgba(96,165,250,0.6)';c.lineWidth=1.5;c.stroke();
    // Glow
    if(glowing){
      c.shadowColor=liquidColor;c.shadowBlur=18;
      c.strokeStyle=liquidColor+'88';c.lineWidth=3;
      c.beginPath();c.arc(cx,cy+th*0.1,tw*0.55,0,Math.PI*2);c.stroke();
      c.shadowBlur=0;
    }
    // Labels
    const dark2=dm15();
    c.fillStyle=dark2?'#E5E7EB':'#1F2937';c.font=`bold ${Math.round(th*0.12)}px Tajawal`;c.textAlign='center';c.fillText(labelTop,cx,cy-th/2-10);
    c.fillStyle=dark2?'#9CA3AF':'#6B7280';c.font=`${Math.round(th*0.1)}px Tajawal`;c.fillText(labelBot,cx,cy+th/2+18);
  }

  // Draw membrane
  function drawMembrane(c,mx,y1,y2,dark){
    c.strokeStyle=dark?'#FCD34D':'#D97706';c.lineWidth=5;c.setLineDash([6,4]);
    c.beginPath();c.moveTo(mx,y1);c.lineTo(mx,y2);c.stroke();c.setLineDash([]);
    // Pore dots
    for(let p=0;p<5;p++){
      const py=y1+(y2-y1)*(0.1+p*0.2);
      c.fillStyle=dark?'#FCD34D':'#D97706';
      c.beginPath();c.arc(mx,py,4,0,Math.PI*2);c.fill();
    }
    c.fillStyle=dark?'#FCD34D':'#92400E';c.font=`bold 11px Tajawal`;c.textAlign='center';
    c.fillText('غشاء',mx,y1-8);
  }

  function draw(){
    if(currentSim!=='g9bio8n7'||currentTab!==2){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.016;
    const t=simState.t;
    const dark=dm15();
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.fillStyle=bioBg();c.fillRect(0,0,w,h);

    // Handle conclusion toggle
    origOnclick_n7c();

    // Heating progress
    if(simState.heating){
      simState.heatT+=0.012;
      if(simState.heatT>=1){
        simState.heatT=1;simState.heating=false;
        if(simState.active) simState.revealed[simState.active]=true;
      }
    }

    // Update button styles
    tests.forEach(tt=>{
      const btn=document.getElementById(`testbtn_${tt.id}`);
      if(!btn)return;
      const done=simState.revealed[tt.id];
      const active=simState.active===tt.id&&simState.heating;
      const cm=colorMap[tt.expect];
      btn.style.background=done?(cm.fill+'33'):active?'rgba(99,102,241,0.2)':'var(--bg-ctrl-btn)';
      btn.style.borderColor=done?cm.fill:active?'#6366F1':'var(--border-color)';
    });

    // Title
    drawLabel(c,'تجربة الديلسة — إضافة الكواشف',w/2,h*0.07,bioTxt(),Math.round(h*0.034));

    // Layout: 4 test tubes side by side
    const tubeW=w*0.12,tubeH=h*0.32;
    const positions=[
      {x:w*0.15,y:h*0.4, test:tests[0]},
      {x:w*0.35,y:h*0.4, test:tests[1]},
      {x:h*0.01+w*0.55,y:h*0.4, test:tests[2]},
      {x:h*0.01+w*0.75,y:h*0.4, test:tests[3]},
    ];

    // Draw membrane dividers between tube pairs
    drawMembrane(c,w*0.25,h*0.22,h*0.75,dark);
    drawMembrane(c,w*0.65,h*0.22,h*0.75,dark);

    // Section labels
    [['داخل الأنبوبة',w*0.15],['خارج الأنبوبة',w*0.35],['داخل الأنبوبة',w*0.55],['خارج الأنبوبة',w*0.75]].forEach(([lbl,lx])=>{
      c.fillStyle=dark?'#9CA3AF':'#6B7280';c.font=`${Math.round(h*0.019)}px Tajawal`;c.textAlign='center';c.fillText(lbl,lx,h*0.19);
    });

    // Reagent group labels
    c.fillStyle=dark?'#C4B5FD':'#6D28D9';c.font=`bold ${Math.round(h*0.024)}px Tajawal`;c.textAlign='center';
    c.fillText('اختبار النشا — اليود',w*0.25,h*0.13);
    c.fillStyle=dark?'#FCD34D':'#D97706';
    c.fillText('اختبار الجلوكوز — بنيديكت',w*0.65,h*0.13);

    // Draw each test tube
    positions.forEach((p,i)=>{
      const tt=p.test;
      const revealed=simState.revealed[tt.id];
      const isActive=simState.active===tt.id;
      const heatProg=isActive?simState.heatT:0;
      let liquidCol=null;

      if(revealed){
        liquidCol=colorMap[tt.expect].fill;
      } else if(isActive&&simState.heating){
        // Transition color
        const reagentCol=tt.reagent==='يود'?'#7C3AED':'#3B82F6';
        liquidCol=reagentCol;
      }

      const glowing=revealed&&tt.expect!=='none';
      drawTestTube(c,p.x,p.y,tubeW,tubeH,liquidCol,tt.mol,tt.reagent,glowing,t);

      // Heating bar under tube
      if(isActive&&simState.heating&&tt.reagent==='بنيديكت'){
        const bx=p.x-tubeW/2,by=p.y+tubeH/2+25,bw=tubeW,bh=8;
        c.fillStyle=dark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.08)';
        c.beginPath();c.roundRect(bx,by,bw,bh,4);c.fill();
        c.fillStyle='#EF4444';
        c.beginPath();c.roundRect(bx,by,bw*heatProg,bh,4);c.fill();
        c.fillStyle=dark?'#F87171':'#B91C1C';c.font=`10px Tajawal`;c.textAlign='center';
        c.fillText('🔥 تسخين...',p.x,by+bh+12);
      }

      // Result badge
      if(revealed){
        const cm=colorMap[tt.expect];
        const badgeY=p.y+tubeH/2+42;
        c.fillStyle=cm.fill+'33';
        c.beginPath();c.roundRect(p.x-tubeW*0.7,badgeY,tubeW*1.4,22,6);c.fill();
        c.strokeStyle=cm.fill;c.lineWidth=1.5;c.stroke();
        c.fillStyle=cm.fill;c.font=`bold 11px Tajawal`;c.textAlign='center';
        c.fillText(cm.label,p.x,badgeY+14);
        // Meaning
        c.fillStyle=dark?'#9CA3AF':'#4B5563';c.font=`10px Tajawal`;
        c.fillText(cm.meaning,p.x,badgeY+30);
      }

      // Reagent drop animation when adding
      if(isActive&&simState.heating&&heatProg<0.4){
        const dropY=p.y-tubeH/2-30+heatProg*80;
        const reagentCol=tt.reagent==='يود'?'#7C3AED':'#3B82F6';
        c.fillStyle=reagentCol;
        c.beginPath();c.arc(p.x,dropY,6,0,Math.PI*2);c.fill();
        c.fillStyle=reagentCol+'44';
        c.beginPath();c.arc(p.x,dropY+10,3,0,Math.PI*2);c.fill();
      }
    });

    // Summary row at bottom (only when all revealed)
    const allDone=tests.every(tt=>simState.revealed[tt.id]);
    if(allDone){
      const sy=h*0.84;
      c.fillStyle=dark?'rgba(109,40,217,0.18)':'rgba(237,233,254,0.7)';
      c.beginPath();c.roundRect(w*0.03,sy,w*0.94,h*0.12,12);c.fill();
      c.strokeStyle=dark?'#7C3AED':'#6D28D9';c.lineWidth=2;c.stroke();
      drawLabel(c,'🎉 الاستنتاج: الجلوكوز عبر الغشاء — النشا لم يعبر',w/2,sy+h*0.042,dark?'#A78BFA':'#6D28D9',Math.round(h*0.026));
      drawSmallLabel(c,'الغشاء شبه النافذ انتقائي — يُحاكي جدار الأمعاء الدقيقة',w/2,sy+h*0.086,dark?'#C4B5FD':'#7C3AED',Math.round(h*0.022));
    } else {
      // instruction
      const doneCount=tests.filter(tt=>simState.revealed[tt.id]).length;
      drawSmallLabel(c,`${doneCount}/4 اختبارات مكتملة — انقري على زر لإضافة كاشف`,w/2,h*0.88,dark?'#6B7280':'#9CA3AF',Math.round(h*0.022));
    }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

/* ════════════════════════════════════════════════
   نشاط ٨-٨ · التمثيل الغذائي
════════════════════════════════════════════════ */
function simG9Bio8N8a(){
  cancelAnimationFrame(animFrame);
  simState={t:0};
  controls(`<div class="ctrl-section">
    <div class="ctrl-label">🍬 مسار الجلوكوز في الجسم</div>
    <div style="display:flex;flex-direction:column;gap:6px">
      <div style="padding:9px;background:rgba(253,224,71,0.12);border-radius:9px;border:1px solid rgba(253,224,71,0.3);font-size:12.5px;line-height:1.9">
        🌿 أمعاء دقيقة → يُمتص<br>
        🏥 كبد → يُعالَج / يُخزَّن<br>
        ❤️ قلب → يُضخّ في الدم<br>
        ⚡ خلايا → طاقة ATP
      </div>
      <div style="padding:8px;background:rgba(239,68,68,0.1);border-radius:8px;border:1px solid rgba(239,68,68,0.2);font-size:12px">
        💡 الأنسولين يُنظِّم مستوى الجلوكوز في الدم
      </div>
    </div>
  </div>`);

  const cv=document.getElementById('simCanvas');

  // خطوات المسار
  const steps=[
    {label:'الأمعاء الدقيقة',sub:'يُمتص الجلوكوز عبر الخملات',col:'#D06868',organ:'smallIntestine',emoji:'🌿'},
    {label:'الكبد',          sub:'يُعالَج ويُخزَّن كجليكوجين',col:'#8B2020',organ:'liver',         emoji:'🟤'},
    {label:'القلب والدم',    sub:'يُضخّ إلى جميع أنحاء الجسم',col:'#EF4444',organ:'smallIntestine', emoji:'❤️'},
    {label:'الخلايا',        sub:'تنفس خلوي → طاقة ATP',      col:'#10B981',organ:'smallIntestine', emoji:'⚡'},
  ];

  function draw(){
    if(currentSim!=='g9bio8n8'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.016;
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,dark=dm15();
    c.fillStyle=bioBg();c.fillRect(0,0,w,h);
    drawLabel(c,'مسار الجلوكوز بعد الامتصاص',w/2,h*0.05,bioTxt(),Math.round(h*0.032));

    // ── الجسم التشريحي: يمين (55% من العرض) ──
    const bodyAreaX = w*0.42;
    const bodyScale = 0.55;
    c.save();
    c.translate(bodyAreaX - w*bodyScale*0.5 + w*bodyScale*0.5, (h - h*bodyScale)*0.45);
    c.scale(bodyScale, bodyScale);
    drawAnatomicalBody(c, w, h, dark);
    // العضو المضيء يتغير مع الخطوة الحالية
    const stepIdx = Math.floor((simState.t*0.4) % steps.length);
    drawAnatomicalOrgans(c, w, h, simState.t, steps[stepIdx].organ, dark);
    c.restore();

    // ── مخطط التدفق: يسار ──
    const flowX   = w*0.21;   // مركز أفقي للمخطط
    const boxW    = w*0.36;
    const boxH    = h*0.115;
    const gap     = h*0.045;
    const totalH  = steps.length*(boxH+gap) - gap;
    const startY  = (h - totalH)*0.5 + h*0.03;

    steps.forEach((s,i)=>{
      const by = startY + i*(boxH+gap);
      const bx = flowX - boxW/2;
      const isActive = i === stepIdx;
      const pulse = isActive ? 1+Math.sin(simState.t*3)*0.025 : 1;
      const bw2 = boxW*pulse, bh2 = boxH*pulse;
      const bx2 = flowX - bw2/2, by2 = by + (boxH-bh2)/2;

      // ظل للبطاقة النشطة
      if(isActive){
        c.shadowColor=s.col; c.shadowBlur=18;
      }

      // خلفية البطاقة
      c.fillStyle = isActive ? s.col+'33' : (dark?'rgba(255,255,255,0.04)':'rgba(255,255,255,0.7)');
      c.beginPath(); c.roundRect(bx2,by2,bw2,bh2,10); c.fill();
      c.strokeStyle = isActive ? s.col : s.col+'55';
      c.lineWidth = isActive ? 2.5 : 1.5; c.stroke();
      c.shadowBlur = 0;

      // emoji
      c.font=`${Math.round(bh2*0.38)}px serif`; c.textAlign='center';
      c.fillText(s.emoji, bx2+bw2*0.10, by2+bh2*0.62);

      // اسم العضو
      c.fillStyle = isActive ? s.col : (dark?'#E5E7EB':'#1F2937');
      c.font=`${isActive?'bold ':''} ${Math.round(bh2*0.26)}px Tajawal`; c.textAlign='right';
      c.fillText(s.label, bx2+bw2*0.95, by2+bh2*0.38);

      // وصف
      c.fillStyle = dark?'#9CA3AF':'#6B7280';
      c.font=`${Math.round(bh2*0.20)}px Tajawal`; c.textAlign='right';
      c.fillText(s.sub, bx2+bw2*0.95, by2+bh2*0.68);

      // سهم للأسفل (ليس بعد الأخير)
      if(i<steps.length-1){
        const ay1=by2+bh2+4, ay2=by2+bh2+gap-4;
        drawArrow(c,flowX,ay1,flowX,ay2,dark?s.col+'99':s.col+'77',2,7);
      }
    });

    // جلوكوز متحرك على المخطط
    const fp=(simState.t*0.4)%steps.length;
    const si=Math.min(Math.floor(fp),steps.length-1);
    const fr=fp-si;
    const y1=startY+si*(boxH+gap)+boxH/2;
    const y2=si<steps.length-1?startY+(si+1)*(boxH+gap)+boxH/2:y1;
    const gy=y1+(y2-y1)*fr;
    c.fillStyle='#FCD34D';
    c.beginPath();c.arc(flowX-boxW/2-h*0.022,gy,h*0.016,0,Math.PI*2);c.fill();
    c.strokeStyle='#D97706';c.lineWidth=2;c.stroke();

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}
function simG9Bio8N8b(){
  cancelAnimationFrame(animFrame);
  simState={t:0};
  controls(`<div class="ctrl-section">
    <div class="ctrl-label">🔗 مسار الأحماض الأمينية</div>
    <div style="display:flex;flex-direction:column;gap:6px">
      <div style="padding:9px;background:rgba(96,165,250,0.12);border-radius:9px;border:1px solid rgba(96,165,250,0.3);font-size:12.5px;line-height:1.9">
        🌿 أمعاء دقيقة → تُمتص<br>
        🏥 كبد → يُعالجها<br>
        🏗️ بناء بروتينات وأنزيمات<br>
        ⚗️ نزع الأمين → يوريا → كلى → بول<br>
        ⚡ الزائد → طاقة
      </div>
    </div>
  </div>`);

  const cv=document.getElementById('simCanvas');

  const steps=[
    {label:'الأمعاء الدقيقة', sub:'امتصاص عبر الخملات → الدم',        col:'#D06868', organ:'smallIntestine', emoji:'🌿'},
    {label:'الكبد',           sub:'معالجة وتوزيع الأحماض الأمينية',    col:'#8B2020', organ:'liver',          emoji:'🟤'},
    {label:'بناء البروتينات', sub:'بروتينات + أنزيمات + هرمونات',      col:'#3B82F6', organ:'liver',          emoji:'🏗️'},
    {label:'نزع الأمين',      sub:'NH₂ → يوريا → كلى → بول',          col:'#8B5CF6', organ:'smallIntestine',  emoji:'⚗️'},
    {label:'إنتاج الطاقة',    sub:'الزائد → تنفس خلوي → ATP',          col:'#F59E0B', organ:'smallIntestine',  emoji:'⚡'},
  ];

  function draw(){
    if(currentSim!=='g9bio8n8'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.016;
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,dark=dm15();
    c.fillStyle=bioBg();c.fillRect(0,0,w,h);
    drawLabel(c,'مسار الأحماض الأمينية بعد الامتصاص',w/2,h*0.05,bioTxt(),Math.round(h*0.030));

    // الجسم يمين
    const bodyScale=0.52;
    c.save();
    c.translate(w*0.42-w*bodyScale*0.5+w*bodyScale*0.5,(h-h*bodyScale)*0.45);
    c.scale(bodyScale,bodyScale);
    drawAnatomicalBody(c,w,h,dark);
    const stepIdx=Math.floor((simState.t*0.35)%steps.length);
    drawAnatomicalOrgans(c,w,h,simState.t,steps[stepIdx].organ,dark);
    c.restore();

    // مخطط يسار
    const flowX=w*0.20, boxW=w*0.35, boxH=h*0.095, gap=h*0.035;
    const totalH=steps.length*(boxH+gap)-gap;
    const startY=(h-totalH)*0.5+h*0.03;

    steps.forEach((s,i)=>{
      const by=startY+i*(boxH+gap);
      const isActive=i===stepIdx;
      const pulse=isActive?1+Math.sin(simState.t*3)*0.02:1;
      const bw2=boxW*pulse,bh2=boxH*pulse;
      const bx2=flowX-bw2/2,by2=by+(boxH-bh2)/2;

      if(isActive){c.shadowColor=s.col;c.shadowBlur=15;}
      c.fillStyle=isActive?s.col+'30':(dark?'rgba(255,255,255,0.04)':'rgba(255,255,255,0.72)');
      c.beginPath();c.roundRect(bx2,by2,bw2,bh2,9);c.fill();
      c.strokeStyle=isActive?s.col:s.col+'50';c.lineWidth=isActive?2.5:1.5;c.stroke();
      c.shadowBlur=0;

      c.font=`${Math.round(bh2*0.36)}px serif`;c.textAlign='center';
      c.fillText(s.emoji,bx2+bw2*0.10,by2+bh2*0.65);

      c.fillStyle=isActive?s.col:(dark?'#E5E7EB':'#1F2937');
      c.font=`${isActive?'bold ':''} ${Math.round(bh2*0.26)}px Tajawal`;c.textAlign='right';
      c.fillText(s.label,bx2+bw2*0.95,by2+bh2*0.38);

      c.fillStyle=dark?'#9CA3AF':'#6B7280';
      c.font=`${Math.round(bh2*0.20)}px Tajawal`;c.textAlign='right';
      c.fillText(s.sub,bx2+bw2*0.95,by2+bh2*0.68);

      if(i<steps.length-1) drawArrow(c,flowX,by2+bh2+3,flowX,by2+bh2+gap-3,dark?s.col+'88':s.col+'66',2,6);
    });

    // حمض أميني متحرك
    const fp=(simState.t*0.35)%steps.length;
    const si=Math.min(Math.floor(fp),steps.length-1);
    const fr=fp-si;
    const y1=startY+si*(boxH+gap)+boxH/2;
    const y2=si<steps.length-1?startY+(si+1)*(boxH+gap)+boxH/2:y1;
    c.fillStyle='#60A5FA';
    c.beginPath();c.arc(flowX-boxW/2-h*0.022,y1+(y2-y1)*fr,h*0.015,0,Math.PI*2);c.fill();
    c.strokeStyle='#2563EB';c.lineWidth=2;c.stroke();
    c.fillStyle='#1D4ED8';c.font=`bold ${Math.round(h*0.013)}px Tajawal`;c.textAlign='center';
    c.fillText('NH₂',flowX-boxW/2-h*0.022,y1+(y2-y1)*fr-h*0.024);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}
function simG9Bio8N8c(){
  cancelAnimationFrame(animFrame);
  simState={t:0};
  controls(`<div class="ctrl-section">
    <div class="ctrl-label">🏥 ملخص التمثيل الغذائي</div>
    <div style="display:flex;flex-direction:column;gap:5px">
      <div style="padding:9px;background:rgba(253,224,71,0.12);border-radius:8px;border:1px solid rgba(253,224,71,0.25);font-size:12px;line-height:1.8">
        <strong style="color:#D97706">🍬 جلوكوز</strong><br>
        → طاقة ATP<br>→ جليكوجين
      </div>
      <div style="padding:9px;background:rgba(96,165,250,0.12);border-radius:8px;border:1px solid rgba(96,165,250,0.25);font-size:12px;line-height:1.8">
        <strong style="color:#2563EB">🔗 أحماض أمينية</strong><br>
        → بناء بروتينات<br>→ يوريا → بول
      </div>
      <div style="padding:9px;background:rgba(196,181,253,0.12);border-radius:8px;border:1px solid rgba(196,181,253,0.25);font-size:12px;line-height:1.8">
        <strong style="color:#7C3AED">🧈 دهون</strong><br>
        → تخزين<br>→ طاقة عند الحاجة
      </div>
    </div>
  </div>`);

  const cv=document.getElementById('simCanvas');

  // بيانات مبسّطة — نصوص قصيرة
  const cols=[
    {name:'جلوكوز', emoji:'🍬', col:'#D97706',
     paths:[{icon:'⚡',line1:'طاقة ATP',line2:'تنفس خلوي'},{icon:'🏪',line1:'جليكوجين',line2:'كبد + عضلات'}]},
    {name:'أحماض أمينية', emoji:'🔗', col:'#2563EB',
     paths:[{icon:'🏗️',line1:'بناء بروتينات',line2:'وأنزيمات'},{icon:'⚗️',line1:'يوريا',line2:'كلى → بول'}]},
    {name:'دهون', emoji:'🧈', col:'#7C3AED',
     paths:[{icon:'🏪',line1:'تخزين',line2:'أنسجة دهنية'},{icon:'⚡',line1:'طاقة',line2:'عند الحاجة'}]},
  ];

  function draw(){
    if(currentSim!=='g9bio8n8'||currentTab!==2){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.016;
    const c=cv.getContext('2d'),w=cv.width,h=cv.height,dark=dm15();
    c.fillStyle=bioBg();c.fillRect(0,0,w,h);
    drawLabel(c,'مصير المغذيات بعد الامتصاص',w/2,h*0.055,bioTxt(),Math.round(h*0.032));

    const margin = w*0.025;
    const gapX   = w*0.018;
    const colW   = (w - 2*margin - 2*gapX) / 3;
    const colH   = h*0.78;
    const colY   = h*0.13;

    cols.forEach((col,ci)=>{
      const cx = margin + ci*(colW+gapX);
      const pulse = 1+Math.sin(simState.t*1.4+ci*1.3)*0.012;

      // ── بطاقة خارجية ──
      c.fillStyle = col.col+'15';
      c.beginPath();c.roundRect(cx,colY,colW,colH,12);c.fill();
      c.strokeStyle = col.col+'66';c.lineWidth=2;c.stroke();

      // ── رأس ملوّن ──
      const headH = colH*0.20;
      c.fillStyle = col.col+'28';
      c.beginPath();c.roundRect(cx,colY,colW,headH,12);c.fill();

      // Emoji
      const emojiSz = Math.round(headH*0.52);
      c.font=`${emojiSz}px serif`;c.textAlign='center';
      c.fillText(col.emoji, cx+colW/2, colY+headH*0.68);

      // اسم
      const nameSz = Math.round(Math.min(colW*0.12, h*0.030));
      c.fillStyle=col.col;
      c.font=`bold ${nameSz}px Tajawal`;c.textAlign='center';
      c.fillText(col.name, cx+colW/2, colY+headH+nameSz*1.3);

      // سهم رئيسي
      const arrowTop = colY+headH+nameSz*2.4;
      const arrowBot = arrowTop + h*0.030;
      drawArrow(c,cx+colW/2,arrowTop,cx+colW/2,arrowBot,col.col+'88',1.8,6);

      // ── بطاقتا المسار ──
      const cardH  = colH*0.22;
      const cardW  = colW*0.88;
      const cardX  = cx + (colW-cardW)/2;
      const card1Y = arrowBot + h*0.008;
      const card2Y = card1Y + cardH + h*0.025;

      [card1Y, card2Y].forEach((cy2,pi)=>{
        const p = col.paths[pi];

        // خلفية البطاقة
        c.fillStyle=dark?'rgba(255,255,255,0.07)':'rgba(255,255,255,0.85)';
        c.beginPath();c.roundRect(cardX,cy2,cardW,cardH,8);c.fill();
        c.strokeStyle=col.col+'40';c.lineWidth=1.5;c.stroke();

        // أيقونة يسار (RTL: يمين الكانفاس)
        const iconSz=Math.round(cardH*0.44);
        c.font=`${iconSz}px serif`;c.textAlign='center';
        c.fillText(p.icon, cardX+cardW*0.14, cy2+cardH*0.62);

        // سطر 1
        const txt1Sz=Math.round(Math.min(cardW*0.105, h*0.026));
        c.fillStyle=col.col;
        c.font=`bold ${txt1Sz}px Tajawal`;c.textAlign='right';
        c.fillText(p.line1, cardX+cardW*0.94, cy2+cardH*0.40);

        // سطر 2
        const txt2Sz=Math.round(txt1Sz*0.82);
        c.fillStyle=dark?'#9CA3AF':'#6B7280';
        c.font=`${txt2Sz}px Tajawal`;c.textAlign='right';
        c.fillText(p.line2, cardX+cardW*0.94, cy2+cardH*0.72);

        // سهم بين البطاقتين
        if(pi===0){
          const midY=cy2+cardH+h*0.012;
          drawArrow(c,cx+colW/2,midY,cx+colW/2,midY+h*0.013,col.col+'66',1.5,5);
        }
      });

      // نبضة أسفل
      const dotR=h*0.013*(0.88+Math.sin(simState.t*2.8+ci*1.8)*0.12);
      c.fillStyle=col.col+'BB';
      c.beginPath();c.arc(cx+colW/2,colY+colH*0.955,dotR,0,Math.PI*2);c.fill();
    });

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}


// ══════════════════════════════════════════════════════════
// 🌱 أحياء الصف التاسع — الوحدة ٩: النقل في النبات
// Transport in Plants
// ══════════════════════════════════════════════════════════

// ══ نشاط ١ التبويب الأول: تركيب وعاء الخشب (Xylem) ══
function simG9Bio9N1a(){
  cancelAnimationFrame(animFrame);
  simState={t:0,sel:null,hover:null};
  const cv=document.getElementById('simCanvas');
  const dark=dm15();

  const parts=[
    {id:'vessel', x:0.20, y:0.34, r:0.08, label:'وعاء الخشب',   color:'#B45309', icon:'🟤', desc:'خلايا ميتة مترابطة تكوِّن أنبوبًا مجوّفًا — جدارها مقوّى باللجنين لنقل الماء'},
    {id:'lignin', x:0.20, y:0.62, r:0.08, label:'اللجنين',       color:'#92400E', icon:'⬛', desc:'مادة صلبة في جدران الخلية تمنع الانهيار وتسمح بمرور الماء عبر فجوات'},
    {id:'lumen',  x:0.80, y:0.34, r:0.08, label:'التجويف',       color:'#1D4ED8', icon:'💧', desc:'فراغ مركزي خالٍ من السيتوبلازم — يسمح بتدفق الماء بسرعة'},
    {id:'pits',   x:0.80, y:0.62, r:0.08, label:'الحُفَر الجدارية', color:'#065F46', icon:'🔵', desc:'فتحات صغيرة في الجدار تسمح بتحرك الماء بين الأوعية المجاورة'},
  ];

  controls(`
    <div class="info-box" style="margin-bottom:10px;font-size:14px;line-height:1.7">
      <strong>📖 الدرس ١-٩ · وعاء الخشب (Xylem vessel)</strong><br>
      خلايا ميتة متصلة تكوِّن أنبوبًا مجوّفًا لنقل الماء والأملاح من الجذور إلى الأوراق
    </div>
    <div id="bio9XyInfo" style="padding:12px;background:rgba(39,174,96,0.08);border-radius:10px;min-height:70px;font-size:14px;color:#065F46;line-height:1.7;text-align:center">
      👆 انقر على أي جزء لمعرفة وظيفته
    </div>
    <div class="q-box" style="margin-top:10px">
      <strong>❓ أسئلة (ص٤٩-٥٠)</strong><br>
      ١- ما المواد التي تنقلها أوعية الخشب؟<br>
      ٢- لماذا تُعتبَر أوعية الخشب خلايا ميتة؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">١- الماء والأملاح المعدنية الذائبة.<br>٢- جدرانها مقوّاة باللجنين وخالية من السيتوبلازم والنواة، مما يُتيح تجويفًا حرًا للتدفق.</div>
    </div>`);

  function draw(){
    if(currentSim!=='g9bio9n1'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.018;
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=dm15();
    c.fillStyle=bioBg(); c.fillRect(0,0,w,h);

    // عنوان
    c.fillStyle=bioTxt(); c.font=`bold ${Math.round(h*0.038)}px Tajawal`; c.textAlign='center';
    c.fillText('وعاء الخشب — مقطع طولي', w/2, h*0.08);
    c.fillStyle='#27AE60'; c.font=`${Math.round(h*0.025)}px Tajawal`;
    c.fillText('(Xylem Vessel)', w/2, h*0.115);

    // رسم مقطع وعاء الخشب في المنتصف
    const vx=w*0.5, vy=h*0.14, vw=w*0.18, vh=h*0.52;
    // جدار اللجنين
    const grad=c.createLinearGradient(vx-vw/2,0,vx+vw/2,0);
    grad.addColorStop(0,'#92400E'); grad.addColorStop(0.4,'#B45309'); grad.addColorStop(1,'#92400E');
    c.fillStyle=grad;
    c.beginPath(); c.roundRect(vx-vw/2,vy,vw,vh,6); c.fill();
    // التجويف
    const cw=vw*0.52, ch=vh*0.86, cx2=vx, cy2=vy+vh*0.07;
    c.fillStyle=dark?'rgba(59,130,246,0.25)':'#DBEAFE';
    c.beginPath(); c.roundRect(cx2-cw/2,cy2,cw,ch,4); c.fill();
    // حلقات اللجنين
    for(let i=0;i<5;i++){
      const ty=vy+vh*0.1+i*(vh*0.16);
      c.strokeStyle='#92400E'; c.lineWidth=2.5;
      c.beginPath(); c.moveTo(vx-vw/2,ty); c.lineTo(vx-cw/2,ty); c.stroke();
      c.beginPath(); c.moveTo(vx+cw/2,ty); c.lineTo(vx+vw/2,ty); c.stroke();
    }
    // جزيئات ماء متحركة
    for(let i=0;i<4;i++){
      const wy=cy2+((simState.t*0.35+i*0.25)%1)*ch;
      c.fillStyle='rgba(59,130,246,0.75)';
      c.beginPath(); c.arc(cx2,wy,5,0,Math.PI*2); c.fill();
      c.fillStyle='rgba(255,255,255,0.5)';
      c.beginPath(); c.arc(cx2-1.5,wy-1.5,1.5,0,Math.PI*2); c.fill();
    }

    // دوائر التسمية الأربع
    parts.forEach((p,i)=>{
      const px=p.x*w, py=p.y*h, pr=Math.min(p.r*Math.min(w,h),42);
      const isSel=simState.sel===p.id;
      const bob=Math.sin(simState.t+i)*3;
      c.fillStyle=isSel?p.color:p.color+'AA';
      if(isSel){c.shadowBlur=16; c.shadowColor=p.color;}
      c.beginPath(); c.arc(px,py+bob,pr,0,Math.PI*2); c.fill();
      c.shadowBlur=0;
      c.font=`${Math.round(pr*0.65)}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(p.icon,px,py+bob);
      c.font=`bold ${Math.round(h*0.019)}px Tajawal`; c.textBaseline='top';
      c.fillStyle=isSel?p.color:bioTxt();
      c.fillText(p.label,px,py+bob+pr+4);
    });

    animFrame=requestAnimationFrame(draw);
  }
  cv.onclick=function(e){
    const r=cv.getBoundingClientRect();
    const _et=e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e;
    const mx=(_et.clientX-r.left)*cv.width/r.width, my=(_et.clientY-r.top)*cv.height/r.height;
    parts.forEach(p=>{
      const pr=Math.min(p.r*Math.min(cv.width,cv.height),42);
      if(Math.hypot(mx-p.x*cv.width,my-p.y*cv.height)<pr+18){
        simState.sel=p.id;
        try{U9Sound.ping();}catch(e){}
        const box=document.getElementById('bio9XyInfo');
        if(box){box.innerHTML=`<strong style="font-size:15px">${p.icon} ${p.label}</strong><br><span style="color:#064E3B">${p.desc}</span>`;box.style.background='rgba(39,174,96,0.15)';}
      }
    });
  };
  cv.onmousemove=function(e){
    const r=cv.getBoundingClientRect();
    const mx=(e.clientX-r.left)*cv.width/r.width, my=(e.clientY-r.top)*cv.height/r.height;
    simState.hover=null;
    parts.forEach(p=>{if(Math.hypot(mx-p.x*cv.width,my-p.y*cv.height)<Math.min(p.r*Math.min(cv.width,cv.height),42)+18)simState.hover=p.id;});
    cv.style.cursor=simState.hover?'pointer':'default';
  };
  draw();
}

// ══ نشاط ١ التبويب الثاني: تركيب أنابيب اللحاء (Phloem) ══
function simG9Bio9N1b(){
  cancelAnimationFrame(animFrame);
  simState={t:0,sel:null};
  const cv=document.getElementById('simCanvas');

  const phlParts=[
    {id:'sieve',x:0.22,y:0.38,r:0.08,label:'الخلية الغربالية',col:'#7C3AED',icon:'🔵',desc:'خلية حيّة تحتوي على سيتوبلازم — تفقد نواتها — جدارها العرضي صفيحة غربالية مثقّبة'},
    {id:'plate',x:0.22,y:0.65,r:0.08,label:'الصفيحة الغربالية',col:'#4C1D95',icon:'🔶',desc:'جدار مثقّب بين خليتين متجاورتين يسمح بتدفق السكروز والأحماض الأمينية'},
    {id:'companion',x:0.78,y:0.38,r:0.08,label:'الخلية المرافقة',col:'#1D4ED8',icon:'🟢',desc:'خلية حيّة تحتوي على نواة — تُزوِّد الخلية الغربالية بالطاقة والبروتينات'},
    {id:'sugar',x:0.78,y:0.65,r:0.08,label:'السكروز المنتقل',col:'#D97706',icon:'🍬',desc:'السكروز والأحماض الأمينية تتدفق من الأوراق (مصدر) إلى الجذور والثمار (مصبّ)'},
  ];

  controls(`
    <div class="info-box" style="margin-bottom:10px;font-size:14px;line-height:1.7">
      <strong>📖 أنابيب اللحاء (Phloem Tubes)</strong><br>
      خلايا حيّة مترابطة عبر صفائح غربالية — تنقل السكروز والأحماض الأمينية في كلا الاتجاهين
    </div>
    <div id="bio9PhInfo" style="padding:12px;background:rgba(107,78,154,0.08);border-radius:10px;min-height:70px;font-size:14px;color:#4C1D95;line-height:1.7;text-align:center">
      👆 انقر على مكونات اللحاء
    </div>
    <div class="q-box" style="margin-top:10px">
      <strong>❓ المقارنة (ص٥٠)</strong><br>
      ١- ما الفرق بين خلايا الخشب وأنابيب اللحاء؟<br>
      ٢- في أي الاتجاهين ينتقل السكروز؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">١- الخشب خلايا ميتة، اللحاء خلايا حيّة (بدون نواة في الخلايا الغربالية).<br>٢- في الاتجاهين — من المصدر (الأوراق) إلى المصبّ (الجذور أو الثمار).</div>
    </div>`);

  function draw(){
    if(currentSim!=='g9bio9n1'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.018;
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=dm15();
    c.fillStyle=bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle=bioTxt(); c.font=`bold ${Math.round(h*0.038)}px Tajawal`; c.textAlign='center';
    c.fillText('أنابيب اللحاء — مقطع طولي', w/2, h*0.08);
    c.fillStyle='#7C3AED'; c.font=`${Math.round(h*0.025)}px Tajawal`;
    c.fillText('(Phloem Tubes)', w/2, h*0.115);

    // أنبوب اللحاء في المنتصف
    const tx=w*0.5, ty=h*0.14, tw=w*0.16, th=h*0.52;
    c.fillStyle=dark?'rgba(167,139,250,0.15)':'rgba(237,233,254,0.7)';
    c.beginPath(); c.roundRect(tx-tw/2,ty,tw,th,6); c.fill();
    c.strokeStyle='#7C3AED'; c.lineWidth=2.5;
    c.beginPath(); c.roundRect(tx-tw/2,ty,tw,th,6); c.stroke();

    // صفيحتان غربالتيان
    for(let i=1;i<=2;i++){
      const sy=ty+th*(i/3);
      c.strokeStyle='#4C1D95'; c.lineWidth=3;
      c.beginPath(); c.moveTo(tx-tw/2,sy); c.lineTo(tx+tw/2,sy); c.stroke();
      for(let j=0;j<5;j++){
        const px2=tx-tw/2+tw*(j+0.5)/5;
        c.fillStyle='#4C1D95';
        c.beginPath(); c.arc(px2,sy,2.5,0,Math.PI*2); c.fill();
      }
    }
    // جزيئات متحركة
    for(let i=0;i<3;i++){
      const prog=((simState.t*0.28+i*0.33)%1);
      c.fillStyle='rgba(217,119,6,0.85)';
      c.beginPath(); c.arc(tx,ty+prog*th,5,0,Math.PI*2); c.fill();
    }

    // دوائر التسمية
    phlParts.forEach((p,i)=>{
      const px=p.x*w, py=p.y*h, pr=Math.min(p.r*Math.min(w,h),42);
      const bob=Math.sin(simState.t+i*1.2)*2.5;
      c.fillStyle=simState.sel===p.id?p.col:p.col+'99';
      if(simState.sel===p.id){c.shadowBlur=14;c.shadowColor=p.col;}
      c.beginPath(); c.arc(px,py+bob,pr,0,Math.PI*2); c.fill();
      c.shadowBlur=0;
      c.font=`${Math.round(pr*0.65)}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(p.icon,px,py+bob);
      c.font=`bold ${Math.round(h*0.019)}px Tajawal`; c.textBaseline='top';
      c.fillStyle=simState.sel===p.id?p.col:bioTxt();
      c.fillText(p.label,px,py+bob+pr+4);
    });
    animFrame=requestAnimationFrame(draw);
  }
  cv.onclick=function(e){
    const r=cv.getBoundingClientRect();
    const _et=e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e;
    const mx=(_et.clientX-r.left)*cv.width/r.width, my=(_et.clientY-r.top)*cv.height/r.height;
    phlParts.forEach(p=>{
      if(Math.hypot(mx-p.x*cv.width,my-p.y*cv.height)<Math.min(p.r*Math.min(cv.width,cv.height),42)+18){
        simState.sel=p.id;
        try{U9Sound.ping();}catch(e){}
        const box=document.getElementById('bio9PhInfo');
        if(box){box.innerHTML=`<strong style="font-size:15px">${p.icon} ${p.label}</strong><br><span style="color:#4C1D95">${p.desc}</span>`;box.style.background='rgba(107,78,154,0.15)';}
      }
    });
  };
  draw();
}

// ══ نشاط ٢ التبويب الأول: الشعيرات الجذرية والأسموزية ══
function simG9Bio9N2a(){
  cancelAnimationFrame(animFrame);
  simState={t:0,phase:'idle',molecules:[]};
  for(let i=0;i<8;i++) simState.molecules.push({x:0.72+Math.random()*0.2,y:0.28+Math.random()*0.44,inRoot:false});
  const cv=document.getElementById('simCanvas');

  controls(`
    <div class="info-box" style="margin-bottom:8px;font-size:14px;line-height:1.7">
      <strong>💧 الأسموزية وامتصاص الماء</strong><br>
      الماء يتحرك من محلول أقل تركيزًا (التربة) إلى محلول أكثر تركيزًا (الشعيرة) عبر الغشاء شبه المنفذ
    </div>
    <button onclick="simState.phase='absorb';simState.molecules.forEach(m=>{m.x=0.72+Math.random()*0.2;m.y=0.28+Math.random()*0.44;m.inRoot=false;})" style="background:#27AE60;color:#fff;border:none;padding:9px 18px;border-radius:10px;font-family:Tajawal;font-size:15px;font-weight:700;cursor:pointer;width:100%;margin-bottom:6px">💧 ابدأ الامتصاص بالأسموزية</button>
    <button onclick="simState.phase='idle';simState.molecules.forEach(m=>{m.x=0.72+Math.random()*0.2;m.y=0.28+Math.random()*0.44;m.inRoot=false;})" style="background:rgba(39,174,96,0.1);color:#065F46;border:1px solid rgba(39,174,96,0.3);padding:8px;border-radius:10px;font-family:Tajawal;font-size:14px;cursor:pointer;width:100%;margin-bottom:8px">🔄 إعادة</button>
    <div class="q-box">
      <strong>❓ (ص٥٢-٥٣)</strong><br>
      ١- ما الذي يدفع الماء للدخول للشعيرات الجذرية؟<br>
      ٢- لماذا الشعيرات الجذرية كثيرة العدد رغم صغر حجمها؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">١- فرق التركيز — داخل الشعيرة أعلى تركيزًا، فالماء يدخل بالأسموزية.<br>٢- لتكبير مساحة السطح الكلية لامتصاص أكبر كمية ممكنة.</div>
    </div>`);

  function draw(){
    if(currentSim!=='g9bio9n2'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.016;
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=dm15();
    c.fillStyle=bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle=bioTxt(); c.font=`bold ${Math.round(h*0.035)}px Tajawal`; c.textAlign='center';
    c.fillText('الشعيرة الجذرية وامتصاص الماء', w/2, h*0.08);

    // الشعيرة (يسار)
    const rx=w*0.08, ry=h*0.15, rw=w*0.42, rh=h*0.65;
    c.fillStyle=dark?'rgba(39,174,96,0.12)':'rgba(209,250,229,0.7)';
    c.beginPath(); c.roundRect(rx,ry,rw,rh,10); c.fill();
    c.strokeStyle='#27AE60'; c.lineWidth=2.5;
    c.beginPath(); c.roundRect(rx,ry,rw,rh,10); c.stroke();
    c.fillStyle=bioTxt(); c.font=`bold ${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
    c.fillText('الشعيرة الجذرية',rx+rw/2,ry-h*0.02);
    c.fillStyle='#27AE60'; c.font=`${Math.round(h*0.018)}px Tajawal`;
    c.fillText('تركيز عالٍ ✅',rx+rw/2,ry+h*0.06);

    // التربة (يمين)
    const sx=w*0.56, sy=h*0.15, sw=w*0.36, sh=h*0.65;
    c.fillStyle=dark?'rgba(180,120,60,0.12)':'rgba(254,243,199,0.7)';
    c.beginPath(); c.roundRect(sx,sy,sw,sh,10); c.fill();
    c.strokeStyle='#B45309'; c.lineWidth=2;
    c.beginPath(); c.roundRect(sx,sy,sw,sh,10); c.stroke();
    c.fillStyle=bioTxt(); c.font=`bold ${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
    c.fillText('التربة',sx+sw/2,sy-h*0.02);
    c.fillStyle='#92400E'; c.font=`${Math.round(h*0.018)}px Tajawal`;
    c.fillText('تركيز منخفض',sx+sw/2,sy+h*0.06);

    // غشاء شبه منفذ
    const memX=sx-2;
    c.strokeStyle='#6B4E9A'; c.lineWidth=4;
    c.setLineDash([8,5]);
    c.beginPath(); c.moveTo(memX,sy+h*0.02); c.lineTo(memX,sy+sh-h*0.02); c.stroke();
    c.setLineDash([]);
    c.save(); c.translate(memX,h*0.5); c.rotate(-Math.PI/2);
    c.fillStyle='#6B4E9A'; c.font=`bold ${Math.round(h*0.018)}px Tajawal`; c.textAlign='center';
    c.fillText('غشاء شبه منفذ',0,0); c.restore();

    // جزيئات الماء
    if(simState.phase==='absorb'){
      simState.molecules.forEach(m=>{
        if(!m.inRoot){
          m.x-=0.005;
          if(m.x<0.53) m.inRoot=true;
        } else {
          m.x=Math.max(0.10,Math.min(0.47,m.x+(Math.random()-0.5)*0.004));
          m.y=Math.max(0.18,Math.min(0.75,m.y+(Math.random()-0.5)*0.004));
        }
      });
    }
    simState.molecules.forEach(m=>{
      c.fillStyle=m.inRoot?'rgba(59,130,246,0.85)':'rgba(147,197,253,0.65)';
      c.beginPath(); c.arc(m.x*w,m.y*h,5.5,0,Math.PI*2); c.fill();
      c.fillStyle='rgba(255,255,255,0.5)';
      c.beginPath(); c.arc(m.x*w-1.5,m.y*h-1.5,1.5,0,Math.PI*2); c.fill();
    });

    // سهم الاتجاه
    if(simState.phase==='absorb'){
      c.fillStyle='rgba(39,174,96,0.9)'; c.font=`${Math.round(h*0.045)}px sans-serif`; c.textAlign='center';
      c.fillText('←',w*0.53,h*0.5);
      c.font=`bold ${Math.round(h*0.020)}px Tajawal`; c.fillStyle='#27AE60';
      c.fillText('أسموزية',w*0.53,h*0.58);
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ نشاط ٢ التبويب الثاني: المسار الجانبي ══
function simG9Bio9N2b(){
  cancelAnimationFrame(animFrame);
  simState={t:0,step:0};
  const cv=document.getElementById('simCanvas');

  const steps=[
    'الماء يدخل من التربة إلى الشعيرة الجذرية بالأسموزية',
    'الشعيرة الجذرية → خلايا القشرة (Cortex) جانبيًا',
    'الماء ينتقل من خلية إلى أخرى بالأسموزية',
    'الماء يصل إلى أوعية الخشب في مركز الجذر',
    '✅ الماء يصعد عبر الخشب بتيار النتح!',
  ];

  controls(`
    <div class="info-box" style="margin-bottom:8px;font-size:14px;line-height:1.7">
      <strong>🌿 المسار الجانبي للماء في الجذر</strong><br>
      بعد الدخول للشعيرة، يتحرك الماء عبر خلايا القشرة حتى يصل لأوعية الخشب
    </div>
    <button onclick="if(simState.step<4)simState.step++" style="background:#1A8FA8;color:#fff;border:none;padding:9px 18px;border-radius:10px;font-family:Tajawal;font-size:15px;font-weight:700;cursor:pointer;width:100%;margin-bottom:6px">▶ الخطوة التالية</button>
    <button onclick="simState.step=0" style="background:rgba(26,143,168,0.1);color:#065F46;border:1px solid rgba(26,143,168,0.3);padding:8px;border-radius:10px;font-family:Tajawal;font-size:14px;cursor:pointer;width:100%;margin-bottom:8px">🔄 من البداية</button>
    <div id="bio9StepInfo" style="padding:10px;background:rgba(26,143,168,0.08);border-radius:8px;font-size:14px;color:#065F46;min-height:55px;line-height:1.6;text-align:center">اضغط "الخطوة التالية" لبدء الرحلة 👆</div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ اشرح كيفية انتقال الماء إلى الشعيرات الجذرية</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">الماء يدخل من التربة بالأسموزية → ينتقل جانبيًا عبر خلايا القشرة → يصل لأوعية الخشب → يُسحب للأعلى بتيار النتح.</div>
    </div>`);

  function draw(){
    if(currentSim!=='g9bio9n2'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.02;
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=dm15();
    c.fillStyle=bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle=bioTxt(); c.font=`bold ${Math.round(h*0.034)}px Tajawal`; c.textAlign='center';
    c.fillText('مقطع عرضي للجذر — مسار الماء', w/2, h*0.07);

    // دوائر متحدة المركز
    const cx3=w*0.52, cy3=h*0.50;
    const layers=[
      {r:h*0.30,fill:dark?'rgba(180,120,60,0.12)':'rgba(254,243,199,0.5)',stroke:'#B45309',lbl:'البشرة والشعيرات الجذرية'},
      {r:h*0.22,fill:dark?'rgba(39,174,96,0.10)':'rgba(209,250,229,0.5)',stroke:'#27AE60',lbl:'القشرة (Cortex)'},
      {r:h*0.13,fill:dark?'rgba(26,143,168,0.12)':'rgba(207,250,254,0.5)',stroke:'#1A8FA8',lbl:''},
      {r:h*0.06,fill:dark?'rgba(212,144,26,0.25)':'rgba(253,230,138,0.7)',stroke:'#D4901A',lbl:'أوعية الخشب'},
    ];
    layers.forEach((l,i)=>{
      c.fillStyle=l.fill; c.beginPath(); c.arc(cx3,cy3,l.r,0,Math.PI*2); c.fill();
      c.strokeStyle=l.stroke; c.lineWidth=2;
      c.beginPath(); c.arc(cx3,cy3,l.r,0,Math.PI*2); c.stroke();
      if(l.lbl){
        c.font=`${Math.round(h*0.018)}px Tajawal`; c.textAlign='center'; c.fillStyle=l.stroke;
        c.fillText(l.lbl,cx3,cy3-l.r-h*0.012);
      }
    });

    // نقطة متحركة
    if(simState.step>0){
      const maxR=layers[0].r, minR=layers[3].r;
      const targetR=simState.step>=4?minR:maxR-(maxR-minR)*(simState.step/4);
      const angle=-Math.PI/2+simState.t*0.5;
      const px=cx3+targetR*Math.cos(angle), py=cy3+targetR*Math.sin(angle);
      c.fillStyle='rgba(59,130,246,0.9)';
      c.shadowBlur=12; c.shadowColor='#3B82F6';
      c.beginPath(); c.arc(px,py,7,0,Math.PI*2); c.fill();
      c.shadowBlur=0;
    }

    // معلومة الخطوة
    const info=document.getElementById('bio9StepInfo');
    if(info&&steps[simState.step]) info.innerHTML=`<strong>الخطوة ${simState.step+1}/${steps.length}:</strong><br>${steps[simState.step]}`;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ نشاط ٣ التبويب الأول: عملية النتح والثغور ══
// ── دالة رسم شجرة واقعية مشتركة ──────────────────────────
// ══════════════════════════════════════════════════════════════
// 🌳 دالة رسم شجرة احترافية واقعية — النسخة المطوّرة
// ══════════════════════════════════════════════════════════════
function drawRealisticTree(c,w,h,dark,windAmt,t){
  const tx=w*0.50, baseY=h*0.72;

  // ── خلفية سماء متدرجة مع غيوم ──
  const skyG=c.createLinearGradient(0,0,0,h*0.72);
  if(dark){
    skyG.addColorStop(0,'#060d1f');skyG.addColorStop(0.5,'#0a1a2e');skyG.addColorStop(1,'#0d2010');
    c.fillStyle=skyG;c.fillRect(0,0,w,h*0.72);
    // نجوم خفيفة
    for(let i=0;i<18;i++){
      const sx=(Math.sin(i*137.5)*0.5+0.5)*w, sy=(Math.cos(i*97.3)*0.5+0.5)*h*0.55;
      const sa=0.3+0.4*Math.abs(Math.sin(t*0.5+i));
      c.fillStyle=`rgba(255,255,200,${sa})`;
      c.beginPath();c.arc(sx,sy,0.8+0.5*Math.abs(Math.sin(i)),0,Math.PI*2);c.fill();
    }
  } else {
    skyG.addColorStop(0,'#bfdbfe');skyG.addColorStop(0.45,'#93c5fd');skyG.addColorStop(0.75,'#bbf7d0');skyG.addColorStop(1,'#d1fae5');
    c.fillStyle=skyG;c.fillRect(0,0,w,h*0.72);
    // شمس
    const sunX=w*0.82, sunY=h*0.12;
    const sunG=c.createRadialGradient(sunX,sunY,0,sunX,sunY,h*0.10);
    sunG.addColorStop(0,'rgba(255,255,200,1)');sunG.addColorStop(0.4,'rgba(253,224,71,0.8)');sunG.addColorStop(1,'rgba(250,204,21,0)');
    c.fillStyle=sunG;c.beginPath();c.arc(sunX,sunY,h*0.10,0,Math.PI*2);c.fill();
    // أشعة الشمس
    c.strokeStyle='rgba(253,224,71,0.35)';c.lineWidth=1.5;
    for(let i=0;i<8;i++){
      const a=(i/8)*Math.PI*2+t*0.05;
      c.beginPath();c.moveTo(sunX+Math.cos(a)*h*0.07,sunY+Math.sin(a)*h*0.07);
      c.lineTo(sunX+Math.cos(a)*h*0.13,sunY+Math.sin(a)*h*0.13);c.stroke();
    }
    // غيوم
    [[w*0.18,h*0.09,1.0],[w*0.60,h*0.06,0.8],[w*0.08,h*0.18,0.6]].forEach(([cx2,cy2,sc])=>{
      const sw=Math.sin(t*0.08)*w*0.003;
      c.fillStyle='rgba(255,255,255,0.82)';
      [[-18,0,22],[0,-10,18],[18,0,20],[8,8,15],[-8,8,14]].forEach(([dx2,dy2,r2])=>{
        c.beginPath();c.arc(cx2+dx2*sc+sw,cy2+dy2*sc,r2*sc,0,Math.PI*2);c.fill();
      });
    });
  }

  // ── أرض خضراء بتفاصيل ──
  const gndG=c.createLinearGradient(0,baseY,0,h);
  if(dark){gndG.addColorStop(0,'#14401a');gndG.addColorStop(0.4,'#0d2e10');gndG.addColorStop(1,'#071508');}
  else{gndG.addColorStop(0,'#4ade80');gndG.addColorStop(0.25,'#22c55e');gndG.addColorStop(0.6,'#16a34a');gndG.addColorStop(1,'#14532d');}
  c.fillStyle=gndG;c.fillRect(0,baseY,w,h-baseY);
  // خط العشب الطبيعي
  c.strokeStyle=dark?'rgba(74,222,128,0.25)':'rgba(255,255,255,0.18)';c.lineWidth=1.5;
  c.beginPath();c.moveTo(0,baseY);
  for(let x=0;x<=w;x+=12){c.lineTo(x,baseY+Math.sin(x*0.06+t*0.15)*3+Math.sin(x*0.12)*1.5);}
  c.stroke();
  // حشائش صغيرة
  const grassSeeds=[0.12,0.22,0.35,0.65,0.75,0.88];
  grassSeeds.forEach(gx=>{
    const gX=gx*w, gY=baseY;
    c.strokeStyle=dark?'rgba(74,222,128,0.5)':'rgba(22,163,74,0.6)';c.lineWidth=1.2;
    for(let g=0;g<3;g++){
      const sw2=Math.sin(t*0.7+(gx*10+g)*2)*windAmt*3;
      c.beginPath();c.moveTo(gX+g*4-4,gY);
      c.quadraticCurveTo(gX+g*4-4+sw2*0.5,gY-6,gX+g*4-4+sw2,gY-11);c.stroke();
    }
  });

  // ── جذور ظاهرة فوق الأرض ──
  const rootDefs=[
    {dx:-0.11,cx:-0.06,cy:0.055,ex:-0.14,ey:0.14,w:5},
    {dx:-0.07,cx:-0.03,cy:0.04,ex:-0.09,ey:0.12,w:4},
    {dx:0.07,cx:0.03,cy:0.04,ex:0.09,ey:0.12,w:4},
    {dx:0.11,cx:0.06,cy:0.055,ex:0.14,ey:0.14,w:5},
    {dx:-0.04,cx:-0.02,cy:0.06,ex:-0.06,ey:0.16,w:3},
    {dx:0.04,cx:0.02,cy:0.06,ex:0.06,ey:0.16,w:3},
  ];
  rootDefs.forEach(r=>{
    const rG=c.createLinearGradient(tx,baseY,tx+r.ex*w,baseY+r.ey*(h-baseY));
    rG.addColorStop(0,dark?'#5c3d1a':'#7c4a1a');rG.addColorStop(1,dark?'#2d1a06':'#4a2c0a');
    c.strokeStyle=rG;c.lineWidth=r.w;c.lineCap='round';
    c.beginPath();c.moveTo(tx,baseY);
    c.bezierCurveTo(tx+r.cx*w*0.5,baseY+r.cy*(h-baseY)*0.3,tx+r.cx*w,baseY+r.cy*(h-baseY),tx+r.ex*w,baseY+r.ey*(h-baseY));
    c.stroke();
  });

  // ── جذع الشجرة الرئيسي ──
  const trunkH=h*0.40, trunkTopW=w*0.022, trunkBotW=w*0.062;
  const windSway=Math.sin(t*0.45)*windAmt*w*0.004;
  const trunkG=c.createLinearGradient(tx-trunkBotW,0,tx+trunkBotW,0);
  if(dark){
    trunkG.addColorStop(0,'#1a0d04');trunkG.addColorStop(0.25,'#4d2a0a');
    trunkG.addColorStop(0.55,'#7a4c1e');trunkG.addColorStop(0.75,'#5c3810');trunkG.addColorStop(1,'#1a0d04');
  } else {
    trunkG.addColorStop(0,'#3a1f06');trunkG.addColorStop(0.22,'#6b3f15');
    trunkG.addColorStop(0.50,'#c4853a');trunkG.addColorStop(0.72,'#8b5e2a');trunkG.addColorStop(1,'#3a1f06');
  }
  c.fillStyle=trunkG;
  c.beginPath();
  c.moveTo(tx-trunkBotW,baseY);
  c.bezierCurveTo(tx-trunkBotW*0.9,baseY-trunkH*0.25,tx-trunkTopW*1.2+windSway*0.3,baseY-trunkH*0.7,tx-trunkTopW+windSway,baseY-trunkH);
  c.lineTo(tx+trunkTopW+windSway,baseY-trunkH);
  c.bezierCurveTo(tx+trunkTopW*1.2+windSway*0.3,baseY-trunkH*0.7,tx+trunkBotW*0.9,baseY-trunkH*0.25,tx+trunkBotW,baseY);
  c.closePath();c.fill();

  // نقوش لحاء الجذع — خطوط أفقية منحنية
  c.save();c.globalAlpha=0.22;
  for(let i=0;i<9;i++){
    const ly3=baseY-trunkH*(0.07+i*0.10);
    const frac=(0.07+i*0.10);
    const halfW=trunkBotW-(trunkBotW-trunkTopW)*frac;
    c.strokeStyle=dark?'#0a0502':'#2a1005';c.lineWidth=1.2;
    c.beginPath();
    c.moveTo(tx-halfW*0.85,ly3+h*0.006);
    c.bezierCurveTo(tx-halfW*0.4,ly3-h*0.003,tx+halfW*0.4,ly3+h*0.005,tx+halfW*0.85,ly3-h*0.003);
    c.stroke();
    // خط أفتح للبروز
    c.strokeStyle=dark?'rgba(150,100,50,0.4)':'rgba(220,160,80,0.5)';c.lineWidth=0.7;
    c.beginPath();
    c.moveTo(tx-halfW*0.8,ly3+h*0.005+1);
    c.bezierCurveTo(tx-halfW*0.3,ly3-h*0.002+1,tx+halfW*0.3,ly3+h*0.004+1,tx+halfW*0.8,ly3-h*0.002+1);
    c.stroke();
  }
  // شقوق عمودية رفيعة
  c.globalAlpha=0.15;
  for(let i=0;i<4;i++){
    const vx2=tx+(i-1.5)*trunkBotW*0.3;
    c.strokeStyle=dark?'#050200':'#1a0a02';c.lineWidth=0.8;
    c.beginPath();c.moveTo(vx2,baseY-trunkH*0.12);c.lineTo(vx2+windSway*0.2,baseY-trunkH*0.88);c.stroke();
  }
  c.restore();

  // ── أفرع رئيسية بتدرج وسُمك متناقص ──
  const crownBase=baseY-trunkH;
  function drawBranch(x1,y1,angle,length,depth,windFactor){
    if(depth<=0||length<w*0.012)return;
    const sw3=Math.sin(t*0.55+depth)*windAmt*windFactor*0.025;
    const x2=x1+Math.cos(angle+sw3)*length;
    const y2=y1+Math.sin(angle+sw3)*length;
    const lw2=Math.max(1,(depth/6)*trunkTopW*2.5);
    const bG=c.createLinearGradient(x1,y1,x2,y2);
    const bc1=dark?`rgba(60,30,8,0.9)`:`rgba(80,46,14,0.9)`;
    const bc2=dark?`rgba(40,20,5,0.8)`:`rgba(55,33,10,0.8)`;
    bG.addColorStop(0,bc1);bG.addColorStop(1,bc2);
    c.strokeStyle=bG;c.lineWidth=lw2;c.lineCap='round';
    c.beginPath();c.moveTo(x1,y1);
    const cpx=x1+(x2-x1)*0.45+Math.sin(t*0.3+depth)*windAmt*w*0.008;
    const cpy=y1+(y2-y1)*0.45;
    c.quadraticCurveTo(cpx,cpy,x2,y2);c.stroke();
    // أفرع فرعية
    drawBranch(x2,y2,angle-0.45-Math.random()*0.2,length*0.65,depth-1,windFactor*1.3);
    drawBranch(x2,y2,angle+0.40+Math.random()*0.2,length*0.62,depth-1,windFactor*1.3);
  }
  const branchAngle=-Math.PI/2;
  const branchLen=trunkH*0.35;
  drawBranch(tx+windSway*0.5,crownBase+h*0.04,branchAngle-0.32,branchLen*0.80,4,1.0);
  drawBranch(tx+windSway*0.5,crownBase+h*0.04,branchAngle+0.30,branchLen*0.78,4,1.0);
  drawBranch(tx+windSway*0.3,crownBase+h*0.10,branchAngle-0.12,branchLen*0.88,5,0.8);

  // ── تاج الشجرة — طبقات متعددة من الأوراق ──
  const swing0=Math.sin(t*0.5)*windAmt*0.028;
  // طبقة الظل (خلف)
  const shadowCrowns=[
    {cx:tx+swing0*w*0.6,cy:crownBase-h*0.04,rx:w*0.240,ry:h*0.215},
    {cx:tx-w*0.13+swing0*w*0.5,cy:crownBase+h*0.07,rx:w*0.175,ry:h*0.155},
    {cx:tx+w*0.12+swing0*w*0.5,cy:crownBase+h*0.075,rx:w*0.165,ry:h*0.150},
    {cx:tx+swing0*w,cy:crownBase-h*0.19,rx:w*0.170,ry:h*0.145},
    {cx:tx-w*0.06+swing0*w*0.7,cy:crownBase-h*0.14,rx:w*0.130,ry:h*0.120},
    {cx:tx+w*0.07+swing0*w*0.7,cy:crownBase-h*0.13,rx:w*0.125,ry:h*0.115},
  ];
  shadowCrowns.forEach(cr=>{
    c.fillStyle='rgba(0,0,0,0.10)';
    c.beginPath();c.ellipse(cr.cx+w*0.018,cr.cy+h*0.018,cr.rx,cr.ry,0,0,Math.PI*2);c.fill();
  });

  // طبقات اللون الأساسية — من الأغمق للأفتح
  const leafLayers=[
    // طبقة أساس داكنة
    {cx:tx+swing0*w,cy:crownBase-h*0.02,rx:w*0.235,ry:h*0.210,
      c0:'#134e28',c1:'#166534',c2:'#14532d',alpha:0.95},
    // طبقة وسط
    {cx:tx-w*0.10+swing0*w*0.7,cy:crownBase+h*0.06,rx:w*0.170,ry:h*0.150,
      c0:'#15803d',c1:'#16a34a',c2:'#166534',alpha:0.90},
    {cx:tx+w*0.10+swing0*w*0.7,cy:crownBase+h*0.065,rx:w*0.160,ry:h*0.145,
      c0:'#16a34a',c1:'#22c55e',c2:'#15803d',alpha:0.88},
    // قمة
    {cx:tx+swing0*w,cy:crownBase-h*0.17,rx:w*0.165,ry:h*0.140,
      c0:'#22c55e',c1:'#4ade80',c2:'#16a34a',alpha:0.90},
    // جانبان صغيران
    {cx:tx-w*0.055+swing0*w*0.6,cy:crownBase-h*0.12,rx:w*0.125,ry:h*0.112,
      c0:'#16a34a',c1:'#22c55e',c2:'#15803d',alpha:0.85},
    {cx:tx+w*0.060+swing0*w*0.6,cy:crownBase-h*0.115,rx:w*0.120,ry:h*0.108,
      c0:'#22c55e',c1:'#4ade80',c2:'#16a34a',alpha:0.83},
  ];
  leafLayers.forEach(lr=>{
    c.save();c.globalAlpha=lr.alpha;
    const lg2=c.createRadialGradient(lr.cx-lr.rx*0.22,lr.cy-lr.ry*0.25,lr.rx*0.05,lr.cx,lr.cy,lr.rx);
    lg2.addColorStop(0,lr.c0+'FF');lg2.addColorStop(0.45,lr.c1+'EE');lg2.addColorStop(1,lr.c2+'88');
    c.fillStyle=lg2;
    c.beginPath();c.ellipse(lr.cx,lr.cy,lr.rx,lr.ry,0,0,Math.PI*2);c.fill();
    c.restore();
  });

  // أوراق منفردة تبرز على حافة التاج
  const leafCount=28;
  for(let i=0;i<leafCount;i++){
    const baseAngle=(i/leafCount)*Math.PI*2;
    const layerIdx=i%leafLayers.length;
    const lr=leafLayers[layerIdx];
    const leafWobble=Math.sin(t*0.6+i*0.9)*windAmt*0.06;
    const radialFactor=0.82+0.12*Math.sin(i*2.3);
    const lx3=lr.cx+Math.cos(baseAngle+leafWobble)*lr.rx*radialFactor;
    const ly3=lr.cy+Math.sin(baseAngle+leafWobble)*lr.ry*radialFactor;
    const leafSz=lr.rx*(0.10+0.05*Math.sin(i*3.7));
    const leafAngle=baseAngle+Math.PI/2+leafWobble;
    // رسم ورقة منفردة بيضاوية
    c.save();c.translate(lx3,ly3);c.rotate(leafAngle);
    const lc=i%3===0?lr.c0:i%3===1?lr.c1:lr.c2;
    const lf=c.createLinearGradient(-leafSz*0.4,-leafSz*0.7,leafSz*0.4,leafSz*0.7);
    lf.addColorStop(0,lc+'EE');lf.addColorStop(1,i%2===0?lr.c2+'CC':'#14532d99');
    c.fillStyle=lf;
    c.beginPath();
    c.moveTo(0,-leafSz*0.8);
    c.bezierCurveTo(leafSz*0.5,-leafSz*0.4,leafSz*0.55,leafSz*0.3,0,leafSz*0.8);
    c.bezierCurveTo(-leafSz*0.55,leafSz*0.3,-leafSz*0.5,-leafSz*0.4,0,-leafSz*0.8);
    c.fill();
    // عرق مركزي للأوراق الكبيرة
    if(leafSz>lr.rx*0.12){
      c.strokeStyle='rgba(6,78,59,0.4)';c.lineWidth=0.7;
      c.beginPath();c.moveTo(0,-leafSz*0.7);c.lineTo(0,leafSz*0.7);c.stroke();
    }
    c.restore();
  }

  // ── ضوء وظل فوق التاج ──
  // انعكاس ضوء الشمس (أعلى يسار)
  const shine2G=c.createRadialGradient(tx-w*0.08+swing0*w,crownBase-h*0.18,0,tx-w*0.02+swing0*w,crownBase-h*0.10,w*0.20);
  shine2G.addColorStop(0,'rgba(255,255,255,0.16)');shine2G.addColorStop(0.5,'rgba(255,255,255,0.05)');shine2G.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=shine2G;c.beginPath();c.ellipse(tx+swing0*w,crownBase-h*0.08,w*0.235,h*0.210,0,0,Math.PI*2);c.fill();

  // ظل أسفل التاج
  const shadowG=c.createRadialGradient(tx,crownBase+h*0.12,0,tx,crownBase+h*0.08,w*0.22);
  shadowG.addColorStop(0,'rgba(0,0,0,0.15)');shadowG.addColorStop(1,'rgba(0,0,0,0)');
  c.fillStyle=shadowG;c.beginPath();c.ellipse(tx,crownBase+h*0.10,w*0.18,h*0.05,0,0,Math.PI*2);c.fill();

  // ظل الشجرة على الأرض
  const treeShadowG=c.createRadialGradient(tx+w*0.08,baseY+h*0.03,0,tx+w*0.05,baseY+h*0.02,w*0.25);
  treeShadowG.addColorStop(0,'rgba(0,0,0,0.22)');treeShadowG.addColorStop(1,'rgba(0,0,0,0)');
  c.fillStyle=treeShadowG;c.beginPath();c.ellipse(tx+w*0.07,baseY+h*0.025,w*0.24,h*0.04,0,0,Math.PI*2);c.fill();
}

// ══════════════════════════════════════════════════════════════
// 🍃 دالة رسم ورقة نبات واقعية — النسخة المطوّرة
// ══════════════════════════════════════════════════════════════
function drawRealisticLeaf(c,cx,cy,w,h,t,scale){
  scale=scale||1;
  // حجم الورقة يعتمد على أصغر بُعد للحفاظ على نسب صحيحة
  const base=Math.min(w,h)*0.18*scale;
  const lw2=base*1.4, lh2=base*0.9;
  const swing=Math.sin(t*0.65)*0.045;
  c.save();c.translate(cx,cy);c.rotate(swing);

  // ── مسار الورقة ──
  function leafPath(){
    c.beginPath();
    c.moveTo(0,lh2*0.55);
    // جانب أيسر
    c.bezierCurveTo(-lw2*0.30, lh2*0.30, -lw2*0.72, -lh2*0.10, -lw2*0.20,-lh2*0.42);
    c.bezierCurveTo(-lw2*0.05,-lh2*0.60,  lw2*0.05, -lh2*0.60,  0,        -lh2*0.55);
    // جانب أيمن
    c.bezierCurveTo( lw2*0.05,-lh2*0.60,  lw2*0.72, -lh2*0.10,  lw2*0.30, lh2*0.30);
    c.bezierCurveTo( lw2*0.20, lh2*0.50,  lw2*0.05,  lh2*0.55,  0,        lh2*0.55);
    c.closePath();
  }

  // ظل تحت الورقة
  c.save();c.translate(3,4);c.globalAlpha=0.12;
  leafPath();c.fillStyle='#064e3b';c.fill();
  c.restore();

  // جسم الورقة بتدرج متعدد الاتجاهات
  const lgMain=c.createLinearGradient(-lw2*0.25,-lh2*0.55,lw2*0.25,lh2*0.55);
  lgMain.addColorStop(0,'#6ee7b7');
  lgMain.addColorStop(0.15,'#4ade80');
  lgMain.addColorStop(0.40,'#22c55e');
  lgMain.addColorStop(0.68,'#16a34a');
  lgMain.addColorStop(0.85,'#15803d');
  lgMain.addColorStop(1,'#166534');
  leafPath();c.fillStyle=lgMain;c.fill();

  // ظل جانبي دقيق
  const lgSide=c.createLinearGradient(-lw2*0.5,0,lw2*0.5,0);
  lgSide.addColorStop(0,'rgba(6,78,59,0.18)');lgSide.addColorStop(0.5,'rgba(0,0,0,0)');lgSide.addColorStop(1,'rgba(6,78,59,0.12)');
  leafPath();c.fillStyle=lgSide;c.fill();

  // ── نظام العروق الواقعي ──
  c.lineCap='round';c.lineJoin='round';

  // عرق رئيسي (midrib)
  const midRibG=c.createLinearGradient(0,-lh2*0.55,0,lh2*0.55);
  midRibG.addColorStop(0,'rgba(187,247,208,0.9)');midRibG.addColorStop(0.5,'rgba(134,239,172,0.7)');midRibG.addColorStop(1,'rgba(74,222,128,0.6)');
  c.strokeStyle=midRibG;c.lineWidth=base*0.065;
  c.beginPath();c.moveTo(0,-lh2*0.52);
  c.bezierCurveTo(base*0.03,-lh2*0.20,base*0.02,lh2*0.20,0,lh2*0.52);
  c.stroke();

  // عروق جانبية ثانوية (lateral veins)
  const lateralCount=6;
  for(let i=0;i<lateralCount;i++){
    const frac=(i+0.5)/lateralCount;
    const vy=-lh2*0.45+frac*lh2*0.90;
    // اتساع الورقة عند هذه النقطة
    const halfW2=lw2*0.55*Math.sqrt(1-Math.pow((vy/(lh2*0.55)),2)+0.05);
    const vAngle=-0.25-frac*0.10; // زاوية تميل للأعلى قليلاً
    const ex2R=halfW2*0.80, ey2R=vy+halfW2*Math.tan(vAngle)*0.5;
    const ex2L=-halfW2*0.80, ey2L=ey2R;
    c.strokeStyle=`rgba(187,247,208,${0.55-frac*0.12})`;c.lineWidth=base*0.030;
    // يمين
    c.beginPath();c.moveTo(base*0.025,vy);
    c.bezierCurveTo(halfW2*0.35,vy+halfW2*Math.tan(vAngle)*0.2,ex2R*0.80,ey2R*0.85,ex2R,ey2R);
    c.stroke();
    // يسار
    c.beginPath();c.moveTo(-base*0.025,vy);
    c.bezierCurveTo(-halfW2*0.35,vy+halfW2*Math.tan(vAngle)*0.2,ex2L*0.80,ey2L*0.85,ex2L,ey2L);
    c.stroke();
    // عروق ثالثية (tertiary) — خفيفة
    if(i>0&&i<lateralCount-1){
      c.strokeStyle=`rgba(187,247,208,0.20)`;c.lineWidth=base*0.015;
      const midX=ex2R*0.50, midY=ey2R+(Math.random()<0.5?-1:1)*halfW2*0.08;
      const subEx=ex2R*0.82;
      c.beginPath();c.moveTo(midX,midY);c.lineTo(subEx,ey2R*0.92);c.stroke();
      c.beginPath();c.moveTo(-midX,midY);c.lineTo(-subEx,ey2L*0.92);c.stroke();
    }
  }

  // ── بريق السطح (waxy cuticle) ──
  // بريق رئيسي
  const shineMain=c.createRadialGradient(-lw2*0.22,-lh2*0.30,0,-lw2*0.10,-lh2*0.18,lw2*0.42);
  shineMain.addColorStop(0,'rgba(255,255,255,0.28)');shineMain.addColorStop(0.5,'rgba(255,255,255,0.08)');shineMain.addColorStop(1,'rgba(255,255,255,0)');
  leafPath();c.fillStyle=shineMain;c.fill();

  // بريق صغير ثانوي (specular highlight)
  const shineSmall=c.createRadialGradient(-lw2*0.18,-lh2*0.22,0,-lw2*0.16,-lh2*0.20,lw2*0.10);
  shineSmall.addColorStop(0,'rgba(255,255,255,0.45)');shineSmall.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=shineSmall;c.beginPath();c.ellipse(-lw2*0.18,-lh2*0.22,lw2*0.06,lh2*0.04,-0.4,0,Math.PI*2);c.fill();

  // حافة الورقة (serrated edge hint)
  c.strokeStyle='rgba(22,101,52,0.30)';c.lineWidth=base*0.022;
  leafPath();c.stroke();

  // عُنق الورقة (petiole)
  const petG=c.createLinearGradient(-base*0.04,lh2*0.52,base*0.04,lh2*0.75);
  petG.addColorStop(0,'#16a34a');petG.addColorStop(1,'#166534');
  c.strokeStyle=petG;c.lineWidth=base*0.055;
  c.beginPath();c.moveTo(0,lh2*0.50);c.bezierCurveTo(base*0.02,lh2*0.60,-base*0.02,lh2*0.70,0,lh2*0.78);c.stroke();

  c.restore();
}

// ══ نشاط ٣ التبويب الأول: عملية النتح والثغور ══
function simG9Bio9N3a(){
  cancelAnimationFrame(animFrame);
  simState={t:0,stomata:'open',particles:[]};
  for(let i=0;i<16;i++) simState.particles.push({x:0.5+(Math.random()-0.5)*0.04,y:0.55+Math.random()*0.03,vx:(Math.random()-0.5)*0.003,vy:-0.004-Math.random()*0.003,life:Math.random()});
  const cv=document.getElementById('simCanvas');

  controls(`
    <div class="info-box" style="margin-bottom:8px;font-size:14px;line-height:1.7">
      <strong>🍃 النتح (Transpiration)</strong><br>
      فقدان بخار الماء من أوراق النبات عبر الثغور — يُسبِّب سحبًا يُحرِّك الماء من الجذور للأعلى
    </div>
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <button onclick="simState.stomata='open'" style="flex:1;background:#27AE60;color:#fff;border:none;padding:9px;border-radius:10px;font-family:Tajawal;font-size:14px;font-weight:700;cursor:pointer">🔓 افتح الثغر</button>
      <button onclick="simState.stomata='closed'" style="flex:1;background:#C0392B;color:#fff;border:none;padding:9px;border-radius:10px;font-family:Tajawal;font-size:14px;font-weight:700;cursor:pointer">🔒 أغلق الثغر</button>
    </div>
    <div id="bio9TransInfo" style="padding:10px;background:rgba(39,174,96,0.08);border-radius:8px;font-size:14px;color:#065F46;min-height:45px;line-height:1.6;text-align:center">
      الثغر مفتوح — يخرج بخار الماء 💨
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ (ص٥٤)</strong><br>
      ١- ما المقصود بالنتح؟<br>٢- ما المقصود بالثغر (Stoma)؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">١- النتح = فقدان بخار الماء من النبات عبر ثغور الأوراق.<br>٢- الثغر = فتحة دقيقة في البشرة السفلية للورقة تتحكم فيها خليتان حارستان.</div>
    </div>`);

  function draw(){
    if(currentSim!=='g9bio9n3'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.018;
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=dm15();

    // خلفية سماء
    const skyG=c.createLinearGradient(0,0,0,h);
    if(dark){skyG.addColorStop(0,'#0a1628');skyG.addColorStop(1,'#0d1a10');}
    else{skyG.addColorStop(0,'#e0f2fe');skyG.addColorStop(1,'#dcfce7');}
    c.fillStyle=skyG; c.fillRect(0,0,w,h);

    c.fillStyle=bioTxt(); c.font=`bold ${Math.round(h*0.038)}px Tajawal`; c.textAlign='center';
    c.fillText('النتح عبر الثغور', w/2, h*0.07);

    // ورقة واقعية كبيرة في المنتصف
    drawRealisticLeaf(c, w*0.50, h*0.40, w, h, simState.t, 1.4);

    // تكبير: مقطع الثغر في أسفل الورقة
    const ssx=w*0.50, ssy=h*0.62;
    const isOpen=simState.stomata==='open';

    // دائرة التكبير
    c.strokeStyle=dark?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.2)'; c.lineWidth=1.5;
    c.setLineDash([4,3]);
    c.beginPath(); c.arc(ssx,ssy,h*0.14,0,Math.PI*2); c.stroke();
    c.setLineDash([]);

    // خلفية البشرة
    const epidG=c.createLinearGradient(ssx-h*0.14,ssy,ssx+h*0.14,ssy);
    epidG.addColorStop(0,'rgba(34,197,94,0.3)'); epidG.addColorStop(1,'rgba(22,163,74,0.3)');
    c.fillStyle=epidG;
    c.beginPath(); c.arc(ssx,ssy,h*0.14,0,Math.PI*2); c.fill();

    // الخليتان الحارستتان (شكل حبة القمح)
    const gc=isOpen?'#14532d':'#15803d';
    const gy=c.createRadialGradient(ssx-30,ssy,2,ssx-28,ssy,22);
    gy.addColorStop(0,'#4ade80'); gy.addColorStop(1,gc);
    c.fillStyle=gy;
    // خلية يسار
    c.save(); c.translate(ssx-28,ssy); c.rotate(isOpen?0.5:0.15);
    c.beginPath(); c.ellipse(0,0,isOpen?10:14,isOpen?20:16,0,0,Math.PI*2); c.fill();
    c.strokeStyle='#065F46'; c.lineWidth=1.5; c.stroke();
    // نواة
    c.fillStyle='rgba(6,78,59,0.4)'; c.beginPath(); c.ellipse(0,3,4,5,0,0,Math.PI*2); c.fill();
    c.restore();
    // خلية يمين
    c.save(); c.translate(ssx+28,ssy); c.rotate(isOpen?-0.5:-0.15);
    const gy2=c.createRadialGradient(5,0,2,5,0,22);
    gy2.addColorStop(0,'#4ade80'); gy2.addColorStop(1,gc);
    c.fillStyle=gy2;
    c.beginPath(); c.ellipse(0,0,isOpen?10:14,isOpen?20:16,0,0,Math.PI*2); c.fill();
    c.strokeStyle='#065F46'; c.lineWidth=1.5; c.stroke();
    c.fillStyle='rgba(6,78,59,0.4)'; c.beginPath(); c.ellipse(0,3,4,5,0,0,Math.PI*2); c.fill();
    c.restore();

    // الفتحة بين الخليتين
    if(isOpen){
      const gapG=c.createRadialGradient(ssx,ssy,0,ssx,ssy,10);
      gapG.addColorStop(0,'rgba(147,197,253,0.5)'); gapG.addColorStop(1,'rgba(147,197,253,0.1)');
      c.fillStyle=gapG;
      c.beginPath(); c.ellipse(ssx,ssy,5,14,0,0,Math.PI*2); c.fill();
    } else {
      c.fillStyle='rgba(50,50,50,0.3)';
      c.beginPath(); c.ellipse(ssx,ssy,2,12,0,0,Math.PI*2); c.fill();
    }

    const info=document.getElementById('bio9TransInfo');
    if(info) info.innerHTML=isOpen?'🔓 الثغر مفتوح — بخار الماء يخرج 💨':'🔒 الثغر مغلق — النتح متوقف ✋';

    // جزيئات بخار
    if(isOpen){
      simState.particles.forEach(p=>{
        p.y-=0.008; p.x+=p.vx+(Math.random()-0.5)*0.001; p.life+=0.008;
        if(p.y<0.08||p.life>1){p.y=(ssy-h*0.05)/h; p.x=ssx/w+(Math.random()-0.5)*0.03; p.life=0; p.vx=(Math.random()-0.5)*0.003;}
        const alpha=Math.max(0,0.75*(1-p.life));
        const sz=3+p.life*3;
        c.fillStyle=`rgba(147,197,253,${alpha})`;
        c.beginPath(); c.arc(p.x*w,p.y*h,sz,0,Math.PI*2); c.fill();
      });
      c.font=`bold ${Math.round(h*0.02)}px Tajawal`; c.fillStyle='#1A8FA8'; c.textAlign='center';
      c.fillText('بخار ماء H₂O ↑',ssx,h*0.15);
    }

    // تسميات
    c.font=`bold ${Math.round(h*0.018)}px Tajawal`; c.fillStyle=bioTxt();
    c.textAlign='right'; c.fillText('خلية حارسة',ssx-44,ssy+h*0.04);
    c.textAlign='left'; c.fillText('خلية حارسة',ssx+44,ssy+h*0.04);
    c.textAlign='center'; c.fillStyle=dark?'rgba(255,255,255,0.4)':'rgba(0,0,0,0.25)';
    c.font=`${Math.round(h*0.016)}px Tajawal`;
    c.fillText('مقطع مكبَّر للثغر',ssx,ssy+h*0.16);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ نشاط ٣ التبويب الثاني: عوامل تؤثر على النتح ══
function simG9Bio9N3b(){
  cancelAnimationFrame(animFrame);
  simState={t:0,temp:25,humidity:50,wind:1};
  const cv=document.getElementById('simCanvas');

  controls(`
    <div class="info-box" style="margin-bottom:8px;font-size:14px;line-height:1.6">
      <strong>🌡️ عوامل مؤثرة على معدّل النتح</strong><br>حرِّك المتغيرات وراقب تأثيرها
    </div>
    <div style="margin-bottom:10px">
      <div style="font-size:14px;font-weight:700;color:#065F46;margin-bottom:4px">🌡️ درجة الحرارة: <span id="tmpVal">25</span>°م</div>
      <input type="range" min="10" max="40" value="25" oninput="document.getElementById('tmpVal').textContent=this.value;simState.temp=+this.value" style="width:100%">
      <div style="font-size:14px;font-weight:700;color:#065F46;margin:8px 0 4px">💧 الرطوبة: <span id="humVal">50</span>٪</div>
      <input type="range" min="10" max="90" value="50" oninput="document.getElementById('humVal').textContent=this.value;simState.humidity=+this.value" style="width:100%">
      <div style="font-size:14px;font-weight:700;color:#065F46;margin:8px 0 4px">💨 سرعة الرياح: <span id="windVal">1</span></div>
      <input type="range" min="0" max="5" value="1" step="0.5" oninput="document.getElementById('windVal').textContent=this.value;simState.wind=+this.value" style="width:100%">
    </div>
    <div id="bio9RateBox" style="padding:10px;background:rgba(39,174,96,0.1);border-radius:8px;font-size:14px;color:#065F46;text-align:center;font-weight:700">معدّل النتح: متوسط 🌿</div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ اشرح كيف تؤثر: أ. درجة الحرارة  ب. الرطوبة</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">أ. درجة الحرارة المرتفعة تزيد طاقة جزيئات الماء فيزيد النتح.<br>ب. الرطوبة العالية تقلل التدرج بين الورقة والهواء فيقل النتح.</div>
    </div>`);

  function draw(){
    if(currentSim!=='g9bio9n3'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.02;
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=dm15();
    c.fillStyle=bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle=bioTxt(); c.font=`bold ${Math.round(h*0.033)}px Tajawal`; c.textAlign='center';
    c.fillText('تأثير العوامل البيئية على النتح', w/2, h*0.07);

    const rate=Math.max(0.1,(simState.temp/40)*1.2-(simState.humidity/100)*0.8+(simState.wind/5)*0.6);

    // نبات واقعي
    drawRealisticTree(c,w,h,dark,simState.wind,simState.t);

    // جزيئات نتح فوق الشجرة
    const numMols=Math.round(rate*7);
    for(let i=0;i<numMols;i++){
      const phase=(simState.t*0.35+i*0.14)%1;
      const px=w*0.50+(Math.sin(i*2.1)*w*0.20)*phase;
      const py=h*0.20-phase*h*0.15;
      c.fillStyle=`rgba(147,197,253,${(1-phase)*0.75})`;
      c.beginPath(); c.arc(px,py,4,0,Math.PI*2); c.fill();
    }

    // شريط معدل النتح فوق الرسم
    const barX=w*0.10, barY=h*0.88, barW=w*0.80, barH=h*0.04;
    c.fillStyle=dark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.08)';
    c.beginPath(); c.roundRect(barX,barY,barW,barH,8); c.fill();
    const rateCol=rate>1.5?'#C0392B':rate>0.8?'#D4901A':'#27AE60';
    c.fillStyle=rateCol;
    c.beginPath(); c.roundRect(barX,barY,Math.min(rate/2,1)*barW,barH,8); c.fill();
    c.font=`bold ${Math.round(h*0.022)}px Tajawal`; c.textAlign='center'; c.fillStyle=bioTxt();
    c.fillText('معدّل النتح',w/2,barY-h*0.015);

    const rateBox=document.getElementById('bio9RateBox');
    if(rateBox){
      const lbl=rate>1.5?'🔴 مرتفع جدًا':rate>0.9?'🟡 متوسط-عالٍ':rate>0.5?'🟢 متوسط':'🔵 منخفض';
      rateBox.innerHTML=`معدّل النتح: <strong>${lbl}</strong>`;
      rateBox.style.background=rate>1.5?'rgba(192,57,43,0.1)':rate>0.9?'rgba(212,144,26,0.1)':'rgba(39,174,96,0.1)';
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ نشاط ٤ التبويب الأول: شرح جهاز البوتومتر ══
function simG9Bio9N4a(){
  cancelAnimationFrame(animFrame);
  simState={t:0,running:false,bubblePos:0.05};
  const cv=document.getElementById('simCanvas');

  controls(`
    <div class="info-box" style="margin-bottom:8px;font-size:14px;line-height:1.7">
      <strong>📏 جهاز البوتومتر (Potometer)</strong><br>
      يقيس معدّل امتصاص الماء كمقياس لمعدّل النتح — الفقاعة تتحرك بسرعة النتح
    </div>
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <button onclick="simState.running=true" style="flex:1;background:#27AE60;color:#fff;border:none;padding:9px;border-radius:10px;font-family:Tajawal;font-size:14px;font-weight:700;cursor:pointer">▶ شغِّل</button>
      <button onclick="simState.running=false;simState.bubblePos=0.05" style="flex:1;background:rgba(26,143,168,0.1);color:#065F46;border:1px solid rgba(26,143,168,0.3);padding:9px;border-radius:10px;font-family:Tajawal;font-size:14px;cursor:pointer">🔄 إعادة</button>
    </div>
    <div id="bio9PotInfo" style="padding:10px;background:rgba(26,143,168,0.08);border-radius:8px;font-size:14px;color:#065F46;min-height:45px;text-align:center;line-height:1.6">
      اضغط ▶ لبدء قياس معدّل النتح
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ (ص٥٦-٥٧)</strong><br>
      ما أهمية جهاز البوتومتر؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">يُمكِّن من مقارنة معدّل النتح في ظروف بيئية مختلفة بشكل كمّي — مثلاً: ضوء قوي مقابل ضوء ضعيف.</div>
    </div>`);

  function draw(){
    if(currentSim!=='g9bio9n4'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.016;
    if(simState.running) simState.bubblePos=Math.min(0.90,simState.bubblePos+0.003);
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=dm15();
    c.fillStyle=bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle=bioTxt(); c.font=`bold ${Math.round(h*0.034)}px Tajawal`; c.textAlign='center';
    c.fillText('جهاز البوتومتر التفاعلي', w/2, h*0.07);

    // أنبوبة شعرية
    const tubeX=w*0.10, tubeY=h*0.68, tubeW=w*0.65, tubeH=h*0.048;
    c.fillStyle=dark?'rgba(147,197,253,0.2)':'rgba(219,234,254,0.8)';
    c.beginPath(); c.roundRect(tubeX,tubeY,tubeW,tubeH,tubeH/2); c.fill();
    c.strokeStyle='#1D4ED8'; c.lineWidth=2;
    c.beginPath(); c.roundRect(tubeX,tubeY,tubeW,tubeH,tubeH/2); c.stroke();

    // مقياس
    for(let i=0;i<=10;i++){
      const mx=tubeX+i*(tubeW/10);
      c.strokeStyle='rgba(29,78,216,0.35)'; c.lineWidth=1;
      c.beginPath(); c.moveTo(mx,tubeY+tubeH); c.lineTo(mx,tubeY+tubeH+6); c.stroke();
      if(i%2===0){
        c.font=`${Math.round(h*0.018)}px Tajawal`; c.textAlign='center'; c.fillStyle='#1D4ED8';
        c.fillText(i,mx,tubeY+tubeH+h*0.028);
      }
    }
    c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center'; c.fillStyle=bioMut();
    c.fillText('(mm)',tubeX+tubeW/2,tubeY+tubeH+h*0.048);

    // فقاعة
    const bx=tubeX+simState.bubblePos*tubeW, by=tubeY+tubeH/2;
    c.fillStyle='rgba(255,255,255,0.92)'; c.strokeStyle='#1D4ED8'; c.lineWidth=2;
    c.beginPath(); c.arc(bx,by,tubeH*0.40,0,Math.PI*2); c.fill(); c.stroke();
    c.fillStyle='rgba(147,197,253,0.4)';
    c.beginPath(); c.arc(bx-tubeH*0.12,by-tubeH*0.12,tubeH*0.15,0,Math.PI*2); c.fill();

    // فرع النبات — ورقة واقعية
    const branchX=tubeX+tubeW*0.78, branchY=h*0.24;
    // ساق الفرع
    const bsG=c.createLinearGradient(branchX-4,tubeY,branchX+4,tubeY);
    bsG.addColorStop(0,'#4a2c0a'); bsG.addColorStop(0.5,'#8b5e2a'); bsG.addColorStop(1,'#4a2c0a');
    c.fillStyle=bsG;
    c.beginPath(); c.roundRect(branchX-4,branchY,8,tubeY-branchY,4); c.fill();
    // أوراق واقعية على الفرع
    [[branchX-w*0.07,branchY+h*0.06,0.7],[branchX+w*0.06,branchY+h*0.10,0.7],[branchX,branchY,0.75],[branchX-w*0.05,branchY+h*0.18,0.6],[branchX+w*0.04,branchY+h*0.24,0.6]].forEach(([lx,ly,sc])=>{
      drawRealisticLeaf(c,lx,ly,w,h,simState.t,sc);
    });

    // خزان الماء
    c.fillStyle=dark?'rgba(147,197,253,0.15)':'rgba(219,234,254,0.5)';
    c.strokeStyle='#1D4ED8'; c.lineWidth=1.5;
    c.beginPath(); c.roundRect(tubeX+tubeW+8,tubeY-h*0.08,w*0.10,h*0.18,6); c.fill(); c.stroke();
    c.font=`${Math.round(h*0.018)}px Tajawal`; c.textAlign='center'; c.fillStyle='#1D4ED8';
    c.fillText('خزان',tubeX+tubeW+8+w*0.05,tubeY+h*0.04);
    c.fillText('الماء',tubeX+tubeW+8+w*0.05,tubeY+h*0.07);

    // معلومة
    const potBox=document.getElementById('bio9PotInfo');
    const posMM=(simState.bubblePos*10).toFixed(1);
    if(potBox){
      if(simState.running&&simState.bubblePos<0.90) potBox.innerHTML=`📏 موضع الفقاعة: <strong>${posMM} mm</strong> — تتحرك بمعدّل النتح →`;
      else if(simState.bubblePos>=0.90) potBox.innerHTML='✅ اكتملت القراءة! قارن النتائج في ظروف مختلفة';
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ نشاط ٤ التبويب الثاني: قياس في ظروف مختلفة ══
function simG9Bio9N4b(){
  cancelAnimationFrame(animFrame);
  simState={t:0,cond:'normal',running:false,bubblePos:0.05,data:{}};
  const cv=document.getElementById('simCanvas');

  const conditions=[
    {id:'normal',label:'طبيعي 🌤️',rate:1.0,col:'#27AE60'},
    {id:'hot',   label:'حار ☀️',   rate:1.8,col:'#C0392B'},
    {id:'wind',  label:'رياح 💨',  rate:2.2,col:'#1A8FA8'},
    {id:'dark',  label:'ظلام 🌑',  rate:0.3,col:'#6B4E9A'},
  ];

  controls(`
    <div class="info-box" style="margin-bottom:8px;font-size:14px;line-height:1.6">
      <strong>📊 قِس معدّل النتح في ظروف مختلفة</strong>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">
      <button onclick="simState.cond='normal';simState.bubblePos=0.05;simState.running=false" style="background:rgba(39,174,96,0.12);color:#27AE60;border:1.5px solid rgba(39,174,96,0.35);padding:8px;border-radius:8px;font-family:Tajawal;font-size:13px;font-weight:700;cursor:pointer">طبيعي 🌤️</button>
      <button onclick="simState.cond='hot';simState.bubblePos=0.05;simState.running=false" style="background:rgba(192,57,43,0.1);color:#C0392B;border:1.5px solid rgba(192,57,43,0.35);padding:8px;border-radius:8px;font-family:Tajawal;font-size:13px;font-weight:700;cursor:pointer">حار ☀️</button>
      <button onclick="simState.cond='wind';simState.bubblePos=0.05;simState.running=false" style="background:rgba(26,143,168,0.1);color:#1A8FA8;border:1.5px solid rgba(26,143,168,0.35);padding:8px;border-radius:8px;font-family:Tajawal;font-size:13px;font-weight:700;cursor:pointer">رياح 💨</button>
      <button onclick="simState.cond='dark';simState.bubblePos=0.05;simState.running=false" style="background:rgba(107,78,154,0.1);color:#6B4E9A;border:1.5px solid rgba(107,78,154,0.35);padding:8px;border-radius:8px;font-family:Tajawal;font-size:13px;font-weight:700;cursor:pointer">ظلام 🌑</button>
    </div>
    <button onclick="simState.running=true" style="background:#27AE60;color:#fff;border:none;padding:9px;border-radius:10px;font-family:Tajawal;font-size:15px;font-weight:700;cursor:pointer;width:100%;margin-bottom:6px">▶ ابدأ القياس</button>
    <div id="bio9DataBox" style="padding:10px;background:rgba(39,174,96,0.08);border-radius:8px;font-size:14px;color:#065F46;min-height:50px;text-align:center;line-height:1.7">اختر ظرفًا وابدأ القياس</div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ أي الظروف يُعطي أعلى معدّل نتح؟ ولماذا؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">الرياح + الحرارة = أعلى معدّل. الرياح تُزيل بخار الماء من حول الورقة فيزيد التدرج، والحرارة تُسرِّع التبخر.</div>
    </div>`);

  function draw(){
    if(currentSim!=='g9bio9n4'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.016;
    const cond=conditions.find(x=>x.id===simState.cond)||conditions[0];
    if(simState.running) simState.bubblePos=Math.min(0.90,simState.bubblePos+cond.rate*0.003);
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=dm15();
    c.fillStyle=bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle=bioTxt(); c.font=`bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
    c.fillText('قياس معدّل النتح في ظروف مختلفة', w/2, h*0.07);

    // أنبوبة
    const tubeX=w*0.08, tubeY=h*0.58, tubeW=w*0.72, tubeH=h*0.05;
    c.fillStyle=dark?'rgba(147,197,253,0.15)':'rgba(219,234,254,0.7)';
    c.beginPath(); c.roundRect(tubeX,tubeY,tubeW,tubeH,tubeH/2); c.fill();
    c.strokeStyle=cond.col; c.lineWidth=2.5;
    c.beginPath(); c.roundRect(tubeX,tubeY,tubeW,tubeH,tubeH/2); c.stroke();
    for(let i=0;i<=10;i++){
      const mx=tubeX+i*(tubeW/10);
      c.strokeStyle='rgba(0,0,0,0.15)'; c.lineWidth=1;
      c.beginPath(); c.moveTo(mx,tubeY+tubeH); c.lineTo(mx,tubeY+tubeH+5); c.stroke();
      if(i%2===0){c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center'; c.fillStyle=bioMut(); c.fillText(i,mx,tubeY+tubeH+h*0.024);}
    }
    // فقاعة
    const bx=tubeX+simState.bubblePos*tubeW;
    c.fillStyle='white'; c.strokeStyle=cond.col; c.lineWidth=2;
    c.beginPath(); c.arc(bx,tubeY+tubeH/2,tubeH*0.42,0,Math.PI*2); c.fill(); c.stroke();

    // فرع نبات صغير واقعي يمين الأنبوبة
    const bX2=tubeX+tubeW*0.82, bY2=tubeY;
    const bsG2=c.createLinearGradient(bX2-3,bY2,bX2+3,bY2);
    bsG2.addColorStop(0,'#4a2c0a'); bsG2.addColorStop(0.5,'#8b5e2a'); bsG2.addColorStop(1,'#4a2c0a');
    c.fillStyle=bsG2; c.beginPath(); c.roundRect(bX2-3,h*0.18,6,bY2-h*0.18,3); c.fill();
    [[bX2-w*0.06,h*0.22,0.6],[bX2+w*0.05,h*0.28,0.6],[bX2,h*0.18,0.65]].forEach(([lx,ly,sc])=>{
      drawRealisticLeaf(c,lx,ly,w,h,simState.t,sc);
    });

    // الظرف الحالي
    c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center'; c.fillStyle=cond.col;
    c.fillText(`الظرف: ${cond.label}`,w/2,h*0.48);

    // بيانات
    const posMM=(simState.bubblePos*10).toFixed(1);
    const dataBox=document.getElementById('bio9DataBox');
    if(dataBox&&simState.running){
      if(simState.bubblePos>=0.90){
        simState.data[simState.cond]=simState.data[simState.cond]||posMM;
        dataBox.innerHTML=`✅ <strong>${cond.label}</strong>: <strong>${simState.data[simState.cond]} mm</strong><br>جرّب ظرفًا آخر!`;
      } else {
        dataBox.innerHTML=`🔬 موضع الفقاعة: <strong>${posMM} mm</strong>`;
      }
    }

    // مخطط النتائج المسجّلة
    const recorded=conditions.filter(x=>simState.data[x.id]);
    if(recorded.length>0){
      const bsX=w*0.08, bsY=h*0.88, bH=h*0.07;
      recorded.forEach((cd,i)=>{
        const bx2=bsX+i*(w*0.70/4);
        const bh=Math.min(parseFloat(simState.data[cd.id])/10,1)*bH;
        c.fillStyle=cd.col+'88';
        c.beginPath(); c.roundRect(bx2,bsY-bh,w*0.14,bh,3); c.fill();
        c.font=`${Math.round(h*0.016)}px Tajawal`; c.textAlign='center'; c.fillStyle=cd.col;
        c.fillText(cd.label.split(' ')[0],bx2+w*0.07,bsY+h*0.018);
      });
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══ نشاط ٥ التبويب الأول: المصدر والمصبّ ══
function simG9Bio9N5a(){
  cancelAnimationFrame(animFrame);
  simState={t:0,sel:null};
  const cv=document.getElementById('simCanvas');

  const nodes=[
    {id:'leaf',  x:0.50,y:0.18,label:'الأوراق (مصدر)',   col:'#27AE60',icon:'🍃',desc:'المصدر: تُنتج السكروز بالتمثيل الضوئي وتُرسله عبر اللحاء'},
    {id:'root',  x:0.25,y:0.78,label:'الجذور (مصبّ)',    col:'#92400E',icon:'🌱',desc:'المصبّ: تستهلك السكروز للنمو والتنفس والتخزين كنشا'},
    {id:'fruit', x:0.75,y:0.70,label:'الثمار (مصبّ)',    col:'#C0392B',icon:'🍎',desc:'المصبّ: تحتاج كميات كبيرة من السكروز لبناء الخلايا الجديدة'},
    {id:'shoot', x:0.50,y:0.48,label:'البراعم (مصبّ)',   col:'#D4901A',icon:'🌿',desc:'المصبّ: أماكن النمو النشط تحتاج الغذاء باستمرار'},
  ];

  controls(`
    <div class="info-box" style="margin-bottom:8px;font-size:14px;line-height:1.7">
      <strong>🌿 الانتقال (Translocation)</strong><br>
      المصدر = أعضاء تُنتج السكروز (الأوراق)<br>
      المصبّ = أعضاء تستهلكه (الجذور، الثمار، البراعم)
    </div>
    <div id="bio9TranslInfo" style="padding:12px;background:rgba(39,174,96,0.08);border-radius:10px;min-height:70px;font-size:14px;color:#065F46;line-height:1.7;text-align:center">
      👆 انقر على أي عضو لمعرفة دوره
    </div>
    <div class="q-box" style="margin-top:10px">
      <strong>❓ (ص٥٨)</strong><br>
      ١- ما المقصود بـ "الانتقال" (Translocation)؟<br>
      ٢- أعطِ مثالين على المصدر والمصبّ في نبات الفول
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">١- الانتقال = حركة السكروز والأحماض الأمينية في اللحاء من المصدر إلى المصبّ.<br>٢- المصدر: الأوراق الناضجة. المصبّ: الجذور (لتخزين النشا) والبذور (للنمو).</div>
    </div>`);

  function draw(){
    if(currentSim!=='g9bio9n5'||currentTab!==0){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.018;
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=dm15();
    // شجرة واقعية في الخلفية
    drawRealisticTree(c,w,h,dark,0,simState.t);

    c.fillStyle=bioTxt(); c.font=`bold ${Math.round(h*0.034)}px Tajawal`; c.textAlign='center';
    c.fillText('المصدر والمصبّ في النبات', w/2, h*0.065);

    // خطوط متحركة بين العقد
    [[nodes[0],nodes[1],'#27AE60'],[nodes[0],nodes[2],'#C0392B'],[nodes[0],nodes[3],'#D4901A']].forEach(([src,dst,col])=>{
      c.strokeStyle=col+'30'; c.lineWidth=1.5; c.setLineDash([4,4]);
      c.beginPath(); c.moveTo(src.x*w,src.y*h); c.lineTo(dst.x*w,dst.y*h); c.stroke();
      c.setLineDash([]);
      const prog=(simState.t*0.28)%1;
      const px=src.x*w+(dst.x-src.x)*w*prog, py=src.y*h+(dst.y-src.y)*h*prog;
      c.fillStyle=col+'AA'; c.beginPath(); c.arc(px,py,5,0,Math.PI*2); c.fill();
    });

    // عقد
    nodes.forEach((n,i)=>{
      const nx=n.x*w, ny=n.y*h, pr=Math.min(0.07*Math.min(w,h),46);
      const isSel=simState.sel===n.id, bob=Math.sin(simState.t+i*1.3)*3;
      c.fillStyle=isSel?n.col:n.col+'BB';
      if(isSel){c.shadowBlur=18;c.shadowColor=n.col;}
      c.beginPath(); c.arc(nx,ny+bob,pr,0,Math.PI*2); c.fill();
      c.shadowBlur=0;
      c.font=`${Math.round(pr*0.65)}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(n.icon,nx,ny+bob);
      c.font=`bold ${Math.round(h*0.019)}px Tajawal`; c.textBaseline='top';
      c.fillStyle=isSel?n.col:bioTxt(); c.fillText(n.label,nx,ny+bob+pr+4);
    });
    animFrame=requestAnimationFrame(draw);
  }
  cv.onclick=function(e){
    const r=cv.getBoundingClientRect();
    const _et=e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e;
    const mx=(_et.clientX-r.left)*cv.width/r.width, my=(_et.clientY-r.top)*cv.height/r.height;
    nodes.forEach(n=>{
      const pr=Math.min(0.07*Math.min(cv.width,cv.height),46);
      if(Math.hypot(mx-n.x*cv.width,my-n.y*cv.height)<pr+18){
        simState.sel=n.id;
        try{U9Sound.ping();}catch(e){}
        const box=document.getElementById('bio9TranslInfo');
        if(box) box.innerHTML=`<strong style="font-size:15px">${n.icon} ${n.label}</strong><br><span style="color:#064E3B">${n.desc}</span>`;
      }
    });
  };
  draw();
}

// ══ نشاط ٥ التبويب الثاني: مقطع عرضي للساق — الخشب واللحاء ══
function simG9Bio9N5b(){
  cancelAnimationFrame(animFrame);
  simState={t:0,particles:[]};
  for(let i=0;i<10;i++) simState.particles.push({prog:Math.random(),lane:i%2,speed:0.002+Math.random()*0.001});
  const cv=document.getElementById('simCanvas');

  controls(`
    <div class="info-box" style="margin-bottom:8px;font-size:14px;line-height:1.7">
      <strong>🔄 مقارنة: الخشب واللحاء</strong><br>
      • <span style="color:#B45309">الخشب</span>: ماء + أملاح ← جذور → أوراق (اتجاه واحد)<br>
      • <span style="color:#7C3AED">اللحاء</span>: سكروز ← أوراق → باقي أجزاء النبات (اتجاهان)
    </div>
    <div style="margin-top:8px;padding:10px;background:rgba(39,174,96,0.08);border-radius:8px;font-size:13px;color:#065F46;line-height:1.8">
      <strong>📖 ملخّص الوحدة التاسعة:</strong><br>
      • الخشب: ماء + أملاح معدنية ← جذور → أوراق<br>
      • اللحاء: سكروز + أحماض أمينية ← أوراق → باقي النبات<br>
      • النتح: يسحب الماء للأعلى (Transpiration pull)<br>
      • البوتومتر: يقيس معدّل النتح بقياس الفقاعة
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ملخّص (ص٥٨)</strong><br>
      ما الفرق في اتجاه النقل بين الخشب واللحاء؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">الخشب: اتجاه واحد فقط (من الجذور للأعلى). اللحاء: اتجاهان (من المصدر لأقرب مصبّ سواء أعلى أو أسفل).</div>
    </div>`);

  function draw(){
    if(currentSim!=='g9bio9n5'||currentTab!==1){cancelAnimationFrame(animFrame);return;}
    simState.t+=0.016;
    const c=cv.getContext('2d'), w=cv.width, h=cv.height, dark=dm15();
    c.fillStyle=bioBg(); c.fillRect(0,0,w,h);
    c.fillStyle=bioTxt(); c.font=`bold ${Math.round(h*0.034)}px Tajawal`; c.textAlign='center';
    c.fillText('مقطع عرضي للساق — الحزم الوعائية', w/2, h*0.07);

    const cx4=w*0.52, cy4=h*0.50, R=h*0.30;
    const numBundles=6;

    // بشرة
    c.fillStyle=dark?'rgba(39,174,96,0.12)':'rgba(209,250,229,0.5)';
    c.strokeStyle='#27AE60'; c.lineWidth=2.5;
    c.beginPath(); c.arc(cx4,cy4,R,0,Math.PI*2); c.fill(); c.stroke();

    // قشرة
    c.fillStyle=dark?'rgba(39,174,96,0.07)':'rgba(209,250,229,0.3)';
    c.beginPath(); c.arc(cx4,cy4,R*0.78,0,Math.PI*2); c.fill();

    // حزم وعائية
    for(let i=0;i<numBundles;i++){
      const angle=(i/numBundles)*Math.PI*2-Math.PI/2;
      const bx=cx4+R*0.58*Math.cos(angle), by=cy4+R*0.58*Math.sin(angle);
      const br=R*0.115;
      // لحاء (نصف خارجي)
      c.fillStyle='rgba(124,58,237,0.65)';
      c.beginPath(); c.arc(bx,by,br,angle-Math.PI/2,angle+Math.PI/2); c.lineTo(bx,by); c.closePath(); c.fill();
      // خشب (نصف داخلي)
      c.fillStyle='rgba(180,120,60,0.75)';
      c.beginPath(); c.arc(bx,by,br,angle+Math.PI/2,angle+Math.PI*1.5); c.lineTo(bx,by); c.closePath(); c.fill();
      c.strokeStyle=dark?'rgba(255,255,255,0.15)':'rgba(0,0,0,0.15)'; c.lineWidth=1;
      c.beginPath(); c.arc(bx,by,br,0,Math.PI*2); c.stroke();
    }

    // جزيئات متحركة
    simState.particles.forEach(p=>{
      p.prog=(p.prog+p.speed)%1;
      const bundleIdx=Math.floor(p.prog*numBundles)%numBundles;
      const angle=(bundleIdx/numBundles)*Math.PI*2-Math.PI/2;
      const bx=cx4+R*0.58*Math.cos(angle), by=cy4+R*0.58*Math.sin(angle);
      const br=R*0.115;
      const subA=angle+(p.lane===0?Math.PI*0.3:-Math.PI*0.3);
      const px2=bx+br*0.55*Math.cos(subA), py2=by+br*0.55*Math.sin(subA);
      c.fillStyle=p.lane===0?'rgba(167,139,250,0.9)':'rgba(147,197,253,0.9)';
      c.beginPath(); c.arc(px2,py2,3,0,Math.PI*2); c.fill();
    });

    // مفتاح
    const keyY=h*0.84;
    [[w*0.30,'#7C3AED','اللحاء — سكروز'],[w*0.70,'#B45309','الخشب — ماء']].forEach(([kx,col,lbl])=>{
      c.fillStyle=col+'CC'; c.beginPath(); c.arc(kx-35,keyY,8,0,Math.PI*2); c.fill();
      c.font=`bold ${Math.round(h*0.020)}px Tajawal`; c.textAlign='right'; c.fillStyle=col;
      c.fillText(lbl,kx,keyY+5);
    });

    // تسميات الطبقات
    c.font=`${Math.round(h*0.018)}px Tajawal`; c.textAlign='center';
    c.fillStyle='#27AE60'; c.fillText('البشرة',cx4,cy4-R-h*0.018);
    c.fillStyle='#27AE60'; c.fillText('القشرة',cx4+R*0.58,cy4);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}


// ══════════════════════════════════════════════════════════
// 🌿 أحياء الصف التاسع — الوحدة العاشرة: التحكم والتنظيم في النبات
// ══════════════════════════════════════════════════════════

// ─── نشاط ١٠-١: استجابة السيقان للضوء (Phototropism) — التبويب أ ───
// ══════════════════════════════════════════════════
// الوحدة ١٠ — التحكم والتنظيم في النبات
// ══════════════════════════════════════════════════

// ─── مساعد: رسم أصيص ───
function _drawPot10(c,cx,potY,w,h,dark){
  const pw=w*0.13, ph=h*0.18;
  c.fillStyle=dark?'#6D4C41':'#8B6914';
  c.beginPath(); c.roundRect(cx-pw/2,potY,pw,ph,6); c.fill();
  c.fillStyle=dark?'#7D5A2A':'#A07820';
  c.fillRect(cx-pw/2-6,potY-8,pw+12,10);
  c.fillStyle=dark?'#4A2F00':'#5D4037';
  c.fillRect(cx-pw/2+3,potY+4,pw-6,ph*0.38);
  // seed
  c.fillStyle='#D4A017';
  c.beginPath(); c.ellipse(cx,potY+8,8,4,0,0,Math.PI*2); c.fill();
  return {pw,ph};
}

// ─── مساعد: رسم نبتة واقعية بانحناء ───
function _drawPlant10(c,cx,potY,w,h,dark,bendX,growthFrac,showLeaves){
  if(growthFrac<=0) return;
  c.save();

  const stemH = h*0.30 * growthFrac;
  const tipX = cx + bendX*growthFrac;
  const tipY = potY - stemH;
  const ctrl1X=cx+bendX*0.18, ctrl1Y=potY-stemH*0.38;
  const ctrl2X=cx+bendX*0.62, ctrl2Y=potY-stemH*0.72;

  // ── Shadow of stem on ground ──
  c.save();
  c.globalAlpha=0.08;
  c.strokeStyle='#000';
  c.lineWidth=10;
  c.lineCap='round';
  c.beginPath();
  c.moveTo(cx+2,potY+2);
  c.bezierCurveTo(ctrl1X+2,ctrl1Y+2,ctrl2X+2,ctrl2Y+2,tipX+2,tipY+2);
  c.stroke();
  c.restore();

  // ── Stem base (thick, slightly lighter = bark-like texture) ──
  // Outer darker edge
  c.strokeStyle=dark?'#1B5E20':'#1a4a0f';
  c.lineWidth=9; c.lineCap='round';
  c.beginPath();
  c.moveTo(cx,potY);
  c.bezierCurveTo(ctrl1X,ctrl1Y,ctrl2X,ctrl2Y,tipX,tipY);
  c.stroke();

  // Main stem body
  c.strokeStyle=dark?'#388E3C':'#2E7D32';
  c.lineWidth=7; c.lineCap='round';
  c.beginPath();
  c.moveTo(cx,potY);
  c.bezierCurveTo(ctrl1X,ctrl1Y,ctrl2X,ctrl2Y,tipX,tipY);
  c.stroke();

  // Lit highlight (left side of stem — simulating light from upper right)
  const hlGrad=c.createLinearGradient(cx-6,potY,cx+6,potY);
  hlGrad.addColorStop(0,'rgba(255,255,200,0)');
  hlGrad.addColorStop(0.4,'rgba(144,238,100,0.55)');
  hlGrad.addColorStop(1,'rgba(255,255,255,0)');
  c.strokeStyle=hlGrad;
  c.lineWidth=3; c.lineCap='round';
  c.beginPath();
  c.moveTo(cx-1.5,potY);
  c.bezierCurveTo(ctrl1X-1.5,ctrl1Y,ctrl2X-1.5,ctrl2Y,tipX-1.5,tipY);
  c.stroke();

  if(showLeaves){
    // Helper: draw a realistic single leaf with veins and light interaction
    function _leaf(lx,ly,rx,ry,rot,lightSide,colorBase,colorDark){
      c.save();
      c.translate(lx,ly);
      c.rotate(rot);

      // ── Leaf shape using quadratic curves (asymmetric for realism) ──
      const lw=rx, lh=ry;
      c.beginPath();
      c.moveTo(0,0);
      // Upper edge
      c.quadraticCurveTo(-lw*0.25,-lh*1.1, -lw*0.52,-lh*0.12);
      // Tip
      c.quadraticCurveTo(-lw*0.62,lh*0.18, 0,lh*0.12);
      // Lower right
      c.quadraticCurveTo(lw*0.32,lh*0.18, lw*0.46,-lh*0.12);
      // Back to base
      c.quadraticCurveTo(lw*0.22,-lh*1.0, 0,0);
      c.closePath();

      // Fill with gradient simulating light
      const leafGrad=c.createLinearGradient(-lw*0.3,-lh*0.8, lw*0.3,lh*0.2);
      leafGrad.addColorStop(0,lightSide?'#A5D6A7':colorBase);
      leafGrad.addColorStop(0.35,colorBase);
      leafGrad.addColorStop(0.75,colorDark);
      leafGrad.addColorStop(1,dark?'#1B5E20':'#1a4a0f');
      c.fillStyle=leafGrad;
      c.fill();

      // Leaf edge stroke (slightly darker)
      c.strokeStyle=dark?'#1B5E20':'#1B5E20';
      c.lineWidth=0.8;
      c.stroke();

      // ── Midrib vein ──
      c.beginPath();
      c.moveTo(0,0);
      c.quadraticCurveTo(-lw*0.08,-lh*0.5,-lw*0.48,-lh*0.08);
      c.strokeStyle=dark?'rgba(27,94,32,0.7)':'rgba(20,70,15,0.5)';
      c.lineWidth=0.9;
      c.stroke();

      // ── Secondary veins (3 pairs) ──
      c.strokeStyle=dark?'rgba(56,142,60,0.35)':'rgba(30,100,20,0.28)';
      c.lineWidth=0.55;
      [[-0.18,-0.22],[-0.28,-0.48],[-0.38,-0.72]].forEach(([vx,vy])=>{
        const baseX=vx*(lw), baseY=vy*(lh);
        // left vein
        c.beginPath(); c.moveTo(baseX,baseY);
        c.quadraticCurveTo(baseX-lw*0.2,baseY+lh*0.12,baseX-lw*0.38,baseY+lh*0.06);
        c.stroke();
        // right vein
        c.beginPath(); c.moveTo(baseX,baseY);
        c.quadraticCurveTo(baseX+lw*0.12,baseY+lh*0.12,baseX+lw*0.22,baseY+lh*0.04);
        c.stroke();
      });

      c.restore();
    }

    // ── Compute positions along the bezier for leaf attachment ──
    function bezierPt(t){
      const mt=1-t;
      return {
        x: mt*mt*mt*cx + 3*mt*mt*t*ctrl1X + 3*mt*t*t*ctrl2X + t*t*t*tipX,
        y: mt*mt*mt*potY + 3*mt*mt*t*ctrl1Y + 3*mt*t*t*ctrl2Y + t*t*t*tipY
      };
    }

    // Leaf 1 — lower left, large, in shadow
    const p1=bezierPt(0.35);
    _leaf(p1.x, p1.y, h*0.085, h*0.065, -0.35, false,
      dark?'#2E7D32':'#388E3C', dark?'#1B5E20':'#1a4a12');

    // Leaf 2 — lower right, large, lit side
    const p2=bezierPt(0.38);
    _leaf(p2.x, p2.y, h*0.08, h*0.062, 0.95, true,
      dark?'#43A047':'#4CAF50', dark?'#2E7D32':'#388E3C');

    // Leaf 3 — mid left, medium
    const p3=bezierPt(0.62);
    _leaf(p3.x, p3.y, h*0.07, h*0.055, -0.45, false,
      dark?'#388E3C':'#43A047', dark?'#1B5E20':'#2E7D32');

    // Leaf 4 — mid right, lit
    const p4=bezierPt(0.64);
    _leaf(p4.x, p4.y, h*0.065, h*0.052, 1.05, true,
      dark?'#4CAF50':'#66BB6A', dark?'#388E3C':'#43A047');

    // ── Apical bud (growing tip) ──
    // Bud outer layer (sepals / closed bud)
    c.save();
    c.translate(tipX, tipY);

    // Small young leaf on left of tip
    c.fillStyle=dark?'#388E3C':'#43A047';
    c.beginPath();
    c.moveTo(0,0);
    c.quadraticCurveTo(-h*0.035,-h*0.04,-h*0.055,-h*0.015);
    c.quadraticCurveTo(-h*0.035,h*0.005,0,0);
    c.fill();

    // Small young leaf on right of tip
    c.fillStyle=dark?'#4CAF50':'#66BB6A';
    c.beginPath();
    c.moveTo(0,0);
    c.quadraticCurveTo(h*0.028,-h*0.035, h*0.048,-h*0.01);
    c.quadraticCurveTo(h*0.025,h*0.006,0,0);
    c.fill();

    // Meristem dome (actual tip)
    const budGrad=c.createRadialGradient(-h*0.005,-h*0.018,0, 0,0,h*0.022);
    budGrad.addColorStop(0,'#A5D6A7');
    budGrad.addColorStop(0.5,dark?'#4CAF50':'#2E7D32');
    budGrad.addColorStop(1,dark?'#1B5E20':'#1B5E20');
    c.fillStyle=budGrad;
    c.beginPath(); c.ellipse(0,-h*0.022,h*0.015,h*0.022,0,0,Math.PI*2); c.fill();

    c.restore();
  }
  c.restore();
}

// ─── مساعد: شمس واقعية ───
function _drawSun10(c,x,y,r,dir,h){
  c.save();

  // ── Outer atmospheric halo (very soft, wide) ──
  const halo=c.createRadialGradient(x,y,r*0.5,x,y,r*4.5);
  halo.addColorStop(0,'rgba(255,230,120,0.22)');
  halo.addColorStop(0.4,'rgba(255,210,80,0.08)');
  halo.addColorStop(1,'rgba(255,200,60,0)');
  c.fillStyle=halo;
  c.beginPath(); c.arc(x,y,r*4.5,0,Math.PI*2); c.fill();

  // ── Mid corona glow ──
  const corona=c.createRadialGradient(x,y,r*0.6,x,y,r*2.2);
  corona.addColorStop(0,'rgba(255,240,160,0.45)');
  corona.addColorStop(0.5,'rgba(255,220,80,0.15)');
  corona.addColorStop(1,'rgba(255,200,60,0)');
  c.fillStyle=corona;
  c.beginPath(); c.arc(x,y,r*2.2,0,Math.PI*2); c.fill();

  // ── Sun disc with realistic radial gradient ──
  const disc=c.createRadialGradient(x-r*0.22,y-r*0.22,r*0.05, x,y,r*1.05);
  disc.addColorStop(0,'#FFFDE7');   // bright white-yellow centre
  disc.addColorStop(0.25,'#FFF176');
  disc.addColorStop(0.55,'#FFD740');
  disc.addColorStop(0.82,'#FFAB00');
  disc.addColorStop(1,'#FF8F00');   // darker warm limb
  c.fillStyle=disc;
  c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill();

  // ── Subtle limb darkening ring ──
  const limb=c.createRadialGradient(x,y,r*0.6,x,y,r);
  limb.addColorStop(0,'rgba(0,0,0,0)');
  limb.addColorStop(1,'rgba(180,60,0,0.18)');
  c.fillStyle=limb;
  c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill();

  // ── Soft ray streaks (natural, non-cartoon) ──
  c.globalAlpha=0.22;
  c.strokeStyle='#FFD54F';
  c.lineWidth=Math.max(1,r*0.18);
  c.lineCap='round';
  const rayAngles=[-0.42,0,0.42,0.85,1.28,1.71,2.14,2.57,3.0,3.43,3.86,4.29,4.72,5.15,5.58];
  rayAngles.forEach(a=>{
    const inner=r*1.18, outer=r*(1.55+Math.random()*0.25);
    c.beginPath();
    c.moveTo(x+Math.cos(a)*inner, y+Math.sin(a)*inner);
    c.lineTo(x+Math.cos(a)*outer, y+Math.sin(a)*outer);
    c.stroke();
  });
  c.globalAlpha=1;

  // ── Directional light beam rays showing light direction ──
  // These are semi-transparent gradient beams
  const beamCount=3;
  const beamSpread=r*0.55;
  let bx=0,by=0; // beam direction unit vector
  if(dir==='left'){  bx=-1; by=0; }
  else if(dir==='right'){ bx=1; by=0; }
  else { bx=0; by=1; }

  for(let i=-1;i<=1;i++){
    const perpX= -by, perpY= bx; // perpendicular
    const startX=x+bx*r*1.1 + perpX*i*beamSpread;
    const startY=y+by*r*1.1 + perpY*i*beamSpread;
    const endX=startX+bx*r*2.8;
    const endY=startY+by*r*2.8;
    const beamGrad=c.createLinearGradient(startX,startY,endX,endY);
    beamGrad.addColorStop(0,'rgba(255,230,100,0.35)');
    beamGrad.addColorStop(0.6,'rgba(255,220,80,0.10)');
    beamGrad.addColorStop(1,'rgba(255,210,60,0)');
    c.strokeStyle=beamGrad;
    c.lineWidth=Math.max(2,r*0.32);
    c.lineCap='round';
    c.beginPath();
    c.moveTo(startX,startY);
    c.lineTo(endX,endY);
    c.stroke();
  }

  c.restore();
}

// ─── مساعد: لوحة تحكم نظيفة ───
function _ctrlPanel(html){
  const cp=document.getElementById('simControlsPanel');
  if(cp) cp.innerHTML=html;
}

function _ctrlBtn(label,onclick,active,color){
  color=color||'#27AE60';
  const bg=active?color:'white';
  const col=active?'white':(document.documentElement.classList.contains('dark-mode')?'#ddd':'#444');
  const brd=active?color:'#ddd';
  return `<button onclick="${onclick}" style="padding:9px 14px;border-radius:9px;border:2px solid ${brd};background:${bg};color:${col};font-family:Tajawal,sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.15s;">${label}</button>`;
}

// ══════════════════════════════════════════════════
// نشاط ١٠-١أ — الأطباق الثلاثة (الانتحاء الضوئي)
// ══════════════════════════════════════════════════
function simG9Bio10N1a(){
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const w=cv.width,h=cv.height;
  const dark=document.documentElement.classList.contains('dark-mode');
  cancelAnimationFrame(window._animF);
  let step=0;

  const infos=[
    '🌱 <strong>الإعداد:</strong> ضع كمية متساوية من بذور الفاصولياء في الثلاثة أطباق. غطِّ كل طبق بقطن مبلّل.',
    '📅 <strong>اليوم الأول:</strong> بدأت البادرات بالإنبات. الأطباق في مكانها — الطبق (أ) في صندوق بنافذة جانبية.',
    '✅ <strong>اليوم السابع:</strong> الطبق (أ) انحنى نحو الضوء (الانتحاء الضوئي الموجب). الطبق (ب) نما مستقيماً لأن الضوء جاء من كل الجهات. الطبق (ج) نما مستقيماً بدون انحناء.'
  ];

  _ctrlPanel(`
    <div style="padding:20px 16px;font-family:Tajawal,sans-serif;direction:rtl;">
      <div style="font-size:15px;font-weight:800;color:${dark?'#fff':'#2C3A4A'};margin-bottom:14px;border-bottom:2px solid ${dark?'rgba(255,255,255,0.1)':'#eee'};padding-bottom:10px;">⚙️ خطوات الاستقصاء</div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
        <button onclick="window._b10n1s(0)" id="btn10n1s0" style="padding:10px 14px;border-radius:9px;border:2px solid #27AE60;background:#27AE60;color:white;font-family:Tajawal,sans-serif;font-size:13px;font-weight:700;cursor:pointer;text-align:right;">🌱 الإعداد</button>
        <button onclick="window._b10n1s(1)" id="btn10n1s1" style="padding:10px 14px;border-radius:9px;border:2px solid #ddd;background:${dark?'rgba(255,255,255,0.05)':'white'};color:${dark?'#ccc':'#555'};font-family:Tajawal,sans-serif;font-size:13px;font-weight:700;cursor:pointer;text-align:right;">📅 اليوم الأول</button>
        <button onclick="window._b10n1s(2)" id="btn10n1s2" style="padding:10px 14px;border-radius:9px;border:2px solid #ddd;background:${dark?'rgba(255,255,255,0.05)':'white'};color:${dark?'#ccc':'#555'};font-family:Tajawal,sans-serif;font-size:13px;font-weight:700;cursor:pointer;text-align:right;">🌿 اليوم السابع</button>
      </div>
      <div id="bio10n1info" style="font-size:13px;color:${dark?'#bbb':'#546E7A'};line-height:1.9;background:${dark?'rgba(39,174,96,0.08)':'#F0FBF4'};border-radius:10px;padding:13px;border:1px solid ${dark?'rgba(39,174,96,0.2)':'rgba(39,174,96,0.15)'};">
        🌱 <strong>الإعداد:</strong> ضع كمية متساوية من بذور الفاصولياء في الثلاثة أطباق. غطِّ كل طبق بقطن مبلّل.
      </div>
      <div style="margin-top:16px;padding:10px;background:${dark?'rgba(26,143,168,0.1)':'rgba(26,143,168,0.06)'};border-radius:8px;border:1px solid ${dark?'rgba(26,143,168,0.2)':'rgba(26,143,168,0.15)'};">
        <div style="font-size:12px;font-weight:700;color:${dark?'#4DD0E1':'#0E6B80'};margin-bottom:4px;">🔑 المفهوم</div>
        <div style="font-size:12px;color:${dark?'#90CAD4':'#1A7A92'};line-height:1.7;">الانتحاء الضوئي هو استجابة نمو السيقان باتجاه مصدر الضوء بسبب توزيع الأوكسين</div>
      </div>
    </div>`);

  window._b10n1s=function(s){
    step=s;
    document.querySelectorAll('[id^="btn10n1s"]').forEach((b,i)=>{
      b.style.background=i===s?'#27AE60':(dark?'rgba(255,255,255,0.05)':'white');
      b.style.borderColor=i===s?'#27AE60':'#ddd';
      b.style.color=i===s?'white':(dark?'#ccc':'#555');
    });
    const infoEl=document.getElementById('bio10n1info');
    if(infoEl) infoEl.innerHTML=infos[s];
    draw();
  };

  function draw(){
    c.clearRect(0,0,w,h);
    // background
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,dark?'#1A2A3A':'#E8F5E9');
    bg.addColorStop(0.62,dark?'#1A2A3A':'#F0FBF4');
    bg.addColorStop(0.62,dark?'#2A1A0A':'#D7CCC8');
    bg.addColorStop(1,dark?'#1A0F00':'#BCAAA4');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Title
    c.fillStyle=dark?'#81C784':'#1B5E20';
    c.font=`bold ${Math.round(h*0.042)}px Tajawal`;
    c.textAlign='center';
    c.fillText('نشاط ١٠-١: استجابة السيقان للضوء (Phototropism)',w/2,h*0.065);

    const pots=[
      {cx:w*0.2,  label:'الطبق (أ)', sub:'ضوء من جانب', lightDir:'right', bend:step===2?w*0.065:0, growF:step===0?0:step===1?0.45:1},
      {cx:w*0.5,  label:'الطبق (ب)', sub:'قرص دوّار',   lightDir:'down',  bend:0,                  growF:step===0?0:step===1?0.45:1},
      {cx:w*0.8,  label:'الطبق (ج)', sub:'بدون ضوء',    lightDir:'none',  bend:0,                  growF:step===0?0:step===1?0.35:0.75},
    ];

    const potBaseY=h*0.64;

    pots.forEach(p=>{
      // light source — only for directional light (A = right side)
      if(step>0){
        if(p.lightDir==='right'){
          _drawSun10(c,p.cx+w*0.15,potBaseY-h*0.16,h*0.028,'left',h);
        }
        if(p.lightDir==='down'){
          // Rotating disc indicator only — no sun icon
          c.save();
          c.strokeStyle='rgba(180,180,180,0.5)'; c.lineWidth=1.5; c.setLineDash([4,4]);
          c.beginPath(); c.ellipse(p.cx,potBaseY+6,w*0.065,h*0.01,0,0,Math.PI*2); c.stroke();
          c.setLineDash([]); c.restore();
          c.fillStyle='rgba(120,120,120,0.7)'; c.font=`${Math.round(h*0.022)}px Tajawal`;
          c.textAlign='center'; c.fillText('↻ دوّار',p.cx,potBaseY+h*0.05);
        }
      }
      // plant
      _drawPlant10(c,p.cx,potBaseY,w,h,dark,p.bend,p.growF,step===2);
      // pot
      const {pw,ph}=_drawPot10(c,p.cx,potBaseY,w,h,dark);
      // labels anchored to pot
      c.fillStyle=dark?'#eee':'#2C3A4A';
      c.font=`bold ${Math.round(h*0.028)}px Tajawal`;
      c.textAlign='center';
      c.fillText(p.label,p.cx,potBaseY+ph+h*0.038);
      c.fillStyle=dark?'#90A4AE':'#78909C';
      c.font=`${Math.round(h*0.022)}px Tajawal`;
      c.fillText(p.sub,p.cx,potBaseY+ph+h*0.065);
    });

    // spinning disc indicator for pot B
    if(step>0){
      c.strokeStyle=dark?'rgba(255,255,255,0.25)':'rgba(0,0,0,0.18)';
      c.lineWidth=2; c.setLineDash([5,4]);
      c.beginPath(); c.ellipse(w*0.5,potBaseY+6,w*0.07,h*0.012,0,0,Math.PI*2); c.stroke();
      c.setLineDash([]);
    }
  }
  draw();
}

// ══════════════════════════════════════════════════
// نشاط ١٠-١ب — جدول البيانات
// ══════════════════════════════════════════════════
function simG9Bio10N1b(){
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const w=cv.width,h=cv.height;
  const dark=document.documentElement.classList.contains('dark-mode');
  cancelAnimationFrame(window._animF);
  c.clearRect(0,0,w,h);

  _ctrlPanel(`
    <div style="padding:20px 16px;font-family:Tajawal,sans-serif;direction:rtl;">
      <div style="font-size:15px;font-weight:800;color:${dark?'#fff':'#2C3A4A'};margin-bottom:14px;border-bottom:2px solid ${dark?'rgba(255,255,255,0.1)':'#eee'};padding-bottom:10px;">📊 قراءة الجدول</div>
      <div style="font-size:13px;color:${dark?'#bbb':'#546E7A'};line-height:1.9;">
        <p style="margin-bottom:10px;">يُظهر الجدول <strong>طول البادرة</strong> في كل طبق عبر الأيام.</p>
        <p style="margin-bottom:10px;"><strong>لاحظ:</strong> الطبق (أ) نما أقل لكنه انحنى، بينما (ب) نما أسرع مستقيماً.</p>
      </div>
      <div style="margin-top:12px;background:${dark?'rgba(39,174,96,0.08)':'#F0FBF4'};border-radius:10px;padding:12px;border:1px solid ${dark?'rgba(39,174,96,0.2)':'rgba(39,174,96,0.15)'};">
        <div style="font-size:12px;font-weight:700;color:${dark?'#81C784':'#27AE60'};margin-bottom:6px;">💡 استنتاج</div>
        <div style="font-size:12px;color:${dark?'#aaa':'#546E7A'};line-height:1.7;">الانحناء لا يعني نمو الساق أكثر — بل يعني أن الجانب الظليل استطال أسرع من الجانب المضيء</div>
      </div>
    </div>`);

  const bg=dark?'#1E2D3A':'#FAFAF8';
  c.fillStyle=bg; c.fillRect(0,0,w,h);

  c.fillStyle=dark?'#81C784':'#1B5E20';
  c.font=`bold ${Math.round(h*0.042)}px Tajawal`;
  c.textAlign='center';
  c.fillText('جدول البيانات — طول البادرة (مم) واتجاه النمو',w/2,h*0.07);

  const data=[
    {label:'الطبق (أ) — ضوء من جانب', d2:'18 مم', d5:'52 مم', d7:'74 مم', dir:'نحو الضوء ← (انتحاء ضوئي موجب)', color:'#27AE60'},
    {label:'الطبق (ب) — قرص دوّار',   d2:'20 مم', d5:'59 مم', d7:'83 مم', dir:'مستقيمة للأعلى ↑',                color:'#1A8FA8'},
    {label:'الطبق (ج) — بدون ضوء',    d2:'11 مم', d5:'35 مم', d7:'51 مم', dir:'مستقيمة (بدون انحناء)',           color:'#78909C'},
  ];

  const tableX=w*0.02, tableW=w*0.96;
  const cols=[{label:'الطبق والظروف',frac:0.34},{label:'اليوم ٢',frac:0.11},{label:'اليوم ٥',frac:0.11},{label:'اليوم ٧',frac:0.11},{label:'اتجاه النمو',frac:0.33}];
  let cx=tableX;
  cols.forEach(col=>{ col.x=cx; col.w=tableW*col.frac; cx+=col.w; });

  const hdrH=h*0.1, startY=h*0.12, rowH=h*0.16;

  // Header
  c.fillStyle=dark?'rgba(39,174,96,0.2)':'rgba(39,174,96,0.1)';
  c.beginPath(); c.roundRect(tableX,startY,tableW,hdrH,6); c.fill();
  cols.forEach(col=>{
    c.fillStyle=dark?'#81C784':'#1B5E20';
    c.font=`bold ${Math.round(h*0.032)}px Tajawal`;
    c.textAlign='center';
    c.fillText(col.label,col.x+col.w/2,startY+hdrH*0.65);
    c.strokeStyle=dark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.07)';
    c.lineWidth=1; c.beginPath(); c.moveTo(col.x+col.w,startY); c.lineTo(col.x+col.w,startY+hdrH); c.stroke();
  });

  data.forEach((row,ri)=>{
    const ry=startY+hdrH+(ri)*rowH;
    c.fillStyle=dark?`rgba(255,255,255,${ri%2===0?0.04:0.02})`:`rgba(0,0,0,${ri%2===0?0.025:0})`;
    c.fillRect(tableX,ry,tableW,rowH);
    // colour bar
    c.fillStyle=row.color;
    c.fillRect(tableX,ry,5,rowH);
    const vals=[row.label,row.d2,row.d5,row.d7,row.dir];
    vals.forEach((v,ci)=>{
      c.fillStyle=ci===0?row.color:(dark?'#ddd':'#37474F');
      c.font=`${ci===0?'bold ':''} ${Math.round(h*0.028)}px Tajawal`;
      c.textAlign='center';
      c.fillText(v,cols[ci].x+cols[ci].w/2,ry+rowH*0.58);
    });
    c.strokeStyle=dark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.06)';
    c.lineWidth=1; c.strokeRect(tableX,ry,tableW,rowH);
  });

  c.fillStyle=dark?'rgba(39,174,96,0.15)':'rgba(39,174,96,0.08)';
  c.beginPath(); c.roundRect(tableX,startY+hdrH+data.length*rowH+h*0.02,tableW,h*0.1,6); c.fill();
  c.fillStyle=dark?'#81C784':'#1B5E20';
  c.font=`bold ${Math.round(h*0.03)}px Tajawal`;
  c.textAlign='center';
  c.fillText('💡 السيقان تستجيب للضوء باستطالة الجانب الظليل أكثر — مما يُسبب الانحناء نحو الضوء',w/2,startY+hdrH+data.length*rowH+h*0.065);
}

// ══════════════════════════════════════════════════
// نشاط ١٠-١ج — آلية الانتحاء الضوئي (تحليل)
// ══════════════════════════════════════════════════
function simG9Bio10N1c(){
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const w=cv.width,h=cv.height;
  const dark=document.documentElement.classList.contains('dark-mode');
  cancelAnimationFrame(window._animF);

  _ctrlPanel(`
    <div style="padding:20px 16px;font-family:Tajawal,sans-serif;direction:rtl;">
      <div style="font-size:15px;font-weight:800;color:${dark?'#fff':'#2C3A4A'};margin-bottom:14px;border-bottom:2px solid ${dark?'rgba(255,255,255,0.1)':'#eee'};padding-bottom:10px;">🔬 آلية الانتحاء الضوئي</div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${['١. الضوء يسقط من جانب واحد على القمة النامية','٢. الأوكسين (IAA) ينتقل من الجانب المضيء إلى الجانب الظليل','٣. خلايا الجانب الظليل تستطيل أكثر → تنمو أسرع','٤. الساق ينحني نحو الضوء (انتحاء ضوئي موجب)'].map((s,i)=>`
          <div style="display:flex;align-items:flex-start;gap:8px;background:${dark?'rgba(255,255,255,0.04)':'#F9F6F2'};border-radius:8px;padding:9px 10px;">
            <div style="width:22px;height:22px;border-radius:50%;background:${['#27AE60','#E65100','#1A8FA8','#D4901A'][i]};color:white;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${i+1}</div>
            <div style="font-size:12px;color:${dark?'#ccc':'#37474F'};line-height:1.6;">${s}</div>
          </div>`).join('')}
      </div>
    </div>`);

  const bg=dark?'#1E2D3A':'#FAFAF8';
  c.fillStyle=bg; c.fillRect(0,0,w,h);

  c.fillStyle=dark?'#81C784':'#1B5E20';
  c.font=`bold ${Math.round(h*0.042)}px Tajawal`;
  c.textAlign='center';
  c.fillText('تحليل النتائج — آلية الانتحاء الضوئي',w/2,h*0.07);

  // Stem — realistic curved stem with realistic leaves reusing _drawPlant10 helper
  const stemX=w*0.52, stemBot=h*0.88, stemTop=h*0.15;
  // Use _drawPlant10 with a controlled bend (leftward since light from right)
  _drawPlant10(c, stemX, stemBot, w, h, dark, w*0.12, 1.0, true);

  const tipX=stemX+w*0.12, tipY=stemTop+h*0.04;
  // Label for apical tip
  c.fillStyle='white'; c.font=`bold ${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
  c.fillText('قمة',tipX,tipY+5);

  // Light arrow from right
  _drawSun10(c,w*0.87,h*0.35,h*0.026,'left',h);
  c.strokeStyle='rgba(255,200,0,0.6)'; c.lineWidth=2; c.setLineDash([6,4]);
  c.beginPath(); c.moveTo(w*0.84,h*0.32); c.lineTo(tipX+h*0.05,tipY); c.stroke();
  c.setLineDash([]);

  // Auxin dots — more on shadow side (left)
  for(let i=0;i<7;i++){
    const dy=h*0.14+i*h*0.1;
    if(dy>stemBot) break;
    // shadow side (left of stem) — large dots
    c.fillStyle='rgba(255,152,0,0.88)';
    c.beginPath(); c.arc(stemX-w*0.055,dy,h*0.018,0,Math.PI*2); c.fill();
    // light side (right of stem) — small dots
    c.fillStyle='rgba(255,152,0,0.28)';
    c.beginPath(); c.arc(stemX+w*0.025,dy,h*0.01,0,Math.PI*2); c.fill();
  }

  // Labels
  c.fillStyle='#E65100'; c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
  c.fillText('أوكسين أكثر',stemX-w*0.14,h*0.52);
  c.fillText('(جانب ظليل)',stemX-w*0.14,h*0.57);
  c.fillStyle=dark?'#90A4AE':'#78909C'; c.font=`${Math.round(h*0.024)}px Tajawal`;
  c.fillText('أوكسين أقل',stemX+w*0.14,h*0.52);
  c.fillText('(جانب مضيء)',stemX+w*0.14,h*0.57);

  // Bend arrow
  c.fillStyle=dark?'#81C784':'#27AE60'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`;
  c.textAlign='center';
  c.fillText('← ينحني نحو الضوء',stemX+w*0.06,h*0.1);
}

// ══════════════════════════════════════════════════
// نشاط ١٠-٢أ — الجاذبية الأرضية (تفاعلي)
// ══════════════════════════════════════════════════
function simG9Bio10N2a(){
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const w=cv.width,h=cv.height;
  const dark=document.documentElement.classList.contains('dark-mode');
  cancelAnimationFrame(window._animF);
  let seedPos=0, showGrowth=false;

  function renderCtrl(){
    const labels=['↑ للأعلى','↓ للأسفل','← أفقي','↗ مائل'];
    _ctrlPanel(`
      <div style="padding:20px 16px;font-family:Tajawal,sans-serif;direction:rtl;">
        <div style="font-size:15px;font-weight:800;color:${dark?'#fff':'#2C3A4A'};margin-bottom:14px;border-bottom:2px solid ${dark?'rgba(255,255,255,0.1)':'#eee'};padding-bottom:10px;">🌱 اختر وضع البذرة</div>
        <div style="display:flex;flex-direction:column;gap:7px;margin-bottom:14px;">
          ${labels.map((lb,i)=>`
            <button onclick="window._g2pos(${i})" id="g2btn${i}" style="padding:10px 14px;border-radius:9px;border:2px solid ${i===seedPos?'#1A8FA8':'#ddd'};background:${i===seedPos?'#1A8FA8':(dark?'rgba(255,255,255,0.05)':'white')};color:${i===seedPos?'white':(dark?'#ccc':'#555')};font-family:Tajawal,sans-serif;font-size:13px;font-weight:700;cursor:pointer;text-align:right;">${lb}</button>`).join('')}
        </div>
        <button onclick="window._g2grow()" style="width:100%;padding:11px;border-radius:9px;border:none;background:#1A8FA8;color:white;font-family:Tajawal,sans-serif;font-size:14px;font-weight:700;cursor:pointer;margin-bottom:10px;">▶ شاهد النمو</button>
        <button onclick="window._g2reset()" style="width:100%;padding:9px;border-radius:9px;border:1.5px solid #ddd;background:${dark?'rgba(255,255,255,0.04)':'white'};color:${dark?'#ccc':'#666'};font-family:Tajawal,sans-serif;font-size:13px;font-weight:600;cursor:pointer;margin-bottom:12px;">↺ إعادة</button>
        <div id="g2res" style="font-size:13px;color:${dark?'#bbb':'#546E7A'};line-height:1.8;background:${dark?'rgba(26,143,168,0.08)':'rgba(26,143,168,0.06)'};border-radius:10px;padding:12px;border:1px solid ${dark?'rgba(26,143,168,0.2)':'rgba(26,143,168,0.15)'};">
          اختر وضع البذرة ثم اضغط "شاهد النمو"
        </div>
      </div>`);
  }

  window._g2pos=function(p){
    seedPos=p; showGrowth=false; renderCtrl(); draw();
  };
  window._g2grow=function(){
    showGrowth=true; draw();
    const el=document.getElementById('g2res');
    if(el) el.innerHTML='✅ <strong>النتيجة:</strong> الجذر نما نحو <strong style="color:#1A8FA8">الأسفل دائماً</strong> (انتحاء أرضي موجب)، والساق نما نحو <strong style="color:#27AE60">الأعلى دائماً</strong> (انتحاء أرضي سالب) — بغضّ النظر عن وضع البذرة!';
  };
  window._g2reset=function(){ showGrowth=false; renderCtrl(); draw(); };

  // seed orientation angles (for visual only — growth always same direction)
  const seedAngles=[-Math.PI/2, Math.PI/2, 0, -Math.PI/4];

  function draw(){
    c.clearRect(0,0,w,h);
    // background split
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,dark?'#1A2A3A':'#E8F5E9');
    bg.addColorStop(0.58,dark?'#1A2A3A':'#F0FBF4');
    bg.addColorStop(0.58,dark?'#2C1A0A':'#D7CCC8');
    bg.addColorStop(1,dark?'#180E00':'#BCAAA4');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // soil line
    c.strokeStyle=dark?'rgba(255,255,255,0.15)':'rgba(0,0,0,0.12)';
    c.lineWidth=2; c.setLineDash([10,6]);
    c.beginPath(); c.moveTo(0,h*0.58); c.lineTo(w,h*0.58); c.stroke();
    c.setLineDash([]);

    // Title
    const posLabels=['↑ البذرة للأعلى','↓ البذرة للأسفل','← البذرة أفقياً','↗ البذرة مائلة'];
    c.fillStyle=dark?'#fff':'#1B5E20';
    c.font=`bold ${Math.round(h*0.042)}px Tajawal`;
    c.textAlign='center';
    c.fillText('نشاط ١٠-٢: استجابة الجذور للجاذبية الأرضية',w/2,h*0.07);

    // Gravity arrow
    c.strokeStyle=dark?'rgba(255,255,255,0.4)':'rgba(0,0,0,0.25)';
    c.lineWidth=2.5; c.lineCap='round';
    c.beginPath(); c.moveTo(w*0.08,h*0.12); c.lineTo(w*0.08,h*0.25); c.stroke();
    c.fillStyle=dark?'rgba(255,255,255,0.4)':'rgba(0,0,0,0.25)';
    c.beginPath(); c.moveTo(w*0.08,h*0.26); c.lineTo(w*0.065,h*0.22); c.lineTo(w*0.095,h*0.22); c.closePath(); c.fill();
    c.fillStyle=dark?'rgba(255,255,255,0.4)':'rgba(0,0,0,0.25)';
    c.font=`${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText('جاذبية',w*0.08,h*0.11);

    const cx=w*0.52, cy=h*0.58;
    const sAng=seedAngles[seedPos];

    // Seed (oriented by angle)
    c.save(); c.translate(cx,cy); c.rotate(sAng);
    c.fillStyle='#D4A017';
    c.beginPath(); c.ellipse(0,0,h*0.055,h*0.03,0,0,Math.PI*2); c.fill();
    // embryo line
    c.strokeStyle='rgba(100,60,0,0.5)'; c.lineWidth=1.5;
    c.beginPath(); c.moveTo(-h*0.03,0); c.lineTo(h*0.03,0); c.stroke();
    c.restore();

    if(showGrowth){
      // ROOT — always down regardless of seed angle
      c.strokeStyle=dark?'#A1887F':'#795548'; c.lineWidth=7; c.lineCap='round';
      c.beginPath(); c.moveTo(cx,cy);
      c.bezierCurveTo(cx+w*0.02,cy+h*0.07, cx-w*0.015,cy+h*0.14, cx+w*0.01,cy+h*0.22); c.stroke();
      // root cap
      c.fillStyle=dark?'#8D6E63':'#6D4C41';
      c.beginPath(); c.ellipse(cx+w*0.01,cy+h*0.23,h*0.018,h*0.012,0.2,0,Math.PI*2); c.fill();
      // root hairs
      c.strokeStyle=dark?'#8D6E63':'#A1887F'; c.lineWidth=1.5;
      for(let i=0;i<6;i++){
        c.beginPath();
        c.moveTo(cx+(i-2.5)*9,cy+h*0.11+i*h*0.018);
        c.lineTo(cx+(i-2.5)*9+(i%2===0?11:-11),cy+h*0.12+i*h*0.018);
        c.stroke();
      }
      // ROOT label
      c.fillStyle=dark?'#FFAB91':'#5D4037';
      c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='right';
      c.fillText('الجذر ↓ نحو الأسفل دائماً',w*0.78,cy+h*0.2);

      // SHOOT — always up
      c.strokeStyle=dark?'#66BB6A':'#2E7D32'; c.lineWidth=8; c.lineCap='round';
      c.beginPath(); c.moveTo(cx,cy);
      c.bezierCurveTo(cx-w*0.025,cy-h*0.1, cx+w*0.015,cy-h*0.2, cx,cy-h*0.3); c.stroke();
      // leaves
      c.fillStyle=dark?'#388E3C':'#1B5E20';
      c.beginPath(); c.ellipse(cx,cy-h*0.32,h*0.042,h*0.03,0,0,Math.PI*2); c.fill();
      c.fillStyle=dark?'#81C784':'#4CAF50';
      c.beginPath(); c.ellipse(cx,cy-h*0.32,h*0.034,h*0.022,0,0,Math.PI*2); c.fill();
      c.fillStyle=dark?'#81C784':'#1B5E20';
      c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='left';
      c.fillText('الساق ↑ نحو الأعلى دائماً',w*0.25,cy-h*0.27);
    }

    // Current pos label
    c.fillStyle=dark?'#90CAD4':'#0E6B80';
    c.font=`bold ${Math.round(h*0.032)}px Tajawal`;
    c.textAlign='center';
    c.fillText(posLabels[seedPos],w*0.52,h*0.88);
  }

  renderCtrl(); draw();
}

// ══════════════════════════════════════════════════
// نشاط ١٠-٢ب — مقارنة الأوضاع الأربعة
// ══════════════════════════════════════════════════
function simG9Bio10N2b(){
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const w=cv.width,h=cv.height;
  const dark=document.documentElement.classList.contains('dark-mode');
  cancelAnimationFrame(window._animF);

  _ctrlPanel(`
    <div style="padding:20px 16px;font-family:Tajawal,sans-serif;direction:rtl;">
      <div style="font-size:15px;font-weight:800;color:${dark?'#fff':'#2C3A4A'};margin-bottom:14px;border-bottom:2px solid ${dark?'rgba(255,255,255,0.1)':'#eee'};padding-bottom:10px;">📋 نتيجة الأوضاع الأربعة</div>
      <div style="font-size:13px;color:${dark?'#bbb':'#546E7A'};line-height:1.9;margin-bottom:12px;">
        في كل وضع من الأوضاع الأربعة: <strong style="color:${dark?'#A1887F':'#795548'}">الجذر ينمو للأسفل</strong> و<strong style="color:${dark?'#81C784':'#27AE60'}">الساق ينمو للأعلى</strong>.
      </div>
      <div style="background:${dark?'rgba(26,143,168,0.1)':'rgba(26,143,168,0.06)'};border-radius:10px;padding:12px;border:1px solid ${dark?'rgba(26,143,168,0.2)':'rgba(26,143,168,0.15)'};">
        <div style="font-size:12px;font-weight:700;color:${dark?'#4DD0E1':'#0E6B80'};margin-bottom:6px;">🧬 لماذا؟</div>
        <div style="font-size:12px;color:${dark?'#90CAD4':'#1A7A92'};line-height:1.7;">الأوكسين (IAA) يُعاد توزيعه استجابةً للجاذبية — يتجمّع في الجانب السفلي من الجذر فيُبطئ نموه، مما يجعله ينحني للأسفل</div>
      </div>
    </div>`);

  const bg=dark?'#1E2D3A':'#FAFAF8';
  c.fillStyle=bg; c.fillRect(0,0,w,h);

  c.fillStyle=dark?'#fff':'#1B5E20';
  c.font=`bold ${Math.round(h*0.042)}px Tajawal`;
  c.textAlign='center';
  c.fillText('نتيجة الجذور في الأوضاع الأربعة',w/2,h*0.07);

  // 4 different seed starting orientations
  const configs=[
    {label:'زراعة للأعلى',  seedAngle:-Math.PI/2, seedColor:'#D4A017'},
    {label:'زراعة للأسفل', seedAngle: Math.PI/2,  seedColor:'#E6890A'},
    {label:'زراعة أفقياً', seedAngle: 0,           seedColor:'#C88A10'},
    {label:'زراعة مائلة',  seedAngle:-Math.PI/4,   seedColor:'#D4A017'},
  ];
  const xs=[w*0.14,w*0.38,w*0.62,w*0.86];
  const midY=h*0.55;

  configs.forEach((cfg,i)=>{
    const cx=xs[i];

    // Seed (visually oriented)
    c.save(); c.translate(cx,midY); c.rotate(cfg.seedAngle);
    c.fillStyle=cfg.seedColor;
    c.beginPath(); c.ellipse(0,0,h*0.04,h*0.022,0,0,Math.PI*2); c.fill();
    c.restore();

    // Root — always goes DOWN
    c.strokeStyle=dark?'#A1887F':'#795548'; c.lineWidth=5; c.lineCap='round';
    c.beginPath(); c.moveTo(cx,midY);
    c.bezierCurveTo(cx+6,midY+h*0.05, cx-4,midY+h*0.1, cx+3,midY+h*0.17); c.stroke();
    // root cap
    c.fillStyle=dark?'#8D6E63':'#6D4C41';
    c.beginPath(); c.ellipse(cx+3,midY+h*0.19,h*0.014,h*0.01,0.1,0,Math.PI*2); c.fill();

    c.fillStyle=dark?'#FFAB91':'#5D4037';
    c.font=`bold ${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText('↓ جذر',cx,midY+h*0.24);

    // Shoot — always goes UP
    c.strokeStyle=dark?'#66BB6A':'#2E7D32'; c.lineWidth=5; c.lineCap='round';
    c.beginPath(); c.moveTo(cx,midY);
    c.bezierCurveTo(cx-5,midY-h*0.07, cx+4,midY-h*0.14, cx,midY-h*0.21); c.stroke();
    c.fillStyle=dark?'#388E3C':'#1B5E20';
    c.beginPath(); c.ellipse(cx,midY-h*0.23,h*0.032,h*0.023,0,0,Math.PI*2); c.fill();
    c.fillStyle=dark?'#4CAF50':'#2E7D32';
    c.beginPath(); c.ellipse(cx,midY-h*0.23,h*0.026,h*0.017,0,0,Math.PI*2); c.fill();

    c.fillStyle=dark?'#81C784':'#1B5E20';
    c.font=`bold ${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText('↑ ساق',cx,midY-h*0.27);

    c.fillStyle=dark?'#bbb':'#546E7A';
    c.font=`${Math.round(h*0.025)}px Tajawal`;
    c.fillText(cfg.label,cx,h*0.9);
  });

  // Conclusion
  c.fillStyle=dark?'rgba(39,174,96,0.15)':'rgba(39,174,96,0.1)';
  c.beginPath(); c.roundRect(w*0.04,h*0.93,w*0.92,h*0.06,6); c.fill();
  c.fillStyle=dark?'#81C784':'#1B5E20';
  c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
  c.fillText('✅ الاستنتاج: الجذر دائماً للأسفل — الساق دائماً للأعلى — بغضّ النظر عن وضع البذرة',w/2,h*0.97);
}

// ══════════════════════════════════════════════════
// نشاط ١٠-٢ج — جدول المقارنة
// ══════════════════════════════════════════════════
function simG9Bio10N2c(){
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const w=cv.width,h=cv.height;
  const dark=document.documentElement.classList.contains('dark-mode');
  cancelAnimationFrame(window._animF);

  _ctrlPanel(`
    <div style="padding:20px 16px;font-family:Tajawal,sans-serif;direction:rtl;">
      <div style="font-size:15px;font-weight:800;color:${dark?'#fff':'#2C3A4A'};margin-bottom:14px;border-bottom:2px solid ${dark?'rgba(255,255,255,0.1)':'#eee'};padding-bottom:10px;">⚖️ مقارنة الانتحاءات</div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <div style="background:${dark?'rgba(39,174,96,0.08)':'#F0FBF4'};border-radius:8px;padding:10px;border-right:3px solid #27AE60;">
          <div style="font-size:12px;font-weight:700;color:#27AE60;margin-bottom:4px;">🌿 Phototropism</div>
          <div style="font-size:12px;color:${dark?'#aaa':'#546E7A'};line-height:1.6;">السيقان: موجب (نحو الضوء) · الجذور: سالب</div>
        </div>
        <div style="background:${dark?'rgba(26,143,168,0.08)':'#E1F5FE'};border-radius:8px;padding:10px;border-right:3px solid #1A8FA8;">
          <div style="font-size:12px;font-weight:700;color:#1A8FA8;margin-bottom:4px;">🌍 Gravitropism</div>
          <div style="font-size:12px;color:${dark?'#aaa':'#546E7A'};line-height:1.6;">الجذور: موجب (للأسفل) · السيقان: سالب (للأعلى)</div>
        </div>
        <div style="background:${dark?'rgba(212,144,26,0.08)':'#FFF8E1'};border-radius:8px;padding:10px;border-right:3px solid #D4901A;">
          <div style="font-size:12px;font-weight:700;color:#D4901A;margin-bottom:4px;">🧬 الهرمون</div>
          <div style="font-size:12px;color:${dark?'#aaa':'#546E7A'};line-height:1.6;">كلاهما يعتمد على الأوكسين (IAA) لكن بتأثيرات مختلفة</div>
        </div>
      </div>
    </div>`);

  const bg=dark?'#1E2D3A':'#FAFAF8';
  c.fillStyle=bg; c.fillRect(0,0,w,h);

  c.fillStyle=dark?'#4DD0E1':'#1A8FA8';
  c.font=`bold ${Math.round(h*0.042)}px Tajawal`;
  c.textAlign='center';
  c.fillText('مقارنة: الانتحاء الضوئي مقابل الانتحاء الأرضي',w/2,h*0.07);

  const rows=[
    ['الخاصية','Phototropism (ضوئي)','Gravitropism (أرضي)'],
    ['المُنبّه','الضوء','الجاذبية الأرضية'],
    ['السيقان','موجب ← نحو الضوء','سالب ↑ نحو الأعلى'],
    ['الجذور','سالب ← بعيداً عن الضوء','موجب ↓ نحو الأسفل'],
    ['الهرمون','الأوكسين (IAA)','الأوكسين (IAA)'],
    ['الفائدة','أوراق تمتص الضوء','جذور تمتص الماء'],
  ];

  const tX=w*0.02, tW=w*0.96;
  const colFs=[0.28,0.36,0.36];
  let cx2=tX;
  const colsC=colFs.map(f=>{ const o={x:cx2,w:tW*f}; cx2+=tW*f; return o; });
  const rH=h*0.118, sY=h*0.12;

  rows.forEach((row,ri)=>{
    const ry=sY+ri*rH;
    const isH=ri===0;
    row.forEach((cell,ci)=>{
      c.fillStyle=isH?(dark?'rgba(26,143,168,0.2)':'rgba(26,143,168,0.1)'):(dark?`rgba(255,255,255,${ri%2===0?0.04:0.01})`:`rgba(0,0,0,${ri%2===0?0.02:0})`);
      c.fillRect(colsC[ci].x,ry,colsC[ci].w,rH);
      c.strokeStyle=dark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)';
      c.lineWidth=1; c.strokeRect(colsC[ci].x,ry,colsC[ci].w,rH);
      c.fillStyle=isH?(dark?'#4DD0E1':'#0E6B80'):(dark?'#ddd':'#37474F');
      c.font=`${isH?'bold ':''} ${Math.round(h*0.029)}px Tajawal`;
      c.textAlign='center';
      c.fillText(cell,colsC[ci].x+colsC[ci].w/2,ry+rH*0.62);
    });
  });
}

// ══════════════════════════════════════════════════
// نشاط ١٠-٣أ — توزيع الأوكسين وانحناء الساق
// ══════════════════════════════════════════════════
function simG9Bio10N3a(){
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const w=cv.width,h=cv.height;
  const dark=document.documentElement.classList.contains('dark-mode');
  cancelAnimationFrame(window._animF);
  let lightDir='even', auxinLevel=60, bendAngle=0, animating=false;

  function renderCtrl(){
    _ctrlPanel(`
      <div style="padding:20px 16px;font-family:Tajawal,sans-serif;direction:rtl;">
        <div style="font-size:15px;font-weight:800;color:${dark?'#fff':'#2C3A4A'};margin-bottom:14px;border-bottom:2px solid ${dark?'rgba(255,255,255,0.1)':'#eee'};padding-bottom:10px;">☀️ توزيع الأوكسين</div>
        <div style="font-size:13px;font-weight:700;color:${dark?'#bbb':'#546E7A'};margin-bottom:8px;">اتجاه الضوء:</div>
        <div style="display:flex;flex-direction:column;gap:7px;margin-bottom:14px;">
          ${[['right','☀️ من اليمين'],['left','☀️ من اليسار'],['even','☀️ ضوء متساوٍ']].map(([d,lb])=>`
            <button onclick="window._n3aLight('${d}')" id="n3a_${d}" style="padding:9px 14px;border-radius:9px;border:2px solid ${lightDir===d?'#D4901A':'#ddd'};background:${lightDir===d?'#D4901A':(dark?'rgba(255,255,255,0.05)':'white')};color:${lightDir===d?'white':(dark?'#ccc':'#555')};font-family:Tajawal,sans-serif;font-size:13px;font-weight:700;cursor:pointer;text-align:right;">${lb}</button>`).join('')}
        </div>
        <div style="margin-bottom:14px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <span style="font-size:13px;font-weight:700;color:${dark?'#bbb':'#546E7A'};">كثافة الأوكسين:</span>
            <span id="auxValLbl" style="font-size:13px;font-weight:700;color:#E65100;">${auxinLevel}%</span>
          </div>
          <input type="range" min="10" max="100" value="${auxinLevel}" oninput="window._n3aAuxin(this.value)" style="width:100%;accent-color:#E65100;">
        </div>
        <button onclick="window._n3aRun()" style="width:100%;padding:11px;border-radius:9px;border:none;background:#D4901A;color:white;font-family:Tajawal,sans-serif;font-size:14px;font-weight:700;cursor:pointer;">▶ شاهد الانحناء</button>
        <div style="margin-top:12px;background:${dark?'rgba(212,144,26,0.08)':'#FFF8E1'};border-radius:8px;padding:10px;border:1px solid ${dark?'rgba(212,144,26,0.2)':'rgba(212,144,26,0.2)'};">
          <div style="font-size:12px;color:${dark?'#FFD54F':'#8A5A00'};line-height:1.7;">الأوكسين يتجمّع في الجانب الظليل → يستطيل أسرع → ينحني الساق نحو الضوء</div>
        </div>
      </div>`);
  }

  window._n3aLight=function(d){ lightDir=d; bendAngle=0; renderCtrl(); draw(0); };
  window._n3aAuxin=function(v){ auxinLevel=parseInt(v); const el=document.getElementById('auxValLbl'); if(el) el.textContent=v+'%'; draw(bendAngle); };
  window._n3aRun=function(){
    if(animating) return;
    const target=lightDir==='right'?-22:lightDir==='left'?22:0;
    let fr=0; const tot=45; animating=true;
    function anim(){ fr++; bendAngle=target*(1-Math.pow(1-fr/tot,3)); draw(bendAngle); if(fr<tot) requestAnimationFrame(anim); else animating=false; }
    anim();
  };

  function draw(bend){
    c.clearRect(0,0,w,h);
    // bg
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,dark?'#1E2A38':'#FFFDE7');
    bg.addColorStop(0.55,dark?'#1E2A38':'#FFF9C4');
    bg.addColorStop(0.55,dark?'#2A1A0A':'#C8E6C9');
    bg.addColorStop(1,dark?'#150E00':'#A5D6A7');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    c.fillStyle=dark?'#FFD54F':'#E65100';
    c.font=`bold ${Math.round(h*0.042)}px Tajawal`;
    c.textAlign='center';
    c.fillText('توزيع الأوكسين وانحناء الساق',w/2,h*0.07);

    const stemX=w*0.5, stemBot=h*0.72;
    const endX=stemX+Math.sin(bend*Math.PI/180)*h*0.4;
    const endY=stemBot-h*0.4;

    // Light source
    if(lightDir==='right') _drawSun10(c,w*0.87,h*0.28,h*0.026,'left',h);
    else if(lightDir==='left') _drawSun10(c,w*0.13,h*0.28,h*0.026,'right',h);
    else _drawSun10(c,w*0.5,h*0.1,h*0.026,'down',h);

    // Auxin dots in cells
    const aR=auxinLevel/100;
    for(let i=0;i<8;i++){
      const dy=h*0.13+i*h*0.073;
      if(dy>stemBot-h*0.05) break;
      let lC=0.5*aR, rC=0.5*aR;
      if(lightDir==='right'){ lC=0.75*aR; rC=0.25*aR; }
      else if(lightDir==='left'){ lC=0.25*aR; rC=0.75*aR; }
      // Left cell
      c.fillStyle=`rgba(255,152,0,${lC})`;
      c.beginPath(); c.roundRect(stemX-w*0.12,dy-h*0.028,w*0.09,h*0.048,5); c.fill();
      c.strokeStyle=`rgba(200,100,0,${lC*0.5})`; c.lineWidth=1;
      c.strokeRect(stemX-w*0.12,dy-h*0.028,w*0.09,h*0.048);
      // Right cell
      c.fillStyle=`rgba(255,152,0,${rC})`;
      c.beginPath(); c.roundRect(stemX+w*0.03,dy-h*0.028,w*0.09,h*0.048,5); c.fill();
      c.strokeStyle=`rgba(200,100,0,${rC*0.5})`; c.lineWidth=1;
      c.strokeRect(stemX+w*0.03,dy-h*0.028,w*0.09,h*0.048);
    }

    // Stem
    c.strokeStyle=dark?'#388E3C':'#1B5E20'; c.lineWidth=14; c.lineCap='round';
    c.beginPath(); c.moveTo(stemX,stemBot); c.bezierCurveTo(stemX+Math.sin(bend*Math.PI/180)*h*0.12,stemBot-h*0.15,endX+Math.sin(bend*Math.PI/180)*h*0.05,endY+h*0.1,endX,endY); c.stroke();
    c.strokeStyle=dark?'#66BB6A':'#4CAF50'; c.lineWidth=5; c.globalAlpha=0.45;
    c.beginPath(); c.moveTo(stemX-3,stemBot); c.bezierCurveTo(stemX+Math.sin(bend*Math.PI/180)*h*0.12-3,stemBot-h*0.15,endX+Math.sin(bend*Math.PI/180)*h*0.05-3,endY+h*0.1,endX-3,endY); c.stroke();
    c.globalAlpha=1;

    // Tip
    c.fillStyle='#2E7D32'; c.beginPath(); c.ellipse(endX,endY-h*0.03,h*0.04,h*0.028,bend*0.02,0,Math.PI*2); c.fill();
    c.fillStyle='#4CAF50'; c.beginPath(); c.ellipse(endX,endY-h*0.03,h*0.03,h*0.02,bend*0.02,0,Math.PI*2); c.fill();

    // Pot
    const {pw,ph}=_drawPot10(c,stemX,stemBot,w,h,dark);

    // Labels
    if(lightDir!=='even'){
      const shX=lightDir==='right'?stemX-w*0.2:stemX+w*0.2;
      const ltX=lightDir==='right'?stemX+w*0.2:stemX-w*0.2;
      c.fillStyle='#E65100'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
      c.fillText('أوكسين أكثر',shX,h*0.5);
      c.fillText('(جانب ظليل)',shX,h*0.545);
      c.fillStyle=dark?'#90A4AE':'#90A4AE'; c.font=`${Math.round(h*0.022)}px Tajawal`;
      c.fillText('أوكسين أقل',ltX,h*0.5);
      c.fillText('(جانب مضيء)',ltX,h*0.545);
    }

    // Legend
    c.fillStyle=dark?'rgba(255,255,255,0.06)':'rgba(255,255,255,0.8)';
    c.beginPath(); c.roundRect(w*0.74,h*0.74,w*0.24,h*0.18,8); c.fill();
    c.fillStyle=dark?'#FFD54F':'#8A5A00'; c.font=`bold ${Math.round(h*0.024)}px Tajawal`; c.textAlign='right';
    c.fillText('الأوكسين (IAA)',w*0.96,h*0.77);
    c.fillStyle='rgba(255,152,0,0.85)'; c.beginPath(); c.roundRect(w*0.76,h*0.79,w*0.07,h*0.04,4); c.fill();
    c.fillStyle=dark?'#ddd':'#444'; c.font=`${Math.round(h*0.022)}px Tajawal`; c.textAlign='right';
    c.fillText('مرتفع',w*0.96,h*0.815);
    c.fillStyle='rgba(255,152,0,0.2)'; c.beginPath(); c.roundRect(w*0.76,h*0.84,w*0.07,h*0.04,4); c.fill();
    c.fillText('منخفض',w*0.96,h*0.866);
  }

  renderCtrl(); draw(0);
}

// ══════════════════════════════════════════════════
// نشاط ١٠-٣ب — تجربة الأصيصات الثلاثية
// ══════════════════════════════════════════════════
function simG9Bio10N3b(){
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const w=cv.width,h=cv.height;
  const dark=document.documentElement.classList.contains('dark-mode');
  cancelAnimationFrame(window._animF);
  let showResult=false;

  _ctrlPanel(`
    <div style="padding:20px 16px;font-family:Tajawal,sans-serif;direction:rtl;">
      <div style="font-size:15px;font-weight:800;color:${dark?'#fff':'#2C3A4A'};margin-bottom:14px;border-bottom:2px solid ${dark?'rgba(255,255,255,0.1)':'#eee'};padding-bottom:10px;">🧪 تجربة الأصيصات الثلاثية (١٩١٣)</div>
      <div style="font-size:13px;color:${dark?'#bbb':'#546E7A'};line-height:1.9;margin-bottom:12px;">
        ثلاث بادرات تتعرّض لضوء من جانب واحد. في كل بادرة تم إجراء تعديل مختلف على قمة الساق.
      </div>
      <button onclick="window._n3bShow()" id="n3bShowBtn" style="width:100%;padding:11px;border-radius:9px;border:none;background:#D4901A;color:white;font-family:Tajawal,sans-serif;font-size:14px;font-weight:700;cursor:pointer;margin-bottom:10px;">▶ أظهري النتيجة بعد يومين</button>
      <button onclick="window._n3bReset()" style="width:100%;padding:9px;border-radius:9px;border:1.5px solid #ddd;background:${dark?'rgba(255,255,255,0.04)':'white'};color:${dark?'#ccc':'#666'};font-family:Tajawal,sans-serif;font-size:13px;font-weight:600;cursor:pointer;margin-bottom:12px;">↺ إعادة</button>
      <div id="n3bRes" style="font-size:13px;color:${dark?'#bbb':'#546E7A'};line-height:1.8;background:${dark?'rgba(212,144,26,0.08)':'#FFF8E1'};border-radius:10px;padding:12px;border:1px solid ${dark?'rgba(212,144,26,0.2)':'rgba(212,144,26,0.2)'};">
        انقر الزر لمشاهدة نتيجة كل بادرة بعد يومين من التجربة
      </div>
    </div>`);

  window._n3bShow=function(){ showResult=true; draw();
    const el=document.getElementById('n3bRes');
    if(el) el.innerHTML='<strong style="color:#27AE60">(ج)</strong> انحنت نحو الضوء ✓ | <strong style="color:#D4901A">(ب)</strong> نمت مستقيمة (اللانولين منع الأوكسين) | <strong style="color:var(--red,#C0392B)">(أ)</strong> لم تنحنِ (القمة مفقودة)';
  };
  window._n3bReset=function(){ showResult=false; draw(); const el=document.getElementById('n3bRes'); if(el) el.textContent='انقر الزر لمشاهدة نتيجة كل بادرة بعد يومين من التجربة'; };

  function drawBadge(cx,y,text,color){
    c.fillStyle=color;
    c.beginPath(); c.roundRect(cx-w*0.065,y,w*0.13,h*0.048,20); c.fill();
    c.fillStyle='white'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText(text,cx,y+h*0.032);
  }

  function draw(){
    c.clearRect(0,0,w,h);
    const bg=dark?'#1E2D3A':'#F0FBF4';
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    c.fillStyle=dark?'#FFD54F':'#E65100';
    c.font=`bold ${Math.round(h*0.04)}px Tajawal`;
    c.textAlign='center';
    c.fillText('تجربة الأصيصات الثلاثية — دور الأوكسين',w/2,h*0.07);

    const plants=[
      {cx:w*0.2, label:'البادرة (أ)', sub:'قمة مفقودة', bend:0, hasTip:false, hasLanoln:false, resultBend:false},
      {cx:w*0.5, label:'البادرة (ب)', sub:'لانولين على القمة', bend:0, hasTip:true, hasLanoln:true, resultBend:false},
      {cx:w*0.8, label:'البادرة (ج)', sub:'بادرة كاملة', bend:showResult?w*0.065:0, hasTip:true, hasLanoln:false, resultBend:true},
    ];

    plants.forEach(p=>{
      const potBaseY=h*0.64;
      // light
      _drawSun10(c,p.cx+w*0.14,potBaseY-h*0.16,h*0.025,'left',h);

      // stem
      c.strokeStyle=dark?'#388E3C':'#2E7D32'; c.lineWidth=8; c.lineCap='round';
      const endX=p.cx+p.bend, endY=potBaseY-h*0.33;
      c.beginPath(); c.moveTo(p.cx,potBaseY);
      c.bezierCurveTo(p.cx+p.bend*0.25,potBaseY-h*0.12, endX+p.bend*0.1,endY+h*0.1, endX,endY); c.stroke();

      if(p.hasTip){
        if(p.hasLanoln){
          // Lanolin block
          c.fillStyle='rgba(240,220,150,0.85)';
          c.beginPath(); c.roundRect(endX-w*0.04,endY-h*0.055,w*0.08,h*0.045,5); c.fill();
          c.strokeStyle='rgba(180,150,80,0.6)'; c.lineWidth=1.5; c.setLineDash([3,3]);
          c.strokeRect(endX-w*0.04,endY-h*0.055,w*0.08,h*0.045);
          c.setLineDash([]);
          c.fillStyle=dark?'#FFD54F':'#8A5A00'; c.font=`bold ${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
          c.fillText('لانولين',endX,endY-h*0.022);
        } else {
          // Normal tip
          c.fillStyle='#2E7D32'; c.beginPath(); c.ellipse(endX,endY-h*0.038,h*0.038,h*0.028,0,0,Math.PI*2); c.fill();
          c.fillStyle='#4CAF50'; c.beginPath(); c.ellipse(endX,endY-h*0.038,h*0.03,h*0.02,0,0,Math.PI*2); c.fill();
          if(showResult && p.resultBend){
            c.fillStyle=dark?'#81C784':'#1B5E20';
            c.beginPath(); c.ellipse(endX-h*0.055,endY-h*0.005,h*0.05,h*0.022,-0.5,0,Math.PI*2); c.fill();
            c.beginPath(); c.ellipse(endX+h*0.055,endY-h*0.005,h*0.05,h*0.022,0.5,0,Math.PI*2); c.fill();
          }
        }
      } else {
        // Cut tip indicator
        c.strokeStyle='#C0392B'; c.lineWidth=2; c.setLineDash([3,3]);
        c.beginPath(); c.arc(endX,endY-h*0.03,h*0.038,0,Math.PI*2); c.stroke();
        c.setLineDash([]);
        c.strokeStyle='#C0392B'; c.lineWidth=3;
        c.beginPath(); c.moveTo(endX-h*0.025,endY-h*0.056); c.lineTo(endX+h*0.025,endY-h*0.005); c.stroke();
        c.beginPath(); c.moveTo(endX+h*0.025,endY-h*0.056); c.lineTo(endX-h*0.025,endY-h*0.005); c.stroke();
      }

      // pot
      _drawPot10(c,p.cx,potBaseY,w,h,dark);

      // Labels — anchored to pot bottom
      const ph3b=h*0.18;
      c.fillStyle=dark?'#eee':'#2C3A4A';
      c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
      c.fillText(p.label,p.cx,potBaseY+ph3b+h*0.038);
      c.fillStyle=dark?'#90A4AE':'#78909C';
      c.font=`${Math.round(h*0.022)}px Tajawal`;
      c.fillText(p.sub,p.cx,potBaseY+ph3b+h*0.07);

      if(showResult){
        const colors=['#C0392B','#D4901A','#27AE60'];
        const results=['لم تنحنِ ✗','مستقيمة (لانولين)','انحنت نحو الضوء ✓'];
        const idx=plants.indexOf(p);
        c.fillStyle=colors[idx]+'22';
        c.beginPath(); c.roundRect(p.cx-w*0.1,potBaseY+ph3b+h*0.08,w*0.2,h*0.055,5); c.fill();
        c.fillStyle=colors[idx];
        c.font=`bold ${Math.round(h*0.025)}px Tajawal`; c.textAlign='center';
        c.fillText(results[idx],p.cx,potBaseY+ph3b+h*0.115);
      }
    });
  }
  draw();
}

// ══════════════════════════════════════════════════
// نشاط ١٠-٣ج — أسئلة التحليل
// ══════════════════════════════════════════════════
function simG9Bio10N3c(){
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const w=cv.width,h=cv.height;
  const dark=document.documentElement.classList.contains('dark-mode');
  cancelAnimationFrame(window._animF);

  _ctrlPanel(`
    <div style="padding:20px 16px;font-family:Tajawal,sans-serif;direction:rtl;">
      <div style="font-size:15px;font-weight:800;color:${dark?'#fff':'#2C3A4A'};margin-bottom:14px;border-bottom:2px solid ${dark?'rgba(255,255,255,0.1)':'#eee'};padding-bottom:10px;">🧠 أسئلة التحليل</div>
      ${[
        {q:'ما سبب مسح القمم باللانولين في البادرة (ب)؟',opts:['لتغذية القمة','اللانولين يمنع انتشار الأوكسين من القمة للأسفل','لحماية القمة من الحرارة'],ans:1},
        {q:'لماذا لم تنحنِ البادرة (أ) رغم تعرّضها للضوء؟',opts:['لأن الضوء كان ضعفاً','لأن القمة مفقودة — لا يوجد مصدر للأوكسين','لأن التربة كانت جافة'],ans:1},
        {q:'أيّ بادرة هي التجربة الضابطة؟',opts:['البادرة (أ)','البادرة (ب)','البادرة (ج) — بادرة كاملة طبيعية'],ans:2},
      ].map((q,qi)=>`
        <div style="background:${dark?'rgba(255,255,255,0.04)':'#F9F6F2'};border-radius:10px;padding:12px;margin-bottom:10px;" id="qcard${qi}">
          <div style="font-size:13px;font-weight:700;color:${dark?'#eee':'#2C3A4A'};margin-bottom:8px;line-height:1.6;">${qi+1}. ${q.q}</div>
          ${q.opts.map((opt,oi)=>`
            <button onclick="window._n3cAns(${qi},${oi},${q.ans})" class="n3copt_${qi}" style="display:block;width:100%;text-align:right;padding:8px 10px;border-radius:8px;border:1.5px solid #ddd;background:${dark?'rgba(255,255,255,0.03)':'#F4F1EC'};color:${dark?'#ccc':'#444'};font-family:Tajawal,sans-serif;font-size:12px;font-weight:500;cursor:pointer;margin-bottom:5px;">${opt}</button>`).join('')}
          <div id="qfb${qi}" style="font-size:12px;margin-top:6px;padding:7px 10px;border-radius:7px;display:none;"></div>
        </div>`).join('')}
    </div>`);

  window._n3cAns=function(qi,oi,ans){
    const correct=oi===ans;
    const fbs=[
      {c:'✅ صحيح! اللانولين مادة دهنية عازلة تمنع انتقال الأوكسين من القمة للأسفل.',w:'❌ اللانولين مادة عازلة دهنية — وظيفتها منع انتشار الأوكسين.'},
      {c:'✅ بدون قمة لا يوجد إنتاج للأوكسين — وبدون الأوكسين لا توجد استطالة تفاضلية ولا انحناء.',w:'❌ السبب الرئيسي هو غياب القمة (مصنع الأوكسين).'},
      {c:'✅ البادرة (ج) الكاملة هي الضابطة — تُمثّل السلوك الطبيعي للمقارنة.',w:'❌ الضابطة هي النبتة الطبيعية بدون أي تعديل (البادرة ج).'},
    ];
    document.querySelectorAll(`.n3copt_${qi}`).forEach((b,i)=>{
      b.disabled=true;
      if(i===oi) b.style.background=correct?(dark?'rgba(39,174,96,0.2)':'rgba(39,174,96,0.12)'):(dark?'rgba(192,57,43,0.2)':'rgba(192,57,43,0.08)');
      if(!correct && i===ans) b.style.background=dark?'rgba(39,174,96,0.15)':'rgba(39,174,96,0.08)';
      b.style.borderColor=i===ans?'#27AE60':(i===oi&&!correct?'#C0392B':'#ddd');
    });
    const fb=document.getElementById(`qfb${qi}`);
    if(fb){
      fb.style.display='block';
      fb.style.background=correct?(dark?'rgba(39,174,96,0.15)':'rgba(39,174,96,0.1)'):(dark?'rgba(192,57,43,0.12)':'rgba(192,57,43,0.06)');
      fb.style.color=correct?'#1A7A40':'#A02010';
      fb.style.border=`1px solid ${correct?'rgba(39,174,96,0.3)':'rgba(192,57,43,0.2)'}`;
      fb.textContent=correct?fbs[qi].c:fbs[qi].w;
    }
  };

  const bg=dark?'#1E2D3A':'#FAFAF8';
  c.fillStyle=bg; c.fillRect(0,0,w,h);
  c.fillStyle=dark?'#FFD54F':'#D4901A';
  c.font=`bold ${Math.round(h*0.042)}px Tajawal`; c.textAlign='center';
  c.fillText('أسئلة التحليل — نشاط الأصيصات الثلاثية',w/2,h*0.5);
  c.fillStyle=dark?'#90A4AE':'#78909C';
  c.font=`${Math.round(h*0.028)}px Tajawal`;
  c.fillText('أجب عن الأسئلة في لوحة التحكم →',w/2,h*0.6);
}

// ══════════════════════════════════════════════════
// نشاط ١٠-٤أ — تغطية أجزاء الساق
// ══════════════════════════════════════════════════
function simG9Bio10N4a(){
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const w=cv.width,h=cv.height;
  const dark=document.documentElement.classList.contains('dark-mode');
  cancelAnimationFrame(window._animF);
  let covers=[null,null,null], showResult=false;
  const coverOpts=['tip','base',null];
  const coverLabels=['تغطية القمة','تغطية القاعدة','بدون غطاء'];

  function renderCtrl(){
    _ctrlPanel(`
      <div style="padding:20px 16px;font-family:Tajawal,sans-serif;direction:rtl;">
        <div style="font-size:15px;font-weight:800;color:${dark?'#fff':'#2C3A4A'};margin-bottom:14px;border-bottom:2px solid ${dark?'rgba(255,255,255,0.1)':'#eee'};padding-bottom:10px;">🌿 حدّد منطقة الاستشعار</div>
        ${[0,1,2].map(pi=>`
          <div style="margin-bottom:12px;background:${dark?'rgba(255,255,255,0.03)':'#F9F6F2'};border-radius:10px;padding:10px;">
            <div style="font-size:13px;font-weight:700;color:${dark?'#eee':'#2C3A4A'};margin-bottom:7px;">الأصيص ${pi+1}</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${coverLabels.map((lb,ci)=>`<button onclick="window._n4aCover(${pi},${ci})" style="padding:7px 10px;border-radius:8px;border:2px solid ${covers[pi]===coverOpts[ci]?'#6B4E9A':'#ddd'};background:${covers[pi]===coverOpts[ci]?'#6B4E9A':(dark?'rgba(255,255,255,0.04)':'white')};color:${covers[pi]===coverOpts[ci]?'white':(dark?'#ccc':'#555')};font-family:Tajawal,sans-serif;font-size:11px;font-weight:700;cursor:pointer;">${lb}</button>`).join('')}
            </div>
          </div>`).join('')}
        <button onclick="window._n4aRun()" style="width:100%;padding:11px;border-radius:9px;border:none;background:#6B4E9A;color:white;font-family:Tajawal,sans-serif;font-size:14px;font-weight:700;cursor:pointer;margin-bottom:8px;">▶ أظهري النتائج بعد يومين</button>
        <button onclick="window._n4aReset()" style="width:100%;padding:9px;border-radius:9px;border:1.5px solid #ddd;background:${dark?'rgba(255,255,255,0.04)':'white'};color:${dark?'#ccc':'#666'};font-family:Tajawal,sans-serif;font-size:13px;font-weight:600;cursor:pointer;margin-bottom:10px;">↺ إعادة</button>
        <div id="n4aFb" style="font-size:12px;color:${dark?'#bbb':'#546E7A'};line-height:1.8;background:${dark?'rgba(107,78,154,0.1)':'rgba(107,78,154,0.06)'};border-radius:9px;padding:10px;border:1px solid ${dark?'rgba(107,78,154,0.2)':'rgba(107,78,154,0.2)'};">
          اختر إعداداً مختلفاً لكل أصيص ثم شاهد النتيجة
        </div>
      </div>`);
  }

  window._n4aCover=function(pi,ci){ covers[pi]=coverOpts[ci]; showResult=false; renderCtrl(); draw(); };
  window._n4aRun=function(){ showResult=true; draw();
    const hasTipCover=covers.some(c=>c==='tip');
    const el=document.getElementById('n4aFb');
    if(el) el.innerHTML=hasTipCover
      ?'💡 <strong>ملاحظة مهمة!</strong> عندما تُغطى القمة لا تنحني الساق رغم وجود الضوء — هذا يُثبت أن <strong>القمة هي الجزء الحساس للضوء</strong> وليس الساق!'
      :'🌿 جرّب تغطية القمة في أحد الأصيصات لترى الفرق المهم!';
  };
  window._n4aReset=function(){ covers=[null,null,null]; showResult=false; renderCtrl(); draw(); };

  function draw(){
    c.clearRect(0,0,w,h);
    const bg=dark?'#1E2D3A':'#F0F4FF';
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    c.fillStyle=dark?'#CE93D8':'#6B4E9A';
    c.font=`bold ${Math.round(h*0.042)}px Tajawal`;
    c.textAlign='center';
    c.fillText('نشاط ١٠-٤: منطقة الحساسية الضوئية في الساق',w/2,h*0.07);

    const pots=[
      {cx:w*0.2, label:'الأصيص ١'},
      {cx:w*0.5, label:'الأصيص ٢'},
      {cx:w*0.8, label:'الأصيص ٣'},
    ];

    pots.forEach((p,pi)=>{
      const potBaseY=h*0.65;
      // Light source
      _drawSun10(c,p.cx+w*0.14,potBaseY-h*0.16,h*0.025,'left',h);

      const cover=covers[pi];
      const tipY=potBaseY-h*0.35;
      const baseY=potBaseY-h*0.18;

      // result bend
      const bendX=showResult&&cover!=='tip'?w*0.06:0;

      // stem
      c.strokeStyle=dark?'#388E3C':'#2E7D32'; c.lineWidth=7; c.lineCap='round';
      const endX=p.cx+bendX, endY=tipY;
      c.beginPath(); c.moveTo(p.cx,potBaseY);
      c.bezierCurveTo(p.cx+bendX*0.3,potBaseY-h*0.1, endX,endY+h*0.1, endX,endY); c.stroke();

      // tip
      c.fillStyle='#2E7D32'; c.beginPath(); c.ellipse(endX,endY-h*0.03,h*0.036,h*0.026,0,0,Math.PI*2); c.fill();
      c.fillStyle='#4CAF50'; c.beginPath(); c.ellipse(endX,endY-h*0.03,h*0.028,h*0.018,0,0,Math.PI*2); c.fill();

      // Cover overlay
      if(cover==='tip'){
        c.fillStyle='rgba(144,164,174,0.88)';
        c.beginPath(); c.roundRect(endX-w*0.045,endY-h*0.065,w*0.09,h*0.055,5); c.fill();
        c.fillStyle='white'; c.font=`bold ${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
        c.fillText('مغطاة',endX,endY-h*0.028);
      } else if(cover==='base'){
        c.fillStyle='rgba(144,164,174,0.88)';
        c.beginPath(); c.roundRect(p.cx-w*0.045,baseY-h*0.03,w*0.09,h*0.055,5); c.fill();
        c.fillStyle='white'; c.font=`bold ${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
        c.fillText('مغطاة',p.cx,baseY+h*0.01);
      }

      // pot
      _drawPot10(c,p.cx,potBaseY,w,h,dark);

      const potH=h*0.18; // approx pot height
      c.fillStyle=dark?'#eee':'#2C3A4A';
      c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
      c.fillText(p.label,p.cx,potBaseY+potH+h*0.04);

      const covLbl=['القمة مغطاة','القاعدة مغطاة','بدون غطاء'];
      const covIdx=cover==='tip'?0:cover==='base'?1:2;
      c.fillStyle=cover==='tip'?'#78909C':cover==='base'?'#1A8FA8':'#27AE60';
      c.font=`${Math.round(h*0.022)}px Tajawal`;
      c.fillText(covLbl[covIdx],p.cx,potBaseY+potH+h*0.074);

      if(showResult){
        const bent=cover!=='tip';
        c.fillStyle=bent?'#27AE60':'#C0392B';
        c.font=`bold ${Math.round(h*0.025)}px Tajawal`; c.textAlign='center';
        c.fillText(bent?'انحنت ✓':'لم تنحنِ ✗',p.cx,potBaseY+potH+h*0.112);
      }
    });
  }
  renderCtrl(); draw();
}

// ══════════════════════════════════════════════════
// نشاط ١٠-٤ب — مقارنة النتائج
// ══════════════════════════════════════════════════
function simG9Bio10N4b(){
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const w=cv.width,h=cv.height;
  const dark=document.documentElement.classList.contains('dark-mode');
  cancelAnimationFrame(window._animF);

  _ctrlPanel(`
    <div style="padding:20px 16px;font-family:Tajawal,sans-serif;direction:rtl;">
      <div style="font-size:15px;font-weight:800;color:${dark?'#fff':'#2C3A4A'};margin-bottom:14px;border-bottom:2px solid ${dark?'rgba(255,255,255,0.1)':'#eee'};padding-bottom:10px;">📊 قراءة النتائج</div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <div style="background:${dark?'rgba(192,57,43,0.1)':'rgba(192,57,43,0.06)'};border-radius:8px;padding:10px;border-right:3px solid #C0392B;">
          <div style="font-size:12px;font-weight:700;color:#C0392B;margin-bottom:4px;">القمة مغطاة ✗</div>
          <div style="font-size:12px;color:${dark?'#aaa':'#546E7A'};line-height:1.6;">الساق لا تنحني — القمة لا تستشعر الضوء → لا أوكسين → لا انحناء</div>
        </div>
        <div style="background:${dark?'rgba(39,174,96,0.1)':'rgba(39,174,96,0.06)'};border-radius:8px;padding:10px;border-right:3px solid #27AE60;">
          <div style="font-size:12px;font-weight:700;color:#27AE60;margin-bottom:4px;">القاعدة مغطاة ✓</div>
          <div style="font-size:12px;color:${dark?'#aaa':'#546E7A'};line-height:1.6;">الساق تنحني — القمة مكشوفة تستشعر الضوء وتُنتج الأوكسين</div>
        </div>
        <div style="background:${dark?'rgba(39,174,96,0.1)':'rgba(39,174,96,0.06)'};border-radius:8px;padding:10px;border-right:3px solid #27AE60;">
          <div style="font-size:12px;font-weight:700;color:#27AE60;margin-bottom:4px;">بدون غطاء ✓</div>
          <div style="font-size:12px;color:${dark?'#aaa':'#546E7A'};line-height:1.6;">الساق تنحني بشكل طبيعي — القمة تستشعر وتُنتج الأوكسين بشكل طبيعي</div>
        </div>
      </div>
      <div style="margin-top:12px;background:${dark?'rgba(107,78,154,0.1)':'rgba(107,78,154,0.07)'};border-radius:8px;padding:10px;border:1px solid ${dark?'rgba(107,78,154,0.25)':'rgba(107,78,154,0.2)'};">
        <div style="font-size:12px;font-weight:700;color:${dark?'#CE93D8':'#6B4E9A'};margin-bottom:4px;">🔑 الاستنتاج</div>
        <div style="font-size:12px;color:${dark?'#ccc':'#37474F'};line-height:1.7;"><strong>القمة النامية</strong> هي المنطقة الحساسة للضوء في الساق — تستشعر الضوء وتُنتج الأوكسين الذي ينتقل للأسفل</div>
      </div>
    </div>`);

  const bg=dark?'#1E2D3A':'#FAFAF8';
  c.fillStyle=bg; c.fillRect(0,0,w,h);

  c.fillStyle=dark?'#CE93D8':'#6B4E9A';
  c.font=`bold ${Math.round(h*0.042)}px Tajawal`;
  c.textAlign='center';
  c.fillText('مقارنة نتائج تجربة منطقة الحساسية',w/2,h*0.07);

  // 3 result columns
  const results=[
    {cx:w*0.2, label:'القمة مغطاة', result:'لم تنحنِ ✗', color:'#C0392B', bend:0, cover:'tip'},
    {cx:w*0.5, label:'القاعدة مغطاة', result:'انحنت نحو الضوء ✓', color:'#27AE60', bend:w*0.06, cover:'base'},
    {cx:w*0.8, label:'بدون غطاء', result:'انحنت نحو الضوء ✓', color:'#27AE60', bend:w*0.06, cover:null},
  ];

  results.forEach(p=>{
    const potBaseY=h*0.63;
    _drawSun10(c,p.cx+w*0.13,potBaseY-h*0.13,h*0.025,'left',h);

    const endX=p.cx+p.bend, endY=potBaseY-h*0.28;
    c.strokeStyle=dark?'#388E3C':'#2E7D32'; c.lineWidth=7; c.lineCap='round';
    c.beginPath(); c.moveTo(p.cx,potBaseY);
    c.bezierCurveTo(p.cx+p.bend*0.3,potBaseY-h*0.1, endX,endY+h*0.1, endX,endY); c.stroke();

    // tip
    if(p.cover!=='tip'){
      c.fillStyle='#2E7D32'; c.beginPath(); c.ellipse(endX,endY-h*0.03,h*0.036,h*0.026,0,0,Math.PI*2); c.fill();
      c.fillStyle='#4CAF50'; c.beginPath(); c.ellipse(endX,endY-h*0.03,h*0.028,h*0.018,0,0,Math.PI*2); c.fill();
      if(p.bend>0){
        c.fillStyle=dark?'#81C784':'#66BB6A';
        c.beginPath(); c.ellipse(endX-h*0.05,endY,h*0.048,h*0.02,-0.5,0,Math.PI*2); c.fill();
        c.beginPath(); c.ellipse(endX+h*0.05,endY,h*0.048,h*0.02,0.5,0,Math.PI*2); c.fill();
      }
    } else {
      // grey cap
      c.fillStyle='rgba(120,144,156,0.85)';
      c.beginPath(); c.roundRect(endX-w*0.045,endY-h*0.065,w*0.09,h*0.06,5); c.fill();
      c.fillStyle='white'; c.font=`bold ${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
      c.fillText('مغطاة',endX,endY-h*0.025);
    }
    if(p.cover==='base'){
      c.fillStyle='rgba(120,144,156,0.75)';
      c.beginPath(); c.roundRect(p.cx-w*0.045,potBaseY-h*0.22,w*0.09,h*0.05,5); c.fill();
      c.fillStyle='white'; c.font=`${Math.round(h*0.02)}px Tajawal`; c.textAlign='center';
      c.fillText('مغطاة',p.cx,potBaseY-h*0.19);
    }

    _drawPot10(c,p.cx,potBaseY,w,h,dark);

    const ph4b=h*0.18;
    c.fillStyle=dark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)';
    c.beginPath(); c.roundRect(p.cx-w*0.1,potBaseY+ph4b+h*0.01,w*0.2,h*0.058,5); c.fill();
    c.fillStyle=dark?'#eee':'#2C3A4A'; c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText(p.label,p.cx,potBaseY+ph4b+h*0.047);
    c.fillStyle=p.color+'22';
    c.beginPath(); c.roundRect(p.cx-w*0.1,potBaseY+ph4b+h*0.075,w*0.2,h*0.055,5); c.fill();
    c.fillStyle=p.color; c.font=`bold ${Math.round(h*0.025)}px Tajawal`; c.textAlign='center';
    c.fillText(p.result,p.cx,potBaseY+ph4b+h*0.112);
  });
}

// ══════════════════════════════════════════════════
// نشاط ١٠-٤ج — ملخص الوحدة العاشرة
// ══════════════════════════════════════════════════
function simG9Bio10N4c(){
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const w=cv.width,h=cv.height;
  const dark=document.documentElement.classList.contains('dark-mode');
  cancelAnimationFrame(window._animF);

  _ctrlPanel(`
    <div style="padding:20px 16px;font-family:Tajawal,sans-serif;direction:rtl;">
      <div style="font-size:15px;font-weight:800;color:${dark?'#fff':'#2C3A4A'};margin-bottom:14px;border-bottom:2px solid ${dark?'rgba(255,255,255,0.1)':'#eee'};padding-bottom:10px;">📚 ملخص الوحدة العاشرة</div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${[
          ['#27AE60','المُنبّه Stimulus','تغيّر في البيئة يستشعره الكائن — كالضوء والجاذبية'],
          ['#1A8FA8','الانتحاء Tropism','استجابة نمو النبات نحو المُنبّه (موجب) أو بعيداً (سالب)'],
          ['#D4901A','Phototropism','السيقان موجبة (نحو الضوء) · الجذور سالبة'],
          ['#6B4E9A','Gravitropism','الجذور موجبة (للأسفل) · السيقان سالبة (للأعلى)'],
          ['#E65100','الأوكسين IAA','هرمون يُنتج في قمة الساق — يحفّز استطالة خلايا الجانب الظليل'],
        ].map(([col,term,def])=>`
          <div style="background:${dark?'rgba(255,255,255,0.04)':'white'};border-radius:9px;padding:10px 12px;border-right:4px solid ${col};box-shadow:0 1px 4px rgba(0,0,0,0.05);">
            <div style="font-size:13px;font-weight:800;color:${col};margin-bottom:3px;">${term}</div>
            <div style="font-size:12px;color:${dark?'#bbb':'#546E7A'};line-height:1.6;">${def}</div>
          </div>`).join('')}
      </div>
    </div>`);

  const bg=dark?'#1E2D3A':'#FAFAF8';
  c.fillStyle=bg; c.fillRect(0,0,w,h);

  c.fillStyle=dark?'#CE93D8':'#6B4E9A';
  c.font=`bold ${Math.round(h*0.042)}px Tajawal`;
  c.textAlign='center';
  c.fillText('📚 ملخص الوحدة العاشرة — التحكم والتنظيم في النبات',w/2,h*0.08);

  const concepts=[
    {term:'المُنبّه Stimulus',def:'تغيّر في البيئة يستشعره الكائن الحي (الضوء، الجاذبية، الحرارة)',color:'#27AE60'},
    {term:'الانتحاء Tropism',def:'استجابة نمو النبات أو جزء منه باتجاه المُنبّه أو بعيداً عنه',color:'#1A8FA8'},
    {term:'Phototropism الانتحاء الضوئي',def:'السيقان: موجبة (نحو الضوء) · الجذور: سالبة (بعيداً عن الضوء)',color:'#D4901A'},
    {term:'Gravitropism الانتحاء الأرضي',def:'الجذور: موجبة (نحو الأسفل) · السيقان: سالبة (نحو الأعلى)',color:'#6B4E9A'},
    {term:'الأوكسين Auxin (IAA)',def:'هرمون نباتي يُنتجه قمة الساق — يُحفّز استطالة الخلايا في الجانب الظليل',color:'#E65100'},
  ];

  concepts.forEach((con,i)=>{
    const y=h*0.15+i*h*0.15;
    // card bg
    c.fillStyle=dark?'rgba(255,255,255,0.04)':'white';
    c.beginPath(); c.roundRect(w*0.04,y,w*0.92,h*0.13,8); c.fill();
    c.strokeStyle=con.color+'55'; c.lineWidth=1.5;
    c.strokeRect(w*0.04,y,w*0.92,h*0.13);
    // color bar
    c.fillStyle=con.color;
    c.beginPath(); c.roundRect(w*0.04,y,w*0.007,h*0.13,4); c.fill();
    // term
    c.fillStyle=con.color; c.font=`bold ${Math.round(h*0.03)}px Tajawal`;
    c.textAlign='right'; c.fillText(con.term,w*0.94,y+h*0.048);
    // def
    c.fillStyle=dark?'#bbb':'#546E7A'; c.font=`${Math.round(h*0.026)}px Tajawal`;
    c.fillText(con.def,w*0.94,y+h*0.097);
  });
}




// ══════════════════════════════════════════════════════════
// 🖊 السبورة التفاعلية — Interactive Whiteboard
// يدعم الماوس + اللمس (iPad / Tablet)
// ══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const WB = {
    isOpen:    false,
    isDrawing: false,
    isEraser:  false,
    color:     '#1A8FA8',
    lineWidth: 5,
    canvas:    null,
    ctx:       null,
  };

  let overlay, canvas, ctx, eraserBtn, sizeSlider, bwBtn, initialized = false;

  function initCanvas() {
    WB.canvas = canvas = document.getElementById('wb-canvas');
    WB.ctx    = ctx    = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', () => { if (WB.isOpen) resizeCanvas(); });
  }

  function resizeCanvas() {
    if (!canvas) return;
    const wrap = document.getElementById('wb-canvas-wrap');
    // حفظ الرسم قبل تغيير الحجم
    let saved = null;
    if (canvas.width > 0 && canvas.height > 0) {
      try { saved = ctx.getImageData(0, 0, canvas.width, canvas.height); } catch(e) {}
    }
    canvas.width  = wrap.clientWidth  || wrap.offsetWidth;
    canvas.height = wrap.clientHeight || wrap.offsetHeight;
    if (saved) { try { ctx.putImageData(saved, 0, 0); } catch(e) {} }
  }

  /* ── منطق الرسم ── */
  function startDraw(x, y) {
    WB.isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(x, y) {
    if (!WB.isDrawing) return;
    ctx.lineWidth   = WB.isEraser ? WB.lineWidth * 5 : WB.lineWidth;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.globalCompositeOperation = WB.isEraser ? 'destination-out' : 'source-over';
    ctx.strokeStyle = WB.isEraser ? 'rgba(0,0,0,1)' : WB.color;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function endDraw() {
    if (!WB.isDrawing) return;
    WB.isDrawing = false;
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
  }

  /* ── تحويل إحداثيات اللمس/الماوس ── */
  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX;
      clientY = e.clientY;
    }
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top)  * scaleY,
    };
  }

  /* ── أحداث الماوس ── */
  function bindMouseEvents() {
    canvas.addEventListener('mousedown',  e => { e.preventDefault(); const p=getPos(e); startDraw(p.x,p.y); });
    canvas.addEventListener('mousemove',  e => { e.preventDefault(); const p=getPos(e); draw(p.x,p.y); });
    canvas.addEventListener('mouseup',    endDraw);
    canvas.addEventListener('mouseleave', endDraw);
  }

  /* ── أحداث اللمس (iPad / Android) ── */
  function bindTouchEvents() {
    canvas.addEventListener('touchstart',  e => { e.preventDefault(); const p=getPos(e); startDraw(p.x,p.y); }, { passive: false });
    canvas.addEventListener('touchmove',   e => { e.preventDefault(); const p=getPos(e); draw(p.x,p.y);      }, { passive: false });
    canvas.addEventListener('touchend',    e => { e.preventDefault(); endDraw(); }, { passive: false });
    canvas.addEventListener('touchcancel', e => { e.preventDefault(); endDraw(); }, { passive: false });
  }

  /* ── أزرار الألوان ── */
  function bindColorBtns() {
    document.querySelectorAll('.wb-color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        WB.color    = btn.dataset.color;
        WB.isEraser = false;
        eraserBtn.classList.remove('wb-active');
        document.querySelectorAll('.wb-color-btn').forEach(b => b.classList.remove('wb-active'));
        btn.classList.add('wb-active');
      });
    });
  }

  /* ── تحديث لون الأسود/الأبيض حسب الوضع ── */
  function updateBwColor() {
    if (!bwBtn) return;
    const isDark = document.documentElement.classList.contains('dark-mode');
    const c = isDark ? '#E8F2FA' : '#1E2D3D';
    bwBtn.dataset.color = c;
    bwBtn.style.background = c;
    if (bwBtn.classList.contains('wb-active')) WB.color = c;
  }

  /* ── شريط الحجم ── */
  function bindSizeSlider() {
    sizeSlider = document.getElementById('wb-size-slider');
    sizeSlider.addEventListener('input', () => { WB.lineWidth = parseInt(sizeSlider.value); });
  }

  /* ── الممحاة ── */
  function bindEraserBtn() {
    eraserBtn = document.getElementById('wb-eraser-btn');
    eraserBtn.addEventListener('click', () => {
      WB.isEraser = !WB.isEraser;
      eraserBtn.classList.toggle('wb-active', WB.isEraser);
      if (!WB.isEraser) {
        document.querySelectorAll('.wb-color-btn').forEach(b => {
          if (b.dataset.color === WB.color) b.classList.add('wb-active');
        });
      } else {
        document.querySelectorAll('.wb-color-btn').forEach(b => b.classList.remove('wb-active'));
      }
    });
  }

  /* ── مسح الكل ── */
  function bindClearBtn() {
    document.getElementById('wb-clear-btn').addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
  }

  /* ── فتح السبورة ── */
  window.wbOpen = function () {
    if (!initialized) { initAll(); initialized = true; }
    overlay.classList.add('wb-open');
    WB.isOpen = true;
    // تأخير صغير لضمان أن العنصر مرئي قبل حساب الأبعاد
    setTimeout(resizeCanvas, 30);
    updateBwColor();
  };

  /* ── إغلاق السبورة ── */
  window.wbClose = function () {
    overlay.classList.remove('wb-open');
    WB.isOpen = false;
  };

  /* ── الإغلاق ── */
  function bindCloseBtn() {
    document.getElementById('wb-close-btn').addEventListener('click', wbClose);
    overlay.addEventListener('click', e => { if (e.target === overlay) wbClose(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && WB.isOpen) wbClose(); });
  }

  /* ── التهيئة الكاملة ── */
  function initAll() {
    overlay   = document.getElementById('wb-overlay');
    bwBtn     = document.getElementById('wb-bw-btn');
    initCanvas();
    bindMouseEvents();
    bindTouchEvents();
    bindColorBtns();
    bindSizeSlider();
    bindEraserBtn();
    bindClearBtn();
    bindCloseBtn();
    // مراقبة تغيير الوضع الداكن
    new MutationObserver(updateBwColor).observe(
      document.documentElement,
      { attributes: true, attributeFilter: ['class'] }
    );
  }

})();
// ══════════════════════════════════════════════════════════
// نهاية كود السبورة التفاعلية
// ══════════════════════════════════════════════════════════
